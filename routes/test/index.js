var router=require('express').Router();
var qiniu=require('../../controller/storage/qiniu');

router.get("/",function(req,res,next){
    var token=qiniu.getToken("resources")
    res.render('upload',{domain:'7xkd2p.com1.z0.glb.clouddn.com',token:token,html:'<b>sd</b>'})
})

/*router.get("/token",function(req,res,next){
    var token=qiniu.getToken("resources");
    res.json({"uptoken": token});
});

router.get('/download',function(req,res,next){
    res.download(APP_PATH+'/data/myblog.sqlite3','blog.sqlite3');
});*/

router.get('/getname',function(req,res,next){
    res.end('hello world');
});

module.exports=router;