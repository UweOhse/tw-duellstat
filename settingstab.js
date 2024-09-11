
TWDS.getSettingsContentReal = function () {
  const createVersionThing = function () {
    const thing = document.createElement('p')
    thing.classList.add('TWDS_VERSIONINFO')
    thing.textContent = 'Version: @REPLACEMYVERSION@'
    return thing
  }
  const createCacheThing = function () {
    const thing = TWDS.createEle('div.TWDS_settings_cache')

    TWDS.createEle('h2', {
      last: thing,
      textContent: TWDS._('SETTINGS_TITLE', 'Clothes Cache')
    })

    TWDS.createEle('p', {
      last: thing,
      textContent: TWDS._('CLOTHECACHE_SETTING_INTRO',
        'Results of work cloth calculations are stored in a cache, and can be re-used in the job window. Here you can clear, fill or update many jobs at once, though re-calculating all jobs will take quite a bit of time on slow computers.')
    })

    const info = TWDS.createEle('p#TWDS_job_reload_info', {
      last: thing
    })
    TWDS.clothcache.info(info)

    const p = TWDS.createEle('p', { last: thing })

    TWDS.createEle('button', {
      last: p,
      textContent: TWDS._('CLOTHCACHE_BUTTON_CLEAR', 'Clear cloth cache'),
      onclick: TWDS.clothcache.clear
    })

    const label = TWDS.createEle('label', {
      last: p,
      textContent: TWDS._('CLOTHCACHE_RELOAD_QUESTION', 'Reload/fill the cache?')
    })

    TWDS.createEle('button.TWDS_job_reload', {
      last: label,
      textContent: TWDS._('CLOTHCACHE_RELOAD_ALL', 'all'),
      title: TWDS._('CLOTHCACHE_RELOAD_ALL_MOUSEOVER', 'Reload the cloth cache for all jobs'),
      dataset: {
        reloadmode: 'all'
      }
    })
    TWDS.createEle('button.TWDS_job_reload', {
      last: label,
      textContent: TWDS._('CLOTHCACHE_RELOAD_MISSING', 'missing'),
      title: TWDS._('CLOTHCACHE_RELOAD_MISSING_MOUSEOVER', 'Fills the cloth cache for all jobs not having one'),
      dataset: {
        reloadmode: 'missing'
      }
    })
    TWDS.createEle('button.TWDS_job_reload', {
      last: label,
      textContent: TWDS._('CLOTHCACHE_RELOAD_1D', '1d'),
      title: TWDS._('CLOTHCACHE_RELOAD_1D_MOUSEOVER', 'Reload the cloth cache for all jobs where it is older than one day'),
      dataset: {
        reloadmode: '1d'
      }
    })
    TWDS.createEle('button.TWDS_job_reload', {
      last: label,
      textContent: TWDS._('CLOTHCACHE_RELOAD_1W', '1w'),
      title: TWDS._('CLOTHCACHE_RELOAD_1W_MOUSEOVER', 'Reload the cloth cache for all jobs where it is older than one week'),
      dataset: {
        reloadmode: '1w'
      }
    })

    TWDS.createEle('button.TWDS_job_reload', {
      last: label,
      textContent: TWDS._('CLOTHCACHE_RELOAD_30D', '30d'),
      title: TWDS._('CLOTHCACHE_RELOAD_30D_MOUSEOVER', 'Reload the cloth cache for all jobs where it is older than 30 days'),
      dataset: {
        reloadmode: '30d'
      }
    })
    const div = TWDS.createEle('div.searchcontainer', {
      last: p
    })
    const search = TWDS.createEle('input.TWDS_settings_search', {
      type: 'text',
      onchange: function (ev) {
        console.log('change', this, ev, this.value)

        const st = TWDS.q1('#TWDS_settings .TWDS_settings_main table')
        const rows = TWDS.q('tr', st)
        const val = this.value.trim().toLocaleLowerCase()
        let found = 0
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i]
          if (val === '') {
            r.style.display = 'table-row'
            found++
            continue
          }
          const tdsn = TWDS.q1('.settingname', r)
          if (!tdsn) {
            r.style.display = 'none'
            continue
          }
          const sn = tdsn.textContent
          if (sn.toLocaleLowerCase().includes(val)) {
            r.style.display = 'table-row'
            found++
            continue
          }
          r.style.display = 'none'
        }
        if (!found) { // display none everything, val>"": search in the normal text
          for (let i = 0; i < rows.length; i++) {
            const r = rows[i]
            if (r.textContent.toLocaleLowerCase().includes(val)) {
              r.style.display = 'table-row'
            }
          }
        }
      },
      last: div,
      placeholder: 'search'
    })
    TWDS.createEle('button.TWDS_settings_searchx', {
      last: div,
      textContent: 'x',
      onclick: function () {
        search.value = ''
        search.onchange()
      }
    })
    return thing
  }
  const createMainThing = function () {
    const thing = TWDS.createEle('div.TWDS_settings_main')
    const table = TWDS.createEle({
      nodeName: 'table.settings',
      last: thing
    })

    let lastgroup = ''
    const a = []
    for (const x of TWDS.settingList.values()) {
      a.push(x)
    }
    a.sort(function (a, b) {
      if (a.group === 'misc') {
        if (b.group !== 'misc') {
          return 1
        }
      }
      if (b.group === 'misc') {
        return -1
      }
      if (a.group === b.group && (a.subgroup !== '' || b.subgroup !== '')) {
        // subgroups to the end.
        if (a.subgroup !== '' && b.subgroup === '') {
          return 1
        }
        if (b.subgroup !== '' && a.subgroup === '') {
          return -1
        }
        const t = a.subgroup.toLocaleLowerCase().localeCompare(b.subgroup.toLocaleLowerCase())
        if (t) return t
      }
      const t = a.group.toLocaleLowerCase().localeCompare(b.group.toLocaleLowerCase())
      if (t) return t
      if (a.ordervalue !== b.ordervalue) { return a.ordervalue - b.ordervalue }
      return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
    })
    let tbody = null
    for (const one of a) {
      const mode = one.mode
      const name = one.name
      const text = one.text
      const group = one.group
      const opts = one.opts
      if ((group !== lastgroup && group !== '') || tbody === null) {
        tbody = TWDS.createEle({
          nodeName: 'tbody',
          last: table
        })
        TWDS.createEle({
          nodeName: 'tr.head',
          last: tbody,
          children: [
            { nodeName: 'th', colSpan: 2, textContent: group }
          ]
        })
        lastgroup = group
      }
      if (mode === 'info') {
        TWDS.createEle({
          nodeName: 'tr.info',
          last: tbody,
          children: [
            { nodeName: 'td', textContent: text }
          ]
        })
        continue
      }

      const tr = TWDS.createEle({
        nodeName: 'tr.settings',
        last: tbody
      })
      const td = TWDS.createEle({
        nodeName: 'td',
        last: tr
      })

      if (mode === 'bool') {
        const ele = TWDS.createEle({
          nodeName: 'input.TWDS_setting_bool.TWDS_setting',
          type: 'checkbox',
          value: 1,
          dataset: { settingName: name },
          last: td
        })
        if (TWDS.settings[name]) { ele.setAttribute('checked', 'checked') }
      }
      if (mode === 'int') {
        const ele = TWDS.createEle({
          nodeName: 'input.TWDS_setting_int.TWDS_setting',
          type: 'number',
          value: TWDS.settings[name],
          dataset: { settingName: name },
          last: td
        })
        if ('min' in opts) ele.setAttribute('min', opts.min)
        if ('max' in opts) ele.setAttribute('max', opts.max)
      }
      if (mode === 'string') {
        TWDS.createEle({
          nodeName: 'input.TWDS_setting_string.TWDS_setting',
          type: 'text',
          value: TWDS.settings[name],
          dataset: { settingName: name },
          last: td
        })
      }
      TWDS.createEle({
        nodeName: 'span',
        textContent: text,
        last: td
      })
      TWDS.createEle({
        nodeName: 'td.settingname',
        textContent: name,
        last: tr
      })
    }

    return thing
  }
  const div = document.createElement('div')
  div.id = 'TWDS_settings'
  div.appendChild(createVersionThing())
  div.appendChild(createCacheThing())
  div.appendChild(createMainThing())
  return div
}
TWDS.activateSettingsTab = function () {
  TWDS.activateTab('settings')
}
TWDS.getSettingsContent = function () {
  return TWDS.getSettingsContentReal()
}

TWDS.settingsStartFunction = function () {
  TWDS.registerTab('settings',
    TWDS._('TABNAME_SETTINGS', 'Settings'),
    TWDS.getSettingsContent,
    TWDS.activateSettingsTab,
    true)

  $(document).on('change', '.TWDS_setting', function () {
    const name = this.dataset.settingName
    let v = this.value
    if (this.type === 'checkbox') {
      if (!this.checked) { v = false } else { v = true }
    }
    TWDS.settings[name] = v
    console.log('changed setting', name, 'to', v)
    window.localStorage.setItem('TWDS_settings', JSON.stringify(TWDS.settings))
    for (const x of TWDS.settingList.values()) {
      const n = x.name
      if (name === n) {
        const cb = x.callback
        if (cb) cb(v)
      }
    }
    TWDS.saveSettings()
  })
  const t = window.localStorage.getItem('TWDS_setting_jobCacheSeconds')
  if (t !== null) { TWDS.jobCacheSecondsSetting = parseInt(t) }

  $(document).on('click', '.TWDS_job_reload', function () {
    let mode = this.dataset.reloadmode
    if (mode === 'all') {
      TWDS.clothcache.clear()
      mode = 'missing'
    }
    TWDS.clothcache.reload(mode)
  })
}
TWDS.registerStartFunc(TWDS.settingsStartFunction)
// vim: tabstop=2 shiftwidth=2 expandtab
