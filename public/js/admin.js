var isBusy = false;
var isModifyPassword = false;
$(function () {
    $('#cancel').click(function () {
        if (isBusy || isBusy || isBusy) return;
        $('#enter').unbind('click');
        $('#dialog').css({display: "none"})
    });
    $(window).resize(function () {
        setLayout();
    });
    $('.select-comment').change(function () {
        briefLength = 0;
        $('.comment-container').html('');
        getCommentBrief($('.select-comment').val());
    });
    $('.btn-more').click(function () {
        getCommentBrief($('.select-comment').val());
    });
    $('.btn-logout').click(function () {
        $.post('/api/_logout', function (res) {
            var v = JSON.parse(res);
            if (v.state > 0) {
                location.href = '/admin';
            } else {
                alert(res);
            }
        })
    });
    setLayout();
    getCommentBrief(1);
});

function setLayout() {
    var height = $(window).height() - $('.topbar-container').height();
    $('.content').height(height);
}

function onClickModifyPassword() {
    $('#modify_password').show();
    $('#btn-modify-passowrd').hide();
    isModifyPassword = true;
}
function modifyInfo() {
    var enter = $('#enter');
    enter.unbind('click');
    var admin = JSON.parse($('#blog-info').text());
    var html = ' <div class="form-container">' +
        '<div>修改博客信息</div>' +
        '<div id="blog-info-tip"></div>' +
        '<div class="form-row">' +
        '<div class="form-label">博客名称</div><div class="form-input"><input type="text" id="blogname" value="' + admin.blog + '" autofocus></div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-label">姓&nbsp;&nbsp;名</div><div class="form-input"><input type="text" id="name" value="' + admin.name + '"></div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-label">邮&nbsp;&nbsp;箱</div><div class="form-input"><input type="text" id="email" value="' + admin.email + '"></div>' +
        '</div>' +
        '<br>' +
        '<div class="form-row">' +
        '<div class="form-label">管理账号</div><div class="form-input"><input type="text" id="user" value="' + admin.user + '"></div>' +
        '</div>' +
        '<div id="btn-modify-passowrd" onclick="onClickModifyPassword()">----修改密码-----</div>' +
        '<div class="form-row" id="modify_password" style="display: none">' +
        '<div class="form-label">管理密码</div><div class="form-input"><input type="password" id="password" ></div>' +
        '</div>' +
        '<br>'
    $('#content').html(html);
    enter.click(function () {
        finishModifyInof();
    })
    $('#dialog').css({display: "block"})
}

var modify_upload_policy = function (policy) {
    var enter = $('#enter');
    enter.unbind('click');
    var html = '<div style="text-align: left;font-size: 16px;">' +
            '<div id="upload_policy_tip" style="color: red;height: 20px;padding: 0px 15px;margin-bottom: 3px"></div>'+
        '<div><input type="radio" name="select-upload-policy" id="upload-policy1" value="1"><label for="upload-policy1">' +
        '上传到第三方（七牛）</label><span style="color: lawngreen;">推荐</span></div>' +
        '<div style="padding-left: 15px;font-weight: normal;font-size: 14px;display: none" id="upload-policy1-items">' +
        '<div class="upload-policy1-item"><div>域&nbsp;名</div><div><input id="upload-policy-domain" type="text" value="'+($('#domain').text()||'http://')+'"></div></div>' +
        '<div class="upload-policy1-item"><div>空间名(bucket)</div><div><input id="upload-policy-bucket" type="text"  value="'+($('#bucket').text()||'')+'"></div></div>' +
        '<div class="upload-policy1-item"><div>ACCESS_KEY</div><div><input id="upload-policy-access" type="text"></div></div>' +
        '<div class="upload-policy1-item"><div>SECRET_KEY</div><div><input id="upload-policy-secret" type="text"></div></div>' +
        '</div>' +
        '<br>' +
        '<div><input type="radio" name="select-upload-policy" id="upload-policy2" value="2"><label for="upload-policy2">' +
        '上传到本地服务器</label></div>' +
        '<br>' +
        '</div>';
    $('#content').html(html);
    $('input[name="select-upload-policy"]').change(function(){
        var p = $('input[name="select-upload-policy"]:checked').val();
        if(p==1) {
            $('#upload-policy1-items').show();
        }else{
            $('#upload-policy1-items').hide();
            $('#upload_policy_tip').text('');
        }
    });
    $('.upload-policy1-item input').focus(function(){
        $('#upload_policy_tip').text('');
    });
    $('input[name="select-upload-policy"][value="'+policy+'"]').attr('checked',true).change();
    var isSavingPolicy=false;
    enter.click(function () {
        if(isSavingPolicy) return;
        isSavingPolicy=true;
        var tip=$('#upload_policy_tip');
        var p = $('input[name="select-upload-policy"]:checked').val();
        var data={};
        data.policy=p;
       if(p==1){
           var domain=$('#upload-policy-domain').val().trim();
           var bucket=$('#upload-policy-bucket').val().trim();
           var access=$('#upload-policy-access').val().trim();
           var secret=$('#upload-policy-secret').val().trim();
           if(domain==''||domain.trim()=='http://'){
               isSavingPolicy=false;
               return tip.text('域名不能为空');
           }else if(bucket==''){
               isSavingPolicy=false;
               return tip.text('空间名不能为空');
           }else if(access==''){
               isSavingPolicy=false;
               return tip.text('ACCESS_KEY不能为空');
           }else if(secret==''){
               isSavingPolicy=false;
               return tip.text('SECRET_KEY不能为空');
           }else{
               data.domain=domain;
               data.bucket=bucket;
               data.access=access;
               data.secret=secret;
           }
       }
        $.post('/api/_save_upload_policy',data,function(res){
            var v=JSON.parse(res);
            if(v.state>0){
                 location.href='/admin';
            }else{
                if(v.state==-10){
                    tip.text('填写的信息有误，无法上传文件');
                }else{
                    alert(res);
                }
            }
            isSavingPolicy=false;
        })
    });
    $('#dialog').show();
};

var isModifyingInfo = false;
function finishModifyInof() {
    if (isModifyingInfo) return;
    var tip = $('#blog-info-tip');
    $('.form-input input').focus(function () {
        tip.text('');
    });
    var blog = $('#blogname').val().trim();
    var name = $('#name').val().trim();
    var email = $('#email').val().trim();

    var user = $('#user').val().trim();
    var password = $('#password').val();

    //alert(blog+' '+name+' '+email+' '+user+' '+password)
    if (blog == '') {
        tip.text('博客名称不能为空')
    } else if (name == '') {
        tip.text('姓名不能为空')
    } else if (email == '') {
        tip.text('邮箱不能为空')
    } else if (user == '') {
        tip.text('管理账号不能为空')
    } else if (isModifyPassword && (password == '' || password.length < 6)) {
        tip.text('管理密码不能为空且长度不能小于6位')
    } else if (!/[\d\w]{3,}@[\d\w]+\.[\d\w]+/.test(email)) {
        tip.text('邮箱格式不对')
    } else {
        $.post('/api/_save_info', {
            blog: blog,
            name: name,
            email: email,
            user: user,
            password: isModifyPassword ? hex_md5(password) : ''
        }, function (res) {
            var v = JSON.parse(res);
            if (v.state > 0) {
                location.href = '/admin';
            } else {
                alert(res)
            }
            isModifyingInfo = false;
        })
    }
}

/*function upload_db_to_qiniu() {
 if (isBusy) return;
 isBusy = true;
 $.get('/api/_upload_db_qn', {t: Math.random()}, function (res) {
 var v = JSON.parse(res);
 var console = $('#console');
 if (v.state > 0) {
 console.html(new Date() + ":上传成功:" + v.msg + "<br>" + console.html());
 } else {
 console.html(new Date() + ":上传失败:" + v.msg + "<br>" + console.html());
 }
 isBusy = false;
 })
 }
 function download_db_from_qiniu() {
 if (isBusy) return;
 isBusy = true;
 $.get('/api/_download_db_qn', {t: Math.random()}, function (res) {
 var v = JSON.parse(res);
 var console = $('#console');
 if (v.state > 0) {
 var html = new Date() + ":";
 for (var i = 0; i < v.urls.length; i++)
 html += '点击下载：<a style="color:blue" href="' + v.urls[i] + '">' + v.urls[i] + '</a><br>'
 console.html(html + console.html());
 } else {
 console.text("生成下载链接失败<br>" + console.html());
 }
 isBusy = false;
 })
 }*/

var rename = function (name) {
    if (isBusy) return;
    var tip = $('.tip');
    isBusy = true;
    var tag = $('.input-tag').val();
    var tip = $("#tip");
    $('.input-tag').click(function () {
        tip.html('<div id="tip" style="font-size: 16px">（原标签名：' + name + '）</div>')
        isBusy = false;
    })
    if (tag == "") {
        tip.html('<span style="color: red;font-size: 18px">标签名不能为空</span>')
        isBusy = false;
    } else if (tag.length > 15) {
        tip.html('<span style="color: red;font-size: 18px">标签名长度不能大于15</span>')
        isBusy = false;
    } else {
        $.post('/api/_rename_tag', {tagSrc: name, tagDst: tag}, function (res) {
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

var del = function (name) {
    if (isBusy) return;
    isBusy = true;
    $.post('/api/_delete_tag', {tagSrc: name}, function (res) {
        var v = JSON.parse(res);
        if (v.state > 0) {
            location.href = "/admin";
        } else {
            alert('fail')
        }
        isBusy = false;
    })
}

var add = function () {
    if (isBusy) return;
    isBusy = true;
    var tag = $('.input-tag').val().trim();
    var tip = $("#tip");
    $('.input-tag').click(function () {
        tip.html('<div id="tip">请输入标签名</div>')
        isBusy = false;
    })
    if (tag == "") {
        tip.html('<span style="color: red;font-size: 18px">标签名不能为空</span>')
        isBusy = false;
    } else if (tag.length > 15) {
        tip.html('<span style="color: red;font-size: 18px">标签名长度不能大于15</span>')
        isBusy = false;
    } else {
        $.post("/api/_add_tag", {tag: tag}, function (res) {
            var v = JSON.parse(res);
            if (v.state > 0) {
                location.href = "/admin"
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

function renameTag(tag, name) {
    var enter = $('#enter');
    enter.unbind('click');

    var html = '<div id="tip" style="font-size: 16px">（原标签名：' + name + '）</div>' +
        '<div id="tip-input">请输入新标签名</div>' +
        '<input type="text" class="input-tag">'
    $('#content').html(html);
    enter.click(function () {
        rename(name);
    })
    $('#dialog').css({display: "block"})
}


function deleteTag(tag, name) {
    var enter = $('#enter');
    enter.unbind('click');
    var html = '<div>确定删除标签：<br><span class="original-dtag"></span></div>' +
        '<div style="color: #aaa;font-size: 16px;font-weight: normal">' +
        '(标签下的文章将移至默认标签下)</div>'
    $('#content').html(html);
    enter.click(function () {
        del(name);
    })
    $('#dialog').css({display: "block"})
}

function addTag() {
    var enter = $('#enter');
    enter.unbind('click');
    var html = '<div id="tip">请输入标签名</div>' +
        '<input type="text" class="input-tag">';
    $('#content').html(html);
    enter.click(function () {
        add(name);
    })
    $('#dialog').css({display: "block"})
}
var briefLength = 0;
var isLoading = false;
//获取评论
function getCommentBrief(param) {
    if (isLoading) return;
    isLoading = true;
    var content = $('.comment-container');
    var url;
    if (param == 1) {//未回复
        url = '/api/_get_comment_brief_noreplay';
    } else if (param == 2) {//已回复
        url = '/api/_get_comment_brief_replayed';
    }
    $.get(url, {offset: briefLength, t: Math.random()}, function (res) {
        var v = JSON.parse(res);
        if (v.state > 0) {
            var html = ""
            for (var i = 0; i < v.rows.length; i++) {
                html += '<div class="comment-item" id="comment' + v.rows[i].f_id + '">' +
                    '<div class="brief" onclick="getComment(' + v.rows[i].f_id + ')">' + formatHTML(v.rows[i].f_content.substring(0, 100)) + '</div>' +
                    '</div>';
            }
            content.append(html);
            briefLength += v.rows.length;
            if (v.rows.length < 10) {
                $('.more-blogs-container').css({display: 'none'})
            } else {
                $('.more-blogs-container').css({display: 'block'})
            }
        } else {
            alert("get brief err");
        }
        isLoading = false;
    })
}
function getComment(id) {
    $('#dialog-comment-details').css({display: "block"});
    var comment = $('#comment-main-container');
    comment.html("");

    $.get('/api/_get_comment_by_id', {id: id, t: Math.random()}, function (res) {
        var v = JSON.parse(res);
        if (v.state > 0) {
            var c = v.rows[0];
            var replayHtml = '';
            if (c.f_reply) {
                replayHtml = '<div class="textarea-replay">' + c.f_reply + '</div>' +
                    '<input type="button" value="已回复" class="btn-replayed"><span class="replayed-time">' + formatTime(c.f_modify_time) + '</span>';
            } else {
                replayHtml = '<textarea class="textarea-replay"></textarea>' +
                    '<input type="button" value="回复" class="btn-replay" onclick="replay(' + c.f_id + ')">';
            }
            var html = '<div class="dialog-comment-details-container">' +
                '<div class="dialog-comment-details-time">' + formatTime(c.f_insert_time) + '&nbsp;&nbsp;' + c.f_contact + '</div>' +
                '<div class="btn-close-comment" onclick="closeComment()">x</div>' +
                '<a target="_blank" href="/blogs/' + c.f_blog_id + '"><div class="dialog-comment-details-title">' + v.title + '</div></a>' +
                '<div class="dialog-comment-details-content">' + formatHTML(c.f_content) + '</div>' +
                replayHtml +
                '<div class="dialog-comment-details-options">' +
                '<span onclick="delComment(' + c.f_id + ')">删除该评论</span>' +
                '</div>' +
                '</div>';
            comment.html(html)
        } else {
            alert('getcoments err');
            $('#dialog-comment-details').css({display: "none"});
        }
    })
}
function delComment(id) {

    var enter = $('#enter');
    enter.unbind('click');
    var html = '<div>确定删除评论吗?</div>'
    $('#content').html(html);
    enter.click(function () {
        $.post('/api/_del_comment', {id: id}, function (res) {
            var v = JSON.parse(res);
            if (v.state > 0) {
                //location.href = "/admin";
                $('#comment' + id).remove();
                $('#dialog').hide();
                $('#dialog-comment-details').hide();
            } else {
                alert("del err");
            }
        })
    })
    $('#dialog').css({display: "block"})
}
function replay(id) {
    var replay = $('.textarea-replay').val().trim();
    if (replay == "") return alert("回复不能为空");
    if (replay.length > 500) return alert("回复不能超过五百字");
    $.post('/api/_replay', {id: id, replay: replay}, function (res) {
        var v = JSON.parse(res);
        if (v.state > 0) {
            $('#comment' + id).remove();
            $('#dialog-comment-details').css({display: "none"})
        } else {
            alert('replay err');
        }
    })
}
function closeComment() {
    $('#dialog-comment-details').css({display: "none"})
}
