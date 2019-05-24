const app = new (require('koa'))();
const router = require('koa-router')();

app.use((ctx, next) => {
  ctx.body = 'Not called';
  return next();
});

// router.get('/api/notice', ctx => {
// });

router.use((ctx, next) => {
  ctx.body = 'Called';
  return next();
});

router.get('/*', ctx => {});


app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3001);