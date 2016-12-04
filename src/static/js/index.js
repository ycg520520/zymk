'use strict';
$('.swiper-container').each(function(i,v){
  var isFlag = $(this).hasClass('slider-main');
  var isFlagH = $(this).hasClass('box-bd');
  var mySwiper = new Swiper($(this), {
    pagination: isFlag?'.swiper-pagination .row':null,
    paginationClickable: isFlag,
    nextButton: '.ift-next',
    prevButton: '.ift-prev',
    autoplay: isFlag?5000:3000,
    loop: true,
    lazyLoading: true,
    lazyLoadingInPrevNextAmount:2,
    onLazyImageLoad: function(swiper, slide, image){
      $(slide).css('background','url('+ $(image).data('src') +')')
    }
  });
  $(this).hover(function(){
    mySwiper.stopAutoplay();
    $(this).find('.ift-next').show()
    $(this).find('.ift-prev').show()
  },function(){
    mySwiper.startAutoplay();
    $(this).find('.ift-next').hide()
    $(this).find('.ift-prev').hide()
  })
})

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
    thisUl.css({width:warpItemW,position:'absolute',left:0})
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
      thisUl.stop(true,true).animate({left:left},300)
      showPrevNext()
    })
    thisPrev.click(function(){
      left = left+itemOuterW<0?left+itemOuterW:0
      thisUl.stop(true,true).animate({left:left},300)
      showPrevNext()
    })
  })
}
setComicHorizontalSize($('.slider-horizontal'))
$(window).resize(function(){
  setComicHorizontalSize($('.slider-horizontal'))
})


$('.rank-list>.item').on('mouseenter', function(){
  $(this).addClass('active').siblings('.item').removeClass('active')
})

