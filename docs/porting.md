### 适配记录

UBus的监听地址跟官方Openwrt不一样, 官方的是普通命名方式(/var/run/ubus.sock), 而此双系统为了跨根目录提供服务, 使用了抽象命名方式(@/var/run/ubus.sock)
参考 https://blog.csdn.net/q1007729991/article/details/71175679
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

NFSD 不能导出 /mnt, 可以导出其中的挂载点
VSFTPD 可以导出 /mnt, 不能导出其中的挂载点, 但可以访问
SAMBA4 可以导出 /mnt, 也能导出其中的挂载点, 但是客户端挂载 /mnt 访问不了其中的挂载点
