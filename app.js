//app.js

App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env:'protection-network-9dcczf5cfedb7',
        traceUser: true,
      })
    }
  },
  globalData: {
    userInfo: {},
    hasUserInfo: false
  }
})