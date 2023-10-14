// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.bufflist = {}
TWDS.bufflist.upsdata = {}

TWDS.bufflist.row = function (it, tbody, searchstrings) {
  const addprice = function (price, currency, td) {
    TWDS.createEle('div', { textContent: price + ' ' + currency, last: td })
  }
  const tr = TWDS.createEle({
    nodeName: 'tr',
    last: tbody
  })

  TWDS.createEle('th', { textContent: it.name, last: tr, className: 'name' })
  TWDS.createEle('td', { textContent: it.item_id, last: tr, className: 'item_id' })
  let td = TWDS.createEle('td', { className: 'effect', last: tr })
  let eff = 0
  for (let i = 0; i < it.usebonus.length; i++) {
    const st = {}
    for (let j = 0; j < searchstrings.length; j++) {
      if (it.usebonus[i].toLocaleLowerCase().search(searchstrings[j].toLocaleLowerCase()) !== -1) {
        st.fontWeight = 'bold'
        const myRegexp = /([0-9.,]+)/g
        const matches = myRegexp.exec(it.usebonus[i])
        if (matches && matches[1]) {
          eff += parseInt(matches[1])
        }
      }
    }
    TWDS.createEle('div', { textContent: it.usebonus[i], last: td, style: st })
  }
  td.dataset.sortval = eff
  TWDS.createEle('td', { className: 'count', last: tr, textContent: Bag.getItemCount(it.item_id) })
  td = TWDS.createEle('td', { className: 'price', last: tr, dataset: { sortval: 0 } })
  for (const list of Object.values(TWDS.bufflist.upsdata.inventory)) {
    let found = false
    for (let i = 0; i < list.length; i++) {
      if (list[i].item_id === it.item_id) {
        const e = list[i]
        let f = 1
        if (e.reduced_value) { f = 1.0 - (e.reduced_value / 100) }
        if (e.currency & 1) { addprice(f * e.price_bonds, 'bonds', td) }
        if (e.currency & 2) { addprice(f * e.price_nuggets, 'nuggets', td) }
        if (e.currency & 4) { addprice(f * e.price_dollar, 'dollar', td) }
        if (e.currency & 8) { addprice(f * e.price_veteran, 'veteran', td) }
        if (e.currency) found = true
      }
    }
    if (found) { break }
  }
  td = TWDS.createEle('td', { className: 'time', last: tr, dataset: { sortval: 9999 * 3600 } })
  if (it.spec_type === 'crafting') {
    const d = TWDS.items.data[it.item_id]
    if (d && d.time) {
      td.textContent = (3600 * d.time).formatDuration()
      td.dataset.sortval = d.time * 3600
    }
  }
  td = TWDS.createEle('td', { className: 'type', last: tr })
  td.textContent = it.usetype
  if (it.has_cooldown) {
    TWDS.createEle('span', {
      last: td,
      innerHTML: ' &#128337;',
      title: 'this item has a cooldown period'
    })
  }
  td = TWDS.createEle('td', { className: 'functions', last: tr })
  let t
  if (it.spec_type === 'crafting') {
    t = TWDS.itemAnyCraftButton(it.item_id)
    if (t) td.appendChild(t)
  }
  t = TWDS.itemBidButton(it.item_id)
  if (t) td.appendChild(t)
  if (Bag.getItemCount(it.item_id)) {
    t = TWDS.itemSellButton(it.item_id)
    if (t) td.appendChild(t)
  }
}
TWDS.bufflist.doit = function (container, effect) {
  const _ = function (x) {
    const Y = 'BUFFLIST_' + x.toLocaleUpperCase()
    return TWDS._(Y, x)
  }
  container.innerHTML = ''
  const tab = TWDS.createEle({
    nodeName: 'table',
    className: 'TWDS_bufflist_table TWDS_sortable',
    last: container
  })
  const thead = TWDS.createEle({
    nodeName: 'thead',
    last: tab
  })
  const tr = TWDS.createEle('tr', { last: thead })
  TWDS.createEle('th', { last: tr, textContent: _('name'), dataset: { colsel: '.name' } })
  TWDS.createEle('th', { last: tr, textContent: _('id'), dataset: { colsel: '.item_id', sortmode: 'number' } })
  TWDS.createEle('th', { last: tr, textContent: _('effects'), dataset: { colsel: '.effect', sortmode: 'number' } })
  TWDS.createEle('th', { last: tr, textContent: '#', dataset: { colsel: '.count', sortmode: 'number' } })
  TWDS.createEle('th', { last: tr, textContent: _('price'), dataset: { nocolsel: '.price', sortmode: 'number' } })
  TWDS.createEle('th', { last: tr, textContent: _('time'), dataset: { colsel: '.time', sortmode: 'number' } })
  TWDS.createEle('th', { last: tr, textContent: _('type'), dataset: { colsel: '.type' } })
  TWDS.createEle('th', { last: tr, textContent: _('functions') })
  const tbody = TWDS.createEle({
    nodeName: 'tbody',
    last: tab
  })
  const searchstrings = TWDS.quickusables.usables[effect]

  const items = ItemManager.getAll()
  for (const it of Object.values(items)) {
    if (it.type === 'yield' && (it.usetype === 'use' || it.usetype === 'buff')) {
      if (TWDS.quickusables.match(it, effect)) {
        TWDS.bufflist.row(it, tbody, searchstrings)
      }
    }
  }
}
TWDS.bufflist.openwindowReal = function () {
  const titlestr = TWDS._('BUFFLIST_TITLE', 'Buffs')
  const win = wman.open('TWDS_bufflist_window', titlestr)
  win.setMiniTitle(titlestr)
  TWDS.bufflist.win = win

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_bufflist_container'
  })
  const myhead = TWDS.createEle('div', {
    className: 'TWDS_bufflist_header',
    last: content
  })
  const mymain = TWDS.createEle('div', {
    className: 'TWDS_bufflist_main',
    last: content
  })
  const sel = TWDS.createEle({
    nodeName: 'select',
    className: 'quickfilter_effect',
    last: myhead
  })
  const qc = TWDS.quickusables.getcategories(0)
  TWDS.createEle({
    nodeName: 'option',
    value: '',
    last: sel,
    textContent: TWDS._('BUFFLIST_QUICK_FILTER', 'Effects')
  })
  for (let i = 0; i < qc.length; i++) {
    TWDS.createEle({
      nodeName: 'option',
      value: qc[i],
      last: sel,
      textContent: TWDS.quickusables.getcatdesc(qc[i])
    })
  }

  sp.appendContent(content)

  sel.onchange = function () {
    const h = this.closest('.TWDS_bufflist_header')
    if (!h) return
    const e = TWDS.q1('.quickfilter_effect', h).value
    if (e > '') { TWDS.bufflist.doit(mymain, e) }
  }
  TWDS.delegate(content, 'click', '.TWDS_bufflist_table thead th[data-colsel]', TWDS.sortable.do)

  win.appendToContentPane(sp.getMainDiv())
}
TWDS.bufflist.openwindow = function () {
  Ajax.get('shop_trader', 'index', {}, function (json) {
    TWDS.bufflist.upsdata = json
    TWDS.bufflist.openwindowReal()
  })
}
// this is not translated, because it runs quite early
TWDS.registerStartFunc(function () {
  TWDS.registerExtra('TWDS.bufflist.openwindow',
    TWDS._('BUFFLIST_EXTRA_TITLE', 'Buffs'),
    TWDS._('BUFFLIST_EXTRA_DESC', 'Show buffs')
  )
})
