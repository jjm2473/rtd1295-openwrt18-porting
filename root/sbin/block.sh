#!/bin/sh

if [ $# -eq 1 ]; then
	case "$1" in
		info)
			blkid;;
		detect)
			/sbin/gen_fstab;;
		mount)
			/etc/init.d/fstab start;;
		umount)
			/etc/init.d/fstab stop;;
		*)
			exec /sbin/oblock $1;;
	esac
else
	if [ "$1" == "info" ]; then
		blkid $2
	else
		exec /sbin/oblock $*
	fi
fi