// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.alliances = {}
TWDS.alliances.id2name = {}
TWDS.alliances.townid2allianceid = {}
TWDS.alliances.ready = false

TWDS.alliances.getdata = function () {
  Ajax.get('map', 'get_minimap', {}, function (json) {
    // console.log("MM",json);
    if (json.error) {
      return new UserMessage(json.msg).show()
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
      if (i > todo.length) {
        TWDS.alliances.ready = true
        return
      }
      const id = todo[i]
      Ajax.remoteCallMode('alliance', 'get_data', {
        alliance_id: id
      }, function (r) {
        if (r.error === false && r.data && r.data.allianceName) {
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
TWDS.alliances.startfunc = function () {
  TWDS.alliances.getdata()
}

TWDS.registerStartFunc(TWDS.alliances.startfunc)

// vim: tabstop=2 shiftwidth=2 expandtab
