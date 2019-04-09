#!/sbin/busybox sh

# data structure 
# magic number: 4 bytes(1-4), wr_emmc_size_cnt_base length:1 bytes(5), remainder_base length: 1 bytes(6), wr_emmc_size_cnt_base: 4bytes(7-10), remainder_base: 9 bytes (11-19)

# initial_type_a_health: 3 bytes (20-22) initial_type_b_health: 3 byte  (23-25) initial_pre_EOL_info: 3 bytes (26-28)
# type_a_health_pre: 3 byte (29-31) wr_emmc_size_cnt_pre_len:1 bytes(32), remainder_pre_len: 1 bytes(33), wr_emmc_size_cnt_pre: 4bytes(34-37), remainder_pre: 9 bytes (38-46)
# type_b_health_pre: 3 byte (47-49) wr_emmc_size_cnt_pre_len:1 bytes(50), remainder_pre_len: 1 bytes(51), wr_emmc_size_cnt_pre: 4bytes(52-55), remainder_pre: 9 bytes (56-64)
# pre_EOL_info_pre: 3 byte (65-67) wr_emmc_size_cnt_pre_len:1 bytes(68), remainder_pre_len: 1 bytes(69), wr_emmc_size_cnt_pre: 4bytes(70-73), remainder_pre: 9 bytes (74-82)

# type_a_health_sub: 1 byte(83) wr_emmc_size_cnt_sub_len:1 bytes(84), remainder_sub_len: 1 bytes(85), wr_emmc_size_cnt_sub: 4bytes(86-89), remainder_sub: 9 bytes (90-98)
# type_b_health_sub: 1 byte(99) wr_emmc_size_cnt_sub_len:1 bytes(100),remainder_sub_len: 1 bytes(101), wr_emmc_size_cnt_sub: 4bytes(102-105), remainder_sub: 9 bytes (106-114)
# pre_EOL_info_sub: 1 byte(115) wr_emmc_size_cnt_sub_len:1 bytes(116), remainder_sub_len: 1 bytes(117), wr_emmc_size_cnt_sub: 4bytes(118-121), remainder_sub: 9 bytes (122-130)

# this shell script support max emmc size is 512 GB

tmpdir="/tmp/health_report"
tmpFile="/tmp/health_report/tmp.txt"
debugFile="/tmp/health_report/debug.txt"
recordFile="/tmp/health_report/formula.txt"
cntbaseFile="/tmp/health_report/cntbase.txt"
remainderbaseFile="/tmp/health_report/remainderbase.txt"

if [ -d $tmpdir ];then
    echo $tmpdir already exists >> $debugFile
else
    mkdir -m 777 $tmpdir
fi

if [ -e $tmpFile ];then
    echo $tmpFile already exists >> $debugFile
else
    touch $tmpFile
fi

echo 0 > /sys/block/mmcblk0boot0/force_ro

dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=4
num=$(cat $tmpFile)

if [ "$num" = "55AA" ];then
  echo "Boot partition 0 has been initialized!!!" >> $debugFile

  #wr_emmc_size_cnt_base length
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=1 skip=4
  wr_emmc_size_cnt_base_len=$(cat $tmpFile)
  #echo "wr_emmc_size_cnt_base_len=" $wr_emmc_size_cnt_base_len >> $debugFile

  #remainder_base
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=1 skip=5
  remainder_base_len=$(cat $tmpFile)
  #echo "remainder_base_len=" $remainder_base_len >> $debugFile

  #wr_emmc_size_cnt_base
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=$((wr_emmc_size_cnt_base_len)) skip=6
  wr_emmc_size_cnt_base=$(cat $tmpFile)
  echo wr_emmc_size_cnt_base= $wr_emmc_size_cnt_base >> $debugFile
  echo $wr_emmc_size_cnt_base > $cntbaseFile
  #remainder_base
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=$((remainder_base_len)) skip=10
  remainder_base=$(cat $tmpFile)
  echo remainder_base= $remainder_base >> $debugFile
  echo $remainder_base > $remainderbaseFile
  #initial_type_a_health  initial_type_b_health initial_pre_EOL_info
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=3 skip=19
  initial_type_a=$(cat $tmpFile)
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=3 skip=22
  initial_type_b=$(cat $tmpFile)
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=3 skip=25
  initial_pre_EOL=$(cat $tmpFile)

  echo initial_type_a=$initial_type_a initial_type_b=$initial_type_b initial_pre_EOL=$initial_pre_EOL >> $recordFile

  #previous_type_a_health  previous_type_b_health previous_pre_EOL_info
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=3 skip=28
  previous_type_a=$(cat $tmpFile)
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=3 skip=46
  previous_type_b=$(cat $tmpFile)
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=3 skip=64
  previous_pre_EOL=$(cat $tmpFile)

  echo previous_type_a=$previous_type_a previous_type_b=$previous_type_b previous_pre_EOL=$previous_pre_EOL >> $recordFile

  #previous_type_a_health  previous_type_b_health previous_pre_EOL_info
  #type_a, type_b, pre_EOL_info: wr_emmc_size_cnt_pre length
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=1 skip=31
  type_a_wr_emmc_size_cnt_pre_len=$(cat $tmpFile)
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=1 skip=49
  type_b_wr_emmc_size_cnt_pre_len=$(cat $tmpFile)
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=1 skip=67
  pre_EOL_wr_emmc_size_cnt_pre_len=$(cat $tmpFile)

  
  #type_a, type_b & pre_EOL remainder_pre_len
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=1 skip=32
  type_a_remainder_pre_len=$(cat $tmpFile)
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=1 skip=50
  type_b_remainder_pre_len=$(cat $tmpFile)
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=1 skip=68
  pre_EOL_remainder_pre_len=$(cat $tmpFile)

  #type_a, type_b & pre_EOL wr_emmc_size_cnt_pre
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=$((type_a_wr_emmc_size_cnt_pre_len)) skip=33
  type_a_wr_emmc_size_cnt_pre=$(cat $tmpFile)
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=$((type_b_wr_emmc_size_cnt_pre_len)) skip=51
  type_b_wr_emmc_size_cnt_pre=$(cat $tmpFile)
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=$((pre_EOL_wr_emmc_size_cnt_pre_len)) skip=69
  pre_EOL_wr_emmc_size_cnt_pre=$(cat $tmpFile)

  #type_a, type_b pre_EOL remainder_pre
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=$((type_a_remainder_pre_len)) skip=37
  type_a_remainder_pre=$(cat $tmpFile)
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=$((type_b_remainder_pre_len)) skip=55
  type_b_remainder_pre=$(cat $tmpFile)
  dd if=/dev/block/mmcblk0boot0 of=$tmpFile bs=1 count=$((pre_EOL_remainder_pre_len)) skip=73
  pre_EOL_remainder_pre=$(cat $tmpFile)
else
  echo "first read and initialize it!!!" >> $debugFile

  echo "55AA" > $tmpFile
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=4

  #wr_emmc_size_cnt_base length
  echo 1 > $tmpFile
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=4
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=31
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=49
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=67
  
  #remainder_base length
  echo 1 > $tmpFile
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=5
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=32
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=50
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=68

  #wr_emmc_size_cnt_base
  echo 0 > $tmpFile
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=4 seek=6
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=4 seek=33
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=4 seek=51
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=4 seek=69

  #remainder_base
  echo 0 > $tmpFile
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=9 seek=10
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=9 seek=37
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=9 seek=55
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=9 seek=73

  initial_type_a=$(cat /sys/bus/mmc/devices/mmc1:0001/type_a_health)
  initial_type_b=$(cat /sys/bus/mmc/devices/mmc1:0001/type_b_health)
  initial_pre_EOL=$(cat /sys/bus/mmc/devices/mmc1:0001/pre_EOL_info)

  previous_type_a=$(cat /sys/bus/mmc/devices/mmc1:0001/type_a_health)
  previous_type_b=$(cat /sys/bus/mmc/devices/mmc1:0001/type_b_health)
  previous_pre_EOL=$(cat /sys/bus/mmc/devices/mmc1:0001/pre_EOL_info)

  # type_a_health information
  echo $previous_type_a > $tmpFile
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=3 seek=19
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=3 seek=28
  echo 0 > $tmpFile
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=82
  
  # type_b_health information
  echo $previous_type_b > $tmpFile
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=3 seek=22
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=3 seek=46
  echo 0 > $tmpFile
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=98

  # pre_EOL_info
  echo $previous_pre_EOL > $tmpFile
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=3 seek=25
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=3 seek=64
  echo 0 > $tmpFile
  dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=114

  wr_emmc_size_cnt_base_len=1
  remainder_base_len=1
  wr_emmc_size_cnt_base=0
  remainder_base=0

  type_a_wr_emmc_size_cnt_pre_len=1
  type_b_wr_emmc_size_cnt_pre_len=1
  pre_EOL_wr_emmc_size_cnt_pre_len=1
  type_a_remainder_pre_len=1
  type_b_remainder_pre_len=1
  pre_EOL_remainder_pre_len=1
  type_a_wr_emmc_size_cnt_pre=0
  type_b_wr_emmc_size_cnt_pre=0
  pre_EOL_wr_emmc_size_cnt_pre=0
  type_a_remainder_pre=0
  type_b_remainder_pre=0
  pre_EOL_remainder_pre=0

  echo $wr_emmc_size_cnt_base > $cntbaseFile
  echo $remainder_base > $remainderbaseFile  
fi

counter=0
while true
do
  # loop infinitely
  wr_emmc_size_cnt=$(cat /sys/bus/mmc/devices/mmc1:0001/wr_emmc_size_cnt)
  remainder=$(cat /sys/bus/mmc/devices/mmc1:0001/remainder)
  sectors=$(cat /sys/bus/mmc/devices/mmc1:0001/sectors)
  type_a=$(cat /sys/bus/mmc/devices/mmc1:0001/type_a_health)
  type_b=$(cat /sys/bus/mmc/devices/mmc1:0001/type_b_health)
  pre_EOL=$(cat /sys/bus/mmc/devices/mmc1:0001/pre_EOL_info)
  #echo sectors= $sectors >> $debugFile

  wr_emmc_size_cnt_total=$((${wr_emmc_size_cnt_base}+${wr_emmc_size_cnt}))
  remainder_total=$((${remainder_base}+${remainder}))

  echo wr_emmc_size_cnt_base= $wr_emmc_size_cnt_base wr_emmc_size_cnt= $wr_emmc_size_cnt wr_emmc_size_cnt_total= $wr_emmc_size_cnt_total >> $debugFile
  echo remainder_base= $remainder_base remainder= $remainder remainde_total= $remainder_total >> $debugFile

  div=$((${remainder_total}/${sectors}))

  if [ $div -gt 0 ];then
        #echo div is greater than 0 div=$div
        wr_emmc_size_cnt_total=$((${wr_emmc_size_cnt_total}+${div}))
        remainder_total=$((${remainder_total}%${sectors}))

        echo wr_emmc_size_cnt_total= $wr_emmc_size_cnt_total >> $debugFile
        echo remainde_total= $remainder_total >> $debugFile
  fi

  if [ $div -gt 3000 ];then
        echo emmc life span is nearly expired!!! >> $debugFile
  fi

  wr_emmc_size_cnt_base_len=1
  remainder_base_len=1
  wr_emmc_size_cnt_total_tmp=$wr_emmc_size_cnt_total
  remainder_total_tmp=$remainder_total

  while [ $((wr_emmc_size_cnt_total_tmp/10)) -gt 0 ]
  do
      wr_emmc_size_cnt_total_tmp=$((wr_emmc_size_cnt_total_tmp/10))
      wr_emmc_size_cnt_base_len=$((wr_emmc_size_cnt_base_len+1))
  done

  while [ $((remainder_total_tmp/10)) -gt 0 ]
  do
      remainder_total_tmp=$((remainder_total_tmp/10))
      remainder_base_len=$((remainder_base_len+1))
  done

  #echo save update into debug file >> $debugFile
  #echo wr_emmc_size_cnt_base_len= $wr_emmc_size_cnt_base_len >> $debugFile
  #echo remainder_base_len= $remainder_base_len >> $debugFile

  #cannot write to emmc boot partition too frequently for emmc boot partition life span
  # we expect write record to emmc boot partition per 6 hours
  if [ $((counter%144)) -eq 0 ];then
  	#wr_emmc_size_cnt_base length
  	echo $wr_emmc_size_cnt_base_len > $tmpFile
  	dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=4

  	#remainder_base length
  	echo $remainder_base_len > $tmpFile
  	dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=5

  	#wr_emmc_size_cnt_total
  	echo  $wr_emmc_size_cnt_total > $tmpFile
  	dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=4 seek=6

  	#remainder_total
  	echo $remainder_total > $tmpFile
  	dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=9 seek=10
  	sync
  fi

  #record the wr_emmc_size_cnt_total and remainder_total when type_a type_b pre_EOL change
  if [ "$previous_type_a" != "$type_a" ];then
  	type_a_sub=$((${type_a}-${previous_type_a}))
	if [ $((${remainder_total}-${type_a_remainder_pre})) -lt 0  ];then
                remainder_total_temp=$((${remainder_total}+${sectors}))
                wr_emmc_size_cnt_total_temp=$((wr_emmc_size_cnt_total_tmp-1))
                type_a_wr_emmc_size_cnt_sub=$((${wr_emmc_size_cnt_total_temp}-${type_a_wr_emmc_size_cnt_pre}))
                type_a_remainder_sub=$((${remainder_total_temp}-${type_a_remainder_pre}))
        else
                type_a_wr_emmc_size_cnt_sub=$((${wr_emmc_size_cnt_total}-${type_a_wr_emmc_size_cnt_pre}))
                type_a_remainder_sub=$((${remainder_total}-${type_a_remainder_pre}))
        fi
	
	wr_emmc_size_cnt_sub_len=1
	remainder_sub_len=1
  	wr_emmc_size_cnt_sub_tmp=$type_a_wr_emmc_size_cnt_sub
  	remainder_sub_tmp=$type_a_remainder_sub

  	while [ $((wr_emmc_size_cnt_sub_tmp/10)) -gt 0 ]
  	do
      		wr_emmc_size_cnt_sub_tmp=$((wr_emmc_size_cnt_sub_tmp/10))
      		wr_emmc_size_cnt_sub_len=$((wr_emmc_size_cnt_sub_len+1))
  	done

  	while [ $((remainder_sub_tmp/10)) -gt 0 ]
  	do
      		remainder_sub_tmp=$((remainder_sub_tmp/10))
      		remainder_sub_len=$((remainder_sub_len+1))
  	done

	echo $type_a_sub > $tmpFile
  	dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=82
	echo $wr_emmc_size_cnt_sub_len > $tmpFile
  	dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=83
	echo $remainder_sub_len > $tmpFile
  	dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=84
	echo  $type_a_wr_emmc_size_cnt_sub > $tmpFile
  	dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=4 seek=85
	echo $type_a_remainder_sub > $tmpFile
  	dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=9 seek=89

	echo type_a_health $previous_type_a "->" $type_a: type_a_wr_emmc_size_cnt= $type_a_wr_emmc_size_cnt_sub type_a_remainder= $type_a_remainder_sub >> $recordFile
	echo wr_emmc_size_cnt: $type_a_wr_emmc_size_cnt_pre "->" $wr_emmc_size_cnt_total   remainder: $type_a_remainder_pre "->" $remainder_total >> $recordFile

	#update the pre_type_a pre_type_b & pre_pre_EOL
	previous_type_a=$type_a
	type_a_wr_emmc_size_cnt_pre=$wr_emmc_size_cnt_total 
	type_a_wr_emmc_size_cnt_pre_len=$wr_emmc_size_cnt_base_len
	type_a_remainder_pre_len=$remainder_base_len
	type_a_remainder_pre=$remainder_total
	
	echo $type_a > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=3 seek=28
	echo $type_a_wr_emmc_size_cnt_pre_len > $tmpFile
  	dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=31
  	echo $type_a_remainder_pre_len > $tmpFile
  	dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=32
  	echo  $type_a_wr_emmc_size_cnt_pre > $tmpFile
  	dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=4 seek=33
  	echo $type_a_remainder_pre > $tmpFile
  	dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=9 seek=37
  fi

  if [ "$previous_type_b" != "$type_b" ];then
        type_b_sub=$((${type_b}-${previous_type_b}))
        if [ $((${remainder_total}-${type_b_remainder_pre})) -lt 0  ];then
                remainder_total_temp=$((${remainder_total}+${sectors}))
                wr_emmc_size_cnt_total_temp=$((wr_emmc_size_cnt_total_tmp-1))
                type_b_wr_emmc_size_cnt_sub=$((${wr_emmc_size_cnt_total_temp}-${type_b_wr_emmc_size_cnt_pre}))
                type_b_remainder_sub=$((${remainder_total_temp}-${type_b_remainder_pre}))
        else
                type_b_wr_emmc_size_cnt_sub=$((${wr_emmc_size_cnt_total}-${type_b_wr_emmc_size_cnt_pre}))
                type_b_remainder_sub=$((${remainder_total}-${type_b_remainder_pre}))
        fi

        wr_emmc_size_cnt_sub_len=1
        remainder_sub_len=1
        wr_emmc_size_cnt_sub_tmp=$type_b_wr_emmc_size_cnt_sub
        remainder_sub_tmp=$type_b_remainder_sub

        while [ $((wr_emmc_size_cnt_sub_tmp/10)) -gt 0 ]
        do
                wr_emmc_size_cnt_sub_tmp=$((wr_emmc_size_cnt_sub_tmp/10))
                wr_emmc_size_cnt_sub_len=$((wr_emmc_size_cnt_sub_len+1))
        done

        while [ $((remainder_sub_tmp/10)) -gt 0 ]
        do
                remainder_sub_tmp=$((remainder_sub_tmp/10))
                remainder_sub_len=$((remainder_sub_len+1))
        done

	echo $type_b_sub > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=98
        echo $wr_emmc_size_cnt_sub_len > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=99
        echo $remainder_sub_len > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=100
        echo  $type_b_wr_emmc_size_cnt_sub > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=4 seek=101
        echo $type_b_remainder_sub > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=9 seek=105
        
	echo type_b_health $previous_type_b "->" $type_b: type_b_wr_emmc_size_cnt= $type_b_wr_emmc_size_cnt_sub type_b_remainder= $type_b_remainder_sub >> $recordFile
	echo wr_emmc_size_cnt: $type_b_wr_emmc_size_cnt_pre "->" $wr_emmc_size_cnt_total   remainder: $type_b_remainder_pre "->" $remainder_total >> $recordFile

        #update the pre_type_a pre_type_b & pre_pre_EOL
        previous_type_b=$type_b
        type_b_wr_emmc_size_cnt_pre=$wr_emmc_size_cnt_total
        type_b_wr_emmc_size_cnt_pre_len=$wr_emmc_size_cnt_base_len
        type_b_remainder_pre_len=$remainder_base_len
        type_b_remainder_pre=$remainder_total

        echo $type_b > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=3 seek=46
        echo $type_b_wr_emmc_size_cnt_pre_len > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=49
        echo $type_b_remainder_pre_len > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=50
        echo  $type_b_wr_emmc_size_cnt_pre > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=4 seek=51
        echo $type_b_remainder_pre > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=9 seek=55
  fi

  if [ "$previous_pre_EOL" != "$pre_EOL" ];then
        pre_EOL_sub=$((${pre_EOL}-${previous_pre_EOL}))
        if [ $((${remainder_total}-${pre_EOL_remainder_pre})) -lt 0  ];then
                remainder_total_temp=$((${remainder_total}+${sectors}))
                wr_emmc_size_cnt_total_temp=$((wr_emmc_size_cnt_total_tmp-1))
                pre_EOL_wr_emmc_size_cnt_sub=$((${wr_emmc_size_cnt_total_temp}-${pre_EOL_wr_emmc_size_cnt_pre}))
                pre_EOL_remainder_sub=$((${remainder_total_temp}-${pre_EOL_remainder_pre}))
        else
                pre_EOL_wr_emmc_size_cnt_sub=$((${wr_emmc_size_cnt_total}-${pre_EOL_wr_emmc_size_cnt_pre}))
                pre_EOL_remainder_sub=$((${remainder_total}-${pre_EOL_remainder_pre}))
        fi

        wr_emmc_size_cnt_sub_len=1
        remainder_sub_len=1
        wr_emmc_size_cnt_sub_tmp=$pre_EOL_wr_emmc_size_cnt_sub
        remainder_sub_tmp=$pre_EOL_remainder_sub

        while [ $((wr_emmc_size_cnt_sub_tmp/10)) -gt 0 ]
        do
                wr_emmc_size_cnt_sub_tmp=$((wr_emmc_size_cnt_sub_tmp/10))
                wr_emmc_size_cnt_sub_len=$((wr_emmc_size_cnt_sub_len+1))
        done

        while [ $((remainder_sub_tmp/10)) -gt 0 ]
        do
                remainder_sub_tmp=$((remainder_sub_tmp/10))
                remainder_sub_len=$((remainder_sub_len+1))
        done

	echo $pre_EOL_sub > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=114
        echo $wr_emmc_size_cnt_sub_len > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=115
        echo $remainder_sub_len > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=116
        echo  $pre_EOL_wr_emmc_size_cnt_sub > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=4 seek=117
        echo $pre_EOL_remainder_sub > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=9 seek=121
        
	echo pre_EOL_info $previous_pre_EOL "->" $pre_EOL: pre_EOL_wr_emmc_size_cnt= $pre_EOL_wr_emmc_size_cnt_sub pre_EOL_remainder= $pre_EOL_remainder_sub >> $recordFile
	echo wr_emmc_size_cnt: $pre_EOL_wr_emmc_size_cnt_pre "->" $wr_emmc_size_cnt_total   remainder: $pre_EOL_remainder_pre "->" $remainder_total >> $recordFile

        #update the pre_type_a pre_type_b & pre_pre_EOL
        previous_pre_EOL=$pre_EOL
        pre_EOL_wr_emmc_size_cnt_pre=$wr_emmc_size_cnt_total
        pre_EOL_wr_emmc_size_cnt_pre_len=$wr_emmc_size_cnt_base_len
        pre_EOL_remainder_pre_len=$remainder_base_len
        pre_EOL_remainder_pre=$remainder_total

        echo $pre_EOL > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=3 seek=64
        echo $pre_EOL_wr_emmc_size_cnt_pre_len > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=67
        echo $pre_EOL_remainder_pre_len > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=1 seek=68
        echo  $pre_EOL_wr_emmc_size_cnt_pre > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=4 seek=69
        echo $pre_EOL_remainder_pre > $tmpFile
        dd if=$tmpFile of=/dev/block/mmcblk0boot0 bs=1 count=9 seek=73
  fi

  counter=$((counter+1))
  sleep 300
done
