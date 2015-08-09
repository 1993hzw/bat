var getTime=function(){
    var date=new Date();
    /*var json={};
    json.year=date.getFullYear();
    json.month=date.getMonth()+1;
    json.date=date.getDate();
    json.hour=date.getHours();
    json.minute=date.getMinutes();
    json.second=date.getSeconds();
    //return date.getFullYear()+"年"+(date.getMonth()+1)+"月"+date.getDate()+"号"+date.toLocaleTimeString();*/
   return date.getTime();
}

var formatTime=function(time){
    var date;
    if(time){
       date = new Date(time);
    }else{
        date = new Date();
    }
    return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
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

exports.formatHTML=formatHTML;
exports.getTime=getTime;
exports.formatTime=formatTime;