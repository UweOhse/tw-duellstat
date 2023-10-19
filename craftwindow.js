// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.craftwindow = {}
TWDS.craftwindow.searchitem = function (str) {
}

TWDS.craftwindow.recalcmax = function (win) {
  // TWDS.delegate(content, 'change', '.search', function (ev) {
  const searchfilter = TWDS.q1('.head .searchfilter', win.divMain).value.trim()
  const quickfilter = TWDS.q1('.head .quickfilter', win.divMain).value.trim()
  const proffilter = parseInt(TWDS.q1('.head .proffilter', win.divMain).value)
  const pointfilter = TWDS.q1('.head input.pointfilter', win.divMain).checked
  const blocktimefilter = TWDS.q1('.head input.blocktimefilter', win.divMain).checked
  const allrows = TWDS.q('.recipeline', win.divMain)
  let rx
  if (searchfilter > '') {
    rx = new RegExp(searchfilter, 'i')
  }
  for (let i = 0; i < allrows.length; i++) {
    const tr = allrows[i]
    const recid = tr.dataset.recipeId
    const itemid = tr.dataset.itemId
    const item = ItemManager.get(itemid)
    const rec = ItemManager.get(recid)
    if (!rec) {
      continue
    }
    const rs = rec.resources
    let hide = false
    tr.style.display = ''
    tr.nextSibling.style.display = ''
    if (searchfilter > '') {
      hide = true
      if (rec.name.search(rx) > -1) {
        hide = false
      }
      if (item.name.search(rx) > -1) {
        hide = false
      }
      for (let j = 0; j < rs.length; j++) {
        const rid = rs[j].item
        const ritem = ItemManager.get(rid)
        if (ritem.name.search(rx) > -1) {
          hide = false
        }
      }
    }
    if (quickfilter > '') {
      if (!TWDS.quickusables.match(item, quickfilter)) { hide = true }
    }
    if (proffilter !== 0) {
      if (proffilter !== rec.profession_id) { hide = true }
    }
    if (pointfilter) {
      if (!(tr.classList.contains('cangetpoints'))) { hide = true }
    }
    if (blocktimefilter) {
      if (!(tr.classList.contains('hasblocktime'))) { hide = true }
    }
    if (hide) {
      tr.style.display = 'none'
      tr.nextSibling.style.display = 'none'
    }
    let max = -1
    for (let j = 0; j < rs.length; j++) {
      const rid = rs[j].item
      const count = rs[j].count
      if (!count) continue
      let inbag = Bag.getItemByItemId(rid)
      if (!inbag) {
        max = 0
        continue
      }
      inbag = inbag.count
      const x = Math.floor(parseInt(inbag) / parseInt(count))
      if (max === -1 || x < max) { max = x }
    }
    if (max === -1) max = 0
    if (rec.blocktime && max) { max = 1 }
    const blocktimeinfo = TWDS.q1('.blocktimeinfo', tr)
    let blocked = false
    blocktimeinfo.style.display = 'none'
    if (rec.blocktime) {
      const lastcraft = TWDS.crafting.myrecipes[recid]
      if (lastcraft) {
        blocktimeinfo.textContent = lastcraft.formatDurationBuffWay()
        blocktimeinfo.style.display = 'inline'
        blocked = true
      }
      tr.classList.add('hasblocktime')
    }
    const maxele = TWDS.q1('.max', tr)
    const inputele = TWDS.q1('.theinput', tr)
    maxele.textContent = '(' + max + ')'
    maxele.dataset.sortval = max
    inputele.max = max
    inputele.min = 0
    const v = parseInt(inputele.value)
    if (v > max) { inputele.value = max }
    let mid
    if (rec.skillcolor) {
      mid = rec.max_level
    } else {
      mid = rec.min_level + Math.round((rec.max_level - rec.min_level) / 2)
    }
    tr.classList.remove('cangetpoints')
    TWDS.q1('.levels', tr).dataset.sortval = rec.min_level
    TWDS.q1('.levels', tr).dataset.sortval2 = mid
    TWDS.q1('.levels .midlevel', tr).classList.remove('current')
    TWDS.q1('.levels .maxlevel', tr).classList.remove('current')
    if (Character.professionId === rec.profession_id &&
      Character.professionSkill >= rec.min_level &&
      Character.professionSkill <= rec.max_level) {
      if (Character.professionSkill <= mid) {
        TWDS.q1('.levels .minlevel', tr).classList.add('current')
      } else {
        TWDS.q1('.levels .maxlevel', tr).classList.add('current')
      }
      if (itemid in TWDS.crafting.mycraftableitems) {
        tr.classList.add('cangetpoints')
      }
    }
    const ib = TWDS.q1('.inbag', tr)
    const inbag = Bag.getItemByItemId(itemid)
    ib.textContent = ''
    ib.dataset.sortval = 0
    if (inbag && inbag.count) {
      ib.textContent = inbag.count
      ib.dataset.sortval = inbag.count
    }

    const craftbutton = TWDS.q1('.docraft', tr)
    const learnbutton = TWDS.q1('.dolearn', tr)
    const profinfo = TWDS.q1('.profinfo', tr)
    craftbutton.style.display = 'none'
    learnbutton.style.display = 'none'
    profinfo.style.display = 'inline'
    if (Character.professionId === rec.profession_id && !blocked) {
      if (itemid in TWDS.crafting.mycraftableitems) {
        craftbutton.style.display = 'inline'
        profinfo.style.display = 'none'
      } else if (Character.professionSkill >= rec.min_level) {
        const inbag = Bag.getItemByItemId(recid)
        if (inbag) {
          learnbutton.style.display = 'inline'
          profinfo.style.display = 'none'
        }
      }
    }
    if (blocked) {
      profinfo.style.display = 'none'
    }

    TWDS.craftwindow.updateresourceline(tr, tr.nextSibling)
  }
}

TWDS.craftwindow.getcontent = function (win) {
  const content = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_craftwindow_content'
  })
  const myhead = TWDS.createEle({
    nodeName: 'div',
    className: 'head',
    last: content
  })
  const h3 = TWDS.createEle({
    nodeName: 'h3',
    last: myhead
  })
  TWDS.createEle({
    nodeName: 'span',
    textContent: Game.InfoHandler.getLocalString4ProfessionId(Character.professionId),
    last: h3
  })
  TWDS.createEle({
    nodeName: 'span',
    className: 'skill_level',
    textContent: Character.professionSkill,
    last: h3
  })

  TWDS.createEle({
    nodeName: 'label',
    className: 'pointfilter',
    last: myhead,
    title: TWDS._('CRAFTWINDOW_POINTS_TITLE', 'show only recipes giving craft points'),
    children: [
      { nodeName: 'input', type: 'checkbox', value: 1, className: 'pointfilter' },
      { nodeName: 'span', textContent: TWDS._('CRAFTWINDOW_CHECKBOX_LABEL_POINTS', 'points only') }
    ]
  })
  TWDS.createEle({
    nodeName: 'label',
    className: 'blocktimefilter',
    last: myhead,
    title: TWDS._('CRAFTWINDOW_BLOCKTIMEFILTER_TITLE', 'show only recipes with a blocktime (cooldown period)'),
    children: [
      { nodeName: 'input', type: 'checkbox', value: 1, className: 'blocktimefilter' },
      { nodeName: 'span', textContent: TWDS._('CRAFTWINDOW_CHECKBOX_LABEL_BLOCKTIME', 'blocktime only') }
    ]
  })
  const profsel = TWDS.createEle({
    nodeName: 'select',
    className: 'proffilter',
    placeholder: TWDS._('CRAFTWINDOW_PROF_FILTER', 'profession filter'),
    last: myhead
  })
  TWDS.createEle({ nodeName: 'option', value: 0, last: profsel, selected: Character.professionId === 0, textContent: TWDS._('CRAFTWINDOW_PROF_FILTER', 'Profession') })
  for (let i = 1; i <= 4; i++) {
    TWDS.createEle({ nodeName: 'option', value: i, last: profsel, selected: i === Character.professionId, textContent: Game.InfoHandler.getLocalString4ProfessionId(i) })
  }

  const sel = TWDS.createEle({
    nodeName: 'select',
    className: 'quickfilter',
    last: myhead
  })
  const qc = TWDS.quickusables.getcategories(0)
  TWDS.createEle({
    nodeName: 'option',
    value: '',
    last: sel,
    textContent: TWDS._('CRAFTWINDOW_QUICK_FILTER', 'Effects')
  })
  for (let i = 0; i < qc.length; i++) {
    TWDS.createEle({
      nodeName: 'option',
      value: qc[i],
      last: sel,
      textContent: TWDS.quickusables.getcatdesc(qc[i])
    })
  }

  TWDS.createEle({
    nodeName: 'input',
    type: 'text',
    className: 'searchfilter',
    placeholder: TWDS._('CRAFTWINDOW_SEARCH_FILTER', 'Search/filter'),
    last: myhead
  })

  TWDS.createEle({ nodeName: 'div', className: 'TWDS_craftwindow_divider1', last: content })
  const table = TWDS.createEle({
    nodeName: 'table',
    className: 'TWDS_craftwindow_table TWDS_sortable',
    last: content
  })
  TWDS.createEle({
    nodeName: 'thead',
    last: table,
    children: [
      {
        nodeName: 'tr',
        children: [
          { nodeName: 'th', textContent: '+/-' },
          { nodeName: 'th', textContent: TWDS._('CRAFTWINDOW_TH_PRODUCTNAME', 'Product'), dataset: { colsel: '.name' } },
          {
            nodeName: 'th',
            textContent: TWDS._('CRAFTWINDOW_TH_POINTS', 'C. Level'),
            dataset: { sortmode: 'number', colsel: '.levels' },
            title: TWDS._('CRAFTWINDOW_TH_POINTS_TITLE', 'Crafting levels. High chance to gain a level / low chance / no chance.')
          },
          {
            nodeName: 'th',
            textContent: TWDS._('CRAFTWINDOW_TH_INPUT', '# To Craft'),
            dataset: { sortmode: 'number', colsel: '.numcraftable', sortdefaultorder: -1 },
            title: TWDS._('CRAFTWINDOW_TH_INPUT_TITLE',
              'The number of items you want to craft, and the number of items you have the resources to craft.')
          },
          {
            nodeName: 'th',
            textContent: TWDS._('CRAFTWINDOW_TH_CRAFTORJOB', 'Craft'),
            title: TWDS._('CRAFTWINDOW_TH_CRAFTORJOB_TITLE', 'Either the crafting button, or the name of the craft needed for the job. If it shows your craft name, then you have not learned that recipe')
          },
          {
            nodeName: 'th',
            textContent: TWDS._('CRAFTWINDOW_TH_INBAG', '#'),
            dataset: { sortmode: 'number', colsel: '.inbag', sortdefaultorder: -1 },
            title: TWDS._('CRAFTWINDOW_TH_INBAG_TITLE', 'Nummer of item in your inventory')
          }
        ]
      }
    ]
  })
  const tbody = TWDS.createEle({
    nodeName: 'tbody',
    last: table
  })

  const a = win._TWDS_craftitems
  const b = []
  for (const itemid of Object.keys(a)) {
    const recid = a[itemid]
    b.push([itemid, ItemManager.get(itemid).name, recid])
  }
  b.sort(function (a, b) {
    return a[1].trim().localeCompare(b[1].trim())
  })
  /*
  TWDS.createEle({
    nodeName: 'option',
    value: '',
    textContent: TWDS._('PLEASE_SELECT', 'please select'),
    last: itemselector
  })
  */
  for (let i = 0; i < b.length; i++) {
    const it = b[i][0]
    const n = b[i][1]
    const r = b[i][2]
    const rec = ItemManager.get(r)
    let mid
    if (rec.skillcolor) {
      mid = rec.max_level
    } else {
      mid = rec.min_level + Math.round((rec.max_level - rec.min_level) / 2)
    }

    const tr = TWDS.createEle({
      nodeName: 'tr',
      className: 'recipeline',
      dataset: {
        recipeId: r,
        itemId: b[i][0]
      },
      last: tbody
    })
    TWDS.createEle({
      nodeName: 'td',
      textContent: '+',
      className: 'toggle TWDS_clicktarget',
      last: tr
    })
    TWDS.createEle({
      nodeName: 'th',
      className: 'name',
      textContent: n,
      last: tr
    })
    TWDS.createEle({
      nodeName: 'td',
      className: 'levels',
      last: tr,
      children: [
        { nodeName: 'span', className: 'minlevel', textContent: rec.min_level },
        { nodeName: 'span', textContent: '/' },
        { nodeName: 'span', className: 'midlevel', textContent: mid },
        { nodeName: 'span', textContent: '/' },
        { nodeName: 'span', className: 'maxlevel', textContent: rec.max_level }
      ]
    })
    TWDS.createEle({
      nodeName: 'td',
      last: tr,
      children: [
        { nodeName: 'input', type: 'number', value: 1, className: 'theinput' },
        {
          nodeName: 'span',
          textContent: '0',
          className: 'numcraftable max TWDS_clicktarget',
          title: TWDS._('CRAFTWINDOW_TITLE_MAX', 'Sets the maximum amount - 1 if the recipe has a cooldown')
        }
      ]
    })
    const ccon = TWDS.createEle({
      nodeName: 'td',
      last: tr
    })

    TWDS.createEle({
      nodeName: 'button',
      textContent: TWDS._('CRAFTWINDOW_CRAFT', 'craft'),
      className: 'docraft TWDS_clicktarget',
      last: ccon
    })
    TWDS.createEle({
      nodeName: 'button',
      textContent: TWDS._('CRAFTWINDOW_LEARN', 'learn'),
      className: 'dolearn TWDS_clicktarget',
      dataset: {
        item_id: r
      },
      last: ccon
    })
    TWDS.createEle({
      nodeName: 'span',
      textContent: '',
      className: 'blocktimeinfo',
      title: TWDS._('CRAFTWINDOW_BLOCKTIME_INFO', 'This recipe as a cooldown period'),
      last: ccon
    })
    TWDS.createEle({
      nodeName: 'span',
      className: 'profinfo',
      textContent: Game.InfoHandler.getLocalString4ProfessionId(rec.profession_id),
      last: ccon
    })
    let inbag = Bag.getItemByItemId(it)
    if (inbag) {
      inbag = inbag.count
    } else {
      inbag = ''
    }
    TWDS.createEle({
      nodeName: 'td',
      last: tr,
      className: 'inbag',
      children: [{
        nodeName: 'span',
        textContent: inbag
      }]
    })

    TWDS.createEle({
      nodeName: 'tr',
      className: 'resourceline sortgrouped',
      dataset: {
        recipeId: r,
        itemId: b[i][0]
      },
      last: tbody
    })
  }
  TWDS.delegate(content, 'click', '.toggle, th.name', function (ev) {
    const tr0 = this.closest('tr')
    const tr1 = tr0.nextSibling
    tr1.classList.toggle('active')
    TWDS.craftwindow.updateresourceline(tr0, tr1)
  })
  TWDS.delegate(content, 'click', '.max', function (ev) {
    const tr = this.closest('tr')
    const input = TWDS.q1('.theinput', tr)
    if (input) {
      input.value = input.max
    }
    const recid = tr.dataset.recipeId
    const rec = ItemManager.get(recid)
    if (rec.blocktime) {
      input.value = 1
    }

    TWDS.craftwindow.updateresourceline(tr, tr.nextSibling)
  })
  TWDS.delegate(content, 'change', '.theinput', function (ev) {
    const tr = this.closest('tr')
    TWDS.craftwindow.updateresourceline(tr, tr.nextSibling)
  })
  TWDS.delegate(content, 'click', '.dolearn', function (ev) {
    window.ItemUse.use(this.dataset.item_id, null, 'recipe')
  })
  TWDS.delegate(content, 'click', '.docraft', function (ev) {
    const tr = this.closest('tr')
    const recid = tr.dataset.recipeId
    const amount = parseInt(TWDS.q1('.theinput', tr).value)
    if (amount && recid) {
      Ajax.remoteCall('crafting', 'start_craft', {
        recipe_id: recid,
        amount: amount
      }, function (resp) {
        const data = resp.msg
        if (resp.error) return new window.MessageError(data).show()

        const ct = tr.closest('.TWDS_craftwindow_content')
        const skl = TWDS.q1('.head .skill_level', ct)
        skl.textContent = data.profession_skill
        Character.setProfessionSkill(data.profession_skill)

        // CharacterWindow.window.$('#recipe_difficult_' + recipe_id).removeClass('middle hard easy').addClass(Crafting.getRecipeColor(ItemManager.get(recipe_id)));
        EventHandler.signal('inventory_changed')
        Character.updateDailyTask('crafts', data.count)

        TWDS.craftwindow.recalcmax(win)
        return new window.MessageSuccess(data.msg).show()
      })
    }
  })
  TWDS.delegate(content, 'click', '.TWDS_crafting_jump', function (ev) {
    const ii = this.dataset.itemid

    const r = TWDS.q1(".recipeline[data-item-id='" + ii + "']", content)
    if (r) {
      TWDS.q1('.head .searchfilter', win.divMain).value = ''
      TWDS.q1('.head .quickfilter', win.divMain).value = ''
      TWDS.q1('.head .proffilter', win.divMain).value = 0
      TWDS.q1('.head .pointfilter', win.divMain).checked = false
      TWDS.q1('.head .blocktimefilter', win.divMain).checked = false
      TWDS.craftwindow.recalcmax(win)
      r.scrollIntoView(true)
    }
  })
  TWDS.delegate(content, 'change', '.searchfilter', function (ev) {
    TWDS.craftwindow.recalcmax(win)
  })
  TWDS.delegate(content, 'change', '.quickfilter', function (ev) {
    TWDS.craftwindow.recalcmax(win)
  })
  TWDS.delegate(content, 'change', '.proffilter', function (ev) {
    TWDS.craftwindow.recalcmax(win)
  })
  TWDS.delegate(content, 'change', '.pointfilter', function (ev) {
    TWDS.craftwindow.recalcmax(win)
  })
  TWDS.delegate(content, 'change', '.blocktimefilter', function (ev) {
    TWDS.craftwindow.recalcmax(win)
  })

  return content
}
TWDS.craftwindow.craftitemdisplay = function (rsitemid, flagproduct, itemid) {
  const it = ItemManager.get(rsitemid)
  const popup = new ItemPopup(it, {}).popup.getXHTML()
  const container = TWDS.createEle('section', {
    dataset: {
      itemid: rsitemid
    }
  })
  let inbag = Bag.getItemByItemId(rsitemid)
  if (inbag) {
    inbag = inbag.count
  } else {
    inbag = 0
  }
  TWDS.createEle({
    nodeName: 'div',
    className: 'imgwrapper',
    children: [{
      nodeName: 'img',
      className: 'tw_item inventory_item',
      src: it.image,
      alt: it.name,
      title: popup
    }],
    last: container
  })
  TWDS.createEle({
    nodeName: 'div',
    className: 'numbers',
    title: flagproduct
      ? TWDS._('CRAFTWINDOW_TITLE_NUMBERS_PROD', 'Number of products in your inventory.')
      : TWDS._('CRAFTWINDOW_TITLE_NUMBERS_RS', 'resources needed / resources in your inventory.'),
    last: container
  })
  // functions
  const fnc = TWDS.createEle({
    nodeName: 'div',
    className: 'functions',
    last: container
  })
  if (JobsModel.Jobs.length) {
    const jl = JobList.getJobsByItemId(rsitemid)
    let best = null
    for (const job of jl) {
      if (best === null || job.yields[rsitemid].prop > best.yields[rsitemid].prop) {
        best = job
      }
    }

    if (best !== null) {
      // getQuicklink appends &nbsp; - get rid of this
      const t = document.createElement('span')
      t.innerHTML = MinimapWindow.getQuicklink(rsitemid, 'inventory_changed')
      fnc.appendChild(TWDS.q1('span', t))
      const b = TWDS.jobOpenButton(best.id)
      if (b != null) { // null if !automation
        fnc.appendChild(b)
      }
    }
  }

  const bb = TWDS.itemBidButton(rsitemid)
  if (bb) { fnc.appendChild(bb) }
  if (it.spec_type === 'crafting' && !flagproduct) {
    const t = new west.gui.Icon('eye')
    t.setTitle('Jump to this recipe')
    const x = t.divMain[0]
    x.classList.add('TWDS_crafting_jump')
    x.dataset.itemid = rsitemid
    fnc.appendChild(x)
  }

  if (!flagproduct) {
    const it2 = ItemManager.get(itemid)
    const b = TWDS.itemSellButton(rsitemid, 1, it2.name)
    if (b) fnc.appendChild(b)
  } else {
    const b = TWDS.itemSellButton(rsitemid, 1, '')
    if (b) fnc.appendChild(b)
  }
  return container
}
TWDS.craftwindow.itemCraftButton = function (id) {
  const it = ItemManager.get(id)
  if (!it) return null

  if (it.type !== 'yield') return null
  if (it.spec_type !== 'crafting') return null
  if (!TWDS.crafting) return null
  if (!TWDS.crafting.mycraftableitems) return null
  if (!TWDS.crafting.mycraftableitems[id]) return null

  return TWDS.createElement({
    nodeName: 'span',
    className: 'TWDS_craftwindow_jump_button',
    title: TWDS._('TWDS_CRAFTWINDOW_JUMP', 'Jump to the recipe'),
    dataset: { item_id: id },
    childNodes: [
      {
        nodeName: 'img',
        src: Game.cdnURL + '/images/icons/icon_consumable.png',
        alt: ''
      }
    ]
  })
}
TWDS.craftwindow.updateresourceline = function (tr0, tr1) {
  if (!(tr1.classList.contains('active'))) {
    return
  }

  const recid = tr0.dataset.recipeId
  const rec = ItemManager.get(recid)
  const rs = rec.resources
  const l = tr0.children.length
  const itemid = tr0.dataset.itemId

  const value = TWDS.q1('.theinput', tr0).value
  if (tr1.children.length === 0) {
    const rsele = TWDS.createEle({
      nodeName: 'td',
      colSpan: l - 1,
      last: tr1
    })
    const itele = TWDS.createEle({
      nodeName: 'td',
      last: tr1
    })
    for (let j = 0; j < rs.length; j++) {
      rsele.appendChild(TWDS.craftwindow.craftitemdisplay(rs[j].item, 0, itemid))
    }
    itele.appendChild(TWDS.craftwindow.craftitemdisplay(itemid, true))
  }
  const itele = TWDS.q1('td:last-child', tr1)
  for (let j = 0; j < rs.length; j++) {
    const rsitemid = rs[j].item
    const count = rs[j].count
    let inbag = Bag.getItemByItemId(rsitemid)
    if (inbag) {
      inbag = inbag.count
    } else {
      inbag = 0
    }
    const e = TWDS.q1("section[data-itemid='" + rs[j].item + "']", tr1)
    const div = TWDS.q1('.numbers', e)
    let t
    if (value > 1) {
      t = value + '*' + count + '=' + (value * count)
    } else {
      t = count
    }
    div.textContent = ''
    TWDS.createEle({ nodeName: 'span', textContent: t, last: div })
    TWDS.createEle({ nodeName: 'span', textContent: ' / ', last: div })
    TWDS.createEle({ nodeName: 'span', textContent: inbag, last: div })
    const x = TWDS.q1('.TWDS_item_sell_button', e)
    if (x) { x.dataset.count = count * value }
  }
  const div = TWDS.q1('.numbers', itele)
  let inbag = Bag.getItemByItemId(itemid)
  if (inbag) {
    inbag = inbag.count
  } else {
    inbag = 0
  }
  div.textContent = inbag
}

TWDS.craftwindow.open = function (initialid) {
  // load recipes again
  TWDS.crafting.start(function () {
    TWDS.craftwindow.realopen(initialid)
  })
}
TWDS.craftwindow.realopen = function (initialid) {
  const wid = 'TWDS_craftwindow'
  const win = wman.open(wid, 'set', 'TWDS_craftwindow')
  win.setTitle(TWDS._('CRAFTWINDOW_TITLE', 'Crafting'))
  win.setMiniTitle(TWDS._('CRAFTWINDOW_MINITITLE', 'Craft'))
  if (!('_TWDS_craftitems' in win)) {
    const a = ItemManager.getAll()
    win._TWDS_craftitems = {}
    const done = {}
    for (const iid of Object.keys(a)) {
      const it = a[iid]
      if ('craftitem' in it) {
        // 4 difference recipes for the same item, the 15th birthday cake. Make sure we show that of our profession.
        if (done[it.craftitem]) {
          if (it.profession_id !== Character.professionId) {
            continue
          }
        }
        win._TWDS_craftitems[it.craftitem] = it.item_id
        done[it.craftitem] = 1
      }
    }
  }
  const sp = new west.gui.Scrollpane()
  const content = TWDS.craftwindow.getcontent(win)
  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
  TWDS.craftwindow.recalcmax(win)
  if (initialid) {
    const r = TWDS.q1(".recipeline[data-item-id='" + initialid + "']", content)
    if (r) {
      r.scrollIntoView(true)
    }
  }
}
TWDS.craftwindow.togglemenudone = false
TWDS.craftwindow.togglemenu = function (val) {
  const entry = $('.button.crafting.background')
  if (val) {
    entry.off('click').on('click', () => { TWDS.craftwindow.open() })
    TWDS.craftwindow.togglemenudone = true
  } else {
    if (TWDS.craftwindow.togglemenudone) { entry.off('click') }
  }
}
TWDS.craftwindow.sorter = function (ev) { TWDS.craftwindow.sorterReal(ev) }
TWDS.craftwindow.sorterReal = function (ev) {

}

TWDS.craftwindow.reload = function (win) {
  const content = TWDS.craftwindow.getcontent(win)
  const old = TWDS.q1('.TWDS_craftwindow_content', win.getMainDiv())
  const sp = old.parentNode
  sp.innerHTML = ''
  sp.appendChild(content)
}
TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'craftwindow_replace',
    TWDS._('CRAFTWINDOW_SETTING_REPLACE',
      'Replace the native craft window in the menu by a new one.'),
    false,
    TWDS.craftwindow.togglemenu,
    'misc'
  )
  TWDS.delegate(document, 'click', '.TWDS_craftwindow_table thead th[data-colsel]', TWDS.sortable.do)
  TWDS.delegate(document, 'click', '.TWDS_craft_button', function (ev) {
    const ii = this.dataset.item_id
    if (TWDS.settings.craftwindow_replace) {
      TWDS.craftwindow.open(ii)
    } else if ('TW_Calc' in window) {
      window.TW_Calc.openCraftRecipeWindow(ii)
    } else {
      CharacterWindow.open('crafting')
    }
  })
  const handler = function (x) {
    const win = wman.getById('TWDS_craftwindow')
    if (win) {
      setTimeout(function () {
        const win = wman.getById('TWDS_craftwindow')
        if (typeof (win) !== 'undefined') {
          TWDS.craftwindow.recalcmax(win)
        }
      }, 2500)
    }
  }
  EventHandler.listen('inventory_changed', function () { handler('inventory_changed') })
  EventHandler.listen('bag_add', function () { handler('bag_add') })
  EventHandler.listen('wear_changed', function () { handler('wear_changed') })
  /*
  EventHandler.listen(['bag_add', 'inventory_changed', 'wear_changed'], function (e) {
    const win = wman.getById('TWDS_craftwindow')
    if (win) {
      console.log("CHANGE", Bag.getItemByItemId(708000).count)
      setTimeout(function() {
        const win = wman.getById('TWDS_craftwindow')
        if (typeof (win) !== 'undefined') {
          console.log("CHANGE call recalcmax", Bag.getItemByItemId(708000).count)
          TWDS.craftwindow.recalcmax(win);
        }
      },500);
    }
  })
  */
})
TWDS.registerExtra('TWDS.craftwindow.open',
  TWDS._('CRAFTWINDOW_TITLE', 'Crafting'),
  TWDS._('CRAFTWINDOW_DESC', 'Crafting overview')
)
