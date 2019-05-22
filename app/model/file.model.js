const fmtData = require('../utils/fmtData')

const model = DB => {
  return {
    async getFiles () {
      try {
        return res = fmtData(await DB.selectAll())
      } catch (e) {
        console.error(e)
      }
    },
    // 同一题目下所有文件
    async getFilesByTitle (id) {
      try {
        return res = fmtData(await DB.fetchRows({title_id: id}))
      } catch (e) {
        console.error(e)
      }
    },
    // 某一题目下某一用户的文件
    async getUserFiles (titleId, userId) {
      try {
        let res = await DB.fetchAll(['*'], {and: {title_id: titleId, uploader_id: userId}})
        return fmtData(res)
      } catch (e) {
        console.error(e)
      }
    },
    async hasRecord (titleId, userId) {
      let res = await this.getUserFiles(titleId, userId)

      return (JSON.stringify(res) === '{}' || !res.length) ? false : true
    },
    async getReplyFiles (courseId, userId) {
      let sqlMod = `select * from \`file\` where uploader_id = ${userId} and course_id = ${courseId} and type = 4`
      try {
        return fmtData(await DB.queryStr(sqlMod))
      } catch (e) {
        console.error(e)
      }
    },

    async downloadFine (info) {
      let titleSelect = ''
      if (info.title_id) {
        titleSelect = `title_id = ${info.title_id} and`
      }
      let sqlMod = `select file_path from \`file\` where ${titleSelect} course_id=${info.course_id} and uploader_id=${info.uploader_id} and type=${info.type}`
      try {
        return fmtData(await DB.queryStr(sqlMod))
      } catch (e) {
        console.error(e)
      }
    }
  }
}

module.exports = model