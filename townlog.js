// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.townlog = {}
TWDS.townlog.sum = {}
TWDS.townlog.from = ''
TWDS.townlog.to = ''
TWDS.townlog.breakadd = 50
TWDS.townlog.break = 50
TWDS.townlog.handleconstruct = function (name, building, time) {
  if (!(building in TWDS.townlog.sum)) {
    TWDS.townlog.sum[building] = {}
  }
  if (!(name in TWDS.townlog.sum[building])) {
    TWDS.townlog.sum[building][name] = 0
  }
  TWDS.townlog.sum[building][name] += time
}
TWDS.townlog.updategarbage = function (ele) {
  ele.textContent = ''
  for (const [building, v0] of Object.entries(TWDS.townlog.sum)) {
    let bname = building
    if (building === 'Church') bname = 'The altar of the unholy demon of gunpowder'
    if (building === 'Kirche') bname = 'Die unheilige Opferstätte des Dämonen des Schießpulvers'
    TWDS.createEle('h5', { textContent: bname, last: ele })
    const tab = TWDS.createEle('table', { last: ele, className: 'constructing' })
    const a = []
    for (const [u, t] of Object.entries(v0)) {
      a.push([u, t])
    }
    a.sort(function (a, b) {
      return b[1] - a[1]
    })
    for (let i = 0; i < a.length; i++) {
      const u = a[i][0]
      const t = a[i][1]
      const tr = TWDS.createEle('tr', { last: tab })
      TWDS.createEle('th', { last: tr, innerHTML: u })
      TWDS.createEle('th', { last: tr, textContent: t.toFixed(2) + 'h' })
    }
  }
}

TWDS.townlog.do = function () {
  Ajax.remoteCallMode('building_cityhall', 'list_log', {
    town_id: Character.homeTown.town_id,
    page: TWDS.townlog.pageno
  },
  function (json) {
    const x = TWDS.q1('.waitinfo', TWDS.townlog.win.divMain)
    if (x) {
      x.textContent = 'Page ' + json.page + '/' + json.count + ' read'
    }
    const useful = TWDS.q1('.useful', TWDS.townlog.win.divMain)
    const g = TWDS.q1('.garbage', TWDS.townlog.win.divMain)
    for (let i = 0; i < json.logs.length; i++) {
      const str = json.logs[i].data
      const dt = json.logs[i].log_date
      if (TWDS.townlog.pageno === 1 && i === 0) {
        TWDS.townlog.from = dt
      }
      TWDS.townlog.to = dt
      let m = str.match(/^(.*) hat (\d+) (\S+) das Gebäude (\S+) ausgebaut/)
      if (m) {
        let t = parseInt(m[2])
        if (m[3] === 'Minuten') {
          t = t / 60
        }
        TWDS.townlog.handleconstruct(m[1], m[4], t)
        continue
      }
      m = str.match(/^(.*) has constructed the building (\S+) for (\d+) (\S+)/)
      if (m) {
        let t = parseInt(m[3])
        if (m[4] === 'minutes') {
          t = t / 60
        }
        TWDS.townlog.handleconstruct(m[1], m[2], t)
        continue
      }
      TWDS.createEle('div', {
        last: useful,
        innerHTML: dt + ' ' + str
      })
    }
    const di = TWDS.q1('.dateinfo', TWDS.townlog.win.divMain)
    di.textContent = TWDS.townlog.to + ' - ' + TWDS.townlog.from
    TWDS.townlog.updategarbage(g)
    if (json.page < json.count && json.page < TWDS.townlog.break) {
      if ((TWDS.townlog.pageno % 10) === 0) {
        TWDS.townlog.pageno++
        window.setTimeout(TWDS.townlog.do, 1500)
      } else {
        TWDS.townlog.pageno++
        TWDS.townlog.do()
      }
    }
    if (json.page < json.count && json.page === TWDS.townlog.break) {
      const b = TWDS.q1('button', TWDS.townlog.win.divMain)
      b.style.display = 'block'
    }
  })
}
TWDS.townlog.openwindow = function () {
  const win = wman.open('TWDS_townlog_window', 'Townlog', 'TWDS_townlog_window')
  win.setMiniTitle('Townlog')
  TWDS.townlog.win = win

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_townlog_container',
    children: [
      { nodeName: 'p', className: 'waitinfo', textContent: 'please wait' },
      { nodeName: 'button', className: 'TWDS_button', textContent: 'paused. click to continue' },
      { nodeName: 'h2', className: 'dateinfo' },
      { nodeName: 'h2', textContent: 'Information' },
      { nodeName: 'p', className: 'useful', textContent: '' },
      { nodeName: 'h2', textContent: 'Noise' },
      { nodeName: 'p', className: 'garbage', textContent: '' },
      { nodeName: 'h2', textContent: 'Note' },
      { nodeName: 'p', textContent: 'The author is not interested in any improvement of this. Use it, or ignore it, but do NOT remember me of this.' }
    ]

  })
  sp.appendContent(content)
  TWDS.townlog.pageno = 1
  TWDS.townlog.sum = {}
  TWDS.townlog.break = TWDS.townlog.breakadd
  TWDS.townlog.from = ''
  TWDS.townlog.to = ''

  win.appendToContentPane(sp.getMainDiv())
  TWDS.townlog.do()
  const b = TWDS.q1('button', content)
  b.style.display = 'none'
  b.onclick = function () {
    TWDS.townlog.break += TWDS.townlog.breakadd
    this.style.display = 'none'
    TWDS.townlog.do()
  }
}
// this is not translated, because it runs quite early
// TWDS.registerExtra('TWDS.townlog.openwindow', 'Townlog', 'Show townlog summary')
