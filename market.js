// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.marketwindow = {}
TWDS.marketwindow.item = null
TWDS.marketwindow.createMarketOffer = function (source) {
  // MarketWindow._TWDS_backup_createMarketOffer.apply(this, arguments)
  MarketWindow._TWDS_backup_createMarketOffer(source)
  console.log('createMarketWindow this', this, 'source', source)
  TWDS.marketwindow.item = ItemManager.get(source)
}
TWDS.marketwindow.enhanceit = function (thing) {
  console.log('enhanceit', thing)
  window.uwe = thing

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
      if (min && parseInt(min.value.trim) > 0) {
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
      $('#market_rights').guiElement().select(t || 1)
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
  if (this.divMain.attr('id') === 'market_createoffer_window') {
    window.setTimeout(function () { // why does clothcalc does that?
      TWDS.marketwindow.enhanceit(thing)
    }, 25)
  }
  return thing
}

TWDS.registerSetting('bool', 'marketwindow_enhancements',
  TWDS._('AUCTION_SETTING', 'Enhance the market offering window'),
  false, null, 'Market')

TWDS.registerStartFunc(function () {
  MarketWindow._TWDS_backup_createMarketOffer = MarketWindow.createMarketOffer
  MarketWindow.createMarketOffer = TWDS.marketwindow.createMarketOffer
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
})

// used when reloading, so the update code will be used.
if ('_TWDS_backup_createMarketOffer' in MarketWindow) {
  MarketWindow.createMarketOffer = TWDS.marketwindow.createMarketOffer
  west.gui.Dialog.prototype.show = TWDS.marketwindow.showwrapper
  console.log('auction.js reloaded')
}

// vim: tabstop=2 shiftwidth=2 expandtab
