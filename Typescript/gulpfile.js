//从node.js环境中转移到浏览器中，使得typescript可以直接运行-------------------------------------------------------------------
// var gulp = require("gulp");
// var browserify = require("browserify");
// var source = require('vinyl-source-stream');//转化为gulp可读代码
// var tsify = require("tsify");//一款插件，访问typescript编译器

// gulp.task("copy-html", function () {
//     return gulp.src("*.html")
//         .pipe(gulp.dest("dist"));
// });
// gulp.task("default", ["copy-html"], function () {
//     //部署时处理代码依赖，将模块打包为一个文件。
//     return browserify(
//        {
//             basedir: '.',
//             debug: true,  // 在输出文件里生成source maps，允许我们在浏览器中直接调试代码
//             entries: ['src/main.ts'],//入口地址文件
//             cache: {},
//             packageCache: {}
//         }
//     )
//     // .add('src/main.ts')  //两种方式确定文件入口
//     .plugin(tsify)// tsify是Browserify的一个插件，就像gulp-typescript一样，它能够访问TypeScript编译器,否则会报语法错误(SyntaxError: 'import' and 'export' may appear only with 'sourceType: module')
//     .bundle()//将多个文件打包成一个
//     .pipe(source('bundle.js'))//将browserify生成的代码转化为gulp可识别的代码
//     .pipe(gulp.dest("dist"));//生成存放的文件夹路径
// });

//watchify工具--------------------------------------------------------------------------------
// var gulp = require("gulp");
// var browserify = require("browserify");
// var source = require('vinyl-source-stream');
// var watchify = require("watchify");
// var tsify = require("tsify");
// var gutil = require("gulp-util");

// gulp.task("copy-html", function () {
//     return gulp.src('*.html')
//         .pipe(gulp.dest("dist"));
// });

// var watchedBrowserify = watchify(browserify({
//     basedir: '.',
//     debug: true,
//     entries: ['src/main.ts'],
//     cache: {},//使用watchify需要browserify添加这两个参数cache,packageCache
//     packageCache: {}
// }).plugin(tsify));//访问typescript编译器

// function bundle() {
//     return watchedBrowserify
//         .bundle()//打包合并
//         .pipe(source('bundle.js'))//转为gulp可识别代码
//         .pipe(gulp.dest("dist"));//生成文件
// }

// gulp.task("default", ["copy-html"], bundle);
// watchedBrowserify.on("update", bundle);
// watchedBrowserify.on("log", gutil.log);




//压缩工具-----------------------------------------------------------------
// var gulp = require("gulp");
// var browserify = require("browserify");
// var source = require('vinyl-source-stream');
// var tsify = require("tsify");
// var uglify = require('gulp-uglify');
// var sourcemaps = require('gulp-sourcemaps');
// var buffer = require('vinyl-buffer');


// gulp.task("copy-html", function () {
//     return gulp.src('./*.html')
//         .pipe(gulp.dest("dist"));
// });

// gulp.task("default", ["copy-html"], function () {
//     return browserify({
//         basedir: '.',
//         debug: true,
//         entries: ['src/main.ts'],
//         cache: {},
//         packageCache: {}
//     })
//         .plugin(tsify)//访问typescript编译器
//         .bundle()     //打包合并
//         .pipe(source('bundle.js'))//转化为gulp可读的代码
//         .pipe(buffer())//以文件buffer的形式
//         .pipe(sourcemaps.init({loadMaps: true}))//启用sourcemaps功能 参考连接 https://www.jianshu.com/p/131e4b8b64e5
//         .pipe(uglify())//压缩代码
//         .pipe(sourcemaps.write('./'))
//         .pipe(gulp.dest("dist"));
// });




//通过babel将Typescript=>ES6=>ES5,在浏览器中使用----------------------------------------------------------------------------
var gulp = require('gulp');
var browserify = require('browserify');// 从node环境迁移到浏览器环境,全局对象 window,global
var source = require('vinyl-source-stream');//node的流转化为gulp可识别的代码
var tsify = require('tsify');// 访问Typescript的编译器
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer'); //从stream转化为buffer

gulp.task('copyHtml', function () {
    return gulp.src('asset/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['copyHtml'], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['asset/js/main.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .transform('babelify', {
            presets: ['es2015'],//typescript=>ES6=>ES5
            extensions: ['.ts']
        })
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))//初始化sourcemaps.另存在一份，可在浏览器中调试的文件
        .pipe(sourcemaps.write('./'))//输出文件路径
        .pipe(gulp.dest('dist'));
});

// Browserify是独立的，我们需要直接使用它的API，并将它加入到Gulp的任务中。
// 在上面的代码中，debug: true是告知Browserify在运行同时生成内联sourcemap用于调试。
// 引入gulp-sourcemaps并设置loadMaps: true是为了读取上一步得到的内联sourcemap，并将其转写为一个单独的sourcemap文件。
// vinyl-source-stream用于将Browserify的bundle()的输出转换为Gulp可用的vinyl（一种虚拟文件格式）流。
// vinyl-buffer用于将vinyl流转化为buffered vinyl文件（gulp-sourcemaps及大部分Gulp插件都需要这种格式）。



// 修改文件前缀，自己编写插件
// var gulp = require('gulp'),
// 	prefix = require('gulp-prefix');

// gulp.task("default", function(){
//     gulp.src("src/*.js")
//         .pipe(prefix("prefix data"))
//         .pipe(gulp.dest("desk"));
// });



//buffer-------------------------------------------
// var gulp = require('gulp');
// var gulpPrefixer = require('gulp-prefixer');

// gulp.task("default", function(){
//     gulp.src('src/**/*.js')
//       .pipe(gulpPrefixer('prepended string'))
//       .pipe(gulp.dest('modified-files'));
// });


//stream----------------------------------------------------
// var gulp = require('gulp');
// var gulpPrefixer = require('gulp-prefixer');

// gulp.task("default", function(){
//     gulp.src('src/**/*.js', { buffer: false })
//       .pipe(gulpPrefixer('prepended string'))
//       .pipe(gulp.dest('modified-files'));
// });