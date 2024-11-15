// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.upshop = {}
TWDS.upshop.shoprender = function () {
  const thing = west.game.shop.item.view.prototype.TWDS_backup_render.apply(this)
  // console.log('shoprender', thing, this, this.getModel(), this.getModel().getId())
  const model = this.getModel()
  const iid = model.getId()
  const it = ItemManager.get(iid)
  if (TWDS.settings.upshop_show_count) {
    const have = Bag.getItemsByBaseItemId(it.item_base_id)
    let n = 0
    if (have && have[0]) {
      // go threw all leveled items..
      for (let i = 0; i < have.length; i++) {
        n += have[i].getCount()
      }
    }
    const worn = Wear.wear[it.type]
    if (worn) {
      if (worn.obj.item_base_id === it.item_base_id) { n++ }
    }
    if (n) {
      TWDS.createEle('div.TWDS_upshop_count', {
        textContent: n,
        last: thing[0],
        title: TWDS._('UPSHOP_COUNT_TITLE', 'The number of items you own')
      })
    }
  }
  if (TWDS.collections.isMissing(iid)) {
    TWDS.createEle('div.TWDS_upshop_collection.TWDS_collection_missing', {
      textContent: '',
      last: thing[0],
      title: TWDS._('UPSHOP_COLLECTION_TITLE', 'This item is needed to complete a collection')
    })
  }
  return thing
}
TWDS.upshop.showSellDialog = function (itemid) {
  if (!TWDS.settings.upshop_sell_max_minus_1) return
  this.TWDS_backup_showSellDialog.apply(this, arguments)
  const it = Bag.getItemByItemId(itemid)
  const n = it.count

  if (n < 3) return

  const ap = TWDS.q1('div.tw2gui_dialog .item_sell .pricing_container .amount_picker')
  if (!ap) return
  TWDS.createEle('div.input_minus1_value', {
    last: ap,
    children: [
      { nodeName: 'span', textContent: 'max-1: ' },
      { nodeName: 'span', textContent: n - 1 }
    ],
    onclick: function (ev) {
      console.log('onclick', ev)
      let cur = parseInt(TWDS.q1('.tw2gui_textfield input', ap).value)
      const target = n - 1
      while (cur !== target) {
        let ar
        if (cur < target) {
          ar = TWDS.q1('.arrow_up', ap)
          cur++
        } else {
          ar = TWDS.q1('.arrow_down', ap)
          cur--
        }
        $(ar).trigger('click')
      }
    }
  })
}

TWDS.upshop.startfunc = function () {
  west.game.shop.item.view.prototype.TWDS_backup_render = west.game.shop.item.view.prototype.TWDS_backup_render ||
    west.game.shop.item.view.prototype.render
  west.game.shop.item.view.prototype.render = TWDS.upshop.shoprender

  /* eslint-disable no-proto */
  west.window.shop.view.__proto__.TWDS_backup_showSellDialog = west.window.shop.view.__proto__.TWDS_backup_showSellDialog ||
    west.window.shop.view.__proto__.showSellDialog
  west.window.shop.view.__proto__.showSellDialog = TWDS.upshop.showSellDialog

  TWDS.registerSetting('bool', 'upshop_show_count',
    TWDS._('UPSHOP_SETTING_SHOW_COUNT', 'in the UPC shop show the number of items owned'), true, null, 'Market, shops and traders', 'Union Pacific Shop')
  TWDS.registerSetting('bool', 'upshop_show_collections',
    TWDS._('UPSHOP_SETTING_SHOW_COLLECTIONS', 'in the UPC shop mark items missing from collections'), true, null, 'Market, shops and traders', 'Union Pacific Shop')
  TWDS.registerSetting('bool', 'upshop_sell_max_minus_1',
    TWDS._('UPSHOP_SETTING_SELL_MAXMINUS1', '"add a button to sell all but one of the selected item to the Mobile Trader"'), true, null,
    'Market, shops and traders', 'Union Pacific Shop')
}

if (TWDS.didstartfuncs) {
  TWDS.upshop.startfunc()
} else {
  TWDS.registerStartFunc(TWDS.upshop.startfunc)
}

// vim: tabstop=2 shiftwidth=2 expandtab
