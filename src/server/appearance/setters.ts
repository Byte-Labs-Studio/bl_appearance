import { TAppearance, TClothes, TSkin } from '@typings/appearance';
import { getFrameworkID, onClientCallback, } from '../utils';
import { oxmysql } from '@overextended/oxmysql';
import { TTattoo } from '@typings/tattoos';

export async function saveSkin(src: number, skin: TSkin) {
    const frameworkId = getFrameworkID(src);

    const result = await oxmysql.update(
        'UPDATE appearance SET skin = ? WHERE id = ?',
        [JSON.stringify(skin), frameworkId]
    );
    return result;
}
onClientCallback('bl_appearance:server:saveSkin', saveSkin);
exports('SaveSkin', saveSkin);

export async function saveClothes(src: number, clothes: TClothes) {
    const frameworkId = getFrameworkID(src);

    const result = await oxmysql.update(
        'UPDATE appearance SET clothes = ? WHERE id = ?',
        [JSON.stringify(clothes), frameworkId]
    );
    return result;
}
onClientCallback('bl_appearance:server:saveClothes', saveClothes);
exports('SaveClothes', saveClothes);

export async function saveTattoos(src: number, tattoos: TTattoo[]) {
    const frameworkId = getFrameworkID(src);
    
    const result = await oxmysql.update(
        'UPDATE appearance SET tattoos = ? WHERE id = ?',
        [JSON.stringify(tattoos), frameworkId]
    );
    return result;
}
onClientCallback('bl_appearance:server:saveTattoos', saveTattoos);
exports('SaveTattoos', saveTattoos);


export async function saveAppearance(src: number, frameworkId: string, appearance: TAppearance) {
    if (src && frameworkId) {
        const playerId = getFrameworkID(src);
        
        if (frameworkId !== playerId) {
            console.warn('You are trying to save an appearance for a different player', src, frameworkId);
            return;
        }
    }

	if (!frameworkId) {
		frameworkId = getFrameworkID(src);
	}

	const clothes = {
		drawables: appearance.drawables,
		props: appearance.props,
		headOverlay: appearance.headOverlay,
	};

	const skin = {
		headBlend: appearance.headBlend,
		headStructure: appearance.headStructure,
		hairColor: appearance.hairColor,
		model: appearance.model,
	};

	const tattoos = appearance.tattoos || [];

	const result = await oxmysql.prepare(
		'INSERT INTO appearance (id, clothes, skin, tattoos) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE clothes = VALUES(clothes), skin = VALUES(skin), tattoos = VALUES(tattoos);',
		[
			frameworkId,
			JSON.stringify(clothes),
			JSON.stringify(skin),
			JSON.stringify(tattoos),
		]
	);

	return result;
}
onClientCallback('bl_appearance:server:saveAppearance', saveAppearance);
exports('SaveAppearance', function(id, appearance) {
    return saveAppearance(null, id, appearance)
});
