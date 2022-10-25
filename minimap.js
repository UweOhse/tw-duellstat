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
  const stored = window.localStorage.getItem('TWDS_silvergold')
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
    const r = window.Map.JobHandler.Featured[t.x + '-' + t.y]
    TWDS.minimap.cache[key] = {}
    for (const i in r) {
      if (!Object.prototype.hasOwnProperty.call(r, i)) {
        continue
      }
      TWDS.minimap.cache[key][i] = r[i]
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
TWDS.minimap.updateReal = function () {
  if (!TWDS.settings.minimap_silvergold) {
    return
  }
  TWDS.minimap.uiinit(true)

  const handleone = function (x, y, withgold, a) {
    const o = 0.00513
    const x1 = parseInt(x * o, 10) - 3
    const y1 = parseInt(y * o, 10) + 2
    let mayrotate = ''
    if (a.length > 1) {
      mayrotate = 'transform:rotate(45deg);'
    }
    const style = 'z-index:7 ;position:absolute; display:block; width:4px; height:4px; ' +
              'background-color:' + (withgold ? 'yellow' : 'white') +
               ';left:' + x1 + 'px;top:' + y1 + 'px;' + mayrotate + 'border:1px solid ' +
               (withgold ? 'red' : 'black') + ";'"

    const str = "<div class='TWDS_bonusjob' style='" + style + ' />'
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

  // $("#minimap_worldmap").css("position","relative"); not good, messes up map
  $('#minimap_worldmap .TWDS_bonusjob').remove()
  for (const oneposkey in TWDS.minimap.cache) {
    const oneposdata = TWDS.minimap.cache[oneposkey]
    const a = []
    let x = -1
    let y = -1
    let withgold = false
    for (const onejobkey in oneposdata) {
      const onejob = oneposdata[onejobkey]
      x = onejob.x
      y = onejob.y
      // let silver=onejob.silver
      const gold = onejob.gold
      const jid = onejob.job_id
      const job = JobList.getJobById(jid)
      if (gold) withgold = true
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
      handleone(x, y, withgold, a)
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
    out += o.name + '; ' + o.bonus + '; ' + o.x + '-' + o.y + '; ' + o.id + '\n'
  }
  ta1.text(out)

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
    out += o.name + '; ' + o.bonus + '; ' + o.x + '-' + o.y + '; ' + o.id + '\n'
  }
  ta2.text(out)

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

TWDS.minimap.interval = -1
TWDS.minimap.isOpen = function () {
  const x = document.querySelector('#minimap_worldmap')
  if (!x) return false
  return true
}

TWDS.minimap.init = function () {
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
TWDS.minimap.uiinit = function (v) {
  const simplebutton = function (text, title, css, cb) {
    const label = $('<label />')
    const sel = $('<span>' + text + '</span>')
    sel.attr('title', title)
    sel.click(cb)
    sel.css({
      display: 'inline-block',
      'min-width': '12px',
      height: '12px',
      'background-color': 'silver',
      border: '1px solid black',
      color: 'black',
      'line-height': '12px',
      'text-align': 'center',
      margin: '1px 2px',
      cursor: 'pointer'
    })
    sel.css(css)
    label.append(sel)
    return label
  }

  $('#TWDS_minimap_ui').remove()
  if (!v) {
    return
  }
  const container = $("<div id='TWDS_minimap_ui' />")
  $('#mmap_cbbox_jobs').before(container)
  container.css({
    display: 'inline-block',
    float: 'right',
    'margin-right': '8px'
  })

  container.append(simplebutton('x', 'clear the silver jobs', {
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
    'show known silver/gold jobs on the minimap.', defaultval, function (v) {
      TWDS.minimap.uiinit(v)
    }
  )
})

// vim: tabstop=2 shiftwidth=2 expandtab
