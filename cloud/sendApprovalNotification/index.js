// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { openid, approve,realName } = event
  
  try {
    const result = await cloud.openapi.subscribeMessage.send({
          touser: openid,
          templateId: 'kfOfmwl9j51fnXMDa5NO6AWi3oHJ0CtMSpqnIrm-RMQ', // 替换为你的模板ID
          // page: 'pages/my/my', // 跳转页面
          data: {
            phrase10: {
              value: approve ? '审核通过' : '审核未通过'
            },
            thing15: {
              value: approve ? '您的账号已通过审核，现在可以使用所有功能' : '您的姓名或电话未通过审核，请联系管理老师'
            },
            thing8: {
              value: realName || '未知姓名'
            }
          }
        }).catch(err => {
          console.error('发送订阅消息失败', err)
          return {
            success: false,
            err,
            message: '发送通知失败'
          }
        })
      
    return {
      success: true,
      message: '发送通知成功'
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