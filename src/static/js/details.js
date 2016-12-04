'use strict';
(function() {
  var randomColorArr = ['c1','c2','c3','c4','c5']; // 对应css样式
  var  objTags = $('#randomColor .tags');
  var tagsLen = objTags.length;
  objTags.each(function(i,v){
    var colorArrLen = randomColorArr.length;
    var random = 0;
    if(colorArrLen < i){
      random = Math.floor(Math.random() * colorArrLen);
    }else{
      random = Math.floor(Math.random() * tagsLen);
      if(colorArrLen <= random) random = random - colorArrLen;
    }
    
    $(this).addClass(randomColorArr[random<0?0:random]);
    // 如果标签数大于了颜色数组不能把颜色数组splice掉，
    // 不然池子内不够分配，只有刚刚够或者小余时才进行splice这样就不会重复颜色，
    // 大于池子的时候必然要重复颜色才能够
    if(colorArrLen <= i){
      randomColorArr.splice(random,1)
    }

   })
}())

