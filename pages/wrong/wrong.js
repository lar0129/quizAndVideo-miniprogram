const app = getApp();

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const activityQuestion = db.collection('activityQuestion');
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
    // 获取参数
    console.log(options);
    let wrongListId = JSON.parse(options.wrongListId)
    this.setData({
        wrongListId
    });
    // 获取题库-函数执行
    this.getQuestionList(wrongListId)

  },

  // 获取题库-函数定义
  getQuestionList(wrongListId) {
    // 显示 loading 提示框
    wx.showLoading({
      title: '拼命加载中'
    });
    // 数据库集合的聚合操作实例
    activityQuestion
    .aggregate()
    .match({       //类似于where，对记录进行筛选
      true: _.exists(true),
      _id: _.in(wrongListId)
    })
    .end()
    .then(res => {
      // 获取集合数据，或获取根据查询条件筛选后的集合数据。
      console.log('[云数据库] [activityQuestion] 查询成功')
      console.log(res.list)
      let data = res.list || [];
      
      // 将数据从逻辑层发送到视图层，通俗的说，也就是更新数据到页面展示
      this.setData({
        questionList:data,
        index: 0
      });

      // 隐藏 loading 提示框
      wx.hideLoading();
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