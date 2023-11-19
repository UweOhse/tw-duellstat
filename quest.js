// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.quest = {}
// can't reliably use Quest.getMinimaplink, because TW-Calc uses that, and doesn't call the original/backup function.
TWDS.quest.renderRequirement = function (req, cls) {
  const li = Quest.prototype._TWDS_backup_renderRequirement.apply(this, arguments)
  const jsinfo = req.jsInfo

  if (TWDS.settings.quest_add_util_buttons && jsinfo) {
    li.addClass('TWDS_questentry_functions')
    if (jsinfo.type === 'inventory_changed') {
      let x = TWDS.itemAnyCraftButton(jsinfo.id)
      if (x) {
        li.append(x)
        li.addClass('with_craftlink')
      }
      x = TWDS.itemBidButton(jsinfo.id)
      if (x) {
        li.append(x)
        li.addClass('with_bidbutton')
      }
      const bagitem = Bag.getItemByItemId(jsinfo.id)
      if (bagitem) {
        if (TWDS.settings.quest_show_itemcount) {
          let str = bagitem.count
          const si = TWDS.storage.iteminfo(jsinfo.id)
          if (si[0]) { // want <> 0
            str += '/' + si[0]
          }
          const ele = TWDS.createEle({
            nodeName: 'span',
            className: 'TWDS_quest_itemcount',
            textContent: '[' + str + ']'
          })
          li.append(ele)
        }
      }
    } else if (jsinfo.type === 'wear_changed') {
      const bagitem = Bag.getItemByItemId(jsinfo.id)
      if (bagitem) {
        const x = TWDS.itemWearButton(jsinfo.id)
        if (x) {
          li.append(x)
          li.addClass('with_wearbutton')
        }
      }

    /*
    } else if (jsinfo.type === 'task-finish-job') {
      const id = jsinfo.id
      const x = TWDS.jobOpenButton2(id)
      if (x) { li.appendChild(x) }
      const jobdata = JobList.getJobById(id)
      let ql=MinimapWindow.getQuicklink(jobdata.name, 'task-finish-job')
      if (ql>"") {
        let y=TWDS.createEle({
          nodeName:"span",
          innerHTML: ql
        });
        li.append(y.firstChild);
      }
    } else if (jsinfo.type === 'task-finish-walk') {
      let x=TWDS.employerOpenButton(jsinfo.value);
      if (x) { li.append(x) }
    } else {
      console.log('unhandled', jsinfo, jsinfo.type);
    */
    }
  }
  return li
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
TWDS.quest.buildquestlog = function (emp) {
  QuestEmployerView.TWDS_backup_buildQuestLog.apply(this, arguments)
  for (let i = 0; i < emp.open.length; i++) {
    const q = emp.open[i]
    const req = q.requirements
    let allsolved = true
    for (let j = 0; j < req.length; j++) {
      if (req[j].solved !== true) { allsolved = false }
    }

    if (q.finishable || allsolved) {
      if (TWDS.settings.quest_color_finishable) {
        const link = TWDS.q1('#open_quest_employerlink_' + q.id)
        if (!link) continue
        link.classList.add('finishable')
      }
    }
  }
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
TWDS.registerSetting('bool', 'quest_color_finishable',
  TWDS._('QUESTS_SETTING_COLOR_FINISHABLE', 'Change the color of quests which can be completed.'),
  true, null, 'Quests', null, 6)

TWDS.quest.startfunc = function () {
  Quest.prototype._TWDS_backup_getQuestTrackerEl = Quest.prototype._TWDS_backup_getQuestTrackerEl ||
    Quest.prototype.getQuestTrackerEl
  Quest.prototype.getQuestTrackerEl = TWDS.quest.getQuestTrackerEl

  Quest.prototype._TWDS_backup_renderRequirement = Quest.prototype._TWDS_backup_renderRequirement ||
    Quest.prototype.renderRequirement
  Quest.prototype.renderRequirement = TWDS.quest.renderRequirement

  QuestWindow._TWDS_backup_cancelQuest = QuestWindow._TWDS_backup_cancelQuest ||
    QuestWindow.cancelQuest
  QuestWindow.cancelQuest = TWDS.quest.cancelQuest

  QuestEmployerView.TWDS_backup_buildQuestLog = QuestEmployerView.TWDS_backup_buildQuestLog ||
    QuestEmployerView.buildQuestLog
  QuestEmployerView.buildQuestLog = TWDS.quest.buildquestlog

  TWDS.delegate(document.body, 'click', '.quest_requirement.shorten', function () {
    this.classList.remove('shorten')
  })
}
TWDS.registerStartFunc(TWDS.quest.startfunc)

// vim: tabstop=2 shiftwidth=2 expandtab
