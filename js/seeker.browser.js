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
		var viewport = new seeker.base('div')
			.attachTo(base.container.node());
		var overview = new seeker.base('svg')
			.attachTo(base.container.node());
		var navBar = new seeker.base('div')
			.attachTo(base.container.node());

		navBar.container
			.style('position','absolute')
			.style('left',0)
			.style('top',0)
			.style('background','#4F61B3')
			.style('height',40);

		viewport.container
			.style('position','absolute')
			.style('top',40)
			.style('overflow','hidden');

		var canvas = new seeker.base('svg')
			.attachTo(viewport.container.node());
		canvas.container
			.style('position','absolute')
			.style('top',0)
			.style('left',0);

		overview.container
			.style('background','#E3E3E3')
			.style('position','absolute')
			.style('left',0)
			.style('height',100);

		var scale = new seeker.base('div')
			.attachTo(base.container.node());
		scale.container
			.style('position','absolute')
			.style('background','white')
			.style('overflow','hidden')
			.style('top',40)
			.style('left',0)
			.style('height',20);

		var scaleCanvas = new seeker.base('svg')
			.id('scale')
			.attachTo(scale.container.node());

		var linePool = new seeker.util.pool('line');
		var groupPool = new seeker.util.pool('g');

		var _ref;
		var _refLength;
		var _startBP;
		var _endBP;

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
		base.svg_feats;

		base.setRef = function(ref) {
			_ref = ref;
			_refLength = base.lengths[_ref];

			base.dim_ref.filter(_ref);

			return base;
		}

		base.setWindow = function(start, end) {
			var length = end - start + 1;

			_startBP = start;
			_startBound = start - length - 1;
			_endBP = end;
			_endBound = end + length;

			base.dim_end.filterFunction(function(d) {
				return d > _startBound;
			})
			base.dim_start.filterFunction(function(d) {
				return d < _endBound;
			})

			_feats = base.dim_start.bottom(Infinity);

			return base;
		}

		base.update = function() {
			if (!_fieldReset) {
				var dim = seeker.util.winDimensions();

				_fieldWidth = dim[0] * 3;

				_ticks = Math.floor(_fieldWidth / 50);

				base.rescale();
				
				viewport.container
					.style('width',dim[0])
					.style('height',dim[1] - 140);

				canvas.container
					.style('width',_fieldWidth);

				viewport.container.node().scrollLeft = _fieldWidth / 2 - dim[0] / 2;

				overview.container
					.style('top',dim[1] - 100)
					.style('width',dim[0]);

				navBar.container
					.style('width',dim[0]);

				scaleCanvas.container
					.style('width',_fieldWidth);

				scale.container
					.style('width',dim[0]);

				scale.container.node().scrollLeft = _fieldWidth / 2 - dim[0] / 2;

				base.render();

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

		base.render = function() {
			var scaleAxis = d3.svg.axis()
	            .scale(base.bpToPx)
	            .tickSize(7,4,0)
	            .tickPadding(5)
	            .tickSubdivide(1)
	            .tickFormat(d3.format(",.3s"))
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
					.style('stroke',_palette[1])
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
					.style('stroke',_palette[1]);

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
			if (maxHeight < (levels.length * 15 + 100)) {
				maxHeight = levels.length * 15 + 100;
			}

			canvas.container
				.style('height',maxHeight);

			return base;
		}

		base.load = function(path) {
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
						.setWindow(6000000,6500000)
						.update();

					break;
				}
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

		Mousetrap.bind('w', function() {
			viewport.container.node().scrollTop -= 20;
		}, 'keydown')

		Mousetrap.bind('a', function() {
			_fieldReset = false;
			viewport.container.node().scrollLeft -= 20;
			if (viewport.container.node().scrollLeft < _fieldWidth / 6) {
				base.scrollUpdate();
			}
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
		}, 'keydown')

		return base;
	}
}());