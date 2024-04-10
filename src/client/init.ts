import { openMenu } from './menu'
import('./menu/appearance/handler')

RegisterCommand('openMenu', () => {
  openMenu('all')
}, false)