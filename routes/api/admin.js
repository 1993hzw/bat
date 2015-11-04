var router = require('express').Router();
var admin=require('../../controller/admin');

//登录
router.post('/login', admin.login);
//注销
router.post('/_logout', admin._logout);
//保存博客信息
router.post('/_save_info', admin._save_info);

//初次设置博客
router.post('/register', admin.register);

router.post('/_save_upload_policy',admin._save_upload_policy);

router.post('/_upload',admin._upload);

//获取上传图片的token
router.get("/_token", admin._token);
//下载数据库
router.get('/_download_db',admin._download_db);


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