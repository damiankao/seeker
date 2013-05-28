(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	Introduction:
	Utility functions are included in this file
	*/

	seeker = {};
	seeker.util = {}

	seeker.util.winDimensions = function() {
		if (typeof window.innerWidth !== 'undefined') {
			return [window.innerWidth,window.innerHeight];
		} else {
			return [document.getElementsByTagName('body')[0].clientWidth,document.getElementsByTagName('body')[0].clientHeight];
		}
	}

	seeker.container = function() {
		this.node = document.createElement('div');
		this.node.style.position = "absolute";
		this.actions = {};
		return this;
	}

	seeker.container.prototype.style = function(s, val) {
		this.node.style[s] = val;
		return this;
	}

	seeker.container.prototype.class = function(val) {
		this.node.className = val;
		return this;
	}

	seeker.container.prototype.whxy = function(w,h,x,y) {
		s = this.node.style;
		this.style('width',(w != -1) ? w : s.width)
			.style('height',(h != -1) ? h : s.height)
			.style('left',(x != -1) ? x : s.left)
			.style('top',(y != -1) ? y : s.top);
		return this;
	}

	seeker.container.prototype.attachTo = function(obj) {
		obj.appendChild(this.node);
		return this;
	}

	seeker.container.prototype.detach = function() {
		if (this.node.parentNode) {
			this.node.parentNode.removeChild(this.node);
		}
    	return this;
	}

	seeker.container.prototype.show = function() {
		this.node.style.display = 'block';
	}

	seeker.container.prototype.hide = function() {
		this.node.style.display = 'none';
	}

	seeker.container.prototype.toggle = function() {
		if (this.node.style.display == "none") {
	    	this.show();
	    } else {
	    	this.hide();
	    }
	}

	seeker.container.prototype.overflow = function(m) {

	}

	seeker.container.prototype.expansion = function(m) {

	}
})();
