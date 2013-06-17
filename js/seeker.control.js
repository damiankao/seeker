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

	seeker.update = function(d) {
		if (d.__bound__) {
			if (Object.prototype.toString.call(d) === '[object Array]') {
				var u = d.__onUpdate__;
				var l = u.length;
				while ( l-- ) {
					u[l]();
				}
			} else {
				var args = arguments;
				var u = d.__onUpdate__;
				var l = args.length;

				if (args.length > 1) {
					while ( l-- ) {
						if (l != 0) {
							if (u[args[l]]) {
								var a = u[args[l]];
								var i = a.length;
								while ( i-- ) {
									a[i]();
								}
							}
						}
					}
				}
			}
		}
	}

	seeker.base = function(e) {
		e = d3.ns.qualify(e);

    	this.container = d3.select(e.local ? document.createElementNS(e.space, e.local) : document.createElement(e));
    	this.container
    		.on('mousedown',function(evt) {
    			d3.event.preventDefault();
    			d3.event.stopPropagation();
    		})

    	return this;
	}

	seeker.base.prototype.attachTo = function(parent) {
		parent.appendChild(this.container.node());

		return this;
	}

	seeker.base.prototype.whxy = function(w,h,x,y) {
		var c = this.container;
		c
			.style('width',(w != -1) ? w : c.node().style.width)
			.style('height',(h != -1) ? h : c.node().style.height)
			.style('left',(x != -1) ? x : c.node().style.left)
			.style('top',(y != -1) ? y : c.node().style.top);

		return this;
	}

	seeker.base.prototype.bind = function(d, k) {
		this.data = d;
		this.keys = k;

		seeker.util.bindModel(d);

		if (this.postBind) {
			this.postBind();
		}

		return this;
	}

	seeker.base.prototype.set = function(name, val) {
		this.data[this.keys[name]] = val;
		seeker.update(this.data, this.keys[name]);

		return this;
	}

	seeker.base.prototype.id = function(val) {
		this.container.attr('id',val);

		return this;
	}

	seeker.responsiveBase = function(e) {
		var base = new seeker.base(e);

		var arrow = base.container
			.append('div')
			.attr('id','arrow');

		base.arrow = arrow;

		_leftOffsetX = 0;
		_rightOffsetX = 0;
		_topOffsetY = 0;
		_bottomOffsetY = 0;

		base.setOffset = function(leftX, rightX, topY, bottomY) {
			_leftOffsetX = leftX;
			_rightOffsetX = rightX;
			_topOffsetY = topY;
			_bottomOffsetY = bottomY;

			return base;
		}

		base.orient = function(m) {
			if (m == '0') {
				//above cursor
				arrow.style('top',basbase.container.style('height') - 6);
			} else {
				//below cursor
				arrow.style('top',-4);
			}

			return this;
		}

		base.position = function(m) {
			if (m =='0') {
				//left of cursor
				arrow.style('left',basbase.container.style('width') - 10 - arrow.style('width'));
			} else {
				//right of cursor
				arrow.style('left', 10);
			}

			return this;
		}

		base.place = function(coord) {
			//base.show();
			var winDim = seeker.util.winDimensions();
			var w = base.container.style('width');
			var h = base.container.style('height');

			if (coord[1] - h < 10) {
				//near top, make under cursor
				base.orient(1);
				base.container.style('top',coord[1] + 20 - _bottomOffsetY);
			} else if (coord[1] + h > winDim[1] - 30) {
				//near bottom, make above cursor
				base.orient(0);
				base.container.style('top',coord[1] - h - 20 + _topOffsetY);
			} else {
				//default, under cursor
				base.orient(1);
				base.container.style('top',coord[1] + 20 - _bottomOffsetY);
			}

			if (coord[0] - w < 20) {
				//near left, make right of cursor
				base.position(1);
				base.container.style('left', coord[0] + 10 - _rightOffsetX);
			} else if (coord[0] + w > winDim[0] - 20) {
				//near right, make left of cursor
				base.position(0);
				base.container.style('left', coord[0] - w + _leftOffsetX);
			} else {
				//default, right of cursor
				base.position(1);
				base.container.style('left', coord[0] + 10 - _rightOffsetX);
			}

			return this;
		}

		return base;
	}

	seeker.textbox = function() {
		var base = new seeker.base('span')
			.id('textbox');

		var _prepend = '';
		var _append = '';

		base.prependText = function(val) {
			_prepend = val;

			return base;
		}

		base.appendText = function(val) { 
			_append = val;

			return base;
		}
		
		base.update = function() {
			base.container
				.html(_prepend + base.data[base.keys.text] + _append);

			return base;
		}

		base.postBind = function() {
			if (!base.data.__onUpdate__[base.keys.text]) {
				base.data.__onUpdate__[base.keys.text] = [];
			}

			base.data.__onUpdate__[base.keys.text].push(base.update);
		}

		return base;
	}


	seeker.checkbox = function() {
		var base = new seeker.base('div')
			.id('checkbox');

		var cb = base.container
			.append('div');

		var label = new seeker.textbox()
			.attachTo(base.container.node())
			.id('label');

		base.check = function() {
			cb
				.attr('id','cbChecked');

			return base;
		}

		base.uncheck = function() {
			cb
				.attr('id','cb');

			return base;
		}

		base.prependText = function(val) {
			label.prependText(val);

			return base;
		}

		base.appendText = function(val) { 
			label.appendText(val);

			return base;
		}

		base.update = function() {
			if (base.keys.text) {
				label
					.update();
			}

			if (base.data[base.keys.checkbox]) {
				base.check();
			} else {
				base.uncheck();
			}

			return base;
		}

		base.postBind = function() {
			if (this.keys.text) {
				label
					.bind(base.data, {'text':base.keys.text})
					.update();
			}

			if (!base.data.__onUpdate__[base.keys.checkbox]) {
				base.data.__onUpdate__[base.keys.checkbox] = [];
			}

			base.data.__onUpdate__[base.keys.checkbox].push(base.update);
		}

		base.container
			.on('click',function(evt) {
				d3.event.stopPropagation();
				if (base.data[base.keys.checkbox]) {
					base.set('checkbox',false);
				} else {
					base.set('checkbox',true)
				}
			})

		return base;
	}

	seeker.option = function() {
		var base = new seeker.base('div')
		base.container
			.style('position','absolute');

		var innerContainer = new seeker.base('div')
			.attachTo(base.container.node())
			.id('optionBox');

		var menu = new seeker.menu()
			.attachTo(base.container.node())
		menu.container
			.style('background','#38B87C')
			.style('color','white')
			.style('position','absolute')
			.style('visibility','hidden');
		menu.arrow
			.style('background','#38B87C');

		var label = new seeker.textbox()
			.attachTo(innerContainer.container.node())
			.id('label');

		var selection = new seeker.base('div')
			.attachTo(innerContainer.container.node())
			.id('optionSelection');

		var downArrow = new seeker.base('div')
			.attachTo(innerContainer.container.node())
			.id('downArrow');
		downArrow.container
			.style('position','absolute');

		var _selection;
		base.setSelection = function(d) {
			_selection = [];

			for ( var i = 0 ; i < d.length ; i++ ) {
				_selection.push({
					'name':d[i],
					'click':function(index) {
						base.set('option',_selection[index].name);
					}
				});
			}

			menu
				.bind(_selection, {'text':'name','click':'click'})
				.update();

			return base;
		}

		base.update = function() {
			label
				.update();

			var lWidth = parseInt(label.container.style('width'));
			var mWidth = parseInt(menu.container.style('width')) + 8;

			base.container
				.style('width',lWidth > mWidth ? lWidth : mWidth);

			innerContainer.container
				.style('width',lWidth > mWidth ? lWidth : mWidth);

			selection.container
				.html(base.data[base.keys.option]);

			menu.container
				.style('left',4)
				.style('top',parseInt(base.container.style('height')) + 8);

			menu.arrow
				.style('left',parseInt(base.container.style('width')) - 25);

			downArrow.container
				.style('top',parseInt(base.container.style('height')) - 17)
				.style('left',parseInt(base.container.style('width')) - 22);

			return base;
		}

		base.postBind = function() {
			label
				.bind(base.data, {'text':base.keys.text});

			if (!base.data.__onUpdate__[base.keys.option]) {
				base.data.__onUpdate__[base.keys.option] = [];
			}

			base.data.__onUpdate__[base.keys.option].push(base.update);

			return base;
		}

		selection.container
			.on('click',function() {
				d3.event.stopPropagation();

				var m = menu.container;
				if (m.style('visibility') == 'hidden') {
					m.style('visibility','visible')
				} else {
					m.style('visibility','hidden')
				}

			});

		downArrow.container
			.on('click',function() {
				d3.event.stopPropagation();

				var m = menu.container;
				if (m.style('visibility') == 'hidden') {
					m.style('visibility','visible')
				} else {
					m.style('visibility','hidden')
				}

			});

		return base;
	}

	seeker.slider = function() {
		var base = new seeker.base('div')
			.id('slider');
		var numberBox = new seeker.base('input')
			.id('tbox');
		var spine = new seeker.base('div')
			.id('spine');
		var marker = new seeker.base('div')
			.id('marker');
		var label = new seeker.textbox()
			.id('label');

		label.attachTo(base.container.node());
		numberBox.attachTo(base.container.node());
		spine.attachTo(base.container.node());
		marker.attachTo(base.container.node());

		var _start;
		var _end;

		base.setInterval = function(s,e) {
			_start = s;
			_end = e;

			return base;
		}

		base.update = function() {
			var sliderVal = base.data[base.keys.slider];

			if (base.keys.text) {
				label
					.update();
			}

			var spineWidth = parseInt(base.container.node().style.width) - 60;
			var spinePos = (spineWidth - 16) * ((sliderVal - _start) / (_end - _start))
			var spineLeft = 54;

			spine.container
				.style('width',spineWidth);

			marker.container
				.style('left',spineLeft + spinePos)

			numberBox.container.node().value = sliderVal;

			return base;
		}

		base.postBind = function() {
			if (base.keys.text) {
				label
					.bind(base.data, {'text':base.keys.text});
			}

			if (!base.data.__onUpdate__[base.keys.slider]) {
				base.data.__onUpdate__[base.keys.slider] = [];
			}

			base.data.__onUpdate__[base.keys.slider].push(base.update);

			return base;
		}

		base.setText = function(val) {
			label.container
				.html(val);

			return base;
		}

		marker.container
			.on('mousedown', function(evt) {
				d3.event.preventDefault();
				d3.event.stopPropagation();

				d3.select(document.body)
					.on('mousemove', function(evt) {
						var spineWidth = parseInt(base.container.style('width')) - parseInt(numberBox.container.style('width')) - 20;
						var spineLeft = parseInt(numberBox.container.node().offsetLeft) + 49;
						var spinePos = Math.round((_end - _start) * (d3.mouse(base.container.node())[0] - spineLeft) / spineWidth);

						if (spinePos < _start) {
							spinePos = _start;
						}
						if (spinePos > _end) {
							spinePos = _end;
						}

						base.set('slider',spinePos);
					})
					.on('mouseup', function(evt) {
						d3.select(document.body)
							.on('mousemove',null)
							.on('mouseup',null);
					})
			})

		spine.container
			.on('click', function(evt) {
				d3.event.preventDefault();
				d3.event.stopPropagation();

				var spineWidth = parseInt(base.container.style('width')) - parseInt(numberBox.container.style('width')) - 20;
				var spineLeft = parseInt(numberBox.container.node().offsetLeft) + 49;
				var spinePos = Math.round((_end - _start) * (d3.mouse(base.container.node())[0] - spineLeft) / spineWidth);
				
				if (spinePos < _start) {
					spinePos = _start;
				}
				if (spinePos > _end) {
					spinePos = _end;
				}

				base.set('slider',spinePos);
			})

		numberBox.container
			.on('mousedown',null)
			.on('change', function() {
				var val = parseInt(this.value);
				if (val < _start) {
					val = _start;
				}
				if (val > _end) {
					val = _end
				}
				base.set('slider', val);
			});

		base.container
			.on('mousedown',null);


		return base;
	}

	seeker.menu = function() {
		var base = new seeker.responsiveBase('ul')
		base.container
			.attr('id','menu');

		base.data;
		base.keys = {};

		base.postBind = function() {
			var i = base.data.length;
			while ( i-- ) {
				var obj = base.data[i];

				if (!obj.__onUpdate__[base.keys.text]) {
					obj.__onUpdate__[base.keys.text] = [];
				}

				if (!obj.__onUpdate__[base.keys.click]) {
					obj.__onUpdate__[base.keys.click] = [];
				}

				obj.__onUpdate__[base.keys.text].push(base.update);
				obj.__onUpdate__[base.keys.click].push(base.update);
			}

			base.data.__onUpdate__.push(base.update);
		}

		base.update = function() {
			var items = base.data;
			var li = base.container
				.selectAll('li')
				.data(items)

			li
				.enter()
				.append('li');

			li
				.html(function(d) {
					return d[base.keys.text];
				})
				.on('click',function(d, i) {
					d[base.keys.click](i);
				});
					
			li
				.exit()
				.remove();

			return base;
		}

		return base;
	}

	seeker.complexMenu = function() {
		var base = new seeker.responsiveBase('div')
			.id('complexMenu')
		
		base.arrow
			.style('background','#38B87C');

		var list = new seeker.base('ul')
			.id('complexMenuItems');

		var controlList = new seeker.base('ul')
			.id('complexMenuControl');

		var _controlData = [];
		var _controlKeys = {};
		var _template;
		var _remove;

		base.setControl = function(d, keys) {
			_controlData = d;
			_controlKeys = keys;

			var li = controlList.container
				.selectAll('li')
				.data(_controlData);

			li
				.enter()
				.append('li');

			li
				.html(function(d) {
					return d[_controlKeys.text];
				})
				.on('click',function(d, i) {
					d[_controlKeys.click](i);
				});

			li
				.exit()
				.remove();

			return base;

		}

		base.setTemplate = function(f) {
			_template = f;

			return base;
		}

		base.setRemove = function(f) {
			_remove = f;

			return base;
		}

		base.update = function() {
			var li = list.container
				.selectAll('li')
				.data(base.data);

			li
				.enter()
				.append('li')
				.each(function(d,i) {
					_template(this, d, base.keys);
				});
					
			li
				.exit()
				.each(function() {
					_remove(this);
				})
				.remove();

			return base;
		}

		base.postBind = function() {
			var i = base.data.length;
			while ( i-- ) {
				for (name in base.keys) {
					var obj = base.data[i];
					var key = base.keys[name]
					if (!obj.__onUpdate__[key]) {
						obj.__onUpdate__[key] = [];
					}

					obj.__onUpdate__[key].push(base.update);
				}
			}

			base.data.__onUpdate__.push(base.update);
		}

		controlList
			.attachTo(base.container.node());
		list
			.attachTo(base.container.node());

		return base;
	}

	seeker.navBar = function() {
		var container = new seeker.menu()
			.id('navbar');

		container.arrow.hide();

		return container;
	}


	//static elements
	seeker.status = function() {
		var base = new seeker.base('div')
			.id('status');

		var _pos;

		base.setPos = function(f) {
			_pos = f.bind(this)

			return base;
		}

		base.update = function(val) {
			var pos = _pos();

			base.container
				.style('display','table')
				.html(val)
				.style('top',pos[1])
				.style('left',pos[0]);

			return base;
		}

		return base;
	}

	seeker.button = function() {
		var base = new seeker.base('div')
			.id('button');

		var _data = [];

		base.setType = function(m) {
			//std - standard button
			//suc - success button
			//war - warning button
			//inf - info button
			//dan - danger button
			//dis - disabled button
			if (m == 'std') {
				base.container
					.style('background','#313841');
			} else if (m == 'std2') {
				base.container
					.style('background','#7F8C8D');
			} else if (m == 'suc') {
				base.container
					.style('background','#38B87C');
			} else if (m == 'war') {
				base.container
					.style('background','#F1C40F');
			} else if (m == 'inf') {
				base.container
					.style('background','#2980B9');
			} else if (m == 'dan') {
				base.container
					.style('background','#F34541');
			} else if (m == 'dis') {
				base.container
					.style('background','#BDC3AF');
			}

			return base;
		};

		return base;
	}

	seeker.colorpicker = function() {
		var base = new seeker.popup('div')
			.id('colorpicker');
		var slider = new seeker.base('div')
			.attachTo(base)
			.id('colorslider');
		var picker = new seeker.base('div')
			.attachTo(base)
			.id('picker');

		var cp = ColorPicker(slider.node, picker.node,function(){});

		base.setCallback = function(f) {
			cp.callback = f;

			return base;
		}

		return base;
	}

	seeker.blockscreen = function() {
		var base = new seeker.base('div')
			.attachTo(document.body)
			.id('blockscreen');

		return base;
	}
})();