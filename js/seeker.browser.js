(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	data = {
		
	}

	to-do:
		-Ramer–Douglas–Peucker algorithm to approximate feature density

	*/
	seeker.browser = function() {
		var base = new seeker.base('div')
			.id('browser');
		var navBar = new seeker.base('div')
			.attachTo(base.container.node());

		navBar.container
			.style('position','absolute')
			.style('left',0)
			.style('top',0)
			.style('background','#313841')
			.style('height',40)
			.html('<center><small><small><font face="Arial" color="white">This is the very very preliminary alpha version of the seeker genome browser. The data shown is human chromosome 1 (980kb of data). Keyboard interactions: W - scroll up, A - scroll left, S - scroll down, D - scroll right, Q - zoom out, E - zoom in</font></small></small></center>');

		var overviewImage = new seeker.base('canvas')
			.attachTo(base.container.node());

		overviewImage.container
			.style('position','absolute');

		var overview = new seeker.base('div')
			.attachTo(base.container.node());

		overview.container
			.style('position','absolute')
			.style('left',0)
			.style('height',60);

		var overviewSVG = overview.container
			.append('svg')
			.style('position','absolute')
			.style('width','100%')
			.style('height',60);

		var viewport = new seeker.base('div')
			.attachTo(base.container.node());
		viewport.container
			.style('position','absolute')
			.style('top',40)
			.style('overflow','hidden')
			.style('box-shadow','2px 3px 50px -1px black');

		var canvas = new seeker.base('svg')
			.attachTo(viewport.container.node());
		canvas.container
			.style('position','absolute')
			.style('top',0)
			.style('left',0);

		var scale = new seeker.base('div')
			.attachTo(base.container.node());
		scale.container
			.style('background','white')
			.style('position','absolute')
			.style('overflow','hidden')
			.style('top',40)
			.style('left',0)
			.style('height',20);

		var scaleCanvas = new seeker.base('svg')
			.id('scale')
			.attachTo(scale.container.node());

		var overviewMarker = new seeker.base('div')
			.id('marker')
			.attachTo(base.container.node());

		overviewMarker.container
			.append('div');

		blockscreen_load = new seeker.blockscreen()
			.attachTo(document.body);

		var linePool = new seeker.util.pool('line');
		var groupPool = new seeker.util.pool('g');

		var settings = {
			'scrollInterval':10
		};

		var _ref;
		var _refLength;
		var _startBP;
		var _endBP;
		var _windowBP;

		var _startBound;
		var _endBound;

		var _feats;
		var _fieldWidth;

		var _fieldReset = false;

		var _ticks;

		var _palette = ['#F2E479','#622C7A','#2C337A','#2C7A69','#337A2C','#7A5C2C','#9E2121','#A8DEFF','#FC7632','#B3E8A0'];

		base.features;
		base.dim_ref;
		base.dim_start;
		base.dim_end;
		base.lengths;

		base.bpToPx;
		base.pxToBp;
		base.overviewScaleX;
		base.overviewScaleY;
		base.svg_feats;

		base.setRef = function(ref) {
			var dim = seeker.util.winDimensions();
			_ref = ref;
			_refLength = base.lengths[_ref];

			base.dim_ref.filter(_ref);

			base.overviewScaleX = d3.scale.linear()
			    .domain([1, base.lengths[_ref]])
			    .range([1, dim[0]]);

			base.overviewScaleX2 = d3.scale.linear()
			    .range([1, base.lengths[_ref]])
			    .domain([1, dim[0]]);

			base.overviewScaleY = d3.scale.linear()
			    .domain([1, d3.max(pts,function(d) {return d[1]})])
			    .range([40, 1]);

			base.renderOverview();

			return base;
		}

		base.setWindow = function(start, end) {
			var length = end - start + 1;

			_startBP = start;
			_startBound = start - length - 1;
			_endBP = end;
			_endBound = end + length;
			_windowBP = length;

			base.dim_end.filterFunction(function(d) {
				return d > _startBound;
			})
			base.dim_start.filterFunction(function(d) {
				return d < _endBound;
			})

			_feats = base.dim_start.bottom(Infinity);

			var markerWidth = base.overviewScaleX(length);
			if (markerWidth < 1) {
				markerWidth = 1;
			}

			overviewMarker.container
					.style('width',markerWidth)

			return base;
		}

		base.update = function() {
			if (!_fieldReset) {
				var dim = seeker.util.winDimensions();

				_fieldWidth = dim[0] * 3;

				_ticks = Math.floor(_fieldWidth / 100);

				base.rescale();
				
				viewport.container
					.style('width',dim[0])
					.style('height',dim[1] - 101);

				canvas.container
					.style('width',_fieldWidth);

				viewport.container.node().scrollLeft = _fieldWidth / 2 - dim[0] / 2;

				overview.container
					.style('top',dim[1] - 60)
					.style('width',dim[0]);

				overviewSVG
					.style('top',0)
					.style('left',0);

				overviewImage.container
					.style('background','#2980B9')
					.style('top',dim[1] - 60)
					.style('left',0);

				overviewMarker.container
					.style('top',dim[1] - 62);

				navBar.container
					.style('width',dim[0]);

				scaleCanvas.container
					.style('width',_fieldWidth);

				scale.container
					.style('width',dim[0]);

				scale.container.node().scrollLeft = _fieldWidth / 2 - dim[0] / 2;

				base.render();

				base.updateMarker();
				_fieldReset = true;
			}
			return base;
		}

		base.rescale = function() {
			base.bpToPx = d3.scale.linear()
			    .domain([_startBound, _endBound])
			    .range([1, _fieldWidth]);

			base.pxToBp = d3.scale.linear()
			    .domain([1, _fieldWidth])
			    .range([_startBound, _endBound]);

			return base;
		}

		base.updateMarker = function() {			
			var viewStart = parseInt(base.overviewScaleX(parseInt(base.pxToBp(viewport.container.node().scrollLeft))));

			if (viewStart != parseInt(overviewMarker.container.node().style.left)) {
				overviewMarker.container.node().style.left = viewStart
			}

			return base;
		}

		base.render = function() {
			var scaleAxis = d3.svg.axis()
	            .scale(base.bpToPx)
	            .tickSize(7,4,0)
	            .tickPadding(5)
	            .tickSubdivide(1)
	            .tickFormat(d3.format(",.s"))
	            .ticks(_ticks);

			scaleCanvas.container
				.style('font-family','arial')
				.style('font-size','10px')
				.call(scaleAxis);

			scaleCanvas.container
				.selectAll('line')
				.style('stroke','black');

			var f = canvas.container
				.selectAll('#features')
				.data(_feats, function(d) {
					return d.name;
				});

			f
				.enter()
				.append(function() {return groupPool.get();})
				.attr('id','features')
				.on('mouseover', function(d) {
					d3.event.preventDefault();
					d3.event.stopPropagation();
					document.body.style.cursor = 'pointer';
				})
				.on('mouseout', function(d) {
					d3.event.preventDefault();
					d3.event.stopPropagation();
					document.body.style.cursor = 'default';
				})
				.on('click',function(d) {
					console.log(d.name)
				})
					.append(function() {return linePool.get();})
					.attr('id','spine')
					.style('shape-rendering','crispEdges')
					.style('stroke-width','2px')
					.style('stroke',_palette[6]);

				f
					.select('#spine')
					.attr('x1',function(d) {
						return 1;
					})
					.attr('y1',function(d) {
						return 0;
					})
					.attr('x2',function(d) {
						return parseInt(base.bpToPx(_startBound + d.end - d.start + 1));
					})
					.attr('y2',function(d) {
						return 0;
					});

				var subf = f
					.selectAll('#subfeatures')
					.data(function(d) {
						return d.coords;
					});

				subf
					.enter()
					.append(function() {return linePool.get();})
					.attr('id','subfeatures')
					.style('shape-rendering','crispEdges')
					.style('stroke-width','8px')
					.style('stroke',_palette[6]);

				subf
					.attr('x1',function(d) {
						return parseInt(base.bpToPx(_startBound + d[0]));
					})
					.attr('y1',function(d) {
						return 0;
					})
					.attr('x2',function(d) {
						var x1 = parseInt(d3.select(this).attr('x1'));
						var x2 = base.bpToPx(_startBound + d[0] + d[1]);
						var length = x2 - x1;

						if (length > 1) {
							return parseInt(x2);
						} else {
							return x1 + 1;
						}
					})
					.attr('y2',function(d) {
						return 0;
					});

			var levels = [];
			f
				.attr('transform',function(d) {
					var currentStart = base.bpToPx(d.start);
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
						return 'translate(' + currentStart + ',50)';
					} else {
						return 'translate(' + currentStart + ',' + (50 + l * 15) + ')';
						return 35 + (base.settings.feat_width) + (l * 14);
					}
				});

			f
				.exit()
				.each(function() {
					while (this.firstChild) {
    					this.firstChild.free();
					}

					this.free();
				});

			var maxHeight = parseInt(viewport.container.style('height'));
			if (maxHeight < (levels.length * 15 + 60)) {
				maxHeight = levels.length * 15 + 60;
			}

			canvas.container
				.style('height',maxHeight);

			return base;
		}

		base.renderOverview = function() {
			var dim = seeker.util.winDimensions();

			var overviewLine = overviewSVG
				.append('path')
				.style('stroke','white')
				.style('fill','white');

			var line = d3.svg.line()
				.x(function(d) {
					return base.overviewScaleX(d[0]);
				})
				.y(function(d) {
					return base.overviewScaleY(d[1]);
				})
				.interpolate('step-after');

			overviewLine
				.attr('d', line(pts) + "z");

			var svgData = overviewSVG
	            .attr("title", "overview")
	            .attr("version", 1.1)
	            .attr("xmlns", "http://www.w3.org/2000/svg")
	            .node().parentNode.innerHTML;

	        canvg(overviewImage.container.node(),svgData)

	        overviewSVG
				.select('path')
				.remove();

			var overviewRect = overviewSVG
				.append('rect')
				.style('fill','white')
				.style('opacity',0.7)
				.attr('width',dim[0])
				.attr('height',20)
				.attr('x',0)
				.attr('y',40);

	        var overviewGroup = overviewSVG
				.append('g');

	        var overviewAxis = d3.svg.axis()
	            .scale(base.overviewScaleX)
	            .tickSize(4,2,0)
	            .tickPadding(2)
	            .tickSubdivide(1)
	            .tickFormat(d3.format(",.3s"))
	            .ticks(Math.floor(dim[0] / 50));

			overviewGroup
				.style('font-family','arial')
				.style('font-size','11px')
				.style('fill','black')
				.attr('transform', 'translate(0,41)')
				.call(overviewAxis);

			overviewGroup
				.selectAll('line')
				.style('stroke-width','1px')
				.style('stroke','black');

			return base;
		}

		base.load = function(path) {
			blockscreen_load
				.show()
				.update()
				.container
				.html('<BR><BR><BR><BR><BR><center><font face="arial">L O A D I N G . . .</font></center>');

			var postLoad = function() {
				var feats = [];
				var refs = {};
				var rows = data.split('~');
				var i = rows.length;

				while ( i-- ) {
					var cols = rows[i].split('|');
					var name = cols[0];
					var ref = cols[1];
					var strand = cols[2];
					var start = parseInt(cols[3]);
					var coordinates = [];

					var coords = cols[4].split(';');
					for ( a = 0 ; a < coords.length ; a++ ) {
						var c = coords[a].split(',')
						coordinates.push([parseInt(c[0]), parseInt(c[1])]);
					}

					feats.push({
						'name':name,
						'ref':ref,
						'strand':strand,
						'start':start,
						'end':start + coordinates[coordinates.length - 1][0] + coordinates[coordinates.length - 1][1] - 1,
						'coords':coordinates
					});
				}
				
				base.features = crossfilter(feats);
				base.dim_ref = base.features.dimension(function(d) {return d.ref;});
				base.dim_start = base.features.dimension(function(d) {return d.start});
				base.dim_end = base.features.dimension(function(d) {return d.end});
				base.lengths = refLengths;

				for (name in base.lengths) {
					base
						.setRef(name)
						.setWindow(155000000,156000000)
						.update();

					break;
				}

				blockscreen_load.hide();
			}

			seeker.util.injectScript(path, postLoad);

			return base;
		}

		base.scrollUpdate = function() {
			var length = _endBP - _startBP + 1;
			var newStart = parseInt(base.pxToBp(viewport.container.node().scrollLeft + 0.65));

			base
				.setWindow(newStart, newStart + length)
				.update();

			return base;
		}

		base.jumpTo = function(bp) {
			_fieldReset = false;
			var halfWindow = _windowBP / 2
			var start = parseInt(bp - halfWindow);
			var end = parseInt(bp + halfWindow);

			if (start < 1) {
				start = 1;
			}

			if (end > _refLength) {
				end = _refLength;
			}

			base
				.setWindow(start,end)
				.update();

			return base;
		}

		base.zoom = function(windowSize) {
			var half = parseInt(windowSize / 2);
			var mid = _startBP + parseInt(_windowBP / 2);
			var start = mid - half; 
			var end = mid + half;

			if (start < 1) {
				start = 1;
			}

			if (end > _refLength) {
				end = _refLength;
			}


			base
				.setWindow(start,end)
				.update();

			return base;
		}

		canvas.container
			.on('mouseover',function() {
				document.body.style.cursor = 'move';
			})
			.on('mouseout',function() {
				document.body.style.cursor = 'default';
			})
			.on('mousedown', function() {
				if (!_fieldReset) {
					base.scrollUpdate();
				}
				var downCoord = d3.mouse(document.body);
				var downScroll = [viewport.container.node().scrollLeft, viewport.container.node().scrollTop];
				d3.select(document.body)
					.on('mousemove', function() {
						_fieldReset = false;
						var coord = d3.mouse(document.body);
						var offX = coord[0] - downCoord[0];
						var offY = coord[1] - downCoord[1];

						viewport.container.node().scrollLeft = downScroll[0] - offX;
						viewport.container.node().scrollTop = downScroll[1] - offY;

						base.updateMarker();
					})
					.on('mouseup', function() {
						base.scrollUpdate();

						d3.select(document.body)
							.on('mousemove',null)
							.on('mouseup',null);
					});
			})

		viewport.container
			.on('scroll', function() {
				scale.container.node().scrollLeft = viewport.container.node().scrollLeft;
			});

		overview.container
			.on('mousedown', function() {
				base.jumpTo(parseInt(base.overviewScaleX2(d3.mouse(document.body)[0])));

				var limit;
				d3.select(document.body)
					.on('mousemove', function() {
						var bp = parseInt(base.overviewScaleX2(d3.mouse(document.body)[0]));
						clearTimeout(limit);
						limit = setTimeout(function() {
							base.jumpTo(bp);
						},settings.scrollInterval);
					})
					.on('mouseup', function() {
						d3.select(document.body)
							.on('mousemove',null)
							.on('mouseup',null);
					})
			})
			.on('mouseover', function() {
				document.body.style.cursor = 'pointer';
			})
			.on('mouseout', function() {
				document.body.style.cursor = 'default';
			})

		overviewMarker.container
			.on('mousedown', function() {
				var limit;
				d3.select(document.body)
					.on('mousemove', function() {
						var bp = parseInt(base.overviewScaleX2(d3.mouse(document.body)[0]));
						clearTimeout(limit);
						limit = setTimeout(function() {
							base.jumpTo(bp);
						},settings.scrollInterval);
					})
					.on('mouseup', function() {
						d3.select(document.body)
							.on('mousemove',null)
							.on('mouseup',null);
					})
			})
			.on('mouseover', function() {
				document.body.style.cursor = 'pointer';
			})
			.on('mouseout', function() {
				document.body.style.cursor = 'default';
			})

		Mousetrap.bind('w', function() {
			viewport.container.node().scrollTop -= 20;
		}, 'keydown')

		Mousetrap.bind('a', function() {
			_fieldReset = false;
			viewport.container.node().scrollLeft -= 20;
			if (viewport.container.node().scrollLeft < _fieldWidth / 6) {
				base.scrollUpdate();
			}
			base.updateMarker();
		}, 'keydown')

		Mousetrap.bind('s', function() {
			viewport.container.node().scrollTop += 20;
		}, 'keydown')

		Mousetrap.bind('d', function() {
			_fieldReset = false;
			viewport.container.node().scrollLeft += 20;
			if (viewport.container.node().scrollLeft > _fieldWidth / 2) {
				base.scrollUpdate();
			}
			base.updateMarker();
		}, 'keydown')

		Mousetrap.bind('q', function() {
			_fieldReset = false;

			base
				.zoom(parseInt(_windowBP * 1.5));

			base.updateMarker();
		}, 'keydown')

		Mousetrap.bind('e', function() {
			_fieldReset = false;

			base
				.zoom(parseInt(_windowBP * 0.75));
			
			base.updateMarker();
		}, 'keydown')

		return base;
	}
}());