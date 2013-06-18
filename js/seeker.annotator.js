(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	introduction:
	Annotator is used to view annotations on series of sequence. It allows the user to
	input annotation data and manipulate the visualization.

	*/
	seeker.annotator = function() {
		var base = new seeker.base('div')
			.id('annotator');
		var canvasContainer = new seeker.base('div')
			.attachTo(base.container.node());
		var canvas = new seeker.base('svg')
			.attachTo(canvasContainer.container.node());

		var dim = seeker.util.winDimensions();
		base.settings = {
			'margin':50,
			'legend_show':true,
			'legend_width':800,
			'legend_height':70,
			'legend_spacing':30,
			'legend_size':15,
			'legend_cols':5,
			'seq_spacing':40,
			'seq_maxLength':1000,
			'feat_width':10,
			'seq_spineColor':'grey',
			'seq_spineWidth':5,
			'seq_labelxPos':0,
			'seq_numbered':true
		};

		var _scale;
		var _navBarHeight = 20;

		base.update = function() {
			_scale = d3.scale.linear()
			    .domain([0, d3.max(base.data[base.keys.sequences],function(d) {return d['length'];})])
			    .range([0, base.settings.seq_maxLength]);

			if (base.settings.legend_show) {
				var featData = base.data[base.keys.features];
				var legendGroups = canvas.container
					.selectAll('#annotator_legendGroups')
					.data(featData);

				legendGroups
					.enter()
					.append('g')
					.attr('id','annotator_legendGroups')
					.each(function(d,i) {
						var obj = d3.select(this);

						obj
							.append('rect')
							.attr('x',0)
							.attr('y',0);
						obj
							.append('text')
							.attr('baseline-shift','-33%');
					});

				legendGroups
					.select('text')
					.text(function(d) {
						return d.name;
					})
					.attr('x',base.settings.legend_size + 5)
					.attr('y',base.settings.legend_size / 2);

				legendGroups
					.select('rect')
					.attr('width',base.settings.legend_size)
					.attr('height',base.settings.legend_size)
					.attr('fill', function(d) {
						return d.color;
					});

				var visibleCount = 0;
				var a = featData.length;
				while ( a-- ) {
					if (featData[a].legend) {
						visibleCount += 1;
					}
				}

				var count = 0;
				var xSpacing = base.settings.legend_width / base.settings.legend_cols;
				var ySpacing = base.settings.legend_height / Math.ceil(visibleCount / base.settings.legend_cols)

				legendGroups
					.style('display', function(d) {
						if (d.legend) {
							return 'block';
						} else {
							return 'none';
						}
					})
					.attr('transform',function(d,i) {
						var row = Math.floor(count / base.settings.legend_cols);
						var col = count % base.settings.legend_cols;
						if (d.legend) {
							count += 1;
						}

						return 'translate(' + (base.settings.margin + (col * xSpacing)) + ',' + (base.settings.margin + _navBarHeight + (row * ySpacing)) + ')';
					});

				legendGroups
					.exit()
					.remove();
			} else {
				canvas.container
					.selectAll('#annotator_legendGroups')
					.style('display','none');
			}
			//sequences
			var seqGroups = canvas.container
				.selectAll('#annotator_seqGroups')
				.data(base.data[base.keys.sequences]);

			seqGroups
				.enter()
				.append('g')
				.attr('id','annotator_seqGroups')
				.each(function(d, i) {
					var obj = d3.select(this);
					obj
						.append('line')
						.attr('id','spine')
						.style('shape-rendering','crispEdges')
						.style('stroke-width',base.settings.seq_spineWidth);
					obj
						.append('text')
						.attr('id','seq')
						.style('font-weight','bold');
				});

				var feat = seqGroups
					.selectAll('#annotator_featGroups')
					.data(function(d) {
						return d.feat;
					});

				feat
					.enter()
					.append('g')
					.attr('id','annotator_featGroups')
					.each(function(d,i) {
						var obj = d3.select(this);
						obj
							.append('line')
							.style('shape-rendering','crispEdges')
							.attr('id','feature');
						obj
							.append('text')
							.attr('id','feature')
							.attr('text-anchor','middle');
					});

				var levels = [];
				feat
					.style('display',function(d) {
						if (d.show) {
							return 'block';
						} else {
							return 'none';
						}
					})
					.select('text')
					.style('display', function(d) {
						if (d.label) {
							return 'block';
						} else {
							return 'none';
						}
					})
					.text(function(d) {
						return d.ref.name;
					})
					.attr('x',function(d) {
						var length = d.end - d.start + 1;
						return _scale(d.start) + _scale(length) / 2;
					})
					.attr('y', function(d, i) {
						if (i == 0) {
							levels = [];
						}

						var currentStart = this.getBBox().x;
						var currentEnd = currentStart + this.getBBox().width;

						var l = null;
						for (var a = 0; a < levels.length ; a++ ) {
							if (currentStart > levels[a] + 5) {
								l = a;
								levels[a] = currentEnd;
								break;
							}
						}

						if (l == null) {
							levels.push(currentEnd);
							l = levels.length - 1;
						}

						if (l == 0) {
							return 30;
						} else {
							return 35 + (base.settings.feat_width) + (l * 14);
						}
					});

				feat
					.select('line')
					.attr('x1',function(d) {
						return _scale(d.start);
					})
					.attr('y1',function(d) {
						return 35 + base.settings.feat_width / 2;
					})
					.attr('x2',function(d) {
						return _scale(d.end);
					})
					.attr('y2',function(d) {
						return 35 + base.settings.feat_width / 2;
					})
					.style('stroke', function(d) {
						return d.ref.color;
					})
					.style('stroke-width',base.settings.feat_width);

				feat
					.exit()
					.remove();

			seqGroups
				.style('display',function(d) {
					if (d.show) {
						return 'block';
					} else {
						return 'none';
					}
				})
				.select('line')
				.attr('x1',function(d) {
					return 0;
				})
				.attr('y1',function(d) {
					return 35 + base.settings.feat_width / 2;
				})
				.attr('x2',function(d) {
					return _scale(d.length);
				})
				.attr('y2',function(d) {
					return 35 + base.settings.feat_width / 2;
				})
				.style('stroke', function(d) {
					return base.settings.seq_spineColor;
				})

			seqGroups
				.select('text')
				.text(function(d, i) {
					if (base.settings.seq_numbered) {
						return (i + 1) + '. ' + d.name;
					} else {
						return d.name;
					}
				})
				.attr('x',base.settings.seq_labelxPos);

			var startY = base.settings.margin + _navBarHeight;
			if (base.settings.legend_show) {
				startY += base.settings.legend_height + base.settings.legend_spacing;
			}
			var startX = base.settings.margin;
			seqGroups
				.attr('transform',function(d,i) {
					var trans = 'translate(' + startX + ',' + startY +')';
					startY += this.getBBox().height + base.settings.seq_spacing;
					return trans;
				});

			seqGroups
				.exit()
				.remove();

			canvas.container
				.style('height',startY + base.settings.margin);

			return base;
		}

		base.postBind = function() {
			seeker.util.bindModel(base.settings);

			for (name in base.settings) {
				if (name.lastIndexOf('__',0)) {
					seeker.util.addUpdate(base.settings, name, base.update);
				}
			}

			return base;
		}

		base.hideAllFeature = function(name) {

		}

		base.showAllFeature = function(name) {

		}

		//menus
		var navData = [
			{'name':'input','click':function() {

			}},
			{'name':'sequences','click':function() {
				
			}},
			{'name':'features','click':function() {
				
			}},
			{'name':'options','click':function() {
				
			}},
			{'name':'export','click':function() {
				
			}},
			{'name':'about','click':function() {
				
			}}
		];

		var navBar = new seeker.navBar()
			.attachTo(base.container.node())
			.bind(navData, {'text':'name','click':'click'})
			.whxy(-1,-1,50,20)
			.update();

		var _targetData;

		var sequenceMenuData = [];
		var sequenceMenu;

		var featureMenuData = [];
		var featureMenu;

		var legendMenuData = [];
		var legendMenu;

		var blockscreen_input;

		var menu_sequences;

		var submenu_features;

		var menu_features;

		var panel_options

		var blockscreen_export;

		var panel_about;

		return base;
	}

/*
	seeker.annotator = function() {
		var container = new seeker.element('div')
			.id('annotator');
		var canvasContainer = new seeker.element('div')
			.attachTo(container);
		var canvas = new seeker.element('svg',true)
			.style('background','white')
			.attachTo(canvasContainer);

		var dim = seeker.util.winDimensions();

		var _seqObjs = [];
		var _legendObjs = [];

		container.settings = {
			'annotator':container,

			'clickObj':null,

			'seq_scale':null,
			'margin':40,
			'topBarHeight':25,

			'seq_underSpacing':30,
			'legend_underSpacing':50,
			'legend_show':true,
			'legend_xPos':0,
			'legend_width':620,
			'legend_height':40,
			'legend_cols':5,
			'seq_maxLength':1000,
			'legend_colorSize':15,
			'seq_spineWidth':5,
			'seq_spineColor':'#9C9C9C',
			'seq_labelxPos':10,
			'seq_numbered':true,
			'seq_featWidth':10
		};

		container.update = function() {
			container.rescale();
			if(_seqObjs.length != this.data.seqs.obj.length) {
				var addObj = function() {
					var seq = new seeker.annotator_sequence();
					seq.settings = container.settings;
					return seq;
				}

				var deleteObj = function(obj) {
					obj
						.detach()
						.unbind();
				}

				var updateObj = function(obj) {
					var seqData = container.data.seqs.obj[obj.index];

					obj
						.bind({
							'name':{'obj':seqData,'key':'name'},
							'length':{'obj':seqData,'key':'length'},
							'visible':{'obj':seqData,'key':'show'},
							'features':{'obj':seqData.feat}
						})
						.update();
				}

				seeker.util.updateCollection(this.data.seqs.obj, _seqObjs, addObj, deleteObj, updateObj, canvas);
			}

			if (_legendObjs.length != this.data.feats.obj.length) {
				var addObj = function() {
					var legend = new seeker.annotator_legend();
					legend.settings = container.settings;
					return legend;
				}

				var deleteObj = function(obj) {
					obj
						.detach()
						.unbind();
				}

				var updateObj = function(obj) {
					var featData = container.data.feats.obj[obj.index];

					obj
						.bind({
							'name':{'obj':featData,'key':'name'},
							'color':{'obj':featData,'key':'color'},
							'visible':{'obj':featData,'key':'legend'},
						})
						.update();
				}

				seeker.util.updateCollection(this.data.feats.obj, _legendObjs, addObj, deleteObj, updateObj, canvas);
			}

			container.arrangeSequences();
			container.arrangeLegend();

			return container;
		}

		container.rescale = function() {
			container.settings.seq_scale = d3.scale.linear()
			    .domain([0, d3.max(this.data.seqs.obj,function(d) {return d['length'];})])
			    .range([0, container.settings.seq_maxLength]);

			return container;
		}

		container.arrangeSequences = function() {
			//position each sequence element
			var startY = container.settings.margin + container.settings.legend_height + container.settings.legend_underSpacing + container.settings.topBarHeight;
			var startX = container.settings.margin;

			if (!container.settings.legend_show) {
				startY = container.settings.margin + container.settings.topBarHeight;
			}

			for ( var i = 0 ; i < _seqObjs.length ; i++ ) {
				var g = _seqObjs[i];
				var visible = container.data.seqs.obj[g.index]['show']
				if (visible) {
					g.node.translate_x = startX;
					g.node.translate_y = startY;
					g
						.show()
						.attr('transform','translate(' + g.node.translate_x + ',' + g.node.translate_y + ')');
					startY += g.node.getBBox().height + container.settings.seq_underSpacing;
				} else {
					g
						.hide();
				}
			}

			canvas
				.attr('height',startY + container.settings.margin)
				.attr('width', container.node.style.width);

			return container;
		}

		container.arrangeLegend = function() {
			if (container.settings.legend_show) {
				var startX = container.settings.margin + container.settings.legend_xPos;
				var startY = container.settings.margin + container.settings.topBarHeight;
				
				var visible = seeker.util.countArray(container.data.feats.obj,'legend',true);
				var cols = container.settings.legend_cols;
				var rows = Math.ceil(visible / cols);
				var w = container.settings.legend_width / cols;
				var h = container.settings.legend_height / rows;

				var i = 0;
				for ( var r = 0 ;r < rows ; r++ ) {
					for ( var c = 0 ; c < cols ; c++ ) {
						if (i == container.data.feats.obj.length) {
							break;
						}
						if (container.data.feats.obj[i].legend) {
							_legendObjs[i]
								.attr('transform','translate(' + (startX + c * w) + ',' + (startY + r * h) + ')')
								.show();
						} else {
							_legendObjs[i].hide();
							c--;
						}
						i++;
					}
				}
			} else {
				for ( var i = 0 ; i < _legendObjs.length ; i++ ) {
					_legendObjs[i].hide();
				}
			}

			return container;
		}

		container.postBind = function() {
			nav_sequence_menu
				.bind({
					'items':{'obj':container.data.seqs.obj}
				})
				.update();

			nav_feature_menu
				.bind({
					'items':{'obj':container.data.feats.obj}
				})
				.update();

			return container;
		}

		container.postUnbind = function() {

			return container;
		}

//menus
		var featureMenuData = [
			{'name':'show all features','click':function(evt, index){
				evt.stopPropagation();

				var i = container.data.seqs.obj.length;
				var name = container.settings.clickObj.data.start.obj.ref.name;
				while ( i-- ) {
					var feat = container.data.seqs.obj[i].feat;
					var a = feat.length;
					while ( a-- ) {
						if (feat[a]['ref'].name == name) {
							feat[a].__set('show',true);
						}
					}
					feat.__arrange();
				}
				seeker.env_closePopups();
			}},
			{'name':'hide all features','click':function(evt, index){
				evt.stopPropagation();

				var i = container.data.seqs.obj.length;
				var name = container.settings.clickObj.data.start.obj.ref.name;
				while ( i-- ) {
					var feat = container.data.seqs.obj[i].feat;
					var a = feat.length;
					while ( a-- ) {
						if (feat[a]['ref'].name == name) {
							feat[a].__set('show',false);
						}
					}
					feat.__arrange();
				}
				seeker.env_closePopups();
			}},
			{'name':'show this label','click':function(evt, index){
				evt.stopPropagation();

				container.settings.clickObj.set('labeled',true);
				container.settings.clickObj.parent.data.features.obj.__arrange();

				seeker.env_closePopups();
			}},
			{'name':'hide this label','click':function(evt, index){
				evt.stopPropagation();

				container.settings.clickObj.set('labeled',false);
				container.settings.clickObj.parent.data.features.obj.__arrange();

				seeker.env_closePopups();
			}},
			{'name':'hide this feature','click':function(evt, index){
				evt.stopPropagation();

				container.settings.clickObj.set('visible',false);
				container.settings.clickObj.parent.data.features.obj.__arrange();

				seeker.env_closePopups();
			}}
		];
		var sequenceMenuData = [
			{'name':'show all features','click':function(evt, index){
				evt.stopPropagation();

				var feats = container.settings.clickObj.data.features.obj;
				var featLength = feats.length;

				while ( featLength-- ) {
					feats[featLength].__set('show',true);
				}
				feats.__arrange();

				seeker.env_closePopups();
			}},
			{'name':'hide all features','click':function(evt, index){
				evt.stopPropagation();

				var feats = container.settings.clickObj.data.features.obj;
				var featLength = feats.length;
				
				while ( featLength-- ) {
					feats[featLength].__set('show',false);
				}
				feats.__arrange();

				seeker.env_closePopups();
			}},
			{'name':'hide this sequence','click':function(evt, index){
				evt.stopPropagation();

				container.settings.clickObj.set('visible',false);
				container.arrangeSequences();

				seeker.env_closePopups();
			}}
		];
		var legendMenuData = [
			{'name':'show all features','click':function(evt, index){
				evt.stopPropagation();

				var name = container.settings.clickObj.getBound('name');
				var i = container.data.seqs.obj.length;
				while ( i-- ) {
					var feat = container.data.seqs.obj[i].feat;
					var a = feat.length;
					while ( a-- ) {
						if (feat[a]['ref'].name == name) {
							feat[a].__set('show',true);
						}
					}
					feat.__arrange();
				}
				seeker.env_closePopups();
			}},
			{'name':'hide all features','click':function(evt, index){
				evt.stopPropagation();

				var name = container.settings.clickObj.getBound('name');
				var i = container.data.seqs.obj.length;
				while ( i-- ) {
					var feat = container.data.seqs.obj[i].feat;
					var a = feat.length;
					while ( a-- ) {
						if (feat[a]['ref'].name == name) {
							feat[a].__set('show',false);
						}
					}
					feat.__arrange();
				}
				seeker.env_closePopups();
			}},
			{'name':'hide this legend','click':function(evt, index){
				evt.stopPropagation();

				container.settings.clickObj.set('visible',false);
				container.arrangeLegend();

				seeker.env_closePopups();
			}}
		];

		var nav_sequenceControlData = [
			{'name':'show all','click':function(evt) {
				var l = container.data.seqs.obj.length;
				var seqs = container.data.seqs.obj;

				while ( l-- ) {
					seqs[l].__set('show',true);
				}

				container.arrangeSequences();
			}},
			{'name':'hide all','click':function(evt) {
				var l = container.data.seqs.obj.length;
				var seqs = container.data.seqs.obj;

				while ( l-- ) {
					seqs[l].__set('show',false);
				}

				container.arrangeSequences();
			}}
		];

		var nav_sequenceFeatureControlData = [
			{'name':'show all','click':function(evt) {

			}},
			{'name':'hide all','click':function(evt) {

			}}
		];

		var nav_featureControlData = [
			{'name':'show all','click':function(evt) {

			}},
			{'name':'hide all','click':function(evt) {

			}}
		];

		var featureMenu = new seeker.menu()
			.attachTo(document.body)
		    .bind({
		      'items':{'obj':featureMenuData}
		    })
		    .setLabel('name')
		    .setClick('click')
		    .update()
		    .offscreen();

		var sequenceMenu = new seeker.menu()
			.attachTo(document.body)
		    .bind({
		      'items':{'obj':sequenceMenuData}
		    })
		    .setLabel('name')
		    .setClick('click')
		    .update()
		    .offscreen();

		var legendMenu = new seeker.menu()
			.attachTo(document.body)
		    .bind({
		      'items':{'obj':legendMenuData}
		    })
		    .setLabel('name')
		    .setClick('click')
		    .update()
		    .offscreen();

		var legendColorPicker = new seeker.colorpicker()
			.attachTo(document.body)
			.offscreen();

		var nav_input;
		var nav_sequence_menu = new seeker.complexMenu()
			.attachTo(document.body)
			.setControl({
				'items':{'obj':nav_sequenceControlData}
				},'name','click')
			.setTemplate(function(index) {
				var li = new seeker.element('li');
				li.d3()
					.on('click', function(evt) {
						d3.event.stopPropagation();
						container.arrangeSequences();
					})
					.on('mouseover', function(evt){
						container.settings.clickObj = li.checkbox.data.text.obj;
						var d = container.settings.clickObj.feat;

						var coord = seeker.util.mouseCoord(evt);
						var rel_coord = d3.mouse(li.node);

						nav_sequence_submenu
							.bind({'items':{'obj':d}})
							.setOffset(0,0,45,15)
							.place([parseInt(nav_sequence_menu.node.style.left) + parseInt(nav_sequence_menu.node.offsetWidth),coord[1] - rel_coord[1]])
							.update();
					});

				var cbox = new seeker.checkbox()
					.style('margin','0px')
					.attachTo(li);

				li.checkbox = cbox;

				return li;
			})
			.setDelete(function(obj) {
				obj.checkbox
				.detach()
				.unbind();

				obj
				.detach()
				.unbind();
			})
			.setUpdate(function(obj, d) {
				obj.checkbox
				.bind({
				  'text':{'obj':d,'key':'name'},
				  'checkbox':{'obj':d,'key':'show'}
				})
				.prependText((obj.index + 1) + '. ')
				.update();
			})
			.setUnbind(function(obj) {
				obj.checkbox.unbind();
			})
			.on('click', function(evt) {
				evt.stopPropagation();
			})
			.offscreen();

		var nav_sequence_submenu = new seeker.complexMenu()
			.attachTo(document.body)
			.setControl({
				'items':{'obj':nav_sequenceFeatureControlData}
				},'name','click')
			.setTemplate(function() {
				var li = new seeker.element('li')
					.on('click', function(evt) {
						evt.stopPropagation();
						container.arrangeSequences();
					})
					.on('mouseover', function(evt){
						
					});

				var cbox = new seeker.checkbox()
					.style('margin','0px')
					.attachTo(li);

				li.checkbox = cbox;

				return li;
			})
			.setDelete(function(obj) {
				obj.checkbox
				.detach()
				.unbind();

				obj
				.detach()
				.unbind();
			})
			.setUpdate(function(obj, d) {
				obj.checkbox
				.bind({
				  'text':{'obj':d.ref,'key':'name'},
				  'checkbox':{'obj':d,'key':'show'}
				})
				.update();
			})
			.offscreen();

		nav_sequence_submenu
			.arrow.hide();

		var nav_feature_menu = new seeker.complexMenu()
			.attachTo(document.body)
			.setControl({
				'items':{'obj':nav_featureControlData}
				},'name','click')
			.setTemplate(function(index) {
				var li = new seeker.element('li')
					.style('text-align','left')
					.on('click', function(evt) {
						evt.stopPropagation();
						container.arrangeSequences();
					});

				var label = new seeker.textbox()
					.style('color','white')
					.style('display','inline-block')
					.style('margin','0px 10px 0px 0px ')
					.attachTo(li);

				var showButton = new seeker.button()
					.style('display','inline-block')
					.style('padding','2px 7px 2px 7px')
					.style('font-size','9pt')
					.style('margin','0px 0px 0px 5px')
					.style('float','right')
					.setType('std2')
					.html('show all')
					.attachTo(li);

				var hideButton = new seeker.button()
					.style('display','inline-block')
					.style('padding','2px 7px 2px 7px')
					.style('font-size','9pt')
					.style('margin','0px 0px 0px 5px')
					.style('float','right')
					.setType('std2')
					.html('hide all')
					.attachTo(li);

				li.label = label;
				li.showButton = showButton;
				li.hideButton = hideButton;

				return li;
			})
			.setDelete(function(obj) {
				obj
				.detach()
				.unbind();
			})
			.setUpdate(function(obj, d) {
				var name = d.name;

				obj.label
					.bind({
						'text':{'obj':d,'key':'name'}
					})
					.update();

				obj.showButton.node.onclick = function(evt) {
					var i = container.data.seqs.obj.length;
					while ( i-- ) {
						var feat = container.data.seqs.obj[i].feat;
						var a = feat.length;
						while ( a-- ) {
							if (feat[a]['ref'].name == name) {
								feat[a].__set('show',true);
							}
						}
						feat.__arrange();
					}
				}

				obj.hideButton.node.onclick = function(evt) {
					var i = container.data.seqs.obj.length;
					while ( i-- ) {
						var feat = container.data.seqs.obj[i].feat;
						var a = feat.length;
						while ( a-- ) {
							if (feat[a]['ref'].name == name) {
								feat[a].__set('show',false);
							}
						}
						feat.__arrange();
					}
				}
			})
			.setUnbind(function(obj) {
				obj.checkbox.unbind();
			})
			.on('click', function(evt) {
				evt.stopPropagation();
			})
			.offscreen();

		var nav_selection;
		var nav_option;

		var nav_barData = [
			{'name':'input','click':function() {}},
			{'name':'sequences','click':function(evt) {
				evt.stopPropagation();
				if (seeker.env_clickTarget !== this) {
					seeker.env_closePopups();

					nav_sequence_menu
						.whxy(-1, -1, 100, nav_bar.node.offsetTop + nav_bar.node.offsetHeight + 15);

					seeker.env_clickTarget = this;
				} else {
					console.log(nav_sequence_menu.node.offsetHeight);
					seeker.env_closePopups();
				}
			}},
			{'name':'features','click':function(evt) {
				evt.stopPropagation();
				if (seeker.env_clickTarget !== this) {
					seeker.env_closePopups();

					nav_feature_menu
						.whxy(-1, -1, 200, nav_bar.node.offsetTop + nav_bar.node.offsetHeight + 15)
						.update();

					seeker.env_clickTarget = this;
				} else {
					seeker.env_closePopups();
				}
			}},
			{'name':'options','click':function(evt) {
				evt.stopPropagation();
				if (seeker.env_clickTarget !== this) {
					seeker.env_closePopups();

					blockscreen_option
						.style('overflow-y','auto')
						.style('width',305)
						.style('height',dim[1])
						.style('left',dim[0] - 305);

					seeker.env_clickTarget = this;
				} else {
					seeker.env_closePopups();
				}
			}},
			{'name':'export','click':function(evt) {
				evt.stopPropagation();
				if (seeker.env_clickTarget !== this) {
					seeker.env_closePopups();

					var dim = seeker.util.winDimensions();

					if (div_preview.img) {
						div_preview.img.detach();
					}

					label_preview
						.style('top', dim[1] * 1/4 - 25)
						.style('left', dim[0] / 2 - 200);

					button_preview
						.style('top',dim[1] * 3/4 + 10)
						.style('left',dim[0] / 2 - button_preview.node.offsetWidth / 2);

					div_preview
						.style('width',dim[0] * 4/5)
						.style('height', dim[1] * 1/2)
						.style('top', dim[1] * 1/4)
						.style('left', dim[0] * 1/10);

					var html = canvas
						.attr("title", "annotations")
						.attr("version", 1.1)
						.attr("xmlns", "http://www.w3.org/2000/svg")
						.node.parentNode.innerHTML;

					var img = new seeker.element('img')
						.attachTo(div_preview)
						.attr("src", "data:image/svg+xml;base64," + btoa(html))
				        .style('width',dim[0] * 4/5)
				        .style('height','auto');

				    div_preview.img = img;

					blockscreen_preview
						.whxy(dim[0],dim[1],0,0);

					seeker.env_clickTarget = this;
				} else {
					seeker.env_closePopups();
				}
			}},
			{'name':'help','click':function() {}}
		];

		var nav_bar = new seeker.navBar()
			.attachTo(container)
			.bind({
		 		'items':{'obj':nav_barData}
			})
			.setLabel('name')
			.setClick('click')
			.whxy(-1,-1,container.settings.margin,10)
			.style('position','fixed')
			.update();

		nav_sequence_menu
			.whxy(-1, -1, 100, nav_bar.node.offsetTop + nav_bar.node.offsetHeight + 15)
			.offscreen();

		var blockscreen_preview = new seeker.blockscreen()
			.offscreen();
		seeker.env_popups.push(blockscreen_preview);
		var div_preview = new seeker.element('div')
			.attachTo(blockscreen_preview)
			.style('position','absolute')
			.style('overflow-x','hidden')
			.style('overflow-y','auto')
			.style('background','white')
			.style('border','1px solid grey');
		var label_preview = new seeker.element('div')
			.style('position','absolute')
			.style('font-family','Arial')
			.style('font-size','11pt')
			.attachTo(blockscreen_preview)
			.html('right click on below image and save as to download as a SVG image.');
		var button_preview = new seeker.button()
			.attachTo(blockscreen_preview)
			.setType('std')
			.html('close')
			.on('click', function(evt) {
				blockscreen_preview.offscreen();
			});

		var blockscreen_input = new seeker.blockscreen()
			.offscreen()

		var blockscreen_option = new seeker.blockscreen()
			.style('border-left','1px solid #313841')
			.on('click',function(e) {e.stopPropagation()})
			.offscreen();
		seeker.env_popups.push(blockscreen_option);

		var opt_legendShow = new seeker.checkbox()
			.bind({
				'checkbox':{'obj':container.settings,'key':'legend_show'}
			})
			.attachTo(blockscreen_option)
			.setText('show legend')
			.update()
			.whxy(-1,-1,0,0)
			.onUpdate('checkbox',container.arrangeSequences)
			.onUpdate('checkbox',container.arrangeLegend);

		var opt_seqNumbered = new seeker.checkbox()
			.bind({
				'checkbox':{'obj':container.settings,'key':'seq_numbered'}
			})
			.attachTo(blockscreen_option)
			.setText('numbered sequences')
			.update()
			.whxy(-1,-1,0,0);

		var opt_spineColor;

		var opt_margin = new seeker.slider()
			.setInterval(5,150)
		    .bind({
		      'slider':{'obj':container.settings,'key':'margin'}
		    })
		    .attachTo(blockscreen_option)
		    .whxy(250,-1,0,0)
		    .setText('margins')
		    .update()
		    .onUpdate('slider',container.arrangeSequences);

		var opt_seqLength = new seeker.slider()
			.setInterval(5,dim[0])
		    .bind({
		      'slider':{'obj':container.settings,'key':'seq_maxLength'}
		    })
		    .attachTo(blockscreen_option)
		    .whxy(250,-1,0,0)
		    .setText('maximum sequence width')
		    .update();

		var opt_legendSpacing = new seeker.slider()
			.setInterval(0,dim[1])
		    .bind({
		    	'slider':{'obj':container.settings,'key':'legend_underSpacing'}
		    })
		    .attachTo(blockscreen_option)
		    .whxy(250,-1,0,0)
		    .setText('spacing under legend')
		    .update()
		    .onUpdate('slider',container.arrangeSequences);

		var opt_legendWidth = new seeker.slider()
			.setInterval(0,dim[0])
		    .bind({
		    	'slider':{'obj':container.settings,'key':'legend_width'}
		    })
		    .attachTo(blockscreen_option)
		    .whxy(250,-1,0,0)
		    .setText('legend width')
		    .update()
		    .onUpdate('slider',container.arrangeLegend);

		var opt_legendHeight = new seeker.slider()
			.setInterval(0,dim[1])
		    .bind({
				'slider':{'obj':container.settings,'key':'legend_height'}
		    })
		    .attachTo(blockscreen_option)
		    .whxy(250,-1,0,0)
		    .setText('legend height')
		    .update()
		    .onUpdate('slider',container.arrangeSequences)
		    .onUpdate('slider',container.arrangeLegend);

		var opt_legendCols = new seeker.slider()
			.setInterval(0,20)
		    .bind({
		      'slider':{'obj':container.settings,'key':'legend_cols'}
		    })
		    .attachTo(blockscreen_option)
		    .whxy(250,-1,0,0)
		    .setText('legend columns')
		    .update()
		    .onUpdate('slider',container.arrangeLegend);

		var opt_legendColorSize = new seeker.slider()
			.setInterval(0,200)
		    .bind({
		      'slider':{'obj':container.settings,'key':'legend_colorSize'}
		    })
		    .attachTo(blockscreen_option)
		    .whxy(250,-1,0,0)
		    .setText('legend color box size')
		    .update();

		var opt_legendXPos = new seeker.slider()
			.setInterval(0,dim[0])
		    .bind({
		      'slider':{'obj':container.settings,'key':'legend_xPos'}
		    })
		    .attachTo(blockscreen_option)
		    .whxy(250,-1,0,0)
		    .setText('legend horizontal position')
		    .update()
		    .onUpdate('slider',container.arrangeLegend);

		var opt_seqSpacing = new seeker.slider()
			.setInterval(5,500)
		    .bind({
		      'slider':{'obj':container.settings,'key':'seq_underSpacing'}
		    })
		    .attachTo(blockscreen_option)
		    .whxy(250,-1,0,0)
		    .setText('spacing between sequences')
		    .update()
		    .onUpdate('slider',container.arrangeSequences);

		var opt_spineWidth = new seeker.slider()
			.setInterval(1,50)
		    .bind({
		      'slider':{'obj':container.settings,'key':'seq_spineWidth'}
		    })
		    .attachTo(blockscreen_option)
		    .whxy(250,-1,0,0)
		    .setText('sequence spine width')
		    .update();

		var opt_featWidth = new seeker.slider()
			.setInterval(1,50)
		    .bind({
		      'slider':{'obj':container.settings,'key':'seq_featWidth'}
		    })
		    .attachTo(blockscreen_option)
		    .whxy(250,-1,0,0)
		    .setText('feature width')
		    .update();

		var opt_labelXPos = new seeker.slider()
			.setInterval(0,dim[0])
		    .bind({
		      'slider':{'obj':container.settings,'key':'seq_labelxPos'}
		    })
		    .attachTo(blockscreen_option)
		    .whxy(250,-1,0,0)
		    .setText('sequence label horizontal position')
		    .update();

		container.settings.featureMenu = featureMenu;
		container.settings.sequenceMenu = sequenceMenu;
		container.settings.legendMenu = legendMenu;
		container.settings.legendPicker = legendColorPicker;

		return container;
	}

	seeker.annotator_sequence = function() {
		var container = new seeker.element('g',true);
		var label = new seeker.element('text',true)
			.attachTo(container)
			.on('mouseover', function(evt) {
				document.body.style.cursor = 'pointer';
			})
			.on('mouseout', function(evt) {
				document.body.style.cursor = 'default';
			})
			.on('click', function(evt) {
				evt.stopPropagation();
				container.settings.clickObj = container;

				if (seeker.env_clickTarget !== this) {
					seeker.env_closePopups();

					container.settings.sequenceMenu
						.place(seeker.util.mouseCoord(evt));

					seeker.env_clickTarget = this;
				} else {
					seeker.env_closePopups();
				}
			});

		var spine = new seeker.element('line',true)
			.attachTo(container)
			.style('shape-rendering','crispEdges');

		var _featureObjs = [];

		container.update = function() {
			if(_featureObjs.length != container.data.features.obj.length) {
				var addObj = function() {
					var feat = new seeker.annotator_feature();
					feat.settings = container.settings;
					feat.parent = container;
					return feat;
				}

				var deleteObj = function(obj) {
					obj
						.detach()
						.unbind();
				}

				var updateObj = function(obj) {
					var featData = container.data.features.obj[obj.index];

					obj
						.bind({
							'name':{'obj':featData.ref,'key':'name'},
							'color':{'obj':featData.ref,'key':'color'},
							'start':{'obj':featData,'key':'start'},
							'end':{'obj':featData,'key':'end'},
							'visible':{'obj':featData,'key':'show'},
							'labeled':{'obj':featData,'key':'label'}
						})
						.update();
				}

				seeker.util.updateCollection(container.data.features.obj, _featureObjs, addObj, deleteObj, updateObj, container);
			}

			container.updateSpine()
			container.updateLabel();
			container.arrangeLabels();
			return container;
		}

		container.arrangeLabels = function() {
			//arrange labels for this sequence
			var levels = [];
			var xPos = 0;
			for ( var i = 0 ; i < _featureObjs.length ; i++ ) {
				var g = _featureObjs[i];
				var d = container.data.features.obj[g.index]
				if (d.show) {
					if (d.label) {
						var labelEnd = g.getLabelEndpoint();
						var labelStart = g.getLabelStartpoint();

						var oriented = false;

						for ( var a = 0; a < levels.length ; a++ ) {
							if (labelStart > levels[a][1] + 2) {
								levels[a] = [a, labelEnd];
								g
									.setLevel(a)
									.update();

								oriented = true;
								break;
							}
						}

						if (!oriented) {
							levels.push([levels.length, labelEnd]);
							g
								.setLevel(levels.length - 1)
								.update();
						}
					}
				} else {
					g
						.hide();
				}
			}
		}

		container.updateSpine = function() {
			//update label and spine
			container.settings.annotator.rescale();
			var length = container.getBound('length');

			spine
				.draw(0,40, container.settings.seq_scale(length),40)
				.style('stroke-width',container.settings.seq_spineWidth)
				.style('stroke',container.settings.seq_spineColor);

			return container;
		}

		container.updateLabel = function() {
			var name = container.getBound('name');

			label
				.attr('x',container.settings.seq_labelxPos)
				.attr('y',0)
				.style('font-size','10pt')
				.style('font-weight','bold');

			if (container.settings.seq_numbered) {
				label
					.text((container.index + 1) + '. ' + name);
			} else {
				label
					.text(name);
			}

			return container;
		}

		container.postBind = function() {
			container
				.onArrange('features',container.arrangeLabels);

			container.settings
				.__onUpdate['seq_spineWidth'].push([container.updateSpine, container]);

			container.settings
				.__onUpdate['seq_labelxPos'].push([container.updateLabel, container]);

			container.settings
				.__onUpdate['seq_numbered'].push([container.updateLabel, container]);

			container.settings
				.__onUpdate['seq_maxLength'].push([container.updateSpine, container]);

			return container;
		}

		container.postUnbind = function() {

			return container;
		}

		return container;
	}

	seeker.annotator_feature = function() {
		var container = new seeker.element('g',true);

		var label = new seeker.element('text',true)
			.attachTo(container)
			.on('mouseover', function(evt) {
				document.body.style.cursor = 'move';
			})
			.on('mouseout', function(evt) {
				document.body.style.cursor = 'default';
			})
			.on('mousedown', function(evt) {
				evt.preventDefault()
				var downCoord = label.mouseCoord(evt);

				document.body.onmousemove = function(evt) {
					var currentCoord = container.mouseCoord(evt);

					label
						.attr('x',currentCoord[0] - downCoord[0])
						.attr('y',currentCoord[1] - downCoord[1]);
				}

				document.body.onmouseup = function(evt) {
					document.body.onmousemove = null;
					document.body.onmouseup = null;
				}
			});

		var feat = new seeker.element('line',true)
			.attachTo(container)
			.style('shape-rendering','crispEdges')
			.on('mouseover', function(evt) {
				document.body.style.cursor = 'pointer';
				var start = container.settings.seq_scale(container.getBound('start')) - 3;
				var end = container.settings.seq_scale(container.getBound('end')) + 3;

				feat
					.draw(start,40,end,40)
					.style('stroke-width',container.settings.seq_featWidth + 3);
			})
			.on('mouseout', function(evt) {
				document.body.style.cursor = 'default';
				var start = container.settings.seq_scale(container.getBound('start'));
				var end = container.settings.seq_scale(container.getBound('end'));

				feat
					.draw(start,40,end,40)
					.style('stroke-width',container.settings.seq_featWidth);
			})
			.on('click', function(evt) {
				evt.stopPropagation();
				container.settings.clickObj = container;

				if (seeker.env_clickTarget !== this) {
					seeker.env_closePopups();

					container.settings.featureMenu
						.place(seeker.util.mouseCoord(evt));

					seeker.env_clickTarget = this;
				} else {
					seeker.env_closePopups();
				}
			});

		var _labelLevel = 0;

		container.update = function() {
			var name = container.getBound('name');
			var start = container.settings.seq_scale(container.getBound('start'));
			var end = container.settings.seq_scale(container.getBound('end'));
			var visible = container.getBound('visible');
			var labeled = container.getBound('labeled');
			var color = container.getBound('color');

			if (visible) {
				container
					.show();

				feat
					.draw(start,40,end,40)
					.style('stroke-width',container.settings.seq_featWidth)
					.style('stroke',color);

				if (labeled) {
					label
						.text(name)
						.attr('x',start + (end - start) / 2 - parseInt(label.node.getBBox().width) / 2)
						.style('font-size','8pt')
						.show();

					if (_labelLevel == 0) {
						label
							.attr('y',27);
					} else {
						var startY = 40 + container.settings.seq_featWidth / 2;
						label
							.attr('y',_labelLevel * 15 + startY);
					}

				} else {
					label.hide();
				}
			} else {
				container.hide();
			}

			return container;
		}

		container.updateColor = function() {
			var color = container.getBound('color');

			feat
				.style('stroke',color);

			return container;
		}

		container.updateFeatWidth = function() {
			feat
				.style('stroke-width',container.settings.seq_featWidth);

			return container;
		}

		container.updateSeqWidth = function() {
			var start = container.settings.seq_scale(container.getBound('start'));
			var end = container.settings.seq_scale(container.getBound('end'));

			feat
				.draw(start,40,end,40);

			label
				.attr('x',start + (end - start) / 2 - parseInt(label.node.getBBox().width) / 2);

			return container;
		}

		container.setLevel = function(l) {
			_labelLevel = l;

			return container;
		}

		container.postBind = function() {
			container
				.onUpdate('visible',container.update)
				.onUpdate('labeled',container.update)
				.onUpdate('color',container.updateColor);

			container.settings
				.__onUpdate['seq_featWidth'].push([container.updateFeatWidth,container]);


			container.settings
				.__onUpdate['seq_maxLength'].push([container.updateSeqWidth, container]);

			return container;
		}

		container.postUnbind = function() {

			return container;
		}

		container.getLabelStartpoint = function() {
			return parseInt(label.node.getBBox().x);
		}

		container.getLabelEndpoint = function() {
			return parseInt(label.node.getBBox().x) + parseInt(label.node.getBBox().width);
		}

		return container;
	}

	seeker.annotator_legend = function() {
		var container = new seeker.element('g',true);
		var color = new seeker.element('rect',true)
			.attachTo(container);
		var label = new seeker.element('text',true)
			.attachTo(container)
			.on('mouseover', function(evt) {
				document.body.style.cursor = 'pointer';
			})
			.on('mouseout', function(evt) {
				document.body.style.cursor = 'default';
			})
			.on('click', function(evt) {
				evt.stopPropagation();
				container.settings.clickObj = container;

				if (seeker.env_clickTarget !== this) {
					seeker.env_closePopups();

					container.settings.legendMenu
						.place(seeker.util.mouseCoord(evt));

					seeker.env_clickTarget = this;
				} else {
					seeker.env_closePopups();
				}
			});

		container.update = function() {
			color
				.attr('width',container.settings.legend_colorSize)
				.attr('height',container.settings.legend_colorSize)
				.attr('x',0)
				.attr('y',0)
				.attr('fill',container.getBound('color'))
				.on('mouseover', function(evt) {
					document.body.style.cursor = 'pointer';
				})
				.on('mouseout', function(evt) {
					document.body.style.cursor = 'default';
				})
				.on('click', function(evt) {
					evt.stopPropagation();
					container.settings.clickObj = container;

					if (seeker.env_clickTarget !== this) {
						seeker.env_closePopups();

						container.settings.legendPicker
							.place(seeker.util.mouseCoord(evt))
							.setCallback(function(hex) {
								container.set('color',hex);
							});

						seeker.env_clickTarget = this;
					} else {
						seeker.env_closePopups();
					}
				});

			label
				.attr('x',container.settings.legend_colorSize + 5)
				.attr('y', container.settings.legend_colorSize / 2)
				.style('font-size','10pt')
				.attr('baseline-shift','-33%')
				.text(container.getBound('name'));

			return container;
		}

		container.postBind = function() {
			container
				.onUpdate('color',container.update);

			container.settings
				.__onUpdate['legend_colorSize'].push([container.update, container])

			return container;
		}

		container.postUnbind = function() {

			return container;
		}

		return container;
	}
	*/
})();
