// um Doppelzählungen zu vermeiden
TWDS.getLastKnownDuel = function getLastKnownDuel () {
  const tmp = window.localStorage.getItem('TWDS_lastknown')
  if (tmp === null) return {}
  return JSON.parse(tmp)
}

TWDS.clearDuels = function () {
  const toDelete = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)
    if (!k.match(/^TWDS_p_/)) {
      continue
    }
    toDelete.push(k)
  }
  for (let i = 0; i < toDelete.length; i++) {
    window.localStorage.removeItem(toDelete[i])
  }
  window.localStorage.removeItem('TWDS_lastknown')
}
// idea and algorithm takes from clothcalc. RIP.
TWDS.getServerPause = function () {
  if (!('last' in TWDS.getServerPause)) {
    TWDS.getServerPause.last = 0
    TWDS.getServerPause.shortCounter = 0
    TWDS.getServerPause.longCounter = 0
  }
  const now = new Date().getTime()
  if (now - TWDS.getServerPause.last < 2e3) {
    TWDS.getServerPause.shortCounter++
  } else {
    TWDS.getServerPause.shortCounter = 0
  }
  if (now - TWDS.getServerPause.last < 6e4) {
    TWDS.getServerPause.longCounter++
  } else {
    TWDS.getServerPause.longCounter = 0
  }
  TWDS.getServerPause.last = now
  let t = 0
  if (TWDS.getServerPause.longCounter > 50) {
    t = 6e4
  }
  if (TWDS.getServerPause.shortCounter < 20) {
    return t + 200
  }
  return t + 2e3
}
TWDS.readDuels = function () {
  const rxWinner = TWDS._('REGEX_DUEL_WON', '>([^>]+) won the duel')
  const rxWages = TWDS._('REGEX_DUEL_WAGES', 'Wages" .><.th><td>([^<]+)')
  const rxXP = TWDS._('REGEX_DUEL_XP', 'Experience points" .><.th><td>([^<]+)')
  const rxDamage = TWDS._('REGEX_DUEL_DAMAGE', 'Damage" .><.th><td>([^<]+)')
  const rxMeHasAttacked = TWDS._('REGEX_DUEL_ME_HAS_ATTACKED', '^Duel: $me$ vs. (.+)',
    { me: Character.name })
  const rxMeWasAttacked = TWDS._('REGEX_DUEL_ME_WAS_ATTACKED', '^Duel: (.*) vs. $me$',
    { me: Character.name })
  const lastKnown = TWDS.getLastKnownDuel()
  const firstReadDuel = {}
  const handleOneLoad = function (pageno) {
    console.log('H1L', pageno)
    const info = document.getElementById('TWDS_peoplelist_import_info')
    info.textContent = ' (#' + pageno + ')'
    Ajax.remoteCall('reports', 'get_reports', {
      page: pageno,
      folder: 'duel'
    }, function (json) {
      console.log('H1L got', json, json.page < json.count)
      const found = parseIt(json.reports)
      console.log('found?', found)
      if ('hash' in firstReadDuel) {
        const tmp = JSON.stringify(firstReadDuel)
        window.localStorage.setItem('TWDS_lastknown', tmp)
      }
      let doDeleteInfo = 1
      if (!found) {
        if (json.page < json.count) {
          const pause = TWDS.getServerPause()
          console.log('pausing', pause, 'ms')
          if (pause > 1000) {
            info.textContent = ' (#' + pageno + ', ' + Math.round(pause / 1000) + 's)'
          }
          setTimeout(function () {
            handleOneLoad(json.page + 1)
          }, pause)
          doDeleteInfo = 0
        }
      }
      if (doDeleteInfo) {
        info.textContent = ''
        TWDS.activatePeopleTab()
      }
    }, MessagesWindow)
  }
  // this is a really bad localization, but i hope it's enough. Otherwise we need another translation...
  const mangleDate = function (d) {
    const rxToday = TWDS._('REGEX_DUELREPORT_TODAY', ':')
    if (!(d.match(rxToday))) return d
    return new Date().toLocaleDateString('de', { year: '2-digit', month: 'short', day: 'numeric' })
  }
  const getCmpDate = function (d) {
    const pad = function (number) {
      if (number < 10) {
        return '0' + number
      }
      return number
    }
    const dt = new Date(d)

    return dt.getFullYear() +
    '-' + pad(dt.getMonth() + 1) +
    '-' + pad(dt.getDate())
  }
  const handleDuel = function (report, ti) {
    const p = report.popupData
    let win = p.match(rxWinner)
    win = win[1]
    let lohn = p.match(rxWages)
    lohn = lohn[1]
    let xp = p.match(rxXP)
    xp = xp[1]
    let schaden = p.match(rxDamage)
    schaden = schaden[1].match(/([0-9]+) -- ([0-9]+)/)
    let sch1 = schaden[1]
    let sch2 = schaden[2]

    const me = Character.name
    let other = ti.match(rxMeHasAttacked)
    let iAmAttacker = 1
    if (!other) {
      other = ti.match(rxMeWasAttacked)
      iAmAttacker = 0
    }
    if (!other) return
    other = other[1]

    lohn = lohn.replace(/\./g, '')
    lohn = parseInt(lohn)
    sch1 = sch1.replace(/\./g, '')
    sch1 = parseInt(sch1)
    sch2 = sch2.replace(/\./g, '')
    sch2 = parseInt(sch2)
    xp = xp.replace(/\./g, '')
    xp = parseInt(xp)

    const key = 'TWDS_p_' + other
    let s = window.localStorage.getItem(key)
    if (!s) {
      s = {
        win_me: 0,
        win_other: 0,
        dollars_won_me: 0,
        dollars_won_other: 0,
        dmg_done_me: 0,
        dmg_done_other: 0,
        xp_got_me: 0,
        xp_got_other: 0,
        me_has_attacked: 0,
        me_won_attacking: 0,
        me_won_defending: 0,
        list: []
      }
    } else {
      s = JSON.parse(s)
    }
    if (!('list' in s)) {
      s.list = []
    }
    // we have a sorted list after the first import:
    // push:     [12. Jan, 11. Jan, 10. Jan, 10. Jan]
    // unshift:  [10, 10, 11, 12]
    // because we appended older duels to the list during the import.
    // Now we read new ones: 15, 14, 13
    // push:     [12, 11, 10, 10, 15, 14, 13]
    // unshift:  [13, 14, 15, 12, 11, 10, 10]
    // clearly both simple solutions might be disputed.

    // we could read und store everything in memory, then process the entries in reverse order.
    // i just hate it. i want to get rid of the data ASAP, and not wait for 500 pages of duels.

    // so we "simply" store another date, in numerical representation, and sort the fucking duel
    // list during presentation.

    const dueldate = mangleDate(report.date_received)
    const cmpdate = getCmpDate(dueldate)
    const one = {
      date: dueldate,
      cmpdate: cmpdate,
      report_id: report.report_id,
      hash: report.hash,
      iAmAttacker: iAmAttacker,
      iAmWinner: me === win,
      DollarsIWon: (me === win ? lohn : 0),
      DollarsOpponentWon: (me === win ? 0 : lohn),
      iMadeDamage: (iAmAttacker ? sch2 : sch1),
      OppMadeDamage: (iAmAttacker ? sch1 : sch2),
      iGotXP: (me === win ? xp : 0),
      OppGotXP: (me === win ? 0 : xp)
    }
    s.list.push(one)

    if (win === me) {
      s.win_me++
      s.dollars_won_me += lohn
      s.xp_got_me += xp
    } else {
      s.win_other++
      s.dollars_won_other += lohn
      s.xp_got_other += xp
    }
    if (iAmAttacker) {
      s.dmg_done_me += sch2
      s.dmg_done_other += sch1
      s.me_has_attacked += 1
      if (win === me) {
        s.me_won_attacking += 1
      }
    } else {
      s.dmg_done_me += sch1
      s.dmg_done_other += sch2
      if (win === me) {
        s.me_won_defending += 1
      }
    }
    s = JSON.stringify(s)
    window.localStorage.setItem(key, s)
    console.log('Jout', key, s)
  }
  const parseIt = function (reps) {
    const rx = /^Duel/
    console.log('parseIt', reps)
    for (const r of Object.values(reps)) {
      const ti = r.title
      if (lastKnown.report_id === r.report_id || lastKnown.hash === r.hash) {
        console.log('id', r.report_id, 'or hash', r.hash, 'known')
        return true
      }
      console.log('parseIt1', ti, r)
      if (rx.exec(ti)) {
        console.log('may be duell', ti, r)
        handleDuel(r, ti)
        if (!('hash' in firstReadDuel)) {
          firstReadDuel.hash = r.hash
          firstReadDuel.report_id = r.report_id
        }
      }
    }
    return false
  }
  handleOneLoad(1)
}
window.dust = TWDS.readDuels
