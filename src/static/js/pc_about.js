equalLayout($('.conact-side'),$('.conact-main'));

/**
 * 等高布局设置
 * @param obj1 jquery dom obj
 * @param obj2 jquery dom obj
 */
function equalLayout(obj1, obj2) {
  var obj1H = obj1.outerHeight(),
    obj2H = obj2.outerHeight();
  console.log(obj1H, obj2H);
  (obj1H > obj2H) ? (obj2.css('height', obj1H)) : (obj1.css('height', obj2H));
};