import {onClientCallback} from './utils'
import { oxmysql } from '@overextended/oxmysql'

onNet('bl_appearance:server:saveAppearances', async (data: any) => {
  const src = source;
  const id = data.id ? data.id : GetPlayerIdentifierByType(src, 'license')

  const saveData = [JSON.stringify(data.skin), JSON.stringify(data.clothes), JSON.stringify(data.outfits), JSON.stringify(data.tattoos), id]

  const affectedRows = await oxmysql.update('UPDATE bl_appearance SET skin = ?, clothes = ?, outfits = ?, tattoos = ? WHERE id = ?', saveData)
  console.log(affectedRows)
  if (affectedRows === 0) oxmysql.insert('INSERT INTO `bl_appearance` (skin, clothes, outfits, tattoos, id) VALUES (?, ?, ?, ?, ?)', saveData, (id) => {
      console.log(id)
  })
})

onClientCallback('bl_appearance:server:getTattoos', async (playerId, id: number | string) => {
  const response = await oxmysql.prepare('SELECT `tattoos` FROM `bl_appearance` WHERE `id` = ?', [id])
  return JSON.parse(response)
});