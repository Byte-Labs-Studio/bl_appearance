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
    appearance_default = /* @__PURE__ */ __name((model) => {
      const [headData, totals] = getHeadOverlay();
      const [drawables, drawTotal] = getDrawables();
      const [props, propTotal] = getProps();
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
        tattoos: [],
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
      console.log(JSON.stringify(tattooZones));
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
var bl_appearance, isMenuOpen, ped, updatePed, validMenuTypes, openMenu, closeMenu;
var init_menu = __esm({
  "src/client/menu/index.ts"() {
    init_appearance();
    init_tattoos();
    init_menuTypes();
    init_enums();
    init_utils();
    init_camera();
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
      sendNUIEvent("appearance:data" /* data */, {
        tabs: isArray ? type : menuTypes_default.includes(type) ? type : menuTypes_default,
        appearance: appearance_default(GetEntityModel(ped)),
        blacklist: bl_appearance.blacklist(),
        tattoos: tattoos_default(),
        outfits: [],
        models: bl_appearance.models(),
        locale: await requestLocale("locale")
      });
    }, "openMenu");
    closeMenu = /* @__PURE__ */ __name((save) => {
      console.log(save);
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
        ClearPedDecorationsLeaveScars(ped);
        for (const element of data) {
          const tattoo = element.tattoo;
          if (tattoo) {
            AddPedDecorationFromHashes(ped, GetHashKey(tattoo.dlc), tattoo.hash);
          }
        }
        return data;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2RhdGEvaGVhZC50cyIsICIuLi8uLi9zcmMvZGF0YS9mYWNlLnRzIiwgIi4uLy4uL3NyYy9kYXRhL2RyYXdhYmxlLnRzIiwgIi4uLy4uL3NyYy9kYXRhL3Byb3BzLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvbWVudS9hcHBlYXJhbmNlL2luZGV4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvbWVudS90YXR0b29zL2luZGV4LnRzIiwgIi4uLy4uL3NyYy9kYXRhL21lbnVUeXBlcy50cyIsICIuLi8uLi9zcmMvY2xpZW50L2VudW1zLnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvdXRpbHMvaW5kZXgudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9jYW1lcmEvaW5kZXgudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9tZW51L2luZGV4LnRzIiwgIi4uLy4uL3NyYy9jbGllbnQvbWVudS9hcHBlYXJhbmNlL2hhbmRsZXIudHMiLCAiLi4vLi4vc3JjL2NsaWVudC9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCBbXHJcbiAgICBcIkJsZW1pc2hlc1wiLFxyXG4gICAgXCJGYWNpYWxIYWlyXCIsXHJcbiAgICBcIkV5ZWJyb3dzXCIsXHJcbiAgICBcIkFnZWluZ1wiLFxyXG4gICAgXCJNYWtldXBcIixcclxuICAgIFwiQmx1c2hcIixcclxuICAgIFwiQ29tcGxleGlvblwiLFxyXG4gICAgXCJTdW5EYW1hZ2VcIixcclxuICAgIFwiTGlwc3RpY2tcIixcclxuICAgIFwiTW9sZXNGcmVja2xlc1wiLFxyXG4gICAgXCJDaGVzdEhhaXJcIixcclxuICAgIFwiQm9keUJsZW1pc2hlc1wiLFxyXG4gICAgXCJBZGRCb2R5QmxlbWlzaGVzXCIsXHJcbiAgICBcIkV5ZUNvbG9yXCJcclxuXVxyXG4iLCAiZXhwb3J0IGRlZmF1bHQgW1xyXG4gICAgXCJOb3NlX1dpZHRoXCIsXHJcbiAgICBcIk5vc2VfUGVha19IZWlnaHRcIixcclxuICAgIFwiTm9zZV9QZWFrX0xlbmdodFwiLFxyXG4gICAgXCJOb3NlX0JvbmVfSGVpZ2h0XCIsXHJcbiAgICBcIk5vc2VfUGVha19Mb3dlcmluZ1wiLFxyXG4gICAgXCJOb3NlX0JvbmVfVHdpc3RcIixcclxuICAgIFwiRXllQnJvd25fSGVpZ2h0XCIsXHJcbiAgICBcIkV5ZUJyb3duX0ZvcndhcmRcIixcclxuICAgIFwiQ2hlZWtzX0JvbmVfSGlnaFwiLFxyXG4gICAgXCJDaGVla3NfQm9uZV9XaWR0aFwiLFxyXG4gICAgXCJDaGVla3NfV2lkdGhcIixcclxuICAgIFwiRXllc19PcGVubmluZ1wiLFxyXG4gICAgXCJMaXBzX1RoaWNrbmVzc1wiLFxyXG4gICAgXCJKYXdfQm9uZV9XaWR0aFwiLFxyXG4gICAgXCJKYXdfQm9uZV9CYWNrX0xlbmdodFwiLFxyXG4gICAgXCJDaGluX0JvbmVfTG93ZXJpbmdcIixcclxuICAgIFwiQ2hpbl9Cb25lX0xlbmd0aFwiLFxyXG4gICAgXCJDaGluX0JvbmVfV2lkdGhcIixcclxuICAgIFwiQ2hpbl9Ib2xlXCIsXHJcbiAgICBcIk5lY2tfVGhpa25lc3NcIlxyXG5dXHJcbiIsICJleHBvcnQgZGVmYXVsdCBbXHJcbiAgICBcImZhY2VcIixcclxuICAgIFwibWFza3NcIixcclxuICAgIFwiaGFpclwiLFxyXG4gICAgXCJ0b3Jzb3NcIixcclxuICAgIFwibGVnc1wiLFxyXG4gICAgXCJiYWdzXCIsXHJcbiAgICBcInNob2VzXCIsXHJcbiAgICBcIm5lY2tcIixcclxuICAgIFwic2hpcnRzXCIsXHJcbiAgICBcInZlc3RcIixcclxuICAgIFwiZGVjYWxzXCIsXHJcbiAgICBcImphY2tldHNcIlxyXG5dXHJcbiIsICJleHBvcnQgZGVmYXVsdCBbXHJcbiAgICBcImhhdHNcIixcclxuICAgIFwiZ2xhc3Nlc1wiLFxyXG4gICAgXCJlYXJyaW5nc1wiLFxyXG4gICAgXCJtb3V0aFwiLFxyXG4gICAgXCJsaGFuZFwiLFxyXG4gICAgXCJyaGFuZFwiLFxyXG4gICAgXCJ3YXRjaGVzXCIsXHJcbiAgICBcImJyYWNsZXRzXCJcclxuXVxyXG4iLCAiaW1wb3J0IEhFQURfT1ZFUkxBWVMgZnJvbSAnLi4vLi4vLi4vZGF0YS9oZWFkJztcclxuaW1wb3J0IEZBQ0VfRkVBVFVSRVMgZnJvbSAnLi4vLi4vLi4vZGF0YS9mYWNlJztcclxuaW1wb3J0IERSQVdBQkxFX05BTUVTIGZyb20gJy4uLy4uLy4uL2RhdGEvZHJhd2FibGUnO1xyXG5pbXBvcnQgUFJPUF9OQU1FUyBmcm9tICcuLi8uLi8uLi9kYXRhL3Byb3BzJztcclxuaW1wb3J0IHsgSGFpckRhdGEsIFBlZEhhbmRsZSwgVG90YWxEYXRhLCBEcmF3YWJsZURhdGEsIEhlYWRTdHJ1Y3R1cmVEYXRhLCBIZWFkT3ZlcmxheURhdGEgfSBmcm9tICdAZGF0YVR5cGVzL2FwcGVhcmFuY2UnO1xyXG5pbXBvcnQge3BlZH0gZnJvbSAnLi4nO1xyXG5cclxuY29uc3QgZmluZE1vZGVsSW5kZXggPSAobW9kZWw6IFBlZEhhbmRsZSkgPT4gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLm1vZGVscygpLmZpbmRJbmRleCgocGVkOiBzdHJpbmcpID0+IEdldEhhc2hLZXkocGVkKSA9PT0gbW9kZWwpO1xyXG5cclxuY29uc3QgZ2V0UGVkSGFpciA9ICgpOiBIYWlyRGF0YSA9PiAoe1xyXG4gICAgY29sb3I6IEdldFBlZEhhaXJDb2xvcihwZWQpLFxyXG4gICAgaGlnaGxpZ2h0OiBHZXRQZWRIYWlySGlnaGxpZ2h0Q29sb3IocGVkKVxyXG59KTtcclxuXHJcbmNvbnN0IGdldFBlZEhlYWRCbGVuZERhdGEgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBoZWFkYmxlbmREYXRhID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLkdldEhlYWRCbGVuZERhdGEocGVkKVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2hhcGVGaXJzdDogaGVhZGJsZW5kRGF0YS5GaXJzdEZhY2VTaGFwZSwgICAvLyBmYXRoZXJcclxuICAgICAgICBzaGFwZVNlY29uZDogaGVhZGJsZW5kRGF0YS5TZWNvbmRGYWNlU2hhcGUsIC8vIG1vdGhlclxyXG4gICAgICAgIHNoYXBlVGhpcmQ6IGhlYWRibGVuZERhdGEuVGhpcmRGYWNlU2hhcGUsXHJcblxyXG4gICAgICAgIHNraW5GaXJzdDogaGVhZGJsZW5kRGF0YS5GaXJzdFNraW5Ub25lLFxyXG4gICAgICAgIHNraW5TZWNvbmQ6IGhlYWRibGVuZERhdGEuU2Vjb25kU2tpblRvbmUsXHJcbiAgICAgICAgc2tpblRoaXJkOiBoZWFkYmxlbmREYXRhLlRoaXJkU2tpblRvbmUsXHJcblxyXG4gICAgICAgIHNoYXBlTWl4OiBoZWFkYmxlbmREYXRhLlBhcmVudEZhY2VTaGFwZVBlcmNlbnQsIC8vIHJlc2VtYmxhbmNlXHJcblxyXG4gICAgICAgIHRoaXJkTWl4OiBoZWFkYmxlbmREYXRhLlBhcmVudFRoaXJkVW5rUGVyY2VudCxcclxuICAgICAgICBza2luTWl4OiBoZWFkYmxlbmREYXRhLlBhcmVudFNraW5Ub25lUGVyY2VudCwgICAvLyBza2lucGVyY2VudFxyXG5cclxuICAgICAgICBoYXNQYXJlbnQ6IGhlYWRibGVuZERhdGEuSXNQYXJlbnRJbmhlcml0YW5jZSxcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBnZXRIZWFkT3ZlcmxheSA9ICgpOiBbUmVjb3JkPHN0cmluZywgSGVhZE92ZXJsYXlEYXRhPiwgUmVjb3JkPHN0cmluZywgbnVtYmVyPl0gPT4ge1xyXG4gICAgbGV0IHRvdGFsczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xyXG4gICAgbGV0IGhlYWREYXRhOiBSZWNvcmQ8c3RyaW5nLCBIZWFkT3ZlcmxheURhdGE+ID0ge307XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBIRUFEX09WRVJMQVlTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IEhFQURfT1ZFUkxBWVNbaV07XHJcbiAgICAgICAgdG90YWxzW292ZXJsYXldID0gR2V0TnVtSGVhZE92ZXJsYXlWYWx1ZXMoaSk7XHJcblxyXG4gICAgICAgIGlmIChvdmVybGF5ID09PSBcIkV5ZUNvbG9yXCIpIHtcclxuICAgICAgICAgICAgaGVhZERhdGFbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBHZXRQZWRFeWVDb2xvcihwZWQpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgW18sIG92ZXJsYXlWYWx1ZSwgY29sb3VyVHlwZSwgZmlyc3RDb2xvciwgc2Vjb25kQ29sb3IsIG92ZXJsYXlPcGFjaXR5XSA9IEdldFBlZEhlYWRPdmVybGF5RGF0YShwZWQsIGkpO1xyXG4gICAgICAgICAgICBoZWFkRGF0YVtvdmVybGF5XSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGkgLSAxLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVZhbHVlOiBvdmVybGF5VmFsdWUgPT09IDI1NSA/IC0xIDogb3ZlcmxheVZhbHVlLFxyXG4gICAgICAgICAgICAgICAgY29sb3VyVHlwZTogY29sb3VyVHlwZSxcclxuICAgICAgICAgICAgICAgIGZpcnN0Q29sb3I6IGZpcnN0Q29sb3IsXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRDb2xvcjogc2Vjb25kQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBvdmVybGF5T3BhY2l0eTogb3ZlcmxheU9wYWNpdHlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtoZWFkRGF0YSwgdG90YWxzXTtcclxufTtcclxuXHJcbmNvbnN0IGdldEhlYWRTdHJ1Y3R1cmUgPSAoKTogUmVjb3JkPHN0cmluZywgSGVhZFN0cnVjdHVyZURhdGE+IHwgdW5kZWZpbmVkID0+IHtcclxuICAgIGNvbnN0IHBlZE1vZGVsID0gR2V0RW50aXR5TW9kZWwocGVkKVxyXG5cclxuICAgIGlmIChwZWRNb2RlbCAhPT0gR2V0SGFzaEtleShcIm1wX21fZnJlZW1vZGVfMDFcIikgJiYgcGVkTW9kZWwgIT09IEdldEhhc2hLZXkoXCJtcF9mX2ZyZWVtb2RlXzAxXCIpKSByZXR1cm5cclxuXHJcbiAgICBsZXQgZmFjZVN0cnVjdCA9IHt9XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IEZBQ0VfRkVBVFVSRVMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBvdmVybGF5ID0gRkFDRV9GRUFUVVJFU1tpXVxyXG4gICAgICAgIGZhY2VTdHJ1Y3Rbb3ZlcmxheV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBvdmVybGF5LFxyXG4gICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgdmFsdWU6IEdldFBlZEZhY2VGZWF0dXJlKHBlZCwgaSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhY2VTdHJ1Y3RcclxufVxyXG5cclxuY29uc3QgZ2V0RHJhd2FibGVzID0gKCk6IFtSZWNvcmQ8c3RyaW5nLCBEcmF3YWJsZURhdGE+LCBSZWNvcmQ8c3RyaW5nLCBUb3RhbERhdGE+XSA9PiB7XHJcbiAgICBsZXQgZHJhd2FibGVzID0ge31cclxuICAgIGxldCB0b3RhbERyYXdhYmxlcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBEUkFXQUJMRV9OQU1FUy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBEUkFXQUJMRV9OQU1FU1tpXVxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBHZXRQZWREcmF3YWJsZVZhcmlhdGlvbihwZWQsIGkpXHJcblxyXG4gICAgICAgIHRvdGFsRHJhd2FibGVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBpZDogbmFtZSxcclxuICAgICAgICAgICAgaW5kZXg6IGksXHJcbiAgICAgICAgICAgIHRvdGFsOiBHZXROdW1iZXJPZlBlZERyYXdhYmxlVmFyaWF0aW9ucyhwZWQsIGkpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogR2V0TnVtYmVyT2ZQZWRUZXh0dXJlVmFyaWF0aW9ucyhwZWQsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRyYXdhYmxlc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkRHJhd2FibGVWYXJpYXRpb24ocGVkLCBpKSxcclxuICAgICAgICAgICAgdGV4dHVyZTogR2V0UGVkVGV4dHVyZVZhcmlhdGlvbihwZWQsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbZHJhd2FibGVzLCB0b3RhbERyYXdhYmxlc11cclxufVxyXG5cclxuY29uc3QgZ2V0UHJvcHMgPSAoKTogW1JlY29yZDxzdHJpbmcsIERyYXdhYmxlRGF0YT4sIFJlY29yZDxzdHJpbmcsIFRvdGFsRGF0YT5dID0+IHtcclxuICAgIGxldCBwcm9wcyA9IHt9XHJcbiAgICBsZXQgdG90YWxQcm9wcyA9IHt9XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBQUk9QX05BTUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IFBST1BfTkFNRVNbaV1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gR2V0UGVkUHJvcEluZGV4KHBlZCwgaSlcclxuXHJcbiAgICAgICAgdG90YWxQcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB0b3RhbDogR2V0TnVtYmVyT2ZQZWRQcm9wRHJhd2FibGVWYXJpYXRpb25zKHBlZCwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBHZXROdW1iZXJPZlBlZFByb3BUZXh0dXJlVmFyaWF0aW9ucyhwZWQsIGksIGN1cnJlbnQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm9wc1tuYW1lXSA9IHtcclxuICAgICAgICAgICAgaWQ6IG5hbWUsXHJcbiAgICAgICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgICAgICB2YWx1ZTogR2V0UGVkUHJvcEluZGV4KHBlZCwgaSksXHJcbiAgICAgICAgICAgIHRleHR1cmU6IEdldFBlZFByb3BUZXh0dXJlSW5kZXgocGVkLCBpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3Byb3BzLCB0b3RhbFByb3BzXVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCAobW9kZWw6IG51bWJlcikgPT4ge1xyXG4gICAgY29uc3QgW2hlYWREYXRhLCB0b3RhbHNdID0gZ2V0SGVhZE92ZXJsYXkoKVxyXG4gICAgY29uc3QgW2RyYXdhYmxlcywgZHJhd1RvdGFsXSA9IGdldERyYXdhYmxlcygpXHJcbiAgICBjb25zdCBbcHJvcHMsIHByb3BUb3RhbF0gPSBnZXRQcm9wcygpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBtb2RlbEluZGV4OiBmaW5kTW9kZWxJbmRleChtb2RlbCksXHJcbiAgICAgICAgbW9kZWw6IG1vZGVsLFxyXG4gICAgICAgIGhhaXJDb2xvcjogZ2V0UGVkSGFpcigpLFxyXG4gICAgICAgIGhlYWRCbGVuZDogZ2V0UGVkSGVhZEJsZW5kRGF0YSgpLFxyXG4gICAgICAgIGhlYWRPdmVybGF5OiBoZWFkRGF0YSxcclxuICAgICAgICBoZWFkT3ZlcmxheVRvdGFsOiB0b3RhbHMsXHJcbiAgICAgICAgaGVhZFN0cnVjdHVyZTogZ2V0SGVhZFN0cnVjdHVyZSgpLFxyXG4gICAgICAgIGRyYXdhYmxlczogZHJhd2FibGVzLFxyXG4gICAgICAgIHByb3BzOiBwcm9wcyxcclxuICAgICAgICB0YXR0b29zOiBbXSxcclxuICAgICAgICBkcmF3VG90YWw6IGRyYXdUb3RhbCxcclxuICAgICAgICBwcm9wVG90YWw6IHByb3BUb3RhbCxcclxuICAgIH1cclxufSIsICJpbXBvcnQgeyBwZWQgfSBmcm9tICcuLy4uLydcclxuaW1wb3J0IHsgVFpvbmVUYXR0b28gfSBmcm9tICdAZGF0YVR5cGVzL3RhdHRvb3MnO1xyXG5cclxuY29uc3QgZ2V0VGF0dG9vcyA9ICgpOiBUWm9uZVRhdHRvb1tdID0+IHtcclxuICAgIGNvbnN0IFtUQVRUT09fTElTVCwgVEFUVE9PX0NBVEVHT1JJRVNdID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlLnRhdHRvb3MoKVxyXG4gICAgY29uc3QgdGF0dG9vWm9uZXM6IFRab25lVGF0dG9vW10gPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFRBVFRPT19DQVRFR09SSUVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBUQVRUT09fQ0FURUdPUklFU1tpXTtcclxuXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBjYXRlZ29yeS5pbmRleFxyXG4gICAgICAgIGNvbnN0IHpvbmUgPSBjYXRlZ29yeS56b25lXHJcbiAgICAgICAgY29uc3QgbGFiZWwgPSBjYXRlZ29yeS5sYWJlbFxyXG5cclxuICAgICAgICB0YXR0b29ab25lc1tpbmRleF0gPSB7XHJcbiAgICAgICAgICAgIHpvbmUsXHJcbiAgICAgICAgICAgIGxhYmVsLFxyXG4gICAgICAgICAgICB6b25lSW5kZXg6IGluZGV4LFxyXG4gICAgICAgICAgICBkbGNzOiBbXSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IFRBVFRPT19MSVNULmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRsY0RhdGEgPSBUQVRUT09fTElTVFtqXTtcclxuICAgICAgICAgICAgdGF0dG9vWm9uZXNbaW5kZXhdLmRsY3Nbal0gPSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogZGxjRGF0YS5kbGMsXHJcbiAgICAgICAgICAgICAgICBkbGNJbmRleDogaixcclxuICAgICAgICAgICAgICAgIHRhdHRvb3M6IFtdLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0ZlbWFsZSA9IEdldEVudGl0eU1vZGVsKHBlZCkgPT09IEdldEhhc2hLZXkoJ21wX2ZfZnJlZW1vZGVfMDEnKTtcclxuXHJcbiAgICBmb3IgKGxldCBkbGNJbmRleCA9IDA7IGRsY0luZGV4IDwgVEFUVE9PX0xJU1QubGVuZ3RoOyBkbGNJbmRleCsrKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IFRBVFRPT19MSVNUW2RsY0luZGV4XTtcclxuICAgICAgICBjb25zdCB7IGRsYywgdGF0dG9vcyB9ID0gZGF0YTtcclxuICAgICAgICBjb25zdCBkbGNIYXNoID0gR2V0SGFzaEtleShkbGMpO1xyXG4gICAgICAgIGNvbnN0IHRhdHRvb0RhdGFMaXN0ID0gdGF0dG9vcyB8fCBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXR0b29EYXRhTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCB0YXR0b29EYXRhID0gdGF0dG9vRGF0YUxpc3RbaV07XHJcbiAgICAgICAgICAgIGxldCB0YXR0b286IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbG93ZXJUYXR0b28gPSB0YXR0b29EYXRhLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzRmVtYWxlVGF0dG9vID0gbG93ZXJUYXR0b28uaW5jbHVkZXMoJ19mJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNGZW1hbGVUYXR0b28gJiYgaXNGZW1hbGUpIHtcclxuICAgICAgICAgICAgICAgIHRhdHRvbyA9IHRhdHRvb0RhdGE7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzRmVtYWxlVGF0dG9vICYmICFpc0ZlbWFsZSkge1xyXG4gICAgICAgICAgICAgICAgdGF0dG9vID0gdGF0dG9vRGF0YTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRhdHRvbykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFzaCA9IEdldEhhc2hLZXkodGF0dG9vKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHpvbmUgPSBHZXRQZWREZWNvcmF0aW9uWm9uZUZyb21IYXNoZXMoZGxjSGFzaCwgaGFzaCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHpvbmUgIT09IC0xICYmIGhhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB6b25lVGF0dG9vcyA9IHRhdHRvb1pvbmVzW3pvbmVdLmRsY3NbZGxjSW5kZXhdLnRhdHRvb3M7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHpvbmVUYXR0b29zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGF0dG9vLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b25lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkbGMsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHRhdHRvb1pvbmVzKSlcclxuICAgIHJldHVybiB0YXR0b29ab25lcztcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ2V0VGF0dG9vcyIsICJleHBvcnQgZGVmYXVsdCBbJ2hlcml0YWdlJywgJ2hhaXInLCAnY2xvdGhlcycsICdhY2Nlc3NvcmllcycsICdmYWNlJywgJ21ha2V1cCcsICdvdXRmaXRzJywgJ3RhdHRvb3MnXVxyXG4iLCAiZXhwb3J0IGVudW0gc2VuZCB7XHJcbiAgICB2aXNpYmxlID0gJ2FwcGVhcmFuY2U6dmlzaWJsZScsXHJcbiAgICBkYXRhID0gJ2FwcGVhcmFuY2U6ZGF0YScsXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIGFwcGVhcmFuY2Uge1xyXG4gICAgc2V0TW9kZWwgPSAnYXBwZWFyYW5jZTpzZXRNb2RlbCcsXHJcbiAgICBzZXRIZWFkU3RydWN0dXJlID0gJ2FwcGVhcmFuY2U6c2V0SGVhZFN0cnVjdHVyZScsXHJcbiAgICBzZXRIZWFkT3ZlcmxheSA9ICdhcHBlYXJhbmNlOnNldEhlYWRPdmVybGF5JyxcclxuICAgIHNldEhlYWRCbGVuZCA9ICdhcHBlYXJhbmNlOnNldEhlYWRCbGVuZCcsXHJcbiAgICBzZXRQcm9wID0gJ2FwcGVhcmFuY2U6c2V0UHJvcCcsXHJcbiAgICBzZXREcmF3YWJsZSA9ICdhcHBlYXJhbmNlOnNldERyYXdhYmxlJyxcclxuICAgIHNldFRhdHRvb3MgPSAnYXBwZWFyYW5jZTpzZXRUYXR0b29zJyxcclxuICAgIGdldE1vZGVsVGF0dG9vcyA9ICdhcHBlYXJhbmNlOmdldE1vZGVsVGF0dG9vcycsXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIHJlY2VpdmUge1xyXG4gICAgY2xvc2UgPSAnYXBwZWFyYW5jZTpjbG9zZScsXHJcblxyXG4gICAgdG9nZ2xlSXRlbSA9ICdhcHBlYXJhbmNlOnRvZ2dsZUl0ZW0nLFxyXG5cclxuICAgIHVzZU91dGZpdCA9ICdhcHBlYXJhbmNlOnVzZU91dGZpdCcsXHJcbiAgICByZW5hbWVPdXRmaXQgPSAnYXBwZWFyYW5jZTpyZW5hbWVPdXRmaXQnLFxyXG4gICAgZGVsZXRlT3V0Zml0ID0gJ2FwcGVhcmFuY2U6ZGVsZXRlT3V0Zml0JyxcclxuICAgIHNhdmVPdXRmaXQgPSAnYXBwZWFyYW5jZTpzYXZlT3V0Zml0JyxcclxuXHJcbiAgICBzYXZlID0gJ2FwcGVhcmFuY2U6c2F2ZScsXHJcbiAgICBjYW5jZWwgPSAnYXBwZWFyYW5jZTpjYW5jZWwnLFxyXG5cclxuICAgIGNhbVpvb20gPSAnYXBwZWFyYW5jZTpjYW1ab29tJyxcclxuICAgIGNhbU1vdmUgPSAnYXBwZWFyYW5jZTpjYW1Nb3ZlJyxcclxuICAgIGNhbVNjcm9sbCA9ICdhcHBlYXJhbmNlOmNhbVNjcm9sbCcsXHJcbn1cclxuIiwgImV4cG9ydCBjb25zdCBkZWJ1Z2RhdGEgPSAoZGF0YTogYW55KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShkYXRhLCAoa2V5LCB2YWx1ZSkgPT4ge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1xcbi9nLCBcIlxcXFxuXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9LCAyKSlcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHNlbmROVUlFdmVudCA9IChhY3Rpb246IHN0cmluZywgZGF0YTogYW55KSA9PiB7XHJcbiAgICBTZW5kTlVJTWVzc2FnZSh7XHJcbiAgICAgICAgYWN0aW9uOiBhY3Rpb24sXHJcbiAgICAgICAgZGF0YTogZGF0YVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBkZWxheSA9IChtczogbnVtYmVyKSA9PiBuZXcgUHJvbWlzZShyZXMgPT4gc2V0VGltZW91dChyZXMsIG1zKSk7XHJcblxyXG5leHBvcnQgY29uc3QgcmVxdWVzdE1vZGVsID0gYXN5bmMgKG1vZGVsOiBzdHJpbmcgfCBudW1iZXIpOiBQcm9taXNlPG51bWJlcj4gPT4ge1xyXG4gICAgbGV0IG1vZGVsSGFzaDogbnVtYmVyID0gdHlwZW9mIG1vZGVsID09PSAnbnVtYmVyJyA/IG1vZGVsIDogR2V0SGFzaEtleShtb2RlbClcclxuXHJcbiAgICBpZiAoIUlzTW9kZWxWYWxpZChtb2RlbEhhc2gpKSB7XHJcbiAgICAgICAgZXhwb3J0cy5ibF9icmlkZ2Uubm90aWZ5KCkoe1xyXG4gICAgICAgICAgICB0aXRsZTogJ0ludmFsaWQgbW9kZWwhJyxcclxuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcclxuICAgICAgICAgICAgZHVyYXRpb246IDEwMDBcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGF0dGVtcHRlZCB0byBsb2FkIGludmFsaWQgbW9kZWwgJyR7bW9kZWx9J2ApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChIYXNNb2RlbExvYWRlZChtb2RlbEhhc2gpKSByZXR1cm4gbW9kZWxIYXNoXHJcbiAgICBcclxuICAgIFJlcXVlc3RNb2RlbChtb2RlbEhhc2gpO1xyXG5cclxuICAgIGNvbnN0IHdhaXRGb3JNb2RlbExvYWRlZCA9ICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKEhhc01vZGVsTG9hZGVkKG1vZGVsSGFzaCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGF3YWl0IHdhaXRGb3JNb2RlbExvYWRlZCgpO1xyXG5cclxuICAgIHJldHVybiBtb2RlbEhhc2g7XHJcbn07XHJcblxyXG5cclxuLy9jYWxsYmFja1xyXG4vL2h0dHBzOi8vZ2l0aHViLmNvbS9vdmVyZXh0ZW5kZWQvb3hfbGliL2Jsb2IvbWFzdGVyL3BhY2thZ2UvY2xpZW50L3Jlc291cmNlL2NhbGxiYWNrL2luZGV4LnRzXHJcblxyXG5jb25zdCByZXNvdXJjZU5hbWUgPSBHZXRDdXJyZW50UmVzb3VyY2VOYW1lKClcclxuY29uc3QgZXZlbnRUaW1lcnM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcclxuY29uc3QgYWN0aXZlRXZlbnRzOiBSZWNvcmQ8c3RyaW5nLCAoLi4uYXJnczogYW55W10pID0+IHZvaWQ+ID0ge307XHJcblxyXG5mdW5jdGlvbiBldmVudFRpbWVyKGV2ZW50TmFtZTogc3RyaW5nLCBkZWxheTogbnVtYmVyIHwgbnVsbCkge1xyXG4gICAgaWYgKGRlbGF5ICYmIGRlbGF5ID4gMCkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gR2V0R2FtZVRpbWVyKCk7XHJcblxyXG4gICAgICAgIGlmICgoZXZlbnRUaW1lcnNbZXZlbnROYW1lXSB8fCAwKSA+IGN1cnJlbnRUaW1lKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIGV2ZW50VGltZXJzW2V2ZW50TmFtZV0gPSBjdXJyZW50VGltZSArIGRlbGF5O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5vbk5ldChgX19veF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5OiBzdHJpbmcsIC4uLmFyZ3M6IGFueSkgPT4ge1xyXG4gICAgY29uc3QgcmVzb2x2ZSA9IGFjdGl2ZUV2ZW50c1trZXldO1xyXG4gICAgcmV0dXJuIHJlc29sdmUgJiYgcmVzb2x2ZSguLi5hcmdzKTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlclNlcnZlckNhbGxiYWNrPFQgPSB1bmtub3duPihcclxuICAgIGV2ZW50TmFtZTogc3RyaW5nLFxyXG4gICAgZGVsYXk6IG51bWJlciB8IG51bGwsXHJcbiAgICAuLi5hcmdzOiBhbnlcclxuKTogUHJvbWlzZTxUPiB8IHZvaWQge1xyXG4gICAgaWYgKCFldmVudFRpbWVyKGV2ZW50TmFtZSwgZGVsYXkpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBrZXk6IHN0cmluZztcclxuXHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuXHJcbiAgICBlbWl0TmV0KGBfX294X2NiXyR7ZXZlbnROYW1lfWAsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgICBhY3RpdmVFdmVudHNba2V5XSA9IHJlc29sdmU7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vbG9jYWxlXHJcbmNvbnN0IGN1cnJlbnRMYW4gPSAnYnInXHJcblxyXG5leHBvcnQgY29uc3QgcmVxdWVzdExvY2FsZSA9IChyZXNvdXJjZVNldE5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2hlY2tSZXNvdXJjZUZpbGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChSZXF1ZXN0UmVzb3VyY2VGaWxlU2V0KHJlc291cmNlU2V0TmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBsb2NhbGVGaWxlQ29udGVudCA9IExvYWRSZXNvdXJjZUZpbGUocmVzb3VyY2VOYW1lLCBgbG9jYWxlLyR7Y3VycmVudExhbn0uanNvbmApO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbGVGaWxlQ29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7Y3VycmVudExhbn0uanNvbiBub3QgZm91bmQgaW4gbG9jYWxlLCBwbGVhc2UgdmVyaWZ5ISwgd2UgdXNlZCBlbmdsaXNoIGZvciBub3chYClcclxuICAgICAgICAgICAgICAgICAgICBsb2NhbGVGaWxlQ29udGVudCA9IExvYWRSZXNvdXJjZUZpbGUocmVzb3VyY2VOYW1lLCBgbG9jYWxlL2VuLmpzb25gKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShsb2NhbGVGaWxlQ29udGVudCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGNoZWNrUmVzb3VyY2VGaWxlLCAxMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNoZWNrUmVzb3VyY2VGaWxlKCk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGxvY2FsZSA9IGFzeW5jIChpZDogc3RyaW5nLCAuLi5hcmdzOiBzdHJpbmdbXSkgPT4ge1xyXG4gICAgY29uc3QgbG9jYWxlID0gYXdhaXQgcmVxdWVzdExvY2FsZSgnbG9jYWxlJyk7XHJcbiAgICBsZXQgYXJnSW5kZXggPSAwO1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IGxvY2FsZVtpZF0ucmVwbGFjZSgvJXMvZywgKG1hdGNoOiBzdHJpbmcpID0+IGFyZ0luZGV4IDwgYXJncy5sZW5ndGggPyBhcmdzW2FyZ0luZGV4XSA6IG1hdGNoKTtcclxuICAgIHJldHVybiByZXN1bHRcclxufVxyXG4iLCAiaW1wb3J0IHsgQ2FtZXJhLCBWZWN0b3IzLCBDYW1lcmFCb25lcyB9IGZyb20gJ0BkYXRhVHlwZXMvY2FtZXJhJztcclxuaW1wb3J0IHtwZWR9IGZyb20gJy4vLi4vbWVudSc7XHJcbmltcG9ydCB7IGRlbGF5fSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IHJlY2VpdmUgfSBmcm9tICdAZW51bXMnO1xyXG5cclxubGV0IHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IGNhbURpc3RhbmNlOiBudW1iZXIgPSAxLjg7XHJcbmxldCBjYW06IENhbWVyYSB8IG51bGwgPSBudWxsO1xyXG5sZXQgYW5nbGVZOiBudW1iZXIgPSAwLjA7XHJcbmxldCBhbmdsZVo6IG51bWJlciA9IDAuMDtcclxubGV0IHRhcmdldENvb3JkczogVmVjdG9yMyB8IG51bGwgPSBudWxsO1xyXG5sZXQgb2xkQ2FtOiBDYW1lcmEgfCBudWxsID0gbnVsbDtcclxubGV0IGNoYW5naW5nQ2FtOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBsYXN0WDogbnVtYmVyID0gMDtcclxubGV0IGN1cnJlbnRCb25lOiBrZXlvZiBDYW1lcmFCb25lcyA9ICdoZWFkJ1xyXG5cclxuY29uc3QgQ2FtZXJhQm9uZXM6IENhbWVyYUJvbmVzID0ge1xyXG4gICAgaGVhZDogMzEwODYsXHJcbiAgICB0b3JzbzogMjQ4MTgsXHJcbiAgICBsZWdzOiAxNDIwMSxcclxufTtcclxuXHJcbmNvbnN0IGNvcyA9IChkZWdyZWVzOiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG4gICAgcmV0dXJuIE1hdGguY29zKChkZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xyXG59XHJcblxyXG5jb25zdCBzaW4gPSAoZGVncmVlczogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuICAgIHJldHVybiBNYXRoLnNpbigoZGVncmVlcyAqIE1hdGguUEkpIC8gMTgwKTtcclxufVxyXG5cclxuY29uc3QgZ2V0QW5nbGVzID0gKCk6IG51bWJlcltdID0+IHtcclxuICAgIGNvbnN0IHggPSgoY29zKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSkgKyAoY29zKGFuZ2xlWSkgKiBjb3MoYW5nbGVaKSkpIC8gMiAqIGNhbURpc3RhbmNlO1xyXG4gICAgY29uc3QgeSA9ICgoc2luKGFuZ2xlWikgKiBjb3MoYW5nbGVZKSkgKyAoY29zKGFuZ2xlWSkgKiBzaW4oYW5nbGVaKSkpIC8gMiAqIGNhbURpc3RhbmNlO1xyXG4gICAgY29uc3QgeiA9IHNpbihhbmdsZVkpICogY2FtRGlzdGFuY2U7XHJcblxyXG4gICAgcmV0dXJuIFt4LCB5LCB6XVxyXG59XHJcblxyXG5cclxuY29uc3Qgc2V0Q2FtUG9zaXRpb24gPSAobW91c2VYPzogbnVtYmVyLCBtb3VzZVk/OiBudW1iZXIpOiB2b2lkID0+IHtcclxuICAgIGlmICghcnVubmluZyB8fCAhdGFyZ2V0Q29vcmRzIHx8IGNoYW5naW5nQ2FtKSByZXR1cm47XHJcblxyXG4gICAgbW91c2VYID0gbW91c2VYID8/IDAuMDtcclxuICAgIG1vdXNlWSA9IG1vdXNlWSA/PyAwLjA7XHJcblxyXG4gICAgYW5nbGVaIC09IG1vdXNlWDtcclxuICAgIGFuZ2xlWSArPSBtb3VzZVk7XHJcbiAgICBhbmdsZVkgPSBNYXRoLm1pbihNYXRoLm1heChhbmdsZVksIDAuMCksIDg5LjApO1xyXG5cclxuICAgIGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpXHJcblxyXG4gICAgU2V0Q2FtQ29vcmQoY2FtLCB0YXJnZXRDb29yZHMueCArIHgsIHRhcmdldENvb3Jkcy55ICsgeSwgdGFyZ2V0Q29vcmRzLnogKyB6KVxyXG4gICAgUG9pbnRDYW1BdENvb3JkKGNhbSwgdGFyZ2V0Q29vcmRzLngsIHRhcmdldENvb3Jkcy55LCB0YXJnZXRDb29yZHMueilcclxufVxyXG5cclxuY29uc3QgbW92ZUNhbWVyYSA9IGFzeW5jIChjb29yZHM6IFZlY3RvcjMsIGRpc3RhbmNlPzogbnVtYmVyKSA9PiB7XHJcbiAgICBjb25zdCBoZWFkaW5nOiBudW1iZXIgPSBHZXRFbnRpdHlIZWFkaW5nKHBlZCkgKyA5NDtcclxuICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgPz8gMS4wO1xyXG5cclxuICAgIGNoYW5naW5nQ2FtID0gdHJ1ZTtcclxuICAgIGNhbURpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICBhbmdsZVogPSBoZWFkaW5nO1xyXG5cclxuICAgIGNvbnN0IFt4LCB5LCB6XSA9IGdldEFuZ2xlcygpXHJcblxyXG4gICAgY29uc3QgbmV3Y2FtOiBDYW1lcmEgPSBDcmVhdGVDYW1XaXRoUGFyYW1zKFxyXG4gICAgICAgIFwiREVGQVVMVF9TQ1JJUFRFRF9DQU1FUkFcIixcclxuICAgICAgICBjb29yZHMueCArIHgsXHJcbiAgICAgICAgY29vcmRzLnkgKyB5LFxyXG4gICAgICAgIGNvb3Jkcy56ICsgeixcclxuICAgICAgICAwLjAsXHJcbiAgICAgICAgMC4wLFxyXG4gICAgICAgIDAuMCxcclxuICAgICAgICA3MC4wLFxyXG4gICAgICAgIGZhbHNlLFxyXG4gICAgICAgIDBcclxuICAgICk7XHJcblxyXG4gICAgdGFyZ2V0Q29vcmRzID0gY29vcmRzO1xyXG4gICAgY2hhbmdpbmdDYW0gPSBmYWxzZTtcclxuICAgIG9sZENhbSA9IGNhbVxyXG4gICAgY2FtID0gbmV3Y2FtO1xyXG5cclxuICAgIFBvaW50Q2FtQXRDb29yZChuZXdjYW0sIGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnopO1xyXG4gICAgU2V0Q2FtQWN0aXZlV2l0aEludGVycChuZXdjYW0sIG9sZENhbSwgMjUwLCAwLCAwKTtcclxuXHJcbiAgICBhd2FpdCBkZWxheSgyNTApXHJcblxyXG4gICAgU2V0Q2FtVXNlU2hhbGxvd0RvZk1vZGUobmV3Y2FtLCB0cnVlKTtcclxuICAgIFNldENhbU5lYXJEb2YobmV3Y2FtLCAwLjQpO1xyXG4gICAgU2V0Q2FtRmFyRG9mKG5ld2NhbSwgMS4yKTtcclxuICAgIFNldENhbURvZlN0cmVuZ3RoKG5ld2NhbSwgMC4zKTtcclxuICAgIHVzZUhpRG9mKG5ld2NhbSk7XHJcblxyXG4gICAgRGVzdHJveUNhbShvbGRDYW0sIHRydWUpO1xyXG59XHJcblxyXG5jb25zdCB1c2VIaURvZiA9IChjdXJyZW50Y2FtOiBDYW1lcmEpID0+IHtcclxuICAgIGlmICghKERvZXNDYW1FeGlzdChjYW0pICYmIGN1cnJlbnRjYW0gPT0gY2FtKSkgcmV0dXJuO1xyXG4gICAgU2V0VXNlSGlEb2YoKTtcclxuICAgIHNldFRpbWVvdXQodXNlSGlEb2YsIDApO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc3RhcnRDYW1lcmEgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAocnVubmluZykgcmV0dXJuO1xyXG4gICAgcnVubmluZyA9IHRydWU7XHJcbiAgICBjYW1EaXN0YW5jZSA9IDEuMDtcclxuICAgIGNhbSA9IENyZWF0ZUNhbShcIkRFRkFVTFRfU0NSSVBURURfQ0FNRVJBXCIsIHRydWUpO1xyXG4gICAgY29uc3QgW3gsIHksIHpdOiBudW1iZXJbXSA9IEdldFBlZEJvbmVDb29yZHMocGVkLCAzMTA4NiwgMC4wLCAwLjAsIDAuMClcclxuICAgIFNldENhbUNvb3JkKGNhbSwgeCwgeSwgeilcclxuICAgIFJlbmRlclNjcmlwdENhbXModHJ1ZSwgdHJ1ZSwgMTAwMCwgdHJ1ZSwgdHJ1ZSk7XHJcbiAgICBtb3ZlQ2FtZXJhKHt4OiB4LCB5OiB5LCB6OiB6fSwgY2FtRGlzdGFuY2UpO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc3RvcENhbWVyYSA9ICgpOiB2b2lkID0+IHtcclxuICAgIGlmICghcnVubmluZykgcmV0dXJuO1xyXG4gICAgcnVubmluZyA9IGZhbHNlO1xyXG5cclxuICAgIFJlbmRlclNjcmlwdENhbXMoZmFsc2UsIHRydWUsIDI1MCwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgRGVzdHJveUNhbShjYW0sIHRydWUpO1xyXG4gICAgY2FtID0gbnVsbDtcclxuICAgIHRhcmdldENvb3JkcyA9IG51bGw7XHJcbn1cclxuXHJcbmNvbnN0IHNldENhbWVyYSA9ICh0eXBlPzoga2V5b2YgQ2FtZXJhQm9uZXMpOiB2b2lkID0+IHtcclxuICAgIGNvbnN0IGJvbmU6IG51bWJlciB8IHVuZGVmaW5lZCA9IENhbWVyYUJvbmVzW3R5cGVdO1xyXG4gICAgaWYgKGN1cnJlbnRCb25lID09IHR5cGUpIHJldHVybjtcclxuICAgIGNvbnN0IFt4LCB5LCB6XTogbnVtYmVyW10gPSBib25lID8gR2V0UGVkQm9uZUNvb3JkcyhwZWQsIGJvbmUsIDAuMCwgMC4wLCBib25lID09PSAxNDIwMSA/IDAuMiA6IDAuMCkgOiBHZXRFbnRpdHlDb29yZHMocGVkLCBmYWxzZSk7XHJcblxyXG4gICAgbW92ZUNhbWVyYSh7XHJcbiAgICAgICAgeDogeCwgXHJcbiAgICAgICAgeTogeSwgXHJcbiAgICAgICAgejogeiArIDAuMFxyXG4gICAgfSwgMS4wKTtcclxuXHJcbiAgICBjdXJyZW50Qm9uZSA9IHR5cGU7XHJcbn1cclxuXHJcblJlZ2lzdGVyTnVpQ2FsbGJhY2socmVjZWl2ZS5jYW1Nb3ZlLCAoZGF0YSwgY2IpID0+IHtcclxuICAgIGNiKDEpXHJcbiAgICBsZXQgaGVhZGluZzogbnVtYmVyID0gR2V0RW50aXR5SGVhZGluZyhwZWQpO1xyXG4gICAgaWYgKGxhc3RYID09IGRhdGEueCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGhlYWRpbmcgPSBkYXRhLnggPiBsYXN0WCA/IGhlYWRpbmcgKyA1IDogaGVhZGluZyAtIDU7XHJcbiAgICBTZXRFbnRpdHlIZWFkaW5nKHBlZCwgaGVhZGluZyk7XHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhyZWNlaXZlLmNhbVNjcm9sbCwgKHR5cGU6IG51bWJlciwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIHNldENhbWVyYSgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgIHNldENhbWVyYShcImxlZ3NcIik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgc2V0Q2FtZXJhKFwiaGVhZFwiKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBjYigxKTtcclxufSk7XHJcblxyXG5SZWdpc3Rlck51aUNhbGxiYWNrKHJlY2VpdmUuY2FtWm9vbSwgKGRhdGEsIGNiKSA9PiB7XHJcbiAgICBpZiAoZGF0YSA9PT0gXCJkb3duXCIpIHtcclxuICAgICAgICBjb25zdCBuZXdEaXN0YW5jZTogbnVtYmVyID0gY2FtRGlzdGFuY2UgKyAwLjA1O1xyXG4gICAgICAgIGNhbURpc3RhbmNlID0gbmV3RGlzdGFuY2UgPj0gMS4wID8gMS4wIDogbmV3RGlzdGFuY2U7XHJcbiAgICB9IGVsc2UgaWYgKGRhdGEgPT09IFwidXBcIikge1xyXG4gICAgICAgIGNvbnN0IG5ld0Rpc3RhbmNlOiBudW1iZXIgPSBjYW1EaXN0YW5jZSAtIDAuMDU7XHJcbiAgICAgICAgY2FtRGlzdGFuY2UgPSBuZXdEaXN0YW5jZSA8PSAwLjM1ID8gMC4zNSA6IG5ld0Rpc3RhbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbURpc3RhbmNlID0gY2FtRGlzdGFuY2U7XHJcbiAgICBzZXRDYW1Qb3NpdGlvbigpO1xyXG4gICAgY2IoMSk7XHJcbn0pO1xyXG5cclxuIiwgImltcG9ydCBnZXRBcHBlYXJhbmNlIGZyb20gJy4vYXBwZWFyYW5jZSdcclxuaW1wb3J0IGdldFRhdHRvb3MgZnJvbSAnLi90YXR0b29zJ1xyXG5pbXBvcnQgbWVudVR5cGVzIGZyb20gJy4uLy4uL2RhdGEvbWVudVR5cGVzJztcclxuaW1wb3J0IHsgc2VuZCwgcmVjZWl2ZSB9IGZyb20gJ0BlbnVtcydcclxuaW1wb3J0IHsgc2VuZE5VSUV2ZW50LCBkZWxheSwgcmVxdWVzdExvY2FsZSB9IGZyb20gJy4uL3V0aWxzJ1xyXG5pbXBvcnQgeyBzdGFydENhbWVyYSwgc3RvcENhbWVyYSB9IGZyb20gJy4vLi4vY2FtZXJhJ1xyXG5cclxuY29uc3QgYmxfYXBwZWFyYW5jZSA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZVxyXG5leHBvcnQgbGV0IGlzTWVudU9wZW4gPSBmYWxzZVxyXG5leHBvcnQgbGV0IHBlZCA9IDBcclxuXHJcbmNvbnN0IHVwZGF0ZVBlZCA9ICgpID0+IHtcclxuICAgIGlmICghaXNNZW51T3BlbikgcmV0dXJuO1xyXG4gICAgcGVkID0gUGxheWVyUGVkSWQoKVxyXG4gICAgc2V0VGltZW91dCh1cGRhdGVQZWQsIDEwMCk7XHJcbn1cclxuXHJcbmNvbnN0IHZhbGlkTWVudVR5cGVzID0gKHR5cGU6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoIW1lbnVUeXBlcy5pbmNsdWRlcyh0eXBlW2ldKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgb3Blbk1lbnUgPSBhc3luYyAodHlwZTogc3RyaW5nW10gfCBzdHJpbmcpID0+IHtcclxuICAgIGlzTWVudU9wZW4gPSB0cnVlXHJcbiAgICB1cGRhdGVQZWQoKVxyXG4gICAgYXdhaXQgZGVsYXkoMTUwKVxyXG4gICAgc3RhcnRDYW1lcmEoKVxyXG4gICAgc2VuZE5VSUV2ZW50KHNlbmQudmlzaWJsZSwgdHJ1ZSlcclxuICAgIFNldE51aUZvY3VzKHRydWUsIHRydWUpXHJcbiAgICBjb25zdCBpc0FycmF5ID0gdHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnXHJcblxyXG4gICAgaWYgKGlzQXJyYXkgJiYgIXZhbGlkTWVudVR5cGVzKHR5cGUpKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiBtZW51IHR5cGUgbm90IGZvdW5kJyk7XHJcbiAgICB9XHJcblxyXG4gICAgc2VuZE5VSUV2ZW50KHNlbmQuZGF0YSwge1xyXG4gICAgICAgIHRhYnM6IGlzQXJyYXkgPyB0eXBlIDogbWVudVR5cGVzLmluY2x1ZGVzKHR5cGUpID8gdHlwZSA6IG1lbnVUeXBlcyxcclxuICAgICAgICBhcHBlYXJhbmNlOiBnZXRBcHBlYXJhbmNlKEdldEVudGl0eU1vZGVsKHBlZCkpLFxyXG4gICAgICAgIGJsYWNrbGlzdDogYmxfYXBwZWFyYW5jZS5ibGFja2xpc3QoKSxcclxuICAgICAgICB0YXR0b29zOiBnZXRUYXR0b29zKCksXHJcbiAgICAgICAgb3V0Zml0czogW10sXHJcbiAgICAgICAgbW9kZWxzOiBibF9hcHBlYXJhbmNlLm1vZGVscygpLFxyXG4gICAgICAgIGxvY2FsZTogYXdhaXQgcmVxdWVzdExvY2FsZSgnbG9jYWxlJylcclxuICAgIH0pXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjbG9zZU1lbnUgPSAoc2F2ZTogYm9vbGVhbikgPT4ge1xyXG4gICAgY29uc29sZS5sb2coc2F2ZSlcclxuICAgIHN0b3BDYW1lcmEoKVxyXG4gICAgaXNNZW51T3BlbiA9IGZhbHNlXHJcbiAgICBTZXROdWlGb2N1cyhmYWxzZSwgZmFsc2UpXHJcbiAgICBzZW5kTlVJRXZlbnQoc2VuZC52aXNpYmxlLCBmYWxzZSlcclxufVxyXG5cclxuUmVnaXN0ZXJOdWlDYWxsYmFjayhyZWNlaXZlLmNsb3NlLCAoc2F2ZTogYm9vbGVhbiwgY2I6IEZ1bmN0aW9uKSA9PiB7XHJcbiAgICBjYigxKVxyXG4gICAgY2xvc2VNZW51KHNhdmUpXHJcbn0pOyIsICJpbXBvcnQgeyBhcHBlYXJhbmNlIH0gZnJvbSAnQGVudW1zJztcclxuaW1wb3J0IHsgZGVidWdkYXRhLCByZXF1ZXN0TW9kZWwsIGRlbGF5fSBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCB7IEhlYWRPdmVybGF5RGF0YSwgSGVhZFN0cnVjdHVyZURhdGEsIERyYXdhYmxlRGF0YX0gZnJvbSAnQGRhdGFUeXBlcy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IGdldEFwcGVhcmFuY2UgZnJvbSAnLidcclxuaW1wb3J0IHtwZWR9IGZyb20gJy4vLi4vJ1xyXG5cclxuaW1wb3J0IHtUSGVhZEJsZW5kfSBmcm9tICdAZGF0YVR5cGVzL2FwcGVhcmFuY2UnXHJcblxyXG5jb25zdCBhY3Rpb25IYW5kbGVycyA9IHtcclxuICAgIFthcHBlYXJhbmNlLnNldE1vZGVsXTogYXN5bmMgKG1vZGVsOiBzdHJpbmcpID0+IHtcclxuICAgICAgICBjb25zdCBtb2RlbEhhc2ggPSBhd2FpdCByZXF1ZXN0TW9kZWwobW9kZWwpXHJcblxyXG4gICAgICAgIFNldFBsYXllck1vZGVsKFBsYXllcklkKCksIG1vZGVsSGFzaClcclxuXHJcbiAgICAgICAgYXdhaXQgZGVsYXkoMTUwKVxyXG5cclxuICAgICAgICBTZXRNb2RlbEFzTm9Mb25nZXJOZWVkZWQobW9kZWxIYXNoKVxyXG4gICAgICAgIFNldFBlZERlZmF1bHRDb21wb25lbnRWYXJpYXRpb24ocGVkKVxyXG5cclxuICAgICAgICBpZiAobW9kZWwgPT09IFwibXBfbV9mcmVlbW9kZV8wMVwiKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgZmFsc2UpXHJcbiAgICAgICAgZWxzZSBpZiAobW9kZWwgPT09IFwibXBfZl9mcmVlbW9kZV8wMVwiKSBTZXRQZWRIZWFkQmxlbmREYXRhKHBlZCwgNDUsIDIxLCAwLCAyMCwgMTUsIDAsIDAuMywgMC4xLCAwLCBmYWxzZSlcclxuXHJcbiAgICAgICAgcmV0dXJuIGdldEFwcGVhcmFuY2UobW9kZWxIYXNoKVxyXG4gICAgfSxcclxuICAgIFthcHBlYXJhbmNlLnNldEhlYWRTdHJ1Y3R1cmVdOiAoZGF0YTogSGVhZFN0cnVjdHVyZURhdGEpID0+IHtcclxuICAgICAgICBTZXRQZWRGYWNlRmVhdHVyZShwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUpXHJcbiAgICAgICAgcmV0dXJuIGRhdGFcclxuICAgIH0sXHJcbiAgICBbYXBwZWFyYW5jZS5zZXRIZWFkT3ZlcmxheV06IChkYXRhOiBIZWFkT3ZlcmxheURhdGEpID0+IHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IGRhdGEub3ZlcmxheVZhbHVlID09IC0xID8gMjU1IDogZGF0YS5vdmVybGF5VmFsdWVcclxuXHJcbiAgICAgICAgaWYgKGRhdGEuaWQgPT09ICdFeWVDb2xvcicpIFNldFBlZEV5ZUNvbG9yKHBlZCwgZGF0YS5leWVDb2xvcikgXHJcbiAgICAgICAgZWxzZSBpZiAoZGF0YS5pZCA9PT0gJ2hhaXJDb2xvcicpIFNldFBlZEhhaXJDb2xvcihwZWQsIGRhdGEuaGFpckNvbG9yLCBkYXRhLmhhaXJIaWdobGlnaHQpIFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBTZXRQZWRIZWFkT3ZlcmxheShwZWQsIGRhdGEuaW5kZXgsIHZhbHVlLCBkYXRhLm92ZXJsYXlPcGFjaXR5KVxyXG4gICAgICAgICAgICBTZXRQZWRIZWFkT3ZlcmxheUNvbG9yKHBlZCwgZGF0YS5pbmRleCwgMSwgZGF0YS5maXJzdENvbG9yLCBkYXRhLnNlY29uZENvbG9yKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIDFcclxuICAgIH0sXHJcbiAgICBbYXBwZWFyYW5jZS5zZXRIZWFkQmxlbmRdOiAoZGF0YTogVEhlYWRCbGVuZCkgPT4ge1xyXG4gICAgICAgIFNldFBlZEhlYWRCbGVuZERhdGEoXHJcbiAgICAgICAgICAgIHBlZCwgXHJcbiAgICAgICAgICAgIGRhdGEuc2hhcGVGaXJzdCwgXHJcbiAgICAgICAgICAgIGRhdGEuc2hhcGVTZWNvbmQsIFxyXG4gICAgICAgICAgICBkYXRhLnNoYXBlVGhpcmQsIFxyXG4gICAgICAgICAgICBkYXRhLnNraW5GaXJzdCwgXHJcbiAgICAgICAgICAgIGRhdGEuc2tpblNlY29uZCwgXHJcbiAgICAgICAgICAgIGRhdGEuc2tpblRoaXJkLCBcclxuICAgICAgICAgICAgZGF0YS5zaGFwZU1peCwgXHJcbiAgICAgICAgICAgIGRhdGEuc2tpbk1peCwgXHJcbiAgICAgICAgICAgIGRhdGEudGhpcmRNaXgsIFxyXG4gICAgICAgICAgICBkYXRhLmhhc1BhcmVudFxyXG4gICAgICAgIClcclxuICAgICAgICByZXR1cm4gMVxyXG4gICAgfSxcclxuICAgIFthcHBlYXJhbmNlLnNldFByb3BdOiAoZGF0YTogRHJhd2FibGVEYXRhKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEudmFsdWUgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIENsZWFyUGVkUHJvcChwZWQsIGRhdGEuaW5kZXgpXHJcbiAgICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFNldFBlZFByb3BJbmRleChwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgZmFsc2UpXHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaXNUZXh0dXJlID8gMSA6IEdldE51bWJlck9mUGVkUHJvcFRleHR1cmVWYXJpYXRpb25zKHBlZCwgZGF0YS5pbmRleCwgZGF0YS52YWx1ZSkgLy8gaWYgaXQgdGV4dHVyZSB3aHkgd2Ugd291bGQgY2FsbCBhIHVzZWxlc3MgbmF0aXZlIFxyXG4gICAgfSxcclxuICAgIFthcHBlYXJhbmNlLnNldERyYXdhYmxlXTogKGRhdGE6IERyYXdhYmxlRGF0YSkgPT4ge1xyXG4gICAgICAgIFNldFBlZENvbXBvbmVudFZhcmlhdGlvbihwZWQsIGRhdGEuaW5kZXgsIGRhdGEudmFsdWUsIGRhdGEudGV4dHVyZSwgMClcclxuXHJcbiAgICAgICAgcmV0dXJuIGRhdGEuaXNUZXh0dXJlID8gMSA6IEdldE51bWJlck9mUGVkVGV4dHVyZVZhcmlhdGlvbnMocGVkLCBkYXRhLmluZGV4LCBkYXRhLnZhbHVlKS0xXHJcbiAgICB9LFxyXG4gICAgW2FwcGVhcmFuY2Uuc2V0VGF0dG9vc106IChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEpIHJldHVybiAxXHJcblxyXG4gICAgICAgIENsZWFyUGVkRGVjb3JhdGlvbnNMZWF2ZVNjYXJzKHBlZClcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRhdGEpIHtcclxuICAgICAgICAgICAgY29uc3QgdGF0dG9vID0gZWxlbWVudC50YXR0b29cclxuICAgICAgICAgICAgaWYgKHRhdHRvbykge1xyXG4gICAgICAgICAgICAgICAgQWRkUGVkRGVjb3JhdGlvbkZyb21IYXNoZXMocGVkLCBHZXRIYXNoS2V5KHRhdHRvby5kbGMpLCB0YXR0b28uaGFzaClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGF0YVxyXG4gICAgfSxcclxuICAgIFthcHBlYXJhbmNlLmdldE1vZGVsVGF0dG9vc106IChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gZGF0YVxyXG4gICAgfSxcclxufTtcclxuXHJcbmZvciAoY29uc3QgYWN0aW9uIG9mIE9iamVjdC52YWx1ZXMoYXBwZWFyYW5jZSkpIHtcclxuICAgIFJlZ2lzdGVyTnVpQ2FsbGJhY2soYWN0aW9uLCBhc3luYyAoZGF0YTogYW55LCBjYjogRnVuY3Rpb24pID0+IHtcclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gYWN0aW9uSGFuZGxlcnNbYWN0aW9uXTtcclxuICAgICAgICBpZiAoIWhhbmRsZXIpIHJldHVyblxyXG5cclxuICAgICAgICBjYihhd2FpdCBoYW5kbGVyKGRhdGEpKVxyXG4gICAgfSk7XHJcbn1cclxuIiwgImltcG9ydCB7IG9wZW5NZW51IH0gZnJvbSAnLi9tZW51J1xyXG5pbXBvcnQgeyB0cmlnZ2VyU2VydmVyQ2FsbGJhY2sgfSBmcm9tICdAdXRpbHMnXHJcbmltcG9ydCgnLi9tZW51L2FwcGVhcmFuY2UvaGFuZGxlcicpXHJcblxyXG5SZWdpc3RlckNvbW1hbmQoJ29wZW5NZW51JywgKCkgPT4ge1xyXG4gIG9wZW5NZW51KCdhbGwnKVxyXG59LCBmYWxzZSlcclxuXHJcbnNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xyXG4gIGNvbnN0IGFyZ3MgPSBbMSwgbnVsbCwgMywgbnVsbCwgbnVsbCwgNl07XHJcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0cmlnZ2VyU2VydmVyQ2FsbGJhY2s8eyBzZXJ2ZXJWYWx1ZTogbnVtYmVyIH0+KCd0ZXN0OnNlcnZlcicsIDEsIGFyZ3MpO1xyXG4gIGlmICghcmVzcG9uc2UpIHJldHVybjtcclxufSwgMTAwKTtcclxuXHJcbi8vIGZ1bmN0aW9uIEV4cG9ydF9HZXRQZWRIZWFkQmxlbmREYXRhKCkge1xyXG4vLyAgICAgdmFyIGFyciA9IG5ldyBVaW50MzJBcnJheShuZXcgQXJyYXlCdWZmZXIoMTAgKiA4KSk7IC8vIGludCwgaW50LCBpbnQsIGludCwgaW50LCBpbnQsIGZsb2F0LCBmbG9hdCwgZmxvYXQsIGJvb2xcclxuLy8gICAgIENpdGl6ZW4uaW52b2tlTmF0aXZlKFwiMHgyNzQ2QkQ5RDg4QzVDNUQwXCIsIFBsYXllclBlZElkKCksIGFycik7XHJcbi8vICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJyKTtcclxuLy8gfVxyXG5cclxuLy8gUmVnaXN0ZXJDb21tYW5kKCdoZWFkJywgKCkgPT4ge1xyXG4vLyAgICAgLy8gY29uc3QgZGF0YSA9IEV4cG9ydF9HZXRQZWRIZWFkQmxlbmREYXRhKClcclxuLy8gICAgIC8vIGNvbnNvbGUubG9nKGRhdGEpXHJcbi8vIH0sIGZhbHNlKVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7OztBQUFBLElBQU87QUFBUDtBQUFBO0FBQUEsSUFBTyxlQUFRO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQUE7QUFBQTs7O0FDZkEsSUFBTztBQUFQO0FBQUE7QUFBQSxJQUFPLGVBQVE7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQTtBQUFBOzs7QUNyQkEsSUFBTztBQUFQO0FBQUE7QUFBQSxJQUFPLG1CQUFRO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBO0FBQUE7OztBQ2JBLElBQU87QUFBUDtBQUFBO0FBQUEsSUFBTyxnQkFBUTtBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFB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LFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFFBQ1Q7QUFDQSxlQUFPO0FBQUEsTUFDWDtBQUFBLE1BQ0EsbUNBQW1CLEdBQUcsQ0FBQyxTQUF1QjtBQUMxQyxZQUFJLEtBQUssVUFBVSxJQUFJO0FBQ25CLHVCQUFhLEtBQUssS0FBSyxLQUFLO0FBQzVCLGlCQUFPO0FBQUEsUUFDWDtBQUNBLHdCQUFnQixLQUFLLEtBQUssT0FBTyxLQUFLLE9BQU8sS0FBSyxTQUFTLEtBQUs7QUFDaEUsZUFBTyxLQUFLLFlBQVksSUFBSSxvQ0FBb0MsS0FBSyxLQUFLLE9BQU8sS0FBSyxLQUFLO0FBQUEsTUFDL0Y7QUFBQSxNQUNBLDJDQUF1QixHQUFHLENBQUMsU0FBdUI7QUFDOUMsaUNBQXlCLEtBQUssS0FBSyxPQUFPLEtBQUssT0FBTyxLQUFLLFNBQVMsQ0FBQztBQUVyRSxlQUFPLEtBQUssWUFBWSxJQUFJLGdDQUFnQyxLQUFLLEtBQUssT0FBTyxLQUFLLEtBQUssSUFBRTtBQUFBLE1BQzdGO0FBQUEsTUFDQSx5Q0FBc0IsR0FBRyxDQUFDLFNBQWM7QUFDcEMsWUFBSSxDQUFDO0FBQU0saUJBQU87QUFFbEIsc0NBQThCLEdBQUc7QUFFakMsbUJBQVcsV0FBVyxNQUFNO0FBQ3hCLGdCQUFNLFNBQVMsUUFBUTtBQUN2QixjQUFJLFFBQVE7QUFDUix1Q0FBMkIsS0FBSyxXQUFXLE9BQU8sR0FBRyxHQUFHLE9BQU8sSUFBSTtBQUFBLFVBQ3ZFO0FBQUEsUUFDSjtBQUVBLGVBQU87QUFBQSxNQUNYO0FBQUEsTUFDQSxtREFBMkIsR0FBRyxDQUFDLFNBQWM7QUFDekMsZUFBTztBQUFBLE1BQ1g7QUFBQSxJQUNKO0FBRUEsZUFBVyxVQUFVLE9BQU8sT0FBTyxVQUFVLEdBQUc7QUFDNUMsMEJBQW9CLFFBQVEsT0FBTyxNQUFXLE9BQWlCO0FBQzNELGNBQU0sVUFBVSxlQUFlLE1BQU07QUFDckMsWUFBSSxDQUFDO0FBQVM7QUFFZCxXQUFHLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFBQSxNQUMxQixDQUFDO0FBQUEsSUFDTDtBQUFBO0FBQUE7OztBQy9GQTtBQUNBO0FBQ0E7QUFFQSxnQkFBZ0IsWUFBWSxNQUFNO0FBQ2hDLFdBQVMsS0FBSztBQUNoQixHQUFHLEtBQUs7QUFFUixXQUFXLFlBQVk7QUFDckIsUUFBTSxPQUFPLENBQUMsR0FBRyxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUM7QUFDdkMsUUFBTSxXQUFXLE1BQU0sc0JBQStDLGVBQWUsR0FBRyxJQUFJO0FBQzVGLE1BQUksQ0FBQztBQUFVO0FBQ2pCLEdBQUcsR0FBRzsiLAogICJuYW1lcyI6IFsicGVkIiwgImFwcGVhcmFuY2UiLCAiZGVsYXkiXQp9Cg==
