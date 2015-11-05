var dbHolder = require('../models/database');
var blogs = require('../models/blogs');
var comments = require('../models/comments');
var markdown = require('../utils/markdown');
var htmlToText = require('html-to-text');
var utils = require('../utils/utils');
var Promise = require('bluebird');
var DC = require('../models/data-center');
var tags = require('../models/tags');
var qn = require('../models/storage/qiniu');
//var marked = require('marked');
var marked = require('../utils/marked');//使用修改后的marked

//post 发布文章
exports._publishBlog = function (req, res, next) {
    if (!req.session.hasLogined) return res.redirect("/");
    if (!req.body.markdown) return res.json({state: -1});
    var fields = dbHolder.blog;
    var data = {};
    var brief;
    var title = (req.body.title == null || req.body.title == "") ? "(未命名)" : req.body.title;
    data[fields.title] = title;
    data[fields.markdown] = req.body.markdown;
    data[fields.mode] = req.body.mode == 1 ? 1 : 2;//默认2为文本模式
    data[fields.status] = req.body.status == 1 ? 1 : 0;//默认0为公开

    if (data[fields.mode] == 1) {//markdown
        data[fields.html] = marked(req.body.markdown);
        brief = htmlToText.fromString(data[fields.html], {wordwrap: 130}).substr(0, 150);
    } else {//文本模式,对内容进行html标签转义
        var html = utils.formatHTML(req.body.markdown);
        data[fields.html] = '<pre style="background: white;border: none;padding-top: 0px;">' + html + '</pre>';
        brief = html.substr(0, 150);
    }

    data[fields.brief] = brief;
    var tag = (req.body.tag == null || req.body.tag == "") ? "默认" : req.body.tag;
    data[fields.tags] = tag;

    var rows,result;
    dbHolder.openDB()
        .then(dbHolder.beginTransaction)//开启一个事务
        .then(function(resultDB){
            result=resultDB;
        }).then(function(){
            return blogs.add(data,result);
        }).then(function () {
            return blogs.getLast({},0,1,result)
                .then(function (r) {//返回文章id
                    rows=r;
                })
        }).then(function () {//提交事务
            return dbHolder.commitTransaction(result);
        }).then(function () {
            return res.json({state: 1, id: rows[0][fields.id]})
        }).catch(function (err) {
            console.log(err.stack);
            res.json({state: -1})
        });
};


//post 保存文章
exports._save = function (req, res, next) {
    if (!req.session.hasLogined) return res.redirect("/");
    var fields = dbHolder.blog;
    var id = req.body.id;
    if (!id || id <= 0 || !req.body.markdown) return res.json({state: -1});
    var data = {};
    var brief;
    var title = (req.body.title == null || req.body.title == "") ? "(未命名)" : req.body.title;
    data[fields.title] = title;
    data[fields.markdown] = req.body.markdown;
    data[fields.html] = marked(req.body.markdown);
    data[fields.mode] = req.body.mode == 1 ? 1 : 2;//默认2为文本模式
    data[fields.status] = req.body.status == 1 ? 1 : 0;//默认0为公开

    if (data[fields.mode] == 1) {//markdown
        data[fields.html] = marked(req.body.markdown);
        brief = htmlToText.fromString(data[fields.html], {wordwrap: 130}).substr(0, 150);
    } else {//文本模式
        var html = utils.formatHTML(req.body.markdown);
        data[fields.html] = '<pre style="background: white;border: none;padding-top: 0px;">' + html + '</pre>';
        brief = html.substr(0, 150);
    }

    data[fields.brief] = brief;
    var tag = (req.body.tag == null || req.body.tag == "") ? "默认" : req.body.tag;
    data[fields.tags] = tag;

    blogs.modifyById(id, data)
        .then(function () {
            return res.json({state: 1, id: id})
        })
        .catch(function (err) {
            console.log(err.stack);
            res.json({state: -1})
        });
};

//get 删除文章
exports._delete = function (req, res, next) {
    var id = req.query.id;
    if (!id || id < 1) return res.json({state: -1});
    var result;
    dbHolder.openDB()
        .then(dbHolder.beginTransaction)//开启一个事务
        .then(function (res) {//相处文章
            result = res;
            return blogs.deleteById(id, res);
        })
        .then(function () {//删除相关评论
            return comments.deleteByBlogId(id, result);
        })
        .then(function () {
            return dbHolder.commitTransaction(result);
        })
        .then(function () {
            return res.json({state: 1});
        })
        .catch(function (err) {
            console.log(err);
            return res.json({state: -1});
        })
};

//get 获取最新文章，公开status=0
exports.getLast = function (req, res, next) {
    var off = req.query.offset;
    if (!off || off < 0) off = 0;
    blogs.getLast({status: 0}, off, 5)
        .then(function (rows) {
            res.json({rows: rows, tags: DC.tags});
        })
        .catch(function (err) {
            res.end(err);
        });
};

//get 根据标签获取文章
exports.getBlogByTag = function (req, res, next) {
    var tag = req.query.tag;
    var off = req.query.offset;
    if (!DC.tags.hasOwnProperty(tag)) {
        tag = undefined;//如果tag为空则返回最新文章
    }

    var condition = {tag: tag};
    if (!req.session.hasLogined) {//未登录只能查看公开的文章
        condition.status = 0;
    }
    blogs.getByTag(condition, off, 5)
        .then(function (rows) {
            res.json({rows: rows, tags: DC.tags})
        })
        .catch(function (err) {
            console.log(err);
            res.json({state: -1});
        });
};

//设置置顶
exports._setTop = function (req, res, next) {
    var id = req.body.id;
    var top = parseInt(req.body.top);
    if (!id || isNaN(top) || top < 0) return res.json({state: -1});
    blogs.setTop(id, top)
        .then(function () {
            res.json({state: 1});
        })
        .catch(function (err) {
            console.log(err);
            res.json({state: -1});
        })
};


//__________view_________________

var renderList = function (req, res, next, curTag) {
    Promise.resolve(DC.tags)
        .then(function (rows) {
            return Promise.resolve({tags: rows});
        })
        .then(function (data) {
            data.isLogined = req.session.hasLogined;
            data.curTag = curTag;
            res.render("blog/list", data);
        })
        .catch(function (err) {
            throw  err;
        })
};

exports.gotoBlogList = function (req, res, next) {
    var tag = req.query.tag;
    if (DC.tags.hasOwnProperty(tag)) {
        return renderList(req, res, next, tag);
    } else {
        return renderList(req, res, next, "全部")
    }
};

exports.gotoBlog = function (req, res, next) {
    //res.end("is "+JSON.stringify(req));
    var id = parseInt(req.path.substr(1));
    if (!id || id <= 0) return res.redirect('/blogs');
    blogs.getById(id)
        .then(function (rows) {
            var fields = dbHolder.blog;
            var blog = rows[0];

            //私密文章，未登录用户不可查看
            if (blog[fields.status] == 1 && !req.session.hasLogined) {
                return res.redirect('/blogs');
            }

            var time = utils.formatTime(blog[fields.insert_time]);
            var data = {
                id: blog[fields.id],
                title: blog[fields.title],
                brief: blog[fields.brief],
                html: blog[fields.html],
                tag: blog[fields.tags],
                top: blog[fields.top],
                visits: blog[fields.visits],
                status: blog[fields.status],
                time: time,
                isLogined: req.session.hasLogined
            };
            data.tags = DC.tags;

            var isAddVisits = (req.session.readedBlogId.indexOf(id) == -1);
            if (isAddVisits) req.session.readedBlogId.push(id);//记录阅读过的文章id，避免重复增加阅读量
            //req.session赋值必须在返回前台之前操作
            res.render('blog/blog', data);
            return isAddVisits;
        })
        .then(function (isAddVisits) {
            if (isAddVisits) {//增加阅读量
                blogs.visitsIncrement(id)
                    .catch(console.log)
            }
        })
        .catch(function (err) {
            console.log(err);
            return res.redirect('/blogs')
        })
};

exports.gotoPublish = function (req, res, next) {
    if (!req.session.hasLogined) return res.redirect("/");
    res.render('blog/publish', {
        id: -1, tags: DC.tags, qiniu_domain: DC.upload_policy == 1 ? qn.getDomain() : '', status: 0
    });
};

exports.gotoEdit = function (req, res, next) {
    if (!req.session.hasLogined) return res.redirect("/");
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
                isLogined: req.session.hasLogined,
                status: blog[fields.status]
            };
            data.tags = DC.tags;
            data.qiniu_domain = DC.upload_policy == 1 ? qn.getDomain() : '';
            res.render('blog/publish', data);
        })
        .catch(function (err) {
            res.end(err)
        })
};