'use strict';

// 文档加载完成后执行
$(function() {
  // 测试设置cookie
  var userObj = {id: 4,openid: 'E8E9624A22874BDCE6E3B7E68D3DAD8F',type: 'qqdenglu',mail: '',name: '狼鹰',goldnum: 600,lastlogintime: 1481514064593,accessToken: '',headpic: 'http://qzapp.qlogo.cn/qzapp/100358052/E8E9624A22874BDCE6E3B7E68D3DAD8F/100',sex: 1}
  __global.cookie('user',JSON.stringify(userObj));

  // 获得当前漫画的ID方便提交
  var comic_id = parseInt($('h1[data-comic_id]').data('comic_id')) // 获得漫画的ID
  
  // tabs切换操作
  $('.tabs>.hd').each(function() {
    var _this = $(this),
      isIndexTabs = _this.parent().hasClass('tabs-index'),
      tabsBox = _this.parents('.tabs'),
      tabsOffset = isIndexTabs ? 12 : 0,
      modify = _this.find('.modify');
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

  // 懒加载图片
  var lazycfg = __global.config.lazyload;
  __global.lazyload({
    error: lazycfg.error,
    loading: lazycfg.loading,
    space: lazycfg.space
  });

  // 排行列表鼠标事件经过操作
  $('.rank-list .item').on('mouseenter', function() {
    $(this).addClass('active').siblings('.item').removeClass('active');
  })

  // 判断是否为首页对header、footer做显示操作
  var pathname = location.pathname.substring(5);
  if (/index/.test(pathname) || pathname === '') {
    $('#header').css({
      'background': 'none',
      zIndex: 2
    });
  } else {
    if (!$('#J_sigin').length) { // 对登录不设置一下样式
      $('body').css('paddingTop', '72px');
      $('#footer').addClass('mt24');
      $('.link').remove();
    }
  }

  // 判断IE阅览器版本进行操作
  if (__global.ie() < 9) {
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
  }

  // 判断用户是否登录
  if (!__global.cookie('user')) {
    $('#J_user').click(function() {
      showLoginBox();
      return false;
    })
  }

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
    typeObj.each(function(key, value) {
      if ($(this).hasClass('active')) {
        switch (key) {
          case 0:
            delRecord('ubook', -1)
            break;
          case 1:
            delRecord('urecord', -1)
            break
        }
      }
    })
  })

  // 订阅，历史滚动条模拟
  $('.scroll').scrollbar();

  // 水平点击滚蛋slider
  var sliderHorizontal = $('.slider-horizontal');
  setComicHorizontalSize(sliderHorizontal)
  $(window).resize(function(){
    setComicHorizontalSize(sliderHorizontal)
  })

  // 评分
  scoreFn(comic_id);

  // 订阅漫画
  $('#collect').click(function() {
    var _this = $(this);
    var data = _this.data('comic').split(',');
    addRecord(__global.config.recordType.ubook, [__global.parseInt(data[0]), data[1], '', '', '', new Date().getTime()]);
  });

  // 月票、推荐
  $.each(['addmonthticket', 'addrecommend'], function(i, v) {
    $('#'+ v.replace('add','')).click(function() { //绑定点击事件
      var opt = getLoginInfo();
      if(!opt) {
        return;
      }
      opt.comic_id = comic_id;
      $.post(__global.config.api + v, opt)
        .done(function(res) {
          var oTxt = _this.find('strong')
          oTxt.text(__global.parseInt(oTxt.text()) + 1);
          resStatusTips(res.status, msg, 1);
        })
        .fail(function(res) {
          resStatusTips(res.status, null);
        });
    });
  });

  // 金币打赏
  $('#gratuity').click(function(){
    var opt = getLoginInfo();
    if(!opt) {
      return;
    }
    opt.comic_id = comic_id;
    var _this = $(this);
    layer.prompt({
      title: '请输入您要打赏的金币数',
      formType: 0,
      btn: ['确认打赏', '取消']
      }, 
      function(goldnum, index) {
        goldnum = __global.parseInt(goldnum);
        if(!goldnum) {
          layer.msg('您最少要打赏1个金币!',{time: 0, btn: ['知道了']})
        }else{
          layer.close(index);
          opt.gold = goldnum;
          var author = $('.author-info .name').text();
          author = author ? ('作者:' + author):'知音漫客签约作者';
          resStatusTips(0, author+'非常感谢您打赏的'+ goldnum +'金币!', 1);
          $.post(__global.config.api + 'addgold', opt)
          .done(function(res) {
            var oTxt = _this.find('strong')
            oTxt.text(__global.parseInt(oTxt.text()) + goldnum);
            resStatusTips(res.status, '作者:'+$('.author-info .name').text()+'非常感谢您打赏的'+ goldnum +'金币!', 1);
          })
          .fail(function(res) {
            resStatusTips(res.status, null, 2);
          });
        }
      }
    );
  });

  // 三方登录方法相关操作
  thirdPartyLogin();

  // 三方评论
  thirdPartyComment();

  //首页切屏
  $('.superSlide').slide({
    titCell: '.hd ul',
    mainCell: '.bd ul',
    prevCell: '.ift-prev',
    nextCell: '.ift-next',
    titOnClassName: 'active',
    effect: 'leftLoop',
    interTime: 5000,
    vis: 'auto',
    scroll: 1,
    autoPlay: true,
    autoPage: '<li></li>',
    trigger: 'click'
  }).hover(function(){
    $(this).find('.ift-prev,.ift-next').show();
  },function(){
    $(this).find('.ift-prev,.ift-next').hide();
  });


  // 相关推荐切换操作
  $('#relatedComic').slide({
    mainCell: '.warp-slider',
    prevCell: '.ift-prev',
    nextCell: '.ift-next',
    mouseOverStop: true,
    trigger: 'click',
    titCell: '.hd ul li',
    titOnClassName: 'active',
    effect: 'left',
    vis: 'auto',
    scroll: 1
  });

  // 百度分享
  baiduShare();

  // 章节排序
  charpterRank();


  // loadRead body end
});

/**
 * [getLoginInfo 登录信息获得]
 * @return {[object]}    [返回用户cookie登录信息]
 */
function getLoginInfo(){
  var userData = JSON.parse(__global.cookie('user'));
  if (!userData) {
    showLoginBox();
    return false;
  }
  return userData
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
  // 搜索块js处理
  var objAlike = $('#J_alike');
  var searchHistory = $('.search-history');
  var noSearchInfo = '<p class="no-info">暂无相关搜索结果<strong>^_^</strong></p>'
  $('#search').on('keyup', function() {
    objAlike.show();
  });
  objAlike.on('click', '.clean', function(event) {
    if (!searchHistory.find('.no-info').length) {
      searchHistory.empty().html(noSearchInfo);
    }
  });
  searchHistory.on('click', '.close', function() {
      var _this = $(this);
      _this.parents('a').remove();
      if (!searchHistory.children('a').length) {
        searchHistory.html(noSearchInfo);
      }
    })
    // 解决在body下绑定隐藏搜索结果下拉框
  objAlike.click(function(event) {
    event.stopPropagation();
  });

  // 关闭搜索
  $('body').on('click', function(event) {
    objAlike.hide();
  });
}

/**
 * [logout 用户退出登录]
 */
function logout() {
  __global.cookie('user', null);
  __global.cookie('oldloginvar', null);
  __global.limitStore('ubook', null);
  __global.limitStore('urecord', null);
  getMyMenu();
  return false;
}

/**
 * [scoreFn 评分方法]
 * @param {[string]} id [要评分的漫画id]
 */
function scoreFn(id) {
  var progressStar = $('.score-star') // 评分星对象
  var oRatedNum = $('.rated strong') // 评价人数对象
  var oScoreNum = $('.score-num strong'); // 评分分数对象
  var initScore = Number(oScoreNum.text()); // 初始分数
  var initPepole = Number(oRatedNum.text()); // 初始总人数
  var oScoreBox = progressStar.children('.star-hover');

  progressStar.on('mousemove', function(event) {
    event = event || window.event;
    var _this = $(this);

    var offsetleft = _this.offset().left;
    var pageX = event.pageX || 0;
    var per = Math.round(pageX - offsetleft) / _this.width();

    per = per >= 1 ? 1 : per;
    per = per <= 0 ? 0 : per;

    oScoreNum.text((per * 10).toFixed(1));

    oScoreBox.css({
      width: per * 100 + '%'
    });
  }).on('mouseleave', function() {
    oScoreNum.text(initScore);
    oScoreBox.css({
      width: (initScore * 10) + '%'
    });
  }).on('click', function(event) {
    event.stopPropagation();
    var opt = getLoginInfo();
    if(!opt) {
      return;
    }

    var _this = $(this);
    var uScore = Number(oScoreNum.text());
    opt.comic_id = id;
    opt.score = uScore * 10;
    initScore = uScore; // 将初始值更改为用户的打分值

    // 先将用户的分数直接写入页面
    oScoreNum.text(initScore);
    oRatedNum.text(initPepole + 1); // 评价人数加1客户端直接处理，如果服务端返回则要要你用服务端
    // 解除事件绑定
    _this.off('mousemove mouseleave click');
    $.get(__global.config.api + 'addscore/', opt)
    .done(function(res) {
      resStatusTips(res.status, '感谢您的参与评价!', 1);
    }).fail(function(res) {
      scoreFn(id); //这里重新启用绑定事件，可以再次评分
      resStatusTips(res.status);
    });

  });
}

// 计算评价得分这里不需要了，统一通过后端处理
function countScore(score, oldScore, totalPeople) {
  var per = per || 100; // 默认100分制
  score = score || per; // 默认打分为100分可改为
  // 当前总人数，第一次打分时总人数不存在为0；
  totalPeople = parseInt(totalPeople, 10) || 0;
  // 当没有用户评分时的默认得分
  if (totalPeople <= 0) {
    return per
  }; // 默认得分数即分制
  return Math.round((oldScore * totalPeople + score) / (totalPeople + 1));
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

// 弹出登录框
function showLoginBox() {
  layer.open({
    type: 2,
    title: false,
    shadeClose: true,
    shade: 0.8,
    area: ['320px', '175px'],
    content: ['/app/login.html', 'no'] //iframe的url
  });
}

/*************** 订阅和历史的方法 开始 ****************/

/**
 * [getUserRecord 获得用户订阅记录]
 * @return {[Ａrray]} [description]
 */
function getUserRecord() {
  var userData = JSON.parse(__global.cookie('user'));
  var config = __global.config;
  var typeData = config.recordType;
  var ubook = typeData.ubook;
  var urecord = typeData.urecord;

  // 登录用户从服务获取数据且cookie没有过期的清空下
  if(userData && __global.limitStore(ubook) && !__global.limitStore(urecord)) {
    // showRecodHtml();
    // return false;

    var url = config.api + 'getuserrecord/';
    $.post(url, {type: userData.type, openid: userData.openid})
    .done(function(res) {
      // 获得用户的记录
      if(res.status === 0){
        // 将数据添加到本地
        $.each(typeData, function(i,v){
          $.each(data[v], function(k, m) {
            addRecord(v, m); // 数据只能1条条订阅添加
          })
        })
        showRecodHtml();
      }
    }).fail(function(res){
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
    html = '<p class="no-info">' + typeTips + '，<br><a href="/">立即阅读其它漫画。</a></p>'
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
  var href = data[0] + '/' + data[2] + '.html',
    src = getDomain() + data[0] + '.jpg',
    title = data[1] + setDelimiter() + data[3];

  return ('<li class="item' + (flag ? '' : ' nth-3n') + '"><a href="/' + href + '" class="thumbnail"><img src="../static/images/space3x4.gif" data-src="' + src + '" alt="' + title + '"><div class="group-info"><h3 class="title" title="' + title + '">' + data[1] + '</h3></div></a><div class="opt-del" data-id="' + data[0] + '"><i class="ift-del"></i><span class="text">删除</span></div></li>');
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
    src = getDomain() + data[0] + '.jpg';

  return ('<li class="item"><a href="' + href + '" class="thumbnail"><img src="../static/images/space3x4.gif" data-src="' + src + '" alt="' + data[1] + '"></a><div class="info"><h3 class="title"><a href="">' + data[1] + '</a></h3><p class="time">' + getTimeSpan(data[4]) + '</p><p class="attr"><span class="attr-label">阅读至:</span> <a href="' + readedHref + '">' + data[3] + '</a></p><p class="attr"><span class="attr-label">下一话:</span> <a href="' + nextHref + '">' + data[7] + '</a></p><div class="opt-del" data-id="' + data[0] + '"><i class="ift-del"></i><span class="text">删除</span></div></div></li>');
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
        layer.msg('漫画' + value[1] + '已被删除');
        loaclData.splice(key, 1);
        return false; // 查找到对应的漫画删除记录后跳出循环；
      }

      layer.msg('漫画数据查询错误！请重新再试');
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
 * [addRecord 添加记录，且每次只能存储一条数据, 对应以前的addUserBook]
 * @param {[String]} type [添加记录的类型]
 * @param {[Array]} data [添加订阅数据，以数组格式存储,
 * 阅读历史数据格式
 * 名称：irecord
 * 老格式 ：[漫画ID, 漫画名, 阅读章节URL,阅读章节名, 阅读时间, 阅读章节页码] (看漫网的)
 * 新格式 ：[漫画ID, 漫画名, 阅读章节ID, 阅读章节名, 阅读时间, 阅读章节页码, 下一话章节ID, 下一话章节名]
 * 新格式 ：[0:id, 1:name, 2:readid, 3:readname, 4:readtime, 5:readpage, 6:nextid, 7:nextname]
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
  }

  updateRecordData('add', type, data[0], loaclData);

}

/**
 * [updateRecordData 更新记录数据]
 * @param  {[string]} action [更新记录的方式：add, del]
 * @param  {[string]} type [记录数据类型 ubook, urecord]
 * @param  {[number]} id   [漫画ID]
 * @param  {[array]} data [更新后的本地的数据信息]
 */
function updateRecordData(action, type, id, data) {
  var userData = JSON.parse(__global.cookie('user'));
  if (userData) {
    __global.limitStore(type, data, {expires: 8760});
    // getShowHtmlString(type, data);
    // return;
    var opt = {
      comic_id: id,
      user: userData // 将用户信息一并提交到服务端
    };

    var config = __global.config;
    var url = config.api;
    if(type === config.recordType.ubook) {
      url += 'setusercollect/';
      opt.action = action;
      opt.readtime = new Date().getTime();
    } else {
      url += (action + 'userread/');
    }

    $.post(url, opt).done(function(res) {
      if (res.status === 0) {
        // 重新设置cookie, 失效时间一年
        __global.limitStore(type, data, {expires: 8760});
        getShowHtmlString(type, data)
      }
    }).fail(function(res){
      layer.msg('添加失败!');
    });

  }else {
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
 * [login 用户三方登录授权]
 * @return {[type]} [description]
 */
function login() {
  var match = location.search.match;
  var matchType = match(/type\=([a-z0-9]+)/i);
  var type = matchType ? matchType[1].toLocaleLowerCase() : false;
  var token = oldloginvar = lastargs = '';

  if (!type) {
    layer.msg('未获取到登录方式，请重新刷新再试!'); // 未获取到type
    return;
  }

  switch (type) {
    case 'qq':
      var qqMath = match(/access_token=([^\&]+)/i);
      token = qqMath ? qqMath[1] : false;
      oldloginvar = type + '#access_token=' + token;
      break;
    case 'sina':
      var sinaMath = match(/code=([a-z0-9]+)/i);
      token = sinaMath ? sinaMath[1] : false;
      oldloginvar = type + '&code=' + token;
      break;
  }

  if (!token) {
    layer.msg('登录授权失败，请重新刷新再试!'); // 未获取到token
    return;
  }

  // 判断是否登陆过，采用openid策略
  var userData = JSON.parse(__global.cookie('user'));
  if (userData) {
    lastargs = '?type=' + userData.type + '&openid=' + userData.openid;
  } else {
    lastargs = '?type=' + type + '&token=' + token;
  }

  $.ajax({
    url: __global.config.loginurl + lastargs,
    dataType: 'jsonp',
    type: 'post',
    jsonp: 'callback',
    success: function(data) {
      if (!data){
        return false;
      }
      layer.msg('登陆成功，正在为您保存状态，稍候即将返回先前浏览的页面...', {
        time: 0
      }); // 未获取到token
      __global.limitStore('oldloginvar', oldloginvar, {
        expires: 8760
      });
      __global.limitStore('user', data.user, {
        expires: 8760
      });
      //开始保存用户书架和历史记录
      var urecord = []
      var ubook = [];

      // 订阅格式：[0:id, 1:name, 2:latestid, 3:latestname, 4:readtime, 5:updatetime]
      var v = null;
      for (i in data.book || []) {
        v = data.book[i];
        ubook.push([v.id, v.name, v.latestid, v.latestname, v.readtime, v.updatetime]);
      }

      // 历史格式 ：[0:id, 1:name, 2:readid, 3:readname, 4:readtime, 5:readpage, 6:nextid, 7:nextname]
      for (i in data.record || []) {
        v = data.record[i];
        urecord.push([v.id, v.name, v.readid, v.readname, v.readtime, v.readpage, v.nextid, v.nextname]);
      }

      // 存储用户信息到客户端
      __global.limitStore('urecord', urecord, {
        expires: 8760
      });
      __global.limitStore('ubook', ubook, {
        expires: 8760
      });

      var logfrom = __global.cookie('logfrom');
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
  __global.cookie('logfrom', logfrom, {
    expires: 8760
  }); //存入cookie便于后台接收处理
  top.location = url;
}
/**
 * [thirdPartyLogin 三方登录DOM操作]
 */
function thirdPartyLogin() {
  // 判断是第三方登陆后转向
  if (location.search.match(/type\=([a-z0-9]+)/i)) {
    login();
  } else {
    $('#J_sigin').show();
  }
  $('#J_sigin').on('click', 'a', function() {
    var url = '';
    switch ($(this).data('flag')) {
      case 'qq':
        url = 'https://graph.qq.com/oauth2.0/authorize?client_id=101304854&response_type=token&scope=get_user_info&redirect_uri=' + encodeURIComponent(__global.config.redirect + '?type=qq')
        break;
      case 'sina':
        url = 'https://api.weibo.com/oauth2/authorize?client_id=1584026805&redirect_uri=' + encodeURIComponent(__global.config.redirect + '?type=sina')
        break;
    }
    authlogin(url);
  });
}

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
    if (pagename == 'comic_dir' && __global.cookie('user')) { //记录已登陆网友评论操作
      var comic_id = $('.ds-thread').data('thread-key').substr(2);
      $.post('/jsonp/addpinglun.html?t=' + -now, {
        comic_id: comic_id
      });
    }
  });
}


/**
 * [baiduShare 百度分享异步调用]
 */
function baiduShare() {
  window._bd_share_config = {
    common: {
      bdText: '',
      bdMini: 1,
      bdPic: ''
    },
    share: [{
      tag: 1,
      bdSize: 16
    }, {
      tag: 2,
      bdSize: 32
    }]
  };
  if ($('.bdsharebuttonbox').length) {
    __global.loadjs('http://bdimg.share.baidu.com/static/api/js/share.js', {
      async: true
    });
  }
}

// 漫画章节排序操作方法
function charpterRank() {
  //排序
  $('#charpterRank').click(function() {
    var oUL = $('#charpterList');
    var ift = $(this).find('i');
    if(ift.hasClass('ift-sort')) {
      ift.attr('class', 'ift-sort_up');
    }else{
      ift.attr('class', 'ift-sort');
    }
    //必须分两句执行，合并为一句将出问题
    oUL.find('.item').each(function(i, v){
      var _this = $(this);
      _this.prependTo(_this.parent());
    });
  });
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

