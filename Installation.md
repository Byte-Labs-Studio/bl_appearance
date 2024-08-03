## BL APPEARANCE

### Dependencies
- [`bl_bridge`](https://github.com/Byte-Labs-Studio/bl_bridge)
- [`bl_sprites`](https://github.com/Byte-Labs-Studio/bl_sprites)

### Installation Steps

1. **Download the `fivem-builders`**
   - [`fivem-builders`](https://github.com/Z3rio/fivem-builders)
   - Replace the contents of the `[builders]` directory with the downloaded files from `fivem-builders`.
     - **Relative Path:** `resources\[cfx-default]\[system]\[builders]`
2. **Download And Install All The Dependencies**
--------------------------------
 ## **For QBCore**
   - **Remove** the older appearance/clothing system and related dependencies from your scripts.
   - Update the server-side code:
     - **Modify** the SQL query in the `qb-multiCharacter` resource:
     - Open `Server/main.lua` around line 199.
     - Change:
       ```lua
       local result = MySQL.query.await('SELECT * FROM playerskins WHERE citizenid = ? AND active = ?', {cid, 1})
       ```
       To:
       ```lua
       local result = MySQL.query.await('SELECT * FROM appearance WHERE id = ?', {cid})
       ```
   - **Update** the client-side code:
     - Open `client/main.lua` around line 45.
     - Change:
       ```lua
       local function initializePedModel(model, data)
        CreateThread(function()
       if not model then
           model = joaat(randommodels[math.random(#randommodels)])
       end
       loadModel(model)
       charPed = CreatePed(2, model, Config.PedCoords.x, Config.PedCoords.y, Config.PedCoords.z - 0.98, Config.PedCoords.w, false, true)
       SetPedComponentVariation(charPed, 0, 0, 0, 2)
       FreezeEntityPosition(charPed, false)
       SetEntityInvincible(charPed, true)
       PlaceObjectOnGroundProperly(charPed)
       SetBlockingOfNonTemporaryEvents(charPed, true)
       if data then
           TriggerEvent('qb-clothing:client:loadPlayerClothing', data, charPed)
          end
         end)
       end
       ```
       To:
       ```lua
       local function initializePedModel(model, data)
        CreateThread(function()
       if not model then
           model = joaat(randommodels[math.random(#randommodels)])
       end
       loadModel(model)
       charPed = CreatePed(2, model, Config.PedCoords.x, Config.PedCoords.y, Config.PedCoords.z - 0.98, Config.PedCoords.w, false, true)
       SetPedComponentVariation(charPed, 0, 0, 0, 2)
       FreezeEntityPosition(charPed, false)
       SetEntityInvincible(charPed, true)
       PlaceObjectOnGroundProperly(charPed)
       SetBlockingOfNonTemporaryEvents(charPed, true)
       exports['bl_appearance']:SetPedAppearance(charPed, data)
       if data then
           TriggerEvent('qb-clothing:client:loadPlayerClothing', data, charPed)
          end
         end)
       end
       ```
-------------------
 ## **For ESX**
   - **Installation Completed**

### Additional Tips
- **Backup Files**: Before replacing or modifying files, make sure to backup your current setup to avoid accidental data loss.
- **Test Thoroughly**: After installation, test the functionality thoroughly to ensure everything works as expected with the new appearance system.
- **Check Compatibility**: Verify that all related scripts and dependencies are compatible with the new `bl_appearance` system to prevent conflicts.
