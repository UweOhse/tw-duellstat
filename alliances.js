// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.alliances = {}
TWDS.alliances.id2name = {}
TWDS.alliances.townid2allianceid = {}
TWDS.alliances.ready = false
TWDS.alliances.running = false

TWDS.alliances.getdataworker = function (resolve, reject) {
  Ajax.get('map', 'get_minimap', {}, function (json) {
    if (json.error) {
      reject(new Error(json.error))
      console.log('TWDS.alliances: ran into', json.error, 'during get_minimap')
      TWDS.alliances.running = false
      return new UserMessage(json.error).show()
    }
    const todo = []
    for (const t of Object.values(json.towns)) {
      if (t.member_count && !t.npctown) {
        const a = t.alliance_id || 0
        TWDS.alliances.townid2allianceid[t.town_id] = a
        if (a) {
          if (!TWDS.alliances.id2name[a]) {
            if (!todo.includes(a)) {
              todo.push(a)
            }
          }
        }
      }
    }
    let run = 0
    const doone = function (i) {
      if (i >= todo.length) {
        TWDS.alliances.ready = true
        TWDS.alliances.running = false
        resolve('loaded')
        return
      }
      const id = todo[i]
      Ajax.remoteCallMode('alliance', 'get_data', {
        alliance_id: id
      }, function (r) {
        if (r.error) {
          TWDS.alliances.running = false
          console.log('TWDS.alliances: ran into', json.error, 'during alliances get_data')
          reject(new Error(json.error))
          return new UserMessage(json.error).show()
        }
        if (r.data && r.data.allianceName) {
          TWDS.alliances.id2name[id] = r.data.allianceName
        }
        let delay = 250
        run++
        if ((run % 20) === 0) {
          delay += 1500
        }
        setTimeout(doone, delay, i + 1)
      })
    }
    doone(0)
  })
}
TWDS.alliances.getdata = function (resolve, reject) {
  if (TWDS.alliances.ready) {
    if (resolve) {
      resolve('its ready')
      return
    }
    return Promise.resolve('already loaded')
  }
  if (TWDS.alliances.running) {
    if (!resolve) {
      return new Promise(function (resolve, reject) {
        setTimeout(TWDS.alliances.getdata, 250, resolve, reject)
      })
    }
    setTimeout(TWDS.alliances.getdata, 250, resolve, reject)
    return
  }
  TWDS.alliances.running = true
  return new Promise(function (resolve, reject) {
    TWDS.alliances.getdataworker(resolve, reject)
  })
}

// vim: tabstop=2 shiftwidth=2 expandtab
