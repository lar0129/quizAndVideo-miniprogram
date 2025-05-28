const app = getApp();

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const activityQuestion = db.collection('activityQuestion');
const errorqs  = db.collection('WrongQuestion');
const activityUser = db.collection('activityUser');

// 数据库操作符
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    questionList: [],
    index: 0,
    positionId:0,
    typeId:null,

    chooseValue: [],
    showAnswer: [],
    colorList:[],

    totalScore: 0,
    wrong: 0,
    wrongListId: [],
    wrongListSort: [],
    questionNumber:{
      right:0,
      error:0,
      count:0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options){
    // 获取题库-函数执行
    this.getQuestionList(app.globalData.openid);
  },

  onUnload: function () {
    wx.setStorageSync('chooseValue', this.data.chooseValue)
    wx.setStorageSync('showAnswer', this.data.showAnswer)
    wx.setStorageSync('wrong', this.data.wrong)
    wx.setStorageSync('colorList', this.data.colorList)
    return
  },

  // 获取错题库-函数定义
  getQuestionList(openid) {
    wx.showLoading({
      title: '拼命加载中'
    });
    errorqs
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

  confirmAnswer(){
    this.chooseJudge();
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

  // 判断所选择的选项是否为正确答案
  chooseJudge(){
    if(this.data.showAnswer[this.data.index] == true){
      return wx.showToast({
        title: '已提交答案!',
        icon: 'none'
      })
    }

    if (this.data.chooseValue[this.data.index] == undefined || this.data.chooseValue[this.data.index].length == 0)
    {  
      return wx.showToast({
        title: '请选择答案!',
        icon: 'none'
      })
    }

    var trueValue = this.data.questionList[this.data.index]['true'];
    var chooseVal = this.data.chooseValue[this.data.index];
    console.log("chooseVal: ", chooseVal)
    console.log("trueValue: ", trueValue)

    var wrongid = this.data.questionList[this.data.index]._id;
    
    // 判断是否为多选题
    var isMultiQuestion = trueValue.length > 1;
    var isCorrect = false;
    
    if (Array.isArray(chooseVal)) {
      // 将用户选择的选项转换为字符串数组
      var chooseValStr = chooseVal.join('');
    }
    if (isMultiQuestion) {
      // 多选题判断逻辑
      // 检查用户选择的选项数量是否与正确答案相同
      if (chooseVal.length === trueValue.length) {
        // 对用户选择的选项进行排序，然后与正确答案比较
        var sortedChooseVal = chooseValStr.split('').sort().join('');
        var sortedTrueValue = trueValue.split('').sort().join('');
        isCorrect = (sortedChooseVal === sortedTrueValue);
      }
    } else {
      // 单选题判断逻辑
      isCorrect = (chooseVal.toString() === trueValue.toString());
    }
    
    if (!isCorrect) {
      wx.showToast({
        title: '答案错误! ',
        icon: 'none'
      })
      // 答错
      console.log('false');
      this.data.wrongListSort.push(this.data.index);
      this.data.wrongListId.push(this.data.questionList[this.data.index]._id);
      this.data.questionNumber.error++;
    } else {
      wx.showToast({
        title: '答案正确!',
        icon: 'none'
      })
      // 答对则累计总分
      this.ErrorQSUpdate(wrongid);
      // 更新答题数  
      this.QuestionNumUpdate();
      this.setData({
        totalScore: this.data.totalScore + 5,
      })
      this.data.questionNumber.right++;
    }
    // 修改css
    let rightAnswer = this.data.questionList[this.data.index].true
    let chooseValue = this.data.chooseValue[this.data.index]
    this.data.colorList[this.data.index] = {}
    
    // 先将所有用户选择的选项设置为红色
    for(let i=0;i<chooseValue.length;i++){
      this.data.colorList[this.data.index][chooseValue[i]]= 'rgba(255, 0, 0, 0.473)'
    }
    
    // 再将所有正确答案设置为绿色
    for(let i=0;i<rightAnswer.length;i++){
      this.data.colorList[this.data.index][rightAnswer[i]]= 'rgba(0, 128, 0, 0.452)'
      if(!isCorrect && chooseValue.indexOf(rightAnswer[i]) !== -1){
        this.data.colorList[this.data.index][rightAnswer[i]]= 'rgba(255, 255, 0, 0.5)' // 黄色
      }
    }

    //题目记录
    this.data.questionNumber.count++;
    this.data.showAnswer[this.data.index] = true;
    this.setData({
      questionNumber: this.data.questionNumber,
      showAnswer: this.data.showAnswer,
      colorList : this.data.colorList
    })
    console.log(this.data.colorList)
  },

  //更新错题
  ErrorQSUpdate(wrongId){
    errorqs.where({
      questionId:wrongId,
    }).get()
    .then(res=>{
      if(res.data == undefined || res.data == null){
        console.log('never wrong!');
      }
      else{
        errorqs.doc(res.data[0]._id).remove()
        .then(res=>{
          console.log('delete wrong question');
        })
        .catch(err=>{
          console.log('delete error');
        })
      }
    })
    .catch(err=>{
      console.log('error question update error');
    })
  },

   //更新已答题数目
   QuestionNumUpdate(){
    let openId = app.globalData.openid
    activityUser.where({
      _openid: openId
    })
    .update({
      data:{
        question_num:_.inc(1)
      },
    })
    .then(res=>{
      if(res.stats.updated===0){
        this.addQuestionNum()
        console.log("addQuestionNum!")
      }
    })
    .catch(err=>{
      console.log(err);
      console.log('QuestionNumUpdate error!');
    })
  
  },
  // 新增记录项
  addQuestionNum(){
    let userInfo = app.globalData.userInfo
    activityUser.add({
      data:{
        username:userInfo.nickName,
        avatarUrl:userInfo.avatarUrl,
        question_num:1
      },
    }).then(res=>{
       console.log(res);
    })

  },
  // 查看答卷
  seeExamRecord(){
    
      wx.reLaunch({
        url: '../index/index'
      });

      wx.hideLoading();
    }

})