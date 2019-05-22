const Mysql = require('../common/helper/mysql')
const RD = require('../common/helper/redis')
const titleModel = require('../model/title.model')(new Mysql('title'))
const stuCourseModel = require('../model/stuCourse.model')(new Mysql('stu_course'))
const courseModel = require('../model/course.model')(new Mysql('course'))
const userModel = require('../model/user.model')(new Mysql('sys_user'))
const fileModel = require('../model/file.model')(new Mysql('file'))
const titleGroupModel = require('../model/titleGroup.model')(new Mysql('title_group'))
const groupModel = require('../model/group.model')(new Mysql('group'))

const action = {
  // 根据课程id获取课程题目
  async getTitles (courseId) {
    // 根据课程id获取titles
    let result = await titleModel.getTitles(courseId)
    let courseName = (await courseModel.getCourseNameById(courseId))[0].course_name
    result.forEach(item => {
      item.courseName = courseName
    })
    return result
  },

  /**
   * 根据title_id 获取 title的详细信息
   * 并返回 题目附件列表 和 当前用户的文件列表
   * @param id 题目id
   * @param userId 当前用户的id
   * @returns {Promise<*>}
   */
  async getTitleById (id, userId) {
    let title = await titleModel.getTitleById(id)


    let courseName = await courseModel.getCourseNameById(title.course_id)
    let teacherName = await userModel.getUserNameById(title.creator_id)
    title.creatorName = teacherName[0].username
    title.courseName = courseName[0].course_name

    // 获取文件列表
    // 当前用户文件
    let stuFiles = await fileModel.getUserFiles(id, userId)
    // 题目附件
    let teaFiles = await fileModel.getUserFiles(id, title.creator_id)
    title.files = {student: stuFiles, teacher: teaFiles}
    let group = await stuCourseModel.getItem(title.course_id, userId)
    if (group.length) {
      let groupScore = await titleGroupModel.getGroupScore(title.id, group[0].team_id)
      if (groupScore.length) {
        title.titleScore = groupScore[0]
      } else {
        title.titleScore = null
      }
    }
    return title
  },
  async checkGroupState (info) {
    let result = await titleGroupModel.getGroupState(info)
    return result[0]
  },
  async updateGroupState (titleId, groupId, info) {
    return await titleGroupModel.updateGroupStatus(titleId, groupId, info)
  },
  async insertTitle (info) {
    let result = await titleModel.insertTitle(info)
    let groups = await groupModel.getGroups(info.course_id)
    groups = groups.map(item => {
      return item.id
    })
    await titleGroupModel.insertItems([result.insertId], groups)
    return result
  },
  async updateTitle (id, info) {
    return await titleModel.updateTitle(id, info)
  },
  async getRedis (key) {
    return JSON.parse(await RD.get(key))
  },
  async checkRest (id) {
    let result = await titleModel.getTitles(id)
    let total = 0
    result.forEach(rs => {
      total += rs.score
    })
    return 100 - total
  }
}

module.exports = action