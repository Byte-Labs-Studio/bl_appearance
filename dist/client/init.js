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
  HideHud(true);
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
  HideHud(false);
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
    console.warn("Xirvin will implement");
  });
  exportHandler("getPedComponents", (ped2) => {
    return getDrawables(ped2);
  });
  exportHandler("getPedProps", (ped2) => {
    return getProps(ped2);
  });
  exportHandler("getPedHeadBlend", () => {
    return console.warn("Xirvin will implement");
  });
  exportHandler("getPedFaceFeatures", () => {
    return console.warn("Xirvin will implement");
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
    return console.warn("Xirvin will implement");
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
  exportHandler("setPedAppearance", () => {
    return console.warn("Need to be implemented");
  });
  exportHandler("setPedTattoos", () => {
    return console.warn("Need to be implemented");
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
var HideHud = /* @__PURE__ */ __name((state = true) => {
  exports.bl_appearance.hideHud(state);
}, "HideHud");
export {
  HideHud
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvcWIudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvZXN4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvY29tcGF0L2lsbGVuaXVtLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvaW5pdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCBwZWQgPSAwXHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlUGVkID0gKHBlZEhhbmRsZTogbnVtYmVyKSA9PiB7XHJcbiAgICBwZWQgPSBwZWRIYW5kbGVcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlYnVnZGF0YSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGEsIChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0sIDIpKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2VuZE5VSUV2ZW50ID0gKGFjdGlvbjogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcclxuICAgIFNlbmROVUlNZXNzYWdlKHtcclxuICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TW9kZWwgPSBhc3luYyAobW9kZWw6IHN0cmluZyB8IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiA9PiB7XHJcbiAgICBsZXQgbW9kZWxIYXNoOiBudW1iZXIgPSB0eXBlb2YgbW9kZWwgPT09ICdudW1iZXInID8gbW9kZWwgOiBHZXRIYXNoS2V5KG1vZGVsKVxyXG5cclxuICAgIGlmICghSXNNb2RlbFZhbGlkKG1vZGVsSGFzaCkpIHtcclxuICAgICAgICBleHBvcnRzLmJsX2JyaWRnZS5ub3RpZnkoKSh7XHJcbiAgICAgICAgICAgIHRpdGxlOiAnSW52YWxpZCBtb2RlbCEnLFxyXG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgICBkdXJhdGlvbjogMTAwMFxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgYXR0ZW1wdGVkIHRvIGxvYWQgaW52YWxpZCBtb2RlbCAnJHttb2RlbH0nYCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKEhhc01vZGVsTG9hZGVkKG1vZGVsSGFzaCkpIHJldHVybiBtb2RlbEhhc2hcclxuICAgIFxyXG4gICAgUmVxdWVzdE1vZGVsKG1vZGVsSGFzaCk7XHJcblxyXG4gICAgY29uc3Qgd2FpdEZvck1vZGVsTG9hZGVkID0gKCk6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgYXdhaXQgd2FpdEZvck1vZGVsTG9hZGVkKCk7XHJcblxyXG4gICAgcmV0dXJuIG1vZGVsSGFzaDtcclxufTtcclxuXHJcblxyXG4vL2NhbGxiYWNrXHJcbi8vaHR0cHM6Ly9naXRodWIuY29tL292ZXJleHRlbmRlZC9veF9saWIvYmxvYi9tYXN0ZXIvcGFja2FnZS9jbGllbnQvcmVzb3VyY2UvY2FsbGJhY2svaW5kZXgudHNcclxuXHJcbmNvbnN0IHJlc291cmNlTmFtZSA9IEdldEN1cnJlbnRSZXNvdXJjZU5hbWUoKVxyXG5jb25zdCBldmVudFRpbWVyczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xyXG5jb25zdCBhY3RpdmVFdmVudHM6IFJlY29yZDxzdHJpbmcsICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4gPSB7fTtcclxuXHJcbmZ1bmN0aW9uIGV2ZW50VGltZXIoZXZlbnROYW1lOiBzdHJpbmcsIGRlbGF5OiBudW1iZXIgfCBudWxsKSB7XHJcbiAgICBpZiAoZGVsYXkgJiYgZGVsYXkgPiAwKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBHZXRHYW1lVGltZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKChldmVudFRpbWVyc1tldmVudE5hbWVdIHx8IDApID4gY3VycmVudFRpbWUpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgZXZlbnRUaW1lcnNbZXZlbnROYW1lXSA9IGN1cnJlbnRUaW1lICsgZGVsYXk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbm9uTmV0KGBfYmxfY2JfJHtyZXNvdXJjZU5hbWV9YCwgKGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnkpID0+IHtcclxuICAgIGNvbnN0IHJlc29sdmUgPSBhY3RpdmVFdmVudHNba2V5XTtcclxuICAgIHJldHVybiByZXNvbHZlICYmIHJlc29sdmUoLi4uYXJncyk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUID0gdW5rbm93bj4oXHJcbiAgICBldmVudE5hbWU6IHN0cmluZywgLi4uYXJnczogYW55XHJcbik6IFByb21pc2U8VD4gfCB2b2lkIHtcclxuICAgIGlmICghZXZlbnRUaW1lcihldmVudE5hbWUsIDApKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBrZXk6IHN0cmluZztcclxuXHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuICAgIGVtaXROZXQoYF9ibF9jYl8ke2V2ZW50TmFtZX1gLCByZXNvdXJjZU5hbWUsIGtleSwgLi4uYXJncyk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgYWN0aXZlRXZlbnRzW2tleV0gPSByZXNvbHZlO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb25TZXJ2ZXJDYWxsYmFjayhldmVudE5hbWUsIGNiKSB7XHJcbiAgICBvbk5ldChgX2JsX2NiXyR7ZXZlbnROYW1lfWAsIGFzeW5jIChyZXNvdXJjZSwga2V5LCAuLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgbGV0IHJlc3BvbnNlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlID0gYXdhaXQgY2IoLi4uYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGhhbmRsaW5nIGNhbGxiYWNrIGV2ZW50ICR7ZXZlbnROYW1lfWApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgXjMke2Uuc3RhY2t9XjBgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZW1pdE5ldChgX2JsX2NiXyR7cmVzb3VyY2V9YCwga2V5LCByZXNwb25zZSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLy9sb2NhbGVcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TG9jYWxlID0gKHJlc291cmNlU2V0TmFtZTogc3RyaW5nKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICBjb25zdCBjaGVja1Jlc291cmNlRmlsZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKFJlcXVlc3RSZXNvdXJjZUZpbGVTZXQocmVzb3VyY2VTZXROYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudExhbiA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5jb25maWcoKS5sb2NhbGVcclxuICAgICAgICAgICAgICAgIGxldCBsb2NhbGVGaWxlQ29udGVudCA9IExvYWRSZXNvdXJjZUZpbGUocmVzb3VyY2VOYW1lLCBgbG9jYWxlLyR7Y3VycmVudExhbn0uanNvbmApO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbGVGaWxlQ29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y3VycmVudExhbn0uanNvbiBub3QgZm91bmQgaW4gbG9jYWxlLCBwbGVhc2UgdmVyaWZ5ISwgd2UgdXNlZCBlbmdsaXNoIGZvciBub3chYClcclxuICAgICAgICAgICAgICAgICAgICBsb2NhbGVGaWxlQ29udGVudCA9IExvYWRSZXNvdXJjZUZpbGUocmVzb3VyY2VOYW1lLCBgbG9jYWxlL2VuLmpzb25gKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShsb2NhbGVGaWxlQ29udGVudCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGNoZWNrUmVzb3VyY2VGaWxlLCAxMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNoZWNrUmVzb3VyY2VGaWxlKCk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGxvY2FsZSA9IGFzeW5jIChpZDogc3RyaW5nLCAuLi5hcmdzOiBzdHJpbmdbXSkgPT4ge1xyXG4gICAgY29uc3QgbG9jYWxlID0gYXdhaXQgcmVxdWVzdExvY2FsZSgnbG9jYWxlJyk7XHJcbiAgICBsZXQgYXJnSW5kZXggPSAwO1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IGxvY2FsZVtpZF0ucmVwbGFjZSgvJXMvZywgKG1hdGNoOiBzdHJpbmcpID0+IGFyZ0luZGV4IDwgYXJncy5sZW5ndGggPyBhcmdzW2FyZ0luZGV4XSA6IG1hdGNoKTtcclxuICAgIHJldHVybiByZXN1bHRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGJsX2JyaWRnZSA9IGV4cG9ydHMuYmxfYnJpZGdlXHJcblxyXG5leHBvcnQgY29uc3QgZ2V0UGxheWVyRGF0YSA9ICgpID0+IHtcclxuICAgIHJldHVybiBibF9icmlkZ2UuY29yZSgpLmdldFBsYXllckRhdGEoKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0RnJhbWV3b3JrSUQgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBpZCA9IGdldFBsYXllckRhdGEoKS5jaWRcclxuICAgIHJldHVybiBpZFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0UGxheWVyR2VuZGVyTW9kZWwgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBnZW5kZXIgPSBnZXRQbGF5ZXJEYXRhKCkuZ2VuZGVyXHJcbiAgICByZXR1cm4gZ2VuZGVyID09PSAnbWFsZScgPyAnbXBfbV9mcmVlbW9kZV8wMScgOiAnbXBfZl9mcmVlbW9kZV8wMSdcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIERlbGF5KG1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChzdHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBpZiAoIXN0ci5pbmNsdWRlcyhcIidcIikpIHJldHVybiBzdHI7XHJcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLycvZywgXCJcIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRKb2JJbmZvKCk6IHsgbmFtZTogc3RyaW5nLCBpc0Jvc3M6IGJvb2xlYW4gfSB7XHJcbiAgICBjb25zdCBqb2IgPSBnZXRQbGF5ZXJEYXRhKCkuam9iXHJcbiAgICByZXR1cm4geyBuYW1lOiBqb2IubmFtZSwgaXNCb3NzOiBqb2IuaXNCb3NzIH1cclxufSIsICJpbXBvcnQgeyBDYW1lcmEsIFZlY3RvcjMsIFRDYW1lcmFCb25lcyB9IGZyb20gJ0B0eXBpbmdzL2NhbWVyYSc7XHJcbmltcG9ydCB7IGRlbGF5LCBwZWQgfSBmcm9tICdAdXRpbHMnO1xyXG5pbXBvcnQgeyBSZWNlaXZlIH0gZnJvbSAnQGV2ZW50cyc7XHJcblxyXG5jb25zdCBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRSA9IDIuMDtcclxuY29uc3QgREVGQVVMVF9NQVhfRElTVEFOQ0UgPSAxLjA7XHJcblxyXG5sZXQgcnVubmluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgY2FtRGlzdGFuY2U6IG51bWJlciA9IDEuODtcclxubGV0IGNhbTogQ2FtZXJhIHwgbnVsbCA9IG51bGw7XHJcbmxldCBhbmdsZVk6IG51bWJlciA9IDAuMDtcclxubGV0IGFuZ2xlWjogbnVtYmVyID0gMC4wO1xyXG5sZXQgdGFyZ2V0Q29vcmRzOiBWZWN0b3IzIHwgbnVsbCA9IG51bGw7XHJcbmxldCBvbGRDYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgY2hhbmdpbmdDYW06IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGxhc3RYOiBudW1iZXIgPSAwO1xyXG5sZXQgY3VycmVudEJvbmU6IGtleW9mIFRDYW1lcmFCb25lcyA9ICdoZWFkJztcclxuXHJcbmNvbnN0IENhbWVyYUJvbmVzOiBUQ2FtZXJhQm9uZXMgPSB7XHJcbiAgICB3aG9sZTogMCxcclxuXHRoZWFkOiAzMTA4NixcclxuXHR0b3JzbzogMjQ4MTgsXHJcblx0bGVnczogWzE2MzM1LCA0NjA3OF0sXHJcbiAgICBzaG9lczogWzE0MjAxLCA1MjMwMV0sXHJcbn07XHJcblxyXG5jb25zdCBjb3MgPSAoZGVncmVlczogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuXHRyZXR1cm4gTWF0aC5jb3MoKGRlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MCk7XHJcbn07XHJcblxyXG5jb25zdCBzaW4gPSAoZGVncmVlczogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuXHRyZXR1cm4gTWF0aC5zaW4oKGRlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MCk7XHJcbn07XHJcblxyXG5jb25zdCBnZXRBbmdsZXMgPSAoKTogbnVtYmVyW10gPT4ge1xyXG5cdGNvbnN0IHggPVxyXG5cdFx0KChjb3MoYW5nbGVaKSAqIGNvcyhhbmdsZVkpICsgY29zKGFuZ2xlWSkgKiBjb3MoYW5nbGVaKSkgLyAyKSAqXHJcblx0XHRjYW1EaXN0YW5jZTtcclxuXHRjb25zdCB5ID1cclxuXHRcdCgoc2luKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSArIGNvcyhhbmdsZVkpICogc2luKGFuZ2xlWikpIC8gMikgKlxyXG5cdFx0Y2FtRGlzdGFuY2U7XHJcblx0Y29uc3QgeiA9IHNpbihhbmdsZVkpICogY2FtRGlzdGFuY2U7XHJcblxyXG5cdHJldHVybiBbeCwgeSwgel07XHJcbn07XHJcblxyXG5jb25zdCBzZXRDYW1Qb3NpdGlvbiA9IChtb3VzZVg/OiBudW1iZXIsIG1vdXNlWT86IG51bWJlcik6IHZvaWQgPT4ge1xyXG5cdGlmICghcnVubmluZyB8fCAhdGFyZ2V0Q29vcmRzIHx8IGNoYW5naW5nQ2FtKSByZXR1cm47XHJcblxyXG5cdG1vdXNlWCA9IG1vdXNlWCA/PyAwLjA7XHJcblx0bW91c2VZID0gbW91c2VZID8/IDAuMDtcclxuXHJcblx0YW5nbGVaIC09IG1vdXNlWDtcclxuXHRhbmdsZVkgKz0gbW91c2VZO1xyXG5cclxuICAgIGNvbnN0IGlzSGVhZE9yV2hvbGUgPSBjdXJyZW50Qm9uZSA9PT0gJ3dob2xlJyB8fCBjdXJyZW50Qm9uZSA9PT0gJ2hlYWQnO1xyXG4gICAgY29uc3QgbWF4QW5nbGUgPSBpc0hlYWRPcldob2xlID8gODkuMCA6IDcwLjA7XHJcbiAgICBcclxuICAgIGNvbnN0IGlzU2hvZXMgPSBjdXJyZW50Qm9uZSA9PT0gJ3Nob2VzJztcclxuICAgIGNvbnN0IG1pbkFuZ2xlID0gaXNTaG9lcyA/IDUuMCA6IC0yMC4wO1xyXG5cclxuXHRhbmdsZVkgPSBNYXRoLm1pbihNYXRoLm1heChhbmdsZVksIG1pbkFuZ2xlKSwgbWF4QW5nbGUpO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKTtcclxuXHJcblx0U2V0Q2FtQ29vcmQoXHJcblx0XHRjYW0sXHJcblx0XHR0YXJnZXRDb29yZHMueCArIHgsXHJcblx0XHR0YXJnZXRDb29yZHMueSArIHksXHJcblx0XHR0YXJnZXRDb29yZHMueiArIHpcclxuXHQpO1xyXG5cdFBvaW50Q2FtQXRDb29yZChjYW0sIHRhcmdldENvb3Jkcy54LCB0YXJnZXRDb29yZHMueSwgdGFyZ2V0Q29vcmRzLnopO1xyXG59O1xyXG5cclxuY29uc3QgbW92ZUNhbWVyYSA9IGFzeW5jIChjb29yZHM6IFZlY3RvcjMsIGRpc3RhbmNlPzogbnVtYmVyKSA9PiB7XHJcblx0Y29uc3QgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpICsgOTQ7XHJcblx0ZGlzdGFuY2UgPSBkaXN0YW5jZSA/PyAxLjA7XHJcblxyXG5cdGNoYW5naW5nQ2FtID0gdHJ1ZTtcclxuXHRjYW1EaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG5cdGFuZ2xlWiA9IGhlYWRpbmc7XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpO1xyXG5cclxuXHRjb25zdCBuZXdjYW06IENhbWVyYSA9IENyZWF0ZUNhbVdpdGhQYXJhbXMoXHJcblx0XHQnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLFxyXG5cdFx0Y29vcmRzLnggKyB4LFxyXG5cdFx0Y29vcmRzLnkgKyB5LFxyXG5cdFx0Y29vcmRzLnogKyB6LFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0NzAuMCxcclxuXHRcdGZhbHNlLFxyXG5cdFx0MFxyXG5cdCk7XHJcblxyXG5cdHRhcmdldENvb3JkcyA9IGNvb3JkcztcclxuXHRjaGFuZ2luZ0NhbSA9IGZhbHNlO1xyXG5cdG9sZENhbSA9IGNhbTtcclxuXHRjYW0gPSBuZXdjYW07XHJcblxyXG5cdFBvaW50Q2FtQXRDb29yZChuZXdjYW0sIGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnopO1xyXG5cdFNldENhbUFjdGl2ZVdpdGhJbnRlcnAobmV3Y2FtLCBvbGRDYW0sIDI1MCwgMCwgMCk7XHJcblxyXG5cdGF3YWl0IGRlbGF5KDI1MCk7XHJcblxyXG5cdFNldENhbVVzZVNoYWxsb3dEb2ZNb2RlKG5ld2NhbSwgdHJ1ZSk7XHJcblx0U2V0Q2FtTmVhckRvZihuZXdjYW0sIDAuNCk7XHJcblx0U2V0Q2FtRmFyRG9mKG5ld2NhbSwgMS4yKTtcclxuXHRTZXRDYW1Eb2ZTdHJlbmd0aChuZXdjYW0sIDAuMyk7XHJcblx0dXNlSGlEb2YobmV3Y2FtKTtcclxuXHJcblx0RGVzdHJveUNhbShvbGRDYW0sIHRydWUpO1xyXG59O1xyXG5cclxuY29uc3QgdXNlSGlEb2YgPSAoY3VycmVudGNhbTogQ2FtZXJhKSA9PiB7XHJcblx0aWYgKCEoRG9lc0NhbUV4aXN0KGNhbSkgJiYgY3VycmVudGNhbSA9PSBjYW0pKSByZXR1cm47XHJcblx0U2V0VXNlSGlEb2YoKTtcclxuXHRzZXRUaW1lb3V0KHVzZUhpRG9mLCAwKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdGFydENhbWVyYSA9ICgpID0+IHtcclxuXHRpZiAocnVubmluZykgcmV0dXJuO1xyXG5cdHJ1bm5pbmcgPSB0cnVlO1xyXG5cdGNhbURpc3RhbmNlID0gV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0VcclxuXHRjYW0gPSBDcmVhdGVDYW0oJ0RFRkFVTFRfU0NSSVBURURfQ0FNRVJBJywgdHJ1ZSk7XHJcblx0Y29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCAzMTA4NiwgMC4wLCAwLjAsIDAuMCk7XHJcblx0U2V0Q2FtQ29vcmQoY2FtLCB4LCB5LCB6KTtcclxuXHRSZW5kZXJTY3JpcHRDYW1zKHRydWUsIHRydWUsIDEwMDAsIHRydWUsIHRydWUpO1xyXG5cdC8vIG1vdmVDYW1lcmEoeyB4OiB4LCB5OiB5LCB6OiB6IH0sIGNhbURpc3RhbmNlKTtcclxuICAgIHNldENhbWVyYSgnd2hvbGUnLCBjYW1EaXN0YW5jZSk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc3RvcENhbWVyYSA9ICgpOiB2b2lkID0+IHtcclxuXHRpZiAoIXJ1bm5pbmcpIHJldHVybjtcclxuXHRydW5uaW5nID0gZmFsc2U7XHJcblxyXG5cdFJlbmRlclNjcmlwdENhbXMoZmFsc2UsIHRydWUsIDI1MCwgdHJ1ZSwgZmFsc2UpO1xyXG5cdERlc3Ryb3lDYW0oY2FtLCB0cnVlKTtcclxuXHRjYW0gPSBudWxsO1xyXG5cdHRhcmdldENvb3JkcyA9IG51bGw7XHJcbn07XHJcblxyXG5jb25zdCBzZXRDYW1lcmEgPSAodHlwZT86IGtleW9mIFRDYW1lcmFCb25lcywgZGlzdGFuY2UgPSBjYW1EaXN0YW5jZSk6IHZvaWQgPT4ge1xyXG5cclxuXHRjb25zdCBib25lOiBudW1iZXIgfCBudW1iZXJbXSB8IHVuZGVmaW5lZCA9IENhbWVyYUJvbmVzW3R5cGVdO1xyXG5cclxuICAgIGNvbnN0IGlzQm9uZUFycmF5ID0gQXJyYXkuaXNBcnJheShib25lKVxyXG5cclxuICAgIGN1cnJlbnRCb25lID0gdHlwZTtcclxuXHJcbiAgICBpZiAoIWlzQm9uZUFycmF5ICYmIGJvbmUgPT09IDApIHtcclxuICAgICAgICBjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gR2V0RW50aXR5Q29vcmRzKHBlZCwgZmFsc2UpO1xyXG4gICAgICAgIG1vdmVDYW1lcmEoXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICAgICAgICB5OiB5LFxyXG4gICAgICAgICAgICAgICAgejogeiArIDAuMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGlzdGFuY2VcclxuICAgICAgICApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBpdHMgbm90IHdob2xlIGJvZHksIHRoZW4gd2UgbmVlZCB0byBsaW1pdCB0aGUgZGlzdGFuY2VcclxuICAgIGlmIChkaXN0YW5jZSA+IERFRkFVTFRfTUFYX0RJU1RBTkNFKSBkaXN0YW5jZSA9IERFRkFVTFRfTUFYX0RJU1RBTkNFO1xyXG5cclxuICAgIGlmIChpc0JvbmVBcnJheSkge1xyXG4gICAgICAgIGNvbnN0IFt4MSwgeTEsIHoxXTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZVswXSwgMC4wLCAwLjAsIDAuMClcclxuXHJcbiAgICAgICAgY29uc3QgW3gyLCB5MiwgejJdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCBib25lWzFdLCAwLjAsIDAuMCwgMC4wKVxyXG5cclxuICAgICAgICAvLyBnZXQgdGhlIG1pZGRsZSBvZiB0aGUgdHdvIHBvaW50c1xyXG4gICAgICAgIHZhciB4ID0gKHgxICsgeDIpIC8gMjtcclxuICAgICAgICB2YXIgeSA9ICh5MSArIHkyKSAvIDI7XHJcbiAgICAgICAgdmFyIHogPSAoejEgKyB6MikgLyAyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCBib25lLCAwLjAsIDAuMCwgMC4wKVxyXG4gICAgfVxyXG5cclxuXHRtb3ZlQ2FtZXJhKFxyXG5cdFx0e1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5LFxyXG5cdFx0XHR6OiB6ICsgMC4wLFxyXG5cdFx0fSxcclxuXHRcdGRpc3RhbmNlXHJcblx0KTtcclxuXHJcbn07XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtTW92ZSwgKGRhdGEsIGNiKSA9PiB7XHJcbiAgICBzZXRDYW1Qb3NpdGlvbihkYXRhLngsIGRhdGEueSk7XHJcbiAgICBjYigxKTtcclxufSk7XHJcblxyXG50eXBlIFRTZWN0aW9uID0gJ3dob2xlJyB8ICdoZWFkJyB8ICd0b3JzbycgfCAnbGVncycgfCAnc2hvZXMnO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVNlY3Rpb24sICh0eXBlOiBUU2VjdGlvbiwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnd2hvbGUnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ3dob2xlJywgV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0UpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdoZWFkJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCdoZWFkJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3RvcnNvJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCd0b3JzbycpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdsZWdzJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCdsZWdzJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3Nob2VzJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCdzaG9lcycpO1xyXG4gICAgICAgICAgICBzZXRDYW1Qb3NpdGlvbigpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHR9XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVpvb20sIChkYXRhLCBjYikgPT4ge1xyXG5cdGlmIChkYXRhID09PSAnZG93bicpIHtcclxuXHJcbiAgICAgICAgY29uc3QgbWF4Wm9vbSA9IGN1cnJlbnRCb25lID09PSAnd2hvbGUnID8gV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0UgOiBERUZBVUxUX01BWF9ESVNUQU5DRTtcclxuXHJcblx0XHRjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgKyAwLjA1O1xyXG5cdFx0Y2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA+PSBtYXhab29tID8gbWF4Wm9vbSA6IG5ld0Rpc3RhbmNlO1xyXG5cdH0gZWxzZSBpZiAoZGF0YSA9PT0gJ3VwJykge1xyXG5cdFx0Y29uc3QgbmV3RGlzdGFuY2U6IG51bWJlciA9IGNhbURpc3RhbmNlIC0gMC4wNTtcclxuXHRcdGNhbURpc3RhbmNlID0gbmV3RGlzdGFuY2UgPD0gMC4zID8gMC4zIDogbmV3RGlzdGFuY2U7XHJcblx0fVxyXG5cclxuXHRjYW1EaXN0YW5jZSA9IGNhbURpc3RhbmNlO1xyXG5cdHNldENhbVBvc2l0aW9uKCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiQmxlbWlzaGVzXCIsXG4gICAgXCJGYWNpYWxIYWlyXCIsXG4gICAgXCJFeWVicm93c1wiLFxuICAgIFwiQWdlaW5nXCIsXG4gICAgXCJNYWtldXBcIixcbiAgICBcIkJsdXNoXCIsXG4gICAgXCJDb21wbGV4aW9uXCIsXG4gICAgXCJTdW5EYW1hZ2VcIixcbiAgICBcIkxpcHN0aWNrXCIsXG4gICAgXCJNb2xlc0ZyZWNrbGVzXCIsXG4gICAgXCJDaGVzdEhhaXJcIixcbiAgICBcIkJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkFkZEJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkV5ZUNvbG9yXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJOb3NlX1dpZHRoXCIsXG4gICAgXCJOb3NlX1BlYWtfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTGVuZ2h0XCIsXG4gICAgXCJOb3NlX0JvbmVfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTG93ZXJpbmdcIixcbiAgICBcIk5vc2VfQm9uZV9Ud2lzdFwiLFxuICAgIFwiRXllQnJvd25fSGVpZ2h0XCIsXG4gICAgXCJFeWVCcm93bl9Gb3J3YXJkXCIsXG4gICAgXCJDaGVla3NfQm9uZV9IaWdoXCIsXG4gICAgXCJDaGVla3NfQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hlZWtzX1dpZHRoXCIsXG4gICAgXCJFeWVzX09wZW5uaW5nXCIsXG4gICAgXCJMaXBzX1RoaWNrbmVzc1wiLFxuICAgIFwiSmF3X0JvbmVfV2lkdGhcIixcbiAgICBcIkphd19Cb25lX0JhY2tfTGVuZ2h0XCIsXG4gICAgXCJDaGluX0JvbmVfTG93ZXJpbmdcIixcbiAgICBcIkNoaW5fQm9uZV9MZW5ndGhcIixcbiAgICBcIkNoaW5fQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hpbl9Ib2xlXCIsXG4gICAgXCJOZWNrX1RoaWtuZXNzXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJmYWNlXCIsXG4gICAgXCJtYXNrc1wiLFxuICAgIFwiaGFpclwiLFxuICAgIFwidG9yc29zXCIsXG4gICAgXCJsZWdzXCIsXG4gICAgXCJiYWdzXCIsXG4gICAgXCJzaG9lc1wiLFxuICAgIFwibmVja1wiLFxuICAgIFwic2hpcnRzXCIsXG4gICAgXCJ2ZXN0XCIsXG4gICAgXCJkZWNhbHNcIixcbiAgICBcImphY2tldHNcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImhhdHNcIixcbiAgICBcImdsYXNzZXNcIixcbiAgICBcImVhcnJpbmdzXCIsXG4gICAgXCJtb3V0aFwiLFxuICAgIFwibGhhbmRcIixcbiAgICBcInJoYW5kXCIsXG4gICAgXCJ3YXRjaGVzXCIsXG4gICAgXCJicmFjZWxldHNcIlxuXVxuIiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUSGFpckRhdGEsIFRIZWFkT3ZlcmxheSwgVEhlYWRPdmVybGF5VG90YWwgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCBIRUFEX09WRVJMQVlTIGZyb20gXCJAZGF0YS9oZWFkXCJcclxuaW1wb3J0IEZBQ0VfRkVBVFVSRVMgZnJvbSBcIkBkYXRhL2ZhY2VcIlxyXG5pbXBvcnQgRFJBV0FCTEVfTkFNRVMgZnJvbSBcIkBkYXRhL2RyYXdhYmxlc1wiXHJcbmltcG9ydCBQUk9QX05BTUVTIGZyb20gXCJAZGF0YS9wcm9wc1wiXHJcbmltcG9ydCB7IHBlZCwgb25TZXJ2ZXJDYWxsYmFjayB9IGZyb20gJ0B1dGlscyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZE1vZGVsSW5kZXgodGFyZ2V0OiBudW1iZXIpIHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZVxyXG4gICAgY29uc3QgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcblxyXG4gICAgcmV0dXJuIG1vZGVscy5maW5kSW5kZXgoKG1vZGVsOiBzdHJpbmcpID0+IEdldEhhc2hLZXkobW9kZWwpID09PSB0YXJnZXQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIYWlyKHBlZEhhbmRsZTogbnVtYmVyKTogVEhhaXJEYXRhIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29sb3I6IEdldFBlZEhhaXJDb2xvcihwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhpZ2hsaWdodDogR2V0UGVkSGFpckhpZ2hsaWdodENvbG9yKHBlZEhhbmRsZSlcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRCbGVuZERhdGEocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9wZWRyMGZvbnRvdXJhL2ZpdmVtLWFwcGVhcmFuY2UvYmxvYi9tYWluL2dhbWUvc3JjL2NsaWVudC9pbmRleC50cyNMNjdcclxuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcig4MCk7XHJcbiAgICBnbG9iYWwuQ2l0aXplbi5pbnZva2VOYXRpdmUoJzB4Mjc0NmJkOWQ4OGM1YzVkMCcsIHBlZEhhbmRsZSwgbmV3IFVpbnQzMkFycmF5KGJ1ZmZlcikpO1xyXG5cclxuICAgIGNvbnN0IHsgMDogc2hhcGVGaXJzdCwgMjogc2hhcGVTZWNvbmQsIDQ6IHNoYXBlVGhpcmQsIDY6IHNraW5GaXJzdCwgODogc2tpblNlY29uZCwgMTg6IGhhc1BhcmVudCwgMTA6IHNraW5UaGlyZCB9ID0gbmV3IFVpbnQzMkFycmF5KGJ1ZmZlcik7XHJcbiAgICBjb25zdCB7IDA6IHNoYXBlTWl4LCAyOiBza2luTWl4LCA0OiB0aGlyZE1peCB9ID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXIsIDQ4KTtcclxuXHJcbiAgICAvKiAgIFxyXG4gICAgICAgIDA6IHNoYXBlRmlyc3QsXHJcbiAgICAgICAgMjogc2hhcGVTZWNvbmQsXHJcbiAgICAgICAgNDogc2hhcGVUaGlyZCxcclxuICAgICAgICA2OiBza2luRmlyc3QsXHJcbiAgICAgICAgODogc2tpblNlY29uZCxcclxuICAgICAgICAxMDogc2tpblRoaXJkLFxyXG4gICAgICAgIDE4OiBoYXNQYXJlbnQsXHJcbiAgICAqL1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzaGFwZUZpcnN0LCAgIC8vIGZhdGhlclxyXG4gICAgICAgIHNoYXBlU2Vjb25kLCAvLyBtb3RoZXJcclxuICAgICAgICBzaGFwZVRoaXJkLFxyXG5cclxuICAgICAgICBza2luRmlyc3QsXHJcbiAgICAgICAgc2tpblNlY29uZCxcclxuICAgICAgICBza2luVGhpcmQsXHJcblxyXG4gICAgICAgIHNoYXBlTWl4LCAvLyByZXNlbWJsYW5jZVxyXG5cclxuICAgICAgICB0aGlyZE1peCxcclxuICAgICAgICBza2luTWl4LCAgIC8vIHNraW5wZXJjZW50XHJcblxyXG4gICAgICAgIGhhc1BhcmVudDogQm9vbGVhbihoYXNQYXJlbnQpLFxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRPdmVybGF5KHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgdG90YWxzOiBUSGVhZE92ZXJsYXlUb3RhbCA9IHt9O1xyXG4gICAgbGV0IGhlYWREYXRhOiBUSGVhZE92ZXJsYXkgPSB7fTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEhFQURfT1ZFUkxBWVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gSEVBRF9PVkVSTEFZU1tpXTtcclxuICAgICAgICB0b3RhbHNbb3ZlcmxheV0gPSBHZXROdW1IZWFkT3ZlcmxheVZhbHVlcyhpKTtcclxuXHJcbiAgICAgICAgaWYgKG92ZXJsYXkgPT09IFwiRXllQ29sb3JcIikge1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5VmFsdWU6IEdldFBlZEV5ZUNvbG9yKHBlZEhhbmRsZSlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBbXywgb3ZlcmxheVZhbHVlLCBjb2xvdXJUeXBlLCBmaXJzdENvbG9yLCBzZWNvbmRDb2xvciwgb3ZlcmxheU9wYWNpdHldID0gR2V0UGVkSGVhZE92ZXJsYXlEYXRhKHBlZEhhbmRsZSwgaSk7XHJcbiAgICAgICAgICAgIGhlYWREYXRhW292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogb3ZlcmxheVZhbHVlID09PSAyNTUgPyAtMSA6IG92ZXJsYXlWYWx1ZSxcclxuICAgICAgICAgICAgICAgIGNvbG91clR5cGU6IGNvbG91clR5cGUsXHJcbiAgICAgICAgICAgICAgICBmaXJzdENvbG9yOiBmaXJzdENvbG9yLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kQ29sb3I6IHNlY29uZENvbG9yLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheU9wYWNpdHk6IG92ZXJsYXlPcGFjaXR5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbaGVhZERhdGEsIHRvdGFsc107XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBwZWRNb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuXHJcbiAgICBpZiAocGVkTW9kZWwgIT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpICYmIHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKSkgcmV0dXJuXHJcblxyXG4gICAgbGV0IGZhY2VTdHJ1Y3QgPSB7fVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBGQUNFX0ZFQVRVUkVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEZBQ0VfRkVBVFVSRVNbaV1cclxuICAgICAgICBmYWNlU3RydWN0W292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWRGYWNlRmVhdHVyZShwZWRIYW5kbGUsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWNlU3RydWN0XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXREcmF3YWJsZXMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBkcmF3YWJsZXMgPSB7fVxyXG4gICAgbGV0IHRvdGFsRHJhd2FibGVzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IERSQVdBQkxFX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IERSQVdBQkxFX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxEcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRUZXh0dXJlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtkcmF3YWJsZXMsIHRvdGFsRHJhd2FibGVzXVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcHMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBwcm9wcyA9IHt9XHJcbiAgICBsZXQgdG90YWxQcm9wcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBQUk9QX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IFBST1BfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxQcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWRQcm9wRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFByb3BUZXh0dXJlSW5kZXgocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3Byb3BzLCB0b3RhbFByb3BzXVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwcGVhcmFuY2UocGVkSGFuZGxlOiBudW1iZXIpOiBQcm9taXNlPFRBcHBlYXJhbmNlPiB7XHJcbiAgICBjb25zdCBbaGVhZERhdGEsIHRvdGFsc10gPSBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbZHJhd2FibGVzLCBkcmF3VG90YWxdID0gZ2V0RHJhd2FibGVzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtwcm9wcywgcHJvcFRvdGFsXSA9IGdldFByb3BzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IG1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkSGFuZGxlKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbW9kZWxJbmRleDogZmluZE1vZGVsSW5kZXgobW9kZWwpLFxyXG4gICAgICAgIG1vZGVsOiBtb2RlbCxcclxuICAgICAgICBoYWlyQ29sb3I6IGdldEhhaXIocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEgYXMgVEhlYWRPdmVybGF5LFxyXG4gICAgICAgIGhlYWRPdmVybGF5VG90YWw6IHRvdGFscyBhcyBUSGVhZE92ZXJsYXlUb3RhbCxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZSksXHJcbiAgICAgICAgZHJhd2FibGVzOiBkcmF3YWJsZXMsXHJcbiAgICAgICAgcHJvcHM6IHByb3BzLFxyXG4gICAgICAgIGRyYXdUb3RhbDogZHJhd1RvdGFsLFxyXG4gICAgICAgIHByb3BUb3RhbDogcHJvcFRvdGFsLFxyXG4gICAgICAgIHRhdHRvb3M6IFtdXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldEFwcGVhcmFuY2VcIiwgZ2V0QXBwZWFyYW5jZSlcclxub25TZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6Z2V0QXBwZWFyYW5jZScsICgpID0+IHtcclxuICAgIHJldHVybiBnZXRBcHBlYXJhbmNlKHBlZClcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVkQ2xvdGhlcyhwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgY29uc3QgW2RyYXdhYmxlc10gPSBnZXREcmF3YWJsZXMocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW3Byb3BzXSA9IGdldFByb3BzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtoZWFkRGF0YV0gPSBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEsXHJcbiAgICAgICAgZHJhd2FibGVzOiBkcmF3YWJsZXMsXHJcbiAgICAgICAgcHJvcHM6IHByb3BzLFxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRQZWRDbG90aGVzXCIsIGdldFBlZENsb3RoZXMpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVkU2tpbihwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZEhhbmRsZSksXHJcbiAgICAgICAgbW9kZWw6IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkU2tpblwiLCBnZXRQZWRTa2luKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhdHRvb0RhdGEoKSB7XHJcbiAgICBsZXQgdGF0dG9vWm9uZXMgPSBbXVxyXG5cclxuICAgIGNvbnN0IFtUQVRUT09fTElTVCwgVEFUVE9PX0NBVEVHT1JJRVNdID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLnRhdHRvb3MoKVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fQ0FURUdPUklFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gVEFUVE9PX0NBVEVHT1JJRVNbaV1cclxuICAgICAgICBjb25zdCB6b25lID0gY2F0ZWdvcnkuem9uZVxyXG4gICAgICAgIGNvbnN0IGxhYmVsID0gY2F0ZWdvcnkubGFiZWxcclxuICAgICAgICBjb25zdCBpbmRleCA9IGNhdGVnb3J5LmluZGV4XHJcbiAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdID0ge1xyXG4gICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICBsYWJlbDogbGFiZWwsXHJcbiAgICAgICAgICAgIHpvbmVJbmRleDogaW5kZXgsXHJcbiAgICAgICAgICAgIGRsY3M6IFtdXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IFRBVFRPT19MSVNULmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRsY0RhdGEgPSBUQVRUT09fTElTVFtqXVxyXG4gICAgICAgICAgICB0YXR0b29ab25lc1tpbmRleF0uZGxjcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBkbGNEYXRhLmRsYyxcclxuICAgICAgICAgICAgICAgIGRsY0luZGV4OiBqLFxyXG4gICAgICAgICAgICAgICAgdGF0dG9vczogW11cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaXNGZW1hbGUgPSBHZXRFbnRpdHlNb2RlbChwZWQpID09PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gVEFUVE9PX0xJU1RbaV1cclxuICAgICAgICBjb25zdCB7IGRsYywgdGF0dG9vcyB9ID0gZGF0YVxyXG4gICAgICAgIGNvbnN0IGRsY0hhc2ggPSBHZXRIYXNoS2V5KGRsYylcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRhdHRvb3MubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IHRhdHRvb3Nbal1cclxuICAgICAgICAgICAgbGV0IHRhdHRvbyA9IG51bGxcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyVGF0dG9vID0gdGF0dG9vRGF0YS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIGNvbnN0IGlzRmVtYWxlVGF0dG9vID0gbG93ZXJUYXR0b28uaW5jbHVkZXMoXCJfZlwiKVxyXG4gICAgICAgICAgICBpZiAoaXNGZW1hbGVUYXR0b28gJiYgaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNGZW1hbGVUYXR0b28gJiYgIWlzRmVtYWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXR0b28gPSB0YXR0b29EYXRhXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBoYXNoID0gbnVsbFxyXG4gICAgICAgICAgICBsZXQgem9uZSA9IC0xXHJcblxyXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoID0gR2V0SGFzaEtleSh0YXR0b28pXHJcbiAgICAgICAgICAgICAgICB6b25lID0gR2V0UGVkRGVjb3JhdGlvblpvbmVGcm9tSGFzaGVzKGRsY0hhc2gsIGhhc2gpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh6b25lICE9PSAtMSAmJiBoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB6b25lVGF0dG9vcyA9IHRhdHRvb1pvbmVzW3pvbmVdLmRsY3NbaV0udGF0dG9vc1xyXG5cclxuICAgICAgICAgICAgICAgIHpvbmVUYXR0b29zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0YXR0b28sXHJcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogaGFzaCxcclxuICAgICAgICAgICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICAgICAgICAgIGRsYzogZGxjLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGF0dG9vWm9uZXNcclxufVxyXG5cclxuLy9taWdyYXRpb25cclxuXHJcbm9uU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50Om1pZ3JhdGlvbjpzZXRBcHBlYXJhbmNlJywgKGRhdGE6IHt0eXBlOiBzdHJpbmcsIGRhdGE6IGFueX0pID0+IHtcclxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdmaXZlbScpIGV4cG9ydHNbJ2ZpdmVtLWFwcGVhcmFuY2UnXS5zZXRQbGF5ZXJBcHBlYXJhbmNlKGRhdGEuZGF0YSlcclxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdpbGxlbml1bScpIGV4cG9ydHNbJ2lsbGVuaXVtLWFwcGVhcmFuY2UnXS5zZXRQbGF5ZXJBcHBlYXJhbmNlKGRhdGEuZGF0YSlcclxufSk7IiwgImV4cG9ydCBkZWZhdWx0IHtcclxuICAgIGhhdHM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMCxcclxuICAgIH0sXHJcbiAgICBnbGFzc2VzOiB7XHJcbiAgICAgICAgdHlwZTogXCJwcm9wXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICB9LFxyXG4gICAgbWFza3M6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICAgICAgb2ZmOiAwLFxyXG4gICAgfSxcclxuICAgIHNoaXJ0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogOCxcclxuICAgICAgICBvZmY6IDE1LFxyXG4gICAgICAgIGhvb2s6IHtcclxuICAgICAgICAgICAgZHJhd2FibGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogMywgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAndG9yc29zJyB9LFxyXG4gICAgICAgICAgICAgICAgeyBjb21wb25lbnQ6IDgsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ3NoaXJ0cycgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGphY2tldHM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDExLFxyXG4gICAgICAgIG9mZjogMTUsXHJcbiAgICAgICAgaG9vazoge1xyXG4gICAgICAgICAgICBkcmF3YWJsZXM6IFtcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAzLCB2YXJpYW50OiAxNSwgdGV4dHVyZTogMCwgaWQ6ICd0b3Jzb3MnIH0sXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogMTEsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ2phY2tldHMnIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB2ZXN0OiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA5LFxyXG4gICAgICAgIG9mZjogMTUsXHJcbiAgICB9LFxyXG4gICAgbGVnczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogNCxcclxuICAgICAgICBvZmY6IDExLFxyXG4gICAgfSxcclxuICAgIHNob2VzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA2LFxyXG4gICAgICAgIG9mZjogMTMsXHJcbiAgICB9XHJcbn0iLCAiaW1wb3J0IHsgVFZhbHVlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIjtcclxuaW1wb3J0IFRPR0dMRV9JTkRFWEVTIGZyb20gXCJAZGF0YS90b2dnbGVzXCJcclxuaW1wb3J0IHsgcmVxdWVzdE1vZGVsLCBwZWQsIHVwZGF0ZVBlZCwgZGVsYXl9IGZyb20gJ0B1dGlscyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0RHJhd2FibGUocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCAwKVxyXG4gICAgcmV0dXJuIEdldE51bWJlck9mUGVkVGV4dHVyZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJvcChwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBpZiAoZGF0YS52YWx1ZSA9PT0gLTEpIHtcclxuICAgICAgICBDbGVhclBlZFByb3AocGVkSGFuZGxlLCBkYXRhLmluZGV4KVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIFNldFBlZFByb3BJbmRleChwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgZmFsc2UpXHJcbiAgICByZXR1cm4gR2V0TnVtYmVyT2ZQZWRQcm9wVGV4dHVyZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2V0TW9kZWwgPSBhc3luYyAobW9kZWw6IG51bWJlcikgPT4ge1xyXG4gICAgY29uc3QgbW9kZWxIYXNoID0gYXdhaXQgcmVxdWVzdE1vZGVsKG1vZGVsKVxyXG4gICAgU2V0UGxheWVyTW9kZWwoUGxheWVySWQoKSwgbW9kZWxIYXNoKVxyXG4gICAgU2V0TW9kZWxBc05vTG9uZ2VyTmVlZGVkKG1vZGVsSGFzaClcclxuICAgIGNvbnN0IHBlZEhhbmRsZSA9IFBsYXllclBlZElkKClcclxuICAgIHVwZGF0ZVBlZChwZWRIYW5kbGUpXHJcbiAgICBTZXRQZWREZWZhdWx0Q29tcG9uZW50VmFyaWF0aW9uKHBlZEhhbmRsZSlcclxuXHJcbiAgICBpZiAobW9kZWxIYXNoID09PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSkgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWQsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIGZhbHNlKVxyXG4gICAgZWxzZSBpZiAobW9kZWxIYXNoID09PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKSkgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWQsIDQ1LCAyMSwgMCwgMjAsIDE1LCAwLCAwLjMsIDAuMSwgMCwgZmFsc2UpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBTZXRGYWNlRmVhdHVyZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBTZXRQZWRGYWNlRmVhdHVyZShwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUgKyAwLjApXHJcbn1cclxuXHJcbmNvbnN0IGlzUG9zaXRpdmUgPSAodmFsOiBudW1iZXIpID0+IHZhbCA+PSAwID8gdmFsIDogMFxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEhlYWRCbGVuZChwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgY29uc3Qgc2hhcGVGaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZUZpcnN0KVxyXG4gICAgY29uc3Qgc2hhcGVTZWNvbmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVTZWNvbmQpXHJcbiAgICBjb25zdCBzaGFwZVRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlVGhpcmQpXHJcbiAgICBjb25zdCBza2luRmlyc3QgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpbkZpcnN0KVxyXG4gICAgY29uc3Qgc2tpblNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5za2luU2Vjb25kKVxyXG4gICAgY29uc3Qgc2tpblRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNraW5UaGlyZClcclxuICAgIGNvbnN0IHNoYXBlTWl4ID0gZGF0YS5zaGFwZU1peCArIDAuMFxyXG4gICAgY29uc3Qgc2tpbk1peCA9IGRhdGEuc2tpbk1peCArIDAuMFxyXG4gICAgY29uc3QgdGhpcmRNaXggPSBkYXRhLnRoaXJkTWl4ICsgMC4wXHJcbiAgICBjb25zdCBoYXNQYXJlbnQgPSBkYXRhLmhhc1BhcmVudFxyXG5cclxuICAgIFNldFBlZEhlYWRCbGVuZERhdGEocGVkSGFuZGxlLCBzaGFwZUZpcnN0LCBzaGFwZVNlY29uZCwgc2hhcGVUaGlyZCwgc2tpbkZpcnN0LCBza2luU2Vjb25kLCBza2luVGhpcmQsIHNoYXBlTWl4LCBza2luTWl4LCB0aGlyZE1peCwgaGFzUGFyZW50KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIGNvbnN0IGluZGV4ID0gZGF0YS5pbmRleFxyXG5cclxuICAgIGlmIChpbmRleCA9PT0gMTMpIHtcclxuICAgICAgICBTZXRQZWRFeWVDb2xvcihwZWRIYW5kbGUsIGRhdGEudmFsdWUpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmFsdWUgPSBkYXRhLm92ZXJsYXlWYWx1ZVxyXG5cclxuICAgIC8qIEhhaXIgY29sb3IgZG9lcyBub3QgaGF2ZSBhbiBpbmRleCwgb25seSBhbiBJRCBzbyB3ZSdsbCBjaGVjayBmb3IgdGhhdCAqL1xyXG4gICAgaWYgKGRhdGEuaWQgPT09ICdoYWlyQ29sb3InKSB7XHJcbiAgICAgICAgU2V0UGVkSGFpclRpbnQocGVkSGFuZGxlLCBkYXRhLmhhaXJDb2xvciwgZGF0YS5oYWlySGlnaGxpZ2h0KVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBTZXRQZWRIZWFkT3ZlcmxheShwZWRIYW5kbGUsIGluZGV4LCB2YWx1ZSwgZGF0YS5vdmVybGF5T3BhY2l0eSArIDAuMClcclxuICAgIFNldFBlZEhlYWRPdmVybGF5Q29sb3IocGVkSGFuZGxlLCBpbmRleCwgMSwgZGF0YS5maXJzdENvbG9yLCBkYXRhLnNlY29uZENvbG9yKVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0VG9nZ2xlcyhkYXRhKSB7XHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcblxyXG4gICAgZm9yIChjb25zdCBbdG9nZ2xlSXRlbSwgdG9nZ2xlRGF0YV0gb2YgT2JqZWN0LmVudHJpZXMoVE9HR0xFX0lOREVYRVMpKSB7XHJcbiAgICAgICAgY29uc3QgdG9nZ2xlVHlwZSA9IHRvZ2dsZURhdGEudHlwZVxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdG9nZ2xlRGF0YS5pbmRleFxyXG5cclxuICAgICAgICBpZiAodG9nZ2xlVHlwZSA9PT0gXCJkcmF3YWJsZVwiICYmIGRyYXdhYmxlc1t0b2dnbGVJdGVtXSkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudERyYXdhYmxlICE9PSBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHRvZ2dsZVR5cGUgPT09IFwicHJvcFwiICYmIHByb3BzW3RvZ2dsZUl0ZW1dKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UHJvcCAhPT0gcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZFByb3BJbmRleChwZWQsIGluZGV4LCBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgZmFsc2UpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRDbG90aGVzKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcbiAgICBjb25zdCBoZWFkT3ZlcmxheSA9IGRhdGEuaGVhZE92ZXJsYXlcclxuICAgIGZvciAoY29uc3QgaWQgaW4gZHJhd2FibGVzKSB7XHJcbiAgICAgICAgY29uc3QgZHJhd2FibGUgPSBkcmF3YWJsZXNbaWRdXHJcbiAgICAgICAgc2V0RHJhd2FibGUocGVkSGFuZGxlLCBkcmF3YWJsZSlcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIHByb3BzKSB7XHJcbiAgICAgICAgY29uc3QgcHJvcCA9IHByb3BzW2lkXVxyXG4gICAgICAgIHNldFByb3AocGVkSGFuZGxlLCBwcm9wKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgaWQgaW4gaGVhZE92ZXJsYXkpIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gaGVhZE92ZXJsYXlbaWRdXHJcbiAgICAgICAgc2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlLCBvdmVybGF5KVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2V0UGVkU2tpbiA9IGFzeW5jIChkYXRhKSA9PiB7XHJcbiAgICBjb25zdCBoZWFkU3RydWN0dXJlID0gZGF0YS5oZWFkU3RydWN0dXJlXHJcbiAgICBjb25zdCBoZWFkQmxlbmQgPSBkYXRhLmhlYWRCbGVuZFxyXG5cclxuICAgIGF3YWl0IHNldE1vZGVsKGRhdGEubW9kZWwpXHJcblxyXG4gICAgaWYgKGhlYWRCbGVuZCkgc2V0SGVhZEJsZW5kKHBlZCwgaGVhZEJsZW5kKVxyXG4gICAgXHJcbiAgICBpZiAoaGVhZFN0cnVjdHVyZSkgZm9yIChjb25zdCBmZWF0dXJlIGluIGhlYWRTdHJ1Y3R1cmUpIHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IGhlYWRTdHJ1Y3R1cmVbZmVhdHVyZV1cclxuICAgICAgICBTZXRGYWNlRmVhdHVyZShwZWQsIHZhbHVlKVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkVGF0dG9vcyhwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm5cclxuXHJcbiAgICBDbGVhclBlZERlY29yYXRpb25zTGVhdmVTY2FycyhwZWRIYW5kbGUpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IGRhdGFbaV0udGF0dG9vXHJcbiAgICAgICAgaWYgKHRhdHRvb0RhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IEdldEhhc2hLZXkodGF0dG9vRGF0YS5kbGMpXHJcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvbyA9IHRhdHRvb0RhdGEuaGFzaFxyXG4gICAgICAgICAgICBBZGRQZWREZWNvcmF0aW9uRnJvbUhhc2hlcyhwZWRIYW5kbGUsIGNvbGxlY3Rpb24sIHRhdHRvbylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRIYWlyQ29sb3JzKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBjb25zdCBjb2xvciA9IGRhdGEuY29sb3JcclxuICAgIGNvbnN0IGhpZ2hsaWdodCA9IGRhdGEuaGlnaGxpZ2h0XHJcbiAgICBTZXRQZWRIYWlyQ29sb3IocGVkSGFuZGxlLCBjb2xvciwgaGlnaGxpZ2h0KVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGVkQXBwZWFyYW5jZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgYXdhaXQgc2V0UGVkU2tpbihkYXRhKVxyXG4gICAgc2V0UGVkQ2xvdGhlcyhwZWRIYW5kbGUsIGRhdGEpXHJcbiAgICBzZXRQZWRIYWlyQ29sb3JzKHBlZEhhbmRsZSwgZGF0YS5oYWlyQ29sb3IpXHJcbiAgICBzZXRQZWRUYXR0b29zKHBlZEhhbmRsZSwgZGF0YS50YXR0b29zKVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGxheWVyUGVkQXBwZWFyYW5jZShkYXRhKSB7XHJcbiAgICBhd2FpdCBzZXRQZWRTa2luKGRhdGEpXHJcbiAgICBzZXRQZWRDbG90aGVzKHBlZCwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMocGVkLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MocGVkLCBkYXRhLnRhdHRvb3MpXHJcbn1cclxuXHJcbmV4cG9ydHMoJ1NldFBlZENsb3RoZXMnLCBzZXRQZWRDbG90aGVzKVxyXG5leHBvcnRzKCdTZXRQZWRTa2luJywgc2V0UGVkU2tpbilcclxuZXhwb3J0cygnU2V0UGVkVGF0dG9vcycsIHNldFBlZFRhdHRvb3MpXHJcbmV4cG9ydHMoJ1NldFBlZEhhaXJDb2xvcnMnLCBzZXRQZWRIYWlyQ29sb3JzKSIsICJpbXBvcnQgeyBSZWNlaXZlIH0gZnJvbSAnQGV2ZW50cyc7XHJcbmltcG9ydCB7XHJcblx0cmVzZXRUb2dnbGVzLFxyXG5cdHNldERyYXdhYmxlLFxyXG5cdFNldEZhY2VGZWF0dXJlLFxyXG5cdHNldEhlYWRCbGVuZCxcclxuXHRzZXRIZWFkT3ZlcmxheSxcclxuXHRzZXRNb2RlbCxcclxuXHRzZXRQZWRDbG90aGVzLFxyXG5cdHNldFBlZFRhdHRvb3MsXHJcblx0c2V0UGxheWVyUGVkQXBwZWFyYW5jZSxcclxuXHRzZXRQcm9wLFxyXG59IGZyb20gJy4vYXBwZWFyYW5jZS9zZXR0ZXJzJztcclxuaW1wb3J0IHsgY2xvc2VNZW51IH0gZnJvbSAnLi9tZW51JztcclxuaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRUb2dnbGVEYXRhLCBUVmFsdWUgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgZGVsYXksIGdldEZyYW1ld29ya0lELCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIHBlZCB9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldFRhdHRvb0RhdGEgfSBmcm9tICcuL2FwcGVhcmFuY2UvZ2V0dGVycyc7XHJcbmltcG9ydCBUT0dHTEVfSU5ERVhFUyBmcm9tICdAZGF0YS90b2dnbGVzJztcclxuaW1wb3J0IHsgT3V0Zml0IH0gZnJvbSAnQHR5cGluZ3Mvb3V0Zml0cyc7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FuY2VsLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSk7XHJcblx0Y2xvc2VNZW51KCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNhdmUsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0cmVzZXRUb2dnbGVzKGFwcGVhcmFuY2UpO1xyXG5cclxuXHRhd2FpdCBkZWxheSgxMDApO1xyXG5cclxuXHRjb25zdCBuZXdBcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cdG5ld0FwcGVhcmFuY2UudGF0dG9vcyA9IGFwcGVhcmFuY2UudGF0dG9vcztcclxuXHR0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVBcHBlYXJhbmNlJywgZ2V0RnJhbWV3b3JrSUQoKSwgbmV3QXBwZWFyYW5jZSk7XHJcblxyXG5cdHNldFBlZFRhdHRvb3MocGVkLCBuZXdBcHBlYXJhbmNlLnRhdHRvb3MpO1xyXG5cclxuXHRjbG9zZU1lbnUoKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0TW9kZWwsIGFzeW5jIChtb2RlbDogc3RyaW5nLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBoYXNoID0gR2V0SGFzaEtleShtb2RlbCk7XHJcblx0aWYgKCFJc01vZGVsSW5DZGltYWdlKGhhc2gpIHx8ICFJc01vZGVsVmFsaWQoaGFzaCkpIHtcclxuXHRcdHJldHVybiBjYigwKTtcclxuXHR9XHJcblxyXG5cdGF3YWl0IHNldE1vZGVsKGhhc2gpO1xyXG5cclxuXHRjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cclxuXHRhcHBlYXJhbmNlLnRhdHRvb3MgPSBbXTtcclxuXHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIFtdKTtcclxuXHJcblx0Y2IoYXBwZWFyYW5jZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmdldE1vZGVsVGF0dG9vcywgYXN5bmMgKF86IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgdGF0dG9vcyA9IGdldFRhdHRvb0RhdGEoKTtcclxuXHJcblx0Y2IodGF0dG9vcyk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRTdHJ1Y3R1cmUsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdFNldEZhY2VGZWF0dXJlKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRPdmVybGF5LCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRIZWFkT3ZlcmxheShwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRIZWFkQmxlbmQsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldEhlYWRCbGVuZChwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRUYXR0b29zLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFByb3AsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGxldCB0ZXh0dXJlID0gc2V0UHJvcChwZWQsIGRhdGEpO1xyXG5cdGNiKHRleHR1cmUpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXREcmF3YWJsZSwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0bGV0IHRleHR1cmUgPSBzZXREcmF3YWJsZShwZWQsIGRhdGEpO1xyXG5cdGNiKHRleHR1cmUpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS50b2dnbGVJdGVtLCBhc3luYyAoZGF0YTogVFRvZ2dsZURhdGEsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGl0ZW0gPSBUT0dHTEVfSU5ERVhFU1tkYXRhLml0ZW1dO1xyXG5cdGlmICghaXRlbSkgcmV0dXJuIGNiKGZhbHNlKTtcclxuXHJcblx0Y29uc3QgY3VycmVudCA9IGRhdGEuZGF0YTtcclxuXHRjb25zdCB0eXBlID0gaXRlbS50eXBlO1xyXG5cdGNvbnN0IGluZGV4ID0gaXRlbS5pbmRleDtcclxuXHRjb25zdCBob29rID0gaXRlbS5ob29rO1xyXG5cdGNvbnN0IGhvb2tEYXRhID0gZGF0YS5ob29rRGF0YTtcclxuXHJcblx0aWYgKCFjdXJyZW50KSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRpZiAodHlwZSA9PT0gJ3Byb3AnKSB7XHJcblx0XHRjb25zdCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KTtcclxuXHJcblx0XHRpZiAoY3VycmVudFByb3AgPT09IC0xKSB7XHJcblx0XHRcdHNldFByb3AocGVkLCBjdXJyZW50KTtcclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRDbGVhclBlZFByb3AocGVkLCBpbmRleCk7XHJcblx0XHRcdGNiKHRydWUpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fSBlbHNlIGlmICh0eXBlID09PSAnZHJhd2FibGUnKSB7XHJcblx0XHRjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KTtcclxuXHJcblx0XHRpZiAoY3VycmVudC52YWx1ZSA9PT0gaXRlbS5vZmYpIHtcclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGN1cnJlbnQudmFsdWUgPT09IGN1cnJlbnREcmF3YWJsZSkge1xyXG5cdFx0XHRTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgaXRlbS5vZmYsIDAsIDApO1xyXG5cdFx0XHRpZiAoaG9vaykge1xyXG5cdFx0XHRcdGZvcihsZXQgaT0wOyBpIDwgaG9vay5kcmF3YWJsZXM/Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRjb25zdCBob29rSXRlbSA9IGhvb2suZHJhd2FibGVzW2ldO1xyXG5cdFx0XHRcdFx0U2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaG9va0l0ZW0uY29tcG9uZW50LCBob29rSXRlbS52YXJpYW50LCBob29rSXRlbS50ZXh0dXJlLCAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Y2IodHJ1ZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHNldERyYXdhYmxlKHBlZCwgY3VycmVudCk7XHJcblx0XHRcdGZvcihsZXQgaT0wOyBpIDwgaG9va0RhdGE/Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0c2V0RHJhd2FibGUocGVkLCBob29rRGF0YVtpXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2F2ZU91dGZpdCwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmRlbGV0ZU91dGZpdCwgYXN5bmMgKHtpZH0sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpkZWxldGVPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGlkKTtcclxuXHRjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5yZW5hbWVPdXRmaXQsIGFzeW5jIChkYXRhOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZW5hbWVPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnVzZU91dGZpdCwgYXN5bmMgKG91dGZpdDogT3V0Zml0LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQZWRDbG90aGVzKHBlZCwgb3V0Zml0KTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuaW1wb3J0T3V0Zml0LCBhc3luYyAoeyBpZCwgb3V0Zml0TmFtZSB9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6aW1wb3J0T3V0Zml0JywgZnJhbWV3b3JrZElkLCBpZCwgb3V0Zml0TmFtZSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZ3JhYk91dGZpdCwgYXN5bmMgKHsgaWQgfSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpncmFiT3V0Zml0JywgaWQpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLml0ZW1PdXRmaXQsIGFzeW5jIChkYXRhOiB7b3V0Zml0OiBPdXRmaXQsIGxhYmVsOiBzdHJpbmd9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOml0ZW1PdXRmaXQnLGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxub25OZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnVzZU91dGZpdCcsIChvdXRmaXQ6IE91dGZpdCkgPT4ge1xyXG5cdHNldFBlZENsb3RoZXMocGVkLCBvdXRmaXQpO1xyXG59KSIsICJpbXBvcnQgeyBnZXRGcmFtZXdvcmtJRCwgcmVxdWVzdExvY2FsZSwgc2VuZE5VSUV2ZW50LCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIHVwZGF0ZVBlZCwgcGVkLCBnZXRQbGF5ZXJEYXRhLCBnZXRKb2JJbmZvLCBnZXRQbGF5ZXJHZW5kZXJNb2RlbCB9IGZyb20gXCJAdXRpbHNcIlxyXG5pbXBvcnQgeyBzdGFydENhbWVyYSwgc3RvcENhbWVyYSB9IGZyb20gXCIuL2NhbWVyYVwiXHJcbmltcG9ydCB0eXBlIHsgVEFwcGVhcmFuY2Vab25lIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tIFwiQHR5cGluZ3Mvb3V0Zml0c1wiXHJcbmltcG9ydCB7IFNlbmQgfSBmcm9tIFwiQGV2ZW50c1wiXHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldFRhdHRvb0RhdGEgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL2dldHRlcnNcIlxyXG5pbXBvcnQgXCIuL2hhbmRsZXJzXCJcclxuaW1wb3J0IHsgc2V0TW9kZWwgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxyXG5pbXBvcnQgeyBIaWRlSHVkIH0gZnJvbSBcIi4vaW5pdFwiXHJcblxyXG5jb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxubGV0IGFybW91ciA9IDBcclxubGV0IG9wZW4gPSBmYWxzZVxyXG5cclxubGV0IHJlc29sdmVQcm9taXNlID0gbnVsbDtcclxubGV0IHByb21pc2UgPSBudWxsO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5NZW51KHpvbmU6IFRBcHBlYXJhbmNlWm9uZSwgY3JlYXRpb246IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgaWYgKHpvbmUgPT09IG51bGwgfHwgb3Blbikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwZWRIYW5kbGUgPSBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBjb25maWdNZW51cyA9IGNvbmZpZy5tZW51cygpXHJcblxyXG4gICAgY29uc3QgdHlwZSA9IHpvbmUudHlwZVxyXG5cclxuICAgIGNvbnN0IG1lbnUgPSBjb25maWdNZW51c1t0eXBlXVxyXG4gICAgaWYgKCFtZW51KSByZXR1cm5cclxuXHJcbiAgICB1cGRhdGVQZWQocGVkSGFuZGxlKVxyXG4gICAgc3RhcnRDYW1lcmEoKVxyXG5cclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKClcclxuICAgIGNvbnN0IHRhYnMgPSBtZW51LnRhYnNcclxuICAgIGxldCBhbGxvd0V4aXQgPSBjcmVhdGlvbiA/IGZhbHNlIDogbWVudS5hbGxvd0V4aXRcclxuXHJcbiAgICBhcm1vdXIgPSBHZXRQZWRBcm1vdXIocGVkSGFuZGxlKVxyXG5cclxuICAgIGxldCBvdXRmaXRzID0gW11cclxuXHJcbiAgICBjb25zdCBoYXNPdXRmaXRUYWIgPSB0YWJzLmluY2x1ZGVzKCdvdXRmaXRzJylcclxuICAgIGlmIChoYXNPdXRmaXRUYWIpIG91dGZpdHMgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8T3V0Zml0W10+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRPdXRmaXRzJywgZnJhbWV3b3JrZElkKSBhcyBPdXRmaXRbXVxyXG5cclxuICAgIGxldCBtb2RlbHMgPSBbXVxyXG5cclxuICAgIGNvbnN0IGhhc0hlcml0YWdlVGFiID0gdGFicy5pbmNsdWRlcygnaGVyaXRhZ2UnKVxyXG4gICAgaWYgKGhhc0hlcml0YWdlVGFiKSB7XHJcbiAgICAgICAgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaGFzVGF0dG9vVGFiID0gdGFicy5pbmNsdWRlcygndGF0dG9vcycpXHJcbiAgICBsZXQgdGF0dG9vc1xyXG4gICAgaWYgKGhhc1RhdHRvb1RhYikge1xyXG4gICAgICAgIHRhdHRvb3MgPSBnZXRUYXR0b29EYXRhKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBibGFja2xpc3QgPSBnZXRCbGFja2xpc3Qoem9uZSlcclxuXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWRIYW5kbGUpXHJcblxyXG4gICAgaWYgKGNyZWF0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgbW9kZWwgPSBHZXRIYXNoS2V5KGdldFBsYXllckdlbmRlck1vZGVsKCkpO1xyXG4gICAgICAgIGF3YWl0IHNldE1vZGVsKG1vZGVsKTtcclxuICAgICAgICBhcHBlYXJhbmNlLm1vZGVsID0gbW9kZWw7XHJcbiAgICAgICAgZW1pdE5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2V0cm91dGluZ2J1Y2tldCcpXHJcbiAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHNlbmROVUlFdmVudChTZW5kLmRhdGEsIHtcclxuICAgICAgICB0YWJzLFxyXG4gICAgICAgIGFwcGVhcmFuY2UsXHJcbiAgICAgICAgYmxhY2tsaXN0LFxyXG4gICAgICAgIHRhdHRvb3MsXHJcbiAgICAgICAgb3V0Zml0cyxcclxuICAgICAgICBtb2RlbHMsXHJcbiAgICAgICAgYWxsb3dFeGl0LFxyXG4gICAgICAgIGpvYjogZ2V0Sm9iSW5mbygpLFxyXG4gICAgICAgIGxvY2FsZTogYXdhaXQgcmVxdWVzdExvY2FsZSgnbG9jYWxlJylcclxuICAgIH0pXHJcbiAgICBTZXROdWlGb2N1cyh0cnVlLCB0cnVlKVxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQudmlzaWJsZSwgdHJ1ZSlcclxuICAgIG9wZW4gPSB0cnVlXHJcblxyXG4gICAgSGlkZUh1ZCh0cnVlKTtcclxuXHJcbiAgICBpZiAocHJvbWlzZSkge1xyXG4gICAgICAgIGF3YWl0IHByb21pc2VcclxuICAgICAgICBlbWl0TmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZXNldHJvdXRpbmdidWNrZXQnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm9taXNlID0gbnVsbDtcclxuICAgIHJlc29sdmVQcm9taXNlID0gbnVsbDtcclxuICAgIHJldHVybiB0cnVlXHJcbn1cclxuXHJcbmV4cG9ydHMoJ29wZW5NZW51Jywgb3Blbk1lbnUpXHJcblxyXG5mdW5jdGlvbiBnZXRCbGFja2xpc3Qoem9uZTogVEFwcGVhcmFuY2Vab25lKSB7XHJcbiAgICBpZiAoIXpvbmUpIHJldHVybiB7fVxyXG5cclxuICAgIGNvbnN0IHtncm91cFR5cGVzLCBiYXNlfSA9IGNvbmZpZy5ibGFja2xpc3QoKVxyXG5cclxuICAgIGlmICghZ3JvdXBUeXBlcykgcmV0dXJuIHt9XHJcbiAgICBpZiAoIWJhc2UpIHJldHVybiB7fVxyXG5cclxuICAgIGxldCBibGFja2xpc3QgPSB7Li4uYmFzZX1cclxuXHJcbiAgICBjb25zdCBwbGF5ZXJEYXRhID0gZ2V0UGxheWVyRGF0YSgpXHJcblxyXG5cclxuICAgIGZvciAoY29uc3QgdHlwZSBpbiBncm91cFR5cGVzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBzID0gZ3JvdXBUeXBlc1t0eXBlXVxyXG4gICAgICAgIGZvciAoY29uc3QgZ3JvdXAgaW4gZ3JvdXBzKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgc2tpcDogYm9vbGVhbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodHlwZSA9PSAnam9icycgJiYgem9uZS5qb2JzKSB7XHJcbiAgICAgICAgICAgICAgICBza2lwID0gem9uZS5qb2JzLmluY2x1ZGVzKHBsYXllckRhdGEuam9iLm5hbWUpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09ICdnYW5ncycgJiYgem9uZS5nYW5ncykge1xyXG4gICAgICAgICAgICAgICAgc2tpcCA9IHpvbmUuZ2FuZ3MuaW5jbHVkZXMocGxheWVyRGF0YS5nYW5nLm5hbWUpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmICh0eXBlID09ICdncm91cHMnICYmIHpvbmUuZ3JvdXBzKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBza2lwID0gIXpvbmUuZ3JvdXBzLmluY2x1ZGVzKHBsYXllckRhdGEuZ3JvdXAubmFtZSlcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFza2lwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBncm91cEJsYWNrbGlzdCA9IGdyb3Vwc1tncm91cF1cclxuICAgICAgICAgICAgICAgIGJsYWNrbGlzdCA9IE9iamVjdC5hc3NpZ24oe30sIGJsYWNrbGlzdCwgZ3JvdXBCbGFja2xpc3QsIHtcclxuICAgICAgICAgICAgICAgICAgZHJhd2FibGVzOiBPYmplY3QuYXNzaWduKHt9LCBibGFja2xpc3QuZHJhd2FibGVzLCBncm91cEJsYWNrbGlzdC5kcmF3YWJsZXMpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBibGFja2xpc3RcclxuXHJcbiAgICAvLyByZXR1cm4gYmxhY2tsaXN0XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9zZU1lbnUoKSB7XHJcbiAgICBTZXRQZWRBcm1vdXIocGVkLCBhcm1vdXIpXHJcblxyXG4gICAgc3RvcENhbWVyYSgpXHJcbiAgICBTZXROdWlGb2N1cyhmYWxzZSwgZmFsc2UpXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC52aXNpYmxlLCBmYWxzZSlcclxuXHJcbiAgICBIaWRlSHVkKGZhbHNlKTtcclxuXHJcbiAgICBpZiAocmVzb2x2ZVByb21pc2UpIHtcclxuICAgICAgICByZXNvbHZlUHJvbWlzZSgpO1xyXG4gICAgfVxyXG4gICAgb3BlbiA9IGZhbHNlXHJcbn1cclxuIiwgIlxuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXG5pbXBvcnQgeyBzZXRQZWRBcHBlYXJhbmNlIH0gZnJvbSBcIi4uL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXG5pbXBvcnQgeyBvcGVuTWVudSB9IGZyb20gXCIuLi9tZW51XCJcblxuZXhwb3J0IGZ1bmN0aW9uIFFCQnJpZGdlKCkge1xuICAgIG9uTmV0KCdxYi1jbG90aGluZzpjbGllbnQ6bG9hZFBsYXllckNsb3RoaW5nJywgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICBhd2FpdCBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcbiAgICB9KVxuXG4gICAgb25OZXQoJ3FiLWNsb3RoZXM6Y2xpZW50OkNyZWF0ZUZpcnN0Q2hhcmFjdGVyJywgKCkgPT4ge1xuICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKClcbiAgICB9KVxuXG4gICAgb25OZXQoJ3FiLWNsb3RoaW5nOmNsaWVudDpvcGVuT3V0Zml0TWVudScsICgpID0+IHtcbiAgICAgICAgb3Blbk1lbnUoeyB0eXBlOiBcIm91dGZpdHNcIiwgY29vcmRzOiBbMCwgMCwgMCwgMF0gfSkgIFxuICAgIH0pXG59IiwgIlxuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXG5pbXBvcnQgeyBzZXRQZWRBcHBlYXJhbmNlLCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlIH0gZnJvbSBcIi4uL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXG5pbXBvcnQgeyBnZXRGcmFtZXdvcmtJRCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSBcIkB1dGlsc1wiXG5cbmV4cG9ydCBmdW5jdGlvbiBFU1hCcmlkZ2UoKSB7XG4gICAgbGV0IGZpcnN0U3Bhd24gPSBmYWxzZVxuXG4gICAgb24oXCJlc3hfc2tpbjpyZXNldEZpcnN0U3Bhd25cIiwgKCkgPT4ge1xuICAgICAgICBmaXJzdFNwYXduID0gdHJ1ZVxuICAgIH0pO1xuXG4gICAgb24oXCJlc3hfc2tpbjpwbGF5ZXJSZWdpc3RlcmVkXCIsICgpID0+IHtcbiAgICAgICAgaWYoZmlyc3RTcGF3bilcbiAgICAgICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24oKVxuICAgIH0pO1xuXG4gICAgb25OZXQoJ3NraW5jaGFuZ2VyOmxvYWRTa2luMicsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgcGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgYXdhaXQgc2V0UGVkQXBwZWFyYW5jZShwZWQsIGFwcGVhcmFuY2UpXG4gICAgfSk7XG5cbiAgICBvbk5ldCgnc2tpbmNoYW5nZXI6Z2V0U2tpbicsIGFzeW5jIChjYjogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGZyYW1ld29ya0lEID0gYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxuICAgICAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxuICAgICAgICBjYihhcHBlYXJhbmNlKVxuICAgIH0pXG5cbiAgICBvbk5ldCgnc2tpbmNoYW5nZXI6bG9hZFNraW4nLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBhbnkpID0+IHtcbiAgICAgICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxuICAgICAgICBpZiAoY2IpIGNiKClcbiAgICB9KVxuXG4gICAgb25OZXQoJ2VzeF9za2luOm9wZW5TYXZlYWJsZU1lbnUnLCBhc3luYyAob25TdWJtaXQ6IGFueSkgPT4ge1xuICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKG9uU3VibWl0KVxuICAgIH0pXG59IiwgImltcG9ydCB7IGZpbmRNb2RlbEluZGV4LCBnZXRBcHBlYXJhbmNlLCBnZXREcmF3YWJsZXMsIGdldEhhaXIsIGdldEhlYWRPdmVybGF5LCBnZXRQcm9wcyB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL2dldHRlcnNcIjtcbmltcG9ydCB7IHNldERyYXdhYmxlLCBzZXRIZWFkQmxlbmQsIHNldEhlYWRPdmVybGF5LCBzZXRNb2RlbCwgc2V0UGVkSGFpckNvbG9ycyB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL3NldHRlcnNcIjtcblxuZnVuY3Rpb24gZXhwb3J0SGFuZGxlcihuYW1lOiBzdHJpbmcsIGNiOiBhbnkpIHtcbiAgICBvbignX19jZnhfZXhwb3J0X2lsbGVuaXVtLWFwcGVhcmFuY2VfJyArIG5hbWUsIChzZXRDQjogYW55KSA9PiB7XG4gICAgICAgIHNldENCKGNiKTtcbiAgICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaWxsZW5pdW1Db21wYXQoKSB7XG4gICAgZXhwb3J0SGFuZGxlcignc3RhcnRQbGF5ZXJDdXN0b21pemF0aW9uJywgKCkgPT4ge1xuICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKClcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZE1vZGVsJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUud2FybignWGlydmluIHdpbGwgaW1wbGVtZW50Jyk7XG4gICAgICAgIC8vcmV0dXJuIGZpbmRNb2RlbEluZGV4KHBlZClcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZENvbXBvbmVudHMnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldERyYXdhYmxlcyhwZWQpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkUHJvcHMnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICByZXR1cm4gZ2V0UHJvcHMocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEhlYWRCbGVuZCcsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWGlydmluIHdpbGwgaW1wbGVtZW50Jyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRGYWNlRmVhdHVyZXMnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1hpcnZpbiB3aWxsIGltcGxlbWVudCcpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkSGVhZE92ZXJsYXlzJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXRIZWFkT3ZlcmxheShwZWQpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkSGFpcicsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0SGFpcihwZWQpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkQXBwZWFyYW5jZScsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0QXBwZWFyYW5jZShwZWQpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGxheWVyTW9kZWwnLCAobW9kZWw6IG51bWJlcikgPT4ge1xuICAgICAgICBzZXRNb2RlbChtb2RlbCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRIZWFkQmxlbmQnLCAocGVkOiBudW1iZXIsIGJsZW5kOiBhbnkpID0+IHtcbiAgICAgICAgc2V0SGVhZEJsZW5kKHBlZCwgYmxlbmQpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkRmFjZUZlYXR1cmVzJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdYaXJ2aW4gd2lsbCBpbXBsZW1lbnQnKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZEhlYWRPdmVybGF5cycsIChwZWQ6IG51bWJlciwgb3ZlcmxheTogYW55KSA9PiB7XG4gICAgICAgIHNldEhlYWRPdmVybGF5KHBlZCwgb3ZlcmxheSk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRIYWlyJywgYXN5bmMgKHBlZDogbnVtYmVyLCBoYWlyOiBhbnksIHRhdHRvbzogYW55KSA9PiB7XG4gICAgICAgIGF3YWl0IHNldFBlZEhhaXJDb2xvcnMocGVkLCBoYWlyKTtcbiAgICAgICAgLy94aXJ2aW4gdGF0dG9vIG5lZWQ/XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRFeWVDb2xvcicsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWGlydmluIHdpbGwgaW1wbGVtZW50Jyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRDb21wb25lbnQnLCAocGVkOiBudW1iZXIsIGRyYXdhYmxlOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgbmV3RHJhd2FibGUgPSB7XG4gICAgICAgICAgICBpbmRleDogZHJhd2FibGUuY29tcG9uZW50X2lkLFxuICAgICAgICAgICAgdmFsdWU6IGRyYXdhYmxlLmRyYXdhYmxlLFxuICAgICAgICAgICAgdGV4dHVyZTogZHJhd2FibGUudGV4dHVyZVxuICAgICAgICB9XG4gICAgICAgIHNldERyYXdhYmxlKHBlZCwgbmV3RHJhd2FibGUpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkQ29tcG9uZW50cycsIChwZWQ6IG51bWJlciwgY29tcG9uZW50czogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1hpcnZpbiB3aWxsIGltcGxlbWVudCcpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkUHJvcCcsIChwZWQ6IG51bWJlciwgcHJvcDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1Byb3AgPSB7XG4gICAgICAgICAgICBpbmRleDogcHJvcC5wcm9wX2lkLFxuICAgICAgICAgICAgdmFsdWU6IHByb3AuZHJhd2FibGUsXG4gICAgICAgICAgICB0ZXh0dXJlOiBwcm9wLnRleHR1cmVcbiAgICAgICAgfVxuICAgICAgICBzZXREcmF3YWJsZShwZWQsIG5ld1Byb3ApO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkUHJvcHMnLCAocGVkOiBudW1iZXIsIHByb3BzOiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWGlydmluIHdpbGwgaW1wbGVtZW50Jyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQbGF5ZXJBcHBlYXJhbmNlJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdOZWVkIHRvIGJlIGltcGxlbWVudGVkJyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRBcHBlYXJhbmNlJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdOZWVkIHRvIGJlIGltcGxlbWVudGVkJyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRUYXR0b29zJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdOZWVkIHRvIGJlIGltcGxlbWVudGVkJyk7XG4gICAgfSk7XG59IiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUQXBwZWFyYW5jZVpvbmUgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCB7IG9wZW5NZW51IH0gZnJvbSBcIi4vbWVudVwiXHJcbmltcG9ydCB7IHNldFBlZEFwcGVhcmFuY2UsIHNldFBsYXllclBlZEFwcGVhcmFuY2UgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxyXG5pbXBvcnQgeyB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIGdldEZyYW1ld29ya0lELCBEZWxheSwgYmxfYnJpZGdlLCBwZWQsIGRlbGF5LCBmb3JtYXQgfSBmcm9tIFwiQHV0aWxzXCJcclxuaW1wb3J0IHsgUUJCcmlkZ2UgfSBmcm9tIFwiLi9icmlkZ2UvcWJcIlxyXG5pbXBvcnQgeyBFU1hCcmlkZ2UgfSBmcm9tIFwiLi9icmlkZ2UvZXN4XCJcclxuaW1wb3J0IHsgaWxsZW5pdW1Db21wYXQgfSBmcm9tIFwiLi9jb21wYXQvaWxsZW5pdW1cIlxyXG5cclxuUmVnaXN0ZXJDb21tYW5kKCdvcGVuTWVudScsIGFzeW5jICgpID0+IHtcclxuICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24oKVxyXG59LCBmYWxzZSlcclxuXHJcbmV4cG9ydHMoJ1NldFBlZEFwcGVhcmFuY2UnLCBhc3luYyAocGVkOiBudW1iZXIsIGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlKSA9PiB7XHJcbiAgICBhd2FpdCBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcclxufSlcclxuXHJcbmV4cG9ydHMoJ1NldFBsYXllclBlZEFwcGVhcmFuY2UnLCBhc3luYyAoZnJhbWV3b3JrSUQpID0+IHtcclxuICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcbiAgICBpZiAoIWFwcGVhcmFuY2UpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGFwcGVhcmFuY2UgZm91bmQnKVxyXG4gICAgfVxyXG4gICAgYXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxyXG59KVxyXG5cclxuZXhwb3J0cygnR2V0UGxheWVyUGVkQXBwZWFyYW5jZScsIGFzeW5jIChmcmFtZXdvcmtJRCkgPT4ge1xyXG4gICAgcmV0dXJuIGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxufSlcclxuXHJcbmV4cG9ydHMoJ0luaXRpYWxDcmVhdGlvbicsIGFzeW5jIChjYj86IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBhd2FpdCBvcGVuTWVudSh7IHR5cGU6IFwiYXBwZWFyYW5jZVwiLCBjb29yZHM6IFswLCAwLCAwLCAwXSB9LCB0cnVlKVxyXG4gICAgaWYgKGNiKSBjYigpXHJcbn0pXHJcblxyXG5vbignYmxfc3ByaXRlczpjbGllbnQ6dXNlWm9uZScsICh6b25lOiBUQXBwZWFyYW5jZVpvbmUpID0+IHtcclxuICAgIG9wZW5NZW51KHpvbmUpXHJcbn0pXHJcblxyXG5vbk5ldCgnYmxfYnJpZGdlOmNsaWVudDpwbGF5ZXJMb2FkZWQnLCBhc3luYyAoKSA9PiB7XHJcbiAgICB3aGlsZSAoIWJsX2JyaWRnZS5jb3JlKCkucGxheWVyTG9hZGVkKCkpIHtcclxuICAgICAgICBhd2FpdCBEZWxheSgxMDApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgaWYgKCFhcHBlYXJhbmNlKSByZXR1cm47XHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcbn0pXHJcblxyXG5vbk5ldCgnb25SZXNvdXJjZVN0YXJ0JywgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcpID0+IHtcclxuICAgIGlmIChyZXNvdXJjZSA9PT0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpICYmIGJsX2JyaWRnZS5jb3JlKCkucGxheWVyTG9hZGVkKCkpIHtcclxuICAgICAgICBjb25zdCBmcmFtZXdvcmtJRCA9IGF3YWl0IGdldEZyYW1ld29ya0lEKClcclxuICAgICAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgICAgIGlmICghYXBwZWFyYW5jZSkgcmV0dXJuO1xyXG4gICAgICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSlcclxuICAgIH1cclxufSlcclxuXHJcbmNvbnN0IGZyYW1ld29ya05hbWUgPSBibF9icmlkZ2UuZ2V0RnJhbWV3b3JrKCdjb3JlJylcclxuY29uc3QgY29yZSA9IGZvcm1hdChHZXRDb252YXIoJ2JsOmZyYW1ld29yaycsICdxYicpKVxyXG5cclxuaWYgKGNvcmUgPT0gJ3FiJyB8fCBjb3JlID09ICdxYngnICYmIEdldFJlc291cmNlU3RhdGUoZnJhbWV3b3JrTmFtZSkgPT0gJ3N0YXJ0ZWQnKSB7XHJcbiAgICBRQkJyaWRnZSgpO1xyXG59IGVsc2UgaWYgKGNvcmUgPT0gJ2VzeCcgJiYgR2V0UmVzb3VyY2VTdGF0ZShmcmFtZXdvcmtOYW1lKSA9PSAnc3RhcnRlZCcpIHtcclxuICAgIEVTWEJyaWRnZSgpO1xyXG59XHJcblxyXG5pbGxlbml1bUNvbXBhdCgpO1xyXG5cclxuUmVnaXN0ZXJDb21tYW5kKCdyZWxvYWRza2luJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICBjb25zdCBoZWFsdGggPSBHZXRFbnRpdHlIZWFsdGgocGVkKTtcclxuICAgIGNvbnN0IG1heGhlYWx0aCA9IEdldEVudGl0eU1heEhlYWx0aChwZWQpO1xyXG4gICAgY29uc3QgYXJtb3IgPSBHZXRQZWRBcm1vdXIocGVkKTtcclxuXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgaWYgKCFhcHBlYXJhbmNlKSByZXR1cm47XHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcblxyXG4gICAgU2V0UGVkTWF4SGVhbHRoKHBlZCwgbWF4aGVhbHRoKVxyXG4gICAgZGVsYXkoMTAwMCkgXHJcbiAgICBTZXRFbnRpdHlIZWFsdGgocGVkLCBoZWFsdGgpXHJcbiAgICBTZXRQZWRBcm1vdXIocGVkLCBhcm1vcilcclxufSwgZmFsc2UpXHJcblxyXG5leHBvcnQgY29uc3QgSGlkZUh1ZCA9IChzdGF0ZTogYm9vbGVhbiA9IHRydWUpID0+IHtcclxuICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5oaWRlSHVkKHN0YXRlKVxyXG59Il0sCiAgIm1hcHBpbmdzIjogIjs7OztBQUFPLElBQUksTUFBTTtBQUVWLElBQU0sWUFBWSx3QkFBQyxjQUFzQjtBQUM1QyxRQUFNO0FBQ1YsR0FGeUI7QUFhbEIsSUFBTSxlQUFlLHdCQUFDLFFBQWdCLFNBQWM7QUFDdkQsaUJBQWU7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLEVBQ0osQ0FBQztBQUNMLEdBTDRCO0FBT3JCLElBQU0sUUFBUSx3QkFBQyxPQUFlLElBQUksUUFBUSxTQUFPLFdBQVcsS0FBSyxFQUFFLENBQUMsR0FBdEQ7QUFFZCxJQUFNLGVBQWUsOEJBQU8sVUFBNEM7QUFDM0UsTUFBSSxZQUFvQixPQUFPLFVBQVUsV0FBVyxRQUFRLFdBQVcsS0FBSztBQUU1RSxNQUFJLENBQUMsYUFBYSxTQUFTLEdBQUc7QUFDMUIsWUFBUSxVQUFVLE9BQU8sRUFBRTtB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c0NBQXNDLFdBQVc7QUFDN0csUUFBSSxDQUFDO0FBQVk7QUFDakIsVUFBTSx1QkFBdUIsVUFBVTtBQUFBLEVBQzNDO0FBQ0osQ0FBQztBQUVELElBQU0sZ0JBQWdCLFVBQVUsYUFBYSxNQUFNO0FBQ25ELElBQU0sT0FBTyxPQUFPLFVBQVUsZ0JBQWdCLElBQUksQ0FBQztBQUVuRCxJQUFJLFFBQVEsUUFBUSxRQUFRLFNBQVMsaUJBQWlCLGFBQWEsS0FBSyxXQUFXO0FBQy9FLFdBQVM7QUFDYixXQUFXLFFBQVEsU0FBUyxpQkFBaUIsYUFBYSxLQUFLLFdBQVc7QUFDdEUsWUFBVTtBQUNkO0FBRUEsZUFBZTtBQUVmLGdCQUFnQixjQUFjLFlBQVk7QUFDdEMsUUFBTSxjQUFjLE1BQU0sZUFBZTtBQUN6QyxRQUFNLFNBQVMsZ0JBQWdCLEdBQUc7QUFDbEMsUUFBTSxZQUFZLG1CQUFtQixHQUFHO0FBQ3hDLFFBQU0sUUFBUSxhQUFhLEdBQUc7QUFFOUIsUUFBTSxhQUFhLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQzdHLE1BQUksQ0FBQztBQUFZO0FBQ2pCLFFBQU0sdUJBQXVCLFVBQVU7QUFFdkMsa0JBQWdCLEtBQUssU0FBUztBQUM5QixRQUFNLEdBQUk7QUFDVixrQkFBZ0IsS0FBSyxNQUFNO0FBQzNCLGVBQWEsS0FBSyxLQUFLO0FBQzNCLEdBQUcsS0FBSztBQUVELElBQU0sVUFBVSx3QkFBQyxRQUFpQixTQUFTO0FBQzlDLFVBQVEsY0FBYyxRQUFRLEtBQUs7QUFDdkMsR0FGdUI7IiwKICAibmFtZXMiOiBbImRlbGF5IiwgIngiLCAieSIsICJ6IiwgImNvbmZpZyIsICJwZWQiLCAicGVkIiwgInBlZCIsICJwZWQiXQp9Cg==
