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
TWDS.simulator.getcombo = function (comboarea) {
  const out = []
  if (comboarea.classList.contains('disabled')) return out
  const ia = TWDS.q1('.itemarea', comboarea)
  if (!ia) { console.log('strange: .itemarea not found in', comboarea); return }
  const a = TWDS.q('.target .item', ia)
  for (let i = 0; i < a.length; i++) {
    out.push(parseInt(a[i].dataset.twds_item_id))
  }
  return out
}
TWDS.simulator.updatedescriptions = function (win) {
  const handleonecombo = function (ca) {
    const da = TWDS.q1('.descarea', ca)
    if (!da) { console.log('strange: .descarea not found in', ca); return }

    const items = TWDS.simulator.getcombo(ca)
    da.textContent = TWDS.describeItemCombo(items)
  }
  const combos = TWDS.q('.comboarea', win.divMain)
  console.log('COMBOS', combos)
  for (let i = 0; i < combos.length; i++) {
    handleonecombo(combos[i])
  }
}
TWDS.simulator.updateresult = function (win) {
  const charPremium = Number(Premium.hasBonus('character'))
  const moneyPremium = Number(Premium.hasBonus('money'))
  const start = new Date().getTime()
  TWDS.simulator.updatedescriptions(win)

  const ra = TWDS.q1('.resultarea', win.divMain)
  if (!ra) { console.log('strange: .resultarea not found in', win); return }

  const comboarea0 = TWDS.q1('.comboarea0', win.divMain)
  const comboarea1 = TWDS.q1('.comboarea1', win.divMain)
  const combo0 = TWDS.simulator.getcombo(comboarea0)
  const combo1 = TWDS.simulator.getcombo(comboarea1)

  const bo0 = TWDS.bonuscalc.getComboBonus(combo0, true)
  const bo1 = TWDS.bonuscalc.getComboBonus(combo1, true)
  bo0.speedresult = TWDS.bonuscalc.getSpeed(combo0)
  if (combo1.length) {
    bo1.speedresult = TWDS.bonuscalc.getSpeed(combo1)
  }

  ra.textContent = ''
  const tab = TWDS.createEle('table.results', { last: ra, style: { margin: '0 auto' } })
  const tbody = TWDS.createEle('tbody', { last: tab })

  const line = function (k, text, mult) {
    if (!bo0[k] && !bo1[k]) return
    const clhack = function (a, b) {
      if (combo1.length === 0) return ''
      if (a > b) return 'green'
      if (b > a) return 'red'
      return ''
    }
    const tr = TWDS.createEle('tr', { last: tbody })
    let v0 = ''
    let v1 = ''
    let have = 0
    if (k in bo0) {
      v0 = parseInt(bo0[k])
      if (mult) v0 = parseFloat(bo0[k] * mult).toFixed(0)
      have++
    }
    if (k in bo1) {
      v1 = parseInt(bo1[k])
      if (mult) v1 = parseFloat(bo1[k] * mult).toFixed(0)
      have++
    }
    if (have === 2) {
      TWDS.createEle('td', { textContent: v0 - v1, last: tr, className: 'delta' })
    } else {
      TWDS.createEle('td', { last: tr })
    }
    TWDS.createEle('td', { textContent: v0, last: tr, className: clhack(v0, v1) })
    TWDS.createEle('th', { textContent: text, last: tr })
    if (combo1.length === 0) {
      TWDS.createEle('td', { last: tr })
      TWDS.createEle('td', { last: tr })
    } else {
      TWDS.createEle('td', { textContent: v1, last: tr, className: clhack(v1, v0) })
      if (have === 2) {
        TWDS.createEle('td', { textContent: v1 - v0, last: tr, className: 'delta' })
      } else {
        TWDS.createEle('td', { last: tr })
      }
    }
  }
  for (let i = 0; i < CharacterSkills.allAttrKeys.length; i++) {
    const attr = CharacterSkills.allAttrKeys[i]
    line(attr, CharacterSkills.keyNames[attr])
  }
  for (let i = 0; i < CharacterSkills.allSkillKeys.length; i++) {
    const skill = CharacterSkills.allSkillKeys[i]
    line(skill, CharacterSkills.keyNames[skill])
  }
  line('experience', 'experience (+%)', 100)
  line('dollar', 'money (+%)', 100)
  line('luck', 'luck (+%)', 100)
  line('drop', 'drop (+%)', 100)
  line('speed', 'speed bonus (+%)', 100)
  line('speedresult', 'speed')
  line('regen', 'regeneration (+%)', 100)
  line('pray', 'pray (+)')
  line('fort_offense', 'fort battle offense')
  line('fort_defense', 'fort battle defense')
  line('fort_resistance', 'fort battle resistance')
  line('fort_offense_sector', 'offense sector bonus')
  line('fort_defense_sector', 'defense sector bonus')
  line('fort_damage_sector', 'damage sector bonus')

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
          { nodeName: 'th', colSpan: 7, textContent: 'Combo #1' },
          {
            nodeName: 'th',
            colSpan: 2,
            children: [
              {
                nodeName: 'input',
                type: 'text',
                className: 'searchfilter',
                onchange: TWDS.sortable.search
              }
            ]
          },
          { nodeName: 'th', colSpan: 7, textContent: 'Combo #2, or best' }
        ]
      },
      {
        nodeName: 'tr',
        children: [

          { nodeName: 'th', textContent: 'LP', dataset: { colsel: '.c.laborpoints', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'Job Points', dataset: { colsel: '.c.jobpoints', sortmode: 'number' } },
          { nodeName: 'th', textContent: '*', dataset: { colsel: '.c.stars', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'XP', dataset: { colsel: '.c.xp', sortmode: 'number' } },
          { nodeName: 'th', textContent: '$', dataset: { colsel: '.c.dollar', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'Luck', dataset: { colsel: '.c.luck', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'Danger', dataset: { colsel: '.c.danger', sortmode: 'number' } },

          { nodeName: 'th', textContent: '#', dataset: { colsel: '.jobid', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'Name', dataset: { colsel: '.name' } },

          { nodeName: 'th', textContent: 'LP', dataset: { colsel: '.b.laborpoints', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'Job Points', dataset: { colsel: '.b.jobpoints', sortmode: 'number' } },
          { nodeName: 'th', textContent: '*', dataset: { colsel: '.b.stars', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'XP', dataset: { colsel: '.b.xp', sortmode: 'number' } },
          { nodeName: 'th', textContent: '$', dataset: { colsel: '.b.dollar', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'Luck', dataset: { colsel: '.b.luck', sortmode: 'number' } },
          { nodeName: 'th', textContent: 'Danger', dataset: { colsel: '.b.danger', sortmode: 'number' } }
        ]
      }
    ]
  })
  const tbody2 = TWDS.createEle('tbody', { last: tab2 })
  const calcit = function (jobid, bonusthing) {
    const job = JobList.getJobById(jobid)
    let laborpoints = 0
    for (const [skillname, mult] of Object.entries(job.skills)) {
      if (bonusthing[skillname]) {
        laborpoints += bonusthing[skillname] * mult
      }
      const attr = CharacterSkills.skills[skillname].attr_key
      if (attr && bonusthing[attr]) {
        laborpoints += bonusthing[attr] * mult
      }
      laborpoints += CharacterSkills.skills[skillname].points * mult
    }
    if (bonusthing.job) {
      laborpoints += bonusthing.job
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
    if (bonusthing.dollar) { tmoney = 1 + bonusthing.dollar }

    let charxpmult = 1
    if (Character.charClass === 'worker') {
      if (charPremium) charxpmult = 1.1
      else charxpmult = 1.05
    }
    let txpmult = 1
    if (bonusthing.xp) { txpmult = 1 + bonusthing.xp }
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
    const d = calcit(jobid, bo0)
    const best = TWDS.getJobBestFromCache(jobid)
    let e = null
    if (combo1.length) {
      e = calcit(jobid, bo1)
    } else if (best) {
      e = calcit(jobid, TWDS.bonuscalc.getComboBonus(best.items), true)
    }

    const tr = TWDS.createEle('tr', {
      children: [
        { nodeName: 'td.c.laborpoints', textContent: d.laborpoints },
        { nodeName: 'td.c.jobpoints', textContent: d.jobpoints },
        {
          nodeName: 'td.c.stars.ra',
          textContent: d.starcount
        },
        {
          nodeName: 'td.c.xp.ra',
          textContent:
            (TWDS.TWDBcalcExp(d.laborpoints, d.malus + 1,
              TWDS.jobData['job_' + jobid].job_exp, 100, 1) * d.charxpmult * d.txpmult).toFixed(0)
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

        { nodeName: 'th.jobid.ra', textContent: jobid },
        { nodeName: 'th.name', textContent: d.name },

        { nodeName: 'td.b.laborpoints.ra' },
        { nodeName: 'td.b.jobpoints.ra' },
        { nodeName: 'td.b.stars.ra' },
        { nodeName: 'td.b.xp.ra' },
        { nodeName: 'td.b.dollar.ra' },
        { nodeName: 'td.b.luck.ra' },
        { nodeName: 'td.b.danger.ra' }
      ],
      last: tbody2
    })
    if (e) {
      TWDS.q1('.b.laborpoints', tr).textContent = e.laborpoints
      TWDS.q1('.b.jobpoints', tr).textContent = e.jobpoints
      TWDS.q1('.b.stars', tr).textContent = e.starcount
      TWDS.q1('.b.xp', tr).textContent =
          (TWDS.TWDBcalcExp(e.laborpoints, e.malus + 1,
            TWDS.jobData['job_' + jobid].job_exp, 100, 1) * e.charxpmult * e.txpmult).toFixed(0)
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
  const now = new Date().getTime()
  console.log('simulator update took', (now - start), 'ms')

/*
  const tab = TWDS.q1('table', ra)
  TWDS.createEle('tr', {
    children: [
      { nodeName: 'th', textContent: 'total speed' },
      { nodeName: 'td', textContent: Math.round(sp) + '%' }
    ],
    last: tab
  })
  const tab2 = TWDS.createEle('table.alljobs.TWDS_sortable', {
    last: ra,
    dataset: {
      searchfilter: '.searchfilter'
    }
  })
  */
}
TWDS.simulator.windowclosedhandler = function () {
}
TWDS.simulator.openwindow = function (paraitems) {
  const myname = 'TWDS_simulator_window'
  const win = wman.open(myname, TWDS._('SIMULATOR_TITLE', 'Simulator'), 'TWDS_simulator_window')
  console.log('win', win)
  win.setMiniTitle('Simulator')

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_simulator_container'
  })

  const createarrowarea = function (pa, par) {
    const area = TWDS.createEle('div.arrowarea', { last: pa })
    const out = {}
    out.right = TWDS.createEle({
      nodeName: 'div.right.linklike',
      last: area,
      textContent: '\u2192'
    })
    out.left = TWDS.createEle({
      nodeName: 'div.left.linklike',
      last: area,
      textContent: '\u2190'
    })
    out.both = TWDS.createEle({
      nodeName: 'div.leftright.linklike',
      last: area,
      textContent: '\u21c4'
    })
    return out
  }

  const createcomboarea = function (pa, par, itemstouse, comboindex) {
    const comboarea = TWDS.createEle('div.comboarea.comboarea' + comboindex, { last: pa, dataset: { comboindex: comboindex } })
    if (comboindex === 1) comboarea.classList.add('disabled')
    const h2 = TWDS.createEle('h2.rp_job_header', {
      last: comboarea,
      textContent: 'Combo #' + (comboindex + 1)
    })
    const checkuncheck = function (ele, flag) {
      const ca = ele.closest('.comboarea')
      console.log('checkuncheck', ele, flag, ca)
      if (flag) {
        ca.classList.remove('disabled')
      } else {
        ca.classList.add('disabled')
      }
    }
    let checkbox
    if (comboindex) {
      checkbox = TWDS.createEle({
        nodeName: 'input',
        type: 'checkbox',
        value: '1',
        last: h2,
        onchange: function () {
          checkuncheck(this, this.checked)
          TWDS.simulator.updateresult(win)
        }
      })
    }
    TWDS.createEle({
      nodeName: 'div.usecurrent.linklike',
      last: comboarea,
      textContent: '\u21ba',
      title: TWDS._('SIMULATOR_TAKE_CURRENT', 'Take the currently used equipment')
    })
    const setselectarea = TWDS.createEle('div', {
      className: 'setselectarea',
      last: comboarea
    })
    const itemarea = TWDS.createEle('div', {
      className: 'itemarea',
      last: comboarea
    })
    TWDS.createEle('div', {
      className: 'selectarea',
      last: comboarea
    })
    TWDS.createEle('div', {
      className: 'descarea',
      last: comboarea
    })
    const setselcontainer = TWDS.createFilteredSelect('--- select a set to wear ---', par)
    setselectarea.appendChild(setselcontainer)
    const setsel = TWDS.q1('select', setselcontainer)
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
      TWDS.simulator.updateresult(win, comboindex)
    }

    const myslots = ['head', 'neck', 'body', 'belt', 'pants', 'foot', 'right_arm', 'left_arm', 'animal', 'yield']
    let wehaditems = false
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
      if (itemstouse[sl]) {
        TWDS.simulator.switchslot(itemarea, sl, itemstouse[sl].item_id)
        wehaditems = true
      } else if (w) {
        TWDS.simulator.switchslot(itemarea, sl, w.obj.item_id)
      } else {
        TWDS.simulator.switchslot(itemarea, sl, 0)
      }
    }
    wehaditems = 0
    if (wehaditems && comboindex) {
      checkbox.click()
      checkuncheck(checkbox, true)
      console.log('checked it', wehaditems)
    }

    return comboarea
  }

  let allsets = west.storage.ItemSetManager._setArray.slice(0)
  allsets = TWDS.itemsettab.fixallsets(allsets)
  const par = []
  for (let i = 0; i < allsets.length; i++) {
    const k = allsets[i].key
    const n = allsets[i].name
    par.push([k, n])
  }

  const itemstouse1 = {}
  const itemstouse2 = {}
  if (paraitems === 'debug') {
    paraitems = null
    const ds1 = { head: 53468000, neck: 53469000, body: 53470000, belt: 53471000, pants: 53472000, foot: 53473000, right_arm: 53475000, left_arm: 53476000, animal: 53550000, yield: 53551000 }
    const ds2 = { head: 52248000, neck: 52249000, body: 52250000, belt: 52251000, pants: 52252000, foot: 52253000, right_arm: 52257000, left_arm: 52258000, animal: 52254000, yield: 52255000 }
    for (const sl of Object.keys(ds1)) {
      itemstouse1[sl] = ItemManager.get(ds1[sl])
    }
    for (const sl of Object.keys(ds2)) {
      itemstouse2[sl] = ItemManager.get(ds2[sl])
    }
  }
  if (paraitems) {
    for (let i = 0; i < paraitems.length; i++) {
      if (paraitems[i]) {
        const it = ItemManager.get(paraitems[i])
        if (it) { itemstouse1[it.type] = it }
      }
    }
  }
  const caparent = TWDS.createEle('div.comboareacontainer', { last: content })
  const ca0 = createcomboarea(caparent, par, itemstouse1, 0)
  const functions = createarrowarea(caparent, par)
  const ca1 = createcomboarea(caparent, par, itemstouse2, 1)

  TWDS.createEle('hr', {
    last: content
  })
  TWDS.createEle('div', {
    className: 'resultarea',
    last: content
  })
  TWDS.createEle('div.simhelp', {
    last: content,
    innerHTML: '<p>Here you can combine any equipment to see what would happen before you buy.' +
      '<p>When you click on an image a new selectbox will be shown where you can select anything which might be worn in that slot, ' +
      "even if gender, class or level wouldn't allow to wear it."
  })

  TWDS.delegate(content, 'click', '.target .item', function () {
    const comboarea = this.closest('.comboarea')
    const comboindex = comboarea.dataset.comboindex
    const itemarea = TWDS.q1('.itemarea', comboarea)
    const sl = this.parentNode.dataset.slot
    let cur = TWDS.q1('.target.' + sl + ' .item', itemarea)
    if (cur) cur = cur.dataset.twds_item_id
    const selectarea = TWDS.q1('.selectarea', comboarea)
    const selcontainer = TWDS.simulator.fillselectarea(selectarea, sl, cur)
    const sel = TWDS.q1('select', selcontainer)
    sel.onchange = function () {
      TWDS.simulator.switchslot(itemarea, sl, this.value)
      sel.closest('.filteredselectcontainer').remove()
      TWDS.simulator.updateresult(win, comboindex)
    }
  })
  TWDS.delegate(content, 'change', '.target .leveling', function () {
    const comboarea = this.closest('.comboarea')
    const comboindex = comboarea.dataset.comboindex
    const itemarea = TWDS.q1('.itemarea', comboarea)
    const sl = this.parentNode.dataset.slot
    let cur = TWDS.q1('.target.' + sl + ' .item', itemarea)
    if (!cur) return
    cur = cur.dataset.twds_item_id
    let it = ItemManager.get(cur)
    it = ItemManager.get(it.item_base_id * 1000 + parseInt(this.value))
    TWDS.simulator.switchslot(itemarea, it.type, it.item_id)
    TWDS.simulator.updateresult(win, comboindex)
  })
  TWDS.delegate(content, 'click', '.usecurrent', function () {
    const comboarea = this.closest('.comboarea')
    const itemarea = TWDS.q1('.itemarea', comboarea)

    const myslots = ['head', 'neck', 'body', 'belt', 'pants', 'foot', 'right_arm', 'left_arm', 'animal', 'yield']
    for (let i = 0; i < myslots.length; i++) {
      const sl = myslots[i]
      const w = Wear.get(sl)
      if (w) {
        TWDS.simulator.switchslot(itemarea, sl, w.obj.item_id)
      } else {
        TWDS.simulator.switchslot(itemarea, sl, 0)
      }
    }
  })

  functions.left.onclick = function () {
    const ia0 = TWDS.q1('.itemarea', ca0)
    const ia1 = TWDS.q1('.itemarea', ca1)
    const myslots = ['head', 'neck', 'body', 'belt', 'pants', 'foot', 'right_arm', 'left_arm', 'animal', 'yield']
    for (let i = 0; i < myslots.length; i++) {
      const sl = myslots[i]
      const id = TWDS.q1('.target.' + sl + ' .item_inventory', ia1).dataset.twds_item_id
      TWDS.simulator.switchslot(ia0, sl, id)
    }
    TWDS.simulator.updateresult(win, 0)
  }
  functions.right.onclick = function () {
    const ia0 = TWDS.q1('.itemarea', ca0)
    const ia1 = TWDS.q1('.itemarea', ca1)
    const myslots = ['head', 'neck', 'body', 'belt', 'pants', 'foot', 'right_arm', 'left_arm', 'animal', 'yield']
    for (let i = 0; i < myslots.length; i++) {
      const sl = myslots[i]
      const id = TWDS.q1('.target.' + sl + ' .item_inventory', ia0).dataset.twds_item_id
      TWDS.simulator.switchslot(ia1, sl, id)
    }
    TWDS.simulator.updateresult(win, 1)
  }
  functions.both.onclick = function () {
    const ia0 = TWDS.q1('.itemarea', ca0)
    const ia1 = TWDS.q1('.itemarea', ca1)
    const myslots = ['head', 'neck', 'body', 'belt', 'pants', 'foot', 'right_arm', 'left_arm', 'animal', 'yield']
    for (let i = 0; i < myslots.length; i++) {
      const sl = myslots[i]
      const id0 = TWDS.q1('.target.' + sl + ' .item_inventory', ia0).dataset.twds_item_id
      const id1 = TWDS.q1('.target.' + sl + ' .item_inventory', ia1).dataset.twds_item_id
      TWDS.simulator.switchslot(ia0, sl, id1)
      TWDS.simulator.switchslot(ia1, sl, id0)
    }
    TWDS.simulator.updateresult(win, 0)
    TWDS.simulator.updateresult(win, 1)
  }

  sp.appendContent(content)
  win.appendToContentPane(sp.getMainDiv())
  TWDS.simulator.windowclosedhandler()

  TWDS.simulator.updateresult(win, 0)
  TWDS.simulator.updatedescriptions(win, 0)
}
TWDS.registerStartFunc(function () {
  EventHandler.listen('WINDOW_CLOSED', function () { TWDS.simulator.windowclosedhandler() })
})

TWDS.registerExtra('TWDS.simulator.openwindow', 'Simulator', 'Virtually combine any equipment')
