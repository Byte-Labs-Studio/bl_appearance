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
checkDependency("bl_bridge", "1.2.5");
