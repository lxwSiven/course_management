const fmtData = require('../utils/fmtData')

const model = DB => {
  return {
    // 在学生课程表中获取 对应学生的 所有课程id
    async getStudentCourseId (stu_id) {
      try {
        let res = fmtData(await DB.fetchAll(['course_id'], {and: {stu_id: stu_id}}))
        res = res.map(item => {
          return item.course_id
        })
        return res
      } catch (e) {
        console.error(e)
      }
    },
    async getStudentsId (course_id) {
      try {
        let res = fmtData(await DB.fetchAll(['stu_id'], {and: {course_id: course_id}}))
        res = res.map(item => {
          return item.stu_id
        })
        return res
      } catch (e) {
        console.error(e)
      }
    },
    async getItem (courseId, userId) {
      try {
        let res = fmtData(await DB.fetchAll(['*'], {and: {course_id: courseId, stu_id: userId}}))
        return res
      } catch (e){
        console.error(e)
      }
    },
    async getStudentsByGroupId (groupId) {
      try {
        let sqlMod = `select stu_id, stu_name from stu_course where team_id = ${groupId} and is_groupleader != 1`
        return fmtData(await DB.queryStr(sqlMod))
      } catch (e) {
        console.error(e)
      }
    },
    async getLeaderByGroupId (groupId) {
      try {
        let sqlMod = `select stu_id, stu_name from stu_course where team_id = ${groupId} and is_groupleader = 1`
        return fmtData(await DB.queryStr(sqlMod))
      } catch (e) {
        console.error(e)
      }
    },
    async joinGroup (courseId, userId, info) {
      let sqlMod = `update stu_course set is_groupleader = ${info.is_groupleader}, team_id = ${info.team_id}, is_in_team = 1 
                    where course_id = ${courseId} and stu_id = ${userId}`
      try {
        // return fmtData(await DB.update({course_id: courseId, stu_id: userId}, info))
        return fmtData(await DB.queryStr(sqlMod))
      } catch (e) {
        console.error(e)
      }
    },
    async quitGroup (courseId, userId) {
      let sqlMode = `update stu_course set is_in_team = 2, team_id = null, is_groupleader = 2 where course_id = ${courseId}
                     and stu_id = ${userId}`
      try {
        return fmtData(await DB.queryStr(sqlMode))
      } catch (e) {
        console.error(e)
      }
    },
    async deleteGroup (courseId, groupId, member) {
      try {
        let sqlMod1 = `update stu_course set is_in_team = 2, is_groupleader = 2 where course_id = ${courseId}
                    and team_id = ${groupId}`
        let result = fmtData(await DB.queryStr(sqlMod1))
        if (member.length) {
          let arr = member.map(item => {
            return item.stu_id
          })
          let sqlMod2 = `update stu_course set team_id = null where course_id = ${courseId} and stu_id in (${arr.join(',')})`
          await fmtData(await DB.queryStr(sqlMod2))
        }
        return result
      } catch (e) {
        console.error(e)
      }


    }
  }
}

module.exports = model