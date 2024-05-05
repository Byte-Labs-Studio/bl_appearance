import { TAppearance } from '@typings/appearance';
import { oxmysql } from '@overextended/oxmysql';

export const saveAppearance = async (src: string | number, frameworkId: string, appearance: TAppearance) => {
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