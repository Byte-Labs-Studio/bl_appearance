import getAppearance from './appearance'
import PEDS from '../../data/peds';
import menuTypes from '../../data/menuTypes';
import { send, receive } from '@enums'
import { sendNUIEvent, delay, requestLocale } from '../utils'
import { startCamera, stopCamera } from './../camera'

export let isMenuOpen = false
export let ped = 0

const updatePed = () => {
    if (!isMenuOpen) return;
    ped = PlayerPedId()
    setTimeout(updatePed, 100);
}

export const openMenu = async (type: string) => {
    isMenuOpen = true
    updatePed()
    await delay(150)
    startCamera()
    sendNUIEvent(send.visible, true)
    SetNuiFocus(true, true)
    const all = type === 'all'

    if (!all && !menuTypes.includes(type)) {
        return console.error('Error: menu type not found');
    }

    sendNUIEvent(send.data, {
        tabs: all ? menuTypes : [type],
        appearance: getAppearance(GetEntityModel(ped)),
        blacklist: [],
        tattoos: [],
        outfits: [],
        models: PEDS,
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