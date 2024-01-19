// vim: tabstop=2 shiftwidth=2 expandtab
//

TWDS.inventory = {}
TWDS.inventory.handleallselect = function (choice) {
  let res = []
  const all = Bag.search('')
  console.log('ALLMODE')
  for (let i = 0; i < all.length; i++) {
    const o = all[i]
    res.push(o)
  }
  res = TWDS.inventory.filteritemlist(res)
  Inventory.showSearchResult(res)
}
TWDS.inventory.handleprofselect = function (prof) {
  const res = []
  const num = parseInt(prof)
  if (isNaN(num)) {
    const all = Bag.search('')
    for (let i = 0; i < all.length; i++) {
      const o = all[i]
      const it = o.obj
      if (it.type === 'recipe') {
        if (it.profession === prof) {
          res.push(o)
        }
      }
    }
  } else {
    const all = ItemManager.getAll()
    for (const it of Object.values(all)) {
      if (it.type === 'recipe') {
        if (it.craftitem && it.profession_id === num) {
          const found = Bag.getItemsByItemIds([it.craftitem])
          if (found.length) {
            res.push(found[0])
          }
        }
      }
    }
  }
  Inventory.showCustomItems(res)
  Inventory.DOM[0].classList.remove('instant_wear_enabled')
}
TWDS.inventory.handlecatselect = function (cat) {
  TWDS.quickusables.showusables(cat)
  Inventory.DOM[0].classList.remove('instant_wear_enabled')
}
TWDS.inventory.sortorders = {
  id: { text: 'Id', trans: 'INVENTORY_S_ID' },
  name: { text: 'Name', trans: 'INVENTORY_S_NAME' },
  count: { text: 'Count', trans: 'INVENTORY_S_COUNT' },
  price: { text: 'Price', trans: 'INVENTORY_S_PREIS' },
  stackprice: { text: 'Total price', trans: 'INVENTORY_S_STACKPRICE' }
}
TWDS.inventory.filters = {
  auctionable: { value: 0, text: 'Auctionable', trans: 'INVENTORY_D_AUCTIONABLE' },
  sellable: { value: 0, text: 'Sellable', trans: 'INVENTORY_D_SELLABLE' },
  upgradeable: { value: 0, text: 'Upgradeable', trans: 'INVENTORY_D_UPGRADEABLE' },
  upgraded: { value: 0, text: 'Upgraded', trans: 'INVENTORY_D_UPGRADED' },
  duplicate: { value: 0, text: 'Duplicate', trans: 'INVENTORY_D_DUPLICATE' },
  dropable: { value: 0, text: 'Dropable', trans: 'INVENTORY_D_DROPABLE' },
  tradeable: { value: 0, text: 'Tradeable', trans: 'INVENTORY_D_TRADEABLE' },
  used: { value: 0, text: 'Used', trans: 'INVENTORY_D_USED' },
  set: { value: 0, text: 'Part of a set', trans: 'INVENTORY_D_SETPART' },
  quest: { value: 0, text: 'Questitem', trans: 'INVENTORY_D_QUEST' },
  classgender: { value: 0, text: 'Class/gender limited', trans: 'INVENTORY_D_CLASSGENDER' }
}
TWDS.inventory.filteritemlist = function (all) {
  const tmp = []
  const filters = {}
  let findinbagandworn=function(base_id) {
    let res=Bag.getItemsIdsByBaseItemId(base_id);
    let x=Wear.getByBaseId(base_id)
    if (x) {
      x=x.obj.item_id.toString()
      if (!res.includes(x))
        res.push(x);
    }
    return res;
  }

  // no shortcuts, we return a copy of the list, as it may be Bag.items_by_type[x]

  for (const [k, d] of Object.entries(TWDS.inventory.filters)) {
    if (d.value === 0) continue
    filters[k] = d.value
  }

  const ls = window.localStorage.TWDS_itemusage
  let usedata
  if (typeof ls === 'undefined') {
    usedata = {}
  } else {
    usedata = JSON.parse(ls)
  }

  for (let i = 0; i < all.length; i++) {
    let id
    let it
    if (typeof all[i] === 'object') {
      it = all[i]
      if (it.obj) { it = it.obj }
      id = it.item_id
    } else {
      id = all[i]
      it = ItemManager.get(id)
      if (!it) continue
    }
    if ('auctionable' in filters) {
      if (filters.auctionable === 1 && !it.auctionable) continue
      if (filters.auctionable === -1 && it.auctionable) continue
    }
    if ('classgender' in filters) {
      if (filters.classgender === 1 && !it.characterSex && !it.characterClass) continue
      if (filters.classgender === -1 && (it.characterSex || it.characterClass)) continue
    }
    if ('dropable' in filters) {
      if (filters.dropable === 1 && !it.dropable) continue
      if (filters.dropable === -1 && it.dropable) continue
    }
    if ('duplicate' in filters) {
      const b = Bag.getItemByItemId(id)
      if (!b) continue
      const worn = Wear.carries(it.item_base_id)
      const count = b.getCount() + (worn ? 1 : 0)
      if (filters.duplicate === 1 && count < 2) continue
      if (filters.duplicate === -1 && count > 1) continue
    }
    if ('sellable' in filters) {
      if (filters.sellable === 1 && !it.sellable) continue
      if (filters.sellable === -1 && it.sellable) continue
    }
    if ('set' in filters) {
      if (filters.set === 1 && !it.set) continue
      if (filters.set === -1 && it.set) continue
    }
    if ('quest' in filters) {
      if (filters.quest === 1 && !it.quest) continue
      if (filters.quest === -1 && it.quest) continue
    }
    if ('tradeable' in filters) {
      if (filters.tradeable === 1 && !it.tradeable) continue
      if (filters.tradeable === -1 && it.tradeable) continue
    }
    if ('upgradeable' in filters) {
      if (filters.upgradeable === 1 && !it.upgradeable) continue
      if (filters.upgradeable === -1 && it.upgradeable) continue
    }
    if ('upgraded' in filters) {
      // non-upgraded items are treated as upgraded if there are upgraded items of the thing in the bag
      if (filters.upgraded === 1 && !it.item_level) {
        let inbag=findinbagandworn(it.item_base_id);
        if (inbag.length<2) continue;
      }
      if (filters.upgraded === -1 && !it.item_level) {
        let inbag=findinbagandworn(it.item_base_id);
        if (inbag.length>1) continue;
      }
      if (filters.upgraded === -1 && it.item_level) continue
    }
    if ('used' in filters) {
      const d = TWDS.storage.getitemdata(id)
      if (filters.used === 1 && !(id in usedata) && d.want < d.have) continue
      if (filters.used === -1 && ((id in usedata) || d.want >= d.have)) continue
    }
    tmp.push(all[i])
  }

  // now for the funny part.
  let dir = 1
  if (TWDS.inventory.sortorder.substring(0, 1) === '-') dir = -1
  const key = TWDS.inventory.sortorder.substring(1)

  tmp.sort(function (a, b) {
    if (typeof a === 'object') {
      if (a.obj) { a = a.obj }
    } else {
      a = ItemManager.get(a)
      if (!a) return -1
    }
    if (typeof b === 'object') {
      if (b.obj) { b = b.obj }
    } else {
      b = ItemManager.get(b)
      if (!b) return 1
    }

    if (key === 'name') {
      const t = dir * a.name.localeCompare(b.name)
      if (t) return t
    }
    if (key === 'count') {
      const ac = Bag.getItemByItemId(a.item_id).count
      const bc = Bag.getItemByItemId(b.item_id).count
      const t = dir * (ac - bc)
      if (t) return t
    }
    if (key === 'price') {
      let aprice = a.price
      let bprice = b.price
      if (!a.auctionable && !a.sellable) aprice = 0
      if (!b.auctionable && !b.sellable) bprice = 0
      const t = dir * (aprice - bprice)
      if (t) return t
    }
    if (key === 'stackprice') {
      let aprice = a.price
      let bprice = b.price
      if (!a.auctionable && !a.sellable) aprice = 0
      if (!b.auctionable && !b.sellable) bprice = 0
      const acount = Bag.getItemByItemId(a.item_id).count
      const bcount = Bag.getItemByItemId(b.item_id).count
      const t = dir * (acount * aprice - bcount * bprice)
      if (t) return t
    }
    return dir * (a.item_id - b.item_id)
  })

  return tmp
}
// Bag.getItemsIdsByType wrapper. The function is only called from the Inventory - after the patching in the startup
TWDS.inventory.getItemsIdsByType = function (type) {
  const all = Bag.items_by_type[type] || []
  const tmp = TWDS.inventory.filteritemlist(all)
  return tmp
}
TWDS.inventory.showfilterwarning = function () {
  let warn = 0
  for (const d of Object.values(TWDS.inventory.filters)) {
    if (d.value) warn = 1
  }
  const ele = TWDS.q1('.inventory')
  console.log('SFW', ele, warn)
  if (ele) {
    if (warn) { ele.classList.add('TWDS_filters_active') } else { ele.classList.remove('TWDS_filters_active') }
  }
}
TWDS.inventory.sortorder = '+id'
TWDS.inventory.handleconfigureclick = function (eventdata) {
  let container
  const changer = function (event) {
    TWDS.inventory.filters[this.name].value = parseInt(this.value)
  }
  const sortchanger = function (event) {
    TWDS.inventory.sortorder = this.value
    console.log('SC', this.value)
  }
  const done = function (event) {
    console.log('done')
    Inventory.update()
    if (container) container.remove()
    TWDS.inventory.showfilterwarning()
  }

  container = TWDS.q1('table.TWDS_inv_filterselect')
  if (container) container.remove()

  const fi = TWDS.q1('.filters', Inventory.window.divMain)
  container = TWDS.createEle('table.TWDS_inv_filterselect', {
    last: fi
  })
  let keys = Object.keys(TWDS.inventory.filters)
  console.log('keys', keys)
  let tr = TWDS.createEle('tr.filterhead', { last: container })
  const th = TWDS.createEle('th', {
    last: tr,
    colSpan: 4
  })
  TWDS.createEle('span', {
    textContent: TWDS._('INVENTORY_FILTER', 'Filter'),
    last: th
  })
  TWDS.createEle('button', {
    textContent: TWDS._('INVENTORY_RESET', 'Reset'),
    last: th,
    onclick: function () {
      for (const [k, d] of Object.entries(TWDS.inventory.filters)) {
        TWDS.q1("input[type='radio'][name='" + k + "'][value='0']", container).checked = true
        d.value = 0
      }
    }
  })

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const d = TWDS.inventory.filters[key]
    const val = d.value

    const tr = TWDS.createEle('tr', { last: container })
    let td = TWDS.createEle('td', { last: tr })
    TWDS.createEle('label', {
      last: td,
      children: [
        { nodeName: 'input', type: 'radio', name: key, value: 1, onchange: changer, checked: val === 1 },
        { nodeName: 'span', textContent: TWDS._('INVENTORY_IS', 'is') }
      ]
    })
    td = TWDS.createEle('td', { last: tr })
    TWDS.createEle('label', {
      last: td,
      children: [
        { nodeName: 'input', type: 'radio', name: key, value: 0, onchange: changer, checked: val === 0 },
        { nodeName: 'span', textContent: TWDS._('INVENTORY_IGNORE', 'ignore') }
      ]
    })
    td = TWDS.createEle('td', { last: tr })
    TWDS.createEle('label', {
      last: td,
      children: [
        { nodeName: 'input', type: 'radio', name: key, value: -1, onchange: changer, checked: val === -1 },
        { nodeName: 'span', textContent: TWDS._('INVENTORY_ISNOT', 'is not') }
      ]
    })
    TWDS.createEle('td', { last: tr, textContent: TWDS._(d.trans, d.text) })
  }
  tr = TWDS.createEle('tr', { last: container })
  TWDS.createEle('th', {
    last: tr,
    colSpan: 4,
    textContent: TWDS._('INVENTORY_SORT', 'Sort')
  })

  keys = Object.keys(TWDS.inventory.sortorders)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const d = TWDS.inventory.sortorders[key]

    const tr = TWDS.createEle('tr', { last: container })
    let td = TWDS.createEle('td', { last: tr })
    TWDS.createEle('label', {
      last: td,
      children: [
        { nodeName: 'input', type: 'radio', name: 'sortorder', value: '+' + key, onchange: sortchanger, checked: TWDS.inventory.sortorder === '+' + key },
        { nodeName: 'span', textContent: TWDS._('INVENTORY_UP', '+ / up') }
      ]
    })
    td = TWDS.createEle('td', { last: tr })
    td = TWDS.createEle('td', { last: tr })
    TWDS.createEle('label', {
      last: td,
      children: [
        { nodeName: 'input', type: 'radio', name: 'sortorder', value: '-' + key, onchange: sortchanger, checked: TWDS.inventory.sortorder === '-' + key },
        { nodeName: 'span', textContent: TWDS._('INVENTORY_DOWN', '- / down') }
      ]
    })
    TWDS.createEle('td', { last: tr, textContent: TWDS._(d.trans, d.text) })
  }

  tr = TWDS.createEle('tr', { last: container })
  TWDS.createEle('td', {
    last: tr,
    colSpan: 4,
    children: [
      { nodeName: 'button', textContent: 'done', onclick: done }
    ]
  })
}
TWDS.inventory.handlefilterclick = function (eventdata) {
  const filter = this.dataset.filter
  if (filter === 'recipe') {
    const sb = (new west.gui.Selectbox(true))
      .setHeight('347px')
      .setWidth('260px')
      .addListener(function (choice) {
        TWDS.inventory.handleprofselect(choice)
      })
    sb.addItem(null, '<i>--- ' + TWDS._('INVENTORY_RECIPES', 'Recipes') + ' ---</i>')
    for (let i = 1; i < 5; i++) {
      sb.addItem(Game.InfoHandler.getLocalString4ProfessionId(i), Game.InfoHandler.getLocalString4ProfessionId(i))
    }
    sb.addItem(null, '<i>--- ' + TWDS._('INVENTORY_PRODUCTS', 'Products') + ' ---</i>')
    for (let i = 1; i < 5; i++) {
      sb.addItem(i, Game.InfoHandler.getLocalString4ProfessionId(i))
    }
    sb.show(eventdata)
  }
  if (filter === 'useable') {
    const sb = (new west.gui.Selectbox(true))
      .setHeight('347px')
      .setWidth('260px')
      .addListener(function (choice) {
        TWDS.inventory.handlecatselect(choice)
      })
    sb.addClass('TWDS_inventory_xsel')
    const cats = TWDS.quickusables.getcategories(0)
    const ar = []
    for (let i = 0; i < cats.length; i++) {
      const cat = cats[i]
      ar.push([cat, TWDS.quickusables.getcatdesc(cat)])
    }
    ar.sort(function (a, b) {
      return a[1].localeCompare(b[1])
    })
    for (let i = 0; i < ar.length; i++) {
      sb.addItem(ar[i][0], ar[i][1])
    }
    sb.show(eventdata)
  }
}
TWDS.inventory.open2 = function (dw, clickhandler, opts) {
  const ret = Inventory.TWDS_backup_open.call(this, dw, clickhandler, opts)
  const filters = TWDS.q1('div.filters', ret.DOM[0])
  let found = 0
  if (filters) {
    if (TWDS.q1('div.TWDS_filter.TWDS_filter_recipe', filters)) { found = 1 }
  }
  const change = ['belt', 'body', 'foot', 'head', 'neck', 'pants', 'left_arm', 'right_arm', 'animal', 'yield']
  for (let i = 0; i < change.length; i++) {
    const ele = TWDS.q1('.filter_inventory.filter_' + change[i], filters)
    if (ele) {
      ele.classList.add('TWDS_maybefiltered')
    }
  }
  if (filters && !found && TWDS.settings.inventory) {
    TWDS.createEle({
      nodeName: 'div.TWDS_filter.TWDS_filter_all.TWDS_maybefiltered',
      dataset: { filter: 'all' },
      title: TWDS._('INVENTORY_SHOW_ALL', 'Show all'),
      textContent: '',
      last: filters,
      onclick: TWDS.inventory.handleallselect
    })
    TWDS.createEle({
      nodeName: 'div.TWDS_filter.TWDS_filter_recipe',
      dataset: { filter: 'recipe' },
      title: TWDS._('INVENTORY_SHOW_RECIPES', 'Show recipes and crafted items'),
      textContent: '',
      last: filters,
      onclick: TWDS.inventory.handlefilterclick
    })
    TWDS.createEle({
      nodeName: 'div.TWDS_filter.TWDS_filter_useable',
      dataset: { filter: 'useable' },
      title: TWDS._('INVENTORY_SHOW_USABLES', 'Show usables'),
      textContent: '',
      last: filters,
      onclick: TWDS.inventory.handlefilterclick
    })
    TWDS.createEle({
      nodeName: 'div.TWDS_filter.TWDS_filter_configure',
      title: TWDS._('INVENTORY_FILTER_CONFIGURE', 'Configure filters'),
      textContent: '…',
      last: filters,
      onclick: TWDS.inventory.handleconfigureclick
    })
  }
  TWDS.inventory.showfilterwarning()
  return ret
}
TWDS.inventory.open = function (dw, clickhandler, opts) {
  const ret = TWDS.inventory.open2.call(this, dw, clickhandler, opts)
  return ret
}
TWDS.inventory.showcategory = function (category, data) {
  const ret = Inventory.TWDS_backup_showCategory.call(this, category, data)
  return ret
}

// Biginventory touches the same variables, so be careful _NOT_ to change them "back" if we didn't set them.
TWDS.registerStartFunc(function () {
  Inventory.TWDS_backup_open = Inventory.open
  Inventory.open = TWDS.inventory.open
  Inventory.TWDS_backup_showCategory = Inventory.showCategory
  Inventory.showCategory = function (a, b) { return TWDS.inventory.showcategory(a, b) }
  Bag.TWDS_backup_i_getItemsIdsByType = Bag.getItemsIdsByType
  Bag.getItemsIdsByType = function (tp) { return TWDS.inventory.getItemsIdsByType(tp) }
  // these callers of getItemsIdsByType need to use the original function
  let t = Bag.getItemsByType.toString().replace(/this.getItemsIdsByType/, 'Bag.TWDS_backup_i_getItemsIdsByType')
  eval('Bag.getItemsByType=' + t) // eslint-disable-line  no-eval
  t = Bag.removeItem.toString().replace(/this.getItemsIdsByType/, 'Bag.TWDS_backup_i_getItemsIdsByType')
  eval('Bag.removeItem=' + t) // eslint-disable-line  no-eval

  const old = {
    size: -1,
    sizeSearch: -1,
    sizeCustom: -1,
    latestSize: -1,
    availableCategories: []
  }
  TWDS.registerSetting('bool', 'inventory',
    TWDS._('SETTING_INVENTORY',
      'Provide a larger inventory (TW Inventory Reloaded is better).'),
    false, function (v) {
      if (v) {
        document.body.classList.add('TWDS_large_inventory')
        if (old.size === -1) {
          old.size = Inventory.size
          old.sizeSearch = Inventory.sizeSearch
          old.latestSize = Inventory.latestSize
          old.sizeCustom = Inventory.sizeCustom
          old.availableCategories = Inventory.availableCategories
        }
        Inventory.size = 66
        Inventory.sizeSearch = 55
        Inventory.sizeCustom = 55
        Inventory.availableCategories = ['new', 'belt', 'body', 'foot', 'head', 'neck', 'pants', 'animal', 'right_arm', 'left_arm', 'yield', 'upgradeable']
        Inventory.latestSize = 66
      } else {
        document.body.classList.remove('TWDS_large_inventory')
        if (old.size !== -1) {
          Inventory.size = old.size
          Inventory.sizeSearch = old.sizeSearch
          Inventory.sizeCustom = old.sizeCustom
          Inventory.latestSize = old.latestSize
          Inventory.availableCategories = old.availableCategories
        }
      }
    })
})
