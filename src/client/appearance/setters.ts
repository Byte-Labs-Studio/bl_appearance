import { TValue } from "@typings/appearance";
import TOGGLE_INDEXES from "@data/toggles"
import { requestModel, ped, updatePed, delay} from '@utils';

export function setDrawable(pedHandle: number, data: TValue) {
    SetPedComponentVariation(pedHandle, data.index, data.value, data.texture, 0)
}

export function setProp(pedHandle: number, data: TValue) {
    if (data.value === -1) {
        ClearPedProp(pedHandle, data.index)
        return
    }

    SetPedPropIndex(pedHandle, data.index, data.value, data.texture, false)
}

export const setModel = async (model: number) => {
    const modelHash = await requestModel(model)
    SetPlayerModel(PlayerId(), modelHash)
    SetModelAsNoLongerNeeded(modelHash)
    const pedHandle = PlayerPedId()
    updatePed(pedHandle)
    SetPedDefaultComponentVariation(pedHandle)

    if (modelHash === GetHashKey("mp_m_freemode_01")) SetPedHeadBlendData(ped, 0, 0, 0, 0, 0, 0, 0, 0, 0, false)
    else if (modelHash === GetHashKey("mp_f_freemode_01")) SetPedHeadBlendData(ped, 45, 21, 0, 20, 15, 0, 0.3, 0.1, 0, false)
}

export function SetFaceFeature(pedHandle: number, data: TValue) {
    SetPedFaceFeature(pedHandle, data.index, data.value + 0.0)
}

const isPositive = (val: number) => val >= 0 ? val : 0

export function setHeadBlend(pedHandle: number, data) {
    const shapeFirst = isPositive(data.shapeFirst)
    const shapeSecond = isPositive(data.shapeSecond)
    const shapeThird = isPositive(data.shapeThird)
    const skinFirst = isPositive(data.skinFirst)
    const skinSecond = isPositive(data.skinSecond)
    const skinThird = isPositive(data.skinThird)
    const shapeMix = data.shapeMix + 0.0
    const skinMix = data.skinMix + 0.0
    const thirdMix = data.thirdMix + 0.0
    const hasParent = data.hasParent

    SetPedHeadBlendData(pedHandle, shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix, hasParent)
}

export function setHeadOverlay(pedHandle: number, data) {
    const index = data.index

    if (index === 13) {
        SetPedEyeColor(pedHandle, data.value)
        return
    }

    const value = data.overlayValue === -1 ? 255 : data.overlayValue

    /* Hair color does not have an index, only an ID so we'll check for that */
    if (data.id === 'hairColor') {
        SetPedHairTint(pedHandle, data.hairColor, data.hairHighlight)
        return;
    }

    SetPedHeadOverlay(pedHandle, index, value, data.overlayOpacity + 0.0)
    SetPedHeadOverlayColor(pedHandle, index, 1, data.firstColor, data.secondColor)
}


export function resetToggles(data) {
    const drawables = data.drawables
    const props = data.props

    for (const [toggleItem, toggleData] of Object.entries(TOGGLE_INDEXES)) {
        const toggleType = toggleData.type
        const index = toggleData.index

        if (toggleType === "drawable" && drawables[toggleItem]) {
            const currentDrawable = GetPedDrawableVariation(ped, index)
            if (currentDrawable !== drawables[toggleItem].value) {
                SetPedComponentVariation(ped, index, drawables[toggleItem].value, 0, 0)
            }
        } else if (toggleType === "prop" && props[toggleItem]) {
            const currentProp = GetPedPropIndex(ped, index)
            if (currentProp !== props[toggleItem].value) {
                SetPedPropIndex(ped, index, props[toggleItem].value, 0, false)
            }
        }
    }
}

export function setPedClothes(pedHandle: number, data) {
    const drawables = data.drawables
    const props = data.props
    const headOverlay = data.headOverlay
    for (const id in drawables) {
        const drawable = drawables[id]
        setDrawable(pedHandle, drawable)
    }

    for (const id in props) {
        const prop = props[id]
        setProp(pedHandle, prop)
    }

    for (const id in headOverlay) {
        const overlay = headOverlay[id]
        setHeadOverlay(pedHandle, overlay)
    }
}

export const setPedSkin = async (data) => {
    const headStructure = data.headStructure
    const headBlend = data.headBlend

    await setModel(data.model)

    if (headBlend) setHeadBlend(ped, headBlend)
    
    if (headStructure) for (const feature in headStructure) {
        const value = headStructure[feature]
        SetFaceFeature(ped, value)
    }
}

export function setPedTattoos(pedHandle: number, data) {
    if (!data) return

    ClearPedDecorationsLeaveScars(pedHandle)

    for (let i = 0; i < data.length; i++) {
        const tattooData = data[i].tattoo
        if (tattooData) {
            const collection = GetHashKey(tattooData.dlc)
            const tattoo = tattooData.hash
            AddPedDecorationFromHashes(pedHandle, collection, tattoo)
        }
    }
}

export function setPedHairColors(pedHandle: number, data) {
    const color = data.color
    const highlight = data.highlight
    // SetPedHairColor(pedHandle, color, highlight)
    console.log('SETTING HAIR COLOR')
    SetPedHairTint(pedHandle, color, highlight)
}

export async function setPedAppearance(pedHandle: number, data) {
    await setPedSkin(data)
    setPedClothes(pedHandle, data)
    setPedHairColors(pedHandle, data.hairColor)
    setPedTattoos(pedHandle, data.tattoos)
}

export async function setPlayerPedAppearance(data) {
    await setPedSkin(data)
    setPedClothes(ped, data)
    setPedHairColors(ped, data.hairColor)
    setPedTattoos(ped, data.tattoos)
}

exports('SetPedClothes', setPedClothes)
exports('SetPedSkin', setPedSkin)
exports('SetPedTattoos', setPedTattoos)
exports('SetPedHairColors', setPedHairColors)