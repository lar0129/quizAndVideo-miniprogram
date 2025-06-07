// 云函数入口文件
const cloud = require('wx-server-sdk')
const rp = require('request-promise')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 获取access_token
async function getAccessToken() {
  // 通过where查询，兼容没有doc('ACCESS_TOKEN')的情况
  const res = await db.collection('accessToken').where({_id: 'ACCESS_TOKEN'}).get();
  if (res.data && res.data.length > 0) {
    return res.data[0].token;
  } else {
    throw new Error('access_token not found');
  }
}

// 发送订阅消息
async function sendTemplateMsg(token, param) {
  return await rp({
    json: true,
    method: 'POST',
    uri: 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' + token,
    body: {
      touser: param.touser,
      template_id: param.templateId,
      page: param.page,
      data: param.data
    }
  }).then(res => {
    return true
  }).catch(err => {
    console.error('订阅消息发送失败', err)
    return false
  })
}

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

    // 获取access_token
    const token = await getAccessToken()

    // 发送订阅消息通知
    const notifyTasks = users.map(user => {
      if (user && user._openid) {
        return sendTemplateMsg(token, {
          touser: user._openid,
          templateId: 'kfOfmwl9j51fnXMDa5NO6DqXpT30UpAdg0_RFVpLr7A', // 替换为你的模板ID
          page: 'pages/my/my', // 跳转页面
          data: {
            phrase10: {
              value: approve ? '审核通过通知' : '审核未通过通知'
            },
            thing15: {
              value: approve ? '您的账号已通过审核，现在可以使用所有功能' : '您的姓名或电话未通过审核，请联系管理老师'
            },
            thing8: {
              value: user.realName || ''
            }
          }
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