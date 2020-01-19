## RTD1295 OpenWrt 19.07.0-rc2+ 移植项目
[English Version](/README_EN.MD)

### 一.项目说明
![Screenshot](screenshot.jpg?raw=true)

本项目基于 [OpenWrt](https://www.openwrt.org/) 19.07.0-rc2 镜像和 Zidoo Z9S 官方OTA包, 旨在构建适用于 RTD1295/RTD1296 的最新版 [OpenWrt](https://www.openwrt.org/).

作者本人只有一台 Zidoo Z9S(RTD1296), 理论上 RTD1295/RTD1296 方案的 Android+OpenWrt 双系统都能通过这个项目将 OpenWrt 更新到最新版.
理论上支持的盒子: 
1. Zidoo X9S/Z9S/X10/Z10/X20 
2. 开博尔 Q10PLUS(一代和二代)/Q20/Q20PLUS/Q30PLUS 

如果还有其他相同解决方案的盒子, 欢迎补充.

**~~有机友反馈 Zidoo X9S(RTD1295) 刷了以后启动不了, 也许RTD1295不兼容, 所以RTD1295的设备先别刷!!~~**

**Zidoo X9S(RTD1295)的Linux内核版本和Android版本跟Z9S不一样, 所以提供另外的包下载.**

附: 一些自己整理的[教程](https://github.com/jjm2473/rtd1295-openwrt18-porting/wiki) (Wiki页面)

#### 已知BUG
1. (1.5版已修复) ~~lua的tonumber方法解析大于0x80000000且不含有0x80000000位的数字有误, 将只保留低31位, 例如大于4294967295且小于6442450944的数字会被解析成(0, 2147483648)~~
2. (1.5版已修复) ~~对于lua代码中出现的数字有跟1相同的bug~~
3. (1.5版已修复) ~~受1影响, 大于2T且小于3T的分区在挂载点中显示的分区大小会比真实数据小2T(不影响挂载)~~

### 二.安装方法
0. 视自身情况备份盒子配置(包括OpenWrt和安卓)
1. 从[发布](#发布)列表选择合适的版本
2. 点击相应链接进入版本详情
3. 下载update.op18*.zip
4. 跟平常OTA刷机一样刷入这个zip包
5. 第一次刷的话, 刷完可能还要重置下OpenWrt设置

刷完之后, 会自动重启, 如果出现:
1. 无法进入安卓桌面, 可能是不兼容了, 只能用非OTA方式刷回官方固件 (例如Z9S的[刷机教程](https://www.zidoo.tv/Support/support_guide/guide_target/jYabok9%2Ba0beq7k9e%5Bld%5D3ulg%3D%3D.html))
2. 能进入安卓桌面, 但无法连接 OpenWrt, 或者 OpenWrt 里各种问题, 请重置 OpenWrt, 如果设置里面重置失败, 可以参考下面的[OpenWrt配置重置包](#三openWrt配置重置包)
3. 进入安卓桌面很快又自动重启了, 也就是循环重启, 建议参考1恢复官方固件后, 用官方OTA升级到合适版本, 别去修改 Openwrt 的任何配置, 再[重新安装](#二安装方法), 如果还是出现1或3的情况, 那就参考1放弃吧

### 三.OpenWrt配置重置包
此方法适用于能进入安卓系统的情况下重置 OpenWrt, 跟平时刷OTA包一样刷入[reset_op.signed.zip](https://github.com/jjm2473/rtd1295-openwrt18-porting/raw/master/reset_op.signed.zip)即可  (https://github.com/jjm2473/rtd1295-openwrt18-porting/raw/master/reset_op.signed.zip)

### 四.恢复官方版本OpenWrt
只要刷回官方OTA包即可
 
--------------------------
 
### 发布
从1.3版本开始, 提供RTD1295分支和RTD1296分支, RTD1295分支支持 (Linux 4.1.17-g9100299-dirty + Android 6.0.1) 底包(例如X9S), RTD1296分支支持 (Linux 4.1.35-04005-g6c2818e-dirty + Android 7.1.1) 底包(例如Z9S).

1.3版之前的包只支持(Linux 4.1.35-04005-g6c2818e-dirty + Android 7.1.1)底包.

#### 2.0.0 (2020-01-03)
*1. 合并Openwrt 19.07.0-rc2，可以使用稳定的软件源*

*目前发现此版本刚刷完之后Samba服务在其他设备不会被发现，手动输入IP又能挂载成功，过段时间可能又能被其他设备发现，怀疑是DNS缓存导致的，刚刷完建议设置主机名，然后重启当前设备以及路由器*

* RTD1296 (Z9S等)
    * [完整版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/z9s_2.0.0_full) (**推荐**)
* RTD1295 (X9S等)
    * [完整版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/x9s_2.0.0_full) (**推荐**)

#### 1.5.1 (2019-06-18)
*1. 修复FTP用户列表错误*

* RTD1296 (Z9S等)
    * [完整版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.5.1_full)
* RTD1295 (X9S等)
    * [完整版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/x9s_1.5.1_full)

#### 1.5 (2019-05-11)
*1. 移植Zidoo的luci-app-diskmanager, 磁盘管理工具*

*2. lua编译成64位版, 修复数字溢出问题 https://github.com/openwrt/openwrt/pull/2050*

*3. 修复aria2配置应用失败问题*

*4. 延迟启动Android, 提高[获取ipv6](https://github.com/jjm2473/rtd1295-openwrt18-porting/wiki/IPv6%E9%85%8D%E7%BD%AE)成功率*

* RTD1296 (Z9S等)
    * [完整版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.5_full)
* RTD1295 (X9S等)
    * [完整版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/x9s_1.5_full)

#### 1.4 (2019-04-13)
*完整版只是增加了aria2*

*增加[FlexGet特别版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.4_flexget), 给需要Python环境和[FlexGet](https://flexget.com/)的用户*

* RTD1296
    * [完整版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.4_full)
    * [FlexGet特别版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.4_flexget) (**Python + FlexGet**)
* RTD1295 (未更新)
    * [1.3](#13-2019-04-11)

#### 1.3 (2019-04-11)
*1.开始支持X9S, 感谢机油**凛冬将至**的耐心测试*

*2.支持在Android里重置OpenWrt, 感谢Zidoo官方提供的参考资料*

*3.关机或重启前尝试休眠硬盘*

* RTD1296
    * [完整版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.3_full)
* RTD1295
    * [完整版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/x9s_1.3_full)

#### 1.2 (2019-04-07)
*比1.1增加支持自动挂载swap分区*
* [完整版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.2_full)

#### 1.1 (2019-04-05)
*比1.0增加支持自动挂载网络磁盘(CIFS/NFS)*
* [完整版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.1_full)

#### 1.0 (2019-04-05)
*Zidoo Z9S 底包 2.1.40/2.1.30 测试通过*
* [完整版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.0_full)
* [基础带Luci版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.0_luci)
* [基础无Luci版](https://github.com/jjm2473/rtd1295-openwrt18-porting/releases/tag/1.0_no_luci)

--------------------------
--------------------------

### 参考信息
1. OpenWrt: https://www.openwrt.org/
2. RTD1295: https://www.realtek.com/zh/products/communications-network-ics/item/rtd1295
3. Zidoo: https://www.zidoo.tv/
