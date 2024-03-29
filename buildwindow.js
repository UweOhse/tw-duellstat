// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.buildwindow = {}
TWDS.buildwindow.buttonthing = function (elder) {
  TWDS.createEle({
    nodeName: 'button.TWDS_buildwindow_start',
    last: elder,
    title: TWDS._('BUILDWINDOW_CLOTH_TITLE', 'Change clothes'),
    children: [
      { nodeName: 'img', src: '/images/items/yield/item_52967.png', alt: 'construction' },
      { nodeName: 'img', src: '/images/items/yield/dynamite.png', alt: 'construction' }
    ],
    onclick: function () {
      const items = TWDS.genCalc({ job_1000: 1, joball: 1 }, { build: 3, repair: 1, leadership: 1, joball: 1, job_1000: 1 })
      if (items) { TWDS.wearItemsHandler(items) }
    }
  })
}
TWDS.buildwindow.init = function () {
  window.BuildWindow.TWDS_backup_init.apply(this, arguments)
  if (!TWDS.settings.misc_buildwindow) { return }

  // the original function did format town money, but not player money. Yeah.
  this.cbPaymentChanged = function (payer) {
    if (this.window.$('#build_cdPayment').data('value') === 'player') {
      this.window.$('div.row_build_dollar > span.rp_jobdata_text').text(
        '$' + window.format_money(Character.getCapital(true)))
    } else { this.window.$('div.row_build_dollar > span.rp_jobdata_text').text('$' + this.deposit) }
  }

  const drops = TWDS.q1('.build_drops', this.window.divMain)
  if (drops) { // wenn nicht vorhanden, dann eben nicht.
    TWDS.buildwindow.buttonthing(drops)
  }

  // fix <small> in the way time.
  const bw = TWDS.q1('.build_way', this.window.divMain)
  if (bw && bw.textContent.includes('<small>')) {
    bw.innerHTML = bw.textContent // what the fuck?
  }
  const bh = TWDS.q1('.build_head', this.window.divMain)
  if (bh.textContent.includes('beichten')) {
    bh.innerHTML = '<span>' + bh.textContent + '<br>' +
      "<span class='tw_red'>Echt jetzt? Beim Arbeiten?</span></span>"
  }
}
TWDS.buildwindow.fairopen = function () {
  west.wof.FairSiteWindow.TWDS_backup_open.apply(this, arguments)
  if (!TWDS.settings.misc_buildwindow_wof) { return }
  const wnd = west.wof.FairSiteWindow.window_.divMain
  const cp = TWDS.q1('.tw2gui_window_content_pane', wnd)
  if (cp) {
    TWDS.buildwindow.buttonthing(cp)
  }
}

TWDS.buildwindow.startfunc = function () {
  window.BuildWindow.TWDS_backup_init = window.BuildWindow.TWDS_backup_init ||
    window.BuildWindow.init
  window.BuildWindow.init = TWDS.buildwindow.init
  west.wof.FairSiteWindow.TWDS_backup_open = west.wof.FairSiteWindow.TWDS_backup_open || west.wof.FairSiteWindow.open
  west.wof.FairSiteWindow.open = TWDS.buildwindow.fairopen
  TWDS.registerSetting('bool', 'misc_buildwindow',
    TWDS._('BUILDWINDOW_SETTING', 'Add cloth button to the build window.'),
    false, null, 'misc')
  TWDS.registerSetting('bool', 'misc_buildwindow_wof',
    TWDS._('BUILDWINDOW_SETTING_WOF', 'Add cloth button to the fair construction window.'),
    true, null, 'misc')
}

TWDS.registerStartFunc(function () {
  TWDS.buildwindow.startfunc()
})
