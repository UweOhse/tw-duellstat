// vim: tabstop=2 shiftwidth=2 expandtab
//

TWDS.questgroupwindow = {}

TWDS.questgroupwindow.showSolvedQuest = function (that, ev) {
  window.QuestGroupWindowView.TWDS_backup_showSolvedQuest(that)
  if (TWDS.settings.questgroup_show_intro) {
    const t = TWDS.q('div.window-quest_group div.quest_description_container span')[1]
    const sp = TWDS.createEle('span')
    TWDS.createEle('br', { last: sp })
    TWDS.createEle('span', { last: sp, innerHTML: that.description })
    TWDS.createEle('br', { last: sp })
    TWDS.createEle('span', { last: sp, textContent: '[...]' })
    t.parentNode.insertBefore(sp, t)
  }
}
TWDS.questgroupwindow.startfunc = function () {
  window.QuestGroupWindowView.TWDS_backup_showSolvedQuest =
    window.QuestGroupWindowView.TWDS_backup_showSolvedQuest || window.QuestGroupWindowView.showSolvedQuest
  window.QuestGroupWindowView.showSolvedQuest = TWDS.questgroupwindow.showSolvedQuest

  TWDS.registerSetting('bool', 'questgroup_show_intro',
    TWDS._('QUESTGROUP_SHOW_INTRO', 'In the questbook show the intro text of solved quests, too.'),
    true, null, 'Quests')
}

TWDS.registerStartFunc(TWDS.questgroupwindow.startfunc)
