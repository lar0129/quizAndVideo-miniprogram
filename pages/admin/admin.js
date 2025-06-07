// pages/admin.js
const app = getApp();
const db = wx.cloud.database();
const activityUser = db.collection('activityUser');
const _ = db.command;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userList: [],        // 用户列表
        selectedUsers: [],    // 已选择的用户ID列表
        ifSelectedUsers: {}, // 选择框是否选中
        autoApprove: false,   // 是否自动审核
        loading: false,       // 加载状态
        allSelected: false,   // 是否全选
        isAuthenticated: false, // 是否已通过密码验证
        adminPassword: '',     // 管理员密码输入
        currentTab: 'pending',  // 当前选中的标签页：pending-待审核，approved-已通过，rejected-已拒绝
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.checkAuthentication();
    },

    // 检查是否已通过密码验证
    checkAuthentication() {
        // const isAuthenticated = wx.getStorageSync('adminAuthenticated');
        const isAuthenticated = false
        if (isAuthenticated) {
            this.setData({ isAuthenticated: true });
            this.loadUserList();
            this.getAutoApproveStatus();
        }
    },

    // 验证管理员密码
    verifyPassword() {
        const { adminPassword } = this.data;
        if (!adminPassword.trim()) {
            wx.showToast({
                title: '请输入密码',
                icon: 'none'
            });
            return;
        }

        wx.cloud.callFunction({
            name: 'getSystemConfig'
        }).then(res => {
            if (res.result && res.result.config) {
                const correctPassword = res.result.config.adminPassword;
                if (adminPassword === correctPassword) {
                    this.setData({ isAuthenticated: true });
                    // wx.setStorageSync('adminAuthenticated', true);
                    this.loadUserList();
                    this.getAutoApproveStatus();
                } else {
                    wx.showToast({
                        title: '密码错误',
                        icon: 'none'
                    });
                }
            }
        }).catch(err => {
            console.error('验证密码失败', err);
            wx.showToast({
                title: '验证失败',
                icon: 'none'
            });
        });
    },

    // 输入密码事件处理
    inputPassword(e) {
        this.setData({
            adminPassword: e.detail.value
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        if (this.data.isAuthenticated) {
            this.loadUserList();
        }
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
        this.loadUserList();
        wx.stopPullDownRefresh();
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

    },

    // 切换标签页
    switchTab(e) {
        const tab = e.currentTarget.dataset.tab;
        this.setData({
            currentTab: tab,
            selectedUsers: [],
            allSelected: false
        });
        this.loadUserList();
    },

    // 加载用户列表
    loadUserList() {
        this.setData({ loading: true });
        
        // 根据当前标签页筛选用户
        let query = activityUser.where({
            trueName: _.neq('')
        });
        
        // 根据当前标签页筛选用户
        if (this.data.currentTab === 'pending') {
            // 待审核：checked为空或false或'pending'
            query = query.where({
                checked: _.or(_.eq('pending'), _.eq(null), _.eq(false))
            });
        } else if (this.data.currentTab === 'approved') {
            // 已通过：checked为'approved'
            query = query.where({
                checked: 'approved'
            });
        } else if (this.data.currentTab === 'rejected') {
            // 已拒绝：checked为'rejected'
            query = query.where({
                checked: 'rejected'
            });
        }
        
        query.get().then(res => {
            this.setData({
                userList: res.data,
                loading: false,
                selectedUsers: [],
                allSelected: false
            });
        }).catch(err => {
            console.error('获取用户列表失败', err);
            this.setData({ loading: false });
            wx.showToast({
                title: '获取用户列表失败',
                icon: 'none'
            });
        });
    },

    // 选择/取消选择单个用户
    selectUser(e) {
        const userId = e.currentTarget.dataset.id;
        let selectedUsers = [...this.data.selectedUsers];
        
        if (selectedUsers.includes(userId)) {
            selectedUsers = selectedUsers.filter(id => id !== userId);
        } else {
            selectedUsers.push(userId);
        }
        
        this.setData({
            selectedUsers,
            allSelected: selectedUsers.length === this.data.userList.length
        });
    },

    // 全选/取消全选
    toggleSelectAll() {
        const allSelected = !this.data.allSelected;
        let selectedUsers = [];
        
        if (allSelected) {
            selectedUsers = this.data.userList.map(user => user._id);
        }
        
        this.setData({
            allSelected,
            selectedUsers
        });
    },

    // 审核单个用户
    approveUser(e) {
        const userId = e.currentTarget.dataset.id;
        const approve = e.currentTarget.dataset.approve;
        
        // 将布尔值转换为字符串状态
        const status = approve ? 'approved' : 'rejected';
        this.updateUserStatus([userId], status);
    },

    // 批量审核用户
    batchApprove(e) {
        const approve = e.currentTarget.dataset.approve;
        const { selectedUsers } = this.data;
        
        if (selectedUsers.length === 0) {
            wx.showToast({
                title: '请先选择用户',
                icon: 'none'
            });
            return;
        }
        
        // 将布尔值转换为字符串状态
        const status = approve ? 'approved' : 'rejected';
        this.updateUserStatus(selectedUsers, status);
    },

    // 更新用户审核状态
    updateUserStatus(userIds, status) {
        if (userIds.length === 0) return;
        
        this.setData({ loading: true });
        
        // 使用云函数批量更新
        wx.cloud.callFunction({
            name: 'batchUpdateUsers',
            data: {
                userIds,
                status // 传递字符串状态
            }
        }).then(res => {
            console.log('审核结果', res);
            wx.showToast({
                title: '审核操作成功',
                icon: 'success'
            });
            
            // 发送审核结果通知
            this.sendApprovalNotification(userIds, status === 'approved');
            
            // 重新加载用户列表
            this.loadUserList();
        }).catch(err => {
            console.error('审核操作失败', err);
            this.setData({ loading: false });
            wx.showToast({
                title: '审核操作失败',
                icon: 'none'
            });
        });
    },

    // 发送审核结果通知
    sendApprovalNotification(userIds, approve) {
        // 调用云函数发送消息通知
        wx.cloud.callFunction({
            name: 'sendApprovalNotification',
            data: {
                userIds,
                approve
            }
        }).then(res => {
            console.log('通知发送成功', res);
        }).catch(err => {
            console.error('通知发送失败', err);
        });
    },

    // 切换自动审核状态
    toggleAutoApprove(e) {
        const autoApprove = e.detail.value;
        
        // 更新云数据库中的配置
        wx.cloud.callFunction({
            name: 'updateSystemConfig',
            data: {
                autoApprove
            }
        }).then(res => {
            console.log('自动审核设置更新成功', res);
            this.setData({ autoApprove });
            wx.showToast({
                title: autoApprove ? '已开启自动审核' : '已关闭自动审核',
                icon: 'success'
            });
        }).catch(err => {
            console.error('自动审核设置更新失败', err);
            wx.showToast({
                title: '设置更新失败',
                icon: 'none'
            });
        });
    },

    // 获取自动审核状态
    getAutoApproveStatus() {
        wx.cloud.callFunction({
            name: 'getSystemConfig'
        }).then(res => {
            if (res.result && res.result.config) {
                this.setData({
                    autoApprove: res.result.config.autoApprove || false
                });
            }
        }).catch(err => {
            console.error('获取自动审核设置失败', err);
        });
    },
})