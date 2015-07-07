var blogs=require("../controller/blogs");
var comments=require("../controller/comments");
var dbHolder=require('../controller/DBHolder');
var Promise=require('bluebird');

/*var data={};
data[blogs.fields.title]="title";
data[blogs.fields.markdown]="ss";
data[blogs.fields.brief]="brief";

blogs.add(data)
    .then(function(){
        return blogs.deleteById(9);
    })
    .then(function(){
        return blogs.getById(1,4)
               .then(function(rows){
                 console.log(rows)
            })
    })
    .then(function () {
        return blogs.visitsIncrement(1);
    })
    .then(function(){
        var data={};
        data[blogs.fields.html]="123456";
        data[blogs.fields.tags]="blog";
        return blogs.modifyById(1,data);
    })
    .catch(function(err){
        console.log(err);
    });*/

var comment=dbHolder.comment;

/*var data={};
data[comment.blogId]=1;
data[comment.content]="good";
comments.add(data)
    .then(function(){
        comments.getCommentsByBlogID(1)
            .then(function(rows){
                console.log(rows)
            })
            .catch(function(err){
                console.log(err)
            })
    })
    .catch(function(err){
        console.log(err)
    })*/

//comments.drop();

comments.replay("enen",4)
    .then(function(){
      comments.getCommentsByBlogID(1)
        .then(function(rows){
            console.log(rows)
        })
        .catch(function(err){
            console.log(err)
        })
    })
    .catch(function(err){
        console.log(err)
    })


