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
		var base = new seeker.base('div');
		var viewport = new seeker.base('div')
			.attachTo(base.container.node());

		viewport.container
			.style('position','absolute')
			.style('overflow','auto');

		var canvas = new seeker.base('svg')
			.attachTo(viewport.container.node());

		var _ref;
		var _refLength;
		var _startBP;
		var _endBP;

		var _startBound;
		var _endBound;

		var _feats;
		var _fieldWidth;

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

			_feats = base.dim_ref.top(Infinity);

			return base;
		}

		base.update = function() {
			var dim = seeker.util.winDimensions();
			_fieldWidth = dim[0] * 3;

			base.rescale();
			
			viewport.container
				.style('width',dim[0])
				.style('height',dim[1] - 100);

			canvas.container
				.style('width',_fieldWidth)
				.style('height',dim[1]);

			viewport.container.node().scrollLeft = _fieldWidth / 2 - dim[0] / 2;

			base.render();
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
			var f = canvas.container
				.selectAll('#features')
				.data(_feats, function(d) {
					return d.name;
				});

			f
				.enter()
				.append('g')
				.attr('id','features');

			f
				.append('line')
				.attr('id','spine')
				.style('shape-rendering','crispEdges')
				.style('stroke-width','2px')
				.style('stroke','gray')
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
					.append('line')
					.attr('id','subfeatures')
					.style('shape-rendering','crispEdges')
					.style('stroke-width','8px')
					.style('stroke','red');

				subf
					.attr('x1',function(d) {
						return parseInt(base.bpToPx(_startBound + d[0]));
					})
					.attr('y1',function(d) {
						return 0;
					})
					.attr('x2',function(d) {
						return parseInt(base.bpToPx(_startBound + d[0] + d[1]));
					})
					.attr('y2',function(d) {
						return 0;
					});

				subf
					.exit()
					.remove();

			f
				.attr('transform',function(d) {
					return 'translate(' + base.bpToPx(d.start) + ',50)';
				});

			f
				.exit()
				.select('#spine')
				.remove();
			f
				.exit()
				.remove();

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
						.setWindow(1000000,2000000)
						.update();
					break;
				}
			}

			seeker.util.injectScript(path, postLoad);

			return base;
		}

		canvas.container
			.on('mouseover',function() {
				document.body.style.cursor = 'pointer';
			})
			.on('mousedown', function() {
				var downCoord = d3.mouse(document.body);
				var downScroll = [viewport.container.node().scrollLeft, viewport.container.node().scrollTop];
				d3.select(document.body)
					.on('mousemove', function() {
						var coord = d3.mouse(document.body);
						var offX = coord[0] - downCoord[0];
						var offY = coord[1] - downCoord[1];

						viewport.container.node().scrollLeft = downScroll[0] - offX;
						viewport.container.node().scrollTop = downScroll[1] - offY;
					})
					.on('mouseup', function() {
						var length = _endBP - _startBP + 1
						var newStart = parseInt(base.pxToBp(viewport.container.node().scrollLeft));

						base
							.setWindow(newStart, newStart + length)
							.update();

						d3.select(document.body)
							.on('mousemove',null)
							.on('mouseup',null);
					});
			})

		return base;
	}
}());