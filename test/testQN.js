var qn=require('../controller/storage/qiniu')

qn.uploadFile(__dirname+"/config","123",qn.getToken(),function(err,ret){
    if(err) return console.log(err);
    console.log(ret)
})

/*var p = require('path');
p.exists(path, function(exists) {
    console.log('exists:', exists);
    // => true
});*/

//console.log(uptoken(db_bucket))