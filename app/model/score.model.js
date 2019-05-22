const fmtData = require('../utils/fmtData')

const model = DB => {
  return {
    async getScores (courseId, userId) {
      try {
        let sqlMod = `select * from score where course_id = ${courseId} and stu_id = ${userId} and (type = 1 || type = 2)`
        // let res = await DB.fetchAll(['*'], {and: {course_id: courseId, stu_id: userId}})
        let res = await DB.queryStr(sqlMod)
        return fmtData(res)
      } catch (e) {
        console.error(e)
      }
    },
    async getReplyScores (courseId, userId) {
      try {
        let sqlMod = `select * from score where course_id = ${courseId} and stu_id = ${userId} and type = 4`
        // let res = await DB.fetchAll(['*'], {and: {course_id: courseId, stu_id: userId}})
        let teacher = fmtData(await DB.queryStr(sqlMod))
        let sqlMod1 = `select * from score where course_id = ${courseId} and stu_id = ${userId} and type = 3`
        let group = fmtData(await DB.queryStr(sqlMod1))
        return {teacher, group}
      } catch (e) {
        console.error(e)
      }
    },

    async getScoreById (titleId, userId) {
      try {
        let res = await DB.fetchAll(['*'], {and: {title_id: titleId, stu_id: userId}})
        return fmtData(res)
      } catch (e) {
        console.error(e)
      }
    },
    async hasRecord (titleId, stuId, scorerId) {
      // let res = await this.getScoreById(titleId, userId)
      let res = fmtData(await DB.fetchAll(['*'], {and: {title_id: titleId, stu_id: stuId, scorer_id: scorerId}}))

      return (JSON.stringify(res) === '{}' || !res.length) ? false : true
    },
    async insertScore (info) {
      try {
        return fmtData(await DB.insert(info))
      } catch (e) {
        console.error(e)
      }
    },
    async getScoreRecord (courseId, titleId, member) {
      let arr = member.map(item => {
        return item.stu_id
      })
      let sqlMod = `select count(*) as count from score where course_id = ${courseId} and title_id = ${titleId} and type = 1
                    and stu_id in (${arr.join(',')})`
      try {
        return (fmtData(await DB.queryStr(sqlMod)))[0].count
      } catch (e) {
        console.error(e)
      }
    },
    async giveReplyScore (members, info) {
      let sqlMod = `insert into score (stu_id, scorer_id, score, type, course_id, scorer_name, title_id) values `
      let arr = []
      members.forEach(item => {
        arr.push(`(\'${item.stu_id}\',\'${info.scorer_id}\',${info.score},${info.type},${info.course_id},\'${info.scorer_name}\',${info.title_id})`)
      })
      sqlMod += arr.join(',')
      try {
        return fmtData(await DB.queryStr(sqlMod))
      } catch (e) {
        console.error(e)
      }
    }
  }
}

module.exports = model