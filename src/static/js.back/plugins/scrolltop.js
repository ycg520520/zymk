function ScrollTo(opts){
	this.opts = $.extend({}, ScrollTo.DEFAULTS, opts);
	this.$el = $('html, body');
};
ScrollTo.DEFAULTS = {
	dest: 0,
	speed:500,
	cb: null
}

ScrollTo.prototype.move = function() {
	var opts =  this.opts,
			dest = opts.dest,
			_el = this.$el;
	if($(window).scrollTop() != dest){
		if(!_el.is(':animated')){
			_el.animate({
				scrollTop: dest
			}, opts.speed, function(){
				if(opts.cb) opts.cb();
			})
		}
	}
};
ScrollTo.prototype.go = function() {
	var dest=  this.opts.dest;
	if($(window).scrollTop() != dest){
		this.$el.scrollTop(dest);
		if(this.opts.cb) this.opts.cb();
	}
};


function BackTop(el,opts){
	this.opts = $.extend({}, BackTop.DEFAULTS, opts);
	this.$el = $(el);
	this.scroll = new ScrollTo(opts);
	if(this.opts.mode == 'move'){
		this.$el.on('click', $.proxy(this._move, this));
	}else{
		this.$el.on('click', $.proxy(this._go, this));
	}
	$(window).on('scroll', $.proxy(this._checkPosition, this));
}
BackTop.DEFAULTS = {
	mode: 'move',
	pos: $(window).height()
}
BackTop.prototype._move = function() {
	this.scroll.move();
};
BackTop.prototype._go = function() {
	this.scroll.go();
};
BackTop.prototype._checkPosition = function() {
	var $el = this.$el;
	if($(window).scrollTop()>this.opts.pos){
		// $el.fadeIn();
		$el.show();
	}else{
		// $el.fadeOut();
		$el.hide();
	}
};

// 注册成jquery插件
$.fn.extend({
	backtop:function(opts){
		return this.each(function() {
			new BackTop(this, opts)
		});		
	},
	scrollto:function(){
		return this.each(function() {
			new ScrollTo(this, opts)
		});		
	}
});