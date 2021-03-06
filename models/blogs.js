var dbHolder = require('./database');
var Promise = require('bluebird');
var utils = require('../utils/utils');
var fields = dbHolder.blog;

var add = function (data, result) {
    var _insert = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'insert into ' + fields.tableName + ' (' +
                fields.insert_time + ',' +
                fields.title + ',' +
                fields.brief + ',' +
                fields.markdown + ',' +
                fields.html + ',' +
                fields.mode + ',' +
                fields.status + ',' +
                fields.tags + ') values (?,?,?,?,?,?,?,?)';
            var time = utils.getTime();
            var arr = [time, data[fields.title], data[fields.brief], data[fields.markdown], data[fields.html], data[fields.mode], data[fields.status], data[fields.tags]];
            result.db.run(sql, arr, function (err) {
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
        .then(_insert)
        .then(function () {
            return Promise.resolve()
        })

};

var getById = function (startId, endId, result) {
    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "select " +
                fields.id + "," + fields.insert_time + "," + fields.modify_time + ","
                + fields.title + "," + fields.html + "," + fields.tags + ","
                + fields.visits + "," + fields.brief + "," + fields.mode + ","
                + fields.top + "," + fields.markdown +"," + fields.status +
                " from " + fields.tableName;
            if (endId) {
                if (endId >= startId)
                    sql += " where " + fields.id + ">=" + startId + " and " + fields.id + "<=" + endId;
                else
                    sql += " where " + fields.id + ">=" + startId;
            }
            else sql += " where " + fields.id + "=" + startId;

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

//根据标签获取文章，按照置顶排序
var getByTag = function (condition, offset, count, result) {

    var tag=condition.tag;
    var status=condition.status;

    if (!offset || offset < 0) offset = 0;
    if (!count || count < 1) count = 1;
    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "select " +
                fields.id + "," + fields.insert_time + "," + fields.modify_time + "," + fields.title +
                "," + fields.html + "," + fields.tags + "," + fields.visits + "," + fields.top + ","
                + fields.brief + ","+fields.status+
                " from " + fields.tableName;
            if(status!=undefined){
                if (tag!=undefined){
                    sql += " where " + fields.tags + "='" + tag + "' and "+fields.status+"="+status;
                }else{
                    sql += " where " + fields.status + "=" + status;
                }
            }else if (tag!=undefined){
                //如果tag为空则返回最新文章
                sql += " where " + fields.tags + "='" + tag + "'";
            }
            //根据置顶排序，再根据插入时间降序排序
            sql += " order by " + fields.top+" desc ,"+ fields.id + " desc limit " + offset + "," + count;



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

//获取最新文章
var getLast = function (condition,offset, count, result) {
    if(!condition) condition={};
    if (!offset || offset < 0) offset = 0;
    if (!count || count < 1) count = 1;
    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "select " +
                fields.id + "," + fields.insert_time + "," + fields.modify_time + "," + fields.title +
                "," + fields.html + "," + fields.tags + "," + fields.visits + "," + fields.top + "," + fields.brief +
                " from " + fields.tableName;
            if(condition.status!=undefined){
                sql+=" where "+fields.status+"="+condition.status;
            }
            sql += " order by " + fields.id + " desc limit " + offset + "," + count;
            result.db.all(sql, function (err, blogRows) {
                if (err) return reject(err);
                result.blogRows = blogRows;
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
            return Promise.resolve(result.blogRows);
        })
};

var getHots = function (condition,offset, count, result) {
    if (!offset || offset < 0) offset = 0;
    if (!count || count < 1) count = 1;
    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "select " +
                fields.id + "," + fields.title + "," + fields.visits +
                " from " + fields.tableName;
            if(condition.status!=undefined){
                sql+=" where "+fields.status+"="+condition.status;
            }
            sql += " order by " + fields.visits + " desc limit " + offset + "," + count;
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

var getTitleByArray = function (arr, result) {
    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "select " +
                fields.title + "," + fields.id + " from " + fields.tableName;
            sql += " where ";
            for (var i = 0; i < arr.length - 1; i++) {
                sql += fields.id + "=? or "
            }
            sql += fields.id + "=?";
            result.db.all(sql, arr, function (err, rows) {
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

var modifyById = function (id, data, result) {
    var _update = function (result) {
        return new Promise(function (resolve, reject) {
            var setStat = " set ";
            var arr = [], i = 0;
            setStat += fields.modify_time + "=?,";
            arr[i++] = utils.getTime();

            if (data[fields.title] != undefined) {
                setStat += fields.title + "=?,";
                arr[i++] = data[fields.title];
            }
            if (data[fields.brief] != undefined) {
                setStat += fields.brief + "=?,";
                arr[i++] = data[fields.brief];
            }
            if (data[fields.html] != undefined) {
                setStat += fields.html + "=?,";
                arr[i++] = data[fields.html];
            }
            if (data[fields.markdown] != undefined) {
                setStat += fields.markdown + "=?,";
                arr[i++] = data[fields.markdown];
            }
            if (data[fields.tags] != undefined) {
                setStat += fields.tags + "=?,";
                arr[i++] = data[fields.tags];
            }
            if (data[fields.mode] != undefined) {
                setStat += fields.mode + "=?,";
                arr[i++] = data[fields.mode];
            }
            if (data[fields.status] != undefined) {
                setStat += fields.status + "=?,";
                arr[i++] = data[fields.status];
            }
            if (data[fields.top] != undefined) {
                setStat += fields.top + "=?,";
                arr[i++] = data[fields.top];
            }

            setStat = setStat.slice(0, setStat.length - 1);
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

var modifyTags = function (tagSrc, tagDst, result) {
    var _update = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "update " + fields.tableName;
            sql += ' set ' + fields.tags + '=?'
            sql += " where " + fields.tags + "=?";
            console.log(sql + " " + tagSrc + " " + tagDst)
            result.db.run(sql, [tagDst, tagSrc], function (err) {
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
    }
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

var visitsIncrement = function (id,increment, result) {
    increment=increment||1;
    var _visits = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "update " + fields.tableName +
                " set " + fields.visits + "=" + fields.visits + "+"+ increment +
                " where " + fields.id + "=" + id;
            result.db.run(sql, function (err) {
                //if(err) return reject(err);
                resolve(result);
            })
        })
    };
    return Promise.resolve()
        .then(function () {
            if (result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_visits)
        .then(function () {
            return Promise.resolve();
        })
};


var setTop = function (id, top, result) {
    var _setTop = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "update " + fields.tableName + " set " + fields.top + "=" + top + " where " + fields.id + "=" + id;
            result.db.run(sql, function (err) {
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
        .then(_setTop)
        .then(function () {
            return Promise.resolve();
        })
};


exports.fields = fields;
exports.add = add;
exports.getById = getById;
exports.getByTag = getByTag;
exports.getLast = getLast;
exports.getHots = getHots;
exports.getTitleByArray = getTitleByArray;
exports.modifyById = modifyById;
exports.deleteById = deleteById;
exports.visitsIncrement = visitsIncrement;
exports.modifyTags = modifyTags;
exports.setTop = setTop;
