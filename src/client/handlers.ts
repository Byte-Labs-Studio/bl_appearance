import { Receive } from '@events';
import {
	resetToggles,
	setDrawable,
	SetFaceFeature,
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
import { delay, getFrameworkID, triggerServerCallback } from '@utils';
import { getAppearance, getTattooData } from './appearance/getters';
import TOGGLE_INDEXES from '@data/toggles';
import { Outfit } from '@typings/outfits';

RegisterNuiCallback(Receive.cancel, (appearance: TAppearance, cb: Function) => {
	setPlayerPedAppearance(appearance);
	closeMenu();
	cb(1);
});

RegisterNuiCallback(
	Receive.save,
	async (appearance: TAppearance, cb: Function) => {
        console.log('save')
		resetToggles(appearance);

		await delay(100);

		const ped = PlayerPedId();

		const newAppearance = await getAppearance(ped);

		const frameworkdId = getFrameworkID();

		triggerServerCallback(
			'bl_appearance:server:setAppearance',
			frameworkdId,
			newAppearance
		);

		setPedTattoos(ped, appearance.tattoos);

		closeMenu();
		cb(1);
	}
);

RegisterNuiCallback(Receive.setModel, async (model: string, cb: Function) => {
	const hash = GetHashKey(model);
	if (!IsModelInCdimage(hash) || !IsModelValid(hash)) {
		return cb(0);
	}

	const ped = PlayerPedId();

	await setModel(ped, hash);

	const appearance = await getAppearance(ped);

	appearance.tattoos = [];

	cb(appearance);
});

RegisterNuiCallback(Receive.getModelTattoos, async (_: any, cb: Function) => {
	const tattoos = getTattooData();

	cb(tattoos);
});

RegisterNuiCallback(
	Receive.setHeadStructure,
	async (data: TValue, cb: Function) => {
		const ped = PlayerPedId();
		SetFaceFeature(ped, data);
		cb(1);
	}
);

RegisterNuiCallback(
	Receive.setHeadOverlay,
	async (data: TValue, cb: Function) => {
		const ped = PlayerPedId();
		setHeadOverlay(ped, data);
		cb(1);
	}
);

RegisterNuiCallback(
	Receive.setHeadBlend,
	async (data: TValue, cb: Function) => {
		const ped = PlayerPedId();
		setHeadBlend(ped, data);
		cb(1);
	}
);

RegisterNuiCallback(Receive.setTattoos, async (data: TValue, cb: Function) => {
	const ped = PlayerPedId();
	setPedTattoos(ped, data);
	cb(1);
});

RegisterNuiCallback(Receive.setProp, async (data: TValue, cb: Function) => {
	const ped = PlayerPedId();
	setProp(ped, data);
	cb(1);
});

RegisterNuiCallback(Receive.setDrawable, async (data: TValue, cb: Function) => {
	const ped = PlayerPedId();
	setDrawable(ped, data);
	cb(1);
});

RegisterNuiCallback(
	Receive.toggleItem,
	async (data: TToggleData, cb: Function) => {
        const item = TOGGLE_INDEXES[data.item];
		if (!item) return cb(false);

		const current = data.data;
		const type = item.type;
		const index = item.index;

		if (!current) return cb(false);

		const ped = PlayerPedId();

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
                cb(true);
                return;
            } else {
                setDrawable(ped, current);
                cb(false);
                return;
            }
        }
	}
);

RegisterNuiCallback(Receive.saveOutfit, async (data: any, cb: Function) => {
    const frameworkdId = getFrameworkID();
    const result = await triggerServerCallback(
        'bl_appearance:server:saveOutfit',
        frameworkdId,
        data
    );
    cb(result);
});

RegisterNuiCallback(Receive.deleteOutfit, async (id: string, cb: Function) => {
    const frameworkdId = getFrameworkID();
    const result = await triggerServerCallback(
        'bl_appearance:server:deleteOutfit',
        frameworkdId,
        id
    );
    cb(result);
});

RegisterNuiCallback(Receive.renameOutfit, async (data: any, cb: Function) => {
    const frameworkdId = getFrameworkID();
    const result = await triggerServerCallback(
        'bl_appearance:server:renameOutfit',
        frameworkdId,
        data
    );
    cb(result);
});

RegisterNuiCallback(Receive.useOutfit, async (outfit: Outfit, cb: Function) => {
    console.log('useOutfit', outfit);
    setPedClothes(PlayerPedId(), outfit);
    cb(1);
});