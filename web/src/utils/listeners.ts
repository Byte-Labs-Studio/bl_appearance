import { Receive } from '@enums/events';
import type { DebugEventCallback } from '@typings/events';
import { ReceiveEvent } from './eventsHandlers';
import type { TMenuData } from '@typings/apperance';
import { configTabs } from '@components/micro/tabs';
import {
    APPEARANCE,
    BLACKLIST,
    MODELS,
    ORIGINAL_APPEARANCE,
    OUTFITS,
    SELECTED_TAB,
    TABS,
    TATTOOS,
    LOCALE
} from '@stores/appearance';
import { deepCopy } from './misc';

const AlwaysListened: DebugEventCallback[] = [
    {
        action: Receive.visible,
        handler: (data: string) => { },
    },
    {
        action: Receive.data,
        handler: (data: TMenuData) => {
            let tabs = [];

            if (data.locale) {
                LOCALE.set(JSON.parse(data.locale))
            }

            if (data.tabs) {
                if (!Array.isArray(data.tabs)) {
                    data.tabs = [data.tabs];
                }

                tabs = configTabs
                    .filter(tab => data.tabs.includes(tab.id))
                    .reverse();

                TABS.set(tabs);
                SELECTED_TAB.set(tabs[tabs.length - 1]);
            }

            if (data.appearance) {
                APPEARANCE.set(data.appearance);
                ORIGINAL_APPEARANCE.set(deepCopy(data.appearance));
            }

            if (data.blacklist) {
                // BLACKLIST.set(data.blacklist);
                BLACKLIST.set({
                    models: [
                        'mp_f_freemode_01',
                    ],
                    props: {
                        glasses: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        earrings: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        rhand: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        watches: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        hats: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        lhand: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        mouth: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        braclets: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                    },
                    drawables: {
                        jackets: {
                            textures: { 3: [2, 3] },
                            values: [5, 6],
                        },
                        torsos: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        bags: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        face: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        hair: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        decals: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        neck: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        shirts: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        legs: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        vest: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        masks: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                        shoes: {
                            textures: { 3: [2, 3] },
                            values: [4, 5, 6],
                        },
                    },
                });
            }

            if (data.tattoos) {
                TATTOOS.set(data.tattoos);
            }

            if (data.models) {
                MODELS.set(data.models);
            }

            if (data.outfits) {
                OUTFITS.set(data.outfits);
            }
        },
    },
];

export default AlwaysListened;

export function InitialiseListen() {
    for (const debug of AlwaysListened) {
        ReceiveEvent(debug.action, debug.handler);
    }
}
