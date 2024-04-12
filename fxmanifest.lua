fx_version 'cerulean'
use_experimental_fxv2_oal 'yes'
game "gta5"
lua54 'yes'

author "Byte Labs"
version '1.0.0'
description 'Byte Labs Svelte / CFX Lua template.'
repository 'https://github.com/Byte-Labs-Project/bl_svelte_template'


--ui_page 'build/index.html'
ui_page 'http://localhost:3000/' --for dev

server_script 'dist/server/**/*.js'
shared_script 'dist/shared/**/*.js'
client_scripts {
    'wrapper/HeadBlendData.net.dll',
    'dist/client/**/*.js'
}

files {
    'build/**',
}
