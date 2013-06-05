(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	introduction:
	Annotator is used to view annotations on series of sequence. It allows the user to
	input annotation data and manipulate the visualization.

	data:
	The bound data is:
	obj = {
		'seq':[
			{
				'name':'',
				'visible':true,
				'circular':false,
				'length':100,
				'feat':[
					'name':'',
					'start':1,
					'end':100,
					'visible':true,
					'label':true
				]
			}
		],
		'feat':[
			{
				'name':'',
				'color':'',
				'legend':true,
				'count':1
			}
		]
	}
	*/

	seeker.annotator = function() {
		var container = new seeker.element('div');
		var canvas = new seeker.svgElement('svg');
		container.append(canvas);

		var _palette;
		var _settings = {
			'annotator': {
				'margin':40,
				'seq_underSpacing':10,
				'legend_underSpacing':30,
				'legend_show':'top',
				'legend_xPos':0,
				'legend_width':620,
				'legend_height':40,
				'legend_cols':5,
				'seq_maxLength':0,
			},
			'sequence': {
				'seq_spineWidth':5,
				'seq_spineColor':'#9C9C9C',
				'seq_LabelxPos':10,
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

		var _seq;
		var _feat;

		var _groups = []
		var _legendGroups = []

		container.data = function(d) {
			_seq = d['seq'];
			_feat = d['feat'];

			seeker.util.attachModel(_seq);
			seeker.util.attachModel(_feat);

			_seq.__onChange.push(container.updateSeq);
			_feat.__onChange.push(container.updateLegend);

			_settings.annotator.__onChange.push(container.updateSettings);
			_settings.sequence.__onChange.push(container.updateSettings);
			_settings.feature.__onChange.push(container.updateSettings);
			_settings.legend.__onChange.push(container.updateSettings);

			return container;
		}

		container.updateSeq = function() {
			//update sequence groups

			var f = function(obj) {
				obj
					.data(_seq[obj.index], _feat, _settings)
					.update()
					.updateFeat();
			}

			seeker.util.updateCollectionDOM(_seq, _groups, seeker.annotator_sequence, canvas, f);

			var startY;
			var startX = _settings.annotator.margin;
			var groupHeight = _settings.feature.featWidth + _settings.annotator.seq_underSpacing + 40;

			if (_settings.annotator.legend_show == 'none' || _settings.annotator.legend_show == 'bottom') {
				startY = _settings.annotator.margin;
			} else {
				startY = _settings.annotator.margin + _settings.annotator.legend_height + _settings.annotator.legened_underSpacing;
			}

			var a = 0;
			for ( var i = 0 ; i < _groups.length ; i++ ) {
				var g = _groups[i];
				if (_seq[i].show) {
					g
						.setStyle('display','block')
						.setAttr('transform','translate(' + startX + ',' + (startY + groupHeight * a++) + ')');
				} else {
					g
						.setStyle('display','none');
				}
			}

			return container;

		}

		container.updateLegend = function() {
			//update legend

			var f = function(obj) {
				obj
					.data(_feat[obj.index], _settings);
			}

			seeker.util.updateCollectionDOM(_feat, _legendGroups, seeker.annotator_legend, canvas, f);

			for ( var i = 0 ; i < _legendGroups.length ; i++ ) {
				var g = _legendGroups[i];
				
			}

			var startY;
			var startX = _settings.annotator.margin;

			if (_settings.annotator.legend_show == 'none' || _settings.annotator.legend_show == 'bottom') {
				startY = _settings.annotator.margin + groupHeight * seeker.util.countArray(_seq,'show',true);
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
		var group = new seeker.svgElement('group');
		var label = document.createElement('text');
		var spine = document.createElement('line');

		group.appendChild(label);
		group.appendChild(spine);

		var _seq;
		var _feat;
		var _settings;
		var _groups = [];

		group.data = function(d, f, s) {
			_seq = d;
			_feat = f;
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

			return group;
		}

		group.updateFeat = function() {
			//update feature elements on sequence

			var f = function(obj) {
				obj
					.data(_seq['feat'][obj.index], _feat, _settings)
					.update();
			}

			seeker.util.updateCollectionDOM(_seq['feat'], _groups, seeker.annotator_feature, group, f);

			return group;
		}

		return group;
	}

	seeker.annotator_feature = function() {
		var group = new seeker.svgElement('group');
		var label = new seeker.svgElement('text');
		var feat = new seeker.svgElement('line');

		group.appendChild(label);
		group.appendChild(feat);

		var _seqFeat;
		var _feat;
		var _settings;

		group.data = function(d, f, s) {
			_seqFeat = d;
			_feat = f;
			_settings = s;

			seeker.util.attachModel(_seqFeat);
			seeker.util.attachModel(_settings.feature);

			_seqFeat.__onChange.push(group.update);
			_feat.__onChange.push(group.update);
			_settings.feature.__onChange.push(group.update);

			return group;
		}

		group.update = function() {
			//update indivdual feature on sequence


			return group;
		}

		return group;
	}

	seeker.annotator_legend = function() {
		var group = new seeker.svgElement('group');

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


			return container;
		}

		return group;
	}
})();
