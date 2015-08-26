(function($) {

	'use strict';

	// define semi-global variables (vars that are "global" in this file's scope) and prefix them
	// with sg so we can easily distinguish them from "normal" vars
	var sgSocket,
		sgUserId = '',
		$sgNumber,
		$sgGyroTable = $('#gyro-table'),
		deviceIdPrefix = 'device-',//prefix used for device elements' ids
		//$device = $('.device'),
		$devices = $('#devices-container');

	
	//-- Start general stuff (for both main and remote) --
	
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
			//console.log('you\'re now added to the room');
		};


		/**
		* create a device on screen for a user
		* @param {string} varname Description
		* @returns {undefined}
		*/
		var createDevice = function(data) {
			var deviceId = deviceIdPrefix+data.id,
				$device = $('#clone-src')
					.find('.user-device')
					.clone()
					.attr('id', deviceId)
					.appendTo($devices);
		};
		


		/**
		* 
		* @param {string} varname Description
		* @returns {undefined}
		*/
		var newUserHandler = function(data) {
			console.log('new user has entered: '+data.id+' ('+data.role+')');
			if (data.role === 'remote') {
				createDevice(data);
			}
		};



		/**
		* 
		* @param {string} varname Description
		* @returns {undefined}
		*/
		var showGyroData = function(data) {
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


		/**
		* change a specific device's orientation
		* @param {string} varname Description
		* @returns {undefined}
		*/
		var changeDeviceRotation = function(id, rotation) {
			//first get the device we need
			var deviceId = deviceIdPrefix+data.id,
			$device = $('#'+deviceId);
			
			var css = {
				transform: rotation
			};

			$device.css(css);
		};
		
		


		/**
		* 
		* @param {string} varname Description
		* @returns {undefined}
		*/
		var gyroHandler = function(data) {
			/* one of the devices has a tiltchange */
			console.log(data);
			var id = data.id,
				orientation = data.orientation,
				dirCorrection = 0;//direction is determined by the devices angle relative to the screen at the time of connecting
				//TODO: has to be callibrated by pointing to screen

			orientation.tiltFB -= 90;//tiltFB = 0 when remote device is horizontal, we want it to correspond with vertical screen
			orientation.dir += dirCorrection;

			var rotateLR = "rotate3d(0,0,1, "+ orientation.tiltLR +"deg)",
				rotateFB = "rotate3d(1,0,0, "+ (orientation.tiltFB*-1)+"deg)",
				rotateDir = "rotate3d(0,0,1, "+(orientation.dir*-1)+"deg)",
				rotation = rotateLR+' '+rotateFB+' '+rotateDir;

			changeDeviceRotation(id, rotation);
			showGyroData(data);
		};

		


		/**
		* add event listeners for socket
		* @param {string} varname Description
		* @returns {undefined}
		*/
		var initSocketListeners = function() {
			sgSocket.on('accepted', acceptedHandler);
			sgSocket.on('newuser', newUserHandler);
			sgSocket.on('change', changeHandler);
			sgSocket.on('tiltchange', gyroHandler);
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
		* 
		* @param {string} varname Description
		* @returns {undefined}
		*/
		var initStart = function() {
			$('.js-start-btn').on('click', startClient);
		};
	
	//-- End general stuff (for both main and remote) --",

	


	//-- Start main stuff --
		
		/**
		* 
		* @param {string} varname Description
		* @returns {undefined}
		*/
		var changeHandler = function(data) {
			var inc = data.inc,
				number = parseInt($sgNumber.text(), 10);

			number += inc;
			number = Math.max(0, number);
			$sgNumber.text(number);
		};


		/**
		* 
		* @param {string} varname Description
		* @returns {undefined}
		*/
		var initApp = function() {
			$sgNumber =  $('#main-number');

			initIdentifier();
			initSocketListeners();
			enterRoom();
		};

	
	//-- End main stuff --",
	
	
	
	



	/**
	* 
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var socketReadyHandler = function(e, data) {
		if (data && data.socket) {
			sgSocket = data.socket;
			initApp();
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