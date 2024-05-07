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
function eventTimer(eventName, delay5) {
  if (delay5 && delay5 > 0) {
    const currentTime = GetGameTimer();
    if ((eventTimers[eventName] || 0) > currentTime)
      return false;
    eventTimers[eventName] = currentTime + delay5;
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
var getFrameworkID = /* @__PURE__ */ __name(() => {
  const bl_bridge = exports.bl_bridge;
  const id = bl_bridge.core().getPlayerData().cid;
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
  const config3 = exports.bl_appearance;
  const models = config3.models();
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
    for (const feature of headStructure) {
      SetFaceFeature(ped, feature);
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
  console.log("deleteOutfit", id);
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
async function openMenu(type, creation = false) {
  const pedHandle = PlayerPedId();
  const configMenus = config.menus();
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
  const blacklist = getBlacklist(type);
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
function getBlacklist(type) {
  const blacklist = config.blacklist();
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
var isInSprite = null;
var config2 = exports.bl_appearance.config();
RegisterCommand("openMenu", () => {
  openMenu("appearance");
  console.log("Menu opened");
}, false);
exports("SetPedAppearance", async (ped3, appearance) => {
  await setPedAppearance(ped3, appearance);
});
exports("SetPlayerPedAppearance", async (frameworkID) => {
  const appearance = await triggerServerCallback("bl_appearance:server:getAppearance", frameworkID);
  await setPlayerPedAppearance(appearance);
});
exports("GetPlayerPedAppearance", async (frameworkID) => {
  return await triggerServerCallback("bl_appearance:server:getAppearance", frameworkID);
});
var zones = exports.bl_appearance.zones();
var bl_sprites = exports.bl_sprites;
RegisterCommand("+openAppearance", () => {
  if (!isInSprite)
    return;
  openMenu(isInSprite);
}, false);
RegisterKeyMapping("+openAppearance", "Open Appearance", "keyboard", config2.openControl);
for (const element of zones) {
  bl_sprites.sprite({
    coords: element.coords,
    shape: "hex",
    key: config2.openControl,
    distance: 3,
    onEnter: () => isInSprite = element.type,
    onExit: () => isInSprite = null
  });
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgbGV0IHBlZCA9IDBcclxuXHJcbmV4cG9ydCBjb25zdCB1cGRhdGVQZWQgPSAocGVkSGFuZGxlOiBudW1iZXIpID0+IHtcclxuICAgIHBlZCA9IHBlZEhhbmRsZVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZGVidWdkYXRhID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZGF0YSwgKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXG4vZywgXCJcXFxcblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfSwgMikpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZW5kTlVJRXZlbnQgPSAoYWN0aW9uOiBzdHJpbmcsIGRhdGE6IGFueSkgPT4ge1xyXG4gICAgU2VuZE5VSU1lc3NhZ2Uoe1xyXG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgIGRhdGE6IGRhdGFcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RNb2RlbCA9IGFzeW5jIChtb2RlbDogc3RyaW5nIHwgbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+ID0+IHtcclxuICAgIGxldCBtb2RlbEhhc2g6IG51bWJlciA9IHR5cGVvZiBtb2RlbCA9PT0gJ251bWJlcicgPyBtb2RlbCA6IEdldEhhc2hLZXkobW9kZWwpXHJcblxyXG4gICAgaWYgKCFJc01vZGVsVmFsaWQobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9fb3hfY2JfJHtyZXNvdXJjZU5hbWV9YCwgKGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnkpID0+IHtcclxuICAgIGNvbnN0IHJlc29sdmUgPSBhY3RpdmVFdmVudHNba2V5XTtcclxuICAgIHJldHVybiByZXNvbHZlICYmIHJlc29sdmUoLi4uYXJncyk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUID0gdW5rbm93bj4oXHJcbiAgICBldmVudE5hbWU6IHN0cmluZywgLi4uYXJnczogYW55XHJcbik6IFByb21pc2U8VD4gfCB2b2lkIHtcclxuICAgIGlmICghZXZlbnRUaW1lcihldmVudE5hbWUsIDApKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBrZXk6IHN0cmluZztcclxuXHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuXHJcbiAgICBlbWl0TmV0KGBfX294X2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvblNlcnZlckNhbGxiYWNrKGV2ZW50TmFtZSwgY2IpIHtcclxuICAgIG9uTmV0KGBfX294X2NiXyR7ZXZlbnROYW1lfWAsIGFzeW5jIChyZXNvdXJjZSwga2V5LCAuLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgbGV0IHJlc3BvbnNlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlID0gYXdhaXQgY2IoLi4uYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGhhbmRsaW5nIGNhbGxiYWNrIGV2ZW50ICR7ZXZlbnROYW1lfWApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgXjMke2Uuc3RhY2t9XjBgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZW1pdE5ldChgX19veF9jYl8ke3Jlc291cmNlfWAsIGtleSwgcmVzcG9uc2UpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vbG9jYWxlXHJcblxyXG5leHBvcnQgY29uc3QgcmVxdWVzdExvY2FsZSA9IChyZXNvdXJjZVNldE5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2hlY2tSZXNvdXJjZUZpbGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChSZXF1ZXN0UmVzb3VyY2VGaWxlU2V0KHJlc291cmNlU2V0TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRMYW4gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UuY29uZmlnKCkubG9jYWxlXHJcbiAgICAgICAgICAgICAgICBsZXQgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS8ke2N1cnJlbnRMYW59Lmpzb25gKTtcclxuICAgICAgICAgICAgICAgIGlmICghbG9jYWxlRmlsZUNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke2N1cnJlbnRMYW59Lmpzb24gbm90IGZvdW5kIGluIGxvY2FsZSwgcGxlYXNlIHZlcmlmeSEsIHdlIHVzZWQgZW5nbGlzaCBmb3Igbm93IWApXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS9lbi5qc29uYClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUobG9jYWxlRmlsZUNvbnRlbnQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChjaGVja1Jlc291cmNlRmlsZSwgMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjaGVja1Jlc291cmNlRmlsZSgpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBsb2NhbGUgPSBhc3luYyAoaWQ6IHN0cmluZywgLi4uYXJnczogc3RyaW5nW10pID0+IHtcclxuICAgIGNvbnN0IGxvY2FsZSA9IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpO1xyXG4gICAgbGV0IGFyZ0luZGV4ID0gMDtcclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSBsb2NhbGVbaWRdLnJlcGxhY2UoLyVzL2csIChtYXRjaDogc3RyaW5nKSA9PiBhcmdJbmRleCA8IGFyZ3MubGVuZ3RoID8gYXJnc1thcmdJbmRleF0gOiBtYXRjaCk7XHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRGcmFtZXdvcmtJRCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGJsX2JyaWRnZSA9IGV4cG9ydHMuYmxfYnJpZGdlXHJcbiAgICBjb25zdCBpZCA9IGJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpLmNpZFxyXG4gICAgcmV0dXJuIGlkXHJcbn0iLCAiaW1wb3J0IHsgQ2FtZXJhLCBWZWN0b3IzLCBDYW1lcmFCb25lcyB9IGZyb20gJ0B0eXBpbmdzL2NhbWVyYSc7XHJcbmltcG9ydCB7IGRlbGF5LCBwZWQgfSBmcm9tICdAdXRpbHMnO1xyXG5pbXBvcnQgeyBSZWNlaXZlIH0gZnJvbSAnQGV2ZW50cyc7XHJcblxyXG5sZXQgcnVubmluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgY2FtRGlzdGFuY2U6IG51bWJlciA9IDEuODtcclxubGV0IGNhbTogQ2FtZXJhIHwgbnVsbCA9IG51bGw7XHJcbmxldCBhbmdsZVk6IG51bWJlciA9IDAuMDtcclxubGV0IGFuZ2xlWjogbnVtYmVyID0gMC4wO1xyXG5sZXQgdGFyZ2V0Q29vcmRzOiBWZWN0b3IzIHwgbnVsbCA9IG51bGw7XHJcbmxldCBvbGRDYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgY2hhbmdpbmdDYW06IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGxhc3RYOiBudW1iZXIgPSAwO1xyXG5sZXQgY3VycmVudEJvbmU6IGtleW9mIENhbWVyYUJvbmVzID0gJ2hlYWQnO1xyXG5cclxuY29uc3QgQ2FtZXJhQm9uZXM6IENhbWVyYUJvbmVzID0ge1xyXG5cdGhlYWQ6IDMxMDg2LFxyXG5cdHRvcnNvOiAyNDgxOCxcclxuXHRsZWdzOiAxNDIwMSxcclxufTtcclxuXHJcbmNvbnN0IGNvcyA9IChkZWdyZWVzOiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG5cdHJldHVybiBNYXRoLmNvcygoZGVncmVlcyAqIE1hdGguUEkpIC8gMTgwKTtcclxufTtcclxuXHJcbmNvbnN0IHNpbiA9IChkZWdyZWVzOiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG5cdHJldHVybiBNYXRoLnNpbigoZGVncmVlcyAqIE1hdGguUEkpIC8gMTgwKTtcclxufTtcclxuXHJcbmNvbnN0IGdldEFuZ2xlcyA9ICgpOiBudW1iZXJbXSA9PiB7XHJcblx0Y29uc3QgeCA9XHJcblx0XHQoKGNvcyhhbmdsZVopICogY29zKGFuZ2xlWSkgKyBjb3MoYW5nbGVZKSAqIGNvcyhhbmdsZVopKSAvIDIpICpcclxuXHRcdGNhbURpc3RhbmNlO1xyXG5cdGNvbnN0IHkgPVxyXG5cdFx0KChzaW4oYW5nbGVaKSAqIGNvcyhhbmdsZVkpICsgY29zKGFuZ2xlWSkgKiBzaW4oYW5nbGVaKSkgLyAyKSAqXHJcblx0XHRjYW1EaXN0YW5jZTtcclxuXHRjb25zdCB6ID0gc2luKGFuZ2xlWSkgKiBjYW1EaXN0YW5jZTtcclxuXHJcblx0cmV0dXJuIFt4LCB5LCB6XTtcclxufTtcclxuXHJcbmNvbnN0IHNldENhbVBvc2l0aW9uID0gKG1vdXNlWD86IG51bWJlciwgbW91c2VZPzogbnVtYmVyKTogdm9pZCA9PiB7XHJcblx0aWYgKCFydW5uaW5nIHx8ICF0YXJnZXRDb29yZHMgfHwgY2hhbmdpbmdDYW0pIHJldHVybjtcclxuXHJcblx0bW91c2VYID0gbW91c2VYID8/IDAuMDtcclxuXHRtb3VzZVkgPSBtb3VzZVkgPz8gMC4wO1xyXG5cclxuXHRhbmdsZVogLT0gbW91c2VYO1xyXG5cdGFuZ2xlWSArPSBtb3VzZVk7XHJcblx0YW5nbGVZID0gTWF0aC5taW4oTWF0aC5tYXgoYW5nbGVZLCAwLjApLCA4OS4wKTtcclxuXHJcblx0Y29uc3QgW3gsIHksIHpdID0gZ2V0QW5nbGVzKCk7XHJcblxyXG5cdFNldENhbUNvb3JkKFxyXG5cdFx0Y2FtLFxyXG5cdFx0dGFyZ2V0Q29vcmRzLnggKyB4LFxyXG5cdFx0dGFyZ2V0Q29vcmRzLnkgKyB5LFxyXG5cdFx0dGFyZ2V0Q29vcmRzLnogKyB6XHJcblx0KTtcclxuXHRQb2ludENhbUF0Q29vcmQoY2FtLCB0YXJnZXRDb29yZHMueCwgdGFyZ2V0Q29vcmRzLnksIHRhcmdldENvb3Jkcy56KTtcclxufTtcclxuXHJcbmNvbnN0IG1vdmVDYW1lcmEgPSBhc3luYyAoY29vcmRzOiBWZWN0b3IzLCBkaXN0YW5jZT86IG51bWJlcikgPT4ge1xyXG5cdGNvbnN0IGhlYWRpbmc6IG51bWJlciA9IEdldEVudGl0eUhlYWRpbmcocGVkKSArIDk0O1xyXG5cdGRpc3RhbmNlID0gZGlzdGFuY2UgPz8gMS4wO1xyXG5cclxuXHRjaGFuZ2luZ0NhbSA9IHRydWU7XHJcblx0Y2FtRGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuXHRhbmdsZVogPSBoZWFkaW5nO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKTtcclxuXHJcblx0Y29uc3QgbmV3Y2FtOiBDYW1lcmEgPSBDcmVhdGVDYW1XaXRoUGFyYW1zKFxyXG5cdFx0J0RFRkFVTFRfU0NSSVBURURfQ0FNRVJBJyxcclxuXHRcdGNvb3Jkcy54ICsgeCxcclxuXHRcdGNvb3Jkcy55ICsgeSxcclxuXHRcdGNvb3Jkcy56ICsgeixcclxuXHRcdDAuMCxcclxuXHRcdDAuMCxcclxuXHRcdDAuMCxcclxuXHRcdDcwLjAsXHJcblx0XHRmYWxzZSxcclxuXHRcdDBcclxuXHQpO1xyXG5cclxuXHR0YXJnZXRDb29yZHMgPSBjb29yZHM7XHJcblx0Y2hhbmdpbmdDYW0gPSBmYWxzZTtcclxuXHRvbGRDYW0gPSBjYW07XHJcblx0Y2FtID0gbmV3Y2FtO1xyXG5cclxuXHRQb2ludENhbUF0Q29vcmQobmV3Y2FtLCBjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56KTtcclxuXHRTZXRDYW1BY3RpdmVXaXRoSW50ZXJwKG5ld2NhbSwgb2xkQ2FtLCAyNTAsIDAsIDApO1xyXG5cclxuXHRhd2FpdCBkZWxheSgyNTApO1xyXG5cclxuXHRTZXRDYW1Vc2VTaGFsbG93RG9mTW9kZShuZXdjYW0sIHRydWUpO1xyXG5cdFNldENhbU5lYXJEb2YobmV3Y2FtLCAwLjQpO1xyXG5cdFNldENhbUZhckRvZihuZXdjYW0sIDEuMik7XHJcblx0U2V0Q2FtRG9mU3RyZW5ndGgobmV3Y2FtLCAwLjMpO1xyXG5cdHVzZUhpRG9mKG5ld2NhbSk7XHJcblxyXG5cdERlc3Ryb3lDYW0ob2xkQ2FtLCB0cnVlKTtcclxufTtcclxuXHJcbmNvbnN0IHVzZUhpRG9mID0gKGN1cnJlbnRjYW06IENhbWVyYSkgPT4ge1xyXG5cdGlmICghKERvZXNDYW1FeGlzdChjYW0pICYmIGN1cnJlbnRjYW0gPT0gY2FtKSkgcmV0dXJuO1xyXG5cdFNldFVzZUhpRG9mKCk7XHJcblx0c2V0VGltZW91dCh1c2VIaURvZiwgMCk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc3RhcnRDYW1lcmEgPSAoKSA9PiB7XHJcblx0aWYgKHJ1bm5pbmcpIHJldHVybjtcclxuXHRydW5uaW5nID0gdHJ1ZTtcclxuXHRjYW1EaXN0YW5jZSA9IDEuMDtcclxuXHRjYW0gPSBDcmVhdGVDYW0oJ0RFRkFVTFRfU0NSSVBURURfQ0FNRVJBJywgdHJ1ZSk7XHJcblx0Y29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCAzMTA4NiwgMC4wLCAwLjAsIDAuMCk7XHJcblx0U2V0Q2FtQ29vcmQoY2FtLCB4LCB5LCB6KTtcclxuXHRSZW5kZXJTY3JpcHRDYW1zKHRydWUsIHRydWUsIDEwMDAsIHRydWUsIHRydWUpO1xyXG5cdG1vdmVDYW1lcmEoeyB4OiB4LCB5OiB5LCB6OiB6IH0sIGNhbURpc3RhbmNlKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdG9wQ2FtZXJhID0gKCk6IHZvaWQgPT4ge1xyXG5cdGlmICghcnVubmluZykgcmV0dXJuO1xyXG5cdHJ1bm5pbmcgPSBmYWxzZTtcclxuXHJcblx0UmVuZGVyU2NyaXB0Q2FtcyhmYWxzZSwgdHJ1ZSwgMjUwLCB0cnVlLCBmYWxzZSk7XHJcblx0RGVzdHJveUNhbShjYW0sIHRydWUpO1xyXG5cdGNhbSA9IG51bGw7XHJcblx0dGFyZ2V0Q29vcmRzID0gbnVsbDtcclxufTtcclxuXHJcbmNvbnN0IHNldENhbWVyYSA9ICh0eXBlPzoga2V5b2YgQ2FtZXJhQm9uZXMpOiB2b2lkID0+IHtcclxuXHRjb25zdCBib25lOiBudW1iZXIgfCB1bmRlZmluZWQgPSBDYW1lcmFCb25lc1t0eXBlXTtcclxuXHRpZiAoY3VycmVudEJvbmUgPT0gdHlwZSkgcmV0dXJuO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gYm9uZVxyXG5cdFx0PyBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZSwgMC4wLCAwLjAsIGJvbmUgPT09IDE0MjAxID8gMC4yIDogMC4wKVxyXG5cdFx0OiBHZXRFbnRpdHlDb29yZHMocGVkLCBmYWxzZSk7XHJcblxyXG5cdG1vdmVDYW1lcmEoXHJcblx0XHR7XHJcblx0XHRcdHg6IHgsXHJcblx0XHRcdHk6IHksXHJcblx0XHRcdHo6IHogKyAwLjAsXHJcblx0XHR9LFxyXG5cdFx0MS4wXHJcblx0KTtcclxuXHJcblx0Y3VycmVudEJvbmUgPSB0eXBlO1xyXG59O1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbU1vdmUsIChkYXRhLCBjYikgPT4ge1xyXG5cdGNiKDEpO1xyXG5cdGxldCBoZWFkaW5nOiBudW1iZXIgPSBHZXRFbnRpdHlIZWFkaW5nKHBlZCk7XHJcblx0aWYgKGxhc3RYID09IGRhdGEueCkge1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRoZWFkaW5nID0gZGF0YS54ID4gbGFzdFggPyBoZWFkaW5nICsgNSA6IGhlYWRpbmcgLSA1O1xyXG5cdFNldEVudGl0eUhlYWRpbmcocGVkLCBoZWFkaW5nKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtU2Nyb2xsLCAodHlwZTogbnVtYmVyLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzd2l0Y2ggKHR5cGUpIHtcclxuXHRcdGNhc2UgMjpcclxuXHRcdFx0c2V0Q2FtZXJhKCk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAxOlxyXG5cdFx0XHRzZXRDYW1lcmEoJ2xlZ3MnKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRjYXNlIDM6XHJcblx0XHRcdHNldENhbWVyYSgnaGVhZCcpO1xyXG5cdFx0XHRicmVhaztcclxuXHR9XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVpvb20sIChkYXRhLCBjYikgPT4ge1xyXG5cdGlmIChkYXRhID09PSAnZG93bicpIHtcclxuXHRcdGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSArIDAuMDU7XHJcblx0XHRjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlID49IDEuMCA/IDEuMCA6IG5ld0Rpc3RhbmNlO1xyXG5cdH0gZWxzZSBpZiAoZGF0YSA9PT0gJ3VwJykge1xyXG5cdFx0Y29uc3QgbmV3RGlzdGFuY2U6IG51bWJlciA9IGNhbURpc3RhbmNlIC0gMC4wNTtcclxuXHRcdGNhbURpc3RhbmNlID0gbmV3RGlzdGFuY2UgPD0gMC4zNSA/IDAuMzUgOiBuZXdEaXN0YW5jZTtcclxuXHR9XHJcblxyXG5cdGNhbURpc3RhbmNlID0gY2FtRGlzdGFuY2U7XHJcblx0c2V0Q2FtUG9zaXRpb24oKTtcclxuXHRjYigxKTtcclxufSk7XHJcbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJCbGVtaXNoZXNcIixcbiAgICBcIkZhY2lhbEhhaXJcIixcbiAgICBcIkV5ZWJyb3dzXCIsXG4gICAgXCJBZ2VpbmdcIixcbiAgICBcIk1ha2V1cFwiLFxuICAgIFwiQmx1c2hcIixcbiAgICBcIkNvbXBsZXhpb25cIixcbiAgICBcIlN1bkRhbWFnZVwiLFxuICAgIFwiTGlwc3RpY2tcIixcbiAgICBcIk1vbGVzRnJlY2tsZXNcIixcbiAgICBcIkNoZXN0SGFpclwiLFxuICAgIFwiQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiQWRkQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiRXllQ29sb3JcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcIk5vc2VfV2lkdGhcIixcbiAgICBcIk5vc2VfUGVha19IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19MZW5naHRcIixcbiAgICBcIk5vc2VfQm9uZV9IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19Mb3dlcmluZ1wiLFxuICAgIFwiTm9zZV9Cb25lX1R3aXN0XCIsXG4gICAgXCJFeWVCcm93bl9IZWlnaHRcIixcbiAgICBcIkV5ZUJyb3duX0ZvcndhcmRcIixcbiAgICBcIkNoZWVrc19Cb25lX0hpZ2hcIixcbiAgICBcIkNoZWVrc19Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGVla3NfV2lkdGhcIixcbiAgICBcIkV5ZXNfT3Blbm5pbmdcIixcbiAgICBcIkxpcHNfVGhpY2tuZXNzXCIsXG4gICAgXCJKYXdfQm9uZV9XaWR0aFwiLFxuICAgIFwiSmF3X0JvbmVfQmFja19MZW5naHRcIixcbiAgICBcIkNoaW5fQm9uZV9Mb3dlcmluZ1wiLFxuICAgIFwiQ2hpbl9Cb25lX0xlbmd0aFwiLFxuICAgIFwiQ2hpbl9Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGluX0hvbGVcIixcbiAgICBcIk5lY2tfVGhpa25lc3NcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImZhY2VcIixcbiAgICBcIm1hc2tzXCIsXG4gICAgXCJoYWlyXCIsXG4gICAgXCJ0b3Jzb3NcIixcbiAgICBcImxlZ3NcIixcbiAgICBcImJhZ3NcIixcbiAgICBcInNob2VzXCIsXG4gICAgXCJuZWNrXCIsXG4gICAgXCJzaGlydHNcIixcbiAgICBcInZlc3RcIixcbiAgICBcImRlY2Fsc1wiLFxuICAgIFwiamFja2V0c1wiXG5dXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiaGF0c1wiLFxuICAgIFwiZ2xhc3Nlc1wiLFxuICAgIFwiZWFycmluZ3NcIixcbiAgICBcIm1vdXRoXCIsXG4gICAgXCJsaGFuZFwiLFxuICAgIFwicmhhbmRcIixcbiAgICBcIndhdGNoZXNcIixcbiAgICBcImJyYWNlbGV0c1wiXG5dXG4iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRIYWlyRGF0YSwgVEhlYWRPdmVybGF5LCBUSGVhZE92ZXJsYXlUb3RhbCB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IEhFQURfT1ZFUkxBWVMgZnJvbSBcIkBkYXRhL2hlYWRcIlxyXG5pbXBvcnQgRkFDRV9GRUFUVVJFUyBmcm9tIFwiQGRhdGEvZmFjZVwiXHJcbmltcG9ydCBEUkFXQUJMRV9OQU1FUyBmcm9tIFwiQGRhdGEvZHJhd2FibGVzXCJcclxuaW1wb3J0IFBST1BfTkFNRVMgZnJvbSBcIkBkYXRhL3Byb3BzXCJcclxuaW1wb3J0IHsgcGVkLCBvblNlcnZlckNhbGxiYWNrIH0gZnJvbSAnQHV0aWxzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kTW9kZWxJbmRleCh0YXJnZXQ6IG51bWJlcikge1xyXG4gICAgY29uc3QgY29uZmlnID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlXHJcbiAgICBjb25zdCBtb2RlbHMgPSBjb25maWcubW9kZWxzKClcclxuXHJcbiAgICByZXR1cm4gbW9kZWxzLmZpbmRJbmRleCgobW9kZWw6IHN0cmluZykgPT4gR2V0SGFzaEtleShtb2RlbCkgPT09IHRhcmdldClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhhaXIocGVkSGFuZGxlOiBudW1iZXIpOiBUSGFpckRhdGEge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjb2xvcjogR2V0UGVkSGFpckNvbG9yKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGlnaGxpZ2h0OiBHZXRQZWRIYWlySGlnaGxpZ2h0Q29sb3IocGVkSGFuZGxlKVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZEJsZW5kRGF0YShwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BlZHIwZm9udG91cmEvZml2ZW0tYXBwZWFyYW5jZS9ibG9iL21haW4vZ2FtZS9zcmMvY2xpZW50L2luZGV4LnRzI0w2N1xyXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKDgwKTtcclxuICAgIGdsb2JhbC5DaXRpemVuLmludm9rZU5hdGl2ZSgnMHgyNzQ2YmQ5ZDg4YzVjNWQwJywgcGVkSGFuZGxlLCBuZXcgVWludDMyQXJyYXkoYnVmZmVyKSk7XHJcblxyXG4gICAgY29uc3QgeyAwOiBzaGFwZUZpcnN0LCAyOiBzaGFwZVNlY29uZCwgNDogc2hhcGVUaGlyZCwgNjogc2tpbkZpcnN0LCA4OiBza2luU2Vjb25kLCAxODogaGFzUGFyZW50LCAxMDogc2tpblRoaXJkIH0gPSBuZXcgVWludDMyQXJyYXkoYnVmZmVyKTtcclxuICAgIGNvbnN0IHsgMDogc2hhcGVNaXgsIDI6IHNraW5NaXgsIDQ6IHRoaXJkTWl4IH0gPSBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlciwgNDgpO1xyXG5cclxuICAgIC8qICAgXHJcbiAgICAgICAgMDogc2hhcGVGaXJzdCxcclxuICAgICAgICAyOiBzaGFwZVNlY29uZCxcclxuICAgICAgICA0OiBzaGFwZVRoaXJkLFxyXG4gICAgICAgIDY6IHNraW5GaXJzdCxcclxuICAgICAgICA4OiBza2luU2Vjb25kLFxyXG4gICAgICAgIDEwOiBza2luVGhpcmQsXHJcbiAgICAgICAgMTg6IGhhc1BhcmVudCxcclxuICAgICovXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNoYXBlRmlyc3QsICAgLy8gZmF0aGVyXHJcbiAgICAgICAgc2hhcGVTZWNvbmQsIC8vIG1vdGhlclxyXG4gICAgICAgIHNoYXBlVGhpcmQsXHJcblxyXG4gICAgICAgIHNraW5GaXJzdCxcclxuICAgICAgICBza2luU2Vjb25kLFxyXG4gICAgICAgIHNraW5UaGlyZCxcclxuXHJcbiAgICAgICAgc2hhcGVNaXgsIC8vIHJlc2VtYmxhbmNlXHJcblxyXG4gICAgICAgIHRoaXJkTWl4LFxyXG4gICAgICAgIHNraW5NaXgsICAgLy8gc2tpbnBlcmNlbnRcclxuXHJcbiAgICAgICAgaGFzUGFyZW50OiBCb29sZWFuKGhhc1BhcmVudCksXHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZE92ZXJsYXkocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCB0b3RhbHM6IFRIZWFkT3ZlcmxheVRvdGFsID0ge307XHJcbiAgICBsZXQgaGVhZERhdGE6IFRIZWFkT3ZlcmxheSA9IHt9O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgSEVBRF9PVkVSTEFZUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBIRUFEX09WRVJMQVlTW2ldO1xyXG4gICAgICAgIHRvdGFsc1tvdmVybGF5XSA9IEdldE51bUhlYWRPdmVybGF5VmFsdWVzKGkpO1xyXG5cclxuICAgICAgICBpZiAob3ZlcmxheSA9PT0gXCJFeWVDb2xvclwiKSB7XHJcbiAgICAgICAgICAgIGhlYWREYXRhW292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogR2V0UGVkRXllQ29sb3IocGVkSGFuZGxlKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFtfLCBvdmVybGF5VmFsdWUsIGNvbG91clR5cGUsIGZpcnN0Q29sb3IsIHNlY29uZENvbG9yLCBvdmVybGF5T3BhY2l0eV0gPSBHZXRQZWRIZWFkT3ZlcmxheURhdGEocGVkSGFuZGxlLCBpKTtcclxuICAgICAgICAgICAgaGVhZERhdGFbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBpIC0gMSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogb3ZlcmxheVZhbHVlID09PSAyNTUgPyAtMSA6IG92ZXJsYXlWYWx1ZSxcclxuICAgICAgICAgICAgICAgIGNvbG91clR5cGU6IGNvbG91clR5cGUsXHJcbiAgICAgICAgICAgICAgICBmaXJzdENvbG9yOiBmaXJzdENvbG9yLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kQ29sb3I6IHNlY29uZENvbG9yLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheU9wYWNpdHk6IG92ZXJsYXlPcGFjaXR5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbaGVhZERhdGEsIHRvdGFsc107XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZTogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBwZWRNb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuXHJcbiAgICBpZiAocGVkTW9kZWwgIT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpICYmIHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKSkgcmV0dXJuXHJcblxyXG4gICAgbGV0IGZhY2VTdHJ1Y3QgPSB7fVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBGQUNFX0ZFQVRVUkVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEZBQ0VfRkVBVFVSRVNbaV1cclxuICAgICAgICBmYWNlU3RydWN0W292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWRGYWNlRmVhdHVyZShwZWRIYW5kbGUsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWNlU3RydWN0XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXREcmF3YWJsZXMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBkcmF3YWJsZXMgPSB7fVxyXG4gICAgbGV0IHRvdGFsRHJhd2FibGVzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IERSQVdBQkxFX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IERSQVdBQkxFX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxEcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFRleHR1cmVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWRIYW5kbGUsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRUZXh0dXJlVmFyaWF0aW9uKHBlZEhhbmRsZSwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtkcmF3YWJsZXMsIHRvdGFsRHJhd2FibGVzXVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcHMocGVkSGFuZGxlOiBudW1iZXIpIHtcclxuICAgIGxldCBwcm9wcyA9IHt9XHJcbiAgICBsZXQgdG90YWxQcm9wcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBQUk9QX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IFBST1BfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSlcclxuXHJcbiAgICAgICAgdG90YWxQcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWRQcm9wRHJhd2FibGVWYXJpYXRpb25zKHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWRIYW5kbGUsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkUHJvcEluZGV4KHBlZEhhbmRsZSwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFByb3BUZXh0dXJlSW5kZXgocGVkSGFuZGxlLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3Byb3BzLCB0b3RhbFByb3BzXVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwcGVhcmFuY2UocGVkSGFuZGxlOiBudW1iZXIpOiBQcm9taXNlPFRBcHBlYXJhbmNlPiB7XHJcbiAgICBjb25zdCBbaGVhZERhdGEsIHRvdGFsc10gPSBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUpXHJcbiAgICBjb25zdCBbZHJhd2FibGVzLCBkcmF3VG90YWxdID0gZ2V0RHJhd2FibGVzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtwcm9wcywgcHJvcFRvdGFsXSA9IGdldFByb3BzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IG1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkSGFuZGxlKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbW9kZWxJbmRleDogZmluZE1vZGVsSW5kZXgobW9kZWwpLFxyXG4gICAgICAgIG1vZGVsOiBtb2RlbCxcclxuICAgICAgICBoYWlyQ29sb3I6IGdldEhhaXIocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEgYXMgVEhlYWRPdmVybGF5LFxyXG4gICAgICAgIGhlYWRPdmVybGF5VG90YWw6IHRvdGFscyBhcyBUSGVhZE92ZXJsYXlUb3RhbCxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZSksXHJcbiAgICAgICAgZHJhd2FibGVzOiBkcmF3YWJsZXMsXHJcbiAgICAgICAgcHJvcHM6IHByb3BzLFxyXG4gICAgICAgIGRyYXdUb3RhbDogZHJhd1RvdGFsLFxyXG4gICAgICAgIHByb3BUb3RhbDogcHJvcFRvdGFsLFxyXG4gICAgICAgIHRhdHRvb3M6IFtdXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldEFwcGVhcmFuY2VcIiwgZ2V0QXBwZWFyYW5jZSlcclxub25TZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6Z2V0QXBwZWFyYW5jZScsICgpID0+IHtcclxuICAgIHJldHVybiBnZXRBcHBlYXJhbmNlKHBlZClcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVkQ2xvdGhlcyhwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgY29uc3QgW2RyYXdhYmxlc10gPSBnZXREcmF3YWJsZXMocGVkSGFuZGxlKVxyXG4gICAgY29uc3QgW3Byb3BzXSA9IGdldFByb3BzKHBlZEhhbmRsZSlcclxuICAgIGNvbnN0IFtoZWFkRGF0YV0gPSBnZXRIZWFkT3ZlcmxheShwZWRIYW5kbGUpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEsXHJcbiAgICAgICAgZHJhd2FibGVzOiBkcmF3YWJsZXMsXHJcbiAgICAgICAgcHJvcHM6IHByb3BzLFxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRQZWRDbG90aGVzXCIsIGdldFBlZENsb3RoZXMpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVkU2tpbihwZWRIYW5kbGU6IG51bWJlcikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkSGFuZGxlKSxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZEhhbmRsZSksXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZEhhbmRsZSksXHJcbiAgICAgICAgbW9kZWw6IEdldEVudGl0eU1vZGVsKHBlZEhhbmRsZSlcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkU2tpblwiLCBnZXRQZWRTa2luKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhdHRvb0RhdGEoKSB7XHJcbiAgICBsZXQgdGF0dG9vWm9uZXMgPSB7fVxyXG5cclxuICAgIGNvbnN0IFtUQVRUT09fTElTVCwgVEFUVE9PX0NBVEVHT1JJRVNdID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLnRhdHRvb3MoKVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fQ0FURUdPUklFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gVEFUVE9PX0NBVEVHT1JJRVNbaV1cclxuICAgICAgICBjb25zdCB6b25lID0gY2F0ZWdvcnkuem9uZVxyXG4gICAgICAgIGNvbnN0IGxhYmVsID0gY2F0ZWdvcnkubGFiZWxcclxuICAgICAgICBjb25zdCBpbmRleCA9IGNhdGVnb3J5LmluZGV4XHJcbiAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdID0ge1xyXG4gICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICBsYWJlbDogbGFiZWwsXHJcbiAgICAgICAgICAgIHpvbmVJbmRleDogaW5kZXgsXHJcbiAgICAgICAgICAgIGRsY3M6IFtdXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IFRBVFRPT19MSVNULmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRsY0RhdGEgPSBUQVRUT09fTElTVFtqXVxyXG4gICAgICAgICAgICB0YXR0b29ab25lc1tpbmRleF0uZGxjcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBkbGNEYXRhLmRsYyxcclxuICAgICAgICAgICAgICAgIGRsY0luZGV4OiBqLFxyXG4gICAgICAgICAgICAgICAgdGF0dG9vczogW11cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaXNGZW1hbGUgPSBHZXRFbnRpdHlNb2RlbChwZWQpID09PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gVEFUVE9PX0xJU1RbaV1cclxuICAgICAgICBjb25zdCB7IGRsYywgdGF0dG9vcyB9ID0gZGF0YVxyXG4gICAgICAgIGNvbnN0IGRsY0hhc2ggPSBHZXRIYXNoS2V5KGRsYylcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRhdHRvb3MubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IHRhdHRvb3Nbal1cclxuICAgICAgICAgICAgbGV0IHRhdHRvbyA9IG51bGxcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyVGF0dG9vID0gdGF0dG9vRGF0YS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIGNvbnN0IGlzRmVtYWxlVGF0dG9vID0gbG93ZXJUYXR0b28uaW5jbHVkZXMoXCJfZlwiKVxyXG4gICAgICAgICAgICBpZiAoaXNGZW1hbGVUYXR0b28gJiYgaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNGZW1hbGVUYXR0b28gJiYgIWlzRmVtYWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXR0b28gPSB0YXR0b29EYXRhXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBoYXNoID0gbnVsbFxyXG4gICAgICAgICAgICBsZXQgem9uZSA9IC0xXHJcblxyXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoID0gR2V0SGFzaEtleSh0YXR0b28pXHJcbiAgICAgICAgICAgICAgICB6b25lID0gR2V0UGVkRGVjb3JhdGlvblpvbmVGcm9tSGFzaGVzKGRsY0hhc2gsIGhhc2gpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh6b25lICE9PSAtMSAmJiBoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB6b25lVGF0dG9vcyA9IHRhdHRvb1pvbmVzW3pvbmVdLmRsY3NbaV0udGF0dG9vc1xyXG5cclxuICAgICAgICAgICAgICAgIHpvbmVUYXR0b29zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0YXR0b28sXHJcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogaGFzaCxcclxuICAgICAgICAgICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICAgICAgICAgIGRsYzogZGxjLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGF0dG9vWm9uZXNcclxufVxyXG5cclxuLy9taWdyYXRpb25cclxuXHJcbm9uU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50Om1pZ3JhdGlvbjpzZXRBcHBlYXJhbmNlJywgKGRhdGE6IHt0eXBlOiBzdHJpbmcsIGRhdGE6IGFueX0pID0+IHtcclxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdmaXZlbScpIGV4cG9ydHNbJ2ZpdmVtLWFwcGVhcmFuY2UnXS5zZXRQbGF5ZXJBcHBlYXJhbmNlKGRhdGEuZGF0YSlcclxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdpbGxlbml1bScpIGV4cG9ydHNbJ2lsbGVuaXVtLWFwcGVhcmFuY2UnXS5zZXRQbGF5ZXJBcHBlYXJhbmNlKGRhdGEuZGF0YSlcclxufSk7IiwgIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgaGF0czoge1xyXG4gICAgICAgIHR5cGU6IFwicHJvcFwiLFxyXG4gICAgICAgIGluZGV4OiAwLFxyXG4gICAgfSxcclxuICAgIGdsYXNzZXM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgIH0sXHJcbiAgICBtYXNrczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgICAgICBvZmY6IDAsXHJcbiAgICB9LFxyXG4gICAgc2hpcnRzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA4LFxyXG4gICAgICAgIG9mZjogMTVcclxuICAgIH0sXHJcbiAgICBqYWNrZXRzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiAxMSxcclxuICAgICAgICBvZmY6IDE1LFxyXG4gICAgfSxcclxuICAgIGxlZ3M6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDQsXHJcbiAgICAgICAgb2ZmOiAxMSxcclxuICAgIH0sXHJcbiAgICBzaG9lczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogNixcclxuICAgICAgICBvZmY6IDEzLFxyXG4gICAgfVxyXG59IiwgImltcG9ydCB7IFRWYWx1ZSB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCI7XHJcbmltcG9ydCBUT0dHTEVfSU5ERVhFUyBmcm9tIFwiQGRhdGEvdG9nZ2xlc1wiXHJcbmltcG9ydCB7IHJlcXVlc3RNb2RlbCwgcGVkLCB1cGRhdGVQZWQsIGRlbGF5fSBmcm9tICdAdXRpbHMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldERyYXdhYmxlKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgMClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFByb3AocGVkSGFuZGxlOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgaWYgKGRhdGEudmFsdWUgPT09IC0xKSB7XHJcbiAgICAgICAgQ2xlYXJQZWRQcm9wKHBlZEhhbmRsZSwgZGF0YS5pbmRleClcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBTZXRQZWRQcm9wSW5kZXgocGVkSGFuZGxlLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlLCBkYXRhLnRleHR1cmUsIGZhbHNlKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2V0TW9kZWwgPSBhc3luYyAobW9kZWw6IG51bWJlcikgPT4ge1xyXG4gICAgY29uc3QgbW9kZWxIYXNoID0gYXdhaXQgcmVxdWVzdE1vZGVsKG1vZGVsKVxyXG4gICAgU2V0UGxheWVyTW9kZWwoUGxheWVySWQoKSwgbW9kZWxIYXNoKVxyXG4gICAgU2V0TW9kZWxBc05vTG9uZ2VyTmVlZGVkKG1vZGVsSGFzaClcclxuICAgIGNvbnN0IHBlZEhhbmRsZSA9IFBsYXllclBlZElkKClcclxuICAgIHVwZGF0ZVBlZChwZWRIYW5kbGUpXHJcbiAgICBTZXRQZWREZWZhdWx0Q29tcG9uZW50VmFyaWF0aW9uKHBlZEhhbmRsZSlcclxuXHJcbiAgICBpZiAobW9kZWxIYXNoID09PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSkgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWQsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIGZhbHNlKVxyXG4gICAgZWxzZSBpZiAobW9kZWxIYXNoID09PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKSkgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWQsIDQ1LCAyMSwgMCwgMjAsIDE1LCAwLCAwLjMsIDAuMSwgMCwgZmFsc2UpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBTZXRGYWNlRmVhdHVyZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBTZXRQZWRGYWNlRmVhdHVyZShwZWRIYW5kbGUsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUgKyAwLjApXHJcbn1cclxuXHJcbmNvbnN0IGlzUG9zaXRpdmUgPSAodmFsOiBudW1iZXIpID0+IHZhbCA+PSAwID8gdmFsIDogMFxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEhlYWRCbGVuZChwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgY29uc3Qgc2hhcGVGaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZUZpcnN0KVxyXG4gICAgY29uc3Qgc2hhcGVTZWNvbmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVTZWNvbmQpXHJcbiAgICBjb25zdCBzaGFwZVRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlVGhpcmQpXHJcbiAgICBjb25zdCBza2luRmlyc3QgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpbkZpcnN0KVxyXG4gICAgY29uc3Qgc2tpblNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5za2luU2Vjb25kKVxyXG4gICAgY29uc3Qgc2tpblRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNraW5UaGlyZClcclxuICAgIGNvbnN0IHNoYXBlTWl4ID0gZGF0YS5zaGFwZU1peCArIDAuMFxyXG4gICAgY29uc3Qgc2tpbk1peCA9IGRhdGEuc2tpbk1peCArIDAuMFxyXG4gICAgY29uc3QgdGhpcmRNaXggPSBkYXRhLnRoaXJkTWl4ICsgMC4wXHJcbiAgICBjb25zdCBoYXNQYXJlbnQgPSBkYXRhLmhhc1BhcmVudFxyXG5cclxuICAgIFNldFBlZEhlYWRCbGVuZERhdGEocGVkSGFuZGxlLCBzaGFwZUZpcnN0LCBzaGFwZVNlY29uZCwgc2hhcGVUaGlyZCwgc2tpbkZpcnN0LCBza2luU2Vjb25kLCBza2luVGhpcmQsIHNoYXBlTWl4LCBza2luTWl4LFxyXG4gICAgICAgIHRoaXJkTWl4LCBoYXNQYXJlbnQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkT3ZlcmxheShwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgY29uc3QgaW5kZXggPSBkYXRhLmluZGV4XHJcblxyXG4gICAgaWYgKGluZGV4ID09PSAxMykge1xyXG4gICAgICAgIFNldFBlZEV5ZUNvbG9yKHBlZEhhbmRsZSwgZGF0YS52YWx1ZSlcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlID09PSAtMSA/IDI1NSA6IGRhdGEub3ZlcmxheVZhbHVlXHJcblxyXG4gICAgU2V0UGVkSGVhZE92ZXJsYXkocGVkSGFuZGxlLCBpbmRleCwgdmFsdWUsIGRhdGEub3ZlcmxheU9wYWNpdHkgKyAwLjApXHJcbiAgICBTZXRQZWRIZWFkT3ZlcmxheUNvbG9yKHBlZEhhbmRsZSwgaW5kZXgsIDEsIGRhdGEuZmlyc3RDb2xvciwgZGF0YS5zZWNvbmRDb2xvcilcclxufVxyXG5cclxuLy8gZnVuY3Rpb24gUmVzZXRUb2dnbGVzKGRhdGEpXHJcbi8vICAgICBsb2NhbCBwZWQgPSBjYWNoZS5wZWRcclxuXHJcbi8vICAgICBsb2NhbCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4vLyAgICAgbG9jYWwgcHJvcHMgPSBkYXRhLnByb3BzXHJcblxyXG4vLyAgICAgZm9yIHRvZ2dsZUl0ZW0sIHRvZ2dsZURhdGEgaW4gcGFpcnMoVE9HR0xFX0lOREVYRVMpIGRvXHJcbi8vICAgICAgICAgbG9jYWwgdG9nZ2xlVHlwZSA9IHRvZ2dsZURhdGEudHlwZVxyXG4vLyAgICAgICAgIGxvY2FsIGluZGV4ID0gdG9nZ2xlRGF0YS5pbmRleFxyXG5cclxuLy8gICAgICAgICBpZiB0b2dnbGVUeXBlID09IFwiZHJhd2FibGVcIiBhbmQgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dIHRoZW5cclxuLy8gICAgICAgICAgICAgbG9jYWwgY3VycmVudERyYXdhYmxlID0gR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpbmRleClcclxuLy8gICAgICAgICAgICAgaWYgY3VycmVudERyYXdhYmxlIH49IGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSB0aGVuXHJcbi8vICAgICAgICAgICAgICAgICBTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCAwKVxyXG4vLyAgICAgICAgICAgICBlbmRcclxuLy8gICAgICAgICBlbHNlaWYgdG9nZ2xlVHlwZSA9PSBcInByb3BcIiBhbmQgcHJvcHNbdG9nZ2xlSXRlbV0gdGhlblxyXG4vLyAgICAgICAgICAgICBsb2NhbCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KVxyXG4vLyAgICAgICAgICAgICBpZiBjdXJyZW50UHJvcCB+PSBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSB0aGVuXHJcbi8vICAgICAgICAgICAgICAgICBTZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleCwgcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIGZhbHNlKVxyXG4vLyAgICAgICAgICAgICBlbmRcclxuLy8gICAgICAgICBlbmRcclxuLy8gICAgIGVuZFxyXG4vLyBlbmRcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZXNldFRvZ2dsZXMoZGF0YSkge1xyXG4gICAgY29uc3QgZHJhd2FibGVzID0gZGF0YS5kcmF3YWJsZXNcclxuICAgIGNvbnN0IHByb3BzID0gZGF0YS5wcm9wc1xyXG5cclxuICAgIGZvciAoY29uc3QgW3RvZ2dsZUl0ZW0sIHRvZ2dsZURhdGFdIG9mIE9iamVjdC5lbnRyaWVzKFRPR0dMRV9JTkRFWEVTKSkge1xyXG4gICAgICAgIGNvbnN0IHRvZ2dsZVR5cGUgPSB0b2dnbGVEYXRhLnR5cGVcclxuICAgICAgICBjb25zdCBpbmRleCA9IHRvZ2dsZURhdGEuaW5kZXhcclxuXHJcbiAgICAgICAgaWYgKHRvZ2dsZVR5cGUgPT09IFwiZHJhd2FibGVcIiAmJiBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0pIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudERyYXdhYmxlID0gR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpbmRleClcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnREcmF3YWJsZSAhPT0gZHJhd2FibGVzW3RvZ2dsZUl0ZW1dLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCAwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh0b2dnbGVUeXBlID09PSBcInByb3BcIiAmJiBwcm9wc1t0b2dnbGVJdGVtXSkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudFByb3AgIT09IHByb3BzW3RvZ2dsZUl0ZW1dLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBTZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleCwgcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIGZhbHNlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkQ2xvdGhlcyhwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgY29uc3QgZHJhd2FibGVzID0gZGF0YS5kcmF3YWJsZXNcclxuICAgIGNvbnN0IHByb3BzID0gZGF0YS5wcm9wc1xyXG4gICAgY29uc3QgaGVhZE92ZXJsYXkgPSBkYXRhLmhlYWRPdmVybGF5XHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIGRyYXdhYmxlcykge1xyXG4gICAgICAgIGNvbnN0IGRyYXdhYmxlID0gZHJhd2FibGVzW2lkXVxyXG4gICAgICAgIHNldERyYXdhYmxlKHBlZEhhbmRsZSwgZHJhd2FibGUpXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBwcm9wcykge1xyXG4gICAgICAgIGNvbnN0IHByb3AgPSBwcm9wc1tpZF1cclxuICAgICAgICBzZXRQcm9wKHBlZEhhbmRsZSwgcHJvcClcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIGhlYWRPdmVybGF5KSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IGhlYWRPdmVybGF5W2lkXVxyXG4gICAgICAgIHNldEhlYWRPdmVybGF5KHBlZEhhbmRsZSwgb3ZlcmxheSlcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHNldFBlZFNraW4gPSBhc3luYyAoZGF0YSkgPT4ge1xyXG4gICAgY29uc3QgaGVhZFN0cnVjdHVyZSA9IGRhdGEuaGVhZFN0cnVjdHVyZVxyXG4gICAgY29uc3QgaGVhZEJsZW5kID0gZGF0YS5oZWFkQmxlbmRcclxuXHJcbiAgICBhd2FpdCBzZXRNb2RlbChkYXRhLm1vZGVsKVxyXG5cclxuICAgIGlmIChoZWFkQmxlbmQpIHNldEhlYWRCbGVuZChwZWQsIGhlYWRCbGVuZClcclxuICAgIFxyXG4gICAgaWYgKGhlYWRTdHJ1Y3R1cmUpIGZvciAoY29uc3QgZmVhdHVyZSBvZiBoZWFkU3RydWN0dXJlKSB7XHJcbiAgICAgICAgU2V0RmFjZUZlYXR1cmUocGVkLCBmZWF0dXJlKVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkVGF0dG9vcyhwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm5cclxuXHJcbiAgICBDbGVhclBlZERlY29yYXRpb25zTGVhdmVTY2FycyhwZWRIYW5kbGUpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IGRhdGFbaV0udGF0dG9vXHJcbiAgICAgICAgaWYgKHRhdHRvb0RhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IEdldEhhc2hLZXkodGF0dG9vRGF0YS5kbGMpXHJcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvbyA9IHRhdHRvb0RhdGEuaGFzaFxyXG4gICAgICAgICAgICBBZGRQZWREZWNvcmF0aW9uRnJvbUhhc2hlcyhwZWRIYW5kbGUsIGNvbGxlY3Rpb24sIHRhdHRvbylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRIYWlyQ29sb3JzKHBlZEhhbmRsZTogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBjb25zdCBjb2xvciA9IGRhdGEuY29sb3JcclxuICAgIGNvbnN0IGhpZ2hsaWdodCA9IGRhdGEuaGlnaGxpZ2h0XHJcbiAgICBTZXRQZWRIYWlyQ29sb3IocGVkSGFuZGxlLCBjb2xvciwgaGlnaGxpZ2h0KVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGVkQXBwZWFyYW5jZShwZWRIYW5kbGU6IG51bWJlciwgZGF0YSkge1xyXG4gICAgYXdhaXQgc2V0UGVkU2tpbihkYXRhKVxyXG4gICAgc2V0UGVkQ2xvdGhlcyhwZWRIYW5kbGUsIGRhdGEpXHJcbiAgICBzZXRQZWRIYWlyQ29sb3JzKHBlZEhhbmRsZSwgZGF0YS5oYWlyQ29sb3IpXHJcbiAgICBzZXRQZWRUYXR0b29zKHBlZEhhbmRsZSwgZGF0YS50YXR0b29zKVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGxheWVyUGVkQXBwZWFyYW5jZShkYXRhKSB7XHJcbiAgICBhd2FpdCBzZXRQZWRTa2luKGRhdGEpXHJcbiAgICBzZXRQZWRDbG90aGVzKHBlZCwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMocGVkLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MocGVkLCBkYXRhLnRhdHRvb3MpXHJcbn0iLCAiaW1wb3J0IHsgUmVjZWl2ZSB9IGZyb20gJ0BldmVudHMnO1xyXG5pbXBvcnQge1xyXG5cdHJlc2V0VG9nZ2xlcyxcclxuXHRzZXREcmF3YWJsZSxcclxuXHRTZXRGYWNlRmVhdHVyZSxcclxuXHRzZXRIZWFkQmxlbmQsXHJcblx0c2V0SGVhZE92ZXJsYXksXHJcblx0c2V0TW9kZWwsXHJcblx0c2V0UGVkQ2xvdGhlcyxcclxuXHRzZXRQZWRUYXR0b29zLFxyXG5cdHNldFBsYXllclBlZEFwcGVhcmFuY2UsXHJcblx0c2V0UHJvcCxcclxufSBmcm9tICcuL2FwcGVhcmFuY2Uvc2V0dGVycyc7XHJcbmltcG9ydCB7IGNsb3NlTWVudSB9IGZyb20gJy4vbWVudSc7XHJcbmltcG9ydCB7IFRBcHBlYXJhbmNlLCBUVG9nZ2xlRGF0YSwgVFZhbHVlIH0gZnJvbSAnQHR5cGluZ3MvYXBwZWFyYW5jZSc7XHJcbmltcG9ydCB7IGRlbGF5LCBnZXRGcmFtZXdvcmtJRCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrLCBwZWQgfSBmcm9tICdAdXRpbHMnO1xyXG5pbXBvcnQgeyBnZXRBcHBlYXJhbmNlLCBnZXRUYXR0b29EYXRhIH0gZnJvbSAnLi9hcHBlYXJhbmNlL2dldHRlcnMnO1xyXG5pbXBvcnQgVE9HR0xFX0lOREVYRVMgZnJvbSAnQGRhdGEvdG9nZ2xlcyc7XHJcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gJ0B0eXBpbmdzL291dGZpdHMnO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbmNlbCwgYXN5bmMgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRhd2FpdCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpO1xyXG5cdGNsb3NlTWVudSgpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zYXZlLCBhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdHJlc2V0VG9nZ2xlcyhhcHBlYXJhbmNlKTtcclxuXHJcblx0YXdhaXQgZGVsYXkoMTAwKTtcclxuXHJcblx0Y29uc3QgbmV3QXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkKTtcclxuXHRuZXdBcHBlYXJhbmNlLnRhdHRvb3MgPSBhcHBlYXJhbmNlLnRhdHRvb3M7XHJcblx0dHJpZ2dlclNlcnZlckNhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlQXBwZWFyYW5jZScsIGdldEZyYW1ld29ya0lEKCksIG5ld0FwcGVhcmFuY2UpO1xyXG5cclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgbmV3QXBwZWFyYW5jZS50YXR0b29zKTtcclxuXHJcblx0Y2xvc2VNZW51KCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldE1vZGVsLCBhc3luYyAobW9kZWw6IHN0cmluZywgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgaGFzaCA9IEdldEhhc2hLZXkobW9kZWwpO1xyXG5cdGlmICghSXNNb2RlbEluQ2RpbWFnZShoYXNoKSB8fCAhSXNNb2RlbFZhbGlkKGhhc2gpKSB7XHJcblx0XHRyZXR1cm4gY2IoMCk7XHJcblx0fVxyXG5cclxuXHRhd2FpdCBzZXRNb2RlbChoYXNoKTtcclxuXHJcblx0Y29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkKTtcclxuXHJcblx0YXBwZWFyYW5jZS50YXR0b29zID0gW107XHJcblxyXG5cdHNldFBlZFRhdHRvb3MocGVkLCBbXSk7XHJcblxyXG5cdGNiKGFwcGVhcmFuY2UpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5nZXRNb2RlbFRhdHRvb3MsIGFzeW5jIChfOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHRhdHRvb3MgPSBnZXRUYXR0b29EYXRhKCk7XHJcblxyXG5cdGNiKHRhdHRvb3MpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRIZWFkU3RydWN0dXJlLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRTZXRGYWNlRmVhdHVyZShwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRIZWFkT3ZlcmxheSwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c2V0SGVhZE92ZXJsYXkocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0SGVhZEJsZW5kLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRIZWFkQmxlbmQocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0VGF0dG9vcywgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRQcm9wLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQcm9wKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldERyYXdhYmxlLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXREcmF3YWJsZShwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS50b2dnbGVJdGVtLCBhc3luYyAoZGF0YTogVFRvZ2dsZURhdGEsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGl0ZW0gPSBUT0dHTEVfSU5ERVhFU1tkYXRhLml0ZW1dO1xyXG5cdGlmICghaXRlbSkgcmV0dXJuIGNiKGZhbHNlKTtcclxuXHJcblx0Y29uc3QgY3VycmVudCA9IGRhdGEuZGF0YTtcclxuXHRjb25zdCB0eXBlID0gaXRlbS50eXBlO1xyXG5cdGNvbnN0IGluZGV4ID0gaXRlbS5pbmRleDtcclxuXHJcblx0aWYgKCFjdXJyZW50KSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRpZiAodHlwZSA9PT0gJ3Byb3AnKSB7XHJcblx0XHRjb25zdCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KTtcclxuXHJcblx0XHRpZiAoY3VycmVudFByb3AgPT09IC0xKSB7XHJcblx0XHRcdHNldFByb3AocGVkLCBjdXJyZW50KTtcclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRDbGVhclBlZFByb3AocGVkLCBpbmRleCk7XHJcblx0XHRcdGNiKHRydWUpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fSBlbHNlIGlmICh0eXBlID09PSAnZHJhd2FibGUnKSB7XHJcblx0XHRjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KTtcclxuXHJcblx0XHRpZiAoY3VycmVudC52YWx1ZSA9PT0gaXRlbS5vZmYpIHtcclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGN1cnJlbnQudmFsdWUgPT09IGN1cnJlbnREcmF3YWJsZSkge1xyXG5cdFx0XHRTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgaXRlbS5vZmYsIDAsIDApO1xyXG5cdFx0XHRjYih0cnVlKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0c2V0RHJhd2FibGUocGVkLCBjdXJyZW50KTtcclxuXHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2F2ZU91dGZpdCwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVPdXRmaXQnLCBmcmFtZXdvcmtkSWQsIGRhdGEpO1xyXG5cdGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmRlbGV0ZU91dGZpdCwgYXN5bmMgKHtpZH0sIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcbiAgICBjb25zb2xlLmxvZygnZGVsZXRlT3V0Zml0JywgaWQpO1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6ZGVsZXRlT3V0Zml0JywgZnJhbWV3b3JrZElkLCBpZCk7XHJcblx0Y2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUucmVuYW1lT3V0Zml0LCBhc3luYyAoZGF0YTogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6cmVuYW1lT3V0Zml0JywgZnJhbWV3b3JrZElkLCBkYXRhKTtcclxuXHRjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS51c2VPdXRmaXQsIGFzeW5jIChvdXRmaXQ6IE91dGZpdCwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c2V0UGVkQ2xvdGhlcyhwZWQsIG91dGZpdCk7XHJcblx0Y2IoMSk7XHJcbn0pOyIsICJpbXBvcnQgeyBnZXRGcmFtZXdvcmtJRCwgcmVxdWVzdExvY2FsZSwgc2VuZE5VSUV2ZW50LCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIHVwZGF0ZVBlZCwgZGVsYXksIHBlZCB9IGZyb20gXCJAdXRpbHNcIlxyXG5pbXBvcnQgeyBzdGFydENhbWVyYSwgc3RvcENhbWVyYSB9IGZyb20gXCIuL2NhbWVyYVwiXHJcbmltcG9ydCB0eXBlIHsgVE1lbnVUeXBlcyB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IHsgT3V0Zml0IH0gZnJvbSBcIkB0eXBpbmdzL291dGZpdHNcIlxyXG5pbXBvcnQgeyBTZW5kIH0gZnJvbSBcIkBldmVudHNcIlxyXG5pbXBvcnQgeyBnZXRBcHBlYXJhbmNlLCBnZXRUYXR0b29EYXRhIH0gZnJvbSBcIi4vYXBwZWFyYW5jZS9nZXR0ZXJzXCJcclxuaW1wb3J0IFwiLi9oYW5kbGVyc1wiXHJcblxyXG5jb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxubGV0IGFybW91ciA9IDBcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuTWVudSh0eXBlOiBUTWVudVR5cGVzLCBjcmVhdGlvbjogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICBjb25zdCBwZWRIYW5kbGUgPSBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBjb25maWdNZW51cyA9IGNvbmZpZy5tZW51cygpXHJcblxyXG4gICAgY29uc3QgbWVudSA9IGNvbmZpZ01lbnVzW3R5cGVdXHJcbiAgICBpZiAoIW1lbnUpIHJldHVyblxyXG5cclxuICAgIHVwZGF0ZVBlZChwZWRIYW5kbGUpXHJcbiAgICBzdGFydENhbWVyYSgpXHJcblxyXG4gICAgY29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKVxyXG4gICAgY29uc3QgdGFicyA9IG1lbnUudGFic1xyXG4gICAgbGV0IGFsbG93RXhpdCA9IG1lbnUuYWxsb3dFeGl0XHJcblxyXG4gICAgYXJtb3VyID0gR2V0UGVkQXJtb3VyKHBlZEhhbmRsZSlcclxuXHJcbiAgICBsZXQgb3V0Zml0cyA9IFtdXHJcblxyXG4gICAgY29uc3QgaGFzT3V0Zml0VGFiID0gdGFicy5pbmNsdWRlcygnb3V0Zml0cycpXHJcbiAgICBpZiAoaGFzT3V0Zml0VGFiKSBvdXRmaXRzID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPE91dGZpdFtdPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0T3V0Zml0cycsIGZyYW1ld29ya2RJZCkgYXMgT3V0Zml0W11cclxuXHJcbiAgICBsZXQgbW9kZWxzID0gW11cclxuXHJcbiAgICBjb25zdCBoYXNIZXJpdGFnZVRhYiA9IHRhYnMuaW5jbHVkZXMoJ2hlcml0YWdlJylcclxuICAgIGlmIChoYXNIZXJpdGFnZVRhYikge1xyXG4gICAgICAgIG1vZGVscyA9IGNvbmZpZy5tb2RlbHMoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGhhc1RhdHRvb1RhYiA9IHRhYnMuaW5jbHVkZXMoJ3RhdHRvb3MnKVxyXG4gICAgbGV0IHRhdHRvb3NcclxuICAgIGlmIChoYXNUYXR0b29UYWIpIHtcclxuICAgICAgICB0YXR0b29zID0gZ2V0VGF0dG9vRGF0YSgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYmxhY2tsaXN0ID0gZ2V0QmxhY2tsaXN0KHR5cGUpXHJcblxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkSGFuZGxlKVxyXG5cclxuICAgIGlmIChjcmVhdGlvbikge1xyXG4gICAgICAgIGFsbG93RXhpdCA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQuZGF0YSwge1xyXG4gICAgICAgIHRhYnMsXHJcbiAgICAgICAgYXBwZWFyYW5jZSxcclxuICAgICAgICBibGFja2xpc3QsXHJcbiAgICAgICAgdGF0dG9vcyxcclxuICAgICAgICBvdXRmaXRzLFxyXG4gICAgICAgIG1vZGVscyxcclxuICAgICAgICBhbGxvd0V4aXQsXHJcbiAgICAgICAgbG9jYWxlOiBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKVxyXG4gICAgfSlcclxuICAgIFNldE51aUZvY3VzKHRydWUsIHRydWUpXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC52aXNpYmxlLCB0cnVlKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRCbGFja2xpc3QodHlwZTogVE1lbnVUeXBlcykge1xyXG4gICAgY29uc3QgYmxhY2tsaXN0ID0gY29uZmlnLmJsYWNrbGlzdCgpXHJcblxyXG4gICAgcmV0dXJuIGJsYWNrbGlzdFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VNZW51KCkge1xyXG4gICAgU2V0UGVkQXJtb3VyKHBlZCwgYXJtb3VyKVxyXG5cclxuICAgIHN0b3BDYW1lcmEoKVxyXG4gICAgU2V0TnVpRm9jdXMoZmFsc2UsIGZhbHNlKVxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQudmlzaWJsZSwgZmFsc2UpXHJcbn0iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRNZW51VHlwZXMgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCB7IG9wZW5NZW51IH0gZnJvbSBcIi4vbWVudVwiXHJcbmltcG9ydCB7IHNldFBlZEFwcGVhcmFuY2UsIHNldFBsYXllclBlZEFwcGVhcmFuY2UgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxyXG5pbXBvcnQgeyBkZWxheSwgdHJpZ2dlclNlcnZlckNhbGxiYWNrLCBwZWQgfSBmcm9tIFwiQHV0aWxzXCJcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSB9IGZyb20gXCIuL2FwcGVhcmFuY2UvZ2V0dGVyc1wiXHJcblxyXG5sZXQgaXNJblNwcml0ZTogVE1lbnVUeXBlcyB8IG51bGwgPSBudWxsXHJcblxyXG5jb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UuY29uZmlnKClcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgnb3Blbk1lbnUnLCAoKSA9PiB7XHJcbiAgICBvcGVuTWVudSgnYXBwZWFyYW5jZScpICBcclxuICAgIGNvbnNvbGUubG9nKCdNZW51IG9wZW5lZCcpXHJcbiAgfSwgZmFsc2UpXHJcblxyXG5cclxuZXhwb3J0cygnU2V0UGVkQXBwZWFyYW5jZScsIGFzeW5jIChwZWQ6IG51bWJlciwgYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UpID0+IHtcclxuICAgIGF3YWl0IHNldFBlZEFwcGVhcmFuY2UocGVkLCBhcHBlYXJhbmNlKVxyXG59KVxyXG5cclxuZXhwb3J0cygnU2V0UGxheWVyUGVkQXBwZWFyYW5jZScsIGFzeW5jIChmcmFtZXdvcmtJRCkgPT4ge1xyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxuICAgIGF3YWl0IHNldFBsYXllclBlZEFwcGVhcmFuY2UoYXBwZWFyYW5jZSlcclxufSlcclxuXHJcbmV4cG9ydHMoJ0dldFBsYXllclBlZEFwcGVhcmFuY2UnLCBhc3luYyAoZnJhbWV3b3JrSUQpID0+IHtcclxuICAgIHJldHVybiBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcbn0pXHJcblxyXG5jb25zdCB6b25lcyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS56b25lcygpXHJcbmNvbnN0IGJsX3Nwcml0ZXMgPSBleHBvcnRzLmJsX3Nwcml0ZXNcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgnK29wZW5BcHBlYXJhbmNlJywgKCkgPT4ge1xyXG4gICAgaWYgKCFpc0luU3ByaXRlKSByZXR1cm5cclxuICAgIG9wZW5NZW51KGlzSW5TcHJpdGUpXHJcbn0sIGZhbHNlKVxyXG5cclxuUmVnaXN0ZXJLZXlNYXBwaW5nKCcrb3BlbkFwcGVhcmFuY2UnLCAnT3BlbiBBcHBlYXJhbmNlJywgJ2tleWJvYXJkJywgY29uZmlnLm9wZW5Db250cm9sKVxyXG5cclxuZm9yIChjb25zdCBlbGVtZW50IG9mIHpvbmVzKSB7XHJcbiAgICBibF9zcHJpdGVzLnNwcml0ZSh7XHJcbiAgICAgICAgY29vcmRzOiBlbGVtZW50LmNvb3JkcyxcclxuICAgICAgICBzaGFwZTogJ2hleCcsXHJcbiAgICAgICAga2V5OiBjb25maWcub3BlbkNvbnRyb2wsXHJcbiAgICAgICAgZGlzdGFuY2U6IDMuMCxcclxuICAgICAgICBvbkVudGVyOiAoKSA9PiBpc0luU3ByaXRlID0gZWxlbWVudC50eXBlLFxyXG4gICAgICAgIG9uRXhpdDogKCkgPT4gaXNJblNwcml0ZSA9IG51bGxcclxuICAgIH0pXHJcbn0iXSwKICAibWFwcGluZ3MiOiAiOzs7O0FBQU8sSUFBSSxNQUFNO0FBRVYsSUFBTSxZQUFZLHdCQUFDLGNBQXNCO0FBQzVDLFFBQU07QUFDVixHQUZ5QjtBQWFsQixJQUFNLGVBQWUsd0JBQUMsUUFBZ0IsU0FBYztBQUN2RCxpQkFBZTtBQUFBLElBQ1g7QUFBQSxJQUNBO0FBQUEsRUFDSixDQUFDO0FBQ0wsR0FMNEI7QUFPckIsSUFBTSxRQUFRLHdCQUFDLE9BQWUsSUFBSSxRQUFRLFNBQU8sV0FBVyxLQUFLLEVBQUUsQ0FBQyxHQUF0RDtBQUVkLElBQU0sZUFBZSw4QkFBTyxVQUE0QztBQUMzRSxNQUFJLFlBQW9CLE9BQU8sVUFBVSxXQUFXLFFBQVEsV0FBVyxLQUFLO0FBRTVFLE1BQUksQ0FBQyxhQUFhLFNBQVMsR0FBRztBQUMxQixZQUFRLFVBQVUsT0FBTyxFQUFFO0FBQUEsTUFDdkIsT0FBTztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLElBQ2QsQ0FBQztBQUVELFVBQU0sSUFBSSxNQUFNLG9DQUFvQyxLQUFLLEdBQUc7QUFB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
