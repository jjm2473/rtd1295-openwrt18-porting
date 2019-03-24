#!/sbin/busybox sh

lists=`busybox find /sys/devices/18013200.rtk_dwc3/18020000.dwc3/xhci-hcd.2.auto -name control`
for foo in $lists;
do echo on > $foo;
done
