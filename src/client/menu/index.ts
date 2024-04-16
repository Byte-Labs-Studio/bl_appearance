import getAppearance from './appearance'
import getTattoos from './tattoos'
import { TAppearance} from '@dataTypes/appearance';
import { Outfit} from '@dataTypes/outfits';
import { TTattoo} from '@dataTypes/tattoos';
import menuTypes from '../../data/menuTypes';
import { send, receive } from '@enums'
import { sendNUIEvent, delay, requestLocale, requestModel, triggerServerCallback } from '@utils'
import { startCamera, stopCamera } from './../camera'

export let playerAppearance: TAppearance | null = null

const bl_appearance = exports.bl_appearance
export let isMenuOpen = false
export let ped = 0

const updatePed = () => {
    if (!isMenuOpen) return;
    ped = PlayerPedId()
    setTimeout(updatePed, 100);
}

const validMenuTypes = (type: string[]) => {
    for (let i = 0; i < type.length; i++) {
        if (!menuTypes.includes(type[i])) {
            return false;
        }
    }

    return true;
}

export const openMenu = async (type: string[] | string) => {
    isMenuOpen = true
    updatePed()
    await delay(150)
    startCamera()
    sendNUIEvent(send.visible, true)
    SetNuiFocus(true, true)
    const isArray = typeof type !== 'string'

    if (isArray && !validMenuTypes(type)) {
        return console.error('Error: menu type not found');
    }
    const id = exports.bl_appearance.config().useBridge ? exports.bl_bridge.core && exports.bl_bridge.core().getPlayerData().cid : null;
    const data = await triggerServerCallback<{ outfits: Outfit[], tattoos: TTattoo[] }>('bl_appearance:server:getTattoos&Outfits', 1, id) as { outfits: Outfit[], tattoos: TTattoo[] }

    const appearance = await getAppearance()
    playerAppearance = appearance
    playerAppearance.outfits = data.outfits
    playerAppearance.tattoos = data.tattoos

    sendNUIEvent(send.data, {
        tabs: isArray ? type : menuTypes.includes(type) ? type : menuTypes,
        appearance: appearance,
        blacklist: bl_appearance.blacklist(),
        tattoos: getTattoos(),
        outfits: data.outfits,
        models: bl_appearance.models(),
        locale: await requestLocale('locale')
    })
}

export const setAppearance = async (appearanceData: TAppearance) => {
    const model = appearanceData.model
    if (model) {
        const modelHash = await requestModel(model)
    
        SetPlayerModel(PlayerId(), modelHash)
    
        await delay(150)
    
        SetModelAsNoLongerNeeded(modelHash)
        SetPedDefaultComponentVariation(ped)
    
        if (model === GetHashKey("mp_m_freemode_01")) SetPedHeadBlendData(ped, 0, 0, 0, 0, 0, 0, 0, 0, 0, false)
        else if (model === GetHashKey("mp_f_freemode_01")) SetPedHeadBlendData(ped, 45, 21, 0, 20, 15, 0, 0.3, 0.1, 0, false)
    }

    const headBlend = appearanceData.headBlend
    if (headBlend) SetPedHeadBlendData(ped, headBlend.shapeFirst, headBlend.shapeSecond, headBlend.shapeThird, headBlend.skinFirst, headBlend.skinSecond, headBlend.skinThird, headBlend.shapeMix, headBlend.skinMix, headBlend.thirdMix, headBlend.hasParent)

    if (appearanceData.headStructure) for (const data of Object.values(appearanceData.headStructure)) {
        SetPedFaceFeature(ped, data.index, data.value)
    }

    if (appearanceData.drawables) for (const data of Object.values(appearanceData.drawables)) {
        if (data.index === 2) console.log(data.index, data.value, data.texture)
        SetPedComponentVariation(ped, data.index, data.value, data.texture, 0)
    }

    if (appearanceData.props) for (const data of Object.values(appearanceData.props)) {
        if (data.value === -1) {
            ClearPedProp(ped, data.index)
            return 1
        }
        SetPedPropIndex(ped, data.index, data.value, data.texture, false)
    }

    if (appearanceData.hairColor) {
        SetPedHairColor(ped, appearanceData.hairColor.color, appearanceData.hairColor.highlight) 
    }

    if (appearanceData.headOverlay) for (const data of Object.values(appearanceData.headOverlay)) {
        const value = data.overlayValue == -1 ? 255 : data.overlayValue

        if (data.id === 'EyeColor') SetPedEyeColor(ped, value) 
        else {
            SetPedHeadOverlay(ped, data.index, value, data.overlayOpacity)
            SetPedHeadOverlayColor(ped, data.index, 1, data.firstColor, data.secondColor)
        }
    }

    if (appearanceData.tattoos) {
        ClearPedDecorationsLeaveScars(ped)
        for (const element of appearanceData.tattoos) {
            const tattoo = element.tattoo
            if (tattoo) {
                AddPedDecorationFromHashes(ped, GetHashKey(tattoo.dlc), tattoo.hash)
            }
        }  
    }
}

export const closeMenu = async (save: boolean) => {
    if (!save) await setAppearance(playerAppearance)
    else {
        const config = exports.bl_appearance.config()
        const appearance = await getAppearance()
        emitNet("bl_appearance:server:saveAppearances", {
            id: config.useBridge ? exports.bl_bridge.core && exports.bl_bridge.core().getPlayerData().cid : null,

            skin: {
                headBlend: appearance.headBlend,
                headStructure: appearance.headStructure,
                headOverlay: appearance.headOverlay,
                hairColor: appearance.hairColor,
                model: appearance.model,
            },
            clothes: {
                drawables: appearance.drawables,
                props: appearance.props,
                headOverlay: appearance.headOverlay,
            },
            tattoos: playerAppearance.currentTattoos || [],
        });
    }

    stopCamera()
    isMenuOpen = false
    SetNuiFocus(false, false)
    sendNUIEvent(send.visible, false)
}

RegisterNuiCallback(receive.close, (save: boolean, cb: Function) => {
    cb(1)
    closeMenu(save)
});