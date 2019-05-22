const fmtData = require('../utils/fmtData')

const model = DB => {
  return {
    async getNotices () {
      try {
        // 没有删除的公告
        // 按发布时间排序
        return res = await DB.fetchRows({is_deleted: 1})
      } catch (e) {
        console.error(e)
      }
    },
    async getNoticeById (id) {
      try {
        return fmtData(await DB.fetchRow({id: id}))
      } catch (e) {
        console.error(e)
      }
    },
    async getNoticesByCourseId (id) {
      try {
        return res = await DB.fetchRows({course_id: id})
      } catch (e) {
        console.error(e)
      }
    },
    async insertNotice (info) {
      try {
        return res = await DB.insert(info)
      } catch (e) {
        console.error(e)
      }
    },
    async updateNotice (id, info) {
      try {
        return res = await DB.update({id: id}, info)
      } catch (e) {
        console.error(e)
      }
    },
    async deleteNotice (id) {
      try {
        return res = await DB.remove({id: id})
      } catch (e) {
        console.error(e)
      }
    }
  }
}

module.exports = model