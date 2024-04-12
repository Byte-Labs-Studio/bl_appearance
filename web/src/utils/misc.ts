import {
    APPEARANCE,
    BLACKLIST,
    IS_VALID,
    MODELS,
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

    let isValid = true;

    if (!blacklist) {
        isValid = false;
    } else {
        const { drawables, props, modelIndex } = APPEARANCE.get();
        const blacklistDrawables = blacklist.drawables;
        const blacklistProps = blacklist.props;
        const blacklistModels = blacklist.models;

        if (blacklistDrawables) {
            for (const key in drawables) {
                if (blacklistDrawables.hasOwnProperty(key)) {
                    const value = drawables[key].value;
                    const texture = drawables[key].texture;

                    if (blacklistDrawables[key].values.includes(value) ||
                        (blacklistDrawables[key].textures[value] &&
                            blacklistDrawables[key].textures[value].includes(texture))) {
                        isValid = false;
                        break;
                    }
                }
            }
        }

        if (blacklistProps && isValid) {
            for (const key in props) {
                if (blacklistProps.hasOwnProperty(key)) {
                    const value = props[key].value;
                    const texture = props[key].texture;

                    if (blacklistProps[key].values.includes(value) ||
                        (blacklistProps[key].textures[value] &&
                            blacklistProps[key].textures[value].includes(texture))) {
                        isValid = false;
                        break;
                    }
                }
            }
        }

        if (blacklistModels && isValid) {
            const models = get(MODELS);
            const model = models[modelIndex];
            if (blacklistModels.includes(model)) {
                isValid = false;
            }
        }
    }

    if (isValid !== get(IS_VALID)) {
        IS_VALID.set(isValid);
    }
}
