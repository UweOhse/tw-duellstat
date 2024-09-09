// vim: tabstop=2 shiftwidth=2 expandtab
//

TWDS.taskqueue = {}
TWDS.taskqueue.injuryWarningModelFlag = false
TWDS.taskqueue.injuryWarningHandler = function () {
  if (!JobsModel.Jobs.length) { // JobsModel.initialized is not set in every case.
    if (!TWDS.taskqueue.injuryWarningModelFlag) {
      TWDS.taskqueue.injuryWarningModelFlag++
      setTimeout(function () {
        JobsModel.initJobs()
        TWDS.taskqueue.injuryWarningHandler()
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

TWDS.taskqueue.myfavicon = -1 // will be null or an element later
TWDS.taskqueue.oldfavicon = null // will be an element later
TWDS.taskqueue.canvas = null // will be an element later
TWDS.taskqueue.faviconhandler = function () {
  if (TWDS.taskqueue.myfavicon === -1) { // unknown, in case of a reload.
    TWDS.taskqueue.myfavicon = TWDS.q1('#TWDS_shortcuticon')
    if (TWDS.taskqueue.oldfavicon === null) {
      let old = TWDS.q1('link.TWDS_faviconbackup')
      if (!old) {
        old = TWDS.q1("link[rel='shortcut icon']")
      }
      TWDS.taskqueue.oldfavicon = old
    }
  }

  const old = TWDS.taskqueue.oldfavicon
  if (!old) return // not in TW?

  if (!TWDS.settings.taskqueue_length_in_favicon && !TWDS.settings.taskqueue_length0_in_favicon) {
    if (TWDS.taskqueue.myfavicon !== null) { // was active
      old.rel = 'shortcut icon'
      old.classList.remove('TWDS_faviconbackup')
      const my = TWDS.taskqueue.myfavicon
      if (my) { my.remove() }
      TWDS.taskqueue.myfavicon = null // set to inactive
    }
    return
  }

  if (old.rel === 'shortcut icon') { // feature just turned on
    old.rel = 'TWDS_disabled'
    old.classList.add('.TWDS_faviconbackup')
  }

  const drawicon = function (num) {
    if (!TWDS.taskqueue.canvas) {
      TWDS.taskqueue.canvas = document.createElement('canvas')
      TWDS.taskqueue.canvas.height = 16
      TWDS.taskqueue.canvas.width = 16 // set the size
    }
    const ctx = TWDS.taskqueue.canvas.getContext('2d')
    const img = document.createElement('img')
    img.onload = function () { // once the image has loaded
      ctx.drawImage(this, 0, 0)
      if (num !== '') {
        if (num === 'S') {
          ctx.fillStyle = '#ff4444'
          ctx.font = '19px sans-serif'
        } else if (num === 0) {
          ctx.fillStyle = '#ff8888'
          ctx.font = '19px sans-serif'
        } else if (num === 1) {
          ctx.fillStyle = '#ffff00'
          ctx.font = '17px sans-serif'
          const dd = TaskQueue.queue[0].data.done
          if (dd < new Date().getTime() + 15 * 1000) {
            ctx.fillStyle = '#ffa500' // orange
          }
        } else {
          ctx.fillStyle = '#ffffff'
          ctx.font = '15px sans-serif'
        }
        ctx.font = '18px sans-serif'
        const tm = ctx.measureText(num)
        ctx.fillText(num, 8 - tm.width / 2, 15)
      }

      if (TWDS.settings.taskqueue_show_health_in_favicon && Character.health < TWDS.settings.taskqueue_show_health_in_favicon) {
        ctx.beginPath()
        ctx.strokeStyle = '#3f0'
        const h = Character.health / Character.maxHealth * 16
        ctx.moveTo(0, 16 - h)
        ctx.lineTo(0, 15)
        ctx.moveTo(1, 16 - h)
        ctx.lineTo(1, 15)
        ctx.stroke()

        ctx.beginPath() // Start a new path
        ctx.strokeStyle = '#f00'
        ctx.moveTo(0, 0)
        ctx.lineTo(0, 16 - h)
        ctx.moveTo(1, 0)
        ctx.lineTo(1, 16 - h)
        ctx.stroke()
      }

      const du = TWDS.taskqueue.canvas.toDataURL('image/png')

      if (TWDS.taskqueue.myfavicon) { TWDS.taskqueue.myfavicon.remove() }
      TWDS.taskqueue.myfavicon = TWDS.createEle('link', {
        last: document.head,
        id: 'TWDS_shortcuticon',
        rel: 'shortcut icon',
        href: du
      })
    }
    img.src = old.href
    if (img.complete) {
      img.onload()
    }
  }
  let did = 0
  if (TWDS.settings.taskqueue_sleep_in_favicon && TaskQueue.queue.length === 1) {
    if (TaskQueue.queue[0].type === 'sleep' || TaskQueue.queue[0].type === 'fortsleep') {
      drawicon('S')
      did = 1
    }
  }
  if (TWDS.settings.taskqueue_length_in_favicon && TaskQueue.queue.length && !did) {
    drawicon(TaskQueue.queue.length)
    did = 1
  }
  if (TWDS.settings.taskqueue_length0_in_favicon && !TaskQueue.queue.length && !did) {
    drawicon(TaskQueue.queue.length)
    did = 1
  }
  if (!did && TWDS.settings.taskqueue_show_health_in_favicon) {
    drawicon('')
  }
}

TWDS.taskqueue.eventhandler = function () {
  TWDS.taskqueue.injuryWarningHandler()
  TWDS.taskqueue.faviconhandler()
}

TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'taskqueue_warn_negative',
    'mark a job in the taskqueue red if the job points are negative.', true,
    function (v) {
      TWDS.taskqueue.eventhandler()
    }, 'Task Queue', 'a', 0
  )
  TWDS.registerSetting('bool', 'taskqueue_warn_low',
    'mark a job in the taskqueue yellow if the number of job points is low.', true,
    function (v) {
      TWDS.taskqueue.eventhandler()
    }, 'Task Queue', 'a', 1
  )
  TWDS.registerSetting('bool', 'taskqueue_warn_one_injury_knockout',
    'mark a job in the taskqueue orange if the maximum injury can knock you out.', true,
    function (v) {
      TWDS.taskqueue.eventhandler()
    }, 'Task Queue', 'a', 2
  )
  TWDS.registerSetting('bool', 'taskqueue_warn_suboptimal',
    'mark a job in the taskqueue blue if it is done without the full job points.', true,
    function (v) {
      TWDS.taskqueue.eventhandler()
    }, 'Task Queue', 'a', 3
  )
  TWDS.registerSetting('int', 'taskqueue_warn_avg_injury_knockout',
    'Color the task queue red if the expected injuries together reach the level of ... percent of the current health. Note that expectations can be wrong. This script expects the average number of injuries with 25% of the maximum damage each.', '50',
    function (v) {
      TWDS.taskqueue.eventhandler()
    }, 'Task Queue', 'a', 4
  )
  TWDS.registerSetting('bool', 'taskqueue_orange_on_warning',
    'Color the task queue orange if one of the above warnings is shown.', true,
    function (v) {
      TWDS.taskqueue.eventhandler()
    }, 'Task Queue', 'a', 5
  )
  TWDS.registerSetting('bool', 'taskqueue_length_in_favicon',
    'Put the number of task queue elements into the favicon.', false,
    function (v) {
      TWDS.taskqueue.eventhandler()
    }, 'Task Queue', 'c', 1
  )
  TWDS.registerSetting('bool', 'taskqueue_length0_in_favicon',
    'Show a red zero in the favicon if the task queue is empty.', false,
    function (v) {
      TWDS.taskqueue.eventhandler()
    }, 'Task Queue', 'c', 2
  )
  TWDS.registerSetting('bool', 'taskqueue_sleep_in_favicon',
    'Show a red S in the favicon if the toon sleep.', false,
    function (v) {
      TWDS.taskqueue.eventhandler()
    }, 'Task Queue', 'c', 3
  )
  TWDS.registerSetting('int', 'taskqueue_show_health_in_favicon',
    'Show a green/red health bar on the left hand side of the favicon if your health is below....', 0,
    function (v) {
      TWDS.taskqueue.eventhandler()
    }, 'Task Queue', 'c', 4
  )
  EventHandler.listen(['taskqueue-updated', 'taskqueue-ready', 'energy', 'health'], TWDS.taskqueue.eventhandler)
})
// vim: tabstop=2 shiftwidth=2 expandtab
