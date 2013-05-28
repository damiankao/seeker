(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	introduction:
	Annotator is used to view annotations on series of sequence. It allows the user to
	input annotation data and manipulate the visualization.

	data structures:
	sequence name, start, end, feature type, feature description(optional)
	feature type, counts, feature description(optional)
	sequence name, sequence length, sequence description(optional), sequence(optional)

	application data:
	selection list - list of selections
	shorten inter-feature threshold - shorten long inter-feature distances with a break point

	legend width
	legend height
	legened top - put legend above sequences or below
	legened left margin - left margin for the legend
	legened square size - size of the colored square
	legend cols - number of columns for legend
	legend spacing - spacing between legend and sequences

	alignment - align all sequences by start/end of feature type (when exist)
	spine thickness - thickness of the spine in pixels
	feature thickness - thickness of the feature in pixels
	sequence spacing - spacing between displayed sequence/features

	menu items:
	input - user data input. tab/comma delimited, file upload. Allow re-ordering of sequences.
	features - list of feature types with show/hide and color options. list of pinned features.
	selection - list of sequence feature selections or custom selections. allows for sequence extraction.
	options - options for feature display, shorten inter-feature, legend, alignment
	*/

	seeker.annotator = function() {
		//container and canvas
		var container = new seeker.container();
		container
			.style('overflow','auto')

		container.node.className = 'annotator';

		var canvas = d3
			.select(container.node)
			.append('svg')
			.style('position','absolute');

		//context menus
		var menu_seq = new seeker.menu();
		var menu_feature = new seeker.menu();
		var menu_legend = new seeker.menu();

		menu_feature.addItem('show all', function() {
			container.showFeatureType(_mouseOver[1]['featType']);
			container.update();
			menu_feature.style.display = 'none';
		}, function() {
			container.status('show all ' + _data['featureType'][_mouseOver[1]['featType']]['name'] + " features");
		}, function() {
			container.statusHide();
		});
		menu_feature.addItem('hide all', function() {
			container.hideFeatureType(_mouseOver[1]['featType']);
			container.update();
			menu_feature.style.display = 'none';
		}, function() {
			container.status('hide all ' + _data['featureType'][_mouseOver[1]['featType']]['name'] + " features");
		}, function() {
			container.statusHide();
		});
		menu_feature.addItem('hide feature', function() {
			_mouseOver[1]['show'] = false;
			container.update();
			menu_feature.style.display = 'none';
		}, function() {
			container.status('hide this feature');
		}, function() {
			container.statusHide();
		});

		menu_seq.addItem('hide sequence',function() {
			container.hideSequence(_mouseOver[1]['name']);
			container.update();
			menu_seq.style.display = 'none';
		}, function() {
			container.status('hide this sequence');
		}, function() {
			container.statusHide();
		});
		menu_seq.addItem('show all features',function() {
			var f = _mouseOver[1]['feats'];
			var len = f.length;
			for ( var i = 0 ; i < len ; i ++ ) {
				f[i]['show'] = true;
			}
			container.update();
			menu_seq.style.display = 'none';
		}, function() {
			container.status('show all feautures on this sequence');
		}, function() {
			container.statusHide();
		});
		menu_seq.addItem('hide all features',function() {
			var f = _mouseOver[1]['feats'];
			var len = f.length;
			for ( var i = 0 ; i < len ; i ++ ) {
				f[i]['show'] = false;
			}
			container.update();
			menu_seq.style.display = 'none';
		}, function() {
			container.status('hide all features on this sequence');
		}, function() {
			container.statusHide();
		});

		menu_legend.addItem('show all', function() {
			container.showFeatureType(_mouseOver[1]);
			container.update();
			menu_legend.style.display = 'none';
		}, function() {
			container.status('show all ' + _data['featureType'][_mouseOver[1]]['name'] + " features");
		}, function() {
			container.statusHide();
		});
		menu_legend.addItem('hide all', function() {
			container.hideFeatureType(_mouseOver[1]);
			container.update();
			menu_legend.style.display = 'none';
		}, function() {
			container.status('hide all ' + _data['featureType'][_mouseOver[1]]['name'] + " features");
		}, function() {
			container.statusHide();
		});

		menu_feature.style.display = 'none';
		menu_seq.style.display = 'none';
		menu_legend.style.display = 'none';

		//status if exists
		var status_env;
		container.status = function(val) {
			if (status_env) {
				status_env.layout(val);
			}
		}

		container.statusHide = function() {
			if (status_env) {
				status_env.style.display = 'none';
			}
		}

		container.setStatus = function(obj) {
			status_env = obj
		}

		//data
		var _mouseOver = [];
		var groups;
		var _palette = ['#F2E479','#622C7A','#2C337A','#2C7A69','#337A2C','#7A5C2C','#9E2121','#A8DEFF','#FC7632','#B3E8A0'];
		var _data_application = {
			"currentSelection":[],
			"interFeat":-1,

			"legendX":70,
			"legendWidth":700,
			"legendHeight":60,
			"legendCols":5,
			"legendSpacing":10,
			"legendSize":20,
			"legendTop":true,

			"align":[-1,'s'],          //-1 indicates align by start/end of entire sequence
			                           //First element number refer to the featureType array index
			"spineWidth":8,            //width of the spine
			"spineColor":'#9C9C9C',
			"featWidth":12,            //width of the features on the spine
			"seqLength":900,           //length of the entire sequence
			"seqSpacing":20,           //spacing between each sequence
			"menuSpacing":0,
			"margin":20,               //margins of the canvas element
			"selected":[]              //selected elements. [name, sequence index, start, end, description]
		};

		var _data = {'seqs': [{'name': 'Trr1_Schmidtea_mediterranea', 'seq': -1, 'show': true, 'len': 951, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 821, 'end': 925, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 639, 'end': 724, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 578, 'end': 633, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1B_Schistosoma_mansoni', 'seq': -1, 'show': true, 'len': 1789, 'descr': 'NA', 'feats': [{'featType': 0, 'start': 89, 'end': 153, 'descr': 'NA', 'show': true}]}, {'name': 'Mll1/2_Schmidtea_mediterranea', 'seq': -1, 'show': true, 'len': 2685, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 2558, 'end': 2662, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 2390, 'end': 2456, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1900, 'end': 1949, 'descr': 'NA', 'show': true}]}, {'name': 'Set1_Drosophila_melanogaster', 'seq': -1, 'show': true, 'len': 1641, 'descr': 'NA', 'feats': [{'featType': 5, 'start': 1334, 'end': 1492, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 1514, 'end': 1618, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 104, 'end': 172, 'descr': 'NA', 'show': true}]}, {'name': 'MLL2_Danio_rerio', 'seq': -1, 'show': true, 'len': 4967, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 218, 'end': 265, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 265, 'end': 312, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 822, 'end': 871, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 872, 'end': 920, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 950, 'end': 1001, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 4666, 'end': 4753, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 4838, 'end': 4942, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 4610, 'end': 4662, 'descr': 'NA', 'show': true}]}, {'name': 'TRX_Drosophila_melanogaster', 'seq': -1, 'show': true, 'len': 3726, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 3599, 'end': 3703, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 3387, 'end': 3472, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1889, 'end': 1938, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1423, 'end': 1481, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1_Schmidtea_mediterranea', 'seq': -1, 'show': true, 'len': 390, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 263, 'end': 367, 'descr': 'NA', 'show': true}, {'featType': 5, 'start': 134, 'end': 234, 'descr': 'NA', 'show': true}]}, {'name': 'MLL5_Clonorchis_sinensis', 'seq': -1, 'show': true, 'len': 892, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 652, 'end': 763, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 728, 'end': 780, 'descr': 'NA', 'show': true}]}, {'name': 'MLL1_Homo_sapiens', 'seq': -1, 'show': true, 'len': 3969, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 3840, 'end': 3944, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 3667, 'end': 3749, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1481, 'end': 1532, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1568, 'end': 1626, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2023, 'end': 2072, 'descr': 'NA', 'show': true}, {'featType': 3, 'start': 1148, 'end': 1194, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1A_Homo_sapiens', 'seq': -1, 'show': true, 'len': 1707, 'descr': 'NA', 'feats': [{'featType': 5, 'start': 1418, 'end': 1558, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 1580, 'end': 1684, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 101, 'end': 165, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1B_Clonorchis_sinensis', 'seq': -1, 'show': true, 'len': 1685, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1558, 'end': 1662, 'descr': 'NA', 'show': true}]}, {'name': 'MLL5_Danio_rerio', 'seq': -1, 'show': true, 'len': 1265, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 344, 'end': 445, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 129, 'end': 174, 'descr': 'NA', 'show': true}]}, {'name': 'SET1_Schizosaccharomyces_pombe', 'seq': -1, 'show': true, 'len': 920, 'descr': 'NA', 'feats': [{'featType': 5, 'start': 630, 'end': 771, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 794, 'end': 897, 'descr': 'NA', 'show': true}, {'featType': 7, 'start': 279, 'end': 343, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 96, 'end': 172, 'descr': 'NA', 'show': true}]}, {'name': 'Trr1_Echinococcus_multilocularis', 'seq': -1, 'show': true, 'len': 1638, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1509, 'end': 1613, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 1309, 'end': 1394, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1250, 'end': 1304, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1B_Echinococcus_multilocularis', 'seq': -1, 'show': true, 'len': 1617, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1490, 'end': 1594, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 2, 'end': 51, 'descr': 'NA', 'show': true}]}, {'name': 'MLL5_Echinococcus_multilocularis', 'seq': -1, 'show': true, 'len': 1840, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 614, 'end': 728, 'descr': 'NA', 'show': true}]}, {'name': 'MLL3_Echinococcus_multilocularis', 'seq': -1, 'show': true, 'len': 3003, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 195, 'end': 244, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 244, 'end': 290, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 831, 'end': 878, 'descr': 'NA', 'show': true}]}, {'name': 'MLL1_Schistosoma_mansoni', 'seq': -1, 'show': true, 'len': 3002, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 2875, 'end': 2979, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2213, 'end': 2243, 'descr': 'NA', 'show': true}]}, {'name': 'MLL1_Danio_rerio', 'seq': -1, 'show': true, 'len': 4219, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 4090, 'end': 4194, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 3917, 'end': 3999, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2218, 'end': 2267, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1675, 'end': 1726, 'descr': 'NA', 'show': true}, {'featType': 3, 'start': 1313, 'end': 1359, 'descr': 'NA', 'show': true}]}, {'name': 'Trr2_Clonorchis_sinensis', 'seq': -1, 'show': true, 'len': 1443, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1313, 'end': 1417, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 1129, 'end': 1214, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1057, 'end': 1111, 'descr': 'NA', 'show': true}]}, {'name': 'lost_PHDs_of_trr_Schmidtea_mediterranea', 'seq': -1, 'show': true, 'len': 3551, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 334, 'end': 384, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 384, 'end': 430, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 827, 'end': 874, 'descr': 'NA', 'show': true}]}, {'name': 'Mll5-2_Schmidtea_mediterranea', 'seq': -1, 'show': true, 'len': 937, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 583, 'end': 658, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1B-A_Danio_rerio', 'seq': -1, 'show': true, 'len': 1844, 'descr': 'NA', 'feats': [{'featType': 5, 'start': 1549, 'end': 1695, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 1717, 'end': 1821, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 145, 'end': 209, 'descr': 'NA', 'show': true}]}, {'name': 'Trr2_Schmidtea_mediterranea', 'seq': -1, 'show': true, 'len': 1336, 'descr': 'NA', 'feats': [{'featType': 8, 'start': 1026, 'end': 1110, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 1206, 'end': 1310, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 967, 'end': 1021, 'descr': 'NA', 'show': true}]}, {'name': 'MLL3_Danio_rerio', 'seq': -1, 'show': true, 'len': 3915, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 3786, 'end': 3890, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 3615, 'end': 3701, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 20, 'end': 70, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 70, 'end': 116, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 147, 'end': 198, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 3558, 'end': 3610, 'descr': 'NA', 'show': true}]}, {'name': 'SET-16_Caenorhabditis_elegans', 'seq': -1, 'show': true, 'len': 2475, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 2343, 'end': 2450, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 2109, 'end': 2194, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2053, 'end': 2104, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 427, 'end': 479, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 479, 'end': 527, 'descr': 'NA', 'show': true}]}, {'name': 'MLL5_Homo_sapiens', 'seq': -1, 'show': true, 'len': 1858, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 346, 'end': 444, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 120, 'end': 165, 'descr': 'NA', 'show': true}]}, {'name': 'Trr1_Clonorchis_sinensis', 'seq': -1, 'show': true, 'len': 1763, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1634, 'end': 1739, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 1452, 'end': 1538, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1394, 'end': 1448, 'descr': 'NA', 'show': true}]}, {'name': 'MLL5_Capitella_telata', 'seq': -1, 'show': true, 'len': 1731, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 327, 'end': 372, 'descr': 'NA', 'show': true}]}, {'name': 'MLL2_Homo_sapiens', 'seq': -1, 'show': true, 'len': 5537, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 275, 'end': 322, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1379, 'end': 1428, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1429, 'end': 1476, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 5408, 'end': 5512, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 5237, 'end': 5323, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 5180, 'end': 5232, 'descr': 'NA', 'show': true}]}, {'name': 'Trr2_Echinococcus_multilocularis', 'seq': -1, 'show': true, 'len': 1327, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1197, 'end': 1301, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 992, 'end': 1079, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 914, 'end': 970, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1B_Homo_sapiens', 'seq': -1, 'show': true, 'len': 1923, 'descr': 'NA', 'feats': [{'featType': 5, 'start': 1629, 'end': 1774, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 1796, 'end': 1900, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 110, 'end': 174, 'descr': 'NA', 'show': true}]}, {'name': 'SET-2_Caenorhabditis_elegans', 'seq': -1, 'show': true, 'len': 1507, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1379, 'end': 1484, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 132, 'end': 190, 'descr': 'NA', 'show': true}]}, {'name': 'MLL1_capitella_teleta', 'seq': -1, 'show': true, 'len': 2487, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 2360, 'end': 2464, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 2185, 'end': 2265, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1419, 'end': 1467, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 971, 'end': 1029, 'descr': 'NA', 'show': true}, {'featType': 3, 'start': 686, 'end': 729, 'descr': 'NA', 'show': true}]}, {'name': 'lost_PHDs_of_Trr_Clonorchis_sinensis', 'seq': -1, 'show': true, 'len': 3518, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 41, 'end': 90, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 90, 'end': 136, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 559, 'end': 606, 'descr': 'NA', 'show': true}, {'featType': 6, 'start': 3303, 'end': 3375, 'descr': 'NA', 'show': true}, {'featType': 6, 'start': 3408, 'end': 3499, 'descr': 'NA', 'show': true}]}, {'name': 'TRR_Drosophila_melanogaster', 'seq': -1, 'show': true, 'len': 2431, 'descr': 'NA', 'feats': [{'featType': 8, 'start': 2123, 'end': 2211, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 2302, 'end': 2406, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2066, 'end': 2119, 'descr': 'NA', 'show': true}]}, {'name': 'MLL4_Homo_sapiens', 'seq': -1, 'show': true, 'len': 2715, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 2586, 'end': 2690, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 2412, 'end': 2494, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1251, 'end': 1302, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1337, 'end': 1394, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1732, 'end': 1782, 'descr': 'NA', 'show': true}, {'featType': 3, 'start': 960, 'end': 1005, 'descr': 'NA', 'show': true}]}, {'name': 'Trr_Schistosoma_mansoni', 'seq': -1, 'show': true, 'len': 1560, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1431, 'end': 1536, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 1241, 'end': 1326, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1182, 'end': 1238, 'descr': 'NA', 'show': true}]}, {'name': 'lost_PHDs_of_Trr_Schistosoma_mansoni', 'seq': -1, 'show': true, 'len': 1074, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 313, 'end': 362, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 362, 'end': 408, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 820, 'end': 866, 'descr': 'NA', 'show': true}]}, {'name': 'MLL4_Danio_rerio', 'seq': -1, 'show': true, 'len': 3772, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 3643, 'end': 3747, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 3469, 'end': 3551, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1654, 'end': 1701, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1702, 'end': 1752, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2231, 'end': 2280, 'descr': 'NA', 'show': true}, {'featType': 3, 'start': 1408, 'end': 1452, 'descr': 'NA', 'show': true}]}, {'name': 'Trr2_Capitella_teleta', 'seq': -1, 'show': true, 'len': 844, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 715, 'end': 819, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 540, 'end': 627, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 482, 'end': 536, 'descr': 'NA', 'show': true}]}, {'name': 'lost_PHDs_of_trr_Drosophila_melanogaster', 'seq': -1, 'show': true, 'len': 1482, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 206, 'end': 253, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 253, 'end': 300, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 530, 'end': 580, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 580, 'end': 626, 'descr': 'NA', 'show': true}]}, {'name': 'MLL1_Echinococcus_multilocularis', 'seq': -1, 'show': true, 'len': 3018, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 2892, 'end': 2995, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 2662, 'end': 2727, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2102, 'end': 2157, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1_Capitella_teleta', 'seq': -1, 'show': true, 'len': 388, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 261, 'end': 365, 'descr': 'NA', 'show': true}, {'featType': 5, 'start': 97, 'end': 228, 'descr': 'NA', 'show': true}]}, {'name': 'MLL3_Homo_sapiens', 'seq': -1, 'show': true, 'len': 4911, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 390, 'end': 437, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 959, 'end': 1009, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1009, 'end': 1055, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 4782, 'end': 4886, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 4606, 'end': 4693, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 4550, 'end': 4602, 'descr': 'NA', 'show': true}]}, {'name': 'lost_PHDs_of_Trr_Capitella_telata', 'seq': -1, 'show': true, 'len': 4211, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 428, 'end': 475, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 476, 'end': 523, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 863, 'end': 909, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 940, 'end': 992, 'descr': 'NA', 'show': true}]}], 'featureType': [{'count': 8, 'color': '#F2E479', 'name': 'RRM_1', 'descr': 'NA'}, {'count': 39, 'color': '#622C7A', 'name': 'SET', 'descr': 'NA'}, {'count': 48, 'color': '#2C337A', 'name': 'PHD', 'descr': 'NA'}, {'count': 5, 'color': '#2C7A69', 'name': 'zf-CXXC', 'descr': 'NA'}, {'count': 23, 'color': '#337A2C', 'name': 'FYRN', 'descr': 'NA'}, {'count': 7, 'color': '#7A5C2C', 'name': 'N-SET', 'descr': 'NA'}, {'count': 2, 'color': '#9E2121', 'name': 'Cadherin', 'descr': 'NA'}, {'count': 1, 'color': '#A8DEFF', 'name': 'SET_assoc', 'descr': 'NA'}, {'count': 22, 'color': '#FC7632', 'name': 'FYRC', 'descr': 'NA'}]};

		container.settings = _data_application;

		//methods
		container.layout = function() {
			if (arguments.length == 4) {
				container.whxy(
					arguments[0],
					arguments[1],
					arguments[2],
					arguments[3]);
			}

			var w = parseInt(container.node.style.width);
			var h = parseInt(container.node.style.height);

			return this;
		}

		container.parse = function(raw, delimiter) {

		}

		container.numberShownSeqs = function() {
			var count = 0
			var seqs = _data.seqs;
			var seqLen = _data['seqs'].length;
			for ( var i = 0; i < seqLen; i++ ) {
				if (seqs[i]['show'] == true) {
					count += 1;
				}
			}

			return count;
		}

		container.maxSeqLength = function() {
			var maxLen = 0
			var seqs = _data.seqs;
			var seqLen = _data['seqs'].length;
			for ( var i = 0; i < seqLen; i++ ) {
				if (seqs[i]['len'] > maxLen) {
					maxLen = seqs[i]['len']
				}
			}

			return maxLen;
		}

		container.initialize = function() {
			canvas.remove();
			canvas = d3
				.select(container.node)
				.append('svg')
				.style('position','absolute')
				.style('top',_data_application['menuSpacing'])
				.style('left',0);

			canvas
				.selectAll('groups')
				.data(_data['seqs'])
				.enter()
				.append('g')
				.attr('id','seqGroups');

			canvas
				.selectAll('#seqGroups')
				.append('rect')
				.attr('id','seqSpines');

			canvas
				.selectAll('#seqGroups')
				.append('text')
				.attr('id','seqLabels')
				.on('mouseover', function(d,i) {
					var str = d['name'] + ': ' + d['len'] + " bp, " + d['feats'].length + " features";
					container.status(str);
				})
				.on('mouseout', function(d,i) {
					container.statusHide();
				})
				.on('click', function(d,i) {
					d3.event.stopPropagation();
					seeker.env_closeMenus();
					_mouseOver = [0,d];
					positionMenu(d3.mouse(document.body));
				});

			canvas
				.selectAll('#damiankao')

			canvas
				.selectAll('#seqGroups')
				.selectAll('features')
				.data(function(d,i) {
					return d['feats'];
				})
				.enter()
				.append('rect')
				.attr('id','seqFeatures')
				.on('mouseout',function() {
					d3.select(this).style('stroke-width','0px');
					document.body.style.cursor = 'default';
					container.statusHide();
				})
				.on('click', function(d,i) {
					d3.event.stopPropagation();
					seeker.env_closeMenus();
					_mouseOver = [1,d];
					positionMenu(d3.mouse(document.body));
				});

			var rows = [];
			for (var i = 0 ; i < _data['featureType'].length ; i += _data_application['legendCols'] ) {
				rows.push(_data['featureType'].slice(i,i+_data_application['legendCols']));
			}
			
			canvas
				.selectAll('legendRows')
				.data(rows)
				.enter()
				.append('g')
				.attr('id','legendRows')
					.selectAll('legendCols')
					.data(function(d,i) {
						return d;
					})
					.enter()
					.append('g')
					.attr('id','legendCols');

			canvas
				.selectAll('#legendCols')
				.append('rect')
				.attr('id','legendColsRect');

			canvas
				.selectAll('#legendCols')
				.append('text')
				.attr('id','legendColsText')
				.on('mouseover', function(d,i) {
					var str = d['name'] + ': ' + d['count'] + ' features total';
					container.status(str);
				})
				.on('mouseout', function(d,i) {
					container.statusHide();
				})
				.on('click', function(d,i) {
					d3.event.stopPropagation();
					seeker.env_closeMenus();
					_mouseOver = [2,i];
					positionMenu(d3.mouse(document.body));
				});;


			return this;
		}

		container.update = function() {
			var width = _data_application['seqLength'] + (_data_application['margin'] * 2);
			var featureHeight = this.numberShownSeqs() * (_data_application['featWidth'] + _data_application['seqSpacing'] + 30) - _data_application['seqSpacing'] + (_data_application['margin'] * 2);
			var height = featureHeight + _data_application['legendHeight'] + _data_application['legendSpacing'];

			canvas
				.style('width',width)
				.style('height',height);

			var index = 0;
			canvas
				.selectAll('#seqGroups')
				.attr('transform',function(d) {
					if (d['show'] == true) {
						if (_data_application['legendTop']) {
							return 'translate(' + _data_application['margin'] + ',' + ((30 + _data_application['featWidth'] + _data_application['seqSpacing']) * index++ + _data_application['margin'] + _data_application['legendHeight'] + _data_application['legendSpacing']) + ")";
						} else {
        					return 'translate(' + _data_application['margin'] + ',' + ((30 + _data_application['featWidth'] + _data_application['seqSpacing']) * index++ + _data_application['margin']) + ")";
        				}
        			}
      			})
      			.style('display',function(d) {
      				if (d['show'] == false) {
        				return 'none';
        			} else {
        				return 'block';
        			}
      			});

      		var scale = d3.scale.linear()
			    .domain([0, this.maxSeqLength()])
			    .range([0, _data_application['seqLength']]);

			canvas
				.selectAll('#seqSpines')
				.attr('width', function(d,i) {
					return scale(d['len']);
				})
				.attr('height',_data_application['spineWidth'])
				.attr('x',0)
				.attr('y',function(d,i) {
					return 25 + (_data_application['featWidth'] / 2) - (_data_application['spineWidth'] / 2);
				})
				.style('fill',_data_application['spineColor']);

			canvas
				.selectAll('#seqLabels')
				.attr('x',25)
				.attr('y',10)
				.text(function(d) {
					return d['name']
				});

			canvas
				.selectAll('#seqFeatures')
				.attr('width', function(d,i) {
					return scale(d['end'] - d['start'] + 1);
				})
				.attr('height',_data_application['featWidth'])
				.attr('x', function(d,i) {
					return scale(d['start']);
				})
				.attr('y',25)
				.style('fill',function(d,i) {
					return _data['featureType'][d['featType']]['color'];
				})
				.style('display', function(d) {
					if (d['show'] == true) {
						return 'block';
					} else {
						return 'none';
					}
				})
				.on('mouseover',function(d,i) {
					var str = _data['featureType'][d['featType']]['name'] + ": " + d['start'] + " - " + d['end'] + ' (' + (d['end'] - d['start'] + 1) + "bp)";
					container.status(str);
					d3.select(this).style('stroke-width','4px');
					d3.select(this).style('stroke',_data['featureType'][d['featType']]['color']);
					document.body.style.cursor = 'hand';
				});

			var rows = Math.ceil(_data['featureType'].length / _data_application['legendCols']);
			var legendRowHeight = _data_application['legendHeight'] / rows;
			var legendColWidth = _data_application['legendWidth'] / _data_application['legendCols'];

			canvas
				.selectAll('#legendRows')
				.attr('transform', function(d,i) {
					if (_data_application['legendTop']) {
						return 'translate(' + (_data_application['margin'] + _data_application['legendX']) + ',' + (i * legendRowHeight) + ")";	
					} else {
						return 'translate(' + (_data_application['margin'] + _data_application['legendX']) + ',' + (featureHeight + _data_application['legendSpacing'] + (i * legendRowHeight)) + ")";	
					}
				});

			canvas
				.selectAll('#legendRows')
				.selectAll('#legendCols')
				.attr('transform', function(d,i) {
					return 'translate(' + (legendColWidth * i) + ",0)";
				});

			canvas
				.selectAll("#legendColsRect")
				.attr("width",_data_application['legendSize'])
				.attr('height',_data_application['legendSize'])
				.attr('x',0)
				.attr('y',0)
				.attr('fill',function(d,i) {
					return d['color'];
				});

			canvas
				.selectAll('#legendColsText')
				.text(function(d,i) {
					return d['name'];
				})
				.attr('x',_data_application['legendSize'] + 5)
				.attr('y',_data_application['legendSize'] / 2 + 4);

			return this;
		}

		function positionMenu(coord) {
			if (_mouseOver[0] == 0) {
				menu_seq.style.display = 'inline-block';
				menu_seq.place(coord);
			} else if (_mouseOver[0] == 1) {
				menu_feature.style.display = 'inline-block';
				menu_feature.place(coord);
			} else {
				menu_legend.style.display = 'inline-block';
				menu_legend.place(coord);
			}
		}

		container.extract = function() {

		}

		//manipulate data structure
		container.hideFeatureType = function(featIndex) {
			var seqs = _data.seqs;
			var seqLen = _data['seqs'].length;
			for ( var i = 0; i < seqLen; i++ ) {
				var featLen = seqs[i]['feats'].length
				for ( var j = 0 ; j < featLen ; j++ ) {
					if (seqs[i]['feats'][j]['featType'] == featIndex) {
						seqs[i]['feats'][j]['show'] = false;
					}
				}
			}

			return this;
		}

		container.showFeatureType = function(featIndex) {
			var seqs = _data.seqs;
			var seqLen = _data['seqs'].length;
			for ( var i = 0; i < seqLen; i++ ) {
				var featLen = seqs[i]['feats'].length
				for ( var j = 0 ; j < featLen ; j++ ) {
					if (seqs[i]['feats'][j]['featType'] == featIndex) {
						seqs[i]['feats'][j]['show'] = true;
					}
				}
			}

			return this;
		}

		container.showSequence = function(seqName) {
			var seqs = _data.seqs;
			var seqLen = _data['seqs'].length;
			for ( var i = 0; i < seqLen; i++ ) {
				if (seqs[i]['name'] == seqName) {
					seqs[i]['show'] = true;
				}
			}

			return this;
		}

		container.hideSequence = function(seqName) {
			var seqs = _data.seqs;
			var seqLen = _data['seqs'].length;
			for ( var i = 0; i < seqLen; i++ ) {
				if (seqs[i]['name'] == seqName) {
					seqs[i]['show'] = false;
				}
			}

			return this;
		}

		container.attachTo = function(obj) {
			obj.appendChild(container.node);
			obj.appendChild(menu_feature);
			obj.appendChild(menu_seq);
			obj.appendChild(menu_legend);

			return this;
		}

		//disassemble this element
		container.disassemble = function() {
			container.detach();
			menu_feature.detach();
			menu_seq.detach();
			canvas.remove();
		}

		if (!seeker.env_menus) {
			seeker.env_menus = [];

			seeker.env_closeMenus = function() {
				var num = seeker.env_menus.length;
				for ( var i = 0 ; i < num ; i++ ) {
					seeker.env_menus[i].style.display = 'none';
				}
			}	
		}
		seeker.env_menus.push(menu_feature);
		seeker.env_menus.push(menu_seq);
		seeker.env_menus.push(menu_legend);
		
		document.addEventListener('click',seeker.env_closeMenus);

		return container;
	}
})();