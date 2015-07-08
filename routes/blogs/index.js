var express = require('express');
var router = express.Router();
var dbHolder = require('../../controller/DBHolder');
var blogs = require('../../controller/blogs');
var utils = require('../../utils/utils');
var Promise = require('bluebird');
var configs=require('../../controller/configs');

var renderList = function (req, res, next, curTag) {
    Promise.resolve(configs.tags)
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
    if (utils.checkIsInArray(tag, configs.tags)) {
        return renderList(req, res, next, tag);
    } else {
        return renderList(req, res, next, "全部")
    }
});

router.get(/^\/[0-9]+$/, function (req, res, next) {
    //res.end("is "+JSON.stringify(req));
    var id = parseInt(req.path.substr(1));
    if (!id || id <= 0) return res.redirect('/blogs')
    blogs.getById(id)
        .then(function (rows) {
            var fields = dbHolder.blog;
            var blog = rows[0];
            var time = utils.resolveTimeJson(blog[fields.insert_time]);
            var data = {
                id: blog[fields.id],
                title: blog[fields.title],
                html: blog[fields.html],
                tag: blog[fields.tags],
                time: time,
                isLogined: req.session.hasLogined
            };
            data.tags = configs.tags;
            res.render('blogs/blog', data);
        })
        .then(function () {
            blogs.visitsIncrement(id)
                .catch(console.log)
        })
        .catch(function () {
            return res.redirect('/blogs')
        })
})

router.get('/publish', function (req, res, next) {
    if (!req.session.hasLogined) return res.redirect("/")
    res.render('blogs/publish', {id: -1, tags: configs.tags});
});
router.get('/edit', function (req, res, next) {
    if (!req.session.hasLogined) return res.redirect("/")
    var id = req.query.id;
    if (!id || id < 0) return;
    blogs.getById(id)
        .then(function (rows) {
            var fields = dbHolder.blog;
            var blog = rows[0];
            var time = utils.resolveTimeJson(blog[fields.insert_time]);
            var data = {
                id: blog[fields.id],
                title: blog[fields.title],
                markdown: blog[fields.markdown],
                tag: blog[fields.tags],
                time: time,
                isLogined: req.session.hasLogined
            };
            data.tags = configs.tags;
            res.render('blogs/publish', data);
        })
        .catch(function (err) {
            res.end(err)
        })
});


module.exports = router;
