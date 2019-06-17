cat root/usr/lib/opkg/status > /tmp/_tmp_opkg_status || exit
(cat /tmp/_tmp_opkg_status |tr "\n" "#" |sed 's/##/\$/g' |tr "$" "\n" |grep -v "^Package: kmod-" |grep "^Package:" |tr "\n" "$" |sed 's/\$/##/g' |tr -d "\n" |tr "#" "\n" && cat hold_opkg_status ) > root/usr/lib/opkg/status
rm -f /tmp/_tmp_opkg_status