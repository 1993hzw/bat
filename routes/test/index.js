var router=require('express').Router();

router.get('/',function(req,res,next){
    console.log(req.url);
    res.end("/")
});
router.get('/a',function(req,res,next){
    res.end("/a")
});



module.exports=router;