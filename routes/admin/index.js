var express = require('express');
var router = express.Router();
var Promise=require('bluebird');
var fs =require("fs");
var config=undefined;

router.post('/', function(req, res, next) {
    var verify= function () {
        var user=req.body.user;
        var passwd=req.body.passwd;
        if(!user||!passwd||user.trim()==""||passwd.trim()=="") return res.json({state:-1})
        if(user===config.user&&parseInt(passwd)===config.passwd){
              req.session.hasLogined=true;
              res.json({state:1})
        }else{
             res.json({state:-2})
        }
    }
    if(!config){
        fs.readFile(APP_PATH+"/data/config","utf-8",function(err,data){
            if(err){
                console.log(err)
                return res.json({state:-1})
            }
            config=eval('('+data+')');
            verify();
        })
    }else{
        verify()
    }
});

router.get('/', function(req, res, next) {
      res.render("admin/login");
})

module.exports = router;