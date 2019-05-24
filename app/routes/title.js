const router = require('koa-router')()
const action = require('../action/title.action')
const info = require('../utils/info')
const interceptor = require('../common/helper/interceptor')

router.use(interceptor)

router.prefix('/api/title')

router.get('/user/:userId', async (ctx, next) => {
  let { userId } = ctx.params
})

// 获取课程下的题目
router.get('/:courseId', async (ctx, next) => {
  let { courseId } = ctx.params
  let result = await action.getTitles(courseId)
  if (result) {
    ctx.body = info(200, 'getTitles/ok', result)
  }
  return
})

// 获取题目详情
router.get('/detail/:id/:userId', async (ctx, next) => {
  let { id, userId } = ctx.params
  // 也可以直接在路由中传递userId，客户端可以保存userId
  // let sessionId = ctx.cookies.get('SESSIONID')
  // let user_id = (await action.getRedis(sessionId)).user_id

  let result = await action.getTitleById(id, userId)
  if (result) {
    ctx.body = info(200, 'titleDetail/ok', result)
  }
  return
})

/**
 * 检查某题目下小组的状态
 */

router.get('/group/state', async (ctx, next) => {
  let query = ctx.request.query
  let data = {
    title_id: query.titleId,
    group_id: query.groupId
  }
  let result = await action.checkGroupState(data)
  ctx.body = info(200, 'checkState/ok', result)
})

// 新增一个题目
router.post('/add', async (ctx, next) => {
  // data: {title, desc, course_id, creator_id, times, score, deadline}
  const data = ctx.request.body
  let result = await action.insertTitle(data)
  if (result.affectedRows) {
    ctx.body = info(200, 'insertTitle/ok', {msg: '新增题目成功'})
  }
  return
})

router.post('/state/update', async (ctx, next) => {
  let { titleId, groupId, status  } = ctx.request.body
  let result = await action.updateGroupState(titleId, groupId, {status})
  ctx.body = info(200, 'updateState/ok', result)
  return
})

// 根据课程id获取课程剩余分数
router.get('/add/rest/:courseId', async (ctx, next) => {
  let { courseId } = ctx.params
  let rest = await action.checkRest(courseId)
  ctx.body = info(200, 'checkRest/ok', { rest })
  return
})

// 修改一个题目
router.put('/modify/:id', async (ctx, next) => {
  let { id } = ctx.params
  // data {title, desc, times, score, deadline}
  let { title, desc, times, score, deadline } = ctx.request.body
  let data = { title, desc, times, score, deadline }
  let result = await action.updateTitle(id, data)
  if (result.affectedRows) {
    ctx.body = info(200, 'modifyTitle/ok', {msg: '修改题目成功'})
  }
  return
})


module.exports = router