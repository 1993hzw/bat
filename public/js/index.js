/*
 <div class="blog-item">
 <div class="blog-title">title</div>
 <div class="blog-brief">details<br>ss</div>
 <div class="blog-details"><span class="blog-tags">tags</span>|<span class="blog-time">2015-7-1</span></div>
 </div>
*/
$(document).ready(function(){
    setLayout();
    getBlogs();
    $(window).resize(function(){
        setLayout();
    })
});

var setLayout=function(){
    if($(window).width()>800){
        $('.right').css({float: "right",width: "250px",paddingTop:"0px"})
        var contentWidth=$('.content-container').width();
        var rightWidth=$('.right').width();
        $('.left').width(contentWidth-rightWidth-5);
    }else{
        $('.left').css({width:"100%"})
        $('.right').css({float: "none",width: "100%",paddingTop:"30px"})
    }
}

var getBlogs=function(){
    var list=$('.blogs-list-container');
    $.get('/blogs/get_last',{t:Math.random()},function(res){
            var v=eval('('+res+')');
            var rows= v.rows;
             for(var i=0;i<rows.length;i++){
                 list.append('<div class="blog-item">'+
                     '<div class="blog-title"><a href="/blogs?id='+rows[i].f_id+'">'+rows[i].f_title+'</a></div>'+
                     '<div class="blog-brief">'+rows[i].f_brief+'</div>'+
                     '<div class="blog-details"><span class="blog-tags">'+ v.tags[rows[i].f_tags]+'</span>|<span class="blog-time">'+getTime(rows[i].f_insert_time)+'</span></div>'+
                     '</div>')
             }
    })
}

var getTime=function(obj){
    var v=eval('('+obj+')');
    return v.year+"-"+v.month+"-"+v.date+" "+ v.hour+":"+ v.minute+":"+ v.second;
}