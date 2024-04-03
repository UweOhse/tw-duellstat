// vim: tabstop=2 shiftwidth=2 expandtab
//

TWDS.fbmisc.updateRecruitlist = function (arg) {
  FortBattleWindow.backup_updateRecruitlist.call(this, arg)
  if (!TWDS.settings.fbmisc_recruiting) return

  const that = this
  const iae = this.infoareaEl[0]
  const rcl = TWDS.q1('.fort_battle_recruitlist_list', iae)
  if (!rcl) return

  rcl.classList.add('TWDS_enhanced')
  const trows = TWDS.q1('.trows', rcl)
  const head = TWDS.q1('.thead .row_head', trows)
  const ev = TWDS.q1('.evaluated', head)
  const body = TWDS.q1('.tbody', trows)
  TWDS.createEle('div.cell.cell_7.hp', {
    textContent: 'HP',
    before: ev,
    onclick: function (ev) {
      const title = 'Sort by health'
      const sorting = TWDS.createEle('div')
      TWDS.createEle('div.linklike', {
        textContent: '0 1 ... 8 9',
        last: sorting,
        onclick: function () {
          that.preBattle.setSort('>hp')
          that.updateRecruitlist(true)
          mb.hide()
        }
      })
      TWDS.createEle('div.linklike', {
        textContent: '9 8 ... 1 0',
        last: sorting,
        onclick: function () {
          that.preBattle.setSort('<hp')
          that.updateRecruitlist(true)
          mb.hide()
        }
      })
      const mb = new west.gui.Dialog(title, sorting).addButton('cancel').show()
    }
  })
  TWDS.createEle('div.cell.cell_7.dist', {
    textContent: 'Dist.',
    before: ev,
    onclick: function (ev) {
      const title = 'Sort by distance'
      const sorting = TWDS.createEle('div')
      TWDS.createEle('div.linklike', {
        textContent: '0 1 ... 8 9',
        last: sorting,
        onclick: function () {
          that.preBattle.setSort('>dist')
          that.updateRecruitlist(true)
          mb.hide()
        }
      })
      TWDS.createEle('div.linklike', {
        textContent: '9 8 ... 1 0',
        last: sorting,
        onclick: function () {
          that.preBattle.setSort('<dist')
          that.updateRecruitlist(true)
          mb.hide()
        }
      })
      const mb = new west.gui.Dialog(title, sorting).addButton('cancel').show()
    }
  })
  const st = TWDS.q1('.cell_5 .sort-status', head)
  st.innerHTML = ''
  TWDS.createEle('img.sort.sort-status', {
    src: '/images/chat/servicegrade_general.png',
    last: st
  })

  const list = this.preBattle.battleData.playerlist
  for (let i = 0; i < list.length; i++) {
    const p = list[i]
    p.dist = 0
    const pid = p.player_id

    const a = TWDS.q1('.player-' + pid, body)
    if (!a) continue

    const r = a.closest('.row')
    if (!r) continue

    if (Game.gameURL.includes('/en15.') && p.town_id === 510 && p.townname.includes(' Thicc ')) {
      const townele = TWDS.q1('.town', r)
      if (townele && p.town_id === 510) {
        townele.textContent = 'Thicc'
      }
    }

    const ev = TWDS.q1('.evaluated', r)
    if (!ev) continue
    let str = p.currhealth
    let cladd = ''
    if (p.currhealth !== p.maxhealth) {
      str += '/' + p.maxhealth
      cladd = 'notfull'
    }
    TWDS.createEle('div.cell.cell_7.hp', {
      before: ev,
      textContent: str,
      className: cladd
    })
    let dist = (this.preBattle.battleData.fortCoords.x - p.coords.x) *
      (this.preBattle.battleData.fortCoords.x - p.coords.x) +
      (this.preBattle.battleData.fortCoords.y - p.coords.y) *
      (this.preBattle.battleData.fortCoords.y - p.coords.y)
    p.dist = dist
    dist = (Math.round(Math.sqrt(dist)) / 1000).toFixed(1)
    cladd = ''
    if (dist > 0.0) {
      cladd = 'away'
    }
    TWDS.createEle('div.cell.cell_7.dist', {
      before: ev,
      textContent: dist,
      className: cladd
    })
  }
}
TWDS.fbmisc.recruitingstartfunc = function () {
  TWDS.registerSetting('bool', 'fbmisc_recruiting',
    TWDS._('FBMISC_SETTING_RECRUITING', 'Enhance the recruiting window.'),
    true, null, 'fortbattles')
  FortBattleWindow.backup_updateRecruitlist = FortBattleWindow.backup_updateRecruitlist ||
    FortBattleWindow.updateRecruitlist
  FortBattleWindow.updateRecruitlist = TWDS.fbmisc.updateRecruitlist

  window.PreBattle.recruitSorting.hp = function (a, b, eq) {
    return eq ? a.currhealth === b.currhealth : a.currhealth < b.currhealth
  }
  window.PreBattle.recruitSorting.dist = function (a, b, eq) {
    return eq ? a.dist === b.dist : a.dist < b.dist
  }
  window.PreBattle.recruitSorting.order = ['>town', '>name', '<level', '>class', '<rank', '<grader', '<hp', '<dist']
}
TWDS.registerStartFunc(TWDS.fbmisc.recruitingstartfunc)
