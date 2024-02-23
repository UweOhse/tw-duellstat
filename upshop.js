// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.upshop = {}
TWDS.upshop.shoprender = function () {
  const thing = west.game.shop.item.view.prototype.TWDS_backup_render.apply(this)
  console.log('shoprender', thing, this, this.getModel(), this.getModel().getId())
  const model = this.getModel()
  const iid = model.getId()
  const it = ItemManager.get(iid)
  if (TWDS.settings.upshop_show_count) {
    const have = Bag.getItemsByBaseItemId(it.item_base_id)
    let n = 0
    if (have && have[0]) {
      n = have[0].getCount()
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
TWDS.upshop.startfunc = function () {
  west.game.shop.item.view.prototype.TWDS_backup_render = west.game.shop.item.view.prototype.TWDS_backup_render || west.game.shop.item.view.prototype.render
  west.game.shop.item.view.prototype.render = TWDS.upshop.shoprender

  TWDS.registerSetting('bool', 'upshop_show_count',
    TWDS._('UPSHOP_SETTING_SHOW_COUNT', 'in the UPC shop show the number of items owned'), true, null, 'Market, shops and traders', 'Union Pacific Shop')
  TWDS.registerSetting('bool', 'upshop_show_collections',
    TWDS._('UPSHOP_SETTING_SHOW_COLLECTIONS', 'in the UPC shop mark items missing from collections'), true, null, 'Market, shops and traders', 'Union Pacific Shop')
}

if (TWDS.didstartfuncs) {
  TWDS.upshop.startfunc()
} else {
  TWDS.registerStartFunc(TWDS.upshop.startfunc)
}

// vim: tabstop=2 shiftwidth=2 expandtab
