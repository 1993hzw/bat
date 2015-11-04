var dbHolder = require('./database');
var Promise = require('bluebird');
var utils = require('../utils/utils');
var fields = dbHolder.tag;

var add = function (name, result) {
    var _insert = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'insert into ' + fields.tableName + ' (' +
                fields.insert_time + ',' +
                fields.name + ') values (?,?)';
            result.db.run(sql, [utils.getTime(), name], function (err) {
                if (err) return reject(err);
                resolve(result);
            });
        })
    }
    return Promise.resolve()
        .then(function () {
            if(result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_insert)
        .then(function () {
            return Promise.resolve()
        })
}

var getById = function (id, result) {
    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'select ' + fields.name + ' from ' + fields.tableName;
            sql += ' where ' + fields.id + '=?';
            result.db.all(sql, [id], function (err, rows) {
                if (err) return reject(err);
                result.rows = rows;
                resolve(result);
            })
        })
    }
    return Promise.resolve()
        .then(function () {
            if(result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_select)
        .then(function (result) {
            return Promise.resolve(result.rows)
        })

}

var getAll = function ( result) {
    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'select ' + fields.id+','+fields.name + ' from ' + fields.tableName;
            result.db.all(sql, function (err, rows) {
                if (err) return reject(err);
                result.rows = rows;
                resolve(result);
            })
        })
    }
    return Promise.resolve()
        .then(function () {
            if(result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_select)
        .then(function (result) {
            return Promise.resolve(result.rows)
        })

}

var modifyById = function (id, name, result) {
    var _modify = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'update ' + fields.tableName + ' set ' +
                fields.name + '=?' +
                ' where ' + fields.id + '=?';
            result.db.run(sql, [name, id], function (err) {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }
    return Promise.resolve()
        .then(function () {
            if(result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_modify)
        .then(function () {
            return Promise.resolve();
        })
}

var deleteById = function (id, result) {
    var _delete = function (result) {
        return new Promise(function(resolve, reject)
        {
            var sql = 'delete from ' + fields.tableName +
                ' where ' + fields.id + '=?';
            result.db.run(sql, [id], function (err) {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }
    return Promise.resolve()
        .then(function () {
            if(result) return Promise.resolve(result);
            return dbHolder.openDB();
        })
        .then(_delete)
        .then(function () {
            return Promise.resolve();
        })
}

exports.add = add;
exports.getById = getById;
exports.getAll=getAll;
exports.modifyById=modifyById;
exports.deleteById=deleteById;