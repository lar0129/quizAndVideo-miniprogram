// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { autoApprove, adminPassword } = event
  
  // 构建更新数据对象
  const updateData = {}
  if (autoApprove !== undefined) updateData.autoApprove = autoApprove
  if (adminPassword !== undefined) updateData.adminPassword = adminPassword
  
  if (Object.keys(updateData).length === 0) {
    return {
      success: false,
      message: '缺少必要参数'
    }
  }

  try {
    const configCollection = db.collection('systemConfig')
    
    // 查询配置文档
    const configDoc = await configCollection.where({
      configType: 'userApproval'
    }).get()
    
    if (configDoc.data.length === 0) {
      // 创建新配置
      await configCollection.add({
        data: {
          configType: 'userApproval',
          ...updateData,
          updatedAt: new Date()
        }
      })
    } else {
      // 更新现有配置
      await configCollection.doc(configDoc.data[0]._id).update({
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      })
    }
    
    return {
      success: true,
      message: '系统配置更新成功'
    }
  } catch (error) {
    console.error('更新系统配置失败', error)
    return {
      success: false,
      error,
      message: '更新系统配置失败'
    }
  }
}