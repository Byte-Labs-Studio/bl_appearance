import { openMenu } from "./menu"

RegisterCommand('openMenu', () => {
    openMenu('appearance')  
    console.log('Menu opened')
  }, false)