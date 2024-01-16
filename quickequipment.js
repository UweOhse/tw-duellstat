// vim: tabstop=2 shiftwidth=2 expandtab
//
//

TWDS.quickequipment = {}
TWDS.quickequipment.eventdata = {}
TWDS.quickequipment.control = [
  { level: 0, key: 'TW', text: 'TW Equipment Sets', handler: 'handletwselect' },
  { level: 0, key: 'CC', text: 'Clothcache Equipment Sets', handler: 'handleccselect' },
  { level: 0, key: 'TC', text: 'TW Calc Equipment Sets', handler: 'handletcselect' },
  { level: 0, key: 'speed', text: 'speed set' },
  { level: 0, key: 'speed/health', text: 'speed set w/o health loss' },
  { level: 0, key: 'skill/health', text: 'max health' },
  { level: 0, key: 'bonus/regen', text: 'best regeneration' },
  { level: 0, key: 'bonus', text: 'bonus equipment' },
  { level: 1, key: 'bonus/experience', text: 'experience', submenu: 'bonus' },
  { level: 1, key: 'bonus/regen', text: 'regeneration', submenu: 'bonus' },
  { level: 1, key: 'bonus/luck+dollar', text: 'luck+money', submenu: 'bonus' },
  { level: 1, key: 'bonus/luck+drop', text: 'luck+drop', submenu: 'bonus' },
  { level: 1, key: 'bonus/luck', text: 'luck', submenu: 'bonus' },
  { level: 1, key: 'bonus/pray', text: 'pray', submenu: 'bonus' },
  { level: 1, key: 'bonus/dollar', text: 'money', submenu: 'bonus' },
  { level: 1, key: 'bonus/drop+dollar', text: 'drop+money', submenu: 'bonus' },
  { level: 1, key: 'bonus/experience+experience+dollar', text: 'experience*2+money', submenu: 'bonus' },

  { level: 0, key: 'skill', text: 'skills' },
  { level: 0, key: 'duel', text: 'duels' },
  { level: 0, key: 'battle', text: 'fort battles' },
  { level: 1, key: 'calculator/tank/att', text: 'tank/att' },
  { level: 1, key: 'calculator/tank/def', text: 'tank/def' },
  { level: 1, key: 'calculator/dmg/att', text: 'dmg/att' },
  { level: 1, key: 'calculator/dmg/def', text: 'dmg/def' },
  { level: 1, key: 'calculator/booster/damage', text: 'booster/damage' },
  { level: 1, key: 'calculator/booster/generic', text: 'booster/generic' },
  { level: 0, key: 'construction', text: 'construction' }
]
TWDS.quickequipment.fillcontrollist = function () {
  for (let i = 0; i < TWDS.quickequipment.control.length; i++) {
    if (TWDS.quickequipment.control[i].key === 'skill') {
      for (let j = 0; j < CharacterSkills.allSkillKeys.length; j++) {
        const sk = CharacterSkills.allSkillKeys[j]
        const n = CharacterSkills.keyNames[sk]
        TWDS.quickequipment.control.push({
          level: 1,
          key: 'skill/' + sk,
          text: n,
          submenu: 'skill'
        })
      }
    }
  }
  // other variable stuff? like saved user searches?
}
TWDS.quickequipment.fillcontrollist()
TWDS.quickequipment.cache = { id: 0, data: {} }
TWDS.quickequipment.mayclearcache = function () {
  const last = Bag.getLastInvId()
  if (TWDS.quickequipment.cache.id === last) {
    return
  }
  const ids = Bag.getInventoryIds()
  const cleared = 0
  for (let i = 0; i < ids.length; i++) {
    const invid = ids[i]
    if (invid < TWDS.quickequipment.cache.id) continue
    const it = Bag.getItemByInvId(invid)
    if (it.usetype) continue // not wearable
    if (it.usebonus !== null) continue
    let withbonus = 0
    if (it.bonus.attributes.length) withbonus = 1
    if (it.bonus.skills.length) withbonus = 1
    if (it.bonus.item.length) withbonus = 1
    if (it.bonus.fortbattle.offense) withbonus = 1
    if (it.bonus.fortbattle.defense) withbonus = 1
    if (it.bonus.fortbattle.resistance) withbonus = 1
    if (it.bonus.fortbattlesector.offense) withbonus = 1
    if (it.bonus.fortbattlesector.defense) withbonus = 1
    if (it.bonus.fortbattlesector.damage) withbonus = 1
    if (!withbonus) continue

    TWDS.quickequipment.cache.data = {}
    console.log('QE', 'cleared cache because of', it)
    break
  }
  return cleared
}

TWDS.quickequipment.handleccselect = function (cat) {
  console.log('TW', cat)
  const tmp = window.localStorage.getItem(cat)
  if (!tmp) return
  const o = JSON.parse(tmp)
  TWDS.wearItemsHandler(o.item_ids)
}
TWDS.quickequipment.handletwselect = function (cat) {
  console.log('CC', cat)
  window.EquipManager.switchEquip(cat)
}

TWDS.quickequipment.handlecatselect = function (cat) {
  console.log('cat', cat)

  const submenu = function (names, handlername) {
    names.sort(function (a, b) {
      return a[0].localeCompare(b[0])
    })
    const sb = (new west.gui.Selectbox(true))
      .setHeight('347px')
      .setWidth('260px')
      .addListener(function (choice) {
        TWDS.quickequipment[handlername](choice)
        sb.hide()
      })
    for (let i = 0; i < names.length; i++) {
      sb.addItem(names[i][1], names[i][0])
    }
    sb.show(TWDS.quickequipment.eventdata)
  }

  // show menu for TW equipment sets.
  if (cat === 'TW') {
    Ajax.remoteCallMode('inventory', 'show_equip', {}, function (data) {
      const names = []
      for (let i = 0; i < data.data.length; i++) {
        names.push([data.data[i].name, data.data[i].equip_manager_id])
      }
      submenu(names, 'handletwselect')
    })
    return
  }

  // show menu for CC equipment sets.
  if (cat === 'CC') {
    const names = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (!k.match(/^TWDS_h_/)) {
        continue
      }
      const s = window.localStorage.getItem(k)
      const o = JSON.parse(s)
      names.push([o.name, k])
    }
    submenu(names, 'handleccselect')
    return
  }

  if (cat === 'speed') {
    const out = TWDS.speedcalc.doit(1, 0)
    TWDS.wearItemsHandler(out)
    return
  }
  if (cat === 'speed/health') {
    const out = TWDS.speedcalc.doit(1, 1)
    console.log('S/H', out)
    TWDS.wearItemsHandler(out)
    return
  }
  if (cat.startsWith('skill/')) {
    const skill = cat.substring(6)
    const p = {}
    p[skill] = 1
    const out = TWDS.genCalc({}, p)
    TWDS.wearItemsHandler(out)
    return
  }
  if (cat.startsWith('bonus/')) {
    const str = cat.substring(6)
    const parts = str.split(/\+/)
    const p = {}
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (!(part in p)) p[part] = 0
      p[part]++
    }
    const out = TWDS.genCalc(p, {})
    TWDS.wearItemsHandler(out)
    return
  }
  if (cat === 'construction') {
    const items = TWDS.genCalc({ job_1000: 1, joball: 1 }, { build: 3, repair: 1, leadership: 1, joball: 1, job_1000: 1 })
    TWDS.wearItemsHandler(items)
    return
  }
  if (cat.startsWith('calculator/')) {
    const str = cat.substring(11)
    const preset = TWDS.calculator.findpreset(str)
    if (!str) return

    const o = {}
    const p = {}
    for (const [k, v] of Object.entries(preset)) {
      if (k === 'name') continue
      if (k === 'type') continue
      if (k in CharacterSkills.attributes ||
        k in CharacterSkills.skills) {
        o[k] = v
      } else {
        p[k] = v
      }
    }
    console.log('o', o)
    console.log('p', p)
    const out = TWDS.genCalc(p, o)
    TWDS.wearItemsHandler(out)
    return
  }
  if (cat === 'duel') {
    const names = []
    const presetlist = TWDS.calculator.presets
    for (let i = 0; i < presetlist.length; i++) {
      const pre = presetlist[i]
      console.log('consider', i, pre)
      if (pre.type === 'duel') {
        names.push([pre.name, 'calculator/' + pre.name])
      }
    }
    submenu(names, 'handlecatselect')
    return
  }
  if (cat === 'battle') {
    const names = []

    names.push(['tank/att', 'calculator/tank/att'])
    names.push(['tank/def', 'calculator/tank/def'])
    names.push(['dmg/att', 'calculator/dmg/att'])
    names.push(['dmg/def', 'calculator/dmg/def'])
    names.push(['booster/damage', 'calculator/booster/damage'])
    names.push(['booster/generic', 'calculator/booster/generic'])
    submenu(names, 'handlecatselect')
    return
  }
  if (cat === 'bonus') {
    const names = []
    names.push(['experience', 'bonus/experience'])
    names.push(['regeneration', 'bonus/regen'])
    names.push(['luck+money', 'bonus/luck+dollar'])
    names.push(['luck+drop', 'bonus/luck+drop'])
    names.push(['luck', 'bonus/luck'])
    names.push(['pray', 'bonus/pray'])
    names.push(['money', 'bonus/dollar'])
    names.push(['drop', 'bonus/drop'])
    names.push(['drop+money', 'bonus/drop+dollar'])
    names.push(['experience*2+money', 'bonus/experience+experience+dollar'])
    submenu(names, 'handlecatselect')
    return
  }
  if (cat === 'skill') {
    const names = []
    for (let i = 0; i < CharacterSkills.allSkillKeys.length; i++) {
      const sk = CharacterSkills.allSkillKeys[i]
      names.push([CharacterSkills.keyNames[sk], 'skill/' + sk])
    }
    submenu(names, 'handlecatselect')
  }
}
TWDS.quickequipment.handlemainclick = function (eventdata) {
  const sb = (new west.gui.Selectbox(true))
    .setHeight('347px')
    .setWidth('260px')
    .addListener(function (choice) {
      TWDS.quickequipment.handlecatselect(choice)
      sb.hide()
    })
  for (let i = 0; i < TWDS.quickequipment.control.length; i++) {
    const c = TWDS.quickequipment.control[i]
    if (c.level) continue
    sb.addItem(c.key, c.text)
  }
  sb.show(eventdata)
  TWDS.quickequipment.eventdata = eventdata
}

TWDS.quickequipment.setcharmenulink = function () {
  const ucc = TWDS.q1('#ui_character_container')
  if (ucc) {
    const old = TWDS.q1('.TWDS_quickequipment_shirt', ucc)
    if (old) old.remove()
    if (TWDS.settings.quickequipment_charcontainer) {
      TWDS.createEle({
        nodeName: 'div.TWDS_quickequipment_shirt',
        children: [
          {
            nodeName: 'span.menulink.lfriends',
            onclick: function (e) { TWDS.quickequipment.handlemainclick(e) }
          }
        ],
        last: ucc
      })
    }
  }
}
TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'quickequipment_charcontainer',
    TWDS._('QUICKEQUIPMENT_CHARCONTAINER',
      'Add a quick equipment switch menu to the character information container, next to the daily tasks link.'),
    true, function () { TWDS.quickequipment.setcharmenulink() }, 'misc', 'quickequipment')
})
