var MODE_MARKDOWN=1;
var MODE_TEXT=2;

var isResizing = false;
var downX;
var isRendering = false;//是否正在渲染
var mode = MODE_MARKDOWN;//编辑模式

var lastTagVal = 0;
var isInputting = false;//是否正在编辑区输入
var timeoutObj;
var isPreview = true;//是否开启预览
var isPc = true;//是否为pc端
var isBusy = false;

$(function () {
    isPc = checkIsPC();
    var textarea = $(".textarea");
    var preview = $(".preview");
    var selectTag = $('.selector-tag');
    var selectMode = $('.selector_mode');
    var btnPreview = $('.btn-preview');

    setLayout();
    previewPassage(preview, textarea);

    window.onbeforeunload = function(){
        return "内容没有保存，确定离开该页面？";
    };

    //渲染预览区
    var render = function () {
        if (!isInputting || !isPreview) return;
        isRendering = true;
        setTimeout(function () {
            previewPassage(preview, textarea);
            $('pre code').each(function (i, block) {//代码高亮
                hljs.highlightBlock(block);
            });
            render();
        }, 500)
    };
    //监听textarea的输入事件
    textarea.bind('input propertychange', function () {
        if (!isPreview) return;
        clearTimeout(timeoutObj);
        isInputting = true;
        if (!isRendering) render();
        timeoutObj = setTimeout(function () {
            isInputting = false;
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
    });

    if (isPc)//pc端监听窗口变化
        $(window).resize(function () {
            setLayout();
        });

    //拉伸预览区
    $(".resize-border").bind("mousedown", function (e) {
        if (!e) return;
        isResizing = true;
        downX = e.clientX;
    });
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
            $('#content').html('<div id="tip">请输入标签名</div>' +
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
            $('.input-tag').click(function () {
                $("#tip").html('请输入标签名')
            });
        } else {
            lastTagVal = v;//记住标签，防止显示新增标签
        }
    });

    //预览切换
    btnPreview.click(function () {
        isPreview = !isPreview;
        if (isPreview) {
            setLayout();
            $('.resize-border').show();
            btnPreview.text(" > ");
            previewPassage(preview, textarea);
        } else {
            setLayout();
            $('.resize-border').hide();
            btnPreview.text(" < ");
            preview.html("");
        }
    });
    //监听编辑模式
    selectMode.change(function () {
        var m = selectMode.val();
        if (m == MODE_MARKDOWN) {//markdown
            mode = MODE_MARKDOWN;
            $('#btn-add-img').show();
            $('#btn-add-html').show();
            $('.input-container').css({background: 'whitesmoke'})
        } else if (m == MODE_TEXT) {//文本模式
            mode = MODE_TEXT;
            $('#btn-add-img').hide();
            $('#btn-add-html').hide();
            $('.input-container').css({background: 'white'})
        } else {
            selectMode.val(MODE_MARKDOWN);
            $('.input-container').css({background: 'whitesmoke'})
        }
        previewPassage(preview, textarea);
    }).change();

    //私密选项监听
    $('#checkbox-private').click(checkPrivateBox);
    checkPrivateBox();


    lastTagVal = selectTag.val();
    if (!isPc) btnPreview.click();//移动端默认收起预览
});
//检测是否选中私密
var checkPrivateBox=function () {
    if ($('#checkbox-private')[0].checked) {
        $('.checkbox-private-container').css({fontWeight: "bold", color: "red"});
    } else {
        $('.checkbox-private-container').css({fontWeight: "normal", color: "grey"});
    }
};

var setLayout = function () {
    var height, width, editHeight;
    if (isPreview) {//预览
        height = $(window).height();
        width = $(window).width();
        //编辑区的高度
        editHeight = height - $('.topbar-container').height() - $('.toolsbar-container').height();
        //var titleHeight=$(".title-container").height();
        //alert(width)
        $(".edit-container").height(editHeight).width(width);
        if (isPc) {//pc端
            $(".input-container").height(editHeight).width(width / 2 - 10);
            ////预览区域约为屏幕宽度的一半
            $(".preview-container").height(editHeight).width($(".edit-container").width() / 2 - 2);
        } else {//移动端
            $(".input-container").height(editHeight).hide();
            //预览区域约为屏幕宽度
            $(".preview-container").height(editHeight).width($(".edit-container").width() - 10);
        }
        $(".input-title-container").width(width);
        $(".input-title").width(width - $('.tag-container').width());
        //alert($(".input-title-container").width()+" "+$(".input-title").width())
    } else {//关闭预览情况
        height = $(window).height();
        width = $(window).width();
        editHeight = height - $('.topbar-container').height() - $('.toolsbar-container').height();
        $(".edit-container").height(editHeight).width(width);
        $(".input-container").height(editHeight).width(width - 27).show();
        $(".preview-container").height(editHeight).width(27);
        $(".input-title-container").width(width - $(".tag-container").width());
        $(".preview").html("")
    }
};

//改变预览区域尺寸
var resize = function (e) {
    if (!isPc || !isPreview || isRendering) return;
    isRendering = true;
    var textarea = $(".input-container");
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

//新增标签
var addTag = function (selectTag) {
    if (isBusy) return;
    isBusy = true;
    var tag = ($('.input-tag').val()).trim();
    if (tag == "") {
        $("#tip").html('<span style="color: red;font-size: 18px">标签名不能为空</span>');
        isBusy = false;
    } else if (tag.length > 15) {
        $("#tip").html('<span style="color: red;font-size: 18px">标签名长度不能大于15</span>');
        isBusy = false;
    } else {
        $.ajax({
            type: 'POST', url: "/api/_add_tag", dataType: 'json',
            data: {tag: tag},
            success: function (res) {
                var v = res;
                if (v.state > 0) {
                    $('#dialog').hide();
                    $('.input-tag').val("").click();
                    var html = "";
                    for (var i in v.tags) {
                        html += '<option selected value="' + i + '"> &nbsp;' + v.tags[i] + '</option>'
                    }
                    html += '<option style="color: gray;" value="-1">&nbsp;+新增 </option>'
                    selectTag.html(html);
                } else {
                    if (v.state == -2) {
                        $("#tip").html('<span style="color: red;font-size: 18px">已存在相同标签</span>')
                    } else {
                        alert(res)
                    }
                }
                isBusy = false;
            },
            error: function (err) {
                $("#tip").html('<span style="color: red;font-size: 18px">新增失败，请重试</span>');
                isBusy = false;
            }
        });
    }
};

//发布文章（新增模式下）
var publish = function () {
    if (isBusy) return;
    isBusy = true;
    var title = $('.input-title').val().trim();
    var markdown = $('.textarea').val();
    var tag = $('.selector-tag').val().trim();
    var status=($('#checkbox-private')[0].checked)?1:0;//0：默认，1：私密
    if (markdown == null || markdown.trim() == "") {
        isBusy = false;
        return alert("内容不能为空");
    }
    $('.btn-publish').val('发布中');
    $.ajax({
        type: 'POST', url: "/api/_publish", dataType: 'json',
        data: {title: title, markdown: markdown, tag: tag, mode: mode,status:status},
        success:  function (res) {
            console.log(res)
            var v = res;
            if (v.state > 0) {
                if (v.id) {
                    location.href = "/blogs/" + v.id;
                } else {
                    location.href = "/";
                }
            } else {
                alert("发布失败，请重试");
                isBusy = false;
                $('.btn-publish').val('发布');
            }
        },
        error: function (err) {
            alert("发布失败，请重试");
            isBusy = false;
            $('.btn-publish').val('发布');
        }
    });
};

//保存文章（编辑模式下）
var finish = function () {
    if (isBusy) return;
    isBusy = true;
    var title = $('.input-title').val().trim();
    var markdown = $('.textarea').val();
    var tag = $('.selector-tag').val().trim();
    var status=($('#checkbox-private')[0].checked)?1:0;//0：默认，1：私密
    if (markdown == null || markdown.trim() == "") {
        isBusy=false;
        return alert("内容不能为空");
    }
    $('.btn-finish').val('保存中');
    $.ajax({
        type: 'POST', url: "/api/_save", dataType: 'json',
        data: {id: $("#blog").text(),title: title,markdown: markdown,tag: tag,
            mode: mode,status:status},
        success:  function (res) {
            var v = res;
            if (v.state > 0) {
                if (v.id) {
                    location.href = "/blogs/" + v.id;
                } else {
                    location.href = "/";
                }
            } else {
                alert('保存失败，请重试');
                isBusy=false;
                $('.btn-finish').val('保存');
            }
        },
        error: function (err) {
            alert('保存失败，请重试');
            isBusy=false;
            $('.btn-finish').val('保存');
        }
    });
};

//预览文章
var previewPassage = function (preview, textarea) {
    if (!isPreview) return;
    preview = preview || $('.preview');
    textarea = textarea || $('.textarea');
    if (mode == MODE_TEXT) {//纯文本
        preview.html('<pre style="background: white;border: none;padding-top: 0px;">' + formatHTML(textarea.val()) + '</pre>');
    } else {
        preview.html(marked(textarea.val()));
    }
};


//在编辑框添加图片或html
function addImgOrHtml(name, fileName) {
    if (mode == 2) return;//文本模式
    var downloadUrl = ($('#upload-domain').text().trim()) || location.protocol + '//' + location.host + '/public/res';
    var container = $('.textarea');
    var text = container.val();
    if (/\.(htm|html)$/i.test(fileName)) {
        container.val(text + '\n' + '<iframe style="width:100%;height:200px" src="' + downloadUrl + '/' + name + '"></iframe>');
    } else {
        container.val(text + '\n' + '![img](' + downloadUrl + '/' + name + ' "' + fileName + '")');
    }
    container.scrollTop(container[0].scrollHeight);//滑动到底部
    previewPassage(undefined, container);
};

//上传组件初始化
$(function () {

    var getUploaderInit=function(){
        var init={
            'FilesAdded': function (up, files) {
                if(isBusy) return;
                $('#dialog').show();
                $('#content').html('<div class="upload-info" style="width: 300px">正在上传<br>' + files[0].name + '</div>' +
                    '<div class="upload-progress"></div>');
                //重新绑定事件
                $('#enter').unbind('click').click(function () {
                    if (!isUploading) $('#dialog').hide();
                });
                $('#cancel').unbind('click').click(function () {
                    uploader.stop();//停止上传
                    uploader.splice(0, 10);//从队列中移出
                    uploaderHtml.stop();//停止上传
                    uploaderHtml.splice(0, 10);//从队列中移出
                    isUploading = false;
                    $("#dialog").hide();
                });
                if (auto_start) {//立即上传
                    isUploading = true;
                    uploader.start();
                    uploaderHtml.start();
                }
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
                console.log(arguments)
            },
            'FileUploaded': function (up, file, info) {
                console.log(info)
                isUploading = false;

                if (info.response && JSON.parse(info.response).failed) {//上传到本地服务器时，如果上传失败会返回错误信息
                    return $('#content').html('<span style="color:red">上传失败,请重试</span>');
                }

                //插入图片或html
                addImgOrHtml(file.target_name || JSON.parse(info.response).target_name, file.name);
                uploader.splice(0, 10);//从队列中移出
                uploaderHtml.splice(0, 10);//从队列中移出
                console.log(file)
            },
            'Error': function (up, err, errTip) {
                isUploading = false;
                $('#content').html('<span style="color:red">上传失败,请重试</span>');
                uploader.splice(0, 10);//从队列中移出
                uploaderHtml.splice(0, 10);//从队列中移出
                console.log(errTip);
            }
        };
        return init;
    };

    var domain = $('#upload-domain').text().trim();
    var isUploading = false;
    var auto_start = true;//立即上传
    var options = {
        filters: {
            mime_types: [ //只允许上传图片
                {title: "Image files", extensions: "jpg,bmp,png,jpeg,gif"}
            ],
            max_file_size: '4mb', //最大只能上传2mb的文件
            prevent_duplicates: true //不允许选取重复文件
        },
        runtimes: 'html5,flash,html4',
        browse_button: 'pickfiles',
        container: 'btn-add-img',
        //drop_element: 'drop_element',//拖拽区id
        max_file_size: '4mb',
        flash_swf_url: '/public/js/upload/Moxie.swf',
        dragdrop: false,//禁止拖拽
        chunk_size: '4mb',
        multi_selection: false,//一次只能上传一张图片
    };

    var uploader, uploaderHtml;
    if (domain && domain != "") {//上传到七牛，以下为七牛的参数
        options.uptoken_url = '/api/_token';
        options.domain = domain;
        options.unique_names = true;//唯一名称
        options.init=getUploaderInit();
        uploader = Qiniu.uploader(options);

        //插入html
        options.filters = {
            mime_types: [ //只允许上传图片
                {title: "html files", extensions: "html,htm"}
            ],
            max_file_size: '4mb', //最大只能上传2mb的文件
            prevent_duplicates: true //不允许选取重复文件
        };
        options.browse_button = 'pickhtml';
        options.init=getUploaderInit();
        uploaderHtml = Qiniu.uploader(options);

    } else {//上传到服务器端
        options.url = '/api/_upload';
        options.init=getUploaderInit();
        uploader = new plupload.Uploader(options);
        uploader.init();

        //插入html
        options.filters = {
            mime_types: [ //只允许上传图片
                {title: "Image filess", extensions: "html,htm"}
            ],
            max_file_size: '4mb', //最大只能上传2mb的文件
            prevent_duplicates: true //不允许选取重复文件
        };
        options.browse_button = 'pickhtml';
        options.init=getUploaderInit();
        uploaderHtml = new plupload.Uploader(options);
        uploaderHtml.init();
    }
});