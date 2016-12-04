'use strict';
  /**
   * 网站全局对象maigouwang
   * 使用方法: maigouwang.***或maigouwang[***];
   */
;(function (ua, doc, undefined) {
  // var ua=navigator.userAgent,doc=document;
  // 定义全局对象
  function Obj() {
    // CNZZ事件统计
    this.cnzzId = this.isMobile() ? '5457725' : '5457725';
    this.cnzz = [
      ['_setAccount', this.cnzzId]
    ];

    // 获取当前时间
    this.now = new Date();
    // 当天24点，即明天0点
    this.tomorrow = new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() + 1);
    // 星期一到星期日分别对应数字1-7
    this.week = (this.now.getDay() + 6) % 7 + 1;
    // 工作时间：周一至周五早8点至晚8点
    this.worktime = this.now.getHours() > 7 && this.now.getHours() < 20 && this.week < 6;
  }

  // 添加原型链
  Obj.prototype = {

    /**
     * 生成随机数
     * @param  {Number} max 生成范围为1-max的随机数
     * @return {Number} 
     */
    rndnum: function (max) {
      return Math.floor(Math.random() * max + 1);
    },

    /**
     * 获得当前日期的中国星期序号（周一至周日分别为1-7而不是1-6和0）
     * 加6模7，即可将周日调到周六的后面，此时周一至周日为0-6
     * 直接取昨天的星期序号+1也可得到该结果，但比这个更麻烦
     * 如果需要返回中文的星期名称用：return "星期"+"天一二三四五六".charAt(new Date().getDay());
     */
    getWeek: function () {
      return (new Date().getDay() + 6) % 7 + 1;
    },

    /** 
     * 判断浏览器是否支持某一个CSS3属性 
     * @param {String} 属性名称 
     * @return {Boolean} true/false 
     */
    supportCss: function (style) {
      var prefix = ['webkit', 'Moz', 'ms', 'o'],
        i,
        humpString = [],
        htmlStyle = document.documentElement.style,
        _toHumb = function (string) {
          return string.replace(/-(\w)/g, function ($0, $1) {
            return $1.toUpperCase();
          });
        };
      for (i in prefix) {
        humpString.push(_toHumb(prefix[i] + '-' + style));
      }
      humpString.push(_toHumb(style));
      for (i in humpString) {
        if (humpString[i] in htmlStyle) {
          return true;
        }
      }
      return false;
    },

    /**
     * 图片懒加载方法
     * @param  {json} opt {time:500,space:'占位图片地址',error:'错误时的图片地址'}
     */
    lazyload: function (opt) {
      opt = opt || {};
      var time = opt.time || 500,
        supportCssStyle = this.supportCss('background-size');

      setInterval(function () {
        var count = 0;
        $('img[data-src]:visible').each(function () {
          // 变量定义 
          var _this = $(this),
            st = $(window).scrollTop(),
            ch = $(window).height(),
            ot = _this.offset().top,
            oh = parseInt(_this.height(), 10), // this.offsetHeight在火狐下不正常
            loading = opt.loading || false, // 设置载入的图片样式
            space = opt.space || (_this.attr('src') || 'images/space.gif'), // 图片占位
            errpic = opt.error || 'images/loading.gif'; // 错误图片地址        
          // 设置加载图片
          if(loading){
            _this.css('background','url(' + loading + ') no-repeat center center')
          }
          // 元素在当前浏览器窗口范围内
          if (ot < st + ch && ot + oh > st) {

            if (supportCssStyle) {
              _this.css({
                background: 'url(' + _this.data('src') + ') no-repeat center center',
                backgroundSize: 'cover' // 解决手机版封面图大小不一致的问题
              }).removeAttr('data-src');

              // 如果设置背景图片无法得知图片加载错误的清空
              var newImg = $(new Image());
              newImg.attr('src', _this.data('src'))
              newImg.error(function(){
                if (new RegExp(errpic).test(_this.attr('style'))) {
                  return false;
                }
                _this.attr('src', space).css({
                  background: '#eee url(' + errpic + ') no-repeat center center'
                });
              })
            } else {
              _this.attr('src', _this.data('src')).removeAttr('data-src');
            }
            // 图片出错操作
            _this.error(function () {
              if (new RegExp(errpic).test(_this.attr('style'))) {
                return false;
              }
              _this.attr('src', space).css({
                background: '#fff url(' + errpic + ') no-repeat center center'
              });
            });
          }
          count++;
        });
        // if(!count)clearInterval(set_lazyload);// window.onresize = window.onscroll = null;// 可见图片加载完毕后取消滚动事件
        // isscroll = 0;
      }, time);
    },

    /**
     * 简单cookie获取与设置
     * @param  {string} name  cookie设置或获取
     * @param  {string} value 设置cookie的值
     * @param  {string} opt    设置cookie的参数
     */
    cookie: function (name, value, opt) {
      // 变量获取
      opt = opt || {};
      var expires = '',
        d = new Date();
      if (typeof value !== 'undefined') {
        if (value === null) { opt.expires = -1; } // 删除
        if (opt.expires && (typeof opt.expires === 'number' || opt.expires.toUTCString)) {
          if (typeof opt.expires === 'number') { d.setTime(d.getTime() + (opt.expires * 24 * 60 * 60 * 1000)); } else { d = opt.expires; }
          expires = '; expires=' + d.toUTCString();
        }
        doc.cookie = [name, '=', encodeURIComponent(value), expires, opt.path ? ('; path=' + opt.path) : '', opt.domain ? ('; domain=' + opt.domain) : '', opt.secure ? '; secure' : ''].join('');
      } else {
        return decodeURIComponent(doc.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + name + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
      }
    },

    /**
     * 等高布局设置
     * @param obj1 jquery dom obj
     * @param obj2 jquery dom obj
     */
    equalLayout: function (obj1, obj2) {
      var obj1H = obj1.outerHeight(),
        obj2H = obj2.outerHeight();
      console.log(obj1H, obj2H);
      (obj1H > obj2H) ? (obj2.css('height', obj1H)) : (obj1.css('height', obj2H));
    },

    /**
     * addFavorite 加入收藏加
     * @param {string} url   添加到收藏夹的地址
     * @param {string} title 添加到收藏加的名称
     */
    addFavorite: function (url, title) {
      try {
        window.external.addFavorite(url, title);
      } catch (e) {
        try {
          window.sidebar.addPanel(title, url, '');
        } catch (e) {
          alert('加入收藏失败，请使用Ctrl+D进行添加');
        }
      }
    },

    /**
     * saveDesktop 保存到桌面
     * @param {string} url   保存到桌面的地址
     * @param {string} title 保存到桌面的名称
     */
    saveDesktop: function (url, title) {
      try {
        var WshShell = new ActiveXObject('WScript.Shell');
        var oUrlLink = WshShell.CreateShortcut(WshShell.SpecialFolders('Desktop') + '\\' + title + '.url');
        oUrlLink.TargetPath = url;
        oUrlLink.Save();
      } catch (e) {
        alert('当前IE安全级别不允许操作！');
      }
    },

    /**
     * setHome 设为首页
     * @param {[string]} obj 设置首页对象
     * @param {[string]} url 设置首页的地址
     */
    setHome: function (obj, url) {
      try {
        obj.style.behavior = 'url(#default#homepage)';
        obj.setHomePage(url);
      } catch (e) {
        if (window.netscape) {
          try {
            netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
          } catch (e) {
            alert('抱歉，此操作被浏览器拒绝！\n\n请在浏览器地址栏输入"about:config"并回车然后将[signed.applets.codebase_principal_support]设置为"true"');
          }
        } else {
          alert('抱歉，您所使用的浏览器无法完成此操作。\n\n您需要手动将【' + url + '】设置为首页。');
        }
      }
    },

    /**
     * loadjs 同步或异步方式加载js文件 opt:
     * @param  {[type]} src 加载js地址
     * @param  {[type]} opt  {charset,id,data,async:true} 默认同步输出
     */
    loadjs: function (src, opt) {
      opt = opt || {};
      if (opt.async) {
        var obj = doc.createElement('script');
        obj.src = src;
        obj.async = true;
        obj.type = 'text/javascript';
        if (opt.charset) { obj.charset = opt.charset; }
        if (opt.data) { obj.data = opt.data; }
        if (opt.id) { obj.id = opt.id; }
        (doc.head || doc.getElementsByTagName('head')[0] || doc.docElement).appendChild(obj);
      } else { doc.write('<script src="' + src + '"' + (opt.charset ? ' charset="' + opt.charset + '"' : '') + (opt.data ? ' data="' + opt.data + '"' : '') + (opt.id ? ' id="' + opt.id + '"' : '') + '></script>'); }
    },

    // 阅览器判断操作方法
    ie: function () {
      var undef, v = 3,
        div = document.createElement('div');
      while ( div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i>< ![endif]-->', div.getElementsByTagName('i')[0]
      ) {
        return v > 4 ? v : undef;
      }
    },

    /**
     * getJsonKey 获得json对象的key值 (目前只支持显示一条key)
     * @param  {[obj]} json json对象
     * @return {[string]} 返回当前json对象的key值
     */
    getJsonKey: function (json) {
      if (typeof (json) !== 'object') {
        return;
      }
      for (var key in json) {
        return key;
      }
    },

    /**
     * showOrder 展示次序js方法，按cookie中读到数字顺序。
     * @param  {[string]} name 保存顺序的cookie名
     * @param  {[number]} maxCount 最大的总顺序展示数
     * @param  {[number]} loop 循环方式(1:轮播完循环,2轮播完退出, 3轮播完后当天内重复最后1条)
     * @param  {[number]} rdStart 随机开始序号
     */
    showOrder: function (name, maxCount, loop, rdStart) {
      var prev = this.cookie(name) || 0, // 上一次显示的数字
        current = parseInt(prev, 10) + 1; // 本次要显示的数字

      if (current > maxCount) {
        if (loop === 1) { current = 1; } // 超过总数后再从第1个开始
        else if (loop === 2) {
          return;
        } else if (loop === 3) {
          current = maxCount;
          rdStart = 0;
        }
      }
      if (rdStart) { current = (current + rdStart > maxCount) ? (current + rdStart - maxCount) : (current + rdStart); }
      this.cookie(name, current, { expires: (this.tomorrow - this.now) / 36e5 }); // 记录下次显示的数字
      return current;
    },

    /**
     * floatAD 全站悬浮广告js
     * @param  {json} opt json对象
     * {
     *   mobile:[
     *    { "麦收wap悬浮": 'http:// u349036.778669.com/mediaController.php?pid=88541' },
     *    { "麦收wap悬浮": 'http:// u349036.778669.com/mediaController.php?pid=88541' }
     *   ], // 移动广告商配置
     *   pc:[
     *    {"六度富媒":'http:// u349036.778669.com/mediaController.php?pid=1六度富媒'},
     *    {"阅天下富媒|爱联盟对联":'http:// u349036.778669.com/mediaController.php?pid=3阅天下富媒|http:// u349036.778669.com/mediaController.php?pid=4爱联盟对联'}
     *   ], // PC广告商配置
     * }
     */
    floatAD: function (opt) {
      var arrAd = [];
      if (this.isMobile()) {
        arrAd = opt.mobile || [];
        if (/(iPhone|iPad|iPod)/ig.test(ua)) { arrAd = []; } // iOS单独处理
      } else {
        // PC版广告展示对联和富媒体数据间隔排列
        arrAd = opt.pc || [];
      }
      // 获得广告名称
      var len = arrAd.length;
      var objAd = arrAd[this.showOrder('floatAD', len, 1) - 1],
        name = this.getJsonKey(objAd),
        nameArr = name.split('|'),
        nameLen = nameArr.length - 1,
        url = objAd[name],
        urlArr = url.split('|'),
        urlLen = urlArr.length - 1;
      if (nameLen - urlLen > 0) { nameLen = urlLen; } // 解决人为填写数组对象不对称强制对称信息
      else if (nameLen - urlLen < 0) { urlLen = nameLen; }
      for (; nameLen >= 0; nameLen--) {
        this.cnzz.push(['_trackEvent', nameArr[nameLen], '悬浮广告', location.pathname.indexOf('.htm') ? '内容页' : '非内容页']);
        // 网站统计代码放在联盟广告之前只插入一次，防止漏统计
        if (nameLen === urlLen) { this.loadjs('http:// s6.cnzz.com/stat.php?id=' + this.cnzzId + '&web_id=' + this.cnzzId + '&show=none'); }
        if (/u\d{5,10}/.test(nameArr[nameLen])) {
          doc.writeln('<script>var cpro_id="' + nameArr[nameLen] + '";</script>');
        }
        this.loadjs(urlArr[nameLen]); // 载入广告
      }
    },

    /**
     * iframeAD iframe方式加载广告  默认同步输出
     * @param  {json} opt json对象
     * {
     *   url:'', 加载广告地址
     *   width:null, // iframe宽度
     *   height:null, // iframe高度;
     *   async:true // 异步写入或同步写入文档
     * }
     */
    iframeAD: function (opt) {
      var url = opt.url || '',
        w = opt.width || 0,
        h = opt.height || 0,
        async = opt.async || true;
      if (async) {
        var obj = doc.createElement('iframe');
        obj.src = url;
        obj.width = w;
        obj.height = h;
        obj.frameborder = 0;
        obj.scrolling = 0;
        (doc.body || doc.getElementsByTagName('body')[0] || doc.docElement).appendChild(obj);
      } else { doc.writeln('<iframe scrolling="no" frameborder="0" src="' + url + '" width="' + w + '" height="' + h + '"></iframe>'); }
    },

    /**
     * taobaoAD 淘宝橱窗广告
     * @param  {json} opt json对象
     * {
     *   id:'', // 必填广告位ID 如：11537196_4292743_21508094
     *   url:'http:// p.tanx.com/ex?i=mm_'
     *   charset:'gbk', // 默认为gbk;
     * }
     */
    taobaoAD: function (opt) {
      var id = opt.id,
        url = opt.url || 'http:// p.tanx.com/ex?i=mm_';
      charset = opt.charset || 'utf-8';
      doc.write('<a style="display:none!important" id="tanx-a-mm_' + id + '"></a>');
      this.loadjs(url + id, { charset: charset, id: 'tanx-s-mm_' + id, async: true });
    },

    /**
     * baiduAD 广告联盟广告
     * @param  {json} opt json对象
     * {
     *   id:'' // 百度提供的ID如: u954432,
     *   flag:'c', // c百度主题推广、cm度移动主题推广、f百度PC悬浮、uf百度搜索推荐、i百度PC图、mi百度移动图、dm百度移动防屏蔽; 
     *   api:null, // 是原生广告配置，留空则为普通广告
     *   url:null // 配置地址
     * }
     */
    baiduAD: function (opt) {
      var id = opt.id,
        url = opt.url || 'http:// cpro.baidustatic.com/cpro/ui/',
        flag = opt.flag || 'c',
        api = opt.api || {};
      window.cproStyleApi = window.cproStyleApi || {};
      switch (flag) {
        case 'c':
          doc.writeln('<script>var cpro_id="' + id + '";</script>');
          window.cproStyleApi[id] = api;
          this.loadjs(url + 'c.js');
          break;
        case 'cm':
          doc.writeln('<script>var cpro_id="' + id + '";</script>');
          window.cproStyleApi[id] = api;
          this.loadjs(url + 'cm.js');
          break;
        case 'f':
          doc.writeln('<script>var cpro_id="' + id + '"</script>');
          this.loadjs(url + 'f.js');
          break;
        case 'uf':
          doc.writeln('<script>var cpro_psid="' + id + '"</script>');
          this.loadjs('http:// su.bdimg.com/static/dspui/js/uf.js');
          break;
        case 'i':
          window.baiduImagePlus = {
            unionId: id,
            noLogo: true,
            formList: [{ formId: 2 }, { formId: 3 }, { formId: 4 }]
          };
          // doc.writeln('<script>var cpro_id="'+id+'"</script>');
          this.loadjs(url + 'i.js');
          break;
        case 'mi':
          window.baiduImagePlus = {
            unionId: id,
            noLogo: true,
            formList: [{ formId: 2 }, { formId: 3 }]
          };
          // doc.writeln('<script>var cpro_id="'+id+'"</script>');
          this.loadjs(url + 'i.js');
          break;
        case 'dm':
          var rd = '_' + Math.random().toString(36).slice(2);
          doc.write('<div id="' + rd + '"></div>');
          (window.slotbydup = window.slotbydup || []).push({
            container: rd,
            id: id,
            scale: api.scale || '20:3',
            display: api.display || 'inlay-fix'
          });
          break;
        default:
          console.log('没有广告');
      }
    },

    /**
     * 360AD 360联盟嵌入广告
     * @param  {json} opt json对象
     * {
     *   api:null, // 配置参数必填
     *   url:null // 配置地址喧天
     *   charset:'utf-8', // 默认为utf-8;
     * }
     */
    inlay360AD: function (opt) {
      var api = opt.api,
        url = opt.url || 'http:// s.lianmeng.360.cn/so/inlay.js';
      charset = opt.charset || 'utf-8';
      window.QIHOO_UNION_SLOT = api;
      this.loadjs(url, { charset: charset });
    },

    /**
     * sogouAD 搜狗广告
     * @param  {json} opt json对象
     * {
     *   id:'' // {String}搜狗广告提供的ID如: u954432,
     *   width:null, // {Number} 宽度
     *   height:null, // {Number} 高度;
     *   isfloat:null // {Boolean} 是否浮动
     *   canclose:null // {Boolean} 是否显示关闭按钮
     * }
     */
    sogouAD: function (opt) {
      var id = opt.id,
        w = opt.width || 20,
        h = opt.height || 3,
        isfloat = opt.isfloat || 0,
        canclose = opt.canclose || 1;
      doc.writeln('<script>var sogou_ad_id="' + id + '",sogou_ad_width=' + w + ',sogou_ad_height=' + h + ',sogou_ad_float=' + isfloat + ',sogou_ad_close=' + canclose + ';</script>');
      this.loadjs('http:// vjoz.lu.sogou.com/wap/js/wc.js');
    },

    /**
     * mobileShowPCAd 手机展示PC广告对其进行CSS3缩放操作
     */
    mobileShowPCAd: function () {
      $('.showAd').each(function () {
        var that = $(this),
          zoom = $(window).width() / that.width();
        that.css({
          transform: 'scale(' + zoom + ',' + zoom + ')',
          transformOrigin: '0 0',
          height: that.height() * zoom
        });
      });
    },

    /**
     * isMobile 判断是否为手机方法
     * @return {Boolean} 返回true false
     */
    isMobile: function () {
      var ua = ua || navigator.userAgent;
      // return location.host.substr(0,2)=='m.' || (screen.width/screen.height <1 || /AppleWebKit.*Mobile/i.test(ua) || /MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(ua)) && !(/ipad/gi.test(ua));// 判断是否手机用户，排除IPAD
      return (screen.width / screen.height < 1 || /AppleWebKit.*Mobile/i.test(ua) || /MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(ua)) && !(/ipad/gi.test(ua)); // 判断是否手机用户，排除IPAD
    },

    /**
     * deviceToggle 设备切换目前支持电脑版和移动端
     * @param  {boolean} bool 设备方式: true手机、falsePC…
     */
    deviceToggle: function (bool) {
      var href = location.href,
        hostname = location.hostname;

      this.cookie('isMobile', bool, {
        expires: 8760,
        domain: hostname.replace(/^(www|m)\.([0-9a-z\-]+\.[a-z]+)/i, '$2')
      });

      if (/^(www|m)\./i.test(hostname)) {
        if (bool) {
          href = href.replace('http:// www.', 'http:// m.');
        } else {
          href = href.replace('http:// m.', 'http:// www.');
        }
      }
      if (location.href !== href) {
        location.href = href;
      }
    },

    /**
     * stringToBoolean 字符串转换成boolean植
     * @param  {string}
     * @return {Boolean} 返回true false
     */
    stringToBoolean: function (string) {
      switch (string.toLowerCase()) {
        case 'true':
        case 'yes':
        case '1':
          return true;
        case 'false':
        case 'no':
        case '0':
        case null:
          return false;
        default:
          return Boolean(string);
      }
    }

  };

  // 返回全局对象
  window.maigouwang = window.G = new Obj();
  /*===========================
  common CMD AMD export
  ===========================*/
})(navigator.userAgent, document);

if (typeof (module) !== 'undefined') {
  module.exports = window.maigouwang;
} else if (typeof define === 'function' && define.amd) {
  define([], function () {
    'use strict';
    return window.maigouwang;
  });
}
