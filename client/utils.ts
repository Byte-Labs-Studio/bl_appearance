import {send} from './enums'

export let ped = 0
export let isMenuOpen = false
export const menuTypes = ['heritage', 'hair', 'clothes', 'accessories', 'face', 'makeup', 'outfits', 'tattoos']

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
    sendNUIEvent(send.data, {
      tabs: all ? menuTypes : [type]
    })

    const tickFunction = setTick(async () => {
        while (isMenuOpen) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            ped = PlayerPedId();
        }

        clearTick(tickFunction);
    });
}