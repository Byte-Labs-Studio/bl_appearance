import { openMenu } from './menu'
import { triggerServerCallback } from '@utils'
import('./menu/appearance/handler')
import('./menu/outfits')

RegisterCommand('openMenu', () => {
  openMenu('all')
}, false)

setTimeout(async () => {
  const args = [1, null, 3, null, null, 6];
  const response = await triggerServerCallback<{ serverValue: number }>('test:server', 1, args);
  if (!response) return;
}, 100);