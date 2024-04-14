local blacklist = {
    models = {
        'a_f_m_beach_01',
    },
    props = {
        glasses = {
            textures = { [3] = { 2, 3 } },
            values = { 4, 5, 6 },
        },
        -- earrings = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- rhand = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- watches = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- hats = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- lhand = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- mouth = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- bracelets = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
    },
    drawables = {
        jackets = {
            textures = { [3] = { 2, 3 } },
            values = { 5, 6 },
        },
        -- torsos = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- bags = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- face = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- hair = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- decals = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- neck = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- shirts = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- legs = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- vest = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- masks = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
        -- shoes = {
        --     textures = { [3] = {2, 3} },
        --     values = {4, 5, 6},
        -- },
    },
}

exports('blacklist', function()
    return blacklist
end)
