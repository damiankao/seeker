(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	data = {
		
	}

	*/
	seeker.browser = function() {
		var base = new seeker.base('div');

		base.features;
		base.dim_ref;
		base.dim_start;
		base.dim_end;

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
			}

			seeker.util.injectScript(path, postLoad);

			return base;
		}

		return base;
	}
}());