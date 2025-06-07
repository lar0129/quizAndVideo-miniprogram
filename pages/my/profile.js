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
    trueName:'',
    checked: null, // 用户审核状态
    canSubmit: true // 是否可以提交审核
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  
  /**
   * 获取用户信息和审核状态
   */
  getUserInfo() {
    let userInfo = wx.getStorageSync('userInfo');
    console.log(userInfo);
    if (userInfo) {
      this.setData({
        avatarUrl: userInfo.avatarUrl || this.data.avatarUrl,
        nickname: userInfo.nickname || '',
        tel: userInfo.tel || '',
        trueName: userInfo.trueName || '',
        company: userInfo.company || '',
      });
    }
    
    // 从数据库获取最新的用户审核状态
    if (app.globalData.openid) {
      activityUser.where({
        _openid: app.globalData.openid
      }).get().then(res => {
        if (res.data && res.data.length > 0) {
          const userData = res.data[0];
          const checked = userData.checked;
          
          // 更新本地存储的用户信息
          if (userData) {
            wx.setStorageSync('userInfo', userData);
          }
          
          // 设置审核状态和是否可提交
          this.setData({
            checked: checked,
            canSubmit: checked !== 'approved', // 如果状态是已通过，则不能再提交
            avatarUrl: userData.avatarUrl || this.data.avatarUrl,
            nickname: userData.nickname || '',
            tel: userData.tel || '',
            trueName: userData.trueName || '',
            company: userData.company || ''
          });
        }
      }).catch(err => {
        console.error('获取用户信息失败', err);
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getUserInfo();
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
    this.getUserInfo();
    wx.stopPullDownRefresh();
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
    // 如果用户已通过审核，不允许再次提交
    if (this.data.checked === 'approved') {
      wx.showToast({
        title: '您已通过审核',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 先获取系统配置，检查是否开启了自动审核
    wx.cloud.callFunction({
      name: 'getSystemConfig'
    }).then(res => {
      // 获取自动审核状态
      const autoApprove = res.result && res.result.config && res.result.config.autoApprove || false;
      // 验证电话号码格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      const isValidPhone = phoneRegex.test(this.data.tel);
      
      // 判断用户名长度和电话格式
      const checkedStatus = autoApprove && 
        this.data.trueName.length >= 2 && 
        isValidPhone ? 'approved' : 'pending';
      // 更新用户信息
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
          checked: checkedStatus // 根据自动审核设置决定状态
        },
      }).then(res=>{
        console.log("activityinfo update success");
        // 更新本地状态
        this.setData({
          checked: checkedStatus
        });
        
        wx.showToast({
          title: '成功提交待审核',
          icon: 'success',
          duration: 2000//持续的时间
        })
      })
      .catch(err=>{
        wx.showToast({
          title: '提交审核失败',
          icon: 'none',
          duration: 2000//持续的时间
        })
      })
    }).catch(err => {
      console.error('获取系统配置失败', err);
      // 如果获取配置失败，默认设置为待审核
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
          checked: 'pending' // 默认设置为待审核
        },
      }).then(res=>{
        console.log("activityinfo update success");
        // 更新本地状态
        this.setData({
          checked: 'pending'
        });
        
        wx.showToast({
          title: '成功提交待审核',
          icon: 'success',
          duration: 2000//持续的时间
        })
      })
      .catch(err=>{
        wx.showToast({
          title: '提交审核失败',
          icon: 'none',
          duration: 2000//持续的时间
        })
      })
    });
  }
})