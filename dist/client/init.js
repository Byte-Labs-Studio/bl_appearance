var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/client/utils/index.ts
var ped = 0;
var updatePed = /* @__PURE__ */ __name((pedHandle) => {
  ped = pedHandle;
}, "updatePed");
var sendNUIEvent = /* @__PURE__ */ __name((action, data) => {
  SendNUIMessage({
    action,
    data
  });
}, "sendNUIEvent");
var delay = /* @__PURE__ */ __name((ms) => new Promise((res) => setTimeout(res, ms)), "delay");
var requestModel = /* @__PURE__ */ __name(async (model) => {
  let modelHash = typeof model === "number" ? model : GetHashKey(model);
  if (!IsModelValid(modelHash)) {
    exports.bl_bridge.notify()({
      title: "Invalid model!",
      type: "error",
      duration: 1e3
    });
    throw new Error(`attempted to load invalid model '${model}'`);
  }
  if (HasModelLoaded(modelHash))
    return modelHash;
  RequestModel(modelHash);
  const waitForModelLoaded = /* @__PURE__ */ __name(() => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (HasModelLoaded(modelHash)) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }, "waitForModelLoaded");
  await waitForModelLoaded();
  return modelHash;
}, "requestModel");
var resourceName = GetCurrentResourceName();
var eventTimers = {};
var activeEvents = {};
function eventTimer(eventName, delay3) {
  if (delay3 && delay3 > 0) {
    const currentTime = GetGameTimer();
    if ((eventTimers[eventName] || 0) > currentTime)
      return false;
    eventTimers[eventName] = currentTime + delay3;
  }
  return true;
}
__name(eventTimer, "eventTimer");
onNet(`__ox_cb_${resourceName}`, (key, ...args) => {
  const resolve = activeEvents[key];
  return resolve && resolve(...args);
});
function triggerServerCallback(eventName, ...args) {
  if (!eventTimer(eventName, 0)) {
    return;
  }
  let key;
  do {
    key = `${eventName}:${Math.floor(Math.random() * (1e5 + 1))}`;
  } while (activeEvents[key]);
  emitNet(`__ox_cb_${eventName}`, resourceName, key, ...args);
  return new Promise((resolve) => {
    activeEvents[key] = resolve;
  });
}
__name(triggerServerCallback, "triggerServerCallback");
function onServerCallback(eventName, cb) {
  onNet(`__ox_cb_${eventName}`, async (resource, key, ...args) => {
    let response;
    try {
      response = await cb(...args);
    } catch (e) {
      console.error(`an error occurred while handling callback event ${eventName}`);
      console.log(`^3${e.stack}^0`);
    }
    emitNet(`__ox_cb_${resource}`, key, response);
  });
}
__name(onServerCallback, "onServerCallback");
var requestLocale = /* @__PURE__ */ __name((resourceSetName) => {
  return new Promise((resolve) => {
    const checkResourceFile = /* @__PURE__ */ __name(() => {
      if (RequestResourceFileSet(resourceSetName)) {
        const currentLan = exports.bl_appearance.config().locale;
        let localeFileContent = LoadResourceFile(resourceName, `locale/${currentLan}.json`);
        if (!localeFileContent) {
          console.error(`${currentLan}.json not found in locale, please verify!, we used english for now!`);
          localeFileContent = LoadResourceFile(resourceName, `locale/en.json`);
        }
        resolve(localeFileContent);
      } else {
        setTimeout(checkResourceFile, 100);
      }
    }, "checkResourceFile");
    checkResourceFile();
  });
}, "requestLocale");
var bl_bridge = exports.bl_bridge;
var getPlayerData = /* @__PURE__ */ __name(() => {
  return bl_bridge.core().getPlayerData();
}, "getPlayerData");
var getFrameworkID = /* @__PURE__ */ __name(() => {
  const id = getPlayerData().cid;
  return id;
}, "getFrameworkID");
function Delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
__name(Delay, "Delay");
function format(str) {
  if (!str.includes("'"))
    return str;
  return str.replace(/'/g, "");
}
__name(format, "format");
function getJobInfo() {
  const job = getPlayerData().job;
  return { name: job.name, isBoss: job.isBoss };
}
__name(getJobInfo, "getJobInfo");

// src/client/camera.ts
var WHOLE_BODY_MAX_DISTANCE = 2;
var DEFAULT_MAX_DISTANCE = 1;
var running = false;
var camDistance = 1.8;
var cam = null;
var angleY = 0;
var angleZ = 0;
var targetCoords = null;
var oldCam = null;
var changingCam = false;
var currentBone = "head";
var CameraBones = {
  whole: 0,
  head: 31086,
  torso: 24818,
  legs: [16335, 46078],
  shoes: [14201, 52301]
};
var cos = /* @__PURE__ */ __name((degrees) => {
  return Math.cos(degrees * Math.PI / 180);
}, "cos");
var sin = /* @__PURE__ */ __name((degrees) => {
  return Math.sin(degrees * Math.PI / 180);
}, "sin");
var getAngles = /* @__PURE__ */ __name(() => {
  const x = (cos(angleZ) * cos(angleY) + cos(angleY) * cos(angleZ)) / 2 * camDistance;
  const y = (sin(angleZ) * cos(angleY) + cos(angleY) * sin(angleZ)) / 2 * camDistance;
  const z = sin(angleY) * camDistance;
  return [x, y, z];
}, "getAngles");
var setCamPosition = /* @__PURE__ */ __name((mouseX, mouseY) => {
  if (!running || !targetCoords || changingCam)
    return;
  mouseX = mouseX ?? 0;
  mouseY = mouseY ?? 0;
  angleZ -= mouseX;
  angleY += mouseY;
  const isHeadOrWhole = currentBone === "whole" || currentBone === "head";
  const maxAngle = isHeadOrWhole ? 89 : 70;
  const isShoes = currentBone === "shoes";
  const minAngle = isShoes ? 5 : -20;
  angleY = Math.min(Math.max(angleY, minAngle), maxAngle);
  const [x, y, z] = getAngles();
  SetCamCoord(
    cam,
    targetCoords.x + x,
    targetCoords.y + y,
    targetCoords.z + z
  );
  PointCamAtCoord(cam, targetCoords.x, targetCoords.y, targetCoords.z);
}, "setCamPosition");
var moveCamera = /* @__PURE__ */ __name(async (coords, distance) => {
  const heading = GetEntityHeading(ped) + 94;
  distance = distance ?? 1;
  changingCam = true;
  camDistance = distance;
  angleZ = heading;
  const [x, y, z] = getAngles();
  const newcam = CreateCamWithParams(
    "DEFAULT_SCRIPTED_CAMERA",
    coords.x + x,
    coords.y + y,
    coords.z + z,
    0,
    0,
    0,
    70,
    false,
    0
  );
  targetCoords = coords;
  changingCam = false;
  oldCam = cam;
  cam = newcam;
  PointCamAtCoord(newcam, coords.x, coords.y, coords.z);
  SetCamActiveWithInterp(newcam, oldCam, 250, 0, 0);
  await delay(250);
  SetCamUseShallowDofMode(newcam, true);
  SetCamNearDof(newcam, 0.4);
  SetCamFarDof(newcam, 1.2);
  SetCamDofStrength(newcam, 0.3);
  useHiDof(newcam);
  DestroyCam(oldCam, true);
}, "moveCamera");
var useHiDof = /* @__PURE__ */ __name((currentcam) => {
  if (!(DoesCamExist(cam) && currentcam == cam))
    return;
  SetUseHiDof();
  setTimeout(useHiDof, 0);
}, "useHiDof");
var startCamera = /* @__PURE__ */ __name(() => {
  if (running)
    return;
  running = true;
  camDistance = WHOLE_BODY_MAX_DISTANCE;
  cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);
  const [x, y, z] = GetPedBoneCoords(ped, 31086, 0, 0, 0);
  SetCamCoord(cam, x, y, z);
  RenderScriptCams(true, true, 1e3, true, true);
  setCamera("whole", camDistance);
}, "startCamera");
var stopCamera = /* @__PURE__ */ __name(() => {
  if (!running)
    return;
  running = false;
  RenderScriptCams(false, true, 250, true, false);
  DestroyCam(cam, true);
  cam = null;
  targetCoords = null;
}, "stopCamera");
var setCamera = /* @__PURE__ */ __name((type, distance = camDistance) => {
  const bone = CameraBones[type];
  const isBoneArray = Array.isArray(bone);
  currentBone = type;
  if (!isBoneArray && bone === 0) {
    const [x2, y2, z2] = GetEntityCoords(ped, false);
    moveCamera(
      {
        x: x2,
        y: y2,
        z: z2 + 0
      },
      distance
    );
    return;
  }
  if (distance > DEFAULT_MAX_DISTANCE)
    distance = DEFAULT_MAX_DISTANCE;
  if (isBoneArray) {
    const [x1, y1, z1] = GetPedBoneCoords(ped, bone[0], 0, 0, 0);
    const [x2, y2, z2] = GetPedBoneCoords(ped, bone[1], 0, 0, 0);
    var x = (x1 + x2) / 2;
    var y = (y1 + y2) / 2;
    var z = (z1 + z2) / 2;
  } else {
    var [x, y, z] = GetPedBoneCoords(ped, bone, 0, 0, 0);
  }
  moveCamera(
    {
      x,
      y,
      z: z + 0
    },
    distance
  );
}, "setCamera");
RegisterNuiCallback("appearance:camMove" /* camMove */, (data, cb) => {
  setCamPosition(data.x, data.y);
  cb(1);
});
RegisterNuiCallback("appearance:camSection" /* camSection */, (type, cb) => {
  switch (type) {
    case "whole":
      setCamera("whole", WHOLE_BODY_MAX_DISTANCE);
      break;
    case "head":
      setCamera("head");
      break;
    case "torso":
      setCamera("torso");
      break;
    case "legs":
      setCamera("legs");
      break;
    case "shoes":
      setCamera("shoes");
      setCamPosition();
      break;
  }
  cb(1);
});
RegisterNuiCallback("appearance:camZoom" /* camZoom */, (data, cb) => {
  if (data === "down") {
    const maxZoom = currentBone === "whole" ? WHOLE_BODY_MAX_DISTANCE : DEFAULT_MAX_DISTANCE;
    const newDistance = camDistance + 0.05;
    camDistance = newDistance >= maxZoom ? maxZoom : newDistance;
  } else if (data === "up") {
    const newDistance = camDistance - 0.05;
    camDistance = newDistance <= 0.3 ? 0.3 : newDistance;
  }
  camDistance = camDistance;
  setCamPosition();
  cb(1);
});

// src/data/head.ts
var head_default = [
  "Blemishes",
  "FacialHair",
  "Eyebrows",
  "Ageing",
  "Makeup",
  "Blush",
  "Complexion",
  "SunDamage",
  "Lipstick",
  "MolesFreckles",
  "ChestHair",
  "BodyBlemishes",
  "AddBodyBlemishes",
  "EyeColor"
];

// src/data/face.ts
var face_default = [
  "Nose_Width",
  "Nose_Peak_Height",
  "Nose_Peak_Lenght",
  "Nose_Bone_Height",
  "Nose_Peak_Lowering",
  "Nose_Bone_Twist",
  "EyeBrown_Height",
  "EyeBrown_Forward",
  "Cheeks_Bone_High",
  "Cheeks_Bone_Width",
  "Cheeks_Width",
  "Eyes_Openning",
  "Lips_Thickness",
  "Jaw_Bone_Width",
  "Jaw_Bone_Back_Lenght",
  "Chin_Bone_Lowering",
  "Chin_Bone_Length",
  "Chin_Bone_Width",
  "Chin_Hole",
  "Neck_Thikness"
];

// src/data/drawables.ts
var drawables_default = [
  "face",
  "masks",
  "hair",
  "torsos",
  "legs",
  "bags",
  "shoes",
  "neck",
  "shirts",
  "vest",
  "decals",
  "jackets"
];

// src/data/props.ts
var props_default = [
  "hats",
  "glasses",
  "earrings",
  "mouth",
  "lhand",
  "rhand",
  "watches",
  "bracelets"
];

// src/client/appearance/getters.ts
function findModelIndex(target) {
  const config2 = exports.bl_appearance;
  const models = config2.models();
  return models.findIndex((model) => GetHashKey(model) === target);
}
__name(findModelIndex, "findModelIndex");
function getHair(pedHandle) {
  return {
    color: GetPedHairColor(pedHandle),
    highlight: GetPedHairHighlightColor(pedHandle)
  };
}
__name(getHair, "getHair");
function getHeadBlendData(pedHandle) {
  const buffer = new ArrayBuffer(80);
  global.Citizen.invokeNative("0x2746bd9d88c5c5d0", pedHandle, new Uint32Array(buffer));
  const { 0: shapeFirst, 2: shapeSecond, 4: shapeThird, 6: skinFirst, 8: skinSecond, 18: hasParent, 10: skinThird } = new Uint32Array(buffer);
  const { 0: shapeMix, 2: skinMix, 4: thirdMix } = new Float32Array(buffer, 48);
  return {
    shapeFirst,
    // father
    shapeSecond,
    // mother
    shapeThird,
    skinFirst,
    skinSecond,
    skinThird,
    shapeMix,
    // resemblance
    thirdMix,
    skinMix,
    // skinpercent
    hasParent: Boolean(hasParent)
  };
}
__name(getHeadBlendData, "getHeadBlendData");
function getHeadOverlay(pedHandle) {
  let totals = {};
  let headData = {};
  for (let i = 0; i < head_default.length; i++) {
    const overlay = head_default[i];
    totals[overlay] = GetNumHeadOverlayValues(i);
    if (overlay === "EyeColor") {
      headData[overlay] = {
        id: overlay,
        index: i,
        overlayValue: GetPedEyeColor(pedHandle)
      };
    } else {
      const [_, overlayValue, colourType, firstColor, secondColor, overlayOpacity] = GetPedHeadOverlayData(pedHandle, i);
      headData[overlay] = {
        id: overlay,
        index: i,
        overlayValue: overlayValue === 255 ? -1 : overlayValue,
        colourType,
        firstColor,
        secondColor,
        overlayOpacity
      };
    }
  }
  return [headData, totals];
}
__name(getHeadOverlay, "getHeadOverlay");
function getHeadStructure(pedHandle) {
  const pedModel = GetEntityModel(pedHandle);
  if (pedModel !== GetHashKey("mp_m_freemode_01") && pedModel !== GetHashKey("mp_f_freemode_01"))
    return;
  let faceStruct = {};
  for (let i = 0; i < face_default.length; i++) {
    const overlay = face_default[i];
    faceStruct[overlay] = {
      id: overlay,
      index: i,
      value: GetPedFaceFeature(pedHandle, i)
    };
  }
  return faceStruct;
}
__name(getHeadStructure, "getHeadStructure");
function getDrawables(pedHandle) {
  let drawables = {};
  let totalDrawables = {};
  for (let i = 0; i < drawables_default.length; i++) {
    const name = drawables_default[i];
    const current = GetPedDrawableVariation(pedHandle, i);
    totalDrawables[name] = {
      id: name,
      index: i,
      total: GetNumberOfPedDrawableVariations(pedHandle, i),
      textures: GetNumberOfPedTextureVariations(pedHandle, i, current)
    };
    drawables[name] = {
      id: name,
      index: i,
      value: GetPedDrawableVariation(pedHandle, i),
      texture: GetPedTextureVariation(pedHandle, i)
    };
  }
  return [drawables, totalDrawables];
}
__name(getDrawables, "getDrawables");
function getProps(pedHandle) {
  let props = {};
  let totalProps = {};
  for (let i = 0; i < props_default.length; i++) {
    const name = props_default[i];
    const current = GetPedPropIndex(pedHandle, i);
    totalProps[name] = {
      id: name,
      index: i,
      total: GetNumberOfPedPropDrawableVariations(pedHandle, i),
      textures: GetNumberOfPedPropTextureVariations(pedHandle, i, current)
    };
    props[name] = {
      id: name,
      index: i,
      value: GetPedPropIndex(pedHandle, i),
      texture: GetPedPropTextureIndex(pedHandle, i)
    };
  }
  return [props, totalProps];
}
__name(getProps, "getProps");
async function getAppearance(pedHandle) {
  const [headData, totals] = getHeadOverlay(pedHandle);
  const [drawables, drawTotal] = getDrawables(pedHandle);
  const [props, propTotal] = getProps(pedHandle);
  const model = GetEntityModel(pedHandle);
  return {
    modelIndex: findModelIndex(model),
    model,
    hairColor: getHair(pedHandle),
    headBlend: getHeadBlendData(pedHandle),
    headOverlay: headData,
    headOverlayTotal: totals,
    headStructure: getHeadStructure(pedHandle),
    drawables,
    props,
    drawTotal,
    propTotal,
    tattoos: []
  };
}
__name(getAppearance, "getAppearance");
exports("GetAppearance", getAppearance);
onServerCallback("bl_appearance:client:getAppearance", () => {
  return getAppearance(ped);
});
function getPedClothes(pedHandle) {
  const [drawables] = getDrawables(pedHandle);
  const [props] = getProps(pedHandle);
  const [headData] = getHeadOverlay(pedHandle);
  return {
    headOverlay: headData,
    drawables,
    props
  };
}
__name(getPedClothes, "getPedClothes");
exports("GetPedClothes", getPedClothes);
function getPedSkin(pedHandle) {
  return {
    headBlend: getHeadBlendData(pedHandle),
    headStructure: getHeadStructure(pedHandle),
    hairColor: getHair(pedHandle),
    model: GetEntityModel(pedHandle)
  };
}
__name(getPedSkin, "getPedSkin");
exports("GetPedSkin", getPedSkin);
function getTattooData() {
  let tattooZones = [];
  const [TATTOO_LIST, TATTOO_CATEGORIES] = exports.bl_appearance.tattoos();
  for (let i = 0; i < TATTOO_CATEGORIES.length; i++) {
    const category = TATTOO_CATEGORIES[i];
    const zone = category.zone;
    const label = category.label;
    const index = category.index;
    tattooZones[index] = {
      zone,
      label,
      zoneIndex: index,
      dlcs: []
    };
    for (let j = 0; j < TATTOO_LIST.length; j++) {
      const dlcData = TATTOO_LIST[j];
      tattooZones[index].dlcs.push({
        label: dlcData.dlc,
        dlcIndex: j,
        tattoos: []
      });
    }
  }
  const isFemale = GetEntityModel(ped) === GetHashKey("mp_f_freemode_01");
  for (let i = 0; i < TATTOO_LIST.length; i++) {
    const data = TATTOO_LIST[i];
    const { dlc, tattoos } = data;
    const dlcHash = GetHashKey(dlc);
    for (let j = 0; j < tattoos.length; j++) {
      const tattooData = tattoos[j];
      let tattoo = null;
      const lowerTattoo = tattooData.toLowerCase();
      const isFemaleTattoo = lowerTattoo.includes("_f");
      if (isFemaleTattoo && isFemale) {
        tattoo = tattooData;
      } else if (!isFemaleTattoo && !isFemale) {
        tattoo = tattooData;
      }
      let hash = null;
      let zone = -1;
      if (tattoo) {
        hash = GetHashKey(tattoo);
        zone = GetPedDecorationZoneFromHashes(dlcHash, hash);
      }
      if (zone !== -1 && hash) {
        const zoneTattoos = tattooZones[zone].dlcs[i].tattoos;
        zoneTattoos.push({
          label: tattoo,
          hash,
          zone,
          dlc
        });
      }
    }
  }
  return tattooZones;
}
__name(getTattooData, "getTattooData");
onServerCallback("bl_appearance:client:migration:setAppearance", (data) => {
  if (data.type === "fivem")
    exports["fivem-appearance"].setPlayerAppearance(data.data);
  if (data.type === "illenium")
    exports["illenium-appearance"].setPlayerAppearance(data.data);
});

// src/data/toggles.ts
var toggles_default = {
  hats: {
    type: "prop",
    index: 0
  },
  glasses: {
    type: "prop",
    index: 1
  },
  masks: {
    type: "drawable",
    index: 1,
    off: 0
  },
  shirts: {
    type: "drawable",
    index: 8,
    off: 15,
    hook: {
      drawables: [
        { component: 3, variant: 15, texture: 0, id: "torsos" },
        { component: 11, variant: 15, texture: 0, id: "jackets" }
      ]
    }
  },
  jackets: {
    type: "drawable",
    index: 11,
    off: 15,
    hook: {
      drawables: [
        { component: 3, variant: 15, texture: 0, id: "torsos" },
        { component: 8, variant: 15, texture: 0, id: "shirts" }
      ]
    }
  },
  legs: {
    type: "drawable",
    index: 4,
    off: 11
  },
  shoes: {
    type: "drawable",
    index: 6,
    off: 13
  }
};

// src/client/appearance/setters.ts
function setDrawable(pedHandle, data) {
  SetPedComponentVariation(pedHandle, data.index, data.value, data.texture, 0);
  return GetNumberOfPedTextureVariations(pedHandle, data.index, data.value);
}
__name(setDrawable, "setDrawable");
function setProp(pedHandle, data) {
  if (data.value === -1) {
    ClearPedProp(pedHandle, data.index);
    return;
  }
  SetPedPropIndex(pedHandle, data.index, data.value, data.texture, false);
  return GetNumberOfPedPropTextureVariations(pedHandle, data.index, data.value);
}
__name(setProp, "setProp");
var setModel = /* @__PURE__ */ __name(async (model) => {
  const modelHash = await requestModel(model);
  SetPlayerModel(PlayerId(), modelHash);
  SetModelAsNoLongerNeeded(modelHash);
  const pedHandle = PlayerPedId();
  updatePed(pedHandle);
  SetPedDefaultComponentVariation(pedHandle);
  if (modelHash === GetHashKey("mp_m_freemode_01"))
    SetPedHeadBlendData(ped, 0, 0, 0, 0, 0, 0, 0, 0, 0, false);
  else if (modelHash === GetHashKey("mp_f_freemode_01"))
    SetPedHeadBlendData(ped, 45, 21, 0, 20, 15, 0, 0.3, 0.1, 0, false);
}, "setModel");
function SetFaceFeature(pedHandle, data) {
  SetPedFaceFeature(pedHandle, data.index, data.value + 0);
}
__name(SetFaceFeature, "SetFaceFeature");
var isPositive = /* @__PURE__ */ __name((val) => val >= 0 ? val : 0, "isPositive");
function setHeadBlend(pedHandle, data) {
  const shapeFirst = isPositive(data.shapeFirst);
  const shapeSecond = isPositive(data.shapeSecond);
  const shapeThird = isPositive(data.shapeThird);
  const skinFirst = isPositive(data.skinFirst);
  const skinSecond = isPositive(data.skinSecond);
  const skinThird = isPositive(data.skinThird);
  const shapeMix = data.shapeMix + 0;
  const skinMix = data.skinMix + 0;
  const thirdMix = data.thirdMix + 0;
  const hasParent = data.hasParent;
  SetPedHeadBlendData(pedHandle, shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix, hasParent);
}
__name(setHeadBlend, "setHeadBlend");
function setHeadOverlay(pedHandle, data) {
  const index = data.index;
  if (index === 13) {
    SetPedEyeColor(pedHandle, data.value);
    return;
  }
  const value = data.overlayValue;
  if (data.id === "hairColor") {
    SetPedHairTint(pedHandle, data.hairColor, data.hairHighlight);
    return;
  }
  SetPedHeadOverlay(pedHandle, index, value, data.overlayOpacity + 0);
  SetPedHeadOverlayColor(pedHandle, index, 1, data.firstColor, data.secondColor);
}
__name(setHeadOverlay, "setHeadOverlay");
function resetToggles(data) {
  const drawables = data.drawables;
  const props = data.props;
  for (const [toggleItem, toggleData] of Object.entries(toggles_default)) {
    const toggleType = toggleData.type;
    const index = toggleData.index;
    if (toggleType === "drawable" && drawables[toggleItem]) {
      const currentDrawable = GetPedDrawableVariation(ped, index);
      if (currentDrawable !== drawables[toggleItem].value) {
        SetPedComponentVariation(ped, index, drawables[toggleItem].value, 0, 0);
      }
    } else if (toggleType === "prop" && props[toggleItem]) {
      const currentProp = GetPedPropIndex(ped, index);
      if (currentProp !== props[toggleItem].value) {
        SetPedPropIndex(ped, index, props[toggleItem].value, 0, false);
      }
    }
  }
}
__name(resetToggles, "resetToggles");
function setPedClothes(pedHandle, data) {
  const drawables = data.drawables;
  const props = data.props;
  const headOverlay = data.headOverlay;
  for (const id in drawables) {
    const drawable = drawables[id];
    setDrawable(pedHandle, drawable);
  }
  for (const id in props) {
    const prop = props[id];
    setProp(pedHandle, prop);
  }
  for (const id in headOverlay) {
    const overlay = headOverlay[id];
    setHeadOverlay(pedHandle, overlay);
  }
}
__name(setPedClothes, "setPedClothes");
var setPedSkin = /* @__PURE__ */ __name(async (data) => {
  const headStructure = data.headStructure;
  const headBlend = data.headBlend;
  await setModel(data.model);
  if (headBlend)
    setHeadBlend(ped, headBlend);
  if (headStructure)
    for (const feature in headStructure) {
      const value = headStructure[feature];
      SetFaceFeature(ped, value);
    }
}, "setPedSkin");
function setPedTattoos(pedHandle, data) {
  if (!data)
    return;
  ClearPedDecorationsLeaveScars(pedHandle);
  for (let i = 0; i < data.length; i++) {
    const tattooData = data[i].tattoo;
    if (tattooData) {
      const collection = GetHashKey(tattooData.dlc);
      const tattoo = tattooData.hash;
      AddPedDecorationFromHashes(pedHandle, collection, tattoo);
    }
  }
}
__name(setPedTattoos, "setPedTattoos");
function setPedHairColors(pedHandle, data) {
  const color = data.color;
  const highlight = data.highlight;
  SetPedHairColor(pedHandle, color, highlight);
}
__name(setPedHairColors, "setPedHairColors");
async function setPedAppearance(pedHandle, data) {
  await setPedSkin(data);
  setPedClothes(pedHandle, data);
  setPedHairColors(pedHandle, data.hairColor);
  setPedTattoos(pedHandle, data.tattoos);
}
__name(setPedAppearance, "setPedAppearance");
async function setPlayerPedAppearance(data) {
  await setPedSkin(data);
  setPedClothes(ped, data);
  setPedHairColors(ped, data.hairColor);
  setPedTattoos(ped, data.tattoos);
}
__name(setPlayerPedAppearance, "setPlayerPedAppearance");
exports("SetPedClothes", setPedClothes);
exports("SetPedSkin", setPedSkin);
exports("SetPedTattoos", setPedTattoos);
exports("SetPedHairColors", setPedHairColors);

// src/client/handlers.ts
RegisterNuiCallback("appearance:cancel" /* cancel */, async (appearance, cb) => {
  await setPlayerPedAppearance(appearance);
  closeMenu();
  cb(1);
});
RegisterNuiCallback("appearance:save" /* save */, async (appearance, cb) => {
  resetToggles(appearance);
  await delay(100);
  const newAppearance = await getAppearance(ped);
  newAppearance.tattoos = appearance.tattoos;
  triggerServerCallback("bl_appearance:server:saveAppearance", getFrameworkID(), newAppearance);
  setPedTattoos(ped, newAppearance.tattoos);
  closeMenu();
  cb(1);
});
RegisterNuiCallback("appearance:setModel" /* setModel */, async (model, cb) => {
  const hash = GetHashKey(model);
  if (!IsModelInCdimage(hash) || !IsModelValid(hash)) {
    return cb(0);
  }
  await setModel(hash);
  const appearance = await getAppearance(ped);
  appearance.tattoos = [];
  setPedTattoos(ped, []);
  cb(appearance);
});
RegisterNuiCallback("appearance:getModelTattoos" /* getModelTattoos */, async (_, cb) => {
  const tattoos = getTattooData();
  cb(tattoos);
});
RegisterNuiCallback("appearance:setHeadStructure" /* setHeadStructure */, async (data, cb) => {
  SetFaceFeature(ped, data);
  cb(1);
});
RegisterNuiCallback("appearance:setHeadOverlay" /* setHeadOverlay */, async (data, cb) => {
  setHeadOverlay(ped, data);
  cb(1);
});
RegisterNuiCallback("appearance:setHeadBlend" /* setHeadBlend */, async (data, cb) => {
  setHeadBlend(ped, data);
  cb(1);
});
RegisterNuiCallback("appearance:setTattoos" /* setTattoos */, async (data, cb) => {
  setPedTattoos(ped, data);
  cb(1);
});
RegisterNuiCallback("appearance:setProp" /* setProp */, async (data, cb) => {
  let texture = setProp(ped, data);
  cb(texture);
});
RegisterNuiCallback("appearance:setDrawable" /* setDrawable */, async (data, cb) => {
  let texture = setDrawable(ped, data);
  cb(texture);
});
RegisterNuiCallback(
  "appearance:toggleItem" /* toggleItem */,
  async (data, cb) => {
    const item = toggles_default[data.item];
    if (!item)
      return cb(false);
    const current = data.data;
    const type = item.type;
    const index = item.index;
    const hook = item.hook;
    const hookData = data.hookData;
    if (!current)
      return cb(false);
    if (type === "prop") {
      const currentProp = GetPedPropIndex(ped, index);
      if (currentProp === -1) {
        setProp(ped, current);
        cb(false);
        return;
      } else {
        ClearPedProp(ped, index);
        cb(true);
        return;
      }
    } else if (type === "drawable") {
      const currentDrawable = GetPedDrawableVariation(ped, index);
      if (current.value === item.off) {
        cb(false);
        return;
      }
      if (current.value === currentDrawable) {
        SetPedComponentVariation(ped, index, item.off, 0, 0);
        if (hook) {
          for (let i = 0; i < hook.drawables?.length; i++) {
            const hookItem = hook.drawables[i];
            SetPedComponentVariation(ped, hookItem.component, hookItem.variant, hookItem.texture, 0);
          }
        }
        cb(true);
        return;
      } else {
        setDrawable(ped, current);
        for (let i = 0; i < hookData?.length; i++) {
          setDrawable(ped, hookData[i]);
        }
        cb(false);
        return;
      }
    }
  }
);
RegisterNuiCallback("appearance:saveOutfit" /* saveOutfit */, async (data, cb) => {
  const frameworkdId = getFrameworkID();
  const result = await triggerServerCallback("bl_appearance:server:saveOutfit", frameworkdId, data);
  cb(result);
});
RegisterNuiCallback("appearance:deleteOutfit" /* deleteOutfit */, async ({ id }, cb) => {
  const frameworkdId = getFrameworkID();
  const result = await triggerServerCallback("bl_appearance:server:deleteOutfit", frameworkdId, id);
  cb(result);
});
RegisterNuiCallback("appearance:renameOutfit" /* renameOutfit */, async (data, cb) => {
  const frameworkdId = getFrameworkID();
  const result = await triggerServerCallback("bl_appearance:server:renameOutfit", frameworkdId, data);
  cb(result);
});
RegisterNuiCallback("appearance:useOutfit" /* useOutfit */, async (outfit, cb) => {
  setPedClothes(ped, outfit);
  cb(1);
});
RegisterNuiCallback("appearance:importOutfit" /* importOutfit */, async ({ id, outfitName }, cb) => {
  const frameworkdId = getFrameworkID();
  const result = await triggerServerCallback("bl_appearance:server:importOutfit", frameworkdId, id, outfitName);
  cb(result);
});
RegisterNuiCallback("appearance:grabOutfit" /* grabOutfit */, async ({ id }, cb) => {
  const result = await triggerServerCallback("bl_appearance:server:grabOutfit", id);
  cb(result);
});
RegisterNuiCallback("appearance:itemOutfit" /* itemOutfit */, async (data, cb) => {
  const result = await triggerServerCallback("bl_appearance:server:itemOutfit", data);
  cb(result);
});
onNet("bl_appearance:server:useOutfit", (outfit) => {
  setPedClothes(ped, outfit);
});

// src/client/menu.ts
var config = exports.bl_appearance;
var armour = 0;
var open = false;
var resolvePromise = null;
var promise = null;
async function openMenu(zone, creation = false) {
  if (zone === null || open) {
    return;
  }
  const pedHandle = PlayerPedId();
  const configMenus = config.menus();
  const type = zone.type;
  const menu = configMenus[type];
  if (!menu)
    return;
  updatePed(pedHandle);
  startCamera();
  const frameworkdId = getFrameworkID();
  const tabs = menu.tabs;
  let allowExit = menu.allowExit;
  armour = GetPedArmour(pedHandle);
  let outfits = [];
  const hasOutfitTab = tabs.includes("outfits");
  if (hasOutfitTab)
    outfits = await triggerServerCallback("bl_appearance:server:getOutfits", frameworkdId);
  let models = [];
  const hasHeritageTab = tabs.includes("heritage");
  if (hasHeritageTab) {
    models = config.models();
  }
  const hasTattooTab = tabs.includes("tattoos");
  let tattoos;
  if (hasTattooTab) {
    tattoos = getTattooData();
  }
  const blacklist = getBlacklist(zone);
  const appearance = await getAppearance(pedHandle);
  if (creation) {
    emitNet("bl_appearance:server:setroutingbucket");
    promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
  }
  sendNUIEvent("appearance:data" /* data */, {
    tabs,
    appearance,
    blacklist,
    tattoos,
    outfits,
    models,
    allowExit,
    job: getJobInfo(),
    locale: await requestLocale("locale")
  });
  SetNuiFocus(true, true);
  sendNUIEvent("appearance:visible" /* visible */, true);
  open = true;
  if (promise) {
    await promise;
    emitNet("bl_appearance:server:resetroutingbucket");
  }
  promise = null;
  resolvePromise = null;
  return true;
}
__name(openMenu, "openMenu");
exports("openMenu", openMenu);
function getBlacklist(zone) {
  if (!zone)
    return {};
  const { groupTypes, base } = config.blacklist();
  if (!groupTypes)
    return {};
  if (!base)
    return {};
  let blacklist = { ...base };
  const playerData = getPlayerData();
  for (const type in groupTypes) {
    const groups = groupTypes[type];
    for (const group in groups) {
      let skip = false;
      if (type == "jobs" && zone.jobs) {
        skip = zone.jobs.includes(playerData.job.name);
      }
      if (type == "gangs" && zone.gangs) {
        skip = zone.gangs.includes(playerData.gang.name);
      }
      if (!skip) {
        const groupBlacklist = groups[group];
        blacklist = Object.assign({}, blacklist, groupBlacklist, {
          drawables: Object.assign({}, blacklist.drawables, groupBlacklist.drawables)
        });
      }
    }
  }
  return blacklist;
}
__name(getBlacklist, "getBlacklist");
function closeMenu() {
  SetPedArmour(ped, armour);
  stopCamera();
  SetNuiFocus(false, false);
  sendNUIEvent("appearance:visible" /* visible */, false);
  if (resolvePromise) {
    resolvePromise();
  }
  open = false;
}
__name(closeMenu, "closeMenu");

// src/client/bridge/qb.ts
function QBBridge() {
  onNet("qb-clothing:client:loadPlayerClothing", async (appearance, ped2) => {
    await setPedAppearance(ped2, appearance);
  });
  onNet("qb-clothes:client:CreateFirstCharacter", () => {
    exports.bl_appearance.InitialCreation();
  });
  onNet("qb-clothing:client:openOutfitMenu", () => {
    openMenu({ type: "outfits", coords: [0, 0, 0, 0] });
  });
}
__name(QBBridge, "QBBridge");

// src/client/bridge/esx.ts
function ESXBridge() {
  let firstSpawn = false;
  on("esx_skin:resetFirstSpawn", () => {
    firstSpawn = true;
  });
  on("esx_skin:playerRegistered", () => {
    if (firstSpawn)
      exports.bl_appearance.InitialCreation();
  });
  onNet("skinchanger:loadSkin2", async (appearance, ped2) => {
    await setPedAppearance(ped2, appearance);
  });
  onNet("skinchanger:getSkin", async (cb) => {
    const frameworkID = await getFrameworkID();
    const appearance = await triggerServerCallback("bl_appearance:server:getAppearance", frameworkID);
    cb(appearance);
  });
  onNet("skinchanger:loadSkin", async (appearance, cb) => {
    await setPlayerPedAppearance(appearance);
    if (cb)
      cb();
  });
  onNet("esx_skin:openSaveableMenu", async (onSubmit) => {
    exports.bl_appearance.InitialCreation(onSubmit);
  });
}
__name(ESXBridge, "ESXBridge");

// src/client/init.ts
RegisterCommand("openMenu", async () => {
  exports.bl_appearance.InitialCreation();
}, false);
exports("SetPedAppearance", async (ped2, appearance) => {
  await setPedAppearance(ped2, appearance);
});
exports("SetPlayerPedAppearance", async (frameworkID) => {
  const appearance = await triggerServerCallback("bl_appearance:server:getAppearance", frameworkID);
  await setPlayerPedAppearance(appearance);
});
exports("GetPlayerPedAppearance", async (frameworkID) => {
  return await triggerServerCallback("bl_appearance:server:getAppearance", frameworkID);
});
exports("InitialCreation", async (cb) => {
  await openMenu({ type: "appearance", coords: [0, 0, 0, 0] }, true);
  if (cb)
    cb();
});
on("bl_sprites:client:useZone", (zone) => {
  openMenu(zone);
});
onNet("bl_bridge:client:playerLoaded", async () => {
  while (!bl_bridge.core().playerLoaded()) {
    await Delay(100);
  }
  const frameworkID = await getFrameworkID();
  const appearance = await triggerServerCallback("bl_appearance:server:getAppearance", frameworkID);
  if (!appearance)
    return;
  await setPlayerPedAppearance(appearance);
});
onNet("onResourceStart", async (resource) => {
  if (resource === GetCurrentResourceName() && bl_bridge.core().playerLoaded()) {
    const frameworkID = await getFrameworkID();
    const appearance = await triggerServerCallback("bl_appearance:server:getAppearance", frameworkID);
    if (!appearance)
      return;
    await setPlayerPedAppearance(appearance);
  }
});
var frameworkName = bl_bridge.getFramework("core");
var core = format(GetConvar("bl:framework", "qb"));
if (core == "qb" || core == "qbx" && GetResourceState(frameworkName) == "started") {
  QBBridge();
} else if (core == "esx" && GetResourceState(frameworkName) == "started") {
  ESXBridge();
}
RegisterCommand("reloadskin", async () => {
  const frameworkID = await getFrameworkID();
  const health = GetEntityHealth(ped);
  const maxhealth = GetEntityMaxHealth(ped);
  const armor = GetPedArmour(ped);
  const appearance = await triggerServerCallback("bl_appearance:server:getAppearance", frameworkID);
  if (!appearance)
    return;
  await setPlayerPedAppearance(appearance);
  SetPedMaxHealth(ped, maxhealth);
  delay(1e3);
  SetEntityHealth(ped, health);
  SetPedArmour(ped, armor);
}, false);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvcWIudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvZXN4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvaW5pdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCBwZWQgPSAwXHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlUGVkID0gKHBlZEhhbmRsZTogbnVtYmVyKSA9PiB7XHJcbiAgICBwZWQgPSBwZWRIYW5kbGVcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlYnVnZGF0YSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGEsIChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0sIDIpKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2VuZE5VSUV2ZW50ID0gKGFjdGlvbjogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcclxuICAgIFNlbmROVUlNZXNzYWdlKHtcclxuICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TW9kZWwgPSBhc3luYyAobW9kZWw6IHN0cmluZyB8IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiA9PiB7XHJcbiAgICBsZXQgbW9kZWxIYXNoOiBudW1iZXIgPSB0eXBlb2YgbW9kZWwgPT09ICdudW1iZXInID8gbW9kZWwgOiBHZXRIYXNoS2V5KG1vZGVsKVxyXG5cclxuICAgIGlmICghSXNNb2RlbFZhbGlkKG1vZGVsSGFzaCkpIHtcclxuICAgICAgICBleHBvcnRzLmJsX2JyaWRnZS5ub3RpZnkoKSh7XHJcbiAgICAgICAgICAgIHRpdGxlOiAnSW52YWxpZCBtb2RlbCEnLFxyXG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgICBkdXJhdGlvbjogMTAwMFxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgYXR0ZW1wdGVkIHRvIGxvYWQgaW52YWxpZCBtb2RlbCAnJHttb2RlbH0nYCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKEhhc01vZGVsTG9hZGVkKG1vZGVsSGFzaCkpIHJldHVybiBtb2RlbEhhc2hcclxuICAgIFxyXG4gICAgUmVxdWVzdE1vZGVsKG1vZGVsSGFzaCk7XHJcblxyXG4gICAgY29uc3Qgd2FpdEZvck1vZGVsTG9hZGVkID0gKCk6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgYXdhaXQgd2FpdEZvck1vZGVsTG9hZGVkKCk7XHJcblxyXG4gICAgcmV0dXJuIG1vZGVsSGFzaDtcclxufTtcclxuXHJcblxyXG4vL2NhbGxiYWNrXHJcbi8vaHR0cHM6Ly9naXRodWIuY29tL292ZXJleHRlbmRlZC9veF9saWIvYmxvYi9tYXN0ZXIvcGFja2FnZS9jbGllbnQvcmVzb3VyY2UvY2FsbGJhY2svaW5kZXgudHNcclxuXHJcbmNvbnN0IHJlc291cmNlTmFtZSA9IEdldEN1cnJlbnRSZXNvdXJjZU5hbWUoKVxyXG5jb25zdCBldmVudFRpbWVyczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xyXG5jb25zdCBhY3RpdmVFdmVudHM6IFJlY29yZDxzdHJpbmcsICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4gPSB7fTtcclxuXHJcbmZ1bmN0aW9uIGV2ZW50VGltZXIoZXZlbnROYW1lOiBzdHJpbmcsIGRlbGF5OiBudW1iZXIgfCBudWxsKSB7XHJcbiAgICBpZiAoZGVsYXkgJiYgZGVsYXkgPiAwKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBHZXRHYW1lVGltZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKChldmVudFRpbWVyc1tldmVudE5hbWVdIHx8IDApID4gY3VycmVudFRpbWUpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgZXZlbnRUaW1lcnNbZXZlbnROYW1lXSA9IGN1cnJlbnRUaW1lICsgZGVsYXk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbm9uTmV0KGBfX294X2NiXyR7cmVzb3VyY2VOYW1lfWAsIChrZXk6IHN0cmluZywgLi4uYXJnczogYW55KSA9PiB7XHJcbiAgICBjb25zdCByZXNvbHZlID0gYWN0aXZlRXZlbnRzW2tleV07XHJcbiAgICByZXR1cm4gcmVzb2x2ZSAmJiByZXNvbHZlKC4uLmFyZ3MpO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VCA9IHVua25vd24+KFxyXG4gICAgZXZlbnROYW1lOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVxyXG4pOiBQcm9taXNlPFQ+IHwgdm9pZCB7XHJcbiAgICBpZiAoIWV2ZW50VGltZXIoZXZlbnROYW1lLCAwKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQga2V5OiBzdHJpbmc7XHJcblxyXG4gICAgZG8ge1xyXG4gICAgICAgIGtleSA9IGAke2V2ZW50TmFtZX06JHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoMTAwMDAwICsgMSkpfWA7XHJcbiAgICB9IHdoaWxlIChhY3RpdmVFdmVudHNba2V5XSk7XHJcblxyXG4gICAgZW1pdE5ldChgX19veF9jYl8ke2V2ZW50TmFtZX1gLCByZXNvdXJjZU5hbWUsIGtleSwgLi4uYXJncyk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgYWN0aXZlRXZlbnRzW2tleV0gPSByZXNvbHZlO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb25TZXJ2ZXJDYWxsYmFjayhldmVudE5hbWUsIGNiKSB7XHJcbiAgICBvbk5ldChgX19veF9jYl8ke2V2ZW50TmFtZX1gLCBhc3luYyAocmVzb3VyY2UsIGtleSwgLi4uYXJncykgPT4ge1xyXG4gICAgICAgIGxldCByZXNwb25zZTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IGNiKC4uLmFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBhbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBoYW5kbGluZyBjYWxsYmFjayBldmVudCAke2V2ZW50TmFtZX1gKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYF4zJHtlLnN0YWNrfV4wYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVtaXROZXQoYF9fb3hfY2JfJHtyZXNvdXJjZX1gLCBrZXksIHJlc3BvbnNlKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vL2xvY2FsZVxyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RMb2NhbGUgPSAocmVzb3VyY2VTZXROYW1lOiBzdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNoZWNrUmVzb3VyY2VGaWxlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoUmVxdWVzdFJlc291cmNlRmlsZVNldChyZXNvdXJjZVNldE5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50TGFuID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmNvbmZpZygpLmxvY2FsZVxyXG4gICAgICAgICAgICAgICAgbGV0IGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvJHtjdXJyZW50TGFufS5qc29uYCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsZUZpbGVDb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtjdXJyZW50TGFufS5qc29uIG5vdCBmb3VuZCBpbiBsb2NhbGUsIHBsZWFzZSB2ZXJpZnkhLCB3ZSB1c2VkIGVuZ2xpc2ggZm9yIG5vdyFgKVxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvZW4uanNvbmApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGxvY2FsZUZpbGVDb250ZW50KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2hlY2tSZXNvdXJjZUZpbGUsIDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2hlY2tSZXNvdXJjZUZpbGUoKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbG9jYWxlID0gYXN5bmMgKGlkOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBjb25zdCBsb2NhbGUgPSBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKTtcclxuICAgIGxldCBhcmdJbmRleCA9IDA7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gbG9jYWxlW2lkXS5yZXBsYWNlKC8lcy9nLCAobWF0Y2g6IHN0cmluZykgPT4gYXJnSW5kZXggPCBhcmdzLmxlbmd0aCA/IGFyZ3NbYXJnSW5kZXhdIDogbWF0Y2gpO1xyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgYmxfYnJpZGdlID0gZXhwb3J0cy5ibF9icmlkZ2VcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRQbGF5ZXJEYXRhID0gKCkgPT4ge1xyXG4gICAgcmV0dXJuIGJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRGcmFtZXdvcmtJRCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGlkID0gZ2V0UGxheWVyRGF0YSgpLmNpZFxyXG4gICAgcmV0dXJuIGlkXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBEZWxheShtczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXQoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgaWYgKCFzdHIuaW5jbHVkZXMoXCInXCIpKSByZXR1cm4gc3RyO1xyXG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8nL2csIFwiXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Sm9iSW5mbygpOiB7IG5hbWU6IHN0cmluZywgaXNCb3NzOiBib29sZWFuIH0ge1xyXG4gICAgY29uc3Qgam9iID0gZ2V0UGxheWVyRGF0YSgpLmpvYlxyXG4gICAgcmV0dXJuIHsgbmFtZTogam9iLm5hbWUsIGlzQm9zczogam9iLmlzQm9zcyB9XHJcbn0iLCAiaW1wb3J0IHsgQ2FtZXJhLCBWZWN0b3IzLCBUQ2FtZXJhQm9uZXMgfSBmcm9tICdAdHlwaW5ncy9jYW1lcmEnO1xyXG5pbXBvcnQgeyBkZWxheSwgcGVkIH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgUmVjZWl2ZSB9IGZyb20gJ0BldmVudHMnO1xyXG5cclxuY29uc3QgV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0UgPSAyLjA7XHJcbmNvbnN0IERFRkFVTFRfTUFYX0RJU1RBTkNFID0gMS4wO1xyXG5cclxubGV0IHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGNhbURpc3RhbmNlOiBudW1iZXIgPSAxLjg7XHJcbmxldCBjYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgYW5nbGVZOiBudW1iZXIgPSAwLjA7XHJcbmxldCBhbmdsZVo6IG51bWJlciA9IDAuMDtcclxubGV0IHRhcmdldENvb3JkczogVmVjdG9yMyB8IG51bGwgPSBudWxsO1xyXG5sZXQgb2xkQ2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGNoYW5naW5nQ2FtOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBsYXN0WDogbnVtYmVyID0gMDtcclxubGV0IGN1cnJlbnRCb25lOiBrZXlvZiBUQ2FtZXJhQm9uZXMgPSAnaGVhZCc7XHJcblxyXG5jb25zdCBDYW1lcmFCb25lczogVENhbWVyYUJvbmVzID0ge1xyXG4gICAgd2hvbGU6IDAsXHJcblx0aGVhZDogMzEwODYsXHJcblx0dG9yc286IDI0ODE4LFxyXG5cdGxlZ3M6IFsxNjMzNSwgNDYwNzhdLFxyXG4gICAgc2hvZXM6IFsxNDIwMSwgNTIzMDFdLFxyXG59O1xyXG5cclxuY29uc3QgY29zID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguY29zKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3Qgc2luID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguc2luKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0QW5nbGVzID0gKCk6IG51bWJlcltdID0+IHtcclxuXHRjb25zdCB4ID1cclxuXHRcdCgoY29zKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSArIGNvcyhhbmdsZVkpICogY29zKGFuZ2xlWikpIC8gMikgKlxyXG5cdFx0Y2FtRGlzdGFuY2U7XHJcblx0Y29uc3QgeSA9XHJcblx0XHQoKHNpbihhbmdsZVopICogY29zKGFuZ2xlWSkgKyBjb3MoYW5nbGVZKSAqIHNpbihhbmdsZVopKSAvIDIpICpcclxuXHRcdGNhbURpc3RhbmNlO1xyXG5cdGNvbnN0IHogPSBzaW4oYW5nbGVZKSAqIGNhbURpc3RhbmNlO1xyXG5cclxuXHRyZXR1cm4gW3gsIHksIHpdO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtUG9zaXRpb24gPSAobW91c2VYPzogbnVtYmVyLCBtb3VzZVk/OiBudW1iZXIpOiB2b2lkID0+IHtcclxuXHRpZiAoIXJ1bm5pbmcgfHwgIXRhcmdldENvb3JkcyB8fCBjaGFuZ2luZ0NhbSkgcmV0dXJuO1xyXG5cclxuXHRtb3VzZVggPSBtb3VzZVggPz8gMC4wO1xyXG5cdG1vdXNlWSA9IG1vdXNlWSA/PyAwLjA7XHJcblxyXG5cdGFuZ2xlWiAtPSBtb3VzZVg7XHJcblx0YW5nbGVZICs9IG1vdXNlWTtcclxuXHJcbiAgICBjb25zdCBpc0hlYWRPcldob2xlID0gY3VycmVudEJvbmUgPT09ICd3aG9sZScgfHwgY3VycmVudEJvbmUgPT09ICdoZWFkJztcclxuICAgIGNvbnN0IG1heEFuZ2xlID0gaXNIZWFkT3JXaG9sZSA/IDg5LjAgOiA3MC4wO1xyXG4gICAgXHJcbiAgICBjb25zdCBpc1Nob2VzID0gY3VycmVudEJvbmUgPT09ICdzaG9lcyc7XHJcbiAgICBjb25zdCBtaW5BbmdsZSA9IGlzU2hvZXMgPyA1LjAgOiAtMjAuMDtcclxuXHJcblx0YW5nbGVZID0gTWF0aC5taW4oTWF0aC5tYXgoYW5nbGVZLCBtaW5BbmdsZSksIG1heEFuZ2xlKTtcclxuXHJcblx0Y29uc3QgW3gsIHksIHpdID0gZ2V0QW5nbGVzKCk7XHJcblxyXG5cdFNldENhbUNvb3JkKFxyXG5cdFx0Y2FtLFxyXG5cdFx0dGFyZ2V0Q29vcmRzLnggKyB4LFxyXG5cdFx0dGFyZ2V0Q29vcmRzLnkgKyB5LFxyXG5cdFx0dGFyZ2V0Q29vcmRzLnogKyB6XHJcblx0KTtcclxuXHRQb2ludENhbUF0Q29vcmQoY2FtLCB0YXJnZXRDb29yZHMueCwgdGFyZ2V0Q29vcmRzLnksIHRhcmdldENvb3Jkcy56KTtcclxufTtcclxuXHJcbmNvbnN0IG1vdmVDYW1lcmEgPSBhc3luYyAoY29vcmRzOiBWZWN0b3IzLCBkaXN0YW5jZT86IG51bWJlcikgPT4ge1xyXG5cdGNvbnN0IGhlYWRpbmc6IG51bWJlciA9IEdldEVudGl0eUhlYWRpbmcocGVkKSArIDk0O1xyXG5cdGRpc3RhbmNlID0gZGlzdGFuY2UgPz8gMS4wO1xyXG5cclxuXHRjaGFuZ2luZ0NhbSA9IHRydWU7XHJcblx0Y2FtRGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuXHRhbmdsZVogPSBoZWFkaW5nO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKTtcclxuXHJcblx0Y29uc3QgbmV3Y2FtOiBDYW1lcmEgPSBDcmVhdGVDYW1XaXRoUGFyYW1zKFxyXG5cdFx0J0RFRkFVTFRfU0NSSVBURURfQ0FNRVJBJyxcclxuXHRcdGNvb3Jkcy54ICsgeCxcclxuXHRcdGNvb3Jkcy55ICsgeSxcclxuXHRcdGNvb3Jkcy56ICsgeixcclxuXHRcdDAuMCxcclxuXHRcdDAuMCxcclxuXHRcdDAuMCxcclxuXHRcdDcwLjAsXHJcblx0XHRmYWxzZSxcclxuXHRcdDBcclxuXHQpO1xyXG5cclxuXHR0YXJnZXRDb29yZHMgPSBjb29yZHM7XHJcblx0Y2hhbmdpbmdDYW0gPSBmYWxzZTtcclxuXHRvbGRDYW0gPSBjYW07XHJcblx0Y2FtID0gbmV3Y2FtO1xyXG5cclxuXHRQb2ludENhbUF0Q29vcmQobmV3Y2FtLCBjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56KTtcclxuXHRTZXRDYW1BY3RpdmVXaXRoSW50ZXJwKG5ld2NhbSwgb2xkQ2FtLCAyNTAsIDAsIDApO1xyXG5cclxuXHRhd2FpdCBkZWxheSgyNTApO1xyXG5cclxuXHRTZXRDYW1Vc2VTaGFsbG93RG9mTW9kZShuZXdjYW0sIHRydWUpO1xyXG5cdFNldENhbU5lYXJEb2YobmV3Y2FtLCAwLjQpO1xyXG5cdFNldENhbUZhckRvZihuZXdjYW0sIDEuMik7XHJcblx0U2V0Q2FtRG9mU3RyZW5ndGgobmV3Y2FtLCAwLjMpO1xyXG5cdHVzZUhpRG9mKG5ld2NhbSk7XHJcblxyXG5cdERlc3Ryb3lDYW0ob2xkQ2FtLCB0cnVlKTtcclxufTtcclxuXHJcbmNvbnN0IHVzZUhpRG9mID0gKGN1cnJlbnRjYW06IENhbWVyYSkgPT4ge1xyXG5cdGlmICghKERvZXNDYW1FeGlzdChjYW0pICYmIGN1cnJlbnRjYW0gPT0gY2FtKSkgcmV0dXJuO1xyXG5cdFNldFVzZUhpRG9mKCk7XHJcblx0c2V0VGltZW91dCh1c2VIaURvZiwgMCk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc3RhcnRDYW1lcmEgPSAoKSA9PiB7XHJcblx0aWYgKHJ1bm5pbmcpIHJldHVybjtcclxuXHRydW5uaW5nID0gdHJ1ZTtcclxuXHRjYW1EaXN0YW5jZSA9IFdIT0xFX0JPRFlfTUFYX0RJU1RBTkNFXHJcblx0Y2FtID0gQ3JlYXRlQ2FtKCdERUZBVUxUX1NDUklQVEVEX0NBTUVSQScsIHRydWUpO1xyXG5cdGNvbnN0IFt4LCB5LCB6XTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgMzEwODYsIDAuMCwgMC4wLCAwLjApO1xyXG5cdFNldENhbUNvb3JkKGNhbSwgeCwgeSwgeik7XHJcblx0UmVuZGVyU2NyaXB0Q2Ftcyh0cnVlLCB0cnVlLCAxMDAwLCB0cnVlLCB0cnVlKTtcclxuXHQvLyBtb3ZlQ2FtZXJhKHsgeDogeCwgeTogeSwgejogeiB9LCBjYW1EaXN0YW5jZSk7XHJcbiAgICBzZXRDYW1lcmEoJ3dob2xlJywgY2FtRGlzdGFuY2UpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0b3BDYW1lcmEgPSAoKTogdm9pZCA9PiB7XHJcblx0aWYgKCFydW5uaW5nKSByZXR1cm47XHJcblx0cnVubmluZyA9IGZhbHNlO1xyXG5cclxuXHRSZW5kZXJTY3JpcHRDYW1zKGZhbHNlLCB0cnVlLCAyNTAsIHRydWUsIGZhbHNlKTtcclxuXHREZXN0cm95Q2FtKGNhbSwgdHJ1ZSk7XHJcblx0Y2FtID0gbnVsbDtcclxuXHR0YXJnZXRDb29yZHMgPSBudWxsO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtZXJhID0gKHR5cGU/OiBrZXlvZiBUQ2FtZXJhQm9uZXMsIGRpc3RhbmNlID0gY2FtRGlzdGFuY2UpOiB2b2lkID0+IHtcclxuXHJcblx0Y29uc3QgYm9uZTogbnVtYmVyIHwgbnVtYmVyW10gfCB1bmRlZmluZWQgPSBDYW1lcmFCb25lc1t0eXBlXTtcclxuXHJcbiAgICBjb25zdCBpc0JvbmVBcnJheSA9IEFycmF5LmlzQXJyYXkoYm9uZSlcclxuXHJcbiAgICBjdXJyZW50Qm9uZSA9IHR5cGU7XHJcblxyXG4gICAgaWYgKCFpc0JvbmVBcnJheSAmJiBib25lID09PSAwKSB7XHJcbiAgICAgICAgY29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldEVudGl0eUNvb3JkcyhwZWQsIGZhbHNlKTtcclxuICAgICAgICBtb3ZlQ2FtZXJhKFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgICAgeTogeSxcclxuICAgICAgICAgICAgICAgIHo6IHogKyAwLjAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRpc3RhbmNlXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgaXRzIG5vdCB3aG9sZSBib2R5LCB0aGVuIHdlIG5lZWQgdG8gbGltaXQgdGhlIGRpc3RhbmNlXHJcbiAgICBpZiAoZGlzdGFuY2UgPiBERUZBVUxUX01BWF9ESVNUQU5DRSkgZGlzdGFuY2UgPSBERUZBVUxUX01BWF9ESVNUQU5DRTtcclxuXHJcbiAgICBpZiAoaXNCb25lQXJyYXkpIHtcclxuICAgICAgICBjb25zdCBbeDEsIHkxLCB6MV06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmVbMF0sIDAuMCwgMC4wLCAwLjApXHJcblxyXG4gICAgICAgIGNvbnN0IFt4MiwgeTIsIHoyXTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZVsxXSwgMC4wLCAwLjAsIDAuMClcclxuXHJcbiAgICAgICAgLy8gZ2V0IHRoZSBtaWRkbGUgb2YgdGhlIHR3byBwb2ludHNcclxuICAgICAgICB2YXIgeCA9ICh4MSArIHgyKSAvIDI7XHJcbiAgICAgICAgdmFyIHkgPSAoeTEgKyB5MikgLyAyO1xyXG4gICAgICAgIHZhciB6ID0gKHoxICsgejIpIC8gMjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIFt4LCB5LCB6XTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZSwgMC4wLCAwLjAsIDAuMClcclxuICAgIH1cclxuXHJcblx0bW92ZUNhbWVyYShcclxuXHRcdHtcclxuXHRcdFx0eDogeCxcclxuXHRcdFx0eTogeSxcclxuXHRcdFx0ejogeiArIDAuMCxcclxuXHRcdH0sXHJcblx0XHRkaXN0YW5jZVxyXG5cdCk7XHJcblxyXG59O1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbU1vdmUsIChkYXRhLCBjYikgPT4ge1xyXG4gICAgc2V0Q2FtUG9zaXRpb24oZGF0YS54LCBkYXRhLnkpO1xyXG4gICAgY2IoMSk7XHJcbn0pO1xyXG5cclxudHlwZSBUU2VjdGlvbiA9ICd3aG9sZScgfCAnaGVhZCcgfCAndG9yc28nIHwgJ2xlZ3MnIHwgJ3Nob2VzJztcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1TZWN0aW9uLCAodHlwZTogVFNlY3Rpb24sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ3dob2xlJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCd3aG9sZScsIFdIT0xFX0JPRFlfTUFYX0RJU1RBTkNFKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnaGVhZCc6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgnaGVhZCcpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICd0b3Jzbyc6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgndG9yc28nKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbGVncyc6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgnbGVncycpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdzaG9lcyc6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgnc2hvZXMnKTtcclxuICAgICAgICAgICAgc2V0Q2FtUG9zaXRpb24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblx0fVxyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1ab29tLCAoZGF0YSwgY2IpID0+IHtcclxuXHRpZiAoZGF0YSA9PT0gJ2Rvd24nKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IG1heFpvb20gPSBjdXJyZW50Qm9uZSA9PT0gJ3dob2xlJyA/IFdIT0xFX0JPRFlfTUFYX0RJU1RBTkNFIDogREVGQVVMVF9NQVhfRElTVEFOQ0U7XHJcblxyXG5cdFx0Y29uc3QgbmV3RGlzdGFuY2U6IG51bWJlciA9IGNhbURpc3RhbmNlICsgMC4wNTtcclxuXHRcdGNhbURpc3RhbmNlID0gbmV3RGlzdGFuY2UgPj0gbWF4Wm9vbSA/IG1heFpvb20gOiBuZXdEaXN0YW5jZTtcclxuXHR9IGVsc2UgaWYgKGRhdGEgPT09ICd1cCcpIHtcclxuXHRcdGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSAtIDAuMDU7XHJcblx0XHRjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlIDw9IDAuMyA/IDAuMyA6IG5ld0Rpc3RhbmNlO1xyXG5cdH1cclxuXHJcblx0Y2FtRGlzdGFuY2UgPSBjYW1EaXN0YW5jZTtcclxuXHRzZXRDYW1Qb3NpdGlvbigpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcIkJsZW1pc2hlc1wiLFxuICAgIFwiRmFjaWFsSGFpclwiLFxuICAgIFwiRXllYnJvd3NcIixcbiAgICBcIkFnZWluZ1wiLFxuICAgIFwiTWFrZXVwXCIsXG4gICAgXCJCbHVzaFwiLFxuICAgIFwiQ29tcGxleGlvblwiLFxuICAgIFwiU3VuRGFtYWdlXCIsXG4gICAgXCJMaXBzdGlja1wiLFxuICAgIFwiTW9sZXNGcmVja2xlc1wiLFxuICAgIFwiQ2hlc3RIYWlyXCIsXG4gICAgXCJCb2R5QmxlbWlzaGVzXCIsXG4gICAgXCJBZGRCb2R5QmxlbWlzaGVzXCIsXG4gICAgXCJFeWVDb2xvclwiXG5dXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiTm9zZV9XaWR0aFwiLFxuICAgIFwiTm9zZV9QZWFrX0hlaWdodFwiLFxuICAgIFwiTm9zZV9QZWFrX0xlbmdodFwiLFxuICAgIFwiTm9zZV9Cb25lX0hlaWdodFwiLFxuICAgIFwiTm9zZV9QZWFrX0xvd2VyaW5nXCIsXG4gICAgXCJOb3NlX0JvbmVfVHdpc3RcIixcbiAgICBcIkV5ZUJyb3duX0hlaWdodFwiLFxuICAgIFwiRXllQnJvd25fRm9yd2FyZFwiLFxuICAgIFwiQ2hlZWtzX0JvbmVfSGlnaFwiLFxuICAgIFwiQ2hlZWtzX0JvbmVfV2lkdGhcIixcbiAgICBcIkNoZWVrc19XaWR0aFwiLFxuICAgIFwiRXllc19PcGVubmluZ1wiLFxuICAgIFwiTGlwc19UaGlja25lc3NcIixcbiAgICBcIkphd19Cb25lX1dpZHRoXCIsXG4gICAgXCJKYXdfQm9uZV9CYWNrX0xlbmdodFwiLFxuICAgIFwiQ2hpbl9Cb25lX0xvd2VyaW5nXCIsXG4gICAgXCJDaGluX0JvbmVfTGVuZ3RoXCIsXG4gICAgXCJDaGluX0JvbmVfV2lkdGhcIixcbiAgICBcIkNoaW5fSG9sZVwiLFxuICAgIFwiTmVja19UaGlrbmVzc1wiXG5dXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiZmFjZVwiLFxuICAgIFwibWFza3NcIixcbiAgICBcImhhaXJcIixcbiAgICBcInRvcnNvc1wiLFxuICAgIFwibGVnc1wiLFxuICAgIFwiYmFnc1wiLFxuICAgIFwic2hvZXNcIixcbiAgICBcIm5lY2tcIixcbiAgICBcInNoaXJ0c1wiLFxuICAgIFwidmVzdFwiLFxuICAgIFwiZGVjYWxzXCIsXG4gICAgXCJqYWNrZXRzXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJoYXRzXCIsXG4gICAgXCJnbGFzc2VzXCIsXG4gICAgXCJlYXJyaW5nc1wiLFxuICAgIFwibW91dGhcIixcbiAgICBcImxoYW5kXCIsXG4gICAgXCJyaGFuZFwiLFxuICAgIFwid2F0Y2hlc1wiLFxuICAgIFwiYnJhY2VsZXRzXCJcbl1cbiIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSwgVEhhaXJEYXRhLCBUSGVhZE92ZXJsYXksIFRIZWFkT3ZlcmxheVRvdGFsIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgSEVBRF9PVkVSTEFZUyBmcm9tIFwiQGRhdGEvaGVhZFwiXHJcbmltcG9ydCBGQUNFX0ZFQVRVUkVTIGZyb20gXCJAZGF0YS9mYWNlXCJcclxuaW1wb3J0IERSQVdBQkxFX05BTUVTIGZyb20gXCJAZGF0YS9kcmF3YWJsZXNcIlxyXG5pbXBvcnQgUFJPUF9OQU1FUyBmcm9tIFwiQGRhdGEvcHJvcHNcIlxyXG5pbXBvcnQgeyBwZWQsIG9uU2VydmVyQ2FsbGJhY2sgfSBmcm9tICdAdXRpbHMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRNb2RlbEluZGV4KHRhcmdldDogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxuICAgIGNvbnN0IG1vZGVscyA9IGNvbmZpZy5tb2RlbHMoKVxyXG5cclxuICAgIHJldHVybiBtb2RlbHMuZmluZEluZGV4KChtb2RlbDogc3RyaW5nKSA9PiBHZXRIYXNoS2V5KG1vZGVsKSA9PT0gdGFyZ2V0KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFpcihwZWRIYW5kbGU6IG51bWJlcik6IFRIYWlyRGF0YSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNvbG9yOiBHZXRQZWRIYWlyQ29sb3IocGVkSGFuZGxlKSxcclxuICAgICAgICBoaWdobGlnaHQ6IEdldFBlZEhhaXJIaWdobGlnaHRDb2xvcihwZWRIYW5kbGUpXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGVkcjBmb250b3VyYS9maXZlbS1hcHBlYXJhbmNlL2Jsb2IvbWFpbi9nYW1lL3NyYy9jbGllbnQvaW5kZXgudHMjTDY3XHJcbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoODApO1xyXG4gICAgZ2xvYmFsLkNpdGl6ZW4uaW52b2tlTmF0aXZlKCcweDI3NDZiZDlkODhjNWM1ZDAnLCBwZWRIYW5kbGUsIG5ldyBVaW50MzJBcnJheShidWZmZXIpKTtcclxuXHJcbiAgICBjb25zdCB7IDA6IHNoYXBlRmlyc3QsIDI6IHNoYXBlU2Vjb25kLCA0OiBzaGFwZVRoaXJkLCA2OiBza2luRmlyc3QsIDg6IHNraW5TZWNvbmQsIDE4OiBoYXNQYXJlbnQsIDEwOiBza2luVGhpcmQgfSA9IG5ldyBVaW50MzJBcnJheShidWZmZXIpO1xyXG4gICAgY29uc3QgeyAwOiBzaGFwZU1peCwgMjogc2tpbk1peCwgNDogdGhpcmRNaXggfSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyLCA0OCk7XHJcblxyXG4gICAgLyogICBcclxuICAgICAgICAwOiBzaGFwZUZpcnN0LFxyXG4gICAgICAgIDI6IHNoYXBlU2Vjb25kLFxyXG4gICAgICAgIDQ6IHNoYXBlVGhpcmQsXHJcbiAgICAgICAgNjogc2tpbkZpcnN0LFxyXG4gICAgICAgIDg6IHNraW5TZWNvbmQsXHJcbiAgICAgICAgMTA6IHNraW5UaGlyZCxcclxuICAgICAgICAxODogaGFzUGFyZW50LFxyXG4gICAgKi9cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2hhcGVGaXJzdCwgICAvLyBmYXRoZXJcclxuICAgICAgICBzaGFwZVNlY29uZCwgLy8gbW90aGVyXHJcbiAgICAgICAgc2hhcGVUaGlyZCxcclxuXHJcbiAgICAgICAgc2tpbkZpcnN0LFxyXG4gICAgICAgIHNraW5TZWNvbmQsXHJcbiAgICAgICAgc2tpblRoaXJkLFxyXG5cclxuICAgICAgICBzaGFwZU1peCwgLy8gcmVzZW1ibGFuY2VcclxuXHJcbiAgICAgICAgdGhpcmRNaXgsXHJcbiAgICAgICAgc2tpbk1peCwgICAvLyBza2lucGVyY2VudFxyXG5cclxuICAgICAgICBoYXNQYXJlbnQ6IEJvb2xlYW4oaGFzUGFyZW50KSxcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgbGV0IHRvdGFsczogVEhlYWRPdmVybGF5VG90YWwgPSB7fTtcclxuICAgIGxldCBoZWFkRGF0YTogVEhlYWRPdmVybGF5ID0ge307XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBIRUFEX09WRVJMQVlTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEhFQURfT1ZFUkxBWVNbaV07XHJcbiAgICAgICAgdG90YWxzW292ZXJsYXldID0gR2V0TnVtSGVhZE92ZXJsYXlWYWx1ZXMoaSk7XHJcblxyXG4gICAgICAgIGlmIChvdmVybGF5ID09PSBcIkV5ZUNvbG9yXCIpIHtcclxuICAgICAgICAgICAgaGVhZERhdGFbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBHZXRQZWRFeWVDb2xvcihwZWRIYW5kbGUpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgW18sIG92ZXJsYXlWYWx1ZSwgY29sb3VyVHlwZSwgZmlyc3RDb2xvciwgc2Vjb25kQ29sb3IsIG92ZXJsYXlPcGFjaXR5XSA9IEdldFBlZEhlYWRPdmVybGF5RGF0YShwZWRIYW5kbGUsIGkpO1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5VmFsdWU6IG92ZXJsYXlWYWx1ZSA9PT0gMjU1ID8gLTEgOiBvdmVybGF5VmFsdWUsXHJcbiAgICAgICAgICAgICAgICBjb2xvdXJUeXBlOiBjb2xvdXJUeXBlLFxyXG4gICAgICAgICAgICAgICAgZmlyc3RDb2xvcjogZmlyc3RDb2xvcixcclxuICAgICAgICAgICAgICAgIHNlY29uZENvbG9yOiBzZWNvbmRDb2xvcixcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlPcGFjaXR5OiBvdmVybGF5T3BhY2l0eVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW2hlYWREYXRhLCB0b3RhbHNdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZFN0cnVjdHVyZShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgY29uc3QgcGVkTW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWRIYW5kbGUpXHJcblxyXG4gICAgaWYgKHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSAmJiBwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIikpIHJldHVyblxyXG5cclxuICAgIGxldCBmYWNlU3RydWN0ID0ge31cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRkFDRV9GRUFUVVJFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBGQUNFX0ZFQVRVUkVTW2ldXHJcbiAgICAgICAgZmFjZVN0cnVjdFtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRmFjZUZlYXR1cmUocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFjZVN0cnVjdFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RHJhd2FibGVzKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgZHJhd2FibGVzID0ge31cclxuICAgIGxldCB0b3RhbERyYXdhYmxlcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBEUkFXQUJMRV9OQU1FUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBEUkFXQUJMRV9OQU1FU1tpXVxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWRIYW5kbGUsIGkpXHJcblxyXG4gICAgICAgIHRvdGFsRHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHRvdGFsOiBHZXROdW1iZXJPZlBlZERyYXdhYmxlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogR2V0TnVtYmVyT2ZQZWRUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRyYXdhYmxlc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkSGFuZGxlLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZTogR2V0UGVkVGV4dHVyZVZhcmlhdGlvbihwZWRIYW5kbGUsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbZHJhd2FibGVzLCB0b3RhbERyYXdhYmxlc11cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3BzKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgcHJvcHMgPSB7fVxyXG4gICAgbGV0IHRvdGFsUHJvcHMgPSB7fVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgUFJPUF9OQU1FUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBQUk9QX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZFByb3BJbmRleChwZWRIYW5kbGUsIGkpXHJcblxyXG4gICAgICAgIHRvdGFsUHJvcHNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkUHJvcERyYXdhYmxlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogR2V0TnVtYmVyT2ZQZWRQcm9wVGV4dHVyZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBpLCBjdXJyZW50KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvcHNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZFByb3BJbmRleChwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRQcm9wVGV4dHVyZUluZGV4KHBlZEhhbmRsZSwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtwcm9wcywgdG90YWxQcm9wc11cclxufVxyXG5cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcHBlYXJhbmNlKHBlZEhhbmRsZTogbnVtYmVyKTogUHJvbWlzZTxUQXBwZWFyYW5jZT4ge1xyXG4gICAgY29uc3QgW2hlYWREYXRhLCB0b3RhbHNdID0gZ2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW2RyYXdhYmxlcywgZHJhd1RvdGFsXSA9IGdldERyYXdhYmxlcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbcHJvcHMsIHByb3BUb3RhbF0gPSBnZXRQcm9wcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBtb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1vZGVsSW5kZXg6IGZpbmRNb2RlbEluZGV4KG1vZGVsKSxcclxuICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGVhZEJsZW5kOiBnZXRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGVhZE92ZXJsYXk6IGhlYWREYXRhIGFzIFRIZWFkT3ZlcmxheSxcclxuICAgICAgICBoZWFkT3ZlcmxheVRvdGFsOiB0b3RhbHMgYXMgVEhlYWRPdmVybGF5VG90YWwsXHJcbiAgICAgICAgaGVhZFN0cnVjdHVyZTogZ2V0SGVhZFN0cnVjdHVyZShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgICAgICBkcmF3VG90YWw6IGRyYXdUb3RhbCxcclxuICAgICAgICBwcm9wVG90YWw6IHByb3BUb3RhbCxcclxuICAgICAgICB0YXR0b29zOiBbXVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRBcHBlYXJhbmNlXCIsIGdldEFwcGVhcmFuY2UpXHJcbm9uU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50OmdldEFwcGVhcmFuY2UnLCAoKSA9PiB7XHJcbiAgICByZXR1cm4gZ2V0QXBwZWFyYW5jZShwZWQpXHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBlZENsb3RoZXMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IFtkcmF3YWJsZXNdID0gZ2V0RHJhd2FibGVzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtwcm9wc10gPSBnZXRQcm9wcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbaGVhZERhdGFdID0gZ2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaGVhZE92ZXJsYXk6IGhlYWREYXRhLFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkQ2xvdGhlc1wiLCBnZXRQZWRDbG90aGVzKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBlZFNraW4ocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaGVhZEJsZW5kOiBnZXRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGVhZFN0cnVjdHVyZTogZ2V0SGVhZFN0cnVjdHVyZShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhhaXJDb2xvcjogZ2V0SGFpcihwZWRIYW5kbGUpLFxyXG4gICAgICAgIG1vZGVsOiBHZXRFbnRpdHlNb2RlbChwZWRIYW5kbGUpXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldFBlZFNraW5cIiwgZ2V0UGVkU2tpbilcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUYXR0b29EYXRhKCkge1xyXG4gICAgbGV0IHRhdHRvb1pvbmVzID0gW11cclxuXHJcbiAgICBjb25zdCBbVEFUVE9PX0xJU1QsIFRBVFRPT19DQVRFR09SSUVTXSA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS50YXR0b29zKClcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVEFUVE9PX0NBVEVHT1JJRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBjYXRlZ29yeSA9IFRBVFRPT19DQVRFR09SSUVTW2ldXHJcbiAgICAgICAgY29uc3Qgem9uZSA9IGNhdGVnb3J5LnpvbmVcclxuICAgICAgICBjb25zdCBsYWJlbCA9IGNhdGVnb3J5LmxhYmVsXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBjYXRlZ29yeS5pbmRleFxyXG4gICAgICAgIHRhdHRvb1pvbmVzW2luZGV4XSA9IHtcclxuICAgICAgICAgICAgem9uZTogem9uZSxcclxuICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxyXG4gICAgICAgICAgICB6b25lSW5kZXg6IGluZGV4LFxyXG4gICAgICAgICAgICBkbGNzOiBbXVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBUQVRUT09fTElTVC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBjb25zdCBkbGNEYXRhID0gVEFUVE9PX0xJU1Rbal1cclxuICAgICAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdLmRsY3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZGxjRGF0YS5kbGMsXHJcbiAgICAgICAgICAgICAgICBkbGNJbmRleDogaixcclxuICAgICAgICAgICAgICAgIHRhdHRvb3M6IFtdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlzRmVtYWxlID0gR2V0RW50aXR5TW9kZWwocGVkKSA9PT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIilcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFRBVFRPT19MSVNULmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IFRBVFRPT19MSVNUW2ldXHJcbiAgICAgICAgY29uc3QgeyBkbGMsIHRhdHRvb3MgfSA9IGRhdGFcclxuICAgICAgICBjb25zdCBkbGNIYXNoID0gR2V0SGFzaEtleShkbGMpXHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0YXR0b29zLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvb0RhdGEgPSB0YXR0b29zW2pdXHJcbiAgICAgICAgICAgIGxldCB0YXR0b28gPSBudWxsXHJcblxyXG4gICAgICAgICAgICBjb25zdCBsb3dlclRhdHRvbyA9IHRhdHRvb0RhdGEudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICBjb25zdCBpc0ZlbWFsZVRhdHRvbyA9IGxvd2VyVGF0dG9vLmluY2x1ZGVzKFwiX2ZcIilcclxuICAgICAgICAgICAgaWYgKGlzRmVtYWxlVGF0dG9vICYmIGlzRmVtYWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXR0b28gPSB0YXR0b29EYXRhXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzRmVtYWxlVGF0dG9vICYmICFpc0ZlbWFsZSkge1xyXG4gICAgICAgICAgICAgICAgdGF0dG9vID0gdGF0dG9vRGF0YVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaGFzaCA9IG51bGxcclxuICAgICAgICAgICAgbGV0IHpvbmUgPSAtMVxyXG5cclxuICAgICAgICAgICAgaWYgKHRhdHRvbykge1xyXG4gICAgICAgICAgICAgICAgaGFzaCA9IEdldEhhc2hLZXkodGF0dG9vKVxyXG4gICAgICAgICAgICAgICAgem9uZSA9IEdldFBlZERlY29yYXRpb25ab25lRnJvbUhhc2hlcyhkbGNIYXNoLCBoYXNoKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoem9uZSAhPT0gLTEgJiYgaGFzaCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgem9uZVRhdHRvb3MgPSB0YXR0b29ab25lc1t6b25lXS5kbGNzW2ldLnRhdHRvb3NcclxuXHJcbiAgICAgICAgICAgICAgICB6b25lVGF0dG9vcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGF0dG9vLFxyXG4gICAgICAgICAgICAgICAgICAgIGhhc2g6IGhhc2gsXHJcbiAgICAgICAgICAgICAgICAgICAgem9uZTogem9uZSxcclxuICAgICAgICAgICAgICAgICAgICBkbGM6IGRsYyxcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhdHRvb1pvbmVzXHJcbn1cclxuXHJcbi8vbWlncmF0aW9uXHJcblxyXG5vblNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDptaWdyYXRpb246c2V0QXBwZWFyYW5jZScsIChkYXRhOiB7dHlwZTogc3RyaW5nLCBkYXRhOiBhbnl9KSA9PiB7XHJcbiAgICBpZiAoZGF0YS50eXBlID09PSAnZml2ZW0nKSBleHBvcnRzWydmaXZlbS1hcHBlYXJhbmNlJ10uc2V0UGxheWVyQXBwZWFyYW5jZShkYXRhLmRhdGEpXHJcbiAgICBpZiAoZGF0YS50eXBlID09PSAnaWxsZW5pdW0nKSBleHBvcnRzWydpbGxlbml1bS1hcHBlYXJhbmNlJ10uc2V0UGxheWVyQXBwZWFyYW5jZShkYXRhLmRhdGEpXHJcbn0pOyIsICJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICAgIGhhdHM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMCxcclxuICAgIH0sXHJcbiAgICBnbGFzc2VzOiB7XHJcbiAgICAgICAgdHlwZTogXCJwcm9wXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICB9LFxyXG4gICAgbWFza3M6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICAgICAgb2ZmOiAwLFxyXG4gICAgfSxcclxuICAgIHNoaXJ0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogOCxcclxuICAgICAgICBvZmY6IDE1LFxyXG4gICAgICAgIGhvb2s6IHtcclxuICAgICAgICAgICAgZHJhd2FibGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogMywgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAndG9yc29zJyB9LFxyXG4gICAgICAgICAgICAgICAgeyBjb21wb25lbnQ6IDExLCB2YXJpYW50OiAxNSwgdGV4dHVyZTogMCwgaWQ6ICdqYWNrZXRzJ31cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBqYWNrZXRzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiAxMSxcclxuICAgICAgICBvZmY6IDE1LFxyXG4gICAgICAgIGhvb2s6IHtcclxuICAgICAgICAgICAgZHJhd2FibGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogMywgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAndG9yc29zJyB9LFxyXG4gICAgICAgICAgICAgICAgeyBjb21wb25lbnQ6IDgsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ3NoaXJ0cyd9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgbGVnczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogNCxcclxuICAgICAgICBvZmY6IDExLFxyXG4gICAgfSxcclxuICAgIHNob2VzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA2LFxyXG4gICAgICAgIG9mZjogMTMsXHJcbiAgICB9XHJcbn0iLCAiaW1wb3J0IHsgVFZhbHVlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIjtcclxuaW1wb3J0IFRPR0dMRV9JTkRFWEVTIGZyb20gXCJAZGF0YS90b2dnbGVzXCJcclxuaW1wb3J0IHsgcmVxdWVzdE1vZGVsLCBwZWQsIHVwZGF0ZVBlZCwgZGVsYXl9IGZyb20gJ0B1dGlscyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0RHJhd2FibGUocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCAwKVxyXG4gICAgcmV0dXJuIEdldE51bWJlck9mUGVkVGV4dHVyZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJvcChwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBpZiAoZGF0YS52YWx1ZSA9PT0gLTEpIHtcclxuICAgICAgICBDbGVhclBlZFByb3AocGVkSGFuZGxlLCBkYXRhLmluZGV4KVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIFNldFBlZFByb3BJbmRleChwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgZmFsc2UpXHJcbiAgICByZXR1cm4gR2V0TnVtYmVyT2ZQZWRQcm9wVGV4dHVyZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2V0TW9kZWwgPSBhc3luYyAobW9kZWw6IG51bWJlcikgPT4ge1xyXG4gICAgY29uc3QgbW9kZWxIYXNoID0gYXdhaXQgcmVxdWVzdE1vZGVsKG1vZGVsKVxyXG4gICAgU2V0UGxheWVyTW9kZWwoUGxheWVySWQoKSwgbW9kZWxIYXNoKVxyXG4gICAgU2V0TW9kZWxBc05vTG9uZ2VyTmVlZGVkKG1vZGVsSGFzaClcclxuICAgIGNvbnN0IHBlZEhhbmRsZSA9IFBsYXllclBlZElkKClcclxuICAgIHVwZGF0ZVBlZChwZWRIYW5kbGUpXHJcbiAgICBTZXRQZWREZWZhdWx0Q29tcG9uZW50VmFyaWF0aW9uKHBlZEhhbmRsZSlcclxuXHJcbiAgICBpZiAobW9kZWxIYXNoID09PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSkgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWQsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIGZhbHNlKVxyXG4gICAgZWxzZSBpZiAobW9kZWxIYXNoID09PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKSkgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWQsIDQ1LCAyMSwgMCwgMjAsIDE1LCAwLCAwLjMsIDAuMSwgMCwgZmFsc2UpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBTZXRGYWNlRmVhdHVyZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBTZXRQZWRGYWNlRmVhdHVyZShwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUgKyAwLjApXHJcbn1cclxuXHJcbmNvbnN0IGlzUG9zaXRpdmUgPSAodmFsOiBudW1iZXIpID0+IHZhbCA+PSAwID8gdmFsIDogMFxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEhlYWRCbGVuZChwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgY29uc3Qgc2hhcGVGaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZUZpcnN0KVxyXG4gICAgY29uc3Qgc2hhcGVTZWNvbmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVTZWNvbmQpXHJcbiAgICBjb25zdCBzaGFwZVRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlVGhpcmQpXHJcbiAgICBjb25zdCBza2luRmlyc3QgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpbkZpcnN0KVxyXG4gICAgY29uc3Qgc2tpblNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5za2luU2Vjb25kKVxyXG4gICAgY29uc3Qgc2tpblRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNraW5UaGlyZClcclxuICAgIGNvbnN0IHNoYXBlTWl4ID0gZGF0YS5zaGFwZU1peCArIDAuMFxyXG4gICAgY29uc3Qgc2tpbk1peCA9IGRhdGEuc2tpbk1peCArIDAuMFxyXG4gICAgY29uc3QgdGhpcmRNaXggPSBkYXRhLnRoaXJkTWl4ICsgMC4wXHJcbiAgICBjb25zdCBoYXNQYXJlbnQgPSBkYXRhLmhhc1BhcmVudFxyXG5cclxuICAgIFNldFBlZEhlYWRCbGVuZERhdGEocGVkSGFuZGxlLCBzaGFwZUZpcnN0LCBzaGFwZVNlY29uZCwgc2hhcGVUaGlyZCwgc2tpbkZpcnN0LCBza2luU2Vjb25kLCBza2luVGhpcmQsIHNoYXBlTWl4LCBza2luTWl4LCB0aGlyZE1peCwgaGFzUGFyZW50KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIGNvbnN0IGluZGV4ID0gZGF0YS5pbmRleFxyXG5cclxuICAgIGlmIChpbmRleCA9PT0gMTMpIHtcclxuICAgICAgICBTZXRQZWRFeWVDb2xvcihwZWRIYW5kbGUsIGRhdGEudmFsdWUpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmFsdWUgPSBkYXRhLm92ZXJsYXlWYWx1ZVxyXG5cclxuICAgIC8qIEhhaXIgY29sb3IgZG9lcyBub3QgaGF2ZSBhbiBpbmRleCwgb25seSBhbiBJRCBzbyB3ZSdsbCBjaGVjayBmb3IgdGhhdCAqL1xyXG4gICAgaWYgKGRhdGEuaWQgPT09ICdoYWlyQ29sb3InKSB7XHJcbiAgICAgICAgU2V0UGVkSGFpclRpbnQocGVkSGFuZGxlLCBkYXRhLmhhaXJDb2xvciwgZGF0YS5oYWlySGlnaGxpZ2h0KVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBTZXRQZWRIZWFkT3ZlcmxheShwZWRIYW5kbGUsIGluZGV4LCB2YWx1ZSwgZGF0YS5vdmVybGF5T3BhY2l0eSArIDAuMClcclxuICAgIFNldFBlZEhlYWRPdmVybGF5Q29sb3IocGVkSGFuZGxlLCBpbmRleCwgMSwgZGF0YS5maXJzdENvbG9yLCBkYXRhLnNlY29uZENvbG9yKVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0VG9nZ2xlcyhkYXRhKSB7XHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcblxyXG4gICAgZm9yIChjb25zdCBbdG9nZ2xlSXRlbSwgdG9nZ2xlRGF0YV0gb2YgT2JqZWN0LmVudHJpZXMoVE9HR0xFX0lOREVYRVMpKSB7XHJcbiAgICAgICAgY29uc3QgdG9nZ2xlVHlwZSA9IHRvZ2dsZURhdGEudHlwZVxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdG9nZ2xlRGF0YS5pbmRleFxyXG5cclxuICAgICAgICBpZiAodG9nZ2xlVHlwZSA9PT0gXCJkcmF3YWJsZVwiICYmIGRyYXdhYmxlc1t0b2dnbGVJdGVtXSkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudERyYXdhYmxlICE9PSBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHRvZ2dsZVR5cGUgPT09IFwicHJvcFwiICYmIHByb3BzW3RvZ2dsZUl0ZW1dKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UHJvcCAhPT0gcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZFByb3BJbmRleChwZWQsIGluZGV4LCBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgZmFsc2UpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRDbG90aGVzKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcbiAgICBjb25zdCBoZWFkT3ZlcmxheSA9IGRhdGEuaGVhZE92ZXJsYXlcclxuICAgIGZvciAoY29uc3QgaWQgaW4gZHJhd2FibGVzKSB7XHJcbiAgICAgICAgY29uc3QgZHJhd2FibGUgPSBkcmF3YWJsZXNbaWRdXHJcbiAgICAgICAgc2V0RHJhd2FibGUocGVkSGFuZGxlLCBkcmF3YWJsZSlcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIHByb3BzKSB7XHJcbiAgICAgICAgY29uc3QgcHJvcCA9IHByb3BzW2lkXVxyXG4gICAgICAgIHNldFByb3AocGVkSGFuZGxlLCBwcm9wKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgaWQgaW4gaGVhZE92ZXJsYXkpIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gaGVhZE92ZXJsYXlbaWRdXHJcbiAgICAgICAgc2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlLCBvdmVybGF5KVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2V0UGVkU2tpbiA9IGFzeW5jIChkYXRhKSA9PiB7XHJcbiAgICBjb25zdCBoZWFkU3RydWN0dXJlID0gZGF0YS5oZWFkU3RydWN0dXJlXHJcbiAgICBjb25zdCBoZWFkQmxlbmQgPSBkYXRhLmhlYWRCbGVuZFxyXG5cclxuICAgIGF3YWl0IHNldE1vZGVsKGRhdGEubW9kZWwpXHJcblxyXG4gICAgaWYgKGhlYWRCbGVuZCkgc2V0SGVhZEJsZW5kKHBlZCwgaGVhZEJsZW5kKVxyXG4gICAgXHJcbiAgICBpZiAoaGVhZFN0cnVjdHVyZSkgZm9yIChjb25zdCBmZWF0dXJlIGluIGhlYWRTdHJ1Y3R1cmUpIHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IGhlYWRTdHJ1Y3R1cmVbZmVhdHVyZV1cclxuICAgICAgICBTZXRGYWNlRmVhdHVyZShwZWQsIHZhbHVlKVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkVGF0dG9vcyhwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm5cclxuXHJcbiAgICBDbGVhclBlZERlY29yYXRpb25zTGVhdmVTY2FycyhwZWRIYW5kbGUpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IGRhdGFbaV0udGF0dG9vXHJcbiAgICAgICAgaWYgKHRhdHRvb0RhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IEdldEhhc2hLZXkodGF0dG9vRGF0YS5kbGMpXHJcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvbyA9IHRhdHRvb0RhdGEuaGFzaFxyXG4gICAgICAgICAgICBBZGRQZWREZWNvcmF0aW9uRnJvbUhhc2hlcyhwZWRIYW5kbGUsIGNvbGxlY3Rpb24sIHRhdHRvbylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRIYWlyQ29sb3JzKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBjb25zdCBjb2xvciA9IGRhdGEuY29sb3JcclxuICAgIGNvbnN0IGhpZ2hsaWdodCA9IGRhdGEuaGlnaGxpZ2h0XHJcbiAgICBTZXRQZWRIYWlyQ29sb3IocGVkSGFuZGxlLCBjb2xvciwgaGlnaGxpZ2h0KVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGVkQXBwZWFyYW5jZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgYXdhaXQgc2V0UGVkU2tpbihkYXRhKVxyXG4gICAgc2V0UGVkQ2xvdGhlcyhwZWRIYW5kbGUsIGRhdGEpXHJcbiAgICBzZXRQZWRIYWlyQ29sb3JzKHBlZEhhbmRsZSwgZGF0YS5oYWlyQ29sb3IpXHJcbiAgICBzZXRQZWRUYXR0b29zKHBlZEhhbmRsZSwgZGF0YS50YXR0b29zKVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGxheWVyUGVkQXBwZWFyYW5jZShkYXRhKSB7XHJcbiAgICBhd2FpdCBzZXRQZWRTa2luKGRhdGEpXHJcbiAgICBzZXRQZWRDbG90aGVzKHBlZCwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMocGVkLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MocGVkLCBkYXRhLnRhdHRvb3MpXHJcbn1cclxuXHJcbmV4cG9ydHMoJ1NldFBlZENsb3RoZXMnLCBzZXRQZWRDbG90aGVzKVxyXG5leHBvcnRzKCdTZXRQZWRTa2luJywgc2V0UGVkU2tpbilcclxuZXhwb3J0cygnU2V0UGVkVGF0dG9vcycsIHNldFBlZFRhdHRvb3MpXHJcbmV4cG9ydHMoJ1NldFBlZEhhaXJDb2xvcnMnLCBzZXRQZWRIYWlyQ29sb3JzKSIsICJpbXBvcnQgeyBSZWNlaXZlIH0gZnJvbSAnQGV2ZW50cyc7XHJcbmltcG9ydCB7XHJcblx0cmVzZXRUb2dnbGVzLFxyXG5cdHNldERyYXdhYmxlLFxyXG5cdFNldEZhY2VGZWF0dXJlLFxyXG5cdHNldEhlYWRCbGVuZCxcclxuXHRzZXRIZWFkT3ZlcmxheSxcclxuXHRzZXRNb2RlbCxcclxuXHRzZXRQZWRDbG90aGVzLFxyXG5cdHNldFBlZFRhdHRvb3MsXHJcblx0c2V0UGxheWVyUGVkQXBwZWFyYW5jZSxcclxuXHRzZXRQcm9wLFxyXG59IGZyb20gJy4vYXBwZWFyYW5jZS9zZXR0ZXJzJztcclxuaW1wb3J0IHsgY2xvc2VNZW51IH0gZnJvbSAnLi9tZW51JztcclxuaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRUb2dnbGVEYXRhLCBUVmFsdWUgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgZGVsYXksIGdldEZyYW1ld29ya0lELCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIHBlZCB9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldFRhdHRvb0RhdGEgfSBmcm9tICcuL2FwcGVhcmFuY2UvZ2V0dGVycyc7XHJcbmltcG9ydCBUT0dHTEVfSU5ERVhFUyBmcm9tICdAZGF0YS90b2dnbGVzJztcclxuaW1wb3J0IHsgT3V0Zml0IH0gZnJvbSAnQHR5cGluZ3Mvb3V0Zml0cyc7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FuY2VsLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSk7XHJcblx0Y2xvc2VNZW51KCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNhdmUsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0cmVzZXRUb2dnbGVzKGFwcGVhcmFuY2UpO1xyXG5cclxuXHRhd2FpdCBkZWxheSgxMDApO1xyXG5cclxuXHRjb25zdCBuZXdBcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cdG5ld0FwcGVhcmFuY2UudGF0dG9vcyA9IGFwcGVhcmFuY2UudGF0dG9vcztcclxuXHR0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVBcHBlYXJhbmNlJywgZ2V0RnJhbWV3b3JrSUQoKSwgbmV3QXBwZWFyYW5jZSk7XHJcblxyXG5cdHNldFBlZFRhdHRvb3MocGVkLCBuZXdBcHBlYXJhbmNlLnRhdHRvb3MpO1xyXG5cclxuXHRjbG9zZU1lbnUoKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0TW9kZWwsIGFzeW5jIChtb2RlbDogc3RyaW5nLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBoYXNoID0gR2V0SGFzaEtleShtb2RlbCk7XHJcblx0aWYgKCFJc01vZGVsSW5DZGltYWdlKGhhc2gpIHx8ICFJc01vZGVsVmFsaWQoaGFzaCkpIHtcclxuXHRcdHJldHVybiBjYigwKTtcclxuXHR9XHJcblxyXG5cdGF3YWl0IHNldE1vZGVsKGhhc2gpO1xyXG5cclxuXHRjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cclxuXHRhcHBlYXJhbmNlLnRhdHRvb3MgPSBbXTtcclxuXHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIFtdKTtcclxuXHJcblx0Y2IoYXBwZWFyYW5jZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmdldE1vZGVsVGF0dG9vcywgYXN5bmMgKF86IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgdGF0dG9vcyA9IGdldFRhdHRvb0RhdGEoKTtcclxuXHJcblx0Y2IodGF0dG9vcyk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRTdHJ1Y3R1cmUsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdFNldEZhY2VGZWF0dXJlKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRPdmVybGF5LCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRIZWFkT3ZlcmxheShwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRIZWFkQmxlbmQsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldEhlYWRCbGVuZChwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRUYXR0b29zLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFByb3AsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGxldCB0ZXh0dXJlID0gc2V0UHJvcChwZWQsIGRhdGEpO1xyXG5cdGNiKHRleHR1cmUpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXREcmF3YWJsZSwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0bGV0IHRleHR1cmUgPSBzZXREcmF3YWJsZShwZWQsIGRhdGEpO1xyXG5cdGNiKHRleHR1cmUpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS50b2dnbGVJdGVtLCBhc3luYyAoZGF0YTogVFRvZ2dsZURhdGEsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGl0ZW0gPSBUT0dHTEVfSU5ERVhFU1tkYXRhLml0ZW1dO1xyXG5cdGlmICghaXRlbSkgcmV0dXJuIGNiKGZhbHNlKTtcclxuXHJcblx0Y29uc3QgY3VycmVudCA9IGRhdGEuZGF0YTtcclxuXHRjb25zdCB0eXBlID0gaXRlbS50eXBlO1xyXG5cdGNvbnN0IGluZGV4ID0gaXRlbS5pbmRleDtcclxuXHRjb25zdCBob29rID0gaXRlbS5ob29rO1xyXG5cdGNvbnN0IGhvb2tEYXRhID0gZGF0YS5ob29rRGF0YTtcclxuXHJcblx0aWYgKCFjdXJyZW50KSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRpZiAodHlwZSA9PT0gJ3Byb3AnKSB7XHJcblx0XHRjb25zdCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KTtcclxuXHJcblx0XHRpZiAoY3VycmVudFByb3AgPT09IC0xKSB7XHJcblx0XHRcdHNldFByb3AocGVkLCBjdXJyZW50KTtcclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRDbGVhclBlZFByb3AocGVkLCBpbmRleCk7XHJcblx0XHRcdGNiKHRydWUpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fSBlbHNlIGlmICh0eXBlID09PSAnZHJhd2FibGUnKSB7XHJcblx0XHRjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KTtcclxuXHJcblx0XHRpZiAoY3VycmVudC52YWx1ZSA9PT0gaXRlbS5vZmYpIHtcclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGN1cnJlbnQudmFsdWUgPT09IGN1cnJlbnREcmF3YWJsZSkge1xyXG5cdFx0XHRTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgaXRlbS5vZmYsIDAsIDApO1xyXG5cdFx0XHRpZiAoaG9vaykge1xyXG5cdFx0XHRcdGZvcihsZXQgaT0wOyBpIDwgaG9vay5kcmF3YWJsZXM/Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRjb25zdCBob29rSXRlbSA9IGhvb2suZHJhd2FibGVzW2ldO1xyXG5cdFx0XHRcdFx0U2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaG9va0l0ZW0uY29tcG9uZW50LCBob29rSXRlbS52YXJpYW50LCBob29rSXRlbS50ZXh0dXJlLCAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Y2IodHJ1ZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHNldERyYXdhYmxlKHBlZCwgY3VycmVudCk7XHJcblx0XHRcdGZvcihsZXQgaT0wOyBpIDwgaG9va0RhdGE/Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0c2V0RHJhd2FibGUocGVkLCBob29rRGF0YVtpXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2F2ZU91dGZpdCwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmRlbGV0ZU91dGZpdCwgYXN5bmMgKHtpZH0sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpkZWxldGVPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGlkKTtcclxuXHRjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5yZW5hbWVPdXRmaXQsIGFzeW5jIChkYXRhOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZW5hbWVPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnVzZU91dGZpdCwgYXN5bmMgKG91dGZpdDogT3V0Zml0LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQZWRDbG90aGVzKHBlZCwgb3V0Zml0KTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuaW1wb3J0T3V0Zml0LCBhc3luYyAoeyBpZCwgb3V0Zml0TmFtZSB9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6aW1wb3J0T3V0Zml0JywgZnJhbWV3b3JrZElkLCBpZCwgb3V0Zml0TmFtZSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZ3JhYk91dGZpdCwgYXN5bmMgKHsgaWQgfSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpncmFiT3V0Zml0JywgaWQpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLml0ZW1PdXRmaXQsIGFzeW5jIChkYXRhOiB7b3V0Zml0OiBPdXRmaXQsIGxhYmVsOiBzdHJpbmd9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOml0ZW1PdXRmaXQnLGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxub25OZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnVzZU91dGZpdCcsIChvdXRmaXQ6IE91dGZpdCkgPT4ge1xyXG5cdHNldFBlZENsb3RoZXMocGVkLCBvdXRmaXQpO1xyXG59KSIsICJpbXBvcnQgeyBnZXRGcmFtZXdvcmtJRCwgcmVxdWVzdExvY2FsZSwgc2VuZE5VSUV2ZW50LCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIHVwZGF0ZVBlZCwgcGVkLCBnZXRQbGF5ZXJEYXRhLCBnZXRKb2JJbmZvIH0gZnJvbSBcIkB1dGlsc1wiXHJcbmltcG9ydCB7IHN0YXJ0Q2FtZXJhLCBzdG9wQ2FtZXJhIH0gZnJvbSBcIi4vY2FtZXJhXCJcclxuaW1wb3J0IHR5cGUgeyBUQXBwZWFyYW5jZVpvbmUgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gXCJAdHlwaW5ncy9vdXRmaXRzXCJcclxuaW1wb3J0IHsgU2VuZCB9IGZyb20gXCJAZXZlbnRzXCJcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0VGF0dG9vRGF0YSB9IGZyb20gXCIuL2FwcGVhcmFuY2UvZ2V0dGVyc1wiXHJcbmltcG9ydCBcIi4vaGFuZGxlcnNcIlxyXG5cclxuY29uc3QgY29uZmlnID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlXHJcbmxldCBhcm1vdXIgPSAwXHJcbmxldCBvcGVuID0gZmFsc2VcclxuXHJcbmxldCByZXNvbHZlUHJvbWlzZSA9IG51bGw7XHJcbmxldCBwcm9taXNlID0gbnVsbDtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuTWVudSh6b25lOiBUQXBwZWFyYW5jZVpvbmUsIGNyZWF0aW9uOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgIGlmICh6b25lID09PSBudWxsIHx8IG9wZW4pIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGVkSGFuZGxlID0gUGxheWVyUGVkSWQoKVxyXG4gICAgY29uc3QgY29uZmlnTWVudXMgPSBjb25maWcubWVudXMoKVxyXG5cclxuICAgIGNvbnN0IHR5cGUgPSB6b25lLnR5cGVcclxuXHJcbiAgICBjb25zdCBtZW51ID0gY29uZmlnTWVudXNbdHlwZV1cclxuICAgIGlmICghbWVudSkgcmV0dXJuXHJcblxyXG4gICAgdXBkYXRlUGVkKHBlZEhhbmRsZSlcclxuICAgIHN0YXJ0Q2FtZXJhKClcclxuXHJcbiAgICBjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICBjb25zdCB0YWJzID0gbWVudS50YWJzXHJcbiAgICBsZXQgYWxsb3dFeGl0ID0gbWVudS5hbGxvd0V4aXRcclxuXHJcbiAgICBhcm1vdXIgPSBHZXRQZWRBcm1vdXIocGVkSGFuZGxlKVxyXG5cclxuICAgIGxldCBvdXRmaXRzID0gW11cclxuXHJcbiAgICBjb25zdCBoYXNPdXRmaXRUYWIgPSB0YWJzLmluY2x1ZGVzKCdvdXRmaXRzJylcclxuICAgIGlmIChoYXNPdXRmaXRUYWIpIG91dGZpdHMgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8T3V0Zml0W10+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRPdXRmaXRzJywgZnJhbWV3b3JrZElkKSBhcyBPdXRmaXRbXVxyXG5cclxuICAgIGxldCBtb2RlbHMgPSBbXVxyXG5cclxuICAgIGNvbnN0IGhhc0hlcml0YWdlVGFiID0gdGFicy5pbmNsdWRlcygnaGVyaXRhZ2UnKVxyXG4gICAgaWYgKGhhc0hlcml0YWdlVGFiKSB7XHJcbiAgICAgICAgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaGFzVGF0dG9vVGFiID0gdGFicy5pbmNsdWRlcygndGF0dG9vcycpXHJcbiAgICBsZXQgdGF0dG9vc1xyXG4gICAgaWYgKGhhc1RhdHRvb1RhYikge1xyXG4gICAgICAgIHRhdHRvb3MgPSBnZXRUYXR0b29EYXRhKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBibGFja2xpc3QgPSBnZXRCbGFja2xpc3Qoem9uZSlcclxuXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWRIYW5kbGUpXHJcblxyXG4gICAgaWYgKGNyZWF0aW9uKSB7XHJcbiAgICAgICAgZW1pdE5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2V0cm91dGluZ2J1Y2tldCcpXHJcbiAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHNlbmROVUlFdmVudChTZW5kLmRhdGEsIHtcclxuICAgICAgICB0YWJzLFxyXG4gICAgICAgIGFwcGVhcmFuY2UsXHJcbiAgICAgICAgYmxhY2tsaXN0LFxyXG4gICAgICAgIHRhdHRvb3MsXHJcbiAgICAgICAgb3V0Zml0cyxcclxuICAgICAgICBtb2RlbHMsXHJcbiAgICAgICAgYWxsb3dFeGl0LFxyXG4gICAgICAgIGpvYjogZ2V0Sm9iSW5mbygpLFxyXG4gICAgICAgIGxvY2FsZTogYXdhaXQgcmVxdWVzdExvY2FsZSgnbG9jYWxlJylcclxuICAgIH0pXHJcbiAgICBTZXROdWlGb2N1cyh0cnVlLCB0cnVlKVxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQudmlzaWJsZSwgdHJ1ZSlcclxuICAgIG9wZW4gPSB0cnVlXHJcblxyXG4gICAgaWYgKHByb21pc2UpIHtcclxuICAgICAgICBhd2FpdCBwcm9taXNlXHJcbiAgICAgICAgZW1pdE5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6cmVzZXRyb3V0aW5nYnVja2V0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvbWlzZSA9IG51bGw7XHJcbiAgICByZXNvbHZlUHJvbWlzZSA9IG51bGw7XHJcbiAgICByZXR1cm4gdHJ1ZVxyXG59XHJcblxyXG5leHBvcnRzKCdvcGVuTWVudScsIG9wZW5NZW51KVxyXG5cclxuZnVuY3Rpb24gZ2V0QmxhY2tsaXN0KHpvbmU6IFRBcHBlYXJhbmNlWm9uZSkge1xyXG4gICAgaWYgKCF6b25lKSByZXR1cm4ge31cclxuXHJcbiAgICBjb25zdCB7Z3JvdXBUeXBlcywgYmFzZX0gPSBjb25maWcuYmxhY2tsaXN0KClcclxuXHJcbiAgICBpZiAoIWdyb3VwVHlwZXMpIHJldHVybiB7fVxyXG4gICAgaWYgKCFiYXNlKSByZXR1cm4ge31cclxuXHJcbiAgICBsZXQgYmxhY2tsaXN0ID0gey4uLmJhc2V9XHJcblxyXG4gICAgY29uc3QgcGxheWVyRGF0YSA9IGdldFBsYXllckRhdGEoKVxyXG5cclxuXHJcbiAgICBmb3IgKGNvbnN0IHR5cGUgaW4gZ3JvdXBUeXBlcykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwcyA9IGdyb3VwVHlwZXNbdHlwZV1cclxuICAgICAgICBmb3IgKGNvbnN0IGdyb3VwIGluIGdyb3Vwcykge1xyXG5cclxuICAgICAgICAgICAgbGV0IHNraXA6IGJvb2xlYW4gPSBmYWxzZVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ2pvYnMnICYmIHpvbmUuam9icykge1xyXG4gICAgICAgICAgICAgICAgc2tpcCA9IHpvbmUuam9icy5pbmNsdWRlcyhwbGF5ZXJEYXRhLmpvYi5uYW1lKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZSA9PSAnZ2FuZ3MnICYmIHpvbmUuZ2FuZ3MpIHtcclxuICAgICAgICAgICAgICAgIHNraXAgPSB6b25lLmdhbmdzLmluY2x1ZGVzKHBsYXllckRhdGEuZ2FuZy5uYW1lKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiAodHlwZSA9PSAnZ3JvdXBzJyAmJiB6b25lLmdyb3Vwcykge1xyXG4gICAgICAgICAgICAvLyAgICAgc2tpcCA9ICF6b25lLmdyb3Vwcy5pbmNsdWRlcyhwbGF5ZXJEYXRhLmdyb3VwLm5hbWUpXHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghc2tpcCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ3JvdXBCbGFja2xpc3QgPSBncm91cHNbZ3JvdXBdXHJcbiAgICAgICAgICAgICAgICBibGFja2xpc3QgPSBPYmplY3QuYXNzaWduKHt9LCBibGFja2xpc3QsIGdyb3VwQmxhY2tsaXN0LCB7XHJcbiAgICAgICAgICAgICAgICAgIGRyYXdhYmxlczogT2JqZWN0LmFzc2lnbih7fSwgYmxhY2tsaXN0LmRyYXdhYmxlcywgZ3JvdXBCbGFja2xpc3QuZHJhd2FibGVzKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYmxhY2tsaXN0XHJcblxyXG4gICAgLy8gcmV0dXJuIGJsYWNrbGlzdFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VNZW51KCkge1xyXG4gICAgU2V0UGVkQXJtb3VyKHBlZCwgYXJtb3VyKVxyXG5cclxuICAgIHN0b3BDYW1lcmEoKVxyXG4gICAgU2V0TnVpRm9jdXMoZmFsc2UsIGZhbHNlKVxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQudmlzaWJsZSwgZmFsc2UpXHJcblxyXG4gICAgaWYgKHJlc29sdmVQcm9taXNlKSB7XHJcbiAgICAgICAgcmVzb2x2ZVByb21pc2UoKTtcclxuICAgIH1cclxuICAgIG9wZW4gPSBmYWxzZVxyXG59IiwgIlxuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXG5pbXBvcnQgeyBzZXRQZWRBcHBlYXJhbmNlIH0gZnJvbSBcIi4uL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXG5pbXBvcnQgeyBvcGVuTWVudSB9IGZyb20gXCIuLi9tZW51XCJcblxuZXhwb3J0IGZ1bmN0aW9uIFFCQnJpZGdlKCkge1xuICAgIG9uTmV0KCdxYi1jbG90aGluZzpjbGllbnQ6bG9hZFBsYXllckNsb3RoaW5nJywgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICBhd2FpdCBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcbiAgICB9KVxuXG4gICAgb25OZXQoJ3FiLWNsb3RoZXM6Y2xpZW50OkNyZWF0ZUZpcnN0Q2hhcmFjdGVyJywgKCkgPT4ge1xuICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKClcbiAgICB9KVxuXG4gICAgb25OZXQoJ3FiLWNsb3RoaW5nOmNsaWVudDpvcGVuT3V0Zml0TWVudScsICgpID0+IHtcbiAgICAgICAgb3Blbk1lbnUoeyB0eXBlOiBcIm91dGZpdHNcIiwgY29vcmRzOiBbMCwgMCwgMCwgMF0gfSkgIFxuICAgIH0pXG59IiwgIlxuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXG5pbXBvcnQgeyBzZXRQZWRBcHBlYXJhbmNlLCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlIH0gZnJvbSBcIi4uL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXG5pbXBvcnQgeyBnZXRGcmFtZXdvcmtJRCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSBcIkB1dGlsc1wiXG5cbmV4cG9ydCBmdW5jdGlvbiBFU1hCcmlkZ2UoKSB7XG4gICAgbGV0IGZpcnN0U3Bhd24gPSBmYWxzZVxuXG4gICAgb24oXCJlc3hfc2tpbjpyZXNldEZpcnN0U3Bhd25cIiwgKCkgPT4ge1xuICAgICAgICBmaXJzdFNwYXduID0gdHJ1ZVxuICAgIH0pO1xuXG4gICAgb24oXCJlc3hfc2tpbjpwbGF5ZXJSZWdpc3RlcmVkXCIsICgpID0+IHtcbiAgICAgICAgaWYoZmlyc3RTcGF3bilcbiAgICAgICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24oKVxuICAgIH0pO1xuXG4gICAgb25OZXQoJ3NraW5jaGFuZ2VyOmxvYWRTa2luMicsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgcGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgYXdhaXQgc2V0UGVkQXBwZWFyYW5jZShwZWQsIGFwcGVhcmFuY2UpXG4gICAgfSk7XG5cbiAgICBvbk5ldCgnc2tpbmNoYW5nZXI6Z2V0U2tpbicsIGFzeW5jIChjYjogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGZyYW1ld29ya0lEID0gYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxuICAgICAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxuICAgICAgICBjYihhcHBlYXJhbmNlKVxuICAgIH0pXG5cbiAgICBvbk5ldCgnc2tpbmNoYW5nZXI6bG9hZFNraW4nLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBhbnkpID0+IHtcbiAgICAgICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxuICAgICAgICBpZiAoY2IpIGNiKClcbiAgICB9KVxuXG4gICAgb25OZXQoJ2VzeF9za2luOm9wZW5TYXZlYWJsZU1lbnUnLCBhc3luYyAob25TdWJtaXQ6IGFueSkgPT4ge1xuICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKG9uU3VibWl0KVxuICAgIH0pXG59IiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUQXBwZWFyYW5jZVpvbmUgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCB7IG9wZW5NZW51IH0gZnJvbSBcIi4vbWVudVwiXHJcbmltcG9ydCB7IHNldFBlZEFwcGVhcmFuY2UsIHNldFBsYXllclBlZEFwcGVhcmFuY2UgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxyXG5pbXBvcnQgeyB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIGdldEZyYW1ld29ya0lELCBEZWxheSwgYmxfYnJpZGdlLCBwZWQsIGRlbGF5LCBmb3JtYXQgfSBmcm9tIFwiQHV0aWxzXCJcclxuaW1wb3J0IHsgUUJCcmlkZ2UgfSBmcm9tIFwiLi9icmlkZ2UvcWJcIlxyXG5pbXBvcnQgeyBFU1hCcmlkZ2UgfSBmcm9tIFwiLi9icmlkZ2UvZXN4XCJcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgnb3Blbk1lbnUnLCBhc3luYyAoKSA9PiB7XHJcbiAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKClcclxufSwgZmFsc2UpXHJcblxyXG5leHBvcnRzKCdTZXRQZWRBcHBlYXJhbmNlJywgYXN5bmMgKHBlZDogbnVtYmVyLCBhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSkgPT4ge1xyXG4gICAgYXdhaXQgc2V0UGVkQXBwZWFyYW5jZShwZWQsIGFwcGVhcmFuY2UpXHJcbn0pXHJcblxyXG5leHBvcnRzKCdTZXRQbGF5ZXJQZWRBcHBlYXJhbmNlJywgYXN5bmMgKGZyYW1ld29ya0lEKSA9PiB7XHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxyXG59KVxyXG5cclxuZXhwb3J0cygnR2V0UGxheWVyUGVkQXBwZWFyYW5jZScsIGFzeW5jIChmcmFtZXdvcmtJRCkgPT4ge1xyXG4gICAgcmV0dXJuIGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxufSlcclxuXHJcbmV4cG9ydHMoJ0luaXRpYWxDcmVhdGlvbicsIGFzeW5jIChjYj86IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBhd2FpdCBvcGVuTWVudSh7IHR5cGU6IFwiYXBwZWFyYW5jZVwiLCBjb29yZHM6IFswLCAwLCAwLCAwXSB9LCB0cnVlKVxyXG4gICAgaWYgKGNiKSBjYigpXHJcbn0pXHJcblxyXG5vbignYmxfc3ByaXRlczpjbGllbnQ6dXNlWm9uZScsICh6b25lOiBUQXBwZWFyYW5jZVpvbmUpID0+IHtcclxuICAgIG9wZW5NZW51KHpvbmUpXHJcbn0pXHJcblxyXG5vbk5ldCgnYmxfYnJpZGdlOmNsaWVudDpwbGF5ZXJMb2FkZWQnLCBhc3luYyAoKSA9PiB7XHJcbiAgICB3aGlsZSAoIWJsX2JyaWRnZS5jb3JlKCkucGxheWVyTG9hZGVkKCkpIHtcclxuICAgICAgICBhd2FpdCBEZWxheSgxMDApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgaWYgKCFhcHBlYXJhbmNlKSByZXR1cm47XHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcbn0pXHJcblxyXG5vbk5ldCgnb25SZXNvdXJjZVN0YXJ0JywgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcpID0+IHtcclxuICAgIGlmIChyZXNvdXJjZSA9PT0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpICYmIGJsX2JyaWRnZS5jb3JlKCkucGxheWVyTG9hZGVkKCkpIHtcclxuICAgICAgICBjb25zdCBmcmFtZXdvcmtJRCA9IGF3YWl0IGdldEZyYW1ld29ya0lEKClcclxuICAgICAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgICAgIGlmICghYXBwZWFyYW5jZSkgcmV0dXJuO1xyXG4gICAgICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSlcclxuICAgIH1cclxufSlcclxuXHJcbmNvbnN0IGZyYW1ld29ya05hbWUgPSBibF9icmlkZ2UuZ2V0RnJhbWV3b3JrKCdjb3JlJylcclxuY29uc3QgY29yZSA9IGZvcm1hdChHZXRDb252YXIoJ2JsOmZyYW1ld29yaycsICdxYicpKVxyXG5cclxuaWYgKGNvcmUgPT0gJ3FiJyB8fCBjb3JlID09ICdxYngnICYmIEdldFJlc291cmNlU3RhdGUoZnJhbWV3b3JrTmFtZSkgPT0gJ3N0YXJ0ZWQnKSB7XHJcbiAgICBRQkJyaWRnZSgpO1xyXG59IGVsc2UgaWYgKGNvcmUgPT0gJ2VzeCcgJiYgR2V0UmVzb3VyY2VTdGF0ZShmcmFtZXdvcmtOYW1lKSA9PSAnc3RhcnRlZCcpIHtcclxuICAgIEVTWEJyaWRnZSgpO1xyXG59XHJcblxyXG5SZWdpc3RlckNvbW1hbmQoJ3JlbG9hZHNraW4nLCBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCBmcmFtZXdvcmtJRCA9IGF3YWl0IGdldEZyYW1ld29ya0lEKClcclxuICAgIGNvbnN0IGhlYWx0aCA9IEdldEVudGl0eUhlYWx0aChwZWQpO1xyXG4gICAgY29uc3QgbWF4aGVhbHRoID0gR2V0RW50aXR5TWF4SGVhbHRoKHBlZCk7XHJcbiAgICBjb25zdCBhcm1vciA9IEdldFBlZEFybW91cihwZWQpO1xyXG5cclxuICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcbiAgICBpZiAoIWFwcGVhcmFuY2UpIHJldHVybjtcclxuICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSlcclxuXHJcbiAgICBTZXRQZWRNYXhIZWFsdGgocGVkLCBtYXhoZWFsdGgpXHJcbiAgICBkZWxheSgxMDAwKSBcclxuICAgIFNldEVudGl0eUhlYWx0aChwZWQsIGhlYWx0aClcclxuICAgIFNldFBlZEFybW91cihwZWQsIGFybW9yKVxyXG59LCBmYWxzZSkiXSwKICAibWFwcGluZ3MiOiAiOzs7O0FBQU8sSUFBSSxNQUFNO0FBRVYsSUFBTSxZQUFZLHdCQUFDLGNBQXNCO0FBQzVDLFFBQU07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QUEsRUFDM0M7QUFDSixDQUFDO0FBRUQsSUFBTSxnQkFBZ0IsVUFBVSxhQUFhLE1BQU07QUFDbkQsSUFBTSxPQUFPLE9BQU8sVUFBVSxnQkFBZ0IsSUFBSSxDQUFDO0FBRW5ELElBQUksUUFBUSxRQUFRLFFBQVEsU0FBUyxpQkFBaUIsYUFBYSxLQUFLLFdBQVc7QUFDL0UsV0FBUztBQUNiLFdBQVcsUUFBUSxTQUFTLGlCQUFpQixhQUFhLEtBQUssV0FBVztBQUN0RSxZQUFVO0FBQ2Q7QUFFQSxnQkFBZ0IsY0FBYyxZQUFZO0FBQ3RDLFFBQU0sY0FBYyxNQUFNLGVBQWU7QUFDekMsUUFBTSxTQUFTLGdCQUFnQixHQUFHO0FBQ2xDLFFBQU0sWUFBWSxtQkFBbUIsR0FBRztBQUN4QyxRQUFNLFFBQVEsYUFBYSxHQUFHO0FBRTlCLFFBQU0sYUFBYSxNQUFNLHNCQUFtQyxzQ0FBc0MsV0FBVztBQUM3RyxNQUFJLENBQUM7QUFBWTtBQUNqQixRQUFNLHVCQUF1QixVQUFVO0FBRXZDLGtCQUFnQixLQUFLLFNBQVM7QUFDOUIsUUFBTSxHQUFJO0FBQ1Ysa0JBQWdCLEtBQUssTUFBTTtBQUMzQixlQUFhLEtBQUssS0FBSztBQUMzQixHQUFHLEtBQUs7IiwKICAibmFtZXMiOiBbImRlbGF5IiwgIngiLCAieSIsICJ6IiwgImNvbmZpZyIsICJwZWQiLCAicGVkIiwgInBlZCJdCn0K
