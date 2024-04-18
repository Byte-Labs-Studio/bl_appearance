import { outfits } from '@enums';
import { debugdata, requestModel, delay, getFrameworkID, triggerServerCallback} from '../../utils';
import { Outfit, TOutfitData} from '@dataTypes/outfits';
import { TTattoo} from '@dataTypes/tattoos';
import getAppearance from './../appearance'
import {ped, playerAppearance, setAppearance} from './../'

const actionHandlers = {
    [outfits.saveOutfit]: async ({label, outfit}) => {
        const frameworkdId = getFrameworkID()
        return await triggerServerCallback("bl_appearance:server:saveOutfit", frameworkdId, {label, outfit})
    },
    [outfits.deleteOutfit]: async (id: string) => {
        const frameworkdId = getFrameworkID()
        return await triggerServerCallback("bl_appearance:server:deleteOutfit", frameworkdId, id)
    },
    [outfits.renameOutfit]: async ({label, id}) => {
        const frameworkdId = getFrameworkID()
        return await triggerServerCallback("bl_appearance:server:renameOutfit", frameworkdId, label, id)
    },
    [outfits.useOutfit]: (outfit: TOutfitData) => {
        setAppearance(outfit)
        return true
    },
}

for (const action of Object.values(outfits)) {
    RegisterNuiCallback(action, async (data: any, cb: Function) => {
        const handler = actionHandlers[action];
        if (!handler) return

        cb(await handler(data))
    });
}
