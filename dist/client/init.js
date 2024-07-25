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
function eventTimer(eventName, delay4) {
  if (delay4 && delay4 > 0) {
    const currentTime = GetGameTimer();
    if ((eventTimers[eventName] || 0) > currentTime)
      return false;
    eventTimers[eventName] = currentTime + delay4;
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
  console.log(type);
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
      break;
  }
  cb(1);
});
RegisterNuiCallback("appearance:camZoom" /* camZoom */, (data, cb) => {
  if (data === "down") {
    const maxZoom = currentBone === "whole" ? WHOLE_BODY_MAX_DISTANCE : DEFAULT_MAX_DISTANCE;
    console.log(maxZoom);
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
      const [_, overlayValue, colourType, firstColor, secondColor, overlayOpacity] = GetPedHeadOverlayData(pedHandle, i + 1);
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
  const value = data.overlayValue === -1 ? 255 : data.overlayValue;
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
  await setPlayerPedAppearance(appearance);
});
onNet("onResourceStart", async (resource) => {
  if (resource === GetCurrentResourceName() && bl_bridge.core().playerLoaded()) {
    const frameworkID = await getFrameworkID();
    const appearance = await triggerServerCallback("bl_appearance:server:getAppearance", frameworkID);
    await setPlayerPedAppearance(appearance);
  }
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgbGV0IHBlZCA9IDBcclxuXHJcbmV4cG9ydCBjb25zdCB1cGRhdGVQZWQgPSAocGVkSGFuZGxlOiBudW1iZXIpID0+IHtcclxuICAgIHBlZCA9IHBlZEhhbmRsZVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZGVidWdkYXRhID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZGF0YSwgKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXG4vZywgXCJcXFxcblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfSwgMikpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZW5kTlVJRXZlbnQgPSAoYWN0aW9uOiBzdHJpbmcsIGRhdGE6IGFueSkgPT4ge1xyXG4gICAgU2VuZE5VSU1lc3NhZ2Uoe1xyXG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgIGRhdGE6IGRhdGFcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RNb2RlbCA9IGFzeW5jIChtb2RlbDogc3RyaW5nIHwgbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+ID0+IHtcclxuICAgIGxldCBtb2RlbEhhc2g6IG51bWJlciA9IHR5cGVvZiBtb2RlbCA9PT0gJ251bWJlcicgPyBtb2RlbCA6IEdldEhhc2hLZXkobW9kZWwpXHJcblxyXG4gICAgaWYgKCFJc01vZGVsVmFsaWQobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9fb3hfY2JfJHtyZXNvdXJjZU5hbWV9YCwgKGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnkpID0+IHtcclxuICAgIGNvbnN0IHJlc29sdmUgPSBhY3RpdmVFdmVudHNba2V5XTtcclxuICAgIHJldHVybiByZXNvbHZlICYmIHJlc29sdmUoLi4uYXJncyk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUID0gdW5rbm93bj4oXHJcbiAgICBldmVudE5hbWU6IHN0cmluZywgLi4uYXJnczogYW55XHJcbik6IFByb21pc2U8VD4gfCB2b2lkIHtcclxuICAgIGlmICghZXZlbnRUaW1lcihldmVudE5hbWUsIDApKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBrZXk6IHN0cmluZztcclxuXHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuXHJcbiAgICBlbWl0TmV0KGBfX294X2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvblNlcnZlckNhbGxiYWNrKGV2ZW50TmFtZSwgY2IpIHtcclxuICAgIG9uTmV0KGBfX294X2NiXyR7ZXZlbnROYW1lfWAsIGFzeW5jIChyZXNvdXJjZSwga2V5LCAuLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgbGV0IHJlc3BvbnNlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlID0gYXdhaXQgY2IoLi4uYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGhhbmRsaW5nIGNhbGxiYWNrIGV2ZW50ICR7ZXZlbnROYW1lfWApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgXjMke2Uuc3RhY2t9XjBgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZW1pdE5ldChgX19veF9jYl8ke3Jlc291cmNlfWAsIGtleSwgcmVzcG9uc2UpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vbG9jYWxlXHJcblxyXG5leHBvcnQgY29uc3QgcmVxdWVzdExvY2FsZSA9IChyZXNvdXJjZVNldE5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2hlY2tSZXNvdXJjZUZpbGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChSZXF1ZXN0UmVzb3VyY2VGaWxlU2V0KHJlc291cmNlU2V0TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRMYW4gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UuY29uZmlnKCkubG9jYWxlXHJcbiAgICAgICAgICAgICAgICBsZXQgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS8ke2N1cnJlbnRMYW59Lmpzb25gKTtcclxuICAgICAgICAgICAgICAgIGlmICghbG9jYWxlRmlsZUNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke2N1cnJlbnRMYW59Lmpzb24gbm90IGZvdW5kIGluIGxvY2FsZSwgcGxlYXNlIHZlcmlmeSEsIHdlIHVzZWQgZW5nbGlzaCBmb3Igbm93IWApXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS9lbi5qc29uYClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUobG9jYWxlRmlsZUNvbnRlbnQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChjaGVja1Jlc291cmNlRmlsZSwgMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjaGVja1Jlc291cmNlRmlsZSgpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBsb2NhbGUgPSBhc3luYyAoaWQ6IHN0cmluZywgLi4uYXJnczogc3RyaW5nW10pID0+IHtcclxuICAgIGNvbnN0IGxvY2FsZSA9IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpO1xyXG4gICAgbGV0IGFyZ0luZGV4ID0gMDtcclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSBsb2NhbGVbaWRdLnJlcGxhY2UoLyVzL2csIChtYXRjaDogc3RyaW5nKSA9PiBhcmdJbmRleCA8IGFyZ3MubGVuZ3RoID8gYXJnc1thcmdJbmRleF0gOiBtYXRjaCk7XHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBibF9icmlkZ2UgPSBleHBvcnRzLmJsX2JyaWRnZVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldFBsYXllckRhdGEgPSAoKSA9PiB7XHJcbiAgICByZXR1cm4gYmxfYnJpZGdlLmNvcmUoKS5nZXRQbGF5ZXJEYXRhKClcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldEZyYW1ld29ya0lEID0gKCkgPT4ge1xyXG4gICAgY29uc3QgaWQgPSBnZXRQbGF5ZXJEYXRhKCkuY2lkXHJcbiAgICByZXR1cm4gaWRcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIERlbGF5KG1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChzdHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBpZiAoIXN0ci5pbmNsdWRlcyhcIidcIikpIHJldHVybiBzdHI7XHJcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLycvZywgXCJcIik7XHJcbn0iLCAiaW1wb3J0IHsgQ2FtZXJhLCBWZWN0b3IzLCBUQ2FtZXJhQm9uZXMgfSBmcm9tICdAdHlwaW5ncy9jYW1lcmEnO1xyXG5pbXBvcnQgeyBkZWxheSwgcGVkIH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgUmVjZWl2ZSB9IGZyb20gJ0BldmVudHMnO1xyXG5cclxuY29uc3QgV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0UgPSAyLjA7XHJcbmNvbnN0IERFRkFVTFRfTUFYX0RJU1RBTkNFID0gMS4wO1xyXG5cclxubGV0IHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGNhbURpc3RhbmNlOiBudW1iZXIgPSAxLjg7XHJcbmxldCBjYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgYW5nbGVZOiBudW1iZXIgPSAwLjA7XHJcbmxldCBhbmdsZVo6IG51bWJlciA9IDAuMDtcclxubGV0IHRhcmdldENvb3JkczogVmVjdG9yMyB8IG51bGwgPSBudWxsO1xyXG5sZXQgb2xkQ2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGNoYW5naW5nQ2FtOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBsYXN0WDogbnVtYmVyID0gMDtcclxubGV0IGN1cnJlbnRCb25lOiBrZXlvZiBUQ2FtZXJhQm9uZXMgPSAnaGVhZCc7XHJcblxyXG5jb25zdCBDYW1lcmFCb25lczogVENhbWVyYUJvbmVzID0ge1xyXG4gICAgd2hvbGU6IDAsXHJcblx0aGVhZDogMzEwODYsXHJcblx0dG9yc286IDI0ODE4LFxyXG5cdGxlZ3M6IFsxNjMzNSwgNDYwNzhdLFxyXG4gICAgc2hvZXM6IFsxNDIwMSwgNTIzMDFdLFxyXG59O1xyXG5cclxuY29uc3QgY29zID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguY29zKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3Qgc2luID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguc2luKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0QW5nbGVzID0gKCk6IG51bWJlcltdID0+IHtcclxuXHRjb25zdCB4ID1cclxuXHRcdCgoY29zKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSArIGNvcyhhbmdsZVkpICogY29zKGFuZ2xlWikpIC8gMikgKlxyXG5cdFx0Y2FtRGlzdGFuY2U7XHJcblx0Y29uc3QgeSA9XHJcblx0XHQoKHNpbihhbmdsZVopICogY29zKGFuZ2xlWSkgKyBjb3MoYW5nbGVZKSAqIHNpbihhbmdsZVopKSAvIDIpICpcclxuXHRcdGNhbURpc3RhbmNlO1xyXG5cdGNvbnN0IHogPSBzaW4oYW5nbGVZKSAqIGNhbURpc3RhbmNlO1xyXG5cclxuXHRyZXR1cm4gW3gsIHksIHpdO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtUG9zaXRpb24gPSAobW91c2VYPzogbnVtYmVyLCBtb3VzZVk/OiBudW1iZXIpOiB2b2lkID0+IHtcclxuXHRpZiAoIXJ1bm5pbmcgfHwgIXRhcmdldENvb3JkcyB8fCBjaGFuZ2luZ0NhbSkgcmV0dXJuO1xyXG5cclxuXHRtb3VzZVggPSBtb3VzZVggPz8gMC4wO1xyXG5cdG1vdXNlWSA9IG1vdXNlWSA/PyAwLjA7XHJcblxyXG5cdGFuZ2xlWiAtPSBtb3VzZVg7XHJcblx0YW5nbGVZICs9IG1vdXNlWTtcclxuXHJcbiAgICBjb25zdCBpc0hlYWRPcldob2xlID0gY3VycmVudEJvbmUgPT09ICd3aG9sZScgfHwgY3VycmVudEJvbmUgPT09ICdoZWFkJztcclxuICAgIGNvbnN0IG1heEFuZ2xlID0gaXNIZWFkT3JXaG9sZSA/IDg5LjAgOiA3MC4wO1xyXG4gICAgXHJcbiAgICBjb25zdCBpc1Nob2VzID0gY3VycmVudEJvbmUgPT09ICdzaG9lcyc7XHJcbiAgICBjb25zdCBtaW5BbmdsZSA9IGlzU2hvZXMgPyA1LjAgOiAtMjAuMDtcclxuXHJcblx0YW5nbGVZID0gTWF0aC5taW4oTWF0aC5tYXgoYW5nbGVZLCBtaW5BbmdsZSksIG1heEFuZ2xlKTtcclxuXHJcblx0Y29uc3QgW3gsIHksIHpdID0gZ2V0QW5nbGVzKCk7XHJcblxyXG5cdFNldENhbUNvb3JkKFxyXG5cdFx0Y2FtLFxyXG5cdFx0dGFyZ2V0Q29vcmRzLnggKyB4LFxyXG5cdFx0dGFyZ2V0Q29vcmRzLnkgKyB5LFxyXG5cdFx0dGFyZ2V0Q29vcmRzLnogKyB6XHJcblx0KTtcclxuXHRQb2ludENhbUF0Q29vcmQoY2FtLCB0YXJnZXRDb29yZHMueCwgdGFyZ2V0Q29vcmRzLnksIHRhcmdldENvb3Jkcy56KTtcclxufTtcclxuXHJcbmNvbnN0IG1vdmVDYW1lcmEgPSBhc3luYyAoY29vcmRzOiBWZWN0b3IzLCBkaXN0YW5jZT86IG51bWJlcikgPT4ge1xyXG5cdGNvbnN0IGhlYWRpbmc6IG51bWJlciA9IEdldEVudGl0eUhlYWRpbmcocGVkKSArIDk0O1xyXG5cdGRpc3RhbmNlID0gZGlzdGFuY2UgPz8gMS4wO1xyXG5cclxuXHRjaGFuZ2luZ0NhbSA9IHRydWU7XHJcblx0Y2FtRGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuXHRhbmdsZVogPSBoZWFkaW5nO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKTtcclxuXHJcblx0Y29uc3QgbmV3Y2FtOiBDYW1lcmEgPSBDcmVhdGVDYW1XaXRoUGFyYW1zKFxyXG5cdFx0J0RFRkFVTFRfU0NSSVBURURfQ0FNRVJBJyxcclxuXHRcdGNvb3Jkcy54ICsgeCxcclxuXHRcdGNvb3Jkcy55ICsgeSxcclxuXHRcdGNvb3Jkcy56ICsgeixcclxuXHRcdDAuMCxcclxuXHRcdDAuMCxcclxuXHRcdDAuMCxcclxuXHRcdDcwLjAsXHJcblx0XHRmYWxzZSxcclxuXHRcdDBcclxuXHQpO1xyXG5cclxuXHR0YXJnZXRDb29yZHMgPSBjb29yZHM7XHJcblx0Y2hhbmdpbmdDYW0gPSBmYWxzZTtcclxuXHRvbGRDYW0gPSBjYW07XHJcblx0Y2FtID0gbmV3Y2FtO1xyXG5cclxuXHRQb2ludENhbUF0Q29vcmQobmV3Y2FtLCBjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56KTtcclxuXHRTZXRDYW1BY3RpdmVXaXRoSW50ZXJwKG5ld2NhbSwgb2xkQ2FtLCAyNTAsIDAsIDApO1xyXG5cclxuXHRhd2FpdCBkZWxheSgyNTApO1xyXG5cclxuXHRTZXRDYW1Vc2VTaGFsbG93RG9mTW9kZShuZXdjYW0sIHRydWUpO1xyXG5cdFNldENhbU5lYXJEb2YobmV3Y2FtLCAwLjQpO1xyXG5cdFNldENhbUZhckRvZihuZXdjYW0sIDEuMik7XHJcblx0U2V0Q2FtRG9mU3RyZW5ndGgobmV3Y2FtLCAwLjMpO1xyXG5cdHVzZUhpRG9mKG5ld2NhbSk7XHJcblxyXG5cdERlc3Ryb3lDYW0ob2xkQ2FtLCB0cnVlKTtcclxufTtcclxuXHJcbmNvbnN0IHVzZUhpRG9mID0gKGN1cnJlbnRjYW06IENhbWVyYSkgPT4ge1xyXG5cdGlmICghKERvZXNDYW1FeGlzdChjYW0pICYmIGN1cnJlbnRjYW0gPT0gY2FtKSkgcmV0dXJuO1xyXG5cdFNldFVzZUhpRG9mKCk7XHJcblx0c2V0VGltZW91dCh1c2VIaURvZiwgMCk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc3RhcnRDYW1lcmEgPSAoKSA9PiB7XHJcblx0aWYgKHJ1bm5pbmcpIHJldHVybjtcclxuXHRydW5uaW5nID0gdHJ1ZTtcclxuXHRjYW1EaXN0YW5jZSA9IFdIT0xFX0JPRFlfTUFYX0RJU1RBTkNFXHJcblx0Y2FtID0gQ3JlYXRlQ2FtKCdERUZBVUxUX1NDUklQVEVEX0NBTUVSQScsIHRydWUpO1xyXG5cdGNvbnN0IFt4LCB5LCB6XTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgMzEwODYsIDAuMCwgMC4wLCAwLjApO1xyXG5cdFNldENhbUNvb3JkKGNhbSwgeCwgeSwgeik7XHJcblx0UmVuZGVyU2NyaXB0Q2Ftcyh0cnVlLCB0cnVlLCAxMDAwLCB0cnVlLCB0cnVlKTtcclxuXHQvLyBtb3ZlQ2FtZXJhKHsgeDogeCwgeTogeSwgejogeiB9LCBjYW1EaXN0YW5jZSk7XHJcbiAgICBzZXRDYW1lcmEoJ3dob2xlJywgY2FtRGlzdGFuY2UpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0b3BDYW1lcmEgPSAoKTogdm9pZCA9PiB7XHJcblx0aWYgKCFydW5uaW5nKSByZXR1cm47XHJcblx0cnVubmluZyA9IGZhbHNlO1xyXG5cclxuXHRSZW5kZXJTY3JpcHRDYW1zKGZhbHNlLCB0cnVlLCAyNTAsIHRydWUsIGZhbHNlKTtcclxuXHREZXN0cm95Q2FtKGNhbSwgdHJ1ZSk7XHJcblx0Y2FtID0gbnVsbDtcclxuXHR0YXJnZXRDb29yZHMgPSBudWxsO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtZXJhID0gKHR5cGU/OiBrZXlvZiBUQ2FtZXJhQm9uZXMsIGRpc3RhbmNlID0gY2FtRGlzdGFuY2UpOiB2b2lkID0+IHtcclxuXHJcblx0Y29uc3QgYm9uZTogbnVtYmVyIHwgbnVtYmVyW10gfCB1bmRlZmluZWQgPSBDYW1lcmFCb25lc1t0eXBlXTtcclxuXHJcbiAgICBjb25zdCBpc0JvbmVBcnJheSA9IEFycmF5LmlzQXJyYXkoYm9uZSlcclxuXHJcbiAgICBjdXJyZW50Qm9uZSA9IHR5cGU7XHJcblxyXG4gICAgaWYgKCFpc0JvbmVBcnJheSAmJiBib25lID09PSAwKSB7XHJcbiAgICAgICAgY29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldEVudGl0eUNvb3JkcyhwZWQsIGZhbHNlKTtcclxuICAgICAgICBtb3ZlQ2FtZXJhKFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgICAgeTogeSxcclxuICAgICAgICAgICAgICAgIHo6IHogKyAwLjAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRpc3RhbmNlXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgaXRzIG5vdCB3aG9sZSBib2R5LCB0aGVuIHdlIG5lZWQgdG8gbGltaXQgdGhlIGRpc3RhbmNlXHJcbiAgICBpZiAoZGlzdGFuY2UgPiBERUZBVUxUX01BWF9ESVNUQU5DRSkgZGlzdGFuY2UgPSBERUZBVUxUX01BWF9ESVNUQU5DRTtcclxuXHJcbiAgICBpZiAoaXNCb25lQXJyYXkpIHtcclxuICAgICAgICBjb25zdCBbeDEsIHkxLCB6MV06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmVbMF0sIDAuMCwgMC4wLCAwLjApXHJcblxyXG4gICAgICAgIGNvbnN0IFt4MiwgeTIsIHoyXTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZVsxXSwgMC4wLCAwLjAsIDAuMClcclxuXHJcbiAgICAgICAgLy8gZ2V0IHRoZSBtaWRkbGUgb2YgdGhlIHR3byBwb2ludHNcclxuICAgICAgICB2YXIgeCA9ICh4MSArIHgyKSAvIDI7XHJcbiAgICAgICAgdmFyIHkgPSAoeTEgKyB5MikgLyAyO1xyXG4gICAgICAgIHZhciB6ID0gKHoxICsgejIpIC8gMjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIFt4LCB5LCB6XTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZSwgMC4wLCAwLjAsIDAuMClcclxuICAgIH1cclxuXHJcblx0bW92ZUNhbWVyYShcclxuXHRcdHtcclxuXHRcdFx0eDogeCxcclxuXHRcdFx0eTogeSxcclxuXHRcdFx0ejogeiArIDAuMCxcclxuXHRcdH0sXHJcblx0XHRkaXN0YW5jZVxyXG5cdCk7XHJcblxyXG59O1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbU1vdmUsIChkYXRhLCBjYikgPT4ge1xyXG4gICAgLy8gbGV0IGhlYWRpbmc6IG51bWJlciA9IEdldEVudGl0eUhlYWRpbmcocGVkKTtcclxuXHQvLyBpZiAobGFzdFggPT0gZGF0YS54KSB7XHJcbiAgICAgICAgLy8gXHRyZXR1cm47XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIC8vIGhlYWRpbmcgPSBkYXRhLnggPiBsYXN0WCA/IGhlYWRpbmcgKyA1IDogaGVhZGluZyAtIDU7XHJcbiAgICAgICAgLy8gU2V0RW50aXR5SGVhZGluZyhwZWQsIGhlYWRpbmcpO1xyXG4gICAgc2V0Q2FtUG9zaXRpb24oZGF0YS54LCBkYXRhLnkpO1xyXG4gICAgY2IoMSk7XHJcbn0pO1xyXG5cclxudHlwZSBUU2VjdGlvbiA9ICd3aG9sZScgfCAnaGVhZCcgfCAndG9yc28nIHwgJ2xlZ3MnIHwgJ3Nob2VzJztcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1TZWN0aW9uLCAodHlwZTogVFNlY3Rpb24sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgY29uc29sZS5sb2codHlwZSlcclxuXHRzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlICd3aG9sZSc6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgnd2hvbGUnLCBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2hlYWQnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ2hlYWQnKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAndG9yc28nOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ3RvcnNvJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2xlZ3MnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ2xlZ3MnKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnc2hvZXMnOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoJ3Nob2VzJyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cdH1cclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtWm9vbSwgKGRhdGEsIGNiKSA9PiB7XHJcblx0aWYgKGRhdGEgPT09ICdkb3duJykge1xyXG5cclxuICAgICAgICBjb25zdCBtYXhab29tID0gY3VycmVudEJvbmUgPT09ICd3aG9sZScgPyBXSE9MRV9CT0RZX01BWF9ESVNUQU5DRSA6IERFRkFVTFRfTUFYX0RJU1RBTkNFO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhtYXhab29tKVxyXG5cclxuXHRcdGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSArIDAuMDU7XHJcblx0XHRjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlID49IG1heFpvb20gPyBtYXhab29tIDogbmV3RGlzdGFuY2U7XHJcblx0fSBlbHNlIGlmIChkYXRhID09PSAndXAnKSB7XHJcblx0XHRjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgLSAwLjA1O1xyXG5cdFx0Y2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA8PSAwLjMgPyAwLjMgOiBuZXdEaXN0YW5jZTtcclxuXHR9XHJcblxyXG5cdGNhbURpc3RhbmNlID0gY2FtRGlzdGFuY2U7XHJcblx0c2V0Q2FtUG9zaXRpb24oKTtcclxuXHRjYigxKTtcclxufSk7XHJcbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJCbGVtaXNoZXNcIixcbiAgICBcIkZhY2lhbEhhaXJcIixcbiAgICBcIkV5ZWJyb3dzXCIsXG4gICAgXCJBZ2VpbmdcIixcbiAgICBcIk1ha2V1cFwiLFxuICAgIFwiQmx1c2hcIixcbiAgICBcIkNvbXBsZXhpb25cIixcbiAgICBcIlN1bkRhbWFnZVwiLFxuICAgIFwiTGlwc3RpY2tcIixcbiAgICBcIk1vbGVzRnJlY2tsZXNcIixcbiAgICBcIkNoZXN0SGFpclwiLFxuICAgIFwiQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiQWRkQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiRXllQ29sb3JcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcIk5vc2VfV2lkdGhcIixcbiAgICBcIk5vc2VfUGVha19IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19MZW5naHRcIixcbiAgICBcIk5vc2VfQm9uZV9IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19Mb3dlcmluZ1wiLFxuICAgIFwiTm9zZV9Cb25lX1R3aXN0XCIsXG4gICAgXCJFeWVCcm93bl9IZWlnaHRcIixcbiAgICBcIkV5ZUJyb3duX0ZvcndhcmRcIixcbiAgICBcIkNoZWVrc19Cb25lX0hpZ2hcIixcbiAgICBcIkNoZWVrc19Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGVla3NfV2lkdGhcIixcbiAgICBcIkV5ZXNfT3Blbm5pbmdcIixcbiAgICBcIkxpcHNfVGhpY2tuZXNzXCIsXG4gICAgXCJKYXdfQm9uZV9XaWR0aFwiLFxuICAgIFwiSmF3X0JvbmVfQmFja19MZW5naHRcIixcbiAgICBcIkNoaW5fQm9uZV9Mb3dlcmluZ1wiLFxuICAgIFwiQ2hpbl9Cb25lX0xlbmd0aFwiLFxuICAgIFwiQ2hpbl9Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGluX0hvbGVcIixcbiAgICBcIk5lY2tfVGhpa25lc3NcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImZhY2VcIixcbiAgICBcIm1hc2tzXCIsXG4gICAgXCJoYWlyXCIsXG4gICAgXCJ0b3Jzb3NcIixcbiAgICBcImxlZ3NcIixcbiAgICBcImJhZ3NcIixcbiAgICBcInNob2VzXCIsXG4gICAgXCJuZWNrXCIsXG4gICAgXCJzaGlydHNcIixcbiAgICBcInZlc3RcIixcbiAgICBcImRlY2Fsc1wiLFxuICAgIFwiamFja2V0c1wiXG5dXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiaGF0c1wiLFxuICAgIFwiZ2xhc3Nlc1wiLFxuICAgIFwiZWFycmluZ3NcIixcbiAgICBcIm1vdXRoXCIsXG4gICAgXCJsaGFuZFwiLFxuICAgIFwicmhhbmRcIixcbiAgICBcIndhdGNoZXNcIixcbiAgICBcImJyYWNlbGV0c1wiXG5dXG4iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRIYWlyRGF0YSwgVEhlYWRPdmVybGF5LCBUSGVhZE92ZXJsYXlUb3RhbCB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IEhFQURfT1ZFUkxBWVMgZnJvbSBcIkBkYXRhL2hlYWRcIlxyXG5pbXBvcnQgRkFDRV9GRUFUVVJFUyBmcm9tIFwiQGRhdGEvZmFjZVwiXHJcbmltcG9ydCBEUkFXQUJMRV9OQU1FUyBmcm9tIFwiQGRhdGEvZHJhd2FibGVzXCJcclxuaW1wb3J0IFBST1BfTkFNRVMgZnJvbSBcIkBkYXRhL3Byb3BzXCJcclxuaW1wb3J0IHsgcGVkLCBvblNlcnZlckNhbGxiYWNrIH0gZnJvbSAnQHV0aWxzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kTW9kZWxJbmRleCh0YXJnZXQ6IG51bWJlcikge1xyXG4gICAgY29uc3QgY29uZmlnID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlXHJcbiAgICBjb25zdCBtb2RlbHMgPSBjb25maWcubW9kZWxzKClcclxuXHJcbiAgICByZXR1cm4gbW9kZWxzLmZpbmRJbmRleCgobW9kZWw6IHN0cmluZykgPT4gR2V0SGFzaEtleShtb2RlbCkgPT09IHRhcmdldClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhhaXIocGVkSGFuZGxlOiBudW1iZXIpOiBUSGFpckRhdGEge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjb2xvcjogR2V0UGVkSGFpckNvbG9yKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGlnaGxpZ2h0OiBHZXRQZWRIYWlySGlnaGxpZ2h0Q29sb3IocGVkSGFuZGxlKVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZEJsZW5kRGF0YShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BlZHIwZm9udG91cmEvZml2ZW0tYXBwZWFyYW5jZS9ibG9iL21haW4vZ2FtZS9zcmMvY2xpZW50L2luZGV4LnRzI0w2N1xyXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKDgwKTtcclxuICAgIGdsb2JhbC5DaXRpemVuLmludm9rZU5hdGl2ZSgnMHgyNzQ2YmQ5ZDg4YzVjNWQwJywgcGVkSGFuZGxlLCBuZXcgVWludDMyQXJyYXkoYnVmZmVyKSk7XHJcblxyXG4gICAgY29uc3QgeyAwOiBzaGFwZUZpcnN0LCAyOiBzaGFwZVNlY29uZCwgNDogc2hhcGVUaGlyZCwgNjogc2tpbkZpcnN0LCA4OiBza2luU2Vjb25kLCAxODogaGFzUGFyZW50LCAxMDogc2tpblRoaXJkIH0gPSBuZXcgVWludDMyQXJyYXkoYnVmZmVyKTtcclxuICAgIGNvbnN0IHsgMDogc2hhcGVNaXgsIDI6IHNraW5NaXgsIDQ6IHRoaXJkTWl4IH0gPSBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlciwgNDgpO1xyXG5cclxuICAgIC8qICAgXHJcbiAgICAgICAgMDogc2hhcGVGaXJzdCxcclxuICAgICAgICAyOiBzaGFwZVNlY29uZCxcclxuICAgICAgICA0OiBzaGFwZVRoaXJkLFxyXG4gICAgICAgIDY6IHNraW5GaXJzdCxcclxuICAgICAgICA4OiBza2luU2Vjb25kLFxyXG4gICAgICAgIDEwOiBza2luVGhpcmQsXHJcbiAgICAgICAgMTg6IGhhc1BhcmVudCxcclxuICAgICovXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNoYXBlRmlyc3QsICAgLy8gZmF0aGVyXHJcbiAgICAgICAgc2hhcGVTZWNvbmQsIC8vIG1vdGhlclxyXG4gICAgICAgIHNoYXBlVGhpcmQsXHJcblxyXG4gICAgICAgIHNraW5GaXJzdCxcclxuICAgICAgICBza2luU2Vjb25kLFxyXG4gICAgICAgIHNraW5UaGlyZCxcclxuXHJcbiAgICAgICAgc2hhcGVNaXgsIC8vIHJlc2VtYmxhbmNlXHJcblxyXG4gICAgICAgIHRoaXJkTWl4LFxyXG4gICAgICAgIHNraW5NaXgsICAgLy8gc2tpbnBlcmNlbnRcclxuXHJcbiAgICAgICAgaGFzUGFyZW50OiBCb29sZWFuKGhhc1BhcmVudCksXHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCB0b3RhbHM6IFRIZWFkT3ZlcmxheVRvdGFsID0ge307XHJcbiAgICBsZXQgaGVhZERhdGE6IFRIZWFkT3ZlcmxheSA9IHt9O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgSEVBRF9PVkVSTEFZUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBIRUFEX09WRVJMQVlTW2ldO1xyXG4gICAgICAgIHRvdGFsc1tvdmVybGF5XSA9IEdldE51bUhlYWRPdmVybGF5VmFsdWVzKGkpO1xyXG5cclxuICAgICAgICBpZiAob3ZlcmxheSA9PT0gXCJFeWVDb2xvclwiKSB7XHJcbiAgICAgICAgICAgIGhlYWREYXRhW292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogR2V0UGVkRXllQ29sb3IocGVkSGFuZGxlKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFtfLCBvdmVybGF5VmFsdWUsIGNvbG91clR5cGUsIGZpcnN0Q29sb3IsIHNlY29uZENvbG9yLCBvdmVybGF5T3BhY2l0eV0gPSBHZXRQZWRIZWFkT3ZlcmxheURhdGEocGVkSGFuZGxlLCBpICsgMSk7XHJcbiAgICAgICAgICAgIGhlYWREYXRhW292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogb3ZlcmxheVZhbHVlID09PSAyNTUgPyAtMSA6IG92ZXJsYXlWYWx1ZSxcclxuICAgICAgICAgICAgICAgIGNvbG91clR5cGU6IGNvbG91clR5cGUsXHJcbiAgICAgICAgICAgICAgICBmaXJzdENvbG9yOiBmaXJzdENvbG9yLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kQ29sb3I6IHNlY29uZENvbG9yLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheU9wYWNpdHk6IG92ZXJsYXlPcGFjaXR5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbaGVhZERhdGEsIHRvdGFsc107XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBwZWRNb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuXHJcbiAgICBpZiAocGVkTW9kZWwgIT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpICYmIHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKSkgcmV0dXJuXHJcblxyXG4gICAgbGV0IGZhY2VTdHJ1Y3QgPSB7fVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBGQUNFX0ZFQVRVUkVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEZBQ0VfRkVBVFVSRVNbaV1cclxuICAgICAgICBmYWNlU3RydWN0W292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWRGYWNlRmVhdHVyZShwZWRIYW5kbGUsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWNlU3RydWN0XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXREcmF3YWJsZXMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBkcmF3YWJsZXMgPSB7fVxyXG4gICAgbGV0IHRvdGFsRHJhd2FibGVzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IERSQVdBQkxFX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IERSQVdBQkxFX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxEcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRUZXh0dXJlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtkcmF3YWJsZXMsIHRvdGFsRHJhd2FibGVzXVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcHMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBwcm9wcyA9IHt9XHJcbiAgICBsZXQgdG90YWxQcm9wcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBQUk9QX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IFBST1BfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxQcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWRQcm9wRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFByb3BUZXh0dXJlSW5kZXgocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3Byb3BzLCB0b3RhbFByb3BzXVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwcGVhcmFuY2UocGVkSGFuZGxlOiBudW1iZXIpOiBQcm9taXNlPFRBcHBlYXJhbmNlPiB7XHJcbiAgICBjb25zdCBbaGVhZERhdGEsIHRvdGFsc10gPSBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbZHJhd2FibGVzLCBkcmF3VG90YWxdID0gZ2V0RHJhd2FibGVzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtwcm9wcywgcHJvcFRvdGFsXSA9IGdldFByb3BzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IG1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkSGFuZGxlKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbW9kZWxJbmRleDogZmluZE1vZGVsSW5kZXgobW9kZWwpLFxyXG4gICAgICAgIG1vZGVsOiBtb2RlbCxcclxuICAgICAgICBoYWlyQ29sb3I6IGdldEhhaXIocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEgYXMgVEhlYWRPdmVybGF5LFxyXG4gICAgICAgIGhlYWRPdmVybGF5VG90YWw6IHRvdGFscyBhcyBUSGVhZE92ZXJsYXlUb3RhbCxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZSksXHJcbiAgICAgICAgZHJhd2FibGVzOiBkcmF3YWJsZXMsXHJcbiAgICAgICAgcHJvcHM6IHByb3BzLFxyXG4gICAgICAgIGRyYXdUb3RhbDogZHJhd1RvdGFsLFxyXG4gICAgICAgIHByb3BUb3RhbDogcHJvcFRvdGFsLFxyXG4gICAgICAgIHRhdHRvb3M6IFtdXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldEFwcGVhcmFuY2VcIiwgZ2V0QXBwZWFyYW5jZSlcclxub25TZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6Z2V0QXBwZWFyYW5jZScsICgpID0+IHtcclxuICAgIHJldHVybiBnZXRBcHBlYXJhbmNlKHBlZClcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVkQ2xvdGhlcyhwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgY29uc3QgW2RyYXdhYmxlc10gPSBnZXREcmF3YWJsZXMocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW3Byb3BzXSA9IGdldFByb3BzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtoZWFkRGF0YV0gPSBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEsXHJcbiAgICAgICAgZHJhd2FibGVzOiBkcmF3YWJsZXMsXHJcbiAgICAgICAgcHJvcHM6IHByb3BzLFxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRQZWRDbG90aGVzXCIsIGdldFBlZENsb3RoZXMpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVkU2tpbihwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZEhhbmRsZSksXHJcbiAgICAgICAgbW9kZWw6IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkU2tpblwiLCBnZXRQZWRTa2luKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhdHRvb0RhdGEoKSB7XHJcbiAgICBsZXQgdGF0dG9vWm9uZXMgPSBbXVxyXG5cclxuICAgIGNvbnN0IFtUQVRUT09fTElTVCwgVEFUVE9PX0NBVEVHT1JJRVNdID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLnRhdHRvb3MoKVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fQ0FURUdPUklFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gVEFUVE9PX0NBVEVHT1JJRVNbaV1cclxuICAgICAgICBjb25zdCB6b25lID0gY2F0ZWdvcnkuem9uZVxyXG4gICAgICAgIGNvbnN0IGxhYmVsID0gY2F0ZWdvcnkubGFiZWxcclxuICAgICAgICBjb25zdCBpbmRleCA9IGNhdGVnb3J5LmluZGV4XHJcbiAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdID0ge1xyXG4gICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICBsYWJlbDogbGFiZWwsXHJcbiAgICAgICAgICAgIHpvbmVJbmRleDogaW5kZXgsXHJcbiAgICAgICAgICAgIGRsY3M6IFtdXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IFRBVFRPT19MSVNULmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRsY0RhdGEgPSBUQVRUT09fTElTVFtqXVxyXG4gICAgICAgICAgICB0YXR0b29ab25lc1tpbmRleF0uZGxjcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBkbGNEYXRhLmRsYyxcclxuICAgICAgICAgICAgICAgIGRsY0luZGV4OiBqLFxyXG4gICAgICAgICAgICAgICAgdGF0dG9vczogW11cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaXNGZW1hbGUgPSBHZXRFbnRpdHlNb2RlbChwZWQpID09PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gVEFUVE9PX0xJU1RbaV1cclxuICAgICAgICBjb25zdCB7IGRsYywgdGF0dG9vcyB9ID0gZGF0YVxyXG4gICAgICAgIGNvbnN0IGRsY0hhc2ggPSBHZXRIYXNoS2V5KGRsYylcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRhdHRvb3MubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IHRhdHRvb3Nbal1cclxuICAgICAgICAgICAgbGV0IHRhdHRvbyA9IG51bGxcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyVGF0dG9vID0gdGF0dG9vRGF0YS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIGNvbnN0IGlzRmVtYWxlVGF0dG9vID0gbG93ZXJUYXR0b28uaW5jbHVkZXMoXCJfZlwiKVxyXG4gICAgICAgICAgICBpZiAoaXNGZW1hbGVUYXR0b28gJiYgaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNGZW1hbGVUYXR0b28gJiYgIWlzRmVtYWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXR0b28gPSB0YXR0b29EYXRhXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBoYXNoID0gbnVsbFxyXG4gICAgICAgICAgICBsZXQgem9uZSA9IC0xXHJcblxyXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoID0gR2V0SGFzaEtleSh0YXR0b28pXHJcbiAgICAgICAgICAgICAgICB6b25lID0gR2V0UGVkRGVjb3JhdGlvblpvbmVGcm9tSGFzaGVzKGRsY0hhc2gsIGhhc2gpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh6b25lICE9PSAtMSAmJiBoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB6b25lVGF0dG9vcyA9IHRhdHRvb1pvbmVzW3pvbmVdLmRsY3NbaV0udGF0dG9vc1xyXG5cclxuICAgICAgICAgICAgICAgIHpvbmVUYXR0b29zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0YXR0b28sXHJcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogaGFzaCxcclxuICAgICAgICAgICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICAgICAgICAgIGRsYzogZGxjLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGF0dG9vWm9uZXNcclxufVxyXG5cclxuLy9taWdyYXRpb25cclxuXHJcbm9uU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50Om1pZ3JhdGlvbjpzZXRBcHBlYXJhbmNlJywgKGRhdGE6IHt0eXBlOiBzdHJpbmcsIGRhdGE6IGFueX0pID0+IHtcclxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdmaXZlbScpIGV4cG9ydHNbJ2ZpdmVtLWFwcGVhcmFuY2UnXS5zZXRQbGF5ZXJBcHBlYXJhbmNlKGRhdGEuZGF0YSlcclxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdpbGxlbml1bScpIGV4cG9ydHNbJ2lsbGVuaXVtLWFwcGVhcmFuY2UnXS5zZXRQbGF5ZXJBcHBlYXJhbmNlKGRhdGEuZGF0YSlcclxufSk7IiwgIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgaGF0czoge1xyXG4gICAgICAgIHR5cGU6IFwicHJvcFwiLFxyXG4gICAgICAgIGluZGV4OiAwLFxyXG4gICAgfSxcclxuICAgIGdsYXNzZXM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgIH0sXHJcbiAgICBtYXNrczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgICAgICBvZmY6IDAsXHJcbiAgICB9LFxyXG4gICAgc2hpcnRzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA4LFxyXG4gICAgICAgIG9mZjogMTUsXHJcbiAgICAgICAgaG9vazoge1xyXG4gICAgICAgICAgICBkcmF3YWJsZXM6IFtcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAzLCB2YXJpYW50OiAxNSwgdGV4dHVyZTogMCwgaWQ6ICd0b3Jzb3MnIH0sXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogMTEsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ2phY2tldHMnfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGphY2tldHM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDExLFxyXG4gICAgICAgIG9mZjogMTUsXHJcbiAgICAgICAgaG9vazoge1xyXG4gICAgICAgICAgICBkcmF3YWJsZXM6IFtcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAzLCB2YXJpYW50OiAxNSwgdGV4dHVyZTogMCwgaWQ6ICd0b3Jzb3MnIH0sXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogOCwgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAnc2hpcnRzJ31cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBsZWdzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA0LFxyXG4gICAgICAgIG9mZjogMTEsXHJcbiAgICB9LFxyXG4gICAgc2hvZXM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDYsXHJcbiAgICAgICAgb2ZmOiAxMyxcclxuICAgIH1cclxufSIsICJpbXBvcnQgeyBUVmFsdWUgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiO1xyXG5pbXBvcnQgVE9HR0xFX0lOREVYRVMgZnJvbSBcIkBkYXRhL3RvZ2dsZXNcIlxyXG5pbXBvcnQgeyByZXF1ZXN0TW9kZWwsIHBlZCwgdXBkYXRlUGVkLCBkZWxheX0gZnJvbSAnQHV0aWxzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXREcmF3YWJsZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlLCBkYXRhLnRleHR1cmUsIDApXHJcbiAgICByZXR1cm4gR2V0TnVtYmVyT2ZQZWRUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQcm9wKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIGlmIChkYXRhLnZhbHVlID09PSAtMSkge1xyXG4gICAgICAgIENsZWFyUGVkUHJvcChwZWRIYW5kbGUsIGRhdGEuaW5kZXgpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgU2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCBmYWxzZSlcclxuICAgIHJldHVybiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZXRNb2RlbCA9IGFzeW5jIChtb2RlbDogbnVtYmVyKSA9PiB7XHJcbiAgICBjb25zdCBtb2RlbEhhc2ggPSBhd2FpdCByZXF1ZXN0TW9kZWwobW9kZWwpXHJcbiAgICBTZXRQbGF5ZXJNb2RlbChQbGF5ZXJJZCgpLCBtb2RlbEhhc2gpXHJcbiAgICBTZXRNb2RlbEFzTm9Mb25nZXJOZWVkZWQobW9kZWxIYXNoKVxyXG4gICAgY29uc3QgcGVkSGFuZGxlID0gUGxheWVyUGVkSWQoKVxyXG4gICAgdXBkYXRlUGVkKHBlZEhhbmRsZSlcclxuICAgIFNldFBlZERlZmF1bHRDb21wb25lbnRWYXJpYXRpb24ocGVkSGFuZGxlKVxyXG5cclxuICAgIGlmIChtb2RlbEhhc2ggPT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgZmFsc2UpXHJcbiAgICBlbHNlIGlmIChtb2RlbEhhc2ggPT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgNDUsIDIxLCAwLCAyMCwgMTUsIDAsIDAuMywgMC4xLCAwLCBmYWxzZSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFNldEZhY2VGZWF0dXJlKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIFNldFBlZEZhY2VGZWF0dXJlKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSArIDAuMClcclxufVxyXG5cclxuY29uc3QgaXNQb3NpdGl2ZSA9ICh2YWw6IG51bWJlcikgPT4gdmFsID49IDAgPyB2YWwgOiAwXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0SGVhZEJsZW5kKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBjb25zdCBzaGFwZUZpcnN0ID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlRmlyc3QpXHJcbiAgICBjb25zdCBzaGFwZVNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZVNlY29uZClcclxuICAgIGNvbnN0IHNoYXBlVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVUaGlyZClcclxuICAgIGNvbnN0IHNraW5GaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5za2luRmlyc3QpXHJcbiAgICBjb25zdCBza2luU2Vjb25kID0gaXNQb3NpdGl2ZShkYXRhLnNraW5TZWNvbmQpXHJcbiAgICBjb25zdCBza2luVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpblRoaXJkKVxyXG4gICAgY29uc3Qgc2hhcGVNaXggPSBkYXRhLnNoYXBlTWl4ICsgMC4wXHJcbiAgICBjb25zdCBza2luTWl4ID0gZGF0YS5za2luTWl4ICsgMC4wXHJcbiAgICBjb25zdCB0aGlyZE1peCA9IGRhdGEudGhpcmRNaXggKyAwLjBcclxuICAgIGNvbnN0IGhhc1BhcmVudCA9IGRhdGEuaGFzUGFyZW50XHJcblxyXG4gICAgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWRIYW5kbGUsIHNoYXBlRmlyc3QsIHNoYXBlU2Vjb25kLCBzaGFwZVRoaXJkLCBza2luRmlyc3QsIHNraW5TZWNvbmQsIHNraW5UaGlyZCwgc2hhcGVNaXgsIHNraW5NaXgsIHRoaXJkTWl4LCBoYXNQYXJlbnQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkT3ZlcmxheShwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgY29uc3QgaW5kZXggPSBkYXRhLmluZGV4XHJcblxyXG4gICAgaWYgKGluZGV4ID09PSAxMykge1xyXG4gICAgICAgIFNldFBlZEV5ZUNvbG9yKHBlZEhhbmRsZSwgZGF0YS52YWx1ZSlcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlID09PSAtMSA/IDI1NSA6IGRhdGEub3ZlcmxheVZhbHVlXHJcblxyXG4gICAgLyogSGFpciBjb2xvciBkb2VzIG5vdCBoYXZlIGFuIGluZGV4LCBvbmx5IGFuIElEIHNvIHdlJ2xsIGNoZWNrIGZvciB0aGF0ICovXHJcbiAgICBpZiAoZGF0YS5pZCA9PT0gJ2hhaXJDb2xvcicpIHtcclxuICAgICAgICBTZXRQZWRIYWlyVGludChwZWRIYW5kbGUsIGRhdGEuaGFpckNvbG9yLCBkYXRhLmhhaXJIaWdobGlnaHQpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIFNldFBlZEhlYWRPdmVybGF5KHBlZEhhbmRsZSwgaW5kZXgsIHZhbHVlLCBkYXRhLm92ZXJsYXlPcGFjaXR5ICsgMC4wKVxyXG4gICAgU2V0UGVkSGVhZE92ZXJsYXlDb2xvcihwZWRIYW5kbGUsIGluZGV4LCAxLCBkYXRhLmZpcnN0Q29sb3IsIGRhdGEuc2Vjb25kQ29sb3IpXHJcbn1cclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRUb2dnbGVzKGRhdGEpIHtcclxuICAgIGNvbnN0IGRyYXdhYmxlcyA9IGRhdGEuZHJhd2FibGVzXHJcbiAgICBjb25zdCBwcm9wcyA9IGRhdGEucHJvcHNcclxuXHJcbiAgICBmb3IgKGNvbnN0IFt0b2dnbGVJdGVtLCB0b2dnbGVEYXRhXSBvZiBPYmplY3QuZW50cmllcyhUT0dHTEVfSU5ERVhFUykpIHtcclxuICAgICAgICBjb25zdCB0b2dnbGVUeXBlID0gdG9nZ2xlRGF0YS50eXBlXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0b2dnbGVEYXRhLmluZGV4XHJcblxyXG4gICAgICAgIGlmICh0b2dnbGVUeXBlID09PSBcImRyYXdhYmxlXCIgJiYgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50RHJhd2FibGUgIT09IGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaW5kZXgsIGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodG9nZ2xlVHlwZSA9PT0gXCJwcm9wXCIgJiYgcHJvcHNbdG9nZ2xlSXRlbV0pIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFByb3AgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleClcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRQcm9wICE9PSBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgU2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgsIHByb3BzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCBmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZENsb3RoZXMocGVkSGFuZGxlOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIGNvbnN0IGRyYXdhYmxlcyA9IGRhdGEuZHJhd2FibGVzXHJcbiAgICBjb25zdCBwcm9wcyA9IGRhdGEucHJvcHNcclxuICAgIGNvbnN0IGhlYWRPdmVybGF5ID0gZGF0YS5oZWFkT3ZlcmxheVxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBkcmF3YWJsZXMpIHtcclxuICAgICAgICBjb25zdCBkcmF3YWJsZSA9IGRyYXdhYmxlc1tpZF1cclxuICAgICAgICBzZXREcmF3YWJsZShwZWRIYW5kbGUsIGRyYXdhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgaWQgaW4gcHJvcHMpIHtcclxuICAgICAgICBjb25zdCBwcm9wID0gcHJvcHNbaWRdXHJcbiAgICAgICAgc2V0UHJvcChwZWRIYW5kbGUsIHByb3ApXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBoZWFkT3ZlcmxheSkge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBoZWFkT3ZlcmxheVtpZF1cclxuICAgICAgICBzZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUsIG92ZXJsYXkpXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZXRQZWRTa2luID0gYXN5bmMgKGRhdGEpID0+IHtcclxuICAgIGNvbnN0IGhlYWRTdHJ1Y3R1cmUgPSBkYXRhLmhlYWRTdHJ1Y3R1cmVcclxuICAgIGNvbnN0IGhlYWRCbGVuZCA9IGRhdGEuaGVhZEJsZW5kXHJcblxyXG4gICAgYXdhaXQgc2V0TW9kZWwoZGF0YS5tb2RlbClcclxuXHJcbiAgICBpZiAoaGVhZEJsZW5kKSBzZXRIZWFkQmxlbmQocGVkLCBoZWFkQmxlbmQpXHJcbiAgICBcclxuICAgIGlmIChoZWFkU3RydWN0dXJlKSBmb3IgKGNvbnN0IGZlYXR1cmUgaW4gaGVhZFN0cnVjdHVyZSkge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gaGVhZFN0cnVjdHVyZVtmZWF0dXJlXVxyXG4gICAgICAgIFNldEZhY2VGZWF0dXJlKHBlZCwgdmFsdWUpXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRUYXR0b29zKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVyblxyXG5cclxuICAgIENsZWFyUGVkRGVjb3JhdGlvbnNMZWF2ZVNjYXJzKHBlZEhhbmRsZSlcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gZGF0YVtpXS50YXR0b29cclxuICAgICAgICBpZiAodGF0dG9vRGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gR2V0SGFzaEtleSh0YXR0b29EYXRhLmRsYylcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vID0gdGF0dG9vRGF0YS5oYXNoXHJcbiAgICAgICAgICAgIEFkZFBlZERlY29yYXRpb25Gcm9tSGFzaGVzKHBlZEhhbmRsZSwgY29sbGVjdGlvbiwgdGF0dG9vKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZEhhaXJDb2xvcnMocGVkSGFuZGxlOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIGNvbnN0IGNvbG9yID0gZGF0YS5jb2xvclxyXG4gICAgY29uc3QgaGlnaGxpZ2h0ID0gZGF0YS5oaWdobGlnaHRcclxuICAgIFNldFBlZEhhaXJDb2xvcihwZWRIYW5kbGUsIGNvbG9yLCBoaWdobGlnaHQpXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQZWRBcHBlYXJhbmNlKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBhd2FpdCBzZXRQZWRTa2luKGRhdGEpXHJcbiAgICBzZXRQZWRDbG90aGVzKHBlZEhhbmRsZSwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMocGVkSGFuZGxlLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MocGVkSGFuZGxlLCBkYXRhLnRhdHRvb3MpXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGRhdGEpIHtcclxuICAgIGF3YWl0IHNldFBlZFNraW4oZGF0YSlcclxuICAgIHNldFBlZENsb3RoZXMocGVkLCBkYXRhKVxyXG4gICAgc2V0UGVkSGFpckNvbG9ycyhwZWQsIGRhdGEuaGFpckNvbG9yKVxyXG4gICAgc2V0UGVkVGF0dG9vcyhwZWQsIGRhdGEudGF0dG9vcylcclxufVxyXG5cclxuZXhwb3J0cygnU2V0UGVkQ2xvdGhlcycsIHNldFBlZENsb3RoZXMpXHJcbmV4cG9ydHMoJ1NldFBlZFNraW4nLCBzZXRQZWRTa2luKVxyXG5leHBvcnRzKCdTZXRQZWRUYXR0b29zJywgc2V0UGVkVGF0dG9vcylcclxuZXhwb3J0cygnU2V0UGVkSGFpckNvbG9ycycsIHNldFBlZEhhaXJDb2xvcnMpIiwgImltcG9ydCB7IFJlY2VpdmUgfSBmcm9tICdAZXZlbnRzJztcclxuaW1wb3J0IHtcclxuXHRyZXNldFRvZ2dsZXMsXHJcblx0c2V0RHJhd2FibGUsXHJcblx0U2V0RmFjZUZlYXR1cmUsXHJcblx0c2V0SGVhZEJsZW5kLFxyXG5cdHNldEhlYWRPdmVybGF5LFxyXG5cdHNldE1vZGVsLFxyXG5cdHNldFBlZENsb3RoZXMsXHJcblx0c2V0UGVkVGF0dG9vcyxcclxuXHRzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlLFxyXG5cdHNldFByb3AsXHJcbn0gZnJvbSAnLi9hcHBlYXJhbmNlL3NldHRlcnMnO1xyXG5pbXBvcnQgeyBjbG9zZU1lbnUgfSBmcm9tICcuL21lbnUnO1xyXG5pbXBvcnQgeyBUQXBwZWFyYW5jZSwgVFRvZ2dsZURhdGEsIFRWYWx1ZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xyXG5pbXBvcnQgeyBkZWxheSwgZ2V0RnJhbWV3b3JrSUQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaywgcGVkIH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0VGF0dG9vRGF0YSB9IGZyb20gJy4vYXBwZWFyYW5jZS9nZXR0ZXJzJztcclxuaW1wb3J0IFRPR0dMRV9JTkRFWEVTIGZyb20gJ0BkYXRhL3RvZ2dsZXMnO1xyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tICdAdHlwaW5ncy9vdXRmaXRzJztcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW5jZWwsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0YXdhaXQgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKTtcclxuXHRjbG9zZU1lbnUoKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2F2ZSwgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRyZXNldFRvZ2dsZXMoYXBwZWFyYW5jZSk7XHJcblxyXG5cdGF3YWl0IGRlbGF5KDEwMCk7XHJcblxyXG5cdGNvbnN0IG5ld0FwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKHBlZCk7XHJcblx0bmV3QXBwZWFyYW5jZS50YXR0b29zID0gYXBwZWFyYW5jZS50YXR0b29zO1xyXG5cdHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUFwcGVhcmFuY2UnLCBnZXRGcmFtZXdvcmtJRCgpLCBuZXdBcHBlYXJhbmNlKTtcclxuXHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIG5ld0FwcGVhcmFuY2UudGF0dG9vcyk7XHJcblxyXG5cdGNsb3NlTWVudSgpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRNb2RlbCwgYXN5bmMgKG1vZGVsOiBzdHJpbmcsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGhhc2ggPSBHZXRIYXNoS2V5KG1vZGVsKTtcclxuXHRpZiAoIUlzTW9kZWxJbkNkaW1hZ2UoaGFzaCkgfHwgIUlzTW9kZWxWYWxpZChoYXNoKSkge1xyXG5cdFx0cmV0dXJuIGNiKDApO1xyXG5cdH1cclxuXHJcblx0YXdhaXQgc2V0TW9kZWwoaGFzaCk7XHJcblxyXG5cdGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKHBlZCk7XHJcblxyXG5cdGFwcGVhcmFuY2UudGF0dG9vcyA9IFtdO1xyXG5cclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgW10pO1xyXG5cclxuXHRjYihhcHBlYXJhbmNlKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZ2V0TW9kZWxUYXR0b29zLCBhc3luYyAoXzogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCB0YXR0b29zID0gZ2V0VGF0dG9vRGF0YSgpO1xyXG5cclxuXHRjYih0YXR0b29zKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0SGVhZFN0cnVjdHVyZSwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0U2V0RmFjZUZlYXR1cmUocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0SGVhZE92ZXJsYXksIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldEhlYWRPdmVybGF5KHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRCbGVuZCwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c2V0SGVhZEJsZW5kKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFRhdHRvb3MsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldFBlZFRhdHRvb3MocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0UHJvcCwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0bGV0IHRleHR1cmUgPSBzZXRQcm9wKHBlZCwgZGF0YSk7XHJcblx0Y2IodGV4dHVyZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldERyYXdhYmxlLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRsZXQgdGV4dHVyZSA9IHNldERyYXdhYmxlKHBlZCwgZGF0YSk7XHJcblx0Y2IodGV4dHVyZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnRvZ2dsZUl0ZW0sIGFzeW5jIChkYXRhOiBUVG9nZ2xlRGF0YSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgaXRlbSA9IFRPR0dMRV9JTkRFWEVTW2RhdGEuaXRlbV07XHJcblx0aWYgKCFpdGVtKSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRjb25zdCBjdXJyZW50ID0gZGF0YS5kYXRhO1xyXG5cdGNvbnN0IHR5cGUgPSBpdGVtLnR5cGU7XHJcblx0Y29uc3QgaW5kZXggPSBpdGVtLmluZGV4O1xyXG5cdGNvbnN0IGhvb2sgPSBpdGVtLmhvb2s7XHJcblx0Y29uc3QgaG9va0RhdGEgPSBkYXRhLmhvb2tEYXRhO1xyXG5cclxuXHRpZiAoIWN1cnJlbnQpIHJldHVybiBjYihmYWxzZSk7XHJcblxyXG5cdGlmICh0eXBlID09PSAncHJvcCcpIHtcclxuXHRcdGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpO1xyXG5cclxuXHRcdGlmIChjdXJyZW50UHJvcCA9PT0gLTEpIHtcclxuXHRcdFx0c2V0UHJvcChwZWQsIGN1cnJlbnQpO1xyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdENsZWFyUGVkUHJvcChwZWQsIGluZGV4KTtcclxuXHRcdFx0Y2IodHJ1ZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9IGVsc2UgaWYgKHR5cGUgPT09ICdkcmF3YWJsZScpIHtcclxuXHRcdGNvbnN0IGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpO1xyXG5cclxuXHRcdGlmIChjdXJyZW50LnZhbHVlID09PSBpdGVtLm9mZikge1xyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoY3VycmVudC52YWx1ZSA9PT0gY3VycmVudERyYXdhYmxlKSB7XHJcblx0XHRcdFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBpdGVtLm9mZiwgMCwgMCk7XHJcblx0XHRcdGlmIChob29rKSB7XHJcblx0XHRcdFx0Zm9yKGxldCBpPTA7IGkgPCBob29rLmRyYXdhYmxlcz8ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGNvbnN0IGhvb2tJdGVtID0gaG9vay5kcmF3YWJsZXNbaV07XHJcblx0XHRcdFx0XHRTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBob29rSXRlbS5jb21wb25lbnQsIGhvb2tJdGVtLnZhcmlhbnQsIGhvb2tJdGVtLnRleHR1cmUsIDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRjYih0cnVlKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0c2V0RHJhd2FibGUocGVkLCBjdXJyZW50KTtcclxuXHRcdFx0Zm9yKGxldCBpPTA7IGkgPCBob29rRGF0YT8ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRzZXREcmF3YWJsZShwZWQsIGhvb2tEYXRhW2ldKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuKTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zYXZlT3V0Zml0LCBhc3luYyAoZGF0YTogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZU91dGZpdCcsIGZyYW1ld29ya2RJZCwgZGF0YSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZGVsZXRlT3V0Zml0LCBhc3luYyAoe2lkfSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmRlbGV0ZU91dGZpdCcsIGZyYW1ld29ya2RJZCwgaWQpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnJlbmFtZU91dGZpdCwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlbmFtZU91dGZpdCcsIGZyYW1ld29ya2RJZCwgZGF0YSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUudXNlT3V0Zml0LCBhc3luYyAob3V0Zml0OiBPdXRmaXQsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldFBlZENsb3RoZXMocGVkLCBvdXRmaXQpO1xyXG5cdGNiKDEpO1xyXG59KTsiLCAiaW1wb3J0IHsgZ2V0RnJhbWV3b3JrSUQsIHJlcXVlc3RMb2NhbGUsIHNlbmROVUlFdmVudCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrLCB1cGRhdGVQZWQsIGRlbGF5LCBwZWQsIGdldFBsYXllckRhdGEgfSBmcm9tIFwiQHV0aWxzXCJcclxuaW1wb3J0IHsgc3RhcnRDYW1lcmEsIHN0b3BDYW1lcmEgfSBmcm9tIFwiLi9jYW1lcmFcIlxyXG5pbXBvcnQgdHlwZSB7IFRBcHBlYXJhbmNlWm9uZSwgVE1lbnVUeXBlcyB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IHsgT3V0Zml0IH0gZnJvbSBcIkB0eXBpbmdzL291dGZpdHNcIlxyXG5pbXBvcnQgeyBTZW5kIH0gZnJvbSBcIkBldmVudHNcIlxyXG5pbXBvcnQgeyBnZXRBcHBlYXJhbmNlLCBnZXRUYXR0b29EYXRhIH0gZnJvbSBcIi4vYXBwZWFyYW5jZS9nZXR0ZXJzXCJcclxuaW1wb3J0IFwiLi9oYW5kbGVyc1wiXHJcblxyXG5jb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxubGV0IGFybW91ciA9IDBcclxubGV0IG9wZW4gPSBmYWxzZVxyXG5cclxubGV0IHJlc29sdmVQcm9taXNlID0gbnVsbDtcclxubGV0IHByb21pc2UgPSBudWxsO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5NZW51KHpvbmU6IFRBcHBlYXJhbmNlWm9uZSwgY3JlYXRpb246IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgaWYgKHpvbmUgPT09IG51bGwgfHwgb3Blbikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwZWRIYW5kbGUgPSBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBjb25maWdNZW51cyA9IGNvbmZpZy5tZW51cygpXHJcblxyXG4gICAgY29uc3QgdHlwZSA9IHpvbmUudHlwZVxyXG5cclxuICAgIGNvbnN0IG1lbnUgPSBjb25maWdNZW51c1t0eXBlXVxyXG4gICAgaWYgKCFtZW51KSByZXR1cm5cclxuXHJcbiAgICB1cGRhdGVQZWQocGVkSGFuZGxlKVxyXG4gICAgc3RhcnRDYW1lcmEoKVxyXG5cclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKClcclxuICAgIGNvbnN0IHRhYnMgPSBtZW51LnRhYnNcclxuICAgIGxldCBhbGxvd0V4aXQgPSBtZW51LmFsbG93RXhpdFxyXG5cclxuICAgIGFybW91ciA9IEdldFBlZEFybW91cihwZWRIYW5kbGUpXHJcblxyXG4gICAgbGV0IG91dGZpdHMgPSBbXVxyXG5cclxuICAgIGNvbnN0IGhhc091dGZpdFRhYiA9IHRhYnMuaW5jbHVkZXMoJ291dGZpdHMnKVxyXG4gICAgaWYgKGhhc091dGZpdFRhYikgb3V0Zml0cyA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxPdXRmaXRbXT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldE91dGZpdHMnLCBmcmFtZXdvcmtkSWQpIGFzIE91dGZpdFtdXHJcblxyXG4gICAgbGV0IG1vZGVscyA9IFtdXHJcblxyXG4gICAgY29uc3QgaGFzSGVyaXRhZ2VUYWIgPSB0YWJzLmluY2x1ZGVzKCdoZXJpdGFnZScpXHJcbiAgICBpZiAoaGFzSGVyaXRhZ2VUYWIpIHtcclxuICAgICAgICBtb2RlbHMgPSBjb25maWcubW9kZWxzKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBoYXNUYXR0b29UYWIgPSB0YWJzLmluY2x1ZGVzKCd0YXR0b29zJylcclxuICAgIGxldCB0YXR0b29zXHJcbiAgICBpZiAoaGFzVGF0dG9vVGFiKSB7XHJcbiAgICAgICAgdGF0dG9vcyA9IGdldFRhdHRvb0RhdGEoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJsYWNrbGlzdCA9IGdldEJsYWNrbGlzdCh6b25lKVxyXG5cclxuICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKHBlZEhhbmRsZSlcclxuXHJcbiAgICBpZiAoY3JlYXRpb24pIHtcclxuICAgICAgICBlbWl0TmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzZXRyb3V0aW5nYnVja2V0JylcclxuICAgICAgICBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XHJcbiAgICAgICAgICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC5kYXRhLCB7XHJcbiAgICAgICAgdGFicyxcclxuICAgICAgICBhcHBlYXJhbmNlLFxyXG4gICAgICAgIGJsYWNrbGlzdCxcclxuICAgICAgICB0YXR0b29zLFxyXG4gICAgICAgIG91dGZpdHMsXHJcbiAgICAgICAgbW9kZWxzLFxyXG4gICAgICAgIGFsbG93RXhpdCxcclxuICAgICAgICBsb2NhbGU6IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpXHJcbiAgICB9KVxyXG4gICAgU2V0TnVpRm9jdXModHJ1ZSwgdHJ1ZSlcclxuICAgIHNlbmROVUlFdmVudChTZW5kLnZpc2libGUsIHRydWUpXHJcbiAgICBvcGVuID0gdHJ1ZVxyXG5cclxuICAgIGlmIChwcm9taXNlKSB7XHJcbiAgICAgICAgYXdhaXQgcHJvbWlzZVxyXG4gICAgICAgIGVtaXROZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlc2V0cm91dGluZ2J1Y2tldCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb21pc2UgPSBudWxsO1xyXG4gICAgcmVzb2x2ZVByb21pc2UgPSBudWxsO1xyXG4gICAgcmV0dXJuIHRydWVcclxufVxyXG5cclxuZXhwb3J0cygnb3Blbk1lbnUnLCBvcGVuTWVudSlcclxuXHJcbmZ1bmN0aW9uIGdldEJsYWNrbGlzdCh6b25lOiBUQXBwZWFyYW5jZVpvbmUpIHtcclxuICAgIGlmICghem9uZSkgcmV0dXJuIHt9XHJcblxyXG4gICAgY29uc3Qge2dyb3VwVHlwZXMsIGJhc2V9ID0gY29uZmlnLmJsYWNrbGlzdCgpXHJcblxyXG4gICAgaWYgKCFncm91cFR5cGVzKSByZXR1cm4ge31cclxuICAgIGlmICghYmFzZSkgcmV0dXJuIHt9XHJcblxyXG4gICAgbGV0IGJsYWNrbGlzdCA9IHsuLi5iYXNlfVxyXG5cclxuICAgIGNvbnN0IHBsYXllckRhdGEgPSBnZXRQbGF5ZXJEYXRhKClcclxuXHJcblxyXG4gICAgZm9yIChjb25zdCB0eXBlIGluIGdyb3VwVHlwZXMpIHtcclxuICAgICAgICBjb25zdCBncm91cHMgPSBncm91cFR5cGVzW3R5cGVdXHJcbiAgICAgICAgZm9yIChjb25zdCBncm91cCBpbiBncm91cHMpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBza2lwOiBib29sZWFuID0gZmFsc2VcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09ICdqb2JzJyAmJiB6b25lLmpvYnMpIHtcclxuICAgICAgICAgICAgICAgIHNraXAgPSB6b25lLmpvYnMuaW5jbHVkZXMocGxheWVyRGF0YS5qb2IubmFtZSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ2dhbmdzJyAmJiB6b25lLmdhbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBza2lwID0gem9uZS5nYW5ncy5pbmNsdWRlcyhwbGF5ZXJEYXRhLmdhbmcubmFtZSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgKHR5cGUgPT0gJ2dyb3VwcycgJiYgem9uZS5ncm91cHMpIHtcclxuICAgICAgICAgICAgLy8gICAgIHNraXAgPSAhem9uZS5ncm91cHMuaW5jbHVkZXMocGxheWVyRGF0YS5ncm91cC5uYW1lKVxyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNraXApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGdyb3VwQmxhY2tsaXN0ID0gZ3JvdXBzW2dyb3VwXVxyXG4gICAgICAgICAgICAgICAgYmxhY2tsaXN0ID0gT2JqZWN0LmFzc2lnbih7fSwgYmxhY2tsaXN0LCBncm91cEJsYWNrbGlzdCwge1xyXG4gICAgICAgICAgICAgICAgICBkcmF3YWJsZXM6IE9iamVjdC5hc3NpZ24oe30sIGJsYWNrbGlzdC5kcmF3YWJsZXMsIGdyb3VwQmxhY2tsaXN0LmRyYXdhYmxlcylcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGJsYWNrbGlzdFxyXG5cclxuICAgIC8vIHJldHVybiBibGFja2xpc3RcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlTWVudSgpIHtcclxuICAgIFNldFBlZEFybW91cihwZWQsIGFybW91cilcclxuXHJcbiAgICBzdG9wQ2FtZXJhKClcclxuICAgIFNldE51aUZvY3VzKGZhbHNlLCBmYWxzZSlcclxuICAgIHNlbmROVUlFdmVudChTZW5kLnZpc2libGUsIGZhbHNlKVxyXG5cclxuICAgIGlmIChyZXNvbHZlUHJvbWlzZSkge1xyXG4gICAgICAgIHJlc29sdmVQcm9taXNlKCk7XHJcbiAgICB9XHJcbiAgICBvcGVuID0gZmFsc2VcclxufSIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSwgVEFwcGVhcmFuY2Vab25lLCBUTWVudVR5cGVzIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgeyBvcGVuTWVudSB9IGZyb20gXCIuL21lbnVcIlxyXG5pbXBvcnQgeyBzZXRQZWRBcHBlYXJhbmNlLCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlIH0gZnJvbSBcIi4vYXBwZWFyYW5jZS9zZXR0ZXJzXCJcclxuaW1wb3J0IHsgdHJpZ2dlclNlcnZlckNhbGxiYWNrLCBnZXRGcmFtZXdvcmtJRCwgRGVsYXksIGJsX2JyaWRnZSB9IGZyb20gXCJAdXRpbHNcIlxyXG5cclxuUmVnaXN0ZXJDb21tYW5kKCdvcGVuTWVudScsIGFzeW5jICgpID0+IHtcclxuICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24oKVxyXG59LCBmYWxzZSlcclxuXHJcbmV4cG9ydHMoJ1NldFBlZEFwcGVhcmFuY2UnLCBhc3luYyAocGVkOiBudW1iZXIsIGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlKSA9PiB7XHJcbiAgICBhd2FpdCBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcclxufSlcclxuXHJcbmV4cG9ydHMoJ1NldFBsYXllclBlZEFwcGVhcmFuY2UnLCBhc3luYyAoZnJhbWV3b3JrSUQpID0+IHtcclxuICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcbn0pXHJcblxyXG5leHBvcnRzKCdHZXRQbGF5ZXJQZWRBcHBlYXJhbmNlJywgYXN5bmMgKGZyYW1ld29ya0lEKSA9PiB7XHJcbiAgICByZXR1cm4gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG59KVxyXG5cclxuZXhwb3J0cygnSW5pdGlhbENyZWF0aW9uJywgYXN5bmMgKGNiPzogRnVuY3Rpb24pID0+IHtcclxuICAgIGF3YWl0IG9wZW5NZW51KHsgdHlwZTogXCJhcHBlYXJhbmNlXCIsIGNvb3JkczogWzAsIDAsIDAsIDBdIH0sIHRydWUpXHJcbiAgICBpZiAoY2IpIGNiKClcclxufSlcclxuXHJcbm9uKCdibF9zcHJpdGVzOmNsaWVudDp1c2Vab25lJywgKHpvbmU6IFRBcHBlYXJhbmNlWm9uZSkgPT4ge1xyXG4gICAgb3Blbk1lbnUoem9uZSlcclxufSlcclxuXHJcbm9uTmV0KCdibF9icmlkZ2U6Y2xpZW50OnBsYXllckxvYWRlZCcsIGFzeW5jICgpID0+IHtcclxuICAgIHdoaWxlICghYmxfYnJpZGdlLmNvcmUoKS5wbGF5ZXJMb2FkZWQoKSkge1xyXG4gICAgICAgIGF3YWl0IERlbGF5KDEwMCk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBmcmFtZXdvcmtJRCA9IGF3YWl0IGdldEZyYW1ld29ya0lEKClcclxuICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcbn0pXHJcblxyXG5vbk5ldCgnb25SZXNvdXJjZVN0YXJ0JywgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcpID0+IHtcclxuICAgIGlmIChyZXNvdXJjZSA9PT0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpICYmIGJsX2JyaWRnZS5jb3JlKCkucGxheWVyTG9hZGVkKCkpIHtcclxuICAgICAgICBjb25zdCBmcmFtZXdvcmtJRCA9IGF3YWl0IGdldEZyYW1ld29ya0lEKClcclxuICAgICAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSlcclxuICAgIH1cclxufSkiXSwKICAibWFwcGluZ3MiOiAiOzs7O0FBQU8sSUFBSSxNQUFNO0FBRVYsSUFBTSxZQUFZLHdCQUFDLGNBQXNCO0FBQzVDLFFBQU07QUFDVixHQUZ5QjtBQWFsQixJQUFNLGVBQWUsd0JBQUMsUUFBZ0IsU0FBYztBQUN2RCxpQkFBZTtBQUFBLElBQ1g7QUFBQSxJQUNBO0FBQUEsRUFDSixDQUFDO0FBQ0wsR0FMNEI7QUFPckIsSUFBTSxRQUFRLHdCQUFDLE9BQWUsSUFBSSxRQUFRLFNBQU8sV0FBVyxLQUFLLEVBQUUsQ0FBQyxHQUF0RDtBQUVkLElBQU0sZUFBZSw4QkFBTyxVQUE0QztBQUMzRSxNQUFJLFlBQW9CLE9BQU8sVUFBVSxXQUFXLFFBQVEsV0FBVyxLQUFLO0FBRTVFLE1BQUksQ0FBQyxhQUFhLFNBQVMsR0FBRztBQUMxQixZQUFRLFVBQVUsT0FBTyxFQUFFO0FBQUEsTUFDdkIsT0FBTztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLElBQ2QsQ0FBQztBQUVELFVBQU0sSUFBSSxNQUFNLG9DQUFvQyxLQUFLLEdBQUc7QUFBQSxFQUNoRTtBQUVBLE1BQUksZUFBZSxTQUFTO0FBQUcsV0FBTztBQUV0QyxlQUFhLFNBQVM7QUFFdEIsUUFBTSxxQkFBcUIsNkJBQXFCO0FBQzVDLFdBQU8sSUFBSSxRQUFRLGFBQVc7QUFDMUIsWUFBTSxXQUFXLFlBQVksTUFBTTtBQUMvQixZQUFJLGVBQWUsU0FBUyxHQUFHO0FBQzNCLHdCQUFjLFFBQVE7QUFDdEIsa0JBQVE7QUFBQSxRQUNaO0FBQUEsTUFDSixHQUFHLEdBQUc7QUFBQSxJQUNWLENBQUM7QUFBQSxFQUNMLEdBVDJCO0FBVzNCLFFBQU0sbUJBQW1CO0FBRXpCLFNBQU87QUFDWCxHQS9CNEI7QUFxQzVCLElBQU0sZUFBZSx1QkFBdUI7QUFDNUMsSUFBTSxjQUFzQyxDQUFDO0FBQzdDLElBQU0sZUFBeUQsQ0FBQztBQUVoRSxTQUFTLFdBQVcsV0FBbUJBLFFBQXNCO0FBQ3pELE1BQUlBLFVBQVNBLFNBQVEsR0FBRztBQUNwQixVQUFNLGNBQWMsYUFBYTtBQUVqQyxTQUFLLFlBQVksU0FBUyxLQUFLLEtBQUs7QUFBYSxhQUFPO0FBRXhELGdCQUFZLFNBQVMsSUFBSSxjQUFjQTtBQUFBLEVBQzNDO0FBRUEsU0FBTztBQUNYO0FBVlM7QUFZVCxNQUFNLFdBQVcsWUFBWSxJQUFJLENBQUMsUUFBZ0IsU0FBYztBQUM1RCxRQUFNLFVBQVUsYUFBYSxHQUFHO0FBQ2hDLFNBQU8sV0FBVyxRQUFRLEdBQUcsSUFBSTtBQUNyQyxDQUFDO0FBRU0sU0FBUyxzQkFDWixjQUFzQixNQUNMO0FBQ2pCLE1BQUksQ0FBQyxXQUFXLFdBQVcsQ0FBQyxHQUFHO0FBQzNCO0FBQUEsRUFDSjtBQUVBLE1BQUk7QUFFSixLQUFHO0FBQ0MsVUFBTSxHQUFHLFNBQVMsSUFBSSxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssTUFBUyxFQUFFLENBQUM7QUFBQSxFQUNsRSxTQUFTLGFBQWEsR0FBRztBQUV6QixVQUFRLFdBQVcsU0FBUyxJQUFJLGNBQWMsS0FBSyxHQUFHLElBQUk7QUFFMUQsU0FBTyxJQUFJLFFBQVcsQ0FBQyxZQUFZO0FBQy9CLGlCQUFhLEdBQUcsSUFBSTtBQUFBLEVBQ3hCLENBQUM7QUFDTDtBQWxCZ0I7QUFvQlQsU0FBUyxpQkFBaUIsV0FBVyxJQUFJO0FBQzVDLFFBQU0sV0FBVyxTQUFTLElBQUksT0FBTyxVQUFVLFFBQVEsU0FBUztBQUM1RCxRQUFJO0FBQ0osUUFBSTtBQUNBLGlCQUFXLE1BQU0sR0FBRyxHQUFHLElBQUk7QUFBQSxJQUMvQixTQUNPLEdBQUc7QUFDTixjQUFRLE1BQU0sbURBQW1ELFNBQVMsRUFBRTtBQUM1RSxjQUFRLElBQUksS0FBSyxFQUFFLEtBQUssSUFBSTtBQUFBLElBQ2hDO0FBQ0EsWUFBUSxXQUFXLFFBQVEsSUFBSSxLQUFLLFFBQVE7QUFBQSxFQUNoRCxDQUFDO0FBQ0w7QUFaZ0I7QUFnQlQsSUFBTSxnQkFBZ0Isd0JBQUMsb0JBQTRCO0FBQ3RELFNBQU8sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM1QixVQUFNLG9CQUFvQiw2QkFBTTtBQUM1QixVQUFJLHVCQUF1QixlQUFlLEdBQUc7QUFDekMsY0FBTSxhQUFhLFFBQVEsY0FBYyxPQUFPLEVBQUU7QUFDbEQsWUFBSSxvQkFBb0IsaUJBQWlCLGNBQWMsVUFBVSxVQUFVLE9BQU87QUFDbEYsWUFBSSxDQUFDLG1CQUFtQjtBQUNwQixrQkFBUSxNQUFNLEdBQUcsVUFBVSxxRUFBcUU7QUFDaEcsOEJBQW9CLGlCQUFpQixjQUFjLGdCQUFnQjtBQUFBLFFBQ3ZFO0FBQ0EsZ0JBQVEsaUJBQWlCO0FBQUEsTUFDN0IsT0FBTztBQUNILG1CQUFXLG1CQUFtQixHQUFHO0FBQUEsTUFDckM7QUFBQSxJQUNKLEdBWjBCO0FBYTFCLHNCQUFrQjtBQUFBLEVBQ3RCLENBQUM7QUFDTCxHQWpCNkI7QUEyQnRCLElBQU0sWUFBWSxRQUFRO0FBRTFCLElBQU0sZ0JBQWdCLDZCQUFNO0FBQy9CLFNBQU8sVUFBVSxLQUFLLEVBQUUsY0FBYztBQUMxQyxHQUY2QjtBQUl0QixJQUFNLGlCQUFpQiw2QkFBTTtBQUNoQyxRQUFNLEtBQUssY0FBYyxFQUFFO0FBQzNCLFNBQU87QUFDWCxHQUg4QjtBQUt2QixTQUFTLE1BQU0sSUFBMkI7QUFDN0MsU0FBTyxJQUFJLFFBQVEsYUFBVyxXQUFXLFNBQVMsRUFBRSxDQUFDO0FBQ3pEO0FBRmdCOzs7QUN4SmhCLElBQU0sMEJBQTBCO0FBQ2hDLElBQU0sdUJBQXVCO0FBRTdCLElBQUksVUFBbUI7QUFDdkIsSUFBSSxjQUFzQjtBQUMxQixJQUFJLE1BQXFCO0FBQ3pCLElBQUksU0FBaUI7QUFDckIsSUFBSSxTQUFpQjtBQUNyQixJQUFJLGVBQStCO0FBQ25DLElBQUksU0FBd0I7QUFDNUIsSUFBSSxjQUF1QjtBQUUzQixJQUFJLGNBQWtDO0FBRXRDLElBQU0sY0FBNEI7QUFBQSxFQUM5QixPQUFPO0FBQUEsRUFDVixNQUFNO0FBQUEsRUFDTixPQUFPO0FBQUEsRUFDUCxNQUFNLENBQUMsT0FBTyxLQUFLO0FBQUEsRUFDaEIsT0FBTyxDQUFDLE9BQU8sS0FBSztBQUN4QjtBQUVBLElBQU0sTUFBTSx3QkFBQyxZQUE0QjtBQUN4QyxTQUFPLEtBQUssSUFBSyxVQUFVLEtBQUssS0FBTSxHQUFHO0FBQzFDLEdBRlk7QUFJWixJQUFNLE1BQU0sd0JBQUMsWUFBNEI7QUFDeEMsU0FBTyxLQUFLLElBQUssVUFBVSxLQUFLLEtBQU0sR0FBRztBQUMxQyxHQUZZO0FBSVosSUFBTSxZQUFZLDZCQUFnQjtBQUNqQyxRQUFNLEtBQ0gsSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLEtBQUssSUFDM0Q7QUFDRCxRQUFNLEtBQ0gsSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLEtBQUssSUFDM0Q7QUFDRCxRQUFNLElBQUksSUFBSSxNQUFNLElBQUk7QUFFeEIsU0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLEdBVmtCO0FBWWxCLElBQU0saUJBQWlCLHdCQUFDLFFBQWlCLFdBQTBCO0FBQ2xFLE1BQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCO0FBQWE7QUFFOUMsV0FBUyxVQUFVO0FBQ25CLFdBQVMsVUFBVTtBQUVuQixZQUFVO0FBQ1YsWUFBVTtBQUVQLFFBQU0sZ0JBQWdCLGdCQUFnQixXQUFXLGdCQUFnQjtBQUNqRSxRQUFNLFdBQVcsZ0JBQWdCLEtBQU87QUFFeEMsUUFBTSxVQUFVLGdCQUFnQjtBQUNoQyxRQUFNLFdBQVcsVUFBVSxJQUFNO0FBRXBDLFdBQVMsS0FBSyxJQUFJLEtBQUssSUFBSSxRQUFRLFFBQVEsR0FBRyxRQUFRO0FBRXRELFFBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLFVBQVU7QUFFNUI7QUFBQSxJQUNDO0FBQUEsSUFDQSxhQUFhLElBQUk7QUFBQSxJQUNqQixhQUFhLElBQUk7QUFBQSxJQUNqQixhQUFhLElBQUk7QUFBQSxFQUNsQjtBQUNBLGtCQUFnQixLQUFLLGFBQWEsR0FBRyxhQUFhLEdBQUcsYUFBYSxDQUFDO0FBQ3BFLEdBMUJ1QjtBQTRCdkIsSUFBTSxhQUFhLDhCQUFPLFFBQWlCLGFBQXNCO0FBQ2hFLFFBQU0sVUFBa0IsaUJBQWlCLEdBQUcsSUFBSTtBQUNoRCxhQUFXLFlBQVk7QUFFdkIsZ0JBQWM7QUFDZCxnQkFBYztBQUNkLFdBQVM7QUFFVCxRQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxVQUFVO0FBRTVCLFFBQU0sU0FBaUI7QUFBQSxJQUN0QjtBQUFBLElBQ0EsT0FBTyxJQUFJO0FBQUEsSUFDWCxPQUFPLElBQUk7QUFBQSxJQUNYLE9BQU8sSUFBSTtBQUFBLElBQ1g7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Q7QUFFQSxpQkFBZTtBQUNmLGdCQUFjO0FBQ2QsV0FBUztBQUNULFFBQU07QUFFTixrQkFBZ0IsUUFBUSxPQUFPLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUNwRCx5QkFBdUIsUUFBUSxRQUFRLEtBQUssR0FBRyxDQUFDO0FBRWhELFFBQU0sTUFBTSxHQUFHO0FBRWYsMEJBQXdCLFFBQVEsSUFBSTtBQUNwQyxnQkFBYyxRQUFRLEdBQUc7QUFDekIsZUFBYSxRQUFRLEdBQUc7QUFDeEIsb0JBQWtCLFFBQVEsR0FBRztBQUM3QixXQUFTLE1BQU07QUFFZixhQUFXLFFBQVEsSUFBSTtBQUN4QixHQXhDbUI7QUEwQ25CLElBQU0sV0FBVyx3QkFBQyxlQUF1QjtBQUN4QyxNQUFJLEVBQUUsYUFBYSxHQUFHLEtBQUssY0FBYztBQUFNO0FBQy9DLGNBQVk7QUFDWixhQUFXLFVBQVUsQ0FBQztBQUN2QixHQUppQjtBQU1WLElBQU0sY0FBYyw2QkFBTTtBQUNoQyxNQUFJO0FBQVM7QUFDYixZQUFVO0FBQ1YsZ0JBQWM7QUFDZCxRQUFNLFVBQVUsMkJBQTJCLElBQUk7QUFDL0MsUUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQWMsaUJBQWlCLEtBQUssT0FBTyxHQUFLLEdBQUssQ0FBRztBQUN0RSxjQUFZLEtBQUssR0FBRyxHQUFHLENBQUM7QUFDeEIsbUJBQWlCLE1BQU0sTUFBTSxLQUFNLE1BQU0sSUFBSTtBQUUxQyxZQUFVLFNBQVMsV0FBVztBQUNsQyxHQVYyQjtBQVlwQixJQUFNLGFBQWEsNkJBQVk7QUFDckMsTUFBSSxDQUFDO0FBQVM7QUFDZCxZQUFVO0FBRVYsbUJBQWlCLE9BQU8sTUFBTSxLQUFLLE1BQU0sS0FBSztBQUM5QyxhQUFXLEtBQUssSUFBSTtBQUNwQixRQUFNO0FBQ04saUJBQWU7QUFDaEIsR0FSMEI7QUFVMUIsSUFBTSxZQUFZLHdCQUFDLE1BQTJCLFdBQVcsZ0JBQXNCO0FBRTlFLFFBQU0sT0FBc0MsWUFBWSxJQUFJO0FBRXpELFFBQU0sY0FBYyxNQUFNLFFBQVEsSUFBSTtBQUV0QyxnQkFBYztBQUVkLE1BQUksQ0FBQyxlQUFlLFNBQVMsR0FBRztBQUM1QixVQUFNLENBQUNDLElBQUdDLElBQUdDLEVBQUMsSUFBYyxnQkFBZ0IsS0FBSyxLQUFLO0FBQ3REO0FBQUEsTUFDSTtBQUFBLFFBQ0ksR0FBR0Y7QUFBQSxRQUNILEdBQUdDO0FBQUEsUUFDSCxHQUFHQyxLQUFJO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQ0E7QUFBQSxFQUNKO0FBR0EsTUFBSSxXQUFXO0FBQXNCLGVBQVc7QUFFaEQsTUFBSSxhQUFhO0FBQ2IsVUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLElBQWMsaUJBQWlCLEtBQUssS0FBSyxDQUFDLEdBQUcsR0FBSyxHQUFLLENBQUc7QUFFM0UsVUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLElBQWMsaUJBQWlCLEtBQUssS0FBSyxDQUFDLEdBQUcsR0FBSyxHQUFLLENBQUc7QUFHM0UsUUFBSSxLQUFLLEtBQUssTUFBTTtBQUNwQixRQUFJLEtBQUssS0FBSyxNQUFNO0FBQ3BCLFFBQUksS0FBSyxLQUFLLE1BQU07QUFBQSxFQUN4QixPQUFPO0FBQ0gsUUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQWMsaUJBQWlCLEtBQUssTUFBTSxHQUFLLEdBQUssQ0FBRztBQUFBLEVBQ3ZFO0FBRUg7QUFBQSxJQUNDO0FBQUEsTUFDQztBQUFBLE1BQ0E7QUFBQSxNQUNBLEdBQUcsSUFBSTtBQUFBLElBQ1I7QUFBQSxJQUNBO0FBQUEsRUFDRDtBQUVELEdBOUNrQjtBQWdEbEIsd0RBQXFDLENBQUMsTUFBTSxPQUFPO0FBTy9DLGlCQUFlLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDN0IsS0FBRyxDQUFDO0FBQ1IsQ0FBQztBQUlELDhEQUF3QyxDQUFDLE1BQWdCLE9BQWlCO0FBQ3RFLFVBQVEsSUFBSSxJQUFJO0FBQ25CLFVBQVEsTUFBTTtBQUFBLElBQ1AsS0FBSztBQUNELGdCQUFVLFNBQVMsdUJBQXVCO0FBQzFDO0FBQUEsSUFDSixLQUFLO0FBQ0QsZ0JBQVUsTUFBTTtBQUNoQjtBQUFBLElBQ0osS0FBSztBQUNELGdCQUFVLE9BQU87QUFDakI7QUFBQSxJQUNKLEtBQUs7QUFDRCxnQkFBVSxNQUFNO0FBQ2hCO0FBQUEsSUFDSixLQUFLO0FBQ0QsZ0JBQVUsT0FBTztBQUNqQjtBQUFBLEVBQ1g7QUFDQSxLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsd0RBQXFDLENBQUMsTUFBTSxPQUFPO0FBQ2xELE1BQUksU0FBUyxRQUFRO0FBRWQsVUFBTSxVQUFVLGdCQUFnQixVQUFVLDBCQUEwQjtBQUVwRSxZQUFRLElBQUksT0FBTztBQUV6QixVQUFNLGNBQXNCLGNBQWM7QUFDMUMsa0JBQWMsZUFBZSxVQUFVLFVBQVU7QUFBQSxFQUNsRCxXQUFXLFNBQVMsTUFBTTtBQUN6QixVQUFNLGNBQXNCLGNBQWM7QUFDMUMsa0JBQWMsZUFBZSxNQUFNLE1BQU07QUFBQSxFQUMxQztBQUVBLGdCQUFjO0FBQ2QsaUJBQWU7QUFDZixLQUFHLENBQUM7QUFDTCxDQUFDOzs7QUNwUEQsSUFBTyxlQUFRO0FBQUEsRUFDWDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDSjs7O0FDZkEsSUFBTyxlQUFRO0FBQUEsRUFDWDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDSjs7O0FDckJBLElBQU8sb0JBQVE7QUFBQSxFQUNYO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDSjs7O0FDYkEsSUFBTyxnQkFBUTtBQUFBLEVBQ1g7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0o7OztBQ0ZPLFNBQVMsZUFBZSxRQUFnQjtBQUMzQyxRQUFNQyxVQUFTLFFBQVE7QUFDdkIsUUFBTSxTQUFTQSxRQUFPLE9BQU87QUFFN0IsU0FBTyxPQUFPLFVBQVUsQ0FBQyxVQUFrQixXQUFXLEtBQUssTUFBTSxNQUFNO0FBQzNFO0FBTGdCO0FBT1QsU0FBUyxRQUFRLFdBQThCO0FBQ2xELFNBQU87QUFBQSxJQUNILE9BQU8sZ0JBQWdCLFNBQVM7QUFBQSxJQUNoQyxXQUFXLHlCQUF5QixTQUFTO0FBQUEsRUFDakQ7QUFDSjtBQUxnQjtBQU9ULFNBQVMsaUJBQWlCLFdBQW1CO0FBRWhELFFBQU0sU0FBUyxJQUFJLFlBQVksRUFBRTtBQUNqQyxTQUFPLFFBQVEsYUFBYSxzQkFBc0IsV0FBVyxJQUFJLFlBQVksTUFBTSxDQUFDO0FBRXBGLFFBQU0sRUFBRSxHQUFHLFlBQVksR0FBRyxhQUFhLEdBQUcsWUFBWSxHQUFHLFdBQVcsR0FBRyxZQUFZLElBQUksV0FBVyxJQUFJLFVBQVUsSUFBSSxJQUFJLFlBQVksTUFBTTtBQUMxSSxRQUFNLEVBQUUsR0FBRyxVQUFVLEdBQUcsU0FBUyxHQUFHLFNBQVMsSUFBSSxJQUFJLGFBQWEsUUFBUSxFQUFFO0FBVzVFLFNBQU87QUFBQSxJQUNIO0FBQUE7QUFBQSxJQUNBO0FBQUE7QUFBQSxJQUNBO0FBQUEsSUFFQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFFQTtBQUFBO0FBQUEsSUFFQTtBQUFBLElBQ0E7QUFBQTtBQUFBLElBRUEsV0FBVyxRQUFRLFNBQVM7QUFBQSxFQUNoQztBQUNKO0FBakNnQjtBQW1DVCxTQUFTLGVBQWUsV0FBbUI7QUFDOUMsTUFBSSxTQUE0QixDQUFDO0FBQ2pDLE1BQUksV0FBeUIsQ0FBQztBQUU5QixXQUFTLElBQUksR0FBRyxJQUFJLGFBQWMsUUFBUSxLQUFLO0FBQzNDLFVBQU0sVUFBVSxhQUFjLENBQUM7QUFDL0IsV0FBTyxPQUFPLElBQUksd0JBQXdCLENBQUM7QUFFM0MsUUFBSSxZQUFZLFlBQVk7QUFDeEIsZUFBUyxPQUFPLElBQUk7QUFBQSxRQUNoQixJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxjQUFjLGVBQWUsU0FBUztBQUFBLE1BQzFDO0FBQUEsSUFDSixPQUFPO0FBQ0gsWUFBTSxDQUFDLEdBQUcsY0FBYyxZQUFZLFlBQVksYUFBYSxjQUFjLElBQUksc0JBQXNCLFdBQVcsSUFBSSxDQUFDO0FBQ3JILGVBQVMsT0FBTyxJQUFJO0FBQUEsUUFDaEIsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsY0FBYyxpQkFBaUIsTUFBTSxLQUFLO0FBQUEsUUFDMUM7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxTQUFPLENBQUMsVUFBVSxNQUFNO0FBQzVCO0FBN0JnQjtBQStCVCxTQUFTLGlCQUFpQixXQUFtQjtBQUNoRCxRQUFNLFdBQVcsZUFBZSxTQUFTO0FBRXpDLE1BQUksYUFBYSxXQUFXLGtCQUFrQixLQUFLLGFBQWEsV0FBVyxrQkFBa0I7QUFBRztBQUVoRyxNQUFJLGFBQWEsQ0FBQztBQUNsQixXQUFTLElBQUksR0FBRyxJQUFJLGFBQWMsUUFBUSxLQUFLO0FBQzNDLFVBQU0sVUFBVSxhQUFjLENBQUM7QUFDL0IsZUFBVyxPQUFPLElBQUk7QUFBQSxNQUNsQixJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxPQUFPLGtCQUFrQixXQUFXLENBQUM7QUFBQSxJQUN6QztBQUFBLEVBQ0o7QUFFQSxTQUFPO0FBQ1g7QUFoQmdCO0FBa0JULFNBQVMsYUFBYSxXQUFtQjtBQUM1QyxNQUFJLFlBQVksQ0FBQztBQUNqQixNQUFJLGlCQUFpQixDQUFDO0FBRXRCLFdBQVMsSUFBSSxHQUFHLElBQUksa0JBQWUsUUFBUSxLQUFLO0FBQzVDLFVBQU0sT0FBTyxrQkFBZSxDQUFDO0FBQzdCLFVBQU0sVUFBVSx3QkFBd0IsV0FBVyxDQUFDO0FBRXBELG1CQUFlLElBQUksSUFBSTtBQUFBLE1BQ25CLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8saUNBQWlDLFdBQVcsQ0FBQztBQUFBLE1BQ3BELFVBQVUsZ0NBQWdDLFdBQVcsR0FBRyxPQUFPO0FBQUEsSUFDbkU7QUFDQSxjQUFVLElBQUksSUFBSTtBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osT0FBTztBQUFBLE1BQ1AsT0FBTyx3QkFBd0IsV0FBVyxDQUFDO0FBQUEsTUFDM0MsU0FBUyx1QkFBdUIsV0FBVyxDQUFDO0FBQUEsSUFDaEQ7QUFBQSxFQUNKO0FBRUEsU0FBTyxDQUFDLFdBQVcsY0FBYztBQUNyQztBQXZCZ0I7QUF5QlQsU0FBUyxTQUFTLFdBQW1CO0FBQ3hDLE1BQUksUUFBUSxDQUFDO0FBQ2IsTUFBSSxhQUFhLENBQUM7QUFFbEIsV0FBUyxJQUFJLEdBQUcsSUFBSSxjQUFXLFFBQVEsS0FBSztBQUN4QyxVQUFNLE9BQU8sY0FBVyxDQUFDO0FBQ3pCLFVBQU0sVUFBVSxnQkFBZ0IsV0FBVyxDQUFDO0FBRTVDLGVBQVcsSUFBSSxJQUFJO0FBQUEsTUFDZixJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxPQUFPLHFDQUFxQyxXQUFXLENBQUM7QUFBQSxNQUN4RCxVQUFVLG9DQUFvQyxXQUFXLEdBQUcsT0FBTztBQUFBLElBQ3ZFO0FBRUEsVUFBTSxJQUFJLElBQUk7QUFBQSxNQUNWLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8sZ0JBQWdCLFdBQVcsQ0FBQztBQUFBLE1BQ25DLFNBQVMsdUJBQXVCLFdBQVcsQ0FBQztBQUFBLElBQ2hEO0FBQUEsRUFDSjtBQUVBLFNBQU8sQ0FBQyxPQUFPLFVBQVU7QUFDN0I7QUF4QmdCO0FBMkJoQixlQUFzQixjQUFjLFdBQXlDO0FBQ3pFLFFBQU0sQ0FBQyxVQUFVLE1BQU0sSUFBSSxlQUFlLFNBQVM7QUFDbkQsUUFBTSxDQUFDLFdBQVcsU0FBUyxJQUFJLGFBQWEsU0FBUztBQUNyRCxRQUFNLENBQUMsT0FBTyxTQUFTLElBQUksU0FBUyxTQUFTO0FBQzdDLFFBQU0sUUFBUSxlQUFlLFNBQVM7QUFFdEMsU0FBTztBQUFBLElBQ0gsWUFBWSxlQUFlLEtBQUs7QUFBQSxJQUNoQztBQUFBLElBQ0EsV0FBVyxRQUFRLFNBQVM7QUFBQSxJQUM1QixXQUFXLGlCQUFpQixTQUFTO0FBQUEsSUFDckMsYUFBYTtBQUFBLElBQ2Isa0JBQWtCO0FBQUEsSUFDbEIsZUFBZSxpQkFBaUIsU0FBUztBQUFBLElBQ3pDO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxTQUFTLENBQUM7QUFBQSxFQUNkO0FBQ0o7QUFwQnNCO0FBcUJ0QixRQUFRLGlCQUFpQixhQUFhO0FBQ3RDLGlCQUFpQixzQ0FBc0MsTUFBTTtBQUN6RCxTQUFPLGNBQWMsR0FBRztBQUM1QixDQUFDO0FBRU0sU0FBUyxjQUFjLFdBQW1CO0FBQzdDLFFBQU0sQ0FBQyxTQUFTLElBQUksYUFBYSxTQUFTO0FBQzFDLFFBQU0sQ0FBQyxLQUFLLElBQUksU0FBUyxTQUFTO0FBQ2xDLFFBQU0sQ0FBQyxRQUFRLElBQUksZUFBZSxTQUFTO0FBRTNDLFNBQU87QUFBQSxJQUNILGFBQWE7QUFBQSxJQUNiO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFDSjtBQVZnQjtBQVdoQixRQUFRLGlCQUFpQixhQUFhO0FBRS9CLFNBQVMsV0FBVyxXQUFtQjtBQUMxQyxTQUFPO0FBQUEsSUFDSCxXQUFXLGlCQUFpQixTQUFTO0FBQUEsSUFDckMsZUFBZSxpQkFBaUIsU0FBUztBQUFBLElBQ3pDLFdBQVcsUUFBUSxTQUFTO0FBQUEsSUFDNUIsT0FBTyxlQUFlLFNBQVM7QUFBQSxFQUNuQztBQUNKO0FBUGdCO0FBUWhCLFFBQVEsY0FBYyxVQUFVO0FBRXpCLFNBQVMsZ0JBQWdCO0FBQzVCLE1BQUksY0FBYyxDQUFDO0FBRW5CLFFBQU0sQ0FBQyxhQUFhLGlCQUFpQixJQUFJLFFBQVEsY0FBYyxRQUFRO0FBQ3ZFLFdBQVMsSUFBSSxHQUFHLElBQUksa0JBQWtCLFFBQVEsS0FBSztBQUMvQyxVQUFNLFdBQVcsa0JBQWtCLENBQUM7QUFDcEMsVUFBTSxPQUFPLFNBQVM7QUFDdEIsVUFBTSxRQUFRLFNBQVM7QUFDdkIsVUFBTSxRQUFRLFNBQVM7QUFDdkIsZ0JBQVksS0FBSyxJQUFJO0FBQUEsTUFDakI7QUFBQSxNQUNBO0FBQUEsTUFDQSxXQUFXO0FBQUEsTUFDWCxNQUFNLENBQUM7QUFBQSxJQUNYO0FBRUEsYUFBUyxJQUFJLEdBQUcsSUFBSSxZQUFZLFFBQVEsS0FBSztBQUN6QyxZQUFNLFVBQVUsWUFBWSxDQUFDO0FBQzdCLGtCQUFZLEtBQUssRUFBRSxLQUFLLEtBQUs7QUFBQSxRQUN6QixPQUFPLFFBQVE7QUFBQSxRQUNmLFVBQVU7QUFBQSxRQUNWLFNBQVMsQ0FBQztBQUFBLE1BQ2QsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBRUEsUUFBTSxXQUFXLGVBQWUsR0FBRyxNQUFNLFdBQVcsa0JBQWtCO0FBRXRFLFdBQVMsSUFBSSxHQUFHLElBQUksWUFBWSxRQUFRLEtBQUs7QUFDekMsVUFBTSxPQUFPLFlBQVksQ0FBQztBQUMxQixVQUFNLEVBQUUsS0FBSyxRQUFRLElBQUk7QUFDekIsVUFBTSxVQUFVLFdBQVcsR0FBRztBQUM5QixhQUFTLElBQUksR0FBRyxJQUFJLFFBQVEsUUFBUSxLQUFLO0FBQ3JDLFlBQU0sYUFBYSxRQUFRLENBQUM7QUFDNUIsVUFBSSxTQUFTO0FBRWIsWUFBTSxjQUFjLFdBQVcsWUFBWTtBQUMzQyxZQUFNLGlCQUFpQixZQUFZLFNBQVMsSUFBSTtBQUNoRCxVQUFJLGtCQUFrQixVQUFVO0FBQzVCLGlCQUFTO0FBQUEsTUFDYixXQUFXLENBQUMsa0JBQWtCLENBQUMsVUFBVTtBQUNyQyxpQkFBUztBQUFBLE1BQ2I7QUFFQSxVQUFJLE9BQU87QUFDWCxVQUFJLE9BQU87QUFFWCxVQUFJLFFBQVE7QUFDUixlQUFPLFdBQVcsTUFBTTtBQUN4QixlQUFPLCtCQUErQixTQUFTLElBQUk7QUFBQSxNQUN2RDtBQUVBLFVBQUksU0FBUyxNQUFNLE1BQU07QUFDckIsY0FBTSxjQUFjLFlBQVksSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBRTlDLG9CQUFZLEtBQUs7QUFBQSxVQUNiLE9BQU87QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxTQUFPO0FBQ1g7QUFsRWdCO0FBc0VoQixpQkFBaUIsZ0RBQWdELENBQUMsU0FBb0M7QUFDbEcsTUFBSSxLQUFLLFNBQVM7QUFBUyxZQUFRLGtCQUFrQixFQUFFLG9CQUFvQixLQUFLLElBQUk7QUFDcEYsTUFBSSxLQUFLLFNBQVM7QUFBWSxZQUFRLHFCQUFxQixFQUFFLG9CQUFvQixLQUFLLElBQUk7QUFDOUYsQ0FBQzs7O0FDclJELElBQU8sa0JBQVE7QUFBQSxFQUNYLE1BQU07QUFBQSxJQUNGLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0gsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLEVBQ1Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxNQUNGLFdBQVc7QUFBQSxRQUNQLEVBQUUsV0FBVyxHQUFHLFNBQVMsSUFBSSxTQUFTLEdBQUcsSUFBSSxTQUFTO0FBQUEsUUFDdEQsRUFBRSxXQUFXLElBQUksU0FBUyxJQUFJLFNBQVMsR0FBRyxJQUFJLFVBQVM7QUFBQSxNQUMzRDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsTUFDRixXQUFXO0FBQUEsUUFDUCxFQUFFLFdBQVcsR0FBRyxTQUFTLElBQUksU0FBUyxHQUFHLElBQUksU0FBUztBQUFBLFFBQ3RELEVBQUUsV0FBVyxHQUFHLFNBQVMsSUFBSSxTQUFTLEdBQUcsSUFBSSxTQUFRO0FBQUEsTUFDekQ7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0YsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLEVBQ1Q7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxFQUNUO0FBQ0o7OztBQzVDTyxTQUFTLFlBQVksV0FBbUIsTUFBYztBQUN6RCwyQkFBeUIsV0FBVyxLQUFLLE9BQU8sS0FBSyxPQUFPLEtBQUssU0FBUyxDQUFDO0FBQzNFLFNBQU8sZ0NBQWdDLFdBQVcsS0FBSyxPQUFPLEtBQUssS0FBSztBQUM1RTtBQUhnQjtBQUtULFNBQVMsUUFBUSxXQUFtQixNQUFjO0FBQ3JELE1BQUksS0FBSyxVQUFVLElBQUk7QUFDbkIsaUJBQWEsV0FBVyxLQUFLLEtBQUs7QUFDbEM7QUFBQSxFQUNKO0FBRUEsa0JBQWdCLFdBQVcsS0FBSyxPQUFPLEtBQUssT0FBTyxLQUFLLFNBQVMsS0FBSztBQUN0RSxTQUFPLG9DQUFvQyxXQUFXLEtBQUssT0FBTyxLQUFLLEtBQUs7QUFDaEY7QUFSZ0I7QUFVVCxJQUFNLFdBQVcsOEJBQU8sVUFBa0I7QUFDN0MsUUFBTSxZQUFZLE1BQU0sYUFBYSxLQUFLO0FBQzFDLGlCQUFlLFNBQVMsR0FBRyxTQUFTO0FBQ3BDLDJCQUF5QixTQUFTO0FBQ2xDLFFBQU0sWUFBWSxZQUFZO0FBQzlCLFlBQVUsU0FBUztBQUNuQixrQ0FBZ0MsU0FBUztBQUV6QyxNQUFJLGNBQWMsV0FBVyxrQkFBa0I7QUFBRyx3QkFBb0IsS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxLQUFLO0FBQUEsV0FDbEcsY0FBYyxXQUFXLGtCQUFrQjtBQUFHLHdCQUFvQixLQUFLLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxHQUFHLEtBQUssS0FBSyxHQUFHLEtBQUs7QUFDNUgsR0FWd0I7QUFZakIsU0FBUyxlQUFlLFdBQW1CLE1BQWM7QUFDNUQsb0JBQWtCLFdBQVcsS0FBSyxPQUFPLEtBQUssUUFBUSxDQUFHO0FBQzdEO0FBRmdCO0FBSWhCLElBQU0sYUFBYSx3QkFBQyxRQUFnQixPQUFPLElBQUksTUFBTSxHQUFsQztBQUVaLFNBQVMsYUFBYSxXQUFtQixNQUFNO0FBQ2xELFFBQU0sYUFBYSxXQUFXLEtBQUssVUFBVTtBQUM3QyxRQUFNLGNBQWMsV0FBVyxLQUFLLFdBQVc7QUFDL0MsUUFBTSxhQUFhLFdBQVcsS0FBSyxVQUFVO0FBQzdDLFFBQU0sWUFBWSxXQUFXLEtBQUssU0FBUztBQUMzQyxRQUFNLGFBQWEsV0FBVyxLQUFLLFVBQVU7QUFDN0MsUUFBTSxZQUFZLFdBQVcsS0FBSyxTQUFTO0FBQzNDLFFBQU0sV0FBVyxLQUFLLFdBQVc7QUFDakMsUUFBTSxVQUFVLEtBQUssVUFBVTtBQUMvQixRQUFNLFdBQVcsS0FBSyxXQUFXO0FBQ2pDLFFBQU0sWUFBWSxLQUFLO0FBRXZCLHNCQUFvQixXQUFXLFlBQVksYUFBYSxZQUFZLFdBQVcsWUFBWSxXQUFXLFVBQVUsU0FBUyxVQUFVLFNBQVM7QUFDaEo7QUFiZ0I7QUFlVCxTQUFTLGVBQWUsV0FBbUIsTUFBTTtBQUNwRCxRQUFNLFFBQVEsS0FBSztBQUVuQixNQUFJLFVBQVUsSUFBSTtBQUNkLG1CQUFlLFdBQVcsS0FBSyxLQUFLO0FBQ3BDO0FBQUEsRUFDSjtBQUVBLFFBQU0sUUFBUSxLQUFLLGlCQUFpQixLQUFLLE1BQU0sS0FBSztBQUdwRCxNQUFJLEtBQUssT0FBTyxhQUFhO0FBQ3pCLG1CQUFlLFdBQVcsS0FBSyxXQUFXLEtBQUssYUFBYTtBQUM1RDtBQUFBLEVBQ0o7QUFFQSxvQkFBa0IsV0FBVyxPQUFPLE9BQU8sS0FBSyxpQkFBaUIsQ0FBRztBQUNwRSx5QkFBdUIsV0FBVyxPQUFPLEdBQUcsS0FBSyxZQUFZLEtBQUssV0FBVztBQUNqRjtBQWxCZ0I7QUFxQlQsU0FBUyxhQUFhLE1BQU07QUFDL0IsUUFBTSxZQUFZLEtBQUs7QUFDdkIsUUFBTSxRQUFRLEtBQUs7QUFFbkIsYUFBVyxDQUFDLFlBQVksVUFBVSxLQUFLLE9BQU8sUUFBUSxlQUFjLEdBQUc7QUFDbkUsVUFBTSxhQUFhLFdBQVc7QUFDOUIsVUFBTSxRQUFRLFdBQVc7QUFFekIsUUFBSSxlQUFlLGNBQWMsVUFBVSxVQUFVLEdBQUc7QUFDcEQsWUFBTSxrQkFBa0Isd0JBQXdCLEtBQUssS0FBSztBQUMxRCxVQUFJLG9CQUFvQixVQUFVLFVBQVUsRUFBRSxPQUFPO0FBQ2pELGlDQUF5QixLQUFLLE9BQU8sVUFBVSxVQUFVLEVBQUUsT0FBTyxHQUFHLENBQUM7QUFBQSxNQUMxRTtBQUFBLElBQ0osV0FBVyxlQUFlLFVBQVUsTUFBTSxVQUFVLEdBQUc7QUFDbkQsWUFBTSxjQUFjLGdCQUFnQixLQUFLLEtBQUs7QUFDOUMsVUFBSSxnQkFBZ0IsTUFBTSxVQUFVLEVBQUUsT0FBTztBQUN6Qyx3QkFBZ0IsS0FBSyxPQUFPLE1BQU0sVUFBVSxFQUFFLE9BQU8sR0FBRyxLQUFLO0FBQUEsTUFDakU7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKO0FBcEJnQjtBQXNCVCxTQUFTLGNBQWMsV0FBbUIsTUFBTTtBQUNuRCxRQUFNLFlBQVksS0FBSztBQUN2QixRQUFNLFFBQVEsS0FBSztBQUNuQixRQUFNLGNBQWMsS0FBSztBQUN6QixhQUFXLE1BQU0sV0FBVztBQUN4QixVQUFNLFdBQVcsVUFBVSxFQUFFO0FBQzdCLGdCQUFZLFdBQVcsUUFBUTtBQUFBLEVBQ25DO0FBRUEsYUFBVyxNQUFNLE9BQU87QUFDcEIsVUFBTSxPQUFPLE1BQU0sRUFBRTtBQUNyQixZQUFRLFdBQVcsSUFBSTtBQUFBLEVBQzNCO0FBRUEsYUFBVyxNQUFNLGFBQWE7QUFDMUIsVUFBTSxVQUFVLFlBQVksRUFBRTtBQUM5QixtQkFBZSxXQUFXLE9BQU87QUFBQSxFQUNyQztBQUNKO0FBbEJnQjtBQW9CVCxJQUFNLGFBQWEsOEJBQU8sU0FBUztBQUN0QyxRQUFNLGdCQUFnQixLQUFLO0FBQzNCLFFBQU0sWUFBWSxLQUFLO0FBRXZCLFFBQU0sU0FBUyxLQUFLLEtBQUs7QUFFekIsTUFBSTtBQUFXLGlCQUFhLEtBQUssU0FBUztBQUUxQyxNQUFJO0FBQWUsZUFBVyxXQUFXLGVBQWU7QUFDcEQsWUFBTSxRQUFRLGNBQWMsT0FBTztBQUNuQyxxQkFBZSxLQUFLLEtBQUs7QUFBQSxJQUM3QjtBQUNKLEdBWjBCO0FBY25CLFNBQVMsY0FBYyxXQUFtQixNQUFNO0FBQ25ELE1BQUksQ0FBQztBQUFNO0FBRVgsZ0NBQThCLFNBQVM7QUFFdkMsV0FBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLFFBQVEsS0FBSztBQUNsQyxVQUFNLGFBQWEsS0FBSyxDQUFDLEVBQUU7QUFDM0IsUUFBSSxZQUFZO0FBQ1osWUFBTSxhQUFhLFdBQVcsV0FBVyxHQUFHO0FBQzVDLFlBQU0sU0FBUyxXQUFXO0FBQzFCLGlDQUEyQixXQUFXLFlBQVksTUFBTTtBQUFBLElBQzVEO0FBQUEsRUFDSjtBQUNKO0FBYmdCO0FBZVQsU0FBUyxpQkFBaUIsV0FBbUIsTUFBTTtBQUN0RCxRQUFNLFFBQVEsS0FBSztBQUNuQixRQUFNLFlBQVksS0FBSztBQUN2QixrQkFBZ0IsV0FBVyxPQUFPLFNBQVM7QUFDL0M7QUFKZ0I7QUFNaEIsZUFBc0IsaUJBQWlCLFdBQW1CLE1BQU07QUFDNUQsUUFBTSxXQUFXLElBQUk7QUFDckIsZ0JBQWMsV0FBVyxJQUFJO0FBQzdCLG1CQUFpQixXQUFXLEtBQUssU0FBUztBQUMxQyxnQkFBYyxXQUFXLEtBQUssT0FBTztBQUN6QztBQUxzQjtBQU90QixlQUFzQix1QkFBdUIsTUFBTTtBQUMvQyxRQUFNLFdBQVcsSUFBSTtBQUNyQixnQkFBYyxLQUFLLElBQUk7QUFDdkIsbUJBQWlCLEtBQUssS0FBSyxTQUFTO0FBQ3BDLGdCQUFjLEtBQUssS0FBSyxPQUFPO0FBQ25DO0FBTHNCO0FBT3RCLFFBQVEsaUJBQWlCLGFBQWE7QUFDdEMsUUFBUSxjQUFjLFVBQVU7QUFDaEMsUUFBUSxpQkFBaUIsYUFBYTtBQUN0QyxRQUFRLG9CQUFvQixnQkFBZ0I7OztBQ25KNUMsc0RBQW9DLE9BQU8sWUFBeUIsT0FBaUI7QUFDcEYsUUFBTSx1QkFBdUIsVUFBVTtBQUN2QyxZQUFVO0FBQ1YsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELGtEQUFrQyxPQUFPLFlBQXlCLE9BQWlCO0FBQ2xGLGVBQWEsVUFBVTtBQUV2QixRQUFNLE1BQU0sR0FBRztBQUVmLFFBQU0sZ0JBQWdCLE1BQU0sY0FBYyxHQUFHO0FBQzdDLGdCQUFjLFVBQVUsV0FBVztBQUNuQyx3QkFBc0IsdUNBQXVDLGVBQWUsR0FBRyxhQUFhO0FBRTVGLGdCQUFjLEtBQUssY0FBYyxPQUFPO0FBRXhDLFlBQVU7QUFDVixLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsMERBQXNDLE9BQU8sT0FBZSxPQUFpQjtBQUM1RSxRQUFNLE9BQU8sV0FBVyxLQUFLO0FBQzdCLE1BQUksQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLENBQUMsYUFBYSxJQUFJLEdBQUc7QUFDbkQsV0FBTyxHQUFHLENBQUM7QUFBQSxFQUNaO0FBRUEsUUFBTSxTQUFTLElBQUk7QUFFbkIsUUFBTSxhQUFhLE1BQU0sY0FBYyxHQUFHO0FBRTFDLGFBQVcsVUFBVSxDQUFDO0FBRXRCLGdCQUFjLEtBQUssQ0FBQyxDQUFDO0FBRXJCLEtBQUcsVUFBVTtBQUNkLENBQUM7QUFFRCx3RUFBNkMsT0FBTyxHQUFRLE9BQWlCO0FBQzVFLFFBQU0sVUFBVSxjQUFjO0FBRTlCLEtBQUcsT0FBTztBQUNYLENBQUM7QUFFRCwwRUFBOEMsT0FBTyxNQUFjLE9BQWlCO0FBQ25GLGlCQUFlLEtBQUssSUFBSTtBQUN4QixLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsc0VBQTRDLE9BQU8sTUFBYyxPQUFpQjtBQUNqRixpQkFBZSxLQUFLLElBQUk7QUFDeEIsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELGtFQUEwQyxPQUFPLE1BQWMsT0FBaUI7QUFDL0UsZUFBYSxLQUFLLElBQUk7QUFDdEIsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELDhEQUF3QyxPQUFPLE1BQWMsT0FBaUI7QUFDN0UsZ0JBQWMsS0FBSyxJQUFJO0FBQ3ZCLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCx3REFBcUMsT0FBTyxNQUFjLE9BQWlCO0FBQzFFLE1BQUksVUFBVSxRQUFRLEtBQUssSUFBSTtBQUMvQixLQUFHLE9BQU87QUFDWCxDQUFDO0FBRUQsZ0VBQXlDLE9BQU8sTUFBYyxPQUFpQjtBQUM5RSxNQUFJLFVBQVUsWUFBWSxLQUFLLElBQUk7QUFDbkMsS0FBRyxPQUFPO0FBQ1gsQ0FBQztBQUVEO0FBQUE7QUFBQSxFQUF3QyxPQUFPLE1BQW1CLE9BQWlCO0FBQ2xGLFVBQU0sT0FBTyxnQkFBZSxLQUFLLElBQUk7QUFDckMsUUFBSSxDQUFDO0FBQU0sYUFBTyxHQUFHLEtBQUs7QUFFMUIsVUFBTSxVQUFVLEtBQUs7QUFDckIsVUFBTSxPQUFPLEtBQUs7QUFDbEIsVUFBTSxRQUFRLEtBQUs7QUFDbkIsVUFBTSxPQUFPLEtBQUs7QUFDbEIsVUFBTSxXQUFXLEtBQUs7QUFFdEIsUUFBSSxDQUFDO0FBQVMsYUFBTyxHQUFHLEtBQUs7QUFFN0IsUUFBSSxTQUFTLFFBQVE7QUFDcEIsWUFBTSxjQUFjLGdCQUFnQixLQUFLLEtBQUs7QUFFOUMsVUFBSSxnQkFBZ0IsSUFBSTtBQUN2QixnQkFBUSxLQUFLLE9BQU87QUFDcEIsV0FBRyxLQUFLO0FBQ1I7QUFBQSxNQUNELE9BQU87QUFDTixxQkFBYSxLQUFLLEtBQUs7QUFDdkIsV0FBRyxJQUFJO0FBQ1A7QUFBQSxNQUNEO0FBQUEsSUFDRCxXQUFXLFNBQVMsWUFBWTtBQUMvQixZQUFNLGtCQUFrQix3QkFBd0IsS0FBSyxLQUFLO0FBRTFELFVBQUksUUFBUSxVQUFVLEtBQUssS0FBSztBQUMvQixXQUFHLEtBQUs7QUFDUjtBQUFBLE1BQ0Q7QUFFQSxVQUFJLFFBQVEsVUFBVSxpQkFBaUI7QUFDdEMsaUNBQXlCLEtBQUssT0FBTyxLQUFLLEtBQUssR0FBRyxDQUFDO0FBQ25ELFlBQUksTUFBTTtBQUNULG1CQUFRLElBQUUsR0FBRyxJQUFJLEtBQUssV0FBVyxRQUFRLEtBQUs7QUFDN0Msa0JBQU0sV0FBVyxLQUFLLFVBQVUsQ0FBQztBQUNqQyxxQ0FBeUIsS0FBSyxTQUFTLFdBQVcsU0FBUyxTQUFTLFNBQVMsU0FBUyxDQUFDO0FBQUEsVUFDeEY7QUFBQSxRQUNEO0FBQ0EsV0FBRyxJQUFJO0FBQ1A7QUFBQSxNQUNELE9BQU87QUFDTixvQkFBWSxLQUFLLE9BQU87QUFDeEIsaUJBQVEsSUFBRSxHQUFHLElBQUksVUFBVSxRQUFRLEtBQUs7QUFDdkMsc0JBQVksS0FBSyxTQUFTLENBQUMsQ0FBQztBQUFBLFFBQzdCO0FBQ0EsV0FBRyxLQUFLO0FBQ1I7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFDQTtBQUVBLDhEQUF3QyxPQUFPLE1BQVcsT0FBaUI7QUFDMUUsUUFBTSxlQUFlLGVBQWU7QUFDcEMsUUFBTSxTQUFTLE1BQU0sc0JBQXNCLG1DQUFtQyxjQUFjLElBQUk7QUFDaEcsS0FBRyxNQUFNO0FBQ1YsQ0FBQztBQUVELGtFQUEwQyxPQUFPLEVBQUMsR0FBRSxHQUFHLE9BQWlCO0FBQ3ZFLFFBQU0sZUFBZSxlQUFlO0FBQ3BDLFFBQU0sU0FBUyxNQUFNLHNCQUFzQixxQ0FBcUMsY0FBYyxFQUFFO0FBQ2hHLEtBQUcsTUFBTTtBQUNWLENBQUM7QUFFRCxrRUFBMEMsT0FBTyxNQUFXLE9BQWlCO0FBQzVFLFFBQU0sZUFBZSxlQUFlO0FBQ3BDLFFBQU0sU0FBUyxNQUFNLHNCQUFzQixxQ0FBcUMsY0FBYyxJQUFJO0FBQ2xHLEtBQUcsTUFBTTtBQUNWLENBQUM7QUFFRCw0REFBdUMsT0FBTyxRQUFnQixPQUFpQjtBQUM5RSxnQkFBYyxLQUFLLE1BQU07QUFDekIsS0FBRyxDQUFDO0FBQ0wsQ0FBQzs7O0FDaktELElBQU0sU0FBUyxRQUFRO0FBQ3ZCLElBQUksU0FBUztBQUNiLElBQUksT0FBTztBQUVYLElBQUksaUJBQWlCO0FBQ3JCLElBQUksVUFBVTtBQUVkLGVBQXNCLFNBQVMsTUFBdUIsV0FBb0IsT0FBTztBQUM3RSxNQUFJLFNBQVMsUUFBUSxNQUFNO0FBQ3ZCO0FBQUEsRUFDSjtBQUVBLFFBQU0sWUFBWSxZQUFZO0FBQzlCLFFBQU0sY0FBYyxPQUFPLE1BQU07QUFFakMsUUFBTSxPQUFPLEtBQUs7QUFFbEIsUUFBTSxPQUFPLFlBQVksSUFBSTtBQUM3QixNQUFJLENBQUM7QUFBTTtBQUVYLFlBQVUsU0FBUztBQUNuQixjQUFZO0FBRVosUUFBTSxlQUFlLGVBQWU7QUFDcEMsUUFBTSxPQUFPLEtBQUs7QUFDbEIsTUFBSSxZQUFZLEtBQUs7QUFFckIsV0FBUyxhQUFhLFNBQVM7QUFFL0IsTUFBSSxVQUFVLENBQUM7QUFFZixRQUFNLGVBQWUsS0FBSyxTQUFTLFNBQVM7QUFDNUMsTUFBSTtBQUFjLGNBQVUsTUFBTSxzQkFBZ0MsbUNBQW1DLFlBQVk7QUFFakgsTUFBSSxTQUFTLENBQUM7QUFFZCxRQUFNLGlCQUFpQixLQUFLLFNBQVMsVUFBVTtBQUMvQyxNQUFJLGdCQUFnQjtBQUNoQixhQUFTLE9BQU8sT0FBTztBQUFBLEVBQzNCO0FBRUEsUUFBTSxlQUFlLEtBQUssU0FBUyxTQUFTO0FBQzVDLE1BQUk7QUFDSixNQUFJLGNBQWM7QUFDZCxjQUFVLGNBQWM7QUFBQSxFQUM1QjtBQUVBLFFBQU0sWUFBWSxhQUFhLElBQUk7QUFFbkMsUUFBTSxhQUFhLE1BQU0sY0FBYyxTQUFTO0FBRWhELE1BQUksVUFBVTtBQUNWLFlBQVEsdUNBQXVDO0FBQy9DLGNBQVUsSUFBSSxRQUFRLGFBQVc7QUFDN0IsdUJBQWlCO0FBQUEsSUFDckIsQ0FBQztBQUFBLEVBQ0w7QUFFQSw2Q0FBd0I7QUFBQSxJQUNwQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0EsUUFBUSxNQUFNLGNBQWMsUUFBUTtBQUFBLEVBQ3hDLENBQUM7QUFDRCxjQUFZLE1BQU0sSUFBSTtBQUN0QixtREFBMkIsSUFBSTtBQUMvQixTQUFPO0FBRVAsTUFBSSxTQUFTO0FBQ1QsVUFBTTtBQUNOLFlBQVEseUNBQXlDO0FBQUEsRUFDckQ7QUFFQSxZQUFVO0FBQ1YsbUJBQWlCO0FBQ2pCLFNBQU87QUFDWDtBQXpFc0I7QUEyRXRCLFFBQVEsWUFBWSxRQUFRO0FBRTVCLFNBQVMsYUFBYSxNQUF1QjtBQUN6QyxNQUFJLENBQUM7QUFBTSxXQUFPLENBQUM7QUFFbkIsUUFBTSxFQUFDLFlBQVksS0FBSSxJQUFJLE9BQU8sVUFBVTtBQUU1QyxNQUFJLENBQUM7QUFBWSxXQUFPLENBQUM7QUFDekIsTUFBSSxDQUFDO0FBQU0sV0FBTyxDQUFDO0FBRW5CLE1BQUksWUFBWSxFQUFDLEdBQUcsS0FBSTtBQUV4QixRQUFNLGFBQWEsY0FBYztBQUdqQyxhQUFXLFFBQVEsWUFBWTtBQUMzQixVQUFNLFNBQVMsV0FBVyxJQUFJO0FBQzlCLGVBQVcsU0FBUyxRQUFRO0FBRXhCLFVBQUksT0FBZ0I7QUFFcEIsVUFBSSxRQUFRLFVBQVUsS0FBSyxNQUFNO0FBQzdCLGVBQU8sS0FBSyxLQUFLLFNBQVMsV0FBVyxJQUFJLElBQUk7QUFBQSxNQUNqRDtBQUVBLFVBQUksUUFBUSxXQUFXLEtBQUssT0FBTztBQUMvQixlQUFPLEtBQUssTUFBTSxTQUFTLFdBQVcsS0FBSyxJQUFJO0FBQUEsTUFDbkQ7QUFNQSxVQUFJLENBQUMsTUFBTTtBQUNQLGNBQU0saUJBQWlCLE9BQU8sS0FBSztBQUNuQyxvQkFBWSxPQUFPLE9BQU8sQ0FBQyxHQUFHLFdBQVcsZ0JBQWdCO0FBQUEsVUFDdkQsV0FBVyxPQUFPLE9BQU8sQ0FBQyxHQUFHLFVBQVUsV0FBVyxlQUFlLFNBQVM7QUFBQSxRQUM1RSxDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsU0FBTztBQUdYO0FBM0NTO0FBNkNGLFNBQVMsWUFBWTtBQUN4QixlQUFhLEtBQUssTUFBTTtBQUV4QixhQUFXO0FBQ1gsY0FBWSxPQUFPLEtBQUs7QUFDeEIsbURBQTJCLEtBQUs7QUFFaEMsTUFBSSxnQkFBZ0I7QUFDaEIsbUJBQWU7QUFBQSxFQUNuQjtBQUNBLFNBQU87QUFDWDtBQVhnQjs7O0FDcEloQixnQkFBZ0IsWUFBWSxZQUFZO0FBQ3BDLFVBQVEsY0FBYyxnQkFBZ0I7QUFDMUMsR0FBRyxLQUFLO0FBRVIsUUFBUSxvQkFBb0IsT0FBT0MsTUFBYSxlQUE0QjtBQUN4RSxRQUFNLGlCQUFpQkEsTUFBSyxVQUFVO0FBQzFDLENBQUM7QUFFRCxRQUFRLDBCQUEwQixPQUFPLGdCQUFnQjtBQUNyRCxRQUFNLGFBQWEsTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFDN0csUUFBTSx1QkFBdUIsVUFBVTtBQUMzQyxDQUFDO0FBRUQsUUFBUSwwQkFBMEIsT0FBTyxnQkFBZ0I7QUFDckQsU0FBTyxNQUFNLHNCQUFtQyxzQ0FBc0MsV0FBVztBQUNyRyxDQUFDO0FBRUQsUUFBUSxtQkFBbUIsT0FBTyxPQUFrQjtBQUNoRCxRQUFNLFNBQVMsRUFBRSxNQUFNLGNBQWMsUUFBUSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLElBQUk7QUFDakUsTUFBSTtBQUFJLE9BQUc7QUFDZixDQUFDO0FBRUQsR0FBRyw2QkFBNkIsQ0FBQyxTQUEwQjtBQUN2RCxXQUFTLElBQUk7QUFDakIsQ0FBQztBQUVELE1BQU0saUNBQWlDLFlBQVk7QUFDL0MsU0FBTyxDQUFDLFVBQVUsS0FBSyxFQUFFLGFBQWEsR0FBRztBQUNyQyxVQUFNLE1BQU0sR0FBRztBQUFBLEVBQ25CO0FBQ0EsUUFBTSxjQUFjLE1BQU0sZUFBZTtBQUN6QyxRQUFNLGFBQWEsTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFDN0csUUFBTSx1QkFBdUIsVUFBVTtBQUMzQyxDQUFDO0FBRUQsTUFBTSxtQkFBbUIsT0FBTyxhQUFxQjtBQUNqRCxNQUFJLGFBQWEsdUJBQXVCLEtBQUssVUFBVSxLQUFLLEVBQUUsYUFBYSxHQUFHO0FBQzFFLFVBQU0sY0FBYyxNQUFNLGVBQWU7QUFDekMsVUFBTSxhQUFhLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQzdHLFVBQU0sdUJBQXVCLFVBQVU7QUFBQSxFQUMzQztBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbImRlbGF5IiwgIngiLCAieSIsICJ6IiwgImNvbmZpZyIsICJwZWQiXQp9Cg==
