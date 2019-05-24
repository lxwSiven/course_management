const router = require('koa-router')()
const action = require('../action/course.action')
const info = require('../utils/info')
const interceptor = require('../common/helper/interceptor')

router.use(interceptor)

router.prefix('/api/course')

// 根据学生id返回所有 学生的课程
router.get('/user/:id', async (ctx, next) => {
  let { id } = ctx.params
  let result1 = await action.getStudentCourse(id)
  let result2 = await action.getTeacherCourse(id)
  let result = result1.length ? result1 : result2
  ctx.body = info(200, 'getStudentCourse/ok', result)
  return
})

router.get('/user/:id/close', async (ctx, next) => {
  let { id } = ctx.params
  let result = await action.getClosedCourse(id)
  if (result.length) {
    ctx.body = info(200, 'getClosedCourse/ok', result)
  } else {
    ctx.body = info(400, 'getClosedCourse/fail', result)
  }
  return
})

// 根据课程id获取课程信息
router.get('/:id', async (ctx, next) => {
  let { id } = ctx.params
  let result = await action.getCourseById(id)
  ctx.body = info(200, 'getCourse/ok', result)
  return
})

// 根据课程id 获取所有课程学生
router.get('/:id/student', async (ctx, next) => {
  let { id } = ctx.params
  let result = await action.getCourseStudent(id)
  ctx.body = info(200, 'getStudent/ok', result)
  return
})

router.get('/user/:userId/action', async (ctx, next) => {
  let {userId} = ctx.params
  let result1 = await action.getStudentCourse(userId)
  let result2 = await action.getTeacherCourse(userId)
  let result = result1.length ? result1 : result2
  result = result.map(item => {
    return {
      id: item.id,
      name: item.course_name
  }
  })
  ctx.body = info(200, 'getCourseAction/ok', result)
})

// 新增课程
router.post('/add', async (ctx, next) => {
  // 检查权限

  let result = await action.insertCourse(ctx.request.body)
  if (result.affectedRows) {
    ctx.body = info(200, 'addCourse/ok', {})
  }
  return
})

// 修改课程
router.put('/modify/:id', async (ctx, next) => {
  // 检查权限

  let { id } = ctx.params
  let result = await action.updateCourse(id, ctx.request.body)
  if (result.affectedRows) {
    ctx.body = info(200, 'updateCourse/ok', {})
  }
  return
})

// 删除课程
router.delete('/delete/:id', async (ctx, next) => {
  // 检查权限
  let { id } = ctx.params
})

module.exports = router