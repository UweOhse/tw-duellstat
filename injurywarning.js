// vim: tabstop=2 shiftwidth=2 expandtab
//

TWDS.injuryWarningModelFlag = false
TWDS.injuryWarningHandler = function () {
  if (!JobsModel.Jobs.length) { // JobsModel.initialized is not set in every case.
    if (!TWDS.injuryWarningModelFlag) {
      TWDS.injuryWarningModelFlag++
      setTimeout(function () {
        JobsModel.initJobs()
        TWDS.injuryWarningHandler()
      }, 500)
      return
    }
    setTimeout(TWDS.injuryWarningHandler, 1000)
    return
  }
  const container = $('#ui_workcontainer')
  container[0].style.backgroundColor = 'transparent'
  container[0].style.boxShadow = 'none'
  const warnNegative = TWDS.settings.taskqueue_warn_negative
  const warnLow = TWDS.settings.taskqueue_warn_low
  const warnKnockout = TWDS.settings.taskqueue_warn_one_injury_knockout
  const warnSuboptimal = TWDS.settings.taskqueue_warn_suboptimal
  const warnOrange = TWDS.settings.taskqueue_orange_on_warning
  const warnAvg = parseInt(TWDS.settings.taskqueue_warn_avg_injury_knockout)

  let expinj = 0
  const maxHP = Character.maxHealth
  const curHP = Character.health

  let anyWarning = false

  for (let i = 0; i < TaskQueue.queue.length; i++) {
    if (TaskQueue.queue[i].type !== 'job') { // not walking or riding or duelling or ff
      continue
    }
    const jid = TaskQueue.queue[i].data.job.id
    const jp = TaskQueue.queue[i].data.job_points
    const jd = TWDS.jobData['job_' + jid]
    // console.log('JobsModel.g()', JobsModel.getById(jid))
    const malus = JobsModel.getById(jid).jobObj.malus
    const dang = TWDS.TWDBcalcDanger(jp + malus - 1, malus - 1, jd.job_danger, 100, 1)
    const maxdmg = jd.job_maxdmg

    expinj += dang / 100 * maxdmg / 100.0 * maxHP / 4 // assume that the average injury is 25% of the maxinj.

    // console.log('jid', jid, 'dang', dang, 'maxdmg', maxdmg, 'maxinj', maxinj, 'expinj', expinj)

    let flag = 0
    let msg = ''

    if (warnNegative && jp < 0) {
      if (flag === 0) flag = 3
      msg += 'negative job points.\n'
      anyWarning = true
    }
    if (warnLow && jp < malus / 5 && !flag) { // no silver star
      if (flag === 0) flag = 2
      msg = msg + 'low job points.\n'
      anyWarning = true
    }
    if (warnKnockout && maxdmg / 100 * maxHP >= curHP) {
      // 'mark a job in the taskqueue orange if the maximum injury can knock you out.', true,
      if (flag === 0) {
        // some jobs can kill you. undertaker for example. treat them differently.
        if (maxdmg === 100) {
          flag = 1
        } else {
          flag = 2
          anyWarning = true
        }
      }
      msg = msg + 'one accident might knock you out.\n'
    }
    if (warnSuboptimal) {
      const best = TWDS.getJobBestFromCache(jid)
      if (best !== null) {
        const bestnetto = TWDS.joblist.calcNettoJobPoints(jid, best.items)
        if (bestnetto > jp) {
          if (flag === 0) flag = 1
          anyWarning = true
          msg = msg + 'not the best equipment (currently ' + jp + ' points, best has ' + bestnetto + ')\n'
        }
      }
    }
    if (flag > 0) {
      const n = west.gui.Icon.get('exclamation-priority-' + flag, msg)
      $('.task-queuePos-' + i + ' > div.icon', container).children('.TWDS_lp_hint').remove().end().append($('<div class="TWDS_lp_hint" />').toggleClass('tw2gui-iconset tw2gui-icon-star').append(n))
    }
  }
  if (warnOrange && anyWarning) {
    container[0].style.backgroundColor = 'orange'
    container[0].style.boxShadow = '-1px -1px 10px 3px ' + 'orange'
  }
  if (warnAvg) {
    let w = 0
    if (expinj / curHP * 100 >= warnAvg) w++
    if (expinj / curHP * 100 >= 100) w++
    if (w) {
      let c = 'orange'
      if (w === 2) c = 'red'
      container[0].style.backgroundColor = c
      container[0].style.boxShadow = '-1px -1px 10px 3px ' + c
    }
  }
}

TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'taskqueue_warn_negative',
    'mark a job in the taskqueue red if the job points are negative.', true,
    function (v) {
      TWDS.injuryWarningHandler()
    }, 'Task Queue'
  )
  TWDS.registerSetting('bool', 'taskqueue_warn_low',
    'mark a job in the taskqueue yellow if the number of job points is low.', true,
    function (v) {
      TWDS.injuryWarningHandler()
    }, 'Task Queue'
  )
  TWDS.registerSetting('bool', 'taskqueue_warn_one_injury_knockout',
    'mark a job in the taskqueue orange if the maximum injury can knock you out.', true,
    function (v) {
      TWDS.injuryWarningHandler()
    }, 'Task Queue'
  )
  TWDS.registerSetting('bool', 'taskqueue_warn_suboptimal',
    'mark a job in the taskqueue blue if it is done without the full job points.', true,
    function (v) {
      TWDS.injuryWarningHandler()
    }, 'Task Queue'
  )
  TWDS.registerSetting('bool', 'taskqueue_orange_on_warning',
    'Color the task queue orange if one of the above warnings is shown.', true,
    function (v) {
      TWDS.injuryWarningHandler()
    }, 'Task Queue'
  )
  TWDS.registerSetting('int', 'taskqueue_warn_avg_injury_knockout',
    'Color the task queue red if the expected injuries together reach the level of ... percent of the current health. Note that expectations can be wrong. This script expects the average number of injuries with 25% of the maximum damage each.', '50',
    function (v) {
      TWDS.injuryWarningHandler()
    }, 'Task Queue'
  )
  EventHandler.listen(['taskqueue-updated', 'taskqueue-ready'], TWDS.injuryWarningHandler)
})
// vim: tabstop=2 shiftwidth=2 expandtab
