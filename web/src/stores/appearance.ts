import { Send } from '@enums/events';
import type {
    TAppearance,
    TBlacklist,
    TDrawables,
    THairColor,
    THeadBlend,
    THeadOverlay,
    THeadStructure,
    TModel,
    TOutfit,
    TOutfitData,
    TProps,
    TTab,
    TToggles,
    TValue,
    TZoneTattoo,
    Blacklist
} from '@typings/apperance';
import { SendEvent } from '@utils/eventsHandlers';
import { get, type Writable, writable } from 'svelte/store';

export const TABS: Writable<TTab[]> = writable<TTab[]>([]);
export const LOCALE: Writable<{ [key: string]: string }> = writable<{ [key: string]: string }>(null);

export const SELECTED_TAB: Writable<TTab> = writable<TTab>(null);

export const IS_VALID: Writable<Blacklist> = writable<Blacklist>({
    models: true,
    drawables: true,
});

export const ALLOW_EXIT: Writable<boolean> = writable<boolean>(false);

export const BLACKLIST: Writable<TBlacklist> = writable<TBlacklist>(null);

export const ORIGINAL_APPEARANCE: Writable<TAppearance> =
    writable<TAppearance>(null);


export const MODELS: Writable<TModel[]> = writable<TModel[]>(null);

const OUTFITS_INIT = () => {
    const store: Writable<TOutfit[]> = writable<TOutfit[]>(null);
    const methods = {
        get: () => get(store),

        set: (outfits: TOutfit[]) => store.set(outfits),

        reset: () => store.set(null),

        save: (label: string) => {
            const appearance = APPEARANCE.get();

            const outfit: TOutfitData = {
                drawables: appearance.drawables,
                props: appearance.props,
                headOverlay: appearance.headOverlay,
            };
        
            SendEvent(Send.saveOutfit, { label, outfit }).then((success: boolean) => {
                if (!success) return
                const currentOutfits = methods.get();
                currentOutfits.push({
                    id: currentOutfits.length + 1,
                    label: label,
                    outfit: JSON.parse(JSON.stringify(outfit))
                });
                store.set(currentOutfits)
            },
            );
        },

        edit: (outfit: TOutfit) => {
            const { label, id } = outfit;

            SendEvent(Send.renameOutfit, { label, id }).then(
                (success: boolean) => {
                    if (!success) return;

                    store.update(outfits => {
                        const outfitIndex = outfits.findIndex(
                            outfit => outfit.id === id,
                        );
                        outfits[outfitIndex].label = label;
                        return outfits;
                    });
                },
            );
        },

        delete: (id: number) => {
            SendEvent(Send.deleteOutfit, { id }).then((success: boolean) => {
                if (!success) return;
                store.update(outfits =>
                    outfits.filter(outfit => outfit.id !== id),
                );
            });
        },

        use: (outfit: TOutfitData) => {
            SendEvent(Send.useOutfit, outfit).then((success: boolean) => {
                if (!success) return;
                APPEARANCE.update(state => {
                    return {
                        ...state,
                        drawables: outfit.drawables,
                        props: outfit.props,
                        headOverlay: outfit.headOverlay,
                    };
                });
            });
        },
    };

    return {
        ...store,
        ...methods,
    };
};

export const OUTFITS = OUTFITS_INIT();

const TATTOOS_INIT = () => {
    const store: Writable<TZoneTattoo[]> = writable<TZoneTattoo[]>(null);
    const methods = {
        get: () => get(store),

        set: (tattoos: TZoneTattoo[]) => store.set(tattoos),

        reset: () => store.set(null),
    };

    return {
        ...store,
        ...methods,
    };
};

export const TATTOOS = TATTOOS_INIT();

const APPEARANCE_INIT = () => {
    const store: Writable<TAppearance> = writable<TAppearance>(null);
    const methods = {
        get: () => get(store),

        reset: () => store.set(null),

        cancel: () => {
            SendEvent(Send.cancel, get(ORIGINAL_APPEARANCE));
        },

        save: () => {
            SendEvent(Send.save, methods.get());
        },

        setModel: (model: TModel) => {
            SendEvent(Send.setModel, model).then((data: TAppearance) => {
                store.set(data);
            });

            const tattooData = TATTOOS.get();

            if (tattooData) {
                SendEvent(Send.getModelTattoos, {}).then(
                    (tattoos: TZoneTattoo[]) => {
                        TATTOOS.set(tattoos);
                    },
                );
            }
        },

        setHeadBlend: (headBlend: THeadBlend) => {
            SendEvent(Send.setHeadBlend, headBlend);
        },

        setHeadStructure: (
            headStructure: THeadStructure[keyof THeadStructure],
        ) => {
            SendEvent(Send.setHeadStructure, headStructure);
        },

        setHeadOverlay: (overlay: THeadOverlay[keyof THeadOverlay]) => {
            SendEvent(Send.setHeadOverlay, overlay);
        },

        setEyeColor: (eyeColor: TValue) => {
            SendEvent(Send.setHeadOverlay, {
                eyeColor: eyeColor.value,
                id: 'EyeColor'
            });
        },

        setHairColor: (hairColor: THairColor) => {
            SendEvent(Send.setHeadOverlay, {
                hairColor: hairColor.color,
                hairHighlight: hairColor.highlight,
                id: 'hairColor'
            });
        },

        isPropFetching: false,
        setProp: (prop: TProps[keyof TProps], value: number, isTexture?: boolean) => {
            if (methods.isPropFetching) return;
            methods.isPropFetching = true;

            if (isTexture) prop.texture = value
            else prop.value = value

            SendEvent(Send.setProp, {
                value: prop.value,
                index: prop.index,
                texture: prop.texture,
                isTexture: isTexture
            }).then((propTotal: number) => {
                store.update(appearance => {
                    if (!isTexture) {
                        appearance.propTotal[prop.id].textures = propTotal
                        prop.texture = 0
                    }
                    appearance.props[prop.id] = prop;
                    return appearance;
                });

                methods.isPropFetching = false;
            });
        },

        isDrawableFetching: false,
        setDrawable: async (drawable: TDrawables[keyof TDrawables], value: number, isTexture?: boolean) => {
            if (methods.isDrawableFetching) return;
            methods.isDrawableFetching = true;

            if (isTexture) drawable.texture = value
            else drawable.value = value

            SendEvent(Send.setDrawable, {
                value: drawable.value,
                index: drawable.index,
                texture: drawable.texture,
                isTexture: isTexture
            }).then((drawableTotal: number) => {
                store.update(appearance => {
                    if (!isTexture) {
                        appearance.drawTotal[drawable.id].textures = drawableTotal
                        drawable.texture = 0
                    }
                    appearance.drawables[drawable.id] = drawable
                    return appearance;
                });
                methods.isDrawableFetching = false;
            });
        },
    };

    return {
        ...store,
        ...methods,
    };
};

export const APPEARANCE = APPEARANCE_INIT();

const TOGGLES_INIT = () => {
    const store: Writable<TToggles> = writable<TToggles>({
        hat: true,
        mask: true,
        glasses: true,
        shirt: true,
        jacket: true,
        vest: true,
        pants: true,
        shoes: true,
    });

    const methods = {
        get: () => get(store),

        isToggling: false,

        toggle: (
            item: string,
            toggle: boolean,
            data: TDrawables[keyof TDrawables] | TProps[keyof TProps],
        ) => {
            if (methods.isToggling) {
                return;
            }

            methods.isToggling = true;

            SendEvent(Send.toggleItem, { item, toggle, data }).then(
                (state: boolean) => {
                    store.update(toggles => {
                        toggles[item] = state;
                        return toggles;
                    });

                    methods.isToggling = false;
                },
            );
        },
    };

    return {
        ...store,
        ...methods,
    };
};

export const TOGGLES = TOGGLES_INIT();
