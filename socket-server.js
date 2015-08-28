// This is the server-side file of our mobile remote controller app.
// It initializes socket.io and a new express instance.
// Start it by running 'node socket-server' from your terminal.


// Define global vars
var express,
	app,
	port,
	io,
	room;


/**
* initialize basic requirements for the server
* @returns {undefined}
*/
var initBasicRequirements = function() {

	//create express server
	express = require('express');
	app = express();

	//set port that we'll use
	port = process.env.PORT || 8000;// This is needed if the app is run on heroku and other cloud providers:

	// Initialize a new socket.io object. It is bound to 
	// the express app, which allows them to coexist.
	io = require('socket.io').listen(app.listen(port));

	// Make the files in the public folder available to the world
	app.use(express.static(__dirname + '/public'));
};


/**
* handle user disconnecting
* @returns {undefined}
*/
var disconnectHandler = function(socket) {
	console.log('user '+socket.id+' disconnected');
	var data = {
		id: socket.id
	};
	room.emit('disconnect', data);
};


/**
* handle new user entering the room
* @returns {undefined}
*/
var enterHandler = function(socket, data) {
	var newuserData = data,
		acceptanceData = {};

	console.log('socket enter event ('+data.role+') id:'+data.id);

	//send message to newly accepted user
	socket.emit('accepted', acceptanceData);

	//send message to rest of the room
	socket.broadcast.emit('newuser', newuserData);
};


/**
* handle event that just has to be passed through to all sockets
* this way, we don't have to listen for and handle specific events separately
* @param {object} data Object containing {string} eventName and {object} eventData
* @returns {undefined}
*/
var passThroughHandler = function(data) {
	if (data.eventName && data.eventData) {
		room.emit(data.eventName, data.eventData);
	}
};


/**
* handle device tilt change
* @returns {undefined}
*/
var tiltchangeHandler = function(data) {
	room.emit('tiltchange', data);
};


/**
* create a "room" where all sockets can meet up
* @returns {undefined}
*/
var createRoom = function() {
	room = io.on('connection', function (socket) {

		// A new client has come online. 
		socket.emit('connectionready');

		socket.on('disconnect', function(){
			disconnectHandler(socket);
		});

		socket.on('enter', function(data) {
			enterHandler(socket, data);
		});

		//set handler for events that only have to be passsed on to all sockets
		socket.on('passthrough', passThroughHandler);
	});
};


/**
* 
* @param {string} varname Description
* @returns {undefined}
*/
var init = function() {
	initBasicRequirements();
	createRoom();
	console.log('Now running on http://localhost:' + port);
};

init();
