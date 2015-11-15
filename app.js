APP_PATH = __dirname;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');

var maps = require('./models/maps');
var DC = require('./models/data-center');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//logo
app.use(favicon(__dirname + '/public/favicon.ico'));

//输出访问信息
app.use(logger('dev'));

//静态文件
app.use('/public',express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json({extended: false, limit: '50kb'}));
//表单提交最大50kb
app.use(bodyParser.urlencoded({extended: false, limit: '50kb'}));
//cookie
//app.use(cookieParser());

//用内存当缓存，采用lru算法，最大存储500个session,session存活时间为3个小时
var SessionMemory = require('./models/SessionMemoryLRU');
//app.use(session({secret: 'bat', cookie: {maxAge: 1000}}));//ms
app.use(session({secret: 'bat', store: new SessionMemory({max: 500, maxAge: 1000 * 60 * 60 * 3})}));//ms,不设置maxAge，即关闭浏览器后cookie失效

//记录博客访问量
app.use((function () {
    var increment;//访问量增值
    return function (req, res, next) {//记录访问量
        if (!req.session.hasVisited) {
            req.session.readedBlogId = [];//记录阅读过的文章id，避免重复增加阅读量
            req.session.hasVisited = true;
            if (increment) {
                increment++;//访问量加1
            } else {//避免频繁写入，10s后再修改访问量
                increment = 1;
                setTimeout(function () {
                    DC.visits = DC.visits + increment;
                    maps.put('visits', DC.visits)
                        .catch(function (err) {
                            console.log(err);
                        });
                    increment = undefined;
                }, 10000);
            }
        }
        next();
    }
})());

//路由
app.use('/', require('./routes'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
