(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	introduction:
	Annotator is used to view annotations on series of sequence. It allows the user to
	input annotation data and manipulate the visualization.
	*/

	seeker.annotator = function() {
////////////////////////////////////////////////////////////////////////////////////////
/////// VIEW ELEMENTS //////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
		
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
			var feat = _data['featureType'][_mouseOver[1]];
			container.status('show all ' + feat['count'] + " " + feat['name'] + " features");
		}, function() {
			container.statusHide();
		});
		menu_legend.addItem('hide all', function() {
			container.hideFeatureType(_mouseOver[1]);
			container.update();
			menu_legend.style.display = 'none';
		}, function() {
			var feat = _data['featureType'][_mouseOver[1]];
			container.status('hide all ' + feat['count'] + " " + feat['name'] + " features");
		}, function() {
			container.statusHide();
		});
		menu_legend.addItem('hide legend', function() {
			_data['featureType'][_mouseOver[1]]['legend'] = false;
			container.update();
			menu_legend.style.display = 'none';
		}, function() {
			var feat = _data['featureType'][_mouseOver[1]];
			container.status('hide ' + feat['name'] + "'s legend");
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

		//color picker if exist
		var colorpicker_env;
		container.setColorpicker = function(obj) {
			colorpicker_env = obj;
			colorpicker_env.setCallback(function(a,b,c) {
				seeker.env_menuTarget.setAttribute('fill',a);
				_mouseOver[1]['color'] = a;
				container.update();
			});
		}

		//save as svg
		var panel_preview = new seeker.container();
		panel_preview.attachTo(document.body);
		panel_preview.d3()
			.append('div')
			.attr('id','annotator_preview')
			.style('border','1px solid #BABABA');

		var panel_text = new seeker.textNode(panel_preview.node, 'Right click on the below SVG image and choose "save image as" to save the image to your computer.',0,0);

		var panel_preview_close = new seeker.button(0);
		panel_preview_close
			.attachTo(panel_preview.node)
			.setText('close')
			.setClick(function() {
				panel_preview.node.style.display = 'none';
			});


////////////////////////////////////////////////////////////////////////////////////////
/////// DATA ///////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

		var _onUpdate = [];
		var _mouseOver = [];
		var _palette = ['#F2E479','#622C7A','#2C337A','#2C7A69','#337A2C','#7A5C2C','#9E2121','#A8DEFF','#FC7632','#B3E8A0'];
		var _data_application = {
			"currentSelection":[],     //selections that have been added
			"interFeat":-1,            //shorten inter-feature regions more than certain amount of length
			"legendX":0,               //left spacing of legend
			"legendWidth":620,         //width of legend
			"legendHeight":40,         //height of legend
			"legendCols":5,            //number of columns in legend
			"legendSpacing":30,        //spacing between legend and sequences
			"legendSize":15,           //size of squares in legend
			"legendTop":true,          //legend on top of the sequences or below
			"align":[-1,'s'],          //-1 indicates align by start/end of entire sequence. First element number refer to the featureType array index
			"spineWidth":5,            //width of the spine
			"spineColor":'#9C9C9C',    //color of the spine
			"featWidth":10,            //width of the features on the spine
			"seqLength":900,           //length of the entire sequence
			"seqSpacing":20,           //spacing between each sequence
			"seqLabelX":10,            //left spacing of each sequence label
			"seqNumbered":true,        //prefix each sequence by a number
			"margin":40,               //margins of the canvas element
			"selected":[]              //selected elements. [name, sequence index, start, end, description]
		};

		var _data = {'seqs': [{'name': 'Trr1 Schmidtea mediterranea', 'seq': -1, 'show': true, 'len': 951, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 821, 'end': 925, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 639, 'end': 724, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 578, 'end': 633, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1B Schistosoma mansoni', 'seq': -1, 'show': true, 'len': 1789, 'descr': 'NA', 'feats': [{'featType': 0, 'start': 89, 'end': 153, 'descr': 'NA', 'show': true}]}, {'name': 'Mll1/2 Schmidtea mediterranea', 'seq': -1, 'show': true, 'len': 2685, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 2558, 'end': 2662, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 2390, 'end': 2456, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1900, 'end': 1949, 'descr': 'NA', 'show': true}]}, {'name': 'Set1 Drosophila melanogaster', 'seq': -1, 'show': true, 'len': 1641, 'descr': 'NA', 'feats': [{'featType': 5, 'start': 1334, 'end': 1492, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 1514, 'end': 1618, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 104, 'end': 172, 'descr': 'NA', 'show': true}]}, {'name': 'MLL2 Danio rerio', 'seq': -1, 'show': true, 'len': 4967, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 218, 'end': 265, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 265, 'end': 312, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 822, 'end': 871, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 872, 'end': 920, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 950, 'end': 1001, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 4666, 'end': 4753, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 4838, 'end': 4942, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 4610, 'end': 4662, 'descr': 'NA', 'show': true}]}, {'name': 'TRX Drosophila melanogaster', 'seq': -1, 'show': true, 'len': 3726, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 3599, 'end': 3703, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 3387, 'end': 3472, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1889, 'end': 1938, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1423, 'end': 1481, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1 Schmidtea mediterranea', 'seq': -1, 'show': true, 'len': 390, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 263, 'end': 367, 'descr': 'NA', 'show': true}, {'featType': 5, 'start': 134, 'end': 234, 'descr': 'NA', 'show': true}]}, {'name': 'MLL5 Clonorchis sinensis', 'seq': -1, 'show': true, 'len': 892, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 652, 'end': 763, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 728, 'end': 780, 'descr': 'NA', 'show': true}]}, {'name': 'MLL1 Homo sapiens', 'seq': -1, 'show': true, 'len': 3969, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 3840, 'end': 3944, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 3667, 'end': 3749, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1481, 'end': 1532, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1568, 'end': 1626, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2023, 'end': 2072, 'descr': 'NA', 'show': true}, {'featType': 3, 'start': 1148, 'end': 1194, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1A Homo sapiens', 'seq': -1, 'show': true, 'len': 1707, 'descr': 'NA', 'feats': [{'featType': 5, 'start': 1418, 'end': 1558, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 1580, 'end': 1684, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 101, 'end': 165, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1B Clonorchis sinensis', 'seq': -1, 'show': true, 'len': 1685, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1558, 'end': 1662, 'descr': 'NA', 'show': true}]}, {'name': 'MLL5 Danio rerio', 'seq': -1, 'show': true, 'len': 1265, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 344, 'end': 445, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 129, 'end': 174, 'descr': 'NA', 'show': true}]}, {'name': 'SET1 Schizosaccharomyces pombe', 'seq': -1, 'show': true, 'len': 920, 'descr': 'NA', 'feats': [{'featType': 5, 'start': 630, 'end': 771, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 794, 'end': 897, 'descr': 'NA', 'show': true}, {'featType': 7, 'start': 279, 'end': 343, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 96, 'end': 172, 'descr': 'NA', 'show': true}]}, {'name': 'Trr1 Echinococcus multilocularis', 'seq': -1, 'show': true, 'len': 1638, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1509, 'end': 1613, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 1309, 'end': 1394, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1250, 'end': 1304, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1B Echinococcus multilocularis', 'seq': -1, 'show': true, 'len': 1617, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1490, 'end': 1594, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 2, 'end': 51, 'descr': 'NA', 'show': true}]}, {'name': 'MLL5 Echinococcus multilocularis', 'seq': -1, 'show': true, 'len': 1840, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 614, 'end': 728, 'descr': 'NA', 'show': true}]}, {'name': 'MLL3 Echinococcus multilocularis', 'seq': -1, 'show': true, 'len': 3003, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 195, 'end': 244, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 244, 'end': 290, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 831, 'end': 878, 'descr': 'NA', 'show': true}]}, {'name': 'MLL1 Schistosoma mansoni', 'seq': -1, 'show': true, 'len': 3002, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 2875, 'end': 2979, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2213, 'end': 2243, 'descr': 'NA', 'show': true}]}, {'name': 'MLL1 Danio rerio', 'seq': -1, 'show': true, 'len': 4219, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 4090, 'end': 4194, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 3917, 'end': 3999, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2218, 'end': 2267, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1675, 'end': 1726, 'descr': 'NA', 'show': true}, {'featType': 3, 'start': 1313, 'end': 1359, 'descr': 'NA', 'show': true}]}, {'name': 'Trr2 Clonorchis sinensis', 'seq': -1, 'show': true, 'len': 1443, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1313, 'end': 1417, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 1129, 'end': 1214, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1057, 'end': 1111, 'descr': 'NA', 'show': true}]}, {'name': 'lost PHDs of trr Schmidtea mediterranea', 'seq': -1, 'show': true, 'len': 3551, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 334, 'end': 384, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 384, 'end': 430, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 827, 'end': 874, 'descr': 'NA', 'show': true}]}, {'name': 'Mll5-2 Schmidtea mediterranea', 'seq': -1, 'show': true, 'len': 937, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 583, 'end': 658, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1B-A Danio rerio', 'seq': -1, 'show': true, 'len': 1844, 'descr': 'NA', 'feats': [{'featType': 5, 'start': 1549, 'end': 1695, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 1717, 'end': 1821, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 145, 'end': 209, 'descr': 'NA', 'show': true}]}, {'name': 'Trr2 Schmidtea mediterranea', 'seq': -1, 'show': true, 'len': 1336, 'descr': 'NA', 'feats': [{'featType': 8, 'start': 1026, 'end': 1110, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 1206, 'end': 1310, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 967, 'end': 1021, 'descr': 'NA', 'show': true}]}, {'name': 'MLL3 Danio rerio', 'seq': -1, 'show': true, 'len': 3915, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 3786, 'end': 3890, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 3615, 'end': 3701, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 20, 'end': 70, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 70, 'end': 116, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 147, 'end': 198, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 3558, 'end': 3610, 'descr': 'NA', 'show': true}]}, {'name': 'SET-16 Caenorhabditis elegans', 'seq': -1, 'show': true, 'len': 2475, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 2343, 'end': 2450, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 2109, 'end': 2194, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2053, 'end': 2104, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 427, 'end': 479, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 479, 'end': 527, 'descr': 'NA', 'show': true}]}, {'name': 'MLL5 Homo sapiens', 'seq': -1, 'show': true, 'len': 1858, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 346, 'end': 444, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 120, 'end': 165, 'descr': 'NA', 'show': true}]}, {'name': 'Trr1 Clonorchis sinensis', 'seq': -1, 'show': true, 'len': 1763, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1634, 'end': 1739, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 1452, 'end': 1538, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1394, 'end': 1448, 'descr': 'NA', 'show': true}]}, {'name': 'MLL5 Capitella telata', 'seq': -1, 'show': true, 'len': 1731, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 327, 'end': 372, 'descr': 'NA', 'show': true}]}, {'name': 'MLL2 Homo sapiens', 'seq': -1, 'show': true, 'len': 5537, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 275, 'end': 322, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1379, 'end': 1428, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1429, 'end': 1476, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 5408, 'end': 5512, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 5237, 'end': 5323, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 5180, 'end': 5232, 'descr': 'NA', 'show': true}]}, {'name': 'Trr2 Echinococcus multilocularis', 'seq': -1, 'show': true, 'len': 1327, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1197, 'end': 1301, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 992, 'end': 1079, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 914, 'end': 970, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1B Homo sapiens', 'seq': -1, 'show': true, 'len': 1923, 'descr': 'NA', 'feats': [{'featType': 5, 'start': 1629, 'end': 1774, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 1796, 'end': 1900, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 110, 'end': 174, 'descr': 'NA', 'show': true}]}, {'name': 'SET-2 Caenorhabditis elegans', 'seq': -1, 'show': true, 'len': 1507, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1379, 'end': 1484, 'descr': 'NA', 'show': true}, {'featType': 0, 'start': 132, 'end': 190, 'descr': 'NA', 'show': true}]}, {'name': 'MLL1 capitella teleta', 'seq': -1, 'show': true, 'len': 2487, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 2360, 'end': 2464, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 2185, 'end': 2265, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1419, 'end': 1467, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 971, 'end': 1029, 'descr': 'NA', 'show': true}, {'featType': 3, 'start': 686, 'end': 729, 'descr': 'NA', 'show': true}]}, {'name': 'lost PHDs of Trr Clonorchis sinensis', 'seq': -1, 'show': true, 'len': 3518, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 41, 'end': 90, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 90, 'end': 136, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 559, 'end': 606, 'descr': 'NA', 'show': true}, {'featType': 6, 'start': 3303, 'end': 3375, 'descr': 'NA', 'show': true}, {'featType': 6, 'start': 3408, 'end': 3499, 'descr': 'NA', 'show': true}]}, {'name': 'TRR Drosophila melanogaster', 'seq': -1, 'show': true, 'len': 2431, 'descr': 'NA', 'feats': [{'featType': 8, 'start': 2123, 'end': 2211, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 2302, 'end': 2406, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2066, 'end': 2119, 'descr': 'NA', 'show': true}]}, {'name': 'MLL4 Homo sapiens', 'seq': -1, 'show': true, 'len': 2715, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 2586, 'end': 2690, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 2412, 'end': 2494, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1251, 'end': 1302, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1337, 'end': 1394, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1732, 'end': 1782, 'descr': 'NA', 'show': true}, {'featType': 3, 'start': 960, 'end': 1005, 'descr': 'NA', 'show': true}]}, {'name': 'Trr Schistosoma mansoni', 'seq': -1, 'show': true, 'len': 1560, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 1431, 'end': 1536, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 1241, 'end': 1326, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 1182, 'end': 1238, 'descr': 'NA', 'show': true}]}, {'name': 'lost PHDs of Trr Schistosoma mansoni', 'seq': -1, 'show': true, 'len': 1074, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 313, 'end': 362, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 362, 'end': 408, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 820, 'end': 866, 'descr': 'NA', 'show': true}]}, {'name': 'MLL4 Danio rerio', 'seq': -1, 'show': true, 'len': 3772, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 3643, 'end': 3747, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 3469, 'end': 3551, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1654, 'end': 1701, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1702, 'end': 1752, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2231, 'end': 2280, 'descr': 'NA', 'show': true}, {'featType': 3, 'start': 1408, 'end': 1452, 'descr': 'NA', 'show': true}]}, {'name': 'Trr2 Capitella teleta', 'seq': -1, 'show': true, 'len': 844, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 715, 'end': 819, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 540, 'end': 627, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 482, 'end': 536, 'descr': 'NA', 'show': true}]}, {'name': 'lost PHDs of trr Drosophila melanogaster', 'seq': -1, 'show': true, 'len': 1482, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 206, 'end': 253, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 253, 'end': 300, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 530, 'end': 580, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 580, 'end': 626, 'descr': 'NA', 'show': true}]}, {'name': 'MLL1 Echinococcus multilocularis', 'seq': -1, 'show': true, 'len': 3018, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 2892, 'end': 2995, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 2662, 'end': 2727, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 2102, 'end': 2157, 'descr': 'NA', 'show': true}]}, {'name': 'SETD1 Capitella teleta', 'seq': -1, 'show': true, 'len': 388, 'descr': 'NA', 'feats': [{'featType': 1, 'start': 261, 'end': 365, 'descr': 'NA', 'show': true}, {'featType': 5, 'start': 97, 'end': 228, 'descr': 'NA', 'show': true}]}, {'name': 'MLL3 Homo sapiens', 'seq': -1, 'show': true, 'len': 4911, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 390, 'end': 437, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 959, 'end': 1009, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 1009, 'end': 1055, 'descr': 'NA', 'show': true}, {'featType': 1, 'start': 4782, 'end': 4886, 'descr': 'NA', 'show': true}, {'featType': 8, 'start': 4606, 'end': 4693, 'descr': 'NA', 'show': true}, {'featType': 4, 'start': 4550, 'end': 4602, 'descr': 'NA', 'show': true}]}, {'name': 'lost PHDs of Trr Capitella telata', 'seq': -1, 'show': true, 'len': 4211, 'descr': 'NA', 'feats': [{'featType': 2, 'start': 428, 'end': 475, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 476, 'end': 523, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 863, 'end': 909, 'descr': 'NA', 'show': true}, {'featType': 2, 'start': 940, 'end': 992, 'descr': 'NA', 'show': true}]}], 'featureType': [{'count': 8, 'color': '#F2E479', 'name': 'RRM 1', 'descr': 'NA', 'legend':true}, {'count': 39, 'color': '#622C7A', 'name': 'SET', 'descr': 'NA', 'legend':true}, {'count': 48, 'color': '#2C337A', 'name': 'PHD', 'descr': 'NA', 'legend':true}, {'count': 5, 'color': '#2C7A69', 'name': 'zf-CXXC', 'descr': 'NA', 'legend':true}, {'count': 23, 'color': '#337A2C', 'name': 'FYRN', 'descr': 'NA', 'legend':true}, {'count': 7, 'color': '#7A5C2C', 'name': 'N-SET', 'descr': 'NA', 'legend':true}, {'count': 2, 'color': '#9E2121', 'name': 'Cadherin', 'descr': 'NA', 'legend':true}, {'count': 1, 'color': '#A8DEFF', 'name': 'SET assoc', 'descr': 'NA', 'legend':true}, {'count': 22, 'color': '#FC7632', 'name': 'FYRC', 'descr': 'NA', 'legend':true}]};

		container.settings = _data_application;
		container.data = _data;

////////////////////////////////////////////////////////////////////////////////////////
/////// METHODS ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

		container.setProp = function(prop, val) {
			this.settings[prop] = val;
			this.update();

			return this;
		}

		container.onUpdate = function(f) {
			_onUpdate.push(f);

			return this;
		}

		container.parse = function(raw, delimiter) {

		}

		container.extract = function() {

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

		container.layout = function() {
			var winDim = seeker.util.winDimensions();
			if (arguments.length == 4) {
				container.whxy(
					arguments[0],
					arguments[1],
					arguments[2],
					arguments[3]);
			}

			var w = parseInt(container.node.style.width);
			var h = parseInt(container.node.style.height);

			panel_preview.whxy(winDim[0],winDim[1],0,0);
			panel_preview.d3()
				.style('background','white')
				.style('opacity',0.9)
				.style('z-index',10000)
				.style('display','none');

			return this;
		}

		container.initialize = function() {
			canvas.remove();
			canvas = d3
				.select(container.node)
				.append('svg')
				.style('position','absolute')
				.style('top',0)
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
				.style('font-family','Arial')
				.style('font-size','10pt')
				.on('mouseover', function(d,i) {
					var str = d['name'] + ': ' + d['len'] + " bp, " + d['feats'].length + " features";
					container.status(str);
				})
				.on('mouseout', function(d,i) {
					container.statusHide();
				})
				.on('click', function(d,i) {
					d3.event.preventDefault();
					d3.event.stopPropagation();

					if (seeker.env_menuTarget != this) {
						seeker.env_closeMenus();
						_mouseOver = [0,d];
						positionMenu(d3.mouse(document.body));
						seeker.env_menuTarget = this;
					} else {
						seeker.env_closeMenus();
					}
				});

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
					d3.event.preventDefault();
					d3.event.stopPropagation();

					if (seeker.env_menuTarget != this) {
						seeker.env_closeMenus();
						_mouseOver = [1,d];
						positionMenu(d3.mouse(document.body));
						seeker.env_menuTarget = this;
					} else {
						seeker.env_closeMenus();
					}
				});

			return this;
		}

		container.update = function() {
			var width = _data_application['seqLength'] + (_data_application['margin'] * 2);
			var featureHeight = this.numberShownSeqs() * (_data_application['featWidth'] + _data_application['seqSpacing'] + 30) - _data_application['seqSpacing'];
			var height = featureHeight + _data_application['legendHeight'] + _data_application['legendSpacing'] + (_data_application['margin'] * 2);

			canvas
				.attr('width',width)
				.attr('height',height);

			var index = 0;
			canvas
				.selectAll('#seqGroups')
				.attr('transform',function(d) {
					if (d['show'] == true) {
						if (_data_application['legendTop']) {
							return 'translate(' + _data_application['margin'] + ',' + (((30 + _data_application['featWidth'] + _data_application['seqSpacing']) * index++ + _data_application['legendHeight'] + _data_application['legendSpacing']) + _data_application['margin']) + ")";
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
				.attr('x',_data_application['seqLabelX'])
				.attr('y',16)
				.text(function(d, i) {
					if (_data_application['seqNumbered']) {
						return (i + 1) + ". " + d['name'];
					} else {
						return d['name'];
					}
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

			d3.selectAll('#legendRows').remove();

			var legendRows = []
			for (var i = 0 ; i < _data['featureType'].length ; i++ ) {
				if (_data['featureType'][i]['legend']) {
					legendRows.push(_data['featureType'][i]);
				}
			}

			var rows = [];
			for (var i = 0 ; i < legendRows.length ; i += _data_application['legendCols'] ) {
				rows.push(legendRows.slice(i,i+_data_application['legendCols']));
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
				.attr('id','legendColsRect')
				.on('mouseover', function() {
					document.body.style.cursor = 'pointer';
				})
				.on('mouseout', function() {
					document.body.style.cursor = 'default';
				})
				.on('click',function(d,i) {
					d3.event.preventDefault();
					d3.event.stopPropagation();

					if (seeker.env_menuTarget != this) {
						seeker.env_closeMenus();
						_mouseOver = [4,d];
						positionMenu(d3.mouse(document.body));
						seeker.env_menuTarget = this;
					} else {
						seeker.env_closeMenus();
					}
				});

			canvas
				.selectAll('#legendCols')
				.append('text')
				.attr('id','legendColsText')
				.style('font-family','Arial')
				.style('font-size','10pt')
				.on('mouseover', function(d,i) {
					var str = d['name'] + ': ' + d['count'] + ' features total';
					container.status(str);
				})
				.on('mouseout', function(d,i) {
					container.statusHide();
				})
				.on('click', function(d,i) {
					d3.event.preventDefault();
					d3.event.stopPropagation();

					if (seeker.env_menuTarget != this) {
						seeker.env_closeMenus();
						_mouseOver = [2,i];
						positionMenu(d3.mouse(document.body));
						seeker.env_menuTarget = this;
					} else {
						seeker.env_closeMenus();
					}
				});

			var rows = Math.ceil(_data['featureType'].length / _data_application['legendCols']);
			var legendRowHeight = _data_application['legendHeight'] / rows;
			var legendColWidth = _data_application['legendWidth'] / _data_application['legendCols'];

			canvas
				.selectAll('#legendRows')
				.attr('transform', function(d,i) {
					if (_data_application['legendTop']) {
						return 'translate(' + (_data_application['margin'] + _data_application['legendX']) + ',' + ((i * legendRowHeight) + _data_application['margin']) + ")";	
					} else {
						return 'translate(' + (_data_application['margin'] + _data_application['legendX']) + ',' + (_data_application['margin'] + featureHeight + _data_application['legendSpacing'] + (i * legendRowHeight)) + ")";	
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
				.attr('y',_data_application['legendSize'] / 2 + 5);

			for ( var i = 0 ; i < _onUpdate.length ; i++ ) {
				_onUpdate[i]();
			}

			return this;
		}

		function positionMenu(coord) {
			if (_mouseOver[0] == 0) {
				menu_seq.style.display = 'inline-block';
				menu_seq.place(coord);
			} else if (_mouseOver[0] == 1) {
				menu_feature.style.display = 'inline-block';
				menu_feature.place(coord);
			} else if (_mouseOver[0] == 2) {
				menu_legend.style.display = 'inline-block';
				menu_legend.place(coord);
			} else {
				colorpicker_env.style.display = 'block';
				colorpicker_env.place(coord);
			}
		}

		container.preview = function() {
			var winDim = seeker.util.winDimensions();

			panel_preview_close.node.style.top = winDim[1] * 3/4 + 20;
			panel_preview_close.node.style.left = winDim[0] / 2 - panel_preview_close.node.offsetWidth / 2;

			panel_text.style.top = winDim[1] * 1/4 - 40;
			panel_text.style.left = winDim[0] / 2 - 290;

			panel_preview.d3()
				.selectAll('img')
				.remove()

			d3.select('#annotator_preview')
				.style('width',winDim[0] * 4/5)
				.style('height', winDim[1] * 1/2)
				.style('top', winDim[1] * 1/4)
				.style('left', winDim[0] * 1/10)
				.style('position','absolute')
				.style('overflow-x','hidden')
				.style('overflow-y','auto');

			var html = canvas
				.attr("title", "annotations")
				.attr("version", 1.1)
				.attr("xmlns", "http://www.w3.org/2000/svg")
				.node().parentNode.innerHTML;

			d3.select('#annotator_preview')
				.append("img")
		        .attr("src", "data:image/svg+xml;base64," + btoa(html))
		        .style('width',winDim[0] * 4/5)
		        .style('height','auto');

		    panel_preview.d3()
		    	.style('display','block');
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

		container.showAllSequence = function() {
			var seqs = _data.seqs;
			var seqLen = _data['seqs'].length;
			for ( var i = 0; i < seqLen; i++ ) {
				seqs[i]['show'] = true;
			}

			return this;
		}

		container.hideAllSequence = function() {
			var seqs = _data.seqs;
			var seqLen = _data['seqs'].length;
			for ( var i = 0; i < seqLen; i++ ) {
				seqs[i]['show'] = false;
			}

			return this;
		}

		container.showAllLegend = function() {
			for ( var i = 0 ; i < _data['featureType'].length ; i++ ) {
				_data['featureType'][i]['legend'] = true;
			}

			return this;
		}

		container.hideAllLegend = function() {
			for ( var i = 0 ; i < _data['featureType'].length ; i++ ) {
				_data['featureType'][i]['legend'] = false;
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

////////////////////////////////////////////////////////////////////////////////////////
/////// SEEKER NAMESPACE OPERATIONS ////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

		if (!seeker.env_menus) {
			seeker.env_menuTarget = null;
			seeker.env_menus = [];

			seeker.env_closeMenus = function() {
				if (seeker.env_menuTarget) {
					var num = seeker.env_menus.length;
					for ( var i = 0 ; i < num ; i++ ) {
						seeker.env_menus[i].style.display = 'none';
					}

					seeker.env_menuTarget = null;
				}
			}	
		}
		seeker.env_menus.push(menu_feature);
		seeker.env_menus.push(menu_seq);
		seeker.env_menus.push(menu_legend);
		
		document.addEventListener('click',seeker.env_closeMenus);
		container.node.addEventListener('scroll',seeker.env_closeMenus);

		return container;
	}
})();