;(function( window, undefined ){
  $('body').append('<style>.mod-speedtest{position:fixed;top:50%;left:50%;width:640px;height:400px;margin:-200px -320px;font-size:12px;color:#333;background:#fff;background-clip:padding-box;border:5px solid #333;border:5px solid rgba(0,0,0,0.5);-webkit-border-radius:5px;border-radius:5px;_position:absolute;_top:expression(eval(document.documentElement.scrollTop+document.documentElement.clientHeight/2));z-index:9999999}.mod-speedtest iframe{width:100%;height:100%;position:absolute;z-index:-1}.mod-speedtest *{margin:0;padding:0}.mod-speedtest .close{position:absolute;top:-16px;right:-16px;width:32px;height:32px;color:#fff;font-size:21px;text-align:center;line-height:32px;font-weight:bold;font-family:simsun;background:#333;cursor:pointer;-webkit-border-radius:32px;border-radius:32px}.mod-speedtest .close:hover{background:#0b79ea}.mod-speedtest .fd-hd{margin:15px 20px;margin-bottom:0;border-bottom:1px solid #CCC;padding-bottom:15px;text-align:center;font:bold 24px/24px microsoft yahei,simhei,simsun,arial;color:#0B79EA}.mod-speedtest .fd-bd{margin:20px;margin-top:0;padding:10px;color:#333;font-size:14px}.mod-speedtest .fd-bd .buttons{margin-top:20px;text-align:center}.mod-speedtest .fd-bd dl{overflow-x: hidden;overflow-y:auto;height:240px;position: relative;}.mod-speedtest .fd-bd dt{width:30%;height: 22px;line-height: 22px;display:inline-block;*display:inline;*zoom:1;white-space:nowrap;}.mod-speedtest .fd-bd dt span{color: #FFF;font-size: 12px;margin:1px 2px;border-radius: 3px;_display:inline;}.mod-speedtest .fd-bd dd{ display:inline-block;*display:inline;*zoom:1;margin-bottom:8px;height:22px; width:65%;}.mod-speedtest .btn{border:1px solid #0a6cd2;padding:4px 19px;margin-left:5px;font-weight:bold;color:#fff;background-color:#1a86f4;-webkit-border-radius:3px;border-radius:3px;background-image:-moz-linear-gradient(top,#1a86f4,#0b79ea);background-image:-webkit-linear-gradient(top,#1a86f4,#0b79ea);background-image:-o-linear-gradient(top,#1a86f4,#0b79ea);background-image:linear-gradient(to bottom,#1a86f4,#0b79ea);-webkit-box-shadow:0 2px 3px rgba(255,255,255,0.1) inset,0 -1px 3px rgba(0,0,0,0.1) inset;box-shadow:0 2px 3px rgba(255,255,255,0.1) inset,0 -1px 3px rgba(0,0,0,0.1) inset;cursor:pointer;overflow:visible;display:inline-block;*display:inline;*zoom:1}.mod-speedtest .btn:hover{background:#F60;border:1px solid #E45D03}.mod-speedtest .fd-bd dd .btn{position: absolute;right: 0;padding: 0px 10px;font-weight: normal;font-size: 12px;width: 60px;}.mod-speedtest .fd-bd dd .speed{height:14px;display:inline-block;*display:inline;*zoom:1;vertical-align:middle;margin-right:10px}.mod-speedtest .buttons .status{color:#f00;margin-bottom:10px}.mod-speedtest .red{background:#f00;border:2px solid #f00;}.mod-speedtest .green{background:#090;;border:2px solid #090;}.mod-speedtest .gray{color:#999}'+(window.isMobile?'.mod-speedtest {width:100%; overflow-y:auto; height: 100%; margin:0 -50%; border:0;border-radius:0; padding-top:70px; box-sizing: border-box;top:0; }.mod-speedtest .fd-hd {margin:15px 0; margin-top:-50px; }.mod-speedtest .fd-bd { margin:20px 0; box-sizing:border-box; }.mod-speedtest .mod-form, .mod-speedtest .mod-comments { height: 100%;overflow-x: hidden; overflow-y: auto;} .mod-speedtest .fd-bd dd .speed{margin-right:0;}.mod-speedtest .fd-bd dl{height:auto;}.mod-speedtest .close{top:5px;right:5px;}.mod-speedtest .fd-bd dd .btn{padding:0 5px;}@media all and (orientation:landscape ){.mod-speedtest .fd-bd dl{height:auto}}':'')+'</style>\
<div id="J_speedtest" class="mod-speedtest">\
  <iframe frameborder="0" scrolling="no"></iframe>\
  <span class="close fd-close" id="J_close" onclick="__st.testAbort()">&times;</span>\
  <div class="fd-hd">网速测试</div>\
  <div class="fd-bd">\
    <dl>正在获取测试线路，请稍候...如长时间获取不到线路，请刷新页面</dl>\
    <div class="buttons">\
      <div class="status"></div>\
      <span class="start btn" onclick="__st.start()">开始测速</span>\
      <span class="chose btn" onclick="__st.choseline()">使用最快线路</span>\
      <span class="abort btn" onclick="__st.testAbort()">取消</span>\
    </div>\
  </div>\
</div>');

  var __st = window.__st = {timeout:10000};
  __st.init = function(e,testfile){
    $(".mod-speedtest").show();

    // 判断线路列表是否已获取到
    __st.ld = __cr.linelist;
    var _ldstat = ['','<span class="green">闲</span>','<span class="red">忙</span>'], _ldstr = "";

    if(!__st.ld) {
      setTimeout(__st.init,1000);
      return;
    }
    __st.ld = eval(__st.ld);
    $.each(__st.ld,function(i){
      _ldstr += '<dt'+(__st.ld[i][0]==__cr.thisline?' style="font-weight:bold" title="当前使用的线路"':'')+'>'+__st.ld[i][1]+_ldstat[__st.ld[i][2]]+'</dt><dd><span class="gray">等待开始</span></dd>'
    });
    __st.testfile = testfile;
    __st.returnobj = e;
    __st.fastLineNO = 0;
    $(".mod-speedtest dl").html(_ldstr);
    $(".mod-speedtest .buttons .status").html("为保证测试准确性，请关闭其他浏览器窗口及各类影音、下载软件后再开始测速");
    $(".mod-speedtest .buttons .chose").hide();
    $(".mod-speedtest .buttons .start").show();
    window.stop ? window.stop() : document.execCommand("Stop");
  };
  __st.start = function(){
    $(".mod-speedtest .buttons .start").hide();
    $(".mod-speedtest .buttons .status").html("正在测速，请稍候...");
    __st.testBegin();
  };
  // 测试开始。用ld的第4列存储测试结果，为空的则表示未开始测试
  __st.testBegin = function(){
    // 全部测试完毕
    if(!$(".mod-speedtest dl dd:contains('等待开始')").length) {
      $(".mod-speedtest .buttons .chose").show();
      $(".mod-speedtest .buttons .status").html("测速完毕，您可以点击“使用最快线路”按钮或手动选择其他线路");
      return false;
    }

    // 找到第1个未测试的线路
    $.each(__st.ld,function(i){
      if(!__st.ld[i][3]) {
        __st.lineNO = i;//当前测试线路在linedata中的序号
        __st.begintime = new Date().getTime();
        __st.imgLoader = new Image();
        __st.imgLoader.onload = __st.testEnd;
        __st.imgLoader.onerror = __st.testError;
        __st.imgLoader.src = "http://"+__st.ld[i][0]+__st.testfile;
        __st.testtimeout = setTimeout(__st.testError,__st.timeout);//10秒超时
        $(".mod-speedtest dl dd:eq("+i+")").html("正在下载测试文件...");
        return false;
      }
    });
  };
  // 测试结束
  __st.testEnd = function(){
    clearTimeout(__st.testtimeout);
    var _testtime = new Date().getTime() - __st.begintime;
    __st.ld[__st.lineNO][3] = _testtime;
    if(_testtime < __st.ld[__st.fastLineNO][3]) __st.fastLineNO = __st.lineNO;//获得最快线路

    // 很快：3.5秒内，一般：3.5-7秒，很慢：7秒以上
    var _pos = parseInt(_testtime/3500,10),
      _speedstat = ["很快","一般","很慢"][_pos],
      _speedcolor = ["#090","#f90","#f00"][_pos],
      _speedwidth = parseInt((10000-_testtime)/200,10);
    $(".mod-speedtest dl dd:eq("+__st.lineNO+")").html('<span class="speed" style="width:'+_speedwidth+'%;background:'+_speedcolor+'" title="下载时间：'+_testtime+'毫秒"></span> <span style="color:'+_speedcolor+'">'+_speedstat+'</span> <span class="btn" onclick="__st.choseline(\''+__st.ld[__st.lineNO][0]+'\')">使用该线路</span>');
    __st.imgLoader = __st.lineNO = _testtime = _pos = _speedstat = _speedcolor = _speedwidth = null;
    __st.testBegin();//继续下一测试
  };
  // 测试出错或超时
  __st.testError = function(){
    __st.ld[__st.lineNO][3] = __st.timeout;
    $(".mod-speedtest dl dd:eq("+__st.lineNO+")").html('<b>出错或超时</b>');
    window.stop ? window.stop() : document.execCommand("Stop");//停止当前线路的下载请求
    __st.lineNO = null;
    __st.testBegin();//继续下一测试
  };
  __st.testAbort = function(){
    try {
      clearTimeout(__st.testtimeout);
      window.stop ? window.stop() : document.execCommand("Stop");
      __st.lineNO = null;
      $.each(__st.ld,function(x){__st.ld[x][3]=null});
      $(".mod-speedtest").hide(500);
    } catch(e){}
  }
  // 选择线路
  __st.choseline = function(lineIP){
    if(!lineIP) lineIP = __st.ld[__st.fastLineNO][0];
    __cr.thisline = lineIP;
    __cr.cookie("mh_thisline",lineIP,{expires:0.1});
    __st.testAbort();
    $(__st.returnobj).parent().siblings("img").attr("src","http://"+lineIP+__st.testfile);
    $(__st.returnobj).parent().hide();
  }
})(window);