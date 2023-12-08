// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.items = {}
TWDS.items.item2recipe = {} // itemid: recipeid
TWDS.items.data = {}
TWDS.items.date = 0

TWDS.items.popupenhancementReal = function () {
  let t

  if (TWDS.settings.itempopup_enable) {
    if (TWDS.settings.itempopup_bonuscharlevel) {
      this.options.character = {
        level: Character.level
      }
    }
  }

  const orig = window.ItemPopup._twds_backup_getXHTML.call(this)
  if (!TWDS.settings.itempopup_enable) return orig

  if (document.activeElement && document.activeElement.nodeName === 'IFRAME') return orig // band-aid for the forum.php iframe

  const wrapper = TWDS.createEle('div')
  wrapper.innerHTML = orig

  const item = this.item_obj
  const ii = item.item_id

  TWDS.items.origpopup = orig // iteminfo... debugging

  const istwir = TWDS.q('.inventory_popup > table', wrapper).length
  if (istwir) {
    // TWIR makes a mess out of the popup, removing structure.
    return orig
  }

  const ip = TWDS.q1('.inventory_popup', wrapper)
  if (!ip) return orig
  ip.classList.add('TWDS_enhanced')

  const head = TWDS.q1('.invPopup_head', wrapper)
  if (head) {
    if (TWDS.settings.itempopup_count) {
      t = TWDS.q1('.inventory_popup_icon', wrapper)
      if (t) {
        let c = Bag.getItemCount(ii)
        if (Wear.wear[item.type] && Wear.wear[item.type].getId() === ii) { c += 1 }
        TWDS.createEle({
          nodeName: 'div.twds_count',
          last: t,
          textContent: c
        })
        if (item.item_level) {
          TWDS.createEle({
            nodeName: 'div.item_level',
            last: t,
            textContent: item.item_level
          })
        }
      }
      const t2 = TWDS.q1('.invPopup_body .item_level', wrapper)
      if (t2) t2.remove()
    }
    if (TWDS.settings.itempopup_itemid) {
      t = TWDS.q1('.invPopup_head > div:last-child', wrapper)
      if (t) {
        TWDS.createEle({
          nodeName: 'div.TWDS_id',
          last: head,
          textContent: '[item=' + ii + ']'
        })
      }
    }
  }
  t = TWDS.q1('.inventory_popup_type', wrapper)
  if (t) {
    if (item.type === 'right_arm') {
      const span = TWDS.q1('span', t)
      if (span) {
        t.textContent = t.textContent.replace(/\(/, ' (')
      }
    }
  }

  t = TWDS.q1('.inventory_popup_damage', wrapper)
  if (t) {
    if (t) {
      const spans = TWDS.q('span', t)
      if (spans.length === 2) {
        let v = parseInt(spans[0].textContent) + parseInt(spans[1].textContent)
        v = Math.round(v / 2)
        TWDS.createEle({
          nodeName: 'span.TWDS_avgdamage',
          textContent: v,
          afterend: spans[1]
        })
      }
    }
  }

  if (TWDS.settings.itempopup_eventinfo) {
    const setinfo = TWDS.itemsettab.classifyset(item.set)
    if (setinfo) {
      TWDS.createEle({
        nodeName: 'div.TWDS_eventdata',
        last: head,
        children: [
          { nodeName: 'span.year', dataset: { year: setinfo.year }, textContent: setinfo.year },
          {
            nodeName: 'span.event',
            dataset: { year: setinfo.eventname },
            textContent:
            TWDS._('ITEMPOPUP_EVENTNAME_' + setinfo.eventname, setinfo.eventname)
          }
        ]
      })
    }
  }

  // wrap the item set infos.
  const isb = TWDS.q1('.item_set_bonus', wrapper)
  const isn = TWDS.q1('.item_set_names', wrapper)

  if (isb && isn) {
    ip.classList.add('TWDS_with_set_bonus')
    const setarea = TWDS.createEle('div.itemsetinfo', { last: ip })
    // .item_set_names is empty, followed by a <span> containing the name of the set.
    // which is insane, of course.
    const n = isn.nextSibling
    if (n && n.nodeName === 'SPAN') {
      TWDS.createEle({
        nodeName: 'h2.setname',
        textContent: n.textContent,
        last: setarea
      })
      n.remove()
      isn.remove()
    }
    t = TWDS.q1('.inventory_popup_item_set_names', wrapper)
    if (t) {
      setarea.appendChild(t)
    }

    setarea.appendChild(isb)
  }

  t = TWDS.q1('.inventory_popup_requirement_text', wrapper)
  if (t) {
    t.className = 'requirements'
    const sp = TWDS.q1('.inventory_popup_level', t)
    if (sp) {
      if (sp.textContent.trim().match(/ 1$/)) {
        sp.remove()
      }
      if (sp.textContent.trim().match(/ 1 \(1\)$/)) {
        sp.remove()
      }
    }
    const t2 = TWDS.q1('.inventory_popup_recipe', wrapper)
    if (t2) { t.appendChild(t2) }

    const spans = TWDS.q('span', t)
    if (!spans.length) { t.remove() }
  }

  // clean up the footer
  const foot = TWDS.q1('.invPopup_foot', wrapper)
  t = TWDS.q('br', foot)
  for (let i = 0; i < t.length; i++) t[i].remove()

  if (TWDS.settings.itempopup_showtime) {
    if (ii in TWDS.items.data) {
      const d = TWDS.items.data[ii]
      const ti = d.time * 3600
      console.log('IPST', d, ti)
      let str = ''
      if (d.crafteditems > 0) {
        if (d.founditems) {
          str += TWDS._('ITEMPOPUP_CRAFTED', 'Crafted')
          str += TWDS._('ITEMPOPUP_CRAFTED_FOUNDITEMS', ', $n$ items to find (<= $time$)', {
            n: d.founditems,
            time: ti.formatDuration()
          })
        }
        if (d.shopitems > 0) { str += TWDS._('ITEMPOPUP_SHOPITEMS', ', $n$ items to buy', { n: d.shopitems }) }
      } else {
        str += TWDS._('ITEMPOPUP_FOUNDITEM_WORKTIME', 'Found, <= $time$ to collect', {
          time: ti.formatDuration()
        })
      }

      TWDS.createElement({
        nodeName: 'div',
        className: 'timeinfo',
        last: foot,
        textContent: str
      })
      if (d.crafteditems === 0) {
        if (d.jobs && d.jobs.length) {
          const a = []
          for (let i = 0; i < d.jobs.length; i++) {
            a.push(TWDS.createEle({
              nodeName: 'span',
              className: 'onejob',
              dataset: { id: d.jobs[i][0] },
              children: [
                { nodeName: 'span.name', textContent: JobList.getJobById(d.jobs[i][0]).name },
                { nodeName: 'span.yield', textContent: (100 * d.jobs[i][1]).toFixed(0) + '%' }
              ]
            }))
          }
          TWDS.createElement({
            nodeName: 'div',
            className: 'jobinfo',
            last: foot,
            children: a
          })
        }
      }
      if (ii in TWDS.items.item2recipe) {
        console.log('XXXX', TWDS.items.item2recipe[ii])
        const ri = ItemManager.get(TWDS.items.item2recipe[ii])
        console.log('XXXX', ri)
        const ele = TWDS.createEle({
          nodeName: 'div.recipeinfo',
          last: foot,
          children: [{
            nodeName: 'div.profinfo.profession_' + ri.profession_id,
            title: ri.profession,
            dataset: {
              level: ri.min_level
            }
          }]
        })
        const pa = TWDS.createEle({
          nodeName: 'div.rsinfo',
          last: ele
        })
        for (let i = 0; i < ri.resources.length; i++) {
          const x = ri.resources[i].item
          const y = ri.resources[i].count
          const xi = ItemManager.get(x)
          const z = new tw2widget.InventoryItem(xi).setCount(y)
          TWDS.createEle({
            nodeName: 'div.oneitem',
            last: pa,
            children: [z.getMainDiv()[0]]
          })
        }
      }
    }
  }

  if (TWDS.settings.itempopup_showjobicon) {
    if (ii in TWDS.collections.dropdata) {
      const jid = TWDS.collections.dropdata[ii]
      const jd = JobList.getJobById(jid)
      if (jd) {
        TWDS.createElement({
          nodeName: 'img',
          className: 'TWDS_popup_enhance2',
          src: '/images/jobs/' + jd.shortname + '.png',
          afterbegin: head
        })
      }
    }
  }

  return wrapper.innerHTML
}

TWDS.items.popupenhancement = function () {
  return TWDS.items.popupenhancementReal.call(this)
}
TWDS.items.makedata = function () {
  TWDS.items.data = {} // for debugging.

  const items = ItemManager.getAll()
  const recipes = {}
  const done = {} // rs-id => worktime in hours
  const proto = {
    time: 0,
    shopitems: 0,
    founditems: 0,
    crafteditems: 0,
    crafts: 0,
    jobs: [],
    err: false
  }

  const getiteminfo = function (itemid) {
    const it = ItemManager.get(itemid)
    const out = Object.assign({}, proto)
    out.jobs = []
    if (itemid in done) {
      return done[itemid]
    }
    if (it.spec_type === 'mapdrop') {
      const jobs = JobList.getJobsByItemId(itemid)
      let perhour = -1
      if (jobs.length) {
        for (let j = 0; j < jobs.length; j++) {
          let x = -1
          try {
            x = jobs[j].yields[itemid].prop
          } catch (e) {
          }
          perhour = Math.max(perhour, x)
          out.jobs.push([jobs[j].id, x * 6]) // 5 bronze stars
        }
        // perhour is % at 0 stars
        perhour = perhour * 6 // 5 bronze stars
      }
      if (perhour < 0) {
        console.log('strange, no job for', it.spec_type, 'with', it.name)
        out.err = true
      }
      out.time = 1 / perhour
      out.founditems = 1
    } else if (it.spec_type === 'crafting') {
      if (itemid in done) {
        return done[itemid]
      }
    } else if (it.spec_type === 'none') {
      // habaneros and cogwheels are none, but should be jobdrop
      // empty jar is rightly here.
      out.shopitems = 1
    } else if (it.spec_type === 'jobdrop') {
      // cobra teeth and cossack saddle blanket
      out.shopitems = 1
    } else {
      console.log('unhandled spec_type', it.spec_type, 'with', it.name)
      out.err = true
    }
    return out
  }

  for (const it of Object.values(items)) {
    if (it.type === 'recipe') {
      TWDS.items.item2recipe[it.craftitem] = it.item_id
      recipes[it.item_id] = it
    }
    if (it.type === 'yield' && it.spec_type === 'mapdrop') {
      const info = getiteminfo(it.item_id)
      TWDS.items.data[it.item_id] = info
      done[it.item_id] = info
    }
  }
  let loopcount = 0
  while (true) {
    loopcount++
    let didone = false
    for (const rid of Object.keys(recipes)) {
      const crafted = recipes[rid].craftitem
      if (crafted in done) { continue }
      const res = recipes[rid].resources
      const out = Object.assign({}, proto)
      out.crafts = recipes[rid].profession_id

      for (let i = 0; i < res.length; i++) {
        const thing = res[i].item
        const count = res[i].count
        const info = getiteminfo(thing)
        if (info.err) {
          out.err = true
        } else {
          out.time += info.time * count
          out.shopitems += info.shopitems * count
          out.founditems += info.founditems * count
          out.crafteditems += info.crafteditems * count
          out.crafts |= info.crafts
        }
      }
      if (!out.err) {
        out.crafteditems += 1
        done[crafted] = out
        TWDS.items.data[crafted] = out
        // if (loopcount>1) console.log("did r",rid,recipes[rid].name)
        didone = true
      }
    }
    if (!didone) {
      break
    }
    if (loopcount > 9) {
      console.log('loopcount', loopcount, 'break', didone)
      break
    }
  }
}
TWDS.items.start = function () {
  if (TWDS.items.date === 0) {
    let x = window.localStorage.getItem('TWDS_items_date')
    if (x) {
      TWDS.items.date = parseInt(x)
      try {
        x = window.localStorage.getItem('TWDS_items_data')
        TWDS.items.data = JSON.parse(x)
      } catch (e) {
        TWDS.items.date = 0
      }
    }
  }
  if (TWDS.items.date < (new Date()).getTime() - 86400 * 1000) {
    TWDS.items.makedata()
    window.localStorage.setItem('TWDS_items_data', JSON.stringify(TWDS.items.data))
    TWDS.items.date = (new Date()).getTime()
    window.localStorage.setItem('TWDS_items_date', TWDS.items.date)
  }

  if (!window.ItemPopup._twds_backup_getXHTML) { window.ItemPopup._twds_backup_getXHTML = window.ItemPopup.getXHTML }
  window.ItemPopup.getXHTML = TWDS.items.popupenhancement
}

TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'itempopup_enable',
    TWDS._('SETTING_ITEMPOPUP_ENABLE',
      'Provide an enhanced item popup. ###This conflicts with multiple other scripts.###'),
    false, null, 'ItemPopup', null, 0)
  TWDS.registerSetting('bool', 'itempopup_eventinfo',
    TWDS._('SETTING_ITEMPOPUP_EVENTINFO',
      'Show event information in the item popup.'),
    true, null, 'ItemPopup')
  TWDS.registerSetting('bool', 'itempopup_showjobicon',
    TWDS._('SETTING_ITEMPOPUP_SHOWJOBICON',
      'Show the icon of the job dropping the product'),
    true, null, 'ItemPopup')
  TWDS.registerSetting('bool', 'itempopup_showtime',
    TWDS._('SETTING_ITEMPOPUP_SHOWTIME',
      'Show the time needed to collect an item, or the ingredients of a crafted item, using the basic drop chances.'),
    true, null, 'ItemPopup')
  TWDS.registerSetting('bool', 'itempopup_count',
    TWDS._('SETTING_ITEMPOPUP_COUNT', 'Show the item count.'),
    true, null, 'ItemPopup')
  TWDS.registerSetting('bool', 'itempopup_itemid',
    TWDS._('SETTING_ITEMPOPUP_ID', 'Show the item ID.'),
    true, null, 'ItemPopup')
  TWDS.registerSetting('bool', 'itempopup_bonuscharlevel',
    TWDS._('SETTING_ITEMPOPUP_BONUS_CHARLEVEL', 'Always show the item/set matching the character level.'),
    true, null, 'ItemPopup')

  setTimeout(TWDS.items.start, 2500)
})

// vim: tabstop=2 shiftwidth=2 expandtab
