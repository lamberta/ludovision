*Ludovision* is a web-based remote control for a media
server. Simply put, use your phone and the Raspberry Pi to
play videos.

<img alt="Ludovision screenshot" src="screenshot.png">

## Install

Currently, *Ludovision* has been tested with the
[Raspberry Pi](http://www.raspberrypi.org/) on the
*Raspbian* image. It runs on [Node.js](http://nodejs.org)
and uses *omxplayer* to display videos.

The first step is to log in to your Raspberry Pi and
download the *Ludovision* source code:

~~~
$ wget https://github.com/lamberta/ludovision/archive/master.zip
$ unzip master.zip
$ cd ludovision-master
~~~

Or, using *git*:

~~~
$ git clone https://github.com/lamberta/ludovision.git
$ cd ludovision
~~~

Now that you have it, take a look at the command-line options:

~~~
$ ./bin/ludovision -h
~~~

This will check your system for the Node.js runtime and, if
it's not available, automatically prompt you to download and
install it. If node isn't available for your system, or you
want to install it globally, take a look around
[nodejs.org/dist/](http://nodejs.org/dist/) and try to find
a suitable binary. (The Raspberry Pi requires the ARM version.)

And with everything in place, start the server and add a
directory of media files:

~~~
$ ./bin/ludovision --add ~/vids
Adding files from directory /home/me/vids ...... all loaded!
Firing up the Ludovision HTTP server on port 8000
~~~

Now simply point your web browser to `http://192.168.2.x:8000`
(or wherever the pi is on your local network), find a
movie title, and click to play :)

As an added convenience, save this page to your phone's home
screen and run it like a native application. On the iPhone,
click the share button within the browser, then "Add to Home Screen".

The `ludovision` server is a bit noisy for testing purposes.
If it's running as a background job, you may want to redirect the output:

~~~
$ ./bin/ludovision &> /dev/null &
~~~
