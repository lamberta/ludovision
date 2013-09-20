var server = require('./server').http,
    player = require('./player'),
    port = 8000,
    filesToLoad = [];

function printHelp (exitp) {
  process.stdout.write("Usage: ludovision [options] --add path1 -add path2 ...\n");
  process.stdout.write("  -a, --add=path  Add a directory or media file to serve\n");
  process.stdout.write("Options:\n");
  process.stdout.write("  -p, --port=num  Port to run the HTTP server on ["+ port +"]\n");
  process.stdout.write("  -h, --help      Print help\n");
  if (exitp) {
    process.exit(0);
  }
}

/* Parse command-line options, first two args are the process.
 */
for (var i = 2, argv = process.argv, len = argv.length; i < len; i++) {
  switch (argv[i]) {
    case '-h': case '--help':
    printHelp(true);
    break;
  case '-p': case '--port':
    var p = parseInt(argv[i+1]);
    if (isFinite(p)) {
      port = p;
      i += 1;
    } else {
      process.stderr.write("Invalid port number: "+ argv[i+1] +"\n");
      process.exit(1);
    }
    break
  case '-a': case '--add':
    filesToLoad.push(argv[i+1]);
    i += 1;
    break;
  default:
    process.stderr.write("Invalid option: "+ argv[i] +"\n");
    printHelp();
    process.exit(1);
  }
}

/* Set up cleanup
 */
process.on('exit', function () {
  if (typeof player.cleanup === 'function') {
    player.cleanup();
  }
});

process.on('SIGINT', function () {
  process.exit(1);
});

/* And off we go ...
 */
if (typeof player.setup === 'function') {
  player.setup();
}

filesToLoad.forEach(player.addFile);

process.stdout.write("Firing up the Ludovision HTTP server on port "+ port +"\n");
server.listen(port);

if (player.files.length === 0) {
  process.stderr.write("No media files served! (Add some at the command-line)\n");
}
