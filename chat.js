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

      const e = document.createElement('span')
      n.parentNode.insertBefore(e, n)
      n.remove()

      const s = n.textContent.split(rx)
      for (let i = 0; i < s.length; i++) {
        const t = s[i]
        let f
        if (t.match(rx2)) {
          f = document.createElement('span')
          f.className = 'TWDS_blinking TWDS_chat_highlight' // blinks for 60 seconds
          f.textContent = t
        } else {
          f = document.createTextNode(t)
        }
        e.appendChild(f)
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
      if (mut.type !== 'childList') return
      for (let i = 0; i < mut.addedNodes.length; i++) {
        const n = mut.addedNodes[i]
        if (n.nodeName !== 'DIV') continue
        for (i = 0; i < n.classList.length; i++) {
          if (n.classList[i].substring(0, 5) === 'chat_') {
            chatcontainer = n
            chatobserver.observe(n, chatcfg)
          }
        }
      }
      for (let i = 0; i < mut.removedNodes.length; i++) {
        const n = mut.removedNodes[i]
        if (n.nodeName !== 'DIV') continue
        for (i = 0; i < n.classList.length; i++) {
          if (n.classList[i].substring(0, 5) === 'chat_') {
            chatobserver.disconnect(n)
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
