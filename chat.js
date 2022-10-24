// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.registerSetting('string', 'chat_highlight',
  'A javascript regular expression. Matching parts of incoming chat messages will be highlighted.', ''
)
// mark some strings in the chat as soon as they come.
TWDS.chatInit = function () {
  let rx, rx2
  const chatcfg = {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true
  }
  const recurse = function (n) {
    if (n.nodeType === 3) {
      if (!n.textContent.match(rx)) return

      console.log('got textNode with match', n)
      const e = document.createElement('span')
      n.parentNode.insertBefore(e, n)
      n.remove()
      console.log('created e', e)

      const s = n.textContent.split(rx)
      console.log('split is', s)
      for (let i = 0; i < s.length; i++) {
        const t = s[i]
        let f
        console.log('handling split #', i, t)
        if (t.match(rx2)) {
          f = document.createElement('span')
          f.className = 'TWDS_blinking TWDS_chat_highlight' // blinks for 60 seconds
          f.textContent = t
          console.log('  created a color span')
        } else {
          f = document.createTextNode(t)
          console.log('  created a text node')
        }
        e.appendChild(f)
        console.log('appended f', f)
      }
    } else if (n.nodeType === 1) {
      for (let i = 0; i < n.childNodes.length; i++) {
        recurse(n.childNodes[i])
      }
    }
  }
  let chatcontainer
  const chatobserver = new window.MutationObserver(function (mutations) {
    const tohighlight = TWDS.settings.chat_highlight.trim()
    if (tohighlight === '') return
    rx = new RegExp('(' + tohighlight + ')', 'i')
    rx2 = new RegExp('^(' + tohighlight + ')$', 'i')
    chatobserver.disconnect()
    mutations.forEach(function (mut) {
      console.log('mutation', mut)
      if (mut.type !== 'childList') return
      if (mut.addedNodes.length === 0) return
      for (let i = 0; i < mut.addedNodes.length; i++) {
        const n = mut.addedNodes[i]
        if (n.nodeName !== 'TABLE') continue
        const tn = n.querySelector('.chat_text') // this might contain some divs.
        recurse(tn)
      }
    })
    chatobserver.observe(chatcontainer, chatcfg)
  })

  // first we need to find a chat window. do that with an observer
  const windowscfg = {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: false
  }

  const windows = document.querySelector('#windows')
  if (!windows) {
    setTimeout(TWDS.chatInit, 1000)
    return
  }
  const windowsobserver = new window.MutationObserver(function (mutations) {
    mutations.forEach(function (mut) {
      console.log('windows-mutation', mut)
      if (mut.type !== 'childList') return
      for (let i = 0; i < mut.addedNodes.length; i++) {
        const n = mut.addedNodes[i]
        if (n.nodeName !== 'DIV') continue
        for (i = 0; i < n.classList.length; i++) {
          if (n.classList[i].substring(0, 5) === 'chat_') {
            chatcontainer = n
            chatobserver.observe(n, chatcfg)
            console.log('started to observe', n)
          }
        }
      }
      for (let i = 0; i < mut.removedNodes.length; i++) {
        const n = mut.removedNodes[i]
        if (n.nodeName !== 'DIV') continue
        for (i = 0; i < n.classList.length; i++) {
          if (n.classList[i].substring(0, 5) === 'chat_') {
            chatobserver.disconnect(n)
            console.log('stopped to observe', n)
          }
        }
      }
    })
  })
  windowsobserver.observe(windows, windowscfg)
}
TWDS.registerStartFunc(function () {
  TWDS.chatInit()
})

// vim: tabstop=2 shiftwidth=2 expandtab
