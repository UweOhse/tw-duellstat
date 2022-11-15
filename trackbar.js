// vim: tabstop=2 shiftwidth=2 expandtab
//
// i'd have liked to use <progress>, but i can't style it as i want it (background-color is a must, for i
// want to add a text to the meter, and i need to know the colors to get contrast).

if ('trackbar' in TWDS) {
  TWDS.trackbar.settingchanged(false)
  EventHandler.unlisten('bag_add', TWDS.trackbar.update)
  EventHandler.unlisten('inventory_changed', TWDS.trackbar.update)
  EventHandler.unlisten('character_tracking_achievement_changed', TWDS.trackbar.a_trackingchanged)
  EventHandler.unlisten('trader_item_selled', TWDS.trackbar.update)
}
TWDS.trackbar = {}
TWDS.trackbar.container = null
TWDS.trackbar.setOneTracker = function (ele, have, want) {
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
  TWDS.trackbar.setOneTracker(m, have, want)
  TWDS.trackbar.updateOneTracker(m)
  return m
}
TWDS.trackbar.updateOneTracker = function (ele) {
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

TWDS.trackbar.p = []
TWDS.trackbar.a_trackingchanged = function (e) {
  const status = Character.getTrackingAchievement()
  if (status !== undefined) {
    let ele = TWDS.q1('.TWDS_trackbar_achievement', TWDS.trackbar.container)
    if (!ele) {
      ele = TWDS.trackbar.createOneTracker('TWDS_trackbar_achievement',
        status.current, status.required, Character.getMaxExperience4Level(), '')
      const xp = TWDS.q1('.TWDS_trackbar_xp', TWDS.trackbar.container)
      xp.insertAdjacentElement('afterend', ele)
    }
    TWDS.trackbar.setOneTracker(ele, status.current, status.required)
    TWDS.trackbar.updateOneTracker(ele)
  } else {
    const m = TWDS.q1('.TWDS_trackbar_achievement', TWDS.trackbar.container)
    if (m) m.remove()
  }
  TWDS.trackbar.update()
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
TWDS.trackbar.update = function () {
  const all = TWDS.q('.TWDS_trackbar_tracker', TWDS.trackbar.container)
  const withstorage = TWDS.settings.trackbar_storage
  let st = TWDS.q1('.TWDS_trackbar_storage', TWDS.trackbar.container)
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
        xp.insertAdjacentElement('afterend', st)
      }
    }
  } else {
    if (st) st.remove()
  }
  for (let i = 0; i < all.length; i++) {
    const e = all[i]
    if (e.classList.contains('TWDS_trackbar_xp')) {
      TWDS.trackbar.setOneTracker(e,
        Character.getExperience4Level(), Character.getMaxExperience4Level())
    } else if (e.classList.contains('TWDS_trackbar_achievement')) {
      const status = Character.getTrackingAchievement()
      if (status !== undefined) {
        TWDS.trackbar.setOneTracker(e, status.current, status.required)
      } else {
        e.remove()
        continue
      }
    } else if (e.classList.contains('TWDS_trackbar_storage')) {
      const sum = TWDS.storage.getsummary()
      TWDS.trackbar.setOneTracker(e, sum.current, sum.required)
    } else if (e.classList.contains('TWDS_trackbar_product')) {
      const id = e.dataset.product
      const count = Bag.getItemCount(id)
      TWDS.trackbar.setOneTracker(e, count, null)
    } else {
      continue // something else.
    }
    TWDS.trackbar.updateOneTracker(e)
  }
}
//   EventHandler.listen("twds_storage_trackingadded", TWDS.trackbar.trackingadded);
//   EventHandler.listen("twds_storage_trackingremoved", TWDS.trackbar.trackingadded);
TWDS.trackbar.trackingadded = function (x) {
  TWDS.trackbar.settingchanged()
}
TWDS.trackbar.trackingremoved = function (x) {
  TWDS.trackbar.settingchanged()
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
  EventHandler.unlisten('inventory_changed', TWDS.trackbar.update)
  EventHandler.unlisten('character_tracking_achievement_changed', TWDS.trackbar.a_trackingchanged)

  if (v) {
    origele.style.display = 'none'
    const e = TWDS.createEle({
      nodeName: 'div',
      id: 'TWDS_trackbar_container'
    })
    TWDS.trackbar.container = e
    ui.appendChild(e)
    ui.classList.add('TWDS_trackbar_active')
    let m = TWDS.trackbar.createOneTracker('TWDS_trackbar_xp',
      Character.getExperience4Level(), Character.getMaxExperience4Level(), 'XP')
    e.appendChild(m)
    TWDS.trackbar.a_trackingchanged()

    const plist = TWDS.storage.gettracked()
    for (let i = 0; i < plist.length; i++) {
      const id = plist[i]
      const want = TWDS.storage.gettarget(id)
      const count = Bag.getItemCount(id)
      m = TWDS.trackbar.createOneTracker('TWDS_trackbar_product',
        count, want, ItemManager.get(id).name)
      m.dataset.product = id
      e.appendChild(m)
    }

    TWDS.trackbar.update()
    EventHandler.listen('inventory_changed', TWDS.trackbar.update)
    EventHandler.listen('trader_item_selled', TWDS.trackbar.update)
    EventHandler.listen('bag_add', TWDS.trackbar.update)
    EventHandler.listen('character_tracking_achievement_changed', TWDS.trackbar.trackingchanged)
  }
}

TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'trackbar',
    TWDS._('TRACKBAR_SETTING',
      'Add a trackbar capable of tracking experience, achievements, and products together.'),
    true, TWDS.trackbar.settingchanged, 'misc', 'trackbar')
  TWDS.registerSetting('bool', 'trackbar_storage',
    TWDS._('TRACKBAR_SETTING_STORAGESUMMARY',
      'Show a summary of the storage (tab) in the trackbar.'),
    true, null, 'misc', 'trackbar')
  EventHandler.listen('twds_storage_tracking_changed', function (x) { TWDS.trackbar.settingchanged() })
  EventHandler.listen('character_exp_changed', function (x) { TWDS.trackbar.update() })
})
