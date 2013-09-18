To run *ludovico* when the computer boots up, we'll need to
create an init script for it. As root, copy the sample file
below to `/etc/init.d/ludovico`, and make sure the
script is executable (using `chmod 755 filename` should do the
trick). Now you can start and stop the service with these commands:

~~~
$ /etc/init.d/ludovico start
$ /etc/init.d/ludovico stop
$ /etc/init.d/ludovico restart
~~~

With the init scripts in place, install the scripts into the
system boot sequence using the `update-rc.d` command:

~~~
$ sudo update-rc.d ludovico defaults
~~~

Now when you reboot your system you'll see a message informing
you that the Ludovico media server has been started.

Here's the example init script for `/etc/init.d/ludovico`.
You'll probably need to change the `USER`, `PATH`, and
`DAEMON` variables to match your system setup. Also, make
sure the *node* program is in your `PATH`.

~~~
#!/bin/sh
### BEGIN INIT INFO
# Provides:          ludovico
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Ludovico initscript
# Description:       Ludovico init at boot. Based on skeleton.
### END INIT INFO

# Author: Billy Lamberta <b@lamberta.org>
USER=b
# Make sure node is in your PATH
PATH=/sbin:/usr/sbin:/bin:/usr/bin:/home/$USER/bin
NAME=ludovico
DAEMON=/home/$USER/src/$NAME/bin/$NAME
DAEMON_ARGS=""
PIDFILE=/var/run/$NAME.pid
SCRIPTNAME=/etc/init.d/$NAME

[ -x "$DAEMON" ] || exit 0

. /lib/lsb/init-functions

do_start() {
  if start-stop-daemon --start --quiet --oknodo --background \
    --chuid $USER --pidfile $PIDFILE --make-pidfile \
    --exec $DAEMON -- $DAEMON_ARGS; then
    return 0
  else
    return 1
  fi
}

do_stop() {
  if start-stop-daemon --stop --quiet \
    --retry=TERM/30/KILL/5 --pidfile $PIDFILE; then
    rm -f $PIDFILE
    return 0
  else
    rm -f $PIDFILE
    return 1
  fi
}

case "$1" in
  start)
    log_daemon_msg "Starting Ludovico media server" $NAME || true
    if do_start; then
      log_end_msg 0 || true
    else
      log_end_msg 1 || true
    fi
    ;;
  stop)
    log_daemon_msg "Stopping Ludovico media server" $NAME || true
    if do_stop; then
      log_end_msg 0 || true
    else
      log_end_msg 1 || true
    fi
    ;;
  restart)
    log_daemon_msg "Restarting Ludovico media server" $NAME || true
    do_stop
    if do_start; then
      log_end_msg 0 || true
    else
      log_end_msg 1 || true
    fi
    ;;
  *)
    echo "Usage: /etc/init.d/$NAME {start|stop|restart}"
    exit 1
    ;;
esac

exit 0
~~~
