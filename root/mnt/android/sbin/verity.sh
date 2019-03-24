#!/sbin/busybox sh

cat /proc/partitions > /tmp/factory/part_tmp.txt
while read major minor block name; do
	if [ "$name" == "mmcblk0p1" ]; then
	value=`busybox expr $block \* 1024 / 4096 / 5`
	echo size=$value
	fi
done < /tmp/factory/part_tmp.txt

if [[ -f /data/hash.txt ]] ; then
HASH_VAL=`cat /data/hash.txt`
OUTPUT="$(veritysetup --hash-offset 0 --data-blocks $value --salt bbe02bd43f03014db516f838ee04335fb61db12cfaa268ac5f27139bdbb58b4c verify /dev/block/mmcblk0p1 /dev/block/mmcblk0p4 $HASH_VAL &>/data/verity_out.txt)"


if [[ -s /data/verity_out.txt ]] ; then
echo "check fail" > /data/check.txt
REBOOT=`reboot`
else
echo "check ok" > /data/check.txt
fi

#echo "${OUTPUT}"
fi
