// vim: tabstop=2 shiftwidth=2 expandtab

// duel protection, duel motivation bar
TWDS.duelinfo = {}
TWDS.duelinfo.interval = 0
TWDS.duelinfo.updateafter = 0
TWDS.duelinfo.reloadafter = 0
TWDS.duelinfo.bar = null
TWDS.duelinfo.updateMouseover = function () {
  const mand = Character.getMandatoryDuelProtection(true)
  const opt = Character.getDuelProtection(true)
  const now = (new window.ServerDate()).getTime()
  let str = ''
  let vgl = -1
  if (mand > now) {
    str = TWDS._('DUELINFO_SUSPENSION', 'Duel suspension until') + ' ' + (new Date(mand)).toLocaleString()
    vgl = mand
  } else if (opt > now) {
    str = TWDS._('DUELINFO_PROTECTION', 'Duel protection until') + ' ' + (new Date(opt)).toLocaleString()
    vgl = opt
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
  str += '<p>' + TWDS._('DUELINFO_DUEL_MOTIVATION', 'Duel motivation:') + '</p>'
  str += '<table>'
  str += '<tr><th>PC'
  str += '<td><meter min="0" low="0" optimum="1" high="1" max="1" value="' + mot1 + '"></meter>'
  str += '<td>' + Math.round(100 * mot1)
  str += '<tr><th>NPC'
  str += '<td><meter min="0" low="0" optimum="1" high="1" max="1" value="' + mot2 + '"></meter>'
  str += '<td>' + Math.round(100 * mot2)
  str += '</table>'
  $(TWDS.duelinfo.bar).addMousePopup(str)
}
TWDS.duelinfo.update = function (force) {
  if (!TWDS.duelinfo.bar) { TWDS.duelinfo.bar = TWDS.q1('#TWDS_duelinfo_bar') }
  const bar = TWDS.duelinfo.bar
  if (!TWDS.duelinfo.bar) return
  const now = (new window.ServerDate()).getTime()
  let left = Character.getDuelProtection(true) - now
  left /= 1000
  let str = ''
  bar.style.filter = ''
  if (left > 1) {
    if (left > 120 * 60) {
      str = Math.round(left / 3600) + 'h, '
      TWDS.duelinfo.updateafter = now + 60 * 1000
    } else if (left > 120) {
      str = Math.round(left / 60) + 'm, '
      TWDS.duelinfo.updateafter = now + 30 * 1000
    } else {
      str = Math.round(left) + 's, '
      TWDS.duelinfo.updateafter = now + 1 * 1000
    }
    if (left / 3600 > Game.duelProtectionHours - Game.duelProtectionEarly) {
      bar.style.backgroundPositionY = '-0px' // red
      console.log('red')
    } else {
      bar.style.backgroundPositionY = '-13px' // blue
    }
  } else {
    TWDS.duelinfo.updateafter = now + 10 * 60 * 1000
    bar.style.backgroundPositionY = '-25px' // green
    if (Character.homeTown.town_id === 0) {
      bar.style.filter = 'grayscale(1)'
    }
  }
  let m = Character.duelMotivation
  bar.style.backgroundPositionX = -(137 * (1 - m)) + 'px'
  str += Math.round(m * 100).toString() + '%'
  m = Character.npcDuelMotivation
  if (m < 1) {
    str += ' (' + Math.round(m * 100).toString() + '%)'
  }
  bar.textContent = str
  TWDS.duelinfo.updateMouseover()
}
TWDS.duelinfo.intervalhandler = function () {
  const now = (new window.ServerDate()).getTime()
  if (now > TWDS.duelinfo.reloadafter) {
    Ajax.remoteCall('duel', 'get_data', {}, function (d) {
      if (d.error) {
        return
      }
      TWDS.duelinfo.reloadafter = now + 15 * 60 * 1000
      Character.setDuelMotivation(d.motivation)
      Character.setNPCDuelMotivation(d.motivation_npc)
      TWDS.duelinfo.update()
    })
  }
  if (now > TWDS.duelinfo.updateafter) {
    TWDS.duelinfo.update()
  }
}
TWDS.duelinfo.init = function () {
  console.log('DI init')
  if (!TWDS.settings.misc_duelinfo_display) {
    if (TWDS.duelinfo.interval) {
      clearInterval(TWDS.duelinfo.interval)
      TWDS.duelinfo.interval = 0
    }
    if (TWDS.duelinfo.bar !== null) {
      $(TWDS.duelinfo.bar).removeMousePopup()
      TWDS.duelinfo.bar.remove()
    }
    return
  }
  // this is what clothcalc did, copied for compatibility
  if (Character.setDuelProtection.toString().search('duelprotection_changed') === -1) {
    Character.TWDS_setDuelProtection = Character.setDuelProtection
    Character.setDuelProtection = function (e) {
      if (e === 0) {
        e = 1
      }
      const t = e !== Character.duelProtection
      Character.TWDS_setDuelProtection.apply(this, arguments)
      if (t) {
        EventHandler.signal('duelprotection_changed', [])
      }
    }
  }
  EventHandler.listen('duelprotection_changed', TWDS.duelinfo.update)

  let old = TWDS.q1('#TWDS_duelinfo_bar')
  console.log('DI old', old)
  if (old) { old.remove() }

  old = TWDS.q1('#TWDS_ui_character_container_copy')
  if (old) { old.remove() }

  TWDS.duelinfo.bar = null
  const container = TWDS.q1('#ui_character_container')
  if (TWDS.settings.misc_duelinfo_display) {
    TWDS.createEle({
      nodeName: 'div',
      id: 'TWDS_ui_character_container_copy',
      first: container.parentNode
    })
    TWDS.duelinfo.bar = TWDS.createEle({
      nodeName: 'div',
      id: 'TWDS_duelinfo_bar',
      className: 'TWDS_duelinfo_bar status_bar',
      style: {
        backgroundPosition: '0px -12px',
        top: '175px',
        left: '3px'
      },
      textContent: '',
      onclick: TWDS.pinning.openwindow,
      last: container
    })
  }
  Ajax.remoteCall('duel', 'get_data', {}, function (d) {
    if (d.error) {
      return
    }
    Character.setDuelMotivation(d.motivation)
    Character.setNPCDuelMotivation(d.motivation_npc)
    TWDS.duelinfo.update()
    TWDS.duelinfo.interval = setInterval(TWDS.duelinfo.intervalhandler, 30 * 1000)
  })
}
/*
TWDS.duelinfo.ajaxCompletehandler = function (event, xhr, settings) {
  const url = settings.url
  if (url.search('window=duel') !== -1) {
    if (url.search('action=duel_npc') !== -1) {

    }
  }
}
*/
TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'misc_duelinfo_display',
    TWDS._('MISC_SETTING_DUELINFO_DISPLAY', 'Show a duel status bar with your character information'),
    true, TWDS.duelinfo.init)
  EventHandler.listen('duelmotivation_changed', function () {
    TWDS.duelinfo.update()
  })
})
