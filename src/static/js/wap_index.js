$(function () {
  
  var $underline = $('.mk-underline');
  var $rkNav = $('.mk-rank-nav li');
  var $history = $('.mk-history');
  var $close = $('.mk-history .mk-close');

  // close history;
  $('body').on('click','.mk-history .mk-close', function () {
    $(this).parent().hide();
  });

  var topSwiper = new Swiper('.mk-banner', {
    loop: true,
    autoplay: 2000,
    pagination: '.swiper-pagination',
  });

  var itemSwiper = new Swiper('.mk-floor-con', {
    freeMode: true,
    slidesPerView: 'auto',
  });

  var rankSwiper = new Swiper('.mk-rank-con', {
    watchSlidesVisibility: true,
    onSlideChangeStart: function (swiper) {
      if (rankSwiper.activeIndex === 0) {
        $underline.animate({
          left: window.innerWidth / 750 * 62 + 'px'
        }, 300);
        $rkNav.eq(0).addClass('active')
          .siblings().removeClass('active');
      } else if (rankSwiper.activeIndex === 1) {
        $underline.animate({
          left: window.innerWidth / 750 * 306 + 'px'
        }, 300);
        $rkNav.eq(1).addClass('active')
          .siblings().removeClass('active');
      } else if (rankSwiper.activeIndex === 2) {
        $underline.animate({
          left: window.innerWidth / 750 * 554 + 'px'
        }, 300);
        $rkNav.eq(2).addClass('active')
          .siblings().removeClass('active');
      }
    }
  });

  $rkNav.on('click', function () {
    rankSwiper.slideTo($rkNav.index(this), 300, true);
  });

  __global.lazyload();
});

function calcPos(elemArr, index) {
  var posStr = elemArr.eq(index).position().left + 'px';
  return posStr;
}