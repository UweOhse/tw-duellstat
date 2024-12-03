// vim: tabstop=2 shiftwidth=2 expandtab

// pinning mode
TWDS.adventcalendar = {}

TWDS.adventcalendar.doit = function () {
  const id = 12700000
  if (!TWDS.settings.misc_adventcalendar) return
  const dt = new Date(Game.getServerTime() * 1000)
  if (dt.getMonth() !== 11) return
  const day = dt.getDate()
  if (day > 25) return
  if (!Bag.getItemByItemId(id)) return
  const item = ItemManager.get(id)
  if (!item) return

  Ajax.remoteCallMode('advent', 'index', {}, function (json) {
    if (json.error) {
      return new UserMessage(json.msg).show()
    }
    const doors = json.doors
    const d = doors >> day
    if (d & 1) {
      return // already opened
    }
    const notification = new window.OnGoingEntry()
    notification.init(item.image, function () {
      const bi = Bag.getItemByItemId(id)
      const obsolete = parseInt(this.element[0].dataset.obsolete || '0')
      if (bi && !obsolete) {
        Inventory.clickHandler(id, {})
      }
    }, 11)

    notification.setTooltip('You can use this now')
    notification.element[0].dataset.itemid = 12700000
    notification.element[0].classList.add('TWDS_notibar_item')
    notification.element[0].classList.add('TWDS_notibar_item_' + id)
    WestUi.NotiBar.add(notification)
  }, window.AdventCalendarWindow)
}
TWDS.adventcalendar.doit_delay = function () {
  setTimeout(TWDS.adventcalendar.doit, 2500)
}
TWDS.adventcalendar.startfunc = function () {
  TWDS.registerSetting('bool', 'misc_adventcalendar',
    TWDS._('MISC_SETTING_ADVENTCALENDER', 'Add a notification for the advent calendar.'),
    true, TWDS.adventcalendar.doit_delay)
}
TWDS.registerStartFunc(TWDS.adventcalendar.startfunc)
