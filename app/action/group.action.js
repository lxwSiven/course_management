const Mysql = require('../common/helper/mysql')
const groupModel = require('../model/group.model')(new Mysql('group'))
const titleGroupModel = require('../model/titleGroup.model')(new Mysql('title_group'))
const topicModel = require('../model/topic.model')(new Mysql('topic'))
const courseModel = require('../model/course.model')(new Mysql('course'))
const fileModel = require('../model/file.model')(new Mysql('file'))
const stuCourseModel = require('../model/stuCourse.model')(new Mysql('stu_course'))
const titleModel = require('../model/title.model')(new Mysql('title'))

const action = {
  /**
   * 获取某个题目下没有被评分的小组
   * @param courseId 课程id
   * @param titleId 题目（作业）id
   * @returns {Promise<Array>}
   */
  async getUnMarkGroups (courseId, titleId) {
    let result = await titleGroupModel.getUnMarkGroups(titleId)
    let groups = []
    for (let key in result) {
      // 小组基本信息
      let group = await groupModel.getGroupById(result[key].group_id)
      // 小组成员信息
      let member = await stuCourseModel.getStudentsByGroupId(result[key].group_id)
      let leader = (await stuCourseModel.getLeaderByGroupId(result[key].group_id))[0]
      group.members = member
      group.leader = leader
      // 小组选题信息
      let topic = await topicModel.getTopicById(group.select_topic_id)
      // 小组所在课程信息
      let courseName = await courseModel.getCourseNameById(group.course_id)
      // 小组文件信息
      let files = await fileModel.getUserFiles(titleId, group.group_leader)
      let title = await titleModel.getTitleById(titleId)
      files.forEach(file => {
        file.titleName = title.title
      })

      // 给小组评分所需要展示的信息
      groups.push({
        group: group,
        topic: {
          id: topic.id,
          name: topic.title
        },
        title: {
          id: title.id,
          name: title.title,
          maxScore: title.score
        },
        course: courseName[0],
        files: files
      })
    }
    return groups
  },

  /**
   * 根据课程获取 课程下的所有小组
   * @param courseId 课程id
   * @returns {Promise<*>}
   */
  async getGroups (courseId) {
    let result = await groupModel.getGroups(courseId)
    for (let key in result) {
      let rs = result[key]
      let leader = (await stuCourseModel.getLeaderByGroupId(rs.id))[0]
      rs.leader = leader
      // 是否选题
      if (!rs.select_topic_id) {
        rs.select_topic_id = ''
        rs.topicName = ''
      } else {
        let topic = await topicModel.getTopicById(rs.select_topic_id)
        rs.topicName = topic.title
      }
    }
    return result
  },

  /**
   * 获取某个小组的详细信息
   * @param courseId 当前课程id
   * @param groupId 小组id
   * @returns {Promise<*>}
   */
  async getGroupById (courseId, groupId) {
    let result = await groupModel.getGroupById(groupId)
    let course = await courseModel.getCourseById(courseId)
    let member = await stuCourseModel.getStudentsByGroupId(result.id)
    let leader = await stuCourseModel.getLeaderByGroupId(result.id)

    // 扩展group信息，包括成员、组长、最大成员数、课程信息、选题等
    result.members = member
    result.leader = leader
    result.maxGroupNum = course.max_group_size
    result.courseId = course.id
    result.courseName = course.course_name
    // 是否选题，
    if (!result.select_topic_id) {
      result.select_topic_id = ''
      result.topicName = ''
    } else {
      let topic = await topicModel.getTopicById(result.select_topic_id)
      result.topicName = topic.title
    }
    return result
  },

  async getUserGroup (courseId, userId) {
    let group = (await stuCourseModel.getItem(courseId, userId))[0]
    return await this.getGroupReplyDetail(courseId, group.team_id, userId)
  },

  async getUserGroupId (courseId, userId) {
    let group = (await stuCourseModel.getItem(courseId, userId))[0]
    if (group) {
      return group.team_id
    } else {
      return ''
    }
  },

  /**
   * 加入小组
   * @param courseId 小组所在课程id
   * @param groupId 小组id
   * @param userId 当前用户id
   * @returns {Promise<string>}
   */
  async joinGroup (courseId, groupId, userId) {
    let course = await courseModel.getCourseById(courseId)
    let group = await groupModel.getGroupById(groupId)
    let isLeader = false
    if (group.member_num === 0) {
      isLeader = true
      await groupModel.joinGroup(groupId, userId, {num: 0, isLeader})
      await stuCourseModel.joinGroup(courseId, userId, {is_groupleader: 1, team_id: groupId})
    } else if (group.member_num < course.max_group_size) {
      // 可加入
      await groupModel.joinGroup(groupId, userId, {num: group.member_num, isLeader})
      await stuCourseModel.joinGroup(courseId, userId, {is_groupleader: 2, team_id: groupId})
    } else {
      // 不可加入
      return ''
    }
    return 'ok'
  },

  /**
   * 退出小组
   * @param courseId 小组所在课程id
   * @param groupId 小组id
   * @param userId 要退出小组的用户id
   * @returns {Promise<string>}
   */
  async quitGroup (courseId, groupId, userId) {
    let isLeader = await groupModel.isLeader(groupId, userId)
    let group = await groupModel.getGroupById(groupId)
    let rowInfo = {member_num: --group.member_num}

    // 要退组的是小组长
    // 两种情况； 1、小组只有组长一人。2、有其他成员
    // 第二中情况从小组成员中选一人作为新的组长
    if (isLeader) {
      let members = await stuCourseModel.getStudentsByGroupId(groupId)
      if (members.length) {
        rowInfo.group_leader = members[0].stu_id
      } else {
        rowInfo.group_leader = null
      }
    }
    // 修改group表和 stuCourse 表
    await groupModel.quitGroup(groupId, rowInfo)
    await stuCourseModel.quitGroup(courseId, userId, rowInfo.group_leader)
    return 'ok'

    // 要退的是小组长，则删除小组。
    // if (isLeader) {
    //   this.deleteGroup(courseId, groupId)
    // } else {
    //   await groupModel.quitGroup(groupId, rowInfo)
    //   await stuCourseModel.quitGroup(courseId, userId)
    // }
    // return 'ok'
  },

  /**
   * 选择题目
   * @param groupId
   * @param topicId
   * @returns {Promise<void>}
   */
  async selectTopic (groupId, topicId) {
    let result = await groupModel.selectTopic(groupId, topicId)
    return result
  },

  /**
   * 新建小组
   * @param courseId 课程id
   * @param info 小组信息 {userId, groupNum, groupName, role}
   * @returns {Promise<void>}
   */
  async createGroup (courseId, info) {
    let result = await groupModel.createGroup(courseId, info)
    let titles = await titleModel.getTitles(courseId)
    titles = titles.map(item => {
      return item.id
    })

    let groups = []
    let insertId = result.insertId
    for (let i = 0; i < info.groupNum; i++) {
      groups.push(insertId++)
    }

    if (info.groupNum == 1 && info.role == 'student') {
      await stuCourseModel.joinGroup(courseId, info.userId, {is_groupleader: 1, team_id: result.insertId})
    }

    if (titles.length) {
      await titleGroupModel.insertItems(titles, groups)
    }
    return result
  },

  /**
   * 删除指定小组
   * @param courseId 课程id
   * @param groupId 小组id
   * @returns {Promise<void>}
   */
  async deleteGroup (courseId, groupId) {
    let member = await stuCourseModel.getStudentsByGroupId(groupId)
    let leader = await stuCourseModel.getLeaderByGroupId(groupId)
    member.push(...leader)
    // 清除小组成员和小组的关联
    let result = await stuCourseModel.deleteGroup(courseId, groupId, member)
    let titles = await titleModel.getTitles(courseId)
    titles = titles.map(item => {
      return item.id
    })
    // 清除小组和课程作业的关联
    await titleGroupModel.deleteGroup(titles, groupId)
    // 清除小组表中的小组记录
    await groupModel.deleteGroup(courseId, groupId)
    return result
  },
  async getGroupReplyDetail (courseId, groupId, userId) {
    // 小组基本信息
    let group = await groupModel.getGroupById(groupId)
    // 小组成员信息
    let member = await stuCourseModel.getStudentsByGroupId(groupId)
    let leader = (await stuCourseModel.getLeaderByGroupId(groupId))[0]
    group.members = member
    group.leader = leader
    // 小组选题信息
    let topic = await topicModel.getTopicById(group.select_topic_id)
    // 小组所在课程信息
    let courseName = await courseModel.getCourseNameById(group.course_id)
    // 小组文件信息
    let files = await fileModel.getReplyFiles(courseId, leader.stu_id)

    return {
      group: group,
      topic: {
        id: topic.id,
        name: topic.title
      },
      course: courseName[0],
      files: files
    }
  }
}

module.exports = action