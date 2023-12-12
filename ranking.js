// vim: tabstop=2 shiftwidth=2 expandtab
//
TWDS.ranking = {}
TWDS.ranking.config = [
  { key: 'Experience', fields: ['experience'], mainfield: 'experience' },
  { key: 'Duels', fields: ['experience', 'duel_win', 'duel_loss', 'difference'], mainfield: 'experience' },
  { key: 'FortBattles', fields: ['damage_dealt', 'score', 'dodges', 'hits_taken'], mainfield: 'score' },
  { key: 'Crafting', fields: ['items_created', 'learnt_recipes', 'score', 'profession_skill'] },
  { key: 'Construction', fields: ['fair_points', 'stage_ups', 'total_cp'], mainfield: 'total_cp' },
  { key: 'Adventures', fields: ['friendly_dmg', 'games_played', 'knockouts', 'total_actions', 'rage_quits'] },
  { key: 'Achievements', fields: ['achievements', 'points', 'worlds_first'], mainfield: 'points' },
  { key: 'Cities', fields: ['points', 'sum_points', 'fort_points', 'member_level_points', 'duel_diff_points', 'member_count', 'mean_level'], mainfield: 'sum_points' },
  { key: 'Skills', fields: ['skill_level'] }
]
/* just to document it: this cannot show the diff of the first player on page 2 to the last on page 1.... */
TWDS.ranking.manipulate = function (bedata, keys, mainfield) {
  if (!bedata.error && bedata.ranking) { // dodge, shoot comes without error or ranking, but with msg
    let lastv
    for (let i = 0; i < bedata.ranking.length; i++) {
      for (let j = 0; j < keys.length; j++) {
        const k = keys[j]
        const v = bedata.ranking[i][k]
        bedata.ranking[i][k] = window.format_number(v)
        if (k === mainfield && i) {
          bedata.ranking[i][k] = '<span' +
            " title='" + window.format_number(lastv - v) + "'" +
            '>' + window.format_number(v) + '</span>'
        }
        lastv = v
      }
    }
  }
}

TWDS.ranking.startfunc = function () {
  for (let i = 0; i < TWDS.ranking.config.length; i++) {
    const c = TWDS.ranking.config[i]
    if (!('TWDS_backup_updateTable' in window.RankingWindow[c.key])) {
      console.log('backing up', c.key, window.RankingWindow[c.key])
      window.RankingWindow[c.key].TWDS_backup_updateTable = window.RankingWindow[c.key].updateTable
    }
    window.RankingWindow[c.key].updateTable = function (bedata) {
      TWDS.ranking.manipulate(bedata, c.fields, c.mainfield)
      this.TWDS_backup_updateTable.apply(this, arguments)
    }
  }
}
TWDS.registerStartFunc(TWDS.ranking.startfunc)
