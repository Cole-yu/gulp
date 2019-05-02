$(document).ready(function () {
    var time = 1500;          //设置延迟时间，以毫秒为单位
    loading(time);            //当dom树构建完成时，加载初始动画效果，同时渲染页面
});

function loading(time) {
    setTimeout(lazy, time);             //延迟加载
}

function lazy() {                               //显示进入网页的加载动画
    $('.main').addClass('loaded');
    $('#loader-wrapper .load_title').remove(); 
}