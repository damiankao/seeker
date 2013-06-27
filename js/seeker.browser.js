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
			.style('overflow','hidden');

		var canvas = new seeker.base('svg')
			.attachTo(viewport.container.node());

		var _ref;
		var _refLength;
		var _startBP;
		var _endBP;
		var _feats;

		base.features;
		base.dim_ref;
		base.dim_start;
		base.dim_end;
		base.lengths;

		base.setWindow = function(ref, start, end) {
			_ref = ref;
			_startBP = start;
			_endBP = end;
			_refLength = base.lengths[ref];

			return base;
		}

		base.update = function() {
			var dim = seeker.util.winDimensions();
			var length = _endBP - _startBP;
			var startBound = _startBP - length;
			var endBound = _endBP + length;
			if (startBound < 1) {
				startBound = 1;
			}

			if (endBound > _refLength) {
				endBound = _refLength;
			}

			base.dim_ref.filter(_ref);
			base.dim_end.filterFunction(function(d) {
				return d > startBound;
			})
			base.dim_start.filterFunction(function(d) {
				return d < endBound;
			})

			_feats = base.dim_ref.top(Infinity);

			viewport.container
				.style('width',dim[0])
				.style('height',dim[1] - 100);

			return base;
		}

		base.render = function() {
			if (_feats.length > 100) {
				//show feature density
			} else {
				//render each feature
			}

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
					var coordinates = [];

					var coords = cols[4].split(';');
					for ( a = 0 ; a < coords.length ; a++ ) {
						var c = coords[a].split(',')
						coordinates.push([parseInt(c[0]) + parseInt(cols[3]), parseInt(c[1])]);
					}

					feats.push({
					'name':name,
					'ref':ref,
					'strand':strand,
					'start':coordinates[0][0],
					'end':coordinates[coordinates.length - 1][0] + coordinates[coordinates.length - 1][1] - 1,
					'coords':coordinates
					});
				}
				
				base.features = crossfilter(feats);
				base.dim_ref = base.features.dimension(function(d) {return d.ref;});
				base.dim_start = base.features.dimension(function(d) {return d.start});
				base.dim_end = base.features.dimension(function(d) {return d.end});
				base.lengths = refLengths;
			}

			seeker.util.injectScript(path, postLoad);

			return base;
		}

		return base;
	}
}());