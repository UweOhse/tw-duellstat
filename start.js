const TWDS = { }

TWDS.window = null
TWDS.lfd = 0
TWDS.baseURL = 'https://ohse.de/uwe/tw-duellstat/'

// a hash function. Source: https://stackoverflow.com/a/52171480
// doesn't work with IE11. Too bad.
TWDS.cyrb53 = function cyrb53 (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed; let
    h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

TWDS.createTab = function (k) {
  const div = document.createElement('div')
  div.style = 'display:none; overflow: hidden'
  div.id = 'TWDS_tab_' + k
  div.className = 'TWDS_tabcontent'
  return div
}
TWDS.knownTabs = {}
TWDS.registerTab = function (key, title, contentFunc, actiFunc, isDefault = false) {
  const o = {
    key: key,
    title: title,
    contentFunc: contentFunc,
    activationFunc: actiFunc,
    isDefault: isDefault
  }
  TWDS.knownTabs[key] = o
}
TWDS.activateTab = function (k) {
  const tabData = TWDS.knownTabs[k]
  if (typeof tabData === 'undefined') return

  const id = 'TWDS_tab_' + k
  const div = document.getElementById(id)
  div.innerHTML = ''
  div.appendChild(tabData.contentFunc())

  $('.TWDS_tabcontent').hide()
  $('.tw2gui_window_tab_active', TWDS.window.getMainDiv())
    .removeClass('tw2gui_window_tab_active')
  $('.TWDS_tabcontent').closest('.tw2gui_scrollpane').hide()
  $('#TWDS_tab_' + k).show()
  $('#TWDS_tab_' + k).closest('.tw2gui_scrollpane').show()
  $('._tab_id_' + k, TWDS.window.getMainDiv())
    .addClass('tw2gui_window_tab_active')
}
TWDS.startFunctions = []
TWDS.registerStartFunc = function (x) {
  TWDS.startFunctions.push(x)
}
