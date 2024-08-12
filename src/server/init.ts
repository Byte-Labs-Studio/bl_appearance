import './appearance/outfits';
import './appearance/setters';
import './appearance/getters';
import { oxmysql } from '@overextended/oxmysql';

oxmysql.ready(async () => {
    // see if there is a table called appearance
    try {
        await oxmysql.query('SELECT 1 FROM appearance LIMIT 1');
    } catch (error) {
        console.error('Error checking appearance table. Most likely the table does not exist.');
        // You can add additional error handling or recovery logic here if needed
    }
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
