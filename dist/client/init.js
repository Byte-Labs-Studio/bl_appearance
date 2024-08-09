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
  return getAppearance(ped || PlayerPedId());
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
var defMaleHash = GetHashKey("mp_m_freemode_01");
var setModel = /* @__PURE__ */ __name(async (pedHandle, data) => {
  let model = 0;
  if (data == null || data == void 0)
    return;
  const isString = typeof data === "string";
  const isNumber = typeof data === "number";
  const isJustModel = isString || isNumber;
  if (typeof data === "string") {
    model = GetHashKey(data);
  } else if (typeof data === "number") {
    model = data;
  } else {
    model = data.model;
  }
  if (model == null || model == void 0)
    return;
  const isPlayer = IsPedAPlayer(pedHandle);
  if (isPlayer) {
    model = model !== 0 ? model : defMaleHash;
    await requestModel(model);
    SetPlayerModel(PlayerId(), model);
    SetModelAsNoLongerNeeded(model);
    pedHandle = PlayerPedId();
  }
  SetPedDefaultComponentVariation(pedHandle);
  if (!isPedFreemodeModel(pedHandle))
    return;
  if (typeof data !== "string" && typeof data !== "number") {
    if (data.headBlend) {
      if (!isJustModel && Object.keys(data.headBlend).length > 0) {
        const headBlend = data.headBlend;
        setHeadBlend(pedHandle, headBlend);
        SetPedHeadBlendData(pedHandle, 0, 0, 0, 0, 0, 0, 0, 0, 0, false);
      }
    }
  }
  return pedHandle;
}, "setModel");
function SetFaceFeature(pedHandle, data) {
  SetPedFaceFeature(pedHandle, data.index, data.value + 0);
}
__name(SetFaceFeature, "SetFaceFeature");
var isPositive = /* @__PURE__ */ __name((val) => val >= 0 ? val : 0, "isPositive");
function setHeadBlend(pedHandle, data) {
  if (!isPedFreemodeModel(pedHandle))
    return;
  pedHandle = pedHandle || ped;
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
var setPedSkin = /* @__PURE__ */ __name(async (pedHandle, data) => {
  const headStructure = data.headStructure;
  const headBlend = data.headBlend;
  if (data) {
    pedHandle = await setModel(pedHandle, data);
  }
  if (headBlend)
    setHeadBlend(pedHandle, headBlend);
  if (headStructure)
    for (const feature in headStructure) {
      const value = headStructure[feature];
      SetFaceFeature(pedHandle, value);
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
  if (!data)
    return;
  const color = data.color;
  const highlight = data.highlight;
  SetPedHairColor(pedHandle, color, highlight);
}
__name(setPedHairColors, "setPedHairColors");
async function setPedAppearance(pedHandle, data) {
  if (IsPedAPlayer(pedHandle)) {
    setPlayerPedAppearance(data);
  }
  await setPedSkin(pedHandle, data);
  setPedClothes(pedHandle, data);
  setPedHairColors(pedHandle, data.hairColor);
  setPedTattoos(pedHandle, data.tattoos);
}
__name(setPedAppearance, "setPedAppearance");
async function setPlayerPedAppearance(data) {
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
  let pedHandle = PlayerPedId();
  const configMenus = config.menus();
  const type = zone.type;
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
    setModel(PlayerPedId(), model);
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
RegisterCommand("openMenu", async (_, args) => {
  const type = args[0];
  if (!type) {
    exports.bl_appearance.InitialCreation();
  } else {
    const zone = type.toLowerCase();
    openMenu({ type: zone, coords: [0, 0, 0, 0] });
  }
}, true);
exports("SetPedAppearance", async (ped2, appearance) => {
  await setPedAppearance(ped2, appearance);
});
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvcWIudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvZXN4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvY29tcGF0L2lsbGVuaXVtLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvaW5pdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCBwZWQgPSAwXHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlUGVkID0gKHBlZEhhbmRsZTogbnVtYmVyKSA9PiB7XHJcbiAgICBwZWQgPSBwZWRIYW5kbGVcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlYnVnZGF0YSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGEsIChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0sIDIpKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2VuZE5VSUV2ZW50ID0gKGFjdGlvbjogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcclxuICAgIFNlbmROVUlNZXNzYWdlKHtcclxuICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TW9kZWwgPSBhc3luYyAobW9kZWw6IHN0cmluZyB8IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiA9PiB7XHJcbiAgICBsZXQgbW9kZWxIYXNoOiBudW1iZXIgPSB0eXBlb2YgbW9kZWwgPT09ICdudW1iZXInID8gbW9kZWwgOiBHZXRIYXNoS2V5KG1vZGVsKVxyXG5cclxuICAgIGlmICghSXNNb2RlbFZhbGlkKG1vZGVsSGFzaCkgJiYgIUlzTW9kZWxJbkNkaW1hZ2UobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIC8vIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAvLyAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgLy8gICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgLy8gICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgLy8gfSlcclxuXHJcbiAgICAgICAgY29uc29sZS53YXJuKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9ibF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5OiBzdHJpbmcsIC4uLmFyZ3M6IGFueSkgPT4ge1xyXG4gICAgY29uc3QgcmVzb2x2ZSA9IGFjdGl2ZUV2ZW50c1trZXldO1xyXG4gICAgcmV0dXJuIHJlc29sdmUgJiYgcmVzb2x2ZSguLi5hcmdzKTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlclNlcnZlckNhbGxiYWNrPFQgPSB1bmtub3duPihcclxuICAgIGV2ZW50TmFtZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlcclxuKTogUHJvbWlzZTxUPiB8IHZvaWQge1xyXG4gICAgaWYgKCFldmVudFRpbWVyKGV2ZW50TmFtZSwgMCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGtleTogc3RyaW5nO1xyXG5cclxuICAgIGRvIHtcclxuICAgICAgICBrZXkgPSBgJHtldmVudE5hbWV9OiR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDEwMDAwMCArIDEpKX1gO1xyXG4gICAgfSB3aGlsZSAoYWN0aXZlRXZlbnRzW2tleV0pO1xyXG4gICAgZW1pdE5ldChgX2JsX2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvblNlcnZlckNhbGxiYWNrKGV2ZW50TmFtZSwgY2IpIHtcclxuICAgIG9uTmV0KGBfYmxfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlLCBrZXksIC4uLmFyZ3MpID0+IHtcclxuICAgICAgICBsZXQgcmVzcG9uc2U7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBjYiguLi5hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgaGFuZGxpbmcgY2FsbGJhY2sgZXZlbnQgJHtldmVudE5hbWV9YCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBeMyR7ZS5zdGFja31eMGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbWl0TmV0KGBfYmxfY2JfJHtyZXNvdXJjZX1gLCBrZXksIHJlc3BvbnNlKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vL2xvY2FsZVxyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RMb2NhbGUgPSAocmVzb3VyY2VTZXROYW1lOiBzdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNoZWNrUmVzb3VyY2VGaWxlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoUmVxdWVzdFJlc291cmNlRmlsZVNldChyZXNvdXJjZVNldE5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50TGFuID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmNvbmZpZygpLmxvY2FsZVxyXG4gICAgICAgICAgICAgICAgbGV0IGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvJHtjdXJyZW50TGFufS5qc29uYCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsZUZpbGVDb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtjdXJyZW50TGFufS5qc29uIG5vdCBmb3VuZCBpbiBsb2NhbGUsIHBsZWFzZSB2ZXJpZnkhLCB3ZSB1c2VkIGVuZ2xpc2ggZm9yIG5vdyFgKVxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvZW4uanNvbmApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGxvY2FsZUZpbGVDb250ZW50KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2hlY2tSZXNvdXJjZUZpbGUsIDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2hlY2tSZXNvdXJjZUZpbGUoKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbG9jYWxlID0gYXN5bmMgKGlkOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBjb25zdCBsb2NhbGUgPSBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKTtcclxuICAgIGxldCBhcmdJbmRleCA9IDA7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gbG9jYWxlW2lkXS5yZXBsYWNlKC8lcy9nLCAobWF0Y2g6IHN0cmluZykgPT4gYXJnSW5kZXggPCBhcmdzLmxlbmd0aCA/IGFyZ3NbYXJnSW5kZXhdIDogbWF0Y2gpO1xyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgYmxfYnJpZGdlID0gZXhwb3J0cy5ibF9icmlkZ2VcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRQbGF5ZXJEYXRhID0gKCkgPT4ge1xyXG4gICAgcmV0dXJuIGJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRGcmFtZXdvcmtJRCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGlkID0gZ2V0UGxheWVyRGF0YSgpLmNpZFxyXG4gICAgcmV0dXJuIGlkXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRQbGF5ZXJHZW5kZXJNb2RlbCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGdlbmRlciA9IGdldFBsYXllckRhdGEoKS5nZW5kZXJcclxuICAgIHJldHVybiBnZW5kZXIgPT09ICdtYWxlJyA/ICdtcF9tX2ZyZWVtb2RlXzAxJyA6ICdtcF9mX2ZyZWVtb2RlXzAxJ1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRGVsYXkobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICghc3RyLmluY2x1ZGVzKFwiJ1wiKSkgcmV0dXJuIHN0cjtcclxuICAgIHJldHVybiBzdHIucmVwbGFjZSgvJy9nLCBcIlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEpvYkluZm8oKTogeyBuYW1lOiBzdHJpbmcsIGlzQm9zczogYm9vbGVhbiB9IHwgbnVsbCB7XHJcbiAgICBjb25zdCBqb2IgPSBnZXRQbGF5ZXJEYXRhKCkuam9iXHJcbiAgICByZXR1cm4gam9iID8geyBuYW1lOiBqb2IubmFtZSwgaXNCb3NzOiBqb2IuaXNCb3NzIH0gOiBudWxsXHJcbn1cclxuXHJcbi8vIGxvY2FsIGZ1bmN0aW9uIGlzUGVkRnJlZW1vZGVNb2RlbChwZWQpXHJcbi8vICAgICBsb2NhbCBtb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZClcclxuLy8gICAgIHJldHVybiBtb2RlbCA9PSBgbXBfbV9mcmVlbW9kZV8wMWAgb3IgbW9kZWwgPT0gYG1wX2ZfZnJlZW1vZGVfMDFgXHJcbi8vIGVuZFxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzUGVkRnJlZW1vZGVNb2RlbChwZWQ6IG51bWJlcikge1xyXG4gICAgY29uc3QgbW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWQpXHJcbiAgICByZXR1cm4gbW9kZWwgPT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpIHx8IG1vZGVsID09PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKVxyXG59ICAgIiwgImltcG9ydCB7IENhbWVyYSwgVmVjdG9yMywgVENhbWVyYUJvbmVzIH0gZnJvbSAnQHR5cGluZ3MvY2FtZXJhJztcclxuaW1wb3J0IHsgZGVsYXksIHBlZCB9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IFJlY2VpdmUgfSBmcm9tICdAZXZlbnRzJztcclxuXHJcbmNvbnN0IFdIT0xFX0JPRFlfTUFYX0RJU1RBTkNFID0gMi4wO1xyXG5jb25zdCBERUZBVUxUX01BWF9ESVNUQU5DRSA9IDEuMDtcclxuXHJcbmxldCBydW5uaW5nOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBjYW1EaXN0YW5jZTogbnVtYmVyID0gMS44O1xyXG5sZXQgY2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGFuZ2xlWTogbnVtYmVyID0gMC4wO1xyXG5sZXQgYW5nbGVaOiBudW1iZXIgPSAwLjA7XHJcbmxldCB0YXJnZXRDb29yZHM6IFZlY3RvcjMgfCBudWxsID0gbnVsbDtcclxubGV0IG9sZENhbTogQ2FtZXJhIHwgbnVsbCA9IG51bGw7XHJcbmxldCBjaGFuZ2luZ0NhbTogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgbGFzdFg6IG51bWJlciA9IDA7XHJcbmxldCBjdXJyZW50Qm9uZToga2V5b2YgVENhbWVyYUJvbmVzID0gJ2hlYWQnO1xyXG5cclxuY29uc3QgQ2FtZXJhQm9uZXM6IFRDYW1lcmFCb25lcyA9IHtcclxuICAgIHdob2xlOiAwLFxyXG5cdGhlYWQ6IDMxMDg2LFxyXG5cdHRvcnNvOiAyNDgxOCxcclxuXHRsZWdzOiBbMTYzMzUsIDQ2MDc4XSxcclxuICAgIHNob2VzOiBbMTQyMDEsIDUyMzAxXSxcclxufTtcclxuXHJcbmNvbnN0IGNvcyA9IChkZWdyZWVzOiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG5cdHJldHVybiBNYXRoLmNvcygoZGVncmVlcyAqIE1hdGguUEkpIC8gMTgwKTtcclxufTtcclxuXHJcbmNvbnN0IHNpbiA9IChkZWdyZWVzOiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG5cdHJldHVybiBNYXRoLnNpbigoZGVncmVlcyAqIE1hdGguUEkpIC8gMTgwKTtcclxufTtcclxuXHJcbmNvbnN0IGdldEFuZ2xlcyA9ICgpOiBudW1iZXJbXSA9PiB7XHJcblx0Y29uc3QgeCA9XHJcblx0XHQoKGNvcyhhbmdsZVopICogY29zKGFuZ2xlWSkgKyBjb3MoYW5nbGVZKSAqIGNvcyhhbmdsZVopKSAvIDIpICpcclxuXHRcdGNhbURpc3RhbmNlO1xyXG5cdGNvbnN0IHkgPVxyXG5cdFx0KChzaW4oYW5nbGVaKSAqIGNvcyhhbmdsZVkpICsgY29zKGFuZ2xlWSkgKiBzaW4oYW5nbGVaKSkgLyAyKSAqXHJcblx0XHRjYW1EaXN0YW5jZTtcclxuXHRjb25zdCB6ID0gc2luKGFuZ2xlWSkgKiBjYW1EaXN0YW5jZTtcclxuXHJcblx0cmV0dXJuIFt4LCB5LCB6XTtcclxufTtcclxuXHJcbmNvbnN0IHNldENhbVBvc2l0aW9uID0gKG1vdXNlWD86IG51bWJlciwgbW91c2VZPzogbnVtYmVyKTogdm9pZCA9PiB7XHJcblx0aWYgKCFydW5uaW5nIHx8ICF0YXJnZXRDb29yZHMgfHwgY2hhbmdpbmdDYW0pIHJldHVybjtcclxuXHJcblx0bW91c2VYID0gbW91c2VYID8/IDAuMDtcclxuXHRtb3VzZVkgPSBtb3VzZVkgPz8gMC4wO1xyXG5cclxuXHRhbmdsZVogLT0gbW91c2VYO1xyXG5cdGFuZ2xlWSArPSBtb3VzZVk7XHJcblxyXG4gICAgY29uc3QgaXNIZWFkT3JXaG9sZSA9IGN1cnJlbnRCb25lID09PSAnd2hvbGUnIHx8IGN1cnJlbnRCb25lID09PSAnaGVhZCc7XHJcbiAgICBjb25zdCBtYXhBbmdsZSA9IGlzSGVhZE9yV2hvbGUgPyA4OS4wIDogNzAuMDtcclxuICAgIFxyXG4gICAgY29uc3QgaXNTaG9lcyA9IGN1cnJlbnRCb25lID09PSAnc2hvZXMnO1xyXG4gICAgY29uc3QgbWluQW5nbGUgPSBpc1Nob2VzID8gNS4wIDogLTIwLjA7XHJcblxyXG5cdGFuZ2xlWSA9IE1hdGgubWluKE1hdGgubWF4KGFuZ2xlWSwgbWluQW5nbGUpLCBtYXhBbmdsZSk7XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpO1xyXG5cclxuXHRTZXRDYW1Db29yZChcclxuXHRcdGNhbSxcclxuXHRcdHRhcmdldENvb3Jkcy54ICsgeCxcclxuXHRcdHRhcmdldENvb3Jkcy55ICsgeSxcclxuXHRcdHRhcmdldENvb3Jkcy56ICsgelxyXG5cdCk7XHJcblx0UG9pbnRDYW1BdENvb3JkKGNhbSwgdGFyZ2V0Q29vcmRzLngsIHRhcmdldENvb3Jkcy55LCB0YXJnZXRDb29yZHMueik7XHJcbn07XHJcblxyXG5jb25zdCBtb3ZlQ2FtZXJhID0gYXN5bmMgKGNvb3JkczogVmVjdG9yMywgZGlzdGFuY2U/OiBudW1iZXIpID0+IHtcclxuXHRjb25zdCBoZWFkaW5nOiBudW1iZXIgPSBHZXRFbnRpdHlIZWFkaW5nKHBlZCkgKyA5NDtcclxuXHRkaXN0YW5jZSA9IGRpc3RhbmNlID8/IDEuMDtcclxuXHJcblx0Y2hhbmdpbmdDYW0gPSB0cnVlO1xyXG5cdGNhbURpc3RhbmNlID0gZGlzdGFuY2U7XHJcblx0YW5nbGVaID0gaGVhZGluZztcclxuXHJcblx0Y29uc3QgW3gsIHksIHpdID0gZ2V0QW5nbGVzKCk7XHJcblxyXG5cdGNvbnN0IG5ld2NhbTogQ2FtZXJhID0gQ3JlYXRlQ2FtV2l0aFBhcmFtcyhcclxuXHRcdCdERUZBVUxUX1NDUklQVEVEX0NBTUVSQScsXHJcblx0XHRjb29yZHMueCArIHgsXHJcblx0XHRjb29yZHMueSArIHksXHJcblx0XHRjb29yZHMueiArIHosXHJcblx0XHQwLjAsXHJcblx0XHQwLjAsXHJcblx0XHQwLjAsXHJcblx0XHQ3MC4wLFxyXG5cdFx0ZmFsc2UsXHJcblx0XHQwXHJcblx0KTtcclxuXHJcblx0dGFyZ2V0Q29vcmRzID0gY29vcmRzO1xyXG5cdGNoYW5naW5nQ2FtID0gZmFsc2U7XHJcblx0b2xkQ2FtID0gY2FtO1xyXG5cdGNhbSA9IG5ld2NhbTtcclxuXHJcblx0UG9pbnRDYW1BdENvb3JkKG5ld2NhbSwgY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMueik7XHJcblx0U2V0Q2FtQWN0aXZlV2l0aEludGVycChuZXdjYW0sIG9sZENhbSwgMjUwLCAwLCAwKTtcclxuXHJcblx0YXdhaXQgZGVsYXkoMjUwKTtcclxuXHJcblx0U2V0Q2FtVXNlU2hhbGxvd0RvZk1vZGUobmV3Y2FtLCB0cnVlKTtcclxuXHRTZXRDYW1OZWFyRG9mKG5ld2NhbSwgMC40KTtcclxuXHRTZXRDYW1GYXJEb2YobmV3Y2FtLCAxLjIpO1xyXG5cdFNldENhbURvZlN0cmVuZ3RoKG5ld2NhbSwgMC4zKTtcclxuXHR1c2VIaURvZihuZXdjYW0pO1xyXG5cclxuXHREZXN0cm95Q2FtKG9sZENhbSwgdHJ1ZSk7XHJcbn07XHJcblxyXG5jb25zdCB1c2VIaURvZiA9IChjdXJyZW50Y2FtOiBDYW1lcmEpID0+IHtcclxuXHRpZiAoIShEb2VzQ2FtRXhpc3QoY2FtKSAmJiBjdXJyZW50Y2FtID09IGNhbSkpIHJldHVybjtcclxuXHRTZXRVc2VIaURvZigpO1xyXG5cdHNldFRpbWVvdXQodXNlSGlEb2YsIDApO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0YXJ0Q2FtZXJhID0gKCkgPT4ge1xyXG5cdGlmIChydW5uaW5nKSByZXR1cm47XHJcblx0cnVubmluZyA9IHRydWU7XHJcblx0Y2FtRGlzdGFuY2UgPSBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRVxyXG5cdGNhbSA9IENyZWF0ZUNhbSgnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLCB0cnVlKTtcclxuXHRjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIDMxMDg2LCAwLjAsIDAuMCwgMC4wKTtcclxuXHRTZXRDYW1Db29yZChjYW0sIHgsIHksIHopO1xyXG5cdFJlbmRlclNjcmlwdENhbXModHJ1ZSwgdHJ1ZSwgMTAwMCwgdHJ1ZSwgdHJ1ZSk7XHJcblx0Ly8gbW92ZUNhbWVyYSh7IHg6IHgsIHk6IHksIHo6IHogfSwgY2FtRGlzdGFuY2UpO1xyXG4gICAgc2V0Q2FtZXJhKCd3aG9sZScsIGNhbURpc3RhbmNlKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdG9wQ2FtZXJhID0gKCk6IHZvaWQgPT4ge1xyXG5cdGlmICghcnVubmluZykgcmV0dXJuO1xyXG5cdHJ1bm5pbmcgPSBmYWxzZTtcclxuXHJcblx0UmVuZGVyU2NyaXB0Q2FtcyhmYWxzZSwgdHJ1ZSwgMjUwLCB0cnVlLCBmYWxzZSk7XHJcblx0RGVzdHJveUNhbShjYW0sIHRydWUpO1xyXG5cdGNhbSA9IG51bGw7XHJcblx0dGFyZ2V0Q29vcmRzID0gbnVsbDtcclxufTtcclxuXHJcbmNvbnN0IHNldENhbWVyYSA9ICh0eXBlPzoga2V5b2YgVENhbWVyYUJvbmVzLCBkaXN0YW5jZSA9IGNhbURpc3RhbmNlKTogdm9pZCA9PiB7XHJcblxyXG5cdGNvbnN0IGJvbmU6IG51bWJlciB8IG51bWJlcltdIHwgdW5kZWZpbmVkID0gQ2FtZXJhQm9uZXNbdHlwZV07XHJcblxyXG4gICAgY29uc3QgaXNCb25lQXJyYXkgPSBBcnJheS5pc0FycmF5KGJvbmUpXHJcblxyXG4gICAgY3VycmVudEJvbmUgPSB0eXBlO1xyXG5cclxuICAgIGlmICghaXNCb25lQXJyYXkgJiYgYm9uZSA9PT0gMCkge1xyXG4gICAgICAgIGNvbnN0IFt4LCB5LCB6XTogbnVtYmVyW10gPSBHZXRFbnRpdHlDb29yZHMocGVkLCBmYWxzZSk7XHJcbiAgICAgICAgbW92ZUNhbWVyYShcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgeDogeCxcclxuICAgICAgICAgICAgICAgIHk6IHksXHJcbiAgICAgICAgICAgICAgICB6OiB6ICsgMC4wLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkaXN0YW5jZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIGl0cyBub3Qgd2hvbGUgYm9keSwgdGhlbiB3ZSBuZWVkIHRvIGxpbWl0IHRoZSBkaXN0YW5jZVxyXG4gICAgaWYgKGRpc3RhbmNlID4gREVGQVVMVF9NQVhfRElTVEFOQ0UpIGRpc3RhbmNlID0gREVGQVVMVF9NQVhfRElTVEFOQ0U7XHJcblxyXG4gICAgaWYgKGlzQm9uZUFycmF5KSB7XHJcbiAgICAgICAgY29uc3QgW3gxLCB5MSwgejFdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCBib25lWzBdLCAwLjAsIDAuMCwgMC4wKVxyXG5cclxuICAgICAgICBjb25zdCBbeDIsIHkyLCB6Ml06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmVbMV0sIDAuMCwgMC4wLCAwLjApXHJcblxyXG4gICAgICAgIC8vIGdldCB0aGUgbWlkZGxlIG9mIHRoZSB0d28gcG9pbnRzXHJcbiAgICAgICAgdmFyIHggPSAoeDEgKyB4MikgLyAyO1xyXG4gICAgICAgIHZhciB5ID0gKHkxICsgeTIpIC8gMjtcclxuICAgICAgICB2YXIgeiA9ICh6MSArIHoyKSAvIDI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBbeCwgeSwgel06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmUsIDAuMCwgMC4wLCAwLjApXHJcbiAgICB9XHJcblxyXG5cdG1vdmVDYW1lcmEoXHJcblx0XHR7XHJcblx0XHRcdHg6IHgsXHJcblx0XHRcdHk6IHksXHJcblx0XHRcdHo6IHogKyAwLjAsXHJcblx0XHR9LFxyXG5cdFx0ZGlzdGFuY2VcclxuXHQpO1xyXG5cclxufTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1Nb3ZlLCAoZGF0YSwgY2IpID0+IHtcclxuICAgIHNldENhbVBvc2l0aW9uKGRhdGEueCwgZGF0YS55KTtcclxuICAgIGNiKDEpO1xyXG59KTtcclxuXHJcbnR5cGUgVFNlY3Rpb24gPSAnd2hvbGUnIHwgJ2hlYWQnIHwgJ3RvcnNvJyB8ICdsZWdzJyB8ICdzaG9lcyc7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtU2VjdGlvbiwgKHR5cGU6IFRTZWN0aW9uLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlICd3aG9sZSc6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgnd2hvbGUnLCBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2hlYWQnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ2hlYWQnKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAndG9yc28nOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ3RvcnNvJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2xlZ3MnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ2xlZ3MnKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnc2hvZXMnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ3Nob2VzJyk7XHJcbiAgICAgICAgICAgIHNldENhbVBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cdH1cclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtWm9vbSwgKGRhdGEsIGNiKSA9PiB7XHJcblx0aWYgKGRhdGEgPT09ICdkb3duJykge1xyXG5cclxuICAgICAgICBjb25zdCBtYXhab29tID0gY3VycmVudEJvbmUgPT09ICd3aG9sZScgPyBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRSA6IERFRkFVTFRfTUFYX0RJU1RBTkNFO1xyXG5cclxuXHRcdGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSArIDAuMDU7XHJcblx0XHRjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlID49IG1heFpvb20gPyBtYXhab29tIDogbmV3RGlzdGFuY2U7XHJcblx0fSBlbHNlIGlmIChkYXRhID09PSAndXAnKSB7XHJcblx0XHRjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgLSAwLjA1O1xyXG5cdFx0Y2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA8PSAwLjMgPyAwLjMgOiBuZXdEaXN0YW5jZTtcclxuXHR9XHJcblxyXG5cdGNhbURpc3RhbmNlID0gY2FtRGlzdGFuY2U7XHJcblx0c2V0Q2FtUG9zaXRpb24oKTtcclxuXHRjYigxKTtcclxufSk7XHJcbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJCbGVtaXNoZXNcIixcbiAgICBcIkZhY2lhbEhhaXJcIixcbiAgICBcIkV5ZWJyb3dzXCIsXG4gICAgXCJBZ2VpbmdcIixcbiAgICBcIk1ha2V1cFwiLFxuICAgIFwiQmx1c2hcIixcbiAgICBcIkNvbXBsZXhpb25cIixcbiAgICBcIlN1bkRhbWFnZVwiLFxuICAgIFwiTGlwc3RpY2tcIixcbiAgICBcIk1vbGVzRnJlY2tsZXNcIixcbiAgICBcIkNoZXN0SGFpclwiLFxuICAgIFwiQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiQWRkQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiRXllQ29sb3JcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcIk5vc2VfV2lkdGhcIixcbiAgICBcIk5vc2VfUGVha19IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19MZW5naHRcIixcbiAgICBcIk5vc2VfQm9uZV9IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19Mb3dlcmluZ1wiLFxuICAgIFwiTm9zZV9Cb25lX1R3aXN0XCIsXG4gICAgXCJFeWVCcm93bl9IZWlnaHRcIixcbiAgICBcIkV5ZUJyb3duX0ZvcndhcmRcIixcbiAgICBcIkNoZWVrc19Cb25lX0hpZ2hcIixcbiAgICBcIkNoZWVrc19Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGVla3NfV2lkdGhcIixcbiAgICBcIkV5ZXNfT3Blbm5pbmdcIixcbiAgICBcIkxpcHNfVGhpY2tuZXNzXCIsXG4gICAgXCJKYXdfQm9uZV9XaWR0aFwiLFxuICAgIFwiSmF3X0JvbmVfQmFja19MZW5naHRcIixcbiAgICBcIkNoaW5fQm9uZV9Mb3dlcmluZ1wiLFxuICAgIFwiQ2hpbl9Cb25lX0xlbmd0aFwiLFxuICAgIFwiQ2hpbl9Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGluX0hvbGVcIixcbiAgICBcIk5lY2tfVGhpa25lc3NcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImZhY2VcIixcbiAgICBcIm1hc2tzXCIsXG4gICAgXCJoYWlyXCIsXG4gICAgXCJ0b3Jzb3NcIixcbiAgICBcImxlZ3NcIixcbiAgICBcImJhZ3NcIixcbiAgICBcInNob2VzXCIsXG4gICAgXCJuZWNrXCIsXG4gICAgXCJzaGlydHNcIixcbiAgICBcInZlc3RcIixcbiAgICBcImRlY2Fsc1wiLFxuICAgIFwiamFja2V0c1wiXG5dXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiaGF0c1wiLFxuICAgIFwiZ2xhc3Nlc1wiLFxuICAgIFwiZWFycmluZ3NcIixcbiAgICBcIm1vdXRoXCIsXG4gICAgXCJsaGFuZFwiLFxuICAgIFwicmhhbmRcIixcbiAgICBcIndhdGNoZXNcIixcbiAgICBcImJyYWNlbGV0c1wiXG5dXG4iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRIYWlyRGF0YSwgVEhlYWRPdmVybGF5LCBUSGVhZE92ZXJsYXlUb3RhbCwgVENsb3RoZXMsIFRTa2luIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgSEVBRF9PVkVSTEFZUyBmcm9tIFwiQGRhdGEvaGVhZFwiXHJcbmltcG9ydCBGQUNFX0ZFQVRVUkVTIGZyb20gXCJAZGF0YS9mYWNlXCJcclxuaW1wb3J0IERSQVdBQkxFX05BTUVTIGZyb20gXCJAZGF0YS9kcmF3YWJsZXNcIlxyXG5pbXBvcnQgUFJPUF9OQU1FUyBmcm9tIFwiQGRhdGEvcHJvcHNcIlxyXG5pbXBvcnQgeyBwZWQsIG9uU2VydmVyQ2FsbGJhY2sgfSBmcm9tICdAdXRpbHMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRNb2RlbEluZGV4KHRhcmdldDogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxuICAgIGNvbnN0IG1vZGVscyA9IGNvbmZpZy5tb2RlbHMoKVxyXG5cclxuICAgIHJldHVybiBtb2RlbHMuZmluZEluZGV4KChtb2RlbDogc3RyaW5nKSA9PiBHZXRIYXNoS2V5KG1vZGVsKSA9PT0gdGFyZ2V0KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFpcihwZWRIYW5kbGU6IG51bWJlcik6IFRIYWlyRGF0YSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNvbG9yOiBHZXRQZWRIYWlyQ29sb3IocGVkSGFuZGxlKSxcclxuICAgICAgICBoaWdobGlnaHQ6IEdldFBlZEhhaXJIaWdobGlnaHRDb2xvcihwZWRIYW5kbGUpXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGVkcjBmb250b3VyYS9maXZlbS1hcHBlYXJhbmNlL2Jsb2IvbWFpbi9nYW1lL3NyYy9jbGllbnQvaW5kZXgudHMjTDY3XHJcbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoODApO1xyXG4gICAgZ2xvYmFsLkNpdGl6ZW4uaW52b2tlTmF0aXZlKCcweDI3NDZiZDlkODhjNWM1ZDAnLCBwZWRIYW5kbGUsIG5ldyBVaW50MzJBcnJheShidWZmZXIpKTtcclxuXHJcbiAgICBjb25zdCB7IDA6IHNoYXBlRmlyc3QsIDI6IHNoYXBlU2Vjb25kLCA0OiBzaGFwZVRoaXJkLCA2OiBza2luRmlyc3QsIDg6IHNraW5TZWNvbmQsIDE4OiBoYXNQYXJlbnQsIDEwOiBza2luVGhpcmQgfSA9IG5ldyBVaW50MzJBcnJheShidWZmZXIpO1xyXG4gICAgY29uc3QgeyAwOiBzaGFwZU1peCwgMjogc2tpbk1peCwgNDogdGhpcmRNaXggfSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyLCA0OCk7XHJcblxyXG4gICAgLyogICBcclxuICAgICAgICAwOiBzaGFwZUZpcnN0LFxyXG4gICAgICAgIDI6IHNoYXBlU2Vjb25kLFxyXG4gICAgICAgIDQ6IHNoYXBlVGhpcmQsXHJcbiAgICAgICAgNjogc2tpbkZpcnN0LFxyXG4gICAgICAgIDg6IHNraW5TZWNvbmQsXHJcbiAgICAgICAgMTA6IHNraW5UaGlyZCxcclxuICAgICAgICAxODogaGFzUGFyZW50LFxyXG4gICAgKi9cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2hhcGVGaXJzdCwgICAvLyBmYXRoZXJcclxuICAgICAgICBzaGFwZVNlY29uZCwgLy8gbW90aGVyXHJcbiAgICAgICAgc2hhcGVUaGlyZCxcclxuXHJcbiAgICAgICAgc2tpbkZpcnN0LFxyXG4gICAgICAgIHNraW5TZWNvbmQsXHJcbiAgICAgICAgc2tpblRoaXJkLFxyXG5cclxuICAgICAgICBzaGFwZU1peCwgLy8gcmVzZW1ibGFuY2VcclxuXHJcbiAgICAgICAgdGhpcmRNaXgsXHJcbiAgICAgICAgc2tpbk1peCwgICAvLyBza2lucGVyY2VudFxyXG5cclxuICAgICAgICBoYXNQYXJlbnQ6IEJvb2xlYW4oaGFzUGFyZW50KSxcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgbGV0IHRvdGFsczogVEhlYWRPdmVybGF5VG90YWwgPSB7fTtcclxuICAgIGxldCBoZWFkRGF0YTogVEhlYWRPdmVybGF5ID0ge307XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBIRUFEX09WRVJMQVlTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEhFQURfT1ZFUkxBWVNbaV07XHJcbiAgICAgICAgdG90YWxzW292ZXJsYXldID0gR2V0TnVtSGVhZE92ZXJsYXlWYWx1ZXMoaSk7XHJcblxyXG4gICAgICAgIGlmIChvdmVybGF5ID09PSBcIkV5ZUNvbG9yXCIpIHtcclxuICAgICAgICAgICAgaGVhZERhdGFbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBHZXRQZWRFeWVDb2xvcihwZWRIYW5kbGUpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgW18sIG92ZXJsYXlWYWx1ZSwgY29sb3VyVHlwZSwgZmlyc3RDb2xvciwgc2Vjb25kQ29sb3IsIG92ZXJsYXlPcGFjaXR5XSA9IEdldFBlZEhlYWRPdmVybGF5RGF0YShwZWRIYW5kbGUsIGkpO1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5VmFsdWU6IG92ZXJsYXlWYWx1ZSA9PT0gMjU1ID8gLTEgOiBvdmVybGF5VmFsdWUsXHJcbiAgICAgICAgICAgICAgICBjb2xvdXJUeXBlOiBjb2xvdXJUeXBlLFxyXG4gICAgICAgICAgICAgICAgZmlyc3RDb2xvcjogZmlyc3RDb2xvcixcclxuICAgICAgICAgICAgICAgIHNlY29uZENvbG9yOiBzZWNvbmRDb2xvcixcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlPcGFjaXR5OiBvdmVybGF5T3BhY2l0eVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW2hlYWREYXRhLCB0b3RhbHNdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZFN0cnVjdHVyZShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgY29uc3QgcGVkTW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWRIYW5kbGUpXHJcblxyXG4gICAgaWYgKHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSAmJiBwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIikpIHJldHVyblxyXG5cclxuICAgIGxldCBmYWNlU3RydWN0ID0ge31cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRkFDRV9GRUFUVVJFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBGQUNFX0ZFQVRVUkVTW2ldXHJcbiAgICAgICAgZmFjZVN0cnVjdFtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRmFjZUZlYXR1cmUocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFjZVN0cnVjdFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RHJhd2FibGVzKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgZHJhd2FibGVzID0ge31cclxuICAgIGxldCB0b3RhbERyYXdhYmxlcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBEUkFXQUJMRV9OQU1FUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBEUkFXQUJMRV9OQU1FU1tpXVxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWRIYW5kbGUsIGkpXHJcblxyXG4gICAgICAgIHRvdGFsRHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHRvdGFsOiBHZXROdW1iZXJPZlBlZERyYXdhYmxlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogR2V0TnVtYmVyT2ZQZWRUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRyYXdhYmxlc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkSGFuZGxlLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZTogR2V0UGVkVGV4dHVyZVZhcmlhdGlvbihwZWRIYW5kbGUsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbZHJhd2FibGVzLCB0b3RhbERyYXdhYmxlc11cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3BzKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgcHJvcHMgPSB7fVxyXG4gICAgbGV0IHRvdGFsUHJvcHMgPSB7fVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgUFJPUF9OQU1FUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBQUk9QX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZFByb3BJbmRleChwZWRIYW5kbGUsIGkpXHJcblxyXG4gICAgICAgIHRvdGFsUHJvcHNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkUHJvcERyYXdhYmxlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogR2V0TnVtYmVyT2ZQZWRQcm9wVGV4dHVyZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBpLCBjdXJyZW50KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvcHNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZFByb3BJbmRleChwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRQcm9wVGV4dHVyZUluZGV4KHBlZEhhbmRsZSwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtwcm9wcywgdG90YWxQcm9wc11cclxufVxyXG5cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcHBlYXJhbmNlKHBlZEhhbmRsZTogbnVtYmVyKTogUHJvbWlzZTxUQXBwZWFyYW5jZT4ge1xyXG4gICAgY29uc3QgW2hlYWREYXRhLCB0b3RhbHNdID0gZ2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW2RyYXdhYmxlcywgZHJhd1RvdGFsXSA9IGdldERyYXdhYmxlcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbcHJvcHMsIHByb3BUb3RhbF0gPSBnZXRQcm9wcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBtb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1vZGVsSW5kZXg6IGZpbmRNb2RlbEluZGV4KG1vZGVsKSxcclxuICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGVhZEJsZW5kOiBnZXRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGVhZE92ZXJsYXk6IGhlYWREYXRhIGFzIFRIZWFkT3ZlcmxheSxcclxuICAgICAgICBoZWFkT3ZlcmxheVRvdGFsOiB0b3RhbHMgYXMgVEhlYWRPdmVybGF5VG90YWwsXHJcbiAgICAgICAgaGVhZFN0cnVjdHVyZTogZ2V0SGVhZFN0cnVjdHVyZShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgICAgICBkcmF3VG90YWw6IGRyYXdUb3RhbCxcclxuICAgICAgICBwcm9wVG90YWw6IHByb3BUb3RhbCxcclxuICAgICAgICB0YXR0b29zOiBbXVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRBcHBlYXJhbmNlXCIsIGdldEFwcGVhcmFuY2UpXHJcbm9uU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50OmdldEFwcGVhcmFuY2UnLCAoKSA9PiB7XHJcbiAgICByZXR1cm4gZ2V0QXBwZWFyYW5jZShwZWQgfHwgUGxheWVyUGVkSWQoKSlcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVkQ2xvdGhlcyhwZWRIYW5kbGU6IG51bWJlcik6IFRDbG90aGVzIHtcclxuICAgIGNvbnN0IFtkcmF3YWJsZXNdID0gZ2V0RHJhd2FibGVzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtwcm9wc10gPSBnZXRQcm9wcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbaGVhZERhdGFdID0gZ2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaGVhZE92ZXJsYXk6IGhlYWREYXRhIGFzIFRIZWFkT3ZlcmxheSxcclxuICAgICAgICBkcmF3YWJsZXM6IGRyYXdhYmxlcyxcclxuICAgICAgICBwcm9wczogcHJvcHMsXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldFBlZENsb3RoZXNcIiwgZ2V0UGVkQ2xvdGhlcylcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQZWRTa2luKHBlZEhhbmRsZTogbnVtYmVyKTogVFNraW4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZEhhbmRsZSksXHJcbiAgICAgICAgbW9kZWw6IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkU2tpblwiLCBnZXRQZWRTa2luKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhdHRvb0RhdGEoKSB7XHJcbiAgICBsZXQgdGF0dG9vWm9uZXMgPSBbXVxyXG5cclxuICAgIGNvbnN0IFtUQVRUT09fTElTVCwgVEFUVE9PX0NBVEVHT1JJRVNdID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLnRhdHRvb3MoKVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fQ0FURUdPUklFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gVEFUVE9PX0NBVEVHT1JJRVNbaV1cclxuICAgICAgICBjb25zdCB6b25lID0gY2F0ZWdvcnkuem9uZVxyXG4gICAgICAgIGNvbnN0IGxhYmVsID0gY2F0ZWdvcnkubGFiZWxcclxuICAgICAgICBjb25zdCBpbmRleCA9IGNhdGVnb3J5LmluZGV4XHJcbiAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdID0ge1xyXG4gICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICBsYWJlbDogbGFiZWwsXHJcbiAgICAgICAgICAgIHpvbmVJbmRleDogaW5kZXgsXHJcbiAgICAgICAgICAgIGRsY3M6IFtdXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IFRBVFRPT19MSVNULmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRsY0RhdGEgPSBUQVRUT09fTElTVFtqXVxyXG4gICAgICAgICAgICB0YXR0b29ab25lc1tpbmRleF0uZGxjcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBkbGNEYXRhLmRsYyxcclxuICAgICAgICAgICAgICAgIGRsY0luZGV4OiBqLFxyXG4gICAgICAgICAgICAgICAgdGF0dG9vczogW11cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaXNGZW1hbGUgPSBHZXRFbnRpdHlNb2RlbChwZWQpID09PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gVEFUVE9PX0xJU1RbaV1cclxuICAgICAgICBjb25zdCB7IGRsYywgdGF0dG9vcyB9ID0gZGF0YVxyXG4gICAgICAgIGNvbnN0IGRsY0hhc2ggPSBHZXRIYXNoS2V5KGRsYylcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRhdHRvb3MubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IHRhdHRvb3Nbal1cclxuICAgICAgICAgICAgbGV0IHRhdHRvbyA9IG51bGxcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyVGF0dG9vID0gdGF0dG9vRGF0YS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIGNvbnN0IGlzRmVtYWxlVGF0dG9vID0gbG93ZXJUYXR0b28uaW5jbHVkZXMoXCJfZlwiKVxyXG4gICAgICAgICAgICBpZiAoaXNGZW1hbGVUYXR0b28gJiYgaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNGZW1hbGVUYXR0b28gJiYgIWlzRmVtYWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXR0b28gPSB0YXR0b29EYXRhXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBoYXNoID0gbnVsbFxyXG4gICAgICAgICAgICBsZXQgem9uZSA9IC0xXHJcblxyXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoID0gR2V0SGFzaEtleSh0YXR0b28pXHJcbiAgICAgICAgICAgICAgICB6b25lID0gR2V0UGVkRGVjb3JhdGlvblpvbmVGcm9tSGFzaGVzKGRsY0hhc2gsIGhhc2gpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh6b25lICE9PSAtMSAmJiBoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB6b25lVGF0dG9vcyA9IHRhdHRvb1pvbmVzW3pvbmVdLmRsY3NbaV0udGF0dG9vc1xyXG5cclxuICAgICAgICAgICAgICAgIHpvbmVUYXR0b29zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0YXR0b28sXHJcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogaGFzaCxcclxuICAgICAgICAgICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICAgICAgICAgIGRsYzogZGxjLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGF0dG9vWm9uZXNcclxufVxyXG5cclxuLy9taWdyYXRpb25cclxuXHJcbm9uU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50Om1pZ3JhdGlvbjpzZXRBcHBlYXJhbmNlJywgKGRhdGE6IHt0eXBlOiBzdHJpbmcsIGRhdGE6IGFueX0pID0+IHtcclxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdmaXZlbScpIGV4cG9ydHNbJ2ZpdmVtLWFwcGVhcmFuY2UnXS5zZXRQbGF5ZXJBcHBlYXJhbmNlKGRhdGEuZGF0YSlcclxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdpbGxlbml1bScpIGV4cG9ydHNbJ2lsbGVuaXVtLWFwcGVhcmFuY2UnXS5zZXRQbGF5ZXJBcHBlYXJhbmNlKGRhdGEuZGF0YSlcclxufSk7IiwgImV4cG9ydCBkZWZhdWx0IHtcclxuICAgIGhhdHM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMCxcclxuICAgIH0sXHJcbiAgICBnbGFzc2VzOiB7XHJcbiAgICAgICAgdHlwZTogXCJwcm9wXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICB9LFxyXG4gICAgbWFza3M6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICAgICAgb2ZmOiAwLFxyXG4gICAgfSxcclxuICAgIHNoaXJ0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogOCxcclxuICAgICAgICBvZmY6IDE1LFxyXG4gICAgICAgIGhvb2s6IHtcclxuICAgICAgICAgICAgZHJhd2FibGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogMywgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAndG9yc29zJyB9LFxyXG4gICAgICAgICAgICAgICAgeyBjb21wb25lbnQ6IDgsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ3NoaXJ0cycgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGphY2tldHM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDExLFxyXG4gICAgICAgIG9mZjogMTUsXHJcbiAgICAgICAgaG9vazoge1xyXG4gICAgICAgICAgICBkcmF3YWJsZXM6IFtcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAzLCB2YXJpYW50OiAxNSwgdGV4dHVyZTogMCwgaWQ6ICd0b3Jzb3MnIH0sXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogMTEsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ2phY2tldHMnIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB2ZXN0OiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA5LFxyXG4gICAgICAgIG9mZjogMCxcclxuICAgIH0sXHJcbiAgICBsZWdzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA0LFxyXG4gICAgICAgIG9mZjogMTgsXHJcbiAgICB9LFxyXG4gICAgc2hvZXM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDYsXHJcbiAgICAgICAgb2ZmOiAzNCxcclxuICAgIH1cclxufSIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSwgVEhhaXJDb2xvciwgVENsb3RoZXMsIFRTa2luLCBUVmFsdWUgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiO1xyXG5pbXBvcnQgVE9HR0xFX0lOREVYRVMgZnJvbSBcIkBkYXRhL3RvZ2dsZXNcIlxyXG5pbXBvcnQgeyByZXF1ZXN0TW9kZWwsIHBlZCwgdXBkYXRlUGVkLCBpc1BlZEZyZWVtb2RlTW9kZWx9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IFRUYXR0b28gfSBmcm9tIFwiQHR5cGluZ3MvdGF0dG9vc1wiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldERyYXdhYmxlKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgMClcclxuICAgIHJldHVybiBHZXROdW1iZXJPZlBlZFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFByb3AocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgaWYgKGRhdGEudmFsdWUgPT09IC0xKSB7XHJcbiAgICAgICAgQ2xlYXJQZWRQcm9wKHBlZEhhbmRsZSwgZGF0YS5pbmRleClcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBTZXRQZWRQcm9wSW5kZXgocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlLCBkYXRhLnRleHR1cmUsIGZhbHNlKVxyXG4gICAgcmV0dXJuIEdldE51bWJlck9mUGVkUHJvcFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSlcclxufVxyXG5cclxuY29uc3QgZGVmTWFsZUhhc2ggPSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKVxyXG5cclxuXHJcbi8vIFRoaXMgbmVlZHMgdG8gcmV0dXJuIHRoZSBwZWQgaGFuZGxlIGJlY2F1c2UgdGhlIHBlZElkIGlzIGJlaW5nIGNoYW5nZWRcclxuZXhwb3J0IGNvbnN0IHNldE1vZGVsID0gYXN5bmMgKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUQXBwZWFyYW5jZSB8IFRTa2luIHwgbnVtYmVyIHwgc3RyaW5nKSA9PiB7XHJcbiAgICBsZXQgbW9kZWw6IG51bWJlciA9IDBcclxuXHJcblxyXG4gICAgaWYgKGRhdGEgPT0gbnVsbCB8fCBkYXRhID09IHVuZGVmaW5lZCkgcmV0dXJuXHJcblxyXG4gICAgY29uc3QgaXNTdHJpbmcgPSB0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZydcclxuICAgIGNvbnN0IGlzTnVtYmVyID0gdHlwZW9mIGRhdGEgPT09ICdudW1iZXInXHJcbiAgICBjb25zdCBpc0p1c3RNb2RlbCA9IGlzU3RyaW5nIHx8IGlzTnVtYmVyXHJcblxyXG4gICAgLy8gQ2hpbGwsIFRTIGlzIG5vdCBzbWFydCBhbmQgZG9lc250IGxldCBtZSB1c2UgdGhlIGlzU3RyaW5nIHx8IGlzTnVtYmVyIGNoZWNrIHdpdGhvdXQgY3J5aW5nXHJcbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgbW9kZWwgPSBHZXRIYXNoS2V5KGRhdGEpXHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgIG1vZGVsID0gZGF0YVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBtb2RlbCA9IGRhdGEubW9kZWwgLy9kYXRhLm1vZGVsIHNob3VsZCBiZSBhIGhhc2ggaGVyZVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb2RlbCA9PSBudWxsIHx8IG1vZGVsID09IHVuZGVmaW5lZCkgcmV0dXJuXHJcblxyXG4gICAgY29uc3QgaXNQbGF5ZXIgPSBJc1BlZEFQbGF5ZXIocGVkSGFuZGxlKVxyXG5cclxuICAgIGlmIChpc1BsYXllcikge1xyXG4gICAgICAgIG1vZGVsID0gbW9kZWwgIT09IDAgPyBtb2RlbCA6IGRlZk1hbGVIYXNoXHJcbiAgICAgICAgYXdhaXQgcmVxdWVzdE1vZGVsKG1vZGVsKVxyXG4gICAgICAgIFNldFBsYXllck1vZGVsKFBsYXllcklkKCksIG1vZGVsKVxyXG4gICAgICAgIFNldE1vZGVsQXNOb0xvbmdlck5lZWRlZChtb2RlbClcclxuICAgICAgICBwZWRIYW5kbGUgPSBQbGF5ZXJQZWRJZCgpXHJcbiAgICB9XHJcblxyXG4gICAgU2V0UGVkRGVmYXVsdENvbXBvbmVudFZhcmlhdGlvbihwZWRIYW5kbGUpXHJcblxyXG4gICAgaWYgKCFpc1BlZEZyZWVtb2RlTW9kZWwocGVkSGFuZGxlKSkgcmV0dXJuXHJcblxyXG4gICAgLy8gQ2hpbGwsIFRTIGlzIG5vdCBzbWFydCBhbmQgZG9lc250IGxldCBtZSB1c2UgdGhlIGlzU3RyaW5nIHx8IGlzTnVtYmVyIGNoZWNrIHdpdGhvdXQgY3J5aW5nXHJcbiAgICBpZiAodHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnICYmIHR5cGVvZiBkYXRhICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgIGlmIChkYXRhLmhlYWRCbGVuZCkge1xyXG4gICAgICAgICAgICBpZiAoIWlzSnVzdE1vZGVsICYmIE9iamVjdC5rZXlzKGRhdGEuaGVhZEJsZW5kKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBoZWFkQmxlbmQgPSBkYXRhLmhlYWRCbGVuZFxyXG4gICAgICAgICAgICAgICAgc2V0SGVhZEJsZW5kKHBlZEhhbmRsZSwgaGVhZEJsZW5kKVxyXG4gICAgICAgICAgICAgICAgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWRIYW5kbGUsIDAsIDAsIDAsIDAsIDAsIDAsIDAuMCwgMC4wLCAwLjAsIGZhbHNlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSBcclxuICAgIFxyXG4gICAgcmV0dXJuIHBlZEhhbmRsZVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gU2V0RmFjZUZlYXR1cmUocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgU2V0UGVkRmFjZUZlYXR1cmUocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlICsgMC4wKVxyXG59XHJcblxyXG5jb25zdCBpc1Bvc2l0aXZlID0gKHZhbDogbnVtYmVyKSA9PiB2YWwgPj0gMCA/IHZhbCA6IDBcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkQmxlbmQocGVkSGFuZGxlOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIGlmICghaXNQZWRGcmVlbW9kZU1vZGVsKHBlZEhhbmRsZSkpIHJldHVyblxyXG4gICAgXHJcbiAgICBwZWRIYW5kbGUgPSBwZWRIYW5kbGUgfHwgcGVkXHJcblxyXG4gICAgY29uc3Qgc2hhcGVGaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZUZpcnN0KVxyXG4gICAgY29uc3Qgc2hhcGVTZWNvbmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVTZWNvbmQpXHJcbiAgICBjb25zdCBzaGFwZVRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlVGhpcmQpXHJcbiAgICBjb25zdCBza2luRmlyc3QgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpbkZpcnN0KVxyXG4gICAgY29uc3Qgc2tpblNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5za2luU2Vjb25kKVxyXG4gICAgY29uc3Qgc2tpblRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNraW5UaGlyZClcclxuICAgIGNvbnN0IHNoYXBlTWl4ID0gZGF0YS5zaGFwZU1peCArIDAuMFxyXG4gICAgY29uc3Qgc2tpbk1peCA9IGRhdGEuc2tpbk1peCArIDAuMFxyXG4gICAgY29uc3QgdGhpcmRNaXggPSBkYXRhLnRoaXJkTWl4ICsgMC4wXHJcbiAgICBjb25zdCBoYXNQYXJlbnQgPSBkYXRhLmhhc1BhcmVudFxyXG5cclxuICAgIFNldFBlZEhlYWRCbGVuZERhdGEocGVkSGFuZGxlLCBzaGFwZUZpcnN0LCBzaGFwZVNlY29uZCwgc2hhcGVUaGlyZCwgc2tpbkZpcnN0LCBza2luU2Vjb25kLCBza2luVGhpcmQsIHNoYXBlTWl4LCBza2luTWl4LCB0aGlyZE1peCwgaGFzUGFyZW50KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIGNvbnN0IGluZGV4ID0gZGF0YS5pbmRleFxyXG5cclxuICAgIGlmIChpbmRleCA9PT0gMTMpIHtcclxuICAgICAgICBTZXRQZWRFeWVDb2xvcihwZWRIYW5kbGUsIGRhdGEudmFsdWUpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmFsdWUgPSBkYXRhLm92ZXJsYXlWYWx1ZVxyXG5cclxuICAgIC8qIEhhaXIgY29sb3IgZG9lcyBub3QgaGF2ZSBhbiBpbmRleCwgb25seSBhbiBJRCBzbyB3ZSdsbCBjaGVjayBmb3IgdGhhdCAqL1xyXG4gICAgaWYgKGRhdGEuaWQgPT09ICdoYWlyQ29sb3InKSB7XHJcbiAgICAgICAgU2V0UGVkSGFpclRpbnQocGVkSGFuZGxlLCBkYXRhLmhhaXJDb2xvciwgZGF0YS5oYWlySGlnaGxpZ2h0KVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBTZXRQZWRIZWFkT3ZlcmxheShwZWRIYW5kbGUsIGluZGV4LCB2YWx1ZSwgZGF0YS5vdmVybGF5T3BhY2l0eSArIDAuMClcclxuICAgIFNldFBlZEhlYWRPdmVybGF5Q29sb3IocGVkSGFuZGxlLCBpbmRleCwgMSwgZGF0YS5maXJzdENvbG9yLCBkYXRhLnNlY29uZENvbG9yKVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0VG9nZ2xlcyhkYXRhKSB7XHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcblxyXG4gICAgZm9yIChjb25zdCBbdG9nZ2xlSXRlbSwgdG9nZ2xlRGF0YV0gb2YgT2JqZWN0LmVudHJpZXMoVE9HR0xFX0lOREVYRVMpKSB7XHJcbiAgICAgICAgY29uc3QgdG9nZ2xlVHlwZSA9IHRvZ2dsZURhdGEudHlwZVxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdG9nZ2xlRGF0YS5pbmRleFxyXG5cclxuICAgICAgICBpZiAodG9nZ2xlVHlwZSA9PT0gXCJkcmF3YWJsZVwiICYmIGRyYXdhYmxlc1t0b2dnbGVJdGVtXSkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudERyYXdhYmxlICE9PSBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHRvZ2dsZVR5cGUgPT09IFwicHJvcFwiICYmIHByb3BzW3RvZ2dsZUl0ZW1dKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UHJvcCAhPT0gcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZFByb3BJbmRleChwZWQsIGluZGV4LCBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgZmFsc2UpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRDbG90aGVzKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUQ2xvdGhlcykge1xyXG4gICAgY29uc3QgZHJhd2FibGVzID0gZGF0YS5kcmF3YWJsZXNcclxuICAgIGNvbnN0IHByb3BzID0gZGF0YS5wcm9wc1xyXG4gICAgY29uc3QgaGVhZE92ZXJsYXkgPSBkYXRhLmhlYWRPdmVybGF5XHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIGRyYXdhYmxlcykge1xyXG4gICAgICAgIGNvbnN0IGRyYXdhYmxlID0gZHJhd2FibGVzW2lkXVxyXG4gICAgICAgIHNldERyYXdhYmxlKHBlZEhhbmRsZSwgZHJhd2FibGUpXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBwcm9wcykge1xyXG4gICAgICAgIGNvbnN0IHByb3AgPSBwcm9wc1tpZF1cclxuICAgICAgICBzZXRQcm9wKHBlZEhhbmRsZSwgcHJvcClcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIGhlYWRPdmVybGF5KSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IGhlYWRPdmVybGF5W2lkXVxyXG4gICAgICAgIHNldEhlYWRPdmVybGF5KHBlZEhhbmRsZSwgb3ZlcmxheSlcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHNldFBlZFNraW4gPSBhc3luYyAocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRTa2luKSA9PiB7XHJcbiAgICBjb25zdCBoZWFkU3RydWN0dXJlID0gZGF0YS5oZWFkU3RydWN0dXJlXHJcbiAgICBjb25zdCBoZWFkQmxlbmQgPSBkYXRhLmhlYWRCbGVuZFxyXG5cclxuICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgcGVkSGFuZGxlID0gYXdhaXQgc2V0TW9kZWwocGVkSGFuZGxlLCBkYXRhKVxyXG4gICAgfVxyXG4gICAgICAgIFxyXG5cclxuICAgIGlmIChoZWFkQmxlbmQpIHNldEhlYWRCbGVuZChwZWRIYW5kbGUsIGhlYWRCbGVuZClcclxuICAgIFxyXG4gICAgaWYgKGhlYWRTdHJ1Y3R1cmUpIGZvciAoY29uc3QgZmVhdHVyZSBpbiBoZWFkU3RydWN0dXJlKSB7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSBoZWFkU3RydWN0dXJlW2ZlYXR1cmVdXHJcbiAgICAgICAgU2V0RmFjZUZlYXR1cmUocGVkSGFuZGxlLCB2YWx1ZSlcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZFRhdHRvb3MocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRUYXR0b29bXSkge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm5cclxuXHJcbiAgICBDbGVhclBlZERlY29yYXRpb25zTGVhdmVTY2FycyhwZWRIYW5kbGUpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IGRhdGFbaV0udGF0dG9vXHJcbiAgICAgICAgaWYgKHRhdHRvb0RhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IEdldEhhc2hLZXkodGF0dG9vRGF0YS5kbGMpXHJcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvbyA9IHRhdHRvb0RhdGEuaGFzaFxyXG4gICAgICAgICAgICBBZGRQZWREZWNvcmF0aW9uRnJvbUhhc2hlcyhwZWRIYW5kbGUsIGNvbGxlY3Rpb24sIHRhdHRvbylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRIYWlyQ29sb3JzKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUSGFpckNvbG9yKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVyblxyXG4gICAgY29uc3QgY29sb3IgPSBkYXRhLmNvbG9yXHJcbiAgICBjb25zdCBoaWdobGlnaHQgPSBkYXRhLmhpZ2hsaWdodFxyXG4gICAgU2V0UGVkSGFpckNvbG9yKHBlZEhhbmRsZSwgY29sb3IsIGhpZ2hsaWdodClcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBlZEFwcGVhcmFuY2UocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRBcHBlYXJhbmNlKSB7XHJcbiAgICBpZiAoSXNQZWRBUGxheWVyKHBlZEhhbmRsZSkpIHtcclxuICAgICAgICBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGRhdGEpXHJcbiAgICB9XHJcbiAgICBhd2FpdCBzZXRQZWRTa2luKHBlZEhhbmRsZSwgZGF0YSlcclxuICAgIHNldFBlZENsb3RoZXMocGVkSGFuZGxlLCBkYXRhKVxyXG4gICAgc2V0UGVkSGFpckNvbG9ycyhwZWRIYW5kbGUsIGRhdGEuaGFpckNvbG9yKVxyXG4gICAgc2V0UGVkVGF0dG9vcyhwZWRIYW5kbGUsIGRhdGEudGF0dG9vcylcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBsYXllclBlZEFwcGVhcmFuY2UoZGF0YTogVEFwcGVhcmFuY2UpIHtcclxuICAgIGF3YWl0IHNldFBlZFNraW4ocGVkLCBkYXRhKVxyXG4gICAgdXBkYXRlUGVkKFBsYXllclBlZElkKCkpXHJcbiAgICBzZXRQZWRDbG90aGVzKHBlZCwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMocGVkLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MocGVkLCBkYXRhLnRhdHRvb3MpXHJcbn1cclxuXHJcbmV4cG9ydHMoJ1NldFBlZENsb3RoZXMnLCBzZXRQZWRDbG90aGVzKVxyXG5leHBvcnRzKCdTZXRQZWRTa2luJywgc2V0UGVkU2tpbilcclxuZXhwb3J0cygnU2V0UGVkVGF0dG9vcycsIHNldFBlZFRhdHRvb3MpXHJcbmV4cG9ydHMoJ1NldFBlZEhhaXJDb2xvcnMnLCBzZXRQZWRIYWlyQ29sb3JzKSIsICJpbXBvcnQgeyBSZWNlaXZlIH0gZnJvbSAnQGV2ZW50cyc7XHJcbmltcG9ydCB7XHJcblx0cmVzZXRUb2dnbGVzLFxyXG5cdHNldERyYXdhYmxlLFxyXG5cdFNldEZhY2VGZWF0dXJlLFxyXG5cdHNldEhlYWRCbGVuZCxcclxuXHRzZXRIZWFkT3ZlcmxheSxcclxuXHRzZXRNb2RlbCxcclxuXHRzZXRQZWRDbG90aGVzLFxyXG5cdHNldFBlZFRhdHRvb3MsXHJcblx0c2V0UGxheWVyUGVkQXBwZWFyYW5jZSxcclxuXHRzZXRQcm9wLFxyXG59IGZyb20gJy4vYXBwZWFyYW5jZS9zZXR0ZXJzJztcclxuaW1wb3J0IHsgY2xvc2VNZW51IH0gZnJvbSAnLi9tZW51JztcclxuaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRUb2dnbGVEYXRhLCBUVmFsdWUgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgZGVsYXksIGdldEZyYW1ld29ya0lELCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIHBlZCwgdXBkYXRlUGVkIH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0VGF0dG9vRGF0YSB9IGZyb20gJy4vYXBwZWFyYW5jZS9nZXR0ZXJzJztcclxuaW1wb3J0IFRPR0dMRV9JTkRFWEVTIGZyb20gJ0BkYXRhL3RvZ2dsZXMnO1xyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tICdAdHlwaW5ncy9vdXRmaXRzJztcclxuaW1wb3J0IHsgVFRhdHRvbyB9IGZyb20gJ0B0eXBpbmdzL3RhdHRvb3MnO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbmNlbCwgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpO1xyXG5cdGNsb3NlTWVudSgpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zYXZlLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHJlc2V0VG9nZ2xlcyhhcHBlYXJhbmNlKTtcclxuXHJcblx0YXdhaXQgZGVsYXkoMTAwKTtcclxuXHJcblx0Y29uc3QgbmV3QXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkKTtcclxuXHRuZXdBcHBlYXJhbmNlLnRhdHRvb3MgPSBhcHBlYXJhbmNlLnRhdHRvb3M7XHJcblx0dHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlQXBwZWFyYW5jZScsIGdldEZyYW1ld29ya0lEKCksIG5ld0FwcGVhcmFuY2UpO1xyXG5cclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgbmV3QXBwZWFyYW5jZS50YXR0b29zKTtcclxuXHJcblx0Y2xvc2VNZW51KCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldE1vZGVsLCBhc3luYyAobW9kZWw6IHN0cmluZywgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgaGFzaCA9IEdldEhhc2hLZXkobW9kZWwpO1xyXG5cdGlmICghSXNNb2RlbEluQ2RpbWFnZShoYXNoKSB8fCAhSXNNb2RlbFZhbGlkKGhhc2gpKSB7XHJcblx0XHRyZXR1cm4gY2IoMCk7XHJcblx0fVxyXG5cclxuXHJcblx0Y29uc3QgbmV3UGVkID0gYXdhaXQgc2V0TW9kZWwocGVkLCBoYXNoKTtcclxuXHJcbiAgICB1cGRhdGVQZWQobmV3UGVkKVxyXG5cclxuXHRjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cclxuXHRhcHBlYXJhbmNlLnRhdHRvb3MgPSBbXTtcclxuXHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIFtdKTtcclxuXHJcblx0Y2IoYXBwZWFyYW5jZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmdldE1vZGVsVGF0dG9vcywgYXN5bmMgKF86IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgdGF0dG9vcyA9IGdldFRhdHRvb0RhdGEoKTtcclxuXHJcblx0Y2IodGF0dG9vcyk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRTdHJ1Y3R1cmUsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdFNldEZhY2VGZWF0dXJlKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRPdmVybGF5LCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRIZWFkT3ZlcmxheShwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRIZWFkQmxlbmQsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldEhlYWRCbGVuZChwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRUYXR0b29zLCBhc3luYyAoZGF0YTogVFRhdHRvb1tdLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFByb3AsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGxldCB0ZXh0dXJlID0gc2V0UHJvcChwZWQsIGRhdGEpO1xyXG5cdGNiKHRleHR1cmUpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXREcmF3YWJsZSwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0bGV0IHRleHR1cmUgPSBzZXREcmF3YWJsZShwZWQsIGRhdGEpO1xyXG5cdGNiKHRleHR1cmUpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS50b2dnbGVJdGVtLCBhc3luYyAoZGF0YTogVFRvZ2dsZURhdGEsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGl0ZW0gPSBUT0dHTEVfSU5ERVhFU1tkYXRhLml0ZW1dO1xyXG5cdGlmICghaXRlbSkgcmV0dXJuIGNiKGZhbHNlKTtcclxuXHJcblx0Y29uc3QgY3VycmVudCA9IGRhdGEuZGF0YTtcclxuXHRjb25zdCB0eXBlID0gaXRlbS50eXBlO1xyXG5cdGNvbnN0IGluZGV4ID0gaXRlbS5pbmRleDtcclxuXHRjb25zdCBob29rID0gaXRlbS5ob29rO1xyXG5cdGNvbnN0IGhvb2tEYXRhID0gZGF0YS5ob29rRGF0YTtcclxuXHJcblx0aWYgKCFjdXJyZW50KSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRpZiAodHlwZSA9PT0gJ3Byb3AnKSB7XHJcblx0XHRjb25zdCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KTtcclxuXHJcblx0XHRpZiAoY3VycmVudFByb3AgPT09IC0xKSB7XHJcblx0XHRcdHNldFByb3AocGVkLCBjdXJyZW50KTtcclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRDbGVhclBlZFByb3AocGVkLCBpbmRleCk7XHJcblx0XHRcdGNiKHRydWUpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fSBlbHNlIGlmICh0eXBlID09PSAnZHJhd2FibGUnKSB7XHJcblx0XHRjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KTtcclxuXHJcblx0XHRpZiAoY3VycmVudC52YWx1ZSA9PT0gaXRlbS5vZmYpIHtcclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGN1cnJlbnQudmFsdWUgPT09IGN1cnJlbnREcmF3YWJsZSkge1xyXG5cdFx0XHRTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgaXRlbS5vZmYsIDAsIDApO1xyXG5cdFx0XHRpZiAoaG9vaykge1xyXG5cdFx0XHRcdGZvcihsZXQgaT0wOyBpIDwgaG9vay5kcmF3YWJsZXM/Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRjb25zdCBob29rSXRlbSA9IGhvb2suZHJhd2FibGVzW2ldO1xyXG5cdFx0XHRcdFx0U2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaG9va0l0ZW0uY29tcG9uZW50LCBob29rSXRlbS52YXJpYW50LCBob29rSXRlbS50ZXh0dXJlLCAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Y2IodHJ1ZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHNldERyYXdhYmxlKHBlZCwgY3VycmVudCk7XHJcblx0XHRcdGZvcihsZXQgaT0wOyBpIDwgaG9va0RhdGE/Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0c2V0RHJhd2FibGUocGVkLCBob29rRGF0YVtpXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2F2ZU91dGZpdCwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmRlbGV0ZU91dGZpdCwgYXN5bmMgKHtpZH0sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpkZWxldGVPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGlkKTtcclxuXHRjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5yZW5hbWVPdXRmaXQsIGFzeW5jIChkYXRhOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZW5hbWVPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnVzZU91dGZpdCwgYXN5bmMgKG91dGZpdDogT3V0Zml0LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQZWRDbG90aGVzKHBlZCwgb3V0Zml0KTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuaW1wb3J0T3V0Zml0LCBhc3luYyAoeyBpZCwgb3V0Zml0TmFtZSB9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6aW1wb3J0T3V0Zml0JywgZnJhbWV3b3JrZElkLCBpZCwgb3V0Zml0TmFtZSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZ3JhYk91dGZpdCwgYXN5bmMgKHsgaWQgfSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpncmFiT3V0Zml0JywgaWQpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLml0ZW1PdXRmaXQsIGFzeW5jIChkYXRhOiB7b3V0Zml0OiBPdXRmaXQsIGxhYmVsOiBzdHJpbmd9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOml0ZW1PdXRmaXQnLGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxub25OZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnVzZU91dGZpdCcsIChvdXRmaXQ6IE91dGZpdCkgPT4ge1xyXG5cdHNldFBlZENsb3RoZXMocGVkLCBvdXRmaXQpO1xyXG59KSIsICJpbXBvcnQgeyBnZXRGcmFtZXdvcmtJRCwgcmVxdWVzdExvY2FsZSwgc2VuZE5VSUV2ZW50LCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIHVwZGF0ZVBlZCwgcGVkLCBnZXRQbGF5ZXJEYXRhLCBnZXRKb2JJbmZvLCBnZXRQbGF5ZXJHZW5kZXJNb2RlbCB9IGZyb20gXCJAdXRpbHNcIlxyXG5pbXBvcnQgeyBzdGFydENhbWVyYSwgc3RvcENhbWVyYSB9IGZyb20gXCIuL2NhbWVyYVwiXHJcbmltcG9ydCB0eXBlIHsgVEFwcGVhcmFuY2Vab25lIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tIFwiQHR5cGluZ3Mvb3V0Zml0c1wiXHJcbmltcG9ydCB7IFNlbmQgfSBmcm9tIFwiQGV2ZW50c1wiXHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldFRhdHRvb0RhdGEgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL2dldHRlcnNcIlxyXG5pbXBvcnQgXCIuL2hhbmRsZXJzXCJcclxuaW1wb3J0IHsgc2V0TW9kZWwgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxyXG5cclxuY29uc3QgY29uZmlnID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlXHJcbmxldCBhcm1vdXIgPSAwXHJcbmxldCBvcGVuID0gZmFsc2VcclxuXHJcbmxldCByZXNvbHZlUHJvbWlzZSA9IG51bGw7XHJcbmxldCBwcm9taXNlID0gbnVsbDtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuTWVudSh6b25lOiBUQXBwZWFyYW5jZVpvbmUsIGNyZWF0aW9uOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgIGlmICh6b25lID09PSBudWxsIHx8IG9wZW4pIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBlZEhhbmRsZSA9IFBsYXllclBlZElkKClcclxuICAgIGNvbnN0IGNvbmZpZ01lbnVzID0gY29uZmlnLm1lbnVzKClcclxuXHJcbiAgICBjb25zdCB0eXBlID0gem9uZS50eXBlXHJcblxyXG4gICAgY29uc3QgbWVudSA9IGNvbmZpZ01lbnVzW3R5cGVdXHJcbiAgICBpZiAoIW1lbnUpIHJldHVyblxyXG5cclxuICAgIHVwZGF0ZVBlZChwZWRIYW5kbGUpXHJcblxyXG5cclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKClcclxuICAgIGNvbnN0IHRhYnMgPSBtZW51LnRhYnNcclxuICAgIGxldCBhbGxvd0V4aXQgPSBjcmVhdGlvbiA/IGZhbHNlIDogbWVudS5hbGxvd0V4aXRcclxuXHJcbiAgICBhcm1vdXIgPSBHZXRQZWRBcm1vdXIocGVkSGFuZGxlKVxyXG5cclxuICAgIGxldCBvdXRmaXRzID0gW11cclxuXHJcbiAgICBjb25zdCBoYXNPdXRmaXRUYWIgPSB0YWJzLmluY2x1ZGVzKCdvdXRmaXRzJylcclxuICAgIGlmIChoYXNPdXRmaXRUYWIpIG91dGZpdHMgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8T3V0Zml0W10+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRPdXRmaXRzJywgZnJhbWV3b3JrZElkKSBhcyBPdXRmaXRbXVxyXG5cclxuICAgIGxldCBtb2RlbHMgPSBbXVxyXG5cclxuICAgIGNvbnN0IGhhc0hlcml0YWdlVGFiID0gdGFicy5pbmNsdWRlcygnaGVyaXRhZ2UnKVxyXG4gICAgaWYgKGhhc0hlcml0YWdlVGFiKSB7XHJcbiAgICAgICAgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaGFzVGF0dG9vVGFiID0gdGFicy5pbmNsdWRlcygndGF0dG9vcycpXHJcbiAgICBsZXQgdGF0dG9vc1xyXG4gICAgaWYgKGhhc1RhdHRvb1RhYikge1xyXG4gICAgICAgIHRhdHRvb3MgPSBnZXRUYXR0b29EYXRhKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBibGFja2xpc3QgPSBnZXRCbGFja2xpc3Qoem9uZSlcclxuXHJcbiAgICBpZiAoY3JlYXRpb24pIHtcclxuICAgICAgICBjb25zdCBtb2RlbCA9IEdldEhhc2hLZXkoZ2V0UGxheWVyR2VuZGVyTW9kZWwoKSk7XHJcbiAgICAgICAgcGVkSGFuZGxlID0gYXdhaXQgc2V0TW9kZWwocGVkSGFuZGxlLCBtb2RlbCk7XHJcbiAgICAgICAgZW1pdE5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2V0cm91dGluZ2J1Y2tldCcpXHJcbiAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHVwZGF0ZVBlZChwZWRIYW5kbGUpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkSGFuZGxlKVxyXG5cclxuICAgIHN0YXJ0Q2FtZXJhKClcclxuXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC5kYXRhLCB7XHJcbiAgICAgICAgdGFicyxcclxuICAgICAgICBhcHBlYXJhbmNlLFxyXG4gICAgICAgIGJsYWNrbGlzdCxcclxuICAgICAgICB0YXR0b29zLFxyXG4gICAgICAgIG91dGZpdHMsXHJcbiAgICAgICAgbW9kZWxzLFxyXG4gICAgICAgIGFsbG93RXhpdCxcclxuICAgICAgICBqb2I6IGdldEpvYkluZm8oKSxcclxuICAgICAgICBsb2NhbGU6IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpXHJcbiAgICB9KVxyXG4gICAgU2V0TnVpRm9jdXModHJ1ZSwgdHJ1ZSlcclxuICAgIHNlbmROVUlFdmVudChTZW5kLnZpc2libGUsIHRydWUpXHJcbiAgICBvcGVuID0gdHJ1ZVxyXG5cclxuICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5oaWRlSHVkKHRydWUpXHJcblxyXG4gICAgaWYgKHByb21pc2UpIHtcclxuICAgICAgICBhd2FpdCBwcm9taXNlXHJcbiAgICAgICAgZW1pdE5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6cmVzZXRyb3V0aW5nYnVja2V0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvbWlzZSA9IG51bGw7XHJcbiAgICByZXNvbHZlUHJvbWlzZSA9IG51bGw7XHJcbiAgICByZXR1cm4gdHJ1ZVxyXG59XHJcblxyXG5leHBvcnRzKCdvcGVuTWVudScsIG9wZW5NZW51KVxyXG5cclxuZnVuY3Rpb24gZ2V0QmxhY2tsaXN0KHpvbmU6IFRBcHBlYXJhbmNlWm9uZSkge1xyXG4gICAgaWYgKCF6b25lKSByZXR1cm4ge31cclxuXHJcbiAgICBjb25zdCB7Z3JvdXBUeXBlcywgYmFzZX0gPSBjb25maWcuYmxhY2tsaXN0KClcclxuXHJcbiAgICBpZiAoIWdyb3VwVHlwZXMpIHJldHVybiB7fVxyXG4gICAgaWYgKCFiYXNlKSByZXR1cm4ge31cclxuXHJcbiAgICBsZXQgYmxhY2tsaXN0ID0gey4uLmJhc2V9XHJcblxyXG4gICAgY29uc3QgcGxheWVyRGF0YSA9IGdldFBsYXllckRhdGEoKVxyXG5cclxuXHJcbiAgICBmb3IgKGNvbnN0IHR5cGUgaW4gZ3JvdXBUeXBlcykge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwcyA9IGdyb3VwVHlwZXNbdHlwZV1cclxuICAgICAgICBmb3IgKGNvbnN0IGdyb3VwIGluIGdyb3Vwcykge1xyXG5cclxuICAgICAgICAgICAgbGV0IHNraXA6IGJvb2xlYW4gPSBmYWxzZVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ2pvYnMnICYmIHpvbmUuam9icykge1xyXG4gICAgICAgICAgICAgICAgc2tpcCA9IHpvbmUuam9icy5pbmNsdWRlcyhwbGF5ZXJEYXRhLmpvYi5uYW1lKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZSA9PSAnZ2FuZ3MnICYmIHpvbmUuZ2FuZ3MpIHtcclxuICAgICAgICAgICAgICAgIHNraXAgPSB6b25lLmdhbmdzLmluY2x1ZGVzKHBsYXllckRhdGEuZ2FuZy5uYW1lKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiAodHlwZSA9PSAnZ3JvdXBzJyAmJiB6b25lLmdyb3Vwcykge1xyXG4gICAgICAgICAgICAvLyAgICAgc2tpcCA9ICF6b25lLmdyb3Vwcy5pbmNsdWRlcyhwbGF5ZXJEYXRhLmdyb3VwLm5hbWUpXHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghc2tpcCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ3JvdXBCbGFja2xpc3QgPSBncm91cHNbZ3JvdXBdXHJcbiAgICAgICAgICAgICAgICBibGFja2xpc3QgPSBPYmplY3QuYXNzaWduKHt9LCBibGFja2xpc3QsIGdyb3VwQmxhY2tsaXN0LCB7XHJcbiAgICAgICAgICAgICAgICAgIGRyYXdhYmxlczogT2JqZWN0LmFzc2lnbih7fSwgYmxhY2tsaXN0LmRyYXdhYmxlcywgZ3JvdXBCbGFja2xpc3QuZHJhd2FibGVzKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYmxhY2tsaXN0XHJcblxyXG4gICAgLy8gcmV0dXJuIGJsYWNrbGlzdFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VNZW51KCkge1xyXG4gICAgU2V0UGVkQXJtb3VyKHBlZCwgYXJtb3VyKVxyXG5cclxuICAgIHN0b3BDYW1lcmEoKVxyXG4gICAgU2V0TnVpRm9jdXMoZmFsc2UsIGZhbHNlKVxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQudmlzaWJsZSwgZmFsc2UpXHJcblxyXG5cclxuICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5oaWRlSHVkKGZhbHNlKVxyXG5cclxuICAgIGlmIChyZXNvbHZlUHJvbWlzZSkge1xyXG4gICAgICAgIHJlc29sdmVQcm9taXNlKCk7XHJcbiAgICB9XHJcbiAgICBvcGVuID0gZmFsc2VcclxufVxyXG4iLCAiXG5pbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcbmltcG9ydCB7IHNldFBlZEFwcGVhcmFuY2UgfSBmcm9tIFwiLi4vYXBwZWFyYW5jZS9zZXR0ZXJzXCJcbmltcG9ydCB7IG9wZW5NZW51IH0gZnJvbSBcIi4uL21lbnVcIlxuXG5leHBvcnQgZnVuY3Rpb24gUUJCcmlkZ2UoKSB7XG4gICAgb25OZXQoJ3FiLWNsb3RoaW5nOmNsaWVudDpsb2FkUGxheWVyQ2xvdGhpbmcnLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGF3YWl0IHNldFBlZEFwcGVhcmFuY2UocGVkLCBhcHBlYXJhbmNlKVxuICAgIH0pXG5cbiAgICBvbk5ldCgncWItY2xvdGhlczpjbGllbnQ6Q3JlYXRlRmlyc3RDaGFyYWN0ZXInLCAoKSA9PiB7XG4gICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24oKVxuICAgIH0pXG5cbiAgICBvbk5ldCgncWItY2xvdGhpbmc6Y2xpZW50Om9wZW5PdXRmaXRNZW51JywgKCkgPT4ge1xuICAgICAgICBvcGVuTWVudSh7IHR5cGU6IFwib3V0Zml0c1wiLCBjb29yZHM6IFswLCAwLCAwLCAwXSB9KSAgXG4gICAgfSlcbn0iLCAiXG5pbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcbmltcG9ydCB7IHNldFBlZEFwcGVhcmFuY2UsIHNldFBsYXllclBlZEFwcGVhcmFuY2UgfSBmcm9tIFwiLi4vYXBwZWFyYW5jZS9zZXR0ZXJzXCJcbmltcG9ydCB7IGdldEZyYW1ld29ya0lELCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2sgfSBmcm9tIFwiQHV0aWxzXCJcblxuZXhwb3J0IGZ1bmN0aW9uIEVTWEJyaWRnZSgpIHtcbiAgICBsZXQgZmlyc3RTcGF3biA9IGZhbHNlXG5cbiAgICBvbihcImVzeF9za2luOnJlc2V0Rmlyc3RTcGF3blwiLCAoKSA9PiB7XG4gICAgICAgIGZpcnN0U3Bhd24gPSB0cnVlXG4gICAgfSk7XG5cbiAgICBvbihcImVzeF9za2luOnBsYXllclJlZ2lzdGVyZWRcIiwgKCkgPT4ge1xuICAgICAgICBpZihmaXJzdFNwYXduKVxuICAgICAgICAgICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkluaXRpYWxDcmVhdGlvbigpXG4gICAgfSk7XG5cbiAgICBvbk5ldCgnc2tpbmNoYW5nZXI6bG9hZFNraW4yJywgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoIWFwcGVhcmFuY2UubW9kZWwpIGFwcGVhcmFuY2UubW9kZWwgPSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKTtcbiAgICAgICAgYXdhaXQgc2V0UGVkQXBwZWFyYW5jZShwZWQsIGFwcGVhcmFuY2UpXG4gICAgfSk7XG5cbiAgICBvbk5ldCgnc2tpbmNoYW5nZXI6Z2V0U2tpbicsIGFzeW5jIChjYjogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGZyYW1ld29ya0lEID0gYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxuICAgICAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxuICAgICAgICBjYihhcHBlYXJhbmNlKVxuICAgIH0pXG5cbiAgICBvbk5ldCgnc2tpbmNoYW5nZXI6bG9hZFNraW4nLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBhbnkpID0+IHtcbiAgICAgICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxuICAgICAgICBpZiAoY2IpIGNiKClcbiAgICB9KVxuXG4gICAgb25OZXQoJ2VzeF9za2luOm9wZW5TYXZlYWJsZU1lbnUnLCBhc3luYyAob25TdWJtaXQ6IGFueSkgPT4ge1xuICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKG9uU3VibWl0KVxuICAgIH0pXG59IiwgImltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIjtcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldERyYXdhYmxlcywgZ2V0UHJvcHMgfSBmcm9tIFwiLi4vYXBwZWFyYW5jZS9nZXR0ZXJzXCI7XG5pbXBvcnQgeyBzZXREcmF3YWJsZSwgc2V0TW9kZWwsIHNldFBlZEFwcGVhcmFuY2UsIHNldFBlZFRhdHRvb3MsIHNldFByb3AgfSBmcm9tIFwiLi4vYXBwZWFyYW5jZS9zZXR0ZXJzXCI7XG5pbXBvcnQgeyBUVGF0dG9vIH0gZnJvbSBcIkB0eXBpbmdzL3RhdHRvb3NcIjtcblxuZnVuY3Rpb24gZXhwb3J0SGFuZGxlcihuYW1lOiBzdHJpbmcsIGNiOiBhbnkpIHtcbiAgICBvbignX19jZnhfZXhwb3J0X2lsbGVuaXVtLWFwcGVhcmFuY2VfJyArIG5hbWUsIChzZXRDQjogYW55KSA9PiB7XG4gICAgICAgIHNldENCKGNiKTtcbiAgICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaWxsZW5pdW1Db21wYXQoKSB7XG4gICAgZXhwb3J0SGFuZGxlcignc3RhcnRQbGF5ZXJDdXN0b21pemF0aW9uJywgKCkgPT4ge1xuICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKClcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZE1vZGVsJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHJldHVybiBHZXRFbnRpdHlNb2RlbChwZWQpXG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRDb21wb25lbnRzJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGRyYXdhYmxlczogYW55ID0gZ2V0RHJhd2FibGVzKHBlZClbMF07XG4gICAgICAgIGxldCBuZXdkcmF3YWJsZSA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGRyYXdhYmxlcykge1xuICAgICAgICAgICAgY29uc3QgZHJhd2FibGUgPSBkcmF3YWJsZXNbaWRdO1xuICAgICAgICAgICAgbmV3ZHJhd2FibGUucHVzaCh7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50X2lkOiBkcmF3YWJsZS5pbmRleCxcbiAgICAgICAgICAgICAgICBkcmF3YWJsZTogZHJhd2FibGUudmFsdWUsXG4gICAgICAgICAgICAgICAgdGV4dHVyZTogZHJhd2FibGUudGV4dHVyZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkUHJvcHMnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgcHJvcHM6IGFueSA9ICBnZXRQcm9wcyhwZWQpWzBdO1xuICAgICAgICBsZXQgbmV3UHJvcHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpZCBvZiBwcm9wcykge1xuICAgICAgICAgICAgY29uc3QgcHJvcCA9IHByb3BzW2lkXTtcbiAgICAgICAgICAgIG5ld1Byb3BzLnB1c2goe1xuICAgICAgICAgICAgICAgIHByb3BfaWQ6IHByb3AuaW5kZXgsXG4gICAgICAgICAgICAgICAgZHJhd2FibGU6IHByb3AudmFsdWUsXG4gICAgICAgICAgICAgICAgdGV4dHVyZTogcHJvcC50ZXh0dXJlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRIZWFkQmxlbmQnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgICAgICAvL3JldHVybiBnZXRIZWFkQmxlbmREYXRhKHBlZCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRGYWNlRmVhdHVyZXMnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgICAgICAvL3JldHVybiBnZXRIZWFkU3RydWN0dXJlKHBlZCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRIZWFkT3ZlcmxheXMnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgICAgICAvL3JldHVybiBnZXRIZWFkT3ZlcmxheShwZWQpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkSGFpcicsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICAvL3JldHVybiBnZXRIYWlyKHBlZCk7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEFwcGVhcmFuY2UnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldEFwcGVhcmFuY2UocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBsYXllck1vZGVsJywgKG1vZGVsOiBudW1iZXIpID0+IHtcbiAgICAgICAgc2V0TW9kZWwoUGxheWVyUGVkSWQoKSwgbW9kZWwpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkSGVhZEJsZW5kJywgKHBlZDogbnVtYmVyLCBibGVuZDogYW55KSA9PiB7XG4gICAgICAgIC8vc2V0SGVhZEJsZW5kKHBlZCwgYmxlbmQpO1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRGYWNlRmVhdHVyZXMnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZEhlYWRPdmVybGF5cycsIChwZWQ6IG51bWJlciwgb3ZlcmxheTogYW55KSA9PiB7XG4gICAgICAgIC8vc2V0SGVhZE92ZXJsYXkocGVkLCBvdmVybGF5KTtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkSGFpcicsIGFzeW5jIChwZWQ6IG51bWJlciwgaGFpcjogYW55LCB0YXR0b286IGFueSkgPT4ge1xuICAgICAgICAvL3NldFBlZEhhaXJDb2xvcnMocGVkLCBoYWlyKTtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkRXllQ29sb3InLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZENvbXBvbmVudCcsIChwZWQ6IG51bWJlciwgZHJhd2FibGU6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCBuZXdEcmF3YWJsZSA9IHtcbiAgICAgICAgICAgIGluZGV4OiBkcmF3YWJsZS5jb21wb25lbnRfaWQsXG4gICAgICAgICAgICB2YWx1ZTogZHJhd2FibGUuZHJhd2FibGUsXG4gICAgICAgICAgICB0ZXh0dXJlOiBkcmF3YWJsZS50ZXh0dXJlXG4gICAgICAgIH1cbiAgICAgICAgc2V0RHJhd2FibGUocGVkLCBuZXdEcmF3YWJsZSk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRDb21wb25lbnRzJywgKHBlZDogbnVtYmVyLCBjb21wb25lbnRzOiBhbnkpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBjb21wb25lbnQgb2YgY29tcG9uZW50cykge1xuICAgICAgICAgICAgY29uc3QgbmV3RHJhd2FibGUgPSB7XG4gICAgICAgICAgICAgICAgaW5kZXg6IGNvbXBvbmVudC5jb21wb25lbnRfaWQsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNvbXBvbmVudC5kcmF3YWJsZSxcbiAgICAgICAgICAgICAgICB0ZXh0dXJlOiBjb21wb25lbnQudGV4dHVyZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0RHJhd2FibGUocGVkLCBuZXdEcmF3YWJsZSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZFByb3AnLCAocGVkOiBudW1iZXIsIHByb3A6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCBuZXdQcm9wID0ge1xuICAgICAgICAgICAgaW5kZXg6IHByb3AucHJvcF9pZCxcbiAgICAgICAgICAgIHZhbHVlOiBwcm9wLmRyYXdhYmxlLFxuICAgICAgICAgICAgdGV4dHVyZTogcHJvcC50ZXh0dXJlXG4gICAgICAgIH1cbiAgICAgICAgc2V0UHJvcChwZWQsIG5ld1Byb3ApO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkUHJvcHMnLCAocGVkOiBudW1iZXIsIHByb3BzOiBhbnkpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBwcm9wIG9mIHByb3BzKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdQcm9wID0ge1xuICAgICAgICAgICAgICAgIGluZGV4OiBwcm9wLnByb3BfaWQsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHByb3AuZHJhd2FibGUsXG4gICAgICAgICAgICAgICAgdGV4dHVyZTogcHJvcC50ZXh0dXJlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRQcm9wKHBlZCwgbmV3UHJvcCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGV4cG9ydEhhbmRsZXIoJ3NldFBsYXllckFwcGVhcmFuY2UnLCAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UpID0+IHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbnNvbGUud2FybignTmVlZCB0byBiZSBpbXBsZW1lbnRlZCcpO1xuICAgIC8vIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkQXBwZWFyYW5jZScsIChwZWQ6IG51bWJlciwgYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UpID0+IHtcbiAgICAgICAgc2V0UGVkQXBwZWFyYW5jZShwZWQsIGFwcGVhcmFuY2UpXG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRUYXR0b29zJywgKHBlZDogbnVtYmVyLCB0YXR0b29zOiBUVGF0dG9vW10pID0+IHtcbiAgICAgICAgc2V0UGVkVGF0dG9vcyhwZWQsIHRhdHRvb3MpXG4gICAgfSk7XG59IiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUQXBwZWFyYW5jZVpvbmUsIFRNZW51VHlwZXMgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCB7IG9wZW5NZW51IH0gZnJvbSBcIi4vbWVudVwiXHJcbmltcG9ydCB7IHNldFBlZEFwcGVhcmFuY2UsIHNldFBsYXllclBlZEFwcGVhcmFuY2UgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxyXG5pbXBvcnQgeyB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIGdldEZyYW1ld29ya0lELCBEZWxheSwgYmxfYnJpZGdlLCBwZWQsIGRlbGF5LCBmb3JtYXQgfSBmcm9tIFwiQHV0aWxzXCJcclxuaW1wb3J0IHsgUUJCcmlkZ2UgfSBmcm9tIFwiLi9icmlkZ2UvcWJcIlxyXG5pbXBvcnQgeyBFU1hCcmlkZ2UgfSBmcm9tIFwiLi9icmlkZ2UvZXN4XCJcclxuaW1wb3J0IHsgaWxsZW5pdW1Db21wYXQgfSBmcm9tIFwiLi9jb21wYXQvaWxsZW5pdW1cIlxyXG5cclxuUmVnaXN0ZXJDb21tYW5kKCdvcGVuTWVudScsIGFzeW5jIChfLCBhcmdzOiBzdHJpbmdbXSkgPT4ge1xyXG4gICAgY29uc3QgdHlwZSA9IGFyZ3NbMF1cclxuICAgIGlmICghdHlwZSkge1xyXG4gICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24oKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCB6b25lID0gdHlwZS50b0xvd2VyQ2FzZSgpIGFzIFRNZW51VHlwZXNcclxuICAgICAgICBvcGVuTWVudSh7IHR5cGU6IHpvbmUsIGNvb3JkczogWzAsIDAsIDAsIDBdIH0pXHJcbiAgICB9XHJcbn0sIHRydWUpXHJcblxyXG5leHBvcnRzKCdTZXRQZWRBcHBlYXJhbmNlJywgYXN5bmMgKHBlZDogbnVtYmVyLCBhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSkgPT4ge1xyXG4gICAgYXdhaXQgc2V0UGVkQXBwZWFyYW5jZShwZWQsIGFwcGVhcmFuY2UpXHJcbn0pXHJcblxyXG5leHBvcnRzKCdTZXRQbGF5ZXJQZWRBcHBlYXJhbmNlJywgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlIHwgc3RyaW5nKSA9PiB7XHJcbiAgICBsZXQgcmVzb2x2ZWRBcHBlYXJhbmNlOiBUQXBwZWFyYW5jZTtcclxuICAgIFxyXG4gICAgaWYgKCFhcHBlYXJhbmNlIHx8IHR5cGVvZiBhcHBlYXJhbmNlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIGNvbnN0IGZyYW1ld29ya0lEOiBzdHJpbmcgPSBhcHBlYXJhbmNlIHx8IGF3YWl0IGdldEZyYW1ld29ya0lEKCk7XHJcbiAgICAgICAgcmVzb2x2ZWRBcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKSBhcyBUQXBwZWFyYW5jZTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGFwcGVhcmFuY2UgPT09ICdvYmplY3QnKSByZXNvbHZlZEFwcGVhcmFuY2UgPSBhcHBlYXJhbmNlO1xyXG4gICAgXHJcbiAgICBpZiAoIXJlc29sdmVkQXBwZWFyYW5jZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gdmFsaWQgYXBwZWFyYW5jZSBmb3VuZCcpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKHJlc29sdmVkQXBwZWFyYW5jZSk7XHJcbn0pO1xyXG5cclxuZXhwb3J0cygnR2V0UGxheWVyUGVkQXBwZWFyYW5jZScsIGFzeW5jIChmcmFtZXdvcmtJRDogc3RyaW5nKSA9PiB7XHJcbiAgICBmcmFtZXdvcmtJRCA9IGZyYW1ld29ya0lEIHx8IGF3YWl0IGdldEZyYW1ld29ya0lEKClcclxuICAgIHJldHVybiBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcbn0pXHJcblxyXG5leHBvcnRzKCdJbml0aWFsQ3JlYXRpb24nLCBhc3luYyAoY2I/OiBGdW5jdGlvbikgPT4ge1xyXG4gICAgLy8gVGhlIGZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIHR5cGUgb2YgVEFwcGVhcmFuY2Vab25lIG1lYW5pbmcgaXQgbmVlZHMgYSBjb29yZHMgcHJvcGVydHksIGJ1dCBpbiB0aGlzIGNhc2UgaXQncyBub3QgdXNlZFxyXG4gICAgYXdhaXQgb3Blbk1lbnUoeyB0eXBlOiBcImFwcGVhcmFuY2VcIiwgY29vcmRzOiBbMCwgMCwgMCwgMF0gfSwgdHJ1ZSlcclxuICAgIGlmIChjYikgY2IoKVxyXG59KVxyXG5cclxub24oJ2JsX3Nwcml0ZXM6Y2xpZW50OnVzZVpvbmUnLCAoem9uZTogVEFwcGVhcmFuY2Vab25lKSA9PiB7XHJcbiAgICBvcGVuTWVudSh6b25lKVxyXG59KVxyXG5cclxub25OZXQoJ2JsX2JyaWRnZTpjbGllbnQ6cGxheWVyTG9hZGVkJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgd2hpbGUgKCFibF9icmlkZ2UuY29yZSgpLnBsYXllckxvYWRlZCgpKSB7XHJcbiAgICAgICAgYXdhaXQgRGVsYXkoMTAwKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGZyYW1ld29ya0lEID0gYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxuICAgIGlmICghYXBwZWFyYW5jZSkgcmV0dXJuO1xyXG4gICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxyXG59KVxyXG5cclxub25OZXQoJ29uUmVzb3VyY2VTdGFydCcsIGFzeW5jIChyZXNvdXJjZTogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAocmVzb3VyY2UgPT09IEdldEN1cnJlbnRSZXNvdXJjZU5hbWUoKSAmJiBibF9icmlkZ2UuY29yZSgpLnBsYXllckxvYWRlZCgpKSB7XHJcbiAgICAgICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICAgICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxuICAgICAgICBpZiAoIWFwcGVhcmFuY2UpIHJldHVybjtcclxuICAgICAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcbiAgICB9XHJcbn0pXHJcblxyXG5jb25zdCBmcmFtZXdvcmtOYW1lID0gYmxfYnJpZGdlLmdldEZyYW1ld29yaygnY29yZScpXHJcbmNvbnN0IGNvcmUgPSBmb3JtYXQoR2V0Q29udmFyKCdibDpmcmFtZXdvcmsnLCAncWInKSlcclxuXHJcbmlmIChjb3JlID09ICdxYicgfHwgY29yZSA9PSAncWJ4JyAmJiBHZXRSZXNvdXJjZVN0YXRlKGZyYW1ld29ya05hbWUpID09ICdzdGFydGVkJykge1xyXG4gICAgUUJCcmlkZ2UoKTtcclxufSBlbHNlIGlmIChjb3JlID09ICdlc3gnICYmIEdldFJlc291cmNlU3RhdGUoZnJhbWV3b3JrTmFtZSkgPT0gJ3N0YXJ0ZWQnKSB7XHJcbiAgICBFU1hCcmlkZ2UoKTtcclxufVxyXG5cclxuaWxsZW5pdW1Db21wYXQoKTtcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgncmVsb2Fkc2tpbicsIGFzeW5jICgpID0+IHtcclxuICAgIGNvbnN0IGZyYW1ld29ya0lEID0gYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgY29uc3QgaGVhbHRoID0gR2V0RW50aXR5SGVhbHRoKHBlZCk7XHJcbiAgICBjb25zdCBtYXhoZWFsdGggPSBHZXRFbnRpdHlNYXhIZWFsdGgocGVkKTtcclxuICAgIGNvbnN0IGFybW9yID0gR2V0UGVkQXJtb3VyKHBlZCk7XHJcblxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxuICAgIGlmICghYXBwZWFyYW5jZSkgcmV0dXJuO1xyXG4gICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxyXG5cclxuICAgIFNldFBlZE1heEhlYWx0aChwZWQsIG1heGhlYWx0aClcclxuICAgIGRlbGF5KDEwMDApIFxyXG4gICAgU2V0RW50aXR5SGVhbHRoKHBlZCwgaGVhbHRoKVxyXG4gICAgU2V0UGVkQXJtb3VyKHBlZCwgYXJtb3IpXHJcbn0sIGZhbHNlKVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7O0FBQU8sSUFBSSxNQUFNO0FBRVYsSUFB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
