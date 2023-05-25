// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.minimap = {}
TWDS.minimap.cache = {}
TWDS.minimap.isDefined = function (variable) {
  if (typeof variable === 'undefined' || variable == null) { return false } else { return true }
}
TWDS.minimap.savecache = function () {
  // store in localstorage
  const x = {}
  x.data = TWDS.minimap.cache
  x.time = (new Date()).getTime()
  window.localStorage.setItem('TWDS_silvergold', JSON.stringify(x))
}
TWDS.minimap.loadcache = function () {
  TWDS.minimap.cache = {}
  const stored = window.localStorage.getItem('TWDS_silvergold')
  if (stored) {
    const data = JSON.parse(stored).data
    // i thought the invalidation date was 01:30 UTC, but clothcalc uses 1:15.
    // clothcache got many things right, so use that.
    const cmp = new Date()
    cmp.setUTCHours(1)
    cmp.setMinutes(15)
    cmp.setSeconds(0)
    cmp.setMilliseconds(0)
    let stich = cmp.getTime()
    if (window.get_server_date < stich) {
      stich = stich - 86400 * 1000 // back one day
    }
    TWDS.minimap.cache = {}
    for (const oneposkey in data) {
      const oneposdata = data[oneposkey]
      for (const onejobkey in oneposdata) {
        const onejobdata = oneposdata[onejobkey]
        if (onejobdata.silver) {
          if (onejobdata.time < stich) { continue }
        }
        if (!(oneposkey in TWDS.minimap.cache)) { TWDS.minimap.cache[oneposkey] = {} }
        TWDS.minimap.cache[oneposkey][onejobkey] = onejobdata
      }
    }
  }
}

TWDS.minimap.deletefromcache = function (silver, gold) {
  for (const oneposkey in TWDS.minimap.cache) {
    const oneposdata = TWDS.minimap.cache[oneposkey]
    for (const onejobkey in oneposdata) {
      const onejobdata = oneposdata[onejobkey]
      if (silver && onejobdata.silver) {
        delete TWDS.minimap.cache[oneposkey][onejobkey]
      }
      if (gold && onejobdata.gold) {
        delete TWDS.minimap.cache[oneposkey][onejobkey]
      }
    }
    let count = 0
    for (const onejobkey in oneposdata) {
      if (Object.prototype.hasOwnProperty.call(oneposdata, onejobkey)) {
        count++
      }
    }
    if (count === 0) {
      delete TWDS.minimap.cache[oneposkey]
    }
  }
}

TWDS.minimap.radialmenu = function (e) {
  const t = window.Map.Helper.getPosition(e.parent)
  if (!t || !('x' in t) || !('y' in t)) {
    return
  }
  const key = t.x + '-' + t.y
  if (!TWDS.minimap.isDefined(window.Map.JobHandler.Featured[key])) {
    // gold job gone?
    delete TWDS.minimap.cache[key]
  } else {
    const marked = {}
    for (const i in TWDS.minimap.cache[key]) {
      if (TWDS.minimap.cache[key][i].marked) { marked[TWDS.minimap.cache[key][i].job_id] = true }
    }
    const r = window.Map.JobHandler.Featured[t.x + '-' + t.y]
    TWDS.minimap.cache[key] = {}
    for (const i in r) {
      if (!Object.prototype.hasOwnProperty.call(r, i)) {
        continue
      }
      TWDS.minimap.cache[key][i] = r[i]
      if (marked[r[i].job_id]) { TWDS.minimap.cache[key][i].marked = true }
      TWDS.minimap.cache[key][i].time = (new Date()).getTime()
    }
  }
  TWDS.minimap.updateIfOpen()
  TWDS.minimap.savecache()
}
TWDS.minimap.updateWhenOpen = function () {
  if (!TWDS.minimap.isOpen()) {
    window.setTimeout(TWDS.minimap.updateWhenOpen, 100)
    return
  }
  TWDS.minimap.updateReal()
}
TWDS.minimap.updateIfOpen = function () {
  if (!TWDS.minimap.isOpen()) {
    return
  }
  TWDS.minimap.updateReal()
}
TWDS.minimap.findjob = function (jname) {
  jname = jname.toUpperCase()
  if (!window.JobsModel) return null
  if (!window.JobsModel.Jobs) return null
  if (!window.JobsModel.Jobs.length) return null
  for (let i = 0, len = JobsModel.Jobs.length; i < len; ++i) {
    if (JobsModel.Jobs[i] && JobsModel.Jobs[i].name.toUpperCase() === jname) {
      return JobsModel.Jobs[i].id
    }
  }
  return null
}

TWDS.minimap.updateReal = function () {
  TWDS.minimap.uiinit()

  const handleonebonusposition = function (x, y, withgold, markflag, a, withtracked, withsearched,
    withmissing, withalways, withcollection) {
    const o = 0.00513
    const x1 = parseInt(x * o, 10) - 3
    const y1 = parseInt(y * o, 10) + 2
    let mayrotate = ''
    if (a.length > 1) {
      mayrotate = 'transform:rotate(45deg);'
    }
    let cl = ''
    if (withgold) { cl += ' gold' }
    if (withtracked) { cl += ' tracked' }
    if (withsearched) { cl += ' searched' }
    if (withmissing) { cl += ' storagemissing' }
    if (withalways) { cl += ' hl_always' }
    if (withcollection) { cl += ' collection' }
    if (markflag) { cl += ' marked' }
    const style = 'left:' + x1 + 'px;top:' + y1 + 'px;' + mayrotate
    const str = "<div class='TWDS_bonusjob " + cl + "' style='" + style + "' />"
    const ele = $(str)
    ele.addMousePopup('<div style="min-width:60px;text-align:center">' +
        a.join('<div class="marker_popup_divider"></div>') + '</div>')
    ele[0].dataset.posx = x
    ele[0].dataset.posy = y

    ele.click(function (e, t) {
      window.Map.center(
        e.target.dataset.posx,
        e.target.dataset.posy
      )
    })
    $('#minimap_worldmap').append(ele)
  }
  const handleonemarketposition = function (x, y, a) {
    const o = 0.00513
    const x1 = parseInt(x * o, 10) - 3
    const y1 = parseInt(y * o, 10) + 2
    let mayrotate = ''
    if (a > 1) {
      mayrotate = 'transform:rotate(45deg);'
    }
    const style = 'z-index:7 ;position:absolute; display:block; width:4px; height:4px; ' +
              'background-color:' + 'blue' +
               ';left:' + x1 + 'px;top:' + y1 + 'px;' + mayrotate + 'border:1px solid ' +
               'black' + ";'"

    const str = "<div class='TWDS_mm_markethack' style='" + style + "'/>"
    const ele = $(str)
    ele.addMousePopup('<div style="min-width:60px;text-align:center">' +
        a + ' ' + TWDS._('ITEMS', 'items') + '</div>')
    ele[0].dataset.posx = x
    ele[0].dataset.posy = y

    ele.click(function (e, t) {
      window.Map.center(
        e.target.dataset.posx,
        e.target.dataset.posy
      )
    })
    $('#minimap_worldmap').append(ele)
  }
  const tracked = {}
  if (TWDS.settings.minimap_silvergold && TWDS.settings.minimap_silvergold_trackerhelper) {
    for (const q of Object.values(window.QuestTrackerWindow.trackedQuests)) {
      for (let i = 0; i < q.requirements.length; i++) {
        const r = q.requirements[i]
        if (r.solved === false && r.jsInfo) {
          if (r.jsInfo.type === 'task-finish-job') {
            tracked[r.jsInfo.id] = true
          }
          if (r.jsInfo.type === 'inventory_changed') {
            const x = JobList.getJobsIdsByItemId(r.jsInfo.id)
            for (let y = 0; y < x.length; y++) { tracked[x[y]] = true }
          }
        }
      }
    }
  }

  // $("#minimap_worldmap").css("position","relative"); not good, messes up map
  $('#minimap_worldmap .TWDS_bonusjob').remove()
  $('#minimap_worldmap .TWDS_storagejob').remove()
  if (TWDS.settings.minimap_silvergold) {
    let missingStorage = {}
    let missingCollections = {}
    if (TWDS.settings.minimap_silvergold_storagehelper) { missingStorage = TWDS.storage.getMissingList() } // object jobId->someItemId
    if (TWDS.settings.minimap_silvergold_collecthelper) { missingCollections = TWDS.collections.getMissingList() } // object jobId->someItemId

    const jobname = $('.minimap .tw2gui_jobsearch_string').val()
    let jobid = null
    if (jobname) { jobid = TWDS.minimap.findjob(jobname) }

    for (const oneposkey in TWDS.minimap.cache) {
      const oneposdata = TWDS.minimap.cache[oneposkey]
      const a = []
      let x = -1
      let y = -1
      let withgold = false
      let withtracked = false
      let withsearched = false
      let withmissing = false
      let withalways = false
      let withcollection = false
      let marked = false
      for (const onejobkey in oneposdata) {
        const onejob = oneposdata[onejobkey]
        x = onejob.x
        y = onejob.y
        // let silver=onejob.silver
        const gold = onejob.gold
        const jid = onejob.job_id
        const job = JobList.getJobById(jid)
        if (gold) withgold = true
        if (onejob.marked) marked = true
        if (jid in tracked) { withtracked = true }
        if (jid === jobid) withsearched = true
        if (jid in missingStorage) withmissing = true
        if (jid in missingCollections) withcollection = true
        if ('BJHL_' + jid in TWDS.settings && TWDS.settings['BJHL_' + jid]) withalways = true

        let str = "<div style='min-width:60px;text-align:center' >"
        str += "<span style='font-weight:bold;display:block;'>" + job.name + '</span>' +
               "<div class='job' style='position:relative;left:50%;margin:10px -25px;'>" +
               "<div class='featured " + (gold ? 'gold' : 'silver') + "'></div>" +
               "<img src='" + Game.cdnURL + '/images/jobs/' + job.shortname + ".png' class='job_icon' >" +
               '</div>'
        str += '</div>'
        a.push(str)
      }
      if (a.length > 0) {
        handleonebonusposition(x, y, withgold, marked, a, withtracked, withsearched, withmissing,
          withalways, withcollection)
      }
    }
  }

  $('#minimap_worldmap .TWDS_mm_markethack').remove()
  if (TWDS.settings.minimap_worldmapmarket_active) {
    const mmapdata = window.localStore4Minimap.minimapData
    if (mmapdata) {
      const marketdata = mmapdata.market_locations
      if (marketdata) {
        for (const i in marketdata) {
          if (!Object.prototype.hasOwnProperty.call(marketdata, i)) continue
          const x = marketdata[i].x
          const y = marketdata[i].y
          handleonemarketposition(x, y, marketdata[i].amount)
        }
      }
    }
  }
}

TWDS.minimap.import = function () {
  const textarea = $('<textarea />').css({
    width: '400px',
    minHeight: '100px'
  })
  const doit = function () {
    const val = textarea.val()
    const lines = val.split(/[\n,\r,\r\n]/)
    for (let i = 0; i < lines.length; i++) {
      // Railroad Ticket Agent; silver; 4815-1121; 165
      const parts = lines[i].split(';', 4)
      if (parts.length !== 4 || !jQuery.isNumeric(parts[3]) || !JobsModel.getById(Number(parts[3]))) {
        continue
      }
      const pos = String(parts[2]).split('-', 2)
      if (pos.length !== 2 || !jQuery.isNumeric(pos[0]) || !jQuery.isNumeric(pos[1])) {
        continue
      }
      const jid = Number(parts[3])
      const entry = {
        gold: $.trim(parts[1]) === 'gold',
        group_id: JobsModel.getById(jid).groupid,
        job_id: jid,
        silver: $.trim(parts[1]) !== 'gold',
        x: Number(pos[0]),
        y: Number(pos[1]),
        time: (new Date()).getTime()
      }
      const key = Number(pos[0]) + '-' + Number(pos[1])
      if (!(key in TWDS.minimap.cache)) {
        TWDS.minimap.cache[key] = {}
      }
      TWDS.minimap.cache[key][jid] = entry
    }
    TWDS.minimap.savecache()
    TWDS.minimap.updateIfOpen()
  };
  (new west.gui.Dialog('Bonus-Jobs Import', textarea)).addButton('ok', doit).addButton('cancel').show()
}

TWDS.minimap.export = function () {
  const bonusjobs = []
  for (const pos in TWDS.minimap.cache) {
    for (const jid in TWDS.minimap.cache[pos]) {
      const jd = JobsModel.getById(jid)
      const o = TWDS.minimap.cache[pos][jid]
      let county = Math.ceil(o.x / 6635) + (o.y > 10176 ? 7 : 0)
      if (o.x >= 3 * 6635 && o.x < 4 * 6635) {
        if (o.y > 6635 && o.y < 2 * 6635) {
          county = 15
        }
      }
      bonusjobs.push({
        name: jd.name,
        bonus: o.gold ? 'gold' : 'silver',
        county: county,
        x: o.x,
        y: o.y,
        id: jid
      })
    }
  }
  const maketextarea = function (id) {
    const ta = $('<span>').css({
      width: '500px',
      'min-height': '40px',
      'background-color': 'transparent',
      border: '1px solid block',
      'white-space': 'pre',
      cursor: 'pointer',
      display: 'block',
      'max-height': '25vh',
      overflow: 'scroll',
      '-webkit-user-select': 'text',
      '-moz-user-select': 'text',
      'user-select': 'text'
    }).attr('id', id).click(function () {
      const selection = window.getSelection()
      selection.selectAllChildren(this)
    })
    return ta
  }
  const downloader = function () {
    const id = this.dataset.contentid
    const desc = this.dataset.desc
    const content = $('#' + id).text()
    let dt = (new Date()).toISOString()
    dt = dt.replaceAll(/[^0-9]/, '')

    const fn = 'bonusjobs_' + Game.worldName.replace(/ /g, '_') + '_' + desc +
        '_' + dt + '.txt'

    const a = document.createElement('a')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    a.setAttribute('href', url)
    a.setAttribute('download', fn)
    a.click()
    URL.revokeObjectURL(url)
  }

  const cmp1 = function (a, b) {
    return a.name > b.name ? 1 : -1
  }
  bonusjobs.sort(cmp1)
  const ta1 = maketextarea('TWDS_minimap_joblist_abc')

  let out = ''
  for (let i = 0; i < bonusjobs.length; i++) {
    const o = bonusjobs[i]
    out += o.name + '; ' + o.bonus + '; '
    out += "<span class='TWDS_minimap_export_pos'>" + o.x + '-' + o.y + '</span>; '
    out += o.id + '\n'
  }
  ta1.html(out)

  const cmp2 = function (a, b) {
    if (a.county !== b.county) { return a.county > b.county ? 1 : -1 }
    return a.name > b.name ? 1 : -1
  }
  bonusjobs.sort(cmp2)
  const ta2 = maketextarea('TWDS_minimap_joblist_123')

  out = ''
  let lastcounty = ''
  for (let i = 0; i < bonusjobs.length; i++) {
    const o = bonusjobs[i]
    if (o.county !== lastcounty) {
      lastcounty = o.county
      out += '-- ?county ' + o.county
      if (o.county === 15) {
        out += ' (center)'
      }
      out += ' --' + '\n'
    }
    out += o.name + '; ' + o.bonus + '; '
    out += "<span class='TWDS_minimap_export_pos'>" + o.x + '-' + o.y + '</span>; '
    out += o.id + '\n'
  }
  ta2.html(out)

  const content = $('<div />')
  content.css({
    width: '500px',
    'min-height': '22px'
  })
  const headabc = $('<h2>ABC...</h2>')
  const head123 = $('<h2>123...</h2>')

  const download123 = $('<a>download</a>')
  download123[0].dataset.contentid = 'TWDS_minimap_joblist_123'
  download123[0].dataset.desc = 'bycounty'
  download123.css({
    float: 'right'
  })
  download123.click(downloader)

  const downloadabc = $('<a>download</a>')
  downloadabc[0].dataset.contentid = 'TWDS_minimap_joblist_abc'
  downloadabc[0].dataset.desc = 'byname'
  downloadabc.css({
    float: 'right'
  })
  downloadabc.click(downloader)

  content.append(downloadabc)
  content.append(headabc)
  content.append(ta1)
  content.append(download123)
  content.append(head123)
  content.append(ta2);

  (new west.gui.Dialog('Bonus-Jobs Export', $('<div />').append(content))).addButton('ok').show()
}
TWDS.minimap.export_center_handler = function () {
  const pos = this.textContent.split('-', 2)
  Map.center(pos[0], pos[1])
}

TWDS.minimap.interval = -1
TWDS.minimap.isOpen = function () {
  const x = document.querySelector('#minimap_worldmap')
  if (!x) return false
  return true
}

TWDS.minimap.init = function () {
  TWDS.delegate(document.body, 'click', '.TWDS_minimap_export_pos',
    TWDS.minimap.export_center_handler)
  // Radial Menu can tell us about gold/silver jobs
  try {
    if (!window.Map.Radialmenu.prototype._twds_minimap_open) {
      window.Map.Radialmenu.prototype._twds_minimap_radial_open = window.Map.Radialmenu.prototype.open
      window.Map.Radialmenu.prototype.open = function (e) {
        try {
          this._twds_minimap_radial_open(e)
          TWDS.minimap.radialmenu(this)
        } catch (n) {
          console.error('caught exception handling radialmenu', n)
        }
      }
    }
  } catch (t) {
    console.error('caught around radialmenu', t)
  }

  try {
    if (!MinimapWindow._open) {
      MinimapWindow._twds_minimap_window_open = MinimapWindow.open
      MinimapWindow.open = function (e) {
        try {
          MinimapWindow._twds_minimap_window_open(e)
          TWDS.minimap.updateWhenOpen()
        } catch (t) {
          console.error(t, 'MinimapWindow.open')
        }
      }
    }
  } catch (t) {
    console.error(t, 'manipulate MinimapWindow.open')
  }
  try {
    if (!MinimapWindow._twds_minimap_refreshWindow) {
      MinimapWindow._twds_minimap_refreshWindow = MinimapWindow.refreshWindow
      MinimapWindow.refreshWindow = function () {
        try {
          MinimapWindow._twds_minimap_refreshWindow()
          TWDS.minimap.updateWhenOpen()
        } catch (e) {
          console.error(e, 'MinimapWindow.refreshWindow')
        }
      }
    }
  } catch (t) {
    console.error(t, 'manipulate MinimapWindow.refreshWindow')
  }
}
TWDS.minimap.opacityhandler = function (ev) {
  console.log('OP', this.checked, this, ev)
  if (this.checked) { document.body.classList.add('TWDS_searchmode') } else { document.body.classList.remove('TWDS_searchmode') }
}
TWDS.minimap.arrowclickhandler = function (ev) {
  TWDS.minimap.arrowclickhandler2(ev)
}
TWDS.minimap.arrowclickhandler2 = function (ev) {
  const w = Map.width
  const h = Map.height
  let xmod = 0
  let ymod = 0
  if (ev.target.classList.contains('left')) {
    xmod = -w
  } else if (ev.target.classList.contains('right')) {
    xmod = +w
  } else if (ev.target.classList.contains('up')) {
    ymod = -h
  } else if (ev.target.classList.contains('down')) {
    ymod = +h
  } else {
    return
  }
  const cur = Map.getCurrentMid()
  cur.x += xmod
  cur.y += ymod
  if (cur.x < 0) cur.x = w / 2
  if (cur.y < 0) cur.y = h / 2
  if (cur.x > Map.mapWidth) { cur.x = Map.mapWidth - w / 2 }
  if (cur.y > Map.mapHeight) { cur.y = Map.mapHeight - h / 2 }
  Map.center(cur.x, cur.y)
}
TWDS.minimap.arrowinit = function () {
  const v = TWDS.settings.minimap_add_navigation
  if (!v) {
    return
  }
  const old = TWDS.q1('.TWDS_minimap_navcontainer')
  if (old) { return } // just being careful
  const mmr = TWDS.q1('.minimap .tw2gui_window_content_pane')
  if (!mmr) return

  TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_minimap_navcontainer',
    children: [{
      nodeName: 'span',
      innerHTML: '&#x2190;',
      className: 'TWDS_minimap_nav left ArrowLeft'
    }, {
      nodeName: 'span',
      innerHTML: '&#x2191;',
      className: 'TWDS_minimap_nav up ArrowUp'
    }, {
      nodeName: 'span',
      innerHTML: '&#x2193;',
      className: 'TWDS_minimap_nav down ArrowDown'
    }, {
      nodeName: 'span',
      innerHTML: '&#x2192;',
      className: 'TWDS_minimap_nav right ArrowRight'
    }, {
      nodeName: 'input',
      type: 'checkbox',
      className: 'TWDS_minimap_opacity_checkbox',
      title: TWDS._('MINIMAP_OPACITY_CHECKBOX_TITLE', 'make the user interface mostly transparent')
    }],
    last: mmr
  })
}
TWDS.minimap.uiinit = function () {
  TWDS.minimap.arrowinit()
  const simplebutton = function (text, title, css, cb) {
    const label = $('<label />')
    const sel = $('<span>' + text + '</span>')
    sel.attr('title', title)
    sel.click(cb)
    sel.css(css)
    label.append(sel)
    return label
  }

  $('#TWDS_minimap_silvergold').remove()
  if (TWDS.settings.minimap_silvergold) {
    const container = $("<div id='TWDS_minimap_silvergold' />")
    $('#mmap_cbbox_jobs').before(container)
    let legend = ''
    legend += "<b class='TWDS_bonusjob noabs gold'></b>Gold bonus job.<br>"
    legend += "<b class='TWDS_bonusjob noabs silver'></b>Silver bonus job.<br>"
    legend += "<b class='TWDS_bonusjob noabs storagemissing'></b>Job drops products needed in the storage.<br>"
    legend += "<b class='TWDS_bonusjob noabs collection'></b>Job can drop item needed for a collection.<br>"
    legend += "<b class='TWDS_bonusjob noabs hl_always'></b>Job marked as always highlighted bonus job.<br>"
    legend += "<b class='TWDS_bonusjob noabs tracked'></b>Job tracked in the quest tracker.<br>"
    legend += "<b class='TWDS_bonusjob noabs searched'></b>The currently searched job.<br>"
    legend += 'Note: silver jobs have a white center, gold jobs a yellow one.'
    const q = $('<span>?</span>')
    q[0].title = legend
    container.append(q)

    container.append(simplebutton('#', 'show/hide coordinates', {
      'background-color': 'white'
    }, function () {
      const n = $('.display-tile-coords')
      if (n.length) {
        Map.hideCoords()
      } else {
        Map.showCoords()
      }
    }))

    container.append(simplebutton('x', '<div>clear the silver jobs</div>', {
      'background-color': 'silver'
    }, function () {
      if (window.confirm('clear the stored silver job data?')) {
        TWDS.minimap.deletefromcache(true, false)
        TWDS.minimap.savecache()
        TWDS.minimap.updateIfOpen()
      }
    }))
    container.append(simplebutton('x', 'clear the gold jobs', {
      'background-color': 'gold'
    }, function () {
      if (window.confirm('clear the stored gold job data?')) {
        TWDS.minimap.deletefromcache(false, true)
        TWDS.minimap.savecache()
        TWDS.minimap.updateIfOpen()
      }
    }))

    container.append(simplebutton('export', 'export the gold and silver jobs', {
      'background-color': 'white'
    }, function () {
      TWDS.minimap.export()
    }))

    container.append(simplebutton('import', 'import the gold and silver jobs', {
      'background-color': 'white'
    }, function () {
      TWDS.minimap.import()
    }))
  }
  $('#TWDS_minimap_worldmapmarketcontainer').remove()
  if (TWDS.settings.minimap_use_worldmapmarket) {
    let v = TWDS.settings.minimap_worldmapmarket_active
    if (v === 'undefined') v = 0
    const checked = (v ? 'checked' : '')
    const style = 'display:inline-block; width:4px; height:4px; margin:0 5px;' +
              'background-color: blue; ' +
              'border:1px solid black;'
    const str = "<div style='" + style + "'></div>"
    const e = $("<span id='TWDS_minimap_worldmapmarketcontainer' class='hasMousePopup' style='display:block'>" +
           "<input type='checkbox' value='1' " + checked + '>' +
       str +
       TWDS._('MINIMAP_MARKET_ITEMS_ON_WORLDMAP', 'Market items on world map') +
       '</span>')
    $('.mmap_others').append(e)
    $('#TWDS_minimap_worldmapmarketcontainer input').on('change', function (e) {
      TWDS.settings.minimap_worldmapmarket_active = this.checked ? 1 : 0
      TWDS.saveSettings()
      TWDS.minimap.updateIfOpen()
    })
  }
  if (TWDS.settings.minimap_coordinput) {
    $('.tw2gui_jobsearch_string').on('keyup', function (e) {
      if (e.keyCode === 13) {
        const inp = e.target
        const rx = /^\s*(\d+)\s*[-,x]\s*(\d+)\s*$/
        let found = inp.value.match(rx)
        if (found !== null) {
          const x = found[1]
          const y = found[2]
          window.Map.center(x, y)
          inp.value = ''
        }
        const rx2 = /^\s*(\d+)\s*$/
        found = inp.value.match(rx2)
        if (found !== null) {
          let county = parseInt(found[1])
          if (county > 0 && county <= 15) {
            county--
            let x = county * 6635 + 3317
            let y = 5088
            if (county > 7) {
              x = x - 7 * 6635
              y += 10176
            }
            if (county === 14) { // center
              x = 3 * county * 6635 + 3317
              y = 10176
            }
            window.Map.center(x, y)
            inp.value = ''
          }
        }
        const rx3 = /^\s*(ghost|g|indian|i|center|c|home|h)\s*$/i
        found = inp.value.toLowerCase().match(rx3)
        if (found !== null) {
          if (found[1] === 'ghost' || found[1] === 'g') { window.Map.center(1920, 2176) }
          if (found[1] === 'indian' || found[1] === 'i') { window.Map.center(28060, 16768) }
          if (found[1] === 'center' || found[1] === 'c') { window.Map.center(3.5 * 6635, 10176) }
          if (found[1] === 'home' || found[1] === 'h') { window.Map.center(Character.homeTown.x, Character.homeTown.y) }
          inp.value = ''
          $('.tw2gui_jobsearchbar_results').hide()
        }
      }
    })
  }
}
TWDS.minimap.keyup = function (ev) {
  if (!document.body.classList.contains('TWDS_searchmode')) { return }
  const k = ev.key
  const x = TWDS.q1('.TWDS_minimap_nav.' + k)
  if (x) {
    const event = new window.MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    })
    x.dispatchEvent(event)
  }
}
// middle click on a bonus job adds a mark (outline dotted red) or deletes it
TWDS.minimap.mousedownhandlerReal = function (ev) {
  const workaround = (ev.which !== 0)
  const x = ev.target.dataset.posx
  const y = ev.target.dataset.posy
  const poskey = x + '-' + y
  if (ev.which !== 2) return
  const oneposdata = TWDS.minimap.cache[poskey]
  for (const onejobkey in oneposdata) {
    const onejobdata = oneposdata[onejobkey]
    onejobdata.marked = !onejobdata.marked
    oneposdata[onejobkey] = onejobdata
    if (workaround) { break }
  }
  TWDS.minimap.savecache()
  TWDS.minimap.updateIfOpen()
}
TWDS.minimap.mousedownhandler = function (ev) {
  TWDS.minimap.mousedownhandlerReal(ev)
}

TWDS.registerStartFunc(function () {
  TWDS.minimap.init()
  TWDS.minimap.loadcache()

  // do not show silvergold when TWDB silvergold is active.
  let defaultval = true
  if ('TWDB' in window) {
    if (!window.TWDB.Settings.get('showbonusjobs', true)) {
      defaultval = false
    }
  }

  TWDS.registerSetting('bool', 'minimap_silvergold',
    TWDS._('MINIMAP_SETTING_SILVERGOLD', 'Show known silver/gold jobs on the minimap.'),
    defaultval, function (v) {
      TWDS.minimap.uiinit()
    },
    'Minimap'
  )
  TWDS.registerSetting('bool', 'minimap_silvergold_trackerhelper',
    TWDS._('MINIMAP_SETTING_SILVERGOLD_TRACKERHELPER',
      'Highlight bonus jobs tracked in quests.'), false, function (v) {
      TWDS.minimap.uiinit(v)
    },
    'Minimap'
  )
  TWDS.registerSetting('bool', 'minimap_silvergold_collecthelper',
    TWDS._('MINIMAP_SETTING_SILVERGOLD_COLLECTHELPER',
      'Highlight bonus jobs dropping missing collectibles.'), false, function (v) {
      TWDS.minimap.uiinit(v)
    },
    'Minimap'
  )
  TWDS.registerSetting('bool', 'minimap_silvergold_storagehelper',
    TWDS._('MINIMAP_SETTING_SILVERGOLD_STORAGEHELPER',
      'Highlight bonus jobs for items missing in the storage.'), false, function (v) {
      TWDS.minimap.uiinit(v)
    },
    'Minimap'
  )
  TWDS.registerSetting('bool', 'minimap_coordinput',
    TWDS._('MINIMAP_SETTING_COORDINPUT', 'Abuse the job input field as coordinate input.'),
    defaultval, function (v) {
      TWDS.minimap.uiinit()
    },
    'Minimap'
  )
  TWDS.registerSetting('bool', 'minimap_use_worldmapmarket',
    TWDS._('MINIMAP_SETTING_WORLDMAPMARKET',
      'Add a checkbox allowing to show the market items on the mini world map.'), true, function (v) {
      TWDS.minimap.uiinit()
    },
    'Minimap'
  )
  TWDS.registerSetting('bool', 'minimap_add_navigation',
    TWDS._('MINIMAP_SETTING_NAVIGATION',
      'Add arrows to navigate the map.'), false, function (v) {
      TWDS.minimap.arrowinit(v)
    },
    'Minimap'
  )
  TWDS.delegate(document.body, 'click', '.TWDS_minimap_nav', TWDS.minimap.arrowclickhandler)
  TWDS.delegate(document.body, 'change', '.TWDS_minimap_opacity_checkbox', TWDS.minimap.opacityhandler)
  EventHandler.listen('window_closed_minimap', function () {
    document.body.classList.remove('TWDS_searchmode')
  })
  document.addEventListener('keyup', function (ev) {
    TWDS.minimap.keyup(ev)
  })
  TWDS.delegate(document.body, 'change', '.minimap .tw2gui_jobsearch_string',
    function () { TWDS.minimap.updateIfOpen() }
  )
  TWDS.delegate(document.body, 'mousedown', '#minimap_worldmap .TWDS_bonusjob', TWDS.minimap.mousedownhandler)
})

// vim: tabstop=2 shiftwidth=2 expandtab
