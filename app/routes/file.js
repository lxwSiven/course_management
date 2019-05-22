const router = require('koa-router')(); // "koa-router": "^7.2.0"
const send = require('koa-send'); // "koa-send": "^4.1.0"
const action = require('../action/file.action')

router.prefix('/api/download')

router.get('/', async function (ctx) {
  let query = ctx.request.query
  let data = {
    title_id: query.titleId ? query.titleId : null,
    type: query.type,
    uploader_id: query.uploaderId,
    course_id: query.courseId
  }

  let filePath = await action.downloadFile(data)
  // let fileName = '【雷兴文】中移互联网有限公司2019年春季校园招聘.pdf'
  // 为了方便演示，这里直接下载index页面
  // Set Content-Disposition to "attachment" to signal the client to prompt for download.
  // Optionally specify the filename of the download.
  // 设置实体头（表示消息体的附加信息的头字段）,提示浏览器以文件下载的方式打开
  // 也可以直接设置 ctx.set("Content-disposition", "attachment; filename=" + fileName);
  ctx.attachment(filePath)
  // let path = `/tmp/courseFile${filePath}`
  // await send(ctx, filePath, { root: 'C:\\Users\\lxwsiven\\Desktop' })
  await send(ctx, filePath, { root: '/tmp/courseFile' })
  // await send(ctx, path)
  return
})

module.exports = router