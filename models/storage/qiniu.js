var qiniu=require('qiniu');
var Promise = require('bluebird');
//var db_bucket="myblog";

var resource_bucket="";
var domain='';//resources

function init(data,cb){
    resource_bucket=data.bucket;
    domain=data.domain;
    qiniu.conf.ACCESS_KEY=data.access;
    qiniu.conf.SECRET_KEY=data.secret;
    if(cb){//检测是否可以成功上传
        uploadFile(APP_PATH+'/public/img/logo.png','upload_test_logo.png',
            getToken(resource_bucket),function(err){
            return cb(err);
        })
    }
}


function getToken(bucketname) {
    bucketname=bucketname||resource_bucket;
    var putPolicy = new qiniu.rs.PutPolicy(bucketname);
    //putPolicy.callbackUrl = callbackUrl;
    //putPolicy.callbackBody = callbackBody;
    //putPolicy.returnUrl = returnUrl;
    //putPolicy.returnBody = returnBody;
    //putPolicy.asyncOps = asyncOps;
    putPolicy.expires = 1100;//s
    return putPolicy.token();
}

//上传文件
function uploadFile(localFile, key, uptoken,cb) {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    //extra.mimeType = mimeType;
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;

    qiniu.io.putFile(uptoken, key, localFile, extra,cb);
}

//生成下载地址
function downloadUrl(key) {
    var baseUrl = qiniu.rs.makeBaseUrl(domain, key);
    var policy = new qiniu.rs.GetPolicy(120);//120s
    return policy.makeRequest(baseUrl);
}

function getBucket(){
    return resource_bucket;
}
function getDomain(){
    return domain;
}

exports.getToken=getToken;
exports.uploadFile=uploadFile;
exports.downloadUrl=downloadUrl;
//exports.db_bucket=db_bucket;
exports.getBucket=getBucket;
exports.getDomain=getDomain;

exports.init=init;