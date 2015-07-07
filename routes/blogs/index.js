var express = require('express');
var router = express.Router();
var dbHolder=require('../../controller/DBHolder');
var blogs=require('../../controller/blogs');
var tags=require('../../controller/tags');
var comments=require('../../controller/comments');
var markdown=require('../../utils/markdown');
var htmlToText = require('html-to-text');
var utils=require('../../utils/utils');
var Promise = require('bluebird');


var renderList=function(req, res, next,curTag){
    Promise.resolve(dbHolder.tags)
        .then(function(rows){
            return Promise.resolve({tags:rows});
        })
        .then(function(data){
            data.isLogined=req.session.hasLogined;
            data.curTag=curTag;
            res.render("blogs/list",data);
        })
        .catch(function(err){
            throw  err;
        })
}


router.get('/',function(req, res, next) {
   var id = req.query.id;
    var tag = req.query.tag;

    if(!tag||tag.trim()==""){
        if(!id||id<=0) return renderList(req, res, next,"全部");
        blogs.getById(id)
            .then(function(rows){
                var fields=dbHolder.blog;
                var blog=rows[0];
                var time=utils.resolveTimeJson(blog[fields.insert_time]);
                var data= {id:blog[fields.id],title:blog[fields.title],html:blog[fields.html],tag:blog[fields.tags],time:time,isLogined:req.session.hasLogined};
                data.tags=dbHolder.tags;
                res.render('blogs/blog',data);
            })
            .then(function(){
                 blogs.visitsIncrement(id)
                     .catch(console.log)
            })
            .catch(function(){
                return renderList(req, res, next,"全部");
            })
    }else{
        console.log("tag "+tag)
        if(utils.checkIsInArray(tag,dbHolder.tags)) {
            return renderList(req, res, next,tag);
        }else{
            return renderList(req, res, next,"全部")
        }
    }


});

router.get('/publish', function(req, res, next) {
    if(!req.session.hasLogined) return res.redirect("/")
    res.render('blogs/publish',{id:-1,tags:dbHolder.tags});
});
router.get('/edit', function(req, res, next) {
    if(!req.session.hasLogined) return res.redirect("/")
    var id=req.query.id;
    if(!id||id<0) return;

    blogs.getById(id)
        .then(function(rows){
            var fields=dbHolder.blog;
            var blog=rows[0];
            var time=utils.resolveTimeJson(blog[fields.insert_time]);
            var data= {id:blog[fields.id],title:blog[fields.title],markdown:blog[fields.markdown],tag:blog[fields.tags],time:time,isLogined:req.session.hasLogined};
            data.tags=dbHolder.tags;
            res.render('blogs/publish',data);
        })
        .catch(function(err){
            res.end(err)
        })
});

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

    blogs.deleteById(id)
        .then(function(){
            return res.json({state:1});
        })
        .catch(function(){
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

module.exports = router;
