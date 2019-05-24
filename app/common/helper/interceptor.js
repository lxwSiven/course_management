const info = require('../../utils/info')

module.exports = async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    await next()
  } else {
    ctx.status = 401
    ctx.body = info(401, '请登录后访问')
  }
}