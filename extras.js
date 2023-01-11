TWDS.extras = {}
TWDS.extras.button = function (fn, text, help) {
  const li = TWDS.createEle('li')
  TWDS.createEle({
    nodeName: 'button',
    className: 'TWDS_button TWDS_extras_button',
    dataset: {
      func: fn
    },
    textContent: text,
    beforeend: li
  })
  if (help) {
    TWDS.createEle({
      nodeName: 'span',
      textContent: help,
      beforeend: li
    })
  }
  return li
}
TWDS.extras.getTabContent = function () {
  const div = document.createElement('div')
  div.id = 'TWDS_extras'
  TWDS.createEle('h2', { beforeend: div, textContent: TWDS._('EXTRAS_TITLE', 'Extras') })
  TWDS.createEle('ul', { beforeend: div })
  div.appendChild(TWDS.extras.button('TWDS.wuw.openwindow',
    TWDS._('EXTRAS_WUW_TEXT', 'What is used where?'),
    TWDS._('EXTRAS_WUW_HELP', 'Shows which equipment is used for which job / equipment set')
  ))
  div.appendChild(TWDS.extras.button('TWDS.itemuse.openwindow',
    TWDS._('EXTRAS_CHESTS_TEXT', 'Chests contents?'),
    TWDS._('EXTRAS_CHESTS_HELP', 'Shows the contents of chest you opened')
  ))
  div.appendChild(TWDS.extras.button('TWDS.questlist.openwindow',
    TWDS._('EXTRAS_QUESTS_TEXT', 'Quests by employers?'),
    TWDS._('EXTRAS_QUESTS_HELP', 'Shows the availaible chest at the various employers')
  ))
  div.appendChild(TWDS.extras.button('TWDS.collections.openwindow',
    TWDS._('EXTRAS_COLLECTIONS_TEXT', 'Collections?'),
    TWDS._('EXTRAS_COLLECTIONS_HELP', 'Shows missing collection items.')
  ))
  div.appendChild(TWDS.extras.button('TWDS.altinv.openwindow',
    TWDS._('EXTRAS_COLLECTIONS_TEXT', 'Tabular inventory'),
    TWDS._('EXTRAS_COLLECTIONS_HELP', 'Shows your inventory as one big table, sorted by set and name.')
  ))
  return div
}
TWDS.extras.activateTab = function () {
  TWDS.activateTab('extras')
}
TWDS.registerStartFunc(function () {
  TWDS.registerTab('extras',
    TWDS._('TABNAME_EXTRAS', 'Extras'),
    TWDS.extras.getTabContent,
    TWDS.extras.activateTab,
    true)
  TWDS.delegate(document, 'click', '.TWDS_extras_button', function (ev) {
    const funcstring = this.dataset.func

    const parts = funcstring.split('.')
    const func = parts.pop()
    let context = window
    for (let i = 0; i < parts.length; i++) {
      context = context[parts[i]]
    }
    context[func].apply(context)
  })
})

// vim: tabstop=2 shiftwidth=2 expandtab
