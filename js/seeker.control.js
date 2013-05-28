(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	Introduction:
	DOM elements like menus, navigation bars, tooltips are included in this file.
	*/

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
				newItem.onmouseover = _items[i][2];
				newItem.onmouseout = _items[i][3];
				list.appendChild(newItem);
			}

			list.appendChild(list.arrow);
			list.arrow.style.top = '20px';
			list.arrow.style.left = '20px';

			return list;
		}

		list.addItem = function(label, click, over, out) {
			_items.push([label,click,over,out]);
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

	seeker.status = function() {
		var textBox = document.createElement('div');
		textBox.setAttribute('id','status');
		textBox.style.display = 'none';

		textBox.layout = function(val) {
			textBox.style.display = 'table';
			textBox.innerHTML = val;
			var winDim = seeker.util.winDimensions();
			textBox.style.top = winDim[1] - textBox.offsetHeight - 20;
			textBox.style.left = winDim[0] - textBox.offsetWidth - 30;

			return textBox;
		}

		textBox.hide = function() {
			textBox.style.display = 'none';
		}

		textBox.attachTo = function(node) {
			node.appendChild(textBox);

			return textBox;
		}

		return textBox;
	}

	seeker.navigation = function() {

	}	

})();