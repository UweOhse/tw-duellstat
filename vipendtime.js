// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.vipendtime = {}
TWDS.vipendtime.element = null
TWDS.vipendtime.handler = function () {
  const now = new window.ServerDate().getTime()
  let dt = 0
  for (const p of Object.keys(Premium.endTimes)) {
    const e = Premium.endTimes[p]
    if (e > now / 1000) {
      if (dt === 0 || dt > e) { dt = e }
    }
  }
  if (dt) {
    dt = dt - now / 1000
    const str = dt.formatDurationBuffWay()
    if (!TWDS.vipendtime.element) {
      const bv = TWDS.q1('#buffbars .buffbar_vip .bag_item_mini')
      if (bv) {
        TWDS.vipendtime.element = TWDS.createEle({
          last: bv
        })
      }
    }
    if (TWDS.vipendtime.element) {
      TWDS.vipendtime.element.textContent = dt.formatDurationBuffWay()
    }
  }
}

TWDS.registerStartFunc(function () {
  TWDS.vipendtime.interval = 0

  TWDS.registerSetting('bool', 'vipendtime_show',
    TWDS._('VIPENDTIME_SETIING_SHOW', 'Show the VIP endtime over the VIP display'),
    false, function (v) {
      if (TWDS.vipendtime.interval) {
        window.clearInterval(TWDS.vipendtime.interval)
        TWDS.vipendtime.interval = 0
        if (TWDS.vipendtime.element) {
          TWDS.vipendtime.element.remove()
          TWDS.vipendtime.element = null
        }
      }
      if (v) {
        TWDS.vipendtime.handler()
        TWDS.vipendtime.interval = window.setInterval(TWDS.vipendtime.handler, 60 * 1000)
      }
    }
  )
})
