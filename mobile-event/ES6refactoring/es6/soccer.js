var Ball=require('./ball');
var Circle=require('./circle');
var Pointer=require('./pointer');

var soccer=document.getElementById("soccer");
var ball=new Ball(soccer);
var po=new Pointer();//指针
var point=document.getElementsByClassName("pointer")[0];
var cir=document.getElementById("circle");
var circle=new Circle(ball,cir,point);//圆控制小球

//小球方向控制器

var cir=document.getElementById("circle");
cir.addEventListener("touchstart",circle.movestart,true);
cir.addEventListener("touchmove",circle.move,true);
cir.addEventListener("touchend",circle.moveend,true);


var replay=document.getElementById("replay");
replay.addEventListener("click",function(e){
	if(ball.frame){  //todo 如果存在请求动画帧frame,因为在动画帧中未作判断，所以需要在replay中判断，耦合性比较强，待结构优化
    window.cancelAnimationFrame(ball.frame);    
    }
    
    //初始化小球的属性和位置
    ball.init();
});