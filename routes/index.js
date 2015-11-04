var express = require('express');
var router = express.Router();
var comments = require('../models/comments');
var blogs = require('../models/blogs');
var Promise = require('bluebird');
var utils = require('../utils/utils');
var DC = require('../models/data-center');

router.use('/api', require('./api'));
router.use('/blogs', require("./blog"));
router.use('/bat', require("./admin"));
router.use('/test', require('./test'));

/* GET home page. */
router.get('/', function (req, res, next) {
    var dbHolder = require('../models/database');
    var resultDB;
    var data = {};
    dbHolder.openDB()
        .then(function (resDB) {
            resultDB = resDB;
        })
        .then(function () {
            //首页只能显示公开文章的相关信息，即status=0的文章

            var p1 = new Promise(function (resovle, reject) {
                comments.getLastComments({status:0},0, 5, resultDB)//最新评论,公开
                    .then(function (rows) {
                        data.comments=rows;
                        data.isLogined=req.session.hasLogined;
                    })
                    .then(function () {//获取评论的文章题目
                        var arr = [];
                        for (var i = 0; i < data.comments.length; i++) {
                            arr[i] = data.comments[i].f_blog_id;
                        }
                        return blogs.getTitleByArray(arr, resultDB)
                            .then(function (rows) {
                                var obj = {};
                                for (var i = 0; i < rows.length; i++) {
                                    obj[rows[i].f_id] = rows[i].f_title;
                                }
                                data.titles = obj;
                            })
                    }).then(function () {
                        resovle()
                    }).catch(function (err) {
                        reject(err);
                    });
            });

            var p2 = new Promise(function (resovle, reject) {
                //获取热门文章，公开
                blogs.getHots({status:0},0, 5, resultDB)
                    .then(function (rows) {
                        data.hotblogs = rows;
                        resovle();
                    }).catch(function (err) {
                        reject(err);
                    });
            });
            var p3 = new Promise(function (resovle, reject) {
                //获取最新文章，公开
                blogs.getLast({status:0},0, 5, resultDB)
                    .then(function (rows) {
                        data.rows = rows;
                        resovle();
                    }).catch(function (err) {
                        reject(err);
                    });
            });
            //并行执行
            return Promise.all([p1, p2, p3]).then(function () {
                data.tags = DC.tags;
                data.visits = DC.visits;
                data.formatTime = utils.formatTime;
                data.name = DC.admin.name;
                data.email = DC.admin.email;
                data.blog = DC.admin.blog;
                res.render('index', data);
            });
        })
        .catch(function (err) {
            console.log(err.stack);
            res.end("error");
        });
});

module.exports = router;