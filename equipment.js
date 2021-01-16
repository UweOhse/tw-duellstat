// reading the current skill values, and the items
TWDS.getEquipmentData = function () {
  const getOne = function (s) {
    const x = CharacterSkills.getSkill(s)
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
    console.log('set', i, setlist[i], 'has dw', nd)
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
      if (Wear.wear.right_arm.obj.sub_type === 'shot') {
        name += TWDS._('SHORT_SHOTWEAPON', ' (shot)')
      } else if (Wear.wear.right_arm.obj.sub_type !== 'shot') {
        name += TWDS._('SHORT_MELEEWEAPON', ' (melee)')
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

  const dmg = Wear.wear.right_arm.obj.getDamage(Character)
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
  o.shot = (Wear.wear.right_arm.obj.sub_type === 'shot')

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
  console.log('HL', merk)
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
  if (o.auft > o.takt + 100) { type = TWDS._('ATTACKING_SET', 'Attacking,') } else if (o.takt > o.auft + 100) { type = TWDS._('ATTACKING_SET', 'Defending,') }
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
  let span = document.createElement('button')
  span.textContent = TWDS._('EQ_SET_WEAR', 'wear')
  span.title = TWDS._('EQ_SET_WEAR_MOUSEOVER', 'Switch to this equipment set')
  span.classList.add('TWDS_wear')
  td.appendChild(span)

  tr.appendChild(td)

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
  span = document.createElement('button')
  span.textContent = TWDS._('EQ_SET_REMOVE', 'remove')
  span.classList.add('TWDS_delete')
  span.title = TWDS._('EQ_SET_REMOVE_MOUSEOVER', 'Remove this equipment set from the list')
  td.appendChild(span)

  tr.appendChild(td)

  // appOne(tr,o.zaeh,        "zaeh");
  // appOne(tr,o.refl,        "refl");
  // appOne(tr,o.hp,          "hp");
}
TWDS.initEquipmentTab = function (tab) {
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
  appOne(tr, TWDS._('WEAR', ''))
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

TWDS.getEquipmentContent = function () {
  const newstuff = TWDS.getEquipmentData()
  const key = newstuff[0]
  const data = newstuff[1]
  const div = document.createElement('div')

  if (window.localStorage.getItem(key) !== null) {
    window.localStorage.setItem(key, data) // update it.
  } else {
    const b = document.createElement('button')
    b.id = 'TWDS_equipment_takeover'
    b.textContent = TWDS._('EQUIPMENT_TAKEOVER_BUTTON', 'Add current equipment')
    b.dataset.key = key
    b.dataset.edata = data // json
    div.appendChild(b)
  }

  const tab = document.createElement('table')
  div.appendChild(tab)
  tab.id = 'TWDS_equipment'
  TWDS.initEquipmentTab(tab)
  TWDS.fillEquipmentTab(tab)
  return div
}
TWDS.activateEquipmentTab = function () {
  TWDS.activateTab('equipment')
}

TWDS.registerStartFunc(function () {
  TWDS.registerTab('equipment',
    TWDS._('TABNAME_EQUIPMENT', 'Equipment'),
    TWDS.getEquipmentContent,
    TWDS.activateEquipmentTab,
    false)
  $(document).on('click', '#TWDS_equipment_takeover', function () {
    window.localStorage.setItem(this.dataset.key, this.dataset.edata)
    TWDS.activateEquipmentTab()
    this.parentNode.removeChild(this)
  })
  $(document).on('click', '.TWDS_wear', function () {
    const tr = this.closest('tr')
    const key = tr.dataset.key
    const tmp = window.localStorage.getItem(key)
    if (!tmp) return
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
      if (!wman.getById(Inventory.uid)) { Inventory.open() }
      Wear.open()
      const items = Bag.getItemsByItemIds(o.item_ids)
      Inventory.showSearchResult(items)
    }
  })
})
