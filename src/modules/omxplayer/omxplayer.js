/* omxplayer specific setup and commands
 */
var path = require('path'),
		fs = require('fs'),
		spawn = require('child_process').spawn,
		fifo = '/tmp/omxplayerfifo',
		playerStart = path.resolve(__dirname, 'omxplayer-start'),
		playerCommand = path.resolve(__dirname, 'omxplayer-command');

exports.setup = function () {
	if (fs.existsSync(fifo)) {
		fs.unlinkSync(fifo);
	}
	spawn('mkfifo', [fifo]);
};

exports.cleanup = function () {
	if (fs.existsSync(fifo)) {
		fs.unlinkSync(fifo);
	}
};

exports.play = function (filename) {
	var proc = spawn(playerStart, [filename, fifo]);

	proc.on('close', function (code) {
		exports.stop();
		console.log('omxplayer process exited with code ' + code);
	});
};

exports.stop = function () {
	spawn('killall', ['omxplayer', 'omxplayer.bin']);
};

//map command names to omxplayer keys
exports.commandMap = {
	pause: 'p',
	volumeUp: '+',
	volumeDown: '-',
	seekForward: "\x1b\x5b\x41",
	seekBackward: "\x1b\x5b\x42",
	stepForward: "\x1b\x5b\x43",
	stepBackward: "\x1b\x5b\x44"
};

exports.command = function (cmd) {
	if (typeof cmd === 'string') {
		spawn(playerCommand, [cmd, fifo]);
	} else {
		console.error("Invalid player command.");
	}
};
