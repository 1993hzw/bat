var router=require('express').Router();
var dbHolder=require('../../controller/DBHolder');
var blogs=require('../../controller/blogs');
var comments=require('../../controller/comments');
var markdown=require('../../utils/markdown');
var htmlToText = require('html-to-text');
var utils=require('../../utils/utils');
var Promise = require('bluebird');
var qn=require('../../controller/storage/qiniu')
var maps=require('../../controller/maps');
var DC=require('../../controller/data-center');
var tags=require('../../controller/tags');

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

router.post('/add_tag',function(req,res,next){
    if(!req.session.hasLogined) return res.redirect("/")
    var tag=req.body.tag.trim();
    if(!tag) return res.json({state:-1})
    for(var i in DC.tags){
        if(DC.tags[i]==tag) return res.json({state:-2});
    }
    var tagObj={};
    var result;
    dbHolder.initDB()
        .then(function(res){
            result=res;
            return dbHolder.beginTransaction(result)
        })
        .then(function () {
            return tags.add(tag);
        })
        .then(function(){
            return tags.getAll()
        })
        .then(function(rows){
            return dbHolder.commitTransaction(result)
                .then(function(){
                    return Promise.resolve(rows)
                })
        })
        .then(function(rows){
            result.db.close();
            for(var i=0;i<rows.length;i++)
                tagObj[i]=rows[i].f_name;
            DC.tags=tagObj;
            res.json({state:1,tags:DC.tags})
        })
        .catch(function(err){
            console.log(err);
            if(result&&result.db)  result.db.close();
            return res.json({state:-1});
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
    if(!req.session.hasLogined) return res.json({state:-1})
    var result=[];
    var upload=function(name){
        return new Promise(function(resolve,reject) {
            qn.uploadFile(APP_PATH + "/data/"+name, name, qn.getToken(qn.bucket + ':'+name), function (err, ret) {
                if (err) return reject(err);
                result[result.length]=ret;
                resolve(result)
            })
        })
    }

    upload("myblog.sqlite3")
    .then(function(){
       return  upload("config.sqlite3")
     })
    .then(function(){
        res.json({state:1,msg:JSON.stringify(result)})
    })
    .catch(function(err){
        res.json({state:-1,msg:JSON.stringify(err)})
    })

})
router.get('/download_database',function(req,res,next){
    if(!req.session.hasLogined) return res.json({state:-1})
    try{
        var url=qn.downloadUrl("myblog.sqlite3")
        var url2=qn.downloadUrl("config.sqlite3")
        res.json({state:1,urls:[url,url2]})
    }catch(e){
        console.log(e)
        res.json({state:-1})
    }
})

var config=undefined;
router.post('/login',function(req,res,next){
    var verify= function () {
        var user=req.body.user;
        var passwd=req.body.passwd;
        if(!user||!passwd||user.trim()==""||passwd.trim()=="") return res.json({state:-1})
        if(user===config.user&&passwd===config.passwd){
            console.log("admin logined")
            req.session.hasLogined=true;
            res.json({state:1})
        }else{
            res.json({state:-2})
        }
    }
    if(config) return verify();
    maps.get("admin")
        .then(function(val){
            if(val!=undefined) return config=JSON.parse(val);
            var v={user:'hzw',passwd:'835156567q'};
            return maps.put("admin",JSON.stringify(v))
                .then(function(){
                    config=v;
                })
        })
        .then(function(){
            verify();
        })
        .catch(function(err){
            console.log("get admin "+err)
            res.json({state:1})
        })
})

router.post('/rename_tag',function(req,res,next){
    var tagSrc=req.body.tagSrc;
    var tagDst=req.body.tagDst;
    var hasFound=false;
    if(!tagSrc||tagSrc=='默认'||!tagDst||tagDst.length>15) return res.json({state:-1});
    for(var i in DC.tags){
        if(DC.tags[i]==tagSrc){
            if(i==0) return res.json({state:-1});
            DC.tags[i]=tagDst;
            tags.modifyById(i,tagDst)
                .then(function(){
                     res.json({state:1});
                })
                .catch(function(err){
                    console.log(err)
                     res.json({state:-1});
                })
            hasFound=true;
            break;
        }
    }
    if(!hasFound) return res.json({state:-1});
})

router.post('/delete_tag',function(req,res,next){
    var tagSrc=req.body.tagSrc;
    if(!tagSrc||tagSrc=='默认') return res.json({state:-1})
    var tagSrcId;
    for(var i in DC.tags){
        if(tagSrc==DC.tags[i]){
             tagSrcId=i;
            break;
        }
    }
    if(tagSrcId==undefined||tagSrcId==0) return res.json({state:-1})
    var result;
    dbHolder.openDB()
        .then(dbHolder.beginTransaction)
        .then(function(res){
            result=res;
            return blogs.modifyTags(tagSrcId,0,result);
        })
        .then(function(){
            return tags.deleteById(tagSrcId,result)
        })
        .then(function(){
           return dbHolder.commitTransaction(result);
        })
        .then(function(){
            result.db.close();
            delete DC.tags[i];
            console.log(DC.tags)
            res.json({state:1});
        })
        .catch(function(err) {
            console.log(err)
            if(result&&result.db)  result.db.close();
            return res.json({state: -1});
        })

})

module.exports=router;