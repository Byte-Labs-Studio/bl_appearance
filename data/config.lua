Config = {
    locale = 'en',
    openControl = 'E',
    previousClothing = 'qb', -- 'illenium' | 'qb' | 'esx' | 'fivem-appearance'
}

exports('config', function()
    return Config
end)

---@param state boolean If true, hides the HUD. If false, shows the HUD.
exports('hideHud', function(state)
    -- Implement your code here
end)
