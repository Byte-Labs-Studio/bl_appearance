
import { TAppearance } from "@typings/appearance"
import { setPedAppearance } from "../appearance/setters"
import { openMenu } from "../menu"

export function QBBridge() {
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