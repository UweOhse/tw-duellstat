// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.grouptele = {}

TWDS.grouptele.resolve = function (g, cb) {
  const norm = function (str) {
    const out = []
    const parts = str.split(';')
    for (let i = 0; i < parts.length; i++) {
      const t = parts[i].trim().toLocaleLowerCase()
      if (t > '') { out.push(t) }
    }
    return out
  }
  const alliances = norm(g.alliances)
  const towns = norm(g.towns)
  const exceptions = norm(g.exceptions)
  const players = norm(g.players)
  // unfortunately there is no ranking with town name and alliance name...
  Ajax.remoteCallMode(
    'ranking',
    'get_data', {
      page: 0,
      tab: 'forts',
      entries_per_page: 1000000
    }, function (fr) {
      if (fr.error) {
        return new UserMessage(fr.msg, UserMessage.TYPE_ERROR).show()
      }
      const r = fr.ranking
      const matches = []
      const why = []
      for (let i = 0; i < r.length; i++) {
        const p = r[i]
        if (p.alliance_id) {
          if (alliances.includes(p.alliance_name.toLocaleLowerCase())) {
            matches.push(p.player_id)
            why.push([p.player_id, p.name, TWDS._('GROUPTELE_REASON_ALLIANCE_NAME', 'alliance_name') + ' ' + p.alliance_name])
            continue
          }
          if (alliances.includes(p.alliance_id)) {
            matches.push(p.player_id)
            why.push([p.player_id, p.name, TWDS._('GROUPTELE_REASON_ALLIANCE_ID', 'alliance_id') + ' ' + p.alliance_id])
            continue
          }
        }
        if (players.includes(p.name.toLocaleLowerCase())) {
          matches.push(p.player_id)
          why.push([p.player_id, p.name, TWDS._('GROUPTELE_REASON_PLAYER_NAME', 'player_name') + ' ' + p.name])
          continue
        }
        if (players.includes(p.player_id)) {
          matches.push(p.player_id)
          why.push([p.player_id, p.name, TWDS._('GROUPTELE_REASON_PLAYER_NAME', 'player_id') + ' ' + p.player_id])
          continue
        }
      }
      Ajax.remoteCallMode(
        'ranking',
        'get_data', {
          page: 0,
          tab: 'experience',
          entries_per_page: 1000000
        }, function (xp) {
          if (xp.error) {
            return new UserMessage(xp.msg, UserMessage.TYPE_ERROR).show()
          }
          const r = xp.ranking
          const exceptids = []
          for (let i = 0; i < r.length; i++) {
            const p = r[i]
            if (exceptions.includes(p.player_id)) {
              exceptids.push(p.player_id)
            }
            if (exceptions.includes(p.name.toLocaleLowerCase())) {
              exceptids.push(p.player_id)
            }
            if (matches.includes(p.player_id)) continue // already in list
            if (p.town_id) {
              if (towns.includes(p.town_name.toLocaleLowerCase())) {
                matches.push(p.player_id)
                why.push([p.player_id, p.name, TWDS._('GROUPTELE_REASOH_TOWN_NAME', 'town_name') + ' ' + p.town_name])
                continue
              }
              if (towns.includes(p.town_id)) {
                matches.push(p.player_id)
                why.push([p.player_id, p.name, TWDS._('GROUPTELE_REASOH_TOWN_ID', 'town_id') + ' ' + p.town_id])
                continue
              }
            }
          }
          const out = []
          for (let i = 0; i < why.length; i++) {
            if (exceptids.includes(why[i][0])) continue
            out.push(why[i])
          }
          cb(out)
        })
    })
}

TWDS.grouptele.tabclick = function (win, id) {
  const container = TWDS.utils.getcontainer(win)
  container.innerHTML = ''
  const ig = function (text, cl, type, value) {
    const p = TWDS.createEle('p.inputgroup', { last: container })
    const lab = TWDS.createEle('label', {
      last: p,
      children: [
        { nodeName: 'span', textContent: text }
      ]
    })
    const inp = TWDS.createEle('input', {
      className: cl,
      last: lab,
      type: type,
      value: value
    })
    return inp
  }
  const getvalues = function () {
    const g = {}
    g.alliances = TWDS.q1('.inputgroup input.alliances', win.divMain).value.trim()
    g.towns = TWDS.q1('.inputgroup input.towns', win.divMain).value.trim()
    g.players = TWDS.q1('.inputgroup input.players', win.divMain).value.trim()
    g.exceptions = TWDS.q1('.inputgroup input.exceptions', win.divMain).value.trim()
    g.info = TWDS.q1('.inputgroup input.info', win.divMain).value.trim()
    return g
  }
  win.activateTab(id)
  const num = id.substring(9)// grouptele

  TWDS.createEle('span.help', {
    last: container,
    textContent: '?',
    title: TWDS._('GROUPTELE_HELP', 'Help'),
    onclick: function () {
      TWDS.utils.showhelp('grouptele')
    }
  })
  TWDS.createEle('h1', {
    last: container,
    textContent: TWDS._('GROUPTELE_TAB_H1', 'Group telegram #') + num
  })
  let g = {}

  if (id in TWDS.settings) {
    g = JSON.parse(TWDS.settings[id])
  }
  const infoinput = ig('Info', 'info', 'text', g.info || '')
  infoinput.title = TWDS._('GROUPTELE_INFO_TITLE', 'For your information / organization')

  const clearcheck = function () {
    table.textContent = ''
  }

  ig(TWDS._('GROUPTELE_ALLIANCES', 'Alliances'), 'alliances', 'text', g.alliances ?? '').onchange = clearcheck
  ig(TWDS._('GROUPTELE_TOWNS', 'Towns'), 'towns', 'text', g.towns ?? '').onchange = clearcheck
  ig(TWDS._('GROUPTELE_PLAYERS', 'Players'), 'players', 'text', g.players ?? '').onchange = clearcheck
  ig(TWDS._('GROUPTELE_EXCEPTIONS', 'Exceptions'), 'exceptions', 'text', g.exceptions ?? '').onchange = clearcheck
  const p = TWDS.createEle('p.inputgroup.functions', { last: container })

  let lab = TWDS.createEle('label', { last: p })
  TWDS.createEle('input.save', {
    last: lab,
    type: 'button',
    value: TWDS._('GROUPTELE_SAVE', 'Save'),
    onclick: function () {
      g = getvalues()
      console.log('g', g)
      TWDS.settings[id] = JSON.stringify(g)
      TWDS.saveSettings()
    }
  })

  lab = TWDS.createEle('label', { last: p })
  TWDS.createEle('input.check', {
    last: lab,
    type: 'button',
    value: TWDS._('GROUPTELE_CHECK', 'Check'),
    onclick: function () {
      g = getvalues()
      console.log('g', g)
      table.textContent = ''
      TWDS.grouptele.resolve(g, function (l) {
        l.sort(function (a, b) {
          return a[1].toLocaleLowerCase().localeCompare(b[1].toLocaleLowerCase())
        })
        const thead = TWDS.createEle('thead', { last: table })
        const tr = TWDS.createEle('tr', { last: thead })
        TWDS.createEle('th', { last: tr, textContent: '#' })
        TWDS.createEle('th', { last: tr, textContent: 'Name' })
        TWDS.createEle('th', { last: tr, textContent: 'Info' })
        const tbody = TWDS.createEle('tbody', { last: table })
        tbody.textContent = ''
        for (let i = 0; i < l.length; i++) {
          const tr = TWDS.createEle('tr', { last: tbody })
          TWDS.createEle('td', { last: tr, textContent: i + 1 })
          TWDS.createEle('th', { last: tr, textContent: l[i][1] })
          TWDS.createEle('td', { last: tr, textContent: l[i][2] })
        }
      })
    }
  })

  lab = TWDS.createEle('label', { last: p })
  TWDS.createEle('input.send', {
    last: lab,
    type: 'button',
    value: TWDS._('GROUPTELE_SEND', 'Send'),
    onclick: function () {
      g = getvalues()
      console.log('g', g)
      TWDS.grouptele.resolve(g, function (l) {
        l.sort(function (a, b) {
          return a[1].toLocaleLowerCase().localeCompare(b[1].toLocaleLowerCase())
        })
        let t = []
        for (let i = 0; i < l.length; i++) {
          t.push(l[i][1])
        }
        t = t.join(';')
        MessagesWindow.open('telegram', { insert_to: t })
        let n = 0
        const redcheckbox = function () {
          const gcb = TWDS.q1('.tw2gui_window.messages .groupcheckbox')
          n++
          if (!gcb) {
            if (n < 50) {
              setTimeout(redcheckbox, 100)
            }
            return
          }
          gcb.style.outline = '3px inset red'
        }
        redcheckbox()
      })
    }
  })

  TWDS.createEle('hr', { last: container })
  const table = TWDS.createEle('table', { last: container })
}
TWDS.grouptele.openwindow = function () {
  const win = TWDS.utils.stdwindow('TWDS_grouptele_window',
    TWDS._('GROUPTELE_WINDOW_TITLE', 'Group telegrams'),
    TWDS._('GROUPTELE_WINDOW_MINITITLE', 'Groupteles'))
  for (let i = 1; i <= 8; i++) {
    const key = 'grouptele' + i
    if (win.tabIds[key]) continue
    win.addTab('#' + i, key, TWDS.grouptele.tabclick)
  }
  const container = TWDS.utils.getcontainer(win)
  container.innerHTML = ''
  TWDS.q1('._tab_id_grouptele1', win.divMain).click()
  return win
}

TWDS.grouptele.start = function () {
  TWDS.registerExtra('TWDS.grouptele.openwindow',
    TWDS._('GROUPTELE_EXTRA', 'Group Telegrams'),
    TWDS._('GROUPTELE_EXTRA_HELP', 'Manage / send group telegrams')
  )
}
TWDS.registerStartFunc(TWDS.grouptele.start)

// vim: tabstop=2 shiftwidth=2 expandtab
