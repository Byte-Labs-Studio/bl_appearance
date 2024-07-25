-- Example of blacklist
-- glasses = {
--     textures = { [3] = { 2, 3 } },
--     values = { 4, 5, 6 },
-- },
-- This will blacklist the 2,3 texture of the drawable 3
-- Will also blacklist drawable 4,5,6

-- ANYTHING IN BLACKLIST WILL BE LOCKED UNLESS THEY ARE IN ANY OF THE BELOW GROUPS

local BLACKLIST = {
	jobs = {
		["police"] = {
			models = {
				"csb_cop",
				"s_f_y_cop_01",
				"s_m_y_hwaycop_01",
				"s_f_y_sheriff_01",
				"s_m_y_sheriff_01",
				"s_f_y_ranger_01",
				"s_m_y_ranger",
			},
			-- add eveyrthign else you need such as the props etc
		},
		-- add any other jobs in here
	},
	gangs = {
		["example"] = {
			drawables = {
				masks = {
					textures = {
						[194] = { 0 },
					},
					values = {},
				},
			},
			-- add eveyrthign else you need such as the props etc
		},
	},
    groups = {}
}

-- ===========================================================================
-- DONT TOUCH THIS
-- ===========================================================================
local blaclistBase = {
	models = {},
	props = {
		glasses = {
			textures = {},
			values = {},
		},
		earrings = {
			textures = {},
			values = {},
		},
		rhand = {
			textures = {},
			values = {},
		},
		watches = {
			textures = {},
			values = {},
		},
		hats = {
			textures = {},
			values = {},
		},
		lhand = {
			textures = {},
			values = {},
		},
		mouth = {
			textures = {},
			values = {},
		},
		bracelets = {
			textures = {},
			values = {},
		},
	},
	drawables = {
		jackets = {
			textures = {},
			values = {},
		},
		torsos = {
			textures = {},
			values = {},
		},
		bags = {
			textures = {},
			values = {},
		},
		face = {
			textures = {},
			values = {},
		},
		hair = {
			textures = {},
			values = {},
		},
		decals = {
			textures = {},
			values = {},
		},
		neck = {
			textures = {},
			values = {},
		},
		shirts = {
			textures = {},
			values = {},
		},
		legs = {
			textures = {},
			values = {},
		},
		vest = {
			textures = {},
			values = {},
		},
		masks = {
			textures = {},
			values = {},
		},
		shoes = {
			textures = {},
			values = {},
		},
	},
}

exports("blacklist", function()
	return {
        groupTypes = BLACKLIST,
        base = blaclistBase,
    }
end)
