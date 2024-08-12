import { oxmysql } from '@overextended/oxmysql';
import { triggerClientCallback } from '../utils';
import { TAppearance } from '@typings/appearance';
import { saveAppearance } from '../appearance/setters';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const migrate = async (src: string) => {
    const response: any = await oxmysql.query('SELECT * FROM `playerskins` WHERE active = 1');
    if (!response) return;

    for (const element of response) {
        emitNet('qb-clothes:loadSkin', src, 0, element.model, element.skin);
        await delay(200);
        const response = await triggerClientCallback('bl_appearance:client:getAppearance', src) as TAppearance
        const playerSrc = parseInt(src)
        await saveAppearance(playerSrc, element.citizenid, response as TAppearance)
    }
    console.log('Converted '+ response.length + ' appearances')
};

export default migrate