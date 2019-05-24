const router = require('koa-router')()
const action = require('../action/score.action')
const groupAction = require('../action/group.action')
const info = require('../utils/info')
const interceptor = require('../common/helper/interceptor')

router.use(interceptor)

router.prefix('/api/score')

// 获取某一课程下某一学生的所有成绩
router.get('/:courseId/:userId', async (ctx, next) => {
  let { courseId, userId } = ctx.params
  let result = await action.getScores(courseId, userId)
  if (result) {
    ctx.body = info(200, 'getScore/ok', result)
  }
  return
})

/**
 * 某课程某用户的答辩成绩
 */
router.get('/reply/:courseId/:userId', async (ctx, next) => {
  let { courseId, userId } = ctx.params
  let result = await action.getReplyScores(courseId, userId)
  if (result) {
    ctx.body = info(200, 'getReplyScore/ok', result)
  }
  return
})

/**
 * 某一课程下某一用户的总成绩
 */
router.get('/:courseId/:userId/total', async (ctx, next) => {
  let { courseId, userId } = ctx.params
  let result = await action.getTotalScore(courseId, userId)
  if (result) {
    ctx.body = info(200, 'getTotalScore/ok', result)
  }
  return
})

/**
 * 某个题目下可评分列表
 * 不太角色不同操作
 * 角色有 组长、组员以及老师
 * 组长得到小组未被评分成员列表
 * 组员得到组长列表
 * 老师得到未被评分小组列表
 */

/**
 * 获取评分列表
 */
router.get('/mark/:courseId/:titleId/:userId', async (ctx, next) => {
  let { courseId, titleId, userId } = ctx.params
  let { role, groupId } = await action.checkRole(courseId, titleId, userId)
  let result = []
  if (role === 'teacher') {
    result = await groupAction.getUnMarkGroups(courseId, titleId)
  } else if (role === 'leader') {
    result = await action.getUnMarkMembers(titleId, groupId, userId)
  } else {
    result = await action.getUnMarkLeader(titleId, groupId, userId)
  }
  ctx.body = info(200, 'getUnMarkList/ok', result)
  return
})

/**
 * 评分
 */
router.post('/mark/:courseId/:titleId/:userId', async (ctx, next) => {
  let { courseId, titleId, userId } = ctx.params

  // data {type, phase, stu_id, groupId, comment, score}
  let data = ctx.request.body

  let type, result


  if (data.type == 'group') {
    if (data.phase == 'job') {
      type = 2
    } else {
      type = 4
    }
  } else {
    if (data.phase == 'job') {
      type = 1
    } else {
      type = 3
    }
  }

  let scorer = await action.getScorer(userId)

  let scoreInfo = {
    stu_id: data.stu_id,
    scorer_id: userId,
    score: data.score,
    type: type,
    course_id: courseId,
    scorer_name: scorer.username,
    title_id: titleId
  }


  // type 为 2或4 是 老师给小组评分
  // type 为 2 设置 title_group 表的分数, 并给所有小组成员在成绩表中增添记录
  // type 为 4 只需给所有小组成员在成绩表中增添记录

  // 判断 data.groupId 是否存在, 存在则是给小组评分
  // 作业阶段教师给小组评分
  if (type === 2 && data.groupId) {
    let groupData = {
      score: data.score,
      comment: data.comment,
      status: 4
    }
    result = await action.updateGroupScore(titleId, data.groupId, groupData)
  }

  // 给所有小组成员增添记录
  if (type === 2 || type === 4 || type === 3) {
    let groupMember = await action.getStudentsByGroupId(data.groupId)
    for (let key in groupMember) {
      scoreInfo.stu_id = groupMember[key].stu_id
      result = await action.insertScore(scoreInfo)
    }
  }

  // 给一个小组成员增添记录
  if (type === 1) {
    result = await action.insertScore(scoreInfo)
    // 插入成功，查看title_group的 status 是否需要改变
    if (result) {
      await action.checkStatus(courseId, titleId, userId)
    }
  }

  if (result.affectedRows) {
    ctx.body = info(200, 'setScore/ok', {msg: '评分成功'})
  }

  return
})

module.exports = router