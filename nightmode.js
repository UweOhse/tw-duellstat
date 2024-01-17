// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.nightmode = {}
TWDS.nightmode.timeout = 0

// a little complicated to avoid manipulating body.style.filter directly (co-existance with over scripts),
TWDS.nightmode.stylehandler = function () {
  let val = TWDS.settings.nightmode_brightness

  let sh = TWDS.q1('#TWDS_nightmode_style_hack')
  if (val === 100) {
    if (sh) { sh.remove() }
    return
  }
  if (!sh) {
    sh = TWDS.createEle({
      nodeName: 'style',
      id: 'TWDS_nightmode_style_hack',
      textContent: '',
      last: document.body
    })
  }
  val = (val / 100.0).toFixed(2)
  sh.textContent = 'body.TWDS_nightmode { filter:brightness(' + val + ') }'
}
TWDS.nightmode.setit = function (force) {
  const b = TWDS.q1('body')
  if (!b) return // whatever

  const h = (new Date()).getHours()
  let doit = 0
  if (TWDS.settings.nightmode_before !== -1) {
    if (h < TWDS.settings.nightmode_before) {
      doit = 1
    }
  }
  if (TWDS.settings.nightmode_after !== -1) {
    if (h >= TWDS.settings.nightmode_after) {
      doit = 1
      if (TWDS.settings.nightmode_before !== -1) {
        if (h >= TWDS.settings.nightmode_before) {
          doit = 0
        }
      }
    }
  }
  if (force !== undefined) {
    console.log('forcing it from', doit, 'to', force)
    doit = force
  }

  if (doit) b.classList.add('TWDS_nightmode')
  else b.classList.remove('TWDS_nightmode')
}
TWDS.nightmode.timer = function () {
  clearTimeout(TWDS.nightmode.timeout)
  TWDS.nightmode.setit()
  const d = new Date()
  const over = d.getMinutes() * 60 + d.getSeconds()
  let todo = 3600 - over
  if (todo < 0) todo = 0
  TWDS.nightmode.timeout = setTimeout(TWDS.nightmode.timer, todo * 1000 + 1000)
}
TWDS.registerStartFunc(function () {
  TWDS.registerSetting('int', 'nightmode_after',
    TWDS._('NIGHTMODE_AFTER',
      'Switch to the night mode from that hour on. -1: off'),
    { default:-1, min:-1, max:23, },
    function () { TWDS.nightmode.timer() }, 'nightmode', null, 1)
  TWDS.registerSetting('int', 'nightmode_before',
    TWDS._('NIGHTMODE_BEFORE',
      'Turn night mode off from that hour on. -1: off'),
    { default:-1, min:-1, max:23},
    function () { TWDS.nightmode.timer() }, 'nightmode', null, 2)
  TWDS.registerSetting('int', 'nightmode_brightness',
    TWDS._('NIGHTMODE_BRIGHTNESS',
      'Set night mode brightness (in percent).'),
    { default: 100, min: 33, max: 133 }
    , function () { TWDS.nightmode.stylehandler() }, 'nightmode', null, 3)
  TWDS.nightmode.timer()
})
