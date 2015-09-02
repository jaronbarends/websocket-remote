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
	var sgUser = {
			id: '',
			username: '',
			role: 'remote',
			color: '',
			idx: 0,//the index of this user in the users array
			hasJoined: false,
			calibrations: 0,//number of calibrations this user has made
			hasKnownPosition: false,
			isHub: false//flag indicating if this device is the room's central hub / point of reference
		},
		sgDevice = {
			orientation: {},
			isCalibrated: false,
			compassCorrection: 0
		},
		sgUsers = [],//array of users, in order of joining
		sgCalibratedUsers = [],
		sgDirections = [];//array of directions to users

	var $sgCalibrationBox = $('#calibration-box');

	

	/**
	* log to screen
	* @returns {undefined}
	*/
	var log = function(msg) {
		$('#logwin').html(msg);
	};
	

	/**
	* add identifier for this user
	* @returns {undefined}
	*/
	var initIdentifier = function() {
		$('#id-box').find('.user-id').text(io.id);
	};

	/**
	* return the latest user in the users array
	* @returns {object} The user object of the latest user who joined
	*/
	var getLatestUser = function() {
		return sgUsers[sgUsers.length-1];
	};


	/**
	* set a dummy username
	* @returns {undefined}
	*/
	var setUserName = function() {
		var names = ['jan','piet','kees','klaas','fred','koos','wim','truus','trees','bep','jannie','clara'],
			nm = names[Math.floor(names.length*Math.random())]+Math.ceil(99*Math.random());
		sgUser.username = nm;
		$('input[name="username"]').val(nm);
	};
	

	/**
	* set an identifying color for this user
	* @returns {undefined}
	*/
	var setUserColor = function() {
		var colors = ['Aqua', 'Aquamarine', 'Black', 'Blue', 'BlueViolet', 'Brown', 'CadetBlue', 'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue', 'Crimson', 'DarkBlue', 'DarkCyan', 'DarkGoldenRod', 'DarkGray', 'DarkGreen', 'DarkMagenta', 'DarkOliveGreen', 'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue', 'DarkSlateGray', 'DarkTurquoise', 'DarkViolet', 'DeepPink', 'DeepSkyBlue', 'DimGray', 'DodgerBlue', 'FireBrick', 'ForestGreen', 'Fuchsia', 'Gold', 'GoldenRod', 'Gray', 'Green', 'GreenYellow', 'HotPink', 'IndianRed ', 'Indigo ', 'LawnGreen', 'LightBlue', 'LightCoral', 'LightGreen', 'LightPink', 'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 'LightSteelBlue', 'Lime', 'LimeGreen', 'Magenta', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 'MediumOrchid', 'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue', 'MediumTurquoise', 'MediumVioletRed', 'MidnightBlue', 'Navy', 'Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleVioletRed', 'Peru', 'Pink', 'Plum', 'Purple', 'RebeccaPurple', 'Red', 'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 'Sienna', 'SkyBlue', 'SlateBlue', 'SlateGray', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Tomato', 'Turquoise', 'Violet', 'Yellow', 'YellowGreen'],
		len = colors.length;

		sgUser.color = colors[Math.floor(len*Math.random())];

		$('.user-color').css('background', sgUser.color);
	};



	/**
	* change a property of the current user and send changed users object to sockets
	* @returns {undefined}
	*/
	var updateUserAndEmit = function(prop, val) {
		sgUser[prop] = val;
		for (var i=0, len=sgUsers.length; i<len; i++) {
			var currUser = sgUsers[i];
			if (currUser.id === sgUser.id) {
				sgUsers[i] = sgUser;
				break;
			}
		}
		emitEvent('updateusers', sgUsers);
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

		dir -= sgDevice.compassCorrection;

		if (sgDevice.orientation.tiltLR !== tiltLR || sgDevice.orientation.tiltFB !== tiltFB || sgDevice.orientation.dir !== dir) {
			sgDevice.orientation = {
				tiltLR: tiltLR,
				tiltFB: tiltFB,
				dir: dir
			};

			var newData = {
				id: io.id,
				orientation: sgDevice.orientation
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
		sgDevice.orientation = {
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
			sgUser.username = $form.find('[name="username"]').val() || sgUser.username;

			joinRoom();
		});
	};
	

	/**
	* handle socket's acceptance of entry request
	* @param {object} users All users currently in the room
	* @returns {undefined}
	*/
	var joinedHandler = function(users) {
		//this remote has been joined the room
		$('#login-form').hide();
		sgUsers = users;

		var idx = sgUsers.length-1;
		sgUser.idx = idx;

		if (idx === 0) {
			//this is the first device
			sgUser.isHub = true;
			//console.log('you are the first to join');
		} else {
			var usernames = [];
			for (var i=0, len=users.length-1; i<len; i++) {
			 	usernames.push(users[i].username);
			}
			usernames = usernames.join(', ');
			//console.log('you just joined the room with ',usernames);
			//showCalibration();
		}

		//setup listener for calibration events, so we know when it's this user's turn
		io.on('calibrationupdate.positionawaresockets', calibrationupdateHandler);

		//console.log('number of users:', sgUsers.length);
	};


	/**
	* handle entry of new user in the room
	* @param {object} data Info about the joining user
	* @returns {undefined}
	*/
	var newUserHandler = function(users) {
		sgUsers = users;

		var newUser = getLatestUser();
		//console.log('new user '+newUser.username+' has just joined');
		//The first who joins only has to do calibration when the 2nd user joins
		//The 2nd has to calibrate with nr1 on his own joined-event and with nr3's newUser event
		//The rest has to do the calibration with their 2 predecessors on their on joined event
		if (sgUser.isHub && !sgUser.hasKnownPosition) {
			showCalibration();
		} else {
			//if hub hasKnownPosition && this === 2nd showCal()
		}
	};


	/**
	* handle user disconnecting 
	* @returns {undefined}
	*/
	var userDisconnectHandler = function() {
		
	};
	


	/**
	* add event listeners for socket
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var initSocketListeners = function() {
		io.on('joined', joinedHandler);
		io.on('newuser', newUserHandler);
		io.on('disconnect', userDisconnectHandler);
		io.on('updateusers', function(users) {sgUsers = users;});
	};


	/**
	* send event to server to request entry to room
	* @returns {undefined}
	*/
	var joinRoom = function() {
		io.emit('join', sgUser);
	};


	/**
	* show the calibration box
	* @returns {undefined}
	*/
	var showCalibration = function() {
		var idx = sgUser.idx,
			calibs = sgUser.calibrations,
			otherUser,
			otherIdx;

		//determine which user to point to
		if (idx === 0) {
			otherIdx = 1;
		} else if (idx === 1) {
			if (calibs === 0) {
				otherIdx = 0;
			} else {
				otherIdx = 2;
			}
		} else {
			//if calibrations === 0 we have to calibrate with idx -1
			//if calibrations === 1 we have to calibrate with idx -2
			otherIdx = idx-calibs-1;
		}
		otherUser = sgUsers[otherIdx];

		//show calibration box if the other user has already joined (this may not be the case with only 2 users)
		if (otherUser) {
			$sgCalibrationBox.find('.calibrate-user-name')
					.text(otherUser.username)
				.end()
				.find('input[name="calibrate-user-id"]')
					.val(otherUser.id)
				.end()
				.show();
		}
	};//showCalibration


	/**
	* a calibration has been added or removed
	* @returns {undefined}
	*/
	var calibrationupdateHandler = function(directions) {
		sgDirections = directions;

		//check if there is another user who has to calibrate
		var done = true;
		//console.log(sgUsers);
		for (var i=0, len=sgUsers.length; i<len; i++) {
			var user = sgUsers[i];
			//console.log(user);
			//console.log(user.hasKnownPosition);
			if (user.hasKnownPosition) {
				//continue
				if (user.id === sgUser.id) {console.log('my position is known')}
			} else {
				//this is the first joining user that hasn't calibrated yet
				done = false;
				if (user.id === sgUser.id) {
					console.log('my position isnt known');
					//then this user has to calibrate
					showCalibration();
				}
				break;
			}
		}

		if (done) {
			//hide message that not everyone is ready
		}
	};


	/**
	* handle clicking calibration button
	* @returns {undefined}
	*/
	var calibrationHandler = function(e) {
		e.preventDefault();
		$sgCalibrationBox.hide();

		//store current direction and id of other user
		sgDevice.compassCorrection = sgDevice.orientation.dir;
		var dir = sgDevice.orientation.dir,
			otherUserId = $(e.currentTarget).find('[name="calibrate-user-id"]').val(),
			dirObject = {
				fromId: sgUser.id,
				toId: otherUserId,
				dir: dir
			};
		log('dir:'+sgDevice.orientation.dir+'<br>'+otherUserId);
		sgDirections.push(dirObject);

		//update number of calibrations and see if we're done
		sgUser.calibrations++;

		if (sgUser.idx === 0) {
			//then we only have to calibrate with one user, so we're done
			updateUserAndEmit('hasKnownPosition', true);
			console.log('I\'m idx0; I am done');
		} else if (sgUser.idx === 1 && sgUser.calibrations === 1 && sgUsers.length === 2) {
			//then we only have idx0 and idx1
			//we could start interacting with idx0
			//but we're not done until idx2 joins and we calibrate with idx2
			console.log('Im idx1; I am done for now, but need more');
		} else if (sgUser.calibrations === 2) {
			//then we're done
			updateUserAndEmit('hasKnownPosition', true);
		}

		//send the updated directions object to the other sockets
		emitEvent('calibrationupdate.positionawaresockets', sgDirections);

	};


	/**
	* initialize the calibration form
	* @returns {undefined}
	*/
	var initCalibrationForm = function() {
		$('#calibration-form').on('submit', calibrationHandler);
	};


	/**
	* initialize the remote
	* @returns {undefined}
	*/
	var initRemote = function() {
		initIdentifier();
		sgUser.id = io.id;
		sgUser.username = io.id;
		setUserName();
		setUserColor();
		initSocketListeners();
		initDeviceOrientation();
		initLoginForm();
		initCalibrationForm();
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