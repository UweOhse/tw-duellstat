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

  const ct = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_iteminfo_resultcontainer',
    last: content
  })

  const p = new ItemPopup(it, {
    character: null
  })
  TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_iteminfo_popuparea TWDS_item',
    innerHTML: p.popup.text,
    last: ct
  })

  const resultarea = TWDS.createEle({
    nodeName: 'div',
    className: 'TWDS_iteminfo_resultarea level0',
    last: ct
  })
  const toplevelextra = function (tr, k, v) {
    if (k === 'image') {
      if (it.image > '') {
        TWDS.createEle('div.extra', {
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
        TWDS.createEle('div.extra', {
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
        TWDS.createEle('div.extra', {
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
    }
  }
  const dump = function (elter, k, v, level) {
    const row = TWDS.createEle('div', { last: elter, className: 'row level' + level })
    TWDS.createEle('h6', {
      textContent: k,
      last: row
    })
    if (v === null) {
      TWDS.createEle('span', {
        textContent: 'null',
        last: row
      })
      return
    }
    if (typeof v !== 'object') {
      TWDS.createEle('span', {
        textContent: v,
        last: row
      })
      if (level === 0) {
        toplevelextra(row, k, v)
      }
      return
    }
    for (const [k2, v2] of Object.entries(v)) {
      dump(elter, k2, v2, level + 1)
    };
  }
  for (const [k, v] of Object.entries(it)) {
    dump(resultarea, k, v, 0)
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
