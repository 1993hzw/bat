var dbholder = require('./DBHolder');
var promise = require('bluebird');
var utils = require('../utils/utils');
var fields = dbholder.config;

var put = function (key,value,result) {
    var _insert = function (result) {
        return new promise(function (resolve, reject) {
            var sql = 'insert into ' + fields.tableName + ' (' +
                fields.insert_time + ',' +
                fields.key + ',' +
                fields.value + ') values (?,?,?)';
            var arr = [utils.getTime(), key,value];
            result.db.run(sql, arr, function (err) {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }
    if(result){
        return _insert(result)
                     .catch(function(){
                          return modify(key,value,result)
                     })
    }else{
        var result;
        return dbholder.openDBConfig()
               .then(function(res){
                  result=res;
                return promise.resolve(result);
               }).then(_insert)
               .catch(function(){
                return modify(key,value,result)
               })
    }
}

var get = function (key,result) {
    var _select = function (result) {
        return new promise(function (resolve, reject) {
            var sql = 'select ' + fields.value + ' from ' + fields.tableName;
            sql+=' where '+fields.key+'=?';
            result.db.all(sql,[key], function (err, rows) {
                if (err) return reject("get "+err);
                result.rows = rows;
                resolve(result);
            })
        })
    }
    if(result){
        return _select(result)
            .then(function (result) {
                var v=result.rows.length>0?result.rows[0].f_value:undefined;
                return promise.resolve(v);
            })
    }else{
        return dbholder.openDBConfig()
            .then(_select)
            .then(function (result) {
                var v=result.rows.length>0?result.rows[0].f_value:undefined;
                return promise.resolve(v);
            })
    }
}

var modify = function (key,value, result) {
    var _update = function (result) {
        return new promise(function (resolve, reject) {
            var sql = "update " + fields.tablename ;
                 sql+= ' set '+fields.modify_time+'=?,'+fields.value+'=?'
                 sql+= " where " + fields.key + "=?";
            result.db.run(sql, [utils.getTime(),value,key], function (err) {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }
    if (result) {
        return _update(result)
            .then(function () {
                return promise.resolve();
            })
    } else {
        return dbholder.openDBConfig()
            .then(_update)
            .then(function () {
                return promise.resolve();
            })
    }

}

var getall=function(result){
    var _select = function (result) {
        return new promise(function (resolve, reject) {
            var sql = 'select ' + fields.key+' as key,'+fields.value +' as value'+ ' from ' + fields.tableName;
            result.db.all(sql, function (err, rows) {
                if (err) return reject("getall "+err);
                result.rows = rows;
                resolve(result);
            })
        })
    }
    if(result){
        return _select(result)
            .then(function (result) {
                return promise.resolve(result.rows);
            })
    }else{
        return dbholder.openDBConfig()
            .then(_select)
            .then(function (result) {
                return promise.resolve(result.rows);
            })
    }
}

exports.put = put;
exports.get = get;
exports.getall=getall;
