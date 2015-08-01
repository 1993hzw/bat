var getTimeJosn=function(){
    var date=new Date();
    var json={};
    json.year=date.getFullYear();
    json.month=date.getMonth()+1;
    json.date=date.getDate();
    json.hour=date.getHours();
    json.minute=date.getMinutes();
    json.second=date.getSeconds();
    //return date.getFullYear()+"年"+(date.getMonth()+1)+"月"+date.getDate()+"号"+date.toLocaleTimeString();
   return JSON.stringify(json);
}

var resolveTimeJson=function(obj){
    var v=JSON.parse(obj);
    return v.year+"-"+v.month+"-"+v.date+" "+ v.hour+":"+ v.minute+":"+ v.second;
}

var checkIsInArray=function(elem,array){
    /*for(var i=0;i<array.length;i++){
        if(elem===array[i]) return true;
    }
    return false;*/
    return array[elem];
}

exports.getTime=getTimeJosn;
exports.resolveTimeJson=resolveTimeJson;
exports.checkIsInArray=checkIsInArray;