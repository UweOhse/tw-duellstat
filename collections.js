// vim: tabstop=2 shiftwidth=2 expandtab
//

TWDS.collections = {}
TWDS.collections.seen_items = {}
TWDS.collections.missing_items = {}
TWDS.collections.unfinished = {}
TWDS.collections.loaded = {}
TWDS.collections.missing_collectible_jobs = {}
TWDS.collections.getMissingList = function () {
  return TWDS.collections.missing_collectible_jobs
}

TWDS.collections.dropdata = {
  50206000: 0, // grüne handtasche @ quest geschäftsidee
  50511000: 158, // geldbeutelchen @ wells fargo
  50512000: 132, // modische handtasche @ pianist
  50513000: 155, // indianische handt. @ handelsbüro
  50514000: 0, // perlenhandt. @ shop
  50515000: 0, // uralter geldbeutel @ quest henry im urlaub
  50516000: 147, // reisehandtasche @ bühne
  50517000: 0, // seidenhandtasche @ shop

  50518000: 0, // starker whiskey @ quest einsamer cowboy
  50519000: 116, // fruchtcocktail @ alk. transportieren
  50520000: 154, // honiglikör @ alk. destillieren
  50521000: 0, // weißwein @ quest das große Footballspiel
  50522000: 136, // mex. tequila @ armdrücken
  50523000: 133, // premiumrum @ greenhorns
  50524000: 0, // tokaier @ quest seefahrer
  50525000: 0, // bester schwarzgebrannter @ shop

  50279000: 0, // henry draper med. @ quest weltraum
  50526000: 159, // ehrenmedialle der marine @ pinkerton
  50527000: 140, // ehrenmedialle der armee @ kugeln einschmelzen
  50528000: 139, // freiheitsmed. @ personenschützer
  50529000: 157, // gold. verdienstmed. @ expedition
  50530000: 0, // silbersternmed, @ quest knastbrüder
  50531000: 0, // anerkennungsmed. @ quest leg. gold. säbel
  50532000: 0, // taperkeit auf see. @ shop

  50353000: 0, // indianertrommel: quest erneuere den geist
  50533000: 153, // shipibo-rassel @ alligatoren
  50534000: 160, // ind. flöte @ westen erkunden
  50535000: 143, // okarina @ reservat
  50536000: 0, // sansula @ quest kopfloser pferdemann
  50537000: 141, // koshi-glocke @ großwild
  50538000: 131, // chajchas @ fallensteller
  50539000: 0, // regenstab @sop

  52651000: 184, // bisonschädel @ nickel
  52652000: 164, // maultierhirsch @ reporter
  52653000: 198, // wolf @ bullen jagen
  52654000: 173, // adlerschädel @ historiker
  52655000: 0, // schlangenschädel @ quest
  52656000: 205, // eidechsenschädel @ füchse
  52657000: 193, // biber @ archaeloge
  52658000: 172, // kaninchenschädel @ hasen jagen

  52659000: 169, // goldadlereier @ büro
  52660000: 201, // montezuma wachtel eier @ antilopen
  52661000: 204, // wanderfalkeneier @ gerichtsmediziner
  52662000: 183, // purpurschnäpper @ kisten
  52663000: 0, // hausfinkeneier quest
  52664000: 175, // amerikanische kräheneier @ rinder stehlen
  52665000: 197, // amer. flamingo @ lagerfeuer
  52666000: 171, // baltimore-Trupial-Eier @barbier

  52667000: 165, // Rotkehlchen @ bahnkarten-verkäufer
  52668000: 163, // Gartenspottdrossel @ karotten
  52669000: 186, // Waldenteneier @ pferdezüchter
  52670000: 176, // ara @ ahornsirup
  52671000: 0, // groß-tinamu-eier @ quest
  52672000: 170, // eichelspecht @ richter
  52673000: 182, // eistaucher @ pferde verkaufen
  52674000: 187, // steinkauz @ barkeeper

  53146000: 185, // yucca @ banditenanführer
  53147000: 168, // steppenläufer @ büchsenmacher
  53148000: 203, // bleistiftstrauch @ regentanz
  53149000: 188, // fackellilie @ tierarzt
  53150000: 0, // ocotillo @ quest
  53151000: 199, // steppenkerze @ goldgräber ausrauben
  53152000: 161, // feigenkaktus @ fallen stellen
  53153000: 174, // aloe vera @ arzt

  53154000: 200, // amerikanische Zittelpappel @ kartograph
  53155000: 167, // nadelbaum @ schneider
  53156000: 179, // blaufichte @ zugmechaniker
  53157000: 195, // rocky mountain wacholder @ eis schneiden
  53158000: 0, // weißrinden-kiefer @ quest
  53159000: 181, // drehkiefer @ lebensmittel stehlen
  53160000: 190, // felsentanne @ händler bestehelen
  53161000: 189, // westliche rotzeder @ imker
  53162000: 178, // opuntie @ bankier
  53163000: 191, // drachenfrucht @ pilze
  53164000: 192, // pracht-himbeeren @ tipi
  53165000: 180, // pawpaws @ koch
  53166000: 0, // schwarze maulbeeren @ quest
  53167000: 162, // weiße maulbeeren @ kräuter
  53168000: 177, // vogenbeeren @ anwalt
  53169000: 166 // papaya @ gemischtwaren
}

TWDS.collections.openwindow = function () {
  const win = wman.open('TWDS_collections_window', 'Collections', 'TWDS_collections_window')
  win.setMiniTitle('Collections')

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_collections_list'
  })
  TWDS.createEle('h2', { textContent: 'Collections', beforeend: content })
  const dl = TWDS.createEle('dl', { beforeend: content })
  console.log('unfinished', TWDS.collections.unfinished)

  for (const name of Object.keys(TWDS.collections.unfinished)) {
    const c = TWDS.collections.unfinished[name]
    TWDS.createEle('dt', { beforeend: dl, textContent: name })
    const dd = TWDS.createEle('dd', { beforeend: dl })
    for (let i = 0; i < c.length; i++) {
      const span = TWDS.createEle('span', { beforeend: dd })
      const itno = c[i]
      const it = ItemManager.get(itno)
      if (!it) continue
      const inside = new tw2widget.InventoryItem(it)
      span.appendChild(inside.getMainDiv()[0])
      const b = TWDS.createEle('b', { beforeend: span })
      if (it.auctionable) {
        const sl = TWDS.marketsearchlink(itno)
        if (sl) { b.appendChild(sl) }
      }
      if (it.tradeable && it.traderlevel !== 99) {
        if (window.TW_Calc && window.TW_Calc.openShopWindowByItemId) {
          const x = TWDS.createEle('i', { beforeend: b, textContent: '$', className: 'TWDS_collections_shoplink' })
          x.onclick = function () {
            window.TW_Calc.openShopWindowByItemId(itno)
          }
        }
      }
      if (itno in TWDS.collections.dropdata && TWDS.collections.dropdata[itno]) {
        const jobno = TWDS.collections.dropdata[itno]
        const jobdata = JobList.getJobById(jobno)
        b.innerHTML += MinimapWindow.getQuicklink(jobdata.name, 'task-finish-job')
      }
    }
  }
  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}

TWDS.collections.prepareNameCache = function () {
  const out = {}
  const all = ItemManager.getAll()
  for (const e of Object.values(all)) {
    out[e.name] = e.item_id
  }
  return out
}
TWDS.collections.findItemByName = function (name, cache) {
  const all = ItemManager.getAll()
  for (const e of Object.values(all)) {
    if (e.name === name && e.item_level === 0) { return e.item_id }
  }
  return -1
}
TWDS.collections.isMissing = function (ii) {
  if (ii in TWDS.collections.missing_items) return true
  return false
}
TWDS.collections.load = function () {
  Ajax.remoteCall('achievement', 'get_list', {
    folder: 'collections',
    playerid: Character.playerId
  }, function (x) {
    console.log(x)
    // i'm not going to parse HTML. No, i am not.
    // Even if this is slower than needed.
    const div = TWDS.createEle({ nodeName: 'div' })

    const namecache = TWDS.collections.prepareNameCache()

    const p = x.achievements.progress
    for (let i = 0; i < p.length; i++) {
      const a = p[i]
      TWDS.collections.unfinished[a.title] = []
      for (let j = 0; j < a.meta.length; j++) {
        div.innerHTML = a.meta[j]
        const spans = TWDS.q('span', div)
        const title = a.title
        for (let k = 0; k < spans.length; k++) {
          const span = spans[k]
          const name = span.title
          let ii = -1
          if (name in namecache) { ii = namecache[name] }
          if (span.classList.contains('locked')) {
            // missing shit.
            TWDS.collections.missing_items[ii] = title
            TWDS.collections.unfinished[title].push(ii)
            if (ii in TWDS.collections.dropdata && TWDS.collections.dropdata[ii]) {
              const jobno = TWDS.collections.dropdata[ii]
              TWDS.collections.missing_collectible_jobs[jobno] = ii
            }
          } else {
            TWDS.collections.seen_items[ii] = title
          }
        }
      }
    }
    TWDS.collections.loaded = true
  })
}
TWDS.registerStartFunc(function () {
  // wait 2.5 seconds to avoid a thundering herd.
  setTimeout(TWDS.collections.load, 2500)
})
