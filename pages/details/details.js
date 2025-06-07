// pages/details/details.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 如果是从首页的新手指导按钮跳转过来，则显示使用说明弹窗
    // if (options && options.from === 'guide') {
    //   this.showGuideModal();
    // }
  },

  /**
   * 显示使用说明弹窗
   */
  showGuideModal: function() {
    wx.showModal({
      title: '使用说明',
      content: '欢迎使用巡护员知识答题小程序！\n\n1. 点击"题库练习"进入题库选择页面\n2. 选择题库开始答题\n3. 答题完成后可查看成绩\n4. 在"我的信息"中可以查看个人资料',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  }
})