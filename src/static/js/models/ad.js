'use strict';
window.AD = {
  floatAD: function() {
    G.floatAD({
      mobile: [
        { '麦收wap悬浮': 'http://u349036.778669.com/mediaController.php?pid=88541' },
        { '麦收wap悬浮': 'http://u349036.778669.com/mediaController.php?pid=88541' }
      ],
      pc: [{ '六度富媒': 'http://u349036.778669.com/mediaController.php?pid=1六度富媒' },
        { '百游富媒': 'http://u349036.778669.com/mediaController.php?pid=2百游富媒' },
        { '阅天下富媒': 'http://u349036.778669.com/mediaController.php?pid=3阅天下富媒' },
        { '阅天下富媒|爱联盟对联': 'http://u349036.778669.com/mediaController.php?pid=3阅天下富媒|http://u349036.778669.com/mediaController.php?pid=4爱联盟对联' },
        { '爱联盟对联': 'http://u349036.778669.com/mediaController.php?pid=4爱联盟对联' },
        { 'u2532391': 'http://cpro.baidustatic.com/cpro/ui/f.js' }
      ]
    });
  },

  /**
   * banner banner广告
   */
  banner: function() {
    if (G.isMobile()) {
      //G.loadjs('http://media.kouclo.com/s.php?id=236');
    } else {
      // G.inlay360AD({w:960,h:90,ls:'s5c6e6d937f',t:'inlay'});
      //G.loadjs('http://media.kouclo.com/s.php?id=233');
      G.baiduAD({
        flag: 'c',
        id: 'u2531329',
        api: { at: '3', rsi0: '960', rsi1: '90', pat: '6', tn: 'baiduCustNativeAD', rss1: '#FFFFFF', conBW: '1', adp: '1', ptt: '0', titFF: '%E5%BE%AE%E8%BD%AF%E9%9B%85%E9%BB%91', titFS: '14', rss2: '#000000', titSU: '0', ptbg: '90', piw: '0', pih: '0', ptp: '0' }
      });
    }
  },
  dir960: function() {
    if (G.isMobile()) {
      //G.loadjs('http://media.kouclo.com/s.php?id=236');
    } else {
      G.inlay360AD({ w: 960, h: 90, ls: 's5c6e6d937f', t: 'inlay' });
      //G.loadjs('http://media.kouclo.com/s.php?id=233');
    }
  }
};