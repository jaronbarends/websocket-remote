;(function($) {

	'use strict';

	/* global io */ //instruction for jshint

	//globals:
	//window.io is defined by socket.IO.
	//It represents the socket server.
	//io is a bit of a strange name, but it's being used in examples everywhere,
	//so let's stick to that.


	// define semi-global variables (vars that are "global" in this file's scope) and prefix them
	// with sg so we can easily distinguish them from "normal" vars
	var sgUsername = '',
		sgRole = 'remote',
		sgUserColor,
		sgOrientation = {},
		sgCompassCorrection = 0,
		sgScreenAngle,
		sgUsers = [];//array of users, in order of joining

	
	/**
	* add identifier for this user
	* @returns {undefined}
	*/
	var initIdentifier = function() {
		$('#id-box').find('.user-id').text(io.id);
	};


	/**
	* handle socket's acceptance of entry request
	* @param {object} data Data sent by the socket (currently empty)
	* @returns {undefined}
	*/
	var joinedHandler = function(data) {
		//this remote has been joined the room
		$('#login-form').hide();
	};


	/**
	* handle entry of new user in the room
	* @param {object} users Updated array with users; the newly added user is the last one in the array
	* @returns {undefined}
	*/
	var newUserHandler = function(users) {
		//console.log('new user has joined: '+data.id+' ('+data.role+')');
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
		io.on('joined', joinedHandler);
		io.on('newuser', newUserHandler);
		io.on('disconnect', userDisconnectHandler);
	};


	/**
	* send event to server to request entry to room
	* @returns {undefined}
	*/
	var joinRoom = function() {
		var data = {
				role: sgRole,
				id: io.id,
				username: sgUsername,
				color: sgUserColor
			};

		io.emit('join', data);
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
		io.emit('passthrough', data);
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
				id: io.id,
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

			joinRoom();
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
		sgUsername = io.id;
		setUserColor();
		initSocketListeners();
		initDeviceOrientation();
		initLoginForm();
		initCallibrationForm();
		//joinRoom();
	};


	/**
	* kick off the app once the socket connection is ready
	* @param {event} e The ready.socket event sent by socket js
	* @param {Socket} socket This client's socket
	* @returns {undefined}
	*/
	var connectionReadyHandler = function(e, io) {
		if (io) {
			initRemote();
		}
	};
	
	
	/**
	* initialize the app
	* (or rather: set a listener for the socket to be ready, the handler will initialize the app)
	* @returns {undefined}
	*/
	var init = function() {
		$(document).on('connectionready.socket', connectionReadyHandler);
	};

	$(document).ready(init);


})(jQuery);