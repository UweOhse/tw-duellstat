TWDS.fbchat = {}
TWDS.fbchat.oldhp = null
TWDS.fbchat.sendmsg = function (fortid, msg) {
  const rooms = window.Chat.Resource.Manager.getRooms()
  fortid = parseInt(fortid)
  window.Chat.Formatter.formatResponse(null, 'system', 'test', new Date().getTime())
  for (const rid in rooms) {
    const r = rooms[rid]
    if (r.room === 'fortbattle' && r.fortId === fortid) {
      const ti = window.Chat.Formatter.formatTime(new Date().getTime(), false)
      const x = '<div>[' + ti + ']</span> duellstat: ' + msg + '</div>'
      r.addMessage(x)
      console.log('send', msg, 'to', r)
      return
    }
  }

  console.log('strange: no fort battle chat found for id', fortid, 'in', rooms)
}
TWDS.fbchat.makemsg = function (roundno, defhp, atthp, defdelta, attdelta) {
  if (attdelta > 0 || defdelta > 0) {
    attdelta = -attdelta
    defdelta = -defdelta
    return TWDS._('FBCHAT_WITH_DELTA',
      "$roundprefix$--- HP: att. <span style='color:#ff2222'>$atthp$ ($attdelta$)</span>, def. <span style='color:#00ccff'>$defhp$ ($defdelta$)</span>",
      {
        atthp: atthp,
        defhp: defhp,
        attdelta: attdelta,
        defdelta: defdelta
      }
    )
  }
  return TWDS._('FBCHAT_WITHOUT_DELTA',
    "$roundprefix$--- HP: att. <span tyle='color:#ff2222'>$atthp$</span>, def. <span style='color:#00ccff'>$defhp$</span>",
    {
      atthp: atthp,
      defhp: defhp
    }
  )
}
TWDS.fbchat.roundhandlerreal = function (that, roundno) {
  if (!TWDS.settings.misc_fortbattle_chatext) {
    return
  }
  const hp = [0, 0]
  for (let i = 0; i < that.characters.length; i++) {
    const c = that.characters[i]
    if (c.team >= 0 && c.team <= 1) {
      hp[c.team] += c.health
    }
  }
  let hpd0 = -1
  let hpd1 = -1
  if (TWDS.fbchat.oldhp) {
    hpd0 = TWDS.fbchat.oldhp[0] - hp[0]
    hpd1 = TWDS.fbchat.oldhp[1] - hp[1]
  }
  let pre = ''
  if (roundno) { pre = TWDS._('FBCHAT_ROUND', '--- Round $roundno$ ', { roundno: roundno }) }
  const msg = TWDS.fbchat.makemsg(roundno, hp[0], hp[1], hpd0, hpd1)
  TWDS.fbchat.sendmsg(that.fortId, pre + msg)
  TWDS.fbchat.oldhp = hp
}
TWDS.fbchat.playerhandler = function (playerinfo) { // start of the battle
  window.FortBattleWindow._TWDS_backup_handlePlayerInfoSignal.call(this, playerinfo)
  console.log('TWDS FBCHAT PLAYERHANDLER', playerinfo, this)
  TWDS.fbchat.roundhandlerreal(this, 0)
}
TWDS.fbchat.roundhandler = function (roundinfo) { // start of a round
  window.FortBattleWindow._TWDS_backup_handleRoundInfoSignal.call(this, roundinfo)
  console.log('TWDS FBCHAT ROUNDHANDLER', roundinfo, this)
  TWDS.fbchat.roundhandlerreal(this, roundinfo.roundno)
}
TWDS.fbchat.startfunc = function () {
  if (!window.FortBattleWindow._TWDS_backup_handleRoundInfoSignal) {
    window.FortBattleWindow._TWDS_backup_handleRoundInfoSignal = window.FortBattleWindow.handleRoundInfoSignal
  }
  window.FortBattleWindow.handleRoundInfoSignal = TWDS.fbchat.roundhandler

  if (!window.FortBattleWindow._TWDS_backup_handlePlayerInfoSignal) {
    window.FortBattleWindow._TWDS_backup_handlePlayerInfoSignal = window.FortBattleWindow.handlePlayerInfoSignal
  }
  window.FortBattleWindow.handlePlayerInfoSignal = TWDS.fbchat.playerhandler

  TWDS.registerSetting('bool', 'misc_fortbattle_chatext',
    TWDS._('FBS_SETTING', 'Add health point information to the fort battle chat.'),
    true, null, 'misc')
}
TWDS.registerStartFunc(function () {
  TWDS.fbchat.startfunc()
})

// vim: tabstop=2 shiftwidth=2 expandtab
