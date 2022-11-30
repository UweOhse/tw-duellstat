// vim: tabstop=2 shiftwidth=2 expandtab
//

TWDS.collections = {}
TWDS.collections.seen_items = {}
TWDS.collections.missing_items = {}
TWDS.collections.unfinished = {}
TWDS.collections.loaded = {}

TWDS.collections.openwindow = function () {
  const win = wman.open('TWDS_collections_window', 'Collections', 'TWDS_collections_window')
  win.setMiniTitle('Collections')

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_collections_list'
  })
  TWDS.createEle('h2', { textContent: 'Collections', beforeend: content })
  const dl = TWDS.createEle('dl', { beforeend: content })
  console.log('unfinished', TWDS.collections.unfinished)

  for (const name of Object.keys(TWDS.collections.unfinished)) {
    const c = TWDS.collections.unfinished[name]
    TWDS.createEle('dt', { beforeend: dl, textContent: name })
    const dd = TWDS.createEle('dd', { beforeend: dl })
    for (let i = 0; i < c.length; i++) {
      const span = TWDS.createEle('span', { beforeend: dd })
      const itno = c[i]
      const it = ItemManager.get(itno)
      if (!it) continue
      const inside = new tw2widget.InventoryItem(it)
      span.appendChild(inside.getMainDiv()[0])
      const b = TWDS.createEle('b', { beforeend: span })
      if (it.auctionable) {
        const sl = TWDS.marketsearchlink(itno)
        if (sl) { b.appendChild(sl) }
      }
      if (it.tradeable) {
        TWDS.createEle('i', { beforeend: b, textContent: 'T' })
        /*
        let x=TWDS.shopItemLinkIfPossible(it)
        if (x)
          b.appendChild(x);
        */
      }
    }
  }
  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}

TWDS.collections.prepareNameCache = function () {
  const out = {}
  const all = ItemManager.getAll()
  for (const e of Object.values(all)) {
    out[e.name] = e.item_id
  }
  return out
}
TWDS.collections.findItemByName = function (name, cache) {
  const all = ItemManager.getAll()
  for (const e of Object.values(all)) {
    if (e.name === name && e.item_level === 0) { return e.item_id }
  }
  return -1
}
TWDS.collections.isMissing = function (ii) {
  if (ii in TWDS.collections.missing_items) return true
  return false
}
TWDS.collections.load = function () {
  Ajax.remoteCall('achievement', 'get_list', {
    folder: 'collections',
    playerid: Character.playerId
  }, function (x) {
    console.log(x)
    // i'm not going to parse HTML. No, i am not.
    // Even if this is slower than needed.
    const div = TWDS.createEle({ nodeName: 'div' })

    const namecache = TWDS.collections.prepareNameCache()

    const p = x.achievements.progress
    for (let i = 0; i < p.length; i++) {
      const a = p[i]
      TWDS.collections.unfinished[a.title] = []
      for (let j = 0; j < a.meta.length; j++) {
        div.innerHTML = a.meta[j]
        const spans = TWDS.q('span', div)
        const title = a.title
        for (let k = 0; k < spans.length; k++) {
          const span = spans[k]
          const name = span.title
          let ii = -1
          if (name in namecache) { ii = namecache[name] }
          if (span.classList.contains('locked')) {
            // missing shit.
            TWDS.collections.missing_items[ii] = title
            TWDS.collections.unfinished[title].push(ii)
          } else {
            TWDS.collections.seen_items[ii] = title
          }
        }
      }
    }
    TWDS.collections.loaded = true
  })
}
TWDS.registerStartFunc(function () {
  // wait 2.5 seconds to avoid a thundering herd.
  setTimeout(TWDS.collections.load, 2500)
})
