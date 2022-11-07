// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.sleep = {}
TWDS.sleep.sb = {}
// taken from clothcalc, there
TWDS.sleep.getLastPosition = function () {
  const pos = {
    x: Character.position.x,
    y: Character.position.y
  }
  const q = TaskQueue.queue
  for (let n = 0; n < q.length; n++) {
    const r = q[n].wayData
    if (r.x) {
      pos.x = r.x
      pos.y = r.y
    }
  }
  return pos
}

TWDS.sleep.openwrapper = function (eventdata) {
  return TWDS.sleep.open(eventdata)
}
TWDS.sleep.open = function (eventdata) {
  console.log('sleep.open', eventdata)
  const translatehotelroom = ['', 'cubby', 'bedroom', 'hotel_room', 'apartment', 'luxurious_apartment']

  let cache = window.localStorage.getItem('TWDS_sleep_cache')
  let ts = 0
  if (cache !== null) {
    try {
      cache = JSON.parse(cache)
      ts = cache.timestamp
    } catch (e) {
      cache = null
    }
  }
  if (cache === null) {
    cache = {
      towns: {},
      forts: {}
    }
  }
  const now = (new Date()).getTime() * 1000
  let needexpire = false
  if (now - ts >= 86400 * 1000) {
    needexpire = true
  }
  TWDS.sleep.cache = cache

  Ajax.get('map', 'get_minimap', {}, function (json) {
    if (json.error) {
      return new UserMessage(json.msg).show()
    }
    const forts = []
    const towns = []

    for (const xi of Object.keys(json.forts)) {
      const x = parseInt(xi)
      if (x > 0) {
        for (const yi of Object.keys(json.forts[xi])) {
          const y = parseInt(yi)
          if (y > 0) {
            const loc = json.forts[xi][yi]
            if (typeof loc !== 'object') {
              continue
            }
            if (needexpire) {
              const id = loc.fort.fort_id
              if (id in cache.forts) {
                if (cache.forts[id] !== loc.fort.level * 2 + 2) {
                  // 0=small=max. barrack level 2
                  // 1=medium=max. barrack level 4
                  // 2=medium=max. barrack level 6
                  // if the level in the cache is smaller we remove the record, as someone may have build it further.
                  delete cache.forts[id]
                }
              }
            }
            if (Map.Helper.isForeignFort(loc.fort, loc.townIds, json.towns)) {
              continue
            }
            if (Map.Helper.isAllianceFort(loc.fort, loc.townIds, json.towns)) {
              forts.push(loc.fort)
            } else if (Map.Helper.isOwnFort(loc.fort, loc.townIds, json.towns)) {
              forts.push(loc.fort)
            } else {
              console.log('fort', loc.fort, 'with towns', loc.townIds, 'in the void')
            }
          }
        }
      }
    }
    const mypos = TWDS.sleep.getLastPosition()

    for (const i of Object.keys(json.towns)) {
      if (needexpire) {
        if (i in cache.towns && cache.towns[i] !== 5) {
          delete cache.towns[i]
        }
      }
      if (json.towns[i].member_count > 0) {
        json.towns[i]._twds_waytime = Map.calcWayTime(json.towns[i], mypos)
        towns.push(json.towns[i])
      }
    }
    for (let i = 0; i < forts.length; i++) {
      forts[i]._twds_waytime = Map.calcWayTime(forts[i], mypos)
    }
    forts.sort(function (a, b) {
      if (a._twds_waytime < b._twds_waytime) return -1
      if (a._twds_waytime > b._twds_waytime) return 1
      return 0
    })

    towns.sort(function (a, b) {
      if (a._twds_waytime < b._twds_waytime) return -1
      if (a._twds_waytime > b._twds_waytime) return 1
      return 0
    })

    const sb = (new west.gui.Selectbox(true)).addListener(function (e) {
      const fort = e.match(/^fort-(\d+)-(\d+)-(\d+)/)
      if (fort !== null) {
        window.TaskQueue.add(new window.TaskFortSleep(fort[1], fort[2], fort[3]))
        return
      }
      const town = e.match(/^town-(\d+)-(\d+)/)
      if (town !== null) {
        console.log('sleep in hotel ', town[2])
        window.TaskQueue.add(new window.TaskSleep(town[1], translatehotelroom[town[2]]))
      }
    })
    sb.addClass('TWDS_sleephelper')
    TWDS.sleep.sb = sb
    const addit = function (sel, wt, place, building, stars) {
      const s = "<span class='stars" + stars + "'>" + '******'.substring(0, stars) + '</span>'
      sb.addItem(sel, wt.formatDuration() + ' ' + place + ' ' + building + s)
    }
    const todos = []
    if (Character.homeTown.town_id) {
      todos.push({
        town_id: Character.homeTown.town_id,
        name: 'Hometown',
        waytime: Map.calcWayTime(Character.homeTown, mypos)
      })
    }
    for (let i = 0; i < forts.length; i++) {
      todos.push({
        fort_id: forts[i].fort_id,
        x: forts[i].x,
        y: forts[i].y,
        name: forts[i].name,
        waytime: forts[i]._twds_waytime
      })
    }
    if (Character.homeTown.town_id > 0 || Character.homeTown.town_id === 0) {
      for (let i = 0; i < 5; i++) {
        todos.push({
          town_id: towns[i].town_id,
          name: towns[i].name,
          waytime: towns[i]._twds_waytime
        })
      }
    }

    // the following uses a cache for barrack / hotel levels.

    for (let i = 0; i < todos.length; i++) {
      const todo = todos[i]
      todo.done = false
      if (todo.town_id) {
        if (todo.town_id in cache.towns) {
          todo.done = true
        }
      }
      if (todo.fort_id) {
        if (todo.fort_id in cache.forts) {
          todo.done = true
        }
      }
    }
    let todoidx = 0
    let hotellevelreached = 0
    const handletodos = function () {
      if (todoidx >= todos.length) {
        cache.timestamp = (new Date()).getTime() * 1000
        window.localStorage.setItem('TWDS_sleep_cache', JSON.stringify(cache))
        sb.show(eventdata)
        return
      }
      const todo = todos[todoidx]
      todoidx++
      if (todo.done) {
        if (todo.town_id) {
          const lv = cache.towns[todo.town_id]
          if (lv > hotellevelreached) {
            addit('town-' + todo.town_id + '-' + lv,
              todo.waytime,
              todo.name,
              'Hotel', lv)
            hotellevelreached = lv
          }
        }
        if (todo.fort_id) {
          const lv = cache.forts[todo.fort_id]
          addit('fort-' + todo.fort_id + '-' + todo.x + '-' + todo.y,
            todo.waytime,
            todo.name,
            'Barrack', lv)
        }
        handletodos() // recursion. Urks.
        return
      }
      // so we don't have the data in the cache. get it.
      if (todo.town_id) {
        if (hotellevelreached < 5) {
          Ajax.remoteCallMode('building_hotel', 'get_data', {
            town_id: todo.town_id
          }, function (data) {
            if (data.error) return (new UserMessage(data.msg)).show()
            const lv = data.hotel_level
            cache.towns[todo.town_id] = lv
            if (lv > hotellevelreached) {
              addit('town-' + todo.town_id + '-' + lv,
                todo.waytime,
                todo.name,
                'Hotel', lv)
              hotellevelreached = lv
            }
            handletodos() // recursion. Urks.
          })
        } else {
          handletodos() // recursion. Urks.
        }
      }
      if (todo.fort_id) {
        Ajax.remoteCallMode('fort_building_barracks', 'index', {
          fort_id: todo.fort_id
        }, function (data) {
          if (data.error) {
            (new UserMessage(data.error)).show()
            return
          }
          if ('barrackStage' in data) {
            cache.forts[todo.fort_id] = data.barrackStage
            addit('fort-' + todo.fort_id + '-' + todo.x + '-' + todo.y,
              todo.waytime,
              todo.name,
              'Barrack', data.barrackStage)
          }
          handletodos() // recursion. Urks.
        })
      }
    }
    if (todos.length) {
      handletodos()
    }
  })
}
TWDS.sleep.settingchanged = function (v) {
  const bar = TWDS.q1('#ui_character_container .health_bar')
  if (!bar) return
  if (v) {
    bar.addEventListener('click', TWDS.sleep.openwrapper)
    bar.classList.add('TWDS_clickable')
  } else {
    bar.removeEventListener('click', TWDS.sleep.openwrapper)
    bar.classList.remove('TWDS_clickable')
  }
}
TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'sleephelper',
    TWDS._('SLEEP_SETTING',
      'Allow to select a hotel or barrack to sleep by clicking on the health point bar.'),
    true, TWDS.sleep.settingchanged, 'misc', null)
})
