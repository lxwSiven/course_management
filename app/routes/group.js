const router = require('koa-router')()
const action = require('../action/group.action')
const info = require('../utils/info')
const interceptor = require('../common/helper/interceptor')

router.use(interceptor)

router.prefix('/api/group')

/**
 * 某一课程下所有已存在的小组
 */
router.get('/:courseId', async (ctx, next) => {
  let { courseId } = ctx.params
  let result = await action.getGroups(courseId)
  if (result) {
    ctx.body = info(200, 'getGroups/ok', result)
  }
  return
})

router.get('/:courseId/:groupId', async (ctx, next) => {
  let { courseId, groupId } = ctx.params
  let result = await action.getGroupById(courseId, groupId)
  if (result) {
    ctx.body = info(200, 'getGroup/ok', result)
  }
  return
})

/**
 * 检查是否加入小组
 */
router.get('/:courseId/:userId/check', async (ctx, next) => {
  let { courseId, userId } = ctx.params
  let result = await action.getUserGroupId(courseId, userId)
  if (result) {
    ctx.body = info(200, 'checkGroup/ok', {msg: 'inGroup', groupId: result})
  } else {
    ctx.body = info(200, 'checkGroup/ok', {msg: 'noInGroup', groupId: ''})
  }
  return
})

/**
 * 某个课程下某个用户的小组答辩信息
 */
router.get('/:courseId/:userId/user', async (ctx, next) => {
  let { courseId, userId } = ctx.params
  let result = await action.getUserGroup(courseId, userId)
  if (result) {
    ctx.body = info(200, 'getDetail/ok', result)
  }
  return
})

router.put('/:courseId/:groupId/join', async (ctx, next) => {
  let { courseId, groupId } = ctx.params
  let { userId } = ctx.request.body
  let result = await action.joinGroup(courseId, groupId, userId)
  if (!result) {
    ctx.body = info(400, 'joinGroup/fail', {msg: '小组已满员'})
  } else {
    ctx.body = info(200, 'joinGroup/ok', {msg: '加入小组成功'})
  }
  return
})

/**
 * 退出小组
 */
router.put('/:courseId/:groupId/quit', async (ctx, next) => {
  let { courseId, groupId } = ctx.params
  let { userId } = ctx.request.body
  let result = await action.quitGroup(courseId, groupId, userId)
  if (!result) {
    ctx.body = info(400, 'quitGroup/fail', {msg: '退出小组失败'})
  } else {
    ctx.body = info (200, 'quitGroup/ok', {msg: '退出小组成功'})
  }
  return
})

router.put('/topic/:groupId/:topicId', async (ctx, next) => {
  let { groupId, topicId } = ctx.params
  let result = await action.selectTopic(groupId, topicId)
  if (!result) {
    ctx.body = info(400, 'selectTopic/fail', {msg: '选题失败'})
  } else {
    ctx.body = info(200, 'selectTopic/ok', {msg: '选题成功'})
  }
  return
})

/**
 * 新增小组
 * 分为教师新增和学生新增
 * userId: 操作者
 * groupNum: 新建小组的数量，老师可批量建
 * groupName: 小组名称
 * role: 操作者是 学生 还是 老师
 */
router.post('/:courseId', async (ctx, next) => {
  let { courseId } = ctx.params
  // role 的值为 teacher 或 student
  // let { userId, groupNum, groupName, role } = ctx.request.body
  let result = await action.createGroup(courseId, ctx.request.body)
  if (result) {
    ctx.body = info(200, 'createGroup/ok', {msg: '新建小组成功'})
  }
  return
})

router.delete('/:courseId/:groupId', async (ctx, next) => {
  let { courseId, groupId } = ctx.params
  let result = await action.deleteGroup(courseId, groupId)
  if (result) {
    ctx.body = info(200, 'deleteGroup/ok', {msg: '删除小组成功'})
  }
})

module.exports = router