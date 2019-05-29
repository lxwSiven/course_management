const passport = require('koa-passport')
const LocalStrategy = require('passport-local').Strategy
const userAction = require('../../action/user.action')


// 序列化，写入session(redis中)
passport.serializeUser((user, done) => {
  if (user.id) {
    done(null, user.id)
  } else {
    done(null, -1)
  }
})

// 反序列化，session中是否存在
passport.deserializeUser(async (id, done) => {
  let user = await userAction.getUserByRealId(id)
  delete user.password
  done(null, user)
})

passport.use(new LocalStrategy({
  usernameField: 'user_id',
  passwordField: 'password'
}, async (userId, password, done) => {
  let checkUserId = await userAction.checkInfo(userId)
  if (!checkUserId) {
    done(null, {}, {msg: '账号不存在', code: 401})
    return
  }
  let user = await userAction.checkPass(userId, userAction.cryptPass(password))
  if (!user) {
    done(null, {}, {msg: '账号或密码错误', code: 401})
    return
  } else {
    delete user.password
    done(null, user, {msg: '登录成功', code: 200})
    return
  }
}));

module.exports = passport