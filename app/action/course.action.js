const Mysql = require('../common/helper/mysql')
const courseModel = require('../model/course.model')(new Mysql('course'))
const stuCourseModel = require('../model/stuCourse.model')(new Mysql('stu_course'))
const userModel = require('../model/user.model')(new Mysql('sys_user'))



const action = {
  async getStudentCourse (id) {
    // 在学生课程表中 根据student_id 获取 所有课程id
    let stuCourseIds = await stuCourseModel.getStudentCourseId(id)
    let result = []
    for (let key in stuCourseIds) {
      let rs = await courseModel.getCourseById(stuCourseIds[key])
      result.push(rs)
    }
    for (let key in result) {
      let rs = await userModel.getUserNameById(result[key].teacher_id)
      result[key].teacher_name = rs[0].username
    }
    return result
  },
  async getTeacherCourse (id) {
    let result = await courseModel.getTeacherCourse(id)
    for (let key in result) {
      let rs = await userModel.getUserNameById(result[key].teacher_id)
      result[key].teacher_name = rs[0].username
    }
    return result
  },
  async getClosedCourse (id) {
    let result = await courseModel.getClosedCourse(id)
    for (let key in result) {
      let rs = await userModel.getUserNameById(result[key].teacher_id)
      result[key].teacher_name = rs[0].username
    }
    return result
  },
  async getCourseById (id) {
    let result = await courseModel.getCourseById(id)
    if (result.teacher_id) {
      let rs = await userModel.getUserNameById(result.teacher_id)
      result.teacher_name = rs[0].username
    }
    return result
  },
  async getCourseStudent (id) {
    let studentsId = await stuCourseModel.getStudentsId(id)
    let result = []
    for (let key in studentsId) {
      let rs = await userModel.getUserById(studentsId[key])
      delete rs.password
      if (JSON.stringify(rs) !== '{}') {
        result.push(rs)
      }
    }
    return result
  },
  async insertCourse (info) {
    await courseModel.checkCourse(info.teacher_id, info.course_name)
    return await courseModel.insertCourse(info)
  },
  async updateCourse(id, info) {
    return await courseModel.updateCourse(id, info)
  }
}

module.exports = action