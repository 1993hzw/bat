
$(function () {
    //实例化一个plupload上传对象
    var uploader = new plupload.Uploader({
        url: '/test/upload', //服务器端的上传页面地址
        filters: {
            mime_types: [ //只允许上传图片
                {title: "Image files", extensions: "jpg,bmp,png,jpeg"}
                //{ title : "Zip files", extensions : "zip" }
            ],
            max_file_size: '4mb', //最大只能上传2mb的文件
            prevent_duplicates: true //不允许选取重复文件
        },
        runtimes: 'html5,flash,html4',
        browse_button: 'pickfiles',
        container: 'btn-add-img',
        drop_element: 'drop_element',//拖拽区id
        max_file_size: '4mb',
        flash_swf_url: '/public/js/upload/Moxie.swf',
        dragdrop: true,
        chunk_size: '4mb',
        unique_names: true,//唯一名称
        multi_selection:false,//一次只能上传一张图片
        init: {
            'FilesAdded': function (up, files) {
                uploader.start();//立即上传
                console.log("add");
            },
            'BeforeUpload': function (up, file) {
                console.log("before")
            },
            'UploadProgress': function (up, file) {
                console.log(file.percent + "%")
            },
            'UploadComplete': function () {
                console.log('complete')
            },
            'FileUploaded': function (up, file, info) {
                console.log(arguments)
            },
            'Error': function (up, err, errTip) {
                console.log(errTip);
            }
        }
    });
    uploader.init();
});
