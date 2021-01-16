TWDS.translation = {}
TWDS.lang = null
// this once read the translation, now it just links.
TWDS.fixTranslation = function fixTranslation () {
  let l = Game.locale
  l = l.replace(/-.*/, '')
  l = l.replace(/_.*/, '')
  const s = 'translation_' + l
  if (s in TWDS) {
    TWDS.translation = TWDS[s]
    TWDS.lang = l
  }
}
TWDS._ = function _ (s, def, para) {
  let work
  if (TWDS.lang === null) {
    TWDS.fixTranslation()
  }
  if (s in TWDS.translation) {
    work = TWDS.translation[s]
  } else {
    work = def
    if (TWDS.lang !== 'en') {
      console.log('_', 'using default translation for ', s, '=', def)
    }
  }
  if (typeof para !== 'undefined') {
    for (const i of Object.keys(para)) {
      work = work.replace(`$${i}$`, para[i])
    }
  }
  return work
}
