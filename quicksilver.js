// vim: tabstop=2 shiftwidth=2 expandtab
//

TWDS.quicksilver = {}

TWDS.quicksilver.getAdditionalClasses = function (tileX, tileY) {
  const jobs = JobList.getJobsByGroupId(this.groupId)
  const tileSize = Map.tileSize
  const pos = {
    x: tileX * tileSize + this.left,
    y: tileY * tileSize + this.top
  }
  const xtra = Map.JobHandler.Featured[pos.x + '-' + pos.y] || {}
  let flag = 0
  for (const i in jobs) {
    if (!Object.prototype.hasOwnProperty.call(jobs, i)) { continue }
    const dyn = xtra[jobs[i].id]
    if (dyn) {
      if (dyn.silver) flag |= 1
      if (dyn.gold) flag |= 2
    }
  }
  let add = ''
  if (flag & 2) add += ' TWDS_gold'
  if (flag & 1) add += ' TWDS_silver'
  return 'posx-' + pos.x +
         ' posy-' + pos.y +
         ' jobgroup jobgroup-' + this.groupId +
         add
}
TWDS.registerStartFunc(function () {
  if (!('_twds_backup_getAdditionalClasses' in Map.Component.JobGroup.prototype)) {
    Map.Component.JobGroup.prototype._twds_backup_getAdditionalClasses =
      Map.Component.JobGroup.prototype.getAdditionalClasses
  }
  TWDS.registerSetting('bool', 'quicksilver',
    TWDS._('QUICKSILVER_SETTING',
      'Mark silver and gold jobs on the world map.'),
    false, function (v) {
      if (v) {
        Map.Component.JobGroup.prototype.getAdditionalClasses = TWDS.quicksilver.getAdditionalClasses
      } else {
        Map.Component.JobGroup.prototype.getAdditionalClasses =
          Map.Component.JobGroup.prototype._twds_backup_getAdditionalClasses
      }
    }, 'Map', null)
  TWDS.registerSetting('bool', 'quicksilver_exclamation_mark',
    TWDS._('QUICKSILVER_SETTING_EXCLAMATION',
      'When marking silver and gold jobs use an exclamation mark.'),
    false, function (v) {
      if (v) {
        document.body.classList.add('TWDS_quicksilver_exclamation')
      } else {
        document.body.classList.remove('TWDS_quicksilver_exclamation')
      }
    }, 'Map', null)
})
