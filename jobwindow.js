// vim: tabstop=2 shiftwidth=2 expandtab
//
$(document).on('click', '.TWDS_wearset', function () {
  const key = this.dataset.setkey
  const tmp = window.localStorage.getItem(key)
  if (tmp) {
    const o = JSON.parse(tmp)
    if (Premium.hasBonus('automation')) {
      Wear.open()
      for (const i in o.item_ids) {
        const ii = o.item_ids[i]
        const b = Bag.getItemByItemId(Number(ii))
        if (b) {
          Wear.carry(b)
        }
      }
    } else {
      if (!wman.getById(Inventory.uid)) {
        Inventory.open()
      }
      Wear.open()
      const items = Bag.getItemsByItemIds(o.item_ids)
      Inventory.showSearchResult(items)
    }
    return
  }
  Ajax.remoteCallMode('inventory', 'show_equip', {}, function (data) {
    const eql = data.data
    for (const eq of Object.values(eql)) {
      if (eq.name === key) {
        window.EquipManager.switchEquip(eq.equip_manager_id)
      }
    }
  })
})
TWDS.jobwindow = {}

TWDS.jobwindow.initView = function () {
  this._TWDS_backup_initView()
  const d = this.window.divMain
  const old = TWDS.q1('.TWDS_jobwindow_setbuttons', d)
  if (old) {
    old.remove()
  }
  let haveone = false
  for (let i = 0; i < 10; i++) {
    const idx = 'jobwindow_set' + i
    if (TWDS.settings[idx] > '') {
      haveone = true
    }
  }
  if (haveone) {
    const p = TWDS.q1('.job_premium_button', d)
    if (p) {
      p.style.display = 'none'
      const ct = TWDS.createEle({
        nodeName: 'div',
        className: 'TWDS_jobwindow_setbuttons'
      })
      p.parentNode.insertBefore(ct, p)
      for (let i = 0; i < 10; i++) {
        const idx = 'jobwindow_set' + i
        if (TWDS.settings[idx] > '') {
          const b = TWDS.createElement({
            nodeName: 'button',
            className: 'TWDS_button TWDS_wearset',
            textContent: TWDS.settings[idx],
            dataset: {
              setkey: TWDS.settings[idx]
            },
            title: 'Wear this set'
          })
          ct.appendChild(b)
        }
      }
    }
  } else {
    const p = TWDS.q1('.job_premium_button', d)
    if (p) {
      p.style.display = 'block'
    }
  }
  if (TWDS.settings.jobwindow_show_jobpoints) {
    const progressthing = d.querySelector('.job_progress_jobstars')
    const m = TWDS.createElement({
      nodeName: 'span',
      className: 'TWDS_jobpoints_display',
      title: 'Shows the job points'
    })
    m.style.display = 'block'
    m.style.position = 'absolute'
    m.style.width = '5em'
    m.style.height = '16px'
    m.style.textAlign = 'center'
    m.style.bottom = '7px'
    m.style.backgroundColor = '#deb88780'
    m.style.border = '1px solid #deb887'
    m.style.visibility = 'visible'
    m.style.left = 'calc( ( 285px - 5em ) / 2 )'
    if (progressthing) { progressthing.appendChild(m) }
  }
  if (TWDS.settings.jobwindow_show_maxdmg) {
    const id = this.jobId
    const x = TWDS.jobData['job_' + id]
    if (d && x && x.job_maxdmg) {
      const mh = Character.maxHealth
      const h = Character.health
      const m = TWDS.createElement({
        nodeName: 'meter',
        min: 0,
        optimum: 0,
        low: h / mh * 100 / 4,
        high: h / mh * 100,
        max: 100,
        value: x.job_maxdmg,
        className: 'TWDS_maxdmg_meter'
      })
      m.style.display = 'block'
      m.style.position = 'absolute'
      m.style.width = '100px'
      m.style.transform = 'translate(-75px, 42px) rotate(270deg)'
      m.title = 'an injury costs up to ' + x.job_maxdmg + '% of your maximum health.'
      const dan = d.querySelector('.cprog_danger')
      if (dan) {
        dan.appendChild(m)
      }
      const m2 = TWDS.createElement({
        nodeName: 'meter',
        min: 0,
        optimum: 0,
        max: Character.health / Character.maxHealth * 100,
        className: 'TWDS_9jobdanger_meter',
        title: 'Expected injury level relative to your current health for 9 jobs.'
      })
      m2.style.display = 'block'
      m2.style.width = '100px'
      m2.style.position = 'absolute'
      m2.style.transform = 'translate(-65px, 42px) rotate(270deg)'
      if (dan) {
        dan.appendChild(m2)
      }
    }
  }
  if (TWDS.settings.jobwindow_show_motivation) {
    const d = this.window.divMain
    const m = TWDS.createElement({
      nodeName: 'meter',
      min: 0,
      max: 25,
      value: this.jobmotivation,
      className: 'TWDS_jobmotivation_meter'
    })
    m.style.display = 'block'
    m.style.width = '100px'
    m.style.transform = 'translate(65px, 42px) rotate(270deg)'
    const par = d.querySelector('.tprog_jobmotivation')
    if (par) {
      par.appendChild(m)
    }
    const s = TWDS.createElement({
      nodeName: 'span',
      className: 'TWDS_jobmotivation_info'
    })
    s.style.display = 'inline-block'
    s.style.position = 'absolute'
    s.style.width = '24px'
    s.style.height = '16px'
    s.style.top = '45px'
    s.style.left = '41px'
    s.style.backgroundColor = 'wheat'
    s.style.fontSize = '125%'
    s.style.borderRadius = '4px'
    s.style.border = '1px solid gold'
    s.style.textAlign = 'center'
    if (par) {
      par.appendChild(s)
    }
  }
  TWDS.jobwindow.updateMotivationMeter(this)
}
TWDS.jobwindow.updateMotivationMeter = function (o) {
  const mot = o.jobmotivation
  const jpdisplay = $('.TWDS_jobpoints_display', o.DOM)
  const dangermeter = $('.TWDS_maxdmg_meter', o.DOM)
  let jp = 0
  let malus = 0
  if ('job_points' in o) {
    jp = o.job_points
    malus = o.job.malus
  } else if ('job' in o && o.job && 'workpoints' in o.job) {
    jp = o.job.jobpoints - o.job.workpoints
    malus = o.job.jobObj.malus
  }
  if (jpdisplay.length) {
    jpdisplay[0].textContent = jp
    jpdisplay[0].title = 'With the current equipment you have ' + jp + ' job points. The work has a difficulty of ' + malus
  }
  if (dangermeter.length) {
    const mh = Character.maxHealth
    const h = Character.health
    dangermeter[0].low = h / mh * 100 / 4
    dangermeter[0].high = h / mh * 100
  }
  const combined = $('.TWDS_9jobdanger_meter', o.DOM)
  if (combined.length) {
    const id = o.jobId
    const x = TWDS.jobData['job_' + id]
    const danger = x.job_danger
    const dang = TWDS.TWDBcalcDanger(jp + malus - 1, malus - 1, danger, mot, 1)
    // assume an injury in average is 25% of maxdmg
    let p = x.job_maxdmg * 9 / 4.0 * dang / 100
    combined[0].value = p
    let max = x.job_maxdmg * 9
    p = Math.round(p)
    max = Math.round(max)
    const hx = Math.round(p / 100 * Character.maxHealth)
    combined[0].title = 'For 9 jobs expect a damage of ' + p +
        '% (' + hx + ') of your maximum HP. If murphy hates you, you might lose ' + max + '%.'
  }
  const info = $('.TWDS_jobmotivation_info', o.DOM)
  if (info.length) { info[0].textContent = mot }
  const met = $('.TWDS_jobmotivation_meter', o.DOM)
  if (met.length) {
    met.value = mot
    // that oh so good designed <meter> element doesn't allow me to change the colors
    // without a lot of browser dependend overhead (meter::--webkit-meter-...).
    //
    // Logic: 0..25 are shown.
    // 76 is shown as 0, 100 as 25
    // 51 is shown as 0, 75 as 25
    // 26 is shown as 0, 50 as 25
    //  1 is shown as 0, 25 as 25
    //  0..
    let t = mot % 25
    t -= 1
    if (t < 0) t = 25
    met[0].value = t
    met[0].min = 0
    met[0].max = 25
  }
}
TWDS.jobwindow.updateMotivation = function (jobdata) {
  JobWindow.prototype._TWDS_backup_updateMotivation.apply(this, arguments)
  TWDS.jobwindow.updateMotivationMeter(this)
}
TWDS.registerSetting('bool', 'jobwindow_show_maxdmg',
  'Show the maximum damage in the job window', true, null, 'Jobwindow')
TWDS.registerSetting('bool', 'jobwindow_show_motivation',
  'Show the exact current motivation in the job window', true, null, 'Jobwindow')
TWDS.registerSetting('bool', 'jobwindow_show_jobpoints',
  'Show the job points in the job window', true, null, 'Jobwindow')

TWDS.registerStartFunc(function () {
  TWDS.registerSetting('info', 'AAAAA',
    'The names of set to offer in place of the higher income button. This only works if you have the Higher Income premium, and if the names are those of ingame or tw-duellstat sets.',
    '', null, 'Jobwindow', 'Setnames')

  for (let i = 0; i < 10; i++) {
    TWDS.registerSetting('string', 'jobwindow_set' + i, 'Set #' + (i + 1), '', null, 'Jobwindow', 'Setnames')
  }
  JobWindow.prototype._TWDS_backup_initView = JobWindow.prototype.initView
  JobWindow.prototype.initView = TWDS.jobwindow.initView
  JobWindow.prototype._TWDS_backup_updateMotivation = JobWindow.prototype.updateMotivation
  JobWindow.prototype.updateMotivation = TWDS.jobwindow.updateMotivation
})
if (JobWindow.prototype._TWDS_backup_initView) {
  // helper for the reload
  JobWindow.prototype.initView = TWDS.jobwindow.initView
  JobWindow.prototype.updateMotivation = TWDS.jobwindow.updateMotivation
}

// vim: tabstop=2 shiftwidth=2 expandtab
