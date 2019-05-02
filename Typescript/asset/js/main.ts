import {greetingLib} from './greeter';
var user = new greetingLib.Student("Jane", "M.","user");
document.body.innerHTML = greetingLib.greeter(user);