var qiniu=require('qiniu');
var Promise = require('bluebird');
var bucket="myblog";
var domain='7xjxgh.com1.z0.glb.clouddn.com';
qiniu.conf.ACCESS_KEY='wOCAdRTCgP5FuyribXfXNFbUR5npBDCJeBoFsYil';
qiniu.conf.SECRET_KEY='e9TXzdyVHTY8rv3Foa081-nKzJjqDh8Seh-mu5To';
function getToken(bucketname) {
    bucketname=bucketname||bucket;
    var putPolicy = new qiniu.rs.PutPolicy(bucketname);
    //putPolicy.callbackUrl = callbackUrl;
    //putPolicy.callbackBody = callbackBody;
    //putPolicy.returnUrl = returnUrl;
    //putPolicy.returnBody = returnBody;
    //putPolicy.asyncOps = asyncOps;
    putPolicy.expires = 1100;//s
    return putPolicy.token();
}
function uploadFile(localFile, key, uptoken,cb) {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    //extra.mimeType = mimeType;
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;

    qiniu.io.putFile(uptoken, key, localFile, extra,cb);
}

function downloadUrl(key) {
    var baseUrl = qiniu.rs.makeBaseUrl(domain, key);
    var policy = new qiniu.rs.GetPolicy(120);//120s
    return policy.makeRequest(baseUrl);
}

/*var token=uptoken(bucket);
var path=APP_PATH+"/data/myblog.sqlite3";
uploadFile(path,"123321",token)*/

exports.getToken=getToken;
exports.uploadFile=uploadFile;
exports.downloadUrl=downloadUrl;
exports.bucket=bucket;