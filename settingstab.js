
TWDS.getSettingsContentReal = function () {
  const createVersionThing = function () {
    const thing = document.createElement('p')
    thing.classList.add('TWDS_VERSIONINFO')
    thing.textContent = 'Version: @REPLACEMYVERSION@'
    return thing
  }
  const createExtraThing = function () {
    const thing = TWDS.createEle({
      nodeName: 'div',
      className: 'TWDS_settings_extraarea'
    })
    if (TWDS.settings.misc_chestanalyzer) {
      console.log('T')
      TWDS.createEle({
        nodeName: 'button',
        textContent: 'Chests',
        onclick: TWDS.itemuse.openwindow,
        first: thing
      })
    }
    return thing
  }
  const createCacheThing = function () {
    const thing = document.createElement('div')
    thing.className = 'TWDS_settings_cache'
    let button
    let p

    const h = document.createElement('h2')
    thing.appendChild(h)
    h.textContent = 'Clothes cache'

    p = document.createElement('p')
    thing.appendChild(p)
    p.textContent = TWDS._('CLOTHECACHE_SETTING_INTRO', 'Results of work cloth calculations are stored in a cache, and can be re-used in the job window. Here you can clear, fill or update many jobs at once, though re-calculating all jobs will take quite a bit of time on slow computers.')

    p = document.createElement('p')
    const info = document.createElement('p')
    info.id = 'TWDS_job_reload_info'
    thing.appendChild(info)
    TWDS.clothcache.info(info)

    p = document.createElement('p')
    thing.appendChild(p)
    button = document.createElement('button')
    p.appendChild(button)
    button.textContent = TWDS._('CLOTHCACHE_BUTTON_CLEAR', 'Clear cloth cache')
    button.onclick = TWDS.clothcache.clear

    p = document.createElement('p')
    thing.appendChild(p)
    p.textContent = TWDS._('CLOTHCACHE_RELOAD_QUESTION', 'Reload/fill the cache?')

    button = document.createElement('button')
    thing.appendChild(button)
    button.textContent = TWDS._('CLOTHCACHE_RELOAD_ALL', 'all')
    button.title = TWDS._('CLOTHCACHE_RELOAD_ALL_MOUSEOVER', 'Reload the cloth cache for all jobs')
    button.classList.add('TWDS_job_reload')
    button.dataset.reloadmode = 'all'

    button = document.createElement('button')
    thing.appendChild(button)
    button.textContent = TWDS._('CLOTHCACHE_RELOAD_MISSING', 'missing')
    button.title = TWDS._('CLOTHCACHE_RELOAD_MISSING_MOUSEOVER', 'Fills the cloth cache for all jobs not having one')
    button.classList.add('TWDS_job_reload')
    button.dataset.reloadmode = 'missing'

    button = document.createElement('button')
    thing.appendChild(button)
    button.textContent = TWDS._('CLOTHCACHE_RELOAD_1D', '1d')
    button.title = TWDS._('CLOTHCACHE_RELOAD_1D_MOUSEOVER', 'Reload the cloth cache for all jobs where it is older than one day')
    button.classList.add('TWDS_job_reload')
    button.dataset.reloadmode = '1d'

    button = document.createElement('button')
    thing.appendChild(button)
    button.textContent = TWDS._('CLOTHCACHE_RELOAD_1W', '1w')
    button.title = TWDS._('CLOTHCACHE_RELOAD_1W_MOUSEOVER', 'Reload the cloth cache for all jobs where it is older than one week')
    button.classList.add('TWDS_job_reload')
    button.dataset.reloadmode = '1w'

    button = document.createElement('button')
    thing.appendChild(button)
    button.textContent = TWDS._('CLOTHCACHE_RELOAD_30D', '30d')
    button.title = TWDS._('CLOTHCACHE_RELOAD_30D_MOUSEOVER', 'Reload the cloth cache for all jobs where it is older than 30 days')
    button.classList.add('TWDS_job_reload')
    button.dataset.reloadmode = '30d'

    return thing
  }
  const createMainThing = function () {
    const thing = document.createElement('div')
    thing.className = 'TWDS_settings_main'

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
    for (const one of a) {
      const mode = one.mode
      const name = one.name
      const text = one.text
      const group = one.group
      if (group !== lastgroup && group !== '') {
        const h3 = document.createElement('h3')
        thing.appendChild(h3)
        h3.textContent = group
        lastgroup = group
      }
      if (mode === 'info') {
        const p = TWDS.createEle({
          nodeName: 'p',
          className: 'TWDS_setting_info',
          textContent: text
        })
        thing.appendChild(p)
        continue
      }
      const div = document.createElement('div')
      div.className = 'TWDS_settingline'
      thing.appendChild(div)
      if (mode === 'bool') {
        const c = document.createElement('input')
        c.setAttribute('type', 'checkbox')
        c.setAttribute('value', '1')
        c.classList.add('TWDS_setting_bool')
        c.classList.add('TWDS_setting')
        c.dataset.settingName = name
        if (TWDS.settings[name]) { c.setAttribute('checked', 'checked') }
        div.appendChild(c)
        const span = document.createElement('span')
        span.textContent = text
        div.appendChild(span)
      }
      if (mode === 'int') {
        const c = document.createElement('input')
        c.setAttribute('type', 'number')
        c.setAttribute('value', TWDS.settings[name])
        c.classList.add('TWDS_setting_int')
        c.classList.add('TWDS_setting')
        c.dataset.settingName = name
        div.appendChild(c)
        const span = document.createElement('span')
        span.textContent = text
        div.appendChild(span)
      }
      if (mode === 'string') {
        const c = document.createElement('input')
        c.setAttribute('type', 'text')
        c.setAttribute('value', TWDS.settings[name])
        c.classList.add('TWDS_setting_string')
        c.classList.add('TWDS_setting')
        c.dataset.settingName = name
        div.appendChild(c)
        const span = document.createElement('span')
        span.textContent = text
        div.appendChild(span)
      }
    }

    return thing
  }
  const div = document.createElement('div')
  div.id = 'TWDS_settings'
  div.appendChild(createVersionThing())
  div.appendChild(createCacheThing())
  div.appendChild(createExtraThing())
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
