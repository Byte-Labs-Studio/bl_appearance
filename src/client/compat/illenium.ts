import { TAppearance } from "@typings/appearance";
import { getAppearance, getDrawables, getProps } from "../appearance/getters";
import { setDrawable, setModel, setPedAppearance, setPedTattoos, setProp } from "../appearance/setters";
import { TTattoo } from "@typings/tattoos";

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
        return console.warn('You Still cannot use this function');
        //return getHeadBlendData(ped);
    });

    exportHandler('getPedFaceFeatures', (ped: number) => {
        return console.warn('You Still cannot use this function');
        //return getHeadStructure(ped);
    });

    exportHandler('getPedHeadOverlays', (ped: number) => {
        return console.warn('You Still cannot use this function');
        //return getHeadOverlay(ped);
    });

    exportHandler('getPedHair', (ped: number) => {
        //return getHair(ped);
        return console.warn('You Still cannot use this function');
    });

    exportHandler('getPedAppearance', (ped: number) => {
        return getAppearance(ped);
    });

    exportHandler('setPlayerModel', (model: number) => {
        setModel(model);
    });

    exportHandler('setPedHeadBlend', (ped: number, blend: any) => {
        //setHeadBlend(ped, blend);
        return console.warn('You Still cannot use this function');
    });

    exportHandler('setPedFaceFeatures', () => {
        return console.warn('You Still cannot use this function');
    });

    exportHandler('setPedHeadOverlays', (ped: number, overlay: any) => {
        //setHeadOverlay(ped, overlay);
        return console.warn('You Still cannot use this function');
    });

    exportHandler('setPedHair', async (ped: number, hair: any, tattoo: any) => {
        //setPedHairColors(ped, hair);
        return console.warn('You Still cannot use this function');
    });

    exportHandler('setPedEyeColor', () => {
        return console.warn('You Still cannot use this function');
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