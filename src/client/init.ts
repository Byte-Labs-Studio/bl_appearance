import { TAppearance, TAppearanceZone } from "@typings/appearance"
import { openMenu } from "./menu"
import { setPedAppearance, setPlayerPedAppearance } from "./appearance/setters"
import { triggerServerCallback, getFrameworkID, Delay, bl_bridge, ped, delay, format } from "@utils"
import { QBBridge } from "./bridge/qb"
import { ESXBridge } from "./bridge/esx"
import { illeniumCompat } from "./compat/illenium"

RegisterCommand('openMenu', async () => {
    exports.bl_appearance.InitialCreation()
}, false)

exports('SetPedAppearance', async (ped: number, appearance: TAppearance) => {
    await setPedAppearance(ped, appearance)
})

exports('SetPlayerPedAppearance', async (frameworkID) => {
    const appearance = await triggerServerCallback<TAppearance>('bl_appearance:server:getAppearance', frameworkID)
    if (!appearance) {
        throw new Error('No appearance found')
    }
    await setPlayerPedAppearance(appearance)
})

exports('GetPlayerPedAppearance', async (frameworkID) => {
    return await triggerServerCallback<TAppearance>('bl_appearance:server:getAppearance', frameworkID)
})

exports('InitialCreation', async (cb?: Function) => {
    await openMenu({ type: "appearance", coords: [0, 0, 0, 0] }, true)
    if (cb) cb()
})

on('bl_sprites:client:useZone', (zone: TAppearanceZone) => {
    openMenu(zone)
})

onNet('bl_bridge:client:playerLoaded', async () => {
    while (!bl_bridge.core().playerLoaded()) {
        await Delay(100);
    }
    const frameworkID = await getFrameworkID()
    const appearance = await triggerServerCallback<TAppearance>('bl_appearance:server:getAppearance', frameworkID)
    if (!appearance) return;
    await setPlayerPedAppearance(appearance)
})

onNet('onResourceStart', async (resource: string) => {
    if (resource === GetCurrentResourceName() && bl_bridge.core().playerLoaded()) {
        const frameworkID = await getFrameworkID()
        const appearance = await triggerServerCallback<TAppearance>('bl_appearance:server:getAppearance', frameworkID)
        if (!appearance) return;
        await setPlayerPedAppearance(appearance)
    }
})

const frameworkName = bl_bridge.getFramework('core')
const core = format(GetConvar('bl:framework', 'qb'))

if (core == 'qb' || core == 'qbx' && GetResourceState(frameworkName) == 'started') {
    QBBridge();
} else if (core == 'esx' && GetResourceState(frameworkName) == 'started') {
    ESXBridge();
}

illeniumCompat();

RegisterCommand('reloadskin', async () => {
    const frameworkID = await getFrameworkID()
    const health = GetEntityHealth(ped);
    const maxhealth = GetEntityMaxHealth(ped);
    const armor = GetPedArmour(ped);

    const appearance = await triggerServerCallback<TAppearance>('bl_appearance:server:getAppearance', frameworkID)
    if (!appearance) return;
    await setPlayerPedAppearance(appearance)

    SetPedMaxHealth(ped, maxhealth)
    delay(1000) 
    SetEntityHealth(ped, health)
    SetPedArmour(ped, armor)
}, false)
