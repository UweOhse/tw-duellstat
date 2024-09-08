TWDS.equipmenttab = {}
TWDS.describeItemCombo = function (singleItems) {
  const setsInUse = {}
  const setNames = []
  const names = []
  const setlist = west.storage.ItemSetManager._setList
  for (let i = 0; i < singleItems.length; i++) {
    if (typeof singleItems[i] === 'number') {
      const ii = singleItems[i]
      let obj = ItemManager.get(ii)
      if (typeof obj === 'undefined') {
        // work around clothcalc
        if (typeof ItemManager.__twdb__get === 'function') {
          obj = ItemManager.__twdb__get(ii)
        }
      }
      if (typeof obj === 'undefined') {
        continue
      }
      singleItems[i] = obj
    }
  }
  for (let i = 0; i < singleItems.length; i++) {
    const item = singleItems[i]
    if (item === undefined) continue
    const set = item.set
    if (!(set in setlist)) continue
    if (!(set in setsInUse)) {
      setsInUse[set] = []
    }
    setsInUse[set].push(item.item_base_id)
  }

  const numDuelWeaponsInSet = function (set) {
    const setItems = setlist[set].items
    let numDuelweaponsContained = 0
    for (let i = 0; i < setItems.length; i++) {
      const item = ItemManager.getByBaseId(setItems[i])
      if (item.type === 'right_arm' || item.type === 'left_arm') {
        numDuelweaponsContained++
      }
    }
    return numDuelweaponsContained
  }

  for (const i in setsInUse) {
    const setItemCount = setlist[i].items.length
    const setItemsWorn = setsInUse[i].length
    if (setItemsWorn === 1) {
      continue
    }
    const nd = numDuelWeaponsInSet(i)
    let name = ''
    if (setItemCount !== setItemsWorn) {
      if (nd > 1 && setItemsWorn === setItemCount - 1) {
        name = setlist[i].name
      } else {
        name = setlist[i].name + ' (' + setItemsWorn + '/' + setItemCount + ')'
      }
    } else {
      name = setlist[i].name
    }
    if (nd > 0) {
      if (Wear.wear.right_arm) {
        if (Wear.wear.right_arm.obj.sub_type === 'shot') {
          name += TWDS._('SHORT_SHOTWEAPON', ' (shot)')
        } else if (Wear.wear.right_arm.obj.sub_type !== 'shot') {
          name += TWDS._('SHORT_MELEEWEAPON', ' (melee)')
        }
      }
    }
    names.push(name)
  }
  setNames.sort()

  for (let i = 0; i < singleItems.length; i++) {
    const item = singleItems[i]
    if (item === undefined) continue
    const set = item.set
    if (!(set in setsInUse) || setsInUse[set].length < 2) {
      names.push(item.name)
    }
  }

  names.sort()
  let is = ''
  for (let i = 0; i < setNames.length; i++) {
    if (is > '') { is += ', ' }
    is += setNames[i]
  }
  for (let i = 0; i < names.length; i++) {
    if (is > '') { is += ', ' }
    is += names[i]
  }
  return is
}
// reading the current skill values, and the items
TWDS.getEquipmentData = function (noskills) {
  const getOne = function (s) {
    const x = CharacterSkills.getSkill(s)
    if (noskills) return x.bonus
    return x.bonus + x.points
  }
  const schlag = getOne('punch')
  const zaeh = getOne('tough')
  const hp = getOne('health')
  const refl = getOne('reflex')
  const ausw = getOne('dodge')
  const ziel = getOne('aim')
  const schuss = getOne('shot')
  const takt = getOne('tactic')
  const auft = getOne('appearance')
  const meleeRes = zaeh + refl / 4
  const shotRes = refl + zaeh / 4
  const setNames = []
  const names = []
  const ids = []

  const singleItems = []
  const setsInUse = {}
  for (const item of Object.keys(Wear.wear)) {
    ids.push(Wear.wear[item].obj.item_id)
    singleItems.push(Wear.wear[item].obj)
  }
  const setlist = west.storage.ItemSetManager._setList
  for (let i = 0; i < singleItems.length; i++) {
    const item = singleItems[i]
    const set = item.set
    if (!(set in setlist)) continue
    if (!(set in setsInUse)) {
      setsInUse[set] = []
    }
    setsInUse[set].push(item.item_base_id)
  }
  const numDuelWeaponsInSet = function (set) {
    const setItems = setlist[set].items
    let numDuelweaponsContained = 0
    for (let i = 0; i < setItems.length; i++) {
      const item = ItemManager.getByBaseId(setItems[i])
      if (item.type === 'right_arm' || item.type === 'left_arm') {
        numDuelweaponsContained++
      }
    }
    return numDuelweaponsContained
  }
  for (const i in setsInUse) {
    const setItemCount = setlist[i].items.length
    const setItemsWorn = setsInUse[i].length
    if (setItemsWorn === 1) {
      continue
    }
    const nd = numDuelWeaponsInSet(i)
    let name = ''
    if (setItemCount !== setItemsWorn) {
      if (nd > 1 && setItemsWorn === setItemCount - 1) {
        name = setlist[i].name
      } else {
        name = setlist[i].name + ' (' + setItemsWorn + '/' + setItemCount + ')'
      }
    } else {
      name = setlist[i].name
    }
    if (nd > 0) {
      if (Wear.wear.right_arm) {
        if (Wear.wear.right_arm.obj.sub_type === 'shot') {
          name += TWDS._('SHORT_SHOTWEAPON', ' (shot)')
        } else if (Wear.wear.right_arm.obj.sub_type !== 'shot') {
          name += TWDS._('SHORT_MELEEWEAPON', ' (melee)')
        }
      }
    }
    names.push(name)
  }
  setNames.sort()

  for (let i = 0; i < singleItems.length; i++) {
    const item = singleItems[i]
    const set = item.set
    if (!(set in setsInUse) || setsInUse[set].length < 2) {
      names.push(item.name)
    }
  }

  names.sort()
  let is = ''
  for (let i = 0; i < setNames.length; i++) {
    if (is > '') { is += ', ' }
    is += setNames[i]
  }
  for (let i = 0; i < names.length; i++) {
    if (is > '') { is += ', ' }
    is += names[i]
  }

  ids.sort()
  let hashstr = ''
  for (let i = 0; i < ids.length; i++) {
    hashstr += ',' + ids[i]
  }

  let dmg = 0
  if (Wear.wear.right_arm) { dmg = Wear.wear.right_arm.obj.getDamage(Character) }
  const hash = TWDS.cyrb53(hashstr)
  const key = 'TWDS_h_' + hash
  const tmp = window.localStorage.getItem(key)
  let o = {}
  o.name = hash
  if (tmp) {
    o = JSON.parse(tmp)
  }
  o.level = Character.level
  o.item_ids = ids
  o.items = is
  o.schlag = schlag
  o.zaeh = zaeh
  o.hp = hp
  o.refl = refl
  o.ausw = ausw
  o.ziel = ziel
  o.schuss = schuss
  o.takt = takt
  o.auft = auft
  o.wid_schlag = meleeRes
  o.wid_schuss = shotRes
  o.dmg_abs_min = dmg.min * 0.25
  o.dmg_min = dmg.min
  o.dmg_max = dmg.max
  o.dmg_abs_max = dmg.max * 1.75 * 1.5
  o.shot = (Wear.wear.right_arm && Wear.wear.right_arm.obj.sub_type === 'shot')

  let lvtmp = zaeh + refl + ausw + ziel
  if (o.shot) {
    lvtmp += schuss
  } else {
    lvtmp += schlag
  }
  // 5: 3 skill points and 1 attribute, which can be worth 2 skill points (Green/Blue)
  o.leveleq_attack = Math.round((lvtmp + auft) / 5)
  o.leveleq_defense = Math.round((lvtmp + takt) / 5)

  const s = JSON.stringify(o)
  return [key, s]
}

TWDS.fillEquipmentTab = function (tab) {
  const l = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)
    if (!k.match(/^TWDS_h_/)) {
      continue
    }
    const s = window.localStorage.getItem(k)
    const t = {}
    const o = JSON.parse(s)
    t.name = o.name
    t.key = k
    l.push(t)
  }
  l.sort(function (a, b) {
    a = a.name
    b = b.name
    if (typeof a !== 'string') { a = a + '' }
    if (typeof b !== 'string') { b = b + '' }
    return a.localeCompare(b)
  })
  for (const i in l) {
    const k = l[i].key
    const s = window.localStorage.getItem(k)
    if (s > '') {
      const o = JSON.parse(s)
      TWDS.add1ToTab(tab, i, k, o)
    }
  }
  TWDS.highlightEquipmentTable(tab)
  return l.length
}
TWDS.highlightEquipmentTable = function (tab) {
  const rows = $('.datarow', tab)
  const merk = {}
  $(rows).each(function () {
    $('td[data-field]', this).each(function () {
      const f = this.dataset.field
      if (!(f in merk)) {
        merk[f] = []
      }
      merk[f].push(parseInt(this.textContent))
    })
  })
  for (const k in merk) {
    merk[k].sort(function (a, b) { return b - a })
  }
  $(rows).each(function () {
    $('td[data-field]', this).each(function () {
      const f = this.dataset.field
      const v = parseInt(this.textContent)
      if (v >= merk[f][0]) {
        this.classList.add('best')
      } else if (v >= 0.90 * merk[f][0]) {
        this.classList.add('verygood')
      } else if (v >= 0.75 * merk[f][0]) {
        this.classList.add('good')
      } else if (v >= 0.5 * merk[f][0]) {
        this.classList.add('ok')
      } else {
        this.classList.add('other')
      }
    })
  })
}
TWDS.classifyEquipment = function (o) {
  let schaden = o.schlag
  if (o.shot) schaden = o.schuss
  const widerstand = Math.max(o.wid_schuss, o.wid_schlag)

  let avg = o.ziel + o.ausw + schaden + widerstand
  avg /= 4

  const ca = [
    [o.ziel, TWDS._('AIMING', 'Aiming')],
    [o.ausw, TWDS._('DODGING', 'Dodging')],
    [widerstand, TWDS._('RESISTANCE', 'Resistance')],
    [schaden, TWDS._('DAMAGE', 'Damage')]
  ]
  ca.sort(function (a, b) {
    return b[0] - a[0]
  })

  let type = ''
  if (o.auft > o.takt + 100) { type = TWDS._('ATTACKING_SET', 'Attacking,') } else if (o.takt > o.auft + 100) { type = TWDS._('DEFENDING_SET', 'Defending,') }
  let sep = ' '
  for (let i = 0; i < ca.length; i++) {
    if (ca[i][0] > avg) {
      type += sep
      sep = '/'
      if (ca[i][0] > avg * 1.33) {
        type += '<b>'
        type += ca[i][1]
        type += '</b>'
      } else {
        type += ca[i][1]
      }
    }
  }
  for (let i = 0; i < ca.length; i++) {
    if (ca[i][0] < avg * 0.5) {
      type += sep
      sep = '/'
      type += '<strike>'
      type += ca[i][1]
      type += '</strike>'
    }
  }

  if (o.wid_schlag > o.wid_schuss + 100) { type += TWDS._('AGAINST_MELEE', ' against melee weapons') }
  if (o.wid_schuss > o.wid_schlag + 100) { type += TWDS._('AGAINST_SHOT', ' against shot weapons') }
  return type
}
/*
  name  - Name der Ausrüstung (oder hash)
  Fn    - Funktionen (löschen, anlegen)
  Lv    - Level bei Anlegen / Updaten
  Zielen - mit Mouseover für Chancen
  Auftreten
  Schuß/Schlag
  Ausweichen - mit Mouseover für Chancen
  Taktik
  Widerstand Nah - Widerstand gegen Schlag
  Widerstand Fern - Widerstand gegen Schuss
  Schaden - mit Mouseover
 */
TWDS.add1ToTab = function (tab, i, key, o) {
  const appOne = function (tr, v0, dn = null, ti = null) {
    const td = document.createElement('td')
    let v = Math.round(v0)
    if (isNaN(v)) { v = v0 }
    td.textContent = v
    if (dn != null) {
      td.dataset.field = dn
    }
    if (ti != null) {
      td.title = ti
    }
    tr.appendChild(td)
  }
  const calcChance = function (ziel, aw) {
    let t = 0
    let v = 0
    for (let i = 1; i < ziel + 5; i++) {
      for (let j = 1; j < aw + 5; j++) {
        v++
        if (i > j) {
          t++
        }
      }
    }
    return Math.round(t / v * 1000) / 10
  }
  const tr = document.createElement('tr')
  tr.classList.add('datarow')
  tr.dataset.key = key
  tab.appendChild(tr)

  let baseValues = ''
  baseValues += o.ziel + ' ' + CharacterSkills.keyNames.aim + '<br>'
  baseValues += o.schuss + ' ' + CharacterSkills.keyNames.shot + '<br>'
  baseValues += o.schlag + ' ' + CharacterSkills.keyNames.punch + '<br>'
  baseValues += o.ausw + ' ' + CharacterSkills.keyNames.dodge + '<br>'
  baseValues += o.refl + ' ' + CharacterSkills.keyNames.reflex + '<br>'
  baseValues += o.zaeh + ' ' + CharacterSkills.keyNames.tough + '<br>'
  baseValues += o.auft + ' ' + CharacterSkills.keyNames.appearance + '<br>'
  baseValues += o.takt + ' ' + CharacterSkills.keyNames.tactic + '<br>'
  baseValues += o.hp + ' ' + CharacterSkills.keyNames.health + '<br>'

  const classification = TWDS.classifyEquipment(o)

  // Spalte 1: Name der Ausrüstung, mit Items und Werten aus Mouseover.
  const th = document.createElement('th')
  th.textContent = o.name
  th.title = o.items + '<br>' + classification + '</br>' + baseValues
  th.onclick = 'TWDS.nameEdit()'
  th.classList.add('TWDS_nameeditTrigger')
  tr.appendChild(th)

  // Spalte 2: Anziehen
  let td = document.createElement('td')
  tr.appendChild(td)
  let but = TWDS.createButton(
    TWDS._('EQ_SET_WEAR', 'wear'), {
      title: TWDS._('EQ_SET_WEAR_MOUSEOVER', 'Switch to this equipment set'),
      classList: ['TWDS_wear']
    })
  td.appendChild(but)

  let aimChanceText = ''

  for (let aw = 100; aw <= 1500; aw += 100) {
    let c = calcChance(o.ziel, aw)
    c = Math.round(c * 100) / 100
    aimChanceText += TWDS._('HIT_CHANCE_AGAINST_DODGING',
      'Against dodging $dodge$: $chance$%', {
        dodge: aw,
        chance: c
      })
    aimChanceText += '<br>'
  }
  let dodgeChanceText = ''
  for (let ziel = 100; ziel <= 1500; ziel += 100) {
    let c = 100 - calcChance(ziel, o.ausw)
    c = Math.round(c * 100) / 100
    dodgeChanceText += TWDS._('DODGE_CHANCE_AGAINST_AIMING',
      'Against aiming $aim$: $chance$%', {
        aim: ziel,
        chance: c
      })
    dodgeChanceText += '<br>'
  }
  dodgeChanceText += TWDS._('DODGE_CHANCE_INFO',
  `
    If the opponent aimed and didn't dodge or duck in the last round, the aiming value is doubled. If you dodge/duck in the right direction, your chance to dodge is better (the amount is not known). So take these chances with a grain of salt.

  `)
  let sum = (o.dmg_min + o.dmg_max) / 2 + o.ziel + o.ausw
  if (o.shot) sum += o.schuss; else sum += o.schlag
  const sum1 = sum + Math.max(o.wid_schlag, o.wid_schuss) + Math.max(o.takt, o.auft)
  const sum2 = sum + Math.min(o.wid_schlag, o.wid_schuss) + Math.min(o.takt, o.auft)
  let sumText = sum1 + ' ' + TWDS._('VALUE_SUM_TEXT',
    `Sum of average damage, aiming, dodging, either vigor or shooting, 
    the maximum resistance value, and the maximum of appearance and tactics.`) + '<br>'
  sumText += sum2 + ' ' + TWDS._('VALUE_SUM_TEXT_MIN',
    'As above, with the two maximums replaced with the minimums')

  // Spalte 3: Level
  appOne(tr, o.level, null, sumText)
  // Spalte 4: Zielen
  appOne(tr, o.ziel, 'ziel', aimChanceText)
  // Spalte 5: Auftreten
  appOne(tr, o.auft, 'auft')
  // Spalte 6: Schuß oder Schlag
  if (o.shot) {
    appOne(tr, o.schuss, 'dmgmod')
  } else {
    appOne(tr, o.schlag, 'dmgmod')
  }
  // Spalte 7: Ausweichen
  appOne(tr, o.ausw, 'ausw', dodgeChanceText)
  // Spalte 8: Taktik
  appOne(tr, o.takt, 'takt')
  // Spalte 9: Widerstand Nah
  appOne(tr, o.wid_schlag, 'wid_schlag',
    TWDS._('MELEE_RESISTANCE_DEF',
      'Resistance against melee weapons: Tough + 25% of reflex'))
  // Spalte 10: Widerstand Fern
  appOne(tr, o.wid_schuss, 'wid_schuss',
    TWDS._('SHOT_RESISTANCE_DEF',
      'Resistance against shot weapons: Reflex + 25% of show'))

  // Spalte 11: Schaden
  const sch = Math.round((o.dmg_min + o.dmg_max) / 2)
  let dmgText = ''

  let rel = o.schlag
  if (o.shot) rel = o.schuss
  dmgText += TWDS._('MINDMG_HAND',
    '$dmg$ minimal damage with a hand hit and resistance &gt;= $res$',
    { dmg: o.dmg_abs_min, res: rel + 100 })
  dmgText += '<br>'
  dmgText += TWDS._('MINDMG',
    '$dmg$ minimal damage with a hand hit and resistance around $res$',
    { dmg: o.dmg_min, res: rel })
  dmgText += '<br>'
  dmgText += TWDS._('MAXDMG',
    '$dmg$ maximal damage with a hand hit and resistance around $res$',
    { dmg: o.dmg_max, res: rel })
  dmgText += '<br>'
  dmgText += TWDS._('MAXDMG_HEAD',
    '$dmg$ maximal damage with a head hit and resistance &lt;= $res$',
    { dmg: o.dmg_abs_max, res: rel - 100 })
  dmgText += '<br>'
  dmgText += TWDS._('DMG_HELP',
    'The damage done depends on the weapon, damage modifier (vigor or shooting), hit zone, the opponents resistance against the weapon type, and buffs. Buffs are not included into the calculations above.')
  appOne(tr, sch, 'dmg', dmgText)

  // Spalte 12: Löschen
  td = document.createElement('td')
  tr.appendChild(td)
  but = TWDS.createButton(
    TWDS._('EQ_SET_REMOVE', 'remove'), {
      title: TWDS._('EQ_SET_REMOVE_MOUSEOVER', 'Remove this equipment set from the list'),
      classList: ['TWDS_delete']
    })
  td.appendChild(but)
}

TWDS.getEquipmentContent = function () {
  const addHeadRow = function (tab) {
    const appOne = function (tr, ti, mo = null) {
      const td = document.createElement('td')
      td.textContent = ti
      if (mo != null) td.title = mo
      tr.appendChild(td)
    }
    const tr = document.createElement('tr')
    tr.className = 'headrow'
    tab.appendChild(tr)
    appOne(tr, TWDS._('NAME', 'Name'))
    appOne(tr, '') // no label, not needed
    appOne(tr, TWDS._('MENU_LEVEL_SHORT', 'Lv'),
      TWDS._('MENU_LEVEL_LONG', 'The character level at the moment the calculations were done.<br>If you open the script again, with this equipment worn, the values will be updated.'))
    appOne(tr, TWDS._('MENU_AIM_SHORT', 'Aim'),
      TWDS._('MENU_AIM_LONG', 'Aiming'))
    appOne(tr, TWDS._('MENU_APPEARANCE_SHORT', 'App.'),
      TWDS._('MENU_APPEARANCE_LONG', "The appearance skill. If it's larger than the defenders tactics skill, the attacker will get a aiming bonus (possibly the full difference)"))
    appOne(tr, TWDS._('MENU_DMGBON_SHORT', 'DmgMod'),
      TWDS._('MENU_DMGBON_LONG', 'The damage bonus: Either vigor or shooting.'))
    appOne(tr, TWDS._('MENU_DODGING_SHORT', 'Dodge'),
      TWDS._('MENU_DODGING_LONG', 'Dodging'))
    appOne(tr, TWDS._('MENU_TACTICS_SHORT', 'Tactics'),
      TWDS._('MENU_TACTICS_LONG', "The tactics skill. If it's larger than the attackers appearance, the defender will get a aiming bonus (possibly the full difference)."))
    appOne(tr, TWDS._('MENU_RES_MELEE_SHORT', 'MeeleRes'),
      TWDS._('MENU_RES_MELEE_LONG',
        'The resistance against melee damage (toughness plus 25% of reflex).'))
    appOne(tr, TWDS._('MENU_RES_SHOT_SHORT', 'ShotRes'),
      TWDS._('MENU_RES_MELEE_LONG',
        'The resistance against shot damage (reflex plus 25% of tough).'))
    appOne(tr, TWDS._('MENU_DAMAGE_SHORT', 'Dmg'),
      TWDS._('MENU_DAMAGE_LONG',
        'The average damage done.'))
    appOne(tr, TWDS._('MENU_DELETE_SHORT', ''))
  }
  const newstuff = TWDS.getEquipmentData()
  const key = newstuff[0]
  const data = newstuff[1]
  const div = document.createElement('div')

  if (window.localStorage.getItem(key) !== null) {
    window.localStorage.setItem(key, data) // update it.
  } else {
    const b = TWDS.createButton(
      TWDS._('EQUIPMENT_TAKEOVER_BUTTON', 'Add current equipment'),
      {
        classList: ['TWDS_specialequipment_button'],
        id: 'TWDS_equipment_takeover',
        dataSet: {
          key: key,
          edata: data
        }
      })
    div.appendChild(b)
  }

  const tab = document.createElement('table')
  div.appendChild(tab)
  tab.id = 'TWDS_equipment'
  addHeadRow(tab)
  const n = TWDS.fillEquipmentTab(tab)
  if (n >= 12) { addHeadRow(tab) }

  TWDS.getEquipmentContent.specialButtons(div)
  return div
}
TWDS.getEquipmentContent.specialButtons = function (div) {
  const but = function (text, key1, key2) {
    return TWDS.createButton(text, {
      classList: ['TWDS_specialequipment_button'],
      dataSet: {
        key1: key1,
        key2: key2
      }
    })
  }
  const appendOneBlock = function (container, specials, classAdd = '', doTranslate = true, doSort = true) {
    if (doTranslate) {
      for (let i = 0; i < specials.length; i++) {
        specials[i][1] = TWDS._(specials[i][0], specials[i][1])
      }
    }
    if (doSort) {
      specials.sort(function (a, b) {
        return a[1].localeCompare(b[1])
      })
    }
    let p
    if (container.nodeName === 'TABLE') {
      p = TWDS.createEle('tr', { className: classAdd })
    } else {
      p = TWDS.createEle('p', { className: classAdd })
    }
    container.appendChild(p)
    for (let i = 0; i < specials.length; i++) {
      const b = but(specials[i][1], specials[i][2], specials[i][3])
      if (container.nodeName === 'TABLE') {
        const td = TWDS.createEle('td')
        p.appendChild(td)
        td.appendChild(b)
      } else {
        p.appendChild(b)
      }
    }
  }

  let h = document.createElement('h3')
  h.textContent = TWDS._('SPECIAL_EQUIPMENT_HELPER', 'Special Equipment Helper')
  div.appendChild(h)

  let p = document.createElement('p')
  p.textContent = TWDS._('SPECIAL_EQUIPMENT_INFO', 'To calculate an equipment combination with good bonus values please on the following buttons. On a slow computers this might a long time, especially if you habe many sets.')
  div.appendChild(p)

  h = document.createElement('h4')
  h.textContent = TWDS._('SPECIAL_BONUS', 'Bonus')
  div.appendChild(h)

  const specials = [
    ['SPECIAL_BUTTON_SPEED', 'Speed', 'special', 'speed'],
    ['SPECIAL_BUTTON_XP', 'XP', 'special', 'xp'],
    ['SPECIAL_BUTTON_REGEN', 'Regeneration', 'special', 'regen'],
    ['SPECIAL_BUTTON_LUCK', 'Luck', 'special', 'luck'],
    ['SPECIAL_BUTTON_PRAY', 'Pray', 'special', 'pray'],
    ['SPECIAL_BUTTON_DOLLAR', 'Dollar', 'special', 'dollar'],
    ['SPECIAL_BUTTON_DROP', 'Drop', 'special', 'drop']
  ]
  appendOneBlock(div, specials, 'TWDS_SPEC_spec')

  h = document.createElement('h4')
  h.textContent = TWDS._('SPECIAL_SKILLS', 'Skills')
  div.appendChild(h)

  const tab = TWDS.createEle('table', { className: 'TWDS_SPEC_SKILLS' })
  div.appendChild(tab)
  for (const a of CharacterSkills.allAttrKeys.values()) {
    const skills = []
    for (const b of CharacterSkills.getSkillKeys4Attribute(a).values()) {
      const c = CharacterSkills.getSkill(b)
      const d = {}
      d[b] = 1
      skills.push(['', c.name, 'skill', JSON.stringify(d)])
    }
    appendOneBlock(tab, skills, 'TWDS_spec_' + a, false, false)
  }

  h = document.createElement('h4')
  h.textContent = TWDS._('SPECIAL_DUELS', 'Duels')
  div.appendChild(h)

  p = document.createElement('p')
  p.textContent = TWDS._('SPECIAL_DUELS_INFO', "These functions search for a more-or-less acceptable equipment set, but they do not replace thinking, and they cannot find the 'best' equipment (they do not know your opponents).")
  div.appendChild(p)

  h = document.createElement('h5')
  h.textContent = TWDS._('SPECIAL_DUELS_DMG', 'Damaging')
  div.appendChild(h)
  let skills = [
    ['SPECIAL_DUELS_DMG_R_A', 'Range Dueler, att.', 'range',
      JSON.stringify({ aim: 3, appearance: 1, shot: 3, dodge: 2 })],
    ['SPECIAL_DUELS_DMG_R_D', 'Range Dueler, def.', 'range',
      JSON.stringify({ aim: 3, tactic: 1, shot: 3, dodge: 2 })],
    ['SPECIAL_DUELS_DMG_M_A', 'Melee Dueler, att.', 'melee',
      JSON.stringify({ aim: 3, appearance: 1, tough: 3, dodge: 2 })],
    ['SPECIAL_DUELS_DMG_M_D', 'Melee Dueler, def.', 'melee',
      JSON.stringify({ aim: 3, tactic: 1, tough: 3, dodge: 2 })]
  ]
  appendOneBlock(div, skills, 'TWDS_SPEC_duel_dmg', true, false)

  h = document.createElement('h5')
  h.textContent = TWDS._('SPECIAL_DUELS_DODGING', 'Dodging')
  div.appendChild(h)
  skills = [
    ['SPECIAL_DUELS_DODGE_R_A', 'Range Dueler, att.', 'range',
      JSON.stringify({ aim: 2, appearance: 1, shot: 1, dodge: 4 })],
    ['SPECIAL_DUELS_DODGE_R_D', 'Range Dueler, def.', 'range',
      JSON.stringify({ aim: 2, tactic: 1, shot: 1, dodge: 4 })],
    ['SPECIAL_DUELS_DODGE_M_A', 'Melee Dueler, att.', 'melee',
      JSON.stringify({ aim: 2, appearance: 1, tough: 1, dodge: 4 })],
    ['SPECIAL_DUELS_DODGE_M_D', 'Melee Dueler, def.', 'melee',
      JSON.stringify({ aim: 2, tactic: 1, tough: 1, dodge: 4 })]
  ]
  appendOneBlock(div, skills, 'TWDS_SPEC_duel_dodge', true, false)

  h = document.createElement('h5')
  h.textContent = TWDS._('SPECIAL_DUELS_RES', 'Resistance')
  div.appendChild(h)
  skills = [
    ['SPECIAL_DUELS_RES_AR_A', 'Att. against a range dueller', 'skill',
      JSON.stringify({ aim: 1, appearance: 1, reflex: 4, tough: 1 })],
    ['SPECIAL_DUELS_RES_AR_D', 'Def. against a range dueller', 'skill',
      JSON.stringify({ aim: 1, tactic: 1, reflex: 4, tough: 1 })],
    ['SPECIAL_DUELS_RES_AM_A', 'Att. against a melee dueller', 'skill',
      JSON.stringify({ aim: 1, appearance: 1, reflex: 1, tough: 4 })],
    ['SPECIAL_DUELS_RES_AM_D', 'Def. against a melee dueller', 'skill',
      JSON.stringify({ aim: 1, tactic: 1, reflex: 1, tough: 4 })],
    ['SPECIAL_DUELS_RES_D', 'Defending against a dueller', 'skill',
      JSON.stringify({ aim: 1, tactic: 1, reflex: 4, tough: 4 })]
  ]
  appendOneBlock(div, skills, 'TWDS_SPEC_duel_res', true, false)

  h = document.createElement('h4')
  h.textContent = TWDS._('SPECIAL_FB', 'Fort battles')
  div.appendChild(h)

  p = document.createElement('p')
  p.textContent = TWDS._('SPECIAL_FB_INFO',
    "These functions search for a more-or-less acceptable equipment set, but can't take fort battle bonuses into account. Therefore they will almost never find the 'perfect' equipment.")
  div.appendChild(p)

  skills = [
    ['SPECIAL_FB_TANK_ATT', 'Tank, att.', 'fbtank',
      JSON.stringify({ health: 40, dodge: 15, hide: 25, aim: 10, pitfall: 0, leadership: 10 })],
    ['SPECIAL_FB_TANK_DEF', 'Tank, def.', 'fbtank',
      JSON.stringify({ health: 40, dodge: 15, hide: 0, aim: 10, pitfall: 25, leadership: 10 })],
    ['SPECIAL_FB_DMG_ATT', 'Damager, att.', 'fbdamager',
      JSON.stringify({ health: -10, dodge: 10, hide: 30, aim: 30, pitfall: 0, leadership: 40 })],
    ['SPECIAL_FB_DMG_DEF', 'Damager, def.', 'fbdamager',
      JSON.stringify({ health: -10, dodge: 10, hide: 0, aim: 30, pitfall: 30, leadership: 40 })]
  ]
  appendOneBlock(div, skills, 'TWDS_SPEC_duel_dmg', true, false)
}

TWDS.activateEquipmentTab = function () {
  TWDS.activateTab('equipment')
}
TWDS.equipmenttab.specialbuttonhandler = function (ele) {
  const key1 = ele.dataset.key1
  const key2 = ele.dataset.key2
  let items = null
  if (key1 === 'special') {
    if (key2 === 'speed') items = TWDS.speedcalc.openwindow()
    else if (key2 === 'xp') items = TWDS.genCalc({ experience: 1 }, {})
    else if (key2 === 'regen') items = TWDS.genCalc({ regen: 1 }, { })
    else if (key2 === 'luck') items = TWDS.genCalc({ luck: 1 }, {})
    else if (key2 === 'pray') items = TWDS.genCalc({ pray: 1 }, {})
    else if (key2 === 'dollar') items = TWDS.genCalc({ dollar: 1 }, {})
    else if (key2 === 'drop') items = TWDS.genCalc({ drop: 1 }, {})
  } else if (key1 === 'skill') {
    const p = JSON.parse(key2)
    items = TWDS.genCalc({}, p)
  } else if (key1 === 'fbtank') {
    const p = JSON.parse(key2)
    items = TWDS.genCalc({
      fboffense: 10,
      fbdefense: 200,
      fbdamage: 10,
      fbresistance: 30
    }, p)
  } else if (key1 === 'fbdamager') {
    const p = JSON.parse(key2)
    items = TWDS.genCalc({
      fboffense: 200,
      fbdefense: 10,
      fbdamage: 30,
      fbresistance: 10
    }, p)
  } else if (key1 === 'range') {
    const p = JSON.parse(key2)
    items = TWDS.genCalc({ range: 100 }, p)
  } else if (key1 === 'melee') {
    const p = JSON.parse(key2)
    items = TWDS.genCalc({ melee: 100 }, p)
  }
  if (items !== null) { // null: speed set calc
    TWDS.wearItemsHandler(items)
  }
}

TWDS.registerStartFunc(function () {
  TWDS.registerTab('equipment',
    TWDS._('TABNAME_EQUIPMENT', 'Equipment'),
    TWDS.getEquipmentContent,
    TWDS.activateEquipmentTab,
    false)
  $(document).on('click', '#TWDS_equipment_takeover', function () {
    window.localStorage.setItem(this.dataset.key, this.dataset.edata)
    TWDS.clothcache.recalcItemUsage()
    TWDS.activateEquipmentTab()
    this.parentNode.removeChild(this)
  })
  $(document).on('click', '.TWDS_specialequipment_button', function () {
    TWDS.equipmenttab.specialbuttonhandler(this)
  })
  $(document).on('click', '.TWDS_wear', function () {
    const tr = this.closest('tr')
    const key = tr.dataset.key
    const tmp = window.localStorage.getItem(key)
    if (!tmp) return
    const o = JSON.parse(tmp)
    TWDS.wearItemsHandler(o.item_ids)
  })
})

// vim: tabstop=2 shiftwidth=2 expandtab
