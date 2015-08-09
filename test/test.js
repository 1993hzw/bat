/*
var http = require('http');

http.createServer(function(req,res){
    console.log('hell')
    res.end('hello')
}).listen(12345);

*/

 var crypto = require('crypto'),
     token_key = "Uxr7z!cR.0Y&x\"";

//产生一个登陆的token结构体
var gen_unique_token = function(id) {
    var t = (new Date()).getTime();
    var buffer = new Buffer(20);
    var token_ciper = crypto.createCipher("aes256",token_key);
    buffer.fill(0);
    buffer.writeInt32LE( Math.floor( t & 0xffffffff ), 0 );
    buffer.writeInt32LE( Math.floor( t / (0xffffffff + 1) ), 4 );
    buffer.writeInt32LE( id&0xffffffff, 8);
    buffer.writeInt32LE( Math.floor( id/(0xffffffff+1) ), 12);
    var rand = Math.floor( Math.random() * (0xffffffff + 1) );
    buffer.writeUInt32LE( rand, 16 );

    var encrypted_token = token_ciper.update(buffer,"","base64");
    encrypted_token += token_ciper.final("base64");
    return {
        token: encrypted_token,
        token_info: {
            uid: id,
            timestamp: t,
            rand_code: rand
        }
    };
};
//解码token，并返回token的结构体
var decrypt_token_info = function(token) {
    var token_deciper = crypto.createDecipher("aes256",token_key);
    var decrypted = token_deciper.update(token,"base64","binary");
    decrypted += token_deciper.final("binary");
    buf = new Buffer(20);
    buf.write(decrypted,0,20,'binary');
    uid = buf.readInt32LE(8) + buf.readInt32LE(12)*(0xffffffff+1);
    t = buf.readInt32LE(0) + buf.readInt32LE(4) * (0xffffffff + 1);
    rand = buf.readUInt32LE(16);
    return {
        token: token,
        token_info: {uid: uid, timestamp: t, rand_code: rand}
    };
};
var token=gen_unique_token(1);
console.log(token);

console.log(decrypt_token_info(token.token))