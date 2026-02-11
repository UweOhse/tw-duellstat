// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.achievements = {}
TWDS.achievements.did = {}
TWDS.achievements.search = function (str, tab) {
  str = str.trim().toLocaleLowerCase()
  let rx
  if (str > '') {
    rx = new RegExp(str)
  }
  const rows = TWDS.q('tbody tr', tab)
  for (const tr of rows) {
    const text = TWDS.q1('.title', tr).textContent.toLocaleLowerCase()
    if (str === '') {
      tr.style.display = 'table-row'
    } else {
      if (text.search(rx) > -1) {
        tr.style.display = 'table-row'
      } else {
        tr.style.display = 'none'
      }
    }
  }
}
TWDS.achievements.openwindowReal = function (data) {
  const titlestr = TWDS._('ACHIEVEMENTS_TITLE', 'Achievements')
  const win = wman.open('TWDS_achievements_window', titlestr)
  win.setMiniTitle(titlestr)
  TWDS.achievements.win = win

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_achievements_container'
  })
  let total = 0
  for (const part of data.menu) {
    total++
    total += part.sub.length
  }
  TWDS.createEle('div', {
    last: content,
    className: 'TWDS_achievements_search_wrapper',
    children: [
      { nodeName: 'input', type: 'text', className: 'TWDS_achievements_search', placeholder: 'search' }
    ]
  })
  TWDS.createEle('p', {
    className: 'TWDS_achievements_warning',
    last: content,
    children: [
      { nodeName: 'span', textContent: 'Please wait: ' },
      { nodeName: 'b', textContent: 1 }, // yes, we already did one request - and we'll skip the general cat-
      { nodeName: 'span', textContent: ' / ' + total }
    ]
  })
  TWDS.createEle('p', { last: content, className: 'TWDS_achievements_info' })
  const tab = TWDS.createEle('table', {
    className: 'TWDS_achievements_table TWDS_sortable',
    last: content
  })
  const thead = TWDS.createEle('thead', {
    last: tab
  })
  const tr = TWDS.createEle('tr', { last: thead })
  TWDS.createEle('th', { last: tr, textContent: 'title', dataset: { colsel: '.title' } })
  TWDS.createEle('th', { last: tr, textContent: 'folder', dataset: { colsel: '.folder', secondsel: '.sub' } })
  TWDS.createEle('th', { last: tr, textContent: 'sub', dataset: { colsel: '.sub', secondsel: '.title' } })
  TWDS.createEle('th', { last: tr, textContent: 'points', dataset: { colsel: '.points', sortmode: 'number' } })
  TWDS.createEle('th', { last: tr, textContent: 'date', dataset: { colsel: '.achieved', sortmode: 'number' } })
  const tbody = TWDS.createEle('tbody', {
    last: tab
  })
  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
  TWDS.achievements.did = {}

  TWDS.achievements.doonecat(tbody, data.menu, 0, -1)
  TWDS.delegate(content, 'click', 'thead th[data-colsel]', TWDS.sortable.do)
  TWDS.delegate(content, 'click', 'tbody th', TWDS.achievements.openone)
  TWDS.delegate(content, 'change', '.TWDS_achievements_search', function () { TWDS.achievements.search(this.value, tab) })
}

TWDS.achievements.openone = function () {
  const idconst = 'TWDS_achievements_one'
  let win = wman.getById(idconst)
  if (win) {
    if (wman.isMinimized(idconst)) { wman.reopen(idconst) }
  } else {
    win = wman.open(idconst, 'Achievment', 'noreload nocloseall').setMiniTitle('A')
    const sp = new west.gui.Scrollpane()
    sp.appendContent("<div class='TWDS_achievements_show_one achievement'></div>")
    win.appendToContentPane(sp.getMainDiv())
  }
  console.log(win.getMainDiv(), TWDS.q1('.TWDS_achievements_show_one', win.getMainDiv()[0]))
  const y = TWDS.q1('.TWDS_achievements_show_one', win.getMainDiv()[0])
  const d = JSON.parse(this.closest('tr').dataset.qd)

  const a = tw2widget.achievement.create(d, null, true)
  y.textContent = ''
  y.innerHTML = a.divMain[0].innerHTML
  win.setTitle(0)
  win.setSize(y.scrollWidth + 90, y.scrollHeight + 100)
}
TWDS.achievements.append1 = function (tbody, json, fin, folder, sub) {
  const hackparsedate = function (s) {
    let x = /^ *(\d+) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d+)$/.exec(s)
    if (x) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      let v = parseInt(x[3]) * 31 * 12 + parseInt(x[1])
      for (let i = 0; i < 12; i++) {
        if (months[i] === x[2]) {
          v += 31 * i
        }
      }
      return v
    }
    x = /^ *(\d+)\. (Jan|Feb|Mär|Apr|Mai|Jun|Jul|Aug|Sep|Okt|Nov|Dez) (\d+)$/.exec(s)
    if (x) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      let v = parseInt(x[3]) * 31 * 12 + parseInt(x[1])
      for (let i = 0; i < 12; i++) {
        if (months[i] === x[2]) {
          v += 31 * i
        }
      }
      return v
    }
    return 0
  }
  if (!json) return
  for (let i = 0; i < json.length; i++) {
    // level 140 (reached) contains all sub levels
    // level 150 (no reached) contains all sub levels, too
    const id = json[i].id
    if (id in TWDS.achievements.did) continue
    TWDS.achievements.did[id] = true

    const tr = TWDS.createEle('tr', { last: tbody })
    if (fin) { tr.classList.add('finished') }
    tr.dataset.qd = JSON.stringify(json[i])
    TWDS.createEle('th', { last: tr, className: 'title', textContent: json[i].title })
    TWDS.createEle('td', { last: tr, className: 'folder', textContent: folder })
    TWDS.createEle('td', { last: tr, className: 'sub', textContent: sub })
    TWDS.createEle('td', { last: tr, className: 'points', textContent: json[i].points })
    const v = hackparsedate(json[i].achieved)
    TWDS.createEle('td', { last: tr, className: 'achieved', textContent: json[i].achieved, dataset: { sortval: v } })
    if (json[i].subs.length) {
      TWDS.achievements.append1(tbody, json[i].subs, fin, folder, sub)
    }
  }
}
TWDS.achievements.append = function (tbody, json, folder, sub) {
  TWDS.achievements.append1(tbody, json.finished, true, folder, sub)
  TWDS.achievements.append1(tbody, json.progress, false, folder, sub)
}
TWDS.achievements.doonecat = function (tbody, menu, i0, i1) {
  const warn = TWDS.q1('.TWDS_achievements_warning')
  const info = TWDS.q1('.TWDS_achievements_info')
  const sw = TWDS.q1('.TWDS_achievements_search_wrapper')
  const current = TWDS.q1('b', warn)
  const finish = function () {
    if (warn) { warn.remove() }
    info.textContent = 'Click on the table header to sort. Click on an achievement name to open it.'
    sw.style.display = 'block'
  }
  if (i0 >= menu.length) { finish(); return }
  if (i1 > -1) {
    if (i1 >= menu[i0].sub.length) {
      i0++
      i1 = -1
    }
  }
  if (i0 >= menu.length) { finish(); return }
  if (menu[i0].id === 'overall') {
    // skip most recents
    i0++
  }
  if (i0 >= menu.length) { finish(); return }

  if (i1 === -1) {
    Ajax.remoteCall('achievement', 'get_list', { playerid: Character.playerId, folder: menu[i0].id }, function (json) {
      current.textContent = parseInt(current.textContent) + 1
      TWDS.achievements.append(tbody, json.achievements, menu[i0].name, null)
      TWDS.achievements.doonecat(tbody, menu, i0, 0)
    })
  } else {
    Ajax.get('achievement', 'get_list', { playerid: Character.playerId, folder: menu[i0].sub[i1].id }, function (json) {
      current.textContent = parseInt(current.textContent) + 1
      TWDS.achievements.append(tbody, json.list.achievements, menu[i0].name, menu[i0].sub[i1].name)
      TWDS.achievements.doonecat(tbody, menu, i0, i1 + 1)
    })
  }
}
TWDS.achievements.openwindow = function () {
  Ajax.get('achievement', null, {}, function (json) {
    TWDS.achievements.openwindowReal(json)
  })
}
// this is not translated, because it runs quite early
TWDS.registerStartFunc(function () {
  TWDS.registerExtra('TWDS.achievements.openwindow',
    TWDS._('ACHIEVEMENTS_EXTRA_TITLE', 'Achievements'),
    TWDS._('ACHIEVEMENTS_EXTRA_DESC', 'A table containing the achievements')
  )
})
