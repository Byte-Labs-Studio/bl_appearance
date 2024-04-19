local config = {
    locale = 'en',

    -- IF this is true, it will intercept illenium and qb clothing exports to use bl_appearance
    -- This means it is basically backwards compatible with illenium and qb clothing
    -- This is only 'qb-clothing:client:loadPlayerClothing' event for qb clothing
    -- and setPedAppearance for illenium
    -- BUT they both have to be passed in the clothing data in the same format as bl_appearance
    backwardsCompatibility = true,
    previousClothing = 'illenium', -- 'illenium' or 'qb'
}


exports('config', function()
    return config
end)
