'use strict';
var G = require('./base');
// layer.use('plugins/layer/skin/layer.css');
function modifyFn(obj) {
  var modifyObj = obj.modifyObj,
    curMenu = obj.curMenu,
    active = obj.active || true,
    offset = obj.offset || 0,
    left = curMenu.position().left + offset;

  if (active) {
    curMenu.addClass('active').siblings('li').removeClass('active');
  }
  $(window).resize(function() {
    left = curMenu.position().left + offset;
    modifyObj.animate({ left: left, width: curMenu.width() }, 100);
  });
  modifyObj.animate({ left: left, width: curMenu.width() }, 100);
}

//tab切换操作
var tabs = $('.tabs>.tabs-hd');
tabs.each(function() {
  var _this = $(this),
    isIndexTabs = _this.parent().hasClass('tabs-index'),
    tabsBox = _this.parents('.tabs'),
    tabsOffset = isIndexTabs ? 12 : 0,
    modify = _this.find('.modify');
  if (_this.find('li.active').length) {
    modifyFn({ modifyObj: modify, curMenu: _this.find('li.active'), offset: tabsOffset });
  }
  _this
    .on('mouseover', 'li', function() {
      modifyFn({ modifyObj: modify, curMenu: $(this), offset: tabsOffset });
      var index = $(this).index();
      // 内容切换
      if (tabsBox.hasClass('tabs-switch')) {
        tabsBox.find('.tabs-bd>.tabs-item').eq(index).show().siblings('.tabs-item').hide();
      }
    })
    .on('mouseleave', 'li', function() {
      modifyFn({ modifyObj: modify, curMenu: _this.find('li.active'), offset: tabsOffset });
    });
});
// 懒加载图片
G.lazyload({
  error:'static/images/error.png',
  loading:'static/images/loading_mt.png',
  space:'static/images/space.gif'
});

$('.rank-list .item').on('mouseenter',function(){
  $(this).addClass('active').siblings('.item').removeClass('active');
})

/*$('img').lazyload({
  data_attribute: 'src',
  background: true,
  skip_invisible: true,
  // event: 'lazyload'
})*/

// 判断是否是首页
var pathname = location.pathname.substring(5);
if(/index/.test(pathname) || pathname===''){
  $('#header').css({'background':'none',zIndex:2});
}else{
  $('body').css('paddingTop','72px');
  $('#footer').addClass('mt24');
  $('.link-box').remove();
}

if (G.ie() < 9) {
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

if(!$.cookie('isLogin')){
  $('#J_user').click(function(){
    layer.open({
      type: 1,
      title: false,
      area: ['320px', 'auto'],
      closeBtn: false,
      // shade: [0.5, '#000'],
      shadeClose: false,
      skin: 'layui-layer-nobg',
      content: $('#J_sigin')
    });

    return false;
  })
}
$('body')
  .on('click', '.J_close', function() {
    // layer.closeAll();
  })
  .on('click', function() {
    $('#J_alike').hide();
  })

$('.J_close').on('click', function() {
  $('#J_alike').hide();
});
$('#search').on('keyup', function() {
  $('#J_alike').show();
});
