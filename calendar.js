// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.calendar = {}
TWDS.calendar.list = [
  ['12-15', '12-22', '17-23d', 'Holiday Sale', '$/Bond/Nugget Sale'],
  ['12-15', '12-21', '23d', 'Gift Hunt', 'Click Event'],
  ['11-23', '11-29', '2d', 'Black Friday', 'Nugget Sale, with a discount'],

  ['11-23', '12-07', '12-16d', 'Pumpkin Hunt', 'Click Event'],

  ['10-27', '11-02', '2-6d', 'Halloween Sale', 'Bond/Nugget Sale (Fun Items)'],

  ['10-27', '11-08', '20d', 'Day of the Dead', 'Regular Event'],

  ['09-12', '09-22', '26-28d', 'Octoberfest', 'Regular Event'],

  ['08-15', '08-22', '14-23d', 'Harvest Event', 'Click Event'],
  ['08-18', '09-05', '14-23d', 'Harvest Sale', 'Bond/nugget sale: Get your lemonade.'],

  ['06-23', '07-07', '21d', 'Independence Day', 'Regular event'],

  ['06-07', '06-14', '21d', 'June click event', 'Click event, not every year'],

  ['05-10', '05-25', '17-20d', 'Crafting Event', 'New recipes, birthday drinks', ''],
  ['04-29', '05-07', '4d', 'Birthday Event', 'Mini Event: Large World Bonusses, Quests, whatever'],
  ['03-23', '04-13', '24d', 'Easter', 'Regular Event'],
  ['03-12', '03-17', '15d', 'St. Patrick', 'Alternatively a click event.'],

  ['02-07', '02-17', '20-28d', 'Valentine', 'Regular Event'],

  ['01-30', '02-03', '14-15d', 'Winter Event', 'Click Event']
]
TWDS.calendar.openwindow = function () {
  const win = wman.open('TWDS_calendar_window', TWDS._('CALENDAR_WIN_TITLE', 'Calendar'))
  win.setMiniTitle(TWDS._('CALENDAR_MINI_TITLE', 'Calendar'))

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_calendar_container'
  })
  const table = TWDS.createEle('table', { beforeend: content })
  const thead = TWDS.createEle('thead', { beforeend: table })
  thead.appendChild(TWDS.createEle({
    nodeName: 'tr',
    children: [
      { nodeName: 'th.start', textContent: 'Start' },
      { nodeName: 'th.term', textContent: 'Length' },
      { nodeName: 'th.name', textContent: 'Name' },
      { nodeName: 'th.desc', textContent: 'Description' }
    ]
  }))
  const tbody = TWDS.createEle('tbody', { beforeend: table })

  for (let i = 0; i < TWDS.calendar.list.length; i++) {
    const e = TWDS.calendar.list[i]
    TWDS.createEle({
      nodeName: 'tr',
      last: tbody,
      children: [
        { nodeName: 'td.start', textContent: e[0] + ' - ' + e[1] },
        { nodeName: 'td.term', textContent: e[2] },
        { nodeName: 'td.name', textContent: e[3] },
        { nodeName: 'td.desc', textContent: e[4] }
      ]
    })
  }
  const dl = TWDS.createEle('dl', { last: content })
  TWDS.createEle('dt', { last: dl, textContent: 'a' })
  TWDS.createEle('dd', { last: dl, textContent: 'description' })
  TWDS.createEle('dt', { last: dl, textContent: 'b' })
  TWDS.createEle('dd', { last: dl, textContent: 'description' })
  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}
TWDS.registerExtra('TWDS.calendar.openwindow',
  TWDS._('CALENDDR_TITLE', 'Calendar'),
  TWDS._('CALENDAR_DESC', 'Show an event calendar'))
