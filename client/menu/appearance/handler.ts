import { appearance } from '@enums';
import { debugdata, requestModel, delay} from '@utils';
import { HeadOverlayData, HeadStructureData, DrawableData} from '@dataTypes/appearance';
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
    [appearance.setHeadStructure]: (data: HeadStructureData) => {
        SetPedFaceFeature(ped, data.index, data.value)
        return data
    },
    [appearance.setHeadOverlay]: (data: HeadOverlayData) => {
        if (data.index === 13) {
            SetPedEyeColor(ped, data.value)
            return
        }
        SetPedHeadOverlay(ped, data.index, data.value, data.overlayOpacity)
        SetPedHeadOverlayColor(ped, data.index, 1, data.firstColor, data.secondColor)

        return 1
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
        return 1
    },
    [appearance.setProp]: (data: DrawableData) => {
        if (data.value === -1) {
            ClearPedProp(ped, data.index)
            return 1
        }
        SetPedPropIndex(ped, data.index, data.value, data.texture, false)
        return data.isTexture ? 1 : GetNumberOfPedPropTextureVariations(ped, data.index, data.value) // if it texture why we would call a useless native 
    },
    [appearance.setDrawable]: (data: DrawableData) => {
        SetPedComponentVariation(ped, data.index, data.value, data.texture, 0)

        return data.isTexture ? 1 : GetNumberOfPedTextureVariations(ped, data.index, data.value)-1
    },
    [appearance.setTattoos]: (data: any) => {
        if (!data) return 1

        ClearPedDecorationsLeaveScars(ped)

        for (const element of data) {
            const tattoo = element.tattoo
            if (tattoo) {
                AddPedDecorationFromHashes(ped, GetHashKey(tattoo.dlc), tattoo.hash)
            }
        }
        
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
