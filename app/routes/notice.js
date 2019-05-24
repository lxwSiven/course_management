const router = require('koa-router')()
const action = require('../action/notice.action')
const info = require('../utils/info')
const interceptor = require('../common/helper/interceptor')

router.use(interceptor)

router.prefix('/api/notice')

router.get('/:userId/one', async (ctx, next) => {
  let { userId } = ctx.params
  let data = await action.getOneNotice(userId)
  if (data) {
    ctx.body = info(200, 'notices/ok', data)
    return
  } else ctx.throw('获取所有公告失败', 400)
  return
})

router.get('/', async (ctx, next) => {
  let data = await action.getNotices()
  if (data) {
    ctx.body = info(200, 'notices/ok', data)
    // ctx.body = info(404, 'notice/fail', {})
    // ctx.body = ctx
    ctx.cookies.set('session', '12989')
    return
  } else ctx.throw('获取所有公告失败', 400)
  return
})

router.get('/:id', async (ctx, next) => {
  let { id } = ctx.params
  let notice = await action.getNoticeById(id)
  if (notice) {
    ctx.body = info(200, 'notice/ok', notice)
  } else {
    ctx.msg = '没有这个公告哦'
  }
  return
})

router.get('/course/:courseId', async (ctx, next) => {
  let { courseId } = ctx.params
  let noticeList = await action.getNoticesByCourseId(courseId)

  if (noticeList) {
    ctx.body = info(200, 'notice/ok', noticeList)
  } else {
    ctx.body = info(200, 'notice/fail', [])
  }
  return
})

router.post('/add', async (ctx, next) => {
  let result = await action.insertNotice(ctx.request.body)
  if (result.affectedRows) {
    ctx.body = info(200, 'setNotice/ok', {})
  }
  return
})

router.put('/modify/:id', async (ctx, next) => {
  let { id } = ctx.params
  let result = await action.updateNotice(id, ctx.request.body)
  if (result.affectedRows) {
    ctx.body = info(200, 'updateNotice/ok', {})
  }
  return
})

router.delete('/delete/:id', async (ctx, next) => {
  let { id } = ctx.params
  let result = await action.deleteNotice(id)
  if (result.affectedRows) {
    ctx.body = info(200, 'deleteNotice/ok', {})
  }
})

module.exports = router