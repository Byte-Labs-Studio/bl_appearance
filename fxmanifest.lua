fx_version 'cerulean'
use_experimental_fxv2_oal 'yes'
game "gta5"
lua54 'yes'

author "Byte Labs"
version '1.1.5'
description 'Customize your virtual persona with precision using the Byte Labs Appearance Menu'
repository 'https://github.com/Byte-Labs-Studio/bl_appearance'

ui_page 'build/index.html'
-- ui_page 'http://localhost:3000/' --for dev

server_scripts {
    'data/config.lua',
    'data/commands.lua',
    'dist/server/**/*.js'
}

shared_scripts {
    '@ox_lib/init.lua',
    'dist/shared/**/*.js',
}

client_scripts {
    'data/blacklist.lua',
    'data/config.lua',
    'data/menus.lua',
    'data/models.lua',
    'data/tattoos.lua',
    'data/zones.lua',
    'dist/client/**/*.js'}

files {
    'build/**',
}

file_set 'locale' {
    'locale/*'
}

dependencies {
    'bl_bridge',
    'bl_sprites'
}
