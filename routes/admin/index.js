var express = require('express');
var router = express.Router();
var Promise=require('bluebird');
var maps=require('../../controller/maps');
var DC=require('../../controller/data-center');

router.get('/', function(req, res, next) {
    if(!req.session.hasLogined) return res.render("admin/login");
    res.render("admin/admin",{tags:DC.tags});
})

module.exports = router;