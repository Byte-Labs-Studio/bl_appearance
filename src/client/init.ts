import { openMenu } from './menu'
import('./menu/appearance/handler')

RegisterCommand('openMenu', () => {
  openMenu('all')
}, false)

// function Export_GetPedHeadBlendData() {
//     var arr = new Uint32Array(new ArrayBuffer(10 * 8)); // int, int, int, int, int, int, float, float, float, bool
//     Citizen.invokeNative("0x2746BD9D88C5C5D0", PlayerPedId(), arr);
//     return JSON.stringify(arr);
// }

// RegisterCommand('head', () => {
//     // const data = Export_GetPedHeadBlendData()
//     // console.log(data)
// }, false)