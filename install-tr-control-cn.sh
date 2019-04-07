#!/bin/bash

wget -O /tmp/install-tr-control-cn.sh https://github.com/ronggang/transmission-web-control/raw/master/release/install-tr-control-cn.sh
chmod 755 /tmp/install-tr-control-cn.sh
/tmp/install-tr-control-cn.sh `pwd`/root/usr/share/transmission
