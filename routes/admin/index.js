var express = require('express');
var router = express.Router();
var Promise=require('bluebird');

router.get('/', function(req, res, next) {
    if(!req.session.hasLogined) return res.render("admin/login");
    res.render("admin/admin");
})

module.exports = router;