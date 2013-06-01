(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	Introduction:
	DOM elements like menus, navigation bars, tooltips are included in this file.
	*/

	seeker.popup = function(ele, cl) {
		/*
		This is used for any DOM element that pops up and requires attention to edge of window. 
		This element is an arrowed rounded corner container.
		*/
		var arrow = document.createElement('div');
		var e = document.createElement(ele);

		arrow.setAttribute('id','arrow');
		e.setAttribute('id',cl);

		e.arrow = arrow;

		e.orient = function(m) {
			if (m == '0') {
				//above cursor
				arrow.style.top = this.offsetHeight - 6;
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

	seeker.colorpicker = function() {
		var picker = document.createElement('div');
		var slider = document.createElement('div');
		picker.setAttribute('id','picker');
		slider.setAttribute('id','slide');

		var container = seeker.popup('div','colorpicker');
		container.appendChild(picker);
		container.appendChild(slider);
		container.appendChild(container.arrow);

		document.body.appendChild(container);

		container.cp = ColorPicker(
			document.getElementById('slide'),
			document.getElementById('picker'),
			function(hex, hsv, rgb) {
				console.log(hex);
		});

		container.setCallback = function(f) {
			this.cp.callback = f;
		}
		return container;
	}

	seeker.menu = function() {
		var list = new seeker.popup('ul','menu');

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

	seeker.status = function(p) {
		var textBox = document.createElement('div');
		textBox.setAttribute('id','status');
		textBox.style.display = 'none';

		p.appendChild(textBox);

		var _pos;

		textBox.layout = function(val) {
			textBox.style.display = 'table';
			textBox.innerHTML = val;

			var textDim = _pos();
			textBox.style.top = textDim[1];
			textBox.style.left = textDim[0];

			return textBox;
		}

		textBox.setPosition = function(f) {
			_pos = f.bind(this);

			return textBox;
		}

		textBox.hide = function() {
			textBox.style.display = 'none';

			return this;
		}

		return textBox;
	}

	seeker.button = function(t) {
		var button = document.createElement('a');
		button.setAttribute('href','#');
		this.node = button;

		if (t == 0) {
			button.setAttribute('id','buttonA');
		} else if (t == 1) {
			button.setAttribute('id','buttonB');
		}

		return this;
	}

	seeker.button.prototype.xy = function(x,y) {
		var s = this.node.style;
		s.left = (x != -1) ? x : s.left;
		s.top = (y != -1) ? y : s.top;
		return this;
	}

	seeker.button.prototype.setText = function(val) {
		this.node.innerHTML = val;

		return this;
	}

	seeker.button.prototype.attachTo = function(obj) {
		obj.appendChild(this.node);

		return this;
	}

	seeker.button.prototype.d3 = function() {
		return d3.select(this.node);
	}

	seeker.button.prototype.setClick = function(f) {
		this.node.onclick = f;

		return this;
	}

	seeker.navigation = function() {

	}

	seeker.slider = function() {
		var container = new seeker.container();
		container.node.setAttribute('id','slider');

		var numberBox = document.createElement('input');
		numberBox.setAttribute('id','slider_numberBox');
		var spine = document.createElement('div');
		spine.setAttribute('id','slider_spine');
		var marker = document.createElement('div');
		marker.setAttribute('id','slider_marker');
		var label = document.createElement('label');

		container.node.appendChild(numberBox);
		container.node.appendChild(spine);
		container.node.appendChild(marker);
		container.node.appendChild(label);

		var _start;
		var _end;
		var _maxX;
		var _minX;

		container.setInterval = function(start,end) {
			_start = start;
			_end = end;
			_minX = spine.offsetLeft + 2;
			_maxX = spine.offsetLeft + spine.offsetWidth - 2 - marker.offsetWidth

			return container;
		}

		var margin = 10;
		var _callback;
		var _current;

		d3.select(marker)
			.on('mousedown', function() {
				d3.event.preventDefault();
				d3.event.stopPropagation();
				d3.select(document.body)
					.on('mousemove', function() {
						var x = d3.mouse(container.node)[0];

						if (x < _minX) {
							x = _minX;
						} else if (x > _maxX) {
							x = _maxX;
						}

						var spinePos = x - _minX;
						_current = Math.round(spinePos / (spine.offsetWidth - 4 - marker.offsetWidth) * (_end - _start + 1));
						numberBox.value = _current;

						marker.style.left = x;
						if (_callback) {
							_callback();
						}
					})

				d3.select(document.body)
					.on('mouseup', function() {
						d3.select(document.body)
							.on('mousemove', null)
							.on('mouseup', null);
					})
			});

		d3.select(numberBox)
			.on('change',function() {
				container.setSliderPos(parseInt(numberBox.value));
				if (_callback) {
					_callback();
				}
			});

		container.onSlide = function(f) {
			_callback = f;

			return container;
		}

		container.getSliderPos = function() {
			return _current;
		}

		container.layout = function(w,h,x,y) {
			container.whxy(w,h,x,y);
			d3.select(numberBox)
				.style('width','45')
				.style('top',h - numberBox.offsetHeight - margin)
				.style('left',margin)

			d3.select(spine)
				.style('top',h - margin - (numberBox.offsetHeight / 2))
				.style('left',numberBox.offsetWidth + margin + 5)
				.style('width',w - (numberBox.offsetWidth + margin * 2 + 5));

			d3.select(marker)
				.style('top',spine.offsetTop - 6)
				.style('left',numberBox.offsetWidth + margin + 7);

			d3.select(label)
				.style('top',margin)
				.style('position','absolute')
				.attr('id','textA')
				.style('left',margin + 10);

			numberBox.value = 0;

			_minX = spine.offsetLeft + 2;
			_maxX = spine.offsetLeft + spine.offsetWidth - 2 - marker.offsetWidth

			return container;
		}

		container.setSliderPos = function(pos) {
			_current = pos;
			numberBox.value = _current;
			marker.style.left = _current / (_end - _start + 1) * (spine.offsetWidth - 4 - marker.offsetWidth) + spine.offsetLeft;
			
			return container;
		}

		container.setLabel = function(val) {
			label.innerHTML = val;

			return container;
		}

		return container;
	}

})();