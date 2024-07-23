
import { TAppearance } from "@typings/appearance"
import { setPedAppearance } from "../appearance/setters"
import { openMenu } from "../menu"
import { bl_bridge, format } from "@utils"

const frameworkName = bl_bridge.getFramework('core')
const core = format(GetConvar('bl:framework', 'qb'))

if (core == 'qb' || core == 'qbx' && GetResourceState(frameworkName) == 'started') {
    onNet('qb-clothing:client:loadPlayerClothing', async (appearance: TAppearance, ped: number) => {
        await setPedAppearance(ped, appearance)
    })

    onNet('qb-clothes:client:CreateFirstCharacter', () => {
        exports.bl_appearance.InitialCreation()
    })

    onNet('qb-clothing:client:openOutfitMenu', () => {
        openMenu({ type: "outfits", coords: [0, 0, 0, 0] })  
    })
}