(function($) {

	'use strict';

	/**
	* initialize the socket, and send event containing it to the page
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var initSocket = function() {
		var socket = io(),
			data = {
				socket: socket
			};

		$(document).trigger('ready.socket', data);
	};
	

	/**
	* initialize all
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var init = function() {
		initSocket();
	};

	$(document).ready(init);


})(jQuery);