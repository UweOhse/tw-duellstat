// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.friendslistwindow = {}

TWDS.friendslistwindow.requests_initContent = function (data) {
  window.FriendslistWindow.Requests.TWDS_backup_initContent.apply(this, arguments)
  if (!TWDS.settings.misc_enhance_friendslistwindow) {
    return
  }
  const that = this
  Ajax.remoteCallMode('friendsbar', 'search', { search_type: 'friends' }, function (json) {
    console.log('friendsbar', json)
    console.log('this', that)
    if (json.error) return
    if (!json.players) return
    const flw = window.FriendslistWindow
    if (!flw) return
    const win = flw.window
    if (!win) return
    const dm = win.divMain
    if (!dm) return
    const ti = TWDS.q1('.friendslist-openrequests .tfoot .row_foot', dm)
    if (!ti) return
    let lvsum = 0
    for (let i = 0; i < json.players.length; i++) {
      lvsum += json.players[i].level
    }
    const str = TWDS._('FRIENDSLISTWINDOW_INFOTEXT',
      'You currently have $n$ friends with an average level of $avg$.', {
        n: json.players.length,
        avg: Math.round(lvsum / (json.players.length || 1))
      })
    TWDS.createEle('div.TWDS_friendslistwindow_num', {
      first: ti,
      textContent: str
    })
  })
}

TWDS.friendslistwindow.startfunc = function () {
  TWDS.registerSetting('bool', 'misc_enhance_friendslistwindow',
    TWDS._('FRIENDSLISTWINDOW_SETTING_ENHANCE', 'Enhance the friendslist window'),
    true, null, 'misc')

  window.FriendslistWindow.Requests.TWDS_backup_initContent = window.FriendslistWindow.Requests.TWDS_backup_initContent ||
    window.FriendslistWindow.Requests._initContent
  window.FriendslistWindow.Requests._initContent = TWDS.friendslistwindow.requests_initContent
}

TWDS.registerStartFunc(function () {
  TWDS.friendslistwindow.startfunc()
})

// vim: tabstop=2 shiftwidth=2 expandtab
//
