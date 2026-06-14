const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const { GameEngine } = require('./gameEngine');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const rooms = new Map();
const clients = new Map(); // ws -> { playerId, roomId }
const TURN_TIME = 90;

// ===== HELPERS =====
function genRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id; do { id = ''; for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)]; } while (rooms.has(id));
  return id;
}
function genPlayerId() { return 'p_' + Math.random().toString(36).slice(2, 10); }
function send(ws, data) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(data)); }
function broadcast(room, data, exclude) { room.players.forEach(p => { if (p.ws && p.ws !== exclude) send(p.ws, data); }); }
function broadcastAll(room, data) { room.players.forEach(p => send(p.ws, data)); }

// ===== ROOM MANAGEMENT =====
function createRoom(hostWs, nickname, settings) {
  const roomId = genRoomId();
  const playerId = genPlayerId();
  const room = {
    id: roomId, hostId: playerId, settings: settings || { money: 15000, pool: false, turnTime: TURN_TIME },
    players: [{ id: playerId, nickname, color: 0, ws: hostWs, ready: false, online: true }],
    engine: null, started: false, turnTimer: null, createdAt: Date.now()
  };
  rooms.set(roomId, room);
  clients.set(hostWs, { playerId, roomId });
  send(hostWs, { type: 'roomCreated', roomId, playerId, players: getPlayersInfo(room), settings: room.settings });
  return room;
}

function joinRoom(hostWs, roomId, nickname) {
  const room = rooms.get(roomId);
  if (!room) return send(hostWs, { type: 'error', message: '房间不存在' });
  if (room.started) return send(hostWs, { type: 'error', message: '游戏已开始' });
  if (room.players.length >= 4) return send(hostWs, { type: 'error', message: '房间已满' });
  const playerId = genPlayerId();
  const color = [0,1,2,3].find(c => !room.players.some(p => p.color === c));
  room.players.push({ id: playerId, nickname, color, ws: hostWs, ready: false, online: true });
  clients.set(hostWs, { playerId, roomId });
  send(hostWs, { type: 'roomJoined', roomId, playerId, players: getPlayersInfo(room), settings: room.settings, isHost: false });
  broadcast(room, { type: 'roomUpdate', players: getPlayersInfo(room) }, hostWs);
}

function reconnect(ws, roomId, playerId) {
  const room = rooms.get(roomId);
  if (!room) return send(ws, { type: 'error', message: '房间不存在' });
  const player = room.players.find(p => p.id === playerId);
  if (!player) return send(ws, { type: 'error', message: '玩家不存在' });
  player.ws = ws; player.online = true;
  clients.set(ws, { playerId, roomId });
  send(ws, { type: 'reconnected', roomId, playerId, players: getPlayersInfo(room), settings: room.settings, isHost: room.hostId === playerId });
  if (room.engine) send(ws, { type: 'gameState', state: room.engine.getState(), nicknames: room.players.map(p => p.nickname), phase: room.engine.phase });
  broadcast(room, { type: 'playerReconnected', playerId, nickname: player.nickname }, ws);
}

function getPlayersInfo(room) {
  return room.players.map(p => ({ id: p.id, nickname: p.nickname, color: p.color, ready: p.ready, online: p.online }));
}

// ===== GAME FLOW =====
function startGame(room) {
  room.started = true;
  room.engine = new GameEngine({
    numPlayers: room.players.length,
    startMoney: room.settings.money,
    usePool: room.settings.pool,
    nicknames: room.players.map(p => p.nickname)
  });
  broadcastAll(room, { type: 'gameStarted', state: room.engine.getState(), nicknames: room.players.map(p => p.nickname) });
  startTurnTimer(room);
}

function processAction(room, playerId, action, data) {
  if (!room.engine) return;
  const pid = room.players.findIndex(p => p.id === playerId);
  if (pid !== room.engine.currentPlayer && !['bid','skipBid','respondTrade'].includes(action)) return;

  clearTurnTimer(room);
  const result = room.engine.process(action, data);
  if (!result.success) {
    const player = room.players.find(p => p.id === playerId);
    if (player) send(player.ws, { type: 'error', message: result.error || 'Invalid action' });
    startTurnTimer(room);
    return;
  }

  broadcastAll(room, { type: 'actionResult', action, data, state: result.state, animations: result.animations, events: result.events, nicknames: room.players.map(p => p.nickname) });

  // If game continues, restart timer
  if (result.state.phase !== 'gameOver') {
    setTimeout(() => startTurnTimer(room), 500);
  }
}

// ===== TURN TIMER =====
function startTurnTimer(room) {
  clearTurnTimer(room);
  if (!room.engine || room.engine.phase === 'gameOver') return;
  const time = room.settings.turnTime || TURN_TIME;
  room._turnTimeLeft = time;
  room.turnTimer = setInterval(() => {
    room._turnTimeLeft--;
    broadcastAll(room, { type: 'turnTimer', remaining: room._turnTimeLeft });
    if (room._turnTimeLeft <= 0) {
      clearTurnTimer(room);
      // Auto play
      if (room.engine && room.engine.phase !== 'gameOver') {
        const result = room.engine.autoPlay();
        if (result.success) {
          broadcastAll(room, { type: 'actionResult', action: 'autoPlay', state: result.state, animations: result.animations, events: result.events, nicknames: room.players.map(p => p.nickname) });
          if (result.state.phase !== 'gameOver') setTimeout(() => startTurnTimer(room), 500);
        }
      }
    }
  }, 1000);
}

function clearTurnTimer(room) {
  if (room.turnTimer) { clearInterval(room.turnTimer); room.turnTimer = null; }
}

// ===== HEARTBEAT =====
setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws._alive === false) return ws.terminate();
    ws._alive = false; ws.ping();
  });
}, 30000);

// ===== WEBSOCKET HANDLER =====
wss.on('connection', (ws) => {
  ws._alive = true;
  ws.on('pong', () => { ws._alive = true; });

  ws.on('message', (raw) => {
    let msg; try { msg = JSON.parse(raw); } catch { return; }
    const client = clients.get(ws);

    switch (msg.type) {
      case 'createRoom': createRoom(ws, msg.nickname, msg.settings); break;
      case 'joinRoom': joinRoom(ws, msg.roomId, msg.nickname); break;
      case 'reconnect': reconnect(ws, msg.roomId, msg.playerId); break;
      case 'ready': {
        if (!client) return;
        const room = rooms.get(client.roomId); if (!room) return;
        const player = room.players.find(p => p.id === client.playerId);
        if (player) { player.ready = !player.ready; broadcastAll(room, { type: 'roomUpdate', players: getPlayersInfo(room) }); }
        break;
      }
      case 'updateSettings': {
        if (!client) return;
        const room = rooms.get(client.roomId); if (!room || room.hostId !== client.playerId) return;
        room.settings = { ...room.settings, ...msg.settings };
        broadcastAll(room, { type: 'roomUpdate', players: getPlayersInfo(room), settings: room.settings });
        break;
      }
      case 'startGame': {
        if (!client) return;
        const room = rooms.get(client.roomId); if (!room || room.hostId !== client.playerId) return;
        if (room.players.length < 2) return send(ws, { type: 'error', message: '至少需要2名玩家' });
        if (!room.players.every(p => p.ready || p.id === room.hostId)) return send(ws, { type: 'error', message: '等待所有玩家准备' });
        room.players.forEach(p => p.ready = true);
        startGame(room);
        break;
      }
      // Game actions
      case 'rollDice': case 'buyProperty': case 'passProperty': case 'bid': case 'skipBid':
      case 'endTurn': case 'buildHouse': case 'sellHouse': case 'mortgage': case 'unmortgage':
      case 'useOJC': case 'payBail': case 'proposeTrade': case 'respondTrade':
        if (!client) return;
        const room = rooms.get(client.roomId);
        if (room) processAction(room, client.playerId, msg.type, msg);
        break;
      // Chat & Emoji
      case 'chat': {
        if (!client) return;
        const room = rooms.get(client.roomId); if (!room) return;
        const player = room.players.find(p => p.id === client.playerId);
        broadcastAll(room, { type: 'chat', playerId: client.playerId, nickname: player ? player.nickname : '?', message: (msg.message || '').slice(0, 200) });
        break;
      }
      case 'emoji': {
        if (!client) return;
        const room = rooms.get(client.roomId); if (!room) return;
        const player = room.players.find(p => p.id === client.playerId);
        broadcastAll(room, { type: 'emoji', playerId: client.playerId, nickname: player ? player.nickname : '?', emoji: msg.emoji });
        break;
      }
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);
    clients.delete(ws);
    if (!client) return;
    const room = rooms.get(client.roomId);
    if (!room) return;
    const player = room.players.find(p => p.id === client.playerId);
    if (player) {
      player.online = false;
      broadcast(room, { type: 'playerDisconnected', playerId: client.playerId, nickname: player.nickname });
    }
    // Clean up empty rooms after 5 min
    setTimeout(() => {
      if (room.players.every(p => !p.online)) { clearTurnTimer(room); rooms.delete(room.id); }
    }, 300000);
  });
});

server.listen(PORT, () => console.log(`Monopoly server running on port ${PORT}`));
