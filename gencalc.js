// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.genCalc = function (bonusNames, skills) {
  const availableSets = west.item.Calculator.filterUnavailableSets(west.storage.ItemSetManager.getAll())
  const bestItems = TWDS.genCalc.getBestItems(bonusNames, skills)

  console.log('bi', bestItems)
  console.log('bestItems', TWDS.describeItemCombo(bestItems))

  const bestItemsContainer = new west.item.ItemSetContainer()
  for (let i = 0; i < bestItems.length; i++) { bestItemsContainer.addItem(bestItems[i].getId()) }

  console.log('availableSets', availableSets)
  let sets = TWDS.genCalc.createSubsets(availableSets, bestItems, bonusNames, skills)
  console.log('subsets', sets)
  // klappt nichts, so kann man speed nicht optimieren
  // MUSS man aber vielleicht?
  sets = TWDS.genCalc.filterUneffectiveSets(sets, bonusNames, skills)
  console.log('subsets after filter', sets)
  if (sets.length > 1000) { return }

  // Was fehlt: FillEmpty(combinesets, BestItems,AllItemsWithSpeedBonus)

  sets = west.item.Calculator.fillEmptySlots(west.item.Calculator.combineSets(sets), bestItems)
  sets.push(bestItemsContainer)
  console.log('mergedsets', sets)

  let bestPoints = -1
  let best = null
  for (let i = 0; i < sets.length; i++) {
    const spd = TWDS.genCalc.calcCombinedSet(sets[i], bonusNames, skills)
    if (spd > bestPoints) {
      bestPoints = spd
      best = sets[i]
      console.log(TWDS.describeItemCombo(TWDS.genCalc.getItems(sets[i])), sets[i],
        TWDS.genCalc.getItems(sets[i]), spd)
    }
  }
  console.log('best', bestPoints, best)
  return TWDS.genCalc.getItems(best)
}

TWDS.genCalc.filterUneffectiveSets = function (sets, bonusNames, skills) {
  const r = []
  const bestBySlots = {}
  for (let i = 0; i < sets.length; i++) {
    // setValue = sets[i].getSetValue(skills, jobId);
    const tmp = TWDS.genCalc.getSetGenValues(sets[i], bonusNames, skills)
    const speed = TWDS.genCalc.calc2(tmp.theBonus, tmp.theSecondary)
    if (speed < 0.001) { continue }
    const slots = JSON.stringify(sets[i].getUsedSlots().sort())
    if (!bestBySlots[slots]) {
      bestBySlots[slots] = [speed, sets[i]]
    } else {
      if (bestBySlots[slots][0] < speed) { bestBySlots[slots] = [speed, sets[i]] }
    }
  }
  for (const i in bestBySlots) {
    r.push(bestBySlots[i][1])
  }
  return r
}

TWDS.genCalc.getItems = function (set) {
  const it = []
  for (let i = 0; i < set.items.length; i++) { it.push(set.items[i]) }
  for (const oneset of Object.values(set.sets)) {
    for (let i = 0; i < oneset.items.length; i++) { it.push(oneset.items[i]) }
  }
  return it
}

TWDS.genCalc.calcCombinedSet = function (set, bonusNames, skills) {
  const tmp = TWDS.genCalc.getCombinedSetGenValues(set, bonusNames, skills)
  return TWDS.genCalc.calc2(tmp.theBonus, tmp.theSecondary)
}

TWDS.genCalc.createCombinations = function (items, k) {
  let i, j, combs, head, tailcombs
  if (k > items.length || k <= 0) {
    return []
  }
  if (k === items.length) {
    return [items]
  }
  if (k === 1) {
    combs = []
    for (i = 0; i < items.length; i++) {
      combs.push([items[i]])
    }
    return combs
  }
  combs = []
  for (i = 0; i < items.length - k + 1; i++) {
    head = items.slice(i, i + 1)
    tailcombs = TWDS.genCalc.createCombinations(items.slice(i + 1), k - 1)
    for (j = 0; j < tailcombs.length; j++) {
      combs.push(head.concat(tailcombs[j]))
    }
  }
  return combs
}
TWDS.genCalc.createSubsets = function (fullSets, bestItems, bonusNames, skills) {
  let i; const sets = []; let set; let j; let permutations; let k; let l; let tmpSet
  for (i = 0; i < fullSets.length; i++) {
    set = fullSets[i]
    let items
    if (('range' in bonusNames) || ('melee' in bonusNames)) {
      items = []
      for (j = 0; j < set.items.length; j++) {
        const it = ItemManager.get(set.items[j])
        if (it.type === 'right_arm') {
          if ('melee' in bonusNames && it.sub_type !== 'hand') continue
          if ('range' in bonusNames && it.sub_type !== 'shot') continue
        }
        items.push(set.items[j])
      }
    } else {
      items = set.items
    }
    for (j = items.length; j > 0; j--) {
      if (!Object.prototype.hasOwnProperty.call(set.bonus, j)) { continue }
      // if (!set.bonus.hasOwnProperty(j)) { continue }
      permutations = TWDS.genCalc.createCombinations(items, j)
      for (k = 0, l = permutations.length; k < l; k++) {
        if (!west.item.Calculator.itemsCombineable(permutations[k])) { continue }
        tmpSet = new west.item.ItemSet({
          key: set.key,
          items: permutations[k],
          bonus: set.bonus
        })
        if (!TWDS.genCalc.beatsBestItems(tmpSet, bestItems, bonusNames, skills)) { continue }
        sets.push(tmpSet)
      }
    }
  }
  return sets
}

TWDS.genCalc.beatsBestItems = function (set, bestItems, bonusNames, skills) {
  // find out what the best items give us.
  let bestItemBonus = 0
  let bestItemSecondary = 0

  const setSlots = set.getUsedSlots()
  for (let i = 0; i < bestItems.length; i++) {
    if (setSlots.indexOf(bestItems[i].getType()) === -1) { continue }
    const v = TWDS.genCalc.getGenValues(bestItems[i], bonusNames, skills)
    bestItemBonus += v.theBonus
    bestItemSecondary += v.theSecondary
  }
  const biSpeed = TWDS.genCalc.calc2(bestItemBonus, bestItemSecondary)
  const setData = TWDS.genCalc.getSetGenValues(set, bonusNames, skills)
  if (isNaN(setData.theBonus)) {
    console.log('isNaN trap', 'bBI', set, bonusNames, skills)
  }
  const setSpeed = TWDS.genCalc.calc2(setData.theBonus, setData.theSecondary, bestItems)
  return setSpeed > biSpeed // || setData.speedBonus > bestItemSpeedBonus
}

TWDS.genCalc.getBestItems = function (bonusNames, skills) {
  const bestItems = {}
  const result = []
  const itemsByBase = Bag.getItemsIdsByBaseItemIds()
  west.common.forEach(itemsByBase, function (items, baseId) {
    const item = ItemManager.get(items[0])
    const type = item.getType()
    if (type === 'right_arm') {
      if ('range' in bonusNames && item.sub_type !== 'shot') {
        return
      }
      if ('melee' in bonusNames && item.sub_type !== 'hand') {
        return
      }
    }
    bestItems[type] = bestItems[type] || []
    // const value = item.getValue(skills)
    const value = TWDS.genCalc.getGenValues(item, bonusNames, skills)
    if ((value.theBonus || value.theSecondary) && item.wearable()) {
      bestItems[type].push({
        item: item,
        id: item.getId(),
        base_id: baseId,
        value: value
      })
    }
  })
  west.common.forEach(bestItems, function (items, type) {
    let wearItem = Wear.get(type)
    if (wearItem) {
      wearItem = ItemManager.get(wearItem.getId())
      items.push({
        item: wearItem,
        id: wearItem.getId(),
        base_id: wearItem.getItemBaseId(),
        value: TWDS.genCalc.getGenValues(wearItem, bonusNames, skills)
      })
    }
    // return (100 + 100 * tmp.speed + tmp.ride) * (1 + tmp.speedBonus)
    bestItems[type] = items.sort(function (a, b) {
      const aSpeed = TWDS.genCalc.calc2(a.value.theBonus, a.value.theSecondary)
      const bSpeed = TWDS.genCalc.calc2(b.value.theBonus, b.value.theSecondary)
      return (bSpeed - aSpeed)
    })
    if (bestItems[type].length) {
      console.log('type', type, bestItems[type][0])
      result.push(bestItems[type][0].item)
    }
  })
  return result
}
TWDS.genCalc.calc2 = function (theBonus, theSecondary) {
  return theBonus + theSecondary
}

// a modified version of west.item.Item.getValue
// -jobPoints
// +speed bonus
TWDS.genCalc.getGenValues = function (item, bonusNames, skills) {
  let value = 0
  let theBonus = 0
  const attributes = {}
  let skill
  let attr
  const skillAddition = {}
  let skillArr
  let i
  const memo = 'TWDSgenCalc.' + JSON.stringify(bonusNames) + '.' + JSON.stringify(skills)

  let bonusExtractor
  let affectedSkills

  if (!('_memo' in item)) item._memo = {} // this happens.

  if (item._memo[memo]) { return item._memo[memo] }

  for (skill in skills) {
    if (!skills[skill]) { continue }
    attr = CharacterSkills.getAttributeKey4Skill(skill)
    attributes[attr] = (attributes[attr] || 0) + 1
  }
  for (attr in item.bonus.attributes) {
    if (!attributes[attr]) { continue }
    skillArr = CharacterSkills.getSkillKeys4Attribute(attr)
    for (i = 0; i < skillArr.length; i++) {
      if (skills[skillArr[i]]) { skillAddition[skillArr[i]] = item.bonus.attributes[attr] }
    }
  }
  if (item.hasItemBonus()) {
    bonusExtractor = new west.item.BonusExtractor(Character, item.getItemLevel())
    for (i = 0; i < item.bonus.item.length; i++) {
      const b = bonusExtractor.getExportValue(item.bonus.item[i])

      if (b.key in bonusNames) { theBonus += b.value * bonusNames[b.key] } else {
        const old = theBonus
        if (b.key === 'fort_defense' && 'fbdefense' in bonusNames) {
          theBonus += b.value * bonusNames.fbdefense
        }
        if (b.key === 'fort_defense_sector' && 'fbdefense' in bonusNames) {
          theBonus += b.value * bonusNames.fbdefense
        }
        if (b.key === 'fort_offense' && 'fboffense' in bonusNames) {
          theBonus += b.value * bonusNames.fboffense
        }
        if (b.key === 'fort_offense_sector' && 'fboffense' in bonusNames) {
          theBonus += b.value * bonusNames.fboffense
        }
        if (b.key === 'fort_resistance' && 'fbresistance' in bonusNames) {
          theBonus += b.value * bonusNames.fbresistance
        }
        if (b.key === 'fort_damage_sector' && 'fbdamage' in bonusNames) {
          theBonus += b.value * bonusNames.fbdamage
        }
        if (isNaN(theBonus)) {
          console.log('isNaN trap', b.key, b.value, old, item, bonusNames)
          break
        }
      }

      affectedSkills = bonusExtractor.getAffectedSkills(item.bonus.item[i])
      for (skill in affectedSkills) {
        if (!(skill in skills)) { continue }
        value += skills[skill] * affectedSkills[skill]
      }
    }
  }
  for (skill in skills) {
    if (item.bonus.skills[skill] || skillAddition[skill]) {
      value += skills[skill] * ((item.bonus.skills[skill] || 0) + (skillAddition[skill] || 0))
    }
  }
  if (item.usebonus || item.action) { value = 0 }
  const out = {
    theBonus: theBonus,
    theSecondary: value
  }
  item._memo[memo] = out
  return out
}

TWDS.genCalc.getCombinedSetGenValues = function (combo, bonusNames, skills) {
  const boni = {
    theBonus: 0,
    theSecondary: 0
  }
  for (let i = 0; i < combo.sets.length; i++) {
    const v = TWDS.genCalc.getSetGenValues(combo.sets[i], bonusNames, skills)
    boni.theBonus += v.theBonus
    boni.theSecondary += v.theSecondary
  }
  for (let i = 0; i < combo.items.length; i++) {
    const item = ItemManager.get(combo.items[i])
    const v = TWDS.genCalc.getGenValues(item, bonusNames, skills)
    boni.theBonus += v.theBonus
    boni.theSecondary += v.theSecondary
  }
  return boni
}

TWDS.genCalc.getSetGenValues = function (set, bonusNames, skills) {
  const boni = {
    theBonus: 0,
    theSecondary: 0
  }
  const v = TWDS.genCalc.getSetBonusGenValues(set, bonusNames, skills)
  boni.theBonus = v.theBonus
  boni.theSecondary = v.theSecondary
  let i
  for (i = 0; i < set.items.length; i++) {
    const item = ItemManager.get(set.items[i])
    const v = TWDS.genCalc.getGenValues(item, bonusNames, skills)
    boni.theBonus += v.theBonus
    boni.theSecondary += v.theSecondary
  }
  return boni
}
TWDS.genCalc.getSetBonusGenValues = function (set, bonusNames, skills) {
  const boni = {
    theBonus: 0,
    theSecondary: 0
  }
  const bonus = TWDS.genCalc.ItemSet.getMergedBonus(set)
  const memo = 'TWDS.gSBGV.' + JSON.stringify(bonusNames) + '.' + JSON.stringify(skills)

  if (!('_memo' in set)) set._memo = {} // this happens for merged sets.

  // if (!(memo in set._memo)) console.log("merge",set,bonus)

  if (set._memo[memo]) { return set._memo[memo] }

  if (skills) {
    for (const skill in skills) {
      if (bonus.skill[skill]) { boni.theSecondary += bonus.skill[skill] * skills[skill] }
      const attr = CharacterSkills.getAttributeKey4Skill(skill)
      if (bonus.attribute[attr]) { boni.theSecondary += bonus.attribute[attr] * skills[skill] }
    }
  }
  for (const [k, factor] of Object.entries(bonusNames)) {
    if (k === 'fbdefense') {
      if ('fortbattle' in bonus && 'defense' in bonus.fortbattle) { boni.theBonus += bonus.fortbattle.defense * factor }
    } else if (k === 'fboffense') {
      if ('fortbattle' in bonus && 'offense' in bonus.fortbattle) { boni.theBonus += bonus.fortbattle.offense * factor }
    } else if (k === 'fbdamage') {
      if ('fortbattle' in bonus && 'damage' in bonus.fortbattle) { boni.theBonus += bonus.fortbattle.damage * factor }
    } else if (k === 'fbresistance') {
      if ('fortbattle' in bonus && 'resistance' in bonus.fortbattle) { boni.theBonus += bonus.fortbattle.resistance * factor }
    } else {
      boni.theBonus += bonus[k] * factor
    }
  }

  if (isNaN(boni.theBonus)) {
    console.log('isNaN trap', 'gSBGV', boni, set, bonusNames, skills)
  }
  set._memo[memo] = boni
  return boni
}

// copy of ItemSet.getMergedBonus, with dollar/damage init fixed, and this replaced by set para
TWDS.genCalc.ItemSet = {}

TWDS.genCalc.ItemSet.getMergedBonus = function (set) {
  if (set._mergedBonus) { return set._mergedBonus }
  const bonus = {
    damage: 0,
    dollar: 0,
    attribute: {},
    skill: {},
    job: {},
    speed: 0,
    regen: 0,
    luck: 0,
    pray: 0,
    drop: 0,
    fortbattle: {},
    experience: 0
  }; const bonusObjects = TWDS.genCalc.ItemSet.getMergedStages(set); let i; let b; const bonusExtractor = new west.item.BonusExtractor(Character)
  const merge = function (b, value) {
    switch (b.type) {
      case 'skill':
      case 'attribute':
      case 'fortbattle':
        bonus[b.type][b.name] = (bonus[b.type][b.name] || 0) + value
        break
      case 'job':
        bonus.job[b.job] = (bonus.job[b.job] || 0) + value
        break
      case 'speed':
      case 'regen':
      case 'luck':
      case 'pray':
      case 'drop':
      case 'experience':
      case 'damage':
      case 'dollar':
        bonus[b.type] += value
        break
      case 'character':
        merge(b.bonus, bonusExtractor.getCharacterItemValue(b))
        break
      default:
        if (window.DEBUG) { console.log('ItemSet: unknown bonus to merge: ', b.type) }
        break
    }
  }
  for (i = 0; i < bonusObjects.length; i++) {
    b = bonusObjects[i]
    merge(b, b.value)
  }
  return (set._mergedBonus = bonus)
}

TWDS.genCalc.ItemSet.getMergedStages = function (set, cntPar) {
  let stage
  const bonus = []
  let bb
  const cnt = cntPar !== undefined ? cntPar : set.items.length
  let i
  let b
  const merge = function (b, value) {
    let found = false
    let bLen = bonus.length
    while (bLen--) {
      bb = bonus[bLen]
      if (b.type !== bb.type) { continue }
      if (b.type === 'character' && b.roundingMethod === bb.roundingMethod && b.key === bb.key && b.bonus.type === bb.bonus.type && b.bonus.name === bb.bonus.name) {
        found = true
        bb.bonus.value += b.bonus.value
      } else if (b.type === 'job' && b.job === bb.job) {
        found = true
        bb.value += b.value
      } else if (['speed', 'regen', 'luck', 'pray', 'experience', 'dollar', 'damage', 'drop'].indexOf(b.type) !== -1) {
        found = true
        bb.value += b.value
      } else if (['skill', 'attribute', 'fortbattle'].indexOf(b.type) !== -1 && b.name === bb.name && bb.isSector === b.isSector) {
        found = true
        bb.value += b.value
      }
    }
    if (found) { return }
    bonus.push(window.clone(b))
  }
  for (stage in set.bonus) {
    if (parseInt(stage, 10) > cnt) { continue }
    for (i = 0; i < set.bonus[stage].length; i++) {
      b = set.bonus[stage][i]
      merge(b, b.value)
    }
  }
  return bonus
}
