import getAppearance from './appearance/appearance'
import PEDS from '@data/peds';
import menuTypes from '@data/menuTypes';
import { send } from '@enums'
import { sendNUIEvent } from '@utils'

export let isMenuOpen = false
export let ped = 0

const updatePed = () => {
    if (!isMenuOpen) return;
    ped = PlayerPedId()
    setTimeout(updatePed, 100);
}

export const openMenu = (type: string) => {
    isMenuOpen = true
    updatePed()
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
    })
}

export const closeMenu = (save: boolean) => {
    isMenuOpen = false
    SetNuiFocus(false, false)
    sendNUIEvent(send.visible, false)
}