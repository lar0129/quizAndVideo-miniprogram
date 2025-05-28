//app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env:'cloud1-7gfstacub176055e',
        traceUser: true,
      })
    }
  },
  globalData: {
    userInfo: {},
    openid:null,
    hasUserInfo: false
  }
})