Config = {
    locale = 'en',
    openControl = 'E',
    previousClothing = 'qb', -- 'illenium' | 'qb' | 'esx' | 'fivem-appearance'

    -- https://github.com/Byte-Labs-Project/bl_sprites
    useSprites = true, -- Use bl_sprites for zones or text-ui. If false, ox_lib is needed for zones but will use text-ui defined in Bridge
}

exports('config', function()
    return Config
end)
