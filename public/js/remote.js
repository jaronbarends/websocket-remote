(function($) {

	'use strict';

	// define semi-global variables (vars that are "global" in this file's scope) and prefix them
	// with sg so we can easily distinguish them from "normal" vars
	var sgSocket,
		sgUserId = '',
		sgUserColor,
		sgGyro = {};

	
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
	var enterRoom = function() {
		var data = {
				role: 'remote',
				id: sgUserId,
				color: sgUserColor
			};
		console.log(data);

		//tell socket we want to enter the session
		sgSocket.emit('enter', data);
	};


	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var setUserColor = function() {
		var colors = ['AliceBlue', 'AntiqueWhite', 'Aqua', 'Aquamarine', 'Azure', 'Beige', 'Bisque', 'Black', 'BlanchedAlmond', 'Blue', 'BlueViolet', 'Brown', 'BurlyWood', 'CadetBlue', 'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue', 'Cornsilk', 'Crimson', 'Cyan', 'DarkBlue', 'DarkCyan', 'DarkGoldenRod', 'DarkGray', 'DarkGreen', 'DarkKhaki', 'DarkMagenta', 'DarkOliveGreen', 'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue', 'DarkSlateGray', 'DarkTurquoise', 'DarkViolet', 'DeepPink', 'DeepSkyBlue', 'DimGray', 'DodgerBlue', 'FireBrick', 'FloralWhite', 'ForestGreen', 'Fuchsia', 'Gainsboro', 'GhostWhite', 'Gold', 'GoldenRod', 'Gray', 'Green', 'GreenYellow', 'HoneyDew', 'HotPink', 'IndianRed ', 'Indigo ', 'Ivory', 'Khaki', 'Lavender', 'LavenderBlush', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral', 'LightCyan', 'LightGoldenRodYellow', 'LightGray', 'LightGreen', 'LightPink', 'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 'LightSteelBlue', 'LightYellow', 'Lime', 'LimeGreen', 'Linen', 'Magenta', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 'MediumOrchid', 'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue', 'MediumSpringGreen', 'MediumTurquoise', 'MediumVioletRed', 'MidnightBlue', 'MintCream', 'MistyRose', 'Moccasin', 'NavajoWhite', 'Navy', 'OldLace', 'Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip', 'PeachPuff', 'Peru', 'Pink', 'Plum', 'PowderBlue', 'Purple', 'RebeccaPurple', 'Red', 'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 'SeaShell', 'Sienna', 'Silver', 'SkyBlue', 'SlateBlue', 'SlateGray', 'Snow', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Thistle', 'Tomato', 'Turquoise', 'Violet', 'Wheat', 'White', 'WhiteSmoke', 'Yellow', 'YellowGreen'],
		len = colors.length;

		sgUserColor = colors[Math.floor(len*Math.random())];

		$('.color-square').css('background', sgUserColor);
	};
	



	/**
	* when remote is tilted, send its data to the socket
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var gyroHandler = function(e, data) {

		var tiltLR = Math.round(data.tiltLR),
			tiltFB = Math.round(data.tiltFB),
			dir = Math.round(data.dir);

		if (sgGyro.tiltLR !== tiltLR || sgGyro.tiltFB !== tiltFB || sgGyro.dir !== dir) {
			sgGyro = {
				tiltLR: tiltLR,
				tiltFB: tiltFB,
				dir: dir
			};

			var newData = {
				id: sgUserId,
				orientation: sgGyro
			};
			sgSocket.emit('tiltchange', newData);
		}
	};


	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var initGyro = function() {
		sgGyro = {
			tiltLR: 0,
			tiltFB: 0,
			dir: 0
		};

		$('body').on('tiltchange.gyro', gyroHandler);
	};

	
	


	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var initRemote = function() {
		initIdentifier();
		setUserColor();
		initSocketListeners();
		initGyro();
		enterRoom();
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