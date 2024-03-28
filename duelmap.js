// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.duelmap = {}
TWDS.duelmap.data = {}
TWDS.duelmap.timestamp = 0
TWDS.duelmap.validseconds = 900 // 15 minutes

TWDS.duelmap.win = null
TWDS.duelmap.distancelimit = 10
TWDS.duelmap.playerlimit = 100
TWDS.duelmap.lastpageloaded = 0
TWDS.duelmap.morelimit = 20
TWDS.duelmap.friends = {}
TWDS.duelmap.friendsage = 0

TWDS.duelmap.forcetablesort = function () {
  if ('TWDS_duelmap_last_order_mult' in localStorage) {
    if ('TWDS_duelmap_last_order_sel' in localStorage) {
      const tab = TWDS.q1('table.TWDS_opponents', TWDS.duelmap.win.divMain)
      const sel = localStorage.TWDS_duelmap_last_order_sel
      const mul = parseInt(localStorage.TWDS_duelmap_last_order_mult)
      const toclick = TWDS.q1("thead th[data-colsel='" + sel + "'", tab)
      TWDS.sortable.doReal(toclick, mul)
    }
  }
}
TWDS.duelmap.history = function (id, name) {
  const d = TWDS.people.getbyname(name)
  if (!d) return
  const wid = 'TWDS_duelmap_history_' + id
  const win = TWDS.utils.stdwindow(wid, name, name)
  const container = TWDS.utils.getcontainer(win)
  container.innerHTML = ''
  TWDS.appendSubtable(container, d, name)
  TWDS.q('.tw2gui_window.TWDS_duelmap_history_' + id + ' .openreport').forEach(function (ele) {
    ele.classList.add('linklike')
    ele.onclick = function () {
      const hash = this.dataset.hash
      const rid = this.dataset.report_id
      ReportWindow.open(rid, hash, 0)
    }
  })
}

TWDS.duelmap.update = function (name) {
  const data = TWDS.duelmap.data[name]
  const container = TWDS.q1('.tw2gui_window_content_pane > div.duels-TWDS_DUELMAP_CONTAINER')
  const tbody = TWDS.q1('table tbody', container)

  // cleanup, this might be an update
  let old = TWDS.q1('.TWDS_pline_' + data.player_id, tbody)
  if (old) {
    old.remove()
    console.log('removed', name)
  }
  old = TWDS.q1('.TWDS_pbox_' + data.player_id, TWDS.duelmap.map)
  if (old) { old.remove() }

  let color = 'red'
  if (TWDS.duelmap.friends[data.player_id]) {
    color = '#0a0'
  }
  const box = TWDS.maphelper.drawbox(TWDS.duelmap.map, data.character_x, data.character_y, 6,
    name, color, 0, 'player linklike')
  box.onclick = function () {
    window.PlayerProfileWindow.open(data.player_id)
  }

  const tr = TWDS.createEle('tr', { last: tbody })
  tr.classList.add('TWDS_pline_' + data.player_id)

  box.onmouseenter = function () {
    tr.style.outline = '1px solid white'
  }
  box.onmouseleave = function () {
    tr.style.outline = 'none'
  }

  const nele = TWDS.createEle('th.linklike.name', {
    last: tr,
    textContent: name,
    onclick: function () {
      window.PlayerProfileWindow.open(data.player_id)
    },
    onmouseenter: function () {
      box.style.outline = '1px solid white'
    },
    onmouseleave: function () {
      box.style.outline = 'none'
    }
  })
  const getage = function (str) {
    const m = str.match(/^([0-9]+)-([0-9]+)-([0-9]+)$/)
    const then = new Date(m[1], parseInt(m[2]) - 1, m[3]).getTime()
    const now = new Date().getTime()
    const h = (now - then) / (3600 * 24 * 1000)
    return Math.round(h) + 'd'
  }
  if (TWDS.duelmap.friends[data.player_id]) {
    nele.classList.add('friend')
    nele.title = TWDS._('C_FRIEND', 'Friend')
  }
  const histdata = TWDS.people.getbyname(name)
  if (histdata) {
    let last = -1
    let lastcmp = ''
    for (let i = 0; i < histdata.list.length; i++) {
      if (last === -1) {
        lastcmp = histdata.list[i].cmpdate
        last = i
      } else {
        if (histdata.list[i].cmpdate.localeCompare(lastcmp) > 0) {
          last = i
          lastcmp = histdata.list[i].cmpdate
        }
      }
    }

    TWDS.createEle('td.hist', {
      last: tr,
      textContent: getage(lastcmp),
      dataset: { debug: JSON.stringify(TWDS.duelmap.data[name]), sortval: lastcmp },
      onclick: function () {
        TWDS.duelmap.history(data.player_id, name)
        console.log('debug', JSON.parse(this.dataset.debug))
      }
    })
  } else {
    TWDS.createEle('td.hist', { last: tr, dataset: { sortval: '1970-01-01' } })
  }
  TWDS.createEle('td.linklike.town', {
    last: tr,
    textContent: data.town_name,
    onclick: function () {
      TownWindow.open(data.town_x, data.town_y)
    }
  })

  let alli = ''
  let ti = ''
  const aid = data.alliance_id
  alli = TWDS.alliances.id2name[aid] || ''
  if (alli === '' && !TWDS.alliances.ready) {
    alli = aid
    ti = 'alliance names not loaded'
  }
  const aele = TWDS.createEle('td.alliance', { last: tr, textContent: alli, title: ti })
  if (aid) {
    aele.classList.add('linklike')
    aele.onclick = function () {
      AllianceWindow.open(aid)
    }
  }
  TWDS.createEle('td.level', { last: tr, textContent: data.level })
  TWDS.createEle('td.duellevel', { last: tr, textContent: data.duellevel })
  const dxp = Math.round((7 * data.duellevel - 5 * Character.duelLevel + 5) * Character.duelMotivation)
  const dxp100 = Math.round((7 * data.duellevel - 5 * Character.duelLevel + 5))
  TWDS.createEle('td.xp', {
    last: tr,
    textContent: dxp,
    title: TWDS._('TWDS_DUELMAP_XPINFO',
      '$dxp$ duel xp (or $ldxp$ in case you lose), $xp$ char xp (win only).<br>' +
      '$dxp100$ duell xp (or $ldxp100$), $xp100$ char xp, With 100% duell motivation.<br>' +
      'The char xp sum is increased by the item/itemset XP bonus.', {
        dxp: dxp,
        ldxp: Math.round(-dxp / 6),
        xp: dxp * 6,
        dxp100: dxp100,
        ldxp100: Math.round(-dxp100 / 6),
        xp100: dxp100 * 6
      }
    )

  })
  TWDS.createEle('td.class', { last: tr, textContent: data.class })
  const mypos = Map.getLastQueuePosition()
  const wt = window.Map.calcWayTime(mypos, {
    x: data.character_x,
    y: data.character_y
  }).formatDuration()
  const dist = Math.sqrt((data.character_x - mypos.x) * (data.character_x - mypos.x) + (data.character_y - mypos.y) * (data.character_y - mypos.y))
  TWDS.createEle('td.linklike.wt', {
    last: tr,
    innerHTML: wt,
    dataset: { sortval: dist },
    onclick: function () {
      Map.center(data.character_x, data.character_y)
    }

  })
}

TWDS.duelmap.updatestatus = function () {
  let e = TWDS.q1('span.loaded', TWDS.duelmap.win.divMain)
  if (e) {
    const n = Object.keys(TWDS.duelmap.data).length
    console.log('US', n, 'loaded')
    e.textContent = n + ' loaded'
  }
  e = TWDS.q1('span.loaddate', TWDS.duelmap.win.divMain)
  if (e) {
    e.textContent = TWDS.duelmap.timestamp.getFormattedTimeString4Timestamp()
  }
}

TWDS.duelmap.runplayersloaded = 0
TWDS.duelmap.runplayersmax = TWDS.duelmap.pagesperrun
TWDS.duelmap.getdata = function (mode) {
  const ts = (new Date()).getTime() / 1000
  if (mode === 'normal') {
    if (ts > TWDS.duelmap.friendsage) {
      TWDS.duelmap.friendsage = ts + 3600
      Ajax.remoteCallMode('friendsbar', 'search', { search_type: 'friends' },
        function (response) {
          if (response.error) {
            return new UserMessage(response.msg).show()
          }
          TWDS.duelmap.friends = {}
          for (let i = 0; i < response.players.length; i++) {
            const p = response.players[i]
            const n = p.name
            const id = p.player_id
            TWDS.duelmap.friends[id] = n
          }
          TWDS.duelmap.getdata(mode)
        })
      return
    }
  }
  if (TWDS.duelmap.runplayersloaded >= TWDS.duelmap.runplayersmax) {
    console.log('stopping, loaded ', TWDS.duelmap.runplayersloaded, '>=', TWDS.duelmap.runplayersmax)
    TWDS.duelmap.win.hideLoader()
    TWDS.duelmap.updatestatus()
    TWDS.duelmap.forcetablesort()
    return
  }
  let distlimit = TWDS.duelmap.distancelimit ? TWDS.duelmap.distancelimit * 60 : 6 * 3600 * 60
  if (mode === 'more') { distlimit = 6 * 3600 * 60 }
  Ajax.remoteCall('duel', 'search_op', {
    next: true,
    order_by: 'ASC',
    sort: 'range',
    page: TWDS.duelmap.lastpageloaded,
    distance: distlimit
  }, function (json) {
    TWDS.duelmap.lastpageloaded++
    const l = json.oplist.pclist.length
    for (let i = 0; i < l; i++) {
      const p = json.oplist.pclist[i].player_name
      TWDS.duelmap.runplayersloaded++
      TWDS.duelmap.data[p] = json.oplist.pclist[i]
      TWDS.duelmap.update(p)
    }
    if (json.oplist.next) {
      if (TWDS.duelmap.pagesloaded % 10 === 0) {
        setTimeout(TWDS.duelmap.getdata, 1000, mode)
      } else if (TWDS.duelmap.pagesloaded % 4 === 0) {
        setTimeout(TWDS.duelmap.getdata, 100, mode)
      } else {
        setTimeout(TWDS.duelmap.getdata, 50, mode)
      }
    } else {
      TWDS.duelmap.win.hideLoader()
      TWDS.duelmap.updatestatus()
      TWDS.duelmap.forcetablesort()
    }
  })
}
TWDS.duelmap.showTab = function (id) {
  window.DuelsWindow.TWDS_backup_showTab.call(this, id)
  window.DuelsWindow.window.removeClass('noreload').setSize(748, 472)
}

TWDS.duelmap.myshowtab = function (win, id) {
  TWDS.duelmap.win = win
  console.log('win', win, 'id', id)
  win.addClass('nocloseall noreload')
  win.dontCloseAll = true
  win.setTitle(TWDS._('DUELMAP', 'Duelmap'))
  win.activateTab(id)
  win.setSize(749, 655)
  const main = win.getMainDiv()
  console.log('main', main)
  console.log('active', TWDS.q('.tw2gui_window_tab_active', main))
  TWDS.q('.tw2gui_window_tab_active', main).forEach(function (ele) {
    ele.classList.remove('.tw2gui_window_tab_active')
  })
  TWDS.q1('.tw2gui_window_tab._tab_id_TWDS_DUELMAP', main).classList.add('.tw2gui_window_tab_active')
  TWDS.q('.tw2gui_window_content_pane > div', main).forEach(function (ele) {
    ele.style.display = 'none'
  })
  const container = TWDS.q1('.tw2gui_window_content_pane > div.duels-TWDS_DUELMAP_CONTAINER', main)
  container.style.display = 'block'
  container.innerHTML = ''
  const map = TWDS.maphelper.getmap(1.36)
  TWDS.duelmap.map = map
  TWDS.maphelper.drawme(TWDS.duelmap.map)

  container.appendChild(map)

  const sp = new west.gui.Scrollpane()
  console.log('sp', sp)
  const spmain = sp.getMainDiv()
  spmain.style.height = '245px'
  container.appendChild(spmain)
  const p = TWDS.createEle('p')

  TWDS.createEle('span.loaded', { last: p, textContent: '' })

  const more = TWDS.createButton(TWDS._('DUELMAP_MORE', 'more'), { last: p })
  more.onclick = function () {
    TWDS.duelmap.runplayersmax = TWDS.duelmap.morelimit
    TWDS.duelmap.runplayersloaded = 0
    TWDS.duelmap.win.showLoader()
    TWDS.duelmap.getdata('more')
  }

  TWDS.createEle('span.loaddate', { last: p, textContent: '' })
  const newsearch = TWDS.createButton(TWDS._('DUELMAP_NEWSEARCH', 'new search'), { last: p })

  const sel = TWDS.createEle('select.waytime', { last: p })
  const cur = parseInt(localStorage.TWDS_duelmap_filter_waytime) || 10
  TWDS.duelmap.distancelimit = cur
  TWDS.createEle('option', {
    last: sel,
    value: '10',
    textContent: TWDS._('DUELMAP_10m', '10 minutes'),
    selected: cur === 10
  })
  TWDS.createEle('option', {
    last: sel,
    value: '15',
    textContent: TWDS._('DUELMAP_15m', '15 minutes'),
    selected: cur === 15
  })
  TWDS.createEle('option', {
    last: sel,
    value: '30',
    textContent: TWDS._('DUELMAP_30m', '30 minutes'),
    selected: cur === 30
  })
  TWDS.createEle('option', {
    last: sel,
    value: '60',
    textContent: TWDS._('DUELMAP_60m', '60 minutes'),
    selected: cur === 60
  })
  TWDS.createEle('option', {
    last: sel,
    value: '120',
    textContent: TWDS._('DUELMAP_120m', '120 minutes'),
    selected: cur === 120
  })
  TWDS.createEle('option', {
    last: sel,
    value: '0',
    textContent: TWDS._('DUELMAP_UNLIMITED', '-- no limit --'),
    selected: cur === 0
  })
  sel.onchange = function () {
    localStorage.TWDS_duelmap_filter_waytime = this.value
    TWDS.duelmap.distancelimit = parseInt(this.value)
  }
  const sel2 = TWDS.createEle('select.wantplayers', { last: p })
  const cur2 = parseInt(localStorage.TWDS_duelmap_filter_wantplayers) || 100
  TWDS.duelmap.playerlimit = cur2
  for (let i = 20; i <= 200; i += 20) {
    TWDS.createEle('option', { last: sel2, value: i, textContent: i, selected: i === cur2 })
  }
  sel2.onchange = function () {
    localStorage.TWDS_duelmap_filter_wantplayers = this.value
    TWDS.duelmap.playerlimit = parseInt(this.value)
  }

  sp.appendContent(p)

  const tab = TWDS.createEle('table.TWDS_simpleborder.TWDS_opponents', {
    dataset: { TWDS_ordersavekey: 'TWDS_duelmap_last_order' }
  })
  sp.appendContent(tab)
  const thead = TWDS.createEle('thead', { last: tab })
  const tr = TWDS.createEle('tr', { last: thead })
  TWDS.createEle('th.linklike.name', {
    last: tr,
    textContent: TWDS._('C_NAME', 'Name'),
    dataset: { colsel: '.name' },
    onclick: TWDS.sortable.do
  })
  TWDS.createEle('th.linklike', {
    last: tr,
    textContent: TWDS._('DUELMAP_WHEN', 'When'),
    title: TWDS._('DUELMAP_WHEN_TITLE', 'Last duel ... days ago'),
    dataset: { colsel: '.hist', secondcolel: '.name' },
    onclick: TWDS.sortable.do
  })
  TWDS.createEle('th.linklike', {
    last: tr,
    textContent:
    TWDS._('C_TOWN', 'Town'),
    dataset: { colsel: '.town', secondcolsel: '.name' },
    onclick: TWDS.sortable.do
  })
  TWDS.createEle('th.linklike', {
    last: tr,
    textContent: TWDS._('C_ALLIANCE', 'Alliance'),
    dataset: { colsel: '.alliance', secondcolsel: '.name' },
    onclick: TWDS.sortable.do
  })
  TWDS.createEle('th.linklike', {
    last: tr,
    textContent: TWDS._('DUELMAP_LV', 'Lv'),
    title: TWDS._('DUELMAP_LV_TITLE', 'The opponents level'),
    dataset: { colsel: '.level', secondcolsel: '.name' },
    onclick: TWDS.sortable.do
  })
  TWDS.createEle('th.linklike', {
    last: tr,
    textContent: TWDS._('DUELMAP_DLV', 'D-Lv'),
    title: TWDS._('DUELMAP_DLV_TITLE', 'The opponents duelling level'),
    dataset: { colsel: '.duellevel', secondcolsel: '.name' },
    onclick: TWDS.sortable.do
  })
  TWDS.createEle('th.linklike', {
    last: tr,
    textContent: TWDS._('DUELMAP_XP', 'XP'),
    title: TWDS._('DUELMAP_XP_TITLE', 'The amount of duel experience you can get'),
    dataset: { colsel: '.xp', sortmode: 'number', secondcolsel: '.name' },
    onclick: TWDS.sortable.do
  })
  TWDS.createEle('th.linklike', {
    last: tr,
    textContent: TWDS._('DUELMAP_CLASS', 'class'),
    dataset: { colsel: '.class', secondcolsel: '.name' },
    onclick: TWDS.sortable.do
  })
  TWDS.createEle('th.linklike', {
    last: tr,
    textContent: TWDS._('DUELMAP_WAYTIME', 'Waytime'),
    title: TWDS._('DUELMAP_WAYTIME_TITLE', 'Click on it to center the map on the opponent'),
    dataset: { colsel: '.wt', sortmode: 'number', secondcolsel: '.name' },
    onclick: TWDS.sortable.do
  })
  const tbody = TWDS.createEle('tbody', { last: tab })

  const ts = (new Date()).getTime() / 1000
  if (ts > TWDS.duelmap.timestamp + TWDS.duelmap.validseconds) {
    TWDS.duelmap.timestamp = ts
    TWDS.duelmap.win.showLoader()
    TWDS.duelmap.runplayersmax = TWDS.duelmap.playerlimit
    TWDS.duelmap.runplayersloaded = 0
    TWDS.duelmap.lastpageloaded = 0
    TWDS.duelmap.getdata('normal')
  } else {
    for (const p of Object.keys(TWDS.duelmap.data)) {
      TWDS.duelmap.update(p)
      TWDS.duelmap.updatestatus()
      TWDS.duelmap.forcetablesort()
    }
  }

  newsearch.onclick = function () {
    TWDS.duelmap.data = {}
    TWDS.duelmap.timestamp = (new Date()).getTime() / 1000
    TWDS.duelmap.win.showLoader()
    TWDS.duelmap.runplayersmax = TWDS.duelmap.playerlimit
    TWDS.duelmap.runplayersloaded = 0
    TWDS.duelmap.lastpageloaded = 0
    // cleanup
    TWDS.duelmap.map.innerHTML = ''
    TWDS.maphelper.drawme(TWDS.duelmap.map)
    tbody.innerHTML = ''
    TWDS.duelmap.getdata('normal')
  }
}

TWDS.duelmap.open = function () {
  window.DuelsWindow.TWDS_backup_open.call(this)
  window.DuelsWindow.window.addTab(TWDS._('DUELMAP', 'Duelmap'), 'TWDS_DUELMAP', TWDS.duelmap.myshowtab)
  TWDS.createEle('div.duels-TWDS_DUELMAP_CONTAINER', {
    style: { display: 'block' },
    textContent: 'TEST',
    last: window.DuelsWindow.window.getContentPane()
  })
}
TWDS.duelmap.startfunc = function () {
  window.DuelsWindow.TWDS_backup_open = window.DuelsWindow.TWDS_backup_open || window.DuelsWindow.open
  window.DuelsWindow.open = TWDS.duelmap.open
  window.DuelsWindow.TWDS_backup_showTab = window.DuelsWindow.TWDS_backup_showTab || window.DuelsWindow.showTab
  window.DuelsWindow.showTab = TWDS.duelmap.showTab
}
TWDS.registerStartFunc(function () {
  TWDS.duelmap.startfunc()
})
