// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.logging = {}
TWDS.loglist = []
TWDS.dolog = function (lv, args) {
  const str = args.join(', ')
  const e = {
    lv: lv,
    ts: (new Date()).getTime(),
    str: str
  }
  TWDS.loglist.push(e)
  const l = TWDS.loglist.length
  const max = 3
  if (l > max) {
    TWDS.loglist = TWDS.loglist.slice(l - max, l)
  }
  TWDS.loglist.length = 3
  const win = wman.getById('TWDS_log_window')
  console.log('win', win)
  if (win) {
    const x = TWDS.q1('.TWDS_log_window table tbody')
    if (x) {
      TWDS.logging.prependline(x, e)
    }
  }
}
TWDS.logging.prependline = function (tbody, e) {
  const tr = TWDS.createEle({
    nodeName: 'tr',
    className: 'logline',
    first: tbody
  })
  const d = (new Date(e.ts)).toLocaleTimeString()
  TWDS.createEle({
    nodeName: 'td',
    textContent: d,
    beforeend: tr
  })
  TWDS.createEle({
    nodeName: 'td',
    textContent: e.lv,
    beforeend: tr
  })
  TWDS.createEle({
    nodeName: 'td',
    textContent: e.str,
    beforeend: tr
  })
}
TWDS.debug = function (...args) { TWDS.dolog('d', args) }
TWDS.info = function (...args) { TWDS.dolog('i', args) }
TWDS.error = function (...args) { TWDS.dolog('e', args) }

TWDS.logging.openwindow = function () {
  const win = wman.open('TWDS_log_window', 'Log', 'TWDS_log_window')
  win.setMiniTitle('Log')

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
  for (let i = 0; i < TWDS.loglist.length; i++) {
    const e = TWDS.loglist[i]
    TWDS.logging.prependline(tbody, e)
  }
  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}
// this is not translated, because it runs quite early
TWDS.registerExtra('TWDS.logging.openwindow', 'Logging', 'Show logging information')
