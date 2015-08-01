/*
 <div class="blog-item">
 <div class="blog-title">title</div>
 <div class="blog-brief">details<br>ss</div>
 <div class="blog-details"><span class="blog-tags">tags</span>|<span class="blog-time">2015-7-1</span></div>
 </div>
*/
$(document).ready(function(){
    var user=$(".user");
    user.focus(function(){
        if(_trim(user.val())=="管理员名称")
              user.val("").css({color:"black"})
        else
            user.css({color:"black"})
        $(".tip").html("")
    }).blur(function(){
        if(_trim(user.val())=="")
            user.val("管理员名称").css({color:"#aaa"})
    })
    $('.passwd').focus(function(){
        $(".tip").html("")
    })
    $('.btn-login').click(function(){
        verify()
    })
    user.focus()

});

function verify(){
   var user=$(".user").val();
    var passwd=$(".passwd").val();
    if(!user||_trim(user)==""||user=='管理员名称'){
       $(".tip").html("名称不能为空")
    }else if(passwd==""){
        $(".tip").html("密码不能为空")
    }else{
        $.post("/api/login",{user:user,passwd:passwd},function(res){
            var v=JSON.parse(res);
            if(v.state>0){
                   location.href='/admin'
            }else{
                $(".tip").html('名称或密码错误');
            }
        })
    }
}

function _trim(str) {
      return str.replace(/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
}
