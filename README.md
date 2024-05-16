# BL APPEARANCE

Need https://github.com/Z3rio/fivem-builders so it can be ignored by fivem yarn

# Installation Guide

- Requires bl_bridge
  - Convars need set for [bl_bridge](https://github.com/Byte-Labs-Studio/bl_bridge) in the server cfg, these can be found on the bl_bridge readme
- Add fivem-builders as per bl_appearance documentation above
  - Replace all of contents within `[builders]` with what you downloaded from `fivem-builders` Relative path: (`resources\[cfx-default]\[system]\[builders]`)
- To install, from the main parent directory of `bl_appearance` run:
  - `pnpm install && pnpm build` - This will also go into /src and build this.
- To build the `/web` directory, you can `cd web/` and do `npm i` then `npm run build`
- To test it on a browser or in-game on the local Vite address, comment out the dev URL for `ui_page` and comment the normal `ui_page` within the `fxmanifest.lua`
- You can then run `npm run dev` either from `web/` or `pnpm dev` (The latter will also run Vite)
