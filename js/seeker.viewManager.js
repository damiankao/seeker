(function() {
	seeker.view = function() {
		this.node = document.createElement('div');
		this.node.style.position = "absolute";
		this.actions = {};
		return this;
	}

	seeker.view.prototype.fire = function(act) {
		this.actions[act]();
	}

	seeker.view.prototype.style = function(s, val) {
		this.node.style[s] = val;
		return this;
	}

	seeker.view.prototype.class = function(val) {
		this.node.className = val;
		return this;
	}

	seeker.view.prototype.whxy = function(w,h,x,y) {
		s = this.node.style;
		this.style('width',(w != -1) ? w : s.width)
			.style('height',(h != -1) ? h : s.height)
			.style('left',(x != -1) ? x : s.left)
			.style('top',(y != -1) ? y : s.top);
		return this;
	}

	seeker.view.prototype.attachTo = function(obj) {
		obj.appendChild(this.node);
		return this;
	}

	seeker.view.prototype.detach = function() {
		if (this.node.parentNode) {
			this.node.parentNode.removeChild(this.node);
		}
    	return this;
	}

	seeker.view.prototype.show = function() {
		this.node.style.display = 'block';
	}

	seeker.view.prototype.hide = function() {
		this.node.style.display = 'none';
	}

	seeker.view.prototype.toggle = function() {
		if (this.node.style.display == "none") {
	    	this.show();
	    } else {
	    	this.hide();
	    }
	}

	/////////////////////////
	//D3 specific functions//
	/////////////////////////

	seeker.view.prototype.D3_move = function(xa, ya, xb, yb, d) {
		d3.select(this.node)
			.style('top',ya)
			.style('left',xa)
			.transition().duration(d)
				.style('top',yb)
				.style('left',xb);
	}

	seeker.view.prototype.D3_moveTo = function(x, y, d) {
		d3.select(this.node)
			.transition().duration(d)
				.style('top',y)
				.style('left',x);
	}

	seeker.view.prototype.D3_fade = function(from, to, d) {
		d3.select(this.node)
			.style('opacity',from)
				.transition().duration(d)
					.style('opacity',to);
	}

	seeker.view.prototype.D3_fadeTo = function(to, d) {
		d3.select(this.node)
			.transition().duration(d)
				.style('opacity',to);
	}
	/////////////////////////
	/////////////////////////


	seeker.messenger = function() {
		var _actions = {};

		seeker.view.prototype.unsub = function(act) {
			var oid = this.oid;
			var num = _actions[act].length;
			for ( var i = 0 ; i < num ; i++ ) {
				if (_actions[act][i][0] == oid) {
					_actions[act].splice(i,1);
					break;
				}
			}
			this.actions[act] = null;
			return this;
		}

		seeker.view.prototype.unsubAll = function() {
			var oid = this.oid;
			for (var k in this.actions) {
				var num = _actions[k].length;
				for ( var i = 0 ; i < num ; i++ ) {
					if (_actions[k][i][0] == oid) {
						_actions[k].splice(i,1);
						break;
					}
				}
			}
			this.actions = {};
			return this;
		}

		function subscribe(obj, act, f) {
			if (_actions[act] == null) {
				_actions[act] = [];
			}

			_actions[act].push([obj.oid,obj])
			obj.actions[act] = f;
	
			return obj;
		}

		function broadcast(act) {
			var num = _actions[act].length;
			var obj = _actions[act];
			for ( var i = 0; i < num ; i ++ ) {
				obj[i][1].fire(act);
			}
			return this;
		}

		function list() {
			var acts = [];
			for (var act in _actions) {
				acts.push(act);
			}

			return acts;
		}

		function listObj(act) {
			return _actions[act];
		}

		function cleanup() {
			for (var act in _actions) {
				if (_actions[act].length == 0) {
					delete _actions[act];
				}
			}

			return this;
		}

		return {
			'sub':subscribe,
			'broadcast':broadcast,
			'list':list,
			'listObj':listObj,
			'clean':cleanup
		}
	}

	seeker.viewManager = function(num) {
		//object pools for views
		var _views = []
		var objCount = 0;

		seeker.view.prototype.free = function() {
			_views.push(this);
			return this.detach().unsubAll();
		}

		//initialize pool with specified number objects
		for ( var i = 0; i <= num ; i ++ ) {
			var nv = new seeker.view();
			nv.oid = objCount++;
			_views.push(nv);
		}

		function getView() {
			var nv;
			if (_views.length == 0) {
				nv = new seeker.view();
			} else {
				nv = _views.pop();
			}

			if (arguments[0]) {
				nv.attachTo(arguments[0]);
			} else {
				return nv;
			}
		}

		function remaining() {
			return _views.length;
		}

		function created() {
			return objCount - 1;
		}

		return {
			'get':getView,
			'remain':remaining,
			'created':created
		}
	}
})();