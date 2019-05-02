var gulp=require('gulp');
var htmlminify = require('gulp-html-minify');//压缩html文件
var source = require('vinyl-source-stream');//把node的流转化为glup可识别的流
var uglify = require('gulp-uglify');//压缩js文件
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');//合并文件
var rename = require('gulp-rename');//重命名
var notify = require('gulp-notify');//报错提示
var plumber = require('gulp-plumber');//报错提示
var imagemin = require('gulp-imagemin');//压缩图片
var cssMin = require('gulp-clean-css');// 压缩css文件
var sourcemaps = require('gulp-sourcemaps');//另一种管理文件内容的方式(.map文件)
var gulpif = require('gulp-if');//根据条件判断执行一个任务
var assetRev = require('gulp-asset-rev');//给引用文件添加MD5版本号:style.css => style.css?v=d41d8cd98f,需要修改源文件，详见方法一(很好用，推荐)
var htmlreplace = require('gulp-html-replace'); //替换html中的构建块(推荐)
var runSequence = require('run-sequence');//串行执行任务
var jshint = require('gulp-jshint');    //javascript语法检查,npm install --save-dev jshint gulp-jshint,必须这样安装gulp-jshint插件，单独一个一个安装会报错
var sass = require('gulp-sass');        //sass、scss文件编译成css文件
var del = require('del');
var babelify=require("babelify");// 把es6语法转化为es5
var browserify=require('browserify');// 模块化加载方案
var source = require('vinyl-source-stream');//把node的流转化为glup可识别的流

// var isprod = process.ENV.env === "prod";//可以根据当前环境，配合gulpif实现按需编译

//----------------------------------------------------------------------------------------------------------------------
// 方法一:操作教程如下(非常简单)://通过gulp-asset-rev给引用文件添加MD5版本号,该方法需要修改gulp-asset-rev插件的源代码
// 参考链接:https://www.cnblogs.com/hutuzhu/p/5276000.html,  https://www.jianshu.com/p/934ca1a5f189
// 打开node_modules\gulp-assets-rev\index.js文件
// 第78行 var verStr = (options.verConnecter || "-") + md5;
// 更新为:var verStr = (options.verConnecter || "") + md5;
// 第80行 src = src.replace(verStr, '').replace(/(\.[^\.]+)$/, verStr + "$1");
// 更新为:src=src+"?v="+verStr;

// 初始化文件夹,否则不断累加代码
gulp.task("clean",function(){
    del("./dist");
});


//复制媒体文件
gulp.task("musicCopy",function(){
    return gulp.src('asset/src/*')
            .pipe(gulp.dest('dist/src'));
});

//给css文件引用资源添加版本，从asset到dsit,为合并做准备
gulp.task('cssMin',function () {
    return gulp.src('asset/css/*.css')     //源文件下的所有js
        .pipe(assetRev())   //给css文件中引用到的图片、字体、url添加版本号，同时给引用资源文件名称加版本号，操作子级文档名;对自身文件名无影响，操作css需要调用的父级文档来实现    
        .pipe(gulp.dest("dist/css"));      //复制到目标文件路径
});

//把sass文件编译成css,从asset到dist,为合并做准备
gulp.task("scssCompile",function(){
    return gulp.src('asset/scss/*.scss')
            .pipe(sass().on("error",sass.logError))
            .pipe(assetRev())            
            .pipe(gulp.dest("dist/css"));
});

//合并css文件并压缩，添加后缀
gulp.task('cssMerge',function(){
    return gulp.src('dist/css/*.css')
        .pipe(concat("bundle.css"))
        .pipe(cssMin())//进行压缩，如果需要合并也可加上合并的代码
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest("dist/css"));
});

//删除之前生成的一堆css文件，只留下合并过后的bundle.min.css
gulp.task('cssClean',function(){
    del(['dist/css/*.css','!dist/css/bundle.min.css']);
});

 //js语法检查
 gulp.task('jshint', function () {
    return gulp.src(['asset/js/*.js','!asset/js/*.min.js'])    
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

//给js中的引用资源添加版本号
gulp.task('jsver',function () {
    return gulp.src('asset/js/*.js')            //源文件下的所有js
            .pipe(assetRev())                   //对js文件里的引用资源配置版本号
            .pipe(gulp.dest("dist/js"));        //复制到目标文件路径
});

//压缩js文件
gulp.task('uglify',function(){
    return gulp.src('dist/js/*.js')        
            .pipe(uglify({
                mangle:true
            }))                  
            .pipe(gulp.dest("dist/js"));
});

//把所有js文件合并，减少http请求数
gulp.task('jsMerge',function(){ //
    return gulp.src(['dist/js/jquery*.min.js','dist/js/*.min.js','dist/js/*.js'])//把jquery放在前面按序合并，否则找不到'$'会报错
            .pipe(concat('bundle.js'))
            .pipe(rename({suffix:'.min'}))
            .pipe(gulp.dest('dist/js'));
});

//删除之前生成的单个js文件，只留下合并过后的bundle.min.js
gulp.task('jsClean',function(){    
    del(['dist/js/*.js','!dist/js/bundle.min.js']);
});

//图片压缩
gulp.task('imageminify',function (){
    var option = {
        optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
        progressive: false, //类型：Boolean 默认：false 无损压缩jpg图片
        interlaced: false, //类型：Boolean 默认：false 隔行扫描gif进行渲染
        multipass: false //类型：Boolean 默认：false 多次优化svg直到完全优化
    }
    return gulp.src('asset/images/*.{png,jpg,gif,ico,PNG,JPG}')
            .pipe(plumber({errorHandler:notify.onError('Error:<%= error.message %>')}))
            .pipe(imagemin(option))
            .pipe(gulp.dest('dist/images'));
});

//在对整个html引用资源加版本号之前，需要进行构建块的内容替换;否则没有相应的源文件，在default任务执行中会无法添加版本号
gulp.task("htmlReplace",function () {
    return gulp.src('asset/*.html')
                .pipe(htmlreplace({
                    'css':'css/bundle.min.css',      // css是index.html中定义的buildName
                    'js':'js/bundle.min.js',                    
                }))
                .pipe(gulp.dest('dist'));
});

// //把ES6编译成ES5语法
// gulp.task('browser',function(){
//     browserify({        //模块化加载方案
//         entries:['asset/es6/soccer.js']
//     })
//         .transform(babelify,{
//             presets: ['es2015']
//         })
//         .bundle()           //合并所有文件
//         .pipe(source('es6bundle.js'))  //将node流转化为gulp流(vinyl)
//         .pipe(rename({suffix:".min"}))
//         .pipe(gulp.dest('dist/es6'));
// });

// gulp.task('watchES6',function(){
//     gulp.watch('asset/es6/*.js',function(){
//         gulp.run('browser');
//     });
// });

gulp.task('dep',function(cb) {
    return runSequence('clean','musicCopy','imageminify', 'cssMin', 'scssCompile', 'cssMerge', 'jshint', 'jsver', 'uglify', 'jsMerge', 'htmlReplace','jsClean', 'cssClean',cb);
});

//对html中所有的本地引用css,js添加版本号,要求:引用资源的路径及文件名必须与本地的源文件保持一致
gulp.task('default',['dep'],function () {
    return gulp.src('dist/*.html')  //改变固定思维，可以通过htmlreplace改变html内容后生成dist下新的html，然后再加引用资源的版本号（只要引用资源在dist下都已经生成），没有必要在源html基础上添加引用资源版本号
        .pipe(assetRev())           //同理,js的合并操作，也可以先生成合并js文件，再修改源html内容，生成dist下的html后，添加js文件版本号
        .pipe(htmlminify())
        .pipe(gulp.dest("dist"))          //复制到目标文件路径
        .pipe(notify({ message: 'all tasks complete!' }));
});

gulp.task("watch",function(){
    gulp.watch(['asset/*.html','asset/js/*.js','asset/css/*.css','asset/scss/*.scss'] , function(){
        gulp.run('default');
    });
});

//进行sass的编译操作,把生成的css文件合并到bundle.css
gulp.task('distCssClean',function () {
    del('dist/css');
});
gulp.task('scssWatch',function (cb) {
    return runSequence('distCssClean','imageminify','cssMin','scssCompile','cssMerge','cssClean',cb);
});
gulp.task("watchScss",function(){
    gulp.watch('asset/scss/*.scss',['scssWatch']);
});

//单独进行js语法检查,不把js合并到bundle.js
gulp.task("watchJsHint",function(){
    gulp.watch('asset/js/*.js',['jshint']);
});

//js语法检查,把js合并到bundle.js
gulp.task("jsWatch",function(cb){
    del('dist/js');
    runSequence('jshint','jsver','uglify','jsMerge','jsClean',cb);
});
gulp.task("watchJs",function(){
    gulp.watch('asset/js/*.js',['jsWatch']);
});
