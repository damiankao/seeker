(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	introduction:
	Annotator is used to view annotations on series of sequence. It allows the user to
	input annotation data and manipulate the visualization.
	*/

	seeker.annotator = function() {
		var container = new seeker.element('div')
			.id('annotator');

		var canvas = new seeker.element('svg',true);
		canvas.attachTo(container);

		var _palette;
		var _settings = {
			'view':container,
			'svg':canvas,
			'annotator': {
				'margin':40,
				'seq_underSpacing':30,
				'legend_underSpacing':30,
				'legend_show':'top',
				'legend_xPos':0,
				'legend_width':620,
				'legend_height':40,
				'legend_cols':5,
				'seq_maxLength':900,
				'seq_scale':null
			},
			'sequence': {
				'seq_spineWidth':5,
				'seq_spineColor':'#9C9C9C',
				'seq_labelxPos':10,
				'seq_numbered':true
			},
			'feature': {
				'seq_featWidth':10,
			},
			'legend': {
				'legend_colorSize':15,
			}
		};
		seeker.util.attachModel(_settings.annotator);
		seeker.util.attachModel(_settings.sequence);
		seeker.util.attachModel(_settings.feature);
		seeker.util.attachModel(_settings.legend);

		var _allSeq;
		var _allFeat;

		var _groups = []
		var _legendGroups = []

		container.settings = _settings;

		container.data = function(d) {
			_allSeq = d['seq'];
			_allFeat = d['feat'];

			seeker.util.attachModel(_allSeq);
			seeker.util.attachModel(_allFeat);

			_allSeq.__onChange.push(container.updateSeq);
			_allFeat.__onChange.push(container.updateLegend);

			_settings.annotator.__onChange.push(container.updateSettings);
			_settings.sequence.__onChange.push(container.updateSettings);
			_settings.feature.__onChange.push(container.updateSettings);
			_settings.legend.__onChange.push(container.updateSettings);

			return container;
		}

		container.updateSeq = function() {
			//update sequence groups
			container.rescale();

			var f = function(obj) {
				obj
					.data(_allSeq, _allFeat, _settings)
					.update()
					.updateFeat();

				_allSeq[obj.index].__onChange.push(container.updateSeq);
			}

			seeker.util.updateCollectionDOM(_allSeq, _groups, seeker.annotator_sequence, canvas, f);

			var startY = _settings.annotator.margin + _settings.annotator.legend_height + _settings.annotator.legend_underSpacing;
			var startX = _settings.annotator.margin;

			if (_settings.annotator.legend_show == 'none' || _settings.annotator.legend_show == 'bottom') {
				startY = _settings.annotator.margin;
			}

			for ( var i = 0 ; i < _groups.length ; i++ ) {
				var g = _groups[i];
				if (_allSeq[i].show) {
					g.node.translate_x = startX;
					g.node.translate_y = startY;
					g
						.style('display','block')
						.attr('transform','translate(' + g.node.translate_x + ',' + g.node.translate_y + ')');
					startY += g.node.getBBox().height + _settings.annotator.seq_underSpacing;
				} else {
					g
						.style('display','none');
				}
			}

			canvas
				.style('height', startY);

			return container;

		}

		container.rescale = function() {
			_settings.annotator.seq_scale = d3.scale.linear()
			    .domain([0, d3.max(_allSeq,function(d) {return d['length'];})])
			    .range([0, _settings.annotator.seq_maxLength]);

			return container;
		}

		container.updateLegend = function() {
			//update legend

			var f = function(obj) {
				obj
					.data(_allFeat[obj.index], _settings);
			}

			seeker.util.updateCollectionDOM(_allFeat, _legendGroups, seeker.annotator_legend, canvas, f);

			for ( var i = 0 ; i < _legendGroups.length ; i++ ) {
				var g = _legendGroups[i];
				
			}

			var startY;
			var startX = _settings.annotator.margin;

			if (_settings.annotator.legend_show == 'none' || _settings.annotator.legend_show == 'bottom') {
				startY = _settings.annotator.margin + groupHeight * seeker.util.countArray(_allSeq,'show',true);
			} else {
				startY = _settings.annotator.margin;
			}

			return container;
		}

		container.updateSettings = function() {
			//update setting options panel
			container.updateSeq();
			container.updateLegend();

			return container;
		}

		return container;
	}

	seeker.annotator_sequence = function() {
		var group = new seeker.element('g',true);
		var label = new seeker.element('text',true);
		var spine = new seeker.element('line',true)
			.style('shape-rendering','crispEdges');

		label.attachTo(group);
		spine.attachTo(group);

		var _allSeq;
		var _allFeat;
		var _seq;
		var _settings;
		var _groups = [];

		group.data = function(d, f, s) {
			_allSeq = d;
			_allFeat = f;
			_seq = _allSeq[group.index];
			_settings = s;

			seeker.util.attachModel(_seq);
			seeker.util.attachModel(_seq['feat']);

			_seq.__onChange.push(group.update);
			_settings.sequence.__onChange.push(group.update);
			_seq['feat'].__onChange.push(group.updateFeat);

			return group
		}

		group.update = function() {
			//update label and spine
			_settings.view.rescale();

			label
				.textContent((group.index + 1) + '. ' + _seq['name'])
				.attr('x',_settings.sequence.seq_labelxPos)
				.attr('y',0)
				.style('font-weight','bold');

			spine
				.draw(0,40,_settings.annotator.seq_scale(_seq['length']),40)
				.style('stroke-width',_settings.sequence.seq_spineWidth)
				.style('stroke',_settings.sequence.seq_spineColor);

			return group;
		}

		group.updateFeat = function() {
			//update feature elements on sequence
			var f = function(obj) {
				obj
					.data(_seq['feat'][obj.index], _allFeat, _settings)
					.update();

				_seq['feat'][obj.index].__onChange.push(group.updateFeat);
			}

			seeker.util.updateCollectionDOM(_seq['feat'], _groups, seeker.annotator_feature, group, f);

			var levels = [];
			var xPos = 0;
			for ( var i = 0 ; i < _groups.length ; i++ ) {
				var g = _groups[i];
				var d = _seq['feat'][g.index]
				if (d.show) {
					g.node.translate_x = _settings.annotator.seq_scale(d['start']);
					g.node.translate_y = 0;
					g
						.attr('transform','translate(' + g.node.translate_x + ',' + g.node.translate_y + ')')
						.style('display','block');

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
						.style('display','none');
				}
			}

			//_settings.annotator.__set('max_level',levels.length);

			return group;
		}

		return group;
	}

	seeker.annotator_feature = function() {
		var group = new seeker.element('g',true);
		var label = new seeker.element('text',true);
		var feat = new seeker.element('line',true)
			.style('shape-rendering','crispEdges');

		label
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
					var currentCoord = group.mouseCoord(evt);

					label
						.attr('x',currentCoord[0] - downCoord[0])
						.attr('y',currentCoord[1] - downCoord[1]);
				}

				document.body.onmouseup = function(evt) {
					document.body.onmousemove = null;
					document.body.onmouseup = null;
				}
			})

		feat
			.on('mouseover', function(evt) {
				document.body.style.cursor = 'pointer';
				feat
					.draw(-4,40,_settings.annotator.seq_scale(_feat['end'] - _feat['start'] + 5),40)
					.style('stroke-width',_settings.feature.seq_featWidth + 4);
			})
			.on('mouseout', function(evt) {
				document.body.style.cursor = 'default';
				feat
					.draw(0,40,_settings.annotator.seq_scale(_feat['end'] - _feat['start'] + 1),40)
					.style('stroke-width',_settings.feature.seq_featWidth);
			})

		label.attachTo(group);
		feat.attachTo(group);

		var _feat;
		var _allFeat;
		var _settings;

		var _level;

		group.data = function(d, f, s) {
			_feat = d;
			_allFeat = f;
			_settings = s;

			seeker.util.attachModel(_feat);
			seeker.util.attachModel(_settings.feature);
			seeker.util.attachModel(_feat['ref']);

			_feat['ref'].__onChange.push(group.update);
			_feat.__onChange.push(group.update);
			_settings.feature.__onChange.push(group.update);

			return group;
		}

		group.setLevel = function(val) {
			_level = val;

			return group;
		}

		group.update = function() {
			//update indivdual feature on sequence
			var featureLength = _settings.annotator.seq_scale(_feat['end'] - _feat['start'] + 1);

			feat
				.draw(0,40,featureLength,40)
				.style('stroke-width',_settings.feature.seq_featWidth)
				.style('stroke',_feat['ref']['color']);

			if (_feat.label) {
				label
					.textContent(_feat['ref']['name'])
					.attr('x',featureLength / 2 - parseInt(label.node.getBBox().width) / 2)
					.style('font-size','8pt')
					.style('display','block');

				if (_level == 0) {
					label
						.attr('y',27);
				} else {
					var startY = 40 + _settings.feature.seq_featWidth / 2;
					label
						.attr('y',_level * 15 + startY);
				}
			} else {
				label
					.style('display','none');
			}

			return group;
		}

		group.getLabelEndpoint = function() {
			return parseInt(label.node.getAttribute('x')) + parseInt(label.node.getBBox().width) + label.node.parentNode.translate_x;
		}

		group.getLabelStartpoint = function() {
			return parseInt(label.node.getAttribute('x')) + label.node.parentNode.translate_x;
		}

		return group;
	}

	seeker.annotator_legend = function() {
		var group = new seeker.element('g',true);

		var _feat;
		var _settings;

		group.data = function(d, s) {
			_feat = d;
			_settings = s;

			seeker.util.attachModel(_feat);
			seeker.util.attachModel(_settings.legend);

			_feat.__onChange.push(group.update);
			_settings.legend.__onChange.push(group.update);

			return group;
		}

		group.update = function() {


			return group;
		}

		return group;
	}
})();
