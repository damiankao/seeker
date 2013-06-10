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
				//if it is an array (collection of objects), there are two callable functions.
				//arrange = arrange collection of child views
				//update = resize child view array

				obj.__onArrange = [];
				obj.__onUpdate = [];

				obj.__arrange = function() {
					var i = this.__onArrange.length;
					while (i--) {
						var obj = this.__onArrange[i]();
						if (obj.node) {
							obj = obj.node;
						}

						if (!seeker.util.inDOM(obj)) {
							this.__onArrange.splice(i,1)
						}
					}
					return obj;
				}

				obj.__update = function() {
					var i = this.__onUpdate.length;
					while (i--) {
						var obj = this.__onUpdate[i]();
						if (obj.node) {
							obj = obj.node;
						}

						if (!seeker.util.inDOM(obj)) {
							this.__onUpdate.splice(i,1)
						}
					}
					return obj;
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
				obj.__onUpdate = {};
				obj.__onUpdate['all'] = [];

				obj.__update = function() {
					var k = [];
					if (arguments.length == 0) {
						k.push('all');
					} else {
						var i = arguments.length
						while ( i-- ) {
							if (!this.__onUpdate[arguments[i]]) {
								k = [];
								k.push('all');
								break
							} else {
								k.push(arguments[i]);
							}
						}
					}

					var i = k.length;
					while ( i-- ) {
						var arr = this.__onUpdate[k[i]];
						var n = arr.length;

						while ( n-- ) {
							arr[n]();
						}
					}

					return obj;
				}

				obj.__set = function(i, v) {
					obj[i] = v;
					obj.__update(i);

					return obj;
				}
			}
		}

		return obj;
	}

	seeker.util.attachScalarBinding = function(obj) {
		//attach functions to view objects that binds to scalars
		obj.getScalar = function() {
			return obj._data[obj._key];
		}

		obj.bind = function(d,k) {
			obj._data = d;
			obj._key = k;

			seeker.util.attachModel(obj._data);

			if (!obj._data.__onUpdate[k]) {
				obj._data.__onUpdate[k] = [];
			}

			obj._data.__onUpdate[k].push(obj.update);
			obj._updateIndex = obj._data.__onUpdate[k].length - 1;

			return obj;
		}

		obj.unbind = function() {
			obj._data.__onUpdate[k].splice(obj._updateIndex,1);
			obj._data.__clean();
			obj._data = null;
			obj._key = null;
			obj._updateIndex = null;
		}
	}

	seeker.util.attachCollectionBinding = function(obj) {
		//attach functions to view objects that binds to collections

		obj.onUpdate = function(f) {
			obj._data.__onUpdate.push(f);

			return obj;
		}

		obj.data = function(d) {
			obj._data = d;

			seeker.util.attachModel(obj._data);
			obj.onUpdate(obj.update);

			return obj;
		}
	}

	seeker.util.updateCollection = function(models, views, add, del, update, parent) {
		var modelsLength = models.length;
		var viewsLength = views.length;

		if (viewsLength < modelsLength) {
			for ( var i = viewsLength ; i < modelsLength ; i++ ) {
				var element = new add;
				element.index = i;
				views.push(element);
				parent.append(views[i]);
			}
		} else if (viewsLength > modelsLength) {
			var num = viewsLength - modelsLength;
			var removed = views.splice(modelsLength, num);
			for ( var i = 0 ; i < removed.length ; i++ ) {
				if (removed[i].node) {
					parent.node.removeChild(removed[i].node);
					del(removed[i]);
				} else {
					parent.node.removeChild(removed[i]);
				}
			}
		}
		
		var i = views.length;
		while ( i-- ) {
			update(views[i], models[i]);
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
				if (removed[i].node) {
					parent.node.removeChild(removed[i].node);
					remove[i].unbind();
				} else {
					parent.node.removeChild(removed[i]);
				}
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
