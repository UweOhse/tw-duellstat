
TWDS.getSettingsContent = function () {
  const createCacheThing = function () {
    const thing = document.createElement('div')
    const times = {
      0: 'Off',
      300: '5m',
      600: '10m',
      1800: '30m',
      3600: '1h',
      7200: '2h',
      21600: '6h',
      42000: '12h',
      86400: '1d',
      172800: '2d',
      604800: '1w',
      2592000: '30d'
    }
    const h = document.createElement('h2')
    thing.appendChild(h)
    h.textContent = 'Clothes cache'

    let p = document.createElement('p')
    p.textContent = 'How long shall work calculations be cached?'
    thing.appendChild(p)
    const sel = document.createElement('select')
    sel.id = 'TWDS_setting_jobCacheSeconds'
    thing.appendChild(sel)
    for (const [s, t] of Object.entries(times)) {
      const opt = document.createElement('option')
      opt.value = s
      opt.textContent = t
      if (TWDS.jobCacheSecondsSetting === parseInt(s)) {
        opt.selected = 'selected'
        opt.setAttribute('selected', 'selected')
      }
      sel.appendChild(opt)
    }

    const info = document.createElement('p')
    info.id = 'TWDS_job_reload_info'
    thing.appendChild(info)

    p = document.createElement('p')
    thing.appendChild(p)
    p.textContent = 'Reload/fill the cache?'

    let button = document.createElement('button')
    thing.appendChild(button)
    button.textContent = TWDS._('JOB_RELOAD_ALL', 'all')
    button.title = TWDS._('JOB_RELOAD_ALL_MOUSEOVER', 'Reload all jobs')
    button.classList.add('TWDS_job_reload')
    button.dataset.reloadmode = 'all'

    button = document.createElement('button')
    thing.appendChild(button)
    button.textContent = TWDS._('JOB_RELOAD_1D', '1d')
    button.title = TWDS._('JOB_RELOAD_ALL_MOUSEOVER', 'Reload all jobs older than 1 day')
    button.classList.add('TWDS_job_reload')
    button.dataset.reloadmode = '1d'

    p = document.createElement('p')
    thing.appendChild(p)
    button = document.createElement('button')
    thing.appendChild(button)
    button.textContent = 'Clear cloth cache'
    button.onclick = TWDS.clearJobItemCache

    return thing
  }
  const div = document.createElement('div')
  div.id = 'TWDS_settings'
  div.appendChild(createCacheThing())
  return div
}
TWDS.activateSettingsTab = function () {
  TWDS.activateTab('settings')
}

TWDS.settingsStartFunction = function () {
  TWDS.registerTab('settings',
    TWDS._('TABNAME_SETTINGS', 'Settings'),
    TWDS.getSettingsContent,
    TWDS.activateSettingsTab,
    true)

  $(document).on('change', '#TWDS_setting_jobCacheSeconds', function () {
    TWDS.jobCacheSecondsSetting = parseInt(this.value)
    window.localStorage.setItem('TWDS_setting_jobCacheSeconds', this.value)
  })
  const t = window.localStorage.getItem('TWDS_setting_jobCacheSeconds')
  if (t !== null) { TWDS.jobCacheSecondsSetting = parseInt(t) }

  $(document).on('click', '.TWDS_job_reload', function () {
    const mode = this.dataset.reloadmode
    const jl = JobList.getSortedJobs()
    const that = this
    const info = document.querySelector('#TWDS_job_reload_info')
    for (const job of jl) {
      const old = TWDS.getJobBestFromCache(job.id)
      console.log('calc', job.id, job.name, mode, old)
      if (old !== null) {
        const ts = old.timestamp
        if (mode === '1d') {
          if (ts > new Date().getTime() - 1 * 86400 * 1000) { continue }
        }
        if (mode === '1w') {
          if (ts > new Date().getTime() - 7 * 86400 * 1000) { continue }
        }
        if (mode === '30d') {
          if (ts > new Date().getTime() - 30 * 86400 * 1000) { continue }
        }
      }
      const out = TWDS.getBestSetWrapper(job.skills, job.id, true)
      info.textContent = job.id + '/' + jl.length + ' ' +
        out.name + ' ' + TWDS.describeItemCombo(out.items)
      setTimeout(function () { $(that).trigger('click') }, 500)
      return
    }
    TWDS.recalcItemUsage()
    TWDS.activateSettingsTab()
    info.textContent = ''
  })
}
TWDS.registerStartFunc(TWDS.settingsStartFunction)
