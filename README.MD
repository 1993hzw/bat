Bat 博客系统
====
Bat 是一个简易的博客系统，兼容ie8+、chrome、firefox以及手机移动端等平台，具有在线编辑、图片上传、评论、后台管理等基本功能。

![img](http://7xkd2p.com1.z0.glb.clouddn.com/o_19sc0o4ggfja6ueltf1la61o1ja.jpg "home.jpg")

### 在线编辑
编辑页面有两个区域，左边是编辑区，右边是预览区，在编辑文章时可以实时预览内容。Bat 有两种编辑模式，`Markdown` 和 `文本模式`。文章支持分类、置顶、编辑等操作。

![img](http://7xkd2p.com1.z0.glb.clouddn.com/o_19sc0oithcvb4t21if4ouc1o9if.jpg "edit.jpg")

### 图片上传
在Markdown模式中可以插入图片，插入的图片将根据您的**上传策略**存储到第三方服务器或者本地服务器。您也可以直接**拖动图片到编辑区域**，快速插入图片。

### 后台管理
 通过 `<your blog url>/bat` 链接就可以登录系统后台，管理您的的博客。进入后台管理后，可以进行如下操作
+ 修改博客信息
+ 修改上传策略
+ 导出数据库
+ 管理标签
+ 管理评论

----

项目框架
====
本项目为`node.js`项目，采用`express`框架，渲染模板为ejs,默认端口`18080`。
### 目录结构
<pre>
<b>-bin</b>
 --www.js  应用入口

<b>-data</b>  存放数据
 --guide  博客第一篇文章(使用教程),markdown
 --myblog.sqlite3  数据库，整个博客的信息都保存在此数据库

<b>-models</b>
 --storage  存储策略
   ---local.js  本地存储
   ---qiniu.js  七牛存储
 --blogs.js  博客模型，
 --comments.js 评论模型
 --data-center.js  数据中心，里面的init方法初始化了博客信息，加载数据库，在www.js被调用
 --DBHolder.js  定义了数据库通用方法，创建数据库，创建表，事务提交
 --maps.js  类似于map类，有put、get方法。主要用来存储博客设置信息，如上传策略，登录信息，博客信息。 
 --tags.js  标签模型

<b>-node_modules</b> 模块

<b>-public</b>  存放公共资源，css，js，img

<b>-routes</b>  路由
 --admin  跟后台管理页面有关的路由
 --api  接口，供前台js调用，_开头的接口为私有接口，必须登录使用
 --blogs  跟博客页面有关的路由
 --index.js  首页

<b>-utils</b> 工具包

<b>-views</b>  视图包

<b>-app.js</b>  服务器配置。里面定义了一个全局变量APP_PATH，代表应用的根目录。

<b>-package.json</b>  依赖包

<b>-README.md</b>  

<b>-.gitignore</b>

</pre>

### 第三方模块
+ `bluebird` promise，避免地域回调
+ `ejs` 渲染模板
+ `formidable` 上传模板（前端使用`plupload`上传组件）
+ `highlight.js` 代码高亮
+ `html-to-text` 把html转化为文本
+ `marked` 将markdown转化为html
+ `qiniu` 七牛，第三方云存储，支持客户端上传
+ `sqlite3` 数据库，基于单个文件

----

关于我
===
邮箱：154330138@qq.com

博客：http://forward.duapp.com

