import { TAppearance, TAppearanceZone, TMenuTypes } from "@typings/appearance"
import { openMenu } from "./menu"
import { setPedAppearance, setPlayerPedAppearance } from "./appearance/setters"
import { triggerServerCallback } from "@utils"

RegisterCommand('openMenu', () => {
    openMenu({ type: "appearance", coords: [0, 0, 0, 0] })  
}, false)

exports('SetPedAppearance', async (ped: number, appearance: TAppearance) => {
    await setPedAppearance(ped, appearance)
})

exports('SetPlayerPedAppearance', async (frameworkID) => {
    const appearance = await triggerServerCallback<TAppearance>('bl_appearance:server:getAppearance', frameworkID)
    await setPlayerPedAppearance(appearance)
})

exports('GetPlayerPedAppearance', async (frameworkID) => {
    return await triggerServerCallback<TAppearance>('bl_appearance:server:getAppearance', frameworkID)
})

exports('InitialCreation', async (cb?: Function) => {
    await openMenu({ type: "appearance", coords: [0, 0, 0, 0] })
    if (cb) cb()
})

on('bl_sprites:client:useZone', (zone: TAppearanceZone) => {
    openMenu(zone)
})