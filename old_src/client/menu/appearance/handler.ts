import { appearance, outfits } from '@enums';
import { debugdata, requestModel, delay, triggerServerCallback, getFrameworkID} from '../../utils';
import { HeadOverlayData, HeadStructureData, DrawableData} from '@dataTypes/appearance';
import { TTattoo} from '@dataTypes/tattoos';
import getAppearance from '.'
import {ped, playerAppearance} from './../'
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

        return getAppearance()
    },
    [appearance.setHeadStructure]: (data: HeadStructureData) => {
        SetPedFaceFeature(ped, data.index, data.value)
        return data
    },
    [appearance.setHeadOverlay]: (data: HeadOverlayData) => {
        const value = data.overlayValue == -1 ? 255 : data.overlayValue

        if (data.id === 'EyeColor') SetPedEyeColor(ped, data.eyeColor) 
        else if (data.id === 'hairColor') SetPedHairColor(ped, data.hairColor, data.hairHighlight) 
        else {
            SetPedHeadOverlay(ped, data.index, value, data.overlayOpacity)
            SetPedHeadOverlayColor(ped, data.index, 1, data.firstColor, data.secondColor)
        }

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
    [appearance.setTattoos]: (data: TTattoo[]) => {
        if (!data) return 1

        playerAppearance.currentTattoos = data
        ClearPedDecorationsLeaveScars(ped)

        for (const element of data) {
            const tattoo = element.tattoo
            if (tattoo) {
                AddPedDecorationFromHashes(ped, GetHashKey(tattoo.dlc), tattoo.hash)
            }
        }
        
        return 1
    },
    [appearance.getModelTattoos]: (data: any) => {
        return data
    },

};

for (const action of Object.values(appearance)) {
    RegisterNuiCallback(action, async (data: any, cb: Function) => {
        const handler = actionHandlers[action];
        if (!handler) return

        cb(await handler(data))
    });
}
