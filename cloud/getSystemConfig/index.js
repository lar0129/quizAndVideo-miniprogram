// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 从系统配置集合中获取配置信息
    const configCollection = db.collection('systemConfig')
    
    // 查询配置文档，如果不存在则创建默认配置
    let configDoc = await configCollection.where({
      configType: 'userApproval'
    }).get()
    
    if (configDoc.data.length === 0) {
      // 创建默认配置
      await configCollection.add({
        data: {
          configType: 'userApproval',
          autoApprove: false,
          adminPassword: '123456', // 默认管理员密码
          updatedAt: new Date()
        }
      })
      
      // 重新获取配置
      configDoc = await configCollection.where({
        configType: 'userApproval'
      }).get()
    }
    
    return {
      success: true,
      config: configDoc.data[0] || { autoApprove: false }
    }
  } catch (error) {
    console.error('获取系统配置失败', error)
    return {
      success: false,
      error,
      message: '获取系统配置失败'
    }
  }
}