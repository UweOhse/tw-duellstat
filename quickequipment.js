// vim: tabstop=2 shiftwidth=2 expandtab
//
//

TWDS.quickequipment = {}
TWDS.quickequipment.eventdata = {}
TWDS.quickequipment.control = [
  { level: 0, key: 'TW', text: 'TW Equipment Sets', handler: 'handletwselect', hassubmenu: true },
  { level: 0, key: 'CC', text: 'Clothcache Equipment Sets', handler: 'handleccselect', hassubmenu: true },
  { level: 0, key: 'TC', text: 'TW Calc Equipment Sets', handler: 'handletcselect', hassubmenu: true },
  { level: 0, key: 'speed', text: 'speed set', keepcached: true },
  { level: 0, key: 'speed/health', text: 'speed set w/o health loss', nocache: true },
  { level: 0, key: 'skill/health', text: 'max health', keepcached: true },
  { level: 0, key: 'bonus/regen', text: 'best regeneration', keepcached: true },
  { level: 0, key: 'bonus', text: 'bonus equipment', hassubmenu: true },
  { level: 1, key: 'bonus/regen', text: 'regeneration', submenu: 'bonus', keepcached: true },
  { level: 1, key: 'bonus/luck+dollar', text: 'luck+money', submenu: 'bonus', keepcached: true },
  { level: 1, key: 'bonus/luck+drop', text: 'luck+drop', submenu: 'bonus', keepcached: true },
  { level: 1, key: 'bonus/luck', text: 'luck', submenu: 'bonus', keepcached: true },
  { level: 1, key: 'bonus/pray', text: 'pray', submenu: 'bonus', keepcached: true },
  { level: 1, key: 'bonus/dollar', text: 'money', submenu: 'bonus', keepcached: true },
  { level: 1, key: 'bonus/drop+dollar', text: 'drop+money', submenu: 'bonus', keepcached: true },
  { level: 1, key: 'bonus/drop', text: 'drop', submenu: 'bonus', keepcached: true },
  { level: 1, key: 'bonus/experience', text: 'experience', submenu: 'bonus', keepcached: true },
  { level: 1, key: 'bonus/experience+experience+dollar', text: 'experience*2+money', submenu: 'bonus', keepcached: true },

  { level: 0, key: 'skill', text: 'skills', hassubmenu: true },
  { level: 0, key: 'duel', text: 'duels', hassubmenu: true },
  { level: 0, key: 'battle', text: 'fort battles', hassubmenu: true },
  { level: 0, key: 'construction', text: 'construction', keepcached: true },
  { level: 0, key: 'saved', text: 'saved searches', hassubmenu: true },
  { level: 0, key: 'cacherebuild', text: 'rebuild cache' }
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
    if (TWDS.quickequipment.control[i].key === 'saved') {
      const sav = TWDS.calculator.getsavedlist()
      if (sav.length) {
        for (let j = 0; j < sav.length; j++) {
          const n = sav[j]
          TWDS.quickequipment.control.push({
            level: 1,
            key: 'saved/' + n,
            text: n,
            submenu: 'saved'
          })
        }
      }
    }
  }
  const presetlist = TWDS.calculator.presets
  for (let i = 0; i < presetlist.length; i++) {
    const pre = presetlist[i]
    if (pre.type === 'duel') {
      TWDS.quickequipment.control.push({
        level: 1,
        key: 'calculator/' + pre.name,
        text: pre.name,
        submenu: 'duel',
        keepcached: true
      })
    }
  }
  for (let i = 0; i < presetlist.length; i++) {
    const pre = presetlist[i]
    if (pre.type === 'battle') {
      TWDS.quickequipment.control.push({
        level: 1,
        key: 'calculator/' + pre.name,
        text: pre.name,
        submenu: 'battle',
        keepcached: true
      })
    }
  }
  console.log('CTRL', TWDS.quickequipment.control)
  // other variable stuff? like saved user searches?
}
TWDS.quickequipment.fillcontrollist()
TWDS.quickequipment.cache = { }
TWDS.quickequipment.used = { }

TWDS.quickequipment.calc = function (key) {
  const calcsub = function (preset) {
    const o = {}
    const p = {}
    for (const [k, v] of Object.entries(preset)) {
      if (k === 'name') continue
      if (k === 'type') continue
      if (k === 'alias') continue
      if (k in CharacterSkills.attributes ||
        k in CharacterSkills.skills) {
        o[k] = v
      } else {
        p[k] = v
      }
    }
    return TWDS.genCalc(p, o)
  }
  if (key === 'speed') {
    return TWDS.speedcalc.doit(1, 0)
  }
  if (key === 'speed/health') {
    return TWDS.speedcalc.doit(1, 1)
  }
  if (key.startsWith('skill/')) {
    const skill = key.substring(6)
    const p = {}
    p[skill] = 1
    return TWDS.genCalc({}, p)
  }
  if (key.startsWith('bonus/')) {
    const str = key.substring(6)
    const parts = str.split(/\+/)
    const p = {}
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (!(part in p)) p[part] = 0
      p[part]++
    }
    return TWDS.genCalc(p, {})
  }
  if (key === 'construction') {
    return TWDS.genCalc({ job_1000: 1, joball: 1 }, { build: 3, repair: 1, leadership: 1, joball: 1, job_1000: 1 })
  }
  if (key.startsWith('saved/')) {
    const str = key.substring(6)
    const preset = TWDS.calculator.findsaved(str)
    if (!preset) return
    return calcsub(preset)
  }
  if (key.startsWith('calculator/')) {
    const str = key.substring(11)
    const preset = TWDS.calculator.findpreset(str)
    if (!preset) return
    return calcsub(preset)
  }
  return null
}
TWDS.quickequipment.cacheone = function (key, val) {
  TWDS.quickequipment.cache[key] = {
    value: val,
    invid: Bag.getLastInvId(),
    ts: (new Date()).getTime()
  }
}
TWDS.quickequipment.getfromcache = function (key) {
  if (!(key in TWDS.quickequipment.cache)) return null
  const e = TWDS.quickequipment.cache[key]
  if (e.invid === Bag.getLastInvId()) return e.value
  const ts = (new Date()).getTime()
  const delta = (ts - e.ts) / 1000
  if (delta > TWDS.settings.quickequipment_cachetime_minutes * 60) return null
  return e.value
}
TWDS.quickequipment.getused = function () {
  const u = {}
  for (const [k, e] of Object.entries(TWDS.quickequipment.cache)) {
    const ids = e.value
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      if (!(id in u)) { u[id] = [] }
      u[id].push(k)
    }
  }
  return u
}
TWDS.quickequipment.buildcache = function () {
  TWDS.quickequipment.cache = {}
  const myname = 'TWDS_qe_tmp'
  const win = wman.open(myname, TWDS._('QE_PROGRESS_TITLE', 'Progress'))
  win.setMiniTitle('Progress')
  const sp = new west.gui.Scrollpane()

  const div = TWDS.createEle('div')
  const p1 = TWDS.createEle('p', {
    last: div,
    textContent: 'Status: '
  })
  TWDS.createEle('p', {
    last: div,
    innerHTML: 'You usually do not need to rebuild the cache. The only reasons to do so are:' +
     '<ul><li>1. you got some seriously good equipment, and need to use it at once.' +
     "<li>2. you want to sell/auction some stuff and need to know what's really not useful.</ul>"
  })
  const sta = TWDS.createEle('span', { last: p1 })

  const tab = TWDS.createEle('table', {
    last: div,
    children: [
      {
        nodeName: 'tr',
        children: [
          { nodeName: 'th', textContent: 'ms' },
          { nodeName: 'th', textContent: 'set' }
        ]
      }
    ]
  })
  sp.appendContent(div)

  win.appendToContentPane(sp.getMainDiv())

  const ostart = (new Date()).getTime()
  const handler = function (i) {
    const e = TWDS.quickequipment.control[i]
    sta.textContent = i + ' / ' + TWDS.quickequipment.control.length
    const start = (new Date()).getTime()
    if (!e.nocache && e.keepcached) {
      const key = e.key
      const res = TWDS.quickequipment.calc(key)
      if (res !== null) {
        TWDS.quickequipment.cacheone(key, res)
      }
      const end = (new Date()).getTime()
      const tr = TWDS.createEle('tr', { last: tab })
      TWDS.createEle('td', {
        last: tr,
        textContent: end - start
      })
      TWDS.createEle('td', {
        last: tr,
        textContent: e.key
      })
    }
    const cur = (new Date()).getTime()
    if (i + 1 < TWDS.quickequipment.control.length && cur < ostart + 5 * 60 * 1000) {
      setTimeout(handler, 100, i + 1)
      return
    }
    TWDS.quickequipment.save()
    TWDS.clothcache.recalcItemUsage()
    const tr = TWDS.createEle('tr', { last: tab })
    TWDS.createEle('td', {
      last: tr,
      textContent: cur - ostart
    })
    TWDS.createEle('td', {
      last: tr,
      textContent: 'ms total runtime'
    })
    sta.textContent = 'finished.'
  }
  handler(0)
}
TWDS.quickequipment.save = function () {
  window.localStorage.TWDS_cache_quickequipment = JSON.stringify(TWDS.quickequipment.cache)
}
TWDS.quickequipment.load = function () {
  const t = window.localStorage.TWDS_cache_quickequipment || '{}'
  try {
    TWDS.quickequipment.cache = JSON.parse(t)
  } catch (e) {
    console.error('loading quickequipment cache', e)
    TWDS.quickequipment.cache = {}
  }
  TWDS.clothcache.recalcItemUsage()
}
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

TWDS.quickequipment.handleitemlistselect = function (cat) {
  const o = JSON.parse(cat)
  TWDS.wearItemsHandler(o)
}
TWDS.quickequipment.handletwselect = function (cat) {
  window.EquipManager.switchEquip(cat)
}

TWDS.quickequipment.handlecatselect = function (cat) {
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

  if (cat === 'cacherebuild') {
    TWDS.quickequipment.buildcache()
    return
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
      names.push([o.name, JSON.stringify(o.item_ids)])
    }
    submenu(names, 'handleitemlistselect')
    return
  }
  // show menu for TWCalc equipment sets.
  if (cat === 'TC') {
    const str = localStorage.TWCalc_Wardrobe
    if (str) {
      const js = JSON.parse(str)
      if (js) {
        const names = []
        for (let i = 0; i < js.length; i++) {
          const o = js[i]
          names.push([o.name, JSON.stringify(o.items)])
        }
        submenu(names, 'handleitemlistselect')
      }
    }
    return
  }

  // the calculated stuff. First the cache
  let res = TWDS.quickequipment.getfromcache(cat)
  if (res) {
    TWDS.wearItemsHandler(res)
    return
  }
  // recalc if needed
  res = TWDS.quickequipment.calc(cat)
  if (res !== null) {
    let nocache = 0
    const cs = TWDS.quickequipment.control
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i]
      if (c.key === cat) {
        if (c.nocache) {
          nocache = 1
          break
        }
      }
    }
    if (!nocache) {
      TWDS.quickequipment.cacheone(cat, res)
      TWDS.quickequipment.save()
      TWDS.clothcache.recalcItemUsage()
    }
    TWDS.wearItemsHandler(res)
    return
  }

  if (cat === 'duel' || cat === 'battle' || cat === 'bonus' || cat === 'skill' || cat === 'saved') {
    const names = []
    const cs = TWDS.quickequipment.control
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i]
      if (c.submenu === cat) {
        names.push([c.text, c.key])
      }
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
    let t = c.text
    if (c.hassubmenu) { t += ' \u2192' }
    sb.addItem(c.key, t)
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
  TWDS.registerSetting('int', 'quickequipment_cachetime_minutes',
    TWDS._('QUICKEQUIPMENT_CACHETIME_MINUTES',
      "Cache 'quick equipment' for that many minutes."),
    60, null, 'misc', 'quickequipment')
  TWDS.quickequipment.load()
})
