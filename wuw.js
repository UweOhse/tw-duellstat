TWDS.wuw = {}
TWDS.wuw.initWUWDisplay = function (container) {
  const intro = document.createElement('p')
  intro.textContent = TWDS._('WUW_INTRO',
    'This page shows what items are used for which jobs with the best possible labor points.')
  container.appendChild(intro)

  const label = document.createElement('label')
  label.title = 'fancy shows images, otherwise pure text is used.'
  const checkbox = document.createElement('input')
  label.appendChild(checkbox)
  checkbox.type = 'checkbox'
  checkbox.id = 'TWDS_WUW_fancycb'
  const labeltext = document.createElement('span')
  label.appendChild(labeltext)
  labeltext.textContent = 'fancy'
  container.appendChild(label)

  const ls = window.localStorage.TWDS_itemusage
  if (typeof ls === 'undefined') {
    const p = document.createElement('p')
    p.textContent = 'No data in the cache. You might want update the data in the settings tab.'
    container.appendChild(p)
    return
  }

  const tab = document.createElement('table')
  tab.id = 'TWDS_wuw_table'
  container.appendChild(tab)

  const headline = document.createElement('tr')
  tab.appendChild(headline)
  let th = document.createElement('th')
  th.textContent = 'Equipment'
  headline.appendChild(th)
  th = document.createElement('th')
  th.textContent = 'Sets and Jobs'
  headline.appendChild(th)

  const data = JSON.parse(ls)
  for (const [id, one] of Object.entries(data)) {
    const count = one.ds.length + one.eq.length + one.job.length
    if (count === 0) { continue }
    const item = ItemManager.get(id)
    if (!item) { continue }

    const tr = document.createElement('tr')
    tab.appendChild(tr)

    let td = document.createElement('td')
    let h = "<span class='TWDS_wuw_item' " +
         "style='font-weight:bold; display:inline-block; text-align:left;'" +
         ' data-itemid=' + id +
         ' data-name=' + item.name +
         '>' + item.name + '</span>'
    if (count > 4) {
      h += "<br style='clear:both'>"
      let flag = 0
      if (one.job.length) {
        h += one.job.length + ' jobs'
        flag = 1
      }
      if (one.eq.length) {
        if (flag) { h += ', ' }
        h += one.eq.length + ' tw equipment sets'
        flag = 1
      }
      if (one.ds.length) {
        if (flag) { h += ', ' }
        h += one.ds.length + ' duellstat sets'
        flag = 1
      }
      td.innerHTML = h
    }
    td.innerHTML = h
    tr.appendChild(td)

    td = document.createElement('td')
    tr.appendChild(td)
    let counteq = 0

    if (one.job.length) {
      for (const jid of one.job) {
        if (counteq > 0) {
          const comma = document.createElement('span')
          comma.textContent = ', '
          td.appendChild(comma)
        }
        const jd = JobList.getJobById(jid)
        const span = document.createElement('span')
        if (!jd) {
          span.textContent = jid
        } else {
          span.className = 'TWDS_wuw_job'
          span.dataset.jid = jid
          span.dataset.name = jd.name
          span.textContent = jd.name
        }
        td.appendChild(span)
        counteq++
      }
    }
    if (one.eq.length) {
      for (const eq of one.eq) {
        // some name or number (that last is an old duelstat bug)
        if (counteq > 0) {
          const comma = document.createElement('span')
          comma.textContent = ', '
          td.appendChild(comma)
        }
        const span = document.createElement('span')
        span.textContent = eq
        span.title = 'tw equipment set'
        td.appendChild(span)
        counteq++
      }
    }
    if (one.ds.length) {
      for (const ds of one.ds) {
        // some name or hash
        if (counteq > 0) {
          const comma = document.createElement('span')
          comma.textContent = ', '
          td.appendChild(comma)
        }
        const span = document.createElement('span')
        span.textContent = ds
        span.title = 'duellstat equipment set'
        td.appendChild(span)
        counteq++
      }
    }
  }
  $(checkbox).on('change', function () {
    const checked = this.checked
    $('#TWDS_wuw_table .TWDS_wuw_job').each(function () {
      if (checked) {
        const jid = this.dataset.jid
        const jd = JobList.getJobById(jid)
        const html = '<img class="jobimg" title="' + this.dataset.name + '" src="' + Game.cdnURL + '/images/jobs/' + jd.shortname + '.png" />'
        this.innerHTML = html
      } else {
        this.textContent = this.dataset.name
      }
    })
    $('#TWDS_wuw_table .TWDS_wuw_item').each(function () {
      if (checked) {
        const id = this.dataset.itemid
        const x = new tw2widget.Item(window.ItemManager.get(id))
        if (x) {
          // x.initDisplay();
          this.innerHTML = ''
          this.appendChild(x.getMainDiv()[0])
        }
      } else {
        this.textContent = this.dataset.name
      }
    })
  })
}
TWDS.wuw.openwindow = function (scrollto) {
  const wid = 'TWDS_wuw_window'
  const win = wman.open(wid, 'set', 'TWDS_wuw')
  win.setTitle("What's used where")
  win.setMiniTitle('WUW')

  const div = document.createElement('div')
  div.id = 'TWDS_wuw'
  TWDS.wuw.initWUWDisplay(div)

  const sp = new west.gui.Scrollpane()

  sp.appendContent(div)

  win.appendToContentPane(sp.getMainDiv())

  if (scrollto) {
    const x = TWDS.q1(scrollto, win.divMain)
    if (x) {
      x.scrollIntoView(true)
    }
  }
}

TWDS.registerStartFunc(function () {
  TWDS.registerExtra('TWDS.wuw.openwindow',
    TWDS._('EXTRAS_WUW_TEXT', 'What is used where?'),
    TWDS._('EXTRAS_WUW_HELP', 'Shows which equipment is used for which job / equipment set')
  )
})

// vim: tabstop=2 shiftwidth=2 expandtab
