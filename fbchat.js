;(function () {
  const save = TWDS.fbchat
  TWDS.fbchat = {}
  TWDS.fbchat.fbw = (save ? save.fbw : false) || {}
})()
TWDS.fbchat.oldhp = null
TWDS.fbchat.characters = null
TWDS.fbchat.charIcons = null
TWDS.fbchat.lastmentioned = ''

TWDS.fbchat.sendmsg = function (fortid, msg) {
  const rooms = window.Chat.Resource.Manager.getRooms()
  fortid = parseInt(fortid)
  window.Chat.Formatter.formatResponse(null, 'system', 'test', new Date().getTime())
  for (const rid in rooms) {
    const r = rooms[rid]
    if (r.room === 'fortbattle' && r.fortId === fortid) {
      const ti = window.Chat.Formatter.formatTime(new Date().getTime(), false)
      const x = '<div>[' + ti + ']</span> ' + TWDS.scriptname + ': ' + msg + '</div>'
      r.addMessage(x)
      return
    }
  }

  console.log('strange: no fort battle chat found for id', fortid, 'in', rooms)
}
TWDS.fbchat.makemsg = function (roundno, defhp, atthp, defdelta, attdelta) {
  let pre = ''
  if (roundno) { pre = TWDS._('FBCHAT_ROUND', '--- Round $roundno$ ', { roundno: roundno }) }
  if (attdelta > 0 || defdelta > 0) {
    attdelta = -attdelta
    defdelta = -defdelta
    return pre + TWDS._('FBCHAT_WITH_DELTA',
      "--- HP: att. <span style='color:#ff2222'>$atthp$ ($attdelta$)</span>, def. <span style='color:#00ccff'>$defhp$ ($defdelta$)</span>",
      {
        atthp: atthp,
        defhp: defhp,
        attdelta: attdelta,
        defdelta: defdelta
      }
    )
  }
  return pre + TWDS._('FBCHAT_WITHOUT_DELTA',
    "--- HP: att. <span style='color:#ff2222'>$atthp$</span>, def. <span style='color:#00ccff'>$defhp$</span>",
    {
      atthp: atthp,
      defhp: defhp
    }
  )
}

// called from fbdata module
TWDS.fbchat.roundhandler = function (fortid, roundno, hp0, hp1, hpd0, hpd1) {
  if (TWDS.settings.misc_fortbattle_chatext) {
    const msg = TWDS.fbchat.makemsg(roundno, hp0, hp1, hpd0, hpd1)
    TWDS.fbchat.sendmsg(fortid, msg)
  }
}

TWDS.fbchat.findchar = function (searchname) {
  searchname = searchname.toLocaleLowerCase()
  const cand = []
  for (const fortid of Object.keys(TWDS.fbdata.fbw)) {
    const fbw = TWDS.fbdata.fbw[fortid]
    if (!fbw.characters) { continue }
    const chars = Object.values(fbw.characters)
    for (let i = 0; i < chars.length; i++) {
      const n = chars[i].name.toLocaleLowerCase()
      if (n === searchname) {
        return [
          { char: chars[i], battle: fbw }
        ]
      }
      if (n.includes(searchname)) {
        cand.push({ char: chars[i], battle: fbw })
      }
    }
  }
  return cand
}
TWDS.fbchat.clickhelper = function (ev) {
  const t = ev.target
  const name = t.textContent
  for (const fortid of Object.keys(TWDS.fbdata.fbw)) {
    const fbw = TWDS.fbdata.fbw[fortid]
    if (!fbw.characters) { continue }
    const icons = Object.values(fbw.charIcons)
    for (let i = 0; i < icons.length; i++) {
      icons[i][0].classList.remove('highlight')
    }
    for (let i = 0; i < fbw.characters.length; i++) {
      const r = fbw.characters[i]
      if (r.name === name) {
        const x = r.characterid
        if (fbw.charIcons && fbw.charIcons[x]) {
          const y = fbw.charIcons[x][0]
          let z = 50
          const interval = setInterval(function () {
            if (z % 2) {
              y.classList.add('highlight')
            } else {
              y.classList.remove('highlight')
            }
            z--
            if (z < 1) {
              clearInterval(interval)
            }
          }, 50)
        }
        break
      }
    }
  }
}

TWDS.fbchat.boosters = {}
TWDS.fbchat.getonebooster = function (data, finalize) {
  Ajax.remoteCallMode('profile', 'init', {
    playerId: data.id
  }, function (profdata) {
    console.log('profdata', data.id, profdata)
    const a = []
    for (const itemid of Object.values(profdata.wear)) {
      a.push(itemid)
    }
    const out = TWDS.bonuscalc.getComboBonus(a)
    if (out.fort_offense_sector || out.fort_defense_sector || out.fort_damage_sector ||
        out.fortbattlesector_defense || out.fort_defense_offense || out.fortbattlesector_damage) {
      console.log('out', out)
      TWDS.fbchat.boosters[data.id] = {
        name: data.name,
        id: data.id,
        off: (out.fort_offense_sector || 0) + (out.fort_defense_offsent || 0),
        def: (out.fort_defense_sector || 0) + (out.fortbattlesector_defense || 0),
        dmg: (out.fort_damage_sector || 0) + (out.fortbattlesector_damage || 0)
      }
      console.log('g1b', data.id, data.name, TWDS.fbchat.boosters[data.id])
    }
    if (finalize) { setTimeout(finalize, 2500) }
  })
}
TWDS.fbchat.markplayer = function (str) {

}
TWDS.fbchat.markboosters = function () {
  const data = JSON.parse(window.sessionStorage.TWDS_fbboosters)
  console.log('data', data)
  for (const fortid of Object.keys(TWDS.fbdata.fbw)) {
    const fbw = TWDS.fbdata.fbw[fortid]
    console.log('fbw', fbw)
    for (let id of Object.keys(data)) {
      id = parseInt(id)
      for (let j = 0; j < fbw.characters.length; j++) {
        if (parseInt(fbw.characters[j].westPlayerId) === id) {
          const cid = fbw.characters[j].characterid
          const icon = fbw.charIcons[cid]
          console.log('XX', id, j, cid, icon)
          if (icon && icon[0]) {
            let color1 = null
            let color2 = null
            let color3 = null
            if (data[id].dmg >= 200) {
              color2 = 'f'
            } else if (data[id].dmg >= 150) {
              color2 = 'c'
            } else if (data[id].dmg >= 100) {
              color2 = 'a'
            } else if (data[id].dmg >= 50) {
              color2 = '8'
            }
            if (data[id].off >= 15) {
              color1 = 'f'
            } else if (data[id].off >= 10) {
              color1 = 'c'
            } else if (data[id].off >= 5) {
              color1 = '8'
            }
            if (data[id].def >= 15) {
              color3 = 'f'
            } else if (data[id].def >= 10) {
              color3 = 'c'
            } else if (data[id].def >= 5) {
              color3 = '8'
            }
            console.log('icon', icon, 'colors', color1, color2, color3, 'data', data[id])
            if (color1 !== null || color2 !== null || color3 !== null) {
              let color = ''
              if (color1) { color += color1 } else { color += '0' };
              if (color2) { color += color2 } else { color += '0' };
              if (color3) { color += color3 } else { color += '0' };
              icon[0].style.outline = '2px solid #' + color
            }
          }
        }
      }
    }
  }
}
TWDS.fbchat.getboosters = function () {
  if (!('TWDS_fbplayers' in window.sessionStorage)) { return }
  const data = JSON.parse(window.sessionStorage.TWDS_fbplayers)
  const finalize = function () {
    console.log('all boosters', TWDS.fbchat.boosters)
    window.sessionStorage.TWDS_fbboosters = JSON.stringify(TWDS.fbchat.boosters)
    TWDS.fbchat.markboosters()
  }
  for (let i = 0; i < data.length; i++) {
    setTimeout(function () {
      TWDS.fbchat.getonebooster(data[i], i === data.length - 1 ? finalize : null)
    }, 125 * i + Math.floor(i / 10) * 1000)
  }
}

TWDS.fbchat.startfunc = function () {
  TWDS.registerSetting('bool', 'misc_fortbattle_chatext',
    TWDS._('FBCHAT_SETTING', 'Add health point information to the fort battle chat.'),
    true, null, 'misc')

  TWDS.delegate(document.body, 'click', '#windows .chat .chat_from .client_name', function (ev) {
    TWDS.fbchat.clickhelper(ev)
  })
  TWDS.delegate(document.body, 'click', '#windows .chat_contacts .contact_client .client_name', function (ev) {
    TWDS.fbchat.clickhelper(ev)
  })
}
// flashShowCharacterInfo: function(fortId, playerId, healthNow, healthMax, totalDmg, lastDmg, shotat, bonusdata, char)
TWDS.fbchat.findiconbyfortandplayer = function (fortid, pid) {
  const fbw = TWDS.fbdata.fbw[fortid]
  if (!fbw) return null
  for (let i = 0; i < fbw.characters.length; i++) {
    const ch = fbw.characters[i]
    if (ch.westPlayerId === pid) {
      const cid = ch.characterid
      const icon = fbw.charIcons[cid]
      if (icon && icon[0]) {
        return icon[0]
      }
    }
  }
}
TWDS.fbchat.getdirection = function (name1, name2) {
  const chlist1 = TWDS.fbchat.findchar(name1)
  if (chlist1.length === 0) {
    return [false, TWDS._('C_SOMESTRING_NOT_FOUND', '$string$ not found', { string: name1 })]
  }
  if (chlist1.length > 1) {
    return [false, TWDS._('FBCHAT_NOT_UNIQUE_MATCHES', '$string$ is not unique, matches $cand$',
      {
        string: name1,
        cand: chlist1.map(function (a, b) { return a.char.name }).join(', ')
      })]
  }
  const data1 = chlist1[0]
  const chlist2 = TWDS.fbchat.findchar(name2)
  if (chlist2.length === 0) {
    return [false, TWDS._('C_SOMESTRING_NOT_FOUND', '$string$ not found', { string: name2 })]
  }
  if (chlist2.length > 1) {
    return [false, TWDS._('FBCHAT_NOT_UNIQUE_MATCHES', '$string$ is not unique, matches $cand$',
      {
        string: name2,
        cand: chlist2.map(function (a, b) { return a.char.name }).join(', ')
      })]
  }
  const data2 = chlist2[0]
  if (data1.battle !== data2.battle) {
    return [false, TWDS._('FBCHAT_NOT_SAME_BATTLE', '$name$ and $name2$ are not in the same battle', {
      name1: data1.char.name,
      name2: data2.char.name
    })]
  }
  const ch1 = data1.char
  const battle1 = data1.battle
  const ch2 = data2.char

  const w = battle1.mapInfo.width
  const x1 = ch1.position % w
  const x2 = ch2.position % w
  const y1 = parseInt(ch1.position / w)
  const y2 = parseInt(ch2.position / w)

  let dir = ''
  if (x1 > x2) {
    dir += (x1 - x2) + ' ' + TWDS._('FBCHAT_LEFT', 'left')
  } else if (x1 < x2) {
    dir += (x2 - x1) + ' ' + TWDS._('FBCHAT_RIGHT', 'right')
  }
  if (y1 !== y2 && dir !== '') {
    dir += ' '
  }
  if (y1 > y2) {
    dir += (y1 - y2) + ' ' + TWDS._('FBCHAT_UP', 'up')
  } else if (y1 < y2) {
    dir += (y2 - y1) + ' ' + TWDS._('FBCHAT_DOWN', 'down')
  }
  return [true, dir]
}
TWDS.fbchat.swaphelper = function (name1, name2) {
  const res = TWDS.fbchat.getdirection(name1, name2)
  if (!res[0]) return res

  const str = TWDS._('FBCHAT_SWAPSTRING', '$name1$ swap $dir$ with $name2$', {
    name1: name1,
    name2: name2,
    dir: res[1]
  })

  return [true, str]
}
TWDS.fbchat.clickcharinfocolor = function (mode) {
  const fortid = parseInt(this.dataset.fortid)
  const playerid = parseInt(this.dataset.playerid)
  const icon = TWDS.fbchat.findiconbyfortandplayer(fortid, playerid)
  if (!icon) return
  const value = mode ? this.value : 'transparent'
  icon.style.outline = '2px solid ' + value
  if (mode) icon.dataset.currentcolor = value
  else delete icon.dataset.currentcolor
}
TWDS.fbchat.showcharinfo = function (...args) {
  window.FortBattle.TWDS_backup_flashShowCharacterInfo(...args)
  let old = TWDS.q1('#fort_battle_' + args[0] + '_infoarea .TWDS_charinfocolor')
  if (old) old.remove()
  old = TWDS.q1('#fort_battle_' + args[0] + '_infoarea .TWDS_charinfocolorclear')
  if (old) old.remove()
  old = TWDS.q1('#fort_battle_' + args[0] + '_infoarea .TWDS_copycharname')
  if (old) old.remove()
  const pa = TWDS.q1('#fort_battle_' + args[0] + '_infoarea')
  if (!pa) return
  const icon = TWDS.fbchat.findiconbyfortandplayer(args[0], args[1])
  let oldcolor = '#000000'
  if (icon) {
    oldcolor = icon.dataset.currentcolor || oldcolor
  }
  const colorele = TWDS.createEle({
    nodeName: 'input.TWDS_charinfocolor',
    type: 'color',
    last: pa,
    value: oldcolor,
    dataset: {
      fortid: args[0],
      playerid: args[1]
    },
    oninput: function (ev) {
      TWDS.fbchat.clickcharinfocolor.apply(this, [true])
    },
    onchange: function (ev) {
      TWDS.fbchat.clickcharinfocolor.apply(this, [true])
    }
  })
  TWDS.createEle({
    nodeName: 'button.TWDS_charinfocolorclear',
    textContent: 'clear',
    last: pa,
    dataset: {
      fortid: args[0],
      playerid: args[1]
    },
    onclick: function () {
      TWDS.fbchat.clickcharinfocolor.apply(this, [false])
      colorele.value = 'transparent'
    }
  })
  if (args[8]) {
    TWDS.createEle({
      nodeName: 'button.TWDS_copycharname',
      textContent: '...',
      last: pa,
      dataset: {
        charname: args[8].name,
        playerid: args[1]
      },
      onclick: function (ev) {
        const charname = this.dataset.charname
        const playerid = this.dataset.playerid
        const sb = (new west.gui.Selectbox(true))
          .setHeight('66px')
          .setWidth('60px')
          .addListener(function (choice) {
            console.log('choice', choice)
            if (choice === 'whisper') {
              const client = Chat.Resource.Manager.getClient('client_' + playerid)
              if (client) {
                const room = Chat.Resource.Manager.acquireRoom(client)
                if (room) {
                  room.openClick()
                }
              } else {
                new UserMessage("first 'copy name'!").show()
              }
            } else if (choice === 'name') {
              TWDS.fbchat.lastmentioned = charname
            } else if (choice === '+name' && !TWDS.fbchat.lastmentioned) {
              new UserMessage("first 'copy name'!").show()
            } else if (choice === '+name') {
              const out = TWDS.fbchat.swaphelper(TWDS.fbchat.lastmentioned, charname)
              if (!out[0]) {
                new UserMessage(out[1]).show()
              } else {
                const inputs = TWDS.q('.chat_room input.message')
                for (let i = 0; i < inputs.length; i++) {
                  const inp = inputs[i]
                  const cr = inp.closest('.chat_room')
                  if (cr && cr.style.display === 'block') {
                    inp.value += out[1]
                  }
                }
              }
            }
          })
        sb.addItem('name', TWDS._('FBCHAT_SWAP1', 'mark player1 for swap'))
        sb.addItem('+name', TWDS._('FBCHAT_SWAP2', 'swap player2'))
        sb.addItem('whisper', TWDS._('FBCHAT_WHISPER', 'whisper'))
        sb.show(ev)
      }
    })
  }
}
TWDS.fbchat.startfunc3 = function () {
  TWDS.delegate(document.body, 'click', '#windows .chat .chat_from .client_name', function (ev) {
    TWDS.fbchat.clickhelper(ev)
  })
  TWDS.delegate(document.body, 'click', '#windows .chat_contacts .contact_client .client_name', function (ev) {
    TWDS.fbchat.clickhelper(ev)
  })
  window.FortBattle.TWDS_backup_flashShowCharacterInfo = window.FortBattle.TWDS_backup_flashShowCharacterInfo ||
    window.FortBattle.flashShowCharacterInfo
  window.FortBattle.flashShowCharacterInfo = TWDS.fbchat.showcharinfo
}

TWDS.fbchat.startfunc2 = function () {
  const F = function (code, text, extra) {
    if (code) { text = TWDS._(code, text, extra) }
    return Chat.Formatter.formatMessage(Chat.Formatter.formatText(text, true),
      '<b>' + TWDS.scriptname + ':</b>', Date.now(), true, 'from_system')
  }
  Chat.Operations['^\\/swap\\s+(\\S+)\\s+(\\S+)$'] = {
    cmd: 'swap',
    shorthelp: TWDS._('CHAT_SWAP_SHORTHELP', 'Send swap command'),
    help: TWDS._('CHAT_SWAP_HELP', 'Generate a swap command for two players'),
    usage: '/swap search1 search2',
    func: function (room, msg, param) {
      console.log(room, msg, param)
      const out = TWDS.fbchat.swaphelper(param[1], param[2])
      if (!out[0]) {
        room.addMessage(F(null, out[1]))
        return
      }
      const color = window.localStorage.TWDS_chat_color
      if (color) { out[1] = '/' + color + ' ' + out[1] }
      Chat.sendMessage(out[1], room)
    }
  }
  Chat.Operations['^\\/(findplayer|f)\\s+(.*)$'] = {
    cmd: 'mark',
    shorthelp: TWDS._('CHAT_FINDPLAYER_SHORTHELP', 'find some player(s)'),
    help: TWDS._('CHAT_FINDPLAYER_HELP', 'Find players by name'),
    usage: TWDS._('CHAT_FINDPLAYER_USAGE', '/findplayer searchstring'),
    func: function (room, msg, param) {
      const fortid = room.fortId
      const fbw = TWDS.fbdata.fbw[fortid]
      if (!fbw) {
        console.log('FBW not found', TWDS.fbdata.fbw, fortid)
        room.addMessage(F('CHAT_FBW_WINDOW_NOT_FOUND', 'fortbattle window not found'))
        return
      }

      if (!('characters' in fbw)) {
        if ('preBattle' in fbw) {
          room.addMessage(F('CHAT_MARK_NOT_IN_PREBATTLE', "can't do that in a prebattle window"))
        } else {
          room.addMessage(F('CHAT_MARK_NO_CHARACTERS', 'characters not found'))
        }
        return
      }

      const search = param[2].trim().toLocaleLowerCase()
      let found = 0
      for (let i = 0; i < fbw.characters.length; i++) {
        const ch = fbw.characters[i]
        const name = ch.name.toLocaleLowerCase()
        if (name.includes(search)) {
          const cid = ch.characterid
          const icon = fbw.charIcons[cid]
          const dir = TWDS.fbchat.getdirection(Character.name, name)
          if (dir[0]) {
            room.addMessage(F(null, name + ': ' + dir[1]))
          }
          if (icon && icon[0]) {
            found++
            let z = 50
            const interval = setInterval(function () {
              if (z % 2) {
                icon[0].classList.add('highlight')
              } else {
                icon[0].classList.remove('highlight')
              }
              z--
              if (z < 1) {
                clearInterval(interval)
              }
            }, 50)
          }
        }
      }
      if (!found) {
        room.addMessage(F('CHAT_PLAYER_NOT_FOUND', 'player not found'))
      }
    }
  }
  Chat.Operations['^\\/mark\\s+([0-9]+|-)\\s+(.*)$'] = {
    cmd: 'mark',
    shorthelp: TWDS._('CHAT_MARK_SHORTHELP', 'Mark some player'),
    help: TWDS._('CHAT_MARK_HELP', 'Mark a player with a colored outline'),
    usage: TWDS._('CHAT_MARK_USAGE', '/mark colorcode searchstring'),
    func: function (room, msg, param) {
      const fortid = room.fortId
      const fbw = TWDS.fbdata.fbw[fortid]
      if (!fbw) {
        console.log('FBW not found', TWDS.fbdata.fbw, fortid)
        room.addMessage(F('CHAT_FBW_WINDOW_NOT_FOUND', 'fortbattle window not found'))
        return
      }

      if (!('characters' in fbw)) {
        if ('preBattle' in fbw) {
          room.addMessage(F('CHAT_MARK_NOT_IN_PREBATTLE', "can't do that in a prebattle window"))
        } else {
          room.addMessage(F('CHAT_MARK_NO_CHARACTERS', 'characters not found'))
        }
        return
      }

      const search = param[2].trim().toLocaleLowerCase()
      console.log('search', search)
      let color = param[1].trim()
      if (color === '-') {
        color = null
      } else {
        const rgb = color.match(/^(\d)(\d)(\d)$/)
        if (!rgb) {
          room.addMessage(F('CHAT_MARK_COLORFAIL', 'failed to parse color. use - for unmarking, or NNN for marking, where N is a number from 0 to 9.'))
          return
        }
        color = Math.floor(rgb[1] * 15 / 9).toString(16) +
                  Math.floor(rgb[2] * 15 / 9).toString(16) +
                  Math.floor(rgb[3] * 15 / 9).toString(16)
      }

      for (let i = 0; i < fbw.characters.length; i++) {
        const ch = fbw.characters[i]
        const name = ch.name.toLocaleLowerCase()
        if (name.includes(search)) {
          const cid = ch.characterid
          const icon = fbw.charIcons[cid]
          if (icon && icon[0]) {
            if (color) {
              icon[0].style.outline = '2px solid #' + color
              icon[0].dataset.currentcolor = '#' + color
              room.addMessage(F('CHAT_MARK_MARKED', 'marked $name$', { name: ch.name }))
            } else {
              icon[0].style.outline = 'none'
              delete icon[0].dataset.currentcolor
              room.addMessage(F('CHAT_MARK_UNMARKED', 'removed mark from $name$', { name: ch.name }))
            }
          }
        }
      }
    }
  }
}
TWDS.registerStartFunc(function () {
  TWDS.fbchat.startfunc()
  TWDS.fbchat.startfunc2()
  TWDS.fbchat.startfunc3()
})

// vim: tabstop=2 shiftwidth=2 expandtab
