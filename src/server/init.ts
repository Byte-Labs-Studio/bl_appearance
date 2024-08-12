import './appearance/outfits';
import './appearance/setters';
import './appearance/getters';

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
