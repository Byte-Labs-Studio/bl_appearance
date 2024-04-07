var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// client/utils.ts
var ped = 0;
var isMenuOpen = false;
var menuTypes = ["heritage", "hair", "clothes", "accessories", "face", "makeup", "outfits", "tattoos"];
function sendNUIEvent(action, data) {
  SendNUIMessage({
    action,
    data
  });
}
__name(sendNUIEvent, "sendNUIEvent");
function openMenu(type) {
  isMenuOpen = true;
  sendNUIEvent("appearance:visible" /* visible */, true);
  SetNuiFocus(true, true);
  const all = type === "all";
  if (!all && !menuTypes.includes(type)) {
    return console.error("Error: menu type not found");
  }
  sendNUIEvent("appearance:data" /* data */, {
    tabs: all ? menuTypes : [type]
  });
  const tickFunction = setTick(async () => {
    while (isMenuOpen) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      ped = PlayerPedId();
    }
    clearTick(tickFunction);
  });
}
__name(openMenu, "openMenu");

// client/init.ts
RegisterCommand("openMenu", () => {
  openMenu("all");
}, false);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vY2xpZW50L3V0aWxzLnRzIiwgIi4uLy4uL2NsaWVudC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQge3NlbmR9IGZyb20gJy4vZW51bXMnXHJcblxyXG5leHBvcnQgbGV0IHBlZCA9IDBcclxuZXhwb3J0IGxldCBpc01lbnVPcGVuID0gZmFsc2VcclxuZXhwb3J0IGNvbnN0IG1lbnVUeXBlcyA9IFsnaGVyaXRhZ2UnLCAnaGFpcicsICdjbG90aGVzJywgJ2FjY2Vzc29yaWVzJywgJ2ZhY2UnLCAnbWFrZXVwJywgJ291dGZpdHMnLCAndGF0dG9vcyddXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2VuZE5VSUV2ZW50KGFjdGlvbjogc3RyaW5nLCBkYXRhOiBhbnkpIHtcclxuICAgIFNlbmROVUlNZXNzYWdlKHtcclxuICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlTWVudShzYXZlOiBib29sZWFuKSB7XHJcbiAgICBpc01lbnVPcGVuID0gZmFsc2VcclxuICAgIFNldE51aUZvY3VzKGZhbHNlLCBmYWxzZSlcclxuICAgIHNlbmROVUlFdmVudChzZW5kLnZpc2libGUsIGZhbHNlKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb3Blbk1lbnUodHlwZTogc3RyaW5nKSB7XHJcbiAgICBpc01lbnVPcGVuID0gdHJ1ZVxyXG4gICAgc2VuZE5VSUV2ZW50KHNlbmQudmlzaWJsZSwgdHJ1ZSlcclxuICAgIFNldE51aUZvY3VzKHRydWUsIHRydWUpXHJcbiAgICBjb25zdCBhbGwgPSB0eXBlID09PSAnYWxsJ1xyXG5cclxuICAgIGlmICghYWxsICYmICFtZW51VHlwZXMuaW5jbHVkZXModHlwZSkpIHtcclxuICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcignRXJyb3I6IG1lbnUgdHlwZSBub3QgZm91bmQnKTtcclxuICAgIH1cclxuICAgIHNlbmROVUlFdmVudChzZW5kLmRhdGEsIHtcclxuICAgICAgdGFiczogYWxsID8gbWVudVR5cGVzIDogW3R5cGVdXHJcbiAgICB9KVxyXG5cclxuICAgIGNvbnN0IHRpY2tGdW5jdGlvbiA9IHNldFRpY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIHdoaWxlIChpc01lbnVPcGVuKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxMDAwKSk7XHJcbiAgICAgICAgICAgIHBlZCA9IFBsYXllclBlZElkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjbGVhclRpY2sodGlja0Z1bmN0aW9uKTtcclxuICAgIH0pO1xyXG59IiwgImltcG9ydCB7b3Blbk1lbnV9IGZyb20gJy4vdXRpbHMnXHJcblxyXG5SZWdpc3RlckNvbW1hbmQoJ29wZW5NZW51JywgKCkgPT4ge1xyXG4gIG9wZW5NZW51KCdhbGwnKVxyXG59LCBmYWxzZSkiXSwKICAibWFwcGluZ3MiOiAiOzs7O0FBRU8sSUFBSSxNQUFNO0FBQ1YsSUFBSSxhQUFhO0FBQ2pCLElBQU0sWUFBWSxDQUFDLFlBQVksUUFBUSxXQUFXLGVBQWUsUUFBUSxVQUFVLFdBQVcsU0FBUztBQUV2RyxTQUFTLGFBQWEsUUFBZ0IsTUFBVztBQUNwRCxpQkFBZTtBQUFBLElBQ1g7QUFBQSxJQUNBO0FBQUEsRUFDSixDQUFDO0FBQ0w7QUFMZ0I7QUFhVCxTQUFTLFNBQVMsTUFBYztBQUNuQyxlQUFhO0FBQ2IsbURBQTJCLElBQUk7QUFDL0IsY0FBWSxNQUFNLElBQUk7QUFDdEIsUUFBTSxNQUFNLFNBQVM7QUFFckIsTUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLFNBQVMsSUFBSSxHQUFHO0FBQ25DLFdBQU8sUUFBUSxNQUFNLDRCQUE0QjtBQUFBLEVBQ3JEO0FBQ0EsNkNBQXdCO0FBQUEsSUFDdEIsTUFBTSxNQUFNLFlBQVksQ0FBQyxJQUFJO0FBQUEsRUFDL0IsQ0FBQztBQUVELFFBQU0sZUFBZSxRQUFRLFlBQVk7QUFDckMsV0FBTyxZQUFZO0FBQ2YsWUFBTSxJQUFJLFFBQVEsYUFBVyxXQUFXLFNBQVMsR0FBSSxDQUFDO0FBQ3RELFlBQU0sWUFBWTtBQUFBLElBQ3RCO0FBRUEsY0FBVSxZQUFZO0FBQUEsRUFDMUIsQ0FBQztBQUNMO0FBckJnQjs7O0FDakJoQixnQkFBZ0IsWUFBWSxNQUFNO0FBQ2hDLFdBQVMsS0FBSztBQUNoQixHQUFHLEtBQUs7IiwKICAibmFtZXMiOiBbXQp9Cg==
