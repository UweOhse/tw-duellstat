// vim: tabstop=2 shiftwidth=2 expandtab
//

TWDS.questlist = {}

TWDS.questlist.employerclick = function (that, ev) {
  window.QuestEmployerWindow.showEmployer(that.dataset.key, that.dataset.x, that.dataset.y)
}
TWDS.questlist.questclick = function (that, ev) {
  window.QuestEmployerWindow.showEmployer(that.dataset.key, that.dataset.x, that.dataset.y, that.dataset.questid)
}
TWDS.questlist.questgroupclick = function (that, ev) {
  window.QuestGroupWindow.open(parseInt(that.dataset.groupid), null)
}
TWDS.questlist.openwindow2 = function (all) {
  const updateone = function (dl, giver, employer) {
    TWDS.createEle({
      nodeName: 'dt',
      className: 'TWDS_questlist_employerlink',
      textContent: employer.name,
      beforeend: dl,
      title: employer.description,
      dataset: {
        key: employer.key,
        x: employer.x,
        y: employer.y
      }
    })
    const o = []
    for (let i = 0; i < employer.open.length; i++) {
      o.push(employer.open[i])
    }
    o.sort(function (a, b) {
      const x = a.groupTitle.localeCompare(b.groupTitle)
      if (x) return x
      return a.soloTitle.localeCompare(b.soloTitle)
    })
    for (let i = 0; i < o.length; i++) {
      const q = o[i]
      let cl = ''
      if (q.accepted) cl += ' accepted'
      if (q.acceptable) cl += ' acceptable'
      if (q.finishable) cl += ' finishable'
      console.log('OPEN', employer, q, cl)
      TWDS.createEle({
        nodeName: 'dd',
        beforeend: dl,
        className: cl,
        children: [
          {
            nodeName: 'span',
            className: 'TWDS_questlist_questlink' + cl,
            textContent: q.title,
            dataset: {
              key: employer.key,
              x: employer.x,
              y: employer.y,
              questid: q.id
            }
          }, {
            nodeName: 'span',
            textContent: ' ('
          }, {
            nodeName: 'span',
            className: 'TWDS_questlist_questgrouplink',
            textContent: TWDS._('QUESTLIST_VIEW_QUESTGROUP', 'View questgroup'),
            dataset: {
              key: employer.key,
              x: employer.x,
              y: employer.y,
              groupid: q.group,
              questid: q.id
            }
          }, {
            nodeName: 'span',
            textContent: ')'
          }
        ]
      })
    }
  }

  const updater = function (dl, all, idx) {
    const pw = TWDS.q1('.TWDS_questlist_please_wait')
    if (idx >= all.length) {
      if (pw) pw.remove()
      return
    }
    let giver = all[idx]
    while (!giver.visible) {
      idx++
      if (idx >= all.length) {
        if (pw) pw.remove()
        return
      }
      giver = all[idx]
    }
    Ajax.remoteCall('quest_employer', '', {
      employer: giver.key,
      x: giver.x,
      y: giver.y
    }, function (json) {
      if (json.error) return new UserMessage(json.error).show()
      if (json.employer.open.length) console.log('updateone', json)
      if (json.employer.open.length) updateone(dl, giver, json.employer)
      updater(content, all, idx + 1)
    })
  }

  const win = wman.open('TWDS_questlist_window', 'Quest giver list', 'TWDS_questlist_window')
  win.setMiniTitle('Questgivers')

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_questgivers_list'
  })
  TWDS.createEle('h2', { textContent: TWDS._('QUESTLIST_TITLE', 'Quests by employers'), beforeend: content })
  TWDS.createEle('p', {
    className: 'TWDS_questlist_please_wait',
    textContent: TWDS._('QUESTLIST_PLEASE_WAIT', 'Please wait'),
    beforeend: content
  })

  const dl = TWDS.createEle('dl', { beforeend: content })

  console.log('all1', all)
  all.sort(function (a, b) {
    if (a.x === undefined && b.x === undefined) {
      if (a.key === 'paper') return 1
      if (b.key === 'paper') return -1
      return a.name.localeCompare(b.name)
    }
    if (a.x === undefined) return -1
    if (b.x === undefined) return 1
    return a.name.localeCompare(b.name)
  })
  console.log('all2', all)
  updater(dl, all, 0)

  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}
TWDS.questlist.openwindow = function () {
  // minimap gives us quest locations
  Ajax.get('map', 'get_minimap', {}, function (json) {
    if (json.error) return new UserMessage(json.error).show()
    const qll = json.quest_locations
    const tiles = []
    for (const i in qll) {
      const ql = qll[i]
      if (!ql) continue
      if (!ql[0]) continue
      tiles.push([
        parseInt(ql[0][0] / Map.tileSize),
        parseInt(ql[0][1] / Map.tileSize)
      ])
    }
    Ajax.get('map', 'get_complete_data', {
      tiles: JSON.stringify(tiles)
    }, function (json) {
      if (json.error) return new UserMessage(json.error).show()
      const all = []

      const quests = json.quests
      for (const x in quests) {
        for (const y in quests[x]) {
          if ('employer' in quests[x][y][0][1]) {
            for (let i = 0; i < quests[x][y][0][1].employer.length; i++) {
              const e = quests[x][y][0][1].employer[i]
              const f = Object.assign({}, e)
              f.x = quests[x][y][0][1].x // real coords, not tiles
              f.y = quests[x][y][0][1].y
              all.push(f)
            }
          }
        }
      }

      Ajax.remoteCallMode('building_quest', '', {}, function (json) {
        if (json.error) return new UserMessage(json.error).show()
        for (let i = 0; i < json.questEmployer.length; i++) {
          const f = {
            key: json.questEmployer[i].key,
            name: json.questEmployer[i].name,
            visible: true,
            x: undefined,
            y: undefined,
            activate: null,
            deactivate: null
          }
          all.push(f)
          console.log('pushed', f, all.length)
        }
        TWDS.questlist.openwindow2(all)
      }, window.QuestWindow)
    })
  })
}

TWDS.registerStartFunc(function () {
  // wait 2.5 seconds to avoid a thundering herd.
  // setTimeout(TWDS.collections.load, 2500)
  TWDS.delegate(document.body, 'click', '.TWDS_questlist_employerlink', function (ev) {
    TWDS.questlist.employerclick(this, ev)
  })
  TWDS.delegate(document.body, 'click', '.TWDS_questlist_questlink', function (ev) {
    TWDS.questlist.questclick(this, ev)
  })
  TWDS.delegate(document.body, 'click', '.TWDS_questlist_questgrouplink', function (ev) {
    TWDS.questlist.questgroupclick(this, ev)
  })
})
