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

	seeker.util.windowOffsetTop = function(elem) {
		{
		    var offsetTop = 0;
		    do {
		      if ( !isNaN( elem.offsetTop ) )
		      {
		          offsetTop += elem.offsetTop;
		      }
		    } while( elem = elem.offsetParent );
		    return offsetTop;
		}
	}

	seeker.util.mouseCoord = function(event) {
		if ( event.pageX == null && event.clientX != null ) {
		  var doc = document.documentElement, body = document.body;
		  	return [event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0), event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc   && doc.clientTop  || body && body.clientTop  || 0)];
		} else {
			return [event.pageX, event.pageY];
		}
	}

	//check if element is currently attached to DOM
	seeker.util.inDOM = function(element) {
	    while (element = element.parentNode) {
	        if (element == document) {
	            return true;
	        }
	    }
	    return false;
	}

	//attaches binding functions to a data objects
	seeker.util.attachModel = function(obj) {
		if (!obj.__seeker) {
			obj.__seeker = true;
			obj.__onChange = [];
			obj.__onLengthChange = [];

			obj.__update = function() {
				var i = this.__onChange.length;
				while (i--) {
					var obj = this.__onChange[i]().node;
					if (!seeker.util.inDOM(obj)) {
						this.__onChange.splice(i,1)
					}
				}
			}

			obj.__lengthUpdate = function() {
				var i = this.__onLengthChange.length;
				while (i--) {
					var obj = this.__onLengthChange[i]().node;
					if (!seeker.util.inDOM(obj)) {
						this.__onLengthChange.splice(i,1)
					}
				}
			}

			if( Object.prototype.toString.call( obj ) === '[object Array]' ) {
				obj.__append = function(a) {
					obj.push(a);
					obj.__lengthUpdate();
					return obj;
				}

				obj.__splice = function(i, n) {
					obj.splice(i,n);
					obj.__lengthUpdate();
					return obj;
				}
			} else {
				obj.__set = function(i, v) {
					obj[i] = v;
					obj.__update();
					return obj;
				}
			}
		}

		return obj;
	}
})();
