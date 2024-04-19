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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2NsaWVudC91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvY2xpZW50L2NhbWVyYS50cyIsICIuLi8uLi9zcmMvZGF0YS9oZWFkLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2ZhY2UudHMiLCAiLi4vLi4vc3JjL2RhdGEvZHJhd2FibGVzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3RvZ2dsZXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9hcHBlYXJhbmNlL3NldHRlcnMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9oYW5kbGVycy50cyIsICIuLi8uLi9zcmMvY2xpZW50L21lbnUudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgZGVidWdkYXRhID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZGF0YSwgKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXG4vZywgXCJcXFxcblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfSwgMikpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzZW5kTlVJRXZlbnQgPSAoYWN0aW9uOiBzdHJpbmcsIGRhdGE6IGFueSkgPT4ge1xyXG4gICAgU2VuZE5VSU1lc3NhZ2Uoe1xyXG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgIGRhdGE6IGRhdGFcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHJlcXVlc3RNb2RlbCA9IGFzeW5jIChtb2RlbDogc3RyaW5nIHwgbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+ID0+IHtcclxuICAgIGxldCBtb2RlbEhhc2g6IG51bWJlciA9IHR5cGVvZiBtb2RlbCA9PT0gJ251bWJlcicgPyBtb2RlbCA6IEdldEhhc2hLZXkobW9kZWwpXHJcblxyXG4gICAgaWYgKCFJc01vZGVsVmFsaWQobW9kZWxIYXNoKSkge1xyXG4gICAgICAgIGV4cG9ydHMuYmxfYnJpZGdlLm5vdGlmeSgpKHtcclxuICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIG1vZGVsIScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBhdHRlbXB0ZWQgdG8gbG9hZCBpbnZhbGlkIG1vZGVsICcke21vZGVsfSdgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkgcmV0dXJuIG1vZGVsSGFzaFxyXG4gICAgXHJcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcclxuXHJcbiAgICBjb25zdCB3YWl0Rm9yTW9kZWxMb2FkZWQgPSAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhd2FpdCB3YWl0Rm9yTW9kZWxMb2FkZWQoKTtcclxuXHJcbiAgICByZXR1cm4gbW9kZWxIYXNoO1xyXG59O1xyXG5cclxuXHJcbi8vY2FsbGJhY2tcclxuLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL2NsaWVudC9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcbmNvbnN0IGV2ZW50VGltZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZXZlbnRUaW1lcihldmVudE5hbWU6IHN0cmluZywgZGVsYXk6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IEdldEdhbWVUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBldmVudFRpbWVyc1tldmVudE5hbWVdID0gY3VycmVudFRpbWUgKyBkZWxheTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxub25OZXQoYF9fb3hfY2JfJHtyZXNvdXJjZU5hbWV9YCwgKGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnkpID0+IHtcclxuICAgIGNvbnN0IHJlc29sdmUgPSBhY3RpdmVFdmVudHNba2V5XTtcclxuICAgIHJldHVybiByZXNvbHZlICYmIHJlc29sdmUoLi4uYXJncyk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUID0gdW5rbm93bj4oXHJcbiAgICBldmVudE5hbWU6IHN0cmluZywgLi4uYXJnczogYW55XHJcbik6IFByb21pc2U8VD4gfCB2b2lkIHtcclxuICAgIGlmICghZXZlbnRUaW1lcihldmVudE5hbWUsIDApKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBrZXk6IHN0cmluZztcclxuXHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuXHJcbiAgICBlbWl0TmV0KGBfX294X2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vbG9jYWxlXHJcblxyXG5leHBvcnQgY29uc3QgcmVxdWVzdExvY2FsZSA9IChyZXNvdXJjZVNldE5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2hlY2tSZXNvdXJjZUZpbGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChSZXF1ZXN0UmVzb3VyY2VGaWxlU2V0KHJlc291cmNlU2V0TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRMYW4gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UuY29uZmlnKCkubG9jYWxlXHJcbiAgICAgICAgICAgICAgICBsZXQgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS8ke2N1cnJlbnRMYW59Lmpzb25gKTtcclxuICAgICAgICAgICAgICAgIGlmICghbG9jYWxlRmlsZUNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke2N1cnJlbnRMYW59Lmpzb24gbm90IGZvdW5kIGluIGxvY2FsZSwgcGxlYXNlIHZlcmlmeSEsIHdlIHVzZWQgZW5nbGlzaCBmb3Igbm93IWApXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxlRmlsZUNvbnRlbnQgPSBMb2FkUmVzb3VyY2VGaWxlKHJlc291cmNlTmFtZSwgYGxvY2FsZS9lbi5qc29uYClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUobG9jYWxlRmlsZUNvbnRlbnQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChjaGVja1Jlc291cmNlRmlsZSwgMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjaGVja1Jlc291cmNlRmlsZSgpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBsb2NhbGUgPSBhc3luYyAoaWQ6IHN0cmluZywgLi4uYXJnczogc3RyaW5nW10pID0+IHtcclxuICAgIGNvbnN0IGxvY2FsZSA9IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpO1xyXG4gICAgbGV0IGFyZ0luZGV4ID0gMDtcclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSBsb2NhbGVbaWRdLnJlcGxhY2UoLyVzL2csIChtYXRjaDogc3RyaW5nKSA9PiBhcmdJbmRleCA8IGFyZ3MubGVuZ3RoID8gYXJnc1thcmdJbmRleF0gOiBtYXRjaCk7XHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRGcmFtZXdvcmtJRCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGJsX2JyaWRnZSA9IGV4cG9ydHMuYmxfYnJpZGdlXHJcbiAgICBjb25zdCBpZCA9IGJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpLmNpZFxyXG4gICAgY29uc29sZS5sb2coJ2ZyYW1ld29ya2RJZCcsIGlkKVxyXG4gICAgcmV0dXJuIGlkXHJcbn0iLCAiaW1wb3J0IHsgQ2FtZXJhLCBWZWN0b3IzLCBDYW1lcmFCb25lcyB9IGZyb20gJ0B0eXBpbmdzL2NhbWVyYSc7XHJcbmltcG9ydCB7IGRlbGF5IH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgUmVjZWl2ZSB9IGZyb20gJ0BldmVudHMnO1xyXG5cclxubGV0IHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGNhbURpc3RhbmNlOiBudW1iZXIgPSAxLjg7XHJcbmxldCBjYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgYW5nbGVZOiBudW1iZXIgPSAwLjA7XHJcbmxldCBhbmdsZVo6IG51bWJlciA9IDAuMDtcclxubGV0IHRhcmdldENvb3JkczogVmVjdG9yMyB8IG51bGwgPSBudWxsO1xyXG5sZXQgb2xkQ2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGNoYW5naW5nQ2FtOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBsYXN0WDogbnVtYmVyID0gMDtcclxubGV0IGN1cnJlbnRCb25lOiBrZXlvZiBDYW1lcmFCb25lcyA9ICdoZWFkJztcclxubGV0IHBlZDogbnVtYmVyID0gUGxheWVyUGVkSWQoKTtcclxuXHJcbmNvbnN0IENhbWVyYUJvbmVzOiBDYW1lcmFCb25lcyA9IHtcclxuXHRoZWFkOiAzMTA4NixcclxuXHR0b3JzbzogMjQ4MTgsXHJcblx0bGVnczogMTQyMDEsXHJcbn07XHJcblxyXG5jb25zdCBjb3MgPSAoZGVncmVlczogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuXHRyZXR1cm4gTWF0aC5jb3MoKGRlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MCk7XHJcbn07XHJcblxyXG5jb25zdCBzaW4gPSAoZGVncmVlczogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuXHRyZXR1cm4gTWF0aC5zaW4oKGRlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MCk7XHJcbn07XHJcblxyXG5jb25zdCBnZXRBbmdsZXMgPSAoKTogbnVtYmVyW10gPT4ge1xyXG5cdGNvbnN0IHggPVxyXG5cdFx0KChjb3MoYW5nbGVaKSAqIGNvcyhhbmdsZVkpICsgY29zKGFuZ2xlWSkgKiBjb3MoYW5nbGVaKSkgLyAyKSAqXHJcblx0XHRjYW1EaXN0YW5jZTtcclxuXHRjb25zdCB5ID1cclxuXHRcdCgoc2luKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSArIGNvcyhhbmdsZVkpICogc2luKGFuZ2xlWikpIC8gMikgKlxyXG5cdFx0Y2FtRGlzdGFuY2U7XHJcblx0Y29uc3QgeiA9IHNpbihhbmdsZVkpICogY2FtRGlzdGFuY2U7XHJcblxyXG5cdHJldHVybiBbeCwgeSwgel07XHJcbn07XHJcblxyXG5jb25zdCBzZXRDYW1Qb3NpdGlvbiA9IChtb3VzZVg/OiBudW1iZXIsIG1vdXNlWT86IG51bWJlcik6IHZvaWQgPT4ge1xyXG5cdGlmICghcnVubmluZyB8fCAhdGFyZ2V0Q29vcmRzIHx8IGNoYW5naW5nQ2FtKSByZXR1cm47XHJcblxyXG5cdG1vdXNlWCA9IG1vdXNlWCA/PyAwLjA7XHJcblx0bW91c2VZID0gbW91c2VZID8/IDAuMDtcclxuXHJcblx0YW5nbGVaIC09IG1vdXNlWDtcclxuXHRhbmdsZVkgKz0gbW91c2VZO1xyXG5cdGFuZ2xlWSA9IE1hdGgubWluKE1hdGgubWF4KGFuZ2xlWSwgMC4wKSwgODkuMCk7XHJcblxyXG5cdGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpO1xyXG5cclxuXHRTZXRDYW1Db29yZChcclxuXHRcdGNhbSxcclxuXHRcdHRhcmdldENvb3Jkcy54ICsgeCxcclxuXHRcdHRhcmdldENvb3Jkcy55ICsgeSxcclxuXHRcdHRhcmdldENvb3Jkcy56ICsgelxyXG5cdCk7XHJcblx0UG9pbnRDYW1BdENvb3JkKGNhbSwgdGFyZ2V0Q29vcmRzLngsIHRhcmdldENvb3Jkcy55LCB0YXJnZXRDb29yZHMueik7XHJcbn07XHJcblxyXG5jb25zdCBtb3ZlQ2FtZXJhID0gYXN5bmMgKGNvb3JkczogVmVjdG9yMywgZGlzdGFuY2U/OiBudW1iZXIpID0+IHtcclxuXHRjb25zdCBoZWFkaW5nOiBudW1iZXIgPSBHZXRFbnRpdHlIZWFkaW5nKHBlZCkgKyA5NDtcclxuXHRkaXN0YW5jZSA9IGRpc3RhbmNlID8/IDEuMDtcclxuXHJcblx0Y2hhbmdpbmdDYW0gPSB0cnVlO1xyXG5cdGNhbURpc3RhbmNlID0gZGlzdGFuY2U7XHJcblx0YW5nbGVaID0gaGVhZGluZztcclxuXHJcblx0Y29uc3QgW3gsIHksIHpdID0gZ2V0QW5nbGVzKCk7XHJcblxyXG5cdGNvbnN0IG5ld2NhbTogQ2FtZXJhID0gQ3JlYXRlQ2FtV2l0aFBhcmFtcyhcclxuXHRcdCdERUZBVUxUX1NDUklQVEVEX0NBTUVSQScsXHJcblx0XHRjb29yZHMueCArIHgsXHJcblx0XHRjb29yZHMueSArIHksXHJcblx0XHRjb29yZHMueiArIHosXHJcblx0XHQwLjAsXHJcblx0XHQwLjAsXHJcblx0XHQwLjAsXHJcblx0XHQ3MC4wLFxyXG5cdFx0ZmFsc2UsXHJcblx0XHQwXHJcblx0KTtcclxuXHJcblx0dGFyZ2V0Q29vcmRzID0gY29vcmRzO1xyXG5cdGNoYW5naW5nQ2FtID0gZmFsc2U7XHJcblx0b2xkQ2FtID0gY2FtO1xyXG5cdGNhbSA9IG5ld2NhbTtcclxuXHJcblx0UG9pbnRDYW1BdENvb3JkKG5ld2NhbSwgY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMueik7XHJcblx0U2V0Q2FtQWN0aXZlV2l0aEludGVycChuZXdjYW0sIG9sZENhbSwgMjUwLCAwLCAwKTtcclxuXHJcblx0YXdhaXQgZGVsYXkoMjUwKTtcclxuXHJcblx0U2V0Q2FtVXNlU2hhbGxvd0RvZk1vZGUobmV3Y2FtLCB0cnVlKTtcclxuXHRTZXRDYW1OZWFyRG9mKG5ld2NhbSwgMC40KTtcclxuXHRTZXRDYW1GYXJEb2YobmV3Y2FtLCAxLjIpO1xyXG5cdFNldENhbURvZlN0cmVuZ3RoKG5ld2NhbSwgMC4zKTtcclxuXHR1c2VIaURvZihuZXdjYW0pO1xyXG5cclxuXHREZXN0cm95Q2FtKG9sZENhbSwgdHJ1ZSk7XHJcbn07XHJcblxyXG5jb25zdCB1c2VIaURvZiA9IChjdXJyZW50Y2FtOiBDYW1lcmEpID0+IHtcclxuXHRpZiAoIShEb2VzQ2FtRXhpc3QoY2FtKSAmJiBjdXJyZW50Y2FtID09IGNhbSkpIHJldHVybjtcclxuXHRTZXRVc2VIaURvZigpO1xyXG5cdHNldFRpbWVvdXQodXNlSGlEb2YsIDApO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHN0YXJ0Q2FtZXJhID0gYXN5bmMgKHBlZDogbnVtYmVyKSA9PiB7XHJcblx0aWYgKHJ1bm5pbmcpIHJldHVybjtcclxuXHRwZWQgPSBwZWQ7XHJcblx0cnVubmluZyA9IHRydWU7XHJcblx0Y2FtRGlzdGFuY2UgPSAxLjA7XHJcblx0Y2FtID0gQ3JlYXRlQ2FtKCdERUZBVUxUX1NDUklQVEVEX0NBTUVSQScsIHRydWUpO1xyXG5cdGNvbnN0IFt4LCB5LCB6XTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgMzEwODYsIDAuMCwgMC4wLCAwLjApO1xyXG5cdFNldENhbUNvb3JkKGNhbSwgeCwgeSwgeik7XHJcblx0UmVuZGVyU2NyaXB0Q2Ftcyh0cnVlLCB0cnVlLCAxMDAwLCB0cnVlLCB0cnVlKTtcclxuXHRtb3ZlQ2FtZXJhKHsgeDogeCwgeTogeSwgejogeiB9LCBjYW1EaXN0YW5jZSk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc3RvcENhbWVyYSA9ICgpOiB2b2lkID0+IHtcclxuXHRpZiAoIXJ1bm5pbmcpIHJldHVybjtcclxuXHRydW5uaW5nID0gZmFsc2U7XHJcblxyXG5cdFJlbmRlclNjcmlwdENhbXMoZmFsc2UsIHRydWUsIDI1MCwgdHJ1ZSwgZmFsc2UpO1xyXG5cdERlc3Ryb3lDYW0oY2FtLCB0cnVlKTtcclxuXHRjYW0gPSBudWxsO1xyXG5cdHRhcmdldENvb3JkcyA9IG51bGw7XHJcbn07XHJcblxyXG5jb25zdCBzZXRDYW1lcmEgPSAodHlwZT86IGtleW9mIENhbWVyYUJvbmVzKTogdm9pZCA9PiB7XHJcblx0Y29uc3QgYm9uZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gQ2FtZXJhQm9uZXNbdHlwZV07XHJcblx0aWYgKGN1cnJlbnRCb25lID09IHR5cGUpIHJldHVybjtcclxuXHRjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gYm9uZVxyXG5cdFx0PyBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZSwgMC4wLCAwLjAsIGJvbmUgPT09IDE0MjAxID8gMC4yIDogMC4wKVxyXG5cdFx0OiBHZXRFbnRpdHlDb29yZHMocGVkLCBmYWxzZSk7XHJcblxyXG5cdG1vdmVDYW1lcmEoXHJcblx0XHR7XHJcblx0XHRcdHg6IHgsXHJcblx0XHRcdHk6IHksXHJcblx0XHRcdHo6IHogKyAwLjAsXHJcblx0XHR9LFxyXG5cdFx0MS4wXHJcblx0KTtcclxuXHJcblx0Y3VycmVudEJvbmUgPSB0eXBlO1xyXG59O1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbU1vdmUsIChkYXRhLCBjYikgPT4ge1xyXG5cdGNiKDEpO1xyXG5cdGxldCBoZWFkaW5nOiBudW1iZXIgPSBHZXRFbnRpdHlIZWFkaW5nKHBlZCk7XHJcblx0aWYgKGxhc3RYID09IGRhdGEueCkge1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRoZWFkaW5nID0gZGF0YS54ID4gbGFzdFggPyBoZWFkaW5nICsgNSA6IGhlYWRpbmcgLSA1O1xyXG5cdFNldEVudGl0eUhlYWRpbmcocGVkLCBoZWFkaW5nKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuY2FtU2Nyb2xsLCAodHlwZTogbnVtYmVyLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRzd2l0Y2ggKHR5cGUpIHtcclxuXHRcdGNhc2UgMjpcclxuXHRcdFx0c2V0Q2FtZXJhKCk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAxOlxyXG5cdFx0XHRzZXRDYW1lcmEoJ2xlZ3MnKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRjYXNlIDM6XHJcblx0XHRcdHNldENhbWVyYSgnaGVhZCcpO1xyXG5cdFx0XHRicmVhaztcclxuXHR9XHJcblx0Y2IoMSk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLmNhbVpvb20sIChkYXRhLCBjYikgPT4ge1xyXG5cdGlmIChkYXRhID09PSAnZG93bicpIHtcclxuXHRcdGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSArIDAuMDU7XHJcblx0XHRjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlID49IDEuMCA/IDEuMCA6IG5ld0Rpc3RhbmNlO1xyXG5cdH0gZWxzZSBpZiAoZGF0YSA9PT0gJ3VwJykge1xyXG5cdFx0Y29uc3QgbmV3RGlzdGFuY2U6IG51bWJlciA9IGNhbURpc3RhbmNlIC0gMC4wNTtcclxuXHRcdGNhbURpc3RhbmNlID0gbmV3RGlzdGFuY2UgPD0gMC4zNSA/IDAuMzUgOiBuZXdEaXN0YW5jZTtcclxuXHR9XHJcblxyXG5cdGNhbURpc3RhbmNlID0gY2FtRGlzdGFuY2U7XHJcblx0c2V0Q2FtUG9zaXRpb24oKTtcclxuXHRjYigxKTtcclxufSk7XHJcbiIsICJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJCbGVtaXNoZXNcIixcbiAgICBcIkZhY2lhbEhhaXJcIixcbiAgICBcIkV5ZWJyb3dzXCIsXG4gICAgXCJBZ2VpbmdcIixcbiAgICBcIk1ha2V1cFwiLFxuICAgIFwiQmx1c2hcIixcbiAgICBcIkNvbXBsZXhpb25cIixcbiAgICBcIlN1bkRhbWFnZVwiLFxuICAgIFwiTGlwc3RpY2tcIixcbiAgICBcIk1vbGVzRnJlY2tsZXNcIixcbiAgICBcIkNoZXN0SGFpclwiLFxuICAgIFwiQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiQWRkQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiRXllQ29sb3JcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcIk5vc2VfV2lkdGhcIixcbiAgICBcIk5vc2VfUGVha19IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19MZW5naHRcIixcbiAgICBcIk5vc2VfQm9uZV9IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19Mb3dlcmluZ1wiLFxuICAgIFwiTm9zZV9Cb25lX1R3aXN0XCIsXG4gICAgXCJFeWVCcm93bl9IZWlnaHRcIixcbiAgICBcIkV5ZUJyb3duX0ZvcndhcmRcIixcbiAgICBcIkNoZWVrc19Cb25lX0hpZ2hcIixcbiAgICBcIkNoZWVrc19Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGVla3NfV2lkdGhcIixcbiAgICBcIkV5ZXNfT3Blbm5pbmdcIixcbiAgICBcIkxpcHNfVGhpY2tuZXNzXCIsXG4gICAgXCJKYXdfQm9uZV9XaWR0aFwiLFxuICAgIFwiSmF3X0JvbmVfQmFja19MZW5naHRcIixcbiAgICBcIkNoaW5fQm9uZV9Mb3dlcmluZ1wiLFxuICAgIFwiQ2hpbl9Cb25lX0xlbmd0aFwiLFxuICAgIFwiQ2hpbl9Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGluX0hvbGVcIixcbiAgICBcIk5lY2tfVGhpa25lc3NcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImZhY2VcIixcbiAgICBcIm1hc2tzXCIsXG4gICAgXCJoYWlyXCIsXG4gICAgXCJ0b3Jzb3NcIixcbiAgICBcImxlZ3NcIixcbiAgICBcImJhZ3NcIixcbiAgICBcInNob2VzXCIsXG4gICAgXCJuZWNrXCIsXG4gICAgXCJzaGlydHNcIixcbiAgICBcInZlc3RcIixcbiAgICBcImRlY2Fsc1wiLFxuICAgIFwiamFja2V0c1wiXG5dXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiaGF0c1wiLFxuICAgIFwiZ2xhc3Nlc1wiLFxuICAgIFwiZWFycmluZ3NcIixcbiAgICBcIm1vdXRoXCIsXG4gICAgXCJsaGFuZFwiLFxuICAgIFwicmhhbmRcIixcbiAgICBcIndhdGNoZXNcIixcbiAgICBcImJyYWNlbGV0c1wiXG5dXG4iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UsIFRIYWlyRGF0YSwgVEhlYWRPdmVybGF5LCBUSGVhZE92ZXJsYXlUb3RhbCB9IGZyb20gXCJAdHlwaW5ncy9hcHBlYXJhbmNlXCJcclxuaW1wb3J0IEhFQURfT1ZFUkxBWVMgZnJvbSBcIkBkYXRhL2hlYWRcIlxyXG5pbXBvcnQgRkFDRV9GRUFUVVJFUyBmcm9tIFwiQGRhdGEvZmFjZVwiXHJcbmltcG9ydCBEUkFXQUJMRV9OQU1FUyBmcm9tIFwiQGRhdGEvZHJhd2FibGVzXCJcclxuaW1wb3J0IFBST1BfTkFNRVMgZnJvbSBcIkBkYXRhL3Byb3BzXCJcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kTW9kZWxJbmRleCAodGFyZ2V0OiBudW1iZXIpIHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZVxyXG4gICAgY29uc3QgbW9kZWxzID0gY29uZmlnLm1vZGVscygpXHJcbiAgICBcclxuICAgIHJldHVybiBtb2RlbHMuZmluZEluZGV4KChtb2RlbCkgPT4gR2V0SGFzaEtleShtb2RlbCkgID09PSB0YXJnZXQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIYWlyIChwZWQ6IG51bWJlcik6IFRIYWlyRGF0YSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjb2xvcjogR2V0UGVkSGFpckNvbG9yKHBlZCksXHJcbiAgICAgICAgaGlnaGxpZ2h0OiBHZXRQZWRIYWlySGlnaGxpZ2h0Q29sb3IocGVkKVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZEJsZW5kRGF0YShwZWQ6IG51bWJlcikge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBjb25zdCBoZWFkYmxlbmREYXRhID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkdldEhlYWRCbGVuZERhdGEocGVkKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2hhcGVGaXJzdDogaGVhZGJsZW5kRGF0YS5GaXJzdEZhY2VTaGFwZSwgICAvLyBmYXRoZXJcclxuICAgICAgICBzaGFwZVNlY29uZDogaGVhZGJsZW5kRGF0YS5TZWNvbmRGYWNlU2hhcGUsIC8vIG1vdGhlclxyXG4gICAgICAgIHNoYXBlVGhpcmQ6IGhlYWRibGVuZERhdGEuVGhpcmRGYWNlU2hhcGUsXHJcblxyXG4gICAgICAgIHNraW5GaXJzdDogaGVhZGJsZW5kRGF0YS5GaXJzdFNraW5Ub25lLFxyXG4gICAgICAgIHNraW5TZWNvbmQ6IGhlYWRibGVuZERhdGEuU2Vjb25kU2tpblRvbmUsXHJcbiAgICAgICAgc2tpblRoaXJkOiBoZWFkYmxlbmREYXRhLlRoaXJkU2tpblRvbmUsXHJcblxyXG4gICAgICAgIHNoYXBlTWl4OiBoZWFkYmxlbmREYXRhLlBhcmVudEZhY2VTaGFwZVBlcmNlbnQsIC8vIHJlc2VtYmxhbmNlXHJcblxyXG4gICAgICAgIHRoaXJkTWl4OiBoZWFkYmxlbmREYXRhLlBhcmVudFRoaXJkVW5rUGVyY2VudCxcclxuICAgICAgICBza2luTWl4OiBoZWFkYmxlbmREYXRhLlBhcmVudFNraW5Ub25lUGVyY2VudCwgICAvLyBza2lucGVyY2VudFxyXG5cclxuICAgICAgICBoYXNQYXJlbnQ6IGhlYWRibGVuZERhdGEuSXNQYXJlbnRJbmhlcml0YW5jZSxcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkT3ZlcmxheShwZWQ6IG51bWJlcikge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBsZXQgdG90YWxzOiBUSGVhZE92ZXJsYXlUb3RhbCA9IHt9O1xyXG4gICAgbGV0IGhlYWREYXRhOiBUSGVhZE92ZXJsYXkgPSB7fTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEhFQURfT1ZFUkxBWVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gSEVBRF9PVkVSTEFZU1tpXTtcclxuICAgICAgICB0b3RhbHNbb3ZlcmxheV0gPSBHZXROdW1IZWFkT3ZlcmxheVZhbHVlcyhpKTtcclxuXHJcbiAgICAgICAgaWYgKG92ZXJsYXkgPT09IFwiRXllQ29sb3JcIikge1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5VmFsdWU6IEdldFBlZEV5ZUNvbG9yKHBlZClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBbXywgb3ZlcmxheVZhbHVlLCBjb2xvdXJUeXBlLCBmaXJzdENvbG9yLCBzZWNvbmRDb2xvciwgb3ZlcmxheU9wYWNpdHldID0gR2V0UGVkSGVhZE92ZXJsYXlEYXRhKHBlZCwgaSk7XHJcbiAgICAgICAgICAgIGhlYWREYXRhW292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBpbmRleDogaSAtIDEsXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5VmFsdWU6IG92ZXJsYXlWYWx1ZSA9PT0gMjU1ID8gLTEgOiBvdmVybGF5VmFsdWUsXHJcbiAgICAgICAgICAgICAgICBjb2xvdXJUeXBlOiBjb2xvdXJUeXBlLFxyXG4gICAgICAgICAgICAgICAgZmlyc3RDb2xvcjogZmlyc3RDb2xvcixcclxuICAgICAgICAgICAgICAgIHNlY29uZENvbG9yOiBzZWNvbmRDb2xvcixcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlPcGFjaXR5OiBvdmVybGF5T3BhY2l0eVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW2hlYWREYXRhLCB0b3RhbHNdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZFN0cnVjdHVyZShwZWQ6IG51bWJlcikge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBjb25zdCBwZWRNb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZClcclxuXHJcbiAgICBpZiAocGVkTW9kZWwgIT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpICYmIHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKSkgcmV0dXJuXHJcblxyXG4gICAgbGV0IGZhY2VTdHJ1Y3QgPSB7fVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBGQUNFX0ZFQVRVUkVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEZBQ0VfRkVBVFVSRVNbaV1cclxuICAgICAgICBmYWNlU3RydWN0W292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWRGYWNlRmVhdHVyZShwZWQsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWNlU3RydWN0XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXREcmF3YWJsZXMocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgbGV0IGRyYXdhYmxlcyA9IHt9XHJcbiAgICBsZXQgdG90YWxEcmF3YWJsZXMgPSB7fVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRFJBV0FCTEVfTkFNRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gRFJBV0FCTEVfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpKVxyXG5cclxuICAgICAgICB0b3RhbERyYXdhYmxlc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWREcmF3YWJsZVZhcmlhdGlvbnMocGVkLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZXM6IEdldE51bWJlck9mUGVkVGV4dHVyZVZhcmlhdGlvbnMocGVkLCBpLCBjdXJyZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICBkcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFRleHR1cmVWYXJpYXRpb24ocGVkLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW2RyYXdhYmxlcywgdG90YWxEcmF3YWJsZXNdXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9wcyhwZWQ6IG51bWJlcikge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICBsZXQgcHJvcHMgPSB7fVxyXG4gICAgbGV0IHRvdGFsUHJvcHMgPSB7fVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgUFJPUF9OQU1FUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBQUk9QX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZFByb3BJbmRleChwZWQsIGkpXHJcblxyXG4gICAgICAgIHRvdGFsUHJvcHNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkUHJvcERyYXdhYmxlVmFyaWF0aW9ucyhwZWQsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogR2V0TnVtYmVyT2ZQZWRQcm9wVGV4dHVyZVZhcmlhdGlvbnMocGVkLCBpLCBjdXJyZW50KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvcHNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZFByb3BJbmRleChwZWQsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRQcm9wVGV4dHVyZUluZGV4KHBlZCwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtwcm9wcywgdG90YWxQcm9wc11cclxufVxyXG5cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcHBlYXJhbmNlKHBlZDogbnVtYmVyKTogUHJvbWlzZTxUQXBwZWFyYW5jZT4ge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuICAgIGNvbnN0IFtoZWFkRGF0YSwgdG90YWxzXSA9IGdldEhlYWRPdmVybGF5KHBlZClcclxuICAgIGNvbnN0IFtkcmF3YWJsZXMsIGRyYXdUb3RhbF0gPSBnZXREcmF3YWJsZXMocGVkKVxyXG4gICAgY29uc3QgW3Byb3BzLCBwcm9wVG90YWxdID0gZ2V0UHJvcHMocGVkKVxyXG4gICAgY29uc3QgbW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWQpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBtb2RlbEluZGV4OiBmaW5kTW9kZWxJbmRleChtb2RlbCksXHJcbiAgICAgICAgbW9kZWw6IG1vZGVsLFxyXG4gICAgICAgIGhhaXJDb2xvcjogZ2V0SGFpcihwZWQpLFxyXG4gICAgICAgIGhlYWRCbGVuZDogZ2V0SGVhZEJsZW5kRGF0YShwZWQpLFxyXG4gICAgICAgIGhlYWRPdmVybGF5OiBoZWFkRGF0YSBhcyBUSGVhZE92ZXJsYXksXHJcbiAgICAgICAgaGVhZE92ZXJsYXlUb3RhbDogdG90YWxzIGFzIFRIZWFkT3ZlcmxheVRvdGFsLFxyXG4gICAgICAgIGhlYWRTdHJ1Y3R1cmU6IGdldEhlYWRTdHJ1Y3R1cmUocGVkKSxcclxuICAgICAgICBkcmF3YWJsZXM6IGRyYXdhYmxlcyxcclxuICAgICAgICBwcm9wczogcHJvcHMsXHJcbiAgICAgICAgZHJhd1RvdGFsOiBkcmF3VG90YWwsXHJcbiAgICAgICAgcHJvcFRvdGFsOiBwcm9wVG90YWwsXHJcbiAgICAgICAgdGF0dG9vczogW11cclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0QXBwZWFyYW5jZVwiLCBnZXRBcHBlYXJhbmNlKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBlZENsb3RoZXMocGVkOiBudW1iZXIpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgW2RyYXdhYmxlcywgZHJhd1RvdGFsXSA9IGdldERyYXdhYmxlcyhwZWQpXHJcbiAgICBjb25zdCBbcHJvcHMsIHByb3BUb3RhbF0gPSBnZXRQcm9wcyhwZWQpXHJcbiAgICBjb25zdCBbaGVhZERhdGEsIHRvdGFsc10gPSBnZXRIZWFkT3ZlcmxheShwZWQpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEsXHJcbiAgICAgICAgZHJhd2FibGVzOiBkcmF3YWJsZXMsXHJcbiAgICAgICAgcHJvcHM6IHByb3BzLFxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMoXCJHZXRQZWRDbG90aGVzXCIsIGdldFBlZENsb3RoZXMpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVkU2tpbihwZWQ6IG51bWJlcikge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGhlYWRCbGVuZDogZ2V0SGVhZEJsZW5kRGF0YShwZWQpLFxyXG4gICAgICAgIGhlYWRTdHJ1Y3R1cmU6IGdldEhlYWRTdHJ1Y3R1cmUocGVkKSxcclxuICAgICAgICBoYWlyQ29sb3I6IGdldEhhaXIocGVkKSxcclxuICAgICAgICBtb2RlbCA6IEdldEVudGl0eU1vZGVsKHBlZClcclxuICAgIH1cclxufVxyXG5leHBvcnRzKFwiR2V0UGVkU2tpblwiLCBnZXRQZWRTa2luKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhdHRvb0RhdGEoKSB7XHJcbiAgICBsZXQgdGF0dG9vWm9uZXMgPSB7fVxyXG5cclxuICAgIGNvbnN0IFtUQVRUT09fTElTVCwgVEFUVE9PX0NBVEVHT1JJRVNdID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLnRhdHRvb3MoKVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQVRUT09fQ0FURUdPUklFUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gVEFUVE9PX0NBVEVHT1JJRVNbaV1cclxuICAgICAgICBjb25zdCB6b25lID0gY2F0ZWdvcnkuem9uZVxyXG4gICAgICAgIGNvbnN0IGxhYmVsID0gY2F0ZWdvcnkubGFiZWxcclxuICAgICAgICBjb25zdCBpbmRleCA9IGNhdGVnb3J5LmluZGV4XHJcbiAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdID0ge1xyXG4gICAgICAgICAgICB6b25lOiB6b25lLFxyXG4gICAgICAgICAgICBsYWJlbDogbGFiZWwsXHJcbiAgICAgICAgICAgIHpvbmVJbmRleDogaW5kZXgsXHJcbiAgICAgICAgICAgIGRsY3M6IFtdXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IFRBVFRPT19MSVNULmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRsY0RhdGEgPSBUQVRUT09fTElTVFtqXVxyXG4gICAgICAgICAgICB0YXR0b29ab25lc1tpbmRleF0uZGxjcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBkbGNEYXRhLmRsYyxcclxuICAgICAgICAgICAgICAgIGRsY0luZGV4OiBqLFxyXG4gICAgICAgICAgICAgICAgdGF0dG9vczogW11cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaXNGZW1hbGUgPSBHZXRFbnRpdHlNb2RlbChQbGF5ZXJQZWRJZCgpKSA9PT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIilcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFRBVFRPT19MSVNULmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IFRBVFRPT19MSVNUW2ldXHJcbiAgICAgICAgY29uc3QgeyBkbGMsIHRhdHRvb3MgfSA9IGRhdGFcclxuICAgICAgICBjb25zdCBkbGNIYXNoID0gR2V0SGFzaEtleShkbGMpXHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0YXR0b29zLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvb0RhdGEgPSB0YXR0b29zW2pdIFxyXG4gICAgICAgICAgICBsZXQgdGF0dG9vID0gbnVsbFxyXG5cclxuICAgICAgICAgICAgY29uc3QgbG93ZXJUYXR0b28gPSB0YXR0b29EYXRhLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgY29uc3QgaXNGZW1hbGVUYXR0b28gPSBsb3dlclRhdHRvby5pbmNsdWRlcyhcIl9mXCIpXHJcbiAgICAgICAgICAgIGlmIChpc0ZlbWFsZVRhdHRvbyAmJiBpc0ZlbWFsZSkge1xyXG4gICAgICAgICAgICAgICAgdGF0dG9vID0gdGF0dG9vRGF0YVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0ZlbWFsZVRhdHRvbyAmJiAhaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGFcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGhhc2ggPSBudWxsXHJcbiAgICAgICAgICAgIGxldCB6b25lID0gLTFcclxuXHJcbiAgICAgICAgICAgIGlmICh0YXR0b28pIHtcclxuICAgICAgICAgICAgICAgIGhhc2ggPSBHZXRIYXNoS2V5KHRhdHRvbylcclxuICAgICAgICAgICAgICAgIHpvbmUgPSBHZXRQZWREZWNvcmF0aW9uWm9uZUZyb21IYXNoZXMoZGxjSGFzaCwgaGFzaClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHpvbmUgIT09IC0xICYmIGhhc2gpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHpvbmVUYXR0b29zID0gdGF0dG9vWm9uZXNbem9uZV0uZGxjc1tpXS50YXR0b29zXHJcblxyXG4gICAgICAgICAgICAgICAgem9uZVRhdHRvb3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRhdHRvbyxcclxuICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvbmU6IHpvbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgZGxjOiBkbGMsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0YXR0b29ab25lc1xyXG59IiwgIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgaGF0czoge1xyXG4gICAgICAgIHR5cGU6IFwicHJvcFwiLFxyXG4gICAgICAgIGluZGV4OiAwLFxyXG4gICAgfSxcclxuICAgIGdsYXNzZXM6IHtcclxuICAgICAgICB0eXBlOiBcInByb3BcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgIH0sXHJcbiAgICBtYXNrczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogMSxcclxuICAgICAgICBvZmY6IDAsXHJcbiAgICB9LFxyXG4gICAgc2hpcnRzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiA4LFxyXG4gICAgICAgIG9mZjogMTVcclxuICAgIH0sXHJcbiAgICBqYWNrZXRzOiB7XHJcbiAgICAgICAgdHlwZTogXCJkcmF3YWJsZVwiLFxyXG4gICAgICAgIGluZGV4OiAxMSxcclxuICAgICAgICBvZmY6IDE1LFxyXG4gICAgfSxcclxuICAgIGxlZ3M6IHtcclxuICAgICAgICB0eXBlOiBcImRyYXdhYmxlXCIsXHJcbiAgICAgICAgaW5kZXg6IDQsXHJcbiAgICAgICAgb2ZmOiAxMSxcclxuICAgIH0sXHJcbiAgICBzaG9lczoge1xyXG4gICAgICAgIHR5cGU6IFwiZHJhd2FibGVcIixcclxuICAgICAgICBpbmRleDogNixcclxuICAgICAgICBvZmY6IDEzLFxyXG4gICAgfVxyXG59IiwgImltcG9ydCB7IERyYXdhYmxlRGF0YSwgVFZhbHVlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIjtcclxuaW1wb3J0IFRPR0dMRV9JTkRFWEVTIGZyb20gXCJAZGF0YS90b2dnbGVzXCJcclxuaW1wb3J0IHsgY29weUZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldERyYXdhYmxlKHBlZDogbnVtYmVyLCBkYXRhOiBUVmFsdWUpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCAwKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJvcChwZWQ6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIGlmIChkYXRhLnZhbHVlID09PSAtMSkge1xyXG4gICAgICAgIENsZWFyUGVkUHJvcChwZWQsIGRhdGEuaW5kZXgpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgU2V0UGVkUHJvcEluZGV4KHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCBmYWxzZSlcclxufVxyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRNb2RlbChwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuICAgIGNvbnN0IGlzSnVzdE1vZGVsID0gdHlwZW9mIGRhdGEgPT09ICdudW1iZXInXHJcbiAgICBjb25zdCBtb2RlbCA9IGlzSnVzdE1vZGVsID8gZGF0YSA6IGRhdGEubW9kZWxcclxuICAgIGNvbnN0IGlzUGxheWVyID0gSXNQZWRBUGxheWVyKHBlZClcclxuXHJcbiAgICBpZiAoaXNQbGF5ZXIpIHtcclxuICAgICAgICBSZXF1ZXN0TW9kZWwobW9kZWwpXHJcbiAgICAgICAgU2V0UGxheWVyTW9kZWwoUGxheWVySWQoKSwgbW9kZWwpXHJcbiAgICAgICAgU2V0TW9kZWxBc05vTG9uZ2VyTmVlZGVkKG1vZGVsKVxyXG4gICAgICAgIHBlZCA9IFBsYXllclBlZElkKClcclxuICAgIH1cclxuICAgIFNldFBlZERlZmF1bHRDb21wb25lbnRWYXJpYXRpb24ocGVkKVxyXG5cclxuICAgIGlmICghaXNKdXN0TW9kZWwpIHtcclxuICAgICAgICBpZiAoZGF0YS5oZWFkQmxlbmQpIHtcclxuICAgICAgICAgICAgaWYgKCFpc0p1c3RNb2RlbCAmJiBPYmplY3Qua2V5cyhkYXRhLmhlYWRCbGVuZCkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBzZXRIZWFkQmxlbmQocGVkLCBkYXRhLmhlYWRCbGVuZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcGVkXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBTZXRGYWNlRmVhdHVyZShwZWQ6IG51bWJlciwgZGF0YTogVFZhbHVlKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG4gICAgU2V0UGVkRmFjZUZlYXR1cmUocGVkLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlICsgMC4wKVxyXG59XHJcblxyXG5jb25zdCBpc1Bvc2l0aXZlID0gKHZhbDogbnVtYmVyKSA9PiB2YWwgPj0gMCA/IHZhbCA6IDBcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkQmxlbmQocGVkOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3Qgc2hhcGVGaXJzdCA9IGlzUG9zaXRpdmUoZGF0YS5zaGFwZUZpcnN0KVxyXG4gICAgY29uc3Qgc2hhcGVTZWNvbmQgPSBpc1Bvc2l0aXZlKGRhdGEuc2hhcGVTZWNvbmQpXHJcbiAgICBjb25zdCBzaGFwZVRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNoYXBlVGhpcmQpXHJcbiAgICBjb25zdCBza2luRmlyc3QgPSBpc1Bvc2l0aXZlKGRhdGEuc2tpbkZpcnN0KVxyXG4gICAgY29uc3Qgc2tpblNlY29uZCA9IGlzUG9zaXRpdmUoZGF0YS5za2luU2Vjb25kKVxyXG4gICAgY29uc3Qgc2tpblRoaXJkID0gaXNQb3NpdGl2ZShkYXRhLnNraW5UaGlyZClcclxuICAgIGNvbnN0IHNoYXBlTWl4ID0gZGF0YS5zaGFwZU1peCArIDAuMFxyXG4gICAgY29uc3Qgc2tpbk1peCA9IGRhdGEuc2tpbk1peCArIDAuMFxyXG4gICAgY29uc3QgdGhpcmRNaXggPSBkYXRhLnRoaXJkTWl4ICsgMC4wXHJcbiAgICBjb25zdCBoYXNQYXJlbnQgPSBkYXRhLmhhc1BhcmVudFxyXG5cclxuICAgIFNldFBlZEhlYWRCbGVuZERhdGEocGVkLCBzaGFwZUZpcnN0LCBzaGFwZVNlY29uZCwgc2hhcGVUaGlyZCwgc2tpbkZpcnN0LCBza2luU2Vjb25kLCBza2luVGhpcmQsIHNoYXBlTWl4LCBza2luTWl4LFxyXG4gICAgICAgIHRoaXJkTWl4LCBoYXNQYXJlbnQpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIZWFkT3ZlcmxheShwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgcGVkID0gcGVkIHx8IFBsYXllclBlZElkKClcclxuICAgIGNvbnN0IGluZGV4ID0gZGF0YS5pbmRleFxyXG5cclxuICAgIGlmIChpbmRleCA9PT0gMTMpIHtcclxuICAgICAgICBTZXRQZWRFeWVDb2xvcihwZWQsIGRhdGEudmFsdWUpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmFsdWUgPSBkYXRhLm92ZXJsYXlWYWx1ZSA9PT0gLTEgPyAyNTUgOiBkYXRhLm92ZXJsYXlWYWx1ZVxyXG5cclxuICAgIFNldFBlZEhlYWRPdmVybGF5KHBlZCwgaW5kZXgsIHZhbHVlLCBkYXRhLm92ZXJsYXlPcGFjaXR5ICsgMC4wKVxyXG4gICAgU2V0UGVkSGVhZE92ZXJsYXlDb2xvcihwZWQsIGluZGV4LCAxLCBkYXRhLmZpcnN0Q29sb3IsIGRhdGEuc2Vjb25kQ29sb3IpXHJcbn1cclxuXHJcbi8vIGZ1bmN0aW9uIFJlc2V0VG9nZ2xlcyhkYXRhKVxyXG4vLyAgICAgbG9jYWwgcGVkID0gY2FjaGUucGVkXHJcblxyXG4vLyAgICAgbG9jYWwgZHJhd2FibGVzID0gZGF0YS5kcmF3YWJsZXNcclxuLy8gICAgIGxvY2FsIHByb3BzID0gZGF0YS5wcm9wc1xyXG5cclxuLy8gICAgIGZvciB0b2dnbGVJdGVtLCB0b2dnbGVEYXRhIGluIHBhaXJzKFRPR0dMRV9JTkRFWEVTKSBkb1xyXG4vLyAgICAgICAgIGxvY2FsIHRvZ2dsZVR5cGUgPSB0b2dnbGVEYXRhLnR5cGVcclxuLy8gICAgICAgICBsb2NhbCBpbmRleCA9IHRvZ2dsZURhdGEuaW5kZXhcclxuXHJcbi8vICAgICAgICAgaWYgdG9nZ2xlVHlwZSA9PSBcImRyYXdhYmxlXCIgYW5kIGRyYXdhYmxlc1t0b2dnbGVJdGVtXSB0aGVuXHJcbi8vICAgICAgICAgICAgIGxvY2FsIGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpXHJcbi8vICAgICAgICAgICAgIGlmIGN1cnJlbnREcmF3YWJsZSB+PSBkcmF3YWJsZXNbdG9nZ2xlSXRlbV0udmFsdWUgdGhlblxyXG4vLyAgICAgICAgICAgICAgICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaW5kZXgsIGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgMClcclxuLy8gICAgICAgICAgICAgZW5kXHJcbi8vICAgICAgICAgZWxzZWlmIHRvZ2dsZVR5cGUgPT0gXCJwcm9wXCIgYW5kIHByb3BzW3RvZ2dsZUl0ZW1dIHRoZW5cclxuLy8gICAgICAgICAgICAgbG9jYWwgY3VycmVudFByb3AgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleClcclxuLy8gICAgICAgICAgICAgaWYgY3VycmVudFByb3Agfj0gcHJvcHNbdG9nZ2xlSXRlbV0udmFsdWUgdGhlblxyXG4vLyAgICAgICAgICAgICAgICAgU2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgsIHByb3BzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCBmYWxzZSlcclxuLy8gICAgICAgICAgICAgZW5kXHJcbi8vICAgICAgICAgZW5kXHJcbi8vICAgICBlbmRcclxuLy8gZW5kXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRUb2dnbGVzKGRhdGEpIHtcclxuICAgIGNvbnN0IHBlZCA9IFBsYXllclBlZElkKClcclxuICAgIGNvbnN0IGRyYXdhYmxlcyA9IGRhdGEuZHJhd2FibGVzXHJcbiAgICBjb25zdCBwcm9wcyA9IGRhdGEucHJvcHNcclxuXHJcbiAgICBmb3IgKGNvbnN0IFt0b2dnbGVJdGVtLCB0b2dnbGVEYXRhXSBvZiBPYmplY3QuZW50cmllcyhUT0dHTEVfSU5ERVhFUykpIHtcclxuICAgICAgICBjb25zdCB0b2dnbGVUeXBlID0gdG9nZ2xlRGF0YS50eXBlXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0b2dnbGVEYXRhLmluZGV4XHJcblxyXG4gICAgICAgIGlmICh0b2dnbGVUeXBlID09PSBcImRyYXdhYmxlXCIgJiYgZHJhd2FibGVzW3RvZ2dsZUl0ZW1dKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50RHJhd2FibGUgIT09IGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgaW5kZXgsIGRyYXdhYmxlc1t0b2dnbGVJdGVtXS52YWx1ZSwgMCwgMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodG9nZ2xlVHlwZSA9PT0gXCJwcm9wXCIgJiYgcHJvcHNbdG9nZ2xlSXRlbV0pIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFByb3AgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleClcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRQcm9wICE9PSBwcm9wc1t0b2dnbGVJdGVtXS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgU2V0UGVkUHJvcEluZGV4KHBlZCwgaW5kZXgsIHByb3BzW3RvZ2dsZUl0ZW1dLnZhbHVlLCAwLCBmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZENsb3RoZXMocGVkOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgZHJhd2FibGVzID0gZGF0YS5kcmF3YWJsZXNcclxuICAgIGNvbnN0IHByb3BzID0gZGF0YS5wcm9wc1xyXG4gICAgY29uc3QgaGVhZE92ZXJsYXkgPSBkYXRhLmhlYWRPdmVybGF5XHJcbiAgICBjb25zb2xlLmxvZygnZHJhd2FibGVzJywgZHJhd2FibGVzKVxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBkcmF3YWJsZXMpIHtcclxuICAgICAgICBjb25zdCBkcmF3YWJsZSA9IGRyYXdhYmxlc1tpZF1cclxuICAgICAgICBzZXREcmF3YWJsZShwZWQsIGRyYXdhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgaWQgaW4gcHJvcHMpIHtcclxuICAgICAgICBjb25zdCBwcm9wID0gcHJvcHNbaWRdXHJcbiAgICAgICAgc2V0UHJvcChwZWQsIHByb3ApXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBpZCBpbiBoZWFkT3ZlcmxheSkge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBoZWFkT3ZlcmxheVtpZF1cclxuICAgICAgICBzZXRIZWFkT3ZlcmxheShwZWQsIG92ZXJsYXkpXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZWRTa2luKHBlZDogbnVtYmVyLCBkYXRhKSB7XHJcbiAgICBwZWQgPSBwZWQgfHwgUGxheWVyUGVkSWQoKVxyXG4gICAgY29uc3QgaGVhZFN0cnVjdHVyZSA9IGRhdGEuaGVhZFN0cnVjdHVyZVxyXG4gICAgY29uc3QgaGVhZEJsZW5kID0gZGF0YS5oZWFkQmxlbmRcclxuXHJcbiAgICBwZWQgPSBzZXRNb2RlbChwZWQsIGRhdGEpXHJcbiAgICBpZiAoaGVhZEJsZW5kKSB7XHJcbiAgICAgICAgc2V0SGVhZEJsZW5kKHBlZCwgaGVhZEJsZW5kKVxyXG4gICAgfVxyXG4gICAgaWYgKGhlYWRTdHJ1Y3R1cmUpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGZlYXR1cmUgb2YgaGVhZFN0cnVjdHVyZSkge1xyXG4gICAgICAgICAgICBTZXRGYWNlRmVhdHVyZShwZWQsIGZlYXR1cmUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVkVGF0dG9vcyhwZWQ6IG51bWJlciwgZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm5cclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgaXNQbGF5ZXIgPSBJc1BlZEFQbGF5ZXIocGVkKVxyXG4gICAgaWYgKGlzUGxheWVyKSB7XHJcbiAgICAgICAgcGVkID0gUGxheWVyUGVkSWQoKVxyXG4gICAgfVxyXG5cclxuICAgIENsZWFyUGVkRGVjb3JhdGlvbnNMZWF2ZVNjYXJzKHBlZClcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gZGF0YVtpXS50YXR0b29cclxuICAgICAgICBpZiAodGF0dG9vRGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gR2V0SGFzaEtleSh0YXR0b29EYXRhLmRsYylcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vID0gdGF0dG9vRGF0YS5oYXNoXHJcbiAgICAgICAgICAgIEFkZFBlZERlY29yYXRpb25Gcm9tSGFzaGVzKHBlZCwgY29sbGVjdGlvbiwgdGF0dG9vKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZEhhaXJDb2xvcnMocGVkOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIHBlZCA9IHBlZCB8fCBQbGF5ZXJQZWRJZCgpXHJcblxyXG4gICAgY29uc3QgY29sb3IgPSBkYXRhLmNvbG9yXHJcbiAgICBjb25zdCBoaWdobGlnaHQgPSBkYXRhLmhpZ2hsaWdodFxyXG4gICAgU2V0UGVkSGFpckNvbG9yKHBlZCwgY29sb3IsIGhpZ2hsaWdodClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBlZEFwcGVhcmFuY2UocGVkOiBudW1iZXIsIGRhdGEpIHtcclxuICAgIHNldFBlZFNraW4ocGVkLCBkYXRhKVxyXG4gICAgc2V0UGVkQ2xvdGhlcyhwZWQsIGRhdGEpXHJcbiAgICBzZXRQZWRIYWlyQ29sb3JzKHBlZCwgZGF0YS5oYWlyQ29sb3IpXHJcbiAgICBzZXRQZWRUYXR0b29zKHBlZCwgZGF0YS50YXR0b29zKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGxheWVyUGVkQXBwZWFyYW5jZShkYXRhKSB7XHJcbiAgICBzZXRQZWRTa2luKFBsYXllclBlZElkKCksIGRhdGEpXHJcbiAgICBzZXRQZWRDbG90aGVzKFBsYXllclBlZElkKCksIGRhdGEpXHJcbiAgICBzZXRQZWRIYWlyQ29sb3JzKFBsYXllclBlZElkKCksIGRhdGEuaGFpckNvbG9yKVxyXG4gICAgc2V0UGVkVGF0dG9vcyhQbGF5ZXJQZWRJZCgpLCBkYXRhLnRhdHRvb3MpXHJcbn0iLCAiaW1wb3J0IHsgUmVjZWl2ZSB9IGZyb20gJ0BldmVudHMnO1xyXG5pbXBvcnQge1xyXG5cdHJlc2V0VG9nZ2xlcyxcclxuXHRzZXREcmF3YWJsZSxcclxuXHRTZXRGYWNlRmVhdHVyZSxcclxuXHRzZXRIZWFkQmxlbmQsXHJcblx0c2V0TW9kZWwsXHJcblx0c2V0UGVkQ2xvdGhlcyxcclxuXHRzZXRQZWRUYXR0b29zLFxyXG5cdHNldFBsYXllclBlZEFwcGVhcmFuY2UsXHJcblx0c2V0UHJvcCxcclxufSBmcm9tICcuL2FwcGVhcmFuY2Uvc2V0dGVycyc7XHJcbmltcG9ydCB7IGNsb3NlTWVudSB9IGZyb20gJy4vbWVudSc7XHJcbmltcG9ydCB7IFRBcHBlYXJhbmNlLCBUVG9nZ2xlRGF0YSwgVFZhbHVlIH0gZnJvbSAnQHR5cGluZ3MvYXBwZWFyYW5jZSc7XHJcbmltcG9ydCB7IGRlbGF5LCBnZXRGcmFtZXdvcmtJRCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSAnQHV0aWxzJztcclxuaW1wb3J0IHsgZ2V0QXBwZWFyYW5jZSwgZ2V0VGF0dG9vRGF0YSB9IGZyb20gJy4vYXBwZWFyYW5jZS9nZXR0ZXJzJztcclxuaW1wb3J0IFRPR0dMRV9JTkRFWEVTIGZyb20gJ0BkYXRhL3RvZ2dsZXMnO1xyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tICdAdHlwaW5ncy9vdXRmaXRzJztcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5jYW5jZWwsIChhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcblx0c2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKTtcclxuXHRjbG9zZU1lbnUoKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFxyXG5cdFJlY2VpdmUuc2F2ZSxcclxuXHRhc3luYyAoYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdzYXZlJylcclxuXHRcdHJlc2V0VG9nZ2xlcyhhcHBlYXJhbmNlKTtcclxuXHJcblx0XHRhd2FpdCBkZWxheSgxMDApO1xyXG5cclxuXHRcdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblxyXG5cdFx0Y29uc3QgbmV3QXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UocGVkKTtcclxuXHJcblx0XHRjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpO1xyXG5cclxuXHRcdHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayhcclxuXHRcdFx0J2JsX2FwcGVhcmFuY2U6c2VydmVyOnNldEFwcGVhcmFuY2UnLFxyXG5cdFx0XHRmcmFtZXdvcmtkSWQsXHJcblx0XHRcdG5ld0FwcGVhcmFuY2VcclxuXHRcdCk7XHJcblxyXG5cdFx0c2V0UGVkVGF0dG9vcyhwZWQsIGFwcGVhcmFuY2UudGF0dG9vcyk7XHJcblxyXG5cdFx0Y2xvc2VNZW51KCk7XHJcblx0XHRjYigxKTtcclxuXHR9XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0TW9kZWwsIGFzeW5jIChtb2RlbDogc3RyaW5nLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBoYXNoID0gR2V0SGFzaEtleShtb2RlbCk7XHJcblx0aWYgKCFJc01vZGVsSW5DZGltYWdlKGhhc2gpIHx8ICFJc01vZGVsVmFsaWQoaGFzaCkpIHtcclxuXHRcdHJldHVybiBjYigwKTtcclxuXHR9XHJcblxyXG5cdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblxyXG5cdHNldE1vZGVsKHBlZCwgaGFzaCk7XHJcblxyXG5cdGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKHBlZCk7XHJcblxyXG5cdGFwcGVhcmFuY2UudGF0dG9vcyA9IFtdO1xyXG5cclxuXHRjYihhcHBlYXJhbmNlKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuZ2V0TW9kZWxUYXR0b29zLCBhc3luYyAoXzogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCB0YXR0b29zID0gZ2V0VGF0dG9vRGF0YSgpO1xyXG5cclxuXHRjYih0YXR0b29zKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFxyXG5cdFJlY2VpdmUuc2V0SGVhZFN0cnVjdHVyZSxcclxuXHRhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRcdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0XHRTZXRGYWNlRmVhdHVyZShwZWQsIGRhdGEpO1xyXG5cdFx0Y2IoMSk7XHJcblx0fVxyXG4pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhcclxuXHRSZWNlaXZlLnNldEhlYWRPdmVybGF5LFxyXG5cdGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdFx0Y29uc3QgcGVkID0gUGxheWVyUGVkSWQoKTtcclxuXHRcdFNldEZhY2VGZWF0dXJlKHBlZCwgZGF0YSk7XHJcblx0XHRjYigxKTtcclxuXHR9XHJcbik7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFxyXG5cdFJlY2VpdmUuc2V0SGVhZEJsZW5kLFxyXG5cdGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdFx0Y29uc3QgcGVkID0gUGxheWVyUGVkSWQoKTtcclxuXHRcdHNldEhlYWRCbGVuZChwZWQsIGRhdGEpO1xyXG5cdFx0Y2IoMSk7XHJcblx0fVxyXG4pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNldFRhdHRvb3MsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0c2V0UGVkVGF0dG9vcyhwZWQsIGRhdGEpO1xyXG5cdGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5zZXRQcm9wLCBhc3luYyAoZGF0YTogVFZhbHVlLCBjYjogRnVuY3Rpb24pID0+IHtcclxuXHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cdHNldFByb3AocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUuc2V0RHJhd2FibGUsIGFzeW5jIChkYXRhOiBUVmFsdWUsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG5cdGNvbnN0IHBlZCA9IFBsYXllclBlZElkKCk7XHJcblx0c2V0RHJhd2FibGUocGVkLCBkYXRhKTtcclxuXHRjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFxyXG5cdFJlY2VpdmUudG9nZ2xlSXRlbSxcclxuXHRhc3luYyAoZGF0YTogVFRvZ2dsZURhdGEsIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGl0ZW0gPSBUT0dHTEVfSU5ERVhFU1tkYXRhLml0ZW1dO1xyXG5cdFx0aWYgKCFpdGVtKSByZXR1cm4gY2IoZmFsc2UpO1xyXG5cclxuXHRcdGNvbnN0IGN1cnJlbnQgPSBkYXRhLmRhdGE7XHJcblx0XHRjb25zdCB0eXBlID0gaXRlbS50eXBlO1xyXG5cdFx0Y29uc3QgaW5kZXggPSBpdGVtLmluZGV4O1xyXG5cclxuXHRcdGlmICghY3VycmVudCkgcmV0dXJuIGNiKGZhbHNlKTtcclxuXHJcblx0XHRjb25zdCBwZWQgPSBQbGF5ZXJQZWRJZCgpO1xyXG5cclxuXHRcdGlmICh0eXBlID09PSAncHJvcCcpIHtcclxuXHRcdFx0Y29uc3QgY3VycmVudFByb3AgPSBHZXRQZWRQcm9wSW5kZXgocGVkLCBpbmRleCk7XHJcblxyXG5cdFx0XHRpZiAoY3VycmVudFByb3AgPT09IC0xKSB7XHJcblx0XHRcdFx0c2V0UHJvcChwZWQsIGN1cnJlbnQpO1xyXG5cdFx0XHRcdGNiKGZhbHNlKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Q2xlYXJQZWRQcm9wKHBlZCwgaW5kZXgpO1xyXG5cdFx0XHRcdGNiKHRydWUpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmICh0eXBlID09PSAnZHJhd2FibGUnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREcmF3YWJsZSA9IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnQudmFsdWUgPT09IGl0ZW0ub2ZmKSB7XHJcbiAgICAgICAgICAgICAgICBjYihmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50LnZhbHVlID09PSBjdXJyZW50RHJhd2FibGUpIHtcclxuICAgICAgICAgICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGluZGV4LCBpdGVtLm9mZiwgMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjYih0cnVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldERyYXdhYmxlKHBlZCwgY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICBjYihmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblx0fVxyXG4pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhSZWNlaXZlLnNhdmVPdXRmaXQsIGFzeW5jIChkYXRhOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgY29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayhcclxuICAgICAgICAnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZU91dGZpdCcsXHJcbiAgICAgICAgZnJhbWV3b3JrZElkLFxyXG4gICAgICAgIGRhdGFcclxuICAgICk7XHJcbiAgICBjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS5kZWxldGVPdXRmaXQsIGFzeW5jIChpZDogc3RyaW5nLCBjYjogRnVuY3Rpb24pID0+IHtcclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soXHJcbiAgICAgICAgJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmRlbGV0ZU91dGZpdCcsXHJcbiAgICAgICAgZnJhbWV3b3JrZElkLFxyXG4gICAgICAgIGlkXHJcbiAgICApO1xyXG4gICAgY2IocmVzdWx0KTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKFJlY2VpdmUucmVuYW1lT3V0Zml0LCBhc3luYyAoZGF0YTogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKCk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2soXHJcbiAgICAgICAgJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlbmFtZU91dGZpdCcsXHJcbiAgICAgICAgZnJhbWV3b3JrZElkLFxyXG4gICAgICAgIGRhdGFcclxuICAgICk7XHJcbiAgICBjYihyZXN1bHQpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2soUmVjZWl2ZS51c2VPdXRmaXQsIGFzeW5jIChvdXRmaXQ6IE91dGZpdCwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygndXNlT3V0Zml0Jywgb3V0Zml0KTtcclxuICAgIHNldFBlZENsb3RoZXMoUGxheWVyUGVkSWQoKSwgb3V0Zml0KTtcclxuICAgIGNiKDEpO1xyXG59KTsiLCAiaW1wb3J0IHsgZ2V0RnJhbWV3b3JrSUQsIHJlcXVlc3RMb2NhbGUsIHNlbmROVUlFdmVudCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSBcIkB1dGlsc1wiXHJcbmltcG9ydCB7IHN0YXJ0Q2FtZXJhLCBzdG9wQ2FtZXJhIH0gZnJvbSBcIi4vY2FtZXJhXCJcclxuaW1wb3J0IHR5cGUgeyBUTWVudVR5cGVzIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tIFwiQHR5cGluZ3Mvb3V0Zml0c1wiXHJcbmltcG9ydCB7IFNlbmQgfSBmcm9tIFwiQGV2ZW50c1wiXHJcbmltcG9ydCB7IGdldEFwcGVhcmFuY2UsIGdldFRhdHRvb0RhdGEgfSBmcm9tIFwiLi9hcHBlYXJhbmNlL2dldHRlcnNcIlxyXG5pbXBvcnQgXCIuL2hhbmRsZXJzXCJcclxuXHJcbmNvbnN0IGNvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZVxyXG5cclxubGV0IGlzT3BlbiA9IGZhbHNlXHJcbmxldCBhcm1vdXIgPSAwXHJcblxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5NZW51KHR5cGU6IFRNZW51VHlwZXMsIGNyZWF0aW9uOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgIGNvbnN0IHBlZCA9IFBsYXllclBlZElkKClcclxuXHJcblxyXG5cclxuICAgIGNvbnN0IGNvbmZpZ01lbnVzID0gY29uZmlnLm1lbnVzKClcclxuXHJcbiAgICBjb25zdCBtZW51ID0gY29uZmlnTWVudXNbdHlwZV1cclxuXHJcbiAgICBjb25zb2xlLmxvZyhjb25maWdNZW51cywgbWVudSlcclxuXHJcbiAgICBpZiAoIW1lbnUpIHJldHVyblxyXG5cclxuICAgIHN0YXJ0Q2FtZXJhKHBlZClcclxuXHJcbiAgICBjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpXHJcblxyXG4gICAgY29uc3QgdGFicyA9IG1lbnUudGFic1xyXG5cclxuICAgIGxldCBhbGxvd0V4aXQgPSBtZW51LmFsbG93RXhpdFxyXG5cclxuICAgIGFybW91ciA9IEdldFBlZEFybW91cihwZWQpXHJcblxyXG4gICAgY29uc29sZS5sb2coXCJhcm1vdXJcIiwgYXJtb3VyKVxyXG5cclxuICAgIGxldCBvdXRmaXRzID0gW11cclxuXHJcbiAgICBjb25zdCBoYXNPdXRmaXRUYWIgPSB0YWJzLmluY2x1ZGVzKCdvdXRmaXRzJylcclxuICAgIGlmIChoYXNPdXRmaXRUYWIpIHtcclxuICAgICAgICBvdXRmaXRzID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPE91dGZpdFtdPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0T3V0Zml0cycsIGZyYW1ld29ya2RJZCkgYXMgT3V0Zml0W10gXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IG1vZGVscyA9IFtdXHJcblxyXG4gICAgY29uc3QgaGFzSGVyaXRhZ2VUYWIgPSB0YWJzLmluY2x1ZGVzKCdoZXJpdGFnZScpXHJcbiAgICBpZiAoaGFzSGVyaXRhZ2VUYWIpIHtcclxuICAgICAgICBtb2RlbHMgPSBjb25maWcubW9kZWxzKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBoYXNUYXR0b29UYWIgPSB0YWJzLmluY2x1ZGVzKCd0YXR0b29zJylcclxuICAgIGxldCB0YXR0b29zXHJcbiAgICBpZiAoaGFzVGF0dG9vVGFiKSB7XHJcbiAgICAgICAgdGF0dG9vcyA9IGdldFRhdHRvb0RhdGEoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJsYWNrbGlzdCA9IGdldEJsYWNrbGlzdCh0eXBlKVxyXG5cclxuICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKHBlZClcclxuXHJcbiAgICBjb25zb2xlLmxvZyhcImFwcGVhcmFuY2VcIilcclxuXHJcbiAgICBpZiAoY3JlYXRpb24pIHtcclxuICAgICAgICBhbGxvd0V4aXQgPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIHNlbmROVUlFdmVudCggU2VuZC5kYXRhLCB7XHJcbiAgICAgICAgdGFicyxcclxuICAgICAgICBhcHBlYXJhbmNlLFxyXG4gICAgICAgIGJsYWNrbGlzdCxcclxuICAgICAgICB0YXR0b29zLFxyXG4gICAgICAgIG91dGZpdHMsXHJcbiAgICAgICAgbW9kZWxzLFxyXG4gICAgICAgIGFsbG93RXhpdCxcclxuICAgICAgICBsb2NhbGU6IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpXHJcbiAgICB9KVxyXG4gICAgY29uc29sZS5sb2coJ29wZW5NZW51JywgdHlwZSlcclxuICAgIFNldE51aUZvY3VzKHRydWUsIHRydWUpXHJcbiAgICBzZW5kTlVJRXZlbnQoU2VuZC52aXNpYmxlLCB0cnVlKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRCbGFja2xpc3QodHlwZTogVE1lbnVUeXBlcykge1xyXG4gICAgY29uc3QgYmxhY2tsaXN0ID0gY29uZmlnLmJsYWNrbGlzdCgpXHJcblxyXG4gICAgcmV0dXJuIGJsYWNrbGlzdFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VNZW51KCkge1xyXG4gICAgY29uc3QgcGVkID0gUGxheWVyUGVkSWQoKVxyXG5cclxuICAgIFNldFBlZEFybW91cihwZWQsIGFybW91cilcclxuXHJcbiAgICBzdG9wQ2FtZXJhKClcclxuICAgIFNldE51aUZvY3VzKGZhbHNlLCBmYWxzZSlcclxuICAgIHNlbmROVUlFdmVudChTZW5kLnZpc2libGUsIGZhbHNlKVxyXG59IiwgImltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIlxyXG5pbXBvcnQgeyBvcGVuTWVudSB9IGZyb20gXCIuL21lbnVcIlxyXG5pbXBvcnQgeyBzZXRQZWRBcHBlYXJhbmNlLCBzZXRQbGF5ZXJQZWRBcHBlYXJhbmNlIH0gZnJvbSBcIi4vYXBwZWFyYW5jZS9zZXR0ZXJzXCJcclxuaW1wb3J0IHsgZGVsYXksIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayB9IGZyb20gXCJAdXRpbHNcIlxyXG5pbXBvcnQgeyBnZXRBcHBlYXJhbmNlIH0gZnJvbSBcIi4vYXBwZWFyYW5jZS9nZXR0ZXJzXCJcclxuY29uc3QgY29uZmlnID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmNvbmZpZygpXHJcblxyXG5SZWdpc3RlckNvbW1hbmQoJ29wZW5NZW51JywgKCkgPT4ge1xyXG4gICAgb3Blbk1lbnUoJ2FwcGVhcmFuY2UnKSAgXHJcbiAgICBjb25zb2xlLmxvZygnTWVudSBvcGVuZWQnKVxyXG4gIH0sIGZhbHNlKVxyXG5cclxuXHJcbmV4cG9ydHMoJ1NldFBlZEFwcGVhcmFuY2UnLCAocGVkOiBudW1iZXIsIGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlKSA9PiB7XHJcbiAgICBzZXRQZWRBcHBlYXJhbmNlKHBlZCwgYXBwZWFyYW5jZSlcclxufSlcclxuXHJcbmV4cG9ydHMoJ1NldFBsYXllclBlZEFwcGVhcmFuY2UnLCBhc3luYyAoZnJhbWV3b3JrSUQpID0+IHtcclxuICAgIGxldCBhcHBlYXJhbmNlXHJcbiAgICBpZiAgKGNvbmZpZy5iYWNrd2FyZHNDb21wYXRpYmlsaXR5KSB7XHJcbiAgICAgICAgY29uc3Qgb2xkQXBwZWFyYW5jZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOlByZXZpb3VzR2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLnByZXZpb3VzQ2xvdGhpbmcgPT0gJ2lsbGVuaXVtJykge1xyXG4gICAgICAgICAgICBleHBvcnRzWydpbGxlbml1bS1hcHBlYXJhbmNlJ10uc2V0UGVkQXBwZWFyYW5jZShQbGF5ZXJQZWRJZCgpLCBvbGRBcHBlYXJhbmNlKVxyXG4gICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLnByZXZpb3VzQ2xvdGhpbmcgPT0gJ3FiJykge1xyXG4gICAgICAgICAgICBlbWl0KCdxYi1jbG90aGluZzpjbGllbnQ6bG9hZFBsYXllckNsb3RoaW5nJywgb2xkQXBwZWFyYW5jZSwgUGxheWVyUGVkSWQoKSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGF3YWl0IGRlbGF5KDEwMClcclxuXHJcbiAgICAgICAgYXBwZWFyYW5jZSA9IGdldEFwcGVhcmFuY2UoUGxheWVyUGVkSWQoKSlcclxuICAgIH1cclxuXHJcbiAgICBhcHBlYXJhbmNlID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRBcHBlYXJhbmNlPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGZyYW1ld29ya0lEKVxyXG4gICAgc2V0UGxheWVyUGVkQXBwZWFyYW5jZShhcHBlYXJhbmNlKVxyXG59KVxyXG5cclxuZXhwb3J0cygnR2V0UGxheWVyUGVkQXBwZWFyYW5jZScsIGFzeW5jIChmcmFtZXdvcmtJRCkgPT4ge1xyXG4gICAgcmV0dXJuIGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazxUQXBwZWFyYW5jZT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBmcmFtZXdvcmtJRClcclxufSkiXSwKICAibWFwcGluZ3MiOiAiOzs7O0FBU08sSUFBTSxlQUFlLHdCQUFDLFFBQWdCLFNBQWM7QUFDdkQsaUJBQWU7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLEVBQ0osQ0FBQztBQUNMLEdBTDRCO0FBT3JCLElBQU0sUUFBUSx3QkFBQyxPQUFlLElBQUksUUFBUSxTQUFPLFdBQVcsS0FBSyxFQUFFLENB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QUFBLEVBQzVCO0FBRUEsUUFBTSxZQUFZLGFBQWEsSUFBSTtBQUVuQyxRQUFNLGFBQWEsTUFBTSxjQUFjQSxJQUFHO0FBRTFDLFVBQVEsSUFBSSxZQUFZO0FBRXhCLE1BQUksVUFBVTtBQUNWLGdCQUFZO0FBQUEsRUFDaEI7QUFFQSw2Q0FBeUI7QUFBQSxJQUNyQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0EsUUFBUSxNQUFNLGNBQWMsUUFBUTtBQUFBLEVBQ3hDLENBQUM7QUFDRCxVQUFRLElBQUksWUFBWSxJQUFJO0FBQzVCLGNBQVksTUFBTSxJQUFJO0FBQ3RCLG1EQUEyQixJQUFJO0FBQ25DO0FBcEVzQjtBQXNFdEIsU0FBUyxhQUFhLE1BQWtCO0FBQ3BDLFFBQU0sWUFBWSxPQUFPLFVBQVU7QUFFbkMsU0FBTztBQUNYO0FBSlM7QUFNRixTQUFTLFlBQVk7QUFDeEIsUUFBTUEsT0FBTSxZQUFZO0FBRXhCLGVBQWFBLE1BQUssTUFBTTtBQUV4QixhQUFXO0FBQ1gsY0FBWSxPQUFPLEtBQUs7QUFDeEIsbURBQTJCLEtBQUs7QUFDcEM7QUFSZ0I7OztBQ3JGaEIsSUFBTUMsVUFBUyxRQUFRLGNBQWMsT0FBTztBQUU1QyxnQkFBZ0IsWUFBWSxNQUFNO0FBQzlCLFdBQVMsWUFBWTtBQUNyQixVQUFRLElBQUksYUFBYTtBQUMzQixHQUFHLEtBQUs7QUFHVixRQUFRLG9CQUFvQixDQUFDQyxNQUFhLGVBQTRCO0FBQ2xFLG1CQUFpQkEsTUFBSyxVQUFVO0FBQ3BDLENBQUM7QUFFRCxRQUFRLDBCQUEwQixPQUFPLGdCQUFnQjtBQUNyRCxNQUFJO0FBQ0osTUFBS0QsUUFBTyx3QkFBd0I7QUFDaEMsVUFBTSxnQkFBZ0IsTUFBTSxzQkFBbUMsOENBQThDLFdBQVc7QUFFeEgsUUFBSUEsUUFBTyxvQkFBb0IsWUFBWTtBQUN2QyxjQUFRLHFCQUFxQixFQUFFLGlCQUFpQixZQUFZLEdBQUcsYUFBYTtBQUFBLElBQ2hGLFdBQVdBLFFBQU8sb0JBQW9CLE1BQU07QUFDeEMsV0FBSyx5Q0FBeUMsZUFBZSxZQUFZLENBQUM7QUFBQSxJQUM5RTtBQUVBLFVBQU0sTUFBTSxHQUFHO0FBRWYsaUJBQWEsY0FBYyxZQUFZLENBQUM7QUFBQSxFQUM1QztBQUVBLGVBQWEsTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFDdkcseUJBQXVCLFVBQVU7QUFDckMsQ0FBQztBQUVELFFBQVEsMEJBQTBCLE9BQU8sZ0JBQWdCO0FBQ3JELFNBQU8sTUFBTSxzQkFBbUMsc0NBQXNDLFdBQVc7QUFDckcsQ0FBQzsiLAogICJuYW1lcyI6IFsiZGVsYXkiLCAicGVkIiwgImNvbmZpZyIsICJwZWQiLCAicGVkIiwgInBlZCIsICJwZWQiLCAiY29uZmlnIiwgInBlZCJdCn0K
