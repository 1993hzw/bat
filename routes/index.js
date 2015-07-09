var express = require('express');
var router = express.Router();
var dbHolder=require('../controller/DBHolder');
var comments=require('../controller/comments');
var blogs=require('../controller/blogs');
var Promise=require('bluebird');
var maps=require('../controller/maps');
var DC=require('../controller/data-center');

/* GET home page. */
router.get('/', function(req, res, next) {
    comments.getLastComments(0,5)
        .then(function(rows){
            return Promise.resolve({comments:rows,isLogined:req.session.hasLogined})
        })
        .then(function(result){
            //hotblogs
           return blogs.getHots(0,5)
                .then(function(rows){
                    result.hotblogs=rows;
                   return Promise.resolve(result)
                })
        })
        .then(function(result){
            var arr=[];
            for(var i=0;i<result.comments.length;i++){
                arr[i]=result.comments[i].f_blog_id;
            }
            blogs.getTitleByArray(arr)
                .then(function(rows){
                    var obj={}
                    for(var i=0;i<rows.length;i++){
                        obj[rows[i].f_id]=rows[i].f_title;
                    }
                    result.tags=DC.tags;
                    result.titles=obj;
                    res.render('index', result);
                })
        })
        .catch(function(err){
            console.log(err)
        })

});

module.exports = router;