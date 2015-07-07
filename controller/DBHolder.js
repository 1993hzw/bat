var Promise=require('bluebird');
var sqlite=require('sqlite3').verbose();
var utils=require('../utils/utils');

var blog={
    tableName:"t_blog",
    id:"f_id",
    insert_time:"f_insert_time",
    modify_time:"f_modify_time",
    title:"f_title",
    brief:"f_brief",
    markdown:"f_markdown",
    html:"f_html",
    tags:"f_tags",
    visits:"f_visits"
}

var comment={
    tableName:"t_comment",
    id:"f_id",
    insert_time:"f_insert_time",
    modify_time:"f_modify_time",
    content:"f_content",
    reply:"f_reply",
    blogId:"f_blog_id",
    author:"f_author",
    contact:"f_contact"
}

var _open_db=function(){
    return new Promise(function(resolve,reject){
        var db=new sqlite.Database("../data/myblog.sqlite3",function(err){
                 if(err) return reject("vv"+err);
                 resolve({db:db});
        })
    });
}

var _createBlogTable=function(result){
    return new Promise(function(resolve,reject){
        var sql='create table if not exists '+blog.tableName+'(' +
            blog.id+' integer,' +
            blog.insert_time+' text,' +
            blog.modify_time+' text,' +
            blog.title+' text,'+
            blog.brief+' text,'+
            blog.markdown+' text,' +
            blog.html+' text,' +
            blog.tags+' text,' +
            blog.visits+' integer default 0,'+
            'primary key ('+blog.id+')' +
            ')';
        result.db.run(sql,function(err){
            if(err) return reject(err);
            resolve(result);
        })
    })
}

var _createCommentTable=function(result){
    return new Promise(function(resolve,reject){
        var sql='create table if not exists '+comment.tableName+'(' +
            comment.id+' integer,' +
            comment.insert_time+' text,' +
            comment.modify_time+' text,' +
            comment.content+' text,'+
            comment.reply+' text,'+
            comment.blogId+' integer,' +
            comment.author+' text,' +
            comment.contact+' text,' +
            'primary key ('+comment.id+')' +
            ')';
        result.db.run(sql,function(err){
            if(err) return reject(err);
            resolve(result);
        })
    })
}

var _beginTransaction = function (result) {
    return new Promise(function(resolve,reject){
        result.db.run("BEGIN TRANSACTION",function(err){
            if(err) return reject(err);
            resolve(result);
        });
    });
};

var _commitTransaction = function (result) {
    return new Promise(function(resolve,reject){
        result.db.run("COMMIT",function(err){
            if(err) return reject(err);
            resolve(result);
        });
    });
};

var readTags = function (result) {
    return new Promise(function(resolve,reject) {
        require('fs').readFile('../data/tags', "utf-8", function (err, data) {
            if (err) return reject(err);
            exports.tags=eval('('+data+')');
            resolve();
        });
    })
};

var initDB=function(){
    _open_db()
        .then(_createBlogTable)
        .then(_createCommentTable)
        .then(readTags)
        .then(function(){
            console.log("init db success!")
        })
        .catch(function(err){
            console.log(err)
        })
}
initDB();

exports.blog=blog;
exports.beginTransaction=_beginTransaction;
exports.commitTransaction=_commitTransaction;
exports.openDB=_open_db;

exports.comment=comment;