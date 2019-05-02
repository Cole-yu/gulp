// import {person, greeter, greet} from './person';    //ESM模块化方案  import...from...与export,  require与module.exports
var Employee=require('./employee');//commonJS模块化加载方案
var Product=require('./product');

//实例化一个员工
var emp=new Employee("yfx",18);
emp.getAge();//调用父类的方法
emp.getName();
emp.work("milk",4);
