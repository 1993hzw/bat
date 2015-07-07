var router=require('express').Router();

router.get("/:uu?",function(req,res,next){
    console.log(req.params)
    res.end("hello ")
})

module.exports=router;