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

	physical properties:
	minimum width - enough for logo and 4 menu items
	minimum height - enough to show at least 5 features
	*/

	seeker.annotator = function(vm) {
		//view elements
		var container = vm.get();
		var canvas;

		var _palette = [];

		var _data_application = {
			"currentSelection":[],
			"interFeat":-1,
			"legdRows":-1,
			"legdCols":-1,
			"legSpc":-1,
			"align":[-1,'s'],   //-1 indicates align by start/end of entire sequence
			                    //First element number refer to the featureType array index
			"spineWidth":2,
			"featWidth":5,
			"seqSpacing":20,
			"selected":[],      //selected elements. [name, sequence index, start, end, description]

			"minWidth":400,
			"minHeight":400,
			"menuHeight":40
		};

		var _data = {
			/*
			'seqs':[
				{
					'name':'seq01',
					'len':100,
					'descr':'sequence number 01',
					'seq':'AGATGAGAG',
					'feats':[
						{
							'featType':0,
							'descr':'seq01 feat description',
							'start':10,
							'end':40,
							'show':true,
							'color':'red'
						}
					],
					'show':true
				}
			],
			'featureType':[
				'name':'feat01',
				'count':10,
				'descr':'feature 01'
			]
			*/
		};

		container.layout = function() {
			if (arguments.length == 4) {
				container.whxy(
					(arguments[0] < _data_application.minWidth) ? arguments[0]:_data_application.minWidth
					,(arguments[1] < _data_application.minWidth) ? arguments[1]:_data_application.minHeight
					,arguments[2]
					,arguments[3]);
			}

			var w = container.node.style.width;
			var h = container.node.style.height;

			return this;
		}

		container.parse = function(raw, delimiter) {
			
		}

		container.render = function() {
			
		}

		container.extract = function() {
			
		}

		//called when freeing the object
		container.disassemble = function() {
			
		}

		return container;
	}
})();