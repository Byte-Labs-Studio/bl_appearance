import PEDS from '@data/peds';
import HEAD_OVERLAYS from '@data/head';
import FACE_FEATURES from '@data/face';
import DRAWABLE_NAMES from '@data/drawable';
import PROP_NAMES from '@data/props';
import { HairData, PedModel, PedHandle, TotalData, DrawableData, HeadStructureData, HeadOverlayData } from '@dataTypes/appearance';

const findModelIndex = (model: PedHandle) => PEDS.findIndex(ped => GetHashKey(ped) === model);

const getPedHair = (pedHandle: PedModel): HairData => ({
    color: GetPedHairColor(pedHandle),
    highlight: GetPedHairHighlightColor(pedHandle)
});

const getPedHeadBlendData = (pedHandle: PedHandle): Uint32Array => {
    const arr = new Uint32Array(new ArrayBuffer(10 * 8)); // int, int, int, int, int, int, float, float, float, bool
    Citizen.invokeNative("0x2746BD9D88C5C5D0", pedHandle, arr);
    return arr;
};

const getHeadOverlay = (pedHandle: PedHandle): [Record<string, HeadOverlayData>, Record<string, number>] => {
    let totals: Record<string, number> = {};
    let headData: Record<string, HeadOverlayData> = {};

    for (let i = 0; i < HEAD_OVERLAYS.length; i++) {
        const overlay = HEAD_OVERLAYS[i];
        totals[overlay] = GetNumHeadOverlayValues(i);

        if (overlay === "EyeColor") {
            headData[overlay] = {
                name: overlay,
                index: i,
                value: GetPedEyeColor(pedHandle)
            };
        } else {
            const [_, overlayValue, colourType, firstColor, secondColor, overlayOpacity] = GetPedHeadOverlayData(pedHandle, i);
            headData[overlay] = {
                name: overlay,
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

const getHeadStructure = (pedHandle: PedHandle): Record<string, HeadStructureData> | undefined => {
    const pedModel = GetEntityModel(pedHandle)

    if (pedModel !== GetHashKey("mp_m_freemode_01") && pedModel !== GetHashKey("mp_f_freemode_01")) return

    let faceStruct = {}
    for (let i = 0; i < FACE_FEATURES.length; i++) {
        const overlay = FACE_FEATURES[i]
        faceStruct[overlay] = {
            name: overlay,
            index: i,
            value: GetPedFaceFeature(pedHandle, i)
        }
    }

    return faceStruct
}

const getDrawables = (pedHandle: PedModel): [Record<string, DrawableData>, Record<string, TotalData>] => {
    let drawables = {}
    let totalDrawables = {}

    for (let i = 0; i < DRAWABLE_NAMES.length; i++) {
        const name = DRAWABLE_NAMES[i]
        const current = GetPedDrawableVariation(pedHandle, i)

        totalDrawables[name] = {
            name: name,
            index: i,
            total: GetNumberOfPedDrawableVariations(pedHandle, i),
            textures: GetNumberOfPedTextureVariations(pedHandle, i, current)
        }
        drawables[name] = {
            name: name,
            index: i,
            value: GetPedDrawableVariation(pedHandle, i),
            texture: GetPedTextureVariation(pedHandle, i)
        }
    }

    return [drawables, totalDrawables]
}

const getProps = (pedHandle: PedModel): [Record<string, DrawableData>, Record<string, TotalData>] => {
    let props = {}
    let totalProps = {}

    for (let i = 0; i < PROP_NAMES.length; i++) {
        const name = PROP_NAMES[i]
        const current = GetPedPropIndex(pedHandle, i)

        totalProps[name] = {
            name: name,
            index: i,
            total: GetNumberOfPedPropDrawableVariations(pedHandle, i),
            textures: GetNumberOfPedPropTextureVariations(pedHandle, i, current)
        }

        props[name] = {
            name: name,
            index: i,
            value: GetPedPropIndex(pedHandle, i),
            texture: GetPedPropTextureIndex(pedHandle, i)
        }
    }

    return [props, totalProps]
}

export default () => {
    const ped = PlayerPedId()
    const model = GetEntityModel(ped)
    const [headData, totals] = getHeadOverlay(ped)
    const [drawables, drawTotal] = getDrawables(ped)
    const [props, propTotal] = getProps(ped)

    return {
        modelIndex: findModelIndex(model),
        model: model,
        hairColor: getPedHair(ped),
        headBlend: getPedHeadBlendData(ped),
        headOverlay: headData,
        headOverlayTotal: totals,
        headStructure: getHeadStructure(ped),
        drawables: drawables,
        props: props,
        tattoos: [],
        drawTotal: drawTotal,
        propTotal: propTotal,
    }
}