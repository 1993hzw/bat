function JQ(){
    this.getElement=function(name){
        var ele=undefined;
        if((/^\.\S+$/).test(name)){//class
             ele=getElementsByClassName(name.substr(1,name.length));
        }else if((/^#\S+$/).test(name)){//id
             ele=document.getElementById(name.substr(1,name.length))
        }
        if(!ele) return;
        if(ele.hasChildNodes)
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


//  1

var datas={
    area:['中国','欧美'],
    company:{
        '中国':['小米','华为'],
        '欧美':['苹果','诺基亚']
    },
    phone:{
        '小米':['小米4','红米'],
        '华为':['华为荣耀6','华为荣耀7'],
        '苹果':['iphone5s','iphone6'],
        '诺基亚':['NOKIA 5300','NOKIA 255']
    }
}
var selArea=$("#select-area");
var selCom=$("#select-company");
var selPhone=$("#select-phone");
var container=$("#container");
var setArea=function(){
    var ele;
    selArea.removeAllChilds()
    for(var i=0;i<datas.area.length;i++){
        ele=document.createElement('option')
        ele.innerText=datas.area[i]
        ele.value=datas.area[i]
        selArea.appendChild(ele)
    }
    setCompany(datas.area[0])
}
var setCompany=function(name){
    var ele;
    var company=datas.company[name];
    selCom.removeAllChilds()
    for(var i=0;i<company.length;i++){
        ele=document.createElement('option')
        ele.innerText=company[i]
        ele.value=company[i]
        selCom.appendChild(ele)
    }
    setPhone(datas.company[name][0])
}
var setPhone=function(name){
    var ele;
    var phone=datas.phone[name];
    selPhone.removeAllChilds()
    for(var i=0;i<phone.length;i++){
        ele=document.createElement('option')
        ele.innerText=phone[i]
        ele.value=phone[i];
        selPhone.appendChild(ele)
    }
}
selArea.onchange=function(){
    var name=selArea.value;
    setCompany(name);
}
selCom.onchange=function(){
    var name=selCom.value;
    setPhone(name);
}
setArea();
//  2
var id=1;
var input=$('.input-name')[0];
var table=$('#table');
var btnAdd=$('#btn-add');
btnAdd.onclick=function(){
   var tr=document.createElement('tr');
    var tdId=document.createElement('td');
    var tdName=document.createElement('td');
    var name=document.createElement('input');
    var del=document.createElement('span');
    del.innerText="X";
    del.style.color="red";
    del.onclick=function(){
        table.removeChild(tr);
    }
    name.disabled=true;
    tdId.innerText=id++;
    tdName.appendChild(name);
    initTd(tdName,name);
    tr.appendChild(tdId);
    tr.appendChild(tdName);
    tdName.appendChild(del);
    table.appendChild(tr)
}

function initTd(td,name){
    name.onblur=function(){
        name.disabled=true;
    }
    td.ondblclick=function(){
        name.disabled=false;
        name.focus();
    }
}

// 3


var img=$("#img");
var i=2;
var changeImg=function(){
    setTimeout(function(){
        img.src="img/"+i+".jpg";
        i=(i)%4+1;
        changeImg();
    },2500)
}
changeImg();

//4

var timer=$('#timer');
var time=0;
var changeTime=function(){
    setTimeout(function(){
        time+=100;
        timer.innerText=parseTime(time);
        changeTime();
    },100)
}

var parseTime=function(time){
    var seconds=(time/1000)+"";
    if(seconds.indexOf('.')<0) seconds=seconds.toString()+".0"
    return seconds+"秒"
}

changeTime();

