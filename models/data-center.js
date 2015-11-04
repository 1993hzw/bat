var init=function(){
    var dbHolder = require('../models/database');
    var tags = require('../models/tags');
    var blogs=require('../models/blogs');
    var Promise=require('bluebird');
    var maps=require('../models/maps');
    var qiniu=require('../models/storage/qiniu');
    var marked=require('marked');
    var htmlToText=require('html-to-text');
    var tagObj={};
    var admin=undefined;
    var upload_policy;
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
        .then(function(){
            var val=maps.get('hasCreatedGuide');
            if(!val){
                var fields=dbHolder.blog;
                var data={};
                var brief;
                var markdown=require('fs').readFileSync(APP_PATH+'/data/guide',{encoding:'utf-8'});
                data[fields.title]='欢迎使用 Bat 博客系统';
                data[fields.markdown]=markdown;
                data[fields.mode]=1;//markdown
                data[fields.html]=marked(markdown);
                brief = htmlToText.fromString(data[fields.html], {wordwrap: 130}).substr(0,150);
                data[fields.brief]=brief;
                data[fields.tags]="默认";
                return blogs.add(data)
                    .then(function(){
                        return maps.put('hasCreatedGuide','true')
                    })
            }
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
        .then(function(){//上传策略
            var val=maps.get("upload_policy");
            if(val!=undefined){
                var json=JSON.parse(val);
                if(json.policy==1){//上传到第三方
                    qiniu.init(json);
                }
                upload_policy=json.policy;
            }else{
                return maps.put("upload_policy",JSON.stringify({policy:2}))
                    .then(function(){
                        upload_policy=2;//上传到本地服务器
                    });
            }
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
            exports.upload_policy=upload_policy;
            //console.log(tagObj);
            console.log(admin);
            console.log('visits:'+visits);
            console.log("init db success!");
        })
        .catch(function (err) {
            console.log(err);
        })
};

exports.init=init;