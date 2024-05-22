// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.townwindow = {}
TWDS.townwindow.hash = function (str) { // DJBs hash, with an additional &(2^32-1) since JS doesn't use 32bit floats.
  const len = str.length
  let hash = 5381
  for (let i = 0; i < len; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xFFFFFFFF
  }
  return hash >>> 0
}
TWDS.townwindow.init = function (data, t) {
  TownWindow.TWDS_backup_init.apply(this, arguments)
  if (TWDS.settings.townwindow_alliance) {
    Ajax.remoteCallMode('building_cityhall', 'list_residents', {
      town_id: data.town_id
    }, function (residata) {
      if (residata.list && residata.list.data && residata.list.data[0]) {
        Ajax.remoteCallMode('profile', 'init', {
          playerId: residata.list.data[0].player_id
        }, function (profdata) {
          const an = profdata.town.alliance_name
          const ai = profdata.town.alliance_id
          const to = TWDS.q1('.town-overview', TownWindow.DOM)
          if (to && ai) {
            TWDS.createEle({
              nodeName: 'div.town-alliance.linklike',
              last: to,
              textContent: an,
              onclick: function () { AllianceWindow.open(ai) }
            })
          }
        })
      }
    })
  }
}

TWDS.townwindow.showrankingcrafters = function () {
  // this a bit complicated because the lacking (stupid) profile data doesn't contain the crafting level.
  // but we have the world crafting ranking, which, of course, doesn't contain the town info. Stupid.
  const titlestr = TWDS._('TOWNWINDOW_SRC_TITLE', 'Ranking crafters')
  const win = wman.open('TWDS_rankingcrafters', titlestr)
  win.setMiniTitle(TWDS._('TOWNWINDOW_SRC_MINITITLE', 'Crafters'))
  const sp = new west.gui.Scrollpane()

  const content = TWDS.createEle('div', {
    className: 'TWDS_achievements_container'
  })
  const state = TWDS.createEle('p.info', { last: content })

  state.textContent = 'please wait'
  sp.appendContent(content)
  win.appendToContentPane(sp.getMainDiv())

  Ajax.remoteCallMode('building_cityhall', 'list_residents', {
    town_id: this.dataset.townId
  }, function (residata) {
    const profs = [[], [], [], [], []]
    let profsdone = 0
    const allresidents = {}
    for (let i = 0; i < residata.list.data.length; i++) {
      const id = residata.list.data[i].player_id
      allresidents[id] = [-1, -1]
    }
    let playersfound = 0
    const playerscount = residata.list.data.length
    const limit = 3
    const finish = function () {
      state.textContent = ''
      const tab = TWDS.createEle({
        nodeName: 'table.rankingcrafters',
        last: content
      })
      let tr = TWDS.createEle('tr', { last: tab })
      TWDS.createEle('th', {
        last: tr,
        textContent: TWDS._('TOWNWINDOW_SRC_TH_PROF', 'Profession')
      })
      TWDS.createEle('th', {
        last: tr,
        textContent: TWDS._('TOWNWINDOW_SRC_TH_NUM', '#')
      })
      TWDS.createEle('th', {
        last: tr,
        textContent: TWDS._('TOWNWINDOW_SRC_TH_PLAYER', 'Player name')
      })
      TWDS.createEle('th', {
        last: tr,
        textContent: TWDS._('TOWNWINDOW_SRC_TH_POINTS', 'Points')
      })
      TWDS.createEle('th', {
        last: tr,
        textContent: TWDS._('TOWNWINDOW_SRC_TH_RECIPES', 'Recipes')
      })
      for (let i = 1; i <= 4; i++) {
        for (let j = 0; j < profs[i].length; j++) {
          tr = TWDS.createEle('tr', { last: tab })
          TWDS.createEle('th', {
            last: tr,
            textContent: j === 0 ? Game.InfoHandler.getLocalString4ProfessionId(i) : ''
          })
          TWDS.createEle('td', {
            last: tr,
            textContent: j + 1
          })
          TWDS.createEle('td', {
            last: tr,
            children: [
              {
                nodeName: 'a.charlink',
                href: 'javascript:void(PlayerProfileWindow.open(' + profs[i][j].player_id + '))',
                textContent: profs[i][j].name
              }
            ]
          })
          TWDS.createEle('td', {
            last: tr,
            textContent: profs[i][j].profession_skill
          })
          TWDS.createEle('td', {
            last: tr,
            textContent: profs[i][j].learnt_recipes
          })
        }
      }
    }
    state.textContent = 'found ' + playersfound + '/' + playerscount + ' players'
    const doone = function (pg) {
      Ajax.remoteCallMode('ranking', 'get_data', {
        page: pg,
        tab: 'craft'
      }, function (rankdata) {
        state.textContent = 'found ' + playersfound + '/' + playerscount + ' players on ' + rankdata.page + '/' + rankdata.pages + ' pages (' + profsdone + '/4 professions done)'
        for (let i = 0; i < rankdata.ranking.length; i++) {
          const d = rankdata.ranking[i]
          if (d.player_id in allresidents) {
            playersfound++
            const pid = d.profession_id
            if (profs[pid].length < limit) {
              profs[pid].push(d)
              if (profs[pid].length === limit) {
                profsdone++
              }
            }
          }
        }
        if (profsdone === 4) {
          finish()
          return
        }
        if (playersfound === playerscount) {
          finish()
          return
        }
        if (pg < rankdata.pages) {
          let to = 250
          if (pg % 10 === 0) { to += 1500 }
          if (pg % 30 === 0) { to += 5500 }
          setTimeout(function () {
            doone(pg + 1)
          }, to)
          return
        }
        finish()
      })
    }
    doone(1)
  })
}

TWDS.townwindow.residentsfillcontent = function () {
  const dosort = function () {
    let by = 'rank'
    if (this.classList.contains('name_foreign')) { by = 'name_foreign' }
    if (this.classList.contains('name')) { by = 'name' }

    const t = this.closest('.fancytable')
    let dir
    if (t.dataset.sortedby === by) {
      dir = parseInt(t.dataset.sortdir || 1) * -1
    } else {
      dir = 1
    }
    t.dataset.sortdir = dir
    t.dataset.sortedby = by
    if (!t) return
    const b = TWDS.q1('.tbody', t)
    if (!b) return
    const cp = TWDS.q1('.tw2gui_scrollpane_clipper_contentpane', b)
    if (!cp) return
    const tmp = TWDS.q('.row', cp)

    const rows = []
    for (let i = 0; i < tmp.length; i++) rows.push(tmp[i])
    rows.sort(function (a, b) {
      const av = TWDS.q1('.' + by, a).textContent
      const bv = TWDS.q1('.' + by, b).textContent
      if (by === 'rank') {
        return dir * (parseInt(bv) - parseInt(av))
      }
      return dir * (av.toLocaleLowerCase().localeCompare(bv.toLocaleLowerCase()))
    })
    cp.innerHTML = ''
    for (let i = 0; i < rows.length; i++) { cp.appendChild(rows[i]) }
  }
  CityhallWindow.Residents.TWDS_backup_fillContent.apply(this, arguments)

  if (!this.table.divMain) return

  const main = this.table.divMain[0]
  main.sortedby = 'rank'
  const thead = TWDS.q1('.trows .thead', main)

  const nf = TWDS.q1('.name_foreign, .name', thead)
  nf.classList.add('linklike')
  nf.onclick = dosort

  const lv = TWDS.q1('.rank', thead)
  lv.classList.add('linklike')
  lv.onclick = dosort
}
TWDS.townwindow.residentsinit = function () {
  CityhallWindow.Residents.TWDS_backup_init.apply(this, arguments)
  if (!TWDS.settings.townwindow_crafters) {
    return
  }
  const chr = TWDS.q1('.cityhall-residents', this.window.divMain[0])
  TWDS.createEle({
    nodeName: 'button.TWDS_button',
    last: chr,
    textContent: 'show ranking crafters',
    dataset: { townId: this.main.townId },
    onclick: TWDS.townwindow.showrankingcrafters
  })
}

TWDS.townwindow.startfunc = function () {
  TWDS.registerSetting('bool', 'townwindow_alliance',
    TWDS._('TOWNWINDOW_SETTING_ALLIANCE', 'Show the alliance name in the town window'),
    true, null, 'misc')
  TownWindow.TWDS_backup_init = TownWindow.TWDS_backup_init || TownWindow.init
  TownWindow.init = TWDS.townwindow.init

  TWDS.registerSetting('bool', 'townwindow_crafters',
    TWDS._('TOWNWINDOW_SETTING_SHOW_RANKING_CRAFTERS', 'Show the ranking crafters in the residents window'),
    true, null, 'misc')
  CityhallWindow.Residents.TWDS_backup_init = CityhallWindow.Residents.TWDS_backup_init ||
    CityhallWindow.Residents.init
  CityhallWindow.Residents.init = TWDS.townwindow.residentsinit

  CityhallWindow.Residents.TWDS_backup_fillContent = CityhallWindow.Residents.TWDS_backup_fillContent ||
    CityhallWindow.Residents.fillContent
  CityhallWindow.Residents.fillContent = TWDS.townwindow.residentsfillcontent
}
TWDS.registerStartFunc(function () {
  TWDS.townwindow.startfunc()
})

// vim: tabstop=2 shiftwidth=2 expandtab
