const router = require('koa-router')()
const action = require('../action/topic.action')
const info = require('../utils/info')

router.prefix('/api/topic')

router.get('/:id', async (ctx, next) => {
  let { id } = ctx.params
  let result = await action.getTopics(id)
  if (result) {
    ctx.body = info(200, 'getTopic/ok', result)
  }
  return
})

module.exports = router