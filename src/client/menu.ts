import { getFrameworkID, sendNUIEvent, triggerServerCallback } from "@utils"
import { startCamera, stopCamera } from "./camera"
import type { TMenuTypes } from "@typings/appearance"
import { Outfit } from "@typings/outfits"
import { Send } from "@events"
import { getAppearance } from "./appearance/getters"

const config = exports.bl_appearance

let isOpen = false
let armour = 0


export async function openMenu(type: TMenuTypes, creation: boolean = false) {
    const ped = PlayerPedId()

    startCamera(ped)

    const configMenus = config.menus()

    const menu = configMenus[type]

    if (!menu) return

    const frameworkdId = getFrameworkID()

    const tabs = menu.tabs

    let allowExit = menu.allowExit

    armour = GetPedArmour(ped)

    let outfits = []

    const hasOutfitTab = tabs.includes('outfits')
    if (hasOutfitTab) {
        outfits = await triggerServerCallback<Outfit[]>('bl_appearance:server:getOutfits', frameworkdId) as Outfit[] 
    }

    let models = []

    const hasHeritageTab = tabs.includes('heritage')
    if (hasHeritageTab) {
        models = config.models()
    }

    const hasTattooTab = tabs.includes('tattoos')
    let tattoos = []
    if (hasTattooTab) {
        tattoos = config.tattoos()
    }

    const blacklist = getBlacklist(type)

    const appearance = await getAppearance(ped)

    if (creation) {
        allowExit = false
    }

    sendNUIEvent( Send.data, {
        tabs,
        appearance,
        blacklist,
        tattoos,
        outfits,
        models,
        allowExit
    })

    SetNuiFocus(true, true)
    sendNUIEvent(Send.visible, true)
}

function getBlacklist(type: TMenuTypes) {
    const blacklist = config.blacklist()

    return []
}

export function closeMenu(save: boolean) {
    const ped = PlayerPedId()

    SetPedArmour(ped, armour)

    stopCamera()
    SetNuiFocus(false, false)
    sendNUIEvent(Send.visible, false)
}