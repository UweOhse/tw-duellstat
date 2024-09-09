TWDS.storage = {}

TWDS.storage.data = {}
TWDS.storage.dropperhour = {}
TWDS.storage.reload = function () {
  const d = window.localStorage.getItem('TWDS_storage') || '{}'
  TWDS.storage.data = JSON.parse(d) || {}
  const aj = JobsModel.Jobs
  for (let i = 0; i < aj.length; i++) {
    const job = aj[i]
    const yields = job.jobObj.yields
    for (const [itemid, d] of Object.entries(yields)) {
      const n = TWDS.TWDBcalcProductRate(300, 50, d.prop * 63.98, 100, 1)
      if (!(itemid in TWDS.storage.dropperhour)) {
        TWDS.storage.dropperhour[itemid] = n
      } else if (n > TWDS.storage.dropperhour[itemid]) {
        TWDS.storage.dropperhour[itemid] = n
      }
    }
  }
}
TWDS.storage.save = function () {
  const d = JSON.stringify(TWDS.storage.data)
  window.localStorage.setItem('TWDS_storage', d)
}

TWDS.storage.marketsearchwindowworker = function (table, cats, catidx, lookfor, infoele) {
  if (catidx >= cats.length) {
    infoele.textContent="";
    if (table.childNodes.length===0) {
      infoele.textContent=TWDS._('STORAGE_MARKETSEARCH_NOTFOUND','Nothing found');
    }
    return
  }
  const cat = cats[catidx]
  Ajax.remoteCall('building_market', 'search_accordion', {
    pattern: '',
    type: cat
  }, function (json) {
    if (json.error) {
      new UserMessage(json.msg, UserMessage.TYPE_ERROR).show()
      return
    }
    for (let i = 0; i < json.items.length; i++) {
      const mid = json.items[i]
      if (lookfor[cat].includes(mid)) {
        const it = ItemManager.get(mid)
        const tr = TWDS.createEle('tr', { last: table })
        const mydata = TWDS.storage.getitemdata(mid)
        const x = TWDS.storage.data[mid]

        TWDS.createEle('td.have', { last: tr, textContent: mydata.have })
        TWDS.createEle('td', { last: tr, textContent: ' / ' })
        TWDS.createEle('td.want', {
          last: tr,
          textContent: mydata.want,
          title: x[1]
        })
        TWDS.createEle('td', {
          last: tr,
          textContent: it.name,
          title: new ItemPopup(it).popup.text
        })
        TWDS.createEle('td', {
          last: tr,
          children: [
            TWDS.marketsearchlink(mid)
          ]
        })
      }
    }
    setTimeout(function () {
      TWDS.storage.marketsearchwindowworker(table, cats, catidx + 1, lookfor, infoele)
    }, 100)
  })
}
TWDS.storage.marketsearchwindow = function () {
  const win = TWDS.utils.stdwindow('TWDS_storage_marketsearch_window',
    TWDS._('STORAGE_MARKETSEARCH_WINDOW_TITLE', 'Storage Market search'),
    TWDS._('STORAGE_MARKETSEARCH_WINDOW_MINITITLE', 'Market'))
  const container = TWDS.utils.getcontainer(win)
  container.innerHTML = ''

  TWDS.storage.reload()
  const lookfor = {}
  for (const ii of Object.keys(TWDS.storage.data)) {
    const it = ItemManager.get(ii)
    if (!it) continue
    const mydata = TWDS.storage.getitemdata(ii)
    if (mydata.have >= mydata.want) continue
    const type = it.type
    if (!(type in lookfor)) {
      lookfor[type] = []
    }
    lookfor[type].push(parseInt(ii))
  }
  const p = TWDS.createEle('p', { last: container })
  const infoele = TWDS.createEle('b', { 
    last: p, 
    textContent: TWDS._("STORAGE_MARKETSEARCH_PLEASE_WAIT","Please wait, search running")
  })
  const table = TWDS.createEle('table', { last: container })
  TWDS.storage.marketsearchwindowworker(table, Object.keys(lookfor), 0, lookfor, infoele)
}

TWDS.storage.startSearch = function (name) {
  // var amount = parseInt($('#WTKExtendedItemFinder_searchDialog_targetAmount').val());
  const ssc = document.getElementById('TWDS_storage_select_container')
  const all = ItemManager.getAll()
  const lowToSearch = name.toLowerCase()
  TWDS.storage.reload()
  if (name > '') {
    ssc.innerHTML = '<tr><th><th>Name<th>Count<th>ID<th>'
    ssc.innerHTML = ''
    TWDS.createEle({
      nodeName: 'tr',
      children: [
        { nodeName: 'th' },
        { nodeName: 'th', textContent: TWDS._('STORAGE_NAME', 'Name') },
        { nodeName: 'th', textContent: TWDS._('STORAGE_COUNT', 'Count') },
        { nodeName: 'th', textContent: TWDS._('STORAGE_ID', 'Id') }
      ],
      last: ssc
    })
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
                {
                  nodeName: 'button',
                  textContent: TWDS._('STORAGE_ADD_THIS', 'add this'),
                  classList: ['TWDS_button', 'TWDS_storage_addthis']
                }
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
  } else {
    ssc.innerHTML = ''
  }
  // and now for the main list
  $('#TWDS_storage_list .datarow').each(function (idx, row) {
    const iid = row.dataset.item_id
    const item = ItemManager.get(iid)
    if (item.name.toLowerCase().indexOf(lowToSearch) >= 0) {
      row.style.display = 'table-row'
    } else {
      row.style.display = 'none'
    }
  })
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
      { nodeName: 'th', dataset: { key: 'name' }, textContent: TWDS._('STORAGE_NAME', 'Name') },
      { nodeName: 'th', dataset: { key: 'percent' }, textContent: '%' },
      { nodeName: 'th', dataset: { key: 'count' }, textContent: TWDS._('STORAGE_IN_BAG', 'In Bag') },
      { nodeName: 'th', dataset: { key: 'target' }, textContent: TWDS._('STORAGE_TARGET', 'Target') },
      { nodeName: 'th', dataset: {}, textContent: TWDS._('STORAGE_COMMENT', 'Comment') },
      { nodeName: 'th', dataset: {}, textContent: '' },
      { nodeName: 'th', dataset: {}, textContent: TWDS._('STORAGE_TRACKING', 'Tracking') }
    ]
  })
  tbody.appendChild(tr)

  TWDS.minimap.loadcache()
  const silvers = {}
  const golds = {}
  for (const poskey in TWDS.minimap.cache) {
    for (const j in TWDS.minimap.cache[poskey]) {
      if (TWDS.minimap.cache[poskey][j].silver) {
        silvers[j] = true
      }
      if (TWDS.minimap.cache[poskey][j].gold) {
        golds[j] = true
      }
    }
  }

  for (const ii of Object.keys(TWDS.storage.data)) {
    const tr = TWDS.storage.initListArea.element(ii, silvers, golds)
    if (tr !== null) { tbody.appendChild(tr) }
  }
  TWDS.createEle({
    nodeName: 'p',
    innerHTML: '<br>You can use the <b>Comment</b> as you please, but the functions to import, to remove selected comment lines and to recalculate the target expect the lines in the comments to have have this format:<br><br>NUMBER some text, for example:<br>50 for daily quests.',
    last: container
  })
}
TWDS.storage.getitemdata = function (itemid) {
  const have = Bag.getItemCount(itemid)
  let want = 0
  if (itemid in TWDS.storage.data) {
    want += parseInt(TWDS.storage.data[itemid][0])
  }
  return {
    have: have,
    want: want
  }
}
TWDS.storage.getsummary = function () {
  const s = {
    current: 0,
    required: 0
  }
  for (const itemid of Object.keys(TWDS.storage.dropperhour)) {
    const t = TWDS.storage.getitemdata(itemid)
    s.current += (t.have > t.want ? t.want : t.have)
    s.required += t.want
  }
  // things not found during work
  for (const itemid of Object.keys(TWDS.storage.data)) {
    if (!(itemid in TWDS.storage.dropperhour)) {
      const t = TWDS.storage.getitemdata(itemid)
      s.current += (t.have > t.want) ? t.want : t.have
      s.required += t.want
    }
  };

  return s
}
TWDS.storage.initListArea.element = function (ii, silvers, golds) {
  let e = TWDS.storage.data[ii]
  const classlist = ['datarow']
  const it = ItemManager.get(ii)
  if (!it) return null
  const popup = new ItemPopup(it, {}).popup.getXHTML()
  let searchthings = ''
  if (JobsModel.Jobs.length) {
    const jl = JobList.getJobsByItemId(ii)
    let best = null
    for (const job of jl) {
      // NOTE: habaneros and such things are found be getJobsByItemId, but are NOT mentioned in job.yields
      if (best === null || !(ii in job.yields)) {
        best = job
      } else if (job.yields[ii].prop > best.yields[ii].prop) {
        best = job
      }
    }

    if (best !== null) {
      searchthings += MinimapWindow.getQuicklink(it.item_id, 'inventory_changed')
      const b = TWDS.jobOpenButton(best.id)
      if (b != null) { // null if !automation
        searchthings += b.outerHTML
      }
      if (best.id in silvers) {
        classlist.push('silver')
      }
      if (best.id in golds) {
        classlist.push('gold')
      }
    }
  }
  const b = TWDS.itemBidButton(ii)
  if (b !== null) { // null if !found || !auctionable
    searchthings += b.outerHTML
  }
  const craft = TWDS.itemCraftButton(ii)
  if (craft !== null) { // null if !found || !auctionable
    searchthings += craft.outerHTML
  }
  const mydata = TWDS.storage.getitemdata(it.item_id)
  if (e === null || typeof e === 'undefined') {
    e = [0, '']
  }

  const count = mydata.have
  const rawpercent = count / (mydata.want ? mydata.want : 1) * 100
  const percent = Math.round(rawpercent) + '%'

  const tr = TWDS.createElement({
    nodeName: 'tr',
    classList: classlist,
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
        dataset: { key: 'target', sortval: mydata.want },
        childNodes: [
          { nodeName: 'input', type: 'number', size: 5, min: 0, value: e[0], classList: ['TWDS_storage_countinput'] }
        ],
        onchange: function () {
          EventHandler.signal('twds_storage_tracking_changed', [this.parentNode.dataset.item_id])
        }
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
          {
            nodeName: 'button',
            textContent: TWDS._('STORAGE_REMOVE', 'remove'),
            title: TWDS._('STORAGE_REMOVE_TITLE', 'removes this line, not the products.'),
            className: 'TWDS_button TWDS_storage_removethis'
          }
        ]
      },
      {
        nodeName: 'td',
        childNodes: [
          {
            nodeName: 'input',
            type: 'checkbox',
            title: TWDS._('STORAGE_TRACKING_TITLE', 'adds this product to the tracker, if it is active.'),
            checked: e[2],
            className: 'TWDS_button TWDS_storage_trackthis'
          }
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
  div.querySelector('#TWDS_storage_search_name').placeholder = TWDS._('STORAGE_SEARCH_PLACEHOLDER', 'search for items')
  div.querySelector('#TWDS_storage_search_name').type = 'search'
  div.querySelector('#TWDS_storage_search_name').style.boxSizing = 'content-box'
  div.appendChild(TWDS.createElement({
    nodeName: 'button',
    id: 'TWDS_storage_export',
    textContent: TWDS._('STORAGE_EXPORT', 'Export'),
    title: TWDS._('STORAGE_EXPORT_TITLE', 'Exports the whole list to the clipboard')
  }))
  div.appendChild(TWDS.createElement({
    nodeName: 'button',
    id: 'TWDS_storage_export_selected',
    textContent: TWDS._('STORAGE_EXPORT_SELECTED', 'Export selected'),
    title: TWDS._('STORAGE_EXPORT_SELECTED_TITLE', 'You will be asked for a search string, and items with comments matching that will be exported to the clipboard')
  }))
  div.appendChild(TWDS.createElement({
    nodeName: 'button',
    id: 'TWDS_storage_import',
    textContent: TWDS._('STORAGE_IMPORT', 'Import'),
    title: TWDS._('STORAGE_IMPORT_TITLE', 'Import records from the clipboard. You will have a chance to review any changes before they happen.')
  }))
  div.appendChild(TWDS.createElement({
    nodeName: 'button',
    id: 'TWDS_storage_remove_selected',
    textContent: TWDS._('STORAGE_REMOVE_SELECTED', 'Remove selected'),
    title: TWDS._('STORAGE_REMOVE_SELECTED_TITLE', 'You will be asked for a search string, then comment entries matching that will be removed and their target numbers will be calculated anew.')
  }))
  div.appendChild(TWDS.createElement({
    nodeName: 'button',
    id: 'TWDS_storage_recalc_sums',
    innerHTML: TWDS._('STORAGE_RECALC_SUMS', '&sum;'),
    title: TWDS._('STORAGE_RECALC_SUMS_TITLE', 'Recalculate the target numbers from the entries in the comments.')
  }))
  TWDS.createElement({
    nodeName: 'button',
    last: div,
    id: 'TWDS_storage_market_mass_search_button',
    title: TWDS._('STORAGE_MARKET_MASS_SEARCH_TITLE', 'Search for missing things on the market'),
    onclick: function () {
      TWDS.storage.marketsearchwindow()
    },
    childNodes: [
      {
        nodeName: 'img',
        src: Game.cdnURL + '/images/icons/bid.png',
        alt: ''
      }
    ]
  })

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
TWDS.storage.gettarget = function (pr) {
  const t = TWDS.storage.getitemdata(pr)
  if (t.want) return t.want
  return null
}
TWDS.storage.reload()
TWDS.storage.isMissing = function (ii) {
  const id = parseInt(ii)
  const t = TWDS.storage.getitemdata(id)
  if (t.want > t.have) return true
  return false
}
TWDS.storage.iteminfo = function (ii) {
  const id = parseInt(ii)
  const t = TWDS.storage.getitemdata(id)
  return [t.want, t.have]
}
TWDS.storage.getMissingList = function () {
  const out = {}
  for (const id of Object.keys(TWDS.storage.data)) {
    const t = TWDS.storage.getitemdata(id)
    if (t.want > t.have) {
      if (JobsModel.Jobs.length) {
        const jl = JobList.getJobsByItemId(id)
        for (const job of jl) {
          out[job.id] = id
        }
      }
    }
  }
  return out
}
TWDS.storage.gettracked = function () {
  const out = []
  for (const id of Object.keys(TWDS.storage.data)) {
    if (TWDS.storage.data[id][2] && TWDS.storage.data[id][1]) { out.push(id) }
  }
  return out
}
TWDS.storage.changetracking = function (pr, mode) {
  if (pr in TWDS.storage.data) {
    TWDS.storage.data[pr][2] = mode
  }
  EventHandler.signal('twds_storage_tracking_changed', [pr])
}
TWDS.storage.istracked = function (pr) {
  if (pr in TWDS.storage.data && 2 in TWDS.storage.data[pr]) {
    return TWDS.storage.data[pr][2]
  }
  return false
}
TWDS.storage.untrack = function (pr) {
  TWDS.storage.changetracking(pr, false)
  TWDS.storage.save()
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
TWDS.storage.recalcsums = function () {
  TWDS.storage.reload()
  let did = 0
  let alerts = ''
  const rx1 = /(\d+)\s+/
  for (const [k, v] of Object.entries(TWDS.storage.data)) {
    const comment = v[1]
    const lines = comment.split('\n')
    let sum = 0
    let okay = 1
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(rx1)
      if (m !== null) {
        sum += parseInt(m[1])
      } else if (lines[i] > '') {
        okay = 0
      }
    }
    if (okay) {
      if (parseInt(v[0]) !== sum) {
        console.log('changing', ItemManager.get(k), 'from', v[0], 'to', sum, v[1])
        v[0] = sum
        did = 1
      }
    } else {
      alerts += ItemManager.get(k).name + '\n'
    }
  }
  if (did) {
    TWDS.storage.save()
    TWDS.storage.activateTab()
  }
  if (alerts > '') {
    window.alert('I failed to understand one or more entries, and left them alone:\n' + alerts)
  }
}
TWDS.storage.removeselected = function (term) {
  TWDS.storage.reload()
  let report = ''
  const indent = function (text) {
    const lines = text.split('\n')
    let out = ''
    for (let i = 0; i < lines.length; i++) {
      out += '  ' + lines[i] + '\n'
    }
    return out
  }

  let x
  if (term) { // debug hack
    x = term
  } else {
    x = window.prompt('searchterm (case insensitive prefix search)')
  }
  if (x === null || x.trim() === '') { return }
  x = x.toLocaleLowerCase()

  const rx1 = new RegExp('(\\d+)\\s*' + x)
  const rx2 = new RegExp('\\W' + x + '\\W')
  const overwrites = {}
  for (const [k, v] of Object.entries(TWDS.storage.data)) {
    const old = v[1]
    const lines = old.split('\n')
    let comment = ''
    let done = 0
    for (let i = 0; i < lines.length; i++) {
      let doit = 0
      const tmp = lines[i].toLocaleLowerCase()

      let m = tmp.match(rx1)
      if (m !== null) doit = 1
      m = tmp.match(rx2)
      if (m !== null) doit = 2

      if (lines[i] === '') doit = 3
      if (!doit) {
        if (comment > '') comment += '\n'
        comment += lines[i]
      } else if (doit !== 3) {
        console.log('MATCH', lines[i], doit)
        done++
      }
    }
    if (done) {
      if (!report) { report = 'Please check:\n' }
      report += 'Old entry for item ' + ItemManager.get(k).name + ':\n'
      report += indent(old)
      report += 'New entry:\n' + indent(comment)
      v[1] = comment
      overwrites[k] = v
    }
  }
  if (report) {
    if (window.confirm(report)) {
      for (const [k, v] of Object.entries(overwrites)) {
        TWDS.storage.data[k] = v
      }
      TWDS.storage.save()
      TWDS.storage.recalcsums()
      TWDS.storage.activateTab()
    }
  }
}

TWDS.storage.importhandler = function () {
  const doit = function (str) {
    console.log('trying to import', str)
    console.log('trying to import', '#' + str + '#')
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
  }
  // firefox: navigator.clipboard has no .readText().
  // documentation talks about permission queries, but clipboard-read perm is unknown.
  try {
    navigator.clipboard.readText().then(function (str) {
      doit(str)
    }, function (e) {
      // Promise rejected.
      console.log(e)
      throw (e)
    })
  } catch (e) {
    console.log('e', e)
    const textarea = $('<textarea />').css({
      width: '400px',
      minHeight: '100px'
    });
    (new west.gui.Dialog('Import', textarea)).addButton('ok', function () {
      doit(textarea.val())
    }).addButton('cancel').show()
  }
}

TWDS.storageStartFunction = function () {
  TWDS.registerSetting('bool', 'storageMapIcon',
    TWDS._('STORAGE_MARK_JOBGROUPS', 'mark jobgroups for missing items on the map'),
    true, null, 'Map')

  TWDS.registerTab('storage',
    TWDS._('TABNAME_STORAGE', 'Storage'),
    TWDS.storage.getContent,
    TWDS.storage.activateTab,
    true)
  $(document).on('change', '#TWDS_storage_search_name', function () {
    const v = this.value.trim()
    TWDS.storage.startSearch(v)
  })
  $(document).on('click', '#TWDS_storage_select_container button.TWDS_storage_addthis', function () {
    const tr = this.closest('tr')
    const ii = tr.dataset.item_id
    TWDS.storage.data[ii] = [Bag.getItemCount(ii) + 100, '']
    TWDS.storage.save()
    if (tr.parentNode) {
      tr.parentNode.removeChild(tr)
      const n = TWDS.storage.initListArea.element(ii)
      const tbody = document.querySelector('#TWDS_storage_list tbody')
      tbody.insertBefore(n, tbody.firstChild)
    }
  })
  $(document).on('click', '#TWDS_storage_list button.TWDS_storage_removethis', function () {
    const tr = this.closest('tr')
    const ii = tr.dataset.item_id
    delete TWDS.storage.data[ii]
    TWDS.storage.save()
    tr.parentNode.removeChild(tr)
  })
  $(document).on('click', '#TWDS_storage_list input.TWDS_storage_trackthis', function () {
    const tr = this.closest('tr')
    const ii = tr.dataset.item_id
    TWDS.storage.changetracking(ii, this.checked)
    TWDS.storage.save()
  })
  $(document).on('change', '#TWDS_storage_list input.TWDS_storage_countinput', function () {
    const tr = this.closest('tr')
    const ii = tr.dataset.item_id
    TWDS.storage.data[ii][0] = this.value
    if (TWDS.storage.data[ii][2]) { EventHandler.signal('twds_storage_tracking_changed', [ii]) }
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
  $(document).on('click', '.TWDS_storage_craft_button', function () {
    const ii = this.dataset.item_id
    if ('TW_Calc' in window) {
      window.TW_Calc.openCraftRecipeWindow(ii)
    } else {
      CharacterWindow.open('crafting')
    }
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
  $(document).on('click', '#TWDS_storage_remove_selected', function () {
    TWDS.storage.removeselected()
  })
  $(document).on('click', '#TWDS_storage_recalc_sums', function () {
    TWDS.storage.recalcsums()
  })
  $(document).on('click', '#TWDS_storage_import', function () {
    TWDS.storage.importhandler()
  })

  Map.Component.JobGroup.TWDS_backup_getMarkers = Map.Component.JobGroup.getMarkers
  Map.Component.JobGroup.getMarkers = function (groupId) {
    let s = Map.Component.JobGroup.TWDS_backup_getMarkers(groupId)
    if (!TWDS.settings.saleProtection) {
      return s
    }

    const jobs = JobList.getJobsByGroupId(groupId)
    const itemnames = []
    for (const job of jobs) {
      for (const y of Object.keys(job.yields)) {
        if (y in TWDS.storage.data && Bag.getItemCount(y) < TWDS.storage.data[y][0]) {
          const it = ItemManager.get(y)
          itemnames.push(it.name.escapeHTML())
        }
      }
    }
    if (itemnames.length) {
      s += '<div class="item-job TWDS_storage_needs_item" title="' + itemnames.join(', ') + '">!</div>'
    }
    return s
  }
  TWDS.storage.reload() // so the map hack has the data
}
TWDS.registerStartFunc(TWDS.storageStartFunction)

// vim: tabstop=2 shiftwidth=2 expandtab
