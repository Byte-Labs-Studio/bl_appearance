import {
    APPEARANCE,
    BLACKLIST,
    IS_VALID,
    MODELS,
    SELECTED_TAB,
    TABS,
} from '@stores/appearance';
import { get } from 'svelte/store';

export const deepCopy = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj));
};

export function randomID(): number {
    return Math.floor(Math.random() * 10000000000);
}

export function isObjectEmpty(obj: Object) {
    if (obj === null || obj === undefined) return true;
    return Object.keys(obj).length === 0;
}

export function checkValid() {
    const blacklist = get(BLACKLIST);

    if (!blacklist) {
        IS_VALID.set(false);
        return;
    }

    const { drawables, props, modelIndex } = APPEARANCE.get();
    const blacklistDrawables = blacklist.drawables;
    const blacklistProps = blacklist.props;
    const blacklistModels = blacklist.models;

    if (blacklistDrawables) {
        for (const key in drawables) {
            if (blacklistDrawables.hasOwnProperty(key)) {
                const value = drawables[key].value;
                console.log(
                    'drawables',
                    blacklistDrawables[key].values.includes(value),
                    key,
                    value,
                    blacklistDrawables[key].values,
                );
                if (blacklistDrawables[key].values.includes(value)) {
                    console.log('not valid');
                    IS_VALID.set(false);
                }

                const texture = drawables[key].texture;
                if (
                    blacklistDrawables[key].textures[value] &&
                    blacklistDrawables[key].textures[value].includes(texture)
                ) {
                    IS_VALID.set(false);
                }
            }
        }
    }

    if (blacklistProps) {
        for (const key in props) {
            if (blacklistProps.hasOwnProperty(key)) {
                const value = props[key].value;
                if (blacklistProps[key].values.includes(value)) {
                    IS_VALID.set(false);
                }

                const texture = props[key].texture;
                if (
                    blacklistProps[key].textures[value] &&
                    blacklistProps[key].textures[value].includes(texture)
                ) {
                    IS_VALID.set(false);
                }
            }
        }
    }

    if (blacklistModels) {
        const models = get(MODELS);
        const model = models[modelIndex];
        if (blacklistModels.includes(model)) {
            IS_VALID.set(false);
        }
    }

    IS_VALID.set(true);
}
