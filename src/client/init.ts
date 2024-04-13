import { openMenu } from './menu'
import { triggerServerCallback, locale } from '@utils'
import('./menu/appearance/handler')

RegisterCommand('openMenu', () => {
  openMenu('all')
}, false)

setTimeout(async () => {
  const args = [1, null, 3, null, null, 6];
  const response = await triggerServerCallback<{ serverValue: number }>('test:server', 1, args);
  if (!response) return;
}, 100);

// function Export_GetPedHeadBlendData() {
//     var arr = new Uint32Array(new ArrayBuffer(10 * 8)); // int, int, int, int, int, int, float, float, float, bool
//     Citizen.invokeNative("0x2746BD9D88C5C5D0", PlayerPedId(), arr);
//     return JSON.stringify(arr);
// }

// RegisterCommand('head', () => {
//     // const data = Export_GetPedHeadBlendData()
//     // console.log(data)
// }, false)


// (async () => {
//   console.log(await locale('my_name_is', 'hamze'))
// })();