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
var cssversion = require('gulp-make-css-url-version');// 给css文件里引入的图片、字体及url加版本号
var sourcemaps = require('gulp-sourcemaps');//另一种管理文件内容的方式(.map文件)
var gulpif = require('gulp-if');//根据条件判断执行一个任务
var assetRev = require('gulp-asset-rev');//给引用文件添加MD5版本号:style.css => style.css?v=d41d8cd98f,需要修改源文件，详见方法一(很好用，推荐)
var rev = require('gulp-rev');//给静态资源文件名添加hash值:style.css => style-d41d8cd98f.css(不好用)
var revReplace = require('gulp-rev-replace');         //重写被gulp-rev重命名的文件名
var revCollector = require('gulp-rev-collector');     //gulp-rev的插件，用于html文件更改引用路径
var useref = require('gulp-useref');            //替换html中的构建块，解析构建块在HTML文件来代替引用未经优化的脚本和样式表
var htmlreplace = require('gulp-html-replace'); //替换html中的构建块(推荐)
var runSequence = require('run-sequence');//串行执行任务
var gulpSequence = require('gulp-sequence');//串行执行任务
var jshint = require('gulp-jshint');    //javascript语法检查,npm install --save-dev jshint gulp-jshint,必须这样安装gulp-jshint插件，单独一个一个安装会报错
var sass = require('gulp-sass');        //sass、scss文件编译成css文件
var del = require('del');

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

//给css文件引用资源添加版本，从asset到dsit,为合并做准备
gulp.task('cssMin',function () {
    return gulp.src('asset/css/*.css')     //源文件下的所有js
        .pipe(assetRev())   //给css文件中引用到的图片、字体、url添加版本号，同时给引用资源文件名称加版本号，操作子级文档名;对自身文件名无影响，操作css需要调用的父级文档来实现
        // .pipe(cssMin())                    //进行压缩，如果需要合并也可加上合并的代码
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
        .pipe(cssMin())
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest("dist/css"));
});

//删除之前生成的一堆css文件，只留下合并过后的bundle.min.css
gulp.task('cssClean',function(){
    del(['dist/css/*.css','!dist/css/bundle.min.css']);
});

 //js语法检查
 gulp.task('jshint', function () {
    return gulp.src(['asset/js/*.js','!asset/js/*.min.js','!asset/js/CountCode.js'])    
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
            // .pipe(uglify({//修改变量名，排除以下关键字       //todo:官网的示例，此处会报错,不知什么原因
            //     mangle:{ except:['require','exports','module','$'] } //排除混淆关键字
            // }))
            .pipe(uglify({
                mangle:true
            }))                  
            .pipe(gulp.dest("dist/js"));
});

//把所有js文件合并，减少http请求数
gulp.task('jsMerge',function(){
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
    return gulp.src('asset/images/*.{png,jpg,gif,ico}')
            .pipe(plumber({errorHandler:notify.onError('Error:<%= error.message %>')}))
            .pipe(imagemin(option))
            .pipe(gulp.dest('dist/images'));
});

//在对整个html引用资源加版本号之前，需要进行构建块的内容替换;否则没有相应的源文件，在default任务执行中会无法添加版本号
gulp.task("htmlReplace",function () {
    return gulp.src('asset/*.html')
                .pipe(htmlreplace({
                    'css':'css/bundle.min.css',      // css是index.html中定义的buildName
                    'js':'js/bundle.min.js'
                }))
                .pipe(gulp.dest('dist'));
});

gulp.task('dep',function(cb) {
    return runSequence('clean', 'imageminify', 'cssMin', 'scssCompile', 'cssMerge', 'jshint', 'jsver', 'uglify', 'jsMerge', 'htmlReplace', 'jsClean', 'cssClean',cb);
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


//----------------------------------------------------------------------------------------------------------------------
//方法二:使用useref插件实现多个引用文件合并，名称加hash值，重命名，压缩等一系列资源重构操作
// gulp.task('htmlminify',function(){
//     gulp.src('asset/*.html')
//         .pipe(useref())     //在需要变化的css引用上<!-- build:css1 css/style.css --><!-- endbuild -->
//         .pipe(gulpif('*.js', uglify()))//对html中引用的静态资源js进行压缩
//         .pipe(gulpif('*.css', cssversion()))//对html中引用的css样式表中的静态资源添加版本号
//         .pipe(gulpif('*.css', cssMin()))//对html中引用的静态资源css文件进行压缩
//         .pipe(rev())               //给静态资源文件名添加hash值
//         .pipe(revReplace())        //重写被gulp-rev重命名的文件名
//         .pipe(htmlminify())        //压缩html文件
//         .pipe(gulp.dest("dist"));
// });


//-------------------------------------------------------------------------------------------------------------------------
//方法三:在多个任务中分别操作，通过gulp-rev-replace及gulp-rev生成的rev-manifest.json在html中修改编译后的文件名称
// gulp.task('revRewrite',['cssVersionAdd','uglify'] ,function() {//revRewrite任务必须在htmlminify和cssVersionAdd任务之后执行
//     return gulp.src(['dist/**/*.json','asset/*.html'])
//         .pipe(revCollector({replaceReved: true}))//一定需要设置参数为true  否侧不会替换上一次的值
//         .pipe(rev())
//         // .pipe(htmlminify())
//         .pipe(gulp.dest('dist'))
//         .pipe(notify("success!!!"));
//   });
//
// //压缩合并js文件 <!--build:js js\bundle.min.js -->
// gulp.task('uglify',function(){
//     gulp.src('asset/js/*.js')
//         .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')})) // 错误提示
//         .pipe(concat('bundle.js'))       // 合并成bundle.js
//         .pipe(uglify())
//         // .pipe(rename({suffix: '.min'})) // 重命名.添加后缀
//         .pipe(rev())//给静态资源文件名添加hash值
//         .pipe(gulp.dest('dist/js'))
//         .pipe(rev.manifest())
//         .pipe(gulp.dest('dist/js'));
// });
//
// //压缩css并加版本号
// gulp.task('cssVersionAdd', function () {
//     var option = {
//         advanced: true,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
//         compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
//         keepBreaks: false,//类型：Boolean 默认：false [是否保留换行]
//         keepSpecialComments: '*'//保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
//     }
//     return gulp.src('asset/css/*.css')
//         .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')})) // 错误提示
//         .pipe(cssversion()) //给css文件里引用文件加版本号(文件MD5)
//         .pipe(cssMin(option))//css压缩
//         // .pipe(rename({ suffix: '.min' })) // 重命名,添加后缀
//         .pipe(rev())
//         .pipe(gulp.dest('dist/css'))
//         .pipe(rev.manifest())
//         .pipe(gulp.dest("dist/css"));
// });
//
// //压缩图片
// gulp.task('imageminify',function (){
//     var option = {
//         optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
//         progressive: false, //类型：Boolean 默认：false 无损压缩jpg图片
//         interlaced: false, //类型：Boolean 默认：false 隔行扫描gif进行渲染
//         multipass: false //类型：Boolean 默认：false 多次优化svg直到完全优化
//     }
//     gulp.src('asset/images/*.{png,jpg,gif,ico}')
//         .pipe(plumber({errorHandler:notify.onError('Error:<%= error.message %>')}))
//         .pipe(imagemin(option))
//         .pipe(gulp.dest('dist/images'));
// });
//
// gulp.task('dev',function(){
//    return runSequence(['imageminify'],['cssVersionAdd'],['uglify']);  //串行依次执行任务
//    // gulp.run(['htmlminify','imageminify','cssVersionAdd','revRewrite']);//最大程度的并行执行程序
// });
//
// gulp.task('default',['dev'],function(){
//     gulp.run(['revRewrite']);
//     return  console.log("全部任务完成");
// });
//
//  //语法检查
//  gulp.task('jshint', function () {
//     return gulp.src(['asset/js/*.js','!asset/js/*.min.js'])
//         .pipe(jshint())
//         .pipe(jshint.reporter('default'));
// });
//
// //使用gulp watch启动监听任务
// gulp.task('watch', function(){
//     // 监听 html
//     gulp.watch( 'asset/*.html' , ['revRewrite']);
//     // 监听 images
//     gulp.watch( 'asset/img/*.{png,jpg,gif,ico}' , ['imageminify']);
//     // 监听 js
//     gulp.watch( ['asset/js/*.js','!asset/js/*.min.js'] , ['uglify','revRewrite']);
//     // 监听 css
//     gulp.watch( 'asset/css/*.css' , ['cssVersionAdd','revRewrite']);
//     //监听js，进行语法检测
//     gulp.watch( 'asset/js/*.js' , ['jshint']);
// });