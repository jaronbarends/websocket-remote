;(function($) {

	var $body = $('body');


	/**
	* handle device orientation change
	* @param {object} data Event data
	* @returns {undefined}
	*/
	var deviceOrientationHandler = function(data) {
		//create object with data to pass on
		var newData = {
			tiltLR: data.gamma, //left-to-right tilt in degrees, where right is positive
			tiltFB: data.beta,//front-to-back tilt in degrees, where front is positive
			dir: data.alpha,//compass direction the device is facing in degrees
			absolute: data.absolute//whether direction is absolute to north or relative to direction at first call
		};

		$body.trigger('tiltchange.deviceorientation', newData);
	};


	/**
	* initialize all
	* @returns {undefined}
	*/
	var init = function() {

		if (window.DeviceOrientationEvent) {
			window.addEventListener('deviceorientation', deviceOrientationHandler, false);
		} else {
			//console.log('deviceOrientationEvent not supported');
		}
	};
	

	$(document).ready(init);

})(jQuery);