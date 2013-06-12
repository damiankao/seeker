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
		var featureMenuData = [
			{'name':'show all features','click':function(evt, index){
				evt.stopPropagation();

				var i = container.data.seqs.obj.length;
				var name = container.settings.clickObj.data.start.obj.ref.name;
				while ( i-- ) {
					var feat = container.data.seqs.obj[i].feat;
					var a = feat.length;
					while ( a-- ) {
						if (feat[a]['ref'].name == name) {
							feat[a].__set('show',true);
						}
					}
					feat.__arrange();
				}
				seeker.env_closePopups();
			}},
			{'name':'hide all features','click':function(evt, index){
				evt.stopPropagation();

				var i = container.data.seqs.obj.length;
				var name = container.settings.clickObj.data.start.obj.ref.name;
				while ( i-- ) {
					var feat = container.data.seqs.obj[i].feat;
					var a = feat.length;
					while ( a-- ) {
						if (feat[a]['ref'].name == name) {
							feat[a].__set('show',false);
						}
					}
					feat.__arrange();
				}
				seeker.env_closePopups();
			}},
			{'name':'show this label','click':function(evt, index){
				evt.stopPropagation();

				container.settings.clickObj.set('labeled',true);
				container.settings.clickObj.parent.data.features.obj.__arrange();

				seeker.env_closePopups();
			}},
			{'name':'hide this label','click':function(evt, index){
				evt.stopPropagation();

				container.settings.clickObj.set('labeled',false);
				container.settings.clickObj.parent.data.features.obj.__arrange();

				seeker.env_closePopups();
			}},
			{'name':'hide this feature','click':function(evt, index){
				evt.stopPropagation();

				container.settings.clickObj.set('visible',false);
				container.settings.clickObj.parent.data.features.obj.__arrange();

				seeker.env_closePopups();
			}}
		];
		var sequenceMenuData = [
			{'name':'show all features','click':function(evt, index){
				evt.stopPropagation();

				var feats = container.settings.clickObj.data.features.obj;
				var featLength = feats.length;

				while ( featLength-- ) {
					feats[featLength].__set('show',true);
				}
				feats.__arrange();

				seeker.env_closePopups();
			}},
			{'name':'hide all features','click':function(evt, index){
				evt.stopPropagation();

				var feats = container.settings.clickObj.data.features.obj;
				var featLength = feats.length;
				
				while ( featLength-- ) {
					feats[featLength].__set('show',false);
				}
				feats.__arrange();

				seeker.env_closePopups();
			}},
			{'name':'hide this sequence','click':function(evt, index){
				evt.stopPropagation();

				container.settings.clickObj.set('visible',false);
				container.arrangeSequences();

				seeker.env_closePopups();
			}}
		];
		var legendMenuData = [
			{'name':'show all features','click':function(evt, index){
				evt.stopPropagation();

				var name = container.settings.clickObj.getBound('name');
				var i = container.data.seqs.obj.length;
				while ( i-- ) {
					var feat = container.data.seqs.obj[i].feat;
					var a = feat.length;
					while ( a-- ) {
						if (feat[a]['ref'].name == name) {
							feat[a].__set('show',true);
						}
					}
					feat.__arrange();
				}
				seeker.env_closePopups();
			}},
			{'name':'hide all features','click':function(evt, index){
				evt.stopPropagation();

				var name = container.settings.clickObj.getBound('name');
				var i = container.data.seqs.obj.length;
				while ( i-- ) {
					var feat = container.data.seqs.obj[i].feat;
					var a = feat.length;
					while ( a-- ) {
						if (feat[a]['ref'].name == name) {
							feat[a].__set('show',false);
						}
					}
					feat.__arrange();
				}
				seeker.env_closePopups();
			}},
			{'name':'hide this legend','click':function(evt, index){
				evt.stopPropagation();

				container.settings.clickObj.set('visible',false);
				container.arrangeLegend();

				seeker.env_closePopups();
			}}
		];

		var nav_sequenceControlData = [
			{'name':'show all','click':function(evt) {
				var l = container.data.seqs.obj.length;
				var seqs = container.data.seqs.obj;

				while ( l-- ) {
					seqs[l].__set('show',true);
				}

				container.arrangeSequences();
			}},
			{'name':'hide all','click':function(evt) {
				var l = container.data.seqs.obj.length;
				var seqs = container.data.seqs.obj;

				while ( l-- ) {
					seqs[l].__set('show',false);
				}

				container.arrangeSequences();
			}}
		];

		var nav_sequenceFeatureControlData = [
			{'name':'show all','click':function(evt) {

			}},
			{'name':'hide all','click':function(evt) {

			}}
		];

		var featureMenu = new seeker.menu()
			.attachTo(document.body)
		    .bind({
		      'items':{'obj':featureMenuData}
		    })
		    .setLabel('name')
		    .setClick('click')
		    .hide()
		    .update();

		var sequenceMenu = new seeker.menu()
			.attachTo(document.body)
		    .bind({
		      'items':{'obj':sequenceMenuData}
		    })
		    .setLabel('name')
		    .setClick('click')
		    .hide()
		    .update();

		var legendMenu = new seeker.menu()
			.attachTo(document.body)
		    .bind({
		      'items':{'obj':legendMenuData}
		    })
		    .setLabel('name')
		    .setClick('click')
		    .hide()
		    .update();

		var legendColorPicker = new seeker.colorpicker()
			.attachTo(document.body)
			.hide();

		var nav_input;
		var nav_sequence_menu = new seeker.complexMenu()
			.attachTo(document.body)
			.setControl({
				'items':{'obj':nav_sequenceControlData}
				},'name','click')
			.setTemplate(function() {
				var li = new seeker.element('li')
					.on('click', function(evt) {
						evt.stopPropagation();
						container.arrangeSequences();
					})
					.on('mouseover', function(evt){
						container.settings.clickObj = li.checkbox.data.text.obj;

						//nav_sequence_submenu
						//	.place([400,li.node.offsetTop]);
						/*
	var w = p.node().offsetWidth;
    var h = p.node().offsetHeight;
    var winDim = seeker.util.winDimensions();

    p
      .style('width',w + 20);

    if (coord[1] + h > winDim[1] - 20) {
      var newHeight = winDim[1] - 20 - coord[1];
      if (newHeight > 150) {
        p
          .style('height',newHeight)
          .style('top', coord[1]);
      } else {
        if (h > coord[1]) {
          newHeight = coord[1];
        } else {
          newHeight = h;
        }

        p
          .style('height',newHeight)
          .style('top', coord[1] - newHeight + 22);
      }
    } else {
      p
        .style('top',coord[1]);
    }

    if (coord[0] + w > winDim[0] - 20) {
      var newWidth = winDim[0] - w - coord[0] - 20;
      if (newWidth > 200) {
        p
          .style('width',newWidth)
          .style('left',coord[0])
          .style('border-left','3px solid black');
      } else {
        if (w > coord[0] - 20) {
          newWidth = coord[0] - 20;
        } else {
          newWidth = w;
        }

        p
          .style('width',newWidth)
          .style('left', coord[2] - newWidth - 3)
          .style('border-right','3px solid black')
      }
    } else {
      p
        .style('left',coord[0])
        .style('border-left','3px solid black');
    }*/

					});

				var cbox = new seeker.checkbox()
				.attachTo(li);

				li.checkbox = cbox;

				return li;
			})
			.setDelete(function(obj) {
				obj.checkbox
				.detach()
				.unbind();

				obj
				.detach()
				.unbind();
			})
			.setUpdate(function(obj, d) {
				obj.checkbox
				.bind({
				  'text':{'obj':d,'key':'name'},
				  'checkbox':{'obj':d,'key':'show'}
				})
				.update();
			})
			.setUnbind(function(obj) {
				obj.checkbox.unbind();
			})
			.on('click', function(evt) {
				evt.stopPropagation();
			})
			.whxy(-1,-1,300,50);

		var nav_sequence_submenu = new seeker.complexMenu()
			.attachTo(document.body)
			.setControl({
				'items':{'obj':nav_sequenceFeatureControlData}
				},'name','click')
			.hide();

		var nav_feature_menu;
		var nav_selection;
		var nav_option;

		var _seqObjs = [];
		var _legendObjs = [];

		container.settings = {
			'annotator':container,
			'featureMenu':featureMenu,
			'sequenceMenu':sequenceMenu,
			'legendMenu':legendMenu,
			'legendPicker':legendColorPicker,

			'clickObj':null,

			'seq_scale':null,
			'margin':40,
			'seq_underSpacing':30,
			'legend_underSpacing':50,
			'legend_show':'top',
			'legend_xPos':0,
			'legend_width':620,
			'legend_height':40,
			'legend_cols':5,
			'seq_maxLength':1000,
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
			nav_sequence_menu
				.bind({
				'items':{'obj':container.data.seqs.obj}
				})
				.update();

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
			.attachTo(container)
			.on('mouseover', function(evt) {
				document.body.style.cursor = 'pointer';
			})
			.on('mouseout', function(evt) {
				document.body.style.cursor = 'default';
			})
			.on('click', function(evt) {
				evt.stopPropagation();
				container.settings.clickObj = container;

				if (seeker.env_clickTarget !== this) {
					seeker.env_closePopups();

					container.settings.sequenceMenu
						.place(seeker.util.mouseCoord(evt));

					seeker.env_clickTarget = this;
				} else {
					seeker.env_closePopups();
				}
			});

		var spine = new seeker.element('line',true)
			.attachTo(container)
			.style('shape-rendering','crispEdges');

		var _featureObjs = [];

		container.update = function() {
			if(_featureObjs.length != container.data.features.obj.length) {
				var addObj = function() {
					var feat = new seeker.annotator_feature();
					feat.settings = container.settings;
					feat.parent = container;
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

				seeker.util.updateCollection(container.data.features.obj, _featureObjs, addObj, deleteObj, updateObj, container);
			}

			container.updateSpine()
			container.updateLabel();
			container.arrangeLabels();
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
			container
				.onArrange('features',container.arrangeLabels);

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
			.attachTo(container)
			.style('shape-rendering','crispEdges')
			.on('mouseover', function(evt) {
				document.body.style.cursor = 'pointer';
				var start = container.settings.seq_scale(container.getBound('start')) - 3;
				var end = container.settings.seq_scale(container.getBound('end')) + 3;

				feat
					.draw(start,40,end,40)
					.style('stroke-width',container.settings.seq_featWidth + 3);
			})
			.on('mouseout', function(evt) {
				document.body.style.cursor = 'default';
				var start = container.settings.seq_scale(container.getBound('start'));
				var end = container.settings.seq_scale(container.getBound('end'));

				feat
					.draw(start,40,end,40)
					.style('stroke-width',container.settings.seq_featWidth);
			})
			.on('click', function(evt) {
				evt.stopPropagation();
				container.settings.clickObj = container;

				if (seeker.env_clickTarget !== this) {
					seeker.env_closePopups();

					container.settings.featureMenu
						.place(seeker.util.mouseCoord(evt));

					seeker.env_clickTarget = this;
				} else {
					seeker.env_closePopups();
				}
			});

		var _labelLevel = 0;

		container.update = function() {
			var name = container.getBound('name');
			var start = container.settings.seq_scale(container.getBound('start'));
			var end = container.settings.seq_scale(container.getBound('end'));
			var visible = container.getBound('visible');
			var labeled = container.getBound('labeled');
			var color = container.getBound('color');

			if (visible) {
				container
					.show();

				feat
					.draw(start,40,end,40)
					.style('stroke-width',container.settings.seq_featWidth)
					.style('stroke',color);

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
				container.hide();
			}

			return container;
		}

		container.updateColor = function() {
			var color = container.getBound('color');

			feat
				.style('stroke',color);

			return container;
		}

		container.setLevel = function(l) {
			_labelLevel = l;

			return container;
		}

		container.postBind = function() {
			container
				.onUpdate('visible',container.update)
				.onUpdate('labeled',container.update)
				.onUpdate('color',container.updateColor);

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
			.attachTo(container)
			.on('mouseover', function(evt) {
				document.body.style.cursor = 'pointer';
			})
			.on('mouseout', function(evt) {
				document.body.style.cursor = 'default';
			})
			.on('click', function(evt) {
				evt.stopPropagation();
				container.settings.clickObj = container;

				if (seeker.env_clickTarget !== this) {
					seeker.env_closePopups();

					container.settings.legendMenu
						.place(seeker.util.mouseCoord(evt));

					seeker.env_clickTarget = this;
				} else {
					seeker.env_closePopups();
				}
			});

		container.update = function() {
			color
				.attr('width',container.settings.legend_colorSize)
				.attr('height',container.settings.legend_colorSize)
				.attr('x',0)
				.attr('y',0)
				.attr('fill',container.getBound('color'))
				.on('mouseover', function(evt) {
					document.body.style.cursor = 'pointer';
				})
				.on('mouseout', function(evt) {
					document.body.style.cursor = 'default';
				})
				.on('click', function(evt) {
					evt.stopPropagation();
					container.settings.clickObj = container;

					if (seeker.env_clickTarget !== this) {
						seeker.env_closePopups();

						container.settings.legendPicker
							.place(seeker.util.mouseCoord(evt))
							.setCallback(function(hex) {
								container.set('color',hex);
							});

						seeker.env_clickTarget = this;
					} else {
						seeker.env_closePopups();
					}
				});

			label
				.attr('x',container.settings.legend_colorSize + 5)
				.attr('y', container.settings.legend_colorSize / 2)
				.style('font-size','10pt')
				.attr('baseline-shift','-33%')
				.text(container.getBound('name'));

			return container;
		}

		container.postBind = function() {
			container
				.onUpdate('color',container.update);

			return container;
		}

		container.postUnbind = function() {

			return container;
		}

		return container;
	}
})();
