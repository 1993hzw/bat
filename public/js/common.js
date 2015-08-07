if(!String.prototype.trim){
    String.prototype.trim=function(){
        return  this.replace(/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
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

var formatTime=function(time){
    var date=new Date(time);
    return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
}

function checkIsPC() {
    if (/AppleWebKit.*Mobile/i.test(navigator.userAgent) ||
        (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))) {
        return false;
    } else {
        return true;
    }
}