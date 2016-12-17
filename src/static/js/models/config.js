'use strict';
__global.config = {
  loginurl: '/app/login.html',
  lazyload: {
    error: '../static/images/error.png',
    loading: '../static/images/loading_mt.gif',
    space: '../static/images/space.gif'
  },
  imgCDN: 'http://image.kanman.com/mh/',
  api: 'http://192.168.2.126:8686/app_api/v1/',
  client: 'pc',
  score: 'http://www.kanman.com/jsonp/addpingfen.html',
  redirect: 'http://' + location.host + '/login.htm',
  allcomic: 'http://www.kanman.com/jsonp/allcomic.html', // 漫画筛选页
  recordType: {
    ubook: 'ubook', // 存储在cookie中的收藏数签名称
    urecord: 'urecord' // 存储在cookie中的阅读历史名称
  },
  data: {
    /**
     * 观看历史测试数据
     * 新格式 ：[漫画ID, 漫画名, 阅读章节id, 阅读章节名, 阅读时间, 阅读章节页码, 下一话章节ID, 下一话章节名]
     * 新格式 ：[0:id, 1:name, 2:readid, 3:readname, 4:readtime, 5:readpage, 6:nextid, 7:nextname]
     */
    urecord: [
      [8419, '腾空之约', 'di2jifanwai', '第2季番外', 1481214241183, '', '第2季番外', '第2季番外'],
      [7099, '盘龙', '170zzh_1505', '第170话 最终话', 1480982400000, '', '170zzh_1505', '第172话 最终话'],
      [7953, '大主宰', '59bct', '第59话北苍塔', 1480242153467, '', '59bct', '第58话'],
      [3130, '斗破苍穹', '2ce', '第03册', 1480861927607, '', '33443', '第02册'],
      [5754, '穿越西元3000后', 'qcgzqyy', '前传光之起源一', 1478246929937, '', 'sd42', 'ssssss前传光之起源一'],
      [8704, '莽荒纪', '34zzyse', '第34话再战翼蛇二', 1480241968000, '', 'asa333', '第39话再战翼蛇二']
    ],
    /**
     * 收藏测试数据
     * 名称：ubook
     * 格式：[漫画ID, 漫画名, 最新章节ID(预留), 最新章节名(预留), 收藏/阅读时间, 最新更新时间]
     * 格式：[0:id, 1:name, 2:latestid, 3:latestname, 4:readtime, 5:updatetime]
     */
    ubook: [
      [8419, '腾空之约', 'di2jifanwai', '第2季番外', 1465347821187, 1465347821187],
      [7099, '盘龙', '170zzh_1505', '第170话最终话', 1479914747590, 1479914747590],
      [7953, '大主宰', '01', '第1卷', 1480242153467, 1480242153467],
      [3130, '斗破苍穹', '102', '第102话', 1480861927607, 1480861927607],
      [5754, '穿越西元3000后', 'qcgzqyy', '前传光之起源一', 1478246929937, 1478246929937],
      [8704, '莽荒纪', '34zzyse', '第34话再战翼蛇二', 1480241968000],
      [5755, '穿越西元3000后22222', 'qcgzqyy', '前传光之起源一', 1478246929937, 1478246929937],
      [8705, '莽荒纪2222', '34zzyse', '第34话再战翼蛇二', 1480241968000]
    ]
  }
}
