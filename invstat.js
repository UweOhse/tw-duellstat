// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.invstat = {}
TWDS.invstat.openwindow = function () {
  const ls = window.localStorage.TWDS_itemusage
  let usedata
  if (typeof ls === 'undefined') {
    usedata = {}
  } else {
    usedata = JSON.parse(ls)
  }

  const win = wman.open('TWDS_invstat_window', 'Inventory Statistics', 'TWDS_invstat_window')
  win.setMiniTitle('InvStat')

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_invstat_container'
  })
  TWDS.createEle('p', { beforeend: content, textContent: 'some statistics about your inventory' })
  const table = TWDS.createEle('table', { beforeend: content })
  const tbody = TWDS.createEle('tbody', { beforeend: table })
  const erg = {
    totalprice: 0,
    totalpriceunused: 0,
    sellprice: 0,
    sellpriceunused: 0,
    auctionprice: 0,
    auctionpriceunused: 0,
    fixedstuff: 0,
    distinctfixedstuff: 0,
    openunpack: 0,
    distinctopenunpack: 0,
    usable: 0,
    distinctusable: 0,
    sellable: 0,
    distinctsellable: 0,
    auctionable: 0,
    distinctauctionable: 0,
    buff: 0,
    distinctbuff: 0,
    totalitems: 0,
    distinctitems: 0,
    xplevel: 0,
    bonds: 0
  }
  let warncount = 0

  for (let id of Object.keys(Bag.items_by_id)) {
    let did = 0
    id = parseInt(id)
    const it = Bag.items_by_id[id].obj
    const count = Bag.items_by_id[id].count
    erg.totalitems += count
    erg.distinctitems += 1
    if ('sell_price' in it) {
      let m = it.sell_price
      if (it.sell_price === 0 && it.price > 0) m = it.price / 2
      if (it.sellable || it.auctionable) {
        erg.totalprice += count * m
        did = 1
      }
      if (it.sellable) {
        erg.sellprice += count * m
        erg.sellable += count
        erg.distinctsellable += 1
        did = 1
      }
      if (it.auctionable) {
        erg.auctionprice += count * m
        erg.auctionable += count
        erg.distinctauctionable += 1
        did = 1
      }
      let count2 = count
      if (it.item_id in usedata) {
        count2 = Math.min(count - 1, count2)
      }
      if (it.item_id in TWDS.storage) {
        count2 = Math.max(count - TWDS.storage[it.item_id][0], count2)
      }
      if (it.usetype !== 'none') {
        count2 = 0
      }
      if (it.sellable || it.auctionable) {
        if (count2 > 0) {
          erg.totalpriceunused += count2 * m
        }
      }
      if (it.sellable && count2 > 0) {
        erg.sellpriceunused += count2 * m
      }
      if (it.auctionable && count2 > 0) {
        erg.auctionpriceunused += count2 * m
      }
    }
    if (!it.sellable && !it.auctionable && it.usetype === 'none') {
      erg.fixedstuff += 1 * count
      erg.distinctfixedstuff += 1
      did = 1
    }
    if (it.usetype === 'use' && 'usebonus' in it && it.usebonus.length) {
      erg.usable += 1 * count
      erg.distinctusable += 1
      did = 1
    }
    if (it.usetype === 'buff' && 'usebonus' in it && it.usebonus.length) {
      erg.buff += 1 * count
      erg.distinctbuff += 1
      did = 1
    }
    if (TWDS.quickusables.match(it, 'openunpack')) {
      erg.openunpack += count
      erg.distinctopenunpack += 1
      did = 1
    }
    if (it.item_id === 2393000) {
      console.log('check', it)
    }
    let n = TWDS.quickusables.matchnumber(it, 'bonds')
    if (n) {
      erg.bonds += n * count
      // console.log(it, n, '=>', erg.bonds)
      did = 1
    }
    n = TWDS.quickusables.matchnumber(it, 'experiencelevel')
    if (n) {
      erg.xplevel += n * count
      console.log(it, n, '=>', erg.xplevel)
      did = 1
    }
    if (!did) {
      if (warncount++ < 10) {
        console.log(it)
      }
    }
  }
  console.log('erg', erg)
  let tr
  const ra = { textAlign: 'right' }
  tr = TWDS.createEle('tr', { beforeend: tbody, className: '' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'worth' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'total' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.totalprice, style: ra })
  TWDS.createEle('th', { beforeend: tr, textContent: 'unused' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.totalpriceunused, style: ra })
  TWDS.createEle('td', { beforeend: tr, textContent: 'the minimal worth of the inventory' })
  tr = TWDS.createEle('tr', { beforeend: tbody, className: '' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'worth/sell' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'total' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.sellprice, style: ra })
  TWDS.createEle('th', { beforeend: tr, textContent: 'unused' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.sellpriceunused, style: ra })
  TWDS.createEle('td', { beforeend: tr, textContent: 'what the travelling merchant would pay' })
  tr = TWDS.createEle('tr', { beforeend: tbody, className: '' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'worth/auction' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'total' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.auctionprice, style: ra })
  TWDS.createEle('th', { beforeend: tr, textContent: 'unused' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.auctionpriceunused, style: ra })
  TWDS.createEle('td', { beforeend: tr, textContent: 'the minimum price achievable in auctions' })
  tr = TWDS.createEle('tr', { beforeend: tbody, className: '' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'items' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'all' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.totalitems, style: ra })
  TWDS.createEle('th', { beforeend: tr, textContent: 'distinct' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.distinctitems, style: ra })
  tr = TWDS.createEle('tr', { beforeend: tbody, className: '' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'sellable' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'total' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.sellable, style: ra })
  TWDS.createEle('th', { beforeend: tr, textContent: 'distinct' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.distinctsellable, style: ra })
  tr = TWDS.createEle('tr', { beforeend: tbody, className: '' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'auctionable' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'total' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.auctionable, style: ra })
  TWDS.createEle('th', { beforeend: tr, textContent: 'distinct' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.distinctauctionable, style: ra })
  tr = TWDS.createEle('tr', { beforeend: tbody, className: '' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'usable' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'total' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.usable, style: ra })
  TWDS.createEle('th', { beforeend: tr, textContent: 'distinct' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.distinctusable, style: ra })
  tr = TWDS.createEle('tr', { beforeend: tbody, className: '' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'buff' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'total' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.buff, style: ra })
  TWDS.createEle('th', { beforeend: tr, textContent: 'distinct' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.distinctbuff, style: ra })
  tr = TWDS.createEle('tr', { beforeend: tbody, className: '' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'fixed stuff' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'total' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.fixedstuff, style: ra })
  TWDS.createEle('th', { beforeend: tr, textContent: 'distinct' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.distinctfixedstuff, style: ra })
  TWDS.createEle('td', { beforeend: tr, textContent: 'neither usable nor sellable or auctionable. Quest items.' })
  tr = TWDS.createEle('tr', { beforeend: tbody, className: '' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'open/unpack' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'total' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.openunpack, style: ra })
  TWDS.createEle('th', { beforeend: tr, textContent: 'distinct' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.distinctopenunpack, style: ra })
  tr = TWDS.createEle('tr', { beforeend: tbody, className: '' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'bonds' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'total' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.bonds + Character.upb, style: ra })
  TWDS.createEle('th', { beforeend: tr, textContent: 'in letters' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.bonds, style: ra })
  tr = TWDS.createEle('tr', { beforeend: tbody, className: '' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'experience' })
  TWDS.createEle('th', { beforeend: tr, textContent: 'in % of level' })
  TWDS.createEle('td', { beforeend: tr, textContent: erg.xplevel, style: ra })
  TWDS.createEle('th', { beforeend: tr, textContent: '' })
  TWDS.createEle('td', { beforeend: tr, textContent: '', style: ra })

  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}

TWDS.registerStartFunc(function () {
  TWDS.registerExtra('TWDS.invstat.openwindow',
    TWDS._('EXTRAS_INVSTAT_TEXT', 'Inventory statistic'),
    TWDS._('EXTRAS_INVSTAT_HELP', 'Shows statistics about you inventory.')
  )
})
