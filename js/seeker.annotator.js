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
			'legend_xPos':0,
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
		var _targetData;
		var _palette = ['#F2E479','#622C7A','#2C337A','#2C7A69','#337A2C','#7A5C2C','#9E2121','#A8DEFF','#FC7632','#B3E8A0'];

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
							.style('shape-rendering','crispEdges')
							.attr('x',0)
							.attr('y',0);
						obj
							.append('text')
							.style('font-size','9pt')
							.style('font-family','Arial')
							.attr('baseline-shift','-33%')
							.on('mouseover', function(evt) {
								document.body.style.cursor = 'pointer';
							})
							.on('mouseout', function(evt) {
								document.body.style.cursor = 'default';
							})
							.on('click', function(evt) {
								d3.event.stopPropagation();
								_targetData = d;
								if (seeker.env_clickTarget !== this) {
									seeker.env_closeAll();

									legendMenu
										.place(d3.mouse(document.body))
										.show();

									seeker.env_clickTarget = this;
								} else {
									seeker.env_closeAll();
								}
							});
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

						return 'translate(' + (base.settings.margin + base.settings.legend_xPos + (col * xSpacing)) + ',' + (base.settings.margin + _navBarHeight + (row * ySpacing)) + ')';
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
						.style('shape-rendering','crispEdges');
					obj
						.append('text')
						.attr('id','seq')
						.style('font-family','Arial')
						.style('font-weight','bold')
						.style('font-size','10pt')
						.on('mouseover', function(evt) {
							document.body.style.cursor = 'pointer';
						})
						.on('mouseout', function(evt) {
							document.body.style.cursor = 'default';
						})
						.on('click', function(evt) {
							d3.event.stopPropagation();
							_targetData = d;
							if (seeker.env_clickTarget !== this) {
								seeker.env_closeAll();

								sequenceMenu
									.place(d3.mouse(document.body))
									.show();

								seeker.env_clickTarget = this;
							} else {
								seeker.env_closeAll();
							}
						});
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
							.attr('id','feature')
							.on('mouseover', function(evt) {
								document.body.style.cursor = 'pointer';
								d3.select(this)
									.attr('x1',_scale(d.start) - 4)
									.attr('x2',_scale(d.end) + 4)
									.style('stroke-width',base.settings.feat_width + 4);
							})
							.on('mouseout', function(evt) {
								document.body.style.cursor = 'default';
								d3.select(this)
									.attr('x1',_scale(d.start))
									.attr('x2',_scale(d.end))
									.style('stroke-width',base.settings.feat_width);
							})
							.on('click', function(evt) {
								d3.event.stopPropagation();
								_targetData = d;
								if (seeker.env_clickTarget !== this) {
									seeker.env_closeAll();
									
									featureMenu
										.place(d3.mouse(document.body))
										.show();

									seeker.env_clickTarget = this;
								} else {
									seeker.env_closeAll();
								}
							});
						obj
							.append('text')
							.style('font-size','9pt')
							.style('font-family','Arial')
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
				.style('stroke-width',base.settings.seq_spineWidth)
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
				.style('display',function(d) {
					if (d.show) {
						return 'block';
					} else {
						return 'none';
					}
				})
				.attr('transform',function(d,i) {
					var trans = 'translate(' + startX + ',' + startY +')';
					if (this.style.display == 'block') {
						startY += this.getBBox().height + base.settings.seq_spacing;
					}
					return trans;
				});

			seqGroups
				.exit()
				.remove();

			canvas.container
				.attr('height',startY + base.settings.margin)
				.attr('width',base.settings.margin * 2 + base.settings.seq_maxLength);

			return base;
		}

		base.reinit = function() {
			var all = canvas.container
				.selectAll('g').remove();

			return base;
		}

		base.postBind = function() {
			seeker.util.bindModel(base.settings);

			for (name in base.settings) {
				if (name.lastIndexOf('__',0)) {
					seeker.util.addUpdate(base, base.settings, name, base.update);
				}
			}

			menu_sequences
				.bind(base.data[base.keys.sequences], {'text':'name','cb':'show'})
				.update();

			menu_features
				.bind(base.data[base.keys.features], {'text':'name','cb':'show'})
				.update();

			return base;
		}

		base.hideAllFeature = function(name) {
			var seqs = base.data[base.keys.sequences];
			var i = seqs.length;
			while ( i-- ) {
				var feats = seqs[i].feat;
				var a = feats.length;
				while ( a-- ) {
					if (feats[a].ref.name == name) {
						feats[a].show = false;
					}
				}
			}

			base.update();
		}

		base.showAllFeature = function(name) {
			var seqs = base.data[base.keys.sequences];
			var i = seqs.length;
			while ( i-- ) {
				var feats = seqs[i].feat;
				var a = feats.length;
				while ( a-- ) {
					if (feats[a].ref.name == name) {
						feats[a].show = true;
					}
				}
			}

			base.update();
		}

		base.parseInput = function(data, type) {
			if (type == "hmmscan") {
				var d = {};

				var seqs = {};
				var feats = {};

				var lines = data.split('\n');
				var length = lines.length;
				var featCount = 0;
				for ( var i = 0 ; i < length ; i ++ ) {
					var line = lines[i];
					if (line[0] != '#' && line[0] != '!') {
						var cols = line.split(new RegExp("\\s+"));

						var feature = cols[0];
						var seq = cols[3];
						var seqLen = cols[5]
						var start = cols[17];
						var end = cols[18];

						if (!feats[feature]) {
							feats[feature] = {'name':feature,'color':_palette[featCount],'legend':true,'count':1};
							featCount += 1;
							if (featCount == _palette.length) {
								featCount = 0;
							}
						} else {
							feats[feature].count += 1;
						}

						if (!seqs[seq]) {
							seqs[seq] = {'name':seq,'length':seqLen,'show':true,'seq':-1,'feat':[]};
							seqs[seq].feat.push({'name':feature,'start':start,'end':end,'show':true,'label':true,'ref':feats[feature]})
						} else {
							seqs[seq].feat.push({'name':feature,'start':start,'end':end,'show':true,'label':true,'ref':feats[feature]})
						}
					}	
				}

				d.seq = [];
				d.feat = [];
				for (seq in seqs) {
					d.seq.push(seqs[seq]);
				}

				for (feat in feats) {
					d.feat.push(feats[feat]);
				}

				return d;
			} else if (type == 'tab') {

			}
		}

		//menus
		var navData = [
			{'name':'input','click':function() {
				if (blockscreen_input.container.style('visibility') == 'hidden') {
					blockscreen_input.container.style('visibility', 'visible');
				} else {
					blockscreen_input.container.style('visibility', 'hidden')
				}
			}},
			{'name':'sequences','click':function() {
				d3.event.stopPropagation();
				if (seeker.env_clickTarget !== this) {
					seeker.env_closeAll();
					
					menu_sequences
						.respondToWindow()
						.show();

					seeker.env_clickTarget = this;
				} else {
					seeker.env_closeAll();
				}
			}},
			{'name':'features','click':function() {
				d3.event.stopPropagation();
				if (seeker.env_clickTarget !== this) {
					seeker.env_closeAll();
					
					menu_features
						.respondToWindow()
						.show();

					seeker.env_clickTarget = this;
				} else {
					seeker.env_closeAll();
				}
			}},
			{'name':'options','click':function() {
				if (panel_options.container.style('visibility') == 'hidden') {
					panel_options.container.style('visibility','visible');
				} else {
					panel_options.container.style('visibility','hidden');
				}
			}},
			{'name':'export','click':function() {
				d3.event.stopPropagation();

				if (blockscreen_export.container.style('visibility') == 'hidden') {
					var dim = seeker.util.winDimensions();

					blockscreen_export.container.select('span')
						.style('top', dim[1] * 1/4 - 25)
						.style('left', dim[0] / 2 - 260);


					blockscreen_export.container.select('#button')
						.style('top',dim[1] * 3/4 + 10)
						.style('left',dim[0] / 2 -50);

					blockscreen_export.container
						.style('visibility','visible');

					var html = canvas.container
						.attr("title", "annotations")
						.attr("version", 1.1)
						.attr("xmlns", "http://www.w3.org/2000/svg")
						.node().parentNode.innerHTML;

					blockscreen_export.container.select('#preview')
						.style('width',dim[0] * 4/5)
						.style('height', dim[1] * 1/2)
						.style('top', dim[1] * 1/4)
						.style('left', dim[0] * 1/10)

					blockscreen_export.container.select('img')
						.attr("src", "data:image/svg+xml;base64," + btoa(html))
						.style('width',dim[0] * 4/5)
		        		.style('height','auto');

				} else {
					blockscreen_export.container
						.style('visibility','hidden');
				}
			}},
			{'name':'about','click':function() {
				if (panel_about.container.style('visibility') == "hidden") {
					panel_about.container
						.style('visibility','visible')
						.style('top',dim[1] / 2 - 150)
						.style('left',dim[0] / 2 - 300)
						.style('width',600)
						.style('height',300);
				} else {
					panel_about.container.style('visibility','hidden');
				}
			}}
		];

		var navBar = new seeker.navBar()
			.attachTo(base.container.node())
			.bind(navData, {'text':'name','click':'click'})
			.whxy(-1,-1,50,20)
			.update();

		var sequenceMenuData = [
			{'name':'hide this sequence','click':function() {
				seeker.util.set(_targetData, 'show', false);
				base.update();
				seeker.env_closeAll();
			}},
			{'name':'show all features','click':function() {
				var feats = _targetData.feat;
				var i = feats.length;
				while ( i-- ) {
					feats[i].show = true;
				}
				base.update();
				seeker.env_closeAll();
			}},
			{'name':'hide all features','click':function() {
				var feats = _targetData.feat;
				var i = feats.length;
				while ( i-- ) {
					feats[i].show = false;
				}
				base.update();
				seeker.env_closeAll();
			}}
		];
		var sequenceMenu = new seeker.menu()
			.attachTo(document.body)
			.bind(sequenceMenuData, {'text':'name','click':'click'})
			.update()
			.hide();

		var featureMenuData = [
			{'name':'hide this feature','click':function() {
				_targetData.show = false;
				base.update()
				seeker.env_closeAll();
			}},
			{'name':'hide this label','click':function() {
				_targetData.label = false;
				base.update()
				seeker.env_closeAll();
			}},
			{'name':'show this label','click':function() {
				_targetData.label = true;
				base.update()
				seeker.env_closeAll();
			}},
			{'name':'show all features','click':function() {
				var name = _targetData.ref.name;
				base.showAllFeature(name);
				seeker.env_closeAll();
			}},
			{'name':'hide all features','click':function() {
				var name = _targetData.ref.name;
				base.hideAllFeature(name);
				seeker.env_closeAll();
			}}
		];
		var featureMenu = new seeker.menu()
			.attachTo(document.body)
			.bind(featureMenuData, {'text':'name','click':'click'})
			.update()
			.hide();

		var legendMenuData = [
			{'name':'hide this legend','click':function() {
				_targetData.legend = false;
				base.update()
				seeker.env_closeAll();
			}},
			{'name':'show all features','click':function() {
				var name = _targetData.name;
				base.showAllFeature(name);
				seeker.env_closeAll();
			}},
			{'name':'hide all features','click':function() {
				var name = _targetData.name;
				base.hideAllFeature(name);
				seeker.env_closeAll();
			}}
		];
		var legendMenu = new seeker.menu()
			.attachTo(document.body)
			.bind(legendMenuData, {'text':'name','click':'click'})
			.update()
			.hide();

		var blockscreen_input = new seeker.blockscreen()
			.attachTo(document.body)
			.update()
			.hide();
		blockscreen_input.container
			.on('mousedown',null);

		var button_inputLoad;
		var textarea_input = new seeker.base('textarea')
			.attachTo(blockscreen_input.container.node());
		textarea_input.container
			.style('position','absolute')
			.style('width',dim[0] * 4/5)
			.style('height',dim[1] * 1/2)
			.style('top',100)
			.style('left',dim[0] * 1/10)
			.on('mousedown',null);

		var button_inputValidate = new seeker.button()
			.attachTo(blockscreen_input.container.node())
			.setType('std');
		button_inputValidate.container
			.html('validate')
			.style('top',110 + dim[1] * 1/2)
			.style('left',dim[0] * 1/2 - 100)
			.on('click', function() {
				var parsedData = base.parseInput(textarea_input.container.node().value,'hmmscan');

				base
					.bind(parsedData, {'sequences':'seq','features':'feat'})
					.reinit()
					.update();

				blockscreen_input.hide();
			});

		var button_inputCancel = new seeker.button()
			.attachTo(blockscreen_input.container.node())
			.setType('std');
		button_inputCancel.container
			.html('cancel')
			.style('top',110 + dim[1] * 1/2)
			.style('left',dim[0] * 1/2 - 90)
			.on('click', function() {
				blockscreen_input.hide();
			});

		var div_inputStatus;

		var menu_sequencesControlData = [
			{'name':'show all','click':function() {
				var seqs = base.data[base.keys.sequences];
				var i = seqs.length;
				while ( i-- ) {
					seqs[i].show = true;
				}
				base.update();
			}},
			{'name':'hide all','click':function() {
				var seqs = base.data[base.keys.sequences];
				var i = seqs.length;
				while ( i-- ) {
					seqs[i].show = false;
				}
				base.update();
			}},
		];

		var menu_sequences = new seeker.complexMenu()
			.attachTo(document.body)
		    .setControl(menu_sequencesControlData, {'text':'name','click':'click'})
		    .setTemplate(function(li, data, index, keys) {
				var cbox = new seeker.checkbox()
				.attachTo(li);

				cbox
					.bind(data, {'text':keys.text,'checkbox':keys.cb})
					.prependText((index + 1) + '. ')
					.update();

				seeker.util.addUpdate(cbox, cbox.data, cbox.keys.checkbox, base.update);

				li.checkbox = cbox;

				d3.select(li)
					.on('mouseover', function() {
						_targetData = data.feat;
						submenu_features
							.bind(_targetData, {'text':'name','cb':'show'})
							.update()
							.show();

						var seqMenu = menu_sequences.container.node();
						submenu_features
							.place([seqMenu.offsetLeft + seqMenu.offsetWidth - 5,this.offsetTop - menu_sequences.list.container.node().scrollTop + seqMenu.offsetTop - 10]);
					})
		    })
		    .setRemove(function(obj) {
		      
		    })
		    .whxy(-1,-1,100,57)
		    .hide();

		var submenu_featuresControlData = [
			{'name':'show all','click':function() {
				var i = _targetData.length;

				while ( i-- ) {
					seeker.util.set(_targetData[i], 'show', true);
				}

				base.update();
			}},
			{'name':'hide all','click':function() {
				var i = _targetData.length;

				while ( i-- ) {
					seeker.util.set(_targetData[i], 'show', false);
				}

				base.update();
			}},
		];
		var submenu_features = new seeker.complexMenu()
			.attachTo(document.body)
		    .setControl(submenu_featuresControlData, {'text':'name','click':'click'})
		    .setTemplate(function(li, data, index, keys) {
				var cbox = new seeker.checkbox()
					.attachTo(li);
				cbox
					.bind(data, {'text':keys.text,'checkbox':keys.cb})
					.prependText((index + 1) + '. ')
					.update();

				seeker.util.addUpdate(cbox, cbox.data, cbox.keys.checkbox, base.update)

				li.checkbox = cbox;
		    })
		    .setRemove(function(obj) {
		      
		    })
		    .setOffset(0,0,50,40)
		    .hide();

		submenu_features.arrow
			.style('display','none');

		var menu_featuresControlData = [
			{'name':'show all','click':function() {

				base.update();
			}},
			{'name':'hide all','click':function() {


				base.update();
			}},
		];

		var menu_features = new seeker.complexMenu()
			.attachTo(document.body)
		    .setControl(menu_featuresControlData, {'text':'name','click':'click'})
		    .setTemplate(function(li, data, index, keys) {
				var tbox = new seeker.base('div')
					.attachTo(li);

				tbox.container
					.text(data.name)
					.style('color','white');

				var controlItems = [
					{'name':'show legend','click':function() {
						data.legend = true;
						base.update();
					}},
					{'name':'hide legend','click':function() {
						data.legend = false;
						base.update();
					}},
					{'name':'show all','click':function() {
						base.showAllFeature(data.name);
					}},
					{'name':'hide all','click':function() {
						base.hideAllFeature(data.name);
					}}
				];

				var control = new seeker.base('ul')
					.id('controlList')
					.attachTo(li);

				control.container
					.selectAll('li')
					.data(controlItems)
					.enter()
					.append('li')
					.text(function(d) {
						return d.name;
					})
					.on('click', function(d,i) {
						d.click();
					});
					
				d3.select(li)
					.on('click',function(evt) {
						d3.event.stopPropagation();
					})
					.on('mouseover', function() {
						
					})
		    })
		    .setRemove(function(obj) {
		      
		    })
		    .whxy(-1,-1,185,57)
		    .hide();

		var panel_options = new seeker.base('div')
			.id('panel')
			.attachTo(document.body)
			.hide();

		panel_options.container
			.style('height',dim[1] - 40)
			.style('width', 240)
			.style('top',20)
			.style('left',dim[0] - 270)
			.style('overflow-y','auto');

		var opt_legendShow = new seeker.checkbox()
			.bind(base.settings, {'checkbox':'legend_show'})
			.attachTo(panel_options.container.node())
			.setText('show legend')
			.update();

		var opt_seqNumbered = new seeker.checkbox()
			.bind(base.settings, {'checkbox':'seq_numbered'})
			.attachTo(panel_options.container.node())
			.setText('numbered sequences')
			.update();

		var opt_margin = new seeker.slider()
			.setInterval(0,100)
			.setText('figure margins')
		    .bind(base.settings, {'slider':'margin'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,-1,-1)
		    .update();

		var opt_seqLength = new seeker.slider()
			.setInterval(0,dim[0])
			.setText('maximum sequence width')
		    .bind(base.settings, {'slider':'seq_maxLength'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,-1,-1)
		    .update();

		var opt_legendSpacing = new seeker.slider()
			.setInterval(0,dim[1])
		    .bind(base.settings, {'slider':'legend_spacing'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('spacing under legend')
		    .update();

		var opt_legendWidth = new seeker.slider()
			.setInterval(0,dim[0])
		    .bind(base.settings, {'slider':'legend_width'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('legend width')
		    .update();

		var opt_legendHeight = new seeker.slider()
			.setInterval(0,dim[1])
		    .bind(base.settings, {'slider':'legend_height'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('legend height')
		    .update();

		var opt_legendCols = new seeker.slider()
			.setInterval(0,20)
		    .bind(base.settings, {'slider':'legend_cols'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('legend columns')
		    .update();

		var opt_legendColorSize = new seeker.slider()
			.setInterval(0,200)
		    .bind(base.settings, {'slider':'legend_size'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('legend color box size')
		    .update();

		var opt_legendXPos = new seeker.slider()
			.setInterval(0,dim[0])
		    .bind(base.settings, {'slider':'legend_xPos'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('legend horizontal position')
		    .update();

		var opt_seqSpacing = new seeker.slider()
			.setInterval(5,500)
		    .bind(base.settings, {'slider':'seq_spacing'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('spacing between sequences')
		    .update();

		var opt_spineWidth = new seeker.slider()
			.setInterval(1,50)
		    .bind(base.settings, {'slider':'seq_spineWidth'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('sequence spine width')
		    .update();

		var opt_featWidth = new seeker.slider()
			.setInterval(1,50)
		    .bind(base.settings, {'slider':'feat_width'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('feature width')
		    .update();

		var opt_labelXPos = new seeker.slider()
			.setInterval(0,dim[0])
		    .bind(base.settings, {'slider':'seq_labelxPos'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('sequence label horizontal position')
		    .update();

		var blockscreen_export = new seeker.blockscreen()
			.attachTo(document.body)
			.update()
			.hide();

		blockscreen_export.container
			.append('div')
			.style('position','absolute')
			.style('border','1px solid gray')
			.style('overflow-y','auto')
			.style('overflow-x','hidden')
			.attr('id','preview')
				.append('img');

		blockscreen_export.container
			.append('span')
			.style('position','absolute')
			.style('font-family','Arial')
			.style('font-size','10pt')
			.text('Right click on the below image and select "save as" to save the image as svg to your computer.');

		var button_exportClose = new seeker.button()
			.attachTo(blockscreen_export.container.node())
			.setType('std');
		button_exportClose.container
			.html('close')
			.on('click',function(evt) {
				blockscreen_export.hide();
			});

		var panel_about = new seeker.base('div')
			.id('panel')
			.attachTo(document.body)
			.hide();

		panel_about.container
			.style('opacity',0.90)
			.style('overflow-y','auto')
			.style('overflow-x','hidden')
			.style('padding',10)
			.style('color','white')
			.style('font-family','Arial')
			.style('font-size','10pt')
			.on('mousedown',null)
			.html('TES TEST TEST');

		return base;
	}
})();
