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

	seeker.util.mouseCoord = function(e) {
		e = e || window.event;
		var x = 0;
		var y = 0;

		if (e.pageX || e.pageY) {
			x = e.pageX -
			    (document.documentElement.scrollLeft || 
			    document.body.scrollLeft) +
			    document.documentElement.clientLeft;
			y = e.pageY -
			    (document.documentElement.scrollTop || 
			    document.body.scrollTop) +
			    document.documentElement.clientTop;;
		} else {
			x = e.clientX;
			y = e.clientY;
		}

		if (arguments[1]) {
			x += (document.documentElement.scrollLeft || 
			    document.body.scrollLeft) - 
			    document.documentElement.clientLeft;
			y += (document.documentElement.scrollTop || 
			    document.body.scrollTop) - 
			    document.documentElement.clientTop;
		}

		return [x,y];
	}

	seeker.util.bindModel = function(d) {
		if (!d.__bound__) {
			if (Object.prototype.toString.call(d) === '[object Array]') {
				if (!d.__bound__) {
					d.__onUpdate__ = [];
					var i = d.length;
					while ( i-- ) {
						var obj = d[i];
						if (!obj.__bound__) {
							obj.__onUpdate__ = {};
							obj.__bound__ = true;
						}
					}
					d.__bound__ = true;
				}
			} else {
				if (!d.__bound__) {
					d.__onUpdate__ = {};
					d.__bound__ = true;
				}
			}
		}
	}

	seeker.util.addUpdate = function(obj, d, key, f) {
		if (!d.__bound__) {
			seeker.util.bindModel(d);
		}

		obj.bound.push([d,key]);
		if (Object.prototype.toString.call(d) === '[object Array]') {
			d.__onUpdate__.push([f, obj]);
		} else {
			if (!d.__onUpdate__[key]) {
				d.__onUpdate__[key] = [];
			}

			d.__onUpdate__[key].push([f, obj]);
		}
	}

	seeker.util.set = function(d, key, val) {
		if (d.__bound__) {
			d[key] = val;
			if (d.__onUpdate__[key]) {
				var obj = d.__onUpdate__[key];
				var i = obj.length;
				while ( i-- ) {
					obj[i][0]();
				}
			}
		}
	}
})();
