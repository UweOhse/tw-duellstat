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
    level: Character.level,
    cache: best
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
  let t = found + '/' + total + ' jobs have best clothes stored in the cache.'
  if (found) {
    const avg = (agesum / found) / 1000
    t += 'The average age is '
    if (avg > 2 * 86400) {
      t += Math.round(avg / 8640) / 10 + ' days.'
    } else if (avg > 2 * 3600) {
      t += Math.round(avg / 360) / 10 + ' hours.'
    } else {
      t += Math.round(avg / 60) + ' minutes.'
    }
  }
  ele.textContent = t
}

TWDS.clothcache.reload = function (mode) {
  const jl = JobList.getSortedJobs()
  const info = document.querySelector('#TWDS_job_reload_info')
  for (const job of jl) {
    const old = TWDS.getJobBestFromCache(job.id)
    if (old !== null) {
      const ts = old.timestamp
      if (mode === '1d') {
        if (ts > new Date().getTime() - 1 * 86400 * 1000) { continue }
      }
      if (mode === '2d') {
        if (ts > new Date().getTime() - 2 * 86400 * 1000) { continue }
      }
      if (mode === '1w') {
        if (ts > new Date().getTime() - 7 * 86400 * 1000) { continue }
      }
      if (mode === '30d') {
        if (ts > new Date().getTime() - 30 * 86400 * 1000) { continue }
      }
      if (mode === 'missing') { continue }
    }
    console.log('calc', job.id, job.name, mode, old)
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
        ds: []
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

  window.localStorage.setItem('TWDS_itemusage', JSON.stringify(items))

  Ajax.remoteCallMode('inventory', 'show_equip', {}, function (data) {
    const eql = data.data
    for (const [idx, eq] of Object.entries(eql)) {
      for (const slot of Wear.slots) {
        const it = eq[slot]
        add2item(it, 'eq', idx)
      }
    }
    window.localStorage.setItem('TWDS_itemusage', JSON.stringify(items))
  })
}

TWDS.registerSetting('bool', 'saleProtection',
  TWDS._('CLOTHCACHE_PROTECT', 'Make the best items for any job, and the items of managed sets (game, tw-calc, tw-duellstat)  unsalable and unauctionable.'),
  true)

TWDS.clothcache.startFunction = function () {
  try {
    west.item.Calculator._TWDS_backup_getBestSet = west.item.Calculator.getBestSet
    west.item.Calculator.getBestSet = TWDS.getBestSetWrapper
  } catch (e) {
  }

  try {
    tw2widget.InventoryItem.prototype._TWDS_backup_initDisplay = tw2widget.InventoryItem.prototype.initDisplay
    tw2widget.InventoryItem.prototype.initDisplay = function () {
      tw2widget.InventoryItem.prototype._TWDS_backup_initDisplay.apply(this, arguments)

      let iu = window.localStorage.getItem('TWDS_itemusage')
      if (iu === null) return
      iu = JSON.parse(iu)

      const ii = this.obj.item_id
      let title = ''
      let count = 0
      if (ii in iu) {
        iu = iu[ii]
        if (iu.job.length) {
          title = title + iu.job.length + ' jobs'
          count += iu.job.length
        }
        if (iu.eq.length) {
          if (title > '') title += ', '
          title = title + iu.eq.length + ' equiment sets'
          count += iu.eq.length
        }
        if (iu.ds.length) {
          if (title > '') title += ', '
          title = title + iu.ds.length + ' tw-duellstat equiment sets'
          count += iu.ds.length
        }
      }
      let twcalc = window.localStorage.getItem('TWCalc_Wardrobe')
      if (twcalc !== null) {
        twcalc = JSON.parse(twcalc)
        let wcnt = 0
        for (let i = 0; i < twcalc.length; i++) {
          for (let j = 0; j < 10; j++) {
            if (twcalc[i][j] === ii) { wcnt++ }
          }
        }
        if (wcnt) {
          if (title > '') title += ', '
          title = title + wcnt + ' TW-Calc equiment sets'
          count += wcnt
        }
      }
      if (!count) {
        return
      }
      const span = document.createElement('span')
      span.classList.add('TWDS_itemusageinfo')
      this.divMain[0].appendChild(span)
      span.textContent = count
      span.title = title
      if (TWDS.settings.saleProtection) {
        this.divMain[0].classList.add('not_auctionable')
        this.divMain[0].classList.add('not_sellable')
      }
    }
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
