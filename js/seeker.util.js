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

			if( Object.prototype.toString.call( obj ) === '[object Array]' ) {
				obj.__onChange = [];

				obj.__update = function() {
					var i = this.__onChange.length;
					while (i--) {
						var obj = this.__onChange[i]().node;
						if (!seeker.util.inDOM(obj)) {
							this.__onChange.splice(i,1)
						}
					}
				}

				obj.__append = function(a) {
					obj.push(a);
					obj.__update();
					return obj;
				}

				obj.__splice = function(i, n) {
					obj.splice(i,n);
					obj.__update();
					return obj;
				}
			} else {
				obj.__onChange = [];

				obj.__update = function() {
					var i = this.__onChange.length;
					while (i--) {
						var obj = this.__onChange[i]().node;
						if (!seeker.util.inDOM(obj)) {
							this.__onChange.splice(i,1)
						}
					}
				}

				obj.__set = function(i, v) {
					obj[i] = v;
					obj.__update();
					return obj;
				}
			}
		}

		return obj;
	}

	seeker.util.attachScalarBinding = function(obj) {
		//attach functions to view objects that binds to scalars

		obj.onUpdate = function(f) {
			obj._data.__onChange.push(f);

			return obj;
		}

		obj.getScalar = function() {
			return obj._data[obj._key];
		}

		obj.data = function(d,k) {
			obj._data = d;
			obj._key = k;

			seeker.util.attachModel(obj._data);
			obj.onUpdate(obj.update);

			return obj;
		}
	}

	seeker.util.attachCollectionBinding = function(obj) {
		//attach functions to view objects that binds to collections

		obj.onUpdate = function(f) {
			obj._data.__onChange.push(f);

			return obj;
		}

		obj.data = function(d) {
			obj._data = d;

			seeker.util.attachModel(obj._data);
			obj.onUpdate(obj.update);

			return obj;
		}
	}

	seeker.util.updateCollectionDOM = function(data, objs, e, parent, update) {
		//make enough view objects for each data object, append to parent node and update
		//used in update functions of collection binding elements

		var dataLength = data.length;
		var objLength = objs.length;

		if (objLength < dataLength) {
			for ( var i = objLength ; i < dataLength ; i++ ) {
				var element = new e;
				element.index = i;
				objs.push(element);
				parent.append(objs[i]);
			}
		} else if (objLength > dataLength) {
			var num = objLength - dataLength;
			var removed = objs.splice(dataLength, num);
			for ( var i = 0 ; i < removed.length ; i++ ) {
				parent.node.removeChild(removed[i]);
			}
		}

		objLength = objs.length;
		for ( var i = 0 ; i < objLength ; i++ ) {
			update(objs[i]);
		}
	}

	seeker.util.countArray = function(a, k, val) {
		var count = 0;
		var num = a.length;

		while( num-- ) {
			if (a[num][k] == val) {
				count++;
			}
		}

		return count;
	}
})();
