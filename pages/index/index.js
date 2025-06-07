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
  },
  getUserProfile(){
    activityUser.where({
      _openid:app.globalData.openid
    }).get()
    .then(res=>{
      console.log("getUserProfile:", res);
      if(typeof(res.data) == undefined || res.data == null || res.data ==""){
        activityUser.add({
          data:{
            // _openid:app.globalData.openid,
            question_num:Number(0)
          },
        }).then(res=>{
          console.log("getUserProfile add success");
        }).catch(err=>{
          console.log("getUserProfile add error");
          console.log(err);
        })
      }
      else{
        this.setData({
          userInfo: res.data[0],
          hasUserInfo: true
        })
        wx.setStorageSync("userInfo",res.data[0])
        app.globalData.userInfo = res.data[0]
        app.globalData.hasUserInfo = true
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
        this.getUserProfile();
      },
      fail:err=>{
        console.error(err);
      }
    })
  },
  //事件处理函数
  goToTest() {
    // 刷新缓存，获取用户状态
    console.log("login");
    wx.cloud.callFunction({
      name:'login',
      success:res=>{
        console.log("login openid: ", res.result.openid);
        app.globalData.openid=res.result.openid;
        activityUser.where({
          _openid:app.globalData.openid
        }).get()
        .then(res=>{
          console.log("getUserProfile:", res);
          if(typeof(res.data) == undefined || res.data == null || res.data ==""){
            activityUser.add({
              data:{
                // _openid:app.globalData.openid,
                question_num:Number(0)
              },
            }).then(res=>{
              console.log("getUserProfile add success");
            }).catch(err=>{
              console.log("getUserProfile add error");
              console.log(err);
            })
          }
          else{
            this.setData({
              userInfo: res.data[0],
              hasUserInfo: true
            })
            wx.setStorageSync("userInfo",res.data[0])
            app.globalData.userInfo = res.data[0]
            app.globalData.hasUserInfo = true
          }
    
          if (this.data.userInfo.checked != "approved") {
            wx.showModal({
              title: '提示',
              content: '您的账号尚未通过审核，请等待管理员审核后，退出重启再试',
              showCancel: false
            });
            return;
          }
          wx.navigateTo({
            url: '../test/subject'
          })
        })
        .catch(err=>{
          console.log('init user error');
          console.log(err);
        })
      },
      fail:err=>{
        console.error(err);
      }
    })
  },

  goToDetails() {
    wx.navigateTo({
      url: '../details/details?from=guide'
    })
  },

  goToVideo() {
    wx.navigateTo({
      url: '../watch/subject'
    })
  },

  goToMy() {
    wx.navigateTo({
      url: '../my/my'
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

  onShareAppMessage(res) {
    return {
      title: '@你，快来参与巡护员知识答题活动吧~'
    }
  },
})
