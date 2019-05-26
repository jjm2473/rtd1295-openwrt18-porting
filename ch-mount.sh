#!/bin/bash

SUDO=''

function mnt() {
    echo "MOUNTING"
    ${SUDO} mount -t proc /proc ${2}proc || exit
    ${SUDO} mount -t sysfs /sys ${2}sys
    ${SUDO} mount -o bind /dev ${2}dev
    ${SUDO} mount -o bind /dev/pts ${2}dev/pts
    ${SUDO} mount -t tmpfs tmpfs ${2}tmp
    ${SUDO} mount -t tmpfs tmpfs ${2}mnt
    ${SUDO} mount -t tmpfs tmpfs ${2}root

    ${SUDO} mkdir ${2}tmp/lock ${2}tmp/bin
    ${SUDO} cp /etc/resolv.conf ${2}tmp/resolv.conf
    ${SUDO} cp -a /usr/bin/qemu-aarch64-static ${2}tmp/bin/
    #export PATH=$PATH:${2}tmp/bin
    ${SUDO} mount -t binfmt_misc binfmt_misc ${2}proc/sys/fs/binfmt_misc || exit
    ${SUDO} sh -c "echo '-1' > ${2}proc/sys/fs/binfmt_misc/qemu-aarch64"
    ${SUDO} sh -c "echo ':qemu-aarch64:M:0:\x7f\x45\x4c\x46\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\xb7\x00:\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff:/tmp/bin/qemu-aarch64-static:' > ${2}proc/sys/fs/binfmt_misc/register"
    ${SUDO} chroot ${2}
}

function umnt() {
    echo "UNMOUNTING"
    ${SUDO} umount ${2}root
    ${SUDO} umount ${2}proc/sys/fs/binfmt_misc
    ${SUDO} umount ${2}tmp
    ${SUDO} umount ${2}mnt
    ${SUDO} umount ${2}proc
    ${SUDO} umount ${2}sys
    ${SUDO} umount ${2}dev/pts
    ${SUDO} umount ${2}dev
}
if [ "$1" == "-m" ] && [ -n "$2" ] ;
then
    mnt $1 $2
elif [ "$1" == "-u" ] && [ -n "$2" ];
then
    umnt $1 $2
else
    echo ""
    echo "Either 1'st, 2'nd or both parameters were missing"
    echo ""
    echo "1'st parameter can be one of these: -m(mount) OR -u(umount)"
    echo "2'nd parameter is the full path of rootfs directory(with trailing '/')"
    echo ""
    echo "For example: ch-mount -m /media/sdcard/"
    echo ""
    echo 1st parameter : ${1}
    echo 2nd parameter : ${2}
fi

