// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.fbs = {}
TWDS.fbs.data = {}
TWDS.fbs.bsw = null

TWDS.fbs.makepersonstats = function (a, r) {
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
    highest_dodgequote: Object.assign({}, fuddle2)
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
    } else if (d[k] === o[k2].value) {
      o[k2].by.push(d.name);
    }
    if (d[k] > o.byclass[cl][k2].value) {
      o.byclass[cl][k2].value = d[k]
      o.byclass[cl][k2].by= [d.name]
    } else if (d[k] === o.byclass[cl][k2].value && d[k]) {
      o.byclass[cl][k2].by.push(d.name)
    }
  }

  for (let i = 0; i < a.length; i++) {
    const d = a[i]
    const cl = d.charclass + 1

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
  }
  return o
}
TWDS.fbs.makebasestats = function () {
  this.bsw = wman.open('TWDS_fbs_basestats').setMiniTitle('Basic statistics')
  this.bsw.setTitle('Basic statistics')
  this.bsw.setSize(700, 400)
  const content = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_fbs_basestats_content'
  })

  TWDS.q1('.tw2gui_window_content_pane', this.bsw.getMainDiv()).appendChild(content)
  TWDS.q1('.tw2gui_window_content_pane', this.bsw.getMainDiv()).classList.add('TWDS_scrollbar')

  console.log(this)
  let outcome = 'Unknown result (' + this.data.battle_outcome + ')'
  switch (this.data.battle_outcome) {
    case 'FINALROUND': outcome = 'Fort defended'; break
    case 'FLAGLOST': outcome = 'Flag taken'; break
    case 'ATTACKER_WIPED': outcome = 'Attackers beaten'; break
    case 'DEFENDER_WIPED': outcome = 'Defenders beaten'; break
  }
  let lc = Game.locale.replace('_', '-')
  if (lc === 'en-DK') lc = 'en-GB' // en-dk: 16.52.04, en-GB: 16:52:04

  let dt = new Date(this.data.result_date * 1000)
  dt = dt.toLocaleString(lc)

  const h3 = TWDS.createEle({
    nodeName: 'h3',
    textContent: 'The fight for ' + this.data.result.fortname
  })
  content.appendChild(h3)

  const p = TWDS.createEle({
    nodeName: 'p',
    textContent: outcome + ' @ ' + dt
  })
  content.appendChild(p)

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
          { nodeName: 'th', textContent: 'Attacking side' },
          { nodeName: 'th', textContent: '' },
          { nodeName: 'th', textContent: 'Defending side' }
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

  const atall = this.makepersonstats(this.data.result.attackerlist, rounds)
  const dfall = this.makepersonstats(this.data.result.defenderlist, rounds)

  tbody.appendChild(TWDS.createEle({
    nodeName: 'tr',
    children: [
      { nodeName: 'td', textContent: this.data.result.attackertownname },
      { nodeName: 'th', textContent: 'Town' },
      { nodeName: 'td', textContent: this.data.result.defendertownname }
    ]
  }))
  tbody.appendChild(TWDS.createEle({
    nodeName: 'tr',
    children: [
      { nodeName: 'td', textContent: this.data.attacker_count },
      { nodeName: 'th', textContent: 'Fighters' },
      { nodeName: 'td', textContent: this.data.defender_count }
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
        a="-"+dotnull;
      } else {
        a = a.toFixed(1)
      }
      if (isNaN(d) || !isFinite(d)) {
        d="-"+dotnull;
      } else {
        d = d.toFixed(1)
      }
    } else {
      if (typeof a === "number") {
        if (isNaN(a) || !isFinite(a)) {
          a="-"
        }
        if (isNaN(d) || !isFinite(d)) {
          d="-"
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
    let av=a.value
    let dv=d.value
    if (isNaN(av) || !isFinite(av)) {
      if (transform) {
        av="-"+dotnull;
      } else {
        av="-"
      }
    } else {
      if (transform) {
        av = av.toFixed(1)
      }
    }
    if (isNaN(dv) || !isFinite(dv)) {
      if (transform) {
        dv="-"+dotnull;
      } else {
        dv="-"
      }
    } else {
      if (transform) {
        dv = dv.toFixed(1)
      }
    }
    if (a.by.length===1 && d.by.length===1) {
      av=a.by[0]+": "+av;
      dv=d.by[0]+": "+dv;
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
    if (a.by.length!==1 || d.by.length!==1) {
      const f = TWDS.createEle({
        nodeName: 'tr',
        children: [
          { nodeName: 'td', innerHTML: a.by.join(", ") },
          { nodeName: 'th', textContent: t+" by" },
          { nodeName: 'td', innerHTML: d.by.join(", ") }
        ]
      })
      tbody.appendChild(f)
    }

  }
  const clname = ['Greenhorns', 'Adventurers', 'Duelists', 'Worker', 'Soldiers']
  for (let i = -1; i < 5; i++) {
    let at
    let df
    if (i === -1) {
      at = atall
      df = dfall
    } else {
      at = atall.byclass[i]
      df = dfall.byclass[i]
    }
    if (at.count + df.count === 0) { continue }
    if (i === -1) {
      tbody.appendChild(subhead('Over all character classes'))
    } else {
      tbody.appendChild(subhead(clname[i]))
    }
    r('Fighters', at.count, df.count, false,
      'The number of fighters at the start of the battle.')
    r('Survivors', at.survived, df.survived, false,
      'The number of fighters still standing at the end of the battle.')
    r('Avg. # of fighters alive.', at.personroundsalive / rounds, df.personroundsalive / rounds, true,
      'Counted over time, not a simple average.')

    r('HP at start', at.starthp, df.starthp, false)
    r('HP at end', at.finishedhp, df.finishedhp, false)
    r('Most HP', at.highest_starthp.value, df.highest_starthp.value, false)
    r('Most HP by', at.highest_starthp.by, df.highest_starthp.by, false)
    r('Missing HP at start', at.maxhp-at.starthp, df.maxhp-df.starthp, false,
      "The amount of HP not filled up")
    r('HP lost', at.starthp - at.finishedhp, df.starthp - df.finishedhp, false)
    r('HP average', at.starthp / at.count, df.starthp / df.count, true, 'Total start HP divided by fighters')

    // sr('totalcauseddamage', 'Damage caused')
    r('Total damage done', at.totalcauseddamage, df.totalcauseddamage, true, 'per fighter')
    r('Average damage done', at.totalcauseddamage / at.count, df.totalcauseddamage / df.count, true, 'per fighter')
    r('... per hit', at.totalcauseddamage / at.hitcount, df.totalcauseddamage / df.hitcount, true)
    r('Average hits done', at.hitcount / at.count, df.hitcount / df.count, true)
    r('Average missed shots', at.misscount / at.count, df.misscount / df.count, true)

    r('Average damage taken', df.totalcauseddamage / at.count, at.totalcauseddamage / df.count, true)
    r('Average dodged shots', at.dodgecount / at.count, df.dodgecount / df.count, true)
    r('Average hits taken', at.takenhits / at.count, df.takenhits / df.count, true)

    r('KOs achieved', at.ko_count, df.ko_count)
    r('Critical hits', at.crithits, df.crithits)
    r('Ghosts', at.playdeadcount, df.playdeadcount)

    r('Total levels', at.charlevel, df.charlevel)
    r('Average level', at.charlevel / at.count, df.charlevel / df.count, true)
    q('Highest level', at.highest_charlevel, df.highest_charlevel, false)
    // r('Highest level by', at.highest_charlevel.by, df.highest_charlevel.by, false)
    // r('Avg. # of levels alive.', at.personlevelroundsalive/rounds, df.personlevelroundsalive/rounds, true)

    r('Average max weapon. dmg.', at.weaponmaxdmg / at.count, df.weaponmaxdmg / df.count, true)
    r('Average min weapon. dmg.', at.weaponmindmg / at.count, df.weaponmindmg / df.count, true)
    //
    q('Highest damage by one fighter ', at.highest_totalcauseddamage,
      df.highest_totalcauseddamage, false)
    q('Highest single shot damage', at.highest_maxdamage, df.highest_maxdamage, false)
    q('Most hits', at.highest_hitcount, df.highest_hitcount, false)
    q('Highest hits %', at.highest_hitquote, df.highest_hitquote, true)

    q('Most dodges', at.highest_dodgecount, df.highest_dodgecount, false)
    q('Highest dodge %', at.highest_dodgequote, df.highest_dodgequote, true)
    q('Most hits taken', at.highest_takenhits, df.highest_takenhits, false)

    q('Most KOs', at.highest_ko_count, df.highest_ko_count, false)
    q('Most critical hits', at.highest_crithits, df.highest_crithits, false)
    q('Most Ghosts', at.highest_playdeadcount, df.highest_playdeadcount, false)

    r('Shots fired', at.hitcount + at.misscount, df.hitcount + df.misscount)
    r('Shots fired%',
      100.0 * (at.hitcount + at.misscount) / at.personroundsalive54,
      100.0 * (df.hitcount + df.misscount) / df.personroundsalive54, true,
      'Percent of the possible shots fired (assuming at least one target in the line of sight in each round)')
    r('Online %',
      100.0 * (at.onlinecount) / at.personroundsalive54,
      100.0 * (df.onlinecount) / df.personroundsalive54, true,
      'Counting every round online, divided by the number of fighters alive')
  }
}
TWDS.fbs.showStatUpdateTable = function (data) {
  if (!TWDS.settings.misc_fortbattle_statistics) {
    return;
  }
  TWDS.fbs.data = data
  const ret = CemeteryWindow._TWDS_backup_showStatUpdateTable.apply(this, arguments)
  console.log('fbs open', data)
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
    className: "TWDS_button",
    title: "Basic fort battle statistics",
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
  CemeteryWindow._TWDS_backup_showStatUpdateTable = CemeteryWindow.showStatUpdateTable
  CemeteryWindow.showStatUpdateTable = TWDS.fbs.showStatUpdateTable
  TWDS.registerSetting("bool", "misc_fortbattle_statistics",
      "Add a button to the graveyard to show Basic Fortbattle Statistics", true, null, "misc") {
})

// used when reloading, so the updated code will be used.
if ('_TWDS_backup_showStatUpdateTable' in CemeteryWindow) {
  CemeteryWindow.showStatUpdateTable = TWDS.fbs.showStatUpdateTable
  console.log('fbs.js reloaded')
}

// vim: tabstop=2 shiftwidth=2 expandtab
