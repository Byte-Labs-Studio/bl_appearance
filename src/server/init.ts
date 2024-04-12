import {onClientCallback} from './utils'

on('onResourceStart', (resName: string) => {
    if (resName === GetCurrentResourceName()) {
      console.log('TypeScript boilerplate started!')
    }
})

onClientCallback('test:server', (playerId, ...args: [number, null, number, null, null, number]) => {
  console.log('onClientCallback', playerId, ...args);
  return {
    serverValue: 3000,
  };
});