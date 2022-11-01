// vim: tabstop=2 shiftwidth=2 expandtab

TWDS.itemsettab = {}

TWDS.itemsettab.curJobDuration = 15

TWDS.itemsettab.sort = function (e) {
  const colidx = Array.prototype.indexOf.call(this.parentNode.children, this)
  let sortmode = 'a'
  if (this.dataset.sortmode === '1') { sortmode = '1' }

  let table = this.parentNode
  while (table.nodeName !== 'TABLE' && table) {
    table = table.parentNode
  }
  if (!table) return
  const tbody = TWDS.q1('tbody', table)

  const rowColl = tbody.querySelectorAll('tr')
  const rows = []
  for (let i = 0; i < rowColl.length; i++) {
    const row = rowColl[i]
    const td = row.children[colidx]

    if ('sortvalue' in td.dataset) {
      row.sortval = td.dataset.sortvalue.trim()
    } else {
      row.sortval = td.textContent.trim()
    }
    if (sortmode === '1') { row.sortval = parseFloat(row.sortval > '' ? row.sortval : '0') }
    if (!('origsortindex' in row)) {
      row.origsortindex = i
    }
    rows.push(row)
  }
  let sortdir
  if (tbody.sortmode === sortmode) {
    sortdir = tbody.sortdir * -1
  } else {
    sortdir = 1
  }
  rows.sort(function (a, b) {
    if (sortmode === 'a') {
      return sortdir * a.sortval.localeCompare(b.sortval)
    } else if (b.sortval === a.sortval) {
      return sortdir * (b.origsortindex - a.origsortindex)
    } else {
      return sortdir * (b.sortval - a.sortval)
    }
  })
  tbody.textContent = ''
  for (let i = 0; i < rows.length; i++) {
    tbody.appendChild(rows[i])
  }
  tbody.sortmode = sortmode
  tbody.sortdir = sortdir
}
TWDS.itemsettab.createfilters = function (allsets) {
  const years = {}
  const events = {}
  for (let i = 0; i < allsets.length; i++) {
    const s = allsets[i]
    const y = s.year
    const e = s.eventcode
    if (!(y in years)) { years[y] = y }
    if (!(e in events)) { events[e] = s.eventname }
  }
  const yearsoptions = [{
    nodeName: 'option',
    value: '',
    textContent: 'any Year'
  }]
  for (const y of Object.values(years)) {
    const o = {
      nodeName: 'option'
    }
    if (y > '') { o.value = y } else { o.value = 'missing' }
    o.textContent = o.value
    yearsoptions.push(o)
  }
  const eventoptions = [{
    nodeName: 'option',
    value: '',
    textContent: 'Any Event'
  }]
  for (const code of Object.keys(events)) {
    const name = events[code]
    const o = {
      nodeName: 'option'
    }
    o.value = code
    o.textContent = name
    eventoptions.push(o)
  }
  console.log('years', years, 'options', yearsoptions, 'events', eventoptions)

  const p = TWDS.createEle({
    nodeName: 'p',
    children: [
      {
        nodeName: 'span',
        textContent: 'Filter for…'
      },
      {
        nodeName: 'select',
        id: 'TWDS_itemsets_filter_function',
        children: [
          { nodeName: 'option', value: '', textContent: 'any Bonus' },
          // { nodeName: 'option', value: 'attr', textContent: 'Attributes (useless)' },
          // { nodeName: 'option', value: 'skill', textContent: 'Skills (useless)' },
          { nodeName: 'option', value: 'dollar', textContent: '$' },
          { nodeName: 'option', value: 'drop', textContent: 'Drop' },
          { nodeName: 'option', value: 'job', textContent: 'Jobpoints' },
          { nodeName: 'option', value: 'luck', textContent: 'Luck' },
          { nodeName: 'option', value: 'pray', textContent: 'Pray' },
          { nodeName: 'option', value: 'regen', textContent: 'Regeneration' },
          { nodeName: 'option', value: 'speed', textContent: 'Speed' },
          { nodeName: 'option', value: 'xp', textContent: 'XP' },
          { nodeName: 'option', value: 'fb', textContent: 'Fortbattle' }
        ]
      },
      {
        nodeName: 'select',
        id: 'TWDS_itemsets_filter_year',
        children: yearsoptions
      },
      {
        nodeName: 'select',
        id: 'TWDS_itemsets_filter_event',
        children: eventoptions
      }
    ]
  })
  return p
}
TWDS.itemsettab.fixinfo = {
  curling_set_1: { year: 2021, event: 'sale' },
  curling_set_2: { year: 2021, event: 'sale' },
  legendary_set_1: { year: 2021, event: 'sale' },
  legendary_set_2: { year: 2021, event: 'sale' },
  set_duelist: { year: 2012, event: 'xmas' },
  set_fort: { year: 2012, event: 'xmas' },
  set_fortunehunter: { year: 2012, event: 'xmas' },
  set_duelist_gun: { year: 2012, event: 'xmas' },
  set_fort_gun: { year: 2012, event: 'xmas' },
  set_fortunehunter_gun: { year: 2012, event: 'xmas' },
  set_meleeduelist: { year: 2013, event: 'easter' },
  set_rangedduelist: { year: 2013, event: 'easter' },
  set_proworker: { year: 2013, event: 'easter' },
  set_meleeduelist_horse: { year: 2013, event: 'easter' },
  set_rangedduelist_horse: { year: 2013, event: 'easter' },
  set_proworker_horse: { year: 2013, event: 'easter' },
  set_independence_1: { year: 2013, event: 'independence' },
  set_independence_2: { year: 2013, event: 'independence' },
  set_independence_3: { year: 2013, event: 'independence' },
  set_independence_gun_1: { year: 2013, event: 'independence' },
  set_independence_gun_2: { year: 2013, event: 'independence' },
  set_independence_gun_3: { year: 2013, event: 'independence' },
  set_octoberfest_4: { year: 2013, event: 'oktoberfest' },
  set_octoberfest_3: { year: 2013, event: 'oktoberfest' },
  set_octoberfest_2: { year: 2013, event: 'oktoberfest' },
  set_octoberfest_1: { year: 2013, event: 'oktoberfest' },
  set_octoberfest_gun_3: { year: 2013, event: 'oktoberfest' },
  set_octoberfest_gun_2: { year: 2013, event: 'oktoberfest' },
  set_octoberfest_gun_1: { year: 2013, event: 'oktoberfest' },
  set_octoberfest_gun_winner: { year: 2013, event: 'oktoberfest' },

  set_shop_soldier: { year: 1, event: 'shop' },
  set_shop_work: { year: 1, event: 'shop' },
  set_shop_duel: { year: 1, event: 'shop' },
  set_shop_adventure: { year: 1, event: 'shop' },
  set_shop_high: { year: 1, event: 'shop' },
  set_shop_mid: { year: 1, event: 'shop' },
  set_shop_low: { year: 1, event: 'shop' },
  bubby_set: { year: 2013, event: 'shop' },

  set_dancer: { year: 1, event: 'ingame' },
  set_farmer: { year: 1, event: 'ingame' },
  set_gentleman: { year: 1, event: 'ingame' },
  set_indian: { year: 1, event: 'ingame' },
  set_mexican: { year: 1, event: 'ingame' },
  set_pilgrim_male: { year: 1, event: 'ingame' },
  set_pilgrim_female: { year: 1, event: 'ingame' },
  set_quackery: { year: 1, event: 'ingame' },
  set_sleeper: { year: 1, event: 'ingame' },
  season_set: { year: 1, event: 'otherevent' },
  set_walker: { year: 1, event: 'ingame' },
  gold_set: { year: 1, event: 'ingame' },
  greenhorn_set: { year: 1, event: 'ingame' },
  collector_set: { year: 1, event: 'ingame' },
  set_party: { year: 1, event: 'otherevent' },
  set_parade: { year: 1, event: 'otherevent' },
  green_set_2021: { year: 1, event: 'ingame' },
  fancy_set_2021: { year: 1, event: 'ingame' },

  malachite_set_1: { year: 1, event: 'otherevent' },

  set_st_patrick: { year: 1, event: 'otherevent' },

  instance_set_1: { year: 1, event: 'adventures' },
  set_veteran_2017_1: { year: 2017, event: 'adventures' },
  set_veteran_animal_cook: { year: 2017, event: 'adventures' },

  set_xmas2013_cloth: { year: 2013, event: 'xmas' },
  set_xmas2013_tool: { year: 2013, event: 'xmas' },
  set_dedmoroz_2016_weapon: { year: 2016, event: 'xmas' },
  set_dedmoroz_2016_animal: { year: 2016, event: 'xmas' },
  set_dedmoroz_2016: { year: 2016, event: 'xmas' },

  harvets_set_2021_1: { year: 2021, event: 'otherevent' },

  set_fair: { year: 1, event: 'fair' },

  set_soap: { year: 1, event: 'otherevent' },
  labor_day: { year: 1, event: 'otherevent' },
  set_cupid: { year: 1, event: 'shop' },
  bunny_set: { year: 1, event: 'shop' },

  set_colcord: { year: 2016, event: 'sale' },
  set_wrightbrothers: { year: 2016, event: 'sale' },
  set_wright_brothers_clothes: { year: 2017, event: 'sale' },
  set_prisonbrothers_august_2017: { year: 2017, event: 'sale' },
  set_prisonbrothers_august_2017_animal: { year: 2017, event: 'sale' },
  set_carnival_2018_1: { year: 2018, event: 'ingame' },
  set_carnival_2018_2: { year: 2018, event: 'ingame' }, // one piece for bonds.
  '2018_achievement_set': { year: 2018, event: 'ingame' }, // still not complete
  '2018_10th_set_1': { year: 2018, event: 'otherevent' },
  '2018_10th_set_2': { year: 2018, event: 'otherevent' },
  '2018_10th_set_3': { year: 2018, event: 'otherevent' },
  '2018_soccer_event': { year: 2018, event: 'otherevent' },
  '2018_doldenset': { year: 2018, event: 'ingame' }, // dolden.
  gold_rush_animal: { year: 2018, event: 'otherevent' },
  gold_rush_clothes: { year: 2018, event: 'otherevent' },
  gold_rush_weapons: { year: 2018, event: 'otherevent' },
  chef_set_1: { year: 2018, event: 'sale' },
  chef_set_2: { year: 2018, event: 'sale' },
  community_events_set: { year: 2018, event: 'otherevent' },
  lucille_animal_set: { year: 2018, event: 'sale' },
  lucille_weapon_set: { year: 2018, event: 'sale' },
  black_friday_set: { year: 2018, event: 'sale' },
  spring_1_2019: { year: 2019, event: 'sale' },
  spring_2_2019: { year: 2019, event: 'sale' },
  summer_spirit: { year: 2019, event: 'sale' },
  western_friday_weapon_set: { year: 2019, event: 'sale' },
  western_friday_horse_set: { year: 2019, event: 'sale' },
  firefighter_set_1: { year: 2020, event: 'sale' },
  firefighter_set_2: { year: 2020, event: 'sale' },
  west_fun_animal_set: { year: 2020, event: 'ingame' },
  fan_collector_set: { year: 2020, event: 'ingame' },
  unique_rare_set: { year: 2020, event: 'sale' },
  harvets_2021_set_1: { year: 2020, event: 'ingame' },
  harvester_set_animal: { year: 2020, event: 'sale' },
  harvester_set_clothing: { year: 2020, event: 'sale' },
  harvester_set_weapon: { year: 2020, event: 'sale' },
  set_halloween: { year: 2020, event: 'ingame' },
  creativity_set: { year: 2020, event: 'ingame' }

}
TWDS.itemsettab.fixallsets = function (allsets) {
  for (let i = 0; i < allsets.length; i++) {
    const s = allsets[i]
    const k = s.key
    let year = ''
    let eventcode = k
    let t = k.match(/_(\d\d\d\d)_/)
    allsets[i].year = 0
    allsets[i].eventcode = ''
    if (t && t.length) {
      year = parseInt(t[1])
    } else {
      t = k.match(/(\d\d\d\d)/)
      if (t && t.length) {
        year = parseInt(t[1])
      }
    }

    // there is a set with the number 6679 in it's key:
    if (year === 0 || (year >= 2012 && year <= 2099)) {
      allsets[i].year = year
    }
    eventcode = eventcode.replace('set', '')
    eventcode = eventcode.replace('__', '_')
    eventcode = eventcode.replace(/_/g, ' ')
    eventcode = 'unknown'
    // dod, dotd, dodt ... */
    if (k.match(/(^|_)dot?dt?_/)) {
      eventcode = 'dod'
    }
    if (k.match(/_dayofthedead/)) {
      eventcode = 'dod'
    }
    // a... really.
    if (k.match(/(^|_)indep[ae]nd[ae]nce_/)) {
      eventcode = 'independence'
    }
    if (k.match(/_4july_/)) {
      eventcode = 'independence'
    }
    if (k.match(/(^|_)o[ck]toberfest[-_]/)) {
      eventcode = 'oktoberfest'
    }
    if (k.match(/_october_/)) {
      eventcode = 'oktoberfest'
    }
    if (k.match(/^okt_setwof_/)) {
      eventcode = 'oktoberfest'
    }
    if (k.match(/(^|_)easter_/)) {
      eventcode = 'easter'
    }
    if (k.match(/(^|_)valentine?s?(day)?_/)) {
      eventcode = 'valentine'
    }
    if (k.match(/(^|_)(holiday|christmas|xmas\d+)_/)) {
      eventcode = 'xmas'
    }
    if (k.match(/(^|_)sale(_|$)/)) {
      eventcode = 'sale'
    }
    if (k.match(/(^|_)fair_/)) {
      eventcode = 'fair'
    }
    if (k.match(/(^|_)(ifbc\d*|speedworld)_/)) {
      eventcode = 'otherevent'
    }
    if (k.match(/(^|_)eire/)) {
      eventcode = 'otherevent'
    }
    if (k.match(/^community_event_.*_march/)) {
      eventcode = 'otherevent'
    }
    allsets[i].eventcode = eventcode
    if (k in TWDS.itemsettab.fixinfo) {
      allsets[i].eventcode = TWDS.itemsettab.fixinfo[k].event
      allsets[i].year = TWDS.itemsettab.fixinfo[k].year
    }
    allsets[i].eventname = 'Unknown'
    switch (allsets[i].eventcode) {
      case 'oktoberfest': allsets[i].eventname = 'Oktoberfest'; break
      case 'dod': allsets[i].eventname = 'Day of the dead'; break
      case 'independence': allsets[i].eventname = '4th of july'; break
      case 'easter': allsets[i].eventname = 'Easter'; break
      case 'valentine': allsets[i].eventname = 'Valentine day'; break
      case 'sale': allsets[i].eventname = 'Sale'; break
      case 'shop': allsets[i].eventname = 'Shop'; break
      case 'xmas': allsets[i].eventname = 'Christmas'; break
      case 'ingame': allsets[i].eventname = 'Ingame'; break
      case 'otherevent': allsets[i].eventname = 'Other events'; break
      case 'adventures': allsets[i].eventname = 'Adventures'; break
      case 'fair': allsets[i].eventname = 'Fair'; break
    }
  }
  let last = 0
  for (let i = 0; i < allsets.length; i++) {
    allsets[i].lastyear = last
    if (allsets[i].year) {
      last = allsets[i].year
    }
  }
  let next = 0
  for (let i = allsets.length - 1; i >= 0; i--) {
    allsets[i].nextyear = next
    if (allsets[i].year) {
      next = allsets[i].year
    }
  }
  for (let i = allsets.length - 1; i >= 0; i--) {
    if (allsets[i].year === 0) {
      if (allsets[i].lastyear > 0 && allsets[i].lastyear === allsets[i].nextyear) {
        allsets[i].year = allsets[i].lastyear
      }
    }
  }
  return allsets
}
TWDS.itemsettab.getContent1 = function () {
  let allsets = west.storage.ItemSetManager._setArray.slice(0)
  const div = TWDS.createEle('div')
  const but = TWDS.createEle({
    nodeName: 'button',
    id: 'TWDS_itemsettable_download',
    style: {
      float: 'right'
    },
    textContent: 'download unfiltered table'
  })
  div.appendChild(but)
  const butplus = TWDS.createEle({
    nodeName: 'button',
    id: 'TWDS_itemsettable_plus',
    style: {
      float: 'right'
    },
    textContent: '+',
    title: 'increase the font size'
  })
  div.appendChild(butplus)
  const butminus = TWDS.createEle({
    nodeName: 'button',
    id: 'TWDS_itemsettable_minus',
    style: {
      float: 'right'
    },
    textContent: '-',
    title: 'decrease the font size'
  })
  div.appendChild(butminus)

  const h3 = TWDS.createEle({
    nodeName: 'h3',
    textContent: 'All item sets'
  })
  div.appendChild(h3)

  allsets = TWDS.itemsettab.fixallsets(allsets)
  div.appendChild(TWDS.itemsettab.createfilters(allsets))

  const table = TWDS.createEle({
    nodeName: 'table',
    id: 'TWDS_itemset_table'
  })
  div.appendChild(table)

  const thead = TWDS.createEle({
    nodeName: 'thead'
  })
  table.appendChild(thead)
  const tbody = TWDS.createEle({
    nodeName: 'tbody'
  })
  table.appendChild(tbody)
  const makehead = function () {
    const sorter = TWDS.itemsettab.sort
    const h1 = TWDS.createEle({
      nodeName: 'tr',
      className: 'colspanrow',
      children: [
        { nodeName: 'th' },
        { nodeName: 'th', colSpan: 2, textContent: 'Key' },
        { nodeName: 'th' }, // #
        { nodeName: 'th' },
        { nodeName: 'th' },
        { nodeName: 'th' }, // $
        { nodeName: 'th' }, //
        { nodeName: 'th' }, //
        { nodeName: 'th' }, //
        { nodeName: 'th' }, //
        { nodeName: 'th' }, //
        { nodeName: 'th' }, //
        { nodeName: 'th', colSpan: 4, textContent: 'Fortbattle' },
        { nodeName: 'th' } //
      ]
    })
    const h2 = TWDS.createEle({
      nodeName: 'tr',
      children: [
        {
          nodeName: 'th',
          textContent: 'Name',
          className: 'sortable',
          dataset: { sortmode: 'a' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'Year',
          className: 'sortable',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'Event',
          title: 'Or the key of the set.',
          dataset: { sortmode: 'a' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: '#',
          title: 'Number of items',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'Attr',
          title: 'Bonus to the four attributes.',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'Skills',
          title: 'Bonus to the skills.',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: '$',
          title: 'Dollar',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'Drop',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'JP',
          title: 'Job-Points for all jobs only. Points for special jobs are not counted.',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'Luck',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'Pray',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'Regen',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'Speed',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'XP',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'Off',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'Def',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'Dmg',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: 'Res',
          dataset: { sortmode: '1' },
          onclick: sorter
        },
        {
          nodeName: 'th',
          textContent: '?',
          title: 'A hint will be shown here if there are any problems.',
          dataset: { sortmode: 'a' },
          onclick: sorter
        }
      ]
    })
    return [h1, h2]
  }
  const heads = makehead()
  thead.appendChild(heads[0])
  thead.appendChild(heads[1])
  const logged = {}
  for (let i = allsets.length - 1; i >= 0; i--) {
    const s = allsets[i]
    const k = s.key
    const year = allsets[i].year
    const eventcode = allsets[i].eventcode
    const eventname = allsets[i].eventname
    const itemSet = west.storage.ItemSetManager.get(k)
    const setBonuses = itemSet.getMergedStages(s.items.length)
    const fuddle = {
      fixed: 0,
      perlevel: 0,
      rounding: '',
      total: 0
    }
    const sum = {
      drop: Object.assign({}, fuddle),
      dollar: Object.assign({}, fuddle),
      job: Object.assign({}, fuddle),
      jobmisc: Object.assign({}, fuddle),
      luck: Object.assign({}, fuddle),
      pray: Object.assign({}, fuddle),
      regen: Object.assign({}, fuddle),
      speed: Object.assign({}, fuddle),
      experience: Object.assign({}, fuddle),
      fb_resistance: Object.assign({}, fuddle),
      fb_defense: Object.assign({}, fuddle),
      fb_offense: Object.assign({}, fuddle),
      fb_damage: Object.assign({}, fuddle)
    }
    for (let j = 0; j < window.CharacterSkills.allAttrKeys.length; j++) {
      const y = window.CharacterSkills.allAttrKeys[j]
      sum[y] = Object.assign({}, fuddle)
    }
    for (let j = 0; j < window.CharacterSkills.allSkillKeys.length; j++) {
      const y = window.CharacterSkills.allSkillKeys[j]
      sum[y] = Object.assign({}, fuddle)
    }

    let notice = ''
    for (let j = 0; j < setBonuses.length; j++) {
      const bonus = setBonuses[j]
      let onenote = ''
      if (bonus.type === 'character') {
        const type = bonus.bonus.type

        if (bonus.key !== 'level') {
          onenote = 'unknown bonus.key ' + bonus.key + '.'
        } else if (type === 'attribute' || type === 'skill') {
          const name = bonus.bonus.name
          sum[name].perlevel += bonus.bonus.value
          sum[name].rounding += bonus.roundingMethod
        } else if (type === 'job' && bonus.bonus.job === 'all') {
          sum.job.perlevel += bonus.bonus.value
          sum.job.rounding += bonus.roundingMethod
        } else if (type === 'job') {
          sum.jobmisc.perlevel += bonus.bonus.value
          sum.jobmisc.rounding += bonus.roundingMethod
        } else if (type === 'fortbattle') {
          const k3 = 'fb_' + bonus.bonus.name
          if (k3 in sum) {
            sum[k3].perlevel += bonus.bonus.value
            sum[k3].rounding += bonus.roundingMethod
          } else {
            onenote += 'unkn. fortbattle bonus.bonus.name ' + bonus.bonus.name + '.'
          }
        } else if (type in sum) {
          sum[type].perlevel += bonus.bonus.value
          sum[type].rounding += bonus.roundingMethod
        } else {
          onenote += 'unkn. bonus.bonus.type ' + type + '.'
        }
      } else if (bonus.type === 'fortbattle') {
        const k2 = 'fb_' + bonus.name
        if (k2 in sum) {
          sum[k2].fixed += bonus.value
        } else {
          onenote += 'unkn. fortbattle bonus.name ' + bonus.name + '.'
        }
      } else if (bonus.type === 'job') {
        if (bonus.job === 'all') { // do not yount labor points for special jobs
          sum.job.fixed += bonus.value
        } else {
          sum.jobmisc.fixed += bonus.value
        }
      } else if (bonus.type === 'skill' || bonus.type === 'attribute') {
        sum[bonus.name].fixed += bonus.value
      } else if (bonus.type in sum) {
        sum[bonus.type].fixed += bonus.value
      } else {
        onenote += 'unkn. bonus.type ' + bonus.type + '.'
      }
      if (onenote > '') {
        const h = TWDS.cyrb53(onenote)
        if (!(h in logged)) {
          logged[h] = true
          console.log('failed to understand bonus.', onenote, k, bonus)
        }
      }
      if (notice > '') notice += ' '
      notice += onenote
    }

    for (const f of Object.keys(sum)) {
      let method = sum[f].rounding
      const vario = sum[f].perlevel
      const fixed = sum[f].fixed
      if (method === 'floatceil') { method = 'ceil' }
      if (method > '') {
        sum[f].total = fixed + Math[method](Character.level * vario)
      } else {
        sum[f].total = fixed + (Character.level * vario)
      }
    }

    let sumattributes = 0
    for (let j = 0; j < window.CharacterSkills.allAttrKeys.length; j++) {
      const y = window.CharacterSkills.allAttrKeys[j]
      sumattributes += sum[y].total
    }
    let sumskills = 0
    for (let j = 0; j < window.CharacterSkills.allSkillKeys.length; j++) {
      const y = window.CharacterSkills.allSkillKeys[j]
      sumskills += sum[y].total
    }

    // filter out the sets for one person
    if (k === 'set_damed') {
      console.log('damed', s, sum)
    }
    if (k.match(/^friendship_set_/)) {
      continue
    }
    if (s.items.length === 10) {
      if (sumattributes === 20 && sumskills === 53 && Math.abs(sum.speed.total - 0.2) < 0.01) {
        continue
      }
      if (sumattributes === 20 && sumskills === 73 && sum.speed.total < 0.01) {
        continue
      }
    }

    const muddle = function (data, post, factor, fnkey, hint) {
      const text = (factor * data.total * 1.0).toFixed(1) + '' + post
      let title = '<b>' + (factor * data.total * 1.0).toFixed(1) + '' + post + '</b>'
      let cn = ''
      if (data.perlevel) {
        title += '<hr>'
        title += (factor * data.perlevel * 1.0).toFixed(1) + '' + post + ' per level.'
        cn += 'perlevel'
        if (data.fixed) {
          title += (factor * data.fixed * 1.0).toFixed(1) + '' + post + ' fixed.'
        }
      }

      const out = {
        nodeName: 'td',
        textContent: text,
        title: title,
        className: cn,
        dataset: {
          sortvalue: data.total,
          fn: fnkey
        }
      }
      return out
    }
    const muddlea = function (total, data, keys, post, factor, fnkey, hint) {
      const text = (factor * total) + '' + post
      let title = '<b>' + (factor * total * 1.0).toFixed(1) + '' + post + '</b>'
      const cn = ''
      let didhr = 0
      for (let j = 0; j < keys.length; j++) {
        const y = keys[j]
        if (!didhr) {
          title += '<hr>'
          didhr = 1
        }
        if (data[y].perlevel) {
          title += (factor * data[y].perlevel).toFixed(1) + '' + post + ' ' + y + ' per level.<br>'
        }
        if (data[y].fixed) {
          title += (factor * data[y].fixed).toFixed(1) + '' + post + ' ' + y + '<br>'
        }
      }

      const out = {
        nodeName: 'td',
        textContent: text,
        title: title,
        className: cn,
        dataset: {
          sortvalue: data.total,
          fn: fnkey
        }
      }
      return out
    }
    if (k === 'instance_set_1') {
      console.log('Bandit', sum)
    }

    const tr = TWDS.createEle({
      nodeName: 'tr',
      dataset: {
        year: year,
        event: eventcode
      },
      children: [
        {
          nodeName: 'th',
          textContent: s.name,
          className: 'setname',
          dataset: {
            setkey: k
          }
        },
        { nodeName: 'td', textContent: year },
        { nodeName: 'td', textContent: eventname, title: k },
        { nodeName: 'td', textContent: s.items.length },
        muddlea(sumattributes, sum, window.CharacterSkills.allAttrKeys, '', 1, 'attr'),
        muddlea(sumskills, sum, window.CharacterSkills.allSkillKeys, '', 1, 'skill'),
        muddle(sum.dollar, '%', 100, 'dollar'),
        muddle(sum.drop, '%', 100, 'drop'),
        muddle(sum.job, '', 1, 'job'),
        muddle(sum.luck, '%', 100, 'luck'),
        muddle(sum.pray, '', 100, 'pray'),
        muddle(sum.regen, '%', 100, 'regen'),
        muddle(sum.speed, '%', 100, 'speed'),
        muddle(sum.experience, '%', 100, 'xp'),
        muddle(sum.fb_offense, '', 1, 'fb'),
        muddle(sum.fb_defense, '', 1, 'fb'),
        muddle(sum.fb_damage, '', 1, 'fb'),
        muddle(sum.fb_resistance, '', 1, 'fb'),
        {
          nodeName: 'td',
          style: {
            color: 'red'
          },
          textContent: (notice > '' ? '!' : ''),
          title: notice
        }
      ]
    })
    tbody.appendChild(tr)
    /*
     * west.storage.ItemSetManager.get(item.set);
     * var cnt = itemSet.getWornItems().length;
     * var setBonuses = itemSet.getMergedStages(cnt);
     */
  }
  console.log('itemsettable created')
  TWDS.q1('#TWDS_itemsets_filter_year', div).addEventListener('change', function (e) {
    TWDS.itemsettab.dofilter()
  })
  TWDS.q1('#TWDS_itemsets_filter_function', div).addEventListener('change', function (e) {
    TWDS.itemsettab.dofilter()
  })
  TWDS.q1('#TWDS_itemsets_filter_event', div).addEventListener('change', function (e) {
    TWDS.itemsettab.dofilter()
  })
  TWDS.q1('#TWDS_itemsettable_download', div).addEventListener('click', function (e) {
    TWDS.download_table('itemsets', '#TWDS_tab_itemsets')
  })
  TWDS.q1('#TWDS_itemsettable_plus', div).addEventListener('click', function (e) {
    TWDS.itemsets_fontsize(+1)
  })
  TWDS.q1('#TWDS_itemsettable_minus', div).addEventListener('click', function (e) {
    TWDS.itemsets_fontsize(-1)
  })
  console.log('itemsettab done, dofilter version')
  const h4 = TWDS.createEle({
    nodeName: 'h4',
    textContent: 'A bit of documentation'
  })
  div.appendChild(h4)
  const ul = TWDS.createEle('ul')
  div.appendChild(ul)
  let li = TWDS.createEle({
    nodeName: 'li',
    textContent: 'The table shows informations about the item sets in the game. ' +
     "It does not currently account for the items. Most data is updated as soon as the server is updated, so it's quite current. The only exceptions are the year and the event name, since these are inferred from the set key (a quite difficult thing not following any scheme). So it might be possibly that the year is missing or the event is unknown. Sorry for that, i'll add an exception to the code some time in the far future."
  })
  ul.appendChild(li)
  li = TWDS.createEle({
    nodeName: 'li',
    textContent: 'The table does not show the personal or friendship sets made for one person alone (these are honor sets, not practically useful).'
  })
  ul.appendChild(li)
  li = TWDS.createEle({
    nodeName: 'li',
    textContent: 'Your level will be used for level dependent calculations.'
  })
  ul.appendChild(li)
  li = TWDS.createEle({
    nodeName: 'li',
    textContent: 'The rounding for attributes and skills does not follow the standard of the game. The number shown is the rounded sum of attributes / skills, not the sum of the rounded attributes / skills. I might change it in the future.'
  })
  ul.appendChild(li)
  li = TWDS.createEle({
    nodeName: 'li',
    textContent: 'The filters work subtractive: if you filter for dollar and 2017, you will got the dollar bonus sets of 2017, not all dollar bonus sets plus all sets from 2017.'
  })
  ul.appendChild(li)
  return div
}
TWDS.itemsets_fontsize = function (delta) {
  const t = window.getComputedStyle(TWDS.q1('#TWDS_itemset_table td'))
  let fs = 0
  if ('fontSize' in t) {
    fs = parseInt(t.fontSize)
  } else {
    fs = 13
  }
  fs += delta
  if (fs < 9) fs = 9
  if (fs > 29) fs = 29
  TWDS.q1('#TWDS_itemset_table').style.fontSize = fs + 'px'
}
// this is for TWDS.reload. getContent is referenced, genContent1 is accessed by name,
// so we can exchange it at runtime.
TWDS.itemsettab.getContent = function () {
  return TWDS.itemsettab.getContent1()
}
TWDS.itemsettab.dofilter = function () {
  const wantyear = TWDS.q1('#TWDS_itemsets_filter_year').value
  const wantfunction = TWDS.q1('#TWDS_itemsets_filter_function').value
  const wantevent = TWDS.q1('#TWDS_itemsets_filter_event').value
  const tr = TWDS.q('#TWDS_itemset_table tbody tr')
  console.log('filtering', wantfunction, wantyear)
  for (let i = 0; i < tr.length; i++) {
    tr[i].style.display = 'table-row'
    if (wantyear === 'missing') {
      const y = parseInt(tr[i].dataset.year)
      if (y !== 0) {
        tr[i].style.display = 'none'
        continue
      }
    } else if (wantyear > '') {
      const y = parseInt(tr[i].dataset.year)
      if (parseInt(wantyear) !== y) {
        tr[i].style.display = 'none'
        continue
      }
    }
    if (wantevent > '') {
      if (tr[i].dataset.event !== wantevent) {
        tr[i].style.display = 'none'
        continue
      }
    }
    if (wantfunction > '') {
      const td = TWDS.q1('td[data-fn=' + wantfunction + ']', tr[i])
      if (!td) {
        // huh?
        continue
      }
      const v = td.textContent
      if (v === '') {
        tr[i].style.display = 'none'
        continue
      }
    }
  }
}
TWDS.itemsettab.activate = function () {
  TWDS.activateTab('itemsets')
  const tab = TWDS.q1('#TWDS_itemset_table')
  if (window.TWX) {
    tab.classList.add('with-twx')
    tab.addEventListener('click', function (e) {
      const t = e.target
      if (t.classList.contains('setname')) {
        if (window.TWX) {
          window.TWX.GUI.makeList()
          window.TWX.GUI.open('openBonusWindow', t.dataset.setkey, 'SetBonus')
        }
      }
    })
  }
}

TWDS.itemsettab.startFunction = function () {
  TWDS.registerTab('itemsets',
    TWDS._('TABNAME_SETS', 'Sets'),
    TWDS.itemsettab.getContent,
    TWDS.itemsettab.activate,
    true)
}
TWDS.registerStartFunc(TWDS.itemsettab.startFunction)
