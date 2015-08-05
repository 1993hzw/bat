var isResizing = false;
var downX;
var isRender = false;
var mode=1;//编辑模式
var setLayout = function () {
    var height,width,editHeight;
    if (isPreview) {//预览
         height = $(window).height();
         width = $(".edit-container").width();
         editHeight = height - $('.topbar-container').height();
        //var titleHeight=$(".title-container").height();
       //alert(width)
        $(".edit-container").height(editHeight);
        if (isPc) {//pc端
            $(".inupt-container").height(editHeight).width(width / 2 - 10);
            $(".preview-container").height(editHeight).width(width / 2 -2);
        } else {//移动端
            $(".inupt-container").height(editHeight).hide();
            $(".preview-container").height(editHeight).width(width-10);
            //alert($(".edit-container").width())
            //alert($(".preview-container").width()+" "+$(window).width())
        }
        $(".input-title-container").css({paddingLeft:$(".tag-container").width()+"px"})
        //alert($(".input-title-container").width()+" "+$(".input-title").width())
    } else {//关闭预览情况
         height = $(window).height();
         width = $(window).width();
         editHeight = height - $('.topbar-container').height();
        $(".edit-container").height(editHeight).width(width);
        $(".inupt-container").height(editHeight).width(width - 27).show();
        $(".preview-container").height(editHeight).width(27);
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
        if (!isInput||!isPreview) return;
        isRender = true;
        setTimeout(function () {
            previewPassage(preview,textarea);
            $('pre code').each(function(i, block) {
                hljs.highlightBlock(block);
            });
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
    previewPassage(preview,textarea);
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
            $('#dialog')
                .css({display: "block"})
        } else {
            lastTagVal = v;//记住标签，防止显示新增标签
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
            $('.resize-border').show();
            $('.btn-preview').text(" > ")
           previewPassage(preview,textarea);
        } else {
            setLayout();
            $('.resize-border').hide();
            $('.btn-preview').text(" < ");
            $('.preview').html("");
        }
    })
    //监听编辑模式
    $('.mode').change(function(){
        var m=$('.mode').val();
        if(m==1){//markdown
          mode=1;
            $('#container').show();
            $('.inupt-container').css({background:'whitesmoke'})
        }else if(m==2){//文本模式
          mode=2;
            $('#container').hide();
            $('.inupt-container').css({background:'white'})

        }else{
            $('.mode').val(1);
            $('.inupt-container').css({background:'whitesmoke'})
        }
        previewPassage(preview,textarea);

    })

    lastTagVal = $('.selector-tag').val();
    if (!isPc) $(".btn-preview").click();
    $('.mode').change();
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
    $.post('/api/_publish', {title: title, markdown: markdown, tag: tag,mode:mode}, function (res) {
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
    $.post('/api/_save', {id: $("#blog").text(), title: title, markdown: markdown, tag: tag,mode:mode}, function (res) {
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

var previewPassage=function(preview,textarea){
    if(!isPreview) return;
    preview=preview||$('.preview');
    textarea=textarea||$('.textarea');
    if(mode==2){//纯文本
        preview.html('<pre style="background: white;border: none;padding-top: 0px;">'+formatHTML(textarea.val())+'</pre>');
    }else{
        preview.html(marked(textarea.val()));
    }
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
        return html.replace(/[&<>"']/g, function (c) {
            return character[c];
        })
    }
}();

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
        filters: {
            mime_types : [ //只允许上传图片和zip文件
                { title : "Image files", extensions : "jpg,bmp,png" }
                //{ title : "Zip files", extensions : "zip" }
            ],
            max_file_size : '2mb', //最大只能上传400kb的文件
            prevent_duplicates : true //不允许选取重复文件
        },
        runtimes: 'html5,flash,html4',
        browse_button: 'pickfiles',
        container: 'container',
        drop_element: 'container',
        max_file_size: '2mb',
        flash_swf_url: '/js/Moxie.swf',
        dragdrop: true,
        chunk_size: '4mb',
        uptoken_url: '/test/token',
        domain: '7xkd2p.com1.z0.glb.clouddn.com',
        unique_names: true,
        auto_start: true,
        init: {
            'FilesAdded': function(up, files) {
                console.log("add")
            },
            'BeforeUpload': function(up, file) {
                console.log("before")
            },
            'UploadProgress': function(up, file) {
                console.log(file.percent+"%")
            },
            'UploadComplete': function() {
                console.log('complete')
            },
            'FileUploaded': function(up, file, info) {
                //图片上传成功返回url
                addImgUrl(file.target_name);
                console.log(file)
            },
            'Error': function(up, err, errTip) {
                console.log(errTip);
            }
        }
    });

});

function addImgUrl(name){
    if(mode!=2) return ;
    var domain='http://7xkd2p.com1.z0.glb.clouddn.com/';
    var container = $('.textarea');
    var text=container.val();
    container.val(text+'\n'+'![]('+domain+name+')');
    previewPassage(undefined,container);
}