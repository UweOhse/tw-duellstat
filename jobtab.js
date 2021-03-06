// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.debug = 0
TWDS.calcBruttoJobPoints = function (jobId, items) {
  const job = JobList.getJobById(jobId)
  const bo = TWDS.getComboBonus(items)
  let jp = 0
  for (const [skillName, mult] of Object.entries(job.skills)) {
    const sk = CharacterSkills.getSkill(skillName)
    let v = 0
    if (skillName in bo) {
      v += bo[skillName][0]
      if (TWDS.debug) console.log(skillName, 'wear bonus', bo[skillName][0], '=>', v)
    }
    v += sk.points
    if (TWDS.debug) console.log(skillName, 'char skill', sk.points, '=>', v)
    if (sk.attr_key in bo) {
      v += bo[sk.attr_key][0]
      if (TWDS.debug) console.log(skillName, 'char attr', bo[sk.attr_key][0], '=>', v)
    }
    v *= mult
    jp += v
    if (TWDS.debug) console.log('after', skillName, 'mult', mult, 'v', v, 'jp', jp)
  }
  if ('job_all' in bo) {
    jp += bo.job_all[0]
    if (TWDS.debug) console.log('after', 'job_all', '=', bo.job_all[0], 'jp', jp)
  }
  const t = 'job_' + jobId
  if (t in bo) {
    jp += bo[t][0]
    if (TWDS.debug) console.log('after', t, '=', bo[t][0], 'jp', jp)
  }
  return jp
}
TWDS.calcNettoJobPoints = function (jobId, items) {
  const job = JobList.getJobById(jobId)
  const jp = TWDS.calcBruttoJobPoints(jobId, items)
  return jp - job.malus - 1
}

// the functions with TWDB in their name have been taken from tw-db.info (web site, not cloth calc)
// RIP, tw-db. You are missed.
TWDS.TWDBcalcStepFormula = function (r1, r2, formula, points, malus, magic, mot, factor, freezeBronze) {
  /* by steps until silver, then formula
  *  r1, r2 - what type of rounding is used on the calculated value
  *  formula - function(lp, stars) for calcing silver and gold (5 <= stars <= 15)
  *  pts - skill points towards job
  *  malus - difficulty-1
  *  mot - motivation in [0 - 100], if NOT affected by motivation, put 100
  *  factor - other stuff to multiply by before rounding
  *  freezeBronze - if set, bronze is constant magic */
  const step = Math.ceil((malus + 1) / 5); const stars = Math.min(Math.floor(points / step), 15); const dmot = Math.ceil(mot / 25) * 0.25
  return points < 5 * step || points <= malus
    ? Math[r1](({ 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6.25 })[freezeBronze ? 0 : stars] * magic * dmot * factor)
    : Math[r2](formula(points - malus, stars) * magic * dmot * factor)
}
TWDS.TWDBcalcWage = function (pts, mal, magic, mot, fac) {
  return TWDS.TWDBcalcStepFormula('ceil', 'round', function (lp) { return 6.25 * Math.pow(lp, 0.05) }, pts, mal, magic, mot, fac)
}
TWDS.TWDBcalcExp = function (pts, mal, magic, mot, fac) {
  return TWDS.TWDBcalcStepFormula('ceil', 'ceil', function (lp) { return 6.25 }, pts, mal, magic, mot, fac)
}
TWDS.TWDBcalcLuck = function (pts, mal, magic, mot, fac) {
  return TWDS.TWDBcalcStepFormula('floor', 'floor',
    function (lp) { return 6.25 * Math.pow(lp, 0.2) },
    pts, mal, (0.9 * magic + 5) / 1.25, 100, fac)
}
TWDS.TWDBcalcExp = function (pts, mal, magic, mot, fac) {
  return TWDS.TWDBcalcStepFormula('ceil', 'ceil', function (lp) { return 6.25 }, pts, mal, magic, mot, fac)
}
TWDS.TWDBcalcDanger = function (pts, mal, magic, mot, fac) {
  return TWDS.TWDBcalcStepFormula('round', 'round', function (lp) { return Math.pow(lp, -0.2) }, pts, mal, magic, 100, fac, true)
}
TWDS.initJobDisplay = function (container, serverdata) {
  const charPremium = Number(Premium.hasBonus('character'))
  const duration = TWDS.curJobDuration
  let durationIdx = 0
  if (duration === 600) durationIdx = 1
  if (duration === 3600) durationIdx = 2

  const row = function (tab, jobId, best) {
    const jobdata = JobList.getJobById(jobId)

    const tr = document.createElement('tr')
    tab.appendChild(tr)
    tr.dataset.jobid = jobId
    let td
    let bestNetto
    let bestBrutto
    const difficulty = jobdata.malus
    const mot = serverdata.jobs[jobId].motivation * 100
    if (best !== null) {
      bestNetto = TWDS.calcNettoJobPoints(jobId, best.items)
      bestBrutto = bestNetto + jobdata.malus + 1
    }

    const curNetto = serverdata.jobs[jobId].workpoints - 1
    const curBrutto = serverdata.jobs[jobId].jobSkillPoints

    let jc = new JobCalculator(curBrutto, jobdata.malus + 1)
    jc.calcStars((curBrutto / (jobdata.malus + 1)))
    const curStars = jc.getJobstarsValue()

    jc = new JobCalculator(bestBrutto, jobdata.malus + 1)
    jc.calcStars((bestBrutto / (jobdata.malus + 1)))
    const bestStars = jc.getJobstarsValue()

    td = document.createElement('td')
    tr.appendChild(td)
    td.textContent = jobId
    td.dataset.field = 'no'

    td = document.createElement('td')
    td.dataset.field = 'date'
    tr.appendChild(td)
    if (best !== null) {
      const dt = new Date(best.timestamp)
      if (dt.toLocaleDateString() === new Date().toLocaleDateString()) {
        td.textContent = dt.toLocaleTimeString(Game.locale.replace('_', '-'))
      } else {
        td.textContent = dt.toLocaleDateString(Game.locale.replace('_', '-'))
      }
    }

    td = document.createElement('td')
    tr.appendChild(td)
    td.textContent = jobdata.name
    if (best !== null) { td.title = TWDS.describeItemCombo(best.items) }
    td.dataset.field = 'name'

    td = document.createElement('td')
    tr.appendChild(td)
    td.dataset.field = 'lp'
    td.textContent = curNetto
    if (best !== null && curNetto !== bestNetto) {
      td.title = bestNetto + ' in best clothes'
    }
    if (curNetto < 0) {
      td.classList.add('TWDS_job_negative')
    } else if (best !== null && curStars !== bestStars) {
      td.classList.add('TWDS_job_less')
    }

    td = document.createElement('td')
    tr.appendChild(td)
    td.textContent = curStars
    td.dataset.field = 'stars'
    td.dataset.sortval = curStars
    if (best !== null && bestStars !== curStars) {
      td.title = bestStars + ' stars in best clothes'
    }
    if (curStars < 6) {
      td.classList.add('TWDS_job_negative')
    } else if (best !== null && curStars !== bestStars) {
      td.classList.add('TWDS_job_less')
    }

    td = document.createElement('td')
    tr.appendChild(td)
    td.textContent = serverdata.jobs[jobId].durations[durationIdx].xp
    td.dataset.field = 'xp'
    td.title = serverdata.jobs[jobId].durations[0].xp + '/' +
      serverdata.jobs[jobId].durations[1].xp + '/' +
      serverdata.jobs[jobId].durations[2].xp +
      ' xp in 15s/10m/1h'

    td = document.createElement('td')
    tr.appendChild(td)
    td.textContent = serverdata.jobs[jobId].durations[durationIdx].money
    td.dataset.field = 'money'
    td.title = '$' + serverdata.jobs[jobId].durations[0].money + '/' +
      serverdata.jobs[jobId].durations[1].money + '/' +
      serverdata.jobs[jobId].durations[2].money +
      ' in 15s/10m/1h'

    td = document.createElement('td')
    tr.appendChild(td)
    td.dataset.field = 'luck'
    let luck = TWDS.TWDBcalcLuck(curBrutto, difficulty, TWDS.jobData['job_' + jobId].job_luck, mot, 1)
    if (charPremium) luck *= 1.5
    td.textContent = Math.round(luck * 3)
    td.title = Math.round(luck) + ' - ' + Math.round(luck * 3)
    if (best !== null && curBrutto !== bestBrutto) {
      let luck2 = TWDS.TWDBcalcLuck(bestBrutto, difficulty, TWDS.jobData['job_' + jobId].job_luck, mot, 1)
      if (charPremium) luck2 *= 1.5
      td.title += '<br>' + Math.round(luck2) + ' -' + Math.round(luck2 * 3) + ' in best clothes'
    }
    td.title += '<br>' + serverdata.jobs[jobId].durations[0].luck + '/' +
      serverdata.jobs[jobId].durations[1].luck + '/' +
      serverdata.jobs[jobId].durations[2].luck +
      ' luck mod. in 15s/10m/1h'

    td = document.createElement('td')
    tr.appendChild(td)
    td.textContent = Math.round(100 * serverdata.jobs[jobId].motivation)
    td.dataset.field = 'motivation'

    td = document.createElement('td')
    tr.appendChild(td)
    td.dataset.field = 'danger'
    let dang = TWDS.TWDBcalcDanger(curBrutto, difficulty, TWDS.jobData['job_' + jobId].job_danger, mot, 1)
    if (Character.charClass === 'adventurer') {
      if (charPremium) dang *= 0.8
      else dang *= 0.9
    }
    td.textContent = Math.round(dang * 10) / 10
    td.title = dang + '% chance of injury'
    if (best !== null) {
      let dang2 = TWDS.TWDBcalcDanger(bestBrutto, difficulty, TWDS.jobData['job_' + jobId].job_danger, mot, 1)
      if (Character.charClass === 'adventurer') {
        if (charPremium) dang2 *= 0.8
        else dang2 *= 0.9
      }
      dang2 = Math.round(dang2 * 10) / 10
      td.title += '<br>' + dang2 + '% chance of injury in best clothes'
    }
    const mh = Character.getMaxHealth()
    const maxInj = Math.round((TWDS.jobData['job_' + jobId].job_maxdmg) / 100 * mh)
    const h = Character.health
    td.title += '<br>An injury costs up to ' + maxInj + ' health points (' + TWDS.jobData['job_' + jobId].job_maxdmg + '% of max. health).'

    const worstJobs = parseInt((h + 1) / maxInj)
    td.title += '<br>You might last ' + worstJobs + ' jobs in the worst case.'

    td = document.createElement('td')
    tr.appendChild(td)

    if (Premium.hasBonus('automation')) {
      let but
      but = document.createElement('button')
      but.textContent = 'open'
      but.classList.add('TWDS_joblist_openbutton')
      but.dataset.jobid = jobId
      but.title = 'Open a window to start the job at the nearest possible position'
      td.appendChild(but)

      but = document.createElement('button')
      but.textContent = 'start'
      but.classList.add('TWDS_joblist_startbutton')
      but.dataset.jobid = jobId
      but.title = 'Start the job at the nearest possible position'
      td.appendChild(but)
    }
  }
  const headrow = function (tab) {
    const thead = document.createElement('thead')
    tab.appendChild(thead)
    const tr = document.createElement('tr')
    thead.appendChild(tr)

    let th

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'no'
    th.textContent = TWDS._('JOBLIST_NUMBER', 'No.')

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'date'
    th.textContent = TWDS._('JOBLIST_DATE', 'Date')
    th.title = "The date the 'best' clothes were calculated."

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'name'
    th.textContent = TWDS._('JOBLIST_NAME', 'Name')

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'lp'
    th.textContent = TWDS._('JOBLIST_LABORPOINTS', 'LP')

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'stars'
    th.textContent = TWDS._('JOBLIST_STARS', 'Stars')

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'xp'
    th.textContent = TWDS._('JOBLIST_XP', 'xp')

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'money'
    th.textContent = TWDS._('JOBLIST_MONEY', 'money')

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'luck'
    // th.textContent = TWDS._('JOBLIST_LUCK', 'luck')
    th.innerHTML = '&#9752;'

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'motivation'
    th.textContent = TWDS._('JOBLIST_MOTIVATION', 'Mot.')

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'danger'
    // th.textContent = TWDS._('JOBLIST_DANGER', 'Danger')
    th.innerHTML = '&#9829;'

    th = document.createElement('th')
    tr.appendChild(th)
  }

  const tab = document.createElement('table')
  container.appendChild(tab)
  tab.id = 'TWDS_jobs'
  headrow(tab)
  const jl = JobList.getSortedJobs()
  const tbody = document.createElement('tbody')
  tab.appendChild(tbody)
  for (const job of jl) {
    const best = TWDS.getJobBestFromCache(job.id)
    row(tbody, job.id, best)
  }
}

TWDS.jobSort = function (tab, key) {
  if (tab == null) { // for ease of debugging
    tab = document.querySelector('#TWDS_jobs')
  }
  let cursort
  if ('cursort' in tab.dataset) {
    cursort = tab.dataset.cursort
  }
  const tbody = tab.querySelector('tbody')
  const rowColl = tab.querySelectorAll('tbody tr')
  const rows = []
  for (let i = 0; i < rowColl.length; i++) {
    const row = rowColl[i]
    const td = row.querySelector('[data-field=' + key + ']')
    if (key === 'name') {
      row.sortval = td.textContent
    } else if ('sortval' in td.dataset) {
      row.sortval = parseFloat(td.dataset.sortval)
    } else {
      row.sortval = parseFloat(td.textContent)
    }
    if (key === 'luck') {
      const td2 = row.querySelector('[data-field=money')
      row.sortval2 = parseFloat(td2.textContent)
    } else {
      const td2 = row.querySelector('[data-field=luck')
      row.sortval2 = parseFloat(td2.textContent)
    }
    rows.push(row)
  }

  if (cursort === key) {
    rows.sort(function (a, b) {
      if (key === 'name') {
        return b.sortval.localeCompare(a.sortval)
      } else if (b.sortval === a.sortval) {
        return a.sortval2 - b.sortval2
      } else {
        return a.sortval - b.sortval
      }
    })
    tab.dataset.cursort = ''
  } else {
    rows.sort(function (a, b) {
      if (key === 'name') {
        return a.sortval.localeCompare(b.sortval)
      } else if (b.sortval === a.sortval) {
        return b.sortval2 - a.sortval2
      } else {
        return b.sortval - a.sortval
      }
    })
    tab.dataset.cursort = key
  }

  tbody.textContent = ''
  for (let i = 0; i < rows.length; i++) {
    tbody.appendChild(rows[i])
  }
}

TWDS.curJobDuration = 15
TWDS.getJobContent = function () {
  const x = window.localStorage.getItem('TWDS_job_duration')
  if (x !== null) { TWDS.curJobDuration = parseInt(x) }

  const div = document.createElement('div')
  div.id = 'TWDS_job'
  const p = document.createElement('p')
  div.appendChild(p)

  const fig = document.createElement('span')
  p.appendChild(fig)
  fig.id = 'TWDS_job_filtergroup'

  const input = document.createElement('input')
  fig.appendChild(input)
  input.id = 'TWDS_job_filter'
  input.placeholder = 'search'

  const button = document.createElement('button')
  fig.appendChild(button)
  button.id = 'TWDS_job_filterx'
  button.textContent = 'x'

  const sel = document.createElement('select')
  p.appendChild(sel)
  sel.id = 'TWDS_job_duration'

  let opt = document.createElement('option')
  sel.appendChild(opt)
  opt.setAttribute('value', 15)
  opt.textContent = '15s'
  if (TWDS.curJobDuration === 15) opt.setAttribute('selected', 'selected')

  opt = document.createElement('option')
  sel.appendChild(opt)
  opt.setAttribute('value', 600)
  opt.textContent = '10m'
  if (TWDS.curJobDuration === 600) opt.setAttribute('selected', 'selected')

  opt = document.createElement('option')
  sel.appendChild(opt)
  opt.setAttribute('value', 3600)
  opt.textContent = '1h'
  if (TWDS.curJobDuration === 3600) opt.setAttribute('selected', 'selected')

  Ajax.remoteCallMode('work', 'index', {}, function (x) {
    TWDS.jobCurrentList = x
    TWDS.initJobDisplay(div, x)
  })

  return div
}
TWDS.activateJobTab = function () {
  TWDS.activateTab('job')
}

TWDS.jobStartFunction = function () {
  TWDS.registerTab('job',
    TWDS._('TABNAME_JOB', 'Jobs'),
    TWDS.getJobContent,
    TWDS.activateJobTab,
    true)
  $(document).on('click', '#TWDS_jobs thead th', function () {
    const key = this.dataset.field
    if (typeof key !== 'undefined') {
      TWDS.jobSort(null, key)
    }
  })
  $(document).on('click', '.TWDS_joblist_openbutton', function (ev) {
    const id = this.dataset.jobid
    if (!id || !Premium.hasBonus('automation')) { return false }
    Ajax.remoteCall('work', 'get_nearest_job', {
      job_id: id
    }, function (json) {
      if (json.error) { return new UserMessage(json.msg).show() }
      JobWindow.open(id, json.x, json.y)
    })
  })
  $(document).on('click', '.TWDS_joblist_startbutton', function (ev) {
    const id = this.dataset.jobid
    if (!id || !Premium.hasBonus('automation')) { return false }
    Ajax.remoteCall('work', 'get_nearest_job', {
      job_id: id
    }, function (json) {
      if (json.error) { return new UserMessage(json.msg).show() }
      const x = document.querySelector('#TWDS_job_duration')
      JobWindow.startJob(id, json.x, json.y, parseInt(x.value))
    })
  })
  $(document).on('change', '#TWDS_job_duration', function (ev) {
    if (typeof TWDS.jobCurrentList !== 'undefined') {
      const ele = document.querySelector('#TWDS_job_duration')
      TWDS.curJobDuration = parseInt(ele.value)
      window.localStorage.setItem('TWDS_job_duration', TWDS.curJobDuration)

      const t = document.querySelector('#TWDS_jobs')
      const pa = t.parentNode
      pa.removeChild(t)

      TWDS.initJobDisplay(pa, TWDS.jobCurrentList)
    }
  })
  $(document).on('click', '#TWDS_job_filterx', function (ev) {
    document.querySelector('#TWDS_job_filter').value = ''
    $('#TWDS_job_filter').trigger('change')
  })
  $(document).on('change', '#TWDS_job_filter', function (ev) {
    const fi = document.querySelector('#TWDS_job_filter')
    const rows = document.querySelectorAll('#TWDS_jobs tbody tr')
    if (!JobsModel.Jobs.length) { JobsModel.initJobs() }

    const search = fi.value.trim()
    if (search === '') {
      for (const row of Object.values(rows)) {
        row.classList.remove('hidden')
      }
    } else {
      const m = JobsModel.searchJobsByPattern(fi.value)
      for (const row of Object.values(rows)) {
        row.classList.add('hidden')
      }
      for (const found of Object.values(m)) {
        const id = found.id
        const ele = document.querySelector('#TWDS_jobs tbody tr[data-jobid="' + id + '"]')
        ele.classList.remove('hidden')
      }
    }
  })
}
TWDS.registerStartFunc(TWDS.jobStartFunction)
