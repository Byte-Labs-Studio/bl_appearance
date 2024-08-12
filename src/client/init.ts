import { TAppearance, TAppearanceZone } from "@typings/appearance"
import { openMenu } from "./menu"
import { setPlayerPedAppearance } from "./appearance/setters"
import { triggerServerCallback, getFrameworkID, Delay, bl_bridge, ped, delay, format, updatePed } from "@utils"
import { QBBridge } from "./bridge/qb"
import { ESXBridge } from "./bridge/esx"
import { illeniumCompat } from "./compat/illenium"

exports('SetPlayerPedAppearance', async (appearance: TAppearance | string) => {
    let resolvedAppearance: TAppearance;
    
    if (!appearance || typeof appearance === 'string') {
        const frameworkID: string = appearance || await getFrameworkID();
        resolvedAppearance = await triggerServerCallback<TAppearance>('bl_appearance:server:getAppearance', frameworkID) as TAppearance;
    } else if (typeof appearance === 'object') resolvedAppearance = appearance;
    
    if (!resolvedAppearance) {
        throw new Error('No valid appearance found');
    }
    
    await setPlayerPedAppearance(resolvedAppearance);
});

exports('GetPlayerPedAppearance', async (frameworkID: string) => {
    frameworkID = frameworkID || await getFrameworkID()
    return await triggerServerCallback<TAppearance>('bl_appearance:server:getAppearance', frameworkID)
})

exports('InitialCreation', async (cb?: Function) => {
    // The first argument needs to be type of TAppearanceZone meaning it needs a coords property, but in this case it's not used
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
