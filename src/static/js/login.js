thirdPartyLogin();
/**
 * [login 用户三方登录授权]
 * @return {[type]} [description]
 */
function login() {
  var search = location.search;
  var matchType = search.match(/(type|state)\=([a-z0-9]+)/i);
  var type = matchType ? matchType[2].toLocaleLowerCase() : false;
  var token = oldloginvar = lastargs = '';

  if (!type) {
    layer.msg('未获取到登录方式，请重新刷新再试!'); // 未获取到type
    return;
  }
  
  switch (type) {
    case 'qq':
      var qqMath = location.hash.match(/access_token=([^\&]+)/i);
      token = qqMath ? qqMath[1] : false;
      oldloginvar = type + '#access_token=' + token;
      break;
    case 'sina':
      var sinaMath = search.match(/code=([a-z0-9]+)/i);
      token = sinaMath ? sinaMath[1] : false;
      oldloginvar = type + '&code=' + token;
      break;
  case 'weixin':
      var wixinMath = search.match(/code=([a-z0-9]+)/i);
      token = wixinMath ? wixinMath[1] : false;
      oldloginvar = type + '&code=' + token;
      break;
  }

  if (!token) {
    layer.msg('登录授权失败，请重新刷新再试!'); // 未获取到token
    return;
  }

  // 判断是否登陆过，采用openid策略
  var opt = __global.getLoginInfo(true);
  if (opt) {
    lastargs = '?type=' + opt.type + '&openid=' + opt.openid;
  } else {
    lastargs = '?type=' + type + '&token=' + token;
  }

  $.ajax({
    url: __global.config.loginurl + lastargs+'&client='+__global.config.client,
    dataType: 'jsonp',
    type: 'post',
    jsonp: 'callback',
    success: function(res) {
      if (res.status !== 0){
        return false;
      }
      layer.msg('登陆成功，正在为您保存状态，稍候即将返回先前浏览的页面...', {
        time: 0
      }); // 未获取到token
      __global.cookie('oldloginvar', oldloginvar, {
        expires: 8760
      });
      __global.cookie('user', JSON.stringify(res.data), {
        expires: 8760
      });
    
      var logfrom = __global.cookie('logfrom') || '/';
      if (logfrom) {
        __global.cookie('logfrom', null); //清除登陆来源地址，用于系统自动登陆时不跳转
        top.location = logfrom;
      }
    }
  });
}
/**
 * [authlogin 三方授权登录转向]
 * @param  {[type]} str [description]
 * @return {[type]}   [description]
 */
function authlogin(url) {
  var topHref = top.location.href;
  //需要返回登陆前浏览的页面,非iframe方式取refer
  var logfrom = topHref != location.href ? topHref : document.referrer;
  //禁止跳转回非本站URL，https方式则将7改为8
  if (logfrom.indexOf(location.host) != 7) {
    logfrom = null;
  }
  console.log(logfrom, topHref, document.referrer);
  __global.cookie('logfrom', logfrom, {
    expires: 8760
  }); //存入cookie便于后台接收处理
  top.location = url;
}
/**
 * [thirdPartyLogin 三方登录DOM操作]
 */
function thirdPartyLogin() {
  if(isMobile) {
  $('.weixin').hide();
  $('.threepart-bd li').css({width: '50%'});
  }
  // 判断是第三方登陆后转向
  if (location.search.match(/(type|state)\=([a-z0-9]+)/i)) {
    login();
  } else {
    $('#J_sigin').show();
  }
  $('#J_sigin').on('click', 'a', function() {
    var url = '';
    switch ($(this).data('flag')) {
      case 'qq':
        url = 'https://graph.qq.com/oauth2.0/authorize?client_id=101369285&response_type=token&scope=get_user_info&redirect_uri=' + encodeURIComponent(__global.config.redirect + '?type=qq')
        break;
      case 'sina':
        url = 'https://api.weibo.com/oauth2/authorize?client_id=199818462&redirect_uri=' + encodeURIComponent(__global.config.redirect + '?type=sina')
        break;
    case 'weixin':
      url= 'https://open.weixin.qq.com/connect/qrconnect?appid=wx49c269dceb6ed1e3&redirect_uri=' + encodeURIComponent(__global.config.redirect) + '&response_type=code&scope=snsapi_login&state=weixin#wechat_redirect'
    break;
    }
    authlogin(url);
  });
}