// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.items = {}
TWDS.items.item2recipe = {} // itemid: recipeid
TWDS.items.data = {}
TWDS.items.date = 0

TWDS.items.popupenhancementReal = function () {
  let t
  let orig = window.ItemPopup._twds_backup_getXHTML.call(this)
  const item = this.item_obj
  const ii = item.item_id
  console.log('PE', item)

  TWDS.items.origpopup = orig

  const old = TWDS.createEle('div')
  old.innerHTML = orig

  let istwir=TWDS.q(".inventory_popup > table", old).length
  if (istwir) {
    // TWIR makes a mess out of the popup, removing structure.
    if (!ItemPopup.twir_getXHTML) {
      return orig; // paranoia
    }
    orig = window.ItemPopup.twir_getXHTML.call(this)
    old.innerHTML = orig
    console.log('PE overrid TWIR');
  } 
  console.log('PE using', orig);

  const enhanced = TWDS.createEle('section.TWDS_enhanced_itempopup')
  const head = TWDS.createEle('header', { last: enhanced })
  const main = TWDS.createEle('main', { last: enhanced })
  const foot = TWDS.createEle('footer', { last: enhanced })
  const side = TWDS.createEle('aside', { last: enhanced })

  t=TWDS.q(".invPopup_head > *", old)
  for (let i=0;i<t.length;i++) {
    head.appendChild(t[i]);
  }

  t=TWDS.q1('div img[src*="divider"',head);
  if (t) {
    t.parentNode.remove();
  }

  t=TWDS.q(".invPopup_body > *", old)
  for (let i=0;i<t.length;i++) {
    main.appendChild(t[i]);
  }
  t=TWDS.q(".invPopup_foot > *", old)
  for (let i=0;i<t.length;i++) {
    foot.appendChild(t[i]);
  }
  t = TWDS.q1('.inventory_popup_label', main)
  if (t) {
    TWDS.createEle('h1', { first: head, textContent: t.textContent })
    t.remove();
  }

  t = TWDS.q1('.inventory_popup_icon', head)
  if (t) {
    t.className = 'twds_icon'
    const c = Bag.getItemCount(ii)
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
  TWDS.createEle({
    nodeName: 'div.TWDS_id',
    last: head,
    textContent: '[item=' + ii + ']'
  })

  t=TWDS.q1(".item_level",main);
  if (t) t.remove();


  t = TWDS.q1('.inventory_popup_type', main)
  if (t && 1) {
    head.appendChild(t);
    t.className="type";
    if (item.type === 'right_arm') {
      const span = TWDS.q1('span', t)
      if (span) {
        const l = span.textContent.length
        if (l > 3) { t.textContent = span.textContent.substring(1, l - 1) }
      }
    }
  }
  t = TWDS.q1('.inventory_popup_damage', main)
  if (t) {
    t.className = 'damage'
    main.appendChild(t)
    if (t) {
      const spans = TWDS.q('span', t)
      if (spans.length === 2) {
        let v = parseInt(spans[0].textContent) + parseInt(spans[1].textContent)
        v = Math.round(v / 2)
        TWDS.createEle({
          nodeName: 'span.avgdamage',
          textContent: v,
          afterend: spans[1]
        })
      }
    }
  }

  const setinfo = TWDS.itemsettab.classifyset(item.set)
  let eventdiv=null
  if (setinfo) {
    eventdiv=TWDS.createEle({
      nodeName: 'div.eventdata',
      last: head,
      children: [
        { nodeName: 'span.year', dataset: { year: setinfo.year }, textContent: setinfo.year },
        { nodeName: 'span.event', dataset: { year: setinfo.eventname }, textContent: setinfo.eventname }
      ]
    })
  }

  const headdivider=TWDS.createEle('div.divider', { last: head })

  const isb = main.querySelector('.item_set_bonus')
  const isn = TWDS.q1('.item_set_names', main)
  if (isb || isn) { enhanced.classList.add('TWDS_with_set') }


  t = TWDS.q1('.inventory_popup_prices', main)
  if (t) {
    t.className = 'prices'
    foot.appendChild(t)
  }

  t = TWDS.q1('.inventory_popup_bonus_attr', main) // attr and skills.
  if (t) {
    t.className = 'itembonus'
    console.log("itembonus found",t,t.parentNode,t.parentNode.parentNode);
  }
  
  TWDS.createEle({
    nodeName: 'p.auction_status',
    textContent: 'auctionable',
    className: item.auctionable ? 'possible' : 'impossible',
    last: foot
  })
  t=TWDS.q1(".inventory_popup_auctionable",foot);
  if (t) t.remove();
  TWDS.createEle({
    nodeName: 'p.sell_status',
    textContent: 'sellable',
    className: item.sellable ? 'possible' : 'impossible',
    last: foot
  })
  t=TWDS.q1(".invPopup_notsellable",main);
  if (t) t.remove();
  TWDS.createEle({
    nodeName: 'p.upgrade_status',
    textContent: 'upgradable',
    className: item.upgradeable ? 'possible' : 'impossible',
    last: foot
  })
  t=TWDS.q1(".inventory_popup_notupgradeable",foot);
  if (t) t.remove();

  t=TWDS.q1(".inventory_popup_action",main);
  if (t) t.remove(); // einsetzbar, erlernbar. just noise.

  t=TWDS.q1(".inventory_popup_unique",main);
  if (t) foot.appendChild(t);

  // .item_set_names is empty, followed by a <span> containing the name of the set.
  // which is insane, of course.
  if (isn) {
    const n = isn.nextSibling
    if (n && n.nodeName === 'SPAN') {
      TWDS.createEle({
        nodeName: 'h2.setname',
        textContent: n.textContent,
        last: side
      })
      n.remove();
      isn.remove();
    }
  }
  const ul = TWDS.q1('.inventory_popup_item_set_names', main)
  if (ul) { side.appendChild(ul) }

  if (isb) {
    TWDS.createEle('div.divider', { last: side })
    side.appendChild(isb);
  }
  /*
  // where to find the set bonus?
  // cleanly in .item_set_bonus, unless TWX (?) is in use.
  // So we only take the bonus list, without the "set bonus" title, but that's unneeded, anyway.
  const ipbs = TWDS.q1('.inventory_popup_bonus_skills', main)
  if (ipbs) {
    ipbs.className = 'set_bonus'
    side.appendChild(ipbs)
  }
  */

  t = TWDS.q1('.inventory_popup_requirement_text', main)
  if (t) {
    t.className = 'requirements'
    let sp=TWDS.q1(".inventory_popup_level",t);
    if (sp) {
      if (sp.textContent.trim().match(/ 1$/)) {
        sp.remove();
      }
    }
    let t2=TWDS.q1(".inventory_popup_recipe",main);
    if (t2)
      t.appendChild(t2);
    let spans = TWDS.q('span', t)
    t.remove();
    if (spans.length) { foot.appendChild(t) }
  }

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

  if (ii in TWDS.items.data) {
    const d = TWDS.items.data[ii]
    const ti = d.time * 3600
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
    console.log('TIMEINFO', str)
    if (d.crafteditems === 0) {
      if (d.jobs.length) {
        const a = []
        for (let i = 0; i < d.jobs.length; i++) {
          a.push(TWDS.createEle({
            nodeName: 'span',
            className: 'onejob',
            dataset: { id: d.jobs[i][0] },
            children: [
              { nodeName: 'span.name', textContent: JobList.getJobById(d.jobs[i][0]).name },
              { nodeName: 'span.yield', textContent: (100 * d.jobs[i][1]).toFixed(0) }
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
  }

  // kill the fucking <br> infection
  const brs = TWDS.q('br', enhanced)
  for (let i = 0; i < brs.length; i++) { brs[i].remove() }

  if (main.firstChild) {
    TWDS.createEle('div.divider', { first: foot })
  }
  console.log('PE returning', enhanced);

  return enhanced.outerHTML







  // *************************************************************************************
  // complicated by other scripts creating tables where none are needed, and removing classes.
  //

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
  setTimeout(TWDS.items.start, 2500)
})

// vim: tabstop=2 shiftwidth=2 expandtab
