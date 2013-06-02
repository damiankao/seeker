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

	seeker.util.inDOM = function(element) {
	    while (element = element.parentNode) {
	        if (element == document) {
	            return true;
	        }
	    }
	    return false;
	}
})();
