//index.js
//获取应用实例

const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false
  },


  onLoad() {

  },

  //事件处理函数
  goToTest() {
    wx.navigateTo({
      url: '../test/subject'
    })
  },

  goToDetails() {
    wx.navigateTo({
      url: '../details/details'
    })
  },

  goToVideo() {
    wx.navigateTo({
      url: '../watch/subject'
    })
  },

  goToHistory() {
    wx.navigateTo({
      url: '../history/history'
    })
  },

  goToRank() {
    wx.navigateTo({
      url: '../rank/rank'
    })
  },

  //微信授权登录
  login() {
    let _this = this
    wx.getUserProfile({
      desc: '用于完善资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        wx.setStorageSync("userInfo",res.userInfo)
        app.globalData.userInfo = res.userInfo
        app.globalData.hasUserInfo = true
      }
    })
  },

  onShareAppMessage(res) {
    return {
      title: '@你，快来参与巡护员知识答题活动吧~'
    }
  },
})
