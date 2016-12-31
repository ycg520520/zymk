$(function () {
  // 公告
  noticeFn();
  // page btns
  var $cataBtn = $('.mk-cata-btn');
  var $indexBtn = $('.mk-index-btn');
  var $searchBtn = $('.mk-search-btn');
  var $shujiaBtn = $('.mk-shujia-btn');
  // pages
  var $indexWrap = $('.main-page-wrap');
  var $cataPage = $('#mk-cata-page');
  var $searchPage = $('#mk-search-page');
  var $shujiaPage = $('#mk-shujia-page');


  $indexBtn.on('click', function () {
    $(this).addClass('active').siblings().removeClass('active');
    $indexWrap.show();
    $searchPage.hide();
    $cataPage.hide();
    $shujiaPage.hide();
  });

  $searchBtn.on('click', function () {
    $indexWrap.hide();
    $searchPage.show();
    $cataPage.hide();
    $shujiaPage.hide();

    // search.js
    var $searchInput = $('.mk-s-input');
    // var $placeholder = $('.mk-placeholder');
    var $historyClear = $('.mk-clear');
    var $historyCon = $('.mk-history-con');
    var $searchBack = $('#search-header .mk-back-btn');

    $historyCon.on('click', '.mk-close', function () {
      var k = $(this).siblings('a').find('.text').text();
      $(this).parent('li').remove();
      saveSearchHistory(k);
      searchHistoryHtml();

    })

    // search input focus & blur
    /* $searchInput.focus(function () {
      $placeholder.hide();
    }).blur(function () {
      if (!$searchInput.val()) {
        $placeholder.show();
      }
    });
    $placeholder.click(function () {
      $searchInput.focus();
    }); */
	
	// 搜索关键词
	$('#J_search_btn').on('click', function(event) {
		event.stopPropagation();
		var keyword = $('#search').val() || $('#search').attr('placeholder');
		location='/sort/all.html#'+ encodeURIComponent(keyword);
	});
	
    $historyClear.on('click', function () {
      $historyCon.find('ul').empty();
      __global.cookie('historySearch', null);
    });

    // search
    $searchInput.on('keydown', function (event) {
      // 对输入进行ajax请求 延迟搜索，不让用户每次按键都提交请求;
      clearTimeout(window.st_search);
      window.st_search = setTimeout(getSearch, 500);
    });

    // back index 
    $searchBack.on('click', function () {
      $indexBtn.click();
    });
  });

  $cataBtn.on('click', function () {
    $(window).scrollTop(0);
    $(this).addClass('active').siblings().removeClass('active');
    $indexWrap.hide();
    $searchPage.hide();
    $cataPage.show();
    $shujiaPage.hide();

    var $cataline = $('#cat-top-nav .mk-cataline');
    var $cataNav = $('#cat-top-nav li');

    var cataNavSwiper = new Swiper('#cat-content', {
      autoHeight: true,
      onSlideChangeStart: function (swiper) {
        $cataNav.eq(cataNavSwiper.activeIndex).addClass('active').siblings().removeClass('active');
      }
    });

    // click to slide
    $cataNav.on('click', function () {
      cataNavSwiper.slideTo($cataNav.index(this), 300, true);
    });
  });

  $shujiaBtn.on('click', function () {
    $(window).scrollTop(0);
    $(this).addClass('active').siblings().removeClass('active');
    $indexWrap.hide();
    $searchPage.hide();
    $cataPage.hide();
    $shujiaPage.show();

    // shujia.js
    var $shujiaTitle = $('.mk-shujia-title li');
    var shujiaSwiper = new Swiper('#shujia-con', {
      autoHeight: true,
      onSlideChangeStart: function (swiper) {
        $shujiaTitle.eq(shujiaSwiper.activeIndex).addClass('active').siblings().removeClass('active');
      }
    });
    $shujiaTitle.on('click', function () {
      shujiaSwiper.slideTo($shujiaTitle.index(this), 300, true);
    });
  });


  hotSearch(); // 加载热门搜索
  getUserLoginHtml(); // 获得用户登录信息操作
  getUserRecord();
  // 阅读历史和订阅夹清空处理
  $('#J_clean_userData').click(function () {
    var typeObj = $(this).siblings('.mk-shujia-title').find('li');
    // 清除本地存储
    var delRecordFlag = '';
    typeObj.each(function (key, value) {
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
    updateRecordData('del', delRecordFlag, '', null);
  })

  // 上次最新阅读记录
  var userRecordData = __global.limitStore('urecord');
  if (userRecordData.length) {
    var tmpData = userRecordData[0];
    var str = '<aside class="mk-history"><i class="mk-dot"></i>&nbsp;<span>上次阅读：<a href="/' + tmpData[0] + '/' + tmpData[2] + '.html">' + tmpData[1] + ' ' + (tmpData[3] || '') + '</a></span><i class="mk-close">&times;</i></aside>';
    if (!$('.mk-history').length) {
      $('#top-slide').append(str);
    }
  }
  
  // bind user-head login handle
  $('.mk-shujia-header').on('click', '.ift-user', function() {
    var opt = __global.getLoginInfo();
    if (!opt) {
      return;
    }
  });
  // end $(fn(){});
});



/**
 * [randomTagsColor 随机指定背景颜色]
 * @param  {[object]} obj [要指定的随机jquery对象]
 * @param  {[array]} arr [要随机的颜色类名]
 */
function randomTagsColor(obj, arr) {
  var randomColorArr = arr || ['c1', 'c2', 'c3', 'c4', 'c5']; // 对应css样式
  var colorArrLen = randomColorArr.length;
  obj.each(function (i, v) {
    var random = 0;
    if (i < colorArrLen) {
      random = i;
    } else {
      random = Math.floor(Math.random() * colorArrLen);
    }
    $(this).addClass(randomColorArr[random]);
  })
}

// 热门搜索
function hotSearch() {
  searchHistoryHtml(); // 搜索历史
  var hotSearchData = JSON.parse(__global.cookie('hotSearch'));
  if (hotSearchData) {
    hotSearchHtml(hotSearchData);
  } else {
    $.ajax(__global.config.api + 'gethotsearch/', {
      dataType: 'jsonp',
      async: true,
      success: function (res) {
        var data = res.data.list;
        if (res.status === 0) {
          hotSearchHtml(data);
          __global.cookie('hotSearch', JSON.stringify(data), {
            expires: 0.5,
            path: '/'
          });
        }
      }
    });
  }
}
// 热门搜索html内容
function hotSearchHtml(data) {
  var str = '';
  var searchRecommend = $('#hot-search .mk-tags');
  $.each(data, function (i, v) {
    str += '<a href="/' + v.comic_id + '/" title="' + v.comic_name + '">' + v.comic_name + '</a>'
  });
  if (str === '') {
    str = '<p class="no-info">抱歉，暂没获取到大家搜索的漫画!<strong>^_^</strong></p>'
  }
  searchRecommend.html(str);
  randomTagsColor(searchRecommend.find('a'))
}
// 将用户的搜索历史存储在客户端
function saveSearchHistory(keyword, len) {
  len = len || 20;
  var searchHistory = __global.cookie('historySearch');
  var tmpArr = searchHistory ? searchHistory.split(',') : [];
  var isFlag = false;

  $.each(tmpArr, function (key, value) {
    if (value === keyword) {
      isFlag = true;
      tmpArr.splice(key, 1);
      return false;
    }
  });
  if (!isFlag) {
    if (tmpArr.length < len) {
      tmpArr.splice(0, 0, keyword);
    } else {
      tmpArr.splice(0, 0, keyword).pop();
    }
  }
  __global.cookie('historySearch', tmpArr.join(','), {
    expires: 10000,
    path: '/'
  });
}

function searchHistoryHtml() {
  var noSearchInfo = '<p class="no-info">暂无相关搜索历史<strong>^_^</strong></p>'
  var searchCookie = __global.cookie('historySearch');
  var searchData = searchCookie ? searchCookie.split(',') : [];
  var str = '';
  var searchHistory = $('.mk-history-con');
  $.each(searchData, function (key, value) {
    str += '<li><a href="javascript:;"><i class="ift-clock"></i><span class="text">' + value + '</span></a><a class="mk-close" href="javascript:;">&times;</a></li>';
  });
  if (!str) {
    searchHistory.html(noSearchInfo);
    return;
  }
  searchHistory.html('<ul>' + str + '</ul>');
}
// 下拉显示搜索结果
function getSearch() {
  var searchContent = $('#search-result');
  var searchResultCon = $('#search-result .mk-search-result-con')
  var historySearch = $('#history-search');
  var hotSearch = $('#hot-search');
  var keyword = $(".mk-s-input").val().trim();
  var noSearchInfo = '<p class="no-info">暂无相关搜索结果<strong>^_^</strong></p>'

  if (keyword) {
    $.ajax(__global.config.api + 'getsortlist', {
      dataType: 'jsonp',
      data: {
        key: keyword,
        topnum: 20
      },
      success: function (res) {
        if (res.status != 0 && res.data) {
          searchResultCon.html(noSearchInfo);
        } else {
          var str = '';
          var reg = new RegExp('(' + keyword + ')');

          saveSearchHistory(keyword); // 存储搜索历史

          $.each(res.data, function (i, v) {
            str += '<li><span class="fr-chapter">' + v.last_chapter.name + '</span><a href="/' + v.comic_id + '/">' + v.comic_name.replace(reg, '<strong>$1</strong>') + '</a></li>';
          });
          if (str === '') {
            str = noSearchInfo;
          }
          searchResultCon.html('<ul>' + str + '</ul>');
          searchHistoryHtml();
          searchContent.show();
          historySearch.hide()
          hotSearch.hide();
        }
      }
    });
  } else {
    searchResultCon.html(noSearchInfo);
    searchContent.delay(500).hide()
    historySearch.show();
    hotSearch.show();
  }
}

/*************** 订阅和历史的方法 开始 ****************/

// 提交字段数组转换
function postRecordField(type, arr) {
  var typeData = __global.config.recordType;
  switch (type) {
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
function recordTransformArr(type, obj) {
  var tmpArr = [];
  var typeData = __global.config.recordType;
  switch (type) {
    case typeData.urecord:
      tmpArr = [obj.comic_id, obj.comic_name, obj.chapter_id, obj.chapter_name, obj.readtime, obj.readpage, obj.next_chapter_id, obj.next_chapter_name]
      break;
    case typeData.ubook:
      tmpArr = [obj.comic_id, obj.comic_name, obj.last_chapter.id, obj.last_chapter.name, obj.addtime, obj.update_time]
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


  // 登录用户从服务获取数据且cookie没有过期的清空下
  if (opt && !__global.cookie('urecordCacheTime')) {
    var url = config.api + 'getuserrecord/';
    // 获取本地对于的记录数据
    var ubookData = __global.limitStore(ubook) || [];
    var urecordData = __global.limitStore(urecord) || [];
    opt.sync = (function () {
      var obj = {};
      // 这里可以提炼出来
      // 将本地数组数据中最新数据组装好提交给服务端
      if (ubookData.length) {
        obj['user_collect'] = [];
        $.each(ubookData, function (i, v) {
          obj['user_collect'].push(postRecordField(ubook, v))
        });
      }
      if (urecordData.length) {
        obj['user_read'] = [];
        $.each(urecordData, function (i, v) {
          obj['user_read'].push(postRecordField(urecord, v))
        });
      }
      return JSON.stringify(obj);
    })();


    // 将本地数据提交到服务器端后返回
    $.post(url, opt, function (res) {
        // 获得用户的记录
        if (res.status === 0) {
          // 将数据添加到本地
          $.each(typeData, function (i, v) {
            var tmpArr = [];

            $.each(res.data[v], function (k, m) {
              tmpArr.push(recordTransformArr(v, m));
            });
            __global.limitStore(v, tmpArr, {
              expires: 8760,
              path: '/'
            });
          });

          // 设置阅读过期时间为1天，目的是好从服务器拉去数据
          __global.cookie('urecordCacheTime', true, {
            expires: 24
          });
          showRecodHtml(); // 重新更新用户记录数据
        }
      }, 'json')
      .fail(function (res) {
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
  obj.on('click', '.opt-del', function (event) {
    delRecord(type, $(this).data('id'));
    /* if(type === 'ubook') {
      listCollect($(this).parents('.comic-list').children());
    } */
    $(this).parents('.mk-shujia-item').remove(); //删除掉当前的类
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

  $.each(data, function (key, value) {
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
    html = '<p class="no-info"><a href="/">' + typeTips + '，<br>立即阅读其它漫画。</a></p>'
  }
  obj.html(html)
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
  var href = data[0] + '/' + data[2] + '.html',
    src = getDomain().format(__global.getPathById(data[0])),
    title = data[1] + setDelimiter() + data[3];
  var hasnew=0;
  return ('<li class="mk-shujia-item clearfix"><span class="opt-del" data-id="' + data[0] + '"><i class="ift-del"></i></span><a class="mk-cover" href="/' + data[0] + '/"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-src="' + src + '" alt="' + title + '"></a><div class="mk-col-detail"><h2 class="mk-comic-name" title="' + title + '"><a href="/' + data[0] + '/" title="' + data[1] + '">' + data[1] + '</a></h2><time>' + getTimeSpan(data[4]) + '</time><p class="has-update">' + ( data[5] && data[5]>data[4] && ++hasnew ? ('<a class="red">有更新</a>') : '') + '</p><p class="mk-update">更新：<a href="/' + href + '">' + data[3] + '</a></p></div></li>');

}

/**
 * 阅读历史每一项目展示html字符串数据
 * @param  {[Array]} data [数组格式详见下]
 * 阅读历史数据格式
 * 名称：urecord
 * 老格式 ：[漫画ID, 漫画名, 阅读章节url,阅读章节名, 阅读时间, 阅读章节页码] (看漫网的)
 * 新格式 ：[漫画ID, 漫画名, 阅读章节id, 阅读章节名, 阅读时间, 阅读章节页码, 下一话章节ID, 下一话章节名]
 * 新格式 ：[0:id, 1:name, 2:readid, 3:readname, 4:readtime, 5:readpage, 6:nextid, 7:nextname]
 * @return {[string]}    [阅读历史每一项目展示html字符串数据]
 */
function showHistoryItem(data) {
  var href = data[0] + '.html', // 漫画详情页
    nextHref = data[0] + '/' + data[6] + '.html', // 漫画下一话阅读页
    readedHref = data[0] + '/' + data[2] + '.html', // 漫画已经阅读阅读页
    src = getDomain().format(__global.getPathById(data[0]));
  
  return ('<li class="mk-shujia-item clearfix"><a class="mk-continue" href="/' + nextHref + '"><i class="ift-shu"></i>续看</a><span class="opt-del" data-id="' + data[0] + '"><i class="ift-del"></i></span><a class="mk-cover" href="/' + data[0] + '/"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-src="' + src + '" alt="' + data[1] + '"></a><div class="mk-his-detail"><h2 class="mk-comic-name"><a href="/' + data[0] + '/" title="' + data[1] + '">' + data[1] + '</a></h2><time>' + getTimeSpan(data[4]) + '</time><p class="mk-update">更新：' + data[7] + '</p><p class="mk-readed">已读：<a href="' + readedHref + '">' + data[3] + '</p></div></li>');
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
    $.each(loaclData, function (key, value) {
      if (id == value[0]) {
        layer.msg('漫画' + value[1] + '已被删除');
        loaclData.splice(key, 1);
        return false; // 查找到对应的漫画删除记录后跳出循环；
      }
    })
  } else {
    loaclData = []; // 全部清数空据
    layer.msg('漫画记录已被删除!');
  }
  // 只有没有数据时才执行getShowHtmlString方法来重新写html的提示
  // 但是这里会出现一个问题对订阅指定过nth-3n类会出现问题。
  // if(!loaclData.length){
  //   getShowHtmlString(type, loaclData) // 重新插入数据
  // }

  updateRecordData('del', type, id, loaclData);
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
    __global.limitStore(type, data, {
      expires: 8760,
      path: '/'
    });
    opt.comic_id = id;

    var config = __global.config;
    var url = config.api;
    if (type === config.recordType.ubook) {
      url += 'setusercollect/';
      opt.action = action;
      opt.readtime = new Date().getTime();
    } else {
      url += (action + 'userread/');
    }

    $.post(url, opt, function (res) {
      if (res.status === 0) {
        // 重新设置cookie, 失效时间一年
        __global.limitStore(type, data, {
          expires: 8760,
          path: '/'
        });
        getShowHtmlString(type, data);
      }
    }, 'json').fail(function (res) {
      layer.msg('服务器操作失败, 请重新操作本次删除过程。');
      // getShowHtmlString(type, data);
    });

  } else {
    __global.limitStore(type, data, {
      expires: 8760
    });
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
 * [logout 用户退出登录]
 */
function logout() {
  // console.log('ddddd')
  __global.cookie('user', null);
  __global.cookie('oldloginvar', null);
  __global.cookie('urecordCacheTime', null); // 清除阅读记录缓存时间保证下次登录同步到最新的数据
  __global.limitStore('ubook', null);
  __global.limitStore('urecord', null);
  getUserRecord();
  getUserLoginHtml();
  return false;
}

// 获得用户登录后的html
function getUserLoginHtml() {
  var userData = JSON.parse(__global.cookie('user'));
  var userLoginInfo = $('#user_logininfo');
  var hdLogout = userLoginInfo.find('.logout');
  var userHd = userLoginInfo.find('.user-head');
  var headPic = '<i class="ift-user"></i>';
  if (userData) {
    hdLogout.show();
    if (userData.headpic) {
      userHd.html('<img class="thumbnail" src="' + userData.headpic + '">');
    } else {
      userHd.html(headPic);
    }
    // 距离上次登陆超过1天，则利用隐藏iframe重登陆并获取最新书架数据，不然漫画更新后无法显示“有更新”
    if (__global.now - __global.parseInt(userData.lastlogintime) > 864e5) {
      $('body').append('<iframe scrolling=no frameborder=no width="0" height="0" src="/login.htm?type=' + (__global.cookie('oldloginvar') || '') + '"></iframe>'); //距离上次登陆超过1天，则利用隐藏iframe重登陆并获取最新书架数据，不然漫画更新后无法显示“有更新”
    }
  } else {
    hdLogout.hide();
    userHd.html(headPic);
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
	  area: ['80%','auto'],
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