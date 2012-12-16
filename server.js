var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	id = 0,
	players = {};

server.listen(80);

app.use(express.static(__dirname));

function Player(options) {
	this.id = ++id;
	this.name = 'Player ' + this.id;
	this.score = 20;

	players[this.id] = this;
}

Player.prototype.setName = function (name) {
	this.name = name;
};

Player.prototype.setScore = function (score) {
	this.score = score;
};

Player.prototype.disconnect = function () {
	delete players[this.id];
};

io.sockets.on('connection', function (socket) {
	var player, isDisplay;

	socket.on('init', function (display) {
		isDisplay = display;
		if (display) {
			player = new Player();

			socket.broadcast.emit('player:change', players);

			return socket.emit('init', {
				id: player.id,
				players: players
			});

		}

		socket.emit('init', {
			players: players
		});
	});


	socket.on('player:change', function (playersList) {
		players = playersList;
		socket.broadcast.emit('player:change', players);
	});

	socket.on('disconnect', function () {
		if (isDisplay)
			player.disconnect();
		socket.broadcast.emit('player:change', players);
	});
});