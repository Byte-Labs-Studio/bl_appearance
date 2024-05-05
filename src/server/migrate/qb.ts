import { oxmysql } from '@overextended/oxmysql';
import { triggerClientCallback } from '../utils';
import { saveAppearance } from '../appearance';
import { TAppearance } from '@typings/appearance';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const migrate = async (src: string) => {
    const response: any = await oxmysql.query('SELECT * FROM `playerskins` WHERE active = 1');
    if (!response) return;

    for (const element of response) {
        emitNet('qb-clothes:loadSkin', src, 0, element.model, element.skin);
        await delay(200);
        const response = await triggerClientCallback('bl_appearance:client:getAppearance', src) as TAppearance
        await saveAppearance(src, element.citizenid, response)
    }
    console.log('Converted '+ response.length + ' appearances')
};

export default migrate