import { TAppearance } from "@typings/appearance"
import { setPedAppearance } from "../appearance/setters"
import { openMenu } from "../menu"

onNet('qb-clothing:client:loadPlayerClothing', async (appearance: TAppearance, ped: number) => {
    await setPedAppearance(ped, appearance)
})

onNet('qb-clothes:client:CreateFirstCharacter', () => {
    openMenu({ type: "appearance", coords: [0, 0, 0, 0] })  
})

onNet('qb-clothing:client:openOutfitMenu', () => {
    openMenu({ type: "outfits", coords: [0, 0, 0, 0] })  
})