#!/sbin/busybox sh
#No necessary to format swap partition, it had been executed in install_a
#echo "mk emmc swap..."
#/sbin/busybox mkswap /dev/block/mmcblk0p11 >> /rtk/mk_emmc_swap.log 2>&1
#/sbin/busybox touch /rtk/mk_emmc_swap.done
#mount by label name
/sbin/swapon -p 40 -L swap
