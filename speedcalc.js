// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.speedcalc = {}
TWDS.speedcalc.openwindow = function () {
  const myname = 'TWDS_speedcalc_window'
  const win = wman.open(myname, TWDS._('SPEEDCALC_TITLE', 'Speedset-Calculator'), 'TWDS_speedcalc_window')
  win.setMiniTitle(TWDS._('SPEEDCALC_MINITITLE', 'Speedcalc'))

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_speedcalc_container'
  })
  const container = TWDS.createEle('dl', { beforeend: content })
  const clicker = function () {
    const mode = parseInt(this.dataset.par)
    let out
    if (mode === 2) { out = TWDS.speedcalc.confirm() } else { out = TWDS.speedcalc.doit(mode) }
    TWDS.wearItemsHandler(out)
  }
  const block = function (mode, text, desc) {
    const dt = TWDS.createEle({
      nodeName: 'dt',
      beforeend: container
    })
    TWDS.createEle({
      nodeName: 'button',
      className: 'TWDS_button',
      dataset: {
        par: mode
      },
      textContent: text,
      beforeend: dt,
      onclick: clicker
    })
    TWDS.createEle({
      nodeName: 'dd',
      beforeend: container,
      textContent: desc
    })
  }
  block(0, 'basic', 'Quite fast speedset calculation. Likely to give a good, but most often not perfect result')
  block(1, 'extended', 'A compromise between the two extremes, not taking all speed bonus giving equipment into account')
  block(2, 'full', "This calculation will take a long time, and will block the browser. 2 minutes have been observed, and it's easy to imagine even longer times with more sets or items giving speed bonus.")
  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}

TWDS.speedcalc.confirm = function () {
  if (window.confirm("The speed set calculation can take a long time, and will block the browser. 2 minutes have been observed, and it's easy to imagine even longer times with more sets or items giving speed bonus. Do you want to calculate the speed set now?")) {
    return TWDS.speedcalc.doit(2)
  }
  return []
}
TWDS.speedcalc.doit3 = function () {
  console.time('SpeedCalc3')

  // for the list of useful things we need the set boni
  const setvalues = {}
  const calcsetvalues = function () {
    const avs = west.item.Calculator.filterUnavailableSets(west.storage.ItemSetManager.getAll())
    for (let i = 0; i < avs.length; i++) {
      const sv = TWDS.speedcalc.getSetSpeedyValues(avs[i])
      const k = avs[i].key
      setvalues[k] = sv
    }
    console.log('doit3', 'setvalues', setvalues)
  }
  calcsetvalues()

  const bestItems = TWDS.speedcalc.getBestItems() // a heuristical baseline,
  const bestItemsArray = []
  const bestItemValueBySlot = []
  const bestItemBySlot = []
  for (const it of Object.values(bestItems)) {
    bestItemsArray.push(it.item_id)
    const slot = it.type
    bestItemValueBySlot[slot] = TWDS.speedcalc.getSpeedyValues(it)
    bestItemBySlot[slot] = it
  }

  const baseline = TWDS.bonuscalc.getSpeed(bestItemsArray)
  console.log('doit3', 'bi', TWDS.describeItemCombo(bestItemsArray), baseline)

  const itemsBySlot = {}

  const highestBonusBySlot = []
  const highestRideBySlot = []

  const additemifusefull = function (it) {
    const slot = it.type
    if (!it.wearable()) return
    const value = TWDS.speedcalc.getSpeedyValues(it)
    /* a useful item is one which has:
     * - a higher ride+speed as anything else in the slot,
     * - or has the best speedbonus for the slot, because that is a multiplier
     * - or is part of a set with ride/speed above the bestitem in the slot
     * - or is part of a set with speed multiplier
    */

    let flag = 0

    let sval = value.ride
    if (value.speed) {
      sval += 100 / value.speed - 100
    }
    if (sval > highestRideBySlot[slot]) {
      highestRideBySlot[slot] = sval
      flag += 1
    }
    if (value.speedbonus > highestBonusBySlot[slot]) {
      highestBonusBySlot[slot] = value.speedbonus
      flag += 2
    }
    if (it.set !== null) {
      if (setvalues[it.set]) { // paranoida
        const v = setvalues[it.set].ride + setvalues[it.set].speed
        const cmp = bestItemValueBySlot[slot].ride + bestItemValueBySlot[slot].speed
        if (v > cmp) {
          flag += 4
        }
        if (setvalues[it.set].speedbonus) {
          flag += 8
        }
      }
    }
    if (flag) {
      console.log('ADDITEM', it.name, flag)
      itemsBySlot[slot].push(it)
    }
  }
  // init counters
  for (let i = 0; i < Wear.slots.length; i++) {
    const slot = Wear.slots[i]
    itemsBySlot[slot] = []
    highestBonusBySlot[slot] = 0
    highestRideBySlot[slot] = 0
  }

  for (const it of Object.values(bestItems)) {
    additemifusefull(it)
  }

  for (let i = 0; i < Wear.slots.length; i++) {
    const slot = Wear.slots[i]
    const it = Wear.get(slot)
    additemifusefull(it.obj)
  }
  const baglist = Bag.getItemsIdsByBaseItemIds()
  const ba = []
  for (const a of Object.values(baglist)) {
    const it = ItemManager.get(a[0])
    ba.push(it)
    additemifusefull(it)
  }
  console.log('BA', ba)
  // reverse, assuming newer things are faster.
  for (let i = ba.length - 1; i >= 0; i--) {
    additemifusefull(ba[i])
  }
  console.log('doit3', 'base list', itemsBySlot)

  const out = []
  const slots = Wear.slots
  const work = []
  let bestspd = 0
  let cnt = 0
  const rec = function (idx) {
    const slot = slots[idx]
    const items = itemsBySlot[slot]
    for (let i = 0; i < items.length; i++) {
      work[idx] = items[i].item_id
      if (idx < 9) {
        rec(idx + 1)
      } else {
        const copy = []
        for (let j = 0; j < work.length; j++) { copy[j] = work[j] }

        const spd = TWDS.bonuscalc.getSpeedFast(copy)
        if (spd > bestspd) {
          bestspd = spd
          for (let j = 0; j < work.length; j++) { out[j] = work[j] }
          console.log('doit3', 'rec', spd, TWDS.describeItemCombo(copy))
        }
        cnt++
        if (cnt % 5000 === 0) {
          console.log('cnt', cnt)
          break
        }
      }
    }
  }
  let p = 1
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    p *= itemsBySlot[slot].length
  }
  TWDS.bonuscalc.getSpeedFast(true) // init the caches
  console.log('oh, ', p, 'possibilities')
  rec(0)

  console.timeEnd('SpeedCalc3')
  return out
}
TWDS.speedcalc.doit = function (mode) {
  if (mode === null) mode = 0
  const skills = { ride: 1 }
  const start = (new Date()).getTime()
  console.time('SpeedCalc')

  const availableSets = west.item.Calculator.filterUnavailableSets(west.storage.ItemSetManager.getAll())
  const bestItems = TWDS.speedcalc.getBestItems(skills)
  console.log('bestItems', TWDS.describeItemCombo(bestItems))

  let bonusItems = []
  if (mode) {
    bonusItems = TWDS.speedcalc.getBonusItems()
    console.log('#bonusItems-all', bonusItems.length, TWDS.describeItemCombo(bonusItems))
    const merk = {}
    for (let i = 0; i < bonusItems.length; i++) {
      const item = bonusItems[i]
      const tp = item.getType()
      const value = TWDS.speedcalc.getSpeedyValues(item)
      if (!(tp in merk)) {
        merk[tp] = []
      }
      merk[tp].push([value.speedBonus, item])
    }
    for (const tp in merk) {
      const a = merk[tp]
      a.sort(function (a, b) {
        return b[0] - a[0]
      })
    }
    console.log('MERK', merk)
    bonusItems = []
    for (const tp in merk) {
      const limit = (mode === 1) ? 1 : 3
      for (let i = 0; i < merk[tp].length && i < limit; i++) {
        if (i > 0 && merk[tp][i][0] < merk[tp][0][0] * 0.33) { break }
        bonusItems.push(merk[tp][i][1])
      }
    }
    console.log('#bonusItems-filtered', bonusItems.length)
  }

  const bestItemsContainer = new west.item.ItemSetContainer()
  for (let i = 0; i < bestItems.length; i++) { bestItemsContainer.addItem(bestItems[i].getId()) }

  TWDS.dolog('info', 'SpeedCalc: starting mode', mode)
  let m0 = null
  if (window.performance.memory) {
    m0 = window.performance.memory
    TWDS.dolog('info', 'SpeedCalc: totalHeapSize @start', m0.totalJSHeapSize)
    TWDS.dolog('info', 'SpeedCalc: usedHeapSize @start', m0.usedJSHeapSize)
  }

  TWDS.dolog('info', 'SpeedCalc: available sets:', availableSets.length)
  let sets = TWDS.speedcalc.createSubsets(availableSets, bestItems, bonusItems)
  TWDS.dolog('info', 'SpeedCalc: subsets:', sets.length)
  console.log('#sets', sets.length, sets)

  sets = TWDS.speedcalc.filterUneffectiveSets(sets, mode)
  TWDS.dolog('info', 'SpeedCalc: filtered sets:', sets.length)
  console.log('#fsets', sets.length, sets)

  sets = west.item.Calculator.combineSets(sets)
  TWDS.dolog('info', 'SpeedCalc: subsets:', sets.length)
  console.log('#csets', sets.length, sets)
  // return [];

  sets = west.item.Calculator.fillEmptySlots(sets, bestItems)
  sets.push(bestItemsContainer)
  TWDS.dolog('info', 'SpeedCalc: filled sets:', sets.length)
  console.log('SpeedCalc: filled sets', sets.length)

  let bestPoints = -1
  let best = null
  for (let i = 0; i < sets.length; i++) {
    if (sets.length > 100000) {
      if ((i % 5000) === 0) {
        console.log('state', i, '/', sets.length)
      }
    }
    const spd = TWDS.speedcalc.calcCombinedSet(sets[i])
    if (spd > bestPoints) {
      bestPoints = spd
      best = sets[i]
      console.log('better:', TWDS.describeItemCombo(TWDS.speedcalc.getItems(sets[i])), sets[i],
        TWDS.speedcalc.getItems(sets[i]), spd)
    }
  }

  const bi = TWDS.speedcalc.getItems(best)
  console.timeEnd('SpeedCalc')
  const end = (new Date()).getTime()
  if (window.performance.memory) {
    const m1 = window.performance.memory
    TWDS.dolog('info', 'SpeedCalc: totalHeapSize @end', m1.totalJSHeapSize, 'delta', m1.totalJSHeapSize - m0.totalJSHeapSize)
    TWDS.dolog('info', 'SpeedCalc: usedHeapSize @end', m1.usedJSHeapSize, 'delta', m1.usedJSHeapSize - m0.usedJSHeapSize)
  }
  TWDS.dolog('info', 'SpeedCalc: took ' + (end - start) + ' ms')
  return bi
}
TWDS.speedcalc.fillempty = function (sets, bestItems, bonusItems) {
  let usedSlots; let container; const pimpedSets = []
  let i; let j
  let did1 = 0; let did2 = 0
  bonusItems.sort(function (a, b) {
    let asb = 0
    let bsb = 0
    if (a._memo && a._memo.TWDSspeedy && a._memo.TWDSspeedy.speedBonus) asb = a._memo.TWDSspeedy.speedBonus
    if (b._memo && b._memo.TWDSspeedy && b._memo.TWDSspeedy.speedBonus) bsb = b._memo.TWDSspeedy.speedBonus
    return bsb - asb
  })
  console.log('SORT', bonusItems)
  console.log('SETS#', sets.length)
  for (let i = 0; i < bonusItems.length; i++) {
    if (usedSlots.indexOf(bestItems[j].getType()) !== -1) continue
  }

  for (i = 0; i < sets.length; i++) {
    usedSlots = sets[i].getUsedSlots()
    console.log('FE', i, sets[i], sets[i].items.length, usedSlots, sets[i].items.length + usedSlots.length)
    container = new west.item.ItemSetContainer(sets[i])
    for (j = 0; j < bestItems.length; j++) {
      if (usedSlots.indexOf(bestItems[j].getType()) !== -1) continue
      container.addItem(bestItems[j].getId())
      if (i === 1) { console.log('PUSH1', bestItems[j]) }
      did1++
    }
    pimpedSets.push(container)
    const container2 = new west.item.ItemSetContainer(sets[i])
    for (j = 0; j < bonusItems.length; j++) {
      const us = container2.getUsedSlots()
      if (us.indexOf(bonusItems[j].getType()) !== -1) continue
      container = new west.item.ItemSetContainer(sets[i])
      container.addItem(bonusItems[j].getId())
      container2.addItem(bonusItems[j].getId())
      pimpedSets.push(container)
      if (i === 1) { console.log('PUSH', bonusItems[j]) }
      did2++
    }
    pimpedSets.push(container2)
    if (i === 1) { console.log('PUSH2', container2) }
  }
  console.log('FE', bonusItems, did1, did2)
  return pimpedSets
}

TWDS.speedcalc.filterUneffectiveSets = function (sets, mode) {
  const r = []
  const bestBySlots = {}
  for (let i = 0; i < sets.length; i++) {
    // setValue = sets[i].getSetValue(skills, jobId);
    const tmp = TWDS.speedcalc.getSetSpeedyValues(sets[i])
    const speed = TWDS.speedcalc.calc3(tmp.speed, tmp.ride, tmp.speedBonus)
    if (speed < 1) { continue }
    const slots = JSON.stringify(sets[i].getUsedSlots().sort())
    if (!bestBySlots[slots]) {
      bestBySlots[slots] = []
    }
    bestBySlots[slots].push([speed, sets[i]])
  }
  for (const sl in bestBySlots) {
    bestBySlots[sl].sort(function (a, b) {
      return b[0] - a[0]
    })
  }
  for (const sl in bestBySlots) {
    const limit = (mode === 2) ? 5 : 1
    for (let i = 0; i < bestBySlots[sl].length && i < limit; i++) {
      if (i === 0 || bestBySlots[sl][i][0] > 0.5 * bestBySlots[sl][0][0]) { r.push(bestBySlots[sl][i][1]) }
    }
  }
  return r
}

TWDS.speedcalc.getItems = function (set) {
  const it = []
  for (let i = 0; i < set.items.length; i++) { it.push(set.items[i]) }
  for (const oneset of Object.values(set.sets)) {
    for (let i = 0; i < oneset.items.length; i++) { it.push(oneset.items[i]) }
  }
  return it
}
TWDS.speedcalc.calcSet = function (set) {
  const tmp = TWDS.speedcalc.getSetSpeedyValues(set)
  return TWDS.speedcalc.calc3(tmp.speed, tmp.ride, tmp.speedBonus)
}
TWDS.speedcalc.calcCombinedSet = function (set) {
  const tmp = TWDS.speedcalc.getCombinedSetSpeedyValues(set)
  return TWDS.speedcalc.calc3(tmp.speed, tmp.ride, tmp.speedBonus)
}

TWDS.speedcalc.createCombinations = function (items, k) {
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
    tailcombs = TWDS.speedcalc.createCombinations(items.slice(i + 1), k - 1)
    for (j = 0; j < tailcombs.length; j++) {
      combs.push(head.concat(tailcombs[j]))
    }
  }
  return combs
}
TWDS.speedcalc.createSubsets = function (fullSets, bestItems, bonusItems) {
  let set
  let permutations
  let tmpSet
  const sets = []
  for (let i = 0; i < fullSets.length; i++) {
    set = fullSets[i]
    sets.push(set)
    for (let j = set.items.length; j > 0; j--) {
      let k, l
      if (!Object.prototype.hasOwnProperty.call(set.bonus, j)) { continue }
      // if (!set.bonus.hasOwnProperty(j)) { continue }
      permutations = TWDS.speedcalc.createCombinations(set.items, j)
      for (k = 0, l = permutations.length; k < l; k++) {
        if (!west.item.Calculator.itemsCombineable(permutations[k])) { continue }
        tmpSet = new west.item.ItemSet({
          key: set.key,
          items: permutations[k],
          bonus: set.bonus
        })
        if (!TWDS.speedcalc.beatsBestItems(tmpSet, bestItems)) { continue }
        sets.push(tmpSet)
      }
    }
  }
  for (let i = 0; i < bonusItems.length; i++) {
    tmpSet = new west.item.ItemSet({
      key: 'BI_' + bonusItems[i].name,
      items: [bonusItems[i].item_id],
      bonus: []
    })
    sets.push(tmpSet)
  }
  return sets
}

TWDS.speedcalc.beatsBestItems = function (set, bestItems, skills, jobId) {
  // find out what the best items give us.
  let bestItemBase = 0
  let bestItemRide = 0
  let bestItemSpeedBonus = 0

  const setSlots = set.getUsedSlots()
  for (let i = 0; i < bestItems.length; i++) {
    if (setSlots.indexOf(bestItems[i].getType()) === -1) { continue }
    const v = TWDS.speedcalc.getSpeedyValues(bestItems[i])
    if (v.speed > bestItemBase) bestItemBase = v.speed
    bestItemRide += v.ride
    bestItemSpeedBonus += v.speedBonus
  }
  const biSpeed = TWDS.speedcalc.calc3(bestItemBase, bestItemRide, bestItemSpeedBonus)
  const setData = TWDS.speedcalc.getSetSpeedyValues(set)
  const setSpeed = TWDS.speedcalc.calc3(setData.speed, setData.ride, setData.speedBonus)
  // console.log("bi values",biSpeed,bestItemBase, bestItemRide, bestItemSpeedBonus)
  // console.log("set values",setSpeed,setData.speed, setData.ride, setData.speedBonus)
  return setSpeed > biSpeed // || setData.speedBonus > bestItemSpeedBonus
}

TWDS.speedcalc.getBonusItems = function () {
  const result = []
  const itemsByBase = Bag.getItemsIdsByBaseItemIds()
  west.common.forEach(itemsByBase, function (items, baseId) {
    const item = ItemManager.get(items[0])
    const value = TWDS.speedcalc.getSpeedyValues(item)
    // take all items with a speed bonus - and all animals, because their base speed without bonus might be faster.
    if ((value.speedBonus || value.speed) && item.wearable()) {
      result.push(item)
    }
  })
  west.common.forEach(Wear.slots, function (sl) {
    const it = Wear.get(sl)
    const value = TWDS.speedcalc.getSpeedyValues(it.obj)
    if ((value.speedBonus || value.ride || value.speed) && it.obj.wearable()) {
      result.push(it.obj)
    }
  })
  return result
}

TWDS.speedcalc.getBestItems = function () {
  const bestItems = {}
  const result = []
  const itemsByBase = Bag.getItemsIdsByBaseItemIds()
  west.common.forEach(itemsByBase, function (items, baseId) {
    const item = ItemManager.get(items[0])
    const type = item.getType()
    // const value = item.getValue(skills)
    bestItems[type] = bestItems[type] || []
    const value = TWDS.speedcalc.getSpeedyValues(item)
    if ((value.ride || value.speedBonus || value.speed) && item.wearable()) {
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
        value: TWDS.speedcalc.getSpeedyValues(wearItem)
      })
    }
    // return (100 + 100 * tmp.speed + tmp.ride) * (1 + tmp.speedBonus)
    bestItems[type] = items.sort(function (a, b) {
      const aSpeed = TWDS.speedcalc.calc3(a.value.speed, a.value.ride, a.value.speedBonus)
      const bSpeed = TWDS.speedcalc.calc3(b.value.speed, b.value.ride, b.value.speedBonus)
      return (bSpeed - aSpeed)
    })
    if (bestItems[type].length) {
      console.log('type', type, bestItems[type][0])
      result.push(bestItems[type][0].item)
    }
  })
  return result
}
TWDS.speedcalc.calc3 = function (animalSpeed, ride, speedBonus) {
  const tmp = Math.round(1 / (animalSpeed || 1) * 100 - 100)
  // Math.round(Character.defaultSpeed / (Character.defaultSpeed * 0.28) * 100 - 100)
  const spd = (100 + tmp + ride) * (1 + speedBonus)
  return spd
}

// a modified version of west.item.Item.getValue
// -jobPoints
// +speed bonus
TWDS.speedcalc.getSpeedyValues = function (item) {
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

TWDS.speedcalc.getCombinedSetSpeedyValues = function (combo) {
  const boni = {
    speed: 0,
    ride: 0,
    speedBonus: 0
  }
  for (let i = 0; i < combo.sets.length; i++) {
    const v = TWDS.speedcalc.getSetSpeedyValues(combo.sets[i])
    if (v.speed) boni.speed = v.speed
    boni.ride += v.ride
    boni.speedBonus += v.speedBonus
  }
  for (let i = 0; i < combo.items.length; i++) {
    const item = ItemManager.get(combo.items[i])
    const v = TWDS.speedcalc.getSpeedyValues(item)
    if (v.speed) boni.speed = v.speed // this assumes we'll never see a set with two horses...
    boni.ride += v.ride
    boni.speedBonus += v.speedBonus
  }
  return boni
}

TWDS.speedcalc.getSetSpeedyValues = function (set) {
  const boni = {
    speed: 0,
    ride: 0,
    speedBonus: 0
  }
  const v = TWDS.speedcalc.getSetBonusSpeedyValues(set)
  boni.speed = v.speed
  boni.ride = v.ride
  boni.speedBonus = v.speedBonus
  let i
  for (i = 0; i < set.items.length; i++) {
    const item = ItemManager.get(set.items[i])
    const v = TWDS.speedcalc.getSpeedyValues(item)
    if (v.speed) boni.speed = v.speed // this assumes we'll never see a set with two horses...
    boni.ride += v.ride
    boni.speedBonus += v.speedBonus
  }
  return boni
}
TWDS.speedcalc.getSetBonusSpeedyValues = function (set) {
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
