// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.overlay = {}
TWDS.overlay.eq = null
TWDS.overlay.getEquipmentData = function () {
  TWDS.overlay.eq = null // for now
  if (TWDS.overlay.eq === null) {
    const data = TWDS.getEquipmentData()
    TWDS.overlay.eq = JSON.parse(data[1])
  }
  return TWDS.overlay.eq
}
TWDS.overlay.interpret = function (work) {
  TWDS.overlay.eq = null
  for (let i = 0; i < TWDS.overlay.patterns.length; i++) {
    const triple = TWDS.overlay.patterns[i]
    work = work.replace(triple[0], triple[2])
  }
  return work
}
TWDS.overlay.show = function () {
  while (true) {
    const x = TWDS.q1('.TWDS_overlay')
    if (x) x.remove()
    else break
  }
  const windows = TWDS.q1('#windows')
  console.log('WIN', windows)

  let pos = window.localStorage.TWDS_overlay_pos
  if (pos) pos = JSON.parse(pos)
  else {
    pos = {
      left: 210,
      top: 10
    }
  }
  TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_overlay',
    draggable: true,
    children: [
      { nodeName: 'div', className: 'basedata' },
      { nodeName: 'div', className: 'dueldata' },
      { nodeName: 'div', className: 'bonusdata' },
      { nodeName: 'div', className: 'note', contentEditable: true }
    ],
    beforeend: windows
  })
  TWDS.overlay.reposition(pos)
  TWDS.overlay.update()
}
TWDS.overlay.getbasedata = function () {
  let s =
      Game.InfoHandler.getLocalString4Charclass(Character.charClass) +
   ' ' + Character.level + ', ' +
      Game.InfoHandler.getLocalString4ProfessionId(Character.professionId)
  if (Character.professionId !== null) { s += ' ' + Character.professionSkill }
  s += ', ' + TWDS._('SPEED', 'Speed') + ' ' + Math.round(TWDS.bonuscalc.getSpeed()) + '%'
  return s
}
/*
TWDS.overlay.getregendata = function () {
  let dur = ((Character.maxEnergy - Character.energy) / (Character.energyRegen * Character.maxEnergy) * 3600)
  const now = new Date().getTime()
  let d1, d2
  if (dur > 12 * 3600) {
    d1 = new Date(now + dur * 1000).toLocaleString()
  } else {
    d1 = new Date(now + dur * 1000).toLocaleTimeString()
  }
  dur = ((Character.maxHealth - Character.health) / (Character.healthRegen * Character.maxHealth) * 3600)
  if (dur > 12 * 3600) {
    d2 = new Date(now + dur * 1000).toLocaleString()
  } else {
    d2 = new Date(now + dur * 1000).toLocaleTimeString()
  }
  let s = TWDS._('OVERLAY_FULL_HEALTH', 'Full health') + ': ' + d2 + '<br>'
  s += TWDS._('OVERLAY_FULL_ENERGY', 'Full energy') + ': ' + d1
  return s
}
*/
TWDS.overlay.getdueldata = function () {
  const eq = TWDS.overlay.getEquipmentData()
  let s
  s = TWDS._('DUEL_LEVEL', 'Duel level') + ' ' + Character.duelLevel +
    ' (' + Math.ceil(5 * Character.duelLevel / 7) + '-' + Math.ceil(7 * Character.duelLevel / 5) + ')'
  s += '<br>'
  s += TWDS.classifyEquipment(eq)
  s += '<table>'
  s += '<tr>'
  s += '<th>' + CharacterSkills.keyNames.appearance + '<td>' + eq.auft
  s += '<th>' + CharacterSkills.keyNames.tactic + '<td>' + eq.takt
  s += '<tr>'
  s += '<th>' + CharacterSkills.keyNames.aim + '<td>' + eq.ziel
  s += '<th>' + CharacterSkills.keyNames.dodge + '<td>' + eq.ausw
  s += '<tr>'
  s += '<th>' + CharacterSkills.keyNames[eq.shot ? 'shot' : 'punch']
  s += '<td>' + (eq.shot ? eq.schuss : eq.schlag)
  s += '<th>' + TWDS._('OVERLAY_RES_MELEE', 'Resist./Melee') + '<td>' + eq.wid_schlag
  s += '<tr>'
  const dmg = ((eq.dmg_min + eq.dmg_max) / 2).toFixed(1)
  s += '<th>' + TWDS._('DAMAGE', 'Damage') + '<td>' + dmg
  s += '<th>' + TWDS._('OVERLAY_RES_SHOT', 'Resist./Shot') + '<td>' + eq.wid_schuss
  s += '<tr>'
  s += '<th title="'
  s += TWDS._('OVERLAY_LEVELEQ_TITLE',
    'You would need about that level to reach the same skill level without equipment.')
  s += '">'
  s += TWDS._('OVERLAY_LEVELEQ', '~Level')
  if (eq.leveleq_attack === eq.leveleq_defense) {
    s += '<td>'
    s += eq.leveleq_attack
  } else {
    s += '<td>' + eq.leveleq_attack
    s += '<th>'
    s += '<td>' + eq.leveleq_defense
  }
  s += '</table>'
  return s
}
TWDS.overlay.getbonusdata = function () {
  const bo = TWDS.bonuscalc.getComboBonus()
  const a = []
  if (bo.luck) a.push([bo.luck * 100, true, TWDS._('BONUS_LUCK', 'Luck')])
  if (bo.dollar) a.push([bo.dollar * 100, true, TWDS._('BONUS_DOLLAR', 'Money')])
  if (bo.regen) a.push([bo.regen * 100, true, TWDS._('BONUS_REGEN', 'Regeneration')])
  if (bo.pray) a.push([bo.regen * 100, false, TWDS._('BONUS_PRAY', 'Praying')])
  // if (bo.speed) a.push([bo.speed*100, 'speed'])
  if (bo.experience) a.push([bo.experience * 100, true, TWDS._('BONUS_EXPERIENCE', 'Experience')])
  if (bo.drop) a.push([bo.drop * 100, true, TWDS._('BONUS_DROP', 'Product drop chance')])

  a.sort(function (x, y) {
    return y[0] - x[0]
  })
  const b = []
  for (let i = 0; i < a.length; i++) {
    let perc = ''
    if (a[i][1]) { perc = '%' }

    b.push('+' + Math.round(a[i][0]) + perc + ' ' + a[i][2])
  }
  console.log('GBD', b, b.join(', '))
  return b.join(', ')
}
TWDS.overlay.getnote = function () {
  let text = window.localStorage.TWDS_overlay_free
  if (!text) { text = 'click to edit' }
  return text
}
TWDS.overlay.update = function () {
  const cfg = [
    ['overlay_basics', '.TWDS_overlay .basedata', TWDS.overlay.getbasedata],
    ['overlay_duel', '.TWDS_overlay .dueldata', TWDS.overlay.getdueldata],
    ['overlay_bonus', '.TWDS_overlay .bonusdata', TWDS.overlay.getbonusdata],
    ['overlay_note', '.TWDS_overlay .note', TWDS.overlay.getnote]
  ]
  for (let i = 0; i < cfg.length; i++) {
    const sn = cfg[i][0]
    const sel = cfg[i][1]
    const cb = cfg[i][2]
    const e = TWDS.q1(sel)
    if (e) { // the thing might not be in the dom.
      if (TWDS.settings[sn]) {
        e.innerHTML = cb()
        e.style.display = 'block'
      } else {
        e.style.display = 'none'
      }
    }
  }
}
TWDS.overlay.blur = function (ev) {
}
TWDS.overlay.reposition = function (pos) {
  const ele = TWDS.q1('.TWDS_overlay')
  if (!ele) { return }
  ele.style.left = ''
  ele.style.top = ''
  ele.style.bottom = ''
  ele.style.right = ''
  if (pos.top) ele.style.top = pos.top + 'px'
  if (pos.bottom) ele.style.bottom = pos.bottom + 'px'
  if (pos.left) ele.style.left = pos.left + 'px'
  if (pos.right) ele.style.right = pos.right + 'px'
}
TWDS.overlay.inputevent = function (ev) {
  const text = TWDS.q1('.TWDS_overlay .note').innerHTML
  window.localStorage.TWDS_overlay_free = text
  ev.preventDefault()
  console.log('INPUT end')
  return true
}
TWDS.overlay.click = function (ev) {
  console.log('click', ev)
  if (ev.target.closest('.TWDS_overlay .note')) { return }
  TWDS.opentab('settings', "[data-setting-name='overlay_use']")
}
TWDS.overlay.dragstart = function (ev) {
  TWDS.overlay.xoff = ev.offsetX
  TWDS.overlay.yoff = ev.offsetY
}
TWDS.overlay.cbchange = function () {
  TWDS.overlay.update()
}
TWDS.overlay.dragend = function (ev) {
  const ele = TWDS.q1('.TWDS_overlay')
  const bound = ele.getBoundingClientRect()
  const x = ev.clientX - TWDS.overlay.xoff
  const y = ev.clientY - TWDS.overlay.yoff
  const pos = { }
  if (x > window.innerWidth / 2) {
    pos.right = window.innerWidth - x - bound.width
  } else {
    pos.left = x
  }
  if (y > window.innerHeight / 2) {
    pos.bottom = window.innerHeight - y - bound.height
  } else {
    pos.top = y
  }
  window.localStorage.TWDS_overlay_pos = JSON.stringify(pos)
  TWDS.overlay.reposition(pos)
}

TWDS.overlay.settingchanged = function () {
  const ele = TWDS.q1('.TWDS_overlay')
  console.log('SS', ele)
  if (!TWDS.settings.overlay_use) {
    if (ele) ele.remove()
    return
  }
  if (!ele) {
    TWDS.overlay.show()
  }
  TWDS.overlay.update()
}

TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'overlay_use', 'show an information overlay on the screen.',
    false, TWDS.overlay.settingchanged, 'Overlay', null, 1)
  TWDS.registerSetting('bool', 'overlay_basics', 'show basic information in the overlay (Class, profession, levels)',
    true, TWDS.overlay.settingchanged, 'Overlay', null, 2)
  TWDS.registerSetting('bool', 'overlay_duel', 'show duel information in the overlay (your values in the current equipment)',
    true, TWDS.overlay.settingchanged, 'Overlay', null, 3)
  TWDS.registerSetting('bool', 'overlay_bonus', 'show bonus information in the overlay (the bonus of the current equipment)',
    true, TWDS.overlay.settingchanged, 'Overlay', null, 4)
  TWDS.registerSetting('bool', 'overlay_note', 'show an editable notebook on the overlay',
    true, TWDS.overlay.settingchanged, 'Overlay', null, 5)
  // inventory_changed is called after crafting, when the craft skill may have changed.
  window.EventHandler.listen(['wear_changed', 'character_level_up', 'inventory_changed'], function () {
    TWDS.overlay.update()
  })

  TWDS.delegate(document, 'click', '.TWDS_overlay', function (ev) {
    TWDS.overlay.click(ev)
  })
  TWDS.delegate(document, 'click', '.TWDS_overlay input[type=checkbox]', function (ev) {
    TWDS.overlay.cbchange(ev)
  })
  TWDS.delegate(document, 'input', '.TWDS_overlay [contenteditable]', function (ev) {
    TWDS.overlay.inputevent(ev)
  })
  TWDS.delegate(document, 'dragstart', '.TWDS_overlay', function (ev) {
    TWDS.overlay.dragstart(ev)
  })
  TWDS.delegate(document, 'dragend', '.TWDS_overlay', function (ev) {
    TWDS.overlay.dragend(ev)
  })
})
