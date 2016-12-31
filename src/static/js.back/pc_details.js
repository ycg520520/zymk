$(function(){
  // 获得当前漫画的ID方便提交
  var oH1 = $('h1[data-comic_id]');
  var comic_id = parseInt(oH1.data('comic_id')) // 获得漫画的ID
  var comic_name = oH1.text() // 获得漫画的名字
  
  randomTagsColor($('#randomColor .tags'));

  // 评分
  scoreFn(comic_id);
  
  
  // 订阅漫画
  $('#collect').click(function() {
    addRecord(__global.config.recordType.ubook, [comic_id, comic_name, '', '', new Date().getTime(),'']);
  });
  
  // 阅读点击量
  __global.readCount(comic_id);

  // 月票、推荐
  $.each(['addmonthticket', 'addrecommend'], function(i, v) {
    $('#'+ v.replace('add','')).click(function() { //绑定点击事件
      var opt = __global.getLoginInfo();
	  var _this = $(this);
      if(!opt) {
        return;
      }
      opt.comic_id = comic_id;
	  var msg = '感谢您对本漫画的支持！';
      $.ajax(__global.config.api + v, {
		  dataType:'json',
		  data: opt,
		  success: function(res) {
            var oTxt = _this.find('strong')
			if(res.status === 0){
				oTxt.text(__global.parseInt(oTxt.text()) + 1);
				resStatusTips(res.status, msg, 1);
			}else{
				resStatusTips(res.status, res.msg, 1);
			}
		  }
		})
        .fail(function(res) {
          resStatusTips(res.status, null);
        });
    });
  });

  // 金币打赏
  $('#reward').click(function(){
    var opt = __global.getLoginInfo();
    if(!opt) {
      return;
    }
    opt.comic_id = comic_id;
    var _this = $(this);
	var userData = JSON.parse(__global.cookie('user'));
    layer.prompt({
      title: '您还有'+ userData.goldnum +'个金币',
      formType: 0,
      btn: ['确认打赏', '取消']
      }, 
      function(goldnum, index) {
        goldnum = __global.parseInt(goldnum);
        if(!goldnum) {
          layer.msg('您最少要打赏1个金币!',{time: 0, btn: ['知道了']})
        }else{
		  if(userData.goldnum<goldnum){
			layer.msg('你没有足够的金币!',{time: 0, btn: ['知道了']})
			return false;
		  }
		  
		  layer.close(index);
          opt.gold = goldnum;
          var author = $('.author-info .name').text();
          author = author ? ('作者:' + author):'知音漫客签约作者';
          resStatusTips(0, author+'非常感谢您打赏的'+ goldnum +'金币!', 1);
          $.post(__global.config.api + 'addgold/', opt, function(res) {
			// 重写回cookie
			userData.goldnum = userData.goldnum - goldnum;
			__global.cookie('user',JSON.stringify(userData),{expires: 8760});
			
            var oTxt = _this.find('strong')
            oTxt.text(__global.parseInt(oTxt.text()) + goldnum);
            resStatusTips(res.status, '作者:'+$('.author-info .name').text()+'非常感谢您打赏的'+ goldnum +'金币!', 1);
          },'json')
          .fail(function(res) {
            resStatusTips(res.status, null, 2);
          });
        }
      }
    );
  });

  // 详情页用户阅读历史展示显示到章节列表上;
  var readHistory = __global.limitStore(__global.config.recordType.urecord);
  var lastChapterHref = $('#chapterList li:eq(0)').find('a').attr('href');
  if(readHistory) {
    $.each(readHistory, function(i, v){
	  $('#chapterList li').each(function(){
		var $this = $(this);
		if($this.data('id')==v[2]){
		  $this.addClass('readed').append('<i class="ift-read"></i>');
		  lastChapterHref = $this.find('a').attr('href');
		}
	  });
    });
  }
  $('#read').click(function(){
	location.href = lastChapterHref;
  });

  // 漫画描述详情
  // $('#comic_desc').find('.desc-con').scrollbar();
  $('#comic_desc').click(function(){
    var oDesCon = $(this).find('.desc-con');
    var toggleTags = $(this).find('.ift-down').attr('class', 'ift-up');
    layer.open({
      title: comic_name + '详情描述',
      btn:'',
      area:[oDesCon.width()+'px', '320px'],
      content: $('#layerOpenCon').html(),
      shade: 0.8,
      shadeClose: true,
      anim: 1,
      cancel: function(){
        toggleTags.attr('class', 'ift-down');
      }
    });
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
  chapterRank();
  
  // 获取评论数
  $.post('http://changyan.sohu.com/api/2/topic/count',{topic_source_id:'comic'+comic_id,client_id:'cysLJ05yl'},function(res){
	$('#comment_num').text(res.result['comic'+comic_id].comments);
  },'jsonp');
  
  //滑动到锚点
	$('a[href^=#]').on("click",function() {
		if($(this.hash).length) {
			$("html,body").animate({ scrollTop: $(this.hash).offset().top-$(this).offset().top+$(window).scrollTop() },{queue:false,duration:1000});
		} else $("html,body").animate({ scrollTop: 0 },{queue:false,duration:1000});
		return false;
	});
  
});


// 漫画章节排序操作方法
function chapterRank() {
  //排序
  $('#chapterRank').click(function() {
    var oUL = $('#chapterList');
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
    var opt = __global.getLoginInfo();
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
    $.post(__global.config.api + 'addscore/', opt, function(res) {
      resStatusTips(res.status, '感谢您的参与评价!', 1);
    },'json')
    .fail(function(res) {
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
