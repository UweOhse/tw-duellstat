// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.recruit = {}
TWDS.recruit.win = null
TWDS.recruit.recommend = function (pl, inchat) {
  let xh = 90
  let mh = 90
  if (pl.class === 'soldier') {
    xh += pl.level * 20
    mh += pl.level * 3 * 20
  } else {
    xh += pl.level * 10
    mh += pl.level * 3 * 10
  }
  let isdmg = 0
  let istank = 0
  if (pl.maxhealth <= xh * 1.1) {
    isdmg = 2
  } else if (pl.maxhealth <= (xh + mh) / 2) {
    isdmg = 1
  } else if (pl.maxhealth >= mh * 0.9) {
    istank = 2
  } else if (pl.maxhealth >= (xh + mh) / 2) {
    istank = 1
  }

  if (isdmg === 2 && inchat > 1) return [5, 'DMG', inchat]
  if (isdmg === 2 && inchat < 2) return [2, 'DMG', inchat]
  if (isdmg === 1 && inchat > 1) return [5, 'dmg', inchat]
  if (isdmg === 1 && inchat < 2) return [2, 'dmg', inchat]

  if (istank === 2 && inchat > 1) return [4, 'TANK', inchat]
  if (istank === 2 && inchat < 2) return [3, 'TANK', inchat]
  if (istank === 1 && inchat > 1) return [4, 'tank', inchat]
  if (istank === 1 && inchat < 2) return [3, 'tank', inchat]
  return [2, '???', inchat]
}

TWDS.recruit.load = function (fortid, ranktoshow) {
  if (!fortid) fortid = 129
  const rooms = Chat.Resource.Manager.getRooms()
  console.log('rooms', rooms)
  const sta = {}
  for (const room of Object.values(rooms)) {
    console.log('room', room, room.room, room.fortId)
    if (room.room !== 'fortbattle') continue
    if (room.fortId !== fortid) continue
    console.log('clients', room.clients)
    for (let i = 0; i < room.clients.length; i++) {
      const c = Chat.Resource.Manager.getClient(room.clients[i])
      if (c === null) continue
      sta[c.playerId] = c.statusId
    }
  }
  console.log('status', sta)
  console.log('now for fort', fortid)
  TWDS.remoteCall('fort_battlepage&fort_id=' + fortid + '&TWDS=yes', '', {}, TWDS.recruit.win).then(function (d) {
    console.log('d', d, TWDS.recruit.win)
    const divMain = TWDS.recruit.win.divMain
    divMain.style.userSelect = 'text'
    const stfield = TWDS.q1('div.status span.content', divMain)
    if (!d.isWarDeclared) {
      stfield.textContent = 'no battle declared'
      return
    }

    let maxplayers = 0
    if (d.inProgress) {
      stfield.textContent = 'battle running'
    } else {
      let str = 'battle not running'
      if (d.isDefender) {
        maxplayers = d.rules.maxDef
        str += '. ' + d.rules.maxDef + ' possible defenders. '
      } else {
        maxplayers = d.rules.maxAtt
        str += '. ' + d.rules.maxAtt + ' possible attackers. '
      }
      str += d.playerlist.length + ' enrolled.'
      let ranked = 0
      for (let i = 0; i < d.playerlist.length; i++) {
        const pl = d.playerlist[i]
        const priv = pl.privilege + 2 // -2 = traitor
        if (priv > 2) { ranked++ }
      }
      str += ranked + ' ranked > recruit.'
      stfield.textContent = str
    }
    const privs = [
      [0, 'traitor', 'servicegrade_traitor.png'],
      [0, 'reservist', 'servicegrade_reservist.png'],
      [0, 'recruit', 'servicegrade_recruit.png'],
      [0, 'private', 'servicegrade_private.png'],
      [0, 'sergeant', 'servicegrade_sergeant.png'],
      [0, 'captain', 'servicegrade_captain.png'],
      [0, 'major_general', 'servicegrade_major_general.png'],
      [0, 'general', 'servicegrade_general.png']
    ]
    const classes = [
      [0, 'adventurer', 'symbol_adventurer_small_chat.png', 0, 0, 0],
      [0, 'duelist', 'symbol_duelist_small_chat.png', 0, 0, 0],
      [0, 'soldier', 'symbol_soldier_small_chat.png', 0, 0, 0],
      [0, 'worker', 'symbol_worker_small_chat.png', 0, 0, 0],
      [0, 'greenhorn', 'symbol_greenhorn_small_chat.png', 0, 0, 0]
    ]
    const h3 = TWDS.q1('h3.todohead', divMain)
    h3.textContent = ''
    if (ranktoshow > 0) {
      TWDS.createEle('span', { last: h3, textContent: 'All with rank ' })
      TWDS.createEle('img', { last: h3, src: '/images/chat/' + privs[ranktoshow][2] })
      TWDS.createEle('span', { last: h3, textContent: privs[ranktoshow][1] })
    } else {
      TWDS.createEle('span', { last: h3, textContent: 'All possible particiants' })
    }

    const todo = []
    for (let i = 0; i < d.playerlist.length; i++) {
      const pl = d.playerlist[i]
      let atit = 0
      if (pl.coords.x === d.fortCoords.x && pl.coords.y === d.fortCoords.y) {
        atit = 1
      }

      const priv = pl.privilege + 2 // -2 = traitor
      if (priv < privs.length) {
        privs[priv][0]++
      } else {
        privs[priv.length - 1][0]++ // band-aid in case a new rank is coming
      }

      for (let j = 0; j < classes.length; j++) {
        if (classes[j][1] === pl.class) {
          classes[j][0]++
          if (atit) classes[j][3]++
          if (priv > 2) classes[j][4]++
          if (priv > 2 && atit) classes[j][5]++
        }
      }
      if (priv === ranktoshow || ranktoshow < 0) {
        pl.TWDS_atfort = atit
        todo.push(pl)
      }
    }
    let enrolled = 0
    const rfield = TWDS.q1('div.ranknumbers span.content', divMain)
    rfield.textContent = ''
    for (let i = privs.length - 1; i >= 0; i--) {
      if (privs[i][0]) {
        enrolled += privs[i][0]
        const e = TWDS.createEle('span.rank', {
          last: rfield,
          children: [
            { nodeName: 'img', src: '/images/chat/' + privs[i][2], title: privs[i][1] },
            { nodeName: 'span', textContent: ': ' + privs[i][0] + ', ' }
          ]
        })
        if (enrolled > maxplayers) {
          e.style.color = 'red'
        }
      }
    }

    const cfield = TWDS.q1('div.classnumbers span.content', divMain)
    cfield.textContent = ''
    for (let i = classes.length - 1; i >= 0; i--) {
      if (classes[i][0]) {
        TWDS.createEle('span.rank', {
          last: cfield,
          children: [
            { nodeName: 'img', src: '/images/class_choose/' + classes[i][2], title: classes[i][1] },
            { nodeName: 'span', textContent: ': ' + classes[i][0] + ', ' },
            { nodeName: 'span', textContent: ' (' },
            { nodeName: 'span', textContent: classes[i][3], title: 'at the fort', style: { color: 'green' } },
            { nodeName: 'span', textContent: ', ' },
            { nodeName: 'span', textContent: classes[i][4], title: 'ranked', style: { color: '' } },
            { nodeName: 'span', textContent: ', ' },
            { nodeName: 'span', textContent: classes[i][5], title: 'ranked and at the fort', style: { color: 'green', fontWeight: 'bold' } },
            { nodeName: 'span', textContent: ' )' }
          ]
        })
      }
    }
    todo.sort(function (a, b) {
      if (a.TWDS_atfort > b.TWDS_atfort) return -1
      if (a.TWDS_atfort < b.TWDS_atfort) return +1
      return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
    })
    console.log(todo)
    const tab = TWDS.q1('table.todolist', divMain)
    tab.textContent = ''
    TWDS.createEle('tr', {
      last: tab,
      children: [
        { nodeName: 'th', textContent: 'Name' },
        { nodeName: 'th', textContent: 'Class' },
        { nodeName: 'th', textContent: 'Level' },
        { nodeName: 'th', textContent: 'CurHP' },
        { nodeName: 'th', textContent: 'MaxHP' },
        { nodeName: 'th', textContent: 'Role', title: 'Guessed based on maximum health points' },
        { nodeName: 'th', textContent: 'Chat', title: 'Is the player in chat?' },
        { nodeName: 'th', textContent: 'Rec.', title: 'Recommended rank' },
        { nodeName: 'th', textContent: 'Rank' }
      ]
    })
    let atflag = -1
    const inchatstr = ['offline', 'unknown', 'idle', 'active']
    for (let i = 0; i < todo.length; i++) {
      let td
      const pl = todo[i]
      console.log('todo', i, pl)
      let inchat = 0
      if (pl.player_id in sta) {
        inchat = sta[pl.player_id]
      }
      if (pl.TWDS_atfort !== atflag) {
        TWDS.createEle('tr', {
          last: tab,
          children: [
            { nodeName: 'th', colSpan: 7, textContent: pl.TWDS_atfort ? '------ at the fort ------' : '------ not at fort ------' }
          ]
        })
        atflag = pl.TWDS_atfort
      }
      const rec = TWDS.recruit.recommend(pl, inchat)
      const tr = TWDS.createEle('tr', { last: tab })
      TWDS.createEle('td.linklike', {
        last: tr,
        textContent: pl.name,
        dataset: {
          idx: pl.idx
        },
        onclick: function () {
          window.PlayerProfileWindow.open(pl.player_id)
        },
        onmouseenter: function () {
          const idx = this.dataset.idx
          const bg = TWDS.q1('#fort_battle_' + fortid + '_battleground')
          if (!bg) { return }
          const box = TWDS.q1('.cell-' + idx, bg)
          if (!box) return
          box.style.outline = '2px dotted white'
        },
        onmouseleave: function () {
          const idx = this.dataset.idx
          const bg = TWDS.q1('.fort_battle_battleground')
          if (!bg) { return }
          const box = TWDS.q1('.cell-' + idx, bg)
          if (!box) return
          box.style.outline = 'none'
        }
      })
      TWDS.createEle('td', { last: tr, textContent: pl.class })
      TWDS.createEle('td', { last: tr, textContent: pl.level })
      td = TWDS.createEle('td', { last: tr, textContent: pl.currhealth })
      if (pl.currhealth === pl.maxhealth) td.style.color = 'green'
      else if (pl.currhealth >= pl.maxhealth * 0.9) td.style.color = 'olive'
      else if (pl.currhealth >= pl.maxhealth * 0.75) td.style.color = 'orange'
      else td.style.color = 'red'

      TWDS.createEle('td', { last: tr, textContent: pl.maxhealth })
      TWDS.createEle('td', { last: tr, textContent: rec[1] }) // role
      TWDS.createEle('td', { last: tr, textContent: inchatstr[inchat] })
      const rectd = TWDS.createEle('td', { last: tr, textContent: privs[rec[0]][1] })
      if (rec[0] !== pl.privilege + 2) {
        rectd.classList.add('note')
      }

      td = TWDS.createEle('td.cur', { last: tr, textContent: '' })
      const sel = TWDS.createEle('select', { last: td })
      for (let i = 0; i < privs.length; i++) {
        const opt = TWDS.createEle('option', {
          last: sel,
          value: i,
          textContent: privs[i][1]
        })
        if (i === pl.privilege + 2) {
          opt.selected = true
        }
      }
      TWDS.createEle('td.info', { last: tr, textContent: pl.officername })

      sel.onchange = function () {
        const p = {}
        p[pl.player_id] = parseInt(sel.value) - 2
        TWDS.q1('td.info', tr).textContent = 'setting rank'
        Ajax.remoteCall('fort_battlepage', 'updatePrivileges', {
          fort_id: fortid,
          privileges: p
        }, function (response) {
          console.log('resp', response)
          TWDS.q1('td.info', tr).textContent = 'handling response'
          for (let i = 0; i < response.playerlist.length; i++) {
            const pl2 = response.playerlist[i]
            if (pl.player_id === pl2.player_id) {
              const tr = sel.closest('tr')
              if (!tr) return
              if (pl2.privilege === parseInt(sel.value) - 2) {
                TWDS.q1('td.info', tr).textContent = 'rank set'
              } else {
                TWDS.q1('td.info', tr).textContent = 'failed to set rank'
              }
            }
          }
        })
      }
    }
    // fort_id: 150
    // privileges[1692599]: 2
    //
    // https://en15.the-west.net/game.php?window=fort_battlepage&action=updatePrivileges&h=d73bfdj
    // Ajax.remoteCall('fort_battlepage', 'updatePrivileges', data, function (response) {
    //   if (response.hasOwnProperty('playerlist') && response.playerlist.length > 0) {
    //   new UserMessage(TWXlang.KoM.success, {
    //   type: 'success'
    //   }).show();
    //   }
    //   TWX.KoM.setPlayerRank(fortId, westId, rank);
    //   TWX.KoM.hidePopup();
    // });
    //
  })
}
TWDS.recruit.openwindow = function (fortid) {
  const win = TWDS.utils.stdwindow('TWDS_recruitwindow', 'Recruit')
  win.bringToTop()
  win.showLoader()
  const container = TWDS.utils.getcontainer(win)
  container.textContent = ''
  TWDS.createEle('div.wipwarning', {
    last: container,
    textContent: 'This is an early work-in-progress version of a new recruiting window. ' +
     'There will be bugs, and some features are still not implemented. Among the later are ' +
    'the display of the players position on the fortbattle map, and the possibility to ' +
    'select other recommendation systems (currently implemented is the nuking oriented thicc scheme). ' +
    "The tank/damager guessing might be enhanced, though i'm not sure how that will work out."
  })
  TWDS.recruit.win = win

  TWDS.createEle('div.status', {
    last: container,
    children: [
      { nodeName: 'span.title', textContent: 'Status: ' },
      { nodeName: 'span.content', textContent: 'Unknown.' }
    ]
  })

  const upd = TWDS.createEle('button.update', {
    last: container,
    children: [
      { nodeName: 'span', textContent: 'Update' }
    ]
  })
  upd.onclick = function () { TWDS.recruit.load(fortid, 2) }

  TWDS.createEle('div.ranknumbers', {
    last: container,
    children: [
      { nodeName: 'span.title', textContent: 'By rank: ' },
      { nodeName: 'span.content', textContent: '' }
    ]
  })
  TWDS.createEle('div.classnumbers', {
    last: container,
    children: [
      { nodeName: 'span.title', textContent: 'By class: ' },
      { nodeName: 'span.content', textContent: '' }
    ]
  })
  const ul = TWDS.createEle('ul.tabs', { last: container })
  TWDS.createEle('li.tab', { last: ul, textContent: 'all', dataset: { sel: 'rank', rank: -2000 } })
  TWDS.createEle('li.tab', { last: ul, textContent: 'traitor', dataset: { sel: 'rank', rank: -2 } })
  TWDS.createEle('li.tab', { last: ul, textContent: 'reserve', dataset: { sel: 'rank', rank: -1 } })
  TWDS.createEle('li.tab', { last: ul, textContent: 'recruit', dataset: { sel: 'rank', rank: 0 } })
  TWDS.createEle('li.tab', { last: ul, textContent: 'private', dataset: { sel: 'rank', rank: 1 } })
  TWDS.createEle('li.tab', { last: ul, textContent: 'sergeant', dataset: { sel: 'rank', rank: 2 } })
  TWDS.createEle('li.tab', { last: ul, textContent: 'captain', dataset: { sel: 'rank', rank: 3 } })
  TWDS.createEle('li.tab', { last: ul, textContent: 'majorgen', dataset: { sel: 'rank', rank: 4 } })
  TWDS.createEle('li.tab', { last: ul, textContent: 'general', dataset: { sel: 'rank', rank: 5 } })
  TWDS.createEle('h3.todohead', { textContent: 'todo', last: container })
  TWDS.createEle('table.todolist', {
    last: container
  })
  console.log('xx', TWDS.q('li.tab', ul))
  TWDS.q('li.tab', ul).forEach(function (li) {
    console.log('set up click handler for', li)
    li.onclick = function (ev) {
      console.log('li click', ev, this)
      const rank = parseInt(this.dataset.rank) + 2
      TWDS.recruit.load(fortid, rank)
    }
  })

  TWDS.recruit.load(fortid, 2)
}
TWDS.recruit.getInfoArea = function () {
  let htm = window.FortBattleWindow.TWDS_backup_getInfoArea.apply(this)
  htm += "<a href='javascript:void(0)' onClick='TWDS.recruit.openwindow(" + this.fortId + ")' " +
     "title='This is work in progress and still unfinished.'" +
    '>Recruiting Window</a><br>'
  return htm
}
TWDS.recruit.startfunc = function () {
  window.FortBattleWindow.TWDS_backup_getInfoArea = window.FortBattleWindow.TWDS_backup_getInfoArea || FortBattleWindow.getInfoArea
  window.FortBattleWindow.getInfoArea = TWDS.recruit.getInfoArea
}
if (TWDS.didstartfuncs) {
  TWDS.recruit.startfunc()
} else {
  TWDS.registerStartFunc(TWDS.recruit.startfunc)
}

// vim: tabstop=2 shiftwidth=2 expandtab
