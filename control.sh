#!/bin/bash

start ()
{
	export PHANTOM_CLUSTER_NUM_WORKERS=4
	export PORT=6018
	export CACHE_TTL=14400 # In seconds = 4 hours
	if [ '$environment' == 'production' ]
	then
		export MEMCACHED_SERVERS=memcached05:5555,memcached06:5555,memcached07:5555,memcached08:5555
	else
		export MEMCACHED_SERVERS=localhost:5555
	fi

	npm install
	node server.js > /dev/null &
}

stop ()
{
	ps -ef | grep "node server.js" | grep -v grep | awk '{print "kill ", $2}' | bash
}

# MAIN

CURR_DIR=`pwd`

action=$1
environment=$2

case "$action" in
	stop)
		stop
	;;
	start)
		start
	;;
	restart)
		restart
	;;
esac
