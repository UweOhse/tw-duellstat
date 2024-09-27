// vim: tabstop=2 shiftwidth=2 expandtab
//
//
TWDS.questexport = {}
TWDS.questexport.kb = {}
TWDS.questexport.finish = function () {
  Ajax.remoteCallMode('building_quest', 'get_solved_groups', {}, function (json) {
    const so = { }
    for (const [id, data] of Object.entries(json.solved)) {
      so[data.title.trim().toLocaleLowerCase()] = id
    }
    Ajax.remoteCallMode('building_quest', 'get_open_quests', {}, function (json) {
      for (let i = 0; i < json.quests.length; i++) {
        const data = json.quests[i]
        so[data.groupTitle.trim().toLocaleLowerCase()] = data.group
      }
      let text = '['
      for (const [kbid, title] of Object.entries(TWDS.questexport.kb)) {
        const l = title.trim().toLocaleLowerCase()
        const o = {
          qgid: 0,
          kbid: kbid,
          title: title
        }
        if (l in so) {
          o.qgid = so[l]
        }
        if (text !== '[') text += ',\n'
        text += JSON.stringify(o)
      }
      text += '\n]'
      const win = TWDS.utils.stdwindow('TWDS_questexportwindow', 'KB Quest export', 'QExport')
      const container = TWDS.utils.getcontainer(win)
      container.textContent = ''
      TWDS.createEle('pre', {
        last: container,
        textContent: text,
        style: {
          userSelect: 'text'
        }
      })
    })
  })
}
TWDS.questexport.parsepage = function (html, dosubs) {
  const base = 'https://support.innogames.com'
  const origin = new URL(document.baseURI).origin // https://en13.the-west.net

  const frag = new window.DocumentFragment()
  const body = document.createElement('body')
  frag.appendChild(body)
  body.innerHTML = html
  const as = TWDS.q('div.faq-articles-in-section-list a.list-group-item, ul.list-group-flush a.list-group-item', body)
  const rx = '/kb/TheWest/' + Game.locale + '/(\\d+)/'
  for (let i = 0; i < as.length; i++) {
    const a = as[i]
    const href = a.href
    console.log(i, 'a', a, 'href', href)
    if (!href) continue
    const m = href.match(rx)
    console.log('href', href, 'm', m)
    if (!m) continue
    const text = a.textContent.trim()
    const kbid = m[1]
    console.log('href', href, 'm', m, 'text', text)
    TWDS.questexport.kb[kbid] = text
  }
  const originrx = new RegExp('^' + origin + '/')
  if (dosubs) {
    const as = TWDS.q('ul.faq-section-buttons li.faq-section-button a', body)
    let subsdone = 0
    if (as.length === 0) {
      TWDS.questexport.finish()
    }
    for (let i = 0; i < as.length; i++) {
      const a = as[i]
      let href = a.href
      href = href.replace(originrx, base + '/')
      window._TWDS_GM_XHR({
        method: 'GET',
        url: href,
        headers: {
          'Content-Type': 'text/html'
        },
        onload: function (response) {
          TWDS.questexport.parsepage(response.responseText, false)
          subsdone++
          if (subsdone === as.length) {
            TWDS.questexport.finish()
          }
        }
      })
    }
  }
}
TWDS.questexport.doit = function () {
  if (!window._TWDS_GM_XHR) {
    console.log('window._TWDS_GM_XHR not available, cannot continue')
    return
  }
  const url = 'https://support.innogames.com/kb/TheWest/' + Game.locale + '/articles/236'

  window._TWDS_GM_XHR({
    method: 'GET',
    url: url,
    headers: {
      'Content-Type': 'text/html'
    },
    onload: function (response) {
      // console.log(response.responseText);
      TWDS.questexport.parsepage(response.responseText, true)
    }
  })
}
TWDS.registerExtra('TWDS.questexport.doit', 'Questgroup combiner', 'Find quest groups in the knowledgebase')

// vim: tabstop=2 shiftwidth=2 expandtab
