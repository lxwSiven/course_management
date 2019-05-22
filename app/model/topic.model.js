const fmtData = require('../utils/fmtData')

const model = DB => {
  return {
    async getTopics (name) {
      try {
        return res = fmtData(await DB.fetchRows({course_name: name}))
      } catch (e) {
        console.error(e)
      }
    },
    async getTopicById (id) {
      try {
        return fmtData(await DB.fetchRow({id: id}))
      } catch (e) {
        console.error(e)
      }
    }
  }
}

module.exports = model