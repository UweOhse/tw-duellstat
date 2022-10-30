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

TWDS.registerStartFunc(function () {
  MarketWindow.Buy._TWDS_backup_updateCategory = MarketWindow.Buy.updateCategory
  MarketWindow.Buy.updateCategory = TWDS.market.updateCategory
})

// duel protection.
TWDS.duelprotection = {}
TWDS.duelprotection.interval = 0
TWDS.duelprotection.hack = null
TWDS.duelprotection.updateMouseover = function () {
  const mand = Character.getMandatoryDuelProtection(true)
  const opt = Character.getDuelProtection(true)
  const now = (new window.ServerDate()).getTime()
  let str = ''
  let vgl = -1
  if (mand > now) {
    str = 'Duel suspension until ' + (new Date(mand)).toLocaleString()
    TWDS.duelprotection.hack.css({
      'background-color': '#f446'
    })
    vgl = mand
  } else if (opt > now) {
    str = 'Duel protection until ' + (new Date(opt)).toLocaleString()
    vgl = opt
    TWDS.duelprotection.hack.css({
      'background-color': '#cc46'
    })
  } else {
    TWDS.duelprotection.hack.css({
      'background-color': '#4a43'
    })
  }
  if (vgl !== -1) {
    const remain = Math.max((vgl - now) / 1000, 0) // ms
    const remainstr = remain.formatDuration()
    if (remain > 0) {
      str += ' (' + remainstr + ')'
    }
    str += '.\n'
  }
  const mot1 = Character.duelMotivation
  const mot2 = Character.npcDuelMotivation
  str += '<p>Duel motivation</p>'
  str += '<table>'
  str += '<tr><th>PC'
  str += '<td><meter min="0" low="0" optimum="1" high="1" max="1" value="' + mot1 + '"></meter>'
  str += '<td>' + parseInt(100 * mot1)
  str += '<tr><th>NPC'
  str += '<td><meter min="0" low="0" optimum="1" high="1" max="1" value="' + mot2 + '"></meter>'
  str += '<td>' + parseInt(100 * mot2)
  str += '</table>'
  str += '<p>The duel motivation is valid after you opened the duels menu. Unfortunately the data is not updated earlier.</p>'
  TWDS.duelprotection.hack.addMousePopup(str)
}
TWDS.duelprotection.init = function (active) {
  if (!active) {
    if (TWDS.duelprotection.interval) {
      clearInterval(TWDS.duelprotection.interval)
      TWDS.duelprotection.interval = 0
    }
    if (TWDS.duelprotection.hack !== null) {
      TWDS.duelprotection.hack.removeMousePopup()
      TWDS.duelprotection.hack.remove()
    }
    return
  }

  if (TWDS.settings.misc_duelprotection_display) {
    const cl = $('#ui_character_container')
    const hack = $("<div id='TWDS_duelprotection_hack' />")
    hack.css({
      position: 'relative',
      background: "url('" + Game.cdnURL + "/images/interface/dock_icons.png?4')",
      width: '52px',
      height: '52px',
      cursor: 'pointer',
      'background-size': 'auto',
      display: 'inline-block',
      right: '-4px',
      top: '24px',
      'background-position-x': '-52px',
      'background-position-y': '-52px',
      'border-radius': '50%',
      'background-color': '#7776'
    })
    $(cl).append(hack)
    $(hack).hover(TWDS.duelprotection.updateMouseover)
    TWDS.duelprotection.hack = hack
    // update the bg color, too.
    TWDS.duelprotection.updateMouseover()
    TWDS.duelprotection.interval = setInterval(TWDS.duelprotection.updateMouseover, 60 * 1000)
  }
}
TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'misc_duelprotection_display',
    'Show a duel protection overlay on your image', true, TWDS.duelprotection.init)
})
