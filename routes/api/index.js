var router=require('express').Router();var dbHolder=require('../../controller/DBHolder');
var blogs=require('../../controller/blogs');
var tags=require('../../controller/tags');
var comments=require('../../controller/comments');
var markdown=require('../../utils/markdown');
var htmlToText = require('html-to-text');
var utils=require('../../utils/utils');
var Promise = require('bluebird');
var qn=require('../../controller/storage/qiniu')

router.post('/publish', function(req, res, next) {
    if(!req.session.hasLogined) return res.redirect("/")
    var fields=dbHolder.blog;
    var data={};
    var title=(req.body.title==null||req.body.title=="")?"(未命名)":req.body.title;
    data[fields.title]=title;
    data[fields.markdown]=req.body.markdown;
    data[fields.html]=markdown.toHtml(req.body.markdown,"Maruku");
    var brief = htmlToText.fromString(data[fields.html], {wordwrap: 130}).substr(0,150);
    data[fields.brief]=brief;
    var tag=(req.body.tag==null||req.body.tag=="")?"默认":req.body.tag;
    data[fields.tags]=tag;
    blogs.add(data)
        .then(function(){
            blogs.getLast()
                .then(function(rows){
                    return res.json({state:1,id:rows[0][fields.id]})
                })
                .catch(function(err){
                    return res.json({state:1})
                });
        })
        .catch(function(err){
            console.log(err);
            res.json({state:-1})
        });
});

router.post('/save', function(req, res, next) {
    if(!req.session.hasLogined) return res.redirect("/")
    var fields=dbHolder.blog;
    var id=req.body.id;
    if(!id||id<=0) return res.json({state:-1});
    var data={};
    var title=(req.body.title==null||req.body.title=="")?"(未命名)":req.body.title;
    data[fields.title]=title;
    data[fields.markdown]=req.body.markdown;
    data[fields.html]=markdown.toHtml(req.body.markdown,"Maruku");
    var brief = htmlToText.fromString(data[fields.html], {wordwrap: 130}).substr(0,150);
    data[fields.brief]=brief;
    var tag=(req.body.tag==null||req.body.tag=="")?"默认":req.body.tag;
    data[fields.tags]=tag;
    blogs.modifyById(id,data)
        .then(function(){
            return res.json({state:1,id:id})
        })
        .catch(function(err){
            console.log(err)
            res.json({state:-1})
        });
})

router.get('/delete',function(req,res,next){
    if(!req.session.hasLogined) return res.redirect("/")
    var id=req.query.id;
    if(!id||id<1) return res.json({state:-1});
    var result;
    dbHolder.openDB()
        .then(dbHolder.beginTransaction)
        .then(function(res){
            result=res;
            return blogs.deleteById(id,res);
        })
        .then(function(){
            return comments.deleteByBlogId(id,result);
        })
        .then(function(){
            return dbHolder.commitTransaction(result);
        })
        .then(function(){
            result.db.close();
            return res.json({state:1});
        })
        .catch(function(err){
            console.log(err);
            if(result&&result.db) result.db.close();
            return res.json({state:-1});
        })
})

router.get('/get_last',function(req,res,next){
    var off=req.query.offset;
    if(!off||off<0) off=0;
    blogs.getLast(off,5)
        .then(function(rows){
            res.json({rows:rows,tags:dbHolder.tags});
        })
        .catch(function(err){
            res.end(err);
        });
})

router.get('/get_blogs',function(req,res,next){
    var tag=req.query.tag;
    var off=req.query.offset;
    if(utils.checkIsInArray(tag,dbHolder.tags)) {
        blogs.getByTag(tag,off,5)
            .then(function (rows) {
                res.json({rows:rows,tags:dbHolder.tags})
            })
            .catch(function (err) {
                console.log(err);
            });
    }else{
        blogs.getLast(off,5)
            .then(function (rows) {
                res.json({rows:rows,tags:dbHolder.tags})
            })
            .catch(function (err) {
                console.log(err);
            });
    }
})

router.post('/add_tag',function(req,res,next){
    if(!req.session.hasLogined) return res.redirect("/")
    var tag=req.body.tag.trim();
    if(!tag) return res.json({state:-1})
    for(var i=0;i<dbHolder.tags.length;i++){
        if(dbHolder.tags[i]==tag) return res.json({state:-2});
    }
    dbHolder.tags[dbHolder.tags.length]=tag;
    require('fs').writeFile('data/tags',JSON.stringify(dbHolder.tags),"utf-8",function(err){
        if(err){
            dbHolder.tags.length--;
            return res.json({state:-1});
        }
        res.json({state:1,tags:dbHolder.tags})
    })
})

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
    data[dbHolder.comment.insert_time]=time;
    comments.add(data)
        .then(function(){
            res.json({state:1,time:utils.resolveTimeJson(time)});
        })
        .catch(function(err){
            console.log(err)
            res.json({state:-1});
        })
})


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

router.get('/upload_database',function(req,res,next){
    //if(!req.session.hasLogined) return res.json({state:-1})
    qn.uploadFile(APP_PATH+"/data/myblog.sqlite3","myblog.sqlite3",qn.getToken(),function(err,ret){
        if(err){
            console.log(err)
            return res.json({state:-1})
        }
        res.json({state:1})
    })
})
router.get('/download_database',function(req,res,next){
    //if(!req.session.hasLogined) return res.json({state:-1})
    try{
        var url=qn.downloadUrl("myblog.sqlite3")
        res.json({state:1,url:url})
    }catch(e){
        console.log(e)
        res.json({state:-1})
    }
})



module.exports=router;