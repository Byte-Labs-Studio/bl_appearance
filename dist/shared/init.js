var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/shared/init.ts
function checkDependency(resource, version) {
  let currentVersion = GetResourceMetadata(resource, "version", 0);
  currentVersion = currentVersion && currentVersion?.match(/\d+\.\d+\.\d+/)?.[0] || "unknown";
  if (currentVersion != version) {
    const cv = currentVersion.split(".");
    const mv = version.split(".");
    const msg = `^1${GetInvokingResource() || GetCurrentResourceName()} requires version '${version}' of '${resource}' (current version: ${currentVersion})^0`;
    for (let i = 0; i < cv.length; i++) {
      const current = Number(cv[i]);
      const minimum = Number(mv[i]);
      if (current !== minimum) {
        if (isNaN(current) || current < minimum) {
          console.error(msg);
          break;
        } else {
          break;
        }
      }
    }
  }
}
__name(checkDependency, "checkDependency");
checkDependency("bl_bridge", "1.2.5");
var HideHud = /* @__PURE__ */ __name((state) => {
  if (state == null)
    return;
}, "HideHud");
HideHud();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3NoYXJlZC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJmdW5jdGlvbiBjaGVja0RlcGVuZGVuY3kocmVzb3VyY2U6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nKSB7XG4gICAgbGV0IGN1cnJlbnRWZXJzaW9uID0gR2V0UmVzb3VyY2VNZXRhZGF0YShyZXNvdXJjZSwgJ3ZlcnNpb24nLCAwKVxuICAgIGN1cnJlbnRWZXJzaW9uID0gY3VycmVudFZlcnNpb24gJiYgY3VycmVudFZlcnNpb24/Lm1hdGNoKC9cXGQrXFwuXFxkK1xcLlxcZCsvKT8uWzBdIHx8ICd1bmtub3duJ1xuXG5cdGlmIChjdXJyZW50VmVyc2lvbiAhPSB2ZXJzaW9uKSB7XG5cdFx0Y29uc3QgY3YgPSBjdXJyZW50VmVyc2lvbi5zcGxpdCgnLicpO1xuICAgICAgICBjb25zdCBtdiA9IHZlcnNpb24uc3BsaXQoJy4nKTtcblx0XHRjb25zdCBtc2cgPSBgXjEke0dldEludm9raW5nUmVzb3VyY2UoKSB8fCBHZXRDdXJyZW50UmVzb3VyY2VOYW1lKCl9IHJlcXVpcmVzIHZlcnNpb24gJyR7dmVyc2lvbn0nIG9mICcke3Jlc291cmNlfScgKGN1cnJlbnQgdmVyc2lvbjogJHtjdXJyZW50VmVyc2lvbn0pXjBgO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGN2Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gTnVtYmVyKGN2W2ldKTtcbiAgICAgICAgICAgIGNvbnN0IG1pbmltdW0gPSBOdW1iZXIobXZbaV0pO1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudCAhPT0gbWluaW11bSkge1xuICAgICAgICAgICAgICAgIGlmIChpc05hTihjdXJyZW50KSB8fCBjdXJyZW50IDwgbWluaW11bSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2hlY2tEZXBlbmRlbmN5KCdibF9icmlkZ2UnLCAnMS4yLjUnKTtcblxuY29uc3QgSGlkZUh1ZCA9IChzdGF0ZT86IGJvb2xlYW4pID0+IHtcbiAgICBpZiAoc3RhdGU9PW51bGwpIHJldHVybjtcbn1cblxuSGlkZUh1ZCgpOyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7QUFBQSxTQUFTLGdCQUFnQixVQUFrQixTQUFpQjtBQUN4RCxNQUFJLGlCQUFpQixvQkFBb0IsVUFBVSxXQUFXLENBQUM7QUFDL0QsbUJBQWlCLGtCQUFrQixnQkFBZ0IsTUFBTSxlQUFlLElBQUksQ0FBQyxLQUFLO0FBRXJGLE1BQUksa0JBQWtCLFNBQVM7QUFDOUIsVUFBTSxLQUFLLGVBQWUsTUFBTSxHQUFHO0FBQzdCLFVBQU0sS0FBSyxRQUFRLE1BQU0sR0FBRztBQUNsQyxVQUFNLE1BQU0sS0FBSyxvQkFBb0IsS0FBSyx1QkFBdUIsQ0FBQyxzQkFBc0IsT0FBTyxTQUFTLFFBQVEsdUJBQXVCLGNBQWM7QUFDL0ksYUFBUyxJQUFJLEdBQUcsSUFBSSxHQUFHLFFBQVEsS0FBSztBQUNoQyxZQUFNLFVBQVUsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUM1QixZQUFNLFVBQVUsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUU1QixVQUFJLFlBQVksU0FBUztBQUNyQixZQUFJLE1BQU0sT0FBTyxLQUFLLFVBQVUsU0FBUztBQUNyQyxrQkFBUSxNQUFNLEdBQUc7QUFDakI7QUFBQSxRQUNKLE9BQU87QUFDSDtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFDSjtBQXRCUztBQXdCVCxnQkFBZ0IsYUFBYSxPQUFPO0FBRXBDLElBQU0sVUFBVSx3QkFBQyxVQUFvQjtBQUNqQyxNQUFJLFNBQU87QUFBTTtBQUNyQixHQUZnQjtBQUloQixRQUFROyIsCiAgIm5hbWVzIjogW10KfQo=
