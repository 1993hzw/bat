function JQ(){
    this.getElement=function(name){
        var ele=undefined;
        if((/^.\S+$/).test(name)){//class
            var ele=getElementsByClassName();
        }else if((/^#\S+$/).test(name)){//id
            var ele=document.getElementById(name)
        }else{
            return ;
        }
        ele.removeAllChilds=function(){
            while(ele.hasChildNodes())
            {
                ele.removeChild(ele.firstChild);
            }
        }
        return ele;
    }
    function getElementsByClassName(className,context){
        context = context || document;       //如果有指定从某个元素里寻找，则会比每次都遍历document快得多
        if(context.getElementsByClassName){                               //如果浏览器支持原生的方法，则直接用原生的方法，为什么？你有把握你写的方法比原生提供的好吗？
            return context.getElementsByClassName(className);
        }
        var nodes = context.getElementsByTagName('*');         //遍历
        var rets = [];                                                     //存放匹配到的节点
        for(var i = 0; i < nodes.length; i++){
            if(hasClass(className,nodes[i])){                      //hasClass派上用场了
                rets.push(nodes[i]);
            }
        }
        return rets;
    }
    function hasClass(className,node){
        var classNames = node.className.split(/\s+/);
        for(var i = 0; i < classNames.length; i++){
            if(classNames[i] == className){
                return true;
            }
        }
        return false;
    }
}
var jq=new JQ();
var $=function(name){
    return jq.getElement.apply(jq,[name])
}
