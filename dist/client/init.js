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
function triggerServerCallback(eventName, delay2, ...args) {
  if (!eventTimer(eventName, delay2)) {
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
  return exports.bl_appearance.config().useBridge ? exports.bl_bridge.core && exports.bl_bridge.core().getPlayerData().cid : null;
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
var ped = PlayerPedId();
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
function setModel(ped2, data) {
  ped2 = ped2 || PlayerPedId();
  const isJustModel = typeof data === "number";
  const model = isJustModel ? data : data.model;
  const isPlayer = IsPedAPlayer(ped2);
  if (isPlayer) {
    RequestModel(model);
    SetPlayerModel(PlayerId(), model);
    SetModelAsNoLongerNeeded(model);
    ped2 = PlayerPedId();
  }
  SetPedDefaultComponentVariation(ped2);
  if (!isJustModel) {
    if (data.headBlend) {
      if (!isJustModel && Object.keys(data.headBlend).length) {
        setHeadBlend(ped2, data.headBlend);
      }
    }
  }
  return ped2;
}
__name(setModel, "setModel");
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
function setPedSkin(ped2, data) {
  ped2 = ped2 || PlayerPedId();
  const headStructure = data.headStructure;
  const headBlend = data.headBlend;
  ped2 = setModel(ped2, data);
  if (headBlend) {
    setHeadBlend(ped2, headBlend);
  }
  if (headStructure) {
    for (const feature of headStructure) {
      SetFaceFeature(ped2, feature);
    }
  }
}
__name(setPedSkin, "setPedSkin");
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
function setPlayerPedAppearance(data) {
  setPedSkin(PlayerPedId(), data);
  setPedClothes(PlayerPedId(), data);
  setPedHairColors(PlayerPedId(), data.hairColor);
  setPedTattoos(PlayerPedId(), data.tattoos);
}
__name(setPlayerPedAppearance, "setPlayerPedAppearance");

// src/client/handlers.ts
RegisterNuiCallback("appearance:cancel" /* cancel */, (appearance, cb) => {
  console.log("cancel");
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
    console.log("save");
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
  setModel(ped2, hash);
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
RegisterCommand("openMenu", () => {
  openMenu("appearance");
  console.log("Menu opened");
}, false);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgZGVidWdkYXRhID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZGF0YSwgKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXG4vZywgXCJcXFxcblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfSwgMikpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZW5kTlVJRXZlbnQgPSAoYWN0aW9uOiBzdHJpbmcsIGRhdGE6IGFueSkgPT4ge1xyXG4gICAgU2VuZE5VSU1lc3NhZ2Uoe1xyXG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgIGRhdGE6IGRhdGFcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RNb2RlbCA9IGFzeW5jIChtb2RlbDogc3RyaW5nIHwgbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+ID0+IHtcclxuICAgIGxldCBtb2RlbEhhc2g6IG51bWJlciA9IHR5cGVvZiBtb2RlbCA9PT0gJ251bWJlcicgPyBtb2RlbCA6IEdldEhhc2hLZXkobW9kZWwpXHJcblxyXG4gICAgaWYgKCFJc01vZGVsVmFsaWQobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9fb3hfY2JfJHtyZXNvdXJjZU5hbWV9YCwgKGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnkpID0+IHtcclxuICAgIGNvbnN0IHJlc29sdmUgPSBhY3RpdmVFdmVudHNba2V5XTtcclxuICAgIHJldHVybiByZXNvbHZlICYmIHJlc29sdmUoLi4uYXJncyk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUID0gdW5rbm93bj4oXHJcbiAgICBldmVudE5hbWU6IHN0cmluZyxcclxuICAgIGRlbGF5OiBudW1iZXIgfCBudWxsLFxyXG4gICAgLi4uYXJnczogYW55XHJcbik6IFByb21pc2U8VD4gfCB2b2lkIHtcclxuICAgIGlmICghZXZlbnRUaW1lcihldmVudE5hbWUsIGRlbGF5KSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQga2V5OiBzdHJpbmc7XHJcblxyXG4gICAgZG8ge1xyXG4gICAgICAgIGtleSA9IGAke2V2ZW50TmFtZX06JHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoMTAwMDAwICsgMSkpfWA7XHJcbiAgICB9IHdoaWxlIChhY3RpdmVFdmVudHNba2V5XSk7XHJcblxyXG4gICAgZW1pdE5ldChgX19veF9jYl8ke2V2ZW50TmFtZX1gLCByZXNvdXJjZU5hbWUsIGtleSwgLi4uYXJncyk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgYWN0aXZlRXZlbnRzW2tleV0gPSByZXNvbHZlO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vL2xvY2FsZVxyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RMb2NhbGUgPSAocmVzb3VyY2VTZXROYW1lOiBzdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNoZWNrUmVzb3VyY2VGaWxlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoUmVxdWVzdFJlc291cmNlRmlsZVNldChyZXNvdXJjZVNldE5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50TGFuID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmNvbmZpZygpLmxvY2FsZVxyXG4gICAgICAgICAgICAgICAgbGV0IGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvJHtjdXJyZW50TGFufS5qc29uYCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsZUZpbGVDb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtjdXJyZW50TGFufS5qc29uIG5vdCBmb3VuZCBpbiBsb2NhbGUsIHBsZWFzZSB2ZXJpZnkhLCB3ZSB1c2VkIGVuZ2xpc2ggZm9yIG5vdyFgKVxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvZW4uanNvbmApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGxvY2FsZUZpbGVDb250ZW50KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2hlY2tSZXNvdXJjZUZpbGUsIDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2hlY2tSZXNvdXJjZUZpbGUoKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbG9jYWxlID0gYXN5bmMgKGlkOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBjb25zdCBsb2NhbGUgPSBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKTtcclxuICAgIGxldCBhcmdJbmRleCA9IDA7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gbG9jYWxlW2lkXS5yZXBsYWNlKC8lcy9nLCAobWF0Y2g6IHN0cmluZykgPT4gYXJnSW5kZXggPCBhcmdzLmxlbmd0aCA/IGFyZ3NbYXJnSW5kZXhdIDogbWF0Y2gpO1xyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0RnJhbWV3b3JrSUQgPSAoKSA9PiB7XHJcbiAgICByZXR1cm4gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmNvbmZpZygpLnVzZUJyaWRnZSA/IGV4cG9ydHMuYmxfYnJpZGdlLmNvcmUgJiYgZXhwb3J0cy5ibF9icmlkZ2UuY29yZSgpLmdldFBsYXllckRhdGEoKS5jaWQgOiBudWxsO1xyXG59IiwgImltcG9ydCB7IENhbWVyYSwgVmVjdG9yMywgQ2FtZXJhQm9uZXMgfSBmcm9tICdAdHlwaW5ncy9jYW1lcmEnO1xyXG5pbXBvcnQgeyBkZWxheSB9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IFJlY2VpdmUgfSBmcm9tICdAZXZlbnRzJztcclxuXHJcbmxldCBydW5uaW5nOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBjYW1EaXN0YW5jZTogbnVtYmVyID0gMS44O1xyXG5sZXQgY2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGFuZ2xlWTogbnVtYmVyID0gMC4wO1xyXG5sZXQgYW5nbGVaOiBudW1iZXIgPSAwLjA7XHJcbmxldCB0YXJnZXRDb29yZHM6IFZlY3RvcjMgfCBudWxsID0gbnVsbDtcclxubGV0IG9sZENhbTogQ2FtZXJhIHwgbnVsbCA9IG51bGw7XHJcbmxldCBjaGFuZ2luZ0NhbTogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgbGFzdFg6IG51bWJlciA9IDA7XHJcbmxldCBjdXJyZW50Qm9uZToga2V5b2YgQ2FtZXJhQm9uZXMgPSAnaGVhZCc7XHJcbmxldCBwZWQ6IG51bWJlciA9IFBsYXllclBlZElkKCk7XHJcblxyXG5jb25zdCBDYW1lcmFCb25lczogQ2FtZXJhQm9uZXMgPSB7XHJcblx0aGVhZDogMzEwODYsXHJcblx0dG9yc286IDI0ODE4LFxyXG5cdGxlZ3M6IDE0MjAxLFxyXG59O1xyXG5cclxuY29uc3QgY29zID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguY29zKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3Qgc2luID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcblx0cmV0dXJuIE1hdGguc2luKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0QW5nbGVzID0gKCk6IG51bWJlcltdID0+IHtcclxuXHRjb25zdCB4ID1cclxuXHRcdCgoY29zKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSArIGNvcyhhbmdsZVkpICogY29zKGFuZ2xlWikpIC8gMikgKlxyXG5cdFx0Y2FtRGlzdGFuY2U7XHJcblx0Y29uc3QgeSA9XHJcblx0XHQoKHNpbihhbmdsZVopICogY29zKGFuZ2xlWSkgKyBjb3MoYW5nbGVZKSAqIHNpbihhbmdsZVopKSAvIDIpICpcclxuXHRcdGNhbURpc3RhbmNlO1xyXG5cdGNvbnN0IHogPSBzaW4oYW5nbGVZKSAqIGNhbURpc3RhbmNlO1xyXG5cclxuXHRyZXR1cm4gW3gsIHksIHpdO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtUG9zaXRpb24gPSAobW91c2VYPzogbnVtYmVyLCBtb3VzZVk/OiBudW1iZXIpOiB2b2lkID0+IHtcclxuXHRpZiAoIXJ1bm5pbmcgfHwgIXRhcmdldENvb3JkcyB8fCBjaGFuZ2luZ0NhbSkgcmV0dXJuO1xyXG5cclxuXHRtb3VzZVggPSBtb3VzZVggPz8gMC4wO1xyXG5cdG1vdXNlWSA9IG1vdXNlWSA/PyAwLjA7XHJcblxyXG5cdGFuZ2xlWiAtPSBtb3VzZVg7XHJcblx0YW5nbGVZICs9IG1vdXNlWTtcclxuXHRhbmdsZVkgPSBNYXRoLm1pbihNYXRoLm1heChhbmdsZVksIDAuMCksIDg5LjApO1xyXG5cclxuXHRjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKTtcclxuXHJcblx0U2V0Q2FtQ29vcmQoXHJcblx0XHRjYW0sXHJcblx0XHR0YXJnZXRDb29yZHMueCArIHgsXHJcblx0XHR0YXJnZXRDb29yZHMueSArIHksXHJcblx0XHR0YXJnZXRDb29yZHMueiArIHpcclxuXHQpO1xyXG5cdFBvaW50Q2FtQXRDb29yZChjYW0sIHRhcmdldENvb3Jkcy54LCB0YXJnZXRDb29yZHMueSwgdGFyZ2V0Q29vcmRzLnopO1xyXG59O1xyXG5cclxuY29uc3QgbW92ZUNhbWVyYSA9IGFzeW5jIChjb29yZHM6IFZlY3RvcjMsIGRpc3RhbmNlPzogbnVtYmVyKSA9PiB7XHJcblx0Y29uc3QgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpICsgOTQ7XHJcblx0ZGlzdGFuY2UgPSBkaXN0YW5jZSA/PyAxLjA7XHJcblxyXG5cdGNoYW5naW5nQ2FtID0gdHJ1ZTtcclxuXHRjYW1EaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG5cdGFuZ2xlWiA9IGhlYWRpbmc7XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpO1xyXG5cclxuXHRjb25zdCBuZXdjYW06IENhbWVyYSA9IENyZWF0ZUNhbVdpdGhQYXJhbXMoXHJcblx0XHQnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLFxyXG5cdFx0Y29vcmRzLnggKyB4LFxyXG5cdFx0Y29vcmRzLnkgKyB5LFxyXG5cdFx0Y29vcmRzLnogKyB6LFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0MC4wLFxyXG5cdFx0NzAuMCxcclxuXHRcdGZhbHNlLFxyXG5cdFx0MFxyXG5cdCk7XHJcblxyXG5cdHRhcmdldENvb3JkcyA9IGNvb3JkcztcclxuXHRjaGFuZ2luZ0NhbSA9IGZhbHNlO1xyXG5cdG9sZENhbSA9IGNhbTtcclxuXHRjYW0gPSBuZXdjYW07XHJcblxyXG5cdFBvaW50Q2FtQXRDb29yZChuZXdjYW0sIGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnopO1xyXG5cdFNldENhbUFjdGl2ZVdpdGhJbnRlcnAobmV3Y2FtLCBvbGRDYW0sIDI1MCwgMCwgMCk7XHJcblxyXG5cdGF3YWl0IGRlbGF5KDI1MCk7XHJcblxyXG5cdFNldENhbVVzZVNoYWxsb3dEb2ZNb2RlKG5ld2NhbSwgdHJ1ZSk7XHJcblx0U2V0Q2FtTmVhckRvZihuZXdjYW0sIDAuNCk7XHJcblx0U2V0Q2FtRmFyRG9mKG5ld2NhbSwgMS4yKTtcclxuXHRTZXRDYW1Eb2ZTdHJlbmd0aChuZXdjYW0sIDAuMyk7XHJcblx0dXNlSGlEb2YobmV3Y2FtKTtcclxuXHJcblx0RGVzdHJveUNhbShvbGRDYW0sIHRydWUpO1xyXG59O1xyXG5cclxuY29uc3QgdXNlSGlEb2YgPSAoY3VycmVudGNhbTogQ2FtZXJhKSA9PiB7XHJcblx0aWYgKCEoRG9lc0NhbUV4aXN0KGNhbSkgJiYgY3VycmVudGNhbSA9PSBjYW0pKSByZXR1cm47XHJcblx0U2V0VXNlSGlEb2YoKTtcclxuXHRzZXRUaW1lb3V0KHVzZUhpRG9mLCAwKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzdGFydENhbWVyYSA9IGFzeW5jIChwZWQ6IG51bWJlcikgPT4ge1xyXG5cdGlmIChydW5uaW5nKSByZXR1cm47XHJcblx0cGVkID0gcGVkO1xyXG5cdHJ1bm5pbmcgPSB0cnVlO1xyXG5cdGNhbURpc3RhbmNlID0gMS4wO1xyXG5cdGNhbSA9IENyZWF0ZUNhbSgnREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkEnLCB0cnVlKTtcclxuXHRjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIDMxMDg2LCAwLjAsIDAuMCwgMC4wKTtcclxuXHRTZXRDYW1Db29yZChjYW0sIHgsIHksIHopO1xyXG5cdFJlbmRlclNjcmlwdENhbXModHJ1ZSwgdHJ1ZSwgMTAwMCwgdHJ1ZSwgdHJ1ZSk7XHJcblx0bW92ZUNhbWVyYSh7IHg6IHgsIHk6IHksIHo6IHogfSwgY2FtRGlzdGFuY2UpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0b3BDYW1lcmEgPSAoKTogdm9pZCA9PiB7XHJcblx0aWYgKCFydW5uaW5nKSByZXR1cm47XHJcblx0cnVubmluZyA9IGZhbHNlO1xyXG5cclxuXHRSZW5kZXJTY3JpcHRDYW1zKGZhbHNlLCB0cnVlLCAyNTAsIHRydWUsIGZhbHNlKTtcclxuXHREZXN0cm95Q2FtKGNhbSwgdHJ1ZSk7XHJcblx0Y2FtID0gbnVsbDtcclxuXHR0YXJnZXRDb29yZHMgPSBudWxsO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0Q2FtZXJhID0gKHR5cGU/OiBrZXlvZiBDYW1lcmFCb25lcyk6IHZvaWQgPT4ge1xyXG5cdGNvbnN0IGJvbmU6IG51bWJlciB8IHVuZGVmaW5lZCA9IENhbWVyYUJvbmVzW3R5cGVdO1xyXG5cdGlmIChjdXJyZW50Qm9uZSA9PSB0eXBlKSByZXR1cm47XHJcblx0Y29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IGJvbmVcclxuXHRcdD8gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmUsIDAuMCwgMC4wLCBib25lID09PSAxNDIwMSA/IDAuMiA6IDAuMClcclxuXHRcdDogR2V0RW50aXR5Q29vcmRzKHBlZCwgZmFsc2UpO1xyXG5cclxuXHRtb3ZlQ2FtZXJhKFxyXG5cdFx0e1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5LFxyXG5cdFx0XHR6OiB6ICsgMC4wLFxyXG5cdFx0fSxcclxuXHRcdDEuMFxyXG5cdCk7XHJcblxyXG5cdGN1cnJlbnRCb25lID0gdHlwZTtcclxufTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1Nb3ZlLCAoZGF0YSwgY2IpID0+IHtcclxuXHRjYigxKTtcclxuXHRsZXQgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpO1xyXG5cdGlmIChsYXN0WCA9PSBkYXRhLngpIHtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0aGVhZGluZyA9IGRhdGEueCA+IGxhc3RYID8gaGVhZGluZyArIDUgOiBoZWFkaW5nIC0gNTtcclxuXHRTZXRFbnRpdHlIZWFkaW5nKHBlZCwgaGVhZGluZyk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVNjcm9sbCwgKHR5cGU6IG51bWJlciwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c3dpdGNoICh0eXBlKSB7XHJcblx0XHRjYXNlIDI6XHJcblx0XHRcdHNldENhbWVyYSgpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdGNhc2UgMTpcclxuXHRcdFx0c2V0Q2FtZXJhKCdsZWdzJyk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAzOlxyXG5cdFx0XHRzZXRDYW1lcmEoJ2hlYWQnKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0fVxyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW1ab29tLCAoZGF0YSwgY2IpID0+IHtcclxuXHRpZiAoZGF0YSA9PT0gJ2Rvd24nKSB7XHJcblx0XHRjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgKyAwLjA1O1xyXG5cdFx0Y2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA+PSAxLjAgPyAxLjAgOiBuZXdEaXN0YW5jZTtcclxuXHR9IGVsc2UgaWYgKGRhdGEgPT09ICd1cCcpIHtcclxuXHRcdGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSAtIDAuMDU7XHJcblx0XHRjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlIDw9IDAuMzUgPyAwLjM1IDogbmV3RGlzdGFuY2U7XHJcblx0fVxyXG5cclxuXHRjYW1EaXN0YW5jZSA9IGNhbURpc3RhbmNlO1xyXG5cdHNldENhbVBvc2l0aW9uKCk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiQmxlbWlzaGVzXCIsXG4gICAgXCJGYWNpYWxIYWlyXCIsXG4gICAgXCJFeWVicm93c1wiLFxuICAgIFwiQWdlaW5nXCIsXG4gICAgXCJNYWtldXBcIixcbiAgICBcIkJsdXNoXCIsXG4gICAgXCJDb21wbGV4aW9uXCIsXG4gICAgXCJTdW5EYW1hZ2VcIixcbiAgICBcIkxpcHN0aWNrXCIsXG4gICAgXCJNb2xlc0ZyZWNrbGVzXCIsXG4gICAgXCJDaGVzdEhhaXJcIixcbiAgICBcIkJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkFkZEJvZHlCbGVtaXNoZXNcIixcbiAgICBcIkV5ZUNvbG9yXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJOb3NlX1dpZHRoXCIsXG4gICAgXCJOb3NlX1BlYWtfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTGVuZ2h0XCIsXG4gICAgXCJOb3NlX0JvbmVfSGVpZ2h0XCIsXG4gICAgXCJOb3NlX1BlYWtfTG93ZXJpbmdcIixcbiAgICBcIk5vc2VfQm9uZV9Ud2lzdFwiLFxuICAgIFwiRXllQnJvd25fSGVpZ2h0XCIsXG4gICAgXCJFeWVCcm93bl9Gb3J3YXJkXCIsXG4gICAgXCJDaGVla3NfQm9uZV9IaWdoXCIsXG4gICAgXCJDaGVla3NfQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hlZWtzX1dpZHRoXCIsXG4gICAgXCJFeWVzX09wZW5uaW5nXCIsXG4gICAgXCJMaXBzX1RoaWNrbmVzc1wiLFxuICAgIFwiSmF3X0JvbmVfV2lkdGhcIixcbiAgICBcIkphd19Cb25lX0JhY2tfTGVuZ2h0XCIsXG4gICAgXCJDaGluX0JvbmVfTG93ZXJpbmdcIixcbiAgICBcIkNoaW5fQm9uZV9MZW5ndGhcIixcbiAgICBcIkNoaW5fQm9uZV9XaWR0aFwiLFxuICAgIFwiQ2hpbl9Ib2xlXCIsXG4gICAgXCJOZWNrX1RoaWtuZXNzXCJcbl1cbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJmYWNlXCIsXG4gICAgXCJtYXNrc1wiLFxuICAgIFwiaGFpclwiLFxuICAgIFwidG9yc29zXCIsXG4gICAgXCJsZWdzXCIsXG4gICAgXCJiYWdzXCIsXG4gICAgXCJzaG9lc1wiLFxuICAgIFwibmVja1wiLFxuICAgIFwic2hpcnRzXCIsXG4gICAgXCJ2ZXN0XCIsXG4gICAgXCJkZWNhbHNcIixcbiAgICBcImphY2tldHNcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImhhdHNcIixcbiAgICBcImdsYXNzZXNcIixcbiAgICBcImVhcnJpbmdzXCIsXG4gICAgXCJtb3V0aFwiLFxuICAgIFwibGhhbmRcIixcbiAgICBcInJoYW5kXCIsXG4gICAgXCJ3YXRjaGVzXCIsXG4gICAgXCJicmFjZWxldHNcIlxuXVxuIiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUSGFpckRhdGEsIFRIZWFkT3ZlcmxheSwgVEhlYWRPdmVybGF5VG90YWwgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiXHJcbmltcG9ydCBIRUFEX09WRVJMQVlTIGZyb20gXCJAZGF0YS9oZWFkXCJcclxuaW1wb3J0IEZBQ0VfRkVBVFVSRVMgZnJvbSBcIkBkYXRhL2ZhY2VcIlxyXG5pbXBvcnQgRFJBV0FCTEVfTkFNRVMgZnJvbSBcIkBkYXRhL2RyYXdhYmxlc1wiXHJcbmltcG9ydCBQUk9QX05BTUVTIGZyb20gXCJAZGF0YS9wcm9wc1wiXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZE1vZGVsSW5kZXggKHRhcmdldDogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxuICAgIGNvbnN0IG1vZGVscyA9IGNvbmZpZy5tb2RlbHMoKVxyXG4gICAgXHJcbiAgICByZXR1cm4gbW9kZWxzLmZpbmRJbmRleCgobW9kZWwpID0+IEdldEhhc2hLZXkobW9kZWwpICA9PT0gdGFyZ2V0KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFpciAocGVkOiBudW1iZXIpOiBUSGFpckRhdGEge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29sb3I6IEdldFBlZEhhaXJDb2xvcihwZWQpLFxyXG4gICAgICAgIGhpZ2hsaWdodDogR2V0UGVkSGFpckhpZ2hsaWdodENvbG9yKHBlZClcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRCbGVuZERhdGEocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgaGVhZGJsZW5kRGF0YSA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5HZXRIZWFkQmxlbmREYXRhKHBlZClcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNoYXBlRmlyc3Q6IGhlYWRibGVuZERhdGEuRmlyc3RGYWNlU2hhcGUsICAgLy8gZmF0aGVyXHJcbiAgICAgICAgc2hhcGVTZWNvbmQ6IGhlYWRibGVuZERhdGEuU2Vjb25kRmFjZVNoYXBlLCAvLyBtb3RoZXJcclxuICAgICAgICBzaGFwZVRoaXJkOiBoZWFkYmxlbmREYXRhLlRoaXJkRmFjZVNoYXBlLFxyXG5cclxuICAgICAgICBza2luRmlyc3Q6IGhlYWRibGVuZERhdGEuRmlyc3RTa2luVG9uZSxcclxuICAgICAgICBza2luU2Vjb25kOiBoZWFkYmxlbmREYXRhLlNlY29uZFNraW5Ub25lLFxyXG4gICAgICAgIHNraW5UaGlyZDogaGVhZGJsZW5kRGF0YS5UaGlyZFNraW5Ub25lLFxyXG5cclxuICAgICAgICBzaGFwZU1peDogaGVhZGJsZW5kRGF0YS5QYXJlbnRGYWNlU2hhcGVQZXJjZW50LCAvLyByZXNlbWJsYW5jZVxyXG5cclxuICAgICAgICB0aGlyZE1peDogaGVhZGJsZW5kRGF0YS5QYXJlbnRUaGlyZFVua1BlcmNlbnQsXHJcbiAgICAgICAgc2tpbk1peDogaGVhZGJsZW5kRGF0YS5QYXJlbnRTa2luVG9uZVBlcmNlbnQsICAgLy8gc2tpbnBlcmNlbnRcclxuXHJcbiAgICAgICAgaGFzUGFyZW50OiBoZWFkYmxlbmREYXRhLklzUGFyZW50SW5oZXJpdGFuY2UsXHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZE92ZXJsYXkocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgbGV0IHRvdGFsczogVEhlYWRPdmVybGF5VG90YWwgPSB7fTtcclxuICAgIGxldCBoZWFkRGF0YTogVEhlYWRPdmVybGF5ID0ge307XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBIRUFEX09WRVJMQVlTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEhFQURfT1ZFUkxBWVNbaV07XHJcbiAgICAgICAgdG90YWxzW292ZXJsYXldID0gR2V0TnVtSGVhZE92ZXJsYXlWYWx1ZXMoaSk7XHJcblxyXG4gICAgICAgIGlmIChvdmVybGF5ID09PSBcIkV5ZUNvbG9yXCIpIHtcclxuICAgICAgICAgICAgaGVhZERhdGFbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBHZXRQZWRFeWVDb2xvcihwZWQpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgW18sIG92ZXJsYXlWYWx1ZSwgY29sb3VyVHlwZSwgZmlyc3RDb2xvciwgc2Vjb25kQ29sb3IsIG92ZXJsYXlPcGFjaXR5XSA9IEdldFBlZEhlYWRPdmVybGF5RGF0YShwZWQsIGkpO1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGkgLSAxLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBvdmVybGF5VmFsdWUgPT09IDI1NSA/IC0xIDogb3ZlcmxheVZhbHVlLFxyXG4gICAgICAgICAgICAgICAgY29sb3VyVHlwZTogY29sb3VyVHlwZSxcclxuICAgICAgICAgICAgICAgIGZpcnN0Q29sb3I6IGZpcnN0Q29sb3IsXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRDb2xvcjogc2Vjb25kQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5T3BhY2l0eTogb3ZlcmxheU9wYWNpdHlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtoZWFkRGF0YSwgdG90YWxzXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRTdHJ1Y3R1cmUocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgcGVkTW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWQpXHJcblxyXG4gICAgaWYgKHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSAmJiBwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIikpIHJldHVyblxyXG5cclxuICAgIGxldCBmYWNlU3RydWN0ID0ge31cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRkFDRV9GRUFUVVJFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBGQUNFX0ZFQVRVUkVTW2ldXHJcbiAgICAgICAgZmFjZVN0cnVjdFtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRmFjZUZlYXR1cmUocGVkLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFjZVN0cnVjdFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RHJhd2FibGVzKHBlZDogbnVtYmVyKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGxldCBkcmF3YWJsZXMgPSB7fVxyXG4gICAgbGV0IHRvdGFsRHJhd2FibGVzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IERSQVdBQkxFX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IERSQVdBQkxFX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaSlcclxuXHJcbiAgICAgICAgdG90YWxEcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkRHJhd2FibGVWYXJpYXRpb25zKHBlZCwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFRleHR1cmVWYXJpYXRpb25zKHBlZCwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRUZXh0dXJlVmFyaWF0aW9uKHBlZCwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtkcmF3YWJsZXMsIHRvdGFsRHJhd2FibGVzXVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcHMocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgbGV0IHByb3BzID0ge31cclxuICAgIGxldCB0b3RhbFByb3BzID0ge31cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFBST1BfTkFNRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gUFJPUF9OQU1FU1tpXVxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpKVxyXG5cclxuICAgICAgICB0b3RhbFByb3BzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHRvdGFsOiBHZXROdW1iZXJPZlBlZFByb3BEcmF3YWJsZVZhcmlhdGlvbnMocGVkLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZXM6IEdldE51bWJlck9mUGVkUHJvcFRleHR1cmVWYXJpYXRpb25zKHBlZCwgaSwgY3VycmVudClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3BzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWRQcm9wSW5kZXgocGVkLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZTogR2V0UGVkUHJvcFRleHR1cmVJbmRleChwZWQsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbcHJvcHMsIHRvdGFsUHJvcHNdXHJcbn1cclxuXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBwZWFyYW5jZShwZWQ6IG51bWJlcik6IFByb21pc2U8VEFwcGVhcmFuY2U+IHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBbaGVhZERhdGEsIHRvdGFsc10gPSBnZXRIZWFkT3ZlcmxheShwZWQpXHJcbiAgICBjb25zdCBbZHJhd2FibGVzLCBkcmF3VG90YWxdID0gZ2V0RHJhd2FibGVzKHBlZClcclxuICAgIGNvbnN0IFtwcm9wcywgcHJvcFRvdGFsXSA9IGdldFByb3BzKHBlZClcclxuICAgIGNvbnN0IG1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbW9kZWxJbmRleDogZmluZE1vZGVsSW5kZXgobW9kZWwpLFxyXG4gICAgICAgIG1vZGVsOiBtb2RlbCxcclxuICAgICAgICBoYWlyQ29sb3I6IGdldEhhaXIocGVkKSxcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkKSxcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEgYXMgVEhlYWRPdmVybGF5LFxyXG4gICAgICAgIGhlYWRPdmVybGF5VG90YWw6IHRvdGFscyBhcyBUSGVhZE92ZXJsYXlUb3RhbCxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZCksXHJcbiAgICAgICAgZHJhd2FibGVzOiBkcmF3YWJsZXMsXHJcbiAgICAgICAgcHJvcHM6IHByb3BzLFxyXG4gICAgICAgIGRyYXdUb3RhbDogZHJhd1RvdGFsLFxyXG4gICAgICAgIHByb3BUb3RhbDogcHJvcFRvdGFsLFxyXG4gICAgICAgIHRhdHRvb3M6IFtdXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldEFwcGVhcmFuY2VcIiwgZ2V0QXBwZWFyYW5jZSlcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQZWRDbG90aGVzKHBlZDogbnVtYmVyKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGNvbnN0IFtkcmF3YWJsZXMsIGRyYXdUb3RhbF0gPSBnZXREcmF3YWJsZXMocGVkKVxyXG4gICAgY29uc3QgW3Byb3BzLCBwcm9wVG90YWxdID0gZ2V0UHJvcHMocGVkKVxyXG4gICAgY29uc3QgW2hlYWREYXRhLCB0b3RhbHNdID0gZ2V0SGVhZE92ZXJsYXkocGVkKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaGVhZE92ZXJsYXk6IGhlYWREYXRhLFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkQ2xvdGhlc1wiLCBnZXRQZWRDbG90aGVzKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBlZFNraW4ocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkQmxlbmQ6IGdldEhlYWRCbGVuZERhdGEocGVkKSxcclxuICAgICAgICBoZWFkU3RydWN0dXJlOiBnZXRIZWFkU3RydWN0dXJlKHBlZCksXHJcbiAgICAgICAgaGFpckNvbG9yOiBnZXRIYWlyKHBlZCksXHJcbiAgICAgICAgbW9kZWwgOiBHZXRFbnRpdHlNb2RlbChwZWQpXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cyhcIkdldFBlZFNraW5cIiwgZ2V0UGVkU2tpbilcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUYXR0b29EYXRhKCkge1xyXG4gICAgbGV0IHRhdHRvb1pvbmVzID0ge31cclxuXHJcbiAgICBjb25zdCBbVEFUVE9PX0xJU1QsIFRBVFRPT19DQVRFR09SSUVTXSA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS50YXR0b29zKClcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVEFUVE9PX0NBVEVHT1JJRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBjYXRlZ29yeSA9IFRBVFRPT19DQVRFR09SSUVTW2ldXHJcbiAgICAgICAgY29uc3Qgem9uZSA9IGNhdGVnb3J5LnpvbmVcclxuICAgICAgICBjb25zdCBsYWJlbCA9IGNhdGVnb3J5LmxhYmVsXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBjYXRlZ29yeS5pbmRleFxyXG4gICAgICAgIHRhdHRvb1pvbmVzW2luZGV4XSA9IHtcclxuICAgICAgICAgICAgem9uZTogem9uZSxcclxuICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxyXG4gICAgICAgICAgICB6b25lSW5kZXg6IGluZGV4LFxyXG4gICAgICAgICAgICBkbGNzOiBbXVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBUQVRUT09fTElTVC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBjb25zdCBkbGNEYXRhID0gVEFUVE9PX0xJU1Rbal1cclxuICAgICAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdLmRsY3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZGxjRGF0YS5kbGMsXHJcbiAgICAgICAgICAgICAgICBkbGNJbmRleDogaixcclxuICAgICAgICAgICAgICAgIHRhdHRvb3M6IFtdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlzRmVtYWxlID0gR2V0RW50aXR5TW9kZWwoUGxheWVyUGVkSWQoKSkgPT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fTElTVC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBUQVRUT09fTElTVFtpXVxyXG4gICAgICAgIGNvbnN0IHsgZGxjLCB0YXR0b29zIH0gPSBkYXRhXHJcbiAgICAgICAgY29uc3QgZGxjSGFzaCA9IEdldEhhc2hLZXkoZGxjKVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGF0dG9vcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gdGF0dG9vc1tqXSBcclxuICAgICAgICAgICAgbGV0IHRhdHRvbyA9IG51bGxcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyVGF0dG9vID0gdGF0dG9vRGF0YS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIGNvbnN0IGlzRmVtYWxlVGF0dG9vID0gbG93ZXJUYXR0b28uaW5jbHVkZXMoXCJfZlwiKVxyXG4gICAgICAgICAgICBpZiAoaXNGZW1hbGVUYXR0b28gJiYgaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNGZW1hbGVUYXR0b28gJiYgIWlzRmVtYWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXR0b28gPSB0YXR0b29EYXRhXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBoYXNoID0gbnVsbFxyXG4gICAgICAgICAgICBsZXQgem9uZSA9IC0xXHJcblxyXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoID0gR2V0SGFzaEtleSh0YXR0b28pXHJcbiAgICAgICAgICAgICAgICB6b25lID0gR2V0UGVkRGVjb3JhdGlvblpvbmVGcm9tSGFzaGVzKGRsY0hhc2gsIGhhc2gpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh6b25lICE9PSAtMSAmJiBoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB6b25lVGF0dG9vcyA9IHRhdHRvb1pvbmVzW3pvbmVdLmRsY3NbaV0udGF0dG9vc1xyXG5cclxuICAgICAgICAgICAgICAgIHpvbmVUYXR0b29zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0YXR0b28sXHJcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogaGFzaCxcclxuICAgICAgICAgICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICAgICAgICAgIGRsYzogZGxjLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGF0dG9vWm9uZXNcclxufSIsICJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICAgIGhhdHM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMCxcclxuICAgIH0sXHJcbiAgICBnbGFzc2VzOiB7XHJcbiAgICAgICAgdHlwZTogXCJwcm9wXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICB9LFxyXG4gICAgbWFza3M6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDEsXHJcbiAgICAgICAgb2ZmOiAwLFxyXG4gICAgfSxcclxuICAgIHNoaXJ0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogOCxcclxuICAgICAgICBvZmY6IDE1XHJcbiAgICB9LFxyXG4gICAgamFja2V0czoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMTEsXHJcbiAgICAgICAgb2ZmOiAxNSxcclxuICAgIH0sXHJcbiAgICBsZWdzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA0LFxyXG4gICAgICAgIG9mZjogMTEsXHJcbiAgICB9LFxyXG4gICAgc2hvZXM6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDYsXHJcbiAgICAgICAgb2ZmOiAxMyxcclxuICAgIH1cclxufSIsICJpbXBvcnQgeyBEcmF3YWJsZURhdGEsIFRWYWx1ZSB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCI7XHJcbmltcG9ydCBUT0dHTEVfSU5ERVhFUyBmcm9tIFwiQGRhdGEvdG9nZ2xlc1wiXHJcbmltcG9ydCB7IGNvcHlGaWxlU3luYyB9IGZyb20gXCJmc1wiO1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXREcmF3YWJsZShwZWQ6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgMClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFByb3AocGVkOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBpZiAoZGF0YS52YWx1ZSA9PT0gLTEpIHtcclxuICAgICAgICBDbGVhclBlZFByb3AocGVkLCBkYXRhLmluZGV4KVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIFNldFBlZFByb3BJbmRleChwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgZmFsc2UpXHJcbn1cclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0TW9kZWwocGVkOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBpc0p1c3RNb2RlbCA9IHR5cGVvZiBkYXRhID09PSAnbnVtYmVyJ1xyXG4gICAgY29uc3QgbW9kZWwgPSBpc0p1c3RNb2RlbCA/IGRhdGEgOiBkYXRhLm1vZGVsXHJcbiAgICBjb25zdCBpc1BsYXllciA9IElzUGVkQVBsYXllcihwZWQpXHJcblxyXG4gICAgaWYgKGlzUGxheWVyKSB7XHJcbiAgICAgICAgUmVxdWVzdE1vZGVsKG1vZGVsKVxyXG4gICAgICAgIFNldFBsYXllck1vZGVsKFBsYXllcklkKCksIG1vZGVsKVxyXG4gICAgICAgIFNldE1vZGVsQXNOb0xvbmdlck5lZWRlZChtb2RlbClcclxuICAgICAgICBwZWQgPSBQbGF5ZXJQZWRJZCgpXHJcbiAgICB9XHJcbiAgICBTZXRQZWREZWZhdWx0Q29tcG9uZW50VmFyaWF0aW9uKHBlZClcclxuXHJcbiAgICBpZiAoIWlzSnVzdE1vZGVsKSB7XHJcbiAgICAgICAgaWYgKGRhdGEuaGVhZEJsZW5kKSB7XHJcbiAgICAgICAgICAgIGlmICghaXNKdXN0TW9kZWwgJiYgT2JqZWN0LmtleXMoZGF0YS5oZWFkQmxlbmQpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgc2V0SGVhZEJsZW5kKHBlZCwgZGF0YS5oZWFkQmxlbmQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBlZFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gU2V0RmFjZUZlYXR1cmUocGVkOiBudW1iZXIsIGRhdGE6IFRWYWx1ZSkge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuICAgIFNldFBlZEZhY2VGZWF0dXJlKHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSArIDAuMClcclxufVxyXG5cclxuY29uc3QgaXNQb3NpdGl2ZSA9ICh2YWw6IG51bWJlcikgPT4gdmFsID49IDAgPyB2YWwgOiAwXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0SGVhZEJsZW5kKHBlZDogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGNvbnN0IHNoYXBlRmlyc3QgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVGaXJzdClcclxuICAgIGNvbnN0IHNoYXBlU2Vjb25kID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlU2Vjb25kKVxyXG4gICAgY29uc3Qgc2hhcGVUaGlyZCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZVRoaXJkKVxyXG4gICAgY29uc3Qgc2tpbkZpcnN0ID0gaXNQb3NpdGl2ZShkYXRhLnNraW5GaXJzdClcclxuICAgIGNvbnN0IHNraW5TZWNvbmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpblNlY29uZClcclxuICAgIGNvbnN0IHNraW5UaGlyZCA9IGlzUG9zaXRpdmUoZGF0YS5za2luVGhpcmQpXHJcbiAgICBjb25zdCBzaGFwZU1peCA9IGRhdGEuc2hhcGVNaXggKyAwLjBcclxuICAgIGNvbnN0IHNraW5NaXggPSBkYXRhLnNraW5NaXggKyAwLjBcclxuICAgIGNvbnN0IHRoaXJkTWl4ID0gZGF0YS50aGlyZE1peCArIDAuMFxyXG4gICAgY29uc3QgaGFzUGFyZW50ID0gZGF0YS5oYXNQYXJlbnRcclxuXHJcbiAgICBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgc2hhcGVGaXJzdCwgc2hhcGVTZWNvbmQsIHNoYXBlVGhpcmQsIHNraW5GaXJzdCwgc2tpblNlY29uZCwgc2tpblRoaXJkLCBzaGFwZU1peCwgc2tpbk1peCxcclxuICAgICAgICB0aGlyZE1peCwgaGFzUGFyZW50KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0SGVhZE92ZXJsYXkocGVkOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBpbmRleCA9IGRhdGEuaW5kZXhcclxuXHJcbiAgICBpZiAoaW5kZXggPT09IDEzKSB7XHJcbiAgICAgICAgU2V0UGVkRXllQ29sb3IocGVkLCBkYXRhLnZhbHVlKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZhbHVlID0gZGF0YS5vdmVybGF5VmFsdWUgPT09IC0xID8gMjU1IDogZGF0YS5vdmVybGF5VmFsdWVcclxuXHJcbiAgICBTZXRQZWRIZWFkT3ZlcmxheShwZWQsIGluZGV4LCB2YWx1ZSwgZGF0YS5vdmVybGF5T3BhY2l0eSArIDAuMClcclxuICAgIFNldFBlZEhlYWRPdmVybGF5Q29sb3IocGVkLCBpbmRleCwgMSwgZGF0YS5maXJzdENvbG9yLCBkYXRhLnNlY29uZENvbG9yKVxyXG59XHJcblxyXG4vLyBmdW5jdGlvbiBSZXNldFRvZ2dsZXMoZGF0YSlcclxuLy8gICAgIGxvY2FsIHBlZCA9IGNhY2hlLnBlZFxyXG5cclxuLy8gICAgIGxvY2FsIGRyYXdhYmxlcyA9IGRhdGEuZHJhd2FibGVzXHJcbi8vICAgICBsb2NhbCBwcm9wcyA9IGRhdGEucHJvcHNcclxuXHJcbi8vICAgICBmb3IgdG9nZ2xlSXRlbSwgdG9nZ2xlRGF0YSBpbiBwYWlycyhUT0dHTEVfSU5ERVhFUykgZG9cclxuLy8gICAgICAgICBsb2NhbCB0b2dnbGVUeXBlID0gdG9nZ2xlRGF0YS50eXBlXHJcbi8vICAgICAgICAgbG9jYWwgaW5kZXggPSB0b2dnbGVEYXRhLmluZGV4XHJcblxyXG4vLyAgICAgICAgIGlmIHRvZ2dsZVR5cGUgPT0gXCJkcmF3YWJsZVwiIGFuZCBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0gdGhlblxyXG4vLyAgICAgICAgICAgICBsb2NhbCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KVxyXG4vLyAgICAgICAgICAgICBpZiBjdXJyZW50RHJhd2FibGUgfj0gZHJhd2FibGVzW3RvZ2dsZUl0ZW1dLnZhbHVlIHRoZW5cclxuLy8gICAgICAgICAgICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIDApXHJcbi8vICAgICAgICAgICAgIGVuZFxyXG4vLyAgICAgICAgIGVsc2VpZiB0b2dnbGVUeXBlID09IFwicHJvcFwiIGFuZCBwcm9wc1t0b2dnbGVJdGVtXSB0aGVuXHJcbi8vICAgICAgICAgICAgIGxvY2FsIGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpXHJcbi8vICAgICAgICAgICAgIGlmIGN1cnJlbnRQcm9wIH49IHByb3BzW3RvZ2dsZUl0ZW1dLnZhbHVlIHRoZW5cclxuLy8gICAgICAgICAgICAgICAgIFNldFBlZFByb3BJbmRleChwZWQsIGluZGV4LCBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgZmFsc2UpXHJcbi8vICAgICAgICAgICAgIGVuZFxyXG4vLyAgICAgICAgIGVuZFxyXG4vLyAgICAgZW5kXHJcbi8vIGVuZFxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0VG9nZ2xlcyhkYXRhKSB7XHJcbiAgICBjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpXHJcbiAgICBjb25zdCBkcmF3YWJsZXMgPSBkYXRhLmRyYXdhYmxlc1xyXG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BzXHJcblxyXG4gICAgZm9yIChjb25zdCBbdG9nZ2xlSXRlbSwgdG9nZ2xlRGF0YV0gb2YgT2JqZWN0LmVudHJpZXMoVE9HR0xFX0lOREVYRVMpKSB7XHJcbiAgICAgICAgY29uc3QgdG9nZ2xlVHlwZSA9IHRvZ2dsZURhdGEudHlwZVxyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdG9nZ2xlRGF0YS5pbmRleFxyXG5cclxuICAgICAgICBpZiAodG9nZ2xlVHlwZSA9PT0gXCJkcmF3YWJsZVwiICYmIGRyYXdhYmxlc1t0b2dnbGVJdGVtXSkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudERyYXdhYmxlICE9PSBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUsIDAsIDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHRvZ2dsZVR5cGUgPT09IFwicHJvcFwiICYmIHByb3BzW3RvZ2dsZUl0ZW1dKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UHJvcCAhPT0gcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZFByb3BJbmRleChwZWQsIGluZGV4LCBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgZmFsc2UpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRDbG90aGVzKHBlZDogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGNvbnN0IGRyYXdhYmxlcyA9IGRhdGEuZHJhd2FibGVzXHJcbiAgICBjb25zdCBwcm9wcyA9IGRhdGEucHJvcHNcclxuICAgIGNvbnN0IGhlYWRPdmVybGF5ID0gZGF0YS5oZWFkT3ZlcmxheVxyXG4gICAgY29uc29sZS5sb2coJ2RyYXdhYmxlcycsIGRyYXdhYmxlcylcclxuICAgIGZvciAoY29uc3QgaWQgaW4gZHJhd2FibGVzKSB7XHJcbiAgICAgICAgY29uc3QgZHJhd2FibGUgPSBkcmF3YWJsZXNbaWRdXHJcbiAgICAgICAgc2V0RHJhd2FibGUocGVkLCBkcmF3YWJsZSlcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IGlkIGluIHByb3BzKSB7XHJcbiAgICAgICAgY29uc3QgcHJvcCA9IHByb3BzW2lkXVxyXG4gICAgICAgIHNldFByb3AocGVkLCBwcm9wKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgaWQgaW4gaGVhZE92ZXJsYXkpIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gaGVhZE92ZXJsYXlbaWRdXHJcbiAgICAgICAgc2V0SGVhZE92ZXJsYXkocGVkLCBvdmVybGF5KVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkU2tpbihwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuICAgIGNvbnN0IGhlYWRTdHJ1Y3R1cmUgPSBkYXRhLmhlYWRTdHJ1Y3R1cmVcclxuICAgIGNvbnN0IGhlYWRCbGVuZCA9IGRhdGEuaGVhZEJsZW5kXHJcblxyXG4gICAgcGVkID0gc2V0TW9kZWwocGVkLCBkYXRhKVxyXG4gICAgaWYgKGhlYWRCbGVuZCkge1xyXG4gICAgICAgIHNldEhlYWRCbGVuZChwZWQsIGhlYWRCbGVuZClcclxuICAgIH1cclxuICAgIGlmIChoZWFkU3RydWN0dXJlKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBmZWF0dXJlIG9mIGhlYWRTdHJ1Y3R1cmUpIHtcclxuICAgICAgICAgICAgU2V0RmFjZUZlYXR1cmUocGVkLCBmZWF0dXJlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZFRhdHRvb3MocGVkOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIGlmICghZGF0YSkgcmV0dXJuXHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGNvbnN0IGlzUGxheWVyID0gSXNQZWRBUGxheWVyKHBlZClcclxuICAgIGlmIChpc1BsYXllcikge1xyXG4gICAgICAgIHBlZCA9IFBsYXllclBlZElkKClcclxuICAgIH1cclxuXHJcbiAgICBDbGVhclBlZERlY29yYXRpb25zTGVhdmVTY2FycyhwZWQpXHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdGF0dG9vRGF0YSA9IGRhdGFbaV0udGF0dG9vXHJcbiAgICAgICAgaWYgKHRhdHRvb0RhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IEdldEhhc2hLZXkodGF0dG9vRGF0YS5kbGMpXHJcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvbyA9IHRhdHRvb0RhdGEuaGFzaFxyXG4gICAgICAgICAgICBBZGRQZWREZWNvcmF0aW9uRnJvbUhhc2hlcyhwZWQsIGNvbGxlY3Rpb24sIHRhdHRvbylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRIYWlyQ29sb3JzKHBlZDogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGNvbnN0IGNvbG9yID0gZGF0YS5jb2xvclxyXG4gICAgY29uc3QgaGlnaGxpZ2h0ID0gZGF0YS5oaWdobGlnaHRcclxuICAgIFNldFBlZEhhaXJDb2xvcihwZWQsIGNvbG9yLCBoaWdobGlnaHQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRBcHBlYXJhbmNlKHBlZDogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBzZXRQZWRTa2luKHBlZCwgZGF0YSlcclxuICAgIHNldFBlZENsb3RoZXMocGVkLCBkYXRhKVxyXG4gICAgc2V0UGVkSGFpckNvbG9ycyhwZWQsIGRhdGEuaGFpckNvbG9yKVxyXG4gICAgc2V0UGVkVGF0dG9vcyhwZWQsIGRhdGEudGF0dG9vcylcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBsYXllclBlZEFwcGVhcmFuY2UoZGF0YSkge1xyXG4gICAgc2V0UGVkU2tpbihQbGF5ZXJQZWRJZCgpLCBkYXRhKVxyXG4gICAgc2V0UGVkQ2xvdGhlcyhQbGF5ZXJQZWRJZCgpLCBkYXRhKVxyXG4gICAgc2V0UGVkSGFpckNvbG9ycyhQbGF5ZXJQZWRJZCgpLCBkYXRhLmhhaXJDb2xvcilcclxuICAgIHNldFBlZFRhdHRvb3MoUGxheWVyUGVkSWQoKSwgZGF0YS50YXR0b29zKVxyXG59IiwgImltcG9ydCB7IFJlY2VpdmUgfSBmcm9tICdAZXZlbnRzJztcclxuaW1wb3J0IHtcclxuXHRyZXNldFRvZ2dsZXMsXHJcblx0c2V0RHJhd2FibGUsXHJcblx0U2V0RmFjZUZlYXR1cmUsXHJcblx0c2V0SGVhZEJsZW5kLFxyXG5cdHNldE1vZGVsLFxyXG5cdHNldFBlZENsb3RoZXMsXHJcblx0c2V0UGVkVGF0dG9vcyxcclxuXHRzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlLFxyXG5cdHNldFByb3AsXHJcbn0gZnJvbSAnLi9hcHBlYXJhbmNlL3NldHRlcnMnO1xyXG5pbXBvcnQgeyBjbG9zZU1lbnUgfSBmcm9tICcuL21lbnUnO1xyXG5pbXBvcnQgeyBUQXBwZWFyYW5jZSwgVFRvZ2dsZURhdGEsIFRWYWx1ZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xyXG5pbXBvcnQgeyBkZWxheSwgZ2V0RnJhbWV3b3JrSUQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayB9IGZyb20gJ0B1dGlscyc7XHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldFRhdHRvb0RhdGEgfSBmcm9tICcuL2FwcGVhcmFuY2UvZ2V0dGVycyc7XHJcbmltcG9ydCBUT0dHTEVfSU5ERVhFUyBmcm9tICdAZGF0YS90b2dnbGVzJztcclxuaW1wb3J0IHsgT3V0Zml0IH0gZnJvbSAnQHR5cGluZ3Mvb3V0Zml0cyc7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FuY2VsLCAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ2NhbmNlbCcpXHJcblx0c2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKTtcclxuXHRjbG9zZU1lbnUoKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFxyXG5cdFJlY2VpdmUuc2F2ZSxcclxuXHRhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdzYXZlJylcclxuXHRcdHJlc2V0VG9nZ2xlcyhhcHBlYXJhbmNlKTtcclxuXHJcblx0XHRhd2FpdCBkZWxheSgxMDApO1xyXG5cclxuXHRcdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblxyXG5cdFx0Y29uc3QgbmV3QXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkKTtcclxuXHJcblx0XHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cclxuXHRcdHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayhcclxuXHRcdFx0J2JsX2FwcGVhcmFuY2U6c2VydmVyOnNldEFwcGVhcmFuY2UnLFxyXG5cdFx0XHRmcmFtZXdvcmtkSWQsXHJcblx0XHRcdG5ld0FwcGVhcmFuY2VcclxuXHRcdCk7XHJcblxyXG5cdFx0c2V0UGVkVGF0dG9vcyhwZWQsIGFwcGVhcmFuY2UudGF0dG9vcyk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdzYXZlJylcclxuXHRcdGNsb3NlTWVudSgpO1xyXG5cdFx0Y2IoMSk7XHJcblx0fVxyXG4pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldE1vZGVsLCBhc3luYyAobW9kZWw6IHN0cmluZywgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgaGFzaCA9IEdldEhhc2hLZXkobW9kZWwpO1xyXG5cdGlmICghSXNNb2RlbEluQ2RpbWFnZShoYXNoKSB8fCAhSXNNb2RlbFZhbGlkKGhhc2gpKSB7XHJcblx0XHRyZXR1cm4gY2IoMCk7XHJcblx0fVxyXG5cclxuXHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cclxuXHRzZXRNb2RlbChwZWQsIGhhc2gpO1xyXG5cclxuXHRjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpO1xyXG5cclxuXHRhcHBlYXJhbmNlLnRhdHRvb3MgPSBbXTtcclxuXHJcblx0Y2IoYXBwZWFyYW5jZSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmdldE1vZGVsVGF0dG9vcywgYXN5bmMgKF86IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgdGF0dG9vcyA9IGdldFRhdHRvb0RhdGEoKTtcclxuXHJcblx0Y2IodGF0dG9vcyk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhcclxuXHRSZWNlaXZlLnNldEhlYWRTdHJ1Y3R1cmUsXHJcblx0YXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0XHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cdFx0U2V0RmFjZUZlYXR1cmUocGVkLCBkYXRhKTtcclxuXHRcdGNiKDEpO1xyXG5cdH1cclxuKTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soXHJcblx0UmVjZWl2ZS5zZXRIZWFkT3ZlcmxheSxcclxuXHRhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRcdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0XHRTZXRGYWNlRmVhdHVyZShwZWQsIGRhdGEpO1xyXG5cdFx0Y2IoMSk7XHJcblx0fVxyXG4pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhcclxuXHRSZWNlaXZlLnNldEhlYWRCbGVuZCxcclxuXHRhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRcdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0XHRzZXRIZWFkQmxlbmQocGVkLCBkYXRhKTtcclxuXHRcdGNiKDEpO1xyXG5cdH1cclxuKTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRUYXR0b29zLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cdHNldFBlZFRhdHRvb3MocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0UHJvcCwgYXN5bmMgKGRhdGE6IFRWYWx1ZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0Y29uc3QgcGVkID0gUGxheWVyUGVkSWQoKTtcclxuXHRzZXRQcm9wKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldERyYXdhYmxlLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cdHNldERyYXdhYmxlKHBlZCwgZGF0YSk7XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhcclxuXHRSZWNlaXZlLnRvZ2dsZUl0ZW0sXHJcblx0YXN5bmMgKGRhdGE6IFRUb2dnbGVEYXRhLCBjYjogRnVuY3Rpb24pID0+IHtcclxuICAgICAgICBjb25zdCBpdGVtID0gVE9HR0xFX0lOREVYRVNbZGF0YS5pdGVtXTtcclxuXHRcdGlmICghaXRlbSkgcmV0dXJuIGNiKGZhbHNlKTtcclxuXHJcblx0XHRjb25zdCBjdXJyZW50ID0gZGF0YS5kYXRhO1xyXG5cdFx0Y29uc3QgdHlwZSA9IGl0ZW0udHlwZTtcclxuXHRcdGNvbnN0IGluZGV4ID0gaXRlbS5pbmRleDtcclxuXHJcblx0XHRpZiAoIWN1cnJlbnQpIHJldHVybiBjYihmYWxzZSk7XHJcblxyXG5cdFx0Y29uc3QgcGVkID0gUGxheWVyUGVkSWQoKTtcclxuXHJcblx0XHRpZiAodHlwZSA9PT0gJ3Byb3AnKSB7XHJcblx0XHRcdGNvbnN0IGN1cnJlbnRQcm9wID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgpO1xyXG5cclxuXHRcdFx0aWYgKGN1cnJlbnRQcm9wID09PSAtMSkge1xyXG5cdFx0XHRcdHNldFByb3AocGVkLCBjdXJyZW50KTtcclxuXHRcdFx0XHRjYihmYWxzZSk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdENsZWFyUGVkUHJvcChwZWQsIGluZGV4KTtcclxuXHRcdFx0XHRjYih0cnVlKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSBpZiAodHlwZSA9PT0gJ2RyYXdhYmxlJykge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RHJhd2FibGUgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGluZGV4KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50LnZhbHVlID09PSBpdGVtLm9mZikge1xyXG4gICAgICAgICAgICAgICAgY2IoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VycmVudC52YWx1ZSA9PT0gY3VycmVudERyYXdhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICBTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBpbmRleCwgaXRlbS5vZmYsIDAsIDApO1xyXG4gICAgICAgICAgICAgICAgY2IodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZXREcmF3YWJsZShwZWQsIGN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgY2IoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cdH1cclxuKTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zYXZlT3V0Zml0LCBhc3luYyAoZGF0YTogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soXHJcbiAgICAgICAgJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVPdXRmaXQnLFxyXG4gICAgICAgIGZyYW1ld29ya2RJZCxcclxuICAgICAgICBkYXRhXHJcbiAgICApO1xyXG4gICAgY2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZGVsZXRlT3V0Zml0LCBhc3luYyAoaWQ6IHN0cmluZywgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKFxyXG4gICAgICAgICdibF9hcHBlYXJhbmNlOnNlcnZlcjpkZWxldGVPdXRmaXQnLFxyXG4gICAgICAgIGZyYW1ld29ya2RJZCxcclxuICAgICAgICBpZFxyXG4gICAgKTtcclxuICAgIGNiKHJlc3VsdCk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnJlbmFtZU91dGZpdCwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKFxyXG4gICAgICAgICdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZW5hbWVPdXRmaXQnLFxyXG4gICAgICAgIGZyYW1ld29ya2RJZCxcclxuICAgICAgICBkYXRhXHJcbiAgICApO1xyXG4gICAgY2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUudXNlT3V0Zml0LCBhc3luYyAob3V0Zml0OiBPdXRmaXQsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ3VzZU91dGZpdCcsIG91dGZpdCk7XHJcbiAgICBzZXRQZWRDbG90aGVzKFBsYXllclBlZElkKCksIG91dGZpdCk7XHJcbiAgICBjYigxKTtcclxufSk7IiwgImltcG9ydCB7IGdldEZyYW1ld29ya0lELCByZXF1ZXN0TG9jYWxlLCBzZW5kTlVJRXZlbnQsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayB9IGZyb20gXCJAdXRpbHNcIlxyXG5pbXBvcnQgeyBzdGFydENhbWVyYSwgc3RvcENhbWVyYSB9IGZyb20gXCIuL2NhbWVyYVwiXHJcbmltcG9ydCB0eXBlIHsgVE1lbnVUeXBlcyB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IHsgT3V0Zml0IH0gZnJvbSBcIkB0eXBpbmdzL291dGZpdHNcIlxyXG5pbXBvcnQgeyBTZW5kIH0gZnJvbSBcIkBldmVudHNcIlxyXG5pbXBvcnQgeyBnZXRBcHBlYXJhbmNlLCBnZXRUYXR0b29EYXRhIH0gZnJvbSBcIi4vYXBwZWFyYW5jZS9nZXR0ZXJzXCJcclxuaW1wb3J0IFwiLi9oYW5kbGVyc1wiXHJcblxyXG5jb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxuXHJcbmxldCBpc09wZW4gPSBmYWxzZVxyXG5sZXQgYXJtb3VyID0gMFxyXG5cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuTWVudSh0eXBlOiBUTWVudVR5cGVzLCBjcmVhdGlvbjogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICBjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpXHJcblxyXG5cclxuXHJcbiAgICBjb25zdCBjb25maWdNZW51cyA9IGNvbmZpZy5tZW51cygpXHJcblxyXG4gICAgY29uc3QgbWVudSA9IGNvbmZpZ01lbnVzW3R5cGVdXHJcblxyXG4gICAgY29uc29sZS5sb2coY29uZmlnTWVudXMsIG1lbnUpXHJcblxyXG4gICAgaWYgKCFtZW51KSByZXR1cm5cclxuXHJcbiAgICBzdGFydENhbWVyYShwZWQpXHJcblxyXG4gICAgY29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKVxyXG5cclxuICAgIGNvbnN0IHRhYnMgPSBtZW51LnRhYnNcclxuXHJcbiAgICBsZXQgYWxsb3dFeGl0ID0gbWVudS5hbGxvd0V4aXRcclxuXHJcbiAgICBhcm1vdXIgPSBHZXRQZWRBcm1vdXIocGVkKVxyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiYXJtb3VyXCIsIGFybW91cilcclxuXHJcbiAgICBsZXQgb3V0Zml0cyA9IFtdXHJcblxyXG4gICAgY29uc3QgaGFzT3V0Zml0VGFiID0gdGFicy5pbmNsdWRlcygnb3V0Zml0cycpXHJcbiAgICBpZiAoaGFzT3V0Zml0VGFiKSB7XHJcbiAgICAgICAgb3V0Zml0cyA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxPdXRmaXRbXT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldE91dGZpdHMnLCBmcmFtZXdvcmtkSWQpIGFzIE91dGZpdFtdIFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBtb2RlbHMgPSBbXVxyXG5cclxuICAgIGNvbnN0IGhhc0hlcml0YWdlVGFiID0gdGFicy5pbmNsdWRlcygnaGVyaXRhZ2UnKVxyXG4gICAgaWYgKGhhc0hlcml0YWdlVGFiKSB7XHJcbiAgICAgICAgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaGFzVGF0dG9vVGFiID0gdGFicy5pbmNsdWRlcygndGF0dG9vcycpXHJcbiAgICBsZXQgdGF0dG9vc1xyXG4gICAgaWYgKGhhc1RhdHRvb1RhYikge1xyXG4gICAgICAgIHRhdHRvb3MgPSBnZXRUYXR0b29EYXRhKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBibGFja2xpc3QgPSBnZXRCbGFja2xpc3QodHlwZSlcclxuXHJcbiAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZShwZWQpXHJcblxyXG4gICAgY29uc29sZS5sb2coXCJhcHBlYXJhbmNlXCIpXHJcblxyXG4gICAgaWYgKGNyZWF0aW9uKSB7XHJcbiAgICAgICAgYWxsb3dFeGl0ID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBzZW5kTlVJRXZlbnQoIFNlbmQuZGF0YSwge1xyXG4gICAgICAgIHRhYnMsXHJcbiAgICAgICAgYXBwZWFyYW5jZSxcclxuICAgICAgICBibGFja2xpc3QsXHJcbiAgICAgICAgdGF0dG9vcyxcclxuICAgICAgICBvdXRmaXRzLFxyXG4gICAgICAgIG1vZGVscyxcclxuICAgICAgICBhbGxvd0V4aXQsXHJcbiAgICAgICAgbG9jYWxlOiBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKVxyXG4gICAgfSlcclxuICAgIGNvbnNvbGUubG9nKCdvcGVuTWVudScsIHR5cGUpXHJcbiAgICBTZXROdWlGb2N1cyh0cnVlLCB0cnVlKVxyXG4gICAgc2VuZE5VSUV2ZW50KFNlbmQudmlzaWJsZSwgdHJ1ZSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QmxhY2tsaXN0KHR5cGU6IFRNZW51VHlwZXMpIHtcclxuICAgIGNvbnN0IGJsYWNrbGlzdCA9IGNvbmZpZy5ibGFja2xpc3QoKVxyXG5cclxuICAgIHJldHVybiBibGFja2xpc3RcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlTWVudSgpIHtcclxuICAgIGNvbnN0IHBlZCA9IFBsYXllclBlZElkKClcclxuXHJcbiAgICBTZXRQZWRBcm1vdXIocGVkLCBhcm1vdXIpXHJcblxyXG4gICAgc3RvcENhbWVyYSgpXHJcbiAgICBTZXROdWlGb2N1cyhmYWxzZSwgZmFsc2UpXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC52aXNpYmxlLCBmYWxzZSlcclxufSIsICJpbXBvcnQgeyBvcGVuTWVudSB9IGZyb20gXCIuL21lbnVcIlxyXG5cclxuUmVnaXN0ZXJDb21tYW5kKCdvcGVuTWVudScsICgpID0+IHtcclxuICAgIG9wZW5NZW51KCdhcHBlYXJhbmNlJykgIFxyXG4gICAgY29uc29sZS5sb2coJ01lbnUgb3BlbmVkJylcclxuICB9LCBmYWxzZSkiXSwKICAibWFwcGluZ3MiOiAiOzs7O0FBU08sSUFBTSxlQUFlLHdCQUFDLFFBQWdCLFNBQWM7QUFDdkQsaUJBQWU7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLEVBQ0osQ0FBQztBQUNMLEdBTDRCO0FBT3JCLElBQU0sUUFBUSx3QkFBQyxPQUFlLElBQUksUUFBUSxTQUFPLFdBQVcsS0FBSyxFQUFFLENBQUMsR0FBdEQ7QUF1Q3JCLElBQU0sZUFBZSx1QkFBdUI7QUFDNUMsSUFBTSxjQUFzQyxDQUFDO0FBQzdDLElBQU0sZUFBeUQsQ0FBQztBQUVoRSxTQUFTLFdBQVcsV0FBbUJBLFFBQXNCO0FBQ3pELE1BQUlBLFVBQVNBLFNBQVEsR0FBRztBQUNwQixVQUFNLGNBQWMsYUFBYTtBQUVqQyxTQUFLLFlBQVksU0FBUyxLQUFLLEtBQUs7QUFBYSxhQUFPO0FBRXhELGdCQUFZLFNBQVMsSUFBSSxjQUFjQTtBQUFBLEVBQzNDO0FBRUEsU0FBTztBQUNYO0FBVlM7QUFZVCxNQUFNLFdBQVcsWUFBWSxJQUFJLENBQUMsUUFBZ0IsU0FBYztBQUM1RCxRQUFNLFVBQVUsYUFBYSxHQUFHO0FBQ2hDLFNBQU8sV0FBVyxRQUFRLEdBQUcsSUFBSTtBQUNyQyxDQUFDO0FBRU0sU0FBUyxzQkFDWixXQUNBQSxXQUNHLE1BQ2M7QUFDakIsTUFBSSxDQUFDLFdBQVcsV0FBV0EsTUFBSyxHQUFHO0FBQy9CO0FBQUEsRUFDSjtBQUVBLE1BQUk7QUFFSixLQUFHO0FBQ0Ms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
