import HEAD_OVERLAYS from '../../../data/head';
import FACE_FEATURES from '../../../data/face';
import DRAWABLE_NAMES from '../../../data/drawable';
import PROP_NAMES from '../../../data/props';
import { HairData, PedHandle, TotalData, DrawableData, HeadStructureData, HeadOverlayData, TAppearance } from '@dataTypes/appearance';
import { TTattoo } from '@dataTypes/tattoos';
import {ped} from '..';
import { triggerServerCallback } from '@utils'

const findModelIndex = (model: PedHandle) => exports.bl_appearance.models().findIndex((ped: string) => GetHashKey(ped) === model);

const getPedHair = (): HairData => ({
    color: GetPedHairColor(ped),
    highlight: GetPedHairHighlightColor(ped)
});

const getPedHeadBlendData = () => {
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
};

const getHeadOverlay = (): [Record<string, HeadOverlayData>, Record<string, number>] => {
    let totals: Record<string, number> = {};
    let headData: Record<string, HeadOverlayData> = {};

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
};

const getHeadStructure = (): Record<string, HeadStructureData> | undefined => {
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

const getDrawables = (): [Record<string, DrawableData>, Record<string, TotalData>] => {
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

const getProps = (): [Record<string, DrawableData>, Record<string, TotalData>] => {
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

export default async (): Promise<TAppearance> => {
    const [headData, totals] = getHeadOverlay()
    const [drawables, drawTotal] = getDrawables()
    const [props, propTotal] = getProps()
    const model = GetEntityModel(ped)

    return {
        modelIndex: findModelIndex(model),
        model: model,
        hairColor: getPedHair(),
        headBlend: getPedHeadBlendData(),
        headOverlay: headData,
        headOverlayTotal: totals,
        headStructure: getHeadStructure(),
        drawables: drawables,
        props: props,
        drawTotal: drawTotal,
        propTotal: propTotal,
    }
}