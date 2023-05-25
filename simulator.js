// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.simulator = {}
TWDS.simulator.fillselectarea = function (area, slot, cur) {
  const all = ItemManager.getAll()
  area.innerHTML = ''
  const select = TWDS.createEle('select', { last: area })
  select.dataset.currentslot = slot
  const names = []
  for (const it of Object.values(all)) {
    if (it.type === slot) {
      if (it.usetype === 'none') {
        names.push([it.name.trim(), it.item_id])
      }
    }
  }
  names.sort(function (a, b) {
    return a[0].localeCompare(b[0])
  })
  TWDS.createEle('option', { last: select, value: 0, textContent: '---' })
  cur = parseInt(cur)
  for (let i = 0; i < names.length; i++) {
    const opt = TWDS.createEle('option', { last: select })
    opt.textContent = names[i][0]
    opt.value = names[i][1]
    if (names[i][1] === cur) { opt.selected = true }
  }
  return select
}
TWDS.simulator.switchslot = function (area, sl, ii) {
  const div = TWDS.q1('.target.' + sl, area)
  div.textContent = ''
  let lv = 0
  let upg = false
  if (ii === 0) {
    TWDS.createEle({
      nodeName: 'div',
      className: 'item item_inventory ',
      children: [
        { nodeName: 'img', src: '/images/inventory/default/' + sl + '_blank.png' }
      ],
      last: div
    })
  } else {
    const it = ItemManager.get(ii)
    const t = new tw2widget.InventoryItem(it).setCharacter(Character).getMainDiv()[0]
    div.appendChild(t)
    lv = it.item_level
    if (it.upgradeable) { upg = true }
  }
  if (upg) {
    const levels = []
    for (let j = 0; j < 6; j++) {
      levels.push(TWDS.createEle({
        nodeName: 'option',
        value: j,
        textContent: j,
        selected: j === lv
      }))
    }
    TWDS.createEle({
      nodeName: 'select',
      className: 'leveling',
      last: div,
      children: levels
    })
  }
}
TWDS.simulator.updateresult = function (ra, ia, jobsel) {
  const charPremium = Number(Premium.hasBonus('character'))
  const moneyPremium = Number(Premium.hasBonus('money'))
  const o = []
  const a = TWDS.q('.target .item', ia)
  for (let i = 0; i < a.length; i++) {
    o.push(a[i].dataset.twds_item_id)
  }
  const t = TWDS.bonuscalc.getComboBonus(o, true)
  ra.innerHTML = ''
  TWDS.calculator.showbonus(t, ra)
  const sp = TWDS.bonuscalc.getSpeed(o)
  const tab = TWDS.q1('table', ra)
  TWDS.createEle('tr', {
    children: [
      { nodeName: 'th', textContent: 'total speed' },
      { nodeName: 'td', textContent: Math.round(sp) + '%' }
    ],
    last: tab
  })
  const jobid = parseInt(jobsel.value)
  if (jobid) {
    const job = JobList.getJobById(jobid)
    let laborpoints = 0
    for (const [skillname, mult] of Object.entries(job.skills)) {
      if (t[skillname]) {
        laborpoints += t[skillname] * mult
      }
      const attr = CharacterSkills.skills[skillname].attr_key
      if (attr) {
        laborpoints += t[attr] * mult
      }
      laborpoints += CharacterSkills.skills[skillname].points * mult
    }
    if (t.job) {
      laborpoints += t.job
    }
    const jc = new JobCalculator(laborpoints, job.malus + 1)
    jc.calcStars((laborpoints / (job.malus + 1)))
    const curstars = jc.getJobstarsValue()
    let stars = ''
    let color = '#CD7F32'
    let workstars = curstars
    if (workstars > 10) {
      color = 'gold'
      workstars -= 10
    } else if (workstars > 5) {
      color = 'silver'
      workstars -= 5
    }
    for (let j = 1; j < workstars + 1; j++) {
      stars += '*'
    }
    TWDS.createEle('tr', {
      children: [
        { nodeName: 'th', textContent: 'laborpoints' },
        { nodeName: 'td', textContent: laborpoints },
        { nodeName: 'td', textContent: '' },
        { nodeName: 'td', textContent: stars, rowSpan: 2, style: { color: color, fontSize: 'xx-large', backgroundColor: 'white' } },
        { nodeName: 'th', textContent: 'exp/h' },
        { nodeName: 'th', textContent: '$/h' },
        { nodeName: 'th', textContent: 'luck' },
        { nodeName: 'th', textContent: 'danger' }
      ],
      last: tab
    })
    let tmoney = 1
    if (t.dollar) { tmoney = 1 + t.dollar }

    let charxpmult = 1
    if (Character.charClass === 'worker') {
      if (charPremium) charxpmult = 1.1
      else charxpmult = 1.05
    }
    let txpmult = 1
    if (t.xp) { txpmult = 1 + t.xp }
    let dangmult = 1
    if (Character.charClass === 'adventurer') {
      if (charPremium) dangmult = 0.8
      else charxpmult = 0.9
    }

    TWDS.createEle('tr', {
      children: [
        { nodeName: 'th', textContent: 'jobpoints' },
        { nodeName: 'td', textContent: laborpoints - job.malus - 1 },
        { nodeName: 'td', textContent: curstars + '*' },
        {
          nodeName: 'td',
          textContent:
          TWDS.TWDBcalcExp(laborpoints, job.malus + 1, TWDS.jobData['job_' + jobid].job_exp, 100, 1) * charxpmult * txpmult
        },
        {
          nodeName: 'td',
          textContent:
          Math.round(TWDS.TWDBcalcWage(laborpoints, job.malus + 1, TWDS.jobData['job_' + jobid].job_wages, 100, 1) * (moneyPremium ? 1.5 : 1) * tmoney)
        },
        {
          nodeName: 'td',
          textContent:
          Math.round(TWDS.TWDBcalcLuck(laborpoints, job.malus + 1, TWDS.jobData['job_' + jobid].job_luck, 100, 1) * 3 * (charPremium ? 1.5 : 1))
        },
        {
          nodeName: 'td',
          textContent:
          (TWDS.TWDBcalcDanger(laborpoints, job.malus + 1, TWDS.jobData['job_' + jobid].job_danger, 100, 1) * dangmult).toFixed(1) + '%'
        }
      ],
      last: tab
    })
  }
}
TWDS.simulator.openwindow = function () {
  const myname = 'TWDS_simulator_window'
  const win = wman.open(myname, TWDS._('SIMULATOR_TITLE', 'Simulator'), 'TWDS_simulator_window')
  win.setMiniTitle('Simulator')

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_simulator_container'
  })
  const itemarea = TWDS.createEle('div', {
    className: 'TWDS_simulator_itemarea',
    last: content
  })
  const selectarea = TWDS.createEle('div', {
    className: 'TWDS_simulator_selectarea',
    last: content
  })
  const jobselectarea = TWDS.createEle('div', {
    className: 'TWDS_simulator_jobselectarea',
    last: content
  })
  const resultarea = TWDS.createEle('div', {
    className: 'TWDS_simulator_resultarea',
    last: content
  })
  TWDS.createEle('hr', {
    last: content
  })
  TWDS.createEle('div', {
    last: content,
    innerHTML: '<p>Here you can combine any equipment to see what would happen before you buy.' +
      '<p>When you click on an image a new selectbox will be shown where you can select anything which might be worn in that slot, ' +
      "even if gender, class or level wouldn't allow to wear it."
  })

  const jobsel = TWDS.createEle('select', { last: jobselectarea })
  TWDS.createEle('option', {
    last: jobsel,
    value: 0,
    textContent: '---'
  })
  const allJobs = JobList.getSortedJobs('name')
  for (let i = 0; i < allJobs.length; i++) {
    TWDS.createEle('option', {
      last: jobsel,
      value: allJobs[i].id,
      textContent: allJobs[i].name
    })
  }

  const myslots = ['head', 'neck', 'body', 'belt', 'pants', 'foot', 'right_arm', 'left_arm', 'animal', 'yield']
  for (let i = 0; i < myslots.length; i++) {
    const sl = myslots[i]
    TWDS.createEle({
      nodeName: 'div',
      className: 'target ' + sl,
      dataset: {
        slot: sl
      },
      last: itemarea
    })
    const w = Wear.get(sl)
    if (w) {
      TWDS.simulator.switchslot(itemarea, sl, w.obj.item_id)
    } else {
      TWDS.simulator.switchslot(itemarea, sl, 0)
    }
  }
  TWDS.delegate(content, 'click', '.target .item', function () {
    const sl = this.parentNode.dataset.slot
    let cur = TWDS.q1('.target.' + sl + ' .item', itemarea)
    if (cur) cur = cur.dataset.twds_item_id
    const sel = TWDS.simulator.fillselectarea(selectarea, sl, cur)
    sel.onchange = function () {
      TWDS.simulator.switchslot(itemarea, sl, this.value)
      sel.remove()
      TWDS.simulator.updateresult(resultarea, itemarea, jobsel)
    }
  })
  TWDS.delegate(content, 'change', '.target .leveling', function () {
    const sl = this.parentNode.dataset.slot
    let cur = TWDS.q1('.target.' + sl + ' .item', itemarea)
    if (!cur) return
    cur = cur.dataset.twds_item_id
    let it = ItemManager.get(cur)
    it = ItemManager.get(it.item_base_id * 1000 + parseInt(this.value))
    TWDS.simulator.switchslot(itemarea, it.type, it.item_id)
    TWDS.simulator.updateresult(resultarea, itemarea, jobsel)
  })
  jobsel.onchange = function () {
    TWDS.simulator.updateresult(resultarea, itemarea, jobsel)
  }
  TWDS.simulator.updateresult(resultarea, itemarea, jobsel)

  sp.appendContent(content)
  win.appendToContentPane(sp.getMainDiv())
}

TWDS.registerExtra('TWDS.simulator.openwindow', 'Simulator', 'Virtually combine any equipment')
