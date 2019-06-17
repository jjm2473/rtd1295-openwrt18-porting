-- Copyright 2008 Steven Barth <steven@midlink.org>
-- Copyright 2008-2011 Jo-Philipp Wich <jow@openwrt.org>
-- Licensed to the public under the Apache License 2.0.

module("luci.controller.diskmanager", package.seeall)

local AVAILABLE_FMTS = {
	ext2 = { path = "/usr/sbin/mkfs.ext2", option = "-F -E lazy_itable_init=1" },
	ext3 = { path = "/usr/sbin/mkfs.ext3", option = "-F -E lazy_itable_init=1" },
	ext4 = { path = "/usr/sbin/mkfs.ext4", option = "-F -E lazy_itable_init=1" },
	fat32 = { path = "/usr/sbin/mkfs.fat", option = "-F 32 -I" },
	exfat = { path = "/usr/local/sbin/mkexfat", option = "-f" },
	hfsplus = { path = "/usr/local/sbin/mkhfs", option = "-f" },
	ntfs = { path = "/usr/local/sbin/mkntfs", option = "-f" },
	swap = { path = "/usr/sbin/mkswap", option = "-f" }
}

function index()
	local fs = require "nixio.fs"

	-- check all used executables in disk management are existed
	local disk_management_executables = {
		"/usr/sbin/parted", "/sbin/mdadm",
		"/usr/bin/mount", "/usr/sbin/swapon", "/usr/sbin/blkid",
		"/usr/sbin/mkfs.ext4", "/usr/sbin/mkswap"
	}

	local executables_all_existed = true
	for k, v in pairs(disk_management_executables) do
		if not fs.access(v) then
			executables_all_existed = false
			break
		end
	end

	if executables_all_existed then
		-- entry(path, target, title, order)
		-- set leaf attr to true to pass argument throughe url (e.g. admin/system/disk/partition/sda)
		entry({"admin", "system", "disk"}, form("disk"), _("Disk Management"), 55)
		entry({"admin", "system", "disk", "partition"}, template("partition"), nil).leaf = true
		entry({"admin", "system", "disk", "addpartition"}, call("action_addpartition"), nil).leaf = true
		entry({"admin", "system", "disk", "removepartition"}, call("action_removepartition"), nil).leaf = true
		entry({"admin", "system", "disk", "formatpartition"}, call("action_formatpartition"), nil).leaf = true
		entry({"admin", "system", "disk", "createraid"}, call("action_createraid"), nil).leaf = true
		entry({"admin", "system", "disk", "createpartitiontable"}, call("action_createpartitiontable"), nil).leaf = true
	end
end

function isUsed(path)
	local bname = path:gsub("/dev/", "")

    -- check if mounted
    mount = io.popen("/usr/bin/mount | grep " .. path, "r")
    result = mount:read("*all")
    mount:close()
    if result ~= "" then return true end

    -- check if used as swap
    swap = io.popen("/usr/sbin/swapon -s | grep " .. path, "r")
    result = swap:read("*all")
    swap:close()
    if result ~= "" then return true end

    -- check if used as raid partition
    mdstat = io.popen("grep md /proc/mdstat | cut -d ':' -f 2 | grep " .. bname)
    result = mdstat:read("*all")
    mdstat:close()
    if result ~= "" then return true end

    return false
end

function isAndroidExist()
	local sys = require "luci.sys"
	local mountpoints = sys.mounts()

	for i, mp in pairs(mountpoints) do
		if mp["fs"] == "tmpfs" and mp["mountpoint"] == "/rom/android" then
			return true
		end
	end
	return false
end

-- Check if it contains nas partition (LABEL=nasetc)
function isSystemMMC(device)

	if not device:match("/dev/mmcblk%S+") then return false end

	local ls = io.popen("ls "..device.."p*", "r")
	for partition in ls:lines() do
		local blkid = io.popen("/usr/sbin/blkid -s LABEL -o value "..partition, "r")
		local label = blkid:read("*all"):gsub("([^\n+])\n", "%1")
		blkid:close()
		if label == "nasetc" then
			ls:close()
			return true
		end
	end
	ls:close()
	return false
end

function mddetail(mdpath)
	local detail = {}
	local path = mdpath:match("^/dev/md%d+$")
	if path then
		local mdadm = io.popen("/sbin/mdadm --detail "..path, "r")
		for line in mdadm:lines() do
			local key, value = line:match("^%s*(.+) : (.+)")
			if key then
				detail[key] = value
			end
		end
		mdadm:close()
	end
	return detail
end

-- Collect Devices information
function getdevices()
	local fs = require "nixio.fs"

	-- get all device names (sdX and mmcblkX)
	local target_devnames = {}
	local ls = io.popen("ls /dev/sd[a-z]", "r")
	for device in ls:lines() do table.insert(target_devnames, device) end
	ls:close()
	ls = io.popen("ls /dev/sata[a-z]", "r")
	for device in ls:lines() do table.insert(target_devnames, device) end
	ls:close()
	ls = io.popen("ls /dev/mmcblk*", "r")
	for device in ls:lines() do
		if device:match("/dev/mmcblk%d+$") then table.insert(target_devnames, device) end
	end
	ls:close()

	local devices = {}
	for i, device in pairs(target_devnames) do

		local device_info = {}
		local bname = device:match("^/dev/(%S+)")

		local size = tonumber(fs.readfile(string.format("/sys/class/block/%s/size", bname)))
		local ss = tonumber(fs.readfile(string.format("/sys/class/block/%s/queue/logical_block_size", bname)))
		local model = fs.readfile(string.format("/sys/class/block/%s/device/model", bname))

		if not isSystemMMC(device) and size > 0 then
			device_info["path"] = device
			device_info["size"] = luci.tools.webadmin.byte_format(size*ss)
			device_info["model"] = model

			local udevinfo = {}
			if fs.access('/sbin/udevadm') then
				local udevadm = io.popen("/sbin/udevadm info --query=property --name="..device)
				for attr in udevadm:lines() do
					local k, v = attr:match("(%S+)=(%S+)")
					udevinfo[k] = v
				end
				udevadm:close()

				device_info["info"] = udevinfo
				if udevinfo["ID_MODEL"] then device_info["model"] = udevinfo["ID_MODEL"] end
			end
			devices[bname] = device_info
		end
	end
	return devices
end

-- Collect RAID devices information
function getRAIDdevices()
	local fs = require "nixio.fs"

	local raid_devices = {}
	local mdstat = io.open("/proc/mdstat", "r")
	for line in mdstat:lines() do

		-- md1 : active raid1 sdb2[1] sda2[0]
		-- md127 : active raid5 sdh1[6] sdg1[4] sdf1[3] sde1[2] sdd1[1] sdc1[0]
		local device_info = {}
		local mdpath, list = line:match("^(md%d+) : (.+)")
		if mdpath then
			local members = {}
			for member in string.gmatch(list, "%S+") do
				member_path = member:match("^(%S+)%[%d+%]")
				if member_path then
					member = '/dev/'..member_path
				end
				table.insert(members, member)
			end
			local active = table.remove(members, 1)
			local level = "-"
			if active == "active" then
				level = table.remove(members, 1)
			end

			local size = tonumber(fs.readfile(string.format("/sys/class/block/%s/size", mdpath)))
			local ss = tonumber(fs.readfile(string.format("/sys/class/block/%s/queue/logical_block_size", mdpath)))

			device_info["path"] = "/dev/"..mdpath
			device_info["size"] = luci.tools.webadmin.byte_format(size*ss)
			device_info["active"] = active
			device_info["level"] = level
			device_info["members"] = members
			device_info["members_str"] = table.concat(members, ", ")

			-- Get more info from output of mdadm --detail
			local detail = mddetail(device_info["path"])
			device_info["status"] = detail["State"]

			raid_devices[mdpath] = device_info
		end
	end
	mdstat:close()

	return raid_devices
end

function getDevicePartitionInfo(device)
	local fs = require "nixio.fs"

	local device_info = {}
	local partitions_info = {}

	local device_info_keys = { "Path", "Length", "Type", "LogicSectorSize", "PhysicalSectorSize",
								"Partition Table", "Model", "Flags" }
	local partition_info_keys = { "Number", "Start", "End", "Size", "File system", "Type", "Flags" }

	local bname = device:gsub("/dev/", "")
	local ss = tonumber(fs.readfile("/sys/class/block/"..bname.."/queue/logical_block_size"))

	local function parse(keys, line)
		-- parse the output of parted command (machine parseable format)
		-- /dev/sda:5860533168s:scsi:512:4096:gpt:ATA ST3000DM001-1ER1:;
		-- 1:34s:2047s:2014s:free;
		-- 1:2048s:1073743872s:1073741825s:ext4:primary:;
		local result = {}
		local values = {}

		for value in line:gmatch("(.-)[:;]") do table.insert(values, value) end
		for i = 1,#keys do
			if values[i] == nil then result[keys[i]] = "" else result[keys[i]] = values[i] end
		end
		return result
	end

	-- use -m: displays machine parseable output
	local parted = io.popen("/usr/sbin/parted -s -m "..device.." unit s print free", "r")

	-- first line indicates the unit, which is trivial because
    -- the unit is overwritten by units s in command
	parted:read("*line")

	local device_info_line = parted:read("*line")
	device_info = parse(device_info_keys, device_info_line)

	for line in parted:lines() do
		local part_info = {}
		part_info = parse(partition_info_keys, line)

		-- use human-readable form instead of sector number
		if part_info["Size"] ~= "" then
			local length = part_info["Size"]:gsub("^(%d+)s$", "%1")
			local newsize = luci.tools.webadmin.byte_format(tonumber(length)*ss)
			part_info["Size"] = newsize
		end
		if part_info["File system"] == "free" then
			part_info["Number"] = ""
			part_info["File system"] = "Free Space"
			part_info["Name"] = ""
		elseif device:match("sd") or device:match("sata") then
			part_info["Name"] = device..part_info["Number"]
		elseif device:match("mmcblk") or device:match("md") then
			part_info["Name"] = device.."p"..part_info["Number"]
		end

		-- get filesystem by blkid
		if part_info["Number"] ~= "" then
			local concat = ""
			if device:match("/dev/mmcblk%S+") or device:match("/dev/md%S+") then concat = "p" end

			local part_name = device..concat..part_info["Number"]
			local blkid = io.popen("/usr/sbin/blkid -s TYPE -o value "..part_name, "r")
			local fstype = blkid:read("*all"):gsub("([^\n+])\n", "%1")
			if fstyle ~= "" then part_info["File system"] = fstype end
			blkid:close()
		end

		table.insert(partitions_info, part_info)
	end

	parted:close()

	return device_info, partitions_info
end

function listAvailableFormats()
	local fs = require "nixio.fs"

	result = {}
	for fmt, obj in pairs(AVAILABLE_FMTS) do
		if fs.access(obj["path"]) then
			table.insert(result, fmt)
		end
	end
	return result
end

function action_addpartition()
	local target = luci.http.formvalue("target")
	local pstart = luci.http.formvalue("start")
	local pend = luci.http.formvalue("end")

	local command = "/usr/sbin/parted -s "..target.." mkpart primary "..pstart.." "..pend
	luci.sys.call(command)

	luci.http.prepare_content("application/json")
	luci.http.write_json({target=target, pstart=pstart, pend=pend})
end

function action_removepartition()
	local target = luci.http.formvalue("target")
	local number = luci.http.formvalue("number")

	local fs = require "nixio.fs"
	local bname = fs.basename(target)
	local command = "/usr/bin/disk-helper.sh umount "..bname.." &> /dev/null"
	luci.sys.call(command)

	-- erase 10Mbytes from the start of the partition before removing it
	local concat = ""
	if target:match("/dev/mmcblk%S+") or target:match("/dev/md%S+") then concat = "p" end
	local pname = target..concat..number
	local command = "/usr/bin/dd if=/dev/zero of="..pname

	-- check partition length is larger than 10M or not
	-- major minor  #blocks  name
	--   8       17   15420416 sdb1
	local bname = pname:gsub("/dev/", "")
	local grep = io.popen("grep '"..bname.."$' /proc/partitions | awk '{print $3}'")
	local size_kb = grep:read("*number")
	grep:close()

	if size_kb ~= nil and size_kb < 10240 then
		command = command.." bs=1K count="..size_kb
	else
		command = command.." bs=1M count=10"
	end
	luci.sys.call(command)

	command = "/usr/sbin/parted -s "..target.." rm "..number
	luci.sys.call(command)

	luci.http.prepare_content("application/json")
	luci.http.write_json({target=target, number=number})
end

function action_formatpartition()
	local fs = require "nixio.fs"
	local target = luci.http.formvalue("target")
	local fstype = luci.http.formvalue("fs")
	local bname = fs.basename(target)

	-- command in luci.sys.call should not output anything to stdout/stderr
	-- which might affect the http response content
	local retcode = 0
	local command = "/usr/bin/disk-helper.sh umount "..bname.." &> /dev/null"
	luci.sys.call(command)
	command = "/usr/bin/disk-helper.sh format "..bname.." "..fstype.. " &> /dev/null"
	retcode = luci.sys.call(command)

	luci.http.prepare_content("application/json")
	luci.http.write_json({target=target, fstype=fstype, retcode=tostring(retcode)})
end

function action_createraid()
	local level = luci.http.formvalue("level")
	local members_str = luci.http.formvalue("members")
	local members = {}
	for member in string.gmatch(members_str, "([^,]+)") do
		table.insert(members, member)
	end
	local error_msg = nil

	local mdnum = 0
	for num=1,127 do
		local md = io.open("/dev/md"..tostring(num), "r")
		if md == nil then
			mdnum = num
			break
		else
			io.close(md)
		end
	end
	if mdnum == 0 then
		error_msg = "Cannot find proper md number"
	end

	local command = "/sbin/mdadm --create /dev/md"..tostring(mdnum).." --run --assume-clean --homehost=RTKNAS"
	command = command.." --level="..level.." --raid-devices="..tostring(#members)
	command = command.." "..table.concat(members, " ")

	if not error_msg then
		luci.sys.call(command)
	end

	luci.http.prepare_content("application/json")
	luci.http.write_json({num=mdnum, command=command, error_msg=error_msg})
end

function action_createpartitiontable()
	local target = luci.http.formvalue("target")
	local tabletype = luci.http.formvalue("type")

	command = "/usr/sbin/parted -s "..target.." mktable "..tabletype
	luci.sys.call(command)

	luci.http.prepare_content("application/json")
	luci.http.write_json({target=target, type=tabletype})
end
