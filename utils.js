// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.settingList = []
TWDS.extraList = []
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
TWDS.registerExtra = function (fn, text, help) {
  TWDS.extraList.push({ fn: fn, text: text, help: help })
}
TWDS.registerSetting = function (mode, name, text, def, callBack, group, subgroup, ordervalue) {
  const o = {
    mode: mode,
    name: name,
    text: text,
    def: def,
    callback: callBack || null,
    group: group || 'misc',
    subgroup: subgroup || '',
    ordervalue: ordervalue || 0
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
  if (typeof par === 'string') {
    if (typeof par2 === 'object' && par2 !== null) {
      par2.nodeName = par
      par = par2
    } else {
      par = {
        nodeName: par
      }
    }
  }
  const thing = document.createElement(par.nodeName)
  for (const [k, v] of Object.entries(par)) {
    if (k === 'nodeName') continue
    if (k === 'before' || k === 'beforebegin') {
      v.insertAdjacentElement('beforebegin', thing)
      continue
    }
    if (k === 'after' || k === 'afterend') {
      v.insertAdjacentElement('afterend', thing)
      continue
    }
    if (k === 'first' || k === 'afterbegin') {
      v.insertAdjacentElement('afterbegin', thing)
      continue
    }
    if (k === 'last' || k === 'beforeend') {
      v.insertAdjacentElement('beforeend', thing)
      continue
    }
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

TWDS.employerOpenButton = function (id) {
  return TWDS.createEle({
    nodeName: 'span',
    className: 'TWDS_quest_employer_link TWDS_clickable',
    dataset: { id: id },
    title: TWDS._('UTIL_QUEST_EMPLOYER_LINK', 'Center the map on the employer'),
    children: [
      {
        nodeName: 'img',
        src: '/images/map/minimap/icons/miniicon_quests.png',
        alt: 'Quests'
      }
    ]
  })
}

TWDS.jobOpenButton = function (id) {
  if (Premium.hasBonus('automation')) {
    return TWDS.createElement({
      nodeName: 'span',
      classList: ['TWDS_joblist_openbutton'],
      dataset: { job_id: id },
      title: TWDS._('JOBOPENBUTTON_TITLE', 'Open a window to start the job at the nearest possible position'),
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
TWDS.jobOpenButton2 = function (id) {
  if (!Premium.hasBonus('automation')) return null
  return TWDS.createEle({
    nodeName: 'span',
    className: 'tw2gui-iconset tw2gui-icon-hammer TWDS_job_open_button TWDS_clickable',
    dataset: { jobid: id },
    title: TWDS._('UTIL_JOBOPENBUTTON_TITLE', 'Open the job at the nearest possible position')
  })
}

TWDS.itemSellButton = function (id, count, desc) {
  const it = ItemManager.get(id)
  if (!it) return null

  if (!it.auctionable) return null

  return TWDS.createElement({
    nodeName: 'span',
    className: 'TWDS_item_sell_button',
    dataset: { item_id: id, count: count, desc: desc },
    title: TWDS._('ITEMSELLBUTTON_TITLE', 'Sell on the market'),
    childNodes: [
      {
        nodeName: 'span',
        textContent: '$$',
        color: 'green'
      }
    ]
  })
}
TWDS.itemBidButton = function (id) {
  const it = ItemManager.get(id)
  if (!it) return null

  if (!it.auctionable) return null

  return TWDS.createElement({
    nodeName: 'span',
    className: 'TWDS_storage_market_button',
    dataset: { item_id: id },
    title: TWDS._('ITEMBIDBUTTON_TITLE', 'Search on the market'),
    childNodes: [
      {
        nodeName: 'img',
        src: Game.cdnURL + '/images/icons/bid.png',
        alt: ''
      }
    ]
  })
}
TWDS.itemAnyCraftButton = function (id) {
  const it = ItemManager.get(id)
  if (!it) return null

  if (it.type !== 'yield') return null
  if (it.spec_type !== 'crafting') return null

  return TWDS.createElement({
    nodeName: 'span',
    className: 'TWDS_craft_button',
    title: TWDS._('ITEMCRAFTBUTTON_TITLE', 'Craft it'),
    dataset: { item_id: id },
    childNodes: [
      {
        nodeName: 'img',
        src: Game.cdnURL + '/images/items/yield/toolbox.png',
        alt: ''
      }
    ]
  })
}
TWDS.itemCraftButton = function (id) {
  const it = ItemManager.get(id)
  if (!it) return null

  if (it.type !== 'yield') return null
  if (it.spec_type !== 'crafting') return null
  if (!TWDS.crafting) return null
  if (!TWDS.crafting.items) return null
  if (!TWDS.crafting.items[id]) return null

  return TWDS.createElement({
    nodeName: 'span',
    className: 'TWDS_storage_craft_button',
    title: TWDS._('ITEMCRAFTBUTTON_TITLE', 'Craft it'),
    dataset: { item_id: id },
    childNodes: [
      {
        nodeName: 'img',
        src: Game.cdnURL + '/images/icons/icon_consumable.png',
        alt: ''
      }
    ]
  })
}

TWDS.delegate = function (root, evname, selector, func) {
  const h = function (ev) {
    const tg = ev.target.closest(selector)
    if (tg) {
      func.call(tg, ev)
    }
  }
  root.removeEventListener(evname, h)
  root.addEventListener(evname, h)
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
      if (cols[j].colSpan) {
        let x = cols[j].colSpan
        if (cols[j].dataset.fullColSpan) { x = cols[j].dataset.fullColSpan }
        let k = parseInt(x)
        while (k > 1) {
          row.push('')
          k--
        }
      }
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

TWDS.marketsearchlink = function (itemid) {
  const it = ItemManager.get(itemid)
  if (!it) return false
  return TWDS.createEle({
    nodeName: 'span',
    className: 'tw2gui-iconset tw2gui-icon-friends TWDS_marketsearchlink',
    dataset: {
      itemid: itemid,
      itemname: it.name
    }
  })
}
TWDS.marketsearchlinkhandler = function (ev) {
  console.log('MSLH', ev, this, this.dataset)
  if (!Character.homeTown || !Character.homeTown.town_id) { return }
  MarketWindow.open(Character.homeTown.town_id, 0, Character.homeTown.town_name)
  MarketWindow.showTab('buy')
  const x = TWDS.q1('.tw2gui_window.marketplace input[name=market_search_search]')
  const y = TWDS.q1('.tw2gui_window.marketplace .iconBut_mpb_refresh')
  if (x && y) {
    x.value = this.dataset.itemname
    const event = new window.MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    })
    y.dispatchEvent(event)
  }
}
TWDS.market_item_sell_handler = function (ev) {
  console.log('MISH', ev, this, this.dataset)
  const ds = this.dataset
  const patcher = function () {
    console.log('PATCHER running')
    const x = TWDS.q1('#market_createoffer_window')
    if (!x) {
      console.log('PATCHER restarted because no window')
      setTimeout(patcher, 50)
      return
    }
    if (!(x.classList.contains('TWDS_enhanced'))) {
      console.log('PATCHER restarted because window not enhanced')
      setTimeout(patcher, 50)
      return
    }
    console.log('PATCHER working', ds)
    TWDS.q1('#market_sell_itemStack').value = ds.count
    if (ds.desc > '') { TWDS.q1('#auction_description').value = ds.desc }
  }
  Ajax.remoteCallMode('town', 'get_town', Character.position, function (json) {
    if (json.error) {
      return new UserMessage(json.msg).show()
    }
    MarketWindow.open(json.town_id, json.allBuildings.market.stage, json.town_name)
    MarketWindow.showTab('sell')
    MarketWindow.createMarketOffer(parseInt(ds.item_id))
    setTimeout(patcher, 20)
    console.log('PATCHER process started')
  })
}
TWDS.job_open_button_handler = function () {
  const id = this.dataset.jobid
  if (!id || !Premium.hasBonus('automation')) { return false }
  Ajax.remoteCall('work', 'get_nearest_job', {
    job_id: id
  }, function (json) {
    if (json.error) { return new UserMessage(json.msg).show() }
    JobWindow.open(id, json.x, json.y)
  })
}
TWDS.quest_employer_link_handler = function () {
  const id = this.dataset.id
  Ajax.get('map', 'get_minimap', {}, function (data) {
    const pos = data.quest_locations[id]
    if (!pos) return ''
    Map.center(pos[0][0], pos[0][1])
  })
}

TWDS.registerStartFunc(function () {
  TWDS.delegate(document.body, 'click', '.TWDS_job_open_button', TWDS.job_open_button_handler)
  TWDS.delegate(document.body, 'click', '.TWDS_quest_employer_link', TWDS.quest_employer_link_handler)
  TWDS.delegate(document.body, 'click', '.TWDS_marketsearchlink', TWDS.marketsearchlinkhandler)
  TWDS.delegate(document.body, 'click', '.TWDS_item_sell_button', TWDS.market_item_sell_handler)
})
