// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.updatetab = {}
TWDS.updateinfo = function () { /**
@REPLACEUPDATEINFO@
**/ }.toString().slice(17, -5)

TWDS.updatetab.getContent1 = function () {
  const d = TWDS.createEle({
    nodeName: 'div',
    children: [
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
