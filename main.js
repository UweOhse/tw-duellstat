// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.opentab = function (tabname, scrollto) {
  if (typeof (wman.getById('TWDS')) === 'undefined') {
    TWDS.window = null
  }
  if (TWDS.window == null) {
    // TWDS.updateData()
    TWDS.window = wman.open('TWDS', TWDS.scriptnameTitle, 'noreload nocloseall').setMiniTitle(TWDS.scriptnameMiniTitle)

    let defaultTab = ''
    for (const tabData of Object.values(TWDS.knownTabs)) {
      const t = TWDS.createTab(tabData.key)
      TWDS.window.addTab(tabData.title,
        tabData.key, tabData.activationFunc)
      const sp = new west.gui.Scrollpane()
      sp.appendContent(t)
      TWDS.window.appendToContentPane(sp.getMainDiv())
      if (tabData.isDefault && defaultTab === '') { defaultTab = tabData.key }
    }
    const lastseen = window.localStorage.TWDS_last_seen || ''
    if (lastseen !== TWDS.version) {
      defaultTab = 'updates'
      window.localStorage.TWDS_last_seen = TWDS.version
    }

    if (tabname === null) { tabname = defaultTab }
  }
  if (wman.isMinimized('TWDS')) {
    wman.reopen('TWDS')
  }
  TWDS.activateTab(tabname)
  if (scrollto) {
    const x = TWDS.q1(scrollto, TWDS.window.divMain)
    if (x) {
      x.scrollIntoView(true)
    }
  }
}
TWDS.createSideButton = function () {
  const d = document.createElement('div')
  d.classList.add('menulink')
  d.onClick = 'TWDS.open();'
  d.title = TWDS.scriptnameTitle
  d.style.backgroundImage = 'none !important'
  d.textContent = 'DS'
  d.id = 'TWDS_innerbutton'
  const mc = document.createElement('div')
  mc.classList.add('ui_menucontainer')
  mc.id = 'TWDS_button'
  mc.onClick = 'TWDS.open();'
  mc.appendChild(d)
  const mcb = document.createElement('div')
  mcb.classList.add('menucontainer_bottom')
  mc.appendChild(mcb)
  const mb = document.querySelector('#ui_menubar')
  mb.appendChild(mc)

  const ib = document.querySelector('#TWDS_innerbutton')
  ib.style.backgroundImage = 'none !important'
  ib.classList.add('test')
  ib.onclick = function () {
    if (typeof (wman.getById('TWDS')) === 'undefined') {
      TWDS.window = null
    }
    if (TWDS.window == null) {
      TWDS.opentab(null)
    } else if (wman.isMinimized('TWDS')) {
      wman.reopen('TWDS')
    } else {
      wman.close('TWDS')
      TWDS.window = null
    }
  }
}

window.TWDS = TWDS

TWDS.didstartfuncs = false
TWDS.wait2callstartfuncs = function () {
  if (TWDS.didstartfuncs) return // at least we are running them.

  const dostartfuncs = function (idx) {
    if (idx >= TWDS.startFunctions.length) { return }
    const fn = TWDS.startFunctions[idx]
    try {
      fn()
    } catch (e) {
      console.log('Caught exception', e)
      new UserMessage('Caught exception: ' + e).show()
      console.trace(e)
    }
    setTimeout(dostartfuncs, 25, idx + 1)
  }
  if (!ItemManager.isLoaded()) {
    EventHandler.listen('itemmanager_loaded', TWDS.wait2callstartfuncs)
    return
  }
  if (!Character.playerId) {
    EventHandler.listen('char_avatar_changed', TWDS.wait2callstartfuncs)
    return
  }

  TWDS.didstartfuncs = true
  dostartfuncs(0)
  return EventHandler.ONE_TIME_EVENT
}
TWDS.main = function () {
  $(document).on('click', '.TWDS_nameeditTrigger', function () {
    const oldName = this.textContent
    const str = TWDS._('ENTER_NEW_NAME', 'Enter a new name for the equipment set $name$', {
      name: oldName
    })
    const newName = window.prompt(str)
    if (newName === false) return
    if (oldName === newName) {
      return
    }
    const tr = this.closest('tr')
    const key = tr.dataset.key
    let tmp = window.localStorage.getItem(key)
    const o = JSON.parse(tmp)
    o.name = newName
    tmp = JSON.stringify(o)
    window.localStorage.setItem(key, tmp)
    this.textContent = newName
  })
  $(document).on('click', '.TWDS_delete', function () {
    const tr = this.closest('tr')
    const n = $('.TWDS_nameeditTrigger', tr)[0].textContent
    const str = TWDS._('CONFIRM_REMOVE', 'Really remove equipment set $name$?', {
      name: n
    })
    if (!window.confirm(str)) {
      return
    }
    const key = tr.dataset.key
    window.localStorage.removeItem(key)
    tr.remove()
    TWDS.clothcache.recalcItemUsage()
  })
  TWDS.wait2callstartfuncs()

  //
  const div = TWDS.createEle('div.TWDS_API_TAB')
  TWDS.createEle('p.aka', {
    last: div,
    textContent: 'a.k.a. '
  })
  TWDS.createEle('h1', {
    last: div,
    textContent: ' the script that totally lost its focus'
  })
  TWDS.createEle('p', {
    last: div,
    textContent: 'version: ' + TWDS.version
  })
  TWDS.createEle('p', {
    last: div,
    children: [
      { nodeName: 'span', textContent: 'Please report bugs and request enhancements there: ' },
      { nodeName: 'a', href: TWDS.issueURL, textContent: TWDS.issueURLText }
    ]
  })
  TWDS.createEle('p', {
    last: div,
    textContent: 'Clothcache, formerly known as duellstat, provides enhancements to many parts of the game.'
  })
  window.TheWestApi.register('TWDS',
    TWDS.scriptnameTitle,
    Game.version.toString(), // minGame… i don't know.
    Game.version.toString(), // maxGame… how could i know?
    TWDS.ingameauthor,
    TWDS.baseURL).setGui(div)
}

TWDS.preMain = function () {
  if (typeof $ === 'undefined') {
    window.setTimeout(TWDS.preMain, 100)
    return
  }
  if (typeof window.wman === 'undefined') {
    window.setTimeout(TWDS.preMain, 100)
    return
  }
  TWDS.createSideButton()
  if (TWDS.settings && 'startupdelay' in TWDS.settings && TWDS.settings.startupdelay > 0) {
    setTimeout(TWDS.main, TWDS.settings.startupdelay)
  } else {
    setTimeout(TWDS.main, 1000)
  }
}

TWDS.waitready = function () {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    TWDS.preMain()
  } else {
    document.addEventListener('DOMContentLoaded', TWDS.preMain())
  }
}
TWDS.waitready()
