(function() {
	/*
	Author: Damian Kao
	E-mail: damian.kao@gmail.com

	introduction:
	Annotator is used to view annotations on series of sequence. It allows the user to
	input annotation data and manipulate the visualization.

	bind:
	{
	'seqs':{'obj':data},
	'feats':{'obj':data}
	}
	*/
	seeker.annotator = function() {
		var container = new seeker.element('div')
			.id('annotator');
		var canvas = new seeker.element('svg',true)
			.attachTo(container);

		//function menus


		var _seqObjs = [];
		var _legendObjs = [];

		container.settings = {
			'annotator':container,
			'seq_scale':null,
			'margin':40,
			'seq_underSpacing':30,
			'legend_underSpacing':50,
			'legend_show':'top',
			'legend_xPos':0,
			'legend_width':620,
			'legend_height':40,
			'legend_cols':5,
			'seq_maxLength':900,
			'legend_colorSize':15,
			'seq_spineWidth':5,
			'seq_spineColor':'#9C9C9C',
			'seq_labelxPos':10,
			'seq_numbered':true,
			'seq_featWidth':10
		};

		container.update = function() {
			container.rescale();
			if(_seqObjs.length != this.data.seqs.obj.length) {
				var addObj = function() {
					var seq = new seeker.annotator_sequence();
					seq.settings = container.settings;
					return seq;
				}

				var deleteObj = function(obj) {
					obj
						.detach()
						.unbind();
				}

				var updateObj = function(obj) {
					var seqData = container.data.seqs.obj[obj.index];

					obj
						.bind({
							'name':{'obj':seqData,'key':'name'},
							'length':{'obj':seqData,'key':'length'},
							'visible':{'obj':seqData,'key':'show'},
							'features':{'obj':seqData.feat}
						})
						.update();
				}

				seeker.util.updateCollection(this.data.seqs.obj, _seqObjs, addObj, deleteObj, updateObj, canvas);
			}

			if (_legendObjs.length != this.data.feats.obj.length) {
				var addObj = function() {
					var legend = new seeker.annotator_legend();
					legend.settings = container.settings;
					return legend;
				}

				var deleteObj = function(obj) {
					obj
						.detach()
						.unbind();
				}

				var updateObj = function(obj) {
					var featData = container.data.feats.obj[obj.index];

					obj
						.bind({
							'name':{'obj':featData,'key':'name'},
							'color':{'obj':featData,'key':'color'},
							'visible':{'obj':featData,'key':'legend'},
						})
						.update();
				}

				seeker.util.updateCollection(this.data.feats.obj, _legendObjs, addObj, deleteObj, updateObj, canvas);
			}

			container.arrangeSequences();
			container.arrangeLegend();

			return container;
		}

		container.rescale = function() {
			container.settings.seq_scale = d3.scale.linear()
			    .domain([0, d3.max(this.data.seqs.obj,function(d) {return d['length'];})])
			    .range([0, container.settings.seq_maxLength]);

			return container;
		}

		container.arrangeSequences = function() {
			//position each sequence element
			var startY = container.settings.margin + container.settings.legend_height + container.settings.legend_underSpacing;
			var startX = container.settings.margin;

			if (container.settings.legend_show == 'none' || container.settings.legend_show == 'bottom') {
				startY = container.settings.margin;
			}

			for ( var i = 0 ; i < _seqObjs.length ; i++ ) {
				var g = _seqObjs[i];
				var visible = container.data.seqs.obj[g.index]['show']
				if (visible) {
					g.node.translate_x = startX;
					g.node.translate_y = startY;
					g
						.show()
						.attr('transform','translate(' + g.node.translate_x + ',' + g.node.translate_y + ')');
					startY += g.node.getBBox().height + container.settings.seq_underSpacing;
				} else {
					g
						.hide();
				}
			}

			canvas
				.style('height',startY + container.settings.margin)

			return container;
		}

		container.arrangeLegend = function() {
			if (container.settings.legend_show != 'none') {
				var startX = container.settings.margin + container.settings.legend_xPos;
				var startY = container.settings.margin;
				
				var visible = seeker.util.countArray(container.data.feats.obj,'legend',true);
				var cols = container.settings.legend_cols;
				var rows = Math.ceil(visible / cols);
				var w = container.settings.legend_width / cols;
				var h = container.settings.legend_height / rows;

				var i = 0;
				for ( var r = 0 ;r < rows ; r++ ) {
					for ( var c = 0 ; c < cols ; c++ ) {
						if (i == container.data.feats.obj.length) {
							break;
						}
						if (container.data.feats.obj[i].legend) {
							_legendObjs[i]
								.attr('transform','translate(' + (startX + c * w) + ',' + (startY + r * h) + ')');
						} else {
							_legendObjs[i].hide();
							c--;
						}
						i++;
					}
				}
			} else {
				for ( var i = 0 ; i < _legendObjs.length ; i++ ) {
					_legendObjs[i].hide();
				}
			}

			return container;
		}

		container.postBind = function() {

			return container;
		}

		container.postUnbind = function() {

			return container;
		}

		return container;
	}

	seeker.annotator_sequence = function() {
		var container = new seeker.element('g',true);
		var label = new seeker.element('text',true)
			.attachTo(container);
		var spine = new seeker.element('line',true)
			.attachTo(container);

		var _featureObjs = [];

		container.update = function() {
			if(_featureObjs.length != this.data.features.obj.length) {
				var addObj = function() {
					var feat = new seeker.annotator_feature();
					feat.settings = container.settings;
					return feat;
				}

				var deleteObj = function(obj) {
					obj
						.detach()
						.unbind();
				}

				var updateObj = function(obj) {
					var featData = container.data.features.obj[obj.index];

					obj
						.bind({
							'name':{'obj':featData.ref,'key':'name'},
							'color':{'obj':featData.ref,'key':'color'},
							'start':{'obj':featData,'key':'start'},
							'end':{'obj':featData,'key':'end'},
							'visible':{'obj':featData,'key':'show'},
							'labeled':{'obj':featData,'key':'label'}
						})
						.update();
				}

				seeker.util.updateCollection(this.data.features.obj, _featureObjs, addObj, deleteObj, updateObj, container);
			}

			this.updateSpine()
			this.updateLabel();
			this.arrangeLabels();
			return container;
		}

		container.arrangeLabels = function() {
			//arrange labels for this sequence
			var levels = [];
			var xPos = 0;
			for ( var i = 0 ; i < _featureObjs.length ; i++ ) {
				var g = _featureObjs[i];
				var d = container.data.features.obj[g.index]
				if (d.show) {
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
						.hide();
				}
			}
		}

		container.updateSpine = function() {
			//update label and spine
			container.settings.annotator.rescale();
			var length = container.getBound('length');

			spine
				.draw(0,40, container.settings.seq_scale(length),40)
				.style('stroke-width',container.settings.seq_spineWidth)
				.style('stroke',container.settings.seq_spineColor);

			return container;
		}

		container.updateLabel = function() {
			var name = container.getBound('name');

			label
				.attr('x',container.settings.seq_labelxPos)
				.attr('y',0)
				.style('font-size','10pt')
				.style('font-weight','bold');

			if (container.settings.seq_numbered) {
				label
					.text((container.index + 1) + '. ' + name);
			} else {
				label
					.text(name);
			}

			return container;
		}

		container.postBind = function() {
			var num = _featureObjs.length;

			while ( num-- ) {
				_featureObjs
					.onUpdate('visible', container.arrangeLabels)
					.onUpdate('labeled', container.arrangeLabels);
			}

			return container;
		}

		container.postUnbind = function() {

			return container;
		}

		return container;
	}

	seeker.annotator_feature = function() {
		var container = new seeker.element('g',true);

		var label = new seeker.element('text',true)
			.attachTo(container)
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
					var currentCoord = container.mouseCoord(evt);

					label
						.attr('x',currentCoord[0] - downCoord[0])
						.attr('y',currentCoord[1] - downCoord[1]);
				}

				document.body.onmouseup = function(evt) {
					document.body.onmousemove = null;
					document.body.onmouseup = null;
				}
			});

		var feat = new seeker.element('line',true)
			.attachTo(container);

		var _labelLevel = 0;

		container.update = function() {
			var name = this.getBound('name');
			var start = container.settings.seq_scale(this.getBound('start'));
			var end = container.settings.seq_scale(this.getBound('end'));
			var visible = this.getBound('visible');
			var labeled = this.getBound('labeled');
			var color = this.getBound('color');

			if (visible) {
				feat
					.draw(start,40,end,40)
					.style('stroke-width',container.settings.seq_featWidth)
					.style('stroke',color)
					.show();

				if (labeled) {
					label
						.text(name)
						.attr('x',start + (end - start) / 2 - parseInt(label.node.getBBox().width) / 2)
						.style('font-size','8pt')
						.show();

					if (_labelLevel == 0) {
						label
							.attr('y',27);
					} else {
						var startY = 40 + container.settings.seq_featWidth / 2;
						label
							.attr('y',_labelLevel * 15 + startY);
					}

				} else {
					label.hide();
				}
			} else {
				feat.hide()
				label.hide();
			}

			return container;
		}

		container.setLevel = function(l) {
			_labelLevel = l;

			return container;
		}

		container.postBind = function() {

			return container;
		}

		container.postUnbind = function() {

			return container;
		}

		container.getLabelStartpoint = function() {
			return parseInt(label.node.getBBox().x);
		}

		container.getLabelEndpoint = function() {
			return parseInt(label.node.getBBox().x) + parseInt(label.node.getBBox().width);
		}

		return container;
	}

	seeker.annotator_legend = function() {
		var container = new seeker.element('g',true);
		var color = new seeker.element('rect',true)
			.attachTo(container);
		var label = new seeker.element('text',true)
			.attachTo(container);

		container.update = function() {
			color
				.attr('width',container.settings.legend_colorSize)
				.attr('height',container.settings.legend_colorSize)
				.attr('x',0)
				.attr('y',0)
				.attr('fill',container.getBound('color'));

			label
				.attr('x',container.settings.legend_colorSize + 5)
				.attr('y', container.settings.legend_colorSize / 2)
				.style('font-size','10pt')
				.attr('baseline-shift','-33%')
				.text(container.getBound('name'));

			return container;
		}

		container.postBind = function() {

			return container;
		}

		container.postUnbind = function() {

			return container;
		}

		return container;
	}
})();
