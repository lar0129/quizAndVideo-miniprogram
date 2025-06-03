// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { userIds, approve } = event
  
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return {
      success: false,
      message: '无效的用户ID列表'
    }
  }

  try {
    // 获取用户信息
    const tasks = userIds.map(userId => {
      return db.collection('activityUser').doc(userId).get()
    })

    const userResults = await Promise.all(tasks)
    const users = userResults.map(res => res.data)

    // 发送订阅消息通知
    const notifyTasks = users.map(user => {
      // 这里需要根据微信小程序的订阅消息模板进行配置
      // 以下为示例代码，实际使用时需要替换为真实的模板ID和数据
      if (user && user._openid) {
        return cloud.openapi.subscribeMessage.send({
          touser: user._openid,
          templateId: 'your_template_id_here', // 替换为实际的模板ID
          page: 'pages/my/my',
          data: {
            thing1: {
              value: approve ? '审核通过通知' : '审核未通过通知'
            },
            thing2: {
              value: approve ? '您的账号已通过审核，现在可以使用所有功能' : '您的账号未通过审核，请联系管理员'
            },
            time3: {
              value: new Date().toLocaleString()
            }
          }
        }).catch(err => {
          console.error('发送订阅消息失败', err)
          return null
        })
      }
      return null
    })

    await Promise.all(notifyTasks.filter(task => task !== null))
    
    return {
      success: true,
      message: '通知发送成功'
    }
  } catch (error) {
    console.error('发送通知失败', error)
    return {
      success: false,
      error,
      message: '发送通知失败'
    }
  }
}