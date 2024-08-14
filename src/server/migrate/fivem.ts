import { oxmysql } from '@overextended/oxmysql';
import { triggerClientCallback } from '../utils';
import { TAppearance } from '@typings/appearance';
import { saveAppearance } from '../appearance/setters';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const migrate = async (src: string) => {
    const response: any = await oxmysql.query('SELECT * FROM `players`');
    if (!response) return;

    for (const element of response) {
        if (element.skin) {
            await triggerClientCallback('bl_appearance:client:migration:setAppearance', src, {
                type: 'fivem',
                data: JSON.parse(element.skin)
            }) as TAppearance
            await delay(100);
            const response = await triggerClientCallback('bl_appearance:client:getAppearance', src) as TAppearance
            const playerSrc = parseInt(src)
            await saveAppearance(playerSrc, element.citizenid, response as TAppearance, true)
        }
    }
    console.log('Converted '+ response.length + ' appearances')
};

export default migrate