const async = require('async');
const Pool = require('./pool');
const pool = Pool.pool;
const logger = require('./logger');

/**
 * 数据库模型
 */
class DB {
  /**
   * 构造方法
   */
  constructor(tableName) {
    this.tableName = tableName;
    this.pool = pool;
  }

  sqlLogger (sqlMod, idJson, rowInfo) {
    logger.getLogger().sqlLogger(sqlMod, idJson, rowInfo);
  }

  /**
   * 创建单个连接
   * @returns {Promise<any>}
   */
  getConnection() {
    const { pool } = this;
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) reject(err);
        else resolve(connection);
      })
    })
  }

  /**
   * 数据查询接口
   * @param idJson
   * @returns {Promise<any>}
   */
  fetchRow(idJson) {
    const { tableName, pool } = this;
    return new Promise((resolve, reject) => {
      const sqlMod = `SELECT * FROM \`${tableName}\` WHERE ?`;
      this.sqlLogger(sqlMod, idJson);
      pool.query(sqlMod, idJson, function(error, results) {
        if (error) {
          reject(error)
        } else {
          if (results) {
            resolve(results.pop())
          } else {
            resolve(results)
          }
        }
      })
    })
  }

  /**
   * 取所有数据
   * @returns {Promise<any>}
   */

  selectAll () {
    const { tableName, pool } = this;
    return new Promise((resolve, reject) => {
      const sqlMod = `SELECT * FROM \`${tableName}\``;
      this.sqlLogger(sqlMod);
      pool.query(sqlMod, function (error, results) {
        if (error) {
          reject(error)
        } else {
          resolve(results)
        }
      })
    })
  }

  /**
   * 取数据集合
   * @param idJson
   * @returns {Promise<any>}
   */
  fetchRows(idJson) {
    const { tableName, pool } = this;
    return new Promise((resolve, reject) => {
      const sqlMod = `SELECT * FROM \`${tableName}\` WHERE ?`;
      this.sqlLogger(sqlMod, idJson);
      pool.query(sqlMod, idJson, function (error, results) {
        if (error) {
          reject(error)
        } else {
          resolve(results)
        }

      })
    })
  }

  /**
   * 取数据列
   * @param cols
   * @param idJson
   * @returns {Promise<any>}
   */
  fetchCols (cols, idJson) {
    const { tableName, pool } = this;
    return new Promise((resolve, reject) => {
      let colMod = '';
      cols.forEach(col => {
        colMod += `${col},`
      });
      colMod = colMod.replace(colMod[colMod.lastIndexOf(',')], '');
      const sqlMod = `SELECT ${colMod} FROM \`${tableName}\` where ?`;
      this.sqlLogger(sqlMod, idJson);
      pool.query(sqlMod, idJson, function (error, results) {
        if (error) {
          reject(error)
        } else {
          resolve(results)
        }
      })
    })
  }

  /**
   * 数据插入接口
   * @param rowInfo
   * @returns {Promise<any>}
   */
  insert(rowInfo) {
    const { tableName, pool } = this;
    return new Promise((resolve, reject) => {
      const sqlMod = `INSERT INTO \`${tableName}\` SET ?`;
      this.sqlLogger(sqlMod, rowInfo);
      pool.query(sqlMod, rowInfo, function(error, result) {
        if (error) reject(error);
        else resolve(result)
      })
    })
  }

  /**
   * 数据修改接口
   * @param tableName
   * @param idJson
   * @param rowInfo
   * @returns {Promise<any>}
   */
  update(idJson, rowInfo) {
    const { tableName, pool } = this;
    console.log(rowInfo);
    return new Promise((resolve, reject) => {
      const sqlMod = `UPDATE \`${tableName}\` SET ? WHERE ?`;
      this.sqlLogger(sqlMod, rowInfo, idJson);
      pool.query(sqlMod, [rowInfo, idJson], function (error, result) {
        if (error) reject(error);
        else resolve(result)
      })
    })
  }

  /**
   * 数据删除接口
   * @param idJson
   * @returns {Promise<any>}
   */
  remove(idJson) {
    const { tableName, pool } = this;
    return new Promise((resolve, reject) => {
      const sqlMod = `DELETE FROM \`${tableName}\` WHERE ?`;
      this.sqlLogger(sqlMod, idJson);
      pool.query(sqlMod, idJson, function (error, result) {
        if (error) reject(error);
        else resolve(result)
      })
    })
  }

  /**
   * 统计
   * @param idJson
   * @returns {Promise<any>}
   */
  count(idJson) {
    const { tableName, pool } = this;
    return new Promise((resolve, reject) => {
      const sqlMod = `SELECT COUNT(*) as count FROM \`${tableName}\` WHERE ?`;
      this.sqlLogger(sqlMod, idJson);
      pool.query(sqlMod, idJson, function (error, result) {
        if (error) reject(error);
        else resolve(result.pop())
      })
    })
  }

  /**
   * 自定义查询
   * @param sqlMod
   * @returns {Promise<any>}
   */
  queryStr(sqlMod) {
    const { pool } = this;
    return new Promise((resolve, reject) => {
      this.sqlLogger(sqlMod);
      pool.query(sqlMod, function (error, result) {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  /**
   * 复合查询
   * @param whereJson
   * @param orderByJson
   * @param limitArr
   * @param selectStr
   * @returns {Promise<any>}
   */
  fetchAll(select, whereJson, groupBy = '', orderByJson = '', limitArr = '') {
    const { tableName, pool } = this;
    const andWhere = whereJson['and'];
    const orWhere = whereJson['or'];
    const betArr = whereJson['between'];
    const andArr = [];
    const orArr = [];

    for(const key in andWhere) {
      const snap = typeof andWhere[key] === 'string' ? '\"' : '';
      andArr.push(`\`${key}\` = ${snap}${andWhere[key]}${snap}`)
    }
    for(const key in orWhere) {
      const snap = typeof andWhere[key] === 'string' ? '\"' : '';
      orArr.push(`\`${key}\` = ${snap}${orWhere[key]}${snap}`)
    }

    const andStr = andArr.join(' and ');
    const orStr = orArr.join(' or ')
    const betStr = betArr ? `AND ${betArr[0]} BETWEEN ${betArr[1]} AND ${betArr[2]}` : '';
    const selectStr = select.join(',');

    const orderStr = orderByJson['type'] ? `order by ${orderByJson['key']} ${orderByJson['type']}` : '';
    const limitStr = limitArr.length > 0 ? `limit ${limitArr.join(',')}` : '';
    const groupStr = groupBy.length > 0 ? `group by ${groupBy.join(',')}` : '';
    const sqlMod = `SELECT ${selectStr} FROM \`${tableName}\` WHERE ${andStr} ${orStr} ${betStr} ${orderStr} ${limitStr} ${groupStr}`;

    this.sqlLogger(sqlMod);
    return new Promise((resolve, reject) => {
      pool.query(sqlMod, function (error, results) {
        if (error) {
          reject(error)
        } else resolve(results)
      })
    })
  }

  connectionQuery(connection, sql, callback) {
    connection.query(sql, function (err, result) {
      if (err) callback(err, null);
      else callback(null, result)
    })
  }

  transaction(connection, tasks) {
    return new Promise((resolve, reject) => {
      connection.beginTransaction(err => {
        if (err) {
          reject(err);
          return
        }
        async.series(tasks, (error, result) => {
          if (error) reject(error)
          resolve(connection, result)
        })
      })
    })
  }

  commit(connection) {
    return new Promise((resolve, reject) => {
      connection.commit(err => {
        if (err) reject(err);
        else resolve(connection)
      })
    })
  }

  rollback(connection) {
    return new Promise(resolve => {
      connection.rollback(() => {
        connection.release();
        resolve()
      })
    })
  }
}

module.exports = DB;
