module("luci.controller.nfsd",package.seeall)
function index()
if not nixio.fs.access("/etc/config/nfsd")then
return
end
entry({"admin","services","nfsd"},cbi("nfsd"),_("NFS Server"),90).dependent=true
end
