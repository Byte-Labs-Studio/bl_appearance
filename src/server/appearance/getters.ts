import { oxmysql } from "@overextended/oxmysql";
import { getFrameworkID, onClientCallback } from "../utils";
import { SkinDB } from "@typings/appearance";

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
