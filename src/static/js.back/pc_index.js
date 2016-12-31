$(function(){
  // 水平点击滚蛋slider
  var sliderHorizontal = $('.slider-horizontal');
  setComicHorizontalSize(sliderHorizontal)
  $(window).resize(function(){
    setComicHorizontalSize(sliderHorizontal)
  });

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
  
});

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