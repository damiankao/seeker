(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	Introduction:
	DOM controls are included in this file. All view elements are inherited from the seeker.element class.

	Data binding:
	Data is bound to these components by specifying the data object and the key of the data. In cases where
	an array is being bound, just the data array is specified. The .bind function is prototyped for every 
	seeker.base wrapped DOM object. This function takes in the object and keys to be bound. 

	Data and keys to be bound are organized into an array with component specific keys. For example, the
	checkbox component expects a 'checkbox' data and key to bind the check/uncheck action to. For this data:

	var dataObj = {'name':'myObject','visible':true};

	We bind to a checkbox by:

	checkbox.bind({'checkbox':dataObj},{'checkbox':'visible'});

	The first argument tells the component what data obj the 'checkbox' is associated with. The second argument
	tells the component which key in the data obj to further associate the value of the check/unchecking action
	to.

	Components:
		base classes:
			base: base element for all controls.
			responsiveBase: arrowed container element that responds intelligently to window edges. 

		scalar binding views:
			textbox: 
				bind({'text':data}, {'text':key})
			checkbox: 
				bind({'text':data, 'checkbox':data}, {'text':key, 'checkbox':key}), text is optional
			slider: 
				setInterval(0,100)
				bind({'text':data, 'slider':data}, {'text':key, 'slider':key}), text is optional
			option: 
				setSelection(['option1','option2','option3']);
				bind({'text':data, 'option':data}, {'text':key, 'option':key}), text is optional

		collection binding views:
			menu: 
			complexMenu: 

		static views:
			colorpicker
			status
			button
	*/

	seeker.update = function(d) {
		if (d.__bound__) {
			if (Object.prototype.toString.call(d) === '[object Array]') {
				var u = d.__onUpdate__;
				var l = u.length;
				while ( l-- ) {
					u[l][0]();
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
									a[i][0]();
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
    		});

    	this.bound = [];

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

	seeker.base.prototype.bind = function(d,k) {
		this.data = d;
		this.keys = k;

		if (this.postBind) {
			this.postBind();
		}

		return this;
	}

	seeker.base.prototype.datum = function(name) {
		return this.data[name][this.keys[name]];
	}

	seeker.base.prototype.unbind = function(d, k) {
		if (this.bound.length > 0) {
			var i = this.bound.length;
			while ( i-- ) {
				var d = this.bound[i][0];

				if (Object.prototype.toString.call(d) === '[object Array]') {
					var updates = d.__onUpdate__;
					var l = updates.length;

					while ( l-- ) {
						if (updates[l][1] === this) {
							updates.splice(l,1);
						}
					}
				} else {
					var key = this.bound[i][1];
					var updates = d.__onUpdate__[key];
					var l = updates.length;

					while ( l-- ) {
						if (updates[l][1] === this) {
							updates.splice(l,1);
						}
					}
				}
			}
		}

		return this;
	}

	seeker.base.prototype.id = function(val) {
		this.container.attr('id',val);

		return this;
	}

	seeker.base.prototype.hide = function() {
		this.container
			.style('visibility','hidden');

		return this;
	}

	seeker.base.prototype.show = function() {
		this.container
			.style('visibility','visible');

		return this;
	}

	seeker.responsiveBase = function(e) {
		var base = new seeker.base(e);

		var arrow = base.container
			.append('div')
			.attr('id','arrow');

		base.arrow = arrow;

		base.leftOffsetX = 0;
		base.rightOffsetX = 0;
		base.topOffsetY = 0;
		base.bottomOffsetY = 0;

		base.setOffset = function(leftX, rightX, topY, bottomY) {
			base.leftOffsetX = leftX;
			base.rightOffsetX = rightX;
			base.topOffsetY = topY;
			base.bottomOffsetY = bottomY;

			return base;
		}

		base.orient = function(m) {
			if (m == '0') {
				//above cursor
				arrow.style('top',base.container.node().offsetHeight - 6);
			} else {
				//below cursor
				arrow.style('top',-4);
			}

			return this;
		}

		base.position = function(m) {
			if (m =='0') {
				//left of cursor
				arrow.style('left',base.container.node().offsetWidth - 10 - arrow.container.node().offsetWidth);
			} else {
				//right of cursor
				arrow.style('left', 10);
			}

			return this;
		}

		base.place = function(coord) {
			//base.show();
			var winDim = seeker.util.winDimensions();
			var w = parseInt(base.container.node().offsetWidth);
			var h = parseInt(base.container.node().offsetHeight);

			if (coord[1] - h < 10) {
				//near top, make under cursor
				base.orient(1);
				base.container.style('top',coord[1] + 20 - base.bottomOffsetY);
			} else if (coord[1] + h > winDim[1] - 30) {
				//near bottom, make above cursor
				base.orient(0);
				base.container.style('top',coord[1] - h - 20 + base.topOffsetY);
			} else {
				//default, under cursor
				base.orient(1);
				base.container.style('top',coord[1] + 20 - base.bottomOffsetY);
			}

			if (coord[0] - w < 20) {
				//near left, make right of cursor
				base.position(1);
				base.container.style('left', coord[0] + 10 - base.rightOffsetX);
			} else if (coord[0] + w > winDim[0] - 20) {
				//near right, make left of cursor
				base.position(0);
				base.container.style('left', coord[0] - w + base.leftOffsetX);
			} else {
				//default, right of cursor
				base.position(1);
				base.container.style('left', coord[0] + 10 - base.rightOffsetX);
			}

			return this;
		}

		if(!seeker.env_closeAll) {
			seeker.env_toClose = [];
			seeker.env_closeAll = function() {
				var i = seeker.env_toClose.length;
				while ( i-- ) {
					seeker.env_toClose[i].hide();
				}
				seeker.env_clickTarget = null;
			}
		}

		seeker.env_toClose.push(base);

		if (!document.body.onclick) {
			document.body.onclick = seeker.env_closeAll;
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
				.html(_prepend + base.datum('text') + _append);

			return base;
		}

		base.postBind = function() {
			seeker.util.addUpdate(base, base.data.text, base.keys.text, base.update);
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

		base.setText = function(val) {
			label.container
				.html(val);

			return base;
		}

		base.update = function() {
			if (base.keys.text) {
				label
					.update();
			}

			if (base.datum('checkbox')) {
				base.check();
			} else {
				base.uncheck();
			}

			return base;
		}

		base.postBind = function() {
			if (this.keys.text) {
				label
					.bind({'text':base.data.text}, {'text':base.keys.text})
					.update();
			}

			seeker.util.addUpdate(base, base.data.checkbox, base.keys.checkbox, base.update);
		}

		base.container
			.on('click',function(evt) {
				d3.event.stopPropagation();
				if (base.datum('checkbox')) {
					seeker.util.set(base.data.checkbox,base.keys.checkbox,false);
				} else {
					seeker.util.set(base.data.checkbox,base.keys.checkbox,true);
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
						seeker.util.set(base.data.option,base.keys.option,_selection[index].name);
					}
				});
			}

			menu
				.bind({'items':_selection}, {'text':'name','click':'click'})
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
				.html(base.datum('option'));

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
				.bind({'text':base.data.text}, {'text':base.keys.text});

			seeker.util.addUpdate(base, base.data.option, base.keys.option, base.update);

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
			var sliderVal = base.datum('slider');

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
					.bind({'text':base.data.text}, {'text':base.keys.text});
			}

			seeker.util.addUpdate(base, base.data.slider, base.keys.slider, base.update);

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

						seeker.util.set(base.data.slider, base.keys.slider, spinePos);
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

				seeker.util.set(base.data.slider, base.keys.slider, spinePos);
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
				
				seeker.util.set(base.data.slider, base.keys.slider, val);
			});

		base.container
			.on('mousedown',null);


		return base;
	}

	seeker.menu = function() {
		var base = new seeker.responsiveBase('ul')
		base.container
			.attr('id','menu');

		base.postBind = function() {
			var i = base.data.items.length;
			while ( i-- ) {
				var obj = base.data.items[i];

				seeker.util.addUpdate(base, obj, base.keys.text, base.update);
				seeker.util.addUpdate(base, obj, base.keys.click, base.update);
			}

			seeker.util.addUpdate(base, base.data.items, null, base.update);
		}

		base.update = function() {
			var items = base.data.items;
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
					d3.event.stopPropagation();
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
				.data(_controlData.items);

			li
				.enter()
				.append('li');

			li
				.html(function(d) {
					return d[_controlKeys.text];
				})
				.on('click',function(d, i) {
					d3.event.stopPropagation();
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
				.data(base.data.items);

			li
				.enter()
				.append('li')
				.each(function(d,i) {
					_template(this, d, i, base.keys);
				});
					
			li
				.exit()
				.each(function() {
					_remove(this);
				})
				.remove();

			return base;
		}

		base.reinit = function() {
			list.container
				.selectAll('li')
				.remove();

			return base;
		}

		base.respondToWindow = function() {
			var dim = seeker.util.winDimensions();

			if (base.container.node().offsetTop + base.container.node().offsetHeight > dim[1] - 20) {
				base.container
					.style('height',dim[1] - 40 - base.container.node().offsetTop);
				list
					.container
					.style('height',dim[1] - 56 - controlList.container.node().offsetHeight - base.container.node().offsetTop);
			}

			return base;
		}

		base.postBind = function() {
			var i = base.data.items.length;
			while ( i-- ) {
				for (name in base.keys) {
					var obj = base.data.items[i];
					var key = base.keys[name]

					seeker.util.addUpdate(base, obj, key, base.update);
				}
			}

			seeker.util.addUpdate(base, base.data.items, null, base.update);
		}

		controlList
			.attachTo(base.container.node());
		list
			.attachTo(base.container.node());

		base.list = list;

		return base;
	}

	seeker.navBar = function() {
		var container = new seeker.menu()
			.id('navbar');

		container.arrow
			.style('display','none');

		var i = seeker.env_toClose.length;
		while ( i-- ) {
			if (seeker.env_toClose[i] === container) {
				seeker.env_toClose.splice(i,1);
				break;
			}
		}
			
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
		var base = new seeker.responsiveBase('div')
			.id('colorpicker');
		var slider = new seeker.base('div')
			.attachTo(base.container.node())
			.id('colorslider');
		var picker = new seeker.base('div')
			.attachTo(base.container.node())
			.id('picker');

		var cp = ColorPicker(slider.container.node(), picker.container.node(),function(){});

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

		base.update = function() {
			var dim = seeker.util.winDimensions();

			base
				.whxy(dim[0],dim[1],0,0);

			return base;
		}

		return base;
	}
})();