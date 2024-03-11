// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.ghosttowns = {}
TWDS.ghosttowns.openwindow = function () {
  if (window.localStore4Minimap.minimapData === null) {
    MinimapWindow.open()
    setTimeout(TWDS.ghosttowns.openwindow, 1000)
    return
  }
  const win = wman.open('TWDS_ghosttowns_window', TWDS._('GHOSTTOWNS_WIN_TITLE', 'Ghosttowns'))
  win.setMiniTitle(TWDS._('GHOSTTOWNS_MINI_TITLE', 'Ghosttowns'))

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_ghosttowns_container'
  })
  const table1 = TWDS.createEle('table', { beforeend: content })
  const thead1 = TWDS.createEle('thead', { beforeend: table1 })
  const table2 = TWDS.createEle('table', { beforeend: content })
  const thead2 = TWDS.createEle('thead', { beforeend: table2 })
  TWDS.createEle({
    last: thead1,
    nodeName: 'tr',
    children: [
      { nodeName: 'th.name', textContent: TWDS._('GHOSTTOWNS_TOWN_NAME', 'Name') },
      { nodeName: 'th.points', textContent: TWDS._('GHOSTTOWNS_TOWN_POINTS', 'Points') },
      { nodeName: 'th.pos', textContent: TWDS._('GHOSTTOWNS_TOWN_POS', 'Position') }
    ]
  })
  TWDS.createEle({
    last: thead2,
    nodeName: 'tr',
    children: [
      { nodeName: 'th.name', textContent: TWDS._('GHOSTTOWNS_TOWN_NAME', 'Name') },
      { nodeName: 'th.points', textContent: TWDS._('GHOSTTOWNS_TOWN_POINTS', 'Points') },
      { nodeName: 'th.pos', textContent: TWDS._('GHOSTTOWNS_TOWN_POS', 'Position') }
    ]
  })

  const tbody1 = TWDS.createEle('tbody', { beforeend: table1 })
  const tbody2 = TWDS.createEle('tbody', { beforeend: table2 })

  const a = []
  for (let i = 0; i < window.localStore4Minimap.minimapData.ghostTowns.length; i++) {
    const t = window.localStore4Minimap.minimapData.ghostTowns[i]
    a.push(t)
  }
  a.sort(function (x, y) {
    const t = x.town_points - y.town_points
    if (t) return t
    return x.town_id - y.town_id
  })

  const append = function (pa, t) {
    TWDS.createEle({
      nodeName: 'tr',
      last: pa,
      children: [
        { nodeName: 'td.name', textContent: t.name > '' ? t.name : t.town_id },
        { nodeName: 'td.points', textContent: t.town_points },
        {
          nodeName: 'td.pos.linklike',
          textContent: t.x + '-' + t.y,
          title: TWDS._('GHOSTTOWNS_CENTER', 'Center town on the map'),
          onclick: function () {
            Map.center(t.x, t.y)
          }
        }
      ]
    })
  }
  const n = 50
  for (let i = 0, found = 0; i < a.length && found < n; i++) {
    if (a[i].npctown) continue
    found++
    append(tbody1, a[i])
  }
  for (let i = a.length - 1, found = 0; i >= 0 && found < n; i--) {
    if (a[i].npctown) continue
    found++
    append(tbody2, a[i])
  }
  TWDS.createEle('p', {
    content: 'This list can help you to find a town to build (left half) or a well build town to live in (right half).'
  })

  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}
TWDS.registerExtra('TWDS.ghosttowns.openwindow',
  TWDS._('GHOSTTOWNS_TITLE', 'Ghosttowns'),
  TWDS._('GHOSTTOWNS_DESC', 'Show ghost town with high / low construction points'))
