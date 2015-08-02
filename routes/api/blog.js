var router=require('express').Router();
var dbHolder=require('../../controller/DBHolder');
var blogs=require('../../controller/blogs');
var comments=require('../../controller/comments');
var markdown=require('../../utils/markdown');
var htmlToText = require('html-to-text');
var utils=require('../../utils/utils');
var Promise = require('bluebird');
var qn=require('../../controller/storage/qiniu')
var DC=require('../../controller/data-center');
var tags=require('../../controller/tags');

//发布文章
router.post('/_publish', function(req, res, next) {
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

//保存文章
router.post('/_save', function(req, res, next) {
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

//删除文章
router.get('/_delete',function(req,res,next){
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
            res.json({rows:rows,tags:DC.tags});
        })
        .catch(function(err){
            res.end(err);
        });
})

router.get('/get_blogs',function(req,res,next){
    var tag=req.query.tag;
    var off=req.query.offset;
    if(utils.checkIsInArray(tag,DC.tags)) {
        blogs.getByTag(tag,off,5)
            .then(function (rows) {
                res.json({rows:rows,tags:DC.tags})
            })
            .catch(function (err) {
                console.log(err);
            });
    }else{
        blogs.getLast(off,5)
            .then(function (rows) {
                res.json({rows:rows,tags:DC.tags})
            })
            .catch(function (err) {
                console.log(err);
            });
    }
})

module.exports=router;