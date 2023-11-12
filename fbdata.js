// vim: tabstop=2 shiftwidth=2 expandtab
;(function () {
  const save = TWDS.fbdata
  TWDS.fbdata = {}
  TWDS.fbdata.fbw = (save ? save.fbw : false) || {}
})()
// TDWDS.fbdata.fbw[fortid]=fortbattlewindow
// fortbattlewindow:
// .fortId
// .characters=[
//   id: westPlayerId
//   characterid: index in .charIcons
//   name:
//   pos:
//   causeddamage
//   health
// ]
// .charIcons:[
//   .charId: jQuery[canvas or such thing]
// }
// .TWDS_hp: [team0hp, team1hp]

TWDS.fbdata.roundhandlerreal = function (that, roundno) {
  console.log('FBRHR', that, roundno)
  const fortid = that.fortId
  TWDS.fbdata.fbw[fortid] = that
  const a = []
  for (let i = 0; i < that.characters.length; i++) {
    a.push({
      id: that.characters[i].westPlayerId,
      name: that.characters[i].name,
      pos: that.characters[i].position,
      done: 0,
      causeddamage: that.characters[i].causeddamage,
      health: that.characters[i].health
    })
  }

  window.sessionStorage.TWDS_fbplayers = JSON.stringify(a)

  const hp = [0, 0]
  for (let i = 0; i < that.characters.length; i++) {
    const c = that.characters[i]
    if (c.team >= 0 && c.team <= 1) {
      hp[c.team] += c.health
    }
  }
  let hpd0 = -1
  let hpd1 = -1
  if (that.TWDS_hp && that.TWDS_hp[1]) {
    hpd0 = that.TWDS_hp[0] - hp[0]
    hpd1 = that.TWDS_hp[1] - hp[1]
  }
  that.TWDS_hp = [hp[0], hp[1]]
  // post the number diffs to the chat:
  TWDS.fbchat.roundhandler(fortid, roundno, hp[0], hp[1], hpd0, hpd1)
}
TWDS.fbdata.playerhandler = function (playerinfo) { // start of the battle
  window.FortBattleWindow._TWDS_backup_handlePlayerInfoSignal.call(this, playerinfo)
  TWDS.fbdata.roundhandlerreal(this, 0)
}
TWDS.fbdata.roundhandler = function (roundinfo) { // start of a round
  window.FortBattleWindow._TWDS_backup_handleRoundInfoSignal.call(this, roundinfo)
  TWDS.fbdata.roundhandlerreal(this, roundinfo.roundnumber)
}

TWDS.fbdata.cleanup = function () {
  for (const fortid of Object.keys(TWDS.fbdata.fbw)) {
    if (TWDS.fbdata.fbw[fortid].isWindowOpen()) { continue }
    delete TWDS.fbdata.fbw[fortid]
  }
}
TWDS.fbdata.startfunc = function () {
  if (!window.FortBattleWindow._TWDS_backup_handleRoundInfoSignal) {
    window.FortBattleWindow._TWDS_backup_handleRoundInfoSignal = window.FortBattleWindow.handleRoundInfoSignal
  }
  window.FortBattleWindow.handleRoundInfoSignal = TWDS.fbdata.roundhandler

  if (!window.FortBattleWindow._TWDS_backup_handlePlayerInfoSignal) {
    window.FortBattleWindow._TWDS_backup_handlePlayerInfoSignal = window.FortBattleWindow.handlePlayerInfoSignal
  }
  window.FortBattleWindow.handlePlayerInfoSignal = TWDS.fbdata.playerhandler

  setInterval(TWDS.fbdata.cleanup, 5000)
}

TWDS.registerStartFunc(function () {
  TWDS.fbdata.startfunc()
})
