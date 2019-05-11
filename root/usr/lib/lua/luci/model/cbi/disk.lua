-- Copyright 2008 Steven Barth <steven@midlink.org>
-- Licensed to the public under the Apache License 2.0.

require("luci.tools.webadmin")

local sys = require "luci.sys"
local fs   = require "nixio.fs"
local diskmanager = require "luci.controller.diskmanager"

local devices = diskmanager.getdevices()

-- Use (non-UCI) SimpleForm since we have no related config file
m = SimpleForm("disk", translate("Disk Management"))
-- disable submit and reset button
m.submit = false
m.reset = false

d = m:section(Table, devices, translate("Disks"))
-- option(type, id(key of table), text)
model = d:option(DummyValue, "model", translate("Model"))
path = d:option(DummyValue, "path", translate("Path"))
size = d:option(DummyValue, "size", translate("Size"))
-- edit = d:option(Button, "partition", translate("Edit Partition"))
-- edit.inputstyle = "edit"
-- edit.inputtitle = "Edit"
-- -- overwrite write function to add click event function
-- -- however, this function will be executed after built-in submit function finishes
-- edit.write = function(self, section)
-- 	local url = luci.dispatcher.build_url("admin/system/disk/partition")
-- 	url = url .. "/" .. devices[section].path:match("/dev/(.+)")
-- 	luci.http.redirect(url)
-- end
d.extedit = luci.dispatcher.build_url("admin/system/disk/partition/%s")

local raid_devices = {}
raid_devices = diskmanager.getRAIDdevices()

r = m:section(Table, raid_devices, translate("RAID Devices"))
path = r:option(DummyValue, "path", translate("Path"))
level = r:option(DummyValue, "level", translate("RAID mode"))
size = r:option(DummyValue, "size", translate("Size"))
status = r:option(DummyValue, "status", translate("Status"))
members = r:option(DummyValue, "members_str", translate("Members"))
remove = r:option(Button, "remove", translate("Remove"))
remove.inputstyle = "remove"
remove.write = function(self, section)
	sys.call("/sbin/mdadm --stop "..raid_devices[section].path)
	luci.http.redirect(luci.dispatcher.build_url("admin/system/disk"))
end
-- redit = r:option(Button, "rpartition", translate("Edit Partition"))
-- redit.inputstyle = "edit"
-- redit.inputtitle = "Edit"
-- redit.write = function(self, section)
-- 	local url = luci.dispatcher.build_url("admin/system/disk/partition")
-- 	url = url .. "/" .. raid_devices[section].path:match("/dev/(.+)")
-- 	luci.http.redirect(url)
-- end
r.extedit  = luci.dispatcher.build_url("admin/system/disk/partition/%s")

-- use template to do raid creation
m:section(SimpleSection).template = "raid_creation"

return m

