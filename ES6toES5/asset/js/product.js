//定义一个产品的类
class Product{
    constructor(prodName,price){
        //定义产品的两个属性:产品名称，价格
        this.prodName=prodName;
        this.price=price;
        console.log(`产品被实例化:${prodName},${price}`);
    } 

    getProdname(){
        return this.prodName;
    }

    getPrice(){
        return this.price;
    }
}

module.exports= Product;