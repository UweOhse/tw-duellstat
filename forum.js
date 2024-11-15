// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.forum = {}
TWDS.forum.onload = function (ev, data) {
  const iframe = TWDS.q1("iframe[src='forum.php']")
  if (!iframe) return
  const body = iframe.contentDocument.body
  if (!body) return
  const overview = TWDS.q1('#thread_overview', body)
  if (!overview) {
    // we are in a thread
    const rows = TWDS.q('.fancytable.thread .trows .tbody .rows .row', body)
    if (rows.length) {
      setTimeout(function () {
        rows[rows.length - 1].scrollIntoView()
        const pa = iframe.closest('.tw2gui_window_content_pane')
        if (pa) {
          const sp = TWDS.q1('.tw2gui_scrollbar .tw2gui_scrollbar_pulley', pa)
          if (sp) {
            sp.style.top = 'calc(100% - ' + sp.style.height + ')'
          }
        }
      }, 250)
    }
    return
  }

  const lastpost = TWDS.q1('.TWDS_lastpost', body)
  if (lastpost) return

  const rows = TWDS.q('.row', body)
  rows.forEach(function (row) {
    const cell4 = TWDS.q1('.cell_4', row)
    if (!cell4) return

    // var r = e(this).find(".cell_1 a").attr("onclick").match(/\d+/);
    const a = TWDS.q1('.cell_1 a', row)
    const thread = a.onclick.toString().match(/\d+/)

    // e(this).find(".cell_3").append('<img src="' + TWDB.images.lastpost + '" class="twdb_lastpost" style="position:absolute;cursor:pointer;margin-left:3px;" onclick="Forum.openThread(' + r + ", " + n + ')"></img>')
    const count = cell4.textContent
    cell4.innerHTML = "<a class='TWDS_lastpost' onclick='Forum.openThread(" + thread + ",\"last\",\"#quickreply\")'>" + count + '</a>'
  })
}
TWDS.forum.init = function (active) {
  window.ForumWindow.TWDS_backup_open = window.ForumWindow.TWDS_backup_open || window.ForumWindow.open
  if (active) {
    window.ForumWindow.open = function () {
      const out = window.ForumWindow.TWDS_backup_open.apply(this, arguments)
      // $("iframe[src='forum.php']").on("load", 0, i)
      const iframe = TWDS.q1("iframe[src='forum.php']")
      if (iframe) {
        iframe.onload = TWDS.forum.onload
      }
      return out
    }
  } else {
    window.ForumWindow.open = window.ForumWindow.TWDS_backup_open
  }
}
TWDS.registerStartFunc(function () {
  TWDS.registerSetting('bool', 'forum_lastpage',
    TWDS._('FORUM_SETTING_LASTPAGE', 'Add a link to the last page of a forum thread.'),
    true, TWDS.forum.init)
})
