// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.updatetab = {}
TWDS.updateinfo = `
@REPLACEUPDATEINFO@
`

TWDS.updatetab.getContent1 = function () {
  const d = TWDS.createEle({
    nodeName: 'div',
    children: [
      {
        nodeName: 'p',
        children: [
          {
            nodeName: 'span',
            textContent: TWDS._('UPDATES_REPORT',
              'Please use the following link to report bugs or request enhancements, as chat, teles, emails, forum conversions and posts just do not scale: ')
          }, {
            nodeName: 'a',
            href: TWDS.issueURL,
            textContent: 'report them here'
          }
        ]
      },
      { nodeName: 'h3', textContent: 'Updates' },
      { nodeName: 'div', innerHTML: TWDS.updateinfo }
    ]
  })
  return d
}
// this is for TWDS.reload. getContent is referenced, genContent1 is accessed by name,
// so we can exchange it at runtime.
TWDS.updatetab.getContent = function () {
  return TWDS.updatetab.getContent1()
}
TWDS.updatetab.activate = function () {
  TWDS.activateTab('updates')
}

TWDS.updatetab.startFunction = function () {
  TWDS.registerTab('updates',
    TWDS._('TABNAME_UPDATES', 'Updates'),
    TWDS.updatetab.getContent,
    TWDS.updatetab.activate,
    true)
}
TWDS.registerStartFunc(TWDS.updatetab.startFunction)
