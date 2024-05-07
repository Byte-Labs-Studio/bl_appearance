import { onClientCallback } from './utils';
import { oxmysql } from '@overextended/oxmysql';
import { Outfit } from '@typings/outfits';
import { saveAppearance } from './appearance';

onClientCallback('bl_appearance:server:getOutfits', async (src, frameworkId) => {
	let response = await oxmysql.prepare(
		'SELECT * FROM outfits WHERE player_id = ?',
		[frameworkId]
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

onClientCallback('bl_appearance:server:renameOutfit', async (src, frameworkId, data) => {
	const id = data.id;
	const label = data.label;

	console.log('renameOutfit', frameworkId, label, id);
	const result = await oxmysql.update(
		'UPDATE outfits SET label = ? WHERE player_id = ? AND id = ?',
		[label, frameworkId, id]
	);
	return result;
});

onClientCallback('bl_appearance:server:deleteOutfit', async (src, frameworkId, id) => {
    console.log('deleteOutfit', frameworkId, id);
	const result = await oxmysql.update(
		'DELETE FROM outfits WHERE player_id = ? AND id = ?',
		[frameworkId, id]
	);
    console.log('result', result);
	return result > 0;
});

onClientCallback('bl_appearance:server:saveOutfit', async (src, frameworkId, data: Outfit) => {
	console.log(
		frameworkId,
		data.label,
		data.outfit,
		JSON.stringify(data.outfit)
	);
	const id = await oxmysql.insert(
		'INSERT INTO outfits (player_id, label, outfit) VALUES (?, ?, ?)',
		[frameworkId, data.label, JSON.stringify(data.outfit)]
	);
	console.log('id', id);
	return id;
});

onClientCallback('bl_appearance:server:saveSkin', async (src, frameworkId, skin) => {
	const result = await oxmysql.update(
		'UPDATE appearance SET skin = ? WHERE id = ?',
		[JSON.stringify(skin), frameworkId]
	);
	return result;
});

onClientCallback('bl_appearance:server:saveClothes', async (src, frameworkId, clothes) => {
		const result = await oxmysql.update(
			'UPDATE appearance SET clothes = ? WHERE id = ?',
			[JSON.stringify(clothes), frameworkId]
		);
		return result;
	}
);

onClientCallback('bl_appearance:server:saveAppearance', saveAppearance);

onClientCallback('bl_appearance:server:saveTattoos', async (src, frameworkId, tattoos) => {
	const result = await oxmysql.update(
		'UPDATE appearance SET tattoos = ? WHERE id = ?',
		[JSON.stringify(tattoos), frameworkId]
	);
	return result;
});

onClientCallback('bl_appearance:server:getSkin', async (src, frameworkId) => {
	const response = await oxmysql.prepare(
		'SELECT skin FROM appearance WHERE id = ?',
		[frameworkId]
	);
	return JSON.parse(response);
});

onClientCallback('bl_appearance:server:getClothes', async (src, frameworkId) => {
	const response = await oxmysql.prepare(
		'SELECT clothes FROM appearance WHERE id = ?',
		[frameworkId]
	);
	return JSON.parse(response);
});

onClientCallback('bl_appearance:server:getTattoos', async (src, frameworkId) => {
	const response = await oxmysql.prepare(
		'SELECT tattoos FROM appearance WHERE id = ?',
		[frameworkId]
	);
	return JSON.parse(response) || [];
});

onClientCallback('bl_appearance:server:getAppearance', async (src, frameworkId) => {
	const response = await oxmysql.prepare(
		'SELECT * FROM appearance WHERE id = ?',
		[frameworkId]
	);
	return JSON.parse(response);
});

RegisterCommand('migrate', async (source: number) => {
	source = source !== 0 ? source : parseInt(getPlayers()[0])
	const bl_appearance = exports.bl_appearance;
	const config = bl_appearance.config();
	const importedModule = await import(`./migrate/${config.previousClothing === 'fivem-appearance' ? 'fivem' : config.previousClothing}.ts`)
	importedModule.default(source)
}, false)

oxmysql.ready(() => {
	oxmysql.query(`CREATE TABLE IF NOT EXISTS appearance (
		id varchar(100) NOT NULL,
		skin longtext DEFAULT NULL,
		clothes longtext DEFAULT NULL,
		tattoos  longtext DEFAULT NULL,
		PRIMARY KEY (id)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8;`)
	
	oxmysql.query(`CREATE TABLE IF NOT EXISTS outfits (
		id int NOT NULL AUTO_INCREMENT,
		player_id varchar(100) NOT NULL,
		label varchar(100) NOT NULL,
		outfit longtext DEFAULT NULL,
		PRIMARY KEY (id)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8;`)
})
