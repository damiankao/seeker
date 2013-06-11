(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	Introduction:
	DOM controls are included in this file. All view elements are inherited from the seeker.element class.

	Data binding:
	Some of these elements can be bound to a data object. When bound, __onChange array and __update()
	function is added to the data object if it doesn't already exist. The update function of the view
	element is then pushed into the __onChange array. When the scalars in the data object is updated, the 
	__update() function can be called to update the view element bound to the scalars. 

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

		scalar binding views:
			textbox
			checkbox
			slider: numerical slider
			option: drop down menu of possible options
			button

		collection binding views:
			menu: Simple menu. Input is an array of array['menu item name',click function]
			complexMenu: Complex menu with a button list header and template driven items. The input require
				are the object data and template function for creating each menu item.

		static views:
			colorpicker
			status
	*/

	//base elements
	seeker.element = function(e) {
		this.node;

		if (arguments[1]) {
			this.node = document.createElementNS("http://www.w3.org/2000/svg", e);
			this.text = function(val) {
				this.node.textContent = val;

				return this;
			}
		} else {
			this.node = document.createElement(e);
		}

		this.node.__seeker = this;

		if (e != 'input') {
			this.node.onmousedown = function(evt) {
				evt.preventDefault();
			}
		} else {
			this.node.onmousedown = function(evt) {
				evt.stopPropagation();
			}
		}

		if (e == 'line') {
			this.draw = function(x1,y1,x2,y2) {
				this
					.attr('x1',x1)
					.attr('y1',y1)
					.attr('x2',x2)
					.attr('y2',y2);

				return this;
			}
		}

		return this;
	}

	seeker.element.prototype.bind = function(d) {
		//can bind multiple objects
		//d is an object where each key/value is an array of [object, key]
		if (this.data) {
			this.unbind();
		}

		this.data = d;

		for (name in this.data) {
			var obj = this.data[name].obj;

			if (Object.prototype.toString.call(obj) === '[object Array]') {
				//collection
				if (!obj.__seeker) {
					obj.__onArrange = [];

					obj.__arrange = function() {
						var i = obj.__onArrange.length;
						while ( i-- ) {
							obj.__onArrange[i][0]();
						}
					}

					obj.__set = function(k, val, indeces) {
						var l = indeces.length

						while ( l-- ) {
							obj[indeces][l].__set(k,val);
						}

						obj.__arrange();
						return obj;
					}

					obj.__setAll = function(n, val) {
						var l = obj.length;

						while ( l-- ) {
							obj[l].__set(n,val);
						}

						obj.__arrange();
						return obj;
					}
				}
			} else {
				//scalar
				var key = this.data[name].key;
				if (!obj.__seeker) {
					obj.__onUpdate = {};

					obj.__update = function() {
						var args = arguments;
						var argsLen = args.length;

						var k = [];

						if (args.length > 0) {
							while ( argsLen-- ) {
								if (obj.__onUpdate[args[argsLen]]) {
									k.push(args[argsLen]);
								}
							}
						}

						var kLen = k.length;
						while ( kLen-- ) {
							var update = obj.__onUpdate[k[kLen]];
							var updateLen = update.length;
							while ( updateLen-- ) {
								update[updateLen][0]();
							}
						}
					}

					obj.__clean = function() {
						for (prop in obj.__onUpdate) {
							if ( obj.__onUpdate[prop].length == 0 ) {
								delete obj.__onUpdate[prop];
							}
						}

						return obj
					}

					obj.__set = function(k,val) {
						obj[k] = val;
						obj.__update(k);

						return obj;
					}
				}
			}
			obj.__seeker = true;
		}
			
		if (this.postBind) {
			this.postBind();
		}

		return this;
	}

	seeker.element.prototype.set = function(n, val) {
		if (this.data) {
			var obj = this.data[n].obj;
			if ( Object.prototype.toString.call(obj) === '[object Array]' ) {
				var k = arguments[2]
				var indeces = arguments[3];

				obj.__set(k, val, indeces);
			} else {
				var key = this.data[n].key;

				obj.__set(key,val);
			}
		}

		return this;
	}

	seeker.element.prototype.unbind = function() {
		if (this.data) {
			for (name in this.data) {
				var obj = this.data[name].obj;

				if ( Object.prototype.toString.call(obj) === '[object Object]' ) {
					var key = this.data[name].key;

					if (obj.__onUpdate[key]) {
						var update = obj.__onUpdate[key];
						var updateLen = update.length;

						while ( updateLen-- ) {
							if ( update[updateLen][1] === this ) {
								update.splice(updateLen,1);
							}
						}
					}
				} else {
					if (obj.__onArrange) {
						var arrange = obj.__onArrange;
						var arrangeLen = arrange.length;

						while ( arrangeLen-- ) {
							if ( arrange[arrangeLen][1] == this ) {
								arrange.splice(arrangeLen,1);
							}
						}
					}
				}
			}

			this.data = null;
		}

		if (this.postUnbind) {
			this.postUnbind();
		}

		return this;
	}

	seeker.element.prototype.onUpdate = function(d, f) {
		if (this.data) {
			var obj = this.data[d].obj;

			if ( Object.prototype.toString.call(obj) === '[object Object]' ) {
				var key = this.data[d].key;

				if (!obj.__onUpdate[key]) {
					obj.__onUpdate[key] = [];
				}

				obj.__onUpdate[key].push([f, this]);
			}
		}

		return this;
	}

	seeker.element.prototype.onArrange = function(n, f) {
		if (this.data) {
			var obj = this.data[n].obj;

			if ( Object.prototype.toString.call(obj) === '[object Array]' ) {
				obj.__onArrange.push([f, this]);
			}
		}
	}

	seeker.element.prototype.getBound = function(d) {
		if (Object.prototype.toString.call(this.data[d][0]) === '[object Array]' ) {
			return this.data[d].obj;
		} else {
			return this.data[d].obj[this.data[d].key];
		}
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

	seeker.element.prototype.on = function(e, f) {
		this.node['on' + e] = f;

		return this;
	}

	seeker.element.prototype.mouseCoord = function(evt) {
		//get mouse position relative to clicked node
		var absCoord = seeker.util.mouseCoord(event);
		var totalOffsetX = 0;
		var totalOffsetY = 0;
		var currentElement = this.node;

		do{
			if (currentElement == document.body) {
				break;
			}

			if (currentElement.translate_x) {
				totalOffsetX += currentElement.translate_x;
	        	totalOffsetY += currentElement.translate_y;
	        } else if (currentElement.getAttribute('x')) {
	        	totalOffsetX += parseInt(currentElement.getAttribute('x'));
	        	totalOffsetY += parseInt(currentElement.getAttribute('y'));
			} else {
				totalOffsetX += parseInt(currentElement.offsetLeft) - parseInt(currentElement.scrollLeft);
	        	totalOffsetY += parseInt(currentElement.offsetTop) - parseInt(currentElement.scrollTop);
			}
	    }
	    while(currentElement = currentElement.parentNode)

	    return [absCoord[0] - totalOffsetX, absCoord[1] - totalOffsetY];
	}

	//d3 functions
	seeker.element.prototype.d3 = function() {
		return d3.select(this.node);
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
			seeker.env_clickTarget;
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

	//scalar binding elements
	seeker.textbox = function() {
		var container = new seeker.element('div')
			.id('textbox');
		
		container.update = function() {
			container
				.html(container.getBound('text'));

			return container;
		}

		container.postBind = function() {
			container
				.onUpdate('text',container.update);
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
			
		var _margin = 4;

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

		container.update = function() {
			label
				.style('top',_margin - 1)
				.style('left',cb.node.offsetWidth + 5 + _margin)
				.update();

			container
				.style('height',cb.node.offsetHeight + _margin * 2)
				.style('width',cb.node.offsetWidth + label.node.offsetWidth + _margin * 2 + 6);

			cb
				.style('top',_margin)
				.style('left',_margin);


			if (container.getBound('checkbox')) {
				container.check();
			} else {
				container.uncheck();
			}

			return container;
		}

		container.node.onclick = function(evt) {
			if (container.getBound('checkbox')) {
				container.set('checkbox',false);
			} else {
				container.set('checkbox',true);
			}
		}

		container.postBind = function() {
			if (this.data.text) {
				label
					.bind({
						'text':{'obj':this.data.text.obj,'key':this.data.text.key}
					})
					.update();

				container
					.onUpdate('text',container.update);
			}

			container
				.onUpdate('checkbox',container.update);
		}

		container.postUnbind = function() {
			label
				.unbind();
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

		container.setText = function(val) {
			label.html(val);

			return container;
		}

		container.setMargin = function(val) {
			_margin = val;
			container.update();

			return container;
		}

		container.setSelection = function(d) {
			_selection = [];

			for ( var i = 0 ; i < d.length ; i++ ) {
				_selection.push({
					'name':d[i],
					'click':function(index) {
					container.set('option',_selection[index].name);
					menu.hide();
				}});
			}

			menu
				.bind({'items':{'obj':_selection}})
				.setLabel('name')
				.setClick('click')
				.update();

			return container;
		}

		container.update = function() {
			menu
				.style('display','block')
				.style('left',-10000);

			label
				.style('top',_margin)
				.style('left',_margin)
				.update();

			var w = label.node.offsetWidth > menu.node.offsetWidth ? label.node.offsetWidth : menu.node.offsetWidth;

			selection
				.style('width',w - 10)
				.style('top',label.node.offsetHeight + 5 + _margin)
				.style('left',_margin)
				.html(container.getBound('option'));

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

		container.postBind = function() {
			label
				.bind({
					'text':{'obj':this.data.text.obj,'key':this.data.text.key}
				})
				.onUpdate('text',container.update);

			return container;
		}

		container.postUnbind = function() {
			label
				.unbind();

			menu
				.unbind();

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

		var _start;
		var _end;

		container.setText = function(val) {
			label.html(val);

			return container;
		}

		container.setInterval = function(s,e) {
			_start = s;
			_end = e;

			return container;
		}

		container.update = function() {
			var spineWidth = parseInt(container.node.style.width) - parseInt(numberBox.node.offsetWidth) - 10;
			var spinePos = (spineWidth - 16) * ((container.getBound('slider') - _start) / (_end - _start));
			var spineLeft = parseInt(numberBox.node.offsetLeft) + parseInt(numberBox.node.offsetWidth) + 10;

			label
				.update();

			spine
				.style('width',spineWidth)
				.style('left',spineLeft)
				.style('top',parseInt(numberBox.node.offsetTop) + (parseInt(numberBox.node.offsetHeight) / 2) - 2);

			marker
				.style('left',spineLeft + 3 + spinePos)
				.style('top',parseInt(numberBox.node.offsetTop) + (parseInt(numberBox.node.offsetHeight) / 2) - 8);

			numberBox.node.value = container.getBound('slider');

			return container;
		}

		container.postBind = function() {
			if (this.data.text) {
				label
					.bind({'text':{'obj':this.data.text.obj,'key':this.data.text.key}})
					.update();

				container
					.onUpdate('text',container.update);
			}

			container
				.onUpdate('slider',container.update);

			return container;
		}

		container.postUnbind = function() {
			label
				.unbind();

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

				container.set('slider',val + _start);

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

			container.set('slider',val + _start);
		}

		numberBox.node.onchange = function() {
			container._data.__set(container._key, this.value);
		}

		return container;
	}


	//collection binding elements
	seeker.menu = function() {
		var list = new seeker.popup('ul')
			.id('menu');

		var _listObjs = [];
		var _labelKey;
		var _clickKey;

		list.setLabel = function(k) {
			_labelKey = k;

			return list;
		}

		list.setClick = function(k) {
			_clickKey = k;

			return list;
		}

		list.update = function() {
			//if length not equal, recreate items
			if (_listObjs.length != this.data.items.length) {
				var addObj = function() {
					var li = new seeker.element('li');
					var label = new seeker.textbox()
						.attachTo(li);

					li.label = label;

					return li;
				}

				var delObj = function(obj) {
					obj
						.detach()
						.unbind();

					obj.label
						.detach()
						.unbind();
				}

				var updateObj = function(obj) {
					obj.label
						.bind({
							'text':{'obj':list.data.items.obj[obj.index],'key':_labelKey}
						})
						.onUpdate('text', list.update);

					obj
						.on('click', function(evt) {
							list.data.items.obj[obj.index][_clickKey](obj.index);
						});
				}

				seeker.util.updateCollection(list.data.items.obj, _listObjs, addObj, delObj, updateObj, list);
			}

			var num = _listObjs.length;
			while ( num-- ) {
				_listObjs[num].label.update();
			}

			return list;
		}

		list.postBind = function() {
			list.onUpdate('items',list.update);

			return list;
		}

		list.postUnbind = function() {

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
		var _update;
		var _delete;
		var _unbind;

		var _listObjs = [];
		var _controlListObjs = [];

		container.setTemplate = function(f) {
			_template = f;

			return container;
		}

		container.setUpdate = function(f) {
			_update = f;

			return container;
		}

		container.setDelete = function(f) {
			_delete = f;

			return container;
		}

		container.setUnbind = function(f) {
			_unbind = f;

			return container;
		}

		container.setControl = function(d, name, click) {
			controlList
				.bind(d);

			var addObj = function() {
				var li = new seeker.element('li');
				var label = new seeker.textbox()
					.attachTo(li);

				li.label = label;

				return li;
			}

			var delObj = function(obj) {
				obj
					.detach();

				obj.label
					.detach()
					.unbind();
			}

			var updateObj = function(obj) {
				obj.label
					.bind({
						'text':{'obj':controlList.data.items.obj[obj.index], 'key':name}
					})
					.update();

				obj
					.on('click', function(evt) {
						controlList.data.items.obj[obj.index][click](obj.index);
					});
			}

			seeker.util.updateCollection(controlList.data.items.obj, _controlListObjs, addObj, delObj, updateObj, controlList);

			return container;
		}

		container.update = function() {
			if(_listObjs.length != this.data.items.obj.length) {
				seeker.util.updateCollection(this.data.items.obj, _listObjs, _template, _delete, _update, list);
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

		container.postBind = function() {

		}

		container.postUnbind = function() {

		}

		controlList
			.attachTo(container);
		list
			.attachTo(container);

		return container;
	}

	//static elements
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