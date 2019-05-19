#!/bin/sh /etc/rc.common
list=`wget -qO- https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all_ip.txt|awk NF|sed ":a;N;s/\n/,/g;ta"`
list=$list"'"
titlename="bt-tracker"
    sed -i "s@bt-tracker.*@bt-tracker=$list@g" /etc/config/aria2
    echo updated tracker finnish...
