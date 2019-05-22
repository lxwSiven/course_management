const fmtData = require('../utils/fmtData')

const model = DB => {
  return {
    async getUnMarkGroups (titleId) {
      try {
        let sqlMode = `SELECT group_id from title_group where title_id = ${titleId} and status = 3`
        return res = fmtData(await DB.queryStr(sqlMode))
      } catch (e) {
        console.error(e)
      }
    },
    async getGroupScore (titleId, groupId) {
      let sqlMod = `select comment, score, current_times from title_group where group_id = ${groupId} and status = 4 and title_id = ${titleId}`
      return fmtData(await DB.queryStr(sqlMod))
    },
    async updateGroupScore (titleId, groupId, info) {
      try {
        let sqlMod = `UPDATE title_group SET score = ${info.score}, comment = \"${info.comment}\", status = ${info.status} WHERE title_id = ${titleId} and group_id = ${groupId}`
        return fmtData(await DB.queryStr(sqlMod))
      } catch (e) {
        console.error(e)
      }
    },
    async updateGroupStatus (titleId, groupId, info) {
      try {
        let sqlMode = `update title_group set status = ${info.status} where title_id = ${titleId} and group_id = ${groupId}`
        return fmtData(await DB.queryStr(sqlMode))
      } catch (e) {
        console.error(e)
      }
    },
    async getGroupState (info) {
      try {
        let sqlMod = `select status from title_group where title_id=${info.title_id} and group_id=${info.group_id}`
        return fmtData(await DB.queryStr(sqlMod))
      } catch (e) {
        console.error(e)
      }
    },
    async insertItems (titles, groups) {
      let sqlMod = 'insert into \`title_group\` (title_id, group_id, status) values '
      let mod = []
      titles.forEach(title => {
        groups.forEach(group => {
          mod.push(`(${title}, ${group}, 1)`)
        })
      })
      sqlMod = sqlMod + mod.join(',')
      try {
        return fmtData(await DB.queryStr(sqlMod))
      } catch (e) {
        console.error(e)
      }
    },
    async deleteGroup (titles, groupId) {
      let sqlMod = `delete from title_group where group_id = ${groupId} and title_id in (${titles.join(',')})`
      try {
        return fmtData(await DB.queryStr(sqlMod))
      } catch (e) {
        console.error(e)
      }
    }
  }
}

module.exports = model