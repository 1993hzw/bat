var qiniu=require('qiniu');

var bucket="mybog"

qiniu.conf.ACCESS_KEY='wOCAdRTCgP5FuyribXfXNFbUR5npBDCJeBoFsYil';
qiniu.conf.SECRET_KEY='e9TXzdyVHTY8rv3Foa081-nKzJjqDh8Seh-mu5To';



function uptoken(bucketname) {
    var putPolicy = new qiniu.rs.PutPolicy(bucketname);
    //putPolicy.callbackUrl = callbackUrl;
    //putPolicy.callbackBody = callbackBody;
    //putPolicy.returnUrl = returnUrl;
    //putPolicy.returnBody = returnBody;
    //putPolicy.asyncOps = asyncOps;
    //putPolicy.expires = expires;

    return putPolicy.token();
}

function uploadFile(localFile, key, uptoken) {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    //extra.mimeType = mimeType;
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;

    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
        if(!err) {
            // 上传成功， 处理返回值
            console.log(ret);
            // ret.key & ret.hash
        } else {
            // 上传失败， 处理返回代码
            console.log(err);
            // http://developer.qiniu.com/docs/v6/api/reference/codes.html
        }
    });
}

var token=uptoken(bucket);
var path="E:\\云\\Libraries\\Images\\2015\\3.20-6.13\\2015-03-18 15-59-46.jpg";
uploadFile(path,"123321",token)

//console.log(uptoken(bucket))