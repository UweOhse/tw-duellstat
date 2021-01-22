// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.settingList = []
TWDS.registerSetting = function (mode, name, text, def) {
  TWDS.settingList.push(arguments)
  if (TWDS.settings === null) {
    try {
      const x = window.localStorage.getItem('TWDS_settings')
      if (x) {
        TWDS.settings = JSON.parse(x)
      }
    } catch (e) {
      console.log('failed to get settings', e)
    }
    if (TWDS.settings === null) {
      TWDS.settings = {}
    }
  }
  if (!(mode in TWDS.settings)) {
    TWDS.settings[name] = def
  }
}
TWDS.wearItemsHandler = function (ids) {
  if (!Bag.loaded) {
    EventHandler.listen('inventory_loaded', function () {
      TWDS.wearItemsHandler(ids)
      return EventHandler.ONE_TIME_EVENT
    })
    return
  }

  if (Premium.hasBonus('automation')) {
    // i want to open the worn items window, but not the inventory.
    let isMin = false
    let isCreated = false
    if (Inventory !== null) {
      isMin = wman.isMinimized(Inventory.uid)
      isCreated = wman.isWindowCreated(Inventory.uid)
    }
    Wear.open()
    if (!isCreated) {
      wman.close(Inventory.uid)
    } else if (isMin) {
      wman.minimize(Inventory.uid)
    }
    for (const ii of ids) {
      const b = Bag.getItemByItemId(Number(ii))
      if (b) {
        Wear.carry(b)
      }
    }
    return
  }

  if (!wman.getById(Inventory.uid)) { Inventory.open() }
  Wear.open()

  const invItems = Bag.getItemsByItemIds(ids)
  const result = []
  for (let i = 0; i < invItems.length; i++) {
    const invItem = invItems[i]
    const wearItem = Wear.get(invItem.getType())
    if (!wearItem || (wearItem && (wearItem.getItemBaseId() !== invItem.getItemBaseId() ||
        wearItem.getItemLevel() < invItem.getItemLevel()))) {
      result.push(invItem)
    }
  }
  Inventory.showCustomItems(result)
}
