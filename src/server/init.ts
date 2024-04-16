import {onClientCallback} from './utils'
import { oxmysql } from '@overextended/oxmysql'
import { Outfit } from '@dataTypes/outfits';

onNet('bl_appearance:server:saveAppearances', async (data: any) => {
  const src = source;
  const id = data.id ? data.id : GetPlayerIdentifierByType(src, 'license')

  const saveData = [JSON.stringify(data.skin), JSON.stringify(data.clothes), JSON.stringify(data.tattoos), id]

  const affectedRows = await oxmysql.update('UPDATE bl_appearance SET skin = ?, clothes = ?, tattoos = ? WHERE id = ?', saveData)
  if (affectedRows === 0) oxmysql.insert('INSERT INTO `bl_appearance` (skin, clothes, tattoos, id) VALUES (?, ?, ?, ?)', saveData, (id) => {
    console.log(id)
  })
})

onNet('bl_appearance:server:saveOutfit', async (data: Outfit) => {
  try {
    const src = source;
    const id = data.id || GetPlayerIdentifierByType(src, 'license');

    let outfitsJson = await oxmysql.scalar('SELECT `outfits` FROM `bl_appearance` WHERE `id` = ? LIMIT 1', [id]) as string;

    let outfits: Outfit[] = outfitsJson ? JSON.parse(outfitsJson) : [];

    outfits.push({ label: data.label, outfit: data.outfit });

    outfitsJson = JSON.stringify(outfits);

    const affectedRows = await oxmysql.update('UPDATE bl_appearance SET outfits = ? WHERE id = ?', [outfitsJson, id]);

    if (affectedRows === 0) {
      const newId = await oxmysql.insert('INSERT INTO `bl_appearance` (outfits, id) VALUES (?, ?)', [outfitsJson, id]);
      console.log('Inserted new record with ID:', newId);
    }
  } catch (error) {
    console.error('Error saving outfit:', error);
  }
});

onClientCallback('bl_appearance:server:getTattoos&Outfits', async (playerId, id: number | string) => {
  const response = await oxmysql.prepare('SELECT `tattoos`, `outfits` FROM `bl_appearance` WHERE `id` = ?', [id])
  return {
    tattoos: JSON.parse(response.tattoos),
    outfits: JSON.parse(response.outfits)
  }
});
