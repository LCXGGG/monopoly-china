// ============================================================
//  大富翁 · 中国之旅 — 服务端游戏逻辑引擎
// ============================================================

const GO_SALARY = 2000;
const JAIL_BAIL = 500;
const RAILWAY_RENT = [250, 500, 1000, 2000];

const SPACES_DEF = [
  {id:0,name:'出发',type:'go'},
  {id:1,name:'昆明',type:'property',color:'brown',price:600,rent:[50,250,700,1300,1700,2000],bc:500},
  {id:2,name:'命运',type:'fate'},
  {id:3,name:'贵阳',type:'property',color:'brown',price:600,rent:[50,250,700,1300,1700,2000],bc:500},
  {id:4,name:'所得税',type:'tax',amount:2000},
  {id:5,name:'北京站',type:'railway',price:1500},
  {id:6,name:'南宁',type:'property',color:'cyan',price:800,rent:[60,300,900,1600,2000,2400],bc:500},
  {id:7,name:'机会',type:'chance'},
  {id:8,name:'海口',type:'property',color:'cyan',price:800,rent:[60,300,900,1600,2000,2400],bc:500},
  {id:9,name:'拉萨',type:'property',color:'purple',price:900,rent:[70,350,1000,1800,2200,2600],bc:500},
  {id:10,name:'监狱',type:'jail'},
  {id:11,name:'长沙',type:'property',color:'pink',price:1000,rent:[80,400,1100,2000,2400,2800],bc:500},
  {id:12,name:'国家电网',type:'utility',price:1200},
  {id:13,name:'南昌',type:'property',color:'purple',price:900,rent:[70,350,1000,1800,2200,2600],bc:500},
  {id:14,name:'福州',type:'property',color:'pink',price:1000,rent:[80,400,1100,2000,2400,2800],bc:500},
  {id:15,name:'上海站',type:'railway',price:1500},
  {id:16,name:'合肥',type:'property',color:'orange',price:1200,rent:[100,450,1200,2200,2600,3000],bc:500},
  {id:17,name:'命运',type:'fate'},
  {id:18,name:'武汉',type:'property',color:'orange',price:1200,rent:[100,450,1200,2200,2600,3000],bc:500},
  {id:19,name:'郑州',type:'property',color:'red',price:1400,rent:[100,500,1400,3000,3800,4500],bc:1000},
  {id:20,name:'免费停车',type:'freeParking'},
  {id:21,name:'西安',type:'property',color:'red',price:1400,rent:[100,500,1400,3000,3800,4500],bc:1000},
  {id:22,name:'机会',type:'chance'},
  {id:23,name:'成都',type:'property',color:'red',price:1400,rent:[100,500,1400,3000,3800,4500],bc:1000},
  {id:24,name:'重庆',type:'property',color:'green',price:1800,rent:[140,700,1800,4000,4800,5500],bc:1000},
  {id:25,name:'广州站',type:'railway',price:1500},
  {id:26,name:'杭州',type:'property',color:'yellow',price:1600,rent:[120,600,1600,3600,4200,5000],bc:1000},
  {id:27,name:'南京',type:'property',color:'yellow',price:1600,rent:[120,600,1600,3600,4200,5000],bc:1000},
  {id:28,name:'中国水务',type:'utility',price:1200},
  {id:29,name:'天津',type:'property',color:'green',price:1800,rent:[140,700,1800,4000,4800,5500],bc:1000},
  {id:30,name:'入狱',type:'goToJail'},
  {id:31,name:'广州',type:'property',color:'green',price:1800,rent:[140,700,1800,4000,4800,5500],bc:1000},
  {id:32,name:'深圳',type:'property',color:'teal',price:2200,rent:[160,800,2000,5000,6000,7000],bc:1000},
  {id:33,name:'命运',type:'fate'},
  {id:34,name:'上海',type:'property',color:'blue',price:2400,rent:[180,900,2200,5500,6500,7500],bc:1000},
  {id:35,name:'成都站',type:'railway',price:1500},
  {id:36,name:'机会',type:'chance'},
  {id:37,name:'北京',type:'property',color:'blue',price:2600,rent:[200,1000,2400,6000,7000,8000],bc:1000},
  {id:38,name:'奢侈税',type:'tax',amount:1000},
  {id:39,name:'香港',type:'property',color:'teal',price:2200,rent:[160,800,2000,5000,6000,7000],bc:1000}
];

const FATE_DEF = [
  {t:'银行失误，获得 ¥500',tp:'money',a:500},
  {t:'医疗费用，支付 ¥100',tp:'money',a:-100},
  {t:'保险到期，收取 ¥1,000',tp:'money',a:1000},
  {t:'学费缴纳，支付 ¥500',tp:'money',a:-500},
  {t:'退税 ¥200',tp:'money',a:200},
  {t:'门诊费 ¥150',tp:'money',a:-150},
  {t:'🎉 中彩票 ¥1,500！',tp:'money',a:1500},
  {t:'交通罚款 ¥200',tp:'money',a:-200},
  {t:'前进到起点 ¥2,000',tp:'mv',a:0},
  {t:'🚔 直接入狱！',tp:'jail'},
  {t:'🎫 出狱许可证！',tp:'ojc'},
  {t:'维修费：每栋¥25 / 旅馆¥100',tp:'repair',hc:25,ec:100},
  {t:'🎂 生日！每人给你 ¥100',tp:'collect',a:100},
  {t:'社区主席，支付每人 ¥50',tp:'payall',a:50}
];

const CHANCE_DEF = [
  {t:'前进到起点 ¥2,000',tp:'mv',a:0},
  {t:'前进到上海',tp:'mv',a:34},
  {t:'前进到北京',tp:'mv',a:37},
  {t:'🚄 前进到最近火车站',tp:'mvr',a:'railway'},
  {t:'银行红利 ¥500',tp:'money',a:500},
  {t:'🚔 直接入狱！',tp:'jail'},
  {t:'后退 3 步',tp:'back',a:3},
  {t:'贷款到期，收取 ¥1,500',tp:'money',a:1500},
  {t:'董事长！每人付你 ¥50',tp:'collect',a:50},
  {t:'🎫 出狱许可证！',tp:'ojc'},
  {t:'前进到广州',tp:'mv',a:31},
  {t:'🚄 最近火车站，双倍租金',tp:'mvr2',a:'railway'}
];

class GameEngine {
  constructor(config) {
    this.numPlayers = config.numPlayers || 4;
    this.startMoney = config.startMoney || 15000;
    this.usePool = config.usePool || false;
    this.nicknames = config.nicknames || [];
    this.reset();
  }

  reset() {
    this.spaces = SPACES_DEF.map(s => ({...s, owner:null, houses:0, mortgaged:false}));
    this.players = [];
    for (let i = 0; i < this.numPlayers; i++) {
      this.players.push({
        money: this.startMoney, position: 0, properties: [],
        inJail: false, jailTurns: 0, ojc: 0, bankrupt: false
      });
    }
    this.currentPlayer = 0;
    this.dice = [0, 0];
    this.doublesCount = 0;
    this.isDoubles = false;
    this.phase = 'waitingRoll';
    this.round = 1;
    this.pool = 0;
    this.winner = -1;
    this.fateIdx = 0; this.chanceIdx = 0;
    this.fateOrder = this._shuf([...Array(FATE_DEF.length).keys()]);
    this.chanceOrder = this._shuf([...Array(CHANCE_DEF.length).keys()]);
    this.auction = null;
    this.pendingTrade = null;
  }

  _shuf(a) { for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
  _cp() { return this.currentPlayer; }
  _p(i) { return this.players[i !== undefined ? i : this.currentPlayer]; }
  _s(i) { return this.spaces[i]; }
  _alive() { return this.players.filter(p => !p.bankrupt); }
  _oa(pid, color) { return this.spaces.filter(s => s.color === color).every(s => s.owner === pid); }
  _ctOwn(pid, type) { return this.spaces.filter(s => s.type === type && s.owner === pid).length; }
  _canBuild(pid) {
    return this.players[pid].properties.some(sid => {
      const s = this.spaces[sid];
      if (!s.color || s.houses >= 5) return false;
      if (!this._oa(pid, s.color)) return false;
      const g = this.spaces.filter(sp => sp.color === s.color);
      return s.houses <= Math.min(...g.map(sp => sp.houses));
    });
  }

  getState() {
    return {
      spaces: this.spaces.map(s => ({owner:s.owner, houses:s.houses, mortgaged:s.mortgaged})),
      players: this.players.map(p => ({
        money:p.money, position:p.position, properties:[...p.properties],
        inJail:p.inJail, jailTurns:p.jailTurns, ojc:p.ojc, bankrupt:p.bankrupt
      })),
      currentPlayer: this.currentPlayer, phase: this.phase, round: this.round,
      pool: this.pool, dice: [...this.dice], doublesCount: this.doublesCount,
      isDoubles: this.isDoubles, winner: this.winner,
      auction: this.auction ? {...this.auction} : null
    };
  }

  calcRent(sid, diceTotal) {
    const sp = this.spaces[sid];
    if (sp.owner === null || sp.owner === undefined || sp.mortgaged) return 0;
    const ow = sp.owner;
    if (sp.type === 'property') return sp.houses === 0 && this._oa(ow, sp.color) ? sp.rent[0] * 2 : sp.rent[sp.houses];
    if (sp.type === 'railway') return RAILWAY_RENT[this._ctOwn(ow, 'railway') - 1];
    if (sp.type === 'utility') return (diceTotal || 7) * (this._ctOwn(ow, 'utility') >= 2 ? 10 : 4);
    return 0;
  }

  // ===== ACTION PROCESSOR =====
  process(action, data) {
    const A = [], E = []; // animations, events
    try {
      switch (action) {
        case 'rollDice': return this._rollDice(A, E);
        case 'buyProperty': return this._buyProp(data.spaceId, A, E);
        case 'passProperty': return this._passProp(A, E);
        case 'bid': return this._bid(data.amount, A, E);
        case 'skipBid': return this._skipBid(A, E);
        case 'endTurn': return this._endTurn(A, E);
        case 'buildHouse': return this._build(data.spaceId, A, E);
        case 'sellHouse': return this._sell(data.spaceId, A, E);
        case 'mortgage': return this._mort(data.spaceId, A, E);
        case 'unmortgage': return this._unmort(data.spaceId, A, E);
        case 'useOJC': return this._useOJC(A, E);
        case 'payBail': return this._payBail(A, E);
        case 'proposeTrade': return this._proposeTrade(data, A, E);
        case 'respondTrade': return this._respondTrade(data.accept, A, E);
        default: return { success: false, error: 'Unknown action' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // ===== ROLL DICE =====
  _rollDice(A, E) {
    const pid = this._cp();
    const p = this._p();
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    this.dice = [d1, d2];
    const total = d1 + d2;
    const isD = d1 === d2;

    A.push({ type: 'diceRoll', dice: [d1, d2] });
    E.push({ type: 'log', text: `${this.nicknames[pid]} 掷出 ${d1}+${d2}=${total}${isD ? ' 【对子】' : ''}` });

    if (this.phase === 'jailRoll') {
      if (isD) {
        p.inJail = false; p.jailTurns = 0; this.doublesCount = 0; this.isDoubles = false;
        E.push({ type: 'log', text: `${this.nicknames[pid]} 对子出狱！`, important: true });
        E.push({ type: 'toast', message: '出狱！', level: 'gain' });
        return this._moveAndLand(pid, total, A, E);
      } else {
        p.jailTurns++;
        if (p.jailTurns >= 3) {
          p.money -= JAIL_BAIL; this._addToPool(JAIL_BAIL);
          p.inJail = false; p.jailTurns = 0;
          E.push({ type: 'log', text: `${this.nicknames[pid]} 强制保释 ¥${JAIL_BAIL}` });
          E.push({ type: 'floatMoney', playerId: pid, amount: -JAIL_BAIL });
          return this._moveAndLand(pid, total, A, E);
        } else {
          E.push({ type: 'log', text: `未出对子 (${p.jailTurns}/3)` });
          this.phase = 'waitingEnd';
          return this._result(A, E);
        }
      }
    }

    if (isD) {
      this.doublesCount++;
      if (this.doublesCount >= 3) {
        E.push({ type: 'log', text: `${this.nicknames[pid]} 三次对子，入狱！`, important: true });
        return this._goJail(pid, A, E);
      }
      this.isDoubles = true;
      E.push({ type: 'toast', message: '对子！额外回合', level: 'gain' });
    } else {
      this.doublesCount = 0; this.isDoubles = false;
    }

    return this._moveAndLand(pid, total, A, E);
  }

  // ===== MOVEMENT =====
  _moveAndLand(pid, steps, A, E) {
    const p = this._p(pid);
    const from = p.position;
    let passedGo = false;
    for (let i = 0; i < steps; i++) {
      const prev = p.position;
      p.position = (p.position + 1) % 40;
      if (p.position < prev) { passedGo = true; }
    }
    if (passedGo) { p.money += GO_SALARY; E.push({ type: 'floatMoney', playerId: pid, amount: GO_SALARY }); E.push({ type: 'log', text: `${this.nicknames[pid]} 经过起点 +¥${GO_SALARY}` }); }
    A.push({ type: 'move', playerId: pid, from, to: p.position, passedGo });
    E.push({ type: 'log', text: `${this.nicknames[pid]} 到达 ${this.spaces[p.position].name}` });
    return this._land(pid, p.position, A, E);
  }

  _moveToAndLand(pid, target, A, E, doubleRent) {
    const p = this._p(pid);
    const from = p.position;
    let passedGo = false;
    let n = 0;
    while (p.position !== target) {
      const prev = p.position;
      p.position = (p.position + 1) % 40;
      if (p.position < prev) { passedGo = true; }
      if (++n > 50) break;
    }
    if (passedGo) { p.money += GO_SALARY; E.push({ type: 'floatMoney', playerId: pid, amount: GO_SALARY }); }
    A.push({ type: 'move', playerId: pid, from, to: p.position, passedGo });

    if (doubleRent) {
      const sp = this.spaces[target];
      if (sp.owner !== null && sp.owner !== pid && !sp.mortgaged) {
        const rent = this.calcRent(target, this.dice[0] + this.dice[1]) * 2;
        if (rent > 0) this._payRent(pid, sp.owner, rent, A, E);
      }
      this.phase = 'waitingEnd';
      return this._result(A, E);
    }
    return this._land(pid, target, A, E);
  }

  _moveBackAndLand(pid, steps, A, E) {
    const p = this._p(pid);
    for (let i = 0; i < steps; i++) p.position = (p.position - 1 + 40) % 40;
    A.push({ type: 'move', playerId: pid, from: (p.position + steps) % 40, to: p.position, passedGo: false });
    return this._land(pid, p.position, A, E);
  }

  // ===== LANDING =====
  _land(pid, sid, A, E) {
    const sp = this.spaces[sid];
    switch (sp.type) {
      case 'go': this.phase = 'waitingEnd'; return this._result(A, E);
      case 'property': case 'railway': case 'utility':
        if (sp.owner === null) {
          this.phase = 'waitingBuyDecision';
          E.push({ type: 'needInput', action: 'buyDecision', spaceId: sid });
          return this._result(A, E);
        } else if (sp.owner === pid) {
          if (sp.color && this._oa(pid, sp.color) && this._canBuild(pid)) {
            E.push({ type: 'log', text: `🎉 可在 ${sp.color.toUpperCase()} 组建房！` });
          }
          this.phase = 'waitingEnd';
          return this._result(A, E);
        } else if (sp.mortgaged) {
          E.push({ type: 'log', text: `${sp.name} 已抵押，免租` });
          this.phase = 'waitingEnd'; return this._result(A, E);
        } else {
          const rent = this.calcRent(sid, this.dice[0] + this.dice[1]);
          if (rent > 0) this._payRent(pid, sp.owner, rent, A, E);
          this.phase = 'waitingEnd';
          return this._result(A, E);
        }
      case 'fate': case 'chance':
        return this._drawAndExecCard(pid, sp.type === 'fate' ? 'fate' : 'chance', A, E);
      case 'tax':
        return this._payTax(pid, sp.amount, A, E);
      case 'goToJail':
        return this._goJail(pid, A, E);
      case 'jail':
        E.push({ type: 'log', text: '探访监狱' });
        this.phase = 'waitingEnd'; return this._result(A, E);
      case 'freeParking':
        if (this.usePool && this.pool > 0) {
          this._p(pid).money += this.pool;
          E.push({ type: 'floatMoney', playerId: pid, amount: this.pool });
          E.push({ type: 'log', text: `${this.nicknames[pid]} 收取奖池 ¥${this.pool}`, important: true });
          this.pool = 0;
        }
        this.phase = 'waitingEnd'; return this._result(A, E);
    }
  }

  // ===== BUY / PASS / AUCTION =====
  _buyProp(sid, A, E) {
    if (this.phase !== 'waitingBuyDecision') return { success: false, error: 'Not buy phase' };
    const pid = this._cp(), p = this._p(), sp = this.spaces[sid];
    if (p.money < sp.price) return { success: false, error: 'Not enough money' };
    p.money -= sp.price; sp.owner = pid; p.properties.push(sid);
    E.push({ type: 'floatMoney', playerId: pid, amount: -sp.price });
    E.push({ type: 'log', text: `${this.nicknames[pid]} 购买 ${sp.name} ¥${sp.price}`, important: true });
    this._checkMono(pid, sp.color, A, E);
    this.phase = 'waitingEnd';
    return this._result(A, E);
  }

  _passProp(A, E) {
    if (this.phase !== 'waitingBuyDecision') return { success: false, error: 'Not buy phase' };
    const sid = this._p().position;
    E.push({ type: 'log', text: `${this.nicknames[this._cp()]} 放弃 ${this.spaces[sid].name}` });
    if (this._alive().length < 2) { this.phase = 'waitingEnd'; return this._result(A, E); }
    // Start auction
    const bidders = [];
    for (let i = 0; i < this.numPlayers; i++) { if (!this.players[(this._cp() + i) % this.numPlayers].bankrupt) bidders.push((this._cp() + i) % this.numPlayers); }
    this.auction = { spaceId: sid, bidders, currentBidIdx: 0, highestBid: 0, highestBidder: -1 };
    this.phase = 'auction';
    E.push({ type: 'needInput', action: 'auction', bidder: bidders[0], highestBid: 0 });
    return this._result(A, E);
  }

  _bid(amount, A, E) {
    if (this.phase !== 'auction' || !this.auction) return { success: false, error: 'Not auction' };
    const auc = this.auction;
    const bidder = auc.bidders[auc.currentBidIdx];
    if (amount <= auc.highestBid || this.players[bidder].money < amount) return { success: false, error: 'Invalid bid' };
    auc.highestBid = amount; auc.highestBidder = bidder;
    E.push({ type: 'log', text: `${this.nicknames[bidder]} 出价 ¥${amount}` });
    auc.currentBidIdx++;
    return this._advanceAuction(A, E);
  }

  _skipBid(A, E) {
    if (this.phase !== 'auction' || !this.auction) return { success: false, error: 'Not auction' };
    const auc = this.auction;
    E.push({ type: 'log', text: `${this.nicknames[auc.bidders[auc.currentBidIdx]]} 放弃` });
    auc.currentBidIdx++;
    return this._advanceAuction(A, E);
  }

  _advanceAuction(A, E) {
    const auc = this.auction;
    if (auc.currentBidIdx >= auc.bidders.length) return this._resolveAuction(A, E);
    E.push({ type: 'needInput', action: 'auction', bidder: auc.bidders[auc.currentBidIdx], highestBid: auc.highestBid });
    return this._result(A, E);
  }

  _resolveAuction(A, E) {
    const auc = this.auction;
    if (auc.highestBidder >= 0) {
      const p = this._p(auc.highestBidder), sp = this.spaces[auc.spaceId];
      p.money -= auc.highestBid; sp.owner = auc.highestBidder; p.properties.push(auc.spaceId);
      E.push({ type: 'floatMoney', playerId: auc.highestBidder, amount: -auc.highestBid });
      E.push({ type: 'log', text: `${this.nicknames[auc.highestBidder]} 拍得 ${sp.name} ¥${auc.highestBid}`, important: true });
      this._checkMono(auc.highestBidder, sp.color, A, E);
    } else {
      E.push({ type: 'log', text: `${this.spaces[auc.spaceId].name} 无人出价` });
    }
    this.auction = null; this.phase = 'waitingEnd';
    return this._result(A, E);
  }

  // ===== RENT / TAX =====
  _payRent(fromId, toId, rent, A, E) {
    const fp = this._p(fromId);
    if (fp.money >= rent) {
      fp.money -= rent; this._p(toId).money += rent;
      E.push({ type: 'floatMoney', playerId: fromId, amount: -rent });
      E.push({ type: 'log', text: `${this.nicknames[fromId]} 租金¥${rent}→${this.nicknames[toId]}` });
    } else {
      this._autoMortgage(fromId, rent);
      if (fp.money >= rent) {
        fp.money -= rent; this._p(toId).money += rent;
        E.push({ type: 'floatMoney', playerId: fromId, amount: -rent });
        E.push({ type: 'log', text: `${this.nicknames[fromId]} 租金¥${rent}→${this.nicknames[toId]}` });
      } else {
        this._bankrupt(fromId, toId, A, E);
      }
    }
  }

  _payTax(pid, amount, A, E) {
    const p = this._p(pid);
    this._addToPool(amount);
    if (p.money >= amount) {
      p.money -= amount;
      E.push({ type: 'floatMoney', playerId: pid, amount: -amount });
      E.push({ type: 'log', text: `${this.nicknames[pid]} 缴税¥${amount}` });
    } else {
      this._autoMortgage(pid, amount);
      if (p.money >= amount) { p.money -= amount; E.push({ type: 'floatMoney', playerId: pid, amount: -amount }); }
      else this._bankrupt(pid, null, A, E);
    }
    this.phase = 'waitingEnd';
    return this._result(A, E);
  }

  _addToPool(amt) { if (this.usePool && amt > 0) this.pool += amt; }

  // ===== CARDS =====
  _drawAndExecCard(pid, type, A, E) {
    const cards = type === 'fate' ? FATE_DEF : CHANCE_DEF;
    const order = type === 'fate' ? this.fateOrder : this.chanceOrder;
    let idx = type === 'fate' ? this.fateIdx : this.chanceIdx;
    if (idx >= cards.length) {
      if (type === 'fate') { this.fateOrder = this._shuf([...Array(cards.length).keys()]); this.fateIdx = 0; idx = 0; }
      else { this.chanceOrder = this._shuf([...Array(cards.length).keys()]); this.chanceIdx = 0; idx = 0; }
    }
    const ci = order[idx];
    const card = cards[ci];
    if (type === 'fate') this.fateIdx++; else this.chanceIdx++;
    const label = type === 'fate' ? '命运' : '机会';
    E.push({ type: 'log', text: `${this.nicknames[pid]} ${label}卡：${card.t}`, important: true });
    A.push({ type: 'card', cardType: type, text: card.t });

    switch (card.tp) {
      case 'money':
        if (card.a >= 0) { this._p(pid).money += card.a; E.push({ type: 'floatMoney', playerId: pid, amount: card.a }); }
        else { this._execPayment(pid, Math.abs(card.a), A, E); }
        break;
      case 'mv': return this._moveToAndLand(pid, card.a, A, E);
      case 'jail': return this._goJail(pid, A, E);
      case 'ojc': this._p(pid).ojc++; E.push({ type: 'toast', message: '获得出狱卡！', level: 'gain' }); break;
      case 'repair': {
        let cost = 0; this._p(pid).properties.forEach(sid => { const s = this.spaces[sid]; cost += s.houses === 5 ? card.ec : s.houses * card.hc; });
        if (cost > 0) this._execPayment(pid, cost, A, E);
        break;
      }
      case 'collect': {
        let col = 0;
        this.players.forEach((op, i) => { if (i !== pid && !op.bankrupt) { const pay = Math.min(op.money, card.a); op.money -= pay; this._p(pid).money += pay; col += pay; } });
        E.push({ type: 'floatMoney', playerId: pid, amount: col });
        break;
      }
      case 'payall': {
        let paid = 0;
        this.players.forEach((op, i) => { if (i !== pid && !op.bankrupt) { const pay = Math.min(this._p(pid).money, card.a); if (pay > 0) { op.money += pay; this._p(pid).money -= pay; paid += pay; } } });
        E.push({ type: 'floatMoney', playerId: pid, amount: -paid });
        if (this._p(pid).money < 0) { this._autoMortgage(pid, 0); if (this._p(pid).money < 0) this._bankrupt(pid, null, A, E); }
        break;
      }
      case 'mvr': {
        const poss = this.spaces.filter(s => s.type === card.a).map(s => s.id);
        const pos = this._p(pid).position;
        let nr = poss[0]; for (const pp of poss) if (pp > pos) { nr = pp; break; }
        return this._moveToAndLand(pid, nr, A, E, false);
      }
      case 'mvr2': {
        const poss = this.spaces.filter(s => s.type === card.a).map(s => s.id);
        const pos = this._p(pid).position;
        let nr = poss[0]; for (const pp of poss) if (pp > pos) { nr = pp; break; }
        return this._moveToAndLand(pid, nr, A, E, true);
      }
      case 'back': return this._moveBackAndLand(pid, card.a, A, E);
    }
    this.phase = 'waitingEnd';
    return this._result(A, E);
  }

  _execPayment(pid, amount, A, E) {
    const p = this._p(pid);
    if (p.money >= amount) {
      p.money -= amount; this._addToPool(amount);
      E.push({ type: 'floatMoney', playerId: pid, amount: -amount });
    } else {
      this._autoMortgage(pid, amount);
      if (p.money >= amount) { p.money -= amount; this._addToPool(amount); E.push({ type: 'floatMoney', playerId: pid, amount: -amount }); }
      else this._bankrupt(pid, null, A, E);
    }
  }

  // ===== JAIL =====
  _goJail(pid, A, E) {
    const p = this._p(pid);
    p.inJail = true; p.jailTurns = 0; p.position = 10;
    this.doublesCount = 0; this.isDoubles = false;
    A.push({ type: 'jail' });
    A.push({ type: 'move', playerId: pid, from: p.position, to: 10, passedGo: false });
    E.push({ type: 'log', text: `${this.nicknames[pid]} 入狱！`, important: true });
    E.push({ type: 'toast', message: '入狱！', level: 'loss' });
    this.phase = 'waitingEnd';
    return this._result(A, E);
  }

  _useOJC(A, E) {
    if (this.phase !== 'jailRoll') return { success: false };
    const p = this._p();
    if (p.ojc <= 0) return { success: false };
    p.ojc--; p.inJail = false; p.jailTurns = 0;
    E.push({ type: 'log', text: `${this.nicknames[this._cp()]} 使用出狱卡` });
    E.push({ type: 'toast', message: '出狱！', level: 'gain' });
    this.phase = 'waitingRoll';
    return this._result(A, E);
  }

  _payBail(A, E) {
    if (this.phase !== 'jailRoll') return { success: false };
    const p = this._p();
    if (p.money < JAIL_BAIL) return { success: false, error: 'Not enough' };
    p.money -= JAIL_BAIL; this._addToPool(JAIL_BAIL); p.inJail = false; p.jailTurns = 0;
    E.push({ type: 'floatMoney', playerId: this._cp(), amount: -JAIL_BAIL });
    E.push({ type: 'log', text: `${this.nicknames[this._cp()]} 保释¥${JAIL_BAIL}` });
    this.phase = 'waitingRoll';
    return this._result(A, E);
  }

  // ===== END TURN =====
  _endTurn(A, E) {
    if (this.isDoubles && !this._p().bankrupt) {
      this.isDoubles = false; this.phase = 'waitingRoll';
      E.push({ type: 'log', text: `${this.nicknames[this._cp()]} 对子额外回合！`, important: true });
      return this._result(A, E);
    }
    let nx = this.currentPlayer, tries = 0;
    do { nx = (nx + 1) % this.numPlayers; tries++; } while (this.players[nx].bankrupt && tries < this.numPlayers);
    if (tries >= this.numPlayers) return this._result(A, E);
    if (nx <= this.currentPlayer) { this.round++; E.push({ type: 'log', text: `═══ 第 ${this.round} 轮 ═══`, important: true }); }
    this.currentPlayer = nx; this.doublesCount = 0; this.isDoubles = false;
    const p = this._p();
    if (p.inJail) { this.phase = 'jailRoll'; E.push({ type: 'log', text: `--- ${this.nicknames[nx]} 监狱中 ---`, important: true }); }
    else { this.phase = 'waitingRoll'; E.push({ type: 'log', text: `--- ${this.nicknames[nx]} 的回合 ---`, important: true }); }
    return this._result(A, E);
  }

  // ===== BUILD / SELL =====
  _build(sid, A, E) {
    const s = this.spaces[sid], pid = this._cp(), p = this._p();
    if (!s.color || s.houses >= 5 || !this._oa(pid, s.color)) return { success: false };
    const grp = this.spaces.filter(sp => sp.color === s.color);
    if (s.houses > Math.min(...grp.map(sp => sp.houses))) return { success: false };
    if (p.money < s.bc) return { success: false, error: 'Not enough' };
    p.money -= s.bc; s.houses++;
    E.push({ type: 'floatMoney', playerId: pid, amount: -s.bc });
    E.push({ type: 'log', text: `${this.nicknames[pid]} 建造 ${s.name}${s.houses === 5 ? ' 旅馆' : ' ' + s.houses + '栋'}` });
    return this._result(A, E);
  }

  _sell(sid, A, E) {
    const s = this.spaces[sid], pid = this._cp();
    const grp = this.spaces.filter(sp => sp.color === s.color);
    if (s.houses <= 0 || s.houses < Math.max(...grp.map(sp => sp.houses))) return { success: false };
    s.houses--; const rf = Math.floor((s.bc || 0) / 2); this._p(pid).money += rf;
    E.push({ type: 'floatMoney', playerId: pid, amount: rf });
    E.push({ type: 'log', text: `${this.nicknames[pid]} 拆除 ${s.name} +¥${rf}` });
    return this._result(A, E);
  }

  // ===== MORTGAGE =====
  _mort(sid, A, E) {
    const s = this.spaces[sid], pid = this._cp();
    if (s.mortgaged || s.houses > 0) return { success: false };
    s.mortgaged = true; const v = Math.floor(s.price / 2); this._p(pid).money += v;
    E.push({ type: 'floatMoney', playerId: pid, amount: v });
    E.push({ type: 'log', text: `${this.nicknames[pid]} 抵押 ${s.name} +¥${v}` });
    return this._result(A, E);
  }

  _unmort(sid, A, E) {
    const s = this.spaces[sid], pid = this._cp();
    if (!s.mortgaged) return { success: false };
    const cost = Math.floor(s.price / 2 * 1.1);
    if (this._p(pid).money < cost) return { success: false };
    this._p(pid).money -= cost; s.mortgaged = false;
    E.push({ type: 'floatMoney', playerId: pid, amount: -cost });
    E.push({ type: 'log', text: `${this.nicknames[pid]} 赎回 ${s.name} -¥${cost}` });
    return this._result(A, E);
  }

  // ===== AUTO MORTGAGE / BANKRUPTCY =====
  _autoMortgage(pid, need) {
    const p = this._p(pid); let safe = 0;
    while (p.money < need && safe < 200) {
      const wh = p.properties.filter(sid => this.spaces[sid].houses > 0).sort((a, b) => this.spaces[b].houses - this.spaces[a].houses);
      if (!wh.length) break;
      const s = this.spaces[wh[0]]; s.houses--; const rf = Math.floor((s.bc || 0) / 2); p.money += rf; safe++;
    }
    for (const sid of p.properties) {
      if (p.money >= need) break;
      const s = this.spaces[sid];
      if (!s.mortgaged && s.houses === 0) { s.mortgaged = true; p.money += Math.floor(s.price / 2); }
    }
  }

  _bankrupt(debtorId, creditorId, A, E) {
    const d = this._p(debtorId); d.bankrupt = true; d.money = 0;
    if (debtorId === this._cp()) { this.isDoubles = false; this.doublesCount = 0; }
    if (creditorId !== null && creditorId !== undefined) {
      const c = this._p(creditorId);
      d.properties.forEach(sid => { const s = this.spaces[sid]; s.owner = creditorId; c.properties.push(sid); if (s.houses > 0) { c.money += s.houses * Math.floor((s.bc || 0) / 2); s.houses = 0; } });
      E.push({ type: 'log', text: `${this.nicknames[debtorId]} 破产！资产归 ${this.nicknames[creditorId]}`, important: true });
    } else {
      d.properties.forEach(sid => { this.spaces[sid].owner = null; this.spaces[sid].houses = 0; this.spaces[sid].mortgaged = false; });
      E.push({ type: 'log', text: `${this.nicknames[debtorId]} 破产！`, important: true });
    }
    A.push({ type: 'shake' }); E.push({ type: 'toast', message: `${this.nicknames[debtorId]} 破产！`, level: 'loss' });
    d.properties = [];
    const alive = this._alive();
    if (alive.length === 1) {
      const wi = this.players.indexOf(alive[0]); this.winner = wi; this.phase = 'gameOver';
      A.push({ type: 'confetti', count: 80 }); A.push({ type: 'banner', title: '🏆 游戏结束！', subtitle: `${this.nicknames[wi]} 获胜！` });
      E.push({ type: 'log', text: `🎉🏆 ${this.nicknames[wi]} 获胜！`, important: true });
    }
  }

  _checkMono(pid, color, A, E) {
    if (!color) return;
    if (this.spaces.filter(s => s.color === color).every(s => s.owner === pid)) {
      A.push({ type: 'confetti', count: 40 }); A.push({ type: 'banner', title: '🎉 垄断达成！', subtitle: color.toUpperCase() + ' 组' });
      E.push({ type: 'log', text: `🎉 ${this.nicknames[pid]} 垄断 ${color.toUpperCase()} 组！`, important: true });
    }
  }

  // ===== TRADE =====
  _proposeTrade(data, A, E) {
    const { targetId, offerSid, wantSid, cash } = data;
    const pid = this._cp();
    if (this._p(pid).money < (cash || 0)) return { success: false };
    this.pendingTrade = { from: pid, to: targetId, offerSid, wantSid, cash: cash || 0 };
    E.push({ type: 'tradeProposal', from: pid, to: targetId, offerSid, wantSid, cash: cash || 0 });
    return this._result(A, E);
  }

  _respondTrade(accept, A, E) {
    if (!this.pendingTrade) return { success: false };
    const t = this.pendingTrade; this.pendingTrade = null;
    if (!accept) { E.push({ type: 'log', text: '交易被拒绝' }); return this._result(A, E); }
    const fp = this._p(t.from), tp = this._p(t.to);
    fp.properties = fp.properties.filter(s => s !== t.offerSid);
    tp.properties = tp.properties.filter(s => s !== t.wantSid);
    fp.properties.push(t.wantSid); tp.properties.push(t.offerSid);
    this.spaces[t.offerSid].owner = t.to; this.spaces[t.wantSid].owner = t.from;
    fp.money -= t.cash; tp.money += t.cash;
    E.push({ type: 'log', text: `${this.nicknames[t.from]} ↔ ${this.nicknames[t.to]} 交易完成`, important: true });
    return this._result(A, E);
  }

  // ===== HELPER =====
  _result(A, E) {
    return { success: true, state: this.getState(), animations: A, events: E };
  }

  // ===== AUTO PLAY (for timeout) =====
  autoPlay() {
    const A = [], E = [];
    switch (this.phase) {
      case 'waitingRoll': case 'jailRoll': return this._rollDice(A, E);
      case 'waitingBuyDecision': return this._passProp(A, E);
      case 'auction': return this._skipBid(A, E);
      case 'waitingEnd': return this._endTurn(A, E);
      default: return this._result(A, E);
    }
  }
}

module.exports = { GameEngine, SPACES_DEF, FATE_DEF, CHANCE_DEF };
