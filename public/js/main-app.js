(function($) {

	'use strict';

	// define semi-global variables (vars that are "global" in this file's scope) and prefix them
	// with sg so we can easily distinguish them from "normal" vars
	var sgSocket,
		sgUserId = '',
		$sgNumber,
		$sgGyroTable = $('#gyro-table'),
		$device = $('.device');

	
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
		* 
		* @param {string} varname Description
		* @returns {undefined}
		*/
		var newUserHandler = function(data) {
			console.log('new user has entered: '+data.id+' ('+data.role+')');
		};


		/**
		* 
		* @param {string} varname Description
		* @returns {undefined}
		*/
		var tiltHandler = function(data) {
			//console.log(data);
			console.log(data.x);
			var deg = data.x,
				rotate = 'rotate('+deg+'deg)';

			//$device.css({'transform': rotate});
		};


		/**
		* 
		* @param {string} varname Description
		* @returns {undefined}
		*/
		var showGyroData = function(data) {
			var h = '<tr>';
				h += '<td>'+data.tiltLR+'</td>';
				h += '<td>'+data.tiltFB+'</td>';
				h += '<td>'+data.dir+'</td>';
				h += '</td>';

			$sgGyroTable.append(h);
			var $trs = $sgGyroTable.find('tr');
			if ($trs.length === 12) {
				$trs.eq(1).remove();
			}
		};
		


		/**
		* 
		* @param {string} varname Description
		* @returns {undefined}
		*/
		var gyroHandler = function(data) {
			data.tiltFB -= 90;//tiltFB = 0 when remote device is horizontal, we want it to correspond with vertical screen
			data.dir += 50;
			var rotateLR = "rotate3d(0,0,1, "+ data.tiltLR +"deg)",
				rotateFB = "rotate3d(1,0,0, "+ (data.tiltFB*-1)+"deg)",
				rotateDir = "rotate3d(0,0,1, "+(data.dir*-1)+"deg)";
			var css = {
				transform: rotateLR+' '+rotateFB+' '+rotateDir
			};
			// logo.style.webkitTransform = "rotate("+ tiltLR +"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";
			// logo.style.MozTransform = "rotate("+ tiltLR +"deg)";
			// logo.style.transform = "rotate("+ tiltLR +"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";

			$device.css(css);
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