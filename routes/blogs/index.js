var express = require('express');
var router = express.Router();
var dbHolder = require('../../controller/DBHolder');
var blogs = require('../../controller/blogs');
var utils = require('../../utils/utils');
var Promise = require('bluebird');
var maps = require('../../controller/maps');
var DC = require('../../controller/data-center');

var renderList = function (req, res, next, curTag) {
    Promise.resolve(DC.tags)
        .then(function (rows) {
            return Promise.resolve({tags: rows});
        })
        .then(function (data) {
            data.isLogined = req.session.hasLogined;
            data.curTag = curTag;
            res.render("blogs/list", data);
        })
        .catch(function (err) {
            throw  err;
        })
}


router.get('/', function (req, res, next) {
    var tag = req.query.tag;
    if (DC.tags.hasOwnProperty(tag)) {
        return renderList(req, res, next, tag);
    } else {
        return renderList(req, res, next, "全部")
    }
});

router.get(/^\/[0-9]+$/, function (req, res, next) {
    //res.end("is "+JSON.stringify(req));
    var id = parseInt(req.path.substr(1));
    if (!id || id <= 0) return res.redirect('/blogs');
    blogs.getById(id)
        .then(function (rows) {
            var fields = dbHolder.blog;
            var blog = rows[0];
            var time = utils.formatTime(blog[fields.insert_time]);
            var data = {
                id: blog[fields.id],
                title: blog[fields.title],
                brief: blog[fields.brief],
                html: blog[fields.html],
                tag: blog[fields.tags],
                top: blog[fields.top],
                visits: blog[fields.visits],
                time: time,
                isLogined: req.session.hasLogined
            };
            data.tags = DC.tags;

            var isAddVisits=(req.session.readedBlogId.indexOf(id) == -1);
            if(isAddVisits) req.session.readedBlogId.push(id);//记录阅读过的文章id，避免重复增加阅读量
            //req.session赋值必须在返回前台之前操作
            res.render('blogs/blog', data);
            return isAddVisits;
        })
        .then(function (isAddVisits) {
            if (isAddVisits) {//增加阅读量
                blogs.visitsIncrement(id)
                    .catch(console.log)
            }
        })
        .catch(function (err) {
            console.log(err)
            return res.redirect('/blogs')
        })
})

router.get('/publish', function (req, res, next) {
    if (!req.session.hasLogined) return res.redirect("/")
    res.render('blogs/publish', {id: -1, tags: DC.tags});
});
router.get('/edit', function (req, res, next) {
    if (!req.session.hasLogined) return res.redirect("/")
    var id = req.query.id;
    if (!id || id < 0) return;
    blogs.getById(id)
        .then(function (rows) {
            var fields = dbHolder.blog;
            var blog = rows[0];
            var time = utils.formatTime(blog[fields.insert_time]);
            var data = {
                id: blog[fields.id],
                title: blog[fields.title],
                markdown: blog[fields.markdown],
                tag: blog[fields.tags],
                time: time,
                mode: blog[fields.mode],
                isLogined: req.session.hasLogined
            };
            data.tags = DC.tags;
            res.render('blogs/publish', data);
        })
        .catch(function (err) {
            res.end(err)
        })
});


module.exports = router;
