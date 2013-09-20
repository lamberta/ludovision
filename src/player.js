var fs = require('fs'),
    path = require('path'),
    omxplayer = require('./modules/omxplayer/omxplayer');

var commandMap = omxplayer.commandMap,
    playerCommand = omxplayer.command,
    playerPlay = omxplayer.play,
    playerStop = omxplayer.stop;

exports.setup = omxplayer.setup;
exports.cleanup = omxplayer.cleanup;

exports.isPlaying = false;
exports.isPaused = false;
exports.currentFile = null;
exports.files = [];
exports.rootDirs = [];

/* Add file or directory of files.
 * @param {string} filename
 */
exports.addFile = function (filename) {
  filename = expandPath(filename);

  if (!fs.existsSync(filename)) {
    console.warn("Invalid file '"+ filename +"', skipping.")
  } else {
    var root_dir = (fs.statSync(filename).isDirectory()) ? filename : path.dirname(filename);
    if (root_dir === filename) {
      process.stdout.write("Adding files from directory "+ filename +" ");
    } else {
      process.stdout.write("Adding file "+ filename +" ");
    }

    findFile(filename, function (err, filepath, stat) {
      if (err) console.error(err);
      //ignore hidden files
      if (path.basename(filepath)[0] !== '.') {
        var rel_dir = path.relative(root_dir, path.dirname(filepath));
        exports.files.push({
          path: filepath,
          reldir: (rel_dir.length === 0) ? null : rel_dir
        });
        process.stdout.write('.');
      }
    }, function () {
      //order by path name, alphabetical
      exports.files.sort(function (a, b) {
        return (a.path > b.path) ? 1 : ((a.path < b.path) ? -1 : 0);
      });
      console.log(" all loaded!");
    });
  }
}

exports.play = function (filename) {
  var status;
  //test filename
  if (!isFileAvailable(filename)) {
    status = makeStatus(true, "File not available", false);
    status.file = filename;
  } else {
    if (exports.isPlaying) {
      exports.stop();
    }
    playerPlay(filename);
    exports.isPlaying = true;
    exports.isPaused = false;
    exports.currentFile = filename;
    status = makeStatus(true, "Playing file", true);
  }
  console.log(status);
  return status;
};

exports.stop = function () {
  var status;
  if (exports.isPlaying) {
    status = makeStatus(true, "Player stopped", true);
  } else {
    status = makeStatus(true, "Not playing, player stop failed.", false);
  }
  playerStop()
  exports.isPlaying = false;
  exports.isPaused = false;
  exports.currentFile = null;
  console.log(status);
  return status;
};

exports.pause = function () {
  var status;
  if (exports.isPlaying) {
    exports.isPaused = !exports.isPaused;
    playerCommand(commandMap.pause);
    status = makeStatus(true, "Player is " + (exports.isPaused ? "paused" : "unpaused"), true);
  } else {
    status = makeStatus(true, "Not playing, pause failed.", false);
  }
  console.log(status);
  return status;
};

exports.volumeUp = function () {
  var status;
  if (exports.isPlaying) {
    playerCommand(commandMap.volumeUp);
    status = makeStatus(true, "Volume up", true);
  } else {
    status = makeStatus(true, "Not playing, volume up failed.", false);
  }
  console.log(status);
  return status;
};

exports.volumeDown = function () {
  var status;
  if (exports.isPlaying) {
    playerCommand(commandMap.volumeDown);
    status = makeStatus(true, "Volume down", true);
  } else {
    status = makeStatus(true, "Not playing, volume down failed.", false);
  }
  console.log(status);
  return status;
};

exports.seekForward = function () {
  var status;
  if (exports.isPlaying) {
    playerCommand(commandMap.seekForward);
    status = makeStatus(true, "Seek forward", true);
  } else {
    status = makeStatus(true, "Not playing, seek forward failed.", false);
  }
  console.log(status);
  return status;
};

exports.seekBackward = function () {
  var error;
  if (exports.isPlaying) {
    playerCommand(commandMap.seekBackward);
    status = makeStatus(true, "Seek backward", true);
  } else {
    status = makeStatus(true, "Not playing, seek backward failed.", false);
  }
  console.log(status);
  return status;
};

exports.stepForward = function () {
  var status;
  if (exports.isPlaying) {
    playerCommand(commandMap.stepForward);
    status = makeStatus(true, "Step forward", true);
  } else {
    status = makeStatus(true, "Not playing, step forward failed.", false);
  }
  console.log(status);
  return status;
};

exports.stepBackward = function () {
  var error;
  if (exports.isPlaying) {
    playerCommand(commandMap.stepBackward);
    status = makeStatus(true, "Step backward", true);
  } else {
    status = makeStatus(true, "Not playing, step backward failed.", false);
  }
  console.log(status);
  return status;
};

/*
 * utils
 */

function makeStatus (status, msg, success) {
  return {
    status: (status) ? 'ok' : 'error',
    message: msg,
    file: exports.currentFile,
    success: success
  };
}

function expandPath (pathname) {
  if (pathname.substr(0,1) === '~') {
    pathname = process.env.HOME + pathname.substr(1)
  }
  return path.resolve(pathname);
}

function isFileAvailable (filename) {
  for (var i = 0, files = exports.files, len = files.length; i < len; i++) {
    if (files[i].path === filename) {
      return true;
    }
  }
  return false;
}

/* Synchronously walk directory for files, executing callback for each one.
 * @param {string} filepath
 * @param {function(err,filepath,stats)} callback
 * @param {function} onFinish --Optional
 */
function findFile (filepath, callback, onFinish) {
  var onFile = function (fp) {
    if (!fs.existsSync(fp)) {
      var err = new ReferenceError(fp + " does not exist.");
      callback(err, fp, null);    
    } else {
      var stats = fs.statSync(fp);
      if (stats.isDirectory()) {
        var files = fs.readdirSync(fp);
        for (var i = 0, len = files.length; i < len; i++) {
          onFile(path.join(fp, files[i]));
        }
      } else {
        callback(null, fp, stats);
      }
    }
  }
  
  onFile(filepath);
  if (onFinish) onFinish();
}
