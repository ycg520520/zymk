$(function () {
	
  // changyan
  (function() {
	  function getQueryString(name) {
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
		var r = window.location.search.substr(1).match(reg);
		if (r != null) {
		  return unescape(r[2]);
		}
		return null;
	  }
	  var comic_id = (location.hash.substring(1) ? location.hash.substring(1) : getQueryString('id')) || 'index';
	  var node = document.createElement("div");
	  node.id = "SOHUCS";
	  node.setAttribute('sid', 'comic' + comic_id);
	  document.getElementsByTagName('body')[0].appendChild(node);
	})();

  // >12隐藏
  $('.mk-list-con li:gt(11)').hide();

  var $underline = $('.mk-underline');
  var $listNav = $('.mk-m-tab li');
  var $listMore = $('.mk-m-list .mk-more');
  var $listCon = $('.mk-list-con ul');
  var $sortBtn = $('.mk-sort-btn');
  var $fanRankBtn = $('.mk-fan-rank .fan-rank-title span');
  var isUp = true;

  var mainSwiper = new Swiper('.mk-m-con', {
    autoHeight: true,
    onSlideChangeStart: function (swiper) {
      if (mainSwiper.activeIndex === 0) {
        $underline.animate({
          left: window.innerWidth / 750 * 84 + 'px'
        }, 300);
        $listNav.eq(0).addClass('active')
          .siblings().removeClass('active');
      } else if (mainSwiper.activeIndex === 1) {
        $underline.animate({
          left: window.innerWidth / 750 * 330 + 'px'
        }, 300);
        $listNav.eq(1).addClass('active')
          .siblings().removeClass('active');
      } else if (mainSwiper.activeIndex === 2) {
        $underline.animate({
          left: window.innerWidth / 750 * 578 + 'px'
        }, 300);
        $listNav.eq(2).addClass('active')
          .siblings().removeClass('active');
      }
    }
  });
  mainSwiper.slideTo(1, 0, true);
  // click to slide
  $listNav.on('click', function () {
    mainSwiper.slideTo($listNav.index(this), 300, true);
  });

  var worksSwiper = new Swiper('.mk-works-con', {
    freeMode: true,
    slidesPerView: 'auto',
  });

  var recomSwiper = new Swiper('.mk-recommend-con', {
    freeMode: true,
    slidesPerView: 'auto',
  });

  // 列表加载更多
  var isMoreOpenFlag = false;
  $listMore.on('click', function () {
    if (isMoreOpenFlag) {
      $(this).html('查看全部 <i class="ift-down"></i>');
      $('.mk-list-con li:gt(11)').hide();
      resetSwiperWrap(this);
      isMoreOpenFlag = false;
    } else {
      $(this).html('收起 <i class="ift-up"></i>');
      $('.mk-list-con li:gt(11)').show();
      resetSwiperWrap(this);
      isMoreOpenFlag = true;
    }
  });

  // 翻转
  $sortBtn.on('click', function () {
    var aLi = document.querySelectorAll('.mk-list-con li');
    var arr = [];
    for (var i = 0; i < aLi.length; i++) {
      arr.push(aLi[i]);
    }
    arr.reverse();
    $('.mk-list-con li').show();
    for (var i = 0; i < arr.length; i++) {
      $listCon.append(arr[i]);
    }
    if (isMoreOpenFlag) {
      $('.mk-list-con li').show();
    } else {
      $('.mk-list-con li:gt(11)').hide();
    }

    if (isUp) {
      $(this).html('↑ 升序');
      isUp = false;
    } else {
      $(this).html('↓ 降序');
      isUp = true;
    }
  });

  var $ypRankDiv = $('.mk-yp-rank');
  var $dsRankDiv = $('.mk-ds-rank');
  $fanRankBtn.on('click', function () {
    $(this).addClass('active').siblings().removeClass('active');
    if ($(this).index() === 0) {
      $ypRankDiv.show();
      $dsRankDiv.hide();
    } else {
      $dsRankDiv.show();
      $ypRankDiv.hide();
    }
    resetSwiperWrap(this);
  });

  __global.lazyload();


  // pc deyail.js
  // 获得当前漫画的ID方便提交
  var oH1 = $('h1[data-comic_id]');
  var comic_id = parseInt(oH1.data('comic_id')); // 获得漫画的ID
  var comic_name = oH1.text(); // 获得漫画的名字

  ;
  (function() {
    var type = __global.config.recordType.ubook;
    var loaclData = __global.limitStore(type) || []; // 不存在则为空数组
    if (loaclData.length) {
      // 查询是否存在当前要添加的记录
      $.each(loaclData, function (key, value) {
        if (value[0] == comic_id) {
          $('.mk-like i').attr('class', 'ift-lovered');
        }
      });
    }
  })();

  randomTagsColor($('#randomColor .tags'));

  $.post(__global.config.api + 'share/', {
    comic_id: comic_id
  }, function (res) {
    if (res.status == 0) {
      var oTxt = $('#shareComic').next('p').find('.mk-num');
      oTxt.text(__global.parseInt(oTxt.text()) + 1);
      // resStatusTips(res.status, msg, 1);
    }
  }, 'json');

  // 评分
  scoreFn(comic_id);

  // 订阅漫画
  $('#collect').click(function () {
    // var oCollectNum = _this.next('p').find('.mk-num');
    addRecord(__global.config.recordType.ubook, [comic_id, comic_name, '', '', new Date().getTime(),'']);
	$('.mk-like i').attr('class', 'ift-lovered');
  });
  // top like btn click
  $('.mk-like').on('click', function () {
    $('#collect').click();
  });
  
  // 阅读点击量
  __global.readCount(comic_id);

  // 月票、推荐
  $.each(['addmonthticket', 'addrecommend'], function (i, v) {
    $('#' + v.replace('add', '')).click(function () { //绑定点击事件
      var _this = $(this);
      var opt = __global.getLoginInfo();
      if (!opt) {
        return;
      }
      var msg = '感谢您对本漫画的支持！';
      opt.comic_id = comic_id;
      $.ajax(__global.config.api + v, {
          dataType: 'json',
          data: opt,
          success: function (res) {
            if (res.status == 0) {
              var oTxt = _this.next('p').find('.mk-num');
              oTxt.text(__global.parseInt(oTxt.text()) + 1);
              resStatusTips(res.status, msg, 1);
            } else {
              resStatusTips(res.status, res.msg, 1);
            }
          }
        })
        .fail(function (res) {
          resStatusTips(res.status, null);
        });
    });
  });

  // 金币打赏
  $('#reward').click(function () {
    var opt = __global.getLoginInfo();
    if (!opt) {
      return;
    }
    opt.comic_id = comic_id;
    var _this = $(this);
    layer.prompt({
        title: '请输入您要打赏的金币数',
        formType: 0,
        btn: ['确认打赏', '取消']
      },
      function (goldnum, index) {
        goldnum = __global.parseInt(goldnum);
        if (!goldnum) {
          layer.msg('您最少要打赏1个金币!', {
            time: 0,
            btn: ['知道了']
          })
        } else {
          layer.close(index);
          opt.gold = goldnum;
          var author = $('.author-info .name').text();
          author = author ? ('作者:' + author) : '知音漫客签约作者';
          resStatusTips(0, author + '非常感谢您打赏的' + goldnum + '金币!', 1);
          $.ajax(__global.config.api + 'addgold/', {
            data: opt,
            dataType: 'json',
            success: function (res) {
              var oTxt = _this.next('p').find('.mk-num');
              oTxt.text(__global.parseInt(oTxt.text()) + goldnum);
              resStatusTips(res.status, '作者:' + $('.author-info .name').text() + '非常感谢您打赏的' + goldnum + '金币!', 1);
            }
          }).fail(function (res) {
            resStatusTips(res.status, null, 2);
          });
        }
      }
    );
  });

  // 打分 
  $('.mk-dafen').on('click', function () {
    var aIcon = $('#Scorebox .ift-xing');
    var confirmBtn = $('#Scorebox .mk-confirm');
    var finalScore = 0;

    event.stopPropagation();
    var opt = __global.getLoginInfo();
    if (!opt) {
      return;
    }

    var scoreBox = layer.open({
      content: $('#Scorebox'),
      area: ['auto', 'auto'],
      // title: false,
      title: '打分',
      type: 1,
      closeBtn: 1,
      success: function () {
        aIcon.on('click', function () {
          if (!$(this).hasClass('active')) {
            $(this).addClass('active').prevAll().addClass('active');
        finalScore = ($(this).index() + 1) * 2;
          } else {
            $(this).nextAll().removeClass('active');
            finalScore = ($(this).index() + 1) * 2;
          }
        });
        confirmBtn.on('click', function () {
          $.post(__global.config.api + 'addscore/', opt, function (res) {
              resStatusTips(res.status, '感谢您的参与评价!', 1);
            }, 'json')
            .fail(function (res) {
              scoreFn(id); //这里重新启用绑定事件，可以再次评分
              resStatusTips(res.status);
            });
          aIcon.each(function () {
            $(this).removeClass('active');
          });
          layer.close(scoreBox)
        });
      }

    });

  });

  // 详情页用户阅读历史展示显示到章节列表上;
  var readHistory = __global.limitStore(__global.config.recordType.urecord);
  if (readHistory) {
    $.each(readHistory, function (i, v) {
      $('[data-id="' + v[2] + '"]').addClass('readed').append('<i class="ift-read"></i>');
    });
  }

  // 漫画描述详情
  // $('#comic_desc').find('.desc-con').scrollbar();
  $('#comic_desc').click(function () {
    var oDesCon = $(this).find('.desc-con');
    var toggleTags = $(this).find('.ift-down').attr('class', 'ift-up');
    layer.open({
      title: comic_name + '详情描述',
      btn: '',
      area: [oDesCon.width() + 'px', '320px'],
      content: $('#layerOpenCon').html(),
      shade: 0.8,
      shadeClose: true,
      anim: 1,
      cancel: function () {
        toggleTags.attr('class', 'ift-down');
      }
    });
  });
  

  $('#shareComic').click(function() {
    var shareBox = layer.open({
      content: $('#mk-share'),
      title: '分享',
      shadow: 0.75,
      type: 1,
      area: ['auto', 'auto']
    });
  });
  
  // $('.mk-top-nav .mk-msg').click(function() {
    // var changBox = layer.open({
      // content: $('#SOHUCS '),
      // title: '评论',
      // shadow: 0.75,
      // type: 1,
      // area: ['auto', 'auto']
    // });
  // })
  
  baiduShare();

});

/**
 * reload swiper-wrapper heights
 */
function resetSwiperWrap(obj) {
  var tarHeight = $(obj).parents('.swiper-slide').height();
  $(obj).parents('.swiper-wrapper').height(tarHeight);
}

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

  progressStar.on('mousemove', function (event) {
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
  }).on('mouseleave', function () {
    oScoreNum.text(initScore);
    oScoreBox.css({
      width: (initScore * 10) + '%'
    });
  }).on('click', function (event) {
    event.stopPropagation();
    var opt = __global.getLoginInfo();
    if (!opt) {
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
    $.post(__global.config.api + 'addscore/', opt, function (res) {
        resStatusTips(res.status, '感谢您的参与评价!', 1);
      }, 'json')
      .fail(function (res) {
        scoreFn(id); //这里重新启用绑定事件，可以再次评分
        resStatusTips(res.status);
      });

  });
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
  if (!data.length) {
    return;
  }

  var loaclData = __global.limitStore(type) || []; // 不存在则为空数组
  var isCollect = (type == __global.config.recordType.ubook); // 判断是否为订阅
  if (loaclData.length) {
    var isFlag = false;
    // 查询是否存在当前要添加的记录
    $.each(loaclData, function (key, value) {
      if (value[0] == data[0]) {
        isFlag = true;
      }
    });

    // 存在的记录直接跳出存储方法
    if (isFlag) {
      // 已经存在本条记录，当为订阅才做提示，历史记录是不做提示的
      if (isCollect) {
        layer.msg('您已经订阅过了漫画: ' + data[1],{area:['420px','auto']});
      }
      return false;
    }
  }

  // 根据类型提示不同的内容
  loaclData.splice(0, 0, data); // 把最新的数据追加在数组的最前面
  // 只有是订阅才做提示
  if (isCollect) {
    layer.msg('漫画: ' + data[1] + '已经添加到您的订阅中了!');
    var oCollectNum = $('#collect').next('p').find('.mk-num');
    oCollectNum.text(__global.parseInt(oCollectNum.text()) + 1);
    $('.mk-like i').attr('class', 'ift-lovered');
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
  var opt = __global.getLoginInfo(true);
  if (opt) {
    __global.limitStore(type, data, {
      expires: 8760
    });
    // getShowHtmlString(type, data);
    // return;
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
          expires: 8760
        });
        getShowHtmlString(type, data);
      }
    }, 'json').fail(function (res) {
      layer.msg('服务器操作失败, 稍后我们会自动为您同步到服务器!');
      getShowHtmlString(type, data);
    });

  } else {
    __global.limitStore(type, data, {
      expires: 8760
    });
    getShowHtmlString(type, data);
  }
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
    html = '<p class="no-info">' + typeTips + '，<br><a href="/">立即阅读其它漫画。</a></p>'
  }
  if (obj.find('.scroll .scroll-content').length) {
    obj.find('.scroll .scroll-content').html(html)
  } else {
    obj.find('.scroll').html(html)
  }
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


function baiduShare() {
  window._bd_share_config = {
    common: {},
    share: {}
  };
  if ($('.bdsharebuttonbox').length) {
    __global.loadjs('http://bdimg.share.baidu.com/static/api/js/share.js', {
      async: true
    });
  }
}
