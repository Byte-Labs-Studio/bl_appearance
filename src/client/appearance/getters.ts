import { TAppearance, THairData, THeadOverlay, THeadOverlayTotal } from "@typings/appearance"
import HEAD_OVERLAYS from "@data/head"
import FACE_FEATURES from "@data/face"
import DRAWABLE_NAMES from "@data/drawables"
import PROP_NAMES from "@data/props"

export function findModelIndex (target: number) {
    const config = exports.bl_appearance
    const models = config.models()
    
    return models.findIndex((model) => GetHashKey(model)  === target)
}

export function getHair (ped: number): THairData {
    ped = ped || PlayerPedId()
    return {
        color: GetPedHairColor(ped),
        highlight: GetPedHairHighlightColor(ped)
    }
}

export function getHeadBlendData(ped: number) {
    ped = ped || PlayerPedId()

    const headblendData = exports.bl_appearance.GetHeadBlendData(ped)

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

export function getHeadOverlay(ped: number) {
    ped = ped || PlayerPedId()

    let totals: THeadOverlayTotal = {};
    let headData: THeadOverlay = {};

    for (let i = 0; i < HEAD_OVERLAYS.length; i++) {
        const overlay = HEAD_OVERLAYS[i];
        totals[overlay] = GetNumHeadOverlayValues(i);

        if (overlay === "EyeColor") {
            headData[overlay] = {
                id: overlay,
                index: i,
                overlayValue: GetPedEyeColor(ped)
            };
        } else {
            const [_, overlayValue, colourType, firstColor, secondColor, overlayOpacity] = GetPedHeadOverlayData(ped, i);
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

export function getHeadStructure(ped: number) {
    ped = ped || PlayerPedId()

    const pedModel = GetEntityModel(ped)

    if (pedModel !== GetHashKey("mp_m_freemode_01") && pedModel !== GetHashKey("mp_f_freemode_01")) return

    let faceStruct = {}
    for (let i = 0; i < FACE_FEATURES.length; i++) {
        const overlay = FACE_FEATURES[i]
        faceStruct[overlay] = {
            id: overlay,
            index: i,
            value: GetPedFaceFeature(ped, i)
        }
    }

    return faceStruct
}

export function getDrawables(ped: number) {
    ped = ped || PlayerPedId()

    let drawables = {}
    let totalDrawables = {}

    for (let i = 0; i < DRAWABLE_NAMES.length; i++) {
        const name = DRAWABLE_NAMES[i]
        const current = GetPedDrawableVariation(ped, i)

        totalDrawables[name] = {
            id: name,
            index: i,
            total: GetNumberOfPedDrawableVariations(ped, i),
            textures: GetNumberOfPedTextureVariations(ped, i, current)
        }
        drawables[name] = {
            id: name,
            index: i,
            value: GetPedDrawableVariation(ped, i),
            texture: GetPedTextureVariation(ped, i)
        }
    }

    return [drawables, totalDrawables]
}

export function getProps(ped: number) {
    ped = ped || PlayerPedId()

    let props = {}
    let totalProps = {}

    for (let i = 0; i < PROP_NAMES.length; i++) {
        const name = PROP_NAMES[i]
        const current = GetPedPropIndex(ped, i)

        totalProps[name] = {
            id: name,
            index: i,
            total: GetNumberOfPedPropDrawableVariations(ped, i),
            textures: GetNumberOfPedPropTextureVariations(ped, i, current)
        }

        props[name] = {
            id: name,
            index: i,
            value: GetPedPropIndex(ped, i),
            texture: GetPedPropTextureIndex(ped, i)
        }
    }

    return [props, totalProps]
}


export async function getAppearance(ped: number): Promise<TAppearance> {
    ped = ped || PlayerPedId()
    const [headData, totals] = getHeadOverlay(ped)
    const [drawables, drawTotal] = getDrawables(ped)
    const [props, propTotal] = getProps(ped)
    const model = GetEntityModel(ped)

    return {
        modelIndex: findModelIndex(model),
        model: model,
        hairColor: getHair(ped),
        headBlend: getHeadBlendData(ped),
        headOverlay: headData as THeadOverlay,
        headOverlayTotal: totals as THeadOverlayTotal,
        headStructure: getHeadStructure(ped),
        drawables: drawables,
        props: props,
        drawTotal: drawTotal,
        propTotal: propTotal,
        tattoos: []
    }
}
exports("GetAppearance", getAppearance)

export function getPedClothes(ped: number) {
    ped = ped || PlayerPedId()

    const [drawables, drawTotal] = getDrawables(ped)
    const [props, propTotal] = getProps(ped)
    const [headData, totals] = getHeadOverlay(ped)

    return {
        headOverlay: headData,
        drawables: drawables,
        props: props,
    }
}
exports("GetPedClothes", getPedClothes)

export function getPedSkin(ped: number) {
    ped = ped || PlayerPedId()

    return {
        headBlend: getHeadBlendData(ped),
        headStructure: getHeadStructure(ped),
        hairColor: getHair(ped),
        model : GetEntityModel(ped)
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

    const isFemale = GetEntityModel(PlayerPedId()) === GetHashKey("mp_f_freemode_01")

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