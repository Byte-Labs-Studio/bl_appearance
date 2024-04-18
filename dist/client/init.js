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
      "bracelets"
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
    outfits = /* @__PURE__ */ ((outfits3) => {
      outfits3["useOutfit"] = "appearance:useOutfit";
      outfits3["renameOutfit"] = "appearance:renameOutfit";
      outfits3["deleteOutfit"] = "appearance:deleteOutfit";
      outfits3["saveOutfit"] = "appearance:saveOutfit";
      return outfits3;
    })(outfits || {});
  }
});

// src/client/utils/index.ts
function eventTimer(eventName, delay3) {
  if (delay3 && delay3 > 0) {
    const currentTime = GetGameTimer();
    if ((eventTimers[eventName] || 0) > currentTime)
      return false;
    eventTimers[eventName] = currentTime + delay3;
  }
  return true;
}
function triggerServerCallback(eventName, delay3, ...args) {
  if (!eventTimer(eventName, delay3)) {
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
var sendNUIEvent, delay, requestModel, resourceName, eventTimers, activeEvents, requestLocale, getFrameworkID;
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
    getFrameworkID = /* @__PURE__ */ __name(() => {
      return exports.bl_appearance.config().useBridge ? exports.bl_bridge.core && exports.bl_bridge.core().getPlayerData().cid : null;
    }, "getFrameworkID");
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
var playerAppearance, bl_appearance, isMenuOpen, ped, updatePed, validMenuTypes, getBlacklist, openMenu, setAppearance, closeMenu;
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
    getBlacklist = /* @__PURE__ */ __name(() => {
      return bl_appearance.blacklist();
    }, "getBlacklist");
    openMenu = /* @__PURE__ */ __name(async (type) => {
      isMenuOpen = true;
      updatePed();
      await delay(150);
      startCamera();
      const isArray = typeof type !== "string";
      if (isArray && !validMenuTypes(type)) {
        return console.error("Error: menu type not found");
      }
      const frameworkdId = getFrameworkID();
      const serverID = GetPlayerServerId(PlayerId());
      const outfits3 = await triggerServerCallback("bl_appearance:server:getOutfits", frameworkdId);
      const tattoos = await triggerServerCallback("bl_appearance:server:getTattoos", frameworkdId);
      const appearance2 = await appearance_default();
      playerAppearance = appearance2;
      playerAppearance.tattoos = tattoos;
      sendNUIEvent("appearance:data" /* data */, {
        tabs: isArray ? type : menuTypes_default.includes(type) ? type : menuTypes_default,
        appearance: appearance2,
        blacklist: getBlacklist(),
        tattoos: tattoos_default(),
        outfits: outfits3,
        models: bl_appearance.models(),
        locale: await requestLocale("locale")
      });
      sendNUIEvent("appearance:visible" /* visible */, true);
      SetNuiFocus(true, true);
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
    init_utils();
    init_menu();
    actionHandlers2 = {
      ["appearance:saveOutfit" /* saveOutfit */]: async ({ label, outfit }) => {
        const frameworkdId = getFrameworkID();
        return await triggerServerCallback("bl_appearance:server:saveOutfit", frameworkdId, { label, outfit });
      },
      ["appearance:deleteOutfit" /* deleteOutfit */]: async (id) => {
        const frameworkdId = getFrameworkID();
        return await triggerServerCallback("bl_appearance:server:deleteOutfit", frameworkdId, id);
      },
      ["appearance:renameOutfit" /* renameOutfit */]: async ({ label, id }) => {
        const frameworkdId = getFrameworkID();
        return await triggerServerCallback("bl_appearance:server:renameOutfit", frameworkdId, label, id);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2RhdGEvaGVhZC50cyIsICIuLi8uLi9zcmMvZGF0YS9mYWNlLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2RyYXdhYmxlLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvbWVudS9hcHBlYXJhbmNlL2luZGV4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvbWVudS90YXR0b29zL2luZGV4LnRzIiwgIi4uLy4uL3NyYy9kYXRhL21lbnVUeXBlcy50cyIsICIuLi8uLi9zcmMvY2xpZW50L2VudW1zLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvdXRpbHMvaW5kZXgudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9jYW1lcmEvaW5kZXgudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9tZW51L2luZGV4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvbWVudS9hcHBlYXJhbmNlL2hhbmRsZXIudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9tZW51L291dGZpdHMvaW5kZXgudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCBbXG4gICAgXCJCbGVtaXNoZXNcIixcbiAgICBcIkZhY2lhbEhhaXJcIixcbiAgICBcIkV5ZWJyb3dzXCIsXG4gICAgXCJBZ2VpbmdcIixcbiAgICBcIk1ha2V1cFwiLFxuICAgIFwiQmx1c2hcIixcbiAgICBcIkNvbXBsZXhpb25cIixcbiAgICBcIlN1bkRhbWFnZVwiLFxuICAgIFwiTGlwc3RpY2tcIixcbiAgICBcIk1vbGVzRnJlY2tsZXNcIixcbiAgICBcIkNoZXN0SGFpclwiLFxuICAgIFwiQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiQWRkQm9keUJsZW1pc2hlc1wiLFxuICAgIFwiRXllQ29sb3JcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcIk5vc2VfV2lkdGhcIixcbiAgICBcIk5vc2VfUGVha19IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19MZW5naHRcIixcbiAgICBcIk5vc2VfQm9uZV9IZWlnaHRcIixcbiAgICBcIk5vc2VfUGVha19Mb3dlcmluZ1wiLFxuICAgIFwiTm9zZV9Cb25lX1R3aXN0XCIsXG4gICAgXCJFeWVCcm93bl9IZWlnaHRcIixcbiAgICBcIkV5ZUJyb3duX0ZvcndhcmRcIixcbiAgICBcIkNoZWVrc19Cb25lX0hpZ2hcIixcbiAgICBcIkNoZWVrc19Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGVla3NfV2lkdGhcIixcbiAgICBcIkV5ZXNfT3Blbm5pbmdcIixcbiAgICBcIkxpcHNfVGhpY2tuZXNzXCIsXG4gICAgXCJKYXdfQm9uZV9XaWR0aFwiLFxuICAgIFwiSmF3X0JvbmVfQmFja19MZW5naHRcIixcbiAgICBcIkNoaW5fQm9uZV9Mb3dlcmluZ1wiLFxuICAgIFwiQ2hpbl9Cb25lX0xlbmd0aFwiLFxuICAgIFwiQ2hpbl9Cb25lX1dpZHRoXCIsXG4gICAgXCJDaGluX0hvbGVcIixcbiAgICBcIk5lY2tfVGhpa25lc3NcIlxuXVxuIiwgImV4cG9ydCBkZWZhdWx0IFtcbiAgICBcImZhY2VcIixcbiAgICBcIm1hc2tzXCIsXG4gICAgXCJoYWlyXCIsXG4gICAgXCJ0b3Jzb3NcIixcbiAgICBcImxlZ3NcIixcbiAgICBcImJhZ3NcIixcbiAgICBcInNob2VzXCIsXG4gICAgXCJuZWNrXCIsXG4gICAgXCJzaGlydHNcIixcbiAgICBcInZlc3RcIixcbiAgICBcImRlY2Fsc1wiLFxuICAgIFwiamFja2V0c1wiXG5dXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xuICAgIFwiaGF0c1wiLFxuICAgIFwiZ2xhc3Nlc1wiLFxuICAgIFwiZWFycmluZ3NcIixcbiAgICBcIm1vdXRoXCIsXG4gICAgXCJsaGFuZFwiLFxuICAgIFwicmhhbmRcIixcbiAgICBcIndhdGNoZXNcIixcbiAgICBcImJyYWNlbGV0c1wiXG5dXG4iLCAiaW1wb3J0IEhFQURfT1ZFUkxBWVMgZnJvbSAnLi4vLi4vLi4vZGF0YS9oZWFkJztcbmltcG9ydCBGQUNFX0ZFQVRVUkVTIGZyb20gJy4uLy4uLy4uL2RhdGEvZmFjZSc7XG5pbXBvcnQgRFJBV0FCTEVfTkFNRVMgZnJvbSAnLi4vLi4vLi4vZGF0YS9kcmF3YWJsZSc7XG5pbXBvcnQgUFJPUF9OQU1FUyBmcm9tICcuLi8uLi8uLi9kYXRhL3Byb3BzJztcbmltcG9ydCB7IEhhaXJEYXRhLCBQZWRIYW5kbGUsIFRvdGFsRGF0YSwgRHJhd2FibGVEYXRhLCBIZWFkU3RydWN0dXJlRGF0YSwgSGVhZE92ZXJsYXlEYXRhLCBUQXBwZWFyYW5jZSB9IGZyb20gJ0BkYXRhVHlwZXMvYXBwZWFyYW5jZSc7XG5pbXBvcnQgeyBUVGF0dG9vIH0gZnJvbSAnQGRhdGFUeXBlcy90YXR0b29zJztcbmltcG9ydCB7cGVkfSBmcm9tICcuLic7XG5pbXBvcnQgeyB0cmlnZ2VyU2VydmVyQ2FsbGJhY2sgfSBmcm9tICdAdXRpbHMnXG5cbmNvbnN0IGZpbmRNb2RlbEluZGV4ID0gKG1vZGVsOiBQZWRIYW5kbGUpID0+IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5tb2RlbHMoKS5maW5kSW5kZXgoKHBlZDogc3RyaW5nKSA9PiBHZXRIYXNoS2V5KHBlZCkgPT09IG1vZGVsKTtcblxuY29uc3QgZ2V0UGVkSGFpciA9ICgpOiBIYWlyRGF0YSA9PiAoe1xuICAgIGNvbG9yOiBHZXRQZWRIYWlyQ29sb3IocGVkKSxcbiAgICBoaWdobGlnaHQ6IEdldFBlZEhhaXJIaWdobGlnaHRDb2xvcihwZWQpXG59KTtcblxuY29uc3QgZ2V0UGVkSGVhZEJsZW5kRGF0YSA9ICgpID0+IHtcbiAgICBjb25zdCBoZWFkYmxlbmREYXRhID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkdldEhlYWRCbGVuZERhdGEocGVkKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2hhcGVGaXJzdDogaGVhZGJsZW5kRGF0YS5GaXJzdEZhY2VTaGFwZSwgICAvLyBmYXRoZXJcbiAgICAgICAgc2hhcGVTZWNvbmQ6IGhlYWRibGVuZERhdGEuU2Vjb25kRmFjZVNoYXBlLCAvLyBtb3RoZXJcbiAgICAgICAgc2hhcGVUaGlyZDogaGVhZGJsZW5kRGF0YS5UaGlyZEZhY2VTaGFwZSxcblxuICAgICAgICBza2luRmlyc3Q6IGhlYWRibGVuZERhdGEuRmlyc3RTa2luVG9uZSxcbiAgICAgICAgc2tpblNlY29uZDogaGVhZGJsZW5kRGF0YS5TZWNvbmRTa2luVG9uZSxcbiAgICAgICAgc2tpblRoaXJkOiBoZWFkYmxlbmREYXRhLlRoaXJkU2tpblRvbmUsXG5cbiAgICAgICAgc2hhcGVNaXg6IGhlYWRibGVuZERhdGEuUGFyZW50RmFjZVNoYXBlUGVyY2VudCwgLy8gcmVzZW1ibGFuY2VcblxuICAgICAgICB0aGlyZE1peDogaGVhZGJsZW5kRGF0YS5QYXJlbnRUaGlyZFVua1BlcmNlbnQsXG4gICAgICAgIHNraW5NaXg6IGhlYWRibGVuZERhdGEuUGFyZW50U2tpblRvbmVQZXJjZW50LCAgIC8vIHNraW5wZXJjZW50XG5cbiAgICAgICAgaGFzUGFyZW50OiBoZWFkYmxlbmREYXRhLklzUGFyZW50SW5oZXJpdGFuY2UsXG4gICAgfTtcbn07XG5cbmNvbnN0IGdldEhlYWRPdmVybGF5ID0gKCk6IFtSZWNvcmQ8c3RyaW5nLCBIZWFkT3ZlcmxheURhdGE+LCBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+XSA9PiB7XG4gICAgbGV0IHRvdGFsczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xuICAgIGxldCBoZWFkRGF0YTogUmVjb3JkPHN0cmluZywgSGVhZE92ZXJsYXlEYXRhPiA9IHt9O1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBIRUFEX09WRVJMQVlTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBIRUFEX09WRVJMQVlTW2ldO1xuICAgICAgICB0b3RhbHNbb3ZlcmxheV0gPSBHZXROdW1IZWFkT3ZlcmxheVZhbHVlcyhpKTtcblxuICAgICAgICBpZiAob3ZlcmxheSA9PT0gXCJFeWVDb2xvclwiKSB7XG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgICAgICBvdmVybGF5VmFsdWU6IEdldFBlZEV5ZUNvbG9yKHBlZClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBbXywgb3ZlcmxheVZhbHVlLCBjb2xvdXJUeXBlLCBmaXJzdENvbG9yLCBzZWNvbmRDb2xvciwgb3ZlcmxheU9wYWNpdHldID0gR2V0UGVkSGVhZE92ZXJsYXlEYXRhKHBlZCwgaSk7XG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcbiAgICAgICAgICAgICAgICBpbmRleDogaSAtIDEsXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBvdmVybGF5VmFsdWUgPT09IDI1NSA/IC0xIDogb3ZlcmxheVZhbHVlLFxuICAgICAgICAgICAgICAgIGNvbG91clR5cGU6IGNvbG91clR5cGUsXG4gICAgICAgICAgICAgICAgZmlyc3RDb2xvcjogZmlyc3RDb2xvcixcbiAgICAgICAgICAgICAgICBzZWNvbmRDb2xvcjogc2Vjb25kQ29sb3IsXG4gICAgICAgICAgICAgICAgb3ZlcmxheU9wYWNpdHk6IG92ZXJsYXlPcGFjaXR5XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFtoZWFkRGF0YSwgdG90YWxzXTtcbn07XG5cbmNvbnN0IGdldEhlYWRTdHJ1Y3R1cmUgPSAoKTogUmVjb3JkPHN0cmluZywgSGVhZFN0cnVjdHVyZURhdGE+IHwgdW5kZWZpbmVkID0+IHtcbiAgICBjb25zdCBwZWRNb2RlbCA9IEdldEVudGl0eU1vZGVsKHBlZClcblxuICAgIGlmIChwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX21fZnJlZW1vZGVfMDFcIikgJiYgcGVkTW9kZWwgIT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpKSByZXR1cm5cblxuICAgIGxldCBmYWNlU3RydWN0ID0ge31cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEZBQ0VfRkVBVFVSRVMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEZBQ0VfRkVBVFVSRVNbaV1cbiAgICAgICAgZmFjZVN0cnVjdFtvdmVybGF5XSA9IHtcbiAgICAgICAgICAgIGlkOiBvdmVybGF5LFxuICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRmFjZUZlYXR1cmUocGVkLCBpKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhY2VTdHJ1Y3Rcbn1cblxuY29uc3QgZ2V0RHJhd2FibGVzID0gKCk6IFtSZWNvcmQ8c3RyaW5nLCBEcmF3YWJsZURhdGE+LCBSZWNvcmQ8c3RyaW5nLCBUb3RhbERhdGE+XSA9PiB7XG4gICAgbGV0IGRyYXdhYmxlcyA9IHt9XG4gICAgbGV0IHRvdGFsRHJhd2FibGVzID0ge31cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgRFJBV0FCTEVfTkFNRVMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IERSQVdBQkxFX05BTUVTW2ldXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGkpXG5cbiAgICAgICAgdG90YWxEcmF3YWJsZXNbbmFtZV0gPSB7XG4gICAgICAgICAgICBpZDogbmFtZSxcbiAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgdG90YWw6IEdldE51bWJlck9mUGVkRHJhd2FibGVWYXJpYXRpb25zKHBlZCwgaSksXG4gICAgICAgICAgICB0ZXh0dXJlczogR2V0TnVtYmVyT2ZQZWRUZXh0dXJlVmFyaWF0aW9ucyhwZWQsIGksIGN1cnJlbnQpXG4gICAgICAgIH1cbiAgICAgICAgZHJhd2FibGVzW25hbWVdID0ge1xuICAgICAgICAgICAgaWQ6IG5hbWUsXG4gICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgIHZhbHVlOiBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGkpLFxuICAgICAgICAgICAgdGV4dHVyZTogR2V0UGVkVGV4dHVyZVZhcmlhdGlvbihwZWQsIGkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gW2RyYXdhYmxlcywgdG90YWxEcmF3YWJsZXNdXG59XG5cbmNvbnN0IGdldFByb3BzID0gKCk6IFtSZWNvcmQ8c3RyaW5nLCBEcmF3YWJsZURhdGE+LCBSZWNvcmQ8c3RyaW5nLCBUb3RhbERhdGE+XSA9PiB7XG4gICAgbGV0IHByb3BzID0ge31cbiAgICBsZXQgdG90YWxQcm9wcyA9IHt9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFBST1BfTkFNRVMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IFBST1BfTkFNRVNbaV1cbiAgICAgICAgY29uc3QgY3VycmVudCA9IEdldFBlZFByb3BJbmRleChwZWQsIGkpXG5cbiAgICAgICAgdG90YWxQcm9wc1tuYW1lXSA9IHtcbiAgICAgICAgICAgIGlkOiBuYW1lLFxuICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWRQcm9wRHJhd2FibGVWYXJpYXRpb25zKHBlZCwgaSksXG4gICAgICAgICAgICB0ZXh0dXJlczogR2V0TnVtYmVyT2ZQZWRQcm9wVGV4dHVyZVZhcmlhdGlvbnMocGVkLCBpLCBjdXJyZW50KVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvcHNbbmFtZV0gPSB7XG4gICAgICAgICAgICBpZDogbmFtZSxcbiAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZFByb3BJbmRleChwZWQsIGkpLFxuICAgICAgICAgICAgdGV4dHVyZTogR2V0UGVkUHJvcFRleHR1cmVJbmRleChwZWQsIGkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gW3Byb3BzLCB0b3RhbFByb3BzXVxufVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyAoKTogUHJvbWlzZTxUQXBwZWFyYW5jZT4gPT4ge1xuICAgIGNvbnN0IFtoZWFkRGF0YSwgdG90YWxzXSA9IGdldEhlYWRPdmVybGF5KClcbiAgICBjb25zdCBbZHJhd2FibGVzLCBkcmF3VG90YWxdID0gZ2V0RHJhd2FibGVzKClcbiAgICBjb25zdCBbcHJvcHMsIHByb3BUb3RhbF0gPSBnZXRQcm9wcygpXG4gICAgY29uc3QgbW9kZWwgPSBHZXRFbnRpdHlNb2RlbChwZWQpXG5cbiAgICByZXR1cm4ge1xuICAgICAgICBtb2RlbEluZGV4OiBmaW5kTW9kZWxJbmRleChtb2RlbCksXG4gICAgICAgIG1vZGVsOiBtb2RlbCxcbiAgICAgICAgaGFpckNvbG9yOiBnZXRQZWRIYWlyKCksXG4gICAgICAgIGhlYWRCbGVuZDogZ2V0UGVkSGVhZEJsZW5kRGF0YSgpLFxuICAgICAgICBoZWFkT3ZlcmxheTogaGVhZERhdGEsXG4gICAgICAgIGhlYWRPdmVybGF5VG90YWw6IHRvdGFscyxcbiAgICAgICAgaGVhZFN0cnVjdHVyZTogZ2V0SGVhZFN0cnVjdHVyZSgpLFxuICAgICAgICBkcmF3YWJsZXM6IGRyYXdhYmxlcyxcbiAgICAgICAgcHJvcHM6IHByb3BzLFxuICAgICAgICBkcmF3VG90YWw6IGRyYXdUb3RhbCxcbiAgICAgICAgcHJvcFRvdGFsOiBwcm9wVG90YWwsXG4gICAgfVxufSIsICJpbXBvcnQgeyBwZWQgfSBmcm9tICcuLy4uLydcbmltcG9ydCB7IFRab25lVGF0dG9vIH0gZnJvbSAnQGRhdGFUeXBlcy90YXR0b29zJztcbmltcG9ydCB7IGRlYnVnZGF0YSB9IGZyb20gJ0B1dGlscyc7XG5cbmNvbnN0IGdldFRhdHRvb3MgPSAoKTogVFpvbmVUYXR0b29bXSA9PiB7XG4gICAgY29uc3QgW1RBVFRPT19MSVNULCBUQVRUT09fQ0FURUdPUklFU10gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UudGF0dG9vcygpXG4gICAgY29uc3QgdGF0dG9vWm9uZXM6IFRab25lVGF0dG9vW10gPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgVEFUVE9PX0NBVEVHT1JJRVMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBUQVRUT09fQ0FURUdPUklFU1tpXTtcblxuICAgICAgICBjb25zdCBpbmRleCA9IGNhdGVnb3J5LmluZGV4XG4gICAgICAgIGNvbnN0IHpvbmUgPSBjYXRlZ29yeS56b25lXG4gICAgICAgIGNvbnN0IGxhYmVsID0gY2F0ZWdvcnkubGFiZWxcblxuICAgICAgICB0YXR0b29ab25lc1tpbmRleF0gPSB7XG4gICAgICAgICAgICB6b25lLFxuICAgICAgICAgICAgbGFiZWwsXG4gICAgICAgICAgICB6b25lSW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgZGxjczogW10sXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBUQVRUT09fTElTVC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgY29uc3QgZGxjRGF0YSA9IFRBVFRPT19MSVNUW2pdO1xuICAgICAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdLmRsY3Nbal0gPSB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IGRsY0RhdGEuZGxjLFxuICAgICAgICAgICAgICAgIGRsY0luZGV4OiBqLFxuICAgICAgICAgICAgICAgIHRhdHRvb3M6IFtdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGlzRmVtYWxlID0gR2V0RW50aXR5TW9kZWwocGVkKSA9PT0gR2V0SGFzaEtleSgnbXBfZl9mcmVlbW9kZV8wMScpO1xuXG4gICAgZm9yIChsZXQgZGxjSW5kZXggPSAwOyBkbGNJbmRleCA8IFRBVFRPT19MSVNULmxlbmd0aDsgZGxjSW5kZXgrKykge1xuICAgICAgICBjb25zdCBkYXRhID0gVEFUVE9PX0xJU1RbZGxjSW5kZXhdO1xuICAgICAgICBjb25zdCB7IGRsYywgdGF0dG9vcyB9ID0gZGF0YTtcbiAgICAgICAgY29uc3QgZGxjSGFzaCA9IEdldEhhc2hLZXkoZGxjKTtcbiAgICAgICAgY29uc3QgdGF0dG9vRGF0YUxpc3QgPSB0YXR0b29zIHx8IFtdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGF0dG9vRGF0YUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvb0RhdGEgPSB0YXR0b29EYXRhTGlzdFtpXTtcbiAgICAgICAgICAgIGxldCB0YXR0b286IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgICAgICBjb25zdCBsb3dlclRhdHRvbyA9IHRhdHRvb0RhdGEudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGNvbnN0IGlzRmVtYWxlVGF0dG9vID0gbG93ZXJUYXR0b28uaW5jbHVkZXMoJ19mJyk7XG5cbiAgICAgICAgICAgIGlmIChpc0ZlbWFsZVRhdHRvbyAmJiBpc0ZlbWFsZSkge1xuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpc0ZlbWFsZVRhdHRvbyAmJiAhaXNGZW1hbGUpIHtcbiAgICAgICAgICAgICAgICB0YXR0b28gPSB0YXR0b29EYXRhO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFzaCA9IEdldEhhc2hLZXkodGF0dG9vKTtcbiAgICAgICAgICAgICAgICBjb25zdCB6b25lID0gR2V0UGVkRGVjb3JhdGlvblpvbmVGcm9tSGFzaGVzKGRsY0hhc2gsIGhhc2gpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHpvbmUgIT09IC0xICYmIGhhc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgem9uZVRhdHRvb3MgPSB0YXR0b29ab25lc1t6b25lXS5kbGNzW2RsY0luZGV4XS50YXR0b29zO1xuXG4gICAgICAgICAgICAgICAgICAgIHpvbmVUYXR0b29zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRhdHRvbyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc2gsXG4gICAgICAgICAgICAgICAgICAgICAgICB6b25lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGxjLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGF0dG9vWm9uZXM7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldFRhdHRvb3MiLCAiZXhwb3J0IGRlZmF1bHQgWydoZXJpdGFnZScsICdoYWlyJywgJ2Nsb3RoZXMnLCAnYWNjZXNzb3JpZXMnLCAnZmFjZScsICdtYWtldXAnLCAnb3V0Zml0cycsICd0YXR0b29zJ11cbiIsICJleHBvcnQgZW51bSBzZW5kIHtcbiAgICB2aXNpYmxlID0gJ2FwcGVhcmFuY2U6dmlzaWJsZScsXG4gICAgZGF0YSA9ICdhcHBlYXJhbmNlOmRhdGEnLFxufVxuXG5leHBvcnQgZW51bSBhcHBlYXJhbmNlIHtcbiAgICBzZXRNb2RlbCA9ICdhcHBlYXJhbmNlOnNldE1vZGVsJyxcbiAgICBzZXRIZWFkU3RydWN0dXJlID0gJ2FwcGVhcmFuY2U6c2V0SGVhZFN0cnVjdHVyZScsXG4gICAgc2V0SGVhZE92ZXJsYXkgPSAnYXBwZWFyYW5jZTpzZXRIZWFkT3ZlcmxheScsXG4gICAgc2V0SGVhZEJsZW5kID0gJ2FwcGVhcmFuY2U6c2V0SGVhZEJsZW5kJyxcbiAgICBzZXRQcm9wID0gJ2FwcGVhcmFuY2U6c2V0UHJvcCcsXG4gICAgc2V0RHJhd2FibGUgPSAnYXBwZWFyYW5jZTpzZXREcmF3YWJsZScsXG4gICAgc2V0VGF0dG9vcyA9ICdhcHBlYXJhbmNlOnNldFRhdHRvb3MnLFxuICAgIGdldE1vZGVsVGF0dG9vcyA9ICdhcHBlYXJhbmNlOmdldE1vZGVsVGF0dG9vcycsXG59XG5cbmV4cG9ydCBlbnVtIG91dGZpdHMge1xuICAgIHVzZU91dGZpdCA9ICdhcHBlYXJhbmNlOnVzZU91dGZpdCcsXG4gICAgcmVuYW1lT3V0Zml0ID0gJ2FwcGVhcmFuY2U6cmVuYW1lT3V0Zml0JyxcbiAgICBkZWxldGVPdXRmaXQgPSAnYXBwZWFyYW5jZTpkZWxldGVPdXRmaXQnLFxuICAgIHNhdmVPdXRmaXQgPSAnYXBwZWFyYW5jZTpzYXZlT3V0Zml0Jyxcbn1cblxuZXhwb3J0IGVudW0gcmVjZWl2ZSB7XG4gICAgY2xvc2UgPSAnYXBwZWFyYW5jZTpjbG9zZScsXG5cbiAgICB0b2dnbGVJdGVtID0gJ2FwcGVhcmFuY2U6dG9nZ2xlSXRlbScsXG5cbiAgICBzYXZlID0gJ2FwcGVhcmFuY2U6c2F2ZScsXG4gICAgY2FuY2VsID0gJ2FwcGVhcmFuY2U6Y2FuY2VsJyxcblxuICAgIGNhbVpvb20gPSAnYXBwZWFyYW5jZTpjYW1ab29tJyxcbiAgICBjYW1Nb3ZlID0gJ2FwcGVhcmFuY2U6Y2FtTW92ZScsXG4gICAgY2FtU2Nyb2xsID0gJ2FwcGVhcmFuY2U6Y2FtU2Nyb2xsJyxcbn1cbiIsICJleHBvcnQgY29uc3QgZGVidWdkYXRhID0gKGRhdGE6IGFueSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGEsIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXG4vZywgXCJcXFxcblwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSwgMikpXG59XG5cbmV4cG9ydCBjb25zdCBzZW5kTlVJRXZlbnQgPSAoYWN0aW9uOiBzdHJpbmcsIGRhdGE6IGFueSkgPT4ge1xuICAgIFNlbmROVUlNZXNzYWdlKHtcbiAgICAgICAgYWN0aW9uOiBhY3Rpb24sXG4gICAgICAgIGRhdGE6IGRhdGFcbiAgICB9KTtcbn1cblxuZXhwb3J0IGNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcblxuZXhwb3J0IGNvbnN0IHJlcXVlc3RNb2RlbCA9IGFzeW5jIChtb2RlbDogc3RyaW5nIHwgbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+ID0+IHtcbiAgICBsZXQgbW9kZWxIYXNoOiBudW1iZXIgPSB0eXBlb2YgbW9kZWwgPT09ICdudW1iZXInID8gbW9kZWwgOiBHZXRIYXNoS2V5KG1vZGVsKVxuXG4gICAgaWYgKCFJc01vZGVsVmFsaWQobW9kZWxIYXNoKSkge1xuICAgICAgICBleHBvcnRzLmJsX2JyaWRnZS5ub3RpZnkoKSh7XG4gICAgICAgICAgICB0aXRsZTogJ0ludmFsaWQgbW9kZWwhJyxcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICBkdXJhdGlvbjogMTAwMFxuICAgICAgICB9KVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgYXR0ZW1wdGVkIHRvIGxvYWQgaW52YWxpZCBtb2RlbCAnJHttb2RlbH0nYCk7XG4gICAgfVxuXG4gICAgaWYgKEhhc01vZGVsTG9hZGVkKG1vZGVsSGFzaCkpIHJldHVybiBtb2RlbEhhc2hcbiAgICBcbiAgICBSZXF1ZXN0TW9kZWwobW9kZWxIYXNoKTtcblxuICAgIGNvbnN0IHdhaXRGb3JNb2RlbExvYWRlZCA9ICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKEhhc01vZGVsTG9hZGVkKG1vZGVsSGFzaCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXdhaXQgd2FpdEZvck1vZGVsTG9hZGVkKCk7XG5cbiAgICByZXR1cm4gbW9kZWxIYXNoO1xufTtcblxuXG4vL2NhbGxiYWNrXG4vL2h0dHBzOi8vZ2l0aHViLmNvbS9vdmVyZXh0ZW5kZWQvb3hfbGliL2Jsb2IvbWFzdGVyL3BhY2thZ2UvY2xpZW50L3Jlc291cmNlL2NhbGxiYWNrL2luZGV4LnRzXG5cbmNvbnN0IHJlc291cmNlTmFtZSA9IEdldEN1cnJlbnRSZXNvdXJjZU5hbWUoKVxuY29uc3QgZXZlbnRUaW1lcnM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcbmNvbnN0IGFjdGl2ZUV2ZW50czogUmVjb3JkPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkPiA9IHt9O1xuXG5mdW5jdGlvbiBldmVudFRpbWVyKGV2ZW50TmFtZTogc3RyaW5nLCBkZWxheTogbnVtYmVyIHwgbnVsbCkge1xuICAgIGlmIChkZWxheSAmJiBkZWxheSA+IDApIHtcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBHZXRHYW1lVGltZXIoKTtcblxuICAgICAgICBpZiAoKGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gfHwgMCkgPiBjdXJyZW50VGltZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gPSBjdXJyZW50VGltZSArIGRlbGF5O1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xufVxuXG5vbk5ldChgX19veF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5OiBzdHJpbmcsIC4uLmFyZ3M6IGFueSkgPT4ge1xuICAgIGNvbnN0IHJlc29sdmUgPSBhY3RpdmVFdmVudHNba2V5XTtcbiAgICByZXR1cm4gcmVzb2x2ZSAmJiByZXNvbHZlKC4uLmFyZ3MpO1xufSk7XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8VCA9IHVua25vd24+KFxuICAgIGV2ZW50TmFtZTogc3RyaW5nLFxuICAgIGRlbGF5OiBudW1iZXIgfCBudWxsLFxuICAgIC4uLmFyZ3M6IGFueVxuKTogUHJvbWlzZTxUPiB8IHZvaWQge1xuICAgIGlmICghZXZlbnRUaW1lcihldmVudE5hbWUsIGRlbGF5KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGtleTogc3RyaW5nO1xuXG4gICAgZG8ge1xuICAgICAgICBrZXkgPSBgJHtldmVudE5hbWV9OiR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDEwMDAwMCArIDEpKX1gO1xuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcblxuICAgIGVtaXROZXQoYF9fb3hfY2JfJHtldmVudE5hbWV9YCwgcmVzb3VyY2VOYW1lLCBrZXksIC4uLmFyZ3MpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGFjdGl2ZUV2ZW50c1trZXldID0gcmVzb2x2ZTtcbiAgICB9KTtcbn07XG5cbi8vbG9jYWxlXG5cbmV4cG9ydCBjb25zdCByZXF1ZXN0TG9jYWxlID0gKHJlc291cmNlU2V0TmFtZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNvbnN0IGNoZWNrUmVzb3VyY2VGaWxlID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKFJlcXVlc3RSZXNvdXJjZUZpbGVTZXQocmVzb3VyY2VTZXROYW1lKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRMYW4gPSBleHBvcnRzLmJsX2FwcGVhcmFuY2UuY29uZmlnKCkubG9jYWxlXG4gICAgICAgICAgICAgICAgbGV0IGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvJHtjdXJyZW50TGFufS5qc29uYCk7XG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbGVGaWxlQ29udGVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke2N1cnJlbnRMYW59Lmpzb24gbm90IGZvdW5kIGluIGxvY2FsZSwgcGxlYXNlIHZlcmlmeSEsIHdlIHVzZWQgZW5nbGlzaCBmb3Igbm93IWApXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZUZpbGVDb250ZW50ID0gTG9hZFJlc291cmNlRmlsZShyZXNvdXJjZU5hbWUsIGBsb2NhbGUvZW4uanNvbmApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc29sdmUobG9jYWxlRmlsZUNvbnRlbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGNoZWNrUmVzb3VyY2VGaWxlLCAxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNoZWNrUmVzb3VyY2VGaWxlKCk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBjb25zdCBsb2NhbGUgPSBhc3luYyAoaWQ6IHN0cmluZywgLi4uYXJnczogc3RyaW5nW10pID0+IHtcbiAgICBjb25zdCBsb2NhbGUgPSBhd2FpdCByZXF1ZXN0TG9jYWxlKCdsb2NhbGUnKTtcbiAgICBsZXQgYXJnSW5kZXggPSAwO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gbG9jYWxlW2lkXS5yZXBsYWNlKC8lcy9nLCAobWF0Y2g6IHN0cmluZykgPT4gYXJnSW5kZXggPCBhcmdzLmxlbmd0aCA/IGFyZ3NbYXJnSW5kZXhdIDogbWF0Y2gpO1xuICAgIHJldHVybiByZXN1bHRcbn1cblxuZXhwb3J0IGNvbnN0IGdldEZyYW1ld29ya0lEID0gKCkgPT4ge1xuICAgIHJldHVybiBleHBvcnRzLmJsX2FwcGVhcmFuY2UuY29uZmlnKCkudXNlQnJpZGdlID8gZXhwb3J0cy5ibF9icmlkZ2UuY29yZSAmJiBleHBvcnRzLmJsX2JyaWRnZS5jb3JlKCkuZ2V0UGxheWVyRGF0YSgpLmNpZCA6IG51bGw7XG59IiwgImltcG9ydCB7IENhbWVyYSwgVmVjdG9yMywgQ2FtZXJhQm9uZXMgfSBmcm9tICdAZGF0YVR5cGVzL2NhbWVyYSc7XG5pbXBvcnQge3BlZH0gZnJvbSAnLi8uLi9tZW51JztcbmltcG9ydCB7IGRlbGF5fSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyByZWNlaXZlIH0gZnJvbSAnQGVudW1zJztcblxubGV0IHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcbmxldCBjYW1EaXN0YW5jZTogbnVtYmVyID0gMS44O1xubGV0IGNhbTogQ2FtZXJhIHwgbnVsbCA9IG51bGw7XG5sZXQgYW5nbGVZOiBudW1iZXIgPSAwLjA7XG5sZXQgYW5nbGVaOiBudW1iZXIgPSAwLjA7XG5sZXQgdGFyZ2V0Q29vcmRzOiBWZWN0b3IzIHwgbnVsbCA9IG51bGw7XG5sZXQgb2xkQ2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcbmxldCBjaGFuZ2luZ0NhbTogYm9vbGVhbiA9IGZhbHNlO1xubGV0IGxhc3RYOiBudW1iZXIgPSAwO1xubGV0IGN1cnJlbnRCb25lOiBrZXlvZiBDYW1lcmFCb25lcyA9ICdoZWFkJ1xuXG5jb25zdCBDYW1lcmFCb25lczogQ2FtZXJhQm9uZXMgPSB7XG4gICAgaGVhZDogMzEwODYsXG4gICAgdG9yc286IDI0ODE4LFxuICAgIGxlZ3M6IDE0MjAxLFxufTtcblxuY29uc3QgY29zID0gKGRlZ3JlZXM6IG51bWJlcik6IG51bWJlciA9PiB7XG4gICAgcmV0dXJuIE1hdGguY29zKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xufVxuXG5jb25zdCBzaW4gPSAoZGVncmVlczogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgICByZXR1cm4gTWF0aC5zaW4oKGRlZ3JlZXMgKiBNYXRoLlBJKSAvIDE4MCk7XG59XG5cbmNvbnN0IGdldEFuZ2xlcyA9ICgpOiBudW1iZXJbXSA9PiB7XG4gICAgY29uc3QgeCA9KChjb3MoYW5nbGVaKSAqIGNvcyhhbmdsZVkpKSArIChjb3MoYW5nbGVZKSAqIGNvcyhhbmdsZVopKSkgLyAyICogY2FtRGlzdGFuY2U7XG4gICAgY29uc3QgeSA9ICgoc2luKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSkgKyAoY29zKGFuZ2xlWSkgKiBzaW4oYW5nbGVaKSkpIC8gMiAqIGNhbURpc3RhbmNlO1xuICAgIGNvbnN0IHogPSBzaW4oYW5nbGVZKSAqIGNhbURpc3RhbmNlO1xuXG4gICAgcmV0dXJuIFt4LCB5LCB6XVxufVxuXG5cbmNvbnN0IHNldENhbVBvc2l0aW9uID0gKG1vdXNlWD86IG51bWJlciwgbW91c2VZPzogbnVtYmVyKTogdm9pZCA9PiB7XG4gICAgaWYgKCFydW5uaW5nIHx8ICF0YXJnZXRDb29yZHMgfHwgY2hhbmdpbmdDYW0pIHJldHVybjtcblxuICAgIG1vdXNlWCA9IG1vdXNlWCA/PyAwLjA7XG4gICAgbW91c2VZID0gbW91c2VZID8/IDAuMDtcblxuICAgIGFuZ2xlWiAtPSBtb3VzZVg7XG4gICAgYW5nbGVZICs9IG1vdXNlWTtcbiAgICBhbmdsZVkgPSBNYXRoLm1pbihNYXRoLm1heChhbmdsZVksIDAuMCksIDg5LjApO1xuXG4gICAgY29uc3QgW3gsIHksIHpdID0gZ2V0QW5nbGVzKClcblxuICAgIFNldENhbUNvb3JkKGNhbSwgdGFyZ2V0Q29vcmRzLnggKyB4LCB0YXJnZXRDb29yZHMueSArIHksIHRhcmdldENvb3Jkcy56ICsgeilcbiAgICBQb2ludENhbUF0Q29vcmQoY2FtLCB0YXJnZXRDb29yZHMueCwgdGFyZ2V0Q29vcmRzLnksIHRhcmdldENvb3Jkcy56KVxufVxuXG5jb25zdCBtb3ZlQ2FtZXJhID0gYXN5bmMgKGNvb3JkczogVmVjdG9yMywgZGlzdGFuY2U/OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCBoZWFkaW5nOiBudW1iZXIgPSBHZXRFbnRpdHlIZWFkaW5nKHBlZCkgKyA5NDtcbiAgICBkaXN0YW5jZSA9IGRpc3RhbmNlID8/IDEuMDtcblxuICAgIGNoYW5naW5nQ2FtID0gdHJ1ZTtcbiAgICBjYW1EaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgIGFuZ2xlWiA9IGhlYWRpbmc7XG5cbiAgICBjb25zdCBbeCwgeSwgel0gPSBnZXRBbmdsZXMoKVxuXG4gICAgY29uc3QgbmV3Y2FtOiBDYW1lcmEgPSBDcmVhdGVDYW1XaXRoUGFyYW1zKFxuICAgICAgICBcIkRFRkFVTFRfU0NSSVBURURfQ0FNRVJBXCIsXG4gICAgICAgIGNvb3Jkcy54ICsgeCxcbiAgICAgICAgY29vcmRzLnkgKyB5LFxuICAgICAgICBjb29yZHMueiArIHosXG4gICAgICAgIDAuMCxcbiAgICAgICAgMC4wLFxuICAgICAgICAwLjAsXG4gICAgICAgIDcwLjAsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICAwXG4gICAgKTtcblxuICAgIHRhcmdldENvb3JkcyA9IGNvb3JkcztcbiAgICBjaGFuZ2luZ0NhbSA9IGZhbHNlO1xuICAgIG9sZENhbSA9IGNhbVxuICAgIGNhbSA9IG5ld2NhbTtcblxuICAgIFBvaW50Q2FtQXRDb29yZChuZXdjYW0sIGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnopO1xuICAgIFNldENhbUFjdGl2ZVdpdGhJbnRlcnAobmV3Y2FtLCBvbGRDYW0sIDI1MCwgMCwgMCk7XG5cbiAgICBhd2FpdCBkZWxheSgyNTApXG5cbiAgICBTZXRDYW1Vc2VTaGFsbG93RG9mTW9kZShuZXdjYW0sIHRydWUpO1xuICAgIFNldENhbU5lYXJEb2YobmV3Y2FtLCAwLjQpO1xuICAgIFNldENhbUZhckRvZihuZXdjYW0sIDEuMik7XG4gICAgU2V0Q2FtRG9mU3RyZW5ndGgobmV3Y2FtLCAwLjMpO1xuICAgIHVzZUhpRG9mKG5ld2NhbSk7XG5cbiAgICBEZXN0cm95Q2FtKG9sZENhbSwgdHJ1ZSk7XG59XG5cbmNvbnN0IHVzZUhpRG9mID0gKGN1cnJlbnRjYW06IENhbWVyYSkgPT4ge1xuICAgIGlmICghKERvZXNDYW1FeGlzdChjYW0pICYmIGN1cnJlbnRjYW0gPT0gY2FtKSkgcmV0dXJuO1xuICAgIFNldFVzZUhpRG9mKCk7XG4gICAgc2V0VGltZW91dCh1c2VIaURvZiwgMCk7XG59XG5cbmV4cG9ydCBjb25zdCBzdGFydENhbWVyYSA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAocnVubmluZykgcmV0dXJuO1xuICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgIGNhbURpc3RhbmNlID0gMS4wO1xuICAgIGNhbSA9IENyZWF0ZUNhbShcIkRFRkFVTFRfU0NSSVBURURfQ0FNRVJBXCIsIHRydWUpO1xuICAgIGNvbnN0IFt4LCB5LCB6XTogbnVtYmVyW10gPSBHZXRQZWRCb25lQ29vcmRzKHBlZCwgMzEwODYsIDAuMCwgMC4wLCAwLjApXG4gICAgU2V0Q2FtQ29vcmQoY2FtLCB4LCB5LCB6KVxuICAgIFJlbmRlclNjcmlwdENhbXModHJ1ZSwgdHJ1ZSwgMTAwMCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgbW92ZUNhbWVyYSh7eDogeCwgeTogeSwgejogen0sIGNhbURpc3RhbmNlKTtcbn1cblxuZXhwb3J0IGNvbnN0IHN0b3BDYW1lcmEgPSAoKTogdm9pZCA9PiB7XG4gICAgaWYgKCFydW5uaW5nKSByZXR1cm47XG4gICAgcnVubmluZyA9IGZhbHNlO1xuXG4gICAgUmVuZGVyU2NyaXB0Q2FtcyhmYWxzZSwgdHJ1ZSwgMjUwLCB0cnVlLCBmYWxzZSk7XG4gICAgRGVzdHJveUNhbShjYW0sIHRydWUpO1xuICAgIGNhbSA9IG51bGw7XG4gICAgdGFyZ2V0Q29vcmRzID0gbnVsbDtcbn1cblxuY29uc3Qgc2V0Q2FtZXJhID0gKHR5cGU/OiBrZXlvZiBDYW1lcmFCb25lcyk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGJvbmU6IG51bWJlciB8IHVuZGVmaW5lZCA9IENhbWVyYUJvbmVzW3R5cGVdO1xuICAgIGlmIChjdXJyZW50Qm9uZSA9PSB0eXBlKSByZXR1cm47XG4gICAgY29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IGJvbmUgPyBHZXRQZWRCb25lQ29vcmRzKHBlZCwgYm9uZSwgMC4wLCAwLjAsIGJvbmUgPT09IDE0MjAxID8gMC4yIDogMC4wKSA6IEdldEVudGl0eUNvb3JkcyhwZWQsIGZhbHNlKTtcblxuICAgIG1vdmVDYW1lcmEoe1xuICAgICAgICB4OiB4LCBcbiAgICAgICAgeTogeSwgXG4gICAgICAgIHo6IHogKyAwLjBcbiAgICB9LCAxLjApO1xuXG4gICAgY3VycmVudEJvbmUgPSB0eXBlO1xufVxuXG5SZWdpc3Rlck51aUNhbGxiYWNrKHJlY2VpdmUuY2FtTW92ZSwgKGRhdGEsIGNiKSA9PiB7XG4gICAgY2IoMSlcbiAgICBsZXQgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpO1xuICAgIGlmIChsYXN0WCA9PSBkYXRhLngpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBoZWFkaW5nID0gZGF0YS54ID4gbGFzdFggPyBoZWFkaW5nICsgNSA6IGhlYWRpbmcgLSA1O1xuICAgIFNldEVudGl0eUhlYWRpbmcocGVkLCBoZWFkaW5nKTtcbn0pO1xuXG5SZWdpc3Rlck51aUNhbGxiYWNrKHJlY2VpdmUuY2FtU2Nyb2xsLCAodHlwZTogbnVtYmVyLCBjYjogRnVuY3Rpb24pID0+IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgc2V0Q2FtZXJhKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgc2V0Q2FtZXJhKFwibGVnc1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBzZXRDYW1lcmEoXCJoZWFkXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNiKDEpO1xufSk7XG5cblJlZ2lzdGVyTnVpQ2FsbGJhY2socmVjZWl2ZS5jYW1ab29tLCAoZGF0YSwgY2IpID0+IHtcbiAgICBpZiAoZGF0YSA9PT0gXCJkb3duXCIpIHtcbiAgICAgICAgY29uc3QgbmV3RGlzdGFuY2U6IG51bWJlciA9IGNhbURpc3RhbmNlICsgMC4wNTtcbiAgICAgICAgY2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA+PSAxLjAgPyAxLjAgOiBuZXdEaXN0YW5jZTtcbiAgICB9IGVsc2UgaWYgKGRhdGEgPT09IFwidXBcIikge1xuICAgICAgICBjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgLSAwLjA1O1xuICAgICAgICBjYW1EaXN0YW5jZSA9IG5ld0Rpc3RhbmNlIDw9IDAuMzUgPyAwLjM1IDogbmV3RGlzdGFuY2U7XG4gICAgfVxuXG4gICAgY2FtRGlzdGFuY2UgPSBjYW1EaXN0YW5jZTtcbiAgICBzZXRDYW1Qb3NpdGlvbigpO1xuICAgIGNiKDEpO1xufSk7XG5cbiIsICJpbXBvcnQgZ2V0QXBwZWFyYW5jZSBmcm9tICcuL2FwcGVhcmFuY2UnXG5pbXBvcnQgZ2V0VGF0dG9vcyBmcm9tICcuL3RhdHRvb3MnXG5pbXBvcnQgeyBUQXBwZWFyYW5jZX0gZnJvbSAnQGRhdGFUeXBlcy9hcHBlYXJhbmNlJztcbmltcG9ydCB7IE91dGZpdH0gZnJvbSAnQGRhdGFUeXBlcy9vdXRmaXRzJztcbmltcG9ydCB7IFRUYXR0b299IGZyb20gJ0BkYXRhVHlwZXMvdGF0dG9vcyc7XG5pbXBvcnQgbWVudVR5cGVzIGZyb20gJy4uLy4uL2RhdGEvbWVudVR5cGVzJztcbmltcG9ydCB7IHNlbmQsIHJlY2VpdmUgfSBmcm9tICdAZW51bXMnXG5pbXBvcnQgeyBzZW5kTlVJRXZlbnQsIGRlbGF5LCByZXF1ZXN0TG9jYWxlLCByZXF1ZXN0TW9kZWwsIHRyaWdnZXJTZXJ2ZXJDYWxsYmFjaywgZ2V0RnJhbWV3b3JrSUQgfSBmcm9tICdAdXRpbHMnXG5pbXBvcnQgeyBzdGFydENhbWVyYSwgc3RvcENhbWVyYSB9IGZyb20gJy4vLi4vY2FtZXJhJ1xuXG5leHBvcnQgbGV0IHBsYXllckFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlIHwgbnVsbCA9IG51bGxcblxuY29uc3QgYmxfYXBwZWFyYW5jZSA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZVxuZXhwb3J0IGxldCBpc01lbnVPcGVuID0gZmFsc2VcbmV4cG9ydCBsZXQgcGVkID0gMFxuXG5jb25zdCB1cGRhdGVQZWQgPSAoKSA9PiB7XG4gICAgaWYgKCFpc01lbnVPcGVuKSByZXR1cm47XG4gICAgcGVkID0gUGxheWVyUGVkSWQoKVxuICAgIHNldFRpbWVvdXQodXBkYXRlUGVkLCAxMDApO1xufVxuXG5jb25zdCB2YWxpZE1lbnVUeXBlcyA9ICh0eXBlOiBzdHJpbmdbXSkgPT4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHlwZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIW1lbnVUeXBlcy5pbmNsdWRlcyh0eXBlW2ldKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmNvbnN0IGdldEJsYWNrbGlzdCA9ICgpID0+IHtcbiAgICByZXR1cm4gYmxfYXBwZWFyYW5jZS5ibGFja2xpc3QoKVxuXG59XG5cbmV4cG9ydCBjb25zdCBvcGVuTWVudSA9IGFzeW5jICh0eXBlOiBzdHJpbmdbXSB8IHN0cmluZykgPT4ge1xuICAgIGlzTWVudU9wZW4gPSB0cnVlXG4gICAgdXBkYXRlUGVkKClcbiAgICBhd2FpdCBkZWxheSgxNTApXG4gICAgc3RhcnRDYW1lcmEoKVxuXG4gICAgY29uc3QgaXNBcnJheSA9IHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJ1xuXG4gICAgaWYgKGlzQXJyYXkgJiYgIXZhbGlkTWVudVR5cGVzKHR5cGUpKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKCdFcnJvcjogbWVudSB0eXBlIG5vdCBmb3VuZCcpO1xuICAgIH1cbiAgICBjb25zdCBmcmFtZXdvcmtkSWQgPSBnZXRGcmFtZXdvcmtJRCgpXG4gICAgY29uc3Qgc2VydmVySUQgPSBHZXRQbGF5ZXJTZXJ2ZXJJZChQbGF5ZXJJZCgpKVxuICAgIGNvbnN0IG91dGZpdHMgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8T3V0Zml0W10+KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRPdXRmaXRzJywgZnJhbWV3b3JrZElkKSBhcyBPdXRmaXRbXSBcbiAgICBjb25zdCB0YXR0b29zID0gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrPFRUYXR0b29bXT4oJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldFRhdHRvb3MnLCBmcmFtZXdvcmtkSWQpIGFzIFRUYXR0b29bXVxuXG4gICAgY29uc3QgYXBwZWFyYW5jZSA9IGF3YWl0IGdldEFwcGVhcmFuY2UoKVxuICAgIHBsYXllckFwcGVhcmFuY2UgPSBhcHBlYXJhbmNlXG4gICAgcGxheWVyQXBwZWFyYW5jZS50YXR0b29zID0gdGF0dG9vc1xuXG4gICAgc2VuZE5VSUV2ZW50KHNlbmQuZGF0YSwge1xuICAgICAgICB0YWJzOiBpc0FycmF5ID8gdHlwZSA6IG1lbnVUeXBlcy5pbmNsdWRlcyh0eXBlKSA/IHR5cGUgOiBtZW51VHlwZXMsXG4gICAgICAgIGFwcGVhcmFuY2U6IGFwcGVhcmFuY2UsXG4gICAgICAgIGJsYWNrbGlzdDogZ2V0QmxhY2tsaXN0KCksXG4gICAgICAgIHRhdHRvb3M6IGdldFRhdHRvb3MoKSxcbiAgICAgICAgb3V0Zml0czogb3V0Zml0cyxcbiAgICAgICAgbW9kZWxzOiBibF9hcHBlYXJhbmNlLm1vZGVscygpLFxuICAgICAgICBsb2NhbGU6IGF3YWl0IHJlcXVlc3RMb2NhbGUoJ2xvY2FsZScpXG4gICAgfSlcblxuICAgIHNlbmROVUlFdmVudChzZW5kLnZpc2libGUsIHRydWUpXG4gICAgU2V0TnVpRm9jdXModHJ1ZSwgdHJ1ZSlcbn1cblxuZXhwb3J0IGNvbnN0IHNldEFwcGVhcmFuY2UgPSBhc3luYyAoYXBwZWFyYW5jZURhdGE6IFRBcHBlYXJhbmNlKSA9PiB7XG4gICAgY29uc3QgbW9kZWwgPSBhcHBlYXJhbmNlRGF0YS5tb2RlbFxuICAgIGlmIChtb2RlbCkge1xuICAgICAgICBjb25zdCBtb2RlbEhhc2ggPSBhd2FpdCByZXF1ZXN0TW9kZWwobW9kZWwpXG4gICAgXG4gICAgICAgIFNldFBsYXllck1vZGVsKFBsYXllcklkKCksIG1vZGVsSGFzaClcbiAgICBcbiAgICAgICAgYXdhaXQgZGVsYXkoMTUwKVxuICAgIFxuICAgICAgICBTZXRNb2RlbEFzTm9Mb25nZXJOZWVkZWQobW9kZWxIYXNoKVxuICAgICAgICBTZXRQZWREZWZhdWx0Q29tcG9uZW50VmFyaWF0aW9uKHBlZClcbiAgICBcbiAgICAgICAgaWYgKG1vZGVsID09PSBHZXRIYXNoS2V5KFwibXBfbV9mcmVlbW9kZV8wMVwiKSkgU2V0UGVkSGVhZEJsZW5kRGF0YShwZWQsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIGZhbHNlKVxuICAgICAgICBlbHNlIGlmIChtb2RlbCA9PT0gR2V0SGFzaEtleShcIm1wX2ZfZnJlZW1vZGVfMDFcIikpIFNldFBlZEhlYWRCbGVuZERhdGEocGVkLCA0NSwgMjEsIDAsIDIwLCAxNSwgMCwgMC4zLCAwLjEsIDAsIGZhbHNlKVxuICAgIH1cblxuICAgIGNvbnN0IGhlYWRCbGVuZCA9IGFwcGVhcmFuY2VEYXRhLmhlYWRCbGVuZFxuICAgIGlmIChoZWFkQmxlbmQpIFNldFBlZEhlYWRCbGVuZERhdGEocGVkLCBoZWFkQmxlbmQuc2hhcGVGaXJzdCwgaGVhZEJsZW5kLnNoYXBlU2Vjb25kLCBoZWFkQmxlbmQuc2hhcGVUaGlyZCwgaGVhZEJsZW5kLnNraW5GaXJzdCwgaGVhZEJsZW5kLnNraW5TZWNvbmQsIGhlYWRCbGVuZC5za2luVGhpcmQsIGhlYWRCbGVuZC5zaGFwZU1peCwgaGVhZEJsZW5kLnNraW5NaXgsIGhlYWRCbGVuZC50aGlyZE1peCwgaGVhZEJsZW5kLmhhc1BhcmVudClcblxuICAgIGlmIChhcHBlYXJhbmNlRGF0YS5oZWFkU3RydWN0dXJlKSBmb3IgKGNvbnN0IGRhdGEgb2YgT2JqZWN0LnZhbHVlcyhhcHBlYXJhbmNlRGF0YS5oZWFkU3RydWN0dXJlKSkge1xuICAgICAgICBTZXRQZWRGYWNlRmVhdHVyZShwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpXG4gICAgfVxuXG4gICAgaWYgKGFwcGVhcmFuY2VEYXRhLmRyYXdhYmxlcykgZm9yIChjb25zdCBkYXRhIG9mIE9iamVjdC52YWx1ZXMoYXBwZWFyYW5jZURhdGEuZHJhd2FibGVzKSkge1xuICAgICAgICBpZiAoZGF0YS5pbmRleCA9PT0gMikgY29uc29sZS5sb2coZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlKVxuICAgICAgICBTZXRQZWRDb21wb25lbnRWYXJpYXRpb24ocGVkLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlLCBkYXRhLnRleHR1cmUsIDApXG4gICAgfVxuXG4gICAgaWYgKGFwcGVhcmFuY2VEYXRhLnByb3BzKSBmb3IgKGNvbnN0IGRhdGEgb2YgT2JqZWN0LnZhbHVlcyhhcHBlYXJhbmNlRGF0YS5wcm9wcykpIHtcbiAgICAgICAgaWYgKGRhdGEudmFsdWUgPT09IC0xKSB7XG4gICAgICAgICAgICBDbGVhclBlZFByb3AocGVkLCBkYXRhLmluZGV4KVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgfVxuICAgICAgICBTZXRQZWRQcm9wSW5kZXgocGVkLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlLCBkYXRhLnRleHR1cmUsIGZhbHNlKVxuICAgIH1cblxuICAgIGlmIChhcHBlYXJhbmNlRGF0YS5oYWlyQ29sb3IpIHtcbiAgICAgICAgU2V0UGVkSGFpckNvbG9yKHBlZCwgYXBwZWFyYW5jZURhdGEuaGFpckNvbG9yLmNvbG9yLCBhcHBlYXJhbmNlRGF0YS5oYWlyQ29sb3IuaGlnaGxpZ2h0KSBcbiAgICB9XG5cbiAgICBpZiAoYXBwZWFyYW5jZURhdGEuaGVhZE92ZXJsYXkpIGZvciAoY29uc3QgZGF0YSBvZiBPYmplY3QudmFsdWVzKGFwcGVhcmFuY2VEYXRhLmhlYWRPdmVybGF5KSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlID09IC0xID8gMjU1IDogZGF0YS5vdmVybGF5VmFsdWVcblxuICAgICAgICBpZiAoZGF0YS5pZCA9PT0gJ0V5ZUNvbG9yJykgU2V0UGVkRXllQ29sb3IocGVkLCB2YWx1ZSkgXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgU2V0UGVkSGVhZE92ZXJsYXkocGVkLCBkYXRhLmluZGV4LCB2YWx1ZSwgZGF0YS5vdmVybGF5T3BhY2l0eSlcbiAgICAgICAgICAgIFNldFBlZEhlYWRPdmVybGF5Q29sb3IocGVkLCBkYXRhLmluZGV4LCAxLCBkYXRhLmZpcnN0Q29sb3IsIGRhdGEuc2Vjb25kQ29sb3IpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYXBwZWFyYW5jZURhdGEudGF0dG9vcykge1xuICAgICAgICBDbGVhclBlZERlY29yYXRpb25zTGVhdmVTY2FycyhwZWQpXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBhcHBlYXJhbmNlRGF0YS50YXR0b29zKSB7XG4gICAgICAgICAgICBjb25zdCB0YXR0b28gPSBlbGVtZW50LnRhdHRvb1xuICAgICAgICAgICAgaWYgKHRhdHRvbykge1xuICAgICAgICAgICAgICAgIEFkZFBlZERlY29yYXRpb25Gcm9tSGFzaGVzKHBlZCwgR2V0SGFzaEtleSh0YXR0b28uZGxjKSwgdGF0dG9vLmhhc2gpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gIFxuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNsb3NlTWVudSA9IGFzeW5jIChzYXZlOiBib29sZWFuKSA9PiB7XG4gICAgaWYgKCFzYXZlKSBhd2FpdCBzZXRBcHBlYXJhbmNlKHBsYXllckFwcGVhcmFuY2UpXG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5jb25maWcoKVxuICAgICAgICBjb25zdCBhcHBlYXJhbmNlID0gYXdhaXQgZ2V0QXBwZWFyYW5jZSgpXG4gICAgICAgIGVtaXROZXQoXCJibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlQXBwZWFyYW5jZXNcIiwge1xuICAgICAgICAgICAgaWQ6IGNvbmZpZy51c2VCcmlkZ2UgPyBleHBvcnRzLmJsX2JyaWRnZS5jb3JlICYmIGV4cG9ydHMuYmxfYnJpZGdlLmNvcmUoKS5nZXRQbGF5ZXJEYXRhKCkuY2lkIDogbnVsbCxcblxuICAgICAgICAgICAgc2tpbjoge1xuICAgICAgICAgICAgICAgIGhlYWRCbGVuZDogYXBwZWFyYW5jZS5oZWFkQmxlbmQsXG4gICAgICAgICAgICAgICAgaGVhZFN0cnVjdHVyZTogYXBwZWFyYW5jZS5oZWFkU3RydWN0dXJlLFxuICAgICAgICAgICAgICAgIGhlYWRPdmVybGF5OiBhcHBlYXJhbmNlLmhlYWRPdmVybGF5LFxuICAgICAgICAgICAgICAgIGhhaXJDb2xvcjogYXBwZWFyYW5jZS5oYWlyQ29sb3IsXG4gICAgICAgICAgICAgICAgbW9kZWw6IGFwcGVhcmFuY2UubW9kZWwsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xvdGhlczoge1xuICAgICAgICAgICAgICAgIGRyYXdhYmxlczogYXBwZWFyYW5jZS5kcmF3YWJsZXMsXG4gICAgICAgICAgICAgICAgcHJvcHM6IGFwcGVhcmFuY2UucHJvcHMsXG4gICAgICAgICAgICAgICAgaGVhZE92ZXJsYXk6IGFwcGVhcmFuY2UuaGVhZE92ZXJsYXksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGF0dG9vczogcGxheWVyQXBwZWFyYW5jZS5jdXJyZW50VGF0dG9vcyB8fCBbXSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RvcENhbWVyYSgpXG4gICAgaXNNZW51T3BlbiA9IGZhbHNlXG4gICAgU2V0TnVpRm9jdXMoZmFsc2UsIGZhbHNlKVxuICAgIHNlbmROVUlFdmVudChzZW5kLnZpc2libGUsIGZhbHNlKVxufVxuXG5SZWdpc3Rlck51aUNhbGxiYWNrKHJlY2VpdmUuY2xvc2UsIChzYXZlOiBib29sZWFuLCBjYjogRnVuY3Rpb24pID0+IHtcbiAgICBjYigxKVxuICAgIGNsb3NlTWVudShzYXZlKVxufSk7IiwgImltcG9ydCB7IGFwcGVhcmFuY2UsIG91dGZpdHMgfSBmcm9tICdAZW51bXMnO1xuaW1wb3J0IHsgZGVidWdkYXRhLCByZXF1ZXN0TW9kZWwsIGRlbGF5LCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2ssIGdldEZyYW1ld29ya0lEfSBmcm9tICcuLi8uLi91dGlscyc7XG5pbXBvcnQgeyBIZWFkT3ZlcmxheURhdGEsIEhlYWRTdHJ1Y3R1cmVEYXRhLCBEcmF3YWJsZURhdGF9IGZyb20gJ0BkYXRhVHlwZXMvYXBwZWFyYW5jZSc7XG5pbXBvcnQgeyBUVGF0dG9vfSBmcm9tICdAZGF0YVR5cGVzL3RhdHRvb3MnO1xuaW1wb3J0IGdldEFwcGVhcmFuY2UgZnJvbSAnLidcbmltcG9ydCB7cGVkLCBwbGF5ZXJBcHBlYXJhbmNlfSBmcm9tICcuLy4uLydcbmltcG9ydCB7VEhlYWRCbGVuZH0gZnJvbSAnQGRhdGFUeXBlcy9hcHBlYXJhbmNlJ1xuXG5jb25zdCBhY3Rpb25IYW5kbGVycyA9IHtcbiAgICBbYXBwZWFyYW5jZS5zZXRNb2RlbF06IGFzeW5jIChtb2RlbDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IG1vZGVsSGFzaCA9IGF3YWl0IHJlcXVlc3RNb2RlbChtb2RlbClcblxuICAgICAgICBTZXRQbGF5ZXJNb2RlbChQbGF5ZXJJZCgpLCBtb2RlbEhhc2gpXG5cbiAgICAgICAgYXdhaXQgZGVsYXkoMTUwKVxuXG4gICAgICAgIFNldE1vZGVsQXNOb0xvbmdlck5lZWRlZChtb2RlbEhhc2gpXG4gICAgICAgIFNldFBlZERlZmF1bHRDb21wb25lbnRWYXJpYXRpb24ocGVkKVxuXG4gICAgICAgIGlmIChtb2RlbCA9PT0gXCJtcF9tX2ZyZWVtb2RlXzAxXCIpIFNldFBlZEhlYWRCbGVuZERhdGEocGVkLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCBmYWxzZSlcbiAgICAgICAgZWxzZSBpZiAobW9kZWwgPT09IFwibXBfZl9mcmVlbW9kZV8wMVwiKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgNDUsIDIxLCAwLCAyMCwgMTUsIDAsIDAuMywgMC4xLCAwLCBmYWxzZSlcblxuICAgICAgICByZXR1cm4gZ2V0QXBwZWFyYW5jZSgpXG4gICAgfSxcbiAgICBbYXBwZWFyYW5jZS5zZXRIZWFkU3RydWN0dXJlXTogKGRhdGE6IEhlYWRTdHJ1Y3R1cmVEYXRhKSA9PiB7XG4gICAgICAgIFNldFBlZEZhY2VGZWF0dXJlKHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSlcbiAgICAgICAgcmV0dXJuIGRhdGFcbiAgICB9LFxuICAgIFthcHBlYXJhbmNlLnNldEhlYWRPdmVybGF5XTogKGRhdGE6IEhlYWRPdmVybGF5RGF0YSkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlID09IC0xID8gMjU1IDogZGF0YS5vdmVybGF5VmFsdWVcblxuICAgICAgICBpZiAoZGF0YS5pZCA9PT0gJ0V5ZUNvbG9yJykgU2V0UGVkRXllQ29sb3IocGVkLCBkYXRhLmV5ZUNvbG9yKSBcbiAgICAgICAgZWxzZSBpZiAoZGF0YS5pZCA9PT0gJ2hhaXJDb2xvcicpIFNldFBlZEhhaXJDb2xvcihwZWQsIGRhdGEuaGFpckNvbG9yLCBkYXRhLmhhaXJIaWdobGlnaHQpIFxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIFNldFBlZEhlYWRPdmVybGF5KHBlZCwgZGF0YS5pbmRleCwgdmFsdWUsIGRhdGEub3ZlcmxheU9wYWNpdHkpXG4gICAgICAgICAgICBTZXRQZWRIZWFkT3ZlcmxheUNvbG9yKHBlZCwgZGF0YS5pbmRleCwgMSwgZGF0YS5maXJzdENvbG9yLCBkYXRhLnNlY29uZENvbG9yKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDFcbiAgICB9LFxuICAgIFthcHBlYXJhbmNlLnNldEhlYWRCbGVuZF06IChkYXRhOiBUSGVhZEJsZW5kKSA9PiB7XG4gICAgICAgIFNldFBlZEhlYWRCbGVuZERhdGEoXG4gICAgICAgICAgICBwZWQsIFxuICAgICAgICAgICAgZGF0YS5zaGFwZUZpcnN0LCBcbiAgICAgICAgICAgIGRhdGEuc2hhcGVTZWNvbmQsIFxuICAgICAgICAgICAgZGF0YS5zaGFwZVRoaXJkLCBcbiAgICAgICAgICAgIGRhdGEuc2tpbkZpcnN0LCBcbiAgICAgICAgICAgIGRhdGEuc2tpblNlY29uZCwgXG4gICAgICAgICAgICBkYXRhLnNraW5UaGlyZCwgXG4gICAgICAgICAgICBkYXRhLnNoYXBlTWl4LCBcbiAgICAgICAgICAgIGRhdGEuc2tpbk1peCwgXG4gICAgICAgICAgICBkYXRhLnRoaXJkTWl4LCBcbiAgICAgICAgICAgIGRhdGEuaGFzUGFyZW50XG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuIDFcbiAgICB9LFxuICAgIFthcHBlYXJhbmNlLnNldFByb3BdOiAoZGF0YTogRHJhd2FibGVEYXRhKSA9PiB7XG4gICAgICAgIGlmIChkYXRhLnZhbHVlID09PSAtMSkge1xuICAgICAgICAgICAgQ2xlYXJQZWRQcm9wKHBlZCwgZGF0YS5pbmRleClcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIH1cbiAgICAgICAgU2V0UGVkUHJvcEluZGV4KHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSwgZGF0YS50ZXh0dXJlLCBmYWxzZSlcbiAgICAgICAgcmV0dXJuIGRhdGEuaXNUZXh0dXJlID8gMSA6IEdldE51bWJlck9mUGVkUHJvcFRleHR1cmVWYXJpYXRpb25zKHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSkgLy8gaWYgaXQgdGV4dHVyZSB3aHkgd2Ugd291bGQgY2FsbCBhIHVzZWxlc3MgbmF0aXZlIFxuICAgIH0sXG4gICAgW2FwcGVhcmFuY2Uuc2V0RHJhd2FibGVdOiAoZGF0YTogRHJhd2FibGVEYXRhKSA9PiB7XG4gICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgMClcblxuICAgICAgICByZXR1cm4gZGF0YS5pc1RleHR1cmUgPyAxIDogR2V0TnVtYmVyT2ZQZWRUZXh0dXJlVmFyaWF0aW9ucyhwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpLTFcbiAgICB9LFxuICAgIFthcHBlYXJhbmNlLnNldFRhdHRvb3NdOiAoZGF0YTogVFRhdHRvb1tdKSA9PiB7XG4gICAgICAgIGlmICghZGF0YSkgcmV0dXJuIDFcblxuICAgICAgICBwbGF5ZXJBcHBlYXJhbmNlLmN1cnJlbnRUYXR0b29zID0gZGF0YVxuICAgICAgICBDbGVhclBlZERlY29yYXRpb25zTGVhdmVTY2FycyhwZWQpXG5cbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhdHRvbyA9IGVsZW1lbnQudGF0dG9vXG4gICAgICAgICAgICBpZiAodGF0dG9vKSB7XG4gICAgICAgICAgICAgICAgQWRkUGVkRGVjb3JhdGlvbkZyb21IYXNoZXMocGVkLCBHZXRIYXNoS2V5KHRhdHRvby5kbGMpLCB0YXR0b28uaGFzaClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIDFcbiAgICB9LFxuICAgIFthcHBlYXJhbmNlLmdldE1vZGVsVGF0dG9vc106IChkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGRhdGFcbiAgICB9LFxuXG59O1xuXG5mb3IgKGNvbnN0IGFjdGlvbiBvZiBPYmplY3QudmFsdWVzKGFwcGVhcmFuY2UpKSB7XG4gICAgUmVnaXN0ZXJOdWlDYWxsYmFjayhhY3Rpb24sIGFzeW5jIChkYXRhOiBhbnksIGNiOiBGdW5jdGlvbikgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gYWN0aW9uSGFuZGxlcnNbYWN0aW9uXTtcbiAgICAgICAgaWYgKCFoYW5kbGVyKSByZXR1cm5cblxuICAgICAgICBjYihhd2FpdCBoYW5kbGVyKGRhdGEpKVxuICAgIH0pO1xufVxuIiwgImltcG9ydCB7IG91dGZpdHMgfSBmcm9tICdAZW51bXMnO1xuaW1wb3J0IHsgZGVidWdkYXRhLCByZXF1ZXN0TW9kZWwsIGRlbGF5LCBnZXRGcmFtZXdvcmtJRCwgdHJpZ2dlclNlcnZlckNhbGxiYWNrfSBmcm9tICcuLi8uLi91dGlscyc7XG5pbXBvcnQgeyBPdXRmaXQsIFRPdXRmaXREYXRhfSBmcm9tICdAZGF0YVR5cGVzL291dGZpdHMnO1xuaW1wb3J0IHsgVFRhdHRvb30gZnJvbSAnQGRhdGFUeXBlcy90YXR0b29zJztcbmltcG9ydCBnZXRBcHBlYXJhbmNlIGZyb20gJy4vLi4vYXBwZWFyYW5jZSdcbmltcG9ydCB7cGVkLCBwbGF5ZXJBcHBlYXJhbmNlLCBzZXRBcHBlYXJhbmNlfSBmcm9tICcuLy4uLydcblxuY29uc3QgYWN0aW9uSGFuZGxlcnMgPSB7XG4gICAgW291dGZpdHMuc2F2ZU91dGZpdF06IGFzeW5jICh7bGFiZWwsIG91dGZpdH0pID0+IHtcbiAgICAgICAgY29uc3QgZnJhbWV3b3JrZElkID0gZ2V0RnJhbWV3b3JrSUQoKVxuICAgICAgICByZXR1cm4gYXdhaXQgdHJpZ2dlclNlcnZlckNhbGxiYWNrKFwiYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZU91dGZpdFwiLCBmcmFtZXdvcmtkSWQsIHtsYWJlbCwgb3V0Zml0fSlcbiAgICB9LFxuICAgIFtvdXRmaXRzLmRlbGV0ZU91dGZpdF06IGFzeW5jIChpZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKClcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayhcImJsX2FwcGVhcmFuY2U6c2VydmVyOmRlbGV0ZU91dGZpdFwiLCBmcmFtZXdvcmtkSWQsIGlkKVxuICAgIH0sXG4gICAgW291dGZpdHMucmVuYW1lT3V0Zml0XTogYXN5bmMgKHtsYWJlbCwgaWR9KSA9PiB7XG4gICAgICAgIGNvbnN0IGZyYW1ld29ya2RJZCA9IGdldEZyYW1ld29ya0lEKClcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjayhcImJsX2FwcGVhcmFuY2U6c2VydmVyOnJlbmFtZU91dGZpdFwiLCBmcmFtZXdvcmtkSWQsIGxhYmVsLCBpZClcbiAgICB9LFxuICAgIFtvdXRmaXRzLnVzZU91dGZpdF06IChvdXRmaXQ6IFRPdXRmaXREYXRhKSA9PiB7XG4gICAgICAgIHNldEFwcGVhcmFuY2Uob3V0Zml0KVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG59XG5cbmZvciAoY29uc3QgYWN0aW9uIG9mIE9iamVjdC52YWx1ZXMob3V0Zml0cykpIHtcbiAgICBSZWdpc3Rlck51aUNhbGxiYWNrKGFjdGlvbiwgYXN5bmMgKGRhdGE6IGFueSwgY2I6IEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBhY3Rpb25IYW5kbGVyc1thY3Rpb25dO1xuICAgICAgICBpZiAoIWhhbmRsZXIpIHJldHVyblxuXG4gICAgICAgIGNiKGF3YWl0IGhhbmRsZXIoZGF0YSkpXG4gICAgfSk7XG59XG4iLCAiaW1wb3J0IHsgb3Blbk1lbnUgfSBmcm9tICcuL21lbnUnXG5pbXBvcnQgeyB0cmlnZ2VyU2VydmVyQ2FsbGJhY2sgfSBmcm9tICdAdXRpbHMnXG5pbXBvcnQoJy4vbWVudS9hcHBlYXJhbmNlL2hhbmRsZXInKVxuaW1wb3J0KCcuL21lbnUvb3V0Zml0cycpXG5cblJlZ2lzdGVyQ29tbWFuZCgnb3Blbk1lbnUnLCAoKSA9PiB7XG4gIG9wZW5NZW51KCdhbGwnKVxufSwgZmFsc2UpXG5cbnNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICBjb25zdCBhcmdzID0gWzEsIG51bGwsIDMsIG51bGwsIG51bGwsIDZdO1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRyaWdnZXJTZXJ2ZXJDYWxsYmFjazx7IHNlcnZlclZhbHVlOiBudW1iZXIgfT4oJ3Rlc3Q6c2VydmVyJywgMSwgYXJncyk7XG4gIGlmICghcmVzcG9uc2UpIHJldHVybjtcbn0sIDEwMCk7Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7QUFBQSxJQUFPO0FBQVA7QUFBQTtBQUFBLElBQU8sZUFBUTtBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFD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QU8sR0FBRSxNQUFNO0FBQzNDLGNBQU0sZUFBZSxlQUFlO0FBQ3BDLGVBQU8sTUFBTSxzQkFBc0IscUNBQXFDLGNBQWMsT0FBTyxFQUFFO0FBQUEsTUFDbkc7QUFBQSxNQUNBLHVDQUFrQixHQUFHLENBQUMsV0FBd0I7QUFDMUMsc0JBQWMsTUFBTTtBQUNwQixlQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0o7QUFFQSxlQUFXLFVBQVUsT0FBTyxPQUFPLE9BQU8sR0FBRztBQUN6QywwQkFBb0IsUUFBUSxPQUFPLE1BQVcsT0FBaUI7QUFDM0QsY0FBTSxVQUFVQSxnQkFBZSxNQUFNO0FBQ3JDLFlBQUksQ0FBQztBQUFTO0FBRWQsV0FBRyxNQUFNLFFBQVEsSUFBSSxDQUFDO0FBQUEsTUFDMUIsQ0FBQztBQUFBLElBQ0w7QUFBQTtBQUFBOzs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxnQkFBZ0IsWUFBWSxNQUFNO0FBQ2hDLFdBQVMsS0FBSztBQUNoQixHQUFHLEtBQUs7QUFFUixXQUFXLFlBQVk7QUFDckIsUUFBTSxPQUFPLENBQUMsR0FBRyxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUM7QUFDdkMsUUFBTSxXQUFXLE1BQU0sc0JBQStDLGVBQWUsR0FBRyxJQUFJO0FBQzVGLE1BQUksQ0FBQztBQUFVO0FBQ2pCLEdBQUcsR0FBRzsiLAogICJuYW1lcyI6IFsicGVkIiwgImFwcGVhcmFuY2UiLCAib3V0Zml0cyIsICJkZWxheSIsICJvdXRmaXRzIiwgImFwcGVhcmFuY2UiLCAiYWN0aW9uSGFuZGxlcnMiXQp9Cg==
