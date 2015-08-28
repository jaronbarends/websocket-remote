;(function($) {

	'use strict';

	// define semi-global variables (vars that are "global" in this file's scope) and prefix them
	// with sg so we can easily distinguish them from "normal" vars
	var sgSocket,
		sgUsername = '',
		sgRole = 'remote',
		sgUserColor,
		sgOrientation = {},
		sgCompassCorrection = 0,
		sgScreenAngle,
		sgIsHub;

	
	/**
	* add identifier for this user
	* @returns {undefined}
	*/
	var initIdentifier = function() {
		$('#id-box').find('.user-id').text(sgSocket.id);
	};


	/**
	* handle socket's acceptance of entry request
	* @param {object} data Data sent by the socket (currently empty)
	* @returns {undefined}
	*/
	var acceptedHandler = function(data) {
		//this remote has been accepted into the room
		$('#login-form').hide();
	};


	/**
	* handle entry of new user in the room
	* @param {object} data Info about the entering user
	* @returns {undefined}
	*/
	var newUserHandler = function(data) {
		//console.log('new user has entered: '+data.id+' ('+data.role+')');
	};


	/**
	* handle user disconnecting 
	* @returns {undefined}
	*/
	var userDisconnectHandler = function() {
		
	};
	


	/**
	* add event listeners for so cket
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var initSocketListeners = function() {
		sgSocket.on('accepted', acceptedHandler);
		sgSocket.on('newuser', newUserHandler);
		sgSocket.on('disconnect', userDisconnectHandler);
	};


	/**
	* send event to server to request entry to room
	* @returns {undefined}
	*/
	var enterRoom = function() {
		var data = {
				role: sgRole,
				id: sgSocket.id,
				username: sgUsername,
				color: sgUserColor
			};

		sgSocket.emit('enter', data);
	};


	/**
	* set an identifying color for this user
	* @returns {undefined}
	*/
	var setUserColor = function() {
		var colors = ['AliceBlue', 'AntiqueWhite', 'Aqua', 'Aquamarine', 'Azure', 'Beige', 'Bisque', 'Black', 'BlanchedAlmond', 'Blue', 'BlueViolet', 'Brown', 'BurlyWood', 'CadetBlue', 'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue', 'Cornsilk', 'Crimson', 'Cyan', 'DarkBlue', 'DarkCyan', 'DarkGoldenRod', 'DarkGray', 'DarkGreen', 'DarkKhaki', 'DarkMagenta', 'DarkOliveGreen', 'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue', 'DarkSlateGray', 'DarkTurquoise', 'DarkViolet', 'DeepPink', 'DeepSkyBlue', 'DimGray', 'DodgerBlue', 'FireBrick', 'FloralWhite', 'ForestGreen', 'Fuchsia', 'Gainsboro', 'GhostWhite', 'Gold', 'GoldenRod', 'Gray', 'Green', 'GreenYellow', 'HoneyDew', 'HotPink', 'IndianRed ', 'Indigo ', 'Ivory', 'Khaki', 'Lavender', 'LavenderBlush', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral', 'LightCyan', 'LightGoldenRodYellow', 'LightGray', 'LightGreen', 'LightPink', 'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 'LightSteelBlue', 'LightYellow', 'Lime', 'LimeGreen', 'Linen', 'Magenta', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 'MediumOrchid', 'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue', 'MediumSpringGreen', 'MediumTurquoise', 'MediumVioletRed', 'MidnightBlue', 'MintCream', 'MistyRose', 'Moccasin', 'NavajoWhite', 'Navy', 'OldLace', 'Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip', 'PeachPuff', 'Peru', 'Pink', 'Plum', 'PowderBlue', 'Purple', 'RebeccaPurple', 'Red', 'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 'SeaShell', 'Sienna', 'Silver', 'SkyBlue', 'SlateBlue', 'SlateGray', 'Snow', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Thistle', 'Tomato', 'Turquoise', 'Violet', 'Wheat', 'White', 'WhiteSmoke', 'Yellow', 'YellowGreen'],
		len = colors.length;

		sgUserColor = colors[Math.floor(len*Math.random())];

		$('.user-color').css('background', sgUserColor);
	};


	/**
	* send an event to the socket server that will be passed on to all sockets
	* @returns {undefined}
	*/
	var emitEvent = function(eventName, eventData) {
		var data = {
			eventName: eventName,
			eventData: eventData
		};
		sgSocket.emit('passthrough', data);
	};


	/**
	* when remote is tilted, send orientation data and this device's id to the socket
	* @param {event} e The tiltchange.deviceorientation event sent by device-orientation.js
	* @param {object} data Data sent accompanying the event
	* @returns {undefined}
	*/
	var tiltChangeHandler = function(e, data) {

		var tiltLR = Math.round(data.tiltLR),
			tiltFB = Math.round(data.tiltFB),
			dir = Math.round(data.dir);

		dir -= sgCompassCorrection;

		if (sgOrientation.tiltLR !== tiltLR || sgOrientation.tiltFB !== tiltFB || sgOrientation.dir !== dir) {
			sgOrientation = {
				tiltLR: tiltLR,
				tiltFB: tiltFB,
				dir: dir
			};

			var newData = {
				id: sgSocket.id,
				orientation: sgOrientation
			};
			emitEvent('tiltchange', newData);
		}
	};


	/**
	* initialize stuff for handling device orientation changes
	* listen for events triggered on body by device-orientation.js
	* @returns {undefined}
	*/
	var initDeviceOrientation = function() {
		sgOrientation = {
			tiltLR: 0,
			tiltFB: 0,
			dir: 0
		};

		$('body').on('tiltchange.deviceorientation', tiltChangeHandler);
	};



	/**
	* initialize the login form
	* @returns {undefined}
	*/
	var initLoginForm = function() {
		$('#login-form').on('submit', function(e) {
			e.preventDefault();

			var $form = $(e.currentTarget);
			sgUsername = $form.find('[name="username"]').val() || sgUsername;

			enterRoom();
		});
	};


	/**
	* handle clicking callibration button
	* @returns {undefined}
	*/
	var callibrationHandler = function(e) {
		e.preventDefault();
		console.log('handler');
		sgCompassCorrection = sgOrientation.dir;
	};
	


	/**
	* initialize the callibration form
	* @returns {undefined}
	*/
	var initCallibrationForm = function() {
		$('#callibration-form').on('submit', callibrationHandler);
	};
	
	


	/**
	* initialize the remote
	* @returns {undefined}
	*/
	var initRemote = function() {
		initIdentifier();
		sgUsername = sgSocket.id;
		setUserColor();
		initSocketListeners();
		initDeviceOrientation();
		initLoginForm();
		initCallibrationForm();
		//enterRoom();
	};


	/**
	* kick off the app once the socket is ready
	* @param {event} e The ready.socket event sent by socket js
	* @param {Socket} socket This client's socket
	* @returns {undefined}
	*/
	var socketReadyHandler = function(e, socket) {
		if (socket) {
			sgSocket = socket;
			initRemote();
		}
	};
	
	
	/**
	* initialize the app
	* (or rather: set a listener for the socket to be ready, the handler will initialize the app)
	* @returns {undefined}
	*/
	var init = function() {
		$(document).on('connectionready.socket', socketReadyHandler);
	};

	$(document).ready(init);


})(jQuery);