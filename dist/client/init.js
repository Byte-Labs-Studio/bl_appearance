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
  SetPedComponentVariation(pedHandle, data.index, data.value, data.texture, 0);
  return GetNumberOfPedTextureVariations(pedHandle, data.index, data.value);
}
__name(setDrawable, "setDrawable");
exports("SetDrawable", setDrawable);
function setProp(pedHandle, data) {
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
  if (data == null || data === void 0)
    return pedHandle;
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
function SetFaceFeature(pedHandle, data) {
  SetPedFaceFeature(pedHandle, data.index, data.value + 0);
}
__name(SetFaceFeature, "SetFaceFeature");
exports("SetFaceFeature", SetFaceFeature);
var isPositive = /* @__PURE__ */ __name((val) => val >= 0 ? val : 0, "isPositive");
function setHeadBlend(pedHandle, data) {
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
    return;
  pedHandle = await setModel(pedHandle, data);
  const headStructure = data.headStructure;
  const headBlend = data.headBlend;
  if (headBlend)
    setHeadBlend(pedHandle, headBlend);
  if (headStructure)
    for (const feature in headStructure) {
      const value = headStructure[feature];
      SetFaceFeature(pedHandle, value);
    }
}, "setPedSkin");
exports("SetPedSkin", setPedSkin);
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
exports("SetPedTattoos", setPedTattoos);
function setPedHairColors(pedHandle, data) {
  if (!data)
    return;
  const color = data.color;
  const highlight = data.highlight;
  SetPedHairColor(pedHandle, color, highlight);
}
__name(setPedHairColors, "setPedHairColors");
exports("SetPedHairColors", setPedHairColors);
async function setPedAppearance(pedHandle, data) {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvcWIudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvZXN4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvY29tcGF0L2lsbGVuaXVtLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvaW5pdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCBwZWQgPSAwXHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlUGVkID0gKHBlZEhhbmRsZTogbnVtYmVyKSA9PiB7XHJcbiAgICBwZWQgPSBwZWRIYW5kbGVcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlYnVnZGF0YSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGEsIChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0sIDIpKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2VuZE5VSUV2ZW50ID0gKGFjdGlvbjogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcclxuICAgIFNlbmROVUlNZXNzYWdlKHtcclxuICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TW9kZWwgPSBhc3luYyAobW9kZWw6IHN0cmluZyB8IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiA9PiB7XHJcbiAgICBsZXQgbW9kZWxIYXNoOiBudW1iZXIgPSB0eXBlb2YgbW9kZWwgPT09ICdudW1iZXInID8gbW9kZWwgOiBHZXRIYXNoS2V5KG1vZGVsKVxyXG5cclxuICAgIGlmICghSXNNb2RlbFZhbGlkKG1vZGVsSGFzaCkgJiYgIUlzTW9kZWxJbkNkaW1hZ2UobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIC8vIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAvLyAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgLy8gICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgLy8gICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgLy8gfSlcclxuXHJcbiAgICAgICAgY29uc29sZS53YXJuKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9ibF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5OiBzdHJpbmcsIC4uLmFyZ3M6IGFueSkgPT4ge1xyXG4gICAgY29uc3QgcmVzb2x2ZSA9IGFjdGl2ZUV2ZW50c1trZXldO1xyXG4gICAgcmV0dXJuIHJlc29sdmUgJiYgcmVzb2x2ZSguLi5hcmdzKTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlclNlcnZlckNhbGxiYWNrPFQgPSB1bmtub3duPihcclxuICAgIGV2ZW50TmFtZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlcclxuKTogUHJvbWlzZTxUPiB8IHZvaWQge1xyXG4gICAgaWYgKCFldmVudFRpbWVyKGV2ZW50TmFtZSwgMCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGtleTogc3RyaW5nO1xyXG5cclxuICAgIGRvIHtcclxuICAgICAgICBrZXkgPSBgJHtldmVudE5hbWV9OiR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDEwMDAwMCArIDEpKX1gO1xyXG4gICAgfSB3aGlsZSAoYWN0aXZlRXZlbnRzW2tleV0pO1xyXG4gICAgZW1pdE5ldChgX2JsX2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvblNlcnZlckNhbGxiYWNrKGV2ZW50TmFtZSwgY2IpIHtcclxuICAgIG9uTmV0KGBfYmxfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlLCBrZXksIC4uLmFyZ3MpID0+IHtcclxuICAgICAgICBsZXQgcmVzcG9uc2U7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBjYiguLi5hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgaGFuZGxpbmcgY2FsbGJhY2sgZXZlbnQgJHtldmVudE5hbWV9YCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBeMyR7ZS5zdGFja31eMGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbWl0TmV0KGBfYmxfY2JfJHtyZXNvdXJjZX1gLCBrZXksIHJlc3BvbnNlKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vL2xvY2FsZVxyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RMb2NhbGUgPSAocmVzb3VyY2VTZXROYW1lOiBzdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNoZWNrUmVzb3VyY2VGaWxlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoUmVxdWVzdFJlc291cmNlRmlsZVNldChyZXNvdXJjZVNldE5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50TGFuID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmNvbmZpZygpLmxvY2FsZVxyXG4gICAgICAgICAgICAgICAgbGV0IGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvJHtjdXJyZW50TGFufS5qc29uYCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsZUZpbGVDb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtjdXJyZW50TGFufS5qc29uIG5vdCBmb3VuZCBpbiBsb2NhbGUsIHBsZWFzZSB2ZXJpZnkhLCB3ZSB1c2VkIGVuZ2xpc2ggZm9yIG5vdyFgKVxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvZW4uanNvbmApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGxvY2FsZUZpbGVDb250ZW50KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2hlY2tSZXNvdXJjZUZpbGUsIDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2hlY2tSZXNvdXJjZUZpbGUoKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbG9jYWxlID0gYXN5bmMgKGlkOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBjb25zdCBsb2NhbGUgPSBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKTtcclxuICAgIGxldCBhcmdJbmRleCA9IDA7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gbG9jYWxlW2lkXS5yZXBsYWNlKC8lcy9nLCAobWF0Y2g6IHN0cmluZykgPT4gYXJnSW5kZXggPCBhcmdzLmxlbmd0aCA/IGFyZ3NbYXJnSW5kZXhdIDogbWF0Y2gpO1xyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgYmxfYnJpZGdlID0gZXhwb3J0cy5ibF9icmlkZ2VcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRQbGF5ZXJEYXRhID0gKCkgPT4ge1xyXG4gICAgcmV0dXJuIGJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRGcmFtZXdvcmtJRCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGlkID0gZ2V0UGxheWVyRGF0YSgpLmNpZFxyXG4gICAgcmV0dXJuIGlkXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRQbGF5ZXJHZW5kZXJNb2RlbCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGdlbmRlciA9IGdldFBsYXllckRhdGEoKS5nZW5kZXJcclxuICAgIHJldHVybiBnZW5kZXIgPT09ICdtYWxlJyA/ICdtcF9tX2ZyZWVtb2RlXzAxJyA6ICdtcF9mX2ZyZWVtb2RlXzAxJ1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRGVsYXkobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICghc3RyLmluY2x1ZGVzKFwiJ1wiKSkgcmV0dXJuIHN0cjtcclxuICAgIHJldHVybiBzdHIucmVwbGFjZSgvJy9nLCBcIlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEpvYkluZm8oKTogeyBuYW1lOiBzdHJpbmcsIGlzQm9zczogYm9vbGVhbiB9IHwgbnVsbCB7XHJcbiAgICBjb25zdCBqb2IgPSBnZXRQbGF5ZXJEYXRhKCkuam9iXHJcbiAgICByZXR1cm4gam9iID8geyBuYW1lOiBqb2IubmFtZSwgaXNCb3NzOiBqb2IuaXNCb3NzIH0gOiBudWxsXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1BlZEZyZWVtb2RlTW9kZWwocGVkOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IG1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkKVxyXG4gICAgcmV0dXJuIG1vZGVsID09PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSB8fCBtb2RlbCA9PT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIilcclxufSAgICIsICJpbXBvcnQgeyBDYW1lcmEsIFZlY3RvcjMsIFRDYW1lcmFCb25lcyB9IGZyb20gJ0B0eXBpbmdzL2NhbWVyYSc7XHJcbmltcG9ydCB7IGRlbGF5LCBwZWQgfSBmcm9tICdAdXRpbHMnO1xyXG5pbXBvcnQgeyBSZWNlaXZlIH0gZnJvbSAnQGV2ZW50cyc7XHJcblxyXG5jb25zdCBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRSA9IDIuMDtcclxuY29uc3QgREVGQVVMVF9NQVhfRElTVEFOQ0UgPSAxLjA7XHJcblxyXG5sZXQgcnVubmluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgY2FtRGlzdGFuY2U6IG51bWJlciA9IDEuODtcclxubGV0IGNhbTogQ2FtZXJhIHwgbnVsbCA9IG51bGw7XHJcbmxldCBhbmdsZVk6IG51bWJlciA9IDAuMDtcclxubGV0IGFuZ2xlWjogbnVtYmVyID0gMC4wO1xyXG5sZXQgdGFyZ2V0Q29vcmRzOiBWZWN0b3IzIHwgbnVsbCA9IG51bGw7XHJcbmxldCBvbGRDYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgY2hhbmdpbmdDYW06IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGxhc3RYOiBudW1iZXIgPSAwO1xyXG5sZXQgY3VycmVudEJvbmU6IGtleW9mIFRDYW1lcmFCb25lcyA9ICdoZWFkJztcclxuXHJcbmNvbnN0IENhbWVyYUJvbmVzOiBUQ2FtZXJhQm9uZXMgPSB7XHJcbiAgICB3aG9sZTogMCxcclxuXHRoZWFkOiAzMTA4NixcclxuXHR0b3JzbzogMjQ4MTgsXHJcblx0bGVnczogWzE2MzM1LCA0NjA3OF0sXHJcbiAgICBzaG9lczogWzE0MjAxLCA1MjMwMV0sXHJcbn07XHJcblxyXG5jb25zdCBjb3MgPSAoZGVncmVlczogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuXHRyZXR1cm4gTWF0aC5jb3MoKGRlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MCk7XHJcbn07XHJcblxyXG5jb25zdCBzaW4gPSAoZGVncmVlczogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuXHRyZXR1cm4gTWF0aC5zaW4oKGRlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MCk7XHJcbn07XHJcblxyXG5jb25zdCBnZXRBbmdsZXMgPSAoKTogbnVtYmVyW10gPT4ge1xyXG5cdGNvbnN0IHggPVxyXG5cdFx0KChjb3MoYW5nbGVaKSAqIGNvcyhhbmdsZVkpICsgY29zKGFuZ2xlWSkgKiBjb3MoYW5nbGVaKSkgLyAyKSAqXHJcblx0XHRjYW1EaXN0YW5jZTtcclxuXHRjb25zdCB5ID1cclxuXHRcdCgoc2luKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSArIGNvcyhhbmdsZVkpICogc2luKGFuZ2xlWikpIC8gMikgKlxyXG5cdFx0Y2FtRGlzdGFuY2U7XHJcblx0Y29uc3QgeiA9IHNpbihhbmdsZVkpICogY2FtRGlzdGFuY2U7XHJcblxyXG5cdHJldHVybiBbeCwgeSwgel07XHJcbn07XHJcblxyXG5jb25zdCBzZXRDYW1Qb3NpdGlvbiA9IChtb3VzZVg/OiBudW1iZXIsIG1vdXNlWT86IG51bWJlcik6IHZvaWQgPT4ge1xyXG5cdGlmICghcnVubmluZyB8fCAhdGFyZ2V0Q29vcmRzIHx8IGNoYW5naW5nQ2FtKSByZXR1cm47XHJcblxyXG5cdG1vdXNlWCA9IG1vdXNlWCA/PyAwLjA7XHJcblx0bW91c2VZID0gbW91c2VZID8/IDAuMDtcclxuXHJcblx0YW5nbGVaIC09IG1vdXNlWDtcclxuXHRhbmdsZVkgKz0gbW91c2VZO1xyXG5cclxuICAgIGNvbnN0IGlzSGVhZE9yV2hvbGUgPSBjdXJyZW50Qm9uZSA9PT0gJ3dob2xlJyB8fCBjdXJyZW50Qm9uZSA9PT0gJ2hlYWQnO1xyXG4gICAgY29uc3QgbWF4QW5nbGUgPSBpc0hlYWRPcldob2xlID8gODkuMCA6IDcwLjA7XHJcbiAgICBcclxuICAgIGNvbnN0IGlzU2hvZXMgPSBjdXJyZW50Qm9uZSA9PT0gJ3Nob2VzJztcclxuICAgIGNvbnN0IG1pbkFuZ2xlID0gaXNTaG9lcyA/IDUuMCA6IC0yMC4wO1xyXG5cclxuXHRhbmdsZVkgPSBNYXRoLm1pbihNYXRoLm1heChhbmdsZVksIG1pbkFuZ2xlKSwgbWF4QW5nbGUpO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKTtcclxuXHJcblx0U2V0Q2FtQ29vcmQoXHJcblx0XHRjYW0sXHJcblx0XHR0YXJnZXRDb29yZHMueCArIHgsXHJcblx0XHR0YXJnZXRDb29yZHMueSArIHksXHJcblx0XHR0YXJnZXRDb29yZHMueiArIHpcclxuXHQpO1xyXG5cdFBvaW50Q2FtQXRDb29yZChjYW0sIHRhcmdldENvb3Jkcy54LCB0YXJnZXRDb29yZHMueSwgdGFyZ2V0Q29vcmRzLnopO1xyXG59O1xyXG5cclxuY29uc3QgbW92ZUNhbWVyYSA9IGFzeW5jIChjb29yZHM6IFZlY3RvcjMsIGRpc3RhbmNlPzogbnVtYmVyKSA9PiB7XHJcblx0Y29uc3QgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpICsgOTQ7XHJcblx0ZGlzdGFuY2UgPSBkaXN0YW5jZSA/PyAxLjA7XHJcblxyXG5cdGNoYW5naW5nQ2FtID0gdHJ1ZTtcclxuXHRjYW1EaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG5cdGFuZ2xlWiA9IGhlYWRpbmc7XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpO1xyXG5cclxuXHRjb25zdCBuZXdjYW06IENhbWVyYSA9IENyZWF0ZUNhbVdpdGhQYXJhbXMoXHJcblx0XHQnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLFxyXG5cdFx0Y29vcmRzLnggKyB4LFxyXG5cdFx0Y29vcmRzLnkgKyB5LFxyXG5cdFx0Y29vcmRzLnogKyB6LFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0NzAuMCxcclxuXHRcdGZhbHNlLFxyXG5cdFx0MFxyXG5cdCk7XHJcblxyXG5cdHRhcmdldENvb3JkcyA9IGNvb3JkcztcclxuXHRjaGFuZ2luZ0NhbSA9IGZhbHNlO1xyXG5cdG9sZENhbSA9IGNhbTtcclxuXHRjYW0gPSBuZXdjYW07XHJcblxyXG5cdFBvaW50Q2FtQXRDb29yZChuZXdjYW0sIGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnopO1xyXG5cdFNldENhbUFjdGl2ZVdpdGhJbnRlcnAobmV3Y2FtLCBvbGRDYW0sIDI1MCwgMCwgMCk7XHJcblxyXG5cdGF3YWl0IGRlbGF5KDI1MCk7XHJcblxyXG5cdFNldENhbVVzZVNoYWxsb3dEb2ZNb2RlKG5ld2NhbSwgdHJ1ZSk7XHJcblx0U2V0Q2FtTmVhckRvZihuZXdjYW0sIDAuNCk7XHJcblx0U2V0Q2FtRmFyRG9mKG5ld2NhbSwgMS4yKTtcclxuXHRTZXRDYW1Eb2ZTdHJlbmd0aChuZXdjYW0sIDAuMyk7XHJcblx0dXNlSGlEb2YobmV3Y2FtKTtcclxuXHJcblx0RGVzdHJveUNhbShvbGRDYW0sIHRydWUpO1xyXG59O1xyXG5cclxuY29uc3QgdXNlSGlEb2YgPSAoY3VycmVudGNhbTogQ2FtZXJhKSA9PiB7XHJcblx0aWYgKCEoRG9lc0NhbUV4aXN0KGNhbSkgJiYgY3VycmVudGNhbSA9PSBjYW0pKSByZXR1cm47XHJcblx0U2V0VXNlSGlEb2YoKTtcclxuXHRzZXRUaW1lb3V0KHVzZUhpRG9mLCAwKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdGFydENhbWVyYSA9ICgpID0+IHtcclxuXHRpZiAocnVubmluZykgcmV0dXJuO1xyXG5cdHJ1bm5pbmcgPSB0cnVlO1xyXG5cdGNhbURpc3RhbmNlID0gV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0VcclxuXHRjYW0gPSBDcmVhdGVDYW0oJ0RFRkFVTFRfU0NSSVBURURfQ0FNRVJBJywgdHJ1ZSk7XHJcblx0Y29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCAzMTA4NiwgMC4wLCAwLjAsIDAuMCk7XHJcblx0U2V0Q2FtQ29vcmQoY2FtLCB4LCB5LCB6KTtcclxuXHRSZW5kZXJTY3JpcHRDYW1zKHRydWUsIHRydWUsIDEwMDAsIHRydWUsIHRydWUpO1xyXG5cdC8vIG1vdmVDYW1lcmEoeyB4OiB4LCB5OiB5LCB6OiB6IH0sIGNhbURpc3RhbmNlKTtcclxuICAgIHNldENhbWVyYSgnd2hvbGUnLCBjYW1EaXN0YW5jZSk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc3RvcENhbWVyYSA9ICgpOiB2b2lkID0+IHtcclxuXHRpZiAoIXJ1bm5pbmcpIHJldHVybjtcclxuXHRydW5uaW5nID0gZmFsc2U7XHJcblxyXG5cdFJlbmRlclNjcmlwdENhbXMoZmFsc2UsIHRydWUsIDI1MCwgdHJ1ZSwgZmFsc2UpO1xyXG5cdERlc3Ryb3lDYW0oY2FtLCB0cnVlKTtcclxuXHRjYW0gPSBudWxsO1xyXG5cdHRhcmdldENvb3JkcyA9IG51bGw7XHJcbn07XHJcblxyXG5jb25zdCBzZXRDYW1lcmEgPSAodHlwZT86IGtleW9mIFRDYW1lcmFCb25lcywgZGlzdGFuY2UgPSBjYW1EaXN0YW5jZSk6IHZvaWQgPT4ge1xyXG5cclxuXHRjb25zdCBib25lOiBudW1iZXIgfCBudW1iZXJbXSB8IHVuZGVmaW5lZCA9IENhbWVyYUJvbmVzW3R5cGVdO1xyXG5cclxuICAgIGNvbnN0IGlzQm9uZUFycmF5ID0gQXJyYXkuaXNBcnJheShib25lKVxyXG5cclxuICAgIGN1cnJlbnRCb25lID0gdHlwZTtcclxuXHJcbiAgICBpZiAoIWlzQm9uZUFycmF5ICYmIGJvbmUgPT09IDApIHtcclxuICAgICAgICBjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gR2V0RW50aXR5Q29vcmRzKHBlZCwgZmFsc2UpO1xyXG4gICAgICAgIG1vdmVDYW1lcmEoXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICAgICAgICB5OiB5LFxyXG4gICAgICAgICAgICAgICAgejogeiArIDAuMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGlzdGFuY2VcclxuICAgICAgICApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBpdHMgbm90IHdob2xlIGJvZHksIHRoZW4gd2UgbmVlZCB0byBsaW1pdCB0aGUgZGlzdGFuY2VcclxuICAgIGlmIChkaXN0YW5jZSA+IERFRkFVTFRfTUFYX0RJU1RBTkNFKSBkaXN0YW5jZSA9IERFRkFVTFRfTUFYX0RJU1RBTkNFO1xyXG5cclxuICAgIGlmIChpc0JvbmVBcnJheSkge1xyXG4gICAgICAgIGNvbnN0IFt4MSwgeTEsIHoxXTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZVswXSwgMC4wLCAwLjAsIDAuMClcclxuXHJcbiAgICAgICAgY29uc3QgW3gyLCB5MiwgejJdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCBib25lWzFdLCAwLjAsIDAuMCwgMC4wKVxyXG5cclxuICAgICAgICAvLyBnZXQgdGhlIG1pZGRsZSBvZiB0aGUgdHdvIHBvaW50c1xyXG4gICAgICAgIHZhciB4ID0gKHgxICsgeDIpIC8gMjtcclxuICAgICAgICB2YXIgeSA9ICh5MSArIHkyKSAvIDI7XHJcbiAgICAgICAgdmFyIHogPSAoejEgKyB6MikgLyAyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCBib25lLCAwLjAsIDAuMCwgMC4wKVxyXG4gICAgfVxyXG5cclxuXHRtb3ZlQ2FtZXJhKFxyXG5cdFx0e1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5LFxyXG5cdFx0XHR6OiB6ICsgMC4wLFxyXG5cdFx0fSxcclxuXHRcdGRpc3RhbmNlXHJcblx0KTtcclxuXHJcbn07XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtTW92ZSwgKGRhdGEsIGNiKSA9PiB7XHJcbiAgICBzZXRDYW1Qb3NpdGlvbihkYXRhLngsIGRhdGEueSk7XHJcbiAgICBjYigxKTtcclxufSk7XHJcblxyXG50eXBlIFRTZWN0aW9uID0gJ3dob2xlJyB8ICdoZWFkJyB8ICd0b3JzbycgfCAnbGVncycgfCAnc2hvZXMnO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVNlY3Rpb24sICh0eXBlOiBUU2VjdGlvbiwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnd2hvbGUnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ3dob2xlJywgV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0UpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdoZWFkJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCdoZWFkJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3RvcnNvJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCd0b3JzbycpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdsZWdzJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCdsZWdzJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3Nob2VzJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCdzaG9lcycpO1xyXG4gICAgICAgICAgICBzZXRDYW1Qb3NpdGlvbigpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHR9XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVpvb20sIChkYXRhLCBjYikgPT4ge1xyXG5cdGlmIChkYXRhID09PSAnZG93bicpIHtcclxuXHJcbiAgICAgICAgY29uc3QgbWF4Wm9vbSA9IGN1cnJlbnRCb25lID09PSAnd2hvbGUnID8gV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0UgOiBERUZBVUxUX01BWF9ESVNUQU5DRTtcclxuXHJcblx0XHRjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgKyAwLjA1O1xyXG5cdFx0Y2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA+PSBtYXhab29tID8gbWF4Wm9vbSA6IG5ld0Rpc3RhbmNlO1xyXG5cdH0gZWxzZSBpZiAoZGF0YSA9PT0gJ3VwJykge1xyXG5cdFx0Y29uc3QgbmV3RGlzdGFuY2U6IG51bWJlciA9IGNhbURpc3RhbmNlIC0gMC4wNTtcclxuXHRcdGNhbURpc3RhbmNlID0gbmV3RGlzdGFuY2UgPD0gMC4zID8gMC4zIDogbmV3RGlzdGFuY2U7XHJcblx0fVxyXG5cclxuXHRjYW1EaXN0YW5jZSA9IGNhbURpc3RhbmNlO1xyXG5cdHNldENhbVBvc2l0aW9uKCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiQmxlbWlzaGVzXCIsXG4gICAgXCJGYWNpYWxIYWlyXCIsXG4gICAgXCJFeWVicm93c1wiLFxuICAgIFwiQWdlaW5nXCIsXG4gICAgXCJNYWtldXBcIixcbiAgICBcIkJsdXNoXCIsXG4gICAgXCJDb21wbGV4aW9uXCIsXG4gICAgXCJTdW5EYW1hZ2VcIixcbiAgICBcIkxpcHN0aWNrXCIsXG4gICAgXCJNb2xlc0ZyZWNrbGVzXCIsXG4gICAgXCJDaGVzdEhhaXJcIixcbiAgICBcIkJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkFkZEJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkV5ZUNvbG9yXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJOb3NlX1dpZHRoXCIsXG4gICAgXCJOb3NlX1BlYWtfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTGVuZ2h0XCIsXG4gICAgXCJOb3NlX0JvbmVfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTG93ZXJpbmdcIixcbiAgICBcIk5vc2VfQm9uZV9Ud2lzdFwiLFxuICAgIFwiRXllQnJvd25fSGVpZ2h0XCIsXG4gICAgXCJFeWVCcm93bl9Gb3J3YXJkXCIsXG4gICAgXCJDaGVla3NfQm9uZV9IaWdoXCIsXG4gICAgXCJDaGVla3NfQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hlZWtzX1dpZHRoXCIsXG4gICAgXCJFeWVzX09wZW5uaW5nXCIsXG4gICAgXCJMaXBzX1RoaWNrbmVzc1wiLFxuICAgIFwiSmF3X0JvbmVfV2lkdGhcIixcbiAgICBcIkphd19Cb25lX0JhY2tfTGVuZ2h0XCIsXG4gICAgXCJDaGluX0JvbmVfTG93ZXJpbmdcIixcbiAgICBcIkNoaW5fQm9uZV9MZW5ndGhcIixcbiAgICBcIkNoaW5fQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hpbl9Ib2xlXCIsXG4gICAgXCJOZWNrX1RoaWtuZXNzXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJmYWNlXCIsXG4gICAgXCJtYXNrc1wiLFxuICAgIFwiaGFpclwiLFxuICAgIFwidG9yc29zXCIsXG4gICAgXCJsZWdzXCIsXG4gICAgXCJiYWdzXCIsXG4gICAgXCJzaG9lc1wiLFxuICAgIFwibmVja1wiLFxuICAgIFwic2hpcnRzXCIsXG4gICAgXCJ2ZXN0XCIsXG4gICAgXCJkZWNhbHNcIixcbiAgICBcImphY2tldHNcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImhhdHNcIixcbiAgICBcImdsYXNzZXNcIixcbiAgICBcImVhcnJpbmdzXCIsXG4gICAgXCJtb3V0aFwiLFxuICAgIFwibGhhbmRcIixcbiAgICBcInJoYW5kXCIsXG4gICAgXCJ3YXRjaGVzXCIsXG4gICAgXCJicmFjZWxldHNcIlxuXVxuIiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUSGFpckRhdGEsIFRIZWFkT3ZlcmxheSwgVEhlYWRPdmVybGF5VG90YWwsIFRDbG90aGVzLCBUU2tpbiB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IEhFQURfT1ZFUkxBWVMgZnJvbSBcIkBkYXRhL2hlYWRcIlxyXG5pbXBvcnQgRkFDRV9GRUFUVVJFUyBmcm9tIFwiQGRhdGEvZmFjZVwiXHJcbmltcG9ydCBEUkFXQUJMRV9OQU1FUyBmcm9tIFwiQGRhdGEvZHJhd2FibGVzXCJcclxuaW1wb3J0IFBST1BfTkFNRVMgZnJvbSBcIkBkYXRhL3Byb3BzXCJcclxuaW1wb3J0IHsgcGVkLCBvblNlcnZlckNhbGxiYWNrLCB1cGRhdGVQZWQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayB9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IFRUYXR0b28gfSBmcm9tIFwiQHR5cGluZ3MvdGF0dG9vc1wiXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZE1vZGVsSW5kZXgodGFyZ2V0OiBudW1iZXIpIHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZVxyXG4gICAgY29uc3QgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcblxyXG4gICAgcmV0dXJuIG1vZGVscy5maW5kSW5kZXgoKG1vZGVsOiBzdHJpbmcpID0+IEdldEhhc2hLZXkobW9kZWwpID09PSB0YXJnZXQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIYWlyKHBlZEhhbmRsZTogbnVtYmVyKTogVEhhaXJEYXRhIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29sb3I6IEdldFBlZEhhaXJDb2xvcihwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhpZ2hsaWdodDogR2V0UGVkSGFpckhpZ2hsaWdodENvbG9yKHBlZEhhbmRsZSlcclxuICAgIH1cclxufVxyXG5leHBvcnRzKCdHZXRIYWlyJywgZ2V0SGFpcik7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZEJsZW5kRGF0YShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BlZHIwZm9udG91cmEvZml2ZW0tYXBwZWFyYW5jZS9ibG9iL21haW4vZ2FtZS9zcmMvY2xpZW50L2luZGV4LnRzI0w2N1xyXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKDgwKTtcclxuICAgIGdsb2JhbC5DaXRpemVuLmludm9rZU5hdGl2ZSgnMHgyNzQ2YmQ5ZDg4YzVjNWQwJywgcGVkSGFuZGxlLCBuZXcgVWludDMyQXJyYXkoYnVmZmVyKSk7XHJcblxyXG4gICAgY29uc3QgeyAwOiBzaGFwZUZpcnN0LCAyOiBzaGFwZVNlY29uZCwgNDogc2hhcGVUaGlyZCwgNjogc2tpbkZpcnN0LCA4OiBza2luU2Vjb25kLCAxODogaGFzUGFyZW50LCAxMDogc2tpblRoaXJkIH0gPSBuZXcgVWludDMyQXJyYXkoYnVmZmVyKTtcclxuICAgIGNvbnN0IHsgMDogc2hhcGVNaXgsIDI6IHNraW5NaXgsIDQ6IHRoaXJkTWl4IH0gPSBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlciwgNDgpO1xyXG5cclxuICAgIC8qICAgXHJcbiAgICAgICAgMDogc2hhcGVGaXJzdCxcclxuICAgICAgICAyOiBzaGFwZVNlY29uZCxcclxuICAgICAgICA0OiBzaGFwZVRoaXJkLFxyXG4gICAgICAgIDY6IHNraW5GaXJzdCxcclxuICAgICAgICA4OiBza2luU2Vjb25kLFxyXG4gICAgICAgIDEwOiBza2luVGhpcmQsXHJcbiAgICAgICAgMTg6IGhhc1BhcmVudCxcclxuICAgICovXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNoYXBlRmlyc3QsICAgLy8gZmF0aGVyXHJcbiAgICAgICAgc2hhcGVTZWNvbmQsIC8vIG1vdGhlclxyXG4gICAgICAgIHNoYXBlVGhpcmQsXHJcblxyXG4gICAgICAgIHNraW5GaXJzdCxcclxuICAgICAgICBza2luU2Vjb25kLFxyXG4gICAgICAgIHNraW5UaGlyZCxcclxuXHJcbiAgICAgICAgc2hhcGVNaXgsIC8vIHJlc2VtYmxhbmNlXHJcblxyXG4gICAgICAgIHRoaXJkTWl4LFxyXG4gICAgICAgIHNraW5NaXgsICAgLy8gc2tpbnBlcmNlbnRcclxuXHJcbiAgICAgICAgaGFzUGFyZW50OiBCb29sZWFuKGhhc1BhcmVudCksXHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydHMoJ0dldEhlYWRCbGVuZCcsIGdldEhlYWRCbGVuZERhdGEpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRPdmVybGF5KHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgdG90YWxzOiBUSGVhZE92ZXJsYXlUb3RhbCA9IHt9O1xyXG4gICAgbGV0IGhlYWREYXRhOiBUSGVhZE92ZXJsYXkgPSB7fTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEhFQURfT1ZFUkxBWVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gSEVBRF9PVkVSTEFZU1tpXTtcclxuICAgICAgICB0b3RhbHNbb3ZlcmxheV0gPSBHZXROdW1IZWFkT3ZlcmxheVZhbHVlcyhpKTtcclxuXHJcbiAgICAgICAgaWYgKG92ZXJsYXkgPT09IFwiRXllQ29sb3JcIikge1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5VmFsdWU6IEdldFBlZEV5ZUNvbG9yKHBlZEhhbmRsZSlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBbXywgb3ZlcmxheVZhbHVlLCBjb2xvdXJUeXBlLCBmaXJzdENvbG9yLCBzZWNvbmRDb2xvciwgb3ZlcmxheU9wYWNpdHldID0gR2V0UGVkSGVhZE92ZXJsYXlEYXRhKHBlZEhhbmRsZSwgaSk7XHJcbiAgICAgICAgICAgIGhlYWREYXRhW292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogb3ZlcmxheVZhbHVlID09PSAyNTUgPyAtMSA6IG92ZXJsYXlWYWx1ZSxcclxuICAgICAgICAgICAgICAgIGNvbG91clR5cGU6IGNvbG91clR5cGUsXHJcbiAgICAgICAgICAgICAgICBmaXJzdENvbG9yOiBmaXJzdENvbG9yLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kQ29sb3I6IHNlY29uZENvbG9yLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheU9wYWNpdHk6IG92ZXJsYXlPcGFjaXR5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbaGVhZERhdGEsIHRvdGFsc107XHJcbn1cclxuZXhwb3J0cygnR2V0SGVhZE92ZXJsYXknLCBnZXRIZWFkT3ZlcmxheSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZFN0cnVjdHVyZShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgY29uc3QgcGVkTW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWRIYW5kbGUpXHJcblxyXG4gICAgaWYgKHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSAmJiBwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIikpIHJldHVyblxyXG5cclxuICAgIGxldCBmYWNlU3RydWN0ID0ge31cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRkFDRV9GRUFUVVJFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBGQUNFX0ZFQVRVUkVTW2ldXHJcbiAgICAgICAgZmFjZVN0cnVjdFtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRmFjZUZlYXR1cmUocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFjZVN0cnVjdFxyXG59XHJcbmV4cG9ydHMoJ0dldEhlYWRTdHJ1Y3R1cmUnLCBnZXRIZWFkU3RydWN0dXJlKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXREcmF3YWJsZXMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBkcmF3YWJsZXMgPSB7fVxyXG4gICAgbGV0IHRvdGFsRHJhd2FibGVzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IERSQVdBQkxFX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IERSQVdBQkxFX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxEcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRUZXh0dXJlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtkcmF3YWJsZXMsIHRvdGFsRHJhd2FibGVzXVxyXG59XHJcbmV4cG9ydHMoJ0dldERyYXdhYmxlcycsIGdldERyYXdhYmxlcyk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcHMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBwcm9wcyA9IHt9XHJcbiAgICBsZXQgdG90YWxQcm9wcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBQUk9QX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IFBST1BfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxQcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWRQcm9wRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFByb3BUZXh0dXJlSW5kZXgocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3Byb3BzLCB0b3RhbFByb3BzXVxyXG59XHJcbmV4cG9ydHMoJ0dldFByb3BzJywgZ2V0UHJvcHMpO1xyXG5cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcHBlYXJhbmNlKHBlZEhhbmRsZTogbnVtYmVyKTogUHJvbWlzZTxUQXBwZWFyYW5jZT4ge1xyXG4gICAgY29uc3QgW2hlYWREYXRhLCB0b3RhbHNdID0gZ2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW2RyYXdhYmxlcywgZHJhd1RvdGFsXSA9IGdldERyYXdhYmxlcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbcHJvcHMsIHByb3BUb3RhbF0gPSBnZXRQcm9wcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBtb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IHRhdHRvb3MgPSBhd2FpdCBnZXRUYXR0b29zKClcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1vZGVsSW5kZXg6IGZpbmRNb2RlbEluZGV4KG1vZGVsKSxcclxuICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGVhZEJsZW5kOiBnZXRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGVhZE92ZXJsYXk6IGhlYWREYXRhIGFzIFRIZWFkT3ZlcmxheSxcclxuICAgICAgICBoZWFkT3ZlcmxheVRvdGFsOiB0b3RhbHMgYXMgVEhlYWRPdmVybGF5VG90YWwsXHJcbiAgICAgICAgaGVhZFN0cnVjdHVyZTogZ2V0SGVhZFN0cnVjdHVyZShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgICAgICBkcmF3VG90YWw6IGRyYXdUb3RhbCxcclxuICAgICAgICBwcm9wVG90YWw6IHByb3BUb3RhbCxcclxuICAgICAgICB0YXR0b29zOiB0YXR0b29zXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldEFwcGVhcmFuY2VcIiwgZ2V0QXBwZWFyYW5jZSlcclxub25TZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6Z2V0QXBwZWFyYW5jZScsICgpID0+IHtcclxuICAgIHVwZGF0ZVBlZChQbGF5ZXJQZWRJZCgpKVxyXG4gICAgcmV0dXJuIGdldEFwcGVhcmFuY2UocGVkKVxyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQZWRDbG90aGVzKHBlZEhhbmRsZTogbnVtYmVyKTogVENsb3RoZXMge1xyXG4gICAgY29uc3QgW2RyYXdhYmxlc10gPSBnZXREcmF3YWJsZXMocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW3Byb3BzXSA9IGdldFByb3BzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtoZWFkRGF0YV0gPSBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEgYXMgVEhlYWRPdmVybGF5LFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkQ2xvdGhlc1wiLCBnZXRQZWRDbG90aGVzKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBlZFNraW4ocGVkSGFuZGxlOiBudW1iZXIpOiBUU2tpbiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGhlYWRCbGVuZDogZ2V0SGVhZEJsZW5kRGF0YShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhlYWRTdHJ1Y3R1cmU6IGdldEhlYWRTdHJ1Y3R1cmUocGVkSGFuZGxlKSxcclxuICAgICAgICBoYWlyQ29sb3I6IGdldEhhaXIocGVkSGFuZGxlKSxcclxuICAgICAgICBtb2RlbDogR2V0RW50aXR5TW9kZWwocGVkSGFuZGxlKVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRQZWRTa2luXCIsIGdldFBlZFNraW4pXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGF0dG9vRGF0YSgpIHtcclxuICAgIGxldCB0YXR0b29ab25lcyA9IFtdXHJcblxyXG4gICAgY29uc3QgW1RBVFRPT19MSVNULCBUQVRUT09fQ0FURUdPUklFU10gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UudGF0dG9vcygpXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFRBVFRPT19DQVRFR09SSUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBUQVRUT09fQ0FURUdPUklFU1tpXVxyXG4gICAgICAgIGNvbnN0IHpvbmUgPSBjYXRlZ29yeS56b25lXHJcbiAgICAgICAgY29uc3QgbGFiZWwgPSBjYXRlZ29yeS5sYWJlbFxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gY2F0ZWdvcnkuaW5kZXhcclxuICAgICAgICB0YXR0b29ab25lc1tpbmRleF0gPSB7XHJcbiAgICAgICAgICAgIHpvbmU6IHpvbmUsXHJcbiAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcclxuICAgICAgICAgICAgem9uZUluZGV4OiBpbmRleCxcclxuICAgICAgICAgICAgZGxjczogW11cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgZGxjRGF0YSA9IFRBVFRPT19MSVNUW2pdXHJcbiAgICAgICAgICAgIHRhdHRvb1pvbmVzW2luZGV4XS5kbGNzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGRsY0RhdGEuZGxjLFxyXG4gICAgICAgICAgICAgICAgZGxjSW5kZXg6IGosXHJcbiAgICAgICAgICAgICAgICB0YXR0b29zOiBbXVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0ZlbWFsZSA9IEdldEVudGl0eU1vZGVsKHBlZCkgPT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fTElTVC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBUQVRUT09fTElTVFtpXVxyXG4gICAgICAgIGNvbnN0IHsgZGxjLCB0YXR0b29zIH0gPSBkYXRhXHJcbiAgICAgICAgY29uc3QgZGxjSGFzaCA9IEdldEhhc2hLZXkoZGxjKVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGF0dG9vcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gdGF0dG9vc1tqXVxyXG4gICAgICAgICAgICBsZXQgdGF0dG9vID0gbnVsbFxyXG5cclxuICAgICAgICAgICAgY29uc3QgbG93ZXJUYXR0b28gPSB0YXR0b29EYXRhLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgY29uc3QgaXNGZW1hbGVUYXR0b28gPSBsb3dlclRhdHRvby5pbmNsdWRlcyhcIl9mXCIpXHJcbiAgICAgICAgICAgIGlmIChpc0ZlbWFsZVRhdHRvbyAmJiBpc0ZlbWFsZSkge1xyXG4gICAgICAgICAgICAgICAgdGF0dG9vID0gdGF0dG9vRGF0YVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0ZlbWFsZVRhdHRvbyAmJiAhaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGhhc2ggPSBudWxsXHJcbiAgICAgICAgICAgIGxldCB6b25lID0gLTFcclxuXHJcbiAgICAgICAgICAgIGlmICh0YXR0b28pIHtcclxuICAgICAgICAgICAgICAgIGhhc2ggPSBHZXRIYXNoS2V5KHRhdHRvbylcclxuICAgICAgICAgICAgICAgIHpvbmUgPSBHZXRQZWREZWNvcmF0aW9uWm9uZUZyb21IYXNoZXMoZGxjSGFzaCwgaGFzaClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHpvbmUgIT09IC0xICYmIGhhc2gpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHpvbmVUYXR0b29zID0gdGF0dG9vWm9uZXNbem9uZV0uZGxjc1tpXS50YXR0b29zXHJcblxyXG4gICAgICAgICAgICAgICAgem9uZVRhdHRvb3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRhdHRvbyxcclxuICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvbmU6IHpvbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGxjOiBkbGMsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YXR0b29ab25lc1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VGF0dG9vcygpOiBQcm9taXNlPFRUYXR0b29bXT4ge1xyXG4gICAgcmV0dXJuIGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0VGF0dG9vcycpIHx8IFtdXHJcbn1cclxuZXhwb3J0cygnR2V0VGF0dG9vcycsIGdldFRhdHRvb3MpO1xyXG4vL21pZ3JhdGlvblxyXG5cclxub25TZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6bWlncmF0aW9uOnNldEFwcGVhcmFuY2UnLCAoZGF0YToge3R5cGU6IHN0cmluZywgZGF0YTogYW55fSkgPT4ge1xyXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gJ2ZpdmVtJykgZXhwb3J0c1snZml2ZW0tYXBwZWFyYW5jZSddLnNldFBsYXllckFwcGVhcmFuY2UoZGF0YS5kYXRhKVxyXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gJ2lsbGVuaXVtJykgZXhwb3J0c1snaWxsZW5pdW0tYXBwZWFyYW5jZSddLnNldFBsYXllckFwcGVhcmFuY2UoZGF0YS5kYXRhKVxyXG59KTsiLCAiZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgaGF0czoge1xyXG4gICAgICAgIHR5cGU6IFwicHJvcFwiLFxyXG4gICAgICAgIGluZGV4OiAwLFxyXG4gICAgfSxcclxuICAgIGdsYXNzZXM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgIH0sXHJcbiAgICBtYXNrczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgICAgICBvZmY6IDAsXHJcbiAgICB9LFxyXG4gICAgc2hpcnRzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA4LFxyXG4gICAgICAgIG9mZjogMTUsXHJcbiAgICAgICAgaG9vazoge1xyXG4gICAgICAgICAgICBkcmF3YWJsZXM6IFtcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAzLCB2YXJpYW50OiAxNSwgdGV4dHVyZTogMCwgaWQ6ICd0b3Jzb3MnIH0sXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogOCwgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAnc2hpcnRzJyB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgamFja2V0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMTEsXHJcbiAgICAgICAgb2ZmOiAxNSxcclxuICAgICAgICBob29rOiB7XHJcbiAgICAgICAgICAgIGRyYXdhYmxlczogW1xyXG4gICAgICAgICAgICAgICAgeyBjb21wb25lbnQ6IDMsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ3RvcnNvcycgfSxcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAxMSwgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAnamFja2V0cycgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHZlc3Q6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDksXHJcbiAgICAgICAgb2ZmOiAwLFxyXG4gICAgfSxcclxuICAgIGxlZ3M6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDQsXHJcbiAgICAgICAgb2ZmOiAxOCxcclxuICAgIH0sXHJcbiAgICBzaG9lczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogNixcclxuICAgICAgICBvZmY6IDM0LFxyXG4gICAgfVxyXG59IiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUSGFpckNvbG9yLCBUQ2xvdGhlcywgVFNraW4sIFRWYWx1ZSB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCI7XHJcbmltcG9ydCBUT0dHTEVfSU5ERVhFUyBmcm9tIFwiQGRhdGEvdG9nZ2xlc1wiXHJcbmltcG9ydCB7IHJlcXVlc3RNb2RlbCwgcGVkLCB1cGRhdGVQZWQsIGlzUGVkRnJlZW1vZGVNb2RlbH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgVFRhdHRvbyB9IGZyb20gXCJAdHlwaW5ncy90YXR0b29zXCI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0RHJhd2FibGUocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCAwKVxyXG4gICAgcmV0dXJuIEdldE51bWJlck9mUGVkVGV4dHVyZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlKVxyXG59XHJcbmV4cG9ydHMoJ1NldERyYXdhYmxlJywgc2V0RHJhd2FibGUpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFByb3AocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgaWYgKGRhdGEudmFsdWUgPT09IC0xKSB7XHJcbiAgICAgICAgQ2xlYXJQZWRQcm9wKHBlZEhhbmRsZSwgZGF0YS5pbmRleClcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBTZXRQZWRQcm9wSW5kZXgocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlLCBkYXRhLnRleHR1cmUsIGZhbHNlKVxyXG4gICAgcmV0dXJuIEdldE51bWJlck9mUGVkUHJvcFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSlcclxufVxyXG5leHBvcnRzKCdTZXRQcm9wJywgc2V0UHJvcCk7XHJcblxyXG5jb25zdCBkZWZNYWxlSGFzaCA9IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpXHJcblxyXG5leHBvcnQgY29uc3Qgc2V0TW9kZWwgPSBhc3luYyAocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRBcHBlYXJhbmNlIHwgVFNraW4gfCBudW1iZXIgfCBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4gPT4ge1xyXG4gICAgaWYgKGRhdGEgPT0gbnVsbCB8fCBkYXRhID09PSB1bmRlZmluZWQpIHJldHVybiBwZWRIYW5kbGU7XHJcblxyXG4gICAgbGV0IG1vZGVsOiBudW1iZXI7XHJcbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgbW9kZWwgPSBHZXRIYXNoS2V5KGRhdGEpO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICBtb2RlbCA9IGRhdGE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIG1vZGVsID0gZGF0YS5tb2RlbCB8fCBkZWZNYWxlSGFzaDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobW9kZWwgPT09IDApIHJldHVybiBwZWRIYW5kbGU7XHJcblxyXG4gICAgYXdhaXQgcmVxdWVzdE1vZGVsKG1vZGVsKTtcclxuXHJcbiAgICBjb25zdCBpc1BsYXllciA9IElzUGVkQVBsYXllcihwZWRIYW5kbGUpO1xyXG4gICAgaWYgKGlzUGxheWVyKSB7XHJcbiAgICAgICAgU2V0UGxheWVyTW9kZWwoUGxheWVySWQoKSwgbW9kZWwpO1xyXG4gICAgICAgIHBlZEhhbmRsZSA9IFBsYXllclBlZElkKCk7XHJcbiAgICAgICAgdXBkYXRlUGVkKHBlZEhhbmRsZSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgU2V0UGxheWVyTW9kZWwocGVkSGFuZGxlLCBtb2RlbCk7XHJcbiAgICB9XHJcblxyXG4gICAgU2V0TW9kZWxBc05vTG9uZ2VyTmVlZGVkKG1vZGVsKTtcclxuICAgIFNldFBlZERlZmF1bHRDb21wb25lbnRWYXJpYXRpb24ocGVkSGFuZGxlKTtcclxuXHJcbiAgICBpZiAoIWlzUGVkRnJlZW1vZGVNb2RlbChwZWRIYW5kbGUpKSByZXR1cm4gcGVkSGFuZGxlO1xyXG5cclxuICAgIGNvbnN0IGlzSnVzdE1vZGVsID0gdHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBkYXRhID09PSAnbnVtYmVyJztcclxuICAgIGNvbnN0IGhhc0hlYWRCbGVuZCA9ICFpc0p1c3RNb2RlbCAmJiBkYXRhLmhlYWRCbGVuZCAmJiBPYmplY3Qua2V5cyhkYXRhLmhlYWRCbGVuZCkubGVuZ3RoID4gMDtcclxuXHJcbiAgICBpZiAoaGFzSGVhZEJsZW5kKSB7XHJcbiAgICAgICAgc2V0SGVhZEJsZW5kKHBlZEhhbmRsZSwgKGRhdGEgYXMgVEFwcGVhcmFuY2UgfCBUU2tpbikuaGVhZEJsZW5kKTtcclxuICAgICAgICBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZSwgMCwgMCwgMCwgMCwgMCwgMCwgMC4wLCAwLjAsIDAuMCwgZmFsc2UpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAobW9kZWwgPT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpKSB7XHJcbiAgICAgICAgICAgIFNldFBlZEhlYWRCbGVuZERhdGEocGVkSGFuZGxlLCAwLCAwLCAwLCAwLCAwLCAwLCAwLjAsIDAuMCwgMC4wLCBmYWxzZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChtb2RlbCA9PT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIikpIHtcclxuICAgICAgICAgICAgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWRIYW5kbGUsIDQ1LCAyMSwgMCwgMjAsIDE1LCAwLCAwLjMsIDAuMSwgMCwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcGVkSGFuZGxlO1xyXG59O1xyXG5leHBvcnRzKCdTZXRNb2RlbCcsIHNldE1vZGVsKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBTZXRGYWNlRmVhdHVyZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBTZXRQZWRGYWNlRmVhdHVyZShwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUgKyAwLjApXHJcbn1cclxuZXhwb3J0cygnU2V0RmFjZUZlYXR1cmUnLCBTZXRGYWNlRmVhdHVyZSk7XHJcblxyXG5jb25zdCBpc1Bvc2l0aXZlID0gKHZhbDogbnVtYmVyKSA9PiB2YWwgPj0gMCA/IHZhbCA6IDBcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkQmxlbmQocGVkSGFuZGxlOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIHBlZEhhbmRsZSA9IHBlZEhhbmRsZSB8fCBwZWRcclxuXHJcbiAgICBpZiAoIWlzUGVkRnJlZW1vZGVNb2RlbChwZWRIYW5kbGUpKSByZXR1cm5cclxuXHJcbiAgICBjb25zdCBzaGFwZUZpcnN0ID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlRmlyc3QpXHJcbiAgICBjb25zdCBzaGFwZVNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZVNlY29uZClcclxuICAgIGNvbnN0IHNoYXBlVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVUaGlyZClcclxuICAgIGNvbnN0IHNraW5GaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5za2luRmlyc3QpXHJcbiAgICBjb25zdCBza2luU2Vjb25kID0gaXNQb3NpdGl2ZShkYXRhLnNraW5TZWNvbmQpXHJcbiAgICBjb25zdCBza2luVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpblRoaXJkKVxyXG4gICAgY29uc3Qgc2hhcGVNaXggPSBkYXRhLnNoYXBlTWl4ICsgMC4wXHJcbiAgICBjb25zdCBza2luTWl4ID0gZGF0YS5za2luTWl4ICsgMC4wXHJcbiAgICBjb25zdCB0aGlyZE1peCA9IGRhdGEudGhpcmRNaXggKyAwLjBcclxuICAgIGNvbnN0IGhhc1BhcmVudCA9IGRhdGEuaGFzUGFyZW50XHJcblxyXG4gICAgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWRIYW5kbGUsIHNoYXBlRmlyc3QsIHNoYXBlU2Vjb25kLCBzaGFwZVRoaXJkLCBza2luRmlyc3QsIHNraW5TZWNvbmQsIHNraW5UaGlyZCwgc2hhcGVNaXgsIHNraW5NaXgsIHRoaXJkTWl4LCBoYXNQYXJlbnQpXHJcbn1cclxuZXhwb3J0cygnU2V0SGVhZEJsZW5kJywgc2V0SGVhZEJsZW5kKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkT3ZlcmxheShwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgY29uc3QgaW5kZXggPSBkYXRhLmluZGV4XHJcblxyXG4gICAgaWYgKGluZGV4ID09PSAxMykge1xyXG4gICAgICAgIFNldFBlZEV5ZUNvbG9yKHBlZEhhbmRsZSwgZGF0YS52YWx1ZSlcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlXHJcblxyXG4gICAgLyogSGFpciBjb2xvciBkb2VzIG5vdCBoYXZlIGFuIGluZGV4LCBvbmx5IGFuIElEIHNvIHdlJ2xsIGNoZWNrIGZvciB0aGF0ICovXHJcbiAgICBpZiAoZGF0YS5pZCA9PT0gJ2hhaXJDb2xvcicpIHtcclxuICAgICAgICBTZXRQZWRIYWlyVGludChwZWRIYW5kbGUsIGRhdGEuaGFpckNvbG9yLCBkYXRhLmhhaXJIaWdobGlnaHQpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIFNldFBlZEhlYWRPdmVybGF5KHBlZEhhbmRsZSwgaW5kZXgsIHZhbHVlLCBkYXRhLm92ZXJsYXlPcGFjaXR5ICsgMC4wKVxyXG4gICAgU2V0UGVkSGVhZE92ZXJsYXlDb2xvcihwZWRIYW5kbGUsIGluZGV4LCAxLCBkYXRhLmZpcnN0Q29sb3IsIGRhdGEuc2Vjb25kQ29sb3IpXHJcbn1cclxuZXhwb3J0cygnU2V0SGVhZE92ZXJsYXknLCBzZXRIZWFkT3ZlcmxheSk7XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0VG9nZ2xlcyhkYXRhKSB7XHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcblxyXG4gICAgZm9yIChjb25zdCBbdG9nZ2xlSXRlbSwgdG9nZ2xlRGF0YV0gb2YgT2JqZWN0LmVudHJpZXMoVE9HR0xFX0lOREVYRVMpKSB7XHJcbiAgICAgICAgY29uc3QgdG9nZ2xlVHlwZSA9IHRvZ2dsZURhdGEudHlwZVxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdG9nZ2xlRGF0YS5pbmRleFxyXG5cclxuICAgICAgICBpZiAodG9nZ2xlVHlwZSA9PT0gXCJkcmF3YWJsZVwiICYmIGRyYXdhYmxlc1t0b2dnbGVJdGVtXSkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudERyYXdhYmxlICE9PSBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHRvZ2dsZVR5cGUgPT09IFwicHJvcFwiICYmIHByb3BzW3RvZ2dsZUl0ZW1dKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UHJvcCAhPT0gcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZFByb3BJbmRleChwZWQsIGluZGV4LCBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgZmFsc2UpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cygnU2V0UGVkQ2xvdGhlcycsIHNldFBlZENsb3RoZXMpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZENsb3RoZXMocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRDbG90aGVzKSB7XHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcbiAgICBjb25zdCBoZWFkT3ZlcmxheSA9IGRhdGEuaGVhZE92ZXJsYXlcclxuICAgIGZvciAoY29uc3QgaWQgaW4gZHJhd2FibGVzKSB7XHJcbiAgICAgICAgY29uc3QgZHJhd2FibGUgPSBkcmF3YWJsZXNbaWRdXHJcbiAgICAgICAgc2V0RHJhd2FibGUocGVkSGFuZGxlLCBkcmF3YWJsZSlcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIHByb3BzKSB7XHJcbiAgICAgICAgY29uc3QgcHJvcCA9IHByb3BzW2lkXVxyXG4gICAgICAgIHNldFByb3AocGVkSGFuZGxlLCBwcm9wKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgaWQgaW4gaGVhZE92ZXJsYXkpIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gaGVhZE92ZXJsYXlbaWRdXHJcbiAgICAgICAgc2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlLCBvdmVybGF5KVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoJ1NldFBlZENsb3RoZXMnLCBzZXRQZWRDbG90aGVzKTtcclxuXHJcbmV4cG9ydCBjb25zdCBzZXRQZWRTa2luID0gYXN5bmMgKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUU2tpbikgPT4ge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm5cclxuXHJcbiAgICBwZWRIYW5kbGUgPSBhd2FpdCBzZXRNb2RlbChwZWRIYW5kbGUsIGRhdGEpXHJcblxyXG4gICAgY29uc3QgaGVhZFN0cnVjdHVyZSA9IGRhdGEuaGVhZFN0cnVjdHVyZVxyXG4gICAgY29uc3QgaGVhZEJsZW5kID0gZGF0YS5oZWFkQmxlbmRcclxuXHJcbiAgICBpZiAoaGVhZEJsZW5kKSBzZXRIZWFkQmxlbmQocGVkSGFuZGxlLCBoZWFkQmxlbmQpXHJcbiAgICBcclxuICAgIGlmIChoZWFkU3RydWN0dXJlKSBmb3IgKGNvbnN0IGZlYXR1cmUgaW4gaGVhZFN0cnVjdHVyZSkge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gaGVhZFN0cnVjdHVyZVtmZWF0dXJlXVxyXG4gICAgICAgIFNldEZhY2VGZWF0dXJlKHBlZEhhbmRsZSwgdmFsdWUpXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cygnU2V0UGVkU2tpbicsIHNldFBlZFNraW4pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZFRhdHRvb3MocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRUYXR0b29bXSkge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm5cclxuXHJcbiAgICBDbGVhclBlZERlY29yYXRpb25zTGVhdmVTY2FycyhwZWRIYW5kbGUpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IGRhdGFbaV0udGF0dG9vXHJcbiAgICAgICAgaWYgKHRhdHRvb0RhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IEdldEhhc2hLZXkodGF0dG9vRGF0YS5kbGMpXHJcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvbyA9IHRhdHRvb0RhdGEuaGFzaFxyXG4gICAgICAgICAgICBBZGRQZWREZWNvcmF0aW9uRnJvbUhhc2hlcyhwZWRIYW5kbGUsIGNvbGxlY3Rpb24sIHRhdHRvbylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cygnU2V0UGVkVGF0dG9vcycsIHNldFBlZFRhdHRvb3MpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZEhhaXJDb2xvcnMocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRIYWlyQ29sb3IpIHtcclxuICAgIGlmICghZGF0YSkgcmV0dXJuXHJcbiAgICBjb25zdCBjb2xvciA9IGRhdGEuY29sb3JcclxuICAgIGNvbnN0IGhpZ2hsaWdodCA9IGRhdGEuaGlnaGxpZ2h0XHJcbiAgICBTZXRQZWRIYWlyQ29sb3IocGVkSGFuZGxlLCBjb2xvciwgaGlnaGxpZ2h0KVxyXG59XHJcbmV4cG9ydHMoJ1NldFBlZEhhaXJDb2xvcnMnLCBzZXRQZWRIYWlyQ29sb3JzKTtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQZWRBcHBlYXJhbmNlKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUQXBwZWFyYW5jZSkge1xyXG4gICAgaWYgKElzUGVkQVBsYXllcihwZWRIYW5kbGUpKSB7XHJcbiAgICAgICAgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShkYXRhKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgYXdhaXQgc2V0UGVkU2tpbihwZWRIYW5kbGUsIGRhdGEpXHJcbiAgICBzZXRQZWRDbG90aGVzKHBlZEhhbmRsZSwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMocGVkSGFuZGxlLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MocGVkSGFuZGxlLCBkYXRhLnRhdHRvb3MpXHJcbn1cclxuZXhwb3J0cygnU2V0UGVkQXBwZWFyYW5jZScsIHNldFBlZEFwcGVhcmFuY2UpO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBsYXllclBlZEFwcGVhcmFuY2UoZGF0YTogVEFwcGVhcmFuY2UpIHtcclxuICAgIC8vIFNpbmNlIHRoaXMgZnVuY3Rpb24gaXMgdXN1YWxseSBjYWxsZWQgYWZ0ZXIgc2NyaXB0cyBzZXQgdGhlaXIgb3duIG1vZGVsLCB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgcGVkIGJlZm9yZSB3ZSBzZXQgdGhlIGFwcGVhcmFuY2VcclxuICAgIHVwZGF0ZVBlZChQbGF5ZXJQZWRJZCgpKVxyXG4gICAgYXdhaXQgc2V0UGVkU2tpbihwZWQsIGRhdGEpXHJcbiAgICAvLyBXZSBuZWVkIHRvIHVwZGF0ZSB0aGUgcGVkIGFnYWluIGFmdGVyIHNldHRpbmcgdGhlIHNraW4gYmVjYXVzZSBTZXRQbGF5ZXJNb2RlbCB3aWxsIHNldCBhIG5ldyBQbGF5ZXJQZWRJZFxyXG4gICAgdXBkYXRlUGVkKFBsYXllclBlZElkKCkpXHJcbiAgICBzZXRQZWRDbG90aGVzKHBlZCwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMocGVkLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MocGVkLCBkYXRhLnRhdHRvb3MpXHJcbn1cclxuXHJcbmV4cG9ydHMoJ1NldFBlZENsb3RoZXMnLCBzZXRQZWRDbG90aGVzKVxyXG5leHBvcnRzKCdTZXRQZWRTa2luJywgc2V0UGVkU2tpbilcclxuZXhwb3J0cygnU2V0UGVkVGF0dG9vcycsIHNldFBlZFRhdHRvb3MpXHJcbmV4cG9ydHMoJ1NldFBlZEhhaXJDb2xvcnMnLCBzZXRQZWRIYWlyQ29sb3JzKSIsICJpbXBvcnQgeyBSZWNlaXZlIH0gZnJvbSAnQGV2ZW50cyc7XHJcbmltcG9ydCB7XHJcblx0cmVzZXRUb2dnbGVzLFxyXG5cdHNldERyYXdhYmxlLFxyXG5cdFNldEZhY2VGZWF0dXJlLFxyXG5cdHNldEhlYWRCbGVuZCxcclxuXHRzZXRIZWFkT3ZlcmxheSxcclxuXHRzZXRNb2RlbCxcclxuXHRzZXRQZWRDbG90aGVzLFxyXG5cdHNldFBlZFRhdHRvb3MsXHJcblx0c2V0UGxheWVyUGVkQXBwZWFyYW5jZSxcclxuXHRzZXRQcm9wLFxyXG59IGZyb20gJy4vYXBwZWFyYW5jZS9zZXR0ZXJzJztcclxuaW1wb3J0IHsgY2xvc2VNZW51IH0gZnJvbSAnLi9tZW51JztcclxuaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRUb2dnbGVEYXRhLCBUVmFsdWUgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgZGVsYXksIGdldEZyYW1ld29ya0lELCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIHBlZCwgdXBkYXRlUGVkIH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0VGF0dG9vRGF0YSB9IGZyb20gJy4vYXBwZWFyYW5jZS9nZXR0ZXJzJztcclxuaW1wb3J0IFRPR0dMRV9JTkRFWEVTIGZyb20gJ0BkYXRhL3RvZ2dsZXMnO1xyXG5pbXBvcnQgeyBUT3V0Zml0RGF0YSB9IGZyb20gJ0B0eXBpbmdzL291dGZpdHMnO1xyXG5pbXBvcnQgeyBUVGF0dG9vIH0gZnJvbSAnQHR5cGluZ3MvdGF0dG9vcyc7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FuY2VsLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSk7XHJcblx0Y2xvc2VNZW51KCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNhdmUsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0cmVzZXRUb2dnbGVzKGFwcGVhcmFuY2UpO1xyXG5cclxuXHRhd2FpdCBkZWxheSgxMDApO1xyXG5cclxuXHRjb25zdCBuZXdBcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cdG5ld0FwcGVhcmFuY2UudGF0dG9vcyA9IGFwcGVhcmFuY2UudGF0dG9vcyB8fCBudWxsXHJcblx0dHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlQXBwZWFyYW5jZScsIGdldEZyYW1ld29ya0lEKCksIG5ld0FwcGVhcmFuY2UpO1xyXG5cclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgbmV3QXBwZWFyYW5jZS50YXR0b29zKTtcclxuXHJcblx0Y2xvc2VNZW51KCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldE1vZGVsLCBhc3luYyAobW9kZWw6IHN0cmluZywgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgaGFzaCA9IEdldEhhc2hLZXkobW9kZWwpO1xyXG5cdGlmICghSXNNb2RlbEluQ2RpbWFnZShoYXNoKSB8fCAhSXNNb2RlbFZhbGlkKGhhc2gpKSB7XHJcblx0XHRyZXR1cm4gY2IoMCk7XHJcblx0fVxyXG5cclxuXHJcblx0Y29uc3QgbmV3UGVkID0gYXdhaXQgc2V0TW9kZWwocGVkLCBoYXNoKTtcclxuXHJcbiAgICB1cGRhdGVQZWQobmV3UGVkKVxyXG5cclxuXHRjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cclxuXHRhcHBlYXJhbmNlLnRhdHRvb3MgPSBbXTtcclxuXHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIFtdKTtcclxuXHJcblx0Y2IoYXBwZWFyYW5jZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmdldE1vZGVsVGF0dG9vcywgYXN5bmMgKF86IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgdGF0dG9vcyA9IGdldFRhdHRvb0RhdGEoKTtcclxuXHJcblx0Y2IodGF0dG9vcyk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRTdHJ1Y3R1cmUsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdFNldEZhY2VGZWF0dXJlKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRPdmVybGF5LCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRIZWFkT3ZlcmxheShwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRIZWFkQmxlbmQsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldEhlYWRCbGVuZChwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRUYXR0b29zLCBhc3luYyAoZGF0YTogVFRhdHRvb1tdLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFByb3AsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGxldCB0ZXh0dXJlID0gc2V0UHJvcChwZWQsIGRhdGEpO1xyXG5cdGNiKHRleHR1cmUpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXREcmF3YWJsZSwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0bGV0IHRleHR1cmUgPSBzZXREcmF3YWJsZShwZWQsIGRhdGEpO1xyXG5cdGNiKHRleHR1cmUpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS50b2dnbGVJdGVtLCBhc3luYyAoZGF0YTogVFRvZ2dsZURhdGEsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGl0ZW0gPSBUT0dHTEVfSU5ERVhFU1tkYXRhLml0ZW1dO1xyXG5cdGlmICghaXRlbSkgcmV0dXJuIGNiKGZhbHNlKTtcclxuXHJcblx0Y29uc3QgY3VycmVudCA9IGRhdGEuZGF0YTtcclxuXHRjb25zdCB0eXBlID0gaXRlbS50eXBlO1xyXG5cdGNvbnN0IGluZGV4ID0gaXRlbS5pbmRleDtcclxuXHRjb25zdCBob29rID0gaXRlbS5ob29rO1xyXG5cdGNvbnN0IGhvb2tEYXRhID0gZGF0YS5ob29rRGF0YTtcclxuXHJcblx0aWYgKCFjdXJyZW50KSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRpZiAodHlwZSA9PT0gJ3Byb3AnKSB7XHJcblx0XHRjb25zdCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KTtcclxuXHJcblx0XHRpZiAoY3VycmVudFByb3AgPT09IC0xKSB7XHJcblx0XHRcdHNldFByb3AocGVkLCBjdXJyZW50KTtcclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRDbGVhclBlZFByb3AocGVkLCBpbmRleCk7XHJcblx0XHRcdGNiKHRydWUpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fSBlbHNlIGlmICh0eXBlID09PSAnZHJhd2FibGUnKSB7XHJcblx0XHRjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KTtcclxuXHJcblx0XHRpZiAoY3VycmVudC52YWx1ZSA9PT0gaXRlbS5vZmYpIHtcclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGN1cnJlbnQudmFsdWUgPT09IGN1cnJlbnREcmF3YWJsZSkge1xyXG5cdFx0XHRTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgaXRlbS5vZmYsIDAsIDApO1xyXG5cdFx0XHRpZiAoaG9vaykge1xyXG5cdFx0XHRcdGZvcihsZXQgaT0wOyBpIDwgaG9vay5kcmF3YWJsZXM/Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRjb25zdCBob29rSXRlbSA9IGhvb2suZHJhd2FibGVzW2ldO1xyXG5cdFx0XHRcdFx0U2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaG9va0l0ZW0uY29tcG9uZW50LCBob29rSXRlbS52YXJpYW50LCBob29rSXRlbS50ZXh0dXJlLCAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Y2IodHJ1ZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHNldERyYXdhYmxlKHBlZCwgY3VycmVudCk7XHJcblx0XHRcdGZvcihsZXQgaT0wOyBpIDwgaG9va0RhdGE/Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0c2V0RHJhd2FibGUocGVkLCBob29rRGF0YVtpXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2F2ZU91dGZpdCwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlT3V0Zml0JywgZGF0YSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZGVsZXRlT3V0Zml0LCBhc3luYyAoe2lkfSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpkZWxldGVPdXRmaXQnLCBpZCk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUucmVuYW1lT3V0Zml0LCBhc3luYyAoZGF0YTogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlbmFtZU91dGZpdCcsIGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnVzZU91dGZpdCwgYXN5bmMgKG91dGZpdDogVE91dGZpdERhdGEsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldFBlZENsb3RoZXMocGVkLCBvdXRmaXQpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5pbXBvcnRPdXRmaXQsIGFzeW5jICh7IGlkLCBvdXRmaXROYW1lIH0sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjppbXBvcnRPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGlkLCBvdXRmaXROYW1lKTtcclxuXHRjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5mZXRjaE91dGZpdCwgYXN5bmMgKHsgaWQgfSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpmZXRjaE91dGZpdCcsIGlkKTtcclxuXHRjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5pdGVtT3V0Zml0LCBhc3luYyAoZGF0YToge291dGZpdDogVE91dGZpdERhdGEsIGxhYmVsOiBzdHJpbmd9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOml0ZW1PdXRmaXQnLCBkYXRhKTtcclxuXHRjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcbm9uTmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjp1c2VPdXRmaUl0ZW0nLCAob3V0Zml0OiBUT3V0Zml0RGF0YSkgPT4ge1xyXG5cdHNldFBlZENsb3RoZXMocGVkLCBvdXRmaXQpO1xyXG59KSIsICJpbXBvcnQgeyBnZXRGcmFtZXdvcmtJRCwgcmVxdWVzdExvY2FsZSwgc2VuZE5VSUV2ZW50LCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIHVwZGF0ZVBlZCwgcGVkLCBnZXRQbGF5ZXJEYXRhLCBnZXRKb2JJbmZvLCBnZXRQbGF5ZXJHZW5kZXJNb2RlbCB9IGZyb20gXCJAdXRpbHNcIlxyXG5pbXBvcnQgeyBzdGFydENhbWVyYSwgc3RvcENhbWVyYSB9IGZyb20gXCIuL2NhbWVyYVwiXHJcbmltcG9ydCB0eXBlIHsgVEFwcGVhcmFuY2Vab25lLCBUTWVudVR5cGVzIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tIFwiQHR5cGluZ3Mvb3V0Zml0c1wiXHJcbmltcG9ydCB7IFNlbmQgfSBmcm9tIFwiQGV2ZW50c1wiXHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldFRhdHRvb0RhdGEgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL2dldHRlcnNcIlxyXG5pbXBvcnQgXCIuL2hhbmRsZXJzXCJcclxuaW1wb3J0IHsgc2V0TW9kZWwgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxyXG5cclxuY29uc3QgY29uZmlnID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlXHJcbmxldCBhcm1vdXIgPSAwXHJcbmxldCBvcGVuID0gZmFsc2VcclxuXHJcbmxldCByZXNvbHZlUHJvbWlzZSA9IG51bGw7XHJcbmxldCBwcm9taXNlID0gbnVsbDtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuTWVudSh6b25lOiBUQXBwZWFyYW5jZVpvbmUgfCBUQXBwZWFyYW5jZVpvbmVbJ3R5cGUnXSwgY3JlYXRpb246IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgaWYgKHpvbmUgPT09IG51bGwgfHwgb3Blbikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcGVkSGFuZGxlID0gUGxheWVyUGVkSWQoKVxyXG4gICAgY29uc3QgY29uZmlnTWVudXMgPSBjb25maWcubWVudXMoKVxyXG5cclxuICAgIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHpvbmUgPT09ICdzdHJpbmcnXHJcblxyXG4gICAgY29uc3QgdHlwZSA9IGlzU3RyaW5nID8gem9uZSA6IHpvbmUudHlwZVxyXG5cclxuICAgIGNvbnN0IG1lbnUgPSBjb25maWdNZW51c1t0eXBlXVxyXG4gICAgaWYgKCFtZW51KSByZXR1cm5cclxuXHJcbiAgICB1cGRhdGVQZWQocGVkSGFuZGxlKVxyXG5cclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKClcclxuICAgIGNvbnN0IHRhYnMgPSBtZW51LnRhYnNcclxuICAgIGxldCBhbGxvd0V4aXQgPSBjcmVhdGlvbiA/IGZhbHNlIDogbWVudS5hbGxvd0V4aXRcclxuXHJcbiAgICBhcm1vdXIgPSBHZXRQZWRBcm1vdXIocGVkSGFuZGxlKVxyXG5cclxuICAgIGxldCBvdXRmaXRzID0gW11cclxuXHJcbiAgICBjb25zdCBoYXNPdXRmaXRUYWIgPSB0YWJzLmluY2x1ZGVzKCdvdXRmaXRzJylcclxuICAgIGlmIChoYXNPdXRmaXRUYWIpIG91dGZpdHMgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8T3V0Zml0W10+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRPdXRmaXRzJywgZnJhbWV3b3JrZElkKSBhcyBPdXRmaXRbXVxyXG5cclxuICAgIGxldCBtb2RlbHMgPSBbXVxyXG5cclxuICAgIGNvbnN0IGhhc0hlcml0YWdlVGFiID0gdGFicy5pbmNsdWRlcygnaGVyaXRhZ2UnKVxyXG4gICAgaWYgKGhhc0hlcml0YWdlVGFiKSB7XHJcbiAgICAgICAgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaGFzVGF0dG9vVGFiID0gdGFicy5pbmNsdWRlcygndGF0dG9vcycpXHJcbiAgICBsZXQgdGF0dG9vc1xyXG4gICAgaWYgKGhhc1RhdHRvb1RhYikge1xyXG4gICAgICAgIHRhdHRvb3MgPSBnZXRUYXR0b29EYXRhKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBibGFja2xpc3QgPSBnZXRCbGFja2xpc3Qoem9uZSlcclxuXHJcbiAgICBpZiAoY3JlYXRpb24pIHtcclxuICAgICAgICBjb25zdCBtb2RlbCA9IEdldEhhc2hLZXkoZ2V0UGxheWVyR2VuZGVyTW9kZWwoKSk7XHJcbiAgICAgICAgcGVkSGFuZGxlID0gYXdhaXQgc2V0TW9kZWwocGVkSGFuZGxlLCBtb2RlbCk7XHJcbiAgICAgICAgZW1pdE5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2V0cm91dGluZ2J1Y2tldCcpXHJcbiAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHVwZGF0ZVBlZChwZWRIYW5kbGUpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkSGFuZGxlKVxyXG5cclxuICAgIHN0YXJ0Q2FtZXJhKClcclxuXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC5kYXRhLCB7XHJcbiAgICAgICAgdGFicyxcclxuICAgICAgICBhcHBlYXJhbmNlLFxyXG4gICAgICAgIGJsYWNrbGlzdCxcclxuICAgICAgICB0YXR0b29zLFxyXG4gICAgICAgIG91dGZpdHMsXHJcbiAgICAgICAgbW9kZWxzLFxyXG4gICAgICAgIGFsbG93RXhpdCxcclxuICAgICAgICBqb2I6IGdldEpvYkluZm8oKSxcclxuICAgICAgICBsb2NhbGU6IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpXHJcbiAgICB9KVxyXG5cclxuICAgIFNldE51aUZvY3VzKHRydWUsIHRydWUpXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC52aXNpYmxlLCB0cnVlKVxyXG5cclxuICAgIG9wZW4gPSB0cnVlXHJcblxyXG4gICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmhpZGVIdWQodHJ1ZSlcclxuXHJcbiAgICBpZiAocHJvbWlzZSkge1xyXG4gICAgICAgIGF3YWl0IHByb21pc2VcclxuICAgICAgICBlbWl0TmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZXNldHJvdXRpbmdidWNrZXQnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm9taXNlID0gbnVsbDtcclxuICAgIHJlc29sdmVQcm9taXNlID0gbnVsbDtcclxuICAgIHJldHVybiB0cnVlXHJcbn1cclxuZXhwb3J0cygnT3Blbk1lbnUnLCBvcGVuTWVudSlcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgnYXBwZWFyYW5jZScsIGFzeW5jIChfLCBhcmdzOiBzdHJpbmdbXSkgPT4ge1xyXG4gICAgY29uc3QgdHlwZSA9IGFyZ3NbMF1cclxuICAgIGlmICghdHlwZSkge1xyXG4gICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24oKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCB6b25lID0gdHlwZS50b0xvd2VyQ2FzZSgpIGFzIFRNZW51VHlwZXNcclxuICAgICAgICBvcGVuTWVudSh6b25lKVxyXG4gICAgfVxyXG59LCB0cnVlKVxyXG5cclxuXHJcbmZ1bmN0aW9uIGdldEJsYWNrbGlzdCh6b25lOiBUQXBwZWFyYW5jZVpvbmUgfCBzdHJpbmcpIHtcclxuICAgIGNvbnN0IHtncm91cFR5cGVzLCBiYXNlfSA9IGNvbmZpZy5ibGFja2xpc3QoKVxyXG5cclxuICAgIGlmICh0eXBlb2Ygem9uZSA9PT0gJ3N0cmluZycpIHJldHVybiBiYXNlXHJcblxyXG4gICAgaWYgKCFncm91cFR5cGVzKSByZXR1cm4gYmFzZVxyXG5cclxuICAgIGxldCBibGFja2xpc3QgPSB7Li4uYmFzZX1cclxuXHJcbiAgICBjb25zdCBwbGF5ZXJEYXRhID0gZ2V0UGxheWVyRGF0YSgpXHJcblxyXG5cclxuICAgIGZvciAoY29uc3QgdHlwZSBpbiBncm91cFR5cGVzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBzID0gZ3JvdXBUeXBlc1t0eXBlXVxyXG4gICAgICAgIGZvciAoY29uc3QgZ3JvdXAgaW4gZ3JvdXBzKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgc2tpcDogYm9vbGVhbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodHlwZSA9PSAnam9icycgJiYgem9uZS5qb2JzKSB7XHJcbiAgICAgICAgICAgICAgICBza2lwID0gem9uZS5qb2JzLmluY2x1ZGVzKHBsYXllckRhdGEuam9iLm5hbWUpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09ICdnYW5ncycgJiYgem9uZS5nYW5ncykge1xyXG4gICAgICAgICAgICAgICAgc2tpcCA9IHpvbmUuZ2FuZ3MuaW5jbHVkZXMocGxheWVyRGF0YS5nYW5nLm5hbWUpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghc2tpcCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ3JvdXBCbGFja2xpc3QgPSBncm91cHNbZ3JvdXBdXHJcbiAgICAgICAgICAgICAgICBibGFja2xpc3QgPSBPYmplY3QuYXNzaWduKHt9LCBibGFja2xpc3QsIGdyb3VwQmxhY2tsaXN0LCB7XHJcbiAgICAgICAgICAgICAgICAgIGRyYXdhYmxlczogT2JqZWN0LmFzc2lnbih7fSwgYmxhY2tsaXN0LmRyYXdhYmxlcywgZ3JvdXBCbGFja2xpc3QuZHJhd2FibGVzKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYmxhY2tsaXN0XHJcblxyXG4gICAgLy8gcmV0dXJuIGJsYWNrbGlzdFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VNZW51KCkge1xyXG4gICAgU2V0UGVkQXJtb3VyKHBlZCwgYXJtb3VyKVxyXG5cclxuICAgIHN0b3BDYW1lcmEoKVxyXG4gICAgU2V0TnVpRm9jdXMoZmFsc2UsIGZhbHNlKVxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQudmlzaWJsZSwgZmFsc2UpXHJcblxyXG5cclxuICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5oaWRlSHVkKGZhbHNlKVxyXG5cclxuICAgIGlmIChyZXNvbHZlUHJvbWlzZSkge1xyXG4gICAgICAgIHJlc29sdmVQcm9taXNlKCk7XHJcbiAgICB9XHJcbiAgICBvcGVuID0gZmFsc2VcclxufVxyXG4iLCAiXG5pbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcbmltcG9ydCB7IHNldFBlZEFwcGVhcmFuY2UgfSBmcm9tIFwiLi4vYXBwZWFyYW5jZS9zZXR0ZXJzXCJcbmltcG9ydCB7IG9wZW5NZW51IH0gZnJvbSBcIi4uL21lbnVcIlxuXG5leHBvcnQgZnVuY3Rpb24gUUJCcmlkZ2UoKSB7XG4gICAgb25OZXQoJ3FiLWNsb3RoaW5nOmNsaWVudDpsb2FkUGxheWVyQ2xvdGhpbmcnLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGF3YWl0IHNldFBlZEFwcGVhcmFuY2UocGVkLCBhcHBlYXJhbmNlKVxuICAgIH0pXG5cbiAgICBvbk5ldCgncWItY2xvdGhlczpjbGllbnQ6Q3JlYXRlRmlyc3RDaGFyYWN0ZXInLCAoKSA9PiB7XG4gICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24oKVxuICAgIH0pXG5cbiAgICBvbk5ldCgncWItY2xvdGhpbmc6Y2xpZW50Om9wZW5PdXRmaXRNZW51JywgKCkgPT4ge1xuICAgICAgICBvcGVuTWVudSh7IHR5cGU6IFwib3V0Zml0c1wiLCBjb29yZHM6IFswLCAwLCAwLCAwXSB9KSAgXG4gICAgfSlcbn0iLCAiXG5pbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcbmltcG9ydCB7IHNldFBlZEFwcGVhcmFuY2UsIHNldFBsYXllclBlZEFwcGVhcmFuY2UgfSBmcm9tIFwiLi4vYXBwZWFyYW5jZS9zZXR0ZXJzXCJcbmltcG9ydCB7IGdldEZyYW1ld29ya0lELCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2sgfSBmcm9tIFwiQHV0aWxzXCJcblxuZXhwb3J0IGZ1bmN0aW9uIEVTWEJyaWRnZSgpIHtcbiAgICBsZXQgZmlyc3RTcGF3biA9IGZhbHNlXG5cbiAgICBvbihcImVzeF9za2luOnJlc2V0Rmlyc3RTcGF3blwiLCAoKSA9PiB7XG4gICAgICAgIGZpcnN0U3Bhd24gPSB0cnVlXG4gICAgfSk7XG5cbiAgICBvbihcImVzeF9za2luOnBsYXllclJlZ2lzdGVyZWRcIiwgKCkgPT4ge1xuICAgICAgICBpZihmaXJzdFNwYXduKVxuICAgICAgICAgICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkluaXRpYWxDcmVhdGlvbigpXG4gICAgfSk7XG5cbiAgICBvbk5ldCgnc2tpbmNoYW5nZXI6bG9hZFNraW4yJywgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoIWFwcGVhcmFuY2UubW9kZWwpIGFwcGVhcmFuY2UubW9kZWwgPSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKTtcbiAgICAgICAgYXdhaXQgc2V0UGVkQXBwZWFyYW5jZShwZWQsIGFwcGVhcmFuY2UpXG4gICAgfSk7XG5cbiAgICBvbk5ldCgnc2tpbmNoYW5nZXI6Z2V0U2tpbicsIGFzeW5jIChjYjogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGZyYW1ld29ya0lEID0gYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxuICAgICAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxuICAgICAgICBjYihhcHBlYXJhbmNlKVxuICAgIH0pXG5cbiAgICBvbk5ldCgnc2tpbmNoYW5nZXI6bG9hZFNraW4nLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBhbnkpID0+IHtcbiAgICAgICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxuICAgICAgICBpZiAoY2IpIGNiKClcbiAgICB9KVxuXG4gICAgb25OZXQoJ2VzeF9za2luOm9wZW5TYXZlYWJsZU1lbnUnLCBhc3luYyAob25TdWJtaXQ6IGFueSkgPT4ge1xuICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKG9uU3VibWl0KVxuICAgIH0pXG59IiwgImltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIjtcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldERyYXdhYmxlcywgZ2V0UHJvcHMgfSBmcm9tIFwiLi4vYXBwZWFyYW5jZS9nZXR0ZXJzXCI7XG5pbXBvcnQgeyBzZXREcmF3YWJsZSwgc2V0TW9kZWwsIHNldFBlZEFwcGVhcmFuY2UsIHNldFBlZFRhdHRvb3MsIHNldFByb3AgfSBmcm9tIFwiLi4vYXBwZWFyYW5jZS9zZXR0ZXJzXCI7XG5pbXBvcnQgeyBUVGF0dG9vIH0gZnJvbSBcIkB0eXBpbmdzL3RhdHRvb3NcIjtcbmltcG9ydCB7IHBlZCwgdXBkYXRlUGVkIH0gZnJvbSBcIkB1dGlsc1wiO1xuXG5mdW5jdGlvbiBleHBvcnRIYW5kbGVyKG5hbWU6IHN0cmluZywgY2I6IGFueSkge1xuICAgIG9uKCdfX2NmeF9leHBvcnRfaWxsZW5pdW0tYXBwZWFyYW5jZV8nICsgbmFtZSwgKHNldENCOiBhbnkpID0+IHtcbiAgICAgICAgc2V0Q0IoY2IpO1xuICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbGxlbml1bUNvbXBhdCgpIHtcbiAgICBleHBvcnRIYW5kbGVyKCdzdGFydFBsYXllckN1c3RvbWl6YXRpb24nLCAoKSA9PiB7XG4gICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24oKVxuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkTW9kZWwnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIEdldEVudGl0eU1vZGVsKHBlZClcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZENvbXBvbmVudHMnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgZHJhd2FibGVzOiBhbnkgPSBnZXREcmF3YWJsZXMocGVkKVswXTtcbiAgICAgICAgbGV0IG5ld2RyYXdhYmxlID0gW107XG4gICAgICAgIGZvciAoY29uc3QgaWQgb2YgZHJhd2FibGVzKSB7XG4gICAgICAgICAgICBjb25zdCBkcmF3YWJsZSA9IGRyYXdhYmxlc1tpZF07XG4gICAgICAgICAgICBuZXdkcmF3YWJsZS5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRfaWQ6IGRyYXdhYmxlLmluZGV4LFxuICAgICAgICAgICAgICAgIGRyYXdhYmxlOiBkcmF3YWJsZS52YWx1ZSxcbiAgICAgICAgICAgICAgICB0ZXh0dXJlOiBkcmF3YWJsZS50ZXh0dXJlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRQcm9wcycsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBwcm9wczogYW55ID0gIGdldFByb3BzKHBlZClbMF07XG4gICAgICAgIGxldCBuZXdQcm9wcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIHByb3BzKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9wID0gcHJvcHNbaWRdO1xuICAgICAgICAgICAgbmV3UHJvcHMucHVzaCh7XG4gICAgICAgICAgICAgICAgcHJvcF9pZDogcHJvcC5pbmRleCxcbiAgICAgICAgICAgICAgICBkcmF3YWJsZTogcHJvcC52YWx1ZSxcbiAgICAgICAgICAgICAgICB0ZXh0dXJlOiBwcm9wLnRleHR1cmVcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEhlYWRCbGVuZCcsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgICAgIC8vcmV0dXJuIGdldEhlYWRCbGVuZERhdGEocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEZhY2VGZWF0dXJlcycsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgICAgIC8vcmV0dXJuIGdldEhlYWRTdHJ1Y3R1cmUocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEhlYWRPdmVybGF5cycsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgICAgIC8vcmV0dXJuIGdldEhlYWRPdmVybGF5KHBlZCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRIYWlyJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIC8vcmV0dXJuIGdldEhhaXIocGVkKTtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkQXBwZWFyYW5jZScsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0QXBwZWFyYW5jZShwZWQpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGxheWVyTW9kZWwnLCAobW9kZWw6IG51bWJlcikgPT4ge1xuICAgICAgICB1cGRhdGVQZWQoUGxheWVyUGVkSWQoKSlcbiAgICAgICAgc2V0TW9kZWwocGVkLCBtb2RlbCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRIZWFkQmxlbmQnLCAocGVkOiBudW1iZXIsIGJsZW5kOiBhbnkpID0+IHtcbiAgICAgICAgLy9zZXRIZWFkQmxlbmQocGVkLCBibGVuZCk7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZEZhY2VGZWF0dXJlcycsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkSGVhZE92ZXJsYXlzJywgKHBlZDogbnVtYmVyLCBvdmVybGF5OiBhbnkpID0+IHtcbiAgICAgICAgLy9zZXRIZWFkT3ZlcmxheShwZWQsIG92ZXJsYXkpO1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRIYWlyJywgYXN5bmMgKHBlZDogbnVtYmVyLCBoYWlyOiBhbnksIHRhdHRvbzogYW55KSA9PiB7XG4gICAgICAgIC8vc2V0UGVkSGFpckNvbG9ycyhwZWQsIGhhaXIpO1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRFeWVDb2xvcicsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkQ29tcG9uZW50JywgKHBlZDogbnVtYmVyLCBkcmF3YWJsZTogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld0RyYXdhYmxlID0ge1xuICAgICAgICAgICAgaW5kZXg6IGRyYXdhYmxlLmNvbXBvbmVudF9pZCxcbiAgICAgICAgICAgIHZhbHVlOiBkcmF3YWJsZS5kcmF3YWJsZSxcbiAgICAgICAgICAgIHRleHR1cmU6IGRyYXdhYmxlLnRleHR1cmVcbiAgICAgICAgfVxuICAgICAgICBzZXREcmF3YWJsZShwZWQsIG5ld0RyYXdhYmxlKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZENvbXBvbmVudHMnLCAocGVkOiBudW1iZXIsIGNvbXBvbmVudHM6IGFueSkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IGNvbXBvbmVudCBvZiBjb21wb25lbnRzKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdEcmF3YWJsZSA9IHtcbiAgICAgICAgICAgICAgICBpbmRleDogY29tcG9uZW50LmNvbXBvbmVudF9pZCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogY29tcG9uZW50LmRyYXdhYmxlLFxuICAgICAgICAgICAgICAgIHRleHR1cmU6IGNvbXBvbmVudC50ZXh0dXJlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXREcmF3YWJsZShwZWQsIG5ld0RyYXdhYmxlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkUHJvcCcsIChwZWQ6IG51bWJlciwgcHJvcDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1Byb3AgPSB7XG4gICAgICAgICAgICBpbmRleDogcHJvcC5wcm9wX2lkLFxuICAgICAgICAgICAgdmFsdWU6IHByb3AuZHJhd2FibGUsXG4gICAgICAgICAgICB0ZXh0dXJlOiBwcm9wLnRleHR1cmVcbiAgICAgICAgfVxuICAgICAgICBzZXRQcm9wKHBlZCwgbmV3UHJvcCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRQcm9wcycsIChwZWQ6IG51bWJlciwgcHJvcHM6IGFueSkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHByb3Agb2YgcHJvcHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Byb3AgPSB7XG4gICAgICAgICAgICAgICAgaW5kZXg6IHByb3AucHJvcF9pZCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcC5kcmF3YWJsZSxcbiAgICAgICAgICAgICAgICB0ZXh0dXJlOiBwcm9wLnRleHR1cmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldFByb3AocGVkLCBuZXdQcm9wKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gZXhwb3J0SGFuZGxlcignc2V0UGxheWVyQXBwZWFyYW5jZScsIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSkgPT4ge1xuICAgIC8vICAgICByZXR1cm4gY29uc29sZS53YXJuKCdOZWVkIHRvIGJlIGltcGxlbWVudGVkJyk7XG4gICAgLy8gfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRBcHBlYXJhbmNlJywgKHBlZDogbnVtYmVyLCBhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSkgPT4ge1xuICAgICAgICBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZFRhdHRvb3MnLCAocGVkOiBudW1iZXIsIHRhdHRvb3M6IFRUYXR0b29bXSkgPT4ge1xuICAgICAgICBzZXRQZWRUYXR0b29zKHBlZCwgdGF0dG9vcylcbiAgICB9KTtcbn0iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRBcHBlYXJhbmNlWm9uZSB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IHsgb3Blbk1lbnUgfSBmcm9tIFwiLi9tZW51XCJcclxuaW1wb3J0IHsgc2V0UGxheWVyUGVkQXBwZWFyYW5jZSB9IGZyb20gXCIuL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXHJcbmltcG9ydCB7IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaywgZ2V0RnJhbWV3b3JrSUQsIERlbGF5LCBibF9icmlkZ2UsIHBlZCwgZGVsYXksIGZvcm1hdCwgdXBkYXRlUGVkIH0gZnJvbSBcIkB1dGlsc1wiXHJcbmltcG9ydCB7IFFCQnJpZGdlIH0gZnJvbSBcIi4vYnJpZGdlL3FiXCJcclxuaW1wb3J0IHsgRVNYQnJpZGdlIH0gZnJvbSBcIi4vYnJpZGdlL2VzeFwiXHJcbmltcG9ydCB7IGlsbGVuaXVtQ29tcGF0IH0gZnJvbSBcIi4vY29tcGF0L2lsbGVuaXVtXCJcclxuXHJcbmV4cG9ydHMoJ1NldFBsYXllclBlZEFwcGVhcmFuY2UnLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UgfCBzdHJpbmcpID0+IHtcclxuICAgIGxldCByZXNvbHZlZEFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlO1xyXG4gICAgXHJcbiAgICBpZiAoIWFwcGVhcmFuY2UgfHwgdHlwZW9mIGFwcGVhcmFuY2UgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgY29uc3QgZnJhbWV3b3JrSUQ6IHN0cmluZyA9IGFwcGVhcmFuY2UgfHwgYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKTtcclxuICAgICAgICByZXNvbHZlZEFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpIGFzIFRBcHBlYXJhbmNlO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYXBwZWFyYW5jZSA9PT0gJ29iamVjdCcpIHJlc29sdmVkQXBwZWFyYW5jZSA9IGFwcGVhcmFuY2U7XHJcbiAgICBcclxuICAgIGlmICghcmVzb2x2ZWRBcHBlYXJhbmNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyB2YWxpZCBhcHBlYXJhbmNlIGZvdW5kJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UocmVzb2x2ZWRBcHBlYXJhbmNlKTtcclxufSk7XHJcblxyXG5leHBvcnRzKCdHZXRQbGF5ZXJQZWRBcHBlYXJhbmNlJywgYXN5bmMgKGZyYW1ld29ya0lEOiBzdHJpbmcpID0+IHtcclxuICAgIGZyYW1ld29ya0lEID0gZnJhbWV3b3JrSUQgfHwgYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgcmV0dXJuIGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxufSlcclxuXHJcbmV4cG9ydHMoJ0luaXRpYWxDcmVhdGlvbicsIGFzeW5jIChjYj86IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICAvLyBUaGUgZmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgdHlwZSBvZiBUQXBwZWFyYW5jZVpvbmUgbWVhbmluZyBpdCBuZWVkcyBhIGNvb3JkcyBwcm9wZXJ0eSwgYnV0IGluIHRoaXMgY2FzZSBpdCdzIG5vdCB1c2VkXHJcbiAgICBhd2FpdCBvcGVuTWVudSh7IHR5cGU6IFwiYXBwZWFyYW5jZVwiLCBjb29yZHM6IFswLCAwLCAwLCAwXSB9LCB0cnVlKVxyXG4gICAgaWYgKGNiKSBjYigpXHJcbn0pXHJcblxyXG5vbignYmxfYXBwZWFyYW5jZTpjbGllbnQ6dXNlWm9uZScsICh6b25lOiBUQXBwZWFyYW5jZVpvbmUpID0+IHtcclxuICAgIG9wZW5NZW51KHpvbmUpXHJcbn0pXHJcblxyXG5vbk5ldCgnYmxfYnJpZGdlOmNsaWVudDpwbGF5ZXJMb2FkZWQnLCBhc3luYyAoKSA9PiB7XHJcbiAgICB3aGlsZSAoIWJsX2JyaWRnZS5jb3JlKCkucGxheWVyTG9hZGVkKCkpIHtcclxuICAgICAgICBhd2FpdCBEZWxheSgxMDApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgaWYgKCFhcHBlYXJhbmNlKSByZXR1cm47XHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcbn0pXHJcblxyXG5vbk5ldCgnb25SZXNvdXJjZVN0YXJ0JywgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcpID0+IHtcclxuICAgIGlmIChyZXNvdXJjZSA9PT0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpICYmIGJsX2JyaWRnZS5jb3JlKCkucGxheWVyTG9hZGVkKCkpIHtcclxuICAgICAgICBjb25zdCBmcmFtZXdvcmtJRCA9IGF3YWl0IGdldEZyYW1ld29ya0lEKClcclxuICAgICAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgICAgIGlmICghYXBwZWFyYW5jZSkgcmV0dXJuO1xyXG4gICAgICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSlcclxuICAgIH1cclxufSlcclxuXHJcbmNvbnN0IGZyYW1ld29ya05hbWUgPSBibF9icmlkZ2UuZ2V0RnJhbWV3b3JrKCdjb3JlJylcclxuY29uc3QgY29yZSA9IGZvcm1hdChHZXRDb252YXIoJ2JsOmZyYW1ld29yaycsICdxYicpKVxyXG5cclxuaWYgKGNvcmUgPT0gJ3FiJyB8fCBjb3JlID09ICdxYngnICYmIEdldFJlc291cmNlU3RhdGUoZnJhbWV3b3JrTmFtZSkgPT0gJ3N0YXJ0ZWQnKSB7XHJcbiAgICBRQkJyaWRnZSgpO1xyXG59IGVsc2UgaWYgKGNvcmUgPT0gJ2VzeCcgJiYgR2V0UmVzb3VyY2VTdGF0ZShmcmFtZXdvcmtOYW1lKSA9PSAnc3RhcnRlZCcpIHtcclxuICAgIEVTWEJyaWRnZSgpO1xyXG59XHJcblxyXG5pbGxlbml1bUNvbXBhdCgpO1xyXG5cclxuUmVnaXN0ZXJDb21tYW5kKCdyZWxvYWRza2luJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICBjb25zdCBoZWFsdGggPSBHZXRFbnRpdHlIZWFsdGgocGVkKTtcclxuICAgIGNvbnN0IG1heGhlYWx0aCA9IEdldEVudGl0eU1heEhlYWx0aChwZWQpO1xyXG4gICAgY29uc3QgYXJtb3IgPSBHZXRQZWRBcm1vdXIocGVkKTtcclxuXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgaWYgKCFhcHBlYXJhbmNlKSByZXR1cm47XHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcblxyXG4gICAgU2V0UGVkTWF4SGVhbHRoKHBlZCwgbWF4aGVhbHRoKVxyXG4gICAgZGVsYXkoMTAwMCkgXHJcbiAgICBTZXRFbnRpdHlIZWFsdGgocGVkLCBoZWFsdGgpXHJcbiAgICBTZXRQZWRBcm1vdXIocGVkLCBhcm1vcilcclxufSwgZmFsc2UpXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7QUFBTyxJQUFJLE1BQU07QUFFVixJQUFNLFlBQVksd0JBQUMsY0FBc0I7QUFDNUMsUUFBTTtBQUNWLEdBRnlCO0FBYWxCLElBQU0sZUFBZSx3QkFBQyxRQUFnQixTQUFjO0FBQ3ZELGlCQUFlO0FBQUEsSUFD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RCxJQUFJLFFBQVEsUUFBUSxRQUFRLFNBQVMsaUJBQWlCLGFBQWEsS0FBSyxXQUFXO0FBQy9FLFdBQVM7QUFDYixXQUFXLFFBQVEsU0FBUyxpQkFBaUIsYUFBYSxLQUFLLFdBQVc7QUFDdEUsWUFBVTtBQUNkO0FBRUEsZUFBZTtBQUVmLGdCQUFnQixjQUFjLFlBQVk7QUFDdEMsUUFBTSxjQUFjLE1BQU0sZUFBZTtBQUN6QyxRQUFNLFNBQVMsZ0JBQWdCLEdBQUc7QUFDbEMsUUFBTSxZQUFZLG1CQUFtQixHQUFHO0FBQ3hDLFFBQU0sUUFBUSxhQUFhLEdBQUc7QUFFOUIsUUFBTSxhQUFhLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQzdHLE1BQUksQ0FBQztBQUFZO0FBQ2pCLFFBQU0sdUJBQXVCLFVBQVU7QUFFdkMsa0JBQWdCLEtBQUssU0FBUztBQUM5QixRQUFNLEdBQUk7QUFDVixrQkFBZ0IsS0FBSyxNQUFNO0FBQzNCLGVBQWEsS0FBSyxLQUFLO0FBQzNCLEdBQUcsS0FBSzsiLAogICJuYW1lcyI6IFsiZGVsYXkiLCAicGVkIiwgIngiLCAieSIsICJ6IiwgImNvbmZpZyIsICJwZWQiLCAicGVkIiwgInBlZCJdCn0K
