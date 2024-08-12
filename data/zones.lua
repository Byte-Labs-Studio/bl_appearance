--https://github.com/iLLeniumStudios/illenium-appearance/blob/main/shared/config.lua

local stores = {
    {
        type = 'appearance',
        coords = vector4(455.56, -990.74, 30.69, 84.66),
        jobs = {'police'}
    },
    {
        type = 'clothing',
        coords = vector4(1693.2, 4828.11, 42.07, 188.66),
    },
    {
        type = 'clothing',
        coords = vector4(-705.5, -149.22, 37.42, 122),
    },
    {
        type = 'clothing',
        coords = vector4(-1192.61, -768.4, 17.32, 216.6),
    },
    {
        type = 'clothing',
        coords = vector4(425.91, -801.03, 29.49, 177.79),
    },
    {
        type = 'clothing',
        coords = vector4(-168.73, -301.41, 39.73, 238.67),
    },
    {
        type = 'clothing',
        coords = vector4(75.39, -1398.28, 29.38, 6.73),
    },
    {
        type = 'clothing',
        coords = vector4(-827.39, -1075.93, 11.33, 294.31),
    },
    {
        type = 'clothing',
        coords = vector4(-1445.86, -240.78, 49.82, 36.17),
    },
    {
        type = 'clothing',
        coords = vector4(9.22, 6515.74, 31.88, 131.27),
    },
    {
        type = 'clothing',
        coords = vector4(615.35, 2762.72, 42.09, 170.51),
    },
    {
        type = 'clothing',
        coords = vector4(1191.61, 2710.91, 38.22, 269.96),
    },
    {
        type = 'clothing',
        coords = vector4(-3171.32, 1043.56, 20.86, 334.3),
    },
    {
        type = 'clothing',
        coords = vector4(-1105.52, 2707.79, 19.11, 317.19),
    },
    {
        type = 'clothing',
        coords = vector4(-1119.24, -1440.6, 5.23, 300.5),
    },
    {
        type = 'clothing',
        coords = vector4(124.82, -224.36, 54.56, 335.41),
    },
    {
        type = 'barber',
        coords = vector4(-814.22, -183.7, 37.57, 116.91),
    },
    {
        type = 'barber',
        coords = vector4(136.78, -1708.4, 29.29, 144.19),
    },
    {
        type = 'barber',
        coords = vector4(-1282.57, -1116.84, 6.99, 89.25),
    },
    {
        type = 'barber',
        coords = vector4(1931.41, 3729.73, 32.84, 212.08),
    },
    {
        type = 'barber',
        coords = vector4(1212.8, -472.9, 65.2, 60.94),
    },
    {
        type = 'barber',
        coords = vector4(-32.9, -152.3, 56.1, 335.22),
    },
    {
        type = 'barber',
        coords = vector4(-278.1, 6228.5, 30.7, 49.32),
    },
    {
        type = 'tattoos',
        coords = vector4(1322.6, -1651.9, 51.2, 42.47),
    },
    {
        type = 'tattoos',
        coords = vector4(-1154.01, -1425.31, 4.95, 23.21),
    },
    {
        type = 'tattoos',
        coords = vector4(322.62, 180.34, 103.59, 156.2),
    },
    {
        type = 'tattoos',
        coords = vector4(-3169.52, 1074.86, 20.83, 253.29),

    },
    {
        type = 'tattoos',
        coords = vector4(1864.1, 3747.91, 33.03, 17.23),

    },
    {
        type = 'tattoos',
        coords = vector4(-294.24, 6200.12, 31.49, 195.72),
    },
    {
        type = 'surgeon',
        coords = vector4(298.78, -572.81, 43.26, 114.27),
    }
}

local currentZone = nil
local key = Config.openControl
local sprites = {}

local function setupZones()
    if GetResourceState('bl_sprites') == 'missing' then return end
    for _, v in pairs(stores) do
        sprites[#sprites+1] = exports.bl_sprites:sprite({
            coords = v.coords,
            shape = 'hex',
            key = key,
            distance = 3.0,
            onEnter = function()
                currentZone = v
            end,
            onExit = function()
                currentZone = nil
            end
        })
    end
end


setupZones()

local blips = {}
local function createBlips()
    for _, v in ipairs(stores) do
        if v.type ~= 'appearance' then
            local blip = AddBlipForCoord(v.coords.x, v.coords.y, v.coords.z)
            local spriteId, blipColor, blipname
            if v.type == 'barber' then
                spriteId = 71
                blipColor = 0
                blipname = 'Barber'
            elseif v.type == 'clothing' then
                spriteId = 73
                blipColor = 0
                blipname = 'Clothing Store'
            elseif v.type == 'tattoos' then
                spriteId = 75
                blipColor = 4
                blipname = 'Tattoo Parlor'
            elseif v.type == 'surgeon' then
                spriteId = 102
                blipColor = 4
                blipname = 'Surgeon'
            end
            SetBlipSprite(blip, spriteId)
            SetBlipColour(blip, blipColor)
            SetBlipAsShortRange(blip, true)
            SetBlipScale(blip, 0.6)
            BeginTextCommandSetBlipName('STRING')
            AddTextComponentString(blipname)
            EndTextCommandSetBlipName(blip)
            blips[#blips+1] = blip
        end
    end
end

createBlips()

AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() then
         for _, blip in pairs(blips) do
             RemoveBlip(blip)
         end

         for _, sprite in pairs(sprites) do
             sprite:removeSprite()
         end
    end
 end)
 

RegisterCommand('+openAppearance', function()
    if not currentZone then return end
    TriggerEvent('bl_appearance:client:useZone', currentZone.type)
end, false)

RegisterKeyMapping('+openAppearance', 'Open Appearance', 'keyboard', key)