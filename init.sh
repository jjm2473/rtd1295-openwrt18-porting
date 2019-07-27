#!/bin/sh
# run this before build.sh
mkdir root/android root/overlay root/tmp root/proc root/sys root/dev root/mnt root/root root/www root/etc/crontabs root/etc/hotplug.d/dhcp root/etc/hotplug.d/neigh root/etc/hotplug.d/tftp root/usr/lib/iptables root/usr/lib/opkg/lists
chmod 0755 root/android root/overlay root/proc root/sys root/dev root/mnt root/root root/www root/etc/crontabs root/etc/hotplug.d/dhcp root/etc/hotplug.d/neigh root/etc/hotplug.d/tftp root/usr/lib/iptables root/usr/lib/opkg/lists
chmod 1777 root/tmp
sudo mknod root/dev/console c 0 0 && sudo chown `whoami` root/dev/console && chmod 0600 root/dev/console
echo './proc
./cache
./config
./sbin
./oem
./storage
./system
./sys
./mnt
./dev
./acct
./data' | xargs -n1 sh -c 'mkdir -p root/mnt/android/$0; chmod 755 root/mnt/android/$0'

chmod 750 root/mnt/android/sbin
chmod 771 root/mnt/android/data
chmod 770 root/mnt/android/cache