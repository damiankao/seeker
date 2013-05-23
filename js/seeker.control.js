(function() {
	seeker.menu = function() {
		var list = document.createElement('ul');
		var arrow = document.createElement('div');

		arrow.className = 'menuArrow';
		list.className = 'menu';

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

			list.appendChild(arrow);
			arrow.style.top = '20px';
			arrow.style.left = '20px';
			return list;
		}

		list.orient = function(m) {
			if (m == '0') {
				//above cursor
				arrow.style.top = this.offsetHeight - 4;
			} else {
				//below cursor
				arrow.style.top = -4;
			}

			return this;
		}

		list.position = function(m) {
			if (m =='0') {
				//left of cursor
				arrow.style.left = this.offsetWidth - 20;
			} else {
				//right of cursor
				arrow.style.left = 20;
			}

			return this;
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
})();