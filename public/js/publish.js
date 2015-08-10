var isResizing = false;
var downX;
var isRendering = false;
var mode = 1;//编辑模式

var lastTagVal = 0;
var isInput = false;
var timeoutObj;
var isPreview = true;
var isPc = true;
var isAddingTag = false;

$(function () {
    isPc = checkIsPC();
    var textarea = $(".textarea");
    var preview = $(".preview");
    var selectTag=$('.selector-tag');
    var selectMode=$('.mode');
    var btnPreview=$('.btn-preview');

    setLayout();
    previewPassage(preview, textarea);

    //渲染预览区
    var render = function () {
        if (!isInput || !isPreview) return;
        isRendering = true;
        setTimeout(function () {
            previewPassage(preview, textarea);
            $('pre code').each(function (i, block) {//代码高亮
                hljs.highlightBlock(block);
            });
            render();
        }, 500)
    }
    //监听textarea的输入事件
    textarea.bind('input propertychange', function () {
        if (!isPreview) return;
        clearTimeout(timeoutObj);
        isInput = true;
        if (!isRendering) render();
        timeoutObj = setTimeout(function () {
            isInput = false;
            isRendering = false;
        }, 1000);
    });

    //编辑区滚动事件，预览区随着滚动
    textarea.scroll(function () {
        var textarea = $(".textarea");
        var preview = $(".preview");
        var percent = textarea.scrollTop() / textarea[0].scrollHeight;
        //padding 25
        if ((textarea.scrollTop() + textarea.height() + 25) >= textarea[0].scrollHeight) {
            preview.scrollTop(preview[0].scrollHeight);
        } else
            preview.scrollTop(preview[0].scrollHeight * percent)
    })

    if (isPc)//pc端监听窗口变化
        $(window).resize(function () {
            setLayout();
        });

    //拉伸预览区
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
    });

    //监听标签变化
    selectTag.change(function () {
        var v = (selectTag.val() + "").trim();
        if (v == -1) {//新增标签
            $('#dialog').show();
            $('#content').html('<div id="tip">请输入标签名</div>'+
                '<input type="text" class="input-tag">');
            //重新绑定事件
            $('#enter').unbind('click').click(function () {
                addTag(selectTag);
            });
            $('#cancel').unbind('click').click(function () {
                $("#dialog").hide();
                selectTag.val(lastTagVal);
                $('.input-tag').val("").click();
            });
        } else {
            lastTagVal = v;//记住标签，防止显示新增标签
        }
    });
    $('.input-tag').click(function () {
        $("#tip").html('请输入标签名')
    });

    btnPreview.click(function () {
        isPreview = !isPreview;
        if (isPreview) {
            setLayout();
            $('.resize-border').show();
            btnPreview.text(" > ")
            previewPassage(preview, textarea);
        } else {
            setLayout();
            $('.resize-border').hide();
            btnPreview.text(" < ");
            preview.html("");
        }
    })
    //监听编辑模式
    selectMode.change(function () {
        var m = selectMode.val();
        if (m == 1) {//markdown
            mode = 1;
            $('#btn-add-img').show();
            $('.inupt-container').css({background: 'whitesmoke'})
        } else if (m == 2) {//文本模式
            mode = 2;
            $('#btn-add-img').hide();
            $('.inupt-container').css({background: 'white'})
        } else {
            selectMode.val(1);
            $('.inupt-container').css({background: 'whitesmoke'})
        }
        previewPassage(preview, textarea);
    }).change();

    lastTagVal = selectTag.val();
    if (!isPc) btnPreview.click();//移动端默认收起预览
});


var setLayout = function () {
    var height, width, editHeight;
    if (isPreview) {//预览
        height = $(window).height();
        width = $(window).width();
        editHeight = height - $('.topbar-container').height();
        //var titleHeight=$(".title-container").height();
        //alert(width)
        $(".edit-container").height(editHeight).width(width);
        if (isPc) {//pc端
            $(".inupt-container").height(editHeight).width(width / 2 - 10);
            $(".preview-container").height(editHeight).width($(".edit-container").width() / 2 - 2);
        } else {//移动端
            $(".inupt-container").height(editHeight).hide();
            $(".preview-container").height(editHeight).width($(".edit-container").width() - 10);
            //alert($(".edit-container").width())
            //alert($(".preview-container").width()+" "+$(window).width())
        }
        $(".input-title-container").width(width);
        $(".input-title").width(width - $('.tag-container').width());
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
    if (!isPc||!isPreview||isRendering) return;
    isRendering = true;
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
    preview.width($(window).width() - width - 12);

    setTimeout(function () {
        isRendering = false;
    }, 80)
};

var addTag=function(selectTag){
    if (isAddingTag) return;
    isAddingTag = true;
    var tag = ($('.input-tag').val()).trim();
    if (tag == "") {
        $("#tip").html('<span style="color: red;font-size: 18px">标签名不能为空</span>')
        isAddingTag = false;
    } else if (tag.length > 15) {
        $("#tip").html('<span style="color: red;font-size: 18px">标签名长度不能大于15</span>')
        isAddingTag = false;
    } else {
        $.post("/api/_add_tag", {tag: tag}, function (res) {
            var v = JSON.parse(res);
            if (v.state > 0) {
                $('#dialog').hide();
                $('.input-tag').val("").click();
                var html = "";
                for (var i in v.tags) {
                    html += '<option selected value="' + i + '"> &nbsp;' + v.tags[i] + '</option>'
                }
                //html+='<option selected value="'+i+'"> &nbsp;'+ v.tags[i] +'</option>'
                html += '<option style="color: gray;" value="-1">&nbsp;+新增 </option>'
                selectTag.html(html);
            } else {
                if (v.state == -2) {
                    $("#tip").html('<span style="color: red;font-size: 18px">已存在相同标签</span>')
                } else {
                    alert(res)
                }
            }
            isAddingTag = false;
        })
    }
}

var isPublishing = false;
var publish = function () {
    if (isPublishing) return;
    isPublishing = true;
    var title = $('.input-title').val().trim();
    var markdown = $('.textarea').val().trim();
    var tag = $('.selector-tag').val().trim();
    if (markdown == null || markdown == "") {
        isPublishing = false;
        return alert("内容不能为空");
    }
    $('.btn-publish').val('发送中');
    $.post('/api/_publish', {title: title, markdown: markdown, tag: tag, mode: mode}, function (res) {
        var v = JSON.parse(res);
        if (v.state > 0) {
            if (v.id) {
                location.href = "/blogs/" + v.id;
            } else {
                location.href = "/";
            }
        } else {
            alert(v);
            $('.btn-publish').val('发送');
        }
    })
}

var isSaving = false;
var finish = function () {
    if (isSaving) return;
    isSaving = true;
    var title = $('.input-title').val().trim();
    var markdown = $('.textarea').val().trim();
    var tag = $('.selector-tag').val().trim();
    if (markdown == null || markdown == "")
        return alert("内容不能为空");
    $('.btn-finish').val('保存中');
    $.post('/api/_save', {
        id: $("#blog").text(),
        title: title,
        markdown: markdown,
        tag: tag,
        mode: mode
    }, function (res) {
        var v = JSON.parse(res);
        if (v.state > 0) {
            if (v.id) {
                location.href = "/blogs/" + v.id;
            } else {
                location.href = "/";
            }
        } else {
            alert(v);
            $('.btn-finish').val('保存');
        }
    })

}
//预览文章
var previewPassage = function (preview, textarea) {
    if (!isPreview) return;
    preview = preview || $('.preview');
    textarea = textarea || $('.textarea');
    if (mode == 2) {//纯文本
        preview.html('<pre style="background: white;border: none;padding-top: 0px;">' + formatHTML(textarea.val()) + '</pre>');
    } else {
        preview.html(marked(textarea.val()));
    }
};


//在编辑框添加图片
function addImgUrl(name, fileName) {
    if (mode == 2) return;//文本模式
    var downloadUrl = ($('#upload-domain').text().trim()) || location.protocol+'//'+location.host+'/res';
    var container = $('.textarea');
    var text = container.val();
    container.val(text + '\n' + '![img](' + downloadUrl +'/'+ name + ' "' + fileName + '")');
    container.scrollTop(container[0].scrollHeight);
    previewPassage(undefined, container);
};

$(function () {
    var domain=$('#upload-domain').text().trim();
    var isUploading=false;
    var auto_start= true;//立即上传
    var options={
        filters: {
            mime_types: [ //只允许上传图片
                {title: "Image files", extensions: "jpg,bmp,png,jpeg"}
            ],
            max_file_size: '4mb', //最大只能上传2mb的文件
            prevent_duplicates: true //不允许选取重复文件
        },
        runtimes: 'html5,flash,html4',
        browse_button: 'pickfiles',
        container: 'btn-add-img',
        drop_element: 'drop_element',//拖拽区id
        max_file_size: '4mb',
        flash_swf_url: '/js/upload/Moxie.swf',
        dragdrop: true,
        chunk_size: '4mb',
        multi_selection:false,//一次只能上传一张图片
        init: {
            'FilesAdded': function (up, files) {
                $('#dialog').show();
                $('#content').html('<div class="upload-info" style="width: 300px">正在上传<br>'+files[0].name+'</div>' +
                    '<div class="upload-progress"></div>');
                //重新绑定事件
                $('#enter').unbind('click').click(function () {
                    if(! isUploading) $('#dialog').hide();
                });
                $('#cancel').unbind('click').click(function () {
                    uploader.stop();//停止上传
                    uploader.splice(0,1);//从队列中移出
                    isUploading=false;
                    $("#dialog").hide();
                });
                if(auto_start) {
                    isUploading=true;
                    uploader.start();}
                console.log("add")
            },
            'BeforeUpload': function (up, file) {
                console.log("before")
            },
            'UploadProgress': function (up, file) {
                $('.upload-progress').text(file.percent + "%");
                console.log(file.percent + "%")
            },
            'UploadComplete': function () {
                console.log('complete')
            },
            'FileUploaded': function (up, file, info) {
                isUploading=false;
                //图片上传成功返回url
                addImgUrl(file.target_name||JSON.parse(info.response).target_name, file.name);
                console.log(file)
            },
            'Error': function (up, err, errTip) {
                isUploading=false;
                $('#content').html('<span style="color:red">上传失败,请重试</span>');
                console.log(errTip);
            }
        }
    };
    var uploader;
    if(domain){//上传到七牛，以下为七牛的参数
        options.uptoken_url= '/api/_token';
        options.domain= domain;
        options.unique_names= true;//唯一名称
        uploader = Qiniu.uploader(options);
    }else{//上传到服务器端
        options.url= '/test/upload';
        uploader=new plupload.Uploader(options);
        uploader.init();
    }
});