const path = require('path');

module.exports = {
  appenders: {
    error: {
      type: 'file',
      category: 'errLogger',
      filename: path.join(__dirname, '../../logs/error.log'),
      maxLogSize: 104800,
      backups: 100
    },
    access: {
      type: 'dateFile',
      category: 'accLogger',
      filename: path.join(__dirname, '../../logs/access.'),
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      maxLogSize: 104800,
      backups: 100
    },
    sql: {
      type: 'file',
      category: 'sqlLogger',
      filename: path.join(__dirname, '../../logs/sql.log'),
      maxLogSize: 104800,
      backups: 100
    }
  },
  categories: {
    error: {appenders: ['error'], level: 'error'},
    access: {appenders: ['access'], level: 'info'},
    sql: {appenders: ['sql'], level: 'info'},
    default: {appenders: ['access'], level: 'info'}
  },
  replaceConsole: true,
  pm2: true
}