-- Copyright 2012 Gabor Juhos <juhosg@openwrt.org>
-- Licensed to the public under the Apache License 2.0.
require("nixio.fs")
local m, s, o
m = Map("forked-daapd", "iTunes Server",
	translate("iTunes (DAAP) server for Apple Remote and AirPlay."))

s = m:section(TypedSection, "forked-daapd", translate("Settings"))
s.anonymous = true

o = s:option(Flag, "enabled", translate("Enable"))
o.rmempty = false

function o.cfgvalue(self, section)
	return luci.sys.init.enabled("forked-daapd") and self.enabled or self.disabled
end

function o.write(self, section, value)
	if value == "1" then
		luci.sys.init.enable("forked-daapd")
		luci.sys.call("/etc/init.d/forked-daapd restart >/dev/null")
	else
		luci.sys.call("/etc/init.d/forked-daapd stop >/dev/null")
		luci.sys.init.disable("forked-daapd")
	end
	return Flag.write(self, section, value)
end

servername = s:option(Value, "name", translate("Server Name"))
servername.rmempty = true
function servername.cfgvalue(self, section)
	local name = Value.cfgvalue(self, section)
	if name == nil then
	  for Line in io.lines("/etc/forked-daapd.conf") do
	    if Line:find("name") and not Line:find("#") and not Line:find("nickname")  then
	  	  start,p_end = string.find(Line, "\"")
	  	  name = string.sub(Line,start+1,string.len(Line)-1)
	    end
	  end
	  if name == "" then
	  	local f = io.popen("/usr/bin/hostname")
	  	local hostname = f:read("*a") or ""
	  	f:close()
	  	hostname = string.gsub(hostname, "\n$", "")
	  	name = hostname.." - iTunes/DAAP"
	  end
	end
	return name
end
function servername.write(self, section, value)
	return Flag.write(self, section, value)
end


path = s:option(Value, "path", translate("Media Folder"))
path.rmempty = true
function path.cfgvalue(self, section)
	local path = Value.cfgvalue(self, section)
	if path == nil then 
	  for Line in io.lines("/etc/forked-daapd.conf") do
	    if Line:find("directories") and Line:find("\"") and not Line:find("#")  then
	  	  start,p_end = string.find(Line, "/")
	      if Line:find("{") then
	        path=string.sub(Line,start,string.len(Line)-3)
	      else	      
	        path=string.sub(Line,start,string.len(Line)-1)
	      end
	    end
	  end
	end
	return path
end
function path.write(self, section, value)
	return Flag.write(self, section, value)
end

db_path = s:option(Value, "db_path", translate("Database Path"))
db_path.rmempty = true
function db_path.cfgvalue(self, section)
	local db_path = Value.cfgvalue(self, section)
	if db_path == nil then 
	  for Line in io.lines("/etc/forked-daapd.conf") do
	    if Line:find("db_path") and Line:find("\"") and not Line:find("#")  then
	  	  start,p_end = string.find(Line, "/")
	        db_path=string.sub(Line,start,string.len(Line)-1)
	    end
	  end
	end
	return db_path
end

function db_path.write(self, section, value)
	return Flag.write(self, section, value)
end

function m.on_commit(self,map)
	require("luci.sys").call('/sbin/reload_config')
end

return m
