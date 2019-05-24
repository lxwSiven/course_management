const router = require('koa-router')();;
const passport = require('../common/helper/passport')
const info = require('../utils/info')

router.prefix('/api/auth')

/**
 * 登录
 */
router.post('/login', async ctx => {
  return passport.authenticate('local', (err, user, info, status) => {
    ctx.body = {user, err, info, status};
    return ctx.login({...user, ...info});
  })(ctx)
})

/**
 * 登出
 */
router.post('/logout', async ctx => {
  ctx.logout()
  ctx.body = info(200, 'logout/ok', {msg: '登出成功'})
})

/**
 * 自动登录
 */
router.post('/login/auto', async ctx => {
  // console.log(arguments)
  console.log('auto', ctx.isAuthenticated())
  if (ctx.isAuthenticated()) {
    ctx.body = info(200, 'autoLogin/ok', {msg: '自动登录成功', roleInfo: ctx.state.user})
  } else {
    ctx.body = info(401, 'autoLogin/ok', {msg: '未登录'})
  }
})

module.exports = router