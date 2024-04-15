var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};

// src/data/head.ts
var head_default;
var init_head = __esm({
  "src/data/head.ts"() {
    head_default = [
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
  }
});

// src/data/face.ts
var face_default;
var init_face = __esm({
  "src/data/face.ts"() {
    face_default = [
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
  }
});

// src/data/drawable.ts
var drawable_default;
var init_drawable = __esm({
  "src/data/drawable.ts"() {
    drawable_default = [
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
  }
});

// src/data/props.ts
var props_default;
var init_props = __esm({
  "src/data/props.ts"() {
    props_default = [
      "hats",
      "glasses",
      "earrings",
      "mouth",
      "lhand",
      "rhand",
      "watches",
      "braclets"
    ];
  }
});

// src/client/utils/index.ts
function eventTimer(eventName, delay2) {
  if (delay2 && delay2 > 0) {
    const currentTime = GetGameTimer();
    if ((eventTimers[eventName] || 0) > currentTime)
      return false;
    eventTimers[eventName] = currentTime + delay2;
  }
  return true;
}
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
var sendNUIEvent, delay, requestModel, resourceName, eventTimers, activeEvents, currentLan, requestLocale;
var init_utils = __esm({
  "src/client/utils/index.ts"() {
    sendNUIEvent = /* @__PURE__ */ __name((action, data) => {
      SendNUIMessage({
        action,
        data
      });
    }, "sendNUIEvent");
    delay = /* @__PURE__ */ __name((ms) => new Promise((res) => setTimeout(res, ms)), "delay");
    requestModel = /* @__PURE__ */ __name(async (model) => {
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
    resourceName = GetCurrentResourceName();
    eventTimers = {};
    activeEvents = {};
    __name(eventTimer, "eventTimer");
    onNet(`__ox_cb_${resourceName}`, (key, ...args) => {
      const resolve = activeEvents[key];
      return resolve && resolve(...args);
    });
    __name(triggerServerCallback, "triggerServerCallback");
    currentLan = "br";
    requestLocale = /* @__PURE__ */ __name((resourceSetName) => {
      return new Promise((resolve) => {
        const checkResourceFile = /* @__PURE__ */ __name(() => {
          if (RequestResourceFileSet(resourceSetName)) {
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
  }
});

// src/client/menu/appearance/index.ts
var findModelIndex, getPedHair, getPedHeadBlendData, getHeadOverlay, getHeadStructure, getDrawables, getProps, appearance_default;
var init_appearance = __esm({
  "src/client/menu/appearance/index.ts"() {
    init_head();
    init_face();
    init_drawable();
    init_props();
    init_menu();
    init_utils();
    findModelIndex = /* @__PURE__ */ __name((model) => exports.bl_appearance.models().findIndex((ped2) => GetHashKey(ped2) === model), "findModelIndex");
    getPedHair = /* @__PURE__ */ __name(() => ({
      color: GetPedHairColor(ped),
      highlight: GetPedHairHighlightColor(ped)
    }), "getPedHair");
    getPedHeadBlendData = /* @__PURE__ */ __name(() => {
      const headblendData = exports.bl_appearance.GetHeadBlendData(ped);
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
    }, "getPedHeadBlendData");
    getHeadOverlay = /* @__PURE__ */ __name(() => {
      let totals = {};
      let headData = {};
      for (let i = 0; i < head_default.length; i++) {
        const overlay = head_default[i];
        totals[overlay] = GetNumHeadOverlayValues(i);
        if (overlay === "EyeColor") {
          headData[overlay] = {
            id: overlay,
            index: i,
            overlayValue: GetPedEyeColor(ped)
          };
        } else {
          const [_, overlayValue, colourType, firstColor, secondColor, overlayOpacity] = GetPedHeadOverlayData(ped, i);
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
    }, "getHeadOverlay");
    getHeadStructure = /* @__PURE__ */ __name(() => {
      const pedModel = GetEntityModel(ped);
      if (pedModel !== GetHashKey("mp_m_freemode_01") && pedModel !== GetHashKey("mp_f_freemode_01"))
        return;
      let faceStruct = {};
      for (let i = 0; i < face_default.length; i++) {
        const overlay = face_default[i];
        faceStruct[overlay] = {
          id: overlay,
          index: i,
          value: GetPedFaceFeature(ped, i)
        };
      }
      return faceStruct;
    }, "getHeadStructure");
    getDrawables = /* @__PURE__ */ __name(() => {
      let drawables = {};
      let totalDrawables = {};
      for (let i = 0; i < drawable_default.length; i++) {
        const name = drawable_default[i];
        const current = GetPedDrawableVariation(ped, i);
        totalDrawables[name] = {
          id: name,
          index: i,
          total: GetNumberOfPedDrawableVariations(ped, i),
          textures: GetNumberOfPedTextureVariations(ped, i, current)
        };
        drawables[name] = {
          id: name,
          index: i,
          value: GetPedDrawableVariation(ped, i),
          texture: GetPedTextureVariation(ped, i)
        };
      }
      return [drawables, totalDrawables];
    }, "getDrawables");
    getProps = /* @__PURE__ */ __name(() => {
      let props = {};
      let totalProps = {};
      for (let i = 0; i < props_default.length; i++) {
        const name = props_default[i];
        const current = GetPedPropIndex(ped, i);
        totalProps[name] = {
          id: name,
          index: i,
          total: GetNumberOfPedPropDrawableVariations(ped, i),
          textures: GetNumberOfPedPropTextureVariations(ped, i, current)
        };
        props[name] = {
          id: name,
          index: i,
          value: GetPedPropIndex(ped, i),
          texture: GetPedPropTextureIndex(ped, i)
        };
      }
      return [props, totalProps];
    }, "getProps");
    appearance_default = /* @__PURE__ */ __name(async (model) => {
      const [headData, totals] = getHeadOverlay();
      const [drawables, drawTotal] = getDrawables();
      const [props, propTotal] = getProps();
      const config = exports.bl_appearance.config();
      return {
        modelIndex: findModelIndex(model),
        model,
        hairColor: getPedHair(),
        headBlend: getPedHeadBlendData(),
        headOverlay: headData,
        headOverlayTotal: totals,
        headStructure: getHeadStructure(),
        drawables,
        props,
        tattoos: await triggerServerCallback("bl_appearance:server:getTattoos", 1, config.useBridge ? exports.bl_bridge.core && exports.bl_bridge.core().getPlayerData().cid : null),
        drawTotal,
        propTotal
      };
    }, "default");
  }
});

// src/client/menu/tattoos/index.ts
var getTattoos, tattoos_default;
var init_tattoos = __esm({
  "src/client/menu/tattoos/index.ts"() {
    init_menu();
    getTattoos = /* @__PURE__ */ __name(() => {
      const [TATTOO_LIST, TATTOO_CATEGORIES] = exports.bl_appearance.tattoos();
      const tattooZones = [];
      for (let i = 0; i < TATTOO_CATEGORIES.length; i++) {
        const category = TATTOO_CATEGORIES[i];
        const index = category.index;
        const zone = category.zone;
        const label = category.label;
        tattooZones[index] = {
          zone,
          label,
          zoneIndex: index,
          dlcs: []
        };
        for (let j = 0; j < TATTOO_LIST.length; j++) {
          const dlcData = TATTOO_LIST[j];
          tattooZones[index].dlcs[j] = {
            label: dlcData.dlc,
            dlcIndex: j,
            tattoos: []
          };
        }
      }
      const isFemale = GetEntityModel(ped) === GetHashKey("mp_f_freemode_01");
      for (let dlcIndex = 0; dlcIndex < TATTOO_LIST.length; dlcIndex++) {
        const data = TATTOO_LIST[dlcIndex];
        const { dlc, tattoos } = data;
        const dlcHash = GetHashKey(dlc);
        const tattooDataList = tattoos || [];
        for (let i = 0; i < tattooDataList.length; i++) {
          const tattooData = tattooDataList[i];
          let tattoo = null;
          const lowerTattoo = tattooData.toLowerCase();
          const isFemaleTattoo = lowerTattoo.includes("_f");
          if (isFemaleTattoo && isFemale) {
            tattoo = tattooData;
          } else if (!isFemaleTattoo && !isFemale) {
            tattoo = tattooData;
          }
          if (tattoo) {
            const hash = GetHashKey(tattoo);
            const zone = GetPedDecorationZoneFromHashes(dlcHash, hash);
            if (zone !== -1 && hash) {
              const zoneTattoos = tattooZones[zone].dlcs[dlcIndex].tattoos;
              zoneTattoos.push({
                label: tattoo,
                hash,
                zone,
                dlc
              });
            }
          }
        }
      }
      return tattooZones;
    }, "getTattoos");
    tattoos_default = getTattoos;
  }
});

// src/data/menuTypes.ts
var menuTypes_default;
var init_menuTypes = __esm({
  "src/data/menuTypes.ts"() {
    menuTypes_default = ["heritage", "hair", "clothes", "accessories", "face", "makeup", "outfits", "tattoos"];
  }
});

// src/client/enums.ts
var appearance;
var init_enums = __esm({
  "src/client/enums.ts"() {
    appearance = /* @__PURE__ */ ((appearance2) => {
      appearance2["setModel"] = "appearance:setModel";
      appearance2["setHeadStructure"] = "appearance:setHeadStructure";
      appearance2["setHeadOverlay"] = "appearance:setHeadOverlay";
      appearance2["setHeadBlend"] = "appearance:setHeadBlend";
      appearance2["setProp"] = "appearance:setProp";
      appearance2["setDrawable"] = "appearance:setDrawable";
      appearance2["setTattoos"] = "appearance:setTattoos";
      appearance2["getModelTattoos"] = "appearance:getModelTattoos";
      return appearance2;
    })(appearance || {});
  }
});

// src/client/camera/index.ts
var running, camDistance, cam, angleY, angleZ, targetCoords, oldCam, changingCam, lastX, currentBone, CameraBones, cos, sin, getAngles, setCamPosition, moveCamera, useHiDof, startCamera, stopCamera, setCamera;
var init_camera = __esm({
  "src/client/camera/index.ts"() {
    init_menu();
    init_utils();
    init_enums();
    running = false;
    camDistance = 1.8;
    cam = null;
    angleY = 0;
    angleZ = 0;
    targetCoords = null;
    oldCam = null;
    changingCam = false;
    lastX = 0;
    currentBone = "head";
    CameraBones = {
      head: 31086,
      torso: 24818,
      legs: 14201
    };
    cos = /* @__PURE__ */ __name((degrees) => {
      return Math.cos(degrees * Math.PI / 180);
    }, "cos");
    sin = /* @__PURE__ */ __name((degrees) => {
      return Math.sin(degrees * Math.PI / 180);
    }, "sin");
    getAngles = /* @__PURE__ */ __name(() => {
      const x = (cos(angleZ) * cos(angleY) + cos(angleY) * cos(angleZ)) / 2 * camDistance;
      const y = (sin(angleZ) * cos(angleY) + cos(angleY) * sin(angleZ)) / 2 * camDistance;
      const z = sin(angleY) * camDistance;
      return [x, y, z];
    }, "getAngles");
    setCamPosition = /* @__PURE__ */ __name((mouseX, mouseY) => {
      if (!running || !targetCoords || changingCam)
        return;
      mouseX = mouseX ?? 0;
      mouseY = mouseY ?? 0;
      angleZ -= mouseX;
      angleY += mouseY;
      angleY = Math.min(Math.max(angleY, 0), 89);
      const [x, y, z] = getAngles();
      SetCamCoord(cam, targetCoords.x + x, targetCoords.y + y, targetCoords.z + z);
      PointCamAtCoord(cam, targetCoords.x, targetCoords.y, targetCoords.z);
    }, "setCamPosition");
    moveCamera = /* @__PURE__ */ __name(async (coords, distance) => {
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
    useHiDof = /* @__PURE__ */ __name((currentcam) => {
      if (!(DoesCamExist(cam) && currentcam == cam))
        return;
      SetUseHiDof();
      setTimeout(useHiDof, 0);
    }, "useHiDof");
    startCamera = /* @__PURE__ */ __name(async () => {
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
    stopCamera = /* @__PURE__ */ __name(() => {
      if (!running)
        return;
      running = false;
      RenderScriptCams(false, true, 250, true, false);
      DestroyCam(cam, true);
      cam = null;
      targetCoords = null;
    }, "stopCamera");
    setCamera = /* @__PURE__ */ __name((type) => {
      const bone = CameraBones[type];
      if (currentBone == type)
        return;
      const [x, y, z] = bone ? GetPedBoneCoords(ped, bone, 0, 0, bone === 14201 ? 0.2 : 0) : GetEntityCoords(ped, false);
      moveCamera({
        x,
        y,
        z: z + 0
      }, 1);
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
  }
});

// src/client/menu/index.ts
var playerAppearance, bl_appearance, isMenuOpen, ped, updatePed, validMenuTypes, openMenu, resetAppearance, closeMenu;
var init_menu = __esm({
  "src/client/menu/index.ts"() {
    init_appearance();
    init_tattoos();
    init_menuTypes();
    init_enums();
    init_utils();
    init_camera();
    playerAppearance = null;
    bl_appearance = exports.bl_appearance;
    isMenuOpen = false;
    ped = 0;
    updatePed = /* @__PURE__ */ __name(() => {
      if (!isMenuOpen)
        return;
      ped = PlayerPedId();
      setTimeout(updatePed, 100);
    }, "updatePed");
    validMenuTypes = /* @__PURE__ */ __name((type) => {
      for (let i = 0; i < type.length; i++) {
        if (!menuTypes_default.includes(type[i])) {
          return false;
        }
      }
      return true;
    }, "validMenuTypes");
    openMenu = /* @__PURE__ */ __name(async (type) => {
      isMenuOpen = true;
      updatePed();
      await delay(150);
      startCamera();
      sendNUIEvent("appearance:visible" /* visible */, true);
      SetNuiFocus(true, true);
      const isArray = typeof type !== "string";
      if (isArray && !validMenuTypes(type)) {
        return console.error("Error: menu type not found");
      }
      const appearance2 = await appearance_default(GetEntityModel(ped));
      playerAppearance = appearance2;
      sendNUIEvent("appearance:data" /* data */, {
        tabs: isArray ? type : menuTypes_default.includes(type) ? type : menuTypes_default,
        appearance: appearance2,
        blacklist: bl_appearance.blacklist(),
        tattoos: tattoos_default(),
        outfits: [],
        models: bl_appearance.models(),
        locale: await requestLocale("locale")
      });
    }, "openMenu");
    resetAppearance = /* @__PURE__ */ __name(async () => {
      const model = playerAppearance.model;
      const modelHash = await requestModel(model);
      console.log(modelHash);
      SetPlayerModel(PlayerId(), modelHash);
      await delay(150);
      SetModelAsNoLongerNeeded(modelHash);
      SetPedDefaultComponentVariation(ped);
      if (model === GetHashKey("mp_m_freemode_01"))
        SetPedHeadBlendData(ped, 0, 0, 0, 0, 0, 0, 0, 0, 0, false);
      else if (model === GetHashKey("mp_f_freemode_01"))
        SetPedHeadBlendData(ped, 45, 21, 0, 20, 15, 0, 0.3, 0.1, 0, false);
      const headBlend = playerAppearance.headBlend;
      if (headBlend)
        SetPedHeadBlendData(ped, headBlend.shapeFirst, headBlend.shapeSecond, headBlend.shapeThird, headBlend.skinFirst, headBlend.skinSecond, headBlend.skinThird, headBlend.shapeMix, headBlend.skinMix, headBlend.thirdMix, headBlend.hasParent);
      if (playerAppearance.headStructure)
        for (const data of Object.values(playerAppearance.headStructure)) {
          SetPedFaceFeature(ped, data.index, data.value);
        }
      if (playerAppearance.drawables)
        for (const data of Object.values(playerAppearance.drawables)) {
          SetPedComponentVariation(ped, data.index, data.value, data.texture, 0);
        }
      if (playerAppearance.props)
        for (const data of Object.values(playerAppearance.props)) {
          if (data.value === -1) {
            ClearPedProp(ped, data.index);
            return 1;
          }
          SetPedPropIndex(ped, data.index, data.value, data.texture, false);
        }
      if (playerAppearance.hairColor) {
        SetPedHairColor(ped, playerAppearance.hairColor.color, playerAppearance.hairColor.highlight);
      }
      if (playerAppearance.headOverlay)
        for (const data of Object.values(playerAppearance.headOverlay)) {
          const value = data.overlayValue == -1 ? 255 : data.overlayValue;
          if (data.id === "EyeColor")
            SetPedEyeColor(ped, value);
          else {
            SetPedHeadOverlay(ped, data.index, value, data.overlayOpacity);
            SetPedHeadOverlayColor(ped, data.index, 1, data.firstColor, data.secondColor);
          }
        }
      if (playerAppearance.tattoos) {
        ClearPedDecorationsLeaveScars(ped);
        for (const element of playerAppearance.tattoos) {
          const tattoo = element.tattoo;
          if (tattoo) {
            AddPedDecorationFromHashes(ped, GetHashKey(tattoo.dlc), tattoo.hash);
          }
        }
      }
    }, "resetAppearance");
    closeMenu = /* @__PURE__ */ __name(async (save) => {
      if (!save)
        resetAppearance();
      else {
        const config = exports.bl_appearance.config();
        const appearance2 = await appearance_default(GetEntityModel(ped));
        emitNet("bl_appearance:server:saveAppearances", {
          id: config.useBridge ? exports.bl_bridge.core && exports.bl_bridge.core().getPlayerData().cid : null,
          skin: {
            headBlend: appearance2.headBlend,
            headStructure: appearance2.headStructure,
            headOverlay: appearance2.headOverlay,
            hairColor: appearance2.hairColor,
            model: appearance2.model
          },
          clothes: {
            drawables: appearance2.drawables,
            props: appearance2.props,
            headOverlay: appearance2.headOverlay
          },
          tattoos: playerAppearance.currentTattoos || [],
          outfits: []
        });
      }
      stopCamera();
      isMenuOpen = false;
      SetNuiFocus(false, false);
      sendNUIEvent("appearance:visible" /* visible */, false);
    }, "closeMenu");
    RegisterNuiCallback("appearance:close" /* close */, (save, cb) => {
      cb(1);
      closeMenu(save);
    });
  }
});

// src/client/menu/appearance/handler.ts
var handler_exports = {};
var actionHandlers;
var init_handler = __esm({
  "src/client/menu/appearance/handler.ts"() {
    init_enums();
    init_utils();
    init_appearance();
    init_menu();
    actionHandlers = {
      ["appearance:setModel" /* setModel */]: async (model) => {
        const modelHash = await requestModel(model);
        SetPlayerModel(PlayerId(), modelHash);
        await delay(150);
        SetModelAsNoLongerNeeded(modelHash);
        SetPedDefaultComponentVariation(ped);
        if (model === "mp_m_freemode_01")
          SetPedHeadBlendData(ped, 0, 0, 0, 0, 0, 0, 0, 0, 0, false);
        else if (model === "mp_f_freemode_01")
          SetPedHeadBlendData(ped, 45, 21, 0, 20, 15, 0, 0.3, 0.1, 0, false);
        return appearance_default(modelHash);
      },
      ["appearance:setHeadStructure" /* setHeadStructure */]: (data) => {
        SetPedFaceFeature(ped, data.index, data.value);
        return data;
      },
      ["appearance:setHeadOverlay" /* setHeadOverlay */]: (data) => {
        const value = data.overlayValue == -1 ? 255 : data.overlayValue;
        if (data.id === "EyeColor")
          SetPedEyeColor(ped, data.eyeColor);
        else if (data.id === "hairColor")
          SetPedHairColor(ped, data.hairColor, data.hairHighlight);
        else {
          SetPedHeadOverlay(ped, data.index, value, data.overlayOpacity);
          SetPedHeadOverlayColor(ped, data.index, 1, data.firstColor, data.secondColor);
        }
        return 1;
      },
      ["appearance:setHeadBlend" /* setHeadBlend */]: (data) => {
        SetPedHeadBlendData(
          ped,
          data.shapeFirst,
          data.shapeSecond,
          data.shapeThird,
          data.skinFirst,
          data.skinSecond,
          data.skinThird,
          data.shapeMix,
          data.skinMix,
          data.thirdMix,
          data.hasParent
        );
        return 1;
      },
      ["appearance:setProp" /* setProp */]: (data) => {
        if (data.value === -1) {
          ClearPedProp(ped, data.index);
          return 1;
        }
        SetPedPropIndex(ped, data.index, data.value, data.texture, false);
        return data.isTexture ? 1 : GetNumberOfPedPropTextureVariations(ped, data.index, data.value);
      },
      ["appearance:setDrawable" /* setDrawable */]: (data) => {
        SetPedComponentVariation(ped, data.index, data.value, data.texture, 0);
        return data.isTexture ? 1 : GetNumberOfPedTextureVariations(ped, data.index, data.value) - 1;
      },
      ["appearance:setTattoos" /* setTattoos */]: (data) => {
        if (!data)
          return 1;
        playerAppearance.currentTattoos = data;
        ClearPedDecorationsLeaveScars(ped);
        for (const element of data) {
          const tattoo = element.tattoo;
          if (tattoo) {
            AddPedDecorationFromHashes(ped, GetHashKey(tattoo.dlc), tattoo.hash);
          }
        }
        return 1;
      },
      ["appearance:getModelTattoos" /* getModelTattoos */]: (data) => {
        return data;
      }
    };
    for (const action of Object.values(appearance)) {
      RegisterNuiCallback(action, async (data, cb) => {
        const handler = actionHandlers[action];
        if (!handler)
          return;
        cb(await handler(data));
      });
    }
  }
});

// src/client/init.ts
init_menu();
init_utils();
Promise.resolve().then(() => init_handler());
RegisterCommand("openMenu", () => {
  openMenu("all");
}, false);
setTimeout(async () => {
  const args = [1, null, 3, null, null, 6];
  const response = await triggerServerCallback("test:server", 1, args);
  if (!response)
    return;
}, 100);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2RhdGEvaGVhZC50cyIsICIuLi8uLi9zcmMvZGF0YS9mYWNlLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2RyYXdhYmxlLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvdXRpbHMvaW5kZXgudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9tZW51L2FwcGVhcmFuY2UvaW5kZXgudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9tZW51L3RhdHRvb3MvaW5kZXgudHMiLCAiLi4vLi4vc3JjL2RhdGEvbWVudVR5cGVzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvZW51bXMudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9jYW1lcmEvaW5kZXgudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9tZW51L2luZGV4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvbWVudS9hcHBlYXJhbmNlL2hhbmRsZXIudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCBbXHJcbiAgICBcIkJsZW1pc2hlc1wiLFxyXG4gICAgXCJGYWNpYWxIYWlyXCIsXHJcbiAgICBcIkV5ZWJyb3dzXCIsXHJcbiAgICBcIkFnZWluZ1wiLFxyXG4gICAgXCJNYWtldXBcIixcclxuICAgIFwiQmx1c2hcIixcclxuICAgIFwiQ29tcGxleGlvblwiLFxyXG4gICAgXCJTdW5EYW1hZ2VcIixcclxuICAgIFwiTGlwc3RpY2tcIixcclxuICAgIFwiTW9sZXNGcmVja2xlc1wiLFxyXG4gICAgXCJDaGVzdEhhaXJcIixcclxuICAgIFwiQm9keUJsZW1pc2hlc1wiLFxyXG4gICAgXCJBZGRCb2R5QmxlbWlzaGVzXCIsXHJcbiAgICBcIkV5ZUNvbG9yXCJcclxuXVxyXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xyXG4gICAgXCJOb3NlX1dpZHRoXCIsXHJcbiAgICBcIk5vc2VfUGVha19IZWlnaHRcIixcclxuICAgIFwiTm9zZV9QZWFrX0xlbmdodFwiLFxyXG4gICAgXCJOb3NlX0JvbmVfSGVpZ2h0XCIsXHJcbiAgICBcIk5vc2VfUGVha19Mb3dlcmluZ1wiLFxyXG4gICAgXCJOb3NlX0JvbmVfVHdpc3RcIixcclxuICAgIFwiRXllQnJvd25fSGVpZ2h0XCIsXHJcbiAgICBcIkV5ZUJyb3duX0ZvcndhcmRcIixcclxuICAgIFwiQ2hlZWtzX0JvbmVfSGlnaFwiLFxyXG4gICAgXCJDaGVla3NfQm9uZV9XaWR0aFwiLFxyXG4gICAgXCJDaGVla3NfV2lkdGhcIixcclxuICAgIFwiRXllc19PcGVubmluZ1wiLFxyXG4gICAgXCJMaXBzX1RoaWNrbmVzc1wiLFxyXG4gICAgXCJKYXdfQm9uZV9XaWR0aFwiLFxyXG4gICAgXCJKYXdfQm9uZV9CYWNrX0xlbmdodFwiLFxyXG4gICAgXCJDaGluX0JvbmVfTG93ZXJpbmdcIixcclxuICAgIFwiQ2hpbl9Cb25lX0xlbmd0aFwiLFxyXG4gICAgXCJDaGluX0JvbmVfV2lkdGhcIixcclxuICAgIFwiQ2hpbl9Ib2xlXCIsXHJcbiAgICBcIk5lY2tfVGhpa25lc3NcIlxyXG5dXHJcbiIsICJleHBvcnQgZGVmYXVsdCBbXHJcbiAgICBcImZhY2VcIixcclxuICAgIFwibWFza3NcIixcclxuICAgIFwiaGFpclwiLFxyXG4gICAgXCJ0b3Jzb3NcIixcclxuICAgIFwibGVnc1wiLFxyXG4gICAgXCJiYWdzXCIsXHJcbiAgICBcInNob2VzXCIsXHJcbiAgICBcIm5lY2tcIixcclxuICAgIFwic2hpcnRzXCIsXHJcbiAgICBcInZlc3RcIixcclxuICAgIFwiZGVjYWxzXCIsXHJcbiAgICBcImphY2tldHNcIlxyXG5dXHJcbiIsICJleHBvcnQgZGVmYXVsdCBbXHJcbiAgICBcImhhdHNcIixcclxuICAgIFwiZ2xhc3Nlc1wiLFxyXG4gICAgXCJlYXJyaW5nc1wiLFxyXG4gICAgXCJtb3V0aFwiLFxyXG4gICAgXCJsaGFuZFwiLFxyXG4gICAgXCJyaGFuZFwiLFxyXG4gICAgXCJ3YXRjaGVzXCIsXHJcbiAgICBcImJyYWNsZXRzXCJcclxuXVxyXG4iLCAiZXhwb3J0IGNvbnN0IGRlYnVnZGF0YSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGEsIChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0sIDIpKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2VuZE5VSUV2ZW50ID0gKGFjdGlvbjogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcclxuICAgIFNlbmROVUlNZXNzYWdlKHtcclxuICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TW9kZWwgPSBhc3luYyAobW9kZWw6IHN0cmluZyB8IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiA9PiB7XHJcbiAgICBsZXQgbW9kZWxIYXNoOiBudW1iZXIgPSB0eXBlb2YgbW9kZWwgPT09ICdudW1iZXInID8gbW9kZWwgOiBHZXRIYXNoS2V5KG1vZGVsKVxyXG5cclxuICAgIGlmICghSXNNb2RlbFZhbGlkKG1vZGVsSGFzaCkpIHtcclxuICAgICAgICBleHBvcnRzLmJsX2JyaWRnZS5ub3RpZnkoKSh7XHJcbiAgICAgICAgICAgIHRpdGxlOiAnSW52YWxpZCBtb2RlbCEnLFxyXG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgICBkdXJhdGlvbjogMTAwMFxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgYXR0ZW1wdGVkIHRvIGxvYWQgaW52YWxpZCBtb2RlbCAnJHttb2RlbH0nYCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKEhhc01vZGVsTG9hZGVkKG1vZGVsSGFzaCkpIHJldHVybiBtb2RlbEhhc2hcclxuICAgIFxyXG4gICAgUmVxdWVzdE1vZGVsKG1vZGVsSGFzaCk7XHJcblxyXG4gICAgY29uc3Qgd2FpdEZvck1vZGVsTG9hZGVkID0gKCk6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgYXdhaXQgd2FpdEZvck1vZGVsTG9hZGVkKCk7XHJcblxyXG4gICAgcmV0dXJuIG1vZGVsSGFzaDtcclxufTtcclxuXHJcblxyXG4vL2NhbGxiYWNrXHJcbi8vaHR0cHM6Ly9naXRodWIuY29tL292ZXJleHRlbmRlZC9veF9saWIvYmxvYi9tYXN0ZXIvcGFja2FnZS9jbGllbnQvcmVzb3VyY2UvY2FsbGJhY2svaW5kZXgudHNcclxuXHJcbmNvbnN0IHJlc291cmNlTmFtZSA9IEdldEN1cnJlbnRSZXNvdXJjZU5hbWUoKVxyXG5jb25zdCBldmVudFRpbWVyczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xyXG5jb25zdCBhY3RpdmVFdmVudHM6IFJlY29yZDxzdHJpbmcsICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4gPSB7fTtcclxuXHJcbmZ1bmN0aW9uIGV2ZW50VGltZXIoZXZlbnROYW1lOiBzdHJpbmcsIGRlbGF5OiBudW1iZXIgfCBudWxsKSB7XHJcbiAgICBpZiAoZGVsYXkgJiYgZGVsYXkgPiAwKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBHZXRHYW1lVGltZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKChldmVudFRpbWVyc1tldmVudE5hbWVdIHx8IDApID4gY3VycmVudFRpbWUpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgZXZlbnRUaW1lcnNbZXZlbnROYW1lXSA9IGN1cnJlbnRUaW1lICsgZGVsYXk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbm9uTmV0KGBfX294X2NiXyR7cmVzb3VyY2VOYW1lfWAsIChrZXk6IHN0cmluZywgLi4uYXJnczogYW55KSA9PiB7XHJcbiAgICBjb25zdCByZXNvbHZlID0gYWN0aXZlRXZlbnRzW2tleV07XHJcbiAgICByZXR1cm4gcmVzb2x2ZSAmJiByZXNvbHZlKC4uLmFyZ3MpO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VCA9IHVua25vd24+KFxyXG4gICAgZXZlbnROYW1lOiBzdHJpbmcsXHJcbiAgICBkZWxheTogbnVtYmVyIHwgbnVsbCxcclxuICAgIC4uLmFyZ3M6IGFueVxyXG4pOiBQcm9taXNlPFQ+IHwgdm9pZCB7XHJcbiAgICBpZiAoIWV2ZW50VGltZXIoZXZlbnROYW1lLCBkZWxheSkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGtleTogc3RyaW5nO1xyXG5cclxuICAgIGRvIHtcclxuICAgICAgICBrZXkgPSBgJHtldmVudE5hbWV9OiR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDEwMDAwMCArIDEpKX1gO1xyXG4gICAgfSB3aGlsZSAoYWN0aXZlRXZlbnRzW2tleV0pO1xyXG5cclxuICAgIGVtaXROZXQoYF9fb3hfY2JfJHtldmVudE5hbWV9YCwgcmVzb3VyY2VOYW1lLCBrZXksIC4uLmFyZ3MpO1xyXG5cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGFjdGl2ZUV2ZW50c1trZXldID0gcmVzb2x2ZTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuLy9sb2NhbGVcclxuY29uc3QgY3VycmVudExhbiA9ICdicidcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TG9jYWxlID0gKHJlc291cmNlU2V0TmFtZTogc3RyaW5nKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICBjb25zdCBjaGVja1Jlc291cmNlRmlsZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKFJlcXVlc3RSZXNvdXJjZUZpbGVTZXQocmVzb3VyY2VTZXROYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvJHtjdXJyZW50TGFufS5qc29uYCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsZUZpbGVDb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtjdXJyZW50TGFufS5qc29uIG5vdCBmb3VuZCBpbiBsb2NhbGUsIHBsZWFzZSB2ZXJpZnkhLCB3ZSB1c2VkIGVuZ2xpc2ggZm9yIG5vdyFgKVxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvZW4uanNvbmApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGxvY2FsZUZpbGVDb250ZW50KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2hlY2tSZXNvdXJjZUZpbGUsIDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2hlY2tSZXNvdXJjZUZpbGUoKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbG9jYWxlID0gYXN5bmMgKGlkOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBjb25zdCBsb2NhbGUgPSBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKTtcclxuICAgIGxldCBhcmdJbmRleCA9IDA7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gbG9jYWxlW2lkXS5yZXBsYWNlKC8lcy9nLCAobWF0Y2g6IHN0cmluZykgPT4gYXJnSW5kZXggPCBhcmdzLmxlbmd0aCA/IGFyZ3NbYXJnSW5kZXhdIDogbWF0Y2gpO1xyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG59XHJcbiIsICJpbXBvcnQgSEVBRF9PVkVSTEFZUyBmcm9tICcuLi8uLi8uLi9kYXRhL2hlYWQnO1xyXG5pbXBvcnQgRkFDRV9GRUFUVVJFUyBmcm9tICcuLi8uLi8uLi9kYXRhL2ZhY2UnO1xyXG5pbXBvcnQgRFJBV0FCTEVfTkFNRVMgZnJvbSAnLi4vLi4vLi4vZGF0YS9kcmF3YWJsZSc7XHJcbmltcG9ydCBQUk9QX05BTUVTIGZyb20gJy4uLy4uLy4uL2RhdGEvcHJvcHMnO1xyXG5pbXBvcnQgeyBIYWlyRGF0YSwgUGVkSGFuZGxlLCBUb3RhbERhdGEsIERyYXdhYmxlRGF0YSwgSGVhZFN0cnVjdHVyZURhdGEsIEhlYWRPdmVybGF5RGF0YSwgVEFwcGVhcmFuY2UgfSBmcm9tICdAZGF0YVR5cGVzL2FwcGVhcmFuY2UnO1xyXG5pbXBvcnQgeyBUVGF0dG9vIH0gZnJvbSAnQGRhdGFUeXBlcy90YXR0b29zJztcclxuaW1wb3J0IHtwZWR9IGZyb20gJy4uJztcclxuaW1wb3J0IHsgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSAnQHV0aWxzJ1xyXG5cclxuY29uc3QgZmluZE1vZGVsSW5kZXggPSAobW9kZWw6IFBlZEhhbmRsZSkgPT4gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLm1vZGVscygpLmZpbmRJbmRleCgocGVkOiBzdHJpbmcpID0+IEdldEhhc2hLZXkocGVkKSA9PT0gbW9kZWwpO1xyXG5cclxuY29uc3QgZ2V0UGVkSGFpciA9ICgpOiBIYWlyRGF0YSA9PiAoe1xyXG4gICAgY29sb3I6IEdldFBlZEhhaXJDb2xvcihwZWQpLFxyXG4gICAgaGlnaGxpZ2h0OiBHZXRQZWRIYWlySGlnaGxpZ2h0Q29sb3IocGVkKVxyXG59KTtcclxuXHJcbmNvbnN0IGdldFBlZEhlYWRCbGVuZERhdGEgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBoZWFkYmxlbmREYXRhID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkdldEhlYWRCbGVuZERhdGEocGVkKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2hhcGVGaXJzdDogaGVhZGJsZW5kRGF0YS5GaXJzdEZhY2VTaGFwZSwgICAvLyBmYXRoZXJcclxuICAgICAgICBzaGFwZVNlY29uZDogaGVhZGJsZW5kRGF0YS5TZWNvbmRGYWNlU2hhcGUsIC8vIG1vdGhlclxyXG4gICAgICAgIHNoYXBlVGhpcmQ6IGhlYWRibGVuZERhdGEuVGhpcmRGYWNlU2hhcGUsXHJcblxyXG4gICAgICAgIHNraW5GaXJzdDogaGVhZGJsZW5kRGF0YS5GaXJzdFNraW5Ub25lLFxyXG4gICAgICAgIHNraW5TZWNvbmQ6IGhlYWRibGVuZERhdGEuU2Vjb25kU2tpblRvbmUsXHJcbiAgICAgICAgc2tpblRoaXJkOiBoZWFkYmxlbmREYXRhLlRoaXJkU2tpblRvbmUsXHJcblxyXG4gICAgICAgIHNoYXBlTWl4OiBoZWFkYmxlbmREYXRhLlBhcmVudEZhY2VTaGFwZVBlcmNlbnQsIC8vIHJlc2VtYmxhbmNlXHJcblxyXG4gICAgICAgIHRoaXJkTWl4OiBoZWFkYmxlbmREYXRhLlBhcmVudFRoaXJkVW5rUGVyY2VudCxcclxuICAgICAgICBza2luTWl4OiBoZWFkYmxlbmREYXRhLlBhcmVudFNraW5Ub25lUGVyY2VudCwgICAvLyBza2lucGVyY2VudFxyXG5cclxuICAgICAgICBoYXNQYXJlbnQ6IGhlYWRibGVuZERhdGEuSXNQYXJlbnRJbmhlcml0YW5jZSxcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBnZXRIZWFkT3ZlcmxheSA9ICgpOiBbUmVjb3JkPHN0cmluZywgSGVhZE92ZXJsYXlEYXRhPiwgUmVjb3JkPHN0cmluZywgbnVtYmVyPl0gPT4ge1xyXG4gICAgbGV0IHRvdGFsczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xyXG4gICAgbGV0IGhlYWREYXRhOiBSZWNvcmQ8c3RyaW5nLCBIZWFkT3ZlcmxheURhdGE+ID0ge307XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBIRUFEX09WRVJMQVlTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEhFQURfT1ZFUkxBWVNbaV07XHJcbiAgICAgICAgdG90YWxzW292ZXJsYXldID0gR2V0TnVtSGVhZE92ZXJsYXlWYWx1ZXMoaSk7XHJcblxyXG4gICAgICAgIGlmIChvdmVybGF5ID09PSBcIkV5ZUNvbG9yXCIpIHtcclxuICAgICAgICAgICAgaGVhZERhdGFbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBHZXRQZWRFeWVDb2xvcihwZWQpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgW18sIG92ZXJsYXlWYWx1ZSwgY29sb3VyVHlwZSwgZmlyc3RDb2xvciwgc2Vjb25kQ29sb3IsIG92ZXJsYXlPcGFjaXR5XSA9IEdldFBlZEhlYWRPdmVybGF5RGF0YShwZWQsIGkpO1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGkgLSAxLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBvdmVybGF5VmFsdWUgPT09IDI1NSA/IC0xIDogb3ZlcmxheVZhbHVlLFxyXG4gICAgICAgICAgICAgICAgY29sb3VyVHlwZTogY29sb3VyVHlwZSxcclxuICAgICAgICAgICAgICAgIGZpcnN0Q29sb3I6IGZpcnN0Q29sb3IsXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRDb2xvcjogc2Vjb25kQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5T3BhY2l0eTogb3ZlcmxheU9wYWNpdHlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtoZWFkRGF0YSwgdG90YWxzXTtcclxufTtcclxuXHJcbmNvbnN0IGdldEhlYWRTdHJ1Y3R1cmUgPSAoKTogUmVjb3JkPHN0cmluZywgSGVhZFN0cnVjdHVyZURhdGE+IHwgdW5kZWZpbmVkID0+IHtcclxuICAgIGNvbnN0IHBlZE1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkKVxyXG5cclxuICAgIGlmIChwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX21fZnJlZW1vZGVfMDFcIikgJiYgcGVkTW9kZWwgIT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpKSByZXR1cm5cclxuXHJcbiAgICBsZXQgZmFjZVN0cnVjdCA9IHt9XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEZBQ0VfRkVBVFVSRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gRkFDRV9GRUFUVVJFU1tpXVxyXG4gICAgICAgIGZhY2VTdHJ1Y3Rbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZEZhY2VGZWF0dXJlKHBlZCwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhY2VTdHJ1Y3RcclxufVxyXG5cclxuY29uc3QgZ2V0RHJhd2FibGVzID0gKCk6IFtSZWNvcmQ8c3RyaW5nLCBEcmF3YWJsZURhdGE+LCBSZWNvcmQ8c3RyaW5nLCBUb3RhbERhdGE+XSA9PiB7XHJcbiAgICBsZXQgZHJhd2FibGVzID0ge31cclxuICAgIGxldCB0b3RhbERyYXdhYmxlcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBEUkFXQUJMRV9OQU1FUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBEUkFXQUJMRV9OQU1FU1tpXVxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGkpXHJcblxyXG4gICAgICAgIHRvdGFsRHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHRvdGFsOiBHZXROdW1iZXJPZlBlZERyYXdhYmxlVmFyaWF0aW9ucyhwZWQsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogR2V0TnVtYmVyT2ZQZWRUZXh0dXJlVmFyaWF0aW9ucyhwZWQsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRyYXdhYmxlc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZTogR2V0UGVkVGV4dHVyZVZhcmlhdGlvbihwZWQsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbZHJhd2FibGVzLCB0b3RhbERyYXdhYmxlc11cclxufVxyXG5cclxuY29uc3QgZ2V0UHJvcHMgPSAoKTogW1JlY29yZDxzdHJpbmcsIERyYXdhYmxlRGF0YT4sIFJlY29yZDxzdHJpbmcsIFRvdGFsRGF0YT5dID0+IHtcclxuICAgIGxldCBwcm9wcyA9IHt9XHJcbiAgICBsZXQgdG90YWxQcm9wcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBQUk9QX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IFBST1BfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaSlcclxuXHJcbiAgICAgICAgdG90YWxQcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWRQcm9wRHJhd2FibGVWYXJpYXRpb25zKHBlZCwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWQsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkUHJvcEluZGV4KHBlZCwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFByb3BUZXh0dXJlSW5kZXgocGVkLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3Byb3BzLCB0b3RhbFByb3BzXVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3luYyAobW9kZWw6IG51bWJlcik6IFByb21pc2U8VEFwcGVhcmFuY2U+ID0+IHtcclxuICAgIGNvbnN0IFtoZWFkRGF0YSwgdG90YWxzXSA9IGdldEhlYWRPdmVybGF5KClcclxuICAgIGNvbnN0IFtkcmF3YWJsZXMsIGRyYXdUb3RhbF0gPSBnZXREcmF3YWJsZXMoKVxyXG4gICAgY29uc3QgW3Byb3BzLCBwcm9wVG90YWxdID0gZ2V0UHJvcHMoKVxyXG4gICAgY29uc3QgY29uZmlnID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLmNvbmZpZygpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBtb2RlbEluZGV4OiBmaW5kTW9kZWxJbmRleChtb2RlbCksXHJcbiAgICAgICAgbW9kZWw6IG1vZGVsLFxyXG4gICAgICAgIGhhaXJDb2xvcjogZ2V0UGVkSGFpcigpLFxyXG4gICAgICAgIGhlYWRCbGVuZDogZ2V0UGVkSGVhZEJsZW5kRGF0YSgpLFxyXG4gICAgICAgIGhlYWRPdmVybGF5OiBoZWFkRGF0YSxcclxuICAgICAgICBoZWFkT3ZlcmxheVRvdGFsOiB0b3RhbHMsXHJcbiAgICAgICAgaGVhZFN0cnVjdHVyZTogZ2V0SGVhZFN0cnVjdHVyZSgpLFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgICAgICB0YXR0b29zOiBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VFRhdHRvb1tdPignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0VGF0dG9vcycsIDEsIGNvbmZpZy51c2VCcmlkZ2UgPyBleHBvcnRzLmJsX2JyaWRnZS5jb3JlICYmIGV4cG9ydHMuYmxfYnJpZGdlLmNvcmUoKS5nZXRQbGF5ZXJEYXRhKCkuY2lkIDogbnVsbCkgYXMgVFRhdHRvb1tdLFxyXG4gICAgICAgIGRyYXdUb3RhbDogZHJhd1RvdGFsLFxyXG4gICAgICAgIHByb3BUb3RhbDogcHJvcFRvdGFsLFxyXG4gICAgfVxyXG59IiwgImltcG9ydCB7IHBlZCB9IGZyb20gJy4vLi4vJ1xyXG5pbXBvcnQgeyBUWm9uZVRhdHRvbyB9IGZyb20gJ0BkYXRhVHlwZXMvdGF0dG9vcyc7XHJcbmltcG9ydCB7IGRlYnVnZGF0YSB9IGZyb20gJ0B1dGlscyc7XHJcblxyXG5jb25zdCBnZXRUYXR0b29zID0gKCk6IFRab25lVGF0dG9vW10gPT4ge1xyXG4gICAgY29uc3QgW1RBVFRPT19MSVNULCBUQVRUT09fQ0FURUdPUklFU10gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UudGF0dG9vcygpXHJcbiAgICBjb25zdCB0YXR0b29ab25lczogVFpvbmVUYXR0b29bXSA9IFtdO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVEFUVE9PX0NBVEVHT1JJRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBjYXRlZ29yeSA9IFRBVFRPT19DQVRFR09SSUVTW2ldO1xyXG5cclxuICAgICAgICBjb25zdCBpbmRleCA9IGNhdGVnb3J5LmluZGV4XHJcbiAgICAgICAgY29uc3Qgem9uZSA9IGNhdGVnb3J5LnpvbmVcclxuICAgICAgICBjb25zdCBsYWJlbCA9IGNhdGVnb3J5LmxhYmVsXHJcblxyXG4gICAgICAgIHRhdHRvb1pvbmVzW2luZGV4XSA9IHtcclxuICAgICAgICAgICAgem9uZSxcclxuICAgICAgICAgICAgbGFiZWwsXHJcbiAgICAgICAgICAgIHpvbmVJbmRleDogaW5kZXgsXHJcbiAgICAgICAgICAgIGRsY3M6IFtdLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgY29uc3QgZGxjRGF0YSA9IFRBVFRPT19MSVNUW2pdO1xyXG4gICAgICAgICAgICB0YXR0b29ab25lc1tpbmRleF0uZGxjc1tqXSA9IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBkbGNEYXRhLmRsYyxcclxuICAgICAgICAgICAgICAgIGRsY0luZGV4OiBqLFxyXG4gICAgICAgICAgICAgICAgdGF0dG9vczogW10sXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlzRmVtYWxlID0gR2V0RW50aXR5TW9kZWwocGVkKSA9PT0gR2V0SGFzaEtleSgnbXBfZl9mcmVlbW9kZV8wMScpO1xyXG5cclxuICAgIGZvciAobGV0IGRsY0luZGV4ID0gMDsgZGxjSW5kZXggPCBUQVRUT09fTElTVC5sZW5ndGg7IGRsY0luZGV4KyspIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gVEFUVE9PX0xJU1RbZGxjSW5kZXhdO1xyXG4gICAgICAgIGNvbnN0IHsgZGxjLCB0YXR0b29zIH0gPSBkYXRhO1xyXG4gICAgICAgIGNvbnN0IGRsY0hhc2ggPSBHZXRIYXNoS2V5KGRsYyk7XHJcbiAgICAgICAgY29uc3QgdGF0dG9vRGF0YUxpc3QgPSB0YXR0b29zIHx8IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhdHRvb0RhdGFMaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvb0RhdGEgPSB0YXR0b29EYXRhTGlzdFtpXTtcclxuICAgICAgICAgICAgbGV0IHRhdHRvbzogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBsb3dlclRhdHRvbyA9IHRhdHRvb0RhdGEudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgY29uc3QgaXNGZW1hbGVUYXR0b28gPSBsb3dlclRhdHRvby5pbmNsdWRlcygnX2YnKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc0ZlbWFsZVRhdHRvbyAmJiBpc0ZlbWFsZSkge1xyXG4gICAgICAgICAgICAgICAgdGF0dG9vID0gdGF0dG9vRGF0YTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNGZW1hbGVUYXR0b28gJiYgIWlzRmVtYWxlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXR0b28gPSB0YXR0b29EYXRhO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBoYXNoID0gR2V0SGFzaEtleSh0YXR0b28pO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgem9uZSA9IEdldFBlZERlY29yYXRpb25ab25lRnJvbUhhc2hlcyhkbGNIYXNoLCBoYXNoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoem9uZSAhPT0gLTEgJiYgaGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHpvbmVUYXR0b29zID0gdGF0dG9vWm9uZXNbem9uZV0uZGxjc1tkbGNJbmRleF0udGF0dG9vcztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgem9uZVRhdHRvb3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0YXR0b28sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc2gsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsYyxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGF0dG9vWm9uZXM7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdldFRhdHRvb3MiLCAiZXhwb3J0IGRlZmF1bHQgWydoZXJpdGFnZScsICdoYWlyJywgJ2Nsb3RoZXMnLCAnYWNjZXNzb3JpZXMnLCAnZmFjZScsICdtYWtldXAnLCAnb3V0Zml0cycsICd0YXR0b29zJ11cclxuIiwgImV4cG9ydCBlbnVtIHNlbmQge1xyXG4gICAgdmlzaWJsZSA9ICdhcHBlYXJhbmNlOnZpc2libGUnLFxyXG4gICAgZGF0YSA9ICdhcHBlYXJhbmNlOmRhdGEnLFxyXG59XHJcblxyXG5leHBvcnQgZW51bSBhcHBlYXJhbmNlIHtcclxuICAgIHNldE1vZGVsID0gJ2FwcGVhcmFuY2U6c2V0TW9kZWwnLFxyXG4gICAgc2V0SGVhZFN0cnVjdHVyZSA9ICdhcHBlYXJhbmNlOnNldEhlYWRTdHJ1Y3R1cmUnLFxyXG4gICAgc2V0SGVhZE92ZXJsYXkgPSAnYXBwZWFyYW5jZTpzZXRIZWFkT3ZlcmxheScsXHJcbiAgICBzZXRIZWFkQmxlbmQgPSAnYXBwZWFyYW5jZTpzZXRIZWFkQmxlbmQnLFxyXG4gICAgc2V0UHJvcCA9ICdhcHBlYXJhbmNlOnNldFByb3AnLFxyXG4gICAgc2V0RHJhd2FibGUgPSAnYXBwZWFyYW5jZTpzZXREcmF3YWJsZScsXHJcbiAgICBzZXRUYXR0b29zID0gJ2FwcGVhcmFuY2U6c2V0VGF0dG9vcycsXHJcbiAgICBnZXRNb2RlbFRhdHRvb3MgPSAnYXBwZWFyYW5jZTpnZXRNb2RlbFRhdHRvb3MnLFxyXG59XHJcblxyXG5leHBvcnQgZW51bSByZWNlaXZlIHtcclxuICAgIGNsb3NlID0gJ2FwcGVhcmFuY2U6Y2xvc2UnLFxyXG5cclxuICAgIHRvZ2dsZUl0ZW0gPSAnYXBwZWFyYW5jZTp0b2dnbGVJdGVtJyxcclxuXHJcbiAgICB1c2VPdXRmaXQgPSAnYXBwZWFyYW5jZTp1c2VPdXRmaXQnLFxyXG4gICAgcmVuYW1lT3V0Zml0ID0gJ2FwcGVhcmFuY2U6cmVuYW1lT3V0Zml0JyxcclxuICAgIGRlbGV0ZU91dGZpdCA9ICdhcHBlYXJhbmNlOmRlbGV0ZU91dGZpdCcsXHJcbiAgICBzYXZlT3V0Zml0ID0gJ2FwcGVhcmFuY2U6c2F2ZU91dGZpdCcsXHJcblxyXG4gICAgc2F2ZSA9ICdhcHBlYXJhbmNlOnNhdmUnLFxyXG4gICAgY2FuY2VsID0gJ2FwcGVhcmFuY2U6Y2FuY2VsJyxcclxuXHJcbiAgICBjYW1ab29tID0gJ2FwcGVhcmFuY2U6Y2FtWm9vbScsXHJcbiAgICBjYW1Nb3ZlID0gJ2FwcGVhcmFuY2U6Y2FtTW92ZScsXHJcbiAgICBjYW1TY3JvbGwgPSAnYXBwZWFyYW5jZTpjYW1TY3JvbGwnLFxyXG59XHJcbiIsICJpbXBvcnQgeyBDYW1lcmEsIFZlY3RvcjMsIENhbWVyYUJvbmVzIH0gZnJvbSAnQGRhdGFUeXBlcy9jYW1lcmEnO1xyXG5pbXBvcnQge3BlZH0gZnJvbSAnLi8uLi9tZW51JztcclxuaW1wb3J0IHsgZGVsYXl9IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IHsgcmVjZWl2ZSB9IGZyb20gJ0BlbnVtcyc7XHJcblxyXG5sZXQgcnVubmluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgY2FtRGlzdGFuY2U6IG51bWJlciA9IDEuODtcclxubGV0IGNhbTogQ2FtZXJhIHwgbnVsbCA9IG51bGw7XHJcbmxldCBhbmdsZVk6IG51bWJlciA9IDAuMDtcclxubGV0IGFuZ2xlWjogbnVtYmVyID0gMC4wO1xyXG5sZXQgdGFyZ2V0Q29vcmRzOiBWZWN0b3IzIHwgbnVsbCA9IG51bGw7XHJcbmxldCBvbGRDYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgY2hhbmdpbmdDYW06IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGxhc3RYOiBudW1iZXIgPSAwO1xyXG5sZXQgY3VycmVudEJvbmU6IGtleW9mIENhbWVyYUJvbmVzID0gJ2hlYWQnXHJcblxyXG5jb25zdCBDYW1lcmFCb25lczogQ2FtZXJhQm9uZXMgPSB7XHJcbiAgICBoZWFkOiAzMTA4NixcclxuICAgIHRvcnNvOiAyNDgxOCxcclxuICAgIGxlZ3M6IDE0MjAxLFxyXG59O1xyXG5cclxuY29uc3QgY29zID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XHJcbiAgICByZXR1cm4gTWF0aC5jb3MoKGRlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MCk7XHJcbn1cclxuXHJcbmNvbnN0IHNpbiA9IChkZWdyZWVzOiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG4gICAgcmV0dXJuIE1hdGguc2luKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59XHJcblxyXG5jb25zdCBnZXRBbmdsZXMgPSAoKTogbnVtYmVyW10gPT4ge1xyXG4gICAgY29uc3QgeCA9KChjb3MoYW5nbGVaKSAqIGNvcyhhbmdsZVkpKSArIChjb3MoYW5nbGVZKSAqIGNvcyhhbmdsZVopKSkgLyAyICogY2FtRGlzdGFuY2U7XHJcbiAgICBjb25zdCB5ID0gKChzaW4oYW5nbGVaKSAqIGNvcyhhbmdsZVkpKSArIChjb3MoYW5nbGVZKSAqIHNpbihhbmdsZVopKSkgLyAyICogY2FtRGlzdGFuY2U7XHJcbiAgICBjb25zdCB6ID0gc2luKGFuZ2xlWSkgKiBjYW1EaXN0YW5jZTtcclxuXHJcbiAgICByZXR1cm4gW3gsIHksIHpdXHJcbn1cclxuXHJcblxyXG5jb25zdCBzZXRDYW1Qb3NpdGlvbiA9IChtb3VzZVg/OiBudW1iZXIsIG1vdXNlWT86IG51bWJlcik6IHZvaWQgPT4ge1xyXG4gICAgaWYgKCFydW5uaW5nIHx8ICF0YXJnZXRDb29yZHMgfHwgY2hhbmdpbmdDYW0pIHJldHVybjtcclxuXHJcbiAgICBtb3VzZVggPSBtb3VzZVggPz8gMC4wO1xyXG4gICAgbW91c2VZID0gbW91c2VZID8/IDAuMDtcclxuXHJcbiAgICBhbmdsZVogLT0gbW91c2VYO1xyXG4gICAgYW5nbGVZICs9IG1vdXNlWTtcclxuICAgIGFuZ2xlWSA9IE1hdGgubWluKE1hdGgubWF4KGFuZ2xlWSwgMC4wKSwgODkuMCk7XHJcblxyXG4gICAgY29uc3QgW3gsIHksIHpdID0gZ2V0QW5nbGVzKClcclxuXHJcbiAgICBTZXRDYW1Db29yZChjYW0sIHRhcmdldENvb3Jkcy54ICsgeCwgdGFyZ2V0Q29vcmRzLnkgKyB5LCB0YXJnZXRDb29yZHMueiArIHopXHJcbiAgICBQb2ludENhbUF0Q29vcmQoY2FtLCB0YXJnZXRDb29yZHMueCwgdGFyZ2V0Q29vcmRzLnksIHRhcmdldENvb3Jkcy56KVxyXG59XHJcblxyXG5jb25zdCBtb3ZlQ2FtZXJhID0gYXN5bmMgKGNvb3JkczogVmVjdG9yMywgZGlzdGFuY2U/OiBudW1iZXIpID0+IHtcclxuICAgIGNvbnN0IGhlYWRpbmc6IG51bWJlciA9IEdldEVudGl0eUhlYWRpbmcocGVkKSArIDk0O1xyXG4gICAgZGlzdGFuY2UgPSBkaXN0YW5jZSA/PyAxLjA7XHJcblxyXG4gICAgY2hhbmdpbmdDYW0gPSB0cnVlO1xyXG4gICAgY2FtRGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuICAgIGFuZ2xlWiA9IGhlYWRpbmc7XHJcblxyXG4gICAgY29uc3QgW3gsIHksIHpdID0gZ2V0QW5nbGVzKClcclxuXHJcbiAgICBjb25zdCBuZXdjYW06IENhbWVyYSA9IENyZWF0ZUNhbVdpdGhQYXJhbXMoXHJcbiAgICAgICAgXCJERUZBVUxUX1NDUklQVEVEX0NBTUVSQVwiLFxyXG4gICAgICAgIGNvb3Jkcy54ICsgeCxcclxuICAgICAgICBjb29yZHMueSArIHksXHJcbiAgICAgICAgY29vcmRzLnogKyB6LFxyXG4gICAgICAgIDAuMCxcclxuICAgICAgICAwLjAsXHJcbiAgICAgICAgMC4wLFxyXG4gICAgICAgIDcwLjAsXHJcbiAgICAgICAgZmFsc2UsXHJcbiAgICAgICAgMFxyXG4gICAgKTtcclxuXHJcbiAgICB0YXJnZXRDb29yZHMgPSBjb29yZHM7XHJcbiAgICBjaGFuZ2luZ0NhbSA9IGZhbHNlO1xyXG4gICAgb2xkQ2FtID0gY2FtXHJcbiAgICBjYW0gPSBuZXdjYW07XHJcblxyXG4gICAgUG9pbnRDYW1BdENvb3JkKG5ld2NhbSwgY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMueik7XHJcbiAgICBTZXRDYW1BY3RpdmVXaXRoSW50ZXJwKG5ld2NhbSwgb2xkQ2FtLCAyNTAsIDAsIDApO1xyXG5cclxuICAgIGF3YWl0IGRlbGF5KDI1MClcclxuXHJcbiAgICBTZXRDYW1Vc2VTaGFsbG93RG9mTW9kZShuZXdjYW0sIHRydWUpO1xyXG4gICAgU2V0Q2FtTmVhckRvZihuZXdjYW0sIDAuNCk7XHJcbiAgICBTZXRDYW1GYXJEb2YobmV3Y2FtLCAxLjIpO1xyXG4gICAgU2V0Q2FtRG9mU3RyZW5ndGgobmV3Y2FtLCAwLjMpO1xyXG4gICAgdXNlSGlEb2YobmV3Y2FtKTtcclxuXHJcbiAgICBEZXN0cm95Q2FtKG9sZENhbSwgdHJ1ZSk7XHJcbn1cclxuXHJcbmNvbnN0IHVzZUhpRG9mID0gKGN1cnJlbnRjYW06IENhbWVyYSkgPT4ge1xyXG4gICAgaWYgKCEoRG9lc0NhbUV4aXN0KGNhbSkgJiYgY3VycmVudGNhbSA9PSBjYW0pKSByZXR1cm47XHJcbiAgICBTZXRVc2VIaURvZigpO1xyXG4gICAgc2V0VGltZW91dCh1c2VIaURvZiwgMCk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzdGFydENhbWVyYSA9IGFzeW5jICgpID0+IHtcclxuICAgIGlmIChydW5uaW5nKSByZXR1cm47XHJcbiAgICBydW5uaW5nID0gdHJ1ZTtcclxuICAgIGNhbURpc3RhbmNlID0gMS4wO1xyXG4gICAgY2FtID0gQ3JlYXRlQ2FtKFwiREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkFcIiwgdHJ1ZSk7XHJcbiAgICBjb25zdCBbeCwgeSwgel06IG51bWJlcltdID0gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIDMxMDg2LCAwLjAsIDAuMCwgMC4wKVxyXG4gICAgU2V0Q2FtQ29vcmQoY2FtLCB4LCB5LCB6KVxyXG4gICAgUmVuZGVyU2NyaXB0Q2Ftcyh0cnVlLCB0cnVlLCAxMDAwLCB0cnVlLCB0cnVlKTtcclxuICAgIG1vdmVDYW1lcmEoe3g6IHgsIHk6IHksIHo6IHp9LCBjYW1EaXN0YW5jZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzdG9wQ2FtZXJhID0gKCk6IHZvaWQgPT4ge1xyXG4gICAgaWYgKCFydW5uaW5nKSByZXR1cm47XHJcbiAgICBydW5uaW5nID0gZmFsc2U7XHJcblxyXG4gICAgUmVuZGVyU2NyaXB0Q2FtcyhmYWxzZSwgdHJ1ZSwgMjUwLCB0cnVlLCBmYWxzZSk7XHJcbiAgICBEZXN0cm95Q2FtKGNhbSwgdHJ1ZSk7XHJcbiAgICBjYW0gPSBudWxsO1xyXG4gICAgdGFyZ2V0Q29vcmRzID0gbnVsbDtcclxufVxyXG5cclxuY29uc3Qgc2V0Q2FtZXJhID0gKHR5cGU/OiBrZXlvZiBDYW1lcmFCb25lcyk6IHZvaWQgPT4ge1xyXG4gICAgY29uc3QgYm9uZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gQ2FtZXJhQm9uZXNbdHlwZV07XHJcbiAgICBpZiAoY3VycmVudEJvbmUgPT0gdHlwZSkgcmV0dXJuO1xyXG4gICAgY29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IGJvbmUgPyBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZSwgMC4wLCAwLjAsIGJvbmUgPT09IDE0MjAxID8gMC4yIDogMC4wKSA6IEdldEVudGl0eUNvb3JkcyhwZWQsIGZhbHNlKTtcclxuXHJcbiAgICBtb3ZlQ2FtZXJhKHtcclxuICAgICAgICB4OiB4LCBcclxuICAgICAgICB5OiB5LCBcclxuICAgICAgICB6OiB6ICsgMC4wXHJcbiAgICB9LCAxLjApO1xyXG5cclxuICAgIGN1cnJlbnRCb25lID0gdHlwZTtcclxufVxyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhyZWNlaXZlLmNhbU1vdmUsIChkYXRhLCBjYikgPT4ge1xyXG4gICAgY2IoMSlcclxuICAgIGxldCBoZWFkaW5nOiBudW1iZXIgPSBHZXRFbnRpdHlIZWFkaW5nKHBlZCk7XHJcbiAgICBpZiAobGFzdFggPT0gZGF0YS54KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaGVhZGluZyA9IGRhdGEueCA+IGxhc3RYID8gaGVhZGluZyArIDUgOiBoZWFkaW5nIC0gNTtcclxuICAgIFNldEVudGl0eUhlYWRpbmcocGVkLCBoZWFkaW5nKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKHJlY2VpdmUuY2FtU2Nyb2xsLCAodHlwZTogbnVtYmVyLCBjYjogRnVuY3Rpb24pID0+IHtcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKFwibGVnc1wiKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICBzZXRDYW1lcmEoXCJoZWFkXCIpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGNiKDEpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2socmVjZWl2ZS5jYW1ab29tLCAoZGF0YSwgY2IpID0+IHtcclxuICAgIGlmIChkYXRhID09PSBcImRvd25cIikge1xyXG4gICAgICAgIGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSArIDAuMDU7XHJcbiAgICAgICAgY2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA+PSAxLjAgPyAxLjAgOiBuZXdEaXN0YW5jZTtcclxuICAgIH0gZWxzZSBpZiAoZGF0YSA9PT0gXCJ1cFwiKSB7XHJcbiAgICAgICAgY29uc3QgbmV3RGlzdGFuY2U6IG51bWJlciA9IGNhbURpc3RhbmNlIC0gMC4wNTtcclxuICAgICAgICBjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlIDw9IDAuMzUgPyAwLjM1IDogbmV3RGlzdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgY2FtRGlzdGFuY2UgPSBjYW1EaXN0YW5jZTtcclxuICAgIHNldENhbVBvc2l0aW9uKCk7XHJcbiAgICBjYigxKTtcclxufSk7XHJcblxyXG4iLCAiaW1wb3J0IGdldEFwcGVhcmFuY2UgZnJvbSAnLi9hcHBlYXJhbmNlJ1xyXG5pbXBvcnQgZ2V0VGF0dG9vcyBmcm9tICcuL3RhdHRvb3MnXHJcbmltcG9ydCB7IFRBcHBlYXJhbmNlfSBmcm9tICdAZGF0YVR5cGVzL2FwcGVhcmFuY2UnO1xyXG5pbXBvcnQgeyBUVGF0dG9vfSBmcm9tICdAZGF0YVR5cGVzL3RhdHRvb3MnO1xyXG5pbXBvcnQgbWVudVR5cGVzIGZyb20gJy4uLy4uL2RhdGEvbWVudVR5cGVzJztcclxuaW1wb3J0IHsgc2VuZCwgcmVjZWl2ZSB9IGZyb20gJ0BlbnVtcydcclxuaW1wb3J0IHsgc2VuZE5VSUV2ZW50LCBkZWxheSwgcmVxdWVzdExvY2FsZSwgcmVxdWVzdE1vZGVsIH0gZnJvbSAnLi4vdXRpbHMnXHJcbmltcG9ydCB7IHN0YXJ0Q2FtZXJhLCBzdG9wQ2FtZXJhIH0gZnJvbSAnLi8uLi9jYW1lcmEnXHJcblxyXG5leHBvcnQgbGV0IHBsYXllckFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlIHwgbnVsbCA9IG51bGxcclxuXHJcbmNvbnN0IGJsX2FwcGVhcmFuY2UgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxuZXhwb3J0IGxldCBpc01lbnVPcGVuID0gZmFsc2VcclxuZXhwb3J0IGxldCBwZWQgPSAwXHJcblxyXG5jb25zdCB1cGRhdGVQZWQgPSAoKSA9PiB7XHJcbiAgICBpZiAoIWlzTWVudU9wZW4pIHJldHVybjtcclxuICAgIHBlZCA9IFBsYXllclBlZElkKClcclxuICAgIHNldFRpbWVvdXQodXBkYXRlUGVkLCAxMDApO1xyXG59XHJcblxyXG5jb25zdCB2YWxpZE1lbnVUeXBlcyA9ICh0eXBlOiBzdHJpbmdbXSkgPT4ge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKCFtZW51VHlwZXMuaW5jbHVkZXModHlwZVtpXSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IG9wZW5NZW51ID0gYXN5bmMgKHR5cGU6IHN0cmluZ1tdIHwgc3RyaW5nKSA9PiB7XHJcbiAgICBpc01lbnVPcGVuID0gdHJ1ZVxyXG4gICAgdXBkYXRlUGVkKClcclxuICAgIGF3YWl0IGRlbGF5KDE1MClcclxuICAgIHN0YXJ0Q2FtZXJhKClcclxuICAgIHNlbmROVUlFdmVudChzZW5kLnZpc2libGUsIHRydWUpXHJcbiAgICBTZXROdWlGb2N1cyh0cnVlLCB0cnVlKVxyXG4gICAgY29uc3QgaXNBcnJheSA9IHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJ1xyXG5cclxuICAgIGlmIChpc0FycmF5ICYmICF2YWxpZE1lbnVUeXBlcyh0eXBlKSkge1xyXG4gICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKCdFcnJvcjogbWVudSB0eXBlIG5vdCBmb3VuZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKEdldEVudGl0eU1vZGVsKHBlZCkpXHJcbiAgICBwbGF5ZXJBcHBlYXJhbmNlID0gYXBwZWFyYW5jZVxyXG5cclxuICAgIHNlbmROVUlFdmVudChzZW5kLmRhdGEsIHtcclxuICAgICAgICB0YWJzOiBpc0FycmF5ID8gdHlwZSA6IG1lbnVUeXBlcy5pbmNsdWRlcyh0eXBlKSA/IHR5cGUgOiBtZW51VHlwZXMsXHJcbiAgICAgICAgYXBwZWFyYW5jZTogYXBwZWFyYW5jZSxcclxuICAgICAgICBibGFja2xpc3Q6IGJsX2FwcGVhcmFuY2UuYmxhY2tsaXN0KCksXHJcbiAgICAgICAgdGF0dG9vczogZ2V0VGF0dG9vcygpLFxyXG4gICAgICAgIG91dGZpdHM6IFtdLFxyXG4gICAgICAgIG1vZGVsczogYmxfYXBwZWFyYW5jZS5tb2RlbHMoKSxcclxuICAgICAgICBsb2NhbGU6IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpXHJcbiAgICB9KVxyXG59XHJcblxyXG5jb25zdCByZXNldEFwcGVhcmFuY2UgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCBtb2RlbCA9IHBsYXllckFwcGVhcmFuY2UubW9kZWxcclxuICAgIGNvbnN0IG1vZGVsSGFzaCA9IGF3YWl0IHJlcXVlc3RNb2RlbChtb2RlbClcclxuICAgIGNvbnNvbGUubG9nKG1vZGVsSGFzaClcclxuXHJcbiAgICBTZXRQbGF5ZXJNb2RlbChQbGF5ZXJJZCgpLCBtb2RlbEhhc2gpXHJcblxyXG4gICAgYXdhaXQgZGVsYXkoMTUwKVxyXG5cclxuICAgIFNldE1vZGVsQXNOb0xvbmdlck5lZWRlZChtb2RlbEhhc2gpXHJcbiAgICBTZXRQZWREZWZhdWx0Q29tcG9uZW50VmFyaWF0aW9uKHBlZClcclxuXHJcbiAgICBpZiAobW9kZWwgPT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgZmFsc2UpXHJcbiAgICBlbHNlIGlmIChtb2RlbCA9PT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIikpIFNldFBlZEhlYWRCbGVuZERhdGEocGVkLCA0NSwgMjEsIDAsIDIwLCAxNSwgMCwgMC4zLCAwLjEsIDAsIGZhbHNlKVxyXG5cclxuICAgIGNvbnN0IGhlYWRCbGVuZCA9IHBsYXllckFwcGVhcmFuY2UuaGVhZEJsZW5kXHJcbiAgICBpZiAoaGVhZEJsZW5kKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgaGVhZEJsZW5kLnNoYXBlRmlyc3QsIGhlYWRCbGVuZC5zaGFwZVNlY29uZCwgaGVhZEJsZW5kLnNoYXBlVGhpcmQsIGhlYWRCbGVuZC5za2luRmlyc3QsIGhlYWRCbGVuZC5za2luU2Vjb25kLCBoZWFkQmxlbmQuc2tpblRoaXJkLCBoZWFkQmxlbmQuc2hhcGVNaXgsIGhlYWRCbGVuZC5za2luTWl4LCBoZWFkQmxlbmQudGhpcmRNaXgsIGhlYWRCbGVuZC5oYXNQYXJlbnQpXHJcblxyXG4gICAgaWYgKHBsYXllckFwcGVhcmFuY2UuaGVhZFN0cnVjdHVyZSkgZm9yIChjb25zdCBkYXRhIG9mIE9iamVjdC52YWx1ZXMocGxheWVyQXBwZWFyYW5jZS5oZWFkU3RydWN0dXJlKSkge1xyXG4gICAgICAgIFNldFBlZEZhY2VGZWF0dXJlKHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSlcclxuICAgIH1cclxuXHJcbiAgICBpZiAocGxheWVyQXBwZWFyYW5jZS5kcmF3YWJsZXMpIGZvciAoY29uc3QgZGF0YSBvZiBPYmplY3QudmFsdWVzKHBsYXllckFwcGVhcmFuY2UuZHJhd2FibGVzKSkge1xyXG4gICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgMClcclxuICAgIH1cclxuXHJcbiAgICBpZiAocGxheWVyQXBwZWFyYW5jZS5wcm9wcykgZm9yIChjb25zdCBkYXRhIG9mIE9iamVjdC52YWx1ZXMocGxheWVyQXBwZWFyYW5jZS5wcm9wcykpIHtcclxuICAgICAgICBpZiAoZGF0YS52YWx1ZSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgQ2xlYXJQZWRQcm9wKHBlZCwgZGF0YS5pbmRleClcclxuICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICB9XHJcbiAgICAgICAgU2V0UGVkUHJvcEluZGV4KHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCBmYWxzZSlcclxuICAgIH1cclxuXHJcbiAgICBpZiAocGxheWVyQXBwZWFyYW5jZS5oYWlyQ29sb3IpIHtcclxuICAgICAgICBTZXRQZWRIYWlyQ29sb3IocGVkLCBwbGF5ZXJBcHBlYXJhbmNlLmhhaXJDb2xvci5jb2xvciwgcGxheWVyQXBwZWFyYW5jZS5oYWlyQ29sb3IuaGlnaGxpZ2h0KSBcclxuICAgIH1cclxuXHJcbiAgICBpZiAocGxheWVyQXBwZWFyYW5jZS5oZWFkT3ZlcmxheSkgZm9yIChjb25zdCBkYXRhIG9mIE9iamVjdC52YWx1ZXMocGxheWVyQXBwZWFyYW5jZS5oZWFkT3ZlcmxheSkpIHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlID09IC0xID8gMjU1IDogZGF0YS5vdmVybGF5VmFsdWVcclxuXHJcbiAgICAgICAgaWYgKGRhdGEuaWQgPT09ICdFeWVDb2xvcicpIFNldFBlZEV5ZUNvbG9yKHBlZCwgdmFsdWUpIFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBTZXRQZWRIZWFkT3ZlcmxheShwZWQsIGRhdGEuaW5kZXgsIHZhbHVlLCBkYXRhLm92ZXJsYXlPcGFjaXR5KVxyXG4gICAgICAgICAgICBTZXRQZWRIZWFkT3ZlcmxheUNvbG9yKHBlZCwgZGF0YS5pbmRleCwgMSwgZGF0YS5maXJzdENvbG9yLCBkYXRhLnNlY29uZENvbG9yKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAocGxheWVyQXBwZWFyYW5jZS50YXR0b29zKSB7XHJcbiAgICAgICAgQ2xlYXJQZWREZWNvcmF0aW9uc0xlYXZlU2NhcnMocGVkKVxyXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBwbGF5ZXJBcHBlYXJhbmNlLnRhdHRvb3MpIHtcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vID0gZWxlbWVudC50YXR0b29cclxuICAgICAgICAgICAgaWYgKHRhdHRvbykge1xyXG4gICAgICAgICAgICAgICAgQWRkUGVkRGVjb3JhdGlvbkZyb21IYXNoZXMocGVkLCBHZXRIYXNoS2V5KHRhdHRvby5kbGMpLCB0YXR0b28uaGFzaClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gIFxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY2xvc2VNZW51ID0gYXN5bmMgKHNhdmU6IGJvb2xlYW4pID0+IHtcclxuICAgIGlmICghc2F2ZSkgcmVzZXRBcHBlYXJhbmNlKClcclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5jb25maWcoKVxyXG4gICAgICAgIGNvbnN0IGFwcGVhcmFuY2UgPSBhd2FpdCBnZXRBcHBlYXJhbmNlKEdldEVudGl0eU1vZGVsKHBlZCkpXHJcbiAgICAgICAgZW1pdE5ldChcImJsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVBcHBlYXJhbmNlc1wiLCB7XHJcbiAgICAgICAgICAgIGlkOiBjb25maWcudXNlQnJpZGdlID8gZXhwb3J0cy5ibF9icmlkZ2UuY29yZSAmJiBleHBvcnRzLmJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpLmNpZCA6IG51bGwsXHJcblxyXG4gICAgICAgICAgICBza2luOiB7XHJcbiAgICAgICAgICAgICAgICBoZWFkQmxlbmQ6IGFwcGVhcmFuY2UuaGVhZEJsZW5kLFxyXG4gICAgICAgICAgICAgICAgaGVhZFN0cnVjdHVyZTogYXBwZWFyYW5jZS5oZWFkU3RydWN0dXJlLFxyXG4gICAgICAgICAgICAgICAgaGVhZE92ZXJsYXk6IGFwcGVhcmFuY2UuaGVhZE92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBoYWlyQ29sb3I6IGFwcGVhcmFuY2UuaGFpckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgbW9kZWw6IGFwcGVhcmFuY2UubW9kZWwsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNsb3RoZXM6IHtcclxuICAgICAgICAgICAgICAgIGRyYXdhYmxlczogYXBwZWFyYW5jZS5kcmF3YWJsZXMsXHJcbiAgICAgICAgICAgICAgICBwcm9wczogYXBwZWFyYW5jZS5wcm9wcyxcclxuICAgICAgICAgICAgICAgIGhlYWRPdmVybGF5OiBhcHBlYXJhbmNlLmhlYWRPdmVybGF5LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0YXR0b29zOiBwbGF5ZXJBcHBlYXJhbmNlLmN1cnJlbnRUYXR0b29zIHx8IFtdLFxyXG4gICAgICAgICAgICBvdXRmaXRzOiBbXVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0b3BDYW1lcmEoKVxyXG4gICAgaXNNZW51T3BlbiA9IGZhbHNlXHJcbiAgICBTZXROdWlGb2N1cyhmYWxzZSwgZmFsc2UpXHJcbiAgICBzZW5kTlVJRXZlbnQoc2VuZC52aXNpYmxlLCBmYWxzZSlcclxufVxyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhyZWNlaXZlLmNsb3NlLCAoc2F2ZTogYm9vbGVhbiwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBjYigxKVxyXG4gICAgY2xvc2VNZW51KHNhdmUpXHJcbn0pOyIsICJpbXBvcnQgeyBhcHBlYXJhbmNlIH0gZnJvbSAnQGVudW1zJztcclxuaW1wb3J0IHsgZGVidWdkYXRhLCByZXF1ZXN0TW9kZWwsIGRlbGF5fSBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCB7IEhlYWRPdmVybGF5RGF0YSwgSGVhZFN0cnVjdHVyZURhdGEsIERyYXdhYmxlRGF0YX0gZnJvbSAnQGRhdGFUeXBlcy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgVFRhdHRvb30gZnJvbSAnQGRhdGFUeXBlcy90YXR0b29zJztcclxuaW1wb3J0IGdldEFwcGVhcmFuY2UgZnJvbSAnLidcclxuaW1wb3J0IHtwZWQsIHBsYXllckFwcGVhcmFuY2V9IGZyb20gJy4vLi4vJ1xyXG5cclxuaW1wb3J0IHtUSGVhZEJsZW5kfSBmcm9tICdAZGF0YVR5cGVzL2FwcGVhcmFuY2UnXHJcblxyXG5jb25zdCBhY3Rpb25IYW5kbGVycyA9IHtcclxuICAgIFthcHBlYXJhbmNlLnNldE1vZGVsXTogYXN5bmMgKG1vZGVsOiBzdHJpbmcpID0+IHtcclxuICAgICAgICBjb25zdCBtb2RlbEhhc2ggPSBhd2FpdCByZXF1ZXN0TW9kZWwobW9kZWwpXHJcblxyXG4gICAgICAgIFNldFBsYXllck1vZGVsKFBsYXllcklkKCksIG1vZGVsSGFzaClcclxuXHJcbiAgICAgICAgYXdhaXQgZGVsYXkoMTUwKVxyXG5cclxuICAgICAgICBTZXRNb2RlbEFzTm9Mb25nZXJOZWVkZWQobW9kZWxIYXNoKVxyXG4gICAgICAgIFNldFBlZERlZmF1bHRDb21wb25lbnRWYXJpYXRpb24ocGVkKVxyXG5cclxuICAgICAgICBpZiAobW9kZWwgPT09IFwibXBfbV9mcmVlbW9kZV8wMVwiKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgZmFsc2UpXHJcbiAgICAgICAgZWxzZSBpZiAobW9kZWwgPT09IFwibXBfZl9mcmVlbW9kZV8wMVwiKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgNDUsIDIxLCAwLCAyMCwgMTUsIDAsIDAuMywgMC4xLCAwLCBmYWxzZSlcclxuXHJcbiAgICAgICAgcmV0dXJuIGdldEFwcGVhcmFuY2UobW9kZWxIYXNoKVxyXG4gICAgfSxcclxuICAgIFthcHBlYXJhbmNlLnNldEhlYWRTdHJ1Y3R1cmVdOiAoZGF0YTogSGVhZFN0cnVjdHVyZURhdGEpID0+IHtcclxuICAgICAgICBTZXRQZWRGYWNlRmVhdHVyZShwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpXHJcbiAgICAgICAgcmV0dXJuIGRhdGFcclxuICAgIH0sXHJcbiAgICBbYXBwZWFyYW5jZS5zZXRIZWFkT3ZlcmxheV06IChkYXRhOiBIZWFkT3ZlcmxheURhdGEpID0+IHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlID09IC0xID8gMjU1IDogZGF0YS5vdmVybGF5VmFsdWVcclxuXHJcbiAgICAgICAgaWYgKGRhdGEuaWQgPT09ICdFeWVDb2xvcicpIFNldFBlZEV5ZUNvbG9yKHBlZCwgZGF0YS5leWVDb2xvcikgXHJcbiAgICAgICAgZWxzZSBpZiAoZGF0YS5pZCA9PT0gJ2hhaXJDb2xvcicpIFNldFBlZEhhaXJDb2xvcihwZWQsIGRhdGEuaGFpckNvbG9yLCBkYXRhLmhhaXJIaWdobGlnaHQpIFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBTZXRQZWRIZWFkT3ZlcmxheShwZWQsIGRhdGEuaW5kZXgsIHZhbHVlLCBkYXRhLm92ZXJsYXlPcGFjaXR5KVxyXG4gICAgICAgICAgICBTZXRQZWRIZWFkT3ZlcmxheUNvbG9yKHBlZCwgZGF0YS5pbmRleCwgMSwgZGF0YS5maXJzdENvbG9yLCBkYXRhLnNlY29uZENvbG9yKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIDFcclxuICAgIH0sXHJcbiAgICBbYXBwZWFyYW5jZS5zZXRIZWFkQmxlbmRdOiAoZGF0YTogVEhlYWRCbGVuZCkgPT4ge1xyXG4gICAgICAgIFNldFBlZEhlYWRCbGVuZERhdGEoXHJcbiAgICAgICAgICAgIHBlZCwgXHJcbiAgICAgICAgICAgIGRhdGEuc2hhcGVGaXJzdCwgXHJcbiAgICAgICAgICAgIGRhdGEuc2hhcGVTZWNvbmQsIFxyXG4gICAgICAgICAgICBkYXRhLnNoYXBlVGhpcmQsIFxyXG4gICAgICAgICAgICBkYXRhLnNraW5GaXJzdCwgXHJcbiAgICAgICAgICAgIGRhdGEuc2tpblNlY29uZCwgXHJcbiAgICAgICAgICAgIGRhdGEuc2tpblRoaXJkLCBcclxuICAgICAgICAgICAgZGF0YS5zaGFwZU1peCwgXHJcbiAgICAgICAgICAgIGRhdGEuc2tpbk1peCwgXHJcbiAgICAgICAgICAgIGRhdGEudGhpcmRNaXgsIFxyXG4gICAgICAgICAgICBkYXRhLmhhc1BhcmVudFxyXG4gICAgICAgIClcclxuICAgICAgICByZXR1cm4gMVxyXG4gICAgfSxcclxuICAgIFthcHBlYXJhbmNlLnNldFByb3BdOiAoZGF0YTogRHJhd2FibGVEYXRhKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEudmFsdWUgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIENsZWFyUGVkUHJvcChwZWQsIGRhdGEuaW5kZXgpXHJcbiAgICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFNldFBlZFByb3BJbmRleChwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgZmFsc2UpXHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaXNUZXh0dXJlID8gMSA6IEdldE51bWJlck9mUGVkUHJvcFRleHR1cmVWYXJpYXRpb25zKHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSkgLy8gaWYgaXQgdGV4dHVyZSB3aHkgd2Ugd291bGQgY2FsbCBhIHVzZWxlc3MgbmF0aXZlIFxyXG4gICAgfSxcclxuICAgIFthcHBlYXJhbmNlLnNldERyYXdhYmxlXTogKGRhdGE6IERyYXdhYmxlRGF0YSkgPT4ge1xyXG4gICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgMClcclxuXHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaXNUZXh0dXJlID8gMSA6IEdldE51bWJlck9mUGVkVGV4dHVyZVZhcmlhdGlvbnMocGVkLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlKS0xXHJcbiAgICB9LFxyXG4gICAgW2FwcGVhcmFuY2Uuc2V0VGF0dG9vc106IChkYXRhOiBUVGF0dG9vW10pID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEpIHJldHVybiAxXHJcblxyXG4gICAgICAgIHBsYXllckFwcGVhcmFuY2UuY3VycmVudFRhdHRvb3MgPSBkYXRhXHJcbiAgICAgICAgQ2xlYXJQZWREZWNvcmF0aW9uc0xlYXZlU2NhcnMocGVkKVxyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCB0YXR0b28gPSBlbGVtZW50LnRhdHRvb1xyXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XHJcbiAgICAgICAgICAgICAgICBBZGRQZWREZWNvcmF0aW9uRnJvbUhhc2hlcyhwZWQsIEdldEhhc2hLZXkodGF0dG9vLmRsYyksIHRhdHRvby5oYXNoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiAxXHJcbiAgICB9LFxyXG4gICAgW2FwcGVhcmFuY2UuZ2V0TW9kZWxUYXR0b29zXTogKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBkYXRhXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZm9yIChjb25zdCBhY3Rpb24gb2YgT2JqZWN0LnZhbHVlcyhhcHBlYXJhbmNlKSkge1xyXG4gICAgUmVnaXN0ZXJOdWlDYWxsYmFjayhhY3Rpb24sIGFzeW5jIChkYXRhOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBhY3Rpb25IYW5kbGVyc1thY3Rpb25dO1xyXG4gICAgICAgIGlmICghaGFuZGxlcikgcmV0dXJuXHJcblxyXG4gICAgICAgIGNiKGF3YWl0IGhhbmRsZXIoZGF0YSkpXHJcbiAgICB9KTtcclxufVxyXG4iLCAiaW1wb3J0IHsgb3Blbk1lbnUgfSBmcm9tICcuL21lbnUnXHJcbmltcG9ydCB7IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayB9IGZyb20gJ0B1dGlscydcclxuaW1wb3J0KCcuL21lbnUvYXBwZWFyYW5jZS9oYW5kbGVyJylcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgnb3Blbk1lbnUnLCAoKSA9PiB7XHJcbiAgb3Blbk1lbnUoJ2FsbCcpXHJcbn0sIGZhbHNlKVxyXG5cclxuc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcbiAgY29uc3QgYXJncyA9IFsxLCBudWxsLCAzLCBudWxsLCBudWxsLCA2XTtcclxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazx7IHNlcnZlclZhbHVlOiBudW1iZXIgfT4oJ3Rlc3Q6c2VydmVyJywgMSwgYXJncyk7XHJcbiAgaWYgKCFyZXNwb25zZSkgcmV0dXJuO1xyXG59LCAxMDApO1xyXG5cclxuLy8gZnVuY3Rpb24gRXhwb3J0X0dldFBlZEhlYWRCbGVuZERhdGEoKSB7XHJcbi8vICAgICB2YXIgYXJyID0gbmV3IFVpbnQzMkFycmF5KG5ldyBBcnJheUJ1ZmZlcigxMCAqIDgpKTsgLy8gaW50LCBpbnQsIGludCwgaW50LCBpbnQsIGludCwgZmxvYXQsIGZsb2F0LCBmbG9hdCwgYm9vbFxyXG4vLyAgICAgQ2l0aXplbi5pbnZva2VOYXRpdmUoXCIweDI3NDZCRDlEODhDNUM1RDBcIiwgUGxheWVyUGVkSWQoKSwgYXJyKTtcclxuLy8gICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcnIpO1xyXG4vLyB9XHJcblxyXG4vLyBSZWdpc3RlckNvbW1hbmQoJ2hlYWQnLCAoKSA9PiB7XHJcbi8vICAgICAvLyBjb25zdCBkYXRhID0gRXhwb3J0X0dldFBlZEhlYWRCbGVuZERhdGEoKVxyXG4vLyAgICAgLy8gY29uc29sZS5sb2coZGF0YSlcclxuLy8gfSwgZmFsc2UpXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7O0FBQUEsSUFBTztBQUFQO0FBQUE7QUFBQSxJQUFP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RTtBQUFBLFFBQ0o7QUFFQSxlQUFPO0FBQUEsTUFDWDtBQUFBLE1BQ0EsbURBQTJCLEdBQUcsQ0FBQyxTQUFjO0FBQ3pDLGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSjtBQUVBLGVBQVcsVUFBVSxPQUFPLE9BQU8sVUFBVSxHQUFHO0FBQzVDLDBCQUFvQixRQUFRLE9BQU8sTUFBVyxPQUFpQjtBQUMzRCxjQUFNLFVBQVUsZUFBZSxNQUFNO0FBQ3JDLFlBQUksQ0FBQztBQUFTO0FBRWQsV0FBRyxNQUFNLFFBQVEsSUFBSSxDQUFDO0FBQUEsTUFDMUIsQ0FBQztBQUFBLElBQ0w7QUFBQTtBQUFBOzs7QUNqR0E7QUFDQTtBQUNBO0FBRUEsZ0JBQWdCLFlBQVksTUFBTTtBQUNoQyxXQUFTLEtBQUs7QUFDaEIsR0FBRyxLQUFLO0FBRVIsV0FBVyxZQUFZO0FBQ3JCLFFBQU0sT0FBTyxDQUFDLEdBQUcsTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDO0FBQ3ZDLFFBQU0sV0FBVyxNQUFNLHNCQUErQyxlQUFlLEdBQUcsSUFBSTtBQUM1RixNQUFJLENBQUM7QUFBVTtBQUNqQixHQUFHLEdBQUc7IiwKICAibmFtZXMiOiBbImRlbGF5IiwgInBlZCIsICJhcHBlYXJhbmNlIiwgImFwcGVhcmFuY2UiXQp9Cg==
