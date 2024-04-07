import {ped} from './../utils'
import peds from '@data/peds';
import HEAD_OVERLAYS from '@data/head';

function findModelIndex(model: number) {
    for (let i = 0; i < peds.length; i++) {
        if (peds[i] === model) return i
    }
    return null
}

function getPedHair() {
    return {
        color: GetPedHairColor(ped),
        highlight: GetPedHairHighlightColor(ped)
    }
}

function getPedHeadBlendData() {
    var arr = new Uint32Array(new ArrayBuffer(10 * 8)); // int, int, int, int, int, int, float, float, float, bool
    Citizen.invokeNative("0x2746BD9D88C5C5D0", ped, arr);
    return JSON.stringify(arr);
}

function getHeadOverlay(pedHandle? : number) {
    const player = IsPedAPlayer(ped) ? ped : pedHandle

    let headData = []
    for (let i = 0; i < HEAD_OVERLAYS.length; i++) {
        let overlay = HEAD_OVERLAYS[i]

        if (overlay === "EyeColor") {
            headData[overlay] = {
                name: overlay,
                index: i,
                value: GetPedEyeColor(player)
            }
        } else {
            let [_, overlayValue, colourType, firstColor, secondColor, overlayOpacity] = GetPedHeadOverlayData(player, i)
            headData[overlay] = {
                name: overlay,
                index: i - 1,
                overlayValue: overlayValue === 255 ? -1 : overlayValue,
                colourType: colourType,
                firstColor: firstColor,
                secondColor: secondColor,
                overlayOpacity: overlayOpacity
            }
        }

    }

    return headData
}

export function getAppearance() {
    const model = GetEntityModel(ped)
    const data = {
        modelIndex : findModelIndex(model),
        model : model,
        hairColor : getPedHair(),
        headBlend : getPedHeadBlendData(),
        headOverlay : getHeadOverlay(),
        headOverlayTotal : GetHeadOverlayTotals(),
        headStructure : GetHeadStructure(),
        drawables : GetDrawables(),
        props : GetProps(),
        tattoos : tattoos,
        drawTotal : GetDrawablesTotal(),
        propTotal : GetPropTotal(),
    }

    return data
}