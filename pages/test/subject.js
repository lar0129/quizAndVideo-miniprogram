// pages/mode/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
      openid: '',
      subjects: [],
      examcode: '',
      _id: '0000',
      positions: {} // 存储各题库的做题进度
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
    //   let pid = options.id;
        let pid = "001"
      // console.log(pid)
      this.setData({
        pid
      });    
      this.onQuery(pid);
      this.getPositions(); // 获取各题库的做题进度
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
      // 每次显示页面时重新获取做题进度
      this.getPositions();
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
      this.getPositions();
      this.onQuery(this.data.pid);
      wx.stopPullDownRefresh();
    },
  
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
  
    },
  
    // 获取各题库的做题进度
    getPositions: function() {
      const db = wx.cloud.database();
      const app = getApp();
      const testposition = db.collection('test_position');
      
      testposition.where({
        _openid: app.globalData.openid
      }).get().then(res => {
        console.log("获取做题进度成功:", res.data);
        let positions = {};
        
        // 将数据转换为以typeId为键的对象
        res.data.forEach(item => {
          positions[item.typeId] = item.position;
        });
        
        this.setData({
          positions: positions
        });
      }).catch(err => {
        console.error("获取做题进度失败:", err);
      });
    },
  
    // 统计每个题库的题目数量
    getQuestionCounts: function(subjects) {
      const db = wx.cloud.database();
      const _ = db.command;
      const activityQuestion = db.collection('activityQuestion');
      const promises = [];
      
      // 为每个题库创建一个查询题目数量的Promise
      subjects.forEach(subject => {
        const promise = activityQuestion.where({
          typeId: subject.typeId
        }).count().then(res => {
          // 更新题目数量
          subject.count = res.total;
          return subject;
        }).catch(err => {
          console.error("获取题库"+subject.typeId+"题目数量失败:", err);
          subject.count = 0; // 出错时设置为0
          return subject;
        });
        
        promises.push(promise);
      });
      
      // 等待所有查询完成
      return Promise.all(promises).then(updatedSubjects => {
        this.setData({
          subjects: updatedSubjects
        });
        console.log("所有题库题目数量统计完成:", updatedSubjects);
      }).catch(err => {
        console.error("统计题目数量出错:", err);
      });
    },
  
    goToError() {
      wx.navigateTo({
        url: '../wrong/wrong_list'
      })
    },
    goToRank() {
      wx.navigateTo({
        url: '../rank/rank'
      })
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
      let count = e.currentTarget.dataset.count;
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
      let url = '/pages/test/test?typeId='+typeId+'&testNum='+count;
      wx.navigateTo({
        url: url
      })
    },  
    onQuery: function (pid) {
      wx.showLoading({
        title: '加载中'
      });
      
      const db = wx.cloud.database()
      db.collection('activityQuestionType').where({
        pid: pid
      }).get({
        success: res => {
          wx.setStorageSync('activityQuestionType', res.data);
          let subjects = res.data;
          let _id;
          let code;
          if(subjects.length == 1){
            subjects.map(function(obj) { 
              wx.setStorageSync('activityQuestionType', obj);
              _id = obj['_id'];
              code  = obj['code'];
              obj.checked = 'true';
              return obj;
           });
          }
          
          // 获取每个题库的题目数量
          this.getQuestionCounts(subjects);
          
          this.setData({
            _id,
            code
          })
          console.log('[数据库] [查询记录] 成功: ', res)
          wx.hideLoading();
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
          wx.hideLoading();
        }
      })
    }
  })