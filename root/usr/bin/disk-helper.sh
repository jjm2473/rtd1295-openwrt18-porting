#!/bin/sh

DEFAULT_FS_TYPE="fat32"
DEFAULT_MNTPT="/mnt"

usage() {
	echo "Usage: $0 ACTION [PARAMETER] ..."
}

check_target_path() {
	# test target path existence
	[ ! -b "$1" ] && echo "$1 is not existed." && return 1
	echo "$1 is existed"

	# test target name matching
	BNAME=$(basename $1)
	# path startswith sdX
	if [ "$BNAME" != "${BNAME#sd?}" ]; then
		:
	# path startswith sataX
	elif [ "$BNAME" != "${BNAME#sata?}" ]; then
		:
	# path startswith mdX
	elif [ "$BNAME" != "${BNAME#md?}" ]; then
		:
	# path startswith mmcblk but skip mmcblk0
	elif [ "$BNAME" != "${BNAME#mmcblk?}" ]; then
		[ "$BNAME" != "${BNAME#mmcblk0*}" ] && echo "$1 is invalid" && return 1
	else
		echo "$1 is invalid"
		return 1
	fi
	echo "$1 is valid"

	return 0
}

# parse device name and partition number into $DEVICE and $NUM
# e.g. /dev/sda1 -> DEVICE=/dev/sda NUM=1
#      /dev/sataa3 -> DEVICE=/dev/sataa NUM=3
#      /dev/md1p2 -> DEVICE=/dev/md1 NUM=2
#      /dev/mmcblk0p3 -> DEVICE=/dev/mmcblk0 NUM=3
#      /dev/sda -> DEVICE=/dev/sda NUM=1 : for disks which is formatted without creating partition table
parse_partition_name() {
	echo "parse partition name from: $1"
	NUM=""
	BNAME=$(basename $1)

	# path startswith sdX
	if [ "$BNAME" != "${BNAME#sd?}" ]; then
		if [ -z "${BNAME#sd?}" ]; then
			DEVICE="/dev/$BNAME"
			NUM="1"
		else
			DEVICE="/dev/${BNAME:0:3}"
			NUM="${BNAME#sd?}"
		fi
	# path startswith sataX
	elif [ "$BNAME" != "${BNAME#sata?}" ]; then
		if [ -z "${BNAME#sata?}" ]; then
			DEVICE="/dev/$BNAME"
			NUM="1"
		else
			DEVICE="/dev/${BNAME:0:5}"
			NUM="${BNAME#sata?}"
		fi
	# path startswith mdX or mmcblkX
	elif [ "$BNAME" != "${BNAME#md?}" ] || [ "$BNAME" != "${BNAME#mmcblk?}" ]; then
		DEVICE="/dev/${BNAME%%p*}"
		NUM="${BNAME##*p}"
	else
		echo "$1 is invalid"
		return 1
	fi
}

mknod_part() {
	PART=$1

	# return if device node is already existed
	[ -b "/dev/$PART" ] && return 0

	PART_INFO=$(grep $PART$ /proc/partitions)

	# return if partition is not existed in /proc/partitions
	[ "" == "$PART_INFO" ] && return 1

	MAJOR_MINOR=$(echo $PART_INFO | awk '{ print $1,$2 }')

	echo -n "mknod /dev/$PART MAJOR/MINOR: $MAJOR_MINOR..." && \
	mknod /dev/$PART b $MAJOR_MINOR && echo "Success" || echo "Fail"

	return $?
}

is_android_existed() {
	[ -z "$(grep /rom/android /proc/mounts | grep tmpfs)" ] && return 1 || return 0
}

umount_disk() {
	echo "=== umount_disk ==="
	echo $@

	check_target_path "/dev/$1"

	RET=$?
	[ "$RET" -ne 0 ] && return $RET

	if is_android_existed; then
		echo "there's Android partition, umount whole block device"
		parse_partition_name "/dev/$1"
		TARGET=$DEVICE

		if [ "/dev/$1" != "$DEVICE" ]; then
			# umount specified partition and its device
			# e.g. /dev/sda2, /dev/sda
			PARTS="$1 $(basename $DEVICE)"
		elif [ "$2" == "deviceonly" ]; then
			# if deviceonly is specified, umount device only
			PARTS=$(basename $DEVICE)
		fi
	else
		TARGET="/dev/$1"
	fi

	PARTS=${PARTS:-$(ls -r $TARGET* | busybox xargs -r -n 1 basename)}

	for PART in $PARTS; do
		echo -n "send [$PART] udev remove event "
		/sbin/udevadm trigger --action=remove --subsystem-match=block --sysname-match=$PART

		# wait 5 seconds
		TIMEOUT=5
		for i in $(seq 0 $TIMEOUT); do
			LINE=$(grep "/dev/$PART " /proc/mounts)
			if [ -z "$LINE" ]; then
				RET=0 && break
			elif [ 5 -eq $i ]; then
				RET=1
			else
				echo -n "." && sleep 1
			fi
		done
		[ 0 -eq $RET ] && echo "Unmounted" || echo "Timeout"

		# if $PART is block device, wait 3 seconds for Android
		[ -L /sys/block/$PART ] && [ ! -z "$(grep /rom/android /proc/mounts | grep tmpfs)" ] && sleep 3
	done

	# udev remove event might remove device node too
	for PART in $PARTS; do
		mknod_part $PART
	done

	return $?
}

clear_disk() {
	echo "=== clear_disk ==="
	echo $@

	if [ -z "$DEVICE" ]; then
		DEVICE="/dev/$1"
		check_target_path $DEVICE
		RET=$?
		[ "$RET" -ne 0 ] && return $RET
	fi

	/usr/bin/dd if=/dev/zero of=$DEVICE bs=1M count=10 && partprobe $DEVICE

	return $?
}

create_partition() {
	echo "=== create_partition ==="
	echo $@

	if [ -z "$DEVICE" ]; then
		DEVICE="/dev/$1"
		check_target_path $DEVICE
		RET=$?
		[ "$RET" -ne 0 ] && return $RET
	fi

	KBLOCKS=$(grep $1$ /proc/partitions | awk '{print $3}')
	echo "KBLOCKS: $KBLOCKS"

	# 2TB = 2*1024*1024*1024 KB
	if [ 1 -eq `expr $KBLOCKS \< 2147483648` ]; then
		echo "Create msdos partition table"
		parted -s $DEVICE mktable msdos
	else
		echo "Create gpt partition table"
		parted -s $DEVICE mktable gpt
	fi

	parted -s -a optimal $DEVICE mkpart primary 2048s 100%
	RET=$?

	# Set PARTITION variable
	if [ -z "${BNAME#sd?}" ] || [ -z "${BNAME#sata?}" ]; then
		PARTITION="${DEVICE}1"
		NUM="1"
	elif [ -z "${BNAME#md?}" ] || [ -z "${BNAME#mmcblk?}" ]; then
		PARTITION="${DEVICE}p1"
		NUM="1"
	else
		PARTITION=""
	fi

	return $RET
}

format_disk() {
	echo "=== format_disk ==="
	echo $@

	if [ -z "$PARTITION" ]; then
		PARTITION="/dev/$1"
		check_target_path $PARTITION
		RET=$?
		[ "$RET" -ne 0 ] && return $RET
	fi

	# set $NUM=(partition number)
	[ -z "$NUM" ] && parse_partition_name $PARTITION

	FS_TYPE="$2"
	[ -z "$FS_TYPE" ] && FS_TYPE=$DEFAULT_FS_TYPE

	case "$FS_TYPE" in
		ext2|ext3|ext4)
			/usr/sbin/mkfs.$FS_TYPE -F -E lazy_itable_init=1 $PARTITION
			RET=$?
			;;
		#TODO Paragon binaries return 0 even formatting failed
		fat32|exfat|ntfs)
			if [ "fat32" == "$FS_TYPE" ] && [ ! -x /usr/local/sbin/mkfat ]; then
				# /usr/local/bin/mkfat is added after 9.4.4_b4, use dosfstools instead
				/usr/sbin/mkfs.vfat -F 32 -I $PARTITION
			else
				[ "fat32" == "$FS_TYPE" ] && FS_TYPE="fat -t:32"
				/usr/local/sbin/mk$FS_TYPE -f --verbose $PARTITION
			fi
			RET=$?
			;;
		hfsplus)
			/usr/local/sbin/mkhfs -f --verbose $PARTITION
			RET=$?
			;;
		swap)
			/usr/sbin/mkswap -f $PARTITION
			RET=$?
			;;
		*)
			echo "Invalid file system $FS_TYPE"
			return 1
			;;
	esac

	if [ $RET -eq 0 ] && [ ! -z $NUM ] && [ ! -z $DEVICE ]; then
		echo "fix partition type code"
		if [ "$FS_TYPE" == "exfat" ]; then
			parted -s $DEVICE toggle $NUM msftdata
		else
			parted -s $DEVICE toggle $NUM fix_part_code
		fi
	fi

	return $RET
}

mount_disk() {
	echo "=== mount_disk ==="
	echo $@

	if [ -z "$PARTITION" ]; then
		PARTITION="/dev/$1"
		check_target_path $PARTITION
		RET=$?
		[ "$RET" -ne 0 ] && return $RET
	fi

	# TODO
	[ ! -x /sbin/udevadm ] && return 1

	BASENAME=$(basename $PARTITION)

	# let hotplug script do its work
	echo -n "send [$BASENAME] udev add event "
	/sbin/udevadm trigger --action=add --subsystem-match=block --sysname-match=$BASENAME

	# wait 5 seconds
	TIMEOUT=5
	for i in $(seq 0 $TIMEOUT); do
		LINE=$(grep "/dev/$BASENAME " /proc/mounts)
		if [ ! -z "$LINE" ]; then
			RET=0 && break
		elif [ 5 -eq $i ]; then
			RET=1
		else
			echo -n "." && sleep 1
		fi
	done
	[ 0 -eq $RET ] && echo "Mounted" || echo "Timeout"

	if [ -z "$DEVICE" ] && ls -d /sys/block/*/$BASENAME; then
		DEVICE=$(ls -d /sys/block/*/$BASENAME | xargs dirname | xargs basename)
	elif [ ! -z "$DEVICE" ]; then
		DEVICE=$(basename $DEVICE)
	fi

	# there is an Android partition
	if [ ! -z "$(grep /rom/android /proc/mounts | grep tmpfs)" ] && [ ! -z "$DEVICE" ]; then
		echo "send [$DEVICE] udev add event for Android"
		/sbin/udevadm trigger --action=add --subsystem-match=block --sysname-match=$DEVICE && sleep 3
	fi

	return $RET
}

ACTION=$1
shift

case "$ACTION" in
	umount)
		umount_disk $@
		RET=$?
		echo "umount_disk return $RET"
		;;
	clear)
		clear_disk $@
		RET=$?
		echo "clear_disk return $RET"
		;;
	create)
		create_partition $@
		RET=$?
		echo "create_partition return $RET"
		;;
	format)
		format_disk $@
		RET=$?
		echo "format_disk return $RET"
		;;
	mount)
		mount_disk $@
		RET=$?
		echo "mount_disk return $RET"
		;;
	allinone)
		umount_disk $@
		clear_disk $@ && create_partition $@ && format_disk $@ && mount_disk $@
		RET=$?
		echo "allinone return $RET"
		;;
	*)
		usage
		return 1
		;;
esac

return $RET
