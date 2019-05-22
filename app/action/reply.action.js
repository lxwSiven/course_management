const Mysql = require('../common/helper/mysql')
const courseModel = require('../model/course.model')(new Mysql('course'))
const groupModel = require('../model/group.model')(new Mysql('group'))
const fileModel = require('../model/file.model')(new Mysql('file'))
const titleMode = require('../model/title.model')(new Mysql('title'))

const action = {
  /**
   * 根据课程id检查当前课程是否处于答辩状态
   * @param courseId
   * @returns {Promise<*>}
   */
  async checkReplyState (courseId) {
    // 根据课程id获取课程名称
    let course = await courseModel.getCourseById(courseId)
    let result
    switch (course.is_reply) {
      case 1: {
        result = {state: 1, msg: '答辩还未开始'}
        break
      }
      case 2: {
        result = {state: 2, msg: '上传答辩资料'}
        break
      }
      case 3: {
        result = {state: 3, msg: '正在答辩'}
        break
      }
      case 4: {
        result = {state: 4, msg: '答辩已结束'}
        break
      }
    }
    return result
  },

  async updateStatus (courseId, state) {
    return await courseModel.updateCourse(courseId, {is_reply: state})
  }
}

module.exports = action