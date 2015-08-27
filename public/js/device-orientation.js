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
	

	function deviceOrientationHandler_bak(tiltLR, tiltFB, dir) {

		//send event notifying about tilt
		var data = {
			tiltLR: tiltLR,
			tiltFB: tiltFB,
			dir: dir
		};
		$body.trigger('tiltchange.deviceorientation', data);

	}

	function init() {

		if (window.DeviceOrientationEvent) {
			// Listen for the deviceorientation event and handle the raw data
			/*
			window.addEventListener('deviceorientation', function(eventData) {
				var tiltLR = eventData.gamma, //left-to-right tilt in degrees, where right is positive
					tiltFB = eventData.beta,//front-to-back tilt in degrees, where front is positive
					dir = eventData.alpha,//compass direction the device is facing in degrees
					absolute = eventData.absolute;//wheter direction is absolute to north or relative to first call
				
				// call our orientation event handler
				deviceOrientationHandler(tiltLR, tiltFB, dir);
			}, false);
			*/
			window.addEventListener('deviceorientation', deviceOrientationHandler, false);

		} else {
			//console.log('deviceOrientationEvent not supported');
		}
	}

	$(document).ready(init);

})(jQuery);