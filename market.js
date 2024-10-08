// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.marketwindow = {}
TWDS.marketwindow.item = null
TWDS.marketwindow.bulkmodeactive = false
TWDS.marketwindow.bulkmodetimeout = -1
TWDS.marketwindow.createMarketOffer = function (source) {
  // MarketWindow._TWDS_backup_createMarketOffer.apply(this, arguments)
  MarketWindow._TWDS_backup_createMarketOffer(source)
  const itemid = (typeof source === 'number' ? source : $(source).data('itemId'))
  console.log('createMarketWindow this', this, 'source', source, '#', itemid)
  TWDS.marketwindow.item = ItemManager.get(itemid)
}
TWDS.marketwindow.enhanceit = function (thing) {
  thing.divMain[0].classList.add('TWDS_enhanced') // for utils.js
  const te = TWDS.q1('.tw2gui_inner_window_title .textart_title', thing.divMain)
  if (te) {
    te.textContent = TWDS.marketwindow.item.name
  }

  // description.
  const savedesc = TWDS.createElement('div', {
    className: 'tw2gui-iconset tw2gui-icon-save TWDS_marketwindow_save',
    title: TWDS._('AUCTION_SAVE_FOR_FUTURE_SALES', 'Save for future sales'),
    dataset: {
      sel: '#auction_description',
      name: 'TWDS_marketwindow_description'
    },
    style: {
      display: 'inline-block'
    }
  })
  document.querySelector('#auction_description').parentNode.appendChild(savedesc)
  if (window.localStorage.TWDS_marketwindow_description !== null) {
    $('#auction_description').val(window.localStorage.TWDS_marketwindow_description)
  }

  // min and max price handling
  const makeit = function (name) {
    const cur = window.localStorage['TWDS_marketwindow_' + name] || ''
    const t = TWDS.createEle('select', {
      id: 'TWDS_marketwindow_select_base_' + name,
      title: TWDS._('AUCTION_SAVE_FOR_FUTURE_SALES', 'Save for future sales'),
      style: {
        backgroundColor: 'gainsboro',
        borderColor: 'dimgray'
      },
      children: [
        {
          nodeName: 'option',
          textContent: '---',
          value: '',
          selected: cur === ''
        },
        {
          nodeName: 'option',
          value: 'min',
          textContent: TWDS._('AUCTION_PRICE_MINIMUM', 'min. price'),
          selected: cur === 'min'
        },
        {
          nodeName: 'option',
          textContent: TWDS._('AUCTION_PRICE_REGULAR', 'regular'),
          value: 'regular',
          selected: cur === 'regular'
        }
      ]
    })
    return t
  }
  const minpricesel = makeit('min')
  const maxpricesel = makeit('max')

  const pricerow = TWDS.createEle('tr', {
    children: [
      {
        nodeName: 'td',
        colSpan: '2',
        style: {
          textAlign: 'right'
        },
        children: [minpricesel,
          {
            nodeName: 'div',
            className: 'tw2gui-iconset tw2gui-icon-save TWDS_marketwindow_save',
            id: 'TWDS_marketwindow_save_base_min',
            title: TWDS._('AUCTION_SAVE_FOR_FUTURE_SALES', 'Save for future sales'),
            dataset: {
              sel: '#TWDS_marketwindow_select_base_min',
              name: 'TWDS_marketwindow_min'
            },
            style: {
              display: 'inline-block'
            }
          }]
      },
      {
        nodeName: 'td',
        colSpan: '2',
        style: {
          textAlign: 'right'
        },
        children: [maxpricesel,
          {
            nodeName: 'div',
            className: 'tw2gui-iconset tw2gui-icon-save TWDS_marketwindow_save',
            id: 'TWDS_marketwindow_save_base_max',
            title: TWDS._('AUCTION_SAVE_FOR_FUTURE_SALES', 'Save for future sales'),
            dataset: {
              sel: '#TWDS_marketwindow_select_base_max',
              name: 'TWDS_marketwindow_max'
            },
            style: {
              display: 'inline-block'
            }
          }]
      }
    ]
  })
  const table = document.querySelector('#market_min_bid').closest('table')
  table.insertBefore(pricerow, table.firstChild)
  const changebaseprice = function (ele, target) {
    const v = ele.value
    if (v === '') { document.querySelector(target).value = '' }
    if (v === 'min') { document.querySelector(target).value = TWDS.marketwindow.item.sell_price || Math.round(TWDS.marketwindow.item.price / 2) }
    if (v === 'regular') { document.querySelector(target).value = TWDS.marketwindow.item.price || 1 }
  }
  document.querySelector('#TWDS_marketwindow_select_base_min').onchange = function () {
    changebaseprice(this, '#market_min_bid')
    $('#market_min_bid').change()
    $('#market_min_bid').keyup()
  }
  document.querySelector('#TWDS_marketwindow_select_base_max').onchange = function () {
    changebaseprice(this, '#market_max_price')
    $('#market_max_price').change()
    $('#market_max_price').keyup()
  }

  const mindefault = window.localStorage.TWDS_marketwindow_min || ''
  const maxdefault = window.localStorage.TWDS_marketwindow_max || ''
  let e = $('#market_min_bid', thing.divMain)
  if (e.length) {
    e[0].type = 'number'
    if (mindefault === 'min') {
      e[0].value = TWDS.marketwindow.item.sell_price || Math.round(TWDS.marketwindow.item.price / 2)
      e.change()
    }
    if (mindefault === 'regular') {
      e[0].value = TWDS.marketwindow.item.price || 1
      e.change()
    }
  }
  e = $('#market_max_price', thing.divMain)
  if (e.length) {
    e[0].type = 'number'
    if (maxdefault === 'min') {
      e[0].value = TWDS.marketwindow.item.sell_price || Math.round(TWDS.marketwindow.item.price / 2)
      e.change()
    }
    if (maxdefault === 'regular') {
      e[0].value = TWDS.marketwindow.item.price || 1
      e.change()
    }
  }

  e = $('#market_sell_itemStack', thing.divMain)
  if (e.length) {
    e[0].type = 'number'
    e[0].min = 1

    e[0].max = Bag.getItemByItemId(TWDS.marketwindow.item.item_id).count

    const x = TWDS.createElement('input', {
      type: 'checkbox',
      id: 'TWDS_marketwindow_multiplier',
      value: 1,
      checked: false,
      style: {
        backgroundImage: 'url(/images/ranking/town_ranking_icons.png)',
        display: 'inline-block',
        height: '16px',
        width: '16px',
        backgroundPosition: '0px -80px',
        cursor: 'pointer',
        appearance: 'none'
      }
    })
    x.onclick = function () {
      this.checked = false
      const stack = document.querySelector('#market_sell_itemStack')
      const count = stack.value
      const max = document.querySelector('#market_max_price')
      if (max && parseInt(max.value) > 0) {
        max.value = max.value * count
        $(max).keyup()
      }
      const min = document.querySelector('#market_min_bid')
      if (min && parseInt(min.value.trim()) > 0) {
        min.value = min.value * count
        $(min).keyup()
      }
    }
    e[0].parentNode.parentNode.appendChild(x)
  }
  e = $('#market_sell_itemAuctions', thing.divMain)
  if (e.length) {
    e[0].type = 'number'
    e[0].min = 1
    e[0].max = Bag.getItemByItemId(TWDS.marketwindow.item.item_id).count
  }

  // bulk mode
  const h4 = TWDS.q1('#market_createoffer_window .txcenter > span')
  if (h4) {
    const prev = h4.previousSibling
    if (prev.nodeType === 1 && prev.nodeName === 'BR') {
      prev.remove()
    }
    TWDS.createEle({
      nodeName: 'div',
      beforebegin: h4,
      className: 'TWDS_market_bulkmode_container ' + (TWDS.marketwindow.bulkmodeactive ? 'TWDS_market_bulkmode_active' : ''),
      children: [
        {
          nodeName: 'input',
          type: 'checkbox',
          checked: TWDS.marketwindow.bulkmodeactive,
          onchange: function (x) {
            TWDS.marketwindow.bulkmodeactive = this.checked
            if (this.checked) {
              this.parentNode.classList.add('TWDS_market_bulkmode_active')
            } else {
              this.parentNode.classList.remove('TWDS_market_bulkmode_active')
              TWDS.marketwindow.bulkmodetimeoutfn()
            }
          },
          id: 'TWDS_market_bulkmode_input'
        }, {
          nodeName: 'b',
          textContent: TWDS._('MARKETWINDOW_BULKMODE', 'bulk mode')
        }
      ]
    })
  }
  const oo = document.querySelector('#mps_otheroffers')
  if (oo) {
    const p = oo.parentNode
    if (!TWDS.settings.market_bulkmode_help_read) {
      TWDS.createEle({
        nodeName: 'div',
        className: 'TWDS_market_bulkmode_help',
        last: p,
        style: { border: '1px solid #000' },
        children: [
          {
            nodeName: 'div',
            innerHTML: TWDS._('MARKETWINDOW_BULKMODE_HELP', 'bulk mode: inventory and sale list will updated after a pause of some seconds.<br>This seriously reduces the number of streak of bad luck events.')
          },
          {
            nodeName: 'button',
            textContent: TWDS._('MARKETWINDOW_BULKMODE_READ', 'read and understand, now remove the help text'),
            onclick: function () {
              this.closest('.TWDS_market_bulkmode_help').remove()
              TWDS.settings.market_bulkmode_help_read = true
              TWDS.saveSettings()
            }
          }
        ]
      })
    }
  }
  // +1/2 feature
  const mmb = document.querySelector('#market_min_bid')
  if (mmb) {
    const tr = mmb.closest('tr')
    const addfn = function (mod, ele) {
      console.log('ADD', mod, ele, ele.value)
      ele.value = ele.value * (1.0 + parseFloat(mod))
      $(ele).trigger('change')
      console.log('ADD-END', mod, ele, ele.value)
    }
    const addfn1 = function () {
      const i = TWDS.q1('#market_min_bid')
      if (i) {
        addfn(this.dataset.mod, i)
      }
    }
    const addfn2 = function () {
      const i = TWDS.q1('#market_max_price')
      if (i) {
        addfn(this.dataset.mod, i)
      }
    }
    TWDS.createEle({
      after: tr,
      nodeName: 'tr',
      className: 'TWDS_surcharge_line',
      children: [
        { nodeName: 'td', textContent: TWDS._('MARKETWINDOW_SURCHARGE', 'Surcharge:') },
        {
          nodeName: 'td',
          children: [
            { nodeName: 'span', textContent: '+100%', dataset: { mod: 1 }, onclick: addfn1 },
            { nodeName: 'span', textContent: '+200%', dataset: { mod: 2 }, onclick: addfn1 }
          ]
        },
        { nodeName: 'td', textContent: '' },
        {
          nodeName: 'td',
          children: [
            { nodeName: 'span', textContent: '+50%', dataset: { mod: 0.5 }, onclick: addfn2 },
            { nodeName: 'span', textContent: '+100%', dataset: { mod: 1 }, onclick: addfn2 }
          ]
        }
      ]
    })
  }

  // save button: auction length
  const savedays = TWDS.createElement('div', {
    id: 'TWDS_marketwindow_save_days',
    className: 'tw2gui-iconset tw2gui-icon-save TWDS_marketwindow_save',
    title: TWDS._('AUCTION_SAVE_FOR_FUTURE_SALES', 'Save for future sales'),
    style: {
      cursor: 'pointer',
      display: 'inline-block'
    },
    dataset: {
      sel: '#market_days_value',
      name: 'TWDS_marketwindow_days'
    }
  })
  document.querySelector('#msd_days').appendChild(savedays)
  if (window.localStorage.TWDS_marketwindow_days !== null) {
    const t = window.localStorage.TWDS_marketwindow_days
    console.log('T', t, t || 1)
    $('#market_days').guiElement().select(t || 1)
  }

  // save button: auction rights
  const saverights = TWDS.createElement('div', {
    id: 'TWDS_marketwindow_save_rights',
    className: 'tw2gui-iconset tw2gui-icon-save TWDS_marketwindow_save',
    title: TWDS._('AUCTION_SAVE_FOR_FUTURE_SALES', 'Save for future sales'),
    style: {
      cursor: 'pointer',
      display: 'inline-block'
    },
    dataset: {
      sel: '#market_rights_value',
      name: 'TWDS_marketwindow_rights'
    }
  })
  const r = document.querySelector('#msd_rights')
  if (r) {
    document.querySelector('#msd_rights').appendChild(saverights)
    if (window.localStorage.TWDS_marketwindow_rights !== null) {
      const t = window.localStorage.TWDS_marketwindow_rights
      console.log('changing rights', t, typeof t)
      $('#market_rights').guiElement().select(t)
    }
    const items = $('span#market_rights.tw2gui_combobox', r).guiElement().items
    if (items.length === 3) {
      const modes = ['home', 'flag', 'world']
      for (let i = 0; i < items.length; i++) {
        items[i].node[0].innerHTML = '<span class="tw2gui-iconset tw2gui-icon-' +
            modes[items[i].value] +
            '" style="display: inline-block;position: relative;top: 4px;"></span>&nbsp;' +
            items[i].node[0].innerHTML
      }
      const ve = TWDS.q1('#market_rights_value')
      if (ve) {
        const v = parseInt(ve.value)
        for (let i = 0; i < items.length; i++) {
          if (items[i].value === v) {
            const str = items[i].node[0].innerHTML
            const te = TWDS.q1('#market_rights .tw2gui_combobox_text span')
            te.innerHTML = str
          }
        }
      }
    }
  }

  $('.TWDS_marketwindow_save').on('click', function () {
    const sel = this.dataset.sel
    const name = this.dataset.name
    window.localStorage[name] = document.querySelector(sel).value;
    (new UserMessage(TWDS._('AUCTION_DATA_SAVED', 'saved'), UserMessage.TYPE_SUCCESS)).show()
  })
  $('#market_min_bid').trigger('keyup')

  // remove TWDB stuff if active
  window.setTimeout(function () { // why does clothcalc does that?
    const ele = document.querySelector('#twdb_msd_mult_cc')
    if (ele) ele.remove()
  }, 75)
}

TWDS.marketwindow.showwrapper = function () {
  const thing = this._TWDS_marketwindow_backup_show()
  if (TWDS.settings.marketwindow_enhancements) {
    if (this.divMain.attr('id') === 'market_createoffer_window') {
      window.setTimeout(function () { // why does clothcalc does that?
        TWDS.marketwindow.enhanceit(thing)
      }, 25)
    }
  }
  return thing
}

TWDS.marketwindow.hasBonus = function (item) {
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
    return true
  }
  return false
}

TWDS.marketwindow.filtermode = 'none'
TWDS.marketwindow.filter = function (mode, cat) {
  console.time('FILTER')
  console.log('FILTERING', mode, cat)
  const p = $('#mpb_' + cat + '_content p')
  p.show()
  if (mode === 'none') {
    console.timeEnd('FILTER')
    return
  }
  if (mode === 'craft') { // load my recipes when needed.
    if (!TWDS.crafting.ready) {
      TWDS.crafting.asyncloader().then(function () {
        TWDS.marketwindow.filter(mode, cat)
      })
      return
    }
  }

  for (let i = 0; i < TWDS.marketwindow[cat].length; i++) {
    const item = ItemManager.get(TWDS.marketwindow[cat][i])
    if (!item) { // ECANTHAPPEN
      $(p[i]).hide()
      continue
    }
    // if the thing has a usebonus, then it has to match that bonus or "bonus".
    if (item.usebonus) {
      if (mode !== 'missing') {
        if (mode === 'bonus') continue
        if (!TWDS.quickusables.match(item, mode)) {
          $(p[i]).hide()
        }
        continue
      }
    }
    if (mode === 'bonus') {
      if (!TWDS.marketwindow.hasBonus(item)) { $(p[i]).hide() }
    } else if (mode === 'set') {
      if (!item.set) { $(p[i]).hide() }
    } else if (mode === 'noset') {
      if (item.set) { $(p[i]).hide() }
    } else if (mode === 'craft') {
      if (!(item.item_id in TWDS.crafting.mycraftresources)) {
        $(p[i]).hide()
      }
    } else if (mode === 'collect') {
      if (!TWDS.collections.isMissing(item.item_id)) {
        $(p[i]).hide()
      }
    } else if (mode === 'missing') {
      const x = Bag.getItemsByBaseItemId(item.item_base_id)
      if (x.length) {
        $(p[i]).hide()
      }
    } else {
      $(p[i]).hide()
    }
  }
  console.timeEnd('FILTER')
}
TWDS.marketwindow.handleFilterChange = function () {
  const x = document.querySelector('#mpb_marketoffers .tw2gui_accordion_categorybar.accordion_opened')
  if (!x) return
  const id = x.id
  const m = id.match(/^mpb_(.*)/)
  let combo = document.getElementById('TWDS_marketwindow_filters_value')
  if (combo && m) {
    const col1 = document.getElementById('buyFilterIsCollect')
    const col2 = document.getElementById('buyFilterIsCollect2')
    if (col1) col1.guiElement.setSelected(false, true)
    if (col2) col2.guiElement.setSelected(false, true)
    let e = TWDS.q1('#buyFilterIsCollect')
    if (e) e.style.display = 'none'
    e = TWDS.q1('#buyFilterIsCollect2')
    if (e) e.style.display = 'none'
    combo = combo.value
    TWDS.marketwindow.filtermode = combo
    TWDS.marketwindow.filter(combo, m[1])
  }
}
TWDS.marketwindow.updateCategory = function (category, data) {
  return TWDS.marketwindow.updateCategoryReal(category, data)
}
TWDS.marketwindow.updateCategoryReal = function (category, data) {
  TWDS.marketwindow[category] = data
  console.log('updateCategory-2', category, data)
  const old = document.getElementById('TWDS_marketwindow_filters')
  if (!old) {
    const combo = new west.gui.Combobox('TWDS_marketwindow_filters')
    combo.addItem('none', TWDS._('MARKETWINDOW_FILTER_NONE', 'none'))
    combo.addItem('bonus', TWDS._('MARKETWINDOW_FILTER_BONUS', 'bonus equipment'))
    combo.addItem('set', TWDS._('MARKETWINDOW_FILTER_SET', 'set items'))
    combo.addItem('noset', TWDS._('MARKETWINDOW_FILTER_NOSET', 'items without set '))
    combo.addItem('collect', TWDS._('MARKETWINDOW_FILTER_COLLECT', 'collect'))
    combo.addItem('craft', TWDS._('MARKETWINDOW_FILTER_CRAFT', 'crafting'))
    combo.addItem('missing', TWDS._('MARKETWINDOW_FILTER_MISSING', 'missing'))
    const qc = TWDS.quickusables.getcategories(1) // kind 1: market
    for (let i = 0; i < qc.length; i++) {
      combo.addItem(qc[i], TWDS.quickusables.getcatdesc(qc[i]))
    }
    combo.addListener(TWDS.marketwindow.handleFilterChange)

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
    TWDS.marketwindow.filter(TWDS.marketwindow.filtermode, category)
  }
  const x = TWDS.q('#mpb_' + category + '_content .tw2gui_scrollpane_clipper_contentpane p')
  if (x && x.length === data.length) {
    for (let i = 0; i < data.length; i++) {
      const ii = data[i]
      const c = Bag.getItemCount(ii)
      x[i].dataset.bagitemcount = c
      if (TWDS.storage.isMissing(ii)) {
        const si = TWDS.storage.iteminfo(ii)
        x[i].classList.add('TWDS_storage_missing')
        x[i].dataset.want = si[0]
        x[i].dataset.have = si[1]
      }
      if (TWDS.collections.isMissing(ii)) {
        x[i].classList.add('TWDS_collection_missing')
      }
      /*
      const d = TWDS.items.data[ii]
      if (d) {
        if (d.time) {
          let border=300*d.time*60;
        }
        x[i].classList.add('TWDS_collection_missing')
      }
      */
      // x[i].textContent+= " ["+c+"]";
    }
  }
  return ret
}
TWDS.marketwindow.buyupdateTable = function (data) {
  return TWDS.marketwindow.buyupdateTableReal(data)
}
TWDS.marketwindow.buyupdateTableReal = function (data) {
  console.log('data is', data)
  const ret = MarketWindow.Buy._TWDS_backup_updateTable(data)
  console.log('orig returned', ret)
  const tab = MarketWindow.buyTable.getMainDiv()[0]
  for (let i = 0; i < data.length; i++) {
    const offer = data[i]
    const moid = offer.market_offer_id
    const ii = offer.item_id
    const sp = offer.singleMaxPrice

    //    let x= e(MarketWindow.offerTable.getMainDiv()).children().find(".marketBidsData_" + r.market_offer_id).append(i);
    const x = TWDS.q1('.marketOffersData_' + moid + ' .mpb_buynow span', tab)
    if (!x) continue
    const d = TWDS.items.data[ii]
    if (d && sp) {
      if (d.time) {
        const g = parseFloat(TWDS.settings.market_buy_perhour_green) || 1500.0
        const b = parseFloat(TWDS.settings.market_buy_perhour_blue) || 2000.0
        const r = parseFloat(TWDS.settings.market_buy_perhour_red) || 2500.0
        const perhour = sp / (d.time)
        x.title = '$' + sp + '/unit, $' + perhour.toFixed(1) + '/h'
        if (r || g || b) {
          if (g && perhour < g) {
            x.classList.add('TWDS_market_buy_green')
          } else if (b && perhour < b) {
            x.classList.add('TWDS_market_buy_blue')
          } else if (r && perhour > r) {
            x.classList.add('TWDS_market_buy_red')
          }
        }
      }
    }
  }
  /*
for (var n = 0; n < da.length; n++) {
var r = t[n];
var i = e('<div class="mpo_alert" />');
e(MarketWindow.offerTable.getMainDiv()).children().find(".marketBidsData_" + r.market_offer_id).append(i);
if (!r.isFinished) {
              i.append(f(r))
          }
}

  MarketWindow.Buy._TWDS_backup_updateCategory = MarketWindow.Buy.updateCategory
  */
  return ret
}
TWDS.marketwindow.sellupdateTableReal = function (data) {
  console.log('SELL', 'data', data)
  const ret = MarketWindow.Sell._TWDS_backup_updateTable(data)
  console.log('SELL', 'ret', ret)
  const stat = {
    num_sold: 0,
    num_bid: 0,
    num_unbid: 0,
    dollar_sold: 0,
    dollar_bid: 0,
    dollar_unbid: 0
  }
  for (let i = 0; i < data.length; i++) {
    const d = data[i]
    const id = d.item_id
    const it = ItemManager.get(id)
    const bidder = d.bidder_player_id
    if (bidder) {
      if (d.auction_ends_in) {
        stat.num_bid++
        stat.dollar_bid += d.current_bid
      } else {
        stat.num_sold++
        stat.dollar_sold += d.current_bid
      }
    } else {
      stat.num_unbid++
      if (it.sellable) {
        stat.dollar_unbid += it.sell_price * d.item_count
      }
    }
  }
  console.log('posten: ', data.length)
  console.log('mit gebot: ', stat.w_bid)
  console.log('ohne gebot: ', stat.wo_bid)
  console.log('summe gebote: ', stat.dollar_bid)
  console.log('summe rest: ', stat.dollar_unsold)
  console.log('this', this, MarketWindow)
  // paranoia?
  if (TWDS.settings.market_sellstat && data.length) {
    if (MarketWindow && MarketWindow.sellTable && MarketWindow.sellTable.divMain && MarketWindow.sellTable.divMain[0]) {
      const rf = TWDS.q1('.row_foot', MarketWindow.sellTable.divMain[0])
      if (rf) {
        let ss = TWDS.q1('.TWDS_sellstat', rf)
        if (!ss) {
          for (let i = 0; i < 8; i++) {
            const t = TWDS.q1('.cell_' + i, rf)
            if (t) t.remove()
          }
          ss = TWDS.createEle({
            nodeName: 'div.cell_0.TWDS_sellstat',
            colSpan: 8,
            first: rf
          })
        }
        ss.textContent = TWDS._('MARKETWINDOW_SELLSTAT',
          '$entries$ entries. $num_sold$ sold, $num_bid$ w/ bid, $num_unbid$ w/o bid. $$dollar_sold$ sold, $$dollar_bid$ bids, $$dollar_unbid$ rest.', {
            entries: data.length,
            num_sold: stat.num_sold,
            num_bid: stat.num_bid,
            num_unbid: stat.num_unbid,
            dollar_sold: stat.dollar_sold,
            dollar_bid: stat.dollar_bid,
            dollar_unbid: stat.dollar_unbid
          }
        )
      }
    }
  }
  return ret
}
TWDS.marketwindow.sellupdateTable = function (data) {
  return TWDS.marketwindow.sellupdateTableReal(data)
}

TWDS.registerStartFunc(function () {
  MarketWindow.Buy._TWDS_backup_updateCategory = MarketWindow.Buy.updateCategory
  MarketWindow.Buy.updateCategory = TWDS.marketwindow.updateCategory
  MarketWindow.Buy._TWDS_backup_updateTable = MarketWindow.Buy.updateTable
  MarketWindow.Buy.updateTable = TWDS.marketwindow.buyupdateTable
  MarketWindow.Sell._TWDS_backup_updateTable = MarketWindow.Sell.updateTable
  MarketWindow.Sell.updateTable = TWDS.marketwindow.sellupdateTable
  TWDS.registerSetting('int', 'market_buy_perhour_green',
    'Mark offers green if an item costs less then ... dollars per hour of base item collection time',
    0, null, 'Market')
  TWDS.registerSetting('int', 'market_buy_perhour_blue',
    'Mark offers blue if an item costs less then ... dollars per hour of base item collection time',
    0, null, 'Market')
  TWDS.registerSetting('int', 'market_buy_perhour_red',
    'Mark offers red if an item costs more then ... dollars per hour of base item collection time',
    0, null, 'Market')
  TWDS.registerSetting('bool', 'market_sellstat',
    'Add a statistic to the market sell window',
    true, null, 'Market')
})

TWDS.trader = {}
TWDS.trader.currenttrader = null
TWDS.trader.inventory = []
TWDS.trader.open = function (type, townid, coordX, coordY) {
  TWDS.trader.currenttrader = type
  TWDS.trader.inventory = []
  const retcode = window.Trader._twds_backup_open(type, townid, coordX, coordY)
  if (type !== 'general' && type !== 'gunsmith' && type !== 'tailor') {
    return retcode
  }
  const w = wman.getById(type)
  if (!w) {
    return retcode
  }
  const cp = TWDS.q1('.tw2gui_window_content_pane', w.divMain)
  console.log('ts', cp)
  if (cp) {
    if (TWDS.settings.town_shop_collect_switch) {
      TWDS.createEle({
        nodeName: 'input',
        className: 'TWDS_trader_filter_collectibles',
        type: 'checkbox',
        title: TWDS._('MARKET_TOWN_SHOP_FILTER_COLLECTIBLES', 'show only collectibles'),
        beforeend: cp
      })
    }
    if (TWDS.settings.town_shop_search) {
      TWDS.createEle({
        nodeName: 'input',
        className: 'TWDS_trader_town_shop_search',
        type: 'text',
        title: TWDS._('MARKET_TOWN_SHOP_SEARCH', 'Search'),
        placeholder: 'search',
        beforeend: cp
      })
    }
  }
  return retcode
}

TWDS.trader.addItemToInv = function (itemid) {
  TWDS.trader.inventory.push(itemid)
  window.Trader._twds_backup_addItemToInv(itemid)
}
TWDS.trader.filterchange = function () {
  const search = TWDS.q1('.TWDS_trader_town_shop_search')
  let searchstr
  if (search) { searchstr = search.value.toLocaleLowerCase() }
  const col = TWDS.q1('.TWDS_trader_filter_collectibles')
  let checked = false
  if (col) { checked = col.checked }
  window.Trader.inv = {} // no other way to do it.
  for (let i = 0; i < TWDS.trader.inventory.length; i++) {
    const itemid = TWDS.trader.inventory[i]
    if (searchstr > '') {
      const it = ItemManager.get(itemid)
      if (it.name.toLocaleLowerCase().search(searchstr) === -1) { continue }
    }
    if (!checked || !TWDS.collections.loaded) {
      window.Trader._twds_backup_addItemToInv(itemid)
    } else {
      if (TWDS.collections.isMissing(itemid)) {
        window.Trader._twds_backup_addItemToInv(itemid)
      }
    }
  }
  window.Trader.drawInventory(1)
}

TWDS.registerSetting('bool', 'marketwindow_enhancements',
  TWDS._('AUCTION_SETTING', 'Enhance the market offering window'),
  false, null, 'Market')
TWDS.registerSetting('bool', 'saleProtection',
  TWDS._('CLOTHCACHE_PROTECT', 'Mark the best items for any job, and the items of managed sets (game, tw-calc, ' + TWDS.scriptname + ') unsalable and unauctionable. Page reload needed'),
  true, null, 'Market')
TWDS.marketwindow.offersend = function (obj) {
  if (!TWDS.marketwindow.bulkmodeactive) {
    MarketWindow.Offer._TWDS_backup_send(obj)
    return
  }
  const params = obj
  Ajax.remoteCall('building_market', 'putup', params, function (resp) {
    if (resp.error) { return new UserMessage(resp.msg).show() } else {
      Character.setMoney(resp.msg.money)
      Character.setDeposit(resp.msg.deposit)
      new UserMessage(
        TWDS._('MARKETWINDOW_OFFERED_MSG', 'The goods are offered for sale; the fee is $ $fee$', { fee: resp.msg.costs }), UserMessage.TYPE_SUCCESS).show()
      clearTimeout(TWDS.marketwindow.bulkmodetimeout)
      TWDS.marketwindow.bulkmodetimeout = setTimeout(TWDS.marketwindow.bulkmodetimeoutfn, 8 * 1000)
    }
  }, MarketWindow)
}
TWDS.marketwindow.bulkmodetimeoutfn = function () {
  clearTimeout(TWDS.marketwindow.bulkmodetimeout)
  TWDS.marketwindow.bulkmodetimeout = -1
  EventHandler.signal('inventory_changed')
  MarketWindow.Sell.initData()
}
TWDS.marketwindow.fillmap3 = function (map, table, all) {
  window.MarketWindow.window.hideLoader()
  const additem = function (pa, it, count, fini, withpopup) {
    if (typeof it === 'number' || typeof it === 'string') {
      it = ItemManager.get(it)
    }
    let popup = it.name
    if (withpopup) { popup = new ItemPopup(it, {}).popup.getXHTML() }
    TWDS.createEle({
      nodeName: 'div.item.item_inventory',
      last: pa,
      style: {
        opacity: fini ? 1.0 : 0.65
      },
      childNodes: [
        {
          nodeName: 'img',
          className: 'tw_item item_inventory_img dnd_draggable dnd_dragElem',
          src: it.image,
          alt: it.name,
          title: popup
        },
        {
          nodeName: 'span.count',
          textContent: count,
          style: {
            display: 'block'
          }
        }
      ]
    })
  }

  const towns = []
  for (const town of Object.values(all)) {
    const wt = GameMap.calcWayTime(window.Character.position, { x: town.x, y: town.y })
    town.wt = wt
    town.wtf = wt.formatDuration()
    towns.push(town)
  }
  towns.sort(function (a, b) {
    return a.wt - b.wt
  })
  for (let idx = 0; idx < towns.length; idx++) {
    const town = towns[idx]

    let allfinished = 0
    for (let i = 0; i < town.sales.length; i++) {
      allfinished |= town.sales[i].finished
    }
    for (let i = 0; i < town.bids.length; i++) {
      allfinished |= town.bids[i].finished
    }

    let r = 0
    let g = 0
    if (town.bids.length) r = 10
    if (town.sales.length) g = 10
    if (allfinished) {
      r *= 1.5
      g *= 1.5
    }
    let color = '#'
    color += r.toString(16)
    color += g.toString(16)
    color += '0'

    const ti = TWDS.createEle('div.TWDS_marketmap_town')
    TWDS.createEle('b', {
      textContent: town.name,
      last: ti
    })
    if (town.bids.length) {
      const be = TWDS.createEle('div.bids', { last: ti })
      for (let j = 0; j < 2; j++) {
        for (let i = 0; i < town.bids.length; i++) {
          const b = town.bids[i]
          if ((b.finished && j === 0) || (!b.finished && j > 0)) {
            additem(be, b.item_id, b.item_count, j === 0, false)
          }
        }
      }
    }
    let sold = 0
    let solditems = 0
    let unsold = 0
    let unsolditems = 0
    let openwith = 0
    let openwithitems = 0
    let openwithout = 0
    let openwithoutitems = 0
    let money = 0
    let saleinfo = ''

    if (town.sales.length) {
      for (let i = 0; i < town.sales.length; i++) {
        const b = town.sales[i]
        if (b.finished) {
          if (b.current_bid === b.max_price) {
            sold++
            solditems += b.item_count
            money += b.current_bid
          } else {
            unsold++
            unsolditems += b.item_count
          }
        } else {
          if (b.current_bid) {
            openwith++
            openwithitems += b.item_count
          } else {
            openwithout++
            openwithoutitems += b.item_count
          }
        }
      }
      if (money) {
        saleinfo += TWDS._('MARKETMAP_SALEINFO_SOLD',
          '$$money$ for $offers$ sales of $items$ items.',
          { money: money, offers: sold, items: solditems })
      }
      if (unsold) {
        if (saleinfo !== '') { saleinfo += ' ' }
        saleinfo += TWDS._('MARKETMAP_SALEINFO_UNSOLD',
          '$offers$ offers with $items$ items.',
          { offers: unsold, items: unsolditems })
      }
      if (openwith) {
        if (saleinfo !== '') { saleinfo += ' ' }
        saleinfo += TWDS._('MARKETMAP_SALEINFO_OPENWITH',
          '$open$ offers with $items$ items have bids.',
          { open: openwith, items: openwithitems })
      }
      if (openwithout) {
        if (saleinfo !== '') { saleinfo += ' ' }
        saleinfo += TWDS._('MARKETMAP_SALEINFO_OPENWITHOUT',
          '$open$ offers with $items$ items have no bids.',
          { open: openwithout, items: openwithoutitems })
      }
      TWDS.createEle('div', {
        last: ti,
        innerHTML: saleinfo
      })
    }

    const box = TWDS.maphelper.drawbox(map, town.x, town.y, 7, ti.outerHTML, color, 0, 'town linklike')
    box.onclick = function () {
      TownWindow.open(town.x, town.y)
    }

    let tr = TWDS.createEle('tr.townline', { last: table })
    const td = TWDS.createEle('td', {
      last: tr
    })
    TWDS.createEle('a.townline_name', {
      last: td,
      textContent: town.name,
      title: TWDS._('MARKET_OPEN_TOWNWINDOW', 'Open town window'),
      style: { fontWeight: 'bold' },
      onclick: function () {
        TownWindow.open(town.x, town.y)
      }
    })
    TWDS.createEle('a.townline_center', {
      last: td,
      title: TWDS._('MARKETMAP_SHOW_TOWN', 'Show town on map'),
      onclick: function () {
        console.log('OC', this)
        GameMap.center(town.x, town.y)
      },
      children: [{
        nodeName: 'img',
        src: Game.cdnURL + '/images/icons/center.png'
      }]
    })
    TWDS.createEle('span.townline_dist', {
      last: td,
      title: TWDS._('MARKETMAP_MOVE_TO_TOWN', 'Move to town'),
      onclick: function () {
        console.log('OC', this)
        GameMap.center(town.x, town.y)
      },
      children: [
        {
          nodeName: 'span',
          textContent: TWDS._('MARKETMAP_DISTANCE', 'Distance:')
        },
        {
          nodeName: 'span.linklike',
          innerHTML: town.wtf,
          onclick: function () {
            TaskQueue.add(new window.TaskWalk(town.id, 'town'))
          }
        }
      ]
    })
    if (money) {
      TWDS.createEle('span.money', {
        last: td,
        textContent: '$' + money
      })
    }

    if (town.bids.length) {
      tr = TWDS.createEle('tr', { last: table })
      const td = TWDS.createEle('td', {
        last: tr
      })
      for (let j = 0; j < 2; j++) {
        for (let i = 0; i < town.bids.length; i++) {
          const b = town.bids[i]
          if ((b.finished && j === 0) || (!b.finished && j > 0)) {
            additem(td, b.item_id, b.item_count, j === 0, true)
          }
        }
      }
    }
    if (saleinfo !== '') {
      tr = TWDS.createEle('tr', { last: table })
      TWDS.createEle('td', {
        last: tr,
        textContent: saleinfo
      })
    }
  }
}
TWDS.marketwindow.fillmap2 = function (map, table, all) {
  console.log('filling map with offers')
  Ajax.remoteCall('building_market', 'fetch_offers', {}, function (json) {
    const results = json.msg.search_result
    console.log('results', results)
    for (let i = 0; i < results.length; i++) {
      const r = results[i]
      r.issale = true
      if (r.auction_ends_in < 0 || r.current_bid === r.max_price) {
        // got it.
        r.finished = true
      }
      const t = r.market_town_id
      if (!(t in all)) {
        all[t] = {
          id: t,
          x: r.market_town_x,
          y: r.market_town_y,
          name: r.market_town_name,
          bids: [],
          sales: []
        }
      }
      all[t].sales.push(r)
    }
    TWDS.marketwindow.fillmap3(map, table, all)
  })
}

TWDS.marketwindow.fillmap1 = function (map, table, all) {
  console.log('filling map with bids')
  Ajax.remoteCall('building_market', 'fetch_bids', {}, function (json) {
    if (json.error) { return (new UserMessage(json.msg, UserMessage.TYPE_ERROR)).show() }

    const results = json.msg.search_result
    console.log('results', results)
    for (let i = 0; i < results.length; i++) {
      const r = results[i]
      r.issale = false
      if (r.auction_ends_in < 0 || r.current_bid === r.max_price) {
        // got it.
        r.finished = true
      }
      const t = r.market_town_id
      if (!(t in all)) {
        all[t] = {
          id: t,
          x: r.market_town_x,
          y: r.market_town_y,
          name: r.market_town_name,
          bids: [],
          sales: []
        }
      }
      all[t].bids.push(r)
    }
    TWDS.marketwindow.fillmap2(map, table, all)
  })
}

TWDS.marketwindow.open = function () {
  MarketWindow._TWDS_backup_open.apply(this, arguments)
  const mmt = TWDS._('MARKETMAP_TITLE', 'Marketmap')
  MarketWindow.window.addTab(mmt, 'TWDS_marketmap', function () {
    if (!MarketWindow.window) return

    const p = TWDS.q('div.tw2gui_window_content_pane > *', MarketWindow.window.divMain)
    p.forEach(function (ele) { $(ele).hide() })
    const tab = TWDS.q1('div.tw2gui_window_content_pane > .TWDS_market_map', MarketWindow.window.divMain)

    tab.innerHTML = ''
    const sp = new west.gui.Scrollpane()
    sp.getMainDiv().style.height = '368px'
    sp.getMainDiv().style.marginLeft = '2px'
    tab.appendChild(sp.getMainDiv())

    const wrapper = TWDS.createEle('div')
    sp.appendContent(wrapper)

    const map = TWDS.maphelper.getmap(1.36)
    wrapper.appendChild(map)

    const table = TWDS.createEle('table')
    wrapper.appendChild(table)

    TWDS.maphelper.drawme(map)
    window.MarketWindow.window.setTitle(mmt)
    window.MarketWindow.window.activateTab('TWDS_marketmap')
    window.MarketWindow.window.showLoader()
    TWDS.marketwindow.fillmap1(map, table, {})

    $(tab).show()
  }).appendToContentPane($('<div class="TWDS_market_map"/>'))
}

TWDS.registerStartFunc(function () {
  MarketWindow._TWDS_backup_createMarketOffer = MarketWindow.createMarketOffer
  MarketWindow.createMarketOffer = TWDS.marketwindow.createMarketOffer
  MarketWindow.Offer._TWDS_backup_send = MarketWindow.Offer.send
  MarketWindow.Offer.send = TWDS.marketwindow.offersend
  MarketWindow._TWDS_backup_open = MarketWindow._TWDS_backup_open || MarketWindow.open
  MarketWindow.open = TWDS.marketwindow.open

  west.gui.Dialog.prototype._TWDS_marketwindow_backup_show = west.gui.Dialog.prototype.show
  west.gui.Dialog.prototype.show = TWDS.marketwindow.showwrapper
  const datalist = TWDS.createEle('datalist', {
    id: 'TWDS_marketwindow_bases',
    children: [
      {
        nodeName: 'option',
        value: '',
        textContent: ''
      },
      {
        nodeName: 'option',
        value: 'min',
        textContent: 'min'
      },
      {
        nodeName: 'option',
        value: 'regular',
        textContent: 'regular'
      }
    ],
    style: {
      display: 'none'
    }
  })
  document.body.appendChild(datalist)
  window.Trader._twds_backup_open = window.Trader.open
  window.Trader.open = function (a, b, c, d) { return TWDS.trader.open(a, b, c, d) }
  window.Trader._twds_backup_addItemToInv = window.Trader.addItemToInv
  window.Trader.addItemToInv = function (a) { return TWDS.trader.addItemToInv(a) }
  TWDS.delegate(document.body, 'change', '.TWDS_trader_filter_collectibles', function () {
    TWDS.trader.filterchange()
  })
  TWDS.delegate(document.body, 'change', '.TWDS_trader_town_shop_search', function () {
    TWDS.trader.filterchange()
  })
  TWDS.registerSetting('bool', 'town_shop_collect_switch',
    TWDS._('MARKET_TOWN_SHOP_COLLECT_SWITCH_SETTING',
      'Add a switch to the town traders, to only show missing collectibles.'),
    true, null, 'Market')
  TWDS.registerSetting('bool', 'town_shop_search',
    TWDS._('MARKET_TOWN_SHOP_SEARCH_SETTING',
      'Add a search field to the town traders.'),
    true, null, 'Market')
})

// used when reloading, so the update code will be used.
if ('_TWDS_backup_createMarketOffer' in MarketWindow) {
  MarketWindow.createMarketOffer = TWDS.marketwindow.createMarketOffer
  MarketWindow.Offer.send = TWDS.marketwindow.offersend
  west.gui.Dialog.prototype.show = TWDS.marketwindow.showwrapper
  console.log('auction.js reloaded')
}

// vim: tabstop=2 shiftwidth=2 expandtab
