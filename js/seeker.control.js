(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	Introduction:
	DOM controls are included in this file. All view elements are inherited from the seeker.element class.
	DOM elements like menus, navigation bars, tooltips are included in this file.

	Data binding:
	Some of these elements can be bound to a data object. When bound, an array, __onChange and function
	__update() is added to the data object if it doesn't already exist. THe update function of the view
	element is then pushed into the __onChange array. When the scalars in the data object is updated, the 
	__update() function ca be called to update the view element bound to the scalars. 

	View objects can only be bound to the current hierchical level of the object in question. If the object
	contains another object, any changes made in the child object will not call the parent update function,
	instead it will call its own update function. While it is technically possible to "bubble up" the update
	function to parental objects, it is usually a computational waste. 

	When a view element that has its update function bound to a data object is destroyed, the DOM node is 
	detached. On the next __update() function, any __onChange function that returns a node not in the DOM, 
	is spliced out of the __onChange array. No references to the view element or the node should remain 
	and will be subsequently garbage collected. 

	Components:
		base classes:
			element: base element for all controls.
			popup: arrowed container element that responds intelligently to window edges. 

		data array binding classes:
			menu: Simple menu. Input is an array of array['menu item name',click function]
			complexMenu: Complex menu with a button list header and template driven items. The input require
				are the object data and template function for creating each menu item.

		single data binding classes: input is a scalar-type data of an object
			textbox
			checkbox
			slider: numerical slider
			option: drop down menu of possible options
			button

		none data binding classes:
			colorpicker
			status
	*/

	seeker.element = function(e) {
		this.node = document.createElement(e);
		if (e != 'input') {
			this.node.onmousedown = function(evt) {
				evt.preventDefault();
			}
		} else {
			this.node.onmousedown = function(evt) {
				evt.stopPropagation();
			}
		}
		return this;
	}

	seeker.element.prototype.d3 = function() {
		return d3.select(this.node);
	}

	seeker.element.prototype.style = function(s, val) {
		this.node.style[s] = val;
		return this;
	}

	seeker.element.prototype.attr = function(a, val) {
		this.node.setAttribute(a,val);
		return this;
	}

	seeker.element.prototype.id = function(val) {
		this.node.setAttribute('id',val);
		return this;
	}

	seeker.element.prototype.class = function(val) {
		this.node.className = val;
		return this;
	}

	seeker.element.prototype.html = function(val) {
		this.node.innerHTML = val;
		return this;
	}

	seeker.element.prototype.whxy = function(w,h,x,y) {
		s = this.node.style;
		this.style('width',(w != -1) ? w : s.width)
			.style('height',(h != -1) ? h : s.height)
			.style('left',(x != -1) ? x : s.left)
			.style('top',(y != -1) ? y : s.top);
		return this;
	}

	seeker.element.prototype.attachTo = function(obj) {
		if (obj.appendChild) {
			obj.appendChild(this.node);
		} else {
			obj.node.appendChild(this.node);
		}
		return this;
	}

	seeker.element.prototype.append = function(obj) {
		if (obj.attachTo) {
			obj.attachTo(this.node);
		} else {
			this.node.appendChild(obj);
		}

		return this;
	}

	seeker.element.prototype.detach = function() {
		if (this.node.parentNode) {
			this.node.parentNode.removeChild(this.node);
		}
    	return this;
	}

	seeker.element.prototype.show = function() {
		this.node.style.display = 'block';
		return this;

	}

	seeker.element.prototype.hide = function() {
		this.node.style.display = 'none';
		return this;
	}

	seeker.element.prototype.toggle = function() {
		if (this.node.style.display == "none") {
	    	this.show();
	    } else {
	    	this.hide();
	    }
	    return this;
	}

	seeker.element.prototype.fade = function(from, to, d,e) {
		this.d3()
			.style('opacity',from)
				.transition().duration(d).ease(e)
					.style('opacity',to);

		return this;
	}

	seeker.element.prototype.move = function(xa, ya, xb, yb, d,e) {
		this.d3()
			.style('top',ya)
			.style('left',xa)
			.transition().duration(d).ease(e)
				.style('top',yb)
				.style('left',xb);

		return this;
	}

	seeker.element.prototype.moveFade = function(from,to,xa,ya,xb,yb,d,e) {
		this.d3()
			.style('opacity',from)
			.style('top',ya)
			.style('left',xa)
			.transition().duration(d).ease(e)
				.style('top',yb)
				.style('left',xb)
				.style('opacity',to);

		return this;
	}

	seeker.popup = function(e) {
		/*
		This is used for any DOM element that pops up and requires attention to edge of window. 
		This element is an arrowed rounded corner container.
		*/
		var arrow = new seeker.element('div');
		var e = new seeker.element(e);

		arrow
			.id('arrow')
			.attachTo(e);

		e.arrow = arrow;

		e.orient = function(m) {
			if (m == '0') {
				//above cursor
				arrow.style('top',this.node.offsetHeight - 6);
			} else {
				//below cursor
				arrow.style('top',-4);
			}

			return this;
		}

		e.position = function(m) {
			if (m =='0') {
				//left of cursor
				arrow.style('left',this.node.offsetWidth - 10 - arrow.node.offsetWidth);
			} else {
				//right of cursor
				arrow.style('left', 10);
			}

			return this;
		}

		e.place = function(coord) {
			var winDim = seeker.util.winDimensions();
			var w = this.node.offsetWidth;
			var h = this.node.offsetHeight;

			if (coord[1] - h < 10) {
				//near top, make under cursor
				this.orient(1);
				this.style('top',coord[1] + arrow.node.offsetHeight * 3);
			} else if (coord[1] + h > winDim[1] - 30) {
				//near bottom, make above cursor
				this.orient(0);
				this.style('top',coord[1] - h - arrow.node.offsetHeight);
			} else {
				//default, under cursor
				this.orient(1);
				this.style('top',coord[1] + arrow.node.offsetHeight * 3);
			}

			if (coord[0] - w < 20) {
				//near left, make right of cursor
				this.position(1);
				this.style('left', coord[0] + 10);
			} else if (coord[0] + w > winDim[0] - 20) {
				//near right, make left of cursor
				this.position(0);
				this.style('left', coord[0] - w);
			} else {
				//default, right of cursor
				this.position(1);
				this.style('left', coord[0] + 10);
			}

			return this;
		}

		if (!seeker.env_popups) {
			seeker.env_popups = [];
			seeker.env_closePopups = function() {
				var num = seeker.env_popups.length;
				while (num--) {
					seeker.env_popups[num].hide();
				}
			}
		}
		seeker.env_popups.push(e);

		return e;
	}

	seeker.menu = function() {
		var list = new seeker.popup('ul')
			.id('menu');

		var _data = [];
		var _listObjs = [];

		list.data = function(val) {
			_data = val;

			seeker.util.attachModel(_data);
			_data.__onChange.push(list.update);

			return list;
		}

		list.addOnChange = function(f) {
			_data.__onChange.push(f);

			return list;
		}

		list.update = function() {
			if (_listObjs.length < _data.length) {
				for ( var i = _listObjs.length ; i < _data.length ; i++ ) {
					var li = document.createElement('li');
					li.index = i;
					li.onclick = function(evt) {
						evt.stopPropagation();
						evt.preventDefault();
						_data[this.index]['click']();
					};
					_listObjs.push(li);
					list.append(_listObjs[i]);
				}
			} else if (_listObjs.length > _data.length) {
				var num = _listObjs.length - _data.length;
				var removed = _listObjs.splice(_data.length, num);
				for ( var i = 0 ; i < removed.length ; i++ ) {
					list.node.removeChild(removed[i]);
				}
			}

			for ( var i = 0 ; i < _listObjs.length ; i++ ) {
				var label = new seeker.textbox()
					.attachTo(_listObjs[i])
					.data(_data[i],'name')
					.update();
			}

			return list;
		}

		return list;
	}

	seeker.complexMenu = function() {
		var container = new seeker.popup('div')
			.id('complexMenu')
		
		container.arrow
			.style('background','#38B87C');

		var list = new seeker.element('ul')
			.id('complexMenuItems');
		var controlList = new seeker.element('ul')
			.id('complexMenuControl');

		var _template;

		var _data = [];
		var _listObjs = [];
		var _update;

		var _controlData = [];
		var _controlListObjs = [];

		container.controlData = function(val) {
			_controlData = val;

			seeker.util.attachModel(_controlData);
			_data.__onChange.push(container.update);

			return container;
		}

		container.data = function(val) {
			_data = val;

			seeker.util.attachModel(_data);
			_data.__onChange.push(container.update);
			_data.__onLengthChange.push(container.init);

			return container;
		}

		container.addOnChange = function(f) {
			_data.__onChange.push(f);

			return container;
		}

		container.setTemplate = function(f) {
			_template = f;

			return container;
		}

		container.setUpdate = function(f) {
			_update = f;

			return container;
		}

		container.init = function() {
			if (_controlListObjs.length < _controlData.length) {
				for ( var i = _controlListObjs.length ; i < _controlData.length ; i++ ) {
					var li = document.createElement('li');
					li.index = i;
					li.onclick = function(evt) {
						evt.stopPropagation();
						evt.preventDefault();
						_controlData[this.index]['click']();
					};
					_controlListObjs.push(li);
					controlList.append(_controlListObjs[i]);
				}
			} else if (_controlListObjs.length > _controlData.length) {
				var num = _controlListObjs.length - _controlData.length;
				var removed = _controlListObjs.splice(_controlData.length, num);
				for ( var i = 0 ; i < removed.length ; i++ ) {
					controlList.node.removeChild(removed[i]);
				}
			}

			for ( var i = 0 ; i < _controlListObjs.length ; i++ ) {
				var label = new seeker.textbox()
					.attachTo(_controlListObjs[i])
					.data(_controlData[i],'name')
					.update();
			}

			if (_listObjs.length < _data.length) {
				for ( var i = _listObjs.length ; i < _data.length ; i++ ) {
					var li = document.createElement('li');
					li.index = i;
					_listObjs.push(li);
					list.append(_listObjs[i]);
				}
			} else if (_listObjs.length > _data.length) {
				var num = _listObjs.length - _data.length;
				var removed = _listObjs.splice(_data.length, num);
				for ( var i = 0 ; i < removed.length ; i++ ) {
					list.node.removeChild(removed[i]);
				}
			}

			for ( var i = 0 ; i < _listObjs.length ; i++ ) {
				var listObj = _listObjs[i];
				while (listObj.firstChild) {
				    listObj.removeChild(listObj.firstChild);
				}
				_template(listObj);
			}

			return container;
		}

		container.update = function() {
			if (_update) {
				for ( var i = 0 ; i < _listObjs.length ; i++ ) {
					_update(_listObjs[i]);
				}
			}

			var winDim = seeker.util.winDimensions();
			var pos = container.node.offsetTop + container.node.offsetHeight;

			if (pos > winDim[1] - 20) {
				container
					.style('height',winDim[1] - 20);
				list
					.style('height',winDim[1] - 20 - controlList.node.offsetHeight - 16);
			} else {
				container
					.style('height',null);
				list
					.style('height',null);
			}

			return container;
		}

		controlList
			.attachTo(container);
		list
			.attachTo(container);

		return container;
	}

	seeker.status = function() {
		var container = new seeker.element('div')
			.attr('id','status');

		var _pos;

		container.setPos = function(f) {
			_pos = f.bind(this)

			return container;
		}

		container.update = function(val) {
			var pos = _pos();

			container
				.style('display','table')
				.html(val)
				.style('top',pos[1])
				.style('left',pos[0]);

			return container;
		}

		return container;
	}

	seeker.button = function() {
		var container = new seeker.element('div')
			.id('button');

		var _data = [];

		container.setType = function(m) {
			//std - standard button
			//suc - success button
			//war - warning button
			//inf - info button
			//dan - danger button
			//dis - disabled button
			if (m == 'std') {
				container.style('background','#313841');
			} else if (m == 'suc') {
				container.style('background','#38B87C');
			} else if (m == 'war') {
				container.style('background','#F1C40F');
			} else if (m == 'inf') {
				container.style('background','#2980B9');
			} else if (m == 'dan') {
				container.style('background','#F34541');
			} else if (m == 'dis') {
				container.style('background','#BDC3AF');
			}

			return container;
		};

		container.data = function(d) {
			_data = d;

			return container;
		}

		container.onclick = function() {
			_data[1]();
		}

		container.update = function() {
			container
				.html(_data[0]);
		}

		return container;
	}

	seeker.textbox = function() {
		var container = new seeker.element('div')
			.id('textbox');

		var _data;
		var _key;

		container.data = function(d, k) {
			_data = d;
			_key = k;

			seeker.util.attachModel(_data);
			_data.__onChange.push(container.update);

			return container;
		}

		container.addOnChange = function(f) {
			_data.__onChange.push(f);

			return container;
		}

		container.update = function() {
			container
				.html(_data[_key]);

			return container;
		}

		return container;
	}

	seeker.checkbox = function() {
		var container = new seeker.element('div')
			.id('checkbox');

		var cb = new seeker.element('div')
			.id('cb')
			.attachTo(container);

		var label = new seeker.textbox()
			.attachTo(container)
			.id('label');
			
		var _data;
		var _key;
		var _margin = 4;

		container.data = function(d, k) {
			_data = d;
			_key = k;

			seeker.util.attachModel(_data);
			_data.__onChange.push(container.update);

			return container;
		}

		container.addOnChange = function(f) {
			_data.__onChange.push(f);

			return container;
		}

		container.check = function() {
			cb.id('cbChecked');

			return container;
		}

		container.uncheck = function() {
			cb.id('cb');

			return container;
		}

		container.margin = function(val) {
			_margin = val;

			return container;
		}

		container.setText = function(val) {
			label.html(val);

			return container;
		}

		container.bindLabel = function(d, k) {
			label
				.data(d,k)
				.update()
				.addOnChange(container.update);

			return container;
		}

		container.update = function() {
			label
				.style('top',_margin - 1)
				.style('left',cb.node.offsetWidth + 5 + _margin);

			container
				.style('height',cb.node.offsetHeight + _margin * 2)
				.style('width',cb.node.offsetWidth + label.node.offsetWidth + _margin * 2 + 6);

			cb
				.style('top',_margin)
				.style('left',_margin);

			if (_data[_key]) {
				container.check();
			} else {
				container.uncheck();
			}

			return container;
		}

		container.node.onclick = function(evt) {
			if (_data[_key]) {
				_data.__set(_key,false);
			} else {
				_data.__set(_key,true);
			}
		}


		return container;
	}

	seeker.option = function() {
		var _selection = [];
		var _margin = 10;

		var container = new seeker.element('div')
			.id('optionBox');

		var menu = new seeker.menu()
			.attachTo(container)
			.data(_selection)
			.style('background','#38B87C')
			.style('color','white');
		menu.arrow
			.style('background','#38B87C');

		var label = new seeker.textbox()
			.id('label')
			.attachTo(container);

		var selection = new seeker.element('div')
			.id('optionSelection')
			.attachTo(container);

		var downArrow = new seeker.element('div')
			.attachTo(container)
			.id('downArrow');

		var _data;
		var _key;

		container.data = function(d, k) {
			_data = d;
			_key = k;

			seeker.util.attachModel(_data);
			_data.__onChange.push(container.update);

			return container;
		}

		container.addOnChange = function(f) {
			_data.__onChange.push(f);

			return container;
		}

		container.setText = function(val) {
			label.html(val);

			return container;
		}

		container.bindLabel = function(d, k) {
			label
				.data(d,k)
				.update()
				.addOnChange(container.update);

			return container;
		}

		container.setSelection = function(d) {
			_selection = [];

			for ( var i = 0 ; i < d.length ; i++ ) {
				_selection.push({'name':d[i],'click':function() {
					_data.__set(_key,this['name']);
					menu.hide()
				}});
			}

			menu
				.data(_selection)
				.update();

			return container;
		}

		container.update = function() {
			menu
				.style('display','block')
				.style('left',-10000);

			label
				.style('top',_margin)
				.style('left',_margin);

			var w = label.node.offsetWidth > menu.node.offsetWidth ? label.node.offsetWidth : menu.node.offsetWidth;

			selection
				.style('width',w - 10)
				.style('top',label.node.offsetHeight + 5 + _margin)
				.style('left',_margin)
				.html(_data[_key]);

			container
				.style('width',w + _margin * 2)
				.style('height',label.node.offsetHeight + 5 + selection.node.offsetHeight + _margin * 2);

			menu
				.style('width',parseInt(container.node.style.width) - _margin * 2);

			downArrow
				.style('top',selection.node.offsetTop + selection.node.offsetHeight / 2 - 3)
				.style('left',selection.node.offsetLeft + selection.node.offsetWidth - 18);

			menu.arrow
				.style('left',container.node.offsetWidth - 37);

			return container;
		}

		var click = function(evt) {
			evt.stopPropagation();
			evt.preventDefault();

			if (menu.node.style.left == '-10000px') {
				menu.style('display','none');
			}

			menu.toggle();
			menu
				.moveFade(0,1,selection.node.offsetLeft, selection.node.offsetTop,selection.node.offsetLeft,selection.node.offsetTop + selection.node.offsetHeight + 13,120,'cubic-in-out');
		}

		selection.node.onclick = click;
		downArrow.node.onclick = click;

		container.setMargin = function(val) {
			_margin = val;
			container.update();

			return container;
		}

		return container;
	}

	seeker.slider = function() {
		var container = new seeker.element('div')
			.id('slider');
		var numberBox = new seeker.element('input')
			.id('tbox');
		var spine = new seeker.element('div')
			.id('spine');
		var marker = new seeker.element('div')
			.id('marker');
		var label = new seeker.textbox()
			.id('label');

		label.attachTo(container);
		numberBox.attachTo(container);
		spine.attachTo(container);
		marker.attachTo(container);

		var _data;
		var _key;
		var _start;
		var _end;

		container.data = function(d, k) {
			_data = d;
			_key = k;

			seeker.util.attachModel(_data);
			_data.__onChange.push(container.update);

			return container;
		}

		container.setText = function(val) {
			label.html(val);

			return container;
		}

		container.bindLabel = function(d, k) {
			label
				.data(d,k)
				.update();

			return container;
		}

		container.setInterval = function(s,e) {
			_start = s;
			_end = e;

			return container;
		}

		container.update = function() {
			var spineWidth = parseInt(container.node.style.width) - parseInt(numberBox.node.offsetWidth) - 10;
			var spinePos = (spineWidth - 16) * ((_data[_key] - _start) / (_end - _start));
			var spineLeft = parseInt(numberBox.node.offsetLeft) + parseInt(numberBox.node.offsetWidth) + 10;

			spine
				.style('width',spineWidth)
				.style('left',spineLeft)
				.style('top',parseInt(numberBox.node.offsetTop) + (parseInt(numberBox.node.offsetHeight) / 2) - 2);

			marker
				.style('left',spineLeft + 3 + spinePos)
				.style('top',parseInt(numberBox.node.offsetTop) + (parseInt(numberBox.node.offsetHeight) / 2) - 8);

			numberBox.node.value = _data[_key];

			return container;
		}

		marker.node.onmousedown = function(evt) {
			evt.preventDefault();
			evt.stopPropagation();

			document.body.onmousemove = function(evt) {
				var spineWidth = parseInt(container.node.style.width) - parseInt(numberBox.node.offsetWidth) - 26;
				var spinePos = seeker.util.mouseCoord(evt)[0] - parseInt(container.node.style.left) - parseInt(numberBox.node.offsetLeft) - parseInt(numberBox.node.offsetWidth) - 18;
				var length = _end - _start;
				var val;

				if (spinePos < 0) {
					spinePos = 0;
				} else if (spinePos > spineWidth) {
					spinePos = spineWidth;
				}

				val = Math.round(spinePos / spineWidth * length);
				
				_data.__set(_key, val + _start);

				document.body.onmouseup = function(evt) {
					document.body.onmousemove = null;
					document.body.onmouseup = null;

					seeker.util.mouseCoord(evt)[0]
				}
			} 
		}

		spine.node.onclick = function(evt) {
			evt.preventDefault();
			evt.stopPropagation();

			var spineWidth = parseInt(container.node.style.width) - parseInt(numberBox.node.offsetWidth) - 26;
			var spinePos = seeker.util.mouseCoord(evt)[0] - parseInt(container.node.style.left) - parseInt(numberBox.node.offsetLeft) - parseInt(numberBox.node.offsetWidth) - 18;
			var length = _end - _start;
			var val;

			val = Math.round(spinePos / spineWidth * length);
			
			if (val + _start < _start) {
				val = 0;
			} else if (val + _start > _end) {
				val = _end - _start;
			}

			_data.__set(_key, val + _start);
		}

		numberBox.node.onchange = function() {
			_data.__set(_key, this.value);
		}

		return container;
	}

	seeker.colorpicker = function() {
		var container = new seeker.popup('div')
			.id('colorpicker');
		var slider = new seeker.element('div')
			.attachTo(container)
			.id('colorslider');
		var picker = new seeker.element('div')
			.attachTo(container)
			.id('picker');

		var cp = ColorPicker(slider.node, picker.node,function(){});

		container.setCallback = function(f) {
			cp.callback = f;

			return container;
		}

		return container;
	}
})();