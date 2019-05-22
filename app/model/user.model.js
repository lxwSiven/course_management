const fmtData = require('../utils/fmtData')

const model = DB => {
  return {
    async getUsers () {
      try {
        return fmtData(await DB.selectAll())
      } catch (e) {
        console.error(e)
      }
    },
    async getUserNameById (id) {
      try {
        let rs = await DB.fetchAll(['username'], {and: {user_id: id}})
        return fmtData(rs)
      } catch (e) {
        console.error(e)
      }
    },
    async getUserById (id) {
      try {
        return fmtData(await DB.fetchRow({user_id: id}))
      } catch (e) {
        console.error(e)
      }
    },
    async updatePassword (id, password) {
      return fmtData(await DB.update({user_id: id}, {password: password}))
    },
    async checkRole (userId) {
      let sqlMod = `SELECT sys_role.role_val from sys_user, sys_role where sys_user.role_id = sys_role.id and sys_user.user_id = ${userId}`
      let res = fmtData(await DB.queryStr(sqlMod))
      return res
    }
  }
}

module.exports = model