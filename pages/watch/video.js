// pages/watch/video.js
const app = getApp();

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const activityVideo = db.collection('activityVideo');
// 数据库操作符
const _ = db.command;

Page({
 
    data: {
    videoList: [],
    },

    videoErrorCallback: function(e) {
        console.log('视频错误信息:')
        console.log(e.detail.errMsg)
    },

        /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options){
        // 获取参数
        console.log(options);
        let typeId = options.typeId;
        // let typeId = 1;
        this.setData({
          typeId
        });
        // 获取题库-函数执行
        this.getVideoList(Number(typeId))
    
    },

    getVideoList(typeId) {
        // 显示 loading 提示框
        wx.showLoading({
        title: '拼命加载中'
        });
        // 数据库集合的聚合操作实例
        activityVideo
        .aggregate()
        .match({       //类似于where，对记录进行筛选
        typeId: typeId
        })
        .end()
        .then(res => {
        // 获取集合数据，或获取根据查询条件筛选后的集合数据。
        console.log('[云数据库] [activityVideo] 查询成功')
        console.log(res.list)
        let data = res.list || [];
        
        // 将数据从逻辑层发送到视图层，通俗的说，也就是更新数据到页面展示
        this.setData({
            videoList:data,
        });

        // 隐藏 loading 提示框
        wx.hideLoading();
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function (res) {
        this.videoContext = wx.createVideoContext('myVideo')
        },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})