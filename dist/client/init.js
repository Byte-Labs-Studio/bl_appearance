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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvcWIudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9icmlkZ2UvZXN4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvY29tcGF0L2lsbGVuaXVtLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvaW5pdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGxldCBwZWQgPSAwXHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlUGVkID0gKHBlZEhhbmRsZTogbnVtYmVyKSA9PiB7XHJcbiAgICBwZWQgPSBwZWRIYW5kbGVcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlYnVnZGF0YSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGEsIChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0sIDIpKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2VuZE5VSUV2ZW50ID0gKGFjdGlvbjogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcclxuICAgIFNlbmROVUlNZXNzYWdlKHtcclxuICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TW9kZWwgPSBhc3luYyAobW9kZWw6IHN0cmluZyB8IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiA9PiB7XHJcbiAgICBsZXQgbW9kZWxIYXNoOiBudW1iZXIgPSB0eXBlb2YgbW9kZWwgPT09ICdudW1iZXInID8gbW9kZWwgOiBHZXRIYXNoS2V5KG1vZGVsKVxyXG5cclxuICAgIGlmICghSXNNb2RlbFZhbGlkKG1vZGVsSGFzaCkgJiYgIUlzTW9kZWxJbkNkaW1hZ2UobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIC8vIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAvLyAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgLy8gICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgLy8gICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgLy8gfSlcclxuXHJcbiAgICAgICAgY29uc29sZS53YXJuKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9ibF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5OiBzdHJpbmcsIC4uLmFyZ3M6IGFueSkgPT4ge1xyXG4gICAgY29uc3QgcmVzb2x2ZSA9IGFjdGl2ZUV2ZW50c1trZXldO1xyXG4gICAgcmV0dXJuIHJlc29sdmUgJiYgcmVzb2x2ZSguLi5hcmdzKTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlclNlcnZlckNhbGxiYWNrPFQgPSB1bmtub3duPihcclxuICAgIGV2ZW50TmFtZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlcclxuKTogUHJvbWlzZTxUPiB8IHZvaWQge1xyXG4gICAgaWYgKCFldmVudFRpbWVyKGV2ZW50TmFtZSwgMCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGtleTogc3RyaW5nO1xyXG5cclxuICAgIGRvIHtcclxuICAgICAgICBrZXkgPSBgJHtldmVudE5hbWV9OiR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDEwMDAwMCArIDEpKX1gO1xyXG4gICAgfSB3aGlsZSAoYWN0aXZlRXZlbnRzW2tleV0pO1xyXG4gICAgZW1pdE5ldChgX2JsX2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvblNlcnZlckNhbGxiYWNrKGV2ZW50TmFtZSwgY2IpIHtcclxuICAgIG9uTmV0KGBfYmxfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlLCBrZXksIC4uLmFyZ3MpID0+IHtcclxuICAgICAgICBsZXQgcmVzcG9uc2U7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBjYiguLi5hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgaGFuZGxpbmcgY2FsbGJhY2sgZXZlbnQgJHtldmVudE5hbWV9YCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBeMyR7ZS5zdGFja31eMGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbWl0TmV0KGBfYmxfY2JfJHtyZXNvdXJjZX1gLCBrZXksIHJlc3BvbnNlKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vL2xvY2FsZVxyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RMb2NhbGUgPSAocmVzb3VyY2VTZXROYW1lOiBzdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNoZWNrUmVzb3VyY2VGaWxlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoUmVxdWVzdFJlc291cmNlRmlsZVNldChyZXNvdXJjZVNldE5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50TGFuID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmNvbmZpZygpLmxvY2FsZVxyXG4gICAgICAgICAgICAgICAgbGV0IGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvJHtjdXJyZW50TGFufS5qc29uYCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsZUZpbGVDb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtjdXJyZW50TGFufS5qc29uIG5vdCBmb3VuZCBpbiBsb2NhbGUsIHBsZWFzZSB2ZXJpZnkhLCB3ZSB1c2VkIGVuZ2xpc2ggZm9yIG5vdyFgKVxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvZW4uanNvbmApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGxvY2FsZUZpbGVDb250ZW50KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2hlY2tSZXNvdXJjZUZpbGUsIDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2hlY2tSZXNvdXJjZUZpbGUoKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbG9jYWxlID0gYXN5bmMgKGlkOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBjb25zdCBsb2NhbGUgPSBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKTtcclxuICAgIGxldCBhcmdJbmRleCA9IDA7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gbG9jYWxlW2lkXS5yZXBsYWNlKC8lcy9nLCAobWF0Y2g6IHN0cmluZykgPT4gYXJnSW5kZXggPCBhcmdzLmxlbmd0aCA/IGFyZ3NbYXJnSW5kZXhdIDogbWF0Y2gpO1xyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgYmxfYnJpZGdlID0gZXhwb3J0cy5ibF9icmlkZ2VcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRQbGF5ZXJEYXRhID0gKCkgPT4ge1xyXG4gICAgcmV0dXJuIGJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRGcmFtZXdvcmtJRCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGlkID0gZ2V0UGxheWVyRGF0YSgpLmNpZFxyXG4gICAgcmV0dXJuIGlkXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRQbGF5ZXJHZW5kZXJNb2RlbCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGdlbmRlciA9IGdldFBsYXllckRhdGEoKS5nZW5kZXJcclxuICAgIHJldHVybiBnZW5kZXIgPT09ICdtYWxlJyA/ICdtcF9tX2ZyZWVtb2RlXzAxJyA6ICdtcF9mX2ZyZWVtb2RlXzAxJ1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRGVsYXkobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmICghc3RyLmluY2x1ZGVzKFwiJ1wiKSkgcmV0dXJuIHN0cjtcclxuICAgIHJldHVybiBzdHIucmVwbGFjZSgvJy9nLCBcIlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEpvYkluZm8oKTogeyBuYW1lOiBzdHJpbmcsIGlzQm9zczogYm9vbGVhbiB9IHwgbnVsbCB7XHJcbiAgICBjb25zdCBqb2IgPSBnZXRQbGF5ZXJEYXRhKCkuam9iXHJcbiAgICByZXR1cm4gam9iID8geyBuYW1lOiBqb2IubmFtZSwgaXNCb3NzOiBqb2IuaXNCb3NzIH0gOiBudWxsXHJcbn0iLCAiaW1wb3J0IHsgQ2FtZXJhLCBWZWN0b3IzLCBUQ2FtZXJhQm9uZXMgfSBmcm9tICdAdHlwaW5ncy9jYW1lcmEnO1xyXG5pbXBvcnQgeyBkZWxheSwgcGVkIH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgUmVjZWl2ZSB9IGZyb20gJ0BldmVudHMnO1xyXG5cclxuY29uc3QgV0hPTEVfQk9EWV9NQVhfRElTVEFOQ0UgPSAyLjA7XHJcbmNvbnN0IERFRkFVTFRfTUFYX0RJU1RBTkNFID0gMS4wO1xyXG5cclxubGV0IHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGNhbURpc3RhbmNlOiBudW1iZXIgPSAxLjg7XHJcbmxldCBjYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgYW5nbGVZOiBudW1iZXIgPSAwLjA7XHJcbmxldCBhbmdsZVo6IG51bWJlciA9IDAuMDtcclxubGV0IHRhcmdldENvb3JkczogVmVjdG9yMyB8IG51bGwgPSBudWxsO1xyXG5sZXQgb2xkQ2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGNoYW5naW5nQ2FtOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBsYXN0WDogbnVtYmVyID0gMDtcclxubGV0IGN1cnJlbnRCb25lOiBrZXlvZiBUQ2FtZXJhQm9uZXMgPSAnaGVhZCc7XHJcblxyXG5jb25zdCBDYW1lcmFCb25lczogVENhbWVyYUJvbmVzID0ge1xyXG4gICAgd2hvbGU6IDAsXHJcblx0aGVhZDogMzEwODYsXHJcblx0dG9yc286IDI0ODE4LFxyXG5cdGxlZ3M6IFsxNjMzNSwgNDYwNzhdLFxyXG4gICAgc2hvZXM6IFsxNDIwMSwgNTIzMDFdLFxyXG59O1xyXG5cclxuY29uc3QgY29zID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguY29zKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3Qgc2luID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguc2luKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0QW5nbGVzID0gKCk6IG51bWJlcltdID0+IHtcclxuXHRjb25zdCB4ID1cclxuXHRcdCgoY29zKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSArIGNvcyhhbmdsZVkpICogY29zKGFuZ2xlWikpIC8gMikgKlxyXG5cdFx0Y2FtRGlzdGFuY2U7XHJcblx0Y29uc3QgeSA9XHJcblx0XHQoKHNpbihhbmdsZVopICogY29zKGFuZ2xlWSkgKyBjb3MoYW5nbGVZKSAqIHNpbihhbmdsZVopKSAvIDIpICpcclxuXHRcdGNhbURpc3RhbmNlO1xyXG5cdGNvbnN0IHogPSBzaW4oYW5nbGVZKSAqIGNhbURpc3RhbmNlO1xyXG5cclxuXHRyZXR1cm4gW3gsIHksIHpdO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtUG9zaXRpb24gPSAobW91c2VYPzogbnVtYmVyLCBtb3VzZVk/OiBudW1iZXIpOiB2b2lkID0+IHtcclxuXHRpZiAoIXJ1bm5pbmcgfHwgIXRhcmdldENvb3JkcyB8fCBjaGFuZ2luZ0NhbSkgcmV0dXJuO1xyXG5cclxuXHRtb3VzZVggPSBtb3VzZVggPz8gMC4wO1xyXG5cdG1vdXNlWSA9IG1vdXNlWSA/PyAwLjA7XHJcblxyXG5cdGFuZ2xlWiAtPSBtb3VzZVg7XHJcblx0YW5nbGVZICs9IG1vdXNlWTtcclxuXHJcbiAgICBjb25zdCBpc0hlYWRPcldob2xlID0gY3VycmVudEJvbmUgPT09ICd3aG9sZScgfHwgY3VycmVudEJvbmUgPT09ICdoZWFkJztcclxuICAgIGNvbnN0IG1heEFuZ2xlID0gaXNIZWFkT3JXaG9sZSA/IDg5LjAgOiA3MC4wO1xyXG4gICAgXHJcbiAgICBjb25zdCBpc1Nob2VzID0gY3VycmVudEJvbmUgPT09ICdzaG9lcyc7XHJcbiAgICBjb25zdCBtaW5BbmdsZSA9IGlzU2hvZXMgPyA1LjAgOiAtMjAuMDtcclxuXHJcblx0YW5nbGVZID0gTWF0aC5taW4oTWF0aC5tYXgoYW5nbGVZLCBtaW5BbmdsZSksIG1heEFuZ2xlKTtcclxuXHJcblx0Y29uc3QgW3gsIHksIHpdID0gZ2V0QW5nbGVzKCk7XHJcblxyXG5cdFNldENhbUNvb3JkKFxyXG5cdFx0Y2FtLFxyXG5cdFx0dGFyZ2V0Q29vcmRzLnggKyB4LFxyXG5cdFx0dGFyZ2V0Q29vcmRzLnkgKyB5LFxyXG5cdFx0dGFyZ2V0Q29vcmRzLnogKyB6XHJcblx0KTtcclxuXHRQb2ludENhbUF0Q29vcmQoY2FtLCB0YXJnZXRDb29yZHMueCwgdGFyZ2V0Q29vcmRzLnksIHRhcmdldENvb3Jkcy56KTtcclxufTtcclxuXHJcbmNvbnN0IG1vdmVDYW1lcmEgPSBhc3luYyAoY29vcmRzOiBWZWN0b3IzLCBkaXN0YW5jZT86IG51bWJlcikgPT4ge1xyXG5cdGNvbnN0IGhlYWRpbmc6IG51bWJlciA9IEdldEVudGl0eUhlYWRpbmcocGVkKSArIDk0O1xyXG5cdGRpc3RhbmNlID0gZGlzdGFuY2UgPz8gMS4wO1xyXG5cclxuXHRjaGFuZ2luZ0NhbSA9IHRydWU7XHJcblx0Y2FtRGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuXHRhbmdsZVogPSBoZWFkaW5nO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKTtcclxuXHJcblx0Y29uc3QgbmV3Y2FtOiBDYW1lcmEgPSBDcmVhdGVDYW1XaXRoUGFyYW1zKFxyXG5cdFx0J0RFRkFVTFRfU0NSSVBURURfQ0FNRVJBJyxcclxuXHRcdGNvb3Jkcy54ICsgeCxcclxuXHRcdGNvb3Jkcy55ICsgeSxcclxuXHRcdGNvb3Jkcy56ICsgeixcclxuXHRcdDAuMCxcclxuXHRcdDAuMCxcclxuXHRcdDAuMCxcclxuXHRcdDcwLjAsXHJcblx0XHRmYWxzZSxcclxuXHRcdDBcclxuXHQpO1xyXG5cclxuXHR0YXJnZXRDb29yZHMgPSBjb29yZHM7XHJcblx0Y2hhbmdpbmdDYW0gPSBmYWxzZTtcclxuXHRvbGRDYW0gPSBjYW07XHJcblx0Y2FtID0gbmV3Y2FtO1xyXG5cclxuXHRQb2ludENhbUF0Q29vcmQobmV3Y2FtLCBjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56KTtcclxuXHRTZXRDYW1BY3RpdmVXaXRoSW50ZXJwKG5ld2NhbSwgb2xkQ2FtLCAyNTAsIDAsIDApO1xyXG5cclxuXHRhd2FpdCBkZWxheSgyNTApO1xyXG5cclxuXHRTZXRDYW1Vc2VTaGFsbG93RG9mTW9kZShuZXdjYW0sIHRydWUpO1xyXG5cdFNldENhbU5lYXJEb2YobmV3Y2FtLCAwLjQpO1xyXG5cdFNldENhbUZhckRvZihuZXdjYW0sIDEuMik7XHJcblx0U2V0Q2FtRG9mU3RyZW5ndGgobmV3Y2FtLCAwLjMpO1xyXG5cdHVzZUhpRG9mKG5ld2NhbSk7XHJcblxyXG5cdERlc3Ryb3lDYW0ob2xkQ2FtLCB0cnVlKTtcclxufTtcclxuXHJcbmNvbnN0IHVzZUhpRG9mID0gKGN1cnJlbnRjYW06IENhbWVyYSkgPT4ge1xyXG5cdGlmICghKERvZXNDYW1FeGlzdChjYW0pICYmIGN1cnJlbnRjYW0gPT0gY2FtKSkgcmV0dXJuO1xyXG5cdFNldFVzZUhpRG9mKCk7XHJcblx0c2V0VGltZW91dCh1c2VIaURvZiwgMCk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc3RhcnRDYW1lcmEgPSAoKSA9PiB7XHJcblx0aWYgKHJ1bm5pbmcpIHJldHVybjtcclxuXHRydW5uaW5nID0gdHJ1ZTtcclxuXHRjYW1EaXN0YW5jZSA9IFdIT0xFX0JPRFlfTUFYX0RJU1RBTkNFXHJcblx0Y2FtID0gQ3JlYXRlQ2FtKCdERUZBVUxUX1NDUklQVEVEX0NBTUVSQScsIHRydWUpO1xyXG5cdGNvbnN0IFt4LCB5LCB6XTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgMzEwODYsIDAuMCwgMC4wLCAwLjApO1xyXG5cdFNldENhbUNvb3JkKGNhbSwgeCwgeSwgeik7XHJcblx0UmVuZGVyU2NyaXB0Q2Ftcyh0cnVlLCB0cnVlLCAxMDAwLCB0cnVlLCB0cnVlKTtcclxuXHQvLyBtb3ZlQ2FtZXJhKHsgeDogeCwgeTogeSwgejogeiB9LCBjYW1EaXN0YW5jZSk7XHJcbiAgICBzZXRDYW1lcmEoJ3dob2xlJywgY2FtRGlzdGFuY2UpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0b3BDYW1lcmEgPSAoKTogdm9pZCA9PiB7XHJcblx0aWYgKCFydW5uaW5nKSByZXR1cm47XHJcblx0cnVubmluZyA9IGZhbHNlO1xyXG5cclxuXHRSZW5kZXJTY3JpcHRDYW1zKGZhbHNlLCB0cnVlLCAyNTAsIHRydWUsIGZhbHNlKTtcclxuXHREZXN0cm95Q2FtKGNhbSwgdHJ1ZSk7XHJcblx0Y2FtID0gbnVsbDtcclxuXHR0YXJnZXRDb29yZHMgPSBudWxsO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtZXJhID0gKHR5cGU/OiBrZXlvZiBUQ2FtZXJhQm9uZXMsIGRpc3RhbmNlID0gY2FtRGlzdGFuY2UpOiB2b2lkID0+IHtcclxuXHJcblx0Y29uc3QgYm9uZTogbnVtYmVyIHwgbnVtYmVyW10gfCB1bmRlZmluZWQgPSBDYW1lcmFCb25lc1t0eXBlXTtcclxuXHJcbiAgICBjb25zdCBpc0JvbmVBcnJheSA9IEFycmF5LmlzQXJyYXkoYm9uZSlcclxuXHJcbiAgICBjdXJyZW50Qm9uZSA9IHR5cGU7XHJcblxyXG4gICAgaWYgKCFpc0JvbmVBcnJheSAmJiBib25lID09PSAwKSB7XHJcbiAgICAgICAgY29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldEVudGl0eUNvb3JkcyhwZWQsIGZhbHNlKTtcclxuICAgICAgICBtb3ZlQ2FtZXJhKFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgICAgeTogeSxcclxuICAgICAgICAgICAgICAgIHo6IHogKyAwLjAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRpc3RhbmNlXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgaXRzIG5vdCB3aG9sZSBib2R5LCB0aGVuIHdlIG5lZWQgdG8gbGltaXQgdGhlIGRpc3RhbmNlXHJcbiAgICBpZiAoZGlzdGFuY2UgPiBERUZBVUxUX01BWF9ESVNUQU5DRSkgZGlzdGFuY2UgPSBERUZBVUxUX01BWF9ESVNUQU5DRTtcclxuXHJcbiAgICBpZiAoaXNCb25lQXJyYXkpIHtcclxuICAgICAgICBjb25zdCBbeDEsIHkxLCB6MV06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmVbMF0sIDAuMCwgMC4wLCAwLjApXHJcblxyXG4gICAgICAgIGNvbnN0IFt4MiwgeTIsIHoyXTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZVsxXSwgMC4wLCAwLjAsIDAuMClcclxuXHJcbiAgICAgICAgLy8gZ2V0IHRoZSBtaWRkbGUgb2YgdGhlIHR3byBwb2ludHNcclxuICAgICAgICB2YXIgeCA9ICh4MSArIHgyKSAvIDI7XHJcbiAgICAgICAgdmFyIHkgPSAoeTEgKyB5MikgLyAyO1xyXG4gICAgICAgIHZhciB6ID0gKHoxICsgejIpIC8gMjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIFt4LCB5LCB6XTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZSwgMC4wLCAwLjAsIDAuMClcclxuICAgIH1cclxuXHJcblx0bW92ZUNhbWVyYShcclxuXHRcdHtcclxuXHRcdFx0eDogeCxcclxuXHRcdFx0eTogeSxcclxuXHRcdFx0ejogeiArIDAuMCxcclxuXHRcdH0sXHJcblx0XHRkaXN0YW5jZVxyXG5cdCk7XHJcblxyXG59O1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbU1vdmUsIChkYXRhLCBjYikgPT4ge1xyXG4gICAgc2V0Q2FtUG9zaXRpb24oZGF0YS54LCBkYXRhLnkpO1xyXG4gICAgY2IoMSk7XHJcbn0pO1xyXG5cclxudHlwZSBUU2VjdGlvbiA9ICd3aG9sZScgfCAnaGVhZCcgfCAndG9yc28nIHwgJ2xlZ3MnIHwgJ3Nob2VzJztcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1TZWN0aW9uLCAodHlwZTogVFNlY3Rpb24sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ3dob2xlJzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCd3aG9sZScsIFdIT0xFX0JPRFlfTUFYX0RJU1RBTkNFKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnaGVhZCc6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgnaGVhZCcpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICd0b3Jzbyc6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgndG9yc28nKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbGVncyc6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgnbGVncycpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdzaG9lcyc6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgnc2hvZXMnKTtcclxuICAgICAgICAgICAgc2V0Q2FtUG9zaXRpb24oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblx0fVxyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1ab29tLCAoZGF0YSwgY2IpID0+IHtcclxuXHRpZiAoZGF0YSA9PT0gJ2Rvd24nKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IG1heFpvb20gPSBjdXJyZW50Qm9uZSA9PT0gJ3dob2xlJyA/IFdIT0xFX0JPRFlfTUFYX0RJU1RBTkNFIDogREVGQVVMVF9NQVhfRElTVEFOQ0U7XHJcblxyXG5cdFx0Y29uc3QgbmV3RGlzdGFuY2U6IG51bWJlciA9IGNhbURpc3RhbmNlICsgMC4wNTtcclxuXHRcdGNhbURpc3RhbmNlID0gbmV3RGlzdGFuY2UgPj0gbWF4Wm9vbSA/IG1heFpvb20gOiBuZXdEaXN0YW5jZTtcclxuXHR9IGVsc2UgaWYgKGRhdGEgPT09ICd1cCcpIHtcclxuXHRcdGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSAtIDAuMDU7XHJcblx0XHRjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlIDw9IDAuMyA/IDAuMyA6IG5ld0Rpc3RhbmNlO1xyXG5cdH1cclxuXHJcblx0Y2FtRGlzdGFuY2UgPSBjYW1EaXN0YW5jZTtcclxuXHRzZXRDYW1Qb3NpdGlvbigpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcIkJsZW1pc2hlc1wiLFxuICAgIFwiRmFjaWFsSGFpclwiLFxuICAgIFwiRXllYnJvd3NcIixcbiAgICBcIkFnZWluZ1wiLFxuICAgIFwiTWFrZXVwXCIsXG4gICAgXCJCbHVzaFwiLFxuICAgIFwiQ29tcGxleGlvblwiLFxuICAgIFwiU3VuRGFtYWdlXCIsXG4gICAgXCJMaXBzdGlja1wiLFxuICAgIFwiTW9sZXNGcmVja2xlc1wiLFxuICAgIFwiQ2hlc3RIYWlyXCIsXG4gICAgXCJCb2R5QmxlbWlzaGVzXCIsXG4gICAgXCJBZGRCb2R5QmxlbWlzaGVzXCIsXG4gICAgXCJFeWVDb2xvclwiXG5dXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiTm9zZV9XaWR0aFwiLFxuICAgIFwiTm9zZV9QZWFrX0hlaWdodFwiLFxuICAgIFwiTm9zZV9QZWFrX0xlbmdodFwiLFxuICAgIFwiTm9zZV9Cb25lX0hlaWdodFwiLFxuICAgIFwiTm9zZV9QZWFrX0xvd2VyaW5nXCIsXG4gICAgXCJOb3NlX0JvbmVfVHdpc3RcIixcbiAgICBcIkV5ZUJyb3duX0hlaWdodFwiLFxuICAgIFwiRXllQnJvd25fRm9yd2FyZFwiLFxuICAgIFwiQ2hlZWtzX0JvbmVfSGlnaFwiLFxuICAgIFwiQ2hlZWtzX0JvbmVfV2lkdGhcIixcbiAgICBcIkNoZWVrc19XaWR0aFwiLFxuICAgIFwiRXllc19PcGVubmluZ1wiLFxuICAgIFwiTGlwc19UaGlja25lc3NcIixcbiAgICBcIkphd19Cb25lX1dpZHRoXCIsXG4gICAgXCJKYXdfQm9uZV9CYWNrX0xlbmdodFwiLFxuICAgIFwiQ2hpbl9Cb25lX0xvd2VyaW5nXCIsXG4gICAgXCJDaGluX0JvbmVfTGVuZ3RoXCIsXG4gICAgXCJDaGluX0JvbmVfV2lkdGhcIixcbiAgICBcIkNoaW5fSG9sZVwiLFxuICAgIFwiTmVja19UaGlrbmVzc1wiXG5dXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiZmFjZVwiLFxuICAgIFwibWFza3NcIixcbiAgICBcImhhaXJcIixcbiAgICBcInRvcnNvc1wiLFxuICAgIFwibGVnc1wiLFxuICAgIFwiYmFnc1wiLFxuICAgIFwic2hvZXNcIixcbiAgICBcIm5lY2tcIixcbiAgICBcInNoaXJ0c1wiLFxuICAgIFwidmVzdFwiLFxuICAgIFwiZGVjYWxzXCIsXG4gICAgXCJqYWNrZXRzXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJoYXRzXCIsXG4gICAgXCJnbGFzc2VzXCIsXG4gICAgXCJlYXJyaW5nc1wiLFxuICAgIFwibW91dGhcIixcbiAgICBcImxoYW5kXCIsXG4gICAgXCJyaGFuZFwiLFxuICAgIFwid2F0Y2hlc1wiLFxuICAgIFwiYnJhY2VsZXRzXCJcbl1cbiIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSwgVEhhaXJEYXRhLCBUSGVhZE92ZXJsYXksIFRIZWFkT3ZlcmxheVRvdGFsLCBUQ2xvdGhlcywgVFNraW4gfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCBIRUFEX09WRVJMQVlTIGZyb20gXCJAZGF0YS9oZWFkXCJcclxuaW1wb3J0IEZBQ0VfRkVBVFVSRVMgZnJvbSBcIkBkYXRhL2ZhY2VcIlxyXG5pbXBvcnQgRFJBV0FCTEVfTkFNRVMgZnJvbSBcIkBkYXRhL2RyYXdhYmxlc1wiXHJcbmltcG9ydCBQUk9QX05BTUVTIGZyb20gXCJAZGF0YS9wcm9wc1wiXHJcbmltcG9ydCB7IHBlZCwgb25TZXJ2ZXJDYWxsYmFjayB9IGZyb20gJ0B1dGlscyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZE1vZGVsSW5kZXgodGFyZ2V0OiBudW1iZXIpIHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZVxyXG4gICAgY29uc3QgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcblxyXG4gICAgcmV0dXJuIG1vZGVscy5maW5kSW5kZXgoKG1vZGVsOiBzdHJpbmcpID0+IEdldEhhc2hLZXkobW9kZWwpID09PSB0YXJnZXQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIYWlyKHBlZEhhbmRsZTogbnVtYmVyKTogVEhhaXJEYXRhIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29sb3I6IEdldFBlZEhhaXJDb2xvcihwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhpZ2hsaWdodDogR2V0UGVkSGFpckhpZ2hsaWdodENvbG9yKHBlZEhhbmRsZSlcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRCbGVuZERhdGEocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9wZWRyMGZvbnRvdXJhL2ZpdmVtLWFwcGVhcmFuY2UvYmxvYi9tYWluL2dhbWUvc3JjL2NsaWVudC9pbmRleC50cyNMNjdcclxuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcig4MCk7XHJcbiAgICBnbG9iYWwuQ2l0aXplbi5pbnZva2VOYXRpdmUoJzB4Mjc0NmJkOWQ4OGM1YzVkMCcsIHBlZEhhbmRsZSwgbmV3IFVpbnQzMkFycmF5KGJ1ZmZlcikpO1xyXG5cclxuICAgIGNvbnN0IHsgMDogc2hhcGVGaXJzdCwgMjogc2hhcGVTZWNvbmQsIDQ6IHNoYXBlVGhpcmQsIDY6IHNraW5GaXJzdCwgODogc2tpblNlY29uZCwgMTg6IGhhc1BhcmVudCwgMTA6IHNraW5UaGlyZCB9ID0gbmV3IFVpbnQzMkFycmF5KGJ1ZmZlcik7XHJcbiAgICBjb25zdCB7IDA6IHNoYXBlTWl4LCAyOiBza2luTWl4LCA0OiB0aGlyZE1peCB9ID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXIsIDQ4KTtcclxuXHJcbiAgICAvKiAgIFxyXG4gICAgICAgIDA6IHNoYXBlRmlyc3QsXHJcbiAgICAgICAgMjogc2hhcGVTZWNvbmQsXHJcbiAgICAgICAgNDogc2hhcGVUaGlyZCxcclxuICAgICAgICA2OiBza2luRmlyc3QsXHJcbiAgICAgICAgODogc2tpblNlY29uZCxcclxuICAgICAgICAxMDogc2tpblRoaXJkLFxyXG4gICAgICAgIDE4OiBoYXNQYXJlbnQsXHJcbiAgICAqL1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzaGFwZUZpcnN0LCAgIC8vIGZhdGhlclxyXG4gICAgICAgIHNoYXBlU2Vjb25kLCAvLyBtb3RoZXJcclxuICAgICAgICBzaGFwZVRoaXJkLFxyXG5cclxuICAgICAgICBza2luRmlyc3QsXHJcbiAgICAgICAgc2tpblNlY29uZCxcclxuICAgICAgICBza2luVGhpcmQsXHJcblxyXG4gICAgICAgIHNoYXBlTWl4LCAvLyByZXNlbWJsYW5jZVxyXG5cclxuICAgICAgICB0aGlyZE1peCxcclxuICAgICAgICBza2luTWl4LCAgIC8vIHNraW5wZXJjZW50XHJcblxyXG4gICAgICAgIGhhc1BhcmVudDogQm9vbGVhbihoYXNQYXJlbnQpLFxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRPdmVybGF5KHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgdG90YWxzOiBUSGVhZE92ZXJsYXlUb3RhbCA9IHt9O1xyXG4gICAgbGV0IGhlYWREYXRhOiBUSGVhZE92ZXJsYXkgPSB7fTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEhFQURfT1ZFUkxBWVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gSEVBRF9PVkVSTEFZU1tpXTtcclxuICAgICAgICB0b3RhbHNbb3ZlcmxheV0gPSBHZXROdW1IZWFkT3ZlcmxheVZhbHVlcyhpKTtcclxuXHJcbiAgICAgICAgaWYgKG92ZXJsYXkgPT09IFwiRXllQ29sb3JcIikge1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5VmFsdWU6IEdldFBlZEV5ZUNvbG9yKHBlZEhhbmRsZSlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBbXywgb3ZlcmxheVZhbHVlLCBjb2xvdXJUeXBlLCBmaXJzdENvbG9yLCBzZWNvbmRDb2xvciwgb3ZlcmxheU9wYWNpdHldID0gR2V0UGVkSGVhZE92ZXJsYXlEYXRhKHBlZEhhbmRsZSwgaSk7XHJcbiAgICAgICAgICAgIGhlYWREYXRhW292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogb3ZlcmxheVZhbHVlID09PSAyNTUgPyAtMSA6IG92ZXJsYXlWYWx1ZSxcclxuICAgICAgICAgICAgICAgIGNvbG91clR5cGU6IGNvbG91clR5cGUsXHJcbiAgICAgICAgICAgICAgICBmaXJzdENvbG9yOiBmaXJzdENvbG9yLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kQ29sb3I6IHNlY29uZENvbG9yLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheU9wYWNpdHk6IG92ZXJsYXlPcGFjaXR5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbaGVhZERhdGEsIHRvdGFsc107XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBwZWRNb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuXHJcbiAgICBpZiAocGVkTW9kZWwgIT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpICYmIHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKSkgcmV0dXJuXHJcblxyXG4gICAgbGV0IGZhY2VTdHJ1Y3QgPSB7fVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBGQUNFX0ZFQVRVUkVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEZBQ0VfRkVBVFVSRVNbaV1cclxuICAgICAgICBmYWNlU3RydWN0W292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWRGYWNlRmVhdHVyZShwZWRIYW5kbGUsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWNlU3RydWN0XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXREcmF3YWJsZXMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBkcmF3YWJsZXMgPSB7fVxyXG4gICAgbGV0IHRvdGFsRHJhd2FibGVzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IERSQVdBQkxFX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IERSQVdBQkxFX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxEcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRUZXh0dXJlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtkcmF3YWJsZXMsIHRvdGFsRHJhd2FibGVzXVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcHMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBwcm9wcyA9IHt9XHJcbiAgICBsZXQgdG90YWxQcm9wcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBQUk9QX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IFBST1BfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxQcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWRQcm9wRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFByb3BUZXh0dXJlSW5kZXgocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3Byb3BzLCB0b3RhbFByb3BzXVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwcGVhcmFuY2UocGVkSGFuZGxlOiBudW1iZXIpOiBQcm9taXNlPFRBcHBlYXJhbmNlPiB7XHJcbiAgICBjb25zdCBbaGVhZERhdGEsIHRvdGFsc10gPSBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbZHJhd2FibGVzLCBkcmF3VG90YWxdID0gZ2V0RHJhd2FibGVzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtwcm9wcywgcHJvcFRvdGFsXSA9IGdldFByb3BzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IG1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkSGFuZGxlKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbW9kZWxJbmRleDogZmluZE1vZGVsSW5kZXgobW9kZWwpLFxyXG4gICAgICAgIG1vZGVsOiBtb2RlbCxcclxuICAgICAgICBoYWlyQ29sb3I6IGdldEhhaXIocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEgYXMgVEhlYWRPdmVybGF5LFxyXG4gICAgICAgIGhlYWRPdmVybGF5VG90YWw6IHRvdGFscyBhcyBUSGVhZE92ZXJsYXlUb3RhbCxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZSksXHJcbiAgICAgICAgZHJhd2FibGVzOiBkcmF3YWJsZXMsXHJcbiAgICAgICAgcHJvcHM6IHByb3BzLFxyXG4gICAgICAgIGRyYXdUb3RhbDogZHJhd1RvdGFsLFxyXG4gICAgICAgIHByb3BUb3RhbDogcHJvcFRvdGFsLFxyXG4gICAgICAgIHRhdHRvb3M6IFtdXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldEFwcGVhcmFuY2VcIiwgZ2V0QXBwZWFyYW5jZSlcclxub25TZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6Z2V0QXBwZWFyYW5jZScsICgpID0+IHtcclxuICAgIHJldHVybiBnZXRBcHBlYXJhbmNlKHBlZCB8fCBQbGF5ZXJQZWRJZCgpKVxyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQZWRDbG90aGVzKHBlZEhhbmRsZTogbnVtYmVyKTogVENsb3RoZXMge1xyXG4gICAgY29uc3QgW2RyYXdhYmxlc10gPSBnZXREcmF3YWJsZXMocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW3Byb3BzXSA9IGdldFByb3BzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtoZWFkRGF0YV0gPSBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEgYXMgVEhlYWRPdmVybGF5LFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkQ2xvdGhlc1wiLCBnZXRQZWRDbG90aGVzKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBlZFNraW4ocGVkSGFuZGxlOiBudW1iZXIpOiBUU2tpbiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGhlYWRCbGVuZDogZ2V0SGVhZEJsZW5kRGF0YShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhlYWRTdHJ1Y3R1cmU6IGdldEhlYWRTdHJ1Y3R1cmUocGVkSGFuZGxlKSxcclxuICAgICAgICBoYWlyQ29sb3I6IGdldEhhaXIocGVkSGFuZGxlKSxcclxuICAgICAgICBtb2RlbDogR2V0RW50aXR5TW9kZWwocGVkSGFuZGxlKVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRQZWRTa2luXCIsIGdldFBlZFNraW4pXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGF0dG9vRGF0YSgpIHtcclxuICAgIGxldCB0YXR0b29ab25lcyA9IFtdXHJcblxyXG4gICAgY29uc3QgW1RBVFRPT19MSVNULCBUQVRUT09fQ0FURUdPUklFU10gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UudGF0dG9vcygpXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFRBVFRPT19DQVRFR09SSUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBUQVRUT09fQ0FURUdPUklFU1tpXVxyXG4gICAgICAgIGNvbnN0IHpvbmUgPSBjYXRlZ29yeS56b25lXHJcbiAgICAgICAgY29uc3QgbGFiZWwgPSBjYXRlZ29yeS5sYWJlbFxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gY2F0ZWdvcnkuaW5kZXhcclxuICAgICAgICB0YXR0b29ab25lc1tpbmRleF0gPSB7XHJcbiAgICAgICAgICAgIHpvbmU6IHpvbmUsXHJcbiAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcclxuICAgICAgICAgICAgem9uZUluZGV4OiBpbmRleCxcclxuICAgICAgICAgICAgZGxjczogW11cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgZGxjRGF0YSA9IFRBVFRPT19MSVNUW2pdXHJcbiAgICAgICAgICAgIHRhdHRvb1pvbmVzW2luZGV4XS5kbGNzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGRsY0RhdGEuZGxjLFxyXG4gICAgICAgICAgICAgICAgZGxjSW5kZXg6IGosXHJcbiAgICAgICAgICAgICAgICB0YXR0b29zOiBbXVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0ZlbWFsZSA9IEdldEVudGl0eU1vZGVsKHBlZCkgPT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fTElTVC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBUQVRUT09fTElTVFtpXVxyXG4gICAgICAgIGNvbnN0IHsgZGxjLCB0YXR0b29zIH0gPSBkYXRhXHJcbiAgICAgICAgY29uc3QgZGxjSGFzaCA9IEdldEhhc2hLZXkoZGxjKVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGF0dG9vcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gdGF0dG9vc1tqXVxyXG4gICAgICAgICAgICBsZXQgdGF0dG9vID0gbnVsbFxyXG5cclxuICAgICAgICAgICAgY29uc3QgbG93ZXJUYXR0b28gPSB0YXR0b29EYXRhLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgY29uc3QgaXNGZW1hbGVUYXR0b28gPSBsb3dlclRhdHRvby5pbmNsdWRlcyhcIl9mXCIpXHJcbiAgICAgICAgICAgIGlmIChpc0ZlbWFsZVRhdHRvbyAmJiBpc0ZlbWFsZSkge1xyXG4gICAgICAgICAgICAgICAgdGF0dG9vID0gdGF0dG9vRGF0YVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0ZlbWFsZVRhdHRvbyAmJiAhaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGhhc2ggPSBudWxsXHJcbiAgICAgICAgICAgIGxldCB6b25lID0gLTFcclxuXHJcbiAgICAgICAgICAgIGlmICh0YXR0b28pIHtcclxuICAgICAgICAgICAgICAgIGhhc2ggPSBHZXRIYXNoS2V5KHRhdHRvbylcclxuICAgICAgICAgICAgICAgIHpvbmUgPSBHZXRQZWREZWNvcmF0aW9uWm9uZUZyb21IYXNoZXMoZGxjSGFzaCwgaGFzaClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHpvbmUgIT09IC0xICYmIGhhc2gpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHpvbmVUYXR0b29zID0gdGF0dG9vWm9uZXNbem9uZV0uZGxjc1tpXS50YXR0b29zXHJcblxyXG4gICAgICAgICAgICAgICAgem9uZVRhdHRvb3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRhdHRvbyxcclxuICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvbmU6IHpvbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGxjOiBkbGMsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YXR0b29ab25lc1xyXG59XHJcblxyXG4vL21pZ3JhdGlvblxyXG5cclxub25TZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6bWlncmF0aW9uOnNldEFwcGVhcmFuY2UnLCAoZGF0YToge3R5cGU6IHN0cmluZywgZGF0YTogYW55fSkgPT4ge1xyXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gJ2ZpdmVtJykgZXhwb3J0c1snZml2ZW0tYXBwZWFyYW5jZSddLnNldFBsYXllckFwcGVhcmFuY2UoZGF0YS5kYXRhKVxyXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gJ2lsbGVuaXVtJykgZXhwb3J0c1snaWxsZW5pdW0tYXBwZWFyYW5jZSddLnNldFBsYXllckFwcGVhcmFuY2UoZGF0YS5kYXRhKVxyXG59KTsiLCAiZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgaGF0czoge1xyXG4gICAgICAgIHR5cGU6IFwicHJvcFwiLFxyXG4gICAgICAgIGluZGV4OiAwLFxyXG4gICAgfSxcclxuICAgIGdsYXNzZXM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgIH0sXHJcbiAgICBtYXNrczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgICAgICBvZmY6IDAsXHJcbiAgICB9LFxyXG4gICAgc2hpcnRzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA4LFxyXG4gICAgICAgIG9mZjogMTUsXHJcbiAgICAgICAgaG9vazoge1xyXG4gICAgICAgICAgICBkcmF3YWJsZXM6IFtcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAzLCB2YXJpYW50OiAxNSwgdGV4dHVyZTogMCwgaWQ6ICd0b3Jzb3MnIH0sXHJcbiAgICAgICAgICAgICAgICB7IGNvbXBvbmVudDogOCwgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAnc2hpcnRzJyB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgamFja2V0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMTEsXHJcbiAgICAgICAgb2ZmOiAxNSxcclxuICAgICAgICBob29rOiB7XHJcbiAgICAgICAgICAgIGRyYXdhYmxlczogW1xyXG4gICAgICAgICAgICAgICAgeyBjb21wb25lbnQ6IDMsIHZhcmlhbnQ6IDE1LCB0ZXh0dXJlOiAwLCBpZDogJ3RvcnNvcycgfSxcclxuICAgICAgICAgICAgICAgIHsgY29tcG9uZW50OiAxMSwgdmFyaWFudDogMTUsIHRleHR1cmU6IDAsIGlkOiAnamFja2V0cycgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHZlc3Q6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDksXHJcbiAgICAgICAgb2ZmOiAwLFxyXG4gICAgfSxcclxuICAgIGxlZ3M6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDQsXHJcbiAgICAgICAgb2ZmOiAxOCxcclxuICAgIH0sXHJcbiAgICBzaG9lczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogNixcclxuICAgICAgICBvZmY6IDM0LFxyXG4gICAgfVxyXG59IiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUSGFpckNvbG9yLCBUQ2xvdGhlcywgVFNraW4sIFRWYWx1ZSB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCI7XHJcbmltcG9ydCBUT0dHTEVfSU5ERVhFUyBmcm9tIFwiQGRhdGEvdG9nZ2xlc1wiXHJcbmltcG9ydCB7IHJlcXVlc3RNb2RlbCwgcGVkLCB1cGRhdGVQZWQsIGRlbGF5fSBmcm9tICdAdXRpbHMnO1xyXG5pbXBvcnQgeyBUVGF0dG9vIH0gZnJvbSBcIkB0eXBpbmdzL3RhdHRvb3NcIjtcclxuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcImNvbnNvbGVcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXREcmF3YWJsZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlLCBkYXRhLnRleHR1cmUsIDApXHJcbiAgICByZXR1cm4gR2V0TnVtYmVyT2ZQZWRUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQcm9wKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIGlmIChkYXRhLnZhbHVlID09PSAtMSkge1xyXG4gICAgICAgIENsZWFyUGVkUHJvcChwZWRIYW5kbGUsIGRhdGEuaW5kZXgpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgU2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCBmYWxzZSlcclxuICAgIHJldHVybiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpXHJcbn1cclxuXHJcbmNvbnN0IGRlZk1hbGVIYXNoID0gR2V0SGFzaEtleShcIm1wX21fZnJlZW1vZGVfMDFcIilcclxuXHJcblxyXG4vLyBUaGlzIG5lZWRzIHRvIHJldHVybiB0aGUgcGVkIGhhbmRsZSBiZWNhdXNlIHRoZSBwZWRJZCBpcyBiZWluZyBjaGFuZ2VkXHJcbmV4cG9ydCBjb25zdCBzZXRNb2RlbCA9IGFzeW5jIChwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVEFwcGVhcmFuY2UgfCBUU2tpbiB8IG51bWJlciB8IHN0cmluZykgPT4ge1xyXG4gICAgbGV0IG1vZGVsOiBudW1iZXIgPSAwXHJcblxyXG5cclxuICAgIGlmIChkYXRhID09IG51bGwgfHwgZGF0YSA9PSB1bmRlZmluZWQpIHJldHVyblxyXG5cclxuICAgIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnXHJcbiAgICBjb25zdCBpc051bWJlciA9IHR5cGVvZiBkYXRhID09PSAnbnVtYmVyJ1xyXG4gICAgY29uc3QgaXNKdXN0TW9kZWwgPSBpc1N0cmluZyB8fCBpc051bWJlclxyXG5cclxuICAgIC8vIENoaWxsLCBUUyBpcyBub3Qgc21hcnQgYW5kIGRvZXNudCBsZXQgbWUgdXNlIHRoZSBpc1N0cmluZyB8fCBpc051bWJlciBjaGVjayB3aXRob3V0IGNyeWluZ1xyXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIG1vZGVsID0gR2V0SGFzaEtleShkYXRhKVxyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICBtb2RlbCA9IGRhdGFcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbW9kZWwgPSBkYXRhLm1vZGVsIC8vZGF0YS5tb2RlbCBzaG91bGQgYmUgYSBoYXNoIGhlcmVcclxuICAgIH1cclxuXHJcbiAgICBpZiAobW9kZWwgPT0gbnVsbCB8fCBtb2RlbCA9PSB1bmRlZmluZWQpIHJldHVyblxyXG5cclxuICAgIGNvbnN0IGlzUGxheWVyID0gSXNQZWRBUGxheWVyKHBlZEhhbmRsZSlcclxuXHJcbiAgICBpZiAoaXNQbGF5ZXIpIHtcclxuICAgICAgICBtb2RlbCA9IG1vZGVsICE9PSAwID8gbW9kZWwgOiBkZWZNYWxlSGFzaFxyXG4gICAgICAgIGF3YWl0IHJlcXVlc3RNb2RlbChtb2RlbClcclxuICAgICAgICBTZXRQbGF5ZXJNb2RlbChQbGF5ZXJJZCgpLCBtb2RlbClcclxuICAgICAgICBTZXRNb2RlbEFzTm9Mb25nZXJOZWVkZWQobW9kZWwpXHJcbiAgICAgICAgcGVkSGFuZGxlID0gUGxheWVyUGVkSWQoKVxyXG4gICAgfVxyXG5cclxuICAgIFNldFBlZERlZmF1bHRDb21wb25lbnRWYXJpYXRpb24ocGVkSGFuZGxlKVxyXG5cclxuICAgIC8vIENoaWxsLCBUUyBpcyBub3Qgc21hcnQgYW5kIGRvZXNudCBsZXQgbWUgdXNlIHRoZSBpc1N0cmluZyB8fCBpc051bWJlciBjaGVjayB3aXRob3V0IGNyeWluZ1xyXG4gICAgaWYgKHR5cGVvZiBkYXRhICE9PSAnc3RyaW5nJyAmJiB0eXBlb2YgZGF0YSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgICBpZiAoZGF0YS5oZWFkQmxlbmQpIHtcclxuICAgICAgICAgICAgaWYgKCFpc0p1c3RNb2RlbCAmJiBPYmplY3Qua2V5cyhkYXRhLmhlYWRCbGVuZCkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGVhZEJsZW5kID0gZGF0YS5oZWFkQmxlbmRcclxuICAgICAgICAgICAgICAgIHNldEhlYWRCbGVuZChwZWRIYW5kbGUsIGhlYWRCbGVuZClcclxuICAgICAgICAgICAgICAgIFNldFBlZEhlYWRCbGVuZERhdGEocGVkSGFuZGxlLCAwLCAwLCAwLCAwLCAwLCAwLCAwLjAsIDAuMCwgMC4wLCBmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gXHJcbiAgICBcclxuICAgIHJldHVybiBwZWRIYW5kbGVcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFNldEZhY2VGZWF0dXJlKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIFNldFBlZEZhY2VGZWF0dXJlKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSArIDAuMClcclxufVxyXG5cclxuY29uc3QgaXNQb3NpdGl2ZSA9ICh2YWw6IG51bWJlcikgPT4gdmFsID49IDAgPyB2YWwgOiAwXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0SGVhZEJsZW5kKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBwZWRIYW5kbGUgPSBwZWRIYW5kbGUgfHwgcGVkXHJcblxyXG4gICAgY29uc3Qgc2hhcGVGaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZUZpcnN0KVxyXG4gICAgY29uc3Qgc2hhcGVTZWNvbmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVTZWNvbmQpXHJcbiAgICBjb25zdCBzaGFwZVRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlVGhpcmQpXHJcbiAgICBjb25zdCBza2luRmlyc3QgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpbkZpcnN0KVxyXG4gICAgY29uc3Qgc2tpblNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5za2luU2Vjb25kKVxyXG4gICAgY29uc3Qgc2tpblRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNraW5UaGlyZClcclxuICAgIGNvbnN0IHNoYXBlTWl4ID0gZGF0YS5zaGFwZU1peCArIDAuMFxyXG4gICAgY29uc3Qgc2tpbk1peCA9IGRhdGEuc2tpbk1peCArIDAuMFxyXG4gICAgY29uc3QgdGhpcmRNaXggPSBkYXRhLnRoaXJkTWl4ICsgMC4wXHJcbiAgICBjb25zdCBoYXNQYXJlbnQgPSBkYXRhLmhhc1BhcmVudFxyXG5cclxuICAgIFNldFBlZEhlYWRCbGVuZERhdGEocGVkSGFuZGxlLCBzaGFwZUZpcnN0LCBzaGFwZVNlY29uZCwgc2hhcGVUaGlyZCwgc2tpbkZpcnN0LCBza2luU2Vjb25kLCBza2luVGhpcmQsIHNoYXBlTWl4LCBza2luTWl4LCB0aGlyZE1peCwgaGFzUGFyZW50KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIGNvbnN0IGluZGV4ID0gZGF0YS5pbmRleFxyXG5cclxuICAgIGlmIChpbmRleCA9PT0gMTMpIHtcclxuICAgICAgICBTZXRQZWRFeWVDb2xvcihwZWRIYW5kbGUsIGRhdGEudmFsdWUpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmFsdWUgPSBkYXRhLm92ZXJsYXlWYWx1ZVxyXG5cclxuICAgIC8qIEhhaXIgY29sb3IgZG9lcyBub3QgaGF2ZSBhbiBpbmRleCwgb25seSBhbiBJRCBzbyB3ZSdsbCBjaGVjayBmb3IgdGhhdCAqL1xyXG4gICAgaWYgKGRhdGEuaWQgPT09ICdoYWlyQ29sb3InKSB7XHJcbiAgICAgICAgU2V0UGVkSGFpclRpbnQocGVkSGFuZGxlLCBkYXRhLmhhaXJDb2xvciwgZGF0YS5oYWlySGlnaGxpZ2h0KVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBTZXRQZWRIZWFkT3ZlcmxheShwZWRIYW5kbGUsIGluZGV4LCB2YWx1ZSwgZGF0YS5vdmVybGF5T3BhY2l0eSArIDAuMClcclxuICAgIFNldFBlZEhlYWRPdmVybGF5Q29sb3IocGVkSGFuZGxlLCBpbmRleCwgMSwgZGF0YS5maXJzdENvbG9yLCBkYXRhLnNlY29uZENvbG9yKVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0VG9nZ2xlcyhkYXRhKSB7XHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcblxyXG4gICAgZm9yIChjb25zdCBbdG9nZ2xlSXRlbSwgdG9nZ2xlRGF0YV0gb2YgT2JqZWN0LmVudHJpZXMoVE9HR0xFX0lOREVYRVMpKSB7XHJcbiAgICAgICAgY29uc3QgdG9nZ2xlVHlwZSA9IHRvZ2dsZURhdGEudHlwZVxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdG9nZ2xlRGF0YS5pbmRleFxyXG5cclxuICAgICAgICBpZiAodG9nZ2xlVHlwZSA9PT0gXCJkcmF3YWJsZVwiICYmIGRyYXdhYmxlc1t0b2dnbGVJdGVtXSkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudERyYXdhYmxlICE9PSBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHRvZ2dsZVR5cGUgPT09IFwicHJvcFwiICYmIHByb3BzW3RvZ2dsZUl0ZW1dKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UHJvcCAhPT0gcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZFByb3BJbmRleChwZWQsIGluZGV4LCBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgZmFsc2UpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRDbG90aGVzKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUQ2xvdGhlcykge1xyXG4gICAgY29uc3QgZHJhd2FibGVzID0gZGF0YS5kcmF3YWJsZXNcclxuICAgIGNvbnN0IHByb3BzID0gZGF0YS5wcm9wc1xyXG4gICAgY29uc3QgaGVhZE92ZXJsYXkgPSBkYXRhLmhlYWRPdmVybGF5XHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIGRyYXdhYmxlcykge1xyXG4gICAgICAgIGNvbnN0IGRyYXdhYmxlID0gZHJhd2FibGVzW2lkXVxyXG4gICAgICAgIHNldERyYXdhYmxlKHBlZEhhbmRsZSwgZHJhd2FibGUpXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBwcm9wcykge1xyXG4gICAgICAgIGNvbnN0IHByb3AgPSBwcm9wc1tpZF1cclxuICAgICAgICBzZXRQcm9wKHBlZEhhbmRsZSwgcHJvcClcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIGhlYWRPdmVybGF5KSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IGhlYWRPdmVybGF5W2lkXVxyXG4gICAgICAgIHNldEhlYWRPdmVybGF5KHBlZEhhbmRsZSwgb3ZlcmxheSlcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHNldFBlZFNraW4gPSBhc3luYyAocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRTa2luKSA9PiB7XHJcbiAgICBjb25zdCBoZWFkU3RydWN0dXJlID0gZGF0YS5oZWFkU3RydWN0dXJlXHJcbiAgICBjb25zdCBoZWFkQmxlbmQgPSBkYXRhLmhlYWRCbGVuZFxyXG5cclxuICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgcGVkSGFuZGxlID0gYXdhaXQgc2V0TW9kZWwocGVkSGFuZGxlLCBkYXRhKVxyXG4gICAgfVxyXG4gICAgICAgIFxyXG5cclxuICAgIGlmIChoZWFkQmxlbmQpIHNldEhlYWRCbGVuZChwZWRIYW5kbGUsIGhlYWRCbGVuZClcclxuICAgIFxyXG4gICAgaWYgKGhlYWRTdHJ1Y3R1cmUpIGZvciAoY29uc3QgZmVhdHVyZSBpbiBoZWFkU3RydWN0dXJlKSB7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSBoZWFkU3RydWN0dXJlW2ZlYXR1cmVdXHJcbiAgICAgICAgU2V0RmFjZUZlYXR1cmUocGVkSGFuZGxlLCB2YWx1ZSlcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZFRhdHRvb3MocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRUYXR0b29bXSkge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm5cclxuXHJcbiAgICBDbGVhclBlZERlY29yYXRpb25zTGVhdmVTY2FycyhwZWRIYW5kbGUpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IGRhdGFbaV0udGF0dG9vXHJcbiAgICAgICAgaWYgKHRhdHRvb0RhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IEdldEhhc2hLZXkodGF0dG9vRGF0YS5kbGMpXHJcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvbyA9IHRhdHRvb0RhdGEuaGFzaFxyXG4gICAgICAgICAgICBBZGRQZWREZWNvcmF0aW9uRnJvbUhhc2hlcyhwZWRIYW5kbGUsIGNvbGxlY3Rpb24sIHRhdHRvbylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRIYWlyQ29sb3JzKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUSGFpckNvbG9yKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVyblxyXG4gICAgY29uc3QgY29sb3IgPSBkYXRhLmNvbG9yXHJcbiAgICBjb25zdCBoaWdobGlnaHQgPSBkYXRhLmhpZ2hsaWdodFxyXG4gICAgU2V0UGVkSGFpckNvbG9yKHBlZEhhbmRsZSwgY29sb3IsIGhpZ2hsaWdodClcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBlZEFwcGVhcmFuY2UocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRBcHBlYXJhbmNlKSB7XHJcbiAgICBpZiAoSXNQZWRBUGxheWVyKHBlZEhhbmRsZSkpIHtcclxuICAgICAgICBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGRhdGEpXHJcbiAgICB9XHJcbiAgICBhd2FpdCBzZXRQZWRTa2luKHBlZEhhbmRsZSwgZGF0YSlcclxuICAgIHNldFBlZENsb3RoZXMocGVkSGFuZGxlLCBkYXRhKVxyXG4gICAgc2V0UGVkSGFpckNvbG9ycyhwZWRIYW5kbGUsIGRhdGEuaGFpckNvbG9yKVxyXG4gICAgc2V0UGVkVGF0dG9vcyhwZWRIYW5kbGUsIGRhdGEudGF0dG9vcylcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBsYXllclBlZEFwcGVhcmFuY2UoZGF0YTogVEFwcGVhcmFuY2UpIHtcclxuICAgIGF3YWl0IHNldFBlZFNraW4ocGVkLCBkYXRhKVxyXG4gICAgdXBkYXRlUGVkKFBsYXllclBlZElkKCkpXHJcbiAgICBzZXRQZWRDbG90aGVzKHBlZCwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMocGVkLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MocGVkLCBkYXRhLnRhdHRvb3MpXHJcbn1cclxuXHJcbmV4cG9ydHMoJ1NldFBlZENsb3RoZXMnLCBzZXRQZWRDbG90aGVzKVxyXG5leHBvcnRzKCdTZXRQZWRTa2luJywgc2V0UGVkU2tpbilcclxuZXhwb3J0cygnU2V0UGVkVGF0dG9vcycsIHNldFBlZFRhdHRvb3MpXHJcbmV4cG9ydHMoJ1NldFBlZEhhaXJDb2xvcnMnLCBzZXRQZWRIYWlyQ29sb3JzKSIsICJpbXBvcnQgeyBSZWNlaXZlIH0gZnJvbSAnQGV2ZW50cyc7XHJcbmltcG9ydCB7XHJcblx0cmVzZXRUb2dnbGVzLFxyXG5cdHNldERyYXdhYmxlLFxyXG5cdFNldEZhY2VGZWF0dXJlLFxyXG5cdHNldEhlYWRCbGVuZCxcclxuXHRzZXRIZWFkT3ZlcmxheSxcclxuXHRzZXRNb2RlbCxcclxuXHRzZXRQZWRDbG90aGVzLFxyXG5cdHNldFBlZFRhdHRvb3MsXHJcblx0c2V0UGxheWVyUGVkQXBwZWFyYW5jZSxcclxuXHRzZXRQcm9wLFxyXG59IGZyb20gJy4vYXBwZWFyYW5jZS9zZXR0ZXJzJztcclxuaW1wb3J0IHsgY2xvc2VNZW51IH0gZnJvbSAnLi9tZW51JztcclxuaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRUb2dnbGVEYXRhLCBUVmFsdWUgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgZGVsYXksIGdldEZyYW1ld29ya0lELCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIHBlZCwgdXBkYXRlUGVkIH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0VGF0dG9vRGF0YSB9IGZyb20gJy4vYXBwZWFyYW5jZS9nZXR0ZXJzJztcclxuaW1wb3J0IFRPR0dMRV9JTkRFWEVTIGZyb20gJ0BkYXRhL3RvZ2dsZXMnO1xyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tICdAdHlwaW5ncy9vdXRmaXRzJztcclxuaW1wb3J0IHsgVFRhdHRvbyB9IGZyb20gJ0B0eXBpbmdzL3RhdHRvb3MnO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbmNlbCwgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpO1xyXG5cdGNsb3NlTWVudSgpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zYXZlLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHJlc2V0VG9nZ2xlcyhhcHBlYXJhbmNlKTtcclxuXHJcblx0YXdhaXQgZGVsYXkoMTAwKTtcclxuXHJcblx0Y29uc3QgbmV3QXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkKTtcclxuXHRuZXdBcHBlYXJhbmNlLnRhdHRvb3MgPSBhcHBlYXJhbmNlLnRhdHRvb3M7XHJcblx0dHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlQXBwZWFyYW5jZScsIGdldEZyYW1ld29ya0lEKCksIG5ld0FwcGVhcmFuY2UpO1xyXG5cclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgbmV3QXBwZWFyYW5jZS50YXR0b29zKTtcclxuXHJcblx0Y2xvc2VNZW51KCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldE1vZGVsLCBhc3luYyAobW9kZWw6IHN0cmluZywgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgaGFzaCA9IEdldEhhc2hLZXkobW9kZWwpO1xyXG5cdGlmICghSXNNb2RlbEluQ2RpbWFnZShoYXNoKSB8fCAhSXNNb2RlbFZhbGlkKGhhc2gpKSB7XHJcblx0XHRyZXR1cm4gY2IoMCk7XHJcblx0fVxyXG5cclxuXHJcblx0Y29uc3QgbmV3UGVkID0gYXdhaXQgc2V0TW9kZWwocGVkLCBoYXNoKTtcclxuXHJcbiAgICB1cGRhdGVQZWQobmV3UGVkKVxyXG5cclxuXHRjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cclxuXHRhcHBlYXJhbmNlLnRhdHRvb3MgPSBbXTtcclxuXHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIFtdKTtcclxuXHJcblx0Y2IoYXBwZWFyYW5jZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmdldE1vZGVsVGF0dG9vcywgYXN5bmMgKF86IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgdGF0dG9vcyA9IGdldFRhdHRvb0RhdGEoKTtcclxuXHJcblx0Y2IodGF0dG9vcyk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRTdHJ1Y3R1cmUsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdFNldEZhY2VGZWF0dXJlKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRPdmVybGF5LCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRIZWFkT3ZlcmxheShwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRIZWFkQmxlbmQsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldEhlYWRCbGVuZChwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRUYXR0b29zLCBhc3luYyAoZGF0YTogVFRhdHRvb1tdLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFByb3AsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGxldCB0ZXh0dXJlID0gc2V0UHJvcChwZWQsIGRhdGEpO1xyXG5cdGNiKHRleHR1cmUpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXREcmF3YWJsZSwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0bGV0IHRleHR1cmUgPSBzZXREcmF3YWJsZShwZWQsIGRhdGEpO1xyXG5cdGNiKHRleHR1cmUpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS50b2dnbGVJdGVtLCBhc3luYyAoZGF0YTogVFRvZ2dsZURhdGEsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGl0ZW0gPSBUT0dHTEVfSU5ERVhFU1tkYXRhLml0ZW1dO1xyXG5cdGlmICghaXRlbSkgcmV0dXJuIGNiKGZhbHNlKTtcclxuXHJcblx0Y29uc3QgY3VycmVudCA9IGRhdGEuZGF0YTtcclxuXHRjb25zdCB0eXBlID0gaXRlbS50eXBlO1xyXG5cdGNvbnN0IGluZGV4ID0gaXRlbS5pbmRleDtcclxuXHRjb25zdCBob29rID0gaXRlbS5ob29rO1xyXG5cdGNvbnN0IGhvb2tEYXRhID0gZGF0YS5ob29rRGF0YTtcclxuXHJcblx0aWYgKCFjdXJyZW50KSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRpZiAodHlwZSA9PT0gJ3Byb3AnKSB7XHJcblx0XHRjb25zdCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KTtcclxuXHJcblx0XHRpZiAoY3VycmVudFByb3AgPT09IC0xKSB7XHJcblx0XHRcdHNldFByb3AocGVkLCBjdXJyZW50KTtcclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRDbGVhclBlZFByb3AocGVkLCBpbmRleCk7XHJcblx0XHRcdGNiKHRydWUpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fSBlbHNlIGlmICh0eXBlID09PSAnZHJhd2FibGUnKSB7XHJcblx0XHRjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KTtcclxuXHJcblx0XHRpZiAoY3VycmVudC52YWx1ZSA9PT0gaXRlbS5vZmYpIHtcclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGN1cnJlbnQudmFsdWUgPT09IGN1cnJlbnREcmF3YWJsZSkge1xyXG5cdFx0XHRTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgaXRlbS5vZmYsIDAsIDApO1xyXG5cdFx0XHRpZiAoaG9vaykge1xyXG5cdFx0XHRcdGZvcihsZXQgaT0wOyBpIDwgaG9vay5kcmF3YWJsZXM/Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRjb25zdCBob29rSXRlbSA9IGhvb2suZHJhd2FibGVzW2ldO1xyXG5cdFx0XHRcdFx0U2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaG9va0l0ZW0uY29tcG9uZW50LCBob29rSXRlbS52YXJpYW50LCBob29rSXRlbS50ZXh0dXJlLCAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Y2IodHJ1ZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHNldERyYXdhYmxlKHBlZCwgY3VycmVudCk7XHJcblx0XHRcdGZvcihsZXQgaT0wOyBpIDwgaG9va0RhdGE/Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0c2V0RHJhd2FibGUocGVkLCBob29rRGF0YVtpXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2F2ZU91dGZpdCwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmRlbGV0ZU91dGZpdCwgYXN5bmMgKHtpZH0sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpkZWxldGVPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGlkKTtcclxuXHRjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5yZW5hbWVPdXRmaXQsIGFzeW5jIChkYXRhOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZW5hbWVPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnVzZU91dGZpdCwgYXN5bmMgKG91dGZpdDogT3V0Zml0LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQZWRDbG90aGVzKHBlZCwgb3V0Zml0KTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuaW1wb3J0T3V0Zml0LCBhc3luYyAoeyBpZCwgb3V0Zml0TmFtZSB9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6aW1wb3J0T3V0Zml0JywgZnJhbWV3b3JrZElkLCBpZCwgb3V0Zml0TmFtZSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZ3JhYk91dGZpdCwgYXN5bmMgKHsgaWQgfSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpncmFiT3V0Zml0JywgaWQpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLml0ZW1PdXRmaXQsIGFzeW5jIChkYXRhOiB7b3V0Zml0OiBPdXRmaXQsIGxhYmVsOiBzdHJpbmd9LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOml0ZW1PdXRmaXQnLGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxub25OZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnVzZU91dGZpdCcsIChvdXRmaXQ6IE91dGZpdCkgPT4ge1xyXG5cdHNldFBlZENsb3RoZXMocGVkLCBvdXRmaXQpO1xyXG59KSIsICJpbXBvcnQgeyBnZXRGcmFtZXdvcmtJRCwgcmVxdWVzdExvY2FsZSwgc2VuZE5VSUV2ZW50LCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIHVwZGF0ZVBlZCwgcGVkLCBnZXRQbGF5ZXJEYXRhLCBnZXRKb2JJbmZvLCBnZXRQbGF5ZXJHZW5kZXJNb2RlbCB9IGZyb20gXCJAdXRpbHNcIlxyXG5pbXBvcnQgeyBzdGFydENhbWVyYSwgc3RvcENhbWVyYSB9IGZyb20gXCIuL2NhbWVyYVwiXHJcbmltcG9ydCB0eXBlIHsgVEFwcGVhcmFuY2Vab25lIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tIFwiQHR5cGluZ3Mvb3V0Zml0c1wiXHJcbmltcG9ydCB7IFNlbmQgfSBmcm9tIFwiQGV2ZW50c1wiXHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldFRhdHRvb0RhdGEgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL2dldHRlcnNcIlxyXG5pbXBvcnQgXCIuL2hhbmRsZXJzXCJcclxuaW1wb3J0IHsgc2V0TW9kZWwgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxyXG5cclxuY29uc3QgY29uZmlnID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlXHJcbmxldCBhcm1vdXIgPSAwXHJcbmxldCBvcGVuID0gZmFsc2VcclxuXHJcbmxldCByZXNvbHZlUHJvbWlzZSA9IG51bGw7XHJcbmxldCBwcm9taXNlID0gbnVsbDtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuTWVudSh6b25lOiBUQXBwZWFyYW5jZVpvbmUsIGNyZWF0aW9uOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgIGlmICh6b25lID09PSBudWxsIHx8IG9wZW4pIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBlZEhhbmRsZSA9IFBsYXllclBlZElkKClcclxuICAgIGNvbnN0IGNvbmZpZ01lbnVzID0gY29uZmlnLm1lbnVzKClcclxuXHJcbiAgICBjb25zdCB0eXBlID0gem9uZS50eXBlXHJcblxyXG4gICAgY29uc3QgbWVudSA9IGNvbmZpZ01lbnVzW3R5cGVdXHJcbiAgICBpZiAoIW1lbnUpIHJldHVyblxyXG5cclxuICAgIHVwZGF0ZVBlZChwZWRIYW5kbGUpXHJcblxyXG5cclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKClcclxuICAgIGNvbnN0IHRhYnMgPSBtZW51LnRhYnNcclxuICAgIGxldCBhbGxvd0V4aXQgPSBjcmVhdGlvbiA/IGZhbHNlIDogbWVudS5hbGxvd0V4aXRcclxuXHJcbiAgICBhcm1vdXIgPSBHZXRQZWRBcm1vdXIocGVkSGFuZGxlKVxyXG5cclxuICAgIGxldCBvdXRmaXRzID0gW11cclxuXHJcbiAgICBjb25zdCBoYXNPdXRmaXRUYWIgPSB0YWJzLmluY2x1ZGVzKCdvdXRmaXRzJylcclxuICAgIGlmIChoYXNPdXRmaXRUYWIpIG91dGZpdHMgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8T3V0Zml0W10+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRPdXRmaXRzJywgZnJhbWV3b3JrZElkKSBhcyBPdXRmaXRbXVxyXG5cclxuICAgIGxldCBtb2RlbHMgPSBbXVxyXG5cclxuICAgIGNvbnN0IGhhc0hlcml0YWdlVGFiID0gdGFicy5pbmNsdWRlcygnaGVyaXRhZ2UnKVxyXG4gICAgaWYgKGhhc0hlcml0YWdlVGFiKSB7XHJcbiAgICAgICAgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaGFzVGF0dG9vVGFiID0gdGFicy5pbmNsdWRlcygndGF0dG9vcycpXHJcbiAgICBsZXQgdGF0dG9vc1xyXG4gICAgaWYgKGhhc1RhdHRvb1RhYikge1xyXG4gICAgICAgIHRhdHRvb3MgPSBnZXRUYXR0b29EYXRhKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBibGFja2xpc3QgPSBnZXRCbGFja2xpc3Qoem9uZSlcclxuXHJcbiAgICBpZiAoY3JlYXRpb24pIHtcclxuICAgICAgICBjb25zdCBtb2RlbCA9IEdldEhhc2hLZXkoZ2V0UGxheWVyR2VuZGVyTW9kZWwoKSk7XHJcbiAgICAgICAgcGVkSGFuZGxlID0gYXdhaXQgc2V0TW9kZWwocGVkSGFuZGxlLCBtb2RlbCk7XHJcbiAgICAgICAgZW1pdE5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2V0cm91dGluZ2J1Y2tldCcpXHJcbiAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHVwZGF0ZVBlZChwZWRIYW5kbGUpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkSGFuZGxlKVxyXG5cclxuXHJcblxyXG4gICAgc3RhcnRDYW1lcmEoKVxyXG5cclxuICAgIHNlbmROVUlFdmVudChTZW5kLmRhdGEsIHtcclxuICAgICAgICB0YWJzLFxyXG4gICAgICAgIGFwcGVhcmFuY2UsXHJcbiAgICAgICAgYmxhY2tsaXN0LFxyXG4gICAgICAgIHRhdHRvb3MsXHJcbiAgICAgICAgb3V0Zml0cyxcclxuICAgICAgICBtb2RlbHMsXHJcbiAgICAgICAgYWxsb3dFeGl0LFxyXG4gICAgICAgIGpvYjogZ2V0Sm9iSW5mbygpLFxyXG4gICAgICAgIGxvY2FsZTogYXdhaXQgcmVxdWVzdExvY2FsZSgnbG9jYWxlJylcclxuICAgIH0pXHJcbiAgICBTZXROdWlGb2N1cyh0cnVlLCB0cnVlKVxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQudmlzaWJsZSwgdHJ1ZSlcclxuICAgIG9wZW4gPSB0cnVlXHJcblxyXG4gICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmhpZGVIdWQodHJ1ZSlcclxuXHJcbiAgICBpZiAocHJvbWlzZSkge1xyXG4gICAgICAgIGF3YWl0IHByb21pc2VcclxuICAgICAgICBlbWl0TmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZXNldHJvdXRpbmdidWNrZXQnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm9taXNlID0gbnVsbDtcclxuICAgIHJlc29sdmVQcm9taXNlID0gbnVsbDtcclxuICAgIHJldHVybiB0cnVlXHJcbn1cclxuXHJcbmV4cG9ydHMoJ29wZW5NZW51Jywgb3Blbk1lbnUpXHJcblxyXG5mdW5jdGlvbiBnZXRCbGFja2xpc3Qoem9uZTogVEFwcGVhcmFuY2Vab25lKSB7XHJcbiAgICBpZiAoIXpvbmUpIHJldHVybiB7fVxyXG5cclxuICAgIGNvbnN0IHtncm91cFR5cGVzLCBiYXNlfSA9IGNvbmZpZy5ibGFja2xpc3QoKVxyXG5cclxuICAgIGlmICghZ3JvdXBUeXBlcykgcmV0dXJuIHt9XHJcbiAgICBpZiAoIWJhc2UpIHJldHVybiB7fVxyXG5cclxuICAgIGxldCBibGFja2xpc3QgPSB7Li4uYmFzZX1cclxuXHJcbiAgICBjb25zdCBwbGF5ZXJEYXRhID0gZ2V0UGxheWVyRGF0YSgpXHJcblxyXG5cclxuICAgIGZvciAoY29uc3QgdHlwZSBpbiBncm91cFR5cGVzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBzID0gZ3JvdXBUeXBlc1t0eXBlXVxyXG4gICAgICAgIGZvciAoY29uc3QgZ3JvdXAgaW4gZ3JvdXBzKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgc2tpcDogYm9vbGVhbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodHlwZSA9PSAnam9icycgJiYgem9uZS5qb2JzKSB7XHJcbiAgICAgICAgICAgICAgICBza2lwID0gem9uZS5qb2JzLmluY2x1ZGVzKHBsYXllckRhdGEuam9iLm5hbWUpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09ICdnYW5ncycgJiYgem9uZS5nYW5ncykge1xyXG4gICAgICAgICAgICAgICAgc2tpcCA9IHpvbmUuZ2FuZ3MuaW5jbHVkZXMocGxheWVyRGF0YS5nYW5nLm5hbWUpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmICh0eXBlID09ICdncm91cHMnICYmIHpvbmUuZ3JvdXBzKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBza2lwID0gIXpvbmUuZ3JvdXBzLmluY2x1ZGVzKHBsYXllckRhdGEuZ3JvdXAubmFtZSlcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFza2lwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBncm91cEJsYWNrbGlzdCA9IGdyb3Vwc1tncm91cF1cclxuICAgICAgICAgICAgICAgIGJsYWNrbGlzdCA9IE9iamVjdC5hc3NpZ24oe30sIGJsYWNrbGlzdCwgZ3JvdXBCbGFja2xpc3QsIHtcclxuICAgICAgICAgICAgICAgICAgZHJhd2FibGVzOiBPYmplY3QuYXNzaWduKHt9LCBibGFja2xpc3QuZHJhd2FibGVzLCBncm91cEJsYWNrbGlzdC5kcmF3YWJsZXMpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBibGFja2xpc3RcclxuXHJcbiAgICAvLyByZXR1cm4gYmxhY2tsaXN0XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9zZU1lbnUoKSB7XHJcbiAgICBTZXRQZWRBcm1vdXIocGVkLCBhcm1vdXIpXHJcblxyXG4gICAgc3RvcENhbWVyYSgpXHJcbiAgICBTZXROdWlGb2N1cyhmYWxzZSwgZmFsc2UpXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC52aXNpYmxlLCBmYWxzZSlcclxuXHJcblxyXG4gICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmhpZGVIdWQoZmFsc2UpXHJcblxyXG4gICAgaWYgKHJlc29sdmVQcm9taXNlKSB7XHJcbiAgICAgICAgcmVzb2x2ZVByb21pc2UoKTtcclxuICAgIH1cclxuICAgIG9wZW4gPSBmYWxzZVxyXG59XHJcbiIsICJcbmltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxuaW1wb3J0IHsgc2V0UGVkQXBwZWFyYW5jZSB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxuaW1wb3J0IHsgb3Blbk1lbnUgfSBmcm9tIFwiLi4vbWVudVwiXG5cbmV4cG9ydCBmdW5jdGlvbiBRQkJyaWRnZSgpIHtcbiAgICBvbk5ldCgncWItY2xvdGhpbmc6Y2xpZW50OmxvYWRQbGF5ZXJDbG90aGluZycsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgcGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgYXdhaXQgc2V0UGVkQXBwZWFyYW5jZShwZWQsIGFwcGVhcmFuY2UpXG4gICAgfSlcblxuICAgIG9uTmV0KCdxYi1jbG90aGVzOmNsaWVudDpDcmVhdGVGaXJzdENoYXJhY3RlcicsICgpID0+IHtcbiAgICAgICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkluaXRpYWxDcmVhdGlvbigpXG4gICAgfSlcblxuICAgIG9uTmV0KCdxYi1jbG90aGluZzpjbGllbnQ6b3Blbk91dGZpdE1lbnUnLCAoKSA9PiB7XG4gICAgICAgIG9wZW5NZW51KHsgdHlwZTogXCJvdXRmaXRzXCIsIGNvb3JkczogWzAsIDAsIDAsIDBdIH0pICBcbiAgICB9KVxufSIsICJcbmltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxuaW1wb3J0IHsgc2V0UGVkQXBwZWFyYW5jZSwgc2V0UGxheWVyUGVkQXBwZWFyYW5jZSB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxuaW1wb3J0IHsgZ2V0RnJhbWV3b3JrSUQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayB9IGZyb20gXCJAdXRpbHNcIlxuXG5leHBvcnQgZnVuY3Rpb24gRVNYQnJpZGdlKCkge1xuICAgIGxldCBmaXJzdFNwYXduID0gZmFsc2VcblxuICAgIG9uKFwiZXN4X3NraW46cmVzZXRGaXJzdFNwYXduXCIsICgpID0+IHtcbiAgICAgICAgZmlyc3RTcGF3biA9IHRydWVcbiAgICB9KTtcblxuICAgIG9uKFwiZXN4X3NraW46cGxheWVyUmVnaXN0ZXJlZFwiLCAoKSA9PiB7XG4gICAgICAgIGlmKGZpcnN0U3Bhd24pXG4gICAgICAgICAgICBleHBvcnRzLmJsX2FwcGVhcmFuY2UuSW5pdGlhbENyZWF0aW9uKClcbiAgICB9KTtcblxuICAgIG9uTmV0KCdza2luY2hhbmdlcjpsb2FkU2tpbjInLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmICghYXBwZWFyYW5jZS5tb2RlbCkgYXBwZWFyYW5jZS5tb2RlbCA9IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpO1xuICAgICAgICBhd2FpdCBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcbiAgICB9KTtcblxuICAgIG9uTmV0KCdza2luY2hhbmdlcjpnZXRTa2luJywgYXN5bmMgKGNiOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXG4gICAgICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXG4gICAgICAgIGNiKGFwcGVhcmFuY2UpXG4gICAgfSlcblxuICAgIG9uTmV0KCdza2luY2hhbmdlcjpsb2FkU2tpbicsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IGFueSkgPT4ge1xuICAgICAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXG4gICAgICAgIGlmIChjYikgY2IoKVxuICAgIH0pXG5cbiAgICBvbk5ldCgnZXN4X3NraW46b3BlblNhdmVhYmxlTWVudScsIGFzeW5jIChvblN1Ym1pdDogYW55KSA9PiB7XG4gICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24ob25TdWJtaXQpXG4gICAgfSlcbn0iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiO1xuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0RHJhd2FibGVzLCBnZXRQcm9wcyB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL2dldHRlcnNcIjtcbmltcG9ydCB7IHNldERyYXdhYmxlLCBzZXRNb2RlbCwgc2V0UGVkQXBwZWFyYW5jZSwgc2V0UGVkVGF0dG9vcywgc2V0UHJvcCB9IGZyb20gXCIuLi9hcHBlYXJhbmNlL3NldHRlcnNcIjtcbmltcG9ydCB7IFRUYXR0b28gfSBmcm9tIFwiQHR5cGluZ3MvdGF0dG9vc1wiO1xuXG5mdW5jdGlvbiBleHBvcnRIYW5kbGVyKG5hbWU6IHN0cmluZywgY2I6IGFueSkge1xuICAgIG9uKCdfX2NmeF9leHBvcnRfaWxsZW5pdW0tYXBwZWFyYW5jZV8nICsgbmFtZSwgKHNldENCOiBhbnkpID0+IHtcbiAgICAgICAgc2V0Q0IoY2IpO1xuICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbGxlbml1bUNvbXBhdCgpIHtcbiAgICBleHBvcnRIYW5kbGVyKCdzdGFydFBsYXllckN1c3RvbWl6YXRpb24nLCAoKSA9PiB7XG4gICAgICAgIGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5Jbml0aWFsQ3JlYXRpb24oKVxuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkTW9kZWwnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIEdldEVudGl0eU1vZGVsKHBlZClcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZENvbXBvbmVudHMnLCAocGVkOiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgZHJhd2FibGVzOiBhbnkgPSBnZXREcmF3YWJsZXMocGVkKVswXTtcbiAgICAgICAgbGV0IG5ld2RyYXdhYmxlID0gW107XG4gICAgICAgIGZvciAoY29uc3QgaWQgb2YgZHJhd2FibGVzKSB7XG4gICAgICAgICAgICBjb25zdCBkcmF3YWJsZSA9IGRyYXdhYmxlc1tpZF07XG4gICAgICAgICAgICBuZXdkcmF3YWJsZS5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRfaWQ6IGRyYXdhYmxlLmluZGV4LFxuICAgICAgICAgICAgICAgIGRyYXdhYmxlOiBkcmF3YWJsZS52YWx1ZSxcbiAgICAgICAgICAgICAgICB0ZXh0dXJlOiBkcmF3YWJsZS50ZXh0dXJlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRQcm9wcycsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBwcm9wczogYW55ID0gIGdldFByb3BzKHBlZClbMF07XG4gICAgICAgIGxldCBuZXdQcm9wcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIHByb3BzKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9wID0gcHJvcHNbaWRdO1xuICAgICAgICAgICAgbmV3UHJvcHMucHVzaCh7XG4gICAgICAgICAgICAgICAgcHJvcF9pZDogcHJvcC5pbmRleCxcbiAgICAgICAgICAgICAgICBkcmF3YWJsZTogcHJvcC52YWx1ZSxcbiAgICAgICAgICAgICAgICB0ZXh0dXJlOiBwcm9wLnRleHR1cmVcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEhlYWRCbGVuZCcsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgICAgIC8vcmV0dXJuIGdldEhlYWRCbGVuZERhdGEocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEZhY2VGZWF0dXJlcycsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgICAgIC8vcmV0dXJuIGdldEhlYWRTdHJ1Y3R1cmUocGVkKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ2dldFBlZEhlYWRPdmVybGF5cycsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgICAgIC8vcmV0dXJuIGdldEhlYWRPdmVybGF5KHBlZCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdnZXRQZWRIYWlyJywgKHBlZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIC8vcmV0dXJuIGdldEhhaXIocGVkKTtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignZ2V0UGVkQXBwZWFyYW5jZScsIChwZWQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0QXBwZWFyYW5jZShwZWQpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGxheWVyTW9kZWwnLCAobW9kZWw6IG51bWJlcikgPT4ge1xuICAgICAgICBzZXRNb2RlbChQbGF5ZXJQZWRJZCgpLCBtb2RlbCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRIZWFkQmxlbmQnLCAocGVkOiBudW1iZXIsIGJsZW5kOiBhbnkpID0+IHtcbiAgICAgICAgLy9zZXRIZWFkQmxlbmQocGVkLCBibGVuZCk7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1lvdSBTdGlsbCBjYW5ub3QgdXNlIHRoaXMgZnVuY3Rpb24nKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZEZhY2VGZWF0dXJlcycsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkSGVhZE92ZXJsYXlzJywgKHBlZDogbnVtYmVyLCBvdmVybGF5OiBhbnkpID0+IHtcbiAgICAgICAgLy9zZXRIZWFkT3ZlcmxheShwZWQsIG92ZXJsYXkpO1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRIYWlyJywgYXN5bmMgKHBlZDogbnVtYmVyLCBoYWlyOiBhbnksIHRhdHRvbzogYW55KSA9PiB7XG4gICAgICAgIC8vc2V0UGVkSGFpckNvbG9ycyhwZWQsIGhhaXIpO1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdZb3UgU3RpbGwgY2Fubm90IHVzZSB0aGlzIGZ1bmN0aW9uJyk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRFeWVDb2xvcicsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignWW91IFN0aWxsIGNhbm5vdCB1c2UgdGhpcyBmdW5jdGlvbicpO1xuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkQ29tcG9uZW50JywgKHBlZDogbnVtYmVyLCBkcmF3YWJsZTogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld0RyYXdhYmxlID0ge1xuICAgICAgICAgICAgaW5kZXg6IGRyYXdhYmxlLmNvbXBvbmVudF9pZCxcbiAgICAgICAgICAgIHZhbHVlOiBkcmF3YWJsZS5kcmF3YWJsZSxcbiAgICAgICAgICAgIHRleHR1cmU6IGRyYXdhYmxlLnRleHR1cmVcbiAgICAgICAgfVxuICAgICAgICBzZXREcmF3YWJsZShwZWQsIG5ld0RyYXdhYmxlKTtcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZENvbXBvbmVudHMnLCAocGVkOiBudW1iZXIsIGNvbXBvbmVudHM6IGFueSkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IGNvbXBvbmVudCBvZiBjb21wb25lbnRzKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdEcmF3YWJsZSA9IHtcbiAgICAgICAgICAgICAgICBpbmRleDogY29tcG9uZW50LmNvbXBvbmVudF9pZCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogY29tcG9uZW50LmRyYXdhYmxlLFxuICAgICAgICAgICAgICAgIHRleHR1cmU6IGNvbXBvbmVudC50ZXh0dXJlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXREcmF3YWJsZShwZWQsIG5ld0RyYXdhYmxlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZXhwb3J0SGFuZGxlcignc2V0UGVkUHJvcCcsIChwZWQ6IG51bWJlciwgcHJvcDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1Byb3AgPSB7XG4gICAgICAgICAgICBpbmRleDogcHJvcC5wcm9wX2lkLFxuICAgICAgICAgICAgdmFsdWU6IHByb3AuZHJhd2FibGUsXG4gICAgICAgICAgICB0ZXh0dXJlOiBwcm9wLnRleHR1cmVcbiAgICAgICAgfVxuICAgICAgICBzZXRQcm9wKHBlZCwgbmV3UHJvcCk7XG4gICAgfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRQcm9wcycsIChwZWQ6IG51bWJlciwgcHJvcHM6IGFueSkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHByb3Agb2YgcHJvcHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Byb3AgPSB7XG4gICAgICAgICAgICAgICAgaW5kZXg6IHByb3AucHJvcF9pZCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcC5kcmF3YWJsZSxcbiAgICAgICAgICAgICAgICB0ZXh0dXJlOiBwcm9wLnRleHR1cmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldFByb3AocGVkLCBuZXdQcm9wKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gZXhwb3J0SGFuZGxlcignc2V0UGxheWVyQXBwZWFyYW5jZScsIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSkgPT4ge1xuICAgIC8vICAgICByZXR1cm4gY29uc29sZS53YXJuKCdOZWVkIHRvIGJlIGltcGxlbWVudGVkJyk7XG4gICAgLy8gfSk7XG5cbiAgICBleHBvcnRIYW5kbGVyKCdzZXRQZWRBcHBlYXJhbmNlJywgKHBlZDogbnVtYmVyLCBhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSkgPT4ge1xuICAgICAgICBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcbiAgICB9KTtcblxuICAgIGV4cG9ydEhhbmRsZXIoJ3NldFBlZFRhdHRvb3MnLCAocGVkOiBudW1iZXIsIHRhdHRvb3M6IFRUYXR0b29bXSkgPT4ge1xuICAgICAgICBzZXRQZWRUYXR0b29zKHBlZCwgdGF0dG9vcylcbiAgICB9KTtcbn0iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRBcHBlYXJhbmNlWm9uZSwgVE1lbnVUeXBlcyB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IHsgb3Blbk1lbnUgfSBmcm9tIFwiLi9tZW51XCJcclxuaW1wb3J0IHsgc2V0UGVkQXBwZWFyYW5jZSwgc2V0UGxheWVyUGVkQXBwZWFyYW5jZSB9IGZyb20gXCIuL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXHJcbmltcG9ydCB7IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaywgZ2V0RnJhbWV3b3JrSUQsIERlbGF5LCBibF9icmlkZ2UsIHBlZCwgZGVsYXksIGZvcm1hdCB9IGZyb20gXCJAdXRpbHNcIlxyXG5pbXBvcnQgeyBRQkJyaWRnZSB9IGZyb20gXCIuL2JyaWRnZS9xYlwiXHJcbmltcG9ydCB7IEVTWEJyaWRnZSB9IGZyb20gXCIuL2JyaWRnZS9lc3hcIlxyXG5pbXBvcnQgeyBpbGxlbml1bUNvbXBhdCB9IGZyb20gXCIuL2NvbXBhdC9pbGxlbml1bVwiXHJcblxyXG5SZWdpc3RlckNvbW1hbmQoJ29wZW5NZW51JywgYXN5bmMgKF8sIGFyZ3M6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBjb25zdCB0eXBlID0gYXJnc1swXVxyXG4gICAgaWYgKCF0eXBlKSB7XHJcbiAgICAgICAgZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkluaXRpYWxDcmVhdGlvbigpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHpvbmUgPSB0eXBlLnRvTG93ZXJDYXNlKCkgYXMgVE1lbnVUeXBlc1xyXG4gICAgICAgIG9wZW5NZW51KHsgdHlwZTogem9uZSwgY29vcmRzOiBbMCwgMCwgMCwgMF0gfSlcclxuICAgIH1cclxufSwgdHJ1ZSlcclxuXHJcbmV4cG9ydHMoJ1NldFBlZEFwcGVhcmFuY2UnLCBhc3luYyAocGVkOiBudW1iZXIsIGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlKSA9PiB7XHJcbiAgICBhd2FpdCBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcclxufSlcclxuXHJcbmV4cG9ydHMoJ1NldFBsYXllclBlZEFwcGVhcmFuY2UnLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UgfCBzdHJpbmcpID0+IHtcclxuICAgIGxldCByZXNvbHZlZEFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlO1xyXG4gICAgXHJcbiAgICBpZiAoIWFwcGVhcmFuY2UgfHwgdHlwZW9mIGFwcGVhcmFuY2UgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgY29uc3QgZnJhbWV3b3JrSUQ6IHN0cmluZyA9IGFwcGVhcmFuY2UgfHwgYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKTtcclxuICAgICAgICByZXNvbHZlZEFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpIGFzIFRBcHBlYXJhbmNlO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYXBwZWFyYW5jZSA9PT0gJ29iamVjdCcpIHJlc29sdmVkQXBwZWFyYW5jZSA9IGFwcGVhcmFuY2U7XHJcbiAgICBcclxuICAgIGlmICghcmVzb2x2ZWRBcHBlYXJhbmNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyB2YWxpZCBhcHBlYXJhbmNlIGZvdW5kJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UocmVzb2x2ZWRBcHBlYXJhbmNlKTtcclxufSk7XHJcblxyXG5leHBvcnRzKCdHZXRQbGF5ZXJQZWRBcHBlYXJhbmNlJywgYXN5bmMgKGZyYW1ld29ya0lEOiBzdHJpbmcpID0+IHtcclxuICAgIGZyYW1ld29ya0lEID0gZnJhbWV3b3JrSUQgfHwgYXdhaXQgZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgcmV0dXJuIGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxufSlcclxuXHJcbmV4cG9ydHMoJ0luaXRpYWxDcmVhdGlvbicsIGFzeW5jIChjYj86IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICAvLyBUaGUgZmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgdHlwZSBvZiBUQXBwZWFyYW5jZVpvbmUgbWVhbmluZyBpdCBuZWVkcyBhIGNvb3JkcyBwcm9wZXJ0eSwgYnV0IGluIHRoaXMgY2FzZSBpdCdzIG5vdCB1c2VkXHJcbiAgICBhd2FpdCBvcGVuTWVudSh7IHR5cGU6IFwiYXBwZWFyYW5jZVwiLCBjb29yZHM6IFswLCAwLCAwLCAwXSB9LCB0cnVlKVxyXG4gICAgaWYgKGNiKSBjYigpXHJcbn0pXHJcblxyXG5vbignYmxfc3ByaXRlczpjbGllbnQ6dXNlWm9uZScsICh6b25lOiBUQXBwZWFyYW5jZVpvbmUpID0+IHtcclxuICAgIG9wZW5NZW51KHpvbmUpXHJcbn0pXHJcblxyXG5vbk5ldCgnYmxfYnJpZGdlOmNsaWVudDpwbGF5ZXJMb2FkZWQnLCBhc3luYyAoKSA9PiB7XHJcbiAgICB3aGlsZSAoIWJsX2JyaWRnZS5jb3JlKCkucGxheWVyTG9hZGVkKCkpIHtcclxuICAgICAgICBhd2FpdCBEZWxheSgxMDApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgaWYgKCFhcHBlYXJhbmNlKSByZXR1cm47XHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcbn0pXHJcblxyXG5vbk5ldCgnb25SZXNvdXJjZVN0YXJ0JywgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcpID0+IHtcclxuICAgIGlmIChyZXNvdXJjZSA9PT0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpICYmIGJsX2JyaWRnZS5jb3JlKCkucGxheWVyTG9hZGVkKCkpIHtcclxuICAgICAgICBjb25zdCBmcmFtZXdvcmtJRCA9IGF3YWl0IGdldEZyYW1ld29ya0lEKClcclxuICAgICAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgICAgIGlmICghYXBwZWFyYW5jZSkgcmV0dXJuO1xyXG4gICAgICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSlcclxuICAgIH1cclxufSlcclxuXHJcbmNvbnN0IGZyYW1ld29ya05hbWUgPSBibF9icmlkZ2UuZ2V0RnJhbWV3b3JrKCdjb3JlJylcclxuY29uc3QgY29yZSA9IGZvcm1hdChHZXRDb252YXIoJ2JsOmZyYW1ld29yaycsICdxYicpKVxyXG5cclxuaWYgKGNvcmUgPT0gJ3FiJyB8fCBjb3JlID09ICdxYngnICYmIEdldFJlc291cmNlU3RhdGUoZnJhbWV3b3JrTmFtZSkgPT0gJ3N0YXJ0ZWQnKSB7XHJcbiAgICBRQkJyaWRnZSgpO1xyXG59IGVsc2UgaWYgKGNvcmUgPT0gJ2VzeCcgJiYgR2V0UmVzb3VyY2VTdGF0ZShmcmFtZXdvcmtOYW1lKSA9PSAnc3RhcnRlZCcpIHtcclxuICAgIEVTWEJyaWRnZSgpO1xyXG59XHJcblxyXG5pbGxlbml1bUNvbXBhdCgpO1xyXG5cclxuUmVnaXN0ZXJDb21tYW5kKCdyZWxvYWRza2luJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgY29uc3QgZnJhbWV3b3JrSUQgPSBhd2FpdCBnZXRGcmFtZXdvcmtJRCgpXHJcbiAgICBjb25zdCBoZWFsdGggPSBHZXRFbnRpdHlIZWFsdGgocGVkKTtcclxuICAgIGNvbnN0IG1heGhlYWx0aCA9IEdldEVudGl0eU1heEhlYWx0aChwZWQpO1xyXG4gICAgY29uc3QgYXJtb3IgPSBHZXRQZWRBcm1vdXIocGVkKTtcclxuXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgaWYgKCFhcHBlYXJhbmNlKSByZXR1cm47XHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcblxyXG4gICAgU2V0UGVkTWF4SGVhbHRoKHBlZCwgbWF4aGVhbHRoKVxyXG4gICAgZGVsYXkoMTAwMCkgXHJcbiAgICBTZXRFbnRpdHlIZWFsdGgocGVkLCBoZWFsdGgpXHJcbiAgICBTZXRQZWRBcm1vdXIocGVkLCBhcm1vcilcclxufSwgZmFsc2UpXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7QUFBTyxJQUFJLE1BQU07QUFFVixJQUFNLFlBQVksd0JBQUMsY0FBc0I7QUFDNUMsUUFBTTtBQUNWLEdBRnlCO0FBYWxCLElBQU0sZUFBZSx3QkFBQyxRQUFnQixTQUFjO0FBQ3ZELGlCQUFlO0FBQUEsSUFDWDtBQUFBLElBQ0E7QUFBQSxFQUNKLENBQUM7QUFDTCxHQUw0QjtBQU9yQixJQUFNLFFBQVEsd0JBQUMsT0FBZSxJQUFJLFFBQVEsU0FBTyxXQUFXLEtBQUssRUFBRSxDQUFDLEdBQXREO0FBRWQsSUFBTSxlQUFlLDhCQUFPLFVBQTRDO0FBQzNFLE1BQUksWUFBb0IsT0FBTyxVQUFVLFdBQVcsUUFBUSxXQUFXLEtBQUs7QUFFNUUsTUFBSSxDQUFDLGFBQWEsU0FBUyxLQUFLLENBQUMsaUJBQWlCLFNBQVMsR0FBRztBQU8xRCxZQUFRLEtBQUssb0NBQW9DLEtBQUssR0FBRztBQUN6RCxXQUFPO0FBQUEsRUFDWDtBQUVBLE1BQUksZUFBZSxTQUFTO0FBQUcsV0FBTztBQUV0QyxlQUFhLFNBQVM7QUFFdEIsUUFBTSxxQkFBcUIsNkJBQXFCO0FBQzVDLFdBQU8sSUFBSSxRQUFRLGFBQVc7QUFDMUIsWUFBTSxXQUFXLFlBQVksTUFBTTtBQUMvQixZQUFJLGVBQWUsU0FBUyxHQUFHO0FBQzNCLHdCQUFjLFFBQVE7QUFDdEIsa0JBQVE7QUFBQSxRQUNaO0FBQUEsTUFDSixHQUFHLEdBQUc7QUFBQSxJQUNWLENBQUM7QUFBQSxFQUNMLEdBVDJCO0FBVzNCLFFBQU0sbUJBQW1CO0FBRXpCLFNBQU87QUFDWCxHQWhDNEI7QUFzQzVCLElBQU0sZUFBZSx1QkFBdUI7QUFDNUMsSUFBTSxjQUFzQyxDQUFDO0FBQzdDLElBQU0sZUFBeUQsQ0FBQztBQUVoRSxTQUFTLFdBQVcsV0FBbUJBLFFBQXNCO0FBQ3pELE1BQUlBLFVBQVNBLFNBQVEsR0FBRztBQUNwQixVQUFNLGNBQWMsYUFBYTtBQUVqQyxTQUFLLFlBQVksU0FBUyxLQUFLLEtBQUs7QUFBYSxhQUFPO0FBRXhELGdCQUFZLFNBQVMsSUFBSSxjQUFjQTtBQUFBLEVBQzNDO0FBRUEsU0FBTztBQUNYO0FBVlM7QUFZVCxNQUFNLFVBQVUsWUFBWSxJQUFJLENBQUMsUUFBZ0IsU0FBYztBQUMzRCxRQUFNLFVBQVUsYUFBYSxHQUFHO0FBQ2hDLFNBQU8sV0FBVyxRQUFRLEdBQUcsSUFBSTtBQUNyQyxDQUFDO0FBRU0sU0FBUyxzQkFDWixjQUFzQixNQUNMO0FBQ2pCLE1BQUksQ0FBQyxXQUFXLFdBQVcsQ0FBQyxHQUFHO0FBQzNCO0FBQUEsRUFDSjtBQUVBLE1BQUk7QUFFSixLQUFHO0FBQ0MsVUFBTSxHQUFHLFNBQVMsSUFBSSxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssTUFBUyxFQUFFLENBQUM7QUFBQSxFQUNsRSxTQUFTLGFBQWEsR0FBRztBQUN6QixVQUFRLFVBQVUsU0FBUyxJQUFJLGNBQWMsS0FBSyxHQUFHLElBQUk7QUFFekQsU0FBTyxJQUFJLFFBQVcsQ0FBQyxZQUFZO0FBQy9CLGlCQUFhLEdBQUcsSUFBSTtBQUFBLEVBQ3hCLENBQUM7QUFDTDtBQWpCZ0I7QUFtQlQsU0FBUyxpQkFBaUIsV0FBVyxJQUFJO0FBQzVDLFFBQU0sVUFBVSxTQUFTLElBQUksT0FBTyxVQUFVLFFBQVEsU0FBUztBQUMzRCxRQUFJO0FBQ0osUUFBSTtBQUNBLGlCQUFXLE1BQU0sR0FBRyxHQUFHLElBQUk7QUFBQSxJQUMvQixTQUNPLEdBQUc7QUFDTixjQUFRLE1BQU0sbURBQW1ELFNBQVMsRUFBRTtBQUM1RSxjQUFRLElBQUksS0FBSyxFQUFFLEtBQUssSUFBSTtBQUFBLElBQ2hDO0FBQ0EsWUFBUSxVQUFVLFFBQVEsSUFBSSxLQUFLLFFBQVE7QUFBQSxFQUMvQyxDQUFDO0FBQ0w7QUFaZ0I7QUFnQlQsSUFBTSxnQkFBZ0Isd0JBQUMsb0JBQTRCO0FBQ3RELFNBQU8sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM1QixVQUFNLG9CQUFvQiw2QkFBTTtBQUM1QixVQUFJLHVCQUF1QixlQUFlLEdBQUc7QUFDekMsY0FBTSxhQUFhLFFBQVEsY0FBYyxPQUFPLEVBQUU7QUFDbEQsWUFBSSxvQkFBb0IsaUJBQWlCLGNBQWMsVUFBVSxVQUFVLE9BQU87QUFDbEYsWUFBSSxDQUFDLG1CQUFtQjtBQUNwQixrQkFBUSxNQUFNLEdBQUcsVUFBVSxxRUFBcUU7QUFDaEcsOEJBQW9CLGlCQUFpQixjQUFjLGdCQUFnQjtBQUFBLFFBQ3ZFO0FBQ0EsZ0JBQVEsaUJBQWlCO0FBQUEsTUFDN0IsT0FBTztBQUNILG1CQUFXLG1CQUFtQixHQUFHO0FBQUEsTUFDckM7QUFBQSxJQUNKLEdBWjBCO0FBYTFCLHNCQUFrQjtBQUFBLEVBQ3RCLENBQUM7QUFDTCxHQWpCNkI7QUEyQnRCLElBQU0sWUFBWSxRQUFRO0FBRTFCLElBQU0sZ0JBQWdCLDZCQUFNO0FBQy9CLFNBQU8sVUFBVSxLQUFLLEVBQUUsY0FBYztBQUMxQyxHQUY2QjtBQUl0QixJQUFNLGlCQUFpQiw2QkFBTTtBQUNoQyxRQUFNLEtBQUssY0FBYyxFQUFFO0FBQzNCLFNBQU87QUFDWCxHQUg4QjtBQUt2QixJQUFNLHVCQUF1Qiw2QkFBTTtBQUN0QyxRQUFNLFNBQVMsY0FBYyxFQUFFO0FBQy9CLFNBQU8sV0FBVyxTQUFTLHFCQUFxQjtBQUNwRCxHQUhvQztBQUs3QixTQUFTLE1BQU0sSUFBMkI7QUFDN0MsU0FBTyxJQUFJLFFBQVEsYUFBVyxXQUFXLFNBQVMsRUFBRSxDQUFDO0FBQ3pEO0FBRmdCO0FBSVQsU0FBUyxPQUFPLEtBQXFCO0FBQ3hDLE1BQUksQ0FBQyxJQUFJLFNBQVMsR0FBRztBQUFHLFdBQU87QUFDL0IsU0FBTyxJQUFJLFFBQVEsTUFBTSxFQUFFO0FBQy9CO0FBSGdCO0FBS1QsU0FBUyxhQUF1RDtBQUNuRSxRQUFNLE1BQU0sY0FBYyxFQUFFO0FBQzVCLFNBQU8sTUFBTSxFQUFFLE1BQU0sSUFBSSxNQUFNLFFBQVEsSUFBSSxPQUFPLElBQUk7QUFDMUQ7QUFIZ0I7OztBQ3RLaEIsSUFBTSwwQkFBMEI7QUFDaEMsSUFBTSx1QkFBdUI7QUFFN0IsSUFBSSxVQUFtQjtBQUN2QixJQUFJLGNBQXNCO0FBQzFCLElBQUksTUFBcUI7QUFDekIsSUFBSSxTQUFpQjtBQUNyQixJQUFJLFNBQWlCO0FBQ3JCLElBQUksZUFBK0I7QUFDbkMsSUFBSSxTQUF3QjtBQUM1QixJQUFJLGNBQXVCO0FBRTNCLElBQUksY0FBa0M7QUFFdEMsSUFBTSxjQUE0QjtBQUFBLEVBQzlCLE9BQU87QUFBQSxFQUNWLE1BQU07QUFBQSxFQUNOLE9BQU87QUFBQSxFQUNQLE1BQU0sQ0FBQyxPQUFPLEtBQUs7QUFBQSxFQUNoQixPQUFPLENBQUMsT0FBTyxLQUFLO0FBQ3hCO0FBRUEsSUFBTSxNQUFNLHdCQUFDLFlBQTRCO0FBQ3hDLFNBQU8sS0FBSyxJQUFLLFVBQVUsS0FBSyxLQUFNLEdBQUc7QUFDMUMsR0FGWTtBQUlaLElBQU0sTUFBTSx3QkFBQyxZQUE0QjtBQUN4QyxTQUFPLEtBQUssSUFBSyxVQUFVLEtBQUssS0FBTSxHQUFHO0FBQzFDLEdBRlk7QUFJWixJQUFNLFlBQVksNkJBQWdCO0FBQ2pDLFFBQU0sS0FDSCxJQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sS0FBSyxJQUMzRDtBQUNELFFBQU0sS0FDSCxJQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sS0FBSyxJQUMzRDtBQUNELFFBQU0sSUFBSSxJQUFJLE1BQU0sSUFBSTtBQUV4QixTQUFPLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDaEIsR0FWa0I7QUFZbEIsSUFBTSxpQkFBaUIsd0JBQUMsUUFBaUIsV0FBMEI7QUFDbEUsTUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0I7QUFBYTtBQUU5QyxXQUFTLFVBQVU7QUFDbkIsV0FBUyxVQUFVO0FBRW5CLFlBQVU7QUFDVixZQUFVO0FBRVAsUUFBTSxnQkFBZ0IsZ0JBQWdCLFdBQVcsZ0JBQWdCO0FBQ2pFLFFBQU0sV0FBVyxnQkFBZ0IsS0FBTztBQUV4QyxRQUFNLFVBQVUsZ0JBQWdCO0FBQ2hDLFFBQU0sV0FBVyxVQUFVLElBQU07QUFFcEMsV0FBUyxLQUFLLElBQUksS0FBSyxJQUFJLFFBQVEsUUFBUSxHQUFHLFFBQVE7QUFFdEQsUUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksVUFBVTtBQUU1QjtBQUFBLElBQ0M7QUFBQSxJQUNBLGFBQWEsSUFBSTtBQUFBLElBQ2pCLGFBQWEsSUFBSTtBQUFBLElBQ2pCLGFBQWEsSUFBSTtBQUFBLEVBQ2xCO0FBQ0Esa0JBQWdCLEtBQUssYUFBYSxHQUFHLGFBQWEsR0FBRyxhQUFhLENBQUM7QUFDcEUsR0ExQnVCO0FBNEJ2QixJQUFNLGFBQWEsOEJBQU8sUUFBaUIsYUFBc0I7QUFDaEUsUUFBTSxVQUFrQixpQkFBaUIsR0FBRyxJQUFJO0FBQ2hELGFBQVcsWUFBWTtBQUV2QixnQkFBYztBQUNkLGdCQUFjO0FBQ2QsV0FBUztBQUVULFFBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLFVBQVU7QUFFNUIsUUFBTSxTQUFpQjtBQUFBLElBQ3RCO0FBQUEsSUFDQSxPQUFPLElBQUk7QUFBQSxJQUNYLE9BQU8sSUFBSTtBQUFBLElBQ1gsT0FBTyxJQUFJO0FBQUEsSUFDWDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRDtBQUVBLGlCQUFlO0FBQ2YsZ0JBQWM7QUFDZCxXQUFTO0FBQ1QsUUFBTTtBQUVOLGtCQUFnQixRQUFRLE9BQU8sR0FBRyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3BELHlCQUF1QixRQUFRLFFBQVEsS0FBSyxHQUFHLENBQUM7QUFFaEQsUUFBTSxNQUFNLEdBQUc7QUFFZiwwQkFBd0IsUUFBUSxJQUFJO0FBQ3BDLGdCQUFjLFFBQVEsR0FBRztBQUN6QixlQUFhLFFBQVEsR0FBRztBQUN4QixvQkFBa0IsUUFBUSxHQUFHO0FBQzdCLFdBQVMsTUFBTTtBQUVmLGFBQVcsUUFBUSxJQUFJO0FBQ3hCLEdBeENtQjtBQTBDbkIsSUFBTSxXQUFXLHdCQUFDLGVBQXVCO0FBQ3hDLE1BQUksRUFBRSxhQUFhLEdBQUcsS0FBSyxjQUFjO0FBQU07QUFDL0MsY0FBWTtBQUNaLGFBQVcsVUFBVSxDQUFDO0FBQ3ZCLEdBSmlCO0FBTVYsSUFBTSxjQUFjLDZCQUFNO0FBQ2hDLE1BQUk7QUFBUztBQUNiLFlBQVU7QUFDVixnQkFBYztBQUNkLFFBQU0sVUFBVSwyQkFBMkIsSUFBSTtBQUMvQyxRQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBYyxpQkFBaUIsS0FBSyxPQUFPLEdBQUssR0FBSyxDQUFHO0FBQ3RFLGNBQVksS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUN4QixtQkFBaUIsTUFBTSxNQUFNLEtBQU0sTUFBTSxJQUFJO0FBRTFDLFlBQVUsU0FBUyxXQUFXO0FBQ2xDLEdBVjJCO0FBWXBCLElBQU0sYUFBYSw2QkFBWTtBQUNyQyxNQUFJLENBQUM7QUFBUztBQUNkLFlBQVU7QUFFVixtQkFBaUIsT0FBTyxNQUFNLEtBQUssTUFBTSxLQUFLO0FBQzlDLGFBQVcsS0FBSyxJQUFJO0FBQ3BCLFFBQU07QUFDTixpQkFBZTtBQUNoQixHQVIwQjtBQVUxQixJQUFNLFlBQVksd0JBQUMsTUFBMkIsV0FBVyxnQkFBc0I7QUFFOUUsUUFBTSxPQUFzQyxZQUFZLElBQUk7QUFFekQsUUFBTSxjQUFjLE1BQU0sUUFBUSxJQUFJO0FBRXRDLGdCQUFjO0FBRWQsTUFBSSxDQUFDLGVBQWUsU0FBUyxHQUFHO0FBQzVCLFVBQU0sQ0FBQ0MsSUFBR0MsSUFBR0MsRUFBQyxJQUFjLGdCQUFnQixLQUFLLEtBQUs7QUFDdEQ7QUFBQSxNQUNJO0FBQUEsUUFDSSxHQUFHRjtBQUFBLFFBQ0gsR0FBR0M7QUFBQSxRQUNILEdBQUdDLEtBQUk7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFDQTtBQUFBLEVBQ0o7QUFHQSxNQUFJLFdBQVc7QUFBc0IsZUFBVztBQUVoRCxNQUFJLGFBQWE7QUFDYixVQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsSUFBYyxpQkFBaUIsS0FBSyxLQUFLLENBQUMsR0FBRyxHQUFLLEdBQUssQ0FBRztBQUUzRSxVQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsSUFBYyxpQkFBaUIsS0FBSyxLQUFLLENBQUMsR0FBRyxHQUFLLEdBQUssQ0FBRztBQUczRSxRQUFJLEtBQUssS0FBSyxNQUFNO0FBQ3BCLFFBQUksS0FBSyxLQUFLLE1BQU07QUFDcEIsUUFBSSxLQUFLLEtBQUssTUFBTTtBQUFBLEVBQ3hCLE9BQU87QUFDSCxRQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBYyxpQkFBaUIsS0FBSyxNQUFNLEdBQUssR0FBSyxDQUFHO0FBQUEsRUFDdkU7QUFFSDtBQUFBLElBQ0M7QUFBQSxNQUNDO0FBQUEsTUFDQTtBQUFBLE1BQ0EsR0FBRyxJQUFJO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxFQUNEO0FBRUQsR0E5Q2tCO0FBZ0RsQix3REFBcUMsQ0FBQyxNQUFNLE9BQU87QUFDL0MsaUJBQWUsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUM3QixLQUFHLENBQUM7QUFDUixDQUFDO0FBSUQsOERBQXdDLENBQUMsTUFBZ0IsT0FBaUI7QUFDekUsVUFBUSxNQUFNO0FBQUEsSUFDUCxLQUFLO0FBQ0QsZ0JBQVUsU0FBUyx1QkFBdUI7QUFDMUM7QUFBQSxJQUNKLEtBQUs7QUFDRCxnQkFBVSxNQUFNO0FBQ2hCO0FBQUEsSUFDSixLQUFLO0FBQ0QsZ0JBQVUsT0FBTztBQUNqQjtBQUFBLElBQ0osS0FBSztBQUNELGdCQUFVLE1BQU07QUFDaEI7QUFBQSxJQUNKLEtBQUs7QUFDRCxnQkFBVSxPQUFPO0FBQ2pCLHFCQUFlO0FBQ2Y7QUFBQSxFQUNYO0FBQ0EsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELHdEQUFxQyxDQUFDLE1BQU0sT0FBTztBQUNsRCxNQUFJLFNBQVMsUUFBUTtBQUVkLFVBQU0sVUFBVSxnQkFBZ0IsVUFBVSwwQkFBMEI7QUFFMUUsVUFBTSxjQUFzQixjQUFjO0FBQzFDLGtCQUFjLGVBQWUsVUFBVSxVQUFVO0FBQUEsRUFDbEQsV0FBVyxTQUFTLE1BQU07QUFDekIsVUFBTSxjQUFzQixjQUFjO0FBQzFDLGtCQUFjLGVBQWUsTUFBTSxNQUFNO0FBQUEsRUFDMUM7QUFFQSxnQkFBYztBQUNkLGlCQUFlO0FBQ2YsS0FBRyxDQUFDO0FBQ0wsQ0FBQzs7O0FDNU9ELElBQU8sZUFBUTtBQUFBLEVBQ1g7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0o7OztBQ2ZBLElBQU8sZUFBUTtBQUFBLEVBQ1g7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0o7OztBQ3JCQSxJQUFPLG9CQUFRO0FBQUEsRUFDWDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0o7OztBQ2JBLElBQU8sZ0JBQVE7QUFBQSxFQUNYO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKOzs7QUNGTyxTQUFTLGVBQWUsUUFBZ0I7QUFDM0MsUUFBTUMsVUFBUyxRQUFRO0FBQ3ZCLFFBQU0sU0FBU0EsUUFBTyxPQUFPO0FBRTdCLFNBQU8sT0FBTyxVQUFVLENBQUMsVUFBa0IsV0FBVyxLQUFLLE1BQU0sTUFBTTtBQUMzRTtBQUxnQjtBQU9ULFNBQVMsUUFBUSxXQUE4QjtBQUNsRCxTQUFPO0FBQUEsSUFDSCxPQUFPLGdCQUFnQixTQUFTO0FBQUEsSUFDaEMsV0FBVyx5QkFBeUIsU0FBUztBQUFBLEVBQ2pEO0FBQ0o7QUFMZ0I7QUFPVCxTQUFTLGlCQUFpQixXQUFtQjtBQUVoRCxRQUFNLFNBQVMsSUFBSSxZQUFZLEVBQUU7QUFDakMsU0FBTyxRQUFRLGFBQWEsc0JBQXNCLFdBQVcsSUFBSSxZQUFZLE1BQU0sQ0FBQztBQUVwRixRQUFNLEVBQUUsR0FBRyxZQUFZLEdBQUcsYUFBYSxHQUFHLFlBQVksR0FBRyxXQUFXLEdBQUcsWUFBWSxJQUFJLFdBQVcsSUFBSSxVQUFVLElBQUksSUFBSSxZQUFZLE1BQU07QUFDMUksUUFBTSxFQUFFLEdBQUcsVUFBVSxHQUFHLFNBQVMsR0FBRyxTQUFTLElBQUksSUFBSSxhQUFhLFFBQVEsRUFBRTtBQVc1RSxTQUFPO0FBQUEsSUFDSDtBQUFBO0FBQUEsSUFDQTtBQUFBO0FBQUEsSUFDQTtBQUFBLElBRUE7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBRUE7QUFBQTtBQUFBLElBRUE7QUFBQSxJQUNBO0FBQUE7QUFBQSxJQUVBLFdBQVcsUUFBUSxTQUFTO0FBQUEsRUFDaEM7QUFDSjtBQWpDZ0I7QUFtQ1QsU0FBUyxlQUFlLFdBQW1CO0FBQzlDLE1BQUksU0FBNEIsQ0FBQztBQUNqQyxNQUFJLFdBQXlCLENBQUM7QUFFOUIsV0FBUyxJQUFJLEdBQUcsSUFBSSxhQUFjLFFBQVEsS0FBSztBQUMzQyxVQUFNLFVBQVUsYUFBYyxDQUFDO0FBQy9CLFdBQU8sT0FBTyxJQUFJLHdCQUF3QixDQUFDO0FBRTNDLFFBQUksWUFBWSxZQUFZO0FBQ3hCLGVBQVMsT0FBTyxJQUFJO0FBQUEsUUFDaEIsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsY0FBYyxlQUFlLFNBQVM7QUFBQSxNQUMxQztBQUFBLElBQ0osT0FBTztBQUNILFlBQU0sQ0FBQyxHQUFHLGNBQWMsWUFBWSxZQUFZLGFBQWEsY0FBYyxJQUFJLHNCQUFzQixXQUFXLENBQUM7QUFDakgsZUFBUyxPQUFPLElBQUk7QUFBQSxRQUNoQixJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxjQUFjLGlCQUFpQixNQUFNLEtBQUs7QUFBQSxRQUMxQztBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUVBLFNBQU8sQ0FBQyxVQUFVLE1BQU07QUFDNUI7QUE3QmdCO0FBK0JULFNBQVMsaUJBQWlCLFdBQW1CO0FBQ2hELFFBQU0sV0FBVyxlQUFlLFNBQVM7QUFFekMsTUFBSSxhQUFhLFdBQVcsa0JBQWtCLEtBQUssYUFBYSxXQUFXLGtCQUFrQjtBQUFHO0FBRWhHLE1BQUksYUFBYSxDQUFDO0FBQ2xCLFdBQVMsSUFBSSxHQUFHLElBQUksYUFBYyxRQUFRLEtBQUs7QUFDM0MsVUFBTSxVQUFVLGFBQWMsQ0FBQztBQUMvQixlQUFXLE9BQU8sSUFBSTtBQUFBLE1BQ2xCLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8sa0JBQWtCLFdBQVcsQ0FBQztBQUFBLElBQ3pDO0FBQUEsRUFDSjtBQUVBLFNBQU87QUFDWDtBQWhCZ0I7QUFrQlQsU0FBUyxhQUFhLFdBQW1CO0FBQzVDLE1BQUksWUFBWSxDQUFDO0FBQ2pCLE1BQUksaUJBQWlCLENBQUM7QUFFdEIsV0FBUyxJQUFJLEdBQUcsSUFBSSxrQkFBZSxRQUFRLEtBQUs7QUFDNUMsVUFBTSxPQUFPLGtCQUFlLENBQUM7QUFDN0IsVUFBTSxVQUFVLHdCQUF3QixXQUFXLENBQUM7QUFFcEQsbUJBQWUsSUFBSSxJQUFJO0FBQUEsTUFDbkIsSUFBSTtBQUFBLE1BQ0osT0FBTztBQUFBLE1BQ1AsT0FBTyxpQ0FBaUMsV0FBVyxDQUFDO0FBQUEsTUFDcEQsVUFBVSxnQ0FBZ0MsV0FBVyxHQUFHLE9BQU87QUFBQSxJQUNuRTtBQUNBLGNBQVUsSUFBSSxJQUFJO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxPQUFPLHdCQUF3QixXQUFXLENBQUM7QUFBQSxNQUMzQyxTQUFTLHVCQUF1QixXQUFXLENBQUM7QUFBQSxJQUNoRDtBQUFBLEVBQ0o7QUFFQSxTQUFPLENBQUMsV0FBVyxjQUFjO0FBQ3JDO0FBdkJnQjtBQXlCVCxTQUFTLFNBQVMsV0FBbUI7QUFDeEMsTUFBSSxRQUFRLENBQUM7QUFDYixNQUFJLGFBQWEsQ0FBQztBQUVsQixXQUFTLElBQUksR0FBRyxJQUFJLGNBQVcsUUFBUSxLQUFLO0FBQ3hDLFVBQU0sT0FBTyxjQUFXLENBQUM7QUFDekIsVUFBTSxVQUFVLGdCQUFnQixXQUFXLENBQUM7QUFFNUMsZUFBVyxJQUFJLElBQUk7QUFBQSxNQUNmLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8scUNBQXFDLFdBQVcsQ0FBQztBQUFBLE1BQ3hELFVBQVUsb0NBQW9DLFdBQVcsR0FBRyxPQUFPO0FBQUEsSUFDdkU7QUFFQSxVQUFNLElBQUksSUFBSTtBQUFBLE1BQ1YsSUFBSTtBQUFBLE1BQ0osT0FBTztBQUFBLE1BQ1AsT0FBTyxnQkFBZ0IsV0FBVyxDQUFDO0FBQUEsTUFDbkMsU0FBUyx1QkFBdUIsV0FBVyxDQUFDO0FBQUEsSUFDaEQ7QUFBQSxFQUNKO0FBRUEsU0FBTyxDQUFDLE9BQU8sVUFBVTtBQUM3QjtBQXhCZ0I7QUEyQmhCLGVBQXNCLGNBQWMsV0FBeUM7QUFDekUsUUFBTSxDQUFDLFVBQVUsTUFBTSxJQUFJLGVBQWUsU0FBUztBQUNuRCxRQUFNLENBQUMsV0FBVyxTQUFTLElBQUksYUFBYSxTQUFTO0FBQ3JELFFBQU0sQ0FBQyxPQUFPLFNBQVMsSUFBSSxTQUFTLFNBQVM7QUFDN0MsUUFBTSxRQUFRLGVBQWUsU0FBUztBQUV0QyxTQUFPO0FBQUEsSUFDSCxZQUFZLGVBQWUsS0FBSztBQUFBLElBQ2hDO0FBQUEsSUFDQSxXQUFXLFFBQVEsU0FBUztBQUFBLElBQzVCLFdBQVcsaUJBQWlCLFNBQVM7QUFBQSxJQUNyQyxhQUFhO0FBQUEsSUFDYixrQkFBa0I7QUFBQSxJQUNsQixlQUFlLGlCQUFpQixTQUFTO0FBQUEsSUFDekM7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBLFNBQVMsQ0FBQztBQUFBLEVBQ2Q7QUFDSjtBQXBCc0I7QUFxQnRCLFFBQVEsaUJBQWlCLGFBQWE7QUFDdEMsaUJBQWlCLHNDQUFzQyxNQUFNO0FBQ3pELFNBQU8sY0FBYyxPQUFPLFlBQVksQ0FBQztBQUM3QyxDQUFDO0FBRU0sU0FBUyxjQUFjLFdBQTZCO0FBQ3ZELFFBQU0sQ0FBQyxTQUFTLElBQUksYUFBYSxTQUFTO0FBQzFDLFFBQU0sQ0FBQyxLQUFLLElBQUksU0FBUyxTQUFTO0FBQ2xDLFFBQU0sQ0FBQyxRQUFRLElBQUksZUFBZSxTQUFTO0FBRTNDLFNBQU87QUFBQSxJQUNILGFBQWE7QUFBQSxJQUNiO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFDSjtBQVZnQjtBQVdoQixRQUFRLGlCQUFpQixhQUFhO0FBRS9CLFNBQVMsV0FBVyxXQUEwQjtBQUNqRCxTQUFPO0FBQUEsSUFDSCxXQUFXLGlCQUFpQixTQUFTO0FBQUEsSUFDckMsZUFBZSxpQkFBaUIsU0FBUztBQUFBLElBQ3pDLFdBQVcsUUFBUSxTQUFTO0FBQUEsSUFDNUIsT0FBTyxlQUFlLFNBQVM7QUFBQSxFQUNuQztBQUNKO0FBUGdCO0FBUWhCLFFBQVEsY0FBYyxVQUFVO0FBRXpCLFNBQVMsZ0JBQWdCO0FBQzVCLE1BQUksY0FBYyxDQUFDO0FBRW5CLFFBQU0sQ0FBQyxhQUFhLGlCQUFpQixJQUFJLFFBQVEsY0FBYyxRQUFRO0FBQ3ZFLFdBQVMsSUFBSSxHQUFHLElBQUksa0JBQWtCLFFBQVEsS0FBSztBQUMvQyxVQUFNLFdBQVcsa0JBQWtCLENBQUM7QUFDcEMsVUFBTSxPQUFPLFNBQVM7QUFDdEIsVUFBTSxRQUFRLFNBQVM7QUFDdkIsVUFBTSxRQUFRLFNBQVM7QUFDdkIsZ0JBQVksS0FBSyxJQUFJO0FBQUEsTUFDakI7QUFBQSxNQUNBO0FBQUEsTUFDQSxXQUFXO0FBQUEsTUFDWCxNQUFNLENBQUM7QUFBQSxJQUNYO0FBRUEsYUFBUyxJQUFJLEdBQUcsSUFBSSxZQUFZLFFBQVEsS0FBSztBQUN6QyxZQUFNLFVBQVUsWUFBWSxDQUFDO0FBQzdCLGtCQUFZLEtBQUssRUFBRSxLQUFLLEtBQUs7QUFBQSxRQUN6QixPQUFPLFFBQVE7QUFBQSxRQUNmLFVBQVU7QUFBQSxRQUNWLFNBQVMsQ0FBQztBQUFBLE1BQ2QsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBRUEsUUFBTSxXQUFXLGVBQWUsR0FBRyxNQUFNLFdBQVcsa0JBQWtCO0FBRXRFLFdBQVMsSUFBSSxHQUFHLElBQUksWUFBWSxRQUFRLEtBQUs7QUFDekMsVUFBTSxPQUFPLFlBQVksQ0FBQztBQUMxQixVQUFNLEVBQUUsS0FBSyxRQUFRLElBQUk7QUFDekIsVUFBTSxVQUFVLFdBQVcsR0FBRztBQUM5QixhQUFTLElBQUksR0FBRyxJQUFJLFFBQVEsUUFBUSxLQUFLO0FBQ3JDLFlBQU0sYUFBYSxRQUFRLENBQUM7QUFDNUIsVUFBSSxTQUFTO0FBRWIsWUFBTSxjQUFjLFdBQVcsWUFBWTtBQUMzQyxZQUFNLGlCQUFpQixZQUFZLFNBQVMsSUFBSTtBQUNoRCxVQUFJLGtCQUFrQixVQUFVO0FBQzVCLGlCQUFTO0FBQUEsTUFDYixXQUFXLENBQUMsa0JBQWtCLENBQUMsVUFBVTtBQUNyQyxpQkFBUztBQUFBLE1BQ2I7QUFFQSxVQUFJLE9BQU87QUFDWCxVQUFJLE9BQU87QUFFWCxVQUFJLFFBQVE7QUFDUixlQUFPLFdBQVcsTUFBTTtBQUN4QixlQUFPLCtCQUErQixTQUFTLElBQUk7QUFBQSxNQUN2RDtBQUVBLFVBQUksU0FBUyxNQUFNLE1BQU07QUFDckIsY0FBTSxjQUFjLFlBQVksSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBRTlDLG9CQUFZLEtBQUs7QUFBQSxVQUNiLE9BQU87QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxTQUFPO0FBQ1g7QUFsRWdCO0FBc0VoQixpQkFBaUIsZ0RBQWdELENBQUMsU0FBb0M7QUFDbEcsTUFBSSxLQUFLLFNBQVM7QUFBUyxZQUFRLGtCQUFrQixFQUFFLG9CQUFvQixLQUFLLElBQUk7QUFDcEYsTUFBSSxLQUFLLFNBQVM7QUFBWSxZQUFRLHFCQUFxQixFQUFFLG9CQUFvQixLQUFLLElBQUk7QUFDOUYsQ0FBQzs7O0FDdlJELElBQU8sa0JBQVE7QUFBQSxFQUNYLE1BQU07QUFBQSxJQUNGLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0gsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLEVBQ1Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxNQUNGLFdBQVc7QUFBQSxRQUNQLEVBQUUsV0FBVyxHQUFHLFNBQVMsSUFBSSxTQUFTLEdBQUcsSUFBSSxTQUFTO0FBQUEsUUFDdEQsRUFBRSxXQUFXLEdBQUcsU0FBUyxJQUFJLFNBQVMsR0FBRyxJQUFJLFNBQVM7QUFBQSxNQUMxRDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsTUFDRixXQUFXO0FBQUEsUUFDUCxFQUFFLFdBQVcsR0FBRyxTQUFTLElBQUksU0FBUyxHQUFHLElBQUksU0FBUztBQUFBLFFBQ3RELEVBQUUsV0FBVyxJQUFJLFNBQVMsSUFBSSxTQUFTLEdBQUcsSUFBSSxVQUFVO0FBQUEsTUFDNUQ7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0YsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLEVBQ1Q7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNGLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxFQUNUO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDSCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsRUFDVDtBQUNKOzs7QUM3Q08sU0FBUyxZQUFZLFdBQW1CLE1BQWM7QUFDekQsMkJBQXlCLFdBQVcsS0FBSyxPQUFPLEtBQUssT0FBTyxLQUFLLFNBQVMsQ0FBQztBQUMzRSxTQUFPLGdDQUFnQyxXQUFXLEtBQUssT0FBTyxLQUFLLEtBQUs7QUFDNUU7QUFIZ0I7QUFLVCxTQUFTLFFBQVEsV0FBbUIsTUFBYztBQUNyRCxNQUFJLEtBQUssVUFBVSxJQUFJO0FBQ25CLGlCQUFhLFdBQVcsS0FBSyxLQUFLO0FBQ2xDO0FBQUEsRUFDSjtBQUVBLGtCQUFnQixXQUFXLEtBQUssT0FBTyxLQUFLLE9BQU8sS0FBSyxTQUFTLEtBQUs7QUFDdEUsU0FBTyxvQ0FBb0MsV0FBVyxLQUFLLE9BQU8sS0FBSyxLQUFLO0FBQ2hGO0FBUmdCO0FBVWhCLElBQU0sY0FBYyxXQUFXLGtCQUFrQjtBQUkxQyxJQUFNLFdBQVcsOEJBQU8sV0FBbUIsU0FBZ0Q7QUFDOUYsTUFBSSxRQUFnQjtBQUdwQixNQUFJLFFBQVEsUUFBUSxRQUFRO0FBQVc7QUFFdkMsUUFBTSxXQUFXLE9BQU8sU0FBUztBQUNqQyxRQUFNLFdBQVcsT0FBTyxTQUFTO0FBQ2pDLFFBQU0sY0FBYyxZQUFZO0FBR2hDLE1BQUksT0FBTyxTQUFTLFVBQVU7QUFDMUIsWUFBUSxXQUFXLElBQUk7QUFBQSxFQUMzQixXQUFXLE9BQU8sU0FBUyxVQUFVO0FBQ2pDLFlBQVE7QUFBQSxFQUNaLE9BQU87QUFDSCxZQUFRLEtBQUs7QUFBQSxFQUNqQjtBQUVBLE1BQUksU0FBUyxRQUFRLFNBQVM7QUFBVztBQUV6QyxRQUFNLFdBQVcsYUFBYSxTQUFTO0FBRXZDLE1BQUksVUFBVTtBQUNWLFlBQVEsVUFBVSxJQUFJLFFBQVE7QUFDOUIsVUFBTSxhQUFhLEtBQUs7QUFDeEIsbUJBQWUsU0FBUyxHQUFHLEtBQUs7QUFDaEMsNkJBQXlCLEtBQUs7QUFDOUIsZ0JBQVksWUFBWTtBQUFBLEVBQzVCO0FBRUEsa0NBQWdDLFNBQVM7QUFHekMsTUFBSSxPQUFPLFNBQVMsWUFBWSxPQUFPLFNBQVMsVUFBVTtBQUN0RCxRQUFJLEtBQUssV0FBVztBQUNoQixVQUFJLENBQUMsZUFBZSxPQUFPLEtBQUssS0FBSyxTQUFTLEVBQUUsU0FBUyxHQUFHO0FBQ3hELGNBQU0sWUFBWSxLQUFLO0FBQ3ZCLHFCQUFhLFdBQVcsU0FBUztBQUNqQyw0QkFBb0IsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFLLEdBQUssR0FBSyxLQUFLO0FBQUEsTUFDekU7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUVBLFNBQU87QUFDWCxHQTdDd0I7QUErQ2pCLFNBQVMsZUFBZSxXQUFtQixNQUFjO0FBQzVELG9CQUFrQixXQUFXLEtBQUssT0FBTyxLQUFLLFFBQVEsQ0FBRztBQUM3RDtBQUZnQjtBQUloQixJQUFNLGFBQWEsd0JBQUMsUUFBZ0IsT0FBTyxJQUFJLE1BQU0sR0FBbEM7QUFFWixTQUFTLGFBQWEsV0FBbUIsTUFBTTtBQUNsRCxjQUFZLGFBQWE7QUFFekIsUUFBTSxhQUFhLFdBQVcsS0FBSyxVQUFVO0FBQzdDLFFBQU0sY0FBYyxXQUFXLEtBQUssV0FBVztBQUMvQyxRQUFNLGFBQWEsV0FBVyxLQUFLLFVBQVU7QUFDN0MsUUFBTSxZQUFZLFdBQVcsS0FBSyxTQUFTO0FBQzNDLFFBQU0sYUFBYSxXQUFXLEtBQUssVUFBVTtBQUM3QyxRQUFNLFlBQVksV0FBVyxLQUFLLFNBQVM7QUFDM0MsUUFBTSxXQUFXLEtBQUssV0FBVztBQUNqQyxRQUFNLFVBQVUsS0FBSyxVQUFVO0FBQy9CLFFBQU0sV0FBVyxLQUFLLFdBQVc7QUFDakMsUUFBTSxZQUFZLEtBQUs7QUFFdkIsc0JBQW9CLFdBQVcsWUFBWSxhQUFhLFlBQVksV0FBVyxZQUFZLFdBQVcsVUFBVSxTQUFTLFVBQVUsU0FBUztBQUNoSjtBQWZnQjtBQWlCVCxTQUFTLGVBQWUsV0FBbUIsTUFBTTtBQUNwRCxRQUFNLFFBQVEsS0FBSztBQUVuQixNQUFJLFVBQVUsSUFBSTtBQUNkLG1CQUFlLFdBQVcsS0FBSyxLQUFLO0FBQ3BDO0FBQUEsRUFDSjtBQUVBLFFBQU0sUUFBUSxLQUFLO0FBR25CLE1BQUksS0FBSyxPQUFPLGFBQWE7QUFDekIsbUJBQWUsV0FBVyxLQUFLLFdBQVcsS0FBSyxhQUFhO0FBQzVEO0FBQUEsRUFDSjtBQUVBLG9CQUFrQixXQUFXLE9BQU8sT0FBTyxLQUFLLGlCQUFpQixDQUFHO0FBQ3BFLHlCQUF1QixXQUFXLE9BQU8sR0FBRyxLQUFLLFlBQVksS0FBSyxXQUFXO0FBQ2pGO0FBbEJnQjtBQXFCVCxTQUFTLGFBQWEsTUFBTTtBQUMvQixRQUFNLFlBQVksS0FBSztBQUN2QixRQUFNLFFBQVEsS0FBSztBQUVuQixhQUFXLENBQUMsWUFBWSxVQUFVLEtBQUssT0FBTyxRQUFRLGVBQWMsR0FBRztBQUNuRSxVQUFNLGFBQWEsV0FBVztBQUM5QixVQUFNLFFBQVEsV0FBVztBQUV6QixRQUFJLGVBQWUsY0FBYyxVQUFVLFVBQVUsR0FBRztBQUNwRCxZQUFNLGtCQUFrQix3QkFBd0IsS0FBSyxLQUFLO0FBQzFELFVBQUksb0JBQW9CLFVBQVUsVUFBVSxFQUFFLE9BQU87QUFDakQsaUNBQXlCLEtBQUssT0FBTyxVQUFVLFVBQVUsRUFBRSxPQUFPLEdBQUcsQ0FBQztBQUFBLE1BQzFFO0FBQUEsSUFDSixXQUFXLGVBQWUsVUFBVSxNQUFNLFVBQVUsR0FBRztBQUNuRCxZQUFNLGNBQWMsZ0JBQWdCLEtBQUssS0FBSztBQUM5QyxVQUFJLGdCQUFnQixNQUFNLFVBQVUsRUFBRSxPQUFPO0FBQ3pDLHdCQUFnQixLQUFLLE9BQU8sTUFBTSxVQUFVLEVBQUUsT0FBTyxHQUFHLEtBQUs7QUFBQSxNQUNqRTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0o7QUFwQmdCO0FBc0JULFNBQVMsY0FBYyxXQUFtQixNQUFnQjtBQUM3RCxRQUFNLFlBQVksS0FBSztBQUN2QixRQUFNLFFBQVEsS0FBSztBQUNuQixRQUFNLGNBQWMsS0FBSztBQUN6QixhQUFXLE1BQU0sV0FBVztBQUN4QixVQUFNLFdBQVcsVUFBVSxFQUFFO0FBQzdCLGdCQUFZLFdBQVcsUUFBUTtBQUFBLEVBQ25DO0FBRUEsYUFBVyxNQUFNLE9BQU87QUFDcEIsVUFBTSxPQUFPLE1BQU0sRUFBRTtBQUNyQixZQUFRLFdBQVcsSUFBSTtBQUFBLEVBQzNCO0FBRUEsYUFBVyxNQUFNLGFBQWE7QUFDMUIsVUFBTSxVQUFVLFlBQVksRUFBRTtBQUM5QixtQkFBZSxXQUFXLE9BQU87QUFBQSxFQUNyQztBQUNKO0FBbEJnQjtBQW9CVCxJQUFNLGFBQWEsOEJBQU8sV0FBbUIsU0FBZ0I7QUFDaEUsUUFBTSxnQkFBZ0IsS0FBSztBQUMzQixRQUFNLFlBQVksS0FBSztBQUV2QixNQUFJLE1BQU07QUFDTixnQkFBWSxNQUFNLFNBQVMsV0FBVyxJQUFJO0FBQUEsRUFDOUM7QUFHQSxNQUFJO0FBQVcsaUJBQWEsV0FBVyxTQUFTO0FBRWhELE1BQUk7QUFBZSxlQUFXLFdBQVcsZUFBZTtBQUNwRCxZQUFNLFFBQVEsY0FBYyxPQUFPO0FBQ25DLHFCQUFlLFdBQVcsS0FBSztBQUFBLElBQ25DO0FBQ0osR0FmMEI7QUFpQm5CLFNBQVMsY0FBYyxXQUFtQixNQUFpQjtBQUM5RCxNQUFJLENBQUM7QUFBTTtBQUVYLGdDQUE4QixTQUFTO0FBRXZDLFdBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEtBQUs7QUFDbEMsVUFBTSxhQUFhLEtBQUssQ0FBQyxFQUFFO0FBQzNCLFFBQUksWUFBWTtBQUNaLFlBQU0sYUFBYSxXQUFXLFdBQVcsR0FBRztBQUM1QyxZQUFNLFNBQVMsV0FBVztBQUMxQixpQ0FBMkIsV0FBVyxZQUFZLE1BQU07QUFBQSxJQUM1RDtBQUFBLEVBQ0o7QUFDSjtBQWJnQjtBQWVULFNBQVMsaUJBQWlCLFdBQW1CLE1BQWtCO0FBQ2xFLE1BQUksQ0FBQztBQUFNO0FBQ1gsUUFBTSxRQUFRLEtBQUs7QUFDbkIsUUFBTSxZQUFZLEtBQUs7QUFDdkIsa0JBQWdCLFdBQVcsT0FBTyxTQUFTO0FBQy9DO0FBTGdCO0FBT2hCLGVBQXNCLGlCQUFpQixXQUFtQixNQUFtQjtBQUN6RSxNQUFJLGFBQWEsU0FBUyxHQUFHO0FBQ3pCLDJCQUF1QixJQUFJO0FBQUEsRUFDL0I7QUFDQSxRQUFNLFdBQVcsV0FBVyxJQUFJO0FBQ2hDLGdCQUFjLFdBQVcsSUFBSTtBQUM3QixtQkFBaUIsV0FBVyxLQUFLLFNBQVM7QUFDMUMsZ0JBQWMsV0FBVyxLQUFLLE9BQU87QUFDekM7QUFSc0I7QUFVdEIsZUFBc0IsdUJBQXVCLE1BQW1CO0FBQzVELFFBQU0sV0FBVyxLQUFLLElBQUk7QUFDMUIsWUFBVSxZQUFZLENBQUM7QUFDdkIsZ0JBQWMsS0FBSyxJQUFJO0FBQ3ZCLG1CQUFpQixLQUFLLEtBQUssU0FBUztBQUNwQyxnQkFBYyxLQUFLLEtBQUssT0FBTztBQUNuQztBQU5zQjtBQVF0QixRQUFRLGlCQUFpQixhQUFhO0FBQ3RDLFFBQVEsY0FBYyxVQUFVO0FBQ2hDLFFBQVEsaUJBQWlCLGFBQWE7QUFDdEMsUUFBUSxvQkFBb0IsZ0JBQWdCOzs7QUNyTTVDLHNEQUFvQyxPQUFPLFlBQXlCLE9BQWlCO0FBQ3BGLFFBQU0sdUJBQXVCLFVBQVU7QUFDdkMsWUFBVTtBQUNWLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCxrREFBa0MsT0FBTyxZQUF5QixPQUFpQjtBQUNsRixlQUFhLFVBQVU7QUFFdkIsUUFBTSxNQUFNLEdBQUc7QUFFZixRQUFNLGdCQUFnQixNQUFNLGNBQWMsR0FBRztBQUM3QyxnQkFBYyxVQUFVLFdBQVc7QUFDbkMsd0JBQXNCLHVDQUF1QyxlQUFlLEdBQUcsYUFBYTtBQUU1RixnQkFBYyxLQUFLLGNBQWMsT0FBTztBQUV4QyxZQUFVO0FBQ1YsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELDBEQUFzQyxPQUFPLE9BQWUsT0FBaUI7QUFDNUUsUUFBTSxPQUFPLFdBQVcsS0FBSztBQUM3QixNQUFJLENBQUMsaUJBQWlCLElBQUksS0FBSyxDQUFDLGFBQWEsSUFBSSxHQUFHO0FBQ25ELFdBQU8sR0FBRyxDQUFDO0FBQUEsRUFDWjtBQUdBLFFBQU0sU0FBUyxNQUFNLFNBQVMsS0FBSyxJQUFJO0FBRXBDLFlBQVUsTUFBTTtBQUVuQixRQUFNLGFBQWEsTUFBTSxjQUFjLEdBQUc7QUFFMUMsYUFBVyxVQUFVLENBQUM7QUFFdEIsZ0JBQWMsS0FBSyxDQUFDLENBQUM7QUFFckIsS0FBRyxVQUFVO0FBQ2QsQ0FBQztBQUVELHdFQUE2QyxPQUFPLEdBQVEsT0FBaUI7QUFDNUUsUUFBTSxVQUFVLGNBQWM7QUFFOUIsS0FBRyxPQUFPO0FBQ1gsQ0FBQztBQUVELDBFQUE4QyxPQUFPLE1BQWMsT0FBaUI7QUFDbkYsaUJBQWUsS0FBSyxJQUFJO0FBQ3hCLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCxzRUFBNEMsT0FBTyxNQUFjLE9BQWlCO0FBQ2pGLGlCQUFlLEtBQUssSUFBSTtBQUN4QixLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsa0VBQTBDLE9BQU8sTUFBYyxPQUFpQjtBQUMvRSxlQUFhLEtBQUssSUFBSTtBQUN0QixLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsOERBQXdDLE9BQU8sTUFBaUIsT0FBaUI7QUFDaEYsZ0JBQWMsS0FBSyxJQUFJO0FBQ3ZCLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCx3REFBcUMsT0FBTyxNQUFjLE9BQWlCO0FBQzFFLE1BQUksVUFBVSxRQUFRLEtBQUssSUFBSTtBQUMvQixLQUFHLE9BQU87QUFDWCxDQUFDO0FBRUQsZ0VBQXlDLE9BQU8sTUFBYyxPQUFpQjtBQUM5RSxNQUFJLFVBQVUsWUFBWSxLQUFLLElBQUk7QUFDbkMsS0FBRyxPQUFPO0FBQ1gsQ0FBQztBQUVEO0FBQUE7QUFBQSxFQUF3QyxPQUFPLE1BQW1CLE9BQWlCO0FBQ2xGLFVBQU0sT0FBTyxnQkFBZSxLQUFLLElBQUk7QUFDckMsUUFBSSxDQUFDO0FBQU0sYUFBTyxHQUFHLEtBQUs7QUFFMUIsVUFBTSxVQUFVLEtBQUs7QUFDckIsVUFBTSxPQUFPLEtBQUs7QUFDbEIsVUFBTSxRQUFRLEtBQUs7QUFDbkIsVUFBTSxPQUFPLEtBQUs7QUFDbEIsVUFBTSxXQUFXLEtBQUs7QUFFdEIsUUFBSSxDQUFDO0FBQVMsYUFBTyxHQUFHLEtBQUs7QUFFN0IsUUFBSSxTQUFTLFFBQVE7QUFDcEIsWUFBTSxjQUFjLGdCQUFnQixLQUFLLEtBQUs7QUFFOUMsVUFBSSxnQkFBZ0IsSUFBSTtBQUN2QixnQkFBUSxLQUFLLE9BQU87QUFDcEIsV0FBRyxLQUFLO0FBQ1I7QUFBQSxNQUNELE9BQU87QUFDTixxQkFBYSxLQUFLLEtBQUs7QUFDdkIsV0FBRyxJQUFJO0FBQ1A7QUFBQSxNQUNEO0FBQUEsSUFDRCxXQUFXLFNBQVMsWUFBWTtBQUMvQixZQUFNLGtCQUFrQix3QkFBd0IsS0FBSyxLQUFLO0FBRTFELFVBQUksUUFBUSxVQUFVLEtBQUssS0FBSztBQUMvQixXQUFHLEtBQUs7QUFDUjtBQUFBLE1BQ0Q7QUFFQSxVQUFJLFFBQVEsVUFBVSxpQkFBaUI7QUFDdEMsaUNBQXlCLEtBQUssT0FBTyxLQUFLLEtBQUssR0FBRyxDQUFDO0FBQ25ELFlBQUksTUFBTTtBQUNULG1CQUFRLElBQUUsR0FBRyxJQUFJLEtBQUssV0FBVyxRQUFRLEtBQUs7QUFDN0Msa0JBQU0sV0FBVyxLQUFLLFVBQVUsQ0FBQztBQUNqQyxxQ0FBeUIsS0FBSyxTQUFTLFdBQVcsU0FBUyxTQUFTLFNBQVMsU0FBUyxDQUFDO0FBQUEsVUFDeEY7QUFBQSxRQUNEO0FBQ0EsV0FBRyxJQUFJO0FBQ1A7QUFBQSxNQUNELE9BQU87QUFDTixvQkFBWSxLQUFLLE9BQU87QUFDeEIsaUJBQVEsSUFBRSxHQUFHLElBQUksVUFBVSxRQUFRLEtBQUs7QUFDdkMsc0JBQVksS0FBSyxTQUFTLENBQUMsQ0FBQztBQUFBLFFBQzdCO0FBQ0EsV0FBRyxLQUFLO0FBQ1I7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFDQTtBQUVBLDhEQUF3QyxPQUFPLE1BQVcsT0FBaUI7QUFDMUUsUUFBTSxlQUFlLGVBQWU7QUFDcEMsUUFBTSxTQUFTLE1BQU0sc0JBQXNCLG1DQUFtQyxjQUFjLElBQUk7QUFDaEcsS0FBRyxNQUFNO0FBQ1YsQ0FBQztBQUVELGtFQUEwQyxPQUFPLEVBQUMsR0FBRSxHQUFHLE9BQWlCO0FBQ3ZFLFFBQU0sZUFBZSxlQUFlO0FBQ3BDLFFBQU0sU0FBUyxNQUFNLHNCQUFzQixxQ0FBcUMsY0FBYyxFQUFFO0FBQ2hHLEtBQUcsTUFBTTtBQUNWLENBQUM7QUFFRCxrRUFBMEMsT0FBTyxNQUFXLE9BQWlCO0FBQzVFLFFBQU0sZUFBZSxlQUFlO0FBQ3BDLFFBQU0sU0FBUyxNQUFNLHNCQUFzQixxQ0FBcUMsY0FBYyxJQUFJO0FBQ2xHLEtBQUcsTUFBTTtBQUNWLENBQUM7QUFFRCw0REFBdUMsT0FBTyxRQUFnQixPQUFpQjtBQUM5RSxnQkFBYyxLQUFLLE1BQU07QUFDekIsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELGtFQUEwQyxPQUFPLEVBQUUsSUFBSSxXQUFXLEdBQUcsT0FBaUI7QUFDckYsUUFBTSxlQUFlLGVBQWU7QUFDcEMsUUFBTSxTQUFTLE1BQU0sc0JBQXNCLHFDQUFxQyxjQUFjLElBQUksVUFBVTtBQUM1RyxLQUFHLE1BQU07QUFDVixDQUFDO0FBRUQsOERBQXdDLE9BQU8sRUFBRSxHQUFHLEdBQUcsT0FBaUI7QUFDdkUsUUFBTSxTQUFTLE1BQU0sc0JBQXNCLG1DQUFtQyxFQUFFO0FBQ2hGLEtBQUcsTUFBTTtBQUNWLENBQUM7QUFFRCw4REFBd0MsT0FBTyxNQUF1QyxPQUFpQjtBQUN0RyxRQUFNLFNBQVMsTUFBTSxzQkFBc0IsbUNBQWtDLElBQUk7QUFDakYsS0FBRyxNQUFNO0FBQ1YsQ0FBQztBQUVELE1BQU0sa0NBQWtDLENBQUMsV0FBbUI7QUFDM0QsZ0JBQWMsS0FBSyxNQUFNO0FBQzFCLENBQUM7OztBQ3hMRCxJQUFNLFNBQVMsUUFBUTtBQUN2QixJQUFJLFNBQVM7QUFDYixJQUFJLE9BQU87QUFFWCxJQUFJLGlCQUFpQjtBQUNyQixJQUFJLFVBQVU7QUFFZCxlQUFzQixTQUFTLE1BQXVCLFdBQW9CLE9BQU87QUFDN0UsTUFBSSxTQUFTLFFBQVEsTUFBTTtBQUN2QjtBQUFBLEVBQ0o7QUFFQSxNQUFJLFlBQVksWUFBWTtBQUM1QixRQUFNLGNBQWMsT0FBTyxNQUFNO0FBRWpDLFFBQU0sT0FBTyxLQUFLO0FBRWxCLFFBQU0sT0FBTyxZQUFZLElBQUk7QUFDN0IsTUFBSSxDQUFDO0FBQU07QUFFWCxZQUFVLFNBQVM7QUFHbkIsUUFBTSxlQUFlLGVBQWU7QUFDcEMsUUFBTSxPQUFPLEtBQUs7QUFDbEIsTUFBSSxZQUFZLFdBQVcsUUFBUSxLQUFLO0FBRXhDLFdBQVMsYUFBYSxTQUFTO0FBRS9CLE1BQUksVUFBVSxDQUFDO0FBRWYsUUFBTSxlQUFlLEtBQUssU0FBUyxTQUFTO0FBQzVDLE1BQUk7QUFBYyxjQUFVLE1BQU0sc0JBQWdDLG1DQUFtQyxZQUFZO0FBRWpILE1BQUksU0FBUyxDQUFDO0FBRWQsUUFBTSxpQkFBaUIsS0FBSyxTQUFTLFVBQVU7QUFDL0MsTUFBSSxnQkFBZ0I7QUFDaEIsYUFBUyxPQUFPLE9BQU87QUFBQSxFQUMzQjtBQUVBLFFBQU0sZUFBZSxLQUFLLFNBQVMsU0FBUztBQUM1QyxNQUFJO0FBQ0osTUFBSSxjQUFjO0FBQ2QsY0FBVSxjQUFjO0FBQUEsRUFDNUI7QUFFQSxRQUFNLFlBQVksYUFBYSxJQUFJO0FBRW5DLE1BQUksVUFBVTtBQUNWLFVBQU0sUUFBUSxXQUFXLHFCQUFxQixDQUFDO0FBQy9DLGdCQUFZLE1BQU0sU0FBUyxXQUFXLEtBQUs7QUFDM0MsWUFBUSx1Q0FBdUM7QUFDL0MsY0FBVSxJQUFJLFFBQVEsYUFBVztBQUM3Qix1QkFBaUI7QUFBQSxJQUNyQixDQUFDO0FBRUQsY0FBVSxTQUFTO0FBQUEsRUFDdkI7QUFFQSxRQUFNLGFBQWEsTUFBTSxjQUFjLFNBQVM7QUFJaEQsY0FBWTtBQUVaLDZDQUF3QjtBQUFBLElBQ3BCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxLQUFLLFdBQVc7QUFBQSxJQUNoQixRQUFRLE1BQU0sY0FBYyxRQUFRO0FBQUEsRUFDeEMsQ0FBQztBQUNELGNBQVksTUFBTSxJQUFJO0FBQ3RCLG1EQUEyQixJQUFJO0FBQy9CLFNBQU87QUFFUCxVQUFRLGNBQWMsUUFBUSxJQUFJO0FBRWxDLE1BQUksU0FBUztBQUNULFVBQU07QUFDTixZQUFRLHlDQUF5QztBQUFBLEVBQ3JEO0FBRUEsWUFBVTtBQUNWLG1CQUFpQjtBQUNqQixTQUFPO0FBQ1g7QUFwRnNCO0FBc0Z0QixRQUFRLFlBQVksUUFBUTtBQUU1QixTQUFTLGFBQWEsTUFBdUI7QUFDekMsTUFBSSxDQUFDO0FBQU0sV0FBTyxDQUFDO0FBRW5CLFFBQU0sRUFBQyxZQUFZLEtBQUksSUFBSSxPQUFPLFVBQVU7QUFFNUMsTUFBSSxDQUFDO0FBQVksV0FBTyxDQUFDO0FBQ3pCLE1BQUksQ0FBQztBQUFNLFdBQU8sQ0FBQztBQUVuQixNQUFJLFlBQVksRUFBQyxHQUFHLEtBQUk7QUFFeEIsUUFBTSxhQUFhLGNBQWM7QUFHakMsYUFBVyxRQUFRLFlBQVk7QUFDM0IsVUFBTSxTQUFTLFdBQVcsSUFBSTtBQUM5QixlQUFXLFNBQVMsUUFBUTtBQUV4QixVQUFJLE9BQWdCO0FBRXBCLFVBQUksUUFBUSxVQUFVLEtBQUssTUFBTTtBQUM3QixlQUFPLEtBQUssS0FBSyxTQUFTLFdBQVcsSUFBSSxJQUFJO0FBQUEsTUFDakQ7QUFFQSxVQUFJLFFBQVEsV0FBVyxLQUFLLE9BQU87QUFDL0IsZUFBTyxLQUFLLE1BQU0sU0FBUyxXQUFXLEtBQUssSUFBSTtBQUFBLE1BQ25EO0FBTUEsVUFBSSxDQUFDLE1BQU07QUFDUCxjQUFNLGlCQUFpQixPQUFPLEtBQUs7QUFDbkMsb0JBQVksT0FBTyxPQUFPLENBQUMsR0FBRyxXQUFXLGdCQUFnQjtBQUFBLFVBQ3ZELFdBQVcsT0FBTyxPQUFPLENBQUMsR0FBRyxVQUFVLFdBQVcsZUFBZSxTQUFTO0FBQUEsUUFDNUUsQ0FBQztBQUFBLE1BQ0w7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUVBLFNBQU87QUFHWDtBQTNDUztBQTZDRixTQUFTLFlBQVk7QUFDeEIsZUFBYSxLQUFLLE1BQU07QUFFeEIsYUFBVztBQUNYLGNBQVksT0FBTyxLQUFLO0FBQ3hCLG1EQUEyQixLQUFLO0FBR2hDLFVBQVEsY0FBYyxRQUFRLEtBQUs7QUFFbkMsTUFBSSxnQkFBZ0I7QUFDaEIsbUJBQWU7QUFBQSxFQUNuQjtBQUNBLFNBQU87QUFDWDtBQWRnQjs7O0FDaEpULFNBQVMsV0FBVztBQUN2QixRQUFNLHlDQUF5QyxPQUFPLFlBQXlCQyxTQUFnQjtBQUMzRixVQUFNLGlCQUFpQkEsTUFBSyxVQUFVO0FBQUEsRUFDMUMsQ0FBQztBQUVELFFBQU0sMENBQTBDLE1BQU07QUFDbEQsWUFBUSxjQUFjLGdCQUFnQjtBQUFBLEVBQzFDLENBQUM7QUFFRCxRQUFNLHFDQUFxQyxNQUFNO0FBQzdDLGFBQVMsRUFBRSxNQUFNLFdBQVcsUUFBUSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQUEsRUFDdEQsQ0FBQztBQUNMO0FBWmdCOzs7QUNBVCxTQUFTLFlBQVk7QUFDeEIsTUFBSSxhQUFhO0FBRWpCLEtBQUcsNEJBQTRCLE1BQU07QUFDakMsaUJBQWE7QUFBQSxFQUNqQixDQUFDO0FBRUQsS0FBRyw2QkFBNkIsTUFBTTtBQUNsQyxRQUFHO0FBQ0MsY0FBUSxjQUFjLGdCQUFnQjtBQUFBLEVBQzlDLENBQUM7QUFFRCxRQUFNLHlCQUF5QixPQUFPLFlBQXlCQyxTQUFnQjtBQUMzRSxRQUFJLENBQUMsV0FBVztBQUFPLGlCQUFXLFFBQVEsV0FBVyxrQkFBa0I7QUFDdkUsVUFBTSxpQkFBaUJBLE1BQUssVUFBVTtBQUFBLEVBQzFDLENBQUM7QUFFRCxRQUFNLHVCQUF1QixPQUFPLE9BQVk7QUFDNUMsVUFBTSxjQUFjLE1BQU0sZUFBZTtBQUN6QyxVQUFNLGFBQWEsTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFDN0csT0FBRyxVQUFVO0FBQUEsRUFDakIsQ0FBQztBQUVELFFBQU0sd0JBQXdCLE9BQU8sWUFBeUIsT0FBWTtBQUN0RSxVQUFNLHVCQUF1QixVQUFVO0FBQ3ZDLFFBQUk7QUFBSSxTQUFHO0FBQUEsRUFDZixDQUFDO0FBRUQsUUFBTSw2QkFBNkIsT0FBTyxhQUFrQjtBQUN4RCxZQUFRLGNBQWMsZ0JBQWdCLFFBQVE7QUFBQSxFQUNsRCxDQUFDO0FBQ0w7QUEvQmdCOzs7QUNBaEIsU0FBUyxjQUFjLE1BQWMsSUFBUztBQUMxQyxLQUFHLHNDQUFzQyxNQUFNLENBQUMsVUFBZTtBQUMzRCxVQUFNLEVBQUU7QUFBQSxFQUNaLENBQUM7QUFDTDtBQUpTO0FBTUYsU0FBUyxpQkFBaUI7QUFDN0IsZ0JBQWMsNEJBQTRCLE1BQU07QUFDNUMsWUFBUSxjQUFjLGdCQUFnQjtBQUFBLEVBQzFDLENBQUM7QUFFRCxnQkFBYyxlQUFlLENBQUNDLFNBQWdCO0FBQzFDLFdBQU8sZUFBZUEsSUFBRztBQUFBLEVBQzdCLENBQUM7QUFFRCxnQkFBYyxvQkFBb0IsQ0FBQ0EsU0FBZ0I7QUFDL0MsVUFBTSxZQUFpQixhQUFhQSxJQUFHLEVBQUUsQ0FBQztBQUMxQyxRQUFJLGNBQWMsQ0FBQztBQUNuQixlQUFXLE1BQU0sV0FBVztBQUN4QixZQUFNLFdBQVcsVUFBVSxFQUFFO0FBQzdCLGtCQUFZLEtBQUs7QUFBQSxRQUNiLGNBQWMsU0FBUztBQUFBLFFBQ3ZCLFVBQVUsU0FBUztBQUFBLFFBQ25CLFNBQVMsU0FBUztBQUFBLE1BQ3RCLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSixDQUFDO0FBRUQsZ0JBQWMsZUFBZSxDQUFDQSxTQUFnQjtBQUMxQyxVQUFNLFFBQWMsU0FBU0EsSUFBRyxFQUFFLENBQUM7QUFDbkMsUUFBSSxXQUFXLENBQUM7QUFDaEIsZUFBVyxNQUFNLE9BQU87QUFDcEIsWUFBTSxPQUFPLE1BQU0sRUFBRTtBQUNyQixlQUFTLEtBQUs7QUFBQSxRQUNWLFNBQVMsS0FBSztBQUFBLFFBQ2QsVUFBVSxLQUFLO0FBQUEsUUFDZixTQUFTLEtBQUs7QUFBQSxNQUNsQixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0osQ0FBQztBQUVELGdCQUFjLG1CQUFtQixDQUFDQSxTQUFnQjtBQUM5QyxXQUFPLFFBQVEsS0FBSyxvQ0FBb0M7QUFBQSxFQUU1RCxDQUFDO0FBRUQsZ0JBQWMsc0JBQXNCLENBQUNBLFNBQWdCO0FBQ2pELFdBQU8sUUFBUSxLQUFLLG9DQUFvQztBQUFBLEVBRTVELENBQUM7QUFFRCxnQkFBYyxzQkFBc0IsQ0FBQ0EsU0FBZ0I7QUFDakQsV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBQUEsRUFFNUQsQ0FBQztBQUVELGdCQUFjLGNBQWMsQ0FBQ0EsU0FBZ0I7QUFFekMsV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBQUEsRUFDNUQsQ0FBQztBQUVELGdCQUFjLG9CQUFvQixDQUFDQSxTQUFnQjtBQUMvQyxXQUFPLGNBQWNBLElBQUc7QUFBQSxFQUM1QixDQUFDO0FBRUQsZ0JBQWMsa0JBQWtCLENBQUMsVUFBa0I7QUFDL0MsYUFBUyxZQUFZLEdBQUcsS0FBSztBQUFBLEVBQ2pDLENBQUM7QUFFRCxnQkFBYyxtQkFBbUIsQ0FBQ0EsTUFBYSxVQUFlO0FBRTFELFdBQU8sUUFBUSxLQUFLLG9DQUFvQztBQUFBLEVBQzVELENBQUM7QUFFRCxnQkFBYyxzQkFBc0IsTUFBTTtBQUN0QyxXQUFPLFFBQVEsS0FBSyxvQ0FBb0M7QUFBQSxFQUM1RCxDQUFDO0FBRUQsZ0JBQWMsc0JBQXNCLENBQUNBLE1BQWEsWUFBaUI7QUFFL0QsV0FBTyxRQUFRLEtBQUssb0NBQW9DO0FBQUEsRUFDNUQsQ0FBQztBQUVELGdCQUFjLGNBQWMsT0FBT0EsTUFBYSxNQUFXLFdBQWdCO0FBRXZFLFdBQU8sUUFBUSxLQUFLLG9DQUFvQztBQUFBLEVBQzVELENBQUM7QUFFRCxnQkFBYyxrQkFBa0IsTUFBTTtBQUNsQyxXQUFPLFFBQVEsS0FBSyxvQ0FBb0M7QUFBQSxFQUM1RCxDQUFDO0FBRUQsZ0JBQWMsbUJBQW1CLENBQUNBLE1BQWEsYUFBa0I7QUFDN0QsVUFBTSxjQUFjO0FBQUEsTUFDaEIsT0FBTyxTQUFTO0FBQUEsTUFDaEIsT0FBTyxTQUFTO0FBQUEsTUFDaEIsU0FBUyxTQUFTO0FBQUEsSUFDdEI7QUFDQSxnQkFBWUEsTUFBSyxXQUFXO0FBQUEsRUFDaEMsQ0FBQztBQUVELGdCQUFjLG9CQUFvQixDQUFDQSxNQUFhLGVBQW9CO0FBQ2hFLGVBQVcsYUFBYSxZQUFZO0FBQ2hDLFlBQU0sY0FBYztBQUFBLFFBQ2hCLE9BQU8sVUFBVTtBQUFBLFFBQ2pCLE9BQU8sVUFBVTtBQUFBLFFBQ2pCLFNBQVMsVUFBVTtBQUFBLE1BQ3ZCO0FBQ0Esa0JBQVlBLE1BQUssV0FBVztBQUFBLElBQ2hDO0FBQUEsRUFDSixDQUFDO0FBRUQsZ0JBQWMsY0FBYyxDQUFDQSxNQUFhLFNBQWM7QUFDcEQsVUFBTSxVQUFVO0FBQUEsTUFDWixPQUFPLEtBQUs7QUFBQSxNQUNaLE9BQU8sS0FBSztBQUFBLE1BQ1osU0FBUyxLQUFLO0FBQUEsSUFDbEI7QUFDQSxZQUFRQSxNQUFLLE9BQU87QUFBQSxFQUN4QixDQUFDO0FBRUQsZ0JBQWMsZUFBZSxDQUFDQSxNQUFhLFVBQWU7QUFDdEQsZUFBVyxRQUFRLE9BQU87QUFDdEIsWUFBTSxVQUFVO0FBQUEsUUFDWixPQUFPLEtBQUs7QUFBQSxRQUNaLE9BQU8sS0FBSztBQUFBLFFBQ1osU0FBUyxLQUFLO0FBQUEsTUFDbEI7QUFDQSxjQUFRQSxNQUFLLE9BQU87QUFBQSxJQUN4QjtBQUFBLEVBQ0osQ0FBQztBQU1ELGdCQUFjLG9CQUFvQixDQUFDQSxNQUFhLGVBQTRCO0FBQ3hFLHFCQUFpQkEsTUFBSyxVQUFVO0FBQUEsRUFDcEMsQ0FBQztBQUVELGdCQUFjLGlCQUFpQixDQUFDQSxNQUFhLFlBQXVCO0FBQ2hFLGtCQUFjQSxNQUFLLE9BQU87QUFBQSxFQUM5QixDQUFDO0FBQ0w7QUF6SWdCOzs7QUNIaEIsZ0JBQWdCLFlBQVksT0FBTyxHQUFHLFNBQW1CO0FBQ3JELFFBQU0sT0FBTyxLQUFLLENBQUM7QUFDbkIsTUFBSSxDQUFDLE1BQU07QUFDUCxZQUFRLGNBQWMsZ0JBQWdCO0FBQUEsRUFDMUMsT0FBTztBQUNILFVBQU0sT0FBTyxLQUFLLFlBQVk7QUFDOUIsYUFBUyxFQUFFLE1BQU0sTUFBTSxRQUFRLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFBQSxFQUNqRDtBQUNKLEdBQUcsSUFBSTtBQUVQLFFBQVEsb0JBQW9CLE9BQU9DLE1BQWEsZUFBNEI7QUFDeEUsUUFBTSxpQkFBaUJBLE1BQUssVUFBVTtBQUMxQyxDQUFDO0FBRUQsUUFBUSwwQkFBMEIsT0FBTyxlQUFxQztBQUMxRSxNQUFJO0FBRUosTUFBSSxDQUFDLGNBQWMsT0FBTyxlQUFlLFVBQVU7QUFDL0MsVUFBTSxjQUFzQixjQUFjLE1BQU0sZUFBZTtBQUMvRCx5QkFBcUIsTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFBQSxFQUNuSCxXQUFXLE9BQU8sZUFBZTtBQUFVLHlCQUFxQjtBQUVoRSxNQUFJLENBQUMsb0JBQW9CO0FBQ3JCLFVBQU0sSUFBSSxNQUFNLDJCQUEyQjtBQUFBLEVBQy9DO0FBRUEsUUFBTSx1QkFBdUIsa0JBQWtCO0FBQ25ELENBQUM7QUFFRCxRQUFRLDBCQUEwQixPQUFPLGdCQUF3QjtBQUM3RCxnQkFBYyxlQUFlLE1BQU0sZUFBZTtBQUNsRCxTQUFPLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQ3JHLENBQUM7QUFFRCxRQUFRLG1CQUFtQixPQUFPLE9BQWtCO0FBRWhELFFBQU0sU0FBUyxFQUFFLE1BQU0sY0FBYyxRQUFRLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsSUFBSTtBQUNqRSxNQUFJO0FBQUksT0FBRztBQUNmLENBQUM7QUFFRCxHQUFHLDZCQUE2QixDQUFDLFNBQTBCO0FBQ3ZELFdBQVMsSUFBSTtBQUNqQixDQUFDO0FBRUQsTUFBTSxpQ0FBaUMsWUFBWTtBQUMvQyxTQUFPLENBQUMsVUFBVSxLQUFLLEVBQUUsYUFBYSxHQUFHO0FBQ3JDLFVBQU0sTUFBTSxHQUFHO0FBQUEsRUFDbkI7QUFDQSxRQUFNLGNBQWMsTUFBTSxlQUFlO0FBQ3pDLFFBQU0sYUFBYSxNQUFNLHNCQUFtQyxzQ0FBc0MsV0FBVztBQUM3RyxNQUFJLENBQUM7QUFBWTtBQUNqQixRQUFNLHVCQUF1QixVQUFVO0FBQzNDLENBQUM7QUFFRCxNQUFNLG1CQUFtQixPQUFPLGFBQXFCO0FBQ2pELE1BQUksYUFBYSx1QkFBdUIsS0FBSyxVQUFVLEtBQUssRUFBRSxhQUFhLEdBQUc7QUFDMUUsVUFBTSxjQUFjLE1BQU0sZUFBZTtBQUN6QyxVQUFNLGFBQWEsTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFDN0csUUFBSSxDQUFDO0FBQVk7QUFDakIsVUFBTSx1QkFBdUIsVUFBVTtBQUFBLEVBQzNDO0FBQ0osQ0FBQztBQUVELElBQU0sZ0JBQWdCLFVBQVUsYUFBYSxNQUFNO0FBQ25ELElBQU0sT0FBTyxPQUFPLFVBQVUsZ0JBQWdCLElBQUksQ0FBQztBQUVuRCxJQUFJLFFBQVEsUUFBUSxRQUFRLFNBQVMsaUJBQWlCLGFBQWEsS0FBSyxXQUFXO0FBQy9FLFdBQVM7QUFDYixXQUFXLFFBQVEsU0FBUyxpQkFBaUIsYUFBYSxLQUFLLFdBQVc7QUFDdEUsWUFBVTtBQUNkO0FBRUEsZUFBZTtBQUVmLGdCQUFnQixjQUFjLFlBQVk7QUFDdEMsUUFBTSxjQUFjLE1BQU0sZUFBZTtBQUN6QyxRQUFNLFNBQVMsZ0JBQWdCLEdBQUc7QUFDbEMsUUFBTSxZQUFZLG1CQUFtQixHQUFHO0FBQ3hDLFFBQU0sUUFBUSxhQUFhLEdBQUc7QUFFOUIsUUFBTSxhQUFhLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQzdHLE1BQUksQ0FBQztBQUFZO0FBQ2pCLFFBQU0sdUJBQXVCLFVBQVU7QUFFdkMsa0JBQWdCLEtBQUssU0FBUztBQUM5QixRQUFNLEdBQUk7QUFDVixrQkFBZ0IsS0FBSyxNQUFNO0FBQzNCLGVBQWEsS0FBSyxLQUFLO0FBQzNCLEdBQUcsS0FBSzsiLAogICJuYW1lcyI6IFsiZGVsYXkiLCAieCIsICJ5IiwgInoiLCAiY29uZmlnIiwgInBlZCIsICJwZWQiLCAicGVkIiwgInBlZCJdCn0K
