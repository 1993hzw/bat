var express = require('express');
var router = express.Router();
var Promise=require('bluebird');
var maps=require('../../models/maps');
var DC=require('../../models/data-center');
var qiniu=require('../../models/storage/qiniu');

router.get('/', function(req, res, next) {
    console.log();
    var hasInitialized=maps.get('hasInitialized');
    if(!hasInitialized){//第一次部署博客
        res.render("admin/register");
    }else{
        if(!req.session.hasLogined) return res.render("admin/login");
        res.render("admin/admin",{tags:DC.tags,admin:DC.admin,policy:DC.upload_policy,domain:qiniu.getDomain(),bucket:qiniu.getBucket()});
    }
})

module.exports = router;