## 移植笔记
### 1. 系统init流程
系统启动时挂载的根目录是mmcblk0p9, 对应镜像squashfs1.img, 内核启动的第一个进程是/etc/init, 这个init大概流程是(只讨论双系统启动):
1. ```fork```一个进程, 子进程使用新的PID命名空间```exec /etc/preinit```(OpenWrt的初始化进程)
2. 挂载tmpfs到```/android```, 再把/mnt/android复制到/android
3. 切换工作目录到```/android```
4. 等待```.coldplug_done```文件出现 (这个文件实际是由OpenWrt的procd写入的, 表示驱动加载完了), 最多等待10秒
5. 改变根目录到当前目录, 使用新的文件系统命名空间```exec /init```(Android的初始化进程)

可以发现, 在Android里面可以看到OpenWrt的进程, 反过来就不行, 
OpenWrt里面的/rom/android目录实际就是Android的根目录, 挂载为可写以后, 写入的文件在Android里也能看到. 

代码在 https://github.com/jjm2473/rtd1295-toolchain/tree/master/src/openwrt_android/init , 
实际上X9S的/etc/init是一段shell脚本, 功能完全一样.

### 2. Android中控制OpenWrt的服务
实现方式是用UBus, 但UBus的监听地址跟原版OpenWrt不一样, 原版的是普通命名方式(/var/run/ubus.sock), 而此双系统为了跨根目录提供服务, 使用了抽象命名方式(@/var/run/ubus.sock)

参考 https://blog.csdn.net/q1007729991/article/details/71175679
----------
...
#### 2. 抽象 unix 域套接字地址
使用这种套接字地址，它并不会在文件系统中产生真正的套接字文件，而是由内核帮我们维护一个抽象套接字文件，它总是以 '@'开头，比如 @dog。所以，它的好处自然很明显，不用产生实际文件了。

既然 sun_path[0] == '\0'，使用普通的方法就没办法得知抽象套接字文件的名字。unix 域协议规定使用套接字地址的长度来确定 sun_path.

比如套接字地址内容如下：
```
    struct sockaddr_un addr = {
        AF_LOCAL, // 长度为 2
        {'\0', 'd', 'o', 'g'} // 长度为 4
    }
```
则该 addr 的长度应该设置为 2 + 4 = 6.

在 bind 抽象 unix 域套接字地址的时候，不能再使用 sizeof(addr) 作为 bind 的最后一个参数了，而应该使用上面计算出来的 6 这个结果。

#### 3. unix 域套接字长度计算
在 sys/un.h 有一个宏 SUN_LEN 可以计算该 addr 的长度：
```
    #define SUN_LEN(ptr) ((size_t) (((struct sockaddr_un *) 0)->sun_path) + strlen ((ptr)->sun_path))
```

不过我们不能直接在抽象的 unix 域套接字地址上使用它，因为这个宏使用到了 strlen 函数。使用的时候可以用下面的方法：
```
    struct sockaddr_un addr;
    addr.sun_family = AF_LOCAL;
    strcpy(addr.sun_path + 1, "dog");
    addr.sun_path[0] = '@'; // 先用非空字符占个位
    len = SUN_LEN(&addr); // 计算长度
    addr.sun_path[0] = 0; // 设置成抽象 unix 域套接字地址
```
...
----------

由于Zidoo的bug, 计算len使用的是``` len = sizeof(addr) ```, 所以为了兼容Zidoo也应该用 sizeof, 

实现了一个代理来兼容Zidoo的Android系统, 代码在 https://github.com/jjm2473/rtd1295-toolchain/tree/master/src/openwrt_android/xubus

## 网络共享的限制
* NFSD 不能导出 /mnt, 可以导出其中的挂载点
* VSFTPD 可以导出 /mnt, 不能导出其中的挂载点, 但客户端可以访问
* SAMBA4 可以导出 /mnt, 也能导出其中的挂载点, 但是客户端挂载 /mnt 访问不了其中的挂载点
