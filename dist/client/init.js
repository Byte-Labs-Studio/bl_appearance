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
    off: 15
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
  const appearance = await getAppearance(pedHandle);
  if (creation) {
    const model = GetHashKey(getPlayerGenderModel());
    await setModel(model);
    appearance.model = model;
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
    return getDrawables(ped2);
  });
  exportHandler("getPedProps", (ped2) => {
    return getProps(ped2);
  });
  exportHandler("getPedHeadBlend", (ped2) => {
    return getHeadBlendData(ped2);
  });
  exportHandler("getPedFaceFeatures", (ped2) => {
    return getHeadStructure(ped2);
  });
  exportHandler("getPedHeadOverlays", (ped2) => {
    return getHeadOverlay(ped2);
  });
  exportHandler("getPedHair", (ped2) => {
    return getHair(ped2);
  });
  exportHandler("getPedAppearance", (ped2) => {
    return getAppearance(ped2);
  });
  exportHandler("setPlayerModel", (model) => {
    setModel(model);
  });
  exportHandler("setPedHeadBlend", (ped2, blend) => {
    setHeadBlend(ped2, blend);
  });
  exportHandler("setPedFaceFeatures", () => {
    return console.warn("Xirvin will implement");
  });
  exportHandler("setPedHeadOverlays", (ped2, overlay) => {
    setHeadOverlay(ped2, overlay);
  });
  exportHandler("setPedHair", async (ped2, hair, tattoo) => {
    await setPedHairColors(ped2, hair);
  });
  exportHandler("setPedEyeColor", () => {
    return console.warn("Xirvin will implement");
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
    setDrawable(ped2, newProp);
  });
  exportHandler("setPedProps", (ped2, props) => {
    return console.warn("Xirvin will implement");
  });
  exportHandler("setPlayerAppearance", () => {
    return console.warn("Need to be implemented");
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
RegisterCommand("openMenu", async () => {
  exports.bl_appearance.InitialCreation();
}, false);
exports("SetPedAppearance", async (ped2, appearance) => {
  await setPedAppearance(ped2, appearance);
});
exports("SetPlayerPedAppearance", async (frameworkID) => {
  const appearance = await triggerServerCallback("bl_appearance:server:getAppearance", frameworkID);
  if (!appearance) {
    throw new Error("No appearance found");
  }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvcWIudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvZXN4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvY29tcGF0L2lsbGVuaXVtLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvaW5pdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCBwZWQgPSAwXHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlUGVkID0gKHBlZEhhbmRsZTogbnVtYmVyKSA9PiB7XHJcbiAgICBwZWQgPSBwZWRIYW5kbGVcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlYnVnZGF0YSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGEsIChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0sIDIpKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2VuZE5VSUV2ZW50ID0gKGFjdGlvbjogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcclxuICAgIFNlbmROVUlNZXNzYWdlKHtcclxuICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TW9kZWwgPSBhc3luYyAobW9kZWw6IHN0cmluZyB8IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiA9PiB7XHJcbiAgICBsZXQgbW9kZWxIYXNoOiBudW1iZXIgPSB0eXBlb2YgbW9kZWwgPT09ICdudW1iZXInID8gbW9kZWwgOiBHZXRIYXNoS2V5KG1vZGVsKVxyXG5cclxuICAgIGlmICghSXNNb2RlbFZhbGlkKG1vZGVsSGFzaCkpIHtcclxuICAgICAgICBleHBvcnRzLmJsX2JyaWRnZS5ub3RpZnkoKSh7XHJcbiAgICAgICAgICAgIHRpdGxlOiAnSW52YWxpZCBtb2RlbCEnLFxyXG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgICBkdXJhdGlvbjogMTAwMFxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgYXR0ZW1wdGVkIHRvIGxvYWQgaW52YWxpZCBtb2RlbCAnJHttb2RlbH0nYCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKEhhc01vZGVsTG9hZGVkKG1vZGVsSGFzaCkpIHJldHVybiBtb2RlbEhhc2hcclxuICAgIFxyXG4gICAgUmVxdWVzdE1vZGVsKG1vZGVsSGFzaCk7XHJcblxyXG4gICAgY29uc3Qgd2FpdEZvck1vZGVsTG9hZGVkID0gKCk6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgYXdhaXQgd2FpdEZvck1vZGVsTG9hZGVkKCk7XHJcblxyXG4gICAgcmV0dXJuIG1vZGVsSGFzaDtcclxufTtcclxuXHJcblxyXG4vL2NhbGxiYWNrXHJcbi8vaHR0cHM6Ly9naXRodWIuY29tL292ZXJleHRlbmRlZC9veF9saWIvYmxvYi9tYXN0ZXIvcGFja2FnZS9jbGllbnQvcmVzb3VyY2UvY2FsbGJhY2svaW5kZXgudHNcclxuXHJcbmNvbnN0IHJlc291cmNlTmFtZSA9IEdldEN1cnJlbnRSZXNvdXJjZU5hbWUoKVxyXG5jb25zdCBldmVudFRpbWVyczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xyXG5jb25zdCBhY3RpdmVFdmVudHM6IFJlY29yZDxzdHJpbmcsICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4gPSB7fTtcclxuXHJcbmZ1bmN0aW9uIGV2ZW50VGltZXIoZXZlbnROYW1lOiBzdHJpbmcsIGRlbGF5OiBudW1iZXIgfCBudWxsKSB7XHJcbiAgICBpZiAoZGVsYXkgJiYgZGVsYXkgPiAwKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBHZXRHYW1lVGltZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKChldmVudFRpbWVyc1tldmVudE5hbWVdIHx8IDApID4gY3VycmVudFRpbWUpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgZXZlbnRUaW1lcnNbZXZlbnROYW1lXSA9IGN1cnJlbnRUaW1lICsgZGVsYXk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbm9uTmV0KGBfYmxfY2JfJHtyZXNvdXJjZU5hbWV9YCwgKGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnkpID0+IHtcclxuICAgIGNvbnN0IHJlc29sdmUgPSBhY3RpdmVFdmVudHNba2V5XTtcclxuICAgIHJldHVybiByZXNvbHZlICYmIHJlc29sdmUoLi4uYXJncyk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUID0gdW5rbm93bj4oXHJcbiAgICBldmVudE5hbWU6IHN0cmluZywgLi4uYXJnczogYW55XHJcbik6IFByb21pc2U8VD4gfCB2b2lkIHtcclxuICAgIGlmICghZXZlbnRUaW1lcihldmVudE5hbWUsIDApKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBrZXk6IHN0cmluZztcclxuXHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuICAgIGVtaXROZXQoYF9ibF9jYl8ke2V2ZW50TmFtZX1gLCByZXNvdXJjZU5hbWUsIGtleSwgLi4uYXJncyk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgYWN0aXZlRXZlbnRzW2tleV0gPSByZXNvbHZlO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb25TZXJ2ZXJDYWxsYmFjayhldmVudE5hbWUsIGNiKSB7XHJcbiAgICBvbk5ldChgX2JsX2NiXyR7ZXZlbnROYW1lfWAsIGFzeW5jIChyZXNvdXJjZSwga2V5LCAuLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgbGV0IHJlc3BvbnNlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlID0gYXdhaXQgY2IoLi4uYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGhhbmRsaW5nIGNhbGxiYWNrIGV2ZW50ICR7ZXZlbnROYW1lfWApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgXjMke2Uuc3RhY2t9XjBgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZW1pdE5ldChgX2JsX2NiXyR7cmVzb3VyY2V9YCwga2V5LCByZXNwb25zZSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLy9sb2NhbGVcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TG9jYWxlID0gKHJlc291cmNlU2V0TmFtZTogc3RyaW5nKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICBjb25zdCBjaGVja1Jlc291cmNlRmlsZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKFJlcXVlc3RSZXNvdXJjZUZpbGVTZXQocmVzb3VyY2VTZXROYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudExhbiA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5jb25maWcoKS5sb2NhbGVcclxuICAgICAgICAgICAgICAgIGxldCBsb2NhbGVGaWxlQ29udGVudCA9IExvYWRSZXNvdXJjZUZpbGUocmVzb3VyY2VOYW1lLCBgbG9jYWxlLyR7Y3VycmVudExhbn0uanNvbmApO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbGVGaWxlQ29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y3VycmVudExhbn0uanNvbiBub3QgZm91bmQgaW4gbG9jYWxlLCBwbGVhc2UgdmVyaWZ5ISwgd2UgdXNlZCBlbmdsaXNoIGZvciBub3chYClcclxuICAgICAgICAgICAgICAgICAgICBsb2NhbGVGaWxlQ29udGVudCA9IExvYWRSZXNvdXJjZUZpbGUocmVzb3VyY2VOYW1lLCBgbG9jYWxlL2VuLmpzb25gKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShsb2NhbGVGaWxlQ29udGVudCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGNoZWNrUmVzb3VyY2VGaWxlLCAxMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNoZWNrUmVzb3VyY2VGaWxlKCk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGxvY2FsZSA9IGFzeW5jIChpZDogc3RyaW5nLCAuLi5hcmdzOiBzdHJpbmdbXSkgPT4ge1xyXG4gICAgY29uc3QgbG9jYWxlID0gYXdhaXQgcmVxdWVzdExvY2FsZSgnbG9jYWxlJyk7XHJcbiAgICBsZXQgYXJnSW5kZXggPSAwO1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IGxvY2FsZVtpZF0ucmVwbGFjZSgvJXMvZywgKG1hdGNoOiBzdHJpbmcpID0+IGFyZ0luZGV4IDwgYXJncy5sZW5ndGggPyBhcmdzW2FyZ0luZGV4XSA6IG1hdGNoKTtcclxuICAgIHJldHVybiByZXN1bHRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGJsX2JyaWRnZSA9IGV4cG9ydHMuYmxfYnJpZGdlXHJcblxyXG5leHBvcnQgY29uc3QgZ2V0UGxheWVyRGF0YSA9ICgpID0+IHtcclxuICAgIHJldHVybiBibF9icmlkZ2UuY29yZSgpLmdldFBsYXllckRhdGEoKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0RnJhbWV3b3JrSUQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBpZCA9IGdldFBsYXllckRhdGEoKS5jaWRcclxuICAgIHJldHVybiBpZFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0UGxheWVyR2VuZGVyTW9kZWwgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBnZW5kZXIgPSBnZXRQbGF5ZXJEYXRhKCkuZ2VuZGVyXHJcbiAgICByZXR1cm4gZ2VuZGVyID09PSAnbWFsZScgPyAnbXBfbV9mcmVlbW9kZV8wMScgOiAnbXBfZl9mcmVlbW9kZV8wMSdcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIERlbGF5KG1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChzdHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBpZiAoIXN0ci5pbmNsdWRlcyhcIidcIikpIHJldHVybiBzdHI7XHJcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLycvZywgXCJcIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRKb2JJbmZvKCk6IHsgbmFtZTogc3RyaW5nLCBpc0Jvc3M6IGJvb2xlYW4gfSB8IG51bGwge1xyXG4gICAgY29uc3Qgam9iID0gZ2V0UGxheWVyRGF0YSgpLmpvYlxyXG4gICAgcmV0dXJuIGpvYiA/IHsgbmFtZTogam9iLm5hbWUsIGlzQm9zczogam9iLmlzQm9zcyB9IDogbnVsbFxyXG59IiwgImltcG9ydCB7IENhbWVyYSwgVmVjdG9yMywgVENhbWVyYUJvbmVzIH0gZnJvbSAnQHR5cGluZ3MvY2FtZXJhJztcclxuaW1wb3J0IHsgZGVsYXksIHBlZCB9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IFJlY2VpdmUgfSBmcm9tICdAZXZlbnRzJztcclxuXHJcbmNvbnN0IFdIT0xFX0JPRFlfTUFYX0RJU1RBTkNFID0gMi4wO1xyXG5jb25zdCBERUZBVUxUX01BWF9ESVNUQU5DRSA9IDEuMDtcclxuXHJcbmxldCBydW5uaW5nOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBjYW1EaXN0YW5jZTogbnVtYmVyID0gMS44O1xyXG5sZXQgY2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGFuZ2xlWTogbnVtYmVyID0gMC4wO1xyXG5sZXQgYW5nbGVaOiBudW1iZXIgPSAwLjA7XHJcbmxldCB0YXJnZXRDb29yZHM6IFZlY3RvcjMgfCBudWxsID0gbnVsbDtcclxubGV0IG9sZENhbTogQ2FtZXJhIHwgbnVsbCA9IG51bGw7XHJcbmxldCBjaGFuZ2luZ0NhbTogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgbGFzdFg6IG51bWJlciA9IDA7XHJcbmxldCBjdXJyZW50Qm9uZToga2V5b2YgVENhbWVyYUJvbmVzID0gJ2hlYWQnO1xyXG5cclxuY29uc3QgQ2FtZXJhQm9uZXM6IFRDYW1lcmFCb25lcyA9IHtcclxuICAgIHdob2xlOiAwLFxyXG5cdGhlYWQ6IDMxMDg2LFxyXG5cdHRvcnNvOiAyNDgxOCxcclxuXHRsZWdzOiBbMTYzMzUsIDQ2MDc4XSxcclxuICAgIHNob2VzOiBbMTQyMDEsIDUyMzAxXSxcclxufTtcclxuXHJcbmNvbnN0IGNvcyA9IChkZWdyZWVzOiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG5cdHJldHVybiBNYXRoLmNvcygoZGVncmVlcyAqIE1hdGguUEkpIC8gMTgwKTtcclxufTtcclxuXHJcbmNvbnN0IHNpbiA9IChkZWdyZWVzOiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG5cdHJldHVybiBNYXRoLnNpbigoZGVncmVlcyAqIE1hdGguUEkpIC8gMTgwKTtcclxufTtcclxuXHJcbmNvbnN0IGdldEFuZ2xlcyA9ICgpOiBudW1iZXJbXSA9PiB7XHJcblx0Y29uc3QgeCA9XHJcblx0XHQoKGNvcyhhbmdsZVopICogY29zKGFuZ2xlWSkgKyBjb3MoYW5nbGVZKSAqIGNvcyhhbmdsZVopKSAvIDIpICpcclxuXHRcdGNhbURpc3RhbmNlO1xyXG5cdGNvbnN0IHkgPVxyXG5cdFx0KChzaW4oYW5nbGVaKSAqIGNvcyhhbmdsZVkpICsgY29zKGFuZ2xlWSkgKiBzaW4oYW5nbGVaKSkgLyAyKSAqXHJcblx0XHRjYW1EaXN0YW5jZTtcclxuXHRjb25zdCB6ID0gc2luKGFuZ2xlWSkgKiBjYW1EaXN0YW5jZTtcclxuXHJcblx0cmV0dXJuIFt4LCB5LCB6XTtcclxufTtcclxuXHJcbmNvbnN0IHNldENhbVBvc2l0aW9uID0gKG1vdXNlWD86IG51bWJlciwgbW91c2VZPzogbnVtYmVyKTogdm9pZCA9PiB7XHJcblx0aWYgKCFydW5uaW5nIHx8ICF0YXJnZXRDb29yZHMgfHwgY2hhbmdpbmdDYW0pIHJldHVybjtcclxuXHJcblx0bW91c2VYID0gbW91c2VYID8/IDAuMDtcclxuXHRtb3VzZVkgPSBtb3VzZVkgPz8gMC4wO1xyXG5cclxuXHRhbmdsZVogLT0gbW91c2VYO1xyXG5cdGFuZ2xlWSArPSBtb3VzZVk7XHJcblxyXG4gICAgY29uc3QgaXNIZWFkT3JXaG9sZSA9IGN1cnJlbnRCb25lID09PSAnd2hvbGUnIHx8IGN1cnJlbnRCb25lID09PSAnaGVhZCc7XHJcbiAgICBjb25zdCBtYXhBbmdsZSA9IGlzSGVhZE9yV2hvbGUgPyA4OS4wIDogNzAuMDtcclxuICAgIFxyXG4gICAgY29uc3QgaXNTaG9lcyA9IGN1cnJlbnRCb25lID09PSAnc2hvZXMnO1xyXG4gICAgY29uc3QgbWluQW5nbGUgPSBpc1Nob2VzID8gNS4wIDogLTIwLjA7XHJcblxyXG5cdGFuZ2xlWSA9IE1hdGgubWluKE1hdGgubWF4KGFuZ2xlWSwgbWluQW5nbGUpLCBtYXhBbmdsZSk7XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpO1xyXG5cclxuXHRTZXRDYW1Db29yZChcclxuXHRcdGNhbSxcclxuXHRcdHRhcmdldENvb3Jkcy54ICsgeCxcclxuXHRcdHRhcmdldENvb3Jkcy55ICsgeSxcclxuXHRcdHRhcmdldENvb3Jkcy56ICsgelxyXG5cdCk7XHJcblx0UG9pbnRDYW1BdENvb3JkKGNhbSwgdGFyZ2V0Q29vcmRzLngsIHRhcmdldENvb3Jkcy55LCB0YXJnZXRDb29yZHMueik7XHJcbn07XHJcblxyXG5jb25zdCBtb3ZlQ2FtZXJhID0gYXN5bmMgKGNvb3JkczogVmVjdG9yMywgZGlzdGFuY2U/OiBudW1iZXIpID0+IHtcclxuXHRjb25zdCBoZWFkaW5nOiBudW1iZXIgPSBHZXRFbnRpdHlIZWFkaW5nKHBlZCkgKyA5NDtcclxuXHRkaXN0YW5jZSA9IGRpc3RhbmNlID8/IDEuMDtcclxuXHJcblx0Y2hhbmdpbmdDYW0gPSB0cnVlO1xyXG5cdGNhbURpc3RhbmNlID0gZGlzdGFuY2U7XHJcblx0YW5nbGVaID0gaGVhZGluZztcclxuXHJcblx0Y29uc3QgW3gsIHksIHpdID0gZ2V0QW5nbGVzKCk7XHJcblxyXG5cdGNvbnN0IG5ld2NhbTogQ2FtZXJhID0gQ3JlYXRlQ2FtV2l0aFBhcmFtcyhcclxuXHRcdCdERUZBVUxUX1NDUklQVEVEX0NBTUVSQScsXHJcblx0XHRjb29yZHMueCArIHgsXHJcblx0XHRjb29yZHMueSArIHksXHJcblx0XHRjb29yZHMueiArIHosXHJcblx0XHQwLjAsXHJcblx0XHQwLjAsXHJcblx0XHQwLjAsXHJcblx0XHQ3MC4wLFxyXG5cdFx0ZmFsc2UsXHJcblx0XHQwXHJcblx0KTtcclxuXHJcblx0dGFyZ2V0Q29vcmRzID0gY29vcmRzO1xyXG5cdGNoYW5naW5nQ2FtID0gZmFsc2U7XHJcblx0b2xkQ2FtID0gY2FtO1xyXG5cdGNhbSA9IG5ld2NhbTtcclxuXHJcblx0UG9pbnRDYW1BdENvb3JkKG5ld2NhbSwgY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMueik7XHJcblx0U2V0Q2FtQWN0aXZlV2l0aEludGVycChuZXdjYW0sIG9sZENhbSwgMjUwLCAwLCAwKTtcclxuXHJcblx0YXdhaXQgZGVsYXkoMjUwKTtcclxuXHJcblx0U2V0Q2FtVXNlU2hhbGxvd0RvZk1vZGUobmV3Y2FtLCB0cnVlKTtcclxuXHRTZXRDYW1OZWFyRG9mKG5ld2NhbSwgMC40KTtcclxuXHRTZXRDYW1GYXJEb2YobmV3Y2FtLCAxLjIpO1xyXG5cdFNldENhbURvZlN0cmVuZ3RoKG5ld2NhbSwgMC4zKTtcclxuXHR1c2VIaURvZihuZXdjYW0pO1xyXG5cclxuXHREZXN0cm95Q2FtKG9sZENhbSwgdHJ1ZSk7XHJcbn07XHJcblxyXG5jb25zdCB1c2VIaURvZiA9IChjdXJyZW50Y2FtOiBDYW1lcmEpID0+IHtcclxuXHRpZiAoIShEb2VzQ2FtRXhpc3QoY2FtKSAmJiBjdXJyZW50Y2FtID09IGNhbSkpIHJldHVybjtcclxuXHRTZXRVc2VIaURvZigpO1xyXG5cdHNldFRpbWVvdXQodXNlSGlEb2YsIDApO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0YXJ0Q2FtZXJhID0gKCkgPT4ge1xyXG5cdGlmIChydW5uaW5nKSByZXR1cm47XHJcblx0cnVubmluZyA9IHRydWU7XHJcblx0Y2FtRGlzdGFuY2UgPSBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRVxyXG5cdGNhbSA9IENyZWF0ZUNhbSgnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLCB0cnVlKTtcclxuXHRjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIDMxMDg2LCAwLjAsIDAuMCwgMC4wKTtcclxuXHRTZXRDYW1Db29yZChjYW0sIHgsIHksIHopO1xyXG5cdFJlbmRlclNjcmlwdENhbXModHJ1ZSwgdHJ1ZSwgMTAwMCwgdHJ1ZSwgdHJ1ZSk7XHJcblx0Ly8gbW92ZUNhbWVyYSh7IHg6IHgsIHk6IHksIHo6IHogfSwgY2FtRGlzdGFuY2UpO1xyXG4gICAgc2V0Q2FtZXJhKCd3aG9sZScsIGNhbURpc3RhbmNlKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdG9wQ2FtZXJhID0gKCk6IHZvaWQgPT4ge1xyXG5cdGlmICghcnVubmluZykgcmV0dXJuO1xyXG5cdHJ1bm5pbmcgPSBmYWxzZTtcclxuXHJcblx0UmVuZGVyU2NyaXB0Q2FtcyhmYWxzZSwgdHJ1ZSwgMjUwLCB0cnVlLCBmYWxzZSk7XHJcblx0RGVzdHJveUNhbShjYW0sIHRydWUpO1xyXG5cdGNhbSA9IG51bGw7XHJcblx0dGFyZ2V0Q29vcmRzID0gbnVsbDtcclxufTtcclxuXHJcbmNvbnN0IHNldENhbWVyYSA9ICh0eXBlPzoga2V5b2YgVENhbWVyYUJvbmVzLCBkaXN0YW5jZSA9IGNhbURpc3RhbmNlKTogdm9pZCA9PiB7XHJcblxyXG5cdGNvbnN0IGJvbmU6IG51bWJlciB8IG51bWJlcltdIHwgdW5kZWZpbmVkID0gQ2FtZXJhQm9uZXNbdHlwZV07XHJcblxyXG4gICAgY29uc3QgaXNCb25lQXJyYXkgPSBBcnJheS5pc0FycmF5KGJvbmUpXHJcblxyXG4gICAgY3VycmVudEJvbmUgPSB0eXBlO1xyXG5cclxuICAgIGlmICghaXNCb25lQXJyYXkgJiYgYm9uZSA9PT0gMCkge1xyXG4gICAgICAgIGNvbnN0IFt4LCB5LCB6XTogbnVtYmVyW10gPSBHZXRFbnRpdHlDb29yZHMocGVkLCBmYWxzZSk7XHJcbiAgICAgICAgbW92ZUNhbWVyYShcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgeDogeCxcclxuICAgICAgICAgICAgICAgIHk6IHksXHJcbiAgICAgICAgICAgICAgICB6OiB6ICsgMC4wLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkaXN0YW5jZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIGl0cyBub3Qgd2hvbGUgYm9keSwgdGhlbiB3ZSBuZWVkIHRvIGxpbWl0IHRoZSBkaXN0YW5jZVxyXG4gICAgaWYgKGRpc3RhbmNlID4gREVGQVVMVF9NQVhfRElTVEFOQ0UpIGRpc3RhbmNlID0gREVGQVVMVF9NQVhfRElTVEFOQ0U7XHJcblxyXG4gICAgaWYgKGlzQm9uZUFycmF5KSB7XHJcbiAgICAgICAgY29uc3QgW3gxLCB5MSwgejFdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCBib25lWzBdLCAwLjAsIDAuMCwgMC4wKVxyXG5cclxuICAgICAgICBjb25zdCBbeDIsIHkyLCB6Ml06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmVbMV0sIDAuMCwgMC4wLCAwLjApXHJcblxyXG4gICAgICAgIC8vIGdldCB0aGUgbWlkZGxlIG9mIHRoZSB0d28gcG9pbnRzXHJcbiAgICAgICAgdmFyIHggPSAoeDEgKyB4MikgLyAyO1xyXG4gICAgICAgIHZhciB5ID0gKHkxICsgeTIpIC8gMjtcclxuICAgICAgICB2YXIgeiA9ICh6MSArIHoyKSAvIDI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBbeCwgeSwgel06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmUsIDAuMCwgMC4wLCAwLjApXHJcbiAgICB9XHJcblxyXG5cdG1vdmVDYW1lcmEoXHJcblx0XHR7XHJcblx0XHRcdHg6IHgsXHJcblx0XHRcdHk6IHksXHJcblx0XHRcdHo6IHogKyAwLjAsXHJcblx0XHR9LFxyXG5cdFx0ZGlzdGFuY2VcclxuXHQpO1xyXG5cclxufTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1Nb3ZlLCAoZGF0YSwgY2IpID0+IHtcclxuICAgIHNldENhbVBvc2l0aW9uKGRhdGEueCwgZGF0YS55KTtcclxuICAgIGNiKDEpO1xyXG59KTtcclxuXHJcbnR5cGUgVFNlY3Rpb24gPSAnd2hvbGUnIHwgJ2hlYWQnIHwgJ3RvcnNvJyB8ICdsZWdzJyB8ICdzaG9lcyc7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtU2VjdGlvbiwgKHR5cGU6IFRTZWN0aW9uLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlICd3aG9sZSc6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgnd2hvbGUnLCBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2hlYWQnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ2hlYWQnKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAndG9yc28nOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ3RvcnNvJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2xlZ3MnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ2xlZ3MnKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnc2hvZXMnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ3Nob2VzJyk7XHJcbiAgICAgICAgICAgIHNldENhbVBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cdH1cclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtWm9vbSwgKGRhdGEsIGNiKSA9PiB7XHJcblx0aWYgKGRhdGEgPT09ICdkb3duJykge1xyXG5cclxuICAgICAgICBjb25zdCBtYXhab29tID0gY3VycmVudEJvbmUgPT09ICd3aG9sZScgPyBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRSA6IERFRkFVTFRfTUFYX0RJU1RBTkNFO1xyXG5cclxuXHRcdGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSArIDAuMDU7XHJcblx0XHRjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlID49IG1heFpvb20gPyBtYXhab29tIDogbmV3RGlzdGFuY2U7XHJcblx0fSBlbHNlIGlmIChkYXRhID09PSAndXAnKSB7XHJcblx0XHRjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgLSAwLjA1O1xyXG5cdFx0Y2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA8PSAwLjMgPyAwLjMgOiBuZXdEaXN0YW5jZTtcclxuXHR9XHJcblxyXG5cdGNhbURpc3RhbmNlID0gY2FtRGlzdGFuY2U7XHJcblx0c2V0Q2FtUG9zaXRpb24oKTtcclxuXHRjYigxKTtcclxufSk7XHJcbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJCbGVtaXNoZXNcIixcbiAgICBcIkZhY2lhbEhhaXJcIixcbiAgICBcIkV5ZWJyb3dzXCIsXG4gICAgXCJBZ2VpbmdcIixcbiAgICBcIk1ha2V1cFwiLFxuICAgIFwiQmx1c2hcIixcbiAgICBcIkNvbXBsZXhpb25cIixcbiAgICBcIlN1bkRhbWFnZVwiLFxuICAgIFwiTGlwc3RpY2tcIixcbiAgICBcIk1vbGVzRnJlY2tsZXNcIixcbiAgICBcIkNoZXN0SGFpclwiLFxuICAgIFwiQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiQWRkQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiRXllQ29sb3JcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcIk5vc2VfV2lkdGhcIixcbiAgICBcIk5vc2VfUGVha19IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19MZW5naHRcIixcbiAgICBcIk5vc2VfQm9uZV9IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19Mb3dlcmluZ1wiLFxuICAgIFwiTm9zZV9Cb25lX1R3aXN0XCIsXG4gICAgXCJFeWVCcm93bl9IZWlnaHRcIixcbiAgICBcIkV5ZUJyb3duX0ZvcndhcmRcIixcbiAgICBcIkNoZWVrc19Cb25lX0hpZ2hcIixcbiAgICBcIkNoZWVrc19Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGVla3NfV2lkdGhcIixcbiAgICBcIkV5ZXNfT3Blbm5pbmdcIixcbiAgICBcIkxpcHNfVGhpY2tuZXNzXCIsXG4gICAgXCJKYXdfQm9uZV9XaWR0aFwiLFxuICAgIFwiSmF3X0JvbmVfQmFja19MZW5naHRcIixcbiAgICBcIkNoaW5fQm9uZV9Mb3dlcmluZ1wiLFxuICAgIFwiQ2hpbl9Cb25lX0xlbmd0aFwiLFxuICAgIFwiQ2hpbl9Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGluX0hvbGVcIixcbiAgICBcIk5lY2tfVGhpa25lc3NcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImZhY2VcIixcbiAgICBcIm1hc2tzXCIsXG4gICAgXCJoYWlyXCIsXG4gICAgXCJ0b3Jzb3NcIixcbiAgICBcImxlZ3NcIixcbiAgICBcImJhZ3NcIixcbiAgICBcInNob2VzXCIsXG4gICAgXCJuZWNrXCIsXG4gICAgXCJzaGlydHNcIixcbiAgICBcInZlc3RcIixcbiAgICBcImRlY2Fsc1wiLFxuICAgIFwiamFja2V0c1wiXG5dXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiaGF0c1wiLFxuICAgIFwiZ2xhc3Nlc1wiLFxuICAgIFwiZWFycmluZ3NcIixcbiAgICBcIm1vdXRoXCIsXG4gICAgXCJsaGFuZFwiLFxuICAgIFwicmhhbmRcIixcbiAgICBcIndhdGNoZXNcIixcbiAgICBcImJyYWNlbGV0c1wiXG5dXG4iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRIYWlyRGF0YSwgVEhlYWRPdmVybGF5LCBUSGVhZE92ZXJsYXlUb3RhbCB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IEhFQURfT1ZFUkxBWVMgZnJvbSBcIkBkYXRhL2hlYWRcIlxyXG5pbXBvcnQgRkFDRV9GRUFUVVJFUyBmcm9tIFwiQGRhdGEvZmFjZVwiXHJcbmltcG9ydCBEUkFXQUJMRV9OQU1FUyBmcm9tIFwiQGRhdGEvZHJhd2FibGVzXCJcclxuaW1wb3J0IFBST1BfTkFNRVMgZnJvbSBcIkBkYXRhL3Byb3BzXCJcclxuaW1wb3J0IHsgcGVkLCBvblNlcnZlckNhbGxiYWNrIH0gZnJvbSAnQHV0aWxzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kTW9kZWxJbmRleCh0YXJnZXQ6IG51bWJlcikge1xyXG4gICAgY29uc3QgY29uZmlnID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlXHJcbiAgICBjb25zdCBtb2RlbHMgPSBjb25maWcubW9kZWxzKClcclxuXHJcbiAgICByZXR1cm4gbW9kZWxzLmZpbmRJbmRleCgobW9kZWw6IHN0cmluZykgPT4gR2V0SGFzaEtleShtb2RlbCkgPT09IHRhcmdldClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhhaXIocGVkSGFuZGxlOiBudW1iZXIpOiBUSGFpckRhdGEge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjb2xvcjogR2V0UGVkSGFpckNvbG9yKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGlnaGxpZ2h0OiBHZXRQZWRIYWlySGlnaGxpZ2h0Q29sb3IocGVkSGFuZGxlKVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZEJsZW5kRGF0YShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BlZHIwZm9udG91cmEvZml2ZW0tYXBwZWFyYW5jZS9ibG9iL21haW4vZ2FtZS9zcmMvY2xpZW50L2luZGV4LnRzI0w2N1xyXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKDgwKTtcclxuICAgIGdsb2JhbC5DaXRpemVuLmludm9rZU5hdGl2ZSgnMHgyNzQ2YmQ5ZDg4YzVjNWQwJywgcGVkSGFuZGxlLCBuZXcgVWludDMyQXJyYXkoYnVmZmVyKSk7XHJcblxyXG4gICAgY29uc3QgeyAwOiBzaGFwZUZpcnN0LCAyOiBzaGFwZVNlY29uZCwgNDogc2hhcGVUaGlyZCwgNjogc2tpbkZpcnN0LCA4OiBza2luU2Vjb25kLCAxODogaGFzUGFyZW50LCAxMDogc2tpblRoaXJkIH0gPSBuZXcgVWludDMyQXJyYXkoYnVmZmVyKTtcclxuICAgIGNvbnN0IHsgMDogc2hhcGVNaXgsIDI6IHNraW5NaXgsIDQ6IHRoaXJkTWl4IH0gPSBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlciwgNDgpO1xyXG5cclxuICAgIC8qICAgXHJcbiAgICAgICAgMDogc2hhcGVGaXJzdCxcclxuICAgICAgICAyOiBzaGFwZVNlY29uZCxcclxuICAgICAgICA0OiBzaGFwZVRoaXJkLFxyXG4gICAgICAgIDY6IHNraW5GaXJzdCxcclxuICAgICAgICA4OiBza2luU2Vjb25kLFxyXG4gICAgICAgIDEwOiBza2luVGhpcmQsXHJcbiAgICAgICAgMTg6IGhhc1BhcmVudCxcclxuICAgICovXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNoYXBlRmlyc3QsICAgLy8gZmF0aGVyXHJcbiAgICAgICAgc2hhcGVTZWNvbmQsIC8vIG1vdGhlclxyXG4gICAgICAgIHNoYXBlVGhpcmQsXHJcblxyXG4gICAgICAgIHNraW5GaXJzdCxcclxuICAgICAgICBza2luU2Vjb25kLFxyXG4gICAgICAgIHNraW5UaGlyZCxcclxuXHJcbiAgICAgICAgc2hhcGVNaXgsIC8vIHJlc2VtYmxhbmNlXHJcblxyXG4gICAgICAgIHRoaXJkTWl4LFxyXG4gICAgICAgIHNraW5NaXgsICAgLy8gc2tpbnBlcmNlbnRcclxuXHJcbiAgICAgICAgaGFzUGFyZW50OiBCb29sZWFuKGhhc1BhcmVudCksXHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCB0b3RhbHM6IFRIZWFkT3ZlcmxheVRvdGFsID0ge307XHJcbiAgICBsZXQgaGVhZERhdGE6IFRIZWFkT3ZlcmxheSA9IHt9O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgSEVBRF9PVkVSTEFZUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBIRUFEX09WRVJMQVlTW2ldO1xyXG4gICAgICAgIHRvdGFsc1tvdmVybGF5XSA9IEdldE51bUhlYWRPdmVybGF5VmFsdWVzKGkpO1xyXG5cclxuICAgICAgICBpZiAob3ZlcmxheSA9PT0gXCJFeWVDb2xvclwiKSB7XHJcbiAgICAgICAgICAgIGhlYWREYXRhW292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogR2V0UGVkRXllQ29sb3IocGVkSGFuZGxlKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFtfLCBvdmVybGF5VmFsdWUsIGNvbG91clR5cGUsIGZpcnN0Q29sb3IsIHNlY29uZENvbG9yLCBvdmVybGF5T3BhY2l0eV0gPSBHZXRQZWRIZWFkT3ZlcmxheURhdGEocGVkSGFuZGxlLCBpKTtcclxuICAgICAgICAgICAgaGVhZERhdGFbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBvdmVybGF5VmFsdWUgPT09IDI1NSA/IC0xIDogb3ZlcmxheVZhbHVlLFxyXG4gICAgICAgICAgICAgICAgY29sb3VyVHlwZTogY29sb3VyVHlwZSxcclxuICAgICAgICAgICAgICAgIGZpcnN0Q29sb3I6IGZpcnN0Q29sb3IsXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRDb2xvcjogc2Vjb25kQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5T3BhY2l0eTogb3ZlcmxheU9wYWNpdHlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtoZWFkRGF0YSwgdG90YWxzXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRTdHJ1Y3R1cmUocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IHBlZE1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkSGFuZGxlKVxyXG5cclxuICAgIGlmIChwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX21fZnJlZW1vZGVfMDFcIikgJiYgcGVkTW9kZWwgIT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpKSByZXR1cm5cclxuXHJcbiAgICBsZXQgZmFjZVN0cnVjdCA9IHt9XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEZBQ0VfRkVBVFVSRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gRkFDRV9GRUFUVVJFU1tpXVxyXG4gICAgICAgIGZhY2VTdHJ1Y3Rbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZEZhY2VGZWF0dXJlKHBlZEhhbmRsZSwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhY2VTdHJ1Y3RcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldERyYXdhYmxlcyhwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgbGV0IGRyYXdhYmxlcyA9IHt9XHJcbiAgICBsZXQgdG90YWxEcmF3YWJsZXMgPSB7fVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRFJBV0FCTEVfTkFNRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gRFJBV0FCTEVfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkSGFuZGxlLCBpKVxyXG5cclxuICAgICAgICB0b3RhbERyYXdhYmxlc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWREcmF3YWJsZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZXM6IEdldE51bWJlck9mUGVkVGV4dHVyZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBpLCBjdXJyZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICBkcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFRleHR1cmVWYXJpYXRpb24ocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW2RyYXdhYmxlcywgdG90YWxEcmF3YWJsZXNdXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9wcyhwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgbGV0IHByb3BzID0ge31cclxuICAgIGxldCB0b3RhbFByb3BzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFBST1BfTkFNRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gUFJPUF9OQU1FU1tpXVxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBHZXRQZWRQcm9wSW5kZXgocGVkSGFuZGxlLCBpKVxyXG5cclxuICAgICAgICB0b3RhbFByb3BzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHRvdGFsOiBHZXROdW1iZXJPZlBlZFByb3BEcmF3YWJsZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZXM6IEdldE51bWJlck9mUGVkUHJvcFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3BzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWRQcm9wSW5kZXgocGVkSGFuZGxlLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZTogR2V0UGVkUHJvcFRleHR1cmVJbmRleChwZWRIYW5kbGUsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbcHJvcHMsIHRvdGFsUHJvcHNdXHJcbn1cclxuXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBwZWFyYW5jZShwZWRIYW5kbGU6IG51bWJlcik6IFByb21pc2U8VEFwcGVhcmFuY2U+IHtcclxuICAgIGNvbnN0IFtoZWFkRGF0YSwgdG90YWxzXSA9IGdldEhlYWRPdmVybGF5KHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtkcmF3YWJsZXMsIGRyYXdUb3RhbF0gPSBnZXREcmF3YWJsZXMocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW3Byb3BzLCBwcm9wVG90YWxdID0gZ2V0UHJvcHMocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgbW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWRIYW5kbGUpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBtb2RlbEluZGV4OiBmaW5kTW9kZWxJbmRleChtb2RlbCksXHJcbiAgICAgICAgbW9kZWw6IG1vZGVsLFxyXG4gICAgICAgIGhhaXJDb2xvcjogZ2V0SGFpcihwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhlYWRCbGVuZDogZ2V0SGVhZEJsZW5kRGF0YShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhlYWRPdmVybGF5OiBoZWFkRGF0YSBhcyBUSGVhZE92ZXJsYXksXHJcbiAgICAgICAgaGVhZE92ZXJsYXlUb3RhbDogdG90YWxzIGFzIFRIZWFkT3ZlcmxheVRvdGFsLFxyXG4gICAgICAgIGhlYWRTdHJ1Y3R1cmU6IGdldEhlYWRTdHJ1Y3R1cmUocGVkSGFuZGxlKSxcclxuICAgICAgICBkcmF3YWJsZXM6IGRyYXdhYmxlcyxcclxuICAgICAgICBwcm9wczogcHJvcHMsXHJcbiAgICAgICAgZHJhd1RvdGFsOiBkcmF3VG90YWwsXHJcbiAgICAgICAgcHJvcFRvdGFsOiBwcm9wVG90YWwsXHJcbiAgICAgICAgdGF0dG9vczogW11cclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0QXBwZWFyYW5jZVwiLCBnZXRBcHBlYXJhbmNlKVxyXG5vblNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDpnZXRBcHBlYXJhbmNlJywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIGdldEFwcGVhcmFuY2UocGVkKVxyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQZWRDbG90aGVzKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBbZHJhd2FibGVzXSA9IGdldERyYXdhYmxlcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbcHJvcHNdID0gZ2V0UHJvcHMocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW2hlYWREYXRhXSA9IGdldEhlYWRPdmVybGF5KHBlZEhhbmRsZSlcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGhlYWRPdmVybGF5OiBoZWFkRGF0YSxcclxuICAgICAgICBkcmF3YWJsZXM6IGRyYXdhYmxlcyxcclxuICAgICAgICBwcm9wczogcHJvcHMsXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldFBlZENsb3RoZXNcIiwgZ2V0UGVkQ2xvdGhlcylcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQZWRTa2luKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGhlYWRCbGVuZDogZ2V0SGVhZEJsZW5kRGF0YShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhlYWRTdHJ1Y3R1cmU6IGdldEhlYWRTdHJ1Y3R1cmUocGVkSGFuZGxlKSxcclxuICAgICAgICBoYWlyQ29sb3I6IGdldEhhaXIocGVkSGFuZGxlKSxcclxuICAgICAgICBtb2RlbDogR2V0RW50aXR5TW9kZWwocGVkSGFuZGxlKVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRQZWRTa2luXCIsIGdldFBlZFNraW4pXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGF0dG9vRGF0YSgpIHtcclxuICAgIGxldCB0YXR0b29ab25lcyA9IFtdXHJcblxyXG4gICAgY29uc3QgW1RBVFRPT19MSVNULCBUQVRUT09fQ0FURUdPUklFU10gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UudGF0dG9vcygpXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFRBVFRPT19DQVRFR09SSUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBUQVRUT09fQ0FURUdPUklFU1tpXVxyXG4gICAgICAgIGNvbnN0IHpvbmUgPSBjYXRlZ29yeS56b25lXHJcbiAgICAgICAgY29uc3QgbGFiZWwgPSBjYXRlZ29yeS5sYWJlbFxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gY2F0ZWdvcnkuaW5kZXhcclxuICAgICAgICB0YXR0b29ab25lc1tpbmRleF0gPSB7XHJcbiAgICAgICAgICAgIHpvbmU6IHpvbmUsXHJcbiAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcclxuICAgICAgICAgICAgem9uZUluZGV4OiBpbmRleCxcclxuICAgICAgICAgICAgZGxjczogW11cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgZGxjRGF0YSA9IFRBVFRPT19MSVNUW2pdXHJcbiAgICAgICAgICAgIHRhdHRvb1pvbmVzW2luZGV4XS5kbGNzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGRsY0RhdGEuZGxjLFxyXG4gICAgICAgICAgICAgICAgZGxjSW5kZXg6IGosXHJcbiAgICAgICAgICAgICAgICB0YXR0b29zOiBbXVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0ZlbWFsZSA9IEdldEVudGl0eU1vZGVsKHBlZCkgPT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fTElTVC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBUQVRUT09fTElTVFtpXVxyXG4gICAgICAgIGNvbnN0IHsgZGxjLCB0YXR0b29zIH0gPSBkYXRhXHJcbiAgICAgICAgY29uc3QgZGxjSGFzaCA9IEdldEhhc2hLZXkoZGxjKVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGF0dG9vcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gdGF0dG9vc1tqXVxyXG4gICAgICAgICAgICBsZXQgdGF0dG9vID0gbnVsbFxyXG5cclxuICAgICAgICAgICAgY29uc3QgbG93ZXJUYXR0b28gPSB0YXR0b29EYXRhLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgY29uc3QgaXNGZW1hbGVUYXR0b28gPSBsb3dlclRhdHRvby5pbmNsdWRlcyhcIl9mXCIpXHJcbiAgICAgICAgICAgIGlmIChpc0ZlbWFsZVRhdHRvbyAmJiBpc0ZlbWFsZSkge1xyXG4gICAgICAgICAgICAgICAgdGF0dG9vID0gdGF0dG9vRGF0YVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0ZlbWFsZVRhdHRvbyAmJiAhaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGhhc2ggPSBudWxsXHJcbiAgICAgICAgICAgIGxldCB6b25lID0gLTFcclxuXHJcbiAgICAgICAgICAgIGlmICh0YXR0b28pIHtcclxuICAgICAgICAgICAgICAgIGhhc2ggPSBHZXRIYXNoS2V5KHRhdHRvbylcclxuICAgICAgICAgICAgICAgIHpvbmUgPSBHZXRQZWREZWNvcmF0aW9uWm9uZUZyb21IYXNoZXMoZGxjSGFzaCwgaGFzaClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHpvbmUgIT09IC0xICYmIGhhc2gpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHpvbmVUYXR0b29zID0gdGF0dG9vWm9uZXNbem9uZV0uZGxjc1tpXS50YXR0b29zXHJcblxyXG4gICAgICAgICAgICAgICAgem9uZVRhdHRvb3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRhdHRvbyxcclxuICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvbmU6IHpvbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGxjOiBkbGMsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YXR0b29ab25lc1xyXG59XHJcblxyXG4vL21pZ3JhdGlvblxyXG5cclxub25TZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6bWlncmF0aW9uOnNldEFwcGVhcmFuY2UnLCAoZGF0YToge3R5cGU6IHN0cmluZywgZGF0YTogYW55fSkgPT4ge1xyXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gJ2ZpdmVtJykgZXhwb3J0c1snZml2ZW0tYXBwZWFyYW5jZSddLnNldFBsYXllckFwcGVhcmFuY2UoZGF0YS5kYXRhKVxyXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gJ2lsbGVuaXVtJykgZXhwb3J0c1snaWxsZW5pdW0tYXBwZWFyYW5jZSddLnNldFBsYXllckFwcGVhcmFuY2UoZGF0YS5kYXRhKVxyXG59KTsiLCAiZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgaGF0czoge1xyXG4gICAgICAgIHR5cGU6IFwicHJvcFwiLFxyXG4gICAgICAgIGluZGV4OiAwLFxyXG4gICAgfSxcclxuICAgIGdsYXNzZXM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgIH0sXHJcbiAgICBtYXNrczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgICAgICBvZmY6IDAsXHJcbiAgICB9LFxyXG4gICAgc2hpcnRzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA4LFxyXG4gICAgICAgIG9mZjogMTUsXHJcbiAgICAgICAgaG9vazoge1xyXG4gICAgICAgICAgICBkcmF3YWJsZXM6IFtcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAzLCB2YXJpYW50OiAxNSwgdGV4dHVyZTogMCwgaWQ6ICd0b3Jzb3MnIH0sXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogOCwgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAnc2hpcnRzJyB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgamFja2V0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMTEsXHJcbiAgICAgICAgb2ZmOiAxNSxcclxuICAgICAgICBob29rOiB7XHJcbiAgICAgICAgICAgIGRyYXdhYmxlczogW1xyXG4gICAgICAgICAgICAgICAgeyBjb21wb25lbnQ6IDMsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ3RvcnNvcycgfSxcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAxMSwgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAnamFja2V0cycgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHZlc3Q6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDksXHJcbiAgICAgICAgb2ZmOiAxNSxcclxuICAgIH0sXHJcbiAgICBsZWdzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA0LFxyXG4gICAgICAgIG9mZjogMTEsXHJcbiAgICB9LFxyXG4gICAgc2hvZXM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDYsXHJcbiAgICAgICAgb2ZmOiAxMyxcclxuICAgIH1cclxufSIsICJpbXBvcnQgeyBUVmFsdWUgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiO1xyXG5pbXBvcnQgVE9HR0xFX0lOREVYRVMgZnJvbSBcIkBkYXRhL3RvZ2dsZXNcIlxyXG5pbXBvcnQgeyByZXF1ZXN0TW9kZWwsIHBlZCwgdXBkYXRlUGVkLCBkZWxheX0gZnJvbSAnQHV0aWxzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXREcmF3YWJsZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlLCBkYXRhLnRleHR1cmUsIDApXHJcbiAgICByZXR1cm4gR2V0TnVtYmVyT2ZQZWRUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQcm9wKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIGlmIChkYXRhLnZhbHVlID09PSAtMSkge1xyXG4gICAgICAgIENsZWFyUGVkUHJvcChwZWRIYW5kbGUsIGRhdGEuaW5kZXgpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgU2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCBmYWxzZSlcclxuICAgIHJldHVybiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZXRNb2RlbCA9IGFzeW5jIChtb2RlbDogbnVtYmVyKSA9PiB7XHJcbiAgICBjb25zdCBtb2RlbEhhc2ggPSBhd2FpdCByZXF1ZXN0TW9kZWwobW9kZWwpXHJcbiAgICBTZXRQbGF5ZXJNb2RlbChQbGF5ZXJJZCgpLCBtb2RlbEhhc2gpXHJcbiAgICBTZXRNb2RlbEFzTm9Mb25nZXJOZWVkZWQobW9kZWxIYXNoKVxyXG4gICAgY29uc3QgcGVkSGFuZGxlID0gUGxheWVyUGVkSWQoKVxyXG4gICAgdXBkYXRlUGVkKHBlZEhhbmRsZSlcclxuICAgIFNldFBlZERlZmF1bHRDb21wb25lbnRWYXJpYXRpb24ocGVkSGFuZGxlKVxyXG5cclxuICAgIGlmIChtb2RlbEhhc2ggPT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgZmFsc2UpXHJcbiAgICBlbHNlIGlmIChtb2RlbEhhc2ggPT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgNDUsIDIxLCAwLCAyMCwgMTUsIDAsIDAuMywgMC4xLCAwLCBmYWxzZSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFNldEZhY2VGZWF0dXJlKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIFNldFBlZEZhY2VGZWF0dXJlKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSArIDAuMClcclxufVxyXG5cclxuY29uc3QgaXNQb3NpdGl2ZSA9ICh2YWw6IG51bWJlcikgPT4gdmFsID49IDAgPyB2YWwgOiAwXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0SGVhZEJsZW5kKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBjb25zdCBzaGFwZUZpcnN0ID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlRmlyc3QpXHJcbiAgICBjb25zdCBzaGFwZVNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZVNlY29uZClcclxuICAgIGNvbnN0IHNoYXBlVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVUaGlyZClcclxuICAgIGNvbnN0IHNraW5GaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5za2luRmlyc3QpXHJcbiAgICBjb25zdCBza2luU2Vjb25kID0gaXNQb3NpdGl2ZShkYXRhLnNraW5TZWNvbmQpXHJcbiAgICBjb25zdCBza2luVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpblRoaXJkKVxyXG4gICAgY29uc3Qgc2hhcGVNaXggPSBkYXRhLnNoYXBlTWl4ICsgMC4wXHJcbiAgICBjb25zdCBza2luTWl4ID0gZGF0YS5za2luTWl4ICsgMC4wXHJcbiAgICBjb25zdCB0aGlyZE1peCA9IGRhdGEudGhpcmRNaXggKyAwLjBcclxuICAgIGNvbnN0IGhhc1BhcmVudCA9IGRhdGEuaGFzUGFyZW50XHJcblxyXG4gICAgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWRIYW5kbGUsIHNoYXBlRmlyc3QsIHNoYXBlU2Vjb25kLCBzaGFwZVRoaXJkLCBza2luRmlyc3QsIHNraW5TZWNvbmQsIHNraW5UaGlyZCwgc2hhcGVNaXgsIHNraW5NaXgsIHRoaXJkTWl4LCBoYXNQYXJlbnQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkT3ZlcmxheShwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgY29uc3QgaW5kZXggPSBkYXRhLmluZGV4XHJcblxyXG4gICAgaWYgKGluZGV4ID09PSAxMykge1xyXG4gICAgICAgIFNldFBlZEV5ZUNvbG9yKHBlZEhhbmRsZSwgZGF0YS52YWx1ZSlcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlXHJcblxyXG4gICAgLyogSGFpciBjb2xvciBkb2VzIG5vdCBoYXZlIGFuIGluZGV4LCBvbmx5IGFuIElEIHNvIHdlJ2xsIGNoZWNrIGZvciB0aGF0ICovXHJcbiAgICBpZiAoZGF0YS5pZCA9PT0gJ2hhaXJDb2xvcicpIHtcclxuICAgICAgICBTZXRQZWRIYWlyVGludChwZWRIYW5kbGUsIGRhdGEuaGFpckNvbG9yLCBkYXRhLmhhaXJIaWdobGlnaHQpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIFNldFBlZEhlYWRPdmVybGF5KHBlZEhhbmRsZSwgaW5kZXgsIHZhbHVlLCBkYXRhLm92ZXJsYXlPcGFjaXR5ICsgMC4wKVxyXG4gICAgU2V0UGVkSGVhZE92ZXJsYXlDb2xvcihwZWRIYW5kbGUsIGluZGV4LCAxLCBkYXRhLmZpcnN0Q29sb3IsIGRhdGEuc2Vjb25kQ29sb3IpXHJcbn1cclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRUb2dnbGVzKGRhdGEpIHtcclxuICAgIGNvbnN0IGRyYXdhYmxlcyA9IGRhdGEuZHJhd2FibGVzXHJcbiAgICBjb25zdCBwcm9wcyA9IGRhdGEucHJvcHNcclxuXHJcbiAgICBmb3IgKGNvbnN0IFt0b2dnbGVJdGVtLCB0b2dnbGVEYXRhXSBvZiBPYmplY3QuZW50cmllcyhUT0dHTEVfSU5ERVhFUykpIHtcclxuICAgICAgICBjb25zdCB0b2dnbGVUeXBlID0gdG9nZ2xlRGF0YS50eXBlXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0b2dnbGVEYXRhLmluZGV4XHJcblxyXG4gICAgICAgIGlmICh0b2dnbGVUeXBlID09PSBcImRyYXdhYmxlXCIgJiYgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50RHJhd2FibGUgIT09IGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaW5kZXgsIGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodG9nZ2xlVHlwZSA9PT0gXCJwcm9wXCIgJiYgcHJvcHNbdG9nZ2xlSXRlbV0pIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFByb3AgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleClcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRQcm9wICE9PSBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgU2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgsIHByb3BzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCBmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZENsb3RoZXMocGVkSGFuZGxlOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIGNvbnN0IGRyYXdhYmxlcyA9IGRhdGEuZHJhd2FibGVzXHJcbiAgICBjb25zdCBwcm9wcyA9IGRhdGEucHJvcHNcclxuICAgIGNvbnN0IGhlYWRPdmVybGF5ID0gZGF0YS5oZWFkT3ZlcmxheVxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBkcmF3YWJsZXMpIHtcclxuICAgICAgICBjb25zdCBkcmF3YWJsZSA9IGRyYXdhYmxlc1tpZF1cclxuICAgICAgICBzZXREcmF3YWJsZShwZWRIYW5kbGUsIGRyYXdhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgaWQgaW4gcHJvcHMpIHtcclxuICAgICAgICBjb25zdCBwcm9wID0gcHJvcHNbaWRdXHJcbiAgICAgICAgc2V0UHJvcChwZWRIYW5kbGUsIHByb3ApXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBoZWFkT3ZlcmxheSkge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBoZWFkT3ZlcmxheVtpZF1cclxuICAgICAgICBzZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUsIG92ZXJsYXkpXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZXRQZWRTa2luID0gYXN5bmMgKGRhdGEpID0+IHtcclxuICAgIGNvbnN0IGhlYWRTdHJ1Y3R1cmUgPSBkYXRhLmhlYWRTdHJ1Y3R1cmVcclxuICAgIGNvbnN0IGhlYWRCbGVuZCA9IGRhdGEuaGVhZEJsZW5kXHJcblxyXG4gICAgYXdhaXQgc2V0TW9kZWwoZGF0YS5tb2RlbClcclxuXHJcbiAgICBpZiAoaGVhZEJsZW5kKSBzZXRIZWFkQmxlbmQocGVkLCBoZWFkQmxlbmQpXHJcbiAgICBcclxuICAgIGlmIChoZWFkU3RydWN0dXJlKSBmb3IgKGNvbnN0IGZlYXR1cmUgaW4gaGVhZFN0cnVjdHVyZSkge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gaGVhZFN0cnVjdHVyZVtmZWF0dXJlXVxyXG4gICAgICAgIFNldEZhY2VGZWF0dXJlKHBlZCwgdmFsdWUpXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRUYXR0b29zKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVyblxyXG5cclxuICAgIENsZWFyUGVkRGVjb3JhdGlvbnNMZWF2ZVNjYXJzKHBlZEhhbmRsZSlcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gZGF0YVtpXS50YXR0b29cclxuICAgICAgICBpZiAodGF0dG9vRGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gR2V0SGFzaEtleSh0YXR0b29EYXRhLmRsYylcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vID0gdGF0dG9vRGF0YS5oYXNoXHJcbiAgICAgICAgICAgIEFkZFBlZERlY29yYXRpb25Gcm9tSGFzaGVzKHBlZEhhbmRsZSwgY29sbGVjdGlvbiwgdGF0dG9vKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZEhhaXJDb2xvcnMocGVkSGFuZGxlOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIGNvbnN0IGNvbG9yID0gZGF0YS5jb2xvclxyXG4gICAgY29uc3QgaGlnaGxpZ2h0ID0gZGF0YS5oaWdobGlnaHRcclxuICAgIFNldFBlZEhhaXJDb2xvcihwZWRIYW5kbGUsIGNvbG9yLCBoaWdobGlnaHQpXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQZWRBcHBlYXJhbmNlKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBhd2FpdCBzZXRQZWRTa2luKGRhdGEpXHJcbiAgICBzZXRQZWRDbG90aGVzKHBlZEhhbmRsZSwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMocGVkSGFuZGxlLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MocGVkSGFuZGxlLCBkYXRhLnRhdHRvb3MpXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGRhdGEpIHtcclxuICAgIGF3YWl0IHNldFBlZFNraW4oZGF0YSlcclxuICAgIHNldFBlZENsb3RoZXMocGVkLCBkYXRhKVxyXG4gICAgc2V0UGVkSGFpckNvbG9ycyhwZWQsIGRhdGEuaGFpckNvbG9yKVxyXG4gICAgc2V0UGVkVGF0dG9vcyhwZWQsIGRhdGEudGF0dG9vcylcclxufVxyXG5cclxuZXhwb3J0cygnU2V0UGVkQ2xvdGhlcycsIHNldFBlZENsb3RoZXMpXHJcbmV4cG9ydHMoJ1NldFBlZFNraW4nLCBzZXRQZWRTa2luKVxyXG5leHBvcnRzKCdTZXRQZWRUYXR0b29zJywgc2V0UGVkVGF0dG9vcylcclxuZXhwb3J0cygnU2V0UGVkSGFpckNvbG9ycycsIHNldFBlZEhhaXJDb2xvcnMpIiwgImltcG9ydCB7IFJlY2VpdmUgfSBmcm9tICdAZXZlbnRzJztcclxuaW1wb3J0IHtcclxuXHRyZXNldFRvZ2dsZXMsXHJcblx0c2V0RHJhd2FibGUsXHJcblx0U2V0RmFjZUZlYXR1cmUsXHJcblx0c2V0SGVhZEJsZW5kLFxyXG5cdHNldEhlYWRPdmVybGF5LFxyXG5cdHNldE1vZGVsLFxyXG5cdHNldFBlZENsb3RoZXMsXHJcblx0c2V0UGVkVGF0dG9vcyxcclxuXHRzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlLFxyXG5cdHNldFByb3AsXHJcbn0gZnJvbSAnLi9hcHBlYXJhbmNlL3NldHRlcnMnO1xyXG5pbXBvcnQgeyBjbG9zZU1lbnUgfSBmcm9tICcuL21lbnUnO1xyXG5pbXBvcnQgeyBUQXBwZWFyYW5jZSwgVFRvZ2dsZURhdGEsIFRWYWx1ZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xyXG5pbXBvcnQgeyBkZWxheSwgZ2V0RnJhbWV3b3JrSUQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaywgcGVkIH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0VGF0dG9vRGF0YSB9IGZyb20gJy4vYXBwZWFyYW5jZS9nZXR0ZXJzJztcclxuaW1wb3J0IFRPR0dMRV9JTkRFWEVTIGZyb20gJ0BkYXRhL3RvZ2dsZXMnO1xyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tICdAdHlwaW5ncy9vdXRmaXRzJztcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW5jZWwsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0YXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKTtcclxuXHRjbG9zZU1lbnUoKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2F2ZSwgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRyZXNldFRvZ2dsZXMoYXBwZWFyYW5jZSk7XHJcblxyXG5cdGF3YWl0IGRlbGF5KDEwMCk7XHJcblxyXG5cdGNvbnN0IG5ld0FwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKHBlZCk7XHJcblx0bmV3QXBwZWFyYW5jZS50YXR0b29zID0gYXBwZWFyYW5jZS50YXR0b29zO1xyXG5cdHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUFwcGVhcmFuY2UnLCBnZXRGcmFtZXdvcmtJRCgpLCBuZXdBcHBlYXJhbmNlKTtcclxuXHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIG5ld0FwcGVhcmFuY2UudGF0dG9vcyk7XHJcblxyXG5cdGNsb3NlTWVudSgpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRNb2RlbCwgYXN5bmMgKG1vZGVsOiBzdHJpbmcsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGhhc2ggPSBHZXRIYXNoS2V5KG1vZGVsKTtcclxuXHRpZiAoIUlzTW9kZWxJbkNkaW1hZ2UoaGFzaCkgfHwgIUlzTW9kZWxWYWxpZChoYXNoKSkge1xyXG5cdFx0cmV0dXJuIGNiKDApO1xyXG5cdH1cclxuXHJcblx0YXdhaXQgc2V0TW9kZWwoaGFzaCk7XHJcblxyXG5cdGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKHBlZCk7XHJcblxyXG5cdGFwcGVhcmFuY2UudGF0dG9vcyA9IFtdO1xyXG5cclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgW10pO1xyXG5cclxuXHRjYihhcHBlYXJhbmNlKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZ2V0TW9kZWxUYXR0b29zLCBhc3luYyAoXzogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCB0YXR0b29zID0gZ2V0VGF0dG9vRGF0YSgpO1xyXG5cclxuXHRjYih0YXR0b29zKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0SGVhZFN0cnVjdHVyZSwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0U2V0RmFjZUZlYXR1cmUocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0SGVhZE92ZXJsYXksIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldEhlYWRPdmVybGF5KHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRCbGVuZCwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c2V0SGVhZEJsZW5kKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFRhdHRvb3MsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldFBlZFRhdHRvb3MocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0UHJvcCwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0bGV0IHRleHR1cmUgPSBzZXRQcm9wKHBlZCwgZGF0YSk7XHJcblx0Y2IodGV4dHVyZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldERyYXdhYmxlLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRsZXQgdGV4dHVyZSA9IHNldERyYXdhYmxlKHBlZCwgZGF0YSk7XHJcblx0Y2IodGV4dHVyZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnRvZ2dsZUl0ZW0sIGFzeW5jIChkYXRhOiBUVG9nZ2xlRGF0YSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgaXRlbSA9IFRPR0dMRV9JTkRFWEVTW2RhdGEuaXRlbV07XHJcblx0aWYgKCFpdGVtKSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRjb25zdCBjdXJyZW50ID0gZGF0YS5kYXRhO1xyXG5cdGNvbnN0IHR5cGUgPSBpdGVtLnR5cGU7XHJcblx0Y29uc3QgaW5kZXggPSBpdGVtLmluZGV4O1xyXG5cdGNvbnN0IGhvb2sgPSBpdGVtLmhvb2s7XHJcblx0Y29uc3QgaG9va0RhdGEgPSBkYXRhLmhvb2tEYXRhO1xyXG5cclxuXHRpZiAoIWN1cnJlbnQpIHJldHVybiBjYihmYWxzZSk7XHJcblxyXG5cdGlmICh0eXBlID09PSAncHJvcCcpIHtcclxuXHRcdGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpO1xyXG5cclxuXHRcdGlmIChjdXJyZW50UHJvcCA9PT0gLTEpIHtcclxuXHRcdFx0c2V0UHJvcChwZWQsIGN1cnJlbnQpO1xyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdENsZWFyUGVkUHJvcChwZWQsIGluZGV4KTtcclxuXHRcdFx0Y2IodHJ1ZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9IGVsc2UgaWYgKHR5cGUgPT09ICdkcmF3YWJsZScpIHtcclxuXHRcdGNvbnN0IGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpO1xyXG5cclxuXHRcdGlmIChjdXJyZW50LnZhbHVlID09PSBpdGVtLm9mZikge1xyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoY3VycmVudC52YWx1ZSA9PT0gY3VycmVudERyYXdhYmxlKSB7XHJcblx0XHRcdFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBpdGVtLm9mZiwgMCwgMCk7XHJcblx0XHRcdGlmIChob29rKSB7XHJcblx0XHRcdFx0Zm9yKGxldCBpPTA7IGkgPCBob29rLmRyYXdhYmxlcz8ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGNvbnN0IGhvb2tJdGVtID0gaG9vay5kcmF3YWJsZXNbaV07XHJcblx0XHRcdFx0XHRTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBob29rSXRlbS5jb21wb25lbnQsIGhvb2tJdGVtLnZhcmlhbnQsIGhvb2tJdGVtLnRleHR1cmUsIDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRjYih0cnVlKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0c2V0RHJhd2FibGUocGVkLCBjdXJyZW50KTtcclxuXHRcdFx0Zm9yKGxldCBpPTA7IGkgPCBob29rRGF0YT8ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRzZXREcmF3YWJsZShwZWQsIGhvb2tEYXRhW2ldKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuKTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zYXZlT3V0Zml0LCBhc3luYyAoZGF0YTogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZU91dGZpdCcsIGZyYW1ld29ya2RJZCwgZGF0YSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZGVsZXRlT3V0Zml0LCBhc3luYyAoe2lkfSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmRlbGV0ZU91dGZpdCcsIGZyYW1ld29ya2RJZCwgaWQpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnJlbmFtZU91dGZpdCwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlbmFtZU91dGZpdCcsIGZyYW1ld29ya2RJZCwgZGF0YSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUudXNlT3V0Zml0LCBhc3luYyAob3V0Zml0OiBPdXRmaXQsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldFBlZENsb3RoZXMocGVkLCBvdXRmaXQpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5pbXBvcnRPdXRmaXQsIGFzeW5jICh7IGlkLCBvdXRmaXROYW1lIH0sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjppbXBvcnRPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGlkLCBvdXRmaXROYW1lKTtcclxuXHRjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5ncmFiT3V0Zml0LCBhc3luYyAoeyBpZCB9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdyYWJPdXRmaXQnLCBpZCk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuaXRlbU91dGZpdCwgYXN5bmMgKGRhdGE6IHtvdXRmaXQ6IE91dGZpdCwgbGFiZWw6IHN0cmluZ30sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6aXRlbU91dGZpdCcsZGF0YSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5vbk5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6dXNlT3V0Zml0JywgKG91dGZpdDogT3V0Zml0KSA9PiB7XHJcblx0c2V0UGVkQ2xvdGhlcyhwZWQsIG91dGZpdCk7XHJcbn0pIiwgImltcG9ydCB7IGdldEZyYW1ld29ya0lELCByZXF1ZXN0TG9jYWxlLCBzZW5kTlVJRXZlbnQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaywgdXBkYXRlUGVkLCBwZWQsIGdldFBsYXllckRhdGEsIGdldEpvYkluZm8sIGdldFBsYXllckdlbmRlck1vZGVsIH0gZnJvbSBcIkB1dGlsc1wiXHJcbmltcG9ydCB7IHN0YXJ0Q2FtZXJhLCBzdG9wQ2FtZXJhIH0gZnJvbSBcIi4vY2FtZXJhXCJcclxuaW1wb3J0IHR5cGUgeyBUQXBwZWFyYW5jZVpvbmUgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gXCJAdHlwaW5ncy9vdXRmaXRzXCJcclxuaW1wb3J0IHsgU2VuZCB9IGZyb20gXCJAZXZlbnRzXCJcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0VGF0dG9vRGF0YSB9IGZyb20gXCIuL2FwcGVhcmFuY2UvZ2V0dGVyc1wiXHJcbmltcG9ydCBcIi4vaGFuZGxlcnNcIlxyXG5pbXBvcnQgeyBzZXRNb2RlbCB9IGZyb20gXCIuL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXHJcblxyXG5jb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxubGV0IGFybW91ciA9IDBcclxubGV0IG9wZW4gPSBmYWxzZVxyXG5cclxubGV0IHJlc29sdmVQcm9taXNlID0gbnVsbDtcclxubGV0IHByb21pc2UgPSBudWxsO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5NZW51KHpvbmU6IFRBcHBlYXJhbmNlWm9uZSwgY3JlYXRpb246IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgaWYgKHpvbmUgPT09IG51bGwgfHwgb3Blbikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwZWRIYW5kbGUgPSBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBjb25maWdNZW51cyA9IGNvbmZpZy5tZW51cygpXHJcblxyXG4gICAgY29uc3QgdHlwZSA9IHpvbmUudHlwZVxyXG5cclxuICAgIGNvbnN0IG1lbnUgPSBjb25maWdNZW51c1t0eXBlXVxyXG4gICAgaWYgKCFtZW51KSByZXR1cm5cclxuXHJcbiAgICB1cGRhdGVQZWQocGVkSGFuZGxlKVxyXG4gICAgc3RhcnRDYW1lcmEoKVxyXG5cclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKClcclxuICAgIGNvbnN0IHRhYnMgPSBtZW51LnRhYnNcclxuICAgIGxldCBhbGxvd0V4aXQgPSBjcmVhdGlvbiA/IGZhbHNlIDogbWVudS5hbGxvd0V4aXRcclxuXHJcbiAgICBhcm1vdXIgPSBHZXRQZWRBcm1vdXIocGVkSGFuZGxlKVxyXG5cclxuICAgIGxldCBvdXRmaXRzID0gW11cclxuXHJcbiAgICBjb25zdCBoYXNPdXRmaXRUYWIgPSB0YWJzLmluY2x1ZGVzKCdvdXRmaXRzJylcclxuICAgIGlmIChoYXNPdXRmaXRUYWIpIG91dGZpdHMgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8T3V0Zml0W10+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRPdXRmaXRzJywgZnJhbWV3b3JrZElkKSBhcyBPdXRmaXRbXVxyXG5cclxuICAgIGxldCBtb2RlbHMgPSBbXVxyXG5cclxuICAgIGNvbnN0IGhhc0hlcml0YWdlVGFiID0gdGFicy5pbmNsdWRlcygnaGVyaXRhZ2UnKVxyXG4gICAgaWYgKGhhc0hlcml0YWdlVGFiKSB7XHJcbiAgICAgICAgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaGFzVGF0dG9vVGFiID0gdGFicy5pbmNsdWRlcygndGF0dG9vcycpXHJcbiAgICBsZXQgdGF0dG9vc1xyXG4gICAgaWYgKGhhc1RhdHRvb1RhYikge1xyXG4gICAgICAgIHRhdHRvb3MgPSBnZXRUYXR0b29EYXRhKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBibGFja2xpc3QgPSBnZXRCbGFja2xpc3Qoem9uZSlcclxuXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWRIYW5kbGUpXHJcblxyXG4gICAgaWYgKGNyZWF0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgbW9kZWwgPSBHZXRIYXNoS2V5KGdldFBsYXllckdlbmRlck1vZGVsKCkpO1xyXG4gICAgICAgIGF3YWl0IHNldE1vZGVsKG1vZGVsKTtcclxuICAgICAgICBhcHBlYXJhbmNlLm1vZGVsID0gbW9kZWw7XHJcbiAgICAgICAgZW1pdE5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2V0cm91dGluZ2J1Y2tldCcpXHJcbiAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQuZGF0YSwge1xyXG4gICAgICAgIHRhYnMsXHJcbiAgICAgICAgYXBwZWFyYW5jZSxcclxuICAgICAgICBibGFja2xpc3QsXHJcbiAgICAgICAgdGF0dG9vcyxcclxuICAgICAgICBvdXRmaXRzLFxyXG4gICAgICAgIG1vZGVscyxcclxuICAgICAgICBhbGxvd0V4aXQsXHJcbiAgICAgICAgam9iOiBnZXRKb2JJbmZvKCksXHJcbiAgICAgICAgbG9jYWxlOiBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKVxyXG4gICAgfSlcclxuICAgIFNldE51aUZvY3VzKHRydWUsIHRydWUpXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC52aXNpYmxlLCB0cnVlKVxyXG4gICAgb3BlbiA9IHRydWVcclxuXHJcbiAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuaGlkZUh1ZCh0cnVlKVxyXG5cclxuICAgIGlmIChwcm9taXNlKSB7XHJcbiAgICAgICAgYXdhaXQgcHJvbWlzZVxyXG4gICAgICAgIGVtaXROZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlc2V0cm91dGluZ2J1Y2tldCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb21pc2UgPSBudWxsO1xyXG4gICAgcmVzb2x2ZVByb21pc2UgPSBudWxsO1xyXG4gICAgcmV0dXJuIHRydWVcclxufVxyXG5cclxuZXhwb3J0cygnb3Blbk1lbnUnLCBvcGVuTWVudSlcclxuXHJcbmZ1bmN0aW9uIGdldEJsYWNrbGlzdCh6b25lOiBUQXBwZWFyYW5jZVpvbmUpIHtcclxuICAgIGlmICghem9uZSkgcmV0dXJuIHt9XHJcblxyXG4gICAgY29uc3Qge2dyb3VwVHlwZXMsIGJhc2V9ID0gY29uZmlnLmJsYWNrbGlzdCgpXHJcblxyXG4gICAgaWYgKCFncm91cFR5cGVzKSByZXR1cm4ge31cclxuICAgIGlmICghYmFzZSkgcmV0dXJuIHt9XHJcblxyXG4gICAgbGV0IGJsYWNrbGlzdCA9IHsuLi5iYXNlfVxyXG5cclxuICAgIGNvbnN0IHBsYXllckRhdGEgPSBnZXRQbGF5ZXJEYXRhKClcclxuXHJcblxyXG4gICAgZm9yIChjb25zdCB0eXBlIGluIGdyb3VwVHlwZXMpIHtcclxuICAgICAgICBjb25zdCBncm91cHMgPSBncm91cFR5cGVzW3R5cGVdXHJcbiAgICAgICAgZm9yIChjb25zdCBncm91cCBpbiBncm91cHMpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBza2lwOiBib29sZWFuID0gZmFsc2VcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09ICdqb2JzJyAmJiB6b25lLmpvYnMpIHtcclxuICAgICAgICAgICAgICAgIHNraXAgPSB6b25lLmpvYnMuaW5jbHVkZXMocGxheWVyRGF0YS5qb2IubmFtZSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ2dhbmdzJyAmJiB6b25lLmdhbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBza2lwID0gem9uZS5nYW5ncy5pbmNsdWRlcyhwbGF5ZXJEYXRhLmdhbmcubmFtZSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgKHR5cGUgPT0gJ2dyb3VwcycgJiYgem9uZS5ncm91cHMpIHtcclxuICAgICAgICAgICAgLy8gICAgIHNraXAgPSAhem9uZS5ncm91cHMuaW5jbHVkZXMocGxheWVyRGF0YS5ncm91cC5uYW1lKVxyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNraXApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGdyb3VwQmxhY2tsaXN0ID0gZ3JvdXBzW2dyb3VwXVxyXG4gICAgICAgICAgICAgICAgYmxhY2tsaXN0ID0gT2JqZWN0LmFzc2lnbih7fSwgYmxhY2tsaXN0LCBncm91cEJsYWNrbGlzdCwge1xyXG4gICAgICAgICAgICAgICAgICBkcmF3YWJsZXM6IE9iamVjdC5hc3NpZ24oe30sIGJsYWNrbGlzdC5kcmF3YWJsZXMsIGdyb3VwQmxhY2tsaXN0LmRyYXdhYmxlcylcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGJsYWNrbGlzdFxyXG5cclxuICAgIC8vIHJldHVybiBibGFja2xpc3RcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlTWVudSgpIHtcclxuICAgIFNldFBlZEFybW91cihwZWQsIGFybW91cilcclxuXHJcbiAgICBzdG9wQ2FtZXJhKClcclxuICAgIFNldE51aUZvY3VzKGZhbHNlLCBmYWxzZSlcclxuICAgIHNlbmROVUlFdmVudChTZW5kLnZpc2libGUsIGZhbHNlKVxyXG5cclxuXHJcbiAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuaGlkZUh1ZChmYWxzZSlcclxuXHJcbiAgICBpZiAocmVzb2x2ZVByb21pc2UpIHtcclxuICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xyXG4gICAgfVxyXG4gICAgb3BlbiA9IGZhbHNlXHJcbn1cclxuIiwgIlxuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXG5pbXBvcnQgeyBzZXRQZWRBcHBlYXJhbmNlIH0gZnJvbSBcIi4uL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXG5pbXBvcnQgeyBvcGVuTWVudSB9IGZyb20gXCIuLi9tZW51XCJcblxuZXhwb3J0IGZ1bmN0aW9uIFFCQnJpZGdlKCkge1xuICAgIG9uTmV0KCdxYi1jbG90aGluZzpjbGllbnQ6bG9hZFBsYXllckNsb3RoaW5nJywgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICBhd2FpdCBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcbiAgICB9KVxuXG4gICAgb25OZXQoJ3FiLWNsb3RoZXM6Y2xpZW50OkNyZWF0ZUZpcnN0Q2hhcmFjdGVyJywgKCkgPT4ge1xuICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKClcbiAgICB9KVxuXG4gICAgb25OZXQoJ3FiLWNsb3RoaW5nOmNsaWVudDpvcGVuT3V0Zml0TWVudScsICgpID0+IHtcbiAgICAgICAgb3Blbk1lbnUoeyB0eXBlOiBcIm91dGZpdHNcIiwgY29vcmRzOiBbMCwgMCwgMCwgMF0gfSkgIFxuICAgIH0pXG59IiwgIlxuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXG5pbXBvcnQgeyBzZXRQZWRBcHBlYXJhbmNlLCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlIH0gZnJvbSBcIi4uL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXG5pbXBvcnQgeyBnZXRGcmFtZXdvcmtJRCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSBcIkB1dGlsc1wiXG5cbmV4cG9ydCBmdW5jdGlvbiBFU1hCcmlkZ2UoKSB7XG4gICAgbGV0IGZpcnN0U3Bhd24gPSBmYWxzZVxuXG4gICAgb24oXCJlc3hfc2tpbjpyZXNldEZpcnN0U3Bhd25cIiwgKCkgPT4ge1xuICAgICAgICBmaXJzdFNwYXduID0gdHJ1ZVxuICAgIH0pO1xuXG4gICAgb24oXCJlc3hfc2tpbjpwbGF5ZXJSZWdpc3RlcmVkXCIsICgpID0+IHtcbiAgICAgICAgaWYoZmlyc3RTcGF3bilcbiAgICAgICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24oKVxuICAgIH0pO1xuXG4gICAgb25OZXQoJ3NraW5jaGFuZ2VyOmxvYWRTa2luMicsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgcGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgYXdhaXQgc2V0UGVkQXBwZWFyYW5jZShwZWQsIGFwcGVhcmFuY2UpXG4gICAgfSk7XG5cbiAgICBvbk5ldCgnc2tpbmNoYW5nZXI6Z2V0U2tpbicsIGFzeW5jIChjYjogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGZyYW1ld29ya0lEID0gYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxuICAgICAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxuICAgICAgICBjYihhcHBlYXJhbmNlKVxuICAgIH0pXG5cbiAgICBvbk5ldCgnc2tpbmNoYW5nZXI6bG9hZFNraW4nLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBhbnkpID0+IHtcbiAgICAgICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxuICAgICAgICBpZiAoY2IpIGNiKClcbiAgICB9KVxuXG4gICAgb25OZXQoJ2VzeF9za2luOm9wZW5TYXZlYWJsZU1lbnUnLCBhc3luYyAob25TdWJtaXQ6IGFueSkgPT4ge1xuICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKG9uU3VibWl0KVxuICAgIH0pXG59IiwgImltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIjtcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldERyYXdhYmxlcywgZ2V0SGFpciwgZ2V0SGVhZEJsZW5kRGF0YSwgZ2V0SGVhZE92ZXJsYXksIGdldEhlYWRTdHJ1Y3R1cmUsIGdldFByb3BzIH0gZnJvbSBcIi4uL2FwcGVhcmFuY2UvZ2V0dGVyc1wiO1xuaW1wb3J0IHsgc2V0RHJhd2FibGUsIHNldEhlYWRCbGVuZCwgc2V0SGVhZE92ZXJsYXksIHNldE1vZGVsLCBzZXRQZWRBcHBlYXJhbmNlLCBzZXRQZWRIYWlyQ29sb3JzLCBzZXRQZWRUYXR0b29zIH0gZnJvbSBcIi4uL2FwcGVhcmFuY2Uvc2V0dGVyc1wiO1xuaW1wb3J0IHsgVFRhdHRvbyB9IGZyb20gXCJAdHlwaW5ncy90YXR0b29zXCI7XG5cbmZ1bmN0aW9uIGV4cG9ydEhhbmRsZXIobmFtZTogc3RyaW5nLCBjYjogYW55KSB7XG4gICAgb24oJ19fY2Z4X2V4cG9ydF9pbGxlbml1bS1hcHBlYXJhbmNlXycgKyBuYW1lLCAoc2V0Q0I6IGFueSkgPT4ge1xuICAgICAgICBzZXRDQihjYik7XG4gICAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlsbGVuaXVtQ29tcGF0KCkge1xuICAgIGV4cG9ydEhhbmRsZXIoJ3N0YXJ0UGxheWVyQ3VzdG9taXphdGlvbicsICgpID0+IHtcbiAgICAgICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkluaXRpYWxDcmVhdGlvbigpXG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRNb2RlbCcsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gR2V0RW50aXR5TW9kZWwocGVkKVxuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkQ29tcG9uZW50cycsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0RHJhd2FibGVzKHBlZCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRQcm9wcycsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgIHJldHVybiBnZXRQcm9wcyhwZWQpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkSGVhZEJsZW5kJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXRIZWFkQmxlbmREYXRhKHBlZCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRGYWNlRmVhdHVyZXMnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldEhlYWRTdHJ1Y3R1cmUocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEhlYWRPdmVybGF5cycsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0SGVhZE92ZXJsYXkocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEhhaXInLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldEhhaXIocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEFwcGVhcmFuY2UnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldEFwcGVhcmFuY2UocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBsYXllck1vZGVsJywgKG1vZGVsOiBudW1iZXIpID0+IHtcbiAgICAgICAgc2V0TW9kZWwobW9kZWwpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkSGVhZEJsZW5kJywgKHBlZDogbnVtYmVyLCBibGVuZDogYW55KSA9PiB7XG4gICAgICAgIHNldEhlYWRCbGVuZChwZWQsIGJsZW5kKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZEZhY2VGZWF0dXJlcycsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWGlydmluIHdpbGwgaW1wbGVtZW50Jyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRIZWFkT3ZlcmxheXMnLCAocGVkOiBudW1iZXIsIG92ZXJsYXk6IGFueSkgPT4ge1xuICAgICAgICBzZXRIZWFkT3ZlcmxheShwZWQsIG92ZXJsYXkpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkSGFpcicsIGFzeW5jIChwZWQ6IG51bWJlciwgaGFpcjogYW55LCB0YXR0b286IGFueSkgPT4ge1xuICAgICAgICBhd2FpdCBzZXRQZWRIYWlyQ29sb3JzKHBlZCwgaGFpcik7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRFeWVDb2xvcicsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWGlydmluIHdpbGwgaW1wbGVtZW50Jyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRDb21wb25lbnQnLCAocGVkOiBudW1iZXIsIGRyYXdhYmxlOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgbmV3RHJhd2FibGUgPSB7XG4gICAgICAgICAgICBpbmRleDogZHJhd2FibGUuY29tcG9uZW50X2lkLFxuICAgICAgICAgICAgdmFsdWU6IGRyYXdhYmxlLmRyYXdhYmxlLFxuICAgICAgICAgICAgdGV4dHVyZTogZHJhd2FibGUudGV4dHVyZVxuICAgICAgICB9XG4gICAgICAgIHNldERyYXdhYmxlKHBlZCwgbmV3RHJhd2FibGUpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkQ29tcG9uZW50cycsIChwZWQ6IG51bWJlciwgY29tcG9uZW50czogYW55KSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgY29tcG9uZW50IG9mIGNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld0RyYXdhYmxlID0ge1xuICAgICAgICAgICAgICAgIGluZGV4OiBjb21wb25lbnQuY29tcG9uZW50X2lkLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBjb21wb25lbnQuZHJhd2FibGUsXG4gICAgICAgICAgICAgICAgdGV4dHVyZTogY29tcG9uZW50LnRleHR1cmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldERyYXdhYmxlKHBlZCwgbmV3RHJhd2FibGUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRQcm9wJywgKHBlZDogbnVtYmVyLCBwcm9wOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgbmV3UHJvcCA9IHtcbiAgICAgICAgICAgIGluZGV4OiBwcm9wLnByb3BfaWQsXG4gICAgICAgICAgICB2YWx1ZTogcHJvcC5kcmF3YWJsZSxcbiAgICAgICAgICAgIHRleHR1cmU6IHByb3AudGV4dHVyZVxuICAgICAgICB9XG4gICAgICAgIHNldERyYXdhYmxlKHBlZCwgbmV3UHJvcCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRQcm9wcycsIChwZWQ6IG51bWJlciwgcHJvcHM6IGFueSkgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdYaXJ2aW4gd2lsbCBpbXBsZW1lbnQnKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBsYXllckFwcGVhcmFuY2UnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ05lZWQgdG8gYmUgaW1wbGVtZW50ZWQnKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZEFwcGVhcmFuY2UnLCAocGVkOiBudW1iZXIsIGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlKSA9PiB7XG4gICAgICAgIHNldFBlZEFwcGVhcmFuY2UocGVkLCBhcHBlYXJhbmNlKVxuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkVGF0dG9vcycsIChwZWQ6IG51bWJlciwgdGF0dG9vczogVFRhdHRvb1tdKSA9PiB7XG4gICAgICAgIHNldFBlZFRhdHRvb3MocGVkLCB0YXR0b29zKVxuICAgIH0pO1xufSIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSwgVEFwcGVhcmFuY2Vab25lIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgeyBvcGVuTWVudSB9IGZyb20gXCIuL21lbnVcIlxyXG5pbXBvcnQgeyBzZXRQZWRBcHBlYXJhbmNlLCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlIH0gZnJvbSBcIi4vYXBwZWFyYW5jZS9zZXR0ZXJzXCJcclxuaW1wb3J0IHsgdHJpZ2dlclNlcnZlckNhbGxiYWNrLCBnZXRGcmFtZXdvcmtJRCwgRGVsYXksIGJsX2JyaWRnZSwgcGVkLCBkZWxheSwgZm9ybWF0IH0gZnJvbSBcIkB1dGlsc1wiXHJcbmltcG9ydCB7IFFCQnJpZGdlIH0gZnJvbSBcIi4vYnJpZGdlL3FiXCJcclxuaW1wb3J0IHsgRVNYQnJpZGdlIH0gZnJvbSBcIi4vYnJpZGdlL2VzeFwiXHJcbmltcG9ydCB7IGlsbGVuaXVtQ29tcGF0IH0gZnJvbSBcIi4vY29tcGF0L2lsbGVuaXVtXCJcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgnb3Blbk1lbnUnLCBhc3luYyAoKSA9PiB7XHJcbiAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKClcclxufSwgZmFsc2UpXHJcblxyXG5leHBvcnRzKCdTZXRQZWRBcHBlYXJhbmNlJywgYXN5bmMgKHBlZDogbnVtYmVyLCBhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSkgPT4ge1xyXG4gICAgYXdhaXQgc2V0UGVkQXBwZWFyYW5jZShwZWQsIGFwcGVhcmFuY2UpXHJcbn0pXHJcblxyXG5leHBvcnRzKCdTZXRQbGF5ZXJQZWRBcHBlYXJhbmNlJywgYXN5bmMgKGZyYW1ld29ya0lEKSA9PiB7XHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgaWYgKCFhcHBlYXJhbmNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBhcHBlYXJhbmNlIGZvdW5kJylcclxuICAgIH1cclxuICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSlcclxufSlcclxuXHJcbmV4cG9ydHMoJ0dldFBsYXllclBlZEFwcGVhcmFuY2UnLCBhc3luYyAoZnJhbWV3b3JrSUQpID0+IHtcclxuICAgIHJldHVybiBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcbn0pXHJcblxyXG5leHBvcnRzKCdJbml0aWFsQ3JlYXRpb24nLCBhc3luYyAoY2I/OiBGdW5jdGlvbikgPT4ge1xyXG4gICAgYXdhaXQgb3Blbk1lbnUoeyB0eXBlOiBcImFwcGVhcmFuY2VcIiwgY29vcmRzOiBbMCwgMCwgMCwgMF0gfSwgdHJ1ZSlcclxuICAgIGlmIChjYikgY2IoKVxyXG59KVxyXG5cclxub24oJ2JsX3Nwcml0ZXM6Y2xpZW50OnVzZVpvbmUnLCAoem9uZTogVEFwcGVhcmFuY2Vab25lKSA9PiB7XHJcbiAgICBvcGVuTWVudSh6b25lKVxyXG59KVxyXG5cclxub25OZXQoJ2JsX2JyaWRnZTpjbGllbnQ6cGxheWVyTG9hZGVkJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgd2hpbGUgKCFibF9icmlkZ2UuY29yZSgpLnBsYXllckxvYWRlZCgpKSB7XHJcbiAgICAgICAgYXdhaXQgRGVsYXkoMTAwKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGZyYW1ld29ya0lEID0gYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxuICAgIGlmICghYXBwZWFyYW5jZSkgcmV0dXJuO1xyXG4gICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxyXG59KVxyXG5cclxub25OZXQoJ29uUmVzb3VyY2VTdGFydCcsIGFzeW5jIChyZXNvdXJjZTogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAocmVzb3VyY2UgPT09IEdldEN1cnJlbnRSZXNvdXJjZU5hbWUoKSAmJiBibF9icmlkZ2UuY29yZSgpLnBsYXllckxvYWRlZCgpKSB7XHJcbiAgICAgICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICAgICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxuICAgICAgICBpZiAoIWFwcGVhcmFuY2UpIHJldHVybjtcclxuICAgICAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcbiAgICB9XHJcbn0pXHJcblxyXG5jb25zdCBmcmFtZXdvcmtOYW1lID0gYmxfYnJpZGdlLmdldEZyYW1ld29yaygnY29yZScpXHJcbmNvbnN0IGNvcmUgPSBmb3JtYXQoR2V0Q29udmFyKCdibDpmcmFtZXdvcmsnLCAncWInKSlcclxuXHJcbmlmIChjb3JlID09ICdxYicgfHwgY29yZSA9PSAncWJ4JyAmJiBHZXRSZXNvdXJjZVN0YXRlKGZyYW1ld29ya05hbWUpID09ICdzdGFydGVkJykge1xyXG4gICAgUUJCcmlkZ2UoKTtcclxufSBlbHNlIGlmIChjb3JlID09ICdlc3gnICYmIEdldFJlc291cmNlU3RhdGUoZnJhbWV3b3JrTmFtZSkgPT0gJ3N0YXJ0ZWQnKSB7XHJcbiAgICBFU1hCcmlkZ2UoKTtcclxufVxyXG5cclxuaWxsZW5pdW1Db21wYXQoKTtcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgncmVsb2Fkc2tpbicsIGFzeW5jICgpID0+IHtcclxuICAgIGNvbnN0IGZyYW1ld29ya0lEID0gYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgY29uc3QgaGVhbHRoID0gR2V0RW50aXR5SGVhbHRoKHBlZCk7XHJcbiAgICBjb25zdCBtYXhoZWFsdGggPSBHZXRFbnRpdHlNYXhIZWFsdGgocGVkKTtcclxuICAgIGNvbnN0IGFybW9yID0gR2V0UGVkQXJtb3VyKHBlZCk7XHJcblxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxuICAgIGlmICghYXBwZWFyYW5jZSkgcmV0dXJuO1xyXG4gICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxyXG5cclxuICAgIFNldFBlZE1heEhlYWx0aChwZWQsIG1heGhlYWx0aClcclxuICAgIGRlbGF5KDEwMDApIFxyXG4gICAgU2V0RW50aXR5SGVhbHRoKHBlZCwgaGVhbHRoKVxyXG4gICAgU2V0UGVkQXJtb3VyKHBlZCwgYXJtb3IpXHJcbn0sIGZhbHNlKVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7O0FBQU8sSUFBSSxNQUFNO0FBRVYsSUFBTSxZQUFZLHdCQUFDLGNBQXNCO0FBQzVDLFFBQU07QUFDVixHQUZ5QjtBQWFsQixJQUFNLGVBQWUsd0JBQUMsUUFBZ0IsU0FBYztBQUN2RCxp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QUc7QUFDZixDQUFDO0FBRUQsR0FBRyw2QkFBNkIsQ0FBQyxTQUEwQjtBQUN2RCxXQUFTLElBQUk7QUFDakIsQ0FBQztBQUVELE1BQU0saUNBQWlDLFlBQVk7QUFDL0MsU0FBTyxDQUFDLFVBQVUsS0FBSyxFQUFFLGFBQWEsR0FBRztBQUNyQyxVQUFNLE1BQU0sR0FBRztBQUFBLEVBQ25CO0FBQ0EsUUFBTSxjQUFjLE1BQU0sZUFBZTtBQUN6QyxRQUFNLGFBQWEsTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFDN0csTUFBSSxDQUFDO0FBQVk7QUFDakIsUUFBTSx1QkFBdUIsVUFBVTtBQUMzQyxDQUFDO0FBRUQsTUFBTSxtQkFBbUIsT0FBTyxhQUFxQjtBQUNqRCxNQUFJLGFBQWEsdUJBQXVCLEtBQUssVUFBVSxLQUFLLEVBQUUsYUFBYSxHQUFHO0FBQzFFLFVBQU0sY0FBYyxNQUFNLGVBQWU7QUFDekMsVUFBTSxhQUFhLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQzdHLFFBQUksQ0FBQztBQUFZO0FBQ2pCLFVBQU0sdUJBQXVCLFVBQVU7QUFBQSxFQUMzQztBQUNKLENBQUM7QUFFRCxJQUFNLGdCQUFnQixVQUFVLGFBQWEsTUFBTTtBQUNuRCxJQUFNLE9BQU8sT0FBTyxVQUFVLGdCQUFnQixJQUFJLENBQUM7QUFFbkQsSUFBSSxRQUFRLFFBQVEsUUFBUSxTQUFTLGlCQUFpQixhQUFhLEtBQUssV0FBVztBQUMvRSxXQUFTO0FBQ2IsV0FBVyxRQUFRLFNBQVMsaUJBQWlCLGFBQWEsS0FBSyxXQUFXO0FBQ3RFLFlBQVU7QUFDZDtBQUVBLGVBQWU7QUFFZixnQkFBZ0IsY0FBYyxZQUFZO0FBQ3RDLFFBQU0sY0FBYyxNQUFNLGVBQWU7QUFDekMsUUFBTSxTQUFTLGdCQUFnQixHQUFHO0FBQ2xDLFFBQU0sWUFBWSxtQkFBbUIsR0FBRztBQUN4QyxRQUFNLFFBQVEsYUFBYSxHQUFHO0FBRTlCLFFBQU0sYUFBYSxNQUFNLHNCQUFtQyxzQ0FBc0MsV0FBVztBQUM3RyxNQUFJLENBQUM7QUFBWTtBQUNqQixRQUFNLHVCQUF1QixVQUFVO0FBRXZDLGtCQUFnQixLQUFLLFNBQVM7QUFDOUIsUUFBTSxHQUFJO0FBQ1Ysa0JBQWdCLEtBQUssTUFBTTtBQUMzQixlQUFhLEtBQUssS0FBSztBQUMzQixHQUFHLEtBQUs7IiwKICAibmFtZXMiOiBbImRlbGF5IiwgIngiLCAieSIsICJ6IiwgImNvbmZpZyIsICJwZWQiLCAicGVkIiwgInBlZCIsICJwZWQiXQp9Cg==
