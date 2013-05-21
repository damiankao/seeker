(function() {
	seeker = {};
	seeker.util = {}

	seeker.util.winDimensions = function() {
		if (typeof window.innerWidth !== 'undefined') {
			return [window.innerWidth,window.innerHeight];
		} else {
			return [document.getElementsByTagName('body')[0].clientWidth,document.getElementsByTagName('body')[0].clientHeight];
		}
	}

})();