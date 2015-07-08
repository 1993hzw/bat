/*
 <div class="blog-item">
 <div class="blog-title">title</div>
 <div class="blog-brief">details<br>ss</div>
 <div class="blog-details"><span class="blog-tags">tags</span>|<span class="blog-time">2015-7-1</span></div>
 </div>
*/
var isBusy=false;
$(document).ready(function(){
    var tip=$('.tip');
   $('.upload').click(function(){
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
   })
    $('.download').click(function(){
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
    })

});

function _trim(str) {
      return str.replace(/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
}
