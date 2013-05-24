(function() {
	seeker.popup = function(ele, cl) {
		var arrow = document.createElement('div');
		var e = document.createElement(ele);

		arrow.setAttribute('id','arrow');
		e.setAttribute('id',cl);

		e.arrow = arrow;

		e.orient = function(m) {
			if (m == '0') {
				//above cursor
				arrow.style.top = this.offsetHeight - 4;
			} else {
				//below cursor
				arrow.style.top = -4;
			}

			return this;
		}

		e.position = function(m) {
			if (m =='0') {
				//left of cursor
				arrow.style.left = this.offsetWidth - 20;
			} else {
				//right of cursor
				arrow.style.left = 20;
			}

			return this;
		}

		e.place = function(coord) {
			var winDim = seeker.util.winDimensions();
			var width = this.offsetWidth;
			var height = this.offsetHeight;

			if (coord[1] - height < 10) {
				//near top, make under cursor
				this.orient(1);
				this.style.top = coord[1] + 20;
			} else if (coord[1] + height > winDim[1] - 30) {
				//near bottom, make above cursor
				this.orient(0);
				this.style.top = coord[1] - this.offsetHeight - 20;
			} else {
				//default, under cursor
				this.orient(1);
				this.style.top = coord[1] + 20;
			}

			if (coord[0] - width < 10) {
				//near left, make right of cursor
				this.position(1);
				this.style.left = coord[0] - 15;
			} else if (coord[0] + width > winDim[0] - 10) {
				//near right, make left of cursor
				this.position(0);
				this.style.left = coord[0] - this.offsetWidth + 15
			} else {
				//default, right of cursor
				this.position(1);
				this.style.left = coord[0] - 15;
			}

			return this;
		}

		e.attachTo = function(obj) {
			obj.appendChild(e);
			return e;
		}

		return e;
	}

	seeker.menu = function() {
		var list = new seeker.popup('ul','menu')

		var _items = [];
		list.initialize = function() {
			while (list.lastChild) {
  				list.removeChild(list.lastChild);
			}

			for ( var i = 0 ; i < _items.length ; i ++ ) {
				var newItem = document.createElement('li');
				newItem.innerHTML = _items[i][0];
				newItem.onclick = _items[i][1];
				list.appendChild(newItem);
			}

			list.appendChild(list.arrow);
			list.arrow.style.top = '20px';
			list.arrow.style.left = '20px';

			return list;
		}

		list.addItem = function(label, f) {
			_items.push([label,f]);
			list.initialize();
			return list;
		}

		list.removeItem = function(label) {
			var index;
			for ( var i = 0 ; i < _items.length ; i++ ) {
				if (_items[i][0] == label) {
					index = i;
					break
				}
			}
			removed = _items.splice(index,1)[0];
			list.initialize();
			return removed;
		}

		list.insert = function(label, f, i) {
			_items.splice(i,0,[label,f]);
			list.initialize();
			return list;
		}

		list.attachTo = function(obj) {
			obj.appendChild(list);
			return list;
		}

		return list;
	}

	seeker.menu_complex = function() {
		
	}

	seeker.navigation = function() {
		var list = document.createElement('ul');
		list.setAttribute('id','navigation');

		var _items = [];
		var _logo = -1;
		var _divider;

		list.setLogo = function(obj, divide) {
			_logo = obj;
			_divider = divide
		}

		list.initialize = function() {
			while (list.lastChild) {
  				list.removeChild(list.lastChild);
			}

			if (_logo != -1) {
				var logoObj = document.createElement('li');
				logoObj.innerHTML = _logo;
				list.appendChild(logoObj);
				logoObj.style.paddingRight = _divider;
				logoObj.style.paddingLeft = _divider;
				logoObj.style.fontSize = '10pt';
			}

			for ( var i = 0 ; i < _items.length ; i ++ ) {
				var newItem = document.createElement('li');
				newItem.innerHTML = _items[i][0];
				list.appendChild(newItem);
			}
		}

		list.lyaout = function() {

		}

		list.addItem = function(label, f) {
			_items.push([label,f]);
			list.initialize();
			return list;
		}

		return list;
	}
})();