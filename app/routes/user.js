const router = require('koa-router')()
const action = require('../action/user.action')
const scoreAction = require('../action/score.action')
const info = require('../utils/info')
const DateFmt = require('../utils/date')

router.prefix('/api/user')

// 获取所有用户
router.get('/', async (ctx, next) => {
  let result = await action.getUsers()
  if (result) {
    ctx.body = info(200, 'getUsers/ok', result)
  }
  return
})

// 获取某个用户
router.get('/:id', async (ctx, next) => {
  let { id } = ctx.params
  let result = await action.getUserById(id)
  if (result) {
    ctx.body = info(200, 'getUsers/ok', result)
  }
  return
})

// 修改密码
router.put('/modify/pass', async (ctx, next) => {
  let { user_id, oldPass, newPass } = ctx.request.body
  if (await action.checkPass(user_id, action.cryptPass(oldPass))) {
    let result = await action.updatePassword(user_id, newPass)
    if (result.affectedRows) {
      ctx.body = info(200, 'modifyPassword/ok', {msg: '修改密码成功，请重新登录'})
    } else {
      ctx.body = info(400, 'modifyPassword/fail', {msg: '修改密码事失败'})
    }
  } else {
    ctx.body = info(403, 'modifyPassword/fail', {msg: '账号或密码错误'})
  }
  return
})

// 登录
router.post('/login', async (ctx, next) => {
  const { user_id, password } = ctx.request.body;

  // 账号不存在
  const checkUserId = await action.checkInfo(user_id);
  if (!checkUserId) {
    ctx.body = info(401, 'login/fail', {msg: '账号不存在'})
    return;
  }

  const user = await action.checkPass(user_id, action.cryptPass(password))

  if (!user) {
    ctx.body = info(401, 'login/fail', {msg: '账号或密码错误'})
    return
  } else {
    delete user.password
    ctx.session.user = Object.assign({}, user)
    user.sessionId = action.cryptSession(user.name + '-password-' + DateFmt.now());
    action.setRedis(user.sessionId, user)
    ctx.cookies.set('SESSIONID', user.sessionId)
    ctx.body = info(200, 'login/ok', {msg: '登录成功', roleInfo: user})
  }
  return
});

// 自动登录
router.post('/login/auto', async (ctx, next) => {

  let sessionId = ctx.request.body.SESSIONID

  // session有效，即自动登录
  if (await action.checkSession(sessionId)) {
    ctx.session.user = await action.getRedis(sessionId)
    await action.setRedis(sessionId, ctx.session.user)
    ctx.body = info(200, 'autoLogin/ok', {msg: '自动登录成功', roleInfo: ctx.session.user})
    return
  } else {
    ctx.body = info(401, 'autoLogin/fail', {msg: '请重新登录'})
  }
  return
})

// 登出
router.post('/logout', async (ctx, next) => {
  let sessionId = ctx.request.body.SESSIONID
  ctx.session = {}
  await action.delRedis(sessionId)
  ctx.body = info(200, 'logout/ok', {msg: '登出成功'})
  return
})

module.exports = router