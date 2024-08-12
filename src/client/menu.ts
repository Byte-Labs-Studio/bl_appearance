import { getFrameworkID, requestLocale, sendNUIEvent, triggerServerCallback, updatePed, ped, getPlayerData, getJobInfo, getPlayerGenderModel } from "@utils"
import { startCamera, stopCamera } from "./camera"
import type { TAppearanceZone, TMenuTypes } from "@typings/appearance"
import { Outfit } from "@typings/outfits"
import { Send } from "@events"
import { getAppearance, getTattooData } from "./appearance/getters"
import "./handlers"
import { setModel } from "./appearance/setters"

const config = exports.bl_appearance
let armour = 0
let open = false

let resolvePromise = null;
let promise = null;

export async function openMenu(zone: TAppearanceZone | TAppearanceZone['type'], creation: boolean = false) {
    if (zone === null || open) {
        return;
    }

    let pedHandle = PlayerPedId()
    const configMenus = config.menus()

    const isString = typeof zone === 'string'

    const type = isString ? zone : zone.type

    const menu = configMenus[type]
    if (!menu) return

    updatePed(pedHandle)

    const frameworkdId = getFrameworkID()
    const tabs = menu.tabs
    let allowExit = creation ? false : menu.allowExit

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

    const blacklist = getBlacklist(zone)

    if (creation) {
        const model = GetHashKey(getPlayerGenderModel());
        pedHandle = await setModel(pedHandle, model);
        emitNet('bl_appearance:server:setroutingbucket')
        promise = new Promise(resolve => {
            resolvePromise = resolve;
        });

        updatePed(pedHandle)
    }

    const appearance = await getAppearance(pedHandle)

    startCamera()

    sendNUIEvent(Send.data, {
        tabs,
        appearance,
        blacklist,
        tattoos,
        outfits,
        models,
        allowExit,
        job: getJobInfo(),
        locale: await requestLocale('locale')
    })

    SetNuiFocus(true, true)
    sendNUIEvent(Send.visible, true)

    open = true

    exports.bl_appearance.hideHud(true)

    if (promise) {
        await promise
        emitNet('bl_appearance:server:resetroutingbucket');
    }

    promise = null;
    resolvePromise = null;
    return true
}
exports('OpenMenu', openMenu)

RegisterCommand('appearance', async (_, args: string[]) => {
    const type = args[0]
    if (!type) {
        exports.bl_appearance.InitialCreation()
    } else {
        const zone = type.toLowerCase() as TMenuTypes
        openMenu(zone)
    }
}, true)


function getBlacklist(zone: TAppearanceZone | string) {
    const {groupTypes, base} = config.blacklist()

    if (typeof zone === 'string') return base

    if (!groupTypes) return base

    let blacklist = {...base}

    const playerData = getPlayerData()


    for (const type in groupTypes) {
        const groups = groupTypes[type]
        for (const group in groups) {

            let skip: boolean = false
            
            if (type == 'jobs' && zone.jobs) {
                skip = zone.jobs.includes(playerData.job.name)
            }

            if (type == 'gangs' && zone.gangs) {
                skip = zone.gangs.includes(playerData.gang.name)
            }

            // if (type == 'groups' && zone.groups) {
            //     skip = !zone.groups.includes(playerData.group.name)
            // }

            if (!skip) {
                const groupBlacklist = groups[group]
                blacklist = Object.assign({}, blacklist, groupBlacklist, {
                  drawables: Object.assign({}, blacklist.drawables, groupBlacklist.drawables)
                })
            }
        }
    }

    return blacklist

    // return blacklist
}

export function closeMenu() {
    SetPedArmour(ped, armour)

    stopCamera()
    SetNuiFocus(false, false)
    sendNUIEvent(Send.visible, false)


    exports.bl_appearance.hideHud(false)

    if (resolvePromise) {
        resolvePromise();
    }
    open = false
}
