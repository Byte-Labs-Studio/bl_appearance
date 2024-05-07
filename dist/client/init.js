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

// src/client/camera.ts
var running = false;
var camDistance = 1.8;
var cam = null;
var angleY = 0;
var angleZ = 0;
var targetCoords = null;
var oldCam = null;
var changingCam = false;
var lastX = 0;
var currentBone = "head";
var CameraBones = {
  head: 31086,
  torso: 24818,
  legs: 14201
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
  angleY = Math.min(Math.max(angleY, 0), 89);
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
  camDistance = 1;
  cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);
  const [x, y, z] = GetPedBoneCoords(ped, 31086, 0, 0, 0);
  SetCamCoord(cam, x, y, z);
  RenderScriptCams(true, true, 1e3, true, true);
  moveCamera({ x, y, z }, camDistance);
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
var setCamera = /* @__PURE__ */ __name((type) => {
  const bone = CameraBones[type];
  if (currentBone == type)
    return;
  const [x, y, z] = bone ? GetPedBoneCoords(ped, bone, 0, 0, bone === 14201 ? 0.2 : 0) : GetEntityCoords(ped, false);
  moveCamera(
    {
      x,
      y,
      z: z + 0
    },
    1
  );
  currentBone = type;
}, "setCamera");
RegisterNuiCallback("appearance:camMove" /* camMove */, (data, cb) => {
  cb(1);
  let heading = GetEntityHeading(ped);
  if (lastX == data.x) {
    return;
  }
  heading = data.x > lastX ? heading + 5 : heading - 5;
  SetEntityHeading(ped, heading);
});
RegisterNuiCallback("appearance:camScroll" /* camScroll */, (type, cb) => {
  switch (type) {
    case 2:
      setCamera();
      break;
    case 1:
      setCamera("legs");
      break;
    case 3:
      setCamera("head");
      break;
  }
  cb(1);
});
RegisterNuiCallback("appearance:camZoom" /* camZoom */, (data, cb) => {
  if (data === "down") {
    const newDistance = camDistance + 0.05;
    camDistance = newDistance >= 1 ? 1 : newDistance;
  } else if (data === "up") {
    const newDistance = camDistance - 0.05;
    camDistance = newDistance <= 0.35 ? 0.35 : newDistance;
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
        index: i - 1,
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
  let tattooZones = {};
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
    off: 15
  },
  jackets: {
    type: "drawable",
    index: 11,
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
}
__name(setDrawable, "setDrawable");
function setProp(pedHandle, data) {
  if (data.value === -1) {
    ClearPedProp(pedHandle, data.index);
    return;
  }
  SetPedPropIndex(pedHandle, data.index, data.value, data.texture, false);
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
  SetPedHeadBlendData(
    pedHandle,
    shapeFirst,
    shapeSecond,
    shapeThird,
    skinFirst,
    skinSecond,
    skinThird,
    shapeMix,
    skinMix,
    thirdMix,
    hasParent
  );
}
__name(setHeadBlend, "setHeadBlend");
function setHeadOverlay(pedHandle, data) {
  const index = data.index;
  if (index === 13) {
    SetPedEyeColor(pedHandle, data.value);
    return;
  }
  const value = data.overlayValue === -1 ? 255 : data.overlayValue;
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
  setProp(ped, data);
  cb(1);
});
RegisterNuiCallback("appearance:setDrawable" /* setDrawable */, async (data, cb) => {
  setDrawable(ped, data);
  cb(1);
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
        cb(true);
        return;
      } else {
        setDrawable(ped, current);
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
async function openMenu(zone, creation = false) {
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
    allowExit = false;
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
}
__name(openMenu, "openMenu");
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
}
__name(closeMenu, "closeMenu");

// src/client/init.ts
RegisterCommand("openMenu", () => {
  openMenu({ type: "appearance", coords: [0, 0, 0, 0] });
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
on("bl_sprites:client:useZone", (zone) => {
  openMenu(zone);
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgbGV0IHBlZCA9IDBcclxuXHJcbmV4cG9ydCBjb25zdCB1cGRhdGVQZWQgPSAocGVkSGFuZGxlOiBudW1iZXIpID0+IHtcclxuICAgIHBlZCA9IHBlZEhhbmRsZVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZGVidWdkYXRhID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZGF0YSwgKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXG4vZywgXCJcXFxcblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfSwgMikpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZW5kTlVJRXZlbnQgPSAoYWN0aW9uOiBzdHJpbmcsIGRhdGE6IGFueSkgPT4ge1xyXG4gICAgU2VuZE5VSU1lc3NhZ2Uoe1xyXG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgIGRhdGE6IGRhdGFcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RNb2RlbCA9IGFzeW5jIChtb2RlbDogc3RyaW5nIHwgbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+ID0+IHtcclxuICAgIGxldCBtb2RlbEhhc2g6IG51bWJlciA9IHR5cGVvZiBtb2RlbCA9PT0gJ251bWJlcicgPyBtb2RlbCA6IEdldEhhc2hLZXkobW9kZWwpXHJcblxyXG4gICAgaWYgKCFJc01vZGVsVmFsaWQobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9fb3hfY2JfJHtyZXNvdXJjZU5hbWV9YCwgKGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnkpID0+IHtcclxuICAgIGNvbnN0IHJlc29sdmUgPSBhY3RpdmVFdmVudHNba2V5XTtcclxuICAgIHJldHVybiByZXNvbHZlICYmIHJlc29sdmUoLi4uYXJncyk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUID0gdW5rbm93bj4oXHJcbiAgICBldmVudE5hbWU6IHN0cmluZywgLi4uYXJnczogYW55XHJcbik6IFByb21pc2U8VD4gfCB2b2lkIHtcclxuICAgIGlmICghZXZlbnRUaW1lcihldmVudE5hbWUsIDApKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBrZXk6IHN0cmluZztcclxuXHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuXHJcbiAgICBlbWl0TmV0KGBfX294X2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvblNlcnZlckNhbGxiYWNrKGV2ZW50TmFtZSwgY2IpIHtcclxuICAgIG9uTmV0KGBfX294X2NiXyR7ZXZlbnROYW1lfWAsIGFzeW5jIChyZXNvdXJjZSwga2V5LCAuLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgbGV0IHJlc3BvbnNlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlID0gYXdhaXQgY2IoLi4uYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGhhbmRsaW5nIGNhbGxiYWNrIGV2ZW50ICR7ZXZlbnROYW1lfWApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgXjMke2Uuc3RhY2t9XjBgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZW1pdE5ldChgX19veF9jYl8ke3Jlc291cmNlfWAsIGtleSwgcmVzcG9uc2UpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vbG9jYWxlXHJcblxyXG5leHBvcnQgY29uc3QgcmVxdWVzdExvY2FsZSA9IChyZXNvdXJjZVNldE5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2hlY2tSZXNvdXJjZUZpbGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChSZXF1ZXN0UmVzb3VyY2VGaWxlU2V0KHJlc291cmNlU2V0TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRMYW4gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UuY29uZmlnKCkubG9jYWxlXHJcbiAgICAgICAgICAgICAgICBsZXQgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS8ke2N1cnJlbnRMYW59Lmpzb25gKTtcclxuICAgICAgICAgICAgICAgIGlmICghbG9jYWxlRmlsZUNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke2N1cnJlbnRMYW59Lmpzb24gbm90IGZvdW5kIGluIGxvY2FsZSwgcGxlYXNlIHZlcmlmeSEsIHdlIHVzZWQgZW5nbGlzaCBmb3Igbm93IWApXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS9lbi5qc29uYClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUobG9jYWxlRmlsZUNvbnRlbnQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChjaGVja1Jlc291cmNlRmlsZSwgMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjaGVja1Jlc291cmNlRmlsZSgpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBsb2NhbGUgPSBhc3luYyAoaWQ6IHN0cmluZywgLi4uYXJnczogc3RyaW5nW10pID0+IHtcclxuICAgIGNvbnN0IGxvY2FsZSA9IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpO1xyXG4gICAgbGV0IGFyZ0luZGV4ID0gMDtcclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSBsb2NhbGVbaWRdLnJlcGxhY2UoLyVzL2csIChtYXRjaDogc3RyaW5nKSA9PiBhcmdJbmRleCA8IGFyZ3MubGVuZ3RoID8gYXJnc1thcmdJbmRleF0gOiBtYXRjaCk7XHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBibF9icmlkZ2UgPSBleHBvcnRzLmJsX2JyaWRnZVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldFBsYXllckRhdGEgPSAoKSA9PiB7XHJcbiAgICByZXR1cm4gYmxfYnJpZGdlLmNvcmUoKS5nZXRQbGF5ZXJEYXRhKClcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldEZyYW1ld29ya0lEID0gKCkgPT4ge1xyXG4gICAgY29uc3QgaWQgPSBnZXRQbGF5ZXJEYXRhKCkuY2lkXHJcbiAgICByZXR1cm4gaWRcclxufSIsICJpbXBvcnQgeyBDYW1lcmEsIFZlY3RvcjMsIENhbWVyYUJvbmVzIH0gZnJvbSAnQHR5cGluZ3MvY2FtZXJhJztcclxuaW1wb3J0IHsgZGVsYXksIHBlZCB9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IFJlY2VpdmUgfSBmcm9tICdAZXZlbnRzJztcclxuXHJcbmxldCBydW5uaW5nOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBjYW1EaXN0YW5jZTogbnVtYmVyID0gMS44O1xyXG5sZXQgY2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGFuZ2xlWTogbnVtYmVyID0gMC4wO1xyXG5sZXQgYW5nbGVaOiBudW1iZXIgPSAwLjA7XHJcbmxldCB0YXJnZXRDb29yZHM6IFZlY3RvcjMgfCBudWxsID0gbnVsbDtcclxubGV0IG9sZENhbTogQ2FtZXJhIHwgbnVsbCA9IG51bGw7XHJcbmxldCBjaGFuZ2luZ0NhbTogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgbGFzdFg6IG51bWJlciA9IDA7XHJcbmxldCBjdXJyZW50Qm9uZToga2V5b2YgQ2FtZXJhQm9uZXMgPSAnaGVhZCc7XHJcblxyXG5jb25zdCBDYW1lcmFCb25lczogQ2FtZXJhQm9uZXMgPSB7XHJcblx0aGVhZDogMzEwODYsXHJcblx0dG9yc286IDI0ODE4LFxyXG5cdGxlZ3M6IDE0MjAxLFxyXG59O1xyXG5cclxuY29uc3QgY29zID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguY29zKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3Qgc2luID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguc2luKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0QW5nbGVzID0gKCk6IG51bWJlcltdID0+IHtcclxuXHRjb25zdCB4ID1cclxuXHRcdCgoY29zKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSArIGNvcyhhbmdsZVkpICogY29zKGFuZ2xlWikpIC8gMikgKlxyXG5cdFx0Y2FtRGlzdGFuY2U7XHJcblx0Y29uc3QgeSA9XHJcblx0XHQoKHNpbihhbmdsZVopICogY29zKGFuZ2xlWSkgKyBjb3MoYW5nbGVZKSAqIHNpbihhbmdsZVopKSAvIDIpICpcclxuXHRcdGNhbURpc3RhbmNlO1xyXG5cdGNvbnN0IHogPSBzaW4oYW5nbGVZKSAqIGNhbURpc3RhbmNlO1xyXG5cclxuXHRyZXR1cm4gW3gsIHksIHpdO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtUG9zaXRpb24gPSAobW91c2VYPzogbnVtYmVyLCBtb3VzZVk/OiBudW1iZXIpOiB2b2lkID0+IHtcclxuXHRpZiAoIXJ1bm5pbmcgfHwgIXRhcmdldENvb3JkcyB8fCBjaGFuZ2luZ0NhbSkgcmV0dXJuO1xyXG5cclxuXHRtb3VzZVggPSBtb3VzZVggPz8gMC4wO1xyXG5cdG1vdXNlWSA9IG1vdXNlWSA/PyAwLjA7XHJcblxyXG5cdGFuZ2xlWiAtPSBtb3VzZVg7XHJcblx0YW5nbGVZICs9IG1vdXNlWTtcclxuXHRhbmdsZVkgPSBNYXRoLm1pbihNYXRoLm1heChhbmdsZVksIDAuMCksIDg5LjApO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKTtcclxuXHJcblx0U2V0Q2FtQ29vcmQoXHJcblx0XHRjYW0sXHJcblx0XHR0YXJnZXRDb29yZHMueCArIHgsXHJcblx0XHR0YXJnZXRDb29yZHMueSArIHksXHJcblx0XHR0YXJnZXRDb29yZHMueiArIHpcclxuXHQpO1xyXG5cdFBvaW50Q2FtQXRDb29yZChjYW0sIHRhcmdldENvb3Jkcy54LCB0YXJnZXRDb29yZHMueSwgdGFyZ2V0Q29vcmRzLnopO1xyXG59O1xyXG5cclxuY29uc3QgbW92ZUNhbWVyYSA9IGFzeW5jIChjb29yZHM6IFZlY3RvcjMsIGRpc3RhbmNlPzogbnVtYmVyKSA9PiB7XHJcblx0Y29uc3QgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpICsgOTQ7XHJcblx0ZGlzdGFuY2UgPSBkaXN0YW5jZSA/PyAxLjA7XHJcblxyXG5cdGNoYW5naW5nQ2FtID0gdHJ1ZTtcclxuXHRjYW1EaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG5cdGFuZ2xlWiA9IGhlYWRpbmc7XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpO1xyXG5cclxuXHRjb25zdCBuZXdjYW06IENhbWVyYSA9IENyZWF0ZUNhbVdpdGhQYXJhbXMoXHJcblx0XHQnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLFxyXG5cdFx0Y29vcmRzLnggKyB4LFxyXG5cdFx0Y29vcmRzLnkgKyB5LFxyXG5cdFx0Y29vcmRzLnogKyB6LFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0NzAuMCxcclxuXHRcdGZhbHNlLFxyXG5cdFx0MFxyXG5cdCk7XHJcblxyXG5cdHRhcmdldENvb3JkcyA9IGNvb3JkcztcclxuXHRjaGFuZ2luZ0NhbSA9IGZhbHNlO1xyXG5cdG9sZENhbSA9IGNhbTtcclxuXHRjYW0gPSBuZXdjYW07XHJcblxyXG5cdFBvaW50Q2FtQXRDb29yZChuZXdjYW0sIGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnopO1xyXG5cdFNldENhbUFjdGl2ZVdpdGhJbnRlcnAobmV3Y2FtLCBvbGRDYW0sIDI1MCwgMCwgMCk7XHJcblxyXG5cdGF3YWl0IGRlbGF5KDI1MCk7XHJcblxyXG5cdFNldENhbVVzZVNoYWxsb3dEb2ZNb2RlKG5ld2NhbSwgdHJ1ZSk7XHJcblx0U2V0Q2FtTmVhckRvZihuZXdjYW0sIDAuNCk7XHJcblx0U2V0Q2FtRmFyRG9mKG5ld2NhbSwgMS4yKTtcclxuXHRTZXRDYW1Eb2ZTdHJlbmd0aChuZXdjYW0sIDAuMyk7XHJcblx0dXNlSGlEb2YobmV3Y2FtKTtcclxuXHJcblx0RGVzdHJveUNhbShvbGRDYW0sIHRydWUpO1xyXG59O1xyXG5cclxuY29uc3QgdXNlSGlEb2YgPSAoY3VycmVudGNhbTogQ2FtZXJhKSA9PiB7XHJcblx0aWYgKCEoRG9lc0NhbUV4aXN0KGNhbSkgJiYgY3VycmVudGNhbSA9PSBjYW0pKSByZXR1cm47XHJcblx0U2V0VXNlSGlEb2YoKTtcclxuXHRzZXRUaW1lb3V0KHVzZUhpRG9mLCAwKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdGFydENhbWVyYSA9ICgpID0+IHtcclxuXHRpZiAocnVubmluZykgcmV0dXJuO1xyXG5cdHJ1bm5pbmcgPSB0cnVlO1xyXG5cdGNhbURpc3RhbmNlID0gMS4wO1xyXG5cdGNhbSA9IENyZWF0ZUNhbSgnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLCB0cnVlKTtcclxuXHRjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIDMxMDg2LCAwLjAsIDAuMCwgMC4wKTtcclxuXHRTZXRDYW1Db29yZChjYW0sIHgsIHksIHopO1xyXG5cdFJlbmRlclNjcmlwdENhbXModHJ1ZSwgdHJ1ZSwgMTAwMCwgdHJ1ZSwgdHJ1ZSk7XHJcblx0bW92ZUNhbWVyYSh7IHg6IHgsIHk6IHksIHo6IHogfSwgY2FtRGlzdGFuY2UpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0b3BDYW1lcmEgPSAoKTogdm9pZCA9PiB7XHJcblx0aWYgKCFydW5uaW5nKSByZXR1cm47XHJcblx0cnVubmluZyA9IGZhbHNlO1xyXG5cclxuXHRSZW5kZXJTY3JpcHRDYW1zKGZhbHNlLCB0cnVlLCAyNTAsIHRydWUsIGZhbHNlKTtcclxuXHREZXN0cm95Q2FtKGNhbSwgdHJ1ZSk7XHJcblx0Y2FtID0gbnVsbDtcclxuXHR0YXJnZXRDb29yZHMgPSBudWxsO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtZXJhID0gKHR5cGU/OiBrZXlvZiBDYW1lcmFCb25lcyk6IHZvaWQgPT4ge1xyXG5cdGNvbnN0IGJvbmU6IG51bWJlciB8IHVuZGVmaW5lZCA9IENhbWVyYUJvbmVzW3R5cGVdO1xyXG5cdGlmIChjdXJyZW50Qm9uZSA9PSB0eXBlKSByZXR1cm47XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XTogbnVtYmVyW10gPSBib25lXHJcblx0XHQ/IEdldFBlZEJvbmVDb29yZHMocGVkLCBib25lLCAwLjAsIDAuMCwgYm9uZSA9PT0gMTQyMDEgPyAwLjIgOiAwLjApXHJcblx0XHQ6IEdldEVudGl0eUNvb3JkcyhwZWQsIGZhbHNlKTtcclxuXHJcblx0bW92ZUNhbWVyYShcclxuXHRcdHtcclxuXHRcdFx0eDogeCxcclxuXHRcdFx0eTogeSxcclxuXHRcdFx0ejogeiArIDAuMCxcclxuXHRcdH0sXHJcblx0XHQxLjBcclxuXHQpO1xyXG5cclxuXHRjdXJyZW50Qm9uZSA9IHR5cGU7XHJcbn07XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtTW92ZSwgKGRhdGEsIGNiKSA9PiB7XHJcblx0Y2IoMSk7XHJcblx0bGV0IGhlYWRpbmc6IG51bWJlciA9IEdldEVudGl0eUhlYWRpbmcocGVkKTtcclxuXHRpZiAobGFzdFggPT0gZGF0YS54KSB7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdGhlYWRpbmcgPSBkYXRhLnggPiBsYXN0WCA/IGhlYWRpbmcgKyA1IDogaGVhZGluZyAtIDU7XHJcblx0U2V0RW50aXR5SGVhZGluZyhwZWQsIGhlYWRpbmcpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1TY3JvbGwsICh0eXBlOiBudW1iZXIsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHN3aXRjaCAodHlwZSkge1xyXG5cdFx0Y2FzZSAyOlxyXG5cdFx0XHRzZXRDYW1lcmEoKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRjYXNlIDE6XHJcblx0XHRcdHNldENhbWVyYSgnbGVncycpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdGNhc2UgMzpcclxuXHRcdFx0c2V0Q2FtZXJhKCdoZWFkJyk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdH1cclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtWm9vbSwgKGRhdGEsIGNiKSA9PiB7XHJcblx0aWYgKGRhdGEgPT09ICdkb3duJykge1xyXG5cdFx0Y29uc3QgbmV3RGlzdGFuY2U6IG51bWJlciA9IGNhbURpc3RhbmNlICsgMC4wNTtcclxuXHRcdGNhbURpc3RhbmNlID0gbmV3RGlzdGFuY2UgPj0gMS4wID8gMS4wIDogbmV3RGlzdGFuY2U7XHJcblx0fSBlbHNlIGlmIChkYXRhID09PSAndXAnKSB7XHJcblx0XHRjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgLSAwLjA1O1xyXG5cdFx0Y2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA8PSAwLjM1ID8gMC4zNSA6IG5ld0Rpc3RhbmNlO1xyXG5cdH1cclxuXHJcblx0Y2FtRGlzdGFuY2UgPSBjYW1EaXN0YW5jZTtcclxuXHRzZXRDYW1Qb3NpdGlvbigpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcIkJsZW1pc2hlc1wiLFxuICAgIFwiRmFjaWFsSGFpclwiLFxuICAgIFwiRXllYnJvd3NcIixcbiAgICBcIkFnZWluZ1wiLFxuICAgIFwiTWFrZXVwXCIsXG4gICAgXCJCbHVzaFwiLFxuICAgIFwiQ29tcGxleGlvblwiLFxuICAgIFwiU3VuRGFtYWdlXCIsXG4gICAgXCJMaXBzdGlja1wiLFxuICAgIFwiTW9sZXNGcmVja2xlc1wiLFxuICAgIFwiQ2hlc3RIYWlyXCIsXG4gICAgXCJCb2R5QmxlbWlzaGVzXCIsXG4gICAgXCJBZGRCb2R5QmxlbWlzaGVzXCIsXG4gICAgXCJFeWVDb2xvclwiXG5dXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiTm9zZV9XaWR0aFwiLFxuICAgIFwiTm9zZV9QZWFrX0hlaWdodFwiLFxuICAgIFwiTm9zZV9QZWFrX0xlbmdodFwiLFxuICAgIFwiTm9zZV9Cb25lX0hlaWdodFwiLFxuICAgIFwiTm9zZV9QZWFrX0xvd2VyaW5nXCIsXG4gICAgXCJOb3NlX0JvbmVfVHdpc3RcIixcbiAgICBcIkV5ZUJyb3duX0hlaWdodFwiLFxuICAgIFwiRXllQnJvd25fRm9yd2FyZFwiLFxuICAgIFwiQ2hlZWtzX0JvbmVfSGlnaFwiLFxuICAgIFwiQ2hlZWtzX0JvbmVfV2lkdGhcIixcbiAgICBcIkNoZWVrc19XaWR0aFwiLFxuICAgIFwiRXllc19PcGVubmluZ1wiLFxuICAgIFwiTGlwc19UaGlja25lc3NcIixcbiAgICBcIkphd19Cb25lX1dpZHRoXCIsXG4gICAgXCJKYXdfQm9uZV9CYWNrX0xlbmdodFwiLFxuICAgIFwiQ2hpbl9Cb25lX0xvd2VyaW5nXCIsXG4gICAgXCJDaGluX0JvbmVfTGVuZ3RoXCIsXG4gICAgXCJDaGluX0JvbmVfV2lkdGhcIixcbiAgICBcIkNoaW5fSG9sZVwiLFxuICAgIFwiTmVja19UaGlrbmVzc1wiXG5dXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiZmFjZVwiLFxuICAgIFwibWFza3NcIixcbiAgICBcImhhaXJcIixcbiAgICBcInRvcnNvc1wiLFxuICAgIFwibGVnc1wiLFxuICAgIFwiYmFnc1wiLFxuICAgIFwic2hvZXNcIixcbiAgICBcIm5lY2tcIixcbiAgICBcInNoaXJ0c1wiLFxuICAgIFwidmVzdFwiLFxuICAgIFwiZGVjYWxzXCIsXG4gICAgXCJqYWNrZXRzXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJoYXRzXCIsXG4gICAgXCJnbGFzc2VzXCIsXG4gICAgXCJlYXJyaW5nc1wiLFxuICAgIFwibW91dGhcIixcbiAgICBcImxoYW5kXCIsXG4gICAgXCJyaGFuZFwiLFxuICAgIFwid2F0Y2hlc1wiLFxuICAgIFwiYnJhY2VsZXRzXCJcbl1cbiIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSwgVEhhaXJEYXRhLCBUSGVhZE92ZXJsYXksIFRIZWFkT3ZlcmxheVRvdGFsIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgSEVBRF9PVkVSTEFZUyBmcm9tIFwiQGRhdGEvaGVhZFwiXHJcbmltcG9ydCBGQUNFX0ZFQVRVUkVTIGZyb20gXCJAZGF0YS9mYWNlXCJcclxuaW1wb3J0IERSQVdBQkxFX05BTUVTIGZyb20gXCJAZGF0YS9kcmF3YWJsZXNcIlxyXG5pbXBvcnQgUFJPUF9OQU1FUyBmcm9tIFwiQGRhdGEvcHJvcHNcIlxyXG5pbXBvcnQgeyBwZWQsIG9uU2VydmVyQ2FsbGJhY2sgfSBmcm9tICdAdXRpbHMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRNb2RlbEluZGV4KHRhcmdldDogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxuICAgIGNvbnN0IG1vZGVscyA9IGNvbmZpZy5tb2RlbHMoKVxyXG5cclxuICAgIHJldHVybiBtb2RlbHMuZmluZEluZGV4KChtb2RlbDogc3RyaW5nKSA9PiBHZXRIYXNoS2V5KG1vZGVsKSA9PT0gdGFyZ2V0KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFpcihwZWRIYW5kbGU6IG51bWJlcik6IFRIYWlyRGF0YSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNvbG9yOiBHZXRQZWRIYWlyQ29sb3IocGVkSGFuZGxlKSxcclxuICAgICAgICBoaWdobGlnaHQ6IEdldFBlZEhhaXJIaWdobGlnaHRDb2xvcihwZWRIYW5kbGUpXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkQmxlbmREYXRhKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGVkcjBmb250b3VyYS9maXZlbS1hcHBlYXJhbmNlL2Jsb2IvbWFpbi9nYW1lL3NyYy9jbGllbnQvaW5kZXgudHMjTDY3XHJcbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoODApO1xyXG4gICAgZ2xvYmFsLkNpdGl6ZW4uaW52b2tlTmF0aXZlKCcweDI3NDZiZDlkODhjNWM1ZDAnLCBwZWRIYW5kbGUsIG5ldyBVaW50MzJBcnJheShidWZmZXIpKTtcclxuXHJcbiAgICBjb25zdCB7IDA6IHNoYXBlRmlyc3QsIDI6IHNoYXBlU2Vjb25kLCA0OiBzaGFwZVRoaXJkLCA2OiBza2luRmlyc3QsIDg6IHNraW5TZWNvbmQsIDE4OiBoYXNQYXJlbnQsIDEwOiBza2luVGhpcmQgfSA9IG5ldyBVaW50MzJBcnJheShidWZmZXIpO1xyXG4gICAgY29uc3QgeyAwOiBzaGFwZU1peCwgMjogc2tpbk1peCwgNDogdGhpcmRNaXggfSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyLCA0OCk7XHJcblxyXG4gICAgLyogICBcclxuICAgICAgICAwOiBzaGFwZUZpcnN0LFxyXG4gICAgICAgIDI6IHNoYXBlU2Vjb25kLFxyXG4gICAgICAgIDQ6IHNoYXBlVGhpcmQsXHJcbiAgICAgICAgNjogc2tpbkZpcnN0LFxyXG4gICAgICAgIDg6IHNraW5TZWNvbmQsXHJcbiAgICAgICAgMTA6IHNraW5UaGlyZCxcclxuICAgICAgICAxODogaGFzUGFyZW50LFxyXG4gICAgKi9cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2hhcGVGaXJzdCwgICAvLyBmYXRoZXJcclxuICAgICAgICBzaGFwZVNlY29uZCwgLy8gbW90aGVyXHJcbiAgICAgICAgc2hhcGVUaGlyZCxcclxuXHJcbiAgICAgICAgc2tpbkZpcnN0LFxyXG4gICAgICAgIHNraW5TZWNvbmQsXHJcbiAgICAgICAgc2tpblRoaXJkLFxyXG5cclxuICAgICAgICBzaGFwZU1peCwgLy8gcmVzZW1ibGFuY2VcclxuXHJcbiAgICAgICAgdGhpcmRNaXgsXHJcbiAgICAgICAgc2tpbk1peCwgICAvLyBza2lucGVyY2VudFxyXG5cclxuICAgICAgICBoYXNQYXJlbnQ6IEJvb2xlYW4oaGFzUGFyZW50KSxcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgbGV0IHRvdGFsczogVEhlYWRPdmVybGF5VG90YWwgPSB7fTtcclxuICAgIGxldCBoZWFkRGF0YTogVEhlYWRPdmVybGF5ID0ge307XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBIRUFEX09WRVJMQVlTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEhFQURfT1ZFUkxBWVNbaV07XHJcbiAgICAgICAgdG90YWxzW292ZXJsYXldID0gR2V0TnVtSGVhZE92ZXJsYXlWYWx1ZXMoaSk7XHJcblxyXG4gICAgICAgIGlmIChvdmVybGF5ID09PSBcIkV5ZUNvbG9yXCIpIHtcclxuICAgICAgICAgICAgaGVhZERhdGFbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBHZXRQZWRFeWVDb2xvcihwZWRIYW5kbGUpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgW18sIG92ZXJsYXlWYWx1ZSwgY29sb3VyVHlwZSwgZmlyc3RDb2xvciwgc2Vjb25kQ29sb3IsIG92ZXJsYXlPcGFjaXR5XSA9IEdldFBlZEhlYWRPdmVybGF5RGF0YShwZWRIYW5kbGUsIGkpO1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGkgLSAxLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBvdmVybGF5VmFsdWUgPT09IDI1NSA/IC0xIDogb3ZlcmxheVZhbHVlLFxyXG4gICAgICAgICAgICAgICAgY29sb3VyVHlwZTogY29sb3VyVHlwZSxcclxuICAgICAgICAgICAgICAgIGZpcnN0Q29sb3I6IGZpcnN0Q29sb3IsXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRDb2xvcjogc2Vjb25kQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5T3BhY2l0eTogb3ZlcmxheU9wYWNpdHlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtoZWFkRGF0YSwgdG90YWxzXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRTdHJ1Y3R1cmUocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IHBlZE1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkSGFuZGxlKVxyXG5cclxuICAgIGlmIChwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX21fZnJlZW1vZGVfMDFcIikgJiYgcGVkTW9kZWwgIT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpKSByZXR1cm5cclxuXHJcbiAgICBsZXQgZmFjZVN0cnVjdCA9IHt9XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEZBQ0VfRkVBVFVSRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gRkFDRV9GRUFUVVJFU1tpXVxyXG4gICAgICAgIGZhY2VTdHJ1Y3Rbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZEZhY2VGZWF0dXJlKHBlZEhhbmRsZSwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhY2VTdHJ1Y3RcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldERyYXdhYmxlcyhwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgbGV0IGRyYXdhYmxlcyA9IHt9XHJcbiAgICBsZXQgdG90YWxEcmF3YWJsZXMgPSB7fVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRFJBV0FCTEVfTkFNRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gRFJBV0FCTEVfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkSGFuZGxlLCBpKVxyXG5cclxuICAgICAgICB0b3RhbERyYXdhYmxlc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWREcmF3YWJsZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZXM6IEdldE51bWJlck9mUGVkVGV4dHVyZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBpLCBjdXJyZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICBkcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFRleHR1cmVWYXJpYXRpb24ocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW2RyYXdhYmxlcywgdG90YWxEcmF3YWJsZXNdXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9wcyhwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgbGV0IHByb3BzID0ge31cclxuICAgIGxldCB0b3RhbFByb3BzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFBST1BfTkFNRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gUFJPUF9OQU1FU1tpXVxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBHZXRQZWRQcm9wSW5kZXgocGVkSGFuZGxlLCBpKVxyXG5cclxuICAgICAgICB0b3RhbFByb3BzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHRvdGFsOiBHZXROdW1iZXJPZlBlZFByb3BEcmF3YWJsZVZhcmlhdGlvbnMocGVkSGFuZGxlLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZXM6IEdldE51bWJlck9mUGVkUHJvcFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3BzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWRQcm9wSW5kZXgocGVkSGFuZGxlLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZTogR2V0UGVkUHJvcFRleHR1cmVJbmRleChwZWRIYW5kbGUsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbcHJvcHMsIHRvdGFsUHJvcHNdXHJcbn1cclxuXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBwZWFyYW5jZShwZWRIYW5kbGU6IG51bWJlcik6IFByb21pc2U8VEFwcGVhcmFuY2U+IHtcclxuICAgIGNvbnN0IFtoZWFkRGF0YSwgdG90YWxzXSA9IGdldEhlYWRPdmVybGF5KHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtkcmF3YWJsZXMsIGRyYXdUb3RhbF0gPSBnZXREcmF3YWJsZXMocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW3Byb3BzLCBwcm9wVG90YWxdID0gZ2V0UHJvcHMocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgbW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWRIYW5kbGUpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBtb2RlbEluZGV4OiBmaW5kTW9kZWxJbmRleChtb2RlbCksXHJcbiAgICAgICAgbW9kZWw6IG1vZGVsLFxyXG4gICAgICAgIGhhaXJDb2xvcjogZ2V0SGFpcihwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhlYWRCbGVuZDogZ2V0SGVhZEJsZW5kRGF0YShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhlYWRPdmVybGF5OiBoZWFkRGF0YSBhcyBUSGVhZE92ZXJsYXksXHJcbiAgICAgICAgaGVhZE92ZXJsYXlUb3RhbDogdG90YWxzIGFzIFRIZWFkT3ZlcmxheVRvdGFsLFxyXG4gICAgICAgIGhlYWRTdHJ1Y3R1cmU6IGdldEhlYWRTdHJ1Y3R1cmUocGVkSGFuZGxlKSxcclxuICAgICAgICBkcmF3YWJsZXM6IGRyYXdhYmxlcyxcclxuICAgICAgICBwcm9wczogcHJvcHMsXHJcbiAgICAgICAgZHJhd1RvdGFsOiBkcmF3VG90YWwsXHJcbiAgICAgICAgcHJvcFRvdGFsOiBwcm9wVG90YWwsXHJcbiAgICAgICAgdGF0dG9vczogW11cclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0QXBwZWFyYW5jZVwiLCBnZXRBcHBlYXJhbmNlKVxyXG5vblNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDpnZXRBcHBlYXJhbmNlJywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIGdldEFwcGVhcmFuY2UocGVkKVxyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQZWRDbG90aGVzKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBbZHJhd2FibGVzXSA9IGdldERyYXdhYmxlcyhwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbcHJvcHNdID0gZ2V0UHJvcHMocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW2hlYWREYXRhXSA9IGdldEhlYWRPdmVybGF5KHBlZEhhbmRsZSlcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGhlYWRPdmVybGF5OiBoZWFkRGF0YSxcclxuICAgICAgICBkcmF3YWJsZXM6IGRyYXdhYmxlcyxcclxuICAgICAgICBwcm9wczogcHJvcHMsXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldFBlZENsb3RoZXNcIiwgZ2V0UGVkQ2xvdGhlcylcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQZWRTa2luKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGhlYWRCbGVuZDogZ2V0SGVhZEJsZW5kRGF0YShwZWRIYW5kbGUpLFxyXG4gICAgICAgIGhlYWRTdHJ1Y3R1cmU6IGdldEhlYWRTdHJ1Y3R1cmUocGVkSGFuZGxlKSxcclxuICAgICAgICBoYWlyQ29sb3I6IGdldEhhaXIocGVkSGFuZGxlKSxcclxuICAgICAgICBtb2RlbDogR2V0RW50aXR5TW9kZWwocGVkSGFuZGxlKVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRQZWRTa2luXCIsIGdldFBlZFNraW4pXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGF0dG9vRGF0YSgpIHtcclxuICAgIGxldCB0YXR0b29ab25lcyA9IHt9XHJcblxyXG4gICAgY29uc3QgW1RBVFRPT19MSVNULCBUQVRUT09fQ0FURUdPUklFU10gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UudGF0dG9vcygpXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFRBVFRPT19DQVRFR09SSUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBUQVRUT09fQ0FURUdPUklFU1tpXVxyXG4gICAgICAgIGNvbnN0IHpvbmUgPSBjYXRlZ29yeS56b25lXHJcbiAgICAgICAgY29uc3QgbGFiZWwgPSBjYXRlZ29yeS5sYWJlbFxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gY2F0ZWdvcnkuaW5kZXhcclxuICAgICAgICB0YXR0b29ab25lc1tpbmRleF0gPSB7XHJcbiAgICAgICAgICAgIHpvbmU6IHpvbmUsXHJcbiAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcclxuICAgICAgICAgICAgem9uZUluZGV4OiBpbmRleCxcclxuICAgICAgICAgICAgZGxjczogW11cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgZGxjRGF0YSA9IFRBVFRPT19MSVNUW2pdXHJcbiAgICAgICAgICAgIHRhdHRvb1pvbmVzW2luZGV4XS5kbGNzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGRsY0RhdGEuZGxjLFxyXG4gICAgICAgICAgICAgICAgZGxjSW5kZXg6IGosXHJcbiAgICAgICAgICAgICAgICB0YXR0b29zOiBbXVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0ZlbWFsZSA9IEdldEVudGl0eU1vZGVsKHBlZCkgPT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fTElTVC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBUQVRUT09fTElTVFtpXVxyXG4gICAgICAgIGNvbnN0IHsgZGxjLCB0YXR0b29zIH0gPSBkYXRhXHJcbiAgICAgICAgY29uc3QgZGxjSGFzaCA9IEdldEhhc2hLZXkoZGxjKVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGF0dG9vcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gdGF0dG9vc1tqXVxyXG4gICAgICAgICAgICBsZXQgdGF0dG9vID0gbnVsbFxyXG5cclxuICAgICAgICAgICAgY29uc3QgbG93ZXJUYXR0b28gPSB0YXR0b29EYXRhLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgY29uc3QgaXNGZW1hbGVUYXR0b28gPSBsb3dlclRhdHRvby5pbmNsdWRlcyhcIl9mXCIpXHJcbiAgICAgICAgICAgIGlmIChpc0ZlbWFsZVRhdHRvbyAmJiBpc0ZlbWFsZSkge1xyXG4gICAgICAgICAgICAgICAgdGF0dG9vID0gdGF0dG9vRGF0YVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0ZlbWFsZVRhdHRvbyAmJiAhaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGhhc2ggPSBudWxsXHJcbiAgICAgICAgICAgIGxldCB6b25lID0gLTFcclxuXHJcbiAgICAgICAgICAgIGlmICh0YXR0b28pIHtcclxuICAgICAgICAgICAgICAgIGhhc2ggPSBHZXRIYXNoS2V5KHRhdHRvbylcclxuICAgICAgICAgICAgICAgIHpvbmUgPSBHZXRQZWREZWNvcmF0aW9uWm9uZUZyb21IYXNoZXMoZGxjSGFzaCwgaGFzaClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHpvbmUgIT09IC0xICYmIGhhc2gpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHpvbmVUYXR0b29zID0gdGF0dG9vWm9uZXNbem9uZV0uZGxjc1tpXS50YXR0b29zXHJcblxyXG4gICAgICAgICAgICAgICAgem9uZVRhdHRvb3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRhdHRvbyxcclxuICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvbmU6IHpvbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGxjOiBkbGMsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YXR0b29ab25lc1xyXG59XHJcblxyXG4vL21pZ3JhdGlvblxyXG5cclxub25TZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6bWlncmF0aW9uOnNldEFwcGVhcmFuY2UnLCAoZGF0YToge3R5cGU6IHN0cmluZywgZGF0YTogYW55fSkgPT4ge1xyXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gJ2ZpdmVtJykgZXhwb3J0c1snZml2ZW0tYXBwZWFyYW5jZSddLnNldFBsYXllckFwcGVhcmFuY2UoZGF0YS5kYXRhKVxyXG4gICAgaWYgKGRhdGEudHlwZSA9PT0gJ2lsbGVuaXVtJykgZXhwb3J0c1snaWxsZW5pdW0tYXBwZWFyYW5jZSddLnNldFBsYXllckFwcGVhcmFuY2UoZGF0YS5kYXRhKVxyXG59KTsiLCAiXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICBoYXRzOiB7XHJcbiAgICAgICAgdHlwZTogXCJwcm9wXCIsXHJcbiAgICAgICAgaW5kZXg6IDAsXHJcbiAgICB9LFxyXG4gICAgZ2xhc3Nlczoge1xyXG4gICAgICAgIHR5cGU6IFwicHJvcFwiLFxyXG4gICAgICAgIGluZGV4OiAxLFxyXG4gICAgfSxcclxuICAgIG1hc2tzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiAxLFxyXG4gICAgICAgIG9mZjogMCxcclxuICAgIH0sXHJcbiAgICBzaGlydHM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDgsXHJcbiAgICAgICAgb2ZmOiAxNVxyXG4gICAgfSxcclxuICAgIGphY2tldHM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDExLFxyXG4gICAgICAgIG9mZjogMTUsXHJcbiAgICB9LFxyXG4gICAgbGVnczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogNCxcclxuICAgICAgICBvZmY6IDExLFxyXG4gICAgfSxcclxuICAgIHNob2VzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA2LFxyXG4gICAgICAgIG9mZjogMTMsXHJcbiAgICB9XHJcbn0iLCAiaW1wb3J0IHsgVFZhbHVlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIjtcclxuaW1wb3J0IFRPR0dMRV9JTkRFWEVTIGZyb20gXCJAZGF0YS90b2dnbGVzXCJcclxuaW1wb3J0IHsgcmVxdWVzdE1vZGVsLCBwZWQsIHVwZGF0ZVBlZCwgZGVsYXl9IGZyb20gJ0B1dGlscyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0RHJhd2FibGUocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCAwKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJvcChwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBpZiAoZGF0YS52YWx1ZSA9PT0gLTEpIHtcclxuICAgICAgICBDbGVhclBlZFByb3AocGVkSGFuZGxlLCBkYXRhLmluZGV4KVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIFNldFBlZFByb3BJbmRleChwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgZmFsc2UpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZXRNb2RlbCA9IGFzeW5jIChtb2RlbDogbnVtYmVyKSA9PiB7XHJcbiAgICBjb25zdCBtb2RlbEhhc2ggPSBhd2FpdCByZXF1ZXN0TW9kZWwobW9kZWwpXHJcbiAgICBTZXRQbGF5ZXJNb2RlbChQbGF5ZXJJZCgpLCBtb2RlbEhhc2gpXHJcbiAgICBTZXRNb2RlbEFzTm9Mb25nZXJOZWVkZWQobW9kZWxIYXNoKVxyXG4gICAgY29uc3QgcGVkSGFuZGxlID0gUGxheWVyUGVkSWQoKVxyXG4gICAgdXBkYXRlUGVkKHBlZEhhbmRsZSlcclxuICAgIFNldFBlZERlZmF1bHRDb21wb25lbnRWYXJpYXRpb24ocGVkSGFuZGxlKVxyXG5cclxuICAgIGlmIChtb2RlbEhhc2ggPT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgZmFsc2UpXHJcbiAgICBlbHNlIGlmIChtb2RlbEhhc2ggPT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgNDUsIDIxLCAwLCAyMCwgMTUsIDAsIDAuMywgMC4xLCAwLCBmYWxzZSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFNldEZhY2VGZWF0dXJlKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIFNldFBlZEZhY2VGZWF0dXJlKHBlZEhhbmRsZSwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSArIDAuMClcclxufVxyXG5cclxuY29uc3QgaXNQb3NpdGl2ZSA9ICh2YWw6IG51bWJlcikgPT4gdmFsID49IDAgPyB2YWwgOiAwXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0SGVhZEJsZW5kKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBjb25zdCBzaGFwZUZpcnN0ID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlRmlyc3QpXHJcbiAgICBjb25zdCBzaGFwZVNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZVNlY29uZClcclxuICAgIGNvbnN0IHNoYXBlVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVUaGlyZClcclxuICAgIGNvbnN0IHNraW5GaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5za2luRmlyc3QpXHJcbiAgICBjb25zdCBza2luU2Vjb25kID0gaXNQb3NpdGl2ZShkYXRhLnNraW5TZWNvbmQpXHJcbiAgICBjb25zdCBza2luVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpblRoaXJkKVxyXG4gICAgY29uc3Qgc2hhcGVNaXggPSBkYXRhLnNoYXBlTWl4ICsgMC4wXHJcbiAgICBjb25zdCBza2luTWl4ID0gZGF0YS5za2luTWl4ICsgMC4wXHJcbiAgICBjb25zdCB0aGlyZE1peCA9IGRhdGEudGhpcmRNaXggKyAwLjBcclxuICAgIGNvbnN0IGhhc1BhcmVudCA9IGRhdGEuaGFzUGFyZW50XHJcblxyXG4gICAgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWRIYW5kbGUsIHNoYXBlRmlyc3QsIHNoYXBlU2Vjb25kLCBzaGFwZVRoaXJkLCBza2luRmlyc3QsIHNraW5TZWNvbmQsIHNraW5UaGlyZCwgc2hhcGVNaXgsIHNraW5NaXgsXHJcbiAgICAgICAgdGhpcmRNaXgsIGhhc1BhcmVudClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEhlYWRPdmVybGF5KHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBjb25zdCBpbmRleCA9IGRhdGEuaW5kZXhcclxuXHJcbiAgICBpZiAoaW5kZXggPT09IDEzKSB7XHJcbiAgICAgICAgU2V0UGVkRXllQ29sb3IocGVkSGFuZGxlLCBkYXRhLnZhbHVlKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZhbHVlID0gZGF0YS5vdmVybGF5VmFsdWUgPT09IC0xID8gMjU1IDogZGF0YS5vdmVybGF5VmFsdWVcclxuXHJcbiAgICBTZXRQZWRIZWFkT3ZlcmxheShwZWRIYW5kbGUsIGluZGV4LCB2YWx1ZSwgZGF0YS5vdmVybGF5T3BhY2l0eSArIDAuMClcclxuICAgIFNldFBlZEhlYWRPdmVybGF5Q29sb3IocGVkSGFuZGxlLCBpbmRleCwgMSwgZGF0YS5maXJzdENvbG9yLCBkYXRhLnNlY29uZENvbG9yKVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0VG9nZ2xlcyhkYXRhKSB7XHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcblxyXG4gICAgZm9yIChjb25zdCBbdG9nZ2xlSXRlbSwgdG9nZ2xlRGF0YV0gb2YgT2JqZWN0LmVudHJpZXMoVE9HR0xFX0lOREVYRVMpKSB7XHJcbiAgICAgICAgY29uc3QgdG9nZ2xlVHlwZSA9IHRvZ2dsZURhdGEudHlwZVxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdG9nZ2xlRGF0YS5pbmRleFxyXG5cclxuICAgICAgICBpZiAodG9nZ2xlVHlwZSA9PT0gXCJkcmF3YWJsZVwiICYmIGRyYXdhYmxlc1t0b2dnbGVJdGVtXSkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudERyYXdhYmxlICE9PSBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHRvZ2dsZVR5cGUgPT09IFwicHJvcFwiICYmIHByb3BzW3RvZ2dsZUl0ZW1dKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UHJvcCAhPT0gcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZFByb3BJbmRleChwZWQsIGluZGV4LCBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgZmFsc2UpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRDbG90aGVzKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcbiAgICBjb25zdCBoZWFkT3ZlcmxheSA9IGRhdGEuaGVhZE92ZXJsYXlcclxuICAgIGZvciAoY29uc3QgaWQgaW4gZHJhd2FibGVzKSB7XHJcbiAgICAgICAgY29uc3QgZHJhd2FibGUgPSBkcmF3YWJsZXNbaWRdXHJcbiAgICAgICAgc2V0RHJhd2FibGUocGVkSGFuZGxlLCBkcmF3YWJsZSlcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIHByb3BzKSB7XHJcbiAgICAgICAgY29uc3QgcHJvcCA9IHByb3BzW2lkXVxyXG4gICAgICAgIHNldFByb3AocGVkSGFuZGxlLCBwcm9wKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgaWQgaW4gaGVhZE92ZXJsYXkpIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gaGVhZE92ZXJsYXlbaWRdXHJcbiAgICAgICAgc2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlLCBvdmVybGF5KVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2V0UGVkU2tpbiA9IGFzeW5jIChkYXRhKSA9PiB7XHJcbiAgICBjb25zdCBoZWFkU3RydWN0dXJlID0gZGF0YS5oZWFkU3RydWN0dXJlXHJcbiAgICBjb25zdCBoZWFkQmxlbmQgPSBkYXRhLmhlYWRCbGVuZFxyXG5cclxuICAgIGF3YWl0IHNldE1vZGVsKGRhdGEubW9kZWwpXHJcblxyXG4gICAgaWYgKGhlYWRCbGVuZCkgc2V0SGVhZEJsZW5kKHBlZCwgaGVhZEJsZW5kKVxyXG4gICAgXHJcbiAgICBpZiAoaGVhZFN0cnVjdHVyZSkgZm9yIChjb25zdCBmZWF0dXJlIGluIGhlYWRTdHJ1Y3R1cmUpIHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IGhlYWRTdHJ1Y3R1cmVbZmVhdHVyZV1cclxuICAgICAgICBTZXRGYWNlRmVhdHVyZShwZWQsIHZhbHVlKVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkVGF0dG9vcyhwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm5cclxuXHJcbiAgICBDbGVhclBlZERlY29yYXRpb25zTGVhdmVTY2FycyhwZWRIYW5kbGUpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IGRhdGFbaV0udGF0dG9vXHJcbiAgICAgICAgaWYgKHRhdHRvb0RhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IEdldEhhc2hLZXkodGF0dG9vRGF0YS5kbGMpXHJcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvbyA9IHRhdHRvb0RhdGEuaGFzaFxyXG4gICAgICAgICAgICBBZGRQZWREZWNvcmF0aW9uRnJvbUhhc2hlcyhwZWRIYW5kbGUsIGNvbGxlY3Rpb24sIHRhdHRvbylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRIYWlyQ29sb3JzKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBjb25zdCBjb2xvciA9IGRhdGEuY29sb3JcclxuICAgIGNvbnN0IGhpZ2hsaWdodCA9IGRhdGEuaGlnaGxpZ2h0XHJcbiAgICBTZXRQZWRIYWlyQ29sb3IocGVkSGFuZGxlLCBjb2xvciwgaGlnaGxpZ2h0KVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGVkQXBwZWFyYW5jZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgYXdhaXQgc2V0UGVkU2tpbihkYXRhKVxyXG4gICAgc2V0UGVkQ2xvdGhlcyhwZWRIYW5kbGUsIGRhdGEpXHJcbiAgICBzZXRQZWRIYWlyQ29sb3JzKHBlZEhhbmRsZSwgZGF0YS5oYWlyQ29sb3IpXHJcbiAgICBzZXRQZWRUYXR0b29zKHBlZEhhbmRsZSwgZGF0YS50YXR0b29zKVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGxheWVyUGVkQXBwZWFyYW5jZShkYXRhKSB7XHJcbiAgICBhd2FpdCBzZXRQZWRTa2luKGRhdGEpXHJcbiAgICBzZXRQZWRDbG90aGVzKHBlZCwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMocGVkLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MocGVkLCBkYXRhLnRhdHRvb3MpXHJcbn1cclxuXHJcbmV4cG9ydHMoJ1NldFBlZENsb3RoZXMnLCBzZXRQZWRDbG90aGVzKVxyXG5leHBvcnRzKCdTZXRQZWRTa2luJywgc2V0UGVkU2tpbilcclxuZXhwb3J0cygnU2V0UGVkVGF0dG9vcycsIHNldFBlZFRhdHRvb3MpXHJcbmV4cG9ydHMoJ1NldFBlZEhhaXJDb2xvcnMnLCBzZXRQZWRIYWlyQ29sb3JzKSIsICJpbXBvcnQgeyBSZWNlaXZlIH0gZnJvbSAnQGV2ZW50cyc7XHJcbmltcG9ydCB7XHJcblx0cmVzZXRUb2dnbGVzLFxyXG5cdHNldERyYXdhYmxlLFxyXG5cdFNldEZhY2VGZWF0dXJlLFxyXG5cdHNldEhlYWRCbGVuZCxcclxuXHRzZXRIZWFkT3ZlcmxheSxcclxuXHRzZXRNb2RlbCxcclxuXHRzZXRQZWRDbG90aGVzLFxyXG5cdHNldFBlZFRhdHRvb3MsXHJcblx0c2V0UGxheWVyUGVkQXBwZWFyYW5jZSxcclxuXHRzZXRQcm9wLFxyXG59IGZyb20gJy4vYXBwZWFyYW5jZS9zZXR0ZXJzJztcclxuaW1wb3J0IHsgY2xvc2VNZW51IH0gZnJvbSAnLi9tZW51JztcclxuaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRUb2dnbGVEYXRhLCBUVmFsdWUgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgZGVsYXksIGdldEZyYW1ld29ya0lELCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIHBlZCB9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldFRhdHRvb0RhdGEgfSBmcm9tICcuL2FwcGVhcmFuY2UvZ2V0dGVycyc7XHJcbmltcG9ydCBUT0dHTEVfSU5ERVhFUyBmcm9tICdAZGF0YS90b2dnbGVzJztcclxuaW1wb3J0IHsgT3V0Zml0IH0gZnJvbSAnQHR5cGluZ3Mvb3V0Zml0cyc7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FuY2VsLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSk7XHJcblx0Y2xvc2VNZW51KCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNhdmUsIGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0cmVzZXRUb2dnbGVzKGFwcGVhcmFuY2UpO1xyXG5cclxuXHRhd2FpdCBkZWxheSgxMDApO1xyXG5cclxuXHRjb25zdCBuZXdBcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cdG5ld0FwcGVhcmFuY2UudGF0dG9vcyA9IGFwcGVhcmFuY2UudGF0dG9vcztcclxuXHR0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVBcHBlYXJhbmNlJywgZ2V0RnJhbWV3b3JrSUQoKSwgbmV3QXBwZWFyYW5jZSk7XHJcblxyXG5cdHNldFBlZFRhdHRvb3MocGVkLCBuZXdBcHBlYXJhbmNlLnRhdHRvb3MpO1xyXG5cclxuXHRjbG9zZU1lbnUoKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0TW9kZWwsIGFzeW5jIChtb2RlbDogc3RyaW5nLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBoYXNoID0gR2V0SGFzaEtleShtb2RlbCk7XHJcblx0aWYgKCFJc01vZGVsSW5DZGltYWdlKGhhc2gpIHx8ICFJc01vZGVsVmFsaWQoaGFzaCkpIHtcclxuXHRcdHJldHVybiBjYigwKTtcclxuXHR9XHJcblxyXG5cdGF3YWl0IHNldE1vZGVsKGhhc2gpO1xyXG5cclxuXHRjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cclxuXHRhcHBlYXJhbmNlLnRhdHRvb3MgPSBbXTtcclxuXHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIFtdKTtcclxuXHJcblx0Y2IoYXBwZWFyYW5jZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmdldE1vZGVsVGF0dG9vcywgYXN5bmMgKF86IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgdGF0dG9vcyA9IGdldFRhdHRvb0RhdGEoKTtcclxuXHJcblx0Y2IodGF0dG9vcyk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRTdHJ1Y3R1cmUsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdFNldEZhY2VGZWF0dXJlKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldEhlYWRPdmVybGF5LCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRIZWFkT3ZlcmxheShwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRIZWFkQmxlbmQsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldEhlYWRCbGVuZChwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRUYXR0b29zLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFByb3AsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldFByb3AocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0RHJhd2FibGUsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldERyYXdhYmxlKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnRvZ2dsZUl0ZW0sIGFzeW5jIChkYXRhOiBUVG9nZ2xlRGF0YSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgaXRlbSA9IFRPR0dMRV9JTkRFWEVTW2RhdGEuaXRlbV07XHJcblx0aWYgKCFpdGVtKSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRjb25zdCBjdXJyZW50ID0gZGF0YS5kYXRhO1xyXG5cdGNvbnN0IHR5cGUgPSBpdGVtLnR5cGU7XHJcblx0Y29uc3QgaW5kZXggPSBpdGVtLmluZGV4O1xyXG5cclxuXHRpZiAoIWN1cnJlbnQpIHJldHVybiBjYihmYWxzZSk7XHJcblxyXG5cdGlmICh0eXBlID09PSAncHJvcCcpIHtcclxuXHRcdGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpO1xyXG5cclxuXHRcdGlmIChjdXJyZW50UHJvcCA9PT0gLTEpIHtcclxuXHRcdFx0c2V0UHJvcChwZWQsIGN1cnJlbnQpO1xyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdENsZWFyUGVkUHJvcChwZWQsIGluZGV4KTtcclxuXHRcdFx0Y2IodHJ1ZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9IGVsc2UgaWYgKHR5cGUgPT09ICdkcmF3YWJsZScpIHtcclxuXHRcdGNvbnN0IGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpO1xyXG5cclxuXHRcdGlmIChjdXJyZW50LnZhbHVlID09PSBpdGVtLm9mZikge1xyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoY3VycmVudC52YWx1ZSA9PT0gY3VycmVudERyYXdhYmxlKSB7XHJcblx0XHRcdFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBpdGVtLm9mZiwgMCwgMCk7XHJcblx0XHRcdGNiKHRydWUpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRzZXREcmF3YWJsZShwZWQsIGN1cnJlbnQpO1xyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuKTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zYXZlT3V0Zml0LCBhc3luYyAoZGF0YTogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZU91dGZpdCcsIGZyYW1ld29ya2RJZCwgZGF0YSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZGVsZXRlT3V0Zml0LCBhc3luYyAoe2lkfSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmRlbGV0ZU91dGZpdCcsIGZyYW1ld29ya2RJZCwgaWQpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnJlbmFtZU91dGZpdCwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlbmFtZU91dGZpdCcsIGZyYW1ld29ya2RJZCwgZGF0YSk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUudXNlT3V0Zml0LCBhc3luYyAob3V0Zml0OiBPdXRmaXQsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHNldFBlZENsb3RoZXMocGVkLCBvdXRmaXQpO1xyXG5cdGNiKDEpO1xyXG59KTsiLCAiaW1wb3J0IHsgZ2V0RnJhbWV3b3JrSUQsIHJlcXVlc3RMb2NhbGUsIHNlbmROVUlFdmVudCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrLCB1cGRhdGVQZWQsIGRlbGF5LCBwZWQsIGdldFBsYXllckRhdGEgfSBmcm9tIFwiQHV0aWxzXCJcclxuaW1wb3J0IHsgc3RhcnRDYW1lcmEsIHN0b3BDYW1lcmEgfSBmcm9tIFwiLi9jYW1lcmFcIlxyXG5pbXBvcnQgdHlwZSB7IFRBcHBlYXJhbmNlWm9uZSwgVE1lbnVUeXBlcyB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IHsgT3V0Zml0IH0gZnJvbSBcIkB0eXBpbmdzL291dGZpdHNcIlxyXG5pbXBvcnQgeyBTZW5kIH0gZnJvbSBcIkBldmVudHNcIlxyXG5pbXBvcnQgeyBnZXRBcHBlYXJhbmNlLCBnZXRUYXR0b29EYXRhIH0gZnJvbSBcIi4vYXBwZWFyYW5jZS9nZXR0ZXJzXCJcclxuaW1wb3J0IFwiLi9oYW5kbGVyc1wiXHJcblxyXG5jb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxubGV0IGFybW91ciA9IDBcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuTWVudSh6b25lOiBUQXBwZWFyYW5jZVpvbmUsIGNyZWF0aW9uOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgIGNvbnN0IHBlZEhhbmRsZSA9IFBsYXllclBlZElkKClcclxuICAgIGNvbnN0IGNvbmZpZ01lbnVzID0gY29uZmlnLm1lbnVzKClcclxuXHJcbiAgICBjb25zdCB0eXBlID0gem9uZS50eXBlXHJcblxyXG4gICAgY29uc3QgbWVudSA9IGNvbmZpZ01lbnVzW3R5cGVdXHJcbiAgICBpZiAoIW1lbnUpIHJldHVyblxyXG5cclxuICAgIHVwZGF0ZVBlZChwZWRIYW5kbGUpXHJcbiAgICBzdGFydENhbWVyYSgpXHJcblxyXG4gICAgY29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgY29uc3QgdGFicyA9IG1lbnUudGFic1xyXG4gICAgbGV0IGFsbG93RXhpdCA9IG1lbnUuYWxsb3dFeGl0XHJcblxyXG4gICAgYXJtb3VyID0gR2V0UGVkQXJtb3VyKHBlZEhhbmRsZSlcclxuXHJcbiAgICBsZXQgb3V0Zml0cyA9IFtdXHJcblxyXG4gICAgY29uc3QgaGFzT3V0Zml0VGFiID0gdGFicy5pbmNsdWRlcygnb3V0Zml0cycpXHJcbiAgICBpZiAoaGFzT3V0Zml0VGFiKSBvdXRmaXRzID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPE91dGZpdFtdPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0T3V0Zml0cycsIGZyYW1ld29ya2RJZCkgYXMgT3V0Zml0W11cclxuXHJcbiAgICBsZXQgbW9kZWxzID0gW11cclxuXHJcbiAgICBjb25zdCBoYXNIZXJpdGFnZVRhYiA9IHRhYnMuaW5jbHVkZXMoJ2hlcml0YWdlJylcclxuICAgIGlmIChoYXNIZXJpdGFnZVRhYikge1xyXG4gICAgICAgIG1vZGVscyA9IGNvbmZpZy5tb2RlbHMoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGhhc1RhdHRvb1RhYiA9IHRhYnMuaW5jbHVkZXMoJ3RhdHRvb3MnKVxyXG4gICAgbGV0IHRhdHRvb3NcclxuICAgIGlmIChoYXNUYXR0b29UYWIpIHtcclxuICAgICAgICB0YXR0b29zID0gZ2V0VGF0dG9vRGF0YSgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYmxhY2tsaXN0ID0gZ2V0QmxhY2tsaXN0KHpvbmUpXHJcblxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkSGFuZGxlKVxyXG5cclxuICAgIGlmIChjcmVhdGlvbikge1xyXG4gICAgICAgIGFsbG93RXhpdCA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQuZGF0YSwge1xyXG4gICAgICAgIHRhYnMsXHJcbiAgICAgICAgYXBwZWFyYW5jZSxcclxuICAgICAgICBibGFja2xpc3QsXHJcbiAgICAgICAgdGF0dG9vcyxcclxuICAgICAgICBvdXRmaXRzLFxyXG4gICAgICAgIG1vZGVscyxcclxuICAgICAgICBhbGxvd0V4aXQsXHJcbiAgICAgICAgbG9jYWxlOiBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKVxyXG4gICAgfSlcclxuICAgIFNldE51aUZvY3VzKHRydWUsIHRydWUpXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC52aXNpYmxlLCB0cnVlKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRCbGFja2xpc3Qoem9uZTogVEFwcGVhcmFuY2Vab25lKSB7XHJcbiAgICBpZiAoIXpvbmUpIHJldHVybiB7fVxyXG5cclxuICAgIGNvbnN0IHtncm91cFR5cGVzLCBiYXNlfSA9IGNvbmZpZy5ibGFja2xpc3QoKVxyXG5cclxuICAgIGlmICghZ3JvdXBUeXBlcykgcmV0dXJuIHt9XHJcbiAgICBpZiAoIWJhc2UpIHJldHVybiB7fVxyXG5cclxuICAgIGxldCBibGFja2xpc3QgPSB7Li4uYmFzZX1cclxuXHJcbiAgICBjb25zdCBwbGF5ZXJEYXRhID0gZ2V0UGxheWVyRGF0YSgpXHJcblxyXG5cclxuICAgIGZvciAoY29uc3QgdHlwZSBpbiBncm91cFR5cGVzKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBzID0gZ3JvdXBUeXBlc1t0eXBlXVxyXG4gICAgICAgIGZvciAoY29uc3QgZ3JvdXAgaW4gZ3JvdXBzKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgc2tpcDogYm9vbGVhbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodHlwZSA9PSAnam9icycgJiYgem9uZS5qb2JzKSB7XHJcbiAgICAgICAgICAgICAgICBza2lwID0gem9uZS5qb2JzLmluY2x1ZGVzKHBsYXllckRhdGEuam9iLm5hbWUpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09ICdnYW5ncycgJiYgem9uZS5nYW5ncykge1xyXG4gICAgICAgICAgICAgICAgc2tpcCA9IHpvbmUuZ2FuZ3MuaW5jbHVkZXMocGxheWVyRGF0YS5nYW5nLm5hbWUpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmICh0eXBlID09ICdncm91cHMnICYmIHpvbmUuZ3JvdXBzKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBza2lwID0gIXpvbmUuZ3JvdXBzLmluY2x1ZGVzKHBsYXllckRhdGEuZ3JvdXAubmFtZSlcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFza2lwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBncm91cEJsYWNrbGlzdCA9IGdyb3Vwc1tncm91cF1cclxuICAgICAgICAgICAgICAgIGJsYWNrbGlzdCA9IE9iamVjdC5hc3NpZ24oe30sIGJsYWNrbGlzdCwgZ3JvdXBCbGFja2xpc3QsIHtcclxuICAgICAgICAgICAgICAgICAgZHJhd2FibGVzOiBPYmplY3QuYXNzaWduKHt9LCBibGFja2xpc3QuZHJhd2FibGVzLCBncm91cEJsYWNrbGlzdC5kcmF3YWJsZXMpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBibGFja2xpc3RcclxuXHJcbiAgICAvLyByZXR1cm4gYmxhY2tsaXN0XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9zZU1lbnUoKSB7XHJcbiAgICBTZXRQZWRBcm1vdXIocGVkLCBhcm1vdXIpXHJcblxyXG4gICAgc3RvcENhbWVyYSgpXHJcbiAgICBTZXROdWlGb2N1cyhmYWxzZSwgZmFsc2UpXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC52aXNpYmxlLCBmYWxzZSlcclxufSIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSwgVEFwcGVhcmFuY2Vab25lLCBUTWVudVR5cGVzIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgeyBvcGVuTWVudSB9IGZyb20gXCIuL21lbnVcIlxyXG5pbXBvcnQgeyBzZXRQZWRBcHBlYXJhbmNlLCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlIH0gZnJvbSBcIi4vYXBwZWFyYW5jZS9zZXR0ZXJzXCJcclxuaW1wb3J0IHsgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSBcIkB1dGlsc1wiXHJcblxyXG5SZWdpc3RlckNvbW1hbmQoJ29wZW5NZW51JywgKCkgPT4ge1xyXG4gICAgb3Blbk1lbnUoeyB0eXBlOiBcImFwcGVhcmFuY2VcIiwgY29vcmRzOiBbMCwgMCwgMCwgMF0gfSkgIFxyXG4gIH0sIGZhbHNlKVxyXG5cclxuXHJcbmV4cG9ydHMoJ1NldFBlZEFwcGVhcmFuY2UnLCBhc3luYyAocGVkOiBudW1iZXIsIGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlKSA9PiB7XHJcbiAgICBhd2FpdCBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcclxufSlcclxuXHJcbmV4cG9ydHMoJ1NldFBsYXllclBlZEFwcGVhcmFuY2UnLCBhc3luYyAoZnJhbWV3b3JrSUQpID0+IHtcclxuICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcbiAgICBhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcbn0pXHJcblxyXG5leHBvcnRzKCdHZXRQbGF5ZXJQZWRBcHBlYXJhbmNlJywgYXN5bmMgKGZyYW1ld29ya0lEKSA9PiB7XHJcbiAgICByZXR1cm4gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG59KVxyXG5cclxub24oJ2JsX3Nwcml0ZXM6Y2xpZW50OnVzZVpvbmUnLCAoem9uZTogVEFwcGVhcmFuY2Vab25lKSA9PiB7XHJcbiAgICBvcGVuTWVudSh6b25lKVxyXG59KSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7QUFBTyxJQUFJLE1BQU07QUFFVixJQUFNLFlBQVksd0JBQUMsY0FBc0I7QUFDNUMsUUFBTTtBQUNWLEdBRnlCO0FBYWxCLElBQU0sZUFBZSx3QkFBQyxRQUFnQixTQUFjO0FBQ3ZELGlCQUFlO0FBQUEsSUFDWDtBQUFBLElBQ0E7QUFBQSxFQUNKLENBQUM7QUFDTCxHQUw0QjtBQU9yQixJQUFNLFFBQVEsd0JBQUMsT0FBZSxJQUFJLFFBQVEsU0FBTyxXQUFXLEtBQUssRUFBRSxDQUFDLEdBQXREO0FBRWQsSUFBTSxlQUFlLDhCQUFPLFVBQTRDO0FBQzNFLE1BQUksWUFBb0IsT0FBTyxVQUFVLFdBQVcsUUFBUSxXQUFXLEtBQUs7QUFFNUUsTUFBSSxDQUFDLGFBQWEsU0FBUyxHQUFHO0FBQzFCLFlBQVEsVUFBVSxPQUFPLEVBQUU7QUFBQSxNQUN2QixPQUFPO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsSUFDZCxDQUFDO0FBRUQsVUFBTSxJQUFJLE1BQU0sb0NBQW9DLEtBQUssR0FBRztBQUFBLEVBQ2hFO0FBRUEsTUFBSSxlQUFlLFNBQVM7QUFBRyxXQUFPO0FBRXRDLGVBQWEsU0FBUztBQUV0QixRQUFNLHFCQUFxQiw2QkFBcUI7QUFDNUMsV0FBTyxJQUFJLFFBQVEsYUFBVztBQUMxQixZQUFNLFdBQVcsWUFBWSxNQUFNO0FBQy9CLFlBQUksZUFBZSxTQUFTLEdBQUc7QUFDM0Is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SSxPQUFPLFVBQVU7QUFFNUMsTUFBSSxDQUFDO0FBQVksV0FBTyxDQUFDO0FBQ3pCLE1BQUksQ0FBQztBQUFNLFdBQU8sQ0FBQztBQUVuQixNQUFJLFlBQVksRUFBQyxHQUFHLEtBQUk7QUFFeEIsUUFBTSxhQUFhLGNBQWM7QUFHakMsYUFBVyxRQUFRLFlBQVk7QUFDM0IsVUFBTSxTQUFTLFdBQVcsSUFBSTtBQUM5QixlQUFXLFNBQVMsUUFBUTtBQUV4QixVQUFJLE9BQWdCO0FBRXBCLFVBQUksUUFBUSxVQUFVLEtBQUssTUFBTTtBQUM3QixlQUFPLEtBQUssS0FBSyxTQUFTLFdBQVcsSUFBSSxJQUFJO0FBQUEsTUFDakQ7QUFFQSxVQUFJLFFBQVEsV0FBVyxLQUFLLE9BQU87QUFDL0IsZUFBTyxLQUFLLE1BQU0sU0FBUyxXQUFXLEtBQUssSUFBSTtBQUFBLE1BQ25EO0FBTUEsVUFBSSxDQUFDLE1BQU07QUFDUCxjQUFNLGlCQUFpQixPQUFPLEtBQUs7QUFDbkMsb0JBQVksT0FBTyxPQUFPLENBQUMsR0FBRyxXQUFXLGdCQUFnQjtBQUFBLFVBQ3ZELFdBQVcsT0FBTyxPQUFPLENBQUMsR0FBRyxVQUFVLFdBQVcsZUFBZSxTQUFTO0FBQUEsUUFDNUUsQ0FBQztBQUFBLE1BQ0w7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUVBLFNBQU87QUFHWDtBQTNDUztBQTZDRixTQUFTLFlBQVk7QUFDeEIsZUFBYSxLQUFLLE1BQU07QUFFeEIsYUFBVztBQUNYLGNBQVksT0FBTyxLQUFLO0FBQ3hCLG1EQUEyQixLQUFLO0FBQ3BDO0FBTmdCOzs7QUM3R2hCLGdCQUFnQixZQUFZLE1BQU07QUFDOUIsV0FBUyxFQUFFLE1BQU0sY0FBYyxRQUFRLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDdkQsR0FBRyxLQUFLO0FBR1YsUUFBUSxvQkFBb0IsT0FBT0MsTUFBYSxlQUE0QjtBQUN4RSxRQUFNLGlCQUFpQkEsTUFBSyxVQUFVO0FBQzFDLENBQUM7QUFFRCxRQUFRLDBCQUEwQixPQUFPLGdCQUFnQjtBQUNyRCxRQUFNLGFBQWEsTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFDN0csUUFBTSx1QkFBdUIsVUFBVTtBQUMzQyxDQUFDO0FBRUQsUUFBUSwwQkFBMEIsT0FBTyxnQkFBZ0I7QUFDckQsU0FBTyxNQUFNLHNCQUFtQyxzQ0FBc0MsV0FBVztBQUNyRyxDQUFDO0FBRUQsR0FBRyw2QkFBNkIsQ0FBQyxTQUEwQjtBQUN2RCxXQUFTLElBQUk7QUFDakIsQ0FBQzsiLAogICJuYW1lcyI6IFsiZGVsYXkiLCAiY29uZmlnIiwgInBlZCJdCn0K
