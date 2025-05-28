const app = getApp();

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const activityQuestion = db.collection('activityQuestion');
const WrongQuestion  = db.collection('WrongQuestion');
// 数据库操作符
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    questionList: [],
    index: 0,

    chooseValue: [],
    showAnswer: true,

    totalScore: 0,
    wrong: 0,
    wrongListId: {},

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options){
    // 获取题库-函数执行
    this.getQuestionList(app.globalData.openid);
  },

  // 获取错题库-函数定义
  getQuestionList(openid) {
    wx.showLoading({
      title: '拼命加载中'
    });
    WrongQuestion
    .where({       
      _openid:openid,
    }).get()
    .then(res => {
      let errorId = [];
      for(let i =0;i< res.data.length;i++){
        errorId.push(res.data[i].questionId);
      }

    activityQuestion
    .where({
      _id:_.in(errorId)
    }).get()
    .then(res=>{
      console.log('wrong question ok');
      this.setData({
        questionList:res.data,
        index: 0
      });
      wx.hideLoading();
    })
    })
    .catch(err=>{
      console.log('wrong question error');
    })
  },

  // 选中选项事件
  radioChange(e){
    this.data.chooseValue[this.data.index] = e.detail.value;
  },

  // 下一题/提交 按钮
  nextSubmit(){
    // 判断是不是最后一题
    if (this.data.index < this.data.questionList.length - 1) {
      // 如果不是最后一题，则切换下一题
      let index = this.data.index + 1;
      this.setData({
        index
      })
    } else {
      // 如果是最后一题，则查看答卷
      return wx.showToast({
        title: '没有下一题了! 请回到首页',
        icon: 'none'
      })
    }
  },

  // 上一题
  lastSubmit(){
    // 判断是不是第一题
    if (this.data.index > 0) {
      // 如果不是最后一题，则切换下一题
      let index = this.data.index - 1;
      this.setData({
        index
      })
    } else {
      // 如果是最后一题，则查看答卷
      return wx.showToast({
        title: '没有上一题了! 请回到首页',
        icon: 'none'
      })
    }
  },


  // 查看答卷
  seeExamRecord(){
    
      wx.reLaunch({
        url: '../index/index'
      });

      wx.hideLoading();
    }

})