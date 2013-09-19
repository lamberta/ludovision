var statusElem, pauseImgs;

//enable active state for links
document.addEventListener('touchstart', function(){}, true);

/* main
 */
window.onload = function () {
  //needed in a couple of places
  statusElem = document.getElementById('status-message');
  pauseImgs = document.querySelectorAll('#pause-button img');
  
  updatePlayerDisplay(true);

  //removes the 250ms click delay built-in to mobile browsers
  FastClick.attach(document.body);

  /* called after file list loaded
   */
  getJSON('files', null, function (data) {
    if (data.status === 'ok') {
      populateList(data, function () {
        //animate in top links
        var toplinks = document.querySelectorAll('#filelist > li > a, #filelist > li > h2');
        for (var n = 0, len = toplinks.length; n < len; n++) {
          window.setTimeout(function (elem) {
            elem.style.display = 'block';
          }, n*100, toplinks[n]);
        }
        //remove spinner element
        var spinner = document.getElementById('spinner');
        spinner.parentNode.removeChild(spinner);
        //add click handlers
        addFileHandlers(data);
      });
    } else {
      setStatus("Unable to load file list.", data.status)
    }
  }, function (err, status) {
    setStatus("Unable to connect to server.", status);
  });

  /* attach click handlers for player controls
   */
  window.setTimeout(addPlayerHandlers, 0);
};

function addPlayerHandlers () {
  var buttons = {
    'stop-button': {params: {stop: true}, status: true},
    'pause-button': {params: {pause: true}, status: true},
    'volume-up-button': {params: {volumeUp: true}},
    'volume-down-button': {params: {volumeDown: true}},
    'seek-forward-button': {params: {seekForward: true}},
    'seek-backward-button': {params: {seekBackward: true}}
  };

  for (var elemId in buttons) {
    var fn = (function () {
      var id = elemId,
          but = buttons[id];
      return function (evt) {
        evt.preventDefault();
        getJSON('control', but.params, function (data) {
          if (data.status === 'ok') {
            if (but.status) {
              if (but.callback) {
                but.callback(data.success);
              }
              updatePlayerDisplay();
            } else {
              console.log(data);
            }
          } else {
            console.warn("Click failed", id, data);
          }
        }, function (err, status) {
          console.warn("Click failed", id, err, status);
        });
        return false;
      };
    }());
    
    document.getElementById(elemId).addEventListener('click', fn, false);
  }
}

function addFileHandlers (data) {
  //directory toggles
  for (var i = 0, h = document.querySelectorAll('#filelist h2'), len = h.length; i < len; i++) {
    h[i].addEventListener('click', function (evt) {
      evt.preventDefault();
      toggleVisibility(this.nextSibling); //ul
      toggleVisibility(this.getElementsByTagName('span'));
    }, false);
  }

  //file click and play
  var path, basename;
  for (var i = 0, a = document.querySelectorAll('#filelist a'), len = a.length; i < len; i++) {
    a[i].addEventListener('click', function (evt) {
      evt.preventDefault();
      path = this.getAttribute('data-path');
      basename = path.split(data.pathSeparator).slice(-1)[0];

      getJSON('control', {play: path}, function (data) {
        if (data.status === 'ok') {
          updatePlayerDisplay();
        }
      }, function (err, status) {
        setStatus("Unable to play " + path, err, status)
      });
      return false;
    }, false);
  }
}

function populateList (data, callback) {
  var docfrag = document.createDocumentFragment(),
      sep = data.pathSeparator,
      file, filepath_parts, filepath_name, node, li1, a;
  
  for (var i = 0, files = data.files, len = files.length; i < len; i++) {
    file = files[i];
    filepath_parts = file.path.split(sep);
    filepath_name = filepath_parts[filepath_parts.length-1];
    node = docfrag;

    //create list hierarchy for nested files
    if (file.reldir) {
      var part, part_name, ul1, ul2, li2, h, span1, span2, p;
      for (var j = 0, reldir_parts = file.reldir.split(sep), partlen = reldir_parts.length; j < partlen; j++) {
        part = reldir_parts[j];
        part_name = reldir_parts.slice(j, j+1).join(sep);
        ul = docfrag.querySelectorAll("ul[data-path='"+ part_name +"']")[0];
        //if it doesn't exist, add it
        if (!ul) {
          //new list item
          li2 = document.createElement('li');
          node.appendChild(li2);
          //contains header
          h = document.createElement('h2');
          li2.appendChild(h);
          //add header icon +/- to indicate toggle status
          span1 = document.createElement('span');
          span2 = document.createElement('span');
          span1.innerHTML = "&nbsp;&oplus;"
          h.appendChild(span1);
          span2.innerHTML = "&nbsp;&ominus;"
          span2.style.display = "none";
          h.appendChild(span2);
          //header name
          p = document.createElement('p');
          p.innerText = part_name;
          h.appendChild(p);
          //new list
          ul = document.createElement('ul');
          ul.setAttribute('data-path', part_name);
          li2.appendChild(ul);
        }
        node = ul;
      }
    }
    //add file
    li1 = document.createElement('li');
    node.appendChild(li1);
    a = document.createElement('a');
    a.setAttribute('href', '#');
    a.setAttribute('data-path', file.path);
    a.innerText = filepath_name;
    li1.appendChild(a);
  }
  
  //list assembled, add to dom
  document.getElementById('filelist').appendChild(docfrag);

  if (typeof callback === 'function') {
    callback(data);
  }
}

function updatePlayerDisplay (isLoading) {
  if (isLoading) {
    setStatus("Loading video list ...");
  } else {
    setStatus("Hello, Ludovico!");
  }
  getJSON('status', null, function (data) {
    if (data.status === 'ok') {
      if (data.isPlaying) {
        var basename = data.currentFile.split(data.pathSeparator).slice(-1)[0];
        if (data.isPaused) {
          if (window.getComputedStyle(pauseImgs[0]).display !== 'none') { //check paused image
            toggleVisibility(pauseImgs);
          }
          setStatus("Paused " + basename);
        } else {
          if (window.getComputedStyle(pauseImgs[1]).display !== 'none') { //check play image
            toggleVisibility(pauseImgs);
          }
          setStatus("Playing " + basename);
        }
      } else {
        if (isLoading) {
          setStatus("Hello, Ludovico!");
        }
        //reset pause if needed
        if (window.getComputedStyle(pauseImgs[0]).display !== 'none') { //check paused image
          toggleVisibility(pauseImgs);
        }
      }
    } else {
      setStatus("Bad server status.");
    }
  }, function (err, status) {
    setStatus("Unable to connect to server.");
  });
}

/*
 * utils
 */

function setStatus (msg) {
  statusElem.innerText = msg;
  Function.apply.call(console.log, console, arguments);
}

function toggleVisibility (elems) {
  if (elems.hasOwnProperty('length')) {
    for (var i = 0, len = elems.length; i < len; i++) {
      elems[i].style.display = (window.getComputedStyle(elems[i]).display === 'none') ? 'inline' : 'none';
    }
  } else {
    elems.style.display = (window.getComputedStyle(elems).display === 'none') ? 'block' : 'none';
  }
}

function getJSON (url, params, onSuccess, onFail) {
  var req = new XMLHttpRequest();
  if (typeof params === 'object') {
    var qs = '?';
    for (var p in params) {
      qs += (p + '=' + window.encodeURIComponent(params[p]) + '&');
    }
    url += qs.slice(0, -1);
  }
  req.open('GET', window.encodeURI(url), true);
  
  req.onreadystatechange = function (evt) {
    if (req.readyState == 4) {
      if (req.status == 200) {
        if (typeof onSuccess === 'function') {
          try {
            var data = JSON.parse(req.responseText);
          } catch (err) {
            if (typeof onFail === 'function') {
              onFail(err, req.status, "Error parsing JSON data.");
            }
          }
          onSuccess(data);
        }
      } else {
        if (typeof onFail === 'function') {
          onFail(new Error("Bad HTTP status."), req.status);
        }
      }
    }
  };
  req.send(null);
};
