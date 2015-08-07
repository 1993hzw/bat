/*global Qiniu */
/*global plupload */
/*global FileProgress */
/*global hljs */


$(function() {
    var uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4',
        browse_button: 'pickfiles',
        container: 'container',
        drop_element: 'container',
        max_file_size: '100mb',
        flash_swf_url: '/js/Moxie.swf',
        dragdrop: false,
        chunk_size: '4mb',
        uptoken_url: '/test/token',
        domain: $('#domain').val(),
        // downtoken_url: '/downtoken',
         unique_names: true,
        // save_key: true,
        // x_vars: {
        //     'id': '1234',
        //     'time': function(up, file) {
        //         var time = (new Date()).formatTime();
        //         // do something with 'time'
        //         return time;
        //     },
        // },
        auto_start: true,
        init: {
            'FilesAdded': function(up, files) {
              /*  $('table').show();
                $('#success').hide();
                plupload.each(files, function(file) {
                    var progress = new FileProgress(file, 'fsUploadProgress');
                    progress.setStatus("等待...");
                });*/
            },
            'BeforeUpload': function(up, file) {
               /* var progress = new FileProgress(file, 'fsUploadProgress');
                var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
                if (up.runtime === 'html5' && chunk_size) {
                    progress.setChunkProgess(chunk_size);
                }*/
            },
            'UploadProgress': function(up, file) {
              /*  var progress = new FileProgress(file, 'fsUploadProgress');
                var chunk_size = plupload.parseSize(this.getOption('chunk_size'));

                progress.setProgress(file.percent + "%", file.speed, chunk_size);*/
                //console.log(file.percent+"%")
            },
            'UploadComplete': function() {
                //$('#success').show();
                alert('succss')
                //console.log("sss")
            },
            'FileUploaded': function(up, file, info) {
               /* var progress = new FileProgress(file, 'fsUploadProgress');
                progress.setComplete(up, info);*/
                //console.log(info)
                alert(info)
            },
            'Error': function(up, err, errTip) {
                /*$('table').show();
                var progress = new FileProgress(err.file, 'fsUploadProgress');
                progress.setError();
                progress.setStatus(errTip);*/
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
