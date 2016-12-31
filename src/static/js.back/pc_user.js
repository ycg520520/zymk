$(function(){
	var userData = JSON.parse(__global.cookie("user"));
	if(userData){
		$.get(__global.config.api + 'alluserlog/',{openid:userData.openid, type: userData.type}, function(res){
			eval(res);
		});
		window.isauthor = __global.parseInt(userData.user_level)<10?true:false;//showAlog中要判断是否是作者，因此使用全局变量
		if(isauthor) $.get(__global.config.api + 'allauthorlog/',{openid:userData.openid, type: userData.type}, function(res){
			eval(res);
		});
	}
	
	
});


//显示用户操作日志
function showULog(actiontype,page){
  if(!__global.cookie("user")) { __global.showLoginBox();return; }//未登陆判断
  if(!window.__ulogtpl) { alert("数据加载中，请稍后再试！");return; }//数据未加载到
  $(".useriframe").hide();
  page = page || 1;
  window.goPage = function(n){showULog(actiontype,n)};

  var data = $.grep(__ulog,function(v){
	  return v.actiontype==actiontype
	});//按操作类型筛选数据
  var pagecount = Math.ceil(data.length/20);//总页数，20是每页显示记录数
  var tmphtml = "";
  // console.log(data);
  $.each(data.slice((page-1)*20,page*20),function(i,v){tmphtml+='<li class="my">'+__ulogtpl[v.actiontype].tpl(v)+'</li>'});
  $(".user-info").hide();
  $(".user-center .bd").html('<ul class="list">'+tmphtml+'</ul>');
  $(".summary h2").text(actiontype+"记录");
  $(".pages").html("");//先将分页清空，如果总页数只有1页则不显分页
  if(pagecount>1)showpager(page,pagecount);
}

//显示作者的漫画被操作日志
function showALog(actiontype,page){
  if(!__global.cookie("user")) { __global.showLoginBox();return; }//未登陆判断
  if(!isauthor) { alert("您不是作者，请先上传您的漫画作品成为作者！");return; }
  if(!window.__authortpl) { alert("数据加载中，请稍后再试！");return; }//数据未加载到
  page = page || 1;
  window.goPage = function(n){showALog(actiontype,n)};

  var data = $.grep(__authorlog,function(v){return v.actiontype==actiontype});//按操作类型筛选数据
  var pagecount = Math.ceil(data.length/20);//总页数，20是每页显示记录数
  var tmphtml = "";
  $.each(data.slice((page-1)*20,page*20),function(i,v){tmphtml+='<li class="my">'+__authortpl[v.actiontype].tpl(v)+'</li>'});
  $(".user-info").hide();
  $(".user-center .bd").html('<ul class="list">'+tmphtml+'</ul>');
  $(".summary h2").text("您收到的"+actiontype);
  $(".pages").html("");//先将分页清空，如果总页数只有1页则不显分页
  if(pagecount>1)showpager(page,pagecount);
}

//漫画上传和漫画管理
function showUComic(src){
  $(".useriframe iframe").attr("src",src);
  $(".useriframe").show();
}

//修改用户资料（目前只有邮箱能修改）
function modifyUInfo(){
  if(!__global.cookie("user")) { __global.showLoginBox();return; }//未登陆判断
  var my = eval("("+__global.cookie("user")+")");
  $(".user-center .bd").html('修改邮箱地址：<input placeholder="订阅漫画有更新后将邮件通知您" id="newmail" type="text" style="width:50%" value="'+my.mail+'"/> <input type="button" value="提交" onclick="postUMail()"/>');
  $(".summary h2").text("修改资料");
  $(".pages").html("");
}

//提交用户邮箱
function postUMail(a){
  if(!__global.cookie("user")){ __global.showLoginBox();return; }//未登陆判断
  var my = eval("("+__global.cookie("user")+")");
  var newmail = $("#newmail").val().trim();
  if(!newmail || my.mail==newmail){ alert("请输入一个新的邮箱地址");return; }
  $.post("/jsonp/modifymail.html?t="+-now,{mail:newmail},function(errmsg){//提交ajax请求
    if(a) return;//重发邮件
    if(errmsg) alert(errmsg);
    else $.alert('<p class="tal red">我们已给您的邮箱“'+newmail+'”发送了一封验证邮件，您必须验证过后才能修改成功！</p><p style="font-weight:bold;font-size:1.5em"><a href="http://mail.'+newmail.replace(/^.+@(mail\.)?/gi,'')+'" target="_blank">点此立即进入邮箱进行验证</a></p><p><a target="_self" class="green" href="javascript:" onclick="postUMail(1);alert(\'我们已给您的邮箱重新发送了验证邮件，如果还是未收到，请检查是否在垃圾箱内，或更换其他邮箱！\')">未收到验证邮件?</a></p>',{fixed:"center",title:$(".logo").attr("title")+"提醒您"});
  },"text");
}

