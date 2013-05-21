(function() {
	/*
	data structures:
	sequence name, start, end, feature type, feature description
	sequence name, sequence length, sequence description, sequence(optional)
	*/

	/*
	application data:
	shown feature types - all feature types that are shown
	pinned features - specific features that are pinned to always show
	feature type colors - colors for each feature type
	shorten inter-feature threshold - shorten long inter-feature distances with a break point
	legend rows - number of rows for legend
	legend cols - number of columns for legend
	legend spacing - distance in pixels between legend elements
	alignment - align all sequences by start/end of feature type (when exist)
	*/
	seeker.annotator = function(vm) {
		var container = vm.get();

		var _data_application = {};
		var _data = {};

		container.layout = function() {
			if (arguments.length == 4) {
				container.whxy(arguments[0],arguments[1],arguments[2],arguments[3]);
			}


		}

		//redefine free function
		container.free = function() {

		}

		return container;
	}

	seeker.annotator_menu = function(vm) {
		var container = vm.get();


	}
})();