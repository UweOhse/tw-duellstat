// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.fbmisc = {}
TWDS.fbmisc.shownumberinterval = 0
TWDS.fbmisc.shownumber = function () {
  Ajax.remoteCall('fort_overview', '', {}, function (data) {
    console.log('ajax gave', data, data.js)
    const mp = TWDS.q1('#ui_bottombar .multiplayer')
    if (!mp) return
    console.log('mp found', mp)

    let ele = TWDS.q1('.TWDS_fbcount', mp)
    console.log('ele?', ele)

    let n = 0
    if (data.js) {
      n = data.js.length
    }
    console.log('n?', n)
    if (ele && !n) {
      ele.remove()
      return
    }
    if (n && !ele) {
      ele = TWDS.createEle({
        nodeName: 'span.TWDS_fbcount',
        last: mp
      })
    }
    ele.textContent = n
  })
}
TWDS.fbmisc.shownumberstarter = function () {
  if (TWDS.shownumberinterval) {
    window.clearInterval(TWDS.shownumberinterval)
    TWDS.shownumberinterval = 0
  }
  if (TWDS.settings.fbmisc_fbcount) {
    TWDS.fbmisc.shownumber()
    TWDS.shownumberinterval = window.setInterval(TWDS.shownumberinterval, 5 * 60 * 1000)
  }
}

TWDS.fbmisc.startfunc = function () {
  TWDS.registerSetting('bool', 'fbmisc_fbcount',
    TWDS._('FBMISC_SETTING_FCOUNT', 'Show the number of declared fort battles.'),
    true, TWDS.fbmisc.shownumberstarter, 'fortbattles')
}
TWDS.registerStartFunc(function () {
  TWDS.fbmisc.startfunc()
})

// vim: tabstop=2 shiftwidth=2 expandtab
