#!/sbin/busybox sh
if [ ! -f "/system/bin/tee-supplicant" ]
then
echo "/system/bin/tee-supplicant has not found."
else
sync
chown mediadrm:mediadrm /system/vendor/lib/liboemcrypto.so
chown mediadrm:mediadrm /system/vendor/lib/mediadrm/libwvdrmengine.so
chown media:audio /system/vendor/lib/mediadrm/libPlayReadyDrmCryptoPlugin.so
chmod 660 /system/vendor/lib/liboemcrypto.so
chmod 660 /system/vendor/lib/mediadrm/libwvdrmengine.so
chmod 660 /system/vendor/lib/mediadrm/libPlayReadyDrmCryptoPlugin.so
chmod 640 /dev/teepriv0
chmod 640 /dev/tee0
sync
tee-supplicant &
sync
sync
sync
chown media:audio /dev/teepriv0
chown media:audio /dev/tee0
tee_secure_store_agent
sync
tee_antirollback_clock &
fi

if [ ! -f "/vendor/modules/optee.ko" ] || [ ! -f "/vendor/modules/optee_armtz.ko" ]
then
echo "/vendor/modules/optee.ko, optee_armtz.ko not found !!"
else
insmod /vendor/modules/optee.ko
insmod /vendor/modules/optee_armtz.ko
sync
chown mediadrm:mediadrm /system/vendor/lib/liboemcrypto.so
chown mediadrm:mediadrm /system/vendor/lib/mediadrm/libwvdrmengine.so
chown media:audio /system/vendor/lib/mediadrm/libPlayReadyDrmCryptoPlugin.so
chown mediadrm:mediadrm /data/lib/liboemcrypto.so
chown mediadrm:mediadrm /data/lib/mediadrm/libwvdrmengine.so
chown media:audio /data/lib/mediadrm/libPlayReadyDrmCryptoPlugin.so
chmod 660 /system/vendor/lib/liboemcrypto.so
chmod 660 /system/vendor/lib/mediadrm/libwvdrmengine.so
chmod 660 /system/vendor/lib/mediadrm/libPlayReadyDrmCryptoPlugin.so
chmod 660 /data/lib/liboemcrypto.so
chmod 660 /data/lib/mediadrm/libwvdrmengine.so
chmod 660 /data/lib/mediadrm/libPlayReadyDrmCryptoPlugin.so
chmod 640 /dev/opteearmtz00
sync
tee-supplicant &
sync
sync
sync
chown media:audio /dev/opteearmtz00
chown media:audio /tmp/factory/aeskey.bin
chown media:audio /tmp/factory/bgroupcert.dat
chown media:audio /tmp/factory/devcerttemplate.dat
chown media:audio /tmp/factory/priv.dat
chown media:audio /tmp/factory/zgpriv.dat
chown media:audio /tmp/factory/enc_aeskey.bin
chown media:audio /tmp/factory/enc_bgroupcert.bin
chown media:audio /tmp/factory/enc_devcerttemplate.bin
chown media:audio /tmp/factory/enc_priv.bin
chown media:audio /tmp/factory/enc_zgpriv.bin
chown media:audio /tmp/factory/widevine.bin
sync
chmod 644 /tmp/factory/aeskey.bin
chmod 644 /tmp/factory/bgroupcert.dat
chmod 644 /tmp/factory/devcerttemplate.dat
chmod 644 /tmp/factory/priv.dat
chmod 644 /tmp/factory/zgpriv.dat
chmod 644 /tmp/factory/enc_aeskey.bin
chmod 644 /tmp/factory/enc_bgroupcert.bin
chmod 644 /tmp/factory/enc_devcerttemplate.bin
chmod 644 /tmp/factory/enc_priv.bin
chmod 644 /tmp/factory/enc_zgpriv.bin
chmod 660 /tmp/factory/widevine.bin
sync
fi
