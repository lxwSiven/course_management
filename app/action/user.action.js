const Mysql = require('../common/helper/mysql')
const userModel = require('../model/user.model')(new Mysql('sys_user'))
const crypto = require('crypto-js')
const RD = require('../common/helper/redis')

const action = {
  async getUsers () {
    // 获取所有用户信息
    let result = await userModel.getUsers()
    result.forEach(rs => {
      delete rs.password
    })
    return result
  },
  async getUserById (id) {
    let result = await userModel.getUserById(id)
    delete result.password
    return result
  },
  async getUserByRealId (id) {
    let result = await userModel.getUserByRealId(id)
    delete result.password
    return result
  },
  async checkInfo (id) {
    let result = await userModel.getUserById(id)
    return JSON.stringify(result) !== '{}'
  },
  async checkPass (id, password) {
    const result = await userModel.getUserById(id)
    if (JSON.stringify(result) !== '{}') {
      return result.password === password ? result : null
    } else {
      return null
    }
  },
  async updatePassword (id, password) {
    return await userModel.updatePassword(id, this.cryptPass(password))
  },
  cryptPass: (password) => {
    return crypto.MD5(password).toString();
  },
  cryptSession: (hash) => {
    return crypto.MD5(hash).toString()
  },
  async checkSession (key) {
    return await RD.exists(key) && await RD.pttl(key)
  },
  async getRedis (key) {
    return JSON.parse(await RD.get(key))
  },
  async setRedis (key, val) {
    // 设置session
    await RD.set(key, JSON.stringify(val))
    // 设置过期时间为默认时间(1小时)
    // await RD.pexpireat(key)
  },
  async delRedis (key) {
    await RD.del(key)
  }
}

module.exports = action