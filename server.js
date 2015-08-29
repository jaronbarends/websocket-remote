// This is the server-side file of our mobile remote controller app.
// It initializes socket.io and a new express instance.
// Start it by running 'node socket-server' from your terminal.


// Define global vars
var express,
	app,
	port,
	io,
	rooms,
	roomName = 'defaultRoom';//we're only supporting one room for now


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
* get all users in the room
* @returns {array} Associative array containing all user id's in the room
*/
var getRoomUsers = function() {
	var users = io.sockets.adapter.rooms[roomName];

	return users;
};



/**
* handle user disconnecting (closing browser window)
* @returns {undefined}
*/
var disconnectHandler = function(socket) {
	console.log('\n-------------------------------------------');
	console.log('user '+socket.id+' disconnected\n');
	var data = {
		id: socket.id,
		users: getRoomUsers()
	};
	rooms.emit('disconnect', data);
};


/**
* handle new user joining the room
* @returns {undefined}
*/
var joinHandler = function(socket, data) {
	var newuserData = data,
		acceptanceData = {};

	socket.join(roomName);

	newuserData.users = acceptanceData.users = getRoomUsers(roomName);

	console.log('socket join event ('+data.role+') id:'+data.id);

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
		rooms.emit(data.eventName, data.eventData);
	}
};


/**
* create the server where all sockets can be handled
* @returns {undefined}
*/
var createServer = function() {
	rooms = io.on('connection', function (socket) {

		// A new client has come online. 
		socket.emit('connectionready');

		socket.on('disconnect', function(){
			disconnectHandler(socket);
		});

		socket.on('enter', function(data) {
			joinHandler(socket, data);
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
	createServer();
	console.log('Now running on http://localhost:' + port);
};

init();
