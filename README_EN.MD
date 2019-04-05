## RTD1295 OpenWrt 18.06.2+ (SNAPSHOT) Porting Project
[中文版](/README.MD)

### I. Project Description
![Screenshot](screenshot.jpg?raw=true)

This project is based on the [OpenWrt](https://www.openwrt.org/) SNAPSHOT image and the Zidoo Z9S official OTA package, designed to build the latest version of [OpenWrt](https://www.openwrt.org/) for RTD1295/RTD1296.

The author has only one Zidoo Z9S. In theory, the Android+OpenWrt dual system of the RTD1295/RTD1296 solution can update OpenWrt to the latest version through this project.
Theoretically supported box:
1. Zidoo X9S/Z9S/X10/Z10/X20
2. Kaiboer Q10PLUS (first generation and second generation) / Q20 / Q20PLUS / Q30PLUS

If there are other boxes with the same solution, welcome to add.

### II. Installation
0. Back up the box configuration (including OpenWrt and Android)
1. Select the appropriate version from the [Release](#release) list.
2. Click on the appropriate link to go to the version details.
3. Download update.op18*.zip
4. Flash this zip package like a normal OTA package

After the flashing is finished, it will restart automatically, if it appears:
1. Can not enter the Android desktop, may be incompatible, can only use the non-OTA way to flash back the official firmware (such as Z9S's [flashing tutorial](https://www.zidoo.tv/Support/support_guide/guide_target/jYabok9%2Ba0beq7k9e%5Bld%5D3ulg%3D%3D.html))
2. Can enter the Android desktop, but can not connect OpenWrt, or OpenWrt various problems, please reset OpenWrt, if the reset fails in the settings, you can refer to the following [OpenWrt configuration reseting package](#iii-openwrt-configuration-reseting-package)
3. Enter the Android desktop and it restart automatically, that is, cycle restart. It is recommended to refer to 1 to restore the official firmware, upgrade to the appropriate version with the official OTA, do not modify any configuration of Openwrt, and then [reinstall](#ii-installation), if there is still appears 1 or 3, then refer to 1 to give up

### III. OpenWrt configuration reseting package
This method is suitable for resetting OpenWrt when you can enter the Android system. Just like the usual OTA package, flash [reset_op.signed.zip](https://github.com/jjm2473/rtd1295-openwrt18-porting/raw/master/reset_op.signed.zip) (https://github.com/jjm2473/rtd1295-openwrt18-porting/raw/master/reset_op.signed.zip)

### IV. Restore OpenWrt to the official version 
Just falsh back the official OTA package.

### Release
#### 1.1 (2019-04-05)
*compares to 1.0, 1.1 supports net disk (CIFS/NFS) auto mounting*
* [Complete Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.1_full) (**recommended**)

#### 1.0 (2019-04-05)
*Zidoo Z9S with firmware 2.1.40/2.1.30 tested*
* [Complete Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.0_full)
* [Basic with Luci Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.0_luci)
* [Basic without Luci version](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.0_no_luci)


### References
1. OpenWrt: https://www.openwrt.org/
2. RTD1295: https://www.realtek.com/en/products/communications-network-ics/item/rtd1295
3. Zidoo: https://www.zidoo.tv/