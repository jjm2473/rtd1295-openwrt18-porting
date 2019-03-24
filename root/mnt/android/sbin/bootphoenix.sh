#!/sbin/busybox sh
sleep 10
mount |grep nande
mount_tag=$?
if [ "$mount_tag" != "0" ]; then
    /sbin/make_ext4fs /dev/block/nande
    sync
    sync
    sync
    sync
    sync
    sync
    sync
    sync
    sync
    sync
    sync
    sleep 15
    sync
    sync
    sync
    sync
    sync
    sync
    sync
    sync
    sync
    sync
    sync
    reboot
fi
