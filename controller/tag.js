var dbHolder=require('../models/database');
var blogs=require('../models/blogs');
var comments=require('../models/comments');
var markdown=require('../utils/markdown');
var utils=require('../utils/utils');
var Promise = require('bluebird');
var DC=require('../models/data-center');
var tags=require('../models/tags');

//post 添加新标签
exports._add_tag=function(req,res,next){
    var tag=req.body.tag.trim();
    if(!tag) return res.json({state:-1})
    for(var i in DC.tags){
        if(DC.tags[i]==tag) return res.json({state:-2});
    }
    var tagObj={};
    var result;
    dbHolder.openDB()
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
            for(var i=0;i<rows.length;i++)
                tagObj[rows[i].f_id]=rows[i].f_name;
            DC.tags=tagObj;
            res.json({state:1,tags:DC.tags})
        })
        .catch(function(err){
            console.log(err);
            return res.json({state:-1});
        })
};

//post重命名标签
exports._rename_tag=function(req,res,next){
    var tagSrc=req.body.tagSrc;
    var tagDst=req.body.tagDst;
    var hasFound=false;
    if(!tagSrc||tagSrc=='默认'||!tagDst||tagDst.length>15) return res.json({state:-1});
    for(var i in DC.tags){
        if(DC.tags[i]==tagDst) return res.json({state:-2});
    }
    for(var i in DC.tags){
        if(DC.tags[i]==tagSrc){
            if(i==1) return res.json({state:-1});
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
};

//post 删除标签，默认标签不可删除
exports._delete_tag=function(req,res,next){
    var tag=req.body.tag;
    if(!tag||tag=='默认') return res.json({state:-1});
    var tagId;
    for(var i in DC.tags){
        if(tag==DC.tags[i]){
             tagId=i;
            break;
        }
    }
    if(tagId==undefined||tagId==1) return res.json({state:-1});
    var result;
    dbHolder.openDB()
        .then(dbHolder.beginTransaction)
        .then(function(res){
            result=res;
            //删除标签前，该标签下的文章移到默认标签下
            return blogs.modifyTags(tagId,1,result);
        })
        .then(function(){
            return tags.deleteById(tagId,result)
        })
        .then(function(){
           return dbHolder.commitTransaction(result);
        })
        .then(function(){
            delete DC.tags[i];
            console.log(DC.tags)
            res.json({state:1});
        })
        .catch(function(err) {
            console.log(err)
            return res.json({state: -1});
        })
};
