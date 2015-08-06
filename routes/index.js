var express = require('express');
var router = express.Router();
var dbHolder=require('../controller/DBHolder');
var comments=require('../controller/comments');
var blogs=require('../controller/blogs');
var Promise=require('bluebird');
var utils=require('../utils/utils');
var DC=require('../controller/data-center');

/* GET home page. */
router.get('/', function(req, res, next) {
    comments.getLastComments(0,5)//最新评论
        .then(function(rows){
            return Promise.resolve({comments:rows,isLogined:req.session.hasLogined})
        })
        .then(function(result){//热门文章
            //hotblogs
           return blogs.getHots(0,5)
                .then(function(rows){
                    result.hotblogs=rows;
                   return Promise.resolve(result)
                })
        })
        .then(function(result){//获取评论的文章题目
            var arr=[];
            for(var i=0;i<result.comments.length;i++){
                arr[i]=result.comments[i].f_blog_id;
            }
           return blogs.getTitleByArray(arr)
                .then(function(rows){
                    var obj={}
                    for(var i=0;i<rows.length;i++){
                        obj[rows[i].f_id]=rows[i].f_title;
                    }
                    result.titles=obj;
                   return Promise.resolve(result);
                })
        })
        .then(function(result){//获取最新文章
            return blogs.getLast(0,5)
                .then(function(rows){
                    result.rows=rows;
                    return Promise.resolve(result);
                })
        })
        .then(function(result){
            result.tags=DC.tags;
            result.visits=DC.visits;
            result.getTime=utils.getTime;
            result.name=DC.admin.name;
            result.email=DC.admin.email;
            result.blog=DC.admin.blog;
            res.render('index', result);
        })
        .catch(function(err){
            console.log(err)
        })

});

router.post('/upload',function(req,res,next){
    res.end("ok")
    /*if (req.files && req.files.codecsv != 'undifined') {
        var temp_path = req.files.codecsv.path;
        if (temp_path) {
            fs.readFile(temp_path, 'utf-8', function(err, content) {
                //文件的内容
                console.log('content',content);
                // 删除临时文件
                fs.unlink(temp_path);
            });
        }
    }*/
})

module.exports = router;