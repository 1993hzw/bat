var isResizing=false;
var downX;
var isRender=false;
var setLayout=function(){

       if(isPreview){
              var height=$(window).height();
              var width=$(window).width();
              var editHeight=height-$('.topbar-container').height();
              //var titleHeight=$(".title-container").height();
              $(".edit-container").height(editHeight).width(width);
              $(".textarea").height(editHeight).width(width/2-10);
              $(".preview-container").height(editHeight).width(width/2-10);
              $(".input-title-container").width(width-$(".tag-container").width())
       }else{
              var height=$(window).height();
              var width=$(window).width();
              var editHeight=height-$('.topbar-container').height();
              $(".edit-container").height(editHeight).width(width);
              $(".textarea").height(editHeight).width(width-50);
              $(".preview-container").height(editHeight).width(30);
              $(".input-title-container").width(width-$(".tag-container").width())
              $(".preview").html("")
       }
}
var resize= function (e) {
       if(!isPreview) return;
       if(isRender) return;
        isRender=true;
       var textarea=$(".textarea");
       var preview=$(".preview-container");
       var width;
       if(e.clientX<200) {
              width=200;
       }else if(($(window).width()-e.clientX-10)<200){
              width=$(window).width()-200;
       }else{
            width=e.clientX;
       }
       textarea.width(width);
       preview.width($(window).width()-width-20);

       setTimeout(function(){
              isRender=false;
       },80)
}

var a=false;
var lastTagVal=0;
var isRender=false,isInput=false;
var obj;
var isPreview=true;
$(document).ready(function(){
       var textarea=$(".textarea");
       var preview=$(".preview");

       var render=function(){
              if(!isInput) return;
              isRender=true;
              setTimeout(function(){
                     var html=markdown.toHTML(textarea.val(),"Maruku");
                     //alert(html)
                     preview.html(html);
                     render();
              },500)
       }

       textarea.bind('input propertychange', function() {
              if(!isPreview) return;
              clearTimeout(obj);
              isInput=true;
              if(!isRender)
               render();
              obj=setTimeout(function(){
                     isInput=false;
                     isRender=false;
              },1000)

       });
       setLayout();
       preview.html(markdown.toHTML(textarea.val()),"Maruku");

       textarea.scroll(function(){
              var textarea=$(".textarea");
              var preview=$(".preview");
              var percent=textarea.scrollTop()/textarea[0].scrollHeight;
              //alert(textarea.scrollTop()+textarea.height()+ ' '+textarea[0].scrollHeight)
              //padding 25
              if((textarea.scrollTop()+textarea.height()+25)>=textarea[0].scrollHeight){
                     preview.scrollTop(preview[0].scrollHeight);
              }else
                     preview.scrollTop(preview[0].scrollHeight*percent)
       })

       $(window).resize(function(){
              setLayout();
       });

       $(".resize-border").bind("mousedown", function (e) {
              if(!e) return;
              isResizing=true;
              downX= e.clientX;
       })
       $(".edit-container").bind("mousemove", function (e) {
              if(!e||!isResizing) return;
              resize(e);
       }).bind("mouseup", function (e) {
              isResizing=false;
       })

       $('.btn-publish').click(function(){
              publish();
       });
       $('.btn-finish').click(function(){
              finish();
       });
       $('.selector-tag').change(function(){
              var v=_trim($('.selector-tag').val()+"");
              if(v==-1){
                     $('#dialog').css({display:"block"})
              }else{
                    lastTagVal=v;
              }
       })
       $('#cancel').click(function(){
              $("#dialog").css({display:"none"})
              $('.selector-tag').val(lastTagVal);
              $('.input-tag').val("").click();

       })
       var isClickEnter=false;
       $('#enter').click(function(){
              if(isClickEnter) return;
              isClickEnter=true;
              var tag=_trim($('.input-tag').val());
              if(tag==""){
                     $("#tip").html('<span style="color: red;font-size: 18px">标签名不能为空</span>')
                     isClickEnter=false;
              }else if(tag.length>15){
                     $("#tip").html('<span style="color: red;font-size: 18px">标签名长度不能大于15</span>')
                     isClickEnter=false;
              }else{
                     $.post("/api/add_tag",{tag:tag},function(res){
                            var v=eval('('+res+')');
                            if(v.state>0){
                                   $('#dialog').css({display:"none"})
                                   $('.input-tag').val("").click();
                                   var html="";
                                   for(var i in v.tags){
                                     html+='<option selected value="'+i+'"> &nbsp;'+ v.tags[i] +'</option>'
                                   }
                                  //html+='<option selected value="'+i+'"> &nbsp;'+ v.tags[i] +'</option>'
                                   html+='<option style="color: gray;" value="-1">&nbsp;+新增 </option>'
                                   $('.selector-tag').html(html);

                            }else{
                                   if(v.state==-2){
                                       $("#tip").html('<span style="color: red;font-size: 18px">已存在相同标签</span>')
                                   }else{
                                       alert(res)
                                   }
                            }
                            isClickEnter=false;
                     })
              }

       })
       $('.input-tag').click(function () {
              $("#tip").html('请输入标签名')
       })
       $(".btn-preview").click(function(){
             isPreview=!isPreview;
              if(isPreview){
                     setLayout();
                     $('.resize-border').css({borderLeft:"2px dashed gray",borderRight:"2px dashed gray"})
                     $('.btn-preview').text(" > ")
                     var html=markdown.toHTML(textarea.val(),"Maruku");
                     preview.html(html);
              }else{
                    setLayout();
                     $('.resize-border').css({border:"none"})
                     $('.btn-preview').text(" < ")
              }
       })
       lastTagVal=$('.selector-tag').val()
})

var isPublishing=false;
var publish=function(){
       if(isPublishing) return;
       isPublishing=true;
       $('.btn-publish').val('发送中');
       var title=_trim($('.input-title').val());
       var markdown=_trim($('.textarea').val());
       var tag=_trim($('.selector-tag').val());
       if(markdown==null||markdown=="")
          return alert("内容不能为空");
       $.post('/api/publish',{title:title,markdown:markdown,tag:tag},function(res){
              var v=eval('('+res+')');
              if(v.state>0){
                     if(v.id){
                            location.href="/blogs/"+ v.id;
                     }else{
                            location.href="/";
                     }
              }else{
                     alert(v)
              }
       })
}

var isSaving=false;
var finish=function(){
    if(isSaving) return;
       isSaving=true;

       $('.btn-finish').val('保存中');
       var title=_trim($('.input-title').val());
       var markdown=_trim($('.textarea').val());
       var tag=_trim($('.selector-tag').val());
       if(markdown==null||markdown=="")
              return alert("内容不能为空");
       $.post('/api/save',{id:$("#blog").text(),title:title,markdown:markdown,tag:tag},function(res){
              var v=eval('('+res+')');
              if(v.state>0){
                     if(v.id){
                            location.href="/blogs/"+ v.id;
                     }else{
                            location.href="/";
                     }
              }else{
                     alert(v)
              }
       })

}

function formatHTML(html){
       return html.replace( /&/g, "&amp;" )
                  .replace( /</g, "&lt;" )
                  .replace( />/g, "&gt;" )
                  .replace( /"/g, "&quot;" )
                  .replace( /'/g, "&#39;" );
}

function _trim(str) {
       return str.replace(/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
}
