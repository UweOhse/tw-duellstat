TWDS.createSideButton = function () {
  const d = document.createElement('div')
  d.classList.add('menulink')
  d.onClick = 'TWDS.open();'
  d.title = 'Duellstat'
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
    console.log('click')
    if (typeof (wman.getById('TWDS')) === 'undefined') {
      TWDS.window = null
    }
    if (TWDS.window == null) {
      // TWDS.updateData()
      TWDS.window = wman.open('TWDS', 'Duellstat', 'noreload nocloseall').setMiniTitle('Duellstat')

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
      TWDS.activateTab(defaultTab)
    } else {
      wman.close('TWDS')
      TWDS.window = null
    }
  }
  console.log('ib', ib)
}

window.TWDS = TWDS

TWDS.main = function main () {
  console.log('duellstat main starts. $', window.jQuery, $)
  $(document).on('click', '.TWDS_nameeditTrigger', function () {
    const oldName = this.textContent
    const str = TWDS._('CONFIRM_REMOVE', 'Enter a new name for the equipment set', {})
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
  })
  console.log('duellstat main before the sf loop')
  for (const fn of Object.values(TWDS.startFunctions)) {
    fn()
  }
  TWDS.createSideButton()
  console.log('duellstat active')
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
  TWDS.main()
}

TWDS.waitready = function () {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    TWDS.preMain()
  } else {
    document.addEventListener('DOMContentLoaded', TWDS.preMain())
  }
}
TWDS.waitready()

console.log('duellstat loaded')
