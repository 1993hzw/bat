var Promise = require('bluebird');
var sqlite = require('sqlite3').verbose();
var utils = require('../utils/utils');

var blog = {
    tableName: "t_blog",
    id: "f_id",
    insert_time: "f_insert_time",
    modify_time: "f_modify_time",
    status:"f_status",//文章状态，暂未使用，以后可能添加公开和私密状态
    title: "f_title",
    brief: "f_brief",//摘要
    markdown: "f_markdown",
    html: "f_html",//在浏览文章时直接显示，不进行转义
    mode:"f_mode",//编辑模式，1：markdown:2：文本模式
    tags: "f_tags",//所属标签id
    top:"f_top",//0：默认，1：置顶
    visits: "f_visits"//文章访问量，查找热门文章的依据
}

var comment = {
    tableName: "t_comment",
    id: "f_id",
    insert_time: "f_insert_time",
    modify_time: "f_modify_time",
    status:"f_status",//评论状态，0：正常显示  10：隐藏  20：忽略
    content: "f_content",//评论内容
    reply: "f_reply",//回复
    blogId: "f_blog_id",//评论的文章id
    author: "f_author",//评论者
    contact: "f_contact"//联系方式
}

var map = {
    tableName: "t_map",
    id: "f_id",
    insert_time: "f_insert_time",
    modify_time: "f_modify_time",
    key: "f_key",
    value: "f_value"
}

var tag = {
    tableName: "t_tag",
    id: "f_id",
    insert_time: "f_insert_time",
    modify_time: "f_modify_time",
    name: "f_name"
}

var _open_db = function () {
    return new Promise(function (resolve, reject) {
        var db = new sqlite.Database(APP_PATH + "/data/myblog.sqlite3", function (err) {
            if (err) return reject("vv" + err);
            resolve({db: db});
        })
    });
}

var _open_db_config = function () {
    return new Promise(function (resolve, reject) {
        var db = new sqlite.Database(APP_PATH + "/data/config.sqlite3", function (err) {
            if (err) return reject("vv" + err);
            resolve({db: db});
        })
    });
}

var _createBlogTable = function (result) {
    return new Promise(function (resolve, reject) {
        var sql = 'create table if not exists ' + blog.tableName + '(' +
            blog.id + ' integer,' +
            blog.insert_time + ' integer,' +
            blog.modify_time + ' integer,' +
            blog.title + ' text,' +
            blog.brief + ' text,' +
            blog.markdown + ' text,' +
            blog.html + ' text,' +
            blog.tags + ' text,' +
            blog.status + ' integer default 0,' +
            blog.mode + ' integer default 1,' +
            blog.top + ' integer default 0,' +
            blog.visits + ' integer default 0,' +
            'primary key (' + blog.id + ')' +
            ')';
        result.db.run(sql, function (err) {
            if (err) return reject(err);
            resolve(result);
        })
    })
}

var _createCommentTable = function (result) {
    return new Promise(function (resolve, reject) {
        var sql = 'create table if not exists ' + comment.tableName + '(' +
            comment.id + ' integer,' +
            comment.insert_time + ' integer,' +
            comment.modify_time + ' integer,' +
            comment.content + ' text,' +
            comment.reply + ' text,' +
            comment.blogId + ' integer,' +
            comment.author + ' text,' +
            comment.contact + ' text,' +
            comment.status + ' integer default 0,' +
            'primary key (' + comment.id + ')' +
            ')';
        result.db.run(sql, function (err) {
            if (err) return reject(err);
            resolve(result);
        })
    })
}

var _createConfigTable = function (result) {
    return new Promise(function (resolve, reject) {
        var sql = 'create table if not exists ' + map.tableName + '(' +
            map.insert_time + ' integer,' +
            map.modify_time + ' integer,' +
            map.key + ' text,' +
            map.value + ' text,' +
            'primary key (' + map.key + ')' +
            ')';
        result.db.run(sql, function (err) {
            if (err) return reject(err);
            resolve(result);
        })
    })
}

var _createTagTable = function (result) {
    return new Promise(function (resolve, reject) {
        var sql = 'create table if not exists ' + tag.tableName + '(' +
            tag.id + ' integer,' +
            tag.insert_time + ' integer,' +
            tag.modify_time + ' integer,' +
            tag.name + ' text,' +
            'primary key (' + tag.id + ')' +
            ')';
        result.db.run(sql, function (err) {
            if (err) return reject(err);
            resolve(result);
        })
    })
}


var _beginTransaction = function (result) {
    return new Promise(function (resolve, reject) {
        result.db.run("BEGIN TRANSACTION", function (err) {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

var _commitTransaction = function (result) {
    return new Promise(function (resolve, reject) {
        result.db.run("COMMIT", function (err) {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

/*
  判断table表中是否存在字段col
 */
var _checkIfExistsColumn = function (result, table, col, cb) {
    var sql = "select sql from sqlite_master where tbl_name='" + table + "' and type='table' and sql like '%" + col + "%'";
    result.db.all(sql, function (err, rows) {
        if (err) return cb(err);
        if (rows.length > 0) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    })
}

/*
  给指定的表添加新列，
  table 表明
  col 列名
   type_retrain 类型与约束
 */
var _addColumns = function (result, table,col,type_retrain) {
    return new Promise(function (resolve, reject) {
        _checkIfExistsColumn(result, table, col, function (error, res) {
            if (error) return reject(error);
            if(res==false){
                var sql = 'alter table ' + table + ' add '+col+' '+type_retrain;
                result.db.run(sql, function (err) {
                    if (err) return reject(err);
                    resolve(result);
                })
            }else{
                resolve(result);
            }
        })
    })
}

var initDB = function () {
    return _open_db()
        .then(_createBlogTable)
        .then(_createCommentTable)
        .then(_createTagTable)
        /*.then(function(){
         return _open_db_config();
         })*/
        .then(_createConfigTable)
        /*.then(function(result){
            return _addColumns(result,comment.tableName,'test','int default 0');
        })*/
        .then(function(result){
            result.db.close();
        })
}
exports.initDB = initDB;
exports.beginTransaction = _beginTransaction;
exports.commitTransaction = _commitTransaction;
exports.openDB = _open_db;
//exports.openDBConfig=_open_db_config;
exports.blog = blog;
exports.map = map;
exports.comment = comment;
exports.tag = tag;