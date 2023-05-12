// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.quest = {}
TWDS.quest.getMinimapLink = function (req) {
  if (!req) return ''
  const li = document.createElement('span')
  li.className = 'TWDS_minimaplink'
  if (TWDS.settings.quest_add_util_buttons) {
    if (req.type === 'inventory_changed') {
      let x = TWDS.itemAnyCraftButton(req.id)
      if (x) { li.appendChild(x) }
      x = TWDS.itemBidButton(req.id)
      if (x) {
        li.appendChild(x)
      }
    } else {
      console.log('unhandled', req.type, req)
    }
  }
  const old = Quest.prototype._TWDS_backup_getMinimapLink(req)
  return li.outerHTML + old
}

TWDS.quest.render = function (requirement, clsFinish) {
  Quest.prototype._TWDS_backup_render.apply(this, arguments)
  const details = this.el
  const tracker = this.questTrackerEl
  if (TWDS.settings.quest_show_itemcount || TWDS.settings.questtracker_show_itemcount) {
    if (this.requirements.length) {
      for (let i = 0; i < this.requirements.length; i++) {
        const req = this.requirements[i]
        if (req.jsInfo && req.jsInfo.type === 'inventory_changed') {
          const li = $('ul.requirement_container li:nth-child(' + (i + 1) + ')', details)
          const trackerli = $('ul.requirement_container li:nth-child(' + (i + 1) + ')', tracker)
          const bagitem = Bag.getItemByItemId(req.jsInfo.id)
          if (bagitem) {
            if (TWDS.settings.quest_show_itemcount) {
              const sp = $("<span class='TWDS_quest_itemcount'> [" + bagitem.count + ']</span>')
              li.append(sp)
            }
            if (TWDS.settings.questtracker_show_itemcount) {
              const sp = $("<span class='TWDS_questtracker_itemcount'> [" + bagitem.count + ']</span>')
              trackerli.append(sp)
            }
          }
        }
      }
    }
  }
}
TWDS.quest.getQuestTrackerEl = function () {
  const x = Quest.prototype._TWDS_backup_getQuestTrackerEl.apply(this)
  if (TWDS.settings.questtracker_show_booklinks) {
    const remover = TWDS.q1('.quest-list.remove', x[0])
    if (remover) {
      TWDS.createEle({
        nodeName: 'span',
        className: 'TWDS-quest-list-to-book',
        innerHTML: '&#128366;',
        before: remover,
        title: TWDS._('QUESTS_OPEN_BOOK', 'Open in the quest book.'),
        dataset: {
          questid: this.id,
          questgroup: this.group
        },
        onclick: function (ev) {
          const that = this
          EventHandler.listen('questlog_loaded', function () {
            window.QuestWindow.switchToQuest(that.dataset.questid)
            return EventHandler.ONE_TIME_EVENT
          }, this)
          window.QuestWindow.open()
        }
      })
    }
  }
  return x
}
TWDS.quest.cancelQuest = function (id) {
  (new west.gui.Dialog(
    TWDS._('QUEST_CANCEL_QUESTION_TITLE', 'Cancel Quest?'),
    TWDS._('QUEST_CANCEL_QUESTION',
      'Are you sure that you want to cancel this Quest?'))
    .setIcon(west.gui.Dialog.SYS_QUESTION).setModal(true, false, {
      bg: Game.cdnURL + '/images/curtain_bg.png',
      opacity: 0.4
    }).addButton(
      TWDS._('YES', 'yes'), function () {
        window.QuestWindow._TWDS_backup_cancelQuest(id)
      }).addButton(TWDS._('NO', 'no'), function () {}).show()
  )
}

TWDS.registerSetting('bool', 'quest_cancel_question',
  TWDS._('QUESTS_SETTING_CANCEL', 'Add a safety question before canceling a quest.'),
  true, null, 'Quests', null, 1)
TWDS.registerSetting('bool', 'quest_show_itemcount',
  TWDS._('QUESTS_SETTING_SHOW_ITEMCOUNT', 'Show the amount of items in your inventory in the quest window'),
  false, null, 'Quests', null, 2)
TWDS.registerSetting('bool', 'quest_add_util_buttons',
  TWDS._('QUESTS_SETTING_ADD_UTIL_BUTTONS', 'Add utility functions to the quest window'),
  false, null, 'Quests', null, 3)
TWDS.registerSetting('bool', 'questtracker_show_itemcount',
  TWDS._('QUESTS_SETTING_SHOW_ITEMCOUNT_TRACKER', 'Show the amount of items in your inventory in the quest tracker.'),
  false, null, 'Quests', null, 4)
TWDS.registerSetting('bool', 'questtracker_show_booklinks',
  TWDS._('QUESTS_SETTING_ADD_BOOK_LINK', 'Add quest book links to the quest tracker'),
  true, null, 'Quests', null, 5)

TWDS.registerStartFunc(function () {
  Quest.prototype._TWDS_backup_render = Quest.prototype.render
  Quest.prototype.render = TWDS.quest.render
  Quest.prototype._TWDS_backup_getQuestTrackerEl = Quest.prototype.getQuestTrackerEl
  Quest.prototype.getQuestTrackerEl = TWDS.quest.getQuestTrackerEl
  Quest.prototype._TWDS_backup_getMinimapLink = Quest.prototype.getMinimapLink
  Quest.prototype.getMinimapLink = TWDS.quest.getMinimapLink
  window.QuestWindow._TWDS_backup_cancelQuest = window.QuestWindow.cancelQuest
  window.QuestWindow.cancelQuest = TWDS.quest.cancelQuest
})

// vim: tabstop=2 shiftwidth=2 expandtab
