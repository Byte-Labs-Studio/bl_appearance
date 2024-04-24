import { TAppearance, THairData, THeadOverlay, THeadOverlayTotal } from "@typings/appearance"
import HEAD_OVERLAYS from "@data/head"
import FACE_FEATURES from "@data/face"
import DRAWABLE_NAMES from "@data/drawables"
import PROP_NAMES from "@data/props"
import { ped} from '@utils';

export function findModelIndex (target: number) {
    const config = exports.bl_appearance
    const models = config.models()
    
    return models.findIndex((model) => GetHashKey(model)  === target)
}

export function getHair (pedHandle: number): THairData {
    return {
        color: GetPedHairColor(pedHandle),
        highlight: GetPedHairHighlightColor(pedHandle)
    }
}

export function getHeadBlendData(pedHandle: number) {
    const headblendData = exports.bl_appearance.GetHeadBlendData(pedHandle)

    return {
        shapeFirst: headblendData.FirstFaceShape,   // father
        shapeSecond: headblendData.SecondFaceShape, // mother
        shapeThird: headblendData.ThirdFaceShape,

        skinFirst: headblendData.FirstSkinTone,
        skinSecond: headblendData.SecondSkinTone,
        skinThird: headblendData.ThirdSkinTone,

        shapeMix: headblendData.ParentFaceShapePercent, // resemblance

        thirdMix: headblendData.ParentThirdUnkPercent,
        skinMix: headblendData.ParentSkinTonePercent,   // skinpercent

        hasParent: headblendData.IsParentInheritance,
    };
}

export function getHeadOverlay(pedHandle: number) {
    let totals: THeadOverlayTotal = {};
    let headData: THeadOverlay = {};

    for (let i = 0; i < HEAD_OVERLAYS.length; i++) {
        const overlay = HEAD_OVERLAYS[i];
        totals[overlay] = GetNumHeadOverlayValues(i);

        if (overlay === "EyeColor") {
            headData[overlay] = {
                id: overlay,
                index: i,
                overlayValue: GetPedEyeColor(pedHandle)
            };
        } else {
            const [_, overlayValue, colourType, firstColor, secondColor, overlayOpacity] = GetPedHeadOverlayData(pedHandle, i);
            headData[overlay] = {
                id: overlay,
                index: i - 1,
                overlayValue: overlayValue === 255 ? -1 : overlayValue,
                colourType: colourType,
                firstColor: firstColor,
                secondColor: secondColor,
                overlayOpacity: overlayOpacity
            };
        }
    }

    return [headData, totals];
}

export function getHeadStructure(pedHandle: number) {
    const pedModel = GetEntityModel(pedHandle)

    if (pedModel !== GetHashKey("mp_m_freemode_01") && pedModel !== GetHashKey("mp_f_freemode_01")) return

    let faceStruct = {}
    for (let i = 0; i < FACE_FEATURES.length; i++) {
        const overlay = FACE_FEATURES[i]
        faceStruct[overlay] = {
            id: overlay,
            index: i,
            value: GetPedFaceFeature(pedHandle, i)
        }
    }

    return faceStruct
}

export function getDrawables(pedHandle: number) {
    let drawables = {}
    let totalDrawables = {}

    for (let i = 0; i < DRAWABLE_NAMES.length; i++) {
        const name = DRAWABLE_NAMES[i]
        const current = GetPedDrawableVariation(pedHandle, i)

        totalDrawables[name] = {
            id: name,
            index: i,
            total: GetNumberOfPedDrawableVariations(pedHandle, i),
            textures: GetNumberOfPedTextureVariations(pedHandle, i, current)
        }
        drawables[name] = {
            id: name,
            index: i,
            value: GetPedDrawableVariation(pedHandle, i),
            texture: GetPedTextureVariation(pedHandle, i)
        }
    }

    return [drawables, totalDrawables]
}

export function getProps(pedHandle: number) {
    let props = {}
    let totalProps = {}

    for (let i = 0; i < PROP_NAMES.length; i++) {
        const name = PROP_NAMES[i]
        const current = GetPedPropIndex(pedHandle, i)

        totalProps[name] = {
            id: name,
            index: i,
            total: GetNumberOfPedPropDrawableVariations(pedHandle, i),
            textures: GetNumberOfPedPropTextureVariations(pedHandle, i, current)
        }

        props[name] = {
            id: name,
            index: i,
            value: GetPedPropIndex(pedHandle, i),
            texture: GetPedPropTextureIndex(pedHandle, i)
        }
    }

    return [props, totalProps]
}


export async function getAppearance(pedHandle: number): Promise<TAppearance> {
    const [headData, totals] = getHeadOverlay(pedHandle)
    const [drawables, drawTotal] = getDrawables(pedHandle)
    const [props, propTotal] = getProps(pedHandle)
    const model = GetEntityModel(pedHandle)

    return {
        modelIndex: findModelIndex(model),
        model: model,
        hairColor: getHair(pedHandle),
        headBlend: getHeadBlendData(pedHandle),
        headOverlay: headData as THeadOverlay,
        headOverlayTotal: totals as THeadOverlayTotal,
        headStructure: getHeadStructure(pedHandle),
        drawables: drawables,
        props: props,
        drawTotal: drawTotal,
        propTotal: propTotal,
        tattoos: []
    }
}
exports("GetAppearance", getAppearance)

export function getPedClothes(pedHandle: number) {
    const [drawables] = getDrawables(pedHandle)
    const [props] = getProps(pedHandle)
    const [headData] = getHeadOverlay(pedHandle)

    return {
        headOverlay: headData,
        drawables: drawables,
        props: props,
    }
}
exports("GetPedClothes", getPedClothes)

export function getPedSkin(pedHandle: number) {
    return {
        headBlend: getHeadBlendData(pedHandle),
        headStructure: getHeadStructure(pedHandle),
        hairColor: getHair(pedHandle),
        model : GetEntityModel(pedHandle)
    }
}
exports("GetPedSkin", getPedSkin)

export function getTattooData() {
    let tattooZones = {}

    const [TATTOO_LIST, TATTOO_CATEGORIES] = exports.bl_appearance.tattoos()
    for (let i = 0; i < TATTOO_CATEGORIES.length; i++) {
        const category = TATTOO_CATEGORIES[i]
        const zone = category.zone
        const label = category.label
        const index = category.index
        tattooZones[index] = {
            zone: zone,
            label: label,
            zoneIndex: index,
            dlcs: []
        }

        for (let j = 0; j < TATTOO_LIST.length; j++) {
            const dlcData = TATTOO_LIST[j]
            tattooZones[index].dlcs.push({
                label: dlcData.dlc,
                dlcIndex: j,
                tattoos: []
            })
        }
    }

    const isFemale = GetEntityModel(ped) === GetHashKey("mp_f_freemode_01")

    for (let i = 0; i < TATTOO_LIST.length; i++) {
        const data = TATTOO_LIST[i]
        const { dlc, tattoos } = data
        const dlcHash = GetHashKey(dlc)
        for (let j = 0; j < tattoos.length; j++) {
            const tattooData = tattoos[j] 
            let tattoo = null

            const lowerTattoo = tattooData.toLowerCase()
            const isFemaleTattoo = lowerTattoo.includes("_f")
            if (isFemaleTattoo && isFemale) {
                tattoo = tattooData
            } else if (!isFemaleTattoo && !isFemale) {
                tattoo = tattooData
            }

            let hash = null
            let zone = -1

            if (tattoo) {
                hash = GetHashKey(tattoo)
                zone = GetPedDecorationZoneFromHashes(dlcHash, hash)
            }

            if (zone !== -1 && hash) {
                const zoneTattoos = tattooZones[zone].dlcs[i].tattoos

                zoneTattoos.push({
                    label: tattoo,
                    hash: hash,
                    zone: zone,
                    dlc: dlc,
                })
            }
        }
    }

    return tattooZones
}