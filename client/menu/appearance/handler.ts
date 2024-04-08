import { appearance } from '@enums';
import { debugdata, requestModel, delay} from '@utils';
import getAppearance from './appearance'
import {ped} from './../'

import {THeadBlend} from '@dataTypes/appearance'

const actionHandlers = {
    [appearance.setModel]: async (model: string) => {
        const modelHash = await requestModel(model)

        SetPlayerModel(PlayerId(), modelHash)

        await delay(150)

        SetModelAsNoLongerNeeded(modelHash)
        SetPedDefaultComponentVariation(ped)

        if (model === "mp_m_freemode_01") SetPedHeadBlendData(ped, 0, 0, 0, 0, 0, 0, 0, 0, 0, false)
        else if (model === "mp_f_freemode_01") SetPedHeadBlendData(ped, 45, 21, 0, 20, 15, 0, 0.3, 0.1, 0, false)

        return getAppearance(modelHash)
    },
    [appearance.setHeadStructure]: (data: any) => {
        console.log(data)
        return data
    },
    [appearance.setHeadOverlay]: (data: any) => {
        console.log(data)
        return data
    },
    [appearance.setHeadBlend]: (data: THeadBlend) => {
        SetPedHeadBlendData(
            ped, 
            data.shapeFirst, 
            data.shapeSecond, 
            data.shapeThird, 
            data.skinFirst, 
            data.skinSecond, 
            data.skinThird, 
            data.shapeMix, 
            data.skinMix, 
            data.thirdMix, 
            data.hasParent
        )
        return true
    },
    [appearance.setProp]: (data: any) => {
        console.log(data)
        return data
    },
    [appearance.setDrawable]: (data: any) => {
        console.log(data)
        return data
    },
    [appearance.setTattoos]: (data: any) => {
        console.log(data)
        return data
    },
    [appearance.getModelTattoos]: (data: any) => {
        console.log(data)
        return data
    },
};

for (const action of Object.values(appearance)) {
    RegisterNuiCallback(action, (data: any, cb: Function) => {
        const handler = actionHandlers[action];
        if (!handler) return

        cb(handler(data))
    });
}
