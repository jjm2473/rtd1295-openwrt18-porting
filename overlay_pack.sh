# use opkg offline mode `opkg -o / -f /etc/opkg.conf install ??` to install, then
# run this on device /overlay/upper/ to package
find -type f -o -type l|grep -v ./mnt|grep -v dropbear_rsa_host_key|grep -v urandom.seed|grep -v board.json|xargs tar -czf /tmp/update.tar.gz