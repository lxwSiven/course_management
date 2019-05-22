const Mysql = require('../common/helper/mysql')
const topicModel = require('../model/topic.model')(new Mysql('topic'))
const courseModel = require('../model/course.model')(new Mysql('course'))

const action = {
  async getTopics (id) {
    // 根据课程id获取课程名称
    let courseName = await courseModel.getCourseNameById(id)
    // 根据课程名称获取选题列表
    return await topicModel.getTopics(courseName[0].course_name)
  }
}

module.exports = action