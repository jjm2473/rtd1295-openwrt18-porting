#!/sbin/busybox sh
while read DEV MOUNT; do
    while [ ! -b $DEV ]; do
        echo "waiting for $DEV"
        /sbin/busybox sleep 1
    done
    /sbin/resize2fs $DEV >> /rtk/ext4resize.log 2>&1
done < /sys.part.rc
/sbin/busybox touch /rtk/ext4resize.done
