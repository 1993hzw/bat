APP_PATH = __dirname;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');

var maps = require('./models/maps');
var DC = require('./models/data-center');

var app = express();

app.use(favicon(__dirname + '/public/favicon.ico'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());


app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret: 'bat', cookie: {maxAge: 7200000}}))//ms

app.use(function (req, res, next) {//记录访问量
    if (!req.session.hasVisited) {
        req.session.readedBlogId = [];//记录阅读过的文章id，避免重复增加阅读量
        DC.visits++;//访问量加1
        req.session.hasVisited = true;
        //避免频繁写入，每增加10次访问量才写入数据库
        if(DC.visits%10==0) {
            maps.put('visits', DC.visits)
                .catch(function (err) {
                    console.log(err);
                });
        }
    }
    next();
});

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
