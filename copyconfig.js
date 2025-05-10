// vim: tabstop=2 shiftwidth=2 expandtab
//
//
TWDS.copyclothcachedata = {}
TWDS.copyclothcachedata.load = function () {
  const parsev = function (str) {
    console.log('parsev', str)
    if (str[0] === 'v') {
      str = str.substr(1)
    }
    return parseFloat(str)
  }
  let pw = TWDS.q1('.TWDS_copyconfigwindow input.password')
  if (!pw) return
  pw = pw.value
  if (pw.trim() === '') {
    new UserMessage('You need to input a password', UserMessage.TYPE_ERROR).show()
  }
  (async function () {
    let url = 'https://ohse.de/uwe/dynamic/transferconfig.php?mode=load'
    url += '&w=' + Game.worldName
    url += '&m=' + Game.marketId
    url += '&p=' + Character.playerId
    url += '&k=' + pw
    const res = await window.fetch(url, { method: 'GET' })
    if (res.ok) {
      let data = await res.text()
      data = JSON.parse(data)
      console.log(data)
      if (data.version !== TWDS.version) {
        console.log('checkv', data.version, TWDS.version)
        if (parsev(data.version) > parsev(TWDS.version)) {
          new UserMessage('The data is from a newer clothcache version (' + data.version + '). ' +
            'Update clothcache and retry.', UserMessage.TYPE_ERROR).show()
        }
      }
      Object.entries(localStorage).forEach(function (some) {
        const k = some[0]
        if (k.startsWith('TWDS_')) {
          window.localStorage.removeItem(k)
        }
      })
      Object.entries(data).forEach(function (some) {
        const k = some[0]
        const v = some[1]
        if (k.startsWith('TWDS_')) {
          window.localStorage[k] = v
        }
      })
      TWDS.loadSettings()
      new UserMessage('Clothcache data loaded from the server.').show()
      return
    }
    let err = await res.text()
    if (!err) err = 'unknown error'
    new UserMessage('Failed to load: ' + err, UserMessage.TYPE_ERROR).show()
  })()
}
TWDS.copyclothcachedata.save = function () {
  let pw = TWDS.q1('.TWDS_copyconfigwindow input.password')
  if (!pw) return
  pw = pw.value
  if (pw.trim() === '') {
    new UserMessage('You need to input a password', UserMessage.TYPE_ERROR).show()
  }
  const l = localStorage.length
  const d = {}
  for (let i = 0; i < l; i++) {
    const k = localStorage.key(i)
    console.log('k', i, l, k)
    if (k.startsWith('TWDS_')) {
      d[k] = localStorage.getItem(k)
    }
  }
  d.date = (new Date()).getTime()
  d.version = TWDS.version
  d.world = Game.worldName
  d.market = Game.marketId
  d.player = Character.playerId;
  (async function () {
    let url = 'https://ohse.de/uwe/dynamic/transferconfig.php?mode=save'
    url += '&w=' + Game.worldName
    url += '&m=' + Game.marketId
    url += '&p=' + Character.playerId
    url += '&k=' + pw
    const res = await window.fetch(url, { method: 'POST', body: JSON.stringify(d) })
    if (res.ok) {
      new UserMessage('Clothcache data saved on the server.').show()
      return
    }
    let err = await res.text()
    if (!err) err = 'unknown error'
    new UserMessage('Failed to save: ' + err, UserMessage.TYPE_ERROR).show()
  })()
}

TWDS.copyclothcachedata.openwindow = function () {
  const win = TWDS.utils.stdwindow('TWDS_copyconfigwindow', 'Copy Clothcache Data', 'CCcD')
  const text = 'These functions allow you to all data clothcache has to another browser.' +
            'It is a multi step process:<br>' +
  '<ol>' +
  '<li>1. open the game in the old browser.' +
  "<li>2. enter a password. Let's call it TRANSFER for now (please do not use that)." +
  '<li>2. save the data to a server, using the save button below. ' +
  '<li>3. open the game in the new browser.' +
  "<li>4. enter another password. Let's call it BACKUP for now (please do not use that). " +
  '<li>5. save the data to a server, using the save button below.' +
  '<li>6. enter the first password (TRANSFER) ' +
  '<li>7. load the data from the server, using the load button below.' +
  '</ol>' +
  "If anything fails you still can try to load the backup. It shouldn't fail, but don't trust me on that.<br><br>" +
  '<b>Note: </b> Hurry a bit. The server server will remove data older than one hour.<br><br>' +
  'These functions do not allow to transfer the data between worlds. Basic functions to do that are at the end of the settings tab.'

  const container = TWDS.utils.getcontainer(win)
  container.style.userSelect = 'text'
  container.textContent = ''
  TWDS.createEle('div', {
    last: container,
    innerHTML: text
  })
  TWDS.createEle('h3', {
    textContent: 'Password',
    last: container
  })
  TWDS.createEle('input.password', {
    last: container,
    value: ''
  })
  TWDS.createEle('p', {
    last: container,
    innerHTML: 'This password protects the data. The clothcache author could see it, ' +
     'so do not, any under circumstances, re-use another password. ' +
    '<b>Please do not burden me with your TW, paypal or online banking passwords</b>.<br>' +
    "You don't need a world-class password for this."
  })
  TWDS.createEle('button.TWDS_button', {
    last: container,
    textContent: 'save',
    onclick: TWDS.copyclothcachedata.save
  })
  TWDS.createEle('button.TWDS_button', {
    last: container,
    textContent: 'load',
    onclick: TWDS.copyclothcachedata.load
  })
}
TWDS.registerExtra('TWDS.copyclothcachedata.openwindow', 'Code Clothcache data', 'Copy any clothcache data to another browser')

// vim: tabstop=2 shiftwidth=2 expandtab
