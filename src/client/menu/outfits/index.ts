import { outfits } from '@enums';
import { debugdata, requestModel, delay} from '../../utils';
import { Outfit, TOutfitData} from '@dataTypes/outfits';
import { TTattoo} from '@dataTypes/tattoos';
import getAppearance from './../appearance'
import {ped, playerAppearance, setAppearance} from './../'

const actionHandlers = {
    [outfits.saveOutfit]: async (data: Outfit) => {
        const config = exports.bl_appearance.config()
        emitNet("bl_appearance:server:saveOutfit", {
            id: config.useBridge ? exports.bl_bridge.core && exports.bl_bridge.core().getPlayerData().cid : null,
            label: data.label,
            outfit: data.outfit
        });
        return true
    },
    [outfits.deleteOutfit]: async (model: string) => {
        
    },
    [outfits.renameOutfit]: async (model: string) => {
        
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
