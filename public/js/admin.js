/*
 <div class="blog-item">
 <div class="blog-title">title</div>
 <div class="blog-brief">details<br>ss</div>
 <div class="blog-details"><span class="blog-tags">tags</span>|<span class="blog-time">2015-7-1</span></div>
 </div>
*/
var isBusy=false;
var isRenaming=false;
var isDeleting=false;
$(document).ready(function(){
    dialogInoput=$('#dialog-input-tag');
    dialogDelet=$('#dialog-del-tag');
    tip=$('.tip');
    curTag=$('.original-tag');
   $('.upload').click(function(){
       upload();
   })
    $('.download').click(function(){
        download();
    })
    $('#cancel-input').click(function(){
        if(isRenaming) return;
        dialogInoput.css({display:"none"})
    })
    $('#cancel-del').click(function(){
        if(isDeleting) return;
        dialogDelet.css({display:"none"})
    })

    $('#enter-input').click(function(){
        if(isRenaming) return;
        isRenaming=true;
        var tag=$('.input-tag').val();
        var originalTag=curTag[0].innerText;
        $.post('/api/rename_tag',{tagSrc:originalTag,tagDst:tag},function(res){
            var v=eval('('+res+')');
            if(v.state>0){
                location.href="";
            }else{
                alert("fail")
            }
            isRenaming=false;
            dialogInoput.css({display:"none"})
        })
    })
    $('#enter-del').click(function(){
        if(isDeleting) return;
        isDeleting=true;
        var originalTag=curTag[0].innerText;
        $.post('/api/delete_tag',{tagSrc:originalTag},function(res){
            var v=eval('('+res+')');
            if(v.state>0){
                location.href="";
            }else{
                alert('fail')
            }
            isDeleting=false;
            dialogDelet.css({display:"none"})
        })
    })

});

function upload(){
    if(isBusy) return;
    isBusy=true;
    $.get('/api/upload_database',{},function(res){
        var v=eval('('+res+')');
        if(v.state>0){
            tip.html(new Date()+":上传成功:"+ v.msg +"<br>"+tip.html());
        }else{
            tip.html(new Date()+":上传失败:"+ v.msg+"<br>"+tip.html());
        }
        isBusy=false;
    })
}

function download(){
    if(isBusy) return;
    isBusy=true;
    $.get('/api/download_database',{},function(res){
        var v=eval('('+res+')');
        if(v.state>0){
            var html=new Date()+":";
            for(var i=0;i< v.urls.length;i++)
                html+='点击下载：<a style="color:blue" href="'+ v.urls[i]+'">'+ v.urls[i]+'</a><br>'
            tip.html(html+tip.html());
        }else{
            tip.text("生成下载链接失败<br>"+tip.html());
        }
        isBusy=false;
    })
}

function renameTag(tag,name){
    curTag.text(name);
    dialogInoput.css({display:"block"})
}
function deleteTag(tag,name){
    curTag.text(name);
    dialogDelet.css({display:"block"})
}

function _trim(str) {
      return str.replace(/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
}