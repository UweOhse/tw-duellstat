// vim: tabstop=2 shiftwidth=2 expandtab
//
//
//
TWDS.crafting = {}
TWDS.crafting.mycraftableitems = {}
TWDS.crafting.mycraftresources = {}
TWDS.crafting.myrecipes = {}
TWDS.crafting.callback = null

TWDS.crafting.storemyrecipes = function (x) {
  const cb = TWDS.crafting.callback
  TWDS.crafting.callback = null
  if (x.error) return
  if (x.recipes_content) {
    for (let i = 0; i < x.recipes_content.length; i++) {
      const rid = x.recipes_content[i].item_id
      const r = ItemManager.get(rid)
      if (r) {
        TWDS.crafting.mycraftableitems[r.craftitem] = true
        for (let j = 0; j < r.resources.length; j++) {
          const ri = r.resources[j].item
          TWDS.crafting.mycraftresources[ri] = true
        }
      }
      TWDS.crafting.myrecipes[rid] = x.recipes_content[i].last_craft
    }
  }
  if (cb) {
    cb()
  }
}
TWDS.crafting.start = function (cb) {
  if (cb) { TWDS.crafting.callback = cb }
  if (!ItemManager.isLoaded()) {
    window.setTimeout(TWDS.crafting.start, 250)
    return
  }
  Ajax.remoteCall('crafting', '', {}, TWDS.crafting.storemyrecipes)
}

TWDS.registerStartFunc(function () {
  setTimeout(TWDS.crafting.start, 2500)
})

// vim: tabstop=2 shiftwidth=2 expandtab
