var soccer=document.getElementById("soccer");

var lifeTime=0;//用户的进球数
var scale=1;//足球缩放程度

// var success=document.getElementById('success');

//小球运动标记，当true时，小球不可以被控制，当false时，小球可被控制
var runStatus=false;//小球已经被踢出未停止前控制器再次操作失效;false代表小球已经停止,true代表小球运动,操作控制器无效

var frame;//动画id
var ball={
	x:3.1,//小球的x,y坐标和x轴，y轴的速度
	y:10.2,
	vx:0.2,
	vy:0.2,
	va:0.5,
	size:1,
	init:function () {//初始化小球的位置和速度和大小
        ball.x=3.1;
        ball.y=10.2;
        ball.vx=0.2;
        ball.vy=0.2;
        ball.va=0.5;
        ball.size=1;
        soccer.style.left=ball.x.toString()+"rem";// 以小球的左上角为坐标系的(x,y)坐标点
        soccer.style.top=ball.y.toString()+"rem";
		soccer.style.transform="scale("+ball.size.toString()+")";		
		if(gua){
			window.cancelAnimationFrame(guard);
		}		
		gua=window.requestAnimationFrame(guard);	
    },
	move:function(){	// 小球的二次加速问题，踢出球后再未停止前仍然可以再次踢出的bug，runStatus字段
		if(ball.va>0){
			runStatus=true;			
			ball.va=ball.va-0.002;//草坪阻力系数0.003
		}
		else{
			ball.va=0;
			runStatus=false;//当ball.va为0时,小球停止,可以控制控制器继续踢球
		}
		// console.log(ball.va);		
		ball.x=ball.x+ball.vx*ball.va;
		ball.y=ball.y-ball.vy*ball.va;
		// console.log(ball.y);
		soccer.style.left=ball.x.toString()+"rem";// 以小球的左上角为坐标系的(x,y)坐标点
		soccer.style.top=ball.y.toString()+"rem";

		//y=5/98*x+47/98
		scale=5/98*ball.y+47/98;
		ball.size=scale;

		soccer.style.transform="scale("+ball.size.toString()+")";

		if(ball.va>0){
			frame=window.requestAnimationFrame(ball.move);
		}
		else{
			window.cancelAnimationFrame(frame);
			ball.x=3.1;
			ball.y=10.2;
			ball.vx=0.2;
			ball.vy=0.2;	
			ball.va=0.5;
			if(ball.y>5.3){
                window.cancelAnimationFrame(frame);
				window.cancelAnimationFrame(gua);
				$('#info').fadeOut(300).fadeIn(1000).fadeOut(2000);
                // alert("力量太小了，下次要给力!(ง •_•)ง");
                ball.init();
                runStatus=false;
            }
		}
		if(ball.y<=5.3){
			if(0<ball.x&&ball.x<7.2){
				console.log("lef:"+lef,ball.x);
				if(ball.x<(lef+1.6)&&ball.x>(lef-0.9)){
					console.log('被守门员拦住了');					
						window.cancelAnimationFrame(frame);
						window.cancelAnimationFrame(gua);
						$('#failure').fadeOut(300).fadeIn(1000).fadeOut(2000);
						// alert("再接再厉!(ง •_•)ง");
                    	setTimeout(function(){
							ball.init();
						},800);
                    	runStatus=false;
				}				
				if(ball.y<=4.2){
					if(ball.x>0.3&&ball.x<5.4){
						lifeTime=lifeTime+1;
						document.getElementById("lifeTimeto").innerHTML=lifeTime;					
						window.cancelAnimationFrame(frame);
						window.cancelAnimationFrame(gua);		
						$('#success').fadeOut(300).fadeIn(1000).fadeOut(2000);			
						// alert("进球了！`(*∩_∩*)′");
						setTimeout(function(){
							ball.init();
						},800);
						runStatus=false;
					}					
				}
				
			}else{
				if(ball.y<-1){
					// console.log('踢偏了');
					$('#digression').fadeOut(300).fadeIn(1000).fadeOut(2000);	
					window.cancelAnimationFrame(frame);
                    window.cancelAnimationFrame(gua);								
					ball.init();                    
                    runStatus=false;
				}
			}

		}
	}
};


//小球方向控制器
var circle=document.getElementById("circle");
circle.addEventListener("touchstart",movestart,true);
circle.addEventListener("touchmove",move,true);
circle.addEventListener("touchend",moveend,true);


var flag=false;//控制器控制标记，true为可滚动状态
var wid,hei;//事件触发点相对控制圆的左端方向距离与顶端方向距离
var deg,dX,dY;//y轴负方向的偏移角度，本程序y轴方向：屏幕中向下为y轴正方向，向右为x轴正方向
var t;//用户触发力量大小

function movestart(e){
	e.preventDefault();
	// ball.init();
	flag=true;      //小球开始运动标记
	var startY=e.targetTouches[0].pageY;
	var distanceY=circle.getBoundingClientRect().top+window.scrollY;
	hei=startY-distanceY;
	console.log(startY,distanceY,hei);

	var startX=e.targetTouches[0].pageX;
	var distanceX=circle.getBoundingClientRect().left+window.scrollX;
	wid=startX-distanceX;
}

function move(e){		
	e.preventDefault();//取消默认事件，否则会上下左右滑动页面

	var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
	var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端	

	if(isIOS){// pageX为文档中的位置，clientX为浏览器窗口位置，screenX为显示屏的位置,在滚动页页面时添加scrollX
		//ios
		dX=(e.targetTouches[0].pageX-wid)/100-5;
		dY=(e.targetTouches[0].pageY-hei)/100-8.2;
	}
	else{
		//减去父元素的absolute的left偏移0.5rem
		dX=(e.targetTouches[0].pageX-wid)/100-2;//安卓一次次测试出来，也不知道为什么要减
		//减去父元素的absolute的Top偏移6.5rem
		dY=(e.targetTouches[0].pageY-hei)/100-3.5;//安卓
	}		

	if(flag&&dX>=0&&dX<=1.42&&dY>=0&&dY<=1.42){		//1.92-0.5最右端
		circle.style.left=dX.toString()+"rem";
		circle.style.top=dY.toString()+"rem";
		if(runStatus==false){// todo 1:小球不是运动状态，可以改变小球的属性
            var val=(0.71-dY)/(0.71-dX);  //正切值tan(deg)=val
            t=Math.abs(0.71-dY)*Math.abs(0.71-dY)+Math.abs(0.71-dX)*Math.abs(0.71-dX);//用来判断用户的发力程度            
			
			if(dX>=0.71){//只有在角度为270-360和0-90之间有效，已经在moveend中条件判断，修复了功能
				deg=Math.atan(val)*180/Math.PI+90;
				if(dX==0.71&&dY<=0.71){		
					deg=0;
				}
				if(dX==0.71&&dY>0.71){
					deg=180;
				}				
				
            }
            else{				
				deg=Math.atan(val)*180/Math.PI+270;			
            }
            console.log("角度"+deg);
		}
	}
}

//释放控制器时把小球归位
function moveend(){
    flag=false;
    circle.style.left="0.71"+"rem";
	circle.style.top="0.71"+"rem";    	
		if(runStatus==false){// todo 3:小球不是运动状态，可以改变小球的属性
            ball.va=t+ball.va;
            if(countTime>0){
                if((deg>=0&&deg<=90)||(deg<=360&&deg>=270)){//判断用户踢出球时，方向是否踢反方向，弹出提示
                    deg=deg*Math.PI/180;//转化为弧度,三角函数是用弧度来计算的，transform是用角度计算的
                    if(dX>=1){
                        ball.vx=ball.vx*Math.sin(deg);//正
                        ball.vy=ball.vy*Math.cos(deg);//正
                    }
                    else{
                        ball.vx=ball.vx*Math.sin(deg);//负
                        ball.vy=ball.vy*Math.cos(deg);//正
                    }
                    window.requestAnimationFrame(ball.move);
                }
                else{					
					window.cancelAnimationFrame(gua);
					$('#opposite').fadeOut(300).fadeIn(1000).fadeOut(2000);
					ball.init();	
					// alert("方向踢翻了");
                }
            }
            else{// 倒计时结束后,无法再玩游戏，countTime
                alert("game over! 〒▽〒");
                window.cancelAnimationFrame(gua);
            }
		}
}

var goalie=document.getElementById('goalie');
var lef=goalie.offsetLeft/100;

var direct=true;//true向左运动，false向右运动
var gua;
function guard(){
		if(lef>=0.5&&lef<=4.7&&direct){
			direct=true;
			lef=lef+0.06;
		}
		if(lef>=0.5&&lef<=4.7&&!direct){
			direct=false;
			lef=lef-0.06;
		}

		if(lef>4.7){
			direct=false;
			lef=lef-0.06;
		}
		if(lef<0.5){
			direct=true;
			lef=lef+0.06;
		}
		
		goalie.style.left=lef.toString()+'rem';
		gua=window.requestAnimationFrame(guard);
}
gua=window.requestAnimationFrame(guard);//todo 正式环境需要取消注释，产生两个请求帧，动作会加快


var audio;
var firstMusic=0;
var musicControl=document.getElementsByClassName('music')[0];
var musicIconAnimation;
function  musicAdd() {//添加音乐播放器标签audio并延时1秒缓冲播放
    audio=document.createElement('audio');
	audio.src="./src/bgmusic.mp3";
	audio.autoplay="autoplay";
	audio.loop=true;
	audio.id="bgmusic";
	audio.innerHTML="该浏览器不支持音乐播放器";
	audio.preload=true;//预缓存,如果存在"autoplay",则忽略该属性
	document.body.appendChild(audio);
    musicControl.classList.add('rotate');
    setTimeout(function () {//报错提示:Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first
		audio.play();
    },1000);
    // audio.addEventListener("canplay", function(){
    //         audio.play();
    // });
}

//音乐播放与关闭/音乐动画效果控制
function  musicControls() {
	if(firstMusic>1){//用户直接点击音乐突标时，会先触发document点击事件，再是music点击事件,需要判断是否为首次播放
        if(musicControl.classList.contains('rotate')){//根据图标判断音乐是否在播放
            musicControl.classList.remove('rotate');
            audio.pause();
            $('#aux1').removeClass('rotate').hide();
            $('#aux2').removeClass('rotate').hide();
            $('#aux3').removeClass('rotate').hide();
            window.cancelAnimationFrame(musicIconAnimation);
        }
        else{
            musicControl.classList.add('rotate');
            audio.play();
            $('#aux1').show().addClass("rotate");
            $('#aux2').show().addClass("rotate");
            $('#aux3').show().addClass("rotate");
            musicAnimation();
        }
	}
}

//监听音乐图标，控制音乐播放
document.getElementById('music').addEventListener("click",musicControls,true);


//判断是否是第一次加载播放音乐 firstMusic字段，
document.addEventListener("touchstart",function () {
    firstMusic++;
	if(!audio){
        musicAdd();
        $('#aux1').show().addClass("rotate");
        $('#aux2').show().addClass("rotate");
        $('#aux3').show().addClass("rotate");
        musicAnimation();
	}
},true);


//60秒时间倒计时
var countTime=92;//2秒的载入动画
var countzero=document.getElementById("countZero");
var countTT=setInterval(function () {
	countTime=countTime-1;
	countzero.innerHTML=countTime.toString();
	if(countTime<10){
		countzero.style.color="red";
		countzero.style.fontSize="1rem";
		if(countTime<0){
            countzero.innerHTML="0";//todo 不设置会变为-1,setInterval的执行事件队列
            alert("game over! 〒▽〒");
            clearInterval(countTT);
            window.cancelAnimationFrame(gua);
            goalie.style.left='2.7rem';
		}
	}
},1000);
// todo:音乐在移动端也能自动播放 play的解决方案


//音乐播放时的图标动画效果
function musicAnimation() {
	//aux1向上
    $("#aux1").animate({top:"-0.65rem",width:'0.36rem',height:'0.59rem'},3000,function () {
        $("#aux1").css({width:'0.18rem',height:'0.3rem'})
           		 .css({top:'0.36rem'});
    });
    //aux2向右上
    $("#aux2").animate({left:"1.4rem",top:"-0.2rem",width:'0.36rem',height:'0.59rem'},3000,function () {
        $("#aux2").css({width:'0.18rem',height:'0.3rem'})
           		 .css({left:'0.43rem',top:"0.36rem"});
    });
    //aux向右下
    $("#aux3").animate({left:"1.4rem",top:"0.8rem",width:'0.36rem',height:'0.59rem'},3000,function () {
        $("#aux3").css({width:'0.18rem',height:'0.3rem'})
				.css({left:'0.43rem',top:"0.36rem"});
    });
    musicIconAnimation=window.requestAnimationFrame(musicAnimation);
}

document.querySelector('body').addEventListener('touchmove', function(e) {
    e.preventDefault();
});

var overscroll = function (els) {  
    for (var i = 0; i < els.length; ++i) {  
        var el = els[i];  
        el.addEventListener('touchstart', function () {  
            var top = this.scrollTop;  
            var totalScroll = this.scrollHeight;
            var currentScroll = top + this.offsetHeight;  
            //If we're at the top or the bottom of the containers  
            //scroll, push up or down one pixel.  
            //  
            //this prevents the scroll from "passing through" to  
            //the body.  
            if (top === 0) {  
                this.scrollTop = 1;  
            } else if (currentScroll === totalScroll) {  
                this.scrollTop = top - 1;  
            }  
        });  
        el.addEventListener('touchmove', function (evt) {  
            //if the content is actually scrollable, i.e. the content is long enough  
            //that scrolling can occur  
            if (this.offsetHeight < this.scrollHeight)  
                evt._isScroller = true;  
        });  
    }  
};  

//禁止body的滚动事件   
document.body.addEventListener('touchmove', function(evt) {
	//In this case, the default behavior is scrolling the body, which
	//would result in an overflow.  Since we don't want that, we preventDefault.
	if(!evt._isScroller) {
	  evt.preventDefault();
	}
  },{passive: false});

overscroll(document.querySelectorAll('.scroll'));
  
