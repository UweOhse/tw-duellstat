// vim: tabstop=2 shiftwidth=2 expandtab

// a hack for the developer
if (TWDS.fbs && TWDS.fbs.data) {
  TWDS.fbstmp = TWDS.fbs.data
}
TWDS.fbs = {}
TWDS.fbs.data = {}
if ('fbstmp' in TWDS) {
  TWDS.fbs.data = TWDS.fbstmp
}
TWDS.fbs.bsw = null
TWDS.fbs.sectortitles = { // this is not a thing of beauty.
  1: 'S1',
  3: 'S2',
  5: 'S3',
  8: 'W2',
  10: 'W1',
  11: 'E2',
  13: 'E1',
  15: 'S4',
  16: 'S5',
  17: 'S6',
  18: 'S7',
  19: 'S8',
  20: 'W5',
  21: 'W4',
  22: 'W3',
  23: 'E5',
  24: 'E4',
  25: 'E3',
  26: 'N1',
  27: 'N3',
  29: 'N2',
  34: 'HQ',
  68: 'SW1',
  69: 'SW2',
  70: 'EW1',
  71: 'WW1',
  72: 'NW1',
  73: 'NW3',
  74: 'S9',
  75: 'S10',
  76: 'S11',
  77: 'S12',
  78: 'W7',
  79: 'W6',
  80: 'E7',
  81: 'E6',
  82: 'N5',
  83: 'N6',
  84: 'N7',
  85: 'N4',
  88: 'Gate',
  89: 'Flag',
  95: 'KS',
  121: 'W1',
  123: 'W2',
  125: 'S1',
  127: 'S2',
  129: 'S3',
  131: 'E2',
  133: 'E1',
  135: 'N1',
  137: 'N2',
  139: 'N3',
  140: 'S4',
  141: 'S5',
  142: 'S6',
  143: 'S7',
  144: 'S8',
  145: 'W5',
  146: 'W4',
  147: 'W3',
  148: 'E5',
  149: 'E4',
  150: 'E3',
  151: 'N4',
  152: 'N5',
  153: 'N6',
  154: 'N7',
  160: 'W6',
  161: 'W7',
  162: 'E6',
  163: 'E7',
  164: 'S9',
  165: 'S10',
  166: 'S11',
  167: 'S12',
  168: 'W1',
  170: 'W2',
  172: 'S1',
  174: 'E2',
  176: 'E1',
  178: 'S3',
  180: 'S2',
  182: 'N1',
  184: 'N2',
  186: 'N3',
  187: 'S4',
  188: 'S5',
  189: 'S6',
  190: 'S7',
  191: 'S8',
  192: 'W5',
  193: 'W4',
  194: 'W3',
  195: 'E3',
  196: 'E4',
  197: 'E5',
  203: 'S9',
  204: 'S12',
  205: 'N7',
  206: 'N4',
  211: 'N5',
  212: 'N6',
  213: 'S10',
  214: 'S11',
  210: 'E6',
  209: 'E7',
  207: 'W6',
  208: 'W7',
  216: 'Flag',
  220: 'Flag',
  343: 'RS',
  351: 'HQ',
  358: 'RS',
  361: 'KS',
  389: 'WW2',
  390: 'EW2',
  391: 'NW1',
  393: 'SW1',
  394: 'SW2',
  395: 'NW2',
  392: 'NW3',
  396: 'WW1',
  397: 'EW1',
  437: 'WW2',
  438: 'WW1',
  441: 'EW2',
  442: 'EW1',
  443: 'NW1',
  444: 'NW2',
  446: 'NW3',
  447: 'SW1',
  448: 'SW2',
  452: 'Gate',
  464: 'HQ',
  470: 'RS',
  475: 'KS',
  478: 'HQ',
  485: 'Gate',
  486: 'ST',
  487: 'WT',
  488: 'DT',
  489: 'AT',
  490: 'AT',
  491: 'DT',
  492: 'WT',
  494: 'ST',
  495: 'AT',
  496: 'DT',
  497: 'ET',
  498: 'ST'
}
TWDS.fbs.describesector = function (secno) {
  const t = TWDS.fbs.data.result.map.sectors[secno].sourceId
  if (t in TWDS.fbs.sectortitles) {
    return TWDS.fbs.sectortitles[t]
  }
  return secno
}

TWDS.fbs.graphs = ['healthandguns', 'damage', 'kills', 'moves', 'bumps',
  'shotrate', 'online', 'bonus', 'hits', 'distance']

TWDS.fbs.addlog1 = function (logcontainer, wantround) {
  logcontainer.textContent = 'want round ' + wantround
  const battledata = TWDS.fbs.data.result
  let indef = true
  let pl = {}
  const playerstatus = {} // new battle.
  const pstats = {}
  let warned = 0
  let round = 0

  const shorthp = function (hp) {
    if (hp >= 10000) {
      hp = (hp / 1000).toFixed(1) + 'k'
    }
    return hp
  }
  const addpstat = function (pl1, pl2, key, val) {
    if (!(pl1 in pstats)) {
      pstats[pl1] = {
        hitsdone: {},
        damagedone: {},
        killsdone: {},
        missed: {},
        hitstaken: {},
        damagetaken: {},
        dodged: {}
      }
    }
    if (!(pl2 in pstats[pl1][key])) { pstats[pl1][key][pl2] = 0 }
    pstats[pl1][key][pl2] += val
    if (isNaN(pstats[pl1][key][pl2]) && warned < 10) {
      warned++
      console.log('ISNAN', pl1, pl2, key, val)
    }
  }

  const describepos = function (pos) {
    const map = battledata.map
    const width = map.width
    const x = pos % width
    const y = Math.floor(pos / width)
    const secno = map.cells[pos]
    return x + 'x' + y + ' (' + TWDS.fbs.describesector(secno) + ')'
  }

  const CEpa = function (x, y) { return TWDS.createEle(x, { last: y }) }

  TWDS.fbs.data.result.attackerlist.forEach(function (p) {
    p.side = 'a'
    p._curpos = p.firstroundpos
    p._curhealth = p.starthp
    playerstatus[p.westid] = p
  })
  TWDS.fbs.data.result.defenderlist.forEach(function (p) {
    p.side = 'd'
    playerstatus[p.westid] = p
    p._curhealth = p.starthp
    p._curpos = p.firstroundpos
  })
  const roundstatus = function () {
    if (round !== wantround) return
    const docount = function (side, cl) {
      let n = 0
      Object.values(playerstatus).forEach(function (s) {
        if (s.side === side) {
          if (s.charclass === cl || cl === '*') {
            if (s._curhealth > 0) { n++ }
          }
        }
      })
      return n
    }
    const dosum = function (side, cl) {
      let n = 0
      Object.values(playerstatus).forEach(function (s) {
        if (s.side === side) {
          if (s.charclass === cl || cl === '*') {
            n += s._curhealth
          }
        }
      })
      return n
    }
    const app = function (pa, tag, data) {
      const ele = CEpa(tag, pa)
      ele.textContent = data
    }
    const li = CEpa('li', logcontainer)
    CEpa('div', li).textContent = 'The status before round ' + round + ':'
    const tab = CEpa('table.beforerounddata', li)
    let tr

    tr = CEpa('tr', tab)
    app(tr, 'th', 'Side')
    app(tr, 'th', '')
    app(tr, 'th', 'Total')
    app(tr, 'th', 'Advents.')
    app(tr, 'th', 'Duellers')
    app(tr, 'th', 'Workers')
    app(tr, 'th', 'Soldiers')
    app(tr, 'th', 'Greenh.')

    tr = CEpa('tr', tab)
    app(tr, 'th', 'Att')
    app(tr, 'th', 'Guns')
    app(tr, 'td', docount('a', '*'))
    app(tr, 'td', docount('a', 0))
    app(tr, 'td', docount('a', 1))
    app(tr, 'td', docount('a', 2))
    app(tr, 'td', docount('a', 3))
    app(tr, 'td', docount('a', -1))

    tr = CEpa('tr', tab)
    app(tr, 'th', 'Def')
    app(tr, 'th', 'Guns')
    app(tr, 'td', docount('d', '*'))
    app(tr, 'td', docount('d', 0))
    app(tr, 'td', docount('d', 1))
    app(tr, 'td', docount('d', 2))
    app(tr, 'td', docount('d', 3))
    app(tr, 'td', docount('d', -1))

    tr = CEpa('tr', tab)
    app(tr, 'th', 'Att')
    app(tr, 'th', 'Health')
    app(tr, 'td', dosum('a', '*'))
    app(tr, 'td', dosum('a', 0))
    app(tr, 'td', dosum('a', 1))
    app(tr, 'td', dosum('a', 2))
    app(tr, 'td', dosum('a', 3))
    app(tr, 'td', dosum('a', -1))

    tr = CEpa('tr', tab)
    app(tr, 'th', 'Def')
    app(tr, 'th', 'Health')
    app(tr, 'td', dosum('d', '*'))
    app(tr, 'td', dosum('d', 0))
    app(tr, 'td', dosum('d', 1))
    app(tr, 'td', dosum('d', 2))
    app(tr, 'td', dosum('d', 3))
    app(tr, 'td', dosum('d', -1))
  }
  const logoneplayersround = function () {
    if (!pl.westid) return
    const p = playerstatus[pl.westid]
    if (!p) return

    let str = ''
    str += pl.online ? 'online' : 'offline'
    str += p.side === 'a' ? ' attacker' : ' defender'
    str += ' ' + p.name
    str += ' (' + shorthp(pl.health) + 'hp' + ')'
    str += ' @' + describepos(p._curpos)
    let did = 0
    if (pl.shootat) {
      if (pl.hit) {
        addpstat(pl.westid, pl.shootat, 'hitsdone', 1)
        addpstat(pl.westid, pl.shootat, 'damagedone', pl.hit)
        addpstat(pl.shootat, pl.westid, 'hitstaken', 1)
        addpstat(pl.shootat, pl.westid, 'damagetaken', pl.hit)
        str += ' hit ' + playerstatus[pl.shootat].name +
        ' @' + describepos(playerstatus[pl.shootat]._curpos) +
        ' for ' + pl.hit + ' hp' +
        ' (' + shorthp(playerstatus[pl.shootat]._curhealth) +
        '->' + shorthp(playerstatus[pl.shootat]._curhealth - pl.hit) +
        ')'

        playerstatus[pl.shootat]._curhealth -= pl.hit
      } else if (pl.killed) {
        addpstat(pl.westid, pl.shootat, 'killsdone', 1)
        addpstat(pl.westid, pl.shootat, 'hitsdone', 1)
        addpstat(pl.westid, pl.shootat, 'damagedone', pl.killed)
        addpstat(pl.shootat, pl.westid, 'hitstaken', 1)
        addpstat(pl.shootat, pl.westid, 'damagetaken', pl.killed)
        playerstatus[pl.shootat]._curhealth = 0
        str += ' knocked out ' + playerstatus[pl.shootat].name +
        ' @' + describepos(playerstatus[pl.shootat]._curpos) +
        ' with ' + pl.killed + ' hp damage.'
      } else {
        addpstat(pl.westid, pl.shootat, 'missed', 1)
        addpstat(pl.shootat, pl.westid, 'dodged', 1)
        str += ' missed ' + playerstatus[pl.shootat].name +
        ' @' + describepos(playerstatus[pl.shootat]._curpos)
      }
      did++
    }
    if (pl.moved && pl.moved !== p._curpos) {
      if (did++) {
        str += ' and'
      }
      const s1 = battledata.map.cells[pl.target]
      const s2 = battledata.map.cells[pl.moved]
      p._curpos = pl.moved
      if (pl.moved === pl.target) {
        str += ' moved to ' +
          describepos(pl.moved) +
          ' reaching the target'
      } else if (s1 !== s2) {
        str += ' moved to ' +
          describepos(pl.moved) +
          ' on the way to ' +
          describepos(pl.target)
      } else {
        str += ' moved to ' +
          describepos(pl.moved) +
          ' not reaching the target ' +
          describepos(pl.target)
      }
    }
    if (!did) {
      str += ' did nothing'
    }
    if (round === wantround) {
      const li = CEpa('li', logcontainer)
      li.className = 'playersround'
      li.textContent = str
    }
  }

  const log = TWDS.fbs.data.result.log
  const logtypes = TWDS.fbs.data.result.logtypes

  for (let i = 0; i < log.length; i += 2) {
    if (round > wantround) break
    const what = log[i]
    const detail = log[i + 1]
    switch (logtypes[what]) {
      case 'ROUNDSTART':
        if (pl.westid) { logoneplayersround() }
        pl = {}
        round = detail

        roundstatus()
        if (round === wantround) {
          TWDS.createEle('li.newround', {
            last: logcontainer,
            textContent: 'The defenders turn:'
          })
        }

        indef = true

        break
      case 'CHARTURN':
        if (pl.westid) { logoneplayersround() }
        pl = {}
        pl.westid = detail
        if (playerstatus[pl.westid].side === 'a' && indef) {
          indef = false
          if (round === wantround) {
            TWDS.createEle('li.newhalfround', {
              last: logcontainer,
              textContent: 'The attackers turn:'
            })
          }
        }
        break
      case 'CHARTARGET':
        pl.target = detail
        break
      case 'CHARHEALTH':
        pl.health = detail
        break
      case 'CHARONLINE':
        pl.online = detail
        break
      case 'SHOOTAT':
        pl.shootat = detail
        break
      case 'HIT':
        pl.hit = detail
        break
      case 'KILLED':
        pl.killed = detail
        break
      case 'MOVED':
        pl.moved = detail
        break
      default:
        console.log('unknown log type', what)
        break
    }
  }
  if (pl.westid) { logoneplayersround() }
}
TWDS.fbs.addlog = function (content) {
  const battledata = TWDS.fbs.data.result

  content.textContent = ''
  TWDS.createEle({
    nodeName: 'h3',
    last: content,
    textContent: 'Log'
  })
  const uicontainer = TWDS.createEle({
    nodeName: 'div',
    last: content
  })
  const updatevalues = function (delta) {
    let val = parseInt(inp.value)
    val += delta
    if (val < 2) val = 2
    if (val > battledata.roundsplayed) val = battledata.roundsplayed
    inp.value = val
    prev.disabled = false
    next.disabled = false
    if (val < 3) { prev.disabled = true }
    if (val > battledata.roundsplayed - 1) { next.disabled = true }
    TWDS.fbs.addlog1(logcontainer, val)
  }
  const prev = TWDS.createEle('button.prev', {
    last: uicontainer,
    textContent: '<---',
    disabled: true,
    onclick: function () { updatevalues(-1) }
  })
  const inp = TWDS.createEle('input', {
    last: uicontainer,
    value: '2',
    min: 2,
    max: battledata.roundsplayed,
    onchange: function () { updatevalues(0) }
  })
  const next = TWDS.createEle('button.next', {
    last: uicontainer,
    textContent: '--->',
    disabled: false,
    onclick: function () { updatevalues(+1) }
  })
  const logcontainer = TWDS.createEle({
    nodeName: 'ul',
    last: content
  })
  TWDS.fbs.addlog1(logcontainer, 2)
}

TWDS.fbs.makepersonstats = function (a, r, extra) {
  const fuddle2 = {
    value: 0,
    by: []
  }
  const fuddle = {
    count: 0,
    charlevel: 0,
    crithits: 0,
    dodgecount: 0,
    finishedhp: 0,
    hitcount: 0,
    ko_count: 0,
    maxhp: 0,
    misscount: 0,
    playdeadcount: 0,
    starthp: 0,
    takendamage: 0,
    takenhits: 0,
    totalcauseddamage: 0,
    weaponmaxdmg: 0,
    weaponmindmg: 0,
    onlinecount: 0,
    // derived
    personroundsalive: 0,
    personroundsalive54: 0,
    personlevelroundsalive: 0,
    personlevelroundsalive54: 0,
    survived: 0,
    hitquote: 0.0,
    dodgequote: 0.0,

    //
    moves: 0,
    fieldsmoved: 0,
    sectorsmoved: 0,

    //
    highest_charlevel: Object.assign({}, fuddle2),
    highest_crithits: Object.assign({}, fuddle2),
    highest_dodgecount: Object.assign({}, fuddle2),
    highest_hitcount: Object.assign({}, fuddle2),
    highest_ko_count: Object.assign({}, fuddle2),
    highest_playdeadcount: Object.assign({}, fuddle2),
    highest_starthp: Object.assign({}, fuddle2),
    highest_takenhits: Object.assign({}, fuddle2),
    highest_totalcauseddamage: Object.assign({}, fuddle2),

    highest_maxdamage: Object.assign({}, fuddle2),
    highest_hitquote: Object.assign({}, fuddle2),
    highest_dodgequote: Object.assign({}, fuddle2),
    highest_moves: Object.assign({}, fuddle2),
    highest_fieldsmoved: Object.assign({}, fuddle2),
    highest_sectorsmoved: Object.assign({}, fuddle2)
  }

  const o = Object.assign({}, fuddle)
  o.byclass = []
  // deep copy.
  o.byclass[0] = JSON.parse(JSON.stringify(fuddle))
  o.byclass[1] = JSON.parse(JSON.stringify(fuddle))
  o.byclass[2] = JSON.parse(JSON.stringify(fuddle))
  o.byclass[3] = JSON.parse(JSON.stringify(fuddle))
  o.byclass[4] = JSON.parse(JSON.stringify(fuddle))

  const mosthelper = function (d, k) {
    const cl = d.charclass + 1
    const k2 = 'highest_' + k
    if (d[k] > o[k2].value) {
      o[k2].value = d[k]
      o[k2].by = [d.name]
    } else if (d[k] === o[k2].value && d[k]) {
      o[k2].by.push(d.name)
    }
    if (d[k] > o.byclass[cl][k2].value) {
      o.byclass[cl][k2].value = d[k]
      o.byclass[cl][k2].by = [d.name]
    } else if (d[k] === o.byclass[cl][k2].value && d[k]) {
      o.byclass[cl][k2].by.push(d.name)
    }
  }

  for (let i = 0; i < a.length; i++) {
    const d = a[i]
    const cl = d.charclass + 1
    const id = d.westid

    // fix some things
    d.finishedhp = Math.max(0, d.finishedhp)
    d.shotsfired = (d.hitcount + d.misscount)
    // -1, because in 55 rounds play we can shoot 54 times.
    d.personroundsalive = (d.diedwhen === 0 ? r : d.diedwhen)
    d.personroundsonline = (d.diedwhen === 0 ? r : d.diedwhen)
    d.personlevelroundsalive = ((d.diedwhen === 0 ? r : d.diedwhen)) * d.charlevel
    d.personroundsalive54 = (d.diedwhen === 0 ? r : d.diedwhen) - 1
    d.personlevelroundsalive54 = ((d.diedwhen === 0 ? r : d.diedwhen) - 1) * d.charlevel
    d.ko_count = d.ko_shots.length
    d.hitquote = d.hitcount / (d.hitcount + d.misscount + 0.0) * 100
    d.dodgequote = d.dodgecount / (d.dodgecount + d.takenhits + 0.0) * 100
    d.survived = (d.killedby === -1 ? 1 : 0)
    //
    if (id in extra) {
      d.moves = extra[id].moves
      d.fieldsmoved = extra[id].fieldsmoved
      d.sectorsmoved = extra[id].sectorsmoved
    }
    for (const f of Object.keys(d)) {
      if (f in o) {
        o[f] += d[f]
        o.byclass[cl][f] += d[f]
      }
    }
    o.count++
    o.byclass[cl].count++

    mosthelper(d, 'charlevel')
    mosthelper(d, 'crithits')
    mosthelper(d, 'dodgecount')
    mosthelper(d, 'hitcount')
    mosthelper(d, 'ko_count')
    mosthelper(d, 'playdeadcount')
    mosthelper(d, 'starthp')
    mosthelper(d, 'takenhits')
    mosthelper(d, 'totalcauseddamage')
    mosthelper(d, 'maxdamage')
    if (d.hitcount + d.misscount >= r / 2 - 1) {
      mosthelper(d, 'hitquote')
    }
    if (d.takenhits + d.dodgecount >= 10) {
      mosthelper(d, 'dodgequote')
    }
    mosthelper(d, 'moves')
    mosthelper(d, 'sectorsmoved')
    mosthelper(d, 'fieldsmoved')
  }
  return o
}
TWDS.fbs.parselog = function () {
  const l = TWDS.fbs.data.result.log
  const lt = TWDS.fbs.data.result.logtypes
  const map = TWDS.fbs.data.result.map
  const cells = map.cells
  const sectors = map.sectors
  const state = {
  }
  const fillstate = function (cl, at) {
    for (let i = 0; i < cl.length; i++) {
      const id = cl[i].westid
      state[id] = Object.assign({}, cl[i])
      state[id]._curpos = cl[i].startposidx
      state[id]._attacker = at
      state[id]._moves = 0
      state[id]._bumps = 0
    }
  }
  fillstate(TWDS.fbs.data.result.attackerlist, true)
  fillstate(TWDS.fbs.data.result.defenderlist, false)

  let round = 0
  let curchar = 0
  let chartarget = -1
  let charmoved = -1
  let charonline = 0
  let charhealth = 0
  let shootat = 0
  let killed = 0
  let hit = 0
  const rounddata = []
  const dataset = {
    online: 0,
    fighters: 0,
    health: 0,
    moved: 0,
    bumps: 0,
    onbonusposition: 0,
    killed: 0,
    damagedone: 0,
    shots: 0,
    hits: 0,
    misses: 0,
    totaldistance: 0
  }
  const extradatatemplate = {
    moves: 0,
    sectorsmoved: 0,
    fieldsmoved: 0
  }
  const extradata = {
    at: { },
    def: { }
  }

  const calcdist = function (a, b) {
    const ay = parseInt(a / map.width)
    const ax = a - ay * map.width
    const by = parseInt(b / map.width)
    const bx = b - by * map.width
    return Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by))
  }

  const finishchar = function () {
    const key = state[curchar]._attacker ? 'at' : 'def'
    if (!(curchar in extradata[key])) {
      extradata[key][curchar] = Object.assign({}, extradatatemplate)
    }
    if (charmoved > -1) {
      extradata[key][curchar].moves++
      extradata[key][curchar].fieldsmoved += calcdist(charmoved,
        state[curchar]._curpos)

      const sectorreached = cells[charmoved]
      const oldsector = cells[state[curchar]._curpos]
      if (sectorreached !== oldsector) {
        extradata[key][curchar].sectorsmoved++
      }

      state[curchar]._moves++
      rounddata[round][key].moved++

      if (chartarget !== charmoved) {
        const targetsector = cells[chartarget]
        if (sectorreached === targetsector && charonline) {
          state[curchar]._bumps++
          rounddata[round][key].bumps++
        }
      }
    }
    let shootpos
    if (key === 'at') {
      // attacker moves and shoots
      if (charmoved !== -1) { shootpos = charmoved } else { shootpos = state[curchar]._curpos }
    } else {
      // defender shoots and moves
      shootpos = state[curchar]._curpos
    }
    if (shootpos !== -1) {
      const sector = cells[shootpos]
      const s = sectors[sector]
      if (key === 'at') {
        if (s.attackerBonus > 0) { rounddata[round][key].onbonusposition++ }
      }
      if (key === 'def') {
        if (s.defenderBonus > 0) { rounddata[round][key].onbonusposition++ }
      }
    }
    if (shootat) {
      const targetpos = state[shootat]._curpos
      const dist = calcdist(shootpos, targetpos)
      rounddata[round][key].shots++
      rounddata[round][key].totaldistance += dist
    }
    if (killed) {
      rounddata[round][key].killed++
      rounddata[round][key].hits++
      rounddata[round][key].damagedone += killed
    } else if (hit) {
      rounddata[round][key].hits++
      rounddata[round][key].damagedone += hit
    } else {
      rounddata[round][key].misses++
    }

    if (charonline) {
      rounddata[round][key].online++
    }
    rounddata[round][key].fighters++
    rounddata[round][key].health += charhealth
    if (charmoved !== -1) {
      state[curchar]._curpos = charmoved
    }
    curchar = 0
    chartarget = -1
    charmoved = -1
    charonline = 0
    charhealth = 0
    shootat = 0
    killed = 0
    hit = 0
  }
  for (let i = 0; i < l.length; i += 2) {
    const code = l[i]
    const para = l[i + 1]
    const type = lt[code]
    switch (type) {
      case 'ROUNDSTART': // 0
        if (curchar) { finishchar() }
        round = para
        rounddata[round] = {
          at: Object.assign({}, dataset),
          def: Object.assign({}, dataset)
        }
        curchar = 0
        break
      case 'CHARTURN': // 1
        if (curchar) { finishchar() }
        curchar = para
        break
      case 'CHARTARGET': // 2
        chartarget = para
        break
      case 'CHARHEALTH': // 3
        charhealth = para
        break
      case 'CHARONLINE': // 4
        charonline = para
        break
      case 'SHOOTAT': // 5
        shootat = para
        break
      case 'KILLED': // 6
        killed = para
        break
      case 'HIT': // 7
        hit = para
        break
      case 'MOVED': // 8
        charmoved = para
        break
    }
  }
  return [rounddata, extradata]
}
TWDS.fbs.makebasestats_sub = function (whom, content) {
  const _ = TWDS._
  const res = TWDS.fbs.parselog()
  const extradata = res[1]

  content.textContent = ''

  const tab = TWDS.createEle({
    nodeName: 'table'
  })
  content.appendChild(tab)

  const thead = TWDS.createEle({
    nodeName: 'thead',
    children: [
      {
        nodeName: 'tr',
        children: [
          { nodeName: 'th', textContent: _('FBS_ATT_SIDE', 'Attacking side'), className: 'tw_red' },
          { nodeName: 'th', textContent: '' },
          { nodeName: 'th', textContent: _('FBS_DEF_SIDE', 'Defending side'), className: 'tw_blue' }
        ]
      }
    ]
  })
  tab.appendChild(thead)

  const tbody = TWDS.createEle({
    nodeName: 'tbody'
  })
  tab.appendChild(tbody)

  const rounds = this.data.result.roundsplayed - 1

  const atall = this.makepersonstats(this.data.result.attackerlist, rounds, extradata.at)
  const dfall = this.makepersonstats(this.data.result.defenderlist, rounds, extradata.def)

  tbody.appendChild(TWDS.createEle({
    nodeName: 'tr',
    children: [
      { nodeName: 'td', textContent: this.data.result.attackertownname },
      { nodeName: 'th', textContent: 'Town' },
      { nodeName: 'td', textContent: this.data.result.defendertownname }
    ]
  }))

  const subhead = function (t) {
    const e = TWDS.createEle({
      nodeName: 'tr',
      children: [
        { nodeName: 'th', className: 'subhead', colSpan: 3, textContent: t }
      ]
    })
    return e
  }
  const r = function (t, a, d, transform, hint) {
    const dotnull = "<span class='dotnull'>&nbsp;&nbsp;</span>"
    if (a instanceof Array) {
      a = a.join(', ')
      d = d.join(', ')
      if (a === '' && d === '') { return }
    } else {
      if (a === 0 && d === 0) return // soldiers ghosting :-)
    }
    if (transform) {
      if (isNaN(a) || !isFinite(a)) {
        a = '-' + dotnull
      } else {
        a = a.toFixed(1)
      }
      if (isNaN(d) || !isFinite(d)) {
        d = '-' + dotnull
      } else {
        d = d.toFixed(1)
      }
    } else {
      if (typeof a === 'number') {
        if (isNaN(a) || !isFinite(a)) {
          a = '-'
        }
        if (isNaN(d) || !isFinite(d)) {
          d = '-'
        }
      }
      a += dotnull
      d += dotnull
    }
    if (hint === null) hint = ''
    const e = TWDS.createEle({
      nodeName: 'tr',
      children: [
        { nodeName: 'td', innerHTML: a },
        { nodeName: 'th', textContent: t },
        { nodeName: 'td', innerHTML: d }
      ]
    })
    if (hint > '') {
      TWDS.q1('th', e).title = hint
    }
    tbody.appendChild(e)
  }
  const q = function (t, a, d, transform, hint) {
    const dotnull = "<span class='dotnull'>&nbsp;&nbsp;</span>"
    // a, d are objects
    if (a.value === 0 || isNaN(a.value) || !isFinite(a.value)) {
      if (d.value === 0 || isNaN(d.value) || !isFinite(d.value)) {
        return
      }
    }
    let av = a.value
    let dv = d.value
    if (isNaN(av) || !isFinite(av)) {
      if (transform) {
        av = '-' + dotnull
      } else {
        av = '-' + dotnull
      }
    } else {
      if (transform) {
        av = av.toFixed(1)
      } else {
        av += dotnull
      }
    }
    if (isNaN(dv) || !isFinite(dv)) {
      if (transform) {
        dv = '-' + dotnull
      } else {
        dv = '-' + dotnull
      }
    } else {
      if (transform) {
        dv = dv.toFixed(1)
      } else {
        dv += dotnull
      }
    }
    if (a.by.length === 1 && d.by.length === 1) {
      av = a.by[0] + ': ' + av
      dv = d.by[0] + ': ' + dv
    }
    if (hint === null) hint = ''
    const e = TWDS.createEle({
      nodeName: 'tr',
      children: [
        { nodeName: 'td', innerHTML: av },
        { nodeName: 'th', textContent: t },
        { nodeName: 'td', innerHTML: dv }
      ]
    })
    if (hint > '') {
      TWDS.q1('th', e).title = hint
    }
    tbody.appendChild(e)
    if (a.by.length !== 1 || d.by.length !== 1) {
      const f = TWDS.createEle({
        nodeName: 'tr',
        children: [
          { nodeName: 'td', innerHTML: a.by.join(', ') },
          { nodeName: 'th', textContent: _('FBS_DOTDOT_BY', '... by') },
          { nodeName: 'td', innerHTML: d.by.join(', ') }
        ]
      })
      tbody.appendChild(f)
    }
  }
  const clname = ['greenhorn', 'adventurer', 'duelist', 'worker', 'soldier']

  let at
  let df
  if (whom === -1) {
    at = atall
    df = dfall
  } else {
    at = atall.byclass[whom]
    df = dfall.byclass[whom]
  }

  if (whom === -1) {
    tbody.appendChild(subhead(_('FBS_OVER_ALL_CLASSES', 'Over all character classes')))
  } else {
    tbody.appendChild(subhead(Game.InfoHandler.getLocalString4Charclass(clname[whom])))
  }
  r(_('FBS_FIGHTERS', 'Fighters'), at.count, df.count, false,
    'The number of fighters at the start of the battle.')
  if (at.count + df.count === 0) {
    return
  }
  r(_('FBS_SURVIVORS', 'Survivors'), at.survived, df.survived, false,
    'The number of fighters still standing at the end of the battle.')
  r(_('FBS_AVERAGE_ALIVE', 'Avg. # of fighters alive.'), at.personroundsalive / rounds, df.personroundsalive / rounds, true,
    'Counted over time, not a simple average.')

  r(_('FBS_HP_AT_START', 'HP at start'), at.starthp, df.starthp, false)
  r(_('FBS_HP_AT_END', 'HP at end'), at.finishedhp, df.finishedhp, false)
  q(_('FBS_MOST_HP', 'Most HP'), at.highest_starthp, df.highest_starthp, false)
  r(_('FBS_MISSING_HP', 'Missing HP at start'), at.maxhp - at.starthp, df.maxhp - df.starthp, false,
    'The amount of HP not filled up')
  r(_('FBS_HP_LOST', 'HP lost'), at.starthp - at.finishedhp, df.starthp - df.finishedhp, false)
  r(_('FBS_HP_AVERAGE', 'HP average'), at.starthp / at.count, df.starthp / df.count, true, 'Total start HP divided by fighters')

  // sr('totalcauseddamage', 'Damage caused')
  r(_('FBS_TOTAL_DAMAGE_DONE', 'Total damage done'), at.totalcauseddamage, df.totalcauseddamage, false, 'per fighter')
  r(_('FBS_AVERAGE_DAMAGE_DONE', 'Average damage done'), at.totalcauseddamage / at.count, df.totalcauseddamage / df.count, true, 'per fighter')
  r(_('FBS_AVERAGE_DAMAGE_PER_HIT', '... per hit'), at.totalcauseddamage / at.hitcount, df.totalcauseddamage / df.hitcount, true)
  r(_('FBS_AVERAGE_HITS_DONE', 'Average hits done'), at.hitcount / at.count, df.hitcount / df.count, true)
  r(_('FBS_AVERAGE_MISSED_SHOTS', 'Average missed shots'), at.misscount / at.count, df.misscount / df.count, true)

  r(_('FBS_AVERAGE_DAMAGE_TAKEN', 'Average damage taken'), df.totalcauseddamage / at.count, at.totalcauseddamage / df.count, true)
  r(_('FBS_AVERAGE_DODGED_SHOTS', 'Average dodged shots'), at.dodgecount / at.count, df.dodgecount / df.count, true)
  r(_('FBS_AVERAGE_HITS_TAKEN', 'Average hits taken'), at.takenhits / at.count, df.takenhits / df.count, true)

  r(_('FBS_KOS_ACHIEVED', 'KOs achieved'), at.ko_count, df.ko_count)
  r(_('FBS_CRITICAL_HITS', 'Critical hits'), at.crithits, df.crithits)
  r(_('FBS_GHOSTS', 'Ghosts'), at.playdeadcount, df.playdeadcount)

  r(_('FBS_TOTAL_LEVELS', 'Total levels'), at.charlevel, df.charlevel)
  r(_('FBS_AVERAGE_LEVEL', 'Average level'), at.charlevel / at.count, df.charlevel / df.count, true)
  q(_('FBS_HIGHEST_LEVEL', 'Highest level'), at.highest_charlevel, df.highest_charlevel, true)
  // r('Highest level by', at.highest_charlevel.by, df.highest_charlevel.by, false)
  // r('Avg. # of levels alive.', at.personlevelroundsalive/rounds, df.personlevelroundsalive/rounds, true)

  r(_('FBS_AVERAGE_MAX_WEAPON_DMG', 'Average max weapon. dmg.'), at.weaponmaxdmg / at.count, df.weaponmaxdmg / df.count, true)
  r(_('FBS_AVERAGE_MIN_WEAPON_DMG', 'Average min weapon. dmg.'), at.weaponmindmg / at.count, df.weaponmindmg / df.count, true)
  //
  q(_('FBS_HIGHEST_DMG_BY_1', 'Highest damage by one fighter'), at.highest_totalcauseddamage,
    df.highest_totalcauseddamage, false)
  q(_('FBS_HIGHEST_SINGLE_SHOT_DMG', 'Highest single shot damage'), at.highest_maxdamage, df.highest_maxdamage, false)
  q(_('FBS_MOST_HITS', 'Most hits'), at.highest_hitcount, df.highest_hitcount, false)
  q(_('FBS_HIGHEST_HIT_PERCENT', 'Highest hits %'), at.highest_hitquote, df.highest_hitquote, true)

  q(_('FBS_MOST_DODGES', 'Most dodges'), at.highest_dodgecount, df.highest_dodgecount, false)
  q(_('FBS_HIGHEST_DODGE_PERCENT', 'Highest dodge %'), at.highest_dodgequote, df.highest_dodgequote, true)
  q(_('FBS_MOST_HITS_TAKEN', 'Most hits taken'), at.highest_takenhits, df.highest_takenhits, false)

  q(_('FBS_MOST_KOS', 'Most KOs'), at.highest_ko_count, df.highest_ko_count, false)
  q(_('FBS_MOST_CRITS', 'Most critical hits'), at.highest_crithits, df.highest_crithits, false)
  q(_('FBS_MOST_GHOSTS', 'Most Ghosts'), at.highest_playdeadcount, df.highest_playdeadcount, false)
  q(_('FBS_MOST_MOVES', 'Most moves'), at.highest_moves, df.highest_moves, false)
  q(_('FBS_MOST_FIELDS_MOVED', 'Most fields moved'), at.highest_fieldsmoved, df.highest_fieldsmoved, true)
  q(_('FBS_MOST_SECTORS_MOVED', 'Most sectors moved'), at.highest_sectorsmoved, df.highest_sectorsmoved, false)

  r(_('FBS_SHOTS_FIRED', 'Shots fired'), at.hitcount + at.misscount, df.hitcount + df.misscount)
  r(_('FBS_SHOTS_FIRED_PERCENT', 'Shots fired%'),
    100.0 * (at.hitcount + at.misscount) / at.personroundsalive54,
    100.0 * (df.hitcount + df.misscount) / df.personroundsalive54, true,
    'Percent of the possible shots fired (assuming at least one target in the line of sight in each round)')
  r(_('FBS_ONLINE_PERCENT', 'Online %'),
    100.0 * (at.onlinecount) / at.personroundsalive54,
    100.0 * (df.onlinecount) / df.personroundsalive54, true,
    'Counting every round online, divided by the number of fighters alive')
}

TWDS.fbs.makebasestats_base = function (content, rdata, extradata) {
  const _ = TWDS._
  const rounds = this.data.result.roundsplayed - 1
  const atall = this.makepersonstats(this.data.result.attackerlist, rounds, extradata.at)
  const dfall = this.makepersonstats(this.data.result.defenderlist, rounds, extradata.def)

  content.textContent = ''

  let outcome = 'Unknown result (' + this.data.battle_outcome + ')'
  switch (this.data.battle_outcome) {
    case 'FINALROUND': outcome = _('FBS_OUTCOME_DEFENDED', 'Fort defended'); break
    case 'FLAGLOST': outcome = _('FBS_OUTCOME_FLAGLOST', 'Flag taken'); break
    case 'ATTACKER_WIPED': outcome = _('FBS_OUTCOME_ATTACKERS_BEATEN', 'Attackers beaten'); break
    case 'DEFENDER_WIPED': outcome = _('FBS_OUTCOME_DEFENDERS_BEATEN', 'Defenders beaten'); break
  }
  let lc = Game.locale.replace('_', '-')
  if (lc === 'en-DK') lc = 'en-GB' // en-dk: 16.52.04, en-GB: 16:52:04

  let dt = new Date(this.data.result_date * 1000)
  dt = dt.toLocaleString(lc)

  TWDS.createEle({
    nodeName: 'p',
    last: content,
    textContent: outcome + ' @ ' + dt
  })

  const tab = TWDS.createEle({
    nodeName: 'table',
    last: content
  })

  TWDS.createEle({
    nodeName: 'thead',
    last: tab,
    children: [
      {
        nodeName: 'tr',
        children: [
          { nodeName: 'th', textContent: _('FBS_ATT_SIDE', 'Attacking side'), className: 'tw_red' },
          { nodeName: 'th', textContent: '' },
          { nodeName: 'th', textContent: _('FBS_DEF_SIDE', 'Defending side'), className: 'tw_blue' }
        ]
      }
    ]
  })

  const tbody = TWDS.createEle({
    nodeName: 'tbody',
    last: tab
  })

  TWDS.createEle({
    nodeName: 'tr',
    last: tbody,
    children: [
      { nodeName: 'td', textContent: this.data.result.attackertownname },
      { nodeName: 'th', textContent: 'Town' },
      { nodeName: 'td', textContent: this.data.result.defendertownname }
    ]
  })

  const r = function (t, a, d, transform, hint) {
    const dotnull = "<span class='dotnull'>&nbsp;&nbsp;</span>"
    if (a instanceof Array) {
      a = a.join(', ')
      d = d.join(', ')
      if (a === '' && d === '') { return }
    } else {
      if (a === 0 && d === 0) return // soldiers ghosting :-)
    }
    if (transform) {
      if (isNaN(a) || !isFinite(a)) {
        a = '-' + dotnull
      } else {
        a = a.toFixed(1)
      }
      if (isNaN(d) || !isFinite(d)) {
        d = '-' + dotnull
      } else {
        d = d.toFixed(1)
      }
    } else {
      if (typeof a === 'number') {
        if (isNaN(a) || !isFinite(a)) {
          a = '-'
        }
        if (isNaN(d) || !isFinite(d)) {
          d = '-'
        }
      }
      a += dotnull
      d += dotnull
    }
    if (hint === null) hint = ''
    const e = TWDS.createEle({
      nodeName: 'tr',
      children: [
        { nodeName: 'td', innerHTML: a },
        { nodeName: 'th', textContent: t },
        { nodeName: 'td', innerHTML: d }
      ]
    })
    if (hint > '') {
      TWDS.q1('th', e).title = hint
    }
    tbody.appendChild(e)
  }

  const at = atall
  const df = dfall

  r(_('FBS_FIGHTERS', 'Fighters'), at.count, df.count, false,
    'The number of fighters at the start of the battle.')
  r(_('FBS_SURVIVORS', 'Survivors'), at.survived, df.survived, false,
    'The number of fighters still standing at the end of the battle.')

  r(_('FBS_HP_AT_START', 'HP at start'), at.starthp, df.starthp, false)
  r(_('FBS_HP_AT_END', 'HP at end'), at.finishedhp, df.finishedhp, false)
  r(_('FBS_HP_LOST', 'HP lost'), at.starthp - at.finishedhp, df.starthp - df.finishedhp, false)

  // sr('totalcauseddamage', 'Damage caused')
  r(_('FBS_TOTAL_DAMAGE_DONE', 'Total damage done'), at.totalcauseddamage, df.totalcauseddamage, false, 'per fighter')

  r(_('FBS_AVERAGE_LEVEL', 'Average level'), at.charlevel / at.count, df.charlevel / df.count, true)

  r(_('FBS_ONLINE_PERCENT', 'Online %'),
    100.0 * (at.onlinecount) / at.personroundsalive54,
    100.0 * (df.onlinecount) / df.personroundsalive54, true,
    'Counting every round online, divided by the number of fighters alive')
}
TWDS.fbs.makebasestats = function () {
  const _ = TWDS._
  const [rdata, extradata] = TWDS.fbs.parselog()
  this.bsw = wman.open('TWDS_fbs_basestats').setMiniTitle(_('FBS_TITLE', 'Statistics'))
  const content = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_fbs_basestats_content'
  })
  TWDS.q1('.tw2gui_window_content_pane', this.bsw.getMainDiv()).appendChild(content)
  TWDS.q1('.tw2gui_window_content_pane', this.bsw.getMainDiv()).classList.add('TWDS_scrollbar')
  this.bsw.addTab('base', 'TWDS_FBS_TAB_BASE', function () {
    TWDS.fbs.bsw.showLoader()
    TWDS.fbs.makebasestats_base(content, rdata, extradata)
    TWDS.fbs.bsw.activateTab('TWDS_FBS_TAB_BASE')
    TWDS.fbs.bsw.hideLoader()
  })
  this.bsw.addTab('all', 'TWDS_FBS_TAB_ALL', function () {
    TWDS.fbs.bsw.showLoader()
    TWDS.fbs.makebasestats_sub(-1, content)
    TWDS.fbs.bsw.activateTab('TWDS_FBS_TAB_ALL')
    TWDS.fbs.bsw.hideLoader()
  })
  this.bsw.setTitle(_('FBS_THE_FIGHT_FOR', 'The fight for: ') + this.data.result.fortname)
  this.bsw.setSize(700, 400)
  TWDS.fbs.bsw.activateTab('TWDS_FBS_TAB_BASE')

  TWDS.fbs.makebasestats_base(content, rdata, extradata)

  const rounds = this.data.result.roundsplayed - 1
  const atall = this.makepersonstats(this.data.result.attackerlist, rounds, extradata.at)
  const dfall = this.makepersonstats(this.data.result.defenderlist, rounds, extradata.def)

  const clname = ['greenhorn', 'adventurer', 'duelist', 'worker', 'soldier']
  for (let i = 0; i < 5; i++) {
    const at = atall.byclass[i]
    const df = dfall.byclass[i]
    if (at.count + df.count === 0) { continue }
    this.bsw.addTab(clname[i], 'TWDS_FBS_TAB_' + clname[i], function () {
      TWDS.fbs.bsw.showLoader()
      TWDS.fbs.makebasestats_sub(i, content)
      TWDS.fbs.bsw.activateTab('TWDS_FBS_TAB_' + clname[i])
      TWDS.fbs.bsw.hideLoader()
    })
  }
  this.bsw.addTab('graphs', 'TWDS_FBS_TAB_GRAPHS', function () {
    TWDS.fbs.bsw.showLoader()
    TWDS.fbs.addgraphs(content, rdata)
    TWDS.fbs.bsw.activateTab('TWDS_FBS_TAB_GRAPHS')
    TWDS.fbs.bsw.hideLoader()
  })
  this.bsw.addTab('log', 'TWDS_FBS_TAB_LOG', function () {
    TWDS.fbs.bsw.showLoader()
    TWDS.fbs.addlog(content)
    TWDS.fbs.bsw.activateTab('TWDS_FBS_TAB_LOG')
    TWDS.fbs.bsw.hideLoader()
  })
}
TWDS.fbs.addgraphs = function (content, rdata) {
  content.textContent = ''
  TWDS.createEle({
    nodeName: 'h3',
    last: content,
    textContent: 'Graphs'
  })
  // content.appendChild(can)
  for (let i = 0; i < TWDS.fbs.graphs.length; i++) {
    const k = 'graph_' + TWDS.fbs.graphs[i]
    try {
      const can = TWDS.fbs[k](rdata)
      content.appendChild(can)
    } catch (e) {
      console.log('fail', k, e)
    }
  }
}
TWDS.fbs.preparecanvas = function (h1, h2, title) {
  const xmain = 550
  const ymain = 250
  const xhead = (636 - xmain) / 3 * 2
  const yhead = 30
  const xfooter = (636 - xmain) / 3 * 1
  const yfooter = 20
  const can = TWDS.createEle({
    nodeName: 'canvas',
    width: xhead + xmain + xfooter,
    height: yhead + ymain + yfooter
  })
  const ctx = can.getContext('2d')
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.fillRect(0, 0, can.width, can.height)
  ctx.fillStyle = 'rgba(220, 220, 220, 0.5)'
  ctx.fillRect(xhead, yhead, xmain, ymain)

  ctx.fillStyle = '#000000'

  ctx.font = '17px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(title, xhead + 20, yhead - 5)

  ctx.font = '14px sans-serif'
  const sizedata = ctx.measureText('ABC123!')
  const lineheight = Math.abs(sizedata.actualBoundingBoxDescent - sizedata.actualBoundingBoxAscent)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'right'
  const ylabel = function (f) {
    let y = ymain / 100 * f
    y = yhead + ymain - y
    let v = Math.round(h1 / 100 * f)
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'right'
    ctx.fillText(v, xhead - 1, y, xhead - 1)
    if (h2 !== null && h2 !== 0) {
      v = Math.round(h2 / 100 * f)
      ctx.textAlign = 'left'
      ctx.fillText(v, xhead + xmain + 1, y, xhead - 1)
    }

    ctx.strokeStyle = '#cccccc'
    if (f > 0.1 && f < 99.9) {
      ctx.beginPath()
      ctx.moveTo(xhead, y)
      ctx.lineTo(xhead + xmain - 1, y)
      ctx.stroke()
    }
  }
  const xlabel = function (rd) {
    const y = ymain + yhead + lineheight + 1
    const x = xhead + (rd - 2) * 10
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    ctx.fillText(rd, x, y)
    ctx.strokeStyle = '#cccccc'
    if (rd > 2 && rd < 56) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, yhead)
      ctx.stroke()
    }
  }
  for (let i = 8; i >= 0; i--) {
    ylabel(100 / 8 * i)
  }
  xlabel(2)
  for (let i = 5; i < 55; i += 5) {
    xlabel(i)
  }
  xlabel(55)
  can._twds_xhead = xhead
  can._twds_yhead = yhead
  can._twds_xmain = xmain
  can._twds_ymain = ymain
  return can
}

TWDS.fbs.fillcanvas = function (can, rdata, who, k, vgl, xoff, sz, color, mode) {
  mode = mode || 'dot'
  const ctx = can.getContext('2d')
  const ybase = can._twds_ymain + can._twds_yhead
  const ymain = can._twds_ymain
  if (mode === 'line') {
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = sz
    if (sz === 1) {
      ctx.setLineDash([1, 1])
    }
  }

  for (let rd = 2; rd < rdata.length; rd++) {
    const xpos = can._twds_xhead + (rd - 2) * 10 + xoff
    const v = rdata[rd][who][k]
    const f = v / vgl
    const y = ybase - ymain * f
    ctx.fillStyle = color
    if (mode === 'dot') {
      if (v > 0) {
        ctx.fillRect(xpos, y, sz, sz)
      }
    } else if (mode === 'bar') {
      ctx.fillRect(xpos, y, sz, ybase - y)
    } else if (mode === 'line') {
      if (rd === 2) {
        ctx.moveTo(xpos, y)
      } else {
        ctx.lineTo(xpos, y)
      }
    }
  }
  if (mode === 'line') {
    ctx.stroke()
  }
}

TWDS.fbs.graph_healthandguns = function (rdata) {
  const h = Math.max(rdata[2].at.health, rdata[2].def.health)
  const f = Math.max(rdata[2].at.fighters, rdata[2].def.fighters)
  const can = TWDS.fbs.preparecanvas(h, f,
    TWDS._('FBS_GRAPHTITLE_HEALTH', 'Health (solid) and Guns (dotted)'))
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'health', h, 0, 2, '#900', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'health', h, 0, 2, '#009', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'fighters', f, 0, 1, '#900', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'fighters', f, 0, 1, '#009', 'line')
  return can
}
TWDS.fbs.graph_damage = function (rdata) {
  let md = 0
  for (let rd = 2; rd < rdata.length; rd++) {
    md = Math.max(md, rdata[rd].at.damagedone)
    md = Math.max(md, rdata[rd].def.damagedone)
  }
  const can = TWDS.fbs.preparecanvas(md, null,
    TWDS._('FBS_GRAPHTITLE_DAMAGE', 'Damage done per round'))
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'damagedone', md, 0, 5, '#900', 'bar')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'damagedone', md, 5, 5, '#009', 'bar')
  return can
}
TWDS.fbs.graph_kills = function (rdata) {
  let mk = 0
  for (let rd = 2; rd < rdata.length; rd++) {
    mk = Math.max(mk, rdata[rd].at.killed)
    mk = Math.max(mk, rdata[rd].def.killed)
  }
  const can = TWDS.fbs.preparecanvas(mk, null,
    TWDS._('FBS_GRAPHTITLE_KILLS', 'Kills'))
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'killed', mk, 0, 5, '#900', 'bar')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'killed', mk, 5, 5, '#009', 'bar')
  return can
}
TWDS.fbs.graph_moves = function (rdata) {
  let md = 0
  for (let rd = 2; rd < rdata.length; rd++) {
    md = Math.max(md, rdata[rd].at.moved)
    md = Math.max(md, rdata[rd].def.moved)
  }
  const can = TWDS.fbs.preparecanvas(md, null,
    TWDS._('FBS_GRAPHTITLE_MOVES', 'Moves'))
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'moved', md, 0, 5, '#900', 'bar')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'moved', md, 5, 5, '#009', 'bar')
  return can
}
TWDS.fbs.graph_bumps = function (rdata) {
  let m = 0
  for (let rd = 2; rd < rdata.length; rd++) {
    m = Math.max(m, rdata[rd].at.bumps)
    m = Math.max(m, rdata[rd].def.bumps)
  }
  const can = TWDS.fbs.preparecanvas(m, null,
    TWDS._('FBS_GRAPHTITLE_BUMPS', 'Bumps'))
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'bumps', m, 0, 5, '#900', 'bar')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'bumps', m, 5, 5, '#009', 'bar')
  return can
}
TWDS.fbs.graph_shots = function (rdata) {
  let m = 0
  for (let rd = 2; rd < rdata.length; rd++) {
    m = Math.max(m, rdata[rd].at.shots)
    m = Math.max(m, rdata[rd].def.shots)
  }
  const can = TWDS.fbs.preparecanvas(m, null,
    TWDS._('FBS_GRAPHTITLE_SHOTS', 'Shots'))
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'shots', m, 0, 5, '#900', 'bar')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'shots', m, 5, 5, '#009', 'bar')
  return can
}
TWDS.fbs.graph_shotrate = function (rdata) {
  let m = 0
  for (let rd = 2; rd < rdata.length; rd++) {
    rdata[rd].at.shotrate = 100 * rdata[rd].at.shots / Math.max(1, rdata[rd].at.fighters)
    rdata[rd].def.shotrate = 100 * rdata[rd].def.shots / Math.max(1, rdata[rd].def.fighters)
    m = Math.max(m, rdata[rd].at.shots)
    m = Math.max(m, rdata[rd].def.shots)
  }
  const can = TWDS.fbs.preparecanvas(m, null,
    TWDS._('FBS_GRAPHTITLE_SHOTPERCENTAGE', 'Shots (solid) and Shot percentage (dotted)'))
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'shots', m, 0, 2, '#900', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'shots', m, 0, 2, '#009', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'shotrate', 100, 0, 1, '#900', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'shotrate', 100, 0, 1, '#009', 'line')
  return can
}
TWDS.fbs.graph_bonus = function (rdata) {
  let m = 0
  for (let rd = 2; rd < rdata.length; rd++) {
    rdata[rd].at.bonusp = 100 * rdata[rd].at.onbonusposition / Math.max(1, rdata[rd].at.fighters)
    rdata[rd].def.bonusp = 100 * rdata[rd].def.onbonusposition / Math.max(1, rdata[rd].def.fighters)
    m = Math.max(m, rdata[rd].at.onbonusposition)
    m = Math.max(m, rdata[rd].def.onbonusposition)
  }
  const can = TWDS.fbs.preparecanvas(m, 100,
    TWDS._('FBS_GRAPHTITLE_BONUS', 'Fighters on bonus positions (solid) and percentage thereof (dotted)'))
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'onbonusposition', m, 0, 2, '#900', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'onbonusposition', m, 0, 2, '#009', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'bonusp', 100, 0, 1, '#900', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'bonusp', 100, 0, 1, '#009', 'line')
  return can
}
TWDS.fbs.graph_online = function (rdata) {
  let m = 0
  for (let rd = 2; rd < rdata.length; rd++) {
    rdata[rd].at.onlinep = 100 * rdata[rd].at.online / Math.max(1, rdata[rd].at.fighters)
    rdata[rd].def.onlinep = 100 * rdata[rd].def.online / Math.max(1, rdata[rd].def.fighters)
    m = Math.max(m, rdata[rd].at.online)
    m = Math.max(m, rdata[rd].def.online)
  }
  const can = TWDS.fbs.preparecanvas(m, 100,
    TWDS._('FBS_GRAPHTITLE_BONUS', 'Onliners (solid) and percentage thereof (dotted)'))
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'online', m, 0, 2, '#900', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'online', m, 0, 2, '#009', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'onlinep', 100, 0, 1, '#900', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'onlinep', 100, 0, 1, '#009', 'line')
  return can
}
TWDS.fbs.graph_hits = function (rdata) {
  let m = 0
  for (let rd = 2; rd < rdata.length; rd++) {
    rdata[rd].at.hitp = 100 * rdata[rd].at.hits / Math.max(1, rdata[rd].at.shots)
    rdata[rd].def.hitp = 100 * rdata[rd].def.hits / Math.max(1, rdata[rd].def.shots)
    m = Math.max(m, rdata[rd].at.hits)
    m = Math.max(m, rdata[rd].def.hits)
  }
  const can = TWDS.fbs.preparecanvas(m, 100,
    TWDS._('FBS_GRAPHTITLE_BONUS', 'Hits (solid) and hit percentage (dotted)'))
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'hits', m, 0, 2, '#900', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'hits', m, 0, 2, '#009', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'hitp', 100, 0, 1, '#900', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'hitp', 100, 0, 1, '#009', 'line')
  return can
}
TWDS.fbs.graph_distance = function (rdata) {
  let m = 0
  for (let rd = 2; rd < rdata.length; rd++) {
    rdata[rd].at.hitp = 100 * rdata[rd].at.hits / Math.max(1, rdata[rd].at.shots)
    rdata[rd].def.hitp = 100 * rdata[rd].def.hits / Math.max(1, rdata[rd].def.shots)
    rdata[rd].at.avgdist = rdata[rd].at.totaldistance / Math.max(1, rdata[rd].at.shots)
    rdata[rd].def.avgdist = rdata[rd].def.totaldistance / Math.max(1, rdata[rd].def.shots)

    m = Math.max(m, rdata[rd].at.avgdist)
    m = Math.max(m, rdata[rd].def.avgdist)
  }
  const can = TWDS.fbs.preparecanvas(m, 100,
    TWDS._('FBS_GRAPHTITLE_BONUS', 'Average distance (solid) and hit percentage (dotted)'))
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'avgdist', m, 0, 2, '#900', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'avgdist', m, 0, 2, '#009', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'at', 'hitp', 100, 0, 1, '#900', 'line')
  TWDS.fbs.fillcanvas(can, rdata, 'def', 'hitp', 100, 0, 1, '#009', 'line')
  return can
}

TWDS.fbs.showStatUpdateTable = function (data) {
  if (!TWDS.settings.misc_fortbattle_statistics) {
    return CemeteryWindow._TWDS_backup_showStatUpdateTable.apply(this, arguments)
  }
  TWDS.fbs.data = data
  const ret = CemeteryWindow._TWDS_backup_showStatUpdateTable.apply(this, arguments)
  const container = TWDS.createEle({
    nodeName: 'div',
    style: {
      position: 'absolute',
      left: '-12px',
      top: '50px',
      display: 'inline-block'
    }
  })
  const b1 = TWDS.createEle({
    nodeName: 'button',
    textContent: 'FBS',
    id: 'TWDS_fbs_f',
    className: 'TWDS_button',
    title: 'Basic fort battle statistics'
  })
  container.appendChild(b1)
  const cp = TWDS.q1('.tw2gui_window.cemetery .tw2gui_window_content_pane')
  if (cp) {
    cp.appendChild(container)
  }
  b1.onclick = function () {
    TWDS.fbs.makebasestats.apply(TWDS.fbs, arguments)
  }
  return ret
}

TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'misc_fortbattle_statistics',
    TWDS._('FBS_SETTING', 'Add a button to the graveyard to show fortbattle statistics'), true, null, 'misc')
  // give TW Toolkit time to patch the original functions. Yes, it patches them.
  window.setTimeout(function () {
    CemeteryWindow._TWDS_backup_showStatUpdateTable = CemeteryWindow.showStatUpdateTable
    CemeteryWindow.showStatUpdateTable = TWDS.fbs.showStatUpdateTable
  }, 10 * 1000)
})

// used when reloading, so the updated code will be used.
if ('_TWDS_backup_showStatUpdateTable' in CemeteryWindow) {
  CemeteryWindow.showStatUpdateTable = TWDS.fbs.showStatUpdateTable
  console.log('fbs.js reloaded')
}

// vim: tabstop=2 shiftwidth=2 expandtab
