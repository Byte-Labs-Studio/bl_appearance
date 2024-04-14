import getAppearance from './appearance'
import getTattoos from './tattoos'
import menuTypes from '../../data/menuTypes';
import { send, receive } from '@enums'
import { sendNUIEvent, delay, requestLocale } from '../utils'
import { startCamera, stopCamera } from './../camera'

const bl_appearance = exports.bl_appearance
export let isMenuOpen = false
export let ped = 0

const updatePed = () => {
    if (!isMenuOpen) return;
    ped = PlayerPedId()
    setTimeout(updatePed, 100);
}

const validMenuTypes = (type: string[]) => {
    for (let i = 0; i < type.length; i++) {
        if (!menuTypes.includes(type[i])) {
            return false;
        }
    }

    return true;
}

export const openMenu = async (type: string[] | string) => {
    isMenuOpen = true
    updatePed()
    await delay(150)
    startCamera()
    sendNUIEvent(send.visible, true)
    SetNuiFocus(true, true)
    const isArray = typeof type !== 'string'

    if (isArray && !validMenuTypes(type)) {
        return console.error('Error: menu type not found');
    }

    sendNUIEvent(send.data, {
        tabs: isArray ? type : menuTypes.includes(type) ? type : menuTypes,
        appearance: getAppearance(GetEntityModel(ped)),
        blacklist: bl_appearance.blacklist(),
        tattoos: getTattoos(),
        outfits: [],
        models: bl_appearance.models(),
        locale: await requestLocale('locale')
    })
}

export const closeMenu = (save: boolean) => {
    console.log(save)
    stopCamera()
    isMenuOpen = false
    SetNuiFocus(false, false)
    sendNUIEvent(send.visible, false)
}

RegisterNuiCallback(receive.close, (save: boolean, cb: Function) => {
    cb(1)
    closeMenu(save)
});