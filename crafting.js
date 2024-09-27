// vim: tabstop=2 shiftwidth=2 expandtab
//
//
//
TWDS.crafting = {}
TWDS.crafting.mycraftableitems = {}
TWDS.crafting.mycraftresources = {}
TWDS.crafting.myrecipes = {}
TWDS.crafting.ready = false
TWDS.crafting.running = false

TWDS.crafting.storemyrecipes = function (json) {
  if (json.recipes_content) {
    for (let i = 0; i < json.recipes_content.length; i++) {
      const rid = json.recipes_content[i].item_id
      const r = ItemManager.get(rid)
      if (r) {
        TWDS.crafting.mycraftableitems[r.craftitem] = true
        for (let j = 0; j < r.resources.length; j++) {
          const ri = r.resources[j].item
          TWDS.crafting.mycraftresources[ri] = true
        }
      }
      TWDS.crafting.myrecipes[rid] = json.recipes_content[i].last_craft
    }
  }
}

TWDS.crafting.asyncloader = function (resolve, reject) {
  if (TWDS.crafting.ready) {
    if (resolve) {
      resolve('loaded in another thread')
      return
    }
    return Promise.resolve('using already loaded result')
  }
  if (TWDS.crafting.running) {
    if (resolve) {
      setTimeout(TWDS.crafting.asyncloader, 250, resolve, reject)
      return
    }
    return new Promise(function (resolve, reject) {
      setTimeout(TWDS.crafting.asyncloader, 250, resolve, reject)
    })
  }
  TWDS.crafting.running = 1
  return new Promise(function (resolve, reject) {
    Ajax.remoteCall('crafting', '', {}, function (json) {
      if (json.error) {
        reject(new Error(json.error))
      }
      TWDS.crafting.storemyrecipes(json)
      TWDS.crafting.ready = 1
      resolve('loaded')
    })
  })
}
TWDS.crafting.reset = function () {
  TWDS.crafting.running = 0
  TWDS.crafting.ready = 0
}

// vim: tabstop=2 shiftwidth=2 expandtab
