// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.quickusables = {}
TWDS.quickusables.sb = {}

TWDS.quickusables.openwrapper = function (eventdata) {
  return TWDS.quickusables.open(eventdata)
}

TWDS.quickusables.usables = null
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
    dueldamage: [],
    fortbattledamage: [],
    multiplayer: [],
    waytime: [],
    speed: [],
    laborpoints: []
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
  doit(2741, 'fortbattledamage', 0)
  doit(2741, 'multiplayer', 1)
  doit(2741, 'multiplayer', 2)
  doit(1901, 'dueldamage')
  doit(1926, 'waytime')
  doit(1927, 'speed')
  doit(1940, 'laborpoints')
  doit(1946, 'health', 1)
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
        filtered.push(found[i])
      }
    }
  }
  Inventory.open()
  Inventory.showSearchResult(filtered)
}
TWDS.quickusables.open = function (eventdata) {
  console.log('quickusables.open')
  const sb = (new west.gui.Selectbox(true)).addListener(function (choice) {
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
    ['dueldamage', TWDS._('QUICKUSABLES_DUELDAMAGE', 'Duel damage')],
    ['fortbattledamage', TWDS._('QUICKUSABLES_FBDAMAGE', 'Fort battle damage')],
    ['multiplayer', TWDS._('QUICKUSABLES_MPI', 'Multiplayer')],
    ['waytime', TWDS._('QUICKUSABLES_WAYTIME', 'Waytime shortening')],
    ['speed', TWDS._('QUICKUSABLES_SPEED', 'Speed')],
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
