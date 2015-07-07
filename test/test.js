/*var blogs=require('../controller/blogs');
var comments=require('../controller/comments');
var Promise=require('bluebird');*/

/*
comments.getLastComments(0,5)
    .then(function(rows){
        return Promise.resolve({comments:rows})
    })
    .then(function(result){
        var arr=[];
        for(var i=0;i<result.comments.length;i++){
            arr[i]=result.comments[i].f_blog_id;
        }
        blogs.getTitleByArray(arr)
            .then(function(rows){
                var obj={}
               for(var i=0;i<rows.length;i++){
                   obj[rows[i].f_id]=rows[i].f_title;
               }
                console.log(obj)
            })
    })*/

/*
comments.drop()
    .then(function(){
        console.log("success")
    })
    .catch(function(err){
        console.log(err)
    })*/

/*var fs = Promise.promisifyAll(require("fs"));
fs.readFileAsync("config","utf-8")
    .then(function(data){
        console.log(data)
    })
    .catch(function(err){
        console.log(err)
    })*/
/*
function JQ(){
    this.getElement=function(name){
        this.name=name;
        return this
    }
}
var jq=new JQ();
var $=function(name){
    return jq.getElement.apply(jq,[name])
}

var t=$('123');*/

var s='#123';
console.log((/^#\S+$/).test(s))