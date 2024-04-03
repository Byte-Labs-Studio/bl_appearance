import type { TAppearance, TBlacklist, TModels, TOutfit, TTab, TTattoo, TZoneTattoo } from '@typings/apperance';
import { type Writable, writable } from 'svelte/store';

export const TABS: Writable<TTab[]> = writable<TTab[]>([]);

export const SELECTED_TAB: Writable<TTab> = writable<TTab>(null);

export const IS_VALID: Writable<boolean> = writable<boolean>(true);

export const APPEARANCE: Writable<TAppearance> = writable<TAppearance>(null);

export const ORIGINAL_APPEARANCE: Writable<TAppearance> = writable<TAppearance>(null);

export const BLACKLIST: Writable<TBlacklist> = writable<TBlacklist>(null);

export const TATTOOS: Writable<TZoneTattoo[]> = writable<TZoneTattoo[]>([]);

export const MODELS: Writable<TModels> = writable<TModels>(null);

export const OUTFITS: Writable<TOutfit[]> = writable<TOutfit[]>(null);