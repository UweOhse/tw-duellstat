// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.chat = {}

// mark some strings in the chat as soon as they come.
TWDS.chat.init = function () { // really old stuff
  TWDS.registerSetting('string', 'chat_highlight',
    'A javascript regular expression. Matching parts of incoming chat messages will be highlighted.', ''
  )
  let rx, rx2
  const chatcfg = {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true
  }

  const recurse = function (n) {
    if (n.nodeType === 3) {
      if (!n.textContent.match(rx)) return

      const e = document.createElement('span')
      n.parentNode.insertBefore(e, n)
      n.remove()

      const s = n.textContent.split(rx)
      for (let i = 0; i < s.length; i++) {
        const t = s[i]
        let f
        if (t.match(rx2)) {
          f = document.createElement('span')
          f.className = 'TWDS_blinking TWDS_chat_highlight' // blinks for 60 seconds
          f.textContent = t
        } else {
          f = document.createTextNode(t)
        }
        e.appendChild(f)
      }
    } else if (n.nodeType === 1) {
      for (let i = 0; i < n.childNodes.length; i++) {
        recurse(n.childNodes[i])
      }
    }
  }
  let chatcontainer
  const chatobserver = new window.MutationObserver(function (mutations) {
    const tohighlight = TWDS.settings.chat_highlight.trim()
    if (tohighlight === '') return
    rx = new RegExp('(' + tohighlight + ')', 'i')
    rx2 = new RegExp('^(' + tohighlight + ')$', 'i')
    chatobserver.disconnect()
    mutations.forEach(function (mut) {
      if (mut.type !== 'childList') return
      if (mut.addedNodes.length === 0) return
      for (let i = 0; i < mut.addedNodes.length; i++) {
        const n = mut.addedNodes[i]
        if (n.nodeName !== 'TABLE') continue
        const tn = n.querySelector('.chat_text') // this might contain some divs.
        recurse(tn)
      }
    })
    chatobserver.observe(chatcontainer, chatcfg)
  })

  // first we need to find a chat window. do that with an observer
  const windowscfg = {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: false
  }

  const windows = document.querySelector('#windows')
  if (!windows) {
    setTimeout(TWDS.chatInit, 1000)
    return
  }
  const windowsobserver = new window.MutationObserver(function (mutations) {
    mutations.forEach(function (mut) {
      if (mut.type !== 'childList') return
      for (let i = 0; i < mut.addedNodes.length; i++) {
        const n = mut.addedNodes[i]
        if (n.nodeName !== 'DIV') continue
        for (i = 0; i < n.classList.length; i++) {
          if (n.classList[i].substring(0, 5) === 'chat_') {
            chatcontainer = n
            chatobserver.observe(n, chatcfg)
          }
        }
      }
      for (let i = 0; i < mut.removedNodes.length; i++) {
        const n = mut.removedNodes[i]
        if (n.nodeName !== 'DIV') continue
        for (i = 0; i < n.classList.length; i++) {
          if (n.classList[i].substring(0, 5) === 'chat_') {
            chatobserver.disconnect(n)
          }
        }
      }
    })
  })
  windowsobserver.observe(windows, windowscfg)
}
TWDS.chat.init2 = function () {
  TWDS.registerSetting('bool', 'chat_nostranger',
    TWDS._('CHAT_SETTING_NOSTRANGER', 'Show online/idle status even for strangers.'),
    false
  )
  Chat.Resource.Client.prototype.TWDS_backup_isStranger = Chat.Resource.Client.prototype.isStranger
  Chat.Resource.Client.prototype.isStranger = function () {
    if (TWDS.settings.chat_nostranger) { return false }
    return Chat.Resource.Client.prototype.TWDS_backup_isStranger.apply(this, arguments)
  }
}
TWDS.chat.localanswer = function (room, msg) {
  const ti = window.Chat.Formatter.formatTime(new Date().getTime(), false)
  msg = Chat.Formatter.formatText(msg, true)
  const ret = TWDS.createEle({
    nodeName: 'div',
    children: [
      { nodeName: 'span', textContent: ti },
      { nodeName: 'span', textContent: ' ' },
      { nodeName: 'span', innerHTML: msg }
    ]
  }).outerHTML
  room.addMessage(ret)
}
TWDS.chat.init3 = function () {
  const localanswer = TWDS.chat.localanswer

  Chat.Operations['^\\/active(.*)'] = {
    cmd: 'active',
    shorthelp: TWDS._('CHAT_ACTIVE_SHORTHELP', 'Lists active players (green dots).'),
    help: TWDS._('CHAT_ACTIVE_HELP', 'Lists non-idle players in this channel. This can list all players or those with names matching a search string'),
    usage: '/active searchstring | /active (for all)',
    func: function (room, msg, param) {
      const clients = room.clients
      const out = []
      console.log('param', param)
      const search = param[1].trim().toLocaleLowerCase()
      console.log('search', search)
      for (let i = 0; i < clients.length; i++) {
        const contact = TWDS.q1('.contact_' + clients[i])
        if (!contact) continue
        const x = TWDS.q1('.client_status img[src*=status_online]', contact)
        const cn = TWDS.q1('.client_name', contact)
        if (x && cn) {
          const name = cn.textContent
          if (search === '' || name.toLocaleLowerCase().includes(search)) {
            out.push(name)
          }
        }
      }
      out.sort(function (a, b) {
        return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase())
      })
      const ti = window.Chat.Formatter.formatTime(new Date().getTime(), false)
      const text = TWDS._('CHAT_ACTIVE_TEXT', 'active: $list$', {
        list: out.join(', ')
      })
      const ret = '<div>[' + ti + ']</span> ' + text + '</div>'
      room.addMessage(ret)
    }
  }
  Chat.Operations['^\\/ping(.*)'] = {
    cmd: 'ping',
    shorthelp: TWDS._('CHAT_PING_SHORTHELP', 'ping a player.'),
    help: TWDS._('CHAT_PING_HELP', 'Calls that player to this channel.'),
    usage: '/ping player name',
    func: function (room, msg, param) {
      const clients = room.clients
      let roomname = ''
      let addon = ''
      if (room.room === 'general') {
        roomname = 'Saloon ' + room.generalId // room.title is empty
      } else if (room.room === 'custom') {
        roomname = room.title
      } else if (room.room === 'alliance') {
        roomname = room.title
        addon = TWDS._('CHAT_ALLIANCE_ROOM', '(alliance chat)')
      } else if (room.room === 'town') {
        roomname = room.title
        addon = TWDS._('CHAT_TOWN_ROOM', '(town chat)')
      } else if (room.room === 'fortbattle') {
        roomname = room.title
        addon = TWDS._('CHAT_FB_ROOM', '(fortbattle chat)')
      } else if (room.room === 'client') {
        localanswer(room, "that doesn't work.")
        return
      } else {
        console.log('room', room)
        localanswer(room, 'unknown room type. uwe needs to debug this: ' + room.room)
        return
      }
      const search = param[1].trim().toLocaleLowerCase()
      if (search === '') {
        localanswer(room, 'pong (usage: /ping some-player-name)')
        return
      }

      for (let i = 0; i < clients.length; i++) {
        const contact = TWDS.q1('.contact_' + clients[i])
        if (!contact) continue
        const cn = TWDS.q1('.client_name', contact)
        if (cn) {
          const name = cn.textContent.toLocaleLowerCase()
          if (name === search) {
            const text = TWDS._('CHAT_PING_TEXT', 'Please come to $roomname$ $info$', {
              roomname: roomname,
              info: addon
            })
            Chat.Request.Tell(search, text)
            localanswer(room, TWDS._('CHAT_PINGED_MESSAGE', 'pinged $search$', { search: search }))
            return
          }
        }
      }
      localanswer(room, TWDS._('CHAT_PING_NOTFOUND', 'did not find $search$', {
        search: search
      }))
    }
  }
}
TWDS.chat.tabsend = function () {
  let val = this.input[0].value
  const firstchar = val.substr(0, 1)
  if (firstchar !== '/') {
    const color = window.localStorage.TWDS_chat_color
    if (color) { val = '/' + color + val }
    this.input[0].value = val
  }
  Chat.Layout.Tab.TWDS_backup_send.apply(this, arguments)
}
TWDS.chat.digitstohex = function (digits) {
  const rgb = digits.match(/^(\d)(\d)(\d)$/)
  if (!rgb) return false
  return Math.floor(rgb[1] * 15 / 9).toString(16) +
        Math.floor(rgb[2] * 15 / 9).toString(16) +
        Math.floor(rgb[3] * 15 / 9).toString(16)
}
TWDS.chat.init4 = function () {
  Chat.Operations['^\\/defaultcolor(.*)'] = {
    cmd: 'defaultcolor',
    shorthelp: TWDS._('CHAT_COLOR_SHORTHELP', 'Set default color.'),
    help: TWDS._('CHAT_COLOR_HELP', 'Sets a default color for all rooms and this and future sessions.'),
    usage: '/defaultcolor (RGB | - | nothing). RGB = Red/Green/Blue , each 0..9. - to unset. nothing to show current value',
    func: function (room, msg, param) {
      const color = param[1].trim().toLocaleLowerCase()
      if (!color) {
        const color = window.localStorage.TWDS_chat_color
        if (!color) {
          TWDS.chat.localanswer(room, 'no default color set')
        } else {
          TWDS.chat.localanswer(room, '/' + color + 'the default color is ' + color)
        }
        return
      } else if (color === '-') {
        delete window.localStorage.TWDS_chat_color
        TWDS.chat.localanswer(room, 'default color unset')
        return
      }
      const hex = TWDS.chat.digitstohex(color)
      if (!hex) {
        TWDS.chat.localanswer(room, 'failed to parse ' + color + ' as color')
        return
      }
      window.localStorage.TWDS_chat_color = color
      TWDS.chat.localanswer(room, '/' + color + 'default color set')
    }
  }
  Chat.Layout.Tab.TWDS_backup_send = Chat.Layout.Tab.TWDS_backup_send || Chat.Layout.Tab.prototype.send
  Chat.Layout.Tab.prototype.send = TWDS.chat.tabsend
}
TWDS.chat.playernocolor = {}
TWDS.chat.formatResponse = function (room, from, message, time) {
  if (from && from.pname) {
    const t = from.pname.toLocaleLowerCase()
    if (TWDS.chat.playernocolor[t]) {
      message = message.split(/[\s\u2060](?=\/\d\d\d)/).map(function (v) {
        const rgb = v.match(/^\/(\d\d\d)(\s*)(.*?)(\s*)$/)
        if (rgb) { return rgb[3] + rgb[4] } else { return v }
      }).join('')
    }
  }
  return Chat.Formatter.TWDS_backup_formatResponse.call(this, room, from, message, time)
}
TWDS.chat.init5 = function () {
  TWDS.chat.playernocolor = {}
  try {
    TWDS.chat.playernocolor = JSON.parse(window.localStorage.TWDS_chat_playernocolor || '{}')
  } catch (e) {
    console.log('exception', e)
    TWDS.chat.playernocolor = {}
  }
  Chat.Operations['^\\/uncolor(.*)'] = {
    cmd: 'uncolor',
    shorthelp: TWDS._('CHAT_UNCOLOR_SHORTHELP', 'Remove color from chat messages.'),
    help: TWDS._('CHAT_UNCOLOR_HELP', 'Remove (+) or allow (-) colors from messages of a player.'),
    usage: TWDS._('CHAT_UNCOLOR_USAGE', '/uncolor ( + | -) playername. + to remove, - to allow. Anything not matching that will list the current state'),
    func: function (room, msg, param) {
      const parsed = param[1].match(/\s+([-+])\s+(.+)$/)
      if (!parsed) {
        const a = Object.keys(TWDS.chat.playernocolor)
        if (a.length) {
          TWDS.chat.localanswer(room, '/990 ' +
            TWDS._('CHAT_UNCOLOR_LIST', 'You remove colors from these players:'))
          a.sort(function (c, d) { return c.localeCompare(d) })
          for (let i = 0; i < a.length; i++) {
            TWDS.chat.localanswer(room, ' - ' + a[i])
          }
        } else {
          TWDS.chat.localanswer(room, '/990 ' +
            TWDS._('CHAT_UNCOLOR_NONE', 'You remove colors from no players.'))
        }
        console.log('XX')
        TWDS.chat.localanswer(room, '/990 ' +
            TWDS._('CHAT_UNCOLOR_EXAMPLE1', 'To remove colors from all messages coming from a player: /removecolors + PLAYER NAME.'))
        TWDS.chat.localanswer(room, '/990 ' +
            TWDS._('CHAT_UNCOLOR_EXAMPLE2', 'To allow colors in all messages coming from a player: /removecolors - PLAYER NAME.'))
        return
      }
      const plus = parsed[1] === '+'
      const player = parsed[2].trim().toLocaleLowerCase()
      if (plus) {
        TWDS.chat.playernocolor[player] = 1
        TWDS.chat.localanswer(room, '/990' +
          TWDS._('CHAT_UNCOLOR_ADDED', 'removing colors from messages coming from $player$.',
            { player: player }))
      } else {
        delete TWDS.chat.playernocolor[player]
        TWDS.chat.localanswer(room, '/990' +
          TWDS._('CHAT_UNCOLOR_NOTREMOVINGCOLORS', 'Not removing colors from messages coming from $player$.',
            { player: player }))
      }
      window.localStorage.TWDS_chat_playernocolor = JSON.stringify(TWDS.chat.playernocolor)
    }
  }
  Chat.Formatter.TWDS_backup_formatResponse = Chat.Formatter.TWDS_backup_formatResponse ||
    Chat.Formatter.formatResponse
  Chat.Formatter.formatResponse = TWDS.chat.formatResponse
}

TWDS.registerStartFunc(function () {
  TWDS.chat.init()
  TWDS.chat.init2()
  TWDS.chat.init3()
  TWDS.chat.init4()
  TWDS.chat.init5()
  let t=TWDS.q1("#ui_chat .tabs");
  if (t) {
    t.onclick=function() {
      t.parentNode.classList.toggle("TWDS_minchat");
    };
    t.classList.add("linklike");
  }
})

// vim: tabstop=2 shiftwidth=2 expandtab
