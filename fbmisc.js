// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.fbmisc = {}
TWDS.fbmisc.shownumberinterval = 0
TWDS.fbmisc.shownumber = function () {
  Ajax.remoteCall('fort_overview', '', {}, function (data) {
    const mp = TWDS.q1('#ui_bottombar .multiplayer')
    if (!mp) return

    let ele = TWDS.q1('.TWDS_fbcount', mp)

    let n = 0
    if (data.js) {
      for (let i = 0; i < data.js.length; i++) {
        if (data.js[i][3]) n++
      }
    }
    if (ele && !n) {
      ele.remove()
      return
    }
    if (!n) return
    if (!ele) {
      ele = TWDS.createEle({
        nodeName: 'span.TWDS_fbcount',
        last: mp
      })
    }
    ele.textContent = n
  })
}
TWDS.fbmisc.shownumberstarter = function () {
  if (TWDS.fbmisc.shownumberinterval) {
    window.clearInterval(TWDS.fbmisc.shownumberinterval)
    TWDS.fbmisc.shownumberinterval = 0
  }
  if (TWDS.settings.fbmisc_fbcount) {
    TWDS.fbmisc.shownumber()
    TWDS.fbmisc.shownumberinterval = window.setInterval(TWDS.fbmisc.shownumber, 5 * 60 * 1000)
  }
}
TWDS.fbmisc.renderPreBattle = function (a, b) {
  FortBattleWindow.TWDS_backup_renderPreBattle.apply(this, arguments)
  if (TWDS.settings.fbmisc_chattopic) {
    const fid = this.fortId
    const win = this.window
    const rooms = Chat.Resource.Manager.getRooms()
    for (const room of Object.values(rooms)) {
      if (room.id.includes('room_fortbattle_') && room.fortId === fid) {
        let topic = room.topic
        if (topic) topic = topic.trim()
        if (!topic) continue
        topic = Game.TextHandler.parse(topic)

        let gm = TWDS.q1('.gamemessages_container', win.divMain)
        if (!gm) {
          gm = TWDS.createEle({
            nodeName: 'div.gamemessages_container.selectable',
            children: [
              { nodeName: 'div.gamemessages_resizer' }
            ]
          })
          win.appendToWindowPane(gm)
        }
        let pane = TWDS.q1('.gamemessages_pane', gm)
        if (!pane) {
          pane = TWDS.createEle({
            nodeName: 'div.gamemessages_pane',
            last: gm
          })
        }
        TWDS.createEle({
          nodeName: 'div.TWDS_topicfromchat',
          innerHTML: topic,
          first: pane
        })
      }
    }
  }
}
TWDS.fbmisc.formatcharicon = function (p) {
  const ele = TWDS.createEle({
    nodeName: 'div.otherchar'
  })
  if (p.defender) { ele.classList.add('defender') } else { ele.classList.add('attacker') }
  if (p.freelancer) { ele.classList.add('freelancer') }
  ele.classList.add(p.class)
  return ele
}
TWDS.fbmisc.renderchars = function (data) {
  FortBattleWindow.TWDS_backup_renderChars.apply(this, arguments)
  if (TWDS.settings.fbmisc_charicons) {
    const cells = TWDS.q('.cell', this.battlegroundEl)
    if (cells) {
      for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove('TWDS_multiplechars')
        let o = TWDS.q('.otherchar', cells[i])
        for (let j = 0; j < o.length; j++) { o[j].remove() }

        cells[i].dataset.charcount = 0
        o = TWDS.q1('.ownchar', cells[i])
        if (o) { cells[i].dataset.charcount = 1 }
      }
    }
    if (data) { if (!this.preBattle.setPlayerlist(data.playerlist, true)) return }
    const playerlist = this.preBattle.battleData.playerlist
    for (let i = 0; i < playerlist.length; i++) {
      const pl = playerlist[i]
      if (pl.player_id === Character.playerId) continue
      if (pl.idx < 0) continue
      const el = TWDS.q1('.cell-' + pl.idx, this.battlegroundEl)
      if (!el) continue
      el.dataset.charcount = parseInt(el.dataset.charcount) + 1
      /*
      let own=TWDS.q1(".ownchar",el);
      if (own) continue; // more important: me.
      let target=TWDS.q1(".target",el);
      if (target) continue; // more important: me.
*/
      el.appendChild(TWDS.fbmisc.formatcharicon(pl))
    }
    if (cells) {
      for (let i = 0; i < cells.length; i++) {
        const n = parseInt(cells[i].dataset.charcount)
        if (n > 1) { cells[i].classList.add('TWDS_multiplechars') }
      }
    }
  }
}
TWDS.fbmisc.fortoverviewshowtab = function (id) {
  FortOverviewWindow.TWDS_backup_showTab.apply(this, arguments)
  const icons = TWDS.q('.fortoverview-currentbattles a img.fortOverviewIconScroll')
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i]
    const a = icon.parentNode
    if (a.nodeName !== 'A') continue // paranoia
    let oc = a.onclick
    if (!oc) continue
    oc = oc.toString()
    const m = oc.match(/Map.center\(([0-9]+),\s*([0-9]+)\)/)
    const wt = TWDS.q1('span[class^=wayTime]', a.parentNode)
    if (wt) {
      const id = wt.className.replace(/wayTime/, '')
      TWDS.createEle({
        nodeName: 'a',
        href: '#',
        dataset: {
          id: id,
          x: m[1],
          y: m[2]
        },
        onclick: function () {
          window.Guidepost.show(this.dataset.id, this.dataset.x, this.dataset.y, 'fort')
        },
        before: wt,
        textContent: wt.textContent
      })
      wt.remove()
    }
  }
}
TWDS.fbmisc.addButtonEvent = function () {
  if (!TWDS.settings.fbmisc_controlbuttons) {
    return FortBattleWindow._TWDS_backup_addButtonEvent.apply(this, arguments)
  }
  const battlegroundEl = this.battlegroundEl
  this.window.$('.fort_battle_buttons').on('click', '.layer_toggle', function (e) {
    const match = e.target.className.match(/button_(\w+)/)
    if (!match || !match[1]) return
    const layerElement = $('.battleground_' + match[1], battlegroundEl)
    const shallbehidden = layerElement.is(':visible')
    layerElement.toggle(0)
    if (shallbehidden) {
      e.target.style.opacity = 0.5
    } else {
      e.target.style.opacity = 1
    }
    if (match[1] !== 'leader_arrows') {
      const sn = 'fbmisc_controlbuttons_off_' + match[1]
      TWDS.settings[sn] = shallbehidden
      TWDS.saveSettings()
    }
  })
}
TWDS.fbmisc.getControlButtons = function () {
  const html = FortBattleWindow._TWDS_backup_getControlButtons.apply(this, arguments)
  if (!TWDS.settings.fbmisc_controlbuttons) return html
  // html is a string. Oh well.
  const div = TWDS.createEle('div', { innerHTML: html })
  const a = ['sectors', 'cellborders', 'terrain', 'sector_labels'] // leaving out leader_arrows
  for (const thing of a) {
    const cl = '.button_' + thing
    const ele = TWDS.q1(cl, div)
    const sn = 'fbmisc_controlbuttons_off_' + thing
    if (TWDS.settings[sn]) {
      ele.style.opacity = 0.5
      // layerElement _will_ be drawn. Yes, future.
      setTimeout(function () {
        // the future is here.
        const layerElement = $('.battleground_' + thing, this.battlegroundEl)
        layerElement.toggle(0)
      }, 100)
    }
  }
  return div.innerHTML
}

TWDS.fbmisc.showCellPopupHtml5 = function (x, y, cellIdx) {
  if (this.popup.idx !== cellIdx) {
    this.changeCellPopupText(cellIdx)
  } else {
    const b = this.window.divMain.getBoundingClientRect()
    this.popup.updatePosition({
      clientX: b.left,
      clientY: b.top
    }, true)
  }
}

TWDS.fbmisc.startfunc = function () {
  TWDS.registerSetting('bool', 'fbmisc_fbcount',
    TWDS._('FBMISC_SETTING_FCOUNT', 'Show the number of declared fort battles.'),
    true, TWDS.fbmisc.shownumberstarter, 'fortbattles')
  TWDS.registerSetting('bool', 'fbmisc_chattopic',
    TWDS._('FBMISC_SETTING_CHATTOPIC', 'Copy the chat topic to the prebattle window. ###conflicts with TWIR###'),
    true, null, 'fortbattles')
  TWDS.registerSetting('bool', 'fbmisc_charicons',
    TWDS._('FBMISC_SETTING_CHARICONS', 'Show class specific icons in the fortbattle preparation window'),
    true, null, 'fortbattles')
  TWDS.registerSetting('bool', 'fbmisc_walk',
    TWDS._('FBMISC_SETTING_WALK', 'Click on the waytime to walk to the fort'),
    true, null, 'fortbattles')
  TWDS.registerSetting('bool', 'fbmisc_controlbuttons',
    TWDS._('FBMISC_SETTING_CONTROLBUTTONS', 'Fix the usability of the control buttons'),
    true, null, 'fortbattles')
  TWDS.registerSetting('bool', 'fbmisc_movepopup',
    TWDS._('FBMISC_SETTING_MOVEPOPUP', 'Move the player popup/mouseover to the top of the fortbattle window (LOS)'),
    true, null, 'fortbattles')

  FortBattleWindow.TWDS_backup_renderPreBattle = FortBattleWindow.TWDS_backup_renderPreBattle ||
    FortBattleWindow.renderPreBattle
  FortBattleWindow.renderPreBattle = TWDS.fbmisc.renderPreBattle

  FortBattleWindow.TWDS_backup_renderChars = FortBattleWindow.TWDS_backup_renderChars ||
    FortBattleWindow.renderChars
  FortBattleWindow.renderChars = TWDS.fbmisc.renderchars

  FortOverviewWindow.TWDS_backup_showTab = FortOverviewWindow.TWDS_backup_showTab ||
    FortOverviewWindow.showTab
  FortOverviewWindow.showTab = TWDS.fbmisc.fortoverviewshowtab

  FortBattleWindow._TWDS_backup_addButtonEvent = FortBattleWindow._TWDS_backup_addButtonEvent ||
    FortBattleWindow.addButtonEvent
  FortBattleWindow.addButtonEvent = TWDS.fbmisc.addButtonEvent
  FortBattleWindow._TWDS_backup_getControlButtons = FortBattleWindow._TWDS_backup_getControlButtons ||
    FortBattleWindow.getControlButtons
  FortBattleWindow.getControlButtons = TWDS.fbmisc.getControlButtons

  FortBattleWindow.TWDS_backup_showCellPopupHtml5 = FortBattleWindow.TWDS_backup_showCellPopupHtml5 ||
    FortBattleWindow.showCellPopupHtml5
  FortBattleWindow.showCellPopupHtml5 = TWDS.fbmisc.showCellPopupHtml5
}
TWDS.registerStartFunc(function () {
  TWDS.fbmisc.startfunc()
})

// vim: tabstop=2 shiftwidth=2 expandtab
