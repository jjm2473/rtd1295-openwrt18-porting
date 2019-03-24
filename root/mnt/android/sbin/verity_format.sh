#!/sbin/busybox sh
cat /proc/partitions > /data/part_tmp.txt
while read major minor block name; do
	if [ "$name" == "mmcblk0p1" ]; then
	value=`busybox expr $block \* 1024 / 4096 / 5`
	echo size=$value
	fi
done < /data/part_tmp.txt

OUTPUT_FORMAT="$(veritysetup --hash-offset 0 --data-blocks $value --salt bbe02bd43f03014db516f838ee04335fb61db12cfaa268ac5f27139bdbb58b4c format /dev/block/mmcblk0p1 /dev/block/mmcblk0p4 &>/data/verity_out_format.txt)"

HASH_VAL=`cat /data/hash.txt`

OUTPUT="$(veritysetup --hash-offset 0 --data-blocks $value --salt bbe02bd43f03014db516f838ee04335fb61db12cfaa268ac5f27139bdbb58b4c verify /dev/block/mmcblk0p1 /dev/block/mmcblk0p4 $HASH_VAL &>/data/verity_out_verify.txt)"

#DEC_OUTPUT="$(rtk_aes_file_decrypt /data/libvmclient.dec /system/vendor/lib/libvmclient.enc /sbin/aes_128bit_key.bin /system/vendor/lib/libvmclient_signature_enc.bin /sbin/mykey.pub &>/data/dec.txt)"

