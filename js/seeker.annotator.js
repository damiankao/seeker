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

		base.targetData;
		base.onLegendClick;
		base.onSequenceClick;
		base.onFeatureClick;
		base.additionInit;
		base.additionPostBind;

		var _scale;
		var _navBarHeight = 20;
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

						if (base.onColorClick) {
							obj.select('rect')
								.on('mouseover', function() {
									base.container.node().style.cursor = 'pointer';
								})
								.on('mouseout', function() {
									base.container.node().style.cursor = 'default';
								})
								.on('click', function(d) {
									base.onColorClick(d, this);
								});
						}

						obj
							.append('text')
							.style('font-size','9pt')
							.style('font-family','Arial')
							.attr('baseline-shift','-33%');

						if (base.onLegendClick) {
							obj.select('text')
								.on('mouseover', function(evt) {
									base.container.node().style.cursor = 'pointer';
								})
								.on('mouseout', function(evt) {
									base.container.node().style.cursor = 'default';
								})
								.on('click', function(d) {
									base.onLegendClick(d, this);
								});
						}
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

					if (base.onSequenceClick) {
						obj.select('text')
							.on('mouseover', function(evt) {
								base.container.node().style.cursor = 'pointer';
							})
							.on('mouseout', function(evt) {
								base.container.node().style.cursor = 'default';
							})
							.on('click', function(d) {
								base.onSequenceClick(d, this);
							});
					}
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

						if (base.onFeatureClick) {
							obj.select('line')
								.on('mouseover', function(evt) {
									base.container.node().style.cursor = 'pointer';
									d3.select(this)
										.attr('x1',_scale(d.start) - 4)
										.attr('x2',_scale(d.end) + 4)
										.style('stroke-width',base.settings.feat_width + 4);
								})
								.on('mouseout', function(evt) {
									base.container.node().style.cursor = 'default';
									d3.select(this)
										.attr('x1',_scale(d.start))
										.attr('x2',_scale(d.end))
										.style('stroke-width',base.settings.feat_width);
								})
								.on('click', function(d) {
									base.onFeatureClick(d, this);
								});
						}

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
						base.container.node().style.cursor = 'move';
					})
					.on('mouseout', function() {
						base.container.node().style.cursor = 'default';
					})
					.on('mousedown', function() {
						var label = this;
						d3.select(base.container.node())
							.on('mousemove', function() {
								var coord = d3.mouse(label);
								d3.select(label)
									.attr('x',coord[0])
									.attr('y',coord[1]);

							})

						d3.select(base.container.node())
							.on('mouseup', function() {
								d3.select(base.container.node())
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

			if (base.additionInit) {
				base.additionInit();
			}

			return base;
		}

		base.postBind = function() {
			seeker.util.bindModel(base.settings);

			for (name in base.settings) {
				if (name.lastIndexOf('__',0)) {
					seeker.util.addUpdate(base, base.settings, name, base.update);
				}
			}

			if (base.additionPostBind) {
				base.additionPostBind();
			}
			return base;
		}

		base.postUnbind = function() {
			console.log('test');
			base.settings.__onUpdate__ = null;
			base.settings.__bound__ = null;

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

		base.svgHTML = function() {
			var data = canvas.container
	            .attr("title", "annotations")
	            .attr("version", 1.1)
	            .attr("xmlns", "http://www.w3.org/2000/svg")
	            .node().parentNode.innerHTML;

	        return data;
		}

		base.loadData = function(d) {
			var parsedData = base.parseInput(d);
            base
                .reinit()
                .bind({'sequences':parsedData,'features':parsedData}, {'sequences':'seq','features':'feat'})
                .update();
		}

		return base;
	}
})();
