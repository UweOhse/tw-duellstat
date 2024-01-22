// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.maphelper = {}

TWDS.maphelper.getmap = function (factor) {
  factor = factor || 1.33

  const map = TWDS.createEle('div.map', {
    dataset: {
      factor: factor
    },
    style: {
      width: Math.round(500 * factor) + 'px',
      height: Math.round(220 * factor) + 'px',
      background: 'url(/images/map/minimap/worldmap_500.jpg) no-repeat',
      backgroundSize: 'contain',
      position: 'relative',
      overflow: 'hidden'
    }
  })
  return map
}
TWDS.maphelper.calccoords = function (map, x, y) {
  const factor = parseFloat(map.dataset.factor)
  if (typeof x === 'object') {
    y = x.y
    x = x.x
  }
  return {
    x: x * window.WORLDMAP_COEFF_500 * factor,
    y: y * window.WORLDMAP_COEFF_500 * factor
  }
}

TWDS.maphelper.drawbox = function (map, x, y, sz, title, color, rot, cladd) {
  cladd = cladd || ''
  const xy = TWDS.maphelper.calccoords(map, x, y)
  return TWDS.createEle({
    nodeName: 'div',
    className: cladd,
    title: title,
    last: map,
    style: {
      cursor: 'pointer',
      position: 'absolute',
      width: sz + 'px',
      height: sz + 'px',
      filter: 'drop-shadow(2px 2px 2px #222)',
      left: xy.x + 'px',
      backgroundColor: color,
      top: xy.y + 'px',
      rotate: rot + 'deg'
    }
  })
}
TWDS.maphelper.drawicon = function (map, x, y, src, title, cladd) {
  cladd = cladd || ''
  const xy = TWDS.maphelper.calccoords(map, x, y)
  return TWDS.createEle({
    nodeName: 'img',
    className: cladd,
    title: title,
    last: map,
    src: src,
    style: {
      cursor: 'pointer',
      position: 'absolute',
      width: '16px',
      height: 'auto',
      filter: 'drop-shadow(2px 2px 2px #222)',
      left: xy.x + 'px',
      top: xy.y + 'px'
    }
  })
}
TWDS.maphelper.drawme = function (map) {
  return TWDS.maphelper.drawicon(map,
    Character.getPosition(), null,
    '/images/map/minimap/icons/miniicon_pos.png',
    'you', 'me')
}

// vim: tabstop=2 shiftwidth=2 expandtab
