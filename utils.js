// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.settingList = []
TWDS.saveSettings = function () {
  window.localStorage.setItem('TWDS_settings', JSON.stringify(TWDS.settings))
}
TWDS.loadSettings = function () {
  try {
    const x = window.localStorage.getItem('TWDS_settings')
    if (x) {
      TWDS.settings = JSON.parse(x)
    }
  } catch (e) {
    console.log('failed to get settings', e)
  }
}
TWDS.registerSetting = function (mode, name, text, def, callBack, group) {
  TWDS.settingList.push(arguments)
  if (TWDS.settings === null) {
    TWDS.loadSettings()
    if (TWDS.settings === null) {
      TWDS.settings = {}
    }
  }
  if (!(name in TWDS.settings)) {
    TWDS.settings[name] = def
  }
  if (callBack) { callBack(TWDS.settings[name]) }
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
      isMin = wman.isMinimized(Inventory.uid) === true
      isCreated = wman.isWindowCreated(Inventory.uid) === true
    }
    if (!wman.isWindowCreated(Wear.uid)) {
      Wear.open()
    } else if (wman.isMinimized(Wear.uid)) {
      wman.reopen(Wear.uid)
    }
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

TWDS.createElement = function (par = {}) {
  const thing = document.createElement(par.nodeName)
  for (const [k, v] of Object.entries(par)) {
    if (k === 'dataset' || k === 'dataSet') {
      for (const [k2, v2] of Object.entries(v)) {
        thing.dataset[k2] = v2
      }
      continue
    }
    if (k === 'classList') {
      for (const add of v) {
        thing.classList.add(add)
      }
      continue
    }
    if (k === 'childNodes' || k === 'children') {
      for (const c of Object.values(v)) {
        const ce = TWDS.createElement(c)
        thing.appendChild(ce)
      }
      continue
    }
    thing[k] = v
  }
  return thing
}
TWDS.createEle = TWDS.createElement
TWDS.createButton = function (text, par) {
  if (text !== null && text !== '') {
    par.textContent = text
  }
  if (!('classList' in par)) par.classList = []
  par.classList.push('TWDS_button')
  par.nodeName = 'button'
  return TWDS.createEle(par)
}

TWDS.jobOpenButton = function (id) {
  if (Premium.hasBonus('automation')) {
    return TWDS.createElement({
      nodeName: 'span',
      classList: ['TWDS_joblist_openbutton'],
      dataset: { job_id: id },
      title: 'Open a window to start the job at the nearest possible position',
      childNodes: [
        {
          nodeName: 'img',
          src: 'https://westde.innogamescdn.com/images/icons/hammer.png',
          alt: ''
        }
      ]
    })
  }
  return null
}
TWDS.itemBidButton = function (id) {
  const it = ItemManager.get(id)
  if (!it) return null

  if (!it.auctionable) return null

  return TWDS.createElement({
    nodeName: 'span',
    title: 'buy on market',
    className: 'TWDS_storage_market_button',
    dataset: { item_id: id },
    childNodes: [
      {
        nodeName: 'img',
        src: 'https://westde.innogamescdn.com/images/icons/bid.png',
        alt: ''
      }
    ]
  })
}
