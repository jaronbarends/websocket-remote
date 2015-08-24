(function($) {

	'use strict';

	var sgGyroPollingFrequency = 200,
		$body = $('body');


	/**
	* handle gyro input
	* @param {object} obj Object with gyroscopic data
	* @returns {undefined}
	*/
	var gyroHandler = function(obj) {

		var xDeg = obj.gamma,
			yDeg = obj.beta,
			zDeg = obj.alpha;

		var data = {
			x: xDeg,
			y: yDeg,
			z: zDeg
		};
		$body.trigger('tiltchange.tiltfactor', data);
	};
	

	/**
	* initialize everything
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var init = function() {
		gyro.frequency = sgGyroPollingFrequency;
		gyro.startTracking(gyroHandler);
	};
	
	init();
	

})(jQuery);