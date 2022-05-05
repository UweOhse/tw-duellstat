TWDS.storage = {}

TWDS.storage.data = {}
TWDS.storage.reload = function () {
  const d = window.localStorage.getItem('TWDS_storage') || '{}'
  TWDS.storage.data = JSON.parse(d) || {}
}
TWDS.storage.save = function () {
  const d = JSON.stringify(TWDS.storage.data)
  window.localStorage.setItem('TWDS_storage', d)
}

TWDS.registerSetting('bool', 'storageMapIcon',
  TWDS._('MISC_MAPICON', 'mark jobgroups for missing items on the map'),
  true
)
TWDS.storage.WTKHelper = function () {
  const data = {}
  const x = function (key, o, f) {
    for (const e of o) {
      const ii = e.itemID
      const p = e.profession
      if (Character.professionId !== p && p !== 100) return
      if (!(ii in data)) data[ii] = { minLevel: 999, maxLevel: 0, amount: 0 }
      if (e.minLevel < data[ii].minLevel) data[ii].minLevel = e.minLevel
      if (e.maxLevel > data[ii].maxLevel) data[ii].maxLevel = e.maxLevel
      data[ii].amount += e.amount * f
    }
  }
  const weeks = 4
  x('ghosttown', window.WTK.DailyItemHelper.ghostTown, 7 * weeks)
  x('indianvillage', window.WTK.DailyItemHelper.indianVillage, 7 * weeks)
  x('monday', window.WTK.DailyItemHelper.daily.monday, weeks)
  x('tuesday', window.WTK.DailyItemHelper.daily.tuesday, weeks)
  x('wednesday', window.WTK.DailyItemHelper.daily.wednesday, weeks)
  x('thursday', window.WTK.DailyItemHelper.daily.thursday, weeks)
  x('friday', window.WTK.DailyItemHelper.daily.friday, weeks)
  x('saturday', window.WTK.DailyItemHelper.daily.saturday, weeks)
  x('sunday', window.WTK.DailyItemHelper.daily.sunday, weeks)
  x('', window.WTK.DailyItemHelper.others, 7 * weeks)
  const out = {}
  for (const [k, o] of Object.entries(data)) {
    const v = []
    v[0] = o.amount
    v[1] = 'daily'
    if (o.minLevel > 0 && o.maxLevel === 150) {
      v[1] = 'daily (lv' + o.minLevel + '-)'
    } else if (o.minLevel > 0 && o.maxLevel < 150) {
      v[1] = 'daily (lv' + o.minLevel + '-' + o.maxLevel + ')'
    }
    out[k] = v
  }
  console.log('dailys', JSON.stringify(out))
}

TWDS.storage.startSearch = function (name) {
  // var amount = parseInt($('#WTKExtendedItemFinder_searchDialog_targetAmount').val());
  const ssc = document.getElementById('TWDS_storage_select_container')
  const all = ItemManager.getAll()
  const lowToSearch = name.toLowerCase()
  TWDS.storage.reload()
  ssc.innerHTML = '<tr><th><th>Name<th>Count<th>ID<th>'
  let count = 0

  for (const it of Object.values(all)) {
    if (it.item_level !== 0) continue
    if (it.item_id in TWDS.storage.data) continue

    if (it.name.toLowerCase().indexOf(lowToSearch) >= 0) {
      ssc.classList.add('active')
      const popup = new ItemPopup(it, {}).popup.getXHTML()

      const tr = TWDS.createElement({
        nodeName: 'tr',
        dataSet: { item_id: it.item_id },
        childNodes: [
          {
            nodeName: 'td',
            childNodes: [
              { nodeName: 'img', className: 'tw_item inventory_item', src: it.image, alt: it.name, title: popup }
            ]
          },
          { nodeName: 'td', textContent: it.name, title: popup },
          { nodeName: 'td', textContent: Bag.getItemCount(it.item_id) },
          { nodeName: 'td', textContent: it.item_id },
          {
            nodeName: 'td',
            childNodes: [
              { nodeName: 'button', textContent: 'add this', classList: ['TWDS_button', 'TWDS_storage_addthis'] }
            ]
          }
        ]
      })
      ssc.appendChild(tr)
      count++
    }
  }
  const ss = document.getElementById('TWDS_storage_select')
  if (count) {
    ss.classList.add('visible')
  } else {
    ss.classList.remove('visible')
  }
}

TWDS.storage.sortList = function (key) {
  const tab = document.querySelector('#TWDS_storage_list')
  let cursort
  if ('cursort' in tab.dataset) {
    cursort = tab.dataset.cursort
  }
  const tbody = tab.querySelector('tbody')
  const rowColl = tab.querySelectorAll('tbody tr')
  const rows = []
  for (let i = 0; i < rowColl.length; i++) {
    const row = rowColl[i]
    const td = row.querySelector('[data-key=' + key + ']')
    row.sortval = td.dataset.sortval
    rows.push(row)
  }
  if (cursort === key) {
    rows.sort(function (a, b) {
      if (key === 'name') {
        return a.sortval.localeCompare(b.sortval)
      } else if (b.sortval === a.sortval) {
        return b.sortval2 - a.sortval2
      } else {
        return b.sortval - a.sortval
      }
    })
    tab.dataset.cursort = ''
  } else {
    rows.sort(function (a, b) {
      if (key === 'name') {
        return b.sortval.localeCompare(a.sortval)
      } else if (b.sortval === a.sortval) {
        return a.sortval2 - b.sortval2
      } else {
        return a.sortval - b.sortval
      }
    })
    tab.dataset.cursort = key
  }

  tbody.textContent = ''
  for (let i = 0; i < rows.length; i++) {
    tbody.appendChild(rows[i])
  }
}
TWDS.storage.initListArea = function (container) {
  const h = TWDS.createElement({ nodeName: 'h2', textContent: 'List' })
  container.appendChild(h)

  const tab = TWDS.createElement({ nodeName: 'table', id: 'TWDS_storage_list' })
  container.appendChild(tab)
  const thead = TWDS.createElement({ nodeName: 'thead' })
  tab.appendChild(thead)

  TWDS.storage.reload()
  if (!JobsModel.Jobs.length) {
    JobsModel.initJobs()
  }
  const tbody = TWDS.createElement({ nodeName: 'tbody' })
  tab.appendChild(tbody)
  const tr = TWDS.createElement({
    nodeName: 'tr',
    className: 'headrow',
    childNodes: [
      { nodeName: 'th', dataset: { key: 'item_id' }, textContent: '' },
      { nodeName: 'th', dataset: { key: 'name' }, textContent: 'Name' },
      { nodeName: 'th', dataset: { key: 'percent' }, textContent: '%' },
      { nodeName: 'th', dataset: { key: 'count' }, textContent: 'In Bag' },
      { nodeName: 'th', dataset: { key: 'target' }, textContent: 'Target' },
      { nodeName: 'th', dataset: {}, textContent: 'Comment' },
      { nodeName: 'th', dataset: {}, textContent: '' }
    ]
  })
  tbody.appendChild(tr)

  for (const ii of Object.keys(TWDS.storage.data)) {
    const tr = TWDS.storage.initListArea.element(ii)
    if (tr !== null) { tbody.appendChild(tr) }
  }
}
TWDS.storage.initListArea.element = function (ii) {
  const e = TWDS.storage.data[ii]
  const it = ItemManager.get(ii)
  if (!it) return null
  const popup = new ItemPopup(it, {}).popup.getXHTML()
  let searchthings = ''
  if (JobsModel.Jobs.length) {
    const jl = JobList.getJobsByItemId(ii)
    let best = null
    for (const job of jl) {
      if (best === null || job.yields[ii].prop > best.yields[ii].prop) {
        best = job
      }
    }

    if (best !== null) {
      searchthings += MinimapWindow.getQuicklink(it.item_id, 'inventory_changed')
      const b = TWDS.jobOpenButton(best.id)
      if (b != null) { // null if !automation
        searchthings += b.outerHTML
      }
    }
  }
  const b = TWDS.itemBidButton(ii)
  if (b !== null) { // null if !found || !auctionable
    searchthings += b.outerHTML
  }

  const count = Bag.getItemCount(it.item_id)
  const rawpercent = count / (e[0] ? e[0] : 1) * 100
  const percent = Math.round(rawpercent) + '%'

  const tr = TWDS.createElement({
    nodeName: 'tr',
    className: 'datarow',
    dataset: { item_id: ii },
    childNodes: [
      {
        nodeName: 'td',
        className: 'TWDS_storage_image',
        dataset: { key: 'item_id', sortval: ii },
        childNodes: [
          { nodeName: 'img', className: 'tw_item inventory_item', src: it.image, alt: it.name, title: popup }
        ]
      },
      {
        nodeName: 'td',
        className: 'TWDS_storage_name',
        childNodes: [
          { nodeName: 'div', textContent: it.name, title: popup },
          { nodeName: 'span', innerHTML: searchthings }
        ],
        dataset: { key: 'name', sortval: it.name }
      },
      { nodeName: 'td', textContent: percent, className: 'TWDS_storage_percent', dataset: { key: 'percent', sortval: rawpercent } },
      { nodeName: 'td', textContent: count, className: 'TWDS_storage_count', dataset: { key: 'count', sortval: count } },
      {
        nodeName: 'td',
        dataset: { key: 'target', sortval: e[0] },
        childNodes: [
          { nodeName: 'input', type: 'number', size: 5, min: 0, value: e[0], classList: ['TWDS_storage_countinput'] }
        ]
      },
      {
        nodeName: 'td',
        childNodes: [
          { nodeName: 'textarea', type: 'text', min: 0, textContent: e[1], value: e[1], classList: ['TWDS_storage_textinput'] }
        ]
      },
      {
        nodeName: 'td',
        childNodes: [
          { nodeName: 'button', textContent: 'remove', className: 'TWDS_button TWDS_storage_removethis' }
        ]
      }
    ]
  })
  return tr
}

TWDS.storage.initSearchArea = function (container) {
  const div = TWDS.createElement({ nodeName: 'div', id: 'TWDS_storage_search_container' })
  container.appendChild(div)
  const nameInput = new west.gui.Textfield('TWDS_storage_search_name').setSize(10).setClass4Input('input_layout')
  div.appendChild(nameInput.getMainDiv()[0])
  div.querySelector('#TWDS_storage_search_name').placeholder = 'search for items'
  div.appendChild(TWDS.createElement({
    nodeName: 'button',
    id: 'TWDS_storage_export',
    textContent: 'Export'
  }))
  div.appendChild(TWDS.createElement({
    nodeName: 'button',
    id: 'TWDS_storage_export_selected',
    textContent: 'Export selected'
  }))
  div.appendChild(TWDS.createElement({
    nodeName: 'button',
    id: 'TWDS_storage_import',
    textContent: 'Import (add)'
  }))

  const sdiv = TWDS.createElement({
    nodeName: 'div',
    id: 'TWDS_storage_select',
    childNodes: [
      { nodeName: 'h3', textContent: 'Select the item' },
      { nodeName: 'table', id: 'TWDS_storage_select_container' }
    ]
  })
  div.appendChild(sdiv)
}

TWDS.storage.calcCrafting = function () {
  CharacterWindow.Crafting.init()
  const x = {}
  for (const e of Object.values(Crafting.recipes)) {
    for (const r of e.resources) {
      if (!(r.item in x)) { x[r.item] = 0 }
      x[r.item] += r.count
    }
  }
  for (const [i, e] of Object.entries(x)) {
    const it = ItemManager.get(i)
    console.log(i, it.name, e)
  }
}

TWDS.storage.getContent = function () {
  const div = document.createElement('div')
  div.id = 'TWDS_storage'
  TWDS.storage.initSearchArea(div)
  TWDS.storage.initListArea(div)
  return div
}
TWDS.storage.activateTab = function () {
  TWDS.activateTab('storage')
  TWDS.storage.sortList('percent')
  document.getElementById('TWDS_storage_search_name').focus()
}
TWDS.storageStartFunction = function () {
  TWDS.registerTab('storage',
    TWDS._('TABNAME_STORAGE', 'Storage'),
    TWDS.storage.getContent,
    TWDS.storage.activateTab,
    true)
  $(document).on('change', '#TWDS_storage_search_name', function () {
    const v = this.value.trim()
    if (v !== '') { TWDS.storage.startSearch(v) }
  })
  $(document).on('click', '#TWDS_storage_select_container button.TWDS_storage_addthis', function () {
    const tr = this.closest('tr')
    const ii = tr.dataset.item_id
    TWDS.storage.data[ii] = [Bag.getItemCount(ii) + 100, '']
    TWDS.storage.save()
    tr.parentNode.removeChild(tr)
    const n = TWDS.storage.initListArea.element(ii)
    const tbody = document.querySelector('#TWDS_storage_list tbody')
    tbody.insertBefore(n, tbody.firstChild)
  })
  $(document).on('click', '#TWDS_storage_list button.TWDS_storage_removethis', function () {
    const tr = this.closest('tr')
    const ii = tr.dataset.item_id
    delete TWDS.storage.data[ii]
    TWDS.storage.save()
    tr.parentNode.removeChild(tr)
  })
  $(document).on('change', '#TWDS_storage_list input.TWDS_storage_countinput', function () {
    const tr = this.closest('tr')
    const ii = tr.dataset.item_id
    TWDS.storage.data[ii][0] = this.value
    TWDS.storage.save()
  })
  $(document).on('change', '#TWDS_storage_list .TWDS_storage_textinput', function () {
    const tr = this.closest('tr')
    const ii = tr.dataset.item_id
    TWDS.storage.data[ii][1] = this.value
    TWDS.storage.save()
  })
  $(document).on('click', '.TWDS_storage_market_button', function () {
    const ii = this.dataset.item_id
    const it = ItemManager.get(ii)
    MarketWindow.open(Character.homeTown.town_id, 1, '???')
    document.querySelector('.tw2gui_window_tab._tab_id_buy').click()
    document.querySelector('[name=market_search_search]').value = it.name
    document.querySelector('.market-buy .tw2gui_iconbutton.iconBut_mpb_refresh').click()
  })
  $(document).on('click', '#TWDS_storage_list th[data-key]', function () {
    TWDS.storage.sortList(this.dataset.key)
  })

  $(document).on('click', '#TWDS_storage_export', function () {
    TWDS.storage.reload()
    const t = JSON.stringify(TWDS.storage.data)
    navigator.clipboard.writeText(t).then(function () {
      // Promise resolved successfully.
      console.log('Copied to clipboard successfully!')
    }, function () {
      // Promise rejected.
      console.error('Unable to write to clipboard. :-(')
    })
  })
  $(document).on('click', '#TWDS_storage_export_selected', function () {
    TWDS.storage.reload()
    const x = window.prompt('searchterm')
    if (x === null || x.trim() === '') { return }
    const rx1 = new RegExp('(\\d+)\\s*' + x)
    const rx2 = new RegExp('\\W' + x + '\\W')
    let t = {}
    for (const [k, v] of Object.entries(TWDS.storage.data)) {
      let m = v[1].match(rx1)
      if (m !== null) {
        t[k] = [m[1], m[0]]
        continue
      }
      m = v[1].match(rx2)
      if (m !== null) {
        t[k] = v
      }
    }
    t = JSON.stringify(t)
    navigator.clipboard.writeText(t).then(function () {
      // Promise resolved successfully.
      console.log('Copied to clipboard successfully!')
    }, function () {
      // Promise rejected.
      console.error('Unable to write to clipboard. :-(')
    })
  })
  $(document).on('click', '#TWDS_storage_import', function () {
    navigator.clipboard.readText().then(function (str) {
      TWDS.storage.reload()
      let t
      try {
        t = JSON.parse(str)
      } catch (e) {
        console.error('Unable to parse JSON', e, str)
      }
      let report = 'Please check:\n'
      const overwrites = {}
      for (const [k, v] of Object.entries(t)) {
        if (!(k in TWDS.storage.data)) {
          report += 'new: ' + k + '=' + JSON.stringify(v) + '\n'
          overwrites[k] = v
        } else {
          const old = TWDS.storage.data[k]
          report += 'old: ' + k + '=' + JSON.stringify(old) + '\n'
          if (old[1].includes(v[1])) {
            report += '  leaving it alone\n'
          } else {
            const x = []
            x[0] = Number(old[0]) + Number(v[0])
            x[1] = old[1] + '\n' + v[1]
            report += 'new: ' + k + '=' + JSON.stringify(x)
            overwrites[k] = x
          }
        }
      }
      if (window.confirm(report)) {
        for (const [k, v] of Object.entries(overwrites)) {
          TWDS.storage.data[k] = v
        }
        TWDS.storage.save()
        TWDS.storage.activateTab()
      }
    }, function () {
      // Promise rejected.
      console.error('Unable to read from clipboard. :-(')
    })
  })

  Map.Component.JobGroup.TWDS_backup_getMarkers = Map.Component.JobGroup.getMarkers
  Map.Component.JobGroup.getMarkers = function (groupId) {
    if (!TWDS.settings.saleProtection) { return Map.Component.JobGroup.TWDS_backup_getMarkers(groupId) }

    let s = ''
    if (JobList.hasImportantJob(groupId)) { s += '<div class="important" title="' + 'Wird für eine Quest benötigt'.escapeHTML() + '"></div>' }
    if (JobList.hasNewJob(groupId)) { s += '<div class="new-job" title="' + 'Neue Arbeit'.escapeHTML() + '"></div>' }

    const jobs = JobList.getJobsByGroupId(groupId)
    for (const job of jobs) {
      for (const y of Object.keys(job.yields)) {
        if (y in TWDS.storage.data && Bag.getItemCount(y) < TWDS.storage.data[y][0]) {
          const it = ItemManager.get(y)
          s += '<div class="item-job" title="' + it.name.escapeHTML() + '">!</div>'
        }
      }
    }
    return s
  }
  TWDS.storage.reload() // so the map hack has the data
}
TWDS.registerStartFunc(TWDS.storageStartFunction)

// vim: tabstop=2 shiftwidth=2 expandtab
