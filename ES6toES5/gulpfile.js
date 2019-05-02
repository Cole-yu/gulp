var gulp=require("gulp");
var babelify=require("babelify");// 把es6语法转化为es5
var browserify=require('browserify');// 模块化加载方案
var runSequence=require("run-sequence");// 串行执行任务
var source = require('vinyl-source-stream');//node流=>gulp流(vinyl)

//npm install --save-dev babelify babel-core babel-preset-es2015 vinyl-source-stream run-sequence browserify

gulp.task("copyhtml",function(){
    gulp.src('asset/*.html')        
        .pipe(gulp.dest('dist'));
});

gulp.task('browser',function(){
    browserify({        //模块化加载方案
        entries:['asset/js/main.js']
    })
    .transform(babelify,{
        presets: ['es2015']
    })
    .bundle()           //合并所有文件
    .pipe(source('bundle.js'))  //将node流转化为gulp流(vinyl)
    .pipe(gulp.dest('dist/js'));

});

gulp.task("default",function(cb){
    runSequence("copyhtml","browser","watchJS",cb);// cb通知gulp引擎任务完成
});

gulp.task("watchJS",function(){
    gulp.watch("asset/js/*.js",function(){
        gulp.run("browser");
    });
});

