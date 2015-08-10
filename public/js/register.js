if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
    }
}

$(function () {
    var tip = $('#tip');
    $('.form-input input').focus(function () {
        tip.text('');
    })
})

var finish = function () {
    var tip = $('#tip');

    var blog = $('#blogname').val().trim();
    var name = $('#name').val().trim();
    var email = $('#email').val().trim();

    var user = $('#user').val().trim();
    var password = $('#password').val().trim();

    //alert(blog+' '+name+' '+email+' '+user+' '+password)
    if (blog == '') {
        tip.text('博客名称不能为空')
    } else if (name == '') {
        tip.text('姓名不能为空')
    } else if (email == '') {
        tip.text('邮箱不能为空')
    } else if (user == '') {
        tip.text('管理账号不能为空')
    } else if (password == '' || password.length < 6) {
        tip.text('管理密码不能为空且长度不能小于6位')
    } else if (!/[\d\w]{3,}@[\d\w]+\.[\d\w]+/.test(email)) {
        tip.text('邮箱格式不对')
    } else {
        $.post('/api/register', {
            blog: blog,
            name: name,
            email: email,
            user: user,
            password: hex_md5(password)
        }, function (res) {
            var v = JSON.parse(res);
            if (v.state > 0) {
                location.href = '/';
            } else {
                alert(res)
            }
        })
    }

}