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
  const ul = TWDS.createEle('ul', { beforeend: div })

  const a = []
  for (let i = 0; i < TWDS.extraList.length; i++) {
    const e = TWDS.extraList[i]
    a.push([i, e.text.toLocaleLowerCase()])
  }
  a.sort(function (a, b) {
    return a[1].localeCompare(b[1])
  })
  for (let i = 0; i < TWDS.extraList.length; i++) {
    const j = a[i][0]
    const e = TWDS.extraList[j]
    ul.appendChild(TWDS.extras.button(e.fn, e.text, e.help))
  }
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
