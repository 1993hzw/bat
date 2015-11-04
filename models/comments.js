var dbHolder = require('./database');
var Promise = require('bluebird');
var utils = require('../utils/utils');
var fields = dbHolder.comment;

var add = function (data, result) {
    var _insert = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'insert into ' + fields.tableName + ' (' +
                fields.insert_time + ',' +
                fields.content + ',' +
                fields.author + ',' +
                fields.contact + ',' +
                fields.blogId + '' +
                ') values (?,?,?,?,?)';
            var arr = [utils.getTime(), data[fields.content], data[fields.author], data[fields.contact], data[fields.blogId]];
            result.db.run(sql, arr, function (err) {
                if (err) return reject(err);
                resolve(result);
            })
        })
    };
    return Promise.resolve()
        .then(function () {
            if (result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_insert)
        .then(function () {
            return Promise.resolve();
        })
};

var replay = function (replay, id, result) {
    var _update = function (result) {
        return new Promise(function (resolve, reject) {
            var setStat = " set ";
            var arr = [], i = 0;
            setStat += fields.modify_time + "=?,";
            arr[i++] = utils.getTime();
            setStat += fields.reply + "=?";
            arr[i++] = replay;

            var sql = "update " + fields.tableName + setStat + " where " + fields.id + "=" + id;

            result.db.run(sql, arr, function (err) {
                if (err) return reject(err);
                resolve(result);
            })
        })
    };
    return Promise.resolve()
        .then(function () {
            if (result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_update)
        .then(function () {
            return Promise.resolve();
        })
};

var getCommentsByBlogID = function (blog_id, offset, count, result) {
    if (!blog_id || blog_id < 0) return Promise.reject();
    if (!offset || offset < 0) offset = 0;
    if (!count || count < 0) count = 1;

    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'select ' + fields.id + ',' + fields.content + ',' + fields.reply + ',' + fields.insert_time + ',' + fields.modify_time + ' from ' + fields.tableName;
            sql += ' where ' + fields.blogId + "=?"
            sql += " order by " + fields.id + " desc limit " + offset + "," + count;
            result.db.all(sql, [blog_id], function (err, rows) {
                if (err) return reject(err);
                result.rows = rows;
                resolve(result);
            })
        })
    };
    return Promise.resolve()
        .then(function () {
            if (result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_select)
        .then(function (result) {
            return Promise.resolve(result.rows);
        })
};

var getCommentByID = function (id, result) {
    if (!id || id < 0) return Promise.reject();

    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'select * from ' + fields.tableName;
            sql += ' where ' + fields.id + "=?"
            result.db.all(sql, [id], function (err, rows) {
                if (err) return reject(err);
                result.rows = rows;
                resolve(result);
            })
        })
    };
    return Promise.resolve()
        .then(function () {
            if (result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_select)
        .then(function (result) {
            return Promise.resolve(result.rows);
        })
};

//获取最新评论
var getLastComments = function (condition, offset, count, result) {
    if (!offset || offset < 0) offset = 0;
    if (!count || count < 0) count = 1;

    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql;
            if (condition.status != undefined) {
                var blog = require('./database').blog;
                sql = 'select ' + fields.tableName + '.' + fields.id + ',' + fields.content + ',' + fields.reply + ',' + fields.tableName + '.' + fields.insert_time + ',' + fields.blogId +
                    ' from ' + fields.tableName + ',' + blog.tableName +
                    " where " + blog.tableName + "." + blog.id + "=" + fields.blogId + " and " +
                    blog.tableName + "." + blog.status + "=" + condition.status;
            } else {
                sql = 'select ' + fields.id + ',' + fields.content + ',' + fields.reply + ',' + fields.insert_time + ',' + fields.blogId +
                    ' from ' + fields.tableName;
            }
            sql += " order by " + fields.tableName + '.' + fields.id + " desc limit " + offset + "," + count;
            result.db.all(sql, function (err, rows) {
                if (err) return reject(err);
                result.rows = rows;
                resolve(result);
            })
        })
    };
    return Promise.resolve()
        .then(function () {
            if (result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_select)
        .then(function (result) {
            return Promise.resolve(result.rows);
        })
};

var deleteByBlogId = function (id, result) {
    var _delete = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "delete from " + fields.tableName +
                " where " + fields.blogId + "=" + id;
            result.db.run(sql, function (err) {
                if (err) return reject(err);
                resolve(result);
            })
        });
    };
    return Promise.resolve()
        .then(function () {
            if (result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_delete)
        .then(function () {
            return Promise.resolve();
        })
};

var deleteById = function (id, result) {
    var _delete = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "delete from " + fields.tableName +
                " where " + fields.id + "=" + id;
            result.db.run(sql, function (err) {
                if (err) return reject(err);
                resolve(result);
            })
        });
    };
    return Promise.resolve()
        .then(function () {
            if (result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_delete)
        .then(function () {
            return Promise.resolve();
        })
};

var getLastCommentsNoReplay = function (offset, count, result) {
    if (!offset || offset < 0) offset = 0;
    if (!count || count < 0) count = 1;

    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'select * from ' + fields.tableName;
            sql += ' where ' + fields.reply + ' is null '
            sql += " order by " + fields.id + " desc limit " + offset + "," + count;
            result.db.all(sql, function (err, rows) {
                if (err) return reject(err);
                result.rows = rows;
                resolve(result);
            })
        })
    };
    return Promise.resolve()
        .then(function () {
            if (result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_select)
        .then(function (result) {
            return Promise.resolve(result.rows);
        })
};

var getLastCommentsReplayed = function (offset, count, result) {
    if (!offset || offset < 0) offset = 0;
    if (!count || count < 0) count = 1;

    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'select * from ' + fields.tableName;
            sql += ' where ' + fields.reply + ' not null ';
            sql += " order by " + fields.id + " desc limit " + offset + "," + count;
            result.db.all(sql, function (err, rows) {
                if (err) return reject(err);
                result.rows = rows;
                resolve(result);
            })
        })
    };
    return Promise.resolve()
        .then(function () {
            if (result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_select)
        .then(function (result) {
            return Promise.resolve(result.rows);
        })
};

exports.add = add;
exports.getCommentByID = getCommentByID;
exports.getCommentsByBlogID = getCommentsByBlogID;
exports.getLastComments = getLastComments;
exports.getLastCommentsNoReplay = getLastCommentsNoReplay;
exports.getLastCommentsReplayed = getLastCommentsReplayed;
exports.replay = replay;
exports.deleteByBlogId = deleteByBlogId;
exports.deleteById = deleteById;

exports.drop = function () {
    var _delete = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "drop table " + fields.tableName
            result.db.run(sql, function (err) {
                if (err) return reject(err);
                resolve(result);
            })
        });
    };
    return dbHolder.openDB()
        .then(_delete)
        .then(function () {
            return Promise.resolve();
        })
};
