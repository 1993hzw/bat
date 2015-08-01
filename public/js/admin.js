/*
 <div class="blog-item">
 <div class="blog-title">title</div>
 <div class="blog-brief">details<br>ss</div>
 <div class="blog-details"><span class="blog-tags">tags</span>|<span class="blog-time">2015-7-1</span></div>
 </div>
*/
var isBusy=false;
$(document).ready(function(){
   $('.upload').click(function(){
       upload();
   })
    $('.download').click(function(){
        download();
    })
    $('#cancel').click(function(){
        if(isBusy||isBusy||isBusy) return;
        $('#enter').unbind('click');
        $('#dialog').css({display:"none"})
    })
    $(window).resize(function(){
        setLayout();
    })
    $('.btn-more').click(function(){
        getCommentBrief();
    })
    setLayout();
    getCommentBrief();
});

function setLayout(){
    var height=$(window).height()-$('.topbar-container').height()-150;
    $('.content').height(height)
}

function upload(){
    if(isBusy) return;
    isBusy=true;
    $.get('/api/upload_database',{t:Math.random()},function(res){
        var v=JSON.parse(res);
        var console=$('#console');
        if(v.state>0){
            console.html(new Date()+":上传成功:"+ v.msg +"<br>"+console.html());
        }else{
            console.html(new Date()+":上传失败:"+ v.msg+"<br>"+console.html());
        }
        isBusy=false;
    })
}

function download(){
    if(isBusy) return;
    isBusy=true;
    $.get('/api/download_database',{t:Math.random()},function(res){
        var v=JSON.parse(res);
        var console=$('#console');
        if(v.state>0){
            var html=new Date()+":";
            for(var i=0;i< v.urls.length;i++)
                html+='点击下载：<a style="color:blue" href="'+ v.urls[i]+'">'+ v.urls[i]+'</a><br>'
            console.html(html+console.html());
        }else{
            console.text("生成下载链接失败<br>"+console.html());
        }
        isBusy=false;
    })
}

var rename=function(name){
    if(isBusy) return;
    var tip=$('.tip');
    isBusy=true;
    var tag=$('.input-tag').val();
    var tip=$("#tip");
    $('.input-tag').click(function(){
        tip.html('<div id="tip" style="font-size: 16px">（原标签名：'+name+'）</div>')
        isBusy=false;
    })
    if(tag==""){
        tip.html('<span style="color: red;font-size: 18px">标签名不能为空</span>')
        isBusy=false;
    }else if(tag.length>15){
        tip.html('<span style="color: red;font-size: 18px">标签名长度不能大于15</span>')
        isBusy=false;
    }else {
        $.post('/api/rename_tag', {tagSrc: name, tagDst: tag}, function (res) {
            var v = JSON.parse(res);
            if (v.state > 0) {
                location.href = "/admin";
            } else {
                if (v.state == -2) {
                    tip.html('<span style="color: red;font-size: 18px">已存在相同标签</span>')
                } else {
                    alert(res)
                }
            }
            isBusy = false;
        })
    }
}

var del=function(name){
    if(isBusy) return;
    isBusy=true;
    $.post('/api/delete_tag',{tagSrc:name},function(res){
        var v=JSON.parse(res);
        if(v.state>0){
            location.href="/admin";
        }else{
            alert('fail')
        }
        isBusy=false;
    })
}

var add=function(){
    if(isBusy) return;
    isBusy=true;
    var tag=_trim($('.input-tag').val());
    var tip=$("#tip");
    $('.input-tag').click(function(){
        tip.html('<div id="tip">请输入标签名</div>')
        isBusy=false;
    })
    if(tag==""){
        tip.html('<span style="color: red;font-size: 18px">标签名不能为空</span>')
        isBusy=false;
    }else if(tag.length>15){
        tip.html('<span style="color: red;font-size: 18px">标签名长度不能大于15</span>')
        isBusy=false;
    }else {
        $.post("/api/add_tag", {tag: tag}, function (res) {
            var v = JSON.parse(res);
            if (v.state > 0) {
                location.href="/admin"
            } else {
                if (v.state == -2) {
                    tip.html('<span style="color: red;font-size: 18px">已存在相同标签</span>')
                } else {
                    alert(res)
                }
            }
            isBusy = false;
        })
    }
}

function renameTag(tag,name){
    var enter=$('#enter');
    enter.unbind('click');

    var html='<div id="tip" style="font-size: 16px">（原标签名：'+name+'）</div>'+
        '<div id="tip-input">请输入新标签名</div>'+
        '<input type="text" class="input-tag">'
    $('#content').html(html);
    enter.click(function(){
        rename(name);
    })
    $('#dialog').css({display:"block"})
}


function deleteTag(tag,name){
    var enter=$('#enter');
    enter.unbind('click');
    var html='<div>确定删除标签：<br><span class="original-dtag"></span></div>'+
        '<div style="color: #aaa;font-size: 16px;font-weight: normal">' +
        '(标签下的文章将移至默认标签下)</div>'
    $('#content').html(html);
    enter.click(function(){
        del(name);
    })
    $('#dialog').css({display:"block"})
}

function addTag(){
    var enter=$('#enter');
    enter.unbind('click');
    var html='<div id="tip">请输入标签名</div>'+
        '<input type="text" class="input-tag">';
    $('#content').html(html);
    enter.click(function(){
        add(name);
    })
    $('#dialog').css({display:"block"})
}
var briefLength=0;
function getCommentBrief(){
    var content=$('.comment-container');
    $.get('/api/get_comment_brief_noreplay',{offset:briefLength,t:Math.random()},function(res){
        var v=JSON.parse(res);
        if(v.state>0){
            var html=""
            for(var i=0;i< v.rows.length;i++){
                html+='<div class="comment-item" id="comment'+v.rows[i].f_id+'">'+
                    '<div class="brief" onclick="getComment('+ v.rows[i].f_id+')">'+ v.rows[i].f_content.substring(0,100)+'</div>'+
                    '</div>';
            }
            console.log(html)
            content.append(html);
            briefLength+=v.rows.length;
            if(v.rows.length<10){
                $('.more-blogs-container').css({display:'none'})
            }else{
                $('.more-blogs-container').css({display:'block'})
            }
        }else{
            alert("get brief err");
        }
    })
}
function getComment(id){
    $('#comment-details').css({display:"block"});
    var comment=$('#comment-main-container');
    comment.html("");

    $.get('/api/get_comment_by_id',{id:id,t:Math.random()},function(res){
        var v=JSON.parse(res);
        if(v.state>0){
            var c= v.rows[0];
            var html='<div class="comment-details-container">'+
                '<div class="comment-details-time">'+getTime(c.f_insert_time)+'</div>'+
                    '<div class="btn-close-comment" onclick="closeComment()">x</div>'+
            '<a target="_blank" href="/blogs/'+ c.f_blog_id+'"><div class="comment-details-title">《'+ v.title+'》</div></a>'+
            '<div class="comment-details-content">'+ c.f_content+'</div>'+
                '<textarea class="textarea-replay"></textarea>'+
                '<input type="button" value="回复" class="btn-replay" onclick="replay('+ c.f_id+')">'+
                '<div class="comment-details-options">'+
                '<span onclick="delComment('+ c.f_id+')">删除该评论</span>'+
                '</div>'+
                '</div>';
            comment.html(html)
        }else{
            alert('getcoments err');
            $('#comment-details').css({display:"none"});
        }
    })
}
function delComment(id){

    var enter=$('#enter');
    enter.unbind('click');
    var html='<div>确定删除评论吗?</div>'
    $('#content').html(html);
    enter.click(function(){
        $.post('/api/del_comment',{id:id},function(res){
            var v=JSON.parse(res);
            if(v.state>0){
                location.href="";
            }else{
                alert("del err");
            }
        })
    })
    $('#dialog').css({display:"block"})
}
function replay(id){
    var replay=_trim($('.textarea-replay').val());
    if(replay=="") return alert("回复不能为空");
    if(replay.length>500) return alert("回复不能超过五百字");
    $.post('/api/replay',{id:id,replay:replay},function(res){
        var v=JSON.parse(res);
        if(v.state>0){
            $('#comment'+id).css({display:"none"})
            $('#comment-details').css({display:"none"})
        }else{
            alert('replay err');
        }
    })
}
function closeComment(){
    $('#comment-details').css({display:"none"})
}

var getTime=function(obj){
    var v=JSON.parse(obj);
    return v.year+"-"+v.month+"-"+v.date+" "+ v.hour+":"+ v.minute+":"+ v.second;
}
function _trim(str) {
      return str.replace(/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
}
