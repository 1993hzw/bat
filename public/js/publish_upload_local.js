//上传到七牛，该文件动态渲染时合并到publish.js后面
$(function () {
    var domain=$('#upload-domain').text().trim();
    var isUploading=false;
    var uploader = new plupload.Uploader({
        url: '/test/upload', //服务器端的上传页面地址
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
                    uploader.stop();//停止下载
                    uploader.splice(0,1);//从下载队列中移出
                    isUploading=false;
                    $("#dialog").hide();
                });
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
                addImgUrl(file.target_name, file.name);
                console.log(file)
            },
            'Error': function (up, err, errTip) {
                console.log(errTip);
            }
        }
    });

});