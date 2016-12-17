'use strict';
$(function() {
  // 获得所有的漫画
  getAllComic();

  var filterTagBox = $('.filter .attr-bd');
  // 点击筛选条件
  $('.filter .attr-bd').on('click','.attr', function(event){
    event.stopPropagation();
    changeSift($(this));
    getSelectResult();
    return false;
  });

  // 清除单个已选条件
  $('.select-attr').on('click', '.attr>.close', function(event){
    event.stopPropagation();
    //找到对应的筛选条件项
    // var curObj = filterTagBox.find('.attr:contains("'+$(this).siblings('.text').text()+'")');
    var curObj = $('.attr[title="'+$(this).siblings('.text').text()+'"]');
    changeSift(curObj);
    getSelectResult();
    return false;
  })
  // 清空筛选
  $('body').on('click', '.select-attr .select-clean, #comicListBox .clean', function(event){
    event.stopPropagation();
    $('.filter .attr-bd:not(:last)').each(function() {
      changeSift($(this).find('.attr:eq(0)'));
    });
    getSelectResult();
    return false;
  });

  // 关键词筛选
  $('#submit_search_filter').on('click', function(event){
    event.stopPropagation();
    getSelectResult();
    return false; // 阻止from提交造出跳转
  });

  $('.select-attr .scorll').scrollbar();

});
/**
 * [siftinit 获得所有筛选页的漫画数据 callback回调必须是全局方法或变量]
 * @param  {[string]} domain [callback 后的图片域名地址]
 * @param  {[object]} data   [description]
 * @return {[type]}        [description]
 */
window.siftinit = function(domain,data) {
  var cacheTime = 600;
  // 将数据存储到本地localstorage
  if(typeof localStorage === 'object'){
    __global.cookie('allcomicCacheTime', true, {expires: cacheTime}); // 10分钟缓存时间
    try{
      localStorage.setItem('comicDomain', domain);
      localStorage.setItem('comicTotal', data.length);
      $.each(data, function(i,v){
        localStorage.setItem('comic-'+i, JSON.stringify(v));
      })
    }catch(oException) {
      __global.cookie('allcomicCacheTime', null); // 没有存储成功则清楚cookie
      if(oException.name == 'QuotaExceededError'){
        console.log('超出本地存储限额！');
      }
    }
    // 请求到数据后过10分钟后再次重新请求一遍更新数据以便漫画有更新将其重新写入本地数据
    // 这时的cookie一定是失效的；
    // setTimeout(function() {
    //   getAllComic();
    // }, cacheTime);
  }

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
  if(__global.cookie('allcomicCacheTime') && typeof localStorage === 'object') {
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
  __global.loadjs(__global.config.allcomic, {async: true}); // 异步获取全部漫画数据
}
// 页码替换
function replacePage(){
  var p = location.pathname.replace(/.*_p(\d+)\.html/,'$1');
  if(!p) {
    p = 1
  } else {
    p = parseInt(p, 10);
  }
  return p || 1; // P可能为NAN
}

// 增加或减少已选条件
function changeSift(obj){
  obj = $(obj);
  var curTxt = obj.attr('title');
  var selectBox = $('.select-attr .hd'); // 选择属性盒子
  var selectAttrBox = $('.select-attr .bd'); // 选择属性装载盒子
  var noSiftTip = '<p class="no-info">您还没有作任何筛选，当前默认为全选</p>'; //没有任何筛选提示
  var searchFilter = $('#search_filter');

  var _cleanAttr = function(){
    // 被移除的是最后一个条件时
    if(!selectAttrBox.find('.attr').length) {
      selectAttrBox.html(noSiftTip);
      searchFilter.val('');
    }
  }

  // 当前被点条件已选且不是“全部”，则移除该条件
  if(obj.hasClass('active') && obj.index()!=0 ){
    obj.removeClass('active');
    if(!obj.siblings('.active').length){
      // 仅一个条件时，要把“全部”勾上
      obj.siblings('.attr:eq(0)').addClass('active');
    }

    // 移除选择类时同时删除被追加的元素
    selectAttrBox.find(':contains('+ curTxt +')').detach();

    // 被移除的是最后一个条件时
    _cleanAttr();
  }else if(obj.index() == 0) {
    // 被点条件是“全部”，则清空本类的所有条件
    obj.addClass('active').siblings('.attr').removeClass('active');
    //移除选择类时同时删除被追加的元素
    obj.siblings('.attr').each(function(){
      selectAttrBox.find(':contains('+ $(this).text() +')').detach();
    });

    // 被移除的是最后一个条件时
    _cleanAttr();

  }else{
    // 勾选本条件，且不勾选“全部”
    obj.addClass('active').siblings(':eq(0)').removeClass('active');

    // 被增加的第一个筛选条件时
    var hasSelectAttr = selectAttrBox.find('.attr');
    if(hasSelectAttr && !$('.select-clean').length) {
      selectBox.append('<div class="select-clean blue">清空筛选</div>');
    }
    var attr = '<a href="javascript:;" class="attr"><span class="text">'+ curTxt +'</span><i class="close">&times;</i></a>'
    if(hasSelectAttr.length) {
      selectAttrBox.append(attr);
    }else{
      selectAttrBox.html(attr);
    }
  }
}

//根据筛选条件筛选出结果
function getSelectResult(){
  window.filterData = window.allcomic;
  if(!filterData.length) {
    return;
  }
  // 按条件筛选（可多选）
  $('.filter .attr-bd:not(:last)').each(function(i,v1) {
    // 获得非“全部”的分类
    var curTags = $(this).children('a:gt(0).active');
    
    //本大类有非“全部”的选项时才需要筛选
    if(curTags.length) {
      filterData = $.grep(filterData, function(filter) {
        var isFlag = false;
        $.each(curTags, function(k, v2) {
          // console.log((filter[3]+',').indexOf($(this).data('tag')+','))
          if((filter[3]+',').indexOf($(this).data('tag')+',') !== -1){
            isFlag = true;
            return false; // 由于是多选，只要有一个条件符合就无须再判断了
          }
          // console.log(filterData); return;
        });
        return isFlag;
      });
    }
  });

  // 按输入关键词筛选
  var keywords = $('#search_filter').val();
  if(keywords != '请输入关键词' && keywords != '') {
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

  showComicList(filterData, replacePage());
}

//将漫画列表输出到页面
function showComicList(data, curPage, pageItemNum){
  pageItemNum = pageItemNum || 25; // 每页展示项目数量
  var len = data.length;
  var totalPages = Math.ceil(len / pageItemNum); // 总页数
  $('.filter-count strong').text(len); // 总记录数
  var comicListBox = $('#comicListBox');

  //未找到记录的情况
  if (!len) {
    $('.pages').html('');
    comicListBox.html('<p class="no-info">没有找到任何记录，请点击[<a href="javascript:;" class="green clean" target="_self">清除全部条件</a>]或重新选择条件!</p>');
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
    var flag = ((i-pageItemNum+1)%nth?null:nth); // jq项目序列是从1开始这里需要加1
    content += comicItemHtmlString(data[i], flag);
  }
  var comicListUL = comicListBox.find('comic-list');
  if(comicListUL.length){
    comicListUL.html(content);
  }else{
    comicListBox.html('<ul class="comic-list col5 clearfix">'+content+'</ul>');
  }
  $('.pages').html(__global.showpager(curPage, totalPages));
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
  return '<li class="item'+nth+'"><a href="/'+ data[0] +'" class="thumbnail"><img src="../static/images/space3x4.gif" alt="'+ data[1]+ '" title="'+ data[1]+ '" data-src="http://'+window.imgdomain +'/mh/' + data[0] +'.jpg"><span class="charpter">'+ data[2] +'</span>'+ (data[4]?('<span class="score">'+data[4]+'</span>'):'') +'</a><div class="info"><h3 class="title"><a href="/'+ data[0] +'">'+ data[1] +'</a></h3>'+ (data[5]?('<p class="desc">'+ data[5]+'</p>'):'') +'</div></li>'
}

//页码跳转
window.goPage = function(page){
  showComicList(filterData, page);
  // $('.sift .ft')[0].scrollIntoView();
  return false;
}