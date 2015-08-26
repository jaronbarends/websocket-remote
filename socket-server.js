// This is the server-side file of our mobile remote controller app.
// It initializes socket.io and a new express instance.
// Start it by running 'node app.js' from your terminal.


// Creating an express server

var express = require('express'),
	app = express();

// This is needed if the app is run on heroku and other cloud providers:

var port = process.env.PORT || 8000;

// Initialize a new socket.io object. It is bound to 
// the express app, which allows them to coexist.

var io = require('socket.io').listen(app.listen(port));


// App Configuration

// Make the files in the public folder available to the world
app.use(express.static(__dirname + '/public'));


// This is a secret key that prevents others from opening your presentation
// and controlling it. Change it to something that only you know.

var secret = 'kittens';

// Initialize a new socket.io application

var room = io.on('connection', function (socket) {

	// A new client has come online. Check the secret key and 
	// emit a "granted" or "denied" message.

	socket.on('disconnect', function(){
	  console.log('user disconnected');
	});

	socket.on('enter', function(data) {
		console.log(data);

		var newuserData = data,
			acceptanceData = {};

		console.log('socket enter event - id: '+data.id+' ('+data.role+')');

		//send message to newly accepted user
		socket.emit('accepted', acceptanceData)

		//send message to rest of the room
		//room.emit('newuser', newuserData);
		socket.broadcast.emit('newuser', newuserData);

	});

	socket.on('change', function(data) {

		room.emit('change', data);
	});

	socket.on('tiltchange', function(data) {

		room.emit('tiltchange', data);
	});

});



/**
* 
* @param {string} varname Description
* @returns {undefined}
*/
var init = function() {
	
	console.log('Now running on http://localhost:' + port);
};

init();
