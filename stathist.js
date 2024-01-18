// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.stathist = {}
TWDS.stathist.getdatestring = function () {
  const t = new Date()
  const y = t.getFullYear()
  let m = t.getMonth() + 1
  if (m < 10) m = '0' + m
  let d = t.getDate()
  if (d < 10) d = '0' + d
  return y + '-' + m + '-' + d
}

TWDS.stathist.decompress = function (input, cb) {
  (async function (input, cb) {
    const b64decode = function (str) {
      const binarystring = window.atob(str)
      const len = binarystring.length
      const bytes = new Uint8Array(new ArrayBuffer(len))
      for (let i = 0; i < len; i++) {
        bytes[i] = binarystring.charCodeAt(i)
      }
      return bytes
    }
    const stream = new Blob([b64decode(input)], {
      type: 'application/json'
    }).stream()
    const ds = stream.pipeThrough(
      new window.DecompressionStream('gzip')
    )
    const resp = await new window.Response(ds)
    const blob = await resp.blob()
    blob.text().then(cb)
  })(input, cb)
}
TWDS.stathist.compress = function (input, cb) {
  (async function (input, cb) {
    const stream = new Blob([input]).stream()
    const cs = stream.pipeThrough(
      new window.CompressionStream('gzip')
    )
    const resp = await new window.Response(cs)
    const blob = await resp.blob()
    const ab = await blob.arrayBuffer()
    const b64 = window.btoa(
      String.fromCharCode(
        ...new Uint8Array(ab)
      )
    )
    cb(b64)
  })(input, cb)
}

TWDS.stathist.load = function (cb) {
  const basetemplate = '{"ts":0,"list":[]}'
  try {
    if ('TWDS_stathist_compressed' in window.localStorage) {
      TWDS.stathist.decompress(window.localStorage.TWDS_stathist_compressed, function (d) {
        // d is decompressed data
        const js = JSON.parse(d)
        console.log('load', 'mainpath', js)
        cb(js)
      })
    } else {
      const js = JSON.parse(basetemplate)
      console.log('load', 'else', js)
      cb(js)
    }
  } catch (e) {
    console.log('exception during stathist load', e)
    const js = JSON.parse(basetemplate)
    cb(js)
  }
}
TWDS.stathist.save = function (data) {
  const str = JSON.stringify(data)
  TWDS.stathist.compress(str, function (c) {
    window.localStorage.TWDS_stathist_compressed = c
  })
}

TWDS.stathist.ranklist = [
  { tab: 'experience', values: { counter: 'xp_rank', experience: 'xp_number' } },
  { tab: 'duels', values: { counter: 'duel_rank', duel_loss: 'duel_loss', duel_win: 'duel_win', experience: 'duel_xp' } },
  {
    tab: 'forts',
    values: { counter: 'fort_rank', damage_dealt: 'fort_dmg_dealt', dodges: 'fort_dodges', hits_taken: 'fort_hits_taken', score: 'fort_score' }
  },
  {
    tab: 'craft',
    values: { counter: 'craft_rank', learnt_recipes: 'craft_learnt_recipes', profession_skill: 'craft_skill', score: 'craft_diversity', items_created: 'craft_items' }
  },
  {
    tab: 'build',
    values: { counter: 'build_rank', fair_points: 'build_fair', stage_ups: 'build_stages', total_cp: 'build_total' }
  },
  {
    tab: 'mpi',
    values: {
      counter: 'mpi_rank',
      knockouts: 'mpi_knockouts',
      total_actions: 'mpi_actions',
      games_played: 'mpi_games',
      friendly_dmg: 'mpi_friendlyfire',
      rage_quits: 'mpi_rage_quits'
    }
  },
  {
    tab: 'achieve',
    values: { counter: 'achieve_rank', achievements: 'achieve_total', worlds_first: 'achieve_firsts', points: 'achieve_points' }
  }
]
TWDS.stathist.dorank = function (loaded, ts, work, idx) {
  const cfg = TWDS.stathist.ranklist[idx]
  // console.log("DORANK",idx);

  Ajax.remoteCallMode('ranking', 'get_data', {
    page: 0,
    tab: cfg.tab
  }, function (json) {
    if (json.error) {
      TWDS.error('stathist', 'failed to get ranking with mode', cfg.tab)
      return
    }
    console.log('looking for', Character.playerId, 'in', json.ranking)
    for (let i = 0; i < json.ranking.length; i++) {
      const d = json.ranking[i]
      // console.log("try",i,d,d.player_id, Character.playerId, d.player_id===Character.playerId);
      if (d.player_id === Character.playerId) {
        for (const [from, to] of Object.entries(cfg.values)) {
          const v = d[from]
          work[to] = v
        }
        idx++
        if (idx >= TWDS.stathist.ranklist.length) {
          loaded.list.push(work)
          loaded.ts = ts
          TWDS.stathist.save(loaded)
          return
        }
        TWDS.stathist.dorank(loaded, ts, work, idx)
        return
      }
    }
    TWDS.error('stathist', 'failed to find me in ranking with mode', cfg.tab)
  })
}
TWDS.stathist.update = function () {
  TWDS.stathist.load(function (loaded) {
    const s = TWDS.stathist.getdatestring()
    console.log('loaded', loaded, s)
    if (loaded.ts === s) {
      console.log('already have', s)
      return // we already have this day.
    }

    const d = {
      level: Character.level,
      duelLevel: Character.duelLevel,
      money: Character.deposit + Character.money,
      professionSkill: Character.professionSkill,
      upb: Character.upb,
      lastDied: Character.lastDied,
      experience: Character.experience,
      ts: s
    }
    TWDS.stathist.dorank(loaded, s, d, 0)
  })
}
TWDS.stathist.kv = [
  { key: 'ts', head: '', name: 'Date', headkey: '' },
  { key: 'level', head: 'General', name: 'Level', headkey: 'general' },
  { key: 'money', head: 'General', name: 'Money', headkey: 'general', format: 'money' },
  { key: 'upb', head: 'General', name: 'Bonds', headkey: 'general' },
  { key: 'xp_rank', head: 'XP', name: 'Rank', headkey: 'xp' },
  { key: 'xp_number', head: 'XP', name: 'points', headkey: 'xp', format: 'number' },
  { key: 'duel_rank', head: 'Duels', name: 'Rank', headkey: 'duel' },
  { key: 'duel_xp', head: 'Duels', name: 'XP', headkey: 'duel', format: 'number' },
  { key: 'duel_win', head: 'Duels', name: 'Won', headkey: 'duel' },
  { key: 'duel_loss', head: 'Duels', name: 'Lost', headkey: 'duel' },
  { key: 'fort_rank', head: 'Fort Battles', name: 'Rank', headkey: 'fort' },
  { key: 'fort_score', head: 'Fort Battles', name: 'Score', headkey: 'fort' },
  { key: 'fort_dmg_dealt', head: 'Fort Battles', name: 'DMG Dealt', headkey: 'fort', format: 'number' },
  { key: 'fort_dodges', head: 'Fort Battles', name: 'Dodged', headkey: 'fort' },
  { key: 'fort_hits_taken', head: 'Fort Battles', name: 'Hits taken', headkey: 'fort' },
  { key: 'craft_rank', head: 'Crafting', name: 'Rank', headkey: 'craft' },
  { key: 'craft_learnt_recipes', head: 'Crafting', name: 'Recipes', headkey: 'craft' },
  { key: 'craft_skill', head: 'Crafting', name: 'Skill', headkey: 'craft' },
  { key: 'craft_diversity', head: 'Crafting', name: 'Diversity', headkey: 'craft' },
  { key: 'craft_items', head: 'Crafting', name: 'Items', headkey: 'craft' },
  { key: 'build_rank', head: 'Construction', name: 'Rank', headkey: 'build' },
  { key: 'build_total', head: 'Construction', name: 'Points', headkey: 'build' },
  { key: 'build_fair', head: 'Construction', name: 'Fair', headkey: 'build' },
  { key: 'build_stages', head: 'Construction', name: 'Level Ups', headkey: 'build' },
  { key: 'mpi_rank', head: 'Adventures', name: 'Rank', headkey: 'mpi' },
  { key: 'mpi_knockouts', head: 'Adventures', name: 'KOs', headkey: 'mpi' },
  { key: 'mpi_actions', head: 'Adventures', name: 'Actions', headkey: 'mpi' },
  { key: 'mpi_games', head: 'Adventures', name: 'Games', headkey: 'mpi' },
  { key: 'mpi_friendlyfire', head: 'Adventures', name: 'Frn Fire', headkey: 'mpi' },
  { key: 'mpi_rage_quits', head: 'Adventures', name: 'Ragequits', headkey: 'mpi' },
  { key: 'achieve_rank', head: 'Achievements', name: 'Rank', headkey: 'achieve' },
  { key: 'achieve_total', head: 'Achievements', name: 'Total', headkey: 'achieve' },
  { key: 'achieve_firsts', head: 'Achievements', name: 'First', headkey: 'achieve' },
  { key: 'achieve_points', head: 'Achievements', name: 'Points', headkey: 'achieve' }
]

TWDS.stathist.filter = function (tab, shown) {
  const tbody = TWDS.q1('tbody', tab)
  const head1 = TWDS.q1('thead tr.head1', tab)
  const head2 = TWDS.q1('thead tr.head2', tab)

  TWDS.q('th', head1).forEach(function (ele) {
    ele.classList.add('hidden')
    ele.colSpan = 0
    ele.removeAttribute('colSpan')
  })

  let cols = TWDS.q('th', head2)
  for (let i = 0; i < cols.length; i++) {
    const key = cols[i].dataset.key
    const groupkey = cols[i].dataset.groupkey
    if (shown.includes(key)) {
      const g = TWDS.q1('.grp_' + groupkey, head1)
      //      console.log("H2",i,"G",g,"in",g.colSpan);
      if (g.classList.contains('hidden')) {
        g.classList.remove('hidden')
      } else {
        g.colSpan += 1
      }
      //      console.log("H2",i,"G",g,"after",g.colSpan);
      cols[i].classList.remove('hidden')
    } else {
      cols[i].classList.add('hidden')
    }
  }
  const rows = TWDS.q('tr', tbody)
  //  console.log("ROWS",rows);
  for (let j = 0; j < rows.length; j++) {
    const row = rows[j]
    cols = TWDS.q('td', row)
    for (let i = 0; i < cols.length; i++) {
      const key = cols[i].dataset.key
      if (shown.includes(key)) {
        cols[i].classList.remove('hidden')
      } else {
        cols[i].classList.add('hidden')
      }
    }
  }
}
TWDS.stathist.getcontent = function (data) {
  const div = TWDS.createEle('div')
  let lasthead = null

  let shown = localStorage.TWDS_stathist_fields
  if (shown) {
    shown = JSON.parse(shown)
  } else {
    shown = [
      ['ts', 'level', 'xp_rank', 'xp_number', 'duel_rank', 'craft_rank', 'duel_xp', 'fort_rank', 'fort_score', 'craft_skill', 'achieve_rank', 'build_rank', 'build_total', 'mpi_rank', 'achieve_total']
    ]
    localStorage.TWDS_stathist_fields = JSON.stringify(shown)
  }
  const changer = function () {
    if (this.checked) {
      shown.push(this.value)
    } else {
      for (let i = 0; i < shown.length; i++) {
        if (shown[i] === this.value) {
          shown.splice(i, 1)
        }
      }
    }
    localStorage.TWDS_stathist_fields = JSON.stringify(shown)
    TWDS.stathist.filter(tab, shown)
  }

  lasthead = null
  for (let i = 0; i < TWDS.stathist.kv.length; i++) {
    const e = TWDS.stathist.kv[i]
    if (e.head === '') continue
    if (e.head !== lasthead) {
      TWDS.createEle('b', {
        last: div,
        textContent: e.head + ': '
      })
      lasthead = e.head
    }
    TWDS.createEle('label', {
      last: div,
      children: [
        {
          nodeName: 'input',
          type: 'checkbox',
          value: e.key,
          checked: shown.includes(e.key),
          onchange: changer
        }, {
          nodeName: 'span',
          textContent: e.name + ' '
        }
      ]
    })
  }

  const tab = TWDS.createEle('table.stathist', { last: div })
  const thead = TWDS.createEle('thead', { last: tab })
  const tbody = TWDS.createEle('tbody', { last: tab })
  let tr
  tr = TWDS.createEle('tr.head1', { last: thead })
  let lastth = null
  lasthead = null
  for (let i = 0; i < TWDS.stathist.kv.length; i++) {
    const d = TWDS.stathist.kv[i]
    if (d.head === lasthead) {
      continue
    }
    lastth = TWDS.createEle('th', { last: tr, textContent: d.head })
    lastth.classList.add('grp_' + d.headkey)
    lastth.dataset.groupkey = d.headkey
    lasthead = d.head
  }
  tr = TWDS.createEle('tr.head2', { last: thead })
  lasthead = null
  for (let i = 0; i < TWDS.stathist.kv.length; i++) {
    const d = TWDS.stathist.kv[i]
    const t = TWDS.createEle('th', { last: tr, textContent: d.name })
    t.dataset.groupkey = d.headkey
    t.dataset.key = d.key
    if (d.head !== lasthead) {
      t.classList.add('newgroup')
      lasthead = d.head
    }
    t.classList.add('grp_' + d.headkey)
  }
  for (let j = data.list.length - 1; j >= 0; j--) {
    const e = data.list[j]
    tr = TWDS.createEle('tr', { last: tbody })
    lasthead = null
    for (let i = 0; i < TWDS.stathist.kv.length; i++) {
      const d = TWDS.stathist.kv[i]
      let v = e[d.key]
      if (d.format) {
        const fn = 'format_' + d.format
        v = window[fn](v)
      }
      const t = TWDS.createEle('td', { last: tr, textContent: v })
      t.dataset.key = d.key
      t.dataset.groupkey = d.headkey
      if (d.head !== lasthead) {
        t.classList.add('newgroup')
        lasthead = d.head
      }
    }
  }
  TWDS.stathist.filter(tab, shown)

  const len = window.localStorage.TWDS_stathist_compressed.length
  TWDS.createEle('p', {
    last: div,
    textContent: 'This needs ' + len + ' bytes of localStorage.'
  })

  return div
}
TWDS.stathist.openwindow = function () {
  TWDS.stathist.load(function (data) {
    const myname = 'TWDS_stathist_window'
    const win = wman.open(myname, TWDS._('STATHIST_TITLE', 'History'), 'TWDS_wide_window')
    win.setMiniTitle('History')
    const sp = new west.gui.Scrollpane()
    sp.appendContent(TWDS.stathist.getcontent(data))
    win.appendToContentPane(sp.getMainDiv())
  })
}

TWDS.registerStartFunc(function () {
  setTimeout(TWDS.stathist.update, 2 * 60 * 1000)
  TWDS.registerExtra('TWDS.stathist.openwindow', 'Statistics', 'A history of your ranking')
})
