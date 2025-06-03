// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { userIds, checked } = event
  
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return {
      success: false,
      message: '无效的用户ID列表'
    }
  }

  try {
    // 批量更新用户审核状态
    const tasks = userIds.map(userId => {
      return db.collection('activityUser').doc(userId).update({
        data: {
          checked: checked
        }
      })
    })

    const results = await Promise.all(tasks)
    
    return {
      success: true,
      results,
      message: '批量更新成功'
    }
  } catch (error) {
    console.error('批量更新用户状态失败', error)
    return {
      success: false,
      error,
      message: '批量更新失败'
    }
  }
}