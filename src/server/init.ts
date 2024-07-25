import { onClientCallback } from './utils';
import { oxmysql } from '@overextended/oxmysql';
import { Outfit } from '@typings/outfits';
import { saveAppearance } from './appearance';
import { SkinDB } from '@typings/appearance';

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

	const result = await oxmysql.update(
		'UPDATE outfits SET label = ? WHERE player_id = ? AND id = ?',
		[label, frameworkId, id]
	);
	return result;
});

onClientCallback('bl_appearance:server:deleteOutfit', async (src, frameworkId, id) => {
	const result = await oxmysql.update(
		'DELETE FROM outfits WHERE player_id = ? AND id = ?',
		[frameworkId, id]
	);
	return result > 0;
});

onClientCallback('bl_appearance:server:saveOutfit', async (src, frameworkId, data: Outfit) => {
	const id = await oxmysql.insert(
		'INSERT INTO outfits (player_id, label, outfit) VALUES (?, ?, ?)',
		[frameworkId, data.label, JSON.stringify(data.outfit)]
	);
	return id;
});

onClientCallback('bl_appearance:server:grabOutfit', async (src, id) => {
	const response = await oxmysql.prepare(
		'SELECT outfit FROM outfits WHERE id = ?',
		[id]
	);
	return JSON.parse(response);;
});

onClientCallback('bl_appearance:server:importOutfit', async (src, frameworkId, outfitId) => {
    const [result] = await oxmysql.query(
        'SELECT label, outfit FROM outfits WHERE id = ?',
        [outfitId]
    );

    if (!result) {
        return { success: false, message: 'Outfit not found' };
    }

    const newId = await oxmysql.insert(
        'INSERT INTO outfits (player_id, label, outfit) VALUES (?, ?, ?)',
        [frameworkId, `Imported Outfit ${outfitId}`, result.outfit]
    );

    return { success: true, id: newId };
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
	const response: SkinDB = await oxmysql.single(
		'SELECT * FROM appearance WHERE id = ? LIMIT 1',
		[frameworkId]
	);
	if (!response) return null;
	let appearance = {
		...JSON.parse(response.skin),
		...JSON.parse(response.clothes),
		...JSON.parse(response.tattoos),
	}
	appearance.id = response.id
	return appearance;
});

onNet('bl_appearance:server:setroutingbucket', () => {
	SetPlayerRoutingBucket(source.toString(), source)
});

onNet('bl_appearance:server:resetroutingbucket', () => {
	SetPlayerRoutingBucket(source.toString(), 0)
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
