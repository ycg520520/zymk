let gulp = require('gulp'),
    $ = require('gulp-load-plugins')(), //自动加载gulp开头的插件
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload, // 刷新阅览器
    webpack = require('webpack'), // webpack对js进行打包
    gulpWebpack = require('webpack-stream'),
    webpackConfig = require('./webpack.config.js'); // webpack配置文件

// 全局配置
const config = {
  // 路径配置不能以./开头，否则不能时时监控到新曾文件的编译
  src: 'src/',
  sass: 'src/static/sass/**/*.scss', // sass文件
  fonts: 'src/static/sass/fonts/*.{eot,svg,ttf,woff}', // 字体文件
  js: 'src/static/js/**/*.{js,coffee}', // js文件
  images: 'src/static/images/**/*.{jpg,png,gif,svg}', // 多文件支持
  upload: 'src/upload/**/*.{jpg,png,gif}', // 多文件支持
  html:'src/app/**/*.{htm,html,shtm,shtml,ico,txt}', // 多文件支持
  dist: 'dist/',
  // 入口配置
  entry:{
    port: process.env.port || 3000,
    html: 'index.html',
    js: 'main.js'
  }
}

// sass文件编译和相关配置 图片压缩必须在sass编译前完成
gulp.task('sass:build',() => {
  return gulp.src(config.sass)
    .pipe($.sourcemaps.init()) // 生产soucrcemap
    .pipe($.sass())
    .on('error', $.sass.logError)
    .pipe($.autoprefixer('last 2 version')) // 自动处理阅览器厂商前缀
    .pipe($.sourcemaps.write('.')) // 将sourcemaps写在当前目录下
    .pipe($.changed(config.dist+'static/css',{hasChanged: $.changed.compareSha1Digest})) // 只取发生改变的文件
    .pipe(gulp.dest(config.dist+'static/css'))
    .pipe($.notify({message: 'sass文件编译css完成!'})) // 编译提示信息
});

// 将图片拷贝到目标目录并做压缩处理
gulp.task('images:copy', () => {
  return gulp.src(config.images)
    .pipe($.imagemin())
    .pipe($.changed(config.dist+'static/images',{hasChanged: $.changed.compareSha1Digest})) // 只对发生改变的文件进行编译操作
    .pipe(gulp.dest(config.dist+'static/images')) // 写入图片
    .pipe($.notify({message:'images图片压缩处理完成!'})) // 编译提示信息
});
gulp.task('upload:copy', () => {
  return gulp.src(config.upload)
    .pipe($.imagemin())
    .pipe($.changed(config.dist+'upload',{hasChanged: $.changed.compareSha1Digest})) // 只对发生改变的文件进行编译操作
    .pipe(gulp.dest(config.dist+'upload')) // 写入图片
    .pipe($.notify({message:'upload图片压缩处理完成!'})) // 编译提示信息
});

// webpack对js进行打包压缩操作
gulp.task('js:webpack', () => {
  return gulp.src(config.js)
    .pipe($.changed(config.dist+'static/js',{hasChanged: $.changed.compareSha1Digest}))
    .pipe(gulpWebpack(webpackConfig))
    .pipe(gulp.dest(config.dist+'static/js')) // 写入图片
  /*webpack(webpackConfig, (err, stats) => {
    if(err){ throw new $.util.PluginError("webpack:build-js", err);}
    $.util.log("[webpack:build-js]", stats.toString({
        colors: true
    }));      
  });*/
});

// html文件操作必须是是在sass编译后执行
gulp.task('html:copy', () => {
  return gulp.src(config.html)
    .pipe($.changed(config.dist+'app')) // 只取发生改变的文件
    .pipe(gulp.dest(config.dist+'app'))
    .pipe($.notify({message:'html拷贝完成!'})) // 编译提示信息
})

// 处理字体
gulp.task('fonts:copy', () => {
  return gulp.src(config.fonts)
    .pipe($.changed(config.dist+'static/css/fonts',{hasChanged: $.changed.compareSha1Digest}))
    .pipe(gulp.dest(config.dist+'static/css/fonts'))
    .pipe($.notify({message:'字体文件处理完毕!'})) // 编译提示信息
});

// 监听文件变化并执行对应的task
gulp.task('watch', () => {
  // 监听原始文件
  gulp.watch(config.sass, ['sass:build']); // 监听sass文件变化
  gulp.watch(config.fonts, ['fonts:copy']); // 监听fonts文件变化
  gulp.watch(config.images, ['images:copy']); // 监听images文件变化
  gulp.watch(config.upload, ['upload:copy']); // 监听images文件变化
  gulp.watch(config.html, ['html:copy']); // 监听html文件变化
  gulp.watch(config.js, ['js:webpack']); // 监听js文件变化
  
})

// 服务器连接操作
gulp.task('server',['sass:build','html:copy','fonts:copy','images:copy','upload:copy','js:webpack'], () => {
  browserSync.init({
    server: config.dist, // 静态服务路径
    // proxy: "http://localhost:9000", // 代理服务路径
    files: [config.dist + '**'],
    // startPath:'app', // 开始路径
    // browser: 'google chrome', // 打开阅览器
    notify: false,
    port: config.entry.port
  }, () => {
    console.log('阅览器刷新了!')
  });

  // 监听所有位在dist目录下的文件，一旦有更动，便进行重启服务器后刷新阅览器
  gulp.watch([config.dist + '**']).on('change', reload); 
});

// 清理操作
gulp.task('clean', () => {
  return gulp.src(config.dist)
    .pipe($.clean())
    .pipe($.notify({message:'dist目录删除完毕!'}));
});

// 构建开发时默认的任务
gulp.task('default',['server','watch']);
