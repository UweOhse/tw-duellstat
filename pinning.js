// vim: tabstop=2 shiftwidth=2 expandtab

// pinning mode
TWDS.pinning = {}
TWDS.pinning.cooldowninterval = 0
TWDS.pinning.cooldownhandler = function () {
  const d = TWDS.q1('#TWDS_pinning_cooldowninfo')
  if (!d) return

  const now = new Date().getTime()
  const dt = Character.cooldown - now / 1000
  if (dt <= 0) {
    d.textContent = ''
  } else {
    d.textContent = dt.formatDurationBuffWay()
  }

  const x = window.localStorage.TWDS_pinned_items || '[]'
  const list = JSON.parse(x)

  for (let i = 0; i < list.length; i++) {
    const itemid = list[i]
    const it = Bag.getItemByItemId(itemid) // that's where we get the cooldown info
    if (!it) continue
    const st = new window.ServerDate().getTime()
    const delta = (it.cooldown - st / 1000)
    if (delta > 0) {
      const ours = TWDS.q(".TWDS_pinning_container .item[data-twds_item_id='" + itemid + "'] .cooldown p")
      for (let j = 0; j < ours.length; j++) {
        ours[j].textContent = delta.formatDurationBuffWay()
        ours[j].parentNode.style.display = 'block'
      }
    }
    const ours = TWDS.q(".TWDS_pinning_container .item[data-twds_item_id='" + itemid + "'] .count")
    for (let j = 0; j < ours.length; j++) {
      const old = parseInt(ours[j].textContent)
      if (old !== it.count) {
        ours[j].textContent = it.count
        ours[j].style.display = 'block'
      }
    }
  }
}
TWDS.pinning.onclick = function () {
  const id = this.dataset.twds_item_id
  const bi = Bag.getItemByItemId(id)
  if (bi) {
    Inventory.clickHandler(id, {})
  }
}
TWDS.pinning.handledrop = function (ele, inbucket) {
  if (!ele) return false
  if (!ele[0]) return false
  if (!ele[0].parentNode) return false // paranoia, but i've seen this a long time ago.
  // need to return false, else the onclick handler is not run
  if (!inbucket && ele[0].classList.contains('TWDS_pinned_thing')) return false

  const id = parseInt(ele[0].parentNode.dataset.twds_item_id)
  const str = window.localStorage.TWDS_pinned_items || '[]'
  const list = JSON.parse(str)

  const idx = list.indexOf(id)
  if (inbucket) {
    if (idx > -1) {
      list.splice(idx, 1)
    }
  } else {
    if (idx === -1) { list.push(id) }
  }
  window.localStorage.TWDS_pinned_items = JSON.stringify(list)
  TWDS.pinning.getcontent()
}
TWDS.pinning.getcontent = function () {
  const x = window.localStorage.TWDS_pinned_items || '[]'
  const list = JSON.parse(x)

  const content = TWDS.q1('.TWDS_pinning_container')
  content.textContent = ''
  for (let i = 0; i < list.length; i++) {
    const id = list[i]
    const t = new tw2widget.Item(ItemManager.get(id)).setCharacter(Character).getMainDiv()[0]
    content.appendChild(t)
    t.style.display = 'inline-block'
    t.style.float = 'none'
    t.dataset.twds_item_id = id
    t.onclick = TWDS.pinning.onclick
    TWDS.createEle('span.cooldown', { last: t, children: [{ nodeName: 'p' }] })
    const img = TWDS.q1('.tw_item', t)
    img.classList.add('TWDS_pinned_thing')
    $(img).setDraggable()
  }
  if (list.length === 0) {
    content.textContent = 'drag and drop'
  }
  let rows = Math.ceil((list.length) / 4)
  if (rows < 1) rows = 1
  const win = content.closest('.TWDS_pinning_window')
  win.style.height = (95 + rows * 62) + 'px'
}

TWDS.pinning.openwindow = function (ev) {
  const win = wman.open('TWDS_pinning_window', 'Pinned items', 'TWDS_pinning_window')
  win.setMiniTitle('Pinning')

  const sp = new west.gui.Scrollpane()
  const content = TWDS.createEle('div', {
    className: 'TWDS_pinning_container',
    style: {
      minHeight: '62px'
    }
  })
  sp.appendContent(content)
  win.divMain.style.width = '295px'
  if (!ev || (ev && ev.clientX < 250 && ev.clientY < 250)) {
    win.divMain.style.top = '198px'
    win.divMain.style.left = '12px'
  } else {
    win.divMain.style.top = '44px'
    win.divMain.style.left = ev.clientX + 'px'
  }

  const ti = TWDS.q1('.textart_title', win.divMain)
  if (ti) {
    const obj = ItemManager.get(1760000)
    const path = window.to_cdn(obj.image)
    const img = TWDS.createEle('img', {
      src: path,
      className: 'TWDS_pinning_bucket',
      style: {
        height: '32px',
        left: '8px',
        position: 'absolute',
        filter: 'brightness(2.0)'
      },
      first: ti
    })
    $(img).asDropzone('.tw_item.TWDS_pinned_thing', false, function (ele) {
      TWDS.pinning.handledrop(ele, true)
    })
    TWDS.createEle({
      nodeName: 'div',
      id: 'TWDS_pinning_cooldowninfo',
      last: ti
    })
  }

  $(content).asDropzone('.item_inventory_img', false, function (ele) {
    TWDS.pinning.handledrop(ele, false)
  })

  win.appendToContentPane(sp.getMainDiv())
  TWDS.pinning.getcontent()
}
TWDS.pinning.start = function () {
  if (!TWDS.settings.misc_pinning_bucket) {
    const old = TWDS.q1('#ui_topbar .TWDS_pinning_starter')
    if (old) old.remove()
    return
  }
  const tb = TWDS.q1('#ui_topbar')
  const obj = ItemManager.get(1761000)
  const path = window.to_cdn(obj.image)
  TWDS.createEle('img', {
    src: path,
    className: 'TWDS_pinning_starter',
    style: {
      height: '32px',
      right: '22px',
      position: 'absolute',
      filter: 'brightness(2.0)',
      cursor: 'pointer'
    },
    onclick: TWDS.pinning.openwindow,
    last: tb
  })
}
TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'misc_pinning_bucket',
    TWDS._('MISC_SETTING_PINNING', 'Show a pinning bucket in the top bar. You can also open the pinning window if you cick on the duel motivation bar below the character information.'),
    true, TWDS.pinning.start)
  TWDS.pinning.cooldowninterval = window.setInterval(TWDS.pinning.cooldownhandler, 1000)
})
