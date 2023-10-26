// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.calendar = {}
TWDS.calendar.list = [
  ['12-15', '12-21', '3w', 'Holiday Sale', '$/Bond/Nugget-Sale', ''],
  ['12-15', '12-21', '3w', 'Gift Hunt', 'Click-Event', ''],
  ['11-25', '11-27', '2d', 'Black Friday', 'Bond/Nugget-Sale', ''],
  ['11-23', '12-07', '2w', 'Pumpkin Hunt', 'Click-Event', ''],
  ['10-31', '11-02', '2d', 'Halloween Sale', 'Bond/Nugget-Sale (Fun Items)', ''],
  ['10-27', '10-28', '20d', 'Day of the Dead', 'Regular Event', ''],
  ['09-14', '09-16', '26d', 'Octoberfest', 'Regular Event', ''],
  ['08-15', '08-18', '14d', 'Harvest Event', 'Click-Event', ''],
  ['06-30', '07-07', '20d', 'Independence Day', 'Regular Event', ''],
  ['06-07', '06-07', '15d', 'Bents Fort', 'Click Event', ''],
  ['05-20', '05-25', '16d', 'Crafting Event', 'Mini Event', ''],
  ['04-29', '04-30', '4d', 'Birthday Event', 'Mini Event',
    'Large World Bonusses'],
  ['03-29', '04-13', '22d', 'Easter', 'Regular Event', ''],
  ['03-12', '03-17', '14d', 'St. Patrick', 'Secondary Event', ''],
  ['03-16', '03-16', '13d', 'Indep. Founders Day', 'Click-Event', ''],
  ['02-07', '02-17', '17d', 'Valentine', 'Regular Event', ''],
  ['01-30', '02-03', '13d', 'Winter Event', 'Click-Event', '']

]
TWDS.calendar.openwindow = function () {
  const win = wman.open('TWDS_calendar_window', TWDS._('CALENDAR_WIN_TITLE', 'Calendar'))
  win.setMiniTitle(TWDS._('CALENDAR_MINI_TITLE', 'Calendar'))

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_log_container'
  })
  const table = TWDS.createEle('table', { beforeend: content })
  const thead = TWDS.createEle('thead', { beforeend: table })
  thead.appendChild(TWDS.createEle({
    nodeName: 'tr',
    children: [
      { nodeName: 'th', textContent: 'ts', className: 'ts' },
      { nodeName: 'th', textContent: 'lv', className: 'lv' },
      { nodeName: 'th', textContent: 'content', className: 'str' }
    ]
  }))
  const tbody = TWDS.createEle('tbody', { beforeend: table })
  for (let i = 0; i < TWDS.calendar.list.length; i++) {
    const e = TWDS.calendar.list[i]
    TWDS.createEle({
      nodeName: 'tr',
      last: tbody,
      children: [
        { nodeName: 'td.firstdate', textContent: e[0] },
        { nodeName: 'td.lastdate', textContent: e[1] },
        { nodeName: 'td.term', textContent: e[2] },
        { nodeName: 'td.name', textContent: e[3] },
        { nodeName: 'td.type', textContent: e[4] },
        { nodeName: 'td.extra', textContent: e[5] }
      ]
    })
  }
  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}
// this is not translated, because it runs quite early
TWDS.registerExtra('TWDS.logging.openwindow', 'Calendar', 'Show an event calendar')
