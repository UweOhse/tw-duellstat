// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.sortable = {}
TWDS.sortable.search = function (ev) { TWDS.sortable.searchReal.apply(this, ev) }
TWDS.sortable.searchReal = function (ev) {
  const tab = this.closest('table')

  let searchstring = ''
  let colsel = 'td,th'
  if (tab.dataset.searchfilter) {
    const searchfilterselector = tab.dataset.searchfilter
    searchstring = TWDS.q1(searchfilterselector, tab).value.toLocaleLowerCase()
    colsel = tab.dataset.colsel || 'td,th'
  }

  const rows = [...TWDS.q('tbody tr', tab)]
  let state = 0
  for (let i = 0; i < rows.length; i++) {
    rows[i].style.display = 'table-row'
    if (rows[i].classList.contains('sortgrouped')) {
      if (state === 1) {
        rows[i].style.display = 'none'
      }
      continue
    }
    if (searchstring === '') {
      state = 0
    } else {
      const cols = [...TWDS.q(colsel, rows[i])]
      let found = 0
      for (let j = 0; j < cols.length; j++) {
        const t = cols[j].textContent
        if (t.toLocaleLowerCase().search(searchstring) !== -1) {
          found = 1
        }
      }
      if (!found) {
        state = 1
        rows[i].style.display = 'none'
      }
    }
  }
}

TWDS.sortable.do = function (ev, forcemul) { TWDS.sortable.doReal(this, forcemul) }
TWDS.sortable.doReal = function (clickedele, forcemul) {
  const tab = clickedele.closest('table')
  const tbody = TWDS.q1('tbody', tab)
  const sel = clickedele.dataset.colsel
  const secondsel = clickedele.dataset.secondsel
  const sortmode = clickedele.dataset.sortmode || 'text'
  const rows = [...TWDS.q('tbody tr:not(.sortgrouped)', tab)]
  const cursort = tab.dataset.cursort || ''
  const curmult = parseInt(tab.dataset.curmult) || 1
  let mult = 1

  forcemul = forcemul || 0
  if (forcemul) {
    mult = forcemul
  } else {
    if (cursort === sel) { // click on the same head: reverse sort order
      mult = curmult * -1
    } else {
      // click on another head: use default sort order
      if (clickedele.dataset.sortdefaultorder) {
        mult = parseInt(clickedele.dataset.sortdefaultorder)
        if (mult !== -1) mult = 1
      }
    }
    if (tab.dataset.TWDS_ordersavekey) {
      const k = tab.dataset.TWDS_ordersavekey
      localStorage[k + '_sel'] = sel
      localStorage[k + '_mult'] = mult
    }
  }
  tab.dataset.cursort = sel
  tab.dataset.curmult = mult
  const sortfunc = function (a, b, sel) {
    const tda = TWDS.q1(sel, a)
    const tdb = TWDS.q1(sel, b)
    if (!tda) return 0
    if (!tdb) return 0
    if (tda.classList.contains('sortgrouped')) return 0
    if (tdb.classList.contains('sortgrouped')) return 0
    let va
    let vb
    if ('sortval' in tda.dataset) {
      va = tda.dataset.sortval
    } else {
      va = tda.textContent
    }
    if ('sortval' in tdb.dataset) {
      vb = tdb.dataset.sortval
    } else {
      vb = tdb.textContent
    }
    let res = 0
    if (sortmode === 'number') {
      res = parseFloat(va) - parseFloat(vb)
    } else {
      res = va.localeCompare(vb)
    }
    if (res) return mult * res

    if ('sortval2' in tda.dataset || 'sortval2' in tda.dataset) {
      if ('sortval2' in tda.dataset) {
        va = tda.dataset.sortval2
      } else {
        va = tda.textContent
      }
      if ('sortval2' in tdb.dataset) {
        vb = tdb.dataset.sortval2
      } else {
        vb = tdb.textContent
      }
      let res = 0
      if (sortmode === 'number') {
        res = parseFloat(va) - parseFloat(vb)
      } else {
        res = va.localeCompare(vb)
      }
      if (res) return mult * res
    }

    if (secondsel && sel !== secondsel) {
      return sortfunc(a, b, secondsel)
    }
    return 0
  }
  rows.sort(function (a, b) { return sortfunc(a, b, sel) })
  const urows = [...TWDS.q('tbody tr', tab)] // unsorted, all rows -> to insert the grouped rows.
  tbody.textContent = ''
  for (let i = 0; i < rows.length; i++) {
    tbody.appendChild(rows[i])
    let state = 0
    for (let j = 0; j < urows.length; j++) {
      if (state === 0 && urows[j] === rows[i]) {
        state = 1
        continue
      }
      if (state === 1 && urows[j].classList.contains('sortgrouped')) {
        tbody.appendChild(urows[j])
        continue
      }
      if (state === 1) {
        break
      }
    }
  }
}
