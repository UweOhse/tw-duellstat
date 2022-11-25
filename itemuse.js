// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.itemuse = { }
TWDS.itemuse.chests = { }
TWDS.itemuse.handler = function (itemid, resp) {
  console.log('item used', itemid, resp)
  if (resp.error) return
  const msg = resp.msg
  const effs = msg.effects
  let flagdidchest = false
  const loaded = window.localStorage.getItem('TWDS_itemuse_cache')
  if (!loaded) { TWDS.itemuse.chests = {} } else { TWDS.itemuse.chests = JSON.parse(loaded) }
  for (let i = 0; i < effs.length; i++) {
    const eff = effs[i]
    if (eff.type !== 'lottery' && eff.type !== 'content') {
      console.log('TWDS.itemuse.handler', 'unhandled effect type', eff.type, 'in', resp)
      continue
    }
    if (!TWDS.itemuse.chests[itemid]) { TWDS.itemuse.chests[itemid] = { count: 0, items: {} } }
    if (!flagdidchest) {
      TWDS.itemuse.chests[itemid].count++
      flagdidchest++
    }
    for (let j = 0; j < eff.items.length; j++) {
      const found = eff.items[j].item_id
      if (!(found in TWDS.itemuse.chests[itemid].items)) {
        TWDS.itemuse.chests[itemid].items[found] = 0
      }
      TWDS.itemuse.chests[itemid].items[found] += eff.items[j].count
    }
  }
  window.localStorage.setItem('TWDS_itemuse_cache', JSON.stringify(TWDS.itemuse.chests))
}
TWDS.itemuse.openwindow = function () {
  const wid = 'TWDS_itemusewindow'
  const win = wman.open(wid, 'set', 'TWDS_itemuse')
  win.setTitle('Chest contents')
  win.setMiniTitle('Chests')
  const loaded = window.localStorage.getItem('TWDS_itemuse_cache')
  if (!loaded) { TWDS.itemuse.chests = {} } else { TWDS.itemuse.chests = JSON.parse(loaded) }

  const t = TWDS.createEle({
    nodeName: 'table'
  })
  const tb = TWDS.createEle({
    nodeName: 'tbody',
    beforeend: t,
    children: [
      {
        nodeName: 'tr',
        className: 'header',
        children: [
          { nodeName: 'th', textContent: 'Chest' },
          { nodeName: 'th', textContent: 'Content' }
        ]
      }
    ]
  })

  const a = Object.keys(TWDS.itemuse.chests)
  a.sort(function (x, y) { return y - x })
  for (let i = 0; i < a.length; i++) {
    const chestid = a[i]
    const count = TWDS.itemuse.chests[chestid].count
    const items = TWDS.itemuse.chests[chestid].items
    const ci = ItemManager.get(chestid)
    const tr = TWDS.createEle('tr', { beforeend: tb })
    const outside = new tw2widget.InventoryItem(ci).setCount(count)
    TWDS.createEle({
      nodeName: 'th',
      beforeend: tr,
      children: [outside.getMainDiv()[0]]
    })
    const ic = TWDS.createEle({
      nodeName: 'td',
      beforeend: tr
    })
    const b = Object.keys(items)
    b.sort(function (x, y) { return y - x })
    for (let j = 0; j < b.length; j++) {
      const itno = b[j]
      const it = ItemManager.get(itno)
      if (!it) continue
      const inside = new tw2widget.InventoryItem(it).setCount(items[itno])
      ic.appendChild(inside.getMainDiv()[0])
    }
  }

  const sp = new west.gui.Scrollpane()

  sp.appendContent(t)

  win.appendToContentPane(sp.getMainDiv())
}
TWDS.itemuse.prehandler = function (ev, xhr, settings) {
  if (xhr.status !== 200) return
  const url = settings.url
  if (url.search('window=itemuse') !== -1) {
    if (!TWDS.settings.misc_chestanalyzer) return
    const mat = settings.data.match('item_id=([0-9]+)')
    if (mat == null) return
    TWDS.itemuse.handler(parseInt(mat[1]), xhr.responseJSON)
  }
}
TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'misc_chestanalyzer',
    TWDS._('MISC_SETTING_CHESTANALYZER',
      'Analyze the contents of chests. In the future the collected data will be shown somewhere.'),
    true)

  // it's either this hack, or patching the original function.
  // this here isn't beautiful, but at least less prone to fuckups.
  $(document).ajaxComplete(function (event, request, settings) {
    TWDS.itemuse.prehandler(event, request, settings)
  })
})
