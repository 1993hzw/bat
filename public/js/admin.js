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
});

function upload(){
    if(isBusy) return;
    isBusy=true;
    $.get('/api/upload_database',{},function(res){
        var v=eval('('+res+')');
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
    $.get('/api/download_database',{},function(res){
        var v=eval('('+res+')');
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
            var v = eval('(' + res + ')');
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
        var v=eval('('+res+')');
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
            var v = eval('(' + res + ')');
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

function _trim(str) {
      return str.replace(/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
}
