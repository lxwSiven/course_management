const fmtData = require('../utils/fmtData')

const model = DB => {
  return {
    async getCourseById (id) {
      try {
        return fmtData(await DB.fetchRow({id: id}))
      } catch (e) {
        console.error(e)
      }
    },
    async getTeacherCourse (id) {
      try {
        return fmtData(await DB.fetchAll(['*'], {and:{teacher_id: id, status: 1}}))
      } catch (e) {
        console.error(e)
      }
    },
    async getClosedCourse (id) {
      try {
        return fmtData(await DB.fetchAll(['*'], {and:{teacher_id: id, status: 2}}))
      } catch (e) {
        console.error(e)
      }
    },
    async checkCourse (userId, courseName) {
      try {
        let result = fmtData(await DB.fetchAll(['*'], {and:{teacher_id: userId, course_name: courseName, status: 2}}))
        if (result.length) {
          let sqlMod = `update course set status = 3 where teacher_id = \'${userId}\' and course_name = \'${courseName}\'`
          fmtData(await DB.queryStr(sqlMod))
        } else {
        }
        return result
      } catch (e) {
        console.error(e)
      }
    },
    async getCourseNameById (id) {
      try {
        let res = await DB.fetchAll(['course_name', 'id'], {and: {id: id, status: 1}})
        return fmtData(res)
      } catch (e) {
        console.error(e)
      }
    },
    async insertCourse (info) {
      try {
        return await DB.insert(info)
      } catch (e) {
        console.error(e)
      }
    },
    async updateCourse (id, info) {
      try {
        return await DB.update({id: id}, info)
      } catch (e) {
        console.error(e)
      }
    }
  }
}

module.exports = model