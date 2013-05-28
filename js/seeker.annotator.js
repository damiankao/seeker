(function() {
	/*
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
	legend rows - number of rows for legend
	legend cols - number of columns for legend
	legend spacing - distance in pixels between legend elements
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

		menu_feature.style.display = 'none';
		menu_seq.style.display = 'none';



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
			"legdRows":-1,
			"legdCols":-1,
			"legSpc":-1,
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

		var _data = {
			'seqs':[
				{'name':'seq01','len':10232,'descr':'NA','seq':-1,'show':true,
					'feats':[
						{'featType':0,'descr':'NA','start':1000,'end':4000,'show':true},
						{'featType':3,'descr':'NA','start':7034,'end':8653,'show':true}
					]
				},
				{'name':'seq02','len':8000,'descr':'NA','seq':-1,'show':false,
					'feats':[
						{'featType':0,'descr':'NA','start':5643,'end':6876,'show':true},
						{'featType':2,'descr':'NA','start':2312,'end':3242,'show':true}
					]
				},
				{'name':'seq03','len':4213,'descr':'NA','seq':-1,'show':true,
					'feats':[
						{'featType':2,'descr':'NA','start':1230,'end':2312,'show':true},
						{'featType':1,'descr':'NA','start':3213,'end':3764,'show':true}
					]
				},
				{'name':'seq04','len':11022,'descr':'NA','seq':-1,'show':true,
					'feats':[
						{'featType':1,'descr':'NA','start':1021,'end':6430,'show':true},
						{'featType':2,'descr':'NA','start':8764,'end':10233,'show':true}
					]
				},
				{'name':'seq05','len':9213,'descr':'NA','seq':-1,'show':false,
					'feats':[
						{'featType':2,'descr':'NA','start':3421,'end':5433,'show':true},
						{'featType':1,'descr':'NA','start':7643,'end':8544,'show':true}
					]
				}
			],
			'featureType':[
				{'name':'DOM01','count':2,'descr':'NA','color':_palette[6]},
				{'name':'DOM02','count':3,'descr':'NA','color':_palette[2]},
				{'name':'DOM03','count':4,'descr':'NA','color':_palette[3]},
				{'name':'DOM04','count':1,'descr':'NA','color':_palette[4]}
			]
		};

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

			return this;
		}

		container.update = function() {
			var width = _data_application['seqLength'] + (_data_application['margin'] * 2);
			var height = this.numberShownSeqs() * (_data_application['featWidth'] + _data_application['seqSpacing'] + 30) - _data_application['seqSpacing'] + (_data_application['margin'] * 2);

			canvas
				.style('width',width)
				.style('height',height);

			var index = 0;
			canvas
				.selectAll('#seqGroups')
				.attr('transform',function(d) {
					if (d['show'] == true) {
        				return 'translate(' + _data_application['margin'] + ',' + ((30 + _data_application['featWidth'] + _data_application['seqSpacing']) * index++ + _data_application['margin']) + ")";
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

			return this;
		}

		function positionMenu(coord) {
			if (_mouseOver[0] == 0) {
				var reposition = false;
				if (menu_seq.style.display == "none") {
					menu_seq.style.display = 'inline-block';
					reposition = true;
				} else {
					menu_seq.style.display = 'none';
				}

				if (reposition) {
					menu_seq.place(coord);
				}
			} else {
				var reposition = false;
				if (menu_feature.style.display == "none") {
					menu_feature.style.display = 'inline-block';
					reposition = true;
				} else {
					menu_feature.style.display = 'none';
				}

				if (reposition) {
					menu_feature.place(coord);
				}
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
			seeker.env_menus.push(menu_feature);
			seeker.env_menus.push(menu_seq);
			var num = seeker.env_menus.length;
			seeker.env_closeMenus = function() {
				for ( var i = 0 ; i < num ; i++ ) {
					seeker.env_menus[i].style.display = 'none';
				}
			}	
		} else {
			seeker.env_menus.push(menu_feature);
			seeker.env_menus.push(menu_seq);
		}

		document.addEventListener('click',seeker.env_closeMenus);

		return container;
	}
})();