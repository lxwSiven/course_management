const router = require('koa-router')()
const action = require('../action/reply.action')
const info = require('../utils/info')
const interceptor = require('../common/helper/interceptor')

router.use(interceptor)

router.prefix('/api/reply')

/**
 * 检查课程状态，作业阶段还是答辩阶段
 * 答辩阶段的具体哪一个阶段
 */
router.get('/:courseId', async (ctx, next) => {
  let { courseId } = ctx.params
  let result = await action.checkReplyState(courseId)
  if (result) {
    ctx.body = info(200, 'checkReplyState/ok', result)
  }
  return
})

router.put('/course/update', async (ctx, next) => {
  let { courseId, state } = ctx.request.body
  let result = await action.updateStatus(courseId, state)
  if (result) {
    ctx.body = info(200, 'updateStatus/ok', {msg: '更新成功'})
  }
  return
})

module.exports = router