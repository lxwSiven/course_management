const session = require('koa-session');
const RedisStore = require('koa2-session-redis');
const { privateSession, sessionExprie } = require('../app/common/config/server');
const { host, port, password } = require('../app/common/config/redis.config');
const passprot = require('../app/common/helper/passport')

const sess = app => {
  app.keys = ['siven and cherryxiangi'];

  const ttl = sessionExprie * 60000;
  const CONFIG = {
    key: privateSession,
    maxAge: ttl,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false,
    store: new RedisStore({ host, port, password, ttl })
  };

  app.use(session(CONFIG, app));

  app.use(passprot.initialize());
  app.use(passprot.session());
};

module.exports = sess;
