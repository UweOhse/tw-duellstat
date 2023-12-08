// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.jobdebug = 0
TWDS.joblist = {}
TWDS.joblist.calcBruttoJobPoints = function (jobId, items) {
  const job = JobList.getJobById(jobId)
  const bo = TWDS.getComboBonus(items)
  let jp = 0
  for (const [skillName, mult] of Object.entries(job.skills)) {
    const sk = CharacterSkills.getSkill(skillName)
    let v = 0
    if (skillName in bo) {
      v += bo[skillName][0]
      if (TWDS.jobdebug) console.log(skillName, 'wear bonus', bo[skillName][0], '=>', v)
    }
    v += sk.points
    if (TWDS.jobdebug) console.log(skillName, 'char skill', sk.points, '=>', v)
    if (sk.attr_key in bo) {
      v += bo[sk.attr_key][0]
      if (TWDS.jobdebug) console.log(skillName, 'char attr', bo[sk.attr_key][0], '=>', v)
    }
    v *= mult
    jp += v
    if (TWDS.jobdebug) console.log('after', skillName, 'mult', mult, 'v', v, 'jp', jp)
  }
  if ('job_all' in bo) {
    jp += bo.job_all[0]
    if (TWDS.jobdebug) console.log('after', 'job_all', '=', bo.job_all[0], 'jp', jp)
  }
  const t = 'job_' + jobId
  if (t in bo) {
    jp += bo[t][0]
    if (TWDS.jobdebug) console.log('after', t, '=', bo[t][0], 'jp', jp)
  }
  return jp
}
TWDS.joblist.calcNettoJobPoints = function (jobId, items) {
  const job = JobList.getJobById(jobId)
  const jp = TWDS.joblist.calcBruttoJobPoints(jobId, items)
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
TWDS.TWDBcalcProductRate = function (pts, mal, magic, mot, fac) {
  return TWDS.TWDBcalcStepFormula('round', 'round', function (lp, stars) { return stars < 15 ? 6.25 : 9.375 }, pts, mal, magic, 100, fac)
}
TWDS.joblist.initDisplay = function (container, serverdata, isupdate) {
  const charPremium = Number(Premium.hasBonus('character'))
  const moneyPremium = Number(Premium.hasBonus('money'))
  const duration = TWDS.joblist.curJobDuration
  let durationIdx = 0
  if (duration === 600) durationIdx = 1
  if (duration === 3600) durationIdx = 2
  const _ = TWDS._

  let useBest = 0
  if (TWDS.settings.joblist_modecheckbox) {
    useBest = 1
  }

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

  const row = function (tab, jobId, best) {
    const jobdata = JobList.getJobById(jobId)

    let tr
    if (isupdate) {
      tr = TWDS.q1('tr.job' + jobId, tab)
      tr.textContent = ''
    } else {
      tr = document.createElement('tr')
      tr.classList.add('job' + jobId)
      tab.appendChild(tr)
    }
    tr.classList.remove('gold')
    tr.classList.remove('silver')
    if (jobId in golds) {
      tr.classList.add('gold')
    }
    if (jobId in silvers) {
      tr.classList.add('silver')
    }
    tr.dataset.jobid = jobId
    let td
    let bestNetto
    let bestBrutto
    const difficulty = jobdata.malus
    const mot = serverdata.jobs[jobId].motivation * 100
    let curNetto = serverdata.jobs[jobId].workpoints - 1
    let curBrutto = serverdata.jobs[jobId].jobSkillPoints

    if (best !== null) {
      bestNetto = TWDS.joblist.calcNettoJobPoints(jobId, best.items)
      bestBrutto = bestNetto + jobdata.malus + 1
      if (useBest) {
        curNetto = bestNetto
        curBrutto = bestBrutto
      }
    }

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
        let lc = Game.locale.replace('_', '-')
        if (lc === 'en-DK') lc = 'en-GB' // en-dk: 16.52.04, en-GB: 16:52:04
        td.textContent = dt.toLocaleTimeString(lc)
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
      td.title = bestNetto + ' ' + _('JOBLIST_IN_BEST_CLOTHES', '(in best clothes)')
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
      td.title = bestStars + '* ' + _('JOBLIST_IN_BEST_CLOTHES', '(in best clothes)')
    }
    if (curStars < 6) {
      td.classList.add('TWDS_job_negative')
    } else if (best !== null && curStars !== bestStars) {
      td.classList.add('TWDS_job_less')
    }

    td = document.createElement('td')
    tr.appendChild(td)
    td.dataset.field = 'xp'
    if (useBest) {
      let xp3600 = TWDS.TWDBcalcExp(curBrutto, difficulty, TWDS.jobData['job_' + jobId].job_exp, mot, 1)
      const xp600 = Math.ceil(xp3600 * 0.47)
      const xp15 = Math.ceil(xp3600 / 10)
      if (Character.charClass === 'worker') {
        if (charPremium) { xp3600 *= 1.1 } else { xp3600 *= 1.05 }
      }
      td.textContent = Math.round(duration === 3600 ? xp3600 : (duration === 15 ? xp15 : xp600))
      td.title = '$' + xp15 + '/' + xp600 + '/' + xp3600 +
          ' ' + _('JOBLIST_15101', ' (15s/10m/1h)')
    } else {
      td.textContent = serverdata.jobs[jobId].durations[durationIdx].xp
      td.title = serverdata.jobs[jobId].durations[0].xp + '/' +
        serverdata.jobs[jobId].durations[1].xp + '/' +
        serverdata.jobs[jobId].durations[2].xp +
          ' ' + _('JOBLIST_XP', 'experience points') +
          ' ' + _('JOBLIST_15101', ' (15s/10m/1h)')
    }

    td = document.createElement('td')
    tr.appendChild(td)
    td.dataset.field = 'money'
    if (useBest) {
      let wage3600 = TWDS.TWDBcalcWage(curBrutto, difficulty, TWDS.jobData['job_' + jobId].job_wages, mot, 1)
      if (moneyPremium) wage3600 *= 1.5
      const wage15 = Math.ceil(wage3600 / 10)
      const wage600 = Math.ceil(wage3600 * 0.471) // Uh. magic constant.
      td.textContent = Math.round(duration === 3600 ? wage3600 : (duration === 15 ? wage15 : wage600))
      td.title = '$' + wage15 + '/' + wage600 + '/' + wage3600 +
          ' ' + _('JOBLIST_15101', ' (15s/10m/1h)')
    } else {
      td.textContent = serverdata.jobs[jobId].durations[durationIdx].money
      td.title = '$' + serverdata.jobs[jobId].durations[0].money + '/' +
        serverdata.jobs[jobId].durations[1].money + '/' +
        serverdata.jobs[jobId].durations[2].money +
          ' ' + _('JOBLIST_15101', ' (15s/10m/1h)')
    }

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
      td.title += '<br>' + Math.round(luck2) + ' -' + Math.round(luck2 * 3) +
        +' ' + _('JOBLIST_IN_BEST_CLOTHES', '(in best clothes)')
    }
    td.title += '<br>' + serverdata.jobs[jobId].durations[0].luck + '/' +
      serverdata.jobs[jobId].durations[1].luck + '/' +
      serverdata.jobs[jobId].durations[2].luck +
        '' + _('JOBLIST_LUCK_MOD', ' luck modification in 15s/10m/1h')

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
    td.title = dang + '% ' + _('JOBLIST_INJURY_CHANCE', 'chance of injury')
    if (best !== null) {
      let dang2 = TWDS.TWDBcalcDanger(bestBrutto, difficulty, TWDS.jobData['job_' + jobId].job_danger, mot, 1)
      if (Character.charClass === 'adventurer') {
        if (charPremium) dang2 *= 0.8
        else dang2 *= 0.9
      }
      dang2 = Math.round(dang2 * 10) / 10
      td.title += '<br>' + dang2 + '% ' + _('JOBLIST_INJURY_CHANCE_IBC', 'chance of injury in best clothes')
    }
    const mh = Character.getMaxHealth()
    const maxInj = Math.round((TWDS.jobData['job_' + jobId].job_maxdmg) / 100 * mh)
    const h = Character.health
    td.title += '<br>'
    td.title += _('JOBLIST_INJURY_COST',
      'An injury costs up to $maxhp$ health points ($percent$% of max. health).',
      { maxhp: maxInj, percent: TWDS.jobData['job_' + jobId].job_maxdmg })
    // td.title += _("JOBLIST_INJURY_COST",'An injury costs up to ' + maxInj + ' health points (' + TWDS.jobData['job_' + jobId].job_maxdmg + '% of max. health).'

    const worstJobs = parseInt((h + 1) / maxInj)
    td.title += '<br>' + _('JOBLIST_MIGHT_LAST', 'You might last $worst$ jobs in the worst case.',
      { worst: worstJobs })

    td = document.createElement('td')
    tr.appendChild(td)

    td.innerHTML += MinimapWindow.getQuicklink(jobdata.name, 'task-finish-job')
    const b = TWDS.jobOpenButton(jobId)
    if (b != null) {
      td.innerHTML += b.outerHTML
    }
    if (Premium.hasBonus('automation')) {
      const but = document.createElement('button')
      but.textContent = '>>'
      but.classList.add('TWDS_joblist_startbutton')
      but.dataset.jobid = jobId
      but.title = _('JOBLIST_START_NEAREST', 'Start the job at the nearest possible position')
      td.appendChild(but)
    }
    td = document.createElement('td')
    TWDS.createEle({
      nodeName: 'input',
      type: 'checkbox',
      value: jobId,
      checked: !!TWDS.settings['BJHL_' + jobId],
      last: td,
      onchange: function () {
        console.log('change', this, this.checked)
        const v = this.value
        if (this.checked) {
          TWDS.settings['BJHL_' + v] = true
        } else {
          delete TWDS.settings['BJHL_' + v]
        }
        TWDS.saveSettings()
      }
    })
    tr.appendChild(td)
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
    th.title = TWDS._('JOBLIST_DATE_TITLE', "The date the 'best' clothes were calculated.")

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
    th.title = TWDS._('JOBLIST_XP_TITLE', 'Experience points')

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'money'
    th.textContent = TWDS._('JOBLIST_MONEY', 'money')

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'luck'
    // th.textContent = TWDS._('JOBLIST_LUCK', 'luck')
    th.innerHTML = '&#9752;'
    th.title = TWDS._('JOBLIST_LUCK_TITLE', 'The maximum value of the items you can find.')

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'motivation'
    th.textContent = TWDS._('JOBLIST_MOTIVATION', 'Mot.')
    th.title = TWDS._('JOBLIST_MOTIVATION_TITLE', 'Current motivation for this job')

    th = document.createElement('th')
    tr.appendChild(th)
    th.dataset.field = 'danger'
    // th.textContent = TWDS._('JOBLIST_DANGER', 'Danger')
    th.innerHTML = '&#9829;'
    th.title = TWDS._('JOBLIST_DANGER_TITLE', 'The chance to have an accident.')

    th = document.createElement('th')
    tr.appendChild(th)
    th = document.createElement('th')
    th.textContent = 'Mark'
    th.title = TWDS._('JOBLIST_HIGHLIGHT_TITLE', 'Mark known bonus jobs on the minimap')
    tr.appendChild(th)
  }

  const jl = JobList.getSortedJobs()
  let tab = null
  let tbody
  if (isupdate) {
    tab = TWDS.q1('#TWDS_jobs')
    if (tab) { tbody = TWDS.q1('tbody', tab) }
  }
  if (!tab) {
    isupdate = false
    tab = document.createElement('table')
    container.appendChild(tab)
    tab.id = 'TWDS_jobs'
    headrow(tab)
    tbody = document.createElement('tbody')
    tab.appendChild(tbody)
  }
  for (const job of jl) {
    const best = TWDS.getJobBestFromCache(job.id)
    row(tbody, job.id, best)
  }
}

TWDS.joblist.sort = function (tab, key) {
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
    tab.dataset.cursort = '-' + key
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
TWDS.joblist.getcurrentdata = function (cb) {
  Ajax.remoteCallMode('work', 'index', {}, function (x) {
    TWDS.joblist.currentList = x
    if (cb) cb(x)
  })
}

TWDS.joblist.curJobDuration = 15
TWDS.joblist.getcontent = function () {
  const _ = TWDS._
  const x = window.localStorage.getItem('TWDS_job_duration')
  if (x !== null) { TWDS.joblist.curJobDuration = parseInt(x) }

  const div = document.createElement('div')
  div.id = 'TWDS_joblist_container'
  const p = document.createElement('p')
  div.appendChild(p)

  const fig = document.createElement('span')
  p.appendChild(fig)
  fig.id = 'TWDS_job_filtergroup'

  const modearea = document.createElement('span')
  p.appendChild(modearea)
  modearea.id = 'TWDS_job_modearea'

  const modecheckbox = document.createElement('input')
  modearea.appendChild(modecheckbox)
  modecheckbox.id = 'TWDS_job_modecheckbox'
  modecheckbox.type = 'checkbox'
  if (TWDS.settings.joblist_modecheckbox) {
    modecheckbox.checked = true
  }

  const modetext = document.createElement('span')
  modearea.appendChild(modetext)
  modetext.textContent = _('JOBLIST_ASSUME_BEST', 'assume best clothes')
  modetext.title = _('JOBLIST_ASSUME_BEST_TITLE', 'otherwise the current equipment is used')
  const sig = document.createElement('span')
  p.appendChild(sig)
  sig.id = 'TWDS_job_searchgroup'

  const input = document.createElement('input')
  sig.appendChild(input)
  input.id = 'TWDS_job_search'
  input.placeholder = _('SEARCH', 'search')
  input.type = 'search'

  const button = document.createElement('button')
  sig.appendChild(button)
  button.id = 'TWDS_job_searchx'
  button.textContent = 'x'

  const sel = document.createElement('select')
  p.appendChild(sel)
  sel.id = 'TWDS_job_duration'

  let opt = document.createElement('option')
  sel.appendChild(opt)
  opt.setAttribute('value', 15)
  opt.textContent = '15s'
  if (TWDS.joblist.curJobDuration === 15) opt.setAttribute('selected', 'selected')

  opt = document.createElement('option')
  sel.appendChild(opt)
  opt.setAttribute('value', 600)
  opt.textContent = '10m'
  if (TWDS.joblist.curJobDuration === 600) opt.setAttribute('selected', 'selected')

  opt = document.createElement('option')
  sel.appendChild(opt)
  opt.setAttribute('value', 3600)
  opt.textContent = '1h'
  if (TWDS.joblist.curJobDuration === 3600) opt.setAttribute('selected', 'selected')

  TWDS.joblist.getcurrentdata(function (x) {
    TWDS.joblist.initDisplay(div, x, false)
    fig.appendChild(TWDS.joblist.addFilters())
    TWDS.joblist.refilter(div)
    const oldsort = window.localStorage.getItem('TWDS_job_cursort')
    if (oldsort !== null) {
      const tab = document.querySelector('#TWDS_jobs')
      const key = window.localStorage.getItem('TWDS_job_cursort')
      if (key !== null) {
        if (key[0] === '-') {
          TWDS.joblist.sort(tab, key.substring(1))
          TWDS.joblist.sort(tab, key.substring(1))
        } else {
          TWDS.joblist.sort(tab, key)
        }
      }
    }
  })

  return div
}
TWDS.joblist.refilter = function (main) {
  if (typeof main === 'undefined') { main = document }
  const tab = main.querySelector('#TWDS_jobs')
  const rowColl = tab.querySelectorAll('tbody tr')
  for (let i = 0; i < rowColl.length; i++) {
    const tr = rowColl[i]
    tr.classList.remove('hidden')
  }

  const container = main.querySelector('#TWDS_joblist_filter_container')
  const opsels = container.querySelectorAll('.TWDS_joblist_filter_op')
  for (let opidx = 0; opidx < opsels.length; opidx++) {
    const opsel = opsels[opidx]
    const key = opsel.dataset.key
    const valsel = opsel.parentNode.querySelector('.TWDS_joblist_filter_val')
    const op = opsel.value
    let cmpVal = valsel.value
    if (op === '' || cmpVal === '') continue
    cmpVal = parseInt(cmpVal)
    for (let i = 0; i < rowColl.length; i++) {
      const tr = rowColl[i]
      const td = tr.querySelector('[data-field=' + key + ']')
      let v
      if ('sortval' in td.dataset) {
        v = parseFloat(td.dataset.sortval)
      } else {
        v = parseFloat(td.textContent)
      }
      let good = false
      if (op === 'gte') {
        if (v >= cmpVal) good = true
      }
      if (op === 'gt') {
        if (v > cmpVal) good = true
      }
      if (op === 'eq') {
        if (v === cmpVal) good = true
      }
      if (op === 'lt') {
        if (v < cmpVal) good = true
      }
      if (op === 'lte') {
        if (v <= cmpVal) good = true
      }
      if (!good) { tr.classList.add('hidden') }
    }
  }
}
TWDS.joblist.addFilters = function () {
  const tab = document.querySelector('#TWDS_jobs')
  const minmax = function (tab, key) {
    let min = 9999999
    let max = -9999999
    const rowColl = tab.querySelectorAll('tbody tr')
    for (let i = 0; i < rowColl.length; i++) {
      const row = rowColl[i]
      const td = row.querySelector('[data-field=' + key + ']')
      let v
      if ('sortval' in td.dataset) {
        v = parseFloat(td.dataset.sortval)
      } else {
        v = parseFloat(td.textContent)
      }
      if (v > max) max = v
      if (v < min) min = v
    }
    return [min, max]
  }
  const keys = [
    ['lp', 'lp'],
    ['xp', 'xp'],
    ['money', '$'],
    ['luck', 'luck'],
    ['motivation', 'motiv.'],
    ['danger', 'danger']
  ]
  const container = TWDS.createElement({
    nodeName: 'div',
    id: 'TWDS_joblist_filter_container'
  })
  const _ = TWDS._
  for (const key of keys) {
    const opkey = 'obtab_filter_op_' + key[0]
    const valkey = 'obtab_filter_value_' + key[0]
    const mm = minmax(tab, key[0])
    const curop = TWDS.settings[opkey] || 'gte'
    const curval = TWDS.settings[valkey] || 0

    const fs = TWDS.createElement({
      nodeName: 'fieldset',
      childNodes: [
        {
          nodeName: 'legend',
          textContent: _('JOBLIST_LEGEND_' + key[1], key[1])
        },
        {
          nodeName: 'select',
          className: 'TWDS_joblist_filter_op',
          dataset: { key: key[0] },
          childNodes: [
            {
              nodeName: 'option',
              selected: curop === 'gte',
              value: 'gte',
              textContent: '>='
            },
            {
              nodeName: 'option',
              selected: curop === 'gt',
              value: 'gt',
              textContent: '>'
            },
            {
              nodeName: 'option',
              selected: curop === 'eq',
              value: 'eq',
              textContent: '='
            },
            {
              nodeName: 'option',
              selected: curop === 'lt',
              value: 'lt',
              textContent: '<'
            },
            {
              nodeName: 'option',
              selected: curop === 'lte',
              value: 'lte',
              textContent: '<='
            }
          ]
        },
        {
          nodeName: 'input',
          type: 'number',
          className: 'TWDS_joblist_filter_val',
          dataset: { key: key[0] },
          value: curval,
          min: mm[0],
          max: mm[1]
        }
      ]
    })
    container.appendChild(fs)
  }
  return container
}

TWDS.joblist.startFunction = function () {
  $(document).on('click', '#TWDS_jobs thead th', function () {
    const key = this.dataset.field
    if (typeof key !== 'undefined') {
      const tab = document.querySelector('#TWDS_jobs')
      TWDS.joblist.sort(tab, key)
      window.localStorage.setItem('TWDS_job_cursort', tab.dataset.cursort)
    }
  })
  $(document).on('click', '.TWDS_joblist_openbutton', function (ev) {
    const id = this.dataset.job_id
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
    if (typeof TWDS.joblist.currentList !== 'undefined') {
      const ele = document.querySelector('#TWDS_job_duration')
      TWDS.joblist.curJobDuration = parseInt(ele.value)
      window.localStorage.setItem('TWDS_job_duration', TWDS.joblist.curJobDuration)

      const t = document.querySelector('#TWDS_jobs')
      const pa = t.parentNode

      TWDS.joblist.initDisplay(pa, TWDS.joblist.currentList, true)
    }
  })
  $(document).on('click', '#TWDS_job_filter', function (ev) {
    TWDS.joblist.handleFilter()
  })
  $(document).on('change', '.TWDS_joblist_filter_op', function (ev) {
    const key = this.dataset.key
    const opkey = 'obtab_filter_op_' + key
    TWDS.settings[opkey] = this.value
    TWDS.saveSettings()
    TWDS.joblist.refilter()
  })
  $(document).on('change', '.TWDS_joblist_filter_val', function (ev) {
    const key = this.dataset.key
    const valkey = 'obtab_filter_value_' + key
    TWDS.settings[valkey] = this.value
    TWDS.saveSettings()
    TWDS.joblist.refilter()
  })
  $(document).on('click', '#TWDS_job_searchx', function (ev) {
    document.querySelector('#TWDS_job_search').value = ''
    $('#TWDS_job_search').trigger('change')
  })
  $(document).on('change', '#TWDS_job_modecheckbox', function (ev) {
    const valkey = 'joblist_modecheckbox'
    TWDS.settings[valkey] = this.checked
    TWDS.saveSettings()
    const pa = document.querySelector('#TWDS_joblist_container').parentNode
    pa.innerHTML = ''
    pa.appendChild(TWDS.joblist.getcontent())
    // TWDS.joblist.refilter()
  })
  $(document).on('change', '#TWDS_job_search', function (ev) {
    const fi = document.querySelector('#TWDS_job_search')
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
  window.EventHandler.listen(['wear_changed'], TWDS.joblist.wearchangehandler)
}
TWDS.joblist.wearchangehandler = function () { TWDS.joblist.wearchangehandlerOverloadFix() }
TWDS.joblist.wearchange_timestamp = 0
TWDS.joblist.wearchange_timeout = -1

TWDS.joblist.wearchangehandlerOverloadFix = function () {
  TWDS.joblist.wearchange_timestamp = (new Date()).getTime()
  if (TWDS.joblist.wearchange_timeout > -1) {
    window.clearTimeout(TWDS.joblist.wearchange_timeout)
    TWDS.joblist.wearchange_timeout = -1
  }
  TWDS.joblist.wearchange_timeout = window.setTimeout(function () {
    TWDS.joblist.wearchange_timeout = -1
    TWDS.joblist.wearchangehandlerReal()
  }, 1000)
}
TWDS.joblist.wearchangehandlerReal = function () {
  const wid = 'TWDS_joblist_window'
  if (wman.isWindowCreated(wid)) {
    TWDS.joblist.getcurrentdata(function () {
      const t = document.querySelector('#TWDS_jobs')
      if (t) {
        const pa = t.parentNode
        TWDS.joblist.initDisplay(pa, TWDS.joblist.currentList, true)
      }
    })
  }
}
TWDS.joblist.openwindow = function () {
  const wid = 'TWDS_joblist_window'
  const win = wman.open(wid, 'set', 'TWDS_joblist')
  win.setTitle(TWDS._('JOBLIST_WINDOW_TITLE', 'Job list'))
  win.setMiniTitle(TWDS._('JOBLIST_MINITITLE', 'Joblist'))
  const sp = new west.gui.Scrollpane()
  const content = TWDS.joblist.getcontent(win)
  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}

TWDS.registerExtra('TWDS.joblist.openwindow',
  TWDS._('JOBLIST_TITLE', 'Joblist'),
  TWDS._('JOBLIST_DESC', 'List of jobs')
)
TWDS.registerStartFunc(TWDS.joblist.startFunction)
