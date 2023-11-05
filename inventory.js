// vim: tabstop=2 shiftwidth=2 expandtab
//

TWDS.inventory = {}
TWDS.inventory.handledupselect = function (choice) {
  const res = []
  const all = Bag.search('')
  for (let i = 0; i < all.length; i++) {
    const o = all[i]
    const it = o.obj
    let count = o.getCount()
    const worn = Wear.carries(it.item_base_id)
    if (worn) {
      count++
    }
    if (count > 1) {
      if (choice === 'all') {
        res.push(o)
      }
      if (choice === 'sellable') {
        if (it.sellable) {
          res.push(o)
        }
      }
      if (choice === 'auctionable') {
        if (it.auctionable) {
          res.push(o)
        }
      }
      if (choice === 'upgradeable') {
        if (it.upgradeable) {
          if (count >= 3) {
            res.push(o)
          }
        }
      }
    }
  }
  Inventory.showSearchResult(res)
}
TWDS.inventory.handleprofselect = function (prof) {
  const res = []
  const num = parseInt(prof)
  console.log('choice', prof, num)
  if (isNaN(num)) {
    console.log('recipesearch', prof)
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
    console.log('itemsearch', prof, num)
    const all = ItemManager.getAll()
    for (const it of Object.values(all)) {
      if (it.type === 'recipe') {
        console.log('found recipe', it)
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
TWDS.inventory.handlefilterclick = function (eventdata) {
  const filter = this.dataset.filter
  console.log('shall show', filter)
  // if (filter==="recipe") { Inventory.search(filter); return;}
  // if (filter==="useable") { Inventory.search(filter); return;}
  if (filter === 'recipe') {
    const sb = (new west.gui.Selectbox(true))
      .setHeight('347px')
      .setWidth('260px')
      .addListener(function (choice) {
        console.log('choice', choice)
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
        console.log('choice', choice)
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
  if (filter === 'duplicates') {
    const sb = (new west.gui.Selectbox(true))
      .setHeight('347px')
      .setWidth('260px')
      .addListener(function (choice) {
        console.log('choice', choice)
        TWDS.inventory.handledupselect(choice)
      })
    sb.addClass('TWDS_inventory_xsel')
    sb.addItem('all', TWDS._('INVENTORY_D_ALL', 'All'))
    sb.addItem('upgradeable', TWDS._('INVENTORY_D_UPGRADEABLE', 'Upgradeable'))
    sb.addItem('auctionable', TWDS._('INVENTORY_D_AUCTIONABLE', 'Auctionable'))
    sb.addItem('sellable', TWDS._('INVENTORY_D_AUCTIONABLE', 'Sellable'))
    sb.show(eventdata)
  }
}
TWDS.inventory.open2 = function (dw, clickhandler, opts) {
  console.log('TIO2', this, dw, clickhandler, opts)
  const ret = Inventory.TWDS_backup_open.call(this, dw, clickhandler, opts)
  const filters = TWDS.q1('div.filters', ret.DOM[0])
  let found = 0
  if (filters) {
    if (TWDS.q1('div.TWDS_filter.TWDS_filter_recipe', filters)) { found = 1 }
  }
  if (filters && !found) {
    TWDS.createEle({
      nodeName: 'div.TWDS_filter.TWDS_filter_recipe',
      dataset: { filter: 'recipe' },
      textContent: '',
      last: filters,
      onclick: TWDS.inventory.handlefilterclick
    })
    TWDS.createEle({
      nodeName: 'div.TWDS_filter.TWDS_filter_useable',
      dataset: { filter: 'useable' },
      textContent: '',
      last: filters,
      onclick: TWDS.inventory.handlefilterclick
    })
    TWDS.createEle({
      nodeName: 'div.TWDS_filter.TWDS_filter_duplicates',
      dataset: { filter: 'duplicates' },
      textContent: '',
      last: filters,
      onclick: TWDS.inventory.handlefilterclick
    })
  }
  return ret
}
TWDS.inventory.open = function (dw, clickhandler, opts) {
  console.log('TIO1', this, dw, clickhandler, opts)
  const ret = TWDS.inventory.open2.call(this, dw, clickhandler, opts)
  console.log('ret', ret)
  return ret
}
// Biginventory touches the same variables, so be careful _NOT_ to change them "back" if we didn't set them.
TWDS.registerStartFunc(function () {
  Inventory.TWDS_backup_open = Inventory.open
  Inventory.open = TWDS.inventory.open

  const old = {
    size: -1,
    sizeSearch: -1,
    sizeCustom: -1,
    latestSize: -1,
    availableCategories: []
  }
  TWDS.registerSetting('bool', 'misc_large_inventory',
    TWDS._('MISC_SETTING_LARGE_INVENTORY',
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
