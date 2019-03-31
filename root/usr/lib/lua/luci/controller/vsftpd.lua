--[[
LuCI - Lua Configuration Interface - vsftpd support

Script by Admin @ NVACG.org (af_xj@hotmail.com , xujun@smm.cn)
Some codes is based on luci-app-upnp, TKS.
The Author of luci-app-upnp is Steven Barth <steven@midlink.org> and Jo-Philipp Wich <xm@subsignal.org>

Licensed under the GPL License, Version 3.0 (the "license");
you may not use this file except in compliance with the License.
you may obtain a copy of the License at

	http://www.gnu.org/licenses/gpl.txt

$Id$
]]--

module("luci.controller.vsftpd",package.seeall)

function index()
	require("luci.i18n")
	-- luci.i18n.loadc("vsftpd")
	if not nixio.fs.access("/etc/config/vsftpd") then
		return
	end
	
	local page = entry({"admin","services","vsftpd"},cbi("vsftpd"),_("FTP"))
	page.i18n="vsftpd"
	page.dependent=true
	
	entry({"admin","services","vsftpd","status"}, call("connection_status")).leaf = true
end

function connection_status()
  local exec = "/usr/bin/ps aux"
  local cond = "| grep vsftpd | grep -v grep | grep -v IDLE"

  local regex1 = "^.-%d+.-%d+.%d+.%d+.%d+:.[a-z]+"
  local match1 = "^.-(%d+).-(%d+.%d+.%d+.%d+):.([a-z]+)"
  local regex2 = "^.-%d+.-%d+.%d+.%d+.%d+/%w+:.%a+.[%w%p]+"
  local match2 = "^.-(%d+).-(%d+.%d+.%d+.%d+)/(%w+):.(%u+).([%w%p]+)"

  if not nixio.fs.access("/usr/bin/ps") then
    exec = "/bin/ps"
  end

  local cmd = io.popen(exec..cond)
  if cmd then
    local conn = { }
    while true do
      local ln = cmd:read("*l")
      if not ln then
        break
      elseif ln:match(regex1) then
        local num,ip,act = ln:match(match1)
        if num and ip and act then
            num   = tonumber(num)
            conn[#conn+1]= {
              num   = num,
              ip    = ip,
              user  = "",
              act   = act:upper(),
              file  = ""
            }
        end
        
      elseif ln:match(regex2) then
        local num,ip,user,act,file = ln:match(match2)
        if num and ip and act then
            num   = tonumber(num)
            conn[#conn+1]= {
              num   = num,
              ip    = ip,
              user  = user,
              act   = act,
              file  = file
            }
        end
      end
    end
  
  cmd:close()
  luci.http.prepare_content("application/json")
  luci.http.write_json(conn)
  end
end
