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
    TWDS.delegate(document, 'click', '.tw2gui_window.playerprofile-' + Character.playerId + ' .profile-desc', function () {
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
  // we may already be too late… the damage may be done.
  TWDS.registerSetting('bool', 'misc_normal_water_color',
    'Show normal water colors instead of the pink/red/green ones of the event. You need to reload the page after a change.', false, null, 'Map')
  if (TWDS.settings.misc_normal_water_color) {
    Map.Helper.imgPath.clearCache()
  }

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

TWDS.registerSetting('bool', 'fixRecruitHealth',
  TWDS._('RECRUIT_HEALTH_FIX', 'Fix overlong lines in the fort battle recruiting screen.'),
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
TWDS.registerSetting('bool', 'fixGraveyardtable',
  TWDS._('RECRUIT_HEALTH_FIX', 'Fix overlong lines in the recent fort battle table.'),
  false, function (val) {
    if (val) {
      document.body.classList.add('TWDS_fix_graveyard')
    } else {
      document.body.classList.remove('TWDS_fix_graveyard')
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
TWDS.highlightTeles = function () {
  if (!('read' in Character)) return
  const x = TWDS.q1('#ui_bottombar .button.message')
  x.style.outline = 'none'
  if (TWDS.settings.misc_highlight_telegrams) {
    if (!Character.read.messages) return
    x.style.outline = '2px solid red'
  }
}
TWDS.registerStartFunc(function () {
  setInterval(TWDS.highlightTeles, 5000) // to delete the outline
  EventHandler.listen('player-toread-messages', TWDS.highlightTeles)
  TWDS.registerSetting('bool', 'misc_highlight_telegrams',
    TWDS._('MISC_HIGHLIGHT_TELEGRAMS',
      'Highlight the message button with red borders of you have unread telegrams.'),
    false)
  const donotibar = function (v) {
    if (WestUi && WestUi.NotiBar && WestUi.NotiBar.main) {
      WestUi.NotiBar.main.setMaxView(TWDS.settings.misc_notibar_main_max)
      return
    }
    window.setTimeout(donotibar, 500)
  }
  TWDS.registerSetting('int', 'misc_notibar_main_max',
    TWDS._('MISC_SETTING_NOTIBAR_MAIN_MAX',
      'Set the number of elements shown in the main notification bar (saloon and so on).'),
    { default: 4, min: 2, max: 8 }, donotibar)

  WestUi.NotiBar.TWDS_backup_add = WestUi.NotiBar.TWDS_backup_add || WestUi.NotiBar.add
  WestUi.NotiBar.add = function (entry) {
    console.log('NotiBar.add', entry)
    if (TWDS.settings.misc_notibar_remove_sale) {
      const found = TWDS.q1('.image.shop_sale', entry.element[0])
      if (found) {
        return
      }
    }
    WestUi.NotiBar.TWDS_backup_add.call(this, entry)
  }
  const doremovesale = function (v) {
    if (WestUi && WestUi.NotiBar && WestUi.NotiBar.main) {
      if (v) {
        WestUi.NotiBar.getBar().list.forEach(function (a) {
          const found = TWDS.q1('.image.shop_sale', a.element[0])
          if (found) WestUi.NotiBar.remove(a)
        })
      }

      WestUi.NotiBar.main.setMaxView(TWDS.settings.misc_notibar_main_max)
      return
    }
    window.setTimeout(doremovesale, 500)
  }

  TWDS.registerSetting('bool', 'misc_notibar_remove_sale',
    TWDS._('MISC_SETTING_NOTIBAR_REMOVE_SALE',
      'Remove the sale button from the main notification bar (saloon and so on).'),
    { default: false }, doremovesale)
})
TWDS.registerSetting('bool', 'misc_tailor_scrollbar_fix',
  TWDS._('MISC_SETTING_TAILOR_SCROLLBAR_FIX',
    'Fix the tailor scrollbar overflow.'),
  true, function (v) {
    if (v) {
      document.body.classList.add('TWDS_fix_tailor_scrollbar')
    } else {
      document.body.classList.remove('TWDS_fix_tailor_scrollbar')
    }
  })

TWDS.misc_sheriffwindow_open = function (townId, tabId, wanted) {
  window.SheriffWindow._TWDS_backup_open.call(this, townId, tabId, wanted)
  if (wanted) {
    TWDS.misc_sheriff_bounty_namechange2(wanted)
  }
}

TWDS.misc_sheriff_bounty_namechange2 = function (name) {
  if (!TWDS.settings.misc_sheriff_minbounty) return false
  name = name.trim().toLocaleLowerCase()
  Ajax.remoteCallMode('ranking', 'get_data', { search: name, tab: 'experience', rank: 'NaN' }, function (d) {
    for (let i = 0; i < d.ranking.length; i++) {
      if (d.ranking[i].name.toLocaleLowerCase() === name) {
        Ajax.remoteCallMode('profile', 'init', { playerId: d.ranking[i].player_id }, function (e) {
          const container = TWDS.q1('#windows .sheriff .sheriff-create')
          if (container) {
            const rewinput = TWDS.q1('#tbsh_iReward')
            if (rewinput) {
              const reward = parseInt(rewinput.value)
              if (reward < e.level * 10 || isNaN(reward)) {
                rewinput.value = e.level * 10
              }
            }
          }
        })
      }
    }
  })
}
TWDS.misc_sheriff_bounty_namechange = function () {
  TWDS.misc_sheriff_bounty_namechange2(this.value)
}
TWDS.registerStartFunc(function () {
  window.SheriffWindow._TWDS_backup_open = window.SheriffWindow.open
  window.SheriffWindow.open = TWDS.misc_sheriffwindow_open
  TWDS.registerSetting('bool', 'misc_sheriff_minbounty',
    TWDS._('MISC_SETTING_SHERIFF_MINBOUNTY',
      'In the "offer bounty" tab of the sheriff window set the offered reward to the minimum for the wanted characters duel level.'),
    true)
  TWDS.delegate(document.body, 'change', '#windows .sheriff .sheriff-create #tbsh_iCharname',
    TWDS.misc_sheriff_bounty_namechange)
})
