// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.market = {}
TWDS.market.hasBonus = function (item) {
  const bonusExtractor = new west.item.BonusExtractor(Character, item.getItemLevel())

  let fbs = item.bonus.fortbattle
  if (fbs.offense || fbs.defense || fbs.resistance) {
    return true
  }
  fbs = item.bonus.fortbattlesector
  if (fbs.damage || fbs.offense || fbs.defense) {
    return true
  }
  for (let k = 0; k < item.bonus.item.length; k++) {
    if (typeof item.bonus.item[k] === 'undefined') continue
    if (item.bonus.item[k].type === 'character') continue
    if (item.bonus.item[k].type === 'fortbattle') {
      if (bonusExtractor.getValue(item.bonus.item[k]) > 0) return true
      continue
    }
    const bt = item.bonus.item[k].type
    if (['speed', 'regen', 'luck', 'pray', 'experience', 'dollar', 'damage', 'drop'].indexOf(bt) !== -1) {
      if (bonusExtractor.getValue(item.bonus.item[k]) > 0) return true
    }
  }
  if (item.usebonus && item.usebonus.length) {
    // text parsing :-(
    return true
  }
  return false
}
TWDS.market.filter = function (mode, cat) {
  const p = $('#mpb_' + cat + '_content p')
  p.show()
  if (!mode) return
  for (let i = 0; i < TWDS.market[cat].length; i++) {
    const item = ItemManager.get(TWDS.market[cat][i])
    if (item) {
      if (!TWDS.market.hasBonus(item)) { $(p[i]).hide() }
    }
  }
}
TWDS.market.handleFilterChange = function () {
  const x = document.querySelector('#mpb_marketoffers .tw2gui_accordion_categorybar.accordion_opened')
  if (!x) return
  const id = x.id
  const m = id.match(/^mpb_(.*)/)
  let combo = document.getElementById('TWDS_market_filters_value')
  if (combo && m) {
    const col1 = document.getElementById('buyFilterIsCollect')
    const col2 = document.getElementById('buyFilterIsCollect2')
    if (col1) col1.guiElement.setSelected(false, true)
    if (col2) col2.guiElement.setSelected(false, true)
    combo = combo.value
    if (combo === 'none') {
      TWDS.market.filter(false, m[1])
    } else if (combo === 'collect') {
      if (col1) col1.guiElement.toggle()
    } else if (combo === 'collect2') {
      if (col2) col2.guiElement.toggle()
    } else {
      TWDS.market.filter(true, m[1])
    }
  }
}
TWDS.market.updateCategory = function (category, data) {
  TWDS.market[category] = data
  const old = document.getElementById('TWDS_market_filters')
  if (!old) {
    const combo = new west.gui.Combobox('TWDS_market_filters')
    combo.addItem('none', 'none')
    combo.addItem('bonus', 'bonus')
    let e = document.getElementById('buyFilterIsCollect')
    if (e) {
      e.style.display = 'none'
      combo.addItem('collect', 'collect')
    }
    e = document.getElementById('buyFilterIsCollect2')
    if (e) {
      e.style.display = 'none'
      combo.addItem('collect2', 'missing')
    }
    combo.addListener(TWDS.market.handleFilterChange)

    const sb = document.querySelector('.market-buy .searchbox')
    sb.appendChild(combo.divMain[0])
    sb.style.marginTop = '-5px'
    combo.select('none')
    /*
    let chb = new west.gui.Checkbox("bonus only", false, TWDS.market.handleFilter)
    chb.setSelected(false);
    chb.setId('TWDS_market_bonusfilter_chb');
    chb.setTooltip('filter for special bonus');
    old=chb.getMainDiv()[0]
    */
  }
  const ret = MarketWindow.Buy._TWDS_backup_updateCategory(category, data)
  if (old) {
    if (old.classList.contains('tw2gui_checkbox_checked')) {
      TWDS.market.filter(true, category)
    }
  }
  return ret
}
TWDS.jobwindow = {}
TWDS.jobwindow.initView = function () {
  this._TWDS_backup_initView()
  const d = this.window.divMain
  const id = this.jobId
  const x = TWDS.jobData['job_' + id]
  if (d && x && x.job_maxdmg) {
    const h = Character.health / Math.max(1, Character.maxHealth) / 9
    const m = TWDS.createElement({
      nodeName: 'meter',
      min: 0,
      optimum: 0,
      high: h,
      max: 1,
      value: x.job_maxdmg / 100
    })
    m.style.display = 'block'
    m.style.width = '100px'
    m.title = 'an injury costs up to ' + x.job_maxdmg + '% of your maximum health. The meter is calculated based on 9 jobs.'
    const dan = d.querySelector('.cprog_danger')
    if (dan) {
      dan.appendChild(m)
    }
  }
}

TWDS.registerStartFunc(function () {
  MarketWindow.Buy._TWDS_backup_updateCategory = MarketWindow.Buy.updateCategory
  MarketWindow.Buy.updateCategory = TWDS.market.updateCategory
  JobWindow.prototype._TWDS_backup_initView = JobWindow.prototype.initView
  JobWindow.prototype.initView = TWDS.jobwindow.initView
})

// vim: tabstop=2 shiftwidth=2 expandtab
