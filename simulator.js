// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.simulator = {}
TWDS.simulator.fillselectarea = function (area, slot, cur) {
  area.innerHTML = ''

  const all = ItemManager.getAll()
  const allthings = []
  for (const it of Object.values(all)) {
    if (it.type === slot) {
      if (it.usetype === 'none') {
        allthings.push([it.item_id, it.name.trim()])
      }
    }
  }
  allthings.sort(function (a, b) {
    return a[1].localeCompare(b[1])
  })

  const c = TWDS.createFilteredSelect('--- select an item to wear ---', allthings)
  area.appendChild(c)
  return c
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
TWDS.simulator.updateresult = function (ra, ia, da) {
  const charPremium = Number(Premium.hasBonus('character'))
  const moneyPremium = Number(Premium.hasBonus('money'))
  const o = []
  const a = TWDS.q('.target .item', ia)
  for (let i = 0; i < a.length; i++) {
    o.push(parseInt(a[i].dataset.twds_item_id))
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
  da.textContent = TWDS.describeItemCombo(o)
  const tab2 = TWDS.createEle('table.alljobs.TWDS_sortable', {
    last: ra,
    dataset: {
      searchfilter: '.searchfilter'
    }
  })
  TWDS.delegate(tab2, 'click', 'thead th[data-colsel]', TWDS.sortable.do)
  TWDS.createEle('thead', {
    last: tab2,
    children: [
      {
        nodeName: 'tr',
        children: [
          { nodeName: 'th', colSpan: 1, textContent: 'Job' },
          {
            nodeName: 'th',
            colSpan: 1,
            children: [
              {
                nodeName: 'input',
                type: 'text',
                className: 'searchfilter',
                onchange: TWDS.sortable.search
              }
            ]
          },
          { nodeName: 'th', colSpan: 6, textContent: 'Simulated' },
          { nodeName: 'th', colSpan: 6, textContent: 'Best' }
        ]
      },
      {
        nodeName: 'tr',
        children: [
          { nodeName: 'th', textContent: '#', dataset: { colsel: '.jobid', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'Name', dataset: { colsel: '.name' } },

          { nodeName: 'th', textContent: 'LP', dataset: { colsel: '.c.laborpoints', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'Job Points', dataset: { colsel: '.c.jobpoints', sortmode: 'number' } },
          { nodeName: 'th', textContent: '*', dataset: { colsel: '.c.stars', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'XP', dataset: { colsel: '.c.xp', sortmode: 'number' } },
          { nodeName: 'th', textContent: '$', dataset: { colsel: '.c.dollar', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'Luck', dataset: { colsel: '.c.luck', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'Danger', dataset: { colsel: '.c.danger', sortmode: 'number' } },

          { nodeName: 'th', textContent: 'LP', dataset: { colsel: '.c.laborpoints', sortmode: 'number' } },
          { nodeName: 'th', textContent: '*', dataset: { colsel: '.c.stars', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'XP', dataset: { colsel: '.c.xp', sortmode: 'number' } },
          { nodeName: 'th', textContent: '$', dataset: { colsel: '.c.dollar', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'Luck', dataset: { colsel: '.c.luck', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'Danger', dataset: { colsel: '.c.danger', sortmode: 'number' } }
        ]
      }
    ]
  })
  const tbody = TWDS.createEle('tbody', { last: tab2 })
  const calcit = function (jobid, t) {
    const job = JobList.getJobById(jobid)
    let laborpoints = 0
    for (const [skillname, mult] of Object.entries(job.skills)) {
      if (t[skillname]) {
        laborpoints += t[skillname] * mult
      }
      const attr = CharacterSkills.skills[skillname].attr_key
      if (attr && attr[t]) {
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
    return {
      laborpoints: laborpoints,
      jobpoints: laborpoints - job.malus + 1,
      curstars: curstars,
      stars: stars,
      tmoney: tmoney,
      charxpmult: charxpmult,
      txpmult: txpmult,
      dangmult: dangmult,
      color: color,
      name: job.name,
      malus: job.malus,
      starcount: curstars
    }
  }
  for (let idx = 0; idx < JobsModel.Jobs.length; idx++) {
    const jobid = JobsModel.Jobs[idx].id
    const d = calcit(jobid, t)
    const best = TWDS.getJobBestFromCache(jobid)
    let e = null
    if (best) {
      e = calcit(jobid, TWDS.bonuscalc.getComboBonus(best.items), true)
    }

    const tr = TWDS.createEle('tr', {
      children: [
        { nodeName: 'th.jobid.ra', textContent: jobid },
        { nodeName: 'td.name', textContent: d.name },
        { nodeName: 'td.c.laborpoints', textContent: d.laborpoints },
        { nodeName: 'td.c.jobpoints', textContent: d.jobpoints },
        {
          nodeName: 'td.c.stars.ra',
          textContent: d.starcount
        },
        {
          nodeName: 'td.c.xp.ra',
          textContent:
          TWDS.TWDBcalcExp(d.laborpoints, d.malus + 1,
            TWDS.jobData['job_' + jobid].job_exp, 100, 1) * d.charxpmult * d.txpmult
        },
        {
          nodeName: 'td.c.dollar.ra',
          textContent:
          Math.round(TWDS.TWDBcalcWage(d.laborpoints, d.malus + 1,
            TWDS.jobData['job_' + jobid].job_wages, 100, 1) * (moneyPremium ? 1.5 : 1) * d.tmoney)
        },
        {
          nodeName: 'td.c.luck.ra',
          textContent:
          Math.round(TWDS.TWDBcalcLuck(d.laborpoints, d.malus + 1,
            TWDS.jobData['job_' + jobid].job_luck, 100, 1) * 3 * (charPremium ? 1.5 : 1))
        },
        {
          nodeName: 'td.c.danger.ra',
          textContent:
          (TWDS.TWDBcalcDanger(d.laborpoints, d.malus + 1,
            TWDS.jobData['job_' + jobid].job_danger, 100, 1) * d.dangmult).toFixed(1) + '%'
        },
        { nodeName: 'td.b.laborpoints.ra' },
        { nodeName: 'td.b.jobpoints.ra' },
        { nodeName: 'td.b.stars.ra' },
        { nodeName: 'td.b.xp.ra' },
        { nodeName: 'td.b.dollar.ra' },
        { nodeName: 'td.b.luck.ra' },
        { nodeName: 'td.b.danger.ra' }
      ],
      last: tbody
    })
    if (best) {
      TWDS.q1('.b.laborpoints', tr).textContent = e.laborpoints
      TWDS.q1('.b.jobpoints', tr).textContent = e.jobpoints
      TWDS.q1('.b.stars', tr).textContent = e.starcount
      TWDS.q1('.b.xp', tr).textContent =
          TWDS.TWDBcalcExp(e.laborpoints, e.malus + 1,
            TWDS.jobData['job_' + jobid].job_exp, 100, 1) * e.charxpmult * e.txpmult
      TWDS.q1('.b.dollar', tr).textContent =
          Math.round(TWDS.TWDBcalcWage(e.laborpoints, e.malus + 1,
            TWDS.jobData['job_' + jobid].job_wages, 100, 1) * (moneyPremium ? 1.5 : 1) * e.tmoney)
      TWDS.q1('.b.luck', tr).textContent =
          Math.round(TWDS.TWDBcalcLuck(d.laborpoints, d.malus + 1,
            TWDS.jobData['job_' + jobid].job_luck, 100, 1) * 3 * (charPremium ? 1.5 : 1))
      TWDS.q1('.b.danger', tr).textContent =
          (TWDS.TWDBcalcDanger(e.laborpoints, e.malus + 1,
            TWDS.jobData['job_' + jobid].job_danger, 100, 1) * e.dangmult).toFixed(1) + '%'
      let ar = []
      if (d.laborpoints > e.laborpoints) {
        ar = TWDS.q('.c', tr)
      } else if (d.laborpoints < e.laborpoints) {
        ar = TWDS.q('.b', tr)
      } else {
        ar = TWDS.q('.b, .c', tr)
      }
      for (let i = 0; i < ar.length; i++) {
        ar[i].style.color = 'green'
      }
    }
  }
}
TWDS.simulator.openwindow = function (paraitems) {
  const myname = 'TWDS_simulator_window'
  const win = wman.open(myname, TWDS._('SIMULATOR_TITLE', 'Simulator'), 'TWDS_simulator_window')
  win.setMiniTitle('Simulator')

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_simulator_container'
  })
  const setselectarea = TWDS.createEle('div', {
    className: 'TWDS_simulator_setselectarea',
    last: content
  })
  const itemarea = TWDS.createEle('div', {
    className: 'TWDS_simulator_itemarea',
    last: content
  })
  const selectarea = TWDS.createEle('div', {
    className: 'TWDS_simulator_selectarea',
    last: content
  })
  const resultarea = TWDS.createEle('div', {
    className: 'TWDS_simulator_resultarea',
    last: content
  })
  const descarea = TWDS.createEle('div', {
    className: 'TWDS_simulator_descarea',
    last: content
  })
  TWDS.createEle('hr', {
    last: content
  })
  TWDS.createEle('div.simhelp', {
    last: content,
    innerHTML: '<p>Here you can combine any equipment to see what would happen before you buy.' +
      '<p>When you click on an image a new selectbox will be shown where you can select anything which might be worn in that slot, ' +
      "even if gender, class or level wouldn't allow to wear it."
  })

  let allsets = west.storage.ItemSetManager._setArray.slice(0)
  allsets = TWDS.itemsettab.fixallsets(allsets)
  const par = []
  for (let i = 0; i < allsets.length; i++) {
    const k = allsets[i].key
    const n = allsets[i].name
    par.push([k, n])
  }

  const setselcontainer = TWDS.createFilteredSelect('--- select a set to wear ---', par)
  setselectarea.appendChild(setselcontainer)
  const setsel = TWDS.q1('select', setselcontainer)

  const itemstouse = {}
  if (paraitems) {
    for (let i = 0; i < paraitems.length; i++) {
      if (paraitems[i]) {
        const it = ItemManager.get(paraitems[i])
        if (it) { itemstouse[it.type] = it }
      }
    }
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
    let w = null
    if (!paraitems) { w = Wear.get(sl) }
    if (itemstouse[sl]) {
      TWDS.simulator.switchslot(itemarea, sl, itemstouse[sl].item_id)
    } else if (w) {
      TWDS.simulator.switchslot(itemarea, sl, w.obj.item_id)
    } else {
      TWDS.simulator.switchslot(itemarea, sl, 0)
    }
  }
  TWDS.delegate(content, 'click', '.target .item', function () {
    const sl = this.parentNode.dataset.slot
    let cur = TWDS.q1('.target.' + sl + ' .item', itemarea)
    if (cur) cur = cur.dataset.twds_item_id
    const selcontainer = TWDS.simulator.fillselectarea(selectarea, sl, cur)
    const sel = TWDS.q1('select', selcontainer)
    sel.onchange = function () {
      TWDS.simulator.switchslot(itemarea, sl, this.value)
      sel.closest('.filteredselectcontainer').remove()
      TWDS.simulator.updateresult(resultarea, itemarea, descarea)
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
    TWDS.simulator.updateresult(resultarea, itemarea, descarea)
  })
  setsel.onchange = function () {
    const key = setsel.value
    if (key === '') return
    const d = west.storage.ItemSetManager.get(key)
    const items = d.items
    for (let j = 0; j < items.length; j++) {
      const bid = items[j]
      const it = ItemManager.getByBaseId(bid)
      TWDS.simulator.switchslot(itemarea, it.type, it.item_id)
    }
    TWDS.simulator.updateresult(resultarea, itemarea, descarea)
  }
  TWDS.simulator.updateresult(resultarea, itemarea, descarea)

  sp.appendContent(content)
  win.appendToContentPane(sp.getMainDiv())
}

TWDS.registerExtra('TWDS.simulator.openwindow', 'Simulator', 'Virtually combine any equipment')
