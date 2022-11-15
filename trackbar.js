// vim: tabstop=2 shiftwidth=2 expandtab
//
// i'd have liked to use <progress>, but i can't style it as i want it (background-color is a must, for i
// want to add a text to the meter, and i need to know the colors to get contrast).
//

if ('trackbar' in TWDS) {
  console.log('removing old trackbar stuff')
  window.clearInterval(TWDS.trackbar.interval)
  TWDS.trackbar.settingchanged(false)
  setTimeout(TWDS.trackbar.settingchanged, 250)
}
TWDS.trackbar = {}
TWDS.trackbar.container = null
TWDS.trackbar.status = 0
TWDS.trackbar.interval = -1
TWDS.trackbar.last_background_run = 0

TWDS.trackbar.datachange_listener = function (x) {
  TWDS.trackbar.status = 2
}
TWDS.trackbar.setuplisteners = function (x) {
  let fn = 'listen'
  if (x === false) { fn = 'unlisten' }
  const events = ['inventory_changed', 'trader_item_selled', 'bad_add',
    'character_tracking_achievement_changed', 'character_exp_changed',
    'twds_storage_tracking_changed']

  for (let i = 0; i < events.length; i++) {
    EventHandler[fn](events[i], TWDS.trackbar.datachange_listener)
  }
}

TWDS.trackbar.setonetrackerdata = function (ele, have, want) {
  ele.dataset.have = have
  if (want !== null) { ele.dataset.want = want }
}
TWDS.trackbar.createOneTracker = function (cl, have, want, name) {
  const m = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_trackbar_tracker ' + cl,
    dataset: {
      progress: 0,
      name: name
    }
  })
  m.onclick = TWDS.trackbar.click
  TWDS.trackbar.setonetrackerdata(m, have, want)
  return m
}

TWDS.trackbar.backgroundjob = function () {
  const updateOneTracker = function (ele) {
    const have = ele.dataset.have
    const want = ele.dataset.want
    const percent = (100 * have / want).toFixed(1)
    let todo
    if (want === have) todo = ''
    else todo = ' (' + (want - have) + ')'

    ele.title = percent + '%: ' + have + ' / ' + want + ' ' + ele.dataset.name + todo
    ele.style = '--twds-progress: ' + percent + '%'
    ele.dataset.text = percent + '%' + todo
  }

  if (!TWDS.settings.trackbar) { return }
  if (TWDS.trackbar.status === 0) {
    const stich = new Date().getTime() - 60 * 10000
    if (TWDS.trackbar.last_background_run > stich) {
      return
    }
  } else {
    TWDS.trackbar.status--
  }

  // check if all trackers exist.
  let e = TWDS.q1('.TWDS_trackbar_achievement')
  const status = Character.getTrackingAchievement()
  if (status !== undefined) {
    if (!e) {
      e = TWDS.trackbar.createOneTracker('TWDS_trackbar_achievement',
        status.current, status.required, status.title)
      const xp = TWDS.q1('.TWDS_trackbar_xp', TWDS.trackbar.container)
      if (xp) {
        // we might run really early!
        xp.insertAdjacentElement('afterend', e)
      }
    }
  } else {
    if (e) {
      e.remove()
    }
  }

  let st = TWDS.q1('.TWDS_trackbar_storage', TWDS.trackbar.container)
  const withstorage = TWDS.settings.trackbar_storage
  if (withstorage) {
    if (!st) {
      const sum = TWDS.storage.getsummary()
      st = TWDS.trackbar.createOneTracker('TWDS_trackbar_storage',
        sum.current, sum.required, 'products')
      const ac = TWDS.q1('.TWDS_trackbar_achievement', TWDS.trackbar.container)
      if (ac) {
        ac.insertAdjacentElement('afterend', st)
      } else {
        const xp = TWDS.q1('.TWDS_trackbar_xp', TWDS.trackbar.container)
        if (xp) {
          // we might run really early!
          xp.insertAdjacentElement('afterend', st)
        }
      }
    }
  } else {
    if (st) st.remove()
  }

  const plist = TWDS.storage.gettracked()
  for (let i = 0; i < plist.length; i++) {
    const id = plist[i]
    const want = TWDS.storage.gettarget(id)
    const count = Bag.getItemCount(id)
    let e = TWDS.q('.TWDS_trackbar_product[data-product=' + id + ']')
    if (!e) {
      e = TWDS.trackbar.createOneTracker('TWDS_trackbar_product',
        count, want, ItemManager.get(id).name)
      e.dataset.product = id
      TWDS.trackbar.container.appendChild(e)
    }
  }
  const all = TWDS.q('.TWDS_trackbar_tracker', TWDS.trackbar.container)

  // update the displayed data
  for (let i = 0; i < all.length; i++) {
    const e = all[i]
    if (e.classList.contains('TWDS_trackbar_xp')) {
      TWDS.trackbar.setonetrackerdata(e,
        Character.getExperience4Level(), Character.getMaxExperience4Level())
    } else if (e.classList.contains('TWDS_trackbar_achievement')) {
      const status = Character.getTrackingAchievement()
      if (status !== undefined) {
        TWDS.trackbar.setonetrackerdata(e, status.current, status.required)
      } else {
        e.remove()
        continue
      }
    } else if (e.classList.contains('TWDS_trackbar_storage')) {
      const sum = TWDS.storage.getsummary()
      TWDS.trackbar.setonetrackerdata(e, sum.current, sum.required)
    } else if (e.classList.contains('TWDS_trackbar_product')) {
      const id = e.dataset.product
      const count = Bag.getItemCount(id)
      TWDS.trackbar.setonetrackerdata(e, count, null)
    } else {
      continue // something else.
    }
    updateOneTracker(e)
  }
}

TWDS.trackbar.click = function (e) {
  if (this.classList.contains('TWDS_trackbar_xp')) { return }
  if (this.classList.contains('TWDS_trackbar_achievement')) {
    // Character.untrackAchievement
    const status = Character.getTrackingAchievement()
    if (status !== undefined) {
      const c = 'You are about to stop tracking this achievment: ' + status.title
      new west.gui.Dialog(TWDS._('TRACKBAR_UNTRACK_TITLE', 'Stop tracking?'),
        '', west.gui.Dialog.SYS_WARNING).setText(c).addButton('Stop?', function () {
        Character.untrackAchievement()
      }).addButton('cancel').show()
    } else {
      this.remove() // achievement tracking endet externally.
    }
  }
  if (this.classList.contains('TWDS_trackbar_product')) {
    // Character.untrackAchievement
    const pr = this.dataset.product
    let name
    try {
      name = ItemManager.get(pr).name
    } catch (e) {
      name = 'some product'
    }
    if (TWDS.storage.istracked(pr)) {
      const c = 'You are about to stop tracking this product: ' + name
      new west.gui.Dialog(TWDS._('TRACKBAR_UNTRACK_TITLE', 'Stop tracking?'),
        '', west.gui.Dialog.SYS_WARNING).setText(c).addButton('Stop?', function () {
        TWDS.storage.untrack(pr)
      }).addButton('cancel').show()
    } else {
      this.remove() // achievement tracking endet externally.
    }
  }
}

TWDS.trackbar.settingchanged = function (v) {
  if (!ItemManager.isLoaded()) {
    window.setTimeout(TWDS.trackbar.settingchanged, 100)
    return
  }
  if (v === undefined || v === null) {
    v = TWDS.settings.trackbar
  }
  // first cleanup.
  const ui = TWDS.q1('#user-interface') // a container
  ui.classList.remove('TWDS_trackbar_active')
  const origele = TWDS.q1('#ui_experience_bar') // the original exp bar
  origele.style.display = 'block'

  const forget = TWDS.q1('#TWDS_trackbar_container')
  if (forget) { forget.remove() }
  TWDS.trackbar.container = null

  if (WestUi._twds_updateExpBar) {
    WestUi.updateExpBar = WestUi._twds_updateExpBar
  } else {
    WestUi._twds_updateExpBar = WestUi.updateExpBar
    WestUi.updateExpBar = TWDS.trackbar.update
  }
  window.clearInterval(TWDS.trackbar.interval)
  if (v) {
    TWDS.trackbar.setuplisteners(true)
  } else {
    TWDS.trackbar.setuplisteners(false)
  }
  console.log('SC', v)

  if (v) {
    origele.style.display = 'none'
    const e = TWDS.createEle({
      nodeName: 'div',
      id: 'TWDS_trackbar_container'
    })
    TWDS.trackbar.container = e
    ui.appendChild(e)
    ui.classList.add('TWDS_trackbar_active')
    const m = TWDS.trackbar.createOneTracker('TWDS_trackbar_xp',
      Character.getExperience4Level(), Character.getMaxExperience4Level(), 'XP')
    e.appendChild(m)

    TWDS.trackbar.backgroundjob()
    TWDS.trackbar.interval = window.setInterval(TWDS.trackbar.backgroundjob, 200)
  }
}

TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'trackbar',
    TWDS._('TRACKBAR_SETTING',
      'Add a trackbar capable of tracking experience, achievements, and products together.'),
    true, function () { TWDS.trackbar.settingchanged() }, 'misc', 'trackbar')
  TWDS.registerSetting('bool', 'trackbar_storage',
    TWDS._('TRACKBAR_SETTING_STORAGESUMMARY',
      'Show a summary of the storage (tab) in the trackbar.'),
    true, null, 'misc', 'trackbar')
  TWDS.trackbar.setuplisteners(true)
})
