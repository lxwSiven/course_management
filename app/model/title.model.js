const fmtData = require('../utils/fmtData')

const model = DB => {
  return {
    async getTitles (id) {
      try {
        return fmtData(await DB.fetchRows({course_id: id}))
      } catch (e) {
        console.error(e)
      }
    },
    async getTitleById (id) {
      try {
        return fmtData(await DB.fetchRow({id: id}))
      } catch (e) {
        console.error(e)
      }
    },
    async insertTitle (info) {
      try {
        return await DB.insert(info)
      } catch (e) {
        console.error(e)
      }
    },
    async updateTitle (id, info) {
      try {
        return await DB.update({id: id}, info)
      } catch (e) {
        console.error(e)
      }
    }
  }
}

module.exports = model