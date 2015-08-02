var init=function(){
    var dbHolder = require('../controller/DBHolder');
    var tags = require('../controller/tags');
    var Promise=require('bluebird');
    var maps=require('../controller/maps');
    var tagObj={};
    var admin=undefined;
    dbHolder.initDB()//初始化数据库
        .then(function(){
            return tags.getAll();
        })
        .then(function(rows){//初始化标签
            if(rows.length<=0){
                return tags.add("默认")
                    .then(function(){
                        return tags.getAll();
                    })
            }
            return Promise.resolve(rows);
        })
        .then(function(rows){//将标签弄成键值对id:name
            for(var i=0;i<rows.length;i++)
                tagObj[rows[i].f_id]=rows[i].f_name;
        })
        .then(function(){
           return  maps.get("admin")
                .then(function(val){
                    if(val!=undefined) return admin=JSON.parse(val);
                    var v={user:'hzw',passwd:'835156567q'};
                    return maps.put("admin",JSON.stringify(v))
                              .then(function(){
                                    admin=v;
                            })
                })
        })
        .then(function () {
            exports.admin=admin;
            exports.tags=tagObj;
            console.log("init db success!");
            console.log(tagObj)
        })
        .catch(function (err) {
            console.log(err)
        })
}

exports.init=init;