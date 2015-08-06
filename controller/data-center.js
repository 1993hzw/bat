var init=function(){
    var dbHolder = require('../controller/DBHolder');
    var tags = require('../controller/tags');
    var Promise=require('bluebird');
    var maps=require('../controller/maps');
    var tagObj={};
    var admin=undefined;
    var visits=0;//博客访问量
    dbHolder.initDB()//初始化数据库
        .then(function(){//初始化map
            return maps.init();
        })
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
        .then(function(){//获取管理员信息
            var val = maps.get("admin");
                if(val!=undefined) return admin=JSON.parse(val);
                var v={user:'',password:'',name:'',email:''};
                return maps.put("admin",JSON.stringify(v))
                          .then(function(){
                                admin=v;
                        })
        })
        .then(function(){//获取博客访问量
            var temp=maps.get('visits');
            if(temp==undefined){
                visits=0;
                return maps.put('visits',visits)
            }else{
                visits=parseInt(temp);
            }
        })
        .then(function () {
            exports.admin=admin;
            exports.tags=tagObj;
            exports.visits=visits;
            console.log(tagObj)
            console.log(admin);
            console.log('visits:'+visits);
            console.log("init db success!");
        })
        .catch(function (err) {
            console.log(err)
        })
}

exports.init=init;