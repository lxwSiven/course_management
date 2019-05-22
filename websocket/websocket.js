const RD = require('../app/common/helper/redis')
const WebSocketServer = require('ws').Server
const crypto = require('crypto-js')
const groupAction = require('../app/action/group.action')
const scoreAction = require('../app/action/score.action')
const userModel = require('../app/action/user.action')

const websocket = server => {

  let wss = new WebSocketServer({ server: server })
  let timer, interval

  wss.on('connection', async function (ws) {
    // msg: {type, info, GROUPREPLYID, WEBSOCKETID}
    ws.on('message', async function (msg) {
      try {
        msg = JSON.parse(msg)
      } catch (e) {
        console.error(e)
      }
      switch (msg.type) {
        case 'startReply': {
          let { GROUPREPLYID, WEBSOCKETID, groupDetail } = await startReply(msg, wss)
          // 记录 redis的 key
          wss.GROUPREPLYID = GROUPREPLYID
          wss.WEBSOCKETID = WEBSOCKETID
          ws.send(JSON.stringify({type: 'startReply', data: groupDetail}))
          break
        }
        case 'startMark': {
          let markGroupList = await startMark(msg, wss)
          wss.tempGroupList = markGroupList
          let result = markGroupList.map(item => {
            return item.id
          })
          wss.broadcastByGroup({type: 'startMark', time: msg.time}, result)
          // 每10秒发送一次倒计时信息
          let currentTime = msg.time
          interval = setInterval(function () {
            result = wss.tempGroupList.map(item => {
              return item.id
            })
            currentTime -= 10
            wss.broadcastByGroup({type: 'startMark', time: currentTime  }, result)
          }, 10000)
          // 添加计时器
          timer = addMarkTimer(wss, msg.time, interval)
          break
        }
        case 'mark': {
          let result = await giveScore(msg, wss, timer, interval)
          break
        }
        case 'nextGroup': {
          let result = await nextGroup(msg, wss)
          // 还有下一组, 广播下一组信息
          if (result) {
            wss.broadcast({type: 'next', data: result})
          } else {
            wss.broadcast({type: 'end', data: ''})
          }
          break
        }
        case 'connect': {
          if (msg.role == 'teacher') {
            let result = await teacherConnect(msg, wss.WEBSOCKETID)
            ws.send(JSON.stringify({type: 'connect', data: result}))
          }
          let result = await clientConnect(msg, wss.WEBSOCKETID)
          if (msg.info.userId && msg.role == 'student') {
            ws.groupId = await groupAction.getUserGroupId(msg.info.courseId, msg.info.userId)
          }
          ws.send(JSON.stringify({type:'connect', data: result}))
          break
        }
        case 'ping': {
          ws.send(JSON.stringify({type: 'pong'}))
        }
        break
      }
    })
  })

  wss.tempGroupList = null

  wss.broadcast = function (msg) {
    wss.clients.forEach(client => {
      client.send(JSON.stringify(msg))
    })
  }

  wss.broadcastByGroup = function (msg, groupsId) {
    wss.clients.forEach(client => {
      if (groupsId.includes(client.groupId)) {
        client.send(JSON.stringify(msg))
      }
    })
  }
}

async function getRedis (key) {
  return await RD.get(key)
}

async function setRedis (key, val) {
  return await RD.set(key, val)
}

function cryptSession (hash) {
  return crypto.MD5(hash).toString()
}


/**
 *
 * @param msg {type, info{courseId, userId}}
 * @returns {Promise<{GROUPREPLYID: *, WEBSOCKETID: *}>}
 */
async function startReply (msg, wss) {
  let groupInfo = {}
  let groups = await groupAction.getGroups(msg.info.courseId)
  groupInfo.unReply = groups
  groupInfo.hasReply = []
  // groups被分为3部分，一是还未答辩小组，二是已答辩小组，三是当前答辩小组
  let randomIdx = Math.floor(Math.random() * groups.length)
  groupInfo.currentReply = groups[randomIdx]
  groups.splice(randomIdx, 1)

  let GROUPREPLYID = cryptSession(`${msg.info.courseId}-group-${Date.now()}`)
  // 教师按开始答辩,
  if (msg.role == 'teacher') {
    let teaSession = cryptSession(`${msg.info.courseId}-teacher-${msg.info.userId}`)
    wss[teaSession] = {
      groupId: ''
    }
  }

  // 获取当前答辩小组详细信息
  let groupDetail = await groupAction.getGroupReplyDetail(msg.info.courseId, groupInfo.currentReply.id, groupInfo.currentReply.leader.stu_id)
  await setRedis(GROUPREPLYID, JSON.stringify(groupInfo))

  let WEBSOCKETID = cryptSession(`${msg.info.courseId}-websocket-${Date.now()}`)
  await setRedis(WEBSOCKETID,  JSON.stringify(groupDetail))
  return { GROUPREPLYID, WEBSOCKETID, groupDetail }
}

/**
 * 新建一个连接
 * 返回当前答辩组信息和该用户小组信息
 * @param msg {type, info{courseId, userId}, WEBSOCKETID}
 * @param WEBSOCKETID
 * @returns {Promise<{userGroup: *, currentGroup: any}>}
 */
async function clientConnect (msg, WEBSOCKETID) {
  let userGroup = await groupAction.getUserGroup(msg.info.courseId, msg.info.userId)
  let currentGroup = JSON.parse(await RD.get(WEBSOCKETID))
  return { userGroup, currentGroup }
}

async function teacherConnect (msg, WEBSOCKETID) {
  return JSON.parse(await RD.get(WEBSOCKETID))
}

/**
 * 开始评分
 *
 * @param msg {type, info{courseId, userId}, WEBSOCKETID, time, groupNum}
 * @param GROUPREPLYID
 * @returns {Promise<void>}
 */
async function startMark (msg, wss) {
  if (wss.tempGroupList) return wss.tempGroupList

  let groupReplyInfo = JSON.parse(await RD.get(wss.GROUPREPLYID))
  let groupList = []
  groupList.push(...groupReplyInfo.unReply, ...groupReplyInfo.hasReply)
  // 指定组数大于当前小组数
  let groupNum = msg.groupNum > groupList.length ? groupList.length : msg.groupNum
  let markGroupList = []
  if (groupNum === groupList.length) {
    markGroupList = groupList
  } else {
    for (let i = 0; i < groupNum; i++) {
      let idx = Math.floor(Math.random() * groupNum)
      markGroupList.push(groupList[idx])
    }
  }
  return markGroupList
}

function addMarkTimer (wss, time, interval) {
  let timer = setTimeout(function () {
    clearInterval(interval)
    if (wss.tempGroupList) {
      wss.broadcast({type: 'unMark', groups: wss.tempGroupList})
    }
  }, time * 1000)
  return timer
}

/**
 * {type: 'mark', info:{courseId:2, userId:'2015051594',groupId: '14', teacherId: '2015051592'},score:15, role}
 * @param msg
 * @param wss
 * @returns {Promise<void>}
 */
async function giveScore (msg, wss, timer, interval) {
  if (!wss.tempGroupList) return
  // 尝试给小组评分，写入数据库
  // 更改wss.tempGroupList
  let { role } = await scoreAction.checkRole(msg.info.courseId, '', msg.info.userId)
  let userInfo = await userModel.getUserById(msg.info.userId)
  let info = {
    scorer_id: msg.info.userId,
    type: 3,
    title_id: null,
    scorer_name: userInfo.username,
    course_id: msg.info.courseId,
    score: msg.score
  }
  if (role == 'teacher') {
    info.type = 4
  }
  let currentGroupInfo = JSON.parse(await RD.get(wss.WEBSOCKETID))

  // 当前组的所有成员
  let members = currentGroupInfo.group.members
  members.push(currentGroupInfo.group.leader)
  await scoreAction.giveReplyScore(members, info)
  let teaSession
  // 老师评分成功
  if (role == 'teacher') {
    teaSession = cryptSession(`${msg.info.courseId}-teacher-${msg.info.userId}`)
    wss[teaSession].groupId = currentGroupInfo.group.id
  } else {
    teaSession = cryptSession(`${msg.info.courseId}-teacher-${msg.info.teacherId}`)
    wss.tempGroupList.forEach((item, index) => {
      if (item.id === msg.info.groupId) {
        wss.tempGroupList.splice(index, 1)
      }
    })
  }
  if (!wss.tempGroupList.length && wss[teaSession].groupId) {
    wss.tempGroupList = null
    wss.broadcast({type: 'markEnd'})
    clearTimeout(timer)
    clearInterval(interval)
  }
  return 'ok'
}

async function nextGroup (msg, wss) {
  let groupsList = JSON.parse(await RD.get(wss.GROUPREPLYID))
  let groupDetail
  if (groupsList.unReply.length) {
    groupsList.hasReply.push(groupsList.currentReply)
    let randomIdx = Math.floor(Math.random() * groupsList.unReply.length)
    groupsList.currentReply = groupsList.unReply[randomIdx]
    groupsList.unReply.splice(randomIdx, 1)
    groupDetail = await groupAction.getGroupReplyDetail(msg.info.courseId, groupsList.currentReply.id, groupsList.currentReply.leader.stu_id)
  } else {
    groupsList.currentReply = null
    groupDetail = null
  }

  // 每次下一组，重置老师已评分小组
  let teaSession = cryptSession(`${msg.info.courseId}-teacher-${msg.info.userId}`)
  wss[teaSession].groupId = ''
  await RD.set(wss.GROUPREPLYID, JSON.stringify(groupsList))
  await RD.set(wss.WEBSOCKETID, JSON.stringify(groupDetail))
  return groupDetail ? groupDetail : ''
}

module.exports = websocket