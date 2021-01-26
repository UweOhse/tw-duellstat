// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.speedCalc = function () {
  const skills = { ride: 1 }

  const availableSets = west.item.Calculator.filterUnavailableSets(west.storage.ItemSetManager.getAll())
  const bestItems = TWDS.speedCalc.getBestItems(skills)

  console.log('bi', bestItems)
  console.log('bestItems', TWDS.describeItemCombo(bestItems))

  const bestItemsContainer = new west.item.ItemSetContainer()
  for (let i = 0; i < bestItems.length; i++) { bestItemsContainer.addItem(bestItems[i].getId()) }

  console.log('availableSets', availableSets)
  let sets = TWDS.speedCalc.createSubsets(availableSets, bestItems)
  console.log('subsets', sets)
  if (sets.length > 500) { return }
  // klappt nichts, so kann man speed nicht optimieren
  // MUSS man aber vielleicht?
  sets = TWDS.speedCalc.filterUneffectiveSets(sets)
  console.log('subsets after filter', sets)

  // Was fehlt: FillEmpty(combinesets, BestItems,AllItemsWithSpeedBonus)

  sets = west.item.Calculator.fillEmptySlots(west.item.Calculator.combineSets(sets), bestItems)
  sets.push(bestItemsContainer)
  console.log('mergedsets', sets)

  let bestPoints = -1
  let best = null
  for (let i = 0; i < sets.length; i++) {
    const spd = TWDS.speedCalc.calcCombinedSet(sets[i])
    if (spd > bestPoints) {
      bestPoints = spd
      best = sets[i]
      console.log(TWDS.describeItemCombo(TWDS.speedCalc.getItems(sets[i])), sets[i],
        TWDS.speedCalc.getItems(sets[i]), spd)
    }
  }
  console.log('best', bestPoints, best)
  return TWDS.speedCalc.getItems(best)
}

TWDS.speedCalc.filterUneffectiveSets = function (sets) {
  const r = []
  const bestBySlots = {}
  for (let i = 0; i < sets.length; i++) {
    // setValue = sets[i].getSetValue(skills, jobId);
    const tmp = TWDS.speedCalc.getSetSpeedyValues(sets[i])
    const speed = TWDS.speedCalc.calc3(tmp.speed, tmp.ride, tmp.speedBonus)
    if (speed < 1) { continue }
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

TWDS.speedCalc.getItems = function (set) {
  const it = []
  for (let i = 0; i < set.items.length; i++) { it.push(set.items[i]) }
  for (const oneset of Object.values(set.sets)) {
    for (let i = 0; i < oneset.items.length; i++) { it.push(oneset.items[i]) }
  }
  return it
}
TWDS.speedCalc.calcSet = function (set) {
  const tmp = TWDS.speedCalc.getSetSpeedyValues(set)
  return TWDS.speedCalc.calc3(tmp.speed, tmp.ride, tmp.speedBonus)
}
TWDS.speedCalc.calcCombinedSet = function (set) {
  const tmp = TWDS.speedCalc.getCombinedSetSpeedyValues(set)
  return TWDS.speedCalc.calc3(tmp.speed, tmp.ride, tmp.speedBonus)
}
/*
var bestItems, bestItemsContainer, sets, i, best, points = 0, tmp, availableSets;
// availableSets = this.filterUnavailableSets(west.storage.ItemSetManager.getAll());
// bestItems = this.getBestItems(skills, true);
//bestItemsContainer = new west.item.ItemSetContainer;
//for (i = 0; i < bestItems.length; i++)
//bestItemsContainer.addItem(bestItems[i].getId());
sets = this.createSubsets(availableSets, bestItems, skills, jobId);
if (window.__limitclothcalc && sets.length > 500) {
sets = this.createSubsets(availableSets, bestItems, skills, jobId, true);
console && console.log('using approximation...');
}
sets = this.filterUneffectiveSets(sets, skills, jobId);
sets = this.fillEmptySlots(this.combineSets(sets), bestItems);
sets.push(bestItemsContainer);
for (i = 0; i < sets.length; i++) {
tmp = sets[i].getValue(skills, jobId);
if (tmp > points) {
points = tmp;
best = sets[i];
}
}
return best;
*/
TWDS.speedCalc.createCombinations = function (items, k) {
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
    tailcombs = TWDS.speedCalc.createCombinations(items.slice(i + 1), k - 1)
    for (j = 0; j < tailcombs.length; j++) {
      combs.push(head.concat(tailcombs[j]))
    }
  }
  return combs
}
TWDS.speedCalc.createSubsets = function (fullSets, bestItems) {
  let i; const sets = []; let set; let j; let permutations; let k; let l; let tmpSet
  for (i = 0; i < fullSets.length; i++) {
    set = fullSets[i]
    for (j = set.items.length; j > 0; j--) {
      if (!Object.prototype.hasOwnProperty.call(set.bonus, j)) { continue }
      // if (!set.bonus.hasOwnProperty(j)) { continue }
      permutations = TWDS.speedCalc.createCombinations(set.items, j)
      for (k = 0, l = permutations.length; k < l; k++) {
        if (!west.item.Calculator.itemsCombineable(permutations[k])) { continue }
        tmpSet = new west.item.ItemSet({
          key: set.key,
          items: permutations[k],
          bonus: set.bonus
        })
        if (!TWDS.speedCalc.beatsBestItems(tmpSet, bestItems)) { continue }
        sets.push(tmpSet)
      }
    }
  }
  return sets
}

TWDS.speedCalc.beatsBestItems = function (set, bestItems, skills, jobId) {
  // find out what the best items give us.
  let bestItemBase = 0
  let bestItemRide = 0
  let bestItemSpeedBonus = 0

  const setSlots = set.getUsedSlots()
  for (let i = 0; i < bestItems.length; i++) {
    if (setSlots.indexOf(bestItems[i].getType()) === -1) { continue }
    const v = TWDS.speedCalc.getSpeedyValues(bestItems[i])
    if (v.speed > bestItemBase) bestItemBase = v.speed
    bestItemRide += v.ride
    bestItemSpeedBonus += v.speedBonus
  }
  const biSpeed = TWDS.speedCalc.calc3(bestItemBase, bestItemRide, bestItemSpeedBonus)
  const setData = TWDS.speedCalc.getSetSpeedyValues(set)
  const setSpeed = TWDS.speedCalc.calc3(setData.speed, setData.ride, setData.speedBonus)
  // console.log("bi values",biSpeed,bestItemBase, bestItemRide, bestItemSpeedBonus)
  // console.log("set values",setSpeed,setData.speed, setData.ride, setData.speedBonus)
  return setSpeed > biSpeed // || setData.speedBonus > bestItemSpeedBonus
}

TWDS.speedCalc.getBestItems = function (skills) {
  const bestItems = {}
  const result = []
  const itemsByBase = Bag.getItemsIdsByBaseItemIds()
  west.common.forEach(itemsByBase, function (items, baseId) {
    const item = ItemManager.get(items[0])
    const type = item.getType()
    // const value = item.getValue(skills)
    bestItems[type] = bestItems[type] || []
    const value = TWDS.speedCalc.getSpeedyValues(item)
    if ((value.ride || value.speedBonus) && item.wearable()) {
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
        value: TWDS.speedCalc.getSpeedyValues(wearItem)
      })
    }
    // return (100 + 100 * tmp.speed + tmp.ride) * (1 + tmp.speedBonus)
    bestItems[type] = items.sort(function (a, b) {
      const aSpeed = TWDS.speedCalc.calc3(a.value.speed, a.value.ride, a.value.speedBonus)
      const bSpeed = TWDS.speedCalc.calc3(b.value.speed, b.value.ride, b.value.speedBonus)
      return (bSpeed - aSpeed)
    })
    if (bestItems[type].length) {
      console.log('type', type, bestItems[type][0])
      result.push(bestItems[type][0].item)
    }
  })
  return result
}
TWDS.speedCalc.calc3 = function (animalSpeed, ride, speedBonus) {
  let spd = Math.round(1 / (animalSpeed || 1) * 100 - 100)
  // Math.round(Character.defaultSpeed / (Character.defaultSpeed * 0.28) * 100 - 100)
  spd = (100 + spd + ride) * (1 + speedBonus)
  return spd
}

// a modified version of west.item.Item.getValue
// -jobPoints
// +speed bonus
TWDS.speedCalc.getSpeedyValues = function (item) {
  const skills = { ride: 1 }
  let value = 0
  let speedBonus = 0
  const attributes = {}
  let skill
  let attr
  const skillAddition = {}
  let skillArr
  let i
  const memo = 'TWDSspeedy'
  let bonusExtractor
  let affectedSkills

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
      if (b.key === 'speed') { speedBonus += b.value }
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
    speed: item.speed !== null ? item.speed : 0,
    ride: value,
    speedBonus: speedBonus
  }
  item._memo[memo] = out
  return out
}

TWDS.speedCalc.getCombinedSetSpeedyValues = function (combo) {
  const boni = {
    speed: 0,
    ride: 0,
    speedBonus: 0
  }
  for (let i = 0; i < combo.sets.length; i++) {
    const v = TWDS.speedCalc.getSetSpeedyValues(combo.sets[i])
    if (v.speed) boni.speed = v.speed
    boni.ride += v.ride
    boni.speedBonus += v.speedBonus
  }
  for (let i = 0; i < combo.items.length; i++) {
    const item = ItemManager.get(combo.items[i])
    const v = TWDS.speedCalc.getSpeedyValues(item)
    if (v.speed) boni.speed = v.speed // this assumes we'll never see a set with two horses...
    boni.ride += v.ride
    boni.speedBonus += v.speedBonus
  }
  return boni
}

TWDS.speedCalc.getSetSpeedyValues = function (set) {
  const boni = {
    speed: 0,
    ride: 0,
    speedBonus: 0
  }
  const v = TWDS.speedCalc.getSetBonusSpeedyValues(set)
  boni.speed = v.speed
  boni.ride = v.ride
  boni.speedBonus = v.speedBonus
  let i
  for (i = 0; i < set.items.length; i++) {
    const item = ItemManager.get(set.items[i])
    const v = TWDS.speedCalc.getSpeedyValues(item)
    if (v.speed) boni.speed = v.speed // this assumes we'll never see a set with two horses...
    boni.ride += v.ride
    boni.speedBonus += v.speedBonus
  }
  return boni
}
TWDS.speedCalc.getSetBonusSpeedyValues = function (set) {
  const boni = {
    speed: 0, // stays that way
    ride: 0,
    speedBonus: 0
  }
  const bonus = set.getMergedBonus()
  const memo = 'speedy'
  // console.log("merge",set,bonus)

  if (!('_memo' in set)) set._memo = {} // this happens for merged sets.

  if (set._memo[memo]) { return set._memo[memo] }
  if (bonus.skill.ride) { boni.ride += bonus.skill.ride }
  const attr = CharacterSkills.getAttributeKey4Skill('ride')
  if (bonus.attribute[attr]) { boni.ride += bonus.attribute[attr] }
  boni.speedBonus = bonus.speed
  set._memo[memo] = boni
  return boni
}

/*
        getValue: function(skills, jobId) {
            var value = 0, attributes = {}, skill, attr, skillAddition = {}, skillArr, i, memo = JSON.stringify(skills), bonusExtractor, affectedSkills;
            if (this._memo[memo])
                return this._memo[memo];
            for (skill in skills) {
                if (!skills[skill])
                    continue;
                attr = CharacterSkills.getAttributeKey4Skill(skill);
                attributes[attr] = (attributes[attr] || 0) + 1;
            }
            for (attr in this.bonus.attributes) {
                if (!attributes[attr])
                    continue;
                skillArr = CharacterSkills.getSkillKeys4Attribute(attr);
                for (i = 0; i < skillArr.length; i++) {
                    if (skills[skillArr[i]])
                        skillAddition[skillArr[i]] = this.bonus.attributes[attr];
                }
            }
            if (this.hasItemBonus()) {
                bonusExtractor = new west.item.BonusExtractor(Character,this.getItemLevel());
                for (i = 0; i < this.bonus.item.length; i++) {
                    affectedSkills = bonusExtractor.getAffectedSkills(this.bonus.item[i]);
                    for (skill in affectedSkills) {
                        if (!(skill in skills))
                            continue;
                        value += skills[skill] * affectedSkills[skill];
                    }
                    value += bonusExtractor.getWorkPointAddition(this.bonus.item[i], jobId);
                }
            }
            for (skill in skills) {
                if (this.bonus.skills[skill] || skillAddition[skill])
                    value += skills[skill] * ((this.bonus.skills[skill] || 0) + (skillAddition[skill] || 0));
            }
            if (this.usebonus || this.action)
                value = 0;
            this._memo[memo] = value;
            return value;
        },
*/
