var server = require('./server').http,
    player = require('./player'),
    port = 8080;

console.log("Firing up Ludovico");

if (typeof player.setup === 'function') {
  player.setup();
}

player.addFile('~/vids');

console.log("HTTP server running on port " + port);
server.listen(port);

process.on('exit', function () {
  if (typeof player.cleanup === 'function') {
    player.cleanup();
  }
});

process.on('SIGINT', function () {
  process.exit(1);
});
