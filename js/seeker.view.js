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

	seeker.view.prototype.clean = function() {
		this.node.removeAttribute('style');
		this.node.className = '';
		this.node.innerHTML = '';

		return this;
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

	/*
	publisher - subscription service
	-contains a hash of actions for view elements to subscribe to. 
	-when action is broadcasted, all view elements fire the action.
	-attaches unsubscribe functions to view elements.
	*/
	seeker.messenger = function() {
		//hash of actions 
		var _actions = {};

		//add unsub functions to view elements
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

		//subscribe an object to an action 
		//also add response function for the action
		function subscribe(obj, act, f) {
			if (_actions[act] == null) {
				_actions[act] = [];
			}

			_actions[act].push([obj.oid,obj])
			obj.actions[act] = f;
	
			return obj;
		}

		//broadcast the action to all elements to fire
		function broadcast(act) {
			var num = _actions[act].length;
			var obj = _actions[act];
			for ( var i = 0; i < num ; i ++ ) {
				obj[i][1].fire(act);
			}
			return this;
		}

		//list all available actions
		function list() {
			var acts = [];
			for (var act in _actions) {
				acts.push(act);
			}

			return acts;
		}

		//list all objects for an action
		function listObj(act) {
			return _actions[act];
		}

		//delete any action with no elements
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

	/*
	A resource manager for view elements
	-sets up a pool of available view elements
	-creation and destruction of DOM elements is expensive
	-view elements are recycled instead of destroyed
	*/
	seeker.viewManager = function(num) {
		//view elements pool and object counts
		var _views = []
		var objCount = 0;

		//add a 'free' function to each view element
		//detach view from parent and unsubscribe to any actions
		//push this view to the _views pool
		seeker.view.prototype.free = function() {
			_views.push(this);
			if (this.disassemble()) {
				this.disassemble();
			}
			return this.detach().unsubAll().clean();
		}

		//initialize pool with specified number objects
		for ( var i = 0; i <= num ; i ++ ) {
			var nv = new seeker.view();
			nv.oid = objCount++;
			_views.push(nv);
		}

		//get available view from pool
		//if no view available, create new view
		//allows one argument for parent node
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

		//number of views remaining in pool
		function remaining() {
			return _views.length;
		}

		//number of views created so far
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