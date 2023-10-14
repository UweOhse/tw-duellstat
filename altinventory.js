// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.altinv = {}
TWDS.altinv.searchwordforset = function (sd) {
  const a = {}
  const b = []
  // longest common substring
  for (let i = 0; i < sd.items.length; i++) {
    const id = sd.items[i]
    const it = ItemManager.getByBaseId(id)
    const w = it.name.split(' ')
    for (let j = 0; j < w.length; j++) {
      const v = w[j]
      if (!(v in a)) {
        a[v] = 0
      }
      a[v]++
    }
  }
  const id = sd.items[0]
  const it = ItemManager.getByBaseId(id)
  const w = it.name.split(' ')
  for (let j = 0; j < w.length; j++) {
    const v = w[j]
    if (a[v] === sd.items.length) {
      b.push(v)
    }
  }
  return b.join(' ')
}
TWDS.altinv.openwindow = function () {
  const ls = window.localStorage.TWDS_itemusage
  let usedata
  if (typeof ls === 'undefined') {
    usedata = {}
  } else {
    usedata = JSON.parse(ls)
  }

  const marketsearchword = function (sd) {
    return TWDS.altinv.searchwordforset(sd)
  }
  const setusage = function (sd) {
    let n = 0
    for (let i = 0; i < sd.items.length; i++) {
      const x = Bag.getItemsByBaseItemId(sd.items[i])
      if (x && x.length) {
        for (let j = 0; j < x.length; j++) {
          const id = x[j].obj.item_id
          if (usedata[id]) {
            const u = usedata[id]
            if (u.job.length) {
              n += u.job.length
            }
            if (u.eq.length) {
              n += u.eq.length
            }
            if (u.ds.length) {
              n += u.ds.length
            }
          }
        }
      }
    }
    return n
  }

  const win = wman.open('TWDS_altinv_window', 'Inventory', 'TWDS_altinv_window')
  win.setMiniTitle('Inventory')

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_altinv_container'
  })
  TWDS.createEle('h2', { textContent: 'Inventory', beforeend: content })
  const table = TWDS.createEle('table', { beforeend: content })
  table.addEventListener('click', function (e) {
    const t = e.target
    if (t.classList.contains('setname')) {
      TWDS.showset.open(t.dataset.setkey, true)
    }
    console.log('click', t)
    if (t.classList.contains('TWDS_altinv_sell_away')) {
      west.window.shop.open().openSellInventory()
      Inventory.search(t.dataset.itemname)
    }
    if (t.classList.contains('TWDS_altinv_auction_away')) {
      if (Character.homeTown.town_id) {
        MarketWindow.open(Character.homeTown.town_id)
        MarketWindow.showTab('sell')
        Inventory.search(t.dataset.itemname)
      } else {
        Ajax.remoteCallMode('town', 'get_town', {
          x: Character.position.x,
          y: Character.position.y
        }, function (json) {
          if (json.error) {
            return new UserMessage(json.msg).show()
          }
          MarketWindow.open(json.town_id, json.allBuildings.market.stage, json.town_name)
          MarketWindow.showTab('sell')
          Inventory.search(t.dataset.itemname)
        })
      }
    }
    if (t.classList.contains('TWDS_altinv_market_search')) {
      MarketWindow.open(Character.homeTown.town_id, 1, '???')
      document.querySelector('.tw2gui_window_tab._tab_id_buy').click()
      document.querySelector('[name=market_search_search]').value = t.dataset.itemname
      document.querySelector('.market-buy .tw2gui_iconbutton.iconBut_mpb_refresh').click()
    }
    if (t.classList.contains('TWDS_altinv_usage')) {
      let sel = "#TWDS_wuw [data-itemid='"
      sel += t.dataset.item_id
      sel += "']"
      TWDS.wuw.openwindow(sel)
      return false
    }
  })
  const thead = TWDS.createEle('thead', { beforeend: table })
  thead.appendChild(TWDS.createEle({
    nodeName: 'tr',
    children: [
      { nodeName: 'th', textContent: '#' },
      { nodeName: 'th', textContent: 'Name', className: 'itemname' },
      { nodeName: 'th', textContent: 'Number' },
      { nodeName: 'th', textContent: 'Usage' },
      { nodeName: 'th', textContent: 'Buy' },
      { nodeName: 'th', textContent: 'Sell' }
    ]
  }))
  const tbody = TWDS.createEle('tbody', { beforeend: table })
  const all = []
  for (let id of Object.keys(Bag.items_by_id)) {
    id = parseInt(id)
    const it = Bag.items_by_id[id].obj
    const n1 = it.name
    let n2 = ''
    if (it.set) {
      const sd = west.storage.ItemSetManager.get(it.set)
      if (sd) {
        n2 = sd.name
      }
    }
    all.push({
      itemid: id,
      n1: n1,
      n2: n2
    })
  }
  // sorts set first and by name, then items by name
  all.sort(function (a, b) {
    if (b.n2 !== a.n2) {
      if (b.n2 === '') return -1
      if (a.n2 === '') return 1
      return a.n2.localeCompare(b.n2)
    }
    return a.n1.localeCompare(b.n1)
  })

  let lastset = ''
  for (const ele of Object.values(all)) {
    let id = ele.itemid
    id = parseInt(id)
    const it = Bag.items_by_id[id].obj
    if (it.set !== lastset && it.set === null) {
      lastset = it.set
      const tr = TWDS.createEle('tr', { beforeend: tbody, className: 'setrow' })
      const td = TWDS.createEle('td', {
        beforeend: tr,
        className: 'nosets',
        textContent: 'Not in sets'
      })
      td.colSpan = 5
    }
    if (it.set !== lastset) {
      lastset = it.set
      const tr = TWDS.createEle('tr', { beforeend: tbody, className: 'setrow' })
      const sd = west.storage.ItemSetManager.get(it.set)
      let td = TWDS.createEle('td', {
        beforeend: tr,
        textContent: ''
      })
      td.colSpan = 2
      TWDS.createEle({
        nodeName: 'span',
        className: 'setname',
        textContent: sd.name,
        dataset: {
          setkey: it.set
        },
        beforeend: td
      })
      const sw = marketsearchword(sd)
      TWDS.createEle({
        nodeName: 'span',
        className: 'searchword',
        textContent: sw ? '(' + sw + ')' : '(unsearchable set)',
        beforeend: td
      })

      let found = 0
      for (let i = 0; i < sd.items.length; i++) {
        const x = Bag.getItemsByBaseItemId(sd.items[i])
        if (x && x.length) { found++ }
      }

      td = TWDS.createEle('td', {
        beforeend: tr,
        className: 'setitemcount',
        textContent: found + '/' + sd.items.length
      })

      const su = setusage(sd)
      td = TWDS.createEle('td', {
        beforeend: tr,
        className: su ? 'used' : 'unused',
        textContent: su > 0 ? 'used' : 'unused'
      })

      let ac = TWDS.createEle('td', { beforeend: tr, className: 'buy' })
      if (sw) {
        TWDS.createEle({
          nodeName: 'span',
          title: 'search for items of this set on the market',
          innerHTML: '?',
          dataset: {
            itemname: sw || ''
          },
          classList: ['TWDS_altinv_market_search'],
          beforeend: ac
        })
      }
      ac = TWDS.createEle('td', { beforeend: tr, className: 'sell' })
      TWDS.createEle({
        nodeName: 'span',
        title: 'auction the items of this set',
        alt: 'auction',
        // textContent: '&#9752;'
        innerHTML: '&#128200;',
        dataset: {
          itemname: sd ? sd.name : '???'
        },
        classList: ['TWDS_altinv_auction_away'],
        beforeend: ac
      })
      TWDS.createEle({
        nodeName: 'span',
        title: 'sell items of this set to the travelling merchant',
        innerHTML: '&#9784;',
        dataset: {
          itemname: sd ? sd.name : '???'
        },
        classList: ['TWDS_altinv_sell_away'],
        beforeend: ac
      })
    }
    const tr = TWDS.createEle('tr', { beforeend: tbody, className: 'itemrow' })
    const count = Bag.items_by_id[id].count
    const lv = it.item_level
    TWDS.createEle('td', { beforeend: tr, textContent: id })
    // const x = new tw2widget.Item(window.ItemManager.get(id))
    const td = TWDS.createEle('td', { className: 'itemname', beforeend: tr, textContent: it.name })
    if (it.upgradeable && lv > 0) {
      td.textContent += '^' + lv
    }

    TWDS.createEle('td', { beforeend: tr, className: 'count', textContent: count })

    if (usedata[id]) {
      // <span class="TWDS_itemusageinfo hasMousePopup" data-item_id="51193000">2</span>
      const x = TWDS.createEle('td', {
        beforeend: tr,
        className: 'TWDS_altinv_usage',
        dataset: {
          item_id: id
        }
      })
      let str = ''
      const u = usedata[id]
      if (u.job.length) {
        str += u.job.length + ' jobs'
      }
      if (u.eq.length) {
        if (str > '') { str += ', ' }
        str += u.eq.length + ' TW equipment sets'
      }
      if (u.ds.length) {
        if (str > '') { str += ', ' }
        str += u.ds.length + ' ' + TWDS.scriptname + ' equipment sets'
      }
      x.title = str
      x.textContent = 'used'
      x.classList.add('used')
    } else {
      TWDS.createEle('td', { beforeend: tr, textContent: 'unused', className: 'unused' })
    }

    let ac = TWDS.createEle('td', { beforeend: tr, className: 'buy' })
    let offerauction = it.auctionable
    if (lv > 0) {
      const bid = it.item_base_id
      const bi = ItemManager.getByBaseId(bid)
      if (bi && bi.auctionable) {
        offerauction = true
      }
    }
    if (offerauction) {
      TWDS.createEle({
        nodeName: 'span',
        title: 'search for this item on the market',
        innerHTML: '?',
        dataset: {
          itemname: it.name
        },
        classList: ['TWDS_altinv_market_search'],
        beforeend: ac
      })
    }

    ac = TWDS.createEle('td', { beforeend: tr, className: 'sell' })
    if (it.auctionable) {
      const b = TWDS.createEle({
        nodeName: 'span',
        title: 'auction this item',
        alt: 'auction',
        // textContent: '&#9752;'
        innerHTML: '&#128200;',
        dataset: {
          itemid: id,
          itemname: it.name
        },
        classList: ['TWDS_altinv_auction_away']
      })
      ac.appendChild(b)
    }
    if (it.sellable) {
      const b = TWDS.createEle({
        nodeName: 'span',
        title: 'sell this item to the travelling merchant',
        innerHTML: '&#9784;',
        dataset: {
          itemid: id,
          itemname: it.name
        },
        classList: ['TWDS_altinv_sell_away']
      })
      ac.appendChild(b)
    }
  }
  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}
TWDS.registerStartFunc(function () {
  TWDS.registerExtra('TWDS.altinv.openwindow',
    TWDS._('EXTRAS_ALTINV_TEXT', 'Tabular inventory'),
    TWDS._('EXTRAS_ALTINV_HELP', 'Shows your inventory as one big table, sorted by set and name.')
  )
})
