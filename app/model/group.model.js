const fmtData = require('../utils/fmtData')

const model = DB => {
  return {
    async getGroupById (id) {
      try {
        return fmtData(await DB.fetchRow({id: id}))
      } catch (e) {
        console.error(e)
      }
    },
    async getGroups (courseId) {
      try {
        return fmtData(await DB.fetchRows({course_id: courseId}))
      } catch (e) {
        console.error(e)
      }
    },
    async joinGroup (groupId, userId, info) {
      try {
        if (info.isLeader) {
          return fmtData(await DB.update({id: groupId}, {member_num: 1, group_leader: userId}))
        } else {
          let num = parseInt(info.num) + 1
          return fmtData(await DB.update({id: groupId}, {member_num: num}))
        }
      } catch (e) {
        console.error(e)
      }
    },
    async quitGroup (groupId, info) {
      try {
        return await fmtData(DB.update({id: groupId}, info))
      } catch (e) {
        console.error(e)
      }
    },
    async isLeader (groupId, userId) {
      try {
        let sqlMod = `select id, group_leader from \`group\` where id = ${groupId}`
        let res = fmtData(await DB.queryStr(sqlMod))
        if (res[0].group_leader != userId) return false
        else return true
      } catch (e) {
        console.error(e)
      }
    },
    async createGroup (courseId, info) {
      let { userId, groupNum, groupName, role } = info
      let sqlMode = `insert into \`group\` (group_name,member_num,group_leader,course_id) values`
      let valArr = []
      if (groupNum == 1 && role == 'student') {
        sqlMode += ` (\'${groupName}\',1,\'${userId}\',${courseId})`
      } else {
        for (let i = 0; i < groupNum; i++) {
          valArr.push(`(\'${groupName}${Math.floor(Math.random() * 100000)}\',0,null,${courseId})`)
        }
        sqlMode += valArr.join(',')
      }
      try {
        return fmtData(await DB.queryStr(sqlMode))
      } catch (e) {
        console.error(e)
      }
    },
    async selectTopic (groupId, topicId) {
      let sqlMod = `update \`group\` set select_topic_id = ${topicId} where id = ${groupId}`
      try {
        return fmtData(await DB.queryStr(sqlMod))
      } catch (e) {
        console.error(e)
      }
    },
    async deleteGroup (courseId, groupId) {
      let sqlMod = `delete from \`group\` where course_id = ${courseId} and id = ${groupId}`
      try {
        return fmtData(await DB.queryStr(sqlMod))
      } catch (e) {
        console.error(e)
      }
    }
  }
}

module.exports = model