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
  ped = PlayerPedId();
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
  ped = PlayerPedId();
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
  ped = PlayerPedId();
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
    setHeadOverlay(ped2, data);
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
  startCamera();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgZGVidWdkYXRhID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZGF0YSwgKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXG4vZywgXCJcXFxcblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfSwgMikpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZW5kTlVJRXZlbnQgPSAoYWN0aW9uOiBzdHJpbmcsIGRhdGE6IGFueSkgPT4ge1xyXG4gICAgU2VuZE5VSU1lc3NhZ2Uoe1xyXG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgIGRhdGE6IGRhdGFcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RNb2RlbCA9IGFzeW5jIChtb2RlbDogc3RyaW5nIHwgbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+ID0+IHtcclxuICAgIGxldCBtb2RlbEhhc2g6IG51bWJlciA9IHR5cGVvZiBtb2RlbCA9PT0gJ251bWJlcicgPyBtb2RlbCA6IEdldEhhc2hLZXkobW9kZWwpXHJcblxyXG4gICAgaWYgKCFJc01vZGVsVmFsaWQobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9fb3hfY2JfJHtyZXNvdXJjZU5hbWV9YCwgKGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnkpID0+IHtcclxuICAgIGNvbnN0IHJlc29sdmUgPSBhY3RpdmVFdmVudHNba2V5XTtcclxuICAgIHJldHVybiByZXNvbHZlICYmIHJlc29sdmUoLi4uYXJncyk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUID0gdW5rbm93bj4oXHJcbiAgICBldmVudE5hbWU6IHN0cmluZywgLi4uYXJnczogYW55XHJcbik6IFByb21pc2U8VD4gfCB2b2lkIHtcclxuICAgIGlmICghZXZlbnRUaW1lcihldmVudE5hbWUsIDApKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBrZXk6IHN0cmluZztcclxuXHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuXHJcbiAgICBlbWl0TmV0KGBfX294X2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vbG9jYWxlXHJcblxyXG5leHBvcnQgY29uc3QgcmVxdWVzdExvY2FsZSA9IChyZXNvdXJjZVNldE5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2hlY2tSZXNvdXJjZUZpbGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChSZXF1ZXN0UmVzb3VyY2VGaWxlU2V0KHJlc291cmNlU2V0TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRMYW4gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UuY29uZmlnKCkubG9jYWxlXHJcbiAgICAgICAgICAgICAgICBsZXQgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS8ke2N1cnJlbnRMYW59Lmpzb25gKTtcclxuICAgICAgICAgICAgICAgIGlmICghbG9jYWxlRmlsZUNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke2N1cnJlbnRMYW59Lmpzb24gbm90IGZvdW5kIGluIGxvY2FsZSwgcGxlYXNlIHZlcmlmeSEsIHdlIHVzZWQgZW5nbGlzaCBmb3Igbm93IWApXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS9lbi5qc29uYClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUobG9jYWxlRmlsZUNvbnRlbnQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChjaGVja1Jlc291cmNlRmlsZSwgMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjaGVja1Jlc291cmNlRmlsZSgpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBsb2NhbGUgPSBhc3luYyAoaWQ6IHN0cmluZywgLi4uYXJnczogc3RyaW5nW10pID0+IHtcclxuICAgIGNvbnN0IGxvY2FsZSA9IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpO1xyXG4gICAgbGV0IGFyZ0luZGV4ID0gMDtcclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSBsb2NhbGVbaWRdLnJlcGxhY2UoLyVzL2csIChtYXRjaDogc3RyaW5nKSA9PiBhcmdJbmRleCA8IGFyZ3MubGVuZ3RoID8gYXJnc1thcmdJbmRleF0gOiBtYXRjaCk7XHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRGcmFtZXdvcmtJRCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGJsX2JyaWRnZSA9IGV4cG9ydHMuYmxfYnJpZGdlXHJcbiAgICBjb25zdCBpZCA9IGJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpLmNpZFxyXG4gICAgY29uc29sZS5sb2coJ2ZyYW1ld29ya2RJZCcsIGlkKVxyXG4gICAgcmV0dXJuIGlkXHJcbn0iLCAiaW1wb3J0IHsgQ2FtZXJhLCBWZWN0b3IzLCBDYW1lcmFCb25lcyB9IGZyb20gJ0B0eXBpbmdzL2NhbWVyYSc7XHJcbmltcG9ydCB7IGRlbGF5IH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgUmVjZWl2ZSB9IGZyb20gJ0BldmVudHMnO1xyXG5cclxubGV0IHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGNhbURpc3RhbmNlOiBudW1iZXIgPSAxLjg7XHJcbmxldCBjYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgYW5nbGVZOiBudW1iZXIgPSAwLjA7XHJcbmxldCBhbmdsZVo6IG51bWJlciA9IDAuMDtcclxubGV0IHRhcmdldENvb3JkczogVmVjdG9yMyB8IG51bGwgPSBudWxsO1xyXG5sZXQgb2xkQ2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGNoYW5naW5nQ2FtOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBsYXN0WDogbnVtYmVyID0gMDtcclxubGV0IGN1cnJlbnRCb25lOiBrZXlvZiBDYW1lcmFCb25lcyA9ICdoZWFkJztcclxubGV0IHBlZDogbnVtYmVyXHJcblxyXG5jb25zdCBDYW1lcmFCb25lczogQ2FtZXJhQm9uZXMgPSB7XHJcblx0aGVhZDogMzEwODYsXHJcblx0dG9yc286IDI0ODE4LFxyXG5cdGxlZ3M6IDE0MjAxLFxyXG59O1xyXG5cclxuY29uc3QgY29zID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguY29zKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3Qgc2luID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguc2luKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0QW5nbGVzID0gKCk6IG51bWJlcltdID0+IHtcclxuXHRjb25zdCB4ID1cclxuXHRcdCgoY29zKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSArIGNvcyhhbmdsZVkpICogY29zKGFuZ2xlWikpIC8gMikgKlxyXG5cdFx0Y2FtRGlzdGFuY2U7XHJcblx0Y29uc3QgeSA9XHJcblx0XHQoKHNpbihhbmdsZVopICogY29zKGFuZ2xlWSkgKyBjb3MoYW5nbGVZKSAqIHNpbihhbmdsZVopKSAvIDIpICpcclxuXHRcdGNhbURpc3RhbmNlO1xyXG5cdGNvbnN0IHogPSBzaW4oYW5nbGVZKSAqIGNhbURpc3RhbmNlO1xyXG5cclxuXHRyZXR1cm4gW3gsIHksIHpdO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtUG9zaXRpb24gPSAobW91c2VYPzogbnVtYmVyLCBtb3VzZVk/OiBudW1iZXIpOiB2b2lkID0+IHtcclxuXHRpZiAoIXJ1bm5pbmcgfHwgIXRhcmdldENvb3JkcyB8fCBjaGFuZ2luZ0NhbSkgcmV0dXJuO1xyXG5cclxuXHRtb3VzZVggPSBtb3VzZVggPz8gMC4wO1xyXG5cdG1vdXNlWSA9IG1vdXNlWSA/PyAwLjA7XHJcblxyXG5cdGFuZ2xlWiAtPSBtb3VzZVg7XHJcblx0YW5nbGVZICs9IG1vdXNlWTtcclxuXHRhbmdsZVkgPSBNYXRoLm1pbihNYXRoLm1heChhbmdsZVksIDAuMCksIDg5LjApO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKTtcclxuXHJcblx0U2V0Q2FtQ29vcmQoXHJcblx0XHRjYW0sXHJcblx0XHR0YXJnZXRDb29yZHMueCArIHgsXHJcblx0XHR0YXJnZXRDb29yZHMueSArIHksXHJcblx0XHR0YXJnZXRDb29yZHMueiArIHpcclxuXHQpO1xyXG5cdFBvaW50Q2FtQXRDb29yZChjYW0sIHRhcmdldENvb3Jkcy54LCB0YXJnZXRDb29yZHMueSwgdGFyZ2V0Q29vcmRzLnopO1xyXG59O1xyXG5cclxuY29uc3QgbW92ZUNhbWVyYSA9IGFzeW5jIChjb29yZHM6IFZlY3RvcjMsIGRpc3RhbmNlPzogbnVtYmVyKSA9PiB7XHJcbiAgICBwZWQgPSBQbGF5ZXJQZWRJZCgpXHJcblx0Y29uc3QgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpICsgOTQ7XHJcblx0ZGlzdGFuY2UgPSBkaXN0YW5jZSA/PyAxLjA7XHJcblxyXG5cdGNoYW5naW5nQ2FtID0gdHJ1ZTtcclxuXHRjYW1EaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG5cdGFuZ2xlWiA9IGhlYWRpbmc7XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpO1xyXG5cclxuXHRjb25zdCBuZXdjYW06IENhbWVyYSA9IENyZWF0ZUNhbVdpdGhQYXJhbXMoXHJcblx0XHQnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLFxyXG5cdFx0Y29vcmRzLnggKyB4LFxyXG5cdFx0Y29vcmRzLnkgKyB5LFxyXG5cdFx0Y29vcmRzLnogKyB6LFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0NzAuMCxcclxuXHRcdGZhbHNlLFxyXG5cdFx0MFxyXG5cdCk7XHJcblxyXG5cdHRhcmdldENvb3JkcyA9IGNvb3JkcztcclxuXHRjaGFuZ2luZ0NhbSA9IGZhbHNlO1xyXG5cdG9sZENhbSA9IGNhbTtcclxuXHRjYW0gPSBuZXdjYW07XHJcblxyXG5cdFBvaW50Q2FtQXRDb29yZChuZXdjYW0sIGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnopO1xyXG5cdFNldENhbUFjdGl2ZVdpdGhJbnRlcnAobmV3Y2FtLCBvbGRDYW0sIDI1MCwgMCwgMCk7XHJcblxyXG5cdGF3YWl0IGRlbGF5KDI1MCk7XHJcblxyXG5cdFNldENhbVVzZVNoYWxsb3dEb2ZNb2RlKG5ld2NhbSwgdHJ1ZSk7XHJcblx0U2V0Q2FtTmVhckRvZihuZXdjYW0sIDAuNCk7XHJcblx0U2V0Q2FtRmFyRG9mKG5ld2NhbSwgMS4yKTtcclxuXHRTZXRDYW1Eb2ZTdHJlbmd0aChuZXdjYW0sIDAuMyk7XHJcblx0dXNlSGlEb2YobmV3Y2FtKTtcclxuXHJcblx0RGVzdHJveUNhbShvbGRDYW0sIHRydWUpO1xyXG59O1xyXG5cclxuY29uc3QgdXNlSGlEb2YgPSAoY3VycmVudGNhbTogQ2FtZXJhKSA9PiB7XHJcblx0aWYgKCEoRG9lc0NhbUV4aXN0KGNhbSkgJiYgY3VycmVudGNhbSA9PSBjYW0pKSByZXR1cm47XHJcblx0U2V0VXNlSGlEb2YoKTtcclxuXHRzZXRUaW1lb3V0KHVzZUhpRG9mLCAwKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdGFydENhbWVyYSA9ICgpID0+IHtcclxuXHRpZiAocnVubmluZykgcmV0dXJuO1xyXG4gICAgcGVkID0gUGxheWVyUGVkSWQoKVxyXG5cdHJ1bm5pbmcgPSB0cnVlO1xyXG5cdGNhbURpc3RhbmNlID0gMS4wO1xyXG5cdGNhbSA9IENyZWF0ZUNhbSgnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLCB0cnVlKTtcclxuXHRjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIDMxMDg2LCAwLjAsIDAuMCwgMC4wKTtcclxuXHRTZXRDYW1Db29yZChjYW0sIHgsIHksIHopO1xyXG5cdFJlbmRlclNjcmlwdENhbXModHJ1ZSwgdHJ1ZSwgMTAwMCwgdHJ1ZSwgdHJ1ZSk7XHJcblx0bW92ZUNhbWVyYSh7IHg6IHgsIHk6IHksIHo6IHogfSwgY2FtRGlzdGFuY2UpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0b3BDYW1lcmEgPSAoKTogdm9pZCA9PiB7XHJcblx0aWYgKCFydW5uaW5nKSByZXR1cm47XHJcblx0cnVubmluZyA9IGZhbHNlO1xyXG5cclxuXHRSZW5kZXJTY3JpcHRDYW1zKGZhbHNlLCB0cnVlLCAyNTAsIHRydWUsIGZhbHNlKTtcclxuXHREZXN0cm95Q2FtKGNhbSwgdHJ1ZSk7XHJcblx0Y2FtID0gbnVsbDtcclxuXHR0YXJnZXRDb29yZHMgPSBudWxsO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtZXJhID0gKHR5cGU/OiBrZXlvZiBDYW1lcmFCb25lcyk6IHZvaWQgPT4ge1xyXG5cdGNvbnN0IGJvbmU6IG51bWJlciB8IHVuZGVmaW5lZCA9IENhbWVyYUJvbmVzW3R5cGVdO1xyXG5cdGlmIChjdXJyZW50Qm9uZSA9PSB0eXBlKSByZXR1cm47XHJcblxyXG5cdHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0Y29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IGJvbmVcclxuXHRcdD8gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmUsIDAuMCwgMC4wLCBib25lID09PSAxNDIwMSA/IDAuMiA6IDAuMClcclxuXHRcdDogR2V0RW50aXR5Q29vcmRzKHBlZCwgZmFsc2UpO1xyXG5cclxuXHRtb3ZlQ2FtZXJhKFxyXG5cdFx0e1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5LFxyXG5cdFx0XHR6OiB6ICsgMC4wLFxyXG5cdFx0fSxcclxuXHRcdDEuMFxyXG5cdCk7XHJcblxyXG5cdGN1cnJlbnRCb25lID0gdHlwZTtcclxufTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1Nb3ZlLCAoZGF0YSwgY2IpID0+IHtcclxuXHRjYigxKTtcclxuICAgIHBlZCA9IFBsYXllclBlZElkKClcclxuXHRsZXQgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpO1xyXG5cdGlmIChsYXN0WCA9PSBkYXRhLngpIHtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0aGVhZGluZyA9IGRhdGEueCA+IGxhc3RYID8gaGVhZGluZyArIDUgOiBoZWFkaW5nIC0gNTtcclxuXHRTZXRFbnRpdHlIZWFkaW5nKHBlZCwgaGVhZGluZyk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVNjcm9sbCwgKHR5cGU6IG51bWJlciwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c3dpdGNoICh0eXBlKSB7XHJcblx0XHRjYXNlIDI6XHJcblx0XHRcdHNldENhbWVyYSgpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdGNhc2UgMTpcclxuXHRcdFx0c2V0Q2FtZXJhKCdsZWdzJyk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAzOlxyXG5cdFx0XHRzZXRDYW1lcmEoJ2hlYWQnKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0fVxyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1ab29tLCAoZGF0YSwgY2IpID0+IHtcclxuXHRpZiAoZGF0YSA9PT0gJ2Rvd24nKSB7XHJcblx0XHRjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgKyAwLjA1O1xyXG5cdFx0Y2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA+PSAxLjAgPyAxLjAgOiBuZXdEaXN0YW5jZTtcclxuXHR9IGVsc2UgaWYgKGRhdGEgPT09ICd1cCcpIHtcclxuXHRcdGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSAtIDAuMDU7XHJcblx0XHRjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlIDw9IDAuMzUgPyAwLjM1IDogbmV3RGlzdGFuY2U7XHJcblx0fVxyXG5cclxuXHRjYW1EaXN0YW5jZSA9IGNhbURpc3RhbmNlO1xyXG5cdHNldENhbVBvc2l0aW9uKCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiQmxlbWlzaGVzXCIsXG4gICAgXCJGYWNpYWxIYWlyXCIsXG4gICAgXCJFeWVicm93c1wiLFxuICAgIFwiQWdlaW5nXCIsXG4gICAgXCJNYWtldXBcIixcbiAgICBcIkJsdXNoXCIsXG4gICAgXCJDb21wbGV4aW9uXCIsXG4gICAgXCJTdW5EYW1hZ2VcIixcbiAgICBcIkxpcHN0aWNrXCIsXG4gICAgXCJNb2xlc0ZyZWNrbGVzXCIsXG4gICAgXCJDaGVzdEhhaXJcIixcbiAgICBcIkJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkFkZEJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkV5ZUNvbG9yXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJOb3NlX1dpZHRoXCIsXG4gICAgXCJOb3NlX1BlYWtfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTGVuZ2h0XCIsXG4gICAgXCJOb3NlX0JvbmVfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTG93ZXJpbmdcIixcbiAgICBcIk5vc2VfQm9uZV9Ud2lzdFwiLFxuICAgIFwiRXllQnJvd25fSGVpZ2h0XCIsXG4gICAgXCJFeWVCcm93bl9Gb3J3YXJkXCIsXG4gICAgXCJDaGVla3NfQm9uZV9IaWdoXCIsXG4gICAgXCJDaGVla3NfQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hlZWtzX1dpZHRoXCIsXG4gICAgXCJFeWVzX09wZW5uaW5nXCIsXG4gICAgXCJMaXBzX1RoaWNrbmVzc1wiLFxuICAgIFwiSmF3X0JvbmVfV2lkdGhcIixcbiAgICBcIkphd19Cb25lX0JhY2tfTGVuZ2h0XCIsXG4gICAgXCJDaGluX0JvbmVfTG93ZXJpbmdcIixcbiAgICBcIkNoaW5fQm9uZV9MZW5ndGhcIixcbiAgICBcIkNoaW5fQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hpbl9Ib2xlXCIsXG4gICAgXCJOZWNrX1RoaWtuZXNzXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJmYWNlXCIsXG4gICAgXCJtYXNrc1wiLFxuICAgIFwiaGFpclwiLFxuICAgIFwidG9yc29zXCIsXG4gICAgXCJsZWdzXCIsXG4gICAgXCJiYWdzXCIsXG4gICAgXCJzaG9lc1wiLFxuICAgIFwibmVja1wiLFxuICAgIFwic2hpcnRzXCIsXG4gICAgXCJ2ZXN0XCIsXG4gICAgXCJkZWNhbHNcIixcbiAgICBcImphY2tldHNcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImhhdHNcIixcbiAgICBcImdsYXNzZXNcIixcbiAgICBcImVhcnJpbmdzXCIsXG4gICAgXCJtb3V0aFwiLFxuICAgIFwibGhhbmRcIixcbiAgICBcInJoYW5kXCIsXG4gICAgXCJ3YXRjaGVzXCIsXG4gICAgXCJicmFjZWxldHNcIlxuXVxuIiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUSGFpckRhdGEsIFRIZWFkT3ZlcmxheSwgVEhlYWRPdmVybGF5VG90YWwgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCBIRUFEX09WRVJMQVlTIGZyb20gXCJAZGF0YS9oZWFkXCJcclxuaW1wb3J0IEZBQ0VfRkVBVFVSRVMgZnJvbSBcIkBkYXRhL2ZhY2VcIlxyXG5pbXBvcnQgRFJBV0FCTEVfTkFNRVMgZnJvbSBcIkBkYXRhL2RyYXdhYmxlc1wiXHJcbmltcG9ydCBQUk9QX05BTUVTIGZyb20gXCJAZGF0YS9wcm9wc1wiXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZE1vZGVsSW5kZXggKHRhcmdldDogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxuICAgIGNvbnN0IG1vZGVscyA9IGNvbmZpZy5tb2RlbHMoKVxyXG4gICAgXHJcbiAgICByZXR1cm4gbW9kZWxzLmZpbmRJbmRleCgobW9kZWwpID0+IEdldEhhc2hLZXkobW9kZWwpICA9PT0gdGFyZ2V0KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFpciAocGVkOiBudW1iZXIpOiBUSGFpckRhdGEge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29sb3I6IEdldFBlZEhhaXJDb2xvcihwZWQpLFxyXG4gICAgICAgIGhpZ2hsaWdodDogR2V0UGVkSGFpckhpZ2hsaWdodENvbG9yKHBlZClcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRCbGVuZERhdGEocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgaGVhZGJsZW5kRGF0YSA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5HZXRIZWFkQmxlbmREYXRhKHBlZClcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNoYXBlRmlyc3Q6IGhlYWRibGVuZERhdGEuRmlyc3RGYWNlU2hhcGUsICAgLy8gZmF0aGVyXHJcbiAgICAgICAgc2hhcGVTZWNvbmQ6IGhlYWRibGVuZERhdGEuU2Vjb25kRmFjZVNoYXBlLCAvLyBtb3RoZXJcclxuICAgICAgICBzaGFwZVRoaXJkOiBoZWFkYmxlbmREYXRhLlRoaXJkRmFjZVNoYXBlLFxyXG5cclxuICAgICAgICBza2luRmlyc3Q6IGhlYWRibGVuZERhdGEuRmlyc3RTa2luVG9uZSxcclxuICAgICAgICBza2luU2Vjb25kOiBoZWFkYmxlbmREYXRhLlNlY29uZFNraW5Ub25lLFxyXG4gICAgICAgIHNraW5UaGlyZDogaGVhZGJsZW5kRGF0YS5UaGlyZFNraW5Ub25lLFxyXG5cclxuICAgICAgICBzaGFwZU1peDogaGVhZGJsZW5kRGF0YS5QYXJlbnRGYWNlU2hhcGVQZXJjZW50LCAvLyByZXNlbWJsYW5jZVxyXG5cclxuICAgICAgICB0aGlyZE1peDogaGVhZGJsZW5kRGF0YS5QYXJlbnRUaGlyZFVua1BlcmNlbnQsXHJcbiAgICAgICAgc2tpbk1peDogaGVhZGJsZW5kRGF0YS5QYXJlbnRTa2luVG9uZVBlcmNlbnQsICAgLy8gc2tpbnBlcmNlbnRcclxuXHJcbiAgICAgICAgaGFzUGFyZW50OiBoZWFkYmxlbmREYXRhLklzUGFyZW50SW5oZXJpdGFuY2UsXHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZE92ZXJsYXkocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgbGV0IHRvdGFsczogVEhlYWRPdmVybGF5VG90YWwgPSB7fTtcclxuICAgIGxldCBoZWFkRGF0YTogVEhlYWRPdmVybGF5ID0ge307XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBIRUFEX09WRVJMQVlTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEhFQURfT1ZFUkxBWVNbaV07XHJcbiAgICAgICAgdG90YWxzW292ZXJsYXldID0gR2V0TnVtSGVhZE92ZXJsYXlWYWx1ZXMoaSk7XHJcblxyXG4gICAgICAgIGlmIChvdmVybGF5ID09PSBcIkV5ZUNvbG9yXCIpIHtcclxuICAgICAgICAgICAgaGVhZERhdGFbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBHZXRQZWRFeWVDb2xvcihwZWQpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgW18sIG92ZXJsYXlWYWx1ZSwgY29sb3VyVHlwZSwgZmlyc3RDb2xvciwgc2Vjb25kQ29sb3IsIG92ZXJsYXlPcGFjaXR5XSA9IEdldFBlZEhlYWRPdmVybGF5RGF0YShwZWQsIGkpO1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGkgLSAxLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBvdmVybGF5VmFsdWUgPT09IDI1NSA/IC0xIDogb3ZlcmxheVZhbHVlLFxyXG4gICAgICAgICAgICAgICAgY29sb3VyVHlwZTogY29sb3VyVHlwZSxcclxuICAgICAgICAgICAgICAgIGZpcnN0Q29sb3I6IGZpcnN0Q29sb3IsXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRDb2xvcjogc2Vjb25kQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5T3BhY2l0eTogb3ZlcmxheU9wYWNpdHlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtoZWFkRGF0YSwgdG90YWxzXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRTdHJ1Y3R1cmUocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgcGVkTW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWQpXHJcblxyXG4gICAgaWYgKHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSAmJiBwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIikpIHJldHVyblxyXG5cclxuICAgIGxldCBmYWNlU3RydWN0ID0ge31cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRkFDRV9GRUFUVVJFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBGQUNFX0ZFQVRVUkVTW2ldXHJcbiAgICAgICAgZmFjZVN0cnVjdFtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRmFjZUZlYXR1cmUocGVkLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFjZVN0cnVjdFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RHJhd2FibGVzKHBlZDogbnVtYmVyKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGxldCBkcmF3YWJsZXMgPSB7fVxyXG4gICAgbGV0IHRvdGFsRHJhd2FibGVzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IERSQVdBQkxFX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IERSQVdBQkxFX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaSlcclxuXHJcbiAgICAgICAgdG90YWxEcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkRHJhd2FibGVWYXJpYXRpb25zKHBlZCwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFRleHR1cmVWYXJpYXRpb25zKHBlZCwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRUZXh0dXJlVmFyaWF0aW9uKHBlZCwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtkcmF3YWJsZXMsIHRvdGFsRHJhd2FibGVzXVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcHMocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgbGV0IHByb3BzID0ge31cclxuICAgIGxldCB0b3RhbFByb3BzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFBST1BfTkFNRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gUFJPUF9OQU1FU1tpXVxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpKVxyXG5cclxuICAgICAgICB0b3RhbFByb3BzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHRvdGFsOiBHZXROdW1iZXJPZlBlZFByb3BEcmF3YWJsZVZhcmlhdGlvbnMocGVkLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZXM6IEdldE51bWJlck9mUGVkUHJvcFRleHR1cmVWYXJpYXRpb25zKHBlZCwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3BzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWRQcm9wSW5kZXgocGVkLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZTogR2V0UGVkUHJvcFRleHR1cmVJbmRleChwZWQsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbcHJvcHMsIHRvdGFsUHJvcHNdXHJcbn1cclxuXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBwZWFyYW5jZShwZWQ6IG51bWJlcik6IFByb21pc2U8VEFwcGVhcmFuY2U+IHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBbaGVhZERhdGEsIHRvdGFsc10gPSBnZXRIZWFkT3ZlcmxheShwZWQpXHJcbiAgICBjb25zdCBbZHJhd2FibGVzLCBkcmF3VG90YWxdID0gZ2V0RHJhd2FibGVzKHBlZClcclxuICAgIGNvbnN0IFtwcm9wcywgcHJvcFRvdGFsXSA9IGdldFByb3BzKHBlZClcclxuICAgIGNvbnN0IG1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbW9kZWxJbmRleDogZmluZE1vZGVsSW5kZXgobW9kZWwpLFxyXG4gICAgICAgIG1vZGVsOiBtb2RlbCxcclxuICAgICAgICBoYWlyQ29sb3I6IGdldEhhaXIocGVkKSxcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkKSxcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEgYXMgVEhlYWRPdmVybGF5LFxyXG4gICAgICAgIGhlYWRPdmVybGF5VG90YWw6IHRvdGFscyBhcyBUSGVhZE92ZXJsYXlUb3RhbCxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZCksXHJcbiAgICAgICAgZHJhd2FibGVzOiBkcmF3YWJsZXMsXHJcbiAgICAgICAgcHJvcHM6IHByb3BzLFxyXG4gICAgICAgIGRyYXdUb3RhbDogZHJhd1RvdGFsLFxyXG4gICAgICAgIHByb3BUb3RhbDogcHJvcFRvdGFsLFxyXG4gICAgICAgIHRhdHRvb3M6IFtdXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldEFwcGVhcmFuY2VcIiwgZ2V0QXBwZWFyYW5jZSlcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQZWRDbG90aGVzKHBlZDogbnVtYmVyKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGNvbnN0IFtkcmF3YWJsZXMsIGRyYXdUb3RhbF0gPSBnZXREcmF3YWJsZXMocGVkKVxyXG4gICAgY29uc3QgW3Byb3BzLCBwcm9wVG90YWxdID0gZ2V0UHJvcHMocGVkKVxyXG4gICAgY29uc3QgW2hlYWREYXRhLCB0b3RhbHNdID0gZ2V0SGVhZE92ZXJsYXkocGVkKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaGVhZE92ZXJsYXk6IGhlYWREYXRhLFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkQ2xvdGhlc1wiLCBnZXRQZWRDbG90aGVzKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBlZFNraW4ocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkKSxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZCksXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZCksXHJcbiAgICAgICAgbW9kZWwgOiBHZXRFbnRpdHlNb2RlbChwZWQpXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldFBlZFNraW5cIiwgZ2V0UGVkU2tpbilcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUYXR0b29EYXRhKCkge1xyXG4gICAgbGV0IHRhdHRvb1pvbmVzID0ge31cclxuXHJcbiAgICBjb25zdCBbVEFUVE9PX0xJU1QsIFRBVFRPT19DQVRFR09SSUVTXSA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS50YXR0b29zKClcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVEFUVE9PX0NBVEVHT1JJRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBjYXRlZ29yeSA9IFRBVFRPT19DQVRFR09SSUVTW2ldXHJcbiAgICAgICAgY29uc3Qgem9uZSA9IGNhdGVnb3J5LnpvbmVcclxuICAgICAgICBjb25zdCBsYWJlbCA9IGNhdGVnb3J5LmxhYmVsXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBjYXRlZ29yeS5pbmRleFxyXG4gICAgICAgIHRhdHRvb1pvbmVzW2luZGV4XSA9IHtcclxuICAgICAgICAgICAgem9uZTogem9uZSxcclxuICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxyXG4gICAgICAgICAgICB6b25lSW5kZXg6IGluZGV4LFxyXG4gICAgICAgICAgICBkbGNzOiBbXVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBUQVRUT09fTElTVC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBjb25zdCBkbGNEYXRhID0gVEFUVE9PX0xJU1Rbal1cclxuICAgICAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdLmRsY3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZGxjRGF0YS5kbGMsXHJcbiAgICAgICAgICAgICAgICBkbGNJbmRleDogaixcclxuICAgICAgICAgICAgICAgIHRhdHRvb3M6IFtdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlzRmVtYWxlID0gR2V0RW50aXR5TW9kZWwoUGxheWVyUGVkSWQoKSkgPT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fTElTVC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBUQVRUT09fTElTVFtpXVxyXG4gICAgICAgIGNvbnN0IHsgZGxjLCB0YXR0b29zIH0gPSBkYXRhXHJcbiAgICAgICAgY29uc3QgZGxjSGFzaCA9IEdldEhhc2hLZXkoZGxjKVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGF0dG9vcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gdGF0dG9vc1tqXSBcclxuICAgICAgICAgICAgbGV0IHRhdHRvbyA9IG51bGxcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyVGF0dG9vID0gdGF0dG9vRGF0YS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIGNvbnN0IGlzRmVtYWxlVGF0dG9vID0gbG93ZXJUYXR0b28uaW5jbHVkZXMoXCJfZlwiKVxyXG4gICAgICAgICAgICBpZiAoaXNGZW1hbGVUYXR0b28gJiYgaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNGZW1hbGVUYXR0b28gJiYgIWlzRmVtYWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXR0b28gPSB0YXR0b29EYXRhXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBoYXNoID0gbnVsbFxyXG4gICAgICAgICAgICBsZXQgem9uZSA9IC0xXHJcblxyXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoID0gR2V0SGFzaEtleSh0YXR0b28pXHJcbiAgICAgICAgICAgICAgICB6b25lID0gR2V0UGVkRGVjb3JhdGlvblpvbmVGcm9tSGFzaGVzKGRsY0hhc2gsIGhhc2gpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh6b25lICE9PSAtMSAmJiBoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB6b25lVGF0dG9vcyA9IHRhdHRvb1pvbmVzW3pvbmVdLmRsY3NbaV0udGF0dG9vc1xyXG5cclxuICAgICAgICAgICAgICAgIHpvbmVUYXR0b29zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0YXR0b28sXHJcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogaGFzaCxcclxuICAgICAgICAgICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICAgICAgICAgIGRsYzogZGxjLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGF0dG9vWm9uZXNcclxufSIsICJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICAgIGhhdHM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMCxcclxuICAgIH0sXHJcbiAgICBnbGFzc2VzOiB7XHJcbiAgICAgICAgdHlwZTogXCJwcm9wXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICB9LFxyXG4gICAgbWFza3M6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICAgICAgb2ZmOiAwLFxyXG4gICAgfSxcclxuICAgIHNoaXJ0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogOCxcclxuICAgICAgICBvZmY6IDE1XHJcbiAgICB9LFxyXG4gICAgamFja2V0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMTEsXHJcbiAgICAgICAgb2ZmOiAxNSxcclxuICAgIH0sXHJcbiAgICBsZWdzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA0LFxyXG4gICAgICAgIG9mZjogMTEsXHJcbiAgICB9LFxyXG4gICAgc2hvZXM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDYsXHJcbiAgICAgICAgb2ZmOiAxMyxcclxuICAgIH1cclxufSIsICJpbXBvcnQgeyBEcmF3YWJsZURhdGEsIFRWYWx1ZSB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCI7XHJcbmltcG9ydCBUT0dHTEVfSU5ERVhFUyBmcm9tIFwiQGRhdGEvdG9nZ2xlc1wiXHJcbmltcG9ydCB7IGNvcHlGaWxlU3luYyB9IGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgeyByZXF1ZXN0TW9kZWx9IGZyb20gJ0B1dGlscyc7XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldERyYXdhYmxlKHBlZDogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCAwKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJvcChwZWQ6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGlmIChkYXRhLnZhbHVlID09PSAtMSkge1xyXG4gICAgICAgIENsZWFyUGVkUHJvcChwZWQsIGRhdGEuaW5kZXgpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgU2V0UGVkUHJvcEluZGV4KHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCBmYWxzZSlcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjb25zdCBzZXRNb2RlbCA9IGFzeW5jIChwZWQ6IG51bWJlciwgZGF0YSkgPT4ge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuICAgIGNvbnN0IGlzSnVzdE1vZGVsID0gdHlwZW9mIGRhdGEgPT09ICdudW1iZXInXHJcbiAgICBjb25zdCBtb2RlbCA9IGlzSnVzdE1vZGVsID8gZGF0YSA6IGRhdGEubW9kZWxcclxuICAgIGNvbnN0IGlzUGxheWVyID0gSXNQZWRBUGxheWVyKHBlZClcclxuXHJcbiAgICBpZiAoaXNQbGF5ZXIpIHtcclxuICAgICAgICBjb25zdCBtb2RlbEhhc2ggPSBhd2FpdCByZXF1ZXN0TW9kZWwobW9kZWwpXHJcbiAgICAgICAgU2V0UGxheWVyTW9kZWwoUGxheWVySWQoKSwgbW9kZWxIYXNoKVxyXG4gICAgICAgIFNldE1vZGVsQXNOb0xvbmdlck5lZWRlZChtb2RlbEhhc2gpXHJcbiAgICAgICAgcGVkID0gUGxheWVyUGVkSWQoKVxyXG4gICAgfVxyXG4gICAgU2V0UGVkRGVmYXVsdENvbXBvbmVudFZhcmlhdGlvbihwZWQpXHJcblxyXG4gICAgaWYgKCFpc0p1c3RNb2RlbCAmJiBkYXRhLmhlYWRCbGVuZCAmJiBPYmplY3Qua2V5cyhkYXRhLmhlYWRCbGVuZCkubGVuZ3RoKSBzZXRIZWFkQmxlbmQocGVkLCBkYXRhLmhlYWRCbGVuZClcclxuICAgIHJldHVybiBwZWRcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFNldEZhY2VGZWF0dXJlKHBlZDogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcbiAgICBTZXRQZWRGYWNlRmVhdHVyZShwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUgKyAwLjApXHJcbn1cclxuXHJcbmNvbnN0IGlzUG9zaXRpdmUgPSAodmFsOiBudW1iZXIpID0+IHZhbCA+PSAwID8gdmFsIDogMFxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEhlYWRCbGVuZChwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBjb25zdCBzaGFwZUZpcnN0ID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlRmlyc3QpXHJcbiAgICBjb25zdCBzaGFwZVNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZVNlY29uZClcclxuICAgIGNvbnN0IHNoYXBlVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVUaGlyZClcclxuICAgIGNvbnN0IHNraW5GaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5za2luRmlyc3QpXHJcbiAgICBjb25zdCBza2luU2Vjb25kID0gaXNQb3NpdGl2ZShkYXRhLnNraW5TZWNvbmQpXHJcbiAgICBjb25zdCBza2luVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpblRoaXJkKVxyXG4gICAgY29uc3Qgc2hhcGVNaXggPSBkYXRhLnNoYXBlTWl4ICsgMC4wXHJcbiAgICBjb25zdCBza2luTWl4ID0gZGF0YS5za2luTWl4ICsgMC4wXHJcbiAgICBjb25zdCB0aGlyZE1peCA9IGRhdGEudGhpcmRNaXggKyAwLjBcclxuICAgIGNvbnN0IGhhc1BhcmVudCA9IGRhdGEuaGFzUGFyZW50XHJcblxyXG4gICAgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWQsIHNoYXBlRmlyc3QsIHNoYXBlU2Vjb25kLCBzaGFwZVRoaXJkLCBza2luRmlyc3QsIHNraW5TZWNvbmQsIHNraW5UaGlyZCwgc2hhcGVNaXgsIHNraW5NaXgsXHJcbiAgICAgICAgdGhpcmRNaXgsIGhhc1BhcmVudClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEhlYWRPdmVybGF5KHBlZDogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG4gICAgY29uc3QgaW5kZXggPSBkYXRhLmluZGV4XHJcblxyXG4gICAgaWYgKGluZGV4ID09PSAxMykge1xyXG4gICAgICAgIFNldFBlZEV5ZUNvbG9yKHBlZCwgZGF0YS52YWx1ZSlcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlID09PSAtMSA/IDI1NSA6IGRhdGEub3ZlcmxheVZhbHVlXHJcblxyXG4gICAgU2V0UGVkSGVhZE92ZXJsYXkocGVkLCBpbmRleCwgdmFsdWUsIGRhdGEub3ZlcmxheU9wYWNpdHkgKyAwLjApXHJcbiAgICBTZXRQZWRIZWFkT3ZlcmxheUNvbG9yKHBlZCwgaW5kZXgsIDEsIGRhdGEuZmlyc3RDb2xvciwgZGF0YS5zZWNvbmRDb2xvcilcclxufVxyXG5cclxuLy8gZnVuY3Rpb24gUmVzZXRUb2dnbGVzKGRhdGEpXHJcbi8vICAgICBsb2NhbCBwZWQgPSBjYWNoZS5wZWRcclxuXHJcbi8vICAgICBsb2NhbCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4vLyAgICAgbG9jYWwgcHJvcHMgPSBkYXRhLnByb3BzXHJcblxyXG4vLyAgICAgZm9yIHRvZ2dsZUl0ZW0sIHRvZ2dsZURhdGEgaW4gcGFpcnMoVE9HR0xFX0lOREVYRVMpIGRvXHJcbi8vICAgICAgICAgbG9jYWwgdG9nZ2xlVHlwZSA9IHRvZ2dsZURhdGEudHlwZVxyXG4vLyAgICAgICAgIGxvY2FsIGluZGV4ID0gdG9nZ2xlRGF0YS5pbmRleFxyXG5cclxuLy8gICAgICAgICBpZiB0b2dnbGVUeXBlID09IFwiZHJhd2FibGVcIiBhbmQgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dIHRoZW5cclxuLy8gICAgICAgICAgICAgbG9jYWwgY3VycmVudERyYXdhYmxlID0gR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpbmRleClcclxuLy8gICAgICAgICAgICAgaWYgY3VycmVudERyYXdhYmxlIH49IGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSB0aGVuXHJcbi8vICAgICAgICAgICAgICAgICBTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCAwKVxyXG4vLyAgICAgICAgICAgICBlbmRcclxuLy8gICAgICAgICBlbHNlaWYgdG9nZ2xlVHlwZSA9PSBcInByb3BcIiBhbmQgcHJvcHNbdG9nZ2xlSXRlbV0gdGhlblxyXG4vLyAgICAgICAgICAgICBsb2NhbCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KVxyXG4vLyAgICAgICAgICAgICBpZiBjdXJyZW50UHJvcCB+PSBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSB0aGVuXHJcbi8vICAgICAgICAgICAgICAgICBTZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleCwgcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIGZhbHNlKVxyXG4vLyAgICAgICAgICAgICBlbmRcclxuLy8gICAgICAgICBlbmRcclxuLy8gICAgIGVuZFxyXG4vLyBlbmRcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZXNldFRvZ2dsZXMoZGF0YSkge1xyXG4gICAgY29uc3QgcGVkID0gUGxheWVyUGVkSWQoKVxyXG4gICAgY29uc3QgZHJhd2FibGVzID0gZGF0YS5kcmF3YWJsZXNcclxuICAgIGNvbnN0IHByb3BzID0gZGF0YS5wcm9wc1xyXG5cclxuICAgIGZvciAoY29uc3QgW3RvZ2dsZUl0ZW0sIHRvZ2dsZURhdGFdIG9mIE9iamVjdC5lbnRyaWVzKFRPR0dMRV9JTkRFWEVTKSkge1xyXG4gICAgICAgIGNvbnN0IHRvZ2dsZVR5cGUgPSB0b2dnbGVEYXRhLnR5cGVcclxuICAgICAgICBjb25zdCBpbmRleCA9IHRvZ2dsZURhdGEuaW5kZXhcclxuXHJcbiAgICAgICAgaWYgKHRvZ2dsZVR5cGUgPT09IFwiZHJhd2FibGVcIiAmJiBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0pIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudERyYXdhYmxlID0gR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpbmRleClcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnREcmF3YWJsZSAhPT0gZHJhd2FibGVzW3RvZ2dsZUl0ZW1dLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCAwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh0b2dnbGVUeXBlID09PSBcInByb3BcIiAmJiBwcm9wc1t0b2dnbGVJdGVtXSkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudFByb3AgIT09IHByb3BzW3RvZ2dsZUl0ZW1dLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBTZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleCwgcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIGZhbHNlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkQ2xvdGhlcyhwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcbiAgICBjb25zdCBoZWFkT3ZlcmxheSA9IGRhdGEuaGVhZE92ZXJsYXlcclxuICAgIGNvbnNvbGUubG9nKCdkcmF3YWJsZXMnLCBkcmF3YWJsZXMpXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIGRyYXdhYmxlcykge1xyXG4gICAgICAgIGNvbnN0IGRyYXdhYmxlID0gZHJhd2FibGVzW2lkXVxyXG4gICAgICAgIHNldERyYXdhYmxlKHBlZCwgZHJhd2FibGUpXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBwcm9wcykge1xyXG4gICAgICAgIGNvbnN0IHByb3AgPSBwcm9wc1tpZF1cclxuICAgICAgICBzZXRQcm9wKHBlZCwgcHJvcClcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIGhlYWRPdmVybGF5KSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IGhlYWRPdmVybGF5W2lkXVxyXG4gICAgICAgIHNldEhlYWRPdmVybGF5KHBlZCwgb3ZlcmxheSlcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHNldFBlZFNraW4gPSBhc3luYyAocGVkOiBudW1iZXIsIGRhdGEpID0+IHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBoZWFkU3RydWN0dXJlID0gZGF0YS5oZWFkU3RydWN0dXJlXHJcbiAgICBjb25zdCBoZWFkQmxlbmQgPSBkYXRhLmhlYWRCbGVuZFxyXG5cclxuICAgIHBlZCA9IGF3YWl0IHNldE1vZGVsKHBlZCwgZGF0YSlcclxuICAgIGlmIChoZWFkQmxlbmQpIHtcclxuICAgICAgICBzZXRIZWFkQmxlbmQocGVkLCBoZWFkQmxlbmQpXHJcbiAgICB9XHJcbiAgICBpZiAoaGVhZFN0cnVjdHVyZSkge1xyXG4gICAgICAgIGZvciAoY29uc3QgZmVhdHVyZSBvZiBoZWFkU3RydWN0dXJlKSB7XHJcbiAgICAgICAgICAgIFNldEZhY2VGZWF0dXJlKHBlZCwgZmVhdHVyZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRUYXR0b29zKHBlZDogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVyblxyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBjb25zdCBpc1BsYXllciA9IElzUGVkQVBsYXllcihwZWQpXHJcbiAgICBpZiAoaXNQbGF5ZXIpIHtcclxuICAgICAgICBwZWQgPSBQbGF5ZXJQZWRJZCgpXHJcbiAgICB9XHJcblxyXG4gICAgQ2xlYXJQZWREZWNvcmF0aW9uc0xlYXZlU2NhcnMocGVkKVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IHRhdHRvb0RhdGEgPSBkYXRhW2ldLnRhdHRvb1xyXG4gICAgICAgIGlmICh0YXR0b29EYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBHZXRIYXNoS2V5KHRhdHRvb0RhdGEuZGxjKVxyXG4gICAgICAgICAgICBjb25zdCB0YXR0b28gPSB0YXR0b29EYXRhLmhhc2hcclxuICAgICAgICAgICAgQWRkUGVkRGVjb3JhdGlvbkZyb21IYXNoZXMocGVkLCBjb2xsZWN0aW9uLCB0YXR0b28pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkSGFpckNvbG9ycyhwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBjb25zdCBjb2xvciA9IGRhdGEuY29sb3JcclxuICAgIGNvbnN0IGhpZ2hsaWdodCA9IGRhdGEuaGlnaGxpZ2h0XHJcbiAgICBTZXRQZWRIYWlyQ29sb3IocGVkLCBjb2xvciwgaGlnaGxpZ2h0KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkQXBwZWFyYW5jZShwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgc2V0UGVkU2tpbihwZWQsIGRhdGEpXHJcbiAgICBzZXRQZWRDbG90aGVzKHBlZCwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMocGVkLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MocGVkLCBkYXRhLnRhdHRvb3MpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGRhdGEpIHtcclxuICAgIHNldFBlZFNraW4oUGxheWVyUGVkSWQoKSwgZGF0YSlcclxuICAgIHNldFBlZENsb3RoZXMoUGxheWVyUGVkSWQoKSwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMoUGxheWVyUGVkSWQoKSwgZGF0YS5oYWlyQ29sb3IpXHJcbiAgICBzZXRQZWRUYXR0b29zKFBsYXllclBlZElkKCksIGRhdGEudGF0dG9vcylcclxufSIsICJpbXBvcnQgeyBSZWNlaXZlIH0gZnJvbSAnQGV2ZW50cyc7XHJcbmltcG9ydCB7XHJcblx0cmVzZXRUb2dnbGVzLFxyXG5cdHNldERyYXdhYmxlLFxyXG5cdFNldEZhY2VGZWF0dXJlLFxyXG5cdHNldEhlYWRCbGVuZCxcclxuXHRzZXRIZWFkT3ZlcmxheSxcclxuXHRzZXRNb2RlbCxcclxuXHRzZXRQZWRDbG90aGVzLFxyXG5cdHNldFBlZFRhdHRvb3MsXHJcblx0c2V0UGxheWVyUGVkQXBwZWFyYW5jZSxcclxuXHRzZXRQcm9wLFxyXG59IGZyb20gJy4vYXBwZWFyYW5jZS9zZXR0ZXJzJztcclxuaW1wb3J0IHsgY2xvc2VNZW51IH0gZnJvbSAnLi9tZW51JztcclxuaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRUb2dnbGVEYXRhLCBUVmFsdWUgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgZGVsYXksIGdldEZyYW1ld29ya0lELCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2sgfSBmcm9tICdAdXRpbHMnO1xyXG5pbXBvcnQgeyBnZXRBcHBlYXJhbmNlLCBnZXRUYXR0b29EYXRhIH0gZnJvbSAnLi9hcHBlYXJhbmNlL2dldHRlcnMnO1xyXG5pbXBvcnQgVE9HR0xFX0lOREVYRVMgZnJvbSAnQGRhdGEvdG9nZ2xlcyc7XHJcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gJ0B0eXBpbmdzL291dGZpdHMnO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbmNlbCwgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpO1xyXG5cdGNsb3NlTWVudSgpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soXHJcblx0UmVjZWl2ZS5zYXZlLFxyXG5cdGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3NhdmUnKVxyXG5cdFx0cmVzZXRUb2dnbGVzKGFwcGVhcmFuY2UpO1xyXG5cclxuXHRcdGF3YWl0IGRlbGF5KDEwMCk7XHJcblxyXG5cdFx0Y29uc3QgcGVkID0gUGxheWVyUGVkSWQoKTtcclxuXHJcblx0XHRjb25zdCBuZXdBcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cclxuXHRcdGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcblxyXG5cdFx0dHJpZ2dlclNlcnZlckNhbGxiYWNrKFxyXG5cdFx0XHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2V0QXBwZWFyYW5jZScsXHJcblx0XHRcdGZyYW1ld29ya2RJZCxcclxuXHRcdFx0bmV3QXBwZWFyYW5jZVxyXG5cdFx0KTtcclxuXHJcblx0XHRzZXRQZWRUYXR0b29zKHBlZCwgYXBwZWFyYW5jZS50YXR0b29zKTtcclxuXHJcblx0XHRjbG9zZU1lbnUoKTtcclxuXHRcdGNiKDEpO1xyXG5cdH1cclxuKTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRNb2RlbCwgYXN5bmMgKG1vZGVsOiBzdHJpbmcsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IGhhc2ggPSBHZXRIYXNoS2V5KG1vZGVsKTtcclxuXHRpZiAoIUlzTW9kZWxJbkNkaW1hZ2UoaGFzaCkgfHwgIUlzTW9kZWxWYWxpZChoYXNoKSkge1xyXG5cdFx0cmV0dXJuIGNiKDApO1xyXG5cdH1cclxuXHJcblx0Y29uc3QgcGVkID0gUGxheWVyUGVkSWQoKTtcclxuXHJcblx0YXdhaXQgc2V0TW9kZWwocGVkLCBoYXNoKTtcclxuXHJcblx0Y29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkKTtcclxuXHJcblx0YXBwZWFyYW5jZS50YXR0b29zID0gW107XHJcblxyXG5cdGNiKGFwcGVhcmFuY2UpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5nZXRNb2RlbFRhdHRvb3MsIGFzeW5jIChfOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHRhdHRvb3MgPSBnZXRUYXR0b29EYXRhKCk7XHJcblxyXG5cdGNiKHRhdHRvb3MpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soXHJcblx0UmVjZWl2ZS5zZXRIZWFkU3RydWN0dXJlLFxyXG5cdGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdFx0Y29uc3QgcGVkID0gUGxheWVyUGVkSWQoKTtcclxuXHRcdFNldEZhY2VGZWF0dXJlKHBlZCwgZGF0YSk7XHJcblx0XHRjYigxKTtcclxuXHR9XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFxyXG5cdFJlY2VpdmUuc2V0SGVhZE92ZXJsYXksXHJcblx0YXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0XHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cdFx0c2V0SGVhZE92ZXJsYXkocGVkLCBkYXRhKTtcclxuXHRcdGNiKDEpO1xyXG5cdH1cclxuKTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soXHJcblx0UmVjZWl2ZS5zZXRIZWFkQmxlbmQsXHJcblx0YXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0XHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cdFx0c2V0SGVhZEJsZW5kKHBlZCwgZGF0YSk7XHJcblx0XHRjYigxKTtcclxuXHR9XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0VGF0dG9vcywgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgcGVkID0gUGxheWVyUGVkSWQoKTtcclxuXHRzZXRQZWRUYXR0b29zKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFByb3AsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0c2V0UHJvcChwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXREcmF3YWJsZSwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgcGVkID0gUGxheWVyUGVkSWQoKTtcclxuXHRzZXREcmF3YWJsZShwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soXHJcblx0UmVjZWl2ZS50b2dnbGVJdGVtLFxyXG5cdGFzeW5jIChkYXRhOiBUVG9nZ2xlRGF0YSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXRlbSA9IFRPR0dMRV9JTkRFWEVTW2RhdGEuaXRlbV07XHJcblx0XHRpZiAoIWl0ZW0pIHJldHVybiBjYihmYWxzZSk7XHJcblxyXG5cdFx0Y29uc3QgY3VycmVudCA9IGRhdGEuZGF0YTtcclxuXHRcdGNvbnN0IHR5cGUgPSBpdGVtLnR5cGU7XHJcblx0XHRjb25zdCBpbmRleCA9IGl0ZW0uaW5kZXg7XHJcblxyXG5cdFx0aWYgKCFjdXJyZW50KSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRcdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblxyXG5cdFx0aWYgKHR5cGUgPT09ICdwcm9wJykge1xyXG5cdFx0XHRjb25zdCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KTtcclxuXHJcblx0XHRcdGlmIChjdXJyZW50UHJvcCA9PT0gLTEpIHtcclxuXHRcdFx0XHRzZXRQcm9wKHBlZCwgY3VycmVudCk7XHJcblx0XHRcdFx0Y2IoZmFsc2UpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRDbGVhclBlZFByb3AocGVkLCBpbmRleCk7XHJcblx0XHRcdFx0Y2IodHJ1ZSk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2UgaWYgKHR5cGUgPT09ICdkcmF3YWJsZScpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudERyYXdhYmxlID0gR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpbmRleCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VycmVudC52YWx1ZSA9PT0gaXRlbS5vZmYpIHtcclxuICAgICAgICAgICAgICAgIGNiKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnQudmFsdWUgPT09IGN1cnJlbnREcmF3YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaW5kZXgsIGl0ZW0ub2ZmLCAwLCAwKTtcclxuICAgICAgICAgICAgICAgIGNiKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2V0RHJhd2FibGUocGVkLCBjdXJyZW50KTtcclxuICAgICAgICAgICAgICAgIGNiKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHR9XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2F2ZU91dGZpdCwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKFxyXG4gICAgICAgICdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlT3V0Zml0JyxcclxuICAgICAgICBmcmFtZXdvcmtkSWQsXHJcbiAgICAgICAgZGF0YVxyXG4gICAgKTtcclxuICAgIGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmRlbGV0ZU91dGZpdCwgYXN5bmMgKGlkOiBzdHJpbmcsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgY29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayhcclxuICAgICAgICAnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6ZGVsZXRlT3V0Zml0JyxcclxuICAgICAgICBmcmFtZXdvcmtkSWQsXHJcbiAgICAgICAgaWRcclxuICAgICk7XHJcbiAgICBjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5yZW5hbWVPdXRmaXQsIGFzeW5jIChkYXRhOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgY29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayhcclxuICAgICAgICAnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6cmVuYW1lT3V0Zml0JyxcclxuICAgICAgICBmcmFtZXdvcmtkSWQsXHJcbiAgICAgICAgZGF0YVxyXG4gICAgKTtcclxuICAgIGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnVzZU91dGZpdCwgYXN5bmMgKG91dGZpdDogT3V0Zml0LCBjYjogRnVuY3Rpb24pID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCd1c2VPdXRmaXQnLCBvdXRmaXQpO1xyXG4gICAgc2V0UGVkQ2xvdGhlcyhQbGF5ZXJQZWRJZCgpLCBvdXRmaXQpO1xyXG4gICAgY2IoMSk7XHJcbn0pOyIsICJpbXBvcnQgeyBnZXRGcmFtZXdvcmtJRCwgcmVxdWVzdExvY2FsZSwgc2VuZE5VSUV2ZW50LCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2sgfSBmcm9tIFwiQHV0aWxzXCJcclxuaW1wb3J0IHsgc3RhcnRDYW1lcmEsIHN0b3BDYW1lcmEgfSBmcm9tIFwiLi9jYW1lcmFcIlxyXG5pbXBvcnQgdHlwZSB7IFRNZW51VHlwZXMgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gXCJAdHlwaW5ncy9vdXRmaXRzXCJcclxuaW1wb3J0IHsgU2VuZCB9IGZyb20gXCJAZXZlbnRzXCJcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0VGF0dG9vRGF0YSB9IGZyb20gXCIuL2FwcGVhcmFuY2UvZ2V0dGVyc1wiXHJcbmltcG9ydCBcIi4vaGFuZGxlcnNcIlxyXG5cclxuY29uc3QgY29uZmlnID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlXHJcbmxldCBhcm1vdXIgPSAwXHJcblxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5NZW51KHR5cGU6IFRNZW51VHlwZXMsIGNyZWF0aW9uOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgIGNvbnN0IHBlZCA9IFBsYXllclBlZElkKClcclxuXHJcbiAgICBjb25zdCBjb25maWdNZW51cyA9IGNvbmZpZy5tZW51cygpXHJcblxyXG4gICAgY29uc3QgbWVudSA9IGNvbmZpZ01lbnVzW3R5cGVdXHJcblxyXG4gICAgY29uc29sZS5sb2coY29uZmlnTWVudXMsIG1lbnUpXHJcblxyXG4gICAgaWYgKCFtZW51KSByZXR1cm5cclxuXHJcbiAgICBzdGFydENhbWVyYSgpXHJcblxyXG4gICAgY29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKVxyXG5cclxuICAgIGNvbnN0IHRhYnMgPSBtZW51LnRhYnNcclxuXHJcbiAgICBsZXQgYWxsb3dFeGl0ID0gbWVudS5hbGxvd0V4aXRcclxuXHJcbiAgICBhcm1vdXIgPSBHZXRQZWRBcm1vdXIocGVkKVxyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiYXJtb3VyXCIsIGFybW91cilcclxuXHJcbiAgICBsZXQgb3V0Zml0cyA9IFtdXHJcblxyXG4gICAgY29uc3QgaGFzT3V0Zml0VGFiID0gdGFicy5pbmNsdWRlcygnb3V0Zml0cycpXHJcbiAgICBpZiAoaGFzT3V0Zml0VGFiKSB7XHJcbiAgICAgICAgb3V0Zml0cyA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxPdXRmaXRbXT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldE91dGZpdHMnLCBmcmFtZXdvcmtkSWQpIGFzIE91dGZpdFtdIFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBtb2RlbHMgPSBbXVxyXG5cclxuICAgIGNvbnN0IGhhc0hlcml0YWdlVGFiID0gdGFicy5pbmNsdWRlcygnaGVyaXRhZ2UnKVxyXG4gICAgaWYgKGhhc0hlcml0YWdlVGFiKSB7XHJcbiAgICAgICAgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaGFzVGF0dG9vVGFiID0gdGFicy5pbmNsdWRlcygndGF0dG9vcycpXHJcbiAgICBsZXQgdGF0dG9vc1xyXG4gICAgaWYgKGhhc1RhdHRvb1RhYikge1xyXG4gICAgICAgIHRhdHRvb3MgPSBnZXRUYXR0b29EYXRhKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBibGFja2xpc3QgPSBnZXRCbGFja2xpc3QodHlwZSlcclxuXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpXHJcblxyXG4gICAgY29uc29sZS5sb2coXCJhcHBlYXJhbmNlXCIpXHJcblxyXG4gICAgaWYgKGNyZWF0aW9uKSB7XHJcbiAgICAgICAgYWxsb3dFeGl0ID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBzZW5kTlVJRXZlbnQoIFNlbmQuZGF0YSwge1xyXG4gICAgICAgIHRhYnMsXHJcbiAgICAgICAgYXBwZWFyYW5jZSxcclxuICAgICAgICBibGFja2xpc3QsXHJcbiAgICAgICAgdGF0dG9vcyxcclxuICAgICAgICBvdXRmaXRzLFxyXG4gICAgICAgIG1vZGVscyxcclxuICAgICAgICBhbGxvd0V4aXQsXHJcbiAgICAgICAgbG9jYWxlOiBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKVxyXG4gICAgfSlcclxuICAgIGNvbnNvbGUubG9nKCdvcGVuTWVudScsIHR5cGUpXHJcbiAgICBTZXROdWlGb2N1cyh0cnVlLCB0cnVlKVxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQudmlzaWJsZSwgdHJ1ZSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QmxhY2tsaXN0KHR5cGU6IFRNZW51VHlwZXMpIHtcclxuICAgIGNvbnN0IGJsYWNrbGlzdCA9IGNvbmZpZy5ibGFja2xpc3QoKVxyXG5cclxuICAgIHJldHVybiBibGFja2xpc3RcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlTWVudSgpIHtcclxuICAgIGNvbnN0IHBlZCA9IFBsYXllclBlZElkKClcclxuXHJcbiAgICBTZXRQZWRBcm1vdXIocGVkLCBhcm1vdXIpXHJcblxyXG4gICAgc3RvcENhbWVyYSgpXHJcbiAgICBTZXROdWlGb2N1cyhmYWxzZSwgZmFsc2UpXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC52aXNpYmxlLCBmYWxzZSlcclxufSIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSwgVE1lbnVUeXBlcyB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IHsgb3Blbk1lbnUgfSBmcm9tIFwiLi9tZW51XCJcclxuaW1wb3J0IHsgc2V0UGVkQXBwZWFyYW5jZSwgc2V0UGxheWVyUGVkQXBwZWFyYW5jZSB9IGZyb20gXCIuL2FwcGVhcmFuY2Uvc2V0dGVyc1wiXHJcbmltcG9ydCB7IGRlbGF5LCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2sgfSBmcm9tIFwiQHV0aWxzXCJcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSB9IGZyb20gXCIuL2FwcGVhcmFuY2UvZ2V0dGVyc1wiXHJcblxyXG5sZXQgaXNJblNwcml0ZTogVE1lbnVUeXBlcyB8IG51bGwgPSBudWxsXHJcblxyXG5jb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UuY29uZmlnKClcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgnb3Blbk1lbnUnLCAoKSA9PiB7XHJcbiAgICBvcGVuTWVudSgnYXBwZWFyYW5jZScpICBcclxuICAgIGNvbnNvbGUubG9nKCdNZW51IG9wZW5lZCcpXHJcbiAgfSwgZmFsc2UpXHJcblxyXG5cclxuZXhwb3J0cygnU2V0UGVkQXBwZWFyYW5jZScsIChwZWQ6IG51bWJlciwgYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UpID0+IHtcclxuICAgIHNldFBlZEFwcGVhcmFuY2UocGVkLCBhcHBlYXJhbmNlKVxyXG59KVxyXG5cclxuZXhwb3J0cygnU2V0UGxheWVyUGVkQXBwZWFyYW5jZScsIGFzeW5jIChmcmFtZXdvcmtJRCkgPT4ge1xyXG4gICAgbGV0IGFwcGVhcmFuY2VcclxuICAgIGlmICAoY29uZmlnLmJhY2t3YXJkc0NvbXBhdGliaWxpdHkpIHtcclxuICAgICAgICBjb25zdCBvbGRBcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6UHJldmlvdXNHZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcblxyXG4gICAgICAgIGlmIChjb25maWcucHJldmlvdXNDbG90aGluZyA9PSAnaWxsZW5pdW0nKSB7XHJcbiAgICAgICAgICAgIGV4cG9ydHNbJ2lsbGVuaXVtLWFwcGVhcmFuY2UnXS5zZXRQZWRBcHBlYXJhbmNlKFBsYXllclBlZElkKCksIG9sZEFwcGVhcmFuY2UpXHJcbiAgICAgICAgfSBlbHNlIGlmIChjb25maWcucHJldmlvdXNDbG90aGluZyA9PSAncWInKSB7XHJcbiAgICAgICAgICAgIGVtaXQoJ3FiLWNsb3RoaW5nOmNsaWVudDpsb2FkUGxheWVyQ2xvdGhpbmcnLCBvbGRBcHBlYXJhbmNlLCBQbGF5ZXJQZWRJZCgpKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXdhaXQgZGVsYXkoMTAwKVxyXG5cclxuICAgICAgICBhcHBlYXJhbmNlID0gZ2V0QXBwZWFyYW5jZShQbGF5ZXJQZWRJZCgpKVxyXG4gICAgfVxyXG5cclxuICAgIGFwcGVhcmFuY2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VEFwcGVhcmFuY2U+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZnJhbWV3b3JrSUQpXHJcbiAgICBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpXHJcbn0pXHJcblxyXG5leHBvcnRzKCdHZXRQbGF5ZXJQZWRBcHBlYXJhbmNlJywgYXN5bmMgKGZyYW1ld29ya0lEKSA9PiB7XHJcbiAgICByZXR1cm4gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG59KVxyXG5cclxuY29uc3Qgem9uZXMgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2Uuem9uZXMoKVxyXG5jb25zdCBibF9zcHJpdGVzID0gZXhwb3J0cy5ibF9zcHJpdGVzXHJcblxyXG5cclxuUmVnaXN0ZXJDb21tYW5kKCcrb3BlbkFwcGVhcmFuY2UnLCAoKSA9PiB7XHJcbiAgICBpZiAoIWlzSW5TcHJpdGUpIHJldHVyblxyXG4gICAgb3Blbk1lbnUoaXNJblNwcml0ZSlcclxufSwgZmFsc2UpXHJcblxyXG5cclxuUmVnaXN0ZXJLZXlNYXBwaW5nKCcrb3BlbkFwcGVhcmFuY2UnLCAnT3BlbiBBcHBlYXJhbmNlJywgJ2tleWJvYXJkJywgY29uZmlnLm9wZW5Db250cm9sKVxyXG5cclxuZm9yIChjb25zdCBlbGVtZW50IG9mIHpvbmVzKSB7XHJcbiAgICBibF9zcHJpdGVzLnNwcml0ZSh7XHJcbiAgICAgICAgY29vcmRzOiBlbGVtZW50LmNvb3JkcyxcclxuICAgICAgICBzaGFwZTogJ2hleCcsXHJcbiAgICAgICAga2V5OiBjb25maWcub3BlbkNvbnRyb2wsXHJcbiAgICAgICAgZGlzdGFuY2U6IDMuMCxcclxuICAgICAgICBvbkVudGVyOiAoKSA9PiBpc0luU3ByaXRlID0gZWxlbWVudC50eXBlLFxyXG4gICAgICAgIG9uRXhpdDogKCkgPT4gaXNJblNwcml0ZSA9IG51bGxcclxuICAgIH0pXHJcbn0iXSwKICAibWFwcGluZ3MiOiAiOzs7O0FBU08sSUFBTSxlQUFlLHdCQUFDLFFBQWdCLFNBQWM7QUFDdkQsaUJBQWU7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLEVBQ0osQ0FBQztBQUNMLEdBTDRCO0FBT3JCLElBQU0sUUFBUSx3QkFBQyxPQUFlLElBQUksUUFBUSxTQUFPLFdBQVcsS0FBSyxFQUFFLENBQUMsR0FBdEQ7QUFFZCxJQUFNLGVBQWUsOEJBQU8sVUFBNEM7QUFDM0UsTUFBSSxZQUFvQixPQUFPLFVBQVUsV0FBVyxRQUFRLFdBQVcsS0FBSztBQUU1RSxNQUFJLENBQUMsYUFBYSxTQUFTLEdBQUc7QUFDMUIsWUFBUSxVQUFVLE9BQU8sRUFBRTtBQUFBLE1BQ3ZCLE9BQU87QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxJQUNkLENBQUM7QUFFRCxVQUFNLElBQUksTUFBTSxvQ0FBb0MsS0FBSyxHQUFHO0FBQUEsRUFDaEU7QUFFQSxNQUFJLGVBQWUsU0FBUztBQUFHLFdBQU87QUFFdEMsZUFBYSxTQUFTO0FBRXRCLFFBQU0scUJBQXFCLDZCQUFxQjtBQUM1QyxXQUFPLElBQUksUUFBUSxhQUFXO0FBQzFCLFlBQU0sV0FBVyxZQUFZLE1BQU07QUFDL0IsWUFBSSxlQUFlLFNBQVMsR0FBRztBQUMzQix3QkFBYyxRQUFRO0FBQ3RCLGtCQUFRO0FBQUEsUUFDWjtBQUFBLE1BQ0osR0FBRyxHQUFHO0FBQUEsSUFDVixDQUFDO0FBQUEsRUFDTCxHQVQyQjtBQVczQixRQUFNLG1CQUFtQjtBQUV6QixTQUFPO0FBQ1gsR0EvQjRCO0FBcUM1QixJQUFNLGVBQWUsdUJBQXVCO0FBQzVDLElBQU0sY0FBc0MsQ0FBQztBQUM3QyxJQUFNLGVBQXlELENBQUM7QUFFaEUsU0FBUyxXQUFXLFdBQW1CQSxRQUFzQjtBQUN6RCxNQUFJQSxVQUFTQSxTQUFRLEdBQUc7QUFDcEIsVUFBTSxjQUFjLGFBQWE7QUFFakMsU0FBSyxZQUFZLFNBQVMsS0FBSyxLQUFLO0FBQWEsYUFBTztBQUV4RCxnQkFBWSxTQUFTLElBQUksY0FBY0E7QUFBQSxFQUMzQztBQUVBLFNBQU87QUFDWDtBQVZTO0FBWVQsTUFBTSxXQUFXLFlBQVksSUFBSSxDQUFDLFFBQWdCLFNBQWM7QUFDNUQsUUFBTSxVQUFVLGFBQWEsR0FBRztBQUNoQyxTQUFPLFdBQVcsUUFBUSxHQUFHLElBQUk7QUFDckMsQ0FBQztBQUVNLFNBQVMsc0JBQ1osY0FBc0IsTUFDTDtBQUNqQixNQUFJLENBQUMsV0FBVyxXQUFXLENBQUMsR0FBRztBQUMzQjtBQUFBLEVBQ0o7QUFFQSxNQUFJO0FBRUosS0FBRztBQUNDLFVBQU0sR0FBRyxTQUFTLElBQUksS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLE1BQVMsRUFBRSxDQUFDO0FBQUEsRUFDbEUsU0FBUyxhQUFhLEdBQUc7QUFFekIsVUFBUSxXQUFXLFNBQVMsSUFBSSxjQUFjLEtBQUssR0FBRyxJQUFJO0FBRTFELFNBQU8sSUFBSSxRQUFXLENBQUMsWUFBWTtBQUMvQixpQkFBYSxHQUFHLElBQUk7QUFBQSxFQUN4QixDQUFDO0FBQ0w7QUFsQmdCO0FBc0JULElBQU0sZ0JBQWdCLHdCQUFDLG9CQUE0QjtBQUN0RCxTQUFPLElBQUksUUFBUSxDQUFDLFlBQVk7QUFDNUIsVUFBTSxvQkFBb0IsNkJBQU07QUFDNUIsVUFBSSx1QkFBdUIsZUFBZSxHQUFHO0FBQ3pDLGNBQU0sYUFBYSxRQUFRLGNBQWMsT0FBTyxFQUFFO0FBQ2xELFlBQUksb0JBQW9CLGlCQUFpQixjQUFjLFVBQVUsVUFBVSxPQUFPO0FBQ2xGLFlBQUksQ0FBQyxtQkFBbUI7QUFDcEIsa0JBQVEsTUFBTSxHQUFHLFVBQVUscUVBQXFFO0FBQ2hHLDhCQUFvQixpQkFBaUIsY0FBYyxnQkFBZ0I7QUFBQSxRQUN2RTtBQUNBLGdCQUFRLGlCQUFpQjtBQUFBLE1BQzdCLE9BQU87QUFDSCxtQkFBVyxtQkFBbUIsR0FBRztBQUFBLE1BQ3JDO0FBQUEsSUFDSixHQVowQjtBQWExQixzQkFBa0I7QUFBQSxFQUN0QixDQUFDO0FBQ0wsR0FqQjZCO0FBMkJ0QixJQUFNLGlCQUFpQiw2QkFBTTtBQUNoQyxRQUFNLFlBQVksUUFBUTtBQUMxQixRQUFNLEtBQUssVUFBVSxLQUFLLEVBQUUsY0FBYyxFQUFFO0FBQzVDLFVBQVEsSUFBSSxnQkFBZ0IsRUFBRTtBQUM5QixTQUFPO0FBQ1gsR0FMOEI7OztBQ3pIOUIsSUFBSSxVQUFtQjtBQUN2QixJQUFJLGNBQXNCO0FBQzFCLElBQUksTUFBcUI7QUFDekIsSUFBSSxTQUFpQjtBQUNyQixJQUFJLFNBQWlCO0FBQ3JCLElBQUksZUFBK0I7QUFDbkMsSUFBSSxTQUF3QjtBQUM1QixJQUFJLGNBQXVCO0FBQzNCLElBQUksUUFBZ0I7QUFDcEIsSUFBSSxjQUFpQztBQUNyQyxJQUFJO0FBRUosSUFBTSxjQUEyQjtBQUFBLEVBQ2hDLE1BQU07QUFBQSxFQUNOLE9BQU87QUFBQSxFQUNQLE1BQU07QUFDUDtBQUVBLElBQU0sTUFBTSx3QkFBQyxZQUE0QjtBQUN4QyxTQUFPLEtBQUssSUFBSyxVQUFVLEtBQUssS0FBTSxHQUFHO0FBQzFDLEdBRlk7QUFJWixJQUFNLE1BQU0sd0JBQUMsWUFBNEI7QUFDeEMsU0FBTyxLQUFLLElBQUssVUFBVSxLQUFLLEtBQU0sR0FBRztBQUMxQyxHQUZZO0FBSVosSUFBTSxZQUFZLDZCQUFnQjtBQUNqQyxRQUFNLEtBQ0gsSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLEtBQUssSUFDM0Q7QUFDRCxRQUFNLEtBQ0gsSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxNQUFNLEtBQUssSUFDM0Q7QUFDRCxRQUFNLElBQUksSUFBSSxNQUFNLElBQUk7QUFFeEIsU0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLEdBVmtCO0FBWWxCLElBQU0saUJBQWlCLHdCQUFDLFFBQWlCLFdBQTBCO0FBQ2xFLE1BQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCO0FBQWE7QUFFOUMsV0FBUyxVQUFVO0FBQ25CLFdBQVMsVUFBVTtBQUVuQixZQUFVO0FBQ1YsWUFBVTtBQUNWLFdBQVMsS0FBSyxJQUFJLEtBQUssSUFBSSxRQUFRLENBQUcsR0FBRyxFQUFJO0FBRTdDLFFBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLFVBQVU7QUFFNUI7QUFBQSxJQUNDO0FBQUEsSUFDQSxhQUFhLElBQUk7QUFBQSxJQUNqQixhQUFhLElBQUk7QUFBQSxJQUNqQixhQUFhLElBQUk7QUFBQSxFQUNsQjtBQUNBLGtCQUFnQixLQUFLLGFBQWEsR0FBRyxhQUFhLEdBQUcsYUFBYSxDQUFDO0FBQ3BFLEdBbkJ1QjtBQXFCdkIsSUFBTSxhQUFhLDhCQUFPLFFBQWlCLGFBQXNCO0FBQzdELFFBQU0sWUFBWTtBQUNyQixRQUFNLFVBQWtCLGlCQUFpQixHQUFHLElBQUk7QUFDaEQsYUFBVyxZQUFZO0FBRXZCLGdCQUFjO0FBQ2QsZ0JBQWM7QUFDZCxXQUFTO0FBRVQsUUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksVUFBVTtBQUU1QixRQUFNLFNBQWlCO0FBQUEsSUFDdEI7QUFBQSxJQUNBLE9BQU8sSUFBSTtBQUFBLElBQ1gsT0FBTyxJQUFJO0FBQUEsSUFDWCxPQUFPLElBQUk7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNEO0FBRUEsaUJBQWU7QUFDZixnQkFBYztBQUNkLFdBQVM7QUFDVCxRQUFNO0FBRU4sa0JBQWdCLFFBQVEsT0FBTyxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDcEQseUJBQXVCLFFBQVEsUUFBUSxLQUFLLEdBQUcsQ0FBQztBQUVoRCxRQUFNLE1BQU0sR0FBRztBQUVmLDBCQUF3QixRQUFRLElBQUk7QUFDcEMsZ0JBQWMsUUFBUSxHQUFHO0FBQ3pCLGVBQWEsUUFBUSxHQUFHO0FBQ3hCLG9CQUFrQixRQUFRLEdBQUc7QUFDN0IsV0FBUyxNQUFNO0FBRWYsYUFBVyxRQUFRLElBQUk7QUFDeEIsR0F6Q21CO0FBMkNuQixJQUFNLFdBQVcsd0JBQUMsZUFBdUI7QUFDeEMsTUFBSSxFQUFFLGFBQWEsR0FBRyxLQUFLLGNBQWM7QUFBTTtBQUMvQyxjQUFZO0FBQ1osYUFBVyxVQUFVLENBQUM7QUFDdkIsR0FKaUI7QUFNVixJQUFNLGNBQWMsNkJBQU07QUFDaEMsTUFBSTtBQUFTO0FBQ1YsUUFBTSxZQUFZO0FBQ3JCLFlBQVU7QUFDVixnQkFBYztBQUNkLFFBQU0sVUFBVSwyQkFBMkIsSUFBSTtBQUMvQyxRQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBYyxpQkFBaUIsS0FBSyxPQUFPLEdBQUssR0FBSyxDQUFHO0FBQ3RFLGNBQVksS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUN4QixtQkFBaUIsTUFBTSxNQUFNLEtBQU0sTUFBTSxJQUFJO0FBQzdDLGFBQVcsRUFBRSxHQUFNLEdBQU0sRUFBSyxHQUFHLFdBQVc7QUFDN0MsR0FWMkI7QUFZcEIsSUFBTSxhQUFhLDZCQUFZO0FBQ3JDLE1BQUksQ0FBQztBQUFTO0FBQ2QsWUFBVTtBQUVWLG1CQUFpQixPQUFPLE1BQU0sS0FBSyxNQUFNLEtBQUs7QUFDOUMsYUFBVyxLQUFLLElBQUk7QUFDcEIsUUFBTTtBQUNOLGlCQUFlO0FBQ2hCLEdBUjBCO0FBVTFCLElBQU0sWUFBWSx3QkFBQyxTQUFtQztBQUNyRCxRQUFNLE9BQTJCLFlBQVksSUFBSTtBQUNqRCxNQUFJLGVBQWU7QUFBTTtBQUV6QixRQUFNLFlBQVk7QUFDbEIsUUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQWMsT0FDekIsaUJBQWlCLEtBQUssTUFBTSxHQUFLLEdBQUssU0FBUyxRQUFRLE1BQU0sQ0FBRyxJQUNoRSxnQkFBZ0IsS0FBSyxLQUFLO0FBRTdCO0FBQUEsSUFDQztBQUFBLE1BQ0M7QUFBQSxNQUNBO0FBQUEsTUFDQSxHQUFHLElBQUk7QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLEVBQ0Q7QUFFQSxnQkFBYztBQUNmLEdBbkJrQjtBQXFCbEIsd0RBQXFDLENBQUMsTUFBTSxPQUFPO0FBQ2xELEtBQUcsQ0FBQztBQUNELFFBQU0sWUFBWTtBQUNyQixNQUFJLFVBQWtCLGlCQUFpQixHQUFHO0FBQzFDLE1BQUksU0FBUyxLQUFLLEdBQUc7QUFDcEI7QUFBQSxFQUNEO0FBQ0EsWUFBVSxLQUFLLElBQUksUUFBUSxVQUFVLElBQUksVUFBVTtBQUNuRCxtQkFBaUIsS0FBSyxPQUFPO0FBQzlCLENBQUM7QUFFRCw0REFBdUMsQ0FBQyxNQUFjLE9BQWlCO0FBQ3RFLFVBQVEsTUFBTTtBQUFBLElBQ2IsS0FBSztBQUNKLGdCQUFVO0FBQ1Y7QUFBQSxJQUNELEtBQUs7QUFDSixnQkFBVSxNQUFNO0FBQ2hCO0FBQUEsSUFDRCxLQUFLO0FBQ0osZ0JBQVUsTUFBTTtBQUNoQjtBQUFBLEVBQ0Y7QUFDQSxLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsd0RBQXFDLENBQUMsTUFBTSxPQUFPO0FBQ2xELE1BQUksU0FBUyxRQUFRO0FBQ3BCLFVBQU0sY0FBc0IsY0FBYztBQUMxQyxrQkFBYyxlQUFlLElBQU0sSUFBTTtBQUFBLEVBQzFDLFdBQVcsU0FBUyxNQUFNO0FBQ3pCLFVBQU0sY0FBc0IsY0FBYztBQUMxQyxrQkFBYyxlQUFlLE9BQU8sT0FBTztBQUFBLEVBQzVDO0FBRUEsZ0JBQWM7QUFDZCxpQkFBZTtBQUNmLEtBQUcsQ0FBQztBQUNMLENBQUM7OztBQ2pNRCxJQUFPLGVBQVE7QUFBQSxFQUNYO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKOzs7QUNmQSxJQUFPLGVBQVE7QUFBQSxFQUNYO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKOzs7QUNyQkEsSUFBTyxvQkFBUTtBQUFBLEVBQ1g7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKOzs7QUNiQSxJQUFPLGdCQUFRO0FBQUEsRUFDWDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDSjs7O0FDSE8sU0FBUyxlQUFnQixRQUFnQjtBQUM1QyxRQUFNQyxVQUFTLFFBQVE7QUFDdkIsUUFBTSxTQUFTQSxRQUFPLE9BQU87QUFFN0IsU0FBTyxPQUFPLFVBQVUsQ0FBQyxVQUFVLFdBQVcsS0FBSyxNQUFPLE1BQU07QUFDcEU7QUFMZ0I7QUFPVCxTQUFTLFFBQVNDLE1BQXdCO0FBQzdDLEVBQUFBLE9BQU1BLFFBQU8sWUFBWTtBQUN6QixTQUFPO0FBQUEsSUFDSCxPQUFPLGdCQUFnQkEsSUFBRztBQUFBLElBQzFCLFdBQVcseUJBQXlCQSxJQUFHO0FBQUEsRUFDM0M7QUFDSjtBQU5nQjtBQVFULFNBQVMsaUJBQWlCQSxNQUFhO0FBQzFDLEVBQUFBLE9BQU1BLFFBQU8sWUFBWTtBQUV6QixRQUFNLGdCQUFnQixRQUFRLGNBQWMsaUJBQWlCQSxJQUFHO0FBRWhFLFNBQU87QUFBQSxJQUNILFlBQVksY0FBYztBQUFBO0FBQUEsSUFDMUIsYUFBYSxjQUFjO0FBQUE7QUFBQSxJQUMzQixZQUFZLGNBQWM7QUFBQSxJQUUxQixXQUFXLGNBQWM7QUFBQSxJQUN6QixZQUFZLGNBQWM7QUFBQSxJQUMxQixXQUFXLGNBQWM7QUFBQSxJQUV6QixVQUFVLGNBQWM7QUFBQTtBQUFBLElBRXhCLFVBQVUsY0FBYztBQUFBLElBQ3hCLFNBQVMsY0FBYztBQUFBO0FBQUEsSUFFdkIsV0FBVyxjQUFjO0FBQUEsRUFDN0I7QUFDSjtBQXJCZ0I7QUF1QlQsU0FBUyxlQUFlQSxNQUFhO0FBQ3hDLEVBQUFBLE9BQU1BLFFBQU8sWUFBWTtBQUV6QixNQUFJLFNBQTRCLENBQUM7QUFDakMsTUFBSSxXQUF5QixDQUFDO0FBRTlCLFdBQVMsSUFBSSxHQUFHLElBQUksYUFBYyxRQUFRLEtBQUs7QUFDM0MsVUFBTSxVQUFVLGFBQWMsQ0FBQztBQUMvQixXQUFPLE9BQU8sSUFBSSx3QkFBd0IsQ0FBQztBQUUzQyxRQUFJLFlBQVksWUFBWTtBQUN4QixlQUFTLE9BQU8sSUFBSTtBQUFBLFFBQ2hCLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGNBQWMsZUFBZUEsSUFBRztBQUFBLE1BQ3BDO0FBQUEsSUFDSixPQUFPO0FBQ0gsWUFBTSxDQUFDLEdBQUcsY0FBYyxZQUFZLFlBQVksYUFBYSxjQUFjLElBQUksc0JBQXNCQSxNQUFLLENBQUM7QUFDM0csZUFBUyxPQUFPLElBQUk7QUFBQSxRQUNoQixJQUFJO0FBQUEsUUFDSixPQUFPLElBQUk7QUFBQSxRQUNYLGNBQWMsaUJBQWlCLE1BQU0sS0FBSztBQUFBLFFBQzFDO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsU0FBTyxDQUFDLFVBQVUsTUFBTTtBQUM1QjtBQS9CZ0I7QUFpQ1QsU0FBUyxpQkFBaUJBLE1BQWE7QUFDMUMsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBRXpCLFFBQU0sV0FBVyxlQUFlQSxJQUFHO0FBRW5DLE1BQUksYUFBYSxXQUFXLGtCQUFrQixLQUFLLGFBQWEsV0FBVyxrQkFBa0I7QUFBRztBQUVoRyxNQUFJLGFBQWEsQ0FBQztBQUNsQixXQUFTLElBQUksR0FBRyxJQUFJLGFBQWMsUUFBUSxLQUFLO0FBQzNDLFVBQU0sVUFBVSxhQUFjLENBQUM7QUFDL0IsZUFBVyxPQUFPLElBQUk7QUFBQSxNQUNsQixJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxPQUFPLGtCQUFrQkEsTUFBSyxDQUFDO0FBQUEsSUFDbkM7QUFBQSxFQUNKO0FBRUEsU0FBTztBQUNYO0FBbEJnQjtBQW9CVCxTQUFTLGFBQWFBLE1BQWE7QUFDdEMsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBRXpCLE1BQUksWUFBWSxDQUFDO0FBQ2pCLE1BQUksaUJBQWlCLENBQUM7QUFFdEIsV0FBUyxJQUFJLEdBQUcsSUFBSSxrQkFBZSxRQUFRLEtBQUs7QUFDNUMsVUFBTSxPQUFPLGtCQUFlLENBQUM7QUFDN0IsVUFBTSxVQUFVLHdCQUF3QkEsTUFBSyxDQUFDO0FBRTlDLG1CQUFlLElBQUksSUFBSTtBQUFBLE1BQ25CLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLE9BQU8saUNBQWlDQSxNQUFLLENBQUM7QUFBQSxNQUM5QyxVQUFVLGdDQUFnQ0EsTUFBSyxHQUFHLE9BQU87QUFBQSxJQUM3RDtBQUNBLGNBQVUsSUFBSSxJQUFJO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxPQUFPLHdCQUF3QkEsTUFBSyxDQUFDO0FBQUEsTUFDckMsU0FBUyx1QkFBdUJBLE1BQUssQ0FBQztBQUFBLElBQzFDO0FBQUEsRUFDSjtBQUVBLFNBQU8sQ0FBQyxXQUFXLGNBQWM7QUFDckM7QUF6QmdCO0FBMkJULFNBQVMsU0FBU0EsTUFBYTtBQUNsQyxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFFekIsTUFBSSxRQUFRLENBQUM7QUFDYixNQUFJLGFBQWEsQ0FBQztBQUVsQixXQUFTLElBQUksR0FBRyxJQUFJLGNBQVcsUUFBUSxLQUFLO0FBQ3hDLFVBQU0sT0FBTyxjQUFXLENBQUM7QUFDekIsVUFBTSxVQUFVLGdCQUFnQkEsTUFBSyxDQUFDO0FBRXRDLGVBQVcsSUFBSSxJQUFJO0FBQUEsTUFDZixJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxPQUFPLHFDQUFxQ0EsTUFBSyxDQUFDO0FBQUEsTUFDbEQsVUFBVSxvQ0FBb0NBLE1BQUssR0FBRyxPQUFPO0FBQUEsSUFDakU7QUFFQSxVQUFNLElBQUksSUFBSTtBQUFBLE1BQ1YsSUFBSTtBQUFBLE1BQ0osT0FBTztBQUFBLE1BQ1AsT0FBTyxnQkFBZ0JBLE1BQUssQ0FBQztBQUFBLE1BQzdCLFNBQVMsdUJBQXVCQSxNQUFLLENBQUM7QUFBQSxJQUMxQztBQUFBLEVBQ0o7QUFFQSxTQUFPLENBQUMsT0FBTyxVQUFVO0FBQzdCO0FBMUJnQjtBQTZCaEIsZUFBc0IsY0FBY0EsTUFBbUM7QUFDbkUsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBQ3pCLFFBQU0sQ0FBQyxVQUFVLE1BQU0sSUFBSSxlQUFlQSxJQUFHO0FBQzdDLFFBQU0sQ0FBQyxXQUFXLFNBQVMsSUFBSSxhQUFhQSxJQUFHO0FBQy9DLFFBQU0sQ0FBQyxPQUFPLFNBQVMsSUFBSSxTQUFTQSxJQUFHO0FBQ3ZDLFFBQU0sUUFBUSxlQUFlQSxJQUFHO0FBRWhDLFNBQU87QUFBQSxJQUNILFlBQVksZUFBZSxLQUFLO0FBQUEsSUFDaEM7QUFBQSxJQUNBLFdBQVcsUUFBUUEsSUFBRztBQUFBLElBQ3RCLFdBQVcsaUJBQWlCQSxJQUFHO0FBQUEsSUFDL0IsYUFBYTtBQUFBLElBQ2Isa0JBQWtCO0FBQUEsSUFDbEIsZUFBZSxpQkFBaUJBLElBQUc7QUFBQSxJQUNuQztBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0EsU0FBUyxDQUFDO0FBQUEsRUFDZDtBQUNKO0FBckJzQjtBQXNCdEIsUUFBUSxpQkFBaUIsYUFBYTtBQUUvQixTQUFTLGNBQWNBLE1BQWE7QUFDdkMsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBRXpCLFFBQU0sQ0FBQyxXQUFXLFNBQVMsSUFBSSxhQUFhQSxJQUFHO0FBQy9DLFFBQU0sQ0FBQyxPQUFPLFNBQVMsSUFBSSxTQUFTQSxJQUFHO0FBQ3ZDLFFBQU0sQ0FBQyxVQUFVLE1BQU0sSUFBSSxlQUFlQSxJQUFHO0FBRTdDLFNBQU87QUFBQSxJQUNILGFBQWE7QUFBQSxJQUNiO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFDSjtBQVpnQjtBQWFoQixRQUFRLGlCQUFpQixhQUFhO0FBRS9CLFNBQVMsV0FBV0EsTUFBYTtBQUNwQyxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFFekIsU0FBTztBQUFBLElBQ0gsV0FBVyxpQkFBaUJBLElBQUc7QUFBQSxJQUMvQixlQUFlLGlCQUFpQkEsSUFBRztBQUFBLElBQ25DLFdBQVcsUUFBUUEsSUFBRztBQUFBLElBQ3RCLE9BQVEsZUFBZUEsSUFBRztBQUFBLEVBQzlCO0FBQ0o7QUFUZ0I7QUFVaEIsUUFBUSxjQUFjLFVBQVU7QUFFekIsU0FBUyxnQkFBZ0I7QUFDNUIsTUFBSSxjQUFjLENBQUM7QUFFbkIsUUFBTSxDQUFDLGFBQWEsaUJBQWlCLElBQUksUUFBUSxjQUFjLFFBQVE7QUFDdkUsV0FBUyxJQUFJLEdBQUcsSUFBSSxrQkFBa0IsUUFBUSxLQUFLO0FBQy9DLFVBQU0sV0FBVyxrQkFBa0IsQ0FBQztBQUNwQyxVQUFNLE9BQU8sU0FBUztBQUN0QixVQUFNLFFBQVEsU0FBUztBQUN2QixVQUFNLFFBQVEsU0FBUztBQUN2QixnQkFBWSxLQUFLLElBQUk7QUFBQSxNQUNqQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFdBQVc7QUFBQSxNQUNYLE1BQU0sQ0FBQztBQUFBLElBQ1g7QUFFQSxhQUFTLElBQUksR0FBRyxJQUFJLFlBQVksUUFBUSxLQUFLO0FBQ3pDLFlBQU0sVUFBVSxZQUFZLENBQUM7QUFDN0Isa0JBQVksS0FBSyxFQUFFLEtBQUssS0FBSztBQUFBLFFBQ3pCLE9BQU8sUUFBUTtBQUFBLFFBQ2YsVUFBVTtBQUFBLFFBQ1YsU0FBUyxDQUFDO0FBQUEsTUFDZCxDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFFQSxRQUFNLFdBQVcsZUFBZSxZQUFZLENBQUMsTUFBTSxXQUFXLGtCQUFrQjtBQUVoRixXQUFTLElBQUksR0FBRyxJQUFJLFlBQVksUUFBUSxLQUFLO0FBQ3pDLFVBQU0sT0FBTyxZQUFZLENBQUM7QUFDMUIsVUFBTSxFQUFFLEtBQUssUUFBUSxJQUFJO0FBQ3pCLFVBQU0sVUFBVSxXQUFXLEdBQUc7QUFDOUIsYUFBUyxJQUFJLEdBQUcsSUFBSSxRQUFRLFFBQVEsS0FBSztBQUNyQyxZQUFNLGFBQWEsUUFBUSxDQUFDO0FBQzVCLFVBQUksU0FBUztBQUViLFlBQU0sY0FBYyxXQUFXLFlBQVk7QUFDM0MsWUFBTSxpQkFBaUIsWUFBWSxTQUFTLElBQUk7QUFDaEQsVUFBSSxrQkFBa0IsVUFBVTtBQUM1QixpQkFBUztBQUFBLE1BQ2IsV0FBVyxDQUFDLGtCQUFrQixDQUFDLFVBQVU7QUFDckMsaUJBQVM7QUFBQSxNQUNiO0FBRUEsVUFBSSxPQUFPO0FBQ1gsVUFBSSxPQUFPO0FBRVgsVUFBSSxRQUFRO0FBQ1IsZUFBTyxXQUFXLE1BQU07QUFDeEIsZUFBTywrQkFBK0IsU0FBUyxJQUFJO0FBQUEsTUFDdkQ7QUFFQSxVQUFJLFNBQVMsTUFBTSxNQUFNO0FBQ3JCLGNBQU0sY0FBYyxZQUFZLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRTtBQUU5QyxvQkFBWSxLQUFLO0FBQUEsVUFDYixPQUFPO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDSixDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsU0FBTztBQUNYO0FBbEVnQjs7O0FDMU1oQixJQUFPLGtCQUFRO0FBQUEsRUFDWCxNQUFNO0FBQUEsSUFDRixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxFQUNUO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsRUFDVDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLEVBQ1Q7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNGLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxFQUNUO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDSCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxLQUFLO0FBQUEsRUFDVDtBQUNKOzs7QUM5Qk8sU0FBUyxZQUFZQyxNQUFhLE1BQWM7QUFDbkQsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBRXpCLDJCQUF5QkEsTUFBSyxLQUFLLE9BQU8sS0FBSyxPQUFPLEtBQUssU0FBUyxDQUFDO0FBQ3pFO0FBSmdCO0FBTVQsU0FBUyxRQUFRQSxNQUFhLE1BQWM7QUFDL0MsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBRXpCLE1BQUksS0FBSyxVQUFVLElBQUk7QUFDbkIsaUJBQWFBLE1BQUssS0FBSyxLQUFLO0FBQzVCO0FBQUEsRUFDSjtBQUVBLGtCQUFnQkEsTUFBSyxLQUFLLE9BQU8sS0FBSyxPQUFPLEtBQUssU0FBUyxLQUFLO0FBQ3BFO0FBVGdCO0FBWVQsSUFBTSxXQUFXLDhCQUFPQSxNQUFhLFNBQVM7QUFDakQsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBQ3pCLFFBQU0sY0FBYyxPQUFPLFNBQVM7QUFDcEMsUUFBTSxRQUFRLGNBQWMsT0FBTyxLQUFLO0FBQ3hDLFFBQU0sV0FBVyxhQUFhQSxJQUFHO0FBRWpDLE1BQUksVUFBVTtBQUNWLFVBQU0sWUFBWSxNQUFNLGFBQWEsS0FBSztBQUMxQyxtQkFBZSxTQUFTLEdBQUcsU0FBUztBQUNwQyw2QkFBeUIsU0FBUztBQUNsQyxJQUFBQSxPQUFNLFlBQVk7QUFBQSxFQUN0QjtBQUNBLGtDQUFnQ0EsSUFBRztBQUVuQyxNQUFJLENBQUMsZUFBZSxLQUFLLGFBQWEsT0FBTyxLQUFLLEtBQUssU0FBUyxFQUFFO0FBQVEsaUJBQWFBLE1BQUssS0FBSyxTQUFTO0FBQzFHLFNBQU9BO0FBQ1gsR0FoQndCO0FBa0JqQixTQUFTLGVBQWVBLE1BQWEsTUFBYztBQUN0RCxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFDekIsb0JBQWtCQSxNQUFLLEtBQUssT0FBTyxLQUFLLFFBQVEsQ0FBRztBQUN2RDtBQUhnQjtBQUtoQixJQUFNLGFBQWEsd0JBQUMsUUFBZ0IsT0FBTyxJQUFJLE1BQU0sR0FBbEM7QUFFWixTQUFTLGFBQWFBLE1BQWEsTUFBTTtBQUM1QyxFQUFBQSxPQUFNQSxRQUFPLFlBQVk7QUFFekIsUUFBTSxhQUFhLFdBQVcsS0FBSyxVQUFVO0FBQzdDLFFBQU0sY0FBYyxXQUFXLEtBQUssV0FBVztBQUMvQyxRQUFNLGFBQWEsV0FBVyxLQUFLLFVBQVU7QUFDN0MsUUFBTSxZQUFZLFdBQVcsS0FBSyxTQUFTO0FBQzNDLFFBQU0sYUFBYSxXQUFXLEtBQUssVUFBVTtBQUM3QyxRQUFNLFlBQVksV0FBVyxLQUFLLFNBQVM7QUFDM0MsUUFBTSxXQUFXLEtBQUssV0FBVztBQUNqQyxRQUFNLFVBQVUsS0FBSyxVQUFVO0FBQy9CLFFBQU0sV0FBVyxLQUFLLFdBQVc7QUFDakMsUUFBTSxZQUFZLEtBQUs7QUFFdkI7QUFBQSxJQUFvQkE7QUFBQSxJQUFLO0FBQUEsSUFBWTtBQUFBLElBQWE7QUFBQSxJQUFZO0FBQUEsSUFBVztBQUFBLElBQVk7QUFBQSxJQUFXO0FBQUEsSUFBVTtBQUFBLElBQ3RHO0FBQUEsSUFBVTtBQUFBLEVBQVM7QUFDM0I7QUFoQmdCO0FBa0JULFNBQVMsZUFBZUEsTUFBYSxNQUFNO0FBQzlDLEVBQUFBLE9BQU1BLFFBQU8sWUFBWTtBQUN6QixRQUFNLFFBQVEsS0FBSztBQUVuQixNQUFJLFVBQVUsSUFBSTtBQUNkLG1CQUFlQSxNQUFLLEtBQUssS0FBSztBQUM5QjtBQUFBLEVBQ0o7QUFFQSxRQUFNLFFBQVEsS0FBSyxpQkFBaUIsS0FBSyxNQUFNLEtBQUs7QUFFcEQsb0JBQWtCQSxNQUFLLE9BQU8sT0FBTyxLQUFLLGlCQUFpQixDQUFHO0FBQzlELHlCQUF1QkEsTUFBSyxPQUFPLEdBQUcsS0FBSyxZQUFZLEtBQUssV0FBVztBQUMzRTtBQWJnQjtBQXVDVCxTQUFTLGFBQWEsTUFBTTtBQUMvQixRQUFNQSxPQUFNLFlBQVk7QUFDeEIsUUFBTSxZQUFZLEtBQUs7QUFDdkIsUUFBTSxRQUFRLEtBQUs7QUFFbkIsYUFBVyxDQUFDLFlBQVksVUFBVSxLQUFLLE9BQU8sUUFBUSxlQUFjLEdBQUc7QUFDbkUsVUFBTSxhQUFhLFdBQVc7QUFDOUIsVUFBTSxRQUFRLFdBQVc7QUFFekIsUUFBSSxlQUFlLGNBQWMsVUFBVSxVQUFVLEdBQUc7QUFDcEQsWUFBTSxrQkFBa0Isd0JBQXdCQSxNQUFLLEtBQUs7QUFDMUQsVUFBSSxvQkFBb0IsVUFBVSxVQUFVLEVBQUUsT0FBTztBQUNqRCxpQ0FBeUJBLE1BQUssT0FBTyxVQUFVLFVBQVUsRUFBRSxPQUFPLEdBQUcsQ0FBQztBQUFBLE1BQzFFO0FBQUEsSUFDSixXQUFXLGVBQWUsVUFBVSxNQUFNLFVBQVUsR0FBRztBQUNuRCxZQUFNLGNBQWMsZ0JBQWdCQSxNQUFLLEtBQUs7QUFDOUMsVUFBSSxnQkFBZ0IsTUFBTSxVQUFVLEVBQUUsT0FBTztBQUN6Qyx3QkFBZ0JBLE1BQUssT0FBTyxNQUFNLFVBQVUsRUFBRSxPQUFPLEdBQUcsS0FBSztBQUFBLE1BQ2pFO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFDSjtBQXJCZ0I7QUF1QlQsU0FBUyxjQUFjQSxNQUFhLE1BQU07QUFDN0MsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBRXpCLFFBQU0sWUFBWSxLQUFLO0FBQ3ZCLFFBQU0sUUFBUSxLQUFLO0FBQ25CLFFBQU0sY0FBYyxLQUFLO0FBQ3pCLFVBQVEsSUFBSSxhQUFhLFNBQVM7QUFDbEMsYUFBVyxNQUFNLFdBQVc7QUFDeEIsVUFBTSxXQUFXLFVBQVUsRUFBRTtBQUM3QixnQkFBWUEsTUFBSyxRQUFRO0FBQUEsRUFDN0I7QUFFQSxhQUFXLE1BQU0sT0FBTztBQUNwQixVQUFNLE9BQU8sTUFBTSxFQUFFO0FBQ3JCLFlBQVFBLE1BQUssSUFBSTtBQUFBLEVBQ3JCO0FBRUEsYUFBVyxNQUFNLGFBQWE7QUFDMUIsVUFBTSxVQUFVLFlBQVksRUFBRTtBQUM5QixtQkFBZUEsTUFBSyxPQUFPO0FBQUEsRUFDL0I7QUFDSjtBQXJCZ0I7QUF1QlQsSUFBTSxhQUFhLDhCQUFPQSxNQUFhLFNBQVM7QUFDbkQsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBQ3pCLFFBQU0sZ0JBQWdCLEtBQUs7QUFDM0IsUUFBTSxZQUFZLEtBQUs7QUFFdkIsRUFBQUEsT0FBTSxNQUFNLFNBQVNBLE1BQUssSUFBSTtBQUM5QixNQUFJLFdBQVc7QUFDWCxpQkFBYUEsTUFBSyxTQUFTO0FBQUEsRUFDL0I7QUFDQSxNQUFJLGVBQWU7QUFDZixlQUFXLFdBQVcsZUFBZTtBQUNqQyxxQkFBZUEsTUFBSyxPQUFPO0FBQUEsSUFDL0I7QUFBQSxFQUNKO0FBQ0osR0FkMEI7QUFnQm5CLFNBQVMsY0FBY0EsTUFBYSxNQUFNO0FBQzdDLE1BQUksQ0FBQztBQUFNO0FBQ1gsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBRXpCLFFBQU0sV0FBVyxhQUFhQSxJQUFHO0FBQ2pDLE1BQUksVUFBVTtBQUNWLElBQUFBLE9BQU0sWUFBWTtBQUFBLEVBQ3RCO0FBRUEsZ0NBQThCQSxJQUFHO0FBRWpDLFdBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEtBQUs7QUFDbEMsVUFBTSxhQUFhLEtBQUssQ0FBQyxFQUFFO0FBQzNCLFFBQUksWUFBWTtBQUNaLFlBQU0sYUFBYSxXQUFXLFdBQVcsR0FBRztBQUM1QyxZQUFNLFNBQVMsV0FBVztBQUMxQixpQ0FBMkJBLE1BQUssWUFBWSxNQUFNO0FBQUEsSUFDdEQ7QUFBQSxFQUNKO0FBQ0o7QUFuQmdCO0FBcUJULFNBQVMsaUJBQWlCQSxNQUFhLE1BQU07QUFDaEQsRUFBQUEsT0FBTUEsUUFBTyxZQUFZO0FBRXpCLFFBQU0sUUFBUSxLQUFLO0FBQ25CLFFBQU0sWUFBWSxLQUFLO0FBQ3ZCLGtCQUFnQkEsTUFBSyxPQUFPLFNBQVM7QUFDekM7QUFOZ0I7QUFRVCxTQUFTLGlCQUFpQkEsTUFBYSxNQUFNO0FBQ2hELGFBQVdBLE1BQUssSUFBSTtBQUNwQixnQkFBY0EsTUFBSyxJQUFJO0FBQ3ZCLG1CQUFpQkEsTUFBSyxLQUFLLFNBQVM7QUFDcEMsZ0JBQWNBLE1BQUssS0FBSyxPQUFPO0FBQ25DO0FBTGdCO0FBT1QsU0FBUyx1QkFBdUIsTUFBTTtBQUN6QyxhQUFXLFlBQVksR0FBRyxJQUFJO0FBQzlCLGdCQUFjLFlBQVksR0FBRyxJQUFJO0FBQ2pDLG1CQUFpQixZQUFZLEdBQUcsS0FBSyxTQUFTO0FBQzlDLGdCQUFjLFlBQVksR0FBRyxLQUFLLE9BQU87QUFDN0M7QUFMZ0I7OztBQ3hMaEIsc0RBQW9DLENBQUMsWUFBeUIsT0FBaUI7QUFDOUUseUJBQXVCLFVBQVU7QUFDakMsWUFBVTtBQUNWLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRDtBQUFBO0FBQUEsRUFFQyxPQUFPLFlBQXlCLE9BQWlCO0FBQzFDLFlBQVEsSUFBSSxNQUFNO0FBQ3hCLGlCQUFhLFVBQVU7QUFFdkIsVUFBTSxNQUFNLEdBQUc7QUFFZixVQUFNQyxPQUFNLFlBQVk7QUFFeEIsVUFBTSxnQkFBZ0IsTUFBTSxjQUFjQSxJQUFHO0FBRTdDLFVBQU0sZUFBZSxlQUFlO0FBRXBDO0FBQUEsTUFDQztBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRDtBQUVBLGtCQUFjQSxNQUFLLFdBQVcsT0FBTztBQUVyQyxjQUFVO0FBQ1YsT0FBRyxDQUFDO0FBQUEsRUFDTDtBQUNEO0FBRUEsMERBQXNDLE9BQU8sT0FBZSxPQUFpQjtBQUM1RSxRQUFNLE9BQU8sV0FBVyxLQUFLO0FBQzdCLE1BQUksQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLENBQUMsYUFBYSxJQUFJLEdBQUc7QUFDbkQsV0FBTyxHQUFHLENBQUM7QUFBQSxFQUNaO0FBRUEsUUFBTUEsT0FBTSxZQUFZO0FBRXhCLFFBQU0sU0FBU0EsTUFBSyxJQUFJO0FBRXhCLFFBQU0sYUFBYSxNQUFNLGNBQWNBLElBQUc7QUFFMUMsYUFBVyxVQUFVLENBQUM7QUFFdEIsS0FBRyxVQUFVO0FBQ2QsQ0FBQztBQUVELHdFQUE2QyxPQUFPLEdBQVEsT0FBaUI7QUFDNUUsUUFBTSxVQUFVLGNBQWM7QUFFOUIsS0FBRyxPQUFPO0FBQ1gsQ0FBQztBQUVEO0FBQUE7QUFBQSxFQUVDLE9BQU8sTUFBYyxPQUFpQjtBQUNyQyxVQUFNQSxPQUFNLFlBQVk7QUFDeEIsbUJBQWVBLE1BQUssSUFBSTtBQUN4QixPQUFHLENBQUM7QUFBQSxFQUNMO0FBQ0Q7QUFFQTtBQUFBO0FBQUEsRUFFQyxPQUFPLE1BQWMsT0FBaUI7QUFDckMsVUFBTUEsT0FBTSxZQUFZO0FBQ3hCLG1CQUFlQSxNQUFLLElBQUk7QUFDeEIsT0FBRyxDQUFDO0FBQUEsRUFDTDtBQUNEO0FBRUE7QUFBQTtBQUFBLEVBRUMsT0FBTyxNQUFjLE9BQWlCO0FBQ3JDLFVBQU1BLE9BQU0sWUFBWTtBQUN4QixpQkFBYUEsTUFBSyxJQUFJO0FBQ3RCLE9BQUcsQ0FBQztBQUFBLEVBQ0w7QUFDRDtBQUVBLDhEQUF3QyxPQUFPLE1BQWMsT0FBaUI7QUFDN0UsUUFBTUEsT0FBTSxZQUFZO0FBQ3hCLGdCQUFjQSxNQUFLLElBQUk7QUFDdkIsS0FBRyxDQUFDO0FBQ0wsQ0FBQztBQUVELHdEQUFxQyxPQUFPLE1BQWMsT0FBaUI7QUFDMUUsUUFBTUEsT0FBTSxZQUFZO0FBQ3hCLFVBQVFBLE1BQUssSUFBSTtBQUNqQixLQUFHLENBQUM7QUFDTCxDQUFDO0FBRUQsZ0VBQXlDLE9BQU8sTUFBYyxPQUFpQjtBQUM5RSxRQUFNQSxPQUFNLFlBQVk7QUFDeEIsY0FBWUEsTUFBSyxJQUFJO0FBQ3JCLEtBQUcsQ0FBQztBQUNMLENBQUM7QUFFRDtBQUFBO0FBQUEsRUFFQyxPQUFPLE1BQW1CLE9BQWlCO0FBQ3BDLFVBQU0sT0FBTyxnQkFBZSxLQUFLLElBQUk7QUFDM0MsUUFBSSxDQUFDO0FBQU0sYUFBTyxHQUFHLEtBQUs7QUFFMUIsVUFBTSxVQUFVLEtBQUs7QUFDckIsVUFBTSxPQUFPLEtBQUs7QUFDbEIsVUFBTSxRQUFRLEtBQUs7QUFFbkIsUUFBSSxDQUFDO0FBQVMsYUFBTyxHQUFHLEtBQUs7QUFFN0IsVUFBTUEsT0FBTSxZQUFZO0FBRXhCLFFBQUksU0FBUyxRQUFRO0FBQ3BCLFlBQU0sY0FBYyxnQkFBZ0JBLE1BQUssS0FBSztBQUU5QyxVQUFJLGdCQUFnQixJQUFJO0FBQ3ZCLGdCQUFRQSxNQUFLLE9BQU87QUFDcEIsV0FBRyxLQUFLO0FBQ1I7QUFBQSxNQUNELE9BQU87QUFDTixxQkFBYUEsTUFBSyxLQUFLO0FBQ3ZCLFdBQUcsSUFBSTtBQUNQO0FBQUEsTUFDRDtBQUFBLElBQ0QsV0FBVyxTQUFTLFlBQVk7QUFDdEIsWUFBTSxrQkFBa0Isd0JBQXdCQSxNQUFLLEtBQUs7QUFFMUQsVUFBSSxRQUFRLFVBQVUsS0FBSyxLQUFLO0FBQzVCLFdBQUcsS0FBSztBQUNSO0FBQUEsTUFDSjtBQUVBLFVBQUksUUFBUSxVQUFVLGlCQUFpQjtBQUNuQyxpQ0FBeUJBLE1BQUssT0FBTyxLQUFLLEtBQUssR0FBRyxDQUFDO0FBQ25ELFdBQUcsSUFBSTtBQUNQO0FBQUEsTUFDSixPQUFPO0FBQ0gsb0JBQVlBLE1BQUssT0FBTztBQUN4QixXQUFHLEtBQUs7QUFDUjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsRUFDUDtBQUNEO0FBRUEsOERBQXdDLE9BQU8sTUFBVyxPQUFpQjtBQUN2RSxRQUFNLGVBQWUsZUFBZTtBQUNwQyxRQUFNLFNBQVMsTUFBTTtBQUFBLElBQ2pCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQ0EsS0FBRyxNQUFNO0FBQ2IsQ0FBQztBQUVELGtFQUEwQyxPQUFPLElBQVksT0FBaUI7QUFDMUUsUUFBTSxlQUFlLGVBQWU7QUFDcEMsUUFBTSxTQUFTLE1BQU07QUFBQSxJQUNqQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUNBLEtBQUcsTUFBTTtBQUNiLENBQUM7QUFFRCxrRUFBMEMsT0FBTyxNQUFXLE9BQWlCO0FBQ3pFLFFBQU0sZUFBZSxlQUFlO0FBQ3BDLFFBQU0sU0FBUyxNQUFNO0FBQUEsSUFDakI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFDQSxLQUFHLE1BQU07QUFDYixDQUFDO0FBRUQsNERBQXVDLE9BQU8sUUFBZ0IsT0FBaUI7QUFDM0UsVUFBUSxJQUFJLGFBQWEsTUFBTTtBQUMvQixnQkFBYyxZQUFZLEdBQUcsTUFBTTtBQUNuQyxLQUFHLENBQUM7QUFDUixDQUFDOzs7QUNsTUQsSUFBTSxTQUFTLFFBQVE7QUFDdkIsSUFBSSxTQUFTO0FBR2IsZUFBc0IsU0FBUyxNQUFrQixXQUFvQixPQUFPO0FBQ3hFLFFBQU1DLE9BQU0sWUFBWTtBQUV4QixRQUFNLGNBQWMsT0FBTyxNQUFNO0FBRWpDLFFBQU0sT0FBTyxZQUFZLElBQUk7QUFFN0IsVUFBUSxJQUFJLGFBQWEsSUFBSTtBQUU3QixNQUFJLENBQUM7QUFBTTtBQUVYLGNBQVk7QUFFWixRQUFNLGVBQWUsZUFBZTtBQUVwQyxRQUFNLE9BQU8sS0FBSztBQUVsQixNQUFJLFlBQVksS0FBSztBQUVyQixXQUFTLGFBQWFBLElBQUc7QUFFekIsVUFBUSxJQUFJLFVBQVUsTUFBTTtBQUU1QixNQUFJLFVBQVUsQ0FBQztBQUVmLFFBQU0sZUFBZSxLQUFLLFNBQVMsU0FBUztBQUM1QyxNQUFJLGNBQWM7QUFDZCxjQUFVLE1BQU0sc0JBQWdDLG1DQUFtQyxZQUFZO0FBQUEsRUFDbkc7QUFFQSxNQUFJLFNBQVMsQ0FBQztBQUVkLFFBQU0saUJBQWlCLEtBQUssU0FBUyxVQUFVO0FBQy9DLE1BQUksZ0JBQWdCO0FBQ2hCLGFBQVMsT0FBTyxPQUFPO0FBQUEsRUFDM0I7QUFFQSxRQUFNLGVBQWUsS0FBSyxTQUFTLFNBQVM7QUFDNUMsTUFBSTtBQUNKLE1BQUksY0FBYztBQUNkLGNBQVUsY0FBYztBQUFBLEVBQzVCO0FBRUEsUUFBTSxZQUFZLGFBQWEsSUFBSTtBQUVuQyxRQUFNLGFBQWEsTUFBTSxjQUFjQSxJQUFHO0FBRTFDLFVBQVEsSUFBSSxZQUFZO0FBRXhCLE1BQUksVUFBVTtBQUNWLGdCQUFZO0FBQUEsRUFDaEI7QUFFQSw2Q0FBeUI7QUFBQSxJQUNyQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0EsUUFBUSxNQUFNLGNBQWMsUUFBUTtBQUFBLEVBQ3hDLENBQUM7QUFDRCxVQUFRLElBQUksWUFBWSxJQUFJO0FBQzVCLGNBQVksTUFBTSxJQUFJO0FBQ3RCLG1EQUEyQixJQUFJO0FBQ25DO0FBbEVzQjtBQW9FdEIsU0FBUyxhQUFhLE1BQWtCO0FBQ3BDLFFBQU0sWUFBWSxPQUFPLFVBQVU7QUFFbkMsU0FBTztBQUNYO0FBSlM7QUFNRixTQUFTLFlBQVk7QUFDeEIsUUFBTUEsT0FBTSxZQUFZO0FBRXhCLGVBQWFBLE1BQUssTUFBTTtBQUV4QixhQUFXO0FBQ1gsY0FBWSxPQUFPLEtBQUs7QUFDeEIsbURBQTJCLEtBQUs7QUFDcEM7QUFSZ0I7OztBQ2hGaEIsSUFBSSxhQUFnQztBQUVwQyxJQUFNQyxVQUFTLFFBQVEsY0FBYyxPQUFPO0FBRTVDLGdCQUFnQixZQUFZLE1BQU07QUFDOUIsV0FBUyxZQUFZO0FBQ3JCLFVBQVEsSUFBSSxhQUFhO0FBQzNCLEdBQUcsS0FBSztBQUdWLFFBQVEsb0JBQW9CLENBQUNDLE1BQWEsZUFBNEI7QUFDbEUsbUJBQWlCQSxNQUFLLFVBQVU7QUFDcEMsQ0FBQztBQUVELFFBQVEsMEJBQTBCLE9BQU8sZ0JBQWdCO0FBQ3JELE1BQUk7QUFDSixNQUFLRCxRQUFPLHdCQUF3QjtBQUNoQyxVQUFNLGdCQUFnQixNQUFNLHNCQUFtQyw4Q0FBOEMsV0FBVztBQUV4SCxRQUFJQSxRQUFPLG9CQUFvQixZQUFZO0FBQ3ZDLGNBQVEscUJBQXFCLEVBQUUsaUJBQWlCLFlBQVksR0FBRyxhQUFhO0FBQUEsSUFDaEYsV0FBV0EsUUFBTyxvQkFBb0IsTUFBTTtBQUN4QyxXQUFLLHlDQUF5QyxlQUFlLFlBQVksQ0FBQztBQUFBLElBQzlFO0FBRUEsVUFBTSxNQUFNLEdBQUc7QUFFZixpQkFBYSxjQUFjLFlBQVksQ0FBQztBQUFBLEVBQzVDO0FBRUEsZUFBYSxNQUFNLHNCQUFtQyxzQ0FBc0MsV0FBVztBQUN2Ryx5QkFBdUIsVUFBVTtBQUNyQyxDQUFDO0FBRUQsUUFBUSwwQkFBMEIsT0FBTyxnQkFBZ0I7QUFDckQsU0FBTyxNQUFNLHNCQUFtQyxzQ0FBc0MsV0FBVztBQUNyRyxDQUFDO0FBRUQsSUFBTSxRQUFRLFFBQVEsY0FBYyxNQUFNO0FBQzFDLElBQU0sYUFBYSxRQUFRO0FBRzNCLGdCQUFnQixtQkFBbUIsTUFBTTtBQUNyQyxNQUFJLENBQUM7QUFBWTtBQUNqQixXQUFTLFVBQVU7QUFDdkIsR0FBRyxLQUFLO0FBR1IsbUJBQW1CLG1CQUFtQixtQkFBbUIsWUFBWUEsUUFBTyxXQUFXO0FBRXZGLFdBQVcsV0FBVyxPQUFPO0FBQ3pCLGFBQVcsT0FBTztBQUFBLElBQ2QsUUFBUSxRQUFRO0FBQUEsSUFDaEIsT0FBTztBQUFBLElBQ1AsS0FBS0EsUUFBTztBQUFBLElBQ1osVUFBVTtBQUFBLElBQ1YsU0FBUyxNQUFNLGFBQWEsUUFBUTtBQUFBLElBQ3BDLFFBQVEsTUFBTSxhQUFhO0FBQUEsRUFDL0IsQ0FBQztBQUNMOyIsCiAgIm5hbWVzIjogWyJkZWxheSIsICJjb25maWciLCAicGVkIiwgInBlZCIsICJwZWQiLCAicGVkIiwgImNvbmZpZyIsICJwZWQiXQp9Cg==
