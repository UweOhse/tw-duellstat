// vim: tabstop=2 shiftwidth=2 expandtab
if (TWDS.nextaction && TWDS.nextaction.start) {
  TWDS.nextaction.start(true)
}
TWDS.nextaction = {}
TWDS.nextaction.taskqueue = function () {
  if (!TaskQueue.queue.length) {
    return []
  }
  const e = TaskQueue.queue[TaskQueue.queue.length - 1]
  return [e.data.date_done / 1000.0, 'TaskQueue']
}
TWDS.nextaction.events = function () {
  const now = new Date().getTime() / 1000.0
  const wofs = west.wof.WofManager.wofs
  if ('easterwof' in wofs && 'mode' in wofs.easterwof && 'cooldowns' in wofs.easterwof.mode) {
    let next = 0
    let nexttitle = ''
    const all = []
    const m = wofs.easterwof.mode
    for (const t of Object.values(m.cooldowns)) {
      if (t.cdstamp && t.cdstamp > now) {
        all.push([t.cdstamp, wofs.easterwof.title + ' (' + m.opponentNames[t.enhance] + ')']) // 0, 25
        if (t.cdstamp < next || next === 0) {
          next = t.cdstamp
          nexttitle = wofs.easterwof.title + ' (' + m.opponentNames[t.enhance] + ')'
        }
      }
    }
    if (next) {
      return [next, nexttitle, all]
    }
  }
  return []
}
TWDS.nextaction.items = function () {
  const now = new Date().getTime() / 1000.0
  let min = -1
  let mintext = ''
  const all = []
  for (const [id, t] of Object.entries(Bag.itemCooldown)) {
    if (!Bag.getItemByItemId(id)) continue
    if (t > now) {
      if (min === -1 || t < min) {
        min = t
        mintext = ItemManager.get(id).name
      }
      all.push([t, ItemManager.get(id).name])
    }
  }
  if (min === -1) { return [] }
  return [min, mintext, all]
}
TWDS.nextaction.friendscache = null
TWDS.nextaction.friends = function () {
  if (TWDS.nextaction.friendscache) {
    return TWDS.nextaction.friendscache
  }
  const p = new Promise(function (resolve, reject) {
    Ajax.remoteCallMode('friendsbar', 'search', { search_type: 'friends' }, function (json) {
      if (json.error) {
        reject(json.msg)
      }
      const f = {}
      const q = json.players
      for (let i = 0; i < q.length; i++) {
        f[q[i].player_id] = q[i]
      }

      const a = json.eventActivations
      const now = new Date().getTime() / 1000.0
      let mintime = -1
      let minfr = -1
      const stamps = {}
      for (let i = 0; i < a.length; i++) {
        const e = a[i]
        const fr = e.friend_id
        if (!(fr in f)) {
          continue // not in friend list
        }

        const t = e.activation_time + 23 * 3600
        if (t > now) {
          if (mintime === -1 || mintime > t) {
            mintime = t
            minfr = fr
          }
          const ts = Math.ceil(t)
          if (!stamps[ts]) { stamps[ts] = [] }
          stamps[ts].push(f[fr].name)
        }
      }
      const all = []
      for (let [ts, names] of Object.entries(stamps)) {
        const n = names.length
        if (n > 5) {
          names = names.splice(0, 5)
          names.push(n + ' total')
        }
        all.push([ts, names.join(', ')])
      }
      if (minfr === -1) {
        TWDS.nextaction.friendscache = []
        resolve([])
        return
      }
      TWDS.nextaction.friendscache = [mintime, 'Friend ' + f[minfr].name, all]
      resolve(TWDS.nextaction.friendscache)
    })
  })
  return p
}
TWDS.nextaction.get = function (ele, tbody) {
  const a = ['taskqueue', 'friends', 'items', 'events']
  const plist = []
  for (let i = 0; i < a.length; i++) {
    const t = TWDS.nextaction[a[i]]()
    plist.push(t)
  }
  Promise.all(plist).then(function (d) {
    let min = -1
    let mintext = ''
    if (tbody) {
      // all results!
      const tmp = []
      for (let i = 0; i < d.length; i++) {
        const e = d[i]
        if (e[2]) {
          for (let j = 0; j < e[2].length; j++) {
            tmp.push(e[2][j])
          }
        } else {
          tmp.push(e)
        }
      }
      d = tmp
    }
    d.sort(function (a, b) {
      if (a.length === 0) return 1
      if (b.length === 0) return -1
      return a[0] - b[0]
    })
    for (let i = 0; i < d.length; i++) {
      const e = d[i]
      if (e.length === 0) continue
      if (min === -1 || e[0] < min) {
        min = e[0]
        mintext = e[1]
      }
      if (tbody) {
        const tr = TWDS.createEle('tr', { last: tbody })
        TWDS.createEle('td', {
          last: tr,
          textContent: new Date(parseInt(e[0]) * 1000).toDateTimeStringNice()
        })
        TWDS.createEle('td', {
          last: tr,
          textContent: e[1]
        })
      }
    }
    if (ele) {
      if (min > 86400) {
        ele.textContent = new Date(parseInt(min) * 1000).toDateTimeStringNice()
        ele.title = mintext
      } else {
        ele.textContent = ''
        ele.title = ''
      }
    }
  })
}
TWDS.nextaction.update = function (remove) {
  let ele = TWDS.q1('#ui_bottomright #TWDS_nextaction')
  if (ele) {
    ele.remove()
    ele = null
  }
  if (!TWDS.settings.taskqueue_nextaction) { return }
  if (!ele) {
    ele = TWDS.createEle('div.linklike', {
      last: TWDS.q1('#ui_bottomright'),
      id: 'TWDS_nextaction',
      textContent: 'text',
      onclick: function () {
        TWDS.nextaction.openwindow()
      }
    })
  }
  TWDS.nextaction.get(ele)
}
TWDS.nextaction.openwindow = function () {
  const win = wman.open('TWDS_nextaction_window', 'Nextaction')
  win.setMiniTitle('Next')

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_nextaction_container'
  })
  sp.appendContent(content)
  win.appendToContentPane(sp.getMainDiv())
  const table = TWDS.createEle('table.TWDS_simpleborder', { beforeend: content })
  const tbody = TWDS.createEle('tbody', { beforeend: table })
  TWDS.nextaction.get(null, tbody)
}
TWDS.nextaction.timeout = 0
TWDS.nextaction.queueupdate = function () {
  if (TWDS.nextaction.timeout) { window.clearTimeout(TWDS.nextaction.timeout) }
  TWDS.nextaction.timeout = window.setTimeout(TWDS.nextaction.update, 2000)
}
// ajaxComplete handler
TWDS.nextaction.ajaxcomplete = function (event, request, settings) {
  const url = settings.url
  if (url.includes('window=friendsbar')) {
    if (url.includes('action=event')) {
      TWDS.nextaction.friendscache = null // invalidate
      TWDS.nextaction.queueupdate()
    }
  }
}
TWDS.nextaction.start = function (remove) {
  TWDS.registerSetting('bool', 'taskqueue_nextaction',
    TWDS._('TASKQUEUE_NEXTACTION_SETTING', 'show, below the task queue, the time the next manual action is expected'), true, function (v) {
      TWDS.nextaction.update(!v)
    }, 'Task Queue', 'b', 1)
  let fn = 'listen'
  let fn2 = 'on'
  if (remove) {
    fn = 'unlisten'
    fn2 = 'off'
  }
  EventHandler[fn]('cooldown_changed', TWDS.nextaction.queueupdate)
  EventHandler[fn]('taskqueue-updated', TWDS.nextaction.queueupdate)
  EventHandler[fn]('taskqueue-task-adding', TWDS.nextaction.queueupdate)
  EventHandler[fn]('taskqueue-task-canceling', TWDS.nextaction.queueupdate)
  $(document)[fn2]('ajaxComplete', TWDS.nextaction.ajaxcomplete)
  setTimeout(TWDS.nextaction.queueupdate, 5000)
  console.log('nextaction started')
}
TWDS.registerStartFunc(TWDS.nextaction.start)
