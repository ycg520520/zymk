/**
 * 功能说明:
 * 01、阅读模式支持切换：单击、双击、连续模式
 * 02、支持一次预加载多张图片，数量在json对象中配置
 * 03、图片下载出错或超时能自动切换线路，并且可手动重载图片
 * 04、支持用户通过测试网速选择最快的线路
 * 05、支持常用翻页热键，支持鼠标右键点击图片时翻到上一页（非连续模式下）
 * 06、能同时支持鼠标左右键拖拽图片
 * 07、支持+-0键缩放图片（兼容小键盘）
 * 08、页面内容区域为浏览器宽度的75%，最小宽度或IE6下为960px
 * 09、反馈及测速功能采用按需加载的方式，减少默认代码加载量
 * 10、章节末尾显示提示页，体验更好，且能增加1个PV
 * 11、连续模式支持插入图间广告
 * 12、章节阅读页码记录整合到漫画阅读记录，避免cookie过大
 * 13、连续模式使用定时器加载图片，并限制同一时间只能加载一张图片
 * 14、当前浏览的图片如果还未预加载完，将取消其预加载线程，避免同时2个线程加载1张图片，浪费带宽
 * 15、重载图片时将之前未加载完的图片线程取消，避免同时2个线程加载1张图片，浪费带宽
 * 16、线路列表未请求到时将默认用域名调用图片，不会卡住页面
 * 17、已预加载的图片，切换线路后，该图片还是继续用之前预加载的URL
 * 18、图片路径加密防采集
 *
 * cookie名:
 * thispage   当前页码设置在阅读记录里面
 * linelist   线路列表
 * thisline   当前线路
 * readmode   阅读模式
 * urecord    阅读记录
 *
 * 子域名:
 * server     用于获取线路
 * mhpic     未获取到线路时默认线路

 * css类名:
 * headpage  顶部页码
 * footpage  底部页码
 * headpage,footpage
 * ├─ prevbook  上一章
 * ├─ nextbook  下一章
 * ├─ prevpage  上一页
 * ├─ nextpage  下一页
 * └─ select    下拉选择
 * comiclist  装载全部图片的容器
 * ├─ comicpage  装载单页图片的容器
 * │  ├─ loading  正在加载
 * │  ├─ comicimg  图片样式
 * └──└─ readmode  切换阅读模式
 * 
 */
;(function(win, doc, globalName) {
  function Obj() {
    // timeout是图片加载超时时间
    this.timeout = 10000;
    this.mhpic = 'mhpic';
    this.imagesArrOffserTop = [];
    // 解码路径方法配合后端加密方式：后端对字符串做加，前端做减
    // mh_info.imgpath = mh_info.imgpath.replace(/./g,function(a){return String.fromCharCode(a.charCodeAt(0)-mh_info.pageid%10)});
    // 加密后的 window.prompt = __cr.charcode;
    this.crypt = 'w1355i56n63d6464o7267w8786.65p786r8579o95m98p00t31='+globalName+'.54c54h34a55r78c89o98d97e97';
    // this.decode 字符串获得是通过下面方法获得，根据需求业务变化字段调用方法getChartcode重新生成。
    // this.decode = this.getCharcode(globalName+'.imgpath=' + globalName +'.imgpath.replace(/./g,function(a){return String.fromCharCode(a.charCodeAt(0)-'+ globalName +'.chapter%10)})');
    // console.log(globalName+'.imgpath=' + globalName +'.imgpath.replace(/./g,function(a){return String.fromCharCode(a.charCodeAt(0)-'+ globalName +'.chapter%10)})')
    // console.log(this.getCharcode(globalName+'.imgpath=' + globalName +'.imgpath.replace(/./g,function(a){return String.fromCharCode(a.charCodeAt(0)-'+ globalName +'.chapter_id%10)})'))
	
    this.decode = '``ds/jnhqbui>``ds/jnhqbui/sfqmbdf)0/0h-gvodujpo)b*|sfuvso!Tusjoh/gspnDibsDpef)b/dibsDpefBu)1*.``ds/dibqufs`je&21*~*';
  };
  Obj.prototype = {
    /**
     * 简单cookie获取与设置
     * @param  {string} name  cookie设置或获取
     * @param  {string} value 设置cookie的值
     * @param  {string} opt  设置cookie的参数
     */
    cookie: function(name, value, opt) {
	  // 变量获取
      opt = opt || {};
      var expires = '',
        d = new Date();
      if (typeof value !== 'undefined') {
        if (value === null) { opt.expires = -1; } //删除
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
     * [limitStore 有限制的存储数组数据]
     * @param  {[String]} name [存储数据的名称]
     * @param  {[Array]} data [存储数据]
     * @param  {[Object]} opt  [始终相关配置 {limit:限制数据长短, expires:过期时间对cookie} ]
     * @return {[type]}    [数据字符串]
     */
    limitStore: function(name, data, opt) {
      // 记录cookie 客户端只记录最新的50条数据，服务端才记录完整数据
      var isLocalStorge = (typeof localStorage === 'object');
      var isSave = (data !== undefined);

      if (isSave || isSave === null) {
        if ($.isArray(data)) {
          var limitSaveLen = opt.limit || (isLocalStorge ? 50 : 20);
          var dataLen = data.length;
          // 数据处理限制存储最长数组长度
          if (dataLen > limitSaveLen) {
            data.splice(limitSaveLen, dataLen - 1);
          }
        } else {
          layer.msg('数据格式不是有效的数组格式');
          return null;
        }

        var strData = JSON.stringify(data);
        if (isLocalStorge) {
          if (isSave === null) {
            localStorage.removeItem(name); // 删除某一项数据
          } else {
            localStorage.setItem(name, strData);
          }
        } else {
          this.cookie(name, strData, opt);
        };
      } else {
        // 获得数据
        if (isLocalStorge) {
          return JSON.parse(localStorage.getItem(name));
        }
        return JSON.parse(this.cookie(name));
      }
    },
    setInitData: function (data){
      this.data = data;
      this.domain = data.domain;
      this.start_var = data.start_var;
      this.end_var = data.start_var>data.end_var?data.start_var:data.end_var;
      this.totalPage = this.end_var - this.start_var + 1;
      this.comic_id = data.comic_id;
      this.comic_name = data.comic_name;
      this.chapter_id = data.chapter_id;
      this.chapter_name = data.chapter_name;
      this.nextid = data.nextid;
      this.nextname =data.nextname;
      this.imgpath = data.chapter_addr || '';
      this.isloading = true;

      
      // 下载超时10秒以后显示错误
      this.showerr = [];
      this.curpage = this.getReadPage(); // 获得页码
      // 默认的阅读模式 1单击 2双击 3连续
      this.readmode = (parseInt(this.cookie('readmode'), 10) || data.readmode || 1);
      this.defaultminline = data.defaultminline || 1;
      this.maxpreload = data.maxpreload || 2;

      // cookie相关
      this.curlineName = 'thisline'; // 当前线路存储cookie名字
      this.linelistName = 'linelist'; // 当前线路存储cookie名字
      this.readmodeName = 'readmode';

      // 设置当前页码
      $('.pages-num strong').text(this.curpage);
      $('.pages-num .total-pages').text(this.totalPage);
    },
    // 阻止阅览器加载(未下完的图片)
    stopLoading: function() {
      win.stop ? win.stop() : doc.execCommand('Stop');
    },
    cssCore: function(testCss) {
      switch (true) {
        case testCss.webkitTransition === '':
        return 'webkit'; break;
        case testCss.MozTransition === '':
        return 'Moz'; break;
        case testCss.msTransition === '':
        return 'ms'; break;
        case testCss.OTransition === '':
        return 'O'; break;
        default:
        return '';
      }
    }(doc.createElement('view').style),
    isIE: function(ua) {
      return ua.indexOf('MSIE') !== -1;
    }(navigator.userAgent),
    osHeight: doc.documentElement.clientHeight || win.innerHeight,
    fullscreen: function() {
      var _this = this;
      var body = doc.body || doc.getElementsByTagName('body')[0];
      if (!(_this.cssCore && !_this.isIE)){
        layer.msg('浏览器不支持 请按F11进入全屏模式');
      }else{
        var _cssCore = _this.cssCore.toLowerCase();
        var requestFullScreen = _cssCore === 'ms' ? 'msRequestFullscreen' : _cssCore + 'RequestFullScreen',
          cancelFullScreen  = _cssCore === 'ms' ? 'msExitFullscreen' : _cssCore + 'CancelFullScreen';
        if (doc[_cssCore + 'FullScreen'] || doc[_cssCore + 'IsFullScreen'] || doc['msFullscreenElement']) {
            doc[cancelFullScreen]();
        } else {
          body[requestFullScreen]();
        }
        var fullMode = _this.osHeight >= win.screen.height - 2;
        var $body = $('body');
        if(fullMode || !$body.hasClass('fullscreen')) {
          $body.addClass('fullscreen');
        } else {
          $body.removeClass('fullscreen');
        }
        
      }
    },
    // 获得用户阅读页码
    getReadPage: function() {
      var _this = this;
      var tempObj = _this.limitStore('urecord'),
        page = 1;
      if (!tempObj) {
        return page;
      }
      $.each(tempObj, function(i, v) {
        // 找到用户预读记录中是否有当前的漫画对应的阅读信息
        // 格式 ：[0:id, 1:name, 2:readid, 3:readname, 4:readtime, 5:readpage, 6:nextid, 7:nextname]
        if (v[0] == _this.comic_id && v[2] == _this.chapter_id && v[5]) {
          page = parseInt(v[5]);
          return false; //跳出循环
        }
      });

      return page;
    },

    // 设置阅读记录
    setRecord: function() {
      // [漫画ID,漫画名,章节url,章节名,阅读时间,章节页码]
      // 格式 ：[0:id, 1:name, 2:readid, 3:readname, 4:readtime, 5:readpage, 6:nextid, 7:nextname]
      var _this = this;
      var p = _this.curpage;

      // 连续模式看到最后一页时将页码置为0表示已看完本章节
      if (p == _this.totalPage && _this.readmode == 3) {
        p = 0;
      }
	  // console.log(p)
      // 组装阅读漫画记录
      var readRecordArr = [_this.comic_id, _this.comic_name, _this.chapter_id, _this.chapter_name, new Date().getTime(), p, _this.nextid, _this.nextname];

      var loaclData = _this.limitStore('urecord') || [];
      if (loaclData.length) {
        // 查询是否存在当前要添加的记录
        $.each(loaclData, function(key, value) {
          // 存在相同的记录将此记录删除在后面的方法中将其置入到数组的最前面
          if (value[0] == readRecordArr[0]) {
            loaclData.splice(key, 1); // 删除存在的数据
            return false; // 删除数组后并跳出循环
          }
        });
      }

      loaclData.splice(0, 0, readRecordArr); // 将当前数组插到记录素组的最前面
	  /*
	  设置阅读记录不能随时都提交
	  var opt = __global.getLoginInfo(true);
	  var url = __global.config.api + 'adduserread/'
	  if(opt){
		opt.comic_id = _this.comic_id;
		opt.chapter_id = _this.chapter_id;
		opt.readpage = p;
		opt.readtime = new Date().getTime();
		console.log(opt)
		$.post(url, opt, function(res) {
		  if (res.status === 0) {
			// 重新设置cookie, 失效时间一年
			__global.limitStore('urecord', loaclData, {expires: 8760});
		  }
		},'json').fail(function(res){
		  layer.msg('服务器操作失败, 稍后我们会自动为您同步到服务器!');
		});
	  }else{
		  */
		_this.limitStore('urecord', loaclData, {
		  expires: 8760
		}); // 失效时间一年

	  //}
	  
    },

    // 跳转页码
    goPage: function(page) {
      var _this = this;
      $(win).scrollTop(0); // 回顶部
      // console.log(page)
      if (page == 'next') {
        page = _this.curpage + 1;
      }

      if (page == 'prev') {
        page = _this.curpage - 1;
      }
      // 将字符串转数字，否则后面要出错
      page = parseInt(page, 10);

      if (page < 1) {
        layer.msg('已经是第一页了', {btn: ['知道了']});
        return false;
      }
      if (page > _this.totalPage) {
        // layer.msg('已经是最后一页了', {btn: ['知道了']});
        layer.open({
          type: 1,
          title: false,
          closeBtn: '<a class="layui-layer-close readend-close">&times;</a>',
          area:['auto', 'auto'],
          content: $('#readEnd') //捕获的元素
        });
        return false
      }

      _this.curpage = page;
      _this.setRecord();

      location = location.pathname + location.search;
      return false;
    },

    // 重载图片，但不刷新页面
    reloadPic: function(obj, page) {
      var _this = this;
      _this.stopLoading();
      var parents = $(obj).parents('.loaderr');
      parents.siblings('img').attr('src', _this.getPicUrl(page));
      parents.hide(); // 隐藏错误提示

      //重新开始计时
      _this.showerr[page] = setTimeout(function() {
        _this.imgOnError(page);
      }, _this.timeout);
      return;
    },

    // 测速
    speedTest: function(e, p) {
      var _this = this;
      // 调用线路测试js可通过异步加载speedtest.js来操作
      if (!$('.mod-speedtest').length) {
        $.ajax({
          url: 'http://feedback.yyhao.com:6117/static/speedtest.js',
          dataType: 'script',
          scriptCharset: 'utf-8'
        });
        setTimeout(function() {
          _this.speedTest(e, p)
        }, 1000);
      } else {
        __st.init(e, '/comic/' + _this.imgpath + (p + _this.start_var - 1) + '.jpg?' + new Date().getTime());
      }
    },

    // 获得线路列表，保存当前使用的线路，并检查该线路是否失效
    saveLine: function(linedata) {
      var _this = this;
      var ld = [];
      // 将lineData转换成数组挂载到globalName上
      try{
        ld = JSON.parse(linedata);
      }catch(e){
        ld = eval(linedata); // 解决数据不规范导致JSON.parse不能解析成功
      }

      var line = _this.cookie(_this.curlineName);
      if (!line || linedata.indexOf(line) == -1) {
        // 当前线路保存6分钟，如果defaultminline为真，则默认使用负载最小的线路，否则默认使用mhpic线路
        _this.cookie(_this.curlineName, _this.defaultminline ? ld[0][0] : _this.mhpic+ '.' + this.domain, {
          expires: 0.1
        });
      }

      if (!_this.cookie(_this.linelistName)) {
        // 线路列表保存12分钟
        _this.cookie(_this.linelistName, linedata, {
          expires: 0.2
        });
      }
      
      _this.linelist = ld; // 设置线路数据存储
      _this.curline = _this.cookie(_this.curlineName); // 当前线路
    },

    // 获得图片地址，参数p是页码，整型
    getPicUrl: function(page) {
      var curline = this.curline || this.mhpic+ '.' + this.domain; //使用线路
      if (curline.indexOf(this.mhpic) == -1) {
        curline += ':82'; // 用IP访问时才带端口，防止移动DNS污染
      }
      var filename = (page + this.start_var - 1) + '.jpg-w1000'; // 图片文件名
      return 'http://' + curline + '/comic/' + this.imgpath + filename;
    },

    // 按页码p显示对应的漫画图片
    showPic: function(p) {
      var _this = this;
      // 阅读到最后一页，页码为0时的情况
      p = p || _this.curpage || 1;
      var oComicList = $('.comiclist');

      if (p > _this.totalPage) { // 显示章节最后提示内容
        _this.curpage = 0;
        _this.setRecord(); // 将页码归0表示已看完本章节
        layer.open({
          type: 1,
          shade: false,
          title: false, //不显示标题
          content: $('#readEnd') // 捕获的元素
        });

      } else {

        // 连续模式将所有img提前输出
        var _totalimg = _this.readmode == 3 ? _this.totalPage : p;
        var str = '';
        for (var i = p; i <= _totalimg; i++) {
          var src =
            str += '<div class="comicpage" data-page="' + i + '"><img ' + (i == p ? 'src="' + _this.getPicUrl(p) + '"' : 'd') + ' class="comicimg" data-img="' + i + '"><p class="page-info">第 ' + i + ' 页/共 ' + _this.totalPage + ' 页</p><div class="loading">服务器君正在努力载入图片，请稍候...</div><div class="loaderr"><h3 class="title">已长时间未能载入图片，您可以：</h3><p><span onclick="' + globalName + '.reloadPic(this, ' + i + ')" class="btn">重载图片</span> <span class="btn contact">反馈报错</span> <span onclick="' + globalName + '.speedTest(this,' + i + ')" class="btn">网速测试</span></p></div></div>';
        }
        doc.writeln(str);

        $('.loaderr').hide(); // 隐藏所有错误提示
        $('.loading:gt(0)').hide(); // 只保留第一张图的加载提示，其他都隐藏

        _this.showerr = []; // 下载超时10秒以后显示错误
        _this.showerr[p] = setTimeout(function(){
          _this.imgOnError(p);
        }, _this.timeout);

        if (_this.readmode == 3) {
		  $(function(){
			  $('.footpage .prevpage,.footpage .nextpage').hide();
			  // 连续模式将章节最后提示显在最后
			  $('#readEnd').show().css({margin:'0 auto'});
		  });
          _this.isloading = true; // 防止第1张图未加载完时第2张图开始加载，导致第1张图不显
          _this.lazyloadTimer = setInterval(function(){
            _this.lazyLoad();
          }, 200);
        } else {
		  $(function(){
		    $('.footpage .prevbook,.footpage .nextbook').hide();
		  });
          clearInterval(_this.lazyloadTimer);
        }

        _this.bindEvent(); // 事件处理
      }
    },
    // 图片加载失败或超时
    imgOnError: function(page) {
      var _this = this;
      var obj = $(this);
      _this.isloading = false; // 没有图在加载了
      // 由img标记触发的onerror事件
      if (obj.is('img')) {
        obj.siblings('.loading').hide();
        obj.siblings('.loaderr').show();
      } else { //由定时器触发的加载超时事件
        $('[data-page=' + page + '] .loading').hide();
        $('[data-page=' + page + '] .loaderr').show();
      }

      // 漫画图片加载不到或加载太慢，自动切换到当前线路的下一条线路
      if (!_this.linelist) {
        return false;
      }
      var findline = _this.linelist.length - 1; //找不到当前线路时默认第1条线路
      $.each(_this.linelist, function(i) {
        if (_this.linelist[i][0] == _this.curline) {
          findline = i; // 找到了当前线路所在位置
          return false;
        }
      });
      _this.curline = _this.linelist[(findline + 1) % _this.linelist.length][0];
      _this.cookie(_this.curlineName, _this.curline, {expires: 0.1});
    },

    // 图片加载成功并预加载下一页
    imgOnLoad: function(that) {
      var _this = this; // 全局调用
      _this.isloading = false; // 没有图在加载了
      that = $(that);
      that.siblings('div').remove(); // 将加载和错误提示移除

      var page = parseInt(that.parent().data('page'), 10); //获得页码
      _this.curpage = page;
      _this.setRecord();

      // 新增加图片页码对应位置 开始
      /*var imagesArrOffserTop = _this.imagesArrOffserTop || [];
      var isFlagImg = false;
      if(imagesArrOffserTop.length){
        $.each(imagesArrOffserTop, function(i, v) {
          if(page === v.page) {
            imagesArrOffserTop[i] = {
              page: page,
              offsetTop: that.offset().top
            }
            isFlagImg = true;
            return false;
          }
        })
      }
      if(!isFlagImg){
        var tmp = {
          page: page,
          offsetTop: that.offset().top
        };
        imagesArrOffserTop.push(tmp);
      }*/
      // 新增加图片页码对应位置 结束

      $('.selectpage').val(page);
      clearTimeout(_this.showerr[page]); // 将未超时的定时器清除
      _this.preLoadImg(page + 1);
    },

    // 预加载图片
    preLoadImg: function(page) {
      var _this = this;
      // 当前章节总页码
      if (page > this.totalPage) {
        return;
      }
      _this.preloader = _this.preloader || []; //设置前置加载图片数组
      _this.preloader[page] = new Image();

      if (page < _this.curpage + this.maxpreload) {
        _this.preloader[page].onload = function() {
          _this.preLoadImg(page + 1)
        };
      }
      _this.preloader[page].src = _this.getPicUrl(page);
    },

    // 连续模式下图片被点击时设置页码(兼容移动端)
    imgOnTouch: function(that) {
      var _this = this;
      // 获得页码
      var page = parseInt($(that).parent().data('page'), 10);
      _this.curpage = page;
      _this.setRecord();
      $('.selectpage').val(page);
    },

    // 解密字符串方法
    charcode: function(x){
      new Function(x.replace(/./g, function(a){
        return String.fromCharCode(a.charCodeAt(0) - 1);
      }))();
    },
    // 加密字符串方法
    getCharcode: function(str) {
      return str.replace(/./g,function(a){
        return String.fromCharCode(a.charCodeAt(0) + 1);
      });
    },

    // 连续模式下用懒加载的方式设置src
    lazyLoad: function() {
      var _this = this;
      if (_this.isloading) {
        return false; // 已有图片正在加载
      }
      var oImg = $('.comicpage img[d]'),
        st = $(win).scrollTop(),
        ch = $(win).height();

      oImg.each(function() {
        var that = $(this);
        var ot = that.offset().top,
          oh = that.height(); //this.offsetHeight在火狐下不正常
        if (ot < st + ch + 100 && ot + oh > st) { //元素在当前浏览器窗口范围内,+100是不希望网友看到图片闪出看来
          var p = parseInt(that.parent().data('page'), 10);
          // 停止所有图片加载，否则将继续占用带宽
          _this.stopLoading();

          if (_this.preloader && _this.preloader[p]) {
            this.src = _this.preloader[p].src;
          } else {
            // 预加载过的图片就算切换了线路，显示时用之前已预加载的图片URL，避免重新加载
            this.src = _this.getPicUrl(p);
          }

          _this.showerr[p] = setTimeout(function(){
            _this.imgOnError(p);
          }, _this.timeout);

          this.removeAttribute('d');

          that.siblings('.loading').show();
          // 开始加载后，阻止后续图片同时加载，直到本图onload或onerror
          _this.isloading = true;

          return false; //跳出循环
        }
        ot = oh = null;
      });
      if (!oImg.length) {
        // 可见图片加载完毕后取消定时器
        clearInterval(_this.lazyload);
      }
    },

    //热键和点击事件处理
    bindEvent: function() {
      var oImg = $('.comicpage .comicimg'),
        mouseX=0, mouseY=0, oWin = $(win);
      var _this = this;

      //绑定加载完成和失败事件,用attr增加error事件避免jquery执行2次的BUG
      oImg.on('load', function(){
        _this.imgOnLoad(this);
      }).attr('onerror', globalName + '.imgOnError()');

      //点击图片
      if (_this.readmode == 3) {
        oImg.on('touchstart click', function(){
          _this.imgOnTouch(this)
        }); //点击图片时设置页码(兼容移动端)

      } else {
        oImg.on(_this.readmode == 1 ? 'click top' : 'dblclick', function() {
          if (!_this.draging) {
            _this.goPage('next');
          }
        });
      }

      if (!win.isMobile) {
        //拖拽图片
        oImg.on('mousedown', function(event) {
          mouseX = event.pageX;
          mouseY = event.pageY - oWin.scrollTop();
          _this.dragFn(this, event);
          return false;
        });

        //通过鼠标坐标位移判断图片是否被拖拽了
        oImg.on('mouseup', function(e) {
          if (Math.abs(e.pageX - mouseX) > 20 || Math.abs(e.pageY - oWin.scrollTop() - mouseY) > 20) {
            _this.draging = true;
          } else {
            _this.draging = false;
          }
          if (e.which == 3 && _this.readmode != 3 && !_this.draging) {
            _this.goPage('prev'); // 右键上一页
          }
          return false;
        });

        //绑定热键
        $(doc).on('keydown', function(e) {
          // 连续模式或留言时禁用热键
          if (_this.readmode == 3 || $('#J_feedback:visible').length) {
            return;
          }
          var new_w = oImg.width(); //图片最大不超过浏览器窗口，兼容IE6
          if (e.keyCode == 65 || e.keyCode == 37){
            _this.goPage('prev'); // A键或左方向键上一页
          } else if (e.keyCode == 68 || e.keyCode == 39){
            _this.goPage('next'); // D键或右方向键下一页
          } else if (e.keyCode == 86){
            $('html, body').animate({scrollTop: 0}, 1000); // V键回顶部
          }else if (e.keyCode == 107 || e.keyCode == 187) { // +键(包括小键盘)放大
            new_w += 100; //图片最大不超过浏览器窗口，兼容IE6
            if (new_w > oWin.width()) {
              oImg.width(oWin.width());
            } else {
              oImg.width(new_w);
            }
          } else if (e.keyCode == 109 || e.keyCode == 189) { //-键(包括小键盘)缩小
            new_w -= 100; //图片最小不能小于320，兼容IE6
            if (new_w < 320) {
              oImg.width(320);
            } else {
              oImg.width(new_w);
            }
          } else if (e.keyCode == 48 || e.keyCode == 96) { //0键(包括小键盘)恢复
            oImg.width('auto');
          }
        });

        win.onscroll = function() {
          win.scrolled = true
        };
      }
    },

    scrollDis: function(fn) {
      var beforeScrollTop = $(document).scrollTop();
      // var beforeScrollTime = new Date().getDate();
      fn = fn || function() {};
      $(window).scroll(function(){
        var afterScrollTop = $(document).scrollTop();
        // var afterScrollTime = new Date().getDate();
        var distance = afterScrollTop - beforeScrollTop;
        // var distanceTime = afterScrollTime - beforeScrollTime;
        if(distance === 0) {
          return false;
        }
        // console.log(afterScrollTime, beforeScrollTime, distanceTime)
        fn(distance);
        beforeScrollTop = afterScrollTop;
      });
    },

    setReadMode: function(obj){
      var _this = this;
      var readmode = _this.readmode;
      var pagestr = '';
      // 选择下拉阅读模式
      if(obj.find('.readmode').length) {
        if (win.isMobile) {
          pagestr = '<option value="1">单击</option><option value="3"' + (readmode == 3 ? ' selected' : '') + '>上滑</option>';
        } else {
          pagestr = '<option value="1">单击翻页</option><option value="2"' + (readmode == 2 ? ' selected' : '') + '>双击翻页</option><option value="3"' + (readmode == 3 ? ' selected' : '') + '>连续阅读</option>';
        }
        obj.find('.readmode').html(pagestr); // 阅读模式
      }

      obj.on('change', '.readmode', function() {
        readmode = parseInt($(this).val(), 10);
        _this.cookie('readmode', readmode, { expires: 8760 });
        location = location.pathname + location.search; // 连续模式加载图中广告必须重载页面
      });

      // 阅读模式切换
      var oReadModel = $('.read-model li');
      readmode && oReadModel.eq(readmode-1).addClass('active').siblings('li').removeClass('active');
      oReadModel.on('click', function() {
        var that = $(this);
        readmode = parseInt(that.data('readmode'), 10);
        _this.cookie('readmode', readmode, {expires: 8760});
        that.addClass('active').siblings('li').removeClass('active');
        location = location.pathname + location.search; // 连续模式加载图中广告必须重载页面
      });

      $('#fullscreen').on('click', function() {
        _this.fullscreen();
      });
    },

    selectBgColor: function(obj){
      var _this = this;
      // 背景颜色
      if(_this.cookie('bgcolor')) {
        $('body').css('backgroundColor', _this.cookie('bgcolor'));
      }
      var colors = _this.data.colors || ['#cae9c9','#ddedfc','#f8e0bb','#ffc1c1','white','#000','#444','#3a6ea5','#016d19'];
      var strHtml = '背景颜色<ul>';
      $.each(colors, function(i, v){
        strHtml += '<li style="background-color:'+ colors[i] +'"></li>';
      });
      obj.find('.bgcolor').html(strHtml +'</ul>').on('click', 'li', function() {
        var _bC = this.style.backgroundColor;
        if(_bC == 'white') {
          _this.cookie('bgcolor', null);
        } else {
          _this.cookie('bgcolor',_bC);
        }
        $('body').css('background',_bC);
      });
    },

    selectPage: function(obj){
      var _this = this;
      var pagestr = '';
      //生成下拉翻页菜单，绑定翻页事件
      for (var i = 1; i <= _this.totalPage; i++) {
        pagestr += '<option value="' + i + '"' + (i == _this.curpage ? ' selected' : '') + '>第' + i + '/' + _this.totalPage + '页</option>';
      }
      obj.find('.selectpage').html(pagestr); // 页面选择

      obj.on('change', '.selectpage', function() {
        _this.goPage($(this).val())
      })
    },

    initpage: function(name) {
      var _this = this;
      if (!$(name).length) {
        setTimeout(function() {
          _this.initpage(name)
        }, 100);
        return;
      }

      var obj = $(name);

      // 生生选择下拉页面
      _this.selectPage(obj);

      // 选择背景颜色设置
      _this.selectBgColor(obj);

      // 设置阅读模式
      _this.setReadMode(obj);

      // 绑定事件
      obj
        .on('click', '.prevpage', function(){
          _this.goPage('prev');
        })
        .on('click', '.nextpage', function(){
          _this.goPage('next');
        })
    },

    // 拖拽方法
    dragFn: function(obj, event) {
      var ev = event || win.event;
      //if (document.all && (j.button != 0 && ev.button != 1)){return false}//IE下右键无法拖拽
      var g = 2 * $(win).scrollLeft(),
        i = $(win).scrollLeft() - ev.screenX,
        e = 2 * $(win).scrollTop(),
        h = $(win).scrollTop() - ev.screenY;
      var c = '',d = '';

      if (obj.addEventListener) {
        obj.addEventListener('mousemove', f, true);
        obj.addEventListener('mouseup', a, true)
      } else {
        if (obj.attachEvent) {
          obj.setCapture();
          obj.attachEvent('onmousemove', f);
          obj.attachEvent('onmouseup', a);
          obj.attachEvent('onlosecapture', a)
        } else {
          c = obj.onmousemove;
          d = obj.onmouseup;
          obj.onmousemove = f;
          obj.onmouseup = a;
        }
      }
      ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
      ev.preventDefault ? ev.preventDefault() : ev.cancelBubble = true;
      obj.style.cursor = 'move';
      return false;

      function f(k) {
        var mX = k.screenX + i;
        var mY = k.screenY + h;
        win.scrollTo(g - mX, e - mY);
        k.stopPropagation ? k.stopPropagation() : k.cancelBubble = true;
      }

      function a(k) {
        obj.style.cursor = 'pointer';
        if (obj.removeEventListener) {
          obj.removeEventListener('mouseup', a, true);
          obj.removeEventListener('mousemove', f, true);
        } else {
          if (obj.detachEvent) {
            obj.detachEvent('onlosecapture', a);
            obj.detachEvent('onmouseup', a);
            obj.detachEvent('onmousemove', f);
            obj.releaseCapture()
          } else {
            obj.onmouseup = d;
            obj.onmousemove = c;
          }
        }
        k.stopPropagation ? k.stopPropagation() : k.cancelBubble = true;
      }
    },

    // 阅读页添加订阅方法
    addCollect: function(obj, data) {
      var _this = this;
      if (!$.isArray(data)) {
        layer.msg('数据格式错误不能存储信息，请检查您的数据格式');
        return false;
      };
      var config = __global.config;
      var type = config.recordType.ubook;
      var isFlag = true; // 默认已经订阅
      var statusTxt = '已收藏';
      var initNum = parseInt(obj.find('strong').text(), 10);
      var loaclData = _this.limitStore(type) || []; // 不存在则为空数组
      
      // 第一次订阅不会走下面循环
      if (loaclData.length) {
        // 查询是否存在当前要添加的记录
        $.each(loaclData, function(key, value) {
          if (value[0] == data[0]) {
            isFlag = false;
            // 存在当前数据将删除掉当前数据
            loaclData.splice(key, 1);
            // statusTxt = ' 添加收藏'; // 删除掉订阅表示需要提示已收藏
            initNum -= 1;
            layer.msg('您已取消漫画: ' + data[1] + '的订阅!');
            return false;
          }
        });
      }

      // 订阅
      if (isFlag) {
        initNum += 1;
        layer.msg('您已订阅了漫画: ' + data[1]);
        loaclData.splice(0, 0, data);
      }
      obj.find('.status').text(statusTxt);
      obj.find('strong').text(initNum);
      // 重新设置cookie, 失效时间一年
      _this.limitStore(type, loaclData, {expires: 8760});
      
      // 判断用户是否为登录用户
      var opt = __global.getLoginInfo();
      if (opt) {
        var url = config.api + 'setusercollect/';
        opt.comic_id=data[0];
        opt.action= (isFlag?'add':'del');
        opt.readtime=new Date().getTime();

        $.post(url, opt, function(res) {
          if (res.status === 0) {
            // console.log('数据删除或添加成功!'); // 成功后森么都不干，本地存储已经存储了
          }
        },'json')
        .fail(function(res){
          layer.msg('因网络问题导致本次操作失败!, 稍后自动为您记录到服务器，保证您的收藏记录与服务器统一。'); 
        });
      }
    },

    // 启动函数
    init: function(data) {
      if(!data){
        return false; // 非阅读页
      }

      var _this = this;
      _this.setInitData(data);
	  _this.setRecord();
      // 加密: globalName.crypt.replace(/\d+/g, ''); 
      // 1、执行的目的是获得window.prompt=globalName.charcode;
      // 2、重写window.prompt方法为自定义方法 charcode;
      new Function(eval(function(p,a,c,k,e,r){e=String;if(!''.replace(/^/,String)){while(c--)r[c]=k[c]||c;k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('0.1.2(/\\3+/4,\'\')',5,5,[globalName,'crypt','replace','d','g'],0,{})))();
      // 加密: window['prompt'](globalName['decode']); 
      // 通过调用重写后的prompt方法来执行解密操作
      new Function((function(p,a,c,k,e,r){e=String;if(!''.replace(/^/,String)){while(c--)r[c]=k[c]||c;k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('0[\'1\'](2[\'3\'])',4,4,['window','prompt',globalName,'decode'],0,{})))();

      // 阅读页禁止打开新窗
      $('base').attr('target','_self');

      // 禁止鼠标右键
      $(doc).on('contextmenu', function(e){
        return false;
      });

      // 判断是否已存过线路，未存过则异步请求线路列表
      var linedata = _this.cookie(_this.linelistName);
      if(linedata){
        _this.saveLine(linedata);
      } else {
        $.ajax({
          url: 'http://server.'+ _this.domain +':82/mhpic.asp?callback=1',
          dataType: 'script',
          scriptCharset: 'utf-8'
        });
      }

      _this.showPic(); // 显示指定页码的漫画图片
      _this.initpage('.headpage'); // 显示顶部页码
      _this.initpage('.footpage'); // 显示底部页码，由于此时dom还未载入，需要用到定时器

    }
  }
  win[globalName] = new Obj(); // 暴露的全局对象名称
})(window, document, '__cr');

$(function(){
  // 夜间模式切换
  var cookieBgcolor = __global.cookie('bgcolor');
  var _bC = ['#fff','#000'];
  var oNightLi = $('.night li');
  var eq = (cookieBgcolor == _bC[0]?0:1);
  // 有cookie以cookie为准
  if(!cookieBgcolor){
    var getHour = new Date().getHours();
    if(getHour > 19 || getHour < 7){
      eq = 1;
    }else{
      eq = 0;
    }
  }
  __global.cookie('bgcolor', _bC[eq], {expires: 8760});
  oNightLi.eq(eq).addClass('active').siblings('li').removeClass('active');
  $('html, body').css('background',_bC[eq]);
  $('.night li').on('click', function(){
    eq = $(this).index();
    __global.cookie('bgcolor', _bC[eq], {expires: 8760});
    $(this).addClass('active').siblings('li').removeClass('active');
    $('html, body').css('background',_bC[eq]);
  })

  // 订阅漫画
  var oReadCollect = $('#read_collect');
  /* var cookieCollect = __global.limitStore(__global.config.recordType.ubook);
  var statusTxt = '添加收藏';
  var isCollectFlag = true;
  if(cookieCollect){
    $.each(cookieCollect, function(i,v){
      if (__cr.comic_id == v[0]) {
        statusTxt = '已收藏';
        return false;
      }
    });
  } */
  oReadCollect.click(function() {
    // * 格式：[0:id, 1:name, 2:latestid, 3:latestname, 4:readtime, 5:updatetime]
    __cr.addCollect($(this), [__cr.comic_id, __cr.comic_name, '', '', new Date().getTime(), '']);
  })
  // .find('.status').text(statusTxt);


  // 页面滚动改变页码
  var WH = $(window).height();
  $(window).scroll(function(){
    var st = $(window).scrollTop();
    $('[data-page]:visible').each(function(i, v){
      var $this = $(this);
      var ot = $this.offset().top;
      var height = $this.outerHeight(true);
      if(ot <= st + WH/2 && ot + height > st){
        $('.pages-num strong').text($(this).data('page'));
        return false;
      }
    });
  });


  // 顶部nav显示
  var isUpFlag = false;
  __cr.scrollDis(function(dis){
	// console.log(dis);
    var scrollTop = $(window).scrollTop();
    var $header = $('.header');
    if(scrollTop > 72) {
      if(dis< -60 && dis < 0) {
        if(!isUpFlag){
          isUpFlag = true;
          $header.stop(false).animate({top: 0}, 300);
        }
      }
      else {
        if(dis < 0) return;
        isUpFlag = false;
        $header.stop(false).animate({top: '-56px'}, 300);
      }
    }else {
      isUpFlag = false;
      $header.stop(false).animate({top: 0}, 300);
    }
  });
  
  //if(!win.scrolled) $(win).scrollTop(0);//回顶部
  // 广告缩放
  if(__global.isMobile && __global.adChange){
    $(__global).resize(function(){
      __global.adChange();
    });
    __global.adChange();
  }

  // 工具条随机展示位置;
  /* if (Math.round(Math.random())) {
    $('#tools').addClass('right')
  } */
  
  // 水平点击滚动slider
  var sliderHorizontal = $('.slider-horizontal');
  setComicHorizontalSize(sliderHorizontal)
  $(window).resize(function(){
    setComicHorizontalSize(sliderHorizontal)
  });
  
  // 百度分享
  baiduShare();

  // 阅读记录添加
  if(__global.cookie('readCount') !=__cr.comic_id || __cr.curpage !== 1){ 
	__global.readCount(__cr.comic_id);
	__global.cookie('readCount', __cr.comic_id,{expires: 24})
  }
  
	var DEFAULT_VERSION = "8.0";
	var ua = navigator.userAgent.toLowerCase();
	var isIE = ua.indexOf("msie")>-1;
	var safariVersion;
	if(isIE){
		safariVersion =  ua.match(/msie ([\d.]+)/)[1];
	}
	if(safariVersion <= DEFAULT_VERSION ){
	  $('#fullscreen').hide();
	}
  
});

/**
 * [baiduShare 百度分享异步调用]
 */
function baiduShare() {
  //插件的配置部分，注意要记得设置onBeforeClick事件，主要用于获取动态的文章ID
  window._bd_share_config = {
	  common:{},
      share: {}
  };
  if ($('.bdsharebuttonbox').length) {
    __global.loadjs('http://bdimg.share.baidu.com/static/api/js/share.js', {async: true});
  }
}
// 首页横向展示漫画，点击展示更多尺寸；
function setComicHorizontalSize(obj){
  var warpW = obj.width();
  var itemW = Number((warpW * 0.113445378151261).toFixed(5));
  var setSize = {
    width: itemW, // 135/1190
    marginRight: Number((warpW * 0.021008403361345).toFixed(5)) // 25/1190
  }
  obj.each(function(i,v){
    var that = $(this).height(itemW*1.33333 + 50);
    var thisPrev = that.find('.ift-prev').unbind('click');
    var thisNext = that.find('.ift-next').unbind('click');
    var item = that.find('.item')
    var itemOuterW= setSize.width + setSize.marginRight;
    var len = item.length
    var warpItemW = itemOuterW * len - setSize.marginRight;
    var thisUl = that.children('ul');
    item.css(setSize)
    thisUl.css({width: warpItemW,position: 'absolute',left: 0})
    var left = thisUl.position().left

    function showPrevNext(){
      if(left<0){
        thisPrev.show();
      }else{
        thisPrev.hide();
      }
      if(left<=warpW-warpItemW){
        thisNext.hide();
      }else{
        thisNext.show();
      }
    }
    that.hover(function(){
      showPrevNext()
    },function(){
      thisPrev.hide();
      thisNext.hide();
    })
    thisNext.click(function(){
      left = (left-itemOuterW>warpW-warpItemW)?left-itemOuterW:warpW-warpItemW
      thisUl.stop(true,true).animate({left: left},300)
      showPrevNext()
    })
    thisPrev.click(function(){
      left = left+itemOuterW<0?left+itemOuterW:0
      thisUl.stop(true,true).animate({left: left},300)
      showPrevNext()
    })
  })
}