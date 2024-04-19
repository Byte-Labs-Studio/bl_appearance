import { onClientCallback } from './utils';
import { oxmysql } from '@overextended/oxmysql';
import { Outfit } from '@dataTypes/outfits';
import { captureRejectionSymbol } from 'events';

onClientCallback('bl_appearance:server:getOutfits', async (frameworkdId) => {
	let response = await oxmysql.prepare(
		'SELECT * FROM outfits WHERE player_id = ?',
		[frameworkdId]
	);
	if (!response) return [];

    if (!Array.isArray(response)) {
        response = [response]
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
        // console.log('here')
        // console.log('renameOutfit', frameworkdId, newName, id)
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
		const id = await oxmysql.insert(
			'INSERT INTO outfits (player_id, label, outfit) VALUES (?, ?, ?)',
			[frameworkdId, data.label, JSON.stringify(data.outfit)]
		);
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
	'bl_appearance:server:saveTattoos',
	async (frameworkdId, tattoos) => {
		const result = await oxmysql.update(
			'UPDATE appearance SET tattoos = ? WHERE id = ?',
			[JSON.stringify(tattoos), frameworkdId]
		);
		return result;
	}
);

// lib.callback.register("xrp_appearance:cb:getClothes", function(source, charid)
//     local result = MySQL.query.await('SELECT clothes FROM players WHERE citizenid = ?', { charid })
//     local clothes = json.decode(result[1].clothes)

//     return clothes
// end)

// lib.callback.register("xrp_appearance:cb:getSkin", function(source, charid)
//     local result = MySQL.query.await('SELECT skin FROM players WHERE citizenid = ?', { charid })
//     local skin = json.decode(result[1].skin) or {}

//     return skin
// end)

// lib.callback.register('xrp_appearance:cb:getTattoos', function(source)
//     local charid = QBCore.Functions.GetPlayer(source).PlayerData.citizenid

//     local result = MySQL.query.await('SELECT tattoos FROM players WHERE citizenid = ?', { charid })
//     local tattoos = json.decode(result[1].tattoos)

//     return tattoos
// end)

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
