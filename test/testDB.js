var app = require('../app');
var blogs=require("../controller/blogs");
var comments=require("../controller/comments");
var dbHolder=require('../controller/DBHolder');
var Promise=require('bluebird');
var maps=require("../controller/maps");
var tags=require('../controller/tags');

comments.getLastCommentsNoReplay(0,10)
    .then(function(rows){
        console.log(rows);
    })