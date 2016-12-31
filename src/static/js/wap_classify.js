$(function() {
  // 点击显示下拉菜单
  var $mkSelectBtn = $('.mk-select-btn');
  var $mkSelectBox = $('.mk-select-box');
  $mkSelectBtn.on('click', function(event) {
	event.stopPropagation();
    if($mkSelectBox.is(':visible')){
	  $mkSelectBox.fadeOut(400);
    }else{
	  $mkSelectBox.fadeIn(400);
    }
  });
  $mkSelectBox.on('click', function(event) {
	$mkSelectBox.fadeOut(400);
	event.stopPropagation();
  });
  $('body').on('touchend', $mkSelectBtn, function(){
	$mkSelectBox.fadeOut(400);  
  })
  
  // 获得所有的漫画
  getAllComic();
  
  // 排序
  $('.mk-select-box').on('click', 'li', function(){
	var $this = $(this);
    if($this.hasClass('active')){
      return;
    }
    $this.addClass('active').siblings('li').removeClass('active');
    // 漫画id,漫画名称,章节id,章节名称,漫画类型,更新时间,人气,打赏,评分,月票
    var eq = $this.index() + 5;
    // 对筛选数据进行排序
    comicRank(filterData, eq);
    showComicList(filterData, parseInt($('.pages:eq(0) .active').text(), 10));
  });

});

// 漫画数据筛选数据排序
function comicRank(data, id) {
  if(!data){
    return;
  }
  // 以倒序排序
  return data.sort(function(a, b){
    if(b[id]-a[id] === 0){
      return b[6]-a[6]; // 如果相同按照更新时间来排序
    }else{
      return b[id]-a[id];
    }
  })
}


/**
 * [siftinit 获得所有筛选页的漫画数据 callback回调必须是全局方法或变量]
 * @param  {[string]} domain [callback 后的图片域名地址]
 * @param  {[object]} data   [description]
 * @return {[type]}        [description]
 */
// function siftinit(data) {
window.siftinit = function(domain, data) {
  var cacheTime = 0.5;  // 30分钟缓存时间
  var cacheTimeStamp = (new Date().getTime()) +  cacheTime * 36000;
  // 将数据存储到本地localstorage
  if(typeof localStorage === 'object'){
    // __global.cookie('allcomicCacheTime', true, {expires: cacheTime, path:'/'});
    __global.limitStore('allcomicCacheTime', cacheTimeStamp, {expires: cacheTime, path:'/'});
    try{
      localStorage.setItem('comicDomain', domain);
      localStorage.setItem('comicTotal', data.length);
      $.each(data, function(i,v){
        localStorage.setItem('comic-'+i, JSON.stringify(v));
      })
    }catch(oException) {
      __global.cookie('allcomicCacheTime', null); // 没有存储成功则清楚cookie
      if(oException.name == 'QuotaExceededError'){
        // console.log('超出本地存储限额！');
      }
    }
    // 请求到数据后过10分钟后再次重新请求一遍更新数据以便漫画有更新将其重新写入本地数据
    // 这时的cookie一定是失效的；
    // setTimeout(function() {
    //   getAllComic();
    // }, cacheTime);
  }

  // window.imgdomain = __global.config.imgCDN;
  window.imgdomain = domain;
  window.allcomic = data;
  getSelectResult();
}

/**
 * [getAllComic 发出异步请求]
 */
function getAllComic() {
  // 如何发出请求
  // 1、在不支持localStorage的阅览器将页面刷新后请求数据，
  // 2、支持的localStorage将在cookie过期后发出请求
  // if(__global.cookie('allcomicCacheTime') && typeof localStorage === 'object') {
  var allcomicCacheTime = JSON.parse(__global.limitStore('allcomicCacheTime')||0);
  // 判断时间是否小余当前时间
  if(allcomicCacheTime){
	if(allcomicCacheTime < new Date().getTime() && typeof localStorage === 'object') {
    // 直接冲本地数据获取数据
		window.imgdomain = localStorage.getItem('comicDomain');
		// window.allcomic = localStorage.getItem('comicData');

		window.allcomic = [];
		var len = localStorage.getItem('comicTotal')
		for(var i=0; i<len; i++){
		   window.allcomic.push(JSON.parse(localStorage.getItem('comic-'+i)))
		}
		getSelectResult();
		return;
	  }
  }

  // 异步获取全部漫画数据
  __global.loadjs(__global.config.api + 'getallcomic/?callback=siftinit', {async: true});
  /*
  $.ajax({
  url:__global.config.api + 'getallcomic/',
  async: true,
  callback: 'siftinit',
  success: siftinit,
  dataType:'jsonp'
  })
  .fail(function(res) {
    console.log('请求数据失败:', res);
  });*/
  // 异步获取全部漫画数据
  /*$.get(__global.config.api + 'getallcomic/', {async: true}, siftinit, 'jsonp')
  .fail(function(res) {
    console.log('请求数据失败:', res);
  });*/
}

// 页码替换
function replacePage() {
  var p = location.pathname.replace(/.*_p(\d+)\.html/,'$1');
  if(!p) {
    p = 1
  } else {
    p = parseInt(p, 10);
  }
  return p || 1; // P可能为NAN
}

//根据筛选条件筛选出结果
function getSelectResult(){
  window.filterData = window.allcomic;
  if(!filterData.length) {
    return;
  }
  var curTags = location.href.match(/([0-9]+)\.html/); // 根据url获得当前在选择分类;
  if(curTags){
	  filterData = $.grep(filterData, function(filter) {
		if(filter[4].indexOf(','+curTags[1]+',') !== -1){
		  return true;
		}else{
		  return false
		}
	  });
  }
  // 按输入关键词筛选
  var keywords = location.hash.substr(1,location.hash.length);
  if(keywords != '') {
    filterData = $.grep(filterData, function(filter){
      var isFlag = false;
      //用-排除的条件，只要一个不符合就跳出，包含的条件则有一个符合就可以
      $.each(keywords.split(' '),function(i, v){
        if(v.indexOf('-') == 0 && filter[1].indexOf(v.substring(1)) != -1){
          isFlag = false;
          return false;
        } else if(v.indexOf('-') !=0 && filter[1].indexOf(v) != -1 && !isFlag) {
          isFlag = true;
        }
      });
      return isFlag;
    });
  }
  
  
  showComicList(filterData, replacePage(), 20);
}

//将漫画列表输出到页面
function showComicList(data, curPage, pageItemNum){
  pageItemNum = pageItemNum || 25; // 每页展示项目数量
  var len = data.length;
  var totalPages = Math.ceil(len / pageItemNum); // 总页数
  // $('.filter-count strong').text(len); // 总记录数
  var comicListBox = $('#comicListBox');

  //未找到记录的情况
  if (!len) {
    $('.pages').html('');
    comicListBox.html('<p class="no-info tac">没有找到任何记录，请重新搜索!</p>');
    return;
  }
  // 超出最大页码
  if(curPage>totalPages) {
    return;
  }
  //显示内容
  var endnum = ((curPage * pageItemNum) >len ? len : (curPage * pageItemNum));
  var content = ''
  var nth = 5;
  for(var i=(curPage-1) * pageItemNum; i<endnum; i++){
    // var flag = ((i-pageItemNum+1)%nth?null:nth); // jq项目序列是从1开始这里需要加1
    content += comicItemHtmlString(data[i]);
  }
  var comicListUL = comicListBox.find('.comic-list-col4');
  if(comicListUL.length){
    comicListUL.html(content);
  }else{
    comicListBox.html('<ul class="mk-list-box clearfix comic-list-col4">'+content+'</ul>');
  }
  $('.pages').html(showpager(curPage, totalPages));
  return false;
}

/**
 * [comicItemHtmlString 每一项漫画展示列表]
 * @param  {[object]} data [每一项数据信息]
 * @param  {[number]} flag [在哪一项追加特定的className]
 * @return {[string]}      [返回每一项漫画列表的字符串html结构]
 */
function comicItemHtmlString(data, flag){
  var nth = flag?(' nth-' + flag +'n'):'';
  
  return '<li class="swiper-slide mk-item"><a href="/'+ data[0] +'/" title="'+ data[3]+ '"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="'+ data[1]+',' + data[1]+'漫画" data-src="'+ window.imgdomain.format(__global.getPathById(data[0])) +'"></a><p class="mk-cartoon-name"><a href="/'+ data[0] +'/" title="' + data[1]+'漫画">'+ data[1]+ '</a></p><p class="mk-cartoon-intro"></p><span class="mk-star"><i class="ift-xing"></i>'+__global.toDecimal(data[8],1)+'</span><span class="mk-caption">'+ data[3] +'</span></li>'
}

//页码跳转
window.goPage = function(page){
  showComicList(filterData, page);
  // $('.sift .ft')[0].scrollIntoView();
  return false;
}
/**
 * pageCount //总页数
 * limitNum // 显示分页按钮数量
 */
 
function showpager(thisPage, pageCount) {
  var getHref = function(page){
	return 'javascript:goPage('+page+')';
  };
  var str = '';
  var p = 1;
  if(thisPage > 1) {
	str += '<a class="prev" href="'+getHref(thisPage-1)+'"><i class="ift-prev"></i></a>';
  }else{
	str += '<span class="prev"><i class="ift-prev"></i></span>'
  }

  if(pageCount<10){
	for (p=1; p<=pageCount; p++) {
	  if(thisPage != p){
		str += '<a href="'+getHref(p)+'">'+ p +'</a>';
	  }else{
		str +='<span class="active">'+ p +'</span>';
	  }
	}
  }else{
	if(thisPage != 1){
	  str += '<a href="'+getHref(1)+'">1</a>';
	}else{
	  str +='<span class="active">1</span>';
	}

	if (thisPage <= 5){
	  for (p=2; p<=7; p++){
		if(thisPage != p){
		  str += '<a href="'+getHref(p)+'">'+ p +'</a>';
		}else{
		  str +='<span class="active">'+ p +'</span>';
		}
	  }
	  str += '…';
	}else{
	  str += '…';
	  if(thisPage <= pageCount - 5){
		for (p = thisPage-2; p <= thisPage + 2; p++){
		  if(thisPage != p){
			str += '<a href="'+getHref(p)+'">'+ p +'</a>';
		  }else{
			str +='<span class="active">'+ p +'</span>';
		  }
		}
	  }else{
		for (p = pageCount-6; p <= pageCount-1; p++){
		  if(thisPage != p){
			str += '<a href="'+getHref(p)+'">'+ p +'</a>';
		  }else{
			str +='<span class="active">'+ p +'</span>';
		  }
		}
	  }
	}

	if(thisPage != pageCount){
	  str += '<a href="'+getHref(pageCount)+'">'+ pageCount +'</a>';
	}else{
	  str +='<span class="active">'+ pageCount +'</span>';
	}
  }

  if(thisPage < pageCount) {
	str += '<a class="next" href="'+getHref(thisPage+1)+'"><i class="ift-next"></i></a>';
  }else{
	str += '<span class="next"><i class="ift-next"></i></span>'
  }

  return str;
}


function showpager2(thisPage, pageCount, limitNum) {
	  limitNum = limitNum || 5;
      var getHref = function(page){
        return 'javascript:goPage('+page+')';
      };
      var str = '';
      var p = 1;
      if(thisPage > 1) {
        str += '<a class="prev" href="'+getHref(thisPage-1)+'"><i class="ift-prev"></i></a>';
      }else{
        str += '<span class="prev"><i class="ift-prev"></i></span>'
      }

      if(pageCount<limitNum){
        for (p=1; p<=pageCount; p++) {
          if(thisPage != p){
            str += '<a href="'+getHref(p)+'">'+ p +'</a>';
          }else{
            str +='<span class="active">'+ p +'</span>';
          }
        }
      }else{
        if(thisPage != 1){
          str += '<a href="'+getHref(1)+'">1</a>';
        }else{
          str +='<span class="active">1</span>';
        }

        if (thisPage <= limitNum){
          for (p=2; p<=(limitNum+2); p++){
            if(thisPage != p){
              str += '<a href="'+getHref(p)+'">'+ p +'</a>';
            }else{
              str +='<span class="active">'+ p +'</span>';
            }
          }
          str += '…';
        }else{
          str += '…';
          if(thisPage <= pageCount - limitNum){
            for (p = thisPage-2; p <= thisPage + 2; p++){
              if(thisPage != p){
                str += '<a href="'+getHref(p)+'">'+ p +'</a>';
              }else{
                str +='<span class="active">'+ p +'</span>';
              }
            }
          }else{
            for (p = pageCount-(limitNum+1); p <= pageCount-1; p++){
              if(thisPage != p){
                str += '<a href="'+getHref(p)+'">'+ p +'</a>';
              }else{
                str +='<span class="active">'+ p +'</span>';
              }
            }
          }
        }

        if(thisPage != pageCount){
          str += '<a href="'+getHref(pageCount)+'">'+ pageCount +'</a>';
        }else{
          str +='<span class="active">'+ pageCount +'</span>';
        }
      }

      if(thisPage < pageCount) {
        str += '<a class="next" href="'+getHref(thisPage+1)+'"><i class="ift-next"></i></a>';
      }else{
        str += '<span class="next"><i class="ift-next"></i></span>'
      }

      return str;
    }

