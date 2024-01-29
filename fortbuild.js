// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.fortbuild = {}
TWDS.fortbuild.data = {}
TWDS.fortbuild.dollarper15 = 60
TWDS.fortbuild.data.stages = {
  headquarter: {
    name: 'Headquarters',
    small: 10,
    medium: 10,
    756: [0, 4, 6, 8, 10, 12, 14, 16, 18, 20], // tool boxes
    742: [0, 8, 12, 16, 20, 24, 28, 32, 36, 40], // saw
    760: [0, 12, 18, 24, 30, 36, 42, 48, 54, 60], // map
    per15: {
      711: 10, // wood
      716: 3 // granite
    }
  },
  barracks: {
    name: 'Barracks',
    small: 2,
    medium: 4,
    715: [10, 20, 30, 40, 50, 60], // cloth
    704: [20, 40, 60, 80, 100, 120], // cotton
    747: [8, 16, 24, 32, 40, 48], // hammer
    per15: {
      711: 10, // wood
      790: 3 // iron rods
    }
  },
  wall: {
    name: 'Protective Barrier',
    small: 3,
    medium: 4,
    736: [6, 12, 18, 24, 30], // spade
    771: [10, 20, 30, 40, 50], // beaver trap
    711: [40, 80, 120, 160, 200], // wood,
    per15: {
      711: 5, // wood
      739: 2 // barbed wire
    }
  },
  flag: {
    name: 'Flag',
    758: [3], // union flag
    762: [2], // confederate flag
    749: [8], // lasso
    per15: {
      711: 10, // wood
      749: 1 // lasso
    }
  },
  fronttower: {
    name: 'Gates',
    small: 3,
    medium: 4,
    761: [6, 12, 18, 24, 30], // sledge hammer
    784: [10, 20, 30, 40, 50], // nails
    734: [40, 80, 120, 160, 200], // plane
    per15: {
      711: 10, // wood
      790: 3, // iron rods
      739: 2 // barbed wire
    }
  },
  tower1: { // advent
    name: "Adventurer's tower",
    small: 3,
    medium: 4,
    755: [10, 20, 30, 40, 50], // flag
    788: [8, 16, 24, 32, 40], // bell
    779: [10, 20, 30, 40, 50], // post horn
    per15: {
      711: 10, // wood
      790: 3, // iron rods
      739: 2 // barbed wire
    }
  },
  tower2: { // dueller
    name: "Duellers's tower",
    small: 3,
    medium: 4,
    755: [10, 20, 30, 40, 50], // flag
    788: [8, 16, 24, 32, 40], // bell
    780: [12, 24, 36, 48, 60], // rounds
    per15: {
      711: 10, // wood
      790: 3, // iron rods
      739: 2 // barbed wire
    }
  },
  tower3: { // worker
    name: "Workers's tower",
    small: 3,
    medium: 4,
    755: [10, 20, 30, 40, 50], // flag
    788: [8, 16, 24, 32, 40], // bell
    752: [10, 20, 30, 40, 50], // oil
    per15: {
      711: 10, // wood
      790: 3, // iron rods
      739: 2 // barbed wire
    }
  },
  tower4: { // soldier
    name: "Soldiers's tower",
    small: 3,
    medium: 4,
    755: [10, 20, 30, 40, 50], // flag
    788: [8, 16, 24, 32, 40], // bell
    1708: [9, 18, 27, 36, 45], // whiskey
    per15: {
      711: 10, // wood
      790: 3, // iron rods
      739: 2 // barbed wire
    }
  },
  storage: [
  ]
}

TWDS.fortbuild.updateInventory = function (data) {
  // un-private a few fields.
  const fortid = this.fortId
  window.FortStorageOverview.inventory = []
  window.FortStorageOverview.elInventory = $('#fortstoragedrop-' + fortid)
  window.FortStorageOverview.fortId = fortid
  const that = this

  Ajax.remoteCallMode('fort_building_headquarter', 'index', {
    fort_id: this.fortId
  }, function (resp) {
    if (typeof resp === 'string') { return new UserMessage(resp, UserMessage.TYPE_ERROR).show() }
    if (resp.page) { return new UserMessage('A guard stops you as you try to enter the fort.', UserMessage.TYPE_ERROR).show() }
    const buildings = resp.build.buildings
    const mats = {}
    const matstext = {}
    let totalstages = 0
    const totalstageinfo = []
    for (let i = 0; i < buildings.length; i++) {
      const b = buildings[i]
      const key = b.key
      const bmats = TWDS.fortbuild.data.stages[key]
      let stagesdone = false
      for (let [k, ar] of Object.entries(bmats)) {
        k = parseInt(k)
        if (!k) continue
        if (!mats[k]) {
          mats[k] = 0
          matstext[k] = []
        }
        let nstages = 0
        for (let j = b.stage; j < b.maxStage; j++) {
          if (j === b.stage && !b.yieldStageUpRequirement) continue // unlocked.
          const n = ar[j]
          mats[k] += n
          matstext[k].push(TWDS._('FORTBUILD_ONESTAGEINFO',
            '$mats$ for stage $stage$ of $bname$', {
              mats: n,
              stage: j,
              bname: b.name
            }))
          nstages++
        }
        if (nstages && !stagesdone) {
          stagesdone++
          totalstages += nstages
          totalstageinfo.push(TWDS._('FORTBUILD_TOTALSTAGEINFO', '$nstages$ of $bname$', {
            nstages: nstages,
            bname: b.name
          }))

          for (let [k15, n15] of Object.entries(bmats.per15)) {
            k15 = parseInt(k15)
            n15 = parseInt(n15)
            if (!mats[k15]) {
              mats[k15] = 0
              matstext[k15] = []
            }
            mats[k15] += n15 * nstages
            matstext[k15].push(
              TWDS._('FORTBUILD_ALLSTAGEINFO',
                'At least $mats$ for $nstages$ stages of $bname$', {
                  mats: n15 * nstages,
                  nstages: nstages,
                  bname: b.name
                }))
          }
        }
      }
    }
    const droparea = TWDS.q1('#fortstoragedrop-' + fortid)
    if (droparea) {
      droparea.dataset.matsneeded = JSON.stringify(mats)
      droparea.dataset.matstext = JSON.stringify(matstext)
      droparea.dataset.totalstages = JSON.stringify(totalstages)
      droparea.dataset.totalstageinfo = JSON.stringify(totalstageinfo)
      window.FortStorageOverview.TWDS_backup_updateInventory.apply(that, [data])
    }
  })
}
TWDS.fortbuild.addItem = function (id, count) {
  const ret = window.FortStorageOverview.TWDS_backup_addItem.apply(this, [id, count])
  const droparea = TWDS.q1('#fortstoragedrop-' + this.fortId)
  let mats = droparea.dataset.matsneeded
  // console.log('MATS', mats)
  if (mats) mats = JSON.parse(mats)
  const all = TWDS.q('.item_fortstorage', droparea)
  if (!all) return ret
  if (!all.length) return ret
  const last = all[all.length - 1]
  last.dataset.twds_itemid = id
  last.classList.add('TWDS_fortbuild_rs')
  // console.log('MATS', mats)
  if (mats && mats[id / 1000]) {
    const x = TWDS.q1("[data-twds_itemid='" + (id) + "'", droparea)
    // console.log('aI', id, count, x)
    if (x) {
      const c = TWDS.q1('.count-required', x)
      if (c) {
        c.classList.add('TWDS_has_required')
        // console.log('C add', c, c.classList)
        c.textContent = mats[id / 1000]
      }
    }
  }
  return ret
}
TWDS.fortbuild.maxPutInCount = function (item) {
  let x = item.count
  const mc = TWDS.q1('#fortstorage_putin_max_item')
  if (mc && mc.dataset.max) { x = mc.dataset.max }
  $('#fortstorage_popup_input').val(x)
}
TWDS.fortbuild.putin = function (el) {
  console.log('PUTIN', el, el[0].dataset, el.data('itemId'))
  const itemid = el.data('itemId')
  if (!itemid) return

  const bid = Math.round(itemid / 1000)
  const ret = window.FortStorageOverview.TWDS_backup_putin.apply(this, [el])
  const dia = TWDS.q1('.tw2gui_dialog')
  if (!dia) return ret
  const droparea = TWDS.q1('#fortstoragedrop-' + this.fortId)
  if (!droparea) return ret
  let mats = droparea.dataset.matsneeded
  if (!mats) return ret

  if (mats) mats = JSON.parse(mats)
  if (!mats[bid]) return ret
  const total = mats[bid]

  const ele = TWDS.q1(".item_fortstorage[data-twds_itemid='" + itemid + "'", droparea)
  let instore = 0
  if (ele) {
    const countele = TWDS.q1('.count', ele)
    if (countele) {
      instore = parseInt(countele.textContent)
    }
  }
  const max = total - instore
  console.log('MAX', max)

  const mc = TWDS.q1('#fortstorage_putin_max_item')
  if (!mc) return ret
  mc.dataset.max = max
  mc.textContent = '(' + max + ')'
}
TWDS.fortbuild.matinfowindow = function () {
  const fortid = window.FortStorageOverview.fortId
  const droparea = TWDS.q1('#fortstoragedrop-' + fortid)
  if (!droparea) return
  const matsneeded = JSON.parse(droparea.dataset.matsneeded)
  const matstext = JSON.parse(droparea.dataset.matstext)
  const totalstages = JSON.parse(droparea.dataset.totalstages)
  const totalstageinfo = JSON.parse(droparea.dataset.totalstageinfo)
  const w = droparea.closest('.tw2gui_window')
  if (!w) return
  let cash = TWDS.q1('.detail-cash', w)
  if (!cash) {
    cash = 0
  } else {
    cash = parseInt(cash.textContent)
  }

  const wid = 'TWDS_fbmatinfo_window'
  const win = wman.open(wid, 'Matinfo')
  win.setTitle(TWDS._('FORTBUILD_WINDOW_TITLE', 'Resources needed'))
  win.setMiniTitle(TWDS._('FORTBUILD_MINITITLE', 'Needed'))
  const sp = new west.gui.Scrollpane()
  win.appendToContentPane(sp.getMainDiv())

  const content = TWDS.createEle('div')
  const tab = TWDS.createEle('table', { last: content })
  let tr = TWDS.createEle('tr', { last: tab })
  TWDS.createEle('th.item', { last: tr, textContent: TWDS._('FORTBUILD_ITEM', 'Item') })
  TWDS.createEle('th.instock', { last: tr, textContent: TWDS._('FORTBUILD_INSTOCK', 'In Stock') })
  TWDS.createEle('th.brutto', { last: tr, textContent: TWDS._('FORTBUILD_BRUTTO', 'Brutto') })
  TWDS.createEle('th.netto', { last: tr, textContent: TWDS._('FORTBUILD_NETTO', 'Netto') })
  TWDS.createEle('th.info', { last: tr, textContent: TWDS._('FORTBUILD_INFO', 'Info') })
  let chattext = ''
  for (const k of Object.keys(matsneeded)) {
    if (!matsneeded[k]) continue
    const kfull = k * 1000
    const di = TWDS.q1(".item_fortstorage[data-twds_itemid='" + kfull + "']", droparea)

    let count = 0
    if (di) {
      const x = TWDS.q1('.count', di)
      if (x) count = parseInt(x.textContent)
    }
    const netto = matsneeded[k] - count

    TWDS.createEle('tr', { last: tab })
    const it = new tw2widget.Item(ItemManager.getByBaseId(k), 'item_fortstorage')

    it.setCount(count)
    TWDS.createEle('th.item', { last: tab, children: [it.getMainDiv()[0]] })
    TWDS.createEle('td.instock', { last: tab, textContent: count })
    TWDS.createEle('td.brutto', { last: tab, textContent: matsneeded[k] })
    TWDS.createEle('th.netto' + (netto < 0 ? '.overfilled' : ''),
      { last: tab, textContent: netto, style: { verticalAlign: 'top' } })
    const td = TWDS.createEle('td.info', { last: tab, textContent: '' })
    const info = matstext[k]
    for (let i = 0; i < info.length; i++) {
      TWDS.createEle('div', { last: td, textContent: info[i] })
    }
    if (netto > 0) {
      if (chattext > '') chattext += ' + '
      chattext += netto + ' [item=' + kfull + ']'
    }
  }
  tr = TWDS.createEle('tr', { last: tab })
  TWDS.createEle('th.item', { last: tr, textContent: '$' })
  TWDS.createEle('td.instock', { last: tr, textContent: cash })
  const cashbrutto = totalstages * TWDS.fortbuild.dollarper15
  const cashnetto = cashbrutto - cash
  TWDS.createEle('td.brutto', { last: tr, textContent: cashbrutto })
  TWDS.createEle('th.netto' + (cashnetto < 0 ? '.overfilled' : ''), { last: tr, textContent: cashnetto })
  if (cashnetto > 0) {
    if (chattext > '') chattext += ' + '
    chattext += '$' + cashnetto
  }
  const td = TWDS.createEle('td.info', { last: tr, textContent: '' })
  for (let i = 0; i < totalstageinfo.length; i++) {
    if (i === 0) {
      TWDS.createEle('div', {
        last: td,
        textContent: TWDS._('FORTBUILD_ALLSTAGEINFOTOTAL',
          'At least $$mats$ for $nstages$ stages:', {
            mats: cashbrutto,
            nstages: totalstages
          })
      })
    }
    TWDS.createEle('div', {
      last: td,
      textContent: totalstageinfo[i]
    })
  }
  if (chattext > '') {
    TWDS.createEle('h2', {
      last: content,
      textContent: 'Cut & Paste'
    })
    TWDS.createEle('p', {
      last: content,
      textContent: chattext
    })
  } else {
    TWDS.createEle('p', {
      last: content,
      textContent: TWDS._('FORTBUILD_ALLDONE', 'No further resources are needed in this fort.')
    })
  }

  sp.appendContent(content)
}
TWDS.fortbuild.overviewinit = function () {
  window.FortStorageOverview.TWDS_backup_init.apply(this, arguments)
  const fo = TWDS.q1('.tw2gui_window.fortstorage .fortstorage-overview')
  console.log('oi on', fo)
  if (!fo) return
  const b = TWDS.createButton(TWDS._('FORTBUILD_NEEDED', 'Needed'), {
    last: fo,
    onclick: function () {
      TWDS.fortbuild.matinfowindow()
    },
    style: {
      position: 'absolute',
      right: '0px',
      top: '-12px'
    }
  })
  console.log('b is', b)
}

TWDS.fortbuild.startfunc = function () {
  window.FortStorageOverview.TWDS_backup_updateInventory =
    window.FortStorageOverview.TWDS_backup_updateInventory || window.FortStorageOverview.updateInventory
  window.FortStorageOverview.updateInventory = TWDS.fortbuild.updateInventory
  window.FortStorageOverview.TWDS_backup_addItem =
    window.FortStorageOverview.TWDS_backup_addItem || window.FortStorageOverview.addItem
  window.FortStorageOverview.addItem = TWDS.fortbuild.addItem
  window.FortStorageOverview.TWDS_backup_putin =
    window.FortStorageOverview.TWDS_backup_putin || window.FortStorageOverview.putin
  window.FortStorageOverview.putin = TWDS.fortbuild.putin
  window.FortStorageOverview.TWDS_backup_maxPutInCount =
    window.FortStorageOverview.TWDS_backup_maxPutInCount || window.FortStorageOverview.maxPutInCount
  window.FortStorageOverview.maxPutInCount = TWDS.fortbuild.maxPutInCount
  window.FortStorageOverview.TWDS_backup_init =
    window.FortStorageOverview.TWDS_backup_init || window.FortStorageOverview.init
  window.FortStorageOverview.init = TWDS.fortbuild.overviewinit
}
TWDS.registerStartFunc(TWDS.fortbuild.startfunc)
