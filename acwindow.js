// vim: tabstop=2 shiftwidth=2 expandtab
TWDS.acwindow = {}
TWDS.acwindow.findthething = function (parts) {
  const all = ItemManager.getAll()
  for (const it of Object.values(all)) {
    if (it.type !== 'yield') continue
    if (it.usetype !== 'use') continue
    if (it.usetype !== 'use') continue
    // console.log("check",it);
    let foundnum = 0
    for (let j = 0; j < parts.length; j++) {
      const p = parts[j]
      let foundthis = 0
      for (let k = 0; k < it.usebonus.length; k++) {
        if (it.usebonus[k].includes(p)) { foundthis++ }
      }
      if (foundthis === 1) { foundnum++ }
    }
    // console.log("result",it,foundnum);
    if (foundnum === parts.length) {
      return it
    }
  }
  return null
}
TWDS.acwindow.updateContent1 = function (list) {
  for (let i = 0; i < list.length; i++) {
    const m = list[i].meta
    const d = document.createElement('div')
    d.innerHTML = list[i].meta
    const spans = TWDS.q('span', d)
    const all = []
    for (let j = 0; j < spans.length; j++) {
      const span = spans[j]
      const ti = span.title
      all.push(ti)
    }
    const thing = TWDS.acwindow.findthething(all)
    if (thing) {
      const acele = TWDS.q1('#achievement_' + list[i].id)
      if (acele) {
        const icf = TWDS.q1('.achievement_icon_frame', acele)
        if (icf) { icf.title = new ItemPopup(thing).popup.text }
        const shi = TWDS.q1('.achievement_shield', acele)
        if (shi) { shi.title = new ItemPopup(thing).popup.text }
        const meta = TWDS.q1('.achievement_meta', acele)
        if (meta) {
          TWDS.createEle('div', {
            last: meta,
            innerHTML: new ItemPopup(thing).popup.text
          })
        }
      }
    } else {
      console.log('failed to find collector card info for', list[i], all, m, d, spans)
    }
  }
}
TWDS.acwindow.updateContent = function (data) {
  this.TWDS_backup_updateContent(data)
  if (data.folder.id === 'collection_pictures') {
    console.log('mything')
    TWDS.acwindow.updateContent1(data.achievements.progress)
    TWDS.acwindow.updateContent1(data.achievements.finished)
  }
}
TWDS.acwindow.open = function (userid, tab) {
  console.log('ACWINDOW.OPEN', 'p', userid, 't', tab)
  const instance = window.AchievementWindow.TWDS_backup_open.call(userid, tab)
  instance.Explorer.TWDS_backup_updateContent = instance.Explorer.TWDS_backup_updateContent || instance.Explorer.updateContent
  instance.Explorer.updateContent = TWDS.acwindow.updateContent
}
TWDS.acwindow.startfunc = function () {
  window.AchievementWindow.TWDS_backup_open = window.AchievementWindow.TWDS_backup_open || window.AchievementWindow.open
  window.AchievementWindow.open = TWDS.acwindow.open
}
TWDS.registerStartFunc(TWDS.acwindow.startfunc)
