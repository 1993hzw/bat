var isResizing = false;
var downX;
var isRender = false;
var setLayout = function () {
    if (isPreview) {
        var height = $(window).height();
        var width = $(window).width();
        var editHeight = height - $('.topbar-container').height();
        //var titleHeight=$(".title-container").height();

        $(".edit-container").height(editHeight).width(width);
        if (isPc) {
            $(".inupt-container").height(editHeight).width(width / 2 - 10);
            $(".preview-container").height(editHeight).width(width / 2 - 10);
        } else {
            $(".inupt-container").height(editHeight).width(0);
            $(".preview-container").height(editHeight).width(width - 20);
        }
        $(".input-title-container").width(width - $(".tag-container").width())
    } else {
        var height = $(window).height();
        var width = $(window).width();
        var editHeight = height - $('.topbar-container').height();
        $(".edit-container").height(editHeight).width(width);
        $(".inupt-container").height(editHeight).width(width - 50);
        $(".preview-container").height(editHeight).width(30);
        $(".input-title-container").width(width - $(".tag-container").width())
        $(".preview").html("")
    }
}
var resize = function (e) {
    if (!isPc) return;
    if (!isPreview) return;
    if (isRender) return;
    isRender = true;
    var textarea = $(".inupt-container");
    var preview = $(".preview-container");
    var width;
    var span = 20;
    if (e.clientX < span) {
        width = span;
        isResizing = false;
    } else if (($(window).width() - e.clientX - 10) < span) {
        width = $(window).width() - span;
        if (e.clientX + 5 >= $(window).width())
            isResizing = false;
    } else {
        width = e.clientX;
    }
    textarea.width(width);
    preview.width($(window).width() - width - 20);

    setTimeout(function () {
        isRender = false;
    }, 80)
}

var a = false;
var lastTagVal = 0;
var isRender = false, isInput = false;
var obj;
var isPreview = true;
var isPc = true;
$(document).ready(function () {
    isPc = checkIsPC();
    var textarea = $(".textarea");
    var preview = $(".preview");

    var render = function () {
        if (!isInput) return;
        isRender = true;
        setTimeout(function () {
            var html = markdown.toHTML(textarea.val(), "Maruku");
            //alert(html)
            preview.html(html);
            render();
        }, 500)
    }

    //监听textarea的输入事件
    textarea.bind('input propertychange', function () {
        if (!isPreview) return;
        clearTimeout(obj);
        isInput = true;
        if (!isRender)
            render();
        obj = setTimeout(function () {
            isInput = false;
            isRender = false;
        }, 1000)

    });
    setLayout();
    preview.html(markdown.toHTML(textarea.val()), "Maruku");

    textarea.scroll(function () {
        var textarea = $(".textarea");
        var preview = $(".preview");
        var percent = textarea.scrollTop() / textarea[0].scrollHeight;
        //alert(textarea.scrollTop()+textarea.height()+ ' '+textarea[0].scrollHeight)
        //padding 25
        if ((textarea.scrollTop() + textarea.height() + 25) >= textarea[0].scrollHeight) {
            preview.scrollTop(preview[0].scrollHeight);
        } else
            preview.scrollTop(preview[0].scrollHeight * percent)
    })
    if (isPc)
        $(window).resize(function () {
            setLayout();
        });

    $(".resize-border").bind("mousedown", function (e) {
        if (!e) return;
        isResizing = true;
        downX = e.clientX;
    })
    $(".edit-container").bind("mousemove", function (e) {
        if (!e || !isResizing) return;
        resize(e);
    }).bind("mouseup", function (e) {
        isResizing = false;
    })

    $('.btn-publish').click(function () {
        publish();
    });
    $('.btn-finish').click(function () {
        finish();
    });
    $('.selector-tag').change(function () {
        var v = _trim($('.selector-tag').val() + "");
        if (v == -1) {
            $('#dialog').css({display: "block"})
        } else {
            lastTagVal = v;
        }
    })
    $('#cancel').click(function () {
        $("#dialog").css({display: "none"})
        $('.selector-tag').val(lastTagVal);
        $('.input-tag').val("").click();

    })
    var isClickEnter = false;
    $('#enter').click(function () {
        if (isClickEnter) return;
        isClickEnter = true;
        var tag = _trim($('.input-tag').val());
        if (tag == "") {
            $("#tip").html('<span style="color: red;font-size: 18px">标签名不能为空</span>')
            isClickEnter = false;
        } else if (tag.length > 15) {
            $("#tip").html('<span style="color: red;font-size: 18px">标签名长度不能大于15</span>')
            isClickEnter = false;
        } else {
            $.post("/api/_add_tag", {tag: tag}, function (res) {
                var v = JSON.parse(res);
                if (v.state > 0) {
                    $('#dialog').css({display: "none"})
                    $('.input-tag').val("").click();
                    var html = "";
                    for (var i in v.tags) {
                        html += '<option selected value="' + i + '"> &nbsp;' + v.tags[i] + '</option>'
                    }
                    //html+='<option selected value="'+i+'"> &nbsp;'+ v.tags[i] +'</option>'
                    html += '<option style="color: gray;" value="-1">&nbsp;+新增 </option>'
                    $('.selector-tag').html(html);

                } else {
                    if (v.state == -2) {
                        $("#tip").html('<span style="color: red;font-size: 18px">已存在相同标签</span>')
                    } else {
                        alert(res)
                    }
                }
                isClickEnter = false;
            })
        }

    })
    $('.input-tag').click(function () {
        $("#tip").html('请输入标签名')
    })
    $(".btn-preview").click(function () {
        isPreview = !isPreview;
        if (isPreview) {
            setLayout();
            $('.resize-border').css({borderLeft: "2px dashed gray", borderRight: "2px dashed gray"})
            $('.btn-preview').text(" > ")
            var html = markdown.toHTML(textarea.val(), "Maruku");
            preview.html(html);
        } else {
            setLayout();
            $('.resize-border').css({border: "none"})
            $('.btn-preview').text(" < ")
        }
    })
    lastTagVal = $('.selector-tag').val()
    if (!isPc) $(".btn-preview").click()
})

var isPublishing = false;
var publish = function () {
    if (isPublishing) return;
    isPublishing = true;
    $('.btn-publish').val('发送中');
    var title = _trim($('.input-title').val());
    var markdown = _trim($('.textarea').val());
    var tag = _trim($('.selector-tag').val());
    if (markdown == null || markdown == "")
        return alert("内容不能为空");
    $.post('/api/_publish', {title: title, markdown: markdown, tag: tag}, function (res) {
        var v = JSON.parse(res);
        if (v.state > 0) {
            if (v.id) {
                location.href = "/blogs/" + v.id;
            } else {
                location.href = "/";
            }
        } else {
            alert(v)
        }
    })
}

var isSaving = false;
var finish = function () {
    if (isSaving) return;
    isSaving = true;

    $('.btn-finish').val('保存中');
    var title = _trim($('.input-title').val());
    var markdown = _trim($('.textarea').val());
    var tag = _trim($('.selector-tag').val());
    if (markdown == null || markdown == "")
        return alert("内容不能为空");
    $.post('/api/_save', {id: $("#blog").text(), title: title, markdown: markdown, tag: tag}, function (res) {
        var v = JSON.parse(res);
        if (v.state > 0) {
            if (v.id) {
                location.href = "/blogs/" + v.id;
            } else {
                location.href = "/";
            }
        } else {
            alert(v)
        }
    })

}

var formatHTML = function () {
    var character = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;'
    }
    return function (html) {
        html.replace(/[&<>"']/g, function (c) {
            return character[c];
        })
    }
}();

/*function formatHTML(html){

 return html.replace( /&/g, "&amp;" )
 .replace( /</g, "&lt;" )
 .replace( />/g, "&gt;" )
 .replace( /"/g, "&quot;" )
 .replace( /'/g, "&#39;" );
 }*/

function _trim(str) {
    return str.replace(/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
}
function checkIsPC() {
    if (/AppleWebKit.*Mobile/i.test(navigator.userAgent) ||
        (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))) {
        return false;
    } else {
        return true;
    }
}


$(function() {
    var uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4',
        browse_button: 'pickfiles',
        container: 'container',
        drop_element: 'container',
        max_file_size: '100mb',
        flash_swf_url: 'js/plupload/Moxie.swf',
        dragdrop: true,
        chunk_size: '4mb',
        uptoken_url: '/test/token',
        domain: '7xkd2p.com1.z0.glb.clouddn.com',
        // downtoken_url: '/downtoken',
        unique_names: true,
        // save_key: true,
        // x_vars: {
        //     'id': '1234',
        //     'time': function(up, file) {
        //         var time = (new Date()).getTime();
        //         // do something with 'time'
        //         return time;
        //     },
        // },
        auto_start: false,
        init: {
            'FilesAdded': function(up, files) {
                /*  $('table').show();
                 $('#success').hide();
                 plupload.each(files, function(file) {
                 var progress = new FileProgress(file, 'fsUploadProgress');
                 progress.setStatus("等待...");
                 });*/
                console.log("add")
            },
            'BeforeUpload': function(up, file) {
                /* var progress = new FileProgress(file, 'fsUploadProgress');
                 var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
                 if (up.runtime === 'html5' && chunk_size) {
                 progress.setChunkProgess(chunk_size);
                 }*/
                console.log("before")
            },
            'UploadProgress': function(up, file) {
                /*  var progress = new FileProgress(file, 'fsUploadProgress');
                 var chunk_size = plupload.parseSize(this.getOption('chunk_size'));

                 progress.setProgress(file.percent + "%", file.speed, chunk_size);*/
                console.log(file.percent+"%")
            },
            'UploadComplete': function() {
                //$('#success').show();
                console.log('complete')
                //console.log("sss")
            },
            'FileUploaded': function(up, file, info) {
                /* var progress = new FileProgress(file, 'fsUploadProgress');
                 progress.setComplete(up, info);*/
                //console.log(info)
                console.log('inf')
            },
            'Error': function(up, err, errTip) {
                /*$('table').show();
                 var progress = new FileProgress(err.file, 'fsUploadProgress');
                 progress.setError();
                 progress.setStatus(errTip);*/
                console.log(errTip)
            }
            // ,
            // 'Key': function(up, file) {
            //     var key = "";
            //     // do something with key
            //     return key
            // }
        }
    });


});
