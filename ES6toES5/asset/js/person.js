//定义一个社会人的类
class Person{
    constructor(name,age){ //形式参数                       
        //定义person类的两个属性:name,age
        this.name=name;
        this.age=age;
        console.log(`person类被实例化:${this.name}, ${this.age}`);
    }    

    getName(){
        console.log(`姓名:${this.name}`);
    }
    
    getAge(){
        console.log(`年龄:${this.age}`);
    }
}

module.exports= Person;