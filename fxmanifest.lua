fx_version 'cerulean'
use_experimental_fxv2_oal 'yes'
game "gta5"
lua54 'yes'

author "Byte Labs"
version '1.0.0'
description 'Customize your virtual persona with precision using the Byte Labs Appearance Menu'
repository 'https://github.com/Byte-Labs-Studio/bl_appearance'

-- ui_page 'build/index.html'
ui_page 'http://localhost:3001/' --for dev

server_script 'dist/server/**/*.js'

shared_script {
    '@ox_lib/init.lua',
    'dist/shared/**/*.js',
}

client_script {
    'data/*',
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