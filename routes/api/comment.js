var router=require('express').Router();
var dbHolder=require('../../models/DBHolder');
var blogs=require('../../models/blogs');
var comments=require('../../models/comments');
var markdown=require('../../utils/markdown');
var utils=require('../../utils/utils');
var Promise = require('bluebird');
var tags=require('../../models/tags');

//添加新评论
router.post('/add_comment',function(req,res,next){
    var id=req.body.id;
    var comment=req.body.comment;
    var contact=req.body.contact;
    if(!id||id<0||!comment||comment.trim()=="") return res.json({state:-1});
    var data={};
    data[dbHolder.comment.blogId]=id;
    data[dbHolder.comment.content]=comment.substr(0,500);
    data[dbHolder.comment.contact]=contact.substr(0,50);
    var time=utils.getTime();
    comments.add(data)
        .then(function(){
            res.json({state:1,time:utils.formatTime(time)});
        })
        .catch(function(err){
            console.log(err)
            res.json({state:-1});
        })
})

//根据文章id获取评论
router.get('/get_comments',function(req,res,next){
    var id=req.query.id;
    var off=req.query.offset;
    if(!id||id<0) return res.json({state:-1});
    comments.getCommentsByBlogID(id,off,10)
        .then(function(rows){
            res.json({state:1,rows:rows})
        })
        .catch(function(){
            res.json({state:-1})
        })
})

//根据id获取评论
router.get('/_get_comment_by_id',function(req,res,next){
    var id=req.query.id;
    if(!id||id<0) return res.json({state:-1});
    comments.getCommentByID(id)
        .then(function(comments){
           return  blogs.getTitleByArray([comments[0][dbHolder.comment.blogId]])
                .then(function(rows){
                    res.json({state:1,rows:comments,title:rows[0][dbHolder.blog.title]})
                })
        })
        .catch(function(err){
            console.log(err)
            res.json({state:-1})
        })
})

//获取没有回复的评论
router.get('/_get_comment_brief_noreplay',function(req,res,next){
    var off=req.query.offset;
    off=off||0;
    comments.getLastCommentsNoReplay(off,10)
        .then(function(rows){
            res.json({state:1,rows:rows});
        })
        .catch(function(err){
            console.log(err);
            res.json({state:-1});
        })
});

//获取已回复的评论
router.get('/_get_comment_brief_replayed',function(req,res,next){
    var off=req.query.offset;
    off=off||0;
    comments.getLastCommentsReplayed(off,10)
        .then(function(rows){
            res.json({state:1,rows:rows});
        })
        .catch(function(err){
            console.log(err);
            res.json({state:-1});
        })
});

//删除评论
router.post('/_del_comment',function(req,res,next){
    var id=req.body.id;
    if(!id|id<0) return res.json({state:-1});
    comments.deleteById(id)
        .then(res.json({state:1}))
        .catch(function(err){
            console.log(err);
            res.json({state:-1});
        })
})

//回复评论
 router.post('/_replay', function (req,res,next) {
     var id=req.body.id;
     var replay=req.body.replay;
     if(!id|id<0||!replay) return res.json({state:-1});
     comments.replay(replay.substr(0,500),id)
         .then(function(){
             return res.json({state:1});
         })
         .catch(function(err){
             console.log(err);
             return res.json({state:-1});
         })
 })

module.exports=router;