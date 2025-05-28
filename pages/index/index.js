//index.js
//获取应用实例

const app = getApp()
const db = wx.cloud.database();
const activityUser = db.collection('activityUser');
Page({
  data: {
    userInfo: {},
    hasUserInfo: false
  },
  onLoad() {
    this.login();
    this.getUserProfile();
  },
  InitUser(){
    activityUser.where({
      _openid:app.globalData.openid
    }).get()
    .then(res=>{
      if(typeof(res.data) == undefined || res.data == null || res.data ==""){
        activityUser.add({
          data:{
            question_num:Number(0)
          },
        }).then(res=>{
          console.log("add success");
        }).catch(err=>{
          console.log("add error");
          console.log(err);
        })
      }
    })
    .catch(err=>{
      console.log('init user error');
      console.log(err);
    })
  },
  login(){
    console.log("login");
    wx.cloud.callFunction({
      name:'login',
      success:res=>{
        console.log("login openid: ", res.result.openid);
        app.globalData.openid=res.result.openid;
      },
      fail:err=>{
        console.error(err);
      }
    })
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
  getUserProfile(e) {
    let _this = this
    // this.InitUser();
    wx.getUserProfile({
      desc: '用于完善资料',
      success: (res) => {
        console.log("getUserProfile:", res);
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        console.log("userInfo: ", res.userInfo);
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
