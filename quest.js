// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.quest = {}
TWDS.quest.render = function (requirement, clsFinish) {
  Quest.prototype._TWDS_backup_render.apply(this, arguments)
  const details = this.el
  const tracker = this.questTrackerEl
  if (TWDS.settings.quest_show_itemcount || TWDS.settings.questtracker_show_itemcount) {
    if (this.requirements.length) {
      for (let i = 0; i < this.requirements.length; i++) {
        const req = this.requirements[i]
        if (req.jsInfo && req.jsInfo.type === 'inventory_changed') {
          const item = Bag.getItemByItemId(req.jsInfo.id)
          if (item) {
            if (TWDS.settings.quest_show_itemcount) {
              const sp = $("<span class='TWDS_quest_itemcount'> [" + item.count + ']</span>')
              const li = $('ul.requirement_container li:nth-child(' + (i + 1) + ')', details)
              li.append(sp)
            }
            if (TWDS.settings.questtracker_show_itemcount) {
              const sp = $("<span class='TWDS_questtracker_itemcount'> [" + item.count + ']</span>')
              const li = $('ul.requirement_container li:nth-child(' + (i + 1) + ')', tracker)
              li.append(sp)
            }
          }
        }
      }
    }
  }
}

TWDS.registerSetting('bool', 'quest_show_itemcount',
  'In the questwindow show the amount of items in your inventory ', false, null, 'Quests')
TWDS.registerSetting('bool', 'questtracker_show_itemcount',
  'In the questtracker show the amount of items in your inventory', false, null, 'Quests')

TWDS.registerStartFunc(function () {
  Quest.prototype._TWDS_backup_render = Quest.prototype.render
  Quest.prototype.render = TWDS.quest.render
})

// vim: tabstop=2 shiftwidth=2 expandtab
