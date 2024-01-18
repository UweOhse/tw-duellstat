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
  // min and max on input ele doesn't work quite as one might expect!
  // the input.value is invalid, the form fails validation - but we have no form.
  if (val < 25) val = 25 // otherwise to dark to see something
  if (val > 200) val = 200 // otherwise the screen is overly white
  val = (val / 100.0).toFixed(2)
  sh.textContent = 'body.TWDS_nightmode { filter:brightness(' + val + ') }'
}
TWDS.nightmode.setit = function (force) {
  const b = TWDS.q1('body')
  if (!b) return // whatever

  const h = (new Date()).getHours()
  let doit = 0
  const start = parseInt(TWDS.settings.nightmode_start)
  const end = parseInt(TWDS.settings.nightmode_end)

  if (h >= start && h < end) {
    doit = 1 // australia case - 9-18
  } else if (end < start) {
    // europe case 21-06
    if (h >= start) doit = 1 // subcase 21..23
    else if (h < end) doit = 1 // subcase 00..06
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
  TWDS.registerSetting('int', 'nightmode_start',
    TWDS._('NIGHTMODE_START',
      'Start the night mode at that hour. -1: off'),
    { default: -1, min: -1, max: 23 },
    function () { TWDS.nightmode.timer() }, 'nightmode', null, 1)
  TWDS.registerSetting('int', 'nightmode_end',
    TWDS._('NIGHTMODE_END',
      'End night mode off at that hour. -1: off'),
    { default: -1, min: -1, max: 23 },
    function () { TWDS.nightmode.timer() }, 'nightmode', null, 2)
  TWDS.registerSetting('int', 'nightmode_brightness',
    TWDS._('NIGHTMODE_BRIGHTNESS',
      'Set night mode brightness (in percent). 75 might be a good start.'),
    { default: 100, min: 33, max: 133 }
    , function () { TWDS.nightmode.stylehandler() }, 'nightmode', null, 3)
  TWDS.nightmode.timer()
})
