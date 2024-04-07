import { send } from '@enums'
import getAppearance from './menu/appearance/appearance'
import PEDS from '@data/peds';

export let ped = 0
export let isMenuOpen = false
export const menuTypes = ['heritage', 'hair', 'clothes', 'accessories', 'face', 'makeup', 'outfits', 'tattoos']

export function debugdata(data: any) {
    console.log(JSON.stringify(data, (key, value) => {
        if (typeof value === "string") {
            return value.replace(/\n/g, "\\n");
        }
        return value;
    }, 2))
}

export function sendNUIEvent(action: string, data: any) {
    SendNUIMessage({
        action: action,
        data: data
    });
}

export function closeMenu(save: boolean) {
    isMenuOpen = false
    SetNuiFocus(false, false)
    sendNUIEvent(send.visible, false)
}

export function openMenu(type: string) {
    isMenuOpen = true
    sendNUIEvent(send.visible, true)
    SetNuiFocus(true, true)
    const all = type === 'all'

    if (!all && !menuTypes.includes(type)) {
        return console.error('Error: menu type not found');
    }

    debugdata(getAppearance())

    sendNUIEvent(send.data, {
        tabs: all ? menuTypes : [type],
        appearance: getAppearance(),
        blacklist: [],
        tattoos: [],
        outfits: [],
        models: PEDS,
    })

}