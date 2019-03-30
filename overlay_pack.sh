# run on device /overlay/upper/
find -type f -o -type l|grep -v dropbear_rsa_host_key|grep -v urandom.seed|grep -v board.json|xargs tar -czf /tmp/update.tar.gz