项目地址

* https://github.com/lar0129/quizAndVideo-miniprogram

参考项目

* https://gitee.com/uemeng/answer-activity-applet-v2.0
* https://github.com/wulivictor/ExamOnline

### 部署

* 导入微信开发者工具
* 在app.js的env配置项 配置云环境id
* 在云开发平台增加数据库表单项

### 核心功能点：

* 用户：视频播放（格式、长度 涉及性能）
  * 已完成分类与播放

* 答题
  * 已完成分类、答题、总结、单次错题记录
  * 未完成：
    * 用户只答了一半后的缓存记录
    * 到任意题目的跳转，正确与错误的UI提醒


次要功能点

* 登录注册
  * 已完成获取微信用户名
  * 未完成：
    * 将数据上传到后端（昵称、单位、手机号）
    * 登录缓存

* 排行榜
  * 已完成答题历史记录与排行榜排序
  * 未完成
    * 分类排序



### 数据库表单：

1.题目

​     类型名

​     解析

2.题目类型

​     类型名

​     题目数量

3.答题历史

​	考试ID

​	错误数量

​	错误题目ID(即错题集)



4.视频

​	视频类型

​	视频链接

​	视频描述

5.视频类型

​	视频类型名

​	视频数量

 6.视频观看历史



 7.用户数据

​	昵称

​	单位

​	手机号	