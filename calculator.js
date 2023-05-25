// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.calculator = {}
TWDS.calculator.presets = [
  { name: 'duel', disabled: true },
  { name: 'at dodge / melee res.', tough: 2.97, dodge: 3.25, aim: 2.39, appearance: 1.25 },
  { name: 'att shot res. with melee dmg', punch: 2, reflex: 5, aim: 3, appearance: 5 },
  { name: 'clover:  aim / damage / dodge', punch: 25, tough: 18, dodge: 26, reflex: 14, aim: 30, shot: 35, tactic: 24, appearance: 25 },

  { name: 'bounty hunter: at / dodge / melee resistance', tough: 449, dodge: 489, aim: 360, appearance: 219 },
  { name: 'brooks: at / damage / shot resistance', punch: 232, reflex: 523, aim: 286, appearance: 538 },

  { name: 'clover:  aim / damage / dodge', punch: 254, tough: 184, dodge: 259, reflex: 143, aim: 299, shot: 344, tactic: 241, appearance: 251 },
  { name: 'cowgirl: at / aim / meelee damage', punch: 418, dodge: 130, aim: 458, tactic: 127, appearance: 352 },
  { name: 'hamilton: at / aim / melee damage / dodge', punch: 393, dodge: 255, aim: 321, appearance: 213 },
  { name: 'highlander: def / dodge / resistance', tough: 354, health: 144, dodge: 419, reflex: 299, tactic: 352, appearance: 127 },
  { name: 'jaguar: att / aim / shot damage', dodge: 263, aim: 505, shot: 536, appearance: 280 },
  { name: 'josephine: att / aim / dodge / melee damage', punch: 477, dodge: 566, aim: 565, appearance: 195 },
  { name: 'mclaughlin: def / dodge / resistance / melee damage', punch: 308, tough: 308, dodge: 302, reflex: 326, tactic: 386 },
  { name: 'nat: aim / health / melee damange / shot resistance', punch: 350, tough: 139, health: 517, reflex: 725, aim: 653 },
  { name: 'owens: att / aim / dodge / melee damage', punch: 489, dodge: 412, aim: 381, appearance: 389 },
  { name: 'pearl: att / aim / dodge / shot damange ', dodge: 582, aim: 583, shot: 553, appearance: 243 },
  { name: 'sarah astor: def / aim / dodge / health / melee damange', punch: 450, health: 232, dodge: 238, aim: 247, tactic: 489 },
  { name: 'thomas: def / aim / dodge / health', health: 107, dodge: 536, aim: 453, tactic: 297 },
  { name: 'vaquero: att / aim / show', dodge: 138, aim: 493, shot: 478, appearance: 312 },
  //
  { name: 'fort battle', disabled: true },
  { name: 'tank/att', health: 5, aim: 1, dodge: 5, hide: 6, leadership: 5, fboffense: 1, fboffense_sector: 2, fbdefense: 50, fbdefense_sector: 50, fbresistance: 5, fbdamage: 1 },
  { name: 'tank/def', health: 5, aim: 1, dodge: 10, pitfall: 12, leadership: 10, fboffense: 2, fboffense_sector: 4, fbdefense: 20, fbdefense_sector: 40, fbresistance: 10, fbdamage: 1 },
  { name: 'dmg/att', health: -1, aim: 5, dodge: 0, hide: 6, leadership: 6, fboffense: 10, fboffense_sector: 10, fbdefense: 1, fbdefense_sector: 2, fbresistance: 1, fbdamage: 5 },
  { name: 'dmg/def', health: -1, aim: 5, dodge: 0, pitfall: 6, leadership: 6, fboffense: 10, fboffense_sector: 10, fbdefense: 1, fbdefense_sector: 2, fbresistance: 1, fbdamage: 5 },
  { name: 'booster/damage', health: 0, dodge: 0, hide: 294, aim: 264, pitfall: 304, leadership: 269, fboffense: 0, fbdamage: 60 },
  { name: 'booster/generic', health: 0, dodge: 0, hide: 0, aim: 0, pitfall: 0, leadership: 1, fboffense_sector: 500, fbdefense_sector: 500, fbdamage: 5 }
  // { name: 'john bull', health: 0, dodge: 0, hide: 0, aim: 0, pitfall: 0, leadership: 0, fbdefense: 0, fbresistance: 0},
  // { name: 'john bull', health: 0, dodge: 0, hide: 0, aim: 0, pitfall: 0, leadership: 0, fbdefense: 0, fbresistance: 0},
  // { name: 'john bull', health: 0, dodge: 0, hide: 0, aim: 0, pitfall: 0, leadership: 0, fbdefense: 0, fbresistance: 0},
  // { name: 'john bull', health: 0, dodge: 0, hide: 0, aim: 0, pitfall: 0, leadership: 0, fbdefense: 0, fbresistance: 0}
  /*
  {name: "xxx", punch: 0, tough: 0, health: 0, dodge: 0, reflex: 0, aim: 0, shot: 0, tactic: 0, appearance: 0},
  {name: "xxx", punch: 0, tough: 0, health: 0, dodge: 0, reflex: 0, aim: 0, shot: 0, tactic: 0, appearance: 0},
  {name: "xxx", punch: 0, tough: 0, health: 0, dodge: 0, reflex: 0, aim: 0, shot: 0, tactic: 0, appearance: 0},
  {name: "xxx", punch: 0, tough: 0, health: 0, dodge: 0, reflex: 0, aim: 0, shot: 0, tactic: 0, appearance: 0},
  */
]
TWDS.calculator.data = [
  { kind: 'group', name: 'weapontype', cls: 'boostgroup' },
  { kind: 'weaponselect' },
  { kind: 'group', name: 'fortbattle', cls: 'boostgroup' },
  {
    kind: 'bonus',
    name: 'fboffense',
    img: '/images/fort/battle/button_attack.png',
    title: TWDS._('CALCULATOR_MP_ATTACK', 'multiplayer attack')
  },
  {
    kind: 'bonus',
    name: 'fboffense_sector',
    img: 'https://en21.the-west.net/images/fort/battle/help01.png',
    title: TWDS._('CALCULATOR_SECTOR_ATTACK', 'multiplayer attack (sector bonus)')
  },
  {
    kind: 'bonus',
    name: 'fbdefense',
    img: '/images/fort/battle/button_defend.png',
    title: TWDS._('CALCULATOR_MP_DEFENSE', 'multiplayer defense')
  },
  {
    kind: 'bonus',
    name: 'fbdefense_sector',
    img: 'https://en21.the-west.net/images/fort/battle/help01.png',
    title: TWDS._('CALCULATOR_SECTOR_DEFENSE', 'multiplayer defense (sector bonus)')
  },
  {
    kind: 'bonus',
    name: 'fbresistance',
    img: '/images/icons/Hearts.png',
    title: TWDS._('CALCULATOR_RESISTANCE', 'resistance')
  },
  {
    kind: 'bonus',
    name: 'fbdamage',
    img: '/images/items/left_arm/golden_rifle.png',
    title: TWDS._('CALCULATOR_SECTOR_DAMAGE', 'sector damage')
  },
  { kind: 'group', name: 'boost1', cls: 'boostgroup' },
  {
    kind: 'bonus',
    name: 'experience',
    img: '/images/items/yield/xp_boost.png',
    title: TWDS._('CALCULATOR_EXPERIENCE', 'experience')
  },
  {
    kind: 'bonus',
    name: 'dollar',
    img: '/images/items/yield/dollar_boost.png',
    title: TWDS._('CALCULATOR_DOLLAR', 'dollar')
  },
  {
    kind: 'bonus',
    name: 'luck',
    img: '/images/items/yield/luck_boost.png',
    title: TWDS._('CALCULATOR_LUCK', 'luck')
  },
  {
    kind: 'bonus',
    name: 'drop',
    img: '/images/items/yield/product_boost.png',
    title: TWDS._('CALCULATOR_DROP', 'drop chance')
  },
  {
    kind: 'bonus',
    name: 'joball',
    img: 'images/window/job/jobstar_small_gold.png',
    title: TWDS._('CALCULATOR_JP', 'job points (all jobs only)')
  },
  { kind: 'group', name: 'boost2', cls: 'boostgroup' },
  {
    kind: 'bonus',
    name: 'speed',
    img: '/images/jobs/walk.png',
    title: TWDS._('CALCULATOR_SPEED', 'speed (use the calculator in the equipment tab instead)')
  },
  {
    kind: 'bonus',
    name: 'regen',
    img: '/images/jobs/sleep.png',
    title: TWDS._('CALCULATOR_REGEN', 'regeneration')
  },
  {
    kind: 'bonus',
    name: 'pray',
    img: '/images/jobs/pray.png',
    title: TWDS._('CALCULATOR_PRAY', 'pray')
  },
  { kind: 'group', name: 'red', cls: 'attrgroup' },
  { kind: 'skill', name: 'build', img: '/images/window/skills/skillicon_build.png' },
  { kind: 'skill', name: 'punch', img: '/images/window/skills/skillicon_punch.png' },
  { kind: 'skill', name: 'tough', img: '/images/window/skills/skillicon_tough.png' },
  { kind: 'skill', name: 'endurance', img: '/images/window/skills/skillicon_endurance.png' },
  { kind: 'skill', name: 'health', img: '/images/window/skills/skillicon_health.png' },
  { kind: 'group', name: 'green', cls: 'attrgroup' },
  { kind: 'skill', name: 'ride', img: '/images/window/skills/skillicon_ride.png' },
  { kind: 'skill', name: 'reflex', img: '/images/window/skills/skillicon_reflex.png' },
  { kind: 'skill', name: 'dodge', img: '/images/window/skills/skillicon_dodge.png' },
  { kind: 'skill', name: 'hide', img: '/images/window/skills/skillicon_hide.png' },
  { kind: 'skill', name: 'swim', img: '/images/window/skills/skillicon_swim.png' },
  { kind: 'group', name: 'blue', cls: 'attrgroup' },
  { kind: 'skill', name: 'aim', img: '/images/window/skills/skillicon_aim.png' },
  { kind: 'skill', name: 'shot', img: '/images/window/skills/skillicon_shot.png' },
  { kind: 'skill', name: 'pitfall', img: '/images/window/skills/skillicon_pitfall.png' },
  { kind: 'skill', name: 'finger_dexterity', img: '/images/window/skills/skillicon_finger_dexterity.png' },
  { kind: 'skill', name: 'repair', img: '/images/window/skills/skillicon_repair.png' },
  { kind: 'group', name: 'yellow', cls: 'attrgroup' },
  { kind: 'skill', name: 'leadership', img: '/images/window/skills/skillicon_leadership.png' },
  { kind: 'skill', name: 'tactic', img: '/images/window/skills/skillicon_tactic.png' },
  { kind: 'skill', name: 'trade', img: '/images/window/skills/skillicon_trade.png' },
  { kind: 'skill', name: 'animal', img: '/images/window/skills/skillicon_animal.png' },
  { kind: 'skill', name: 'appearance', img: '/images/window/skills/skillicon_appearance.png' }
  /*
    const bonus = {
          damage: 0,
          fortbattle: {},
          job: {},
  */
]

TWDS.calculator.showbonus = function (all, area) {
  const one = function (all, k, str, tr, mult, pre, post) {
    if (mult === undefined) mult = 1
    if (pre === undefined) pre = ''
    if (post === undefined) post = ''
    if (str === '-') {
      if (k in CharacterSkills.attributes) { str = CharacterSkills.attributes[k].name } else if (k in CharacterSkills.skills) { str = CharacterSkills.skills[k].name }
    }
    TWDS.createEle('th', {
      last: tr,
      textContent: all[k] ? str : ''
    })
    let v = all[k]
    if (mult !== 1) {
      v = (mult * all[k]).toFixed(1)
    }
    TWDS.createEle('td', {
      last: tr,
      textContent: all[k] ? pre + v + post : ''
    })
  }
  const tab = TWDS.createEle('table', { last: area, className: 'TWDS_with_border' })
  let tr = TWDS.createEle('tr', { last: tab })
  one(all, 'strength', CharacterSkills.attributes.strength.name, tr)
  one(all, 'build', '-', tr)
  one(all, 'punch', '-', tr)
  one(all, 'tough', '-', tr)
  one(all, 'endurance', '-', tr)
  one(all, 'health', '-', tr)
  tr = TWDS.createEle('tr', { last: tab })
  one(all, 'flexibility', CharacterSkills.attributes.flexibility.name, tr)
  one(all, 'ride', '-', tr)
  one(all, 'reflex', '-', tr)
  one(all, 'dodge', '-', tr)
  one(all, 'hide', '-', tr)
  one(all, 'swim', '-', tr)
  tr = TWDS.createEle('tr', { last: tab })
  one(all, 'dexterity', CharacterSkills.attributes.dexterity.name, tr)
  one(all, 'aim', '-', tr)
  one(all, 'shot', '-', tr)
  one(all, 'pitfall', '-', tr)
  one(all, 'finger_dexterity', '-', tr)
  one(all, 'repair', '-', tr)
  tr = TWDS.createEle('tr', { last: tab })
  one(all, 'charisma', CharacterSkills.attributes.charisma.name, tr)
  one(all, 'leadership', '-', tr)
  one(all, 'tactic', '-', tr)
  one(all, 'trade', '-', tr)
  one(all, 'animal', '-', tr)
  one(all, 'appearance', '-', tr)
  tr = TWDS.createEle('tr', { last: tab })
  let flag = 0
  if (all.experience) { one(all, 'experience', 'Exp', tr, 100, '+', '%'); flag = 1 }
  if (all.dollar) { one(all, 'dollar', 'Money', tr, 100, '+', '%'); flag = 1 }
  if (all.luck) { one(all, 'luck', 'Luck', tr, 100, '+', '%'); flag = 1 }
  if (all.drop) { one(all, 'drop', 'Drop', tr, 100, '+', '%'); flag = 1 }
  if (flag) {
    flag = 0
    tr = TWDS.createEle('tr', { last: tab })
  }
  if (all.speed) { one(all, 'speed', 'Speed', tr, 100, '+', '%'); flag = 1 }
  if (all.regen) { one(all, 'regen', 'Regen.', tr, 100, '+', '%'); flag = 1 }
  if (all.pray) { one(all, 'pray', 'Pray', tr); flag = 1 }
  if (flag) {
    flag = 0
    tr = TWDS.createEle('tr', { last: tab })
  }
  if (all.fort_offense) { one(all, 'fort_offense', 'Off', tr); flag = 1 }
  if (all.fort_defense) { one(all, 'fort_defense', 'Def', tr); flag = 1 }
  if (all.fort_resistance) { one(all, 'fort_resistance', 'Res', tr); flag = 1 }
  if (flag) {
    flag = 0
    tr = TWDS.createEle('tr', { last: tab })
  }
  if (all.fort_offense_sector) { one(all, 'fort_offense_sector', 'SectorOff', tr); flag = 1 }
  if (all.fort_defense_sector) { one(all, 'fort_offense_sector', 'SectorDef', tr); flag = 1 }
  if (all.fort_damage_sector) { one(all, 'fort_damage_sector', 'SectorDmg', tr); flag = 1 }
}
TWDS.calculator.exec = function (filterarea, sels, resultarea) {
  const skillweights = { }
  const bonusweights = { }
  for (let i = 0; i < TWDS.calculator.data.length; i++) {
    const d = TWDS.calculator.data[i]
    if (d.kind === 'group') continue
    if (d.kind === 'bonus') {
      let inp = TWDS.q1('.onebonus.bonus.' + d.name + ' input.value', sels)
      inp = parseFloat(inp.value) || 0
      if (inp !== 0) {
        bonusweights[d.name] = inp
      }
    }
    if (d.kind === 'skill') {
      let inp = TWDS.q1('.onebonus.skill.' + d.name + ' input.value', sels)
      inp = parseFloat(inp.value) || 0
      if (inp !== 0) {
        skillweights[d.name] = inp
      }
    }
  }
  let include = 0
  const x = TWDS.q('.TWDS_calc_filterarea input:checked')
  for (let i = 0; i < x.length; i++) {
    include |= parseInt(x[i].value)
  }
  const w = TWDS.q1('.TWDS_calc_wgroup input:checked')
  if (w.value === 'shot') bonusweights.range = 1
  if (w.value === 'melee') bonusweights.melee = 1

  console.log('PARA', bonusweights, skillweights, include)
  resultarea.textContent = ''
  TWDS.createEle({
    nodeName: 'h2',
    textContent: TWDS._('CALCULATOR_RESULT', 'Result'),
    last: resultarea
  })

  const gc = TWDS.genCalc.exec(bonusweights, skillweights, include)
  for (let i = 0; i < gc.combos.length; i++) {
    TWDS.createEle({
      nodeName: 'p',
      last: resultarea,
      textContent: TWDS._('CALCULATOR_RESULTLINE', 'This combination gives $p$ points', { p: gc.combos[i][0] })
    })
    const o = gc.combos[i][1]
    for (let j = 0; j < o.length; j++) {
      const id = o[j]
      if (id === undefined) continue
      const t = new tw2widget.InventoryItem(ItemManager.get(id)).setCharacter(Character).getMainDiv()[0]
      resultarea.appendChild(t)
    }
    if (i < 10) {
      TWDS.createEle('button', {
        textContent: TWDS._('CALCULATOR_WEAR', 'wear'),
        dataset: {
          ids: JSON.stringify(o)
        },
        onclick: function () {
          const x = JSON.parse(this.dataset.ids)
          TWDS.wearItemsHandler(x)
        },
        last: resultarea
      })
    }
    const t = TWDS.bonuscalc.getComboBonus(o, true)
    TWDS.calculator.showbonus(t, resultarea)

    TWDS.createEle('hr', { last: resultarea, style: { clear: 'both' } })
  }
  TWDS.createEle({
    nodeName: 'h2',
    textContent: TWDS._('CALCULATOR_ITEMS', 'Items (w/o set bonus)'),
    last: resultarea
  })
  for (let slno = 0; slno < Wear.slots.length; slno++) {
    const slot = Wear.slots[slno]
    if (!(slot in gc.items)) continue
    const o = gc.items[slot]
    for (let i = 0; i < o.length; i++) {
      const id = o[i]
      const t = new tw2widget.InventoryItem(ItemManager.get(id)).setCharacter(Character).getMainDiv()[0]
      resultarea.appendChild(t)
    }
    TWDS.createEle('hr', { last: resultarea, style: { clear: 'both' } })
  }
}
TWDS.calculator.openwindow = function () {
  const myname = 'TWDS_calc_window'
  const win = wman.open(myname, TWDS._('CALCULATOR_TITLE', 'Calculator'), 'TWDS_calc_window')
  win.setMiniTitle('Calculator')

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_calc_container'
  })
  const presetarea = TWDS.createEle('div', {
    className: 'TWDS_calc_presetarea',
    last: content
  })
  const filterarea = TWDS.createEle('div', {
    className: 'TWDS_calc_filterarea',
    last: content
  })
  const selectarea = TWDS.createEle('div', {
    className: 'TWDS_calc_selectarea',
    last: content
  })
  const mainchangecb = function () {

  }

  let s = TWDS.createEle('select', { last: presetarea })
  TWDS.createEle('option', {
    last: s,
    value: 0,
    textContent: '---'
  })
  const allJobs = JobList.getSortedJobs('name')
  for (let i = 0; i < allJobs.length; i++) {
    TWDS.createEle('option', {
      last: s,
      value: allJobs[i].id,
      textContent: allJobs[i].name
    })
  }
  s.onchange = function () {
    const job = JobList.getJobById(this.value)
    const c = this.closest('.TWDS_calc_container')
    const inp = TWDS.q('.TWDS_calc_selectarea input', c)
    for (let i = 0; i < inp.length; i++) {
      if (inp[i].type !== 'radio') {
        inp[i].value = 0
      }
      if (job !== undefined) {
        const bo = inp[i].parentNode.dataset.bonusname
        if (job.skills[bo]) { inp[i].value = job.skills[bo] }
      }
    }
    if (job !== 'undefined') {
      const jpi = TWDS.q1('.joball input', c)
      if (jpi) {
        jpi.value = 1
      }
    }
  }

  s = TWDS.createEle('select', { last: presetarea })
  TWDS.createEle('option', {
    last: s,
    value: 0,
    textContent: '---'
  })
  for (let i = 0; i < TWDS.calculator.presets.length; i++) {
    const n = TWDS.calculator.presets[i].name
    const dis = TWDS.calculator.presets[i].disabled || false
    TWDS.createEle('option', {
      last: s,
      value: n,
      textContent: n,
      disabled: dis
    })
  }
  s.onchange = function () {
    const c = this.closest('.TWDS_calc_container')
    let preset = null
    for (let i = 0; i < TWDS.calculator.presets.length; i++) {
      const n = TWDS.calculator.presets[i].name
      if (n === this.value) {
        preset = TWDS.calculator.presets[i]
      }
    }
    const inp = TWDS.q('.TWDS_calc_selectarea input', c)
    for (let i = 0; i < inp.length; i++) {
      if (inp[i].type !== 'radio') {
        inp[i].value = 0
      }
    }
    if (preset !== null) {
      for (const k in preset) {
        if (k !== 'name') {
          for (let i = 0; i < inp.length; i++) {
            if (inp[i].parentNode.dataset.bonusname === k) {
              inp[i].value = preset[k]
            }
          }
        }
      }
    }
  }

  TWDS.createEle({ nodeName: 'span', textContent: TWDS._('CALCULATOR_INCLUDE', 'include '), beforeend: filterarea })
  TWDS.createEle({
    nodeName: 'label',
    children: [
      { nodeName: 'input', type: 'checkbox', value: 1, checked: true },
      { nodeName: 'span', textContent: TWDS._('CALCULATOR_OWNED', 'owned, ') }
    ],
    id: 'TWDS_CALC_include_owned',
    beforeend: filterarea
  })
  TWDS.createEle({
    nodeName: 'label',
    children: [
      { nodeName: 'input', type: 'checkbox', value: 2 },
      { nodeName: 'span', textContent: TWDS._('CALCULATOR_AUCTIONABLE', 'auctionable, ') }
    ],
    id: 'TWDS_CALC_include_auctionable',
    beforeend: filterarea
  })
  TWDS.createEle({
    nodeName: 'label',
    children: [
      { nodeName: 'input', type: 'checkbox', value: 4 },
      { nodeName: 'span', textContent: TWDS._('CALCULATOR_TOWN_TRADERS', 'town traders, ') }
    ],
    id: 'TWDS_CALC_include_tradeable',
    beforeend: filterarea
  })
  TWDS.createEle({
    nodeName: 'label',
    children: [
      { nodeName: 'input', type: 'checkbox', value: 8 },
      { nodeName: 'span', textContent: TWDS._('CALCULATOR_EVENTS', 'events and others, ') }
    ],
    id: 'TWDS_CALC_include_else',
    beforeend: filterarea
  })
  TWDS.createEle({
    nodeName: 'label',
    children: [
      { nodeName: 'span', textContent: TWDS._('CALCULATOR_AND', 'and ') },
      { nodeName: 'input', type: 'checkbox', value: 16 },
      { nodeName: 'span', textContent: TWDS._('CALCULATOR_UNWEARABLE', 'even unwearable items') }
    ],
    id: 'TWDS_CALC_include_unwearable',
    beforeend: filterarea
  })

  const boncb = function (desc, g) {
    const div = TWDS.createEle('div', {
      className: 'onebonus ' + desc.kind + ' ' + desc.name,
      dataset: { bonusname: desc.name, bonuskind: desc.kind },
      last: g
    })
    if (desc.title) div.title = desc.title
    else if (desc.kind === 'skill') {
      div.title = CharacterSkills.skills[desc.name].name
    }
    TWDS.createEle('img', {
      src: desc.img,
      alt: desc.name,
      last: div
    })
    TWDS.createEle('input', {
      type: 'number',
      className: 'value',
      value: 0,
      last: div,
      onchange: mainchangecb
    })
  }
  let g = null
  for (let i = 0; i < TWDS.calculator.data.length; i++) {
    const x = TWDS.calculator.data[i]
    if (x.kind === 'group') {
      g = TWDS.createEle('div', { className: 'TWDS_calc_group ' + x.cls, last: selectarea })
      continue
    }
    if (x.kind === 'weaponselect') {
      const ct = TWDS.createEle('div', { className: 'TWDS_calc_wgroup ', last: g, style: { verticalAlign: 'top' } })
      TWDS.createEle('label', {
        last: ct,
        children: [
          { nodeName: 'input', type: 'radio', name: 'wtype', value: 'egal', checked: true },
          { nodeName: 'span', textContent: '?', alt: 'any weapon type', style: { fontSize: '45px' } }
        ]
      })
      TWDS.createEle('label', {
        last: ct,
        children: [
          { nodeName: 'input', type: 'radio', name: 'wtype', value: 'shot' },
          { nodeName: 'img', src: '/images/items/right_arm/custom_special_revolver.png?5', alt: 'melee weapons', style: { width: '45px' } }
        ]
      })
      TWDS.createEle('label', {
        last: ct,
        children: [
          { nodeName: 'input', type: 'radio', name: 'wtype', value: 'melee' },
          { nodeName: 'img', src: '/images/items/right_arm/custom_special_tomahawk.png?5', alt: 'melee weapons', style: { width: '45px' } }
        ]
      })
      continue
    }
    if (x.kind === 'attr') {
      boncb(x, g)
    }
    if (x.kind === 'skill') {
      boncb(x, g)
    }
    if (x.kind === 'bonus') {
      boncb(x, g)
    }
  }
  const b = TWDS.createEle('button', {
    textContent: TWDS._('CALCULATOR_DOIT', 'calculate'),
    last: selectarea
  })
  const resultarea = TWDS.createEle('div', {
    last: content
  })
  b.onclick = function () {
    TWDS.calculator.exec(filterarea, selectarea, resultarea)
  }
  const e = []
  for (let i = 0; i < Wear.slots.length; i++) {
    const sl = Wear.slots[i]
    const item = Wear.get(sl)
    if (item !== undefined) {
      e.push(item.obj.item_id)
    }
  }
  TWDS.createEle('h3', { textContent: 'Your current equipment gives', last: resultarea })

  const t = TWDS.bonuscalc.getComboBonus(e, true)
  TWDS.calculator.showbonus(t, resultarea)

  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}
TWDS.registerStartFunc(function () {
  TWDS.delegate(document.body, 'click', '.TWDS_calc_window .item_inventory', function (ev) {
    const id = this.dataset.twds_item_id
    if (id) {
      const bi = Bag.getItemByItemId(id)
      if (bi) { // calculator may be used to find things to shop for.
        Wear.carry(bi)
      }
    }
  })
})

TWDS.registerExtra('TWDS.calculator.openwindow',
  TWDS._('CALCULATUR_EXTRA_TITLE', 'Calculator'),
  TWDS._('CALCULATOR_EXTRA_DESC', 'Job point / bonus calculator')
)
