local menus = {
	appearance = {
		tabs = { "heritage", "hair", "clothes", "accessories", "face", "makeup", "outfits", "tattoos" },
		allowExit = false,
	},

	clothing = {
		tabs = { "clothes", "accessories"},
		allowExit = true,
	},

	barber = {
		tabs =  { "heritage", "hair", "face", "makeup" },
		allowExit = true,
	},

	tattoos = {
		tabs = {"tattoos"},
		allowExit = true,
	},

	outfits = {
		tabs = { "outfits" },
		allowExit = true,
	},
}

exports("menus", function()
	return menus
end)
