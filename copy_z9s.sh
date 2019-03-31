function copyz9s() {
    echo $1.* | xargs -n1 sh -c 'cp -a $0 ~/src/rtd1295-openwrt18-porting/root/$0'
    cat $1.list | xargs -n1 sh -c 'cp -a .$0 ~/src/rtd1295-openwrt18-porting/root$0'
}