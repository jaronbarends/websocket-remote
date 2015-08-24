(function($) {

	'use strict';

	// define semi-global variables (vars that are "global" in this file's scope) and prefix them
	// with sg so we can easily distinguish them from "normal" vars
	var sgSocket,
		sgUserId = '',
		sgTilt = {};

	
	/**
	* add identifier for this user
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var initIdentifier = function() {
		sgUserId = Math.ceil(1000*Math.random());
		$('#id-box').find('.user-id').text(sgUserId);
	};


	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var acceptedHandler = function(data) {
		//this remote has been accepted into the room
		console.log('you\'re now added to the room');
	};


	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var newUserHandler = function(data) {
		console.log('new user has entered: '+data.id+' ('+data.role+')');
	};


	/**
	* add event listeners for socket
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var initSocketListeners = function() {
		sgSocket.on('accepted', acceptedHandler);
		sgSocket.on('newuser', newUserHandler);
	};


	

	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var incrementHandler = function(e) {
		var $a = $(e.currentTarget),
			inc = parseInt($a.attr('data-increment'), 10),
			data = {
				inc: inc
			};

		sgSocket.emit('change', data);
	};


	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var enterRoom = function() {
		var data = {
				role: 'remote',
				id: sgUserId
			};

		//tell socket we want to enter the session
		sgSocket.emit('enter', data);
	};



	/**
	* when remote is tilted, send its data to the socket
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var tiltHandler = function(e, data) {

		var x = Math.round(data.x),
		y = Math.round(data.y),
		z = Math.round(data.z);

		if (sgTilt.x != x || sgTilt.y != y || sgTilt.z != z) {
			sgTilt = {
				x: x,
				y: y,
				z: z
			};
			sgSocket.emit('tiltchange', sgTilt)
		}
	};


	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var initTilt = function() {
		sgTilt = {
			x: 0,
			y: 0,
			z: 0
		};

		$('body').on('tiltchange.tiltfactor', tiltHandler);
	};

	
	


	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var initRemote = function() {
		initIdentifier();
		initSocketListeners();
		initTilt();
		enterRoom();

		$('.btn--increment').on('click', incrementHandler);
	};
	
	


	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var socketReadyHandler = function(e, data) {
		if (data && data.socket) {
			sgSocket = data.socket;
			initRemote();
		}
	};
	
	
	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var init = function() {
		$(document).on('ready.socket', socketReadyHandler);
	};

	$(document).ready(init);


})(jQuery);