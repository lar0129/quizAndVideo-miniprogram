const app = getApp();

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const activityQuestion = db.collection('activityQuestion');
const errorqs = db.collection('WrongQuestion');
const activityRecord = db.collection('activityRecord');
const activityScore = db.collection('activityScore');
const activityUser = db.collection('activityUser');
const testposition = db.collection('test_position');
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
  onLoad:function (options){
    // 获取参数
    let typeId = options.typeId;
    let testNum = options.testNum;
    this.setData({
      typeId : typeId,
      testNum
    });
    // 获取题库-函数执行
    console.log("openId:"+app.globalData.openid)
    this.getQuestionList(Number(typeId));
    this.getPositionId(typeId);

    // 获取缓存
    // this.myGetStorage();
  },

  myGetStorage(){
    let chooseValue = wx.getStorageSync('chooseValue')
    let showAnswer = wx.getStorageSync('showAnswer')
    let wrong = Number(wx.getStorageSync('wrong'))
    let colorList = wx.getStorageSync('colorList')
    this.setData({
      chooseValue:chooseValue,
      showAnswer:showAnswer,
      wrong:wrong,
      colorList:colorList,
    })
    console.log(this.data)
  },

  onUnload: function () {
    wx.setStorageSync('chooseValue', this.data.chooseValue)
    wx.setStorageSync('showAnswer', this.data.showAnswer)
    wx.setStorageSync('wrong', this.data.wrong)
    wx.setStorageSync('colorList', this.data.colorList)
    return
  },

  
  onShow(){
    // console.log("onShow了")
  },

  showTips(_res){
    console.log("enter showTips ")
    let index = Number(_res.data[0].position)
    let _this = this
    if(index!=0){
    wx.showModal({
        title: '是否继续学习',
        content: '上次你学习到第' + (index+1) + '个问题，是否继续？',
        success: function (res) {
          if (res.confirm) {
            index = index
          } 
          else{
            index = 0
          }
          _this.setData({
            // questionList:_this.data.questionList.sort(
            //   function(a, b) {
            //   return a._id - b._id;
            // }),
            positionId:_res.data[0]._id,
            index:index
          })
        },
        fail: function () {

        },
      })
    }
    else{
      _this.setData({
        positionId:_res.data[0]._id,
        index:index
      })
    }
  },

  // 新增记录项
  addPositionId(typeId){
    testposition.add({
      data:{
        typeId:typeId,
        position:0
      },
    }).then(res=>{
      this.setData({
        positionId:res.data[0]._id,
        index:Number(0)
      })
    })
  },

  //关联查询，获取当前位置及ID
  getPositionId(typeId){
    var that = this
    testposition.where({
      typeId:typeId,
      _openid: app.globalData.openid
    }).get()
    .then(res=>{
      console.log("testposition result: ",res)
      if(typeof(res.data) == undefined || res.data == null || res.data ==""){
        this.addPositionId(typeId);
      }
      else {
        this.showTips(res);
      }
    })
    .catch(err=>{
      console.log('something error!');
    })
  },
  // 获取题库-函数定义
  getQuestionList(typeId) {
    // 显示 loading 提示框
    // 数据库集合的聚合操作,每次最多查询20条
    const batchTimes = Math.ceil(this.data.testNum / 20)
    var that = this
    var showAnswer = [];
    for (let times = 0; times < 10; times++) {
      wx.showLoading({
        title: '拼命加载中'
      });
      activityQuestion
      .aggregate()
      .match({       //类似于where，对记录进行筛选
        true: _.exists(true),
        typeId: typeId
      })
      .sort({
        _id : 1,
      })
      .skip(times*20)
      // .sample({ // 随机抽取20题
      //   size: 20
      // })
      .end()
      .then(res => {
        // 获取集合数据，或获取根据查询条件筛选后的集合数据。
        console.log('[云数据库] [activityQuestion] 查询成功')
        let data = res.list || [];
        for (let i = 0; i < data.length; i++) {
          showAnswer.push(false);
          //选项排序
          let keys = Object.keys(data[i]['option']).sort();
          let newoptions={};
          for (let j = 0;j<keys.length;j++){
            newoptions[keys[j]] = data[i]['option'][keys[j]];
          }
          data[i]['option'] = newoptions;
          // console.log(data[i])
          that.data.questionList.push(data[i])
        }
        // if(times == batchTimes-1){
          // 将数据从逻辑层发送到视图层，通俗的说，也就是更新数据到页面展示
        that.setData({
          questionList:that.data.questionList.sort(
            function(a, b) {
            return a._id - b._id;
          }),
          index: 0, 
          showAnswer: showAnswer
        })
        that.onShow();
        wx.hideLoading();
        // }
      })
    }
    // wx.hideLoading();
    return "Finished getQuestionList";
  },
  // 选中选项事件
  radioChange(e){
    console.log('look');
    this.data.chooseValue[this.data.index] = e.detail.value;
  },

  // 确认答案
  confirmAnswer(){
      this.chooseJudge();
  },

  // 上一题
  lastSubmit(){
    // 判断是不是第一题
    if (this.data.index > 0) {
      // 如果不是最后一题，则切换下一题
      let index = this.data.index - 1;
      this.setData({
        index,
      })
    } else {
      // 如果是最后一题，则查看答卷
      return wx.showToast({
        title: '没有上一题了! 请回到首页',
        icon: 'none'
      })
    }
  },

  // 下一题/提交 按钮
  nextSubmit(){

  
    // 判断是不是最后一题
    this.lastJudge();
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
        title: '答案错误! 已计入错题集',
        icon: 'none'
      })
      // 答错则记录错题
      this.ErrorQSAdd(wrongid);
      console.log('false');
      this.data.wrong++;
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


    //更新当前位置
    this.PositionUpdate(this.data.index);
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
  //添加错题(index)
  ErrorQSAdd(wrongId){
    errorqs.where({
      questionId:wrongId,
    }).get()
    .then(res=>{
      if(typeof(res.data) == undefined || res.data == null || res.data ==""){
        console.log('start add error question!');
        console.log(wrongId);
        errorqs.add({
          data:{
          questionId:wrongId
        },
        })
        .then(res=>{
          console.log('sucess add!');
        })
        .catch(err=>{
          console.log(err);
          console.log('add error!');
        })
      }
    })
    .catch(err=>{
      console.log('error question add error');
    })
  },
  //更新当前位置
  PositionUpdate(index){
    let position_id = this.data.positionId;    
  
    console.log("PositionUpdate to : ", position_id)
    testposition.doc(position_id).update({
      data:{
        typeId:this.data.typeId,
        position:index
      },
      success:function(res){
        console.log(res);
      }
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
  // 判断是不是最后一题
  lastJudge(){
    if (this.data.index < this.data.questionList.length - 1) {
      // 如果不是最后一题，则查看是否确认本题
    
      let index = this.data.index + 1;
      this.setData({
        index,
      })
      
    } else {
      // 如果是最后一题，则提交答卷
      return wx.showToast({
        title: '恭喜您答完全部题目! 请在错题集处查看答错题目',
        icon: 'none'
      })
      // this.addExamRecord()
    }
  },

  // 提交答卷
  addExamRecord(){
    wx.showLoading({
      title: '提交答卷中'
    });
    let examResult = {
      wrong: this.data.wrong,
      totalScore: this.data.totalScore,
      nickName: app.globalData.hasUserInfo?app.globalData.userInfo.nickName:'',
      avatarUrl: app.globalData.hasUserInfo?app.globalData.userInfo.avatarUrl:'',
      totalCount: this.data.questionList.length,
      wrongListId: this.data.wrongListId
    };
    activityRecord.add({
      data: {
        ...examResult,
        createDate: db.serverDate()
      }
    }).then(res => {

      activityScore.add({
        data: {
          ...examResult,
          createDate: db.serverDate()
        }
      })

      // 跳转到答题结果页，查看成绩
      wx.reLaunch({
        url: '../result/result?id=' + res._id
      });

      wx.hideLoading();
    })
  },

  changeIndex(){


  }

})