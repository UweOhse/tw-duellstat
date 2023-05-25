// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.quickusables = {}
TWDS.quickusables.sb = {}

TWDS.quickusables.openwrapper = function (eventdata) {
  return TWDS.quickusables.open(eventdata)
}

TWDS.quickusables.usables = null
TWDS.quickusables.catnames = {
  energy: TWDS._('QUICKUSABLES_ENERGY', 'Energy'),
  health: TWDS._('QUICKUSABLES_HEALTH', 'Health'),
  workmotivation: TWDS._('QUICKUSABLES_WMOT', 'Work motivation'),
  duelmotivation: TWDS._('QUICKUSABLES_DMOT', 'Duel motivation'),
  drop: TWDS._('QUICKUSABLES_DROP', 'Drop chance'),
  experience: TWDS._('QUICKUSABLES_XP', 'Experience'),
  luck: TWDS._('QUICKUSABLES_LUCK', 'Luck'),
  money: TWDS._('QUICKUSABLES_MONEY', 'Money'),
  duel: TWDS._('QUICKUSABLES_DUEL', 'Duel'),
  fortbattle: TWDS._('QUICKUSABLES_FB', 'Fort battle'),
  multiplayer: TWDS._('QUICKUSABLES_MPI', 'Multiplayer'),
  movement: TWDS._('QUICKUSABLES_MOVEMENT', 'Movement'),
  openunpack: TWDS._('QUICKUSABLES_OPENUNPACK', 'Open/unpack'),
  laborpoints: TWDS._('QUICKUSABLES_LP', 'Labor points')
}
TWDS.quickusables.getcatdesc = function (cat) {
  if (cat in TWDS.quickusables.catnames) { return TWDS.quickusables.catnames[cat] }
  return cat
}
TWDS.quickusables.hascat = function (cat) {
  return (cat in TWDS.quickusables.catnames)
}
TWDS.quickusables.getcategories = function () {
  if (TWDS.quickusables.usables === null) {
    TWDS.quickusables.initusables()
  }
  const out = []
  for (const i of Object.keys(TWDS.quickusables.usables)) {
    if (i.match(/_x$/)) continue
    out.push(i)
  }
  return out
}
TWDS.quickusables.initusables = function () {
  TWDS.quickusables.usables = {
    energy: [],
    health: [],
    workmotivation: [],
    duelmotivation: [],
    drop: [],
    experience: [],
    money: [],
    luck: [],
    duel: [],
    fortbattle: [],
    laborpoints: [],
    multiplayer: [],
    openunpack: [],
    movement: []
  }
  const clean = function (str) {
    str = str.replace(/([0-9]+)-([0-9]+)/, '')
    str = str.replace(/([0-9]+)/, '')
    str = str.replace('+', '')
    return str.replace(/%/, '')
  }
  const doit = function (id, key, idx) {
    const it = ItemManager.getByBaseId(id)
    try {
      TWDS.quickusables.usables[key].push(clean(it.usebonus[idx || 0]))
    } catch (e) {
    }
  }
  doit(1943, 'energy')
  doit(1974, 'health')
  doit(1891, 'workmotivation')
  doit(1882, 'duelmotivation')
  doit(2465, 'luck')
  doit(2466, 'drop')
  doit(2467, 'experience')
  doit(2468, 'money')
  doit(2741, 'multiplayer', 1)
  doit(2741, 'multiplayer', 2)
  doit(1926, 'movement')
  doit(1927, 'movement')
  doit(1940, 'laborpoints')
  doit(1946, 'health', 1)
  doit(1901, 'duel')
  doit(1863, 'duel', 0)
  doit(1863, 'duel', 1)
  doit(1864, 'duel', 0)
  doit(1864, 'duel', 1)
  doit(1871, 'duel', 1)
  doit(1872, 'duel', 1)
  doit(51125, 'duel', 0)
  doit(51125, 'duel', 1)
  doit(2741, 'fortbattle', 0)
  doit(1873, 'fortbattle', 1) // gemüsetasche, leiten
  doit(1946, 'fortbattle', 0) // amulett, ausweichen
  doit(1946, 'fortbattle', 1) // amulett, lp
  doit(2525, 'fortbattle', 1) // zaubertinte, fallen stellen
  doit(2525, 'fortbattle', 2) // zaubertinte, verstecken
  doit(51775, 'openunpack', 0) // Motivationsbox, "Etwas zum Auspacken".
  doit(51595, 'openunpack', 0) // Metallschädel,  "Enthält eine der folgenden Sammelkarten"
}
TWDS.quickusables.match = function (item, cat) {
  if (TWDS.quickusables.usables === null) {
    TWDS.quickusables.initusables()
  }
  if (!('usetype' in item)) return false
  if (item.usetype === 'none') return false
  const ub = item.usebonus
  const searchstrings = TWDS.quickusables.usables[cat]
  if (searchstrings === undefined) { // no known cat
    return false
  }
  let found = false
  for (let i = 0; i < ub.length; i++) {
    const b = ub[i]
    for (let j = 0; j < searchstrings.length; j++) {
      if (b.search(searchstrings[j]) !== -1) {
        found = true
        break
      }
    }
  }
  if (!found) return false
  if ((cat + '_x') in TWDS.quickusables.usables) {
    const exclusions = TWDS.quickusables.usables[cat + '_x']
    for (let k = 0; k < ub.length; k++) {
      for (let x = 0; x < exclusions.length; x++) {
        if (ub[k].toLocaleLowerCase().search(exclusions[x].toLocaleLowerCase()) !== -1) {
          return false
        }
      }
    }
  }
  return true
}
TWDS.quickusables.showusables = function (choice) {
  console.log('C', choice)
  Inventory.open() // TWIR needs that if the inventory hasn't been opened
  if (TWDS.quickusables.usables === null) {
    TWDS.quickusables.initusables()
  }
  if (!(choice in TWDS.quickusables.usables)) {
    console.log('choice', choice, 'not in', TWDS.quickusables.usables)
    return
  }
  const translatedchoices = TWDS.quickusables.usables[choice]
  if (translatedchoices.length === 0) {
    console.log('choice', choice, 'has empty translation', TWDS.quickusables.usables)
    return
  }

  const filtered = []
  for (let j = 0; j < translatedchoices.length; j++) {
    const found = Bag.search(translatedchoices[j])
    for (let i = 0; i < found.length; i++) {
      if ('usetype' in found[i].obj && found[i].obj.usetype !== 'none') {
        console.log('SEARCH', j, translatedchoices[j], 'FOUND', found[i])
        let exclude = false
        if ((choice + '_x') in TWDS.quickusables.usables) {
          const ub = found[i].obj.usebonus
          const exclusions = TWDS.quickusables.usables[choice + '_x']
          console.log('XX', exclusions)
          for (let k = 0; k < ub.length; k++) {
            for (let x = 0; x < exclusions.length; x++) {
              if (ub[k].toLocaleLowerCase().search(exclusions[x].toLocaleLowerCase()) !== -1) {
                console.log('SEARCH', j, translatedchoices[j], 'EXCLUSE', found[i])
                exclude = true
              }
            }
          }
        }
        if (!exclude) {
          filtered.push(found[i])
        }
      }
    }
  }
  Inventory.open()
  Inventory.showSearchResult(filtered)
}
TWDS.quickusables.open = function (eventdata) {
  console.log('quickusables.open')
  const sb = (new west.gui.Selectbox(true))
    .setHeight('347px')
    .addListener(function (choice) {
      TWDS.quickusables.showusables(choice)
    })
  sb.addClass('TWDS_quickusableshelper')
  sb.addItem('energy', TWDS._('QUICKUSABLES_ENERGY', 'Energy'))
  sb.addItem('health', TWDS._('QUICKUSABLES_HEALTH', 'Health'))
  sb.addItem('workmotivation', TWDS._('QUICKUSABLES_WMOT', 'Work motivation'))
  sb.addItem('duelmotivation', TWDS._('QUICKUSABLES_DMOT', 'Duel motivation'))

  const x = [
    ['drop', TWDS._('QUICKUSABLES_DROP', 'Drop chance')],
    ['experience', TWDS._('QUICKUSABLES_XP', 'Experience')],
    ['luck', TWDS._('QUICKUSABLES_LUCK', 'Luck')],
    ['luck', TWDS._('QUICKUSABLES_MONEY', 'Money')],
    ['duel', TWDS._('QUICKUSABLES_DUEL', 'Duel')],
    ['fortbattle', TWDS._('QUICKUSABLES_FB', 'Fort battle')],
    ['multiplayer', TWDS._('QUICKUSABLES_MPI', 'Multiplayer')],
    ['movement', TWDS._('QUICKUSABLES_MOVEMENT', 'Movement')],
    ['laborpoints', TWDS._('QUICKUSABLES_LP', 'Labor points')]
  ]
  x.sort(function (a, b) {
    return a[1].toLocaleLowerCase().localeCompare(b[1].toLocaleLowerCase())
  })
  for (let i = 0; i < x.length; i++) {
    sb.addItem(x[i][0], x[i][1])
  }
  sb.show(eventdata)
}

TWDS.quickusables.settingchanged = function (v) {
  const bar = TWDS.q1('#ui_character_container .energy_bar')
  if (!bar) return
  if (v) {
    bar.addEventListener('click', TWDS.quickusables.openwrapper)
    bar.classList.add('TWDS_clickable')
  } else {
    bar.removeEventListener('click', TWDS.quickusables.openwrapper)
    bar.classList.remove('TWDS_clickable')
  }
}
TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'quickusables',
    TWDS._('QUICKUSABLES_SETTING',
      'A click on the energy bar opens a buff selection.'),
    true, TWDS.quickusables.settingchanged, 'misc', null)
})
