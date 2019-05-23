const json = require('koa-json');
const logger = require('../app/common/helper/logger');
const onError = require('koa-onerror');
const bodyParser = require('koa-bodyparser');
const connect = app => {

  app.use(bodyParser());
  // 可接收json content-type
  app.use(json());

  // 捕获错误日志
  onError(app);
  app.on('error', (err, ctx) => {
    logger.getLogger().errLogger(ctx, err)
  });


  // 日志
  app.use(logger.getLogger().accLogger);

};

module.exports = connect;
