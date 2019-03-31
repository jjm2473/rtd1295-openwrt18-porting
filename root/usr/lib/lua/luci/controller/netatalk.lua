-- Copyright 2012 Gabor Juhos <juhosg@openwrt.org>
-- Licensed to the public under the Apache License 2.0.

module("luci.controller.netatalk", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/afpd") then
		return
	end

	local page

	page = entry({"admin", "services", "netatalk"}, cbi("netatalk"), _("TimeMachine"))
	page.dependent = true
end
