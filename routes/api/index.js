var router=require('express').Router();
var dbHolder=require('../../controller/DBHolder');
var blogs=require('../../controller/blogs');
var comments=require('../../controller/comments');
var markdown=require('../../utils/markdown');
var utils=require('../../utils/utils');
var Promise = require('bluebird');
var qn=require('../../controller/storage/qiniu')
var DC=require('../../controller/data-center');
var tags=require('../../controller/tags');

router.use(/_.+/,function(req,res,next){
    if(!req.session.hasLogined) return res.json({state:-1})
    next();
});

router.use('/',require('./blog'));
router.use('/',require('./tag'));
router.use('/',require('./comment'));

router.get('/_upload_database',function(req,res,next){
    var result=[];
    var upload=function(name){
        return new Promise(function(resolve,reject) {
            qn.uploadFile(APP_PATH + "/data/"+name, name, qn.getToken(qn.bucket + ':'+name), function (err, ret) {
                if (err) return reject(err);
                result[result.length]=ret;
                resolve(result)
            })
        })
    }

    upload("myblog.sqlite3")
    /*.then(function(){
       return  upload("config.sqlite3")
     })*/
    .then(function(){
        res.json({state:1,msg:JSON.stringify(result)})
    })
    .catch(function(err){
        res.json({state:-1,msg:JSON.stringify(err)})
    })

})
router.get('/_download_database',function(req,res,next){
    try{
        var url=qn.downloadUrl("myblog.sqlite3")
        //var url2=qn.downloadUrl("config.sqlite3")
        res.json({state:1,urls:[url]})
    }catch(e){
        console.log(e)
        res.json({state:-1})
    }
})

router.post('/login',function(req,res,next){
        var user=req.body.user;
        var passwd=req.body.passwd;
        if(!user||!passwd||user.trim()==""||passwd.trim()=="") return res.json({state:-1})
        if(user===DC.admin.user&&passwd===DC.admin.passwd){
            console.log("admin logined")
            req.session.hasLogined=true;
            res.json({state:1})
        }else{
            res.json({state:-2})
        }
})


module.exports=router;