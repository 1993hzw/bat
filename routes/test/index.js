var router=require('express').Router();
var qiniu=require('../../controller/storage/qiniu');

router.get("/",function(req,res,next){
    var token=qiniu.getToken("resources")
    res.render('upload',{domain:'7xkd2p.com1.z0.glb.clouddn.com',token:token,html:'<b>sd</b>'})
})

router.get("/token",function(req,res,next){
    var token=qiniu.getToken("resources");
    res.json({"uptoken": token});
})

module.exports=router;