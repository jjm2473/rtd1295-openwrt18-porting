local e=require"nixio.fs"
local e=require"nixio.util"
m=Map("nfsd",translate("NFS Server"),translate("The Network File System is the protocol of choice to share files over an internal Local Area Network."))
s=m:section(TypedSection,"nfsd_mount",translate("NFS Share Points"))
s.anonymous=true
s.addremove=true
dir=s:option(Value,"share_dir",translate("Shared Directory"))
dir.optional=false
dir.default="/mnt"
s:option(Value,"share_ip",translate("Listen IP")).default='*'
s:option(Value,"share_options",translate("Share Options")).default='ro,insecure,sync,anonuid=1023,all_squash'
return m
