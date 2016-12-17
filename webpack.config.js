const path = require('path'),
  fs = require('fs'),
  webpack = require('webpack');

const srcDir = path.resolve(process.cwd(), 'src');

/**
 * 获取多页面的每个入口文件，用于配置中的entry
 * 注意在同一层级产生产生的数组
 */
function getEntry() {
  var jsPath = path.resolve(srcDir, 'static/js');
  var dirs = fs.readdirSync(jsPath);
  var matchs = [],
    files = {};
  dirs.forEach(function(item) {
    matchs = item.match(/(.+)\.js$/);
    // console.log(matchs);
    if (matchs) {
      files[matchs[1]] = path.resolve(srcDir, 'static/js', item);
    }
  });
  return files;
}

var entres = getEntry();
    entres.common=['jquery','cookie','placeholder','swiper','layer','base','common','json2','scrollbar','config']; // 公共文件打包

module.exports = {
  cache: true,
  devtool: 'source-map',
  entry: entres,
  output: {
    path: path.join(__dirname, 'dist/static/js'),
    publicPath: 'js/',
    filename: '[name].js',
    chunkFilename: '[id].[chunkhash].js',
    // umdNamedDefine:true,
    // libraryTarget: 'umd'
  },
  resolve: {
    alias: {
      jquery: srcDir + '/static/js/plugins/jquery.js',
      cookie: srcDir + '/static/js/plugins/jquery.cookie.js',
      placeholder: srcDir + '/static/js/plugins/jquery.placeholder.min.js',
      layer: srcDir + '/static/js/plugins/layer/layer.js',
      // swiper: srcDir + '/static/js/plugins/swiper.js',
      // swiper: srcDir + '/static/js/plugins/swiper2.js',
      swiper: srcDir + '/static/js/plugins/jquery.superslider.js',
      chosen : srcDir + '/static/js/plugins/chosen.jquery.js',
      icheck : srcDir + '/static/js/plugins/icheck.js',
      validform: srcDir + '/static/js/plugins/validform/validform_v5.3.2.js',
      // lazyload: srcDir + '/static/js/plugins/jquery.lazyload.js',
      json2: srcDir + '/static/js/plugins/json2.js',
      scrollbar: srcDir + '/static/js/plugins/scrollbar.js',
      base: srcDir + '/static/js/models/base.js',
      common: srcDir + '/static/js/models/common.js',
      config: srcDir + '/static/js/models/config.js',
      // pseudo: srcDir + '/static/js/plugins/jquery.pseudo.js', // 让ie678支持before,after插件
    }
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        include: path.resolve(srcDir, 'static/js'),
        exclude: /(node_modules|plugins|bak)/
      }
    ],
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   }
    // }),
    new webpack.ProvidePlugin({
      // $: "jquery",
      // jquery: "jquery",
      // jQuery: "jquery",
      // 'window.jQuery': "jquery",
      // 'layer':'layer',
      // 'Swiper':'swiper'
    }),
    // new webpack.optimize.CommonsChunkPlugin('vendor'),
    new webpack.optimize.CommonsChunkPlugin({name:'common'}),
  ]
};
