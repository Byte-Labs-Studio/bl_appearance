import { DrawableData, TValue } from "@typings/appearance";
import TOGGLE_INDEXES from "@data/toggles"


export function setDrawable(ped: number, data: TValue) {
    ped = ped || PlayerPedId()

    SetPedComponentVariation(ped, data.index, data.value, data.texture, 0)
}

export function setProp(ped: number, data: TValue) {
    ped = ped || PlayerPedId()

    if (data.value === -1) {
        ClearPedProp(ped, data.index)
        return
    }

    SetPedPropIndex(ped, data.index, data.value, data.texture, false)
}


export function setModel(ped: number, data) {
    ped = ped || PlayerPedId()
    const isJustModel = typeof data === 'number'
    const model = isJustModel ? data : data.model
    const isPlayer = IsPedAPlayer(ped)

    if (isPlayer) {
        RequestModel(model)
        SetPlayerModel(PlayerId(), model)
        SetModelAsNoLongerNeeded(model)
        ped = PlayerPedId()
    }
    SetPedDefaultComponentVariation(ped)

    if (!isJustModel) {
        if (data.headBlend) {
            if (!isJustModel && Object.keys(data.headBlend).length) {
                setHeadBlend(ped, data.headBlend)
            }
        }
    }

    return ped
}

export function SetFaceFeature(ped: number, data: TValue) {
    ped = ped || PlayerPedId()
    SetPedFaceFeature(ped, data.index, data.value + 0.0)
}

const isPositive = (val: number) => val >= 0 ? val : 0

export function setHeadBlend(ped: number, data) {
    ped = ped || PlayerPedId()

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

    SetPedHeadBlendData(ped, shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix,
        thirdMix, hasParent)
}

export function setHeadOverlay(ped: number, data) {
    ped = ped || PlayerPedId()
    const index = data.index

    if (index === 13) {
        SetPedEyeColor(ped, data.value)
        return
    }

    const value = data.overlayValue === -1 ? 255 : data.overlayValue

    SetPedHeadOverlay(ped, index, value, data.overlayOpacity + 0.0)
    SetPedHeadOverlayColor(ped, index, 1, data.firstColor, data.secondColor)
}

// function ResetToggles(data)
//     local ped = cache.ped

//     local drawables = data.drawables
//     local props = data.props

//     for toggleItem, toggleData in pairs(TOGGLE_INDEXES) do
//         local toggleType = toggleData.type
//         local index = toggleData.index

//         if toggleType == "drawable" and drawables[toggleItem] then
//             local currentDrawable = GetPedDrawableVariation(ped, index)
//             if currentDrawable ~= drawables[toggleItem].value then
//                 SetPedComponentVariation(ped, index, drawables[toggleItem].value, 0, 0)
//             end
//         elseif toggleType == "prop" and props[toggleItem] then
//             local currentProp = GetPedPropIndex(ped, index)
//             if currentProp ~= props[toggleItem].value then
//                 SetPedPropIndex(ped, index, props[toggleItem].value, 0, false)
//             end
//         end
//     end
// end

export function resetToggles(data) {
    const ped = PlayerPedId()
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



// function SetPedClothes(ped, data)
//     local ped = ped or cache.ped

//     local drawables = data.drawables
//     local props = data.props
//     local headOverlay = data.headOverlay

//     for _, drawable in pairs(drawables) do
//         SetDrawable(ped, drawable)
//     end

//     for _, prop in pairs(props) do
//         SetProp(ped, prop)
//     end

//     for _, overlay in pairs(headOverlay) do
//         SetHeadOverlay(ped, overlay)
//     end
// end

export function setPedClothes(ped: number, data) {
    ped = ped || PlayerPedId()

    const drawables = data.drawables
    const props = data.props
    const headOverlay = data.headOverlay

    for (const drawable of drawables) {
        setDrawable(ped, drawable)
    }

    for (const prop of props) {
        setProp(ped, prop)
    }

    for (const overlay of headOverlay) {
        setHeadOverlay(ped, overlay)
    }
}

// function SetPedSkin(ped, data)
//     local ped = ped or cache.ped
//     local headStructure = data.headStructure
//     local headBlend = data.headBlend

//     ped = SetModel(ped, data)
//     if headBlend then
//         SetHeadBlend(ped, headBlend)
//     end
//     if headStructure then
//         for _, feature in pairs(headStructure) do
//             SetFaceFeature(ped, feature)
//         end
//     end
// end

export function setPedSkin(ped: number, data) {
    ped = ped || PlayerPedId()
    const headStructure = data.headStructure
    const headBlend = data.headBlend

    ped = setModel(ped, data)
    if (headBlend) {
        setHeadBlend(ped, headBlend)
    }
    if (headStructure) {
        for (const feature of headStructure) {
            SetFaceFeature(ped, feature)
        }
    }
}

export function setPedTattoos(ped: number, data) {
    if (!data) return
    ped = ped || PlayerPedId()

    const isPlayer = IsPedAPlayer(ped)
    if (isPlayer) {
        ped = PlayerPedId()
    }

    ClearPedDecorationsLeaveScars(ped)

    for (let i = 0; i < data.length; i++) {
        const tattooData = data[i].tattoo
        if (tattooData) {
            const collection = GetHashKey(tattooData.dlc)
            const tattoo = tattooData.hash
            AddPedDecorationFromHashes(ped, collection, tattoo)
        }
    }
}

export function setPedHairColors(ped: number, data) {
    ped = ped || PlayerPedId()

    const color = data.color
    const highlight = data.highlight
    SetPedHairColor(ped, color, highlight)
}

export function setPedAppearance(ped: number, data) {
    setPedSkin(ped, data)
    setPedClothes(ped, data)
    setPedHairColors(ped, data.hairColor)
    setPedTattoos(ped, data.tattoos)
}

export function setPlayerPedAppearance(data) {
    setPedSkin(PlayerPedId(), data)
    setPedClothes(PlayerPedId(), data)
    setPedHairColors(PlayerPedId(), data.hairColor)
    setPedTattoos(PlayerPedId(), data.tattoos)
}