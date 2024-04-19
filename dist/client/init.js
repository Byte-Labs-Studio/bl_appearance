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
    resetToggles(appearance);
    await delay(100);
    const ped2 = PlayerPedId();
    console.log("appearance", appearance);
    const newAppearance = await getAppearance(ped2);
    newAppearance.tattoos = appearance.tattoos;
    const frameworkdId = getFrameworkID();
    triggerServerCallback(
      "bl_appearance:server:saveAppearance",
      frameworkdId,
      newAppearance
    );
    setPedTattoos(ped2, newAppearance.tattoos);
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
  setPedTattoos(ped2, []);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgZGVidWdkYXRhID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZGF0YSwgKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXG4vZywgXCJcXFxcblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfSwgMikpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZW5kTlVJRXZlbnQgPSAoYWN0aW9uOiBzdHJpbmcsIGRhdGE6IGFueSkgPT4ge1xyXG4gICAgU2VuZE5VSU1lc3NhZ2Uoe1xyXG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgIGRhdGE6IGRhdGFcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RNb2RlbCA9IGFzeW5jIChtb2RlbDogc3RyaW5nIHwgbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+ID0+IHtcclxuICAgIGxldCBtb2RlbEhhc2g6IG51bWJlciA9IHR5cGVvZiBtb2RlbCA9PT0gJ251bWJlcicgPyBtb2RlbCA6IEdldEhhc2hLZXkobW9kZWwpXHJcblxyXG4gICAgaWYgKCFJc01vZGVsVmFsaWQobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9fb3hfY2JfJHtyZXNvdXJjZU5hbWV9YCwgKGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnkpID0+IHtcclxuICAgIGNvbnN0IHJlc29sdmUgPSBhY3RpdmVFdmVudHNba2V5XTtcclxuICAgIHJldHVybiByZXNvbHZlICYmIHJlc29sdmUoLi4uYXJncyk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUID0gdW5rbm93bj4oXHJcbiAgICBldmVudE5hbWU6IHN0cmluZywgLi4uYXJnczogYW55XHJcbik6IFByb21pc2U8VD4gfCB2b2lkIHtcclxuICAgIGlmICghZXZlbnRUaW1lcihldmVudE5hbWUsIDApKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBrZXk6IHN0cmluZztcclxuXHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuXHJcbiAgICBlbWl0TmV0KGBfX294X2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vbG9jYWxlXHJcblxyXG5leHBvcnQgY29uc3QgcmVxdWVzdExvY2FsZSA9IChyZXNvdXJjZVNldE5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2hlY2tSZXNvdXJjZUZpbGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChSZXF1ZXN0UmVzb3VyY2VGaWxlU2V0KHJlc291cmNlU2V0TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRMYW4gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UuY29uZmlnKCkubG9jYWxlXHJcbiAgICAgICAgICAgICAgICBsZXQgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS8ke2N1cnJlbnRMYW59Lmpzb25gKTtcclxuICAgICAgICAgICAgICAgIGlmICghbG9jYWxlRmlsZUNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke2N1cnJlbnRMYW59Lmpzb24gbm90IGZvdW5kIGluIGxvY2FsZSwgcGxlYXNlIHZlcmlmeSEsIHdlIHVzZWQgZW5nbGlzaCBmb3Igbm93IWApXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS9lbi5qc29uYClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUobG9jYWxlRmlsZUNvbnRlbnQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChjaGVja1Jlc291cmNlRmlsZSwgMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjaGVja1Jlc291cmNlRmlsZSgpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBsb2NhbGUgPSBhc3luYyAoaWQ6IHN0cmluZywgLi4uYXJnczogc3RyaW5nW10pID0+IHtcclxuICAgIGNvbnN0IGxvY2FsZSA9IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpO1xyXG4gICAgbGV0IGFyZ0luZGV4ID0gMDtcclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSBsb2NhbGVbaWRdLnJlcGxhY2UoLyVzL2csIChtYXRjaDogc3RyaW5nKSA9PiBhcmdJbmRleCA8IGFyZ3MubGVuZ3RoID8gYXJnc1thcmdJbmRleF0gOiBtYXRjaCk7XHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRGcmFtZXdvcmtJRCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGJsX2JyaWRnZSA9IGV4cG9ydHMuYmxfYnJpZGdlXHJcbiAgICBjb25zdCBpZCA9IGJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpLmNpZFxyXG4gICAgY29uc29sZS5sb2coJ2ZyYW1ld29ya2RJZCcsIGlkKVxyXG4gICAgcmV0dXJuIGlkXHJcbn0iLCAiaW1wb3J0IHsgQ2FtZXJhLCBWZWN0b3IzLCBDYW1lcmFCb25lcyB9IGZyb20gJ0B0eXBpbmdzL2NhbWVyYSc7XHJcbmltcG9ydCB7IGRlbGF5IH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgUmVjZWl2ZSB9IGZyb20gJ0BldmVudHMnO1xyXG5cclxubGV0IHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGNhbURpc3RhbmNlOiBudW1iZXIgPSAxLjg7XHJcbmxldCBjYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgYW5nbGVZOiBudW1iZXIgPSAwLjA7XHJcbmxldCBhbmdsZVo6IG51bWJlciA9IDAuMDtcclxubGV0IHRhcmdldENvb3JkczogVmVjdG9yMyB8IG51bGwgPSBudWxsO1xyXG5sZXQgb2xkQ2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGNoYW5naW5nQ2FtOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBsYXN0WDogbnVtYmVyID0gMDtcclxubGV0IGN1cnJlbnRCb25lOiBrZXlvZiBDYW1lcmFCb25lcyA9ICdoZWFkJztcclxubGV0IHBlZDogbnVtYmVyXHJcblxyXG5jb25zdCBDYW1lcmFCb25lczogQ2FtZXJhQm9uZXMgPSB7XHJcblx0aGVhZDogMzEwODYsXHJcblx0dG9yc286IDI0ODE4LFxyXG5cdGxlZ3M6IDE0MjAxLFxyXG59O1xyXG5cclxuY29uc3QgY29zID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguY29zKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3Qgc2luID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguc2luKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0QW5nbGVzID0gKCk6IG51bWJlcltdID0+IHtcclxuXHRjb25zdCB4ID1cclxuXHRcdCgoY29zKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSArIGNvcyhhbmdsZVkpICogY29zKGFuZ2xlWikpIC8gMikgKlxyXG5cdFx0Y2FtRGlzdGFuY2U7XHJcblx0Y29uc3QgeSA9XHJcblx0XHQoKHNpbihhbmdsZVopICogY29zKGFuZ2xlWSkgKyBjb3MoYW5nbGVZKSAqIHNpbihhbmdsZVopKSAvIDIpICpcclxuXHRcdGNhbURpc3RhbmNlO1xyXG5cdGNvbnN0IHogPSBzaW4oYW5nbGVZKSAqIGNhbURpc3RhbmNlO1xyXG5cclxuXHRyZXR1cm4gW3gsIHksIHpdO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtUG9zaXRpb24gPSAobW91c2VYPzogbnVtYmVyLCBtb3VzZVk/OiBudW1iZXIpOiB2b2lkID0+IHtcclxuXHRpZiAoIXJ1bm5pbmcgfHwgIXRhcmdldENvb3JkcyB8fCBjaGFuZ2luZ0NhbSkgcmV0dXJuO1xyXG5cclxuXHRtb3VzZVggPSBtb3VzZVggPz8gMC4wO1xyXG5cdG1vdXNlWSA9IG1vdXNlWSA/PyAwLjA7XHJcblxyXG5cdGFuZ2xlWiAtPSBtb3VzZVg7XHJcblx0YW5nbGVZICs9IG1vdXNlWTtcclxuXHRhbmdsZVkgPSBNYXRoLm1pbihNYXRoLm1heChhbmdsZVksIDAuMCksIDg5LjApO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKTtcclxuXHJcblx0U2V0Q2FtQ29vcmQoXHJcblx0XHRjYW0sXHJcblx0XHR0YXJnZXRDb29yZHMueCArIHgsXHJcblx0XHR0YXJnZXRDb29yZHMueSArIHksXHJcblx0XHR0YXJnZXRDb29yZHMueiArIHpcclxuXHQpO1xyXG5cdFBvaW50Q2FtQXRDb29yZChjYW0sIHRhcmdldENvb3Jkcy54LCB0YXJnZXRDb29yZHMueSwgdGFyZ2V0Q29vcmRzLnopO1xyXG59O1xyXG5cclxuY29uc3QgbW92ZUNhbWVyYSA9IGFzeW5jIChjb29yZHM6IFZlY3RvcjMsIGRpc3RhbmNlPzogbnVtYmVyKSA9PiB7XHJcbiAgICBwZWQgPSBQbGF5ZXJQZWRJZCgpXHJcblx0Y29uc3QgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpICsgOTQ7XHJcblx0ZGlzdGFuY2UgPSBkaXN0YW5jZSA/PyAxLjA7XHJcblxyXG5cdGNoYW5naW5nQ2FtID0gdHJ1ZTtcclxuXHRjYW1EaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG5cdGFuZ2xlWiA9IGhlYWRpbmc7XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpO1xyXG5cclxuXHRjb25zdCBuZXdjYW06IENhbWVyYSA9IENyZWF0ZUNhbVdpdGhQYXJhbXMoXHJcblx0XHQnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLFxyXG5cdFx0Y29vcmRzLnggKyB4LFxyXG5cdFx0Y29vcmRzLnkgKyB5LFxyXG5cdFx0Y29vcmRzLnogKyB6LFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0NzAuMCxcclxuXHRcdGZhbHNlLFxyXG5cdFx0MFxyXG5cdCk7XHJcblxyXG5cdHRhcmdldENvb3JkcyA9IGNvb3JkcztcclxuXHRjaGFuZ2luZ0NhbSA9IGZhbHNlO1xyXG5cdG9sZENhbSA9IGNhbTtcclxuXHRjYW0gPSBuZXdjYW07XHJcblxyXG5cdFBvaW50Q2FtQXRDb29yZChuZXdjYW0sIGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnopO1xyXG5cdFNldENhbUFjdGl2ZVdpdGhJbnRlcnAobmV3Y2FtLCBvbGRDYW0sIDI1MCwgMCwgMCk7XHJcblxyXG5cdGF3YWl0IGRlbGF5KDI1MCk7XHJcblxyXG5cdFNldENhbVVzZVNoYWxsb3dEb2ZNb2RlKG5ld2NhbSwgdHJ1ZSk7XHJcblx0U2V0Q2FtTmVhckRvZihuZXdjYW0sIDAuNCk7XHJcblx0U2V0Q2FtRmFyRG9mKG5ld2NhbSwgMS4yKTtcclxuXHRTZXRDYW1Eb2ZTdHJlbmd0aChuZXdjYW0sIDAuMyk7XHJcblx0dXNlSGlEb2YobmV3Y2FtKTtcclxuXHJcblx0RGVzdHJveUNhbShvbGRDYW0sIHRydWUpO1xyXG59O1xyXG5cclxuY29uc3QgdXNlSGlEb2YgPSAoY3VycmVudGNhbTogQ2FtZXJhKSA9PiB7XHJcblx0aWYgKCEoRG9lc0NhbUV4aXN0KGNhbSkgJiYgY3VycmVudGNhbSA9PSBjYW0pKSByZXR1cm47XHJcblx0U2V0VXNlSGlEb2YoKTtcclxuXHRzZXRUaW1lb3V0KHVzZUhpRG9mLCAwKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdGFydENhbWVyYSA9ICgpID0+IHtcclxuXHRpZiAocnVubmluZykgcmV0dXJuO1xyXG4gICAgcGVkID0gUGxheWVyUGVkSWQoKVxyXG5cdHJ1bm5pbmcgPSB0cnVlO1xyXG5cdGNhbURpc3RhbmNlID0gMS4wO1xyXG5cdGNhbSA9IENyZWF0ZUNhbSgnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLCB0cnVlKTtcclxuXHRjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIDMxMDg2LCAwLjAsIDAuMCwgMC4wKTtcclxuXHRTZXRDYW1Db29yZChjYW0sIHgsIHksIHopO1xyXG5cdFJlbmRlclNjcmlwdENhbXModHJ1ZSwgdHJ1ZSwgMTAwMCwgdHJ1ZSwgdHJ1ZSk7XHJcblx0bW92ZUNhbWVyYSh7IHg6IHgsIHk6IHksIHo6IHogfSwgY2FtRGlzdGFuY2UpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0b3BDYW1lcmEgPSAoKTogdm9pZCA9PiB7XHJcblx0aWYgKCFydW5uaW5nKSByZXR1cm47XHJcblx0cnVubmluZyA9IGZhbHNlO1xyXG5cclxuXHRSZW5kZXJTY3JpcHRDYW1zKGZhbHNlLCB0cnVlLCAyNTAsIHRydWUsIGZhbHNlKTtcclxuXHREZXN0cm95Q2FtKGNhbSwgdHJ1ZSk7XHJcblx0Y2FtID0gbnVsbDtcclxuXHR0YXJnZXRDb29yZHMgPSBudWxsO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtZXJhID0gKHR5cGU/OiBrZXlvZiBDYW1lcmFCb25lcyk6IHZvaWQgPT4ge1xyXG5cdGNvbnN0IGJvbmU6IG51bWJlciB8IHVuZGVmaW5lZCA9IENhbWVyYUJvbmVzW3R5cGVdO1xyXG5cdGlmIChjdXJyZW50Qm9uZSA9PSB0eXBlKSByZXR1cm47XHJcblxyXG5cdHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0Y29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IGJvbmVcclxuXHRcdD8gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmUsIDAuMCwgMC4wLCBib25lID09PSAxNDIwMSA/IDAuMiA6IDAuMClcclxuXHRcdDogR2V0RW50aXR5Q29vcmRzKHBlZCwgZmFsc2UpO1xyXG5cclxuXHRtb3ZlQ2FtZXJhKFxyXG5cdFx0e1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5LFxyXG5cdFx0XHR6OiB6ICsgMC4wLFxyXG5cdFx0fSxcclxuXHRcdDEuMFxyXG5cdCk7XHJcblxyXG5cdGN1cnJlbnRCb25lID0gdHlwZTtcclxufTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1Nb3ZlLCAoZGF0YSwgY2IpID0+IHtcclxuXHRjYigxKTtcclxuICAgIHBlZCA9IFBsYXllclBlZElkKClcclxuXHRsZXQgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpO1xyXG5cdGlmIChsYXN0WCA9PSBkYXRhLngpIHtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0aGVhZGluZyA9IGRhdGEueCA+IGxhc3RYID8gaGVhZGluZyArIDUgOiBoZWFkaW5nIC0gNTtcclxuXHRTZXRFbnRpdHlIZWFkaW5nKHBlZCwgaGVhZGluZyk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVNjcm9sbCwgKHR5cGU6IG51bWJlciwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c3dpdGNoICh0eXBlKSB7XHJcblx0XHRjYXNlIDI6XHJcblx0XHRcdHNldENhbWVyYSgpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdGNhc2UgMTpcclxuXHRcdFx0c2V0Q2FtZXJhKCdsZWdzJyk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAzOlxyXG5cdFx0XHRzZXRDYW1lcmEoJ2hlYWQnKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0fVxyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1ab29tLCAoZGF0YSwgY2IpID0+IHtcclxuXHRpZiAoZGF0YSA9PT0gJ2Rvd24nKSB7XHJcblx0XHRjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgKyAwLjA1O1xyXG5cdFx0Y2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA+PSAxLjAgPyAxLjAgOiBuZXdEaXN0YW5jZTtcclxuXHR9IGVsc2UgaWYgKGRhdGEgPT09ICd1cCcpIHtcclxuXHRcdGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSAtIDAuMDU7XHJcblx0XHRjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlIDw9IDAuMzUgPyAwLjM1IDogbmV3RGlzdGFuY2U7XHJcblx0fVxyXG5cclxuXHRjYW1EaXN0YW5jZSA9IGNhbURpc3RhbmNlO1xyXG5cdHNldENhbVBvc2l0aW9uKCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiQmxlbWlzaGVzXCIsXG4gICAgXCJGYWNpYWxIYWlyXCIsXG4gICAgXCJFeWVicm93c1wiLFxuICAgIFwiQWdlaW5nXCIsXG4gICAgXCJNYWtldXBcIixcbiAgICBcIkJsdXNoXCIsXG4gICAgXCJDb21wbGV4aW9uXCIsXG4gICAgXCJTdW5EYW1hZ2VcIixcbiAgICBcIkxpcHN0aWNrXCIsXG4gICAgXCJNb2xlc0ZyZWNrbGVzXCIsXG4gICAgXCJDaGVzdEhhaXJcIixcbiAgICBcIkJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkFkZEJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkV5ZUNvbG9yXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJOb3NlX1dpZHRoXCIsXG4gICAgXCJOb3NlX1BlYWtfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTGVuZ2h0XCIsXG4gICAgXCJOb3NlX0JvbmVfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTG93ZXJpbmdcIixcbiAgICBcIk5vc2VfQm9uZV9Ud2lzdFwiLFxuICAgIFwiRXllQnJvd25fSGVpZ2h0XCIsXG4gICAgXCJFeWVCcm93bl9Gb3J3YXJkXCIsXG4gICAgXCJDaGVla3NfQm9uZV9IaWdoXCIsXG4gICAgXCJDaGVla3NfQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hlZWtzX1dpZHRoXCIsXG4gICAgXCJFeWVzX09wZW5uaW5nXCIsXG4gICAgXCJMaXBzX1RoaWNrbmVzc1wiLFxuICAgIFwiSmF3X0JvbmVfV2lkdGhcIixcbiAgICBcIkphd19Cb25lX0JhY2tfTGVuZ2h0XCIsXG4gICAgXCJDaGluX0JvbmVfTG93ZXJpbmdcIixcbiAgICBcIkNoaW5fQm9uZV9MZW5ndGhcIixcbiAgICBcIkNoaW5fQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hpbl9Ib2xlXCIsXG4gICAgXCJOZWNrX1RoaWtuZXNzXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJmYWNlXCIsXG4gICAgXCJtYXNrc1wiLFxuICAgIFwiaGFpclwiLFxuICAgIFwidG9yc29zXCIsXG4gICAgXCJsZWdzXCIsXG4gICAgXCJiYWdzXCIsXG4gICAgXCJzaG9lc1wiLFxuICAgIFwibmVja1wiLFxuICAgIFwic2hpcnRzXCIsXG4gICAgXCJ2ZXN0XCIsXG4gICAgXCJkZWNhbHNcIixcbiAgICBcImphY2tldHNcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImhhdHNcIixcbiAgICBcImdsYXNzZXNcIixcbiAgICBcImVhcnJpbmdzXCIsXG4gICAgXCJtb3V0aFwiLFxuICAgIFwibGhhbmRcIixcbiAgICBcInJoYW5kXCIsXG4gICAgXCJ3YXRjaGVzXCIsXG4gICAgXCJicmFjZWxldHNcIlxuXVxuIiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUSGFpckRhdGEsIFRIZWFkT3ZlcmxheSwgVEhlYWRPdmVybGF5VG90YWwgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCBIRUFEX09WRVJMQVlTIGZyb20gXCJAZGF0YS9oZWFkXCJcclxuaW1wb3J0IEZBQ0VfRkVBVFVSRVMgZnJvbSBcIkBkYXRhL2ZhY2VcIlxyXG5pbXBvcnQgRFJBV0FCTEVfTkFNRVMgZnJvbSBcIkBkYXRhL2RyYXdhYmxlc1wiXHJcbmltcG9ydCBQUk9QX05BTUVTIGZyb20gXCJAZGF0YS9wcm9wc1wiXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZE1vZGVsSW5kZXggKHRhcmdldDogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxuICAgIGNvbnN0IG1vZGVscyA9IGNvbmZpZy5tb2RlbHMoKVxyXG4gICAgXHJcbiAgICByZXR1cm4gbW9kZWxzLmZpbmRJbmRleCgobW9kZWwpID0+IEdldEhhc2hLZXkobW9kZWwpICA9PT0gdGFyZ2V0KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFpciAocGVkOiBudW1iZXIpOiBUSGFpckRhdGEge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29sb3I6IEdldFBlZEhhaXJDb2xvcihwZWQpLFxyXG4gICAgICAgIGhpZ2hsaWdodDogR2V0UGVkSGFpckhpZ2hsaWdodENvbG9yKHBlZClcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRCbGVuZERhdGEocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgaGVhZGJsZW5kRGF0YSA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5HZXRIZWFkQmxlbmREYXRhKHBlZClcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNoYXBlRmlyc3Q6IGhlYWRibGVuZERhdGEuRmlyc3RGYWNlU2hhcGUsICAgLy8gZmF0aGVyXHJcbiAgICAgICAgc2hhcGVTZWNvbmQ6IGhlYWRibGVuZERhdGEuU2Vjb25kRmFjZVNoYXBlLCAvLyBtb3RoZXJcclxuICAgICAgICBzaGFwZVRoaXJkOiBoZWFkYmxlbmREYXRhLlRoaXJkRmFjZVNoYXBlLFxyXG5cclxuICAgICAgICBza2luRmlyc3Q6IGhlYWRibGVuZERhdGEuRmlyc3RTa2luVG9uZSxcclxuICAgICAgICBza2luU2Vjb25kOiBoZWFkYmxlbmREYXRhLlNlY29uZFNraW5Ub25lLFxyXG4gICAgICAgIHNraW5UaGlyZDogaGVhZGJsZW5kRGF0YS5UaGlyZFNraW5Ub25lLFxyXG5cclxuICAgICAgICBzaGFwZU1peDogaGVhZGJsZW5kRGF0YS5QYXJlbnRGYWNlU2hhcGVQZXJjZW50LCAvLyByZXNlbWJsYW5jZVxyXG5cclxuICAgICAgICB0aGlyZE1peDogaGVhZGJsZW5kRGF0YS5QYXJlbnRUaGlyZFVua1BlcmNlbnQsXHJcbiAgICAgICAgc2tpbk1peDogaGVhZGJsZW5kRGF0YS5QYXJlbnRTa2luVG9uZVBlcmNlbnQsICAgLy8gc2tpbnBlcmNlbnRcclxuXHJcbiAgICAgICAgaGFzUGFyZW50OiBoZWFkYmxlbmREYXRhLklzUGFyZW50SW5oZXJpdGFuY2UsXHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZE92ZXJsYXkocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgbGV0IHRvdGFsczogVEhlYWRPdmVybGF5VG90YWwgPSB7fTtcclxuICAgIGxldCBoZWFkRGF0YTogVEhlYWRPdmVybGF5ID0ge307XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBIRUFEX09WRVJMQVlTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEhFQURfT1ZFUkxBWVNbaV07XHJcbiAgICAgICAgdG90YWxzW292ZXJsYXldID0gR2V0TnVtSGVhZE92ZXJsYXlWYWx1ZXMoaSk7XHJcblxyXG4gICAgICAgIGlmIChvdmVybGF5ID09PSBcIkV5ZUNvbG9yXCIpIHtcclxuICAgICAgICAgICAgaGVhZERhdGFbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBHZXRQZWRFeWVDb2xvcihwZWQpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgW18sIG92ZXJsYXlWYWx1ZSwgY29sb3VyVHlwZSwgZmlyc3RDb2xvciwgc2Vjb25kQ29sb3IsIG92ZXJsYXlPcGFjaXR5XSA9IEdldFBlZEhlYWRPdmVybGF5RGF0YShwZWQsIGkpO1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGkgLSAxLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBvdmVybGF5VmFsdWUgPT09IDI1NSA/IC0xIDogb3ZlcmxheVZhbHVlLFxyXG4gICAgICAgICAgICAgICAgY29sb3VyVHlwZTogY29sb3VyVHlwZSxcclxuICAgICAgICAgICAgICAgIGZpcnN0Q29sb3I6IGZpcnN0Q29sb3IsXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRDb2xvcjogc2Vjb25kQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5T3BhY2l0eTogb3ZlcmxheU9wYWNpdHlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtoZWFkRGF0YSwgdG90YWxzXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRTdHJ1Y3R1cmUocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgcGVkTW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWQpXHJcblxyXG4gICAgaWYgKHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSAmJiBwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIikpIHJldHVyblxyXG5cclxuICAgIGxldCBmYWNlU3RydWN0ID0ge31cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRkFDRV9GRUFUVVJFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBGQUNFX0ZFQVRVUkVTW2ldXHJcbiAgICAgICAgZmFjZVN0cnVjdFtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRmFjZUZlYXR1cmUocGVkLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFjZVN0cnVjdFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RHJhd2FibGVzKHBlZDogbnVtYmVyKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGxldCBkcmF3YWJsZXMgPSB7fVxyXG4gICAgbGV0IHRvdGFsRHJhd2FibGVzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IERSQVdBQkxFX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IERSQVdBQkxFX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaSlcclxuXHJcbiAgICAgICAgdG90YWxEcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkRHJhd2FibGVWYXJpYXRpb25zKHBlZCwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFRleHR1cmVWYXJpYXRpb25zKHBlZCwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRUZXh0dXJlVmFyaWF0aW9uKHBlZCwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtkcmF3YWJsZXMsIHRvdGFsRHJhd2FibGVzXVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcHMocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgbGV0IHByb3BzID0ge31cclxuICAgIGxldCB0b3RhbFByb3BzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFBST1BfTkFNRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gUFJPUF9OQU1FU1tpXVxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpKVxyXG5cclxuICAgICAgICB0b3RhbFByb3BzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHRvdGFsOiBHZXROdW1iZXJPZlBlZFByb3BEcmF3YWJsZVZhcmlhdGlvbnMocGVkLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZXM6IEdldE51bWJlck9mUGVkUHJvcFRleHR1cmVWYXJpYXRpb25zKHBlZCwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3BzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWRQcm9wSW5kZXgocGVkLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZTogR2V0UGVkUHJvcFRleHR1cmVJbmRleChwZWQsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbcHJvcHMsIHRvdGFsUHJvcHNdXHJcbn1cclxuXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBwZWFyYW5jZShwZWQ6IG51bWJlcik6IFByb21pc2U8VEFwcGVhcmFuY2U+IHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBbaGVhZERhdGEsIHRvdGFsc10gPSBnZXRIZWFkT3ZlcmxheShwZWQpXHJcbiAgICBjb25zdCBbZHJhd2FibGVzLCBkcmF3VG90YWxdID0gZ2V0RHJhd2FibGVzKHBlZClcclxuICAgIGNvbnN0IFtwcm9wcywgcHJvcFRvdGFsXSA9IGdldFByb3BzKHBlZClcclxuICAgIGNvbnN0IG1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbW9kZWxJbmRleDogZmluZE1vZGVsSW5kZXgobW9kZWwpLFxyXG4gICAgICAgIG1vZGVsOiBtb2RlbCxcclxuICAgICAgICBoYWlyQ29sb3I6IGdldEhhaXIocGVkKSxcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkKSxcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEgYXMgVEhlYWRPdmVybGF5LFxyXG4gICAgICAgIGhlYWRPdmVybGF5VG90YWw6IHRvdGFscyBhcyBUSGVhZE92ZXJsYXlUb3RhbCxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZCksXHJcbiAgICAgICAgZHJhd2FibGVzOiBkcmF3YWJsZXMsXHJcbiAgICAgICAgcHJvcHM6IHByb3BzLFxyXG4gICAgICAgIGRyYXdUb3RhbDogZHJhd1RvdGFsLFxyXG4gICAgICAgIHByb3BUb3RhbDogcHJvcFRvdGFsLFxyXG4gICAgICAgIHRhdHRvb3M6IFtdXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldEFwcGVhcmFuY2VcIiwgZ2V0QXBwZWFyYW5jZSlcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQZWRDbG90aGVzKHBlZDogbnVtYmVyKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGNvbnN0IFtkcmF3YWJsZXMsIGRyYXdUb3RhbF0gPSBnZXREcmF3YWJsZXMocGVkKVxyXG4gICAgY29uc3QgW3Byb3BzLCBwcm9wVG90YWxdID0gZ2V0UHJvcHMocGVkKVxyXG4gICAgY29uc3QgW2hlYWREYXRhLCB0b3RhbHNdID0gZ2V0SGVhZE92ZXJsYXkocGVkKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaGVhZE92ZXJsYXk6IGhlYWREYXRhLFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkQ2xvdGhlc1wiLCBnZXRQZWRDbG90aGVzKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBlZFNraW4ocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkKSxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZCksXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZCksXHJcbiAgICAgICAgbW9kZWwgOiBHZXRFbnRpdHlNb2RlbChwZWQpXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldFBlZFNraW5cIiwgZ2V0UGVkU2tpbilcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUYXR0b29EYXRhKCkge1xyXG4gICAgbGV0IHRhdHRvb1pvbmVzID0ge31cclxuXHJcbiAgICBjb25zdCBbVEFUVE9PX0xJU1QsIFRBVFRPT19DQVRFR09SSUVTXSA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS50YXR0b29zKClcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVEFUVE9PX0NBVEVHT1JJRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBjYXRlZ29yeSA9IFRBVFRPT19DQVRFR09SSUVTW2ldXHJcbiAgICAgICAgY29uc3Qgem9uZSA9IGNhdGVnb3J5LnpvbmVcclxuICAgICAgICBjb25zdCBsYWJlbCA9IGNhdGVnb3J5LmxhYmVsXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBjYXRlZ29yeS5pbmRleFxyXG4gICAgICAgIHRhdHRvb1pvbmVzW2luZGV4XSA9IHtcclxuICAgICAgICAgICAgem9uZTogem9uZSxcclxuICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxyXG4gICAgICAgICAgICB6b25lSW5kZXg6IGluZGV4LFxyXG4gICAgICAgICAgICBkbGNzOiBbXVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBUQVRUT09fTElTVC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBjb25zdCBkbGNEYXRhID0gVEFUVE9PX0xJU1Rbal1cclxuICAgICAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdLmRsY3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZGxjRGF0YS5kbGMsXHJcbiAgICAgICAgICAgICAgICBkbGNJbmRleDogaixcclxuICAgICAgICAgICAgICAgIHRhdHRvb3M6IFtdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlzRmVtYWxlID0gR2V0RW50aXR5TW9kZWwoUGxheWVyUGVkSWQoKSkgPT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fTElTVC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBUQVRUT09fTElTVFtpXVxyXG4gICAgICAgIGNvbnN0IHsgZGxjLCB0YXR0b29zIH0gPSBkYXRhXHJcbiAgICAgICAgY29uc3QgZGxjSGFzaCA9IEdldEhhc2hLZXkoZGxjKVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGF0dG9vcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gdGF0dG9vc1tqXSBcclxuICAgICAgICAgICAgbGV0IHRhdHRvbyA9IG51bGxcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyVGF0dG9vID0gdGF0dG9vRGF0YS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIGNvbnN0IGlzRmVtYWxlVGF0dG9vID0gbG93ZXJUYXR0b28uaW5jbHVkZXMoXCJfZlwiKVxyXG4gICAgICAgICAgICBpZiAoaXNGZW1hbGVUYXR0b28gJiYgaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNGZW1hbGVUYXR0b28gJiYgIWlzRmVtYWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXR0b28gPSB0YXR0b29EYXRhXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBoYXNoID0gbnVsbFxyXG4gICAgICAgICAgICBsZXQgem9uZSA9IC0xXHJcblxyXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoID0gR2V0SGFzaEtleSh0YXR0b28pXHJcbiAgICAgICAgICAgICAgICB6b25lID0gR2V0UGVkRGVjb3JhdGlvblpvbmVGcm9tSGFzaGVzKGRsY0hhc2gsIGhhc2gpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh6b25lICE9PSAtMSAmJiBoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB6b25lVGF0dG9vcyA9IHRhdHRvb1pvbmVzW3pvbmVdLmRsY3NbaV0udGF0dG9vc1xyXG5cclxuICAgICAgICAgICAgICAgIHpvbmVUYXR0b29zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0YXR0b28sXHJcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogaGFzaCxcclxuICAgICAgICAgICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICAgICAgICAgIGRsYzogZGxjLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGF0dG9vWm9uZXNcclxufSIsICJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICAgIGhhdHM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMCxcclxuICAgIH0sXHJcbiAgICBnbGFzc2VzOiB7XHJcbiAgICAgICAgdHlwZTogXCJwcm9wXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICB9LFxyXG4gICAgbWFza3M6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICAgICAgb2ZmOiAwLFxyXG4gICAgfSxcclxuICAgIHNoaXJ0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogOCxcclxuICAgICAgICBvZmY6IDE1XHJcbiAgICB9LFxyXG4gICAgamFja2V0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMTEsXHJcbiAgICAgICAgb2ZmOiAxNSxcclxuICAgIH0sXHJcbiAgICBsZWdzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA0LFxyXG4gICAgICAgIG9mZjogMTEsXHJcbiAgICB9LFxyXG4gICAgc2hvZXM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDYsXHJcbiAgICAgICAgb2ZmOiAxMyxcclxuICAgIH1cclxufSIsICJpbXBvcnQgeyBEcmF3YWJsZURhdGEsIFRWYWx1ZSB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCI7XHJcbmltcG9ydCBUT0dHTEVfSU5ERVhFUyBmcm9tIFwiQGRhdGEvdG9nZ2xlc1wiXHJcbmltcG9ydCB7IGNvcHlGaWxlU3luYyB9IGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgeyByZXF1ZXN0TW9kZWx9IGZyb20gJ0B1dGlscyc7XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldERyYXdhYmxlKHBlZDogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCAwKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJvcChwZWQ6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGlmIChkYXRhLnZhbHVlID09PSAtMSkge1xyXG4gICAgICAgIENsZWFyUGVkUHJvcChwZWQsIGRhdGEuaW5kZXgpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgU2V0UGVkUHJvcEluZGV4KHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCBmYWxzZSlcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjb25zdCBzZXRNb2RlbCA9IGFzeW5jIChwZWQ6IG51bWJlciwgZGF0YSkgPT4ge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuICAgIGNvbnN0IGlzSnVzdE1vZGVsID0gdHlwZW9mIGRhdGEgPT09ICdudW1iZXInXHJcbiAgICBjb25zdCBtb2RlbCA9IGlzSnVzdE1vZGVsID8gZGF0YSA6IGRhdGEubW9kZWxcclxuICAgIGNvbnN0IGlzUGxheWVyID0gSXNQZWRBUGxheWVyKHBlZClcclxuXHJcbiAgICBpZiAoaXNQbGF5ZXIpIHtcclxuICAgICAgICBjb25zdCBtb2RlbEhhc2ggPSBhd2FpdCByZXF1ZXN0TW9kZWwobW9kZWwpXHJcbiAgICAgICAgU2V0UGxheWVyTW9kZWwoUGxheWVySWQoKSwgbW9kZWxIYXNoKVxyXG4gICAgICAgIFNldE1vZGVsQXNOb0xvbmdlck5lZWRlZChtb2RlbEhhc2gpXHJcbiAgICAgICAgcGVkID0gUGxheWVyUGVkSWQoKVxyXG4gICAgfVxyXG4gICAgU2V0UGVkRGVmYXVsdENvbXBvbmVudFZhcmlhdGlvbihwZWQpXHJcblxyXG4gICAgaWYgKCFpc0p1c3RNb2RlbCAmJiBkYXRhLmhlYWRCbGVuZCAmJiBPYmplY3Qua2V5cyhkYXRhLmhlYWRCbGVuZCkubGVuZ3RoKSBzZXRIZWFkQmxlbmQocGVkLCBkYXRhLmhlYWRCbGVuZClcclxuICAgIHJldHVybiBwZWRcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFNldEZhY2VGZWF0dXJlKHBlZDogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcbiAgICBTZXRQZWRGYWNlRmVhdHVyZShwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUgKyAwLjApXHJcbn1cclxuXHJcbmNvbnN0IGlzUG9zaXRpdmUgPSAodmFsOiBudW1iZXIpID0+IHZhbCA+PSAwID8gdmFsIDogMFxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEhlYWRCbGVuZChwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBjb25zdCBzaGFwZUZpcnN0ID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlRmlyc3QpXHJcbiAgICBjb25zdCBzaGFwZVNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZVNlY29uZClcclxuICAgIGNvbnN0IHNoYXBlVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVUaGlyZClcclxuICAgIGNvbnN0IHNraW5GaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5za2luRmlyc3QpXHJcbiAgICBjb25zdCBza2luU2Vjb25kID0gaXNQb3NpdGl2ZShkYXRhLnNraW5TZWNvbmQpXHJcbiAgICBjb25zdCBza2luVGhpcmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpblRoaXJkKVxyXG4gICAgY29uc3Qgc2hhcGVNaXggPSBkYXRhLnNoYXBlTWl4ICsgMC4wXHJcbiAgICBjb25zdCBza2luTWl4ID0gZGF0YS5za2luTWl4ICsgMC4wXHJcbiAgICBjb25zdCB0aGlyZE1peCA9IGRhdGEudGhpcmRNaXggKyAwLjBcclxuICAgIGNvbnN0IGhhc1BhcmVudCA9IGRhdGEuaGFzUGFyZW50XHJcblxyXG4gICAgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWQsIHNoYXBlRmlyc3QsIHNoYXBlU2Vjb25kLCBzaGFwZVRoaXJkLCBza2luRmlyc3QsIHNraW5TZWNvbmQsIHNraW5UaGlyZCwgc2hhcGVNaXgsIHNraW5NaXgsXHJcbiAgICAgICAgdGhpcmRNaXgsIGhhc1BhcmVudClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEhlYWRPdmVybGF5KHBlZDogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG4gICAgY29uc3QgaW5kZXggPSBkYXRhLmluZGV4XHJcblxyXG4gICAgaWYgKGluZGV4ID09PSAxMykge1xyXG4gICAgICAgIFNldFBlZEV5ZUNvbG9yKHBlZCwgZGF0YS52YWx1ZSlcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlID09PSAtMSA/IDI1NSA6IGRhdGEub3ZlcmxheVZhbHVlXHJcblxyXG4gICAgU2V0UGVkSGVhZE92ZXJsYXkocGVkLCBpbmRleCwgdmFsdWUsIGRhdGEub3ZlcmxheU9wYWNpdHkgKyAwLjApXHJcbiAgICBTZXRQZWRIZWFkT3ZlcmxheUNvbG9yKHBlZCwgaW5kZXgsIDEsIGRhdGEuZmlyc3RDb2xvciwgZGF0YS5zZWNvbmRDb2xvcilcclxufVxyXG5cclxuLy8gZnVuY3Rpb24gUmVzZXRUb2dnbGVzKGRhdGEpXHJcbi8vICAgICBsb2NhbCBwZWQgPSBjYWNoZS5wZWRcclxuXHJcbi8vICAgICBsb2NhbCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4vLyAgICAgbG9jYWwgcHJvcHMgPSBkYXRhLnByb3BzXHJcblxyXG4vLyAgICAgZm9yIHRvZ2dsZUl0ZW0sIHRvZ2dsZURhdGEgaW4gcGFpcnMoVE9HR0xFX0lOREVYRVMpIGRvXHJcbi8vICAgICAgICAgbG9jYWwgdG9nZ2xlVHlwZSA9IHRvZ2dsZURhdGEudHlwZVxyXG4vLyAgICAgICAgIGxvY2FsIGluZGV4ID0gdG9nZ2xlRGF0YS5pbmRleFxyXG5cclxuLy8gICAgICAgICBpZiB0b2dnbGVUeXBlID09IFwiZHJhd2FibGVcIiBhbmQgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dIHRoZW5cclxuLy8gICAgICAgICAgICAgbG9jYWwgY3VycmVudERyYXdhYmxlID0gR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpbmRleClcclxuLy8gICAgICAgICAgICAgaWYgY3VycmVudERyYXdhYmxlIH49IGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSB0aGVuXHJcbi8vICAgICAgICAgICAgICAgICBTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCAwKVxyXG4vLyAgICAgICAgICAgICBlbmRcclxuLy8gICAgICAgICBlbHNlaWYgdG9nZ2xlVHlwZSA9PSBcInByb3BcIiBhbmQgcHJvcHNbdG9nZ2xlSXRlbV0gdGhlblxyXG4vLyAgICAgICAgICAgICBsb2NhbCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KVxyXG4vLyAgICAgICAgICAgICBpZiBjdXJyZW50UHJvcCB+PSBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSB0aGVuXHJcbi8vICAgICAgICAgICAgICAgICBTZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleCwgcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIGZhbHNlKVxyXG4vLyAgICAgICAgICAgICBlbmRcclxuLy8gICAgICAgICBlbmRcclxuLy8gICAgIGVuZFxyXG4vLyBlbmRcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZXNldFRvZ2dsZXMoZGF0YSkge1xyXG4gICAgY29uc3QgcGVkID0gUGxheWVyUGVkSWQoKVxyXG4gICAgY29uc3QgZHJhd2FibGVzID0gZGF0YS5kcmF3YWJsZXNcclxuICAgIGNvbnN0IHByb3BzID0gZGF0YS5wcm9wc1xyXG5cclxuICAgIGZvciAoY29uc3QgW3RvZ2dsZUl0ZW0sIHRvZ2dsZURhdGFdIG9mIE9iamVjdC5lbnRyaWVzKFRPR0dMRV9JTkRFWEVTKSkge1xyXG4gICAgICAgIGNvbnN0IHRvZ2dsZVR5cGUgPSB0b2dnbGVEYXRhLnR5cGVcclxuICAgICAgICBjb25zdCBpbmRleCA9IHRvZ2dsZURhdGEuaW5kZXhcclxuXHJcbiAgICAgICAgaWYgKHRvZ2dsZVR5cGUgPT09IFwiZHJhd2FibGVcIiAmJiBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0pIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudERyYXdhYmxlID0gR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpbmRleClcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnREcmF3YWJsZSAhPT0gZHJhd2FibGVzW3RvZ2dsZUl0ZW1dLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCAwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh0b2dnbGVUeXBlID09PSBcInByb3BcIiAmJiBwcm9wc1t0b2dnbGVJdGVtXSkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50UHJvcCA9IEdldFBlZFByb3BJbmRleChwZWQsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudFByb3AgIT09IHByb3BzW3RvZ2dsZUl0ZW1dLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBTZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleCwgcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIGZhbHNlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkQ2xvdGhlcyhwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcbiAgICBjb25zdCBoZWFkT3ZlcmxheSA9IGRhdGEuaGVhZE92ZXJsYXlcclxuICAgIGNvbnNvbGUubG9nKCdkcmF3YWJsZXMnLCBkcmF3YWJsZXMpXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIGRyYXdhYmxlcykge1xyXG4gICAgICAgIGNvbnN0IGRyYXdhYmxlID0gZHJhd2FibGVzW2lkXVxyXG4gICAgICAgIHNldERyYXdhYmxlKHBlZCwgZHJhd2FibGUpXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBwcm9wcykge1xyXG4gICAgICAgIGNvbnN0IHByb3AgPSBwcm9wc1tpZF1cclxuICAgICAgICBzZXRQcm9wKHBlZCwgcHJvcClcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIGhlYWRPdmVybGF5KSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IGhlYWRPdmVybGF5W2lkXVxyXG4gICAgICAgIHNldEhlYWRPdmVybGF5KHBlZCwgb3ZlcmxheSlcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHNldFBlZFNraW4gPSBhc3luYyAocGVkOiBudW1iZXIsIGRhdGEpID0+IHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBoZWFkU3RydWN0dXJlID0gZGF0YS5oZWFkU3RydWN0dXJlXHJcbiAgICBjb25zdCBoZWFkQmxlbmQgPSBkYXRhLmhlYWRCbGVuZFxyXG5cclxuICAgIHBlZCA9IGF3YWl0IHNldE1vZGVsKHBlZCwgZGF0YSlcclxuICAgIGlmIChoZWFkQmxlbmQpIHtcclxuICAgICAgICBzZXRIZWFkQmxlbmQocGVkLCBoZWFkQmxlbmQpXHJcbiAgICB9XHJcbiAgICBpZiAoaGVhZFN0cnVjdHVyZSkge1xyXG4gICAgICAgIGZvciAoY29uc3QgZmVhdHVyZSBvZiBoZWFkU3RydWN0dXJlKSB7XHJcbiAgICAgICAgICAgIFNldEZhY2VGZWF0dXJlKHBlZCwgZmVhdHVyZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRUYXR0b29zKHBlZDogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEpIHJldHVyblxyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBjb25zdCBpc1BsYXllciA9IElzUGVkQVBsYXllcihwZWQpXHJcbiAgICBpZiAoaXNQbGF5ZXIpIHtcclxuICAgICAgICBwZWQgPSBQbGF5ZXJQZWRJZCgpXHJcbiAgICB9XHJcblxyXG4gICAgQ2xlYXJQZWREZWNvcmF0aW9uc0xlYXZlU2NhcnMocGVkKVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IHRhdHRvb0RhdGEgPSBkYXRhW2ldLnRhdHRvb1xyXG4gICAgICAgIGlmICh0YXR0b29EYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBHZXRIYXNoS2V5KHRhdHRvb0RhdGEuZGxjKVxyXG4gICAgICAgICAgICBjb25zdCB0YXR0b28gPSB0YXR0b29EYXRhLmhhc2hcclxuICAgICAgICAgICAgQWRkUGVkRGVjb3JhdGlvbkZyb21IYXNoZXMocGVkLCBjb2xsZWN0aW9uLCB0YXR0b28pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkSGFpckNvbG9ycyhwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBjb25zdCBjb2xvciA9IGRhdGEuY29sb3JcclxuICAgIGNvbnN0IGhpZ2hsaWdodCA9IGRhdGEuaGlnaGxpZ2h0XHJcbiAgICBTZXRQZWRIYWlyQ29sb3IocGVkLCBjb2xvciwgaGlnaGxpZ2h0KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkQXBwZWFyYW5jZShwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgc2V0UGVkU2tpbihwZWQsIGRhdGEpXHJcbiAgICBzZXRQZWRDbG90aGVzKHBlZCwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMocGVkLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MocGVkLCBkYXRhLnRhdHRvb3MpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGRhdGEpIHtcclxuICAgIHNldFBlZFNraW4oUGxheWVyUGVkSWQoKSwgZGF0YSlcclxuICAgIHNldFBlZENsb3RoZXMoUGxheWVyUGVkSWQoKSwgZGF0YSlcclxuICAgIHNldFBlZEhhaXJDb2xvcnMoUGxheWVyUGVkSWQoKSwgZGF0YS5oYWlyQ29sb3IpXHJcbiAgICBzZXRQZWRUYXR0b29zKFBsYXllclBlZElkKCksIGRhdGEudGF0dG9vcylcclxufSIsICJpbXBvcnQgeyBSZWNlaXZlIH0gZnJvbSAnQGV2ZW50cyc7XHJcbmltcG9ydCB7XHJcblx0cmVzZXRUb2dnbGVzLFxyXG5cdHNldERyYXdhYmxlLFxyXG5cdFNldEZhY2VGZWF0dXJlLFxyXG5cdHNldEhlYWRCbGVuZCxcclxuXHRzZXRIZWFkT3ZlcmxheSxcclxuXHRzZXRNb2RlbCxcclxuXHRzZXRQZWRDbG90aGVzLFxyXG5cdHNldFBlZFRhdHRvb3MsXHJcblx0c2V0UGxheWVyUGVkQXBwZWFyYW5jZSxcclxuXHRzZXRQcm9wLFxyXG59IGZyb20gJy4vYXBwZWFyYW5jZS9zZXR0ZXJzJztcclxuaW1wb3J0IHsgY2xvc2VNZW51IH0gZnJvbSAnLi9tZW51JztcclxuaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRUb2dnbGVEYXRhLCBUVmFsdWUgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgZGVsYXksIGdldEZyYW1ld29ya0lELCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2sgfSBmcm9tICdAdXRpbHMnO1xyXG5pbXBvcnQgeyBnZXRBcHBlYXJhbmNlLCBnZXRUYXR0b29EYXRhIH0gZnJvbSAnLi9hcHBlYXJhbmNlL2dldHRlcnMnO1xyXG5pbXBvcnQgVE9HR0xFX0lOREVYRVMgZnJvbSAnQGRhdGEvdG9nZ2xlcyc7XHJcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gJ0B0eXBpbmdzL291dGZpdHMnO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbmNlbCwgKGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlKGFwcGVhcmFuY2UpO1xyXG5cdGNsb3NlTWVudSgpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soXHJcblx0UmVjZWl2ZS5zYXZlLFxyXG5cdGFzeW5jIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0XHRyZXNldFRvZ2dsZXMoYXBwZWFyYW5jZSk7XHJcblxyXG5cdFx0YXdhaXQgZGVsYXkoMTAwKTtcclxuXHJcblx0XHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnYXBwZWFyYW5jZScsIGFwcGVhcmFuY2UpO1xyXG5cclxuXHRcdGNvbnN0IG5ld0FwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKHBlZCk7XHJcblxyXG4gICAgICAgIG5ld0FwcGVhcmFuY2UudGF0dG9vcyA9IGFwcGVhcmFuY2UudGF0dG9vcztcclxuXHJcblx0XHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cclxuXHRcdHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayhcclxuXHRcdFx0J2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVBcHBlYXJhbmNlJyxcclxuXHRcdFx0ZnJhbWV3b3JrZElkLFxyXG5cdFx0XHRuZXdBcHBlYXJhbmNlXHJcblx0XHQpO1xyXG5cclxuXHRcdHNldFBlZFRhdHRvb3MocGVkLCBuZXdBcHBlYXJhbmNlLnRhdHRvb3MpO1xyXG5cclxuXHRcdGNsb3NlTWVudSgpO1xyXG5cdFx0Y2IoMSk7XHJcblx0fVxyXG4pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldE1vZGVsLCBhc3luYyAobW9kZWw6IHN0cmluZywgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgaGFzaCA9IEdldEhhc2hLZXkobW9kZWwpO1xyXG5cdGlmICghSXNNb2RlbEluQ2RpbWFnZShoYXNoKSB8fCAhSXNNb2RlbFZhbGlkKGhhc2gpKSB7XHJcblx0XHRyZXR1cm4gY2IoMCk7XHJcblx0fVxyXG5cclxuXHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cclxuXHRhd2FpdCBzZXRNb2RlbChwZWQsIGhhc2gpO1xyXG5cclxuXHRjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cclxuXHRhcHBlYXJhbmNlLnRhdHRvb3MgPSBbXTtcclxuXHJcbiAgICBzZXRQZWRUYXR0b29zKHBlZCwgW10pO1xyXG5cclxuXHRjYihhcHBlYXJhbmNlKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZ2V0TW9kZWxUYXR0b29zLCBhc3luYyAoXzogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCB0YXR0b29zID0gZ2V0VGF0dG9vRGF0YSgpO1xyXG5cclxuXHRjYih0YXR0b29zKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFxyXG5cdFJlY2VpdmUuc2V0SGVhZFN0cnVjdHVyZSxcclxuXHRhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRcdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0XHRTZXRGYWNlRmVhdHVyZShwZWQsIGRhdGEpO1xyXG5cdFx0Y2IoMSk7XHJcblx0fVxyXG4pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhcclxuXHRSZWNlaXZlLnNldEhlYWRPdmVybGF5LFxyXG5cdGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdFx0Y29uc3QgcGVkID0gUGxheWVyUGVkSWQoKTtcclxuXHRcdHNldEhlYWRPdmVybGF5KHBlZCwgZGF0YSk7XHJcblx0XHRjYigxKTtcclxuXHR9XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFxyXG5cdFJlY2VpdmUuc2V0SGVhZEJsZW5kLFxyXG5cdGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdFx0Y29uc3QgcGVkID0gUGxheWVyUGVkSWQoKTtcclxuXHRcdHNldEhlYWRCbGVuZChwZWQsIGRhdGEpO1xyXG5cdFx0Y2IoMSk7XHJcblx0fVxyXG4pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFRhdHRvb3MsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRQcm9wLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cdHNldFByb3AocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0RHJhd2FibGUsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0c2V0RHJhd2FibGUocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFxyXG5cdFJlY2VpdmUudG9nZ2xlSXRlbSxcclxuXHRhc3luYyAoZGF0YTogVFRvZ2dsZURhdGEsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGl0ZW0gPSBUT0dHTEVfSU5ERVhFU1tkYXRhLml0ZW1dO1xyXG5cdFx0aWYgKCFpdGVtKSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRcdGNvbnN0IGN1cnJlbnQgPSBkYXRhLmRhdGE7XHJcblx0XHRjb25zdCB0eXBlID0gaXRlbS50eXBlO1xyXG5cdFx0Y29uc3QgaW5kZXggPSBpdGVtLmluZGV4O1xyXG5cclxuXHRcdGlmICghY3VycmVudCkgcmV0dXJuIGNiKGZhbHNlKTtcclxuXHJcblx0XHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cclxuXHRcdGlmICh0eXBlID09PSAncHJvcCcpIHtcclxuXHRcdFx0Y29uc3QgY3VycmVudFByb3AgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleCk7XHJcblxyXG5cdFx0XHRpZiAoY3VycmVudFByb3AgPT09IC0xKSB7XHJcblx0XHRcdFx0c2V0UHJvcChwZWQsIGN1cnJlbnQpO1xyXG5cdFx0XHRcdGNiKGZhbHNlKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Q2xlYXJQZWRQcm9wKHBlZCwgaW5kZXgpO1xyXG5cdFx0XHRcdGNiKHRydWUpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmICh0eXBlID09PSAnZHJhd2FibGUnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnQudmFsdWUgPT09IGl0ZW0ub2ZmKSB7XHJcbiAgICAgICAgICAgICAgICBjYihmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50LnZhbHVlID09PSBjdXJyZW50RHJhd2FibGUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBpdGVtLm9mZiwgMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjYih0cnVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldERyYXdhYmxlKHBlZCwgY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICBjYihmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblx0fVxyXG4pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNhdmVPdXRmaXQsIGFzeW5jIChkYXRhOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgY29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayhcclxuICAgICAgICAnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZU91dGZpdCcsXHJcbiAgICAgICAgZnJhbWV3b3JrZElkLFxyXG4gICAgICAgIGRhdGFcclxuICAgICk7XHJcbiAgICBjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5kZWxldGVPdXRmaXQsIGFzeW5jIChpZDogc3RyaW5nLCBjYjogRnVuY3Rpb24pID0+IHtcclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soXHJcbiAgICAgICAgJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmRlbGV0ZU91dGZpdCcsXHJcbiAgICAgICAgZnJhbWV3b3JrZElkLFxyXG4gICAgICAgIGlkXHJcbiAgICApO1xyXG4gICAgY2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUucmVuYW1lT3V0Zml0LCBhc3luYyAoZGF0YTogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soXHJcbiAgICAgICAgJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlbmFtZU91dGZpdCcsXHJcbiAgICAgICAgZnJhbWV3b3JrZElkLFxyXG4gICAgICAgIGRhdGFcclxuICAgICk7XHJcbiAgICBjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS51c2VPdXRmaXQsIGFzeW5jIChvdXRmaXQ6IE91dGZpdCwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygndXNlT3V0Zml0Jywgb3V0Zml0KTtcclxuICAgIHNldFBlZENsb3RoZXMoUGxheWVyUGVkSWQoKSwgb3V0Zml0KTtcclxuICAgIGNiKDEpO1xyXG59KTsiLCAiaW1wb3J0IHsgZ2V0RnJhbWV3b3JrSUQsIHJlcXVlc3RMb2NhbGUsIHNlbmROVUlFdmVudCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSBcIkB1dGlsc1wiXHJcbmltcG9ydCB7IHN0YXJ0Q2FtZXJhLCBzdG9wQ2FtZXJhIH0gZnJvbSBcIi4vY2FtZXJhXCJcclxuaW1wb3J0IHR5cGUgeyBUTWVudVR5cGVzIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tIFwiQHR5cGluZ3Mvb3V0Zml0c1wiXHJcbmltcG9ydCB7IFNlbmQgfSBmcm9tIFwiQGV2ZW50c1wiXHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldFRhdHRvb0RhdGEgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL2dldHRlcnNcIlxyXG5pbXBvcnQgXCIuL2hhbmRsZXJzXCJcclxuXHJcbmNvbnN0IGNvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZVxyXG5sZXQgYXJtb3VyID0gMFxyXG5cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuTWVudSh0eXBlOiBUTWVudVR5cGVzLCBjcmVhdGlvbjogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICBjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgY29uZmlnTWVudXMgPSBjb25maWcubWVudXMoKVxyXG5cclxuICAgIGNvbnN0IG1lbnUgPSBjb25maWdNZW51c1t0eXBlXVxyXG5cclxuICAgIGNvbnNvbGUubG9nKGNvbmZpZ01lbnVzLCBtZW51KVxyXG5cclxuICAgIGlmICghbWVudSkgcmV0dXJuXHJcblxyXG4gICAgc3RhcnRDYW1lcmEoKVxyXG5cclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKClcclxuXHJcbiAgICBjb25zdCB0YWJzID0gbWVudS50YWJzXHJcblxyXG4gICAgbGV0IGFsbG93RXhpdCA9IG1lbnUuYWxsb3dFeGl0XHJcblxyXG4gICAgYXJtb3VyID0gR2V0UGVkQXJtb3VyKHBlZClcclxuXHJcbiAgICBjb25zb2xlLmxvZyhcImFybW91clwiLCBhcm1vdXIpXHJcblxyXG4gICAgbGV0IG91dGZpdHMgPSBbXVxyXG5cclxuICAgIGNvbnN0IGhhc091dGZpdFRhYiA9IHRhYnMuaW5jbHVkZXMoJ291dGZpdHMnKVxyXG4gICAgaWYgKGhhc091dGZpdFRhYikge1xyXG4gICAgICAgIG91dGZpdHMgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8T3V0Zml0W10+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRPdXRmaXRzJywgZnJhbWV3b3JrZElkKSBhcyBPdXRmaXRbXSBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbW9kZWxzID0gW11cclxuXHJcbiAgICBjb25zdCBoYXNIZXJpdGFnZVRhYiA9IHRhYnMuaW5jbHVkZXMoJ2hlcml0YWdlJylcclxuICAgIGlmIChoYXNIZXJpdGFnZVRhYikge1xyXG4gICAgICAgIG1vZGVscyA9IGNvbmZpZy5tb2RlbHMoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGhhc1RhdHRvb1RhYiA9IHRhYnMuaW5jbHVkZXMoJ3RhdHRvb3MnKVxyXG4gICAgbGV0IHRhdHRvb3NcclxuICAgIGlmIChoYXNUYXR0b29UYWIpIHtcclxuICAgICAgICB0YXR0b29zID0gZ2V0VGF0dG9vRGF0YSgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYmxhY2tsaXN0ID0gZ2V0QmxhY2tsaXN0KHR5cGUpXHJcblxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkKVxyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiYXBwZWFyYW5jZVwiKVxyXG5cclxuICAgIGlmIChjcmVhdGlvbikge1xyXG4gICAgICAgIGFsbG93RXhpdCA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgc2VuZE5VSUV2ZW50KCBTZW5kLmRhdGEsIHtcclxuICAgICAgICB0YWJzLFxyXG4gICAgICAgIGFwcGVhcmFuY2UsXHJcbiAgICAgICAgYmxhY2tsaXN0LFxyXG4gICAgICAgIHRhdHRvb3MsXHJcbiAgICAgICAgb3V0Zml0cyxcclxuICAgICAgICBtb2RlbHMsXHJcbiAgICAgICAgYWxsb3dFeGl0LFxyXG4gICAgICAgIGxvY2FsZTogYXdhaXQgcmVxdWVzdExvY2FsZSgnbG9jYWxlJylcclxuICAgIH0pXHJcbiAgICBjb25zb2xlLmxvZygnb3Blbk1lbnUnLCB0eXBlKVxyXG4gICAgU2V0TnVpRm9jdXModHJ1ZSwgdHJ1ZSlcclxuICAgIHNlbmROVUlFdmVudChTZW5kLnZpc2libGUsIHRydWUpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEJsYWNrbGlzdCh0eXBlOiBUTWVudVR5cGVzKSB7XHJcbiAgICBjb25zdCBibGFja2xpc3QgPSBjb25maWcuYmxhY2tsaXN0KClcclxuXHJcbiAgICByZXR1cm4gYmxhY2tsaXN0XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9zZU1lbnUoKSB7XHJcbiAgICBjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgU2V0UGVkQXJtb3VyKHBlZCwgYXJtb3VyKVxyXG5cclxuICAgIHN0b3BDYW1lcmEoKVxyXG4gICAgU2V0TnVpRm9jdXMoZmFsc2UsIGZhbHNlKVxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQudmlzaWJsZSwgZmFsc2UpXHJcbn0iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRNZW51VHlwZXMgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCB7IG9wZW5NZW51IH0gZnJvbSBcIi4vbWVudVwiXHJcbmltcG9ydCB7IHNldFBlZEFwcGVhcmFuY2UsIHNldFBsYXllclBlZEFwcGVhcmFuY2UgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL3NldHRlcnNcIlxyXG5pbXBvcnQgeyBkZWxheSwgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSBcIkB1dGlsc1wiXHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL2dldHRlcnNcIlxyXG5cclxubGV0IGlzSW5TcHJpdGU6IFRNZW51VHlwZXMgfCBudWxsID0gbnVsbFxyXG5cclxuY29uc3QgY29uZmlnID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmNvbmZpZygpXHJcblxyXG5SZWdpc3RlckNvbW1hbmQoJ29wZW5NZW51JywgKCkgPT4ge1xyXG4gICAgb3Blbk1lbnUoJ2FwcGVhcmFuY2UnKSAgXHJcbiAgICBjb25zb2xlLmxvZygnTWVudSBvcGVuZWQnKVxyXG4gIH0sIGZhbHNlKVxyXG5cclxuXHJcbmV4cG9ydHMoJ1NldFBlZEFwcGVhcmFuY2UnLCAocGVkOiBudW1iZXIsIGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlKSA9PiB7XHJcbiAgICBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcclxufSlcclxuXHJcbmV4cG9ydHMoJ1NldFBsYXllclBlZEFwcGVhcmFuY2UnLCBhc3luYyAoZnJhbWV3b3JrSUQpID0+IHtcclxuICAgIGxldCBhcHBlYXJhbmNlXHJcbiAgICBpZiAgKGNvbmZpZy5iYWNrd2FyZHNDb21wYXRpYmlsaXR5KSB7XHJcbiAgICAgICAgY29uc3Qgb2xkQXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOlByZXZpb3VzR2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLnByZXZpb3VzQ2xvdGhpbmcgPT0gJ2lsbGVuaXVtJykge1xyXG4gICAgICAgICAgICBleHBvcnRzWydpbGxlbml1bS1hcHBlYXJhbmNlJ10uc2V0UGVkQXBwZWFyYW5jZShQbGF5ZXJQZWRJZCgpLCBvbGRBcHBlYXJhbmNlKVxyXG4gICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLnByZXZpb3VzQ2xvdGhpbmcgPT0gJ3FiJykge1xyXG4gICAgICAgICAgICBlbWl0KCdxYi1jbG90aGluZzpjbGllbnQ6bG9hZFBsYXllckNsb3RoaW5nJywgb2xkQXBwZWFyYW5jZSwgUGxheWVyUGVkSWQoKSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGF3YWl0IGRlbGF5KDEwMClcclxuXHJcbiAgICAgICAgYXBwZWFyYW5jZSA9IGdldEFwcGVhcmFuY2UoUGxheWVyUGVkSWQoKSlcclxuICAgIH1cclxuXHJcbiAgICBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxyXG59KVxyXG5cclxuZXhwb3J0cygnR2V0UGxheWVyUGVkQXBwZWFyYW5jZScsIGFzeW5jIChmcmFtZXdvcmtJRCkgPT4ge1xyXG4gICAgcmV0dXJuIGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxufSlcclxuXHJcbmNvbnN0IHpvbmVzID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLnpvbmVzKClcclxuY29uc3QgYmxfc3ByaXRlcyA9IGV4cG9ydHMuYmxfc3ByaXRlc1xyXG5cclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgnK29wZW5BcHBlYXJhbmNlJywgKCkgPT4ge1xyXG4gICAgaWYgKCFpc0luU3ByaXRlKSByZXR1cm5cclxuICAgIG9wZW5NZW51KGlzSW5TcHJpdGUpXHJcbn0sIGZhbHNlKVxyXG5cclxuXHJcblJlZ2lzdGVyS2V5TWFwcGluZygnK29wZW5BcHBlYXJhbmNlJywgJ09wZW4gQXBwZWFyYW5jZScsICdrZXlib2FyZCcsIGNvbmZpZy5vcGVuQ29udHJvbClcclxuXHJcbmZvciAoY29uc3QgZWxlbWVudCBvZiB6b25lcykge1xyXG4gICAgYmxfc3ByaXRlcy5zcHJpdGUoe1xyXG4gICAgICAgIGNvb3JkczogZWxlbWVudC5jb29yZHMsXHJcbiAgICAgICAgc2hhcGU6ICdoZXgnLFxyXG4gICAgICAgIGtleTogY29uZmlnLm9wZW5Db250cm9sLFxyXG4gICAgICAgIGRpc3RhbmNlOiAzLjAsXHJcbiAgICAgICAgb25FbnRlcjogKCkgPT4gaXNJblNwcml0ZSA9IGVsZW1lbnQudHlwZSxcclxuICAgICAgICBvbkV4aXQ6ICgpID0+IGlzSW5TcHJpdGUgPSBudWxsXHJcbiAgICB9KVxyXG59Il0sCiAgIm1hcHBpbmdzIjogIjs7OztBQVNPLElBQU0sZUFBZSx3QkFBQyxRQUFnQixTQUFjO0FBQ3ZELGlCQUFlO0FBQUEsSUFDWDtBQUFBLElBQ0E7QUFBQSxFQUNKLENBQUM7QUFDTCxHQUw0QjtBQU9yQixJQUFNLFFBQVEsd0JBQUMsT0FBZSxJQUFJLFFBQVEsU0FBTyxXQUFXLEtBQUssRUFBRSxDQUFDLEdBQXREO0FBRWQsSUFBTSxlQUFlLDhCQUFPLFVBQTRDO0FBQzNFLE1BQUksWUFBb0IsT0FBTyxVQUFVLFdB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QUFKUztBQU1GLFNBQVMsWUFBWTtBQUN4QixRQUFNQSxPQUFNLFlBQVk7QUFFeEIsZUFBYUEsTUFBSyxNQUFNO0FBRXhCLGFBQVc7QUFDWCxjQUFZLE9BQU8sS0FBSztBQUN4QixtREFBMkIsS0FBSztBQUNwQztBQVJnQjs7O0FDaEZoQixJQUFJLGFBQWdDO0FBRXBDLElBQU1DLFVBQVMsUUFBUSxjQUFjLE9BQU87QUFFNUMsZ0JBQWdCLFlBQVksTUFBTTtBQUM5QixXQUFTLFlBQVk7QUFDckIsVUFBUSxJQUFJLGFBQWE7QUFDM0IsR0FBRyxLQUFLO0FBR1YsUUFBUSxvQkFBb0IsQ0FBQ0MsTUFBYSxlQUE0QjtBQUNsRSxtQkFBaUJBLE1BQUssVUFBVTtBQUNwQyxDQUFDO0FBRUQsUUFBUSwwQkFBMEIsT0FBTyxnQkFBZ0I7QUFDckQsTUFBSTtBQUNKLE1BQUtELFFBQU8sd0JBQXdCO0FBQ2hDLFVBQU0sZ0JBQWdCLE1BQU0sc0JBQW1DLDhDQUE4QyxXQUFXO0FBRXhILFFBQUlBLFFBQU8sb0JBQW9CLFlBQVk7QUFDdkMsY0FBUSxxQkFBcUIsRUFBRSxpQkFBaUIsWUFBWSxHQUFHLGFBQWE7QUFBQSxJQUNoRixXQUFXQSxRQUFPLG9CQUFvQixNQUFNO0FBQ3hDLFdBQUsseUNBQXlDLGVBQWUsWUFBWSxDQUFDO0FBQUEsSUFDOUU7QUFFQSxVQUFNLE1BQU0sR0FBRztBQUVmLGlCQUFhLGNBQWMsWUFBWSxDQUFDO0FBQUEsRUFDNUM7QUFFQSxlQUFhLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQ3ZHLHlCQUF1QixVQUFVO0FBQ3JDLENBQUM7QUFFRCxRQUFRLDBCQUEwQixPQUFPLGdCQUFnQjtBQUNyRCxTQUFPLE1BQU0sc0JBQW1DLHNDQUFzQyxXQUFXO0FBQ3JHLENBQUM7QUFFRCxJQUFNLFFBQVEsUUFBUSxjQUFjLE1BQU07QUFDMUMsSUFBTSxhQUFhLFFBQVE7QUFHM0IsZ0JBQWdCLG1CQUFtQixNQUFNO0FBQ3JDLE1BQUksQ0FBQztBQUFZO0FBQ2pCLFdBQVMsVUFBVTtBQUN2QixHQUFHLEtBQUs7QUFHUixtQkFBbUIsbUJBQW1CLG1CQUFtQixZQUFZQSxRQUFPLFdBQVc7QUFFdkYsV0FBVyxXQUFXLE9BQU87QUFDekIsYUFBVyxPQUFPO0FBQUEsSUFDZCxRQUFRLFFBQVE7QUFBQSxJQUNoQixPQUFPO0FBQUEsSUFDUCxLQUFLQSxRQUFPO0FBQUEsSUFDWixVQUFVO0FBQUEsSUFDVixTQUFTLE1BQU0sYUFBYSxRQUFRO0FBQUEsSUFDcEMsUUFBUSxNQUFNLGFBQWE7QUFBQSxFQUMvQixDQUFDO0FBQ0w7IiwKICAibmFtZXMiOiBbImRlbGF5IiwgImNvbmZpZyIsICJwZWQiLCAicGVkIiwgInBlZCIsICJwZWQiLCAiY29uZmlnIiwgInBlZCJdCn0K
