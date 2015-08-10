var isHidden = true;
$(document).ready(function () {
    $('.box').click(function () {
        if (isHidden)
            $('.options-container').css({display: "block"})
        else
            $('.options-container').css({display: "none"})
        isHidden = !isHidden;
    })
    $('.btn-del').click(function () {
        $("#dialog").css({display: "block"})
    })
    $('#cancel').click(function () {
        $("#dialog").css({display: "none"})
    })
    $('#enter').click(function () {
        del();
    })
    $('.btn-send').click(function () {
        addComment()
    })
    $(".btn-more").click(function(){
        getComments();
    })
    $('.input-contact').focus(function(){
        if($('.input-contact').val()=="您的联系邮箱（选填）")
          $('.input-contact').val("").css({color:"black"})
    }).blur(function(){
        if($('.input-contact').val().trim()=="")
          $('.input-contact').val("您的联系邮箱（选填）").css({color:"#aaa"})
    })
    $('.input-comment').click(function(){
        $('.tip-comment').text('（请输入评论）').css({color:"grey"})
    })
    getComments()
})

var isSetTopping=false;
var setTop=function(top){
    if(isSetTopping) return;
    isSetTopping=true;
    var id = $("#blog").text();
    $.post("/api/_set_top",{id: id,top:top}, function (res) {
        var v = JSON.parse(res);
        if (v.state > 0) {
           if(top){
               $('#top').hide();
               $('#untop').show();
               $('.top-text').show();
           }else{
               $('#top').show();
               $('#untop').hide();
               $('.top-text').hide();
           }
        } else {
            alert(res)
        }
        isSetTopping=false;
    })
}

var del = function () {
    var id = $("#blog").text();
    $.get("/api/_delete", {id: id,t:Math.random()}, function (res) {
        var v = JSON.parse(res);
        if (v.state > 0) {
            location.href = "/blogs";
        } else {
            alert(res)
        }
    })
}

var commentsLength=0;
var getComments = function () {
    var id = $("#blog").text();
    $.get("/api/get_comments", {id: id,offset:commentsLength,t:Math.random()}, function (res) {
        var v = JSON.parse(res);
        if (v.state > 0) {
            var rows= v.rows;
            for(var i=0;i<rows.length;i++){
                var content = formatComment(formatTime(rows[i].f_insert_time),formatHTML(rows[i].f_content))

                var replay=rows[i].f_reply;
                if(replay==undefined){
                    replay="";
                }else{
                    replay=formatReplay(formatTime(rows[i].f_modify_time),formatHTML(replay));
                }
                $('.other-comment-container').append(content+replay);
            }
            commentsLength+= rows.length;
            if(rows.length<10){
                return $(".btn-more").css({display:"none"});
            }
        } else {
            alert(res)
        }
    })
}

var isSending=false;
var addComment = function () {
    if(isSending) return;
    isSending=true;
    var id = $("#blog").text();
    var comment = $('.input-comment').val();
    var contact = $('.input-contact').val().substr(0,50);
    if(comment.length>500){
        isSending=false;
        return $('.tip-comment').text('评论长度不能超过500个字').css({color:"red"})
    }else if(comment.trim()==""){
        isSending=false;
        return $('.tip-comment').text('评论不能为空').css({color:"red"})
    }
    if(contact.trim()=='您的联系邮箱（选填）') contact='';
    $.post("/api/add_comment", {id: id, comment: comment,contact:contact}, function (res) {
        var v = JSON.parse(res);
        if (v.state > 0) {
            var content = formatComment(v.time,formatHTML(comment))
            $('.other-comment-container').prepend(content);
            $('.input-comment').val("")
            $('#input-comment').html('<div style="text-align: center;color: gray">（已评论）</div>')
            isSending=false;
        } else {
            alert(res)
        }
    })
}

var formatComment=function(time,content){
    return '<div class="comment-item">' +
        '<div class="comment">' +
        '<div class="flag">&nbsp&nbsp</div>' +
        '<div class="infos-container">' +
        '<div class="details-container">' +
        '<span class="time">'+ time +'</span>' +
        '<span class="author"><b></b></span>' +
        '</div>' +
        '<div class="msg-container">' +
        '<span class="msg">'+content+'</span>' +
        '</div>' +
        '</div>' +
        '</div>';
}

var formatReplay=function(time,content){
    return '<div class="replay">' +
        '<div class="infos-container">' +
        '<div class="details-container">' +
        ' <span class="time">'+time+'</span>' +
        ' <span class="author"><b></b></span>' +
        '</div>' +
        '<div class="msg-container">' +
        '<span class="msg">'+content+'</span>' +
        ' </div>' +
        ' </div>' +
        ' <div class="flag-replay">&nbsp&nbsp</div>' +
        '</div>' +
        '<div class="clearFloat"></div>' +
        '</div>';
}

