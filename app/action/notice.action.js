const Mysql = require('../common/helper/mysql')
const noticeModel = require('../model/notice.model')(new Mysql('notice'))
const courseModel = require('../model/course.model')(new Mysql('course'))
const userModel = require('../model/user.model')(new Mysql('sys_user'))
const stuCourseModel = require('../model/stuCourse.model')(new Mysql('stu_course'))

const action = {
  async getNotices () {
    let notices = await noticeModel.getNotices()
    for (let key in notices) {
      let courseInfo = await courseModel.getCourseNameById(notices[key].course_id)
      Object.assign(notices[key], courseInfo[0])
      let creatorInfo = await userModel.getUserNameById(notices[key].creator_id)
      Object.assign(notices[key], creatorInfo[0])
    }
    return notices
  },
  async getNoticeById (id) {
    let notice = await noticeModel.getNoticeById(id)
    let courseInfo = await courseModel.getCourseNameById(notice.course_id)

    notice.course_name = courseInfo[0].course_name
    let creatorInfo = await userModel.getUserNameById(notice.creator_id)
    notice.username = creatorInfo[0].username
    return notice
  },
  async getOneNotice (userId) {
    let course = await stuCourseModel.getStudentCourseId(userId)
    let course1 = await courseModel.getTeacherCourse(userId)
    course1 = course1.map(item => {
      return item.id
    })
    course = course.length ? course : course1
    return (await noticeModel.getNoticesByCourseId(course[0]))[0]
  },
  async getNoticesByCourseId (courseId) {
    let notices = await noticeModel.getNoticesByCourseId(courseId)
    for (let key in notices) {
      let courseInfo = await courseModel.getCourseNameById(courseId)
      let creatorInfo = await userModel.getUserNameById(notices[key].creator_id)
      notices[key].course_name = courseInfo[0].course_name
      notices[key].username = creatorInfo[0].username
    }
    return notices
  },
  async insertNotice (info) {
    let result = await noticeModel.insertNotice(info)
    return result
  },
  async updateNotice (id, info) {
    return await noticeModel.updateNotice(id, info)
  },
  async deleteNotice (id) {
    return await noticeModel.deleteNotice(id)
  }
}

module.exports = action