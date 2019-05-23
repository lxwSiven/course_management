const log4js = require('log4js');
const logConfig = require('../config/logger.config');
const {formatError} = require('../../utils/formatLog');

log4js.configure(logConfig);

const errLogger = log4js.getLogger('error');
const accLogger = log4js.getLogger('access');
const sqlLogger = log4js.getLogger('sql');
const infoLogger = log4js.getLogger('info');

// module.exports = logger

module.exports = class Logger {
  constructor (options) {
    this.Logs =  {errLogger, accLogger, sqlLogger, infoLogger}
  }

  static getLogger (options) {
    if (!this.instance) {
      this.instance = new Logger(options)
    }
    return this.instance
  }

  async accLogger (ctx, next) {
    const start = Date.now();
    const {method, url, host, headers} = ctx.request;
    Object.defineProperty(ctx, 'Logs', {
      value: {errLogger, accLogger, sqlLogger, infoLogger},
      writable: false,
      enumerable: true,
      configurable: false
    });
    let client = {
      method,
      url,
      host,
      referer: headers['referer'],
      userAgent: headers['user-agent'],
    };
    await next();
    const responseTime = Date.now() - start;
    accLogger.info(`Time: ${responseTime}ms ${JSON.stringify(client)}`)
  }

  sqlLogger (sqlMod, idJson, rowInfo) {
    sqlLogger.info(`${JSON.stringify(sqlMod)}  ${JSON.stringify(!idJson?'':idJson)}  ${JSON.stringify(!rowInfo?'':rowInfo)}`)
  }

  errLogger (ctx, err, resTime) {
    errLogger.error(formatError(ctx, err, resTime))
  }
};

// module.exports = options => {
//   const Logs =  {errLogger, accLogger, sqlLogger, infoLogger}
//   return async (ctx, next) => {
//     const start = Date.now()
//     const {method, url, host, headers} = ctx.request
//     Object.defineProperty(ctx, 'log', {
//       value: Logs,
//       writable: false,
//       enumerable: true,
//       configurable: false
//     })
//
//     let client = {
//       method,
//       url,
//       host,
//       referer: headers['referer'],
//       userAgent: headers['user-agent'],
//     }
//     await next()
//     const responseTime = Date.now() - start
//     Logs.accLogger.info(`Time: ${responseTime}ms ${JSON.stringify(client)}`)
//   }
// }