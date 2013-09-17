var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    player = require('./player'),
    clientDir = path.resolve(__dirname, '..', 'client');

exports.http = http.createServer(function (req, res) {
  var url_parts = url.parse(req.url, true),
      uri = url_parts.pathname;

  //route dispatch
  switch (uri) {
  case '/control':
    var params = url_parts.query,
        status;
    
    //can handle multiple commands; may not all work
    for (var cmd in params) {
      switch (cmd) {
      case 'play':
        status = player.play(decodeURIComponent(params[cmd]));
        break;
      case 'stop':
        status = player.stop();
        break;
      case 'pause':
        status = player.pause();
        break;
      case 'volumeUp':
        status = player.volumeUp();
        break;
      case 'volumeDown':
        status = player.volumeDown();
        break;
      case 'seekForward':
        status = player.seekForward();
        break;
      case 'seekBackward':
        status = player.seekBackward();
        break;
      default:
        status = {
          status: 'error',
          message: "Command '"+ cmd +"' not found"
        };
      }
    }
    sendJSON(res, status);
    break;
  case '/status':
    sendJSON(res, {
      status: 'ok',
      pathSeparator: path.sep,
      isPlaying: player.isPlaying,
      isPaused: player.isPaused,
      currentFile: player.currentFile
    });
    break;
  case '/files':
    sendJSON(res, {
      status: 'ok',
      pathSeparator: path.sep,
      rootDirs: player.rootDirs,
      files: player.files
    });
    break;
  default:
    if (uri === '/') { uri = '/index.html'; }
    var filename = path.join(clientDir, decodeURI(uri));
    
    fs.lstat(filename, function (err, stats) {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.write('500 Internal server error\n');
        res.end();
      } else if (!stats.isFile()) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('404 Not Found\n');
        res.end();
      } else {
        //file exists, send it
        sendFile(res, filename);
      }
    });
  }
});

/*
 * utils
 */

var mimeTypes = {
  'html': "text/html",
  'jpeg': "image/jpeg",
  'jpg': "image/jpeg",
  'png': "image/png",
  'js': "text/javascript",
  'json': "application/json",
  'css': "text/css"
};

function sendFile (res, filename) {
  var ext = path.extname(filename).slice(1);
  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || "application/octet-stream"
  });
  fs.createReadStream(filename).pipe(res);
}

function sendJSON (res, obj) {
  var data = JSON.stringify(obj);
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data)
  });
  res.end(data);
}
