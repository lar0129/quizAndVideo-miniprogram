const app = getApp();

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const activityQuestion = db.collection('activityQuestion');
const errorqs = db.collection('WrongQuestion');
const activityQuestionType = db.collection('activityQuestionType');

// 数据库操作符
const _ = db.command;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    subjects: [],
    wrongQuestions: [],
    currentTypeId: null,
    openid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      openid: app.globalData.openid
    });
    this.getSubjects();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 如果有当前选中的题库类型，则刷新错题列表
    if (this.data.currentTypeId) {
      this.getWrongQuestionsByType(this.data.currentTypeId);
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getSubjects();
    wx.stopPullDownRefresh();
  },

  // 获取题库分类并统计每个分类的错题数量
  getSubjects: function() {
    wx.showLoading({
      title: '加载中'
    });

    // 先获取所有题库分类
    activityQuestionType.get().then(res => {
      let subjects = res.data;
      
      // 获取用户的所有错题 - 使用分页查询获取全部错题
      this.getAllWrongQuestions().then(wrongQuestions => {
        // 如果没有错题，直接设置空数组
        if (wrongQuestions.length === 0) {
          this.setData({
            subjects: []
          });
          wx.hideLoading();
          return;
        }
        
        let wrongIds = wrongQuestions.map(item => item.questionId);
        
        // 获取所有错题的详细信息 - 使用分页查询获取全部错题详情
        this.getAllQuestionsByIds(wrongIds).then(questions => {
          // 按题库类型分组统计错题数量
          let typeCountMap = {};
          questions.forEach(question => {
            if (!typeCountMap[question.typeId]) {
              typeCountMap[question.typeId] = 0;
            }
            typeCountMap[question.typeId]++;
          });
          
          // 更新subjects数组，添加错题数量
          let filteredSubjects = subjects.filter(subject => {
            if (typeCountMap[subject.typeId]) {
              subject.count = typeCountMap[subject.typeId];
              return true;
            }
            return false;
          });
          
          this.setData({
            subjects: filteredSubjects
          });
          
          wx.hideLoading();
        }).catch(err => {
          console.error('获取错题详情失败', err);
          wx.hideLoading();
        });
      }).catch(err => {
        console.error('获取错题列表失败', err);
        wx.hideLoading();
      });
    }).catch(err => {
      console.error('获取题库分类失败', err);
      wx.hideLoading();
    });
  },

  // 分页获取所有错题
  getAllWrongQuestions: function() {
    return new Promise((resolve, reject) => {
      const batchSize = 20; // 微信小程序限制每次最多查询20条
      let allWrongQuestions = [];
      let currentPage = 0;
      
      // 定义递归函数获取分页数据
      const fetchPage = () => {
        errorqs.where({
          _openid: this.data.openid
        })
        .skip(currentPage * batchSize)
        .limit(batchSize)
        .get()
        .then(res => {
          const pageData = res.data;
          allWrongQuestions = allWrongQuestions.concat(pageData);
          
          // 如果返回的数据量等于batchSize，说明可能还有更多数据
          if (pageData.length === batchSize) {
            currentPage++;
            fetchPage(); // 递归获取下一页
          } else {
            // 所有数据获取完毕
            resolve(allWrongQuestions);
          }
        })
        .catch(err => {
          reject(err);
        });
      };
      
      // 开始获取第一页
      fetchPage();
    });
  },

  // 分页获取指定ID列表的所有题目
  getAllQuestionsByIds: function(ids) {
    return new Promise((resolve, reject) => {
      // 由于微信小程序限制，in查询最多支持20个值，需要分批查询
      const batchSize = 20;
      let allQuestions = [];
      let promises = [];
      
      // 将ID列表分成多个批次，每批次不超过20个ID
      for (let i = 0; i < ids.length; i += batchSize) {
        const batchIds = ids.slice(i, i + batchSize);
        const promise = activityQuestion.where({
          _id: _.in(batchIds)
        }).get().then(res => {
          return res.data;
        });
        
        promises.push(promise);
      }
      
      // 等待所有批次查询完成
      Promise.all(promises)
        .then(results => {
          // 合并所有批次的结果
          results.forEach(batch => {
            allQuestions = allQuestions.concat(batch);
          });
          resolve(allQuestions);
        })
        .catch(err => {
          reject(err);
        });
    });
  },

  // 根据题库类型获取错题列表
  getWrongQuestionsByType: function(typeId) {
    wx.showLoading({
      title: '加载中'
    });
    
    // 获取用户的所有错题ID - 使用分页查询获取全部错题
    this.getAllWrongQuestions().then(wrongQuestions => {
      let wrongIds = wrongQuestions.map(item => item.questionId);
      
      // 分批获取指定题库类型的错题
      this.getQuestionsByTypeAndIds(wrongIds, typeId).then(questions => {
        // 处理问题预览文本
        questions.forEach(item => {
          // 为每个问题添加预览文本，限制长度为20个字符
          item.questionPreview = item.question.length > 20 ? 
            item.question.substring(0, 20) + '...' : 
            item.question;
        });

        this.setData({
          wrongQuestions: questions,
          currentTypeId: typeId
        });
        
        wx.hideLoading();
      }).catch(err => {
        console.error('获取错题详情失败', err);
        wx.hideLoading();
      });
    }).catch(err => {
      console.error('获取错题列表失败', err);
      wx.hideLoading();
    });
  },

  // 分页获取指定题库类型和ID列表的所有题目
  getQuestionsByTypeAndIds: function(ids, typeId) {
    return new Promise((resolve, reject) => {
      // 由于微信小程序限制，in查询最多支持20个值，需要分批查询
      const batchSize = 20;
      let allQuestions = [];
      let promises = [];
      
      // 将ID列表分成多个批次，每批次不超过20个ID
      for (let i = 0; i < ids.length; i += batchSize) {
        const batchIds = ids.slice(i, i + batchSize);
        const promise = activityQuestion.where({
          _id: _.in(batchIds),
          typeId: typeId
        }).get().then(res => {
          return res.data;
        });
        
        promises.push(promise);
      }
      
      // 等待所有批次查询完成
      Promise.all(promises)
        .then(results => {
          // 合并所有批次的结果
          results.forEach(batch => {
            allQuestions = allQuestions.concat(batch);
          });
          resolve(allQuestions);
        })
        .catch(err => {
          reject(err);
        });
    });
  },

  // 点击题库分类，显示该分类下的错题列表
  toWrongPage: function(e) {
    let typeId = e.currentTarget.dataset.typeid;
    this.getWrongQuestionsByType(typeId);
  },

  // 点击错题，进入错题详情页
  toQuestionDetail: function(e) {
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    
    // 将当前错题列表和索引存入缓存
    wx.setStorageSync('wrongQuestions', this.data.wrongQuestions);
    wx.setStorageSync('wrongIndex', index);
    
    wx.navigateTo({
      url: '/pages/wrong/wrong?id=' + id + '&index=' + index
    });
  },

  // 返回首页
  backToHome: function() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});