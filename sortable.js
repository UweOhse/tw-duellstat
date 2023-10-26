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

TWDS.sortable.do = function (ev) { TWDS.sortable.doReal.apply(this, ev) }
TWDS.sortable.doReal = function (ev) {
  const tab = this.closest('table')
  const tbody = TWDS.q1('tbody', tab)
  const sel = this.dataset.colsel
  const secondsel = this.dataset.secondsel
  const sortmode = this.dataset.sortmode || 'text'
  const rows = [...TWDS.q('tbody tr:not(.sortgrouped)', tab)]
  const cursort = tab.dataset.cursort || ''
  let mult = 1
  if (this.dataset.sortdefaultorder) {
    mult = parseInt(this.dataset.sortdefaultorder)
    if (mult !== -1) mult = 1
  }
  if (cursort === sel) {
    mult *= -1
    tab.dataset.cursort = ''
  } else {
    tab.dataset.cursort = sel
  }
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
