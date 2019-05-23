const RD = require('../app/common/helper/redis');
const Pool = require('../app/common/helper/pool');
const logger = require('../app/common/helper/logger');

const database = app => {
  const client = RD.init();
  const pool = Pool.init();
  const log = logger.getLogger();
  // 建立连接打印信息
  pool.getConnection((error, connection) => {
    if (error) log.sqlLogger(`Mysql Connected failed`);
    else if(connection) log.sqlLogger(`Mysql Connected to MySQL`)
  });

  client.on('connect', () => {
    log.sqlLogger(`Redis connect Successful`)
  });

  client.on('error', (err) => {
    log.sqlLogger(`Redis throw Error: ${err}`)
  })
};

module.exports = database;
