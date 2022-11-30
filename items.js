// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.items = {}
TWDS.items.item2recipe = {} // itemid: recipeid
TWDS.items.data = {}
TWDS.items.date = 0

TWDS.items.popupenhancementReal = function () {
  let x = window.ItemPopup._twds_backup_getXHTML.call(this)
  const ii = this.item_obj.item_id
  if (!(ii in TWDS.items.data)) {
    return x
  }
  const e = document.createElement('div')
  e.innerHTML = x
  const p = e.querySelector('.inventory_popup_prices')
  if (!p) {
    return x
  }
  const d = TWDS.items.data[ii]
  const ti = d.time * 3600
  let str = ''
  if (d.crafteditems > 0) {
    if (d.founditems) {
      str += TWDS._('ITEMPOPUP_CRAFTED', 'Crafted')
      str += TWDS._('ITEMPOPUP_CRAFTED_FOUNDITEMS', ', $n$ items to find (<= $time$)', {
        n: d.founditems,
        time: ti.formatDuration()
      })
    }
    if (d.shopitems > 0) { str += TWDS._('ITEMPOPUP_SHOPITEMS', ', $n$ items to buy', { n: d.shopitems }) }
  } else {
    str += TWDS._('ITEMPOPUP_FOUNDITEM_WORKTIME', 'Found, <= $time$ to collect', {
      time: ti.formatDuration()
    })
  }

  TWDS.createElement({
    nodeName: 'div',
    className: 'TWDS_popup_enhance',
    afterend: p,
    textContent: str
  })
  x = e.innerHTML
  return x
}
TWDS.items.popupenhancement = function () {
  return TWDS.items.popupenhancementReal.call(this)
}
TWDS.items.makedata = function () {

  TWDS.items.data = {} // for debugging.

  const items = ItemManager.getAll()
  const recipes = {}
  const done = {} // rs-id => worktime in hours
  const proto = {
    time: 0,
    shopitems: 0,
    founditems: 0,
    crafteditems: 0,
    crafts: 0,
    err: false
  }

  const getiteminfo = function (itemid) {
    const it = ItemManager.get(itemid)
    const out = Object.assign({}, proto)
    if (itemid in done) {
      return done[itemid]
    }
    if (it.spec_type === 'mapdrop') {
      const jobs = JobList.getJobsByItemId(itemid)
      let perhour = -1
      if (jobs.length) {
        for (let j = 0; j < jobs.length; j++) {
          let x = -1
          try {
            x = jobs[j].yields[itemid].prop
          } catch (e) {
          }
          perhour = Math.max(perhour, x)
        }
        // perhour is % at 0 stars
        perhour = perhour * 6 // 5 bronze stars
      }
      if (perhour < 0) {
        console.log('strange, no job for', it.spec_type, 'with', it.name)
        out.err = true
      }
      out.time = 1 / perhour
      out.founditems = 1
    } else if (it.spec_type === 'crafting') {
      if (itemid in done) {
        return done[itemid]
      }
    } else if (it.spec_type === 'none') {
      // habaneros and cogwheels are none, but should be jobdrop
      // empty jar is rightly here.
      out.shopitems = 1
    } else if (it.spec_type === 'jobdrop') {
      // cobra teeth and cossack saddle blanket
      out.shopitems = 1
    } else {
      console.log('unhandled spec_type', it.spec_type, 'with', it.name)
      out.err = true
    }
    return out
  }

  for (const it of Object.values(items)) {
    if (it.type === 'recipe') {
      TWDS.items.item2recipe[it.craftitem] = it.item_id
      recipes[it.item_id] = it
    }
    if (it.type === 'yield' && it.spec_type === 'mapdrop') {
      const info = getiteminfo(it.item_id)
      TWDS.items.data[it.item_id] = info
      done[it.item_id] = info
    }
  }
  let loopcount = 0
  while (true) {
    loopcount++
    let didone = false
    for (const rid of Object.keys(recipes)) {
      const crafted = recipes[rid].craftitem
      if (crafted in done) { continue }
      const res = recipes[rid].resources
      const out = Object.assign({}, proto)
      out.crafts = recipes[rid].profession_id

      for (let i = 0; i < res.length; i++) {
        const thing = res[i].item
        const count = res[i].count
        const info = getiteminfo(thing)
        if (info.err) {
          out.err = true
        } else {
          out.time += info.time
          out.shopitems += info.shopitems * count
          out.founditems += info.founditems * count
          out.crafteditems += info.crafteditems * count
          out.crafts |= info.crafts
        }
      }
      if (!out.err) {
        out.crafteditems += 1
        done[crafted] = out
        TWDS.items.data[crafted] = out
        // if (loopcount>1) console.log("did r",rid,recipes[rid].name)
        didone = true
      }
    }
    if (!didone) {
      break
    }
    if (loopcount > 9) {
      console.log('loopcount', loopcount, 'break', didone)
      break
    }
  }
}
TWDS.items.start = function () {
  if (TWDS.items.date === 0) {
    let x = window.localStorage.getItem('TWDS_items_date')
    if (x) {
      TWDS.items.date = parseInt(x)
      try {
        x = window.localStorage.getItem('TWDS_items_data')
        TWDS.items.data = JSON.parse(x)
      } catch (e) {
        TWDS.items.date = 0
      }
    }
  }
  if (TWDS.items.date < (new Date()).getTime() - 86400 * 1000) {
    TWDS.items.makedata()
    window.localStorage.setItem('TWDS_items_data', JSON.stringify(TWDS.items.data))
    TWDS.items.date = (new Date()).getTime()
    window.localStorage.setItem('TWDS_items_date', TWDS.items.date)
  }

  if (!window.ItemPopup._twds_backup_getXHTML) { window.ItemPopup._twds_backup_getXHTML = window.ItemPopup.getXHTML }
  window.ItemPopup.getXHTML = TWDS.items.popupenhancement
}

TWDS.registerStartFunc(function () {
  setTimeout(TWDS.items.start, 2500)
})

// vim: tabstop=2 shiftwidth=2 expandtab
