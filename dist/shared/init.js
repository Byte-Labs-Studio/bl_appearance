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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3NoYXJlZC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJmdW5jdGlvbiBjaGVja0RlcGVuZGVuY3kocmVzb3VyY2U6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nKSB7XG4gICAgbGV0IGN1cnJlbnRWZXJzaW9uID0gR2V0UmVzb3VyY2VNZXRhZGF0YShyZXNvdXJjZSwgJ3ZlcnNpb24nLCAwKVxuICAgIGN1cnJlbnRWZXJzaW9uID0gY3VycmVudFZlcnNpb24gJiYgY3VycmVudFZlcnNpb24/Lm1hdGNoKC9cXGQrXFwuXFxkK1xcLlxcZCsvKT8uWzBdIHx8ICd1bmtub3duJ1xuXG5cdGlmIChjdXJyZW50VmVyc2lvbiAhPSB2ZXJzaW9uKSB7XG5cdFx0Y29uc3QgY3YgPSBjdXJyZW50VmVyc2lvbi5zcGxpdCgnLicpO1xuICAgICAgICBjb25zdCBtdiA9IHZlcnNpb24uc3BsaXQoJy4nKTtcblx0XHRjb25zdCBtc2cgPSBgXjEke0dldEludm9raW5nUmVzb3VyY2UoKSB8fCBHZXRDdXJyZW50UmVzb3VyY2VOYW1lKCl9IHJlcXVpcmVzIHZlcnNpb24gJyR7dmVyc2lvbn0nIG9mICcke3Jlc291cmNlfScgKGN1cnJlbnQgdmVyc2lvbjogJHtjdXJyZW50VmVyc2lvbn0pXjBgO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGN2Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gTnVtYmVyKGN2W2ldKTtcbiAgICAgICAgICAgIGNvbnN0IG1pbmltdW0gPSBOdW1iZXIobXZbaV0pO1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudCAhPT0gbWluaW11bSkge1xuICAgICAgICAgICAgICAgIGlmIChpc05hTihjdXJyZW50KSB8fCBjdXJyZW50IDwgbWluaW11bSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2hlY2tEZXBlbmRlbmN5KCdibF9icmlkZ2UnLCAnMS4yLjUnKTsiXSwKICAibWFwcGluZ3MiOiAiOzs7O0FBQUEsU0FBUyxnQkFBZ0IsVUFBa0IsU0FBaUI7QUFDeEQsTUFBSSxpQkFBaUIsb0JBQW9CLFVBQVUsV0FBVyxDQUFDO0FBQy9ELG1CQUFpQixrQkFBa0IsZ0JBQWdCLE1BQU0sZUFBZSxJQUFJLENBQUMsS0FBSztBQUVyRixNQUFJLGtCQUFrQixTQUFTO0FBQzlCLFVBQU0sS0FBSyxlQUFlLE1BQU0sR0FBRztBQUM3QixVQUFNLEtBQUssUUFBUSxNQUFNLEdBQUc7QUFDbEMsVUFBTSxNQUFNLEtBQUssb0JBQW9CLEtBQUssdUJBQXVCLENBQUMsc0JBQXNCLE9BQU8sU0FBUyxRQUFRLHVCQUF1QixjQUFjO0FBQy9JLGFBQVMsSUFBSSxHQUFHLElBQUksR0FBRyxRQUFRLEtBQUs7QUFDaEMsWUFBTSxVQUFVLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDNUIsWUFBTSxVQUFVLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFFNUIsVUFBSSxZQUFZLFNBQVM7QUFDckIsWUFBSSxNQUFNLE9BQU8sS0FBSyxVQUFVLFNBQVM7QUFDckMsa0JBQVEsTUFBTSxHQUFHO0FBQ2pCO0FBQUEsUUFDSixPQUFPO0FBQ0g7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0o7QUF0QlM7QUF3QlQsZ0JBQWdCLGFBQWEsT0FBTzsiLAogICJuYW1lcyI6IFtdCn0K
