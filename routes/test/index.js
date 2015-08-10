var router=require('express').Router();
var qiniu=require('../../controller/storage/qiniu');
var local=require('../../controller/storage/local');

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

router.post('/upload',function(req,res,next){
    local.parse(req,function(err,filename){
        if(err) return res.end('err');
        console.log(filename);
        res.json({target_name:filename});//返回文件名
    })
});

module.exports=router;