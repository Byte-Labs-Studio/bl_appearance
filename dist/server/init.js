var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __glob = (map) => (path) => {
  var fn = map[path];
  if (fn)
    return fn();
  throw new Error("Module not found in bundle: " + path);
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@overextended/oxmysql/MySQL.js
var require_MySQL = __commonJS({
  "node_modules/@overextended/oxmysql/MySQL.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.oxmysql = void 0;
    var QueryStore = [];
    function assert(condition, message) {
      if (!condition)
        throw new TypeError(message);
    }
    __name(assert, "assert");
    var safeArgs = /* @__PURE__ */ __name((query, params, cb, transaction) => {
      if (typeof query === "number")
        query = QueryStore[query];
      if (transaction) {
        assert(typeof query === "object", `First argument expected object, recieved ${typeof query}`);
      } else {
        assert(typeof query === "string", `First argument expected string, received ${typeof query}`);
      }
      if (params) {
        const paramType = typeof params;
        assert(paramType === "object" || paramType === "function", `Second argument expected object or function, received ${paramType}`);
        if (!cb && paramType === "function") {
          cb = params;
          params = void 0;
        }
      }
      if (cb !== void 0)
        assert(typeof cb === "function", `Third argument expected function, received ${typeof cb}`);
      return [query, params, cb];
    }, "safeArgs");
    var exp = global.exports.oxmysql;
    var currentResourceName = GetCurrentResourceName();
    function execute(method, query, params) {
      return new Promise((resolve, reject) => {
        exp[method](query, params, (result, error) => {
          if (error)
            return reject(error);
          resolve(result);
        }, currentResourceName, true);
      });
    }
    __name(execute, "execute");
    exports2.oxmysql = {
      store(query) {
        assert(typeof query !== "string", `Query expects a string, received ${typeof query}`);
        return QueryStore.push(query);
      },
      ready(callback) {
        setImmediate(async () => {
          while (GetResourceState("oxmysql") !== "started")
            await new Promise((resolve) => setTimeout(resolve, 50));
          callback();
        });
      },
      async query(query, params, cb) {
        [query, params, cb] = safeArgs(query, params, cb);
        const result = await execute("query", query, params);
        return cb ? cb(result) : result;
      },
      async single(query, params, cb) {
        [query, params, cb] = safeArgs(query, params, cb);
        const result = await execute("single", query, params);
        return cb ? cb(result) : result;
      },
      async scalar(query, params, cb) {
        [query, params, cb] = safeArgs(query, params, cb);
        const result = await execute("scalar", query, params);
        return cb ? cb(result) : result;
      },
      async update(query, params, cb) {
        [query, params, cb] = safeArgs(query, params, cb);
        const result = await execute("update", query, params);
        return cb ? cb(result) : result;
      },
      async insert(query, params, cb) {
        [query, params, cb] = safeArgs(query, params, cb);
        const result = await execute("insert", query, params);
        return cb ? cb(result) : result;
      },
      async prepare(query, params, cb) {
        [query, params, cb] = safeArgs(query, params, cb);
        const result = await execute("prepare", query, params);
        return cb ? cb(result) : result;
      },
      async rawExecute(query, params, cb) {
        [query, params, cb] = safeArgs(query, params, cb);
        const result = await execute("rawExecute", query, params);
        return cb ? cb(result) : result;
      },
      async transaction(query, params, cb) {
        [query, params, cb] = safeArgs(query, params, cb, true);
        const result = await execute("transaction", query, params);
        return cb ? cb(result) : result;
      },
      isReady() {
        return exp.isReady();
      },
      async awaitConnection() {
        return await exp.awaitConnection();
      }
    };
  }
});

// src/server/utils/index.ts
function triggerClientCallback(eventName, playerId, ...args) {
  let key;
  do {
    key = `${eventName}:${Math.floor(Math.random() * (1e5 + 1))}:${playerId}`;
  } while (activeEvents[key]);
  emitNet(`_bl_cb_${eventName}`, playerId, resourceName, key, ...args);
  return new Promise((resolve) => {
    activeEvents[key] = resolve;
  });
}
function onClientCallback(eventName, cb) {
  onNet(`_bl_cb_${eventName}`, async (resource, key, ...args) => {
    const src = source;
    let response;
    try {
      response = await cb(src, ...args);
    } catch (e) {
      console.error(`an error occurred while handling callback event ${eventName}`);
      console.log(`^3${e.stack}^0`);
    }
    emitNet(`_bl_cb_${resource}`, src, key, response);
  });
}
var resourceName, activeEvents, bl_bridge, core, getPlayerData, getFrameworkID, bl_config, config;
var init_utils = __esm({
  "src/server/utils/index.ts"() {
    resourceName = GetCurrentResourceName();
    activeEvents = {};
    onNet(`_bl_cb_${resourceName}`, (key, ...args) => {
      const resolve = activeEvents[key];
      return resolve && resolve(...args);
    });
    __name(triggerClientCallback, "triggerClientCallback");
    __name(onClientCallback, "onClientCallback");
    bl_bridge = exports.bl_bridge;
    core = bl_bridge.core();
    getPlayerData = /* @__PURE__ */ __name((src) => {
      return core.GetPlayer(src);
    }, "getPlayerData");
    getFrameworkID = /* @__PURE__ */ __name((src) => {
      const player = core.GetPlayer(src);
      if (!player)
        return null;
      return player.id;
    }, "getFrameworkID");
    bl_config = exports.bl_appearance.config();
    config = bl_config;
  }
});

// src/server/appearance/setters.ts
async function saveSkin(src, frameworkId, skin) {
  if (!frameworkId) {
    frameworkId = getFrameworkID(src);
  }
  const result = await import_oxmysql2.oxmysql.update(
    "UPDATE appearance SET skin = ? WHERE id = ?",
    [JSON.stringify(skin), frameworkId]
  );
  return result;
}
async function saveClothes(src, frameworkId, clothes) {
  if (!frameworkId) {
    frameworkId = getFrameworkID(src);
  }
  const result = await import_oxmysql2.oxmysql.update(
    "UPDATE appearance SET clothes = ? WHERE id = ?",
    [JSON.stringify(clothes), frameworkId]
  );
  return result;
}
async function saveTattoos(src, frameworkId, tattoos) {
  if (!frameworkId) {
    frameworkId = getFrameworkID(src);
  }
  const result = await import_oxmysql2.oxmysql.update(
    "UPDATE appearance SET tattoos = ? WHERE id = ?",
    [JSON.stringify(tattoos), frameworkId]
  );
  return result;
}
async function saveAppearance(src, frameworkId, appearance) {
  if (src && frameworkId) {
    const playerId = getFrameworkID(src);
    if (frameworkId !== playerId) {
      console.warn("You are trying to save an appearance for a different player", src, frameworkId);
      return;
    }
  }
  if (!frameworkId) {
    frameworkId = getFrameworkID(src);
  }
  const clothes = {
    drawables: appearance.drawables,
    props: appearance.props,
    headOverlay: appearance.headOverlay
  };
  const skin = {
    headBlend: appearance.headBlend,
    headStructure: appearance.headStructure,
    hairColor: appearance.hairColor,
    model: appearance.model
  };
  const tattoos = appearance.tattoos || [];
  const result = await import_oxmysql2.oxmysql.prepare(
    "INSERT INTO appearance (id, clothes, skin, tattoos) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE clothes = VALUES(clothes), skin = VALUES(skin), tattoos = VALUES(tattoos);",
    [
      frameworkId,
      JSON.stringify(clothes),
      JSON.stringify(skin),
      JSON.stringify(tattoos)
    ]
  );
  return result;
}
var import_oxmysql2;
var init_setters = __esm({
  "src/server/appearance/setters.ts"() {
    init_utils();
    import_oxmysql2 = __toESM(require_MySQL(), 1);
    __name(saveSkin, "saveSkin");
    onClientCallback("bl_appearance:server:saveSkin", saveSkin);
    exports("SavePlayerSkin", function(id, skin) {
      return saveSkin(null, id, skin);
    });
    __name(saveClothes, "saveClothes");
    onClientCallback("bl_appearance:server:saveClothes", saveClothes);
    exports("SavePlayerClothes", function(id, clothes) {
      return saveClothes(null, id, clothes);
    });
    __name(saveTattoos, "saveTattoos");
    onClientCallback("bl_appearance:server:saveTattoos", saveTattoos);
    exports("SavePlayerTattoos", function(id, tattoos) {
      return saveTattoos(null, id, tattoos);
    });
    __name(saveAppearance, "saveAppearance");
    onClientCallback("bl_appearance:server:saveAppearance", saveAppearance);
    exports("SavePlayerAppearance", function(id, appearance) {
      return saveAppearance(null, id, appearance);
    });
  }
});

// src/server/migrate/esx.ts
var esx_exports = {};
var init_esx = __esm({
  "src/server/migrate/esx.ts"() {
  }
});

// src/server/migrate/fivem.ts
var fivem_exports = {};
__export(fivem_exports, {
  default: () => fivem_default
});
var import_oxmysql4, delay, migrate, fivem_default;
var init_fivem = __esm({
  "src/server/migrate/fivem.ts"() {
    import_oxmysql4 = __toESM(require_MySQL(), 1);
    init_utils();
    init_setters();
    delay = /* @__PURE__ */ __name((ms) => new Promise((res) => setTimeout(res, ms)), "delay");
    migrate = /* @__PURE__ */ __name(async (src) => {
      const response = await import_oxmysql4.oxmysql.query("SELECT * FROM `players`");
      if (!response)
        return;
      for (const element of response) {
        if (element.skin) {
          await triggerClientCallback("bl_appearance:client:migration:setAppearance", src, {
            type: "fivem",
            data: JSON.parse(element.skin)
          });
          await delay(100);
          const response2 = await triggerClientCallback("bl_appearance:client:getAppearance", src);
          const playerSrc = parseInt(src);
          await saveAppearance(playerSrc, element.citizenid, response2);
        }
      }
      console.log("Converted " + response.length + " appearances");
    }, "migrate");
    fivem_default = migrate;
  }
});

// src/server/migrate/illenium.ts
var illenium_exports = {};
__export(illenium_exports, {
  default: () => illenium_default
});
var import_oxmysql5, delay2, migrate2, illenium_default;
var init_illenium = __esm({
  "src/server/migrate/illenium.ts"() {
    import_oxmysql5 = __toESM(require_MySQL(), 1);
    init_utils();
    init_setters();
    delay2 = /* @__PURE__ */ __name((ms) => new Promise((res) => setTimeout(res, ms)), "delay");
    migrate2 = /* @__PURE__ */ __name(async (src) => {
      const response = await import_oxmysql5.oxmysql.query("SELECT * FROM `playerskins` WHERE active = 1");
      if (!response)
        return;
      for (const element of response) {
        if (element.skin) {
          await triggerClientCallback("bl_appearance:client:migration:setAppearance", src, {
            type: "illenium",
            data: JSON.parse(element.skin)
          });
          await delay2(100);
          const response2 = await triggerClientCallback("bl_appearance:client:getAppearance", src);
          const playerSrc = parseInt(src);
          await saveAppearance(playerSrc, element.citizenid, response2);
        }
      }
      console.log("Converted " + response.length + " appearances");
    }, "migrate");
    illenium_default = migrate2;
  }
});

// src/server/migrate/qb.ts
var qb_exports = {};
__export(qb_exports, {
  default: () => qb_default
});
var import_oxmysql6, delay3, migrate3, qb_default;
var init_qb = __esm({
  "src/server/migrate/qb.ts"() {
    import_oxmysql6 = __toESM(require_MySQL(), 1);
    init_utils();
    init_setters();
    delay3 = /* @__PURE__ */ __name((ms) => new Promise((res) => setTimeout(res, ms)), "delay");
    migrate3 = /* @__PURE__ */ __name(async (src) => {
      const response = await import_oxmysql6.oxmysql.query("SELECT * FROM `playerskins` WHERE active = 1");
      if (!response)
        return;
      for (const element of response) {
        emitNet("qb-clothes:loadSkin", src, 0, element.model, element.skin);
        await delay3(200);
        const response2 = await triggerClientCallback("bl_appearance:client:getAppearance", src);
        const playerSrc = parseInt(src);
        await saveAppearance(playerSrc, element.citizenid, response2);
      }
      console.log("Converted " + response.length + " appearances");
    }, "migrate");
    qb_default = migrate3;
  }
});

// src/server/appearance/outfits.ts
var import_oxmysql = __toESM(require_MySQL(), 1);
init_utils();
async function getOutfits(src, frameworkId) {
  const job = core.GetPlayer(src).job || { name: "unknown", grade: { name: "unknown" } };
  let response = await import_oxmysql.oxmysql.prepare(
    "SELECT * FROM outfits WHERE player_id = ? OR (jobname = ? AND jobrank <= ?)",
    [frameworkId, job.name, job.grade.name]
  );
  if (!response)
    return [];
  if (!Array.isArray(response)) {
    response = [response];
  }
  const outfits = response.map(
    (outfit) => {
      return {
        id: outfit.id,
        label: outfit.label,
        outfit: JSON.parse(outfit.outfit),
        jobname: outfit.jobname
      };
    }
  );
  return outfits;
}
__name(getOutfits, "getOutfits");
onClientCallback("bl_appearance:server:getOutfits", getOutfits);
exports("GetOutfits", getOutfits);
async function renameOutfit(src, data) {
  const frameworkId = getFrameworkID(src);
  const result = await import_oxmysql.oxmysql.update(
    "UPDATE outfits SET label = ? WHERE player_id = ? AND id = ?",
    [data.label, frameworkId, data.id]
  );
  return result;
}
__name(renameOutfit, "renameOutfit");
onClientCallback("bl_appearance:server:renameOutfit", renameOutfit);
exports("RenameOutfit", renameOutfit);
async function deleteOutfit(src, id) {
  const frameworkId = getFrameworkID(src);
  const result = await import_oxmysql.oxmysql.update(
    "DELETE FROM outfits WHERE player_id = ? AND id = ?",
    [frameworkId, id]
  );
  return result > 0;
}
__name(deleteOutfit, "deleteOutfit");
onClientCallback("bl_appearance:server:deleteOutfit", deleteOutfit);
exports("DeleteOutfit", deleteOutfit);
async function saveOutfit(src, data) {
  const frameworkId = getFrameworkID(src);
  let jobname = null;
  let jobrank = 0;
  if (data.job) {
    jobname = data.job.name;
    jobrank = data.job.rank;
  }
  const id = await import_oxmysql.oxmysql.insert(
    "INSERT INTO outfits (player_id, label, outfit, jobname, jobrank) VALUES (?, ?, ?, ?, ?)",
    [frameworkId, data.label, JSON.stringify(data.outfit), jobname, jobrank]
  );
  return id;
}
__name(saveOutfit, "saveOutfit");
onClientCallback("bl_appearance:server:saveOutfit", saveOutfit);
exports("SaveOutfit", saveOutfit);
async function fetchOutfit(_, id) {
  const response = await import_oxmysql.oxmysql.prepare(
    "SELECT outfit FROM outfits WHERE id = ?",
    [id]
  );
  return JSON.parse(response);
}
__name(fetchOutfit, "fetchOutfit");
onClientCallback("bl_appearance:server:fetchOutfit", fetchOutfit);
exports("FetchOutfit", fetchOutfit);
async function importOutfit(_, frameworkId, outfitId, outfitName) {
  const result = await import_oxmysql.oxmysql.query(
    "SELECT label, outfit FROM outfits WHERE id = ?",
    [outfitId]
  );
  if (!result || typeof result !== "object" || Object.keys(result).length === 0) {
    return { success: false, message: "Outfit not found" };
  }
  const newId = await import_oxmysql.oxmysql.insert(
    "INSERT INTO outfits (player_id, label, outfit) VALUES (?, ?, ?)",
    [frameworkId, outfitName, result.outfit]
  );
  return { success: true, newId };
}
__name(importOutfit, "importOutfit");
onClientCallback("bl_appearance:server:importOutfit", importOutfit);
exports("ImportOutfit", importOutfit);
var outfitItem = config.outfitItem;
if (!outfitItem) {
  console.warn("bl_appearance: No outfit item configured, please set it in config.lua");
}
onClientCallback("bl_appearance:server:itemOutfit", async (src, data) => {
  const player = core.GetPlayer(src);
  player.addItem(outfitItem, 1, data);
});
core.RegisterUsableItem(outfitItem, async (source2, slot, metadata) => {
  const player = getPlayerData(source2);
  if (player?.removeItem(outfitItem, 1, slot))
    emitNet("bl_appearance:server:useOutfitItem", source2, metadata.outfit);
});

// src/server/init.ts
init_setters();

// src/server/appearance/getters.ts
var import_oxmysql3 = __toESM(require_MySQL(), 1);
init_utils();
async function getSkin(src, frameworkId) {
  if (!frameworkId) {
    frameworkId = getFrameworkID(src);
  }
  const response = await import_oxmysql3.oxmysql.prepare(
    "SELECT skin FROM appearance WHERE id = ?",
    [frameworkId]
  );
  return JSON.parse(response);
}
__name(getSkin, "getSkin");
onClientCallback("bl_appearance:server:getSkin", getSkin);
exports("GetPlayerSkin", function(id) {
  return getSkin(null, id);
});
async function getClothes(src, frameworkId) {
  if (!frameworkId) {
    frameworkId = getFrameworkID(src);
  }
  const response = await import_oxmysql3.oxmysql.prepare(
    "SELECT clothes FROM appearance WHERE id = ?",
    [frameworkId]
  );
  return JSON.parse(response);
}
__name(getClothes, "getClothes");
onClientCallback("bl_appearance:server:getClothes", getClothes);
exports("GetPlayerClothes", function(id) {
  return getClothes(null, id);
});
async function getTattoos(src, frameworkId) {
  if (!frameworkId) {
    frameworkId = getFrameworkID(src);
  }
  const response = await import_oxmysql3.oxmysql.prepare(
    "SELECT tattoos FROM appearance WHERE id = ?",
    [frameworkId]
  );
  return JSON.parse(response) || [];
}
__name(getTattoos, "getTattoos");
onClientCallback("bl_appearance:server:getTattoos", getTattoos);
exports("GetPlayerTattoos", function(id) {
  return getTattoos(null, id);
});
async function getAppearance(src, frameworkId) {
  if (!frameworkId && !src)
    return null;
  if (!frameworkId) {
    frameworkId = getFrameworkID(src);
  }
  const response = await import_oxmysql3.oxmysql.single(
    "SELECT * FROM appearance WHERE id = ? LIMIT 1",
    [frameworkId]
  );
  if (!response)
    return null;
  let appearance = {
    ...JSON.parse(response.skin),
    ...JSON.parse(response.clothes),
    tattoos: JSON.parse(response.tattoos)
  };
  appearance.id = response.id;
  return appearance;
}
__name(getAppearance, "getAppearance");
onClientCallback("bl_appearance:server:getAppearance", getAppearance);
exports("GetPlayerAppearance", function(id) {
  return getAppearance(null, id);
});

// src/server/init.ts
var import_oxmysql7 = __toESM(require_MySQL(), 1);

// import("./migrate/**/*.ts") in src/server/init.ts
var globImport_migrate_ts = __glob({
  "./migrate/esx.ts": () => Promise.resolve().then(() => (init_esx(), esx_exports)),
  "./migrate/fivem.ts": () => Promise.resolve().then(() => (init_fivem(), fivem_exports)),
  "./migrate/illenium.ts": () => Promise.resolve().then(() => (init_illenium(), illenium_exports)),
  "./migrate/qb.ts": () => Promise.resolve().then(() => (init_qb(), qb_exports))
});

// src/server/init.ts
import_oxmysql7.oxmysql.ready(async () => {
  try {
    await import_oxmysql7.oxmysql.query("SELECT 1 FROM appearance LIMIT 1");
  } catch (error) {
    console.error("Error checking appearance table. Most likely the table does not exist: ", error);
  }
});
onNet("bl_appearance:server:setroutingbucket", () => {
  SetPlayerRoutingBucket(source.toString(), source);
});
onNet("bl_appearance:server:resetroutingbucket", () => {
  SetPlayerRoutingBucket(source.toString(), 0);
});
RegisterCommand("migrate", async (source2) => {
  source2 = source2 !== 0 ? source2 : parseInt(getPlayers()[0]);
  const bl_appearance = exports.bl_appearance;
  const config2 = bl_appearance.config();
  const importedModule = await globImport_migrate_ts(`./migrate/${config2.previousClothing === "fivem-appearance" ? "fivem" : config2.previousClothing}.ts`);
  importedModule.default(source2);
}, false);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL0BvdmVyZXh0ZW5kZWQvb3hteXNxbC9NeVNRTC50cyIsICIuLi8uLi9zcmMvc2VydmVyL3V0aWxzL2luZGV4LnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvYXBwZWFyYW5jZS9zZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvbWlncmF0ZS9lc3gudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9taWdyYXRlL2ZpdmVtLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvbWlncmF0ZS9pbGxlbml1bS50cyIsICIuLi8uLi9zcmMvc2VydmVyL21pZ3JhdGUvcWIudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9hcHBlYXJhbmNlL291dGZpdHMudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9pbml0LnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJ0eXBlIFF1ZXJ5ID0gc3RyaW5nIHwgbnVtYmVyO1xyXG50eXBlIFBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5rbm93bltdIHwgRnVuY3Rpb247XHJcbnR5cGUgQ2FsbGJhY2s8VD4gPSAocmVzdWx0OiBUIHwgbnVsbCkgPT4gdm9pZDtcclxuXHJcbnR5cGUgVHJhbnNhY3Rpb24gPVxyXG4gIHwgc3RyaW5nW11cclxuICB8IFtzdHJpbmcsIFBhcmFtc11bXVxyXG4gIHwgeyBxdWVyeTogc3RyaW5nOyB2YWx1ZXM6IFBhcmFtcyB9W11cclxuICB8IHsgcXVlcnk6IHN0cmluZzsgcGFyYW1ldGVyczogUGFyYW1zIH1bXTtcclxuXHJcbmludGVyZmFjZSBSZXN1bHQge1xyXG4gIFtjb2x1bW46IHN0cmluZyB8IG51bWJlcl06IGFueTtcclxuICBhZmZlY3RlZFJvd3M/OiBudW1iZXI7XHJcbiAgZmllbGRDb3VudD86IG51bWJlcjtcclxuICBpbmZvPzogc3RyaW5nO1xyXG4gIGluc2VydElkPzogbnVtYmVyO1xyXG4gIHNlcnZlclN0YXR1cz86IG51bWJlcjtcclxuICB3YXJuaW5nU3RhdHVzPzogbnVtYmVyO1xyXG4gIGNoYW5nZWRSb3dzPzogbnVtYmVyO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUm93IHtcclxuICBbY29sdW1uOiBzdHJpbmcgfCBudW1iZXJdOiB1bmtub3duO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgT3hNeVNRTCB7XHJcbiAgc3RvcmU6IChxdWVyeTogc3RyaW5nKSA9PiB2b2lkO1xyXG4gIHJlYWR5OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQ7XHJcbiAgcXVlcnk6IDxUID0gUmVzdWx0IHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBzaW5nbGU6IDxUID0gUm93IHwgbnVsbD4oXHJcbiAgICBxdWVyeTogUXVlcnksXHJcbiAgICBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxFeGNsdWRlPFQsIFtdPj4sXHJcbiAgICBjYj86IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PlxyXG4gICkgPT4gUHJvbWlzZTxFeGNsdWRlPFQsIFtdPj47XHJcbiAgc2NhbGFyOiA8VCA9IHVua25vd24gfCBudWxsPihcclxuICAgIHF1ZXJ5OiBRdWVyeSxcclxuICAgIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PixcclxuICAgIGNiPzogQ2FsbGJhY2s8RXhjbHVkZTxULCBbXT4+XHJcbiAgKSA9PiBQcm9taXNlPEV4Y2x1ZGU8VCwgW10+PjtcclxuICB1cGRhdGU6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBpbnNlcnQ6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBwcmVwYXJlOiA8VCA9IGFueT4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICByYXdFeGVjdXRlOiA8VCA9IFJlc3VsdCB8IG51bGw+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgdHJhbnNhY3Rpb246IChxdWVyeTogVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPGJvb2xlYW4+LCBjYj86IENhbGxiYWNrPGJvb2xlYW4+KSA9PiBQcm9taXNlPGJvb2xlYW4+O1xyXG4gIGlzUmVhZHk6ICgpID0+IGJvb2xlYW47XHJcbiAgYXdhaXRDb25uZWN0aW9uOiAoKSA9PiBQcm9taXNlPHRydWU+O1xyXG59XHJcblxyXG5jb25zdCBRdWVyeVN0b3JlOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbjogYm9vbGVhbiwgbWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgaWYgKCFjb25kaXRpb24pIHRocm93IG5ldyBUeXBlRXJyb3IobWVzc2FnZSk7XHJcbn1cclxuXHJcbmNvbnN0IHNhZmVBcmdzID0gKHF1ZXJ5OiBRdWVyeSB8IFRyYW5zYWN0aW9uLCBwYXJhbXM/OiBhbnksIGNiPzogRnVuY3Rpb24sIHRyYW5zYWN0aW9uPzogdHJ1ZSkgPT4ge1xyXG4gIGlmICh0eXBlb2YgcXVlcnkgPT09ICdudW1iZXInKSBxdWVyeSA9IFF1ZXJ5U3RvcmVbcXVlcnldO1xyXG5cclxuICBpZiAodHJhbnNhY3Rpb24pIHtcclxuICAgIGFzc2VydCh0eXBlb2YgcXVlcnkgPT09ICdvYmplY3QnLCBgRmlyc3QgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0LCByZWNpZXZlZCAke3R5cGVvZiBxdWVyeX1gKTtcclxuICB9IGVsc2Uge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBxdWVyeSA9PT0gJ3N0cmluZycsIGBGaXJzdCBhcmd1bWVudCBleHBlY3RlZCBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG4gIH1cclxuXHJcbiAgaWYgKHBhcmFtcykge1xyXG4gICAgY29uc3QgcGFyYW1UeXBlID0gdHlwZW9mIHBhcmFtcztcclxuICAgIGFzc2VydChcclxuICAgICAgcGFyYW1UeXBlID09PSAnb2JqZWN0JyB8fCBwYXJhbVR5cGUgPT09ICdmdW5jdGlvbicsXHJcbiAgICAgIGBTZWNvbmQgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0IG9yIGZ1bmN0aW9uLCByZWNlaXZlZCAke3BhcmFtVHlwZX1gXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghY2IgJiYgcGFyYW1UeXBlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGNiID0gcGFyYW1zO1xyXG4gICAgICBwYXJhbXMgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoY2IgIT09IHVuZGVmaW5lZCkgYXNzZXJ0KHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJywgYFRoaXJkIGFyZ3VtZW50IGV4cGVjdGVkIGZ1bmN0aW9uLCByZWNlaXZlZCAke3R5cGVvZiBjYn1gKTtcclxuXHJcbiAgcmV0dXJuIFtxdWVyeSwgcGFyYW1zLCBjYl07XHJcbn07XHJcblxyXG5jb25zdCBleHAgPSBnbG9iYWwuZXhwb3J0cy5veG15c3FsO1xyXG5jb25zdCBjdXJyZW50UmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpO1xyXG5cclxuZnVuY3Rpb24gZXhlY3V0ZShtZXRob2Q6IHN0cmluZywgcXVlcnk6IFF1ZXJ5IHwgVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcykge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBleHBbbWV0aG9kXShcclxuICAgICAgcXVlcnksXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgKHJlc3VsdCwgZXJyb3IpID0+IHtcclxuICAgICAgICBpZiAoZXJyb3IpIHJldHVybiByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIHJlc29sdmUocmVzdWx0KTtcclxuICAgICAgfSxcclxuICAgICAgY3VycmVudFJlc291cmNlTmFtZSxcclxuICAgICAgdHJ1ZVxyXG4gICAgKTtcclxuICB9KSBhcyBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBveG15c3FsOiBPeE15U1FMID0ge1xyXG4gIHN0b3JlKHF1ZXJ5KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIHF1ZXJ5ICE9PSAnc3RyaW5nJywgYFF1ZXJ5IGV4cGVjdHMgYSBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG5cclxuICAgIHJldHVybiBRdWVyeVN0b3JlLnB1c2gocXVlcnkpO1xyXG4gIH0sXHJcbiAgcmVhZHkoY2FsbGJhY2spIHtcclxuICAgIHNldEltbWVkaWF0ZShhc3luYyAoKSA9PiB7XHJcbiAgICAgIHdoaWxlIChHZXRSZXNvdXJjZVN0YXRlKCdveG15c3FsJykgIT09ICdzdGFydGVkJykgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTApKTtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgYXN5bmMgcXVlcnkocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdxdWVyeScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNpbmdsZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NpbmdsZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNjYWxhcihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NjYWxhcicsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHVwZGF0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3VwZGF0ZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIGluc2VydChxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ2luc2VydCcsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHByZXBhcmUocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdwcmVwYXJlJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgcmF3RXhlY3V0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3Jhd0V4ZWN1dGUnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyB0cmFuc2FjdGlvbihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiLCB0cnVlKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3RyYW5zYWN0aW9uJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgaXNSZWFkeSgpIHtcclxuICAgIHJldHVybiBleHAuaXNSZWFkeSgpO1xyXG4gIH0sXHJcbiAgYXN5bmMgYXdhaXRDb25uZWN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGF3YWl0IGV4cC5hd2FpdENvbm5lY3Rpb24oKTtcclxuICB9LFxyXG59O1xyXG4iLCAiLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL3NlcnZlci9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcblxyXG5jb25zdCBhY3RpdmVFdmVudHMgPSB7fTtcclxub25OZXQoYF9ibF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5LCAuLi5hcmdzKSA9PiB7XHJcbiAgICBjb25zdCByZXNvbHZlID0gYWN0aXZlRXZlbnRzW2tleV07XHJcbiAgICByZXR1cm4gcmVzb2x2ZSAmJiByZXNvbHZlKC4uLmFyZ3MpO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2soZXZlbnROYW1lOiBzdHJpbmcsIHBsYXllcklkOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9OiR7cGxheWVySWR9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuICAgIGVtaXROZXQoYF9ibF9jYl8ke2V2ZW50TmFtZX1gLCBwbGF5ZXJJZCwgcmVzb3VyY2VOYW1lLCBrZXksIC4uLmFyZ3MpO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgYWN0aXZlRXZlbnRzW2tleV0gPSByZXNvbHZlO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvbkNsaWVudENhbGxiYWNrKGV2ZW50TmFtZTogc3RyaW5nLCBjYjogKHBsYXllcklkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpIHtcclxuICAgIG9uTmV0KGBfYmxfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcsIGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNyYyA9IHNvdXJjZTtcclxuICAgICAgICBsZXQgcmVzcG9uc2U6IGFueTtcclxuICAgIFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IGNiKHNyYywgLi4uYXJncyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBhbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBoYW5kbGluZyBjYWxsYmFjayBldmVudCAke2V2ZW50TmFtZX1gKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGBeMyR7ZS5zdGFja31eMGApO1xyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIGVtaXROZXQoYF9ibF9jYl8ke3Jlc291cmNlfWAsIHNyYywga2V5LCByZXNwb25zZSk7XHJcbiAgICAgIH0pO1xyXG59XHJcblxyXG5jb25zdCBibF9icmlkZ2UgPSBleHBvcnRzLmJsX2JyaWRnZVxyXG5cclxuZXhwb3J0IGNvbnN0IGNvcmUgPSBibF9icmlkZ2UuY29yZSgpXHJcblxyXG5leHBvcnQgY29uc3QgZ2V0UGxheWVyRGF0YSA9IChzcmM6IG51bWJlcikgPT4ge1xyXG4gICAgcmV0dXJuIGNvcmUuR2V0UGxheWVyKHNyYylcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldEZyYW1ld29ya0lEID0gKHNyYzogbnVtYmVyKSA9PiB7XHJcbiAgICBjb25zdCBwbGF5ZXIgPSBjb3JlLkdldFBsYXllcihzcmMpXHJcbiAgICBpZiAoIXBsYXllcikgcmV0dXJuIG51bGxcclxuICAgIHJldHVybiBwbGF5ZXIuaWRcclxufVxyXG5cclxuXHJcbmNvbnN0IGJsX2NvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5jb25maWcoKVxyXG5leHBvcnQgY29uc3QgY29uZmlnID0gYmxfY29uZmlnIiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUQ2xvdGhlcywgVFNraW4gfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgZ2V0RnJhbWV3b3JrSUQsIG9uQ2xpZW50Q2FsbGJhY2ssIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBveG15c3FsIH0gZnJvbSAnQG92ZXJleHRlbmRlZC9veG15c3FsJztcclxuaW1wb3J0IHsgVFRhdHRvbyB9IGZyb20gJ0B0eXBpbmdzL3RhdHRvb3MnO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVTa2luKHNyYzogbnVtYmVyLCBmcmFtZXdvcmtJZDogc3RyaW5nLCBza2luOiBUU2tpbikge1xyXG4gICAgaWYgKCFmcmFtZXdvcmtJZCkge1xyXG4gICAgICAgIGZyYW1ld29ya0lkID0gZ2V0RnJhbWV3b3JrSUQoc3JjKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuICAgICAgICAnVVBEQVRFIGFwcGVhcmFuY2UgU0VUIHNraW4gPSA/IFdIRVJFIGlkID0gPycsXHJcbiAgICAgICAgW0pTT04uc3RyaW5naWZ5KHNraW4pLCBmcmFtZXdvcmtJZF1cclxuICAgICk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVTa2luJywgc2F2ZVNraW4pO1xyXG5leHBvcnRzKCdTYXZlUGxheWVyU2tpbicsIGZ1bmN0aW9uKGlkLCBza2luKSB7XHJcbiAgICByZXR1cm4gc2F2ZVNraW4obnVsbCwgaWQsIHNraW4pXHJcbn0pO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVDbG90aGVzKHNyYzogbnVtYmVyLCBmcmFtZXdvcmtJZDogc3RyaW5nLCBjbG90aGVzOiBUQ2xvdGhlcykge1xyXG4gICAgaWYgKCFmcmFtZXdvcmtJZCkge1xyXG4gICAgICAgIGZyYW1ld29ya0lkID0gZ2V0RnJhbWV3b3JrSUQoc3JjKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcbiAgICAgICAgJ1VQREFURSBhcHBlYXJhbmNlIFNFVCBjbG90aGVzID0gPyBXSEVSRSBpZCA9ID8nLFxyXG4gICAgICAgIFtKU09OLnN0cmluZ2lmeShjbG90aGVzKSwgZnJhbWV3b3JrSWRdXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlQ2xvdGhlcycsIHNhdmVDbG90aGVzKTtcclxuZXhwb3J0cygnU2F2ZVBsYXllckNsb3RoZXMnLCBmdW5jdGlvbihpZCwgY2xvdGhlcykge1xyXG4gICAgcmV0dXJuIHNhdmVDbG90aGVzKG51bGwsIGlkLCBjbG90aGVzKVxyXG59KTtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlVGF0dG9vcyhzcmM6IG51bWJlciwgZnJhbWV3b3JrSWQ6IHN0cmluZywgdGF0dG9vczogVFRhdHRvb1tdKSB7XHJcbiAgICBpZiAoIWZyYW1ld29ya0lkKSB7XHJcbiAgICAgICAgZnJhbWV3b3JrSWQgPSBnZXRGcmFtZXdvcmtJRChzcmMpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuICAgICAgICAnVVBEQVRFIGFwcGVhcmFuY2UgU0VUIHRhdHRvb3MgPSA/IFdIRVJFIGlkID0gPycsXHJcbiAgICAgICAgW0pTT04uc3RyaW5naWZ5KHRhdHRvb3MpLCBmcmFtZXdvcmtJZF1cclxuICAgICk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVUYXR0b29zJywgc2F2ZVRhdHRvb3MpO1xyXG5leHBvcnRzKCdTYXZlUGxheWVyVGF0dG9vcycsIGZ1bmN0aW9uKGlkLCB0YXR0b29zKSB7XHJcbiAgICByZXR1cm4gc2F2ZVRhdHRvb3MobnVsbCwgaWQsIHRhdHRvb3MpXHJcbn0pO1xyXG5cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlQXBwZWFyYW5jZShzcmM6IG51bWJlciwgZnJhbWV3b3JrSWQ6IHN0cmluZywgYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UpIHtcclxuICAgIGlmIChzcmMgJiYgZnJhbWV3b3JrSWQpIHtcclxuICAgICAgICBjb25zdCBwbGF5ZXJJZCA9IGdldEZyYW1ld29ya0lEKHNyYyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGZyYW1ld29ya0lkICE9PSBwbGF5ZXJJZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1lvdSBhcmUgdHJ5aW5nIHRvIHNhdmUgYW4gYXBwZWFyYW5jZSBmb3IgYSBkaWZmZXJlbnQgcGxheWVyJywgc3JjLCBmcmFtZXdvcmtJZCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cdGlmICghZnJhbWV3b3JrSWQpIHtcclxuXHRcdGZyYW1ld29ya0lkID0gZ2V0RnJhbWV3b3JrSUQoc3JjKTtcclxuXHR9XHJcblxyXG5cdGNvbnN0IGNsb3RoZXMgPSB7XHJcblx0XHRkcmF3YWJsZXM6IGFwcGVhcmFuY2UuZHJhd2FibGVzLFxyXG5cdFx0cHJvcHM6IGFwcGVhcmFuY2UucHJvcHMsXHJcblx0XHRoZWFkT3ZlcmxheTogYXBwZWFyYW5jZS5oZWFkT3ZlcmxheSxcclxuXHR9O1xyXG5cclxuXHRjb25zdCBza2luID0ge1xyXG5cdFx0aGVhZEJsZW5kOiBhcHBlYXJhbmNlLmhlYWRCbGVuZCxcclxuXHRcdGhlYWRTdHJ1Y3R1cmU6IGFwcGVhcmFuY2UuaGVhZFN0cnVjdHVyZSxcclxuXHRcdGhhaXJDb2xvcjogYXBwZWFyYW5jZS5oYWlyQ29sb3IsXHJcblx0XHRtb2RlbDogYXBwZWFyYW5jZS5tb2RlbCxcclxuXHR9O1xyXG5cclxuXHRjb25zdCB0YXR0b29zID0gYXBwZWFyYW5jZS50YXR0b29zIHx8IFtdO1xyXG5cclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcblx0XHQnSU5TRVJUIElOVE8gYXBwZWFyYW5jZSAoaWQsIGNsb3RoZXMsIHNraW4sIHRhdHRvb3MpIFZBTFVFUyAoPywgPywgPywgPykgT04gRFVQTElDQVRFIEtFWSBVUERBVEUgY2xvdGhlcyA9IFZBTFVFUyhjbG90aGVzKSwgc2tpbiA9IFZBTFVFUyhza2luKSwgdGF0dG9vcyA9IFZBTFVFUyh0YXR0b29zKTsnLFxyXG5cdFx0W1xyXG5cdFx0XHRmcmFtZXdvcmtJZCxcclxuXHRcdFx0SlNPTi5zdHJpbmdpZnkoY2xvdGhlcyksXHJcblx0XHRcdEpTT04uc3RyaW5naWZ5KHNraW4pLFxyXG5cdFx0XHRKU09OLnN0cmluZ2lmeSh0YXR0b29zKSxcclxuXHRcdF1cclxuXHQpO1xyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVBcHBlYXJhbmNlJywgc2F2ZUFwcGVhcmFuY2UpO1xyXG5leHBvcnRzKCdTYXZlUGxheWVyQXBwZWFyYW5jZScsIGZ1bmN0aW9uKGlkLCBhcHBlYXJhbmNlKSB7XHJcbiAgICByZXR1cm4gc2F2ZUFwcGVhcmFuY2UobnVsbCwgaWQsIGFwcGVhcmFuY2UpXHJcbn0pO1xyXG4iLCAiIiwgImltcG9ydCB7IG94bXlzcWwgfSBmcm9tICdAb3ZlcmV4dGVuZGVkL294bXlzcWwnO1xuaW1wb3J0IHsgdHJpZ2dlckNsaWVudENhbGxiYWNrIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcbmltcG9ydCB7IHNhdmVBcHBlYXJhbmNlIH0gZnJvbSAnLi4vYXBwZWFyYW5jZS9zZXR0ZXJzJztcblxuY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xuXG5jb25zdCBtaWdyYXRlID0gYXN5bmMgKHNyYzogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IGFueSA9IGF3YWl0IG94bXlzcWwucXVlcnkoJ1NFTEVDVCAqIEZST00gYHBsYXllcnNgJyk7XG4gICAgaWYgKCFyZXNwb25zZSkgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChlbGVtZW50LnNraW4pIHtcbiAgICAgICAgICAgIGF3YWl0IHRyaWdnZXJDbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6bWlncmF0aW9uOnNldEFwcGVhcmFuY2UnLCBzcmMsIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZml2ZW0nLFxuICAgICAgICAgICAgICAgIGRhdGE6IEpTT04ucGFyc2UoZWxlbWVudC5za2luKVxuICAgICAgICAgICAgfSkgYXMgVEFwcGVhcmFuY2VcbiAgICAgICAgICAgIGF3YWl0IGRlbGF5KDEwMCk7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRyaWdnZXJDbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6Z2V0QXBwZWFyYW5jZScsIHNyYykgYXMgVEFwcGVhcmFuY2VcbiAgICAgICAgICAgIGNvbnN0IHBsYXllclNyYyA9IHBhcnNlSW50KHNyYylcbiAgICAgICAgICAgIGF3YWl0IHNhdmVBcHBlYXJhbmNlKHBsYXllclNyYywgZWxlbWVudC5jaXRpemVuaWQsIHJlc3BvbnNlIGFzIFRBcHBlYXJhbmNlKVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdDb252ZXJ0ZWQgJysgcmVzcG9uc2UubGVuZ3RoICsgJyBhcHBlYXJhbmNlcycpXG59O1xuXG5leHBvcnQgZGVmYXVsdCBtaWdyYXRlIiwgImltcG9ydCB7IG94bXlzcWwgfSBmcm9tICdAb3ZlcmV4dGVuZGVkL294bXlzcWwnO1xuaW1wb3J0IHsgdHJpZ2dlckNsaWVudENhbGxiYWNrIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcbmltcG9ydCB7IHNhdmVBcHBlYXJhbmNlIH0gZnJvbSAnLi4vYXBwZWFyYW5jZS9zZXR0ZXJzJztcblxuY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xuXG5jb25zdCBtaWdyYXRlID0gYXN5bmMgKHNyYzogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IGFueSA9IGF3YWl0IG94bXlzcWwucXVlcnkoJ1NFTEVDVCAqIEZST00gYHBsYXllcnNraW5zYCBXSEVSRSBhY3RpdmUgPSAxJyk7XG4gICAgaWYgKCFyZXNwb25zZSkgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChlbGVtZW50LnNraW4pIHtcbiAgICAgICAgICAgIGF3YWl0IHRyaWdnZXJDbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6bWlncmF0aW9uOnNldEFwcGVhcmFuY2UnLCBzcmMsIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnaWxsZW5pdW0nLFxuICAgICAgICAgICAgICAgIGRhdGE6IEpTT04ucGFyc2UoZWxlbWVudC5za2luKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGF3YWl0IGRlbGF5KDEwMCk7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRyaWdnZXJDbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6Z2V0QXBwZWFyYW5jZScsIHNyYykgYXMgVEFwcGVhcmFuY2VcbiAgICAgICAgICAgIGNvbnN0IHBsYXllclNyYyA9IHBhcnNlSW50KHNyYylcbiAgICAgICAgICAgIGF3YWl0IHNhdmVBcHBlYXJhbmNlKHBsYXllclNyYywgZWxlbWVudC5jaXRpemVuaWQsIHJlc3BvbnNlIGFzIFRBcHBlYXJhbmNlKVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdDb252ZXJ0ZWQgJysgcmVzcG9uc2UubGVuZ3RoICsgJyBhcHBlYXJhbmNlcycpXG59O1xuXG5leHBvcnQgZGVmYXVsdCBtaWdyYXRlIiwgImltcG9ydCB7IG94bXlzcWwgfSBmcm9tICdAb3ZlcmV4dGVuZGVkL294bXlzcWwnO1xuaW1wb3J0IHsgdHJpZ2dlckNsaWVudENhbGxiYWNrIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcbmltcG9ydCB7IHNhdmVBcHBlYXJhbmNlIH0gZnJvbSAnLi4vYXBwZWFyYW5jZS9zZXR0ZXJzJztcblxuY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xuXG5jb25zdCBtaWdyYXRlID0gYXN5bmMgKHNyYzogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IGFueSA9IGF3YWl0IG94bXlzcWwucXVlcnkoJ1NFTEVDVCAqIEZST00gYHBsYXllcnNraW5zYCBXSEVSRSBhY3RpdmUgPSAxJyk7XG4gICAgaWYgKCFyZXNwb25zZSkgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHJlc3BvbnNlKSB7XG4gICAgICAgIGVtaXROZXQoJ3FiLWNsb3RoZXM6bG9hZFNraW4nLCBzcmMsIDAsIGVsZW1lbnQubW9kZWwsIGVsZW1lbnQuc2tpbik7XG4gICAgICAgIGF3YWl0IGRlbGF5KDIwMCk7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDpnZXRBcHBlYXJhbmNlJywgc3JjKSBhcyBUQXBwZWFyYW5jZVxuICAgICAgICBjb25zdCBwbGF5ZXJTcmMgPSBwYXJzZUludChzcmMpXG4gICAgICAgIGF3YWl0IHNhdmVBcHBlYXJhbmNlKHBsYXllclNyYywgZWxlbWVudC5jaXRpemVuaWQsIHJlc3BvbnNlIGFzIFRBcHBlYXJhbmNlKVxuICAgIH1cbiAgICBjb25zb2xlLmxvZygnQ29udmVydGVkICcrIHJlc3BvbnNlLmxlbmd0aCArICcgYXBwZWFyYW5jZXMnKVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbWlncmF0ZSIsICJpbXBvcnQgeyBveG15c3FsIH0gZnJvbSBcIkBvdmVyZXh0ZW5kZWQvb3hteXNxbFwiO1xyXG5pbXBvcnQgeyBjb25maWcsIGNvcmUsIGdldEZyYW1ld29ya0lELCBnZXRQbGF5ZXJEYXRhLCBvbkNsaWVudENhbGxiYWNrIH0gZnJvbSBcIi4uL3V0aWxzXCI7XHJcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gXCJAdHlwaW5ncy9vdXRmaXRzXCI7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRPdXRmaXRzKHNyYzogbnVtYmVyLCBmcmFtZXdvcmtJZDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBqb2IgPSBjb3JlLkdldFBsYXllcihzcmMpLmpvYiB8fCB7IG5hbWU6ICd1bmtub3duJywgZ3JhZGU6IHsgbmFtZTogJ3Vua25vd24nIH0gfVxyXG5cdGxldCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1QgKiBGUk9NIG91dGZpdHMgV0hFUkUgcGxheWVyX2lkID0gPyBPUiAoam9ibmFtZSA9ID8gQU5EIGpvYnJhbmsgPD0gPyknLFxyXG5cdFx0W2ZyYW1ld29ya0lkLCBqb2IubmFtZSwgam9iLmdyYWRlLm5hbWVdXHJcblx0KTtcclxuXHRpZiAoIXJlc3BvbnNlKSByZXR1cm4gW107XHJcblxyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc3BvbnNlKSkge1xyXG4gICAgICAgIHJlc3BvbnNlID0gW3Jlc3BvbnNlXTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvdXRmaXRzID0gcmVzcG9uc2UubWFwKFxyXG4gICAgICAgIChvdXRmaXQ6IHsgaWQ6IG51bWJlcjsgbGFiZWw6IHN0cmluZzsgb3V0Zml0OiBzdHJpbmc7IGpvYm5hbWU/OiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG91dGZpdC5pZCxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBvdXRmaXQubGFiZWwsXHJcbiAgICAgICAgICAgICAgICBvdXRmaXQ6IEpTT04ucGFyc2Uob3V0Zml0Lm91dGZpdCksXHJcbiAgICAgICAgICAgICAgICBqb2JuYW1lOiBvdXRmaXQuam9ibmFtZSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBvdXRmaXRzO1xyXG59XHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldE91dGZpdHMnLCBnZXRPdXRmaXRzKTtcclxuZXhwb3J0cygnR2V0T3V0Zml0cycsIGdldE91dGZpdHMpO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVuYW1lT3V0Zml0KHNyYzogbnVtYmVyLCBkYXRhOiB7IGlkOiBudW1iZXI7IGxhYmVsOiBzdHJpbmcgfSkge1xyXG4gICAgY29uc3QgZnJhbWV3b3JrSWQgPSBnZXRGcmFtZXdvcmtJRChzcmMpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcbiAgICAgICAgJ1VQREFURSBvdXRmaXRzIFNFVCBsYWJlbCA9ID8gV0hFUkUgcGxheWVyX2lkID0gPyBBTkQgaWQgPSA/JyxcclxuICAgICAgICBbZGF0YS5sYWJlbCwgZnJhbWV3b3JrSWQsIGRhdGEuaWRdXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZW5hbWVPdXRmaXQnLCByZW5hbWVPdXRmaXQpO1xyXG5leHBvcnRzKCdSZW5hbWVPdXRmaXQnLCByZW5hbWVPdXRmaXQpO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlT3V0Zml0KHNyYzogbnVtYmVyLCBpZDogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBmcmFtZXdvcmtJZCA9IGdldEZyYW1ld29ya0lEKHNyYyk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuICAgICAgICAnREVMRVRFIEZST00gb3V0Zml0cyBXSEVSRSBwbGF5ZXJfaWQgPSA/IEFORCBpZCA9ID8nLFxyXG4gICAgICAgIFtmcmFtZXdvcmtJZCwgaWRdXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIHJlc3VsdCA+IDA7XHJcbn1cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6ZGVsZXRlT3V0Zml0JywgZGVsZXRlT3V0Zml0KTtcclxuZXhwb3J0cygnRGVsZXRlT3V0Zml0JywgZGVsZXRlT3V0Zml0KTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVPdXRmaXQoc3JjOiBudW1iZXIsIGRhdGE6IE91dGZpdCkge1xyXG4gICAgY29uc3QgZnJhbWV3b3JrSWQgPSBnZXRGcmFtZXdvcmtJRChzcmMpO1xyXG4gICAgbGV0IGpvYm5hbWUgPSBudWxsO1xyXG4gICAgbGV0IGpvYnJhbmsgPSAwO1xyXG4gICAgaWYgKGRhdGEuam9iKSB7XHJcbiAgICAgICAgam9ibmFtZSA9IGRhdGEuam9iLm5hbWU7XHJcbiAgICAgICAgam9icmFuayA9IGRhdGEuam9iLnJhbms7XHJcbiAgICB9XHJcbiAgICBjb25zdCBpZCA9IGF3YWl0IG94bXlzcWwuaW5zZXJ0KFxyXG4gICAgICAgICdJTlNFUlQgSU5UTyBvdXRmaXRzIChwbGF5ZXJfaWQsIGxhYmVsLCBvdXRmaXQsIGpvYm5hbWUsIGpvYnJhbmspIFZBTFVFUyAoPywgPywgPywgPywgPyknLFxyXG4gICAgICAgIFtmcmFtZXdvcmtJZCwgZGF0YS5sYWJlbCwgSlNPTi5zdHJpbmdpZnkoZGF0YS5vdXRmaXQpLCBqb2JuYW1lLCBqb2JyYW5rXVxyXG4gICAgKTtcclxuICAgIHJldHVybiBpZDtcclxufVxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlT3V0Zml0Jywgc2F2ZU91dGZpdCk7XHJcbmV4cG9ydHMoJ1NhdmVPdXRmaXQnLCBzYXZlT3V0Zml0KTtcclxuXHJcblxyXG5hc3luYyBmdW5jdGlvbiBmZXRjaE91dGZpdChfOiBudW1iZXIsIGlkOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG4gICAgICAgICdTRUxFQ1Qgb3V0Zml0IEZST00gb3V0Zml0cyBXSEVSRSBpZCA9ID8nLFxyXG4gICAgICAgIFtpZF1cclxuICAgICk7XHJcbiAgICByZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSk7XHJcbn1cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6ZmV0Y2hPdXRmaXQnLCBmZXRjaE91dGZpdCk7XHJcbmV4cG9ydHMoJ0ZldGNoT3V0Zml0JywgZmV0Y2hPdXRmaXQpO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gaW1wb3J0T3V0Zml0KF86IG51bWJlciwgZnJhbWV3b3JrSWQ6IHN0cmluZywgb3V0Zml0SWQ6IG51bWJlciwgb3V0Zml0TmFtZTogc3RyaW5nKSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnF1ZXJ5KFxyXG4gICAgICAgICdTRUxFQ1QgbGFiZWwsIG91dGZpdCBGUk9NIG91dGZpdHMgV0hFUkUgaWQgPSA/JyxcclxuICAgICAgICBbb3V0Zml0SWRdXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghcmVzdWx0IHx8IHR5cGVvZiByZXN1bHQgIT09ICdvYmplY3QnIHx8IE9iamVjdC5rZXlzKHJlc3VsdCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6ICdPdXRmaXQgbm90IGZvdW5kJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5ld0lkID0gYXdhaXQgb3hteXNxbC5pbnNlcnQoXHJcbiAgICAgICAgJ0lOU0VSVCBJTlRPIG91dGZpdHMgKHBsYXllcl9pZCwgbGFiZWwsIG91dGZpdCkgVkFMVUVTICg/LCA/LCA/KScsXHJcbiAgICAgICAgW2ZyYW1ld29ya0lkLCBvdXRmaXROYW1lLCByZXN1bHQub3V0Zml0XVxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBuZXdJZDogbmV3SWQgfTtcclxufVxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjppbXBvcnRPdXRmaXQnLCBpbXBvcnRPdXRmaXQpO1xyXG5leHBvcnRzKCdJbXBvcnRPdXRmaXQnLCBpbXBvcnRPdXRmaXQpO1xyXG5cclxuY29uc3Qgb3V0Zml0SXRlbSA9IGNvbmZpZy5vdXRmaXRJdGVtXHJcblxyXG5pZiAoIW91dGZpdEl0ZW0pIHtcclxuICAgIGNvbnNvbGUud2FybignYmxfYXBwZWFyYW5jZTogTm8gb3V0Zml0IGl0ZW0gY29uZmlndXJlZCwgcGxlYXNlIHNldCBpdCBpbiBjb25maWcubHVhJylcclxufVxyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6aXRlbU91dGZpdCcsIGFzeW5jIChzcmMsIGRhdGEpID0+IHtcclxuXHRjb25zdCBwbGF5ZXIgPSBjb3JlLkdldFBsYXllcihzcmMpXHJcblx0cGxheWVyLmFkZEl0ZW0ob3V0Zml0SXRlbSwgMSwgZGF0YSlcclxufSk7XHJcblxyXG5jb3JlLlJlZ2lzdGVyVXNhYmxlSXRlbShvdXRmaXRJdGVtLCBhc3luYyAoc291cmNlOiBudW1iZXIsIHNsb3Q6IG51bWJlciwgbWV0YWRhdGE6IHtvdXRmaXQ6IE91dGZpdCwgbGFiZWw6IHN0cmluZ30pID0+IHtcclxuXHRjb25zdCBwbGF5ZXIgPSBnZXRQbGF5ZXJEYXRhKHNvdXJjZSlcclxuXHRpZiAocGxheWVyPy5yZW1vdmVJdGVtKG91dGZpdEl0ZW0sIDEsIHNsb3QpKSBcclxuXHRcdGVtaXROZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnVzZU91dGZpdEl0ZW0nLCBzb3VyY2UsIG1ldGFkYXRhLm91dGZpdClcclxufSkiLCAiaW1wb3J0ICcuL2FwcGVhcmFuY2Uvb3V0Zml0cyc7XHJcbmltcG9ydCAnLi9hcHBlYXJhbmNlL3NldHRlcnMnO1xyXG5pbXBvcnQgJy4vYXBwZWFyYW5jZS9nZXR0ZXJzJztcclxuaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCc7XHJcblxyXG5veG15c3FsLnJlYWR5KGFzeW5jICgpID0+IHtcclxuICAgIC8vIHNlZSBpZiB0aGVyZSBpcyBhIHRhYmxlIGNhbGxlZCBhcHBlYXJhbmNlXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IG94bXlzcWwucXVlcnkoJ1NFTEVDVCAxIEZST00gYXBwZWFyYW5jZSBMSU1JVCAxJyk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNoZWNraW5nIGFwcGVhcmFuY2UgdGFibGUuIE1vc3QgbGlrZWx5IHRoZSB0YWJsZSBkb2VzIG5vdCBleGlzdDogJywgZXJyb3IpO1xyXG4gICAgICAgIC8vIFlvdSBjYW4gYWRkIGFkZGl0aW9uYWwgZXJyb3IgaGFuZGxpbmcgb3IgcmVjb3ZlcnkgbG9naWMgaGVyZSBpZiBuZWVkZWRcclxuICAgIH1cclxufSk7XHJcblxyXG5vbk5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2V0cm91dGluZ2J1Y2tldCcsICgpID0+IHtcclxuXHRTZXRQbGF5ZXJSb3V0aW5nQnVja2V0KHNvdXJjZS50b1N0cmluZygpLCBzb3VyY2UpXHJcbn0pO1xyXG5cclxub25OZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlc2V0cm91dGluZ2J1Y2tldCcsICgpID0+IHtcclxuXHRTZXRQbGF5ZXJSb3V0aW5nQnVja2V0KHNvdXJjZS50b1N0cmluZygpLCAwKVxyXG59KTtcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgnbWlncmF0ZScsIGFzeW5jIChzb3VyY2U6IG51bWJlcikgPT4ge1xyXG5cdHNvdXJjZSA9IHNvdXJjZSAhPT0gMCA/IHNvdXJjZSA6IHBhcnNlSW50KGdldFBsYXllcnMoKVswXSlcclxuXHRjb25zdCBibF9hcHBlYXJhbmNlID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlO1xyXG5cdGNvbnN0IGNvbmZpZyA9IGJsX2FwcGVhcmFuY2UuY29uZmlnKCk7XHJcblx0Y29uc3QgaW1wb3J0ZWRNb2R1bGUgPSBhd2FpdCBpbXBvcnQoYC4vbWlncmF0ZS8ke2NvbmZpZy5wcmV2aW91c0Nsb3RoaW5nID09PSAnZml2ZW0tYXBwZWFyYW5jZScgPyAnZml2ZW0nIDogY29uZmlnLnByZXZpb3VzQ2xvdGhpbmd9LnRzYClcclxuXHRpbXBvcnRlZE1vZHVsZS5kZWZhdWx0KHNvdXJjZSlcclxufSwgZmFsc2UpO1xyXG4iLCAiaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gXCJAb3ZlcmV4dGVuZGVkL294bXlzcWxcIjtcclxuaW1wb3J0IHsgZ2V0RnJhbWV3b3JrSUQsIG9uQ2xpZW50Q2FsbGJhY2sgfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuaW1wb3J0IHsgU2tpbkRCIH0gZnJvbSBcIkB0eXBpbmdzL2FwcGVhcmFuY2VcIjtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNraW4oc3JjOiBudW1iZXIsIGZyYW1ld29ya0lkOiBzdHJpbmcpIHtcclxuICAgIGlmICghZnJhbWV3b3JrSWQpIHtcclxuICAgICAgICBmcmFtZXdvcmtJZCA9IGdldEZyYW1ld29ya0lEKHNyYyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcbiAgICAgICAgJ1NFTEVDVCBza2luIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG4gICAgICAgIFtmcmFtZXdvcmtJZF1cclxuICAgICk7XHJcbiAgICByZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSk7XHJcbn1cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0U2tpbicsIGdldFNraW4pO1xyXG5leHBvcnRzKCdHZXRQbGF5ZXJTa2luJywgZnVuY3Rpb24oaWQpIHtcclxuICAgIHJldHVybiBnZXRTa2luKG51bGwsIGlkKVxyXG59KTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldENsb3RoZXMoc3JjOiBudW1iZXIsIGZyYW1ld29ya0lkOiBzdHJpbmcpIHtcclxuICAgIGlmICghZnJhbWV3b3JrSWQpIHtcclxuICAgICAgICBmcmFtZXdvcmtJZCA9IGdldEZyYW1ld29ya0lEKHNyYyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcbiAgICAgICAgJ1NFTEVDVCBjbG90aGVzIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG4gICAgICAgIFtmcmFtZXdvcmtJZF1cclxuICAgICk7XHJcbiAgICByZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSk7XHJcbn1cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0Q2xvdGhlcycsIGdldENsb3RoZXMpO1xyXG5leHBvcnRzKCdHZXRQbGF5ZXJDbG90aGVzJywgZnVuY3Rpb24oaWQpIHtcclxuICAgIHJldHVybiBnZXRDbG90aGVzKG51bGwsIGlkKVxyXG59KTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFRhdHRvb3Moc3JjOiBudW1iZXIsIGZyYW1ld29ya0lkOiBzdHJpbmcpIHtcclxuICAgIGlmICghZnJhbWV3b3JrSWQpIHtcclxuICAgICAgICBmcmFtZXdvcmtJZCA9IGdldEZyYW1ld29ya0lEKHNyYyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcbiAgICAgICAgJ1NFTEVDVCB0YXR0b29zIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG4gICAgICAgIFtmcmFtZXdvcmtJZF1cclxuICAgICk7XHJcbiAgICByZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSkgfHwgW107XHJcbn1cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0VGF0dG9vcycsIGdldFRhdHRvb3MpO1xyXG5leHBvcnRzKCdHZXRQbGF5ZXJUYXR0b29zJywgZnVuY3Rpb24oaWQpIHtcclxuICAgIHJldHVybiBnZXRUYXR0b29zKG51bGwsIGlkKVxyXG59KTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEFwcGVhcmFuY2Uoc3JjOiBudW1iZXIsIGZyYW1ld29ya0lkOiBzdHJpbmcpIHtcclxuICAgIGlmICghZnJhbWV3b3JrSWQgJiYgIXNyYykgcmV0dXJuIG51bGw7XHJcbiAgICBcclxuICAgIGlmICghZnJhbWV3b3JrSWQpIHtcclxuICAgICAgICBmcmFtZXdvcmtJZCA9IGdldEZyYW1ld29ya0lEKHNyYyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVzcG9uc2U6IFNraW5EQiA9IGF3YWl0IG94bXlzcWwuc2luZ2xlKFxyXG4gICAgICAgICdTRUxFQ1QgKiBGUk9NIGFwcGVhcmFuY2UgV0hFUkUgaWQgPSA/IExJTUlUIDEnLFxyXG4gICAgICAgIFtmcmFtZXdvcmtJZF1cclxuICAgICk7XHJcblxyXG4gICAgaWYgKCFyZXNwb25zZSkgcmV0dXJuIG51bGw7XHJcbiAgICBsZXQgYXBwZWFyYW5jZSA9IHtcclxuICAgICAgICAuLi5KU09OLnBhcnNlKHJlc3BvbnNlLnNraW4pLFxyXG4gICAgICAgIC4uLkpTT04ucGFyc2UocmVzcG9uc2UuY2xvdGhlcyksXHJcbiAgICAgICAgdGF0dG9vczogSlNPTi5wYXJzZShyZXNwb25zZS50YXR0b29zKSxcclxuICAgIH1cclxuICAgIGFwcGVhcmFuY2UuaWQgPSByZXNwb25zZS5pZFxyXG4gICAgcmV0dXJuIGFwcGVhcmFuY2U7XHJcbn1cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGdldEFwcGVhcmFuY2UpO1xyXG5leHBvcnRzKCdHZXRQbGF5ZXJBcHBlYXJhbmNlJywgZnVuY3Rpb24oaWQpIHtcclxuICAgIHJldHVybiBnZXRBcHBlYXJhbmNlKG51bGwsIGlkKVxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QUcsTUFBTTtBQUNqRCxDQUFDO0FBRUQsTUFBTSwyQ0FBMkMsTUFBTTtBQUN0RCx5QkFBdUIsT0FBTyxTQUFTLEdBQUcsQ0FBQztBQUM1QyxDQUFDO0FBRUQsZ0JBQWdCLFdBQVcsT0FBT0MsWUFBbUI7QUFDcEQsRUFBQUEsVUFBU0EsWUFBVyxJQUFJQSxVQUFTLFNBQVMsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUN6RCxRQUFNLGdCQUFnQixRQUFRO0FBQzlCLFFBQU1DLFVBQVMsY0FBYyxPQUFPO0FBQ3BDLFFBQU0saUJBQWlCLE1BQWEsbUNBQWFBLFFBQU8scUJBQXFCLHFCQUFxQixVQUFVQSxRQUFPLGdCQUFnQjtBQUNuSSxpQkFBZSxRQUFRRCxPQUFNO0FBQzlCLEdBQUcsS0FBSzsiLAogICJuYW1lcyI6IFsiZXhwb3J0cyIsICJpbXBvcnRfb3hteXNxbCIsICJpbXBvcnRfb3hteXNxbCIsICJyZXNwb25zZSIsICJpbXBvcnRfb3hteXNxbCIsICJkZWxheSIsICJtaWdyYXRlIiwgInJlc3BvbnNlIiwgImltcG9ydF9veG15c3FsIiwgImRlbGF5IiwgIm1pZ3JhdGUiLCAicmVzcG9uc2UiLCAic291cmNlIiwgImltcG9ydF9veG15c3FsIiwgImltcG9ydF9veG15c3FsIiwgInNvdXJjZSIsICJjb25maWciXQp9Cg==
