// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.shopsearch = {}

TWDS.shopsearch.gettowns = async function () {
  return new Promise(function (resolve, reject) {
    const now = (new Date().getTime()) / 1000
    const timestamp = parseInt(localStorage.TWDS_shopsearch_tc_ts || 0)

    if (timestamp > now - 86400) {
      resolve()
      return
    }

    Ajax.get('map', 'get_minimap', {}, function (resp) {
      if (resp.error) { reject(new Error(resp.msg)); return new UserMessage(resp.msg).show() }
      const towns = resp.towns
      const out = {}
      for (const town of Object.values(towns)) {
        const id = town.town_id
        if (!town.member_count) continue
        out[id] = {
          id: id,
          x: town.x,
          y: town.y,
          name: town.name,
          points: town.town_points,
          alliance_id: town.alliance_id
        }
      }
      localStorage.TWDS_shopsearch_tc_ts = now
      localStorage.TWDS_shopsearch_tc = JSON.stringify(out)
      resolve()
    })
  })
}

// works almost like the name implies... but starts at hometown/old hamburg for better caching
TWDS.shopsearch.townsbydistance = function (towndata) {
  const pos = {
    x: 44056,
    y: 17479
  }
  if (Character.homeTown.town_id) {
    pos.x = Character.homeTown.x
    pos.y = Character.homeTown.y
  }

  const a = []
  for (const town of Object.values(towndata)) {
    if (town.id === Character.town_id) {
      continue
    }
    a.push({
      id: town.id,
      wt: Map.calcWayTime(pos, town)
    })
  }
  a.sort(function (a, b) {
    return a.wt - b.wt
  })
  return a
}
/*
 * logic:
 * localStorage.TWDS_shopsearch_tsc = {
 *  townid: {
 *    tailor: {ts: timestamp, level:level, items:[]},
 *    gunsmith, general
 *  },
 * }
 */

TWDS.shopsearch.gettownshopdata = async function (townid, shoptype) {
  return new Promise(function (resolve, reject) {
    Ajax.remoteCallMode('building_' + shoptype + '&town_id=' + townid, '', {}, function (json) {
      const out = {
        level: json.level,
        items: [],
        ts: (new Date().getTime()) / 1000
      }
      if (json.error) { // town has no such shop
        resolve(out)
        return
      }
      out.level = json.level

      for (let i = 0; i < json.trader_inv.length; i++) {
        const io = json.trader_inv[i]
        if (io && io.item_id) {
          out.items.push(parseInt(io.item_id / 1000)) // base item ids. storage is cheap, but not that cheap.
        }
      }
      resolve(out)
    })
  })
}

TWDS.shopsearch.searchtownforitem = async function (townid, shoptype, baseitemid, maxlevels) {
  const oldmaxlevels = {
    tailor: 15,
    general: 15,
    gunsmith: 20
  }
  const cached = JSON.parse(localStorage.TWDS_shopsearch_tsc || '{}')
  const now = (new Date().getTime()) / 1000
  if (!(townid in cached)) {
    cached[townid] = {}
  }
  const tc = cached[townid]
  if (shoptype in tc) {
    const sc = tc[shoptype]

    let valid = (1 + sc.level * 5) * 3600 // level1: 6h, 15:81h (3d)
    if (sc.level === oldmaxlevels[shoptype]) {
      valid = 90 * 86400
    }
    if (sc.level === maxlevels[shoptype]) {
      valid = 365 * 86400
    }
    if (sc.ts < now - valid) {
      delete tc[shoptype]
    }
  }
  if (!(shoptype in tc)) {
    const data = await TWDS.shopsearch.gettownshopdata(townid, shoptype)
    tc[shoptype] = data
    localStorage.TWDS_shopsearch_tsc = JSON.stringify(cached)
  }
  const items = tc[shoptype].items
  for (let i = 0; i < items.length; i++) {
    const bii = items[i]
    if (bii === baseitemid) {
      return true
    }
  }
  return false
}

TWDS.shopsearch.searchforitem = async function (itemid, mode, allianceonly, townssearched) {
  mode = mode || 1
  const itemtypes2shops = {
    animal: 'general',
    belt: 'general',
    neck: 'general',
    body: 'tailor',
    foot: 'tailor',
    head: 'tailor',
    pants: 'tailor',
    left_arm: 'gunsmith',
    right_arm: 'gunsmith'
  }

  const it = ItemManager.get(itemid)
  if (!it) {
    // ECANTHAPPEN
    return
  }
  if (!(it.type in itemtypes2shops)) {
    // ECANTHAPPEN
    return
  }
  const shoptype = itemtypes2shops[it.type]
  await TWDS.shopsearch.gettowns()

  const towndata = JSON.parse(localStorage.TWDS_shopsearch_tc || {})

  const wts = TWDS.shopsearch.townsbydistance(towndata)

  console.log('sorted', wts)
  let maxlevels = {
    tailor: 25,
    gunsmith: 30,
    general: 25
  }

  const baseitemid = ItemManager.itemIdToBaseItemId(itemid)
  const out = []
  let nearest = -1
  for (let i = 0; i < wts.length; i++) {
    const townid = wts[i].id
    if (i === 0) {
      maxlevels = await TWDS.shopsearch.gettownshopmaxlevels(townid)
    }
    if (nearest !== -1) {
      if (wts[i].wt > nearest * 1.25 && out.length >= 5) {
        console.log('break at wt', wts[i].wt, nearest)
        break
      }
    }
    if (townssearched.length && !townssearched.includes(townid)) { continue }
    const found = await TWDS.shopsearch.searchtownforitem(townid, shoptype, baseitemid, maxlevels)
    // console.log('CHECKED', i, wts[i].wt, townid, 'found?', found)
    if (found) {
      out.push(wts[i].id)
      console.log('found it in', wts[i].id, 'with', wts[i].wt)
      if (mode === 1) { break }
      if (nearest === -1) {
        // homeTown is not a good benchmark, since it is sorted first by default
        if (i !== 0 || townid !== Character.homeTown.town_id) {
          nearest = wts[i].wt
          console.log('BENCHMARK!')
        }
      }
    }
  }
  return out
}
TWDS.shopsearch.gettownshopmaxlevels = async function (townid) {
  return await new Promise(function (resolve, reject) {
    Ajax.remoteCallMode('town', 'get_town', { town_id: townid }, function (json) {
      if (json.error) {
        reject(json.error[1])
        return
      }
      const ab = json.allBuildings
      const out = { }
      out.tailor = ab.tailor.maxStage
      out.gunsmith = ab.gunsmith.maxStage
      out.general = ab.general.maxStage
      resolve(out)
    })
  })
}

TWDS.shopsearch.factor = 1.33
TWDS.shopsearch.calccoords = function (x, y) {
  if (typeof x === 'object') {
    y = x.y
    x = x.x
  }
  return {
    x: x * window.WORLDMAP_COEFF_500 * TWDS.shopsearch.factor,
    y: y * window.WORLDMAP_COEFF_500 * TWDS.shopsearch.factor
  }
}

TWDS.shopsearch.drawicon = function (map, cladd, title, src, x, y) {
  const xy = TWDS.shopsearch.calccoords(x, y)
  return TWDS.createEle({
    nodeName: 'img',
    className: cladd,
    title: title,
    last: map,
    src: src,
    style: {
      cursor: 'pointer',
      position: 'absolute',
      width: '16px',
      height: 'auto',
      filter: 'drop-shadow(2px 2px 2px #222)',
      left: xy.x + 'px',
      top: xy.y + 'px'
    }
  })
}

TWDS.shopsearch.drawme = function (map) {
  TWDS.shopsearch.drawicon(map, 'me', 'you',
    '/images/map/minimap/icons/miniicon_pos.png',
    Character.getPosition())
}

TWDS.shopsearch.walkhelper = function () {
  const townid = this.dataset.townid
  if (!townid) return

  const towndata = JSON.parse(localStorage.TWDS_shopsearch_tc || {})
  const town = towndata[townid]
  if (!town) {
    return new UserMessage('Strange: town #' + townid + ' not found')
  }
  window.Guidepost.show(townid, town.x, town.y, 'town')
}

TWDS.shopsearch.updateresult = function (infoarea, table, map, item) {
  const wnd = wman.getById('TWDS_shopsearch_window')
  const iao = TWDS.q1('input.allianceonly', wnd.divMain)
  let allianceonly = 0
  if (iao && iao.checked) { allianceonly = 1 }

  if (allianceonly && Character.homeTown && Character.homeTown.alliance_id > 0) {
    Ajax.remoteCallMode('alliance', 'get_data', {
      alliance_id: Character.homeTown.alliance_id
    }, function (resp) {
      if (resp.error) {
        return new UserMessage(resp.msg).show()
      }
      const l = []
      for (let i = 0; i < resp.data.towns.length; i++) {
        const t = resp.data.towns[i]
        l.push(t.town_id)
      }
      return TWDS.shopsearch.updateresult2(infoarea, table, map, item, l)
    })
  } else {
    return TWDS.shopsearch.updateresult2(infoarea, table, map, item, [])
  }
}
TWDS.shopsearch.updateresult2 = function (infoarea, table, map, item, towns) {
  const wnd = wman.getById('TWDS_shopsearch_window')
  if (wnd) wnd.showLoader();

  (async function (itemid, wnd, infoarea, towns) {
    // the search starts around the hometown or old hamburg, to improve caching.
    const item = ItemManager.get(itemid)
    if (!item) {
      infoarea.textContent = 'item #' + itemid + ' not found in the ItemManager. This should not happen.'
      if (wnd) wnd.hideLoader()
      return
    }
    let mode = 1
    const allianceonly = 0
    const mele = TWDS.q1('input.multipleresults', wnd.divMain)
    if (mele && mele.checked) { mode = 2 }

    const townids = await TWDS.shopsearch.searchforitem(itemid, mode, allianceonly, towns)
    if (townids.length === 0) {
      infoarea.textContent = TWDS._('STORESEARCH_ITEM_NOT_IN_SHOPS', '$itemname$ not found in any town', { itemname: item.name })
      if (wnd) wnd.hideLoader()
      return
    }
    const towndata = JSON.parse(localStorage.TWDS_shopsearch_tc || {})
    const popup = new ItemPopup(item).popup.text

    for (let idx = 0; idx < townids.length; idx++) {
      const townid = townids[idx]
      if (!(townid in towndata)) {
        console.log('town not found: ', townid) // ECANTHAPPEN
        continue
      }

      const town = towndata[townid]
      let ic = TWDS.q1('.TWDS_shopsearch_content img.town' + townid)
      if (!ic) {
        let src = '/images/map/minimap/icons/miniicon_foreign_towns.png'
        let cladd = 'foreigntown'
        if (townid === Character.homeTown.town_id) {
          src = '/images/map/minimap/icons/miniicon_own_town.png'
          cladd = 'owntown'
        }

        ic = TWDS.shopsearch.drawicon(map, cladd + ' town' + townid, town.name, src, town.x, town.y)
        ic.dataset.townid = townid
        ic.classList.add('linklike')
        ic.title = ic.title + ': ' + item.name
        ic.onclick = function () {
          TownWindow.open(town.x, town.y)
        }
        // console.log('drew new icon', townid, item.name)
      } else {
        if (ic._mpopup) {
          ic._mpopup.text += ', ' + item.name
          // console.log('added to mpopup', townid, item.name, ic)
        } else {
          ic.title = ic.title + ', ' + item.name
          // console.log('added to title', townid, item.name, ic)
        }
      }
      let tr = TWDS.q1('tr.town' + townid, table)
      if (!tr) {
        if (table.children.length === 0) {
          TWDS.createEle({
            nodeName: 'tr.head',
            last: table,
            children: [
              { nodeName: 'th.name', textContent: TWDS._('STORESEARCH_TH_TOWN', 'town') },
              { nodeName: 'th.wt', textContent: TWDS._('STORESEARCH_TH_WAYTIME', 'waytime') },
              { nodeName: 'th.items', textContent: TWDS._('STORESEARCH_TH_ITEMS', 'items') }
            ]
          })
        }
        const wt = Map.calcWayTime(Character.position, town)
        tr = TWDS.createEle({
          nodeName: 'tr',
          className: 'town' + townid,
          last: table,
          children: [
            {
              nodeName: 'th.name.linklike',
              dataset: { townid: townid },
              textContent: town.name,
              onclick: function () {
                TownWindow.open(town.x, town.y)
              }
            },
            { nodeName: 'td.wt.linklike', dataset: { townid: townid, wt: wt }, innerHTML: wt.formatDuration(), onclick: TWDS.shopsearch.walkhelper },
            { nodeName: 'td.items', textContent: '' }
          ]
        })
        const complication = [] // element.children is something like an array, but not an actual array.
        for (let i = 0; i < table.children.length; i++) { complication.push(table.children[i]) }
        complication.sort(function (a, b) {
          if (a.classList.contains('head')) return -1
          if (b.classList.contains('head')) return +1

          a = parseFloat(TWDS.q1('.wt', a).textContent)
          b = parseFloat(TWDS.q1('.wt', b))
          return a - b
        })
        table.textContent = ''
        for (let i = 0; i < complication.length; i++) {
          table.appendChild(complication[i])
        }
      }
      const td = TWDS.q1('td.items', tr)
      const found = TWDS.q1('.item' + itemid, td)
      if (!found) {
        if (td.textContent !== '') {
          TWDS.createEle('span', { textContent: ', ', last: td })
        }
        TWDS.createEle('span.item.item' + itemid, {
          textContent: item.name,
          title: popup,
          last: td
        })
      }
    }
    const cc = TWDS.q1('button.clearcache', wnd.divMain)
    if (cc) {
      TWDS.shopsearch.cacheclearbuttontitle(cc)
    }
    if (wnd) wnd.hideLoader()
  })(item.item_id, wnd, infoarea, towns)
}
TWDS.shopsearch.cacheclearbuttontitle = function (ele) {
  let bytes = 0
  if (localStorage.TWDS_shopsearch_tsc) bytes += localStorage.TWDS_shopsearch_tsc.length
  if (localStorage.TWDS_shopsearch_tc) bytes += localStorage.TWDS_shopsearch_tc.length
  ele.title = TWDS._('STORESEARCH_CLEARCACHE_TITLE', 'Clear the cache ($b$ bytes)', { b: bytes })
}
TWDS.shopsearch.dosearch = function (inputarea, infoarea, table, search, map) {
  infoarea.textContent = ''
  const sel = TWDS.q1('select.specific', inputarea)
  sel.value = 0
  sel.disabled = true
  if (parseInt(search) > 0) {
    search = parseInt(search)
    if (search % 1000 <= 5) { search = parseInt(search / 1000) }
    const item = ItemManager.getByBaseId(search)

    if (!item) {
      infoarea.textContent = TWDS._('STORESEARCH_ID_NOT_FOUND', 'Item with base id #$bid$ not found', { bid: search })
      return
    }
    TWDS.shopsearch.updateresult(infoarea, table, map, item)
    return
  }

  // text search. don't we love it?
  const all = ItemManager.getAll()
  const lsearch = search.toLocaleLowerCase()
  const found = []
  for (const item of Object.values(all)) {
    const name = item.name
    const lname = name.toLocaleLowerCase()
    if (item.tradeable && item.traderlevel < 66 && item.item_id !== 0) {
      if (lname.includes(lsearch)) {
        found.push(item)
      }
    }
  }
  if (found.length === 1) {
    TWDS.shopsearch.updateresult(infoarea, table, map, found[0])
    return
  }
  if (!found.length) {
    infoarea.textContent = TWDS._('STORESEARCH_NAME_NOT_FOUND', 'Item with name $search$ not found', {
      search: search
    })
    return
  }
  if (found.length >= 50) {
    infoarea.textContent = TWDS._('STORESEARCH_TOO_MANY', 'Too many items match $search$. Please try a more specific search.', {
      search: search
    })
    return
  }
  // 2..50 elements in found
  found.sort(function (a, b) {
    return a.name.localeCompare(b.name)
  })

  sel.disabled = false
  sel.textContent = ''
  TWDS.createEle('option', {
    last: sel,
    value: 0,
    textContent: TWDS._('PLEASE_SELECT', 'please select')
  })
  for (let i = 0; i < found.length; i++) {
    TWDS.createEle({
      nodeName: 'option',
      value: found[i].item_id,
      textContent: found[i].name,
      last: sel
    })
  }
}

TWDS.shopsearch.getcontent = function (win) {
  const content = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_shopsearch_content'
  })
  const inputarea = TWDS.createEle({
    nodeName: 'div',
    className: 'inputarea',
    last: content
  })
  const input = TWDS.createEle({
    nodeName: 'input.search',
    type: 'text',
    onchange: function () {
      TWDS.shopsearch.dosearch(inputarea, infoarea, table, this.value, map)
    },
    style: {
      display: 'inline-block'
    },
    placeholder: TWDS._('STORESEARCH_ITEM', 'Item name or #'),
    title: TWDS._('STORESEARCH_ITEM_TITLE', 'Name or Id of the item you are looking for'),
    last: inputarea,
    value: win._TWDS_search ? win._TWDS_search : ''
  })
  TWDS.createEle({
    nodeName: 'select.specific',
    onchange: function () {
      const v = parseInt(this.value)
      if (!v) return
      const item = ItemManager.get(v)
      if (item) { TWDS.shopsearch.updateresult(infoarea, table, map, item) }
    },
    style: {
      display: 'inline-block'
    },
    title: TWDS._('STORESEARCH_SELECT_TITLE', 'Select the name of the item you are looking for'),
    last: inputarea,
    value: win._TWDS_search ? win._TWDS_search : ''
  })
  TWDS.createEle('label', {
    title: TWDS._('STORESEARCH_MULTI_MODE_TITLE', 'Return multiple results, not just one shop.'),
    last: inputarea,
    children: [{
      nodeName: 'input.multipleresults',
      type: 'checkbox',
      checked: false,
      value: 0
    }, {
      nodeName: 'span',
      textContent: TWDS._('STORESEARCH_MULTI_MODE', 'Multiple')
    }]
  })
  TWDS.createEle('label', {
    title: TWDS._('STORESEARCH_ALLIANCE_MODE_TITLE', 'Search in your alliance only'),
    last: inputarea,
    children: [{
      nodeName: 'input.allianceonly',
      type: 'checkbox',
      checked: false,
      value: 0
    }, {
      nodeName: 'span',
      textContent: TWDS._('STORESEARCH_ALLIANCE_MODE', 'Alliance')
    }]
  })

  TWDS.createEle({
    nodeName: 'button.clearmap',
    textContent: TWDS._('STORESEARCH_CLEARMAP', 'clear'),
    title: TWDS._('STORESEARCH_CLEARMAP_TITLE', 'Clear the map and result list'),
    onclick: function () {
      table.textContent = ''
      const images = TWDS.q('img.foreigntown', map)
      for (let i = 0; i < images.length; i++) { images[i].remove() }
    },
    style: {
      display: 'inline-block'
    },
    last: inputarea
  })
  let bytes = 0
  if (localStorage.TWDS_shopsearch_tsc) bytes += localStorage.TWDS_shopsearch_tsc.length
  if (localStorage.TWDS_shopsearch_tc) bytes += localStorage.TWDS_shopsearch_tc.length
  const ccb = TWDS.createEle({
    nodeName: 'button.clearcache',
    textContent: TWDS._('STORESEARCH_CLEARCACHE', 'clear cache'),
    title: TWDS._('STORESEARCH_CLEARCACHE_TITLE', 'Clear the cache ($b$ bytes). Searching will take longer after that.', { b: bytes }),
    onclick: function () {
      delete localStorage.TWDS_shopsearch_tsc
      delete localStorage.TWDS_shopsearch_tc
      delete localStorage.TWDS_shopsearch_tc_ts
      TWDS.shopsearch.cacheclearbuttontitle(this)
    },
    style: {
      display: 'inline-block'
    },
    last: inputarea
  })
  TWDS.shopsearch.cacheclearbuttontitle(ccb)

  const infoarea = TWDS.createEle({
    nodeName: 'div',
    className: 'infoarea',
    last: content
  })
  const factor = 1.33
  const map = TWDS.createEle('div.map', {
    last: content,
    style: {
      width: Math.round(500 * factor) + 'px',
      height: Math.round(220 * factor) + 'px',
      background: 'url(/images/map/minimap/worldmap_500.jpg) no-repeat',
      backgroundSize: 'contain',
      position: 'relative'
    }
  })
  const table = TWDS.createEle({
    nodeName: 'table',
    last: content
  })
  TWDS.shopsearch.drawme(map)
  if (win._TWDS_search) {
    input.onchange()
  }
  return content
}

TWDS.shopsearch.openwindow = function (search) {
  const wid = 'TWDS_shopsearch_window'
  let win
  if (wman.isWindowCreated(wid)) {
    win = wman.getById(wid)
    if (wman.isMinimized(wid)) {
      wman.reopen(wid, 'shopsearch')
    }
    win._TWDS_search = search || null
  } else {
    win = wman.open(wid, 'shopsearch')
    win.setTitle(TWDS._('STORESEARCH_WINDOW_TITLE', 'Storesearch'))
    win._TWDS_search = search || null

    const sp = new west.gui.Scrollpane()
    const content = TWDS.shopsearch.getcontent(win)
    sp.appendContent(content)
    win.appendToContentPane(sp.getMainDiv())
  }
  if (search) {
    const input = TWDS.q1('.TWDS_shopsearch_window input', win.divMain)
    if (input) {
      input.value = search
    }
  }
}
TWDS.shopsearch.button = function (id) {
  const it = ItemManager.get(id)
  if (!it) return null

  if (!it.tradeable) return null

  return TWDS.createElement({
    nodeName: 'span',
    className: 'TWDS_shopsearch_button',
    dataset: { item_id: id },
    title: TWDS._('SHOPSEARCHBUTTON_TITLE', 'Search in town shops'),
    childNodes: [
      new west.gui.Icon('home').divMain[0]
    ]
  })
}
TWDS.shopsearch.reload = function (win) {
  if (!win) {
    return TWDS.shopsearch.openwindow()
  }
  const content = TWDS.shopsearch.getcontent(win)
  const old = TWDS.q1('.TWDS_shopsearch_content', win.getMainDiv())
  const sp = old.parentNode
  sp.innerHTML = ''
  sp.appendChild(content)
}
TWDS.registerStartFunc(function () {
  TWDS.registerExtra('TWDS.shopsearch.openwindow',
    TWDS._('SHOPSEARCH_EXTRA', TWDS._('STORESEARCH_EXTRA', 'Shopsearch')),
    TWDS._('SHOPSEARCH_EXTRA_DESC', TWDS._('STORESEARCH_EXTRA_DESC', 'Search for items in the shops'))
  )
  TWDS.delegate(document.body, 'click', '.TWDS_shopsearch_button', function () {
    const id = this.dataset.item_id
    TWDS.shopsearch.openwindow(id)
  })
})

// vim: tabstop=2 shiftwidth=2 expandtab
