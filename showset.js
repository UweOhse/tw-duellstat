// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.showset = {}
TWDS.showset.getcontent = function (win) {
  const key = win._TWDS_key
  const level = parseInt(win._TWDS_level)
  const set = west.storage.ItemSetManager.get(key)
  const subtype = win._TWDS_sub_type // shot, hand

  const content = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_showset_content'
  })
  const selectors = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_showset_selectors',
    last: content
  })
  const levelselector = TWDS.createEle({
    nodeName: 'select',
    onchange: function () {
      win._TWDS_level = this.value
      TWDS.showset.reload(win)
    },
    style: {
      display: 'block'
    },
    last: selectors
  })
  TWDS.createEle({
    nodeName: 'select',
    onchange: function () {
      win._TWDS_sub_type = this.value
      TWDS.showset.reload(win)
    },
    style: {
      display: 'block'
    },
    last: selectors,
    children: [
      { nodeName: 'option', value: 'shot', selected: subtype === 'shot', textContent: TWDS._('SHOTWEAPON', 'Firearm') },
      { nodeName: 'option', value: 'hand', selected: subtype !== 'shot', textContent: TWDS._('HANDWEAPON', 'Melee Weapon') }
    ]
  })

  const selopts = []
  selopts[0] = TWDS._('SHOWSET_SELECT_LEVEL', 'Select level')
  selopts[100] = '100'
  selopts[125] = '125'
  selopts[150] = '150'
  selopts[250] = '250'
  selopts[Character.level] = Character.level
  for (let i = 0; i <= 250; i++) {
    const str = selopts[i]
    if (str) {
      let selected = false
      if (i === level) { selected = true }
      levelselector.appendChild(TWDS.createElement({
        nodeName: 'option',
        value: i,
        textContent: str,
        selected: selected
      }))
    }
  }
  let dummyChar = null
  if (level) {
    dummyChar = {
      level: level
    }
  }

  const topcontainer = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_topcontainer',
    last: content
  })
  const theresult = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_resultcontainer',
    last: topcontainer
  })
  const theset = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_setcontainer',
    last: topcontainer
  })

  function fixDescNumber (r) {
    if (r.type === 'character') {
      r.desc = r.desc.replace(/([0-9.]+)/, r.bonus.value.toFixed(2))
    }
  }

  const extractor = new west.item.BonusExtractor(dummyChar)
  const extractor1 = new west.item.BonusExtractor({ level: 1 })
  let numitems = 0
  for (let i = 0; i < set.items.length; i++) {
    const checkvalue = Math.pow(2, i)
    const item = ItemManager.getByBaseId(set.items[i])
    if (item.type === 'right_arm') {
      if (item.sub_type !== subtype) { continue }
    }
    if (win._TWDS_items & checkvalue) { numitems++ }
  }

  const setbonuses = set.getMergedStages(numitems)
  const leveledresult = {}
  //
  setbonuses.sort(function (a, b) {
    const isSomething = function (b, x) {
      return (b.bonus ? b.bonus.type : b.type) === x ? (b.bonus ? b.bonus.name : b.name) : false
    }
    const aIsAttr = isSomething(a, 'attribute')
    const bIsAddr = isSomething(b, 'attribute')
    const aIsSkill = isSomething(a, 'skill')
    const bIsSkill = isSomething(b, 'skill')
    if (aIsAttr && bIsAddr) {
      return aIsAttr < bIsAddr ? -1 : 1
    }
    if (aIsAttr) return -1
    if (bIsAddr) return 1
    if (aIsSkill && bIsSkill) return 0
    if (aIsSkill) return -1
    if (bIsSkill) return 1
    return 0
  })
  if (setbonuses !== null && setbonuses.length > 0) {
    TWDS.createEle({ nodeName: 'br', last: theset })
    TWDS.createEle({ nodeName: 'br', last: theset })
    TWDS.createEle({
      nodeName: 'div',
      className: 'item_set_bonus',
      children: [
        {
          nodeName: 'span',
          className: 'text_bold',
          textContent: 'Set Bonus: ' + numitems
        },
        { nodeName: 'br' }
      ],
      last: theset
    })
    const ul = TWDS.createEle(
      {
        nodeName: 'ul',
        className: 'inventory_popup_bonus_skills',
        last: theset
      })
    for (let i = 0; i < setbonuses.length; i++) {
      fixDescNumber(setbonuses[i])
      TWDS.createEle({
        nodeName: 'li',
        className: 'tw_green',
        textContent: extractor.getDesc(setbonuses[i]),
        last: ul
      })
      const x = extractor.getExportValue(setbonuses[i])
      if (x.key in leveledresult) {
        leveledresult[x.key] += x.value
      } else {
        leveledresult[x.key] = x.value
      }
    }
  }

  content.appendChild(TWDS.createEle({ nodeName: 'hr' }))
  const ct = TWDS.createEle({ nodeName: 'div', className: 'TWDS_itemcontainer' })
  content.appendChild(ct)

  const result = JSON.parse(JSON.stringify(setbonuses)) // deep clone

  const merge = function (b) {
    let found = false
    for (let i = 0; i < result.length; i++) {
      const r = result[i]
      if (r.type !== b.type) continue
      if (b.type === 'character') {
        if (r.key !== b.key) continue
        if (r.bonus.type !== b.bonus.type) continue
        if (r.bonus.name !== b.bonus.name) continue
        r.bonus.value += b.bonus.value
        found = true
        break
      }
      if (b.type !== r.type) continue
      r.value += b.value
      found = true
    }
    if (!found) {
      result.push(JSON.parse(JSON.stringify(b)))
    }
  }

  for (let i = 0; i < set.items.length; i++) {
    const itemlevel = win._TWDS_itemlevels[i]
    const leveledid = itemlevel + 1000 * set.items[i]
    const item = ItemManager.get(leveledid)
    if (item.type === 'right_arm') {
      if (item.sub_type !== subtype) { continue }
    }
    const p = new ItemPopup(item, {
      character: dummyChar
    })
    const tmp = TWDS.createEle({
      nodeName: 'div',
      className: 'TWDS_item',
      innerHTML: p.popup.text
    })

    const checkvalue = Math.pow(2, i)
    const checked = win._TWDS_items & checkvalue

    TWDS.createEle({
      nodeName: 'input',
      type: 'checkbox',
      value: checkvalue,
      checked: checked,
      onchange: function (ev) {
        const v = this.value
        if (this.checked) {
          win._TWDS_items |= v
        } else {
          win._TWDS_items &= ~v
        }
        TWDS.showset.reload(win)
      },
      first: tmp
    })
    TWDS.createEle({
      nodeName: 'select',
      type: 'checkbox',
      value: itemlevel,
      dataset: {
        idx: i
      },
      children: [
        { nodeName: 'option', value: 0, textContent: 0, selected: itemlevel === 0 },
        { nodeName: 'option', value: 1, textContent: 1, selected: itemlevel === 1 },
        { nodeName: 'option', value: 2, textContent: 2, selected: itemlevel === 2 },
        { nodeName: 'option', value: 3, textContent: 3, selected: itemlevel === 3 },
        { nodeName: 'option', value: 4, textContent: 4, selected: itemlevel === 4 },
        { nodeName: 'option', value: 5, textContent: 5, selected: itemlevel === 5 }
      ],
      onchange: function (ev) {
        const v = parseInt(this.value)
        win._TWDS_itemlevels[i] = v
        TWDS.showset.reload(win)
      },
      first: tmp
    })
    ct.appendChild(tmp)
    if (win._TWDS_items & checkvalue) {
      const ex = new west.item.BonusExtractor(dummyChar, win._TWDS_itemlevels[i])
      if (item.bonus.item.length) {
        for (let k = 0; k < item.bonus.item.length; k++) {
          const b = item.bonus.item[k]
          if (b.type === 'damage' || (b.type === 'character' && b.bonus.type === 'damage')) { continue }
          merge(b)
          const x = ex.getExportValue(b)
          if (x.key in leveledresult) {
            leveledresult[x.key] += x.value
          } else {
            leveledresult[x.key] = x.value
          }
        }
      }
    }
  }

  TWDS.createEle({
    nodeName: 'div',
    className: 'item_set_bonus',
    children: [
      {
        nodeName: 'span',
        className: 'text_bold',
        textContent: 'Total Bonus:'
      },
      { nodeName: 'br' }
    ],
    last: theresult
  })

  result.sort(function (a, b) {
    const isSomething = function (b, x) {
      return (b.bonus ? b.bonus.type : b.type) === x ? (b.bonus ? b.bonus.name : b.name) : false
    }
    const aIsAttr = isSomething(a, 'attribute')
    const bIsAddr = isSomething(b, 'attribute')
    const aIsSkill = isSomething(a, 'skill')
    const bIsSkill = isSomething(b, 'skill')
    if (aIsAttr && bIsAddr) {
      return aIsAttr < bIsAddr ? -1 : 1
    }
    if (aIsAttr) return -1
    if (bIsAddr) return 1
    if (aIsSkill && bIsSkill) return 0
    if (aIsSkill) return -1
    if (bIsSkill) return 1
    return 0
  })
  if (result !== null && result.length > 0) {
    const ul = TWDS.createEle(
      {
        nodeName: 'ul',
        className: 'inventory_popup_bonus_skills',
        last: theresult
      })
    for (let i = 0; i < result.length; i++) {
      const x = extractor.getExportValue(result[i])
      let output
      if (level === 0) {
        fixDescNumber(result[i])
        output = extractor.getDesc(result[i])
      } else {
        if ('value' in result[i]) {
          result[i].value = leveledresult[x.key]
        } else {
          result[i].bonus.value = leveledresult[x.key]
        }
        output = extractor1.getDesc(result[i])
      }
      TWDS.createEle({
        nodeName: 'li',
        className: 'tw_green',
        textContent: output,
        last: ul
      })
    }
  }
  return content
}
TWDS.showset.open = function (key, checkowned) {
  const set = west.storage.ItemSetManager.get(key)
  const wid = 'TWDS_showset_' + key
  const win = wman.open(wid, 'set', 'TWDS_showset')
  win.setTitle(set.name)
  if (!win._TWDS_key) {
    win._TWDS_key = key
    win._TWDS_level = Character.level
    win._TWDS_items = 65535
    win._TWDS_sub_type = 'shot'
    win._TWDS_itemlevels = []
  }
  if (checkowned) {
    win._TWDS_items = 0
    for (let i = 0; i < set.items.length; i++) {
      const checkvalue = Math.pow(2, i)
      const blist = Bag.getItemsByBaseItemId(set.items[i])
      win._TWDS_itemlevels[i] = 0
      if (blist.length) {
        win._TWDS_items |= checkvalue
        win._TWDS_itemlevels[i] = blist[0].obj.item_level
      }
    }
  } else {
    for (let i = 0; i < set.items.length; i++) {
      win._TWDS_itemlevels[i] = 0
    }
  }

  const sp = new west.gui.Scrollpane()
  const content = TWDS.showset.getcontent(win)
  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}
TWDS.showset.reload = function (win) {
  const content = TWDS.showset.getcontent(win)
  const old = TWDS.q1('.TWDS_showset_content', win.getMainDiv())
  const sp = old.parentNode
  sp.innerHTML = ''
  sp.appendChild(content)
}
