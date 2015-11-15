var formidable=require('formidable');
var path=require('path');

var parse=function(req,cb){
    var form = new formidable.IncomingForm();
    form.uploadDir = APP_PATH+"/public/res";//存放目录,默认为系统临时文件
    form.keepExtensions = true;//保留后缀名
    form.multiples = false;//一次上传一个文件
    form.prefix='bat_';//前缀

    var filename;//保存成功后的文件名
    form.on('file', function(name, file) {
        filename=path.basename(file.path);
    });
    form.on('end', function() {//上传成功，回调
        cb(null,filename);
    });
    form.on('error', function(err) {//失败
        cb(err)
    });

    form.parse(req);//开始解析上传的文件流
};


exports.parse=parse;