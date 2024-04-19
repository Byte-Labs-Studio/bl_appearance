import { onClientCallback } from './utils';
import { oxmysql } from '@overextended/oxmysql';
import { Outfit } from '@typings/outfits';

onClientCallback('bl_appearance:server:getOutfits', async (frameworkdId) => {
    console.log('frameworkdId', frameworkdId);
	let response = await oxmysql.prepare(
		'SELECT * FROM outfits WHERE player_id = ?',
		[frameworkdId]
	);
	if (!response) return [];

	if (!Array.isArray(response)) {
		response = [response];
	}

	const outfits = response.map(
		(outfit: { id: number; label: string; outfit: string }) => {
			return {
				id: outfit.id,
				label: outfit.label,
				outfit: JSON.parse(outfit.outfit),
			};
		}
	);

	return outfits;
});

onClientCallback(
	'bl_appearance:server:renameOutfit',
	async (frameworkdId, newName, id) => {
		const result = await oxmysql.update(
			'UPDATE outfits SET label = ? WHERE player_id = ? AND id = ?',
			[newName, frameworkdId, id]
		);
		return result;
	}
);

onClientCallback(
	'bl_appearance:server:deleteOutfit',
	async (frameworkdId, id) => {
		const result = await oxmysql.update(
			'DELETE FROM outfits WHERE player_id = ? AND id = ?',
			[frameworkdId, id]
		);
		return result > 0;
	}
);

onClientCallback(
	'bl_appearance:server:saveOutfit',
	async (frameworkdId, data: Outfit) => {
		console.log(
			frameworkdId,
			data.label,
			data.outfit,
			JSON.stringify(data.outfit)
		);
		const id = await oxmysql.insert(
			'INSERT INTO outfits (player_id, label, outfit) VALUES (?, ?, ?)',
			[frameworkdId, data.label, JSON.stringify(data.outfit)]
		);
		console.log('id', id);
		return id;
	}
);

onClientCallback(
	'bl_appearance:server:saveSkin',
	async (frameworkdId, skin) => {
		const result = await oxmysql.update(
			'UPDATE appearance SET skin = ? WHERE id = ?',
			[JSON.stringify(skin), frameworkdId]
		);
		return result;
	}
);

onClientCallback(
	'bl_appearance:server:saveClothes',
	async (frameworkdId, clothes) => {
		const result = await oxmysql.update(
			'UPDATE appearance SET clothes = ? WHERE id = ?',
			[JSON.stringify(clothes), frameworkdId]
		);
		return result;
	}
);

onClientCallback(
	'bl_appearance:server:saveAppearance',
	async (frameworkdId, appearance) => {
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

		const result = await oxmysql.update(
			'UPDATE appearance SET clothes = ?, SET skin = ?, SET tattoos = ? WHERE id = ?',
			[JSON.stringify(clothes), JSON.stringify(skin), JSON.stringify(tattoos), frameworkdId]
		);

		return result;
	}
);

onClientCallback(
	'bl_appearance:server:saveTattoos',
	async (frameworkdId, tattoos) => {
		const result = await oxmysql.update(
			'UPDATE appearance SET tattoos = ? WHERE id = ?',
			[JSON.stringify(tattoos), frameworkdId]
		);
		return result;
	}
);

onClientCallback('bl_appearance:server:getSkin', async (frameworkdId) => {
	const response = await oxmysql.prepare(
		'SELECT skin FROM appearance WHERE id = ?',
		[frameworkdId]
	);
	return JSON.parse(response);
});

onClientCallback('bl_appearance:server:getClothes', async (frameworkdId) => {
	const response = await oxmysql.prepare(
		'SELECT clothes FROM appearance WHERE id = ?',
		[frameworkdId]
	);
	return JSON.parse(response);
});

onClientCallback('bl_appearance:server:getTattoos', async (frameworkdId) => {
	const response = await oxmysql.prepare(
		'SELECT tattoos FROM appearance WHERE id = ?',
		[frameworkdId]
	);
	return JSON.parse(response) || [];
});

onClientCallback('bl_appearance:server:getAppearance', async (frameworkdId) => {
	const response = await oxmysql.prepare(
		'SELECT * FROM appearance WHERE id = ?',
		[frameworkdId]
	);
	return JSON.parse(response);
});
