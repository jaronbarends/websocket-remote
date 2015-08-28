(function($) {

	'use strict';

	// define semi-global variables (vars that are "global" in this file's scope) and prefix them
	// with sg so we can easily distinguish them from "normal" vars
	var sgSocket;


	/**
	* handle server's connectionready event
	* @returns {undefined}
	*/
	var connectionreadyHandler = function() {
		console.log('socket.js - connection ready');
		$(document).trigger('connectionready.socket', sgSocket);
	};
	

	/**
	* initialize the socket, and send event containing it to the page
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var initSocket = function() {
		sgSocket = io();
		sgSocket.on('connectionready', connectionreadyHandler);
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