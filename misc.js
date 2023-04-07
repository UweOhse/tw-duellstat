// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.finished_task_handler = function () {
  if (Character.playerId === 0) {
    setTimeout(TWDS.finished_task_handler, 100)
    return
  }
  if (!TWDS.settings.misc_daily_activities_warning) {
    document.body.classList.remove('TWDS_daily_tasks_open')
    return
  }
  // the bloody signal is sent *before* the counter is updated,
  // *and* setFinishedTasks4CurrentDay does not reset the counter, before it adds to it.
  Character.setFinishedTasks(0)
  Character.setFinishedTasks4CurrentDay()
  if (Character.finishedTasks < 3) {
    document.body.classList.add('TWDS_daily_tasks_open')
  } else {
    document.body.classList.remove('TWDS_daily_tasks_open')
  }
}
TWDS.registerStartFunc(function () {
  EventHandler.listen('activity_changed', function () {
    TWDS.finished_task_handler()
    Character.setFinishedTasks(0) // because set...4current is called again, and counts again.
  })
  TWDS.registerSetting('bool', 'misc_daily_activities_warning',
    TWDS._('MISC_DAILY_ACTIVITIES_SETTING',
      'Show a reminder that you still have not finished three daily activities'), true, function () {
      EventHandler.signal('activity_changed') // TW ignores missing key
    })
  TWDS.finished_task_handler()
})
TWDS.finishable_quest_handler = function () {
  if (!window.QuestLog.quests_loaded) { // yes, quests_loaded. quest_loaded is unused
    setTimeout(TWDS.finishable_quest_handler, 100)
    return
  }
  if (!TWDS.settings.misc_mark_tracker_when_finishable) {
    document.body.classList.remove('TWDS_quest_finishable')
    return
  }
  let f = false
  for (const id in window.QuestLog.quests) {
    const q = window.QuestLog.quests[id]
    if (q.finishable) {
      f = true
      break
    }
  }
  if (f) {
    document.body.classList.add('TWDS_quest_finishable')
  } else {
    document.body.classList.remove('TWDS_quest_finishable')
  }
}

TWDS.registerStartFunc(function () {
  const events = ['quest_tracking_changed', 'quest_solved', 'quest_update', 'quest_removed', 'quest_added', 'linearquest_added', 'linearquest_removed', 'linearquest_update', 'TWDS_quest_check']
  EventHandler.listen(events, function () {
    TWDS.finishable_quest_handler()
  })
  TWDS.registerSetting('bool', 'misc_mark_tracker_when_finishable',
    TWDS._('MISC_MARK_QUEST_FINISHABLE',
      'Mark the quest tracker if a quest can be finished.'), true, function () {
      EventHandler.signal('TWDS_queck_check') // TW ignores missing key
    })
})

// duel protection.
TWDS.duelprotection = {}
TWDS.duelprotection.interval = 0
TWDS.duelprotection.hack = null
TWDS.duelprotection.updateMouseover = function () {
  const mand = Character.getMandatoryDuelProtection(true)
  const opt = Character.getDuelProtection(true)
  const now = (new window.ServerDate()).getTime()
  let str = ''
  let vgl = -1
  if (mand > now) {
    str = 'Duel suspension until ' + (new Date(mand)).toLocaleString()
    TWDS.duelprotection.hack.css({
      'background-color': '#f446'
    })
    vgl = mand
  } else if (opt > now) {
    str = 'Duel protection until ' + (new Date(opt)).toLocaleString()
    vgl = opt
    TWDS.duelprotection.hack.css({
      'background-color': '#cc46'
    })
  } else {
    TWDS.duelprotection.hack.css({
      'background-color': '#4a43'
    })
  }
  if (vgl !== -1) {
    const remain = Math.max((vgl - now) / 1000, 0) // ms
    const remainstr = remain.formatDuration()
    if (remain > 0) {
      str += ' (' + remainstr + ')'
    }
    str += '.\n'
  }
  const mot1 = Character.duelMotivation
  const mot2 = Character.npcDuelMotivation
  str += '<p>Duel motivation</p>'
  str += '<table>'
  str += '<tr><th>PC'
  str += '<td><meter min="0" low="0" optimum="1" high="1" max="1" value="' + mot1 + '"></meter>'
  str += '<td>' + parseInt(100 * mot1)
  str += '<tr><th>NPC'
  str += '<td><meter min="0" low="0" optimum="1" high="1" max="1" value="' + mot2 + '"></meter>'
  str += '<td>' + parseInt(100 * mot2)
  str += '</table>'
  str += '<p>The duel motivation is valid after you opened the duels menu. Unfortunately the data is not updated earlier.</p>'
  TWDS.duelprotection.hack.addMousePopup(str)
}
TWDS.duelprotection.init = function (active) {
  if (!active) {
    if (TWDS.duelprotection.interval) {
      clearInterval(TWDS.duelprotection.interval)
      TWDS.duelprotection.interval = 0
    }
    if (TWDS.duelprotection.hack !== null) {
      TWDS.duelprotection.hack.removeMousePopup()
      TWDS.duelprotection.hack.remove()
    }
    return
  }

  if (TWDS.settings.misc_duelprotection_display) {
    const cl = $('#ui_character_container')
    const hack = $("<div id='TWDS_duelprotection_hack' />")
    hack.css({
      position: 'relative',
      background: "url('" + Game.cdnURL + "/images/interface/dock_icons.png?4')",
      width: '52px',
      height: '52px',
      cursor: 'pointer',
      'background-size': 'auto',
      display: 'inline-block',
      right: '-4px',
      top: '24px',
      'background-position-x': '-52px',
      'background-position-y': '-52px',
      'border-radius': '50%',
      'background-color': '#7776'
    })
    $(cl).append(hack)
    $(hack).on('mouseenter', TWDS.duelprotection.updateMouseover)
    TWDS.duelprotection.hack = hack
    // update the bg color, too.
    TWDS.duelprotection.updateMouseover()
    TWDS.duelprotection.interval = setInterval(TWDS.duelprotection.updateMouseover, 60 * 1000)
  }
}
TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'misc_duelprotection_display',
    TWDS._('MISC_SETTING_DUELPROTECTION_DISPLAY', 'Show a duel protection overlay on your image'),
    true, TWDS.duelprotection.init)
  TWDS.registerSetting('bool', 'misc_profile_text_click',
    TWDS._('MISC_SETTING_PROFILE_TEXT_CLICK',
      'A click on your profile text opens the profile text in the settings.'), true)
  // the itemmanager_loaded is sent after Character.init is called.
  EventHandler.listen('itemmanager_loaded', function () {
    TWDS.delegate(document, 'click', '.tw2gui_window.playerprofile-' + Character.playerId, function () {
      if (TWDS.settings.misc_profile_text_click) {
        /* eslint-disable no-new */
        new window.OptionsWindow()
      }
    })
    return EventHandler.ONE_TIME_EVENT
  })
})

TWDS.map = {}
TWDS.map.radialmenu_open = function () {
  this._TWDS_map_backup_open(true)
}
TWDS.map.radialmenu_close = function () {
  this._TWDS_map_backup_close(true)
}
TWDS.registerStartFunc(function () {
  window.Map.Helper.imgPath._TWDS_backup_lookForModification = window.Map.Helper.imgPath.lookForModification
  window.Map.Helper.imgPath.lookForModification = function (path, ongameload) {
    if (TWDS.settings.misc_normal_water_color) {
      return path
    }
    return window.Map.Helper.imgPath._TWDS_backup_lookForModification(path, ongameload)
  }
  TWDS.registerSetting('bool', 'misc_normal_water_color',
    'Show normal water colors instead of the pink/red/green ones of the event. You need to reload the page after a change.', false, null, 'Map')

  window.Map.Radialmenu.prototype._TWDS_map_backup_close = window.Map.Radialmenu.prototype.close
  window.Map.Radialmenu.prototype._TWDS_map_backup_open = window.Map.Radialmenu.prototype.open
  TWDS.registerSetting('bool', 'no_jobgroup_animation',
    TWDS._('TWDS_SETTING_no_jobgroup_animation',
      'Do not animate the opening and closing of job groups'),
    false, function (v) {
      if (v) {
        window.Map.Radialmenu.prototype.close = TWDS.map.radialmenu_close
        window.Map.Radialmenu.prototype.open = TWDS.map.radialmenu_open
      } else {
        window.Map.Radialmenu.prototype.close = window.Map.Radialmenu.prototype._TWDS_map_backup_close
        window.Map.Radialmenu.prototype.open = window.Map.Radialmenu.prototype._TWDS_map_backup_open
      }
    }, 'Map')
  TWDS.registerSetting('bool', 'misc_trader_show_max_button',
    TWDS._('MISC_SETTING_SHOW_MAX_BUTTON',
      'Show the "max" button while selling at the traveling merchant.'),
    false, function (v) {
      if (v) {
        document.body.classList.add('TWDS_show_trader_max_value')
      } else {
        document.body.classList.remove('TWDS_show_trader_max_value')
      }
    }, 'misc')
})

TWDS.registerSetting('bool', 'fixCompost',
  TWDS._('COMPOST_RECIPE_FIX', 'Fix the display of the compost recipe (TW-Calc workaround).'),
  false, function (val) {
    const old = document.getElementById('TWDS_fix_compost_css')
    if (old) old.parentNode.removeChild(old)
    if (val) {
      const sty = document.createElement('style')
      sty.id = 'TWDS_fix_compost_css'
      sty.textContent = "[data-recipe-craft-item-id='51580000'] .recipe_resources .item { zoom:0.92}"
      document.body.appendChild(sty)
    }
  })
TWDS.registerSetting('bool', 'fixRecruitHealth',
  TWDS._('COMPOST_RECIPE_FIX', 'Fix overlong lines in the fort battle recruiting screen.'),
  false, function (val) {
    const old = document.getElementById('TWDS_fix_recruit_health')
    if (old) old.parentNode.removeChild(old)
    if (val) {
      const sty = document.createElement('style')
      sty.id = 'TWDS_fix_recruit_health'
      sty.textContent = '.fort_battle_recruitlist_list .tbody .healthpoints p { font-size:smaller}'
      document.body.appendChild(sty)
    }
  })

TWDS.registerStartFunc(function () {
  west.gui.payHandler.prototype._TWDS_backup_addPayOption = west.gui.payHandler.prototype.addPayOption
  west.gui.payHandler.prototype.addPayOption = function (e) {
    this._TWDS_backup_addPayOption.apply(this, arguments)
    if (TWDS.settings.misc_avoid_nuggets) {
      if (e === false || e === 'nugget' || e === 2 || e.id === 2) {
        return this
      }
      this.setSelectedPayId(e.id || e)
      return this
    }
    return this
  }

  TWDS.registerSetting('bool', 'misc_avoid_nuggets',
    TWDS._('MISC_AVOID_NUGGETS',
      'Default to other payment methods than nuggets, if possible.'),
    false)
})
