// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.calendar = {}
TWDS.calendar.list = [
  ['e', '12-15', '12-22', '17-23d', 'Holiday Sale', '$/Bond/Nugget Sale'],
  ['e', '12-15', '12-21', '23d', 'Gift Hunt', 'Click Event'],
  ['e', '12-06', '12-26', '21d', 'Christmas', "Repeatable Quest: 1AP, 1FP. First year: also a Snowman's Hat"],
  ['e', '11-23', '11-29', '2d', 'Black Friday', 'Nugget Sale, with a discount'],

  ['e', '11-23', '12-07', '12-16d', 'Pumpkin Hunt', 'Click Event'],
  ['q', '11-23', '11-30', '7d', 'Thanksgiving', 'Repeatable Quest (1SP, 1AP). First year: 1AP, Thanksgiving boots.'],

  ['e', '10-27', '11-02', '2-6d', 'Halloween Sale', 'Bond/Nugget Sale (Fun Items)'],
  ['q', '10-25', '11-15', '15d', 'The three-day fiesta', 'Repeatable Quest (1SP).'],

  ['e', '10-27', '11-08', '20d', 'Day of the Dead', 'Regular Event'],
  ['q', '10-25', '11-15', '19d', 'Day of the Dead', 'Repeatable Quest (1SP)'],

  ['e', '09-12', '10-22', '26-28d', 'Octoberfest', 'Regular Event'],
  ['q', '09-12', '10-22', '21d', 'Octoberfest', 'Repeatable Quest (1SP).'],

  ['e', '08-15', '08-22', '14-23d', 'Harvest Event', 'Click Event'],
  ['e', '08-18', '09-05', '14-23d', 'Harvest Sale', 'Bond/nugget sale: Get your lemonade.'],

  ['q', '07-01', '07-29', '29d', 'West Point',
    'Repeatable Quest (1SP) event. First year: the medal of merit (collectible) and a golden letter.'],
  ['e', '06-23', '07-07', '21d', 'Independence Day', 'Regular event'],

  ['e', '06-07', '06-14', '21d', 'June click event', 'Click event, not every year'],

  ['e', '05-10', '05-25', '17-20d', 'Crafting Event', 'New recipes, birthday drinks', ''],
  ['e', '04-29', '05-07', '4d', 'Birthday Event', 'Mini Event: Large World Bonusses, Quests, whatever'],
  ['e', '03-23', '04-13', '24d', 'Easter', 'Regular Event'],
  ['q', '03-17', '04-09', '22d', 'Brewing bad', 'Repeatable Quest (1SP). First year: St. Patricks bow tie.'],
  ['e', '03-12', '03-17', '15d', 'St. Patrick', 'Alternatively a click event.'],

  ['e', '02-07', '02-17', '20-28d', 'Valentine', 'Regular Event'],
  ['q', '02-15', '03-06', '20d', "Gone with the Valentine's Day",
    'Repeatable Quest (1SP). First year: the night scarf'],
  ['q', '02-14', '03-03', '18d', 'One foolish Romeo',
    'Repeatable Quest (1SP). First year: the lakota blanket'],
  ['q', '01-31', '03-05', '34d', 'The provincial doctor', 'Repeatable Quest (1SP). First year: some boosts'],

  ['e', '01-30', '02-03', '14-15d', 'Winter Event', 'Click Event']
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
        { nodeName: 'td.start', textContent: e[1] + ' - ' + e[2] },
        { nodeName: 'td.term', textContent: e[3] },
        { nodeName: 'td.name', textContent: e[4] },
        { nodeName: 'td.desc', textContent: e[5] }
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
