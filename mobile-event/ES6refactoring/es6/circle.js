class Circle{        
    constructor(cir){  //控制器圆控制的小球实例    
        this.x=0.71;
        this.y=0.71;         
        this.flag=false;//小球运动标记
        this.hei;//事件触发点相对控制圆的左端方向距离与顶端方向距离
        this.wid;
        this.dX;//y轴负方向的偏移角度，本程序y轴方向：屏幕中向下为y轴正方向，向右为x轴正方向
        this.dY;
        this.deg=0;
        this.cir=cir;        
        console.log(this.cir);
    }
    init(){
        this.flag=false;
        this.cir.style.left=this.x.toString()+"rem";
	    this.cir.style.top=this.y.toString()+"rem";
        return;
    }

    movestart(e){
        e.preventDefault();
        this.flag=true;      //小球开始运动标记
        let startY=e.targetTouches[0].PageY;
        this.cir=document.getElementById("circle");
        let distanceY=this.cir.getBoundingClientRect().top+window.scrollY;
        this.hei=startY-distanceY;        
    
        let startX=e.targetTouches[0].PageX;
        let distanceX=this.cir.getBoundingClientRect().left+window.screenX;
        this.wid=startX-distanceX;

        return true;
    }

    move(e){
        e.preventDefault();//取消默认事件，否则会上下左右滑动页面
        let u = navigator.userAgent;
        let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
        let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端	

        if(isIOS){            
            this.dX=(e.targetTouches[0].PageX-this.wid)/100-5; //ios
            this.dY=(e.targetTouches[0].PageY-this.hei)/100-8.2; //ios
        }
        else{
            //减去父元素的absolute的left偏移0.5rem
            this.dX=(e.targetTouches[0].PageX-this.wid)/100-2;//安卓
            //减去父元素的absolute的Top偏移6.5rem
            this.dY=(e.targetTouches[0].PageY-this.hei)/100-3.5;//安卓
        }            

        if(this.flag&&this.dX>=0&&this.dX<=1.42&&this.dY>=0&&this.dY<=1.42){
            this.cir.style.left=this.dX.toString()+"rem";
            this.cir.style.top=this.dY.toString()+"rem";
            
            let val=(0.71-this.dY)/(0.71-this.dX);  //正切值tan(deg)=val
            let t=Math.abs(0.71-dY)*Math.abs(0.71-dY)+Math.abs(0.71-dX)*Math.abs(0.71-dX);//用来判断用户的发力程度
            
            if(this.dX>=0.71){		                
                this.deg=Math.atan(val)*180/Math.PI+90;
                if(this.dX==0.71&&this.dY<=0.71){
                    this.deg=0;
                }
                if(this.dX==0.71&&this.dY>0.71){
                    deg=180;
                }
            }
            else{			
                this.deg=Math.atan(val)*180/Math.PI+270;			
            }	                
            console.log("角度"+this.deg);
            
            return true;
        }
    }

    moveend(){                    
        this.init();        
        this.deg=this.deg*Math.PI/180;//三角函数是用弧度来计算的，transform是用角度计算的
        return this.deg;
    }
}

module.exports=Circle;