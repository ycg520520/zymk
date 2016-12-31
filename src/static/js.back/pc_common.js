// 文档加载完成后执行
$(function() {
  // 公告弹出
  noticeFn();
  // 百度分享
  baiduShare();
  // 利用js实现等高布局
  $('.equal-height').each(function(i, v){
	var $this = $(this);
	var tmpArr = [];
	var equalChild = $this.children('[class^="equal-"]');
	equalChild.each(function(k, m){
	  tmpArr.push($(this).height());
	});
	equalChild.height(Math.max.apply(Math,tmpArr));
  });
  // tabs切换操作
  $('.tabs-hover>.hd').each(function() {
    var _this = $(this),
      isIndexTabs = _this.parent().hasClass('tabs-index'),
      tabsBox = _this.parents('.tabs'),
      tabsOffset = isIndexTabs ? 12 : 0,
      modify = _this.find('.modify');
    var classifyTab = $('#classify_tab');
    if (_this.find('li.active').length) {
      modifyFn({
        modifyObj: modify,
        curMenu: _this.find('li.active'),
        offset: tabsOffset
      });
    }

    _this
      .on('mouseover', 'li', function() {
        modifyFn({
          modifyObj: modify,
          curMenu: $(this),
          offset: tabsOffset
        });
        var index = $(this).index();
        // 内容切换
        if (tabsBox.hasClass('tabs-switch')) {
          tabsBox.find('.bd>.tabs-item').eq(index).show().siblings('.tabs-item').hide();
        }
      })
      .on('mouseleave', 'li', function() {
        modifyFn({
          modifyObj: modify,
          curMenu: _this.find('li.active'),
          offset: tabsOffset
        });
      });
  });

  // 导航样式操作
  var oNav = $('#nav'),
    oNavMeum = oNav.find('li'),
    modify = oNav.find('.modify');
  if (oNavMeum.hasClass('active')) {
    modifyFn({
      modifyObj: modify,
      curMenu: oNav.find('li.active'),
      offset: 8,
      space: 16
    });
  }
  oNavMeum.hover(function() {
    modifyFn({
      modifyObj: modify,
      curMenu: $(this),
      offset: 8,
      space: 16
    });
  }, function() {
    modifyFn({
      modifyObj: modify,
      curMenu: $(this),
      offset: 8,
      space: 16
    });
  });

  // 排行列表鼠标事件经过操作
  $('.rank-list .item').on('mouseenter', function() {
    $(this).addClass('active').siblings('.item').removeClass('active');
  })

  // 判断是否为首页对header、footer做显示操作
  /*var pathname = location.pathname;
  if (/index/.test(pathname) || pathname == '/') {
    $('#header').css({
      'background': 'none',
      zIndex: 2
    });
  } else {
    if($('#header').length) {
      $('body').css('paddingTop', '72px');
      $('#footer').addClass('mt24');
      $('.link').remove();
    }
  }*/

  // 判断IE阅览器版本进行操作
  /* if (__global.ie() < 9) {
    layer.open({
      type: 1,
      title: false,
      area: ['640px', 'auto'],
      closeBtn: false,
      // shade: [0.5, '#000'],
      shadeClose: false,
      skin: 'layui-layer-nobg',
      content: $('#J_browser')
    });
  } */

  // 用户登录弹出框
  $('body').on('click', '#J_user', function() {
    __global.getLoginInfo();
    return false;
  })

  // 统一给layer弹出框进行关闭事件绑定 解决分享微信时弹出框遮挡的问题
  $('body').on('click', '.J_close, .share a', function() {
    layer.closeAll();
  })

  // 顶部搜索处理方法
  searchHandle();

  // 加载展示用户中心订阅和历史信息
  getUserRecord();

  // 阅读历史和订阅夹清空处理
  $('#J_clean_userData').click(function() {
    var typeObj = $(this).siblings('ul').find('li');
	// 清除本地存储
	var delRecordFlag = '';
    typeObj.each(function(key, value) {
      if ($(this).hasClass('active')) {
        switch (key) {
          case 0:
            delRecordFlag = 'ubook';
            break;
          case 1:
            delRecordFlag = 'urecord';
            break
        }
      }
    });
	// 全部删除时 comic_id传空值， 将本地数据设置为空 null
	updateRecordData('del',delRecordFlag,'',null);
  })

  // 订阅，历史滚动条模拟
  $('.scroll').scrollbar();

  // 三方评论
  thirdPartyComment();

  // loadRead body end
});

/**
 * [randomTagsColor 随机指定背景颜色]
 * @param  {[object]} obj [要指定的随机jquery对象]
 * @param  {[array]} arr [要随机的颜色类名]
 */
function randomTagsColor(obj, arr) {
  var randomColorArr = arr || ['c1','c2','c3','c4','c5']; // 对应css样式
  var colorArrLen = randomColorArr.length;
  obj.each(function(i,v){
    var random = 0;
    if(i < colorArrLen){
      random = i;
    }else{
      random = Math.floor(Math.random() * colorArrLen);
    }
    $(this).addClass(randomColorArr[random]);
   })
}

/**
 * [modifyFn 修饰线方法，针对导航下面滑动变化的提示线和tabs切换的修饰线条]
 * @param  {[type]} obj [哪个对象需要操作修饰线jquery对象]
 */
function modifyFn(obj) {
  var modifyObj = obj.modifyObj,
    curMenu = obj.curMenu,
    active = obj.active || true,
    offset = obj.offset || 0,
    menuSpace = obj.space || 0,
    width = curMenu.width() - menuSpace > 0 ? curMenu.width() - menuSpace : 0,
    left = curMenu.position().left + offset;

  if (active) {
    curMenu.addClass('active').siblings('li').removeClass('active');
  }
  $(window).resize(function() {
    left = curMenu.position().left + offset;

    modifyObj.stop(true, true).animate({
      left: left,
      width: width
    }, 100);
  });
  modifyObj.stop(true, true).animate({
    left: left,
    width: width
  }, 100);
}

/**
 * [searchHandle 搜索方法]
 */
function searchHandle() {
  // hotSearch(); // 加载热门搜索
  var searchRecommend = $('.search-recommend');
  randomTagsColor(searchRecommend.find('a'))

  // 搜索块js处理
  var objAlike = $('#J_alike');
  var searchHistory = $('.search-history');
  var inputSerach = $('#search');
  var searchBox = $('.search .bd');
  var noSearchInfo = '<p class="no-info">暂无相关搜索结果<strong>^_^</strong></p>'
  inputSerach.on('keyup', function(event) {
    event.stopPropagation();
    // 对输入进行ajax请求 延迟搜索，不让用户每次按键都提交请求;
    clearTimeout(window.st_search);
    window.st_search = setTimeout(getSearch, 500);
  })
  .on('click',function(event){
	  event.stopPropagation();
    objAlike.slideDown();
  });

  objAlike.on('click', '.clean', function(event) {
	event.stopPropagation();
    if (!searchHistory.find('.no-info').length) {
      searchHistory.empty().html(noSearchInfo);
	  __global.cookie('historySearch',null);
    }
  });

  searchHistory.on('click', '.close', function() {
	event.stopPropagation();
    var _this = $(this);
	var _thisItem = _this.parents('.item');
    _thisItem.remove();
	saveSearchHistory(_thisItem.find('.text').text());
    if (!searchHistory.children('.item').length) {
      searchHistory.html(noSearchInfo);
    }
  });

  // 关闭搜索
  $('body').on('click', function(event) {
	// inputSerach.bind('blur');
	objAlike.slideUp();
  });

  window.searchflag = false;
  $('#J_search_btn').on('click', function(event) {
    event.stopPropagation();
    var keyword = $('#search').val() || $('#search').attr('placeholder');
    
    if(__global.isMobile()) {
      if(searchflag){
        $('.site-search').removeClass('hover');
        window.searchflag = false;
        location='/sort/all.html#'+ encodeURIComponent(keyword);
      }else{
        $('.site-search').addClass('hover');
        window.searchflag = true;        
      }
    }else{
      location='/sort/all.html#'+ encodeURIComponent(keyword);
    }
  // 解决在筛选页面导航搜索时不搜索的问题
    var searchFilter = $('#search_filter');
    if(searchFilter.length){
      searchFilter.val(keyword);
      $('#submit_search_filter').click();
    }
  
    return false; // 阻止form表单提交
  });
}

// 热门搜索
function hotSearch() {
  searchHistoryHtml(); // 搜索历史
  var hotSearchData = JSON.parse(__global.cookie('hotSearch'));
  if(hotSearchData){
    hotSearchHtml(hotSearchData);
  }else {
    $.ajax(__global.config.api + 'gethotsearch/', {
      dataType: 'jsonp',
      async: true,
      success: function(res) {
        var data = res.data.list;
        if(res.status === 0){
          hotSearchHtml(data);
          __global.cookie('hotSearch',JSON.stringify(data),{expires: 0.5, path:'/'});
        }
      }
    });
  }
}
// 热门搜索html内容
function hotSearchHtml(data) {
  var str = '';
  var searchRecommend = $('.search-recommend');
  $.each(data, function(i, v){
    str += '<a href="/'+ v.comic_id +'/" title="'+ v.comic_name +'">'+ v.comic_name +'</a>'
  });
  if(str === ''){
    str = '<p class="no-info">抱歉，暂没获取到大家搜索的漫画!<strong>^_^</strong></p>'
  }
  searchRecommend.html(str);
  randomTagsColor(searchRecommend.find('a'))
}

// 将用户的搜索历史存储在客户端
function saveSearchHistory(keyword, len) {
	len = len || 20;
	var searchHistory = __global.cookie('historySearch');
	var tmpArr = searchHistory?searchHistory.split(','):[];
	var isFlag = false;

	$.each(tmpArr, function(key, value) {
		if(value === keyword){
			isFlag = true;
			tmpArr.splice(key, 1);
			return false;
		}
	});
	if(!isFlag){
		if(tmpArr.length < len){
			tmpArr.splice(0,0, keyword);
		}else{
			tmpArr.splice(0,0, keyword).pop();
		}
	}
	__global.cookie('historySearch', tmpArr.join(','), {expires:10000, path:'/'});
}

function searchHistoryHtml() {
	var noSearchInfo = '<p class="no-info">暂无相关搜索历史<strong>^_^</strong></p>'
	var searchCookie = __global.cookie('historySearch');
	var searchData = searchCookie?searchCookie.split(','):[];
	var str = '';
	var searchHistory = $('.search-history');
	$.each(searchData, function(key, value){
		str += '<div class="item"><span class="fr-chapter"><span class="close">&times;</span></span><span class="text">'+ value +'</span></div>';
	});
	
	if(!str){
		searchHistory.html(noSearchInfo);
		return;
	}
	searchHistory.html(str);
}
// 下拉显示搜索结果
function getSearch() {
  var objAlike = $('#J_alike');
  var searchContent = $('.search-content');
  var searchContentP = searchContent.parents('dl');
  var keyword = $("#search").val().trim();
  var noSearchInfo = '<p class="no-info">暂无相关搜索结果<strong>^_^</strong></p>'

  if (keyword) {
    $.ajax(__global.config.api +'getsortlist', {
      dataType: 'jsonp',
      data:{
        key: keyword,
        topnum: 20
      },
      success: function(res) {
        if(res.status != 0 && res.data) {
          searchContent.html(noSearchInfo);
        } else {
          var str = '';
          var reg = new RegExp('('+ keyword +')');
		  saveSearchHistory(keyword); // 存储搜索历史
		  
          $.each(res.data, function(i, v) {
            str += '<div class="item"><span class="fr-chapter">'+ v.last_chapter.name +'</span><a href="/'+ v.comic_id +'/">'+ v.comic_name.replace(reg, '<strong>$1</strong>') +'</a></div>';
          });
          if(str === ''){
            str = noSearchInfo;
          }
          searchContent.html(str);
		  searchHistoryHtml();
		  searchContentP.show().siblings('dl').hide();
        }
      }
    });
  } else {
    searchContent.html(noSearchInfo);
    searchContentP.delay(500).hide().siblings('dl').show();
  }
}

/**
 * [logout 用户退出登录]
 */
function logout() {
  __global.cookie('user', null);
  __global.cookie('oldloginvar', null);
  __global.cookie('urecordCacheTime', null); // 清除阅读记录缓存时间保证下次登录同步到最新的数据
  __global.limitStore('ubook', null);
  __global.limitStore('urecord', null);
  getUserRecord();
  return false;
}


function resStatusTips(status, statusText, icon, time) {
  time = time || 5000;
  var opt = {
    time: 2000,
    btn: ['知道了']
  };
  if (icon !== undefined) {
    opt.icon = icon
  };

  statusText = statusText || '未知服务信息错误!';
  switch (status) {
    case 404:
      statusText = '请求的页面找不到了!';
      break;
    case 500:
      statusText = '服务器出错了!　状态:500';
      break;
  }
  layer.msg(statusText, opt);
}

/*************** 订阅和历史的方法 开始 ****************/

// 提交字段数组转换
function postRecordField(type, arr){
	var typeData = __global.config.recordType;
	switch(type) {
		case typeData.urecord:
			return {
				comic_id: arr[0],
				// comic_name:arr[1],
				chapter_id: arr[2],
				// chapter_name: arr[3],
				readtime: arr[4],
				readpage: arr[5],
				// next_chapter_id:arr[6],
				// next_chapter_name:arr[7]
			}
		break;
		case typeData.ubook:
			return {
				comic_id: arr[0],
				// comic_name: arr[1],
				// last_chapter:{
					// id: arr[2],
					// name: arr[3]
				// },
				addtime: arr[4],
				// update_time: arr[5]
			  } 
		break;
	}
}
// 将服务端数据转换成功数组格式存储
function recordTransformArr(type, obj){
	var tmpArr = [];
	var typeData = __global.config.recordType;
	switch(type) {
		case typeData.urecord:
			tmpArr = [obj.comic_id, obj.comic_name, obj.chapter_id, obj.chapter_name, obj.readtime,obj.readpage, obj.next_chapter_id, obj.next_chapter_name]
		break;
		case typeData.ubook:
			tmpArr = [obj.comic_id,obj.comic_name,obj.last_chapter.id, obj.last_chapter.name,obj.addtime,obj.update_time]
		break;
	}
	return tmpArr;
}

/**
 * [getUserRecord 获得用户订阅记录]
 * @return {[Ａrray]} [description]
 */
function getUserRecord() {
  var opt = __global.getLoginInfo(true);
  var config = __global.config;
  var typeData = config.recordType;
  var ubook = typeData.ubook;
  var urecord = typeData.urecord;
  getUserLoginHtml()
  
  // 登录用户从服务获取数据且cookie没有过期的清空下
  if(opt && !__global.cookie('urecordCacheTime')) {
    var url = config.api + 'getuserrecord/';
	// 获取本地对于的记录数据
	var ubookData = __global.limitStore(ubook) || [];
	var urecordData = __global.limitStore(urecord) || [];
	opt.sync = (function(){
		var obj = {};
		// 这里可以提炼出来
		// 将本地数组数据中最新数据组装好提交给服务端
		if(ubookData.length){
			obj['user_collect'] = [];
			$.each(ubookData, function(i, v){
				obj['user_collect'].push(postRecordField(ubook, v))
			});
		}
		if(urecordData.length){
			obj['user_read'] =[];
			$.each(urecordData, function(i, v){
				obj['user_read'].push(postRecordField(urecord, v))
			});
		}
		return JSON.stringify(obj);
	})();
  
	// 将本地数据提交到服务器端后返回
    $.post(url, opt, function(res) {
      // 获得用户的记录
      if(res.status === 0){
        // 将数据添加到本地
        $.each(typeData, function(i,v){
		  var tmpArr = [];
		  
          $.each(res.data[v], function(k, m) {
			tmpArr.push(recordTransformArr(v,m));
          });
		  __global.limitStore(v, tmpArr, {expires: 8760, path: '/'});
        });
		
		// 设置阅读过期时间为1天，目的是好从服务器拉去数据
		__global.cookie('urecordCacheTime', true, {expires: 24});
        showRecodHtml(); // 重新更新用户记录数据
      }
    },'json')
    .fail(function(res){
      showRecodHtml();
    });
  } else {
    showRecodHtml();
  }
  
  // 绑定事件
  var objCollect = $('.user-collect');
  var objHistory = $('.user-history');
  recordEventBind(objCollect, ubook);
  recordEventBind(objHistory, urecord);
}

// 获得用户登录后的html
function getUserLoginHtml(){
  var userData = JSON.parse(__global.cookie('user'));
  var hdLogout = $('.user .logout');
  var userMenu = $('.user .ft');
  var userHd = $('.user>.hd');
  var headPic = '<i class="ift-user"></i>';
  if(userData) {
    hdLogout.show();
    userMenu.html('进入 <a href="/user/'+ userData.id +'.html" title="用户中心" class="green">用户中心</a> 查看更多记录。');
	if(userData.headpic){
       userHd.html('<img class="thumbnail" src="'+ userData.headpic +'">');
	}else{
	   userHd.html(headPic);
	}
    // 距离上次登陆超过1天，则利用隐藏iframe重登陆并获取最新书架数据，不然漫画更新后无法显示“有更新”
    if(__global.now - __global.parseInt(userData.lastlogintime) > 864e5){     
      $('body').append('<iframe scrolling=no frameborder=no width="0" height="0" src="/login.htm?type='+ (__global.cookie('oldloginvar') || '') +'"></iframe>');//距离上次登陆超过1天，则利用隐藏iframe重登陆并获取最新书架数据，不然漫画更新后无法显示“有更新”
    }
  } else {
    hdLogout.hide();
	userHd.html(headPic);
    userMenu.html('<a href="javascript:void(0)" class="green" id="J_user">登录</a> <span>后将能同步并永久保存记录</span>');
  }
}

/**
 * [showRecodHtml 展示用户中心订阅和历史记录的方法 ]
 */
function showRecodHtml() {
  var typeData = __global.config.recordType;

  // 初始化数据上线时删掉
  // $.each(typeData, function(i,v){
  //   $.each(__global.config.data[v], function(k, m) {
  //     addRecord(v, m); // 数据只能1条条订阅添加
  //   })
  // })

  // 初始化插入订阅夹
  getShowHtmlString(typeData.ubook, __global.limitStore(typeData.ubook));
  // 初始化插入阅读历史
  getShowHtmlString(typeData.urecord, __global.limitStore(typeData.urecord));
}

/**
 * [recoreEventBind 订阅和历史的事件绑定方法]
 * @param  {[type]} obj  [description]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
function recordEventBind(obj, type) {
  obj.on('click', '.opt-del', function(event) {
    delRecord(type, $(this).data('id'));
    if(type === 'ubook') {
      listCollect($(this).parents('.comic-list').children());
    }
    $(this).parents('.item').remove(); //删除掉当前的类
  })
}

/**
 * [getShowHtmlString 获取到展示的数据html拼接好的字符串]
 * @param  {[string]} type [展示的数据的类型目前有userHistroy, ubook]
 * @param  {[Array]} data [展示的数据数据结构: [{a:'a'},{b:'b'}]]
 * @return {[string]}    [展示的数据html拼接好的字符串]
 */
function getShowHtmlString(type, data) {
  // 获得数据展示信息
  data = data || []; // 当前数据不存在置为空数组

  var html = ''; // 临时字符
  var typeTips = ''; // 提示文字
  var obj = null;
  // 通过类型决定DOM和内容
  switch (type) {
    case 'urecord':
      typeTips = '你还没有阅读过哦';
      obj = $('.user-history')
      break;
    case 'ubook':
      typeTips = '订阅夹内空空如野';
      obj = $('.user-collect')
      break;
  }

  $.each(data, function(key, value) {
    switch (type) {
      case 'urecord':
        html += showHistoryItem(value);
        break;
      case 'ubook':
        html += showCollectItem(value, (key + 1) % 3)
        break;
    }
  })

  // 对html做对应处理
  if (html !== '') {
    html = '<ul class="comic-list">' + html + '</ul>'
  } else {
    html = '<p class="no-info">' + typeTips + '，<br><a href="/0/">立即阅读其它漫画。</a></p>'
  }
  if (obj.find('.scroll .scroll-content').length) {
    obj.find('.scroll .scroll-content').html(html)
  } else {
    obj.find('.scroll').html(html)
  }
}

/**
 * 用户的订阅每一项目展示html字符串数据
 * @param  {[Array]} data [数组格式详见下]
 * 用户订阅数据格式
 * 名称：ubook
 * 格式：[漫画ID, 漫画名, 最新章节ID(预留), 最新章节名(预留), 订阅/阅读时间, 最新更新时间]
 * 格式：[0:id, 1:name, 2:latestid, 3:latestname, 4:readtime, 5:updatetime]
 * @param  {[Number]} flag [给对应子元素添加修正的类，解决ie8以下不支持伪类]
 * @return {[string]}    [用户的订阅每一项目展示html字符串数据]
 */
function showCollectItem(data, flag) {
  var href = '/'+data[0] + '/',
    src = getDomain().format(__global.getPathById(data[0])),
    title = data[1] + setDelimiter() + data[3];
  return ('<li class="item' + (flag ? '' : ' nth-3n') + '"><a href="' + href + '" class="thumbnail"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-src="' + src + '" alt="' + title + '"><div class="group-info"><h3 class="title" title="' + title + '">' + data[1] + '</h3></div></a><div class="opt-del" data-id="' + data[0] + '"><i class="ift-del"></i><span class="text">删除</span></div></li>');
}

/**
 * 阅读历史每一项目展示html字符串数据
 * @param  {[Array]} data [数组格式详见下]
 * 阅读历史数据格式
 * 名称：urecord
 * 格式 ：[漫画ID, 漫画名, 阅读章节id, 阅读章节名, 阅读时间, 阅读章节页码, 下一话章节ID, 下一话章节名]
 * 格式 ：[0:id, 1:name, 2:readid, 3:readname, 4:readtime, 5:readpage, 6:nextid, 7:nextname]
 * @return {[string]}    [阅读历史每一项目展示html字符串数据]
 */
function showHistoryItem(data) {
  var href = '/'+data[0]+'/', // 漫画详情页
    nextHref = '/'+data[0] + '/' + data[6] + '.html', // 漫画下一话阅读页
    readedHref = '/'+data[0] + '/' + data[2] + '.html', // 漫画已经阅读阅读页
    src = getDomain().format(__global.getPathById(data[0]));

  return ('<li class="item"><a href="' + href + '" class="thumbnail"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-src="' + src + '" alt="' + data[1] + '"></a><div class="info"><h3 class="title"><a href="'+ href +'">' + data[1] + '</a></h3><p class="time">' + getTimeSpan(data[4]) + '</p><p class="attr"><span class="attr-label">阅读至:</span> <a href="' + readedHref + '">' + data[3] + '</a></p><p class="attr"><span class="attr-label">下一话:</span> <a href="' + nextHref + '">' + data[7] + '</a></p><div class="opt-del" data-id="' + data[0] + '"><i class="ift-del"></i><span class="text">删除</span></div></div></li>');
}

// 对订阅夹进行删除重新添加样式
function listCollect(obj) {
  obj.removeClass('nth-3n').each(function(i) {
    if (!(i + 1) % 3) {
      $(this).addClass('nth-3n');
    }
  })
}

/**
 * 删除记录
 * @param  {[string]} type [删除的类型]
 * @param  {[type]} id   [漫画的id, 当为-1或者为空时表示全部删除]
 */
function delRecord(type, id) {
  var loaclData = __global.limitStore(type);
  if (!loaclData) {
    return;
  } //没有获取到本地cookie存储的数据直接返回

  if (id !== -1) {
    // 删除存储的记录
    $.each(loaclData, function(key, value) {
      if (id == value[0]) {
        layer.msg('删除成功!');
        loaclData.splice(key, 1);
        return false; // 查找到对应的漫画删除记录后跳出循环；
      }
    })
  } else {
    loaclData = []; // 全部清数空据
    layer.msg('删除成功!');
  }
  // 只有没有数据时才执行getShowHtmlString方法来重新写html的提示
  // 但是这里会出现一个问题对订阅指定过nth-3n类会出现问题。
  // if(!loaclData.length){
  //   getShowHtmlString(type, loaclData) // 重新插入数据
  // }

  updateRecordData('del', type, id, loaclData);
}

/**
 * [addRecord 添加记录，且每次只能存储一条数据, 对应以前的addUserBook]
 * @param {[String]} type [添加记录的类型]
 * @param {[Array]} data [添加订阅数据，以数组格式存储,
 * 阅读历史数据格式
 * 名称：irecord
 * 格式 ：[漫画ID, 漫画名, 阅读章节ID, 阅读章节名, 阅读时间, 阅读章节页码, 下一话章节ID, 下一话章节名]
 * 格式 ：[0:id, 1:name, 2:readid, 3:readname, 4:readtime, 5:readpage, 6:nextid, 7:nextname]
 * ****
 * 用户订阅数据格式
 * 名称：ubook
 * 格式：[漫画ID, 漫画名, 最新章节ID(预留), 最新章节名(预留), 订阅/阅读时间, 最新更新时间]
 * 格式：[0:id, 1:name, 2:latestid, 3:latestname, 4:readtime, 5:updatetime]
 */
function addRecord(type, data) {
  if (!$.isArray(data)) {
    layer.msg('数据格式错误不能存储信息，请检查您的数据格式');
    return false;
  };
  if(!data.length){
	  return;
  }

  var loaclData = __global.limitStore(type) || []; // 不存在则为空数组
  var isCollect = (type == __global.config.recordType.ubook); // 判断是否为订阅
  if (loaclData.length) {
    var isFlag = false;
    // 查询是否存在当前要添加的记录
    $.each(loaclData, function(key, value) {
      if (value[0] == data[0]) {
        isFlag = true;
      }
    });

    // 存在的记录直接跳出存储方法
    if (isFlag) {
      // 已经存在本条记录，当为订阅才做提示，历史记录是不做提示的
      if (isCollect) {
        layer.msg('您已经订阅过了漫画: ' + data[1]);
      }
      return false;
    }
  }

  // 根据类型提示不同的内容
  loaclData.splice(0, 0, data); // 把最新的数据追加在数组的最前面
  // 只有是订阅才做提示
  if (isCollect) {
    layer.msg('漫画: ' + data[1] + '已经添加到您的订阅中了!');
	var oCollectNum = $('#collect .type-show strong');
	oCollectNum.text(__global.parseInt(oCollectNum.text())+1)
  }
  // console.log(data[0],loaclData)
  updateRecordData('add', type, data[0], loaclData);

}

/**
 * [updateRecordData 更新记录数据]
 * @param  {[string]} action [更新记录的方式：add, del]
 * @param  {[string]} type [记录数据类型 ubook, urecord]
 * @param  {[number]} id   [漫画ID]
 * @param  {[array]} data [更新后的本地的数据信息如果是全部删除数据将这里设置为null或者空数组]
 */
function updateRecordData(action, type, id, data) {
  var opt = __global.getLoginInfo(true);
  if (opt) {
    __global.limitStore(type, data, {expires: 8760, path:'/'});
    opt.comic_id = id;

    var config = __global.config;
    var url = config.api;
    if(type === config.recordType.ubook) {
      url += 'setusercollect/';
      opt.action = action;
      opt.readtime = new Date().getTime();
    } else {
      url += (action + 'userread/');
    }
	
    $.post(url, opt, function(res) {
      if (res.status === 0) {
        // 重新设置cookie, 失效时间一年
        __global.limitStore(type, data, {expires: 8760, path:'/'});
        getShowHtmlString(type, data);
      }
    },'json').fail(function(res){
      layer.msg('服务器操作失败, 请重新操作本次删除过程。');
      // getShowHtmlString(type, data);
    });

  } else {
    __global.limitStore(type, data, {expires: 8760});
    getShowHtmlString(type, data);
  }
}

/**
 * [getDomain 获得CDN域名处理函数]
 * @return {[String]} [图片CDN URL]
 */
function getDomain() {
  return __global.config.imgCDN;
}

/**
 * [setDelimiter 分割符函数]
 */
function setDelimiter() {
  // 可变的分割符 配置这里全局修改
  return '&nbsp;'
}

/**
 * [getTimeSpan 距离时间处理函数]
 * @param  {[Number]} data [时间戳]
 * @return {[String]}    [返回处理后的时间]
 */
function getTimeSpan(data) {
  // data = parseInt(data, 10); // 将字符串转换成数字时间戳
  var getTimepan = parseInt((new Date().getTime() - data) / 1000);
  var day = Math.floor(getTimepan / 86400);
  var hour = Math.floor((getTimepan - day * 86400) / 3600);
  var minute = Math.floor((getTimepan - day * 86400 - hour * 3600) / 60);
  var second = Math.floor(getTimepan - day * 86400 - hour * 3600 - minute * 60);
  var str = '';

  if (day > 5) {
    return __global.formatDate(data, 'yyyy-MM-dd');
  }
  if (day > 0) {
    return day + '天 前阅读';
  }

  if (hour > 0) {
    return hour + '小时 前阅读';
  }
  if (minute > 0) {
    return minute + '分钟 前阅读';
  }
  return '1分钟 内阅读';
}

/*************** 订阅和历史的方法 结束 ****************/


/**
 * [thirdPartyComment 三方评论]
 * @return {[type]} [对页面存在三方评论调用]
 */
function thirdPartyComment() {
  //加载网友评论
  if ($('.ds-thread').length) {
    FilterPingLun();
    window.duoshuoQuery = {
      short_name: $('div[data-shortname]').attr('data-shortname')
    };
    __global.loadjs('http://static.duoshuo.com/embed.js', {
      async: true,
      charset: 'utf-8'
    });
  }
  
  function setChangyangConfig(){
	setTimeout(function(){
		try{
			window.changyan.api.config({
			   appid: 'cysLJ05yl',
			   conf: 'prod_1c81780da230bd95f423e5c1f51e54e7'
			});
		}catch(e){
			setChangyangConfig();
		}
	}, 100);
  }
  
  if($('#SOHUCS').length) {
	setChangyangConfig();
	__global.loadjs('http://changyan.sohu.com/upload/changyan.js', {
      async: true,
      charset: 'utf-8'
    });  
  }
}
/**
 * [FilterPingLun 多说过滤评论相关内容]
 * @param {[type]} pagename [description]
 */
function FilterPingLun(pagename) {
  $('body').on('click', '.ds-post-button', function() {
    var pl_str = $(this).parent().parent().find('textarea').val(); //$('form textarea').val();
    if (pl_str.length > 500) { //限制评论字数，超过500个字的评论大多是垃圾评论
      layer.alert('您的评论内容太长，请删除部分之后再提交！');
      return false;
    }
    if (pl_str.length < 5) { //限制评论字数，少于5个字的评论大多是垃圾评论
      layer.alert('您的评论内容太短，请不要发表无意义的评论哦！');
      return false;
    }
    //垃圾评论过滤
    pl_str = pl_str.replace(/ /g, ''); //将空格替换掉
    if (/\d{7,}/i.test(pl_str) || //连续7个以上数字，过滤发Q号和Q群的评论
      $('.ds-visitor-name').text().length > 20 || //用户名超过12个字符
      /(\d.*){7,}/i.test(pl_str) || //非连续的7个以上数字，过滤用字符间隔开的Q号和Q群的评论
      /\u52A0.*\u7FA4/i.test(pl_str) || //包含“加群”两字的通常是发Q群的垃圾评论
      /\u7f8e.*\u5973.*\u6fc0.*\u60c5/i.test(pl_str) || //包含“美女激情”的通常是色情广告评论
      /\u70b9.*\u6211.*\u5934.*\u50CF/i.test(pl_str) || //包含“点我头像”的通常是色情广告评论
      /(\u9876.*){5,}/i.test(pl_str) || //过滤5个以上“顶”字的评论
      /(http|com|net|cn|org|\uff43\uff4f\uff4d)/i.test(pl_str) || //过滤色情广告评论
      /[\u4E00-\u9FA5]/i.test(pl_str.replace(/\[[^\[\]]+\]/g, '')) == false || //过滤掉表情后不包括汉字的通常是垃圾评论
      /([\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D\u25CB\u58F9\u8D30\u53C1\u8086\u4F0D\u9646\u67D2\u634C\u7396\u96F6].*){7,}/i.test(pl_str) //过滤用汉字发Q号和Q群的评论
    ) {
      //layer.alert("请不要发表灌水、广告、违法、Q群Q号等信息，感谢您的配合！");
      $('form textarea').val('');
      layer.alert('评论已提交，请等待管理员审核，不要重复提交评论，感谢您的参与！');
      return false;
    }
    if (pagename == 'comic_dir' && __global.getLoginInfo()) { //记录已登陆网友评论操作
      $.post('/jsonp/addpinglun.html?t=' + -now, {
        comic_id: comic_id
      });
    }
  });
}
function noticeFn(){
  var $notice = $('#notice');
  var cookieNotice = parseInt(__global.cookie('notice'));
  var noticeId = $notice.data('id');
  if(noticeId != cookieNotice && $notice.length){
	layer.open({
	  type: 1,
	  title: '最新公告',
	  btn: ['朕已知, 你退下'],
	  content: $notice,
	  area: ['480px','auto'],
	  yes: function(index) {
		__global.cookie('notice', noticeId,{expires:8760});
		layer.close(index)
	  },
	  cancel: function(index) {
		__global.cookie('notice', noticeId,{expires:8760});
		layer.close(index)
	  }
	});
  }
}

/**
 * [baiduShare 百度分享异步调用]
 */
function baiduShare() {
  if ($('.bdsharebuttonbox').length) {
    __global.loadjs('http://bdimg.share.baidu.com/static/api/js/share.js', {
      async: true
    });
  }
}


