var router = require('express').Router();
var dbHolder = require('../../controller/DBHolder');
var maps = require('../../controller/maps');
var comments = require('../../controller/comments');
var markdown = require('../../utils/markdown');
var utils = require('../../utils/utils');
var Promise = require('bluebird');
var qn = require('../../controller/storage/qiniu')
var DC = require('../../controller/data-center');
var tags = require('../../controller/tags');
var local=require('../../controller/storage/local');

router.use(/\/_.+/, function (req, res, next) {//_开头的为私有接口，必须登录授权
    if (!req.session.hasLogined) return res.json({state: -100});
    next();
});

router.use('/', require('./blog'));
router.use('/', require('./tag'));
router.use('/', require('./comment'));

//登录
router.post('/login', function (req, res, next) {
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
});
//注销
router.post('/_logout', function (req, res, next) {
        console.log("admin logout");
        req.session.hasLogined = false;
        res.json({state: 1});
});
//保存博客信息
router.post('/_save_info', function (req, res, next) {
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
            return maps.put('hasInitialized', 'true');
        })
        .then(function () {
            DC.admin = v;
            res.json({state: 1})
        })
        .catch(function (err) {
            console.log(err)
            res.json({state: -2})
        })
});

router.post('/_save_upload_policy',function(req,res,next){
    var policy=req.body.policy;
    var domain=req.body.domain||'';
    var bucket=req.body.bucket||'';
    var access=req.body.access||'';
    var secret=req.body.secret||'';
    if(policy!=1&&policy!=2){
        return res.json({state:-2});
    }
    if(policy==1){
        if(domain.trim()===''||bucket.trim()===''||access.trim()===''||secret.trim()===''){
            return res.json({state:-1});
        }
        var json={policy:1,domain:domain,bucket:bucket,access:access,secret:secret};
        maps.put("upload_policy",JSON.stringify(json))
            .then(function(){
                qn.init(json,function(err){
                    if(err){
                        console.log(err);
                        return res.json({state:-10});//填写的信息有误，无法上传
                    }
                    DC.upload_policy=1;
                    res.json({state:1});
                });
            });
    }else{
         maps.put("upload_policy",JSON.stringify({policy:2}))
            .then(function(){
                DC.upload_policy=2;
                 res.json({state:1});
            });
    }
});

router.post('/_upload',function(req,res,next){
    local.parse(req,function(err,filename){
        if(err) return res.json({failed:'upload failed'});//上传失败
        res.json({target_name:filename});//返回文件名
        console.log(filename);
    })
});

//获取上传图片的token
router.get("/_token", function (req, res, next) {
    var token = qn.getToken(qn.getBucket());
    res.json({"uptoken": token});
});
//下载数据库
router.get('/_download_db', function (req, res, next) {
    res.download(APP_PATH + '/data/myblog.sqlite3', 'myblog(' + utils.formatTime() + ').sqlite3');
});


/*//上传数据库到七牛
 router.get('/_upload_db_qn', function (req, res, next) {
 var result = [];
 var upload = function (name) {
 return new Promise(function (resolve, reject) {
 qn.uploadFile(APP_PATH + "/data/" + name, name, qn.getToken(qn.db_bucket + ':' + name), function (err, ret) {
 if (err) return reject(err);
 result[result.length] = ret;
 resolve(result)
 })
 })
 };
 upload("myblog.sqlite3")
 /!*.then(function(){
 return  upload("config.sqlite3")
 })*!/
 .then(function () {
 res.json({state: 1, msg: JSON.stringify(result)})
 })
 .catch(function (err) {
 res.json({state: -1, msg: JSON.stringify(err)})
 })

 });
 //从七牛上获取下载数据库的链接
 router.get('/_download_db_qn', function (req, res, next) {
 try {
 var url = qn.downloadUrl("myblog.sqlite3")
 res.json({state: 1, urls: [url]})
 } catch (e) {
 console.log(e)
 res.json({state: -1})
 }
 });*/


module.exports = router;