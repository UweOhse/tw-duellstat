// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.getJobBestFromCache = function (id) {
  const k = 'TWDS_j_' + id
  let d = window.localStorage.getItem(k)
  if (d !== null) {
    d = JSON.parse(d)
    return d
  }
  return null
}
TWDS.jobCacheSecondsSetting = 3600 // 1h
TWDS.getBestSetWrapper = function (skills, id, returnFull = false) {
  const k = 'TWDS_j_' + id

  const best = west.item.Calculator._TWDS_backup_getBestSet(skills, id)
  const one = {
    timestamp: new Date().getTime(),
    id: id,
    level: Character.level
  }
  one.items = [...best.items] // clone that
  for (let i = 0; i < best.sets.length; i++) {
    for (let j = 0; j < best.sets[i].items.length; j++) {
      one.items.push(best.sets[i].items[j])
    }
  }
  window.localStorage.setItem(k, JSON.stringify(one))
  TWDS.clothcache.recalcItemUsage()
  if (returnFull) { return one }
  return best
}
TWDS.clothcache = {}
TWDS.clothcache.clear = function () {
  const jl = JobList.getSortedJobs()
  for (const job of jl) {
    const k = 'TWDS_j_' + job.id
    window.localStorage.removeItem(k)
  }
  TWDS.clothcache.recalcItemUsage()
}
TWDS.clothcache.info = function (ele) {
  const jl = JobList.getSortedJobs()
  let total = 0
  let found = 0
  let agesum = 0
  const now = new Date().getTime()
  for (const job of jl) {
    const old = TWDS.getJobBestFromCache(job.id)
    total++
    if (old === null) {
      continue
    }
    agesum += now - old.timestamp
    found++
  }
  let t = TWDS._('CLOTHCACHE_STATUS_INFO_TEXT',
    '$found$ / $total$ jobs have best clothes stored in the cache.',
    { found: found, total: total })

  if (found) {
    const avg = (agesum / found) / 1000
    let agestr
    if (avg > 2 * 86400) {
      agestr = (avg / 86400).toFixed(1)
      agestr = TWDS._('CLOTHCACHE_STATUS_AGE_DAYS', '$n$ days', { n: agestr })
    } else if (avg > 2 * 3600) {
      agestr = (avg / 3600).toFixed(1)
      agestr = TWDS._('CLOTHCACHE_STATUS_AGE_HOURS', '$n$ hours', { n: agestr })
    } else {
      agestr = (avg / 60).toFixed(1)
      agestr = TWDS._('CLOTHCACHE_STATUS_AGE_MINUTES', '$n$ minutes', { n: agestr })
    }
    t += ' '
    t += TWDS._('CLOTHCACHE_STATUS_AGE_TEXT', 'The average age is $age$.', { age: agestr })
  }
  ele.textContent = t
}

TWDS.clothcache.reload = function (mode) {
  const jl = JobList.getSortedJobs()
  const info = document.querySelector('#TWDS_job_reload_info')
  let cmp = new Date().getTime()
  if (mode === '1d') {
    cmp -= 1 * 86400 * 1000
  }
  if (mode === '2d') {
    cmp -= 2 * 86400 * 1000
  }
  if (mode === '1w') {
    cmp -= 7 * 86400 * 1000
  }
  if (mode === '30d') {
    cmp -= 30 * 86400 * 1000
  }
  if (mode === 'missing') {
    cmp = 0
  }

  for (const job of jl) {
    const old = TWDS.getJobBestFromCache(job.id)
    if (old !== null) {
      const ts = old.timestamp
      if (ts > cmp) continue
    }
    // console.log('calc', job.id, job.name, mode, old)
    const out = TWDS.getBestSetWrapper(job.skills, job.id, true)
    info.textContent = job.id + '/' + jl.length + ' ' +
    job.name + ' ' + TWDS.describeItemCombo(out.items)
    TWDS.clothcache.recalcItemUsage()
    setTimeout(function () { TWDS.clothcache.reload(mode) }, 500)
    return
  }
  TWDS.clothcache.recalcItemUsage()
  TWDS.activateSettingsTab() // layering violation
  info.textContent = ''
}

TWDS.clothcache.recalcItemUsage = function () {
  const items = {}
  const add2item = function (item, key, num) {
    if (!(item in items)) {
      items[item] = {
        job: [],
        eq: [],
        ds: [],
        dyn: []
      }
    }
    items[item][key].push(num)
  }

  const jl = JobList.getSortedJobs()
  for (const job of jl) {
    const b = TWDS.getJobBestFromCache(job.id)
    if (b === null) continue // should not happen
    for (const item of b.items) {
      add2item(item, 'job', job.id)
    }
  }
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)
    if (!k.match(/^TWDS_h_/)) {
      continue
    }
    const s = window.localStorage.getItem(k)
    const o = JSON.parse(s)
    for (const ii of o.item_ids) {
      add2item(ii, 'ds', o.name)
    }
  }
  for (const [id, users] of Object.entries(TWDS.quickequipment.getused())) {
    for (let i = 0; i < users.length; i++) {
      add2item(id, 'dyn', users[i])
    }
  }

  window.localStorage.setItem('TWDS_itemusage', JSON.stringify(items))

  Ajax.remoteCallMode('inventory', 'show_equip', {}, function (data) {
    const eql = data.data
    for (const eq of Object.values(eql)) {
      for (const slot of Wear.slots) {
        const it = eq[slot]
        add2item(it, 'eq', eq.name)
      }
    }
    window.localStorage.setItem('TWDS_itemusage', JSON.stringify(items))
  })
}

TWDS.clothcache.invItemInitDisplay = function () {
  tw2widget.InventoryItem.prototype._TWDS_backup_initDisplay.apply(this, arguments)

  const ii = this.obj.item_id
  this.divMain[0].dataset.twds_item_id = ii // for ease of scripting

  let iu = window.localStorage.getItem('TWDS_itemusage')
  if (iu !== null) {
    iu = JSON.parse(iu)

    let title = ''
    let count = 0
    if (ii in iu) {
      iu = iu[ii]
      if (iu.job.length) {
        title = title + TWDS._('CLOTHCACHE_JOBS', '$n$ jobs', { n: iu.job.length })
        count += iu.job.length
      }
      if (iu.eq.length) {
        if (title > '') title += ', '
        title = title + TWDS._('CLOTHCACHE_TW_EQ_SETS', '$n$ equipment sets', { n: iu.eq.length })
        count += iu.eq.length
      }
      if (iu.ds.length) {
        if (title > '') title += ', '
        title = title + TWDS._('CLOTHCACHE_DS_EQ_SETS', '$n$ $s$ equipment sets', { n: iu.ds.length, s: TWDS.scriptname })
        count += iu.ds.length
      }
      if (iu.dyn.length) {
        if (title > '') title += ', '
        title = title + TWDS._('CLOTHCACHE_DYN_EQ_SETS', '$n$ $s$ dynamic equipment sets', { n: iu.dyn.length, s: TWDS.scriptname })
        count += iu.dyn.length
      }
    }
    let twcalc = window.localStorage.getItem('TWCalc_Wardrobe')
    if (twcalc !== null) {
      twcalc = JSON.parse(twcalc)
      let wcnt = 0
      for (let i = 0; i < twcalc.length; i++) {
        for (let j = 0; j < 10; j++) {
          if (twcalc[i].items[j] === ii) { wcnt++ }
        }
      }
      if (wcnt) {
        if (title > '') title += ', '
        title = title + TWDS._('CLOTHCACHE_TC_EQ_SETS', '$n$ TW-Calc equipment sets', { n: wcnt })
        count += wcnt
      }
    }
    if (count) {
      title += TWDS._('CLOTHCACHE_SHIFT_CLICK_FOR', '. Shift-Click for more information.')
      const span = document.createElement('span')
      span.classList.add('TWDS_itemusageinfo')
      span.dataset.item_id = ii
      this.divMain[0].appendChild(span)
      span.textContent = count
      span.title = title
      if (TWDS.settings.saleProtection) {
        this.divMain[0].classList.add('not_auctionable')
        this.divMain[0].classList.add('not_sellable')
      }
    }
  }
  const st = TWDS.storage.iteminfo(ii)
  const want = parseInt(st[0])
  if (want > 0) {
    const countele = TWDS.q1('.count', this.divMain[0])
    countele.textContent = countele.textContent + ' / ' + want
  }
}

TWDS.clothcache.startFunction = function () {
  try {
    west.item.Calculator._TWDS_backup_getBestSet = west.item.Calculator.getBestSet
    west.item.Calculator.getBestSet = TWDS.getBestSetWrapper
  } catch (e) {
  }

  try {
    tw2widget.InventoryItem.prototype._TWDS_backup_initDisplay = tw2widget.InventoryItem.prototype.initDisplay
    tw2widget.InventoryItem.prototype.initDisplay = TWDS.clothcache.invItemInitDisplay
    document.addEventListener('click', function (ev) {
      if (ev.target.classList.contains('TWDS_itemusageinfo')) {
        if (ev.shiftKey) {
          let sel = "#TWDS_wuw [data-itemid='"
          sel += ev.target.dataset.item_id
          sel += "']"
          TWDS.wuw.openwindow(sel)
        }
        return false
      }
    })
  } catch (e) {
  }

  try {
    JobWindow.prototype._TWDS_getBestWearButton = JobWindow.prototype._TWDS_getBestWearButton ||
      JobWindow.prototype.getBestWearButton

    JobWindow.prototype.getBestWearButton = function () {
      const jw = JobWindow.prototype._TWDS_getBestWearButton.apply(this, arguments)
      // var n = this;
      const jobId = this.job.id
      const d = TWDS.getJobBestFromCache(jobId)
      if (d === null) return jw

      const now = new Date().getTime()
      const age = now - d.timestamp
      let agestr = ''
      if (age > 2 * 24 * 3600 * 1000) {
        agestr = Math.round(age / (24 * 3600 * 1000)) + 'd'
      } else if (age > 2 * 3600 * 1000) {
        agestr = Math.round(age / (3600 * 1000)) + 'h'
      } else {
        agestr = Math.round(age / (60 * 1000)) + 'm'
      }

      const but = TWDS.createButton(
        TWDS._('CLOTHCACHE_BUTTON', 'cached [$agestr$]', { agestr: agestr }), {
          classList: ['TWDS_getbestwear'],
          title: TWDS._('CLOTHCACHE_BUTTON_MOUSEOVER', 'Use a previously calculated coth set')
        }
      )
      /*
      const but = document.createElement('button')
      but.className = 'TWDS_getbestwear'
      but.textContent = 'cached [' + agestr + ']'
      but.title = 'Use a previously calculated coth set'
      */

      jw[0].appendChild(but) // jw is a jQuery.
      but.onclick = function (e) {
        e.stopImmediatePropagation()

        const d = TWDS.getJobBestFromCache(jobId)
        TWDS.wearItemsHandler(d.items)
      }
      return jw
    }
  } catch (e) {
  }
}
TWDS.registerStartFunc(TWDS.clothcache.startFunction)
