
import { TAppearance } from "@typings/appearance"
import { setPedAppearance, setPlayerPedAppearance } from "../appearance/setters"
import { getFrameworkID, triggerServerCallback } from "@utils"

export function ESXBridge() {
    let firstSpawn = false

    on("esx_skin:resetFirstSpawn", () => {
        firstSpawn = true
    });

    on("esx_skin:playerRegistered", () => {
        if(firstSpawn)
            exports.bl_appearance.InitialCreation()
    });

    onNet('skinchanger:loadSkin2', async (appearance: TAppearance, ped: number) => {
        await setPedAppearance(ped, appearance)
    });

    onNet('skinchanger:getSkin', async (cb: any) => {
        const frameworkID = await getFrameworkID()
        const appearance = await triggerServerCallback<TAppearance>('bl_appearance:server:getAppearance', frameworkID)
        cb(appearance)
    })

    onNet('skinchanger:loadSkin', async (appearance: TAppearance, cb: any) => {
        await setPlayerPedAppearance(appearance)
        if (cb) cb()
    })

    onNet('esx_skin:openSaveableMenu', async (onSubmit: any) => {
        exports.bl_appearance.InitialCreation(onSubmit)
    })
}