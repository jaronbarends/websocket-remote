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


		socket.on('connectionready', function() {
			console.log('socket.js - connection ready');
			$(document).trigger('connectionready.socket', socket);
		});
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