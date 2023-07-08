// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.iteminfo = {}
TWDS.iteminfo.searchitem = function (str) {
}
TWDS.iteminfo.getcontent = function (win) {
  const content = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_iteminfo_content'
  })
  const inputarea = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_iteminfo_inputarea',
    last: content
  })
  TWDS.createEle({
    nodeName: 'input',
    type: 'number',
    onchange: function () {
      win._TWDS_number = this.value
      TWDS.iteminfo.reload(win)
    },
    style: {
      display: 'inline-block'
    },
    placeholder: TWDS._('ITEMINFO_ITEMNO', '# (item id)'),
    title: TWDS._('ITEMINFO_ITEMNO_TITLE', 'The ItemId of the item'),
    value: win._TWDS_number ? win._TWDS_number : null,
    last: inputarea
  })

  const itemno = parseInt(win._TWDS_number)
  if (!itemno || itemno < 1000 || itemno > 2147483647) {
    TWDS.createEle('p', {
      innerHTML: "Here you can see all information about an item available to the frontend of the game (the browser). It's not meant to be beautiful.<br>" +
                'Usage: type the item number (the full one, not the basic one) in the input field and press enter',
      last: content
    })
    return content
  }

  const it = ItemManager.get(itemno, false)
  if (!it) {
    TWDS.createEle('div', {
      class: 'warning',
      textContent: 'no item with #' + itemno,
      last: content
    })
    return content
  }

  const resulttable = TWDS.createEle({
    nodeName: 'table',
    className: 'TWDS_iteminfo_resultarea',
    last: content
  })
  TWDS.createEle({
    nodeName: 'thead',
    last: resulttable,
    children: [
      {
        nodeName: 'tr',
        children: [
          { nodeName: 'th', textContent: TWDS._('ITEMINFO_FIELD_NAME', 'name') },
          { nodeName: 'th', textContent: TWDS._('ITEMINFO_FIELD_CONTENT', 'content') },
          { nodeName: 'th', textContent: TWDS._('ITEMINFO_FIELD_EXTRA', 'extra') }
        ]
      }
    ]
  })
  const tbody = TWDS.createEle({
    nodeName: 'tbody',
    last: resulttable
  })
  const toplevelextra = function (tr, k, v) {
    if (k === 'image') {
      if (it.image > '') {
        TWDS.createEle('td', {
          last: tr,
          children: [
            { nodeName: 'img', src: it.image, alt: it.name }
          ]
        })
      }
      return
    }
    if (k === 'wear_image') {
      if (it.image > '') {
        TWDS.createEle('td', {
          last: tr,
          children: [
            { nodeName: 'img', src: it.image, alt: it.name }
          ]
        })
      }
      return
    }
    if (k === 'set') {
      if (v > '') {
        TWDS.createEle('td', {
          last: tr,
          children: [
            {
              nodeName: 'a',
              href: '#',
              dataset: { setkey: v },
              textContent: 'show set info',
              onclick: function (ev) {
                console.log('click', ev, this)
                TWDS.showset.open(this.dataset.setkey)
              }
            }
          ]
        })
      }
      return
    }
    TWDS.createEle('td', {
      last: tr
    })
  }
  const dump = function (elter, k, v, toplevel) {
    const tr = TWDS.createEle('tr', { last: elter })
    TWDS.createEle('th', {
      textContent: k,
      last: tr
    })
    if (v === null) {
      TWDS.createEle('td', {
        textContent: 'null',
        last: tr
      })
      TWDS.createEle('td', {
        textContent: '',
        last: tr
      })
      return
    }
    if (typeof v !== 'object') {
      TWDS.createEle('td', {
        textContent: v,
        last: tr
      })
      if (toplevel) {
        toplevelextra(tr, k, v)
      }
      return
    }
    const td = TWDS.createEle('td', { last: tr, className: 'subobject' })
    if (toplevel) td.colSpan = '2'
    const tab2 = TWDS.createEle('table', { last: td })
    for (const [k2, v2] of Object.entries(v)) {
      dump(tab2, k2, v2, false)
    };
  }
  for (const [k, v] of Object.entries(it)) {
    dump(tbody, k, v, true)
  }

  return content
}
TWDS.iteminfo.open = function (key) {
  console.log('IIO', key)
  const wid = 'TWDS_craftcalc_' + key
  const win = wman.open(wid, 'set', 'TWDS_iteminfo')
  win.setTitle(TWDS._('ITEMINFO_WINDOW_TITLE', 'Iteminfo'))
  if (!('_TWDS_number' in win)) {
    win._TWDS_number = 0
  }
  const sp = new west.gui.Scrollpane()
  const content = TWDS.iteminfo.getcontent(win)
  sp.appendContent(content)

  win.appendToContentPane(sp.getMainDiv())
}
TWDS.iteminfo.reload = function (win) {
  if (!win) {
    return TWDS.iteminfo.open()
  }
  const content = TWDS.iteminfo.getcontent(win)
  const old = TWDS.q1('.TWDS_iteminfo_content', win.getMainDiv())
  const sp = old.parentNode
  sp.innerHTML = ''
  sp.appendChild(content)
}
TWDS.registerExtra('TWDS.iteminfo.open',
  TWDS._('ITEMINFO_TITLE', 'Iteminfo'),
  TWDS._('ITEMINFO_DESC', 'Show information about an item')
)
