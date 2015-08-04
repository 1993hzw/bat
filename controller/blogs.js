var dbHolder = require('./DBHolder');
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
                fields.tags + ') values (?,?,?,?,?,?,?)';
            var time = utils.getTime();
            var arr = [time, data[fields.title], data[fields.brief], data[fields.markdown], data[fields.html], data[fields.mode] ,data[fields.tags]];
            result.db.run(sql, arr, function (err) {
                if (err) return reject(err);
                resolve(result);
            })
        });
    }
    if (result) {
        return _insert(result)
            .then(function () {
                return Promise.resolve()
            })
    } else {
        return dbHolder.openDB()
            .then(_insert)
            .then(function () {
                return Promise.resolve()
            })
    }

}

var getById = function (startId, endId, result) {
    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "select " +
                fields.id + "," + fields.insert_time + "," + fields.modify_time + "," + fields.title + "," + fields.html + "," + fields.tags + "," + fields.visits + "," + fields.brief + "," + fields.mode + "," + fields.markdown +
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
    }
    if (result) {
        return _select(result)
            .then(function (result) {
                return Promise.resolve(result.rows);
            })
    } else {
        return dbHolder.openDB()
            .then(_select)
            .then(function (result) {
                return Promise.resolve(result.rows);
            })
    }

}

var getByTag = function (tag, offset, count, result) {
    if (!offset || offset < 0) offset = 0;
    if (!count || count < 1) count = 1;
    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "select " +
                fields.id + "," + fields.insert_time + "," + fields.modify_time + "," + fields.title + "," + fields.html + "," + fields.tags + "," + fields.visits + "," + fields.brief +
                " from " + fields.tableName;
            sql += " where " + fields.tags + "='" + tag + "'";
            sql += " order by " + fields.id + " desc limit " + offset + "," + count;

            result.db.all(sql, function (err, rows) {
                if (err) return reject(err);
                result.rows = rows;
                resolve(result);
            })
        })
    }
    if (result) {
        return _select(result)
            .then(function (result) {
                return Promise.resolve(result.rows);
            })
    } else {
        return dbHolder.openDB()
            .then(_select)
            .then(function (result) {
                return Promise.resolve(result.rows);
            })
    }
}

var getLast = function (offset, count, result) {
    if (!offset || offset < 0) offset = 0;
    if (!count || count < 1) count = 1;
    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "select " +
                fields.id + "," + fields.insert_time + "," + fields.modify_time + "," + fields.title + "," + fields.html + "," + fields.tags + "," + fields.visits + "," + fields.brief +
                " from " + fields.tableName;
            sql += " order by " + fields.id + " desc limit " + offset + "," + count;
            result.db.all(sql, function (err, rows) {
                if (err) return reject(err);
                result.rows = rows;
                resolve(result);
            })
        })
    }
    if (result) {
        return _select(result)
            .then(function (result) {
                return Promise.resolve(result.rows);
            })
    } else {
        return dbHolder.openDB()
            .then(_select)
            .then(function (result) {
                return Promise.resolve(result.rows);
            })
    }
}

var getHots = function (offset, count, result) {
    if (!offset || offset < 0) offset = 0;
    if (!count || count < 1) count = 1;
    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "select " +
                fields.id + "," + fields.title + "," + fields.visits +
                " from " + fields.tableName;
            sql += " order by " + fields.visits + " desc limit " + offset + "," + count;
            result.db.all(sql, function (err, rows) {
                if (err) return reject(err);
                result.rows = rows;
                resolve(result);
            })
        })
    }
    if (result) {
        return _select(result)
            .then(function (result) {
                return Promise.resolve(result.rows);
            })
    } else {
        return dbHolder.openDB()
            .then(_select)
            .then(function (result) {
                return Promise.resolve(result.rows);
            })
    }

}

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
    }
    if (result) {
        return _select(result)
            .then(function (result) {
                return Promise.resolve(result.rows);
            })
    } else {
        return dbHolder.openDB()
            .then(_select)
            .then(function (result) {
                return Promise.resolve(result.rows);
            })
    }

}

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
            if(data[fields.mode]!=undefined){
                setStat += fields.mode + "=?,";
                arr[i++] = data[fields.mode];
            }

            setStat = setStat.slice(0, setStat.length - 1);
            var sql = "update " + fields.tableName + setStat + " where " + fields.id + "=" + id;
            result.db.run(sql, arr, function (err) {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }
    if (result) {
        return _update(result)
            .then(function () {
                return Promise.resolve();
            })
    } else {
        return dbHolder.openDB()
            .then(_update)
            .then(function () {
                return Promise.resolve();
            })
    }

}

var modifyTags = function (tagSrc,tagDst, result) {
    var _update = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "update " + fields.tableName ;
                sql+=' set '+fields.tags+'=?'
                 sql+= " where " + fields.tags + "=?";
            console.log(sql+" "+tagSrc+" "+tagDst)
            result.db.run(sql, [tagDst,tagSrc], function (err) {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }
    if (result) {
        return _update(result)
            .then(function () {
                return Promise.resolve();
            })
    } else {
        return dbHolder.openDB()
            .then(_update)
            .then(function () {
                return Promise.resolve();
            })
    }

}

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
    if (result) {
        return _delete(result)
            .then(function () {
                return Promise.resolve();
            })
    } else {
        return dbHolder.openDB()
            .then(_delete)
            .then(function () {
                return Promise.resolve();
            })
    }
}

var visitsIncrement = function (id, result) {
    var _visits = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "update " + fields.tableName + " set " + fields.visits + "=" + fields.visits + "+1 where " + fields.id + "=" + id;
            result.db.run(sql, function (err) {
                //if(err) return reject(err);
                resolve(result);
            })
        })
    }
    if (result) {
        return _visits(result)
            .then(function () {
                return Promise.resolve();
            })
    } else {
        return dbHolder.openDB()
            .then(_visits)
            .then(function () {
                return Promise.resolve();
            })
    }
}


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
exports.modifyTags=modifyTags;
