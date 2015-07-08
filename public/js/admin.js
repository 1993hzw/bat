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
               tip.text("上传成功");
           }else{
               tip.text("上传失败:"+ v.error);
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
                tip.html("点击下载：<a style='color:blue' href='"+ v.url+"'>"+ v.url+"</a>");
            }else{
                tip.text("生成下载链接失败");
            }
            isBusy=false;
        })
    })

});

function _trim(str) {
      return str.replace(/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
}
