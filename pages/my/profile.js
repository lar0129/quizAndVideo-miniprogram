const app = getApp();
const apis = app.apis;
const utils = app.utils;

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const activityUser = db.collection('activityUser');
// 数据库操作符
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '../../image/nouser.png',
    nickname:'',
    tel:'',
    company:'',
    fileTempPath:'',
    trueName:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  initInfo(){
    let userInfo = wx.getStorageSync('userInfo');
    console.log(userInfo)
    if (userInfo) {
      this.setData({
        avatarUrl:userInfo.avatarUrl,
        nickname:userInfo.nickname,
        tel:userInfo.tel,
        trueName:userInfo.trueName,
        company:userInfo.company,
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.initInfo();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    console.log("avatarUrl", avatarUrl)
    this.setData({
      fileTempPath:avatarUrl,
      avatarUrl:avatarUrl,
    })
  },
  onChangeNickname(e){
    this.setData({
      nickname:e.detail.value
    })
  },
  onChangeTel(e){
    this.setData({
      tel:e.detail.value
    })
  },
  onChangeTrueName(e){
    this.setData({
      trueName:e.detail.value
    })
  },
  onChangeCompany(e){
    this.setData({
      company:e.detail.value
    })
    console.log(e.detail);
  },
  submitUserInfo(){
    activityUser.where({
      _openid:app.globalData.openid
    })
    .update({
      data:{
        company:this.data.company,
        tel:this.data.tel,
        nickname:this.data.nickname,
        avatarUrl:this.data.avatarUrl,
        trueName:this.data.trueName,
        checked:false
      },
    }).then(res=>{
      console.log("activityinfo update success");
      wx.showToast({
        title: '成功提交待审核',
        icon: 'success',
        duration: 2000//持续的时间
      })
    })
    .catch(err=>{
      wx.showToast({
        title: '提交审核失败',
        icon: 'success',
        duration: 2000//持续的时间
      })

    })
  }
})