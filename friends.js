// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.friends = {}
TWDS.translation_de.FRIENDS_NO_FRIENDS = 'Du hast hier keine Freunde.'
TWDS.translation_de.FRIENDS_COUNT_TEXT = 'Du hast hier $count$ Freunde.'
TWDS.translation_de.FRIENDS = 'Freunde'
TWDS.translation_de.FRIENDS_TH_NAME = 'Name'
TWDS.translation_de.FRIENDS_TH_LEVEL = 'Stufe'
TWDS.translation_de.FRIENDS_TH_CLASS = 'Klasse'
TWDS.translation_de.FRIENDS_TH_PROF = 'Beruf'

TWDS.friends.openwindow = function () {
  const win = wman.open('TWDS_friends_window', TWDS._('FRIENDS', 'Friends'), 'TWDS_friends_window')
  win.setMiniTitle(TWDS._('FRIENDS', 'Friends'))

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_friends_container'
  })
  const info = TWDS.createEle('p', { beforeend: content })
  const functions = TWDS.createEle('p', { beforeend: content })
  const table = TWDS.createEle('table', { beforeend: content, className: 'TWDS_with_border TWDS_padded TWDS_sortable' })
  const thead = TWDS.createEle('thead', { beforeend: table })
  const tbody = TWDS.createEle('tbody', { beforeend: table })

  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
  Ajax.remoteCallMode('friendsbar', 'search', {
    search_type: 'friends'
  }, function (response) {
    if (response.error) {
      return new UserMessage(response.msg).show()
    }
    const pl = response.players
    if (pl.length < 2) {
      TWDS.createEle('tr', {
        children: [
          { nodeName: 'td', textContent: TWDS._('FRIENDS_NO_FRIENDS', 'no friends') }
        ]
      })
      return
    }
    info.textContent = TWDS._('FRIENDS_COUNT_TEXT', 'You have $count$ friends.', { count: pl.length - 1 })
    for (const eventName in Game.sesData) {
      const ev = Game.sesData[eventName]
      if (!ev.friendsbar || (window.buildTimestamp(ev.meta.end, true) <= new window.ServerDate().getTime())) {
        continue
      }
      TWDS.createEle({
        nodeName: 'button',
        textContent: ev.friendsbar.label,
        dataset: { event: eventName },
        onclick: function () {
          new west.storage.FriendsBar('friends', function () {}, function () {}, function () {})
            .activateEventAll('DayOfDead')
        },
        last: functions
      })
    }
    thead.appendChild(TWDS.createEle({
      nodeName: 'tr',
      children: [
        { nodeName: 'th', textContent: TWDS._('FRIENDS_TH_NAME', 'Name'), className: 'TWDS_clicktarget', dataset: { colsel: '.name' } },
        {
          nodeName: 'th',
          textContent: TWDS._('FRIENDS_TH_LEVEL', 'Level'),
          className: 'TWDS_clicktarget',
          dataset: { colsel: '.lv', sortmode: 'number', secondsel: '.name' }
        },
        { nodeName: 'th', textContent: TWDS._('FRIENDS_TH_CLASS', 'Class'), className: 'TWDS_clicktarget', dataset: { colsel: '.class', secondsel: '.name' } },
        { nodeName: 'th', textContent: TWDS._('FRIENDS_TH_PROF', 'Profession'), className: 'TWDS_clicktarget', dataset: { colsel: '.prof', secondsel: '.name' } }
      ]
    }))
    for (let i = 0; i < pl.length; i++) {
      if (pl[i].name === Character.name) continue
      TWDS.createEle('tr', {
        children: [
          { nodeName: 'td', className: 'name TWDS_clicktarget', dataset: { player_id: pl[i].player_id }, textContent: pl[i].name },
          { nodeName: 'td', className: 'lv ra', textContent: pl[i].level },
          { nodeName: 'td', className: 'class', textContent: Game.InfoHandler.getLocalString4Charclass(pl[i].class) },
          { nodeName: 'td', className: 'prof', textContent: Game.InfoHandler.getLocalString4ProfessionId(pl[i].profession_id) }
        ],
        last: tbody
      })
    }
    $('th:first-child', $(thead)).trigger('click')
  })
  TWDS.delegate(table, 'click', 'tbody .name', function (x) {
    window.PlayerProfileWindow.open(parseInt(this.dataset.player_id))
  })
  TWDS.delegate(table, 'click', 'thead th', function (x) {
    const tab = this.closest('table')
    const sel = this.dataset.colsel
    const secondsel = this.dataset.secondsel
    const sortmode = this.dataset.sortmode || 'text'
    const rows = [...TWDS.q('tbody tr', tab)]
    const cursort = tab.dataset.cursort || ''
    let mult = 1
    if (cursort === sel) {
      mult = -1
      tab.dataset.cursort = ''
    } else { tab.dataset.cursort = sel }

    const sortfunc = function (a, b, sel) {
      const tda = TWDS.q1(sel, a)
      const tdb = TWDS.q1(sel, b)
      let va
      let vb
      if ('sortval' in tda.dataset) {
        va = tda.dataset.sortval
      } else {
        va = tda.textContent
      }
      if ('sortval' in tdb.dataset) {
        vb = tdb.dataset.sortval
      } else {
        vb = tdb.textContent
      }
      let res = 0
      if (sortmode === 'number') {
        res = va - vb
      } else {
        res = va.localeCompare(vb)
      }
      if (res) return mult * res
      if (secondsel && sel !== secondsel) {
        return sortfunc(a, b, secondsel)
      }
      return 0
    }
    rows.sort(function (a, b) { return sortfunc(a, b, sel) })
    tbody.textContent = ''
    for (let i = 0; i < rows.length; i++) {
      tbody.appendChild(rows[i])
    }
  })
}
// this is not translated, because it runs quite early
TWDS.registerExtra('TWDS.friends.openwindow', 'Friends', 'Show friends')
