// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.profilewindow = {}
TWDS.profilewindow.init = function (data, t) {
  PlayerProfileMain.TWDS_backup_init.apply(this, arguments)
  const pid = this.playerid
  console.log('pid', pid)
  const name = this.resp.playername
  console.log('name', name)
  const that = this

  if (TWDS.settings.profilewindow_craftpoints && 1) {
    Ajax.remoteCallMode('ranking', 'get_data', {
      rank: 'NaN',
      search: name,
      tab: 'craft'
    }, function (rdata) {
      console.log('rdata', rdata)
      if (rdata.error) return
      for (let i = 0; i < rdata.ranking.length; i++) {
        const e = rdata.ranking[i]
        if (e.player_id === pid) {
          console.log('found', e, that)
          const pp = TWDS.q1('.pp-prof', that.window[0])
          console.log('pp', pp)
          TWDS.createEle({
            nodeName: 'div.TWDS_craftpoints',
            textContent: e.profession_skill,
            last: pp
          })
          pp.title = pp.title + ' ' + e.profession_skill
        }
      }
    })
  }
}

TWDS.profilewindow.startfunc = function () {
  TWDS.registerSetting('bool', 'profilewindow_craftpoints',
    TWDS._('PROFILEWINDOW_SETTING_CRAFTPOINTS', 'Show the crafting level in the profile window'),
    true, null, 'misc')
  PlayerProfileMain.TWDS_backup_init = PlayerProfileMain.TWDS_backup_init || PlayerProfileMain.init
  PlayerProfileMain.init = TWDS.profilewindow.init
}
TWDS.registerStartFunc(function () {
  TWDS.profilewindow.startfunc()
})

// vim: tabstop=2 shiftwidth=2 expandtab
