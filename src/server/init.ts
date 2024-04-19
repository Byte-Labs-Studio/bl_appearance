import { onClientCallback } from './utils';
import { oxmysql } from '@overextended/oxmysql';
import { Outfit } from '@typings/outfits';

onClientCallback(
	'bl_appearance:server:getOutfits',
	async (src, frameworkdId) => {
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
	}
);

onClientCallback(
	'bl_appearance:server:renameOutfit',
	async (src, frameworkdId, data) => {
		const id = data.id;
		const label = data.label;

		console.log('renameOutfit', frameworkdId, label, id);
		const result = await oxmysql.update(
			'UPDATE outfits SET label = ? WHERE player_id = ? AND id = ?',
			[label, frameworkdId, id]
		);
		return result;
	}
);

onClientCallback(
	'bl_appearance:server:deleteOutfit',
	async (src, frameworkdId, id) => {
		const result = await oxmysql.update(
			'DELETE FROM outfits WHERE player_id = ? AND id = ?',
			[frameworkdId, id]
		);
		return result > 0;
	}
);

onClientCallback(
	'bl_appearance:server:saveOutfit',
	async (src, frameworkdId, data: Outfit) => {
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
	async (src, frameworkdId, skin) => {
		const result = await oxmysql.update(
			'UPDATE appearance SET skin = ? WHERE id = ?',
			[JSON.stringify(skin), frameworkdId]
		);
		return result;
	}
);

onClientCallback(
	'bl_appearance:server:saveClothes',
	async (src, frameworkdId, clothes) => {
		const result = await oxmysql.update(
			'UPDATE appearance SET clothes = ? WHERE id = ?',
			[JSON.stringify(clothes), frameworkdId]
		);
		return result;
	}
);

onClientCallback(
	'bl_appearance:server:saveAppearance',
	async (src, frameworkdId, appearance) => {
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
			[
				JSON.stringify(clothes),
				JSON.stringify(skin),
				JSON.stringify(tattoos),
				frameworkdId,
			]
		);

		return result;
	}
);

onClientCallback(
	'bl_appearance:server:saveTattoos',
	async (src, frameworkdId, tattoos) => {
		const result = await oxmysql.update(
			'UPDATE appearance SET tattoos = ? WHERE id = ?',
			[JSON.stringify(tattoos), frameworkdId]
		);
		return result;
	}
);

onClientCallback('bl_appearance:server:getSkin', async (src, frameworkdId) => {
	const response = await oxmysql.prepare(
		'SELECT skin FROM appearance WHERE id = ?',
		[frameworkdId]
	);
	return JSON.parse(response);
});

onClientCallback(
	'bl_appearance:server:getClothes',
	async (src, frameworkdId) => {
		const response = await oxmysql.prepare(
			'SELECT clothes FROM appearance WHERE id = ?',
			[frameworkdId]
		);
		return JSON.parse(response);
	}
);

onClientCallback(
	'bl_appearance:server:getTattoos',
	async (src, frameworkdId) => {
		const response = await oxmysql.prepare(
			'SELECT tattoos FROM appearance WHERE id = ?',
			[frameworkdId]
		);
		return JSON.parse(response) || [];
	}
);

onClientCallback(
	'bl_appearance:server:getAppearance',
	async (src, frameworkdId) => {
		const response = await oxmysql.prepare(
			'SELECT * FROM appearance WHERE id = ?',
			[frameworkdId]
		);
		return JSON.parse(response);
	}
);

const bl_appearance = exports.bl_appearance;
const config = bl_appearance.config();
if (config.backwardsCompatibility) {
	onClientCallback(
		'bl_appearance:server:PreviousGetAppearance',
		async (src, frameworkdId) => {
			let query;
			if (config.previousClothing == 'illenium') {
				query = 'SELECT * FROM players WHERE citizenid = ?';
			} else if (config.previousClothing == 'qb') {
				query =
					'SELECT * FROM playerskins WHERE citizenid = ? AND active = ?';
			}

			const response = await oxmysql.prepare(query, [frameworkdId, 1]);
			return JSON.parse(response);
		}
	);
}
