import { core, getFrameworkID, onClientCallback, config, getPlayerData } from './utils';
import { oxmysql } from '@overextended/oxmysql';
import { Outfit } from '@typings/outfits';
import { SkinDB, TAppearance } from '@typings/appearance';

async function getOutfits(src: number, frameworkId: string) {
    const job = core.GetPlayer(src).job || { name: 'unknown', grade: { name: 'unknown' } }
	let response = await oxmysql.prepare(
		'SELECT * FROM outfits WHERE player_id = ? OR (jobname = ? AND jobrank <= ?)',
		[frameworkId, job.name, job.grade.name]
	);
	if (!response) return [];

    if (!Array.isArray(response)) {
        response = [response];
    }

    const outfits = response.map(
        (outfit: { id: number; label: string; outfit: string; jobname?: string }) => {
            return {
                id: outfit.id,
                label: outfit.label,
                outfit: JSON.parse(outfit.outfit),
                jobname: outfit.jobname,
            };
        }
    );

    return outfits;
}
onClientCallback('bl_appearance:server:getOutfits', getOutfits);
exports('GetOutfits', getOutfits);

async function renameOutfit(src: number, data: { id: number; label: string }) {
    const frameworkId = getFrameworkID(src);
    const result = await oxmysql.update(
        'UPDATE outfits SET label = ? WHERE player_id = ? AND id = ?',
        [data.label, frameworkId, data.id]
    );
    return result;
}
onClientCallback('bl_appearance:server:renameOutfit', renameOutfit);
exports('RenameOutfit', renameOutfit);

async function deleteOutfit(src: number, id: number) {
    const frameworkId = getFrameworkID(src);
    const result = await oxmysql.update(
        'DELETE FROM outfits WHERE player_id = ? AND id = ?',
        [frameworkId, id]
    );
    return result > 0;
}
onClientCallback('bl_appearance:server:deleteOutfit', deleteOutfit);
exports('DeleteOutfit', deleteOutfit);

async function saveOutfit(src: number, data: Outfit) {
    const frameworkId = getFrameworkID(src);
    let jobname = null;
    let jobrank = 0;
    if (data.job) {
        jobname = data.job.name;
        jobrank = data.job.rank;
    }
    const id = await oxmysql.insert(
        'INSERT INTO outfits (player_id, label, outfit, jobname, jobrank) VALUES (?, ?, ?, ?, ?)',
        [frameworkId, data.label, JSON.stringify(data.outfit), jobname, jobrank]
    );
    return id;
}
onClientCallback('bl_appearance:server:saveOutfit', saveOutfit);
exports('SaveOutfit', saveOutfit);


async function fetchOutfit(_: number, id: number) {
    const response = await oxmysql.prepare(
        'SELECT outfit FROM outfits WHERE id = ?',
        [id]
    );
    return JSON.parse(response);
}
onClientCallback('bl_appearance:server:fetchOutfit', fetchOutfit);
exports('FetchOutfit', fetchOutfit);

async function importOutfit(_: number, frameworkId: string, outfitId: number, outfitName: string) {
    const result = await oxmysql.query(
        'SELECT label, outfit FROM outfits WHERE id = ?',
        [outfitId]
    );

    if (!result || typeof result !== 'object' || Object.keys(result).length === 0) {
        return { success: false, message: 'Outfit not found' };
    }

    const newId = await oxmysql.insert(
        'INSERT INTO outfits (player_id, label, outfit) VALUES (?, ?, ?)',
        [frameworkId, outfitName, result.outfit]
    );

    return { success: true, newId: newId };
}
onClientCallback('bl_appearance:server:importOutfit', importOutfit);
exports('ImportOutfit', importOutfit);

async function saveSkin(src: number, skin: any) {
    const frameworkId = getFrameworkID(src);

    const result = await oxmysql.update(
        'UPDATE appearance SET skin = ? WHERE id = ?',
        [JSON.stringify(skin), frameworkId]
    );
    return result;
}
onClientCallback('bl_appearance:server:saveSkin', saveSkin);
exports('SaveSkin', saveSkin);

async function saveClothes(src: number, clothes: any) {
    const frameworkId = getFrameworkID(src);

    const result = await oxmysql.update(
        'UPDATE appearance SET clothes = ? WHERE id = ?',
        [JSON.stringify(clothes), frameworkId]
    );
    return result;
}
onClientCallback('bl_appearance:server:saveClothes', saveClothes);
exports('SaveClothes', saveClothes);

async function saveTattoos(src: number, tattoos: any) {
    const frameworkId = getFrameworkID(src);
    
    const result = await oxmysql.update(
        'UPDATE appearance SET tattoos = ? WHERE id = ?',
        [JSON.stringify(tattoos), frameworkId]
    );
    return result;
}
onClientCallback('bl_appearance:server:saveTattoos', saveTattoos);
exports('SaveTattoos', saveTattoos);

async function getSkin(src: number, frameworkId: string) {
    if (!frameworkId) {
        frameworkId = getFrameworkID(src);
    }

    const response = await oxmysql.prepare(
        'SELECT skin FROM appearance WHERE id = ?',
        [frameworkId]
    );
    return JSON.parse(response);
}
onClientCallback('bl_appearance:server:getSkin', getSkin);
exports('GetSkin', function(id) {
    return getSkin(null, id)
});

export const saveAppearance = async (src: number, frameworkId: string, appearance: TAppearance) => {
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

async function getClothes(src: number, frameworkId: string) {
    if (!frameworkId) {
        frameworkId = getFrameworkID(src);
    }

    const response = await oxmysql.prepare(
        'SELECT clothes FROM appearance WHERE id = ?',
        [frameworkId]
    );
    return JSON.parse(response);
}
onClientCallback('bl_appearance:server:getClothes', getClothes);
exports('GetClothes', function(id) {
    return getClothes(null, id)
});

async function getTattoos(src: number, frameworkId: string) {
    if (!frameworkId) {
        frameworkId = getFrameworkID(src);
    }

    const response = await oxmysql.prepare(
        'SELECT tattoos FROM appearance WHERE id = ?',
        [frameworkId]
    );
    return JSON.parse(response) || [];
}
onClientCallback('bl_appearance:server:getTattoos', getTattoos);
exports('GetTattoos', function(id) {
    return getTattoos(null, id)
});

async function getAppearance(src: number, frameworkId: string) {
    if (!frameworkId && !src) return null;
    
    if (!frameworkId) {
        frameworkId = getFrameworkID(src);
    }

    const response: SkinDB = await oxmysql.single(
        'SELECT * FROM appearance WHERE id = ? LIMIT 1',
        [frameworkId]
    );

    if (!response) return null;
    let appearance = {
        ...JSON.parse(response.skin),
        ...JSON.parse(response.clothes),
        tattoos: JSON.parse(response.tattoos),
    }
    appearance.id = response.id
    return appearance;
}
onClientCallback('bl_appearance:server:getAppearance', getAppearance);
exports('GetAppearance', function(id) {
    return getAppearance(null, id)
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
}, false);

const outfitItem = config.outfitItem

if (!outfitItem) {
    console.warn('bl_appearance: No outfit item configured, please set it in config.lua')
}

onClientCallback('bl_appearance:server:itemOutfit', async (src, data) => {
	const player = core.GetPlayer(src)
	player.addItem(outfitItem, 1, data)
});

core.RegisterUsableItem(outfitItem, async (source: number, slot: number, metadata: {outfit: Outfit, label: string}) => {
	const player = getPlayerData(source)
	if (player?.removeItem(outfitItem, 1, slot)) 
		emitNet('bl_appearance:server:useOutfitItem', source, metadata.outfit)
})