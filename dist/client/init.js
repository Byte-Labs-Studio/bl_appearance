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
function getHair(pedHandle) {
  return {
    color: GetPedHairColor(pedHandle),
    highlight: GetPedHairHighlightColor(pedHandle)
  };
}
__name(getHair, "getHair");
exports("GetHair", getHair);
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
exports("GetHeadBlend", getHeadBlendData);
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
exports("GetHeadOverlay", getHeadOverlay);
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
exports("GetHeadStructure", getHeadStructure);
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
exports("GetDrawables", getDrawables);
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
exports("GetProps", getProps);
async function getAppearance(pedHandle) {
  const [headData, totals] = getHeadOverlay(pedHandle);
  const [drawables, drawTotal] = getDrawables(pedHandle);
  const [props, propTotal] = getProps(pedHandle);
  const model = GetEntityModel(pedHandle);
  const tattoos = await getTattoos();
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
    tattoos
  };
}
__name(getAppearance, "getAppearance");
exports("GetAppearance", getAppearance);
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
async function getTattoos() {
  return await triggerServerCallback("bl_appearance:server:getTattoos") || [];
}
__name(getTattoos, "getTattoos");
exports("GetTattoos", getTattoos);
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
exports("SetDrawable", setDrawable);
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
exports("SetProp", setProp);
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
exports("SetModel", setModel);
function setFaceFeature(pedHandle, data) {
  if (!data)
    return console.warn("No data provided for setFaceFeature");
  SetPedFaceFeature(pedHandle, data.index, data.value + 0);
}
__name(setFaceFeature, "setFaceFeature");
exports("SetFaceFeature", setFaceFeature);
function setFaceFeatures(pedHandle, data) {
  if (!data)
    return console.warn("No data provided for setFaceFeatures");
  for (const feature in data) {
    const value = data[feature];
    setFaceFeature(pedHandle, value);
  }
}
__name(setFaceFeatures, "setFaceFeatures");
exports("SetFaceFeatures", setFaceFeatures);
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
exports("SetHeadBlend", setHeadBlend);
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
exports("SetHeadOverlay", setHeadOverlay);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvcWIudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvZXN4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvY29tcGF0L2lsbGVuaXVtLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvaW5pdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCBwZWQgPSAwXHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlUGVkID0gKHBlZEhhbmRsZTogbnVtYmVyKSA9PiB7XHJcbiAgICBwZWQgPSBwZWRIYW5kbGVcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlYnVnZGF0YSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGEsIChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0sIDIpKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2VuZE5VSUV2ZW50ID0gKGFjdGlvbjogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcclxuICAgIFNlbmROVUlNZXNzYWdlKHtcclxuICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TW9kZWwgPSBhc3luYyAobW9kZWw6IHN0cmluZyB8IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiA9PiB7XHJcbiAgICBsZXQgbW9kZWxIYXNoOiBudW1iZXIgPSB0eXBlb2YgbW9kZWwgPT09ICdudW1iZXInID8gbW9kZWwgOiBHZXRIYXNoS2V5KG1vZGVsKVxyXG5cclxuICAgIGlmICghSXNNb2RlbFZhbGlkKG1vZGVsSGFzaCkgJiYgIUlzTW9kZWxJbkNkaW1hZ2UobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIC8vIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAvLyAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgLy8gICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgLy8gICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgLy8gfSlcclxuXHJcbiAgICAgICAgY29uc29sZS53YXJuKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9ibF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5OiBzdHJpbmcsIC4uLmFyZ3M6IGFueSkgPT4ge1xyXG4gICAgY29uc3QgcmVzb2x2ZSA9IGFjdGl2ZUV2ZW50c1trZXldO1xyXG4gICAgcmV0dXJuIHJlc29sdmUgJiYgcmVzb2x2ZSguLi5hcmdzKTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlclNlcnZlckNhbGxiYWNrPFQgPSB1bmtub3duPihcclxuICAgIGV2ZW50TmFtZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlcclxuKTogUHJvbWlzZTxUPiB8IHZvaWQge1xyXG4gICAgaWYgKCFldmVudFRpbWVyKGV2ZW50TmFtZSwgMCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGtleTogc3RyaW5nO1xyXG5cclxuICAgIGRvIHtcclxuICAgICAgICBrZXkgPSBgJHtldmVudE5hbWV9OiR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDEwMDAwMCArIDEpKX1gO1xyXG4gICAgfSB3aGlsZSAoYWN0aXZlRXZlbnRzW2tleV0pO1xyXG4gICAgZW1pdE5ldChgX2JsX2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvblNlcnZlckNhbGxiYWNrKGV2ZW50TmFtZSwgY2IpIHtcclxuICAgIG9uTmV0KGBfYmxfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlLCBrZXksIC4uLmFyZ3MpID0+IHtcclxuICAgICAgICBsZXQgcmVzcG9uc2U7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBjYiguLi5hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgaGFuZGxpbmcgY2FsbGJhY2sgZXZlbnQgJHtldmVudE5hbWV9YCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBeMyR7ZS5zdGFja31eMGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbWl0TmV0KGBfYmxfY2JfJHtyZXNvdXJjZX1gLCBrZXksIHJlc3BvbnNlKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vL2xvY2FsZVxyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RMb2NhbGUgPSAocmVzb3VyY2VTZXROYW1lOiBzdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNoZWNrUmVzb3VyY2VGaWxlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoUmVxdWVzdFJlc291cmNlRmlsZVNldChyZXNvdXJjZVNldE5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50TGFuID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmNvbmZpZygpLmxvY2FsZVxyXG4gICAgICAgICAgICAgICAgbGV0IGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvJHtjdXJyZW50TGFufS5qc29uYCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsZUZpbGVDb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtjdXJyZW50TGFufS5qc29uIG5vdCBmb3VuZCBpbiBsb2NhbGUsIHBsZWFzZSB2ZXJpZnkhLCB3ZSB1c2VkIGVuZ2xpc2ggZm9yIG5vdyFgKVxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvZW4uanNvbmApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGxvY2FsZUZpbGVDb250ZW50KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2hlY2tSZXNvdXJjZUZpbGUsIDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2hlY2tSZXNvdXJjZUZpbGUoKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbG9jYWxlID0gYXN5bmMgKGlkOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBjb25zdCBsb2NhbGUgPSBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKTtcclxuICAgIGxldCBhcmdJbmRleCA9IDA7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gbG9jYWxlW2lkXS5yZXBsYWNlKC8lcy9nLCAobWF0Y2g6IHN0cmluZykgPT4gYXJnSW5kZXggPCBhcmdzLmxlbmd0aCA/IGFyZ3NbYXJnSW5kZXhdIDogbWF0Y2gpO1xyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgYmxfYnJpZGdlID0gZXhwb3J0cy5ibF9icmlkZ2VcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRQbGF5ZXJEYXRhID0gKCkgPT4ge1xyXG4gICAgcmV0dXJuIGJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRGcmFtZXdvcmtJRCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGlkID0gZ2V0UGxheWVyRGF0YSgpLmNpZFxyXG4gICAgcmV0dXJuIGlkXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRQbGF5ZXJHZW5kZXJNb2RlbCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGdlbmRlciA9IGdldFBsYXllckRhdGEoKS5nZW5kZXJcclxuICAgIHJldHVybiBnZW5kZXIgPT09ICdtYWxlJyA/ICdtcF9tX2ZyZWVtb2RlXzAxJyA6ICdtcF9mX2ZyZWVtb2RlXzAxJ1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRGVsYXkobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICghc3RyLmluY2x1ZGVzKFwiJ1wiKSkgcmV0dXJuIHN0cjtcclxuICAgIHJldHVybiBzdHIucmVwbGFjZSgvJy9nLCBcIlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEpvYkluZm8oKTogeyBuYW1lOiBzdHJpbmcsIGlzQm9zczogYm9vbGVhbiB9IHwgbnVsbCB7XHJcbiAgICBjb25zdCBqb2IgPSBnZXRQbGF5ZXJEYXRhKCkuam9iXHJcbiAgICByZXR1cm4gam9iID8geyBuYW1lOiBqb2IubmFtZSwgaXNCb3NzOiBqb2IuaXNCb3NzIH0gOiBudWxsXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1BlZEZyZWVtb2RlTW9kZWwocGVkOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IG1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkKVxyXG4gICAgcmV0dXJuIG1vZGVsID09PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSB8fCBtb2RlbCA9PT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIilcclxufSAgICIsICJpbXBvcnQgeyBDYW1lcmEsIFZlY3RvcjMsIFRDYW1lcmFCb25lcyB9IGZyb20gJ0B0eXBpbmdzL2NhbWVyYSc7XHJcbmltcG9ydCB7IGRlbGF5LCBwZWQgfSBmcm9tICdAdXRpbHMnO1xyXG5pbXBvcnQgeyBSZWNlaXZlIH0gZnJvbSAnQGV2ZW50cyc7XHJcblxyXG5jb25zdCBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRSA9IDIuMDtcclxuY29uc3QgREVGQVVMVF9NQVhfRElTVEFOQ0UgPSAxLjA7XHJcblxyXG5sZXQgcnVubmluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgY2FtRGlzdGFuY2U6IG51bWJlciA9IDEuODtcclxubGV0IGNhbTogQ2FtZXJhIHwgbnVsbCA9IG51bGw7XHJcbmxldCBhbmdsZVk6IG51bWJlciA9IDAuMDtcclxubGV0IGFuZ2xlWjogbnVtYmVyID0gMC4wO1xyXG5sZXQgdGFyZ2V0Q29vcmRzOiBWZWN0b3IzIHwgbnVsbCA9IG51bGw7XHJcbmxldCBvbGRDYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgY2hhbmdpbmdDYW06IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGxhc3RYOiBudW1iZXIgPSAwO1xyXG5sZXQgY3VycmVudEJvbmU6IGtleW9mIFRDYW1lcmFCb25lcyA9ICdoZWFkJztcclxuXHJcbmNvbnN0IENhbWVyYUJvbmVzOiBUQ2FtZXJhQm9uZXMgPSB7XHJcbiAgICB3aG9sZTogMCxcclxuXHRoZWFkOiAzMTA4NixcclxuXHR0b3JzbzogMjQ4MTgsXHJcblx0bGVnczogWzE2MzM1LCA0NjA3OF0sXHJcbiAgICBzaG9lczogWzE0MjAxLCA1MjMwMV0sXHJcbn07XHJcblxyXG5jb25zdCBjb3MgPSAoZGVncmVlczogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuXHRyZXR1cm4gTWF0aC5jb3MoKGRlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MCk7XHJcbn07XHJcblxyXG5jb25zdCBzaW4gPSAoZGVncmVlczogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuXHRyZXR1cm4gTWF0aC5zaW4oKGRlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MCk7XHJcbn07XHJcblxyXG5jb25zdCBnZXRBbmdsZXMgPSAoKTogbnVtYmVyW10gPT4ge1xyXG5cdGNvbnN0IHggPVxyXG5cdFx0KChjb3MoYW5nbGVaKSAqIGNvcyhhbmdsZVkpICsgY29zKGFuZ2xlWSkgKiBjb3MoYW5nbGVaKSkgLyAyKSAqXHJcblx0XHRjYW1EaXN0YW5jZTtcclxuXHRjb25zdCB5ID1cclxuXHRcdCgoc2luKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSArIGNvcyhhbmdsZVkpICogc2luKGFuZ2xlWikpIC8gMikgKlxyXG5cdFx0Y2FtRGlzdGFuY2U7XHJcblx0Y29uc3QgeiA9IHNpbihhbmdsZVkpICogY2FtRGlzdGFuY2U7XHJcblxyXG5cdHJldHVybiBbeCwgeSwgel07XHJcbn07XHJcblxyXG5jb25zdCBzZXRDYW1Qb3NpdGlvbiA9IChtb3VzZVg/OiBudW1iZXIsIG1vdXNlWT86IG51bWJlcik6IHZvaWQgPT4ge1xyXG5cdGlmICghcnVubmluZyB8fCAhdGFyZ2V0Q29vcmRzIHx8IGNoYW5naW5nQ2FtKSByZXR1cm47XHJcblxyXG5cdG1vdXNlWCA9IG1vdXNlWCA/PyAwLjA7XHJcblx0bW91c2VZID0gbW91c2VZID8/IDAuMDtcclxuXHJcblx0YW5nbGVaIC09IG1vdXNlWDtcclxuXHRhbmdsZVkgKz0gbW91c2VZO1xyXG5cclxuICAgIGNvbnN0IGlzSGVhZE9yV2hvbGUgPSBjdXJyZW50Qm9uZSA9PT0gJ3dob2xlJyB8fCBjdXJyZW50Qm9uZSA9PT0gJ2hlYWQnO1xyXG4gICAgY29uc3QgbWF4QW5nbGUgPSBpc0hlYWRPcldob2xlID8gODkuMCA6IDcwLjA7XHJcbiAgICBcclxuICAgIGNvbnN0IGlzU2hvZXMgPSBjdXJyZW50Qm9uZSA9PT0gJ3Nob2VzJztcclxuICAgIGNvbnN0IG1pbkFuZ2xlID0gaXNTaG9lcyA/IDUuMCA6IC0yMC4wO1xyXG5cclxuXHRhbmdsZVkgPSBNYXRoLm1pbihNYXRoLm1heChhbmdsZVksIG1pbkFuZ2xlKSwgbWF4QW5nbGUpO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKTtcclxuXHJcblx0U2V0Q2FtQ29vcmQoXHJcblx0XHRjYW0sXHJcblx0XHR0YXJnZXRDb29yZHMueCArIHgsXHJcblx0XHR0YXJnZXRDb29yZHMueSArIHksXHJcblx0XHR0YXJnZXRDb29yZHMueiArIHpcclxuXHQpO1xyXG5cdFBvaW50Q2FtQXRDb29yZChjYW0sIHRhcmdldENvb3Jkcy54LCB0YXJnZXRDb29yZHMueSwgdGFyZ2V0Q29vcmRzLnopO1xyXG59O1xyXG5cclxuY29uc3QgbW92ZUNhbWVyYSA9IGFzeW5jIChjb29yZHM6IFZlY3RvcjMsIGRpc3RhbmNlPzogbnVtYmVyKSA9PiB7XHJcblx0Y29uc3QgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpICsgOTQ7XHJcblx0ZGlzdGFuY2UgPSBkaXN0YW5jZSA/PyAxLjA7XHJcblxyXG5cdGNoYW5naW5nQ2FtID0gdHJ1ZTtcclxuXHRjYW1EaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG5cdGFuZ2xlWiA9IGhlYWRpbmc7XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpO1xyXG5cclxuXHRjb25zdCBuZXdjYW06IENhbWVyYSA9IENyZWF0ZUNhbVdpdGhQYXJhbXMoXHJcblx0XHQnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLFxyXG5cdFx0Y29vcmRzLnggKyB4LFxyXG5cdFx0Y29vcmRzLnkgKyB5LFxyXG5cdFx0Y29vcmRzLnogKyB6LFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0NzAuMCxcclxuXHRcdGZhbHNlLFxyXG5cdFx0MFxyXG5cdCk7XHJcblxyXG5cdHRhcmdldENvb3JkcyA9IGNvb3JkcztcclxuXHRjaGFuZ2luZ0NhbSA9IGZhbHNlO1xyXG5cdG9sZENhbSA9IGNhbTtcclxuXHRjYW0gPSBuZXdjYW07XHJcblxyXG5cdFBvaW50Q2FtQXRDb29yZChuZXdjYW0sIGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnopO1xyXG5cdFNldENhbUFjdGl2ZVdpdGhJbnRlcnAobmV3Y2FtLCBvbGRDYW0sIDI1MCwgMCwgMCk7XHJcblxyXG5cdGF3YWl0IGRlbGF5KDI1MCk7XHJcblxyXG5cdFNldENhbVVzZVNoYWxsb3dEb2ZNb2RlKG5ld2NhbSwgdHJ1ZSk7XHJcblx0U2V0Q2FtTmVhckRvZihuZXdjYW0sIDAuNCk7XHJcblx0U2V0Q2FtRmFyRG9mKG5ld2NhbSwgMS4yKTtcclxuXHRTZXRDYW1Eb2ZTdHJlbmd0aChuZXdjYW0sIDAuMyk7XHJcblx0dXNlSGlEb2YobmV3Y2FtKTtcclxuXHJcblx0RGVzdHJveUNhbShvbGRDYW0sIHRydWUpO1xyXG59O1xyXG5cclxuY29uc3QgdXNlSGlEb2YgPSAoY3VycmVudGNhbTogQ2FtZXJhKSA9PiB7XHJcblx0aWYgKCEoRG9lc0NhbUV4aXN0KGNhbSkgJiYgY3VycmVudGNhbSA9PSBjYW0pKSByZXR1cm47XHJcblx0U2V0VXNlSGlEb2YoKTtcclxuXHRzZXRUaW1lb3V0KHVzZUhpRG9mLCAwKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdGFydENhbWVyYSA9ICgpID0+IHtcclxuXHRpZiAocnVubmluZykgcmV0dXJuO1xyXG5cdHJ1bm5pbmcgPSB0cnVlO1xyXG5cdGNhbURpc3RhbmNlID0gV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0VcclxuXHRjYW0gPSBDcmVhdGVDYW0oJ0RFRkFVTFRfU0NSSVBURURfQ0FNRVJBJywgdHJ1ZSk7XHJcblx0Y29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCAzMTA4NiwgMC4wLCAwLjAsIDAuMCk7XHJcblx0U2V0Q2FtQ29vcmQoY2FtLCB4LCB5LCB6KTtcclxuXHRSZW5kZXJTY3JpcHRDYW1zKHRydWUsIHRydWUsIDEwMDAsIHRydWUsIHRydWUpO1xyXG5cdC8vIG1vdmVDYW1lcmEoeyB4OiB4LCB5OiB5LCB6OiB6IH0sIGNhbURpc3RhbmNlKTtcclxuICAgIHNldENhbWVyYSgnd2hvbGUnLCBjYW1EaXN0YW5jZSk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc3RvcENhbWVyYSA9ICgpOiB2b2lkID0+IHtcclxuXHRpZiAoIXJ1bm5pbmcpIHJldHVybjtcclxuXHRydW5uaW5nID0gZmFsc2U7XHJcblxyXG5cdFJlbmRlclNjcmlwdENhbXMoZmFsc2UsIHRydWUsIDI1MCwgdHJ1ZSwgZmFsc2UpO1xyXG5cdERlc3Ryb3lDYW0oY2FtLCB0cnVlKTtcclxuXHRjYW0gPSBudWxsO1xyXG5cdHRhcmdldENvb3JkcyA9IG51bGw7XHJcbn07XHJcblxyXG5jb25zdCBzZXRDYW1lcmEgPSAodHlwZT86IGtleW9mIFRDYW1lcmFCb25lcywgZGlzdGFuY2UgPSBjYW1EaXN0YW5jZSk6IHZvaWQgPT4ge1xyXG5cclxuXHRjb25zdCBib25lOiBudW1iZXIgfCBudW1iZXJbXSB8IHVuZGVmaW5lZCA9IENhbWVyYUJvbmVzW3R5cGVdO1xyXG5cclxuICAgIGNvbnN0IGlzQm9uZUFycmF5ID0gQXJyYXkuaXNBcnJheShib25lKVxyXG5cclxuICAgIGN1cnJlbnRCb25lID0gdHlwZTtcclxuXHJcbiAgICBpZiAoIWlzQm9uZUFycmF5ICYmIGJvbmUgPT09IDApIHtcclxuICAgICAgICBjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gR2V0RW50aXR5Q29vcmRzKHBlZCwgZmFsc2UpO1xyXG4gICAgICAgIG1vdmVDYW1lcmEoXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICAgICAgICB5OiB5LFxyXG4gICAgICAgICAgICAgICAgejogeiArIDAuMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGlzdGFuY2VcclxuICAgICAgICApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBpdHMgbm90IHdob2xlIGJvZHksIHRoZW4gd2UgbmVlZCB0byBsaW1pdCB0aGUgZGlzdGFuY2VcclxuICAgIGlmIChkaXN0YW5jZSA+IERFRkFVTFRfTUFYX0RJU1RBTkNFKSBkaXN0YW5jZSA9IERFRkFVTFRfTUFYX0RJU1RBTkNFO1xyXG5cclxuICAgIGlmIChpc0JvbmVBcnJheSkge1xyXG4gICAgICAgIGNvbnN0IFt4MSwgeTEsIHoxXTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZVswXSwgMC4wLCAwLjAsIDAuMClcclxuXHJcbiAgICAgICAgY29uc3QgW3gyLCB5MiwgejJdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCBib25lWzFdLCAwLjAsIDAuMCwgMC4wKVxyXG5cclxuICAgICAgICAvLyBnZXQgdGhlIG1pZGRsZSBvZiB0aGUgdHdvIHBvaW50c1xyXG4gICAgICAgIHZhciB4ID0gKHgxICsgeDIpIC8gMjtcclxuICAgICAgICB2YXIgeSA9ICh5MSArIHkyKSAvIDI7XHJcbiAgICAgICAgdmFyIHogPSAoejEgKyB6MikgLyAyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCBib25lLCAwLjAsIDAuMCwgMC4wKVxyXG4gICAgfVxyXG5cclxuXHRtb3ZlQ2FtZXJhKFxyXG5cdFx0e1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5LFxyXG5cdFx0XHR6OiB6ICsgMC4wLFxyXG5cdFx0fSxcclxuXHRcdGRpc3RhbmNlXHJcblx0KTtcclxuXHJcbn07XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtTW92ZSwgKGRhdGEsIGNiKSA9PiB7XHJcbiAgICBzZXRDYW1Qb3NpdGlvbihkYXRhLngsIGRhdGEueSk7XHJcbiAgICBjYigxKTtcclxufSk7XHJcblxyXG50eXBlIFRTZWN0aW9uID0gJ3dob2xlJyB8ICdoZWFkJyB8ICd0b3JzbycgfCAnbGVncycgfCAnc2hvZXMnO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVNlY3Rpb24sICh0eXBlOiBUU2VjdGlvbiwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnd2hvbGUnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ3dob2xlJywgV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0UpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdoZWFkJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCdoZWFkJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3RvcnNvJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCd0b3JzbycpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdsZWdzJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCdsZWdzJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3Nob2VzJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCdzaG9lcycpO1xyXG4gICAgICAgICAgICBzZXRDYW1Qb3NpdGlvbigpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHR9XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVpvb20sIChkYXRhLCBjYikgPT4ge1xyXG5cdGlmIChkYXRhID09PSAnZG93bicpIHtcclxuXHJcbiAgICAgICAgY29uc3QgbWF4Wm9vbSA9IGN1cnJlbnRCb25lID09PSAnd2hvbGUnID8gV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0UgOiBERUZBVUxUX01BWF9ESVNUQU5DRTtcclxuXHJcblx0XHRjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgKyAwLjA1O1xyXG5cdFx0Y2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA+PSBtYXhab29tID8gbWF4Wm9vbSA6IG5ld0Rpc3RhbmNlO1xyXG5cdH0gZWxzZSBpZiAoZGF0YSA9PT0gJ3VwJykge1xyXG5cdFx0Y29uc3QgbmV3RGlzdGFuY2U6IG51bWJlciA9IGNhbURpc3RhbmNlIC0gMC4wNTtcclxuXHRcdGNhbURpc3RhbmNlID0gbmV3RGlzdGFuY2UgPD0gMC4zID8gMC4zIDogbmV3RGlzdGFuY2U7XHJcblx0fVxyXG5cclxuXHRjYW1EaXN0YW5jZSA9IGNhbURpc3RhbmNlO1xyXG5cdHNldENhbVBvc2l0aW9uKCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiQmxlbWlzaGVzXCIsXG4gICAgXCJGYWNpYWxIYWlyXCIsXG4gICAgXCJFeWVicm93c1wiLFxuICAgIFwiQWdlaW5nXCIsXG4gICAgXCJNYWtldXBcIixcbiAgICBcIkJsdXNoXCIsXG4gICAgXCJDb21wbGV4aW9uXCIsXG4gICAgXCJTdW5EYW1hZ2VcIixcbiAgICBcIkxpcHN0aWNrXCIsXG4gICAgXCJNb2xlc0ZyZWNrbGVzXCIsXG4gICAgXCJDaGVzdEhhaXJcIixcbiAgICBcIkJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkFkZEJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkV5ZUNvbG9yXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJOb3NlX1dpZHRoXCIsXG4gICAgXCJOb3NlX1BlYWtfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTGVuZ2h0XCIsXG4gICAgXCJOb3NlX0JvbmVfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTG93ZXJpbmdcIixcbiAgICBcIk5vc2VfQm9uZV9Ud2lzdFwiLFxuICAgIFwiRXllQnJvd25fSGVpZ2h0XCIsXG4gICAgXCJFeWVCcm93bl9Gb3J3YXJkXCIsXG4gICAgXCJDaGVla3NfQm9uZV9IaWdoXCIsXG4gICAgXCJDaGVla3NfQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hlZWtzX1dpZHRoXCIsXG4gICAgXCJFeWVzX09wZW5uaW5nXCIsXG4gICAgXCJMaXBzX1RoaWNrbmVzc1wiLFxuICAgIFwiSmF3X0JvbmVfV2lkdGhcIixcbiAgICBcIkphd19Cb25lX0JhY2tfTGVuZ2h0XCIsXG4gICAgXCJDaGluX0JvbmVfTG93ZXJpbmdcIixcbiAgICBcIkNoaW5fQm9uZV9MZW5ndGhcIixcbiAgICBcIkNoaW5fQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hpbl9Ib2xlXCIsXG4gICAgXCJOZWNrX1RoaWtuZXNzXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJmYWNlXCIsXG4gICAgXCJtYXNrc1wiLFxuICAgIFwiaGFpclwiLFxuICAgIFwidG9yc29zXCIsXG4gICAgXCJsZWdzXCIsXG4gICAgXCJiYWdzXCIsXG4gICAgXCJzaG9lc1wiLFxuICAgIFwibmVja1wiLFxuICAgIFwic2hpcnRzXCIsXG4gICAgXCJ2ZXN0XCIsXG4gICAgXCJkZWNhbHNcIixcbiAgICBcImphY2tldHNcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImhhdHNcIixcbiAgICBcImdsYXNzZXNcIixcbiAgICBcImVhcnJpbmdzXCIsXG4gICAgXCJtb3V0aFwiLFxuICAgIFwibGhhbmRcIixcbiAgICBcInJoYW5kXCIsXG4gICAgXCJ3YXRjaGVzXCIsXG4gICAgXCJicmFjZWxldHNcIlxuXVxuIiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUSGFpckRhdGEsIFRIZWFkT3ZlcmxheSwgVEhlYWRPdmVybGF5VG90YWwsIFRDbG90aGVzLCBUU2tpbiB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IEhFQURfT1ZFUkxBWVMgZnJvbSBcIkBkYXRhL2hlYWRcIlxyXG5pbXBvcnQgRkFDRV9GRUFUVVJFUyBmcm9tIFwiQGRhdGEvZmFjZVwiXHJcbmltcG9ydCBEUkFXQUJMRV9OQU1FUyBmcm9tIFwiQGRhdGEvZHJhd2FibGVzXCJcclxuaW1wb3J0IFBST1BfTkFNRVMgZnJvbSBcIkBkYXRhL3Byb3BzXCJcclxuaW1wb3J0IHsgcGVkLCBvblNlcnZlckNhbGxiYWNrLCB1cGRhdGVQZWQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayB9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IFRUYXR0b28gfSBmcm9tIFwiQHR5cGluZ3MvdGF0dG9vc1wiXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZE1vZGVsSW5kZXgodGFyZ2V0OiBudW1iZXIpIHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZVxyXG4gICAgY29uc3QgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcblxyXG4gICAgcmV0dXJuIG1vZGVscy5maW5kSW5kZXgoKG1vZGVsOiBzdHJpbmcpID0+IEdldEhhc2hLZXkobW9kZWwpID09PSB0YXJnZXQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIYWlyKHBlZEhhbmRsZTogbnVtYmVyKTogVEhhaXJEYXRhIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29sb3I6IEdldFBlZEhhaXJDb2xvcihwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhpZ2hsaWdodDogR2V0UGVkSGFpckhpZ2hsaWdodENvbG9yKHBlZEhhbmRsZSlcclxuICAgIH1cclxufVxyXG5leHBvcnRzKCdHZXRIYWlyJywgZ2V0SGFpcik7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZEJsZW5kRGF0YShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BlZHIwZm9udG91cmEvZml2ZW0tYXBwZWFyYW5jZS9ibG9iL21haW4vZ2FtZS9zcmMvY2xpZW50L2luZGV4LnRzI0w2N1xyXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKDgwKTtcclxuICAgIGdsb2JhbC5DaXRpemVuLmludm9rZU5hdGl2ZSgnMHgyNzQ2YmQ5ZDg4YzVjNWQwJywgcGVkSGFuZGxlLCBuZXcgVWludDMyQXJyYXkoYnVmZmVyKSk7XHJcblxyXG4gICAgY29uc3QgeyAwOiBzaGFwZUZpcnN0LCAyOiBzaGFwZVNlY29uZCwgNDogc2hhcGVUaGlyZCwgNjogc2tpbkZpcnN0LCA4OiBza2luU2Vjb25kLCAxODogaGFzUGFyZW50LCAxMDogc2tpblRoaXJkIH0gPSBuZXcgVWludDMyQXJyYXkoYnVmZmVyKTtcclxuICAgIGNvbnN0IHsgMDogc2hhcGVNaXgsIDI6IHNraW5NaXgsIDQ6IHRoaXJkTWl4IH0gPSBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlciwgNDgpO1xyXG5cclxuICAgIC8qICAgXHJcbiAgICAgICAgMDogc2hhcGVGaXJzdCxcclxuICAgICAgICAyOiBzaGFwZVNlY29uZCxcclxuICAgICAgICA0OiBzaGFwZVRoaXJkLFxyXG4gICAgICAgIDY6IHNraW5GaXJzdCxcclxuICAgICAgICA4OiBza2luU2Vjb25kLFxyXG4gICAgICAgIDEwOiBza2luVGhpcmQsXHJcbiAgICAgICAgMTg6IGhhc1BhcmVudCxcclxuICAgICovXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNoYXBlRmlyc3QsICAgLy8gZmF0aGVyXHJcbiAgICAgICAgc2hhcGVTZWNvbmQsIC8vIG1vdGhlclxyXG4gICAgICAgIHNoYXBlVGhpcmQsXHJcblxyXG4gICAgICAgIHNraW5GaXJzdCxcclxuICAgICAgICBza2luU2Vjb25kLFxyXG4gICAgICAgIHNraW5UaGlyZCxcclxuXHJcbiAgICAgICAgc2hhcGVNaXgsIC8vIHJlc2VtYmxhbmNlXHJcblxyXG4gICAgICAgIHRoaXJkTWl4LFxyXG4gICAgICAgIHNraW5NaXgsICAgLy8gc2tpbnBlcmNlbnRcclxuXHJcbiAgICAgICAgaGFzUGFyZW50OiBCb29sZWFuKGhhc1BhcmVudCksXHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydHMoJ0dldEhlYWRCbGVuZCcsIGdldEhlYWRCbGVuZERhdGEpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRPdmVybGF5KHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgdG90YWxzOiBUSGVhZE92ZXJsYXlUb3RhbCA9IHt9O1xyXG4gICAgbGV0IGhlYWREYXRhOiBUSGVhZE92ZXJsYXkgPSB7fTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEhFQURfT1ZFUkxBWVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gSEVBRF9PVkVSTEFZU1tpXTtcclxuICAgICAgICB0b3RhbHNbb3ZlcmxheV0gPSBHZXROdW1IZWFkT3ZlcmxheVZhbHVlcyhpKTtcclxuXHJcbiAgICAgICAgaWYgKG92ZXJsYXkgPT09IFwiRXllQ29sb3JcIikge1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5VmFsdWU6IEdldFBlZEV5ZUNvbG9yKHBlZEhhbmRsZSlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBbXywgb3ZlcmxheVZhbHVlLCBjb2xvdXJUeXBlLCBmaXJzdENvbG9yLCBzZWNvbmRDb2xvciwgb3ZlcmxheU9wYWNpdHldID0gR2V0UGVkSGVhZE92ZXJsYXlEYXRhKHBlZEhhbmRsZSwgaSk7XHJcbiAgICAgICAgICAgIGhlYWREYXRhW292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogb3ZlcmxheVZhbHVlID09PSAyNTUgPyAtMSA6IG92ZXJsYXlWYWx1ZSxcclxuICAgICAgICAgICAgICAgIGNvbG91clR5cGU6IGNvbG91clR5cGUsXHJcbiAgICAgICAgICAgICAgICBmaXJzdENvbG9yOiBmaXJzdENvbG9yLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kQ29sb3I6IHNlY29uZENvbG9yLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheU9wYWNpdHk6IG92ZXJsYXlPcGFjaXR5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbaGVhZERhdGEsIHRvdGFsc107XHJcbn1cclxuZXhwb3J0cygnR2V0SGVhZE92ZXJsYXknLCBnZXRIZWFkT3ZlcmxheSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZFN0cnVjdHVyZShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgY29uc3QgcGVkTW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWRIYW5kbGUpXHJcblxyXG4gICAgaWYgKHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSAmJiBwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIikpIHJldHVyblxyXG5cclxuICAgIGxldCBmYWNlU3RydWN0ID0ge31cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRkFDRV9GRUFUVVJFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBGQUNFX0ZFQVRVUkVTW2ldXHJcbiAgICAgICAgZmFjZVN0cnVjdFtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRmFjZUZlYXR1cmUocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFjZVN0cnVjdFxyXG59XHJcbmV4cG9ydHMoJ0dldEhlYWRTdHJ1Y3R1cmUnLCBnZXRIZWFkU3RydWN0dXJlKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXREcmF3YWJsZXMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBkcmF3YWJsZXMgPSB7fVxyXG4gICAgbGV0IHRvdGFsRHJhd2FibGVzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IERSQVdBQkxFX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IERSQVdBQkxFX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxEcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRUZXh0dXJlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtkcmF3YWJsZXMsIHRvdGFsRHJhd2FibGVzXVxyXG59XHJcbmV4cG9ydHMoJ0dldERyYXdhYmxlcycsIGdldERyYXdhYmxlcyk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcHMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBwcm9wcyA9IHt9XHJcbiAgICBsZXQgdG90YWxQcm9wcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBQUk9QX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IFBST1BfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxQcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWRQcm9wRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFByb3BUZXh0dXJlSW5kZXgocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3Byb3BzLCB0b3RhbFByb3BzXVxyXG59XHJcbmV4cG9ydHMoJ0dldFByb3BzJywgZ2V0UHJvcHMpO1xyXG5cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcHBlYXJhbmNlKHBlZEhhbmRsZTogbnVtYmVyKTogUHJvbWlzZTxUQXBwZWFyYW5jZT4ge1xyXG4gICAgY29uc3QgW2hlYWREYXRhLCB0b3RhbHNdID0gZ2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW2RyYXdhYmxlcywgZHJhd1RvdGFsXSA9IGdldERyYXdhYmxlcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbcHJvcHMsIHByb3BUb3RhbF0gPSBnZXRQcm9wcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBtb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IHRhdHRvb3MgPSBhd2FpdCBnZXRUYXR0b29zKClcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1vZGVsSW5kZXg6IGZpbmRNb2RlbEluZGV4KG1vZGVsKSxcclxuICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGVhZEJsZW5kOiBnZXRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGVhZE92ZXJsYXk6IGhlYWREYXRhIGFzIFRIZWFkT3ZlcmxheSxcclxuICAgICAgICBoZWFkT3ZlcmxheVRvdGFsOiB0b3RhbHMgYXMgVEhlYWRPdmVybGF5VG90YWwsXHJcbiAgICAgICAgaGVhZFN0cnVjdHVyZTogZ2V0SGVhZFN0cnVjdHVyZShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgICAgICBkcmF3VG90YWw6IGRyYXdUb3RhbCxcclxuICAgICAgICBwcm9wVG90YWw6IHByb3BUb3RhbCxcclxuICAgICAgICB0YXR0b29zOiB0YXR0b29zXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldEFwcGVhcmFuY2VcIiwgZ2V0QXBwZWFyYW5jZSlcclxub25TZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6Z2V0QXBwZWFyYW5jZScsICgpID0+IHtcclxuICAgIHVwZGF0ZVBlZChQbGF5ZXJQZWRJZCgpKVxyXG4gICAgcmV0dXJuIGdldEFwcGVhcmFuY2UocGVkKVxyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQZWRDbG90aGVzKHBlZEhhbmRsZTogbnVtYmVyKTogVENsb3RoZXMge1xyXG4gICAgY29uc3QgW2RyYXdhYmxlc10gPSBnZXREcmF3YWJsZXMocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW3Byb3BzXSA9IGdldFByb3BzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtoZWFkRGF0YV0gPSBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEgYXMgVEhlYWRPdmVybGF5LFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkQ2xvdGhlc1wiLCBnZXRQZWRDbG90aGVzKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBlZFNraW4ocGVkSGFuZGxlOiBudW1iZXIpOiBUU2tpbiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGhlYWRCbGVuZDogZ2V0SGVhZEJsZW5kRGF0YShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhlYWRTdHJ1Y3R1cmU6IGdldEhlYWRTdHJ1Y3R1cmUocGVkSGFuZGxlKSxcclxuICAgICAgICBoYWlyQ29sb3I6IGdldEhhaXIocGVkSGFuZGxlKSxcclxuICAgICAgICBtb2RlbDogR2V0RW50aXR5TW9kZWwocGVkSGFuZGxlKVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRQZWRTa2luXCIsIGdldFBlZFNraW4pXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGF0dG9vRGF0YSgpIHtcclxuICAgIGxldCB0YXR0b29ab25lcyA9IFtdXHJcblxyXG4gICAgY29uc3QgW1RBVFRPT19MSVNULCBUQVRUT09fQ0FURUdPUklFU10gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UudGF0dG9vcygpXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFRBVFRPT19DQVRFR09SSUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBUQVRUT09fQ0FURUdPUklFU1tpXVxyXG4gICAgICAgIGNvbnN0IHpvbmUgPSBjYXRlZ29yeS56b25lXHJcbiAgICAgICAgY29uc3QgbGFiZWwgPSBjYXRlZ29yeS5sYWJlbFxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gY2F0ZWdvcnkuaW5kZXhcclxuICAgICAgICB0YXR0b29ab25lc1tpbmRleF0gPSB7XHJcbiAgICAgICAgICAgIHpvbmU6IHpvbmUsXHJcbiAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcclxuICAgICAgICAgICAgem9uZUluZGV4OiBpbmRleCxcclxuICAgICAgICAgICAgZGxjczogW11cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgZGxjRGF0YSA9IFRBVFRPT19MSVNUW2pdXHJcbiAgICAgICAgICAgIHRhdHRvb1pvbmVzW2luZGV4XS5kbGNzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGRsY0RhdGEuZGxjLFxyXG4gICAgICAgICAgICAgICAgZGxjSW5kZXg6IGosXHJcbiAgICAgICAgICAgICAgICB0YXR0b29zOiBbXVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0ZlbWFsZSA9IEdldEVudGl0eU1vZGVsKHBlZCkgPT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fTElTVC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBUQVRUT09fTElTVFtpXVxyXG4gICAgICAgIGNvbnN0IHsgZGxjLCB0YXR0b29zIH0gPSBkYXRhXHJcbiAgICAgICAgY29uc3QgZGxjSGFzaCA9IEdldEhhc2hLZXkoZGxjKVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGF0dG9vcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gdGF0dG9vc1tqXVxyXG4gICAgICAgICAgICBsZXQgdGF0dG9vID0gbnVsbFxyXG5cclxuICAgICAgICAgICAgY29uc3QgbG93ZXJUYXR0b28gPSB0YXR0b29EYXRhLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgY29uc3QgaXNGZW1hbGVUYXR0b28gPSBsb3dlclRhdHRvby5pbmNsdWRlcyhcIl9mXCIpXHJcbiAgICAgICAgICAgIGlmIChpc0ZlbWFsZVRhdHRvbyAmJiBpc0ZlbWFsZSkge1xyXG4gICAgICAgICAgICAgICAgdGF0dG9vID0gdGF0dG9vRGF0YVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0ZlbWFsZVRhdHRvbyAmJiAhaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGhhc2ggPSBudWxsXHJcbiAgICAgICAgICAgIGxldCB6b25lID0gLTFcclxuXHJcbiAgICAgICAgICAgIGlmICh0YXR0b28pIHtcclxuICAgICAgICAgICAgICAgIGhhc2ggPSBHZXRIYXNoS2V5KHRhdHRvbylcclxuICAgICAgICAgICAgICAgIHpvbmUgPSBHZXRQZWREZWNvcmF0aW9uWm9uZUZyb21IYXNoZXMoZGxjSGFzaCwgaGFzaClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHpvbmUgIT09IC0xICYmIGhhc2gpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHpvbmVUYXR0b29zID0gdGF0dG9vWm9uZXNbem9uZV0uZGxjc1tpXS50YXR0b29zXHJcblxyXG4gICAgICAgICAgICAgICAgem9uZVRhdHRvb3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRhdHRvbyxcclxuICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvbmU6IHpvbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGxjOiBkbGMsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YXR0b29ab25lc1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VGF0dG9vcygpOiBQcm9taXNlPFRUYXR0b29bXT4ge1xyXG4gICAgcmV0dXJuIGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0VGF0dG9vcycpIHx8IFtdXHJcbn1cclxuZXhwb3J0cygnR2V0VGF0dG9vcycsIGdldFRhdHRvb3MpO1xyXG4vL21pZ3JhdGlvblxyXG5cclxub25TZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6bWlncmF0aW9uOnNldEFwcGVhcmFuY2UnLCAoZGF0YToge3R5cGU6IHN0cmluZywgZGF0YTogYW55fSkgPT4ge1xyXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gJ2ZpdmVtJykgZXhwb3J0c1snZml2ZW0tYXBwZWFyYW5jZSddLnNldFBsYXllckFwcGVhcmFuY2UoZGF0YS5kYXRhKVxyXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gJ2lsbGVuaXVtJykgZXhwb3J0c1snaWxsZW5pdW0tYXBwZWFyYW5jZSddLnNldFBsYXllckFwcGVhcmFuY2UoZGF0YS5kYXRhKVxyXG59KTsiLCAiZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgaGF0czoge1xyXG4gICAgICAgIHR5cGU6IFwicHJvcFwiLFxyXG4gICAgICAgIGluZGV4OiAwLFxyXG4gICAgfSxcclxuICAgIGdsYXNzZXM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgIH0sXHJcbiAgICBtYXNrczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgICAgICBvZmY6IDAsXHJcbiAgICB9LFxyXG4gICAgc2hpcnRzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA4LFxyXG4gICAgICAgIG9mZjogMTUsXHJcbiAgICAgICAgaG9vazoge1xyXG4gICAgICAgICAgICBkcmF3YWJsZXM6IFtcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAzLCB2YXJpYW50OiAxNSwgdGV4dHVyZTogMCwgaWQ6ICd0b3Jzb3MnIH0sXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogOCwgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAnc2hpcnRzJyB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgamFja2V0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMTEsXHJcbiAgICAgICAgb2ZmOiAxNSxcclxuICAgICAgICBob29rOiB7XHJcbiAgICAgICAgICAgIGRyYXdhYmxlczogW1xyXG4gICAgICAgICAgICAgICAgeyBjb21wb25lbnQ6IDMsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ3RvcnNvcycgfSxcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAxMSwgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAnamFja2V0cycgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHZlc3Q6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDksXHJcbiAgICAgICAgb2ZmOiAwLFxyXG4gICAgfSxcclxuICAgIGxlZ3M6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDQsXHJcbiAgICAgICAgb2ZmOiAxOCxcclxuICAgIH0sXHJcbiAgICBzaG9lczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogNixcclxuICAgICAgICBvZmY6IDM0LFxyXG4gICAgfVxyXG59IiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUSGFpckNvbG9yLCBUQ2xvdGhlcywgVFNraW4sIFRWYWx1ZSwgVEhlYWRTdHJ1Y3R1cmUgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiO1xyXG5pbXBvcnQgVE9HR0xFX0lOREVYRVMgZnJvbSBcIkBkYXRhL3RvZ2dsZXNcIlxyXG5pbXBvcnQgeyByZXF1ZXN0TW9kZWwsIHBlZCwgdXBkYXRlUGVkLCBpc1BlZEZyZWVtb2RlTW9kZWx9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IFRUYXR0b28gfSBmcm9tIFwiQHR5cGluZ3MvdGF0dG9vc1wiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldERyYXdhYmxlKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIGlmICghZGF0YSkgcmV0dXJuIGNvbnNvbGUud2FybignTm8gZGF0YSBwcm92aWRlZCBmb3Igc2V0RHJhd2FibGUnKVxyXG5cclxuICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgMClcclxuICAgIHJldHVybiBHZXROdW1iZXJPZlBlZFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSlcclxufVxyXG5leHBvcnRzKCdTZXREcmF3YWJsZScsIHNldERyYXdhYmxlKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQcm9wKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIGlmICghZGF0YSkgcmV0dXJuIGNvbnNvbGUud2FybignTm8gZGF0YSBwcm92aWRlZCBmb3Igc2V0UHJvcCcpXHJcblxyXG4gICAgaWYgKGRhdGEudmFsdWUgPT09IC0xKSB7XHJcbiAgICAgICAgQ2xlYXJQZWRQcm9wKHBlZEhhbmRsZSwgZGF0YS5pbmRleClcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBTZXRQZWRQcm9wSW5kZXgocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlLCBkYXRhLnRleHR1cmUsIGZhbHNlKVxyXG4gICAgcmV0dXJuIEdldE51bWJlck9mUGVkUHJvcFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSlcclxufVxyXG5leHBvcnRzKCdTZXRQcm9wJywgc2V0UHJvcCk7XHJcblxyXG5jb25zdCBkZWZNYWxlSGFzaCA9IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpXHJcblxyXG5leHBvcnQgY29uc3Qgc2V0TW9kZWwgPSBhc3luYyAocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRBcHBlYXJhbmNlIHwgVFNraW4gfCBudW1iZXIgfCBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4gPT4ge1xyXG4gICAgaWYgKGRhdGEgPT0gbnVsbCB8fCBkYXRhID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ05vIGRhdGEgcHJvdmlkZWQgZm9yIHNldE1vZGVsJylcclxuICAgICAgICByZXR1cm4gcGVkSGFuZGxlO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBtb2RlbDogbnVtYmVyO1xyXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIG1vZGVsID0gR2V0SGFzaEtleShkYXRhKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgbW9kZWwgPSBkYXRhO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBtb2RlbCA9IGRhdGEubW9kZWwgfHwgZGVmTWFsZUhhc2g7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1vZGVsID09PSAwKSByZXR1cm4gcGVkSGFuZGxlO1xyXG5cclxuICAgIGF3YWl0IHJlcXVlc3RNb2RlbChtb2RlbCk7XHJcblxyXG4gICAgY29uc3QgaXNQbGF5ZXIgPSBJc1BlZEFQbGF5ZXIocGVkSGFuZGxlKTtcclxuICAgIGlmIChpc1BsYXllcikge1xyXG4gICAgICAgIFNldFBsYXllck1vZGVsKFBsYXllcklkKCksIG1vZGVsKTtcclxuICAgICAgICBwZWRIYW5kbGUgPSBQbGF5ZXJQZWRJZCgpO1xyXG4gICAgICAgIHVwZGF0ZVBlZChwZWRIYW5kbGUpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIFNldFBsYXllck1vZGVsKHBlZEhhbmRsZSwgbW9kZWwpO1xyXG4gICAgfVxyXG5cclxuICAgIFNldE1vZGVsQXNOb0xvbmdlck5lZWRlZChtb2RlbCk7XHJcbiAgICBTZXRQZWREZWZhdWx0Q29tcG9uZW50VmFyaWF0aW9uKHBlZEhhbmRsZSk7XHJcblxyXG4gICAgaWYgKCFpc1BlZEZyZWVtb2RlTW9kZWwocGVkSGFuZGxlKSkgcmV0dXJuIHBlZEhhbmRsZTtcclxuXHJcbiAgICBjb25zdCBpc0p1c3RNb2RlbCA9IHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgZGF0YSA9PT0gJ251bWJlcic7XHJcbiAgICBjb25zdCBoYXNIZWFkQmxlbmQgPSAhaXNKdXN0TW9kZWwgJiYgZGF0YS5oZWFkQmxlbmQgJiYgT2JqZWN0LmtleXMoZGF0YS5oZWFkQmxlbmQpLmxlbmd0aCA+IDA7XHJcblxyXG4gICAgaWYgKGhhc0hlYWRCbGVuZCkge1xyXG4gICAgICAgIHNldEhlYWRCbGVuZChwZWRIYW5kbGUsIChkYXRhIGFzIFRBcHBlYXJhbmNlIHwgVFNraW4pLmhlYWRCbGVuZCk7XHJcbiAgICAgICAgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWRIYW5kbGUsIDAsIDAsIDAsIDAsIDAsIDAsIDAuMCwgMC4wLCAwLjAsIGZhbHNlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKG1vZGVsID09PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSkge1xyXG4gICAgICAgICAgICBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZSwgMCwgMCwgMCwgMCwgMCwgMCwgMC4wLCAwLjAsIDAuMCwgZmFsc2UpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobW9kZWwgPT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpKSB7XHJcbiAgICAgICAgICAgIFNldFBlZEhlYWRCbGVuZERhdGEocGVkSGFuZGxlLCA0NSwgMjEsIDAsIDIwLCAxNSwgMCwgMC4zLCAwLjEsIDAsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBlZEhhbmRsZTtcclxufTtcclxuZXhwb3J0cygnU2V0TW9kZWwnLCBzZXRNb2RlbCk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0RmFjZUZlYXR1cmUocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm4gY29uc29sZS53YXJuKCdObyBkYXRhIHByb3ZpZGVkIGZvciBzZXRGYWNlRmVhdHVyZScpXHJcblxyXG4gICAgU2V0UGVkRmFjZUZlYXR1cmUocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlICsgMC4wKVxyXG59XHJcbmV4cG9ydHMoJ1NldEZhY2VGZWF0dXJlJywgc2V0RmFjZUZlYXR1cmUpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEZhY2VGZWF0dXJlcyhwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVEhlYWRTdHJ1Y3R1cmUpIHtcclxuICAgIGlmICghZGF0YSkgcmV0dXJuIGNvbnNvbGUud2FybignTm8gZGF0YSBwcm92aWRlZCBmb3Igc2V0RmFjZUZlYXR1cmVzJylcclxuICAgICAgICBcclxuXHJcbiAgICBmb3IgKGNvbnN0IGZlYXR1cmUgaW4gZGF0YSkge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gZGF0YVtmZWF0dXJlXVxyXG4gICAgICAgIHNldEZhY2VGZWF0dXJlKHBlZEhhbmRsZSwgdmFsdWUpXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cygnU2V0RmFjZUZlYXR1cmVzJywgc2V0RmFjZUZlYXR1cmVzKTtcclxuXHJcbmNvbnN0IGlzUG9zaXRpdmUgPSAodmFsOiBudW1iZXIpID0+IHZhbCA+PSAwID8gdmFsIDogMFxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEhlYWRCbGVuZChwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm4gY29uc29sZS53YXJuKCdObyBkYXRhIHByb3ZpZGVkIGZvciBzZXRIZWFkQmxlbmQnKVxyXG5cclxuICAgIHBlZEhhbmRsZSA9IHBlZEhhbmRsZSB8fCBwZWRcclxuXHJcbiAgICBpZiAoIWlzUGVkRnJlZW1vZGVNb2RlbChwZWRIYW5kbGUpKSByZXR1cm5cclxuXHJcbiAgICBjb25zdCBzaGFwZUZpcnN0ID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlRmlyc3QpXHJcbiAgICBjb25zdCBzaGFwZVNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZVNlY29uZClcclxuICAgIGNvbnN0IHNoYXBlVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVUaGlyZClcclxuICAgIGNvbnN0IHNraW5GaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5za2luRmlyc3QpXHJcbiAgICBjb25zdCBza2luU2Vjb25kID0gaXNQb3NpdGl2ZShkYXRhLnNraW5TZWNvbmQpXHJcbiAgICBjb25zdCBza2luVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpblRoaXJkKVxyXG4gICAgY29uc3Qgc2hhcGVNaXggPSBkYXRhLnNoYXBlTWl4ICsgMC4wXHJcbiAgICBjb25zdCBza2luTWl4ID0gZGF0YS5za2luTWl4ICsgMC4wXHJcbiAgICBjb25zdCB0aGlyZE1peCA9IGRhdGEudGhpcmRNaXggKyAwLjBcclxuICAgIGNvbnN0IGhhc1BhcmVudCA9IGRhdGEuaGFzUGFyZW50XHJcblxyXG4gICAgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWRIYW5kbGUsIHNoYXBlRmlyc3QsIHNoYXBlU2Vjb25kLCBzaGFwZVRoaXJkLCBza2luRmlyc3QsIHNraW5TZWNvbmQsIHNraW5UaGlyZCwgc2hhcGVNaXgsIHNraW5NaXgsIHRoaXJkTWl4LCBoYXNQYXJlbnQpXHJcbn1cclxuZXhwb3J0cygnU2V0SGVhZEJsZW5kJywgc2V0SGVhZEJsZW5kKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkT3ZlcmxheShwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm4gY29uc29sZS53YXJuKCdObyBkYXRhIHByb3ZpZGVkIGZvciBzZXRIZWFkT3ZlcmxheScpXHJcblxyXG4gICAgY29uc3QgaW5kZXggPSBkYXRhLmluZGV4XHJcblxyXG4gICAgaWYgKGluZGV4ID09PSAxMykge1xyXG4gICAgICAgIFNldFBlZEV5ZUNvbG9yKHBlZEhhbmRsZSwgZGF0YS52YWx1ZSlcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlXHJcblxyXG4gICAgLyogSGFpciBjb2xvciBkb2VzIG5vdCBoYXZlIGFuIGluZGV4LCBvbmx5IGFuIElEIHNvIHdlJ2xsIGNoZWNrIGZvciB0aGF0ICovXHJcbiAgICBpZiAoZGF0YS5pZCA9PT0gJ2hhaXJDb2xvcicpIHtcclxuICAgICAgICBTZXRQZWRIYWlyVGludChwZWRIYW5kbGUsIGRhdGEuaGFpckNvbG9yLCBkYXRhLmhhaXJIaWdobGlnaHQpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIFNldFBlZEhlYWRPdmVybGF5KHBlZEhhbmRsZSwgaW5kZXgsIHZhbHVlLCBkYXRhLm92ZXJsYXlPcGFjaXR5ICsgMC4wKVxyXG4gICAgU2V0UGVkSGVhZE92ZXJsYXlDb2xvcihwZWRIYW5kbGUsIGluZGV4LCAxLCBkYXRhLmZpcnN0Q29sb3IsIGRhdGEuc2Vjb25kQ29sb3IpXHJcbn1cclxuZXhwb3J0cygnU2V0SGVhZE92ZXJsYXknLCBzZXRIZWFkT3ZlcmxheSk7XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0VG9nZ2xlcyhkYXRhKSB7XHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcblxyXG4gICAgZm9yIChjb25zdCBbdG9nZ2xlSXRlbSwgdG9nZ2xlRGF0YV0gb2YgT2JqZWN0LmVudHJpZXMoVE9HR0xFX0lOREVYRVMpKSB7XHJcbiAgICAgICAgY29uc3QgdG9nZ2xlVHlwZSA9IHRvZ2dsZURhdGEudHlwZVxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdG9nZ2xlRGF0YS5pbmRleFxyXG5cclxuICAgICAgICBpZiAodG9nZ2xlVHlwZSA9PT0gXCJkcmF3YWJsZVwiICYmIGRyYXdhYmxlc1t0b2dnbGVJdGVtXSkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudERyYXdhYmxlICE9PSBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHRvZ2dsZVR5cGUgPT09IFwicHJvcFwiICYmIHByb3BzW3RvZ2dsZUl0ZW1dKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UHJvcCAhPT0gcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZFByb3BJbmRleChwZWQsIGluZGV4LCBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgZmFsc2UpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cygnU2V0UGVkQ2xvdGhlcycsIHNldFBlZENsb3RoZXMpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZENsb3RoZXMocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRDbG90aGVzKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVybiBjb25zb2xlLndhcm4oJ05vIGRhdGEgcHJvdmlkZWQgZm9yIHNldFBlZENsb3RoZXMnKVxyXG5cclxuICAgIGNvbnN0IGRyYXdhYmxlcyA9IGRhdGEuZHJhd2FibGVzXHJcbiAgICBjb25zdCBwcm9wcyA9IGRhdGEucHJvcHNcclxuICAgIGNvbnN0IGhlYWRPdmVybGF5ID0gZGF0YS5oZWFkT3ZlcmxheVxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBkcmF3YWJsZXMpIHtcclxuICAgICAgICBjb25zdCBkcmF3YWJsZSA9IGRyYXdhYmxlc1tpZF1cclxuICAgICAgICBzZXREcmF3YWJsZShwZWRIYW5kbGUsIGRyYXdhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgaWQgaW4gcHJvcHMpIHtcclxuICAgICAgICBjb25zdCBwcm9wID0gcHJvcHNbaWRdXHJcbiAgICAgICAgc2V0UHJvcChwZWRIYW5kbGUsIHByb3ApXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBoZWFkT3ZlcmxheSkge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBoZWFkT3ZlcmxheVtpZF1cclxuICAgICAgICBzZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUsIG92ZXJsYXkpXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cygnU2V0UGVkQ2xvdGhlcycsIHNldFBlZENsb3RoZXMpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHNldFBlZFNraW4gPSBhc3luYyAocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRTa2luKSA9PiB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVybiBjb25zb2xlLndhcm4oJ05vIGRhdGEgcHJvdmlkZWQgZm9yIHNldFBlZFNraW4nKVxyXG5cclxuICAgIGlmICghcGVkSGFuZGxlKSByZXR1cm4gY29uc29sZS53YXJuKCdObyBwZWRIYW5kbGUgcHJvdmlkZWQgZm9yIHNldFBlZFNraW4nKVxyXG5cclxuICAgIHBlZEhhbmRsZSA9IGF3YWl0IHNldE1vZGVsKHBlZEhhbmRsZSwgZGF0YSlcclxuXHJcbiAgICBjb25zdCBoZWFkU3RydWN0dXJlID0gZGF0YS5oZWFkU3RydWN0dXJlXHJcbiAgICBjb25zdCBoZWFkQmxlbmQgPSBkYXRhLmhlYWRCbGVuZFxyXG5cclxuICAgIGlmIChoZWFkQmxlbmQpIHNldEhlYWRCbGVuZChwZWRIYW5kbGUsIGhlYWRCbGVuZClcclxuICAgIFxyXG4gICAgaWYgKGhlYWRTdHJ1Y3R1cmUpIHNldEZhY2VGZWF0dXJlcyhwZWRIYW5kbGUsIGhlYWRTdHJ1Y3R1cmUpXHJcbn1cclxuZXhwb3J0cygnU2V0UGVkU2tpbicsIHNldFBlZFNraW4pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZFRhdHRvb3MocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRUYXR0b29bXSkge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm4gY29uc29sZS53YXJuKCdObyBkYXRhIHByb3ZpZGVkIGZvciBzZXRQZWRUYXR0b29zJylcclxuXHJcbiAgICBDbGVhclBlZERlY29yYXRpb25zTGVhdmVTY2FycyhwZWRIYW5kbGUpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IGRhdGFbaV0udGF0dG9vXHJcbiAgICAgICAgaWYgKHRhdHRvb0RhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IEdldEhhc2hLZXkodGF0dG9vRGF0YS5kbGMpXHJcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvbyA9IHRhdHRvb0RhdGEuaGFzaFxyXG4gICAgICAgICAgICBBZGRQZWREZWNvcmF0aW9uRnJvbUhhc2hlcyhwZWRIYW5kbGUsIGNvbGxlY3Rpb24sIHRhdHRvbylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cygnU2V0UGVkVGF0dG9vcycsIHNldFBlZFRhdHRvb3MpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZEhhaXJDb2xvcnMocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRIYWlyQ29sb3IpIHtcclxuICAgIGlmICghZGF0YSkgcmV0dXJuIGNvbnNvbGUud2FybignTm8gZGF0YSBwcm92aWRlZCBmb3Igc2V0UGVkSGFpckNvbG9ycycpXHJcblxyXG4gICAgY29uc3QgY29sb3IgPSBkYXRhLmNvbG9yXHJcbiAgICBjb25zdCBoaWdobGlnaHQgPSBkYXRhLmhpZ2hsaWdodFxyXG4gICAgU2V0UGVkSGFpckNvbG9yKHBlZEhhbmRsZSwgY29sb3IsIGhpZ2hsaWdodClcclxufVxyXG5leHBvcnRzKCdTZXRQZWRIYWlyQ29sb3JzJywgc2V0UGVkSGFpckNvbG9ycyk7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGVkQXBwZWFyYW5jZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVEFwcGVhcmFuY2UpIHtcclxuICAgIGlmICghZGF0YSkgcmV0dXJuIGNvbnNvbGUud2FybignTm8gZGF0YSBwcm92aWRlZCBmb3Igc2V0UGVkQXBwZWFyYW5jZScpXHJcblxyXG4gICAgaWYgKElzUGVkQVBsYXllcihwZWRIYW5kbGUpKSB7XHJcbiAgICAgICAgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShkYXRhKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgYXdhaXQgc2V0UGVkU2tpbihwZWRIYW5kbGUsIGRhdGEpXHJcbiAgICBzZXRQZWRDbG90aGVzKHBlZEhhbmRsZSwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMocGVkSGFuZGxlLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MocGVkSGFuZGxlLCBkYXRhLnRhdHRvb3MpXHJcbn1cclxuZXhwb3J0cygnU2V0UGVkQXBwZWFyYW5jZScsIHNldFBlZEFwcGVhcmFuY2UpO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBsYXllclBlZEFwcGVhcmFuY2UoZGF0YTogVEFwcGVhcmFuY2UpIHtcclxuICAgIGlmICghZGF0YSkgcmV0dXJuIGNvbnNvbGUud2FybignTm8gZGF0YSBwcm92aWRlZCBmb3Igc2V0UGxheWVyUGVkQXBwZWFyYW5jZScpXHJcbiAgICAvLyBTaW5jZSB0aGlzIGZ1bmN0aW9uIGlzIHVzdWFsbHkgY2FsbGVkIGFmdGVyIHNjcmlwdHMgc2V0IHRoZWlyIG93biBtb2RlbCwgd2UgbmVlZCB0byB1cGRhdGUgdGhlIHBlZCBiZWZvcmUgd2Ugc2V0IHRoZSBhcHBlYXJhbmNlXHJcbiAgICB1cGRhdGVQZWQoUGxheWVyUGVkSWQoKSlcclxuICAgIGF3YWl0IHNldFBlZFNraW4ocGVkLCBkYXRhKVxyXG4gICAgLy8gV2UgbmVlZCB0byB1cGRhdGUgdGhlIHBlZCBhZ2FpbiBhZnRlciBzZXR0aW5nIHRoZSBza2luIGJlY2F1c2UgU2V0UGxheWVyTW9kZWwgd2lsbCBzZXQgYSBuZXcgUGxheWVyUGVkSWRcclxuICAgIHVwZGF0ZVBlZChQbGF5ZXJQZWRJZCgpKVxyXG4gICAgc2V0UGVkQ2xvdGhlcyhwZWQsIGRhdGEpXHJcbiAgICBzZXRQZWRIYWlyQ29sb3JzKHBlZCwgZGF0YS5oYWlyQ29sb3IpXHJcbiAgICBzZXRQZWRUYXR0b29zKHBlZCwgZGF0YS50YXR0b29zKVxyXG59XHJcblxyXG5leHBvcnRzKCdTZXRQZWRDbG90aGVzJywgc2V0UGVkQ2xvdGhlcylcclxuZXhwb3J0cygnU2V0UGVkU2tpbicsIHNldFBlZFNraW4pXHJcbmV4cG9ydHMoJ1NldFBlZFRhdHRvb3MnLCBzZXRQZWRUYXR0b29zKVxyXG5leHBvcnRzKCdTZXRQZWRIYWlyQ29sb3JzJywgc2V0UGVkSGFpckNvbG9ycykiLCAiaW1wb3J0IHsgUmVjZWl2ZSB9IGZyb20gJ0BldmVudHMnO1xyXG5pbXBvcnQge1xyXG5cdHJlc2V0VG9nZ2xlcyxcclxuXHRzZXREcmF3YWJsZSxcclxuXHRzZXRGYWNlRmVhdHVyZSxcclxuXHRzZXRIZWFkQmxlbmQsXHJcblx0c2V0SGVhZE92ZXJsYXksXHJcblx0c2V0TW9kZWwsXHJcblx0c2V0UGVkQ2xvdGhlcyxcclxuXHRzZXRQZWRUYXR0b29zLFxyXG5cdHNldFBsYXllclBlZEFwcGVhcmFuY2UsXHJcblx0c2V0UHJvcCxcclxufSBmcm9tICcuL2FwcGVhcmFuY2Uvc2V0dGVycyc7XHJcbmltcG9ydCB7IGNsb3NlTWVudSB9IGZyb20gJy4vbWVudSc7XHJcbmltcG9ydCB7IFRBcHBlYXJhbmNlLCBUVG9nZ2xlRGF0YSwgVFZhbHVlIH0gZnJvbSAnQHR5cGluZ3MvYXBwZWFyYW5jZSc7XHJcbmltcG9ydCB7IGRlbGF5LCBnZXRGcmFtZXdvcmtJRCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrLCBwZWQsIHVwZGF0ZVBlZCB9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldFRhdHRvb0RhdGEgfSBmcm9tICcuL2FwcGVhcmFuY2UvZ2V0dGVycyc7XHJcbmltcG9ydCBUT0dHTEVfSU5ERVhFUyBmcm9tICdAZGF0YS90b2dnbGVzJztcclxuaW1wb3J0IHsgVE91dGZpdERhdGEgfSBmcm9tICdAdHlwaW5ncy9vdXRmaXRzJztcclxuaW1wb3J0IHsgVFRhdHRvbyB9IGZyb20gJ0B0eXBpbmdzL3RhdHRvb3MnO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbmNlbCwgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpO1xyXG5cdGNsb3NlTWVudSgpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zYXZlLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHJlc2V0VG9nZ2xlcyhhcHBlYXJhbmNlKTtcclxuXHJcblx0YXdhaXQgZGVsYXkoMTAwKTtcclxuXHJcblx0Y29uc3QgbmV3QXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkKTtcclxuXHRuZXdBcHBlYXJhbmNlLnRhdHRvb3MgPSBhcHBlYXJhbmNlLnRhdHRvb3MgfHwgbnVsbFxyXG5cdHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUFwcGVhcmFuY2UnLCBnZXRGcmFtZXdvcmtJRCgpLCBuZXdBcHBlYXJhbmNlKTtcclxuXHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIG5ld0FwcGVhcmFuY2UudGF0dG9vcyk7XHJcblxyXG5cdGNsb3NlTWVudSgpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRNb2RlbCwgYXN5bmMgKG1vZGVsOiBzdHJpbmcsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGhhc2ggPSBHZXRIYXNoS2V5KG1vZGVsKTtcclxuXHRpZiAoIUlzTW9kZWxJbkNkaW1hZ2UoaGFzaCkgfHwgIUlzTW9kZWxWYWxpZChoYXNoKSkge1xyXG5cdFx0cmV0dXJuIGNiKDApO1xyXG5cdH1cclxuXHJcblxyXG5cdGNvbnN0IG5ld1BlZCA9IGF3YWl0IHNldE1vZGVsKHBlZCwgaGFzaCk7XHJcblxyXG4gICAgdXBkYXRlUGVkKG5ld1BlZClcclxuXHJcblx0Y29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkKTtcclxuXHJcblx0YXBwZWFyYW5jZS50YXR0b29zID0gW107XHJcblxyXG5cdHNldFBlZFRhdHRvb3MocGVkLCBbXSk7XHJcblxyXG5cdGNiKGFwcGVhcmFuY2UpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5nZXRNb2RlbFRhdHRvb3MsIGFzeW5jIChfOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHRhdHRvb3MgPSBnZXRUYXR0b29EYXRhKCk7XHJcblxyXG5cdGNiKHRhdHRvb3MpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRIZWFkU3RydWN0dXJlLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRGYWNlRmVhdHVyZShwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRIZWFkT3ZlcmxheSwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c2V0SGVhZE92ZXJsYXkocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0SGVhZEJsZW5kLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRIZWFkQmxlbmQocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0VGF0dG9vcywgYXN5bmMgKGRhdGE6IFRUYXR0b29bXSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRQcm9wLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRsZXQgdGV4dHVyZSA9IHNldFByb3AocGVkLCBkYXRhKTtcclxuXHRjYih0ZXh0dXJlKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0RHJhd2FibGUsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGxldCB0ZXh0dXJlID0gc2V0RHJhd2FibGUocGVkLCBkYXRhKTtcclxuXHRjYih0ZXh0dXJlKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUudG9nZ2xlSXRlbSwgYXN5bmMgKGRhdGE6IFRUb2dnbGVEYXRhLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBpdGVtID0gVE9HR0xFX0lOREVYRVNbZGF0YS5pdGVtXTtcclxuXHRpZiAoIWl0ZW0pIHJldHVybiBjYihmYWxzZSk7XHJcblxyXG5cdGNvbnN0IGN1cnJlbnQgPSBkYXRhLmRhdGE7XHJcblx0Y29uc3QgdHlwZSA9IGl0ZW0udHlwZTtcclxuXHRjb25zdCBpbmRleCA9IGl0ZW0uaW5kZXg7XHJcblx0Y29uc3QgaG9vayA9IGl0ZW0uaG9vaztcclxuXHRjb25zdCBob29rRGF0YSA9IGRhdGEuaG9va0RhdGE7XHJcblxyXG5cdGlmICghY3VycmVudCkgcmV0dXJuIGNiKGZhbHNlKTtcclxuXHJcblx0aWYgKHR5cGUgPT09ICdwcm9wJykge1xyXG5cdFx0Y29uc3QgY3VycmVudFByb3AgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleCk7XHJcblxyXG5cdFx0aWYgKGN1cnJlbnRQcm9wID09PSAtMSkge1xyXG5cdFx0XHRzZXRQcm9wKHBlZCwgY3VycmVudCk7XHJcblx0XHRcdGNiKGZhbHNlKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Q2xlYXJQZWRQcm9wKHBlZCwgaW5kZXgpO1xyXG5cdFx0XHRjYih0cnVlKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdH0gZWxzZSBpZiAodHlwZSA9PT0gJ2RyYXdhYmxlJykge1xyXG5cdFx0Y29uc3QgY3VycmVudERyYXdhYmxlID0gR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpbmRleCk7XHJcblxyXG5cdFx0aWYgKGN1cnJlbnQudmFsdWUgPT09IGl0ZW0ub2ZmKSB7XHJcblx0XHRcdGNiKGZhbHNlKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChjdXJyZW50LnZhbHVlID09PSBjdXJyZW50RHJhd2FibGUpIHtcclxuXHRcdFx0U2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaW5kZXgsIGl0ZW0ub2ZmLCAwLCAwKTtcclxuXHRcdFx0aWYgKGhvb2spIHtcclxuXHRcdFx0XHRmb3IobGV0IGk9MDsgaSA8IGhvb2suZHJhd2FibGVzPy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0Y29uc3QgaG9va0l0ZW0gPSBob29rLmRyYXdhYmxlc1tpXTtcclxuXHRcdFx0XHRcdFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGhvb2tJdGVtLmNvbXBvbmVudCwgaG9va0l0ZW0udmFyaWFudCwgaG9va0l0ZW0udGV4dHVyZSwgMCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGNiKHRydWUpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRzZXREcmF3YWJsZShwZWQsIGN1cnJlbnQpO1xyXG5cdFx0XHRmb3IobGV0IGk9MDsgaSA8IGhvb2tEYXRhPy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHNldERyYXdhYmxlKHBlZCwgaG9va0RhdGFbaV0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNiKGZhbHNlKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNhdmVPdXRmaXQsIGFzeW5jIChkYXRhOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZU91dGZpdCcsIGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmRlbGV0ZU91dGZpdCwgYXN5bmMgKHtpZH0sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6ZGVsZXRlT3V0Zml0JywgaWQpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnJlbmFtZU91dGZpdCwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZW5hbWVPdXRmaXQnLCBkYXRhKTtcclxuXHRjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS51c2VPdXRmaXQsIGFzeW5jIChvdXRmaXQ6IFRPdXRmaXREYXRhLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQZWRDbG90aGVzKHBlZCwgb3V0Zml0KTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuaW1wb3J0T3V0Zml0LCBhc3luYyAoeyBpZCwgb3V0Zml0TmFtZSB9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6aW1wb3J0T3V0Zml0JywgZnJhbWV3b3JrZElkLCBpZCwgb3V0Zml0TmFtZSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZmV0Y2hPdXRmaXQsIGFzeW5jICh7IGlkIH0sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6ZmV0Y2hPdXRmaXQnLCBpZCk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuaXRlbU91dGZpdCwgYXN5bmMgKGRhdGE6IHtvdXRmaXQ6IFRPdXRmaXREYXRhLCBsYWJlbDogc3RyaW5nfSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjppdGVtT3V0Zml0JywgZGF0YSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5vbk5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6dXNlT3V0ZmlJdGVtJywgKG91dGZpdDogVE91dGZpdERhdGEpID0+IHtcclxuXHRzZXRQZWRDbG90aGVzKHBlZCwgb3V0Zml0KTtcclxufSkiLCAiaW1wb3J0IHsgZ2V0RnJhbWV3b3JrSUQsIHJlcXVlc3RMb2NhbGUsIHNlbmROVUlFdmVudCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrLCB1cGRhdGVQZWQsIHBlZCwgZ2V0UGxheWVyRGF0YSwgZ2V0Sm9iSW5mbywgZ2V0UGxheWVyR2VuZGVyTW9kZWwgfSBmcm9tIFwiQHV0aWxzXCJcclxuaW1wb3J0IHsgc3RhcnRDYW1lcmEsIHN0b3BDYW1lcmEgfSBmcm9tIFwiLi9jYW1lcmFcIlxyXG5pbXBvcnQgdHlwZSB7IFRBcHBlYXJhbmNlWm9uZSwgVE1lbnVUeXBlcyB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IHsgT3V0Zml0IH0gZnJvbSBcIkB0eXBpbmdzL291dGZpdHNcIlxyXG5pbXBvcnQgeyBTZW5kIH0gZnJvbSBcIkBldmVudHNcIlxyXG5pbXBvcnQgeyBnZXRBcHBlYXJhbmNlLCBnZXRUYXR0b29EYXRhIH0gZnJvbSBcIi4vYXBwZWFyYW5jZS9nZXR0ZXJzXCJcclxuaW1wb3J0IFwiLi9oYW5kbGVyc1wiXHJcbmltcG9ydCB7IHNldE1vZGVsIH0gZnJvbSBcIi4vYXBwZWFyYW5jZS9zZXR0ZXJzXCJcclxuXHJcbmNvbnN0IGNvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZVxyXG5sZXQgYXJtb3VyID0gMFxyXG5sZXQgb3BlbiA9IGZhbHNlXHJcblxyXG5sZXQgcmVzb2x2ZVByb21pc2UgPSBudWxsO1xyXG5sZXQgcHJvbWlzZSA9IG51bGw7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb3Blbk1lbnUoem9uZTogVEFwcGVhcmFuY2Vab25lIHwgVEFwcGVhcmFuY2Vab25lWyd0eXBlJ10sIGNyZWF0aW9uOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgIGlmICh6b25lID09PSBudWxsIHx8IG9wZW4pIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBlZEhhbmRsZSA9IFBsYXllclBlZElkKClcclxuICAgIGNvbnN0IGNvbmZpZ01lbnVzID0gY29uZmlnLm1lbnVzKClcclxuXHJcbiAgICBjb25zdCBpc1N0cmluZyA9IHR5cGVvZiB6b25lID09PSAnc3RyaW5nJ1xyXG5cclxuICAgIGNvbnN0IHR5cGUgPSBpc1N0cmluZyA/IHpvbmUgOiB6b25lLnR5cGVcclxuXHJcbiAgICBjb25zdCBtZW51ID0gY29uZmlnTWVudXNbdHlwZV1cclxuICAgIGlmICghbWVudSkgcmV0dXJuXHJcblxyXG4gICAgdXBkYXRlUGVkKHBlZEhhbmRsZSlcclxuXHJcbiAgICBjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICBjb25zdCB0YWJzID0gbWVudS50YWJzXHJcbiAgICBsZXQgYWxsb3dFeGl0ID0gY3JlYXRpb24gPyBmYWxzZSA6IG1lbnUuYWxsb3dFeGl0XHJcblxyXG4gICAgYXJtb3VyID0gR2V0UGVkQXJtb3VyKHBlZEhhbmRsZSlcclxuXHJcbiAgICBsZXQgb3V0Zml0cyA9IFtdXHJcblxyXG4gICAgY29uc3QgaGFzT3V0Zml0VGFiID0gdGFicy5pbmNsdWRlcygnb3V0Zml0cycpXHJcbiAgICBpZiAoaGFzT3V0Zml0VGFiKSBvdXRmaXRzID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPE91dGZpdFtdPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0T3V0Zml0cycsIGZyYW1ld29ya2RJZCkgYXMgT3V0Zml0W11cclxuXHJcbiAgICBsZXQgbW9kZWxzID0gW11cclxuXHJcbiAgICBjb25zdCBoYXNIZXJpdGFnZVRhYiA9IHRhYnMuaW5jbHVkZXMoJ2hlcml0YWdlJylcclxuICAgIGlmIChoYXNIZXJpdGFnZVRhYikge1xyXG4gICAgICAgIG1vZGVscyA9IGNvbmZpZy5tb2RlbHMoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGhhc1RhdHRvb1RhYiA9IHRhYnMuaW5jbHVkZXMoJ3RhdHRvb3MnKVxyXG4gICAgbGV0IHRhdHRvb3NcclxuICAgIGlmIChoYXNUYXR0b29UYWIpIHtcclxuICAgICAgICB0YXR0b29zID0gZ2V0VGF0dG9vRGF0YSgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYmxhY2tsaXN0ID0gZ2V0QmxhY2tsaXN0KHpvbmUpXHJcblxyXG4gICAgaWYgKGNyZWF0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgbW9kZWwgPSBHZXRIYXNoS2V5KGdldFBsYXllckdlbmRlck1vZGVsKCkpO1xyXG4gICAgICAgIHBlZEhhbmRsZSA9IGF3YWl0IHNldE1vZGVsKHBlZEhhbmRsZSwgbW9kZWwpO1xyXG4gICAgICAgIGVtaXROZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNldHJvdXRpbmdidWNrZXQnKVxyXG4gICAgICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB1cGRhdGVQZWQocGVkSGFuZGxlKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKHBlZEhhbmRsZSlcclxuXHJcbiAgICBzdGFydENhbWVyYSgpXHJcblxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQuZGF0YSwge1xyXG4gICAgICAgIHRhYnMsXHJcbiAgICAgICAgYXBwZWFyYW5jZSxcclxuICAgICAgICBibGFja2xpc3QsXHJcbiAgICAgICAgdGF0dG9vcyxcclxuICAgICAgICBvdXRmaXRzLFxyXG4gICAgICAgIG1vZGVscyxcclxuICAgICAgICBhbGxvd0V4aXQsXHJcbiAgICAgICAgam9iOiBnZXRKb2JJbmZvKCksXHJcbiAgICAgICAgbG9jYWxlOiBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKVxyXG4gICAgfSlcclxuXHJcbiAgICBTZXROdWlGb2N1cyh0cnVlLCB0cnVlKVxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQudmlzaWJsZSwgdHJ1ZSlcclxuXHJcbiAgICBvcGVuID0gdHJ1ZVxyXG5cclxuICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5oaWRlSHVkKHRydWUpXHJcblxyXG4gICAgaWYgKHByb21pc2UpIHtcclxuICAgICAgICBhd2FpdCBwcm9taXNlXHJcbiAgICAgICAgZW1pdE5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6cmVzZXRyb3V0aW5nYnVja2V0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvbWlzZSA9IG51bGw7XHJcbiAgICByZXNvbHZlUHJvbWlzZSA9IG51bGw7XHJcbiAgICByZXR1cm4gdHJ1ZVxyXG59XHJcbmV4cG9ydHMoJ09wZW5NZW51Jywgb3Blbk1lbnUpXHJcblxyXG5SZWdpc3RlckNvbW1hbmQoJ2FwcGVhcmFuY2UnLCBhc3luYyAoXywgYXJnczogc3RyaW5nW10pID0+IHtcclxuICAgIGNvbnN0IHR5cGUgPSBhcmdzWzBdXHJcbiAgICBpZiAoIXR5cGUpIHtcclxuICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3Qgem9uZSA9IHR5cGUudG9Mb3dlckNhc2UoKSBhcyBUTWVudVR5cGVzXHJcbiAgICAgICAgb3Blbk1lbnUoem9uZSlcclxuICAgIH1cclxufSwgdHJ1ZSlcclxuXHJcblxyXG5mdW5jdGlvbiBnZXRCbGFja2xpc3Qoem9uZTogVEFwcGVhcmFuY2Vab25lIHwgc3RyaW5nKSB7XHJcbiAgICBjb25zdCB7Z3JvdXBUeXBlcywgYmFzZX0gPSBjb25maWcuYmxhY2tsaXN0KClcclxuXHJcbiAgICBpZiAodHlwZW9mIHpvbmUgPT09ICdzdHJpbmcnKSByZXR1cm4gYmFzZVxyXG5cclxuICAgIGlmICghZ3JvdXBUeXBlcykgcmV0dXJuIGJhc2VcclxuXHJcbiAgICBsZXQgYmxhY2tsaXN0ID0gey4uLmJhc2V9XHJcblxyXG4gICAgY29uc3QgcGxheWVyRGF0YSA9IGdldFBsYXllckRhdGEoKVxyXG5cclxuXHJcbiAgICBmb3IgKGNvbnN0IHR5cGUgaW4gZ3JvdXBUeXBlcykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwcyA9IGdyb3VwVHlwZXNbdHlwZV1cclxuICAgICAgICBmb3IgKGNvbnN0IGdyb3VwIGluIGdyb3Vwcykge1xyXG5cclxuICAgICAgICAgICAgbGV0IHNraXA6IGJvb2xlYW4gPSBmYWxzZVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ2pvYnMnICYmIHpvbmUuam9icykge1xyXG4gICAgICAgICAgICAgICAgc2tpcCA9IHpvbmUuam9icy5pbmNsdWRlcyhwbGF5ZXJEYXRhLmpvYi5uYW1lKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZSA9PSAnZ2FuZ3MnICYmIHpvbmUuZ2FuZ3MpIHtcclxuICAgICAgICAgICAgICAgIHNraXAgPSB6b25lLmdhbmdzLmluY2x1ZGVzKHBsYXllckRhdGEuZ2FuZy5uYW1lKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNraXApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGdyb3VwQmxhY2tsaXN0ID0gZ3JvdXBzW2dyb3VwXVxyXG4gICAgICAgICAgICAgICAgYmxhY2tsaXN0ID0gT2JqZWN0LmFzc2lnbih7fSwgYmxhY2tsaXN0LCBncm91cEJsYWNrbGlzdCwge1xyXG4gICAgICAgICAgICAgICAgICBkcmF3YWJsZXM6IE9iamVjdC5hc3NpZ24oe30sIGJsYWNrbGlzdC5kcmF3YWJsZXMsIGdyb3VwQmxhY2tsaXN0LmRyYXdhYmxlcylcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGJsYWNrbGlzdFxyXG5cclxuICAgIC8vIHJldHVybiBibGFja2xpc3RcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlTWVudSgpIHtcclxuICAgIFNldFBlZEFybW91cihwZWQsIGFybW91cilcclxuXHJcbiAgICBzdG9wQ2FtZXJhKClcclxuICAgIFNldE51aUZvY3VzKGZhbHNlLCBmYWxzZSlcclxuICAgIHNlbmROVUlFdmVudChTZW5kLnZpc2libGUsIGZhbHNlKVxyXG5cclxuXHJcbiAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuaGlkZUh1ZChmYWxzZSlcclxuXHJcbiAgICBpZiAocmVzb2x2ZVByb21pc2UpIHtcclxuICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xyXG4gICAgfVxyXG4gICAgb3BlbiA9IGZhbHNlXHJcbn1cclxuIiwgIlxuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXG5pbXBvcnQgeyBzZXRQZWRBcHBlYXJhbmNlIH0gZnJvbSBcIi4uL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXG5pbXBvcnQgeyBvcGVuTWVudSB9IGZyb20gXCIuLi9tZW51XCJcblxuZXhwb3J0IGZ1bmN0aW9uIFFCQnJpZGdlKCkge1xuICAgIG9uTmV0KCdxYi1jbG90aGluZzpjbGllbnQ6bG9hZFBsYXllckNsb3RoaW5nJywgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICBhd2FpdCBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcbiAgICB9KVxuXG4gICAgb25OZXQoJ3FiLWNsb3RoZXM6Y2xpZW50OkNyZWF0ZUZpcnN0Q2hhcmFjdGVyJywgKCkgPT4ge1xuICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKClcbiAgICB9KVxuXG4gICAgb25OZXQoJ3FiLWNsb3RoaW5nOmNsaWVudDpvcGVuT3V0Zml0TWVudScsICgpID0+IHtcbiAgICAgICAgb3Blbk1lbnUoeyB0eXBlOiBcIm91dGZpdHNcIiwgY29vcmRzOiBbMCwgMCwgMCwgMF0gfSkgIFxuICAgIH0pXG59IiwgIlxuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXG5pbXBvcnQgeyBzZXRQZWRBcHBlYXJhbmNlLCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlIH0gZnJvbSBcIi4uL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXG5pbXBvcnQgeyBnZXRGcmFtZXdvcmtJRCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSBcIkB1dGlsc1wiXG5cbmV4cG9ydCBmdW5jdGlvbiBFU1hCcmlkZ2UoKSB7XG4gICAgbGV0IGZpcnN0U3Bhd24gPSBmYWxzZVxuXG4gICAgb24oXCJlc3hfc2tpbjpyZXNldEZpcnN0U3Bhd25cIiwgKCkgPT4ge1xuICAgICAgICBmaXJzdFNwYXduID0gdHJ1ZVxuICAgIH0pO1xuXG4gICAgb24oXCJlc3hfc2tpbjpwbGF5ZXJSZWdpc3RlcmVkXCIsICgpID0+IHtcbiAgICAgICAgaWYoZmlyc3RTcGF3bilcbiAgICAgICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24oKVxuICAgIH0pO1xuXG4gICAgb25OZXQoJ3NraW5jaGFuZ2VyOmxvYWRTa2luMicsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgcGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgaWYgKCFhcHBlYXJhbmNlLm1vZGVsKSBhcHBlYXJhbmNlLm1vZGVsID0gR2V0SGFzaEtleShcIm1wX21fZnJlZW1vZGVfMDFcIik7XG4gICAgICAgIGF3YWl0IHNldFBlZEFwcGVhcmFuY2UocGVkLCBhcHBlYXJhbmNlKVxuICAgIH0pO1xuXG4gICAgb25OZXQoJ3NraW5jaGFuZ2VyOmdldFNraW4nLCBhc3luYyAoY2I6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCBmcmFtZXdvcmtJRCA9IGF3YWl0IGdldEZyYW1ld29ya0lEKClcbiAgICAgICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcbiAgICAgICAgY2IoYXBwZWFyYW5jZSlcbiAgICB9KVxuXG4gICAgb25OZXQoJ3NraW5jaGFuZ2VyOmxvYWRTa2luJywgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBjYjogYW55KSA9PiB7XG4gICAgICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSlcbiAgICAgICAgaWYgKGNiKSBjYigpXG4gICAgfSlcblxuICAgIG9uTmV0KCdlc3hfc2tpbjpvcGVuU2F2ZWFibGVNZW51JywgYXN5bmMgKG9uU3VibWl0OiBhbnkpID0+IHtcbiAgICAgICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkluaXRpYWxDcmVhdGlvbihvblN1Ym1pdClcbiAgICB9KVxufSIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCI7XG5pbXBvcnQgeyBnZXRBcHBlYXJhbmNlLCBnZXREcmF3YWJsZXMsIGdldFByb3BzIH0gZnJvbSBcIi4uL2FwcGVhcmFuY2UvZ2V0dGVyc1wiO1xuaW1wb3J0IHsgc2V0RHJhd2FibGUsIHNldE1vZGVsLCBzZXRQZWRBcHBlYXJhbmNlLCBzZXRQZWRUYXR0b29zLCBzZXRQcm9wIH0gZnJvbSBcIi4uL2FwcGVhcmFuY2Uvc2V0dGVyc1wiO1xuaW1wb3J0IHsgVFRhdHRvbyB9IGZyb20gXCJAdHlwaW5ncy90YXR0b29zXCI7XG5pbXBvcnQgeyBwZWQsIHVwZGF0ZVBlZCB9IGZyb20gXCJAdXRpbHNcIjtcblxuZnVuY3Rpb24gZXhwb3J0SGFuZGxlcihuYW1lOiBzdHJpbmcsIGNiOiBhbnkpIHtcbiAgICBvbignX19jZnhfZXhwb3J0X2lsbGVuaXVtLWFwcGVhcmFuY2VfJyArIG5hbWUsIChzZXRDQjogYW55KSA9PiB7XG4gICAgICAgIHNldENCKGNiKTtcbiAgICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaWxsZW5pdW1Db21wYXQoKSB7XG4gICAgZXhwb3J0SGFuZGxlcignc3RhcnRQbGF5ZXJDdXN0b21pemF0aW9uJywgKCkgPT4ge1xuICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKClcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZE1vZGVsJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHJldHVybiBHZXRFbnRpdHlNb2RlbChwZWQpXG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRDb21wb25lbnRzJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGRyYXdhYmxlczogYW55ID0gZ2V0RHJhd2FibGVzKHBlZClbMF07XG4gICAgICAgIGxldCBuZXdkcmF3YWJsZSA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGRyYXdhYmxlcykge1xuICAgICAgICAgICAgY29uc3QgZHJhd2FibGUgPSBkcmF3YWJsZXNbaWRdO1xuICAgICAgICAgICAgbmV3ZHJhd2FibGUucHVzaCh7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50X2lkOiBkcmF3YWJsZS5pbmRleCxcbiAgICAgICAgICAgICAgICBkcmF3YWJsZTogZHJhd2FibGUudmFsdWUsXG4gICAgICAgICAgICAgICAgdGV4dHVyZTogZHJhd2FibGUudGV4dHVyZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkUHJvcHMnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgcHJvcHM6IGFueSA9ICBnZXRQcm9wcyhwZWQpWzBdO1xuICAgICAgICBsZXQgbmV3UHJvcHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpZCBvZiBwcm9wcykge1xuICAgICAgICAgICAgY29uc3QgcHJvcCA9IHByb3BzW2lkXTtcbiAgICAgICAgICAgIG5ld1Byb3BzLnB1c2goe1xuICAgICAgICAgICAgICAgIHByb3BfaWQ6IHByb3AuaW5kZXgsXG4gICAgICAgICAgICAgICAgZHJhd2FibGU6IHByb3AudmFsdWUsXG4gICAgICAgICAgICAgICAgdGV4dHVyZTogcHJvcC50ZXh0dXJlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRIZWFkQmxlbmQnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgICAgICAvL3JldHVybiBnZXRIZWFkQmxlbmREYXRhKHBlZCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRGYWNlRmVhdHVyZXMnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgICAgICAvL3JldHVybiBnZXRIZWFkU3RydWN0dXJlKHBlZCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRIZWFkT3ZlcmxheXMnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgICAgICAvL3JldHVybiBnZXRIZWFkT3ZlcmxheShwZWQpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkSGFpcicsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICAvL3JldHVybiBnZXRIYWlyKHBlZCk7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEFwcGVhcmFuY2UnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldEFwcGVhcmFuY2UocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBsYXllck1vZGVsJywgKG1vZGVsOiBudW1iZXIpID0+IHtcbiAgICAgICAgdXBkYXRlUGVkKFBsYXllclBlZElkKCkpXG4gICAgICAgIHNldE1vZGVsKHBlZCwgbW9kZWwpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkSGVhZEJsZW5kJywgKHBlZDogbnVtYmVyLCBibGVuZDogYW55KSA9PiB7XG4gICAgICAgIC8vc2V0SGVhZEJsZW5kKHBlZCwgYmxlbmQpO1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRGYWNlRmVhdHVyZXMnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZEhlYWRPdmVybGF5cycsIChwZWQ6IG51bWJlciwgb3ZlcmxheTogYW55KSA9PiB7XG4gICAgICAgIC8vc2V0SGVhZE92ZXJsYXkocGVkLCBvdmVybGF5KTtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkSGFpcicsIGFzeW5jIChwZWQ6IG51bWJlciwgaGFpcjogYW55LCB0YXR0b286IGFueSkgPT4ge1xuICAgICAgICAvL3NldFBlZEhhaXJDb2xvcnMocGVkLCBoYWlyKTtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkRXllQ29sb3InLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZENvbXBvbmVudCcsIChwZWQ6IG51bWJlciwgZHJhd2FibGU6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCBuZXdEcmF3YWJsZSA9IHtcbiAgICAgICAgICAgIGluZGV4OiBkcmF3YWJsZS5jb21wb25lbnRfaWQsXG4gICAgICAgICAgICB2YWx1ZTogZHJhd2FibGUuZHJhd2FibGUsXG4gICAgICAgICAgICB0ZXh0dXJlOiBkcmF3YWJsZS50ZXh0dXJlXG4gICAgICAgIH1cbiAgICAgICAgc2V0RHJhd2FibGUocGVkLCBuZXdEcmF3YWJsZSk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRDb21wb25lbnRzJywgKHBlZDogbnVtYmVyLCBjb21wb25lbnRzOiBhbnkpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBjb21wb25lbnQgb2YgY29tcG9uZW50cykge1xuICAgICAgICAgICAgY29uc3QgbmV3RHJhd2FibGUgPSB7XG4gICAgICAgICAgICAgICAgaW5kZXg6IGNvbXBvbmVudC5jb21wb25lbnRfaWQsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNvbXBvbmVudC5kcmF3YWJsZSxcbiAgICAgICAgICAgICAgICB0ZXh0dXJlOiBjb21wb25lbnQudGV4dHVyZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0RHJhd2FibGUocGVkLCBuZXdEcmF3YWJsZSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZFByb3AnLCAocGVkOiBudW1iZXIsIHByb3A6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCBuZXdQcm9wID0ge1xuICAgICAgICAgICAgaW5kZXg6IHByb3AucHJvcF9pZCxcbiAgICAgICAgICAgIHZhbHVlOiBwcm9wLmRyYXdhYmxlLFxuICAgICAgICAgICAgdGV4dHVyZTogcHJvcC50ZXh0dXJlXG4gICAgICAgIH1cbiAgICAgICAgc2V0UHJvcChwZWQsIG5ld1Byb3ApO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkUHJvcHMnLCAocGVkOiBudW1iZXIsIHByb3BzOiBhbnkpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBwcm9wIG9mIHByb3BzKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdQcm9wID0ge1xuICAgICAgICAgICAgICAgIGluZGV4OiBwcm9wLnByb3BfaWQsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHByb3AuZHJhd2FibGUsXG4gICAgICAgICAgICAgICAgdGV4dHVyZTogcHJvcC50ZXh0dXJlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRQcm9wKHBlZCwgbmV3UHJvcCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGV4cG9ydEhhbmRsZXIoJ3NldFBsYXllckFwcGVhcmFuY2UnLCAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UpID0+IHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbnNvbGUud2FybignTmVlZCB0byBiZSBpbXBsZW1lbnRlZCcpO1xuICAgIC8vIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkQXBwZWFyYW5jZScsIChwZWQ6IG51bWJlciwgYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UpID0+IHtcbiAgICAgICAgc2V0UGVkQXBwZWFyYW5jZShwZWQsIGFwcGVhcmFuY2UpXG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRUYXR0b29zJywgKHBlZDogbnVtYmVyLCB0YXR0b29zOiBUVGF0dG9vW10pID0+IHtcbiAgICAgICAgc2V0UGVkVGF0dG9vcyhwZWQsIHRhdHRvb3MpXG4gICAgfSk7XG59IiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUQXBwZWFyYW5jZVpvbmUgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCB7IG9wZW5NZW51IH0gZnJvbSBcIi4vbWVudVwiXHJcbmltcG9ydCB7IHNldFBsYXllclBlZEFwcGVhcmFuY2UgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxyXG5pbXBvcnQgeyB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIGdldEZyYW1ld29ya0lELCBEZWxheSwgYmxfYnJpZGdlLCBwZWQsIGRlbGF5LCBmb3JtYXQsIHVwZGF0ZVBlZCB9IGZyb20gXCJAdXRpbHNcIlxyXG5pbXBvcnQgeyBRQkJyaWRnZSB9IGZyb20gXCIuL2JyaWRnZS9xYlwiXHJcbmltcG9ydCB7IEVTWEJyaWRnZSB9IGZyb20gXCIuL2JyaWRnZS9lc3hcIlxyXG5pbXBvcnQgeyBpbGxlbml1bUNvbXBhdCB9IGZyb20gXCIuL2NvbXBhdC9pbGxlbml1bVwiXHJcblxyXG5leHBvcnRzKCdTZXRQbGF5ZXJQZWRBcHBlYXJhbmNlJywgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlIHwgc3RyaW5nKSA9PiB7XHJcbiAgICBsZXQgcmVzb2x2ZWRBcHBlYXJhbmNlOiBUQXBwZWFyYW5jZTtcclxuICAgIFxyXG4gICAgaWYgKCFhcHBlYXJhbmNlIHx8IHR5cGVvZiBhcHBlYXJhbmNlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIGNvbnN0IGZyYW1ld29ya0lEOiBzdHJpbmcgPSBhcHBlYXJhbmNlIHx8IGF3YWl0IGdldEZyYW1ld29ya0lEKCk7XHJcbiAgICAgICAgcmVzb2x2ZWRBcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKSBhcyBUQXBwZWFyYW5jZTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGFwcGVhcmFuY2UgPT09ICdvYmplY3QnKSByZXNvbHZlZEFwcGVhcmFuY2UgPSBhcHBlYXJhbmNlO1xyXG4gICAgXHJcbiAgICBpZiAoIXJlc29sdmVkQXBwZWFyYW5jZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gdmFsaWQgYXBwZWFyYW5jZSBmb3VuZCcpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKHJlc29sdmVkQXBwZWFyYW5jZSk7XHJcbn0pO1xyXG5cclxuZXhwb3J0cygnR2V0UGxheWVyUGVkQXBwZWFyYW5jZScsIGFzeW5jIChmcmFtZXdvcmtJRDogc3RyaW5nKSA9PiB7XHJcbiAgICBmcmFtZXdvcmtJRCA9IGZyYW1ld29ya0lEIHx8IGF3YWl0IGdldEZyYW1ld29ya0lEKClcclxuICAgIHJldHVybiBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcbn0pXHJcblxyXG5leHBvcnRzKCdJbml0aWFsQ3JlYXRpb24nLCBhc3luYyAoY2I/OiBGdW5jdGlvbikgPT4ge1xyXG4gICAgLy8gVGhlIGZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIHR5cGUgb2YgVEFwcGVhcmFuY2Vab25lIG1lYW5pbmcgaXQgbmVlZHMgYSBjb29yZHMgcHJvcGVydHksIGJ1dCBpbiB0aGlzIGNhc2UgaXQncyBub3QgdXNlZFxyXG4gICAgYXdhaXQgb3Blbk1lbnUoeyB0eXBlOiBcImFwcGVhcmFuY2VcIiwgY29vcmRzOiBbMCwgMCwgMCwgMF0gfSwgdHJ1ZSlcclxuICAgIGlmIChjYikgY2IoKVxyXG59KVxyXG5cclxub24oJ2JsX2FwcGVhcmFuY2U6Y2xpZW50OnVzZVpvbmUnLCAoem9uZTogVEFwcGVhcmFuY2Vab25lKSA9PiB7XHJcbiAgICBvcGVuTWVudSh6b25lKVxyXG59KVxyXG5cclxub25OZXQoJ2JsX2JyaWRnZTpjbGllbnQ6cGxheWVyTG9hZGVkJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgd2hpbGUgKCFibF9icmlkZ2UuY29yZSgpLnBsYXllckxvYWRlZCgpKSB7XHJcbiAgICAgICAgYXdhaXQgRGVsYXkoMTAwKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGZyYW1ld29ya0lEID0gYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxuICAgIGlmICghYXBwZWFyYW5jZSkgcmV0dXJuO1xyXG4gICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxyXG59KVxyXG5cclxub25OZXQoJ29uUmVzb3VyY2VTdGFydCcsIGFzeW5jIChyZXNvdXJjZTogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAocmVzb3VyY2UgPT09IEdldEN1cnJlbnRSZXNvdXJjZU5hbWUoKSAmJiBibF9icmlkZ2UuY29yZSgpLnBsYXllckxvYWRlZCgpKSB7XHJcbiAgICAgICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICAgICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxuICAgICAgICBpZiAoIWFwcGVhcmFuY2UpIHJldHVybjtcclxuICAgICAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcbiAgICB9XHJcbn0pXHJcblxyXG5jb25zdCBmcmFtZXdvcmtOYW1lID0gYmxfYnJpZGdlLmdldEZyYW1ld29yaygnY29yZScpXHJcbmNvbnN0IGNvcmUgPSBmb3JtYXQoR2V0Q29udmFyKCdibDpmcmFtZXdvcmsnLCAncWInKSlcclxuXHJcbmlmIChjb3JlID09ICdxYicgfHwgY29yZSA9PSAncWJ4JyAmJiBHZXRSZXNvdXJjZVN0YXRlKGZyYW1ld29ya05hbWUpID09ICdzdGFydGVkJykge1xyXG4gICAgUUJCcmlkZ2UoKTtcclxufSBlbHNlIGlmIChjb3JlID09ICdlc3gnICYmIEdldFJlc291cmNlU3RhdGUoZnJhbWV3b3JrTmFtZSkgPT0gJ3N0YXJ0ZWQnKSB7XHJcbiAgICBFU1hCcmlkZ2UoKTtcclxufVxyXG5cclxuaWxsZW5pdW1Db21wYXQoKTtcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgncmVsb2Fkc2tpbicsIGFzeW5jICgpID0+IHtcclxuICAgIGNvbnN0IGZyYW1ld29ya0lEID0gYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgY29uc3QgaGVhbHRoID0gR2V0RW50aXR5SGVhbHRoKHBlZCk7XHJcbiAgICBjb25zdCBtYXhoZWFsdGggPSBHZXRFbnRpdHlNYXhIZWFsdGgocGVkKTtcclxuICAgIGNvbnN0IGFybW9yID0gR2V0UGVkQXJtb3VyKHBlZCk7XHJcblxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxuICAgIGlmICghYXBwZWFyYW5jZSkgcmV0dXJuO1xyXG4gICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxyXG5cclxuICAgIFNldFBlZE1heEhlYWx0aChwZWQsIG1heGhlYWx0aClcclxuICAgIGRlbGF5KDEwMDApIFxyXG4gICAgU2V0RW50aXR5SGVhbHRoKHBlZCwgaGVhbHRoKVxyXG4gICAgU2V0UGVkQXJtb3VyKHBlZCwgYXJtb3IpXHJcbn0sIGZhbHNlKVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7O0FBQU8sSUFBSSxNQUFNO0FBRVYsSUFBTSxZQUFZLHdCQUFDLGNBQXNCO0FBQzVDLFFBQU07QUFDVixHQUZ5QjtBQWFsQixJQUFNLGVBQWUsd0JBQUMsUUFBZ0IsU0FBYztBQUN2RCxpQkFBZTtBQUFBLElBQ1g7QUFBQSxJQUNBO0FBQUEsRUFDSixDQUFDO0FBQ0wsR0FMNEI7QUFPckIsSUFBTSxRQUFRLHdCQUFDLE9BQWUsSUFBSSxRQUFRLFNBQU8sV0FBVyxLQUFLLEVBQUUsQ0FBQyxHQUF0RDtBQUVkLElBQU0sZUFBZSw4QkFBTyxVQUE0QztBQUMzRSxNQUFJLFlBQW9CLE9BQU8sVUFBVSxXQUFXLFFBQVEsV0FBVyxLQUFLO0FBRTVFLE1BQUksQ0FBQyxhQUFhLFNBQVMsS0FBSyxDQUFDLGlCQUFpQixTQUFTLEdBQUc7QUFPMUQsWUFBUSxLQUFLLG9DQUFvQyxLQUFLLEdBQUc7QUFDekQsV0FBTztBQUFBLEVBQ1g7QUFFQSxNQUFJLGVBQWUsU0FBUztBQUFHLFdBQU87QUFFdEMsZUFBYSxTQUFTO0FBRXRCLFFBQU0scUJBQXFCLDZCQUFxQjtBQUM1QyxXQUFPLElBQUksUUFBUSxhQUFXO0FBQzFCLFlBQU0sV0FBVyxZQUFZLE1BQU07QUFDL0IsWUFBSSxlQUFlLFNBQVMsR0FBRztBQUMzQix3QkFBYyxRQUFRO0FBQ3RCLGtCQUFRO0FBQUEsUUFDWjtBQUFBLE1BQ0osR0FBRyxHQUFHO0FBQUEsSUFDVixDQUFDO0FBQUEsRUFDTCxHQVQyQjtBQVczQixRQUFNLG1CQUFtQjtBQUV6QixTQUFPO0FBQ1gsR0FoQzRCO0FBc0M1QixJQUFNLGVBQWUsdUJBQXVCO0FBQzVDLElBQU0sY0FBc0MsQ0FBQztBQUM3QyxJQUFNLGVBQXlELENBQUM7QUFFaEUsU0FBUyxXQUFXLFdBQW1CQSxRQUFzQjtBQUN6RCxNQUFJQSxVQUFTQSxTQUFRLEdBQUc7QUFDcEIsVUFBTSxjQUFjLGFBQWE7QUFFakMsU0FBSyxZQUFZLFNBQVMsS0FBSyxLQUFLO0FBQWEsYUFBTztBQUV4RCxnQkFBWSxTQUFTLElBQUksY0FBY0E7QUFBQSxFQUMzQztBQUVBLFNBQU87QUFDWDtBQVZTO0FBWVQsTUFBTSxVQUFVLFlBQVksSUFBSSxDQUFDLFFBQWdCLFNBQWM7QUFDM0QsUUFBTSxVQUFVLGFBQWEsR0FBRztBQUNoQyxTQUFPLFdBQVcsUUFBUSxHQUFHLElBQUk7QUFDckMsQ0FBQztBQUVNLFNBQVMsc0JBQ1osY0FBc0IsTUFDTDtBQUNqQixNQUFJLENBQUMsV0FBVyxXQUFXLENBQUMsR0FBRztBQUMzQjtBQUFBLEVBQ0o7QUFFQSxNQUFJO0FBRUosS0FBRztBQUNDLFVBQU0sR0FBRyxTQUFTLElBQUksS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLE1BQVMsRUFBRSxDQUFDO0FBQUEsRUFDbEUsU0FBUyxhQUFhLEdBQUc7QUFDekIsVUFBUSxVQUFVLFNBQVMsSUFBSSxjQUFjLEtBQUssR0FBRyxJQUFJO0FBRXpELFNBQU8sSUFBSSxRQUFXLENBQUMsWUFBWTtBQUMvQixpQkFBYSxHQUFHLElBQUk7QUFBQSxFQUN4QixDQUFDO0FBQ0w7QUFqQmdCO0FBbUJULFNBQVMsaUJBQWlCLFdBQVcsSUFBSTtBQUM1QyxRQUFNLFVBQVUsU0FBUyxJQUFJLE9BQU8sVUFBVSxRQUFRLFNBQVM7QUFDM0QsUUFBSTtBQUNKLFFBQUk7QUFDQSxpQkFBVyxNQUFNLEdBQUcsR0FBRyxJQUFJO0FBQUEsSUFDL0IsU0FDTyxHQUFHO0FBQ04sY0FBUSxNQUFNLG1EQUFtRCxTQUFTLEVBQUU7QUFDNUUsY0FBUSxJQUFJLEtBQUssRUFBRSxLQUFLLElBQUk7QUFBQSxJQUNoQztBQUNBLFlBQVEsVUFBVSxRQUFRLElBQUksS0FBSyxRQUFRO0FBQUEsRUFDL0MsQ0FBQztBQUNMO0FBWmdCO0FBZ0JULElBQU0sZ0JBQWdCLHdCQUFDLG9CQUE0QjtBQUN0RCxTQUFPLElBQUksUUFBUSxDQUFDLFlBQVk7QUFDNUIsVUFBTSxvQkFBb0IsNkJBQU07QUFDNUIsVUFBSSx1QkFBdUIsZUFBZSxHQUFHO0FBQ3pDLGNBQU0sYUFBYSxRQUFRLGNBQWMsT0FBTyxFQUFFO0FBQ2xELFlBQUksb0JBQW9CLGlCQUFpQixjQUFjLFVBQVUsVUFBVSxPQUFPO0FBQ2xGLFlBQUksQ0FBQyxtQkFBbUI7QUFDcEIsa0JBQVEsTUFBTSxHQUFHLFVBQVUscUVBQXFFO0FBQ2hHLDhCQUFvQixpQkFBaUIsY0FBYyxnQkFBZ0I7QUFBQSxRQUN2RTtBQUNBLGdCQUFRLGlCQUFpQjtBQUFBLE1BQzdCLE9BQU87QUFDSCxtQkFBVyxtQkFBbUIsR0FBRztBQUFBLE1BQ3JDO0FBQUEsSUFDSixHQVowQjtBQWExQixzQkFBa0I7QUFBQSxFQUN0QixDQUFDO0FBQ0wsR0FqQjZCO0FBMkJ0QixJQUFNLFlBQVksUUFBUTtBQUUxQixJQUFNLGdCQUFnQiw2QkFBTTtBQUMvQixTQUFPLFVBQVUsS0FBSyxFQUFFLGNBQWM7QUFDMUMsR0FGNkI7QUFJdEIsSUFBTSxpQkFBaUIsNkJBQU07QUFDaEMsUUFBTSxLQUFLLGNBQWMsRUFBRTtBQUMzQixTQUFPO0FBQ1gsR0FIOEI7QUFLdkIsSUFBTSx1QkFBdUIsNkJBQU07QUFDdEMsUUFBTSxTQUFTLGNBQWMsRUFBRTtBQUMvQixTQUFPLFdBQVcsU0FBUyxxQkFBcUI7QUFDcEQsR0FIb0M7QUFLN0IsU0FBUyxNQUFNLElBQTJCO0FBQzdDLFNBQU8sSUFBSSxRQUFRLGFBQVcsV0FBVyxTQUFTLEVBQUUsQ0FBQztBQUN6RDtBQUZnQjtBQUlULFNBQVMsT0FBTyxLQUFxQjtBQUN4QyxNQUFJLENBQUMsSUFBSSxTQUFTLEdBQUc7QUFBRyxXQUFPO0FBQy9CLFNBQU8sSUFBSSxRQUFRLE1BQU0sRUFBRTtBQUMvQjtBQUhnQjtBQUtULFNBQVMsYUFBdUQ7QUFDbkUsUUFBTSxNQUFNLGNBQWMsRUFBRTtBQUM1QixTQUFPLE1BQU0sRUFBRSxNQUFNLElBQUksTUFBTSxRQUFRLElBQUksT0FBTyxJQUFJO0FBQzFEO0FBSGdCO0FBS1QsU0FBUyxtQkFBbUJDLE1BQWE7QUFDNUMsUUFBTSxRQUFRLGVBQWVBLElBQUc7QUFDaEMsU0FBTyxVQUFVLFdBQVcsa0JBQWtCLEtBQUssVUFBVSxXQUFXLGtCQUFrQjtBQUM5RjtBQUhnQjs7O0FDM0toQixJQUFNLDBCQUEwQjtBQUNoQyxJQUFNLHVCQUF1QjtBQUU3QixJQUFJLFVBQW1CO0FBQ3ZCLElBQUksY0FBc0I7QUFDMUIsSUFBSSxNQUFxQjtBQUN6QixJQUFJLFNBQWlCO0FBQ3JCLElBQUksU0FBaUI7QUFDckIsSUFBSSxlQUErQjtBQUNuQyxJQUFJLFNBQXdCO0FBQzVCLElBQUksY0FBdUI7QUFFM0IsSUFBSSxjQUFrQztBQUV0QyxJQUFNLGNBQTRCO0FBQUEsRUFDOUIsT0FBTztBQUFBLEVBQ1YsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsTUFBTSxDQUFDLE9BQU8sS0FBSztBQUFBLEVBQ2hCLE9BQU8sQ0FBQyxPQUFPLEtBQUs7QUFDeEI7QUFFQSxJQUFNLE1BQU0sd0JBQUMsWUFBNEI7QUFDeEMsU0FBTyxLQUFLLElBQUssVUFBVSxLQUFLLEtBQU0sR0FBRztBQUMxQyxHQUZZO0FBSVosSUFBTSxNQUFNLHdCQUFDLFlBQTRCO0FBQ3hDLFNBQU8sS0FBSyxJQUFLLFVBQVUsS0FBSyxLQUFNLEdBQUc7QUFDMUMsR0FGWTtBQUlaLElBQU0sWUFBWSw2QkFBZ0I7QUFDakMsUUFBTSxLQUNILElBQUksTUFBTSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksTUFBTSxLQUFLLElBQzNEO0FBQ0QsUUFBTSxLQUNILElBQUksTUFBTSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksTUFBTSxLQUFLLElBQzNEO0FBQ0QsUUFBTSxJQUFJLElBQUksTUFBTSxJQUFJO0FBRXhCLFNBQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNoQixHQVZrQjtBQVlsQixJQUFNLGlCQUFpQix3QkFBQyxRQUFpQixXQUEwQjtBQUNsRSxNQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQjtBQUFhO0FBRTlDLFdBQVMsVUFBVTtBQUNuQixXQUFTLFVBQVU7QUFFbkIsWUFBVTtBQUNWLFlBQVU7QUFFUCxRQUFNLGdCQUFnQixnQkFBZ0IsV0FBVyxnQkFBZ0I7QUFDakUsUUFBTSxXQUFXLGdCQUFnQixLQUFPO0FBRXhDLFFBQU0sVUFBVSxnQkFBZ0I7QUFDaEMsUUFBTSxXQUFXLFVBQVUsSUFBTTtBQUVwQyxXQUFTLEtBQUssSUFBSSxLQUFLLElBQUksUUFBUSxRQUFRLEdBQUcsUUFBUTtBQUV0RCxRQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxVQUFVO0FBRTVCO0FBQUEsSUFDQztBQUFBLElBQ0EsYUFBYSxJQUFJO0FBQUEsSUFDakIsYUFBYSxJQUFJO0FBQUEsSUFDakIsYUFBYSxJQUFJO0FBQUEsRUFDbEI7QUFDQSxrQkFBZ0IsS0FBSyxhQUFhLEdBQUcsYUFBYSxHQUFHLGFBQWEsQ0FBQztBQUNwRSxHQTFCdUI7QUE0QnZCLElBQU0sYUFBYSw4QkFBTyxRQUFpQixhQUFzQjtBQUNoRSxRQUFNLFVBQWtCLGlCQUFpQixHQUFHLElBQUk7QUFDaEQsYUFBVyxZQUFZO0FBRXZCLGdCQUFjO0FBQ2QsZ0JBQWM7QUFDZCxXQUFTO0FBRVQsUUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksVUFBVTtBQUU1QixRQUFNLFNBQWlCO0FBQUEsSUFDdEI7QUFBQSxJQUNBLE9BQU8sSUFBSTtBQUFBLElBQ1gsT0FBTyxJQUFJO0FBQUEsSUFDWCxPQUFPLElBQUk7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNEO0FBRUEsaUJBQWU7QUFDZixnQkFBYztBQUNkLFdBQVM7QUFDVCxRQUFNO0FBRU4sa0JBQWdCLFFBQVEsT0FBTyxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDcEQseUJBQXVCLFFBQVEsUUFBUSxLQUFLLEdBQUcsQ0FBQztBQUVoRCxRQUFNLE1BQU0sR0FBRztBQUVmLDBCQUF3QixRQUFRLElBQUk7QUFDcEMsZ0JBQWMsUUFBUSxHQUFHO0FBQ3pCLGVBQWEsUUFBUSxHQUFHO0FBQ3hCLG9CQUFrQixRQUFRLEdBQUc7QUFDN0IsV0FBUyxNQUFNO0FBRWYsYUFBVyxRQUFRLElBQUk7QUFDeEIsR0F4Q21CO0FBMENuQixJQUFNLFdBQVcsd0JBQUMsZUFBdUI7QUFDeEMsTUFBSSxFQUFFLGFBQWEsR0FBRyxLQUFLLGNBQWM7QUFBTTtBQUMvQyxjQUFZO0FBQ1osYUFBVyxVQUFVLENBQUM7QUFDdkIsR0FKaUI7QUFNVixJQUFNLGNBQWMsNkJBQU07QUFDaEMsTUFBSTtBQUFTO0FBQ2IsWUFBVTtBQUNWLGdCQUFjO0FBQ2QsUUFBTSxVQUFVLDJCQUEyQixJQUFJO0FBQy9DLFFBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFjLGlCQUFpQixLQUFLLE9BQU8sR0FBSyxHQUFLLENBQUc7QUFDdEUsY0FBWSxLQUFLLEdBQUcsR0FBRyxDQUFDO0FBQ3hCLG1CQUFpQixNQUFNLE1BQU0sS0FBTSxNQUFNLElBQUk7QUFFMUMsWUFBVSxTQUFTLFdBQVc7QUFDbEMsR0FWMkI7QUFZcEIsSUFBTSxhQUFhLDZCQUFZO0FBQ3JDLE1BQUksQ0FBQztBQUFTO0FBQ2QsWUFBVTtBQUVWLG1CQUFpQixPQUFPLE1BQU0sS0FBSyxNQUFNLEtBQUs7QUFDOUMsYUFBVyxLQUFLLElBQUk7QUFDcEIsUUFBTTtBQUNOLGlCQUFlO0FBQ2hCLEdBUjBCO0FBVTFCLElBQU0sWUFBWSx3QkFBQyxNQUEyQixXQUFXLGdCQUFzQjtBQUU5RSxRQUFNLE9BQXNDLFlBQVksSUFBSTtBQUV6RCxRQUFNLGNBQWMsTUFBTSxRQUFRLElBQUk7QUFFdEMsZ0JBQWM7QUFFZCxNQUFJLENBQUMsZUFBZSxTQUFTLEdBQUc7QUFDNUIsVUFBTSxDQUFDQyxJQUFHQyxJQUFHQyxFQUFDLElBQWMsZ0JBQWdCLEtBQUssS0FBSztBQUN0RDtBQUFBLE1BQ0k7QUFBQSxRQUNJLEdBQUdGO0FBQUEsUUFDSCxHQUFHQztBQUFBLFFBQ0gsR0FBR0MsS0FBSTtBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUNBO0FBQUEsRUFDSjtBQUdBLE1BQUksV0FBVztBQUFzQixlQUFXO0FBRWhELE1BQUksYUFBYTtBQUNiLFVBQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxJQUFjLGlCQUFpQixLQUFLLEtBQUssQ0FBQyxHQUFHLEdBQUssR0FBSyxDQUFHO0FBRTNFLFVBQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxJQUFjLGlCQUFpQixLQUFLLEtBQUssQ0FBQyxHQUFHLEdBQUssR0FBSyxDQUFHO0FBRzNFLFFBQUksS0FBSyxLQUFLLE1BQU07QUFDcEIsUUFBSSxLQUFLLEtBQUssTUFBTTtBQUNwQixRQUFJLEtBQUssS0FBSyxNQUFNO0FBQUEsRUFDeEIsT0FBTztBQUNILFFBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFjLGlCQUFpQixLQUFLLE1BQU0sR0FBSyxHQUFLLENBQUc7QUFBQSxFQUN2RTtBQUVIO0FBQUEsSUFDQztBQUFBLE1BQ0M7QUFBQSxNQUNBO0FBQUEsTUFDQSxHQUFHLElBQUk7QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLEVBQ0Q7QUFFRCxHQTlDa0I7QUFnRGxCLHdEQUFxQyxDQUFDLE1BQU0sT0FBTztBQUMvQyxpQkFBZSxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQzdCLEtBQUcsQ0FBQztBQUNSLENBQUM7QUFJRCw4REFBd0MsQ0FBQyxNQUFnQixPQUFpQjtBQUN6RSxVQUFRLE1BQU07QUFBQSxJQUNQLEtBQUs7QUFDRCxnQkFBVSxTQUFTLHVCQUF1QjtBQUMxQztBQUFBLElBQ0osS0FBSztBQUNELGdCQUFVLE1BQU07QUFDaEI7QUFBQSxJQUNKLEtBQUs7QUFDRCxnQkFBVSxPQUFPO0FBQ2pCO0FBQUEsSUFDSixLQUFLO0FBQ0QsZ0JBQVUsTUFBTTtBQUNoQjtBQUFBLElBQ0osS0FBSztBQUNELGdCQUFVLE9BQU87QUFDakIscUJBQWU7QUFDZjtBQUFBLEVBQ1g7QUFDQSxLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsd0RBQXFDLENBQUMsTUFBTSxPQUFPO0FBQ2xELE1BQUksU0FBUyxRQUFRO0FBRWQsVUFBTSxVQUFVLGdCQUFnQixVQUFVLDBCQUEwQjtBQUUxRSxVQUFNLGNBQXNCLGNBQWM7QUFDMUMsa0JBQWMsZUFBZSxVQUFVLFVBQVU7QUFBQSxFQUNsRCxXQUFXLFNBQVMsTUFBTTtBQUN6QixVQUFNLGNBQXNCLGNBQWM7QUFDMUMsa0JBQWMsZUFBZSxNQUFNLE1BQU07QUFBQSxFQUMxQztBQUVBLGdCQUFjO0FBQ2QsaUJBQWU7QUFDZixLQUFHLENBQUM7QUFDTCxDQUFDOzs7QUM1T0QsSUFBTyxlQUFRO0FBQUEsRUFDWDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDSjs7O0FDZkEsSUFBTyxlQUFRO0FBQUEsRUFDWDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDSjs7O0FDckJBLElBQU8sb0JBQVE7QUFBQSxFQUNYO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDSjs7O0FDYkEsSUFBTyxnQkFBUTtBQUFBLEVBQ1g7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0o7OztBQ0RPLFNBQVMsZUFBZSxRQUFnQjtBQUMzQyxRQUFNQyxVQUFTLFFBQVE7QUFDdkIsUUFBTSxTQUFTQSxRQUFPLE9BQU87QUFFN0IsU0FBTyxPQUFPLFVBQVUsQ0FBQyxVQUFrQixXQUFXLEtBQUssTUFBTSxNQUFNO0FBQzNFO0FBTGdCO0FBT1QsU0FBUyxRQUFRLFdBQThCO0FBQ2xELFNBQU87QUFBQSxJQUNILE9BQU8sZ0JBQWdCLFNBQVM7QUFBQSxJQUNoQyxXQUFXLHlCQUF5QixTQUFTO0FBQUEsRUFDakQ7QUFDSjtBQUxnQjtBQU1oQixRQUFRLFdBQVcsT0FBTztBQUVuQixTQUFTLGlCQUFpQixXQUFtQjtBQUVoRCxRQUFNLFNBQVMsSUFBSSxZQUFZLEVBQUU7QUFDakMsU0FBTyxRQUFRLGFBQWEsc0JBQXNCLFdBQVcsSUFBSSxZQUFZLE1BQU0sQ0FBQztBQUVwRixRQUFNLEVBQUUsR0FBRyxZQUFZLEdBQUcsYUFBYSxHQUFHLFlBQVksR0FBRyxXQUFXLEdBQUcsWUFBWSxJQUFJLFdBQVcsSUFBSSxVQUFVLElBQUksSUFBSSxZQUFZLE1BQU07QUFDMUksUUFBTSxFQUFFLEdBQUcsVUFBVSxHQUFHLFNBQVMsR0FBRyxTQUFTLElBQUksSUFBSSxhQUFhLFFBQVEsRUFBRTtBQVc1RSxTQUFPO0FBQUEsSUFDSDtBQUFBO0FBQUEsSUFDQTtBQUFBO0FBQUEsSUFDQTtBQUFBLElBRUE7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBRUE7QUFBQTtBQUFBLElBRUE7QUFBQSxJQUNBO0FBQUE7QUFBQSxJQUVBLFdBQVcsUUFBUSxTQUFTO0FBQUEsRUFDaEM7QUFDSjtBQWpDZ0I7QUFrQ2hCLFFBQVEsZ0JBQWdCLGdCQUFnQjtBQUVqQyxTQUFTLGVBQWUsV0FBbUI7QUFDOUMsTUFBSSxTQUE0QixDQUFDO0FBQ2pDLE1BQUksV0FBeUIsQ0FBQztBQUU5QixXQUFTLElBQUksR0FBRyxJQUFJLGFBQWMsUUFBUSxLQUFLO0FBQzNDLFVBQU0sVUFBVSxhQUFjLENBQUM7QUFDL0IsV0FBTyxPQUFPLElBQUksd0JBQXdCLENBQUM7QUFFM0MsUUFBSSxZQUFZLFlBQVk7QUFDeEIsZUFBUyxPQUFPLElBQUk7QUFBQSxRQUNoQixJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxjQUFjLGVBQWUsU0FBUztBQUFBLE1BQzFDO0FBQUEsSUFDSixPQUFPO0FBQ0gsWUFBTSxDQUFDLEdBQUcsY0FBYyxZQUFZLFlBQVksYUFBYSxjQUFjLElBQUksc0JBQXNCLFdBQVcsQ0FBQztBQUNqSCxlQUFTLE9BQU8sSUFBSTtBQUFBLFFBQ2hCLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGNBQWMsaUJBQWlCLE1BQU0sS0FBSztBQUFBLFFBQzFDO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsU0FBTyxDQUFDLFVBQVUsTUFBTTtBQUM1QjtBQTdCZ0I7QUE4QmhCLFFBQVEsa0JBQWtCLGNBQWM7QUFFakMsU0FBUyxpQkFBaUIsV0FBbUI7QUFDaEQsUUFBTSxXQUFXLGVBQWUsU0FBUztBQUV6QyxNQUFJLGFBQWEsV0FBVyxrQkFBa0IsS0FBSyxhQUFhLFdBQVcsa0JBQWtCO0FBQUc7QUFFaEcsTUFBSSxhQUFhLENBQUM7QUFDbEIsV0FBUyxJQUFJLEdBQUcsSUFBSSxhQUFjLFFBQVEsS0FBSztBQUMzQyxVQUFNLFVBQVUsYUFBYyxDQUFDO0FBQy9CLGVBQVcsT0FBTyxJQUFJO0FBQUEsTUFDbEIsSUFBSTtBQUFBLE1BQ0osT0FBTztBQUFBLE1BQ1AsT0FBTyxrQkFBa0IsV0FBVyxDQUFDO0FBQUEsSUFDekM7QUFBQSxFQUNKO0FBRUEsU0FBTztBQUNYO0FBaEJnQjtBQWlCaEIsUUFBUSxvQkFBb0IsZ0JBQWdCO0FBRXJDLFNBQVMsYUFBYSxXQUFtQjtBQUM1QyxNQUFJLFlBQVksQ0FBQztBQUNqQixNQUFJLGlCQUFpQixDQUFDO0FBRXRCLFdBQVMsSUFBSSxHQUFHLElBQUksa0JBQWUsUUFBUSxLQUFLO0FBQzVDLFVBQU0sT0FBTyxrQkFBZSxDQUFDO0FBQzdCLFVBQU0sVUFBVSx3QkFBd0IsV0FBVyxDQUFDO0FBRXBELG1CQUFlLElBQUksSUFBSTtBQUFBLE1BQ25CLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8saUNBQWlDLFdBQVcsQ0FBQztBQUFBLE1BQ3BELFVBQVUsZ0NBQWdDLFdBQVcsR0FBRyxPQUFPO0FBQUEsSUFDbkU7QUFDQSxjQUFVLElBQUksSUFBSTtBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osT0FBTztBQUFBLE1BQ1AsT0FBTyx3QkFBd0IsV0FBVyxDQUFDO0FBQUEsTUFDM0MsU0FBUyx1QkFBdUIsV0FBVyxDQUFDO0FBQUEsSUFDaEQ7QUFBQSxFQUNKO0FBRUEsU0FBTyxDQUFDLFdBQVcsY0FBYztBQUNyQztBQXZCZ0I7QUF3QmhCLFFBQVEsZ0JBQWdCLFlBQVk7QUFFN0IsU0FBUyxTQUFTLFdBQW1CO0FBQ3hDLE1BQUksUUFBUSxDQUFDO0FBQ2IsTUFBSSxhQUFhLENBQUM7QUFFbEIsV0FBUyxJQUFJLEdBQUcsSUFBSSxjQUFXLFFBQVEsS0FBSztBQUN4QyxVQUFNLE9BQU8sY0FBVyxDQUFDO0FBQ3pCLFVBQU0sVUFBVSxnQkFBZ0IsV0FBVyxDQUFDO0FBRTVDLGVBQVcsSUFBSSxJQUFJO0FBQUEsTUFDZixJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxPQUFPLHFDQUFxQyxXQUFXLENBQUM7QUFBQSxNQUN4RCxVQUFVLG9DQUFvQyxXQUFXLEdBQUcsT0FBTztBQUFBLElBQ3ZFO0FBRUEsVUFBTSxJQUFJLElBQUk7QUFBQSxNQUNWLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8sZ0JBQWdCLFdBQVcsQ0FBQztBQUFBLE1BQ25DLFNBQVMsdUJBQXVCLFdBQVcsQ0FBQztBQUFBLElBQ2hEO0FBQUEsRUFDSjtBQUVBLFNBQU8sQ0FBQyxPQUFPLFVBQVU7QUFDN0I7QUF4QmdCO0FBeUJoQixRQUFRLFlBQVksUUFBUTtBQUc1QixlQUFzQixjQUFjLFdBQXlDO0FBQ3pFLFFBQU0sQ0FBQyxVQUFVLE1BQU0sSUFBSSxlQUFlLFNBQVM7QUFDbkQsUUFBTSxDQUFDLFdBQVcsU0FBUyxJQUFJLGFBQWEsU0FBUztBQUNyRCxRQUFNLENBQUMsT0FBTyxTQUFTLElBQUksU0FBUyxTQUFTO0FBQzdDLFFBQU0sUUFBUSxlQUFlLFNBQVM7QUFDdEMsUUFBTSxVQUFVLE1BQU0sV0FBVztBQUVqQyxTQUFPO0FBQUEsSUFDSCxZQUFZLGVBQWUsS0FBSztBQUFBLElBQ2hDO0FBQUEsSUFDQSxXQUFXLFFBQVEsU0FBUztBQUFBLElBQzVCLFdBQVcsaUJBQWlCLFNBQVM7QUFBQSxJQUNyQyxhQUFhO0FBQUEsSUFDYixrQkFBa0I7QUFBQSxJQUNsQixlQUFlLGlCQUFpQixTQUFTO0FBQUEsSUFDekM7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUNKO0FBckJzQjtBQXNCdEIsUUFBUSxpQkFBaUIsYUFBYTtBQUN0QyxpQkFBaUIsc0NBQXNDLE1BQU07QUFDekQsWUFBVSxZQUFZLENBQUM7QUFDdkIsU0FBTyxjQUFjLEdBQUc7QUFDNUIsQ0FBQztBQUVNLFNBQVMsY0FBYyxXQUE2QjtBQUN2RCxRQUFNLENBQUMsU0FBUyxJQUFJLGFBQWEsU0FBUztBQUMxQyxRQUFNLENBQUMsS0FBSyxJQUFJLFNBQVMsU0FBUztBQUNsQyxRQUFNLENBQUMsUUFBUSxJQUFJLGVBQWUsU0FBUztBQUUzQyxTQUFPO0FBQUEsSUFDSCxhQUFhO0FBQUEsSUFDYjtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQ0o7QUFWZ0I7QUFXaEIsUUFBUSxpQkFBaUIsYUFBYTtBQUUvQixTQUFTLFdBQVcsV0FBMEI7QUFDakQsU0FBTztBQUFBLElBQ0gsV0FBVyxpQkFBaUIsU0FBUztBQUFBLElBQ3JDLGVBQWUsaUJBQWlCLFNBQVM7QUFBQSxJQUN6QyxXQUFXLFFBQVEsU0FBUztBQUFBLElBQzVCLE9BQU8sZUFBZSxTQUFTO0FBQUEsRUFDbkM7QUFDSjtBQVBnQjtBQVFoQixRQUFRLGNBQWMsVUFBVTtBQUV6QixTQUFTLGdCQUFnQjtBQUM1QixNQUFJLGNBQWMsQ0FBQztBQUVuQixRQUFNLENBQUMsYUFBYSxpQkFBaUIsSUFBSSxRQUFRLGNBQWMsUUFBUTtBQUN2RSxXQUFTLElBQUksR0FBRyxJQUFJLGtCQUFrQixRQUFRLEtBQUs7QUFDL0MsVUFBTSxXQUFXLGtCQUFrQixDQUFDO0FBQ3BDLFVBQU0sT0FBTyxTQUFTO0FBQ3RCLFVBQU0sUUFBUSxTQUFTO0FBQ3ZCLFVBQU0sUUFBUSxTQUFTO0FBQ3ZCLGdCQUFZLEtBQUssSUFBSTtBQUFBLE1BQ2pCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsV0FBVztBQUFBLE1BQ1gsTUFBTSxDQUFDO0FBQUEsSUFDWDtBQUVBLGFBQVMsSUFBSSxHQUFHLElBQUksWUFBWSxRQUFRLEtBQUs7QUFDekMsWUFBTSxVQUFVLFlBQVksQ0FBQztBQUM3QixrQkFBWSxLQUFLLEVBQUUsS0FBSyxLQUFLO0FBQUEsUUFDekIsT0FBTyxRQUFRO0FBQUEsUUFDZixVQUFVO0FBQUEsUUFDVixTQUFTLENBQUM7QUFBQSxNQUNkLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQUVBLFFBQU0sV0FBVyxlQUFlLEdBQUcsTUFBTSxXQUFXLGtCQUFrQjtBQUV0RSxXQUFTLElBQUksR0FBRyxJQUFJLFlBQVksUUFBUSxLQUFLO0FBQ3pDLFVBQU0sT0FBTyxZQUFZLENBQUM7QUFDMUIsVUFBTSxFQUFFLEtBQUssUUFBUSxJQUFJO0FBQ3pCLFVBQU0sVUFBVSxXQUFXLEdBQUc7QUFDOUIsYUFBUyxJQUFJLEdBQUcsSUFBSSxRQUFRLFFBQVEsS0FBSztBQUNyQyxZQUFNLGFBQWEsUUFBUSxDQUFDO0FBQzVCLFVBQUksU0FBUztBQUViLFlBQU0sY0FBYyxXQUFXLFlBQVk7QUFDM0MsWUFBTSxpQkFBaUIsWUFBWSxTQUFTLElBQUk7QUFDaEQsVUFBSSxrQkFBa0IsVUFBVTtBQUM1QixpQkFBUztBQUFBLE1BQ2IsV0FBVyxDQUFDLGtCQUFrQixDQUFDLFVBQVU7QUFDckMsaUJBQVM7QUFBQSxNQUNiO0FBRUEsVUFBSSxPQUFPO0FBQ1gsVUFBSSxPQUFPO0FBRVgsVUFBSSxRQUFRO0FBQ1IsZUFBTyxXQUFXLE1BQU07QUFDeEIsZUFBTywrQkFBK0IsU0FBUyxJQUFJO0FBQUEsTUFDdkQ7QUFFQSxVQUFJLFNBQVMsTUFBTSxNQUFNO0FBQ3JCLGNBQU0sY0FBYyxZQUFZLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRTtBQUU5QyxvQkFBWSxLQUFLO0FBQUEsVUFDYixPQUFPO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDSixDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsU0FBTztBQUNYO0FBbEVnQjtBQW9FaEIsZUFBc0IsYUFBaUM7QUFDbkQsU0FBTyxNQUFNLHNCQUFzQixpQ0FBaUMsS0FBSyxDQUFDO0FBQzlFO0FBRnNCO0FBR3RCLFFBQVEsY0FBYyxVQUFVO0FBR2hDLGlCQUFpQixnREFBZ0QsQ0FBQyxTQUFvQztBQUNsRyxNQUFJLEtBQUssU0FBUztBQUFTLFlBQVEsa0JBQWtCLEVBQUUsb0JBQW9CLEtBQUssSUFBSTtBQUNwRixNQUFJLEtBQUssU0FBUztBQUFZLFlBQVEscUJBQXFCLEVBQUUsb0JBQW9CLEtBQUssSUFBSTtBQUM5RixDQUFDOzs7QUNwU0QsSUFBTyxrQkFBUTtBQUFBLEVBQ1gsTUFBTTtBQUFBLElBQ0YsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDSCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsRUFDVDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLE1BQ0YsV0FBVztBQUFBLFFBQ1AsRUFBRSxXQUFXLEdBQUcsU0FBUyxJQUFJLFNBQVMsR0FBRyxJQUFJLFNBQVM7QUFBQSxRQUN0RCxFQUFFLFdBQVcsR0FBRyxTQUFTLElBQUksU0FBUyxHQUFHLElBQUksU0FBUztBQUFBLE1BQzFEO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxNQUNGLFdBQVc7QUFBQSxRQUNQLEVBQUUsV0FBVyxHQUFHLFNBQVMsSUFBSSxTQUFTLEdBQUcsSUFBSSxTQUFTO0FBQUEsUUFDdEQsRUFBRSxXQUFXLElBQUksU0FBUyxJQUFJLFNBQVMsR0FBRyxJQUFJLFVBQVU7QUFBQSxNQUM1RDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDRixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsRUFDVDtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0YsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLEVBQ1Q7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxFQUNUO0FBQ0o7OztBQzlDTyxTQUFTLFlBQVksV0FBbUIsTUFBYztBQUN6RCxNQUFJLENBQUM7QUFBTSxXQUFPLFFBQVEsS0FBSyxrQ0FBa0M7QUFFakUsMkJBQXlCLFdBQVcsS0FBSyxPQUFPLEtBQUssT0FBTyxLQUFLLFNBQVMsQ0FBQztBQUMzRSxTQUFPLGdDQUFnQyxXQUFXLEtBQUssT0FBTyxLQUFLLEtBQUs7QUFDNUU7QUFMZ0I7QUFNaEIsUUFBUSxlQUFlLFdBQVc7QUFFM0IsU0FBUyxRQUFRLFdBQW1CLE1BQWM7QUFDckQsTUFBSSxDQUFDO0FBQU0sV0FBTyxRQUFRLEtBQUssOEJBQThCO0FBRTdELE1BQUksS0FBSyxVQUFVLElBQUk7QUFDbkIsaUJBQWEsV0FBVyxLQUFLLEtBQUs7QUFDbEM7QUFBQSxFQUNKO0FBRUEsa0JBQWdCLFdBQVcsS0FBSyxPQUFPLEtBQUssT0FBTyxLQUFLLFNBQVMsS0FBSztBQUN0RSxTQUFPLG9DQUFvQyxXQUFXLEtBQUssT0FBTyxLQUFLLEtBQUs7QUFDaEY7QUFWZ0I7QUFXaEIsUUFBUSxXQUFXLE9BQU87QUFFMUIsSUFBTSxjQUFjLFdBQVcsa0JBQWtCO0FBRTFDLElBQU0sV0FBVyw4QkFBTyxXQUFtQixTQUFpRTtBQUMvRyxNQUFJLFFBQVEsUUFBUSxTQUFTLFFBQVc7QUFDcEMsWUFBUSxLQUFLLCtCQUErQjtBQUM1QyxXQUFPO0FBQUEsRUFDWDtBQUVBLE1BQUk7QUFDSixNQUFJLE9BQU8sU0FBUyxVQUFVO0FBQzFCLFlBQVEsV0FBVyxJQUFJO0FBQUEsRUFDM0IsV0FBVyxPQUFPLFNBQVMsVUFBVTtBQUNqQyxZQUFRO0FBQUEsRUFDWixPQUFPO0FBQ0gsWUFBUSxLQUFLLFNBQVM7QUFBQSxFQUMxQjtBQUVBLE1BQUksVUFBVTtBQUFHLFdBQU87QUFFeEIsUUFBTSxhQUFhLEtBQUs7QUFFeEIsUUFBTSxXQUFXLGFBQWEsU0FBUztBQUN2QyxNQUFJLFVBQVU7QUFDVixtQkFBZSxTQUFTLEdBQUcsS0FBSztBQUNoQyxnQkFBWSxZQUFZO0FBQ3hCLGNBQVUsU0FBUztBQUFBLEVBQ3ZCLE9BQU87QUFDSCxtQkFBZSxXQUFXLEtBQUs7QUFBQSxFQUNuQztBQUVBLDJCQUF5QixLQUFLO0FBQzlCLGtDQUFnQyxTQUFTO0FBRXpDLE1BQUksQ0FBQyxtQkFBbUIsU0FBUztBQUFHLFdBQU87QUFFM0MsUUFBTSxjQUFjLE9BQU8sU0FBUyxZQUFZLE9BQU8sU0FBUztBQUNoRSxRQUFNLGVBQWUsQ0FBQyxlQUFlLEtBQUssYUFBYSxPQUFPLEtBQUssS0FBSyxTQUFTLEVBQUUsU0FBUztBQUU1RixNQUFJLGNBQWM7QUFDZCxpQkFBYSxXQUFZLEtBQTZCLFNBQVM7QUFDL0Qsd0JBQW9CLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBSyxHQUFLLEdBQUssS0FBSztBQUFBLEVBQ3pFLE9BQU87QUFDSCxRQUFJLFVBQVUsV0FBVyxrQkFBa0IsR0FBRztBQUMxQywwQkFBb0IsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFLLEdBQUssR0FBSyxLQUFLO0FBQUEsSUFDekUsV0FBVyxVQUFVLFdBQVcsa0JBQWtCLEdBQUc7QUFDakQsMEJBQW9CLFdBQVcsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLEdBQUcsS0FBSyxLQUFLLEdBQUcsS0FBSztBQUFBLElBQzNFO0FBQUEsRUFDSjtBQUVBLFNBQU87QUFDWCxHQWhEd0I7QUFpRHhCLFFBQVEsWUFBWSxRQUFRO0FBRXJCLFNBQVMsZUFBZSxXQUFtQixNQUFjO0FBQzVELE1BQUksQ0FBQztBQUFNLFdBQU8sUUFBUSxLQUFLLHFDQUFxQztBQUVwRSxvQkFBa0IsV0FBVyxLQUFLLE9BQU8sS0FBSyxRQUFRLENBQUc7QUFDN0Q7QUFKZ0I7QUFLaEIsUUFBUSxrQkFBa0IsY0FBYztBQUVqQyxTQUFTLGdCQUFnQixXQUFtQixNQUFzQjtBQUNyRSxNQUFJLENBQUM7QUFBTSxXQUFPLFFBQVEsS0FBSyxzQ0FBc0M7QUFHckUsYUFBVyxXQUFXLE1BQU07QUFDeEIsVUFBTSxRQUFRLEtBQUssT0FBTztBQUMxQixtQkFBZSxXQUFXLEtBQUs7QUFBQSxFQUNuQztBQUNKO0FBUmdCO0FBU2hCLFFBQVEsbUJBQW1CLGVBQWU7QUFFMUMsSUFBTSxhQUFhLHdCQUFDLFFBQWdCLE9BQU8sSUFBSSxNQUFNLEdBQWxDO0FBRVosU0FBUyxhQUFhLFdBQW1CLE1BQU07QUFDbEQsTUFBSSxDQUFDO0FBQU0sV0FBTyxRQUFRLEtBQUssbUNBQW1DO0FBRWxFLGNBQVksYUFBYTtBQUV6QixNQUFJLENBQUMsbUJBQW1CLFNBQVM7QUFBRztBQUVwQyxRQUFNLGFBQWEsV0FBVyxLQUFLLFVBQVU7QUFDN0MsUUFBTSxjQUFjLFdBQVcsS0FBSyxXQUFXO0FBQy9DLFFBQU0sYUFBYSxXQUFXLEtBQUssVUFBVTtBQUM3QyxRQUFNLFlBQVksV0FBVyxLQUFLLFNBQVM7QUFDM0MsUUFBTSxhQUFhLFdBQVcsS0FBSyxVQUFVO0FBQzdDLFFBQU0sWUFBWSxXQUFXLEtBQUssU0FBUztBQUMzQyxRQUFNLFdBQVcsS0FBSyxXQUFXO0FBQ2pDLFFBQU0sVUFBVSxLQUFLLFVBQVU7QUFDL0IsUUFBTSxXQUFXLEtBQUssV0FBVztBQUNqQyxRQUFNLFlBQVksS0FBSztBQUV2QixzQkFBb0IsV0FBVyxZQUFZLGFBQWEsWUFBWSxXQUFXLFlBQVksV0FBVyxVQUFVLFNBQVMsVUFBVSxTQUFTO0FBQ2hKO0FBbkJnQjtBQW9CaEIsUUFBUSxnQkFBZ0IsWUFBWTtBQUU3QixTQUFTLGVBQWUsV0FBbUIsTUFBTTtBQUNwRCxNQUFJLENBQUM7QUFBTSxXQUFPLFFBQVEsS0FBSyxxQ0FBcUM7QUFFcEUsUUFBTSxRQUFRLEtBQUs7QUFFbkIsTUFBSSxVQUFVLElBQUk7QUFDZCxtQkFBZSxXQUFXLEtBQUssS0FBSztBQUNwQztBQUFBLEVBQ0o7QUFFQSxRQUFNLFFBQVEsS0FBSztBQUduQixNQUFJLEtBQUssT0FBTyxhQUFhO0FBQ3pCLG1CQUFlLFdBQVcsS0FBSyxXQUFXLEtBQUssYUFBYTtBQUM1RDtBQUFBLEVBQ0o7QUFFQSxvQkFBa0IsV0FBVyxPQUFPLE9BQU8sS0FBSyxpQkFBaUIsQ0FBRztBQUNwRSx5QkFBdUIsV0FBVyxPQUFPLEdBQUcsS0FBSyxZQUFZLEtBQUssV0FBVztBQUNqRjtBQXBCZ0I7QUFxQmhCLFFBQVEsa0JBQWtCLGNBQWM7QUFHakMsU0FBUyxhQUFhLE1BQU07QUFDL0IsUUFBTSxZQUFZLEtBQUs7QUFDdkIsUUFBTSxRQUFRLEtBQUs7QUFFbkIsYUFBVyxDQUFDLFlBQVksVUFBVSxLQUFLLE9BQU8sUUFBUSxlQUFjLEdBQUc7QUFDbkUsVUFBTSxhQUFhLFdBQVc7QUFDOUIsVUFBTSxRQUFRLFdBQVc7QUFFekIsUUFBSSxlQUFlLGNBQWMsVUFBVSxVQUFVLEdBQUc7QUFDcEQsWUFBTSxrQkFBa0Isd0JBQXdCLEtBQUssS0FBSztBQUMxRCxVQUFJLG9CQUFvQixVQUFVLFVBQVUsRUFBRSxPQUFPO0FBQ2pELGlDQUF5QixLQUFLLE9BQU8sVUFBVSxVQUFVLEVBQUUsT0FBTyxHQUFHLENBQUM7QUFBQSxNQUMxRTtBQUFBLElBQ0osV0FBVyxlQUFlLFVBQVUsTUFBTSxVQUFVLEdBQUc7QUFDbkQsWUFBTSxjQUFjLGdCQUFnQixLQUFLLEtBQUs7QUFDOUMsVUFBSSxnQkFBZ0IsTUFBTSxVQUFVLEVBQUUsT0FBTztBQUN6Qyx3QkFBZ0IsS0FBSyxPQUFPLE1BQU0sVUFBVSxFQUFFLE9BQU8sR0FBRyxLQUFLO0FBQUEsTUFDakU7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKO0FBcEJnQjtBQXFCaEIsUUFBUSxpQkFBaUIsYUFBYTtBQUUvQixTQUFTLGNBQWMsV0FBbUIsTUFBZ0I7QUFDN0QsTUFBSSxDQUFDO0FBQU0sV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBRW5FLFFBQU0sWUFBWSxLQUFLO0FBQ3ZCLFFBQU0sUUFBUSxLQUFLO0FBQ25CLFFBQU0sY0FBYyxLQUFLO0FBQ3pCLGFBQVcsTUFBTSxXQUFXO0FBQ3hCLFVBQU0sV0FBVyxVQUFVLEVBQUU7QUFDN0IsZ0JBQVksV0FBVyxRQUFRO0FBQUEsRUFDbkM7QUFFQSxhQUFXLE1BQU0sT0FBTztBQUNwQixVQUFNLE9BQU8sTUFBTSxFQUFFO0FBQ3JCLFlBQVEsV0FBVyxJQUFJO0FBQUEsRUFDM0I7QUFFQSxhQUFXLE1BQU0sYUFBYTtBQUMxQixVQUFNLFVBQVUsWUFBWSxFQUFFO0FBQzlCLG1CQUFlLFdBQVcsT0FBTztBQUFBLEVBQ3JDO0FBQ0o7QUFwQmdCO0FBcUJoQixRQUFRLGlCQUFpQixhQUFhO0FBRS9CLElBQU0sYUFBYSw4QkFBTyxXQUFtQixTQUFnQjtBQUNoRSxNQUFJLENBQUM7QUFBTSxXQUFPLFFBQVEsS0FBSyxpQ0FBaUM7QUFFaEUsTUFBSSxDQUFDO0FBQVcsV0FBTyxRQUFRLEtBQUssc0NBQXNDO0FBRTFFLGNBQVksTUFBTSxTQUFTLFdBQVcsSUFBSTtBQUUxQyxRQUFNLGdCQUFnQixLQUFLO0FBQzNCLFFBQU0sWUFBWSxLQUFLO0FBRXZCLE1BQUk7QUFBVyxpQkFBYSxXQUFXLFNBQVM7QUFFaEQsTUFBSTtBQUFlLG9CQUFnQixXQUFXLGFBQWE7QUFDL0QsR0FiMEI7QUFjMUIsUUFBUSxjQUFjLFVBQVU7QUFFekIsU0FBUyxjQUFjLFdBQW1CLE1BQWlCO0FBQzlELE1BQUksQ0FBQztBQUFNLFdBQU8sUUFBUSxLQUFLLG9DQUFvQztBQUVuRSxnQ0FBOEIsU0FBUztBQUV2QyxXQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxLQUFLO0FBQ2xDLFVBQU0sYUFBYSxLQUFLLENBQUMsRUFBRTtBQUMzQixRQUFJLFlBQVk7QUFDWixZQUFNLGFBQWEsV0FBVyxXQUFXLEdBQUc7QUFDNUMsWUFBTSxTQUFTLFdBQVc7QUFDMUIsaUNBQTJCLFdBQVcsWUFBWSxNQUFNO0FBQUEsSUFDNUQ7QUFBQSxFQUNKO0FBQ0o7QUFiZ0I7QUFjaEIsUUFBUSxpQkFBaUIsYUFBYTtBQUUvQixTQUFTLGlCQUFpQixXQUFtQixNQUFrQjtBQUNsRSxNQUFJLENBQUM7QUFBTSxXQUFPLFFBQVEsS0FBSyx1Q0FBdUM7QUFFdEUsUUFBTSxRQUFRLEtBQUs7QUFDbkIsUUFBTSxZQUFZLEtBQUs7QUFDdkIsa0JBQWdCLFdBQVcsT0FBTyxTQUFTO0FBQy9DO0FBTmdCO0FBT2hCLFFBQVEsb0JBQW9CLGdCQUFnQjtBQUU1QyxlQUFzQixpQkFBaUIsV0FBbUIsTUFBbUI7QUFDekUsTUFBSSxDQUFDO0FBQU0sV0FBTyxRQUFRLEtBQUssdUNBQXVDO0FBRXRFLE1BQUksYUFBYSxTQUFTLEdBQUc7QUFDekIsMkJBQXVCLElBQUk7QUFDM0I7QUFBQSxFQUNKO0FBQ0EsUUFBTSxXQUFXLFdBQVcsSUFBSTtBQUNoQyxnQkFBYyxXQUFXLElBQUk7QUFDN0IsbUJBQWlCLFdBQVcsS0FBSyxTQUFTO0FBQzFDLGdCQUFjLFdBQVcsS0FBSyxPQUFPO0FBQ3pDO0FBWHNCO0FBWXRCLFFBQVEsb0JBQW9CLGdCQUFnQjtBQUU1QyxlQUFzQix1QkFBdUIsTUFBbUI7QUFDNUQsTUFBSSxDQUFDO0FBQU0sV0FBTyxRQUFRLEtBQUssNkNBQTZDO0FBRTVFLFlBQVUsWUFBWSxDQUFDO0FBQ3ZCLFFBQU0sV0FBVyxLQUFLLElBQUk7QUFFMUIsWUFBVSxZQUFZLENBQUM7QUFDdkIsZ0JBQWMsS0FBSyxJQUFJO0FBQ3ZCLG1CQUFpQixLQUFLLEtBQUssU0FBUztBQUNwQyxnQkFBYyxLQUFLLEtBQUssT0FBTztBQUNuQztBQVZzQjtBQVl0QixRQUFRLGlCQUFpQixhQUFhO0FBQ3RDLFFBQVEsY0FBYyxVQUFVO0FBQ2hDLFFBQVEsaUJBQWlCLGFBQWE7QUFDdEMsUUFBUSxvQkFBb0IsZ0JBQWdCOzs7QUNoUDVDLHNEQUFvQyxPQUFPLFlBQXlCLE9BQWlCO0FBQ3BGLFFBQU0sdUJBQXVCLFVBQVU7QUFDdkMsWUFBVTtBQUNWLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCxrREFBa0MsT0FBTyxZQUF5QixPQUFpQjtBQUNsRixlQUFhLFVBQVU7QUFFdkIsUUFBTSxNQUFNLEdBQUc7QUFFZixRQUFNLGdCQUFnQixNQUFNLGNBQWMsR0FBRztBQUM3QyxnQkFBYyxVQUFVLFdBQVcsV0FBVztBQUM5Qyx3QkFBc0IsdUNBQXVDLGVBQWUsR0FBRyxhQUFhO0FBRTVGLGdCQUFjLEtBQUssY0FBYyxPQUFPO0FBRXhDLFlBQVU7QUFDVixLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsMERBQXNDLE9BQU8sT0FBZSxPQUFpQjtBQUM1RSxRQUFNLE9BQU8sV0FBVyxLQUFLO0FBQzdCLE1BQUksQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLENBQUMsYUFBYSxJQUFJLEdBQUc7QUFDbkQsV0FBTyxHQUFHLENBQUM7QUFBQSxFQUNaO0FBR0EsUUFBTSxTQUFTLE1BQU0sU0FBUyxLQUFLLElBQUk7QUFFcEMsWUFBVSxNQUFNO0FBRW5CLFFBQU0sYUFBYSxNQUFNLGNBQWMsR0FBRztBQUUxQyxhQUFXLFVBQVUsQ0FBQztBQUV0QixnQkFBYyxLQUFLLENBQUMsQ0FBQztBQUVyQixLQUFHLFVBQVU7QUFDZCxDQUFDO0FBRUQsd0VBQTZDLE9BQU8sR0FBUSxPQUFpQjtBQUM1RSxRQUFNLFVBQVUsY0FBYztBQUU5QixLQUFHLE9BQU87QUFDWCxDQUFDO0FBRUQsMEVBQThDLE9BQU8sTUFBYyxPQUFpQjtBQUNuRixpQkFBZSxLQUFLLElBQUk7QUFDeEIsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELHNFQUE0QyxPQUFPLE1BQWMsT0FBaUI7QUFDakYsaUJBQWUsS0FBSyxJQUFJO0FBQ3hCLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCxrRUFBMEMsT0FBTyxNQUFjLE9BQWlCO0FBQy9FLGVBQWEsS0FBSyxJQUFJO0FBQ3RCLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCw4REFBd0MsT0FBTyxNQUFpQixPQUFpQjtBQUNoRixnQkFBYyxLQUFLLElBQUk7QUFDdkIsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELHdEQUFxQyxPQUFPLE1BQWMsT0FBaUI7QUFDMUUsTUFBSSxVQUFVLFFBQVEsS0FBSyxJQUFJO0FBQy9CLEtBQUcsT0FBTztBQUNYLENBQUM7QUFFRCxnRUFBeUMsT0FBTyxNQUFjLE9BQWlCO0FBQzlFLE1BQUksVUFBVSxZQUFZLEtBQUssSUFBSTtBQUNuQyxLQUFHLE9BQU87QUFDWCxDQUFDO0FBRUQ7QUFBQTtBQUFBLEVBQXdDLE9BQU8sTUFBbUIsT0FBaUI7QUFDbEYsVUFBTSxPQUFPLGdCQUFlLEtBQUssSUFBSTtBQUNyQyxRQUFJLENBQUM7QUFBTSxhQUFPLEdBQUcsS0FBSztBQUUxQixVQUFNLFVBQVUsS0FBSztBQUNyQixVQUFNLE9BQU8sS0FBSztBQUNsQixVQUFNLFFBQVEsS0FBSztBQUNuQixVQUFNLE9BQU8sS0FBSztBQUNsQixVQUFNLFdBQVcsS0FBSztBQUV0QixRQUFJLENBQUM7QUFBUyxhQUFPLEdBQUcsS0FBSztBQUU3QixRQUFJLFNBQVMsUUFBUTtBQUNwQixZQUFNLGNBQWMsZ0JBQWdCLEtBQUssS0FBSztBQUU5QyxVQUFJLGdCQUFnQixJQUFJO0FBQ3ZCLGdCQUFRLEtBQUssT0FBTztBQUNwQixXQUFHLEtBQUs7QUFDUjtBQUFBLE1BQ0QsT0FBTztBQUNOLHFCQUFhLEtBQUssS0FBSztBQUN2QixXQUFHLElBQUk7QUFDUDtBQUFBLE1BQ0Q7QUFBQSxJQUNELFdBQVcsU0FBUyxZQUFZO0FBQy9CLFlBQU0sa0JBQWtCLHdCQUF3QixLQUFLLEtBQUs7QUFFMUQsVUFBSSxRQUFRLFVBQVUsS0FBSyxLQUFLO0FBQy9CLFdBQUcsS0FBSztBQUNSO0FBQUEsTUFDRDtBQUVBLFVBQUksUUFBUSxVQUFVLGlCQUFpQjtBQUN0QyxpQ0FBeUIsS0FBSyxPQUFPLEtBQUssS0FBSyxHQUFHLENBQUM7QUFDbkQsWUFBSSxNQUFNO0FBQ1QsbUJBQVEsSUFBRSxHQUFHLElBQUksS0FBSyxXQUFXLFFBQVEsS0FBSztBQUM3QyxrQkFBTSxXQUFXLEtBQUssVUFBVSxDQUFDO0FBQ2pDLHFDQUF5QixLQUFLLFNBQVMsV0FBVyxTQUFTLFNBQVMsU0FBUyxTQUFTLENBQUM7QUFBQSxVQUN4RjtBQUFBLFFBQ0Q7QUFDQSxXQUFHLElBQUk7QUFDUDtBQUFBLE1BQ0QsT0FBTztBQUNOLG9CQUFZLEtBQUssT0FBTztBQUN4QixpQkFBUSxJQUFFLEdBQUcsSUFBSSxVQUFVLFFBQVEsS0FBSztBQUN2QyxzQkFBWSxLQUFLLFNBQVMsQ0FBQyxDQUFDO0FBQUEsUUFDN0I7QUFDQSxXQUFHLEtBQUs7QUFDUjtBQUFBLE1BQ0Q7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUNBO0FBRUEsOERBQXdDLE9BQU8sTUFBVyxPQUFpQjtBQUMxRSxRQUFNLFNBQVMsTUFBTSxzQkFBc0IsbUNBQW1DLElBQUk7QUFDbEYsS0FBRyxNQUFNO0FBQ1YsQ0FBQztBQUVELGtFQUEwQyxPQUFPLEVBQUMsR0FBRSxHQUFHLE9BQWlCO0FBQ3ZFLFFBQU0sU0FBUyxNQUFNLHNCQUFzQixxQ0FBcUMsRUFBRTtBQUNsRixLQUFHLE1BQU07QUFDVixDQUFDO0FBRUQsa0VBQTBDLE9BQU8sTUFBVyxPQUFpQjtBQUM1RSxRQUFNLFNBQVMsTUFBTSxzQkFBc0IscUNBQXFDLElBQUk7QUFDcEYsS0FBRyxNQUFNO0FBQ1YsQ0FBQztBQUVELDREQUF1QyxPQUFPLFFBQXFCLE9BQWlCO0FBQ25GLGdCQUFjLEtBQUssTUFBTTtBQUN6QixLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsa0VBQTBDLE9BQU8sRUFBRSxJQUFJLFdBQVcsR0FBRyxPQUFpQjtBQUNyRixRQUFNLGVBQWUsZUFBZTtBQUNwQyxRQUFNLFNBQVMsTUFBTSxzQkFBc0IscUNBQXFDLGNBQWMsSUFBSSxVQUFVO0FBQzVHLEtBQUcsTUFBTTtBQUNWLENBQUM7QUFFRCxnRUFBeUMsT0FBTyxFQUFFLEdBQUcsR0FBRyxPQUFpQjtBQUN4RSxRQUFNLFNBQVMsTUFBTSxzQkFBc0Isb0NBQW9DLEVBQUU7QUFDakYsS0FBRyxNQUFNO0FBQ1YsQ0FBQztBQUVELDhEQUF3QyxPQUFPLE1BQTRDLE9BQWlCO0FBQzNHLFFBQU0sU0FBUyxNQUFNLHNCQUFzQixtQ0FBbUMsSUFBSTtBQUNsRixLQUFHLE1BQU07QUFDVixDQUFDO0FBRUQsTUFBTSxxQ0FBcUMsQ0FBQyxXQUF3QjtBQUNuRSxnQkFBYyxLQUFLLE1BQU07QUFDMUIsQ0FBQzs7O0FDckxELElBQU0sU0FBUyxRQUFRO0FBQ3ZCLElBQUksU0FBUztBQUNiLElBQUksT0FBTztBQUVYLElBQUksaUJBQWlCO0FBQ3JCLElBQUksVUFBVTtBQUVkLGVBQXNCLFNBQVMsTUFBaUQsV0FBb0IsT0FBTztBQUN2RyxNQUFJLFNBQVMsUUFBUSxNQUFNO0FBQ3ZCO0FBQUEsRUFDSjtBQUVBLE1BQUksWUFBWSxZQUFZO0FBQzVCLFFBQU0sY0FBYyxPQUFPLE1BQU07QUFFakMsUUFBTSxXQUFXLE9BQU8sU0FBUztBQUVqQyxRQUFNLE9BQU8sV0FBVyxPQUFPLEtBQUs7QUFFcEMsUUFBTSxPQUFPLFlBQVksSUFBSTtBQUM3QixNQUFJLENBQUM7QUFBTTtBQUVYLFlBQVUsU0FBUztBQUVuQixRQUFNLGVBQWUsZUFBZTtBQUNwQyxRQUFNLE9BQU8sS0FBSztBQUNsQixNQUFJLFlBQVksV0FBVyxRQUFRLEtBQUs7QUFFeEMsV0FBUyxhQUFhLFNBQVM7QUFFL0IsTUFBSSxVQUFVLENBQUM7QUFFZixRQUFNLGVBQWUsS0FBSyxTQUFTLFNBQVM7QUFDNUMsTUFBSTtBQUFjLGNBQVUsTUFBTSxzQkFBZ0MsbUNBQW1DLFlBQVk7QUFFakgsTUFBSSxTQUFTLENBQUM7QUFFZCxRQUFNLGlCQUFpQixLQUFLLFNBQVMsVUFBVTtBQUMvQyxNQUFJLGdCQUFnQjtBQUNoQixhQUFTLE9BQU8sT0FBTztBQUFBLEVBQzNCO0FBRUEsUUFBTSxlQUFlLEtBQUssU0FBUyxTQUFTO0FBQzVDLE1BQUk7QUFDSixNQUFJLGNBQWM7QUFDZCxjQUFVLGNBQWM7QUFBQSxFQUM1QjtBQUVBLFFBQU0sWUFBWSxhQUFhLElBQUk7QUFFbkMsTUFBSSxVQUFVO0FBQ1YsVUFBTSxRQUFRLFdBQVcscUJBQXFCLENBQUM7QUFDL0MsZ0JBQVksTUFBTSxTQUFTLFdBQVcsS0FBSztBQUMzQyxZQUFRLHVDQUF1QztBQUMvQyxjQUFVLElBQUksUUFBUSxhQUFXO0FBQzdCLHVCQUFpQjtBQUFBLElBQ3JCLENBQUM7QUFFRCxjQUFVLFNBQVM7QUFBQSxFQUN2QjtBQUVBLFFBQU0sYUFBYSxNQUFNLGNBQWMsU0FBUztBQUVoRCxjQUFZO0FBRVosNkNBQXdCO0FBQUEsSUFDcEI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBLEtBQUssV0FBVztBQUFBLElBQ2hCLFFBQVEsTUFBTSxjQUFjLFFBQVE7QUFBQSxFQUN4QyxDQUFDO0FBRUQsY0FBWSxNQUFNLElBQUk7QUFDdEIsbURBQTJCLElBQUk7QUFFL0IsU0FBTztBQUVQLFVBQVEsY0FBYyxRQUFRLElBQUk7QUFFbEMsTUFBSSxTQUFTO0FBQ1QsVUFBTTtBQUNOLFlBQVEseUNBQXlDO0FBQUEsRUFDckQ7QUFFQSxZQUFVO0FBQ1YsbUJBQWlCO0FBQ2pCLFNBQU87QUFDWDtBQXJGc0I7QUFzRnRCLFFBQVEsWUFBWSxRQUFRO0FBRTVCLGdCQUFnQixjQUFjLE9BQU8sR0FBRyxTQUFtQjtBQUN2RCxRQUFNLE9BQU8sS0FBSyxDQUFDO0FBQ25CLE1BQUksQ0FBQyxNQUFNO0FBQ1AsWUFBUSxjQUFjLGdCQUFnQjtBQUFBLEVBQzFDLE9BQU87QUFDSCxVQUFNLE9BQU8sS0FBSyxZQUFZO0FBQzlCLGFBQVMsSUFBSTtBQUFBLEVBQ2pCO0FBQ0osR0FBRyxJQUFJO0FBR1AsU0FBUyxhQUFhLE1BQWdDO0FBQ2xELFFBQU0sRUFBQyxZQUFZLEtBQUksSUFBSSxPQUFPLFVBQVU7QUFFNUMsTUFBSSxPQUFPLFNBQVM7QUFBVSxXQUFPO0FBRXJDLE1BQUksQ0FBQztBQUFZLFdBQU87QUFFeEIsTUFBSSxZQUFZLEVBQUMsR0FBRyxLQUFJO0FBRXhCLFFBQU0sYUFBYSxjQUFjO0FBR2pDLGFBQVcsUUFBUSxZQUFZO0FBQzNCLFVBQU0sU0FBUyxXQUFXLElBQUk7QUFDOUIsZUFBVyxTQUFTLFFBQVE7QUFFeEIsVUFBSSxPQUFnQjtBQUVwQixVQUFJLFFBQVEsVUFBVSxLQUFLLE1BQU07QUFDN0IsZUFBTyxLQUFLLEtBQUssU0FBUyxXQUFXLElBQUksSUFBSTtBQUFBLE1BQ2pEO0FBRUEsVUFBSSxRQUFRLFdBQVcsS0FBSyxPQUFPO0FBQy9CLGVBQU8sS0FBSyxNQUFNLFNBQVMsV0FBVyxLQUFLLElBQUk7QUFBQSxNQUNuRDtBQUVBLFVBQUksQ0FBQyxNQUFNO0FBQ1AsY0FBTSxpQkFBaUIsT0FBTyxLQUFLO0FBQ25DLG9CQUFZLE9BQU8sT0FBTyxDQUFDLEdBQUcsV0FBVyxnQkFBZ0I7QUFBQSxVQUN2RCxXQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsVUFBVSxXQUFXLGVBQWUsU0FBUztBQUFBLFFBQzVFLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxTQUFPO0FBR1g7QUF0Q1M7QUF3Q0YsU0FBUyxZQUFZO0FBQ3hCLGVBQWEsS0FBSyxNQUFNO0FBRXhCLGFBQVc7QUFDWCxjQUFZLE9BQU8sS0FBSztBQUN4QixtREFBMkIsS0FBSztBQUdoQyxVQUFRLGNBQWMsUUFBUSxLQUFLO0FBRW5DLE1BQUksZ0JBQWdCO0FBQ2hCLG1CQUFlO0FBQUEsRUFDbkI7QUFDQSxTQUFPO0FBQ1g7QUFkZ0I7OztBQ3RKVCxTQUFTLFdBQVc7QUFDdkIsUUFBTSx5Q0FBeUMsT0FBTyxZQUF5QkMsU0FBZ0I7QUFDM0YsVUFBTSxpQkFBaUJBLE1BQUssVUFBVTtBQUFBLEVBQzFDLENBQUM7QUFFRCxRQUFNLDBDQUEwQyxNQUFNO0FBQ2xELFlBQVEsY0FBYyxnQkFBZ0I7QUFBQSxFQUMxQyxDQUFDO0FBRUQsUUFBTSxxQ0FBcUMsTUFBTTtBQUM3QyxhQUFTLEVBQUUsTUFBTSxXQUFXLFFBQVEsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUFBLEVBQ3RELENBQUM7QUFDTDtBQVpnQjs7O0FDQVQsU0FBUyxZQUFZO0FBQ3hCLE1BQUksYUFBYTtBQUVqQixLQUFHLDRCQUE0QixNQUFNO0FBQ2pDLGlCQUFhO0FBQUEsRUFDakIsQ0FBQztBQUVELEtBQUcsNkJBQTZCLE1BQU07QUFDbEMsUUFBRztBQUNDLGNBQVEsY0FBYyxnQkFBZ0I7QUFBQSxFQUM5QyxDQUFDO0FBRUQsUUFBTSx5QkFBeUIsT0FBTyxZQUF5QkMsU0FBZ0I7QUFDM0UsUUFBSSxDQUFDLFdBQVc7QUFBTyxpQkFBVyxRQUFRLFdBQVcsa0JBQWtCO0FBQ3ZFLFVBQU0saUJBQWlCQSxNQUFLLFVBQVU7QUFBQSxFQUMxQyxDQUFDO0FBRUQsUUFBTSx1QkFBdUIsT0FBTyxPQUFZO0FBQzVDLFVBQU0sY0FBYyxNQUFNLGVBQWU7QUFDekMsVUFBTSxhQUFhLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQzdHLE9BQUcsVUFBVTtBQUFBLEVBQ2pCLENBQUM7QUFFRCxRQUFNLHdCQUF3QixPQUFPLFlBQXlCLE9BQVk7QUFDdEUsVUFBTSx1QkFBdUIsVUFBVTtBQUN2QyxRQUFJO0FBQUksU0FBRztBQUFBLEVBQ2YsQ0FBQztBQUVELFFBQU0sNkJBQTZCLE9BQU8sYUFBa0I7QUFDeEQsWUFBUSxjQUFjLGdCQUFnQixRQUFRO0FBQUEsRUFDbEQsQ0FBQztBQUNMO0FBL0JnQjs7O0FDQ2hCLFNBQVMsY0FBYyxNQUFjLElBQVM7QUFDMUMsS0FBRyxzQ0FBc0MsTUFBTSxDQUFDLFVBQWU7QUFDM0QsVUFBTSxFQUFFO0FBQUEsRUFDWixDQUFDO0FBQ0w7QUFKUztBQU1GLFNBQVMsaUJBQWlCO0FBQzdCLGdCQUFjLDRCQUE0QixNQUFNO0FBQzVDLFlBQVEsY0FBYyxnQkFBZ0I7QUFBQSxFQUMxQyxDQUFDO0FBRUQsZ0JBQWMsZUFBZSxDQUFDQyxTQUFnQjtBQUMxQyxXQUFPLGVBQWVBLElBQUc7QUFBQSxFQUM3QixDQUFDO0FBRUQsZ0JBQWMsb0JBQW9CLENBQUNBLFNBQWdCO0FBQy9DLFVBQU0sWUFBaUIsYUFBYUEsSUFBRyxFQUFFLENBQUM7QUFDMUMsUUFBSSxjQUFjLENBQUM7QUFDbkIsZUFBVyxNQUFNLFdBQVc7QUFDeEIsWUFBTSxXQUFXLFVBQVUsRUFBRTtBQUM3QixrQkFBWSxLQUFLO0FBQUEsUUFDYixjQUFjLFNBQVM7QUFBQSxRQUN2QixVQUFVLFNBQVM7QUFBQSxRQUNuQixTQUFTLFNBQVM7QUFBQSxNQUN0QixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0osQ0FBQztBQUVELGdCQUFjLGVBQWUsQ0FBQ0EsU0FBZ0I7QUFDMUMsVUFBTSxRQUFjLFNBQVNBLElBQUcsRUFBRSxDQUFDO0FBQ25DLFFBQUksV0FBVyxDQUFDO0FBQ2hCLGVBQVcsTUFBTSxPQUFPO0FBQ3BCLFlBQU0sT0FBTyxNQUFNLEVBQUU7QUFDckIsZUFBUyxLQUFLO0FBQUEsUUFDVixTQUFTLEtBQUs7QUFBQSxRQUNkLFVBQVUsS0FBSztBQUFBLFFBQ2YsU0FBUyxLQUFLO0FBQUEsTUFDbEIsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKLENBQUM7QUFFRCxnQkFBYyxtQkFBbUIsQ0FBQ0EsU0FBZ0I7QUFDOUMsV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBQUEsRUFFNUQsQ0FBQztBQUVELGdCQUFjLHNCQUFzQixDQUFDQSxTQUFnQjtBQUNqRCxXQUFPLFFBQVEsS0FBSyxvQ0FBb0M7QUFBQSxFQUU1RCxDQUFDO0FBRUQsZ0JBQWMsc0JBQXNCLENBQUNBLFNBQWdCO0FBQ2pELFdBQU8sUUFBUSxLQUFLLG9DQUFvQztBQUFBLEVBRTVELENBQUM7QUFFRCxnQkFBYyxjQUFjLENBQUNBLFNBQWdCO0FBRXpDLFdBQU8sUUFBUSxLQUFLLG9DQUFvQztBQUFBLEVBQzVELENBQUM7QUFFRCxnQkFBYyxvQkFBb0IsQ0FBQ0EsU0FBZ0I7QUFDL0MsV0FBTyxjQUFjQSxJQUFHO0FBQUEsRUFDNUIsQ0FBQztBQUVELGdCQUFjLGtCQUFrQixDQUFDLFVBQWtCO0FBQy9DLGNBQVUsWUFBWSxDQUFDO0FBQ3ZCLGFBQVMsS0FBSyxLQUFLO0FBQUEsRUFDdkIsQ0FBQztBQUVELGdCQUFjLG1CQUFtQixDQUFDQSxNQUFhLFVBQWU7QUFFMUQsV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBQUEsRUFDNUQsQ0FBQztBQUVELGdCQUFjLHNCQUFzQixNQUFNO0FBQ3RDLFdBQU8sUUFBUSxLQUFLLG9DQUFvQztBQUFBLEVBQzVELENBQUM7QUFFRCxnQkFBYyxzQkFBc0IsQ0FBQ0EsTUFBYSxZQUFpQjtBQUUvRCxXQUFPLFFBQVEsS0FBSyxvQ0FBb0M7QUFBQSxFQUM1RCxDQUFDO0FBRUQsZ0JBQWMsY0FBYyxPQUFPQSxNQUFhLE1BQVcsV0FBZ0I7QUFFdkUsV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBQUEsRUFDNUQsQ0FBQztBQUVELGdCQUFjLGtCQUFrQixNQUFNO0FBQ2xDLFdBQU8sUUFBUSxLQUFLLG9DQUFvQztBQUFBLEVBQzVELENBQUM7QUFFRCxnQkFBYyxtQkFBbUIsQ0FBQ0EsTUFBYSxhQUFrQjtBQUM3RCxVQUFNLGNBQWM7QUFBQSxNQUNoQixPQUFPLFNBQVM7QUFBQSxNQUNoQixPQUFPLFNBQVM7QUFBQSxNQUNoQixTQUFTLFNBQVM7QUFBQSxJQUN0QjtBQUNBLGdCQUFZQSxNQUFLLFdBQVc7QUFBQSxFQUNoQyxDQUFDO0FBRUQsZ0JBQWMsb0JBQW9CLENBQUNBLE1BQWEsZUFBb0I7QUFDaEUsZUFBVyxhQUFhLFlBQVk7QUFDaEMsWUFBTSxjQUFjO0FBQUEsUUFDaEIsT0FBTyxVQUFVO0FBQUEsUUFDakIsT0FBTyxVQUFVO0FBQUEsUUFDakIsU0FBUyxVQUFVO0FBQUEsTUFDdkI7QUFDQSxrQkFBWUEsTUFBSyxXQUFXO0FBQUEsSUFDaEM7QUFBQSxFQUNKLENBQUM7QUFFRCxnQkFBYyxjQUFjLENBQUNBLE1BQWEsU0FBYztBQUNwRCxVQUFNLFVBQVU7QUFBQSxNQUNaLE9BQU8sS0FBSztBQUFBLE1BQ1osT0FBTyxLQUFLO0FBQUEsTUFDWixTQUFTLEtBQUs7QUFBQSxJQUNsQjtBQUNBLFlBQVFBLE1BQUssT0FBTztBQUFBLEVBQ3hCLENBQUM7QUFFRCxnQkFBYyxlQUFlLENBQUNBLE1BQWEsVUFBZTtBQUN0RCxlQUFXLFFBQVEsT0FBTztBQUN0QixZQUFNLFVBQVU7QUFBQSxRQUNaLE9BQU8sS0FBSztBQUFBLFFBQ1osT0FBTyxLQUFLO0FBQUEsUUFDWixTQUFTLEtBQUs7QUFBQSxNQUNsQjtBQUNBLGNBQVFBLE1BQUssT0FBTztBQUFBLElBQ3hCO0FBQUEsRUFDSixDQUFDO0FBTUQsZ0JBQWMsb0JBQW9CLENBQUNBLE1BQWEsZUFBNEI7QUFDeEUscUJBQWlCQSxNQUFLLFVBQVU7QUFBQSxFQUNwQyxDQUFDO0FBRUQsZ0JBQWMsaUJBQWlCLENBQUNBLE1BQWEsWUFBdUI7QUFDaEUsa0JBQWNBLE1BQUssT0FBTztBQUFBLEVBQzlCLENBQUM7QUFDTDtBQTFJZ0I7OztBQ0poQixRQUFRLDBCQUEwQixPQUFPLGVBQXFDO0FBQzFFLE1BQUk7QUFFSixNQUFJLENBQUMsY0FBYyxPQUFPLGVBQWUsVUFBVTtBQUMvQyxVQUFNLGNBQXNCLGNBQWMsTUFBTSxlQUFlO0FBQy9ELHlCQUFxQixNQUFNLHNCQUFtQyxzQ0FBc0MsV0FBVztBQUFBLEVBQ25ILFdBQVcsT0FBTyxlQUFlO0FBQVUseUJBQXFCO0FBRWhFLE1BQUksQ0FBQyxvQkFBb0I7QUFDckIsVUFBTSxJQUFJLE1BQU0sMkJBQTJCO0FBQUEsRUFDL0M7QUFFQSxRQUFNLHVCQUF1QixrQkFBa0I7QUFDbkQsQ0FBQztBQUVELFFBQVEsMEJBQTBCLE9BQU8sZ0JBQXdCO0FBQzdELGdCQUFjLGVBQWUsTUFBTSxlQUFlO0FBQ2xELFNBQU8sTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFDckcsQ0FBQztBQUVELFFBQVEsbUJBQW1CLE9BQU8sT0FBa0I7QUFFaEQsUUFBTSxTQUFTLEVBQUUsTUFBTSxjQUFjLFFBQVEsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJO0FBQ2pFLE1BQUk7QUFBSSxPQUFHO0FBQ2YsQ0FBQztBQUVELEdBQUcsZ0NBQWdDLENBQUMsU0FBMEI7QUFDMUQsV0FBUyxJQUFJO0FBQ2pCLENBQUM7QUFFRCxNQUFNLGlDQUFpQyxZQUFZO0FBQy9DLFNBQU8sQ0FBQyxVQUFVLEtBQUssRUFBRSxhQUFhLEdBQUc7QUFDckMsVUFBTSxNQUFNLEdBQUc7QUFBQSxFQUNuQjtBQUNBLFFBQU0sY0FBYyxNQUFNLGVBQWU7QUFDekMsUUFBTSxhQUFhLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQzdHLE1BQUksQ0FBQztBQUFZO0FBQ2pCLFFBQU0sdUJBQXVCLFVBQVU7QUFDM0MsQ0FBQztBQUVELE1BQU0sbUJBQW1CLE9BQU8sYUFBcUI7QUFDakQsTUFBSSxhQUFhLHVCQUF1QixLQUFLLFVBQVUsS0FBSyxFQUFFLGFBQWEsR0FBRztBQUMxRSxVQUFNLGNBQWMsTUFBTSxlQUFlO0FBQ3pDLFVBQU0sYUFBYSxNQUFNLHNCQUFtQyxzQ0FBc0MsV0FBVztBQUM3RyxRQUFJLENBQUM7QUFBWTtBQUNqQixVQUFNLHVCQUF1QixVQUFVO0FBQUEsRUFDM0M7QUFDSixDQUFDO0FBRUQsSUFBTSxnQkFBZ0IsVUFBVSxhQUFhLE1BQU07QUFDbkQsSUFBTSxPQUFPLE9BQU8sVUFBVSxnQkFBZ0IsSUFBSSxDQUFDO0FBRW5ELElBQUksUUFBUSxRQUFRLFFBQVEsU0FBUyxpQkFBaUIsYUFBYSxLQUFLLFdBQVc7QUFDL0UsV0FBUztBQUNiLFdBQVcsUUFBUSxTQUFTLGlCQUFpQixhQUFhLEtBQUssV0FBVztBQUN0RSxZQUFVO0FBQ2Q7QUFFQSxlQUFlO0FBRWYsZ0JBQWdCLGNBQWMsWUFBWTtBQUN0QyxRQUFNLGNBQWMsTUFBTSxlQUFlO0FBQ3pDLFFBQU0sU0FBUyxnQkFBZ0IsR0FBRztBQUNsQyxRQUFNLFlBQVksbUJBQW1CLEdBQUc7QUFDeEMsUUFBTSxRQUFRLGFBQWEsR0FBRztBQUU5QixRQUFNLGFBQWEsTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFDN0csTUFBSSxDQUFDO0FBQVk7QUFDakIsUUFBTSx1QkFBdUIsVUFBVTtBQUV2QyxrQkFBZ0IsS0FBSyxTQUFTO0FBQzlCLFFBQU0sR0FBSTtBQUNWLGtCQUFnQixLQUFLLE1BQU07QUFDM0IsZUFBYSxLQUFLLEtBQUs7QUFDM0IsR0FBRyxLQUFLOyIsCiAgIm5hbWVzIjogWyJkZWxheSIsICJwZWQiLCAieCIsICJ5IiwgInoiLCAiY29uZmlnIiwgInBlZCIsICJwZWQiLCAicGVkIl0KfQo=
