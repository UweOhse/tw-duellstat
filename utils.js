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
  const o = {
    mode: mode,
    name: name,
    text: text,
    def: def,
    callback: callBack || null,
    group: group || 'misc'
  }
  TWDS.settingList.push(o)
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

TWDS.q1 = function (sel, pa) {
  if (pa) {
    if (pa instanceof Node) {
      return pa.querySelector(sel)
    }
    if (pa instanceof jQuery) {
      if (pa.length) { return pa[0].querySelector(sel) }
      return null
    }
    const x = TWDS.q1(pa)
    if (!x) return null
    return x.querySelector(sel)
  }
  return document.querySelector(sel)
}
TWDS.q = function (sel, pa) {
  if (pa) {
    if (pa instanceof Node) {
      return pa.querySelectorAll(sel)
    }
    if (pa instanceof jQuery) {
      if (pa.length) { return pa[0].querySelectorAll(sel) }
      return null
    }
    const x = TWDS.q1(pa)
    if (!x) return null
    return x.querySelectorAll(sel)
  }
  return document.querySelectorAll(sel)
}

TWDS.createElement = function (par = {}, par2 = null) {
  if (typeof par === 'string' && typeof par2 === 'object' && par2 !== null) {
    par2.nodeName = par
    par = par2
  }
  const thing = document.createElement(par.nodeName)
  for (const [k, v] of Object.entries(par)) {
    if (k === 'nodeName') continue
    if (k === 'dataset' || k === 'dataSet') {
      for (const [k2, v2] of Object.entries(v)) {
        thing.dataset[k2] = v2
      }
      continue
    }
    if (k === 'style' || k === 'css') {
      for (const [k2, v2] of Object.entries(v)) {
        thing.style[k2] = v2
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
        if (c instanceof Node) {
          thing.appendChild(c)
        } else {
          const ce = TWDS.createElement(c)
          thing.appendChild(ce)
        }
      }
      continue
    }
    thing[k] = v
    /*
    if (!(k in thing) || thing.list !== v) {
      thing.setAttribute(k, v)
    }
    */
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
          src: Game.cdnURL + '/images/icons/hammer.png',
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
        src: Game.cdnURL + '/images/icons/bid.png',
        alt: ''
      }
    ]
  })
}

// logic from
// https://stackoverflow.com/questions/15547198/export-html-table-to-csv-using-vanilla-javascript
TWDS.download_table = function (name, selector, sep = ',') {
  let rows
  if (selector instanceof Node) {
    rows = TWDS.q('tr', selector)
  } else {
    rows = TWDS.q(selector + ' tr')
  }

  const csv = []
  for (let i = 0; i < rows.length; i++) {
    const row = []; const cols = rows[i].querySelectorAll('td, th')
    for (let j = 0; j < cols.length; j++) {
      // Clean innertext to remove multiple spaces and jumpline (break csv)
      let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
      // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
      data = data.replace(/"/g, '""')
      // Push escaped string
      row.push('"' + data + '"')
    }
    csv.push(row.join(sep))
  }
  // Download it
  const filename = 'twds_' + name + '_' + new Date().toLocaleDateString() + '.csv'
  const link = TWDS.createEle({
    nodeName: 'a',
    style: {
      display: 'none'
    },
    href: 'data:text/csv;charset=utf-8,' + window.encodeURIComponent(csv.join('\n')),
    target: '_blank',
    download: filename
  })
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
