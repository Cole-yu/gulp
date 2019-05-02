var Person=require('./person');
var Product=require('./product');

//定义一个员工的类，继承社会人这个类的所有所有和方法
class Employee extends Person{
    constructor(name,age,product){
        super(name,age);
        this.age=age;
        this.name=name;
        console.log(`employee类被实例化:${this.name},${this.age}`);
    }

    //员工工作
    work(prodname,price){            
        this.eat(); //必须先吃饭，才有力气干活
        console.log(`employee吃完饭,准备开始工作!`);

        //实例化一个产品种类
        let prod=new Product(prodname,price);
        let productName=prod.getProdname();
        let productPrice=prod.getPrice();
        
        console.log(`
            ${this.name}负责${productName},
            这种产品的价格是:${productPrice}
        `);
    }

    //员工吃饭
    eat(){    
        console.log(`employee eating`);
    }
}

module.exports=Employee;