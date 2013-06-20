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
			    .domain([0, d3.max(base.datum('sequences'),function(d) {return d['length'];})])
			    .range([0, base.settings.seq_maxLength]);

			if (base.settings.legend_show) {
				var featData = base.datum('features');
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
							.attr('y',0)
							.on('mouseover', function() {
								document.body.style.cursor = 'pointer';
							})
							.on('mouseout', function() {
								document.body.style.cursor = 'default';
							})
							.on('click', function() {
								d3.event.stopPropagation();
								colorpicker
									.setCallback(function(hex) {
										seeker.util.set(d,'color',hex);
										base.update();
									})
									.show()
									.place(d3.mouse(canvas.container.node()));
							});
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
				.data(base.datum('sequences'));

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
					})
					.on('mouseover', function() {
						document.body.style.cursor = 'move';
					})
					.on('mouseout', function() {
						document.body.style.cursor = 'default';
					})
					.on('mousedown', function() {
						var label = this;
						d3.select(document.body)
							.on('mousemove', function() {
								var coord = d3.mouse(label);
								d3.select(label)
									.attr('x',coord[0])
									.attr('y',coord[1]);

							})

						d3.select(document.body)
							.on('mouseup', function() {
								d3.select(document.body)
									.on('mousemove',null)
									.on('mouseup',null);
							})
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
			base.unbind();

			canvas.container
				.selectAll('g').remove();

			menu_sequences
				.reinit();

			submenu_features
				.reinit();

			menu_features
				.reinit();

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
				.bind({'items':base.datum('sequences')}, {'text':'name','cb':'show'})
				.update();

			menu_features
				.bind({'items':base.datum('features')}, {'text':'name','cb':'show'})
				.update();

			return base;
		}

		base.hideAllFeature = function(name) {
			var seqs = base.datum('sequences');
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
			var seqs = base.datum('sequences');
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

		base.parseInput = function(data) {
			var d = {};
			var seqs = {};
			var feats = {};

			var lines = data.split('\n');
			var length = lines.length;
			var featCount = 0;
			var type = 'tab';

			var start = 0
			for ( var i = 0 ; i < length ; i ++ ) {
					var line = lines[i];
					if (line[0] != '#' && line[0] != '!') {
						start = i++;
						break;
					}
			}

			if (lines[start].split(new RegExp("\\s+")).length > 6) {
				type = 'hmmscan';
			}

			if (type == "hmmscan") {
				for ( var i = start ; i < length ; i ++ ) {
					var line = String(lines[i]).replace(/^\s+|\s+$/g, '');
					if (line[0] != '#' && line[0] != '!' && line != '') {
						var cols = line.split(new RegExp("\\s+"));

						var feature = cols[0];
						var seq = cols[3];
						var seqLen = parseInt(cols[5]);
						var start = parseInt(cols[17]);
						var end = parseInt(cols[18]);

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
				for (feat in feats) {
					d.feat.push(feats[feat]);
				}

				for (seq in seqs) {
					seqs[seq].feat.sort(function(a,b) {
						if (a.start < b.start) {
							return -1
						}
						if (a.start > b.start) {
							return 1;
						}

						return 0;
					});
					d.seq.push(seqs[seq]);
				}
			} else if (type == 'tab') {
				for ( var i = 0 ; i < length ; i ++ ) {
					var line = String(lines[i]).replace(/^\s+|\s+$/g, '');
					if (line[0] != '#' && line[0] != '!' && line != '') {
						var cols = line.split("\t");

						var feature = cols[1];
						var seq = cols[0];
						var start = parseInt(cols[2]);
						var end = parseInt(cols[3]);
						var seqLen = null;
						if (cols.length > 4) {
							seqLen = parseInt(cols[4]);
						}

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
							if (seqLen) {
								seqs[seq]['length'] = seqLen;
							}
							seqs[seq].feat.push({'name':feature,'start':start,'end':end,'show':true,'label':true,'ref':feats[feature]})
						}
					}
				}

				d.seq = [];
				d.feat = [];
				for (seq in seqs) {
					seqs[seq].feat.sort(function(a,b) {
						if (a.start < b.start) {
							return -1
						}
						if (a.start > b.start) {
							return 1;
						}

						return 0;
					});

					d.seq.push(seqs[seq]);
				}

				for (feat in feats) {
					d.feat.push(feats[feat]);
				}
			}

			return d;
		}

		//menus
		var colorpicker = new seeker.colorpicker()
			.attachTo(document.body)
			.hide();

		var navData = [
			{'name':'input','click':function() {
				seeker.env_closeAll();
				if (blockscreen_input.container.style('visibility') == 'hidden') {
						textarea_input.container
							.style('width',dim[0] * 4/5)
							.style('height',dim[1] * 1/2)
							.style('top',dim[1] / 2 - dim[1] / 4)
							.style('left',dim[0] * 1/10);

						text_inputInstruct.container
							.style('left',dim[0] * 1/10)
							.style('width',dim[0] * 4/5 - 20)
							.style('top',dim[1] / 2 - dim[1] / 4 - text_inputInstruct.container.node().offsetHeight + 2);

						button_inputValidate.container
							.style('top',10 + dim[1] * 1/2  + dim[1] / 4)
							.style('left',dim[0] * 9/10 - 150);

						button_inputCancel.container
							.style('top',10 + dim[1] * 1/2  + dim[1] / 4)
							.style('left',dim[0] * 9/10 - 70);

						button_inputHMMSample.container
							.style('top',10 + dim[1] * 1/2  + dim[1] / 4)
							.style('left',dim[0] * 1/10);

						button_inputTabSample.container
							.style('top',10 + dim[1] * 1/2  + dim[1] / 4)
							.style('left',dim[0] * 1/10 + 160);

						blockscreen_input.container
							.style('visibility', 'visible')
							.style('opacity',0)
							.transition()
							.duration(150)
							.style('opacity',0.95);
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

					menu_sequences.container
						.style('opacity',0)
						.transition()
						.duration(150)
						.style('opacity',1);

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

					menu_features.container
						.style('opacity',0)
						.transition()
						.duration(150)
						.style('opacity',1);

					seeker.env_clickTarget = this;
				} else {
					seeker.env_closeAll();
				}
			}},
			{'name':'options','click':function() {
				seeker.env_closeAll();
				if (panel_options.container.style('visibility') == 'hidden') {
					panel_options.container
						.style('visibility','visible')
						.style('opacity',0)
						.transition()
						.duration(150)
						.style('opacity',1);

				} else {
					panel_options.container.style('visibility','hidden');
				}
			}},
			{'name':'export','click':function() {
				d3.event.stopPropagation();
				panel_options.hide();
				seeker.env_closeAll();

				if (blockscreen_export.container.style('visibility') == 'hidden') {
					var dim = seeker.util.winDimensions();

					blockscreen_export.container.select('span')
						.style('top', dim[1] * 1/4 - 30)
						.style('width',dim[0] * 4/5 - 12)
						.style('text-align','center')
						.style('left', dim[0] * 1/10);

					blockscreen_export.container.select('#button')
						.style('top',dim[1] * 3/4 + 15)
						.style('left',dim[0] / 2 -50);

					blockscreen_export.container
						.style('visibility','visible')
						.style('opacity',0)
						.transition()
						.duration(150)
						.style('opacity',0.95);

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
						.style('top',40)
						.style('left',50)
						.style('width',navBar.container.node().offsetWidth - 40)
						.style('height','auto')
						.style('opacity',0)
						.transition()
						.duration(150)
						.style('opacity',1);
				} else {
					panel_about.container.style('visibility','hidden');
				}
			}}
		];

		var navBar = new seeker.navBar()
			.attachTo(base.container.node())
			.bind({'items':navData}, {'text':'name','click':'click'})
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
			.bind({'items':sequenceMenuData}, {'text':'name','click':'click'})
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
			.bind({'items':featureMenuData}, {'text':'name','click':'click'})
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
			.bind({'items':legendMenuData}, {'text':'name','click':'click'})
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
			.style('border','4px solid #2980B9')
			.on('mousedown',null);

		var text_inputInstruct = new seeker.base('div')
			.id('instruction')
			.attachTo(blockscreen_input.container.node());
		text_inputInstruct.container
			.html("<big><b>Instructions:</b></big><br>Input can be HMMScan's domain table output or a tab delimited file. Click the following buttons to see sample inputs in HMMScan domain table output or tab delimited file with format description.");


		var button_inputHMMSample = new seeker.button()
			.attachTo(blockscreen_input.container.node())
			.setType('inf');
		button_inputHMMSample.container
			.style('position','absolute')
			.html('sample HMMScan')
			.on('click', function() {
				textarea_input.container.node().value = '#                                                                                  --- full sequence --- -------------- this domain -------------   hmm coord   ali coord   env coord\n# target name        accession   tlen query name                 accession   qlen   E-value  score  bias   #  of  c-Evalue  i-Evalue  score  bias  from    to  from    to  from    to  acc description of target\n#------------------- ---------- -----       -------------------- ---------- ----- --------- ------ ----- --- --- --------- --------- ------ ----- ----- ----- ----- ----- ----- ----- ---- ---------------------\nRRM_1                PF00076.16    70 SETD1B_Schistosoma_mansoni -           1789   1.5e-08   33.8   0.0   1   1   7.2e-12     3e-08   32.9   0.0     4    67    89   153    86   156 0.94 RNA recognition motif. (a.k.a. RRM, RBD, or RNP domain)\nSET                  PF00856.22   168 Trr_Schistosoma_mansoni -           1560   4.8e-25   88.4   1.7   1   1   3.2e-28   1.3e-24   86.9   0.6     1   168  1431  1536  1431  1536 0.94 SET domain\nFYRC                 PF05965.8     87 Trr_Schistosoma_mansoni -           1560   3.1e-21   74.7   0.0   1   1   6.8e-24   2.8e-20   71.7   0.0     2    86  1241  1326  1240  1327 0.95 F/Y rich C-terminus\nFYRN                 PF05964.8     54 Trr_Schistosoma_mansoni -           1560   2.5e-17   61.8   0.1   1   1   1.5e-20   6.2e-17   60.5   0.1     1    54  1182  1238  1182  1238 0.94 F/Y-rich N-terminus\nPHD                  PF00628.23    51 lost_PHDs_of_Trr_Schistosoma_mansoni -           1074   7.4e-41  137.3  99.9   1   3     4e-14   4.9e-10   38.6   3.1     2    51   313   362   312   362 0.96 PHD-finger\nPHD                  PF00628.23    51 lost_PHDs_of_Trr_Schistosoma_mansoni -           1074   7.4e-41  137.3  99.9   2   3   1.8e-15   2.1e-11   43.0   5.3     2    50   362   408   361   409 0.94 PHD-finger\nPHD                  PF00628.23    51 lost_PHDs_of_Trr_Schistosoma_mansoni -           1074   7.4e-41  137.3  99.9   3   3   1.1e-13   1.3e-09   37.3   6.1     1    49   820   866   818   868 0.89 PHD-finger\nSET                  PF00856.22   168 MLL1_Schistosoma_mansoni -           3002   1.2e-23   83.8   5.3   1   1   4.3e-27   2.7e-23   82.7   0.4     1   167  2875  2979  2875  2980 0.93 SET domain\nFYRN                 PF05964.8     54 MLL1_Schistosoma_mansoni -           3002   1.4e-05   24.2   0.4   1   1   8.4e-09   5.1e-05   22.3   0.1    22    52  2213  2243  2205  2245 0.91 F/Y-rich N-terminus\nSET                  PF00856.22   168 SET-16_Caenorhabditis_elegans -           2475   4.1e-24   85.3   3.7   1   1   2.3e-27   7.1e-24   84.5   0.3     1   167  2343  2450  2343  2451 0.93 SET domain\nFYRC                 PF05965.8     87 SET-16_Caenorhabditis_elegans -           2475   4.9e-22   77.3   0.1   1   1   4.4e-25   1.4e-21   75.9   0.1     2    86  2109  2194  2108  2196 0.95 F/Y rich C-terminus\nFYRN                 PF05964.8     54 SET-16_Caenorhabditis_elegans -           2475   3.5e-18   64.5   0.3   1   1   2.3e-21     7e-18   63.5   0.2     2    52  2053  2104  2052  2106 0.96 F/Y-rich N-terminus\nPHD                  PF00628.23    51 SET-16_Caenorhabditis_elegans -           2475   4.7e-17   61.1  85.8   1   2   1.4e-11   4.2e-08   32.5   4.0     1    50   427   479   427   480 0.92 PHD-finger\nPHD                  PF00628.23    51 SET-16_Caenorhabditis_elegans -           2475   4.7e-17   61.1  85.8   2   2   5.2e-11   1.6e-07   30.6   7.4     1    51   479   527   477   527 0.88 PHD-finger\nSET                  PF00856.22   168 SET-2_Caenorhabditis_elegans -           1507   4.3e-23   82.0   0.2   1   1   6.9e-27   4.3e-23   82.0   0.1     1   167  1379  1484  1379  1485 0.92 SET domain\nRRM_1                PF00076.16    70 SET-2_Caenorhabditis_elegans -           1507   7.7e-08   31.6   0.0   1   1   2.9e-11   1.8e-07   30.4   0.0     5    62   132   190   128   198 0.89 RNA recognition motif. (a.k.a. RRM, RBD, or RNP domain)\nSET                  PF00856.22   168 Trr2_Clonorchis_sinensis -           1443     2e-24   86.3   0.8   1   1   2.3e-27   9.3e-24   84.2   0.6     1   167  1313  1417  1313  1418 0.93 SET domain\nFYRC                 PF05965.8     87 Trr2_Clonorchis_sinensis -           1443   4.4e-19   67.8   0.0   1   1   2.4e-22   9.9e-19   66.7   0.0     4    86  1129  1214  1126  1215 0.91 F/Y rich C-terminus\nFYRN                 PF05964.8     54 Trr2_Clonorchis_sinensis -           1443   5.3e-17   60.7   0.3   1   1   3.1e-20   1.2e-16   59.5   0.2     1    52  1057  1111  1057  1113 0.92 F/Y-rich N-terminus\nSET                  PF00856.22   168 SETD1B_Clonorchis_sinensis -           1685     4e-24   85.4   0.3   1   1   4.8e-27   2.9e-23   82.6   0.1     2   167  1558  1662  1557  1663 0.91 SET domain\nSET                  PF00856.22   168 MLL5_Clonorchis_sinensis -            892   7.2e-11   42.2   0.0   1   1   4.9e-14     6e-10   39.2   0.0     3   165   652   763   650   766 0.91 SET domain\nN-SET                PF11764.2    166 SET1_Schizosaccharomyces_pombe -            920   6.6e-32  110.4   0.1   1   1   2.2e-35   6.6e-32  110.4   0.1     3   166   630   771   628   771 0.96 COMPASS (Complex proteins associated with Set1p) component N\nSET                  PF00856.22   168 SET1_Schizosaccharomyces_pombe -            920   5.2e-24   85.0   0.7   1   1     8e-27   2.5e-23   82.8   0.5     3   167   794   897   793   898 0.91 SET domain\nSET_assoc            PF11767.2     66 SET1_Schizosaccharomyces_pombe -            920   5.2e-21   73.4   2.2   1   1   1.7e-24   5.2e-21   73.4   1.6     2    66   279   343   278   343 0.97 Histone lysine methyltransferase SET associated\nRRM_1                PF00076.16    70 SET1_Schizosaccharomyces_pombe -            920   3.4e-12   45.5   0.1   1   1   5.8e-12   1.8e-08   33.6   0.0     1    69    96   172    96   173 0.85 RNA recognition motif. (a.k.a. RRM, RBD, or RNP domain)\nSET                  PF00856.22   168 MLL5_Clonorchis_sinensis -            973   5.2e-06   26.4   0.0   1   1   1.2e-09   1.5e-05   24.9   0.0   113   165   728   780   698   782 0.90 SET domain';
			});

		var button_inputTabSample = new seeker.button()
			.attachTo(blockscreen_input.container.node())
			.setType('inf');
		button_inputTabSample.container
			.style('position','absolute')
			.html('sample tab delimited')
			.on('click', function() {
				textarea_input.container.node().value = '#\n!lines starting with "!" or "#" are ignored.\n!Format for tab delimited input contains 5 columns:\n!sequence name, feature name, start position, end position, sequence length\n!The 5th sequence length column can be omitted for rows with the same sequence name as long as at least one of the rows contain a sequence length.\n#\nSETD1B_Schistosoma_mansoni	RRM_1	89	153	1789\nTrr_Schistosoma_mansoni	SET	1431	1536	1560\nTrr_Schistosoma_mansoni	FYRC	1241	1326	1560\nTrr_Schistosoma_mansoni	FYRN	1182	1238\nlost_PHDs_of_Trr_Schistosoma_mansoni	PHD	313	362	1074\nlost_PHDs_of_Trr_Schistosoma_mansoni	PHD	362	408	1074\nlost_PHDs_of_Trr_Schistosoma_mansoni	PHD	820	866\nMLL1_Schistosoma_mansoni	SET	2875	2979	3002\nMLL1_Schistosoma_mansoni	FYRN	2213	2243	3002\nSET-16_Caenorhabditis_elegans	SET	2343	2450	2475\nSET-16_Caenorhabditis_elegans	FYRC	2109	2194	2475\nSET-16_Caenorhabditis_elegans	FYRN	2053	2104	2475\nSET-16_Caenorhabditis_elegans	PHD	427	479	2475\nSET-16_Caenorhabditis_elegans	PHD	479	527	2475\nSET-2_Caenorhabditis_elegans	SET	1379	1484	1507\nSET-2_Caenorhabditis_elegans	RRM_1	132	190	1507\nTrr2_Clonorchis_sinensis	SET	1313	1417	1443\nTrr2_Clonorchis_sinensis	FYRC	1129	1214	1443\nTrr2_Clonorchis_sinensis	FYRN	1057	1111	1443\nSETD1B_Clonorchis_sinensis	SET	1558	1662	1685\nMLL5_Clonorchis_sinensis	SET	652	763	892\nSET1_Schizosaccharomyces_pombe	N-SET	630	771	920\nSET1_Schizosaccharomyces_pombe	SET	794	897	920\nSET1_Schizosaccharomyces_pombe	SET_assoc	279	343	920\nSET1_Schizosaccharomyces_pombe	RRM_1	96	172	920\nMLL5_Clonorchis_sinensis	SET	728	780	973\nlost_PHDs_of_Trr_Clonorchis_sinensis	PHD	41	90	3518\nlost_PHDs_of_Trr_Clonorchis_sinensis	PHD	90	136	3518\nlost_PHDs_of_Trr_Clonorchis_sinensis	PHD	559	606	3518\nlost_PHDs_of_Trr_Clonorchis_sinensis	Cadherin	3303	3375	3518\nlost_PHDs_of_Trr_Clonorchis_sinensis	Cadherin	3408	3499	3518\nTrr1_Clonorchis_sinensis	SET	1634	1739	1763\nTrr1_Clonorchis_sinensis	FYRC	1452	1538	1763\nTrr1_Clonorchis_sinensis	FYRN	1394	1448	1763\nSETD1_Schmidtea_mediterranea	SET	263	367	390\nSETD1_Schmidtea_mediterranea	N-SET	134	234	390\nTrr2_Schmidtea_mediterranea	FYRC	1026	1110	1336\nTrr2_Schmidtea_mediterranea	SET	1206	1310	1336\nTrr2_Schmidtea_mediterranea	FYRN	967	1021	1336\nTrr1_Schmidtea_mediterranea	SET	821	925	951\nTrr1_Schmidtea_mediterranea	FYRC	639	724	951\nTrr1_Schmidtea_mediterranea	FYRN	578	633	951';
			});

		var button_inputValidate = new seeker.button()
			.attachTo(blockscreen_input.container.node())
			.setType('suc');
		button_inputValidate.container
			.style('position','absolute')
			.html('submit')
			.on('click', function() {
				var parsedData = base.parseInput(textarea_input.container.node().value);

				base
					.reinit()
					.bind({'sequences':parsedData,'features':parsedData}, {'sequences':'seq','features':'feat'})
					.update();

				blockscreen_input.hide();
			});

		var button_inputCancel = new seeker.button()
			.attachTo(blockscreen_input.container.node())
			.setType('dan');
		button_inputCancel.container
			.style('position','absolute')
			.html('cancel')
			.on('click', function() {
				blockscreen_input.hide();
			});

		var div_inputStatus;

		var menu_sequencesControlData = [
			{'name':'show all','click':function() {
				var seqs = base.datum('sequences');
				var i = seqs.length;
				while ( i-- ) {
					seqs[i].show = true;
				}
				base.update();
			}},
			{'name':'hide all','click':function() {
				var seqs = base.datum('sequences');
				var i = seqs.length;
				while ( i-- ) {
					seqs[i].show = false;
				}
				base.update();
			}},
		];

		var menu_sequences = new seeker.complexMenu()
			.attachTo(document.body)
		    .setControl({'items':menu_sequencesControlData}, {'text':'name','click':'click'})
		    .setTemplate(function(li, data, index, keys) {
				var cbox = new seeker.checkbox()
				.attachTo(li);

				cbox
					.bind({'text':data,'checkbox':data}, {'text':keys.text,'checkbox':keys.cb})
					.prependText((index + 1) + '. ')
					.update();

				seeker.util.addUpdate(cbox, cbox.data.checkbox, cbox.keys.checkbox, base.update);

				li.checkbox = cbox;

				d3.select(li)
					.on('mouseover', function() {
						_targetData = data.feat;
						submenu_features
							.reinit()
							.bind({'items':_targetData}, {'text':'name','cb':'show'})
							.update()
							.show();

						var seqMenu = menu_sequences.container.node();
						submenu_features
							.place([seqMenu.offsetLeft + seqMenu.offsetWidth - 5,this.offsetTop - menu_sequences.list.container.node().scrollTop + seqMenu.offsetTop - 10]);
					})
		    })
		    .setRemove(function(li) {
		    	li.checkbox.unbind();
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
		    .setControl({'items':submenu_featuresControlData}, {'text':'name','click':'click'})
		    .setTemplate(function(li, data, index, keys) {
				var cbox = new seeker.checkbox()
					.attachTo(li);
				cbox
					.bind({'text':data,'checkbox':data}, {'text':keys.text,'checkbox':keys.cb})
					.prependText((index + 1) + '. ')
					.update();

				seeker.util.addUpdate(cbox, cbox.data.checkbox, cbox.keys.checkbox, base.update)

				li.checkbox = cbox;
		    })
		    .setRemove(function(li) {
		    	li.checkbox.unbind();
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
		    .setControl({'items':menu_featuresControlData}, {'text':'name','click':'click'})
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
			.style('height',dim[1] - 60)
			.style('width', 240)
			.style('top',20)
			.style('left',dim[0] - 270)
			.style('border-bottom','10px solid #38B87C')
			.style('border-top','10px solid #38B87C')
			.style('overflow-y','auto')
			.style('z-index',10000);

		var opt_legendShow = new seeker.checkbox()
			.bind({'checkbox':base.settings}, {'checkbox':'legend_show'})
			.attachTo(panel_options.container.node())
			.setText('show legend')
			.update();

		var opt_seqNumbered = new seeker.checkbox()
			.bind({'checkbox':base.settings}, {'checkbox':'seq_numbered'})
			.attachTo(panel_options.container.node())
			.setText('numbered sequences')
			.update();

		var opt_margin = new seeker.slider()
			.setInterval(0,100)
			.setText('figure margins')
		    .bind({'slider':base.settings}, {'slider':'margin'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,-1,-1)
		    .update();

		var opt_seqLength = new seeker.slider()
			.setInterval(0,dim[0])
			.setText('maximum sequence width')
		    .bind({'slider':base.settings}, {'slider':'seq_maxLength'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,-1,-1)
		    .update();

		var opt_legendSpacing = new seeker.slider()
			.setInterval(0,dim[1])
		    .bind({'slider':base.settings}, {'slider':'legend_spacing'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('spacing under legend')
		    .update();

		var opt_legendWidth = new seeker.slider()
			.setInterval(0,dim[0])
		    .bind({'slider':base.settings}, {'slider':'legend_width'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('legend width')
		    .update();

		var opt_legendHeight = new seeker.slider()
			.setInterval(0,dim[1])
		    .bind({'slider':base.settings}, {'slider':'legend_height'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('legend height')
		    .update();

		var opt_legendCols = new seeker.slider()
			.setInterval(0,20)
		    .bind({'slider':base.settings}, {'slider':'legend_cols'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('legend columns')
		    .update();

		var opt_legendColorSize = new seeker.slider()
			.setInterval(0,200)
		    .bind({'slider':base.settings}, {'slider':'legend_size'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('legend color box size')
		    .update();

		var opt_legendXPos = new seeker.slider()
			.setInterval(0,dim[0])
		    .bind({'slider':base.settings}, {'slider':'legend_xPos'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('legend horizontal position')
		    .update();

		var opt_seqSpacing = new seeker.slider()
			.setInterval(5,500)
		    .bind({'slider':base.settings}, {'slider':'seq_spacing'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('spacing between sequences')
		    .update();

		var opt_spineWidth = new seeker.slider()
			.setInterval(1,50)
		    .bind({'slider':base.settings}, {'slider':'seq_spineWidth'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('sequence spine width')
		    .update();

		var opt_featWidth = new seeker.slider()
			.setInterval(1,50)
		    .bind({'slider':base.settings}, {'slider':'feat_width'})
		    .attachTo(panel_options.container.node())
		    .whxy(200,-1,0,0)
		    .setText('feature width')
		    .update();

		var opt_labelXPos = new seeker.slider()
			.setInterval(0,dim[0])
		    .bind({'slider':base.settings}, {'slider':'seq_labelxPos'})
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
			.style('border','4px solid #2980B9')
			.attr('id','preview')
				.append('img');

		blockscreen_export.container
			.append('span')
			.style('position','absolute')
			.style('font-family','Arial')
			.style('font-size','10pt')
			.attr('id','instruction')
			.text('Right click on the below image and select "save as" to save the image as svg to your computer.');

		var button_exportClose = new seeker.button()
			.attachTo(blockscreen_export.container.node())
			.setType('dan');
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
			.style('opacity',0.95)
			.style('overflow-y','auto')
			.style('overflow-x','hidden')
			.style('padding',20)
			.style('color','white')
			.style('font-family','Arial')
			.style('font-size','10pt')
			.style('line-height','25px')
			.style('background','#2980B9')
			.style('visibility','visible')
			.style('border-bottom','7px solid #313841')
			.on('mousedown',null)
			.html('<big><b>Annotation Viewer</b> v1.0</big><br><b>Author:</b> Damian Kao (damian.kao[at]gmail.com)<br><b>Github source:</b> <a href="https://github.com/damiankao/">https://github.com/damiankao/</a><br><br><b><big>Instructions:</big></b><br>1. click input to start <br>2. follow instructions on how to input your data<br>3. submit your data<br>4. manipulate the generated figure by clicking on labels, features, legend items, options<br>5. click on the export button to save as .svg')
			.style('top',40)
			.style('left',50)
			.style('width',328)
			.style('height','auto')
			.style('opacity',1);

		seeker.env_toClose.push(panel_about);


		return base;
	}
})();
