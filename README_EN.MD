## RTD1295 OpenWrt 19.07.0-rc2+ Porting Project
[中文版](/README.MD)

### I. Project Description
![Screenshot](screenshot.jpg?raw=true)

This project is based on the [OpenWrt](https://www.openwrt.org/) 19.07.0-rc2 image and the Zidoo Z9S official OTA package, designed to build the latest version of [OpenWrt](https://www.openwrt.org/) for RTD1295/RTD1296.

The author has only one Zidoo Z9S. In theory, the Android+OpenWrt dual system of the RTD1295/RTD1296 solution can update OpenWrt to the latest version through this project.
Theoretically supported box:
1. Zidoo X9S/Z9S/X10/Z10/X20
2. Kaiboer Q10PLUS (generation 1 and 2) / Q20 / Q20PLUS / Q30PLUS

If there are other boxes with the same solution, welcome to add.

**~~A friend test on Zidoo X9S but failed!! RTD1295 may not supported!!~~**

**Linux kernel version and Android version is different from Zidoo X9S to Z9S, so there will offer another package to support them (RTD1295).**

### II. Installation
0. Back up the box configuration (including OpenWrt and Android)
1. Select the appropriate version from the [Release](#release) list
2. Click on the appropriate link to go to the version details
3. Download update.op18*.zip
4. Flash this zip package as a normal OTA package
5. OpenWrt reseting may needed after first time installation

After the flashing is finished, it will restart automatically, if it appears:
1. Can not enter the Android desktop, may be incompatible, can only use the non-OTA way to flash back the official firmware (such as Z9S's [flashing tutorial](https://www.zidoo.tv/Support/support_guide/guide_target/jYabok9%2Ba0beq7k9e%5Bld%5D3ulg%3D%3D.html))
2. Can enter the Android desktop, but can not connect OpenWrt, or OpenWrt various problems, please reset OpenWrt, if the reset fails in the settings, you can refer to the following [OpenWrt configuration reseting package](#iii-openwrt-configuration-reseting-package)
3. Enter the Android desktop and it restart automatically, that is, cycle restart. It is recommended to refer to 1 to restore the official firmware, upgrade to the appropriate version with the official OTA, do not modify any configuration of Openwrt, and then [reinstall](#ii-installation), if there is still appears 1 or 3, then refer to 1 to give up

### III. OpenWrt configuration reseting package
This method is suitable for resetting OpenWrt when you can enter the Android system. Just like the usual OTA package, flash [reset_op.signed.zip](https://github.com/jjm2473/rtd1295-openwrt18-porting/raw/master/reset_op.signed.zip) (https://github.com/jjm2473/rtd1295-openwrt18-porting/raw/master/reset_op.signed.zip)

### IV. Restore OpenWrt to the official version 
Just falsh back the official OTA package.

----------------

### Release

From 1.3, offering RTD1295 and RTD1296 varients, RTD1295 varient supports (Linux 4.1.17-g9100299-dirty + Android 6.0.1) devices (X9S, etc.), RTD1296 varient supports (Linux 4.1.35-04005-g6c2818e-dirty + Android 7.1.1) (Z9S, etc.).

Before 1.3, only supports (Linux 4.1.35-04005-g6c2818e-dirty + Android 7.1.1).

#### 2.0.0 (2020-01-03)
*1. Merged Openwrt 19.07.0-rc2*

* RTD1296 (Z9S,etc.)
    * [Complete Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/z9s_2.0.0_full) (**recommended**)
* RTD1295 (X9S,etc.)
    * [Complete Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/x9s_2.0.0_full) (**recommended**)

#### 1.5 (2019-05-11)
*1. Port zidoo's luci-app-diskmanager, the disk manager*

*2. Recompile lua in 64bit mode, to fix number overflow https://github.com/openwrt/openwrt/pull/2050*

*3. fix aria2 config apply fail*

*4. delay Android booting, make [ipv6 config](https://github.com/jjm2473/rtd1295-openwrt18-porting/wiki/IPv6%E9%85%8D%E7%BD%AE) works better*

* RTD1296 (Z9S,etc.)
    * [Complete Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.5_full)
* RTD1295 (X9S,etc.)
    * [Complete Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/x9s_1.5_full)

#### 1.4 (2019-04-13)
*Complete Edition only add aria2*

*Offer [FlexGet Sepcial](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.4_flexget), for those who need Python and [FlexGet](https://flexget.com/)*

* RTD1296
    * [Complete Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.4_full) 
    * [FlexGet Sepcial](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.4_flexget) (**Python + FlexGet**)
* RTD1295 (no update)
    * [1.3](#13-2019-04-11)

#### 1.3 (2019-04-11)
*1.Supports X9S, Thank **凛冬将至** for his test*

*2.Supports reset OpenWrt on Android, Thank Zidoo for offering references*

*3.Try to sleep hard disk before power off or reboot*

* RTD1296
    * [Complete Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.3_full)
* RTD1295
    * [Complete Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/x9s_1.3_full)


#### 1.2 (2019-04-07)
*compares to 1.1, 1.2 supports swap auto mounting*
* [Complete Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.2_full)

#### 1.1 (2019-04-05)
*compares to 1.0, 1.1 supports network disk (CIFS/NFS) auto mounting*
* [Complete Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.1_full)

#### 1.0 (2019-04-05)
*Zidoo Z9S with firmware 2.1.40/2.1.30 tested*
* [Complete Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.0_full)
* [Basic with Luci Edition](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.0_luci)
* [Basic without Luci version](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.0_no_luci)

----------------
----------------

### References
1. OpenWrt: https://www.openwrt.org/
2. RTD1295: https://www.realtek.com/en/products/communications-network-ics/item/rtd1295
3. Zidoo: https://www.zidoo.tv/
