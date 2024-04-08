// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.people = {}
TWDS.people.getmon = function (str) {
  switch (str) {
    case 'Jan':
    case 'Jan.':
      return 0
    case 'Feb':
    case 'Feb.':
      return 1
    case 'Mar':
    case 'Mar.':
    case 'Mär':
    case 'Mär.':
    case 'März':
      return 2
    case 'Apr':
    case 'Apr.':
      return 3
    case 'May':
    case 'May.':
    case 'Mai':
    case 'Mai.':
      return 4
    case 'Jun':
    case 'Jun.':
      return 5
    case 'Jul':
    case 'Jul.':
      return 6
    case 'Aug':
    case 'Aug.':
      return 7
    case 'Sep':
    case 'Sep.':
      return 8
    case 'Oct':
    case 'Oct.':
    case 'Okt':
    case 'Okt.':
      return 9
    case 'Nov':
    case 'Nov.':
      return 10
    case 'Dec':
    case 'Dec.':
    case 'Dez':
    case 'Dez.':
      return 11
  }
  return -1
}
TWDS.people.getbyname = function (name) {
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
  const key = 'TWDS_p_' + name
  let histdata = window.localStorage.getItem(key)

  if (!histdata) return false
  try {
    histdata = JSON.parse(histdata)
  } catch (e) {
    TWDS.error('people.getbyname', 'failed to parse data for ', name)
    return false
  }
  let fixed = false
  for (let i = 0; i < histdata.list.length; i++) {
    const d = histdata.list[i]
    // we need to fix that somewhere, why not directly here?
    if (d.cmpdate.includes('NaN')) {
      // i really screwed up here.
      // 9 Dez 22
      // 16. Dez. 22
      // 19 Mär 23 (even on the int servers)
      // 061223
      // 28042023
      const s = d.date
      let ts = null
      if (s.length === 6) {
        ts = new Date('20' + s.substr(4, 2),
          parseInt(s.substr(2, 2)) - 1,
          parseInt(s.substr(0, 2)))
      }
      if (s.length === 8) {
        ts = new Date(s.substr(4, 4),
          parseInt(s.substr(2, 2)) - 1,
          parseInt(s.substr(0, 2)))
      }
      if (!ts) {
        let t = s.match(/^([0-9]+)\.?\s+(\S+)\s+(\d+)$/)
        if (!t) {
          t = s.match(/^ ([0-9])\.?\s+(\S+)\s+(\d+)$/)
        }
        if (t) {
          const mon = TWDS.people.getmon(t[2])
          if (mon === -1) {
            console.log('bad mon', t[2])
          } else {
            ts = new Date('20' + t[3],
              mon,
              t[1])
            // console.log("FIX",s,t,t[3],mon,t[1],"=>",ts);
          }
        } else {
          console.log('t bad', t)
        }
      }

      if (ts) {
        d.cmpdate = getCmpDate(ts)
      }
    }
    if (d.cmpdate.includes('NaN')) {
      console.log('unfixed cmpdate', name, d)
    } else {
      fixed = true
    }
  }
  if (fixed) {
    // console.log("FIXED",name,histdata);
  }
  return histdata
}

TWDS.peopleSort = function (tab, key) {
  if (tab == null) { // for ease of debugging
    tab = document.querySelector('#TWDS_people')
  }
  const tbody = tab.querySelector('tbody')
  const rowColl = tab.querySelectorAll('tbody .datarow')
  const rows = []
  for (let i = 0; i < rowColl.length; i++) {
    const row = rowColl[i]
    const td = row.querySelector('[data-field=' + key + ']')
    if (key === 'name') {
      row.sortval = td.textContent
    } else {
      row.sortval = parseFloat(td.textContent)
    }
    rows.push(row)
  }

  rows.sort(function (a, b) {
    if (key === 'name') {
      return a.sortval.localeCompare(b.sortval)
    } else {
      return b.sortval - a.sortval
    }
  })

  tbody.textContent = ''
  for (let i = 0; i < rows.length; i++) {
    tbody.appendChild(rows[i])
  }
}

TWDS.initPeopleList = function (tab) {
  const appOneHead = function (tr, ti, dn, cs = 0, mouseover = '') {
    const td = document.createElement('th')
    td.textContent = ti
    td.dataset.field = dn
    tr.appendChild(td)
    if (cs) {
      td.colspan = cs.toString()
      td.setAttribute('colspan', cs.toString())
    }
    if (mouseover > '') { td.title = mouseover }
  }
  const appOneBody = function (tr, ti, dn, mouseover = '') {
    const td = document.createElement('td')
    td.textContent = ti
    td.dataset.field = dn
    tr.appendChild(td)
    if (mouseover > '') { td.title = mouseover }
  }
  tab.innerHTML = ''
  const thead = document.createElement('thead')
  tab.appendChild(thead)

  const tr0 = document.createElement('tr')
  const tr1 = document.createElement('tr')
  tr1.className = 'sortTriggerRow'
  thead.appendChild(tr0)
  thead.appendChild(tr1)
  appOneHead(tr0, '', '')
  appOneHead(tr1, TWDS._('PEOPLETAB_MENU_OPPONENT', 'Opponent'), 'name', 0,
    TWDS._('PEOPLETAB_MENU_OPPONENT_MOUSEOVER', 'The name of the opponent.'))
  appOneHead(tr0, TWDS._('PEOPLETAB_MENU_DUELS', 'Duels'), '', 4)
  appOneHead(tr1, TWDS._('PEOPLETAB_MENU_TOTAL', 'Total'), 'num', 0,
    TWDS._('PEOPLETAB_MENU_TOTAL_MOUSEOVER', 'The total number of duels.'))
  appOneHead(tr1, TWDS._('PEOPLETAB_MENU_VICTORIES', 'Win'), 'won', 0,
    TWDS._('PEOPLETAB_MENU_VICTORIES_MOUSEOVER', 'The number of duel you won.'))
  appOneHead(tr1, TWDS._('PEOPLETAB_MENU_LOSSES', 'Los'), 'lost', 0,
    TWDS._('PEOPLETAB_MENU_LOSSES_MOUSEOVER', 'The number of duel you lost.'))
  appOneHead(tr1, TWDS._('PEOPLETAB_MENU_PLUSMINUS', '+-'), 'plusminus', 0,
    TWDS._('PEOPLETAB_MENU_PLUSMINUS_MOUSEOVER', 'The win/loss difference.'))
  appOneHead(tr0, TWDS._('PEOPLETAB_MENU_DOLLAR', 'Dollar'), '')
  appOneHead(tr1, TWDS._('PEOPLETAB_MENU_DOLLARSUM', 'Sum'), 'dollar', 0,
    TWDS._('PEOPLETAB_MENU_DOLLARSUM_MOUSEOVER', 'The sum of dollars won by you minus the sum other dollars won by the opponent. This does not account for the additional loss with KOs.'))
  appOneHead(tr0, TWDS._('PEOPLETAB_MENU_DMG_DONE', 'Damage done'), '', 3)
  appOneHead(tr1, TWDS._('PEOPLETAB_MENU_DMG_BY_ME', 'Me'), 'dmg_done_me', 0,
    TWDS._('PEOPLETAB_MENU_DMG_BY_ME_MOUSEOVER', 'The damage done by you.'))
  appOneHead(tr1, TWDS._('PEOPLETAB_MENU_DMG_BY_OTHER', 'Opp.'), 'dmg_done_other', 0,
    TWDS._('PEOPLETAB_MENU_DMG_BY_OTHER_MOUSEOVER', 'The damage done to you (by the opponent).'))
  appOneHead(tr1, TWDS._('PEOPLETAB_MENU_DMG_DIFF', 'Diff.'), 'dmg_done_diff', 0,
    TWDS._('PEOPLETAB_MENU_DMG_DIFF_MOUSEOVER', 'The damage done difference.'))
  appOneHead(tr0, TWDS._('PEOPLETAB_MENU_XP', 'XP'), '', 2)
  appOneHead(tr1, TWDS._('PEOPLETAB_MENU_XP_ME', 'Me'), 'xp_got_me', 0,
    TWDS._('PEOPLETAB_MENU_XP_ME_MOUSEOVER', 'The XP you got.'))
  appOneHead(tr1, TWDS._('PEOPLETAB_MENU_XP_OTHER', 'Opp.'), 'xp_got_other', 0,
    TWDS._('PEOPLETAB_MENU_XP_OTHER_MOUSEOVER', 'The XP your opponent got.'))
  const tbody = document.createElement('tbody')
  tab.appendChild(tbody)
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)

    let other = k.match(/^TWDS_p_(.*)/)
    if (!other) {
      continue
    }
    other = other[1]
    const o = TWDS.people.getbyname(other)
    if (!o) continue // cant happen

    const tr = document.createElement('tr')
    tr.classList.add('datarow')
    const th = document.createElement('th')
    th.dataset.field = 'name'
    th.textContent = other
    tr.appendChild(th)

    appOneBody(tr, o.win_me + o.win_other, 'num',
      TWDS._('PEOPLETAB_NUM_INFO', '$num$ attacks by me', { num: o.me_has_attacked }))
    appOneBody(tr, o.win_me, 'won',
      TWDS._('PEOPLETAB_NUM_ATTACKS_WON', '$num$ attacks won', { num: o.me_won_attacking }))
    appOneBody(tr, o.win_other, 'lost',
      TWDS._('PEOPLETAB_NUM_DEFENCES_WON', '$num$ defences won', { num: o.me_won_defending }))
    appOneBody(tr, o.win_me - o.win_other, 'plusminus')

    appOneBody(tr, o.dollars_won_me - o.dollars_won_other, 'dollar',
      TWDS._('PEOPLETAB_DOLLARS_INFO', '$$dollars_me$ won by me<br>$$dollars_other$ won by $opponent$', {
        dollars_me: o.dollars_won_me,
        dollars_other: o.dollars_won_other,
        opponent: other
      }))

    appOneBody(tr, o.dmg_done_me, 'dmg_done_me')
    appOneBody(tr, o.dmg_done_other, 'dmg_done_other')
    appOneBody(tr, o.dmg_done_me - o.dmg_done_other, 'dmg_done_diff',
      TWDS._('PEOPLETAB_DAMAGE_INFO', '$dmg_done_me$ damage done by me<br>$dmg_done_other$ done by $opponent$', {
        dmg_done_me: o.dmg_done_me,
        dmg_done_other: o.dmg_done_other,
        opponent: other
      }))

    appOneBody(tr, o.xp_got_me, 'xp_got_me')
    appOneBody(tr, o.xp_got_other, 'xp_got_other')

    tbody.appendChild(tr)
  }
  TWDS.peopleSort(tab, 'num')
}

TWDS.getPeopleContent = function () {
  const tab = document.createElement('table')
  tab.id = 'TWDS_people'
  TWDS.initPeopleList(tab)

  const div = document.createElement('div')
  const p = document.createElement('p')
  p.id = 'TWDS_people_info'
  div.appendChild(p)
  const div2 = document.createElement('div')
  div.appendChild(div2)
  div2.id = 'TWDS_peoplelist_functions'

  let b = document.createElement('button')
  b.id = 'TWDS_peoplelist_delete'
  b.textContent = TWDS._('PEOPLETAB_DELETE_DATA', 'Delete data')
  div2.appendChild(b)

  b = document.createElement('button')
  b.id = 'TWDS_peoplelist_import'
  b.textContent = TWDS._('PEOPLETAB_IMPORT', 'Import new duels')
  const sp = document.createElement('span')
  sp.id = 'TWDS_peoplelist_import_info'
  b.appendChild(sp)
  div2.appendChild(b)

  div.appendChild(tab)
  return div
}
TWDS.appendSubtable = function (container, dd, other) {
  const tab = document.createElement('table')
  container.appendChild(tab)

  const tr = document.createElement('tr')
  tab.appendChild(tr)

  let th = document.createElement('th')
  tr.appendChild(th)
  th.textContent = TWDS._('PEOPLE_SUB_DATE', 'Date')

  th = document.createElement('th')
  tr.appendChild(th)
  th.textContent = TWDS._('PEOPLE_SUB_ATTACKER', 'Attacker')

  th = document.createElement('th')
  tr.appendChild(th)
  th.textContent = TWDS._('PEOPLE_SUB_VICTOR', 'Winner')

  th = document.createElement('th')
  tr.appendChild(th)
  th.textContent = TWDS._('PEOPLE_SUB_DOLLAR', '$ won')

  th = document.createElement('th')
  tr.appendChild(th)
  th.textContent = TWDS._('PEOPLE_SUB_DMG_ATTACKER_MADE', 'Dmg by att.')
  th.title = TWDS._('PEOPLE_SUB_DMG_ATTACKER_MADE_MOUSEOVER', 'The damage done by the attacker')

  th = document.createElement('th')
  tr.appendChild(th)
  th.textContent = TWDS._('PEOPLE_SUB_DMG_DEFENDER_MADE', 'Dmg. by def.')
  th.title = TWDS._('PEOPLE_SUB_DMG_DEFENDER_MADE_MOUSEOVER', 'The damage done by the defender')

  th = document.createElement('th')
  tr.appendChild(th)
  th.textContent = TWDS._('PEOPLE_SUB_XP', 'XP won')

  // console.log("unsorted",JSON.stringify(dd.list))
  dd.list.sort(function (a, b) {
    return b.cmpdate.localeCompare(a.cmpdate)
  })
  // console.log("sorted",dd);

  for (let i = 0; i < dd.list.length; i++) {
    const d = dd.list[i]

    const tr = document.createElement('tr')
    tab.appendChild(tr)

    let td = document.createElement('td')
    tr.appendChild(td)
    td.textContent = d.date
    td.dataset.cmpdate = d.cmpdate
    td.className = 'openreport'
    td.dataset.hash = d.hash
    td.dataset.report_id = d.report_id

    td = document.createElement('td')
    td.className = 'attacker'
    tr.appendChild(td)
    if (d.iAmAttacker) td.textContent = Character.name
    else td.textContent = other

    td = document.createElement('td')
    td.className = 'winner'
    tr.appendChild(td)
    if (d.iAmWinner) td.textContent = Character.name
    else td.textContent = other

    td = document.createElement('td')
    tr.appendChild(td)
    if (d.iAmWinner) td.textContent = d.DollarsIWon
    else td.textContent = d.DollarsOpponentWon

    td = document.createElement('td')
    tr.appendChild(td)
    td.textContent = d.iMadeDamage

    td = document.createElement('td')
    tr.appendChild(td)
    td.textContent = d.OppMadeDamage

    td = document.createElement('td')
    tr.appendChild(td)
    td.textContent = d.iGotXP ? d.iGotXP : d.OppGotXP
  }
}
TWDS.activatePeopleTab = function () {
  TWDS.activateTab('people')
}

TWDS.registerStartFunc(function () {
  TWDS.registerTab('people',
    TWDS._('TABNAME_PEOPLE', 'People'),
    TWDS.getPeopleContent,
    TWDS.activatePeopleTab,
    true)
  $(document).on('click', '#TWDS_peoplelist_delete', function () {
    if (window.confirm(TWDS._('PROMPT_DELETE_DUEL_DATA', 'really delete the duel data?'))) {
      console.log('yes, delete')
      TWDS.clearDuels()
      document.getElementById('TWDS_people').innerHTML = ''
    }
  })
  $(document).on('click', '#TWDS_peoplelist_import', function () {
    document.getElementById('TWDS_people_info')
      .textContent = TWDS._('PEOPLE_WAITINFO', 'This runs in the background and takes some time. Please wait.')
    TWDS.readDuels()
    TWDS.activatePeopleTab()
  })
  $(document).on('click', '#TWDS_people thead tr.sortTriggerRow th', function () {
    const key = this.dataset.field
    if (typeof key !== 'undefined') {
      TWDS.peopleSort(null, key)
    }
  })
  $(document).on('click', '#TWDS_people_subtab .openreport', function () {
    const hash = this.dataset.hash
    const id = this.dataset.report_id
    ReportWindow.open(id, hash, 0)
  })
  $(document).on('click', '#TWDS_people .datarow [data-field="name"]', function () {
    // this is the th.name
    const d = TWDS.people.getbyname(this.textContent)
    if (!d) return
    const dr = this.closest('.datarow')
    const id = 'TWDS_people_subtab'
    const ele = document.getElementById(id)
    if (ele) ele.parentNode.removeChild(ele)
    const tr = document.createElement('tr')
    tr.id = id
    const td = document.createElement('td')
    td.setAttribute('colspan', 11)
    tr.appendChild(td)
    dr.insertAdjacentElement('afterend', tr)
    TWDS.appendSubtable(td, d, this.textContent)
  })
})
