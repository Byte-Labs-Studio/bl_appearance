import { getFrameworkID, requestLocale, sendNUIEvent, triggerServerCallback, updatePed, delay, ped } from "@utils"
import { startCamera, stopCamera } from "./camera"
import type { TMenuTypes } from "@typings/appearance"
import { Outfit } from "@typings/outfits"
import { Send } from "@events"
import { getAppearance, getTattooData } from "./appearance/getters"
import "./handlers"

const config = exports.bl_appearance
let armour = 0

export async function openMenu(type: TMenuTypes, creation: boolean = false) {
    const pedHandle = PlayerPedId()
    const configMenus = config.menus()

    const menu = configMenus[type]
    if (!menu) return

    updatePed(pedHandle)
    startCamera()

    const frameworkdId = getFrameworkID()
    const tabs = menu.tabs
    let allowExit = menu.allowExit

    armour = GetPedArmour(pedHandle)

    let outfits = []

    const hasOutfitTab = tabs.includes('outfits')
    if (hasOutfitTab) outfits = await triggerServerCallback<Outfit[]>('bl_appearance:server:getOutfits', frameworkdId) as Outfit[]

    let models = []

    const hasHeritageTab = tabs.includes('heritage')
    if (hasHeritageTab) {
        models = config.models()
    }

    const hasTattooTab = tabs.includes('tattoos')
    let tattoos
    if (hasTattooTab) {
        tattoos = getTattooData()
    }

    const blacklist = getBlacklist(type)

    const appearance = await getAppearance(pedHandle)

    if (creation) {
        allowExit = false
    }

    sendNUIEvent(Send.data, {
        tabs,
        appearance,
        blacklist,
        tattoos,
        outfits,
        models,
        allowExit,
        locale: await requestLocale('locale')
    })
    SetNuiFocus(true, true)
    sendNUIEvent(Send.visible, true)
}

function getBlacklist(type: TMenuTypes) {
    const blacklist = config.blacklist()

    return blacklist
}

export function closeMenu() {
    SetPedArmour(ped, armour)

    stopCamera()
    SetNuiFocus(false, false)
    sendNUIEvent(Send.visible, false)
}