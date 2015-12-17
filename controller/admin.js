var qiniu=require('../models/storage/qiniu');
var maps = require('../models/maps');
var comments = require('../models/comments');
var markdown = require('../utils/markdown');
var utils = require('../utils/utils');
var Promise = require('bluebird');
var qn = require('../models/storage/qiniu')
var DC = require('../models/data-center');
var tags = require('../models/tags');
var local=require('../models/storage/local');

//get
exports.gotoAdmin=function(req, res, next) {
    var hasInitialized=maps.get('hasInitialized');
    if(!hasInitialized){//第一次部署博客
        res.render("admin/register");
    }else{
        if(!req.session.hasLogined) return res.render("admin/login");//登录
        res.render("admin/admin",{tags:DC.tags,admin:DC.admin,policy:DC.upload_policy,domain:qiniu.getDomain(),bucket:qiniu.getBucket()});
    }
};


//post 登录
exports.login= function (req, res, next) {
    var user = req.body.user;
    var passwd = req.body.passwd;
    if (!user || !passwd || user.trim() == "" || passwd.trim() == "") return res.json({state: -1})
    if (user === DC.admin.user && passwd === DC.admin.password) {
        console.log("admin logined")
        req.session.hasLogined = true;
        res.json({state: 1});
    } else {
        res.json({state: -2});
    }
};
//post 注销
exports._logout=function (req, res, next) {
    console.log("admin logout");
    req.session.hasLogined = false;
    res.json({state: 1});
};
//post保存博客信息
exports._save_info= function (req, res, next) {
    var blog = req.body.blog;
    var name = req.body.name;
    var email = req.body.email;
    var user = req.body.user;
    var password = req.body.password || '';//密码为加密后的md5，大于等于16位
    //空字符串为false
    if (!blog || !name || !email || !user || blog.trim() == '' || name.trim() == '' ||
        email.trim() == '' || user.trim() == '' || (password.trim() != '' && password.length < 16) || !/[\d\w]{3,}@[\d\w]+\.[\d\w]+/.test(email)) {
        return res.json({state: -1})
    }
    var v;
    if (password != '') {//修改了密码
        v = {blog: blog, name: name, email: email, user: user, password: password};
    } else {//密码不变
        v = {blog: blog, name: name, email: email, user: user, password: DC.admin.password};
    }
    maps.put('admin', JSON.stringify(v))
        .then(function () {
            DC.admin = v;
            res.json({state: 1})
        })
        .catch(function (err) {
            console.log(err)
            res.json({state: -2})
        })
};

//post 初次设置博客
exports.register=function (req, res, next) {
    var hasInitialized=maps.get('hasInitialized');
    if(hasInitialized){//已经设置
        return res.json({state: -100})
    }
    //第一次设置博客
    var blog = req.body.blog;
    var name = req.body.name;
    var email = req.body.email;
    var user = req.body.user;
    var password = req.body.password || '';//密码为加密后的md5，大于等于16位
    //空字符串为false
    if (!blog || !name || !email || !user || blog.trim() == '' || name.trim() == '' ||
        email.trim() == '' || user.trim() == '' || password.length < 16 || !/[\d\w]{3,}@[\d\w]+\.[\d\w]+/.test(email)) {
        return res.json({state: -1})
    }
    var v = {blog: blog, name: name, email: email, user: user, password: password};
    maps.put('admin', JSON.stringify(v))
        .then(function () {
            return maps.put('hasInitialized', 'true');
        })
        .then(function () {
            DC.admin = v;
            req.session.hasLogined = true;//注册成功后，则标为已登录
            res.json({state: 1});
        })
        .catch(function (err) {
            console.log(err)
            res.json({state: -2})
        })
};

//修改上传策略
exports._save_upload_policy=function(req,res,next){
    var policy=req.body.policy;
    var domain=req.body.domain||'';
    var bucket=req.body.bucket||'';
    var access=req.body.access||'';
    var secret=req.body.secret||'';
    if(policy!=1&&policy!=2){
        return res.json({state:-2});
    }
    //qiniu
    if(policy==1){
        if(domain.trim()===''||bucket.trim()===''||access.trim()===''||secret.trim()===''){
            return res.json({state:-1});
        }
        var json={policy:1,domain:domain,bucket:bucket,access:access,secret:secret};
        //设置
        qn.setOptions(json,function(err){
            if(err){
                console.log(err.stack);
                return res.json({state:-10});//填写的信息有误，无法上传
            }
            var policy=maps.get("upload_policy");
            maps.put("upload_policy",JSON.stringify(json))
                .then(function(){
                    DC.upload_policy=1;
                    res.json({state:1});
                })
                .catch(function(err){
                    console.log(err.stack);
                    qn.setOptions(JSON.parse(policy));
                    return res.json({state:-11});
               });
        });
    }else{
        maps.put("upload_policy",JSON.stringify({policy:2}))
            .then(function(){
                DC.upload_policy=2;
                res.json({state:1});
            });
    }
};

//post 上传文件到服务器
exports._upload=function(req,res,next){
    local.parse(req,function(err,filename){
        if(err) return res.json({failed:'upload failed'});//上传失败
        res.json({target_name:filename});//返回文件名
        console.log(filename);
    })
};

//获取上传图片的token
exports._token= function (req, res, next) {
    var token = qn.getToken(qn.getBucket());
    res.json({"uptoken": token});
};
//下载数据库
exports._download_db=function (req, res, next) {
    res.download(APP_PATH + '/data/myblog.sqlite3', 'myblog(' + utils.formatTime() + ').sqlite3');
};
