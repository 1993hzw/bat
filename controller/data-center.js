var init=function(){
    var dbHolder = require('../controller/DBHolder');
    var tags = require('../controller/tags');
    var Promise=require('bluebird')
    var tagObj={};
    dbHolder.initDB()
        .then(function(){
            return tags.getAll();
        })
        .then(function(rows){
            if(rows.length<=0){
                return tags.add("默认")
                    .then(function(){
                        return tags.getAll();
                    })
            }
            return Promise.resolve(rows);
        })
        .then(function(rows){
            for(var i=0;i<rows.length;i++)
                tagObj[rows[i].f_id]=rows[i].f_name;
        })
        .then(function () {
            console.log("init db success!");
            /*tagObj.count=function(){
                var n=0;
                for(var e in tagObj) n++;
                return n;
            }*/
            exports.tags=tagObj;
            console.log(tagObj)
        })
        .catch(function (err) {
            console.log(err)
        })
}

exports.init=init;