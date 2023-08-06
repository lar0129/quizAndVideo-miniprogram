// pages/mode/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
      openid: '',
      subjects: [],
      examcode: '',
      _id: '0000'
  
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      console.log(options);
    //   let pid = options.id;
        let pid = "001"
    //   console.log(pid)
      this.setData({
        pid
      });    
      this.onQuery(pid);
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
  
    },
    toEntryPage: function(e){
      console.log(e.currentTarget.dataset);
      let id = e.currentTarget.dataset.id;
      let typeId = e.currentTarget.dataset.typeid;
      if(id == '0000'){
        wx.showModal({
          showCancel: false,
          title: '提示',
          content: '请先选择一个科目',
          success (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        return;
      }
      console.log("typeId: "+typeId)
      let url = '/pages/watch/video?typeId='+typeId;
      wx.navigateTo({
        url: url
      })
    },  
    onQuery: function (pid) {
  
      const db = wx.cloud.database()
      db.collection('activityVideoType').where({
        pid: pid
      }).get({
        success: res => {
          wx.setStorageSync('activityVideoType', res.data);
          let subjects = res.data;
          let _id;
          let code;
          if(subjects.length == 1){
            subjects.map(function(obj) { 
              wx.setStorageSync('activityVideoType', obj);
              _id = obj['_id'];
              code  = obj['code'];
              obj.checked = 'true';
              return obj;
           });
          }
          this.setData({
            subjects,
            _id,
            code
          })
          console.log('[数据库] [查询activityVideoType] 成功: ', res)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询activityVideoType] 失败：', err)
        }
      })
    }
  })