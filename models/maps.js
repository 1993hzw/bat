var dbholder = require('./DBHolder');
var Promise = require('bluebird');
var utils = require('../utils/utils');
var fields = dbholder.map;
var map;//在内存中存放map数据

//初始化，在内存中存放map数据
var _init = function () {
    return getall()
        .then(function (rows) {
            map={};
            for (var i = 0; i < rows.length; i++) {
                map[rows[i].key] = rows[i].value;
            }
        })
}

var put = function (key, value, result) {
    var _insert = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'insert into ' + fields.tableName + ' (' +
                fields.insert_time + ',' +
                fields.key + ',' +
                fields.value + ') values (?,?,?)';
            var arr = [utils.getTime(), key, value];
            result.db.run(sql, arr, function (err) {
                if (err) return reject("insert " + err);
                resolve(result);
            })
        })
    }
    return Promise.resolve()
        .then(function () {
            if(result) return Promise.resolve(result);
            return dbholder.openDB()
                .then(function(res){
                    result=res;
                })
        })
        .then(function(){
            if(map[key]===undefined){//没有该key则插入
                return _insert(result);
            }else{
                return modify(key,value,result);
            }
        })
        .then(function(){
            map[key]=value;
        })
}

var get = function (key, result) {
    return map[key];
   /* var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'select ' + fields.value + ' from ' + fields.tableName;
            sql += ' where ' + fields.key + '=?';
            result.db.all(sql, [key], function (err, rows) {
                if (err) return reject("get " + err);
                result.rows = rows;
                resolve(result);
            })
        })
    }
    if (result) {
        return _select(result)
            .then(function (result) {
                var v = result.rows.length > 0 ? result.rows[0].f_value : undefined;
                return Promise.resolve(v);
            })
    } else {
        return dbholder.openDB()
            .then(_select)
            .then(function (result) {
                var v = result.rows.length > 0 ? result.rows[0].f_value : undefined;
                return Promise.resolve(v);
            })
    }*/
}

var modify = function (key, value, result) {
    var _update = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = "update " + fields.tableName;
            sql += ' set ' + fields.modify_time + '=?,' + fields.value + '=?'
            sql += " where " + fields.key + "=?";
            result.db.run(sql, [utils.getTime(), value, key], function (err) {
                if (err) return reject("modify " + err);
                resolve(result);
            })
        })
    }
    return Promise.resolve()
        .then(function () {
            if(result) return Promise.resolve(result);
            return dbholder.openDB();
        })
        .then(_update)
        .then(function () {
            return Promise.resolve();
        })

}

var getall = function (result) {
    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'select ' + fields.key + ' as key,' + fields.value + ' as value' + ' from ' + fields.tableName;
            result.db.all(sql, function (err, rows) {
                if (err) return reject("getall " + err);
                result.rows = rows;
                resolve(result);
            })
        })
    }
    return Promise.resolve()
        .then(function () {
            if(result) return Promise.resolve(result);
            return dbholder.openDB();
        })
        .then(_select)
        .then(function (result) {
            return Promise.resolve(result.rows);
        })
}

exports.put = put;
exports.get = get;
exports.getall = getall;
exports.init=_init;
