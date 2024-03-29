// vim: tabstop=2 shiftwidth=2 expandtab
//
if (TWDS.plusminus) {
  document.body.removeEventListener('wheel', TWDS.plusminus.wheel)
}
TWDS.plusminus = {}
TWDS.plusminus.wheel = function (ev) {
  let sb = ev.target.closest('.pm_skillbox')
  let isattr = false
  if (!sb) {
    sb = ev.target.closest('.sk_attr_arrow')
    if (sb) { isattr = true }
  }
  if (sb) {
    let sel = ''
    if (ev.deltaY > 0) {
      sel = '.butMinus'
      if (isattr) {
        // i don't know why that this is done this way. Avoiding some default handling?
        const tmp = TWDS.q1('.sk_attr_minusbutton', sb.parentNode) // skills window
        if (tmp) {
          sb = sb.parentNode
          sel = '.sk_attr_minusbutton'
        }
      }
    } else if (ev.deltaY < 0) {
      sel = '.butPlus'
      if (isattr) {
        const tmp = TWDS.q1('.sk_attr_plusbutton', sb.parentNode) // shaman window
        if (tmp) {
          sb = sb.parentNode
          sel = '.sk_attr_plusbutton'
        }
      }
    }
    if (sel) {
      const ele = TWDS.q1(sel, sb)
      if (ele && 1) {
        const event = new window.Event('click', { bubbles: true })
        ele.dispatchEvent(event)
      }
    }
  }
}
TWDS.plusminus.startfunc = function () {
  document.body.removeEventListener('wheel', TWDS.plusminus.wheel)
  document.body.addEventListener('wheel', TWDS.plusminus.wheel)
}
TWDS.registerStartFunc(function () {
  TWDS.plusminus.startfunc()
})
// vim: tabstop=2 shiftwidth=2 expandtab
