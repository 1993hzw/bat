var router=require('express').Router();
var dbHolder=require('../../models/DBHolder');
var blogs=require('../../models/blogs');
var comments=require('../../models/comments');
var markdown=require('../../utils/markdown');
var utils=require('../../utils/utils');
var Promise = require('bluebird');
var DC=require('../../models/data-center');
var tags=require('../../models/tags');

//添加新标签
router.post('/_add_tag',function(req,res,next){
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
            result.db.close();
            for(var i=0;i<rows.length;i++)
                tagObj[rows[i].f_id]=rows[i].f_name;
            DC.tags=tagObj;
            res.json({state:1,tags:DC.tags})
        })
        .catch(function(err){
            console.log(err);
            if(result&&result.db)  result.db.close();
            return res.json({state:-1});
        })
})

//重命名标签
router.post('/_rename_tag',function(req,res,next){
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
})

//删除标签
router.post('/_delete_tag',function(req,res,next){
    var tagSrc=req.body.tagSrc;
    if(!tagSrc||tagSrc=='默认') return res.json({state:-1})
    var tagSrcId;
    for(var i in DC.tags){
        if(tagSrc==DC.tags[i]){
             tagSrcId=i;
            break;
        }
    }
    if(tagSrcId==undefined||tagSrcId==1) return res.json({state:-1})
    var result;
    dbHolder.openDB()
        .then(dbHolder.beginTransaction)
        .then(function(res){
            result=res;
            return blogs.modifyTags(tagSrcId,1,result);
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