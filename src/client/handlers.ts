import { Receive } from '@events';
import {
	resetToggles,
	setDrawable,
	setFaceFeature,
	setHeadBlend,
	setHeadOverlay,
	setModel,
	setPedClothes,
	setPedTattoos,
	setPlayerPedAppearance,
	setProp,
} from './appearance/setters';
import { closeMenu } from './menu';
import { TAppearance, TToggleData, TValue } from '@typings/appearance';
import { delay, getFrameworkID, triggerServerCallback, ped, updatePed, Delay } from '@utils';
import { getAppearance, getTattooData } from './appearance/getters';
import TOGGLE_INDEXES from '@data/toggles';
import { TOutfitData } from '@typings/outfits';
import { TTattoo } from '@typings/tattoos';

RegisterNuiCallback(Receive.cancel, async (appearance: TAppearance, cb: Function) => {
	await setPlayerPedAppearance(appearance);
	closeMenu();
	cb(1);
});

RegisterNuiCallback(Receive.save, async (appearance: TAppearance, cb: Function) => {
	resetToggles(appearance);

	await delay(100);

	const newAppearance = await getAppearance(ped);
	newAppearance.tattoos = appearance.tattoos || null
	triggerServerCallback('bl_appearance:server:saveAppearance', getFrameworkID(), newAppearance);

	setPedTattoos(ped, newAppearance.tattoos);

	closeMenu();
	cb(1);
});

RegisterNuiCallback(Receive.setModel, async (model: string, cb: Function) => {
	const hash = GetHashKey(model);
	if (!IsModelInCdimage(hash) || !IsModelValid(hash)) {
		return cb(0);
	}


	const newPed = await setModel(ped, hash);

    updatePed(newPed)

	const appearance = await getAppearance(ped);

	appearance.tattoos = [];

	setPedTattoos(ped, []);

	cb(appearance);
});

RegisterNuiCallback(Receive.getModelTattoos, async (_: any, cb: Function) => {
	const tattoos = getTattooData();

	cb(tattoos);
});

RegisterNuiCallback(Receive.setHeadStructure, async (data: TValue, cb: Function) => {
	setFaceFeature(ped, data);
	cb(1);
});

RegisterNuiCallback(Receive.setHeadOverlay, async (data: TValue, cb: Function) => {
	setHeadOverlay(ped, data);
	cb(1);
});

RegisterNuiCallback(Receive.setHeadBlend, async (data: TValue, cb: Function) => {
	setHeadBlend(ped, data);
	cb(1);
});

RegisterNuiCallback(Receive.setTattoos, async (data: TTattoo[], cb: Function) => {
	setPedTattoos(ped, data);
	cb(1);
});

RegisterNuiCallback(Receive.setProp, async (data: TValue, cb: Function) => {
	let texture = setProp(ped, data);
	cb(texture);
});

RegisterNuiCallback(Receive.setDrawable, async (data: TValue, cb: Function) => {
	let texture = setDrawable(ped, data);
	cb(texture);
});

RegisterNuiCallback(Receive.toggleItem, async (data: TToggleData, cb: Function) => {
	const item = TOGGLE_INDEXES[data.item];
	if (!item) return cb(false);

	const current = data.data;
	const type = item.type;
	const index = item.index;
	const hook = item.hook;
	const hookData = data.hookData;

	if (!current) return cb(false);

	if (type === 'prop') {
		const currentProp = GetPedPropIndex(ped, index);

		if (currentProp === -1) {
			setProp(ped, current);
			cb(false);
			return;
		} else {
			ClearPedProp(ped, index);
			cb(true);
			return;
		}
	} else if (type === 'drawable') {
		const currentDrawable = GetPedDrawableVariation(ped, index);

		if (current.value === item.off) {
			cb(false);
			return;
		}

		if (current.value === currentDrawable) {
			SetPedComponentVariation(ped, index, item.off, 0, 0);
			if (hook) {
				for(let i=0; i < hook.drawables?.length; i++) {
					const hookItem = hook.drawables[i];
					SetPedComponentVariation(ped, hookItem.component, hookItem.variant, hookItem.texture, 0);
				}
			}
			cb(true);
			return;
		} else {
			setDrawable(ped, current);
			for(let i=0; i < hookData?.length; i++) {
				setDrawable(ped, hookData[i]);
			}
			cb(false);
			return;
		}
	}
}
);

RegisterNuiCallback(Receive.saveOutfit, async (data: any, cb: Function) => {
	const result = await triggerServerCallback('bl_appearance:server:saveOutfit', data);
	cb(result);
});

RegisterNuiCallback(Receive.deleteOutfit, async ({id}, cb: Function) => {
	const result = await triggerServerCallback('bl_appearance:server:deleteOutfit', id);
	cb(result);
});

RegisterNuiCallback(Receive.renameOutfit, async (data: any, cb: Function) => {
	const result = await triggerServerCallback('bl_appearance:server:renameOutfit', data);
	cb(result);
});

RegisterNuiCallback(Receive.useOutfit, async (outfit: TOutfitData, cb: Function) => {
	setPedClothes(ped, outfit);
	cb(1);
});

RegisterNuiCallback(Receive.importOutfit, async ({ id, outfitName }, cb: Function) => {
	const frameworkdId = getFrameworkID();
	const result = await triggerServerCallback('bl_appearance:server:importOutfit', frameworkdId, id, outfitName);
	cb(result);
});

RegisterNuiCallback(Receive.fetchOutfit, async ({ id }, cb: Function) => {
	const result = await triggerServerCallback('bl_appearance:server:fetchOutfit', id);
	cb(result);
});

RegisterNuiCallback(Receive.itemOutfit, async (data: {outfit: TOutfitData, label: string}, cb: Function) => {
	const result = await triggerServerCallback('bl_appearance:server:itemOutfit', data);
	cb(result);
});

const animDict = 'missmic4'
const anim = 'michael_tux_fidget'

async function playOutfitEmote() {
    // while not HasAnimDictLoaded(e.Dict) do RequestAnimDict(e.Dict) Wait(100) end

    while (!HasAnimDictLoaded(animDict)) {
        RequestAnimDict(animDict);
        await Delay(100);
    }

    TaskPlayAnim(ped, animDict, anim, 3.0, 3.0, 1200, 51, 0.0, false, false, false);
}


onNet('bl_appearance:client:useOutfitItem', async (outfit: TOutfitData) => {
    await playOutfitEmote()
	setPedClothes(ped, outfit);
    triggerServerCallback('bl_appearance:server:saveClothes', getFrameworkID(), outfit)
})