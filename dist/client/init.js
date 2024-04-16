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

// src/client/menu/appearance/index.ts
var findModelIndex, getPedHair, getPedHeadBlendData, getHeadOverlay, getHeadStructure, getDrawables, getProps, appearance_default;
var init_appearance = __esm({
  "src/client/menu/appearance/index.ts"() {
    init_head();
    init_face();
    init_drawable();
    init_props();
    init_menu();
    findModelIndex = /* @__PURE__ */ __name((model) => exports.bl_appearance.models().findIndex((ped3) => GetHashKey(ped3) === model), "findModelIndex");
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
    appearance_default = /* @__PURE__ */ __name(async () => {
      const [headData, totals] = getHeadOverlay();
      const [drawables, drawTotal] = getDrawables();
      const [props, propTotal] = getProps();
      const model = GetEntityModel(ped);
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
var appearance, outfits;
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
    outfits = /* @__PURE__ */ ((outfits2) => {
      outfits2["useOutfit"] = "appearance:useOutfit";
      outfits2["renameOutfit"] = "appearance:renameOutfit";
      outfits2["deleteOutfit"] = "appearance:deleteOutfit";
      outfits2["saveOutfit"] = "appearance:saveOutfit";
      return outfits2;
    })(outfits || {});
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
var sendNUIEvent, delay, requestModel, resourceName, eventTimers, activeEvents, requestLocale;
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
    requestLocale = /* @__PURE__ */ __name((resourceSetName) => {
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
var playerAppearance, bl_appearance, isMenuOpen, ped, updatePed, validMenuTypes, openMenu, setAppearance, closeMenu;
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
      const id = exports.bl_appearance.config().useBridge ? exports.bl_bridge.core && exports.bl_bridge.core().getPlayerData().cid : null;
      const data = await triggerServerCallback("bl_appearance:server:getTattoos&Outfits", 1, id);
      const appearance2 = await appearance_default();
      playerAppearance = appearance2;
      playerAppearance.outfits = data.outfits;
      playerAppearance.tattoos = data.tattoos;
      sendNUIEvent("appearance:data" /* data */, {
        tabs: isArray ? type : menuTypes_default.includes(type) ? type : menuTypes_default,
        appearance: appearance2,
        blacklist: bl_appearance.blacklist(),
        tattoos: tattoos_default(),
        outfits: data.outfits,
        models: bl_appearance.models(),
        locale: await requestLocale("locale")
      });
    }, "openMenu");
    setAppearance = /* @__PURE__ */ __name(async (appearanceData) => {
      const model = appearanceData.model;
      if (model) {
        const modelHash = await requestModel(model);
        SetPlayerModel(PlayerId(), modelHash);
        await delay(150);
        SetModelAsNoLongerNeeded(modelHash);
        SetPedDefaultComponentVariation(ped);
        if (model === GetHashKey("mp_m_freemode_01"))
          SetPedHeadBlendData(ped, 0, 0, 0, 0, 0, 0, 0, 0, 0, false);
        else if (model === GetHashKey("mp_f_freemode_01"))
          SetPedHeadBlendData(ped, 45, 21, 0, 20, 15, 0, 0.3, 0.1, 0, false);
      }
      const headBlend = appearanceData.headBlend;
      if (headBlend)
        SetPedHeadBlendData(ped, headBlend.shapeFirst, headBlend.shapeSecond, headBlend.shapeThird, headBlend.skinFirst, headBlend.skinSecond, headBlend.skinThird, headBlend.shapeMix, headBlend.skinMix, headBlend.thirdMix, headBlend.hasParent);
      if (appearanceData.headStructure)
        for (const data of Object.values(appearanceData.headStructure)) {
          SetPedFaceFeature(ped, data.index, data.value);
        }
      if (appearanceData.drawables)
        for (const data of Object.values(appearanceData.drawables)) {
          if (data.index === 2)
            console.log(data.index, data.value, data.texture);
          SetPedComponentVariation(ped, data.index, data.value, data.texture, 0);
        }
      if (appearanceData.props)
        for (const data of Object.values(appearanceData.props)) {
          if (data.value === -1) {
            ClearPedProp(ped, data.index);
            return 1;
          }
          SetPedPropIndex(ped, data.index, data.value, data.texture, false);
        }
      if (appearanceData.hairColor) {
        SetPedHairColor(ped, appearanceData.hairColor.color, appearanceData.hairColor.highlight);
      }
      if (appearanceData.headOverlay)
        for (const data of Object.values(appearanceData.headOverlay)) {
          const value = data.overlayValue == -1 ? 255 : data.overlayValue;
          if (data.id === "EyeColor")
            SetPedEyeColor(ped, value);
          else {
            SetPedHeadOverlay(ped, data.index, value, data.overlayOpacity);
            SetPedHeadOverlayColor(ped, data.index, 1, data.firstColor, data.secondColor);
          }
        }
      if (appearanceData.tattoos) {
        ClearPedDecorationsLeaveScars(ped);
        for (const element of appearanceData.tattoos) {
          const tattoo = element.tattoo;
          if (tattoo) {
            AddPedDecorationFromHashes(ped, GetHashKey(tattoo.dlc), tattoo.hash);
          }
        }
      }
    }, "setAppearance");
    closeMenu = /* @__PURE__ */ __name(async (save) => {
      if (!save)
        await setAppearance(playerAppearance);
      else {
        const config = exports.bl_appearance.config();
        const appearance2 = await appearance_default();
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
          tattoos: playerAppearance.currentTattoos || []
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
        return appearance_default();
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

// src/client/menu/outfits/index.ts
var outfits_exports = {};
var actionHandlers2;
var init_outfits = __esm({
  "src/client/menu/outfits/index.ts"() {
    init_enums();
    init_menu();
    actionHandlers2 = {
      ["appearance:saveOutfit" /* saveOutfit */]: async (data) => {
        const config = exports.bl_appearance.config();
        emitNet("bl_appearance:server:saveOutfit", {
          id: config.useBridge ? exports.bl_bridge.core && exports.bl_bridge.core().getPlayerData().cid : null,
          label: data.label,
          outfit: data.outfit
        });
        return true;
      },
      ["appearance:deleteOutfit" /* deleteOutfit */]: async (model) => {
      },
      ["appearance:renameOutfit" /* renameOutfit */]: async (model) => {
      },
      ["appearance:useOutfit" /* useOutfit */]: (outfit) => {
        setAppearance(outfit);
        return true;
      }
    };
    for (const action of Object.values(outfits)) {
      RegisterNuiCallback(action, async (data, cb) => {
        const handler = actionHandlers2[action];
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
Promise.resolve().then(() => init_outfits());
RegisterCommand("openMenu", () => {
  openMenu("all");
}, false);
setTimeout(async () => {
  const args = [1, null, 3, null, null, 6];
  const response = await triggerServerCallback("test:server", 1, args);
  if (!response)
    return;
}, 100);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2RhdGEvaGVhZC50cyIsICIuLi8uLi9zcmMvZGF0YS9mYWNlLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2RyYXdhYmxlLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvbWVudS9hcHBlYXJhbmNlL2luZGV4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvbWVudS90YXR0b29zL2luZGV4LnRzIiwgIi4uLy4uL3NyYy9kYXRhL21lbnVUeXBlcy50cyIsICIuLi8uLi9zcmMvY2xpZW50L2VudW1zLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvdXRpbHMvaW5kZXgudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9jYW1lcmEvaW5kZXgudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9tZW51L2luZGV4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvbWVudS9hcHBlYXJhbmNlL2hhbmRsZXIudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9tZW51L291dGZpdHMvaW5kZXgudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCBbXHJcbiAgICBcIkJsZW1pc2hlc1wiLFxyXG4gICAgXCJGYWNpYWxIYWlyXCIsXHJcbiAgICBcIkV5ZWJyb3dzXCIsXHJcbiAgICBcIkFnZWluZ1wiLFxyXG4gICAgXCJNYWtldXBcIixcclxuICAgIFwiQmx1c2hcIixcclxuICAgIFwiQ29tcGxleGlvblwiLFxyXG4gICAgXCJTdW5EYW1hZ2VcIixcclxuICAgIFwiTGlwc3RpY2tcIixcclxuICAgIFwiTW9sZXNGcmVja2xlc1wiLFxyXG4gICAgXCJDaGVzdEhhaXJcIixcclxuICAgIFwiQm9keUJsZW1pc2hlc1wiLFxyXG4gICAgXCJBZGRCb2R5QmxlbWlzaGVzXCIsXHJcbiAgICBcIkV5ZUNvbG9yXCJcclxuXVxyXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xyXG4gICAgXCJOb3NlX1dpZHRoXCIsXHJcbiAgICBcIk5vc2VfUGVha19IZWlnaHRcIixcclxuICAgIFwiTm9zZV9QZWFrX0xlbmdodFwiLFxyXG4gICAgXCJOb3NlX0JvbmVfSGVpZ2h0XCIsXHJcbiAgICBcIk5vc2VfUGVha19Mb3dlcmluZ1wiLFxyXG4gICAgXCJOb3NlX0JvbmVfVHdpc3RcIixcclxuICAgIFwiRXllQnJvd25fSGVpZ2h0XCIsXHJcbiAgICBcIkV5ZUJyb3duX0ZvcndhcmRcIixcclxuICAgIFwiQ2hlZWtzX0JvbmVfSGlnaFwiLFxyXG4gICAgXCJDaGVla3NfQm9uZV9XaWR0aFwiLFxyXG4gICAgXCJDaGVla3NfV2lkdGhcIixcclxuICAgIFwiRXllc19PcGVubmluZ1wiLFxyXG4gICAgXCJMaXBzX1RoaWNrbmVzc1wiLFxyXG4gICAgXCJKYXdfQm9uZV9XaWR0aFwiLFxyXG4gICAgXCJKYXdfQm9uZV9CYWNrX0xlbmdodFwiLFxyXG4gICAgXCJDaGluX0JvbmVfTG93ZXJpbmdcIixcclxuICAgIFwiQ2hpbl9Cb25lX0xlbmd0aFwiLFxyXG4gICAgXCJDaGluX0JvbmVfV2lkdGhcIixcclxuICAgIFwiQ2hpbl9Ib2xlXCIsXHJcbiAgICBcIk5lY2tfVGhpa25lc3NcIlxyXG5dXHJcbiIsICJleHBvcnQgZGVmYXVsdCBbXHJcbiAgICBcImZhY2VcIixcclxuICAgIFwibWFza3NcIixcclxuICAgIFwiaGFpclwiLFxyXG4gICAgXCJ0b3Jzb3NcIixcclxuICAgIFwibGVnc1wiLFxyXG4gICAgXCJiYWdzXCIsXHJcbiAgICBcInNob2VzXCIsXHJcbiAgICBcIm5lY2tcIixcclxuICAgIFwic2hpcnRzXCIsXHJcbiAgICBcInZlc3RcIixcclxuICAgIFwiZGVjYWxzXCIsXHJcbiAgICBcImphY2tldHNcIlxyXG5dXHJcbiIsICJleHBvcnQgZGVmYXVsdCBbXHJcbiAgICBcImhhdHNcIixcclxuICAgIFwiZ2xhc3Nlc1wiLFxyXG4gICAgXCJlYXJyaW5nc1wiLFxyXG4gICAgXCJtb3V0aFwiLFxyXG4gICAgXCJsaGFuZFwiLFxyXG4gICAgXCJyaGFuZFwiLFxyXG4gICAgXCJ3YXRjaGVzXCIsXHJcbiAgICBcImJyYWNsZXRzXCJcclxuXVxyXG4iLCAiaW1wb3J0IEhFQURfT1ZFUkxBWVMgZnJvbSAnLi4vLi4vLi4vZGF0YS9oZWFkJztcclxuaW1wb3J0IEZBQ0VfRkVBVFVSRVMgZnJvbSAnLi4vLi4vLi4vZGF0YS9mYWNlJztcclxuaW1wb3J0IERSQVdBQkxFX05BTUVTIGZyb20gJy4uLy4uLy4uL2RhdGEvZHJhd2FibGUnO1xyXG5pbXBvcnQgUFJPUF9OQU1FUyBmcm9tICcuLi8uLi8uLi9kYXRhL3Byb3BzJztcclxuaW1wb3J0IHsgSGFpckRhdGEsIFBlZEhhbmRsZSwgVG90YWxEYXRhLCBEcmF3YWJsZURhdGEsIEhlYWRTdHJ1Y3R1cmVEYXRhLCBIZWFkT3ZlcmxheURhdGEsIFRBcHBlYXJhbmNlIH0gZnJvbSAnQGRhdGFUeXBlcy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgVFRhdHRvbyB9IGZyb20gJ0BkYXRhVHlwZXMvdGF0dG9vcyc7XHJcbmltcG9ydCB7cGVkfSBmcm9tICcuLic7XHJcbmltcG9ydCB7IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayB9IGZyb20gJ0B1dGlscydcclxuXHJcbmNvbnN0IGZpbmRNb2RlbEluZGV4ID0gKG1vZGVsOiBQZWRIYW5kbGUpID0+IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5tb2RlbHMoKS5maW5kSW5kZXgoKHBlZDogc3RyaW5nKSA9PiBHZXRIYXNoS2V5KHBlZCkgPT09IG1vZGVsKTtcclxuXHJcbmNvbnN0IGdldFBlZEhhaXIgPSAoKTogSGFpckRhdGEgPT4gKHtcclxuICAgIGNvbG9yOiBHZXRQZWRIYWlyQ29sb3IocGVkKSxcclxuICAgIGhpZ2hsaWdodDogR2V0UGVkSGFpckhpZ2hsaWdodENvbG9yKHBlZClcclxufSk7XHJcblxyXG5jb25zdCBnZXRQZWRIZWFkQmxlbmREYXRhID0gKCkgPT4ge1xyXG4gICAgY29uc3QgaGVhZGJsZW5kRGF0YSA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5HZXRIZWFkQmxlbmREYXRhKHBlZClcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNoYXBlRmlyc3Q6IGhlYWRibGVuZERhdGEuRmlyc3RGYWNlU2hhcGUsICAgLy8gZmF0aGVyXHJcbiAgICAgICAgc2hhcGVTZWNvbmQ6IGhlYWRibGVuZERhdGEuU2Vjb25kRmFjZVNoYXBlLCAvLyBtb3RoZXJcclxuICAgICAgICBzaGFwZVRoaXJkOiBoZWFkYmxlbmREYXRhLlRoaXJkRmFjZVNoYXBlLFxyXG5cclxuICAgICAgICBza2luRmlyc3Q6IGhlYWRibGVuZERhdGEuRmlyc3RTa2luVG9uZSxcclxuICAgICAgICBza2luU2Vjb25kOiBoZWFkYmxlbmREYXRhLlNlY29uZFNraW5Ub25lLFxyXG4gICAgICAgIHNraW5UaGlyZDogaGVhZGJsZW5kRGF0YS5UaGlyZFNraW5Ub25lLFxyXG5cclxuICAgICAgICBzaGFwZU1peDogaGVhZGJsZW5kRGF0YS5QYXJlbnRGYWNlU2hhcGVQZXJjZW50LCAvLyByZXNlbWJsYW5jZVxyXG5cclxuICAgICAgICB0aGlyZE1peDogaGVhZGJsZW5kRGF0YS5QYXJlbnRUaGlyZFVua1BlcmNlbnQsXHJcbiAgICAgICAgc2tpbk1peDogaGVhZGJsZW5kRGF0YS5QYXJlbnRTa2luVG9uZVBlcmNlbnQsICAgLy8gc2tpbnBlcmNlbnRcclxuXHJcbiAgICAgICAgaGFzUGFyZW50OiBoZWFkYmxlbmREYXRhLklzUGFyZW50SW5oZXJpdGFuY2UsXHJcbiAgICB9O1xyXG59O1xyXG5cclxuY29uc3QgZ2V0SGVhZE92ZXJsYXkgPSAoKTogW1JlY29yZDxzdHJpbmcsIEhlYWRPdmVybGF5RGF0YT4sIFJlY29yZDxzdHJpbmcsIG51bWJlcj5dID0+IHtcclxuICAgIGxldCB0b3RhbHM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcclxuICAgIGxldCBoZWFkRGF0YTogUmVjb3JkPHN0cmluZywgSGVhZE92ZXJsYXlEYXRhPiA9IHt9O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgSEVBRF9PVkVSTEFZUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBIRUFEX09WRVJMQVlTW2ldO1xyXG4gICAgICAgIHRvdGFsc1tvdmVybGF5XSA9IEdldE51bUhlYWRPdmVybGF5VmFsdWVzKGkpO1xyXG5cclxuICAgICAgICBpZiAob3ZlcmxheSA9PT0gXCJFeWVDb2xvclwiKSB7XHJcbiAgICAgICAgICAgIGhlYWREYXRhW292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogR2V0UGVkRXllQ29sb3IocGVkKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFtfLCBvdmVybGF5VmFsdWUsIGNvbG91clR5cGUsIGZpcnN0Q29sb3IsIHNlY29uZENvbG9yLCBvdmVybGF5T3BhY2l0eV0gPSBHZXRQZWRIZWFkT3ZlcmxheURhdGEocGVkLCBpKTtcclxuICAgICAgICAgICAgaGVhZERhdGFbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBpIC0gMSxcclxuICAgICAgICAgICAgICAgIG92ZXJsYXlWYWx1ZTogb3ZlcmxheVZhbHVlID09PSAyNTUgPyAtMSA6IG92ZXJsYXlWYWx1ZSxcclxuICAgICAgICAgICAgICAgIGNvbG91clR5cGU6IGNvbG91clR5cGUsXHJcbiAgICAgICAgICAgICAgICBmaXJzdENvbG9yOiBmaXJzdENvbG9yLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kQ29sb3I6IHNlY29uZENvbG9yLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheU9wYWNpdHk6IG92ZXJsYXlPcGFjaXR5XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbaGVhZERhdGEsIHRvdGFsc107XHJcbn07XHJcblxyXG5jb25zdCBnZXRIZWFkU3RydWN0dXJlID0gKCk6IFJlY29yZDxzdHJpbmcsIEhlYWRTdHJ1Y3R1cmVEYXRhPiB8IHVuZGVmaW5lZCA9PiB7XHJcbiAgICBjb25zdCBwZWRNb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZClcclxuXHJcbiAgICBpZiAocGVkTW9kZWwgIT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpICYmIHBlZE1vZGVsICE9PSBHZXRIYXNoS2V5KFwibXBfZl9mcmVlbW9kZV8wMVwiKSkgcmV0dXJuXHJcblxyXG4gICAgbGV0IGZhY2VTdHJ1Y3QgPSB7fVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBGQUNFX0ZFQVRVUkVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEZBQ0VfRkVBVFVSRVNbaV1cclxuICAgICAgICBmYWNlU3RydWN0W292ZXJsYXldID0ge1xyXG4gICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWRGYWNlRmVhdHVyZShwZWQsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWNlU3RydWN0XHJcbn1cclxuXHJcbmNvbnN0IGdldERyYXdhYmxlcyA9ICgpOiBbUmVjb3JkPHN0cmluZywgRHJhd2FibGVEYXRhPiwgUmVjb3JkPHN0cmluZywgVG90YWxEYXRhPl0gPT4ge1xyXG4gICAgbGV0IGRyYXdhYmxlcyA9IHt9XHJcbiAgICBsZXQgdG90YWxEcmF3YWJsZXMgPSB7fVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRFJBV0FCTEVfTkFNRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gRFJBV0FCTEVfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpKVxyXG5cclxuICAgICAgICB0b3RhbERyYXdhYmxlc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWREcmF3YWJsZVZhcmlhdGlvbnMocGVkLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZXM6IEdldE51bWJlck9mUGVkVGV4dHVyZVZhcmlhdGlvbnMocGVkLCBpLCBjdXJyZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICBkcmF3YWJsZXNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZERyYXdhYmxlVmFyaWF0aW9uKHBlZCwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFRleHR1cmVWYXJpYXRpb24ocGVkLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW2RyYXdhYmxlcywgdG90YWxEcmF3YWJsZXNdXHJcbn1cclxuXHJcbmNvbnN0IGdldFByb3BzID0gKCk6IFtSZWNvcmQ8c3RyaW5nLCBEcmF3YWJsZURhdGE+LCBSZWNvcmQ8c3RyaW5nLCBUb3RhbERhdGE+XSA9PiB7XHJcbiAgICBsZXQgcHJvcHMgPSB7fVxyXG4gICAgbGV0IHRvdGFsUHJvcHMgPSB7fVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgUFJPUF9OQU1FUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBQUk9QX05BTUVTW2ldXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZFByb3BJbmRleChwZWQsIGkpXHJcblxyXG4gICAgICAgIHRvdGFsUHJvcHNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkUHJvcERyYXdhYmxlVmFyaWF0aW9ucyhwZWQsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogR2V0TnVtYmVyT2ZQZWRQcm9wVGV4dHVyZVZhcmlhdGlvbnMocGVkLCBpLCBjdXJyZW50KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvcHNbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBuYW1lLFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZFByb3BJbmRleChwZWQsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiBHZXRQZWRQcm9wVGV4dHVyZUluZGV4KHBlZCwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtwcm9wcywgdG90YWxQcm9wc11cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKCk6IFByb21pc2U8VEFwcGVhcmFuY2U+ID0+IHtcclxuICAgIGNvbnN0IFtoZWFkRGF0YSwgdG90YWxzXSA9IGdldEhlYWRPdmVybGF5KClcclxuICAgIGNvbnN0IFtkcmF3YWJsZXMsIGRyYXdUb3RhbF0gPSBnZXREcmF3YWJsZXMoKVxyXG4gICAgY29uc3QgW3Byb3BzLCBwcm9wVG90YWxdID0gZ2V0UHJvcHMoKVxyXG4gICAgY29uc3QgbW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWQpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBtb2RlbEluZGV4OiBmaW5kTW9kZWxJbmRleChtb2RlbCksXHJcbiAgICAgICAgbW9kZWw6IG1vZGVsLFxyXG4gICAgICAgIGhhaXJDb2xvcjogZ2V0UGVkSGFpcigpLFxyXG4gICAgICAgIGhlYWRCbGVuZDogZ2V0UGVkSGVhZEJsZW5kRGF0YSgpLFxyXG4gICAgICAgIGhlYWRPdmVybGF5OiBoZWFkRGF0YSxcclxuICAgICAgICBoZWFkT3ZlcmxheVRvdGFsOiB0b3RhbHMsXHJcbiAgICAgICAgaGVhZFN0cnVjdHVyZTogZ2V0SGVhZFN0cnVjdHVyZSgpLFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgICAgICBkcmF3VG90YWw6IGRyYXdUb3RhbCxcclxuICAgICAgICBwcm9wVG90YWw6IHByb3BUb3RhbCxcclxuICAgIH1cclxufSIsICJpbXBvcnQgeyBwZWQgfSBmcm9tICcuLy4uLydcclxuaW1wb3J0IHsgVFpvbmVUYXR0b28gfSBmcm9tICdAZGF0YVR5cGVzL3RhdHRvb3MnO1xyXG5pbXBvcnQgeyBkZWJ1Z2RhdGEgfSBmcm9tICdAdXRpbHMnO1xyXG5cclxuY29uc3QgZ2V0VGF0dG9vcyA9ICgpOiBUWm9uZVRhdHRvb1tdID0+IHtcclxuICAgIGNvbnN0IFtUQVRUT09fTElTVCwgVEFUVE9PX0NBVEVHT1JJRVNdID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLnRhdHRvb3MoKVxyXG4gICAgY29uc3QgdGF0dG9vWm9uZXM6IFRab25lVGF0dG9vW10gPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFRBVFRPT19DQVRFR09SSUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBUQVRUT09fQ0FURUdPUklFU1tpXTtcclxuXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBjYXRlZ29yeS5pbmRleFxyXG4gICAgICAgIGNvbnN0IHpvbmUgPSBjYXRlZ29yeS56b25lXHJcbiAgICAgICAgY29uc3QgbGFiZWwgPSBjYXRlZ29yeS5sYWJlbFxyXG5cclxuICAgICAgICB0YXR0b29ab25lc1tpbmRleF0gPSB7XHJcbiAgICAgICAgICAgIHpvbmUsXHJcbiAgICAgICAgICAgIGxhYmVsLFxyXG4gICAgICAgICAgICB6b25lSW5kZXg6IGluZGV4LFxyXG4gICAgICAgICAgICBkbGNzOiBbXSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IFRBVFRPT19MSVNULmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRsY0RhdGEgPSBUQVRUT09fTElTVFtqXTtcclxuICAgICAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdLmRsY3Nbal0gPSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZGxjRGF0YS5kbGMsXHJcbiAgICAgICAgICAgICAgICBkbGNJbmRleDogaixcclxuICAgICAgICAgICAgICAgIHRhdHRvb3M6IFtdLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0ZlbWFsZSA9IEdldEVudGl0eU1vZGVsKHBlZCkgPT09IEdldEhhc2hLZXkoJ21wX2ZfZnJlZW1vZGVfMDEnKTtcclxuXHJcbiAgICBmb3IgKGxldCBkbGNJbmRleCA9IDA7IGRsY0luZGV4IDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBkbGNJbmRleCsrKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IFRBVFRPT19MSVNUW2RsY0luZGV4XTtcclxuICAgICAgICBjb25zdCB7IGRsYywgdGF0dG9vcyB9ID0gZGF0YTtcclxuICAgICAgICBjb25zdCBkbGNIYXNoID0gR2V0SGFzaEtleShkbGMpO1xyXG4gICAgICAgIGNvbnN0IHRhdHRvb0RhdGFMaXN0ID0gdGF0dG9vcyB8fCBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXR0b29EYXRhTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gdGF0dG9vRGF0YUxpc3RbaV07XHJcbiAgICAgICAgICAgIGxldCB0YXR0b286IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbG93ZXJUYXR0b28gPSB0YXR0b29EYXRhLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzRmVtYWxlVGF0dG9vID0gbG93ZXJUYXR0b28uaW5jbHVkZXMoJ19mJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNGZW1hbGVUYXR0b28gJiYgaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGE7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzRmVtYWxlVGF0dG9vICYmICFpc0ZlbWFsZSkge1xyXG4gICAgICAgICAgICAgICAgdGF0dG9vID0gdGF0dG9vRGF0YTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRhdHRvbykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFzaCA9IEdldEhhc2hLZXkodGF0dG9vKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHpvbmUgPSBHZXRQZWREZWNvcmF0aW9uWm9uZUZyb21IYXNoZXMoZGxjSGFzaCwgaGFzaCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHpvbmUgIT09IC0xICYmIGhhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB6b25lVGF0dG9vcyA9IHRhdHRvb1pvbmVzW3pvbmVdLmRsY3NbZGxjSW5kZXhdLnRhdHRvb3M7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHpvbmVUYXR0b29zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGF0dG9vLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b25lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkbGMsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRhdHRvb1pvbmVzO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnZXRUYXR0b29zIiwgImV4cG9ydCBkZWZhdWx0IFsnaGVyaXRhZ2UnLCAnaGFpcicsICdjbG90aGVzJywgJ2FjY2Vzc29yaWVzJywgJ2ZhY2UnLCAnbWFrZXVwJywgJ291dGZpdHMnLCAndGF0dG9vcyddXHJcbiIsICJleHBvcnQgZW51bSBzZW5kIHtcclxuICAgIHZpc2libGUgPSAnYXBwZWFyYW5jZTp2aXNpYmxlJyxcclxuICAgIGRhdGEgPSAnYXBwZWFyYW5jZTpkYXRhJyxcclxufVxyXG5cclxuZXhwb3J0IGVudW0gYXBwZWFyYW5jZSB7XHJcbiAgICBzZXRNb2RlbCA9ICdhcHBlYXJhbmNlOnNldE1vZGVsJyxcclxuICAgIHNldEhlYWRTdHJ1Y3R1cmUgPSAnYXBwZWFyYW5jZTpzZXRIZWFkU3RydWN0dXJlJyxcclxuICAgIHNldEhlYWRPdmVybGF5ID0gJ2FwcGVhcmFuY2U6c2V0SGVhZE92ZXJsYXknLFxyXG4gICAgc2V0SGVhZEJsZW5kID0gJ2FwcGVhcmFuY2U6c2V0SGVhZEJsZW5kJyxcclxuICAgIHNldFByb3AgPSAnYXBwZWFyYW5jZTpzZXRQcm9wJyxcclxuICAgIHNldERyYXdhYmxlID0gJ2FwcGVhcmFuY2U6c2V0RHJhd2FibGUnLFxyXG4gICAgc2V0VGF0dG9vcyA9ICdhcHBlYXJhbmNlOnNldFRhdHRvb3MnLFxyXG4gICAgZ2V0TW9kZWxUYXR0b29zID0gJ2FwcGVhcmFuY2U6Z2V0TW9kZWxUYXR0b29zJyxcclxufVxyXG5cclxuZXhwb3J0IGVudW0gb3V0Zml0cyB7XHJcbiAgICB1c2VPdXRmaXQgPSAnYXBwZWFyYW5jZTp1c2VPdXRmaXQnLFxyXG4gICAgcmVuYW1lT3V0Zml0ID0gJ2FwcGVhcmFuY2U6cmVuYW1lT3V0Zml0JyxcclxuICAgIGRlbGV0ZU91dGZpdCA9ICdhcHBlYXJhbmNlOmRlbGV0ZU91dGZpdCcsXHJcbiAgICBzYXZlT3V0Zml0ID0gJ2FwcGVhcmFuY2U6c2F2ZU91dGZpdCcsXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIHJlY2VpdmUge1xyXG4gICAgY2xvc2UgPSAnYXBwZWFyYW5jZTpjbG9zZScsXHJcblxyXG4gICAgdG9nZ2xlSXRlbSA9ICdhcHBlYXJhbmNlOnRvZ2dsZUl0ZW0nLFxyXG5cclxuICAgIHNhdmUgPSAnYXBwZWFyYW5jZTpzYXZlJyxcclxuICAgIGNhbmNlbCA9ICdhcHBlYXJhbmNlOmNhbmNlbCcsXHJcblxyXG4gICAgY2FtWm9vbSA9ICdhcHBlYXJhbmNlOmNhbVpvb20nLFxyXG4gICAgY2FtTW92ZSA9ICdhcHBlYXJhbmNlOmNhbU1vdmUnLFxyXG4gICAgY2FtU2Nyb2xsID0gJ2FwcGVhcmFuY2U6Y2FtU2Nyb2xsJyxcclxufVxyXG4iLCAiZXhwb3J0IGNvbnN0IGRlYnVnZGF0YSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGEsIChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0sIDIpKVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2VuZE5VSUV2ZW50ID0gKGFjdGlvbjogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcclxuICAgIFNlbmROVUlNZXNzYWdlKHtcclxuICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TW9kZWwgPSBhc3luYyAobW9kZWw6IHN0cmluZyB8IG51bWJlcik6IFByb21pc2U8bnVtYmVyPiA9PiB7XHJcbiAgICBsZXQgbW9kZWxIYXNoOiBudW1iZXIgPSB0eXBlb2YgbW9kZWwgPT09ICdudW1iZXInID8gbW9kZWwgOiBHZXRIYXNoS2V5KG1vZGVsKVxyXG5cclxuICAgIGlmICghSXNNb2RlbFZhbGlkKG1vZGVsSGFzaCkpIHtcclxuICAgICAgICBleHBvcnRzLmJsX2JyaWRnZS5ub3RpZnkoKSh7XHJcbiAgICAgICAgICAgIHRpdGxlOiAnSW52YWxpZCBtb2RlbCEnLFxyXG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxyXG4gICAgICAgICAgICBkdXJhdGlvbjogMTAwMFxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgYXR0ZW1wdGVkIHRvIGxvYWQgaW52YWxpZCBtb2RlbCAnJHttb2RlbH0nYCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKEhhc01vZGVsTG9hZGVkKG1vZGVsSGFzaCkpIHJldHVybiBtb2RlbEhhc2hcclxuICAgIFxyXG4gICAgUmVxdWVzdE1vZGVsKG1vZGVsSGFzaCk7XHJcblxyXG4gICAgY29uc3Qgd2FpdEZvck1vZGVsTG9hZGVkID0gKCk6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoSGFzTW9kZWxMb2FkZWQobW9kZWxIYXNoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgYXdhaXQgd2FpdEZvck1vZGVsTG9hZGVkKCk7XHJcblxyXG4gICAgcmV0dXJuIG1vZGVsSGFzaDtcclxufTtcclxuXHJcblxyXG4vL2NhbGxiYWNrXHJcbi8vaHR0cHM6Ly9naXRodWIuY29tL292ZXJleHRlbmRlZC9veF9saWIvYmxvYi9tYXN0ZXIvcGFja2FnZS9jbGllbnQvcmVzb3VyY2UvY2FsbGJhY2svaW5kZXgudHNcclxuXHJcbmNvbnN0IHJlc291cmNlTmFtZSA9IEdldEN1cnJlbnRSZXNvdXJjZU5hbWUoKVxyXG5jb25zdCBldmVudFRpbWVyczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xyXG5jb25zdCBhY3RpdmVFdmVudHM6IFJlY29yZDxzdHJpbmcsICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4gPSB7fTtcclxuXHJcbmZ1bmN0aW9uIGV2ZW50VGltZXIoZXZlbnROYW1lOiBzdHJpbmcsIGRlbGF5OiBudW1iZXIgfCBudWxsKSB7XHJcbiAgICBpZiAoZGVsYXkgJiYgZGVsYXkgPiAwKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBHZXRHYW1lVGltZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKChldmVudFRpbWVyc1tldmVudE5hbWVdIHx8IDApID4gY3VycmVudFRpbWUpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgZXZlbnRUaW1lcnNbZXZlbnROYW1lXSA9IGN1cnJlbnRUaW1lICsgZGVsYXk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbm9uTmV0KGBfX294X2NiXyR7cmVzb3VyY2VOYW1lfWAsIChrZXk6IHN0cmluZywgLi4uYXJnczogYW55KSA9PiB7XHJcbiAgICBjb25zdCByZXNvbHZlID0gYWN0aXZlRXZlbnRzW2tleV07XHJcbiAgICByZXR1cm4gcmVzb2x2ZSAmJiByZXNvbHZlKC4uLmFyZ3MpO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VCA9IHVua25vd24+KFxyXG4gICAgZXZlbnROYW1lOiBzdHJpbmcsXHJcbiAgICBkZWxheTogbnVtYmVyIHwgbnVsbCxcclxuICAgIC4uLmFyZ3M6IGFueVxyXG4pOiBQcm9taXNlPFQ+IHwgdm9pZCB7XHJcbiAgICBpZiAoIWV2ZW50VGltZXIoZXZlbnROYW1lLCBkZWxheSkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGtleTogc3RyaW5nO1xyXG5cclxuICAgIGRvIHtcclxuICAgICAgICBrZXkgPSBgJHtldmVudE5hbWV9OiR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDEwMDAwMCArIDEpKX1gO1xyXG4gICAgfSB3aGlsZSAoYWN0aXZlRXZlbnRzW2tleV0pO1xyXG5cclxuICAgIGVtaXROZXQoYF9fb3hfY2JfJHtldmVudE5hbWV9YCwgcmVzb3VyY2VOYW1lLCBrZXksIC4uLmFyZ3MpO1xyXG5cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGFjdGl2ZUV2ZW50c1trZXldID0gcmVzb2x2ZTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuLy9sb2NhbGVcclxuXHJcbmV4cG9ydCBjb25zdCByZXF1ZXN0TG9jYWxlID0gKHJlc291cmNlU2V0TmFtZTogc3RyaW5nKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICBjb25zdCBjaGVja1Jlc291cmNlRmlsZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKFJlcXVlc3RSZXNvdXJjZUZpbGVTZXQocmVzb3VyY2VTZXROYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudExhbiA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5jb25maWcoKS5sb2NhbGVcclxuICAgICAgICAgICAgICAgIGxldCBsb2NhbGVGaWxlQ29udGVudCA9IExvYWRSZXNvdXJjZUZpbGUocmVzb3VyY2VOYW1lLCBgbG9jYWxlLyR7Y3VycmVudExhbn0uanNvbmApO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbGVGaWxlQ29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y3VycmVudExhbn0uanNvbiBub3QgZm91bmQgaW4gbG9jYWxlLCBwbGVhc2UgdmVyaWZ5ISwgd2UgdXNlZCBlbmdsaXNoIGZvciBub3chYClcclxuICAgICAgICAgICAgICAgICAgICBsb2NhbGVGaWxlQ29udGVudCA9IExvYWRSZXNvdXJjZUZpbGUocmVzb3VyY2VOYW1lLCBgbG9jYWxlL2VuLmpzb25gKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShsb2NhbGVGaWxlQ29udGVudCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGNoZWNrUmVzb3VyY2VGaWxlLCAxMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNoZWNrUmVzb3VyY2VGaWxlKCk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGxvY2FsZSA9IGFzeW5jIChpZDogc3RyaW5nLCAuLi5hcmdzOiBzdHJpbmdbXSkgPT4ge1xyXG4gICAgY29uc3QgbG9jYWxlID0gYXdhaXQgcmVxdWVzdExvY2FsZSgnbG9jYWxlJyk7XHJcbiAgICBsZXQgYXJnSW5kZXggPSAwO1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IGxvY2FsZVtpZF0ucmVwbGFjZSgvJXMvZywgKG1hdGNoOiBzdHJpbmcpID0+IGFyZ0luZGV4IDwgYXJncy5sZW5ndGggPyBhcmdzW2FyZ0luZGV4XSA6IG1hdGNoKTtcclxuICAgIHJldHVybiByZXN1bHRcclxufVxyXG4iLCAiaW1wb3J0IHsgQ2FtZXJhLCBWZWN0b3IzLCBDYW1lcmFCb25lcyB9IGZyb20gJ0BkYXRhVHlwZXMvY2FtZXJhJztcclxuaW1wb3J0IHtwZWR9IGZyb20gJy4vLi4vbWVudSc7XHJcbmltcG9ydCB7IGRlbGF5fSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IHJlY2VpdmUgfSBmcm9tICdAZW51bXMnO1xyXG5cclxubGV0IHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGNhbURpc3RhbmNlOiBudW1iZXIgPSAxLjg7XHJcbmxldCBjYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgYW5nbGVZOiBudW1iZXIgPSAwLjA7XHJcbmxldCBhbmdsZVo6IG51bWJlciA9IDAuMDtcclxubGV0IHRhcmdldENvb3JkczogVmVjdG9yMyB8IG51bGwgPSBudWxsO1xyXG5sZXQgb2xkQ2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGNoYW5naW5nQ2FtOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBsYXN0WDogbnVtYmVyID0gMDtcclxubGV0IGN1cnJlbnRCb25lOiBrZXlvZiBDYW1lcmFCb25lcyA9ICdoZWFkJ1xyXG5cclxuY29uc3QgQ2FtZXJhQm9uZXM6IENhbWVyYUJvbmVzID0ge1xyXG4gICAgaGVhZDogMzEwODYsXHJcbiAgICB0b3JzbzogMjQ4MTgsXHJcbiAgICBsZWdzOiAxNDIwMSxcclxufTtcclxuXHJcbmNvbnN0IGNvcyA9IChkZWdyZWVzOiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG4gICAgcmV0dXJuIE1hdGguY29zKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59XHJcblxyXG5jb25zdCBzaW4gPSAoZGVncmVlczogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuICAgIHJldHVybiBNYXRoLnNpbigoZGVncmVlcyAqIE1hdGguUEkpIC8gMTgwKTtcclxufVxyXG5cclxuY29uc3QgZ2V0QW5nbGVzID0gKCk6IG51bWJlcltdID0+IHtcclxuICAgIGNvbnN0IHggPSgoY29zKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSkgKyAoY29zKGFuZ2xlWSkgKiBjb3MoYW5nbGVaKSkpIC8gMiAqIGNhbURpc3RhbmNlO1xyXG4gICAgY29uc3QgeSA9ICgoc2luKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSkgKyAoY29zKGFuZ2xlWSkgKiBzaW4oYW5nbGVaKSkpIC8gMiAqIGNhbURpc3RhbmNlO1xyXG4gICAgY29uc3QgeiA9IHNpbihhbmdsZVkpICogY2FtRGlzdGFuY2U7XHJcblxyXG4gICAgcmV0dXJuIFt4LCB5LCB6XVxyXG59XHJcblxyXG5cclxuY29uc3Qgc2V0Q2FtUG9zaXRpb24gPSAobW91c2VYPzogbnVtYmVyLCBtb3VzZVk/OiBudW1iZXIpOiB2b2lkID0+IHtcclxuICAgIGlmICghcnVubmluZyB8fCAhdGFyZ2V0Q29vcmRzIHx8IGNoYW5naW5nQ2FtKSByZXR1cm47XHJcblxyXG4gICAgbW91c2VYID0gbW91c2VYID8/IDAuMDtcclxuICAgIG1vdXNlWSA9IG1vdXNlWSA/PyAwLjA7XHJcblxyXG4gICAgYW5nbGVaIC09IG1vdXNlWDtcclxuICAgIGFuZ2xlWSArPSBtb3VzZVk7XHJcbiAgICBhbmdsZVkgPSBNYXRoLm1pbihNYXRoLm1heChhbmdsZVksIDAuMCksIDg5LjApO1xyXG5cclxuICAgIGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpXHJcblxyXG4gICAgU2V0Q2FtQ29vcmQoY2FtLCB0YXJnZXRDb29yZHMueCArIHgsIHRhcmdldENvb3Jkcy55ICsgeSwgdGFyZ2V0Q29vcmRzLnogKyB6KVxyXG4gICAgUG9pbnRDYW1BdENvb3JkKGNhbSwgdGFyZ2V0Q29vcmRzLngsIHRhcmdldENvb3Jkcy55LCB0YXJnZXRDb29yZHMueilcclxufVxyXG5cclxuY29uc3QgbW92ZUNhbWVyYSA9IGFzeW5jIChjb29yZHM6IFZlY3RvcjMsIGRpc3RhbmNlPzogbnVtYmVyKSA9PiB7XHJcbiAgICBjb25zdCBoZWFkaW5nOiBudW1iZXIgPSBHZXRFbnRpdHlIZWFkaW5nKHBlZCkgKyA5NDtcclxuICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgPz8gMS4wO1xyXG5cclxuICAgIGNoYW5naW5nQ2FtID0gdHJ1ZTtcclxuICAgIGNhbURpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICBhbmdsZVogPSBoZWFkaW5nO1xyXG5cclxuICAgIGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpXHJcblxyXG4gICAgY29uc3QgbmV3Y2FtOiBDYW1lcmEgPSBDcmVhdGVDYW1XaXRoUGFyYW1zKFxyXG4gICAgICAgIFwiREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkFcIixcclxuICAgICAgICBjb29yZHMueCArIHgsXHJcbiAgICAgICAgY29vcmRzLnkgKyB5LFxyXG4gICAgICAgIGNvb3Jkcy56ICsgeixcclxuICAgICAgICAwLjAsXHJcbiAgICAgICAgMC4wLFxyXG4gICAgICAgIDAuMCxcclxuICAgICAgICA3MC4wLFxyXG4gICAgICAgIGZhbHNlLFxyXG4gICAgICAgIDBcclxuICAgICk7XHJcblxyXG4gICAgdGFyZ2V0Q29vcmRzID0gY29vcmRzO1xyXG4gICAgY2hhbmdpbmdDYW0gPSBmYWxzZTtcclxuICAgIG9sZENhbSA9IGNhbVxyXG4gICAgY2FtID0gbmV3Y2FtO1xyXG5cclxuICAgIFBvaW50Q2FtQXRDb29yZChuZXdjYW0sIGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnopO1xyXG4gICAgU2V0Q2FtQWN0aXZlV2l0aEludGVycChuZXdjYW0sIG9sZENhbSwgMjUwLCAwLCAwKTtcclxuXHJcbiAgICBhd2FpdCBkZWxheSgyNTApXHJcblxyXG4gICAgU2V0Q2FtVXNlU2hhbGxvd0RvZk1vZGUobmV3Y2FtLCB0cnVlKTtcclxuICAgIFNldENhbU5lYXJEb2YobmV3Y2FtLCAwLjQpO1xyXG4gICAgU2V0Q2FtRmFyRG9mKG5ld2NhbSwgMS4yKTtcclxuICAgIFNldENhbURvZlN0cmVuZ3RoKG5ld2NhbSwgMC4zKTtcclxuICAgIHVzZUhpRG9mKG5ld2NhbSk7XHJcblxyXG4gICAgRGVzdHJveUNhbShvbGRDYW0sIHRydWUpO1xyXG59XHJcblxyXG5jb25zdCB1c2VIaURvZiA9IChjdXJyZW50Y2FtOiBDYW1lcmEpID0+IHtcclxuICAgIGlmICghKERvZXNDYW1FeGlzdChjYW0pICYmIGN1cnJlbnRjYW0gPT0gY2FtKSkgcmV0dXJuO1xyXG4gICAgU2V0VXNlSGlEb2YoKTtcclxuICAgIHNldFRpbWVvdXQodXNlSGlEb2YsIDApO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc3RhcnRDYW1lcmEgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAocnVubmluZykgcmV0dXJuO1xyXG4gICAgcnVubmluZyA9IHRydWU7XHJcbiAgICBjYW1EaXN0YW5jZSA9IDEuMDtcclxuICAgIGNhbSA9IENyZWF0ZUNhbShcIkRFRkFVTFRfU0NSSVBURURfQ0FNRVJBXCIsIHRydWUpO1xyXG4gICAgY29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCAzMTA4NiwgMC4wLCAwLjAsIDAuMClcclxuICAgIFNldENhbUNvb3JkKGNhbSwgeCwgeSwgeilcclxuICAgIFJlbmRlclNjcmlwdENhbXModHJ1ZSwgdHJ1ZSwgMTAwMCwgdHJ1ZSwgdHJ1ZSk7XHJcbiAgICBtb3ZlQ2FtZXJhKHt4OiB4LCB5OiB5LCB6OiB6fSwgY2FtRGlzdGFuY2UpO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc3RvcENhbWVyYSA9ICgpOiB2b2lkID0+IHtcclxuICAgIGlmICghcnVubmluZykgcmV0dXJuO1xyXG4gICAgcnVubmluZyA9IGZhbHNlO1xyXG5cclxuICAgIFJlbmRlclNjcmlwdENhbXMoZmFsc2UsIHRydWUsIDI1MCwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgRGVzdHJveUNhbShjYW0sIHRydWUpO1xyXG4gICAgY2FtID0gbnVsbDtcclxuICAgIHRhcmdldENvb3JkcyA9IG51bGw7XHJcbn1cclxuXHJcbmNvbnN0IHNldENhbWVyYSA9ICh0eXBlPzoga2V5b2YgQ2FtZXJhQm9uZXMpOiB2b2lkID0+IHtcclxuICAgIGNvbnN0IGJvbmU6IG51bWJlciB8IHVuZGVmaW5lZCA9IENhbWVyYUJvbmVzW3R5cGVdO1xyXG4gICAgaWYgKGN1cnJlbnRCb25lID09IHR5cGUpIHJldHVybjtcclxuICAgIGNvbnN0IFt4LCB5LCB6XTogbnVtYmVyW10gPSBib25lID8gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmUsIDAuMCwgMC4wLCBib25lID09PSAxNDIwMSA/IDAuMiA6IDAuMCkgOiBHZXRFbnRpdHlDb29yZHMocGVkLCBmYWxzZSk7XHJcblxyXG4gICAgbW92ZUNhbWVyYSh7XHJcbiAgICAgICAgeDogeCwgXHJcbiAgICAgICAgeTogeSwgXHJcbiAgICAgICAgejogeiArIDAuMFxyXG4gICAgfSwgMS4wKTtcclxuXHJcbiAgICBjdXJyZW50Qm9uZSA9IHR5cGU7XHJcbn1cclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2socmVjZWl2ZS5jYW1Nb3ZlLCAoZGF0YSwgY2IpID0+IHtcclxuICAgIGNiKDEpXHJcbiAgICBsZXQgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpO1xyXG4gICAgaWYgKGxhc3RYID09IGRhdGEueCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGhlYWRpbmcgPSBkYXRhLnggPiBsYXN0WCA/IGhlYWRpbmcgKyA1IDogaGVhZGluZyAtIDU7XHJcbiAgICBTZXRFbnRpdHlIZWFkaW5nKHBlZCwgaGVhZGluZyk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhyZWNlaXZlLmNhbVNjcm9sbCwgKHR5cGU6IG51bWJlciwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgIHNldENhbWVyYShcImxlZ3NcIik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKFwiaGVhZFwiKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKHJlY2VpdmUuY2FtWm9vbSwgKGRhdGEsIGNiKSA9PiB7XHJcbiAgICBpZiAoZGF0YSA9PT0gXCJkb3duXCIpIHtcclxuICAgICAgICBjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgKyAwLjA1O1xyXG4gICAgICAgIGNhbURpc3RhbmNlID0gbmV3RGlzdGFuY2UgPj0gMS4wID8gMS4wIDogbmV3RGlzdGFuY2U7XHJcbiAgICB9IGVsc2UgaWYgKGRhdGEgPT09IFwidXBcIikge1xyXG4gICAgICAgIGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSAtIDAuMDU7XHJcbiAgICAgICAgY2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA8PSAwLjM1ID8gMC4zNSA6IG5ld0Rpc3RhbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbURpc3RhbmNlID0gY2FtRGlzdGFuY2U7XHJcbiAgICBzZXRDYW1Qb3NpdGlvbigpO1xyXG4gICAgY2IoMSk7XHJcbn0pO1xyXG5cclxuIiwgImltcG9ydCBnZXRBcHBlYXJhbmNlIGZyb20gJy4vYXBwZWFyYW5jZSdcclxuaW1wb3J0IGdldFRhdHRvb3MgZnJvbSAnLi90YXR0b29zJ1xyXG5pbXBvcnQgeyBUQXBwZWFyYW5jZX0gZnJvbSAnQGRhdGFUeXBlcy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgT3V0Zml0fSBmcm9tICdAZGF0YVR5cGVzL291dGZpdHMnO1xyXG5pbXBvcnQgeyBUVGF0dG9vfSBmcm9tICdAZGF0YVR5cGVzL3RhdHRvb3MnO1xyXG5pbXBvcnQgbWVudVR5cGVzIGZyb20gJy4uLy4uL2RhdGEvbWVudVR5cGVzJztcclxuaW1wb3J0IHsgc2VuZCwgcmVjZWl2ZSB9IGZyb20gJ0BlbnVtcydcclxuaW1wb3J0IHsgc2VuZE5VSUV2ZW50LCBkZWxheSwgcmVxdWVzdExvY2FsZSwgcmVxdWVzdE1vZGVsLCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2sgfSBmcm9tICdAdXRpbHMnXHJcbmltcG9ydCB7IHN0YXJ0Q2FtZXJhLCBzdG9wQ2FtZXJhIH0gZnJvbSAnLi8uLi9jYW1lcmEnXHJcblxyXG5leHBvcnQgbGV0IHBsYXllckFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlIHwgbnVsbCA9IG51bGxcclxuXHJcbmNvbnN0IGJsX2FwcGVhcmFuY2UgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2VcclxuZXhwb3J0IGxldCBpc01lbnVPcGVuID0gZmFsc2VcclxuZXhwb3J0IGxldCBwZWQgPSAwXHJcblxyXG5jb25zdCB1cGRhdGVQZWQgPSAoKSA9PiB7XHJcbiAgICBpZiAoIWlzTWVudU9wZW4pIHJldHVybjtcclxuICAgIHBlZCA9IFBsYXllclBlZElkKClcclxuICAgIHNldFRpbWVvdXQodXBkYXRlUGVkLCAxMDApO1xyXG59XHJcblxyXG5jb25zdCB2YWxpZE1lbnVUeXBlcyA9ICh0eXBlOiBzdHJpbmdbXSkgPT4ge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKCFtZW51VHlwZXMuaW5jbHVkZXModHlwZVtpXSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IG9wZW5NZW51ID0gYXN5bmMgKHR5cGU6IHN0cmluZ1tdIHwgc3RyaW5nKSA9PiB7XHJcbiAgICBpc01lbnVPcGVuID0gdHJ1ZVxyXG4gICAgdXBkYXRlUGVkKClcclxuICAgIGF3YWl0IGRlbGF5KDE1MClcclxuICAgIHN0YXJ0Q2FtZXJhKClcclxuICAgIHNlbmROVUlFdmVudChzZW5kLnZpc2libGUsIHRydWUpXHJcbiAgICBTZXROdWlGb2N1cyh0cnVlLCB0cnVlKVxyXG4gICAgY29uc3QgaXNBcnJheSA9IHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJ1xyXG5cclxuICAgIGlmIChpc0FycmF5ICYmICF2YWxpZE1lbnVUeXBlcyh0eXBlKSkge1xyXG4gICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKCdFcnJvcjogbWVudSB0eXBlIG5vdCBmb3VuZCcpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgaWQgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UuY29uZmlnKCkudXNlQnJpZGdlID8gZXhwb3J0cy5ibF9icmlkZ2UuY29yZSAmJiBleHBvcnRzLmJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpLmNpZCA6IG51bGw7XHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPHsgb3V0Zml0czogT3V0Zml0W10sIHRhdHRvb3M6IFRUYXR0b29bXSB9PignYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0VGF0dG9vcyZPdXRmaXRzJywgMSwgaWQpIGFzIHsgb3V0Zml0czogT3V0Zml0W10sIHRhdHRvb3M6IFRUYXR0b29bXSB9XHJcblxyXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UoKVxyXG4gICAgcGxheWVyQXBwZWFyYW5jZSA9IGFwcGVhcmFuY2VcclxuICAgIHBsYXllckFwcGVhcmFuY2Uub3V0Zml0cyA9IGRhdGEub3V0Zml0c1xyXG4gICAgcGxheWVyQXBwZWFyYW5jZS50YXR0b29zID0gZGF0YS50YXR0b29zXHJcblxyXG4gICAgc2VuZE5VSUV2ZW50KHNlbmQuZGF0YSwge1xyXG4gICAgICAgIHRhYnM6IGlzQXJyYXkgPyB0eXBlIDogbWVudVR5cGVzLmluY2x1ZGVzKHR5cGUpID8gdHlwZSA6IG1lbnVUeXBlcyxcclxuICAgICAgICBhcHBlYXJhbmNlOiBhcHBlYXJhbmNlLFxyXG4gICAgICAgIGJsYWNrbGlzdDogYmxfYXBwZWFyYW5jZS5ibGFja2xpc3QoKSxcclxuICAgICAgICB0YXR0b29zOiBnZXRUYXR0b29zKCksXHJcbiAgICAgICAgb3V0Zml0czogZGF0YS5vdXRmaXRzLFxyXG4gICAgICAgIG1vZGVsczogYmxfYXBwZWFyYW5jZS5tb2RlbHMoKSxcclxuICAgICAgICBsb2NhbGU6IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpXHJcbiAgICB9KVxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc2V0QXBwZWFyYW5jZSA9IGFzeW5jIChhcHBlYXJhbmNlRGF0YTogVEFwcGVhcmFuY2UpID0+IHtcclxuICAgIGNvbnN0IG1vZGVsID0gYXBwZWFyYW5jZURhdGEubW9kZWxcclxuICAgIGlmIChtb2RlbCkge1xyXG4gICAgICAgIGNvbnN0IG1vZGVsSGFzaCA9IGF3YWl0IHJlcXVlc3RNb2RlbChtb2RlbClcclxuICAgIFxyXG4gICAgICAgIFNldFBsYXllck1vZGVsKFBsYXllcklkKCksIG1vZGVsSGFzaClcclxuICAgIFxyXG4gICAgICAgIGF3YWl0IGRlbGF5KDE1MClcclxuICAgIFxyXG4gICAgICAgIFNldE1vZGVsQXNOb0xvbmdlck5lZWRlZChtb2RlbEhhc2gpXHJcbiAgICAgICAgU2V0UGVkRGVmYXVsdENvbXBvbmVudFZhcmlhdGlvbihwZWQpXHJcbiAgICBcclxuICAgICAgICBpZiAobW9kZWwgPT09IEdldEhhc2hLZXkoXCJtcF9tX2ZyZWVtb2RlXzAxXCIpKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgZmFsc2UpXHJcbiAgICAgICAgZWxzZSBpZiAobW9kZWwgPT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgNDUsIDIxLCAwLCAyMCwgMTUsIDAsIDAuMywgMC4xLCAwLCBmYWxzZSlcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBoZWFkQmxlbmQgPSBhcHBlYXJhbmNlRGF0YS5oZWFkQmxlbmRcclxuICAgIGlmIChoZWFkQmxlbmQpIFNldFBlZEhlYWRCbGVuZERhdGEocGVkLCBoZWFkQmxlbmQuc2hhcGVGaXJzdCwgaGVhZEJsZW5kLnNoYXBlU2Vjb25kLCBoZWFkQmxlbmQuc2hhcGVUaGlyZCwgaGVhZEJsZW5kLnNraW5GaXJzdCwgaGVhZEJsZW5kLnNraW5TZWNvbmQsIGhlYWRCbGVuZC5za2luVGhpcmQsIGhlYWRCbGVuZC5zaGFwZU1peCwgaGVhZEJsZW5kLnNraW5NaXgsIGhlYWRCbGVuZC50aGlyZE1peCwgaGVhZEJsZW5kLmhhc1BhcmVudClcclxuXHJcbiAgICBpZiAoYXBwZWFyYW5jZURhdGEuaGVhZFN0cnVjdHVyZSkgZm9yIChjb25zdCBkYXRhIG9mIE9iamVjdC52YWx1ZXMoYXBwZWFyYW5jZURhdGEuaGVhZFN0cnVjdHVyZSkpIHtcclxuICAgICAgICBTZXRQZWRGYWNlRmVhdHVyZShwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFwcGVhcmFuY2VEYXRhLmRyYXdhYmxlcykgZm9yIChjb25zdCBkYXRhIG9mIE9iamVjdC52YWx1ZXMoYXBwZWFyYW5jZURhdGEuZHJhd2FibGVzKSkge1xyXG4gICAgICAgIGlmIChkYXRhLmluZGV4ID09PSAyKSBjb25zb2xlLmxvZyhkYXRhLmluZGV4LCBkYXRhLnZhbHVlLCBkYXRhLnRleHR1cmUpXHJcbiAgICAgICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCAwKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhcHBlYXJhbmNlRGF0YS5wcm9wcykgZm9yIChjb25zdCBkYXRhIG9mIE9iamVjdC52YWx1ZXMoYXBwZWFyYW5jZURhdGEucHJvcHMpKSB7XHJcbiAgICAgICAgaWYgKGRhdGEudmFsdWUgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIENsZWFyUGVkUHJvcChwZWQsIGRhdGEuaW5kZXgpXHJcbiAgICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFNldFBlZFByb3BJbmRleChwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgZmFsc2UpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFwcGVhcmFuY2VEYXRhLmhhaXJDb2xvcikge1xyXG4gICAgICAgIFNldFBlZEhhaXJDb2xvcihwZWQsIGFwcGVhcmFuY2VEYXRhLmhhaXJDb2xvci5jb2xvciwgYXBwZWFyYW5jZURhdGEuaGFpckNvbG9yLmhpZ2hsaWdodCkgXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFwcGVhcmFuY2VEYXRhLmhlYWRPdmVybGF5KSBmb3IgKGNvbnN0IGRhdGEgb2YgT2JqZWN0LnZhbHVlcyhhcHBlYXJhbmNlRGF0YS5oZWFkT3ZlcmxheSkpIHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlID09IC0xID8gMjU1IDogZGF0YS5vdmVybGF5VmFsdWVcclxuXHJcbiAgICAgICAgaWYgKGRhdGEuaWQgPT09ICdFeWVDb2xvcicpIFNldFBlZEV5ZUNvbG9yKHBlZCwgdmFsdWUpIFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBTZXRQZWRIZWFkT3ZlcmxheShwZWQsIGRhdGEuaW5kZXgsIHZhbHVlLCBkYXRhLm92ZXJsYXlPcGFjaXR5KVxyXG4gICAgICAgICAgICBTZXRQZWRIZWFkT3ZlcmxheUNvbG9yKHBlZCwgZGF0YS5pbmRleCwgMSwgZGF0YS5maXJzdENvbG9yLCBkYXRhLnNlY29uZENvbG9yKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYXBwZWFyYW5jZURhdGEudGF0dG9vcykge1xyXG4gICAgICAgIENsZWFyUGVkRGVjb3JhdGlvbnNMZWF2ZVNjYXJzKHBlZClcclxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgYXBwZWFyYW5jZURhdGEudGF0dG9vcykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXR0b28gPSBlbGVtZW50LnRhdHRvb1xyXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XHJcbiAgICAgICAgICAgICAgICBBZGRQZWREZWNvcmF0aW9uRnJvbUhhc2hlcyhwZWQsIEdldEhhc2hLZXkodGF0dG9vLmRsYyksIHRhdHRvby5oYXNoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSAgXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjbG9zZU1lbnUgPSBhc3luYyAoc2F2ZTogYm9vbGVhbikgPT4ge1xyXG4gICAgaWYgKCFzYXZlKSBhd2FpdCBzZXRBcHBlYXJhbmNlKHBsYXllckFwcGVhcmFuY2UpXHJcbiAgICBlbHNlIHtcclxuICAgICAgICBjb25zdCBjb25maWcgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UuY29uZmlnKClcclxuICAgICAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZSgpXHJcbiAgICAgICAgZW1pdE5ldChcImJsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVBcHBlYXJhbmNlc1wiLCB7XHJcbiAgICAgICAgICAgIGlkOiBjb25maWcudXNlQnJpZGdlID8gZXhwb3J0cy5ibF9icmlkZ2UuY29yZSAmJiBleHBvcnRzLmJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpLmNpZCA6IG51bGwsXHJcblxyXG4gICAgICAgICAgICBza2luOiB7XHJcbiAgICAgICAgICAgICAgICBoZWFkQmxlbmQ6IGFwcGVhcmFuY2UuaGVhZEJsZW5kLFxyXG4gICAgICAgICAgICAgICAgaGVhZFN0cnVjdHVyZTogYXBwZWFyYW5jZS5oZWFkU3RydWN0dXJlLFxyXG4gICAgICAgICAgICAgICAgaGVhZE92ZXJsYXk6IGFwcGVhcmFuY2UuaGVhZE92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICBoYWlyQ29sb3I6IGFwcGVhcmFuY2UuaGFpckNvbG9yLFxyXG4gICAgICAgICAgICAgICAgbW9kZWw6IGFwcGVhcmFuY2UubW9kZWwsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNsb3RoZXM6IHtcclxuICAgICAgICAgICAgICAgIGRyYXdhYmxlczogYXBwZWFyYW5jZS5kcmF3YWJsZXMsXHJcbiAgICAgICAgICAgICAgICBwcm9wczogYXBwZWFyYW5jZS5wcm9wcyxcclxuICAgICAgICAgICAgICAgIGhlYWRPdmVybGF5OiBhcHBlYXJhbmNlLmhlYWRPdmVybGF5LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0YXR0b29zOiBwbGF5ZXJBcHBlYXJhbmNlLmN1cnJlbnRUYXR0b29zIHx8IFtdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0b3BDYW1lcmEoKVxyXG4gICAgaXNNZW51T3BlbiA9IGZhbHNlXHJcbiAgICBTZXROdWlGb2N1cyhmYWxzZSwgZmFsc2UpXHJcbiAgICBzZW5kTlVJRXZlbnQoc2VuZC52aXNpYmxlLCBmYWxzZSlcclxufVxyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhyZWNlaXZlLmNsb3NlLCAoc2F2ZTogYm9vbGVhbiwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBjYigxKVxyXG4gICAgY2xvc2VNZW51KHNhdmUpXHJcbn0pOyIsICJpbXBvcnQgeyBhcHBlYXJhbmNlIH0gZnJvbSAnQGVudW1zJztcclxuaW1wb3J0IHsgZGVidWdkYXRhLCByZXF1ZXN0TW9kZWwsIGRlbGF5fSBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCB7IEhlYWRPdmVybGF5RGF0YSwgSGVhZFN0cnVjdHVyZURhdGEsIERyYXdhYmxlRGF0YX0gZnJvbSAnQGRhdGFUeXBlcy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgVFRhdHRvb30gZnJvbSAnQGRhdGFUeXBlcy90YXR0b29zJztcclxuaW1wb3J0IGdldEFwcGVhcmFuY2UgZnJvbSAnLidcclxuaW1wb3J0IHtwZWQsIHBsYXllckFwcGVhcmFuY2V9IGZyb20gJy4vLi4vJ1xyXG5pbXBvcnQge1RIZWFkQmxlbmR9IGZyb20gJ0BkYXRhVHlwZXMvYXBwZWFyYW5jZSdcclxuXHJcbmNvbnN0IGFjdGlvbkhhbmRsZXJzID0ge1xyXG4gICAgW2FwcGVhcmFuY2Uuc2V0TW9kZWxdOiBhc3luYyAobW9kZWw6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIGNvbnN0IG1vZGVsSGFzaCA9IGF3YWl0IHJlcXVlc3RNb2RlbChtb2RlbClcclxuXHJcbiAgICAgICAgU2V0UGxheWVyTW9kZWwoUGxheWVySWQoKSwgbW9kZWxIYXNoKVxyXG5cclxuICAgICAgICBhd2FpdCBkZWxheSgxNTApXHJcblxyXG4gICAgICAgIFNldE1vZGVsQXNOb0xvbmdlck5lZWRlZChtb2RlbEhhc2gpXHJcbiAgICAgICAgU2V0UGVkRGVmYXVsdENvbXBvbmVudFZhcmlhdGlvbihwZWQpXHJcblxyXG4gICAgICAgIGlmIChtb2RlbCA9PT0gXCJtcF9tX2ZyZWVtb2RlXzAxXCIpIFNldFBlZEhlYWRCbGVuZERhdGEocGVkLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCBmYWxzZSlcclxuICAgICAgICBlbHNlIGlmIChtb2RlbCA9PT0gXCJtcF9mX2ZyZWVtb2RlXzAxXCIpIFNldFBlZEhlYWRCbGVuZERhdGEocGVkLCA0NSwgMjEsIDAsIDIwLCAxNSwgMCwgMC4zLCAwLjEsIDAsIGZhbHNlKVxyXG5cclxuICAgICAgICByZXR1cm4gZ2V0QXBwZWFyYW5jZSgpXHJcbiAgICB9LFxyXG4gICAgW2FwcGVhcmFuY2Uuc2V0SGVhZFN0cnVjdHVyZV06IChkYXRhOiBIZWFkU3RydWN0dXJlRGF0YSkgPT4ge1xyXG4gICAgICAgIFNldFBlZEZhY2VGZWF0dXJlKHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSlcclxuICAgICAgICByZXR1cm4gZGF0YVxyXG4gICAgfSxcclxuICAgIFthcHBlYXJhbmNlLnNldEhlYWRPdmVybGF5XTogKGRhdGE6IEhlYWRPdmVybGF5RGF0YSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gZGF0YS5vdmVybGF5VmFsdWUgPT0gLTEgPyAyNTUgOiBkYXRhLm92ZXJsYXlWYWx1ZVxyXG5cclxuICAgICAgICBpZiAoZGF0YS5pZCA9PT0gJ0V5ZUNvbG9yJykgU2V0UGVkRXllQ29sb3IocGVkLCBkYXRhLmV5ZUNvbG9yKSBcclxuICAgICAgICBlbHNlIGlmIChkYXRhLmlkID09PSAnaGFpckNvbG9yJykgU2V0UGVkSGFpckNvbG9yKHBlZCwgZGF0YS5oYWlyQ29sb3IsIGRhdGEuaGFpckhpZ2hsaWdodCkgXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIFNldFBlZEhlYWRPdmVybGF5KHBlZCwgZGF0YS5pbmRleCwgdmFsdWUsIGRhdGEub3ZlcmxheU9wYWNpdHkpXHJcbiAgICAgICAgICAgIFNldFBlZEhlYWRPdmVybGF5Q29sb3IocGVkLCBkYXRhLmluZGV4LCAxLCBkYXRhLmZpcnN0Q29sb3IsIGRhdGEuc2Vjb25kQ29sb3IpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gMVxyXG4gICAgfSxcclxuICAgIFthcHBlYXJhbmNlLnNldEhlYWRCbGVuZF06IChkYXRhOiBUSGVhZEJsZW5kKSA9PiB7XHJcbiAgICAgICAgU2V0UGVkSGVhZEJsZW5kRGF0YShcclxuICAgICAgICAgICAgcGVkLCBcclxuICAgICAgICAgICAgZGF0YS5zaGFwZUZpcnN0LCBcclxuICAgICAgICAgICAgZGF0YS5zaGFwZVNlY29uZCwgXHJcbiAgICAgICAgICAgIGRhdGEuc2hhcGVUaGlyZCwgXHJcbiAgICAgICAgICAgIGRhdGEuc2tpbkZpcnN0LCBcclxuICAgICAgICAgICAgZGF0YS5za2luU2Vjb25kLCBcclxuICAgICAgICAgICAgZGF0YS5za2luVGhpcmQsIFxyXG4gICAgICAgICAgICBkYXRhLnNoYXBlTWl4LCBcclxuICAgICAgICAgICAgZGF0YS5za2luTWl4LCBcclxuICAgICAgICAgICAgZGF0YS50aGlyZE1peCwgXHJcbiAgICAgICAgICAgIGRhdGEuaGFzUGFyZW50XHJcbiAgICAgICAgKVxyXG4gICAgICAgIHJldHVybiAxXHJcbiAgICB9LFxyXG4gICAgW2FwcGVhcmFuY2Uuc2V0UHJvcF06IChkYXRhOiBEcmF3YWJsZURhdGEpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS52YWx1ZSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgQ2xlYXJQZWRQcm9wKHBlZCwgZGF0YS5pbmRleClcclxuICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICB9XHJcbiAgICAgICAgU2V0UGVkUHJvcEluZGV4KHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCBmYWxzZSlcclxuICAgICAgICByZXR1cm4gZGF0YS5pc1RleHR1cmUgPyAxIDogR2V0TnVtYmVyT2ZQZWRQcm9wVGV4dHVyZVZhcmlhdGlvbnMocGVkLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlKSAvLyBpZiBpdCB0ZXh0dXJlIHdoeSB3ZSB3b3VsZCBjYWxsIGEgdXNlbGVzcyBuYXRpdmUgXHJcbiAgICB9LFxyXG4gICAgW2FwcGVhcmFuY2Uuc2V0RHJhd2FibGVdOiAoZGF0YTogRHJhd2FibGVEYXRhKSA9PiB7XHJcbiAgICAgICAgU2V0UGVkQ29tcG9uZW50VmFyaWF0aW9uKHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCAwKVxyXG5cclxuICAgICAgICByZXR1cm4gZGF0YS5pc1RleHR1cmUgPyAxIDogR2V0TnVtYmVyT2ZQZWRUZXh0dXJlVmFyaWF0aW9ucyhwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpLTFcclxuICAgIH0sXHJcbiAgICBbYXBwZWFyYW5jZS5zZXRUYXR0b29zXTogKGRhdGE6IFRUYXR0b29bXSkgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YSkgcmV0dXJuIDFcclxuXHJcbiAgICAgICAgcGxheWVyQXBwZWFyYW5jZS5jdXJyZW50VGF0dG9vcyA9IGRhdGFcclxuICAgICAgICBDbGVhclBlZERlY29yYXRpb25zTGVhdmVTY2FycyhwZWQpXHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvbyA9IGVsZW1lbnQudGF0dG9vXHJcbiAgICAgICAgICAgIGlmICh0YXR0b28pIHtcclxuICAgICAgICAgICAgICAgIEFkZFBlZERlY29yYXRpb25Gcm9tSGFzaGVzKHBlZCwgR2V0SGFzaEtleSh0YXR0b28uZGxjKSwgdGF0dG9vLmhhc2gpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIDFcclxuICAgIH0sXHJcbiAgICBbYXBwZWFyYW5jZS5nZXRNb2RlbFRhdHRvb3NdOiAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGRhdGFcclxuICAgIH0sXHJcbn07XHJcblxyXG5mb3IgKGNvbnN0IGFjdGlvbiBvZiBPYmplY3QudmFsdWVzKGFwcGVhcmFuY2UpKSB7XHJcbiAgICBSZWdpc3Rlck51aUNhbGxiYWNrKGFjdGlvbiwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IGFjdGlvbkhhbmRsZXJzW2FjdGlvbl07XHJcbiAgICAgICAgaWYgKCFoYW5kbGVyKSByZXR1cm5cclxuXHJcbiAgICAgICAgY2IoYXdhaXQgaGFuZGxlcihkYXRhKSlcclxuICAgIH0pO1xyXG59XHJcbiIsICJpbXBvcnQgeyBvdXRmaXRzIH0gZnJvbSAnQGVudW1zJztcclxuaW1wb3J0IHsgZGVidWdkYXRhLCByZXF1ZXN0TW9kZWwsIGRlbGF5fSBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCB7IE91dGZpdCwgVE91dGZpdERhdGF9IGZyb20gJ0BkYXRhVHlwZXMvb3V0Zml0cyc7XHJcbmltcG9ydCB7IFRUYXR0b299IGZyb20gJ0BkYXRhVHlwZXMvdGF0dG9vcyc7XHJcbmltcG9ydCBnZXRBcHBlYXJhbmNlIGZyb20gJy4vLi4vYXBwZWFyYW5jZSdcclxuaW1wb3J0IHtwZWQsIHBsYXllckFwcGVhcmFuY2UsIHNldEFwcGVhcmFuY2V9IGZyb20gJy4vLi4vJ1xyXG5cclxuY29uc3QgYWN0aW9uSGFuZGxlcnMgPSB7XHJcbiAgICBbb3V0Zml0cy5zYXZlT3V0Zml0XTogYXN5bmMgKGRhdGE6IE91dGZpdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5jb25maWcoKVxyXG4gICAgICAgIGVtaXROZXQoXCJibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlT3V0Zml0XCIsIHtcclxuICAgICAgICAgICAgaWQ6IGNvbmZpZy51c2VCcmlkZ2UgPyBleHBvcnRzLmJsX2JyaWRnZS5jb3JlICYmIGV4cG9ydHMuYmxfYnJpZGdlLmNvcmUoKS5nZXRQbGF5ZXJEYXRhKCkuY2lkIDogbnVsbCxcclxuICAgICAgICAgICAgbGFiZWw6IGRhdGEubGFiZWwsXHJcbiAgICAgICAgICAgIG91dGZpdDogZGF0YS5vdXRmaXRcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfSxcclxuICAgIFtvdXRmaXRzLmRlbGV0ZU91dGZpdF06IGFzeW5jIChtb2RlbDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG4gICAgW291dGZpdHMucmVuYW1lT3V0Zml0XTogYXN5bmMgKG1vZGVsOiBzdHJpbmcpID0+IHtcclxuICAgICAgICBcclxuICAgIH0sXHJcbiAgICBbb3V0Zml0cy51c2VPdXRmaXRdOiAob3V0Zml0OiBUT3V0Zml0RGF0YSkgPT4ge1xyXG4gICAgICAgIHNldEFwcGVhcmFuY2Uob3V0Zml0KVxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9LFxyXG59XHJcblxyXG5mb3IgKGNvbnN0IGFjdGlvbiBvZiBPYmplY3QudmFsdWVzKG91dGZpdHMpKSB7XHJcbiAgICBSZWdpc3Rlck51aUNhbGxiYWNrKGFjdGlvbiwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IGFjdGlvbkhhbmRsZXJzW2FjdGlvbl07XHJcbiAgICAgICAgaWYgKCFoYW5kbGVyKSByZXR1cm5cclxuXHJcbiAgICAgICAgY2IoYXdhaXQgaGFuZGxlcihkYXRhKSlcclxuICAgIH0pO1xyXG59XHJcbiIsICJpbXBvcnQgeyBvcGVuTWVudSB9IGZyb20gJy4vbWVudSdcclxuaW1wb3J0IHsgdHJpZ2dlclNlcnZlckNhbGxiYWNrIH0gZnJvbSAnQHV0aWxzJ1xyXG5pbXBvcnQoJy4vbWVudS9hcHBlYXJhbmNlL2hhbmRsZXInKVxyXG5pbXBvcnQoJy4vbWVudS9vdXRmaXRzJylcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgnb3Blbk1lbnUnLCAoKSA9PiB7XHJcbiAgb3Blbk1lbnUoJ2FsbCcpXHJcbn0sIGZhbHNlKVxyXG5cclxuc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcbiAgY29uc3QgYXJncyA9IFsxLCBudWxsLCAzLCBudWxsLCBudWxsLCA2XTtcclxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazx7IHNlcnZlclZhbHVlOiBudW1iZXIgfT4oJ3Rlc3Q6c2VydmVyJywgMSwgYXJncyk7XHJcbiAgaWYgKCFyZXNwb25zZSkgcmV0dXJuO1xyXG59LCAxMDApO1xyXG5cclxuLy8gZnVuY3Rpb24gRXhwb3J0X0dldFBlZEhlYWRCbGVuZERhdGEoKSB7XHJcbi8vICAgICB2YXIgYXJyID0gbmV3IFVpbnQzMkFycmF5KG5ldyBBcnJheUJ1ZmZlcigxMCAqIDgpKTsgLy8gaW50LCBpbnQsIGludCwgaW50LCBpbnQsIGludCwgZmxvYXQsIGZsb2F0LCBmbG9hdCwgYm9vbFxyXG4vLyAgICAgQ2l0aXplbi5pbnZva2VOYXRpdmUoXCIweDI3NDZCRDlEODhDNUM1RDBcIiwgUGxheWVyUGVkSWQoKSwgYXJyKTtcclxuLy8gICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcnIpO1xyXG4vLyB9XHJcblxyXG4vLyBSZWdpc3RlckNvbW1hbmQoJ2hlYWQnLCAoKSA9PiB7XHJcbi8vICAgICAvLyBjb25zdCBkYXRhID0gRXhwb3J0X0dldFBlZEhlYWRCbGVuZERhdGEoKVxyXG4vLyAgICAgLy8gY29uc29sZS5sb2coZGF0YSlcclxuLy8gfSwgZmFsc2UpXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7O0FBQUEsSUFBTztBQUFQO0FBQUE7QUFBQSxJQUFPLGVBQVE7QUFB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QUF3QjtBQUMxQyxzQkFBYyxNQUFNO0FBQ3BCLGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSjtBQUVBLGVBQVcsVUFBVSxPQUFPLE9BQU8sT0FBTyxHQUFHO0FBQ3pDLDBCQUFvQixRQUFRLE9BQU8sTUFBVyxPQUFpQjtBQUMzRCxjQUFNLFVBQVVBLGdCQUFlLE1BQU07QUFDckMsWUFBSSxDQUFDO0FBQVM7QUFFZCxXQUFHLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFBQSxNQUMxQixDQUFDO0FBQUEsSUFDTDtBQUFBO0FBQUE7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLGdCQUFnQixZQUFZLE1BQU07QUFDaEMsV0FBUyxLQUFLO0FBQ2hCLEdBQUcsS0FBSztBQUVSLFdBQVcsWUFBWTtBQUNyQixRQUFNLE9BQU8sQ0FBQyxHQUFHLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQztBQUN2QyxRQUFNLFdBQVcsTUFBTSxzQkFBK0MsZUFBZSxHQUFHLElBQUk7QUFDNUYsTUFBSSxDQUFDO0FBQVU7QUFDakIsR0FBRyxHQUFHOyIsCiAgIm5hbWVzIjogWyJwZWQiLCAiYXBwZWFyYW5jZSIsICJvdXRmaXRzIiwgImRlbGF5IiwgImFwcGVhcmFuY2UiLCAiYWN0aW9uSGFuZGxlcnMiXQp9Cg==
