const Mysql = require('../common/helper/mysql')
const scoreModel = require('../model/score.model')(new Mysql('score'))
const titleModel = require('../model/title.model')(new Mysql('title'))
const stuCourseModel = require('../model/stuCourse.model')(new Mysql('stu_course'))
const userModel = require('../model/user.model')(new Mysql('sys_user'))
const fileModel = require('../model/file.model')(new Mysql('file'))
const groupModel = require('../model/group.model')(new Mysql('group'))
const titleGroupModel = require('../model/titleGroup.model')(new Mysql('title_group'))
// const groupModel = require('../model/group.model')(new Mysql('group'))

const action = {

  /**
   * 获取某一课程下某用户的当前所有分数
   * @param courseId
   * @param userId
   * @returns {Promise<Array>}
   */
  async getScores (courseId, userId) {
    // 根据课程id 和当前用户id 获取 分数列表
    let result = await scoreModel.getScores(courseId, userId)
    // 根据title_id 获取 titleName
    let rs = {}
    for (let key in result) {
      let rt = result[key]
      rt.titleName = (await titleModel.getTitleById(rt.title_id)).title
      if (rs[rt.title_id]) {
        rs[rt.title_id].push(rt)
      } else {
        rs[rt.title_id] = [rt]
      }
    }

    let scores = []

    for (let key in rs) {
      let rt = rs[key]
      let groupScore = 0
      let groupTimes = 0
      let teacherScore = 0
      let teacherTimes = 0
      for (let k in rt) {
        if (rt[k].type == 1) {
          groupScore += parseInt(rt[k].score)
          groupTimes++
        } else if (rt[k].type == 2) {
          teacherScore += parseInt(rt[k].score)
          teacherTimes++
        }
      }
      scores.push({
        titleId: rt[0].title_id,
        titleName: rt[0].titleName,
        groupScore: groupScore / groupTimes || '',
        teacherScore: teacherScore / teacherTimes || '',
        studentId: rt[0].stu_id,
        courseId: rt[0].course_id
      })
    }
    return scores
  },

  async getReplyScores (courseId, userId) {
    let {teacher, group} = await scoreModel.getReplyScores(courseId, userId)
    if (teacher.length) {
      teacher = teacher[0]
    } else {
      teacher = {}
    }
    return {teacher, group}
  },

  /**
   *
   * @param courseId
   * @param userId
   * @returns {Promise<{id, stuId: *, score: string}>}
   */
  async getTotalScore (courseId, userId) {
    let result = (await stuCourseModel.getItem(courseId, userId))[0]
    return {
      id: result.id,
      stuId: result.stu_id,
      score: result.score == 0 ? '' : result.score
    }
  },
  async checkRole (courseId, titleId, userId) {
    let role = (await userModel.checkRole(userId))[0].role_val
    let groupId = ''
    // 是老师
    if (role == 'teacher') {
      // result = await groupModel.getUnMarkGroups(courseId, titleId)
    } else if (role == 'student') {
      let rt = (await stuCourseModel.getItem(courseId, userId))[0]
      role = rt.is_groupleader
      groupId = rt.team_id
      if (role == 1) {
        // 是组长
        role = 'leader'
      } else {
        // 是组员
        role = 'member'
      }
    }
    return {role, groupId}
  },
  async getUnMarkMembers (titleId, groupId, userId) {
    let stus = await stuCourseModel.getStudentsByGroupId(groupId)
    let students = []
    for (let key in stus) {
      let hasFile, hasScore
      hasFile = await fileModel.hasRecord(titleId, stus[key].stu_id)
      hasScore = await scoreModel.hasRecord(titleId, stus[key].stu_id, userId)
      if (hasFile && !hasScore) {
        students.push(stus[key])
      }
    }
    let result = []
    for (let key in students) {
      let files = await fileModel.getUserFiles(titleId, students[key].stu_id)
      let title = await titleModel.getTitleById(titleId)
      files.forEach(file => {
        file.titleName = title.title
      })
      result.push({
        user: students[key],
        files: files,
        title: {
          id: title.id,
          name: title.title,
          maxScore: title.score
        }
      })
    }

    return result
  },
  async getUnMarkLeader (titleId, groupId, userId) {
    let leader = (await stuCourseModel.getLeaderByGroupId(groupId))[0]
    let hasFile = await fileModel.hasRecord(titleId, leader.stu_id)
    let hasScore = await scoreModel.hasRecord(titleId, leader.stu_id, userId)
    let result = []

    if (hasFile && !hasScore) {
      let files = await fileModel.getUserFiles(titleId, leader.stu_id)
      let title = await titleModel.getTitleById(titleId)
      files.forEach(file => {
        file.titleName = title.title
      })
      result.push({
        user: leader,
        files: files,
        title: {
          id: title.id,
          name: title.title,
          maxScore: title.score
        }
      })
    }

    return result
  },
  async getStudentsByGroupId (groupId) {
    let group = await stuCourseModel.getStudentsByGroupId(groupId)
    let group1 = await stuCourseModel.getLeaderByGroupId(groupId)
    group.push(...group1)
    return group
  },
  async getScorer (id) {
    return (await userModel.getUserNameById(id))[0]
  },
  async insertScore (info) {
    return await scoreModel.insertScore(info)
  },
  async updateGroupScore (titleId, groupId, info) {
    return await titleGroupModel.updateGroupScore(titleId, groupId, info)
  },
  async checkStatus (courseId, titleId, userId) {
    let groupId = (await stuCourseModel.getItem(courseId, userId))[0].team_id
    let group = await groupModel.getGroupById(groupId)
    let member = await stuCourseModel.getStudentsByGroupId(groupId)
    let leader = await stuCourseModel.getLeaderByGroupId(groupId)
    member.push(...leader)
    let scoreRecord = await scoreModel.getScoreRecord(courseId, titleId, member)
    if (group.member_num * 2 - 2 == scoreRecord) {
      let rs = await titleGroupModel.updateGroupStatus(titleId, groupId, {status: 2})
    } else {
      return
    }
  },
  async giveReplyScore (members, info) {
    return await scoreModel.giveReplyScore(members, info)
  }
}

module.exports = action