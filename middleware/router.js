const glob = require('glob');
const path = require('path');
const routesPath = path.resolve(__dirname, '../app/routes');

/**
 * 路由中间件
 * @param app
 */
const router = app => {
  // 把路由表文件夹的路由拼接
  glob.sync(path.resolve(routesPath, './*.js')).forEach(path => {
    const router = require(path);
    // console.log(router.use)
    router.use(async (ctx, next) => {
      console.log(ctx.isAuthenticated())
      if (ctx.isAuthenticated()) {
        await next()
      } else {
        ctx.status = 401
        ctx.body = info(401, '请登录后访问')
      }
    })
    // console.log(router.allowedMethods())
    app.use(router.routes()).use(router.allowedMethods());
  });
};

module.exports = router;
