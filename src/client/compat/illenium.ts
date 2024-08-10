import { TAppearance } from "@typings/appearance";
import { getAppearance, getDrawables, getHeadBlendData, getHeadOverlay, getHeadStructure, getProps } from "../appearance/getters";
import { setDrawable, setHeadBlend, setHeadOverlay, setModel, setPedAppearance, setPedTattoos, setProp } from "../appearance/setters";
import { TTattoo } from "@typings/tattoos";
import { ped, updatePed } from "@utils";

function exportHandler(name: string, cb: any) {
    on('__cfx_export_illenium-appearance_' + name, (setCB: any) => {
        setCB(cb);
    })
}

export function illeniumCompat() {
    exportHandler('startPlayerCustomization', () => {
        exports.bl_appearance.InitialCreation()
    });

    exportHandler('getPedModel', (ped: number) => {
        return GetEntityModel(ped)
    });

    exportHandler('getPedComponents', (ped: number) => {
        const drawables: any = getDrawables(ped)[0];
        let newdrawable = [];
        for (const id of drawables) {
            const drawable = drawables[id];
            newdrawable.push({
                component_id: drawable.index,
                drawable: drawable.value,
                texture: drawable.texture
            })
        }
    });

    exportHandler('getPedProps', (ped: number) => {
        const props: any =  getProps(ped)[0];
        let newProps = [];
        for (const id of props) {
            const prop = props[id];
            newProps.push({
                prop_id: prop.index,
                drawable: prop.value,
                texture: prop.texture
            })
        }
    });

    exportHandler('getPedHeadBlend', (ped: number) => {
        return getHeadBlendData(ped);
    });

    exportHandler('getPedFaceFeatures', (ped: number) => {
        const convertKey = {
            Nose_Width: "noseWidth",
            Nose_Peak_Height: "nosePeakHigh",
            Nose_Peak_Lenght: "nosePeakSize",
            Nose_Bone_Height: "noseBoneHigh",
            Nose_Peak_Lowering: "nosePeakLowering",
            Nose_Bone_Twist: "noseBoneTwist",
            EyeBrown_Height: "eyeBrownHigh",
            EyeBrown_Forward: "eyeBrownForward",
            Cheeks_Bone_High: "cheeksBoneHigh",
            Cheeks_Bone_Width: "cheeksBoneWidth",
            Cheeks_Width: "cheeksWidth",
            Eyes_Openning: "eyesOpening",
            Lips_Thickness: "lipsThickness",
            Jaw_Bone_Width: "jawBoneWidth",
            Jaw_Bone_Back_Lenght: "jawBoneBackSize",
            Chin_Bone_Lowering: "chinBoneLowering",
            Chin_Bone_Length: "chinBoneLenght",
            Chin_Bone_Width: "chinBoneSize",
            Chin_Hole: "chinHole",
            Neck_Thikness: "neckThickness"
        }

        const faceFeature = getHeadStructure(ped);
        let faceFeatureConverted = {}
        for (const key in convertKey) {
            const data = faceFeature[key];
            faceFeatureConverted[convertKey[key]] = data.value;
        }

        return faceFeatureConverted;
    });

    exportHandler('getPedHeadOverlays', (ped: number) => {
        const convertKey = {
            sunDamage: "SunDamage",
            bodyBlemishes: "BodyBlemishes",
            chestHair: "ChestHair",
            complexion: "Complexion",
            blemishes: "Blemishes",
            ageing: "Ageing",
            lipstick: "Lipstick",
            eyebrows: "Eyebrows",
            beard: "Beard",
            makeUp: "Makeup",
            blush: "Blush",
            moleAndFreckles: "MolesFreckles",
            eyeColor: "EyeColor"
        }
        const pedFeature = getHeadOverlay(ped);
        let pedFeatureConverted = {}
        for (const key in convertKey) {
            const data = pedFeature[convertKey[key]];
            pedFeatureConverted[key] = {
                secondColor: data.secondColor,
                style: data.overlayValue,
                opacity: data.overlayOpacity,
                color: data.firstColor
            }
        }

        return pedFeatureConverted;
    });

    exportHandler('getPedHair', (ped: number) => {
        return {
            style: GetPedDrawableVariation(ped, 2),
            color: GetPedHairColor(ped),
            highlight: GetPedHairHighlightColor(ped),
            texture: GetPedTextureVariation(ped, 2)
        }
    });

    exportHandler('getPedAppearance', (ped: number) => {
        return getAppearance(ped);
    });

    exportHandler('setPlayerModel', (model: number) => {
        updatePed(PlayerPedId())
        setModel(ped, model);
    });

    exportHandler('setPedHeadBlend', (ped: number, blend: any) => {
        setHeadBlend(ped, blend);
    });

    exportHandler('setPedFaceFeatures', (ped: number, faceFeatures: any) => {
        const indexTable = {
            noseWidth: 0,
            nosePeakHigh: 1,
            nosePeakSize: 2,
            noseBoneHigh: 3,
            nosePeakLowering: 4,
            noseBoneTwist: 5,
            eyeBrownHigh: 6,
            eyeBrownForward: 7,
            cheeksBoneHigh: 8,
            cheeksBoneWidth: 9,
            cheeksWidth: 10,
            eyesOpening: 11,
            lipsThickness: 12,
            jawBoneWidth: 13,
            jawBoneBackSize: 14,
            chinBoneLowering: 15,
            chinBoneLenght: 16,
            chinBoneSize: 17,
            chinHole: 18,
            neckThickness: 19
        }
        for (const key in faceFeatures) {
            const value = faceFeatures[key] + 0.0;
            SetPedFaceFeature(ped, indexTable[key], value);
        }
    });

    exportHandler('setPedHeadOverlays', (ped: number, overlay: any) => {
        const convertKey = {
            sunDamage: "SunDamage",
            bodyBlemishes: "BodyBlemishes",
            chestHair: "ChestHair",
            complexion: "Complexion",
            blemishes: "Blemishes",
            ageing: "Ageing",
            lipstick: "Lipstick",
            eyebrows: "Eyebrows",
            beard: "Beard",
            makeUp: "Makeup",
            blush: "Blush",
            moleAndFreckles: "MolesFreckles",
            eyeColor: "EyeColor"
        }
        const index = {
            Blemishes: 0,
            FacialHair: 1,
            Eyebrows: 2,
            Ageing: 3,
            Makeup: 4,
            Blush: 5,
            Complexion: 6,
            SunDamage: 7,
            Lipstick: 8,
            MolesFreckles: 9,
            ChestHair: 10,
            BodyBlemishes: 11,
            AddBodyBlemishes: 12,
            EyeColor: 13
        }
        let convertedOverlay = {};
        for (const key in overlay) {
            const data = overlay[key];
            const overlayKey = convertKey[key];
            convertedOverlay[overlayKey] = {
                id:	overlayKey,
                index:	index[overlayKey],
                overlayValue: data.opacity,
                colourType:	1,
                firstColor:	data.color,
                secondColor: data.secondColor,
                overlayOpacity:	data.opacity,
            }
        }

        setHeadOverlay(ped, convertedOverlay);
    });

    exportHandler('setPedHair', async (ped: number, hair: any, tattoo: any) => {
        SetPedComponentVariation(ped, 2, hair.style, hair.texture, 0)
        SetPedHairColor(ped, hair.color, hair.highlight)
    });

    exportHandler('setPedEyeColor', (ped: number, eyeColor: any) => {
        SetPedEyeColor(ped, eyeColor)
    });

    exportHandler('setPedComponent', (ped: number, drawable: any) => {
        const newDrawable = {
            index: drawable.component_id,
            value: drawable.drawable,
            texture: drawable.texture
        }
        setDrawable(ped, newDrawable);
    });

    exportHandler('setPedComponents', (ped: number, components: any) => {
        for (const component of components) {
            const newDrawable = {
                index: component.component_id,
                value: component.drawable,
                texture: component.texture
            }
            setDrawable(ped, newDrawable);
        }
    });

    exportHandler('setPedProp', (ped: number, prop: any) => {
        const newProp = {
            index: prop.prop_id,
            value: prop.drawable,
            texture: prop.texture
        }
        setProp(ped, newProp);
    });

    exportHandler('setPedProps', (ped: number, props: any) => {
        for (const prop of props) {
            const newProp = {
                index: prop.prop_id,
                value: prop.drawable,
                texture: prop.texture
            }
            setProp(ped, newProp);
        }
    });

    // exportHandler('setPlayerAppearance', (appearance: TAppearance) => {
    //     return console.warn('Need to be implemented');
    // });

    exportHandler('setPedAppearance', (ped: number, appearance: TAppearance) => {
        setPedAppearance(ped, appearance)
    });

    exportHandler('setPedTattoos', (ped: number, tattoos: TTattoo[]) => {
        setPedTattoos(ped, tattoos)
    });
}