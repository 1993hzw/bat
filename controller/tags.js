var dbHolder = require('./DBHolder');
var Promise = require('bluebird');
var utils = require('../utils/utils');
var fields = dbHolder.tag;

var add = function (data) {
    var _insert = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'insert into ' + fields.tableName + ' (' +
                fields.insert_time + ',' +
                fields.name + ') values (?,?)';
            var arr = [utils.getTime(), data[fields.name]];
            result.db.run(sql, arr, function (err) {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }
    return dbHolder.openDB()
        .then(_insert)
        .then(function () {
            return Promise.resolve();
        })
}

var getTags = function () {

    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'select ' + fields.name + ','+fields.id+' from ' + fields.tableName;
            result.db.all(sql, function (err, rows) {
                if (err) return reject(err);
                result.rows = rows;
                resolve(result);
            })
        })
    }

    return dbHolder.openDB()
        .then(_select)
        .then(function (result) {
            return Promise.resolve(result.rows);
        })
}

var getTagByName = function (name) {

    var _select = function (result) {
        return new Promise(function (resolve, reject) {
            var sql = 'select ' + fields.name + ','+fields.id+' from ' + fields.tableName+
                ' where '+fields.name+'=\''+name+'\'';
            result.db.all(sql, function (err, rows) {
                if (err) return reject(err);
                result.rows = rows;
                resolve(result);
            })
        })
    }

    return dbHolder.openDB()
        .then(_select)
        .then(function (result) {
            return Promise.resolve(result.rows);
        })
}

/*
exports.add = add;
exports.getTags = getTags;
exports.getTagByName=getTagByName;*/
