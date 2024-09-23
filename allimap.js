// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.allimap = {}

TWDS.allimap.factor = 1.33
TWDS.allimap.calccoords = function (x, y) {
  if (typeof x === 'object') {
    y = x.y
    x = x.x
  }
  return {
    x: x * window.WORLDMAP_COEFF_500 * TWDS.allimap.factor,
    y: y * window.WORLDMAP_COEFF_500 * TWDS.allimap.factor
  }
}

TWDS.allimap.drawbox = function (map, type, title, color, x, y, rot) {
  const xy = TWDS.allimap.calccoords(x, y)
  const sz = (type === 0) ? 5 : (type === 1 ? 6 : 8)
  return TWDS.createEle({
    nodeName: 'div',
    title: title,
    last: map,
    style: {
      cursor: 'pointer',
      position: 'absolute',
      width: sz + 'px',
      height: sz + 'px',
      filter: 'drop-shadow(2px 2px 2px #222)',
      left: xy.x + 'px',
      backgroundColor: color,
      top: xy.y + 'px',
      rotate: rot + 'deg'
    }
  })
}
TWDS.allimap.drawcircle = function (map, sz, opa, color, x, y, cladd) {
  cladd = cladd || ''
  const xy = TWDS.allimap.calccoords(x, y)
  return TWDS.createEle({
    nodeName: 'div',
    className: cladd,
    last: map,
    style: {
      position: 'absolute',
      width: (sz * 2) + 'px',
      height: (sz * 2) + 'px',
      filter: 'drop-shadow(2px 2px 2px #222)',
      left: (xy.x - sz) + 'px',
      backgroundColor: color,
      background: 'radial-gradient(' + color + ', ' + color + '00, #00000000)',
      top: (xy.y - sz) + 'px',
      opacity: opa,
      clipPath: 'circle(' + (sz) + 'px)'
    }
  })
}
TWDS.allimap.drawicon = function (map, cladd, title, src, x, y) {
  const xy = TWDS.allimap.calccoords(x, y)
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
TWDS.allimap.drawcheckbox = function (map, title, x, y) {
  const xy = TWDS.allimap.calccoords(x, y)
  return TWDS.createEle({
    nodeName: 'input',
    type: 'checkbox',
    title: title,
    last: map,
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

TWDS.allimap.colors = ['#e6194B', // red
  '#3cb44b', // Green
  '#ffe119', // Yellow
  '#4363d8', // Blue
  '#f58231', // Orange
  '#911eb4', // Purple
  '#42d4f4', // Cyan
  '#f032e6', // Magenta
  '#bfef45', // Lime
  '#fabed4', // Pink
  '#469990', // Teal
  '#dcbeff', // Lavender
  '#9A6324', // Brown
  '#fffac8', // Beige
  '#800000', // Maroon
  '#aaffc3', // Mint
  '#808000', // Olive
  '#ffd8b1', // Apricot
  '#000075', // Navy
  '#a9a9a9', // Grey
  '#ffffff', // White
  '#000000' // Black
]
TWDS.allimap.drawit = function (map, table) {
  TWDS.allimap.drawicon(map, 'me', 'you',
    '/images/map/minimap/icons/miniicon_pos.png',
    Character.getPosition())

  Ajax.get('map', 'get_minimap', {}, function (json) {
    // console.log("MM",json);
    if (json.error) {
      return new UserMessage(json.error).show()
    }

    const ainfo = { }
    const forts = []
    for (const xi of Object.keys(json.forts)) {
      for (const yi of Object.keys(json.forts[xi])) {
        const f = json.forts[xi][yi]
        let a = f.fort.alliance_id
        if (!a) a = 1e8 + f.fort.town_id // invent an alliance for a town.
        if (!ainfo[a]) ainfo[a] = { weight: 0, forts: [0, 0, 0], towns: 0, members: 0 }
        ainfo[a].weight += (f.fort.type + 1) * 200 // 200,400,600
        ainfo[a].forts[f.fort.type]++
        ainfo[a].workallianceid = a
        forts.push(f)
      }
    }
    for (const t of Object.values(json.towns)) {
      if (t.member_count && !t.npctown) {
        let a = t.alliance_id
        if (!a) a = 1e8 + t.town_id // invent an alliance for a town.
        if (!ainfo[a]) ainfo[a] = { weight: 0, forts: [0, 0, 0], towns: 0, members: 0 }
        ainfo[a].weight += Math.pow(t.town_points, 0.33) // 0..60?
        ainfo[a].weight += t.member_count * 2 // 2..100
        ainfo[a].towns++
        ainfo[a].members += t.member_count
      }
    }
    const tmp = []
    for (const [a, b] of Object.entries(ainfo)) {
      tmp.push([a, b])
    }

    tmp.sort(function (a, b) {
      return b[1].weight - a[1].weight
    })

    forts.sort(function (a, b) {
      if (b.fort.type !== a.fort.type) { return b.fort.type - a.fort.type }
      const ad = Math.sqrt((a.fort.x - 23000) * (a.fort.x - 23000) + (a.fort.y - 10000) * (a.fort.y - 10000))
      const bd = Math.sqrt((b.fort.x - 23000) * (b.fort.x - 23000) + (b.fort.y - 10000) * (b.fort.y - 10000))
      return bd - ad
    })

    const acolors = {}
    let delay = 100
    let first = 0
    for (let i = 0; i < tmp.length; i++) {
      const a = tmp[i][0]
      if (i < TWDS.allimap.colors.length) {
        if (!first++) {
          const tr = TWDS.createEle('tr.head', { last: table })
          TWDS.createEle('th', { last: tr, textContent: '#', title: 'Alliance Id' })
          TWDS.createEle('th', { last: tr, textContent: TWDS._('ALLIMAP_TH_ALLIANCE_ID', 'Alliance Name') })
          TWDS.createEle('th', { last: tr, textContent: TWDS._('ALLIMAP_TH_POINTS', 'Points') })
          TWDS.createEle('th', { last: tr, textContent: '' })
          TWDS.createEle('th', { last: tr, textContent: TWDS._('ALLIMAP_TH_TOWNS', 'Towns') })
          TWDS.createEle('th', { last: tr, textContent: TWDS._('ALLIMAP_TH_MEMBERS', 'Members') })
          TWDS.createEle('th', { last: tr, textContent: TWDS._('ALLIMAP_TH_LARGE', 'Large') })
          TWDS.createEle('th', { last: tr, textContent: TWDS._('ALLIMAP_TH_MEDIUM', 'Medium') })
          TWDS.createEle('th', { last: tr, textContent: TWDS._('ALLIMAP_TH_SMALL', 'Small forts') })
        }
        acolors[a] = TWDS.allimap.colors[i]
        const tr = TWDS.createEle({
          nodeName: 'tr',
          last: table
        })
        TWDS.createEle('td', {
          textContent: a > 1e8 ? -1 * (a - 1e8) : a,
          last: tr
        })
        const th = TWDS.createEle('th', {
          textContent: a,
          className: 'linklike',
          last: tr,
          onclick: function () {
            if (this.classList.contains('istown')) {
              const t = json.towns[a - 1e8]
              TownWindow.open(t.x, t.y)
            } else {
              AllianceWindow.open(a)
            }
          }
        })
        if (a > 1e8) {
          th.textContent = json.towns[a - 1e8].name
          th.classList.add('istown')
        }
        TWDS.createEle('td', {
          textContent: Math.round(ainfo[a].weight),
          style: {
            textAlign: 'right'
          },
          last: tr
        })
        TWDS.createEle('td', {
          textContent: '',
          style: {
            minWidth: '30px',
            backgroundColor: acolors[a]
          },
          last: tr
        })
        TWDS.createEle('td', {
          textContent: Math.round(ainfo[a].towns),
          style: {
            textAlign: 'right'
          },
          last: tr
        })
        TWDS.createEle('td', {
          textContent: Math.round(ainfo[a].members),
          style: {
            textAlign: 'right'
          },
          last: tr
        })
        for (let j = 2; j > -1; j--) {
          TWDS.createEle('td', {
            textContent: ainfo[a].forts[j],
            style: {
              textAlign: 'right'
            },
            last: tr
          })
        }
        setTimeout(function () {
          const id = parseInt(th.textContent)
          if (id > 1e8) {
            th.textContent = json.towns[id - 1e8].name
          } else {
            Ajax.remoteCallMode('alliance', 'get_data', {
              alliance_id: id
            }, function (r) {
              if (r.error === false && r.data && r.data.allianceName) {
                th.textContent = r.data.allianceName
              }
            })
          }
        }, delay)
        delay += 350
        if ((i + 1) % 20 === 0) {
          delay += 1500
        }
      }
    }
    // draw the nebulas
    for (let i = 0; i < forts.length; i++) {
      const loc = forts[i]
      if (typeof loc !== 'object') {
        continue
      }
      const a = loc.fort.alliance_id
      if (!a) continue
      const tp = loc.fort.type

      const sz = (tp === 0) ? 60 : (tp === 1 ? 100 : 170)
      TWDS.allimap.drawcircle(map, sz, 0.4 + 0.1 * loc.fort.type, acolors[a], loc.fort.x, loc.fort.y)
    }
    // draw the forts
    for (let i = 0; i < forts.length; i++) {
      const loc = forts[i]
      if (typeof loc !== 'object') {
        continue
      }
      let a = loc.fort.alliance_id
      if (!a) a = 1e8 + loc.fort.town_id // invent an alliance for a town.
      if (!a) continue
      let n = loc.fort.name + ', '
      if (loc.fort.type === 0) n += TWDS._('ALLIMAP_FS_0', 'small fort')
      if (loc.fort.type === 1) n += TWDS._('ALLIMAP_FS_1', 'medium fort')
      if (loc.fort.type === 2) n += TWDS._('ALLIMAP_FS_2', 'large fort')
      const x = TWDS.allimap.drawbox(map, loc.fort.type, n, acolors[a], loc.fort.x, loc.fort.y, 0)
      x.classList.add('linklike')
      x.onclick = function () {
        window.FortWindow.open(loc.fort.fort_id, loc.fort.x, loc.fort.y)
      }
    }
    for (const t of Object.values(json.towns)) {
      if (t.member_count && !t.npctown) {
        let a = t.alliance_id
        if (a === null) {
          a = 1e8 + t.town_id // invent an alliance for a town.
        }
        if (acolors[a]) {
          const x = TWDS.allimap.drawbox(map, 0, t.name, acolors[a], t.x, t.y, 45)
          x.classList.add('linklike')
          x.classList.add('TWDS_allimap_town')
          x.onclick = function () {
            TownWindow.open(t.x, t.y, t.town_id)
          }
        }
      }
    }
    const x = TWDS.allimap.drawcheckbox(map, TWDS._('ALLIMAP_HIDE_TOWNS', 'hide towns'), 21000, 9000)
    x.onchange = function () {
      const all = TWDS.q('.TWDS_allimap_town')
      for (let i = 0; i < all.length; i++) {
        if (this.checked) { all[i].style.display = 'none' } else { all[i].style.display = 'block' }
      }
    }
  })
}

TWDS.allimap.getcontent = function (win) {
  const content = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_allimap_content'
  })
  const factor = 1.33
  const map = TWDS.createEle('div.map', {
    last: content,
    style: {
      width: Math.round(500 * factor) + 'px',
      height: Math.round(220 * factor) + 'px',
      background: 'url(/images/map/minimap/worldmap_500.jpg) no-repeat',
      backgroundSize: 'contain',
      position: 'relative',
      overflow: 'hidden'
    }
  })
  const table = TWDS.createEle('table.mapinfo', {
    last: content
  })
  TWDS.allimap.drawit(map, table)
  return content
}

TWDS.allimap.openwindow = function (search) {
  const wid = 'TWDS_allimap_window'
  let win
  if (wman.isWindowCreated(wid)) {
    win = wman.getById(wid)
    if (wman.isMinimized(wid)) {
      wman.reopen(wid, 'allimap')
    }
  } else {
    win = wman.open(wid, 'allimap')
    win.setTitle(TWDS._('ALLIMAP_WINDOW_TITLE', 'Alliance Map'))

    const sp = new west.gui.Scrollpane()
    const content = TWDS.allimap.getcontent(win)
    sp.appendContent(content)
    win.appendToContentPane(sp.getMainDiv())
  }
}
TWDS.registerStartFunc(function () {
  TWDS.registerExtra('TWDS.allimap.openwindow',
    TWDS._('ALLIMPA_EXTRA', 'Alliance world map'),
    TWDS._('ALLIMPA_EXTRA_DESC', 'Shows a map with the most important alliances')
  )
})

// vim: tabstop=2 shiftwidth=2 expandtab
