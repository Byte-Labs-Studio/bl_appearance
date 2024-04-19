var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/client/utils/index.ts
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
  console.log("frameworkdId", id);
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
var ped;
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
var startCamera = /* @__PURE__ */ __name(async (ped2) => {
  if (running)
    return;
  ped2 = ped2;
  running = true;
  camDistance = 1;
  cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);
  const [x, y, z] = GetPedBoneCoords(ped2, 31086, 0, 0, 0);
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
  ped = PlayerPedId();
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
function getHair(ped2) {
  ped2 = ped2 || PlayerPedId();
  return {
    color: GetPedHairColor(ped2),
    highlight: GetPedHairHighlightColor(ped2)
  };
}
__name(getHair, "getHair");
function getHeadBlendData(ped2) {
  ped2 = ped2 || PlayerPedId();
  const headblendData = exports.bl_appearance.GetHeadBlendData(ped2);
  return {
    shapeFirst: headblendData.FirstFaceShape,
    // father
    shapeSecond: headblendData.SecondFaceShape,
    // mother
    shapeThird: headblendData.ThirdFaceShape,
    skinFirst: headblendData.FirstSkinTone,
    skinSecond: headblendData.SecondSkinTone,
    skinThird: headblendData.ThirdSkinTone,
    shapeMix: headblendData.ParentFaceShapePercent,
    // resemblance
    thirdMix: headblendData.ParentThirdUnkPercent,
    skinMix: headblendData.ParentSkinTonePercent,
    // skinpercent
    hasParent: headblendData.IsParentInheritance
  };
}
__name(getHeadBlendData, "getHeadBlendData");
function getHeadOverlay(ped2) {
  ped2 = ped2 || PlayerPedId();
  let totals = {};
  let headData = {};
  for (let i = 0; i < head_default.length; i++) {
    const overlay = head_default[i];
    totals[overlay] = GetNumHeadOverlayValues(i);
    if (overlay === "EyeColor") {
      headData[overlay] = {
        id: overlay,
        index: i,
        overlayValue: GetPedEyeColor(ped2)
      };
    } else {
      const [_, overlayValue, colourType, firstColor, secondColor, overlayOpacity] = GetPedHeadOverlayData(ped2, i);
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
function getHeadStructure(ped2) {
  ped2 = ped2 || PlayerPedId();
  const pedModel = GetEntityModel(ped2);
  if (pedModel !== GetHashKey("mp_m_freemode_01") && pedModel !== GetHashKey("mp_f_freemode_01"))
    return;
  let faceStruct = {};
  for (let i = 0; i < face_default.length; i++) {
    const overlay = face_default[i];
    faceStruct[overlay] = {
      id: overlay,
      index: i,
      value: GetPedFaceFeature(ped2, i)
    };
  }
  return faceStruct;
}
__name(getHeadStructure, "getHeadStructure");
function getDrawables(ped2) {
  ped2 = ped2 || PlayerPedId();
  let drawables = {};
  let totalDrawables = {};
  for (let i = 0; i < drawables_default.length; i++) {
    const name = drawables_default[i];
    const current = GetPedDrawableVariation(ped2, i);
    totalDrawables[name] = {
      id: name,
      index: i,
      total: GetNumberOfPedDrawableVariations(ped2, i),
      textures: GetNumberOfPedTextureVariations(ped2, i, current)
    };
    drawables[name] = {
      id: name,
      index: i,
      value: GetPedDrawableVariation(ped2, i),
      texture: GetPedTextureVariation(ped2, i)
    };
  }
  return [drawables, totalDrawables];
}
__name(getDrawables, "getDrawables");
function getProps(ped2) {
  ped2 = ped2 || PlayerPedId();
  let props = {};
  let totalProps = {};
  for (let i = 0; i < props_default.length; i++) {
    const name = props_default[i];
    const current = GetPedPropIndex(ped2, i);
    totalProps[name] = {
      id: name,
      index: i,
      total: GetNumberOfPedPropDrawableVariations(ped2, i),
      textures: GetNumberOfPedPropTextureVariations(ped2, i, current)
    };
    props[name] = {
      id: name,
      index: i,
      value: GetPedPropIndex(ped2, i),
      texture: GetPedPropTextureIndex(ped2, i)
    };
  }
  return [props, totalProps];
}
__name(getProps, "getProps");
async function getAppearance(ped2) {
  ped2 = ped2 || PlayerPedId();
  const [headData, totals] = getHeadOverlay(ped2);
  const [drawables, drawTotal] = getDrawables(ped2);
  const [props, propTotal] = getProps(ped2);
  const model = GetEntityModel(ped2);
  return {
    modelIndex: findModelIndex(model),
    model,
    hairColor: getHair(ped2),
    headBlend: getHeadBlendData(ped2),
    headOverlay: headData,
    headOverlayTotal: totals,
    headStructure: getHeadStructure(ped2),
    drawables,
    props,
    drawTotal,
    propTotal,
    tattoos: []
  };
}
__name(getAppearance, "getAppearance");
exports("GetAppearance", getAppearance);
function getPedClothes(ped2) {
  ped2 = ped2 || PlayerPedId();
  const [drawables, drawTotal] = getDrawables(ped2);
  const [props, propTotal] = getProps(ped2);
  const [headData, totals] = getHeadOverlay(ped2);
  return {
    headOverlay: headData,
    drawables,
    props
  };
}
__name(getPedClothes, "getPedClothes");
exports("GetPedClothes", getPedClothes);
function getPedSkin(ped2) {
  ped2 = ped2 || PlayerPedId();
  return {
    headBlend: getHeadBlendData(ped2),
    headStructure: getHeadStructure(ped2),
    hairColor: getHair(ped2),
    model: GetEntityModel(ped2)
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
  const isFemale = GetEntityModel(PlayerPedId()) === GetHashKey("mp_f_freemode_01");
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
function setDrawable(ped2, data) {
  ped2 = ped2 || PlayerPedId();
  SetPedComponentVariation(ped2, data.index, data.value, data.texture, 0);
}
__name(setDrawable, "setDrawable");
function setProp(ped2, data) {
  ped2 = ped2 || PlayerPedId();
  if (data.value === -1) {
    ClearPedProp(ped2, data.index);
    return;
  }
  SetPedPropIndex(ped2, data.index, data.value, data.texture, false);
}
__name(setProp, "setProp");
var setModel = /* @__PURE__ */ __name(async (ped2, data) => {
  ped2 = ped2 || PlayerPedId();
  const isJustModel = typeof data === "number";
  const model = isJustModel ? data : data.model;
  const isPlayer = IsPedAPlayer(ped2);
  if (isPlayer) {
    const modelHash = await requestModel(model);
    SetPlayerModel(PlayerId(), modelHash);
    SetModelAsNoLongerNeeded(modelHash);
    ped2 = PlayerPedId();
  }
  SetPedDefaultComponentVariation(ped2);
  if (!isJustModel && data.headBlend && Object.keys(data.headBlend).length)
    setHeadBlend(ped2, data.headBlend);
  return ped2;
}, "setModel");
function SetFaceFeature(ped2, data) {
  ped2 = ped2 || PlayerPedId();
  SetPedFaceFeature(ped2, data.index, data.value + 0);
}
__name(SetFaceFeature, "SetFaceFeature");
var isPositive = /* @__PURE__ */ __name((val) => val >= 0 ? val : 0, "isPositive");
function setHeadBlend(ped2, data) {
  ped2 = ped2 || PlayerPedId();
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
    ped2,
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
function setHeadOverlay(ped2, data) {
  ped2 = ped2 || PlayerPedId();
  const index = data.index;
  if (index === 13) {
    SetPedEyeColor(ped2, data.value);
    return;
  }
  const value = data.overlayValue === -1 ? 255 : data.overlayValue;
  SetPedHeadOverlay(ped2, index, value, data.overlayOpacity + 0);
  SetPedHeadOverlayColor(ped2, index, 1, data.firstColor, data.secondColor);
}
__name(setHeadOverlay, "setHeadOverlay");
function resetToggles(data) {
  const ped2 = PlayerPedId();
  const drawables = data.drawables;
  const props = data.props;
  for (const [toggleItem, toggleData] of Object.entries(toggles_default)) {
    const toggleType = toggleData.type;
    const index = toggleData.index;
    if (toggleType === "drawable" && drawables[toggleItem]) {
      const currentDrawable = GetPedDrawableVariation(ped2, index);
      if (currentDrawable !== drawables[toggleItem].value) {
        SetPedComponentVariation(ped2, index, drawables[toggleItem].value, 0, 0);
      }
    } else if (toggleType === "prop" && props[toggleItem]) {
      const currentProp = GetPedPropIndex(ped2, index);
      if (currentProp !== props[toggleItem].value) {
        SetPedPropIndex(ped2, index, props[toggleItem].value, 0, false);
      }
    }
  }
}
__name(resetToggles, "resetToggles");
function setPedClothes(ped2, data) {
  ped2 = ped2 || PlayerPedId();
  const drawables = data.drawables;
  const props = data.props;
  const headOverlay = data.headOverlay;
  console.log("drawables", drawables);
  for (const id in drawables) {
    const drawable = drawables[id];
    setDrawable(ped2, drawable);
  }
  for (const id in props) {
    const prop = props[id];
    setProp(ped2, prop);
  }
  for (const id in headOverlay) {
    const overlay = headOverlay[id];
    setHeadOverlay(ped2, overlay);
  }
}
__name(setPedClothes, "setPedClothes");
var setPedSkin = /* @__PURE__ */ __name(async (ped2, data) => {
  ped2 = ped2 || PlayerPedId();
  const headStructure = data.headStructure;
  const headBlend = data.headBlend;
  ped2 = await setModel(ped2, data);
  if (headBlend) {
    setHeadBlend(ped2, headBlend);
  }
  if (headStructure) {
    for (const feature of headStructure) {
      SetFaceFeature(ped2, feature);
    }
  }
}, "setPedSkin");
function setPedTattoos(ped2, data) {
  if (!data)
    return;
  ped2 = ped2 || PlayerPedId();
  const isPlayer = IsPedAPlayer(ped2);
  if (isPlayer) {
    ped2 = PlayerPedId();
  }
  ClearPedDecorationsLeaveScars(ped2);
  for (let i = 0; i < data.length; i++) {
    const tattooData = data[i].tattoo;
    if (tattooData) {
      const collection = GetHashKey(tattooData.dlc);
      const tattoo = tattooData.hash;
      AddPedDecorationFromHashes(ped2, collection, tattoo);
    }
  }
}
__name(setPedTattoos, "setPedTattoos");
function setPedHairColors(ped2, data) {
  ped2 = ped2 || PlayerPedId();
  const color = data.color;
  const highlight = data.highlight;
  SetPedHairColor(ped2, color, highlight);
}
__name(setPedHairColors, "setPedHairColors");
function setPedAppearance(ped2, data) {
  setPedSkin(ped2, data);
  setPedClothes(ped2, data);
  setPedHairColors(ped2, data.hairColor);
  setPedTattoos(ped2, data.tattoos);
}
__name(setPedAppearance, "setPedAppearance");
function setPlayerPedAppearance(data) {
  setPedSkin(PlayerPedId(), data);
  setPedClothes(PlayerPedId(), data);
  setPedHairColors(PlayerPedId(), data.hairColor);
  setPedTattoos(PlayerPedId(), data.tattoos);
}
__name(setPlayerPedAppearance, "setPlayerPedAppearance");

// src/client/handlers.ts
RegisterNuiCallback("appearance:cancel" /* cancel */, (appearance, cb) => {
  setPlayerPedAppearance(appearance);
  closeMenu();
  cb(1);
});
RegisterNuiCallback(
  "appearance:save" /* save */,
  async (appearance, cb) => {
    console.log("save");
    resetToggles(appearance);
    await delay(100);
    const ped2 = PlayerPedId();
    const newAppearance = await getAppearance(ped2);
    const frameworkdId = getFrameworkID();
    triggerServerCallback(
      "bl_appearance:server:setAppearance",
      frameworkdId,
      newAppearance
    );
    setPedTattoos(ped2, appearance.tattoos);
    closeMenu();
    cb(1);
  }
);
RegisterNuiCallback("appearance:setModel" /* setModel */, async (model, cb) => {
  const hash = GetHashKey(model);
  if (!IsModelInCdimage(hash) || !IsModelValid(hash)) {
    return cb(0);
  }
  const ped2 = PlayerPedId();
  await setModel(ped2, hash);
  const appearance = await getAppearance(ped2);
  appearance.tattoos = [];
  cb(appearance);
});
RegisterNuiCallback("appearance:getModelTattoos" /* getModelTattoos */, async (_, cb) => {
  const tattoos = getTattooData();
  cb(tattoos);
});
RegisterNuiCallback(
  "appearance:setHeadStructure" /* setHeadStructure */,
  async (data, cb) => {
    const ped2 = PlayerPedId();
    SetFaceFeature(ped2, data);
    cb(1);
  }
);
RegisterNuiCallback(
  "appearance:setHeadOverlay" /* setHeadOverlay */,
  async (data, cb) => {
    const ped2 = PlayerPedId();
    SetFaceFeature(ped2, data);
    cb(1);
  }
);
RegisterNuiCallback(
  "appearance:setHeadBlend" /* setHeadBlend */,
  async (data, cb) => {
    const ped2 = PlayerPedId();
    setHeadBlend(ped2, data);
    cb(1);
  }
);
RegisterNuiCallback("appearance:setTattoos" /* setTattoos */, async (data, cb) => {
  const ped2 = PlayerPedId();
  setPedTattoos(ped2, data);
  cb(1);
});
RegisterNuiCallback("appearance:setProp" /* setProp */, async (data, cb) => {
  const ped2 = PlayerPedId();
  setProp(ped2, data);
  cb(1);
});
RegisterNuiCallback("appearance:setDrawable" /* setDrawable */, async (data, cb) => {
  const ped2 = PlayerPedId();
  setDrawable(ped2, data);
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
    const ped2 = PlayerPedId();
    if (type === "prop") {
      const currentProp = GetPedPropIndex(ped2, index);
      if (currentProp === -1) {
        setProp(ped2, current);
        cb(false);
        return;
      } else {
        ClearPedProp(ped2, index);
        cb(true);
        return;
      }
    } else if (type === "drawable") {
      const currentDrawable = GetPedDrawableVariation(ped2, index);
      if (current.value === item.off) {
        cb(false);
        return;
      }
      if (current.value === currentDrawable) {
        SetPedComponentVariation(ped2, index, item.off, 0, 0);
        cb(true);
        return;
      } else {
        setDrawable(ped2, current);
        cb(false);
        return;
      }
    }
  }
);
RegisterNuiCallback("appearance:saveOutfit" /* saveOutfit */, async (data, cb) => {
  const frameworkdId = getFrameworkID();
  const result = await triggerServerCallback(
    "bl_appearance:server:saveOutfit",
    frameworkdId,
    data
  );
  cb(result);
});
RegisterNuiCallback("appearance:deleteOutfit" /* deleteOutfit */, async (id, cb) => {
  const frameworkdId = getFrameworkID();
  const result = await triggerServerCallback(
    "bl_appearance:server:deleteOutfit",
    frameworkdId,
    id
  );
  cb(result);
});
RegisterNuiCallback("appearance:renameOutfit" /* renameOutfit */, async (data, cb) => {
  const frameworkdId = getFrameworkID();
  const result = await triggerServerCallback(
    "bl_appearance:server:renameOutfit",
    frameworkdId,
    data
  );
  cb(result);
});
RegisterNuiCallback("appearance:useOutfit" /* useOutfit */, async (outfit, cb) => {
  console.log("useOutfit", outfit);
  setPedClothes(PlayerPedId(), outfit);
  cb(1);
});

// src/client/menu.ts
var config = exports.bl_appearance;
var armour = 0;
async function openMenu(type, creation = false) {
  const ped2 = PlayerPedId();
  const configMenus = config.menus();
  const menu = configMenus[type];
  console.log(configMenus, menu);
  if (!menu)
    return;
  startCamera(ped2);
  const frameworkdId = getFrameworkID();
  const tabs = menu.tabs;
  let allowExit = menu.allowExit;
  armour = GetPedArmour(ped2);
  console.log("armour", armour);
  let outfits = [];
  const hasOutfitTab = tabs.includes("outfits");
  if (hasOutfitTab) {
    outfits = await triggerServerCallback("bl_appearance:server:getOutfits", frameworkdId);
  }
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
  const appearance = await getAppearance(ped2);
  console.log("appearance");
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
  console.log("openMenu", type);
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
  const ped2 = PlayerPedId();
  SetPedArmour(ped2, armour);
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
exports("SetPedAppearance", (ped2, appearance) => {
  setPedAppearance(ped2, appearance);
});
exports("SetPlayerPedAppearance", async (frameworkID) => {
  let appearance;
  if (config2.backwardsCompatibility) {
    const oldAppearance = await triggerServerCallback("bl_appearance:server:PreviousGetAppearance", frameworkID);
    if (config2.previousClothing == "illenium") {
      exports["illenium-appearance"].setPedAppearance(PlayerPedId(), oldAppearance);
    } else if (config2.previousClothing == "qb") {
      emit("qb-clothing:client:loadPlayerClothing", oldAppearance, PlayerPedId());
    }
    await delay(100);
    appearance = getAppearance(PlayerPedId());
  }
  appearance = await triggerServerCallback("bl_appearance:server:getAppearance", frameworkID);
  setPlayerPedAppearance(appearance);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgZGVidWdkYXRhID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZGF0YSwgKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXG4vZywgXCJcXFxcblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfSwgMikpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZW5kTlVJRXZlbnQgPSAoYWN0aW9uOiBzdHJpbmcsIGRhdGE6IGFueSkgPT4ge1xyXG4gICAgU2VuZE5VSU1lc3NhZ2Uoe1xyXG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgIGRhdGE6IGRhdGFcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RNb2RlbCA9IGFzeW5jIChtb2RlbDogc3RyaW5nIHwgbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+ID0+IHtcclxuICAgIGxldCBtb2RlbEhhc2g6IG51bWJlciA9IHR5cGVvZiBtb2RlbCA9PT0gJ251bWJlcicgPyBtb2RlbCA6IEdldEhhc2hLZXkobW9kZWwpXHJcblxyXG4gICAgaWYgKCFJc01vZGVsVmFsaWQobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9fb3hfY2JfJHtyZXNvdXJjZU5hbWV9YCwgKGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnkpID0+IHtcclxuICAgIGNvbnN0IHJlc29sdmUgPSBhY3RpdmVFdmVudHNba2V5XTtcclxuICAgIHJldHVybiByZXNvbHZlICYmIHJlc29sdmUoLi4uYXJncyk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUID0gdW5rbm93bj4oXHJcbiAgICBldmVudE5hbWU6IHN0cmluZywgLi4uYXJnczogYW55XHJcbik6IFByb21pc2U8VD4gfCB2b2lkIHtcclxuICAgIGlmICghZXZlbnRUaW1lcihldmVudE5hbWUsIDApKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBrZXk6IHN0cmluZztcclxuXHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuXHJcbiAgICBlbWl0TmV0KGBfX294X2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vbG9jYWxlXHJcblxyXG5leHBvcnQgY29uc3QgcmVxdWVzdExvY2FsZSA9IChyZXNvdXJjZVNldE5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2hlY2tSZXNvdXJjZUZpbGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChSZXF1ZXN0UmVzb3VyY2VGaWxlU2V0KHJlc291cmNlU2V0TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRMYW4gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UuY29uZmlnKCkubG9jYWxlXHJcbiAgICAgICAgICAgICAgICBsZXQgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS8ke2N1cnJlbnRMYW59Lmpzb25gKTtcclxuICAgICAgICAgICAgICAgIGlmICghbG9jYWxlRmlsZUNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke2N1cnJlbnRMYW59Lmpzb24gbm90IGZvdW5kIGluIGxvY2FsZSwgcGxlYXNlIHZlcmlmeSEsIHdlIHVzZWQgZW5nbGlzaCBmb3Igbm93IWApXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS9lbi5qc29uYClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUobG9jYWxlRmlsZUNvbnRlbnQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChjaGVja1Jlc291cmNlRmlsZSwgMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjaGVja1Jlc291cmNlRmlsZSgpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBsb2NhbGUgPSBhc3luYyAoaWQ6IHN0cmluZywgLi4uYXJnczogc3RyaW5nW10pID0+IHtcclxuICAgIGNvbnN0IGxvY2FsZSA9IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpO1xyXG4gICAgbGV0IGFyZ0luZGV4ID0gMDtcclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSBsb2NhbGVbaWRdLnJlcGxhY2UoLyVzL2csIChtYXRjaDogc3RyaW5nKSA9PiBhcmdJbmRleCA8IGFyZ3MubGVuZ3RoID8gYXJnc1thcmdJbmRleF0gOiBtYXRjaCk7XHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRGcmFtZXdvcmtJRCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGJsX2JyaWRnZSA9IGV4cG9ydHMuYmxfYnJpZGdlXHJcbiAgICBjb25zdCBpZCA9IGJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpLmNpZFxyXG4gICAgY29uc29sZS5sb2coJ2ZyYW1ld29ya2RJZCcsIGlkKVxyXG4gICAgcmV0dXJuIGlkXHJcbn0iLCAiaW1wb3J0IHsgQ2FtZXJhLCBWZWN0b3IzLCBDYW1lcmFCb25lcyB9IGZyb20gJ0B0eXBpbmdzL2NhbWVyYSc7XHJcbmltcG9ydCB7IGRlbGF5IH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgUmVjZWl2ZSB9IGZyb20gJ0BldmVudHMnO1xyXG5cclxubGV0IHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGNhbURpc3RhbmNlOiBudW1iZXIgPSAxLjg7XHJcbmxldCBjYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgYW5nbGVZOiBudW1iZXIgPSAwLjA7XHJcbmxldCBhbmdsZVo6IG51bWJlciA9IDAuMDtcclxubGV0IHRhcmdldENvb3JkczogVmVjdG9yMyB8IG51bGwgPSBudWxsO1xyXG5sZXQgb2xkQ2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGNoYW5naW5nQ2FtOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBsYXN0WDogbnVtYmVyID0gMDtcclxubGV0IGN1cnJlbnRCb25lOiBrZXlvZiBDYW1lcmFCb25lcyA9ICdoZWFkJztcclxubGV0IHBlZDogbnVtYmVyXHJcblxyXG5jb25zdCBDYW1lcmFCb25lczogQ2FtZXJhQm9uZXMgPSB7XHJcblx0aGVhZDogMzEwODYsXHJcblx0dG9yc286IDI0ODE4LFxyXG5cdGxlZ3M6IDE0MjAxLFxyXG59O1xyXG5cclxuY29uc3QgY29zID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguY29zKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3Qgc2luID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguc2luKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0QW5nbGVzID0gKCk6IG51bWJlcltdID0+IHtcclxuXHRjb25zdCB4ID1cclxuXHRcdCgoY29zKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSArIGNvcyhhbmdsZVkpICogY29zKGFuZ2xlWikpIC8gMikgKlxyXG5cdFx0Y2FtRGlzdGFuY2U7XHJcblx0Y29uc3QgeSA9XHJcblx0XHQoKHNpbihhbmdsZVopICogY29zKGFuZ2xlWSkgKyBjb3MoYW5nbGVZKSAqIHNpbihhbmdsZVopKSAvIDIpICpcclxuXHRcdGNhbURpc3RhbmNlO1xyXG5cdGNvbnN0IHogPSBzaW4oYW5nbGVZKSAqIGNhbURpc3RhbmNlO1xyXG5cclxuXHRyZXR1cm4gW3gsIHksIHpdO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtUG9zaXRpb24gPSAobW91c2VYPzogbnVtYmVyLCBtb3VzZVk/OiBudW1iZXIpOiB2b2lkID0+IHtcclxuXHRpZiAoIXJ1bm5pbmcgfHwgIXRhcmdldENvb3JkcyB8fCBjaGFuZ2luZ0NhbSkgcmV0dXJuO1xyXG5cclxuXHRtb3VzZVggPSBtb3VzZVggPz8gMC4wO1xyXG5cdG1vdXNlWSA9IG1vdXNlWSA/PyAwLjA7XHJcblxyXG5cdGFuZ2xlWiAtPSBtb3VzZVg7XHJcblx0YW5nbGVZICs9IG1vdXNlWTtcclxuXHRhbmdsZVkgPSBNYXRoLm1pbihNYXRoLm1heChhbmdsZVksIDAuMCksIDg5LjApO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKTtcclxuXHJcblx0U2V0Q2FtQ29vcmQoXHJcblx0XHRjYW0sXHJcblx0XHR0YXJnZXRDb29yZHMueCArIHgsXHJcblx0XHR0YXJnZXRDb29yZHMueSArIHksXHJcblx0XHR0YXJnZXRDb29yZHMueiArIHpcclxuXHQpO1xyXG5cdFBvaW50Q2FtQXRDb29yZChjYW0sIHRhcmdldENvb3Jkcy54LCB0YXJnZXRDb29yZHMueSwgdGFyZ2V0Q29vcmRzLnopO1xyXG59O1xyXG5cclxuY29uc3QgbW92ZUNhbWVyYSA9IGFzeW5jIChjb29yZHM6IFZlY3RvcjMsIGRpc3RhbmNlPzogbnVtYmVyKSA9PiB7XHJcblx0Y29uc3QgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpICsgOTQ7XHJcblx0ZGlzdGFuY2UgPSBkaXN0YW5jZSA/PyAxLjA7XHJcblxyXG5cdGNoYW5naW5nQ2FtID0gdHJ1ZTtcclxuXHRjYW1EaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG5cdGFuZ2xlWiA9IGhlYWRpbmc7XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpO1xyXG5cclxuXHRjb25zdCBuZXdjYW06IENhbWVyYSA9IENyZWF0ZUNhbVdpdGhQYXJhbXMoXHJcblx0XHQnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLFxyXG5cdFx0Y29vcmRzLnggKyB4LFxyXG5cdFx0Y29vcmRzLnkgKyB5LFxyXG5cdFx0Y29vcmRzLnogKyB6LFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0NzAuMCxcclxuXHRcdGZhbHNlLFxyXG5cdFx0MFxyXG5cdCk7XHJcblxyXG5cdHRhcmdldENvb3JkcyA9IGNvb3JkcztcclxuXHRjaGFuZ2luZ0NhbSA9IGZhbHNlO1xyXG5cdG9sZENhbSA9IGNhbTtcclxuXHRjYW0gPSBuZXdjYW07XHJcblxyXG5cdFBvaW50Q2FtQXRDb29yZChuZXdjYW0sIGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnopO1xyXG5cdFNldENhbUFjdGl2ZVdpdGhJbnRlcnAobmV3Y2FtLCBvbGRDYW0sIDI1MCwgMCwgMCk7XHJcblxyXG5cdGF3YWl0IGRlbGF5KDI1MCk7XHJcblxyXG5cdFNldENhbVVzZVNoYWxsb3dEb2ZNb2RlKG5ld2NhbSwgdHJ1ZSk7XHJcblx0U2V0Q2FtTmVhckRvZihuZXdjYW0sIDAuNCk7XHJcblx0U2V0Q2FtRmFyRG9mKG5ld2NhbSwgMS4yKTtcclxuXHRTZXRDYW1Eb2ZTdHJlbmd0aChuZXdjYW0sIDAuMyk7XHJcblx0dXNlSGlEb2YobmV3Y2FtKTtcclxuXHJcblx0RGVzdHJveUNhbShvbGRDYW0sIHRydWUpO1xyXG59O1xyXG5cclxuY29uc3QgdXNlSGlEb2YgPSAoY3VycmVudGNhbTogQ2FtZXJhKSA9PiB7XHJcblx0aWYgKCEoRG9lc0NhbUV4aXN0KGNhbSkgJiYgY3VycmVudGNhbSA9PSBjYW0pKSByZXR1cm47XHJcblx0U2V0VXNlSGlEb2YoKTtcclxuXHRzZXRUaW1lb3V0KHVzZUhpRG9mLCAwKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdGFydENhbWVyYSA9IGFzeW5jIChwZWQ6IG51bWJlcikgPT4ge1xyXG5cdGlmIChydW5uaW5nKSByZXR1cm47XHJcblx0cGVkID0gcGVkO1xyXG5cdHJ1bm5pbmcgPSB0cnVlO1xyXG5cdGNhbURpc3RhbmNlID0gMS4wO1xyXG5cdGNhbSA9IENyZWF0ZUNhbSgnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLCB0cnVlKTtcclxuXHRjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIDMxMDg2LCAwLjAsIDAuMCwgMC4wKTtcclxuXHRTZXRDYW1Db29yZChjYW0sIHgsIHksIHopO1xyXG5cdFJlbmRlclNjcmlwdENhbXModHJ1ZSwgdHJ1ZSwgMTAwMCwgdHJ1ZSwgdHJ1ZSk7XHJcblx0bW92ZUNhbWVyYSh7IHg6IHgsIHk6IHksIHo6IHogfSwgY2FtRGlzdGFuY2UpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0b3BDYW1lcmEgPSAoKTogdm9pZCA9PiB7XHJcblx0aWYgKCFydW5uaW5nKSByZXR1cm47XHJcblx0cnVubmluZyA9IGZhbHNlO1xyXG5cclxuXHRSZW5kZXJTY3JpcHRDYW1zKGZhbHNlLCB0cnVlLCAyNTAsIHRydWUsIGZhbHNlKTtcclxuXHREZXN0cm95Q2FtKGNhbSwgdHJ1ZSk7XHJcblx0Y2FtID0gbnVsbDtcclxuXHR0YXJnZXRDb29yZHMgPSBudWxsO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtZXJhID0gKHR5cGU/OiBrZXlvZiBDYW1lcmFCb25lcyk6IHZvaWQgPT4ge1xyXG5cdGNvbnN0IGJvbmU6IG51bWJlciB8IHVuZGVmaW5lZCA9IENhbWVyYUJvbmVzW3R5cGVdO1xyXG5cdGlmIChjdXJyZW50Qm9uZSA9PSB0eXBlKSByZXR1cm47XHJcblxyXG5cdHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0Y29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IGJvbmVcclxuXHRcdD8gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmUsIDAuMCwgMC4wLCBib25lID09PSAxNDIwMSA/IDAuMiA6IDAuMClcclxuXHRcdDogR2V0RW50aXR5Q29vcmRzKHBlZCwgZmFsc2UpO1xyXG5cclxuXHRtb3ZlQ2FtZXJhKFxyXG5cdFx0e1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5LFxyXG5cdFx0XHR6OiB6ICsgMC4wLFxyXG5cdFx0fSxcclxuXHRcdDEuMFxyXG5cdCk7XHJcblxyXG5cdGN1cnJlbnRCb25lID0gdHlwZTtcclxufTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1Nb3ZlLCAoZGF0YSwgY2IpID0+IHtcclxuXHRjYigxKTtcclxuXHRsZXQgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpO1xyXG5cdGlmIChsYXN0WCA9PSBkYXRhLngpIHtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0aGVhZGluZyA9IGRhdGEueCA+IGxhc3RYID8gaGVhZGluZyArIDUgOiBoZWFkaW5nIC0gNTtcclxuXHRTZXRFbnRpdHlIZWFkaW5nKHBlZCwgaGVhZGluZyk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVNjcm9sbCwgKHR5cGU6IG51bWJlciwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c3dpdGNoICh0eXBlKSB7XHJcblx0XHRjYXNlIDI6XHJcblx0XHRcdHNldENhbWVyYSgpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdGNhc2UgMTpcclxuXHRcdFx0c2V0Q2FtZXJhKCdsZWdzJyk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAzOlxyXG5cdFx0XHRzZXRDYW1lcmEoJ2hlYWQnKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0fVxyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1ab29tLCAoZGF0YSwgY2IpID0+IHtcclxuXHRpZiAoZGF0YSA9PT0gJ2Rvd24nKSB7XHJcblx0XHRjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgKyAwLjA1O1xyXG5cdFx0Y2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA+PSAxLjAgPyAxLjAgOiBuZXdEaXN0YW5jZTtcclxuXHR9IGVsc2UgaWYgKGRhdGEgPT09ICd1cCcpIHtcclxuXHRcdGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSAtIDAuMDU7XHJcblx0XHRjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlIDw9IDAuMzUgPyAwLjM1IDogbmV3RGlzdGFuY2U7XHJcblx0fVxyXG5cclxuXHRjYW1EaXN0YW5jZSA9IGNhbURpc3RhbmNlO1xyXG5cdHNldENhbVBvc2l0aW9uKCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xyXG4gICAgXCJCbGVtaXNoZXNcIixcclxuICAgIFwiRmFjaWFsSGFpclwiLFxyXG4gICAgXCJFeWVicm93c1wiLFxyXG4gICAgXCJBZ2VpbmdcIixcclxuICAgIFwiTWFrZXVwXCIsXHJcbiAgICBcIkJsdXNoXCIsXHJcbiAgICBcIkNvbXBsZXhpb25cIixcclxuICAgIFwiU3VuRGFtYWdlXCIsXHJcbiAgICBcIkxpcHN0aWNrXCIsXHJcbiAgICBcIk1vbGVzRnJlY2tsZXNcIixcclxuICAgIFwiQ2hlc3RIYWlyXCIsXHJcbiAgICBcIkJvZHlCbGVtaXNoZXNcIixcclxuICAgIFwiQWRkQm9keUJsZW1pc2hlc1wiLFxyXG4gICAgXCJFeWVDb2xvclwiXHJcbl1cclxuIiwgImV4cG9ydCBkZWZhdWx0IFtcclxuICAgIFwiTm9zZV9XaWR0aFwiLFxyXG4gICAgXCJOb3NlX1BlYWtfSGVpZ2h0XCIsXHJcbiAgICBcIk5vc2VfUGVha19MZW5naHRcIixcclxuICAgIFwiTm9zZV9Cb25lX0hlaWdodFwiLFxyXG4gICAgXCJOb3NlX1BlYWtfTG93ZXJpbmdcIixcclxuICAgIFwiTm9zZV9Cb25lX1R3aXN0XCIsXHJcbiAgICBcIkV5ZUJyb3duX0hlaWdodFwiLFxyXG4gICAgXCJFeWVCcm93bl9Gb3J3YXJkXCIsXHJcbiAgICBcIkNoZWVrc19Cb25lX0hpZ2hcIixcclxuICAgIFwiQ2hlZWtzX0JvbmVfV2lkdGhcIixcclxuICAgIFwiQ2hlZWtzX1dpZHRoXCIsXHJcbiAgICBcIkV5ZXNfT3Blbm5pbmdcIixcclxuICAgIFwiTGlwc19UaGlja25lc3NcIixcclxuICAgIFwiSmF3X0JvbmVfV2lkdGhcIixcclxuICAgIFwiSmF3X0JvbmVfQmFja19MZW5naHRcIixcclxuICAgIFwiQ2hpbl9Cb25lX0xvd2VyaW5nXCIsXHJcbiAgICBcIkNoaW5fQm9uZV9MZW5ndGhcIixcclxuICAgIFwiQ2hpbl9Cb25lX1dpZHRoXCIsXHJcbiAgICBcIkNoaW5fSG9sZVwiLFxyXG4gICAgXCJOZWNrX1RoaWtuZXNzXCJcclxuXVxyXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xyXG4gICAgXCJmYWNlXCIsXHJcbiAgICBcIm1hc2tzXCIsXHJcbiAgICBcImhhaXJcIixcclxuICAgIFwidG9yc29zXCIsXHJcbiAgICBcImxlZ3NcIixcclxuICAgIFwiYmFnc1wiLFxyXG4gICAgXCJzaG9lc1wiLFxyXG4gICAgXCJuZWNrXCIsXHJcbiAgICBcInNoaXJ0c1wiLFxyXG4gICAgXCJ2ZXN0XCIsXHJcbiAgICBcImRlY2Fsc1wiLFxyXG4gICAgXCJqYWNrZXRzXCJcclxuXVxyXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xyXG4gICAgXCJoYXRzXCIsXHJcbiAgICBcImdsYXNzZXNcIixcclxuICAgIFwiZWFycmluZ3NcIixcclxuICAgIFwibW91dGhcIixcclxuICAgIFwibGhhbmRcIixcclxuICAgIFwicmhhbmRcIixcclxuICAgIFwid2F0Y2hlc1wiLFxyXG4gICAgXCJicmFjZWxldHNcIlxyXG5dXHJcbiIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSwgVEhhaXJEYXRhLCBUSGVhZE92ZXJsYXksIFRIZWFkT3ZlcmxheVRvdGFsIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgSEVBRF9PVkVSTEFZUyBmcm9tIFwiQGRhdGEvaGVhZFwiXHJcbmltcG9ydCBGQUNFX0ZFQVRVUkVTIGZyb20gXCJAZGF0YS9mYWNlXCJcclxuaW1wb3J0IERSQVdBQkxFX05BTUVTIGZyb20gXCJAZGF0YS9kcmF3YWJsZXNcIlxyXG5pbXBvcnQgUFJPUF9OQU1FUyBmcm9tIFwiQGRhdGEvcHJvcHNcIlxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRNb2RlbEluZGV4ICh0YXJnZXQ6IG51bWJlcikge1xyXG4gICAgY29uc3QgY29uZmlnID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlXHJcbiAgICBjb25zdCBtb2RlbHMgPSBjb25maWcubW9kZWxzKClcclxuICAgIFxyXG4gICAgcmV0dXJuIG1vZGVscy5maW5kSW5kZXgoKG1vZGVsKSA9PiBHZXRIYXNoS2V5KG1vZGVsKSAgPT09IHRhcmdldClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhhaXIgKHBlZDogbnVtYmVyKTogVEhhaXJEYXRhIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNvbG9yOiBHZXRQZWRIYWlyQ29sb3IocGVkKSxcclxuICAgICAgICBoaWdobGlnaHQ6IEdldFBlZEhhaXJIaWdobGlnaHRDb2xvcihwZWQpXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkQmxlbmREYXRhKHBlZDogbnVtYmVyKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGNvbnN0IGhlYWRibGVuZERhdGEgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UuR2V0SGVhZEJsZW5kRGF0YShwZWQpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzaGFwZUZpcnN0OiBoZWFkYmxlbmREYXRhLkZpcnN0RmFjZVNoYXBlLCAgIC8vIGZhdGhlclxyXG4gICAgICAgIHNoYXBlU2Vjb25kOiBoZWFkYmxlbmREYXRhLlNlY29uZEZhY2VTaGFwZSwgLy8gbW90aGVyXHJcbiAgICAgICAgc2hhcGVUaGlyZDogaGVhZGJsZW5kRGF0YS5UaGlyZEZhY2VTaGFwZSxcclxuXHJcbiAgICAgICAgc2tpbkZpcnN0OiBoZWFkYmxlbmREYXRhLkZpcnN0U2tpblRvbmUsXHJcbiAgICAgICAgc2tpblNlY29uZDogaGVhZGJsZW5kRGF0YS5TZWNvbmRTa2luVG9uZSxcclxuICAgICAgICBza2luVGhpcmQ6IGhlYWRibGVuZERhdGEuVGhpcmRTa2luVG9uZSxcclxuXHJcbiAgICAgICAgc2hhcGVNaXg6IGhlYWRibGVuZERhdGEuUGFyZW50RmFjZVNoYXBlUGVyY2VudCwgLy8gcmVzZW1ibGFuY2VcclxuXHJcbiAgICAgICAgdGhpcmRNaXg6IGhlYWRibGVuZERhdGEuUGFyZW50VGhpcmRVbmtQZXJjZW50LFxyXG4gICAgICAgIHNraW5NaXg6IGhlYWRibGVuZERhdGEuUGFyZW50U2tpblRvbmVQZXJjZW50LCAgIC8vIHNraW5wZXJjZW50XHJcblxyXG4gICAgICAgIGhhc1BhcmVudDogaGVhZGJsZW5kRGF0YS5Jc1BhcmVudEluaGVyaXRhbmNlLFxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRPdmVybGF5KHBlZDogbnVtYmVyKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGxldCB0b3RhbHM6IFRIZWFkT3ZlcmxheVRvdGFsID0ge307XHJcbiAgICBsZXQgaGVhZERhdGE6IFRIZWFkT3ZlcmxheSA9IHt9O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgSEVBRF9PVkVSTEFZUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBIRUFEX09WRVJMQVlTW2ldO1xyXG4gICAgICAgIHRvdGFsc1tvdmVybGF5XSA9IEdldE51bUhlYWRPdmVybGF5VmFsdWVzKGkpO1xyXG5cclxuICAgICAgICBpZiAob3ZlcmxheSA9PT0gXCJFeWVDb2xvclwiKSB7XHJcbiAgICAgICAgICAgIGhlYWREYXRhW292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogR2V0UGVkRXllQ29sb3IocGVkKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFtfLCBvdmVybGF5VmFsdWUsIGNvbG91clR5cGUsIGZpcnN0Q29sb3IsIHNlY29uZENvbG9yLCBvdmVybGF5T3BhY2l0eV0gPSBHZXRQZWRIZWFkT3ZlcmxheURhdGEocGVkLCBpKTtcclxuICAgICAgICAgICAgaGVhZERhdGFbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBpIC0gMSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogb3ZlcmxheVZhbHVlID09PSAyNTUgPyAtMSA6IG92ZXJsYXlWYWx1ZSxcclxuICAgICAgICAgICAgICAgIGNvbG91clR5cGU6IGNvbG91clR5cGUsXHJcbiAgICAgICAgICAgICAgICBmaXJzdENvbG9yOiBmaXJzdENvbG9yLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kQ29sb3I6IHNlY29uZENvbG9yLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheU9wYWNpdHk6IG92ZXJsYXlPcGFjaXR5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbaGVhZERhdGEsIHRvdGFsc107XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkU3RydWN0dXJlKHBlZDogbnVtYmVyKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGNvbnN0IHBlZE1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkKVxyXG5cclxuICAgIGlmIChwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX21fZnJlZW1vZGVfMDFcIikgJiYgcGVkTW9kZWwgIT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpKSByZXR1cm5cclxuXHJcbiAgICBsZXQgZmFjZVN0cnVjdCA9IHt9XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEZBQ0VfRkVBVFVSRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gRkFDRV9GRUFUVVJFU1tpXVxyXG4gICAgICAgIGZhY2VTdHJ1Y3Rbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZEZhY2VGZWF0dXJlKHBlZCwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhY2VTdHJ1Y3RcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldERyYXdhYmxlcyhwZWQ6IG51bWJlcikge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBsZXQgZHJhd2FibGVzID0ge31cclxuICAgIGxldCB0b3RhbERyYXdhYmxlcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBEUkFXQUJMRV9OQU1FUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBEUkFXQUJMRV9OQU1FU1tpXVxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGkpXHJcblxyXG4gICAgICAgIHRvdGFsRHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHRvdGFsOiBHZXROdW1iZXJPZlBlZERyYXdhYmxlVmFyaWF0aW9ucyhwZWQsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogR2V0TnVtYmVyT2ZQZWRUZXh0dXJlVmFyaWF0aW9ucyhwZWQsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRyYXdhYmxlc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZTogR2V0UGVkVGV4dHVyZVZhcmlhdGlvbihwZWQsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbZHJhd2FibGVzLCB0b3RhbERyYXdhYmxlc11cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3BzKHBlZDogbnVtYmVyKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGxldCBwcm9wcyA9IHt9XHJcbiAgICBsZXQgdG90YWxQcm9wcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBQUk9QX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IFBST1BfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaSlcclxuXHJcbiAgICAgICAgdG90YWxQcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWRQcm9wRHJhd2FibGVWYXJpYXRpb25zKHBlZCwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWQsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkUHJvcEluZGV4KHBlZCwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFByb3BUZXh0dXJlSW5kZXgocGVkLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3Byb3BzLCB0b3RhbFByb3BzXVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwcGVhcmFuY2UocGVkOiBudW1iZXIpOiBQcm9taXNlPFRBcHBlYXJhbmNlPiB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG4gICAgY29uc3QgW2hlYWREYXRhLCB0b3RhbHNdID0gZ2V0SGVhZE92ZXJsYXkocGVkKVxyXG4gICAgY29uc3QgW2RyYXdhYmxlcywgZHJhd1RvdGFsXSA9IGdldERyYXdhYmxlcyhwZWQpXHJcbiAgICBjb25zdCBbcHJvcHMsIHByb3BUb3RhbF0gPSBnZXRQcm9wcyhwZWQpXHJcbiAgICBjb25zdCBtb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZClcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1vZGVsSW5kZXg6IGZpbmRNb2RlbEluZGV4KG1vZGVsKSxcclxuICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZCksXHJcbiAgICAgICAgaGVhZEJsZW5kOiBnZXRIZWFkQmxlbmREYXRhKHBlZCksXHJcbiAgICAgICAgaGVhZE92ZXJsYXk6IGhlYWREYXRhIGFzIFRIZWFkT3ZlcmxheSxcclxuICAgICAgICBoZWFkT3ZlcmxheVRvdGFsOiB0b3RhbHMgYXMgVEhlYWRPdmVybGF5VG90YWwsXHJcbiAgICAgICAgaGVhZFN0cnVjdHVyZTogZ2V0SGVhZFN0cnVjdHVyZShwZWQpLFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgICAgICBkcmF3VG90YWw6IGRyYXdUb3RhbCxcclxuICAgICAgICBwcm9wVG90YWw6IHByb3BUb3RhbCxcclxuICAgICAgICB0YXR0b29zOiBbXVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRBcHBlYXJhbmNlXCIsIGdldEFwcGVhcmFuY2UpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVkQ2xvdGhlcyhwZWQ6IG51bWJlcikge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBjb25zdCBbZHJhd2FibGVzLCBkcmF3VG90YWxdID0gZ2V0RHJhd2FibGVzKHBlZClcclxuICAgIGNvbnN0IFtwcm9wcywgcHJvcFRvdGFsXSA9IGdldFByb3BzKHBlZClcclxuICAgIGNvbnN0IFtoZWFkRGF0YSwgdG90YWxzXSA9IGdldEhlYWRPdmVybGF5KHBlZClcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGhlYWRPdmVybGF5OiBoZWFkRGF0YSxcclxuICAgICAgICBkcmF3YWJsZXM6IGRyYXdhYmxlcyxcclxuICAgICAgICBwcm9wczogcHJvcHMsXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldFBlZENsb3RoZXNcIiwgZ2V0UGVkQ2xvdGhlcylcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQZWRTa2luKHBlZDogbnVtYmVyKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaGVhZEJsZW5kOiBnZXRIZWFkQmxlbmREYXRhKHBlZCksXHJcbiAgICAgICAgaGVhZFN0cnVjdHVyZTogZ2V0SGVhZFN0cnVjdHVyZShwZWQpLFxyXG4gICAgICAgIGhhaXJDb2xvcjogZ2V0SGFpcihwZWQpLFxyXG4gICAgICAgIG1vZGVsIDogR2V0RW50aXR5TW9kZWwocGVkKVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRQZWRTa2luXCIsIGdldFBlZFNraW4pXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGF0dG9vRGF0YSgpIHtcclxuICAgIGxldCB0YXR0b29ab25lcyA9IHt9XHJcblxyXG4gICAgY29uc3QgW1RBVFRPT19MSVNULCBUQVRUT09fQ0FURUdPUklFU10gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UudGF0dG9vcygpXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFRBVFRPT19DQVRFR09SSUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBUQVRUT09fQ0FURUdPUklFU1tpXVxyXG4gICAgICAgIGNvbnN0IHpvbmUgPSBjYXRlZ29yeS56b25lXHJcbiAgICAgICAgY29uc3QgbGFiZWwgPSBjYXRlZ29yeS5sYWJlbFxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gY2F0ZWdvcnkuaW5kZXhcclxuICAgICAgICB0YXR0b29ab25lc1tpbmRleF0gPSB7XHJcbiAgICAgICAgICAgIHpvbmU6IHpvbmUsXHJcbiAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcclxuICAgICAgICAgICAgem9uZUluZGV4OiBpbmRleCxcclxuICAgICAgICAgICAgZGxjczogW11cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgZGxjRGF0YSA9IFRBVFRPT19MSVNUW2pdXHJcbiAgICAgICAgICAgIHRhdHRvb1pvbmVzW2luZGV4XS5kbGNzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGRsY0RhdGEuZGxjLFxyXG4gICAgICAgICAgICAgICAgZGxjSW5kZXg6IGosXHJcbiAgICAgICAgICAgICAgICB0YXR0b29zOiBbXVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0ZlbWFsZSA9IEdldEVudGl0eU1vZGVsKFBsYXllclBlZElkKCkpID09PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gVEFUVE9PX0xJU1RbaV1cclxuICAgICAgICBjb25zdCB7IGRsYywgdGF0dG9vcyB9ID0gZGF0YVxyXG4gICAgICAgIGNvbnN0IGRsY0hhc2ggPSBHZXRIYXNoS2V5KGRsYylcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRhdHRvb3MubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IHRhdHRvb3Nbal0gXHJcbiAgICAgICAgICAgIGxldCB0YXR0b28gPSBudWxsXHJcblxyXG4gICAgICAgICAgICBjb25zdCBsb3dlclRhdHRvbyA9IHRhdHRvb0RhdGEudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICBjb25zdCBpc0ZlbWFsZVRhdHRvbyA9IGxvd2VyVGF0dG9vLmluY2x1ZGVzKFwiX2ZcIilcclxuICAgICAgICAgICAgaWYgKGlzRmVtYWxlVGF0dG9vICYmIGlzRmVtYWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXR0b28gPSB0YXR0b29EYXRhXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzRmVtYWxlVGF0dG9vICYmICFpc0ZlbWFsZSkge1xyXG4gICAgICAgICAgICAgICAgdGF0dG9vID0gdGF0dG9vRGF0YVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaGFzaCA9IG51bGxcclxuICAgICAgICAgICAgbGV0IHpvbmUgPSAtMVxyXG5cclxuICAgICAgICAgICAgaWYgKHRhdHRvbykge1xyXG4gICAgICAgICAgICAgICAgaGFzaCA9IEdldEhhc2hLZXkodGF0dG9vKVxyXG4gICAgICAgICAgICAgICAgem9uZSA9IEdldFBlZERlY29yYXRpb25ab25lRnJvbUhhc2hlcyhkbGNIYXNoLCBoYXNoKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoem9uZSAhPT0gLTEgJiYgaGFzaCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgem9uZVRhdHRvb3MgPSB0YXR0b29ab25lc1t6b25lXS5kbGNzW2ldLnRhdHRvb3NcclxuXHJcbiAgICAgICAgICAgICAgICB6b25lVGF0dG9vcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGF0dG9vLFxyXG4gICAgICAgICAgICAgICAgICAgIGhhc2g6IGhhc2gsXHJcbiAgICAgICAgICAgICAgICAgICAgem9uZTogem9uZSxcclxuICAgICAgICAgICAgICAgICAgICBkbGM6IGRsYyxcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhdHRvb1pvbmVzXHJcbn0iLCAiXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICBoYXRzOiB7XHJcbiAgICAgICAgdHlwZTogXCJwcm9wXCIsXHJcbiAgICAgICAgaW5kZXg6IDAsXHJcbiAgICB9LFxyXG4gICAgZ2xhc3Nlczoge1xyXG4gICAgICAgIHR5cGU6IFwicHJvcFwiLFxyXG4gICAgICAgIGluZGV4OiAxLFxyXG4gICAgfSxcclxuICAgIG1hc2tzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiAxLFxyXG4gICAgICAgIG9mZjogMCxcclxuICAgIH0sXHJcbiAgICBzaGlydHM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDgsXHJcbiAgICAgICAgb2ZmOiAxNVxyXG4gICAgfSxcclxuICAgIGphY2tldHM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDExLFxyXG4gICAgICAgIG9mZjogMTUsXHJcbiAgICB9LFxyXG4gICAgbGVnczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogNCxcclxuICAgICAgICBvZmY6IDExLFxyXG4gICAgfSxcclxuICAgIHNob2VzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA2LFxyXG4gICAgICAgIG9mZjogMTMsXHJcbiAgICB9XHJcbn0iLCAiaW1wb3J0IHsgRHJhd2FibGVEYXRhLCBUVmFsdWUgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiO1xyXG5pbXBvcnQgVE9HR0xFX0lOREVYRVMgZnJvbSBcIkBkYXRhL3RvZ2dsZXNcIlxyXG5pbXBvcnQgeyBjb3B5RmlsZVN5bmMgfSBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHsgcmVxdWVzdE1vZGVsfSBmcm9tICdAdXRpbHMnO1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXREcmF3YWJsZShwZWQ6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgMClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFByb3AocGVkOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBpZiAoZGF0YS52YWx1ZSA9PT0gLTEpIHtcclxuICAgICAgICBDbGVhclBlZFByb3AocGVkLCBkYXRhLmluZGV4KVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIFNldFBlZFByb3BJbmRleChwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgZmFsc2UpXHJcbn1cclxuXHJcblxyXG5leHBvcnQgY29uc3Qgc2V0TW9kZWwgPSBhc3luYyAocGVkOiBudW1iZXIsIGRhdGEpID0+IHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBpc0p1c3RNb2RlbCA9IHR5cGVvZiBkYXRhID09PSAnbnVtYmVyJ1xyXG4gICAgY29uc3QgbW9kZWwgPSBpc0p1c3RNb2RlbCA/IGRhdGEgOiBkYXRhLm1vZGVsXHJcbiAgICBjb25zdCBpc1BsYXllciA9IElzUGVkQVBsYXllcihwZWQpXHJcblxyXG4gICAgaWYgKGlzUGxheWVyKSB7XHJcbiAgICAgICAgY29uc3QgbW9kZWxIYXNoID0gYXdhaXQgcmVxdWVzdE1vZGVsKG1vZGVsKVxyXG4gICAgICAgIFNldFBsYXllck1vZGVsKFBsYXllcklkKCksIG1vZGVsSGFzaClcclxuICAgICAgICBTZXRNb2RlbEFzTm9Mb25nZXJOZWVkZWQobW9kZWxIYXNoKVxyXG4gICAgICAgIHBlZCA9IFBsYXllclBlZElkKClcclxuICAgIH1cclxuICAgIFNldFBlZERlZmF1bHRDb21wb25lbnRWYXJpYXRpb24ocGVkKVxyXG5cclxuICAgIGlmICghaXNKdXN0TW9kZWwgJiYgZGF0YS5oZWFkQmxlbmQgJiYgT2JqZWN0LmtleXMoZGF0YS5oZWFkQmxlbmQpLmxlbmd0aCkgc2V0SGVhZEJsZW5kKHBlZCwgZGF0YS5oZWFkQmxlbmQpXHJcbiAgICByZXR1cm4gcGVkXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBTZXRGYWNlRmVhdHVyZShwZWQ6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG4gICAgU2V0UGVkRmFjZUZlYXR1cmUocGVkLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlICsgMC4wKVxyXG59XHJcblxyXG5jb25zdCBpc1Bvc2l0aXZlID0gKHZhbDogbnVtYmVyKSA9PiB2YWwgPj0gMCA/IHZhbCA6IDBcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkQmxlbmQocGVkOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3Qgc2hhcGVGaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZUZpcnN0KVxyXG4gICAgY29uc3Qgc2hhcGVTZWNvbmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVTZWNvbmQpXHJcbiAgICBjb25zdCBzaGFwZVRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlVGhpcmQpXHJcbiAgICBjb25zdCBza2luRmlyc3QgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpbkZpcnN0KVxyXG4gICAgY29uc3Qgc2tpblNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5za2luU2Vjb25kKVxyXG4gICAgY29uc3Qgc2tpblRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNraW5UaGlyZClcclxuICAgIGNvbnN0IHNoYXBlTWl4ID0gZGF0YS5zaGFwZU1peCArIDAuMFxyXG4gICAgY29uc3Qgc2tpbk1peCA9IGRhdGEuc2tpbk1peCArIDAuMFxyXG4gICAgY29uc3QgdGhpcmRNaXggPSBkYXRhLnRoaXJkTWl4ICsgMC4wXHJcbiAgICBjb25zdCBoYXNQYXJlbnQgPSBkYXRhLmhhc1BhcmVudFxyXG5cclxuICAgIFNldFBlZEhlYWRCbGVuZERhdGEocGVkLCBzaGFwZUZpcnN0LCBzaGFwZVNlY29uZCwgc2hhcGVUaGlyZCwgc2tpbkZpcnN0LCBza2luU2Vjb25kLCBza2luVGhpcmQsIHNoYXBlTWl4LCBza2luTWl4LFxyXG4gICAgICAgIHRoaXJkTWl4LCBoYXNQYXJlbnQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkT3ZlcmxheShwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuICAgIGNvbnN0IGluZGV4ID0gZGF0YS5pbmRleFxyXG5cclxuICAgIGlmIChpbmRleCA9PT0gMTMpIHtcclxuICAgICAgICBTZXRQZWRFeWVDb2xvcihwZWQsIGRhdGEudmFsdWUpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmFsdWUgPSBkYXRhLm92ZXJsYXlWYWx1ZSA9PT0gLTEgPyAyNTUgOiBkYXRhLm92ZXJsYXlWYWx1ZVxyXG5cclxuICAgIFNldFBlZEhlYWRPdmVybGF5KHBlZCwgaW5kZXgsIHZhbHVlLCBkYXRhLm92ZXJsYXlPcGFjaXR5ICsgMC4wKVxyXG4gICAgU2V0UGVkSGVhZE92ZXJsYXlDb2xvcihwZWQsIGluZGV4LCAxLCBkYXRhLmZpcnN0Q29sb3IsIGRhdGEuc2Vjb25kQ29sb3IpXHJcbn1cclxuXHJcbi8vIGZ1bmN0aW9uIFJlc2V0VG9nZ2xlcyhkYXRhKVxyXG4vLyAgICAgbG9jYWwgcGVkID0gY2FjaGUucGVkXHJcblxyXG4vLyAgICAgbG9jYWwgZHJhd2FibGVzID0gZGF0YS5kcmF3YWJsZXNcclxuLy8gICAgIGxvY2FsIHByb3BzID0gZGF0YS5wcm9wc1xyXG5cclxuLy8gICAgIGZvciB0b2dnbGVJdGVtLCB0b2dnbGVEYXRhIGluIHBhaXJzKFRPR0dMRV9JTkRFWEVTKSBkb1xyXG4vLyAgICAgICAgIGxvY2FsIHRvZ2dsZVR5cGUgPSB0b2dnbGVEYXRhLnR5cGVcclxuLy8gICAgICAgICBsb2NhbCBpbmRleCA9IHRvZ2dsZURhdGEuaW5kZXhcclxuXHJcbi8vICAgICAgICAgaWYgdG9nZ2xlVHlwZSA9PSBcImRyYXdhYmxlXCIgYW5kIGRyYXdhYmxlc1t0b2dnbGVJdGVtXSB0aGVuXHJcbi8vICAgICAgICAgICAgIGxvY2FsIGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpXHJcbi8vICAgICAgICAgICAgIGlmIGN1cnJlbnREcmF3YWJsZSB+PSBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUgdGhlblxyXG4vLyAgICAgICAgICAgICAgICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaW5kZXgsIGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgMClcclxuLy8gICAgICAgICAgICAgZW5kXHJcbi8vICAgICAgICAgZWxzZWlmIHRvZ2dsZVR5cGUgPT0gXCJwcm9wXCIgYW5kIHByb3BzW3RvZ2dsZUl0ZW1dIHRoZW5cclxuLy8gICAgICAgICAgICAgbG9jYWwgY3VycmVudFByb3AgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleClcclxuLy8gICAgICAgICAgICAgaWYgY3VycmVudFByb3Agfj0gcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUgdGhlblxyXG4vLyAgICAgICAgICAgICAgICAgU2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgsIHByb3BzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCBmYWxzZSlcclxuLy8gICAgICAgICAgICAgZW5kXHJcbi8vICAgICAgICAgZW5kXHJcbi8vICAgICBlbmRcclxuLy8gZW5kXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRUb2dnbGVzKGRhdGEpIHtcclxuICAgIGNvbnN0IHBlZCA9IFBsYXllclBlZElkKClcclxuICAgIGNvbnN0IGRyYXdhYmxlcyA9IGRhdGEuZHJhd2FibGVzXHJcbiAgICBjb25zdCBwcm9wcyA9IGRhdGEucHJvcHNcclxuXHJcbiAgICBmb3IgKGNvbnN0IFt0b2dnbGVJdGVtLCB0b2dnbGVEYXRhXSBvZiBPYmplY3QuZW50cmllcyhUT0dHTEVfSU5ERVhFUykpIHtcclxuICAgICAgICBjb25zdCB0b2dnbGVUeXBlID0gdG9nZ2xlRGF0YS50eXBlXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0b2dnbGVEYXRhLmluZGV4XHJcblxyXG4gICAgICAgIGlmICh0b2dnbGVUeXBlID09PSBcImRyYXdhYmxlXCIgJiYgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50RHJhd2FibGUgIT09IGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaW5kZXgsIGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodG9nZ2xlVHlwZSA9PT0gXCJwcm9wXCIgJiYgcHJvcHNbdG9nZ2xlSXRlbV0pIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFByb3AgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleClcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRQcm9wICE9PSBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgU2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgsIHByb3BzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCBmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZENsb3RoZXMocGVkOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgZHJhd2FibGVzID0gZGF0YS5kcmF3YWJsZXNcclxuICAgIGNvbnN0IHByb3BzID0gZGF0YS5wcm9wc1xyXG4gICAgY29uc3QgaGVhZE92ZXJsYXkgPSBkYXRhLmhlYWRPdmVybGF5XHJcbiAgICBjb25zb2xlLmxvZygnZHJhd2FibGVzJywgZHJhd2FibGVzKVxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBkcmF3YWJsZXMpIHtcclxuICAgICAgICBjb25zdCBkcmF3YWJsZSA9IGRyYXdhYmxlc1tpZF1cclxuICAgICAgICBzZXREcmF3YWJsZShwZWQsIGRyYXdhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgaWQgaW4gcHJvcHMpIHtcclxuICAgICAgICBjb25zdCBwcm9wID0gcHJvcHNbaWRdXHJcbiAgICAgICAgc2V0UHJvcChwZWQsIHByb3ApXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBoZWFkT3ZlcmxheSkge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBoZWFkT3ZlcmxheVtpZF1cclxuICAgICAgICBzZXRIZWFkT3ZlcmxheShwZWQsIG92ZXJsYXkpXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZXRQZWRTa2luID0gYXN5bmMgKHBlZDogbnVtYmVyLCBkYXRhKSA9PiB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG4gICAgY29uc3QgaGVhZFN0cnVjdHVyZSA9IGRhdGEuaGVhZFN0cnVjdHVyZVxyXG4gICAgY29uc3QgaGVhZEJsZW5kID0gZGF0YS5oZWFkQmxlbmRcclxuXHJcbiAgICBwZWQgPSBhd2FpdCBzZXRNb2RlbChwZWQsIGRhdGEpXHJcbiAgICBpZiAoaGVhZEJsZW5kKSB7XHJcbiAgICAgICAgc2V0SGVhZEJsZW5kKHBlZCwgaGVhZEJsZW5kKVxyXG4gICAgfVxyXG4gICAgaWYgKGhlYWRTdHJ1Y3R1cmUpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGZlYXR1cmUgb2YgaGVhZFN0cnVjdHVyZSkge1xyXG4gICAgICAgICAgICBTZXRGYWNlRmVhdHVyZShwZWQsIGZlYXR1cmUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkVGF0dG9vcyhwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm5cclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgaXNQbGF5ZXIgPSBJc1BlZEFQbGF5ZXIocGVkKVxyXG4gICAgaWYgKGlzUGxheWVyKSB7XHJcbiAgICAgICAgcGVkID0gUGxheWVyUGVkSWQoKVxyXG4gICAgfVxyXG5cclxuICAgIENsZWFyUGVkRGVjb3JhdGlvbnNMZWF2ZVNjYXJzKHBlZClcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gZGF0YVtpXS50YXR0b29cclxuICAgICAgICBpZiAodGF0dG9vRGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gR2V0SGFzaEtleSh0YXR0b29EYXRhLmRsYylcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vID0gdGF0dG9vRGF0YS5oYXNoXHJcbiAgICAgICAgICAgIEFkZFBlZERlY29yYXRpb25Gcm9tSGFzaGVzKHBlZCwgY29sbGVjdGlvbiwgdGF0dG9vKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZEhhaXJDb2xvcnMocGVkOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgY29sb3IgPSBkYXRhLmNvbG9yXHJcbiAgICBjb25zdCBoaWdobGlnaHQgPSBkYXRhLmhpZ2hsaWdodFxyXG4gICAgU2V0UGVkSGFpckNvbG9yKHBlZCwgY29sb3IsIGhpZ2hsaWdodClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZEFwcGVhcmFuY2UocGVkOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIHNldFBlZFNraW4ocGVkLCBkYXRhKVxyXG4gICAgc2V0UGVkQ2xvdGhlcyhwZWQsIGRhdGEpXHJcbiAgICBzZXRQZWRIYWlyQ29sb3JzKHBlZCwgZGF0YS5oYWlyQ29sb3IpXHJcbiAgICBzZXRQZWRUYXR0b29zKHBlZCwgZGF0YS50YXR0b29zKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGxheWVyUGVkQXBwZWFyYW5jZShkYXRhKSB7XHJcbiAgICBzZXRQZWRTa2luKFBsYXllclBlZElkKCksIGRhdGEpXHJcbiAgICBzZXRQZWRDbG90aGVzKFBsYXllclBlZElkKCksIGRhdGEpXHJcbiAgICBzZXRQZWRIYWlyQ29sb3JzKFBsYXllclBlZElkKCksIGRhdGEuaGFpckNvbG9yKVxyXG4gICAgc2V0UGVkVGF0dG9vcyhQbGF5ZXJQZWRJZCgpLCBkYXRhLnRhdHRvb3MpXHJcbn0iLCAiaW1wb3J0IHsgUmVjZWl2ZSB9IGZyb20gJ0BldmVudHMnO1xyXG5pbXBvcnQge1xyXG5cdHJlc2V0VG9nZ2xlcyxcclxuXHRzZXREcmF3YWJsZSxcclxuXHRTZXRGYWNlRmVhdHVyZSxcclxuXHRzZXRIZWFkQmxlbmQsXHJcblx0c2V0TW9kZWwsXHJcblx0c2V0UGVkQ2xvdGhlcyxcclxuXHRzZXRQZWRUYXR0b29zLFxyXG5cdHNldFBsYXllclBlZEFwcGVhcmFuY2UsXHJcblx0c2V0UHJvcCxcclxufSBmcm9tICcuL2FwcGVhcmFuY2Uvc2V0dGVycyc7XHJcbmltcG9ydCB7IGNsb3NlTWVudSB9IGZyb20gJy4vbWVudSc7XHJcbmltcG9ydCB7IFRBcHBlYXJhbmNlLCBUVG9nZ2xlRGF0YSwgVFZhbHVlIH0gZnJvbSAnQHR5cGluZ3MvYXBwZWFyYW5jZSc7XHJcbmltcG9ydCB7IGRlbGF5LCBnZXRGcmFtZXdvcmtJRCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0VGF0dG9vRGF0YSB9IGZyb20gJy4vYXBwZWFyYW5jZS9nZXR0ZXJzJztcclxuaW1wb3J0IFRPR0dMRV9JTkRFWEVTIGZyb20gJ0BkYXRhL3RvZ2dsZXMnO1xyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tICdAdHlwaW5ncy9vdXRmaXRzJztcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW5jZWwsIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKTtcclxuXHRjbG9zZU1lbnUoKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFxyXG5cdFJlY2VpdmUuc2F2ZSxcclxuXHRhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdzYXZlJylcclxuXHRcdHJlc2V0VG9nZ2xlcyhhcHBlYXJhbmNlKTtcclxuXHJcblx0XHRhd2FpdCBkZWxheSgxMDApO1xyXG5cclxuXHRcdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblxyXG5cdFx0Y29uc3QgbmV3QXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkKTtcclxuXHJcblx0XHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cclxuXHRcdHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayhcclxuXHRcdFx0J2JsX2FwcGVhcmFuY2U6c2VydmVyOnNldEFwcGVhcmFuY2UnLFxyXG5cdFx0XHRmcmFtZXdvcmtkSWQsXHJcblx0XHRcdG5ld0FwcGVhcmFuY2VcclxuXHRcdCk7XHJcblxyXG5cdFx0c2V0UGVkVGF0dG9vcyhwZWQsIGFwcGVhcmFuY2UudGF0dG9vcyk7XHJcblxyXG5cdFx0Y2xvc2VNZW51KCk7XHJcblx0XHRjYigxKTtcclxuXHR9XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0TW9kZWwsIGFzeW5jIChtb2RlbDogc3RyaW5nLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBoYXNoID0gR2V0SGFzaEtleShtb2RlbCk7XHJcblx0aWYgKCFJc01vZGVsSW5DZGltYWdlKGhhc2gpIHx8ICFJc01vZGVsVmFsaWQoaGFzaCkpIHtcclxuXHRcdHJldHVybiBjYigwKTtcclxuXHR9XHJcblxyXG5cdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblxyXG5cdGF3YWl0IHNldE1vZGVsKHBlZCwgaGFzaCk7XHJcblxyXG5cdGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKHBlZCk7XHJcblxyXG5cdGFwcGVhcmFuY2UudGF0dG9vcyA9IFtdO1xyXG5cclxuXHRjYihhcHBlYXJhbmNlKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZ2V0TW9kZWxUYXR0b29zLCBhc3luYyAoXzogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCB0YXR0b29zID0gZ2V0VGF0dG9vRGF0YSgpO1xyXG5cclxuXHRjYih0YXR0b29zKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFxyXG5cdFJlY2VpdmUuc2V0SGVhZFN0cnVjdHVyZSxcclxuXHRhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRcdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0XHRTZXRGYWNlRmVhdHVyZShwZWQsIGRhdGEpO1xyXG5cdFx0Y2IoMSk7XHJcblx0fVxyXG4pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhcclxuXHRSZWNlaXZlLnNldEhlYWRPdmVybGF5LFxyXG5cdGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdFx0Y29uc3QgcGVkID0gUGxheWVyUGVkSWQoKTtcclxuXHRcdFNldEZhY2VGZWF0dXJlKHBlZCwgZGF0YSk7XHJcblx0XHRjYigxKTtcclxuXHR9XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFxyXG5cdFJlY2VpdmUuc2V0SGVhZEJsZW5kLFxyXG5cdGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdFx0Y29uc3QgcGVkID0gUGxheWVyUGVkSWQoKTtcclxuXHRcdHNldEhlYWRCbGVuZChwZWQsIGRhdGEpO1xyXG5cdFx0Y2IoMSk7XHJcblx0fVxyXG4pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFRhdHRvb3MsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRQcm9wLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cdHNldFByb3AocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0RHJhd2FibGUsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0c2V0RHJhd2FibGUocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFxyXG5cdFJlY2VpdmUudG9nZ2xlSXRlbSxcclxuXHRhc3luYyAoZGF0YTogVFRvZ2dsZURhdGEsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGl0ZW0gPSBUT0dHTEVfSU5ERVhFU1tkYXRhLml0ZW1dO1xyXG5cdFx0aWYgKCFpdGVtKSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRcdGNvbnN0IGN1cnJlbnQgPSBkYXRhLmRhdGE7XHJcblx0XHRjb25zdCB0eXBlID0gaXRlbS50eXBlO1xyXG5cdFx0Y29uc3QgaW5kZXggPSBpdGVtLmluZGV4O1xyXG5cclxuXHRcdGlmICghY3VycmVudCkgcmV0dXJuIGNiKGZhbHNlKTtcclxuXHJcblx0XHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cclxuXHRcdGlmICh0eXBlID09PSAncHJvcCcpIHtcclxuXHRcdFx0Y29uc3QgY3VycmVudFByb3AgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleCk7XHJcblxyXG5cdFx0XHRpZiAoY3VycmVudFByb3AgPT09IC0xKSB7XHJcblx0XHRcdFx0c2V0UHJvcChwZWQsIGN1cnJlbnQpO1xyXG5cdFx0XHRcdGNiKGZhbHNlKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Q2xlYXJQZWRQcm9wKHBlZCwgaW5kZXgpO1xyXG5cdFx0XHRcdGNiKHRydWUpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmICh0eXBlID09PSAnZHJhd2FibGUnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnQudmFsdWUgPT09IGl0ZW0ub2ZmKSB7XHJcbiAgICAgICAgICAgICAgICBjYihmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50LnZhbHVlID09PSBjdXJyZW50RHJhd2FibGUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBpdGVtLm9mZiwgMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjYih0cnVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldERyYXdhYmxlKHBlZCwgY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICBjYihmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblx0fVxyXG4pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNhdmVPdXRmaXQsIGFzeW5jIChkYXRhOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgY29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayhcclxuICAgICAgICAnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZU91dGZpdCcsXHJcbiAgICAgICAgZnJhbWV3b3JrZElkLFxyXG4gICAgICAgIGRhdGFcclxuICAgICk7XHJcbiAgICBjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5kZWxldGVPdXRmaXQsIGFzeW5jIChpZDogc3RyaW5nLCBjYjogRnVuY3Rpb24pID0+IHtcclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soXHJcbiAgICAgICAgJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmRlbGV0ZU91dGZpdCcsXHJcbiAgICAgICAgZnJhbWV3b3JrZElkLFxyXG4gICAgICAgIGlkXHJcbiAgICApO1xyXG4gICAgY2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUucmVuYW1lT3V0Zml0LCBhc3luYyAoZGF0YTogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soXHJcbiAgICAgICAgJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlbmFtZU91dGZpdCcsXHJcbiAgICAgICAgZnJhbWV3b3JrZElkLFxyXG4gICAgICAgIGRhdGFcclxuICAgICk7XHJcbiAgICBjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS51c2VPdXRmaXQsIGFzeW5jIChvdXRmaXQ6IE91dGZpdCwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygndXNlT3V0Zml0Jywgb3V0Zml0KTtcclxuICAgIHNldFBlZENsb3RoZXMoUGxheWVyUGVkSWQoKSwgb3V0Zml0KTtcclxuICAgIGNiKDEpO1xyXG59KTsiLCAiaW1wb3J0IHsgZ2V0RnJhbWV3b3JrSUQsIHJlcXVlc3RMb2NhbGUsIHNlbmROVUlFdmVudCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSBcIkB1dGlsc1wiXHJcbmltcG9ydCB7IHN0YXJ0Q2FtZXJhLCBzdG9wQ2FtZXJhIH0gZnJvbSBcIi4vY2FtZXJhXCJcclxuaW1wb3J0IHR5cGUgeyBUTWVudVR5cGVzIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tIFwiQHR5cGluZ3Mvb3V0Zml0c1wiXHJcbmltcG9ydCB7IFNlbmQgfSBmcm9tIFwiQGV2ZW50c1wiXHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldFRhdHRvb0RhdGEgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL2dldHRlcnNcIlxyXG5pbXBvcnQgXCIuL2hhbmRsZXJzXCJcclxuXHJcbmNvbnN0IGNvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZVxyXG5sZXQgYXJtb3VyID0gMFxyXG5cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuTWVudSh0eXBlOiBUTWVudVR5cGVzLCBjcmVhdGlvbjogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICBjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgY29uZmlnTWVudXMgPSBjb25maWcubWVudXMoKVxyXG5cclxuICAgIGNvbnN0IG1lbnUgPSBjb25maWdNZW51c1t0eXBlXVxyXG5cclxuICAgIGNvbnNvbGUubG9nKGNvbmZpZ01lbnVzLCBtZW51KVxyXG5cclxuICAgIGlmICghbWVudSkgcmV0dXJuXHJcblxyXG4gICAgc3RhcnRDYW1lcmEocGVkKVxyXG5cclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKClcclxuXHJcbiAgICBjb25zdCB0YWJzID0gbWVudS50YWJzXHJcblxyXG4gICAgbGV0IGFsbG93RXhpdCA9IG1lbnUuYWxsb3dFeGl0XHJcblxyXG4gICAgYXJtb3VyID0gR2V0UGVkQXJtb3VyKHBlZClcclxuXHJcbiAgICBjb25zb2xlLmxvZyhcImFybW91clwiLCBhcm1vdXIpXHJcblxyXG4gICAgbGV0IG91dGZpdHMgPSBbXVxyXG5cclxuICAgIGNvbnN0IGhhc091dGZpdFRhYiA9IHRhYnMuaW5jbHVkZXMoJ291dGZpdHMnKVxyXG4gICAgaWYgKGhhc091dGZpdFRhYikge1xyXG4gICAgICAgIG91dGZpdHMgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8T3V0Zml0W10+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRPdXRmaXRzJywgZnJhbWV3b3JrZElkKSBhcyBPdXRmaXRbXSBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbW9kZWxzID0gW11cclxuXHJcbiAgICBjb25zdCBoYXNIZXJpdGFnZVRhYiA9IHRhYnMuaW5jbHVkZXMoJ2hlcml0YWdlJylcclxuICAgIGlmIChoYXNIZXJpdGFnZVRhYikge1xyXG4gICAgICAgIG1vZGVscyA9IGNvbmZpZy5tb2RlbHMoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGhhc1RhdHRvb1RhYiA9IHRhYnMuaW5jbHVkZXMoJ3RhdHRvb3MnKVxyXG4gICAgbGV0IHRhdHRvb3NcclxuICAgIGlmIChoYXNUYXR0b29UYWIpIHtcclxuICAgICAgICB0YXR0b29zID0gZ2V0VGF0dG9vRGF0YSgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYmxhY2tsaXN0ID0gZ2V0QmxhY2tsaXN0KHR5cGUpXHJcblxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkKVxyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiYXBwZWFyYW5jZVwiKVxyXG5cclxuICAgIGlmIChjcmVhdGlvbikge1xyXG4gICAgICAgIGFsbG93RXhpdCA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgc2VuZE5VSUV2ZW50KCBTZW5kLmRhdGEsIHtcclxuICAgICAgICB0YWJzLFxyXG4gICAgICAgIGFwcGVhcmFuY2UsXHJcbiAgICAgICAgYmxhY2tsaXN0LFxyXG4gICAgICAgIHRhdHRvb3MsXHJcbiAgICAgICAgb3V0Zml0cyxcclxuICAgICAgICBtb2RlbHMsXHJcbiAgICAgICAgYWxsb3dFeGl0LFxyXG4gICAgICAgIGxvY2FsZTogYXdhaXQgcmVxdWVzdExvY2FsZSgnbG9jYWxlJylcclxuICAgIH0pXHJcbiAgICBjb25zb2xlLmxvZygnb3Blbk1lbnUnLCB0eXBlKVxyXG4gICAgU2V0TnVpRm9jdXModHJ1ZSwgdHJ1ZSlcclxuICAgIHNlbmROVUlFdmVudChTZW5kLnZpc2libGUsIHRydWUpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEJsYWNrbGlzdCh0eXBlOiBUTWVudVR5cGVzKSB7XHJcbiAgICBjb25zdCBibGFja2xpc3QgPSBjb25maWcuYmxhY2tsaXN0KClcclxuXHJcbiAgICByZXR1cm4gYmxhY2tsaXN0XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9zZU1lbnUoKSB7XHJcbiAgICBjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgU2V0UGVkQXJtb3VyKHBlZCwgYXJtb3VyKVxyXG5cclxuICAgIHN0b3BDYW1lcmEoKVxyXG4gICAgU2V0TnVpRm9jdXMoZmFsc2UsIGZhbHNlKVxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQudmlzaWJsZSwgZmFsc2UpXHJcbn0iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRNZW51VHlwZXMgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCB7IG9wZW5NZW51IH0gZnJvbSBcIi4vbWVudVwiXHJcbmltcG9ydCB7IHNldFBlZEFwcGVhcmFuY2UsIHNldFBsYXllclBlZEFwcGVhcmFuY2UgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxyXG5pbXBvcnQgeyBkZWxheSwgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSBcIkB1dGlsc1wiXHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL2dldHRlcnNcIlxyXG5cclxubGV0IGlzSW5TcHJpdGU6IFRNZW51VHlwZXMgfCBudWxsID0gbnVsbFxyXG5cclxuY29uc3QgY29uZmlnID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmNvbmZpZygpXHJcblxyXG5SZWdpc3RlckNvbW1hbmQoJ29wZW5NZW51JywgKCkgPT4ge1xyXG4gICAgb3Blbk1lbnUoJ2FwcGVhcmFuY2UnKSAgXHJcbiAgICBjb25zb2xlLmxvZygnTWVudSBvcGVuZWQnKVxyXG4gIH0sIGZhbHNlKVxyXG5cclxuXHJcbmV4cG9ydHMoJ1NldFBlZEFwcGVhcmFuY2UnLCAocGVkOiBudW1iZXIsIGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlKSA9PiB7XHJcbiAgICBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcclxufSlcclxuXHJcbmV4cG9ydHMoJ1NldFBsYXllclBlZEFwcGVhcmFuY2UnLCBhc3luYyAoZnJhbWV3b3JrSUQpID0+IHtcclxuICAgIGxldCBhcHBlYXJhbmNlXHJcbiAgICBpZiAgKGNvbmZpZy5iYWNrd2FyZHNDb21wYXRpYmlsaXR5KSB7XHJcbiAgICAgICAgY29uc3Qgb2xkQXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOlByZXZpb3VzR2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLnByZXZpb3VzQ2xvdGhpbmcgPT0gJ2lsbGVuaXVtJykge1xyXG4gICAgICAgICAgICBleHBvcnRzWydpbGxlbml1bS1hcHBlYXJhbmNlJ10uc2V0UGVkQXBwZWFyYW5jZShQbGF5ZXJQZWRJZCgpLCBvbGRBcHBlYXJhbmNlKVxyXG4gICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLnByZXZpb3VzQ2xvdGhpbmcgPT0gJ3FiJykge1xyXG4gICAgICAgICAgICBlbWl0KCdxYi1jbG90aGluZzpjbGllbnQ6bG9hZFBsYXllckNsb3RoaW5nJywgb2xkQXBwZWFyYW5jZSwgUGxheWVyUGVkSWQoKSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGF3YWl0IGRlbGF5KDEwMClcclxuXHJcbiAgICAgICAgYXBwZWFyYW5jZSA9IGdldEFwcGVhcmFuY2UoUGxheWVyUGVkSWQoKSlcclxuICAgIH1cclxuXHJcbiAgICBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxyXG59KVxyXG5cclxuZXhwb3J0cygnR2V0UGxheWVyUGVkQXBwZWFyYW5jZScsIGFzeW5jIChmcmFtZXdvcmtJRCkgPT4ge1xyXG4gICAgcmV0dXJuIGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxufSlcclxuXHJcbmNvbnN0IHpvbmVzID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLnpvbmVzKClcclxuY29uc3QgYmxfc3ByaXRlcyA9IGV4cG9ydHMuYmxfc3ByaXRlc1xyXG5cclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgnK29wZW5BcHBlYXJhbmNlJywgKCkgPT4ge1xyXG4gICAgaWYgKCFpc0luU3ByaXRlKSByZXR1cm5cclxuICAgIG9wZW5NZW51KGlzSW5TcHJpdGUpXHJcbn0sIGZhbHNlKVxyXG5cclxuXHJcblJlZ2lzdGVyS2V5TWFwcGluZygnK29wZW5BcHBlYXJhbmNlJywgJ09wZW4gQXBwZWFyYW5jZScsICdrZXlib2FyZCcsIGNvbmZpZy5vcGVuQ29udHJvbClcclxuXHJcbmZvciAoY29uc3QgZWxlbWVudCBvZiB6b25lcykge1xyXG4gICAgYmxfc3ByaXRlcy5zcHJpdGUoe1xyXG4gICAgICAgIGNvb3JkczogZWxlbWVudC5jb29yZHMsXHJcbiAgICAgICAgc2hhcGU6ICdoZXgnLFxyXG4gICAgICAgIGtleTogY29uZmlnLm9wZW5Db250cm9sLFxyXG4gICAgICAgIGRpc3RhbmNlOiAzLjAsXHJcbiAgICAgICAgb25FbnRlcjogKCkgPT4gaXNJblNwcml0ZSA9IGVsZW1lbnQudHlwZSxcclxuICAgICAgICBvbkV4aXQ6ICgpID0+IGlzSW5TcHJpdGUgPSBudWxsXHJcbiAgICB9KVxyXG59Il0sCiAgIm1hcHBpbmdzIjogIjs7OztBQVNPLElBQU0sZUFBZSx3QkFBQyxRQUFnQixTQUFjO0FBQ3ZELGlCQUFlO0FBQUEsSUFDWDtBQUFBLElBQ0E7QUFBQSxFQUNKLENBQUM7QUFDTCxHQUw0QjtBQU9yQixJQUFNLFFBQVEsd0JBQUMsT0FBZSxJQUFJLFFBQVEsU0FBTyxXQUFXLEtBQUssRUFBRSxDQUFDLEdBQXREO0FBRWQsSUFBTSxlQUFlLDhCQUFPLFVBQTRDO0FBQzNFLE1BQUksWUFBb0IsT0FBTyxVQUFVLFdBQVcsUUFBUSxXQUFXLEtBQUs7QUFFNUUsTUFBSSxDQUFDLGFBQWEsU0FBUyxHQUFHO0FBQzFCLFlBQVEsVUFBVSxPQUFPLEVBQUU7QUFBQSxNQUN2QixPQUFPO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsSUFDZCxDQUFDO0FBRUQsVUFBTSxJQUFJLE1BQU0sb0NBQW9DLEtBQUssR0FBRztBQUFBLEVBQ2hFO0FBRUEsTUFBSSxlQUFlLFNBQVM7QUFBRyxXQUFPO0FBRXRDLGVBQWEsU0FBUztBQUV0QixRQUFNLHFCQUFxQiw2QkFBcUI7QUFDNUMsV0FBTyxJQUFJLFFBQVEsYUFBVztBQUMxQixZQUFNLFdBQVcsWUFBWSxNQUFNO0FBQy9CLFlBQUksZUFBZSxTQUFTLEdBQUc7QUFDM0Isd0JBQWMsUUFBUTtBQUN0QixrQkFBUTtBQUFBLFFBQ1o7QUFBQSxNQUNKLEdBQUcsR0FBRztBQUFBLElBQ1YsQ0FBQztBQUFBLEVBQ0wsR0FUMkI7QUFXM0IsUUFBTSxtQkFBbUI7QUFFekIsU0FBTztBQUNYLEdBL0I0QjtBQXFDNUIsSUFBTSxlQUFlLHVCQUF1QjtBQUM1QyxJQUFNLGNBQXNDLENBQUM7QUFDN0MsSUFBTSxlQUF5RCxDQUFDO0FBRWhFLFNBQVMsV0FBVyxXQUFtQkEsUUFBc0I7QUFDekQsTUFBSUEsVUFBU0EsU0FBUSxHQUFHO0FBQ3BCLFVBQU0sY0FBYyxhQUFhO0FBRWpDLFNBQUssWUFBWSxTQUFTLEtBQUssS0FBSztBQUFhLGFBQU87QUFFeEQsZ0JBQVksU0FBUyxJQUFJLGNBQWNBO0FBQUEsRUFDM0M7QUFFQSxTQUFPO0FBQ1g7QUFWUztBQVlULE1BQU0sV0FBVyxZQUFZLElBQUksQ0FBQyxRQUFnQixTQUFjO0FBQzVELFFBQU0sVUFBVSxhQUFhLEdBQUc7QUFDaEMsU0FBTyxXQUFXLFFBQVEsR0FBRyxJQUFJO0FBQ3JDLENBQUM7QUFFTSxTQUFTLHNCQUNaLGNBQXNCLE1BQ0w7QUFDakIsTUFBSSxDQUFDLFdBQVcsV0FBVyxDQUFDLEdBQUc7QUFDM0I7QUFBQSxFQUNKO0FBRUEsTUFBSTtBQUVKLEtBQUc7QUFDQyxVQUFNLEdBQUcsU0FBUyxJQUFJLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxNQUFTLEVBQUUsQ0FBQztBQUFBLEVBQ2xFLFNBQVMsYUFBYSxHQUFHO0FBRXpCLFVBQVEsV0FBVyxTQUFTLElBQUksY0FBYyxLQUFLLEdBQUcsSUFBSTtBQUUxRCxTQUFPLElBQUksUUFBVyxDQUFDLFlBQVk7QUFDL0IsaUJBQWEsR0FBRyxJQUFJO0FBQUEsRUFDeEIsQ0FBQztBQUNMO0FBbEJnQjtBQXNCVCxJQUFNLGdCQUFnQix3QkFBQyxvQkFBNEI7QUFDdEQsU0FBTyxJQUFJLFFBQVEsQ0FBQyxZQUFZO0FBQzVCLFVBQU0sb0JBQW9CLDZCQUFNO0FBQzVCLFVBQUksdUJBQXVCLGVBQWUsR0FBRztBQUN6QyxjQUFNLGFBQWEsUUFBUSxjQUFjLE9BQU8sRUFBRTtBQUNsRCxZQUFJLG9CQUFvQixpQkFBaUIsY0FBYyxVQUFVLFVBQVUsT0FBTztBQUNsRixZQUFJLENBQUMsbUJBQW1CO0FBQ3BCLGtCQUFRLE1BQU0sR0FBRyxVQUFVLHFFQUFxRTtBQUNoRyw4QkFBb0IsaUJBQWlCLGNBQWMsZ0JBQWdCO0FBQUEsUUFDdkU7QUFDQSxnQkFBUSxpQkFBaUI7QUFBQSxNQUM3QixPQUFPO0FBQ0gsbUJBQVcsbUJBQW1CLEdBQUc7QUFBQSxNQUNyQztBQUFBLElBQ0osR0FaMEI7QUFhMUIsc0JBQWtCO0FBQUEsRUFDdEIsQ0FBQztBQUNMLEdBakI2QjtBQTJCdEIsSUFBTSxpQkFBaUIsNkJBQU07QUFDaEMsUUFBTSxZQUFZLFFBQVE7QUFDMUIsUUFBTSxLQUFLLFVBQVUsS0FBSyxFQUFFLGNBQWMsRUFBRTtBQUM1QyxVQUFRLElBQUksZ0JBQWdCLEVBQUU7QUFDOUIsU0FBTztBQUNYLEdBTDhCOzs7QUN6SDlCLElBQUksVUFBbUI7QUFDdkIsSUFBSSxjQUFzQjtBQUMxQixJQUFJLE1BQXFCO0FBQ3pCLElBQUksU0FBaUI7QUFDckIsSUFBSSxTQUFpQjtBQUNyQixJQUFJLGVBQStCO0FBQ25DLElBQUksU0FBd0I7QUFDNUIsSUFBSSxjQUF1QjtBQUMzQixJQUFJLFFBQWdCO0FBQ3BCLElBQUksY0FBaUM7QUFDckMsSUFBSTtBQUVKLElBQU0sY0FBMkI7QUFBQSxFQUNoQyxNQUFNO0FBQUEsRUFDTixPQUFPO0FBQUEsRUFDUCxNQUFNO0FBQ1A7QUFFQSxJQUFNLE1BQU0sd0JBQUMsWUFBNEI7QUFDeEMsU0FBTyxLQUFLLElBQUssVUFBVSxLQUFLLEtBQU0sR0FBRztBQUMxQyxHQUZZO0FBSVosSUFBTSxNQUFNLHdCQUFDLFlBQTRCO0FBQ3hDLFNBQU8sS0FBSyxJQUFLLFVBQVUsS0FBSyxLQUFNLEdBQUc7QUFDMUMsR0FGWTtBQUlaLElBQU0sWUFBWSw2QkFBZ0I7QUFDakMsUUFBTSxLQUNILElBQUksTUFBTSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksTUFBTSxLQUFLLElBQzNEO0FBQ0QsUUFBTSxLQUNILElBQUksTUFBTSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksTUFBTSxLQUFLLElBQzNEO0FBQ0QsUUFBTSxJQUFJLElBQUksTUFBTSxJQUFJO0FBRXhCLFNBQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNoQixHQVZrQjtBQVlsQixJQUFNLGlCQUFpQix3QkFBQyxRQUFpQixXQUEwQjtBQUNsRSxNQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQjtBQUFhO0FBRTlDLFdBQVMsVUFBVTtBQUNuQixXQUFTLFVBQVU7QUFFbkIsWUFBVTtBQUNWLFlBQVU7QUFDVixXQUFTLEtBQUssSUFBSSxLQUFLLElBQUksUUFBUSxDQUFHLEdBQUcsRUFBSTtBQUU3QyxRQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxVQUFVO0FBRTVCO0FBQUEsSUFDQztBQUFBLElBQ0EsYUFBYSxJQUFJO0FBQUEsSUFDakIsYUFBYSxJQUFJO0FBQUEsSUFDakIsYUFBYSxJQUFJO0FBQUEsRUFDbEI7QUFDQSxrQkFBZ0IsS0FBSyxhQUFhLEdBQUcsYUFBYSxHQUFHLGFBQWEsQ0FBQztBQUNwRSxHQW5CdUI7QUFxQnZCLElBQU0sYUFBYSw4QkFBTyxRQUFpQixhQUFzQjtBQUNoRSxRQUFNLFVBQWtCLGlCQUFpQixHQUFHLElBQUk7QUFDaEQsYUFBVyxZQUFZO0FBRXZCLGdCQUFjO0FBQ2QsZ0JBQWM7QUFDZCxXQUFTO0FBRVQsUUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksVUFBVTtBQUU1QixRQUFNLFNBQWlCO0FBQUEsSUFDdEI7QUFBQSxJQUNBLE9BQU8sSUFBSTtBQUFBLElBQ1gsT0FBTyxJQUFJO0FBQUEsSUFDWCxPQUFPLElBQUk7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNEO0FBRUEsaUJBQWU7QUFDZixnQkFBYztBQUNkLFdBQVM7QUFDVCxRQUFNO0FBRU4sa0JBQWdCLFFBQVEsT0FBTyxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDcEQseUJBQXVCLFFBQVEsUUFBUSxLQUFLLEdBQUcsQ0FBQztBQUVoRCxRQUFNLE1BQU0sR0FBRztBQUVmLDBCQUF3QixRQUFRLElBQUk7QUFDcEMsZ0JBQWMsUUFBUSxHQUFHO0FBQ3pCLGVBQWEsUUFBUSxHQUFHO0FBQ3hCLG9CQUFrQixRQUFRLEdBQUc7QUFDN0IsV0FBUyxNQUFNO0FBRWYsYUFBVyxRQUFRLElBQUk7QUFDeEIsR0F4Q21CO0FBMENuQixJQUFNLFdBQVcsd0JBQUMsZUFBdUI7QUFDeEMsTUFBSSxFQUFFLGFBQWEsR0FBRyxLQUFLLGNBQWM7QUFBTTtBQUMvQyxjQUFZO0FBQ1osYUFBVyxVQUFVLENBQUM7QUFDdkIsR0FKaUI7QUFNVixJQUFNLGNBQWMsOEJBQU9DLFNBQWdCO0FBQ2pELE1BQUk7QUFBUztBQUNiLEVBQUFBLE9BQU1BO0FBQ04sWUFBVTtBQUNWLGdCQUFjO0FBQ2QsUUFBTSxVQUFVLDJCQUEyQixJQUFJO0FBQy9DLFFBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFjLGlCQUFpQkEsTUFBSyxPQUFPLEdBQUssR0FBSyxDQUFHO0FBQ3RFLGNBQVksS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUN4QixtQkFBaUIsTUFBTSxNQUFNLEtBQU0sTUFBTSxJQUFJO0FBQzdDLGFBQVcsRUFBRSxHQUFNLEdBQU0sRUFBSyxHQUFHLFdBQVc7QUFDN0MsR0FWMkI7QUFZcEIsSUFBTSxhQUFhLDZCQUFZO0FBQ3JDLE1BQUksQ0FBQztBQUFTO0FBQ2QsWUFBVTtBQUVWLG1CQUFpQixPQUFPLE1BQU0sS0FBSyxNQUFNLEtBQUs7QUFDOUMsYUFBVyxLQUFLLElBQUk7QUFDcEIsUUFBTTtBQUNOLGlCQUFlO0FBQ2hCLEdBUjBCO0FBVTFCLElBQU0sWUFBWSx3QkFBQyxTQUFtQztBQUNyRCxRQUFNLE9BQTJCLFlBQVksSUFBSTtBQUNqRCxNQUFJLGVBQWU7QUFBTTtBQUV6QixRQUFNLFlBQVk7QUFDbEIsUUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQWMsT0FDekIsaUJBQWlCLEtBQUssTUFBTSxHQUFLLEdBQUssU0FBUyxRQUFRLE1BQU0sQ0FBRyxJQUNoRSxnQkFBZ0IsS0FBSyxLQUFLO0FBRTdCO0FBQUEsSUFDQztBQUFBLE1BQ0M7QUFBQSxNQUNBO0FBQUEsTUFDQSxHQUFHLElBQUk7QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLEVBQ0Q7QUFFQSxnQkFBYztBQUNmLEdBbkJrQjtBQXFCbEIsd0RBQXFDLENBQUMsTUFBTSxPQUFPO0FBQ2xELEtBQUcsQ0FBQztBQUNKLE1BQUksVUFBa0IsaUJBQWlCLEdBQUc7QUFDMUMsTUFBSSxTQUFTLEtBQUssR0FBRztBQUNwQjtBQUFBLEVBQ0Q7QUFDQSxZQUFVLEtBQUssSUFBSSxRQUFRLFVBQVUsSUFBSSxVQUFVO0FBQ25ELG1CQUFpQixLQUFLLE9BQU87QUFDOUIsQ0FBQztBQUVELDREQUF1QyxDQUFDLE1BQWMsT0FBaUI7QUFDdEUsVUFBUSxNQUFNO0FBQUEsSUFDYixLQUFLO0FBQ0osZ0JBQVU7QUFDVjtBQUFBLElBQ0QsS0FBSztBQUNKLGdCQUFVLE1BQU07QUFDaEI7QUFBQSxJQUNELEtBQUs7QUFDSixnQkFBVSxNQUFNO0FBQ2hCO0FBQUEsRUFDRjtBQUNBLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCx3REFBcUMsQ0FBQyxNQUFNLE9BQU87QUFDbEQsTUFBSSxTQUFTLFFBQVE7QUFDcEIsVUFBTSxjQUFzQixjQUFjO0FBQzFDLGtCQUFjLGVBQWUsSUFBTSxJQUFNO0FBQUEsRUFDMUMsV0FBVyxTQUFTLE1BQU07QUFDekIsVUFBTSxjQUFzQixjQUFjO0FBQzFDLGtCQUFjLGVBQWUsT0FBTyxPQUFPO0FBQUEsRUFDNUM7QUFFQSxnQkFBYztBQUNkLGlCQUFlO0FBQ2YsS0FBRyxDQUFDO0FBQ0wsQ0FBQzs7O0FDL0xELElBQU8sZUFBUTtBQUFBLEVBQ1g7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0o7OztBQ2ZBLElBQU8sZUFBUTtBQUFBLEVBQ1g7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0o7OztBQ3JCQSxJQUFPLG9CQUFRO0FBQUEsRUFDWDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0o7OztBQ2JBLElBQU8sZ0JBQVE7QUFBQSxFQUNYO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKOzs7QUNITyxTQUFTLGVBQWdCLFFBQWdCO0FBQzVDLFFBQU1DLFVBQVMsUUFBUTtBQUN2QixRQUFNLFNBQVNBLFFBQU8sT0FBTztBQUU3QixTQUFPLE9BQU8sVUFBVSxDQUFDLFVBQVUsV0FBVyxLQUFLLE1BQU8sTUFBTTtBQUNwRTtBQUxnQjtBQU9ULFNBQVMsUUFBU0MsTUFBd0I7QUFDN0MsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBQ3pCLFNBQU87QUFBQSxJQUNILE9BQU8sZ0JBQWdCQSxJQUFHO0FBQUEsSUFDMUIsV0FBVyx5QkFBeUJBLElBQUc7QUFBQSxFQUMzQztBQUNKO0FBTmdCO0FBUVQsU0FBUyxpQkFBaUJBLE1BQWE7QUFDMUMsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBRXpCLFFBQU0sZ0JBQWdCLFFBQVEsY0FBYyxpQkFBaUJBLElBQUc7QUFFaEUsU0FBTztBQUFBLElBQ0gsWUFBWSxjQUFjO0FBQUE7QUFBQSxJQUMxQixhQUFhLGNBQWM7QUFBQTtBQUFBLElBQzNCLFlBQVksY0FBYztBQUFBLElBRTFCLFdBQVcsY0FBYztBQUFBLElBQ3pCLFlBQVksY0FBYztBQUFBLElBQzFCLFdBQVcsY0FBYztBQUFBLElBRXpCLFVBQVUsY0FBYztBQUFBO0FBQUEsSUFFeEIsVUFBVSxjQUFjO0FBQUEsSUFDeEIsU0FBUyxjQUFjO0FBQUE7QUFBQSxJQUV2QixXQUFXLGNBQWM7QUFBQSxFQUM3QjtBQUNKO0FBckJnQjtBQXVCVCxTQUFTLGVBQWVBLE1BQWE7QUFDeEMsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBRXpCLE1BQUksU0FBNEIsQ0FBQztBQUNqQyxNQUFJLFdBQXlCLENBQUM7QUFFOUIsV0FBUyxJQUFJLEdBQUcsSUFBSSxhQUFjLFFBQVEsS0FBSztBQUMzQyxVQUFNLFVBQVUsYUFBYyxDQUFDO0FBQy9CLFdBQU8sT0FBTyxJQUFJLHdCQUF3QixDQUFDO0FBRTNDLFFBQUksWUFBWSxZQUFZO0FBQ3hCLGVBQVMsT0FBTyxJQUFJO0FBQUEsUUFDaEIsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsY0FBYyxlQUFlQSxJQUFHO0FBQUEsTUFDcEM7QUFBQSxJQUNKLE9BQU87QUFDSCxZQUFNLENBQUMsR0FBRyxjQUFjLFlBQVksWUFBWSxhQUFhLGNBQWMsSUFBSSxzQkFBc0JBLE1BQUssQ0FBQztBQUMzRyxlQUFTLE9BQU8sSUFBSTtBQUFBLFFBQ2hCLElBQUk7QUFBQSxRQUNKLE9BQU8sSUFBSTtBQUFBLFFBQ1gsY0FBYyxpQkFBaUIsTUFBTSxLQUFLO0FBQUEsUUFDMUM7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxTQUFPLENBQUMsVUFBVSxNQUFNO0FBQzVCO0FBL0JnQjtBQWlDVCxTQUFTLGlCQUFpQkEsTUFBYTtBQUMxQyxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFFekIsUUFBTSxXQUFXLGVBQWVBLElBQUc7QUFFbkMsTUFBSSxhQUFhLFdBQVcsa0JBQWtCLEtBQUssYUFBYSxXQUFXLGtCQUFrQjtBQUFHO0FBRWhHLE1BQUksYUFBYSxDQUFDO0FBQ2xCLFdBQVMsSUFBSSxHQUFHLElBQUksYUFBYyxRQUFRLEtBQUs7QUFDM0MsVUFBTSxVQUFVLGFBQWMsQ0FBQztBQUMvQixlQUFXLE9BQU8sSUFBSTtBQUFBLE1BQ2xCLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8sa0JBQWtCQSxNQUFLLENBQUM7QUFBQSxJQUNuQztBQUFBLEVBQ0o7QUFFQSxTQUFPO0FBQ1g7QUFsQmdCO0FBb0JULFNBQVMsYUFBYUEsTUFBYTtBQUN0QyxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFFekIsTUFBSSxZQUFZLENBQUM7QUFDakIsTUFBSSxpQkFBaUIsQ0FBQztBQUV0QixXQUFTLElBQUksR0FBRyxJQUFJLGtCQUFlLFFBQVEsS0FBSztBQUM1QyxVQUFNLE9BQU8sa0JBQWUsQ0FBQztBQUM3QixVQUFNLFVBQVUsd0JBQXdCQSxNQUFLLENBQUM7QUFFOUMsbUJBQWUsSUFBSSxJQUFJO0FBQUEsTUFDbkIsSUFBSTtBQUFBLE1BQ0osT0FBTztBQUFBLE1BQ1AsT0FBTyxpQ0FBaUNBLE1BQUssQ0FBQztBQUFBLE1BQzlDLFVBQVUsZ0NBQWdDQSxNQUFLLEdBQUcsT0FBTztBQUFBLElBQzdEO0FBQ0EsY0FBVSxJQUFJLElBQUk7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8sd0JBQXdCQSxNQUFLLENBQUM7QUFBQSxNQUNyQyxTQUFTLHVCQUF1QkEsTUFBSyxDQUFDO0FBQUEsSUFDMUM7QUFBQSxFQUNKO0FBRUEsU0FBTyxDQUFDLFdBQVcsY0FBYztBQUNyQztBQXpCZ0I7QUEyQlQsU0FBUyxTQUFTQSxNQUFhO0FBQ2xDLEVBQUFBLE9BQU1BLFFBQU8sWUFBWTtBQUV6QixNQUFJLFFBQVEsQ0FBQztBQUNiLE1BQUksYUFBYSxDQUFDO0FBRWxCLFdBQVMsSUFBSSxHQUFHLElBQUksY0FBVyxRQUFRLEtBQUs7QUFDeEMsVUFBTSxPQUFPLGNBQVcsQ0FBQztBQUN6QixVQUFNLFVBQVUsZ0JBQWdCQSxNQUFLLENBQUM7QUFFdEMsZUFBVyxJQUFJLElBQUk7QUFBQSxNQUNmLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8scUNBQXFDQSxNQUFLLENBQUM7QUFBQSxNQUNsRCxVQUFVLG9DQUFvQ0EsTUFBSyxHQUFHLE9BQU87QUFBQSxJQUNqRTtBQUVBLFVBQU0sSUFBSSxJQUFJO0FBQUEsTUFDVixJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxPQUFPLGdCQUFnQkEsTUFBSyxDQUFDO0FBQUEsTUFDN0IsU0FBUyx1QkFBdUJBLE1BQUssQ0FBQztBQUFBLElBQzFDO0FBQUEsRUFDSjtBQUVBLFNBQU8sQ0FBQyxPQUFPLFVBQVU7QUFDN0I7QUExQmdCO0FBNkJoQixlQUFzQixjQUFjQSxNQUFtQztBQUNuRSxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFDekIsUUFBTSxDQUFDLFVBQVUsTUFBTSxJQUFJLGVBQWVBLElBQUc7QUFDN0MsUUFBTSxDQUFDLFdBQVcsU0FBUyxJQUFJLGFBQWFBLElBQUc7QUFDL0MsUUFBTSxDQUFDLE9BQU8sU0FBUyxJQUFJLFNBQVNBLElBQUc7QUFDdkMsUUFBTSxRQUFRLGVBQWVBLElBQUc7QUFFaEMsU0FBTztBQUFBLElBQ0gsWUFBWSxlQUFlLEtBQUs7QUFBQSxJQUNoQztBQUFBLElBQ0EsV0FBVyxRQUFRQSxJQUFHO0FBQUEsSUFDdEIsV0FBVyxpQkFBaUJBLElBQUc7QUFBQSxJQUMvQixhQUFhO0FBQUEsSUFDYixrQkFBa0I7QUFBQSxJQUNsQixlQUFlLGlCQUFpQkEsSUFBRztBQUFBLElBQ25DO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxTQUFTLENBQUM7QUFBQSxFQUNkO0FBQ0o7QUFyQnNCO0FBc0J0QixRQUFRLGlCQUFpQixhQUFhO0FBRS9CLFNBQVMsY0FBY0EsTUFBYTtBQUN2QyxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFFekIsUUFBTSxDQUFDLFdBQVcsU0FBUyxJQUFJLGFBQWFBLElBQUc7QUFDL0MsUUFBTSxDQUFDLE9BQU8sU0FBUyxJQUFJLFNBQVNBLElBQUc7QUFDdkMsUUFBTSxDQUFDLFVBQVUsTUFBTSxJQUFJLGVBQWVBLElBQUc7QUFFN0MsU0FBTztBQUFBLElBQ0gsYUFBYTtBQUFBLElBQ2I7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUNKO0FBWmdCO0FBYWhCLFFBQVEsaUJBQWlCLGFBQWE7QUFFL0IsU0FBUyxXQUFXQSxNQUFhO0FBQ3BDLEVBQUFBLE9BQU1BLFFBQU8sWUFBWTtBQUV6QixTQUFPO0FBQUEsSUFDSCxXQUFXLGlCQUFpQkEsSUFBRztBQUFBLElBQy9CLGVBQWUsaUJBQWlCQSxJQUFHO0FBQUEsSUFDbkMsV0FBVyxRQUFRQSxJQUFHO0FBQUEsSUFDdEIsT0FBUSxlQUFlQSxJQUFHO0FBQUEsRUFDOUI7QUFDSjtBQVRnQjtBQVVoQixRQUFRLGNBQWMsVUFBVTtBQUV6QixTQUFTLGdCQUFnQjtBQUM1QixNQUFJLGNBQWMsQ0FBQztBQUVuQixRQUFNLENBQUMsYUFBYSxpQkFBaUIsSUFBSSxRQUFRLGNBQWMsUUFBUTtBQUN2RSxXQUFTLElBQUksR0FBRyxJQUFJLGtCQUFrQixRQUFRLEtBQUs7QUFDL0MsVUFBTSxXQUFXLGtCQUFrQixDQUFDO0FBQ3BDLFVBQU0sT0FBTyxTQUFTO0FBQ3RCLFVBQU0sUUFBUSxTQUFTO0FBQ3ZCLFVBQU0sUUFBUSxTQUFTO0FBQ3ZCLGdCQUFZLEtBQUssSUFBSTtBQUFBLE1BQ2pCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsV0FBVztBQUFBLE1BQ1gsTUFBTSxDQUFDO0FBQUEsSUFDWDtBQUVBLGFBQVMsSUFBSSxHQUFHLElBQUksWUFBWSxRQUFRLEtBQUs7QUFDekMsWUFBTSxVQUFVLFlBQVksQ0FBQztBQUM3QixrQkFBWSxLQUFLLEVBQUUsS0FBSyxLQUFLO0FBQUEsUUFDekIsT0FBTyxRQUFRO0FBQUEsUUFDZixVQUFVO0FBQUEsUUFDVixTQUFTLENBQUM7QUFBQSxNQUNkLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQUVBLFFBQU0sV0FBVyxlQUFlLFlBQVksQ0FBQyxNQUFNLFdBQVcsa0JBQWtCO0FBRWhGLFdBQVMsSUFBSSxHQUFHLElBQUksWUFBWSxRQUFRLEtBQUs7QUFDekMsVUFBTSxPQUFPLFlBQVksQ0FBQztBQUMxQixVQUFNLEVBQUUsS0FBSyxRQUFRLElBQUk7QUFDekIsVUFBTSxVQUFVLFdBQVcsR0FBRztBQUM5QixhQUFTLElBQUksR0FBRyxJQUFJLFFBQVEsUUFBUSxLQUFLO0FBQ3JDLFlBQU0sYUFBYSxRQUFRLENBQUM7QUFDNUIsVUFBSSxTQUFTO0FBRWIsWUFBTSxjQUFjLFdBQVcsWUFBWTtBQUMzQyxZQUFNLGlCQUFpQixZQUFZLFNBQVMsSUFBSTtBQUNoRCxVQUFJLGtCQUFrQixVQUFVO0FBQzVCLGlCQUFTO0FBQUEsTUFDYixXQUFXLENBQUMsa0JBQWtCLENBQUMsVUFBVTtBQUNyQyxpQkFBUztBQUFBLE1BQ2I7QUFFQSxVQUFJLE9BQU87QUFDWCxVQUFJLE9BQU87QUFFWCxVQUFJLFFBQVE7QUFDUixlQUFPLFdBQVcsTUFBTTtBQUN4QixlQUFPLCtCQUErQixTQUFTLElBQUk7QUFBQSxNQUN2RDtBQUVBLFVBQUksU0FBUyxNQUFNLE1BQU07QUFDckIsY0FBTSxjQUFjLFlBQVksSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBRTlDLG9CQUFZLEtBQUs7QUFBQSxVQUNiLE9BQU87QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxTQUFPO0FBQ1g7QUFsRWdCOzs7QUMxTWhCLElBQU8sa0JBQVE7QUFBQSxFQUNYLE1BQU07QUFBQSxJQUNGLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0gsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLEVBQ1Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxFQUNUO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsRUFDVDtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0YsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLEVBQ1Q7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxFQUNUO0FBQ0o7OztBQzlCTyxTQUFTLFlBQVlDLE1BQWEsTUFBYztBQUNuRCxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFFekIsMkJBQXlCQSxNQUFLLEtBQUssT0FBTyxLQUFLLE9BQU8sS0FBSyxTQUFTLENBQUM7QUFDekU7QUFKZ0I7QUFNVCxTQUFTLFFBQVFBLE1BQWEsTUFBYztBQUMvQyxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFFekIsTUFBSSxLQUFLLFVBQVUsSUFBSTtBQUNuQixpQkFBYUEsTUFBSyxLQUFLLEtBQUs7QUFDNUI7QUFBQSxFQUNKO0FBRUEsa0JBQWdCQSxNQUFLLEtBQUssT0FBTyxLQUFLLE9BQU8sS0FBSyxTQUFTLEtBQUs7QUFDcEU7QUFUZ0I7QUFZVCxJQUFNLFdBQVcsOEJBQU9BLE1BQWEsU0FBUztBQUNqRCxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFDekIsUUFBTSxjQUFjLE9BQU8sU0FBUztBQUNwQyxRQUFNLFFBQVEsY0FBYyxPQUFPLEtBQUs7QUFDeEMsUUFBTSxXQUFXLGFBQWFBLElBQUc7QUFFakMsTUFBSSxVQUFVO0FBQ1YsVUFBTSxZQUFZLE1BQU0sYUFBYSxLQUFLO0FBQzFDLG1CQUFlLFNBQVMsR0FBRyxTQUFTO0FBQ3BDLDZCQUF5QixTQUFTO0FBQ2xDLElBQUFBLE9BQU0sWUFBWTtBQUFBLEVBQ3RCO0FBQ0Esa0NBQWdDQSxJQUFHO0FBRW5DLE1BQUksQ0FBQyxlQUFlLEtBQUssYUFBYSxPQUFPLEtBQUssS0FBSyxTQUFTLEVBQUU7QUFBUSxpQkFBYUEsTUFBSyxLQUFLLFNBQVM7QUFDMUcsU0FBT0E7QUFDWCxHQWhCd0I7QUFrQmpCLFNBQVMsZUFBZUEsTUFBYSxNQUFjO0FBQ3RELEVBQUFBLE9BQU1BLFFBQU8sWUFBWTtBQUN6QixvQkFBa0JBLE1BQUssS0FBSyxPQUFPLEtBQUssUUFBUSxDQUFHO0FBQ3ZEO0FBSGdCO0FBS2hCLElBQU0sYUFBYSx3QkFBQyxRQUFnQixPQUFPLElBQUksTUFBTSxHQUFsQztBQUVaLFNBQVMsYUFBYUEsTUFBYSxNQUFNO0FBQzVDLEVBQUFBLE9BQU1BLFFBQU8sWUFBWTtBQUV6QixRQUFNLGFBQWEsV0FBVyxLQUFLLFVBQVU7QUFDN0MsUUFBTSxjQUFjLFdBQVcsS0FBSyxXQUFXO0FBQy9DLFFBQU0sYUFBYSxXQUFXLEtBQUssVUFBVTtBQUM3QyxRQUFNLFlBQVksV0FBVyxLQUFLLFNBQVM7QUFDM0MsUUFBTSxhQUFhLFdBQVcsS0FBSyxVQUFVO0FBQzdDLFFBQU0sWUFBWSxXQUFXLEtBQUssU0FBUztBQUMzQyxRQUFNLFdBQVcsS0FBSyxXQUFXO0FBQ2pDLFFBQU0sVUFBVSxLQUFLLFVBQVU7QUFDL0IsUUFBTSxXQUFXLEtBQUssV0FBVztBQUNqQyxRQUFNLFlBQVksS0FBSztBQUV2QjtBQUFBLElBQW9CQTtBQUFBLElBQUs7QUFBQSxJQUFZO0FBQUEsSUFBYTtBQUFBLElBQVk7QUFBQSxJQUFXO0FBQUEsSUFBWTtBQUFBLElBQVc7QUFBQSxJQUFVO0FBQUEsSUFDdEc7QUFBQSxJQUFVO0FBQUEsRUFBUztBQUMzQjtBQWhCZ0I7QUFrQlQsU0FBUyxlQUFlQSxNQUFhLE1BQU07QUFDOUMsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBQ3pCLFFBQU0sUUFBUSxLQUFLO0FBRW5CLE1BQUksVUFBVSxJQUFJO0FBQ2QsbUJBQWVBLE1BQUssS0FBSyxLQUFLO0FBQzlCO0FBQUEsRUFDSjtBQUVBLFFBQU0sUUFBUSxLQUFLLGlCQUFpQixLQUFLLE1BQU0sS0FBSztBQUVwRCxvQkFBa0JBLE1BQUssT0FBTyxPQUFPLEtBQUssaUJBQWlCLENBQUc7QUFDOUQseUJBQXVCQSxNQUFLLE9BQU8sR0FBRyxLQUFLLFlBQVksS0FBSyxXQUFXO0FBQzNFO0FBYmdCO0FBdUNULFNBQVMsYUFBYSxNQUFNO0FBQy9CLFFBQU1BLE9BQU0sWUFBWTtBQUN4QixRQUFNLFlBQVksS0FBSztBQUN2QixRQUFNLFFBQVEsS0FBSztBQUVuQixhQUFXLENBQUMsWUFBWSxVQUFVLEtBQUssT0FBTyxRQUFRLGVBQWMsR0FBRztBQUNuRSxVQUFNLGFBQWEsV0FBVztBQUM5QixVQUFNLFFBQVEsV0FBVztBQUV6QixRQUFJLGVBQWUsY0FBYyxVQUFVLFVBQVUsR0FBRztBQUNwRCxZQUFNLGtCQUFrQix3QkFBd0JBLE1BQUssS0FBSztBQUMxRCxVQUFJLG9CQUFvQixVQUFVLFVBQVUsRUFBRSxPQUFPO0FBQ2pELGlDQUF5QkEsTUFBSyxPQUFPLFVBQVUsVUFBVSxFQUFFLE9BQU8sR0FBRyxDQUFDO0FBQUEsTUFDMUU7QUFBQSxJQUNKLFdBQVcsZUFBZSxVQUFVLE1BQU0sVUFBVSxHQUFHO0FBQ25ELFlBQU0sY0FBYyxnQkFBZ0JBLE1BQUssS0FBSztBQUM5QyxVQUFJLGdCQUFnQixNQUFNLFVBQVUsRUFBRSxPQUFPO0FBQ3pDLHdCQUFnQkEsTUFBSyxPQUFPLE1BQU0sVUFBVSxFQUFFLE9BQU8sR0FBRyxLQUFLO0FBQUEsTUFDakU7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKO0FBckJnQjtBQXVCVCxTQUFTLGNBQWNBLE1BQWEsTUFBTTtBQUM3QyxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFFekIsUUFBTSxZQUFZLEtBQUs7QUFDdkIsUUFBTSxRQUFRLEtBQUs7QUFDbkIsUUFBTSxjQUFjLEtBQUs7QUFDekIsVUFBUSxJQUFJLGFBQWEsU0FBUztBQUNsQyxhQUFXLE1BQU0sV0FBVztBQUN4QixVQUFNLFdBQVcsVUFBVSxFQUFFO0FBQzdCLGdCQUFZQSxNQUFLLFFBQVE7QUFBQSxFQUM3QjtBQUVBLGFBQVcsTUFBTSxPQUFPO0FBQ3BCLFVBQU0sT0FBTyxNQUFNLEVBQUU7QUFDckIsWUFBUUEsTUFBSyxJQUFJO0FBQUEsRUFDckI7QUFFQSxhQUFXLE1BQU0sYUFBYTtBQUMxQixVQUFNLFVBQVUsWUFBWSxFQUFFO0FBQzlCLG1CQUFlQSxNQUFLLE9BQU87QUFBQSxFQUMvQjtBQUNKO0FBckJnQjtBQXVCVCxJQUFNLGFBQWEsOEJBQU9BLE1BQWEsU0FBUztBQUNuRCxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFDekIsUUFBTSxnQkFBZ0IsS0FBSztBQUMzQixRQUFNLFlBQVksS0FBSztBQUV2QixFQUFBQSxPQUFNLE1BQU0sU0FBU0EsTUFBSyxJQUFJO0FBQzlCLE1BQUksV0FBVztBQUNYLGlCQUFhQSxNQUFLLFNBQVM7QUFBQSxFQUMvQjtBQUNBLE1BQUksZUFBZTtBQUNmLGVBQVcsV0FBVyxlQUFlO0FBQ2pDLHFCQUFlQSxNQUFLLE9BQU87QUFBQSxJQUMvQjtBQUFBLEVBQ0o7QUFDSixHQWQwQjtBQWdCbkIsU0FBUyxjQUFjQSxNQUFhLE1BQU07QUFDN0MsTUFBSSxDQUFDO0FBQU07QUFDWCxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFFekIsUUFBTSxXQUFXLGFBQWFBLElBQUc7QUFDakMsTUFBSSxVQUFVO0FBQ1YsSUFBQUEsT0FBTSxZQUFZO0FBQUEsRUFDdEI7QUFFQSxnQ0FBOEJBLElBQUc7QUFFakMsV0FBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLFFBQVEsS0FBSztBQUNsQyxVQUFNLGFBQWEsS0FBSyxDQUFDLEVBQUU7QUFDM0IsUUFBSSxZQUFZO0FBQ1osWUFBTSxhQUFhLFdBQVcsV0FBVyxHQUFHO0FBQzVDLFlBQU0sU0FBUyxXQUFXO0FBQzFCLGlDQUEyQkEsTUFBSyxZQUFZLE1BQU07QUFBQSxJQUN0RDtBQUFBLEVBQ0o7QUFDSjtBQW5CZ0I7QUFxQlQsU0FBUyxpQkFBaUJBLE1BQWEsTUFBTTtBQUNoRCxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFFekIsUUFBTSxRQUFRLEtBQUs7QUFDbkIsUUFBTSxZQUFZLEtBQUs7QUFDdkIsa0JBQWdCQSxNQUFLLE9BQU8sU0FBUztBQUN6QztBQU5nQjtBQVFULFNBQVMsaUJBQWlCQSxNQUFhLE1BQU07QUFDaEQsYUFBV0EsTUFBSyxJQUFJO0FBQ3BCLGdCQUFjQSxNQUFLLElBQUk7QUFDdkIsbUJBQWlCQSxNQUFLLEtBQUssU0FBUztBQUNwQyxnQkFBY0EsTUFBSyxLQUFLLE9BQU87QUFDbkM7QUFMZ0I7QUFPVCxTQUFTLHVCQUF1QixNQUFNO0FBQ3pDLGFBQVcsWUFBWSxHQUFHLElBQUk7QUFDOUIsZ0JBQWMsWUFBWSxHQUFHLElBQUk7QUFDakMsbUJBQWlCLFlBQVksR0FBRyxLQUFLLFNBQVM7QUFDOUMsZ0JBQWMsWUFBWSxHQUFHLEtBQUssT0FBTztBQUM3QztBQUxnQjs7O0FDekxoQixzREFBb0MsQ0FBQyxZQUF5QixPQUFpQjtBQUM5RSx5QkFBdUIsVUFBVTtBQUNqQyxZQUFVO0FBQ1YsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVEO0FBQUE7QUFBQSxFQUVDLE9BQU8sWUFBeUIsT0FBaUI7QUFDMUMsWUFBUSxJQUFJLE1BQU07QUFDeEIsaUJBQWEsVUFBVTtBQUV2QixVQUFNLE1BQU0sR0FBRztBQUVmLFVBQU1DLE9BQU0sWUFBWTtBQUV4QixVQUFNLGdCQUFnQixNQUFNLGNBQWNBLElBQUc7QUFFN0MsVUFBTSxlQUFlLGVBQWU7QUFFcEM7QUFBQSxNQUNDO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNEO0FBRUEsa0JBQWNBLE1BQUssV0FBVyxPQUFPO0FBRXJDLGNBQVU7QUFDVixPQUFHLENBQUM7QUFBQSxFQUNMO0FBQ0Q7QUFFQSwwREFBc0MsT0FBTyxPQUFlLE9BQWlCO0FBQzVFLFFBQU0sT0FBTyxXQUFXLEtBQUs7QUFDN0IsTUFBSSxDQUFDLGlCQUFpQixJQUFJLEtBQUssQ0FBQyxhQUFhLElBQUksR0FBRztBQUNuRCxXQUFPLEdBQUcsQ0FBQztBQUFBLEVBQ1o7QUFFQSxRQUFNQSxPQUFNLFlBQVk7QUFFeEIsUUFBTSxTQUFTQSxNQUFLLElBQUk7QUFFeEIsUUFBTSxhQUFhLE1BQU0sY0FBY0EsSUFBRztBQUUxQyxhQUFXLFVBQVUsQ0FBQztBQUV0QixLQUFHLFVBQVU7QUFDZCxDQUFDO0FBRUQsd0VBQTZDLE9BQU8sR0FBUSxPQUFpQjtBQUM1RSxRQUFNLFVBQVUsY0FBYztBQUU5QixLQUFHLE9BQU87QUFDWCxDQUFDO0FBRUQ7QUFBQTtBQUFBLEVBRUMsT0FBTyxNQUFjLE9BQWlCO0FBQ3JDLFVBQU1BLE9BQU0sWUFBWTtBQUN4QixtQkFBZUEsTUFBSyxJQUFJO0FBQ3hCLE9BQUcsQ0FBQztBQUFBLEVBQ0w7QUFDRDtBQUVBO0FBQUE7QUFBQSxFQUVDLE9BQU8sTUFBYyxPQUFpQjtBQUNyQyxVQUFNQSxPQUFNLFlBQVk7QUFDeEIsbUJBQWVBLE1BQUssSUFBSTtBQUN4QixPQUFHLENBQUM7QUFBQSxFQUNMO0FBQ0Q7QUFFQTtBQUFBO0FBQUEsRUFFQyxPQUFPLE1BQWMsT0FBaUI7QUFDckMsVUFBTUEsT0FBTSxZQUFZO0FBQ3hCLGlCQUFhQSxNQUFLLElBQUk7QUFDdEIsT0FBRyxDQUFDO0FBQUEsRUFDTDtBQUNEO0FBRUEsOERBQXdDLE9BQU8sTUFBYyxPQUFpQjtBQUM3RSxRQUFNQSxPQUFNLFlBQVk7QUFDeEIsZ0JBQWNBLE1BQUssSUFBSTtBQUN2QixLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsd0RBQXFDLE9BQU8sTUFBYyxPQUFpQjtBQUMxRSxRQUFNQSxPQUFNLFlBQVk7QUFDeEIsVUFBUUEsTUFBSyxJQUFJO0FBQ2pCLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRCxnRUFBeUMsT0FBTyxNQUFjLE9BQWlCO0FBQzlFLFFBQU1BLE9BQU0sWUFBWTtBQUN4QixjQUFZQSxNQUFLLElBQUk7QUFDckIsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVEO0FBQUE7QUFBQSxFQUVDLE9BQU8sTUFBbUIsT0FBaUI7QUFDcEMsVUFBTSxPQUFPLGdCQUFlLEtBQUssSUFBSTtBQUMzQyxRQUFJLENBQUM7QUFBTSxhQUFPLEdBQUcsS0FBSztBQUUxQixVQUFNLFVBQVUsS0FBSztBQUNyQixVQUFNLE9BQU8sS0FBSztBQUNsQixVQUFNLFFBQVEsS0FBSztBQUVuQixRQUFJLENBQUM7QUFBUyxhQUFPLEdBQUcsS0FBSztBQUU3QixVQUFNQSxPQUFNLFlBQVk7QUFFeEIsUUFBSSxTQUFTLFFBQVE7QUFDcEIsWUFBTSxjQUFjLGdCQUFnQkEsTUFBSyxLQUFLO0FBRTlDLFVBQUksZ0JBQWdCLElBQUk7QUFDdkIsZ0JBQVFBLE1BQUssT0FBTztBQUNwQixXQUFHLEtBQUs7QUFDUjtBQUFBLE1BQ0QsT0FBTztBQUNOLHFCQUFhQSxNQUFLLEtBQUs7QUFDdkIsV0FBRyxJQUFJO0FBQ1A7QUFBQSxNQUNEO0FBQUEsSUFDRCxXQUFXLFNBQVMsWUFBWTtBQUN0QixZQUFNLGtCQUFrQix3QkFBd0JBLE1BQUssS0FBSztBQUUxRCxVQUFJLFFBQVEsVUFBVSxLQUFLLEtBQUs7QUFDNUIsV0FBRyxLQUFLO0FBQ1I7QUFBQSxNQUNKO0FBRUEsVUFBSSxRQUFRLFVBQVUsaUJBQWlCO0FBQ25DLGlDQUF5QkEsTUFBSyxPQUFPLEtBQUssS0FBSyxHQUFHLENBQUM7QUFDbkQsV0FBRyxJQUFJO0FBQ1A7QUFBQSxNQUNKLE9BQU87QUFDSCxvQkFBWUEsTUFBSyxPQUFPO0FBQ3hCLFdBQUcsS0FBSztBQUNSO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNQO0FBQ0Q7QUFFQSw4REFBd0MsT0FBTyxNQUFXLE9BQWlCO0FBQ3ZFLFFBQU0sZUFBZSxlQUFlO0FBQ3BDLFFBQU0sU0FBUyxNQUFNO0FBQUEsSUFDakI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFDQSxLQUFHLE1BQU07QUFDYixDQUFDO0FBRUQsa0VBQTBDLE9BQU8sSUFBWSxPQUFpQjtBQUMxRSxRQUFNLGVBQWUsZUFBZTtBQUNwQyxRQUFNLFNBQVMsTUFBTTtBQUFBLElBQ2pCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQ0EsS0FBRyxNQUFNO0FBQ2IsQ0FBQztBQUVELGtFQUEwQyxPQUFPLE1BQVcsT0FBaUI7QUFDekUsUUFBTSxlQUFlLGVBQWU7QUFDcEMsUUFBTSxTQUFTLE1BQU07QUFBQSxJQUNqQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUNBLEtBQUcsTUFBTTtBQUNiLENBQUM7QUFFRCw0REFBdUMsT0FBTyxRQUFnQixPQUFpQjtBQUMzRSxVQUFRLElBQUksYUFBYSxNQUFNO0FBQy9CLGdCQUFjLFlBQVksR0FBRyxNQUFNO0FBQ25DLEtBQUcsQ0FBQztBQUNSLENBQUM7OztBQ2pNRCxJQUFNLFNBQVMsUUFBUTtBQUN2QixJQUFJLFNBQVM7QUFHYixlQUFzQixTQUFTLE1BQWtCLFdBQW9CLE9BQU87QUFDeEUsUUFBTUMsT0FBTSxZQUFZO0FBRXhCLFFBQU0sY0FBYyxPQUFPLE1BQU07QUFFakMsUUFBTSxPQUFPLFlBQVksSUFBSTtBQUU3QixVQUFRLElBQUksYUFBYSxJQUFJO0FBRTdCLE1BQUksQ0FBQztBQUFNO0FBRVgsY0FBWUEsSUFBRztBQUVmLFFBQU0sZUFBZSxlQUFlO0FBRXBDLFFBQU0sT0FBTyxLQUFLO0FBRWxCLE1BQUksWUFBWSxLQUFLO0FBRXJCLFdBQVMsYUFBYUEsSUFBRztBQUV6QixVQUFRLElBQUksVUFBVSxNQUFNO0FBRTVCLE1BQUksVUFBVSxDQUFDO0FBRWYsUUFBTSxlQUFlLEtBQUssU0FBUyxTQUFTO0FBQzVDLE1BQUksY0FBYztBQUNkLGNBQVUsTUFBTSxzQkFBZ0MsbUNBQW1DLFlBQVk7QUFBQSxFQUNuRztBQUVBLE1BQUksU0FBUyxDQUFDO0FBRWQsUUFBTSxpQkFBaUIsS0FBSyxTQUFTLFVBQVU7QUFDL0MsTUFBSSxnQkFBZ0I7QUFDaEIsYUFBUyxPQUFPLE9BQU87QUFBQSxFQUMzQjtBQUVBLFFBQU0sZUFBZSxLQUFLLFNBQVMsU0FBUztBQUM1QyxNQUFJO0FBQ0osTUFBSSxjQUFjO0FBQ2QsY0FBVSxjQUFjO0FBQUEsRUFDNUI7QUFFQSxRQUFNLFlBQVksYUFBYSxJQUFJO0FBRW5DLFFBQU0sYUFBYSxNQUFNLGNBQWNBLElBQUc7QUFFMUMsVUFBUSxJQUFJLFlBQVk7QUFFeEIsTUFBSSxVQUFVO0FBQ1YsZ0JBQVk7QUFBQSxFQUNoQjtBQUVBLDZDQUF5QjtBQUFBLElBQ3JCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxRQUFRLE1BQU0sY0FBYyxRQUFRO0FBQUEsRUFDeEMsQ0FBQztBQUNELFVBQVEsSUFBSSxZQUFZLElBQUk7QUFDNUIsY0FBWSxNQUFNLElBQUk7QUFDdEIsbURBQTJCLElBQUk7QUFDbkM7QUFsRXNCO0FBb0V0QixTQUFTLGFBQWEsTUFBa0I7QUFDcEMsUUFBTSxZQUFZLE9BQU8sVUFBVTtBQUVuQyxTQUFPO0FBQ1g7QUFKUztBQU1GLFNBQVMsWUFBWTtBQUN4QixRQUFNQSxPQUFNLFlBQVk7QUFFeEIsZUFBYUEsTUFBSyxNQUFNO0FBRXhCLGFBQVc7QUFDWCxjQUFZLE9BQU8sS0FBSztBQUN4QixtREFBMkIsS0FBSztBQUNwQztBQVJnQjs7O0FDaEZoQixJQUFJLGFBQWdDO0FBRXBDLElBQU1DLFVBQVMsUUFBUSxjQUFjLE9BQU87QUFFNUMsZ0JBQWdCLFlBQVksTUFBTTtBQUM5QixXQUFTLFlBQVk7QUFDckIsVUFBUSxJQUFJLGFBQWE7QUFDM0IsR0FBRyxLQUFLO0FBR1YsUUFBUSxvQkFBb0IsQ0FBQ0MsTUFBYSxlQUE0QjtBQUNsRSxtQkFBaUJBLE1BQUssVUFBVTtBQUNwQyxDQUFDO0FBRUQsUUFBUSwwQkFBMEIsT0FBTyxnQkFBZ0I7QUFDckQsTUFBSTtBQUNKLE1BQUtELFFBQU8sd0JBQXdCO0FBQ2hDLFVBQU0sZ0JBQWdCLE1BQU0sc0JBQW1DLDhDQUE4QyxXQUFXO0FBRXhILFFBQUlBLFFBQU8sb0JBQW9CLFlBQVk7QUFDdkMsY0FBUSxxQkFBcUIsRUFBRSxpQkFBaUIsWUFBWSxHQUFHLGFBQWE7QUFBQSxJQUNoRixXQUFXQSxRQUFPLG9CQUFvQixNQUFNO0FBQ3hDLFdBQUsseUNBQXlDLGVBQWUsWUFBWSxDQUFDO0FBQUEsSUFDOUU7QUFFQSxVQUFNLE1BQU0sR0FBRztBQUVmLGlCQUFhLGNBQWMsWUFBWSxDQUFDO0FBQUEsRUFDNUM7QUFFQSxlQUFhLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQ3ZHLHlCQUF1QixVQUFVO0FBQ3JDLENBQUM7QUFFRCxRQUFRLDBCQUEwQixPQUFPLGdCQUFnQjtBQUNyRCxTQUFPLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQ3JHLENBQUM7QUFFRCxJQUFNLFFBQVEsUUFBUSxjQUFjLE1BQU07QUFDMUMsSUFBTSxhQUFhLFFBQVE7QUFHM0IsZ0JBQWdCLG1CQUFtQixNQUFNO0FBQ3JDLE1BQUksQ0FBQztBQUFZO0FBQ2pCLFdBQVMsVUFBVTtBQUN2QixHQUFHLEtBQUs7QUFHUixtQkFBbUIsbUJBQW1CLG1CQUFtQixZQUFZQSxRQUFPLFdBQVc7QUFFdkYsV0FBVyxXQUFXLE9BQU87QUFDekIsYUFBVyxPQUFPO0FBQUEsSUFDZCxRQUFRLFFBQVE7QUFBQSxJQUNoQixPQUFPO0FBQUEsSUFDUCxLQUFLQSxRQUFPO0FBQUEsSUFDWixVQUFVO0FBQUEsSUFDVixTQUFTLE1BQU0sYUFBYSxRQUFRO0FBQUEsSUFDcEMsUUFBUSxNQUFNLGFBQWE7QUFBQSxFQUMvQixDQUFDO0FBQ0w7IiwKICAibmFtZXMiOiBbImRlbGF5IiwgInBlZCIsICJjb25maWciLCAicGVkIiwgInBlZCIsICJwZWQiLCAicGVkIiwgImNvbmZpZyIsICJwZWQiXQp9Cg==
