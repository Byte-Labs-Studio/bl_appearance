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
  if (!IsModelValid(modelHash) && !IsModelInCdimage(modelHash)) {
    console.warn(`attempted to load invalid model '${model}'`);
    return 0;
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
function eventTimer(eventName, delay2) {
  if (delay2 && delay2 > 0) {
    const currentTime = GetGameTimer();
    if ((eventTimers[eventName] || 0) > currentTime)
      return false;
    eventTimers[eventName] = currentTime + delay2;
  }
  return true;
}
__name(eventTimer, "eventTimer");
onNet(`_bl_cb_${resourceName}`, (key, ...args) => {
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
  emitNet(`_bl_cb_${eventName}`, resourceName, key, ...args);
  return new Promise((resolve) => {
    activeEvents[key] = resolve;
  });
}
__name(triggerServerCallback, "triggerServerCallback");
function onServerCallback(eventName, cb) {
  onNet(`_bl_cb_${eventName}`, async (resource, key, ...args) => {
    let response;
    try {
      response = await cb(...args);
    } catch (e) {
      console.error(`an error occurred while handling callback event ${eventName}`);
      console.log(`^3${e.stack}^0`);
    }
    emitNet(`_bl_cb_${resource}`, key, response);
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
var getPlayerGenderModel = /* @__PURE__ */ __name(() => {
  const gender = getPlayerData().gender;
  return gender === "male" ? "mp_m_freemode_01" : "mp_f_freemode_01";
}, "getPlayerGenderModel");
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
  return job ? { name: job.name, isBoss: job.isBoss } : null;
}
__name(getJobInfo, "getJobInfo");
function isPedFreemodeModel(ped2) {
  const model = GetEntityModel(ped2);
  return model === GetHashKey("mp_m_freemode_01") || model === GetHashKey("mp_f_freemode_01");
}
__name(isPedFreemodeModel, "isPedFreemodeModel");

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
function getHairColor(pedHandle) {
  return {
    color: GetPedHairColor(pedHandle),
    highlight: GetPedHairHighlightColor(pedHandle)
  };
}
__name(getHairColor, "getHairColor");
exports("GetPedHairColor", getHairColor);
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
exports("GetPedHeadBlend", getHeadBlendData);
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
exports("GetPedHeadOverlay", getHeadOverlay);
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
exports("GetPedHeadStructure", getHeadStructure);
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
exports("GetPedDrawables", getDrawables);
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
exports("GetPedProps", getProps);
async function getAppearance(pedHandle) {
  const [headData, totals] = getHeadOverlay(pedHandle);
  const [drawables, drawTotal] = getDrawables(pedHandle);
  const [props, propTotal] = getProps(pedHandle);
  const model = GetEntityModel(pedHandle);
  const tattoos = pedHandle == PlayerPedId() ? await getTattoos() : [];
  return {
    modelIndex: findModelIndex(model),
    model,
    hairColor: getHairColor(pedHandle),
    headBlend: getHeadBlendData(pedHandle),
    headOverlay: headData,
    headOverlayTotal: totals,
    headStructure: getHeadStructure(pedHandle),
    drawables,
    props,
    drawTotal,
    propTotal,
    tattoos
  };
}
__name(getAppearance, "getAppearance");
exports("GetPedAppearance", getAppearance);
onServerCallback("bl_appearance:client:getAppearance", () => {
  updatePed(PlayerPedId());
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
    hairColor: getHairColor(pedHandle),
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
async function getTattoos() {
  return await triggerServerCallback("bl_appearance:server:getTattoos") || [];
}
__name(getTattoos, "getTattoos");
exports("GetPlayerTattoos", getTattoos);
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
        { component: 8, variant: 15, texture: 0, id: "shirts" }
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
        { component: 11, variant: 15, texture: 0, id: "jackets" }
      ]
    }
  },
  vest: {
    type: "drawable",
    index: 9,
    off: 0
  },
  legs: {
    type: "drawable",
    index: 4,
    off: 18
  },
  shoes: {
    type: "drawable",
    index: 6,
    off: 34
  }
};

// src/client/appearance/setters.ts
function setDrawable(pedHandle, data) {
  if (!data)
    return console.warn("No data provided for setDrawable");
  SetPedComponentVariation(pedHandle, data.index, data.value, data.texture, 0);
  return GetNumberOfPedTextureVariations(pedHandle, data.index, data.value);
}
__name(setDrawable, "setDrawable");
exports("SetPedDrawable", setDrawable);
function setProp(pedHandle, data) {
  if (!data)
    return console.warn("No data provided for setProp");
  if (data.value === -1) {
    ClearPedProp(pedHandle, data.index);
    return;
  }
  SetPedPropIndex(pedHandle, data.index, data.value, data.texture, false);
  return GetNumberOfPedPropTextureVariations(pedHandle, data.index, data.value);
}
__name(setProp, "setProp");
exports("SetPedProp", setProp);
var defMaleHash = GetHashKey("mp_m_freemode_01");
var setModel = /* @__PURE__ */ __name(async (pedHandle, data) => {
  if (data == null || data === void 0) {
    console.warn("No data provided for setModel");
    return pedHandle;
  }
  let model;
  if (typeof data === "string") {
    model = GetHashKey(data);
  } else if (typeof data === "number") {
    model = data;
  } else {
    model = data.model || defMaleHash;
  }
  if (model === 0)
    return pedHandle;
  await requestModel(model);
  const isPlayer = IsPedAPlayer(pedHandle);
  if (isPlayer) {
    SetPlayerModel(PlayerId(), model);
    pedHandle = PlayerPedId();
    updatePed(pedHandle);
  } else {
    SetPlayerModel(pedHandle, model);
  }
  SetModelAsNoLongerNeeded(model);
  SetPedDefaultComponentVariation(pedHandle);
  if (!isPedFreemodeModel(pedHandle))
    return pedHandle;
  const isJustModel = typeof data === "string" || typeof data === "number";
  const hasHeadBlend = !isJustModel && data.headBlend && Object.keys(data.headBlend).length > 0;
  if (hasHeadBlend) {
    setHeadBlend(pedHandle, data.headBlend);
    SetPedHeadBlendData(pedHandle, 0, 0, 0, 0, 0, 0, 0, 0, 0, false);
  } else {
    if (model === GetHashKey("mp_m_freemode_01")) {
      SetPedHeadBlendData(pedHandle, 0, 0, 0, 0, 0, 0, 0, 0, 0, false);
    } else if (model === GetHashKey("mp_f_freemode_01")) {
      SetPedHeadBlendData(pedHandle, 45, 21, 0, 20, 15, 0, 0.3, 0.1, 0, false);
    }
  }
  return pedHandle;
}, "setModel");
exports("SetPedModel", setModel);
function setFaceFeature(pedHandle, data) {
  if (!data)
    return console.warn("No data provided for setFaceFeature");
  SetPedFaceFeature(pedHandle, data.index, data.value + 0);
}
__name(setFaceFeature, "setFaceFeature");
exports("SetPedFaceFeature", setFaceFeature);
function setFaceFeatures(pedHandle, data) {
  if (!data)
    return console.warn("No data provided for setFaceFeatures");
  for (const feature in data) {
    const value = data[feature];
    setFaceFeature(pedHandle, value);
  }
}
__name(setFaceFeatures, "setFaceFeatures");
exports("SetPedFaceFeatures", setFaceFeatures);
var isPositive = /* @__PURE__ */ __name((val) => val >= 0 ? val : 0, "isPositive");
function setHeadBlend(pedHandle, data) {
  if (!data)
    return console.warn("No data provided for setHeadBlend");
  pedHandle = pedHandle || ped;
  if (!isPedFreemodeModel(pedHandle))
    return;
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
exports("SetPedHeadBlend", setHeadBlend);
function setHeadOverlay(pedHandle, data) {
  if (!data)
    return console.warn("No data provided for setHeadOverlay");
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
exports("SetPedHeadOverlay", setHeadOverlay);
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
exports("SetPedClothes", setPedClothes);
function setPedClothes(pedHandle, data) {
  if (!data)
    return console.warn("No data provided for setPedClothes");
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
exports("SetPedClothes", setPedClothes);
var setPedSkin = /* @__PURE__ */ __name(async (pedHandle, data) => {
  if (!data)
    return console.warn("No data provided for setPedSkin");
  if (!pedHandle)
    return console.warn("No pedHandle provided for setPedSkin");
  pedHandle = await setModel(pedHandle, data);
  const headStructure = data.headStructure;
  const headBlend = data.headBlend;
  if (headBlend)
    setHeadBlend(pedHandle, headBlend);
  if (headStructure)
    setFaceFeatures(pedHandle, headStructure);
}, "setPedSkin");
exports("SetPedSkin", setPedSkin);
function setPedTattoos(pedHandle, data) {
  if (!data)
    return console.warn("No data provided for setPedTattoos");
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
exports("SetPedTattoos", setPedTattoos);
function setPedHairColors(pedHandle, data) {
  if (!data)
    return console.warn("No data provided for setPedHairColors");
  const color = data.color;
  const highlight = data.highlight;
  SetPedHairColor(pedHandle, color, highlight);
}
__name(setPedHairColors, "setPedHairColors");
exports("SetPedHairColors", setPedHairColors);
async function setPedAppearance(pedHandle, data) {
  if (!data)
    return console.warn("No data provided for setPedAppearance");
  if (IsPedAPlayer(pedHandle)) {
    setPlayerPedAppearance(data);
    return;
  }
  await setPedSkin(pedHandle, data);
  setPedClothes(pedHandle, data);
  setPedHairColors(pedHandle, data.hairColor);
  setPedTattoos(pedHandle, data.tattoos);
}
__name(setPedAppearance, "setPedAppearance");
exports("SetPedAppearance", setPedAppearance);
async function setPlayerPedAppearance(data) {
  if (!data)
    return console.warn("No data provided for setPlayerPedAppearance");
  updatePed(PlayerPedId());
  await setPedSkin(ped, data);
  updatePed(PlayerPedId());
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
  newAppearance.tattoos = appearance.tattoos || null;
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
  const newPed = await setModel(ped, hash);
  updatePed(newPed);
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
  setFaceFeature(ped, data);
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
  const result = await triggerServerCallback("bl_appearance:server:saveOutfit", data);
  cb(result);
});
RegisterNuiCallback("appearance:deleteOutfit" /* deleteOutfit */, async ({ id }, cb) => {
  const result = await triggerServerCallback("bl_appearance:server:deleteOutfit", id);
  cb(result);
});
RegisterNuiCallback("appearance:renameOutfit" /* renameOutfit */, async (data, cb) => {
  const result = await triggerServerCallback("bl_appearance:server:renameOutfit", data);
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
RegisterNuiCallback("appearance:fetchOutfit" /* fetchOutfit */, async ({ id }, cb) => {
  const result = await triggerServerCallback("bl_appearance:server:fetchOutfit", id);
  cb(result);
});
RegisterNuiCallback("appearance:itemOutfit" /* itemOutfit */, async (data, cb) => {
  const result = await triggerServerCallback("bl_appearance:server:itemOutfit", data);
  cb(result);
});
onNet("bl_appearance:server:useOutfiItem", (outfit) => {
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
  let pedHandle = PlayerPedId();
  const configMenus = config.menus();
  const isString = typeof zone === "string";
  const type = isString ? zone : zone.type;
  const menu = configMenus[type];
  if (!menu)
    return;
  updatePed(pedHandle);
  const frameworkdId = getFrameworkID();
  const tabs = menu.tabs;
  let allowExit = creation ? false : menu.allowExit;
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
  if (creation) {
    const model = GetHashKey(getPlayerGenderModel());
    pedHandle = await setModel(pedHandle, model);
    emitNet("bl_appearance:server:setroutingbucket");
    promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    updatePed(pedHandle);
  }
  const appearance = await getAppearance(pedHandle);
  startCamera();
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
  exports.bl_appearance.hideHud(true);
  if (promise) {
    await promise;
    emitNet("bl_appearance:server:resetroutingbucket");
  }
  promise = null;
  resolvePromise = null;
  return true;
}
__name(openMenu, "openMenu");
exports("OpenMenu", openMenu);
RegisterCommand("appearance", async (_, args) => {
  const type = args[0];
  if (!type) {
    exports.bl_appearance.InitialCreation();
  } else {
    const zone = type.toLowerCase();
    openMenu(zone);
  }
}, true);
function getBlacklist(zone) {
  const { groupTypes, base } = config.blacklist();
  if (typeof zone === "string")
    return base;
  if (!groupTypes)
    return base;
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
  exports.bl_appearance.hideHud(false);
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
    if (!appearance.model)
      appearance.model = GetHashKey("mp_m_freemode_01");
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

// src/client/compat/illenium.ts
function exportHandler(name, cb) {
  on("__cfx_export_illenium-appearance_" + name, (setCB) => {
    setCB(cb);
  });
}
__name(exportHandler, "exportHandler");
function illeniumCompat() {
  exportHandler("startPlayerCustomization", () => {
    exports.bl_appearance.InitialCreation();
  });
  exportHandler("getPedModel", (ped2) => {
    return GetEntityModel(ped2);
  });
  exportHandler("getPedComponents", (ped2) => {
    const drawables = getDrawables(ped2)[0];
    let newdrawable = [];
    for (const id of drawables) {
      const drawable = drawables[id];
      newdrawable.push({
        component_id: drawable.index,
        drawable: drawable.value,
        texture: drawable.texture
      });
    }
  });
  exportHandler("getPedProps", (ped2) => {
    const props = getProps(ped2)[0];
    let newProps = [];
    for (const id of props) {
      const prop = props[id];
      newProps.push({
        prop_id: prop.index,
        drawable: prop.value,
        texture: prop.texture
      });
    }
  });
  exportHandler("getPedHeadBlend", (ped2) => {
    return console.warn("You Still cannot use this function");
  });
  exportHandler("getPedFaceFeatures", (ped2) => {
    return console.warn("You Still cannot use this function");
  });
  exportHandler("getPedHeadOverlays", (ped2) => {
    return console.warn("You Still cannot use this function");
  });
  exportHandler("getPedHair", (ped2) => {
    return console.warn("You Still cannot use this function");
  });
  exportHandler("getPedAppearance", (ped2) => {
    return getAppearance(ped2);
  });
  exportHandler("setPlayerModel", (model) => {
    updatePed(PlayerPedId());
    setModel(ped, model);
  });
  exportHandler("setPedHeadBlend", (ped2, blend) => {
    return console.warn("You Still cannot use this function");
  });
  exportHandler("setPedFaceFeatures", () => {
    return console.warn("You Still cannot use this function");
  });
  exportHandler("setPedHeadOverlays", (ped2, overlay) => {
    return console.warn("You Still cannot use this function");
  });
  exportHandler("setPedHair", async (ped2, hair, tattoo) => {
    return console.warn("You Still cannot use this function");
  });
  exportHandler("setPedEyeColor", () => {
    return console.warn("You Still cannot use this function");
  });
  exportHandler("setPedComponent", (ped2, drawable) => {
    const newDrawable = {
      index: drawable.component_id,
      value: drawable.drawable,
      texture: drawable.texture
    };
    setDrawable(ped2, newDrawable);
  });
  exportHandler("setPedComponents", (ped2, components) => {
    for (const component of components) {
      const newDrawable = {
        index: component.component_id,
        value: component.drawable,
        texture: component.texture
      };
      setDrawable(ped2, newDrawable);
    }
  });
  exportHandler("setPedProp", (ped2, prop) => {
    const newProp = {
      index: prop.prop_id,
      value: prop.drawable,
      texture: prop.texture
    };
    setProp(ped2, newProp);
  });
  exportHandler("setPedProps", (ped2, props) => {
    for (const prop of props) {
      const newProp = {
        index: prop.prop_id,
        value: prop.drawable,
        texture: prop.texture
      };
      setProp(ped2, newProp);
    }
  });
  exportHandler("setPedAppearance", (ped2, appearance) => {
    setPedAppearance(ped2, appearance);
  });
  exportHandler("setPedTattoos", (ped2, tattoos) => {
    setPedTattoos(ped2, tattoos);
  });
}
__name(illeniumCompat, "illeniumCompat");

// src/client/init.ts
exports("SetPlayerPedAppearance", async (appearance) => {
  let resolvedAppearance;
  if (!appearance || typeof appearance === "string") {
    const frameworkID = appearance || await getFrameworkID();
    resolvedAppearance = await triggerServerCallback("bl_appearance:server:getAppearance", frameworkID);
  } else if (typeof appearance === "object")
    resolvedAppearance = appearance;
  if (!resolvedAppearance) {
    throw new Error("No valid appearance found");
  }
  await setPlayerPedAppearance(resolvedAppearance);
});
exports("GetPlayerPedAppearance", async (frameworkID) => {
  frameworkID = frameworkID || await getFrameworkID();
  return await triggerServerCallback("bl_appearance:server:getAppearance", frameworkID);
});
exports("InitialCreation", async (cb) => {
  await openMenu({ type: "appearance", coords: [0, 0, 0, 0] }, true);
  if (cb)
    cb();
});
on("bl_appearance:client:useZone", (zone) => {
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
illeniumCompat();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvcWIudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvZXN4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvY29tcGF0L2lsbGVuaXVtLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvaW5pdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCBwZWQgPSAwXHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlUGVkID0gKHBlZEhhbmRsZTogbnVtYmVyKSA9PiB7XHJcbiAgICBwZWQgPSBwZWRIYW5kbGVcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlYnVnZGF0YSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGEsIChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0sIDIpKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2VuZE5VSUV2ZW50ID0gKGFjdGlvbjogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcclxuICAgIFNlbmROVUlNZXNzYWdlKHtcclxuICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TW9kZWwgPSBhc3luYyAobW9kZWw6IHN0cmluZyB8IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiA9PiB7XHJcbiAgICBsZXQgbW9kZWxIYXNoOiBudW1iZXIgPSB0eXBlb2YgbW9kZWwgPT09ICdudW1iZXInID8gbW9kZWwgOiBHZXRIYXNoS2V5KG1vZGVsKVxyXG5cclxuICAgIGlmICghSXNNb2RlbFZhbGlkKG1vZGVsSGFzaCkgJiYgIUlzTW9kZWxJbkNkaW1hZ2UobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIC8vIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAvLyAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgLy8gICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgLy8gICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgLy8gfSlcclxuXHJcbiAgICAgICAgY29uc29sZS53YXJuKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9ibF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5OiBzdHJpbmcsIC4uLmFyZ3M6IGFueSkgPT4ge1xyXG4gICAgY29uc3QgcmVzb2x2ZSA9IGFjdGl2ZUV2ZW50c1trZXldO1xyXG4gICAgcmV0dXJuIHJlc29sdmUgJiYgcmVzb2x2ZSguLi5hcmdzKTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlclNlcnZlckNhbGxiYWNrPFQgPSB1bmtub3duPihcclxuICAgIGV2ZW50TmFtZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlcclxuKTogUHJvbWlzZTxUPiB8IHZvaWQge1xyXG4gICAgaWYgKCFldmVudFRpbWVyKGV2ZW50TmFtZSwgMCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGtleTogc3RyaW5nO1xyXG5cclxuICAgIGRvIHtcclxuICAgICAgICBrZXkgPSBgJHtldmVudE5hbWV9OiR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDEwMDAwMCArIDEpKX1gO1xyXG4gICAgfSB3aGlsZSAoYWN0aXZlRXZlbnRzW2tleV0pO1xyXG4gICAgZW1pdE5ldChgX2JsX2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvblNlcnZlckNhbGxiYWNrKGV2ZW50TmFtZSwgY2IpIHtcclxuICAgIG9uTmV0KGBfYmxfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlLCBrZXksIC4uLmFyZ3MpID0+IHtcclxuICAgICAgICBsZXQgcmVzcG9uc2U7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBjYiguLi5hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgaGFuZGxpbmcgY2FsbGJhY2sgZXZlbnQgJHtldmVudE5hbWV9YCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBeMyR7ZS5zdGFja31eMGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbWl0TmV0KGBfYmxfY2JfJHtyZXNvdXJjZX1gLCBrZXksIHJlc3BvbnNlKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vL2xvY2FsZVxyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RMb2NhbGUgPSAocmVzb3VyY2VTZXROYW1lOiBzdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNoZWNrUmVzb3VyY2VGaWxlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoUmVxdWVzdFJlc291cmNlRmlsZVNldChyZXNvdXJjZVNldE5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50TGFuID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmNvbmZpZygpLmxvY2FsZVxyXG4gICAgICAgICAgICAgICAgbGV0IGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvJHtjdXJyZW50TGFufS5qc29uYCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsZUZpbGVDb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtjdXJyZW50TGFufS5qc29uIG5vdCBmb3VuZCBpbiBsb2NhbGUsIHBsZWFzZSB2ZXJpZnkhLCB3ZSB1c2VkIGVuZ2xpc2ggZm9yIG5vdyFgKVxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvZW4uanNvbmApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGxvY2FsZUZpbGVDb250ZW50KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2hlY2tSZXNvdXJjZUZpbGUsIDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2hlY2tSZXNvdXJjZUZpbGUoKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbG9jYWxlID0gYXN5bmMgKGlkOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBjb25zdCBsb2NhbGUgPSBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKTtcclxuICAgIGxldCBhcmdJbmRleCA9IDA7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gbG9jYWxlW2lkXS5yZXBsYWNlKC8lcy9nLCAobWF0Y2g6IHN0cmluZykgPT4gYXJnSW5kZXggPCBhcmdzLmxlbmd0aCA/IGFyZ3NbYXJnSW5kZXhdIDogbWF0Y2gpO1xyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgYmxfYnJpZGdlID0gZXhwb3J0cy5ibF9icmlkZ2VcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRQbGF5ZXJEYXRhID0gKCkgPT4ge1xyXG4gICAgcmV0dXJuIGJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRGcmFtZXdvcmtJRCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGlkID0gZ2V0UGxheWVyRGF0YSgpLmNpZFxyXG4gICAgcmV0dXJuIGlkXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRQbGF5ZXJHZW5kZXJNb2RlbCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGdlbmRlciA9IGdldFBsYXllckRhdGEoKS5nZW5kZXJcclxuICAgIHJldHVybiBnZW5kZXIgPT09ICdtYWxlJyA/ICdtcF9tX2ZyZWVtb2RlXzAxJyA6ICdtcF9mX2ZyZWVtb2RlXzAxJ1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRGVsYXkobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICghc3RyLmluY2x1ZGVzKFwiJ1wiKSkgcmV0dXJuIHN0cjtcclxuICAgIHJldHVybiBzdHIucmVwbGFjZSgvJy9nLCBcIlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEpvYkluZm8oKTogeyBuYW1lOiBzdHJpbmcsIGlzQm9zczogYm9vbGVhbiB9IHwgbnVsbCB7XHJcbiAgICBjb25zdCBqb2IgPSBnZXRQbGF5ZXJEYXRhKCkuam9iXHJcbiAgICByZXR1cm4gam9iID8geyBuYW1lOiBqb2IubmFtZSwgaXNCb3NzOiBqb2IuaXNCb3NzIH0gOiBudWxsXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1BlZEZyZWVtb2RlTW9kZWwocGVkOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IG1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkKVxyXG4gICAgcmV0dXJuIG1vZGVsID09PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSB8fCBtb2RlbCA9PT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIilcclxufSAgICIsICJpbXBvcnQgeyBDYW1lcmEsIFZlY3RvcjMsIFRDYW1lcmFCb25lcyB9IGZyb20gJ0B0eXBpbmdzL2NhbWVyYSc7XHJcbmltcG9ydCB7IGRlbGF5LCBwZWQgfSBmcm9tICdAdXRpbHMnO1xyXG5pbXBvcnQgeyBSZWNlaXZlIH0gZnJvbSAnQGV2ZW50cyc7XHJcblxyXG5jb25zdCBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRSA9IDIuMDtcclxuY29uc3QgREVGQVVMVF9NQVhfRElTVEFOQ0UgPSAxLjA7XHJcblxyXG5sZXQgcnVubmluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgY2FtRGlzdGFuY2U6IG51bWJlciA9IDEuODtcclxubGV0IGNhbTogQ2FtZXJhIHwgbnVsbCA9IG51bGw7XHJcbmxldCBhbmdsZVk6IG51bWJlciA9IDAuMDtcclxubGV0IGFuZ2xlWjogbnVtYmVyID0gMC4wO1xyXG5sZXQgdGFyZ2V0Q29vcmRzOiBWZWN0b3IzIHwgbnVsbCA9IG51bGw7XHJcbmxldCBvbGRDYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgY2hhbmdpbmdDYW06IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGxhc3RYOiBudW1iZXIgPSAwO1xyXG5sZXQgY3VycmVudEJvbmU6IGtleW9mIFRDYW1lcmFCb25lcyA9ICdoZWFkJztcclxuXHJcbmNvbnN0IENhbWVyYUJvbmVzOiBUQ2FtZXJhQm9uZXMgPSB7XHJcbiAgICB3aG9sZTogMCxcclxuXHRoZWFkOiAzMTA4NixcclxuXHR0b3JzbzogMjQ4MTgsXHJcblx0bGVnczogWzE2MzM1LCA0NjA3OF0sXHJcbiAgICBzaG9lczogWzE0MjAxLCA1MjMwMV0sXHJcbn07XHJcblxyXG5jb25zdCBjb3MgPSAoZGVncmVlczogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuXHRyZXR1cm4gTWF0aC5jb3MoKGRlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MCk7XHJcbn07XHJcblxyXG5jb25zdCBzaW4gPSAoZGVncmVlczogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuXHRyZXR1cm4gTWF0aC5zaW4oKGRlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MCk7XHJcbn07XHJcblxyXG5jb25zdCBnZXRBbmdsZXMgPSAoKTogbnVtYmVyW10gPT4ge1xyXG5cdGNvbnN0IHggPVxyXG5cdFx0KChjb3MoYW5nbGVaKSAqIGNvcyhhbmdsZVkpICsgY29zKGFuZ2xlWSkgKiBjb3MoYW5nbGVaKSkgLyAyKSAqXHJcblx0XHRjYW1EaXN0YW5jZTtcclxuXHRjb25zdCB5ID1cclxuXHRcdCgoc2luKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSArIGNvcyhhbmdsZVkpICogc2luKGFuZ2xlWikpIC8gMikgKlxyXG5cdFx0Y2FtRGlzdGFuY2U7XHJcblx0Y29uc3QgeiA9IHNpbihhbmdsZVkpICogY2FtRGlzdGFuY2U7XHJcblxyXG5cdHJldHVybiBbeCwgeSwgel07XHJcbn07XHJcblxyXG5jb25zdCBzZXRDYW1Qb3NpdGlvbiA9IChtb3VzZVg/OiBudW1iZXIsIG1vdXNlWT86IG51bWJlcik6IHZvaWQgPT4ge1xyXG5cdGlmICghcnVubmluZyB8fCAhdGFyZ2V0Q29vcmRzIHx8IGNoYW5naW5nQ2FtKSByZXR1cm47XHJcblxyXG5cdG1vdXNlWCA9IG1vdXNlWCA/PyAwLjA7XHJcblx0bW91c2VZID0gbW91c2VZID8/IDAuMDtcclxuXHJcblx0YW5nbGVaIC09IG1vdXNlWDtcclxuXHRhbmdsZVkgKz0gbW91c2VZO1xyXG5cclxuICAgIGNvbnN0IGlzSGVhZE9yV2hvbGUgPSBjdXJyZW50Qm9uZSA9PT0gJ3dob2xlJyB8fCBjdXJyZW50Qm9uZSA9PT0gJ2hlYWQnO1xyXG4gICAgY29uc3QgbWF4QW5nbGUgPSBpc0hlYWRPcldob2xlID8gODkuMCA6IDcwLjA7XHJcbiAgICBcclxuICAgIGNvbnN0IGlzU2hvZXMgPSBjdXJyZW50Qm9uZSA9PT0gJ3Nob2VzJztcclxuICAgIGNvbnN0IG1pbkFuZ2xlID0gaXNTaG9lcyA/IDUuMCA6IC0yMC4wO1xyXG5cclxuXHRhbmdsZVkgPSBNYXRoLm1pbihNYXRoLm1heChhbmdsZVksIG1pbkFuZ2xlKSwgbWF4QW5nbGUpO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKTtcclxuXHJcblx0U2V0Q2FtQ29vcmQoXHJcblx0XHRjYW0sXHJcblx0XHR0YXJnZXRDb29yZHMueCArIHgsXHJcblx0XHR0YXJnZXRDb29yZHMueSArIHksXHJcblx0XHR0YXJnZXRDb29yZHMueiArIHpcclxuXHQpO1xyXG5cdFBvaW50Q2FtQXRDb29yZChjYW0sIHRhcmdldENvb3Jkcy54LCB0YXJnZXRDb29yZHMueSwgdGFyZ2V0Q29vcmRzLnopO1xyXG59O1xyXG5cclxuY29uc3QgbW92ZUNhbWVyYSA9IGFzeW5jIChjb29yZHM6IFZlY3RvcjMsIGRpc3RhbmNlPzogbnVtYmVyKSA9PiB7XHJcblx0Y29uc3QgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpICsgOTQ7XHJcblx0ZGlzdGFuY2UgPSBkaXN0YW5jZSA/PyAxLjA7XHJcblxyXG5cdGNoYW5naW5nQ2FtID0gdHJ1ZTtcclxuXHRjYW1EaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG5cdGFuZ2xlWiA9IGhlYWRpbmc7XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpO1xyXG5cclxuXHRjb25zdCBuZXdjYW06IENhbWVyYSA9IENyZWF0ZUNhbVdpdGhQYXJhbXMoXHJcblx0XHQnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLFxyXG5cdFx0Y29vcmRzLnggKyB4LFxyXG5cdFx0Y29vcmRzLnkgKyB5LFxyXG5cdFx0Y29vcmRzLnogKyB6LFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0NzAuMCxcclxuXHRcdGZhbHNlLFxyXG5cdFx0MFxyXG5cdCk7XHJcblxyXG5cdHRhcmdldENvb3JkcyA9IGNvb3JkcztcclxuXHRjaGFuZ2luZ0NhbSA9IGZhbHNlO1xyXG5cdG9sZENhbSA9IGNhbTtcclxuXHRjYW0gPSBuZXdjYW07XHJcblxyXG5cdFBvaW50Q2FtQXRDb29yZChuZXdjYW0sIGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnopO1xyXG5cdFNldENhbUFjdGl2ZVdpdGhJbnRlcnAobmV3Y2FtLCBvbGRDYW0sIDI1MCwgMCwgMCk7XHJcblxyXG5cdGF3YWl0IGRlbGF5KDI1MCk7XHJcblxyXG5cdFNldENhbVVzZVNoYWxsb3dEb2ZNb2RlKG5ld2NhbSwgdHJ1ZSk7XHJcblx0U2V0Q2FtTmVhckRvZihuZXdjYW0sIDAuNCk7XHJcblx0U2V0Q2FtRmFyRG9mKG5ld2NhbSwgMS4yKTtcclxuXHRTZXRDYW1Eb2ZTdHJlbmd0aChuZXdjYW0sIDAuMyk7XHJcblx0dXNlSGlEb2YobmV3Y2FtKTtcclxuXHJcblx0RGVzdHJveUNhbShvbGRDYW0sIHRydWUpO1xyXG59O1xyXG5cclxuY29uc3QgdXNlSGlEb2YgPSAoY3VycmVudGNhbTogQ2FtZXJhKSA9PiB7XHJcblx0aWYgKCEoRG9lc0NhbUV4aXN0KGNhbSkgJiYgY3VycmVudGNhbSA9PSBjYW0pKSByZXR1cm47XHJcblx0U2V0VXNlSGlEb2YoKTtcclxuXHRzZXRUaW1lb3V0KHVzZUhpRG9mLCAwKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdGFydENhbWVyYSA9ICgpID0+IHtcclxuXHRpZiAocnVubmluZykgcmV0dXJuO1xyXG5cdHJ1bm5pbmcgPSB0cnVlO1xyXG5cdGNhbURpc3RhbmNlID0gV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0VcclxuXHRjYW0gPSBDcmVhdGVDYW0oJ0RFRkFVTFRfU0NSSVBURURfQ0FNRVJBJywgdHJ1ZSk7XHJcblx0Y29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCAzMTA4NiwgMC4wLCAwLjAsIDAuMCk7XHJcblx0U2V0Q2FtQ29vcmQoY2FtLCB4LCB5LCB6KTtcclxuXHRSZW5kZXJTY3JpcHRDYW1zKHRydWUsIHRydWUsIDEwMDAsIHRydWUsIHRydWUpO1xyXG5cdC8vIG1vdmVDYW1lcmEoeyB4OiB4LCB5OiB5LCB6OiB6IH0sIGNhbURpc3RhbmNlKTtcclxuICAgIHNldENhbWVyYSgnd2hvbGUnLCBjYW1EaXN0YW5jZSk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc3RvcENhbWVyYSA9ICgpOiB2b2lkID0+IHtcclxuXHRpZiAoIXJ1bm5pbmcpIHJldHVybjtcclxuXHRydW5uaW5nID0gZmFsc2U7XHJcblxyXG5cdFJlbmRlclNjcmlwdENhbXMoZmFsc2UsIHRydWUsIDI1MCwgdHJ1ZSwgZmFsc2UpO1xyXG5cdERlc3Ryb3lDYW0oY2FtLCB0cnVlKTtcclxuXHRjYW0gPSBudWxsO1xyXG5cdHRhcmdldENvb3JkcyA9IG51bGw7XHJcbn07XHJcblxyXG5jb25zdCBzZXRDYW1lcmEgPSAodHlwZT86IGtleW9mIFRDYW1lcmFCb25lcywgZGlzdGFuY2UgPSBjYW1EaXN0YW5jZSk6IHZvaWQgPT4ge1xyXG5cclxuXHRjb25zdCBib25lOiBudW1iZXIgfCBudW1iZXJbXSB8IHVuZGVmaW5lZCA9IENhbWVyYUJvbmVzW3R5cGVdO1xyXG5cclxuICAgIGNvbnN0IGlzQm9uZUFycmF5ID0gQXJyYXkuaXNBcnJheShib25lKVxyXG5cclxuICAgIGN1cnJlbnRCb25lID0gdHlwZTtcclxuXHJcbiAgICBpZiAoIWlzQm9uZUFycmF5ICYmIGJvbmUgPT09IDApIHtcclxuICAgICAgICBjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gR2V0RW50aXR5Q29vcmRzKHBlZCwgZmFsc2UpO1xyXG4gICAgICAgIG1vdmVDYW1lcmEoXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICAgICAgICB5OiB5LFxyXG4gICAgICAgICAgICAgICAgejogeiArIDAuMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGlzdGFuY2VcclxuICAgICAgICApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBpdHMgbm90IHdob2xlIGJvZHksIHRoZW4gd2UgbmVlZCB0byBsaW1pdCB0aGUgZGlzdGFuY2VcclxuICAgIGlmIChkaXN0YW5jZSA+IERFRkFVTFRfTUFYX0RJU1RBTkNFKSBkaXN0YW5jZSA9IERFRkFVTFRfTUFYX0RJU1RBTkNFO1xyXG5cclxuICAgIGlmIChpc0JvbmVBcnJheSkge1xyXG4gICAgICAgIGNvbnN0IFt4MSwgeTEsIHoxXTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZVswXSwgMC4wLCAwLjAsIDAuMClcclxuXHJcbiAgICAgICAgY29uc3QgW3gyLCB5MiwgejJdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCBib25lWzFdLCAwLjAsIDAuMCwgMC4wKVxyXG5cclxuICAgICAgICAvLyBnZXQgdGhlIG1pZGRsZSBvZiB0aGUgdHdvIHBvaW50c1xyXG4gICAgICAgIHZhciB4ID0gKHgxICsgeDIpIC8gMjtcclxuICAgICAgICB2YXIgeSA9ICh5MSArIHkyKSAvIDI7XHJcbiAgICAgICAgdmFyIHogPSAoejEgKyB6MikgLyAyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCBib25lLCAwLjAsIDAuMCwgMC4wKVxyXG4gICAgfVxyXG5cclxuXHRtb3ZlQ2FtZXJhKFxyXG5cdFx0e1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5LFxyXG5cdFx0XHR6OiB6ICsgMC4wLFxyXG5cdFx0fSxcclxuXHRcdGRpc3RhbmNlXHJcblx0KTtcclxuXHJcbn07XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtTW92ZSwgKGRhdGEsIGNiKSA9PiB7XHJcbiAgICBzZXRDYW1Qb3NpdGlvbihkYXRhLngsIGRhdGEueSk7XHJcbiAgICBjYigxKTtcclxufSk7XHJcblxyXG50eXBlIFRTZWN0aW9uID0gJ3dob2xlJyB8ICdoZWFkJyB8ICd0b3JzbycgfCAnbGVncycgfCAnc2hvZXMnO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVNlY3Rpb24sICh0eXBlOiBUU2VjdGlvbiwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnd2hvbGUnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ3dob2xlJywgV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0UpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdoZWFkJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCdoZWFkJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3RvcnNvJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCd0b3JzbycpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdsZWdzJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCdsZWdzJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3Nob2VzJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCdzaG9lcycpO1xyXG4gICAgICAgICAgICBzZXRDYW1Qb3NpdGlvbigpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHR9XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVpvb20sIChkYXRhLCBjYikgPT4ge1xyXG5cdGlmIChkYXRhID09PSAnZG93bicpIHtcclxuXHJcbiAgICAgICAgY29uc3QgbWF4Wm9vbSA9IGN1cnJlbnRCb25lID09PSAnd2hvbGUnID8gV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0UgOiBERUZBVUxUX01BWF9ESVNUQU5DRTtcclxuXHJcblx0XHRjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgKyAwLjA1O1xyXG5cdFx0Y2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA+PSBtYXhab29tID8gbWF4Wm9vbSA6IG5ld0Rpc3RhbmNlO1xyXG5cdH0gZWxzZSBpZiAoZGF0YSA9PT0gJ3VwJykge1xyXG5cdFx0Y29uc3QgbmV3RGlzdGFuY2U6IG51bWJlciA9IGNhbURpc3RhbmNlIC0gMC4wNTtcclxuXHRcdGNhbURpc3RhbmNlID0gbmV3RGlzdGFuY2UgPD0gMC4zID8gMC4zIDogbmV3RGlzdGFuY2U7XHJcblx0fVxyXG5cclxuXHRjYW1EaXN0YW5jZSA9IGNhbURpc3RhbmNlO1xyXG5cdHNldENhbVBvc2l0aW9uKCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiQmxlbWlzaGVzXCIsXG4gICAgXCJGYWNpYWxIYWlyXCIsXG4gICAgXCJFeWVicm93c1wiLFxuICAgIFwiQWdlaW5nXCIsXG4gICAgXCJNYWtldXBcIixcbiAgICBcIkJsdXNoXCIsXG4gICAgXCJDb21wbGV4aW9uXCIsXG4gICAgXCJTdW5EYW1hZ2VcIixcbiAgICBcIkxpcHN0aWNrXCIsXG4gICAgXCJNb2xlc0ZyZWNrbGVzXCIsXG4gICAgXCJDaGVzdEhhaXJcIixcbiAgICBcIkJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkFkZEJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkV5ZUNvbG9yXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJOb3NlX1dpZHRoXCIsXG4gICAgXCJOb3NlX1BlYWtfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTGVuZ2h0XCIsXG4gICAgXCJOb3NlX0JvbmVfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTG93ZXJpbmdcIixcbiAgICBcIk5vc2VfQm9uZV9Ud2lzdFwiLFxuICAgIFwiRXllQnJvd25fSGVpZ2h0XCIsXG4gICAgXCJFeWVCcm93bl9Gb3J3YXJkXCIsXG4gICAgXCJDaGVla3NfQm9uZV9IaWdoXCIsXG4gICAgXCJDaGVla3NfQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hlZWtzX1dpZHRoXCIsXG4gICAgXCJFeWVzX09wZW5uaW5nXCIsXG4gICAgXCJMaXBzX1RoaWNrbmVzc1wiLFxuICAgIFwiSmF3X0JvbmVfV2lkdGhcIixcbiAgICBcIkphd19Cb25lX0JhY2tfTGVuZ2h0XCIsXG4gICAgXCJDaGluX0JvbmVfTG93ZXJpbmdcIixcbiAgICBcIkNoaW5fQm9uZV9MZW5ndGhcIixcbiAgICBcIkNoaW5fQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hpbl9Ib2xlXCIsXG4gICAgXCJOZWNrX1RoaWtuZXNzXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJmYWNlXCIsXG4gICAgXCJtYXNrc1wiLFxuICAgIFwiaGFpclwiLFxuICAgIFwidG9yc29zXCIsXG4gICAgXCJsZWdzXCIsXG4gICAgXCJiYWdzXCIsXG4gICAgXCJzaG9lc1wiLFxuICAgIFwibmVja1wiLFxuICAgIFwic2hpcnRzXCIsXG4gICAgXCJ2ZXN0XCIsXG4gICAgXCJkZWNhbHNcIixcbiAgICBcImphY2tldHNcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImhhdHNcIixcbiAgICBcImdsYXNzZXNcIixcbiAgICBcImVhcnJpbmdzXCIsXG4gICAgXCJtb3V0aFwiLFxuICAgIFwibGhhbmRcIixcbiAgICBcInJoYW5kXCIsXG4gICAgXCJ3YXRjaGVzXCIsXG4gICAgXCJicmFjZWxldHNcIlxuXVxuIiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUSGFpckRhdGEsIFRIZWFkT3ZlcmxheSwgVEhlYWRPdmVybGF5VG90YWwsIFRDbG90aGVzLCBUU2tpbiB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IEhFQURfT1ZFUkxBWVMgZnJvbSBcIkBkYXRhL2hlYWRcIlxyXG5pbXBvcnQgRkFDRV9GRUFUVVJFUyBmcm9tIFwiQGRhdGEvZmFjZVwiXHJcbmltcG9ydCBEUkFXQUJMRV9OQU1FUyBmcm9tIFwiQGRhdGEvZHJhd2FibGVzXCJcclxuaW1wb3J0IFBST1BfTkFNRVMgZnJvbSBcIkBkYXRhL3Byb3BzXCJcclxuaW1wb3J0IHsgcGVkLCBvblNlcnZlckNhbGxiYWNrLCB1cGRhdGVQZWQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayB9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IFRUYXR0b28gfSBmcm9tIFwiQHR5cGluZ3MvdGF0dG9vc1wiXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZE1vZGVsSW5kZXgodGFyZ2V0OiBudW1iZXIpIHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZVxyXG4gICAgY29uc3QgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcblxyXG4gICAgcmV0dXJuIG1vZGVscy5maW5kSW5kZXgoKG1vZGVsOiBzdHJpbmcpID0+IEdldEhhc2hLZXkobW9kZWwpID09PSB0YXJnZXQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIYWlyQ29sb3IocGVkSGFuZGxlOiBudW1iZXIpOiBUSGFpckRhdGEge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjb2xvcjogR2V0UGVkSGFpckNvbG9yKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGlnaGxpZ2h0OiBHZXRQZWRIYWlySGlnaGxpZ2h0Q29sb3IocGVkSGFuZGxlKVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoJ0dldFBlZEhhaXJDb2xvcicsIGdldEhhaXJDb2xvcik7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZEJsZW5kRGF0YShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BlZHIwZm9udG91cmEvZml2ZW0tYXBwZWFyYW5jZS9ibG9iL21haW4vZ2FtZS9zcmMvY2xpZW50L2luZGV4LnRzI0w2N1xyXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKDgwKTtcclxuICAgIGdsb2JhbC5DaXRpemVuLmludm9rZU5hdGl2ZSgnMHgyNzQ2YmQ5ZDg4YzVjNWQwJywgcGVkSGFuZGxlLCBuZXcgVWludDMyQXJyYXkoYnVmZmVyKSk7XHJcblxyXG4gICAgY29uc3QgeyAwOiBzaGFwZUZpcnN0LCAyOiBzaGFwZVNlY29uZCwgNDogc2hhcGVUaGlyZCwgNjogc2tpbkZpcnN0LCA4OiBza2luU2Vjb25kLCAxODogaGFzUGFyZW50LCAxMDogc2tpblRoaXJkIH0gPSBuZXcgVWludDMyQXJyYXkoYnVmZmVyKTtcclxuICAgIGNvbnN0IHsgMDogc2hhcGVNaXgsIDI6IHNraW5NaXgsIDQ6IHRoaXJkTWl4IH0gPSBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlciwgNDgpO1xyXG5cclxuICAgIC8qICAgXHJcbiAgICAgICAgMDogc2hhcGVGaXJzdCxcclxuICAgICAgICAyOiBzaGFwZVNlY29uZCxcclxuICAgICAgICA0OiBzaGFwZVRoaXJkLFxyXG4gICAgICAgIDY6IHNraW5GaXJzdCxcclxuICAgICAgICA4OiBza2luU2Vjb25kLFxyXG4gICAgICAgIDEwOiBza2luVGhpcmQsXHJcbiAgICAgICAgMTg6IGhhc1BhcmVudCxcclxuICAgICovXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNoYXBlRmlyc3QsICAgLy8gZmF0aGVyXHJcbiAgICAgICAgc2hhcGVTZWNvbmQsIC8vIG1vdGhlclxyXG4gICAgICAgIHNoYXBlVGhpcmQsXHJcblxyXG4gICAgICAgIHNraW5GaXJzdCxcclxuICAgICAgICBza2luU2Vjb25kLFxyXG4gICAgICAgIHNraW5UaGlyZCxcclxuXHJcbiAgICAgICAgc2hhcGVNaXgsIC8vIHJlc2VtYmxhbmNlXHJcblxyXG4gICAgICAgIHRoaXJkTWl4LFxyXG4gICAgICAgIHNraW5NaXgsICAgLy8gc2tpbnBlcmNlbnRcclxuXHJcbiAgICAgICAgaGFzUGFyZW50OiBCb29sZWFuKGhhc1BhcmVudCksXHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydHMoJ0dldFBlZEhlYWRCbGVuZCcsIGdldEhlYWRCbGVuZERhdGEpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRPdmVybGF5KHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgdG90YWxzOiBUSGVhZE92ZXJsYXlUb3RhbCA9IHt9O1xyXG4gICAgbGV0IGhlYWREYXRhOiBUSGVhZE92ZXJsYXkgPSB7fTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEhFQURfT1ZFUkxBWVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gSEVBRF9PVkVSTEFZU1tpXTtcclxuICAgICAgICB0b3RhbHNbb3ZlcmxheV0gPSBHZXROdW1IZWFkT3ZlcmxheVZhbHVlcyhpKTtcclxuXHJcbiAgICAgICAgaWYgKG92ZXJsYXkgPT09IFwiRXllQ29sb3JcIikge1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5VmFsdWU6IEdldFBlZEV5ZUNvbG9yKHBlZEhhbmRsZSlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBbXywgb3ZlcmxheVZhbHVlLCBjb2xvdXJUeXBlLCBmaXJzdENvbG9yLCBzZWNvbmRDb2xvciwgb3ZlcmxheU9wYWNpdHldID0gR2V0UGVkSGVhZE92ZXJsYXlEYXRhKHBlZEhhbmRsZSwgaSk7XHJcbiAgICAgICAgICAgIGhlYWREYXRhW292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogb3ZlcmxheVZhbHVlID09PSAyNTUgPyAtMSA6IG92ZXJsYXlWYWx1ZSxcclxuICAgICAgICAgICAgICAgIGNvbG91clR5cGU6IGNvbG91clR5cGUsXHJcbiAgICAgICAgICAgICAgICBmaXJzdENvbG9yOiBmaXJzdENvbG9yLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kQ29sb3I6IHNlY29uZENvbG9yLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheU9wYWNpdHk6IG92ZXJsYXlPcGFjaXR5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbaGVhZERhdGEsIHRvdGFsc107XHJcbn1cclxuZXhwb3J0cygnR2V0UGVkSGVhZE92ZXJsYXknLCBnZXRIZWFkT3ZlcmxheSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZFN0cnVjdHVyZShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgY29uc3QgcGVkTW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWRIYW5kbGUpXHJcblxyXG4gICAgaWYgKHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSAmJiBwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIikpIHJldHVyblxyXG5cclxuICAgIGxldCBmYWNlU3RydWN0ID0ge31cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRkFDRV9GRUFUVVJFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBGQUNFX0ZFQVRVUkVTW2ldXHJcbiAgICAgICAgZmFjZVN0cnVjdFtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRmFjZUZlYXR1cmUocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFjZVN0cnVjdFxyXG59XHJcbmV4cG9ydHMoJ0dldFBlZEhlYWRTdHJ1Y3R1cmUnLCBnZXRIZWFkU3RydWN0dXJlKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXREcmF3YWJsZXMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBkcmF3YWJsZXMgPSB7fVxyXG4gICAgbGV0IHRvdGFsRHJhd2FibGVzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IERSQVdBQkxFX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IERSQVdBQkxFX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxEcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRUZXh0dXJlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtkcmF3YWJsZXMsIHRvdGFsRHJhd2FibGVzXVxyXG59XHJcbmV4cG9ydHMoJ0dldFBlZERyYXdhYmxlcycsIGdldERyYXdhYmxlcyk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcHMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBwcm9wcyA9IHt9XHJcbiAgICBsZXQgdG90YWxQcm9wcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBQUk9QX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IFBST1BfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxQcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWRQcm9wRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFByb3BUZXh0dXJlSW5kZXgocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3Byb3BzLCB0b3RhbFByb3BzXVxyXG59XHJcbmV4cG9ydHMoJ0dldFBlZFByb3BzJywgZ2V0UHJvcHMpO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwcGVhcmFuY2UocGVkSGFuZGxlOiBudW1iZXIpOiBQcm9taXNlPFRBcHBlYXJhbmNlPiB7XHJcbiAgICBjb25zdCBbaGVhZERhdGEsIHRvdGFsc10gPSBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbZHJhd2FibGVzLCBkcmF3VG90YWxdID0gZ2V0RHJhd2FibGVzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtwcm9wcywgcHJvcFRvdGFsXSA9IGdldFByb3BzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IG1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgdGF0dG9vcyA9IHBlZEhhbmRsZSA9PSBQbGF5ZXJQZWRJZCgpID8gYXdhaXQgZ2V0VGF0dG9vcygpIDogW11cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1vZGVsSW5kZXg6IGZpbmRNb2RlbEluZGV4KG1vZGVsKSxcclxuICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyQ29sb3IocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEgYXMgVEhlYWRPdmVybGF5LFxyXG4gICAgICAgIGhlYWRPdmVybGF5VG90YWw6IHRvdGFscyBhcyBUSGVhZE92ZXJsYXlUb3RhbCxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZSksXHJcbiAgICAgICAgZHJhd2FibGVzOiBkcmF3YWJsZXMsXHJcbiAgICAgICAgcHJvcHM6IHByb3BzLFxyXG4gICAgICAgIGRyYXdUb3RhbDogZHJhd1RvdGFsLFxyXG4gICAgICAgIHByb3BUb3RhbDogcHJvcFRvdGFsLFxyXG4gICAgICAgIHRhdHRvb3M6IHRhdHRvb3NcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkQXBwZWFyYW5jZVwiLCBnZXRBcHBlYXJhbmNlKVxyXG5vblNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDpnZXRBcHBlYXJhbmNlJywgKCkgPT4ge1xyXG4gICAgdXBkYXRlUGVkKFBsYXllclBlZElkKCkpXHJcbiAgICByZXR1cm4gZ2V0QXBwZWFyYW5jZShwZWQpXHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBlZENsb3RoZXMocGVkSGFuZGxlOiBudW1iZXIpOiBUQ2xvdGhlcyB7XHJcbiAgICBjb25zdCBbZHJhd2FibGVzXSA9IGdldERyYXdhYmxlcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbcHJvcHNdID0gZ2V0UHJvcHMocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW2hlYWREYXRhXSA9IGdldEhlYWRPdmVybGF5KHBlZEhhbmRsZSlcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGhlYWRPdmVybGF5OiBoZWFkRGF0YSBhcyBUSGVhZE92ZXJsYXksXHJcbiAgICAgICAgZHJhd2FibGVzOiBkcmF3YWJsZXMsXHJcbiAgICAgICAgcHJvcHM6IHByb3BzLFxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRQZWRDbG90aGVzXCIsIGdldFBlZENsb3RoZXMpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVkU2tpbihwZWRIYW5kbGU6IG51bWJlcik6IFRTa2luIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaGVhZEJsZW5kOiBnZXRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGVhZFN0cnVjdHVyZTogZ2V0SGVhZFN0cnVjdHVyZShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhhaXJDb2xvcjogZ2V0SGFpckNvbG9yKHBlZEhhbmRsZSksXHJcbiAgICAgICAgbW9kZWw6IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkU2tpblwiLCBnZXRQZWRTa2luKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhdHRvb0RhdGEoKSB7XHJcbiAgICBsZXQgdGF0dG9vWm9uZXMgPSBbXVxyXG5cclxuICAgIGNvbnN0IFtUQVRUT09fTElTVCwgVEFUVE9PX0NBVEVHT1JJRVNdID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLnRhdHRvb3MoKVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fQ0FURUdPUklFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gVEFUVE9PX0NBVEVHT1JJRVNbaV1cclxuICAgICAgICBjb25zdCB6b25lID0gY2F0ZWdvcnkuem9uZVxyXG4gICAgICAgIGNvbnN0IGxhYmVsID0gY2F0ZWdvcnkubGFiZWxcclxuICAgICAgICBjb25zdCBpbmRleCA9IGNhdGVnb3J5LmluZGV4XHJcbiAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdID0ge1xyXG4gICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICBsYWJlbDogbGFiZWwsXHJcbiAgICAgICAgICAgIHpvbmVJbmRleDogaW5kZXgsXHJcbiAgICAgICAgICAgIGRsY3M6IFtdXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IFRBVFRPT19MSVNULmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRsY0RhdGEgPSBUQVRUT09fTElTVFtqXVxyXG4gICAgICAgICAgICB0YXR0b29ab25lc1tpbmRleF0uZGxjcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBkbGNEYXRhLmRsYyxcclxuICAgICAgICAgICAgICAgIGRsY0luZGV4OiBqLFxyXG4gICAgICAgICAgICAgICAgdGF0dG9vczogW11cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaXNGZW1hbGUgPSBHZXRFbnRpdHlNb2RlbChwZWQpID09PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gVEFUVE9PX0xJU1RbaV1cclxuICAgICAgICBjb25zdCB7IGRsYywgdGF0dG9vcyB9ID0gZGF0YVxyXG4gICAgICAgIGNvbnN0IGRsY0hhc2ggPSBHZXRIYXNoS2V5KGRsYylcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRhdHRvb3MubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IHRhdHRvb3Nbal1cclxuICAgICAgICAgICAgbGV0IHRhdHRvbyA9IG51bGxcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyVGF0dG9vID0gdGF0dG9vRGF0YS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIGNvbnN0IGlzRmVtYWxlVGF0dG9vID0gbG93ZXJUYXR0b28uaW5jbHVkZXMoXCJfZlwiKVxyXG4gICAgICAgICAgICBpZiAoaXNGZW1hbGVUYXR0b28gJiYgaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNGZW1hbGVUYXR0b28gJiYgIWlzRmVtYWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXR0b28gPSB0YXR0b29EYXRhXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBoYXNoID0gbnVsbFxyXG4gICAgICAgICAgICBsZXQgem9uZSA9IC0xXHJcblxyXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoID0gR2V0SGFzaEtleSh0YXR0b28pXHJcbiAgICAgICAgICAgICAgICB6b25lID0gR2V0UGVkRGVjb3JhdGlvblpvbmVGcm9tSGFzaGVzKGRsY0hhc2gsIGhhc2gpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh6b25lICE9PSAtMSAmJiBoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB6b25lVGF0dG9vcyA9IHRhdHRvb1pvbmVzW3pvbmVdLmRsY3NbaV0udGF0dG9vc1xyXG5cclxuICAgICAgICAgICAgICAgIHpvbmVUYXR0b29zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0YXR0b28sXHJcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogaGFzaCxcclxuICAgICAgICAgICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICAgICAgICAgIGRsYzogZGxjLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGF0dG9vWm9uZXNcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRhdHRvb3MoKTogUHJvbWlzZTxUVGF0dG9vW10+IHtcclxuICAgIHJldHVybiBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldFRhdHRvb3MnKSB8fCBbXVxyXG59XHJcbmV4cG9ydHMoJ0dldFBsYXllclRhdHRvb3MnLCBnZXRUYXR0b29zKTtcclxuLy9taWdyYXRpb25cclxuXHJcbm9uU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50Om1pZ3JhdGlvbjpzZXRBcHBlYXJhbmNlJywgKGRhdGE6IHt0eXBlOiBzdHJpbmcsIGRhdGE6IGFueX0pID0+IHtcclxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdmaXZlbScpIGV4cG9ydHNbJ2ZpdmVtLWFwcGVhcmFuY2UnXS5zZXRQbGF5ZXJBcHBlYXJhbmNlKGRhdGEuZGF0YSlcclxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdpbGxlbml1bScpIGV4cG9ydHNbJ2lsbGVuaXVtLWFwcGVhcmFuY2UnXS5zZXRQbGF5ZXJBcHBlYXJhbmNlKGRhdGEuZGF0YSlcclxufSk7IiwgImV4cG9ydCBkZWZhdWx0IHtcclxuICAgIGhhdHM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMCxcclxuICAgIH0sXHJcbiAgICBnbGFzc2VzOiB7XHJcbiAgICAgICAgdHlwZTogXCJwcm9wXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICB9LFxyXG4gICAgbWFza3M6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICAgICAgb2ZmOiAwLFxyXG4gICAgfSxcclxuICAgIHNoaXJ0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogOCxcclxuICAgICAgICBvZmY6IDE1LFxyXG4gICAgICAgIGhvb2s6IHtcclxuICAgICAgICAgICAgZHJhd2FibGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogMywgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAndG9yc29zJyB9LFxyXG4gICAgICAgICAgICAgICAgeyBjb21wb25lbnQ6IDgsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ3NoaXJ0cycgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGphY2tldHM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDExLFxyXG4gICAgICAgIG9mZjogMTUsXHJcbiAgICAgICAgaG9vazoge1xyXG4gICAgICAgICAgICBkcmF3YWJsZXM6IFtcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAzLCB2YXJpYW50OiAxNSwgdGV4dHVyZTogMCwgaWQ6ICd0b3Jzb3MnIH0sXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogMTEsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ2phY2tldHMnIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB2ZXN0OiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA5LFxyXG4gICAgICAgIG9mZjogMCxcclxuICAgIH0sXHJcbiAgICBsZWdzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA0LFxyXG4gICAgICAgIG9mZjogMTgsXHJcbiAgICB9LFxyXG4gICAgc2hvZXM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDYsXHJcbiAgICAgICAgb2ZmOiAzNCxcclxuICAgIH1cclxufSIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSwgVEhhaXJDb2xvciwgVENsb3RoZXMsIFRTa2luLCBUVmFsdWUsIFRIZWFkU3RydWN0dXJlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIjtcclxuaW1wb3J0IFRPR0dMRV9JTkRFWEVTIGZyb20gXCJAZGF0YS90b2dnbGVzXCJcclxuaW1wb3J0IHsgcmVxdWVzdE1vZGVsLCBwZWQsIHVwZGF0ZVBlZCwgaXNQZWRGcmVlbW9kZU1vZGVsfSBmcm9tICdAdXRpbHMnO1xyXG5pbXBvcnQgeyBUVGF0dG9vIH0gZnJvbSBcIkB0eXBpbmdzL3RhdHRvb3NcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXREcmF3YWJsZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVybiBjb25zb2xlLndhcm4oJ05vIGRhdGEgcHJvdmlkZWQgZm9yIHNldERyYXdhYmxlJylcclxuXHJcbiAgICBTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlLCBkYXRhLnRleHR1cmUsIDApXHJcbiAgICByZXR1cm4gR2V0TnVtYmVyT2ZQZWRUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpXHJcbn1cclxuZXhwb3J0cygnU2V0UGVkRHJhd2FibGUnLCBzZXREcmF3YWJsZSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJvcChwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVybiBjb25zb2xlLndhcm4oJ05vIGRhdGEgcHJvdmlkZWQgZm9yIHNldFByb3AnKVxyXG5cclxuICAgIGlmIChkYXRhLnZhbHVlID09PSAtMSkge1xyXG4gICAgICAgIENsZWFyUGVkUHJvcChwZWRIYW5kbGUsIGRhdGEuaW5kZXgpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgU2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCBmYWxzZSlcclxuICAgIHJldHVybiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpXHJcbn1cclxuZXhwb3J0cygnU2V0UGVkUHJvcCcsIHNldFByb3ApO1xyXG5cclxuY29uc3QgZGVmTWFsZUhhc2ggPSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKVxyXG5cclxuZXhwb3J0IGNvbnN0IHNldE1vZGVsID0gYXN5bmMgKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUQXBwZWFyYW5jZSB8IFRTa2luIHwgbnVtYmVyIHwgc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+ID0+IHtcclxuICAgIGlmIChkYXRhID09IG51bGwgfHwgZGF0YSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdObyBkYXRhIHByb3ZpZGVkIGZvciBzZXRNb2RlbCcpXHJcbiAgICAgICAgcmV0dXJuIHBlZEhhbmRsZTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbW9kZWw6IG51bWJlcjtcclxuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICBtb2RlbCA9IEdldEhhc2hLZXkoZGF0YSk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgIG1vZGVsID0gZGF0YTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbW9kZWwgPSBkYXRhLm1vZGVsIHx8IGRlZk1hbGVIYXNoO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb2RlbCA9PT0gMCkgcmV0dXJuIHBlZEhhbmRsZTtcclxuXHJcbiAgICBhd2FpdCByZXF1ZXN0TW9kZWwobW9kZWwpO1xyXG5cclxuICAgIGNvbnN0IGlzUGxheWVyID0gSXNQZWRBUGxheWVyKHBlZEhhbmRsZSk7XHJcbiAgICBpZiAoaXNQbGF5ZXIpIHtcclxuICAgICAgICBTZXRQbGF5ZXJNb2RlbChQbGF5ZXJJZCgpLCBtb2RlbCk7XHJcbiAgICAgICAgcGVkSGFuZGxlID0gUGxheWVyUGVkSWQoKTtcclxuICAgICAgICB1cGRhdGVQZWQocGVkSGFuZGxlKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBTZXRQbGF5ZXJNb2RlbChwZWRIYW5kbGUsIG1vZGVsKTtcclxuICAgIH1cclxuXHJcbiAgICBTZXRNb2RlbEFzTm9Mb25nZXJOZWVkZWQobW9kZWwpO1xyXG4gICAgU2V0UGVkRGVmYXVsdENvbXBvbmVudFZhcmlhdGlvbihwZWRIYW5kbGUpO1xyXG5cclxuICAgIGlmICghaXNQZWRGcmVlbW9kZU1vZGVsKHBlZEhhbmRsZSkpIHJldHVybiBwZWRIYW5kbGU7XHJcblxyXG4gICAgY29uc3QgaXNKdXN0TW9kZWwgPSB0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGRhdGEgPT09ICdudW1iZXInO1xyXG4gICAgY29uc3QgaGFzSGVhZEJsZW5kID0gIWlzSnVzdE1vZGVsICYmIGRhdGEuaGVhZEJsZW5kICYmIE9iamVjdC5rZXlzKGRhdGEuaGVhZEJsZW5kKS5sZW5ndGggPiAwO1xyXG5cclxuICAgIGlmIChoYXNIZWFkQmxlbmQpIHtcclxuICAgICAgICBzZXRIZWFkQmxlbmQocGVkSGFuZGxlLCAoZGF0YSBhcyBUQXBwZWFyYW5jZSB8IFRTa2luKS5oZWFkQmxlbmQpO1xyXG4gICAgICAgIFNldFBlZEhlYWRCbGVuZERhdGEocGVkSGFuZGxlLCAwLCAwLCAwLCAwLCAwLCAwLCAwLjAsIDAuMCwgMC4wLCBmYWxzZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChtb2RlbCA9PT0gR2V0SGFzaEtleShcIm1wX21fZnJlZW1vZGVfMDFcIikpIHtcclxuICAgICAgICAgICAgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWRIYW5kbGUsIDAsIDAsIDAsIDAsIDAsIDAsIDAuMCwgMC4wLCAwLjAsIGZhbHNlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG1vZGVsID09PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKSkge1xyXG4gICAgICAgICAgICBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZSwgNDUsIDIxLCAwLCAyMCwgMTUsIDAsIDAuMywgMC4xLCAwLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwZWRIYW5kbGU7XHJcbn07XHJcbmV4cG9ydHMoJ1NldFBlZE1vZGVsJywgc2V0TW9kZWwpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEZhY2VGZWF0dXJlKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIGlmICghZGF0YSkgcmV0dXJuIGNvbnNvbGUud2FybignTm8gZGF0YSBwcm92aWRlZCBmb3Igc2V0RmFjZUZlYXR1cmUnKVxyXG5cclxuICAgIFNldFBlZEZhY2VGZWF0dXJlKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSArIDAuMClcclxufVxyXG5leHBvcnRzKCdTZXRQZWRGYWNlRmVhdHVyZScsIHNldEZhY2VGZWF0dXJlKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRGYWNlRmVhdHVyZXMocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRIZWFkU3RydWN0dXJlKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVybiBjb25zb2xlLndhcm4oJ05vIGRhdGEgcHJvdmlkZWQgZm9yIHNldEZhY2VGZWF0dXJlcycpXHJcbiAgICAgICAgXHJcblxyXG4gICAgZm9yIChjb25zdCBmZWF0dXJlIGluIGRhdGEpIHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IGRhdGFbZmVhdHVyZV1cclxuICAgICAgICBzZXRGYWNlRmVhdHVyZShwZWRIYW5kbGUsIHZhbHVlKVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoJ1NldFBlZEZhY2VGZWF0dXJlcycsIHNldEZhY2VGZWF0dXJlcyk7XHJcblxyXG5jb25zdCBpc1Bvc2l0aXZlID0gKHZhbDogbnVtYmVyKSA9PiB2YWwgPj0gMCA/IHZhbCA6IDBcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkQmxlbmQocGVkSGFuZGxlOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIGlmICghZGF0YSkgcmV0dXJuIGNvbnNvbGUud2FybignTm8gZGF0YSBwcm92aWRlZCBmb3Igc2V0SGVhZEJsZW5kJylcclxuXHJcbiAgICBwZWRIYW5kbGUgPSBwZWRIYW5kbGUgfHwgcGVkXHJcblxyXG4gICAgaWYgKCFpc1BlZEZyZWVtb2RlTW9kZWwocGVkSGFuZGxlKSkgcmV0dXJuXHJcblxyXG4gICAgY29uc3Qgc2hhcGVGaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZUZpcnN0KVxyXG4gICAgY29uc3Qgc2hhcGVTZWNvbmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVTZWNvbmQpXHJcbiAgICBjb25zdCBzaGFwZVRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlVGhpcmQpXHJcbiAgICBjb25zdCBza2luRmlyc3QgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpbkZpcnN0KVxyXG4gICAgY29uc3Qgc2tpblNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5za2luU2Vjb25kKVxyXG4gICAgY29uc3Qgc2tpblRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNraW5UaGlyZClcclxuICAgIGNvbnN0IHNoYXBlTWl4ID0gZGF0YS5zaGFwZU1peCArIDAuMFxyXG4gICAgY29uc3Qgc2tpbk1peCA9IGRhdGEuc2tpbk1peCArIDAuMFxyXG4gICAgY29uc3QgdGhpcmRNaXggPSBkYXRhLnRoaXJkTWl4ICsgMC4wXHJcbiAgICBjb25zdCBoYXNQYXJlbnQgPSBkYXRhLmhhc1BhcmVudFxyXG5cclxuICAgIFNldFBlZEhlYWRCbGVuZERhdGEocGVkSGFuZGxlLCBzaGFwZUZpcnN0LCBzaGFwZVNlY29uZCwgc2hhcGVUaGlyZCwgc2tpbkZpcnN0LCBza2luU2Vjb25kLCBza2luVGhpcmQsIHNoYXBlTWl4LCBza2luTWl4LCB0aGlyZE1peCwgaGFzUGFyZW50KVxyXG59XHJcbmV4cG9ydHMoJ1NldFBlZEhlYWRCbGVuZCcsIHNldEhlYWRCbGVuZCk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIGlmICghZGF0YSkgcmV0dXJuIGNvbnNvbGUud2FybignTm8gZGF0YSBwcm92aWRlZCBmb3Igc2V0SGVhZE92ZXJsYXknKVxyXG5cclxuICAgIGNvbnN0IGluZGV4ID0gZGF0YS5pbmRleFxyXG5cclxuICAgIGlmIChpbmRleCA9PT0gMTMpIHtcclxuICAgICAgICBTZXRQZWRFeWVDb2xvcihwZWRIYW5kbGUsIGRhdGEudmFsdWUpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmFsdWUgPSBkYXRhLm92ZXJsYXlWYWx1ZVxyXG5cclxuICAgIC8qIEhhaXIgY29sb3IgZG9lcyBub3QgaGF2ZSBhbiBpbmRleCwgb25seSBhbiBJRCBzbyB3ZSdsbCBjaGVjayBmb3IgdGhhdCAqL1xyXG4gICAgaWYgKGRhdGEuaWQgPT09ICdoYWlyQ29sb3InKSB7XHJcbiAgICAgICAgU2V0UGVkSGFpclRpbnQocGVkSGFuZGxlLCBkYXRhLmhhaXJDb2xvciwgZGF0YS5oYWlySGlnaGxpZ2h0KVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBTZXRQZWRIZWFkT3ZlcmxheShwZWRIYW5kbGUsIGluZGV4LCB2YWx1ZSwgZGF0YS5vdmVybGF5T3BhY2l0eSArIDAuMClcclxuICAgIFNldFBlZEhlYWRPdmVybGF5Q29sb3IocGVkSGFuZGxlLCBpbmRleCwgMSwgZGF0YS5maXJzdENvbG9yLCBkYXRhLnNlY29uZENvbG9yKVxyXG59XHJcbmV4cG9ydHMoJ1NldFBlZEhlYWRPdmVybGF5Jywgc2V0SGVhZE92ZXJsYXkpO1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZXNldFRvZ2dsZXMoZGF0YSkge1xyXG4gICAgY29uc3QgZHJhd2FibGVzID0gZGF0YS5kcmF3YWJsZXNcclxuICAgIGNvbnN0IHByb3BzID0gZGF0YS5wcm9wc1xyXG5cclxuICAgIGZvciAoY29uc3QgW3RvZ2dsZUl0ZW0sIHRvZ2dsZURhdGFdIG9mIE9iamVjdC5lbnRyaWVzKFRPR0dMRV9JTkRFWEVTKSkge1xyXG4gICAgICAgIGNvbnN0IHRvZ2dsZVR5cGUgPSB0b2dnbGVEYXRhLnR5cGVcclxuICAgICAgICBjb25zdCBpbmRleCA9IHRvZ2dsZURhdGEuaW5kZXhcclxuXHJcbiAgICAgICAgaWYgKHRvZ2dsZVR5cGUgPT09IFwiZHJhd2FibGVcIiAmJiBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0pIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudERyYXdhYmxlID0gR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpbmRleClcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnREcmF3YWJsZSAhPT0gZHJhd2FibGVzW3RvZ2dsZUl0ZW1dLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCAwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh0b2dnbGVUeXBlID09PSBcInByb3BcIiAmJiBwcm9wc1t0b2dnbGVJdGVtXSkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudFByb3AgIT09IHByb3BzW3RvZ2dsZUl0ZW1dLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBTZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleCwgcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIGZhbHNlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoJ1NldFBlZENsb3RoZXMnLCBzZXRQZWRDbG90aGVzKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRDbG90aGVzKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUQ2xvdGhlcykge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm4gY29uc29sZS53YXJuKCdObyBkYXRhIHByb3ZpZGVkIGZvciBzZXRQZWRDbG90aGVzJylcclxuXHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcbiAgICBjb25zdCBoZWFkT3ZlcmxheSA9IGRhdGEuaGVhZE92ZXJsYXlcclxuICAgIGZvciAoY29uc3QgaWQgaW4gZHJhd2FibGVzKSB7XHJcbiAgICAgICAgY29uc3QgZHJhd2FibGUgPSBkcmF3YWJsZXNbaWRdXHJcbiAgICAgICAgc2V0RHJhd2FibGUocGVkSGFuZGxlLCBkcmF3YWJsZSlcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIHByb3BzKSB7XHJcbiAgICAgICAgY29uc3QgcHJvcCA9IHByb3BzW2lkXVxyXG4gICAgICAgIHNldFByb3AocGVkSGFuZGxlLCBwcm9wKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgaWQgaW4gaGVhZE92ZXJsYXkpIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gaGVhZE92ZXJsYXlbaWRdXHJcbiAgICAgICAgc2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlLCBvdmVybGF5KVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoJ1NldFBlZENsb3RoZXMnLCBzZXRQZWRDbG90aGVzKTtcclxuXHJcbmV4cG9ydCBjb25zdCBzZXRQZWRTa2luID0gYXN5bmMgKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUU2tpbikgPT4ge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm4gY29uc29sZS53YXJuKCdObyBkYXRhIHByb3ZpZGVkIGZvciBzZXRQZWRTa2luJylcclxuXHJcbiAgICBpZiAoIXBlZEhhbmRsZSkgcmV0dXJuIGNvbnNvbGUud2FybignTm8gcGVkSGFuZGxlIHByb3ZpZGVkIGZvciBzZXRQZWRTa2luJylcclxuXHJcbiAgICBwZWRIYW5kbGUgPSBhd2FpdCBzZXRNb2RlbChwZWRIYW5kbGUsIGRhdGEpXHJcblxyXG4gICAgY29uc3QgaGVhZFN0cnVjdHVyZSA9IGRhdGEuaGVhZFN0cnVjdHVyZVxyXG4gICAgY29uc3QgaGVhZEJsZW5kID0gZGF0YS5oZWFkQmxlbmRcclxuXHJcbiAgICBpZiAoaGVhZEJsZW5kKSBzZXRIZWFkQmxlbmQocGVkSGFuZGxlLCBoZWFkQmxlbmQpXHJcbiAgICBcclxuICAgIGlmIChoZWFkU3RydWN0dXJlKSBzZXRGYWNlRmVhdHVyZXMocGVkSGFuZGxlLCBoZWFkU3RydWN0dXJlKVxyXG59XHJcbmV4cG9ydHMoJ1NldFBlZFNraW4nLCBzZXRQZWRTa2luKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRUYXR0b29zKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVGF0dG9vW10pIHtcclxuICAgIGlmICghZGF0YSkgcmV0dXJuIGNvbnNvbGUud2FybignTm8gZGF0YSBwcm92aWRlZCBmb3Igc2V0UGVkVGF0dG9vcycpXHJcblxyXG4gICAgQ2xlYXJQZWREZWNvcmF0aW9uc0xlYXZlU2NhcnMocGVkSGFuZGxlKVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IHRhdHRvb0RhdGEgPSBkYXRhW2ldLnRhdHRvb1xyXG4gICAgICAgIGlmICh0YXR0b29EYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBHZXRIYXNoS2V5KHRhdHRvb0RhdGEuZGxjKVxyXG4gICAgICAgICAgICBjb25zdCB0YXR0b28gPSB0YXR0b29EYXRhLmhhc2hcclxuICAgICAgICAgICAgQWRkUGVkRGVjb3JhdGlvbkZyb21IYXNoZXMocGVkSGFuZGxlLCBjb2xsZWN0aW9uLCB0YXR0b28pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoJ1NldFBlZFRhdHRvb3MnLCBzZXRQZWRUYXR0b29zKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRIYWlyQ29sb3JzKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUSGFpckNvbG9yKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVybiBjb25zb2xlLndhcm4oJ05vIGRhdGEgcHJvdmlkZWQgZm9yIHNldFBlZEhhaXJDb2xvcnMnKVxyXG5cclxuICAgIGNvbnN0IGNvbG9yID0gZGF0YS5jb2xvclxyXG4gICAgY29uc3QgaGlnaGxpZ2h0ID0gZGF0YS5oaWdobGlnaHRcclxuICAgIFNldFBlZEhhaXJDb2xvcihwZWRIYW5kbGUsIGNvbG9yLCBoaWdobGlnaHQpXHJcbn1cclxuZXhwb3J0cygnU2V0UGVkSGFpckNvbG9ycycsIHNldFBlZEhhaXJDb2xvcnMpO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBlZEFwcGVhcmFuY2UocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRBcHBlYXJhbmNlKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVybiBjb25zb2xlLndhcm4oJ05vIGRhdGEgcHJvdmlkZWQgZm9yIHNldFBlZEFwcGVhcmFuY2UnKVxyXG5cclxuICAgIGlmIChJc1BlZEFQbGF5ZXIocGVkSGFuZGxlKSkge1xyXG4gICAgICAgIHNldFBsYXllclBlZEFwcGVhcmFuY2UoZGF0YSlcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGF3YWl0IHNldFBlZFNraW4ocGVkSGFuZGxlLCBkYXRhKVxyXG4gICAgc2V0UGVkQ2xvdGhlcyhwZWRIYW5kbGUsIGRhdGEpXHJcbiAgICBzZXRQZWRIYWlyQ29sb3JzKHBlZEhhbmRsZSwgZGF0YS5oYWlyQ29sb3IpXHJcbiAgICBzZXRQZWRUYXR0b29zKHBlZEhhbmRsZSwgZGF0YS50YXR0b29zKVxyXG59XHJcbmV4cG9ydHMoJ1NldFBlZEFwcGVhcmFuY2UnLCBzZXRQZWRBcHBlYXJhbmNlKTtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGRhdGE6IFRBcHBlYXJhbmNlKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVybiBjb25zb2xlLndhcm4oJ05vIGRhdGEgcHJvdmlkZWQgZm9yIHNldFBsYXllclBlZEFwcGVhcmFuY2UnKVxyXG4gICAgLy8gU2luY2UgdGhpcyBmdW5jdGlvbiBpcyB1c3VhbGx5IGNhbGxlZCBhZnRlciBzY3JpcHRzIHNldCB0aGVpciBvd24gbW9kZWwsIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSBwZWQgYmVmb3JlIHdlIHNldCB0aGUgYXBwZWFyYW5jZVxyXG4gICAgdXBkYXRlUGVkKFBsYXllclBlZElkKCkpXHJcbiAgICBhd2FpdCBzZXRQZWRTa2luKHBlZCwgZGF0YSlcclxuICAgIC8vIFdlIG5lZWQgdG8gdXBkYXRlIHRoZSBwZWQgYWdhaW4gYWZ0ZXIgc2V0dGluZyB0aGUgc2tpbiBiZWNhdXNlIFNldFBsYXllck1vZGVsIHdpbGwgc2V0IGEgbmV3IFBsYXllclBlZElkXHJcbiAgICB1cGRhdGVQZWQoUGxheWVyUGVkSWQoKSlcclxuICAgIHNldFBlZENsb3RoZXMocGVkLCBkYXRhKVxyXG4gICAgc2V0UGVkSGFpckNvbG9ycyhwZWQsIGRhdGEuaGFpckNvbG9yKVxyXG4gICAgc2V0UGVkVGF0dG9vcyhwZWQsIGRhdGEudGF0dG9vcylcclxufVxyXG5cclxuZXhwb3J0cygnU2V0UGVkQ2xvdGhlcycsIHNldFBlZENsb3RoZXMpXHJcbmV4cG9ydHMoJ1NldFBlZFNraW4nLCBzZXRQZWRTa2luKVxyXG5leHBvcnRzKCdTZXRQZWRUYXR0b29zJywgc2V0UGVkVGF0dG9vcylcclxuZXhwb3J0cygnU2V0UGVkSGFpckNvbG9ycycsIHNldFBlZEhhaXJDb2xvcnMpIiwgImltcG9ydCB7IFJlY2VpdmUgfSBmcm9tICdAZXZlbnRzJztcclxuaW1wb3J0IHtcclxuXHRyZXNldFRvZ2dsZXMsXHJcblx0c2V0RHJhd2FibGUsXHJcblx0c2V0RmFjZUZlYXR1cmUsXHJcblx0c2V0SGVhZEJsZW5kLFxyXG5cdHNldEhlYWRPdmVybGF5LFxyXG5cdHNldE1vZGVsLFxyXG5cdHNldFBlZENsb3RoZXMsXHJcblx0c2V0UGVkVGF0dG9vcyxcclxuXHRzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlLFxyXG5cdHNldFByb3AsXHJcbn0gZnJvbSAnLi9hcHBlYXJhbmNlL3NldHRlcnMnO1xyXG5pbXBvcnQgeyBjbG9zZU1lbnUgfSBmcm9tICcuL21lbnUnO1xyXG5pbXBvcnQgeyBUQXBwZWFyYW5jZSwgVFRvZ2dsZURhdGEsIFRWYWx1ZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xyXG5pbXBvcnQgeyBkZWxheSwgZ2V0RnJhbWV3b3JrSUQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaywgcGVkLCB1cGRhdGVQZWQgfSBmcm9tICdAdXRpbHMnO1xyXG5pbXBvcnQgeyBnZXRBcHBlYXJhbmNlLCBnZXRUYXR0b29EYXRhIH0gZnJvbSAnLi9hcHBlYXJhbmNlL2dldHRlcnMnO1xyXG5pbXBvcnQgVE9HR0xFX0lOREVYRVMgZnJvbSAnQGRhdGEvdG9nZ2xlcyc7XHJcbmltcG9ydCB7IFRPdXRmaXREYXRhIH0gZnJvbSAnQHR5cGluZ3Mvb3V0Zml0cyc7XHJcbmltcG9ydCB7IFRUYXR0b28gfSBmcm9tICdAdHlwaW5ncy90YXR0b29zJztcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW5jZWwsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0YXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKTtcclxuXHRjbG9zZU1lbnUoKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2F2ZSwgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRyZXNldFRvZ2dsZXMoYXBwZWFyYW5jZSk7XHJcblxyXG5cdGF3YWl0IGRlbGF5KDEwMCk7XHJcblxyXG5cdGNvbnN0IG5ld0FwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKHBlZCk7XHJcblx0bmV3QXBwZWFyYW5jZS50YXR0b29zID0gYXBwZWFyYW5jZS50YXR0b29zIHx8IG51bGxcclxuXHR0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVBcHBlYXJhbmNlJywgZ2V0RnJhbWV3b3JrSUQoKSwgbmV3QXBwZWFyYW5jZSk7XHJcblxyXG5cdHNldFBlZFRhdHRvb3MocGVkLCBuZXdBcHBlYXJhbmNlLnRhdHRvb3MpO1xyXG5cclxuXHRjbG9zZU1lbnUoKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0TW9kZWwsIGFzeW5jIChtb2RlbDogc3RyaW5nLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBoYXNoID0gR2V0SGFzaEtleShtb2RlbCk7XHJcblx0aWYgKCFJc01vZGVsSW5DZGltYWdlKGhhc2gpIHx8ICFJc01vZGVsVmFsaWQoaGFzaCkpIHtcclxuXHRcdHJldHVybiBjYigwKTtcclxuXHR9XHJcblxyXG5cclxuXHRjb25zdCBuZXdQZWQgPSBhd2FpdCBzZXRNb2RlbChwZWQsIGhhc2gpO1xyXG5cclxuICAgIHVwZGF0ZVBlZChuZXdQZWQpXHJcblxyXG5cdGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKHBlZCk7XHJcblxyXG5cdGFwcGVhcmFuY2UudGF0dG9vcyA9IFtdO1xyXG5cclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgW10pO1xyXG5cclxuXHRjYihhcHBlYXJhbmNlKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZ2V0TW9kZWxUYXR0b29zLCBhc3luYyAoXzogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCB0YXR0b29zID0gZ2V0VGF0dG9vRGF0YSgpO1xyXG5cclxuXHRjYih0YXR0b29zKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0SGVhZFN0cnVjdHVyZSwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c2V0RmFjZUZlYXR1cmUocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0SGVhZE92ZXJsYXksIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldEhlYWRPdmVybGF5KHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRCbGVuZCwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c2V0SGVhZEJsZW5kKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFRhdHRvb3MsIGFzeW5jIChkYXRhOiBUVGF0dG9vW10sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldFBlZFRhdHRvb3MocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0UHJvcCwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0bGV0IHRleHR1cmUgPSBzZXRQcm9wKHBlZCwgZGF0YSk7XHJcblx0Y2IodGV4dHVyZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldERyYXdhYmxlLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRsZXQgdGV4dHVyZSA9IHNldERyYXdhYmxlKHBlZCwgZGF0YSk7XHJcblx0Y2IodGV4dHVyZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnRvZ2dsZUl0ZW0sIGFzeW5jIChkYXRhOiBUVG9nZ2xlRGF0YSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgaXRlbSA9IFRPR0dMRV9JTkRFWEVTW2RhdGEuaXRlbV07XHJcblx0aWYgKCFpdGVtKSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRjb25zdCBjdXJyZW50ID0gZGF0YS5kYXRhO1xyXG5cdGNvbnN0IHR5cGUgPSBpdGVtLnR5cGU7XHJcblx0Y29uc3QgaW5kZXggPSBpdGVtLmluZGV4O1xyXG5cdGNvbnN0IGhvb2sgPSBpdGVtLmhvb2s7XHJcblx0Y29uc3QgaG9va0RhdGEgPSBkYXRhLmhvb2tEYXRhO1xyXG5cclxuXHRpZiAoIWN1cnJlbnQpIHJldHVybiBjYihmYWxzZSk7XHJcblxyXG5cdGlmICh0eXBlID09PSAncHJvcCcpIHtcclxuXHRcdGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpO1xyXG5cclxuXHRcdGlmIChjdXJyZW50UHJvcCA9PT0gLTEpIHtcclxuXHRcdFx0c2V0UHJvcChwZWQsIGN1cnJlbnQpO1xyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdENsZWFyUGVkUHJvcChwZWQsIGluZGV4KTtcclxuXHRcdFx0Y2IodHJ1ZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9IGVsc2UgaWYgKHR5cGUgPT09ICdkcmF3YWJsZScpIHtcclxuXHRcdGNvbnN0IGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpO1xyXG5cclxuXHRcdGlmIChjdXJyZW50LnZhbHVlID09PSBpdGVtLm9mZikge1xyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoY3VycmVudC52YWx1ZSA9PT0gY3VycmVudERyYXdhYmxlKSB7XHJcblx0XHRcdFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBpdGVtLm9mZiwgMCwgMCk7XHJcblx0XHRcdGlmIChob29rKSB7XHJcblx0XHRcdFx0Zm9yKGxldCBpPTA7IGkgPCBob29rLmRyYXdhYmxlcz8ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGNvbnN0IGhvb2tJdGVtID0gaG9vay5kcmF3YWJsZXNbaV07XHJcblx0XHRcdFx0XHRTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBob29rSXRlbS5jb21wb25lbnQsIGhvb2tJdGVtLnZhcmlhbnQsIGhvb2tJdGVtLnRleHR1cmUsIDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRjYih0cnVlKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0c2V0RHJhd2FibGUocGVkLCBjdXJyZW50KTtcclxuXHRcdFx0Zm9yKGxldCBpPTA7IGkgPCBob29rRGF0YT8ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRzZXREcmF3YWJsZShwZWQsIGhvb2tEYXRhW2ldKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuKTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zYXZlT3V0Zml0LCBhc3luYyAoZGF0YTogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVPdXRmaXQnLCBkYXRhKTtcclxuXHRjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5kZWxldGVPdXRmaXQsIGFzeW5jICh7aWR9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmRlbGV0ZU91dGZpdCcsIGlkKTtcclxuXHRjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5yZW5hbWVPdXRmaXQsIGFzeW5jIChkYXRhOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6cmVuYW1lT3V0Zml0JywgZGF0YSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUudXNlT3V0Zml0LCBhc3luYyAob3V0Zml0OiBUT3V0Zml0RGF0YSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c2V0UGVkQ2xvdGhlcyhwZWQsIG91dGZpdCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmltcG9ydE91dGZpdCwgYXN5bmMgKHsgaWQsIG91dGZpdE5hbWUgfSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmltcG9ydE91dGZpdCcsIGZyYW1ld29ya2RJZCwgaWQsIG91dGZpdE5hbWUpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmZldGNoT3V0Zml0LCBhc3luYyAoeyBpZCB9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmZldGNoT3V0Zml0JywgaWQpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLml0ZW1PdXRmaXQsIGFzeW5jIChkYXRhOiB7b3V0Zml0OiBUT3V0Zml0RGF0YSwgbGFiZWw6IHN0cmluZ30sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6aXRlbU91dGZpdCcsIGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxub25OZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnVzZU91dGZpSXRlbScsIChvdXRmaXQ6IFRPdXRmaXREYXRhKSA9PiB7XHJcblx0c2V0UGVkQ2xvdGhlcyhwZWQsIG91dGZpdCk7XHJcbn0pIiwgImltcG9ydCB7IGdldEZyYW1ld29ya0lELCByZXF1ZXN0TG9jYWxlLCBzZW5kTlVJRXZlbnQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaywgdXBkYXRlUGVkLCBwZWQsIGdldFBsYXllckRhdGEsIGdldEpvYkluZm8sIGdldFBsYXllckdlbmRlck1vZGVsIH0gZnJvbSBcIkB1dGlsc1wiXHJcbmltcG9ydCB7IHN0YXJ0Q2FtZXJhLCBzdG9wQ2FtZXJhIH0gZnJvbSBcIi4vY2FtZXJhXCJcclxuaW1wb3J0IHR5cGUgeyBUQXBwZWFyYW5jZVpvbmUsIFRNZW51VHlwZXMgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gXCJAdHlwaW5ncy9vdXRmaXRzXCJcclxuaW1wb3J0IHsgU2VuZCB9IGZyb20gXCJAZXZlbnRzXCJcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0VGF0dG9vRGF0YSB9IGZyb20gXCIuL2FwcGVhcmFuY2UvZ2V0dGVyc1wiXHJcbmltcG9ydCBcIi4vaGFuZGxlcnNcIlxyXG5pbXBvcnQgeyBzZXRNb2RlbCB9IGZyb20gXCIuL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXHJcblxyXG5jb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxubGV0IGFybW91ciA9IDBcclxubGV0IG9wZW4gPSBmYWxzZVxyXG5cclxubGV0IHJlc29sdmVQcm9taXNlID0gbnVsbDtcclxubGV0IHByb21pc2UgPSBudWxsO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5NZW51KHpvbmU6IFRBcHBlYXJhbmNlWm9uZSB8IFRBcHBlYXJhbmNlWm9uZVsndHlwZSddLCBjcmVhdGlvbjogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICBpZiAoem9uZSA9PT0gbnVsbCB8fCBvcGVuKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBwZWRIYW5kbGUgPSBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBjb25maWdNZW51cyA9IGNvbmZpZy5tZW51cygpXHJcblxyXG4gICAgY29uc3QgaXNTdHJpbmcgPSB0eXBlb2Ygem9uZSA9PT0gJ3N0cmluZydcclxuXHJcbiAgICBjb25zdCB0eXBlID0gaXNTdHJpbmcgPyB6b25lIDogem9uZS50eXBlXHJcblxyXG4gICAgY29uc3QgbWVudSA9IGNvbmZpZ01lbnVzW3R5cGVdXHJcbiAgICBpZiAoIW1lbnUpIHJldHVyblxyXG5cclxuICAgIHVwZGF0ZVBlZChwZWRIYW5kbGUpXHJcblxyXG4gICAgY29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgY29uc3QgdGFicyA9IG1lbnUudGFic1xyXG4gICAgbGV0IGFsbG93RXhpdCA9IGNyZWF0aW9uID8gZmFsc2UgOiBtZW51LmFsbG93RXhpdFxyXG5cclxuICAgIGFybW91ciA9IEdldFBlZEFybW91cihwZWRIYW5kbGUpXHJcblxyXG4gICAgbGV0IG91dGZpdHMgPSBbXVxyXG5cclxuICAgIGNvbnN0IGhhc091dGZpdFRhYiA9IHRhYnMuaW5jbHVkZXMoJ291dGZpdHMnKVxyXG4gICAgaWYgKGhhc091dGZpdFRhYikgb3V0Zml0cyA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxPdXRmaXRbXT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldE91dGZpdHMnLCBmcmFtZXdvcmtkSWQpIGFzIE91dGZpdFtdXHJcblxyXG4gICAgbGV0IG1vZGVscyA9IFtdXHJcblxyXG4gICAgY29uc3QgaGFzSGVyaXRhZ2VUYWIgPSB0YWJzLmluY2x1ZGVzKCdoZXJpdGFnZScpXHJcbiAgICBpZiAoaGFzSGVyaXRhZ2VUYWIpIHtcclxuICAgICAgICBtb2RlbHMgPSBjb25maWcubW9kZWxzKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBoYXNUYXR0b29UYWIgPSB0YWJzLmluY2x1ZGVzKCd0YXR0b29zJylcclxuICAgIGxldCB0YXR0b29zXHJcbiAgICBpZiAoaGFzVGF0dG9vVGFiKSB7XHJcbiAgICAgICAgdGF0dG9vcyA9IGdldFRhdHRvb0RhdGEoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJsYWNrbGlzdCA9IGdldEJsYWNrbGlzdCh6b25lKVxyXG5cclxuICAgIGlmIChjcmVhdGlvbikge1xyXG4gICAgICAgIGNvbnN0IG1vZGVsID0gR2V0SGFzaEtleShnZXRQbGF5ZXJHZW5kZXJNb2RlbCgpKTtcclxuICAgICAgICBwZWRIYW5kbGUgPSBhd2FpdCBzZXRNb2RlbChwZWRIYW5kbGUsIG1vZGVsKTtcclxuICAgICAgICBlbWl0TmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzZXRyb3V0aW5nYnVja2V0JylcclxuICAgICAgICBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XHJcbiAgICAgICAgICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdXBkYXRlUGVkKHBlZEhhbmRsZSlcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWRIYW5kbGUpXHJcblxyXG4gICAgc3RhcnRDYW1lcmEoKVxyXG5cclxuICAgIHNlbmROVUlFdmVudChTZW5kLmRhdGEsIHtcclxuICAgICAgICB0YWJzLFxyXG4gICAgICAgIGFwcGVhcmFuY2UsXHJcbiAgICAgICAgYmxhY2tsaXN0LFxyXG4gICAgICAgIHRhdHRvb3MsXHJcbiAgICAgICAgb3V0Zml0cyxcclxuICAgICAgICBtb2RlbHMsXHJcbiAgICAgICAgYWxsb3dFeGl0LFxyXG4gICAgICAgIGpvYjogZ2V0Sm9iSW5mbygpLFxyXG4gICAgICAgIGxvY2FsZTogYXdhaXQgcmVxdWVzdExvY2FsZSgnbG9jYWxlJylcclxuICAgIH0pXHJcblxyXG4gICAgU2V0TnVpRm9jdXModHJ1ZSwgdHJ1ZSlcclxuICAgIHNlbmROVUlFdmVudChTZW5kLnZpc2libGUsIHRydWUpXHJcblxyXG4gICAgb3BlbiA9IHRydWVcclxuXHJcbiAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuaGlkZUh1ZCh0cnVlKVxyXG5cclxuICAgIGlmIChwcm9taXNlKSB7XHJcbiAgICAgICAgYXdhaXQgcHJvbWlzZVxyXG4gICAgICAgIGVtaXROZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlc2V0cm91dGluZ2J1Y2tldCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb21pc2UgPSBudWxsO1xyXG4gICAgcmVzb2x2ZVByb21pc2UgPSBudWxsO1xyXG4gICAgcmV0dXJuIHRydWVcclxufVxyXG5leHBvcnRzKCdPcGVuTWVudScsIG9wZW5NZW51KVxyXG5cclxuUmVnaXN0ZXJDb21tYW5kKCdhcHBlYXJhbmNlJywgYXN5bmMgKF8sIGFyZ3M6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBjb25zdCB0eXBlID0gYXJnc1swXVxyXG4gICAgaWYgKCF0eXBlKSB7XHJcbiAgICAgICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkluaXRpYWxDcmVhdGlvbigpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHpvbmUgPSB0eXBlLnRvTG93ZXJDYXNlKCkgYXMgVE1lbnVUeXBlc1xyXG4gICAgICAgIG9wZW5NZW51KHpvbmUpXHJcbiAgICB9XHJcbn0sIHRydWUpXHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0QmxhY2tsaXN0KHpvbmU6IFRBcHBlYXJhbmNlWm9uZSB8IHN0cmluZykge1xyXG4gICAgY29uc3Qge2dyb3VwVHlwZXMsIGJhc2V9ID0gY29uZmlnLmJsYWNrbGlzdCgpXHJcblxyXG4gICAgaWYgKHR5cGVvZiB6b25lID09PSAnc3RyaW5nJykgcmV0dXJuIGJhc2VcclxuXHJcbiAgICBpZiAoIWdyb3VwVHlwZXMpIHJldHVybiBiYXNlXHJcblxyXG4gICAgbGV0IGJsYWNrbGlzdCA9IHsuLi5iYXNlfVxyXG5cclxuICAgIGNvbnN0IHBsYXllckRhdGEgPSBnZXRQbGF5ZXJEYXRhKClcclxuXHJcblxyXG4gICAgZm9yIChjb25zdCB0eXBlIGluIGdyb3VwVHlwZXMpIHtcclxuICAgICAgICBjb25zdCBncm91cHMgPSBncm91cFR5cGVzW3R5cGVdXHJcbiAgICAgICAgZm9yIChjb25zdCBncm91cCBpbiBncm91cHMpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBza2lwOiBib29sZWFuID0gZmFsc2VcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09ICdqb2JzJyAmJiB6b25lLmpvYnMpIHtcclxuICAgICAgICAgICAgICAgIHNraXAgPSB6b25lLmpvYnMuaW5jbHVkZXMocGxheWVyRGF0YS5qb2IubmFtZSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ2dhbmdzJyAmJiB6b25lLmdhbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBza2lwID0gem9uZS5nYW5ncy5pbmNsdWRlcyhwbGF5ZXJEYXRhLmdhbmcubmFtZSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFza2lwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBncm91cEJsYWNrbGlzdCA9IGdyb3Vwc1tncm91cF1cclxuICAgICAgICAgICAgICAgIGJsYWNrbGlzdCA9IE9iamVjdC5hc3NpZ24oe30sIGJsYWNrbGlzdCwgZ3JvdXBCbGFja2xpc3QsIHtcclxuICAgICAgICAgICAgICAgICAgZHJhd2FibGVzOiBPYmplY3QuYXNzaWduKHt9LCBibGFja2xpc3QuZHJhd2FibGVzLCBncm91cEJsYWNrbGlzdC5kcmF3YWJsZXMpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBibGFja2xpc3RcclxuXHJcbiAgICAvLyByZXR1cm4gYmxhY2tsaXN0XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9zZU1lbnUoKSB7XHJcbiAgICBTZXRQZWRBcm1vdXIocGVkLCBhcm1vdXIpXHJcblxyXG4gICAgc3RvcENhbWVyYSgpXHJcbiAgICBTZXROdWlGb2N1cyhmYWxzZSwgZmFsc2UpXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC52aXNpYmxlLCBmYWxzZSlcclxuXHJcblxyXG4gICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmhpZGVIdWQoZmFsc2UpXHJcblxyXG4gICAgaWYgKHJlc29sdmVQcm9taXNlKSB7XHJcbiAgICAgICAgcmVzb2x2ZVByb21pc2UoKTtcclxuICAgIH1cclxuICAgIG9wZW4gPSBmYWxzZVxyXG59XHJcbiIsICJcbmltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxuaW1wb3J0IHsgc2V0UGVkQXBwZWFyYW5jZSB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxuaW1wb3J0IHsgb3Blbk1lbnUgfSBmcm9tIFwiLi4vbWVudVwiXG5cbmV4cG9ydCBmdW5jdGlvbiBRQkJyaWRnZSgpIHtcbiAgICBvbk5ldCgncWItY2xvdGhpbmc6Y2xpZW50OmxvYWRQbGF5ZXJDbG90aGluZycsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgcGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgYXdhaXQgc2V0UGVkQXBwZWFyYW5jZShwZWQsIGFwcGVhcmFuY2UpXG4gICAgfSlcblxuICAgIG9uTmV0KCdxYi1jbG90aGVzOmNsaWVudDpDcmVhdGVGaXJzdENoYXJhY3RlcicsICgpID0+IHtcbiAgICAgICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkluaXRpYWxDcmVhdGlvbigpXG4gICAgfSlcblxuICAgIG9uTmV0KCdxYi1jbG90aGluZzpjbGllbnQ6b3Blbk91dGZpdE1lbnUnLCAoKSA9PiB7XG4gICAgICAgIG9wZW5NZW51KHsgdHlwZTogXCJvdXRmaXRzXCIsIGNvb3JkczogWzAsIDAsIDAsIDBdIH0pICBcbiAgICB9KVxufSIsICJcbmltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxuaW1wb3J0IHsgc2V0UGVkQXBwZWFyYW5jZSwgc2V0UGxheWVyUGVkQXBwZWFyYW5jZSB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxuaW1wb3J0IHsgZ2V0RnJhbWV3b3JrSUQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayB9IGZyb20gXCJAdXRpbHNcIlxuXG5leHBvcnQgZnVuY3Rpb24gRVNYQnJpZGdlKCkge1xuICAgIGxldCBmaXJzdFNwYXduID0gZmFsc2VcblxuICAgIG9uKFwiZXN4X3NraW46cmVzZXRGaXJzdFNwYXduXCIsICgpID0+IHtcbiAgICAgICAgZmlyc3RTcGF3biA9IHRydWVcbiAgICB9KTtcblxuICAgIG9uKFwiZXN4X3NraW46cGxheWVyUmVnaXN0ZXJlZFwiLCAoKSA9PiB7XG4gICAgICAgIGlmKGZpcnN0U3Bhd24pXG4gICAgICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKClcbiAgICB9KTtcblxuICAgIG9uTmV0KCdza2luY2hhbmdlcjpsb2FkU2tpbjInLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmICghYXBwZWFyYW5jZS5tb2RlbCkgYXBwZWFyYW5jZS5tb2RlbCA9IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpO1xuICAgICAgICBhd2FpdCBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcbiAgICB9KTtcblxuICAgIG9uTmV0KCdza2luY2hhbmdlcjpnZXRTa2luJywgYXN5bmMgKGNiOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXG4gICAgICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXG4gICAgICAgIGNiKGFwcGVhcmFuY2UpXG4gICAgfSlcblxuICAgIG9uTmV0KCdza2luY2hhbmdlcjpsb2FkU2tpbicsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IGFueSkgPT4ge1xuICAgICAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXG4gICAgICAgIGlmIChjYikgY2IoKVxuICAgIH0pXG5cbiAgICBvbk5ldCgnZXN4X3NraW46b3BlblNhdmVhYmxlTWVudScsIGFzeW5jIChvblN1Ym1pdDogYW55KSA9PiB7XG4gICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24ob25TdWJtaXQpXG4gICAgfSlcbn0iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiO1xuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0RHJhd2FibGVzLCBnZXRQcm9wcyB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL2dldHRlcnNcIjtcbmltcG9ydCB7IHNldERyYXdhYmxlLCBzZXRNb2RlbCwgc2V0UGVkQXBwZWFyYW5jZSwgc2V0UGVkVGF0dG9vcywgc2V0UHJvcCB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL3NldHRlcnNcIjtcbmltcG9ydCB7IFRUYXR0b28gfSBmcm9tIFwiQHR5cGluZ3MvdGF0dG9vc1wiO1xuaW1wb3J0IHsgcGVkLCB1cGRhdGVQZWQgfSBmcm9tIFwiQHV0aWxzXCI7XG5cbmZ1bmN0aW9uIGV4cG9ydEhhbmRsZXIobmFtZTogc3RyaW5nLCBjYjogYW55KSB7XG4gICAgb24oJ19fY2Z4X2V4cG9ydF9pbGxlbml1bS1hcHBlYXJhbmNlXycgKyBuYW1lLCAoc2V0Q0I6IGFueSkgPT4ge1xuICAgICAgICBzZXRDQihjYik7XG4gICAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlsbGVuaXVtQ29tcGF0KCkge1xuICAgIGV4cG9ydEhhbmRsZXIoJ3N0YXJ0UGxheWVyQ3VzdG9taXphdGlvbicsICgpID0+IHtcbiAgICAgICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkluaXRpYWxDcmVhdGlvbigpXG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRNb2RlbCcsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gR2V0RW50aXR5TW9kZWwocGVkKVxuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkQ29tcG9uZW50cycsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBkcmF3YWJsZXM6IGFueSA9IGdldERyYXdhYmxlcyhwZWQpWzBdO1xuICAgICAgICBsZXQgbmV3ZHJhd2FibGUgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpZCBvZiBkcmF3YWJsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRyYXdhYmxlID0gZHJhd2FibGVzW2lkXTtcbiAgICAgICAgICAgIG5ld2RyYXdhYmxlLnB1c2goe1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudF9pZDogZHJhd2FibGUuaW5kZXgsXG4gICAgICAgICAgICAgICAgZHJhd2FibGU6IGRyYXdhYmxlLnZhbHVlLFxuICAgICAgICAgICAgICAgIHRleHR1cmU6IGRyYXdhYmxlLnRleHR1cmVcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZFByb3BzJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHByb3BzOiBhbnkgPSAgZ2V0UHJvcHMocGVkKVswXTtcbiAgICAgICAgbGV0IG5ld1Byb3BzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgaWQgb2YgcHJvcHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3AgPSBwcm9wc1tpZF07XG4gICAgICAgICAgICBuZXdQcm9wcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBwcm9wX2lkOiBwcm9wLmluZGV4LFxuICAgICAgICAgICAgICAgIGRyYXdhYmxlOiBwcm9wLnZhbHVlLFxuICAgICAgICAgICAgICAgIHRleHR1cmU6IHByb3AudGV4dHVyZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkSGVhZEJsZW5kJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICAgICAgLy9yZXR1cm4gZ2V0SGVhZEJsZW5kRGF0YShwZWQpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkRmFjZUZlYXR1cmVzJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICAgICAgLy9yZXR1cm4gZ2V0SGVhZFN0cnVjdHVyZShwZWQpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkSGVhZE92ZXJsYXlzJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICAgICAgLy9yZXR1cm4gZ2V0SGVhZE92ZXJsYXkocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEhhaXInLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgLy9yZXR1cm4gZ2V0SGFpcihwZWQpO1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRBcHBlYXJhbmNlJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXRBcHBlYXJhbmNlKHBlZCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQbGF5ZXJNb2RlbCcsIChtb2RlbDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHVwZGF0ZVBlZChQbGF5ZXJQZWRJZCgpKVxuICAgICAgICBzZXRNb2RlbChwZWQsIG1vZGVsKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZEhlYWRCbGVuZCcsIChwZWQ6IG51bWJlciwgYmxlbmQ6IGFueSkgPT4ge1xuICAgICAgICAvL3NldEhlYWRCbGVuZChwZWQsIGJsZW5kKTtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkRmFjZUZlYXR1cmVzJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRIZWFkT3ZlcmxheXMnLCAocGVkOiBudW1iZXIsIG92ZXJsYXk6IGFueSkgPT4ge1xuICAgICAgICAvL3NldEhlYWRPdmVybGF5KHBlZCwgb3ZlcmxheSk7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZEhhaXInLCBhc3luYyAocGVkOiBudW1iZXIsIGhhaXI6IGFueSwgdGF0dG9vOiBhbnkpID0+IHtcbiAgICAgICAgLy9zZXRQZWRIYWlyQ29sb3JzKHBlZCwgaGFpcik7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZEV5ZUNvbG9yJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRDb21wb25lbnQnLCAocGVkOiBudW1iZXIsIGRyYXdhYmxlOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgbmV3RHJhd2FibGUgPSB7XG4gICAgICAgICAgICBpbmRleDogZHJhd2FibGUuY29tcG9uZW50X2lkLFxuICAgICAgICAgICAgdmFsdWU6IGRyYXdhYmxlLmRyYXdhYmxlLFxuICAgICAgICAgICAgdGV4dHVyZTogZHJhd2FibGUudGV4dHVyZVxuICAgICAgICB9XG4gICAgICAgIHNldERyYXdhYmxlKHBlZCwgbmV3RHJhd2FibGUpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkQ29tcG9uZW50cycsIChwZWQ6IG51bWJlciwgY29tcG9uZW50czogYW55KSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgY29tcG9uZW50IG9mIGNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld0RyYXdhYmxlID0ge1xuICAgICAgICAgICAgICAgIGluZGV4OiBjb21wb25lbnQuY29tcG9uZW50X2lkLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBjb21wb25lbnQuZHJhd2FibGUsXG4gICAgICAgICAgICAgICAgdGV4dHVyZTogY29tcG9uZW50LnRleHR1cmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldERyYXdhYmxlKHBlZCwgbmV3RHJhd2FibGUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRQcm9wJywgKHBlZDogbnVtYmVyLCBwcm9wOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgbmV3UHJvcCA9IHtcbiAgICAgICAgICAgIGluZGV4OiBwcm9wLnByb3BfaWQsXG4gICAgICAgICAgICB2YWx1ZTogcHJvcC5kcmF3YWJsZSxcbiAgICAgICAgICAgIHRleHR1cmU6IHByb3AudGV4dHVyZVxuICAgICAgICB9XG4gICAgICAgIHNldFByb3AocGVkLCBuZXdQcm9wKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZFByb3BzJywgKHBlZDogbnVtYmVyLCBwcm9wczogYW55KSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBwcm9wcykge1xuICAgICAgICAgICAgY29uc3QgbmV3UHJvcCA9IHtcbiAgICAgICAgICAgICAgICBpbmRleDogcHJvcC5wcm9wX2lkLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9wLmRyYXdhYmxlLFxuICAgICAgICAgICAgICAgIHRleHR1cmU6IHByb3AudGV4dHVyZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0UHJvcChwZWQsIG5ld1Byb3ApO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBleHBvcnRIYW5kbGVyKCdzZXRQbGF5ZXJBcHBlYXJhbmNlJywgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlKSA9PiB7XG4gICAgLy8gICAgIHJldHVybiBjb25zb2xlLndhcm4oJ05lZWQgdG8gYmUgaW1wbGVtZW50ZWQnKTtcbiAgICAvLyB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZEFwcGVhcmFuY2UnLCAocGVkOiBudW1iZXIsIGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlKSA9PiB7XG4gICAgICAgIHNldFBlZEFwcGVhcmFuY2UocGVkLCBhcHBlYXJhbmNlKVxuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkVGF0dG9vcycsIChwZWQ6IG51bWJlciwgdGF0dG9vczogVFRhdHRvb1tdKSA9PiB7XG4gICAgICAgIHNldFBlZFRhdHRvb3MocGVkLCB0YXR0b29zKVxuICAgIH0pO1xufSIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSwgVEFwcGVhcmFuY2Vab25lIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgeyBvcGVuTWVudSB9IGZyb20gXCIuL21lbnVcIlxyXG5pbXBvcnQgeyBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlIH0gZnJvbSBcIi4vYXBwZWFyYW5jZS9zZXR0ZXJzXCJcclxuaW1wb3J0IHsgdHJpZ2dlclNlcnZlckNhbGxiYWNrLCBnZXRGcmFtZXdvcmtJRCwgRGVsYXksIGJsX2JyaWRnZSwgcGVkLCBkZWxheSwgZm9ybWF0LCB1cGRhdGVQZWQgfSBmcm9tIFwiQHV0aWxzXCJcclxuaW1wb3J0IHsgUUJCcmlkZ2UgfSBmcm9tIFwiLi9icmlkZ2UvcWJcIlxyXG5pbXBvcnQgeyBFU1hCcmlkZ2UgfSBmcm9tIFwiLi9icmlkZ2UvZXN4XCJcclxuaW1wb3J0IHsgaWxsZW5pdW1Db21wYXQgfSBmcm9tIFwiLi9jb21wYXQvaWxsZW5pdW1cIlxyXG5cclxuZXhwb3J0cygnU2V0UGxheWVyUGVkQXBwZWFyYW5jZScsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSB8IHN0cmluZykgPT4ge1xyXG4gICAgbGV0IHJlc29sdmVkQXBwZWFyYW5jZTogVEFwcGVhcmFuY2U7XHJcbiAgICBcclxuICAgIGlmICghYXBwZWFyYW5jZSB8fCB0eXBlb2YgYXBwZWFyYW5jZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICBjb25zdCBmcmFtZXdvcmtJRDogc3RyaW5nID0gYXBwZWFyYW5jZSB8fCBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpO1xyXG4gICAgICAgIHJlc29sdmVkQXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRCkgYXMgVEFwcGVhcmFuY2U7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcHBlYXJhbmNlID09PSAnb2JqZWN0JykgcmVzb2x2ZWRBcHBlYXJhbmNlID0gYXBwZWFyYW5jZTtcclxuICAgIFxyXG4gICAgaWYgKCFyZXNvbHZlZEFwcGVhcmFuY2UpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHZhbGlkIGFwcGVhcmFuY2UgZm91bmQnKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShyZXNvbHZlZEFwcGVhcmFuY2UpO1xyXG59KTtcclxuXHJcbmV4cG9ydHMoJ0dldFBsYXllclBlZEFwcGVhcmFuY2UnLCBhc3luYyAoZnJhbWV3b3JrSUQ6IHN0cmluZykgPT4ge1xyXG4gICAgZnJhbWV3b3JrSUQgPSBmcmFtZXdvcmtJRCB8fCBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICByZXR1cm4gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG59KVxyXG5cclxuZXhwb3J0cygnSW5pdGlhbENyZWF0aW9uJywgYXN5bmMgKGNiPzogRnVuY3Rpb24pID0+IHtcclxuICAgIC8vIFRoZSBmaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSB0eXBlIG9mIFRBcHBlYXJhbmNlWm9uZSBtZWFuaW5nIGl0IG5lZWRzIGEgY29vcmRzIHByb3BlcnR5LCBidXQgaW4gdGhpcyBjYXNlIGl0J3Mgbm90IHVzZWRcclxuICAgIGF3YWl0IG9wZW5NZW51KHsgdHlwZTogXCJhcHBlYXJhbmNlXCIsIGNvb3JkczogWzAsIDAsIDAsIDBdIH0sIHRydWUpXHJcbiAgICBpZiAoY2IpIGNiKClcclxufSlcclxuXHJcbm9uKCdibF9hcHBlYXJhbmNlOmNsaWVudDp1c2Vab25lJywgKHpvbmU6IFRBcHBlYXJhbmNlWm9uZSkgPT4ge1xyXG4gICAgb3Blbk1lbnUoem9uZSlcclxufSlcclxuXHJcbm9uTmV0KCdibF9icmlkZ2U6Y2xpZW50OnBsYXllckxvYWRlZCcsIGFzeW5jICgpID0+IHtcclxuICAgIHdoaWxlICghYmxfYnJpZGdlLmNvcmUoKS5wbGF5ZXJMb2FkZWQoKSkge1xyXG4gICAgICAgIGF3YWl0IERlbGF5KDEwMCk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBmcmFtZXdvcmtJRCA9IGF3YWl0IGdldEZyYW1ld29ya0lEKClcclxuICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcbiAgICBpZiAoIWFwcGVhcmFuY2UpIHJldHVybjtcclxuICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSlcclxufSlcclxuXHJcbm9uTmV0KCdvblJlc291cmNlU3RhcnQnLCBhc3luYyAocmVzb3VyY2U6IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKHJlc291cmNlID09PSBHZXRDdXJyZW50UmVzb3VyY2VOYW1lKCkgJiYgYmxfYnJpZGdlLmNvcmUoKS5wbGF5ZXJMb2FkZWQoKSkge1xyXG4gICAgICAgIGNvbnN0IGZyYW1ld29ya0lEID0gYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcbiAgICAgICAgaWYgKCFhcHBlYXJhbmNlKSByZXR1cm47XHJcbiAgICAgICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxyXG4gICAgfVxyXG59KVxyXG5cclxuY29uc3QgZnJhbWV3b3JrTmFtZSA9IGJsX2JyaWRnZS5nZXRGcmFtZXdvcmsoJ2NvcmUnKVxyXG5jb25zdCBjb3JlID0gZm9ybWF0KEdldENvbnZhcignYmw6ZnJhbWV3b3JrJywgJ3FiJykpXHJcblxyXG5pZiAoY29yZSA9PSAncWInIHx8IGNvcmUgPT0gJ3FieCcgJiYgR2V0UmVzb3VyY2VTdGF0ZShmcmFtZXdvcmtOYW1lKSA9PSAnc3RhcnRlZCcpIHtcclxuICAgIFFCQnJpZGdlKCk7XHJcbn0gZWxzZSBpZiAoY29yZSA9PSAnZXN4JyAmJiBHZXRSZXNvdXJjZVN0YXRlKGZyYW1ld29ya05hbWUpID09ICdzdGFydGVkJykge1xyXG4gICAgRVNYQnJpZGdlKCk7XHJcbn1cclxuXHJcbmlsbGVuaXVtQ29tcGF0KCk7XHJcblxyXG5SZWdpc3RlckNvbW1hbmQoJ3JlbG9hZHNraW4nLCBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCBmcmFtZXdvcmtJRCA9IGF3YWl0IGdldEZyYW1ld29ya0lEKClcclxuICAgIGNvbnN0IGhlYWx0aCA9IEdldEVudGl0eUhlYWx0aChwZWQpO1xyXG4gICAgY29uc3QgbWF4aGVhbHRoID0gR2V0RW50aXR5TWF4SGVhbHRoKHBlZCk7XHJcbiAgICBjb25zdCBhcm1vciA9IEdldFBlZEFybW91cihwZWQpO1xyXG5cclxuICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcbiAgICBpZiAoIWFwcGVhcmFuY2UpIHJldHVybjtcclxuICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSlcclxuXHJcbiAgICBTZXRQZWRNYXhIZWFsdGgocGVkLCBtYXhoZWFsdGgpXHJcbiAgICBkZWxheSgxMDAwKSBcclxuICAgIFNldEVudGl0eUhlYWx0aChwZWQsIGhlYWx0aClcclxuICAgIFNldFBlZEFybW91cihwZWQsIGFybW9yKVxyXG59LCBmYWxzZSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7OztBQUFPLElBQUksTUFBTTtBQUVWLElBQU0sWUFBWSx3QkFBQyxjQUFzQjtBQUM1QyxRQUFNO0FBQ1YsR0FGeUI7QUFhbEIsSUFBTSxlQUFlLHdCQUFDLFFBQWdCLFNBQWM7QUFDdkQsaUJBQWU7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLEVBQ0osQ0FBQztBQUNMLEdBTDRCO0FBT3JCLElBQU0sUUFBUSx3QkFBQyxPQUFlLElBQUksUUFBUSxTQUFPLFdBQVcsS0FBSyxFQUFFLENBQUMsR0FBdEQ7QUFFZCxJQUFNLGVBQWUsOEJBQU8sVUFBNEM7QUFDM0UsTUFBSSxZQUFvQixPQUFPLFVBQVUsV0FBVyxRQUFRLFdBQVcsS0FBSztBQUU1RSxNQUFJLENBQUMsYUFBYSxTQUFTLEtBQUssQ0FBQyxpQkFBaUIsU0FBUyxHQUFHO0FBTzFELFlBQVEsS0FBSyxvQ0FBb0MsS0FBSyxHQUFHO0FBQ3pELFdBQU87QUFBQSxFQUNYO0FBRUEsTUFBSSxlQUFlLFNBQVM7QUFBRyxXQUFPO0FBRXRDLGVBQWEsU0FBUztBQUV0QixRQUFNLHFCQUFxQiw2QkFBcUI7QUFDNUMsV0FBTyxJQUFJLFFBQVEsYUFBVztBQUMxQixZQUFNLFdBQVcsWUFBWSxNQUFNO0FBQy9CLFlBQUksZUFBZSxTQUFTLEdBQUc7QUFDM0Isd0JBQWMsUUFBUTtBQUN0QixrQkFBUTtBQUFBLFFBQ1o7QUFBQSxNQUNKLEdBQUcsR0FBRztBQUFBLElBQ1YsQ0FBQztBQUFBLEVBQ0wsR0FUMkI7QUFXM0IsUUFBTSxtQkFBbUI7QUFFekIsU0FBTztBQUNYLEdBaEM0QjtBQXNDNUIsSUFBTSxlQUFlLHVCQUF1QjtBQUM1QyxJQUFNLGNBQXNDLENBQUM7QUFDN0MsSUFBTSxlQUF5RCxDQUFDO0FBRWhFLFNBQVMsV0FBVyxXQUFtQkEsUUFBc0I7QUFDekQsTUFBSUEsVUFBU0EsU0FBUSxHQUFHO0FBQ3BCLFVBQU0sY0FBYyxhQUFhO0FBRWpDLFNBQUssWUFBWSxTQUFTLEtBQUssS0FBSztBQUFhLGFBQU87QUFFeEQsZ0JBQVksU0FBUyxJQUFJLGNBQWNBO0FBQUEsRUFDM0M7QUFFQSxTQUFPO0FBQ1g7QUFWUztBQVlULE1BQU0sVUFBVSxZQUFZLElBQUksQ0FBQyxRQUFnQixTQUFjO0FBQzNELFFBQU0sVUFBVSxhQUFhLEdBQUc7QUFDaEMsU0FBTyxXQUFXLFFBQVEsR0FBRyxJQUFJO0FBQ3JDLENBQUM7QUFFTSxTQUFTLHNCQUNaLGNBQXNCLE1BQ0w7QUFDakIsTUFBSSxDQUFDLFdBQVcsV0FBVyxDQUFDLEdBQUc7QUFDM0I7QUFBQSxFQUNKO0FBRUEsTUFBSTtBQUVKLEtBQUc7QUFDQyxVQUFNLEdBQUcsU0FBUyxJQUFJLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxNQUFTLEVBQUUsQ0FBQztBQUFBLEVBQ2xFLFNBQVMsYUFBYSxHQUFHO0FBQ3pCLFVBQVEsVUFBVSxTQUFTLElBQUksY0FBYyxLQUFLLEdBQUcsSUFBSTtBQUV6RCxTQUFPLElBQUksUUFBVyxDQUFDLFlBQVk7QUFDL0IsaUJBQWEsR0FBRyxJQUFJO0FBQUEsRUFDeEIsQ0FBQztBQUNMO0FBakJnQjtBQW1CVCxTQUFTLGlCQUFpQixXQUFXLElBQUk7QUFDNUMsUUFBTSxVQUFVLFNBQVMsSUFBSSxPQUFPLFVBQVUsUUFBUSxTQUFTO0FBQzNELFFBQUk7QUFDSixRQUFJO0FBQ0EsaUJBQVcsTUFBTSxHQUFHLEdBQUcsSUFBSTtBQUFBLElBQy9CLFNBQ08sR0FBRztBQUNOLGNBQVEsTUFBTSxtREFBbUQsU0FBUyxFQUFFO0FBQzVFLGNBQVEsSUFBSSxLQUFLLEVBQUUsS0FBSyxJQUFJO0FBQUEsSUFDaEM7QUFDQSxZQUFRLFVBQVUsUUFBUSxJQUFJLEtBQUssUUFBUTtBQUFBLEVBQy9DLENBQUM7QUFDTDtBQVpnQjtBQWdCVCxJQUFNLGdCQUFnQix3QkFBQyxvQkFBNEI7QUFDdEQsU0FBTyxJQUFJLFFBQVEsQ0FBQyxZQUFZO0FBQzVCLFVBQU0sb0JBQW9CLDZCQUFNO0FBQzVCLFVBQUksdUJBQXVCLGVBQWUsR0FBRztBQUN6QyxjQUFNLGFBQWEsUUFBUSxjQUFjLE9BQU8sRUFBRTtBQUNsRCxZQUFJLG9CQUFvQixpQkFBaUIsY0FBYyxVQUFVLFVBQVUsT0FBTztBQUNsRixZQUFJLENBQUMsbUJBQW1CO0FBQ3BCLGtCQUFRLE1BQU0sR0FBRyxVQUFVLHFFQUFxRTtBQUNoRyw4QkFBb0IsaUJBQWlCLGNBQWMsZ0JBQWdCO0FBQUEsUUFDdkU7QUFDQSxnQkFBUSxpQkFBaUI7QUFBQSxNQUM3QixPQUFPO0FBQ0gsbUJBQVcsbUJBQW1CLEdBQUc7QUFBQSxNQUNyQztBQUFBLElBQ0osR0FaMEI7QUFhMUIsc0JBQWtCO0FBQUEsRUFDdEIsQ0FBQztBQUNMLEdBakI2QjtBQTJCdEIsSUFBTSxZQUFZLFFBQVE7QUFFMUIsSUFBTSxnQkFBZ0IsNkJBQU07QUFDL0IsU0FBTyxVQUFVLEtBQUssRUFBRSxjQUFjO0FBQzFDLEdBRjZCO0FBSXRCLElBQU0saUJBQWlCLDZCQUFNO0FBQ2hDLFFBQU0sS0FBSyxjQUFjLEVBQUU7QUFDM0IsU0FBTztBQUNYLEdBSDhCO0FBS3ZCLElBQU0sdUJBQXVCLDZCQUFNO0FBQ3RDLFFBQU0sU0FBUyxjQUFjLEVBQUU7QUFDL0IsU0FBTyxXQUFXLFNBQVMscUJBQXFCO0FBQ3BELEdBSG9DO0FBSzdCLFNBQVMsTUFBTSxJQUEyQjtBQUM3QyxTQUFPLElBQUksUUFBUSxhQUFXLFdBQVcsU0FBUyxFQUFFLENBQUM7QUFDekQ7QUFGZ0I7QUFJVCxTQUFTLE9BQU8sS0FBcUI7QUFDeEMsTUFBSSxDQUFDLElBQUksU0FBUyxHQUFHO0FBQUcsV0FBTztBQUMvQixTQUFPLElBQUksUUFBUSxNQUFNLEVBQUU7QUFDL0I7QUFIZ0I7QUFLVCxTQUFTLGFBQXVEO0FBQ25FLFFBQU0sTUFBTSxjQUFjLEVBQUU7QUFDNUIsU0FBTyxNQUFNLEVBQUUsTUFBTSxJQUFJLE1BQU0sUUFBUSxJQUFJLE9BQU8sSUFBSTtBQUMxRDtBQUhnQjtBQUtULFNBQVMsbUJBQW1CQyxNQUFhO0FBQzVDLFFBQU0sUUFBUSxlQUFlQSxJQUFHO0FBQ2hDLFNBQU8sVUFBVSxXQUFXLGtCQUFrQixLQUFLLFVBQVUsV0FBVyxrQkFBa0I7QUFDOUY7QUFIZ0I7OztBQzNLaEIsSUFBTSwwQkFBMEI7QUFDaEMsSUFBTSx1QkFBdUI7QUFFN0IsSUFBSSxVQUFtQjtBQUN2QixJQUFJLGNBQXNCO0FBQzFCLElBQUksTUFBcUI7QUFDekIsSUFBSSxTQUFpQjtBQUNyQixJQUFJLFNBQWlCO0FBQ3JCLElBQUksZUFBK0I7QUFDbkMsSUFBSSxTQUF3QjtBQUM1QixJQUFJLGNBQXVCO0FBRTNCLElBQUksY0FBa0M7QUFFdEMsSUFBTSxjQUE0QjtBQUFBLEVBQzlCLE9BQU87QUFBQSxFQUNWLE1BQU07QUFBQSxFQUNOLE9BQU87QUFBQSxFQUNQLE1BQU0sQ0FBQyxPQUFPLEtBQUs7QUFBQSxFQUNoQixPQUFPLENBQUMsT0FBTyxLQUFLO0FBQ3hCO0FBRUEsSUFBTSxNQUFNLHdCQUFDLFlBQTRCO0FBQ3hDLFNBQU8sS0FBSyxJQUFLLFVBQVUsS0FBSyxLQUFNLEdBQUc7QUFDMUMsR0FGWTtBQUlaLElBQU0sTUFBTSx3QkFBQyxZQUE0QjtBQUN4QyxTQUFPLEtBQUssSUFBSyxVQUFVLEtBQUssS0FBTSxHQUFHO0FBQzFDLEdBRlk7QUFJWixJQUFNLFlBQVksNkJBQWdCO0FBQ2pDLFFBQU0sS0FDSCxJQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sS0FBSyxJQUMzRDtBQUNELFFBQU0sS0FDSCxJQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sS0FBSyxJQUMzRDtBQUNELFFBQU0sSUFBSSxJQUFJLE1BQU0sSUFBSTtBQUV4QixTQUFPLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDaEIsR0FWa0I7QUFZbEIsSUFBTSxpQkFBaUIsd0JBQUMsUUFBaUIsV0FBMEI7QUFDbEUsTUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0I7QUFBYTtBQUU5QyxXQUFTLFVBQVU7QUFDbkIsV0FBUyxVQUFVO0FBRW5CLFlBQVU7QUFDVixZQUFVO0FBRVAsUUFBTSxnQkFBZ0IsZ0JBQWdCLFdBQVcsZ0JBQWdCO0FBQ2pFLFFBQU0sV0FBVyxnQkFBZ0IsS0FBTztBQUV4QyxRQUFNLFVBQVUsZ0JBQWdCO0FBQ2hDLFFBQU0sV0FBVyxVQUFVLElBQU07QUFFcEMsV0FBUyxLQUFLLElBQUksS0FBSyxJQUFJLFFBQVEsUUFBUSxHQUFHLFFBQVE7QUFFdEQsUUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksVUFBVTtBQUU1QjtBQUFBLElBQ0M7QUFBQSxJQUNBLGFBQWEsSUFBSTtBQUFBLElBQ2pCLGFBQWEsSUFBSTtBQUFBLElBQ2pCLGFBQWEsSUFBSTtBQUFBLEVBQ2xCO0FBQ0Esa0JBQWdCLEtBQUssYUFBYSxHQUFHLGFBQWEsR0FBRyxhQUFhLENBQUM7QUFDcEUsR0ExQnVCO0FBNEJ2QixJQUFNLGFBQWEsOEJBQU8sUUFBaUIsYUFBc0I7QUFDaEUsUUFBTSxVQUFrQixpQkFBaUIsR0FBRyxJQUFJO0FBQ2hELGFBQVcsWUFBWTtBQUV2QixnQkFBYztBQUNkLGdCQUFjO0FBQ2QsV0FBUztBQUVULFFBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLFVBQVU7QUFFNUIsUUFBTSxTQUFpQjtBQUFBLElBQ3RCO0FBQUEsSUFDQSxPQUFPLElBQUk7QUFBQSxJQUNYLE9BQU8sSUFBSTtBQUFBLElBQ1gsT0FBTyxJQUFJO0FBQUEsSUFDWDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRDtBQUVBLGlCQUFlO0FBQ2YsZ0JBQWM7QUFDZCxXQUFTO0FBQ1QsUUFBTTtBQUVOLGtCQUFnQixRQUFRLE9BQU8sR0FBRyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3BELHlCQUF1QixRQUFRLFFBQVEsS0FBSyxHQUFHLENBQUM7QUFFaEQsUUFBTSxNQUFNLEdBQUc7QUFFZiwwQkFBd0IsUUFBUSxJQUFJO0FBQ3BDLGdCQUFjLFFBQVEsR0FBRztBQUN6QixlQUFhLFFBQVEsR0FBRztBQUN4QixvQkFBa0IsUUFBUSxHQUFHO0FBQzdCLFdBQVMsTUFBTTtBQUVmLGFBQVcsUUFBUSxJQUFJO0FBQ3hCLEdBeENtQjtBQTBDbkIsSUFBTSxXQUFXLHdCQUFDLGVBQXVCO0FBQ3hDLE1BQUksRUFBRSxhQUFhLEdBQUcsS0FBSyxjQUFjO0FBQU07QUFDL0MsY0FBWTtBQUNaLGFBQVcsVUFBVSxDQUFDO0FBQ3ZCLEdBSmlCO0FBTVYsSUFBTSxjQUFjLDZCQUFNO0FBQ2hDLE1BQUk7QUFBUztBQUNiLFlBQVU7QUFDVixnQkFBYztBQUNkLFFBQU0sVUFBVSwyQkFBMkIsSUFBSTtBQUMvQyxRQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBYyxpQkFBaUIsS0FBSyxPQUFPLEdBQUssR0FBSyxDQUFHO0FBQ3RFLGNBQVksS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUN4QixtQkFBaUIsTUFBTSxNQUFNLEtBQU0sTUFBTSxJQUFJO0FBRTFDLFlBQVUsU0FBUyxXQUFXO0FBQ2xDLEdBVjJCO0FBWXBCLElBQU0sYUFBYSw2QkFBWTtBQUNyQyxNQUFJLENBQUM7QUFBUztBQUNkLFlBQVU7QUFFVixtQkFBaUIsT0FBTyxNQUFNLEtBQUssTUFBTSxLQUFLO0FBQzlDLGFBQVcsS0FBSyxJQUFJO0FBQ3BCLFFBQU07QUFDTixpQkFBZTtBQUNoQixHQVIwQjtBQVUxQixJQUFNLFlBQVksd0JBQUMsTUFBMkIsV0FBVyxnQkFBc0I7QUFFOUUsUUFBTSxPQUFzQyxZQUFZLElBQUk7QUFFekQsUUFBTSxjQUFjLE1BQU0sUUFBUSxJQUFJO0FBRXRDLGdCQUFjO0FBRWQsTUFBSSxDQUFDLGVBQWUsU0FBUyxHQUFHO0FBQzVCLFVBQU0sQ0FBQ0MsSUFBR0MsSUFBR0MsRUFBQyxJQUFjLGdCQUFnQixLQUFLLEtBQUs7QUFDdEQ7QUFBQSxNQUNJO0FBQUEsUUFDSSxHQUFHRjtBQUFBLFFBQ0gsR0FBR0M7QUFBQSxRQUNILEdBQUdDLEtBQUk7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFDQTtBQUFBLEVBQ0o7QUFHQSxNQUFJLFdBQVc7QUFBc0IsZUFBVztBQUVoRCxNQUFJLGFBQWE7QUFDYixVQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsSUFBYyxpQkFBaUIsS0FBSyxLQUFLLENBQUMsR0FBRyxHQUFLLEdBQUssQ0FBRztBQUUzRSxVQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsSUFBYyxpQkFBaUIsS0FBSyxLQUFLLENBQUMsR0FBRyxHQUFLLEdBQUssQ0FBRztBQUczRSxRQUFJLEtBQUssS0FBSyxNQUFNO0FBQ3BCLFFBQUksS0FBSyxLQUFLLE1BQU07QUFDcEIsUUFBSSxLQUFLLEtBQUssTUFBTTtBQUFBLEVBQ3hCLE9BQU87QUFDSCxRQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBYyxpQkFBaUIsS0FBSyxNQUFNLEdBQUssR0FBSyxDQUFHO0FBQUEsRUFDdkU7QUFFSDtBQUFBLElBQ0M7QUFBQSxNQUNDO0FBQUEsTUFDQTtBQUFBLE1BQ0EsR0FBRyxJQUFJO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxFQUNEO0FBRUQsR0E5Q2tCO0FBZ0RsQix3REFBcUMsQ0FBQyxNQUFNLE9BQU87QUFDL0MsaUJBQWUsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUM3QixLQUFHLENBQUM7QUFDUixDQUFDO0FBSUQsOERBQXdDLENBQUMsTUFBZ0IsT0FBaUI7QUFDekUsVUFBUSxNQUFNO0FBQUEsSUFDUCxLQUFLO0FBQ0QsZ0JBQVUsU0FBUyx1QkFBdUI7QUFDMUM7QUFBQSxJQUNKLEtBQUs7QUFDRCxnQkFBVSxNQUFNO0FBQ2hCO0FBQUEsSUFDSixLQUFLO0FBQ0QsZ0JBQVUsT0FBTztBQUNqQjtBQUFBLElBQ0osS0FBSztBQUNELGdCQUFVLE1BQU07QUFDaEI7QUFBQSxJQUNKLEtBQUs7QUFDRCxnQkFBVSxPQUFPO0FBQ2pCLHFCQUFlO0FBQ2Y7QUFBQSxFQUNYO0FBQ0EsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELHdEQUFxQyxDQUFDLE1BQU0sT0FBTztBQUNsRCxNQUFJLFNBQVMsUUFBUTtBQUVkLFVBQU0sVUFBVSxnQkFBZ0IsVUFBVSwwQkFBMEI7QUFFMUUsVUFBTSxjQUFzQixjQUFjO0FBQzFDLGtCQUFjLGVBQWUsVUFBVSxVQUFVO0FBQUEsRUFDbEQsV0FBVyxTQUFTLE1BQU07QUFDekIsVUFBTSxjQUFzQixjQUFjO0FBQzFDLGtCQUFjLGVBQWUsTUFBTSxNQUFNO0FBQUEsRUFDMUM7QUFFQSxnQkFBYztBQUNkLGlCQUFlO0FBQ2YsS0FBRyxDQUFDO0FBQ0wsQ0FBQzs7O0FDNU9ELElBQU8sZUFBUTtBQUFBLEVBQ1g7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0o7OztBQ2ZBLElBQU8sZUFBUTtBQUFBLEVBQ1g7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0o7OztBQ3JCQSxJQUFPLG9CQUFRO0FBQUEsRUFDWDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0o7OztBQ2JBLElBQU8sZ0JBQVE7QUFBQSxFQUNYO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKOzs7QUNETyxTQUFTLGVBQWUsUUFBZ0I7QUFDM0MsUUFBTUMsVUFBUyxRQUFRO0FBQ3ZCLFFBQU0sU0FBU0EsUUFBTyxPQUFPO0FBRTdCLFNBQU8sT0FBTyxVQUFVLENBQUMsVUFBa0IsV0FBVyxLQUFLLE1BQU0sTUFBTTtBQUMzRTtBQUxnQjtBQU9ULFNBQVMsYUFBYSxXQUE4QjtBQUN2RCxTQUFPO0FBQUEsSUFDSCxPQUFPLGdCQUFnQixTQUFTO0FBQUEsSUFDaEMsV0FBVyx5QkFBeUIsU0FBUztBQUFBLEVBQ2pEO0FBQ0o7QUFMZ0I7QUFNaEIsUUFBUSxtQkFBbUIsWUFBWTtBQUVoQyxTQUFTLGlCQUFpQixXQUFtQjtBQUVoRCxRQUFNLFNBQVMsSUFBSSxZQUFZLEVBQUU7QUFDakMsU0FBTyxRQUFRLGFBQWEsc0JBQXNCLFdBQVcsSUFBSSxZQUFZLE1BQU0sQ0FBQztBQUVwRixRQUFNLEVBQUUsR0FBRyxZQUFZLEdBQUcsYUFBYSxHQUFHLFlBQVksR0FBRyxXQUFXLEdBQUcsWUFBWSxJQUFJLFdBQVcsSUFBSSxVQUFVLElBQUksSUFBSSxZQUFZLE1BQU07QUFDMUksUUFBTSxFQUFFLEdBQUcsVUFBVSxHQUFHLFNBQVMsR0FBRyxTQUFTLElBQUksSUFBSSxhQUFhLFFBQVEsRUFBRTtBQVc1RSxTQUFPO0FBQUEsSUFDSDtBQUFBO0FBQUEsSUFDQTtBQUFBO0FBQUEsSUFDQTtBQUFBLElBRUE7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBRUE7QUFBQTtBQUFBLElBRUE7QUFBQSxJQUNBO0FBQUE7QUFBQSxJQUVBLFdBQVcsUUFBUSxTQUFTO0FBQUEsRUFDaEM7QUFDSjtBQWpDZ0I7QUFrQ2hCLFFBQVEsbUJBQW1CLGdCQUFnQjtBQUVwQyxTQUFTLGVBQWUsV0FBbUI7QUFDOUMsTUFBSSxTQUE0QixDQUFDO0FBQ2pDLE1BQUksV0FBeUIsQ0FBQztBQUU5QixXQUFTLElBQUksR0FBRyxJQUFJLGFBQWMsUUFBUSxLQUFLO0FBQzNDLFVBQU0sVUFBVSxhQUFjLENBQUM7QUFDL0IsV0FBTyxPQUFPLElBQUksd0JBQXdCLENBQUM7QUFFM0MsUUFBSSxZQUFZLFlBQVk7QUFDeEIsZUFBUyxPQUFPLElBQUk7QUFBQSxRQUNoQixJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxjQUFjLGVBQWUsU0FBUztBQUFBLE1BQzFDO0FBQUEsSUFDSixPQUFPO0FBQ0gsWUFBTSxDQUFDLEdBQUcsY0FBYyxZQUFZLFlBQVksYUFBYSxjQUFjLElBQUksc0JBQXNCLFdBQVcsQ0FBQztBQUNqSCxlQUFTLE9BQU8sSUFBSTtBQUFBLFFBQ2hCLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGNBQWMsaUJBQWlCLE1BQU0sS0FBSztBQUFBLFFBQzFDO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsU0FBTyxDQUFDLFVBQVUsTUFBTTtBQUM1QjtBQTdCZ0I7QUE4QmhCLFFBQVEscUJBQXFCLGNBQWM7QUFFcEMsU0FBUyxpQkFBaUIsV0FBbUI7QUFDaEQsUUFBTSxXQUFXLGVBQWUsU0FBUztBQUV6QyxNQUFJLGFBQWEsV0FBVyxrQkFBa0IsS0FBSyxhQUFhLFdBQVcsa0JBQWtCO0FBQUc7QUFFaEcsTUFBSSxhQUFhLENBQUM7QUFDbEIsV0FBUyxJQUFJLEdBQUcsSUFBSSxhQUFjLFFBQVEsS0FBSztBQUMzQyxVQUFNLFVBQVUsYUFBYyxDQUFDO0FBQy9CLGVBQVcsT0FBTyxJQUFJO0FBQUEsTUFDbEIsSUFBSTtBQUFBLE1BQ0osT0FBTztBQUFBLE1BQ1AsT0FBTyxrQkFBa0IsV0FBVyxDQUFDO0FBQUEsSUFDekM7QUFBQSxFQUNKO0FBRUEsU0FBTztBQUNYO0FBaEJnQjtBQWlCaEIsUUFBUSx1QkFBdUIsZ0JBQWdCO0FBRXhDLFNBQVMsYUFBYSxXQUFtQjtBQUM1QyxNQUFJLFlBQVksQ0FBQztBQUNqQixNQUFJLGlCQUFpQixDQUFDO0FBRXRCLFdBQVMsSUFBSSxHQUFHLElBQUksa0JBQWUsUUFBUSxLQUFLO0FBQzVDLFVBQU0sT0FBTyxrQkFBZSxDQUFDO0FBQzdCLFVBQU0sVUFBVSx3QkFBd0IsV0FBVyxDQUFDO0FBRXBELG1CQUFlLElBQUksSUFBSTtBQUFBLE1BQ25CLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8saUNBQWlDLFdBQVcsQ0FBQztBQUFBLE1BQ3BELFVBQVUsZ0NBQWdDLFdBQVcsR0FBRyxPQUFPO0FBQUEsSUFDbkU7QUFDQSxjQUFVLElBQUksSUFBSTtBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osT0FBTztBQUFBLE1BQ1AsT0FBTyx3QkFBd0IsV0FBVyxDQUFDO0FBQUEsTUFDM0MsU0FBUyx1QkFBdUIsV0FBVyxDQUFDO0FBQUEsSUFDaEQ7QUFBQSxFQUNKO0FBRUEsU0FBTyxDQUFDLFdBQVcsY0FBYztBQUNyQztBQXZCZ0I7QUF3QmhCLFFBQVEsbUJBQW1CLFlBQVk7QUFFaEMsU0FBUyxTQUFTLFdBQW1CO0FBQ3hDLE1BQUksUUFBUSxDQUFDO0FBQ2IsTUFBSSxhQUFhLENBQUM7QUFFbEIsV0FBUyxJQUFJLEdBQUcsSUFBSSxjQUFXLFFBQVEsS0FBSztBQUN4QyxVQUFNLE9BQU8sY0FBVyxDQUFDO0FBQ3pCLFVBQU0sVUFBVSxnQkFBZ0IsV0FBVyxDQUFDO0FBRTVDLGVBQVcsSUFBSSxJQUFJO0FBQUEsTUFDZixJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxPQUFPLHFDQUFxQyxXQUFXLENBQUM7QUFBQSxNQUN4RCxVQUFVLG9DQUFvQyxXQUFXLEdBQUcsT0FBTztBQUFBLElBQ3ZFO0FBRUEsVUFBTSxJQUFJLElBQUk7QUFBQSxNQUNWLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8sZ0JBQWdCLFdBQVcsQ0FBQztBQUFBLE1BQ25DLFNBQVMsdUJBQXVCLFdBQVcsQ0FBQztBQUFBLElBQ2hEO0FBQUEsRUFDSjtBQUVBLFNBQU8sQ0FBQyxPQUFPLFVBQVU7QUFDN0I7QUF4QmdCO0FBeUJoQixRQUFRLGVBQWUsUUFBUTtBQUUvQixlQUFzQixjQUFjLFdBQXlDO0FBQ3pFLFFBQU0sQ0FBQyxVQUFVLE1BQU0sSUFBSSxlQUFlLFNBQVM7QUFDbkQsUUFBTSxDQUFDLFdBQVcsU0FBUyxJQUFJLGFBQWEsU0FBUztBQUNyRCxRQUFNLENBQUMsT0FBTyxTQUFTLElBQUksU0FBUyxTQUFTO0FBQzdDLFFBQU0sUUFBUSxlQUFlLFNBQVM7QUFDdEMsUUFBTSxVQUFVLGFBQWEsWUFBWSxJQUFJLE1BQU0sV0FBVyxJQUFJLENBQUM7QUFFbkUsU0FBTztBQUFBLElBQ0gsWUFBWSxlQUFlLEtBQUs7QUFBQSxJQUNoQztBQUFBLElBQ0EsV0FBVyxhQUFhLFNBQVM7QUFBQSxJQUNqQyxXQUFXLGlCQUFpQixTQUFTO0FBQUEsSUFDckMsYUFBYTtBQUFBLElBQ2Isa0JBQWtCO0FBQUEsSUFDbEIsZUFBZSxpQkFBaUIsU0FBUztBQUFBLElBQ3pDO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFDSjtBQXJCc0I7QUFzQnRCLFFBQVEsb0JBQW9CLGFBQWE7QUFDekMsaUJBQWlCLHNDQUFzQyxNQUFNO0FBQ3pELFlBQVUsWUFBWSxDQUFDO0FBQ3ZCLFNBQU8sY0FBYyxHQUFHO0FBQzVCLENBQUM7QUFFTSxTQUFTLGNBQWMsV0FBNkI7QUFDdkQsUUFBTSxDQUFDLFNBQVMsSUFBSSxhQUFhLFNBQVM7QUFDMUMsUUFBTSxDQUFDLEtBQUssSUFBSSxTQUFTLFNBQVM7QUFDbEMsUUFBTSxDQUFDLFFBQVEsSUFBSSxlQUFlLFNBQVM7QUFFM0MsU0FBTztBQUFBLElBQ0gsYUFBYTtBQUFBLElBQ2I7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUNKO0FBVmdCO0FBV2hCLFFBQVEsaUJBQWlCLGFBQWE7QUFFL0IsU0FBUyxXQUFXLFdBQTBCO0FBQ2pELFNBQU87QUFBQSxJQUNILFdBQVcsaUJBQWlCLFNBQVM7QUFBQSxJQUNyQyxlQUFlLGlCQUFpQixTQUFTO0FBQUEsSUFDekMsV0FBVyxhQUFhLFNBQVM7QUFBQSxJQUNqQyxPQUFPLGVBQWUsU0FBUztBQUFBLEVBQ25DO0FBQ0o7QUFQZ0I7QUFRaEIsUUFBUSxjQUFjLFVBQVU7QUFFekIsU0FBUyxnQkFBZ0I7QUFDNUIsTUFBSSxjQUFjLENBQUM7QUFFbkIsUUFBTSxDQUFDLGFBQWEsaUJBQWlCLElBQUksUUFBUSxjQUFjLFFBQVE7QUFDdkUsV0FBUyxJQUFJLEdBQUcsSUFBSSxrQkFBa0IsUUFBUSxLQUFLO0FBQy9DLFVBQU0sV0FBVyxrQkFBa0IsQ0FBQztBQUNwQyxVQUFNLE9BQU8sU0FBUztBQUN0QixVQUFNLFFBQVEsU0FBUztBQUN2QixVQUFNLFFBQVEsU0FBUztBQUN2QixnQkFBWSxLQUFLLElBQUk7QUFBQSxNQUNqQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFdBQVc7QUFBQSxNQUNYLE1BQU0sQ0FBQztBQUFBLElBQ1g7QUFFQSxhQUFTLElBQUksR0FBRyxJQUFJLFlBQVksUUFBUSxLQUFLO0FBQ3pDLFlBQU0sVUFBVSxZQUFZLENBQUM7QUFDN0Isa0JBQVksS0FBSyxFQUFFLEtBQUssS0FBSztBQUFBLFFBQ3pCLE9BQU8sUUFBUTtBQUFBLFFBQ2YsVUFBVTtBQUFBLFFBQ1YsU0FBUyxDQUFDO0FBQUEsTUFDZCxDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFFQSxRQUFNLFdBQVcsZUFBZSxHQUFHLE1BQU0sV0FBVyxrQkFBa0I7QUFFdEUsV0FBUyxJQUFJLEdBQUcsSUFBSSxZQUFZLFFBQVEsS0FBSztBQUN6QyxVQUFNLE9BQU8sWUFBWSxDQUFDO0FBQzFCLFVBQU0sRUFBRSxLQUFLLFFBQVEsSUFBSTtBQUN6QixVQUFNLFVBQVUsV0FBVyxHQUFHO0FBQzlCLGFBQVMsSUFBSSxHQUFHLElBQUksUUFBUSxRQUFRLEtBQUs7QUFDckMsWUFBTSxhQUFhLFFBQVEsQ0FBQztBQUM1QixVQUFJLFNBQVM7QUFFYixZQUFNLGNBQWMsV0FBVyxZQUFZO0FBQzNDLFlBQU0saUJBQWlCLFlBQVksU0FBUyxJQUFJO0FBQ2hELFVBQUksa0JBQWtCLFVBQVU7QUFDNUIsaUJBQVM7QUFBQSxNQUNiLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVO0FBQ3JDLGlCQUFTO0FBQUEsTUFDYjtBQUVBLFVBQUksT0FBTztBQUNYLFVBQUksT0FBTztBQUVYLFVBQUksUUFBUTtBQUNSLGVBQU8sV0FBVyxNQUFNO0FBQ3hCLGVBQU8sK0JBQStCLFNBQVMsSUFBSTtBQUFBLE1BQ3ZEO0FBRUEsVUFBSSxTQUFTLE1BQU0sTUFBTTtBQUNyQixjQUFNLGNBQWMsWUFBWSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7QUFFOUMsb0JBQVksS0FBSztBQUFBLFVBQ2IsT0FBTztBQUFBLFVBQ1A7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0w7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUVBLFNBQU87QUFDWDtBQWxFZ0I7QUFvRWhCLGVBQXNCLGFBQWlDO0FBQ25ELFNBQU8sTUFBTSxzQkFBc0IsaUNBQWlDLEtBQUssQ0FBQztBQUM5RTtBQUZzQjtBQUd0QixRQUFRLG9CQUFvQixVQUFVO0FBR3RDLGlCQUFpQixnREFBZ0QsQ0FBQyxTQUFvQztBQUNsRyxNQUFJLEtBQUssU0FBUztBQUFTLFlBQVEsa0JBQWtCLEVBQUUsb0JBQW9CLEtBQUssSUFBSTtBQUNwRixNQUFJLEtBQUssU0FBUztBQUFZLFlBQVEscUJBQXFCLEVBQUUsb0JBQW9CLEtBQUssSUFBSTtBQUM5RixDQUFDOzs7QUNuU0QsSUFBTyxrQkFBUTtBQUFBLEVBQ1gsTUFBTTtBQUFBLElBQ0YsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDSCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsRUFDVDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLE1BQ0YsV0FBVztBQUFBLFFBQ1AsRUFBRSxXQUFXLEdBQUcsU0FBUyxJQUFJLFNBQVMsR0FBRyxJQUFJLFNBQVM7QUFBQSxRQUN0RCxFQUFFLFdBQVcsR0FBRyxTQUFTLElBQUksU0FBUyxHQUFHLElBQUksU0FBUztBQUFBLE1BQzFEO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxNQUNGLFdBQVc7QUFBQSxRQUNQLEVBQUUsV0FBVyxHQUFHLFNBQVMsSUFBSSxTQUFTLEdBQUcsSUFBSSxTQUFTO0FBQUEsUUFDdEQsRUFBRSxXQUFXLElBQUksU0FBUyxJQUFJLFNBQVMsR0FBRyxJQUFJLFVBQVU7QUFBQSxNQUM1RDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDRixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsRUFDVDtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0YsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLEVBQ1Q7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxFQUNUO0FBQ0o7OztBQzlDTyxTQUFTLFlBQVksV0FBbUIsTUFBYztBQUN6RCxNQUFJLENBQUM7QUFBTSxXQUFPLFFBQVEsS0FBSyxrQ0FBa0M7QUFFakUsMkJBQXlCLFdBQVcsS0FBSyxPQUFPLEtBQUssT0FBTyxLQUFLLFNBQVMsQ0FBQztBQUMzRSxTQUFPLGdDQUFnQyxXQUFXLEtBQUssT0FBTyxLQUFLLEtBQUs7QUFDNUU7QUFMZ0I7QUFNaEIsUUFBUSxrQkFBa0IsV0FBVztBQUU5QixTQUFTLFFBQVEsV0FBbUIsTUFBYztBQUNyRCxNQUFJLENBQUM7QUFBTSxXQUFPLFFBQVEsS0FBSyw4QkFBOEI7QUFFN0QsTUFBSSxLQUFLLFVBQVUsSUFBSTtBQUNuQixpQkFBYSxXQUFXLEtBQUssS0FBSztBQUNsQztBQUFBLEVBQ0o7QUFFQSxrQkFBZ0IsV0FBVyxLQUFLLE9BQU8sS0FBSyxPQUFPLEtBQUssU0FBUyxLQUFLO0FBQ3RFLFNBQU8sb0NBQW9DLFdBQVcsS0FBSyxPQUFPLEtBQUssS0FBSztBQUNoRjtBQVZnQjtBQVdoQixRQUFRLGNBQWMsT0FBTztBQUU3QixJQUFNLGNBQWMsV0FBVyxrQkFBa0I7QUFFMUMsSUFBTSxXQUFXLDhCQUFPLFdBQW1CLFNBQWlFO0FBQy9HLE1BQUksUUFBUSxRQUFRLFNBQVMsUUFBVztBQUNwQyxZQUFRLEtBQUssK0JBQStCO0FBQzVDLFdBQU87QUFBQSxFQUNYO0FBRUEsTUFBSTtBQUNKLE1BQUksT0FBTyxTQUFTLFVBQVU7QUFDMUIsWUFBUSxXQUFXLElBQUk7QUFBQSxFQUMzQixXQUFXLE9BQU8sU0FBUyxVQUFVO0FBQ2pDLFlBQVE7QUFBQSxFQUNaLE9BQU87QUFDSCxZQUFRLEtBQUssU0FBUztBQUFBLEVBQzFCO0FBRUEsTUFBSSxVQUFVO0FBQUcsV0FBTztBQUV4QixRQUFNLGFBQWEsS0FBSztBQUV4QixRQUFNLFdBQVcsYUFBYSxTQUFTO0FBQ3ZDLE1BQUksVUFBVTtBQUNWLG1CQUFlLFNBQVMsR0FBRyxLQUFLO0FBQ2hDLGdCQUFZLFlBQVk7QUFDeEIsY0FBVSxTQUFTO0FBQUEsRUFDdkIsT0FBTztBQUNILG1CQUFlLFdBQVcsS0FBSztBQUFBLEVBQ25DO0FBRUEsMkJBQXlCLEtBQUs7QUFDOUIsa0NBQWdDLFNBQVM7QUFFekMsTUFBSSxDQUFDLG1CQUFtQixTQUFTO0FBQUcsV0FBTztBQUUzQyxRQUFNLGNBQWMsT0FBTyxTQUFTLFlBQVksT0FBTyxTQUFTO0FBQ2hFLFFBQU0sZUFBZSxDQUFDLGVBQWUsS0FBSyxhQUFhLE9BQU8sS0FBSyxLQUFLLFNBQVMsRUFBRSxTQUFTO0FBRTVGLE1BQUksY0FBYztBQUNkLGlCQUFhLFdBQVksS0FBNkIsU0FBUztBQUMvRCx3QkFBb0IsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFLLEdBQUssR0FBSyxLQUFLO0FBQUEsRUFDekUsT0FBTztBQUNILFFBQUksVUFBVSxXQUFXLGtCQUFrQixHQUFHO0FBQzFDLDBCQUFvQixXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUssR0FBSyxHQUFLLEtBQUs7QUFBQSxJQUN6RSxXQUFXLFVBQVUsV0FBVyxrQkFBa0IsR0FBRztBQUNqRCwwQkFBb0IsV0FBVyxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksR0FBRyxLQUFLLEtBQUssR0FBRyxLQUFLO0FBQUEsSUFDM0U7QUFBQSxFQUNKO0FBRUEsU0FBTztBQUNYLEdBaER3QjtBQWlEeEIsUUFBUSxlQUFlLFFBQVE7QUFFeEIsU0FBUyxlQUFlLFdBQW1CLE1BQWM7QUFDNUQsTUFBSSxDQUFDO0FBQU0sV0FBTyxRQUFRLEtBQUsscUNBQXFDO0FBRXBFLG9CQUFrQixXQUFXLEtBQUssT0FBTyxLQUFLLFFBQVEsQ0FBRztBQUM3RDtBQUpnQjtBQUtoQixRQUFRLHFCQUFxQixjQUFjO0FBRXBDLFNBQVMsZ0JBQWdCLFdBQW1CLE1BQXNCO0FBQ3JFLE1BQUksQ0FBQztBQUFNLFdBQU8sUUFBUSxLQUFLLHNDQUFzQztBQUdyRSxhQUFXLFdBQVcsTUFBTTtBQUN4QixVQUFNLFFBQVEsS0FBSyxPQUFPO0FBQzFCLG1CQUFlLFdBQVcsS0FBSztBQUFBLEVBQ25DO0FBQ0o7QUFSZ0I7QUFTaEIsUUFBUSxzQkFBc0IsZUFBZTtBQUU3QyxJQUFNLGFBQWEsd0JBQUMsUUFBZ0IsT0FBTyxJQUFJLE1BQU0sR0FBbEM7QUFFWixTQUFTLGFBQWEsV0FBbUIsTUFBTTtBQUNsRCxNQUFJLENBQUM7QUFBTSxXQUFPLFFBQVEsS0FBSyxtQ0FBbUM7QUFFbEUsY0FBWSxhQUFhO0FBRXpCLE1BQUksQ0FBQyxtQkFBbUIsU0FBUztBQUFHO0FBRXBDLFFBQU0sYUFBYSxXQUFXLEtBQUssVUFBVTtBQUM3QyxRQUFNLGNBQWMsV0FBVyxLQUFLLFdBQVc7QUFDL0MsUUFBTSxhQUFhLFdBQVcsS0FBSyxVQUFVO0FBQzdDLFFBQU0sWUFBWSxXQUFXLEtBQUssU0FBUztBQUMzQyxRQUFNLGFBQWEsV0FBVyxLQUFLLFVBQVU7QUFDN0MsUUFBTSxZQUFZLFdBQVcsS0FBSyxTQUFTO0FBQzNDLFFBQU0sV0FBVyxLQUFLLFdBQVc7QUFDakMsUUFBTSxVQUFVLEtBQUssVUFBVTtBQUMvQixRQUFNLFdBQVcsS0FBSyxXQUFXO0FBQ2pDLFFBQU0sWUFBWSxLQUFLO0FBRXZCLHNCQUFvQixXQUFXLFlBQVksYUFBYSxZQUFZLFdBQVcsWUFBWSxXQUFXLFVBQVUsU0FBUyxVQUFVLFNBQVM7QUFDaEo7QUFuQmdCO0FBb0JoQixRQUFRLG1CQUFtQixZQUFZO0FBRWhDLFNBQVMsZUFBZSxXQUFtQixNQUFNO0FBQ3BELE1BQUksQ0FBQztBQUFNLFdBQU8sUUFBUSxLQUFLLHFDQUFxQztBQUVwRSxRQUFNLFFBQVEsS0FBSztBQUVuQixNQUFJLFVBQVUsSUFBSTtBQUNkLG1CQUFlLFdBQVcsS0FBSyxLQUFLO0FBQ3BDO0FBQUEsRUFDSjtBQUVBLFFBQU0sUUFBUSxLQUFLO0FBR25CLE1BQUksS0FBSyxPQUFPLGFBQWE7QUFDekIsbUJBQWUsV0FBVyxLQUFLLFdBQVcsS0FBSyxhQUFhO0FBQzVEO0FBQUEsRUFDSjtBQUVBLG9CQUFrQixXQUFXLE9BQU8sT0FBTyxLQUFLLGlCQUFpQixDQUFHO0FBQ3BFLHlCQUF1QixXQUFXLE9BQU8sR0FBRyxLQUFLLFlBQVksS0FBSyxXQUFXO0FBQ2pGO0FBcEJnQjtBQXFCaEIsUUFBUSxxQkFBcUIsY0FBYztBQUdwQyxTQUFTLGFBQWEsTUFBTTtBQUMvQixRQUFNLFlBQVksS0FBSztBQUN2QixRQUFNLFFBQVEsS0FBSztBQUVuQixhQUFXLENBQUMsWUFBWSxVQUFVLEtBQUssT0FBTyxRQUFRLGVBQWMsR0FBRztBQUNuRSxVQUFNLGFBQWEsV0FBVztBQUM5QixVQUFNLFFBQVEsV0FBVztBQUV6QixRQUFJLGVBQWUsY0FBYyxVQUFVLFVBQVUsR0FBRztBQUNwRCxZQUFNLGtCQUFrQix3QkFBd0IsS0FBSyxLQUFLO0FBQzFELFVBQUksb0JBQW9CLFVBQVUsVUFBVSxFQUFFLE9BQU87QUFDakQsaUNBQXlCLEtBQUssT0FBTyxVQUFVLFVBQVUsRUFBRSxPQUFPLEdBQUcsQ0FBQztBQUFBLE1BQzFFO0FBQUEsSUFDSixXQUFXLGVBQWUsVUFBVSxNQUFNLFVBQVUsR0FBRztBQUNuRCxZQUFNLGNBQWMsZ0JBQWdCLEtBQUssS0FBSztBQUM5QyxVQUFJLGdCQUFnQixNQUFNLFVBQVUsRUFBRSxPQUFPO0FBQ3pDLHdCQUFnQixLQUFLLE9BQU8sTUFBTSxVQUFVLEVBQUUsT0FBTyxHQUFHLEtBQUs7QUFBQSxNQUNqRTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0o7QUFwQmdCO0FBcUJoQixRQUFRLGlCQUFpQixhQUFhO0FBRS9CLFNBQVMsY0FBYyxXQUFtQixNQUFnQjtBQUM3RCxNQUFJLENBQUM7QUFBTSxXQUFPLFFBQVEsS0FBSyxvQ0FBb0M7QUFFbkUsUUFBTSxZQUFZLEtBQUs7QUFDdkIsUUFBTSxRQUFRLEtBQUs7QUFDbkIsUUFBTSxjQUFjLEtBQUs7QUFDekIsYUFBVyxNQUFNLFdBQVc7QUFDeEIsVUFBTSxXQUFXLFVBQVUsRUFBRTtBQUM3QixnQkFBWSxXQUFXLFFBQVE7QUFBQSxFQUNuQztBQUVBLGFBQVcsTUFBTSxPQUFPO0FBQ3BCLFVBQU0sT0FBTyxNQUFNLEVBQUU7QUFDckIsWUFBUSxXQUFXLElBQUk7QUFBQSxFQUMzQjtBQUVBLGFBQVcsTUFBTSxhQUFhO0FBQzFCLFVBQU0sVUFBVSxZQUFZLEVBQUU7QUFDOUIsbUJBQWUsV0FBVyxPQUFPO0FBQUEsRUFDckM7QUFDSjtBQXBCZ0I7QUFxQmhCLFFBQVEsaUJBQWlCLGFBQWE7QUFFL0IsSUFBTSxhQUFhLDhCQUFPLFdBQW1CLFNBQWdCO0FBQ2hFLE1BQUksQ0FBQztBQUFNLFdBQU8sUUFBUSxLQUFLLGlDQUFpQztBQUVoRSxNQUFJLENBQUM7QUFBVyxXQUFPLFFBQVEsS0FBSyxzQ0FBc0M7QUFFMUUsY0FBWSxNQUFNLFNBQVMsV0FBVyxJQUFJO0FBRTFDLFFBQU0sZ0JBQWdCLEtBQUs7QUFDM0IsUUFBTSxZQUFZLEtBQUs7QUFFdkIsTUFBSTtBQUFXLGlCQUFhLFdBQVcsU0FBUztBQUVoRCxNQUFJO0FBQWUsb0JBQWdCLFdBQVcsYUFBYTtBQUMvRCxHQWIwQjtBQWMxQixRQUFRLGNBQWMsVUFBVTtBQUV6QixTQUFTLGNBQWMsV0FBbUIsTUFBaUI7QUFDOUQsTUFBSSxDQUFDO0FBQU0sV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBRW5FLGdDQUE4QixTQUFTO0FBRXZDLFdBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEtBQUs7QUFDbEMsVUFBTSxhQUFhLEtBQUssQ0FBQyxFQUFFO0FBQzNCLFFBQUksWUFBWTtBQUNaLFlBQU0sYUFBYSxXQUFXLFdBQVcsR0FBRztBQUM1QyxZQUFNLFNBQVMsV0FBVztBQUMxQixpQ0FBMkIsV0FBVyxZQUFZLE1BQU07QUFBQSxJQUM1RDtBQUFBLEVBQ0o7QUFDSjtBQWJnQjtBQWNoQixRQUFRLGlCQUFpQixhQUFhO0FBRS9CLFNBQVMsaUJBQWlCLFdBQW1CLE1BQWtCO0FBQ2xFLE1BQUksQ0FBQztBQUFNLFdBQU8sUUFBUSxLQUFLLHVDQUF1QztBQUV0RSxRQUFNLFFBQVEsS0FBSztBQUNuQixRQUFNLFlBQVksS0FBSztBQUN2QixrQkFBZ0IsV0FBVyxPQUFPLFNBQVM7QUFDL0M7QUFOZ0I7QUFPaEIsUUFBUSxvQkFBb0IsZ0JBQWdCO0FBRTVDLGVBQXNCLGlCQUFpQixXQUFtQixNQUFtQjtBQUN6RSxNQUFJLENBQUM7QUFBTSxXQUFPLFFBQVEsS0FBSyx1Q0FBdUM7QUFFdEUsTUFBSSxhQUFhLFNBQVMsR0FBRztBQUN6QiwyQkFBdUIsSUFBSTtBQUMzQjtBQUFBLEVBQ0o7QUFDQSxRQUFNLFdBQVcsV0FBVyxJQUFJO0FBQ2hDLGdCQUFjLFdBQVcsSUFBSTtBQUM3QixtQkFBaUIsV0FBVyxLQUFLLFNBQVM7QUFDMUMsZ0JBQWMsV0FBVyxLQUFLLE9BQU87QUFDekM7QUFYc0I7QUFZdEIsUUFBUSxvQkFBb0IsZ0JBQWdCO0FBRTVDLGVBQXNCLHVCQUF1QixNQUFtQjtBQUM1RCxNQUFJLENBQUM7QUFBTSxXQUFPLFFBQVEsS0FBSyw2Q0FBNkM7QUFFNUUsWUFBVSxZQUFZLENBQUM7QUFDdkIsUUFBTSxXQUFXLEtBQUssSUFBSTtBQUUxQixZQUFVLFlBQVksQ0FBQztBQUN2QixnQkFBYyxLQUFLLElBQUk7QUFDdkIsbUJBQWlCLEtBQUssS0FBSyxTQUFTO0FBQ3BDLGdCQUFjLEtBQUssS0FBSyxPQUFPO0FBQ25DO0FBVnNCO0FBWXRCLFFBQVEsaUJBQWlCLGFBQWE7QUFDdEMsUUFBUSxjQUFjLFVBQVU7QUFDaEMsUUFBUSxpQkFBaUIsYUFBYTtBQUN0QyxRQUFRLG9CQUFvQixnQkFBZ0I7OztBQ2hQNUMsc0RBQW9DLE9BQU8sWUFBeUIsT0FBaUI7QUFDcEYsUUFBTSx1QkFBdUIsVUFBVTtBQUN2QyxZQUFVO0FBQ1YsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELGtEQUFrQyxPQUFPLFlBQXlCLE9BQWlCO0FBQ2xGLGVBQWEsVUFBVTtBQUV2QixRQUFNLE1BQU0sR0FBRztBQUVmLFFBQU0sZ0JBQWdCLE1BQU0sY0FBYyxHQUFHO0FBQzdDLGdCQUFjLFVBQVUsV0FBVyxXQUFXO0FBQzlDLHdCQUFzQix1Q0FBdUMsZUFBZSxHQUFHLGFBQWE7QUFFNUYsZ0JBQWMsS0FBSyxjQUFjLE9BQU87QUFFeEMsWUFBVTtBQUNWLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCwwREFBc0MsT0FBTyxPQUFlLE9BQWlCO0FBQzVFLFFBQU0sT0FBTyxXQUFXLEtBQUs7QUFDN0IsTUFBSSxDQUFDLGlCQUFpQixJQUFJLEtBQUssQ0FBQyxhQUFhLElBQUksR0FBRztBQUNuRCxXQUFPLEdBQUcsQ0FBQztBQUFBLEVBQ1o7QUFHQSxRQUFNLFNBQVMsTUFBTSxTQUFTLEtBQUssSUFBSTtBQUVwQyxZQUFVLE1BQU07QUFFbkIsUUFBTSxhQUFhLE1BQU0sY0FBYyxHQUFHO0FBRTFDLGFBQVcsVUFBVSxDQUFDO0FBRXRCLGdCQUFjLEtBQUssQ0FBQyxDQUFDO0FBRXJCLEtBQUcsVUFBVTtBQUNkLENBQUM7QUFFRCx3RUFBNkMsT0FBTyxHQUFRLE9BQWlCO0FBQzVFLFFBQU0sVUFBVSxjQUFjO0FBRTlCLEtBQUcsT0FBTztBQUNYLENBQUM7QUFFRCwwRUFBOEMsT0FBTyxNQUFjLE9BQWlCO0FBQ25GLGlCQUFlLEtBQUssSUFBSTtBQUN4QixLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsc0VBQTRDLE9BQU8sTUFBYyxPQUFpQjtBQUNqRixpQkFBZSxLQUFLLElBQUk7QUFDeEIsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELGtFQUEwQyxPQUFPLE1BQWMsT0FBaUI7QUFDL0UsZUFBYSxLQUFLLElBQUk7QUFDdEIsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELDhEQUF3QyxPQUFPLE1BQWlCLE9BQWlCO0FBQ2hGLGdCQUFjLEtBQUssSUFBSTtBQUN2QixLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsd0RBQXFDLE9BQU8sTUFBYyxPQUFpQjtBQUMxRSxNQUFJLFVBQVUsUUFBUSxLQUFLLElBQUk7QUFDL0IsS0FBRyxPQUFPO0FBQ1gsQ0FBQztBQUVELGdFQUF5QyxPQUFPLE1BQWMsT0FBaUI7QUFDOUUsTUFBSSxVQUFVLFlBQVksS0FBSyxJQUFJO0FBQ25DLEtBQUcsT0FBTztBQUNYLENBQUM7QUFFRDtBQUFBO0FBQUEsRUFBd0MsT0FBTyxNQUFtQixPQUFpQjtBQUNsRixVQUFNLE9BQU8sZ0JBQWUsS0FBSyxJQUFJO0FBQ3JDLFFBQUksQ0FBQztBQUFNLGFBQU8sR0FBRyxLQUFLO0FBRTFCLFVBQU0sVUFBVSxLQUFLO0FBQ3JCLFVBQU0sT0FBTyxLQUFLO0FBQ2xCLFVBQU0sUUFBUSxLQUFLO0FBQ25CLFVBQU0sT0FBTyxLQUFLO0FBQ2xCLFVBQU0sV0FBVyxLQUFLO0FBRXRCLFFBQUksQ0FBQztBQUFTLGFBQU8sR0FBRyxLQUFLO0FBRTdCLFFBQUksU0FBUyxRQUFRO0FBQ3BCLFlBQU0sY0FBYyxnQkFBZ0IsS0FBSyxLQUFLO0FBRTlDLFVBQUksZ0JBQWdCLElBQUk7QUFDdkIsZ0JBQVEsS0FBSyxPQUFPO0FBQ3BCLFdBQUcsS0FBSztBQUNSO0FBQUEsTUFDRCxPQUFPO0FBQ04scUJBQWEsS0FBSyxLQUFLO0FBQ3ZCLFdBQUcsSUFBSTtBQUNQO0FBQUEsTUFDRDtBQUFBLElBQ0QsV0FBVyxTQUFTLFlBQVk7QUFDL0IsWUFBTSxrQkFBa0Isd0JBQXdCLEtBQUssS0FBSztBQUUxRCxVQUFJLFFBQVEsVUFBVSxLQUFLLEtBQUs7QUFDL0IsV0FBRyxLQUFLO0FBQ1I7QUFBQSxNQUNEO0FBRUEsVUFBSSxRQUFRLFVBQVUsaUJBQWlCO0FBQ3RDLGlDQUF5QixLQUFLLE9BQU8sS0FBSyxLQUFLLEdBQUcsQ0FBQztBQUNuRCxZQUFJLE1BQU07QUFDVCxtQkFBUSxJQUFFLEdBQUcsSUFBSSxLQUFLLFdBQVcsUUFBUSxLQUFLO0FBQzdDLGtCQUFNLFdBQVcsS0FBSyxVQUFVLENBQUM7QUFDakMscUNBQXlCLEtBQUssU0FBUyxXQUFXLFNBQVMsU0FBUyxTQUFTLFNBQVMsQ0FBQztBQUFBLFVBQ3hGO0FBQUEsUUFDRDtBQUNBLFdBQUcsSUFBSTtBQUNQO0FBQUEsTUFDRCxPQUFPO0FBQ04sb0JBQVksS0FBSyxPQUFPO0FBQ3hCLGlCQUFRLElBQUUsR0FBRyxJQUFJLFVBQVUsUUFBUSxLQUFLO0FBQ3ZDLHNCQUFZLEtBQUssU0FBUyxDQUFDLENBQUM7QUFBQSxRQUM3QjtBQUNBLFdBQUcsS0FBSztBQUNSO0FBQUEsTUFDRDtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQ0E7QUFFQSw4REFBd0MsT0FBTyxNQUFXLE9BQWlCO0FBQzFFLFFBQU0sU0FBUyxNQUFNLHNCQUFzQixtQ0FBbUMsSUFBSTtBQUNsRixLQUFHLE1BQU07QUFDVixDQUFDO0FBRUQsa0VBQTBDLE9BQU8sRUFBQyxHQUFFLEdBQUcsT0FBaUI7QUFDdkUsUUFBTSxTQUFTLE1BQU0sc0JBQXNCLHFDQUFxQyxFQUFFO0FBQ2xGLEtBQUcsTUFBTTtBQUNWLENBQUM7QUFFRCxrRUFBMEMsT0FBTyxNQUFXLE9BQWlCO0FBQzVFLFFBQU0sU0FBUyxNQUFNLHNCQUFzQixxQ0FBcUMsSUFBSTtBQUNwRixLQUFHLE1BQU07QUFDVixDQUFDO0FBRUQsNERBQXVDLE9BQU8sUUFBcUIsT0FBaUI7QUFDbkYsZ0JBQWMsS0FBSyxNQUFNO0FBQ3pCLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCxrRUFBMEMsT0FBTyxFQUFFLElBQUksV0FBVyxHQUFHLE9BQWlCO0FBQ3JGLFFBQU0sZUFBZSxlQUFlO0FBQ3BDLFFBQU0sU0FBUyxNQUFNLHNCQUFzQixxQ0FBcUMsY0FBYyxJQUFJLFVBQVU7QUFDNUcsS0FBRyxNQUFNO0FBQ1YsQ0FBQztBQUVELGdFQUF5QyxPQUFPLEVBQUUsR0FBRyxHQUFHLE9BQWlCO0FBQ3hFLFFBQU0sU0FBUyxNQUFNLHNCQUFzQixvQ0FBb0MsRUFBRTtBQUNqRixLQUFHLE1BQU07QUFDVixDQUFDO0FBRUQsOERBQXdDLE9BQU8sTUFBNEMsT0FBaUI7QUFDM0csUUFBTSxTQUFTLE1BQU0sc0JBQXNCLG1DQUFtQyxJQUFJO0FBQ2xGLEtBQUcsTUFBTTtBQUNWLENBQUM7QUFFRCxNQUFNLHFDQUFxQyxDQUFDLFdBQXdCO0FBQ25FLGdCQUFjLEtBQUssTUFBTTtBQUMxQixDQUFDOzs7QUNyTEQsSUFBTSxTQUFTLFFBQVE7QUFDdkIsSUFBSSxTQUFTO0FBQ2IsSUFBSSxPQUFPO0FBRVgsSUFBSSxpQkFBaUI7QUFDckIsSUFBSSxVQUFVO0FBRWQsZUFBc0IsU0FBUyxNQUFpRCxXQUFvQixPQUFPO0FBQ3ZHLE1BQUksU0FBUyxRQUFRLE1BQU07QUFDdkI7QUFBQSxFQUNKO0FBRUEsTUFBSSxZQUFZLFlBQVk7QUFDNUIsUUFBTSxjQUFjLE9BQU8sTUFBTTtBQUVqQyxRQUFNLFdBQVcsT0FBTyxTQUFTO0FBRWpDLFFBQU0sT0FBTyxXQUFXLE9BQU8sS0FBSztBQUVwQyxRQUFNLE9BQU8sWUFBWSxJQUFJO0FBQzdCLE1BQUksQ0FBQztBQUFNO0FBRVgsWUFBVSxTQUFTO0FBRW5CLFFBQU0sZUFBZSxlQUFlO0FBQ3BDLFFBQU0sT0FBTyxLQUFLO0FBQ2xCLE1BQUksWUFBWSxXQUFXLFFBQVEsS0FBSztBQUV4QyxXQUFTLGFBQWEsU0FBUztBQUUvQixNQUFJLFVBQVUsQ0FBQztBQUVmLFFBQU0sZUFBZSxLQUFLLFNBQVMsU0FBUztBQUM1QyxNQUFJO0FBQWMsY0FBVSxNQUFNLHNCQUFnQyxtQ0FBbUMsWUFBWTtBQUVqSCxNQUFJLFNBQVMsQ0FBQztBQUVkLFFBQU0saUJBQWlCLEtBQUssU0FBUyxVQUFVO0FBQy9DLE1BQUksZ0JBQWdCO0FBQ2hCLGFBQVMsT0FBTyxPQUFPO0FBQUEsRUFDM0I7QUFFQSxRQUFNLGVBQWUsS0FBSyxTQUFTLFNBQVM7QUFDNUMsTUFBSTtBQUNKLE1BQUksY0FBYztBQUNkLGNBQVUsY0FBYztBQUFBLEVBQzVCO0FBRUEsUUFBTSxZQUFZLGFBQWEsSUFBSTtBQUVuQyxNQUFJLFVBQVU7QUFDVixVQUFNLFFBQVEsV0FBVyxxQkFBcUIsQ0FBQztBQUMvQyxnQkFBWSxNQUFNLFNBQVMsV0FBVyxLQUFLO0FBQzNDLFlBQVEsdUNBQXVDO0FBQy9DLGNBQVUsSUFBSSxRQUFRLGFBQVc7QUFDN0IsdUJBQWlCO0FBQUEsSUFDckIsQ0FBQztBQUVELGNBQVUsU0FBUztBQUFBLEVBQ3ZCO0FBRUEsUUFBTSxhQUFhLE1BQU0sY0FBYyxTQUFTO0FBRWhELGNBQVk7QUFFWiw2Q0FBd0I7QUFBQSxJQUNwQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0EsS0FBSyxXQUFXO0FBQUEsSUFDaEIsUUFBUSxNQUFNLGNBQWMsUUFBUTtBQUFBLEVBQ3hDLENBQUM7QUFFRCxjQUFZLE1BQU0sSUFBSTtBQUN0QixtREFBMkIsSUFBSTtBQUUvQixTQUFPO0FBRVAsVUFBUSxjQUFjLFFBQVEsSUFBSTtBQUVsQyxNQUFJLFNBQVM7QUFDVCxVQUFNO0FBQ04sWUFBUSx5Q0FBeUM7QUFBQSxFQUNyRDtBQUVBLFlBQVU7QUFDVixtQkFBaUI7QUFDakIsU0FBTztBQUNYO0FBckZzQjtBQXNGdEIsUUFBUSxZQUFZLFFBQVE7QUFFNUIsZ0JBQWdCLGNBQWMsT0FBTyxHQUFHLFNBQW1CO0FBQ3ZELFFBQU0sT0FBTyxLQUFLLENBQUM7QUFDbkIsTUFBSSxDQUFDLE1BQU07QUFDUCxZQUFRLGNBQWMsZ0JBQWdCO0FBQUEsRUFDMUMsT0FBTztBQUNILFVBQU0sT0FBTyxLQUFLLFlBQVk7QUFDOUIsYUFBUyxJQUFJO0FBQUEsRUFDakI7QUFDSixHQUFHLElBQUk7QUFHUCxTQUFTLGFBQWEsTUFBZ0M7QUFDbEQsUUFBTSxFQUFDLFlBQVksS0FBSSxJQUFJLE9BQU8sVUFBVTtBQUU1QyxNQUFJLE9BQU8sU0FBUztBQUFVLFdBQU87QUFFckMsTUFBSSxDQUFDO0FBQVksV0FBTztBQUV4QixNQUFJLFlBQVksRUFBQyxHQUFHLEtBQUk7QUFFeEIsUUFBTSxhQUFhLGNBQWM7QUFHakMsYUFBVyxRQUFRLFlBQVk7QUFDM0IsVUFBTSxTQUFTLFdBQVcsSUFBSTtBQUM5QixlQUFXLFNBQVMsUUFBUTtBQUV4QixVQUFJLE9BQWdCO0FBRXBCLFVBQUksUUFBUSxVQUFVLEtBQUssTUFBTTtBQUM3QixlQUFPLEtBQUssS0FBSyxTQUFTLFdBQVcsSUFBSSxJQUFJO0FBQUEsTUFDakQ7QUFFQSxVQUFJLFFBQVEsV0FBVyxLQUFLLE9BQU87QUFDL0IsZUFBTyxLQUFLLE1BQU0sU0FBUyxXQUFXLEtBQUssSUFBSTtBQUFBLE1BQ25EO0FBRUEsVUFBSSxDQUFDLE1BQU07QUFDUCxjQUFNLGlCQUFpQixPQUFPLEtBQUs7QUFDbkMsb0JBQVksT0FBTyxPQUFPLENBQUMsR0FBRyxXQUFXLGdCQUFnQjtBQUFBLFVBQ3ZELFdBQVcsT0FBTyxPQUFPLENBQUMsR0FBRyxVQUFVLFdBQVcsZUFBZSxTQUFTO0FBQUEsUUFDNUUsQ0FBQztBQUFBLE1BQ0w7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUVBLFNBQU87QUFHWDtBQXRDUztBQXdDRixTQUFTLFlBQVk7QUFDeEIsZUFBYSxLQUFLLE1BQU07QUFFeEIsYUFBVztBQUNYLGNBQVksT0FBTyxLQUFLO0FBQ3hCLG1EQUEyQixLQUFLO0FBR2hDLFVBQVEsY0FBYyxRQUFRLEtBQUs7QUFFbkMsTUFBSSxnQkFBZ0I7QUFDaEIsbUJBQWU7QUFBQSxFQUNuQjtBQUNBLFNBQU87QUFDWDtBQWRnQjs7O0FDdEpULFNBQVMsV0FBVztBQUN2QixRQUFNLHlDQUF5QyxPQUFPLFlBQXlCQyxTQUFnQjtBQUMzRixVQUFNLGlCQUFpQkEsTUFBSyxVQUFVO0FBQUEsRUFDMUMsQ0FBQztBQUVELFFBQU0sMENBQTBDLE1BQU07QUFDbEQsWUFBUSxjQUFjLGdCQUFnQjtBQUFBLEVBQzFDLENBQUM7QUFFRCxRQUFNLHFDQUFxQyxNQUFNO0FBQzdDLGFBQVMsRUFBRSxNQUFNLFdBQVcsUUFBUSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQUEsRUFDdEQsQ0FBQztBQUNMO0FBWmdCOzs7QUNBVCxTQUFTLFlBQVk7QUFDeEIsTUFBSSxhQUFhO0FBRWpCLEtBQUcsNEJBQTRCLE1BQU07QUFDakMsaUJBQWE7QUFBQSxFQUNqQixDQUFDO0FBRUQsS0FBRyw2QkFBNkIsTUFBTTtBQUNsQyxRQUFHO0FBQ0MsY0FBUSxjQUFjLGdCQUFnQjtBQUFBLEVBQzlDLENBQUM7QUFFRCxRQUFNLHlCQUF5QixPQUFPLFlBQXlCQyxTQUFnQjtBQUMzRSxRQUFJLENBQUMsV0FBVztBQUFPLGlCQUFXLFFBQVEsV0FBVyxrQkFBa0I7QUFDdkUsVUFBTSxpQkFBaUJBLE1BQUssVUFBVTtBQUFBLEVBQzFDLENBQUM7QUFFRCxRQUFNLHVCQUF1QixPQUFPLE9BQVk7QUFDNUMsVUFBTSxjQUFjLE1BQU0sZUFBZTtBQUN6QyxVQUFNLGFBQWEsTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFDN0csT0FBRyxVQUFVO0FBQUEsRUFDakIsQ0FBQztBQUVELFFBQU0sd0JBQXdCLE9BQU8sWUFBeUIsT0FBWTtBQUN0RSxVQUFNLHVCQUF1QixVQUFVO0FBQ3ZDLFFBQUk7QUFBSSxTQUFHO0FBQUEsRUFDZixDQUFDO0FBRUQsUUFBTSw2QkFBNkIsT0FBTyxhQUFrQjtBQUN4RCxZQUFRLGNBQWMsZ0JBQWdCLFFBQVE7QUFBQSxFQUNsRCxDQUFDO0FBQ0w7QUEvQmdCOzs7QUNDaEIsU0FBUyxjQUFjLE1BQWMsSUFBUztBQUMxQyxLQUFHLHNDQUFzQyxNQUFNLENBQUMsVUFBZTtBQUMzRCxVQUFNLEVBQUU7QUFBQSxFQUNaLENBQUM7QUFDTDtBQUpTO0FBTUYsU0FBUyxpQkFBaUI7QUFDN0IsZ0JBQWMsNEJBQTRCLE1BQU07QUFDNUMsWUFBUSxjQUFjLGdCQUFnQjtBQUFBLEVBQzFDLENBQUM7QUFFRCxnQkFBYyxlQUFlLENBQUNDLFNBQWdCO0FBQzFDLFdBQU8sZUFBZUEsSUFBRztBQUFBLEVBQzdCLENBQUM7QUFFRCxnQkFBYyxvQkFBb0IsQ0FBQ0EsU0FBZ0I7QUFDL0MsVUFBTSxZQUFpQixhQUFhQSxJQUFHLEVBQUUsQ0FBQztBQUMxQyxRQUFJLGNBQWMsQ0FBQztBQUNuQixlQUFXLE1BQU0sV0FBVztBQUN4QixZQUFNLFdBQVcsVUFBVSxFQUFFO0FBQzdCLGtCQUFZLEtBQUs7QUFBQSxRQUNiLGNBQWMsU0FBUztBQUFBLFFBQ3ZCLFVBQVUsU0FBUztBQUFBLFFBQ25CLFNBQVMsU0FBUztBQUFBLE1BQ3RCLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSixDQUFDO0FBRUQsZ0JBQWMsZUFBZSxDQUFDQSxTQUFnQjtBQUMxQyxVQUFNLFFBQWMsU0FBU0EsSUFBRyxFQUFFLENBQUM7QUFDbkMsUUFBSSxXQUFXLENBQUM7QUFDaEIsZUFBVyxNQUFNLE9BQU87QUFDcEIsWUFBTSxPQUFPLE1BQU0sRUFBRTtBQUNyQixlQUFTLEtBQUs7QUFBQSxRQUNWLFNBQVMsS0FBSztBQUFBLFFBQ2QsVUFBVSxLQUFLO0FBQUEsUUFDZixTQUFTLEtBQUs7QUFBQSxNQUNsQixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0osQ0FBQztBQUVELGdCQUFjLG1CQUFtQixDQUFDQSxTQUFnQjtBQUM5QyxXQUFPLFFBQVEsS0FBSyxvQ0FBb0M7QUFBQSxFQUU1RCxDQUFDO0FBRUQsZ0JBQWMsc0JBQXNCLENBQUNBLFNBQWdCO0FBQ2pELFdBQU8sUUFBUSxLQUFLLG9DQUFvQztBQUFBLEVBRTVELENBQUM7QUFFRCxnQkFBYyxzQkFBc0IsQ0FBQ0EsU0FBZ0I7QUFDakQsV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBQUEsRUFFNUQsQ0FBQztBQUVELGdCQUFjLGNBQWMsQ0FBQ0EsU0FBZ0I7QUFFekMsV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBQUEsRUFDNUQsQ0FBQztBQUVELGdCQUFjLG9CQUFvQixDQUFDQSxTQUFnQjtBQUMvQyxXQUFPLGNBQWNBLElBQUc7QUFBQSxFQUM1QixDQUFDO0FBRUQsZ0JBQWMsa0JBQWtCLENBQUMsVUFBa0I7QUFDL0MsY0FBVSxZQUFZLENBQUM7QUFDdkIsYUFBUyxLQUFLLEtBQUs7QUFBQSxFQUN2QixDQUFDO0FBRUQsZ0JBQWMsbUJBQW1CLENBQUNBLE1BQWEsVUFBZTtBQUUxRCxXQUFPLFFBQVEsS0FBSyxvQ0FBb0M7QUFBQSxFQUM1RCxDQUFDO0FBRUQsZ0JBQWMsc0JBQXNCLE1BQU07QUFDdEMsV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBQUEsRUFDNUQsQ0FBQztBQUVELGdCQUFjLHNCQUFzQixDQUFDQSxNQUFhLFlBQWlCO0FBRS9ELFdBQU8sUUFBUSxLQUFLLG9DQUFvQztBQUFBLEVBQzVELENBQUM7QUFFRCxnQkFBYyxjQUFjLE9BQU9BLE1BQWEsTUFBVyxXQUFnQjtBQUV2RSxXQUFPLFFBQVEsS0FBSyxvQ0FBb0M7QUFBQSxFQUM1RCxDQUFDO0FBRUQsZ0JBQWMsa0JBQWtCLE1BQU07QUFDbEMsV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBQUEsRUFDNUQsQ0FBQztBQUVELGdCQUFjLG1CQUFtQixDQUFDQSxNQUFhLGFBQWtCO0FBQzdELFVBQU0sY0FBYztBQUFBLE1BQ2hCLE9BQU8sU0FBUztBQUFBLE1BQ2hCLE9BQU8sU0FBUztBQUFBLE1BQ2hCLFNBQVMsU0FBUztBQUFBLElBQ3RCO0FBQ0EsZ0JBQVlBLE1BQUssV0FBVztBQUFBLEVBQ2hDLENBQUM7QUFFRCxnQkFBYyxvQkFBb0IsQ0FBQ0EsTUFBYSxlQUFvQjtBQUNoRSxlQUFXLGFBQWEsWUFBWTtBQUNoQyxZQUFNLGNBQWM7QUFBQSxRQUNoQixPQUFPLFVBQVU7QUFBQSxRQUNqQixPQUFPLFVBQVU7QUFBQSxRQUNqQixTQUFTLFVBQVU7QUFBQSxNQUN2QjtBQUNBLGtCQUFZQSxNQUFLLFdBQVc7QUFBQSxJQUNoQztBQUFBLEVBQ0osQ0FBQztBQUVELGdCQUFjLGNBQWMsQ0FBQ0EsTUFBYSxTQUFjO0FBQ3BELFVBQU0sVUFBVTtBQUFBLE1BQ1osT0FBTyxLQUFLO0FBQUEsTUFDWixPQUFPLEtBQUs7QUFBQSxNQUNaLFNBQVMsS0FBSztBQUFBLElBQ2xCO0FBQ0EsWUFBUUEsTUFBSyxPQUFPO0FBQUEsRUFDeEIsQ0FBQztBQUVELGdCQUFjLGVBQWUsQ0FBQ0EsTUFBYSxVQUFlO0FBQ3RELGVBQVcsUUFBUSxPQUFPO0FBQ3RCLFlBQU0sVUFBVTtBQUFBLFFBQ1osT0FBTyxLQUFLO0FBQUEsUUFDWixPQUFPLEtBQUs7QUFBQSxRQUNaLFNBQVMsS0FBSztBQUFBLE1BQ2xCO0FBQ0EsY0FBUUEsTUFBSyxPQUFPO0FBQUEsSUFDeEI7QUFBQSxFQUNKLENBQUM7QUFNRCxnQkFBYyxvQkFBb0IsQ0FBQ0EsTUFBYSxlQUE0QjtBQUN4RSxxQkFBaUJBLE1BQUssVUFBVTtBQUFBLEVBQ3BDLENBQUM7QUFFRCxnQkFBYyxpQkFBaUIsQ0FBQ0EsTUFBYSxZQUF1QjtBQUNoRSxrQkFBY0EsTUFBSyxPQUFPO0FBQUEsRUFDOUIsQ0FBQztBQUNMO0FBMUlnQjs7O0FDSmhCLFFBQVEsMEJBQTBCLE9BQU8sZUFBcUM7QUFDMUUsTUFBSTtBQUVKLE1BQUksQ0FBQyxjQUFjLE9BQU8sZUFBZSxVQUFVO0FBQy9DLFVBQU0sY0FBc0IsY0FBYyxNQUFNLGVBQWU7QUFDL0QseUJBQXFCLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQUEsRUFDbkgsV0FBVyxPQUFPLGVBQWU7QUFBVSx5QkFBcUI7QUFFaEUsTUFBSSxDQUFDLG9CQUFvQjtBQUNyQixVQUFNLElBQUksTUFBTSwyQkFBMkI7QUFBQSxFQUMvQztBQUVBLFFBQU0sdUJBQXVCLGtCQUFrQjtBQUNuRCxDQUFDO0FBRUQsUUFBUSwwQkFBMEIsT0FBTyxnQkFBd0I7QUFDN0QsZ0JBQWMsZUFBZSxNQUFNLGVBQWU7QUFDbEQsU0FBTyxNQUFNLHNCQUFtQyxzQ0FBc0MsV0FBVztBQUNyRyxDQUFDO0FBRUQsUUFBUSxtQkFBbUIsT0FBTyxPQUFrQjtBQUVoRCxRQUFNLFNBQVMsRUFBRSxNQUFNLGNBQWMsUUFBUSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLElBQUk7QUFDakUsTUFBSTtBQUFJLE9BQUc7QUFDZixDQUFDO0FBRUQsR0FBRyxnQ0FBZ0MsQ0FBQyxTQUEwQjtBQUMxRCxXQUFTLElBQUk7QUFDakIsQ0FBQztBQUVELE1BQU0saUNBQWlDLFlBQVk7QUFDL0MsU0FBTyxDQUFDLFVBQVUsS0FBSyxFQUFFLGFBQWEsR0FBRztBQUNyQyxVQUFNLE1BQU0sR0FBRztBQUFBLEVBQ25CO0FBQ0EsUUFBTSxjQUFjLE1BQU0sZUFBZTtBQUN6QyxRQUFNLGFBQWEsTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFDN0csTUFBSSxDQUFDO0FBQVk7QUFDakIsUUFBTSx1QkFBdUIsVUFBVTtBQUMzQyxDQUFDO0FBRUQsTUFBTSxtQkFBbUIsT0FBTyxhQUFxQjtBQUNqRCxNQUFJLGFBQWEsdUJBQXVCLEtBQUssVUFBVSxLQUFLLEVBQUUsYUFBYSxHQUFHO0FBQzFFLFVBQU0sY0FBYyxNQUFNLGVBQWU7QUFDekMsVUFBTSxhQUFhLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQzdHLFFBQUksQ0FBQztBQUFZO0FBQ2pCLFVBQU0sdUJBQXVCLFVBQVU7QUFBQSxFQUMzQztBQUNKLENBQUM7QUFFRCxJQUFNLGdCQUFnQixVQUFVLGFBQWEsTUFBTTtBQUNuRCxJQUFNLE9BQU8sT0FBTyxVQUFVLGdCQUFnQixJQUFJLENBQUM7QUFFbkQsSUFBSSxRQUFRLFFBQVEsUUFBUSxTQUFTLGlCQUFpQixhQUFhLEtBQUssV0FBVztBQUMvRSxXQUFTO0FBQ2IsV0FBVyxRQUFRLFNBQVMsaUJBQWlCLGFBQWEsS0FBSyxXQUFXO0FBQ3RFLFlBQVU7QUFDZDtBQUVBLGVBQWU7QUFFZixnQkFBZ0IsY0FBYyxZQUFZO0FBQ3RDLFFBQU0sY0FBYyxNQUFNLGVBQWU7QUFDekMsUUFBTSxTQUFTLGdCQUFnQixHQUFHO0FBQ2xDLFFBQU0sWUFBWSxtQkFBbUIsR0FBRztBQUN4QyxRQUFNLFFBQVEsYUFBYSxHQUFHO0FBRTlCLFFBQU0sYUFBYSxNQUFNLHNCQUFtQyxzQ0FBc0MsV0FBVztBQUM3RyxNQUFJLENBQUM7QUFBWTtBQUNqQixRQUFNLHVCQUF1QixVQUFVO0FBRXZDLGtCQUFnQixLQUFLLFNBQVM7QUFDOUIsUUFBTSxHQUFJO0FBQ1Ysa0JBQWdCLEtBQUssTUFBTTtBQUMzQixlQUFhLEtBQUssS0FBSztBQUMzQixHQUFHLEtBQUs7IiwKICAibmFtZXMiOiBbImRlbGF5IiwgInBlZCIsICJ4IiwgInkiLCAieiIsICJjb25maWciLCAicGVkIiwgInBlZCIsICJwZWQiXQp9Cg==
