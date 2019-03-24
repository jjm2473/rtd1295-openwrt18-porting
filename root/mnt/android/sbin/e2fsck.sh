#!/sbin/busybox sh
while read DEV MOUNT; do
    while [ ! -b $DEV ]; do
        echo "waiting for $DEV"
        /sbin/busybox sleep 1
    done
    /sbin/e2fsck -y -f $DEV >> /rtk/e2fsck.log 2>&1
done < /sys.part.rc
/sbin/busybox touch /rtk/e2fsck.done
