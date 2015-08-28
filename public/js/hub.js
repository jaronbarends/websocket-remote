(function($) {

	'use strict';

	// define semi-global variables (vars that are "global" in this file's scope) and prefix them
	// with sg so we can easily distinguish them from "normal" vars
	var sgSocket,
		sgRole = 'hub',
		$sgGyroTable = $('#gyro-table'),
		sgDeviceIdPrefix = 'device-',//prefix used for device elements' ids
		$sgDevices = $('#devices-container');

	
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
		//this hub has been accepted into the room
	};


	/**
	* create a device on screen for a user
	* @param {object} data Info about the newly connected user
	* @returns {undefined}
	*/
	var createDevice = function(data) {
		var deviceId = sgDeviceIdPrefix+data.id,
			$clone = $('#clone-src')
				.find('.user-device')
				.clone()
				.attr('id', deviceId)
				.find('.user')
					.text(data.username)
				.end()
				.find('.user-color')
					.css('background', data.color)
				.end()
				.hide()
				.appendTo($sgDevices)
				.fadeIn();
	};


	/**
	* remove a device from screen
	* @returns {undefined}
	*/
	var removeDevice = function(id) {
		var deviceId = sgDeviceIdPrefix+id;
		$('#'+deviceId).fadeOut(function(){$(this).remove();});
	};
	


	/**
	* handle entry of new user in the room
	* @param {object} data Info about the entering user
	* @returns {undefined}
	*/
	var newUserHandler = function(data) {
		//console.log('new user has entered: '+data.id+' ('+data.role+')');
		if (data.role === 'remote') {
			createDevice(data);
		}
	};


	/**
	* handle user disconnecting
	* @param {object} data Object containing disconnected user's id
	* @returns {undefined}
	*/
	var disconnectHandler = function(data) {
		var id = data.id;
		removeDevice(id);
	};
	


	/**
	* handle the orientation change of one of the remote devices
	* @param {object} data Data sent by remote.js's tiltchange event
	* @returns {undefined}
	*/
	var tiltChangeHandler = function(data) {
		var orientation = data.orientation;

		var dirCorrection = 0;//direction is determined by the devices angle relative to the screen at the time of connecting
			//TODO: has to be callibrated by pointing to screen

		orientation.tiltFB -= 90;//tiltFB = 0 when remote device is horizontal, we want it to correspond with vertical screen
		orientation.dir += dirCorrection;

		var rotateLR = "rotate3d(0,0,1, "+ orientation.tiltLR +"deg)",
			rotateFB = "rotate3d(1,0,0, "+ (orientation.tiltFB*-1)+"deg)",
			rotateDir = "rotate3d(0,0,1, "+(orientation.dir*-1)+"deg)";

		var $device = $('#'+sgDeviceIdPrefix+data.id).find('.device');//TODO: move devices in array and search array
		
		var css = {
			transform: rotateLR+' '+rotateFB+' '+rotateDir
		};

		$device.css(css);
		//showOrientationData(data);
	};


	//-- Start debug-functions --
	
		/**
		* show orientation data DIFFERENT DEVICES ARE NOT DISTINGUISHED YET
		* @param {object} data Data sent by remote.js's tiltchange event
		* @returns {undefined}
		*/
		var showOrientationData = function(data) {
			var orientation = data.orientation;

			var h = '<tr>';
				h += '<td>'+orientation.tiltLR+'</td>';
				h += '<td>'+orientation.tiltFB+'</td>';
				h += '<td>'+orientation.dir+'</td>';
				h += '</td>';

			$sgGyroTable.append(h);
			var $trs = $sgGyroTable.find('tr');
			if ($trs.length === 12) {
				$trs.eq(1).remove();
			}
		};
		
	
	//-- End debug-functions --",
	

	/**
	* add event listeners for socket
	* @returns {undefined}
	*/
	var initSocketListeners = function() {
		sgSocket.on('accepted', acceptedHandler);
		sgSocket.on('newuser', newUserHandler);
		sgSocket.on('disconnect', disconnectHandler);
		sgSocket.on('tiltchange', tiltChangeHandler);
	};


	/**
	* send event to server to request entry to room
	* @returns {undefined}
	*/
	var enterRoom = function() {
		var data = {
				role: sgRole,
				id: sgSocket.id,
			};

		//tell socket we want to enter the session
		sgSocket.emit('enter', data);
	};
		
	
	/**
	* initialize this hub when
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var initHub = function() {
		initIdentifier();
		initSocketListeners();
		enterRoom();
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
			initHub();
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