// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.profilewindow = {}
TWDS.profilewindow.showbonus = function (worn, level) {
  const bo = TWDS.bonuscalc.getComboBonus(worn, true, level)
  const firsttable = TWDS.createEle('table.TWDS_pwin_bonus1')
  const thead = TWDS.createEle('thead', { last: firsttable })
  TWDS.createEle('tr', {
    last: thead,
    children: [
      {
        nodeName: 'th',
        colSpan: 12,
        textContent: 'Bonusfrom items and sets'
      }
    ]
  })
  const tbody = TWDS.createEle('tbody', { last: firsttable })
  const oneattrskill = function (pa, prefix, k, v) {
    const td = TWDS.createEle('td', { last: pa })
    if (v) {
      TWDS.createEle('span.xx', {
        last: td,
        children: [
          {
            nodeName: 'img.attricon',
            src: '/images/window/skills/' + prefix + '_' + k + '.png'
          },
          {
            nodeName: 'span.yy',
            textContent: v
          }
        ]
      })
    }
    return td
  }
  for (const attr of CharacterSkills.allAttrKeys) {
    const tr = TWDS.createEle('tr', { last: tbody })
    oneattrskill(tr, 'circle', attr, bo[attr])
    delete bo[attr]
    for (const skill of CharacterSkills.skillKeys4Attr[attr]) {
      oneattrskill(tr, 'skillicon', skill, bo[skill])
      delete bo[skill]
    }
  }
  const line = function (pa, value, text) {
    if (!value) return
    const tr = TWDS.createEle('tr', {
      last: pa
    })
    TWDS.createEle('td', { last: tr, textContent: text })
    TWDS.createEle('td', { last: tr, textContent: value })
  }

  const secondtable = TWDS.createEle('table.TWDS_pwin_bonus2')
  const a = []
  if (bo.luck) a.push([bo.luck * 100, true, TWDS._('BONUS_LUCK', 'Luck')])
  if (bo.dollar) a.push([bo.dollar * 100, true, TWDS._('BONUS_DOLLAR', 'Money')])
  if (bo.regen) a.push([bo.regen * 100, true, TWDS._('BONUS_REGEN', 'Regeneration')])
  if (bo.pray) a.push([bo.pray * 100, false, TWDS._('BONUS_PRAY', 'Praying')])
  if (bo.experience) a.push([bo.experience * 100, true, TWDS._('BONUS_EXPERIENCE', 'Experience')])
  if (bo.drop) a.push([bo.drop * 100, true, TWDS._('BONUS_DROP', 'Product drop chance')])
  delete bo.luck
  delete bo.dollar
  delete bo.regen
  delete bo.experience
  delete bo.drop
  delete bo.pray
  a.sort(function (x, y) {
    return y[0] - x[0]
  })
  for (let i = 0; i < a.length; i++) {
    const one = a[i]
    line(secondtable, (one[0] + 0.0).toFixed(0) + (one[1] ? '%' : ''), one[2])
  }
  if (bo.job) {
    line(secondtable, bo.job, TWDS._('BONUS_JOB', 'Job points (all jobs)'))
  }
  for (const k of Object.keys(bo)) {
    if (k.startsWith('job_')) {
      console.log('MISHANDLED', k, bo[k])
      line(secondtable, bo[k], TWDS._('BONUS_JOB_XXX', 'Job points ' + k))
      delete bo[k]
    }
  }
  delete bo.job

  const thirdtable = TWDS.createEle('table.TWDS_pwin_bonus3')
  line(thirdtable, bo.fort_offense, 'fort battle offense')
  line(thirdtable, bo.fort_defense, 'fort battle defense')
  line(thirdtable, bo.fort_resistance, 'fort battle resistance')
  line(thirdtable, bo.fort_offense_sector, 'offense sector bonus')
  line(thirdtable, bo.fort_defense_sector, 'defense sector bonus')
  line(thirdtable, bo.fort_damage_sector, 'damage sector bonus')
  delete bo.fort_damage_sector
  delete bo.fort_offense_sector
  delete bo.fort_offense
  delete bo.fort_defense_sector
  delete bo.fort_defense
  delete bo.fort_resistance

  delete bo.speed
  delete bo.damage // whatever that is.
  if (Object.keys(bo).length) { console.log('bonus remaining', JSON.parse(JSON.stringify(bo))) }

  for (const k of Object.keys(bo)) {
    line(thirdtable, bo[k], k)
  }
  return [firsttable, secondtable, thirdtable]
}
TWDS.profilewindow.setWear = function (eq, ch) {
  PlayerProfileMain.TWDS_backup_setWear.apply(this, arguments)
  const a = []
  for (let i = 0; i < Wear.slots.length; i++) {
    const sl = Wear.slots[i]
    if (eq[sl]) {
      a.push(eq[sl])
    }
  }

  const av = TWDS.q1('.profileavatar', this.window[0])
  if (av) {
    TWDS.createEle('div.TWDS_profilewindow_show_bonus_button.tw2gui-iconset.tw2gui-icon-shirt', {
      last: av,
      // title: tab.outerHTML,
      title: TWDS._('PROFILEWINDOW_KLICK4BONUS', 'Click to display equipment bonus'),
      dataset: {
        // popup: tab.outerHTML,
        worn: JSON.stringify(a),
        level: ch.level
      },
      onclick: function () {
        const pm = this.closest('.playerprofile-main')
        const old = TWDS.q1('.TWDS_pp_hack', pm)
        if (old) {
          old.remove()
          return
        }
        const worn = JSON.parse(this.dataset.worn)
        const level = parseInt(this.dataset.level)
        TWDS.createEle({
          nodeName: 'div.TWDS_pp_hack',
          children: TWDS.profilewindow.showbonus(worn, level),
          last: pm
        })
      }
    })
  }
}

TWDS.profilewindow.init = function (data, t) {
  PlayerProfileMain.TWDS_backup_init.apply(this, arguments)
  const pid = this.playerid
  const name = this.resp.playername
  const that = this

  if (TWDS.settings.profilewindow_craftpoints && 1) {
    Ajax.remoteCallMode('ranking', 'get_data', {
      rank: 'NaN',
      search: name,
      tab: 'craft'
    }, function (rdata) {
      if (rdata.error) return
      for (let i = 0; i < rdata.ranking.length; i++) {
        const e = rdata.ranking[i]
        if (e.player_id === pid) {
          const pp = TWDS.q1('.pp-prof', that.window[0])
          if (pp) {
            TWDS.createEle({
              nodeName: 'div.TWDS_craftpoints',
              textContent: e.profession_skill,
              last: pp
            })
            pp.title = pp.title + ' ' + e.profession_skill
          }
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
  TWDS.registerSetting('bool', 'profilewindow_wearbonus',
    TWDS._('PROFILEWINDOW_SETTING_CRAFTPOINTS', 'Show the bonus of the equipment in the profile window'),
    true, null, 'misc')
  console.log('PWIN start', PlayerProfileMain.setWear)
  PlayerProfileMain.TWDS_backup_setWear = PlayerProfileMain.TWDS_backup_setWear || PlayerProfileMain.setWear
  PlayerProfileMain.setWear = TWDS.profilewindow.setWear
}
TWDS.registerStartFunc(function () {
  TWDS.profilewindow.startfunc()
})

// vim: tabstop=2 shiftwidth=2 expandtab
