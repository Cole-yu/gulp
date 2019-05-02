// 定义一个控制器中的小球的一个类
class Ball{
    constructor(soccer){        
        this.x=3.1;
        this.y=10.2;
        this.vx=0.2;
        this.vy=0.2; 
        this.va=0.5;
        this.size=1;
        this.frame;    
        this.runStatus=false;
        this.soccer=soccer; 
        console.log(this.soccer);                   
    }

    //初始化小球的属性和位置
    init(){      
        console.log("init");  
        this.x=3.1;
        this.y=10.2;
        this.vx=0.2;
        this.vy=0.2;
        this.va=0.5;
        this.size=1;
        // this.soccer=document.getElementById("soccer");
        this.soccer.style.left=this.x.toString()+"rem";
        this.soccer.style.top=this.y.toString()+"rem"; 
        this.soccer.transform="scale("+ball.size.toString()+")";        
    }

    move(){        
        if(this.va>0){
            this.runStatus=true;
            ball.va=ball.va-0.002;            
        }
        else{
            ball.va=0;
            this.runStatus=false;
        }
        this.x=this.x+this.vx*this.va;
        this.y=this.y-this.vy*this.va;
		this.soccer.style.left=this.x.toString()+"rem";// 以小球的左上角为坐标系的(x,y)坐标点
		this.soccer.style.top=this.y.toString()+"rem";
        this.size=5/98*this.y+47/98;
        this.soccer.style.transform="scale("+this.size.toString()+")";		
    }
}

module.exports=Ball;
