$(document).ready(function(){
    getBlogs();
    $(".btn-more").click(function () {
        if(isLoading) return;
        $(".btn-more").text("加载中")
        getBlogs();
    })
    if(checkIsPC())
        $(window).resize(function(){
            setLayout()
        })
    setLayout()
    setTimeout(function(){
        //setLayout()
    },1000)

})


var setLayout= function () {
    //var marginTop=$('.other-tags-container').height()-$('.cur-tag').height()*3/2;
    var width=$('.tags-container').width()-$('.cur-tag').width()-85
    //alert($(window).width()+" "+$('.tags-container').width()+"  "+$('.cur-tag').width())
    $('.other-tags-container').width(width)
    $('.cur-tag').css({height:$('.other-tags-container').height()+1,paddingTop:$('.other-tags-container').height()/2-10})
}

var length=0;
var isLoading=false;
var getBlogs=function(){
    if(isLoading) return;
    isLoading=true;
    var list=$('.blogs-list-container');
    $.get('/api/get_blogs',{t:Math.random(),tag:$('#cur-tag-id').text(),offset:length},function(res){
        var v=JSON.parse(res);
        var rows= v.rows;
        var html='';
        var top='<span class="top">顶</span>';
        var temp;
        for(var i=rows.length-1;i>=0;i--){
            temp=rows[i].f_top?top:'';
           html+= '<div class="blog-item">'+
                '<a href="/blogs/'+rows[i].f_id+'">'+temp+'<div class="blog-title">'+rows[i].f_title+'</div></a>'+
                '<div class="blog-brief">'+rows[i].f_brief+'</div>'+
                '<div class="blog-details"><span class="blog-tags">'+ v.tags[rows[i].f_tags]+'</span>|<span class="blog-time">'+getTime(rows[i].f_insert_time)+'</span></div>'+
                '</div>';
        }
        list.append(html);
        length+= rows.length;
        if(rows.length<5){
            return $(".btn-more").css({display:"none"});
        }
         $(".btn-more").text("点击加载更多");
        isLoading=false;
    })
}

var getTime=function(obj){
    var v=eval('('+obj+')');
    return v.year+"-"+v.month+"-"+v.date+" "+ v.hour+":"+ v.minute+":"+ v.second;
}
function checkIsPC() {
    if(/AppleWebKit.*Mobile/i.test(navigator.userAgent) ||
        (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent)))
    {
        return false;
    }else{
        return true;
    }
}