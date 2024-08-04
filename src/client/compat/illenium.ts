import { findModelIndex, getAppearance, getDrawables, getHair, getHeadOverlay, getProps } from "../appearance/getters";
import { setDrawable, setHeadBlend, setHeadOverlay, setModel, setPedHairColors } from "../appearance/setters";

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
        console.warn('Xirvin will implement');
        //return findModelIndex(ped)
    });

    exportHandler('getPedComponents', (ped: number) => {
        return getDrawables(ped);
    });

    exportHandler('getPedProps', (ped: number) => {
       return getProps(ped);
    });

    exportHandler('getPedHeadBlend', () => {
        return console.warn('Xirvin will implement');
    });

    exportHandler('getPedFaceFeatures', () => {
        return console.warn('Xirvin will implement');
    });

    exportHandler('getPedHeadOverlays', (ped: number) => {
        return getHeadOverlay(ped);
    });

    exportHandler('getPedHair', (ped: number) => {
        return getHair(ped);
    });

    exportHandler('getPedAppearance', (ped: number) => {
        return getAppearance(ped);
    });

    exportHandler('setPlayerModel', (model: number) => {
        setModel(model);
    });

    exportHandler('setPedHeadBlend', (ped: number, blend: any) => {
        setHeadBlend(ped, blend);
    });

    exportHandler('setPedFaceFeatures', () => {
        return console.warn('Xirvin will implement');
    });

    exportHandler('setPedHeadOverlays', (ped: number, overlay: any) => {
        setHeadOverlay(ped, overlay);
    });

    exportHandler('setPedHair', async (ped: number, hair: any, tattoo: any) => {
        await setPedHairColors(ped, hair);
        //xirvin tattoo need?
    });

    exportHandler('setPedEyeColor', () => {
        return console.warn('Xirvin will implement');
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
        return console.warn('Xirvin will implement');
    });

    exportHandler('setPedProp', (ped: number, prop: any) => {
        const newProp = {
            index: prop.prop_id,
            value: prop.drawable,
            texture: prop.texture
        }
        setDrawable(ped, newProp);
    });

    exportHandler('setPedProps', (ped: number, props: any) => {
        return console.warn('Xirvin will implement');
    });

    exportHandler('setPlayerAppearance', () => {
        return console.warn('Need to be implemented');
    });

    exportHandler('setPedAppearance', () => {
        return console.warn('Need to be implemented');
    });

    exportHandler('setPedTattoos', () => {
        return console.warn('Need to be implemented');
    });
}