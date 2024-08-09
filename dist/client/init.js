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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvcWIudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvZXN4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvY29tcGF0L2lsbGVuaXVtLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvaW5pdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCBwZWQgPSAwXHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlUGVkID0gKHBlZEhhbmRsZTogbnVtYmVyKSA9PiB7XHJcbiAgICBwZWQgPSBwZWRIYW5kbGVcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlYnVnZGF0YSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGEsIChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0sIDIpKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2VuZE5VSUV2ZW50ID0gKGFjdGlvbjogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcclxuICAgIFNlbmROVUlNZXNzYWdlKHtcclxuICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TW9kZWwgPSBhc3luYyAobW9kZWw6IHN0cmluZyB8IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiA9PiB7XHJcbiAgICBsZXQgbW9kZWxIYXNoOiBudW1iZXIgPSB0eXBlb2YgbW9kZWwgPT09ICdudW1iZXInID8gbW9kZWwgOiBHZXRIYXNoS2V5KG1vZGVsKVxyXG5cclxuICAgIGlmICghSXNNb2RlbFZhbGlkKG1vZGVsSGFzaCkgJiYgIUlzTW9kZWxJbkNkaW1hZ2UobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIC8vIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAvLyAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgLy8gICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgLy8gICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgLy8gfSlcclxuXHJcbiAgICAgICAgY29uc29sZS53YXJuKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9ibF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5OiBzdHJpbmcsIC4uLmFyZ3M6IGFueSkgPT4ge1xyXG4gICAgY29uc3QgcmVzb2x2ZSA9IGFjdGl2ZUV2ZW50c1trZXldO1xyXG4gICAgcmV0dXJuIHJlc29sdmUgJiYgcmVzb2x2ZSguLi5hcmdzKTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlclNlcnZlckNhbGxiYWNrPFQgPSB1bmtub3duPihcclxuICAgIGV2ZW50TmFtZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlcclxuKTogUHJvbWlzZTxUPiB8IHZvaWQge1xyXG4gICAgaWYgKCFldmVudFRpbWVyKGV2ZW50TmFtZSwgMCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGtleTogc3RyaW5nO1xyXG5cclxuICAgIGRvIHtcclxuICAgICAgICBrZXkgPSBgJHtldmVudE5hbWV9OiR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDEwMDAwMCArIDEpKX1gO1xyXG4gICAgfSB3aGlsZSAoYWN0aXZlRXZlbnRzW2tleV0pO1xyXG4gICAgZW1pdE5ldChgX2JsX2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvblNlcnZlckNhbGxiYWNrKGV2ZW50TmFtZSwgY2IpIHtcclxuICAgIG9uTmV0KGBfYmxfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlLCBrZXksIC4uLmFyZ3MpID0+IHtcclxuICAgICAgICBsZXQgcmVzcG9uc2U7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBjYiguLi5hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgaGFuZGxpbmcgY2FsbGJhY2sgZXZlbnQgJHtldmVudE5hbWV9YCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBeMyR7ZS5zdGFja31eMGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbWl0TmV0KGBfYmxfY2JfJHtyZXNvdXJjZX1gLCBrZXksIHJlc3BvbnNlKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vL2xvY2FsZVxyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RMb2NhbGUgPSAocmVzb3VyY2VTZXROYW1lOiBzdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNoZWNrUmVzb3VyY2VGaWxlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoUmVxdWVzdFJlc291cmNlRmlsZVNldChyZXNvdXJjZVNldE5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50TGFuID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmNvbmZpZygpLmxvY2FsZVxyXG4gICAgICAgICAgICAgICAgbGV0IGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvJHtjdXJyZW50TGFufS5qc29uYCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsZUZpbGVDb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtjdXJyZW50TGFufS5qc29uIG5vdCBmb3VuZCBpbiBsb2NhbGUsIHBsZWFzZSB2ZXJpZnkhLCB3ZSB1c2VkIGVuZ2xpc2ggZm9yIG5vdyFgKVxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvZW4uanNvbmApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGxvY2FsZUZpbGVDb250ZW50KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2hlY2tSZXNvdXJjZUZpbGUsIDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2hlY2tSZXNvdXJjZUZpbGUoKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbG9jYWxlID0gYXN5bmMgKGlkOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBjb25zdCBsb2NhbGUgPSBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKTtcclxuICAgIGxldCBhcmdJbmRleCA9IDA7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gbG9jYWxlW2lkXS5yZXBsYWNlKC8lcy9nLCAobWF0Y2g6IHN0cmluZykgPT4gYXJnSW5kZXggPCBhcmdzLmxlbmd0aCA/IGFyZ3NbYXJnSW5kZXhdIDogbWF0Y2gpO1xyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgYmxfYnJpZGdlID0gZXhwb3J0cy5ibF9icmlkZ2VcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRQbGF5ZXJEYXRhID0gKCkgPT4ge1xyXG4gICAgcmV0dXJuIGJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRGcmFtZXdvcmtJRCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGlkID0gZ2V0UGxheWVyRGF0YSgpLmNpZFxyXG4gICAgcmV0dXJuIGlkXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRQbGF5ZXJHZW5kZXJNb2RlbCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGdlbmRlciA9IGdldFBsYXllckRhdGEoKS5nZW5kZXJcclxuICAgIHJldHVybiBnZW5kZXIgPT09ICdtYWxlJyA/ICdtcF9tX2ZyZWVtb2RlXzAxJyA6ICdtcF9mX2ZyZWVtb2RlXzAxJ1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRGVsYXkobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICghc3RyLmluY2x1ZGVzKFwiJ1wiKSkgcmV0dXJuIHN0cjtcclxuICAgIHJldHVybiBzdHIucmVwbGFjZSgvJy9nLCBcIlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEpvYkluZm8oKTogeyBuYW1lOiBzdHJpbmcsIGlzQm9zczogYm9vbGVhbiB9IHwgbnVsbCB7XHJcbiAgICBjb25zdCBqb2IgPSBnZXRQbGF5ZXJEYXRhKCkuam9iXHJcbiAgICByZXR1cm4gam9iID8geyBuYW1lOiBqb2IubmFtZSwgaXNCb3NzOiBqb2IuaXNCb3NzIH0gOiBudWxsXHJcbn1cclxuXHJcbi8vIGxvY2FsIGZ1bmN0aW9uIGlzUGVkRnJlZW1vZGVNb2RlbChwZWQpXHJcbi8vICAgICBsb2NhbCBtb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZClcclxuLy8gICAgIHJldHVybiBtb2RlbCA9PSBgbXBfbV9mcmVlbW9kZV8wMWAgb3IgbW9kZWwgPT0gYG1wX2ZfZnJlZW1vZGVfMDFgXHJcbi8vIGVuZFxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzUGVkRnJlZW1vZGVNb2RlbChwZWQ6IG51bWJlcikge1xyXG4gICAgY29uc3QgbW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWQpXHJcbiAgICByZXR1cm4gbW9kZWwgPT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpIHx8IG1vZGVsID09PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKVxyXG59ICAgIiwgImltcG9ydCB7IENhbWVyYSwgVmVjdG9yMywgVENhbWVyYUJvbmVzIH0gZnJvbSAnQHR5cGluZ3MvY2FtZXJhJztcclxuaW1wb3J0IHsgZGVsYXksIHBlZCB9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IFJlY2VpdmUgfSBmcm9tICdAZXZlbnRzJztcclxuXHJcbmNvbnN0IFdIT0xFX0JPRFlfTUFYX0RJU1RBTkNFID0gMi4wO1xyXG5jb25zdCBERUZBVUxUX01BWF9ESVNUQU5DRSA9IDEuMDtcclxuXHJcbmxldCBydW5uaW5nOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBjYW1EaXN0YW5jZTogbnVtYmVyID0gMS44O1xyXG5sZXQgY2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGFuZ2xlWTogbnVtYmVyID0gMC4wO1xyXG5sZXQgYW5nbGVaOiBudW1iZXIgPSAwLjA7XHJcbmxldCB0YXJnZXRDb29yZHM6IFZlY3RvcjMgfCBudWxsID0gbnVsbDtcclxubGV0IG9sZENhbTogQ2FtZXJhIHwgbnVsbCA9IG51bGw7XHJcbmxldCBjaGFuZ2luZ0NhbTogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgbGFzdFg6IG51bWJlciA9IDA7XHJcbmxldCBjdXJyZW50Qm9uZToga2V5b2YgVENhbWVyYUJvbmVzID0gJ2hlYWQnO1xyXG5cclxuY29uc3QgQ2FtZXJhQm9uZXM6IFRDYW1lcmFCb25lcyA9IHtcclxuICAgIHdob2xlOiAwLFxyXG5cdGhlYWQ6IDMxMDg2LFxyXG5cdHRvcnNvOiAyNDgxOCxcclxuXHRsZWdzOiBbMTYzMzUsIDQ2MDc4XSxcclxuICAgIHNob2VzOiBbMTQyMDEsIDUyMzAxXSxcclxufTtcclxuXHJcbmNvbnN0IGNvcyA9IChkZWdyZWVzOiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG5cdHJldHVybiBNYXRoLmNvcygoZGVncmVlcyAqIE1hdGguUEkpIC8gMTgwKTtcclxufTtcclxuXHJcbmNvbnN0IHNpbiA9IChkZWdyZWVzOiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG5cdHJldHVybiBNYXRoLnNpbigoZGVncmVlcyAqIE1hdGguUEkpIC8gMTgwKTtcclxufTtcclxuXHJcbmNvbnN0IGdldEFuZ2xlcyA9ICgpOiBudW1iZXJbXSA9PiB7XHJcblx0Y29uc3QgeCA9XHJcblx0XHQoKGNvcyhhbmdsZVopICogY29zKGFuZ2xlWSkgKyBjb3MoYW5nbGVZKSAqIGNvcyhhbmdsZVopKSAvIDIpICpcclxuXHRcdGNhbURpc3RhbmNlO1xyXG5cdGNvbnN0IHkgPVxyXG5cdFx0KChzaW4oYW5nbGVaKSAqIGNvcyhhbmdsZVkpICsgY29zKGFuZ2xlWSkgKiBzaW4oYW5nbGVaKSkgLyAyKSAqXHJcblx0XHRjYW1EaXN0YW5jZTtcclxuXHRjb25zdCB6ID0gc2luKGFuZ2xlWSkgKiBjYW1EaXN0YW5jZTtcclxuXHJcblx0cmV0dXJuIFt4LCB5LCB6XTtcclxufTtcclxuXHJcbmNvbnN0IHNldENhbVBvc2l0aW9uID0gKG1vdXNlWD86IG51bWJlciwgbW91c2VZPzogbnVtYmVyKTogdm9pZCA9PiB7XHJcblx0aWYgKCFydW5uaW5nIHx8ICF0YXJnZXRDb29yZHMgfHwgY2hhbmdpbmdDYW0pIHJldHVybjtcclxuXHJcblx0bW91c2VYID0gbW91c2VYID8/IDAuMDtcclxuXHRtb3VzZVkgPSBtb3VzZVkgPz8gMC4wO1xyXG5cclxuXHRhbmdsZVogLT0gbW91c2VYO1xyXG5cdGFuZ2xlWSArPSBtb3VzZVk7XHJcblxyXG4gICAgY29uc3QgaXNIZWFkT3JXaG9sZSA9IGN1cnJlbnRCb25lID09PSAnd2hvbGUnIHx8IGN1cnJlbnRCb25lID09PSAnaGVhZCc7XHJcbiAgICBjb25zdCBtYXhBbmdsZSA9IGlzSGVhZE9yV2hvbGUgPyA4OS4wIDogNzAuMDtcclxuICAgIFxyXG4gICAgY29uc3QgaXNTaG9lcyA9IGN1cnJlbnRCb25lID09PSAnc2hvZXMnO1xyXG4gICAgY29uc3QgbWluQW5nbGUgPSBpc1Nob2VzID8gNS4wIDogLTIwLjA7XHJcblxyXG5cdGFuZ2xlWSA9IE1hdGgubWluKE1hdGgubWF4KGFuZ2xlWSwgbWluQW5nbGUpLCBtYXhBbmdsZSk7XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpO1xyXG5cclxuXHRTZXRDYW1Db29yZChcclxuXHRcdGNhbSxcclxuXHRcdHRhcmdldENvb3Jkcy54ICsgeCxcclxuXHRcdHRhcmdldENvb3Jkcy55ICsgeSxcclxuXHRcdHRhcmdldENvb3Jkcy56ICsgelxyXG5cdCk7XHJcblx0UG9pbnRDYW1BdENvb3JkKGNhbSwgdGFyZ2V0Q29vcmRzLngsIHRhcmdldENvb3Jkcy55LCB0YXJnZXRDb29yZHMueik7XHJcbn07XHJcblxyXG5jb25zdCBtb3ZlQ2FtZXJhID0gYXN5bmMgKGNvb3JkczogVmVjdG9yMywgZGlzdGFuY2U/OiBudW1iZXIpID0+IHtcclxuXHRjb25zdCBoZWFkaW5nOiBudW1iZXIgPSBHZXRFbnRpdHlIZWFkaW5nKHBlZCkgKyA5NDtcclxuXHRkaXN0YW5jZSA9IGRpc3RhbmNlID8/IDEuMDtcclxuXHJcblx0Y2hhbmdpbmdDYW0gPSB0cnVlO1xyXG5cdGNhbURpc3RhbmNlID0gZGlzdGFuY2U7XHJcblx0YW5nbGVaID0gaGVhZGluZztcclxuXHJcblx0Y29uc3QgW3gsIHksIHpdID0gZ2V0QW5nbGVzKCk7XHJcblxyXG5cdGNvbnN0IG5ld2NhbTogQ2FtZXJhID0gQ3JlYXRlQ2FtV2l0aFBhcmFtcyhcclxuXHRcdCdERUZBVUxUX1NDUklQVEVEX0NBTUVSQScsXHJcblx0XHRjb29yZHMueCArIHgsXHJcblx0XHRjb29yZHMueSArIHksXHJcblx0XHRjb29yZHMueiArIHosXHJcblx0XHQwLjAsXHJcblx0XHQwLjAsXHJcblx0XHQwLjAsXHJcblx0XHQ3MC4wLFxyXG5cdFx0ZmFsc2UsXHJcblx0XHQwXHJcblx0KTtcclxuXHJcblx0dGFyZ2V0Q29vcmRzID0gY29vcmRzO1xyXG5cdGNoYW5naW5nQ2FtID0gZmFsc2U7XHJcblx0b2xkQ2FtID0gY2FtO1xyXG5cdGNhbSA9IG5ld2NhbTtcclxuXHJcblx0UG9pbnRDYW1BdENvb3JkKG5ld2NhbSwgY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMueik7XHJcblx0U2V0Q2FtQWN0aXZlV2l0aEludGVycChuZXdjYW0sIG9sZENhbSwgMjUwLCAwLCAwKTtcclxuXHJcblx0YXdhaXQgZGVsYXkoMjUwKTtcclxuXHJcblx0U2V0Q2FtVXNlU2hhbGxvd0RvZk1vZGUobmV3Y2FtLCB0cnVlKTtcclxuXHRTZXRDYW1OZWFyRG9mKG5ld2NhbSwgMC40KTtcclxuXHRTZXRDYW1GYXJEb2YobmV3Y2FtLCAxLjIpO1xyXG5cdFNldENhbURvZlN0cmVuZ3RoKG5ld2NhbSwgMC4zKTtcclxuXHR1c2VIaURvZihuZXdjYW0pO1xyXG5cclxuXHREZXN0cm95Q2FtKG9sZENhbSwgdHJ1ZSk7XHJcbn07XHJcblxyXG5jb25zdCB1c2VIaURvZiA9IChjdXJyZW50Y2FtOiBDYW1lcmEpID0+IHtcclxuXHRpZiAoIShEb2VzQ2FtRXhpc3QoY2FtKSAmJiBjdXJyZW50Y2FtID09IGNhbSkpIHJldHVybjtcclxuXHRTZXRVc2VIaURvZigpO1xyXG5cdHNldFRpbWVvdXQodXNlSGlEb2YsIDApO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0YXJ0Q2FtZXJhID0gKCkgPT4ge1xyXG5cdGlmIChydW5uaW5nKSByZXR1cm47XHJcblx0cnVubmluZyA9IHRydWU7XHJcblx0Y2FtRGlzdGFuY2UgPSBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRVxyXG5cdGNhbSA9IENyZWF0ZUNhbSgnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLCB0cnVlKTtcclxuXHRjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIDMxMDg2LCAwLjAsIDAuMCwgMC4wKTtcclxuXHRTZXRDYW1Db29yZChjYW0sIHgsIHksIHopO1xyXG5cdFJlbmRlclNjcmlwdENhbXModHJ1ZSwgdHJ1ZSwgMTAwMCwgdHJ1ZSwgdHJ1ZSk7XHJcblx0Ly8gbW92ZUNhbWVyYSh7IHg6IHgsIHk6IHksIHo6IHogfSwgY2FtRGlzdGFuY2UpO1xyXG4gICAgc2V0Q2FtZXJhKCd3aG9sZScsIGNhbURpc3RhbmNlKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdG9wQ2FtZXJhID0gKCk6IHZvaWQgPT4ge1xyXG5cdGlmICghcnVubmluZykgcmV0dXJuO1xyXG5cdHJ1bm5pbmcgPSBmYWxzZTtcclxuXHJcblx0UmVuZGVyU2NyaXB0Q2FtcyhmYWxzZSwgdHJ1ZSwgMjUwLCB0cnVlLCBmYWxzZSk7XHJcblx0RGVzdHJveUNhbShjYW0sIHRydWUpO1xyXG5cdGNhbSA9IG51bGw7XHJcblx0dGFyZ2V0Q29vcmRzID0gbnVsbDtcclxufTtcclxuXHJcbmNvbnN0IHNldENhbWVyYSA9ICh0eXBlPzoga2V5b2YgVENhbWVyYUJvbmVzLCBkaXN0YW5jZSA9IGNhbURpc3RhbmNlKTogdm9pZCA9PiB7XHJcblxyXG5cdGNvbnN0IGJvbmU6IG51bWJlciB8IG51bWJlcltdIHwgdW5kZWZpbmVkID0gQ2FtZXJhQm9uZXNbdHlwZV07XHJcblxyXG4gICAgY29uc3QgaXNCb25lQXJyYXkgPSBBcnJheS5pc0FycmF5KGJvbmUpXHJcblxyXG4gICAgY3VycmVudEJvbmUgPSB0eXBlO1xyXG5cclxuICAgIGlmICghaXNCb25lQXJyYXkgJiYgYm9uZSA9PT0gMCkge1xyXG4gICAgICAgIGNvbnN0IFt4LCB5LCB6XTogbnVtYmVyW10gPSBHZXRFbnRpdHlDb29yZHMocGVkLCBmYWxzZSk7XHJcbiAgICAgICAgbW92ZUNhbWVyYShcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgeDogeCxcclxuICAgICAgICAgICAgICAgIHk6IHksXHJcbiAgICAgICAgICAgICAgICB6OiB6ICsgMC4wLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkaXN0YW5jZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIGl0cyBub3Qgd2hvbGUgYm9keSwgdGhlbiB3ZSBuZWVkIHRvIGxpbWl0IHRoZSBkaXN0YW5jZVxyXG4gICAgaWYgKGRpc3RhbmNlID4gREVGQVVMVF9NQVhfRElTVEFOQ0UpIGRpc3RhbmNlID0gREVGQVVMVF9NQVhfRElTVEFOQ0U7XHJcblxyXG4gICAgaWYgKGlzQm9uZUFycmF5KSB7XHJcbiAgICAgICAgY29uc3QgW3gxLCB5MSwgejFdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCBib25lWzBdLCAwLjAsIDAuMCwgMC4wKVxyXG5cclxuICAgICAgICBjb25zdCBbeDIsIHkyLCB6Ml06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmVbMV0sIDAuMCwgMC4wLCAwLjApXHJcblxyXG4gICAgICAgIC8vIGdldCB0aGUgbWlkZGxlIG9mIHRoZSB0d28gcG9pbnRzXHJcbiAgICAgICAgdmFyIHggPSAoeDEgKyB4MikgLyAyO1xyXG4gICAgICAgIHZhciB5ID0gKHkxICsgeTIpIC8gMjtcclxuICAgICAgICB2YXIgeiA9ICh6MSArIHoyKSAvIDI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBbeCwgeSwgel06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmUsIDAuMCwgMC4wLCAwLjApXHJcbiAgICB9XHJcblxyXG5cdG1vdmVDYW1lcmEoXHJcblx0XHR7XHJcblx0XHRcdHg6IHgsXHJcblx0XHRcdHk6IHksXHJcblx0XHRcdHo6IHogKyAwLjAsXHJcblx0XHR9LFxyXG5cdFx0ZGlzdGFuY2VcclxuXHQpO1xyXG5cclxufTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1Nb3ZlLCAoZGF0YSwgY2IpID0+IHtcclxuICAgIHNldENhbVBvc2l0aW9uKGRhdGEueCwgZGF0YS55KTtcclxuICAgIGNiKDEpO1xyXG59KTtcclxuXHJcbnR5cGUgVFNlY3Rpb24gPSAnd2hvbGUnIHwgJ2hlYWQnIHwgJ3RvcnNvJyB8ICdsZWdzJyB8ICdzaG9lcyc7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtU2VjdGlvbiwgKHR5cGU6IFRTZWN0aW9uLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlICd3aG9sZSc6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgnd2hvbGUnLCBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2hlYWQnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ2hlYWQnKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAndG9yc28nOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ3RvcnNvJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2xlZ3MnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ2xlZ3MnKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnc2hvZXMnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ3Nob2VzJyk7XHJcbiAgICAgICAgICAgIHNldENhbVBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cdH1cclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtWm9vbSwgKGRhdGEsIGNiKSA9PiB7XHJcblx0aWYgKGRhdGEgPT09ICdkb3duJykge1xyXG5cclxuICAgICAgICBjb25zdCBtYXhab29tID0gY3VycmVudEJvbmUgPT09ICd3aG9sZScgPyBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRSA6IERFRkFVTFRfTUFYX0RJU1RBTkNFO1xyXG5cclxuXHRcdGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSArIDAuMDU7XHJcblx0XHRjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlID49IG1heFpvb20gPyBtYXhab29tIDogbmV3RGlzdGFuY2U7XHJcblx0fSBlbHNlIGlmIChkYXRhID09PSAndXAnKSB7XHJcblx0XHRjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgLSAwLjA1O1xyXG5cdFx0Y2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA8PSAwLjMgPyAwLjMgOiBuZXdEaXN0YW5jZTtcclxuXHR9XHJcblxyXG5cdGNhbURpc3RhbmNlID0gY2FtRGlzdGFuY2U7XHJcblx0c2V0Q2FtUG9zaXRpb24oKTtcclxuXHRjYigxKTtcclxufSk7XHJcbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJCbGVtaXNoZXNcIixcbiAgICBcIkZhY2lhbEhhaXJcIixcbiAgICBcIkV5ZWJyb3dzXCIsXG4gICAgXCJBZ2VpbmdcIixcbiAgICBcIk1ha2V1cFwiLFxuICAgIFwiQmx1c2hcIixcbiAgICBcIkNvbXBsZXhpb25cIixcbiAgICBcIlN1bkRhbWFnZVwiLFxuICAgIFwiTGlwc3RpY2tcIixcbiAgICBcIk1vbGVzRnJlY2tsZXNcIixcbiAgICBcIkNoZXN0SGFpclwiLFxuICAgIFwiQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiQWRkQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiRXllQ29sb3JcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcIk5vc2VfV2lkdGhcIixcbiAgICBcIk5vc2VfUGVha19IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19MZW5naHRcIixcbiAgICBcIk5vc2VfQm9uZV9IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19Mb3dlcmluZ1wiLFxuICAgIFwiTm9zZV9Cb25lX1R3aXN0XCIsXG4gICAgXCJFeWVCcm93bl9IZWlnaHRcIixcbiAgICBcIkV5ZUJyb3duX0ZvcndhcmRcIixcbiAgICBcIkNoZWVrc19Cb25lX0hpZ2hcIixcbiAgICBcIkNoZWVrc19Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGVla3NfV2lkdGhcIixcbiAgICBcIkV5ZXNfT3Blbm5pbmdcIixcbiAgICBcIkxpcHNfVGhpY2tuZXNzXCIsXG4gICAgXCJKYXdfQm9uZV9XaWR0aFwiLFxuICAgIFwiSmF3X0JvbmVfQmFja19MZW5naHRcIixcbiAgICBcIkNoaW5fQm9uZV9Mb3dlcmluZ1wiLFxuICAgIFwiQ2hpbl9Cb25lX0xlbmd0aFwiLFxuICAgIFwiQ2hpbl9Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGluX0hvbGVcIixcbiAgICBcIk5lY2tfVGhpa25lc3NcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImZhY2VcIixcbiAgICBcIm1hc2tzXCIsXG4gICAgXCJoYWlyXCIsXG4gICAgXCJ0b3Jzb3NcIixcbiAgICBcImxlZ3NcIixcbiAgICBcImJhZ3NcIixcbiAgICBcInNob2VzXCIsXG4gICAgXCJuZWNrXCIsXG4gICAgXCJzaGlydHNcIixcbiAgICBcInZlc3RcIixcbiAgICBcImRlY2Fsc1wiLFxuICAgIFwiamFja2V0c1wiXG5dXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiaGF0c1wiLFxuICAgIFwiZ2xhc3Nlc1wiLFxuICAgIFwiZWFycmluZ3NcIixcbiAgICBcIm1vdXRoXCIsXG4gICAgXCJsaGFuZFwiLFxuICAgIFwicmhhbmRcIixcbiAgICBcIndhdGNoZXNcIixcbiAgICBcImJyYWNlbGV0c1wiXG5dXG4iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRIYWlyRGF0YSwgVEhlYWRPdmVybGF5LCBUSGVhZE92ZXJsYXlUb3RhbCwgVENsb3RoZXMsIFRTa2luIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgSEVBRF9PVkVSTEFZUyBmcm9tIFwiQGRhdGEvaGVhZFwiXHJcbmltcG9ydCBGQUNFX0ZFQVRVUkVTIGZyb20gXCJAZGF0YS9mYWNlXCJcclxuaW1wb3J0IERSQVdBQkxFX05BTUVTIGZyb20gXCJAZGF0YS9kcmF3YWJsZXNcIlxyXG5pbXBvcnQgUFJPUF9OQU1FUyBmcm9tIFwiQGRhdGEvcHJvcHNcIlxyXG5pbXBvcnQgeyBwZWQsIG9uU2VydmVyQ2FsbGJhY2sgfSBmcm9tICdAdXRpbHMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRNb2RlbEluZGV4KHRhcmdldDogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxuICAgIGNvbnN0IG1vZGVscyA9IGNvbmZpZy5tb2RlbHMoKVxyXG5cclxuICAgIHJldHVybiBtb2RlbHMuZmluZEluZGV4KChtb2RlbDogc3RyaW5nKSA9PiBHZXRIYXNoS2V5KG1vZGVsKSA9PT0gdGFyZ2V0KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFpcihwZWRIYW5kbGU6IG51bWJlcik6IFRIYWlyRGF0YSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNvbG9yOiBHZXRQZWRIYWlyQ29sb3IocGVkSGFuZGxlKSxcclxuICAgICAgICBoaWdobGlnaHQ6IEdldFBlZEhhaXJIaWdobGlnaHRDb2xvcihwZWRIYW5kbGUpXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGVkcjBmb250b3VyYS9maXZlbS1hcHBlYXJhbmNlL2Jsb2IvbWFpbi9nYW1lL3NyYy9jbGllbnQvaW5kZXgudHMjTDY3XHJcbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoODApO1xyXG4gICAgZ2xvYmFsLkNpdGl6ZW4uaW52b2tlTmF0aXZlKCcweDI3NDZiZDlkODhjNWM1ZDAnLCBwZWRIYW5kbGUsIG5ldyBVaW50MzJBcnJheShidWZmZXIpKTtcclxuXHJcbiAgICBjb25zdCB7IDA6IHNoYXBlRmlyc3QsIDI6IHNoYXBlU2Vjb25kLCA0OiBzaGFwZVRoaXJkLCA2OiBza2luRmlyc3QsIDg6IHNraW5TZWNvbmQsIDE4OiBoYXNQYXJlbnQsIDEwOiBza2luVGhpcmQgfSA9IG5ldyBVaW50MzJBcnJheShidWZmZXIpO1xyXG4gICAgY29uc3QgeyAwOiBzaGFwZU1peCwgMjogc2tpbk1peCwgNDogdGhpcmRNaXggfSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyLCA0OCk7XHJcblxyXG4gICAgLyogICBcclxuICAgICAgICAwOiBzaGFwZUZpcnN0LFxyXG4gICAgICAgIDI6IHNoYXBlU2Vjb25kLFxyXG4gICAgICAgIDQ6IHNoYXBlVGhpcmQsXHJcbiAgICAgICAgNjogc2tpbkZpcnN0LFxyXG4gICAgICAgIDg6IHNraW5TZWNvbmQsXHJcbiAgICAgICAgMTA6IHNraW5UaGlyZCxcclxuICAgICAgICAxODogaGFzUGFyZW50LFxyXG4gICAgKi9cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2hhcGVGaXJzdCwgICAvLyBmYXRoZXJcclxuICAgICAgICBzaGFwZVNlY29uZCwgLy8gbW90aGVyXHJcbiAgICAgICAgc2hhcGVUaGlyZCxcclxuXHJcbiAgICAgICAgc2tpbkZpcnN0LFxyXG4gICAgICAgIHNraW5TZWNvbmQsXHJcbiAgICAgICAgc2tpblRoaXJkLFxyXG5cclxuICAgICAgICBzaGFwZU1peCwgLy8gcmVzZW1ibGFuY2VcclxuXHJcbiAgICAgICAgdGhpcmRNaXgsXHJcbiAgICAgICAgc2tpbk1peCwgICAvLyBza2lucGVyY2VudFxyXG5cclxuICAgICAgICBoYXNQYXJlbnQ6IEJvb2xlYW4oaGFzUGFyZW50KSxcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgbGV0IHRvdGFsczogVEhlYWRPdmVybGF5VG90YWwgPSB7fTtcclxuICAgIGxldCBoZWFkRGF0YTogVEhlYWRPdmVybGF5ID0ge307XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBIRUFEX09WRVJMQVlTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEhFQURfT1ZFUkxBWVNbaV07XHJcbiAgICAgICAgdG90YWxzW292ZXJsYXldID0gR2V0TnVtSGVhZE92ZXJsYXlWYWx1ZXMoaSk7XHJcblxyXG4gICAgICAgIGlmIChvdmVybGF5ID09PSBcIkV5ZUNvbG9yXCIpIHtcclxuICAgICAgICAgICAgaGVhZERhdGFbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBHZXRQZWRFeWVDb2xvcihwZWRIYW5kbGUpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgW18sIG92ZXJsYXlWYWx1ZSwgY29sb3VyVHlwZSwgZmlyc3RDb2xvciwgc2Vjb25kQ29sb3IsIG92ZXJsYXlPcGFjaXR5XSA9IEdldFBlZEhlYWRPdmVybGF5RGF0YShwZWRIYW5kbGUsIGkpO1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5VmFsdWU6IG92ZXJsYXlWYWx1ZSA9PT0gMjU1ID8gLTEgOiBvdmVybGF5VmFsdWUsXHJcbiAgICAgICAgICAgICAgICBjb2xvdXJUeXBlOiBjb2xvdXJUeXBlLFxyXG4gICAgICAgICAgICAgICAgZmlyc3RDb2xvcjogZmlyc3RDb2xvcixcclxuICAgICAgICAgICAgICAgIHNlY29uZENvbG9yOiBzZWNvbmRDb2xvcixcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlPcGFjaXR5OiBvdmVybGF5T3BhY2l0eVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW2hlYWREYXRhLCB0b3RhbHNdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZFN0cnVjdHVyZShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgY29uc3QgcGVkTW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWRIYW5kbGUpXHJcblxyXG4gICAgaWYgKHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSAmJiBwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIikpIHJldHVyblxyXG5cclxuICAgIGxldCBmYWNlU3RydWN0ID0ge31cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRkFDRV9GRUFUVVJFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBGQUNFX0ZFQVRVUkVTW2ldXHJcbiAgICAgICAgZmFjZVN0cnVjdFtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRmFjZUZlYXR1cmUocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFjZVN0cnVjdFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RHJhd2FibGVzKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgZHJhd2FibGVzID0ge31cclxuICAgIGxldCB0b3RhbERyYXdhYmxlcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBEUkFXQUJMRV9OQU1FUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBEUkFXQUJMRV9OQU1FU1tpXVxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWRIYW5kbGUsIGkpXHJcblxyXG4gICAgICAgIHRvdGFsRHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHRvdGFsOiBHZXROdW1iZXJPZlBlZERyYXdhYmxlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogR2V0TnVtYmVyT2ZQZWRUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRyYXdhYmxlc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkSGFuZGxlLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZTogR2V0UGVkVGV4dHVyZVZhcmlhdGlvbihwZWRIYW5kbGUsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbZHJhd2FibGVzLCB0b3RhbERyYXdhYmxlc11cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3BzKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgcHJvcHMgPSB7fVxyXG4gICAgbGV0IHRvdGFsUHJvcHMgPSB7fVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgUFJPUF9OQU1FUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBQUk9QX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZFByb3BJbmRleChwZWRIYW5kbGUsIGkpXHJcblxyXG4gICAgICAgIHRvdGFsUHJvcHNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkUHJvcERyYXdhYmxlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogR2V0TnVtYmVyT2ZQZWRQcm9wVGV4dHVyZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBpLCBjdXJyZW50KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvcHNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZFByb3BJbmRleChwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRQcm9wVGV4dHVyZUluZGV4KHBlZEhhbmRsZSwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtwcm9wcywgdG90YWxQcm9wc11cclxufVxyXG5cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcHBlYXJhbmNlKHBlZEhhbmRsZTogbnVtYmVyKTogUHJvbWlzZTxUQXBwZWFyYW5jZT4ge1xyXG4gICAgY29uc3QgW2hlYWREYXRhLCB0b3RhbHNdID0gZ2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW2RyYXdhYmxlcywgZHJhd1RvdGFsXSA9IGdldERyYXdhYmxlcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbcHJvcHMsIHByb3BUb3RhbF0gPSBnZXRQcm9wcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBtb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1vZGVsSW5kZXg6IGZpbmRNb2RlbEluZGV4KG1vZGVsKSxcclxuICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGVhZEJsZW5kOiBnZXRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGVhZE92ZXJsYXk6IGhlYWREYXRhIGFzIFRIZWFkT3ZlcmxheSxcclxuICAgICAgICBoZWFkT3ZlcmxheVRvdGFsOiB0b3RhbHMgYXMgVEhlYWRPdmVybGF5VG90YWwsXHJcbiAgICAgICAgaGVhZFN0cnVjdHVyZTogZ2V0SGVhZFN0cnVjdHVyZShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgICAgICBkcmF3VG90YWw6IGRyYXdUb3RhbCxcclxuICAgICAgICBwcm9wVG90YWw6IHByb3BUb3RhbCxcclxuICAgICAgICB0YXR0b29zOiBbXVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRBcHBlYXJhbmNlXCIsIGdldEFwcGVhcmFuY2UpXHJcbm9uU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50OmdldEFwcGVhcmFuY2UnLCAoKSA9PiB7XHJcbiAgICByZXR1cm4gZ2V0QXBwZWFyYW5jZShwZWQgfHwgUGxheWVyUGVkSWQoKSlcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVkQ2xvdGhlcyhwZWRIYW5kbGU6IG51bWJlcik6IFRDbG90aGVzIHtcclxuICAgIGNvbnN0IFtkcmF3YWJsZXNdID0gZ2V0RHJhd2FibGVzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtwcm9wc10gPSBnZXRQcm9wcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbaGVhZERhdGFdID0gZ2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaGVhZE92ZXJsYXk6IGhlYWREYXRhIGFzIFRIZWFkT3ZlcmxheSxcclxuICAgICAgICBkcmF3YWJsZXM6IGRyYXdhYmxlcyxcclxuICAgICAgICBwcm9wczogcHJvcHMsXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldFBlZENsb3RoZXNcIiwgZ2V0UGVkQ2xvdGhlcylcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQZWRTa2luKHBlZEhhbmRsZTogbnVtYmVyKTogVFNraW4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZEhhbmRsZSksXHJcbiAgICAgICAgbW9kZWw6IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkU2tpblwiLCBnZXRQZWRTa2luKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhdHRvb0RhdGEoKSB7XHJcbiAgICBsZXQgdGF0dG9vWm9uZXMgPSBbXVxyXG5cclxuICAgIGNvbnN0IFtUQVRUT09fTElTVCwgVEFUVE9PX0NBVEVHT1JJRVNdID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLnRhdHRvb3MoKVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fQ0FURUdPUklFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gVEFUVE9PX0NBVEVHT1JJRVNbaV1cclxuICAgICAgICBjb25zdCB6b25lID0gY2F0ZWdvcnkuem9uZVxyXG4gICAgICAgIGNvbnN0IGxhYmVsID0gY2F0ZWdvcnkubGFiZWxcclxuICAgICAgICBjb25zdCBpbmRleCA9IGNhdGVnb3J5LmluZGV4XHJcbiAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdID0ge1xyXG4gICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICBsYWJlbDogbGFiZWwsXHJcbiAgICAgICAgICAgIHpvbmVJbmRleDogaW5kZXgsXHJcbiAgICAgICAgICAgIGRsY3M6IFtdXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IFRBVFRPT19MSVNULmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRsY0RhdGEgPSBUQVRUT09fTElTVFtqXVxyXG4gICAgICAgICAgICB0YXR0b29ab25lc1tpbmRleF0uZGxjcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBkbGNEYXRhLmRsYyxcclxuICAgICAgICAgICAgICAgIGRsY0luZGV4OiBqLFxyXG4gICAgICAgICAgICAgICAgdGF0dG9vczogW11cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaXNGZW1hbGUgPSBHZXRFbnRpdHlNb2RlbChwZWQpID09PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gVEFUVE9PX0xJU1RbaV1cclxuICAgICAgICBjb25zdCB7IGRsYywgdGF0dG9vcyB9ID0gZGF0YVxyXG4gICAgICAgIGNvbnN0IGRsY0hhc2ggPSBHZXRIYXNoS2V5KGRsYylcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRhdHRvb3MubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IHRhdHRvb3Nbal1cclxuICAgICAgICAgICAgbGV0IHRhdHRvbyA9IG51bGxcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyVGF0dG9vID0gdGF0dG9vRGF0YS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIGNvbnN0IGlzRmVtYWxlVGF0dG9vID0gbG93ZXJUYXR0b28uaW5jbHVkZXMoXCJfZlwiKVxyXG4gICAgICAgICAgICBpZiAoaXNGZW1hbGVUYXR0b28gJiYgaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNGZW1hbGVUYXR0b28gJiYgIWlzRmVtYWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXR0b28gPSB0YXR0b29EYXRhXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBoYXNoID0gbnVsbFxyXG4gICAgICAgICAgICBsZXQgem9uZSA9IC0xXHJcblxyXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoID0gR2V0SGFzaEtleSh0YXR0b28pXHJcbiAgICAgICAgICAgICAgICB6b25lID0gR2V0UGVkRGVjb3JhdGlvblpvbmVGcm9tSGFzaGVzKGRsY0hhc2gsIGhhc2gpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh6b25lICE9PSAtMSAmJiBoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB6b25lVGF0dG9vcyA9IHRhdHRvb1pvbmVzW3pvbmVdLmRsY3NbaV0udGF0dG9vc1xyXG5cclxuICAgICAgICAgICAgICAgIHpvbmVUYXR0b29zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0YXR0b28sXHJcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogaGFzaCxcclxuICAgICAgICAgICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICAgICAgICAgIGRsYzogZGxjLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGF0dG9vWm9uZXNcclxufVxyXG5cclxuLy9taWdyYXRpb25cclxuXHJcbm9uU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50Om1pZ3JhdGlvbjpzZXRBcHBlYXJhbmNlJywgKGRhdGE6IHt0eXBlOiBzdHJpbmcsIGRhdGE6IGFueX0pID0+IHtcclxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdmaXZlbScpIGV4cG9ydHNbJ2ZpdmVtLWFwcGVhcmFuY2UnXS5zZXRQbGF5ZXJBcHBlYXJhbmNlKGRhdGEuZGF0YSlcclxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdpbGxlbml1bScpIGV4cG9ydHNbJ2lsbGVuaXVtLWFwcGVhcmFuY2UnXS5zZXRQbGF5ZXJBcHBlYXJhbmNlKGRhdGEuZGF0YSlcclxufSk7IiwgImV4cG9ydCBkZWZhdWx0IHtcclxuICAgIGhhdHM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMCxcclxuICAgIH0sXHJcbiAgICBnbGFzc2VzOiB7XHJcbiAgICAgICAgdHlwZTogXCJwcm9wXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICB9LFxyXG4gICAgbWFza3M6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICAgICAgb2ZmOiAwLFxyXG4gICAgfSxcclxuICAgIHNoaXJ0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogOCxcclxuICAgICAgICBvZmY6IDE1LFxyXG4gICAgICAgIGhvb2s6IHtcclxuICAgICAgICAgICAgZHJhd2FibGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogMywgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAndG9yc29zJyB9LFxyXG4gICAgICAgICAgICAgICAgeyBjb21wb25lbnQ6IDgsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ3NoaXJ0cycgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGphY2tldHM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDExLFxyXG4gICAgICAgIG9mZjogMTUsXHJcbiAgICAgICAgaG9vazoge1xyXG4gICAgICAgICAgICBkcmF3YWJsZXM6IFtcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAzLCB2YXJpYW50OiAxNSwgdGV4dHVyZTogMCwgaWQ6ICd0b3Jzb3MnIH0sXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogMTEsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ2phY2tldHMnIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB2ZXN0OiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA5LFxyXG4gICAgICAgIG9mZjogMCxcclxuICAgIH0sXHJcbiAgICBsZWdzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA0LFxyXG4gICAgICAgIG9mZjogMTgsXHJcbiAgICB9LFxyXG4gICAgc2hvZXM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDYsXHJcbiAgICAgICAgb2ZmOiAzNCxcclxuICAgIH1cclxufSIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSwgVEhhaXJDb2xvciwgVENsb3RoZXMsIFRTa2luLCBUVmFsdWUgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiO1xyXG5pbXBvcnQgVE9HR0xFX0lOREVYRVMgZnJvbSBcIkBkYXRhL3RvZ2dsZXNcIlxyXG5pbXBvcnQgeyByZXF1ZXN0TW9kZWwsIHBlZCwgdXBkYXRlUGVkLCBpc1BlZEZyZWVtb2RlTW9kZWx9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IFRUYXR0b28gfSBmcm9tIFwiQHR5cGluZ3MvdGF0dG9vc1wiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldERyYXdhYmxlKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgMClcclxuICAgIHJldHVybiBHZXROdW1iZXJPZlBlZFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFByb3AocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgaWYgKGRhdGEudmFsdWUgPT09IC0xKSB7XHJcbiAgICAgICAgQ2xlYXJQZWRQcm9wKHBlZEhhbmRsZSwgZGF0YS5pbmRleClcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBTZXRQZWRQcm9wSW5kZXgocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlLCBkYXRhLnRleHR1cmUsIGZhbHNlKVxyXG4gICAgcmV0dXJuIEdldE51bWJlck9mUGVkUHJvcFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSlcclxufVxyXG5cclxuY29uc3QgZGVmTWFsZUhhc2ggPSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKVxyXG5cclxuXHJcbi8vIFRoaXMgbmVlZHMgdG8gcmV0dXJuIHRoZSBwZWQgaGFuZGxlIGJlY2F1c2UgdGhlIHBlZElkIGlzIGJlaW5nIGNoYW5nZWRcclxuZXhwb3J0IGNvbnN0IHNldE1vZGVsID0gYXN5bmMgKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUQXBwZWFyYW5jZSB8IFRTa2luIHwgbnVtYmVyIHwgc3RyaW5nKSA9PiB7XHJcbiAgICBsZXQgbW9kZWw6IG51bWJlciA9IDBcclxuXHJcblxyXG4gICAgaWYgKGRhdGEgPT0gbnVsbCB8fCBkYXRhID09IHVuZGVmaW5lZCkgcmV0dXJuXHJcblxyXG4gICAgY29uc3QgaXNTdHJpbmcgPSB0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZydcclxuICAgIGNvbnN0IGlzTnVtYmVyID0gdHlwZW9mIGRhdGEgPT09ICdudW1iZXInXHJcbiAgICBjb25zdCBpc0p1c3RNb2RlbCA9IGlzU3RyaW5nIHx8IGlzTnVtYmVyXHJcblxyXG4gICAgLy8gQ2hpbGwsIFRTIGlzIG5vdCBzbWFydCBhbmQgZG9lc250IGxldCBtZSB1c2UgdGhlIGlzU3RyaW5nIHx8IGlzTnVtYmVyIGNoZWNrIHdpdGhvdXQgY3J5aW5nXHJcbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgbW9kZWwgPSBHZXRIYXNoS2V5KGRhdGEpXHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgIG1vZGVsID0gZGF0YVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBtb2RlbCA9IGRhdGEubW9kZWwgLy9kYXRhLm1vZGVsIHNob3VsZCBiZSBhIGhhc2ggaGVyZVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb2RlbCA9PSBudWxsIHx8IG1vZGVsID09IHVuZGVmaW5lZCkgcmV0dXJuXHJcblxyXG4gICAgY29uc3QgaXNQbGF5ZXIgPSBJc1BlZEFQbGF5ZXIocGVkSGFuZGxlKVxyXG5cclxuICAgIGlmIChpc1BsYXllcikge1xyXG4gICAgICAgIG1vZGVsID0gbW9kZWwgIT09IDAgPyBtb2RlbCA6IGRlZk1hbGVIYXNoXHJcbiAgICAgICAgYXdhaXQgcmVxdWVzdE1vZGVsKG1vZGVsKVxyXG4gICAgICAgIFNldFBsYXllck1vZGVsKFBsYXllcklkKCksIG1vZGVsKVxyXG4gICAgICAgIFNldE1vZGVsQXNOb0xvbmdlck5lZWRlZChtb2RlbClcclxuICAgICAgICBwZWRIYW5kbGUgPSBQbGF5ZXJQZWRJZCgpXHJcbiAgICB9XHJcblxyXG4gICAgU2V0UGVkRGVmYXVsdENvbXBvbmVudFZhcmlhdGlvbihwZWRIYW5kbGUpXHJcblxyXG4gICAgaWYgKCFpc1BlZEZyZWVtb2RlTW9kZWwocGVkSGFuZGxlKSkgcmV0dXJuXHJcblxyXG4gICAgLy8gQ2hpbGwsIFRTIGlzIG5vdCBzbWFydCBhbmQgZG9lc250IGxldCBtZSB1c2UgdGhlIGlzU3RyaW5nIHx8IGlzTnVtYmVyIGNoZWNrIHdpdGhvdXQgY3J5aW5nXHJcbiAgICBpZiAodHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnICYmIHR5cGVvZiBkYXRhICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgIGlmIChkYXRhLmhlYWRCbGVuZCkge1xyXG4gICAgICAgICAgICBpZiAoIWlzSnVzdE1vZGVsICYmIE9iamVjdC5rZXlzKGRhdGEuaGVhZEJsZW5kKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBoZWFkQmxlbmQgPSBkYXRhLmhlYWRCbGVuZFxyXG4gICAgICAgICAgICAgICAgc2V0SGVhZEJsZW5kKHBlZEhhbmRsZSwgaGVhZEJsZW5kKVxyXG4gICAgICAgICAgICAgICAgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWRIYW5kbGUsIDAsIDAsIDAsIDAsIDAsIDAsIDAuMCwgMC4wLCAwLjAsIGZhbHNlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSBcclxuICAgIFxyXG4gICAgcmV0dXJuIHBlZEhhbmRsZVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gU2V0RmFjZUZlYXR1cmUocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgU2V0UGVkRmFjZUZlYXR1cmUocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlICsgMC4wKVxyXG59XHJcblxyXG5jb25zdCBpc1Bvc2l0aXZlID0gKHZhbDogbnVtYmVyKSA9PiB2YWwgPj0gMCA/IHZhbCA6IDBcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkQmxlbmQocGVkSGFuZGxlOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIHBlZEhhbmRsZSA9IHBlZEhhbmRsZSB8fCBwZWRcclxuXHJcbiAgICBjb25zdCBzaGFwZUZpcnN0ID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlRmlyc3QpXHJcbiAgICBjb25zdCBzaGFwZVNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZVNlY29uZClcclxuICAgIGNvbnN0IHNoYXBlVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVUaGlyZClcclxuICAgIGNvbnN0IHNraW5GaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5za2luRmlyc3QpXHJcbiAgICBjb25zdCBza2luU2Vjb25kID0gaXNQb3NpdGl2ZShkYXRhLnNraW5TZWNvbmQpXHJcbiAgICBjb25zdCBza2luVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpblRoaXJkKVxyXG4gICAgY29uc3Qgc2hhcGVNaXggPSBkYXRhLnNoYXBlTWl4ICsgMC4wXHJcbiAgICBjb25zdCBza2luTWl4ID0gZGF0YS5za2luTWl4ICsgMC4wXHJcbiAgICBjb25zdCB0aGlyZE1peCA9IGRhdGEudGhpcmRNaXggKyAwLjBcclxuICAgIGNvbnN0IGhhc1BhcmVudCA9IGRhdGEuaGFzUGFyZW50XHJcblxyXG4gICAgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWRIYW5kbGUsIHNoYXBlRmlyc3QsIHNoYXBlU2Vjb25kLCBzaGFwZVRoaXJkLCBza2luRmlyc3QsIHNraW5TZWNvbmQsIHNraW5UaGlyZCwgc2hhcGVNaXgsIHNraW5NaXgsIHRoaXJkTWl4LCBoYXNQYXJlbnQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkT3ZlcmxheShwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgY29uc3QgaW5kZXggPSBkYXRhLmluZGV4XHJcblxyXG4gICAgaWYgKGluZGV4ID09PSAxMykge1xyXG4gICAgICAgIFNldFBlZEV5ZUNvbG9yKHBlZEhhbmRsZSwgZGF0YS52YWx1ZSlcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlXHJcblxyXG4gICAgLyogSGFpciBjb2xvciBkb2VzIG5vdCBoYXZlIGFuIGluZGV4LCBvbmx5IGFuIElEIHNvIHdlJ2xsIGNoZWNrIGZvciB0aGF0ICovXHJcbiAgICBpZiAoZGF0YS5pZCA9PT0gJ2hhaXJDb2xvcicpIHtcclxuICAgICAgICBTZXRQZWRIYWlyVGludChwZWRIYW5kbGUsIGRhdGEuaGFpckNvbG9yLCBkYXRhLmhhaXJIaWdobGlnaHQpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIFNldFBlZEhlYWRPdmVybGF5KHBlZEhhbmRsZSwgaW5kZXgsIHZhbHVlLCBkYXRhLm92ZXJsYXlPcGFjaXR5ICsgMC4wKVxyXG4gICAgU2V0UGVkSGVhZE92ZXJsYXlDb2xvcihwZWRIYW5kbGUsIGluZGV4LCAxLCBkYXRhLmZpcnN0Q29sb3IsIGRhdGEuc2Vjb25kQ29sb3IpXHJcbn1cclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRUb2dnbGVzKGRhdGEpIHtcclxuICAgIGNvbnN0IGRyYXdhYmxlcyA9IGRhdGEuZHJhd2FibGVzXHJcbiAgICBjb25zdCBwcm9wcyA9IGRhdGEucHJvcHNcclxuXHJcbiAgICBmb3IgKGNvbnN0IFt0b2dnbGVJdGVtLCB0b2dnbGVEYXRhXSBvZiBPYmplY3QuZW50cmllcyhUT0dHTEVfSU5ERVhFUykpIHtcclxuICAgICAgICBjb25zdCB0b2dnbGVUeXBlID0gdG9nZ2xlRGF0YS50eXBlXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0b2dnbGVEYXRhLmluZGV4XHJcblxyXG4gICAgICAgIGlmICh0b2dnbGVUeXBlID09PSBcImRyYXdhYmxlXCIgJiYgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50RHJhd2FibGUgIT09IGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaW5kZXgsIGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodG9nZ2xlVHlwZSA9PT0gXCJwcm9wXCIgJiYgcHJvcHNbdG9nZ2xlSXRlbV0pIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFByb3AgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleClcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRQcm9wICE9PSBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgU2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgsIHByb3BzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCBmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZENsb3RoZXMocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRDbG90aGVzKSB7XHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcbiAgICBjb25zdCBoZWFkT3ZlcmxheSA9IGRhdGEuaGVhZE92ZXJsYXlcclxuICAgIGZvciAoY29uc3QgaWQgaW4gZHJhd2FibGVzKSB7XHJcbiAgICAgICAgY29uc3QgZHJhd2FibGUgPSBkcmF3YWJsZXNbaWRdXHJcbiAgICAgICAgc2V0RHJhd2FibGUocGVkSGFuZGxlLCBkcmF3YWJsZSlcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIHByb3BzKSB7XHJcbiAgICAgICAgY29uc3QgcHJvcCA9IHByb3BzW2lkXVxyXG4gICAgICAgIHNldFByb3AocGVkSGFuZGxlLCBwcm9wKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgaWQgaW4gaGVhZE92ZXJsYXkpIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gaGVhZE92ZXJsYXlbaWRdXHJcbiAgICAgICAgc2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlLCBvdmVybGF5KVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2V0UGVkU2tpbiA9IGFzeW5jIChwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFNraW4pID0+IHtcclxuICAgIGNvbnN0IGhlYWRTdHJ1Y3R1cmUgPSBkYXRhLmhlYWRTdHJ1Y3R1cmVcclxuICAgIGNvbnN0IGhlYWRCbGVuZCA9IGRhdGEuaGVhZEJsZW5kXHJcblxyXG4gICAgaWYgKGRhdGEpIHtcclxuICAgICAgICBwZWRIYW5kbGUgPSBhd2FpdCBzZXRNb2RlbChwZWRIYW5kbGUsIGRhdGEpXHJcbiAgICB9XHJcbiAgICAgICAgXHJcblxyXG4gICAgaWYgKGhlYWRCbGVuZCkgc2V0SGVhZEJsZW5kKHBlZEhhbmRsZSwgaGVhZEJsZW5kKVxyXG4gICAgXHJcbiAgICBpZiAoaGVhZFN0cnVjdHVyZSkgZm9yIChjb25zdCBmZWF0dXJlIGluIGhlYWRTdHJ1Y3R1cmUpIHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IGhlYWRTdHJ1Y3R1cmVbZmVhdHVyZV1cclxuICAgICAgICBTZXRGYWNlRmVhdHVyZShwZWRIYW5kbGUsIHZhbHVlKVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkVGF0dG9vcyhwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFRhdHRvb1tdKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVyblxyXG5cclxuICAgIENsZWFyUGVkRGVjb3JhdGlvbnNMZWF2ZVNjYXJzKHBlZEhhbmRsZSlcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gZGF0YVtpXS50YXR0b29cclxuICAgICAgICBpZiAodGF0dG9vRGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gR2V0SGFzaEtleSh0YXR0b29EYXRhLmRsYylcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vID0gdGF0dG9vRGF0YS5oYXNoXHJcbiAgICAgICAgICAgIEFkZFBlZERlY29yYXRpb25Gcm9tSGFzaGVzKHBlZEhhbmRsZSwgY29sbGVjdGlvbiwgdGF0dG9vKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZEhhaXJDb2xvcnMocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRIYWlyQ29sb3IpIHtcclxuICAgIGlmICghZGF0YSkgcmV0dXJuXHJcbiAgICBjb25zdCBjb2xvciA9IGRhdGEuY29sb3JcclxuICAgIGNvbnN0IGhpZ2hsaWdodCA9IGRhdGEuaGlnaGxpZ2h0XHJcbiAgICBTZXRQZWRIYWlyQ29sb3IocGVkSGFuZGxlLCBjb2xvciwgaGlnaGxpZ2h0KVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGVkQXBwZWFyYW5jZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVEFwcGVhcmFuY2UpIHtcclxuICAgIGlmIChJc1BlZEFQbGF5ZXIocGVkSGFuZGxlKSkge1xyXG4gICAgICAgIHNldFBsYXllclBlZEFwcGVhcmFuY2UoZGF0YSlcclxuICAgIH1cclxuICAgIGF3YWl0IHNldFBlZFNraW4ocGVkSGFuZGxlLCBkYXRhKVxyXG4gICAgc2V0UGVkQ2xvdGhlcyhwZWRIYW5kbGUsIGRhdGEpXHJcbiAgICBzZXRQZWRIYWlyQ29sb3JzKHBlZEhhbmRsZSwgZGF0YS5oYWlyQ29sb3IpXHJcbiAgICBzZXRQZWRUYXR0b29zKHBlZEhhbmRsZSwgZGF0YS50YXR0b29zKVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGxheWVyUGVkQXBwZWFyYW5jZShkYXRhOiBUQXBwZWFyYW5jZSkge1xyXG4gICAgYXdhaXQgc2V0UGVkU2tpbihwZWQsIGRhdGEpXHJcbiAgICB1cGRhdGVQZWQoUGxheWVyUGVkSWQoKSlcclxuICAgIHNldFBlZENsb3RoZXMocGVkLCBkYXRhKVxyXG4gICAgc2V0UGVkSGFpckNvbG9ycyhwZWQsIGRhdGEuaGFpckNvbG9yKVxyXG4gICAgc2V0UGVkVGF0dG9vcyhwZWQsIGRhdGEudGF0dG9vcylcclxufVxyXG5cclxuZXhwb3J0cygnU2V0UGVkQ2xvdGhlcycsIHNldFBlZENsb3RoZXMpXHJcbmV4cG9ydHMoJ1NldFBlZFNraW4nLCBzZXRQZWRTa2luKVxyXG5leHBvcnRzKCdTZXRQZWRUYXR0b29zJywgc2V0UGVkVGF0dG9vcylcclxuZXhwb3J0cygnU2V0UGVkSGFpckNvbG9ycycsIHNldFBlZEhhaXJDb2xvcnMpIiwgImltcG9ydCB7IFJlY2VpdmUgfSBmcm9tICdAZXZlbnRzJztcclxuaW1wb3J0IHtcclxuXHRyZXNldFRvZ2dsZXMsXHJcblx0c2V0RHJhd2FibGUsXHJcblx0U2V0RmFjZUZlYXR1cmUsXHJcblx0c2V0SGVhZEJsZW5kLFxyXG5cdHNldEhlYWRPdmVybGF5LFxyXG5cdHNldE1vZGVsLFxyXG5cdHNldFBlZENsb3RoZXMsXHJcblx0c2V0UGVkVGF0dG9vcyxcclxuXHRzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlLFxyXG5cdHNldFByb3AsXHJcbn0gZnJvbSAnLi9hcHBlYXJhbmNlL3NldHRlcnMnO1xyXG5pbXBvcnQgeyBjbG9zZU1lbnUgfSBmcm9tICcuL21lbnUnO1xyXG5pbXBvcnQgeyBUQXBwZWFyYW5jZSwgVFRvZ2dsZURhdGEsIFRWYWx1ZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xyXG5pbXBvcnQgeyBkZWxheSwgZ2V0RnJhbWV3b3JrSUQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaywgcGVkLCB1cGRhdGVQZWQgfSBmcm9tICdAdXRpbHMnO1xyXG5pbXBvcnQgeyBnZXRBcHBlYXJhbmNlLCBnZXRUYXR0b29EYXRhIH0gZnJvbSAnLi9hcHBlYXJhbmNlL2dldHRlcnMnO1xyXG5pbXBvcnQgVE9HR0xFX0lOREVYRVMgZnJvbSAnQGRhdGEvdG9nZ2xlcyc7XHJcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gJ0B0eXBpbmdzL291dGZpdHMnO1xyXG5pbXBvcnQgeyBUVGF0dG9vIH0gZnJvbSAnQHR5cGluZ3MvdGF0dG9vcyc7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FuY2VsLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSk7XHJcblx0Y2xvc2VNZW51KCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNhdmUsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0cmVzZXRUb2dnbGVzKGFwcGVhcmFuY2UpO1xyXG5cclxuXHRhd2FpdCBkZWxheSgxMDApO1xyXG5cclxuXHRjb25zdCBuZXdBcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cdG5ld0FwcGVhcmFuY2UudGF0dG9vcyA9IGFwcGVhcmFuY2UudGF0dG9vcztcclxuXHR0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVBcHBlYXJhbmNlJywgZ2V0RnJhbWV3b3JrSUQoKSwgbmV3QXBwZWFyYW5jZSk7XHJcblxyXG5cdHNldFBlZFRhdHRvb3MocGVkLCBuZXdBcHBlYXJhbmNlLnRhdHRvb3MpO1xyXG5cclxuXHRjbG9zZU1lbnUoKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0TW9kZWwsIGFzeW5jIChtb2RlbDogc3RyaW5nLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBoYXNoID0gR2V0SGFzaEtleShtb2RlbCk7XHJcblx0aWYgKCFJc01vZGVsSW5DZGltYWdlKGhhc2gpIHx8ICFJc01vZGVsVmFsaWQoaGFzaCkpIHtcclxuXHRcdHJldHVybiBjYigwKTtcclxuXHR9XHJcblxyXG5cclxuXHRjb25zdCBuZXdQZWQgPSBhd2FpdCBzZXRNb2RlbChwZWQsIGhhc2gpO1xyXG5cclxuICAgIHVwZGF0ZVBlZChuZXdQZWQpXHJcblxyXG5cdGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKHBlZCk7XHJcblxyXG5cdGFwcGVhcmFuY2UudGF0dG9vcyA9IFtdO1xyXG5cclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgW10pO1xyXG5cclxuXHRjYihhcHBlYXJhbmNlKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZ2V0TW9kZWxUYXR0b29zLCBhc3luYyAoXzogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCB0YXR0b29zID0gZ2V0VGF0dG9vRGF0YSgpO1xyXG5cclxuXHRjYih0YXR0b29zKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0SGVhZFN0cnVjdHVyZSwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0U2V0RmFjZUZlYXR1cmUocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0SGVhZE92ZXJsYXksIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldEhlYWRPdmVybGF5KHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRCbGVuZCwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c2V0SGVhZEJsZW5kKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFRhdHRvb3MsIGFzeW5jIChkYXRhOiBUVGF0dG9vW10sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldFBlZFRhdHRvb3MocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0UHJvcCwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0bGV0IHRleHR1cmUgPSBzZXRQcm9wKHBlZCwgZGF0YSk7XHJcblx0Y2IodGV4dHVyZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldERyYXdhYmxlLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRsZXQgdGV4dHVyZSA9IHNldERyYXdhYmxlKHBlZCwgZGF0YSk7XHJcblx0Y2IodGV4dHVyZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnRvZ2dsZUl0ZW0sIGFzeW5jIChkYXRhOiBUVG9nZ2xlRGF0YSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgaXRlbSA9IFRPR0dMRV9JTkRFWEVTW2RhdGEuaXRlbV07XHJcblx0aWYgKCFpdGVtKSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRjb25zdCBjdXJyZW50ID0gZGF0YS5kYXRhO1xyXG5cdGNvbnN0IHR5cGUgPSBpdGVtLnR5cGU7XHJcblx0Y29uc3QgaW5kZXggPSBpdGVtLmluZGV4O1xyXG5cdGNvbnN0IGhvb2sgPSBpdGVtLmhvb2s7XHJcblx0Y29uc3QgaG9va0RhdGEgPSBkYXRhLmhvb2tEYXRhO1xyXG5cclxuXHRpZiAoIWN1cnJlbnQpIHJldHVybiBjYihmYWxzZSk7XHJcblxyXG5cdGlmICh0eXBlID09PSAncHJvcCcpIHtcclxuXHRcdGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpO1xyXG5cclxuXHRcdGlmIChjdXJyZW50UHJvcCA9PT0gLTEpIHtcclxuXHRcdFx0c2V0UHJvcChwZWQsIGN1cnJlbnQpO1xyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdENsZWFyUGVkUHJvcChwZWQsIGluZGV4KTtcclxuXHRcdFx0Y2IodHJ1ZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9IGVsc2UgaWYgKHR5cGUgPT09ICdkcmF3YWJsZScpIHtcclxuXHRcdGNvbnN0IGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpO1xyXG5cclxuXHRcdGlmIChjdXJyZW50LnZhbHVlID09PSBpdGVtLm9mZikge1xyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoY3VycmVudC52YWx1ZSA9PT0gY3VycmVudERyYXdhYmxlKSB7XHJcblx0XHRcdFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBpdGVtLm9mZiwgMCwgMCk7XHJcblx0XHRcdGlmIChob29rKSB7XHJcblx0XHRcdFx0Zm9yKGxldCBpPTA7IGkgPCBob29rLmRyYXdhYmxlcz8ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGNvbnN0IGhvb2tJdGVtID0gaG9vay5kcmF3YWJsZXNbaV07XHJcblx0XHRcdFx0XHRTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBob29rSXRlbS5jb21wb25lbnQsIGhvb2tJdGVtLnZhcmlhbnQsIGhvb2tJdGVtLnRleHR1cmUsIDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRjYih0cnVlKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0c2V0RHJhd2FibGUocGVkLCBjdXJyZW50KTtcclxuXHRcdFx0Zm9yKGxldCBpPTA7IGkgPCBob29rRGF0YT8ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRzZXREcmF3YWJsZShwZWQsIGhvb2tEYXRhW2ldKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuKTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zYXZlT3V0Zml0LCBhc3luYyAoZGF0YTogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZU91dGZpdCcsIGZyYW1ld29ya2RJZCwgZGF0YSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZGVsZXRlT3V0Zml0LCBhc3luYyAoe2lkfSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmRlbGV0ZU91dGZpdCcsIGZyYW1ld29ya2RJZCwgaWQpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnJlbmFtZU91dGZpdCwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlbmFtZU91dGZpdCcsIGZyYW1ld29ya2RJZCwgZGF0YSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUudXNlT3V0Zml0LCBhc3luYyAob3V0Zml0OiBPdXRmaXQsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldFBlZENsb3RoZXMocGVkLCBvdXRmaXQpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5pbXBvcnRPdXRmaXQsIGFzeW5jICh7IGlkLCBvdXRmaXROYW1lIH0sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjppbXBvcnRPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGlkLCBvdXRmaXROYW1lKTtcclxuXHRjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5ncmFiT3V0Zml0LCBhc3luYyAoeyBpZCB9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdyYWJPdXRmaXQnLCBpZCk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuaXRlbU91dGZpdCwgYXN5bmMgKGRhdGE6IHtvdXRmaXQ6IE91dGZpdCwgbGFiZWw6IHN0cmluZ30sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6aXRlbU91dGZpdCcsZGF0YSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5vbk5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6dXNlT3V0Zml0JywgKG91dGZpdDogT3V0Zml0KSA9PiB7XHJcblx0c2V0UGVkQ2xvdGhlcyhwZWQsIG91dGZpdCk7XHJcbn0pIiwgImltcG9ydCB7IGdldEZyYW1ld29ya0lELCByZXF1ZXN0TG9jYWxlLCBzZW5kTlVJRXZlbnQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaywgdXBkYXRlUGVkLCBwZWQsIGdldFBsYXllckRhdGEsIGdldEpvYkluZm8sIGdldFBsYXllckdlbmRlck1vZGVsIH0gZnJvbSBcIkB1dGlsc1wiXHJcbmltcG9ydCB7IHN0YXJ0Q2FtZXJhLCBzdG9wQ2FtZXJhIH0gZnJvbSBcIi4vY2FtZXJhXCJcclxuaW1wb3J0IHR5cGUgeyBUQXBwZWFyYW5jZVpvbmUgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gXCJAdHlwaW5ncy9vdXRmaXRzXCJcclxuaW1wb3J0IHsgU2VuZCB9IGZyb20gXCJAZXZlbnRzXCJcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0VGF0dG9vRGF0YSB9IGZyb20gXCIuL2FwcGVhcmFuY2UvZ2V0dGVyc1wiXHJcbmltcG9ydCBcIi4vaGFuZGxlcnNcIlxyXG5pbXBvcnQgeyBzZXRNb2RlbCB9IGZyb20gXCIuL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXHJcblxyXG5jb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxubGV0IGFybW91ciA9IDBcclxubGV0IG9wZW4gPSBmYWxzZVxyXG5cclxubGV0IHJlc29sdmVQcm9taXNlID0gbnVsbDtcclxubGV0IHByb21pc2UgPSBudWxsO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5NZW51KHpvbmU6IFRBcHBlYXJhbmNlWm9uZSwgY3JlYXRpb246IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgaWYgKHpvbmUgPT09IG51bGwgfHwgb3Blbikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcGVkSGFuZGxlID0gUGxheWVyUGVkSWQoKVxyXG4gICAgY29uc3QgY29uZmlnTWVudXMgPSBjb25maWcubWVudXMoKVxyXG5cclxuICAgIGNvbnN0IHR5cGUgPSB6b25lLnR5cGVcclxuXHJcbiAgICBjb25zdCBtZW51ID0gY29uZmlnTWVudXNbdHlwZV1cclxuICAgIGlmICghbWVudSkgcmV0dXJuXHJcblxyXG4gICAgdXBkYXRlUGVkKHBlZEhhbmRsZSlcclxuXHJcblxyXG4gICAgY29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgY29uc3QgdGFicyA9IG1lbnUudGFic1xyXG4gICAgbGV0IGFsbG93RXhpdCA9IGNyZWF0aW9uID8gZmFsc2UgOiBtZW51LmFsbG93RXhpdFxyXG5cclxuICAgIGFybW91ciA9IEdldFBlZEFybW91cihwZWRIYW5kbGUpXHJcblxyXG4gICAgbGV0IG91dGZpdHMgPSBbXVxyXG5cclxuICAgIGNvbnN0IGhhc091dGZpdFRhYiA9IHRhYnMuaW5jbHVkZXMoJ291dGZpdHMnKVxyXG4gICAgaWYgKGhhc091dGZpdFRhYikgb3V0Zml0cyA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxPdXRmaXRbXT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldE91dGZpdHMnLCBmcmFtZXdvcmtkSWQpIGFzIE91dGZpdFtdXHJcblxyXG4gICAgbGV0IG1vZGVscyA9IFtdXHJcblxyXG4gICAgY29uc3QgaGFzSGVyaXRhZ2VUYWIgPSB0YWJzLmluY2x1ZGVzKCdoZXJpdGFnZScpXHJcbiAgICBpZiAoaGFzSGVyaXRhZ2VUYWIpIHtcclxuICAgICAgICBtb2RlbHMgPSBjb25maWcubW9kZWxzKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBoYXNUYXR0b29UYWIgPSB0YWJzLmluY2x1ZGVzKCd0YXR0b29zJylcclxuICAgIGxldCB0YXR0b29zXHJcbiAgICBpZiAoaGFzVGF0dG9vVGFiKSB7XHJcbiAgICAgICAgdGF0dG9vcyA9IGdldFRhdHRvb0RhdGEoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJsYWNrbGlzdCA9IGdldEJsYWNrbGlzdCh6b25lKVxyXG5cclxuICAgIGlmIChjcmVhdGlvbikge1xyXG4gICAgICAgIGNvbnN0IG1vZGVsID0gR2V0SGFzaEtleShnZXRQbGF5ZXJHZW5kZXJNb2RlbCgpKTtcclxuICAgICAgICBwZWRIYW5kbGUgPSBhd2FpdCBzZXRNb2RlbChwZWRIYW5kbGUsIG1vZGVsKTtcclxuICAgICAgICBlbWl0TmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzZXRyb3V0aW5nYnVja2V0JylcclxuICAgICAgICBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XHJcbiAgICAgICAgICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdXBkYXRlUGVkKHBlZEhhbmRsZSlcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWRIYW5kbGUpXHJcblxyXG4gICAgc3RhcnRDYW1lcmEoKVxyXG5cclxuICAgIHNlbmROVUlFdmVudChTZW5kLmRhdGEsIHtcclxuICAgICAgICB0YWJzLFxyXG4gICAgICAgIGFwcGVhcmFuY2UsXHJcbiAgICAgICAgYmxhY2tsaXN0LFxyXG4gICAgICAgIHRhdHRvb3MsXHJcbiAgICAgICAgb3V0Zml0cyxcclxuICAgICAgICBtb2RlbHMsXHJcbiAgICAgICAgYWxsb3dFeGl0LFxyXG4gICAgICAgIGpvYjogZ2V0Sm9iSW5mbygpLFxyXG4gICAgICAgIGxvY2FsZTogYXdhaXQgcmVxdWVzdExvY2FsZSgnbG9jYWxlJylcclxuICAgIH0pXHJcbiAgICBTZXROdWlGb2N1cyh0cnVlLCB0cnVlKVxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQudmlzaWJsZSwgdHJ1ZSlcclxuICAgIG9wZW4gPSB0cnVlXHJcblxyXG4gICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmhpZGVIdWQodHJ1ZSlcclxuXHJcbiAgICBpZiAocHJvbWlzZSkge1xyXG4gICAgICAgIGF3YWl0IHByb21pc2VcclxuICAgICAgICBlbWl0TmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZXNldHJvdXRpbmdidWNrZXQnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm9taXNlID0gbnVsbDtcclxuICAgIHJlc29sdmVQcm9taXNlID0gbnVsbDtcclxuICAgIHJldHVybiB0cnVlXHJcbn1cclxuXHJcbmV4cG9ydHMoJ29wZW5NZW51Jywgb3Blbk1lbnUpXHJcblxyXG5mdW5jdGlvbiBnZXRCbGFja2xpc3Qoem9uZTogVEFwcGVhcmFuY2Vab25lKSB7XHJcbiAgICBpZiAoIXpvbmUpIHJldHVybiB7fVxyXG5cclxuICAgIGNvbnN0IHtncm91cFR5cGVzLCBiYXNlfSA9IGNvbmZpZy5ibGFja2xpc3QoKVxyXG5cclxuICAgIGlmICghZ3JvdXBUeXBlcykgcmV0dXJuIHt9XHJcbiAgICBpZiAoIWJhc2UpIHJldHVybiB7fVxyXG5cclxuICAgIGxldCBibGFja2xpc3QgPSB7Li4uYmFzZX1cclxuXHJcbiAgICBjb25zdCBwbGF5ZXJEYXRhID0gZ2V0UGxheWVyRGF0YSgpXHJcblxyXG5cclxuICAgIGZvciAoY29uc3QgdHlwZSBpbiBncm91cFR5cGVzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBzID0gZ3JvdXBUeXBlc1t0eXBlXVxyXG4gICAgICAgIGZvciAoY29uc3QgZ3JvdXAgaW4gZ3JvdXBzKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgc2tpcDogYm9vbGVhbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodHlwZSA9PSAnam9icycgJiYgem9uZS5qb2JzKSB7XHJcbiAgICAgICAgICAgICAgICBza2lwID0gem9uZS5qb2JzLmluY2x1ZGVzKHBsYXllckRhdGEuam9iLm5hbWUpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09ICdnYW5ncycgJiYgem9uZS5nYW5ncykge1xyXG4gICAgICAgICAgICAgICAgc2tpcCA9IHpvbmUuZ2FuZ3MuaW5jbHVkZXMocGxheWVyRGF0YS5nYW5nLm5hbWUpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmICh0eXBlID09ICdncm91cHMnICYmIHpvbmUuZ3JvdXBzKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBza2lwID0gIXpvbmUuZ3JvdXBzLmluY2x1ZGVzKHBsYXllckRhdGEuZ3JvdXAubmFtZSlcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFza2lwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBncm91cEJsYWNrbGlzdCA9IGdyb3Vwc1tncm91cF1cclxuICAgICAgICAgICAgICAgIGJsYWNrbGlzdCA9IE9iamVjdC5hc3NpZ24oe30sIGJsYWNrbGlzdCwgZ3JvdXBCbGFja2xpc3QsIHtcclxuICAgICAgICAgICAgICAgICAgZHJhd2FibGVzOiBPYmplY3QuYXNzaWduKHt9LCBibGFja2xpc3QuZHJhd2FibGVzLCBncm91cEJsYWNrbGlzdC5kcmF3YWJsZXMpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBibGFja2xpc3RcclxuXHJcbiAgICAvLyByZXR1cm4gYmxhY2tsaXN0XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9zZU1lbnUoKSB7XHJcbiAgICBTZXRQZWRBcm1vdXIocGVkLCBhcm1vdXIpXHJcblxyXG4gICAgc3RvcENhbWVyYSgpXHJcbiAgICBTZXROdWlGb2N1cyhmYWxzZSwgZmFsc2UpXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC52aXNpYmxlLCBmYWxzZSlcclxuXHJcblxyXG4gICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmhpZGVIdWQoZmFsc2UpXHJcblxyXG4gICAgaWYgKHJlc29sdmVQcm9taXNlKSB7XHJcbiAgICAgICAgcmVzb2x2ZVByb21pc2UoKTtcclxuICAgIH1cclxuICAgIG9wZW4gPSBmYWxzZVxyXG59XHJcbiIsICJcbmltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxuaW1wb3J0IHsgc2V0UGVkQXBwZWFyYW5jZSB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxuaW1wb3J0IHsgb3Blbk1lbnUgfSBmcm9tIFwiLi4vbWVudVwiXG5cbmV4cG9ydCBmdW5jdGlvbiBRQkJyaWRnZSgpIHtcbiAgICBvbk5ldCgncWItY2xvdGhpbmc6Y2xpZW50OmxvYWRQbGF5ZXJDbG90aGluZycsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgcGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgYXdhaXQgc2V0UGVkQXBwZWFyYW5jZShwZWQsIGFwcGVhcmFuY2UpXG4gICAgfSlcblxuICAgIG9uTmV0KCdxYi1jbG90aGVzOmNsaWVudDpDcmVhdGVGaXJzdENoYXJhY3RlcicsICgpID0+IHtcbiAgICAgICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkluaXRpYWxDcmVhdGlvbigpXG4gICAgfSlcblxuICAgIG9uTmV0KCdxYi1jbG90aGluZzpjbGllbnQ6b3Blbk91dGZpdE1lbnUnLCAoKSA9PiB7XG4gICAgICAgIG9wZW5NZW51KHsgdHlwZTogXCJvdXRmaXRzXCIsIGNvb3JkczogWzAsIDAsIDAsIDBdIH0pICBcbiAgICB9KVxufSIsICJcbmltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxuaW1wb3J0IHsgc2V0UGVkQXBwZWFyYW5jZSwgc2V0UGxheWVyUGVkQXBwZWFyYW5jZSB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxuaW1wb3J0IHsgZ2V0RnJhbWV3b3JrSUQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayB9IGZyb20gXCJAdXRpbHNcIlxuXG5leHBvcnQgZnVuY3Rpb24gRVNYQnJpZGdlKCkge1xuICAgIGxldCBmaXJzdFNwYXduID0gZmFsc2VcblxuICAgIG9uKFwiZXN4X3NraW46cmVzZXRGaXJzdFNwYXduXCIsICgpID0+IHtcbiAgICAgICAgZmlyc3RTcGF3biA9IHRydWVcbiAgICB9KTtcblxuICAgIG9uKFwiZXN4X3NraW46cGxheWVyUmVnaXN0ZXJlZFwiLCAoKSA9PiB7XG4gICAgICAgIGlmKGZpcnN0U3Bhd24pXG4gICAgICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKClcbiAgICB9KTtcblxuICAgIG9uTmV0KCdza2luY2hhbmdlcjpsb2FkU2tpbjInLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmICghYXBwZWFyYW5jZS5tb2RlbCkgYXBwZWFyYW5jZS5tb2RlbCA9IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpO1xuICAgICAgICBhd2FpdCBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcbiAgICB9KTtcblxuICAgIG9uTmV0KCdza2luY2hhbmdlcjpnZXRTa2luJywgYXN5bmMgKGNiOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXG4gICAgICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXG4gICAgICAgIGNiKGFwcGVhcmFuY2UpXG4gICAgfSlcblxuICAgIG9uTmV0KCdza2luY2hhbmdlcjpsb2FkU2tpbicsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IGFueSkgPT4ge1xuICAgICAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXG4gICAgICAgIGlmIChjYikgY2IoKVxuICAgIH0pXG5cbiAgICBvbk5ldCgnZXN4X3NraW46b3BlblNhdmVhYmxlTWVudScsIGFzeW5jIChvblN1Ym1pdDogYW55KSA9PiB7XG4gICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24ob25TdWJtaXQpXG4gICAgfSlcbn0iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiO1xuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0RHJhd2FibGVzLCBnZXRQcm9wcyB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL2dldHRlcnNcIjtcbmltcG9ydCB7IHNldERyYXdhYmxlLCBzZXRNb2RlbCwgc2V0UGVkQXBwZWFyYW5jZSwgc2V0UGVkVGF0dG9vcywgc2V0UHJvcCB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL3NldHRlcnNcIjtcbmltcG9ydCB7IFRUYXR0b28gfSBmcm9tIFwiQHR5cGluZ3MvdGF0dG9vc1wiO1xuXG5mdW5jdGlvbiBleHBvcnRIYW5kbGVyKG5hbWU6IHN0cmluZywgY2I6IGFueSkge1xuICAgIG9uKCdfX2NmeF9leHBvcnRfaWxsZW5pdW0tYXBwZWFyYW5jZV8nICsgbmFtZSwgKHNldENCOiBhbnkpID0+IHtcbiAgICAgICAgc2V0Q0IoY2IpO1xuICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbGxlbml1bUNvbXBhdCgpIHtcbiAgICBleHBvcnRIYW5kbGVyKCdzdGFydFBsYXllckN1c3RvbWl6YXRpb24nLCAoKSA9PiB7XG4gICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24oKVxuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkTW9kZWwnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIEdldEVudGl0eU1vZGVsKHBlZClcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZENvbXBvbmVudHMnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgZHJhd2FibGVzOiBhbnkgPSBnZXREcmF3YWJsZXMocGVkKVswXTtcbiAgICAgICAgbGV0IG5ld2RyYXdhYmxlID0gW107XG4gICAgICAgIGZvciAoY29uc3QgaWQgb2YgZHJhd2FibGVzKSB7XG4gICAgICAgICAgICBjb25zdCBkcmF3YWJsZSA9IGRyYXdhYmxlc1tpZF07XG4gICAgICAgICAgICBuZXdkcmF3YWJsZS5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRfaWQ6IGRyYXdhYmxlLmluZGV4LFxuICAgICAgICAgICAgICAgIGRyYXdhYmxlOiBkcmF3YWJsZS52YWx1ZSxcbiAgICAgICAgICAgICAgICB0ZXh0dXJlOiBkcmF3YWJsZS50ZXh0dXJlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRQcm9wcycsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBwcm9wczogYW55ID0gIGdldFByb3BzKHBlZClbMF07XG4gICAgICAgIGxldCBuZXdQcm9wcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIHByb3BzKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9wID0gcHJvcHNbaWRdO1xuICAgICAgICAgICAgbmV3UHJvcHMucHVzaCh7XG4gICAgICAgICAgICAgICAgcHJvcF9pZDogcHJvcC5pbmRleCxcbiAgICAgICAgICAgICAgICBkcmF3YWJsZTogcHJvcC52YWx1ZSxcbiAgICAgICAgICAgICAgICB0ZXh0dXJlOiBwcm9wLnRleHR1cmVcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEhlYWRCbGVuZCcsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgICAgIC8vcmV0dXJuIGdldEhlYWRCbGVuZERhdGEocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEZhY2VGZWF0dXJlcycsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgICAgIC8vcmV0dXJuIGdldEhlYWRTdHJ1Y3R1cmUocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEhlYWRPdmVybGF5cycsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgICAgIC8vcmV0dXJuIGdldEhlYWRPdmVybGF5KHBlZCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRIYWlyJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIC8vcmV0dXJuIGdldEhhaXIocGVkKTtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkQXBwZWFyYW5jZScsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0QXBwZWFyYW5jZShwZWQpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGxheWVyTW9kZWwnLCAobW9kZWw6IG51bWJlcikgPT4ge1xuICAgICAgICBzZXRNb2RlbChQbGF5ZXJQZWRJZCgpLCBtb2RlbCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRIZWFkQmxlbmQnLCAocGVkOiBudW1iZXIsIGJsZW5kOiBhbnkpID0+IHtcbiAgICAgICAgLy9zZXRIZWFkQmxlbmQocGVkLCBibGVuZCk7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZEZhY2VGZWF0dXJlcycsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkSGVhZE92ZXJsYXlzJywgKHBlZDogbnVtYmVyLCBvdmVybGF5OiBhbnkpID0+IHtcbiAgICAgICAgLy9zZXRIZWFkT3ZlcmxheShwZWQsIG92ZXJsYXkpO1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRIYWlyJywgYXN5bmMgKHBlZDogbnVtYmVyLCBoYWlyOiBhbnksIHRhdHRvbzogYW55KSA9PiB7XG4gICAgICAgIC8vc2V0UGVkSGFpckNvbG9ycyhwZWQsIGhhaXIpO1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRFeWVDb2xvcicsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkQ29tcG9uZW50JywgKHBlZDogbnVtYmVyLCBkcmF3YWJsZTogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld0RyYXdhYmxlID0ge1xuICAgICAgICAgICAgaW5kZXg6IGRyYXdhYmxlLmNvbXBvbmVudF9pZCxcbiAgICAgICAgICAgIHZhbHVlOiBkcmF3YWJsZS5kcmF3YWJsZSxcbiAgICAgICAgICAgIHRleHR1cmU6IGRyYXdhYmxlLnRleHR1cmVcbiAgICAgICAgfVxuICAgICAgICBzZXREcmF3YWJsZShwZWQsIG5ld0RyYXdhYmxlKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZENvbXBvbmVudHMnLCAocGVkOiBudW1iZXIsIGNvbXBvbmVudHM6IGFueSkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IGNvbXBvbmVudCBvZiBjb21wb25lbnRzKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdEcmF3YWJsZSA9IHtcbiAgICAgICAgICAgICAgICBpbmRleDogY29tcG9uZW50LmNvbXBvbmVudF9pZCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogY29tcG9uZW50LmRyYXdhYmxlLFxuICAgICAgICAgICAgICAgIHRleHR1cmU6IGNvbXBvbmVudC50ZXh0dXJlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXREcmF3YWJsZShwZWQsIG5ld0RyYXdhYmxlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkUHJvcCcsIChwZWQ6IG51bWJlciwgcHJvcDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1Byb3AgPSB7XG4gICAgICAgICAgICBpbmRleDogcHJvcC5wcm9wX2lkLFxuICAgICAgICAgICAgdmFsdWU6IHByb3AuZHJhd2FibGUsXG4gICAgICAgICAgICB0ZXh0dXJlOiBwcm9wLnRleHR1cmVcbiAgICAgICAgfVxuICAgICAgICBzZXRQcm9wKHBlZCwgbmV3UHJvcCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRQcm9wcycsIChwZWQ6IG51bWJlciwgcHJvcHM6IGFueSkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHByb3Agb2YgcHJvcHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Byb3AgPSB7XG4gICAgICAgICAgICAgICAgaW5kZXg6IHByb3AucHJvcF9pZCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcC5kcmF3YWJsZSxcbiAgICAgICAgICAgICAgICB0ZXh0dXJlOiBwcm9wLnRleHR1cmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldFByb3AocGVkLCBuZXdQcm9wKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gZXhwb3J0SGFuZGxlcignc2V0UGxheWVyQXBwZWFyYW5jZScsIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSkgPT4ge1xuICAgIC8vICAgICByZXR1cm4gY29uc29sZS53YXJuKCdOZWVkIHRvIGJlIGltcGxlbWVudGVkJyk7XG4gICAgLy8gfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRBcHBlYXJhbmNlJywgKHBlZDogbnVtYmVyLCBhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSkgPT4ge1xuICAgICAgICBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZFRhdHRvb3MnLCAocGVkOiBudW1iZXIsIHRhdHRvb3M6IFRUYXR0b29bXSkgPT4ge1xuICAgICAgICBzZXRQZWRUYXR0b29zKHBlZCwgdGF0dG9vcylcbiAgICB9KTtcbn0iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRBcHBlYXJhbmNlWm9uZSwgVE1lbnVUeXBlcyB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IHsgb3Blbk1lbnUgfSBmcm9tIFwiLi9tZW51XCJcclxuaW1wb3J0IHsgc2V0UGVkQXBwZWFyYW5jZSwgc2V0UGxheWVyUGVkQXBwZWFyYW5jZSB9IGZyb20gXCIuL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXHJcbmltcG9ydCB7IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaywgZ2V0RnJhbWV3b3JrSUQsIERlbGF5LCBibF9icmlkZ2UsIHBlZCwgZGVsYXksIGZvcm1hdCB9IGZyb20gXCJAdXRpbHNcIlxyXG5pbXBvcnQgeyBRQkJyaWRnZSB9IGZyb20gXCIuL2JyaWRnZS9xYlwiXHJcbmltcG9ydCB7IEVTWEJyaWRnZSB9IGZyb20gXCIuL2JyaWRnZS9lc3hcIlxyXG5pbXBvcnQgeyBpbGxlbml1bUNvbXBhdCB9IGZyb20gXCIuL2NvbXBhdC9pbGxlbml1bVwiXHJcblxyXG5SZWdpc3RlckNvbW1hbmQoJ29wZW5NZW51JywgYXN5bmMgKF8sIGFyZ3M6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBjb25zdCB0eXBlID0gYXJnc1swXVxyXG4gICAgaWYgKCF0eXBlKSB7XHJcbiAgICAgICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkluaXRpYWxDcmVhdGlvbigpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHpvbmUgPSB0eXBlLnRvTG93ZXJDYXNlKCkgYXMgVE1lbnVUeXBlc1xyXG4gICAgICAgIG9wZW5NZW51KHsgdHlwZTogem9uZSwgY29vcmRzOiBbMCwgMCwgMCwgMF0gfSlcclxuICAgIH1cclxufSwgdHJ1ZSlcclxuXHJcbmV4cG9ydHMoJ1NldFBlZEFwcGVhcmFuY2UnLCBhc3luYyAocGVkOiBudW1iZXIsIGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlKSA9PiB7XHJcbiAgICBhd2FpdCBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcclxufSlcclxuXHJcbmV4cG9ydHMoJ1NldFBsYXllclBlZEFwcGVhcmFuY2UnLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UgfCBzdHJpbmcpID0+IHtcclxuICAgIGxldCByZXNvbHZlZEFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlO1xyXG4gICAgXHJcbiAgICBpZiAoIWFwcGVhcmFuY2UgfHwgdHlwZW9mIGFwcGVhcmFuY2UgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgY29uc3QgZnJhbWV3b3JrSUQ6IHN0cmluZyA9IGFwcGVhcmFuY2UgfHwgYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKTtcclxuICAgICAgICByZXNvbHZlZEFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpIGFzIFRBcHBlYXJhbmNlO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYXBwZWFyYW5jZSA9PT0gJ29iamVjdCcpIHJlc29sdmVkQXBwZWFyYW5jZSA9IGFwcGVhcmFuY2U7XHJcbiAgICBcclxuICAgIGlmICghcmVzb2x2ZWRBcHBlYXJhbmNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyB2YWxpZCBhcHBlYXJhbmNlIGZvdW5kJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UocmVzb2x2ZWRBcHBlYXJhbmNlKTtcclxufSk7XHJcblxyXG5leHBvcnRzKCdHZXRQbGF5ZXJQZWRBcHBlYXJhbmNlJywgYXN5bmMgKGZyYW1ld29ya0lEOiBzdHJpbmcpID0+IHtcclxuICAgIGZyYW1ld29ya0lEID0gZnJhbWV3b3JrSUQgfHwgYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgcmV0dXJuIGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxufSlcclxuXHJcbmV4cG9ydHMoJ0luaXRpYWxDcmVhdGlvbicsIGFzeW5jIChjYj86IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICAvLyBUaGUgZmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgdHlwZSBvZiBUQXBwZWFyYW5jZVpvbmUgbWVhbmluZyBpdCBuZWVkcyBhIGNvb3JkcyBwcm9wZXJ0eSwgYnV0IGluIHRoaXMgY2FzZSBpdCdzIG5vdCB1c2VkXHJcbiAgICBhd2FpdCBvcGVuTWVudSh7IHR5cGU6IFwiYXBwZWFyYW5jZVwiLCBjb29yZHM6IFswLCAwLCAwLCAwXSB9LCB0cnVlKVxyXG4gICAgaWYgKGNiKSBjYigpXHJcbn0pXHJcblxyXG5vbignYmxfc3ByaXRlczpjbGllbnQ6dXNlWm9uZScsICh6b25lOiBUQXBwZWFyYW5jZVpvbmUpID0+IHtcclxuICAgIG9wZW5NZW51KHpvbmUpXHJcbn0pXHJcblxyXG5vbk5ldCgnYmxfYnJpZGdlOmNsaWVudDpwbGF5ZXJMb2FkZWQnLCBhc3luYyAoKSA9PiB7XHJcbiAgICB3aGlsZSAoIWJsX2JyaWRnZS5jb3JlKCkucGxheWVyTG9hZGVkKCkpIHtcclxuICAgICAgICBhd2FpdCBEZWxheSgxMDApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgaWYgKCFhcHBlYXJhbmNlKSByZXR1cm47XHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcbn0pXHJcblxyXG5vbk5ldCgnb25SZXNvdXJjZVN0YXJ0JywgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcpID0+IHtcclxuICAgIGlmIChyZXNvdXJjZSA9PT0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpICYmIGJsX2JyaWRnZS5jb3JlKCkucGxheWVyTG9hZGVkKCkpIHtcclxuICAgICAgICBjb25zdCBmcmFtZXdvcmtJRCA9IGF3YWl0IGdldEZyYW1ld29ya0lEKClcclxuICAgICAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgICAgIGlmICghYXBwZWFyYW5jZSkgcmV0dXJuO1xyXG4gICAgICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSlcclxuICAgIH1cclxufSlcclxuXHJcbmNvbnN0IGZyYW1ld29ya05hbWUgPSBibF9icmlkZ2UuZ2V0RnJhbWV3b3JrKCdjb3JlJylcclxuY29uc3QgY29yZSA9IGZvcm1hdChHZXRDb252YXIoJ2JsOmZyYW1ld29yaycsICdxYicpKVxyXG5cclxuaWYgKGNvcmUgPT0gJ3FiJyB8fCBjb3JlID09ICdxYngnICYmIEdldFJlc291cmNlU3RhdGUoZnJhbWV3b3JrTmFtZSkgPT0gJ3N0YXJ0ZWQnKSB7XHJcbiAgICBRQkJyaWRnZSgpO1xyXG59IGVsc2UgaWYgKGNvcmUgPT0gJ2VzeCcgJiYgR2V0UmVzb3VyY2VTdGF0ZShmcmFtZXdvcmtOYW1lKSA9PSAnc3RhcnRlZCcpIHtcclxuICAgIEVTWEJyaWRnZSgpO1xyXG59XHJcblxyXG5pbGxlbml1bUNvbXBhdCgpO1xyXG5cclxuUmVnaXN0ZXJDb21tYW5kKCdyZWxvYWRza2luJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICBjb25zdCBoZWFsdGggPSBHZXRFbnRpdHlIZWFsdGgocGVkKTtcclxuICAgIGNvbnN0IG1heGhlYWx0aCA9IEdldEVudGl0eU1heEhlYWx0aChwZWQpO1xyXG4gICAgY29uc3QgYXJtb3IgPSBHZXRQZWRBcm1vdXIocGVkKTtcclxuXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgaWYgKCFhcHBlYXJhbmNlKSByZXR1cm47XHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcblxyXG4gICAgU2V0UGVkTWF4SGVhbHRoKHBlZCwgbWF4aGVhbHRoKVxyXG4gICAgZGVsYXkoMTAwMCkgXHJcbiAgICBTZXRFbnRpdHlIZWFsdGgocGVkLCBoZWFsdGgpXHJcbiAgICBTZXRQZWRBcm1vdXIocGVkLCBhcm1vcilcclxufSwgZmFsc2UpXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7QUFBTyxJQUFJLE1BQU07QUFFVixJQUFNLFlBQVksd0JBQUMsY0FBc0I7QUFDNUMsUUFBTTtBQUNWLEdBRnlCO0FBYWxCLElBQU0sZUFBZSx3QkFBQyxRQUFnQixTQUFjO0FBQ3ZELGlCQUFlO0FBQUEsSUFDWDtBQUFBLElBQ0E7QUFBQSxFQUNKLENBQUM7QUFDTCxHQUw0QjtBQU9yQixJQUFNLFFBQVEsd0JBQUMsT0FBZSxJQUFJLFFBQVEsU0FBTyxXQUFXLEtBQUssRUFBRSxDQUFDLEdBQXREO0FBRWQsSUFBTSxlQUFlLDhCQUFPLFVBQTRDO0FBQzNFLE1BQUksWUFBb0IsT0FBTyxVQUFVLFdBQVcsUUFBUSxXQUFXLEtBQUs7QUFFNUUsTUFBSSxDQUFDLGFBQWEsU0FBUyxLQUFLLENBQUMsaUJBQWlCLFNBQVMsR0FBRztBQU8xRCxZQUFRLEtBQUssb0NBQW9DLEtBQUssR0FBRztBQUN6RCxXQUFPO0FBQUEsRUFDWDtBQUVBLE1BQUksZUFBZSxTQUFTO0FBQUcsV0FBTztBQUV0QyxlQUFhLFNBQVM7QUFFdEIsUUFBTSxxQkFBcUIsNkJBQXFCO0FBQzVDLFdBQU8sSUFBSSxRQUFRLGFBQVc7QUFDMUIsWUFBTSxXQUFXLFlBQVksTUFBTTtBQUMvQixZQUFJLGVBQWUsU0FBUyxHQUFHO0FBQzNCLHdCQUFjLFFBQVE7QUFDdEIsa0JBQVE7QUFBQSxRQUNaO0FBQUEsTUFDSixHQUFHLEdBQUc7QUFBQSxJQUNWLENBQUM7QUFBQSxFQUNMLEdBVDJCO0FBVzNCLFFBQU0sbUJBQW1CO0FBRXpCLFNBQU87QUFDWCxHQWhDNEI7QUFzQzVCLElBQU0sZUFBZSx1QkFBdUI7QUFDNUMsSUFBTSxjQUFzQyxDQUFDO0FBQzdDLElBQU0sZUFBeUQsQ0FBQztBQUVoRSxTQUFTLFdBQVcsV0FBbUJBLFFBQXNCO0FBQ3pELE1BQUlBLFVBQVNBLFNBQVEsR0FBRztBQUNwQixVQUFNLGNBQWMsYUFBYTtBQUVqQyxTQUFLLFlBQVksU0FBUyxLQUFLLEtBQUs7QUFBYSxhQUFPO0FBRXhELGdCQUFZLFNBQVMsSUFBSSxjQUFjQTtBQUFBLEVBQzNDO0FBRUEsU0FBTztBQUNYO0FBVlM7QUFZVCxNQUFNLFVBQVUsWUFBWSxJQUFJLENBQUMsUUFBZ0IsU0FBYztBQUMzRCxRQUFNLFVBQVUsYUFBYSxHQUFHO0FBQ2hDLFNBQU8sV0FBVyxRQUFRLEdBQUcsSUFBSTtBQUNyQyxDQUFDO0FBRU0sU0FBUyxzQkFDWixjQUFzQixNQUNMO0FBQ2pCLE1BQUksQ0FBQyxXQUFXLFdBQVcsQ0FBQyxHQUFHO0FBQzNCO0FBQUEsRUFDSjtBQUVBLE1BQUk7QUFFSixLQUFHO0FBQ0MsVUFBTSxHQUFHLFNBQVMsSUFBSSxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssTUFBUyxFQUFFLENBQUM7QUFBQSxFQUNsRSxTQUFTLGFBQWEsR0FBRztBQUN6QixVQUFRLFVBQVUsU0FBUyxJQUFJLGNBQWMsS0FBSyxHQUFHLElBQUk7QUFFekQsU0FBTyxJQUFJLFFBQVcsQ0FBQyxZQUFZO0FBQy9CLGlCQUFhLEdBQUcsSUFBSTtBQUFBLEVBQ3hCLENBQUM7QUFDTDtBQWpCZ0I7QUFtQlQsU0FBUyxpQkFBaUIsV0FBVyxJQUFJO0FBQzVDLFFBQU0sVUFBVSxTQUFTLElBQUksT0FBTyxVQUFVLFFBQVEsU0FBUztBQUMzRCxRQUFJO0FBQ0osUUFBSTtBQUNBLGlCQUFXLE1BQU0sR0FBRyxHQUFHLElBQUk7QUFBQSxJQUMvQixTQUNPLEdBQUc7QUFDTixjQUFRLE1BQU0sbURBQW1ELFNBQVMsRUFBRTtBQUM1RSxjQUFRLElBQUksS0FBSyxFQUFFLEtBQUssSUFBSTtBQUFBLElBQ2hDO0FBQ0EsWUFBUSxVQUFVLFFBQVEsSUFBSSxLQUFLLFFBQVE7QUFBQSxFQUMvQyxDQUFDO0FBQ0w7QUFaZ0I7QUFnQlQsSUFBTSxnQkFBZ0Isd0JBQUMsb0JBQTRCO0FBQ3RELFNBQU8sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM1QixVQUFNLG9CQUFvQiw2QkFBTTtBQUM1QixVQUFJLHVCQUF1QixlQUFlLEdBQUc7QUFDekMsY0FBTSxhQUFhLFFBQVEsY0FBYyxPQUFPLEVBQUU7QUFDbEQsWUFBSSxvQkFBb0IsaUJBQWlCLGNBQWMsVUFBVSxVQUFVLE9BQU87QUFDbEYsWUFBSSxDQUFDLG1CQUFtQjtBQUNwQixrQkFBUSxNQUFNLEdBQUcsVUFBVSxxRUFBcUU7QUFDaEcsOEJBQW9CLGlCQUFpQixjQUFjLGdCQUFnQjtBQUFBLFFBQ3ZFO0FBQ0EsZ0JBQVEsaUJBQWlCO0FBQUEsTUFDN0IsT0FBTztBQUNILG1CQUFXLG1CQUFtQixHQUFHO0FBQUEsTUFDckM7QUFBQSxJQUNKLEdBWjBCO0FBYTFCLHNCQUFrQjtBQUFBLEVBQ3RCLENBQUM7QUFDTCxHQWpCNkI7QUEyQnRCLElBQU0sWUFBWSxRQUFRO0FBRTFCLElBQU0sZ0JBQWdCLDZCQUFNO0FBQy9CLFNBQU8sVUFBVSxLQUFLLEVBQUUsY0FBYztBQUMxQyxHQUY2QjtBQUl0QixJQUFNLGlCQUFpQiw2QkFBTTtBQUNoQyxRQUFNLEtBQUssY0FBYyxFQUFFO0FBQzNCLFNBQU87QUFDWCxHQUg4QjtBQUt2QixJQUFNLHVCQUF1Qiw2QkFBTTtBQUN0QyxRQUFNLFNBQVMsY0FBYyxFQUFFO0FBQy9CLFNBQU8sV0FBVyxTQUFTLHFCQUFxQjtBQUNwRCxHQUhvQztBQUs3QixTQUFTLE1BQU0sSUFBMkI7QUFDN0MsU0FBTyxJQUFJLFFBQVEsYUFBVyxXQUFXLFNBQVMsRUFBRSxDQUFDO0FBQ3pEO0FBRmdCO0FBSVQsU0FBUyxPQUFPLEtBQXFCO0FBQ3hDLE1BQUksQ0FBQyxJQUFJLFNBQVMsR0FBRztBQUFHLFdBQU87QUFDL0IsU0FBTyxJQUFJLFFBQVEsTUFBTSxFQUFFO0FBQy9CO0FBSGdCO0FBS1QsU0FBUyxhQUF1RDtBQUNuRSxRQUFNLE1BQU0sY0FBYyxFQUFFO0FBQzVCLFNBQU8sTUFBTSxFQUFFLE1BQU0sSUFBSSxNQUFNLFFBQVEsSUFBSSxPQUFPLElBQUk7QUFDMUQ7QUFIZ0I7QUFVVCxTQUFTLG1CQUFtQkMsTUFBYTtBQUM1QyxRQUFNLFFBQVEsZUFBZUEsSUFBRztBQUNoQyxTQUFPLFVBQVUsV0FBVyxrQkFBa0IsS0FBSyxVQUFVLFdBQVcsa0JBQWtCO0FBQzlGO0FBSGdCOzs7QUNoTGhCLElBQU0sMEJBQTBCO0FBQ2hDLElBQU0sdUJBQXVCO0FBRTdCLElBQUksVUFBbUI7QUFDdkIsSUFBSSxjQUFzQjtBQUMxQixJQUFJLE1BQXFCO0FBQ3pCLElBQUksU0FBaUI7QUFDckIsSUFBSSxTQUFpQjtBQUNyQixJQUFJLGVBQStCO0FBQ25DLElBQUksU0FBd0I7QUFDNUIsSUFBSSxjQUF1QjtBQUUzQixJQUFJLGNBQWtDO0FBRXRDLElBQU0sY0FBNEI7QUFBQSxFQUM5QixPQUFPO0FBQUEsRUFDVixNQUFNO0FBQUEsRUFDTixPQUFPO0FBQUEsRUFDUCxNQUFNLENBQUMsT0FBTyxLQUFLO0FBQUEsRUFDaEIsT0FBTyxDQUFDLE9BQU8sS0FBSztBQUN4QjtBQUVBLElBQU0sTUFBTSx3QkFBQyxZQUE0QjtBQUN4QyxTQUFPLEtBQUssSUFBSyxVQUFVLEtBQUssS0FBTSxHQUFHO0FBQzFDLEdBRlk7QUFJWixJQUFNLE1BQU0sd0JBQUMsWUFBNEI7QUFDeEMsU0FBTyxLQUFLLElBQUssVUFBVSxLQUFLLEtBQU0sR0FBRztBQUMxQyxHQUZZO0FBSVosSUFBTSxZQUFZLDZCQUFnQjtBQUNqQyxRQUFNLEtBQ0gsSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLEtBQUssSUFDM0Q7QUFDRCxRQUFNLEtBQ0gsSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLEtBQUssSUFDM0Q7QUFDRCxRQUFNLElBQUksSUFBSSxNQUFNLElBQUk7QUFFeEIsU0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLEdBVmtCO0FBWWxCLElBQU0saUJBQWlCLHdCQUFDLFFBQWlCLFdBQTBCO0FBQ2xFLE1BQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCO0FBQWE7QUFFOUMsV0FBUyxVQUFVO0FBQ25CLFdBQVMsVUFBVTtBQUVuQixZQUFVO0FBQ1YsWUFBVTtBQUVQLFFBQU0sZ0JBQWdCLGdCQUFnQixXQUFXLGdCQUFnQjtBQUNqRSxRQUFNLFdBQVcsZ0JBQWdCLEtBQU87QUFFeEMsUUFBTSxVQUFVLGdCQUFnQjtBQUNoQyxRQUFNLFdBQVcsVUFBVSxJQUFNO0FBRXBDLFdBQVMsS0FBSyxJQUFJLEtBQUssSUFBSSxRQUFRLFFBQVEsR0FBRyxRQUFRO0FBRXRELFFBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLFVBQVU7QUFFNUI7QUFBQSxJQUNDO0FBQUEsSUFDQSxhQUFhLElBQUk7QUFBQSxJQUNqQixhQUFhLElBQUk7QUFBQSxJQUNqQixhQUFhLElBQUk7QUFBQSxFQUNsQjtBQUNBLGtCQUFnQixLQUFLLGFBQWEsR0FBRyxhQUFhLEdBQUcsYUFBYSxDQUFDO0FBQ3BFLEdBMUJ1QjtBQTRCdkIsSUFBTSxhQUFhLDhCQUFPLFFBQWlCLGFBQXNCO0FBQ2hFLFFBQU0sVUFBa0IsaUJBQWlCLEdBQUcsSUFBSTtBQUNoRCxhQUFXLFlBQVk7QUFFdkIsZ0JBQWM7QUFDZCxnQkFBYztBQUNkLFdBQVM7QUFFVCxRQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxVQUFVO0FBRTVCLFFBQU0sU0FBaUI7QUFBQSxJQUN0QjtBQUFBLElBQ0EsT0FBTyxJQUFJO0FBQUEsSUFDWCxPQUFPLElBQUk7QUFBQSxJQUNYLE9BQU8sSUFBSTtBQUFBLElBQ1g7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Q7QUFFQSxpQkFBZTtBQUNmLGdCQUFjO0FBQ2QsV0FBUztBQUNULFFBQU07QUFFTixrQkFBZ0IsUUFBUSxPQUFPLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUNwRCx5QkFBdUIsUUFBUSxRQUFRLEtBQUssR0FBRyxDQUFDO0FBRWhELFFBQU0sTUFBTSxHQUFHO0FBRWYsMEJBQXdCLFFBQVEsSUFBSTtBQUNwQyxnQkFBYyxRQUFRLEdBQUc7QUFDekIsZUFBYSxRQUFRLEdBQUc7QUFDeEIsb0JBQWtCLFFBQVEsR0FBRztBQUM3QixXQUFTLE1BQU07QUFFZixhQUFXLFFBQVEsSUFBSTtBQUN4QixHQXhDbUI7QUEwQ25CLElBQU0sV0FBVyx3QkFBQyxlQUF1QjtBQUN4QyxNQUFJLEVBQUUsYUFBYSxHQUFHLEtBQUssY0FBYztBQUFNO0FBQy9DLGNBQVk7QUFDWixhQUFXLFVBQVUsQ0FBQztBQUN2QixHQUppQjtBQU1WLElBQU0sY0FBYyw2QkFBTTtBQUNoQyxNQUFJO0FBQVM7QUFDYixZQUFVO0FBQ1YsZ0JBQWM7QUFDZCxRQUFNLFVBQVUsMkJBQTJCLElBQUk7QUFDL0MsUUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQWMsaUJBQWlCLEtBQUssT0FBTyxHQUFLLEdBQUssQ0FBRztBQUN0RSxjQUFZLEtBQUssR0FBRyxHQUFHLENBQUM7QUFDeEIsbUJBQWlCLE1BQU0sTUFBTSxLQUFNLE1BQU0sSUFBSTtBQUUxQyxZQUFVLFNBQVMsV0FBVztBQUNsQyxHQVYyQjtBQVlwQixJQUFNLGFBQWEsNkJBQVk7QUFDckMsTUFBSSxDQUFDO0FBQVM7QUFDZCxZQUFVO0FBRVYsbUJBQWlCLE9BQU8sTUFBTSxLQUFLLE1BQU0sS0FBSztBQUM5QyxhQUFXLEtBQUssSUFBSTtBQUNwQixRQUFNO0FBQ04saUJBQWU7QUFDaEIsR0FSMEI7QUFVMUIsSUFBTSxZQUFZLHdCQUFDLE1BQTJCLFdBQVcsZ0JBQXNCO0FBRTlFLFFBQU0sT0FBc0MsWUFBWSxJQUFJO0FBRXpELFFBQU0sY0FBYyxNQUFNLFFBQVEsSUFBSTtBQUV0QyxnQkFBYztBQUVkLE1BQUksQ0FBQyxlQUFlLFNBQVMsR0FBRztBQUM1QixVQUFNLENBQUNDLElBQUdDLElBQUdDLEVBQUMsSUFBYyxnQkFBZ0IsS0FBSyxLQUFLO0FBQ3REO0FBQUEsTUFDSTtBQUFBLFFBQ0ksR0FBR0Y7QUFBQSxRQUNILEdBQUdDO0FBQUEsUUFDSCxHQUFHQyxLQUFJO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQ0E7QUFBQSxFQUNKO0FBR0EsTUFBSSxXQUFXO0FBQXNCLGVBQVc7QUFFaEQsTUFBSSxhQUFhO0FBQ2IsVUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLElBQWMsaUJBQWlCLEtBQUssS0FBSyxDQUFDLEdBQUcsR0FBSyxHQUFLLENBQUc7QUFFM0UsVUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLElBQWMsaUJBQWlCLEtBQUssS0FBSyxDQUFDLEdBQUcsR0FBSyxHQUFLLENBQUc7QUFHM0UsUUFBSSxLQUFLLEtBQUssTUFBTTtBQUNwQixRQUFJLEtBQUssS0FBSyxNQUFNO0FBQ3BCLFFBQUksS0FBSyxLQUFLLE1BQU07QUFBQSxFQUN4QixPQUFPO0FBQ0gsUUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQWMsaUJBQWlCLEtBQUssTUFBTSxHQUFLLEdBQUssQ0FBRztBQUFBLEVBQ3ZFO0FBRUg7QUFBQSxJQUNDO0FBQUEsTUFDQztBQUFBLE1BQ0E7QUFBQSxNQUNBLEdBQUcsSUFBSTtBQUFBLElBQ1I7QUFBQSxJQUNBO0FBQUEsRUFDRDtBQUVELEdBOUNrQjtBQWdEbEIsd0RBQXFDLENBQUMsTUFBTSxPQUFPO0FBQy9DLGlCQUFlLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDN0IsS0FBRyxDQUFDO0FBQ1IsQ0FBQztBQUlELDhEQUF3QyxDQUFDLE1BQWdCLE9BQWlCO0FBQ3pFLFVBQVEsTUFBTTtBQUFBLElBQ1AsS0FBSztBQUNELGdCQUFVLFNBQVMsdUJBQXVCO0FBQzFDO0FBQUEsSUFDSixLQUFLO0FBQ0QsZ0JBQVUsTUFBTTtBQUNoQjtBQUFBLElBQ0osS0FBSztBQUNELGdCQUFVLE9BQU87QUFDakI7QUFBQSxJQUNKLEtBQUs7QUFDRCxnQkFBVSxNQUFNO0FBQ2hCO0FBQUEsSUFDSixLQUFLO0FBQ0QsZ0JBQVUsT0FBTztBQUNqQixxQkFBZTtBQUNmO0FBQUEsRUFDWDtBQUNBLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCx3REFBcUMsQ0FBQyxNQUFNLE9BQU87QUFDbEQsTUFBSSxTQUFTLFFBQVE7QUFFZCxVQUFNLFVBQVUsZ0JBQWdCLFVBQVUsMEJBQTBCO0FBRTFFLFVBQU0sY0FBc0IsY0FBYztBQUMxQyxrQkFBYyxlQUFlLFVBQVUsVUFBVTtBQUFBLEVBQ2xELFdBQVcsU0FBUyxNQUFNO0FBQ3pCLFVBQU0sY0FBc0IsY0FBYztBQUMxQyxrQkFBYyxlQUFlLE1BQU0sTUFBTTtBQUFBLEVBQzFDO0FBRUEsZ0JBQWM7QUFDZCxpQkFBZTtBQUNmLEtBQUcsQ0FBQztBQUNMLENBQUM7OztBQzVPRCxJQUFPLGVBQVE7QUFBQSxFQUNYO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKOzs7QUNmQSxJQUFPLGVBQVE7QUFBQSxFQUNYO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKOzs7QUNyQkEsSUFBTyxvQkFBUTtBQUFBLEVBQ1g7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKOzs7QUNiQSxJQUFPLGdCQUFRO0FBQUEsRUFDWDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDSjs7O0FDRk8sU0FBUyxlQUFlLFFBQWdCO0FBQzNDLFFBQU1DLFVBQVMsUUFBUTtBQUN2QixRQUFNLFNBQVNBLFFBQU8sT0FBTztBQUU3QixTQUFPLE9BQU8sVUFBVSxDQUFDLFVBQWtCLFdBQVcsS0FBSyxNQUFNLE1BQU07QUFDM0U7QUFMZ0I7QUFPVCxTQUFTLFFBQVEsV0FBOEI7QUFDbEQsU0FBTztBQUFBLElBQ0gsT0FBTyxnQkFBZ0IsU0FBUztBQUFBLElBQ2hDLFdBQVcseUJBQXlCLFNBQVM7QUFBQSxFQUNqRDtBQUNKO0FBTGdCO0FBT1QsU0FBUyxpQkFBaUIsV0FBbUI7QUFFaEQsUUFBTSxTQUFTLElBQUksWUFBWSxFQUFFO0FBQ2pDLFNBQU8sUUFBUSxhQUFhLHNCQUFzQixXQUFXLElBQUksWUFBWSxNQUFNLENBQUM7QUFFcEYsUUFBTSxFQUFFLEdBQUcsWUFBWSxHQUFHLGFBQWEsR0FBRyxZQUFZLEdBQUcsV0FBVyxHQUFHLFlBQVksSUFBSSxXQUFXLElBQUksVUFBVSxJQUFJLElBQUksWUFBWSxNQUFNO0FBQzFJLFFBQU0sRUFBRSxHQUFHLFVBQVUsR0FBRyxTQUFTLEdBQUcsU0FBUyxJQUFJLElBQUksYUFBYSxRQUFRLEVBQUU7QUFXNUUsU0FBTztBQUFBLElBQ0g7QUFBQTtBQUFBLElBQ0E7QUFBQTtBQUFBLElBQ0E7QUFBQSxJQUVBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUVBO0FBQUE7QUFBQSxJQUVBO0FBQUEsSUFDQTtBQUFBO0FBQUEsSUFFQSxXQUFXLFFBQVEsU0FBUztBQUFBLEVBQ2hDO0FBQ0o7QUFqQ2dCO0FBbUNULFNBQVMsZUFBZSxXQUFtQjtBQUM5QyxNQUFJLFNBQTRCLENBQUM7QUFDakMsTUFBSSxXQUF5QixDQUFDO0FBRTlCLFdBQVMsSUFBSSxHQUFHLElBQUksYUFBYyxRQUFRLEtBQUs7QUFDM0MsVUFBTSxVQUFVLGFBQWMsQ0FBQztBQUMvQixXQUFPLE9BQU8sSUFBSSx3QkFBd0IsQ0FBQztBQUUzQyxRQUFJLFlBQVksWUFBWTtBQUN4QixlQUFTLE9BQU8sSUFBSTtBQUFBLFFBQ2hCLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGNBQWMsZUFBZSxTQUFTO0FBQUEsTUFDMUM7QUFBQSxJQUNKLE9BQU87QUFDSCxZQUFNLENBQUMsR0FBRyxjQUFjLFlBQVksWUFBWSxhQUFhLGNBQWMsSUFBSSxzQkFBc0IsV0FBVyxDQUFDO0FBQ2pILGVBQVMsT0FBTyxJQUFJO0FBQUEsUUFDaEIsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsY0FBYyxpQkFBaUIsTUFBTSxLQUFLO0FBQUEsUUFDMUM7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxTQUFPLENBQUMsVUFBVSxNQUFNO0FBQzVCO0FBN0JnQjtBQStCVCxTQUFTLGlCQUFpQixXQUFtQjtBQUNoRCxRQUFNLFdBQVcsZUFBZSxTQUFTO0FBRXpDLE1BQUksYUFBYSxXQUFXLGtCQUFrQixLQUFLLGFBQWEsV0FBVyxrQkFBa0I7QUFBRztBQUVoRyxNQUFJLGFBQWEsQ0FBQztBQUNsQixXQUFTLElBQUksR0FBRyxJQUFJLGFBQWMsUUFBUSxLQUFLO0FBQzNDLFVBQU0sVUFBVSxhQUFjLENBQUM7QUFDL0IsZUFBVyxPQUFPLElBQUk7QUFBQSxNQUNsQixJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxPQUFPLGtCQUFrQixXQUFXLENBQUM7QUFBQSxJQUN6QztBQUFBLEVBQ0o7QUFFQSxTQUFPO0FBQ1g7QUFoQmdCO0FBa0JULFNBQVMsYUFBYSxXQUFtQjtBQUM1QyxNQUFJLFlBQVksQ0FBQztBQUNqQixNQUFJLGlCQUFpQixDQUFDO0FBRXRCLFdBQVMsSUFBSSxHQUFHLElBQUksa0JBQWUsUUFBUSxLQUFLO0FBQzVDLFVBQU0sT0FBTyxrQkFBZSxDQUFDO0FBQzdCLFVBQU0sVUFBVSx3QkFBd0IsV0FBVyxDQUFDO0FBRXBELG1CQUFlLElBQUksSUFBSTtBQUFBLE1BQ25CLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8saUNBQWlDLFdBQVcsQ0FBQztBQUFBLE1BQ3BELFVBQVUsZ0NBQWdDLFdBQVcsR0FBRyxPQUFPO0FBQUEsSUFDbkU7QUFDQSxjQUFVLElBQUksSUFBSTtBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osT0FBTztBQUFBLE1BQ1AsT0FBTyx3QkFBd0IsV0FBVyxDQUFDO0FBQUEsTUFDM0MsU0FBUyx1QkFBdUIsV0FBVyxDQUFDO0FBQUEsSUFDaEQ7QUFBQSxFQUNKO0FBRUEsU0FBTyxDQUFDLFdBQVcsY0FBYztBQUNyQztBQXZCZ0I7QUF5QlQsU0FBUyxTQUFTLFdBQW1CO0FBQ3hDLE1BQUksUUFBUSxDQUFDO0FBQ2IsTUFBSSxhQUFhLENBQUM7QUFFbEIsV0FBUyxJQUFJLEdBQUcsSUFBSSxjQUFXLFFBQVEsS0FBSztBQUN4QyxVQUFNLE9BQU8sY0FBVyxDQUFDO0FBQ3pCLFVBQU0sVUFBVSxnQkFBZ0IsV0FBVyxDQUFDO0FBRTVDLGVBQVcsSUFBSSxJQUFJO0FBQUEsTUFDZixJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxPQUFPLHFDQUFxQyxXQUFXLENBQUM7QUFBQSxNQUN4RCxVQUFVLG9DQUFvQyxXQUFXLEdBQUcsT0FBTztBQUFBLElBQ3ZFO0FBRUEsVUFBTSxJQUFJLElBQUk7QUFBQSxNQUNWLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8sZ0JBQWdCLFdBQVcsQ0FBQztBQUFBLE1BQ25DLFNBQVMsdUJBQXVCLFdBQVcsQ0FBQztBQUFBLElBQ2hEO0FBQUEsRUFDSjtBQUVBLFNBQU8sQ0FBQyxPQUFPLFVBQVU7QUFDN0I7QUF4QmdCO0FBMkJoQixlQUFzQixjQUFjLFdBQXlDO0FBQ3pFLFFBQU0sQ0FBQyxVQUFVLE1BQU0sSUFBSSxlQUFlLFNBQVM7QUFDbkQsUUFBTSxDQUFDLFdBQVcsU0FBUyxJQUFJLGFBQWEsU0FBUztBQUNyRCxRQUFNLENBQUMsT0FBTyxTQUFTLElBQUksU0FBUyxTQUFTO0FBQzdDLFFBQU0sUUFBUSxlQUFlLFNBQVM7QUFFdEMsU0FBTztBQUFBLElBQ0gsWUFBWSxlQUFlLEtBQUs7QUFBQSxJQUNoQztBQUFBLElBQ0EsV0FBVyxRQUFRLFNBQVM7QUFBQSxJQUM1QixXQUFXLGlCQUFpQixTQUFTO0FBQUEsSUFDckMsYUFBYTtBQUFBLElBQ2Isa0JBQWtCO0FBQUEsSUFDbEIsZUFBZSxpQkFBaUIsU0FBUztBQUFBLElBQ3pDO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxTQUFTLENBQUM7QUFBQSxFQUNkO0FBQ0o7QUFwQnNCO0FBcUJ0QixRQUFRLGlCQUFpQixhQUFhO0FBQ3RDLGlCQUFpQixzQ0FBc0MsTUFBTTtBQUN6RCxTQUFPLGNBQWMsT0FBTyxZQUFZLENBQUM7QUFDN0MsQ0FBQztBQUVNLFNBQVMsY0FBYyxXQUE2QjtBQUN2RCxRQUFNLENBQUMsU0FBUyxJQUFJLGFBQWEsU0FBUztBQUMxQyxRQUFNLENBQUMsS0FBSyxJQUFJLFNBQVMsU0FBUztBQUNsQyxRQUFNLENBQUMsUUFBUSxJQUFJLGVBQWUsU0FBUztBQUUzQyxTQUFPO0FBQUEsSUFDSCxhQUFhO0FBQUEsSUFDYjtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQ0o7QUFWZ0I7QUFXaEIsUUFBUSxpQkFBaUIsYUFBYTtBQUUvQixTQUFTLFdBQVcsV0FBMEI7QUFDakQsU0FBTztBQUFBLElBQ0gsV0FBVyxpQkFBaUIsU0FBUztBQUFBLElBQ3JDLGVBQWUsaUJBQWlCLFNBQVM7QUFBQSxJQUN6QyxXQUFXLFFBQVEsU0FBUztBQUFBLElBQzVCLE9BQU8sZUFBZSxTQUFTO0FBQUEsRUFDbkM7QUFDSjtBQVBnQjtBQVFoQixRQUFRLGNBQWMsVUFBVTtBQUV6QixTQUFTLGdCQUFnQjtBQUM1QixNQUFJLGNBQWMsQ0FBQztBQUVuQixRQUFNLENBQUMsYUFBYSxpQkFBaUIsSUFBSSxRQUFRLGNBQWMsUUFBUTtBQUN2RSxXQUFTLElBQUksR0FBRyxJQUFJLGtCQUFrQixRQUFRLEtBQUs7QUFDL0MsVUFBTSxXQUFXLGtCQUFrQixDQUFDO0FBQ3BDLFVBQU0sT0FBTyxTQUFTO0FBQ3RCLFVBQU0sUUFBUSxTQUFTO0FBQ3ZCLFVBQU0sUUFBUSxTQUFTO0FBQ3ZCLGdCQUFZLEtBQUssSUFBSTtBQUFBLE1BQ2pCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsV0FBVztBQUFBLE1BQ1gsTUFBTSxDQUFDO0FBQUEsSUFDWDtBQUVBLGFBQVMsSUFBSSxHQUFHLElBQUksWUFBWSxRQUFRLEtBQUs7QUFDekMsWUFBTSxVQUFVLFlBQVksQ0FBQztBQUM3QixrQkFBWSxLQUFLLEVBQUUsS0FBSyxLQUFLO0FBQUEsUUFDekIsT0FBTyxRQUFRO0FBQUEsUUFDZixVQUFVO0FBQUEsUUFDVixTQUFTLENBQUM7QUFBQSxNQUNkLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQUVBLFFBQU0sV0FBVyxlQUFlLEdBQUcsTUFBTSxXQUFXLGtCQUFrQjtBQUV0RSxXQUFTLElBQUksR0FBRyxJQUFJLFlBQVksUUFBUSxLQUFLO0FBQ3pDLFVBQU0sT0FBTyxZQUFZLENBQUM7QUFDMUIsVUFBTSxFQUFFLEtBQUssUUFBUSxJQUFJO0FBQ3pCLFVBQU0sVUFBVSxXQUFXLEdBQUc7QUFDOUIsYUFBUyxJQUFJLEdBQUcsSUFBSSxRQUFRLFFBQVEsS0FBSztBQUNyQyxZQUFNLGFBQWEsUUFBUSxDQUFDO0FBQzVCLFVBQUksU0FBUztBQUViLFlBQU0sY0FBYyxXQUFXLFlBQVk7QUFDM0MsWUFBTSxpQkFBaUIsWUFBWSxTQUFTLElBQUk7QUFDaEQsVUFBSSxrQkFBa0IsVUFBVTtBQUM1QixpQkFBUztBQUFBLE1BQ2IsV0FBVyxDQUFDLGtCQUFrQixDQUFDLFVBQVU7QUFDckMsaUJBQVM7QUFBQSxNQUNiO0FBRUEsVUFBSSxPQUFPO0FBQ1gsVUFBSSxPQUFPO0FBRVgsVUFBSSxRQUFRO0FBQ1IsZUFBTyxXQUFXLE1BQU07QUFDeEIsZUFBTywrQkFBK0IsU0FBUyxJQUFJO0FBQUEsTUFDdkQ7QUFFQSxVQUFJLFNBQVMsTUFBTSxNQUFNO0FBQ3JCLGNBQU0sY0FBYyxZQUFZLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRTtBQUU5QyxvQkFBWSxLQUFLO0FBQUEsVUFDYixPQUFPO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDSixDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsU0FBTztBQUNYO0FBbEVnQjtBQXNFaEIsaUJBQWlCLGdEQUFnRCxDQUFDLFNBQW9DO0FBQ2xHLE1BQUksS0FBSyxTQUFTO0FBQVMsWUFBUSxrQkFBa0IsRUFBRSxvQkFBb0IsS0FBSyxJQUFJO0FBQ3BGLE1BQUksS0FBSyxTQUFTO0FBQVksWUFBUSxxQkFBcUIsRUFBRSxvQkFBb0IsS0FBSyxJQUFJO0FBQzlGLENBQUM7OztBQ3ZSRCxJQUFPLGtCQUFRO0FBQUEsRUFDWCxNQUFNO0FBQUEsSUFDRixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxFQUNUO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsTUFDRixXQUFXO0FBQUEsUUFDUCxFQUFFLFdBQVcsR0FBRyxTQUFTLElBQUksU0FBUyxHQUFHLElBQUksU0FBUztBQUFBLFFBQ3RELEVBQUUsV0FBVyxHQUFHLFNBQVMsSUFBSSxTQUFTLEdBQUcsSUFBSSxTQUFTO0FBQUEsTUFDMUQ7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLE1BQ0YsV0FBVztBQUFBLFFBQ1AsRUFBRSxXQUFXLEdBQUcsU0FBUyxJQUFJLFNBQVMsR0FBRyxJQUFJLFNBQVM7QUFBQSxRQUN0RCxFQUFFLFdBQVcsSUFBSSxTQUFTLElBQUksU0FBUyxHQUFHLElBQUksVUFBVTtBQUFBLE1BQzVEO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNGLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxFQUNUO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDRixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsRUFDVDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0gsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLEVBQ1Q7QUFDSjs7O0FDOUNPLFNBQVMsWUFBWSxXQUFtQixNQUFjO0FBQ3pELDJCQUF5QixXQUFXLEtBQUssT0FBTyxLQUFLLE9BQU8sS0FBSyxTQUFTLENBQUM7QUFDM0UsU0FBTyxnQ0FBZ0MsV0FBVyxLQUFLLE9BQU8sS0FBSyxLQUFLO0FBQzVFO0FBSGdCO0FBS1QsU0FBUyxRQUFRLFdBQW1CLE1BQWM7QUFDckQsTUFBSSxLQUFLLFVBQVUsSUFBSTtBQUNuQixpQkFBYSxXQUFXLEtBQUssS0FBSztBQUNsQztBQUFBLEVBQ0o7QUFFQSxrQkFBZ0IsV0FBVyxLQUFLLE9BQU8sS0FBSyxPQUFPLEtBQUssU0FBUyxLQUFLO0FBQ3RFLFNBQU8sb0NBQW9DLFdBQVcsS0FBSyxPQUFPLEtBQUssS0FBSztBQUNoRjtBQVJnQjtBQVVoQixJQUFNLGNBQWMsV0FBVyxrQkFBa0I7QUFJMUMsSUFBTSxXQUFXLDhCQUFPLFdBQW1CLFNBQWdEO0FBQzlGLE1BQUksUUFBZ0I7QUFHcEIsTUFBSSxRQUFRLFFBQVEsUUFBUTtBQUFXO0FBRXZDLFFBQU0sV0FBVyxPQUFPLFNBQVM7QUFDakMsUUFBTSxXQUFXLE9BQU8sU0FBUztBQUNqQyxRQUFNLGNBQWMsWUFBWTtBQUdoQyxNQUFJLE9BQU8sU0FBUyxVQUFVO0FBQzFCLFlBQVEsV0FBVyxJQUFJO0FBQUEsRUFDM0IsV0FBVyxPQUFPLFNBQVMsVUFBVTtBQUNqQyxZQUFRO0FBQUEsRUFDWixPQUFPO0FBQ0gsWUFBUSxLQUFLO0FBQUEsRUFDakI7QUFFQSxNQUFJLFNBQVMsUUFBUSxTQUFTO0FBQVc7QUFFekMsUUFBTSxXQUFXLGFBQWEsU0FBUztBQUV2QyxNQUFJLFVBQVU7QUFDVixZQUFRLFVBQVUsSUFBSSxRQUFRO0FBQzlCLFVBQU0sYUFBYSxLQUFLO0FBQ3hCLG1CQUFlLFNBQVMsR0FBRyxLQUFLO0FBQ2hDLDZCQUF5QixLQUFLO0FBQzlCLGdCQUFZLFlBQVk7QUFBQSxFQUM1QjtBQUVBLGtDQUFnQyxTQUFTO0FBRXpDLE1BQUksQ0FBQyxtQkFBbUIsU0FBUztBQUFHO0FBR3BDLE1BQUksT0FBTyxTQUFTLFlBQVksT0FBTyxTQUFTLFVBQVU7QUFDdEQsUUFBSSxLQUFLLFdBQVc7QUFDaEIsVUFBSSxDQUFDLGVBQWUsT0FBTyxLQUFLLEtBQUssU0FBUyxFQUFFLFNBQVMsR0FBRztBQUN4RCxjQUFNLFlBQVksS0FBSztBQUN2QixxQkFBYSxXQUFXLFNBQVM7QUFDakMsNEJBQW9CLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBSyxHQUFLLEdBQUssS0FBSztBQUFBLE1BQ3pFO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxTQUFPO0FBQ1gsR0EvQ3dCO0FBaURqQixTQUFTLGVBQWUsV0FBbUIsTUFBYztBQUM1RCxvQkFBa0IsV0FBVyxLQUFLLE9BQU8sS0FBSyxRQUFRLENBQUc7QUFDN0Q7QUFGZ0I7QUFJaEIsSUFBTSxhQUFhLHdCQUFDLFFBQWdCLE9BQU8sSUFBSSxNQUFNLEdBQWxDO0FBRVosU0FBUyxhQUFhLFdBQW1CLE1BQU07QUFDbEQsY0FBWSxhQUFhO0FBRXpCLFFBQU0sYUFBYSxXQUFXLEtBQUssVUFBVTtBQUM3QyxRQUFNLGNBQWMsV0FBVyxLQUFLLFdBQVc7QUFDL0MsUUFBTSxhQUFhLFdBQVcsS0FBSyxVQUFVO0FBQzdDLFFBQU0sWUFBWSxXQUFXLEtBQUssU0FBUztBQUMzQyxRQUFNLGFBQWEsV0FBVyxLQUFLLFVBQVU7QUFDN0MsUUFBTSxZQUFZLFdBQVcsS0FBSyxTQUFTO0FBQzNDLFFBQU0sV0FBVyxLQUFLLFdBQVc7QUFDakMsUUFBTSxVQUFVLEtBQUssVUFBVTtBQUMvQixRQUFNLFdBQVcsS0FBSyxXQUFXO0FBQ2pDLFFBQU0sWUFBWSxLQUFLO0FBRXZCLHNCQUFvQixXQUFXLFlBQVksYUFBYSxZQUFZLFdBQVcsWUFBWSxXQUFXLFVBQVUsU0FBUyxVQUFVLFNBQVM7QUFDaEo7QUFmZ0I7QUFpQlQsU0FBUyxlQUFlLFdBQW1CLE1BQU07QUFDcEQsUUFBTSxRQUFRLEtBQUs7QUFFbkIsTUFBSSxVQUFVLElBQUk7QUFDZCxtQkFBZSxXQUFXLEtBQUssS0FBSztBQUNwQztBQUFBLEVBQ0o7QUFFQSxRQUFNLFFBQVEsS0FBSztBQUduQixNQUFJLEtBQUssT0FBTyxhQUFhO0FBQ3pCLG1CQUFlLFdBQVcsS0FBSyxXQUFXLEtBQUssYUFBYTtBQUM1RDtBQUFBLEVBQ0o7QUFFQSxvQkFBa0IsV0FBVyxPQUFPLE9BQU8sS0FBSyxpQkFBaUIsQ0FBRztBQUNwRSx5QkFBdUIsV0FBVyxPQUFPLEdBQUcsS0FBSyxZQUFZLEtBQUssV0FBVztBQUNqRjtBQWxCZ0I7QUFxQlQsU0FBUyxhQUFhLE1BQU07QUFDL0IsUUFBTSxZQUFZLEtBQUs7QUFDdkIsUUFBTSxRQUFRLEtBQUs7QUFFbkIsYUFBVyxDQUFDLFlBQVksVUFBVSxLQUFLLE9BQU8sUUFBUSxlQUFjLEdBQUc7QUFDbkUsVUFBTSxhQUFhLFdBQVc7QUFDOUIsVUFBTSxRQUFRLFdBQVc7QUFFekIsUUFBSSxlQUFlLGNBQWMsVUFBVSxVQUFVLEdBQUc7QUFDcEQsWUFBTSxrQkFBa0Isd0JBQXdCLEtBQUssS0FBSztBQUMxRCxVQUFJLG9CQUFvQixVQUFVLFVBQVUsRUFBRSxPQUFPO0FBQ2pELGlDQUF5QixLQUFLLE9BQU8sVUFBVSxVQUFVLEVBQUUsT0FBTyxHQUFHLENBQUM7QUFBQSxNQUMxRTtBQUFBLElBQ0osV0FBVyxlQUFlLFVBQVUsTUFBTSxVQUFVLEdBQUc7QUFDbkQsWUFBTSxjQUFjLGdCQUFnQixLQUFLLEtBQUs7QUFDOUMsVUFBSSxnQkFBZ0IsTUFBTSxVQUFVLEVBQUUsT0FBTztBQUN6Qyx3QkFBZ0IsS0FBSyxPQUFPLE1BQU0sVUFBVSxFQUFFLE9BQU8sR0FBRyxLQUFLO0FBQUEsTUFDakU7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKO0FBcEJnQjtBQXNCVCxTQUFTLGNBQWMsV0FBbUIsTUFBZ0I7QUFDN0QsUUFBTSxZQUFZLEtBQUs7QUFDdkIsUUFBTSxRQUFRLEtBQUs7QUFDbkIsUUFBTSxjQUFjLEtBQUs7QUFDekIsYUFBVyxNQUFNLFdBQVc7QUFDeEIsVUFBTSxXQUFXLFVBQVUsRUFBRTtBQUM3QixnQkFBWSxXQUFXLFFBQVE7QUFBQSxFQUNuQztBQUVBLGFBQVcsTUFBTSxPQUFPO0FBQ3BCLFVBQU0sT0FBTyxNQUFNLEVBQUU7QUFDckIsWUFBUSxXQUFXLElBQUk7QUFBQSxFQUMzQjtBQUVBLGFBQVcsTUFBTSxhQUFhO0FBQzFCLFVBQU0sVUFBVSxZQUFZLEVBQUU7QUFDOUIsbUJBQWUsV0FBVyxPQUFPO0FBQUEsRUFDckM7QUFDSjtBQWxCZ0I7QUFvQlQsSUFBTSxhQUFhLDhCQUFPLFdBQW1CLFNBQWdCO0FBQ2hFLFFBQU0sZ0JBQWdCLEtBQUs7QUFDM0IsUUFBTSxZQUFZLEtBQUs7QUFFdkIsTUFBSSxNQUFNO0FBQ04sZ0JBQVksTUFBTSxTQUFTLFdBQVcsSUFBSTtBQUFBLEVBQzlDO0FBR0EsTUFBSTtBQUFXLGlCQUFhLFdBQVcsU0FBUztBQUVoRCxNQUFJO0FBQWUsZUFBVyxXQUFXLGVBQWU7QUFDcEQsWUFBTSxRQUFRLGNBQWMsT0FBTztBQUNuQyxxQkFBZSxXQUFXLEtBQUs7QUFBQSxJQUNuQztBQUNKLEdBZjBCO0FBaUJuQixTQUFTLGNBQWMsV0FBbUIsTUFBaUI7QUFDOUQsTUFBSSxDQUFDO0FBQU07QUFFWCxnQ0FBOEIsU0FBUztBQUV2QyxXQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxLQUFLO0FBQ2xDLFVBQU0sYUFBYSxLQUFLLENBQUMsRUFBRTtBQUMzQixRQUFJLFlBQVk7QUFDWixZQUFNLGFBQWEsV0FBVyxXQUFXLEdBQUc7QUFDNUMsWUFBTSxTQUFTLFdBQVc7QUFDMUIsaUNBQTJCLFdBQVcsWUFBWSxNQUFNO0FBQUEsSUFDNUQ7QUFBQSxFQUNKO0FBQ0o7QUFiZ0I7QUFlVCxTQUFTLGlCQUFpQixXQUFtQixNQUFrQjtBQUNsRSxNQUFJLENBQUM7QUFBTTtBQUNYLFFBQU0sUUFBUSxLQUFLO0FBQ25CLFFBQU0sWUFBWSxLQUFLO0FBQ3ZCLGtCQUFnQixXQUFXLE9BQU8sU0FBUztBQUMvQztBQUxnQjtBQU9oQixlQUFzQixpQkFBaUIsV0FBbUIsTUFBbUI7QUFDekUsTUFBSSxhQUFhLFNBQVMsR0FBRztBQUN6QiwyQkFBdUIsSUFBSTtBQUFBLEVBQy9CO0FBQ0EsUUFBTSxXQUFXLFdBQVcsSUFBSTtBQUNoQyxnQkFBYyxXQUFXLElBQUk7QUFDN0IsbUJBQWlCLFdBQVcsS0FBSyxTQUFTO0FBQzFDLGdCQUFjLFdBQVcsS0FBSyxPQUFPO0FBQ3pDO0FBUnNCO0FBVXRCLGVBQXNCLHVCQUF1QixNQUFtQjtBQUM1RCxRQUFNLFdBQVcsS0FBSyxJQUFJO0FBQzFCLFlBQVUsWUFBWSxDQUFDO0FBQ3ZCLGdCQUFjLEtBQUssSUFBSTtBQUN2QixtQkFBaUIsS0FBSyxLQUFLLFNBQVM7QUFDcEMsZ0JBQWMsS0FBSyxLQUFLLE9BQU87QUFDbkM7QUFOc0I7QUFRdEIsUUFBUSxpQkFBaUIsYUFBYTtBQUN0QyxRQUFRLGNBQWMsVUFBVTtBQUNoQyxRQUFRLGlCQUFpQixhQUFhO0FBQ3RDLFFBQVEsb0JBQW9CLGdCQUFnQjs7O0FDdE01QyxzREFBb0MsT0FBTyxZQUF5QixPQUFpQjtBQUNwRixRQUFNLHVCQUF1QixVQUFVO0FBQ3ZDLFlBQVU7QUFDVixLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsa0RBQWtDLE9BQU8sWUFBeUIsT0FBaUI7QUFDbEYsZUFBYSxVQUFVO0FBRXZCLFFBQU0sTUFBTSxHQUFHO0FBRWYsUUFBTSxnQkFBZ0IsTUFBTSxjQUFjLEdBQUc7QUFDN0MsZ0JBQWMsVUFBVSxXQUFXO0FBQ25DLHdCQUFzQix1Q0FBdUMsZUFBZSxHQUFHLGFBQWE7QUFFNUYsZ0JBQWMsS0FBSyxjQUFjLE9BQU87QUFFeEMsWUFBVTtBQUNWLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCwwREFBc0MsT0FBTyxPQUFlLE9BQWlCO0FBQzVFLFFBQU0sT0FBTyxXQUFXLEtBQUs7QUFDN0IsTUFBSSxDQUFDLGlCQUFpQixJQUFJLEtBQUssQ0FBQyxhQUFhLElBQUksR0FBRztBQUNuRCxXQUFPLEdBQUcsQ0FBQztBQUFBLEVBQ1o7QUFHQSxRQUFNLFNBQVMsTUFBTSxTQUFTLEtBQUssSUFBSTtBQUVwQyxZQUFVLE1BQU07QUFFbkIsUUFBTSxhQUFhLE1BQU0sY0FBYyxHQUFHO0FBRTFDLGFBQVcsVUFBVSxDQUFDO0FBRXRCLGdCQUFjLEtBQUssQ0FBQyxDQUFDO0FBRXJCLEtBQUcsVUFBVTtBQUNkLENBQUM7QUFFRCx3RUFBNkMsT0FBTyxHQUFRLE9BQWlCO0FBQzVFLFFBQU0sVUFBVSxjQUFjO0FBRTlCLEtBQUcsT0FBTztBQUNYLENBQUM7QUFFRCwwRUFBOEMsT0FBTyxNQUFjLE9BQWlCO0FBQ25GLGlCQUFlLEtBQUssSUFBSTtBQUN4QixLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsc0VBQTRDLE9BQU8sTUFBYyxPQUFpQjtBQUNqRixpQkFBZSxLQUFLLElBQUk7QUFDeEIsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELGtFQUEwQyxPQUFPLE1BQWMsT0FBaUI7QUFDL0UsZUFBYSxLQUFLLElBQUk7QUFDdEIsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELDhEQUF3QyxPQUFPLE1BQWlCLE9BQWlCO0FBQ2hGLGdCQUFjLEtBQUssSUFBSTtBQUN2QixLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsd0RBQXFDLE9BQU8sTUFBYyxPQUFpQjtBQUMxRSxNQUFJLFVBQVUsUUFBUSxLQUFLLElBQUk7QUFDL0IsS0FBRyxPQUFPO0FBQ1gsQ0FBQztBQUVELGdFQUF5QyxPQUFPLE1BQWMsT0FBaUI7QUFDOUUsTUFBSSxVQUFVLFlBQVksS0FBSyxJQUFJO0FBQ25DLEtBQUcsT0FBTztBQUNYLENBQUM7QUFFRDtBQUFBO0FBQUEsRUFBd0MsT0FBTyxNQUFtQixPQUFpQjtBQUNsRixVQUFNLE9BQU8sZ0JBQWUsS0FBSyxJQUFJO0FBQ3JDLFFBQUksQ0FBQztBQUFNLGFBQU8sR0FBRyxLQUFLO0FBRTFCLFVBQU0sVUFBVSxLQUFLO0FBQ3JCLFVBQU0sT0FBTyxLQUFLO0FBQ2xCLFVBQU0sUUFBUSxLQUFLO0FBQ25CLFVBQU0sT0FBTyxLQUFLO0FBQ2xCLFVBQU0sV0FBVyxLQUFLO0FBRXRCLFFBQUksQ0FBQztBQUFTLGFBQU8sR0FBRyxLQUFLO0FBRTdCLFFBQUksU0FBUyxRQUFRO0FBQ3BCLFlBQU0sY0FBYyxnQkFBZ0IsS0FBSyxLQUFLO0FBRTlDLFVBQUksZ0JBQWdCLElBQUk7QUFDdkIsZ0JBQVEsS0FBSyxPQUFPO0FBQ3BCLFdBQUcsS0FBSztBQUNSO0FBQUEsTUFDRCxPQUFPO0FBQ04scUJBQWEsS0FBSyxLQUFLO0FBQ3ZCLFdBQUcsSUFBSTtBQUNQO0FBQUEsTUFDRDtBQUFBLElBQ0QsV0FBVyxTQUFTLFlBQVk7QUFDL0IsWUFBTSxrQkFBa0Isd0JBQXdCLEtBQUssS0FBSztBQUUxRCxVQUFJLFFBQVEsVUFBVSxLQUFLLEtBQUs7QUFDL0IsV0FBRyxLQUFLO0FBQ1I7QUFBQSxNQUNEO0FBRUEsVUFBSSxRQUFRLFVBQVUsaUJBQWlCO0FBQ3RDLGlDQUF5QixLQUFLLE9BQU8sS0FBSyxLQUFLLEdBQUcsQ0FBQztBQUNuRCxZQUFJLE1BQU07QUFDVCxtQkFBUSxJQUFFLEdBQUcsSUFBSSxLQUFLLFdBQVcsUUFBUSxLQUFLO0FBQzdDLGtCQUFNLFdBQVcsS0FBSyxVQUFVLENBQUM7QUFDakMscUNBQXlCLEtBQUssU0FBUyxXQUFXLFNBQVMsU0FBUyxTQUFTLFNBQVMsQ0FBQztBQUFBLFVBQ3hGO0FBQUEsUUFDRDtBQUNBLFdBQUcsSUFBSTtBQUNQO0FBQUEsTUFDRCxPQUFPO0FBQ04sb0JBQVksS0FBSyxPQUFPO0FBQ3hCLGlCQUFRLElBQUUsR0FBRyxJQUFJLFVBQVUsUUFBUSxLQUFLO0FBQ3ZDLHNCQUFZLEtBQUssU0FBUyxDQUFDLENBQUM7QUFBQSxRQUM3QjtBQUNBLFdBQUcsS0FBSztBQUNSO0FBQUEsTUFDRDtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQ0E7QUFFQSw4REFBd0MsT0FBTyxNQUFXLE9BQWlCO0FBQzFFLFFBQU0sZUFBZSxlQUFlO0FBQ3BDLFFBQU0sU0FBUyxNQUFNLHNCQUFzQixtQ0FBbUMsY0FBYyxJQUFJO0FBQ2hHLEtBQUcsTUFBTTtBQUNWLENBQUM7QUFFRCxrRUFBMEMsT0FBTyxFQUFDLEdBQUUsR0FBRyxPQUFpQjtBQUN2RSxRQUFNLGVBQWUsZUFBZTtBQUNwQyxRQUFNLFNBQVMsTUFBTSxzQkFBc0IscUNBQXFDLGNBQWMsRUFBRTtBQUNoRyxLQUFHLE1BQU07QUFDVixDQUFDO0FBRUQsa0VBQTBDLE9BQU8sTUFBVyxPQUFpQjtBQUM1RSxRQUFNLGVBQWUsZUFBZTtBQUNwQyxRQUFNLFNBQVMsTUFBTSxzQkFBc0IscUNBQXFDLGNBQWMsSUFBSTtBQUNsRyxLQUFHLE1BQU07QUFDVixDQUFDO0FBRUQsNERBQXVDLE9BQU8sUUFBZ0IsT0FBaUI7QUFDOUUsZ0JBQWMsS0FBSyxNQUFNO0FBQ3pCLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCxrRUFBMEMsT0FBTyxFQUFFLElBQUksV0FBVyxHQUFHLE9BQWlCO0FBQ3JGLFFBQU0sZUFBZSxlQUFlO0FBQ3BDLFFBQU0sU0FBUyxNQUFNLHNCQUFzQixxQ0FBcUMsY0FBYyxJQUFJLFVBQVU7QUFDNUcsS0FBRyxNQUFNO0FBQ1YsQ0FBQztBQUVELDhEQUF3QyxPQUFPLEVBQUUsR0FBRyxHQUFHLE9BQWlCO0FBQ3ZFLFFBQU0sU0FBUyxNQUFNLHNCQUFzQixtQ0FBbUMsRUFBRTtBQUNoRixLQUFHLE1BQU07QUFDVixDQUFDO0FBRUQsOERBQXdDLE9BQU8sTUFBdUMsT0FBaUI7QUFDdEcsUUFBTSxTQUFTLE1BQU0sc0JBQXNCLG1DQUFrQyxJQUFJO0FBQ2pGLEtBQUcsTUFBTTtBQUNWLENBQUM7QUFFRCxNQUFNLGtDQUFrQyxDQUFDLFdBQW1CO0FBQzNELGdCQUFjLEtBQUssTUFBTTtBQUMxQixDQUFDOzs7QUN4TEQsSUFBTSxTQUFTLFFBQVE7QUFDdkIsSUFBSSxTQUFTO0FBQ2IsSUFBSSxPQUFPO0FBRVgsSUFBSSxpQkFBaUI7QUFDckIsSUFBSSxVQUFVO0FBRWQsZUFBc0IsU0FBUyxNQUF1QixXQUFvQixPQUFPO0FBQzdFLE1BQUksU0FBUyxRQUFRLE1BQU07QUFDdkI7QUFBQSxFQUNKO0FBRUEsTUFBSSxZQUFZLFlBQVk7QUFDNUIsUUFBTSxjQUFjLE9BQU8sTUFBTTtBQUVqQyxRQUFNLE9BQU8sS0FBSztBQUVsQixRQUFNLE9BQU8sWUFBWSxJQUFJO0FBQzdCLE1BQUksQ0FBQztBQUFNO0FBRVgsWUFBVSxTQUFTO0FBR25CLFFBQU0sZUFBZSxlQUFlO0FBQ3BDLFFBQU0sT0FBTyxLQUFLO0FBQ2xCLE1BQUksWUFBWSxXQUFXLFFBQVEsS0FBSztBQUV4QyxXQUFTLGFBQWEsU0FBUztBQUUvQixNQUFJLFVBQVUsQ0FBQztBQUVmLFFBQU0sZUFBZSxLQUFLLFNBQVMsU0FBUztBQUM1QyxNQUFJO0FBQWMsY0FBVSxNQUFNLHNCQUFnQyxtQ0FBbUMsWUFBWTtBQUVqSCxNQUFJLFNBQVMsQ0FBQztBQUVkLFFBQU0saUJBQWlCLEtBQUssU0FBUyxVQUFVO0FBQy9DLE1BQUksZ0JBQWdCO0FBQ2hCLGFBQVMsT0FBTyxPQUFPO0FBQUEsRUFDM0I7QUFFQSxRQUFNLGVBQWUsS0FBSyxTQUFTLFNBQVM7QUFDNUMsTUFBSTtBQUNKLE1BQUksY0FBYztBQUNkLGNBQVUsY0FBYztBQUFBLEVBQzVCO0FBRUEsUUFBTSxZQUFZLGFBQWEsSUFBSTtBQUVuQyxNQUFJLFVBQVU7QUFDVixVQUFNLFFBQVEsV0FBVyxxQkFBcUIsQ0FBQztBQUMvQyxnQkFBWSxNQUFNLFNBQVMsV0FBVyxLQUFLO0FBQzNDLFlBQVEsdUNBQXVDO0FBQy9DLGNBQVUsSUFBSSxRQUFRLGFBQVc7QUFDN0IsdUJBQWlCO0FBQUEsSUFDckIsQ0FBQztBQUVELGNBQVUsU0FBUztBQUFBLEVBQ3ZCO0FBRUEsUUFBTSxhQUFhLE1BQU0sY0FBYyxTQUFTO0FBRWhELGNBQVk7QUFFWiw2Q0FBd0I7QUFBQSxJQUNwQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0EsS0FBSyxXQUFXO0FBQUEsSUFDaEIsUUFBUSxNQUFNLGNBQWMsUUFBUTtBQUFBLEVBQ3hDLENBQUM7QUFDRCxjQUFZLE1BQU0sSUFBSTtBQUN0QixtREFBMkIsSUFBSTtBQUMvQixTQUFPO0FBRVAsVUFBUSxjQUFjLFFBQVEsSUFBSTtBQUVsQyxNQUFJLFNBQVM7QUFDVCxVQUFNO0FBQ04sWUFBUSx5Q0FBeUM7QUFBQSxFQUNyRDtBQUVBLFlBQVU7QUFDVixtQkFBaUI7QUFDakIsU0FBTztBQUNYO0FBbEZzQjtBQW9GdEIsUUFBUSxZQUFZLFFBQVE7QUFFNUIsU0FBUyxhQUFhLE1BQXVCO0FBQ3pDLE1BQUksQ0FBQztBQUFNLFdBQU8sQ0FBQztBQUVuQixRQUFNLEVBQUMsWUFBWSxLQUFJLElBQUksT0FBTyxVQUFVO0FBRTVDLE1BQUksQ0FBQztBQUFZLFdBQU8sQ0FBQztBQUN6QixNQUFJLENBQUM7QUFBTSxXQUFPLENBQUM7QUFFbkIsTUFBSSxZQUFZLEVBQUMsR0FBRyxLQUFJO0FBRXhCLFFBQU0sYUFBYSxjQUFjO0FBR2pDLGFBQVcsUUFBUSxZQUFZO0FBQzNCLFVBQU0sU0FBUyxXQUFXLElBQUk7QUFDOUIsZUFBVyxTQUFTLFFBQVE7QUFFeEIsVUFBSSxPQUFnQjtBQUVwQixVQUFJLFFBQVEsVUFBVSxLQUFLLE1BQU07QUFDN0IsZUFBTyxLQUFLLEtBQUssU0FBUyxXQUFXLElBQUksSUFBSTtBQUFBLE1BQ2pEO0FBRUEsVUFBSSxRQUFRLFdBQVcsS0FBSyxPQUFPO0FBQy9CLGVBQU8sS0FBSyxNQUFNLFNBQVMsV0FBVyxLQUFLLElBQUk7QUFBQSxNQUNuRDtBQU1BLFVBQUksQ0FBQyxNQUFNO0FBQ1AsY0FBTSxpQkFBaUIsT0FBTyxLQUFLO0FBQ25DLG9CQUFZLE9BQU8sT0FBTyxDQUFDLEdBQUcsV0FBVyxnQkFBZ0I7QUFBQSxVQUN2RCxXQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsVUFBVSxXQUFXLGVBQWUsU0FBUztBQUFBLFFBQzVFLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxTQUFPO0FBR1g7QUEzQ1M7QUE2Q0YsU0FBUyxZQUFZO0FBQ3hCLGVBQWEsS0FBSyxNQUFNO0FBRXhCLGFBQVc7QUFDWCxjQUFZLE9BQU8sS0FBSztBQUN4QixtREFBMkIsS0FBSztBQUdoQyxVQUFRLGNBQWMsUUFBUSxLQUFLO0FBRW5DLE1BQUksZ0JBQWdCO0FBQ2hCLG1CQUFlO0FBQUEsRUFDbkI7QUFDQSxTQUFPO0FBQ1g7QUFkZ0I7OztBQzlJVCxTQUFTLFdBQVc7QUFDdkIsUUFBTSx5Q0FBeUMsT0FBTyxZQUF5QkMsU0FBZ0I7QUFDM0YsVUFBTSxpQkFBaUJBLE1BQUssVUFBVTtBQUFBLEVBQzFDLENBQUM7QUFFRCxRQUFNLDBDQUEwQyxNQUFNO0FBQ2xELFlBQVEsY0FBYyxnQkFBZ0I7QUFBQSxFQUMxQyxDQUFDO0FBRUQsUUFBTSxxQ0FBcUMsTUFBTTtBQUM3QyxhQUFTLEVBQUUsTUFBTSxXQUFXLFFBQVEsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUFBLEVBQ3RELENBQUM7QUFDTDtBQVpnQjs7O0FDQVQsU0FBUyxZQUFZO0FBQ3hCLE1BQUksYUFBYTtBQUVqQixLQUFHLDRCQUE0QixNQUFNO0FBQ2pDLGlCQUFhO0FBQUEsRUFDakIsQ0FBQztBQUVELEtBQUcsNkJBQTZCLE1BQU07QUFDbEMsUUFBRztBQUNDLGNBQVEsY0FBYyxnQkFBZ0I7QUFBQSxFQUM5QyxDQUFDO0FBRUQsUUFBTSx5QkFBeUIsT0FBTyxZQUF5QkMsU0FBZ0I7QUFDM0UsUUFBSSxDQUFDLFdBQVc7QUFBTyxpQkFBVyxRQUFRLFdBQVcsa0JBQWtCO0FBQ3ZFLFVBQU0saUJBQWlCQSxNQUFLLFVBQVU7QUFBQSxFQUMxQyxDQUFDO0FBRUQsUUFBTSx1QkFBdUIsT0FBTyxPQUFZO0FBQzVDLFVBQU0sY0FBYyxNQUFNLGVBQWU7QUFDekMsVUFBTSxhQUFhLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQzdHLE9BQUcsVUFBVTtBQUFBLEVBQ2pCLENBQUM7QUFFRCxRQUFNLHdCQUF3QixPQUFPLFlBQXlCLE9BQVk7QUFDdEUsVUFBTSx1QkFBdUIsVUFBVTtBQUN2QyxRQUFJO0FBQUksU0FBRztBQUFBLEVBQ2YsQ0FBQztBQUVELFFBQU0sNkJBQTZCLE9BQU8sYUFBa0I7QUFDeEQsWUFBUSxjQUFjLGdCQUFnQixRQUFRO0FBQUEsRUFDbEQsQ0FBQztBQUNMO0FBL0JnQjs7O0FDQWhCLFNBQVMsY0FBYyxNQUFjLElBQVM7QUFDMUMsS0FBRyxzQ0FBc0MsTUFBTSxDQUFDLFVBQWU7QUFDM0QsVUFBTSxFQUFFO0FBQUEsRUFDWixDQUFDO0FBQ0w7QUFKUztBQU1GLFNBQVMsaUJBQWlCO0FBQzdCLGdCQUFjLDRCQUE0QixNQUFNO0FBQzVDLFlBQVEsY0FBYyxnQkFBZ0I7QUFBQSxFQUMxQyxDQUFDO0FBRUQsZ0JBQWMsZUFBZSxDQUFDQyxTQUFnQjtBQUMxQyxXQUFPLGVBQWVBLElBQUc7QUFBQSxFQUM3QixDQUFDO0FBRUQsZ0JBQWMsb0JBQW9CLENBQUNBLFNBQWdCO0FBQy9DLFVBQU0sWUFBaUIsYUFBYUEsSUFBRyxFQUFFLENBQUM7QUFDMUMsUUFBSSxjQUFjLENBQUM7QUFDbkIsZUFBVyxNQUFNLFdBQVc7QUFDeEIsWUFBTSxXQUFXLFVBQVUsRUFBRTtBQUM3QixrQkFBWSxLQUFLO0FBQUEsUUFDYixjQUFjLFNBQVM7QUFBQSxRQUN2QixVQUFVLFNBQVM7QUFBQSxRQUNuQixTQUFTLFNBQVM7QUFBQSxNQUN0QixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0osQ0FBQztBQUVELGdCQUFjLGVBQWUsQ0FBQ0EsU0FBZ0I7QUFDMUMsVUFBTSxRQUFjLFNBQVNBLElBQUcsRUFBRSxDQUFDO0FBQ25DLFFBQUksV0FBVyxDQUFDO0FBQ2hCLGVBQVcsTUFBTSxPQUFPO0FBQ3BCLFlBQU0sT0FBTyxNQUFNLEVBQUU7QUFDckIsZUFBUyxLQUFLO0FBQUEsUUFDVixTQUFTLEtBQUs7QUFBQSxRQUNkLFVBQVUsS0FBSztBQUFBLFFBQ2YsU0FBUyxLQUFLO0FBQUEsTUFDbEIsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKLENBQUM7QUFFRCxnQkFBYyxtQkFBbUIsQ0FBQ0EsU0FBZ0I7QUFDOUMsV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBQUEsRUFFNUQsQ0FBQztBQUVELGdCQUFjLHNCQUFzQixDQUFDQSxTQUFnQjtBQUNqRCxXQUFPLFFBQVEsS0FBSyxvQ0FBb0M7QUFBQSxFQUU1RCxDQUFDO0FBRUQsZ0JBQWMsc0JBQXNCLENBQUNBLFNBQWdCO0FBQ2pELFdBQU8sUUFBUSxLQUFLLG9DQUFvQztBQUFBLEVBRTVELENBQUM7QUFFRCxnQkFBYyxjQUFjLENBQUNBLFNBQWdCO0FBRXpDLFdBQU8sUUFBUSxLQUFLLG9DQUFvQztBQUFBLEVBQzVELENBQUM7QUFFRCxnQkFBYyxvQkFBb0IsQ0FBQ0EsU0FBZ0I7QUFDL0MsV0FBTyxjQUFjQSxJQUFHO0FBQUEsRUFDNUIsQ0FBQztBQUVELGdCQUFjLGtCQUFrQixDQUFDLFVBQWtCO0FBQy9DLGFBQVMsWUFBWSxHQUFHLEtBQUs7QUFBQSxFQUNqQyxDQUFDO0FBRUQsZ0JBQWMsbUJBQW1CLENBQUNBLE1BQWEsVUFBZTtBQUUxRCxXQUFPLFFBQVEsS0FBSyxvQ0FBb0M7QUFBQSxFQUM1RCxDQUFDO0FBRUQsZ0JBQWMsc0JBQXNCLE1BQU07QUFDdEMsV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBQUEsRUFDNUQsQ0FBQztBQUVELGdCQUFjLHNCQUFzQixDQUFDQSxNQUFhLFlBQWlCO0FBRS9ELFdBQU8sUUFBUSxLQUFLLG9DQUFvQztBQUFBLEVBQzVELENBQUM7QUFFRCxnQkFBYyxjQUFjLE9BQU9BLE1BQWEsTUFBVyxXQUFnQjtBQUV2RSxXQUFPLFFBQVEsS0FBSyxvQ0FBb0M7QUFBQSxFQUM1RCxDQUFDO0FBRUQsZ0JBQWMsa0JBQWtCLE1BQU07QUFDbEMsV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBQUEsRUFDNUQsQ0FBQztBQUVELGdCQUFjLG1CQUFtQixDQUFDQSxNQUFhLGFBQWtCO0FBQzdELFVBQU0sY0FBYztBQUFBLE1BQ2hCLE9BQU8sU0FBUztBQUFBLE1BQ2hCLE9BQU8sU0FBUztBQUFBLE1BQ2hCLFNBQVMsU0FBUztBQUFBLElBQ3RCO0FBQ0EsZ0JBQVlBLE1BQUssV0FBVztBQUFBLEVBQ2hDLENBQUM7QUFFRCxnQkFBYyxvQkFBb0IsQ0FBQ0EsTUFBYSxlQUFvQjtBQUNoRSxlQUFXLGFBQWEsWUFBWTtBQUNoQyxZQUFNLGNBQWM7QUFBQSxRQUNoQixPQUFPLFVBQVU7QUFBQSxRQUNqQixPQUFPLFVBQVU7QUFBQSxRQUNqQixTQUFTLFVBQVU7QUFBQSxNQUN2QjtBQUNBLGtCQUFZQSxNQUFLLFdBQVc7QUFBQSxJQUNoQztBQUFBLEVBQ0osQ0FBQztBQUVELGdCQUFjLGNBQWMsQ0FBQ0EsTUFBYSxTQUFjO0FBQ3BELFVBQU0sVUFBVTtBQUFBLE1BQ1osT0FBTyxLQUFLO0FBQUEsTUFDWixPQUFPLEtBQUs7QUFBQSxNQUNaLFNBQVMsS0FBSztBQUFBLElBQ2xCO0FBQ0EsWUFBUUEsTUFBSyxPQUFPO0FBQUEsRUFDeEIsQ0FBQztBQUVELGdCQUFjLGVBQWUsQ0FBQ0EsTUFBYSxVQUFlO0FBQ3RELGVBQVcsUUFBUSxPQUFPO0FBQ3RCLFlBQU0sVUFBVTtBQUFBLFFBQ1osT0FBTyxLQUFLO0FBQUEsUUFDWixPQUFPLEtBQUs7QUFBQSxRQUNaLFNBQVMsS0FBSztBQUFBLE1BQ2xCO0FBQ0EsY0FBUUEsTUFBSyxPQUFPO0FBQUEsSUFDeEI7QUFBQSxFQUNKLENBQUM7QUFNRCxnQkFBYyxvQkFBb0IsQ0FBQ0EsTUFBYSxlQUE0QjtBQUN4RSxxQkFBaUJBLE1BQUssVUFBVTtBQUFBLEVBQ3BDLENBQUM7QUFFRCxnQkFBYyxpQkFBaUIsQ0FBQ0EsTUFBYSxZQUF1QjtBQUNoRSxrQkFBY0EsTUFBSyxPQUFPO0FBQUEsRUFDOUIsQ0FBQztBQUNMO0FBeklnQjs7O0FDSGhCLGdCQUFnQixZQUFZLE9BQU8sR0FBRyxTQUFtQjtBQUNyRCxRQUFNLE9BQU8sS0FBSyxDQUFDO0FBQ25CLE1BQUksQ0FBQyxNQUFNO0FBQ1AsWUFBUSxjQUFjLGdCQUFnQjtBQUFBLEVBQzFDLE9BQU87QUFDSCxVQUFNLE9BQU8sS0FBSyxZQUFZO0FBQzlCLGFBQVMsRUFBRSxNQUFNLE1BQU0sUUFBUSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQUEsRUFDakQ7QUFDSixHQUFHLElBQUk7QUFFUCxRQUFRLG9CQUFvQixPQUFPQyxNQUFhLGVBQTRCO0FBQ3hFLFFBQU0saUJBQWlCQSxNQUFLLFVBQVU7QUFDMUMsQ0FBQztBQUVELFFBQVEsMEJBQTBCLE9BQU8sZUFBcUM7QUFDMUUsTUFBSTtBQUVKLE1BQUksQ0FBQyxjQUFjLE9BQU8sZUFBZSxVQUFVO0FBQy9DLFVBQU0sY0FBc0IsY0FBYyxNQUFNLGVBQWU7QUFDL0QseUJBQXFCLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQUEsRUFDbkgsV0FBVyxPQUFPLGVBQWU7QUFBVSx5QkFBcUI7QUFFaEUsTUFBSSxDQUFDLG9CQUFvQjtBQUNyQixVQUFNLElBQUksTUFBTSwyQkFBMkI7QUFBQSxFQUMvQztBQUVBLFFBQU0sdUJBQXVCLGtCQUFrQjtBQUNuRCxDQUFDO0FBRUQsUUFBUSwwQkFBMEIsT0FBTyxnQkFBd0I7QUFDN0QsZ0JBQWMsZUFBZSxNQUFNLGVBQWU7QUFDbEQsU0FBTyxNQUFNLHNCQUFtQyxzQ0FBc0MsV0FBVztBQUNyRyxDQUFDO0FBRUQsUUFBUSxtQkFBbUIsT0FBTyxPQUFrQjtBQUVoRCxRQUFNLFNBQVMsRUFBRSxNQUFNLGNBQWMsUUFBUSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLElBQUk7QUFDakUsTUFBSTtBQUFJLE9BQUc7QUFDZixDQUFDO0FBRUQsR0FBRyw2QkFBNkIsQ0FBQyxTQUEwQjtBQUN2RCxXQUFTLElBQUk7QUFDakIsQ0FBQztBQUVELE1BQU0saUNBQWlDLFlBQVk7QUFDL0MsU0FBTyxDQUFDLFVBQVUsS0FBSyxFQUFFLGFBQWEsR0FBRztBQUNyQyxVQUFNLE1BQU0sR0FBRztBQUFBLEVBQ25CO0FBQ0EsUUFBTSxjQUFjLE1BQU0sZUFBZTtBQUN6QyxRQUFNLGFBQWEsTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFDN0csTUFBSSxDQUFDO0FBQVk7QUFDakIsUUFBTSx1QkFBdUIsVUFBVTtBQUMzQyxDQUFDO0FBRUQsTUFBTSxtQkFBbUIsT0FBTyxhQUFxQjtBQUNqRCxNQUFJLGFBQWEsdUJBQXVCLEtBQUssVUFBVSxLQUFLLEVBQUUsYUFBYSxHQUFHO0FBQzFFLFVBQU0sY0FBYyxNQUFNLGVBQWU7QUFDekMsVUFBTSxhQUFhLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQzdHLFFBQUksQ0FBQztBQUFZO0FBQ2pCLFVBQU0sdUJBQXVCLFVBQVU7QUFBQSxFQUMzQztBQUNKLENBQUM7QUFFRCxJQUFNLGdCQUFnQixVQUFVLGFBQWEsTUFBTTtBQUNuRCxJQUFNLE9BQU8sT0FBTyxVQUFVLGdCQUFnQixJQUFJLENBQUM7QUFFbkQsSUFBSSxRQUFRLFFBQVEsUUFBUSxTQUFTLGlCQUFpQixhQUFhLEtBQUssV0FBVztBQUMvRSxXQUFTO0FBQ2IsV0FBVyxRQUFRLFNBQVMsaUJBQWlCLGFBQWEsS0FBSyxXQUFXO0FBQ3RFLFlBQVU7QUFDZDtBQUVBLGVBQWU7QUFFZixnQkFBZ0IsY0FBYyxZQUFZO0FBQ3RDLFFBQU0sY0FBYyxNQUFNLGVBQWU7QUFDekMsUUFBTSxTQUFTLGdCQUFnQixHQUFHO0FBQ2xDLFFBQU0sWUFBWSxtQkFBbUIsR0FBRztBQUN4QyxRQUFNLFFBQVEsYUFBYSxHQUFHO0FBRTlCLFFBQU0sYUFBYSxNQUFNLHNCQUFtQyxzQ0FBc0MsV0FBVztBQUM3RyxNQUFJLENBQUM7QUFBWTtBQUNqQixRQUFNLHVCQUF1QixVQUFVO0FBRXZDLGtCQUFnQixLQUFLLFNBQVM7QUFDOUIsUUFBTSxHQUFJO0FBQ1Ysa0JBQWdCLEtBQUssTUFBTTtBQUMzQixlQUFhLEtBQUssS0FBSztBQUMzQixHQUFHLEtBQUs7IiwKICAibmFtZXMiOiBbImRlbGF5IiwgInBlZCIsICJ4IiwgInkiLCAieiIsICJjb25maWciLCAicGVkIiwgInBlZCIsICJwZWQiLCAicGVkIl0KfQo=
