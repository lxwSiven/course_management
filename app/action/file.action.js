const Mysql = require('../common/helper/mysql')
const fileModel = require('../model/file.model')(new Mysql('file'))

const action = {
  async downloadFile (info) {
    let result =  await fileModel.downloadFine(info)
    if (result.length) {
      return result[0].file_path
    }
  }
}

module.exports = action