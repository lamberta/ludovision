*Ludovico* is a web-based remote control for a media
server. Simply put, use your phone to play videos.

## Install

Currently, *Ludovico* has been tested on the [Raspberry Pi](http://www.raspberrypi.org/)
and uses *omxplayer* to display videos. The server
application runs on [Node.js](http://nodejs.org), so you'll
need to install the ARM-compiled binary for the device. This
is available in the [nodejs.org/dist/](http://nodejs.org/dist/)
directory, just look for a file name like
*node-v0.X.x-linux-arm-pi.tar.gz* (the latest release may
not yet be available).

With *node* installed, download the package to the pi:

~~~
$ wget https://github.com/lamberta/ludovico/archive/master.zip
$ unzip master.zip
$ cd ludovico-master
~~~

Or, using *git*:

~~~
$ git clone https://github.com/lamberta/ludovico.git
$ cd ludovico
~~~

Now run the server:

~~~
$ ./bin/ludovico
Firing up Ludovico
  Adding files from directory /home/me/vids ........ all loaded!
HTTP server running on port 8080
~~~

You can change the port and which files and directories to
load in the `./src/app.js` file. I'll add command-line
options when I get a chance.

Now, point your web-browser to `http://192.168.2.x:8080` (or
wherever the pi is on your local network) and you should see
the controls pop up. Find a movie title and click it to play :)

As an added convenience, save this page to your phone's home
screen and run it like a native application. On the iPhone,
click the share button within the browser, then "Add to Home Screen".

<img alt="Ludovico screenshot" src="screenshot.png">
