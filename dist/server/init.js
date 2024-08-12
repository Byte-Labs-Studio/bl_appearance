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
async function saveSkin(src, skin) {
  const frameworkId = getFrameworkID(src);
  const result = await import_oxmysql2.oxmysql.update(
    "UPDATE appearance SET skin = ? WHERE id = ?",
    [JSON.stringify(skin), frameworkId]
  );
  return result;
}
async function saveClothes(src, clothes) {
  const frameworkId = getFrameworkID(src);
  const result = await import_oxmysql2.oxmysql.update(
    "UPDATE appearance SET clothes = ? WHERE id = ?",
    [JSON.stringify(clothes), frameworkId]
  );
  return result;
}
async function saveTattoos(src, tattoos) {
  const frameworkId = getFrameworkID(src);
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
    exports("SaveSkin", saveSkin);
    __name(saveClothes, "saveClothes");
    onClientCallback("bl_appearance:server:saveClothes", saveClothes);
    exports("SaveClothes", saveClothes);
    __name(saveTattoos, "saveTattoos");
    onClientCallback("bl_appearance:server:saveTattoos", saveTattoos);
    exports("SaveTattoos", saveTattoos);
    __name(saveAppearance, "saveAppearance");
    onClientCallback("bl_appearance:server:saveAppearance", saveAppearance);
    exports("SaveAppearance", function(id, appearance) {
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
exports("GetSkin", function(id) {
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
exports("GetClothes", function(id) {
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
exports("GetTattoos", function(id) {
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
exports("GetAppearance", function(id) {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL0BvdmVyZXh0ZW5kZWQvb3hteXNxbC9NeVNRTC50cyIsICIuLi8uLi9zcmMvc2VydmVyL3V0aWxzL2luZGV4LnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvYXBwZWFyYW5jZS9zZXR0ZXJzLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvbWlncmF0ZS9lc3gudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9taWdyYXRlL2ZpdmVtLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvbWlncmF0ZS9pbGxlbml1bS50cyIsICIuLi8uLi9zcmMvc2VydmVyL21pZ3JhdGUvcWIudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9hcHBlYXJhbmNlL291dGZpdHMudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9pbml0LnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvYXBwZWFyYW5jZS9nZXR0ZXJzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJ0eXBlIFF1ZXJ5ID0gc3RyaW5nIHwgbnVtYmVyO1xyXG50eXBlIFBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5rbm93bltdIHwgRnVuY3Rpb247XHJcbnR5cGUgQ2FsbGJhY2s8VD4gPSAocmVzdWx0OiBUIHwgbnVsbCkgPT4gdm9pZDtcclxuXHJcbnR5cGUgVHJhbnNhY3Rpb24gPVxyXG4gIHwgc3RyaW5nW11cclxuICB8IFtzdHJpbmcsIFBhcmFtc11bXVxyXG4gIHwgeyBxdWVyeTogc3RyaW5nOyB2YWx1ZXM6IFBhcmFtcyB9W11cclxuICB8IHsgcXVlcnk6IHN0cmluZzsgcGFyYW1ldGVyczogUGFyYW1zIH1bXTtcclxuXHJcbmludGVyZmFjZSBSZXN1bHQge1xyXG4gIFtjb2x1bW46IHN0cmluZyB8IG51bWJlcl06IGFueTtcclxuICBhZmZlY3RlZFJvd3M/OiBudW1iZXI7XHJcbiAgZmllbGRDb3VudD86IG51bWJlcjtcclxuICBpbmZvPzogc3RyaW5nO1xyXG4gIGluc2VydElkPzogbnVtYmVyO1xyXG4gIHNlcnZlclN0YXR1cz86IG51bWJlcjtcclxuICB3YXJuaW5nU3RhdHVzPzogbnVtYmVyO1xyXG4gIGNoYW5nZWRSb3dzPzogbnVtYmVyO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUm93IHtcclxuICBbY29sdW1uOiBzdHJpbmcgfCBudW1iZXJdOiB1bmtub3duO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgT3hNeVNRTCB7XHJcbiAgc3RvcmU6IChxdWVyeTogc3RyaW5nKSA9PiB2b2lkO1xyXG4gIHJlYWR5OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQ7XHJcbiAgcXVlcnk6IDxUID0gUmVzdWx0IHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBzaW5nbGU6IDxUID0gUm93IHwgbnVsbD4oXHJcbiAgICBxdWVyeTogUXVlcnksXHJcbiAgICBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxFeGNsdWRlPFQsIFtdPj4sXHJcbiAgICBjYj86IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PlxyXG4gICkgPT4gUHJvbWlzZTxFeGNsdWRlPFQsIFtdPj47XHJcbiAgc2NhbGFyOiA8VCA9IHVua25vd24gfCBudWxsPihcclxuICAgIHF1ZXJ5OiBRdWVyeSxcclxuICAgIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PixcclxuICAgIGNiPzogQ2FsbGJhY2s8RXhjbHVkZTxULCBbXT4+XHJcbiAgKSA9PiBQcm9taXNlPEV4Y2x1ZGU8VCwgW10+PjtcclxuICB1cGRhdGU6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBpbnNlcnQ6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBwcmVwYXJlOiA8VCA9IGFueT4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICByYXdFeGVjdXRlOiA8VCA9IFJlc3VsdCB8IG51bGw+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgdHJhbnNhY3Rpb246IChxdWVyeTogVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPGJvb2xlYW4+LCBjYj86IENhbGxiYWNrPGJvb2xlYW4+KSA9PiBQcm9taXNlPGJvb2xlYW4+O1xyXG4gIGlzUmVhZHk6ICgpID0+IGJvb2xlYW47XHJcbiAgYXdhaXRDb25uZWN0aW9uOiAoKSA9PiBQcm9taXNlPHRydWU+O1xyXG59XHJcblxyXG5jb25zdCBRdWVyeVN0b3JlOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbjogYm9vbGVhbiwgbWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgaWYgKCFjb25kaXRpb24pIHRocm93IG5ldyBUeXBlRXJyb3IobWVzc2FnZSk7XHJcbn1cclxuXHJcbmNvbnN0IHNhZmVBcmdzID0gKHF1ZXJ5OiBRdWVyeSB8IFRyYW5zYWN0aW9uLCBwYXJhbXM/OiBhbnksIGNiPzogRnVuY3Rpb24sIHRyYW5zYWN0aW9uPzogdHJ1ZSkgPT4ge1xyXG4gIGlmICh0eXBlb2YgcXVlcnkgPT09ICdudW1iZXInKSBxdWVyeSA9IFF1ZXJ5U3RvcmVbcXVlcnldO1xyXG5cclxuICBpZiAodHJhbnNhY3Rpb24pIHtcclxuICAgIGFzc2VydCh0eXBlb2YgcXVlcnkgPT09ICdvYmplY3QnLCBgRmlyc3QgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0LCByZWNpZXZlZCAke3R5cGVvZiBxdWVyeX1gKTtcclxuICB9IGVsc2Uge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBxdWVyeSA9PT0gJ3N0cmluZycsIGBGaXJzdCBhcmd1bWVudCBleHBlY3RlZCBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG4gIH1cclxuXHJcbiAgaWYgKHBhcmFtcykge1xyXG4gICAgY29uc3QgcGFyYW1UeXBlID0gdHlwZW9mIHBhcmFtcztcclxuICAgIGFzc2VydChcclxuICAgICAgcGFyYW1UeXBlID09PSAnb2JqZWN0JyB8fCBwYXJhbVR5cGUgPT09ICdmdW5jdGlvbicsXHJcbiAgICAgIGBTZWNvbmQgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0IG9yIGZ1bmN0aW9uLCByZWNlaXZlZCAke3BhcmFtVHlwZX1gXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghY2IgJiYgcGFyYW1UeXBlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGNiID0gcGFyYW1zO1xyXG4gICAgICBwYXJhbXMgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoY2IgIT09IHVuZGVmaW5lZCkgYXNzZXJ0KHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJywgYFRoaXJkIGFyZ3VtZW50IGV4cGVjdGVkIGZ1bmN0aW9uLCByZWNlaXZlZCAke3R5cGVvZiBjYn1gKTtcclxuXHJcbiAgcmV0dXJuIFtxdWVyeSwgcGFyYW1zLCBjYl07XHJcbn07XHJcblxyXG5jb25zdCBleHAgPSBnbG9iYWwuZXhwb3J0cy5veG15c3FsO1xyXG5jb25zdCBjdXJyZW50UmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpO1xyXG5cclxuZnVuY3Rpb24gZXhlY3V0ZShtZXRob2Q6IHN0cmluZywgcXVlcnk6IFF1ZXJ5IHwgVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcykge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBleHBbbWV0aG9kXShcclxuICAgICAgcXVlcnksXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgKHJlc3VsdCwgZXJyb3IpID0+IHtcclxuICAgICAgICBpZiAoZXJyb3IpIHJldHVybiByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIHJlc29sdmUocmVzdWx0KTtcclxuICAgICAgfSxcclxuICAgICAgY3VycmVudFJlc291cmNlTmFtZSxcclxuICAgICAgdHJ1ZVxyXG4gICAgKTtcclxuICB9KSBhcyBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBveG15c3FsOiBPeE15U1FMID0ge1xyXG4gIHN0b3JlKHF1ZXJ5KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIHF1ZXJ5ICE9PSAnc3RyaW5nJywgYFF1ZXJ5IGV4cGVjdHMgYSBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG5cclxuICAgIHJldHVybiBRdWVyeVN0b3JlLnB1c2gocXVlcnkpO1xyXG4gIH0sXHJcbiAgcmVhZHkoY2FsbGJhY2spIHtcclxuICAgIHNldEltbWVkaWF0ZShhc3luYyAoKSA9PiB7XHJcbiAgICAgIHdoaWxlIChHZXRSZXNvdXJjZVN0YXRlKCdveG15c3FsJykgIT09ICdzdGFydGVkJykgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTApKTtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgYXN5bmMgcXVlcnkocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdxdWVyeScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNpbmdsZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NpbmdsZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNjYWxhcihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NjYWxhcicsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHVwZGF0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3VwZGF0ZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIGluc2VydChxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ2luc2VydCcsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHByZXBhcmUocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdwcmVwYXJlJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgcmF3RXhlY3V0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3Jhd0V4ZWN1dGUnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyB0cmFuc2FjdGlvbihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiLCB0cnVlKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3RyYW5zYWN0aW9uJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgaXNSZWFkeSgpIHtcclxuICAgIHJldHVybiBleHAuaXNSZWFkeSgpO1xyXG4gIH0sXHJcbiAgYXN5bmMgYXdhaXRDb25uZWN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGF3YWl0IGV4cC5hd2FpdENvbm5lY3Rpb24oKTtcclxuICB9LFxyXG59O1xyXG4iLCAiLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL3NlcnZlci9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcblxyXG5jb25zdCBhY3RpdmVFdmVudHMgPSB7fTtcclxub25OZXQoYF9ibF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5LCAuLi5hcmdzKSA9PiB7XHJcbiAgICBjb25zdCByZXNvbHZlID0gYWN0aXZlRXZlbnRzW2tleV07XHJcbiAgICByZXR1cm4gcmVzb2x2ZSAmJiByZXNvbHZlKC4uLmFyZ3MpO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2soZXZlbnROYW1lOiBzdHJpbmcsIHBsYXllcklkOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9OiR7cGxheWVySWR9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuICAgIGVtaXROZXQoYF9ibF9jYl8ke2V2ZW50TmFtZX1gLCBwbGF5ZXJJZCwgcmVzb3VyY2VOYW1lLCBrZXksIC4uLmFyZ3MpO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgYWN0aXZlRXZlbnRzW2tleV0gPSByZXNvbHZlO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvbkNsaWVudENhbGxiYWNrKGV2ZW50TmFtZTogc3RyaW5nLCBjYjogKHBsYXllcklkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpIHtcclxuICAgIG9uTmV0KGBfYmxfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcsIGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNyYyA9IHNvdXJjZTtcclxuICAgICAgICBsZXQgcmVzcG9uc2U6IGFueTtcclxuICAgIFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IGNiKHNyYywgLi4uYXJncyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBhbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBoYW5kbGluZyBjYWxsYmFjayBldmVudCAke2V2ZW50TmFtZX1gKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGBeMyR7ZS5zdGFja31eMGApO1xyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIGVtaXROZXQoYF9ibF9jYl8ke3Jlc291cmNlfWAsIHNyYywga2V5LCByZXNwb25zZSk7XHJcbiAgICAgIH0pO1xyXG59XHJcblxyXG5jb25zdCBibF9icmlkZ2UgPSBleHBvcnRzLmJsX2JyaWRnZVxyXG5cclxuZXhwb3J0IGNvbnN0IGNvcmUgPSBibF9icmlkZ2UuY29yZSgpXHJcblxyXG5leHBvcnQgY29uc3QgZ2V0UGxheWVyRGF0YSA9IChzcmM6IG51bWJlcikgPT4ge1xyXG4gICAgcmV0dXJuIGNvcmUuR2V0UGxheWVyKHNyYylcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldEZyYW1ld29ya0lEID0gKHNyYzogbnVtYmVyKSA9PiB7XHJcbiAgICBjb25zdCBwbGF5ZXIgPSBjb3JlLkdldFBsYXllcihzcmMpXHJcbiAgICBpZiAoIXBsYXllcikgcmV0dXJuIG51bGxcclxuICAgIHJldHVybiBwbGF5ZXIuaWRcclxufVxyXG5cclxuXHJcbmNvbnN0IGJsX2NvbmZpZyA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZS5jb25maWcoKVxyXG5leHBvcnQgY29uc3QgY29uZmlnID0gYmxfY29uZmlnIiwgImltcG9ydCB7IFRBcHBlYXJhbmNlLCBUQ2xvdGhlcywgVFNraW4gfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgZ2V0RnJhbWV3b3JrSUQsIG9uQ2xpZW50Q2FsbGJhY2ssIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBveG15c3FsIH0gZnJvbSAnQG92ZXJleHRlbmRlZC9veG15c3FsJztcclxuaW1wb3J0IHsgVFRhdHRvbyB9IGZyb20gJ0B0eXBpbmdzL3RhdHRvb3MnO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVTa2luKHNyYzogbnVtYmVyLCBza2luOiBUU2tpbikge1xyXG4gICAgY29uc3QgZnJhbWV3b3JrSWQgPSBnZXRGcmFtZXdvcmtJRChzcmMpO1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxyXG4gICAgICAgICdVUERBVEUgYXBwZWFyYW5jZSBTRVQgc2tpbiA9ID8gV0hFUkUgaWQgPSA/JyxcclxuICAgICAgICBbSlNPTi5zdHJpbmdpZnkoc2tpbiksIGZyYW1ld29ya0lkXVxyXG4gICAgKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZVNraW4nLCBzYXZlU2tpbik7XHJcbmV4cG9ydHMoJ1NhdmVTa2luJywgc2F2ZVNraW4pO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVDbG90aGVzKHNyYzogbnVtYmVyLCBjbG90aGVzOiBUQ2xvdGhlcykge1xyXG4gICAgY29uc3QgZnJhbWV3b3JrSWQgPSBnZXRGcmFtZXdvcmtJRChzcmMpO1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxyXG4gICAgICAgICdVUERBVEUgYXBwZWFyYW5jZSBTRVQgY2xvdGhlcyA9ID8gV0hFUkUgaWQgPSA/JyxcclxuICAgICAgICBbSlNPTi5zdHJpbmdpZnkoY2xvdGhlcyksIGZyYW1ld29ya0lkXVxyXG4gICAgKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUNsb3RoZXMnLCBzYXZlQ2xvdGhlcyk7XHJcbmV4cG9ydHMoJ1NhdmVDbG90aGVzJywgc2F2ZUNsb3RoZXMpO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVUYXR0b29zKHNyYzogbnVtYmVyLCB0YXR0b29zOiBUVGF0dG9vW10pIHtcclxuICAgIGNvbnN0IGZyYW1ld29ya0lkID0gZ2V0RnJhbWV3b3JrSUQoc3JjKTtcclxuICAgIFxyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcbiAgICAgICAgJ1VQREFURSBhcHBlYXJhbmNlIFNFVCB0YXR0b29zID0gPyBXSEVSRSBpZCA9ID8nLFxyXG4gICAgICAgIFtKU09OLnN0cmluZ2lmeSh0YXR0b29zKSwgZnJhbWV3b3JrSWRdXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlVGF0dG9vcycsIHNhdmVUYXR0b29zKTtcclxuZXhwb3J0cygnU2F2ZVRhdHRvb3MnLCBzYXZlVGF0dG9vcyk7XHJcblxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVBcHBlYXJhbmNlKHNyYzogbnVtYmVyLCBmcmFtZXdvcmtJZDogc3RyaW5nLCBhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSkge1xyXG4gICAgaWYgKHNyYyAmJiBmcmFtZXdvcmtJZCkge1xyXG4gICAgICAgIGNvbnN0IHBsYXllcklkID0gZ2V0RnJhbWV3b3JrSUQoc3JjKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoZnJhbWV3b3JrSWQgIT09IHBsYXllcklkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignWW91IGFyZSB0cnlpbmcgdG8gc2F2ZSBhbiBhcHBlYXJhbmNlIGZvciBhIGRpZmZlcmVudCBwbGF5ZXInLCBzcmMsIGZyYW1ld29ya0lkKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblx0aWYgKCFmcmFtZXdvcmtJZCkge1xyXG5cdFx0ZnJhbWV3b3JrSWQgPSBnZXRGcmFtZXdvcmtJRChzcmMpO1xyXG5cdH1cclxuXHJcblx0Y29uc3QgY2xvdGhlcyA9IHtcclxuXHRcdGRyYXdhYmxlczogYXBwZWFyYW5jZS5kcmF3YWJsZXMsXHJcblx0XHRwcm9wczogYXBwZWFyYW5jZS5wcm9wcyxcclxuXHRcdGhlYWRPdmVybGF5OiBhcHBlYXJhbmNlLmhlYWRPdmVybGF5LFxyXG5cdH07XHJcblxyXG5cdGNvbnN0IHNraW4gPSB7XHJcblx0XHRoZWFkQmxlbmQ6IGFwcGVhcmFuY2UuaGVhZEJsZW5kLFxyXG5cdFx0aGVhZFN0cnVjdHVyZTogYXBwZWFyYW5jZS5oZWFkU3RydWN0dXJlLFxyXG5cdFx0aGFpckNvbG9yOiBhcHBlYXJhbmNlLmhhaXJDb2xvcixcclxuXHRcdG1vZGVsOiBhcHBlYXJhbmNlLm1vZGVsLFxyXG5cdH07XHJcblxyXG5cdGNvbnN0IHRhdHRvb3MgPSBhcHBlYXJhbmNlLnRhdHRvb3MgfHwgW107XHJcblxyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdJTlNFUlQgSU5UTyBhcHBlYXJhbmNlIChpZCwgY2xvdGhlcywgc2tpbiwgdGF0dG9vcykgVkFMVUVTICg/LCA/LCA/LCA/KSBPTiBEVVBMSUNBVEUgS0VZIFVQREFURSBjbG90aGVzID0gVkFMVUVTKGNsb3RoZXMpLCBza2luID0gVkFMVUVTKHNraW4pLCB0YXR0b29zID0gVkFMVUVTKHRhdHRvb3MpOycsXHJcblx0XHRbXHJcblx0XHRcdGZyYW1ld29ya0lkLFxyXG5cdFx0XHRKU09OLnN0cmluZ2lmeShjbG90aGVzKSxcclxuXHRcdFx0SlNPTi5zdHJpbmdpZnkoc2tpbiksXHJcblx0XHRcdEpTT04uc3RyaW5naWZ5KHRhdHRvb3MpLFxyXG5cdFx0XVxyXG5cdCk7XHJcblxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUFwcGVhcmFuY2UnLCBzYXZlQXBwZWFyYW5jZSk7XHJcbmV4cG9ydHMoJ1NhdmVBcHBlYXJhbmNlJywgZnVuY3Rpb24oaWQsIGFwcGVhcmFuY2UpIHtcclxuICAgIHJldHVybiBzYXZlQXBwZWFyYW5jZShudWxsLCBpZCwgYXBwZWFyYW5jZSlcclxufSk7XHJcbiIsICIiLCAiaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCc7XG5pbXBvcnQgeyB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2sgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xuaW1wb3J0IHsgc2F2ZUFwcGVhcmFuY2UgfSBmcm9tICcuLi9hcHBlYXJhbmNlL3NldHRlcnMnO1xuXG5jb25zdCBkZWxheSA9IChtczogbnVtYmVyKSA9PiBuZXcgUHJvbWlzZShyZXMgPT4gc2V0VGltZW91dChyZXMsIG1zKSk7XG5cbmNvbnN0IG1pZ3JhdGUgPSBhc3luYyAoc3JjOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCByZXNwb25zZTogYW55ID0gYXdhaXQgb3hteXNxbC5xdWVyeSgnU0VMRUNUICogRlJPTSBgcGxheWVyc2AnKTtcbiAgICBpZiAoIXJlc3BvbnNlKSByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgcmVzcG9uc2UpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuc2tpbikge1xuICAgICAgICAgICAgYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDptaWdyYXRpb246c2V0QXBwZWFyYW5jZScsIHNyYywge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdmaXZlbScsXG4gICAgICAgICAgICAgICAgZGF0YTogSlNPTi5wYXJzZShlbGVtZW50LnNraW4pXG4gICAgICAgICAgICB9KSBhcyBUQXBwZWFyYW5jZVxuICAgICAgICAgICAgYXdhaXQgZGVsYXkoMTAwKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDpnZXRBcHBlYXJhbmNlJywgc3JjKSBhcyBUQXBwZWFyYW5jZVxuICAgICAgICAgICAgY29uc3QgcGxheWVyU3JjID0gcGFyc2VJbnQoc3JjKVxuICAgICAgICAgICAgYXdhaXQgc2F2ZUFwcGVhcmFuY2UocGxheWVyU3JjLCBlbGVtZW50LmNpdGl6ZW5pZCwgcmVzcG9uc2UgYXMgVEFwcGVhcmFuY2UpXG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coJ0NvbnZlcnRlZCAnKyByZXNwb25zZS5sZW5ndGggKyAnIGFwcGVhcmFuY2VzJylcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pZ3JhdGUiLCAiaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCc7XG5pbXBvcnQgeyB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2sgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xuaW1wb3J0IHsgc2F2ZUFwcGVhcmFuY2UgfSBmcm9tICcuLi9hcHBlYXJhbmNlL3NldHRlcnMnO1xuXG5jb25zdCBkZWxheSA9IChtczogbnVtYmVyKSA9PiBuZXcgUHJvbWlzZShyZXMgPT4gc2V0VGltZW91dChyZXMsIG1zKSk7XG5cbmNvbnN0IG1pZ3JhdGUgPSBhc3luYyAoc3JjOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCByZXNwb25zZTogYW55ID0gYXdhaXQgb3hteXNxbC5xdWVyeSgnU0VMRUNUICogRlJPTSBgcGxheWVyc2tpbnNgIFdIRVJFIGFjdGl2ZSA9IDEnKTtcbiAgICBpZiAoIXJlc3BvbnNlKSByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgcmVzcG9uc2UpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuc2tpbikge1xuICAgICAgICAgICAgYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDptaWdyYXRpb246c2V0QXBwZWFyYW5jZScsIHNyYywge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdpbGxlbml1bScsXG4gICAgICAgICAgICAgICAgZGF0YTogSlNPTi5wYXJzZShlbGVtZW50LnNraW4pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgYXdhaXQgZGVsYXkoMTAwKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDpnZXRBcHBlYXJhbmNlJywgc3JjKSBhcyBUQXBwZWFyYW5jZVxuICAgICAgICAgICAgY29uc3QgcGxheWVyU3JjID0gcGFyc2VJbnQoc3JjKVxuICAgICAgICAgICAgYXdhaXQgc2F2ZUFwcGVhcmFuY2UocGxheWVyU3JjLCBlbGVtZW50LmNpdGl6ZW5pZCwgcmVzcG9uc2UgYXMgVEFwcGVhcmFuY2UpXG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coJ0NvbnZlcnRlZCAnKyByZXNwb25zZS5sZW5ndGggKyAnIGFwcGVhcmFuY2VzJylcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pZ3JhdGUiLCAiaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCc7XG5pbXBvcnQgeyB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2sgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xuaW1wb3J0IHsgc2F2ZUFwcGVhcmFuY2UgfSBmcm9tICcuLi9hcHBlYXJhbmNlL3NldHRlcnMnO1xuXG5jb25zdCBkZWxheSA9IChtczogbnVtYmVyKSA9PiBuZXcgUHJvbWlzZShyZXMgPT4gc2V0VGltZW91dChyZXMsIG1zKSk7XG5cbmNvbnN0IG1pZ3JhdGUgPSBhc3luYyAoc3JjOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCByZXNwb25zZTogYW55ID0gYXdhaXQgb3hteXNxbC5xdWVyeSgnU0VMRUNUICogRlJPTSBgcGxheWVyc2tpbnNgIFdIRVJFIGFjdGl2ZSA9IDEnKTtcbiAgICBpZiAoIXJlc3BvbnNlKSByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgcmVzcG9uc2UpIHtcbiAgICAgICAgZW1pdE5ldCgncWItY2xvdGhlczpsb2FkU2tpbicsIHNyYywgMCwgZWxlbWVudC5tb2RlbCwgZWxlbWVudC5za2luKTtcbiAgICAgICAgYXdhaXQgZGVsYXkoMjAwKTtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50OmdldEFwcGVhcmFuY2UnLCBzcmMpIGFzIFRBcHBlYXJhbmNlXG4gICAgICAgIGNvbnN0IHBsYXllclNyYyA9IHBhcnNlSW50KHNyYylcbiAgICAgICAgYXdhaXQgc2F2ZUFwcGVhcmFuY2UocGxheWVyU3JjLCBlbGVtZW50LmNpdGl6ZW5pZCwgcmVzcG9uc2UgYXMgVEFwcGVhcmFuY2UpXG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdDb252ZXJ0ZWQgJysgcmVzcG9uc2UubGVuZ3RoICsgJyBhcHBlYXJhbmNlcycpXG59O1xuXG5leHBvcnQgZGVmYXVsdCBtaWdyYXRlIiwgImltcG9ydCB7IG94bXlzcWwgfSBmcm9tIFwiQG92ZXJleHRlbmRlZC9veG15c3FsXCI7XHJcbmltcG9ydCB7IGNvbmZpZywgY29yZSwgZ2V0RnJhbWV3b3JrSUQsIGdldFBsYXllckRhdGEsIG9uQ2xpZW50Q2FsbGJhY2sgfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuaW1wb3J0IHsgT3V0Zml0IH0gZnJvbSBcIkB0eXBpbmdzL291dGZpdHNcIjtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldE91dGZpdHMoc3JjOiBudW1iZXIsIGZyYW1ld29ya0lkOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IGpvYiA9IGNvcmUuR2V0UGxheWVyKHNyYykuam9iIHx8IHsgbmFtZTogJ3Vua25vd24nLCBncmFkZTogeyBuYW1lOiAndW5rbm93bicgfSB9XHJcblx0bGV0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG5cdFx0J1NFTEVDVCAqIEZST00gb3V0Zml0cyBXSEVSRSBwbGF5ZXJfaWQgPSA/IE9SIChqb2JuYW1lID0gPyBBTkQgam9icmFuayA8PSA/KScsXHJcblx0XHRbZnJhbWV3b3JrSWQsIGpvYi5uYW1lLCBqb2IuZ3JhZGUubmFtZV1cclxuXHQpO1xyXG5cdGlmICghcmVzcG9uc2UpIHJldHVybiBbXTtcclxuXHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzcG9uc2UpKSB7XHJcbiAgICAgICAgcmVzcG9uc2UgPSBbcmVzcG9uc2VdO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG91dGZpdHMgPSByZXNwb25zZS5tYXAoXHJcbiAgICAgICAgKG91dGZpdDogeyBpZDogbnVtYmVyOyBsYWJlbDogc3RyaW5nOyBvdXRmaXQ6IHN0cmluZzsgam9ibmFtZT86IHN0cmluZyB9KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpZDogb3V0Zml0LmlkLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IG91dGZpdC5sYWJlbCxcclxuICAgICAgICAgICAgICAgIG91dGZpdDogSlNPTi5wYXJzZShvdXRmaXQub3V0Zml0KSxcclxuICAgICAgICAgICAgICAgIGpvYm5hbWU6IG91dGZpdC5qb2JuYW1lLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIG91dGZpdHM7XHJcbn1cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0T3V0Zml0cycsIGdldE91dGZpdHMpO1xyXG5leHBvcnRzKCdHZXRPdXRmaXRzJywgZ2V0T3V0Zml0cyk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZW5hbWVPdXRmaXQoc3JjOiBudW1iZXIsIGRhdGE6IHsgaWQ6IG51bWJlcjsgbGFiZWw6IHN0cmluZyB9KSB7XHJcbiAgICBjb25zdCBmcmFtZXdvcmtJZCA9IGdldEZyYW1ld29ya0lEKHNyYyk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuICAgICAgICAnVVBEQVRFIG91dGZpdHMgU0VUIGxhYmVsID0gPyBXSEVSRSBwbGF5ZXJfaWQgPSA/IEFORCBpZCA9ID8nLFxyXG4gICAgICAgIFtkYXRhLmxhYmVsLCBmcmFtZXdvcmtJZCwgZGF0YS5pZF1cclxuICAgICk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlbmFtZU91dGZpdCcsIHJlbmFtZU91dGZpdCk7XHJcbmV4cG9ydHMoJ1JlbmFtZU91dGZpdCcsIHJlbmFtZU91dGZpdCk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBkZWxldGVPdXRmaXQoc3JjOiBudW1iZXIsIGlkOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IGZyYW1ld29ya0lkID0gZ2V0RnJhbWV3b3JrSUQoc3JjKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxyXG4gICAgICAgICdERUxFVEUgRlJPTSBvdXRmaXRzIFdIRVJFIHBsYXllcl9pZCA9ID8gQU5EIGlkID0gPycsXHJcbiAgICAgICAgW2ZyYW1ld29ya0lkLCBpZF1cclxuICAgICk7XHJcbiAgICByZXR1cm4gcmVzdWx0ID4gMDtcclxufVxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpkZWxldGVPdXRmaXQnLCBkZWxldGVPdXRmaXQpO1xyXG5leHBvcnRzKCdEZWxldGVPdXRmaXQnLCBkZWxldGVPdXRmaXQpO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2F2ZU91dGZpdChzcmM6IG51bWJlciwgZGF0YTogT3V0Zml0KSB7XHJcbiAgICBjb25zdCBmcmFtZXdvcmtJZCA9IGdldEZyYW1ld29ya0lEKHNyYyk7XHJcbiAgICBsZXQgam9ibmFtZSA9IG51bGw7XHJcbiAgICBsZXQgam9icmFuayA9IDA7XHJcbiAgICBpZiAoZGF0YS5qb2IpIHtcclxuICAgICAgICBqb2JuYW1lID0gZGF0YS5qb2IubmFtZTtcclxuICAgICAgICBqb2JyYW5rID0gZGF0YS5qb2IucmFuaztcclxuICAgIH1cclxuICAgIGNvbnN0IGlkID0gYXdhaXQgb3hteXNxbC5pbnNlcnQoXHJcbiAgICAgICAgJ0lOU0VSVCBJTlRPIG91dGZpdHMgKHBsYXllcl9pZCwgbGFiZWwsIG91dGZpdCwgam9ibmFtZSwgam9icmFuaykgVkFMVUVTICg/LCA/LCA/LCA/LCA/KScsXHJcbiAgICAgICAgW2ZyYW1ld29ya0lkLCBkYXRhLmxhYmVsLCBKU09OLnN0cmluZ2lmeShkYXRhLm91dGZpdCksIGpvYm5hbWUsIGpvYnJhbmtdXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIGlkO1xyXG59XHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVPdXRmaXQnLCBzYXZlT3V0Zml0KTtcclxuZXhwb3J0cygnU2F2ZU91dGZpdCcsIHNhdmVPdXRmaXQpO1xyXG5cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoT3V0Zml0KF86IG51bWJlciwgaWQ6IG51bWJlcikge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcbiAgICAgICAgJ1NFTEVDVCBvdXRmaXQgRlJPTSBvdXRmaXRzIFdIRVJFIGlkID0gPycsXHJcbiAgICAgICAgW2lkXVxyXG4gICAgKTtcclxuICAgIHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxufVxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpmZXRjaE91dGZpdCcsIGZldGNoT3V0Zml0KTtcclxuZXhwb3J0cygnRmV0Y2hPdXRmaXQnLCBmZXRjaE91dGZpdCk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBpbXBvcnRPdXRmaXQoXzogbnVtYmVyLCBmcmFtZXdvcmtJZDogc3RyaW5nLCBvdXRmaXRJZDogbnVtYmVyLCBvdXRmaXROYW1lOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwucXVlcnkoXHJcbiAgICAgICAgJ1NFTEVDVCBsYWJlbCwgb3V0Zml0IEZST00gb3V0Zml0cyBXSEVSRSBpZCA9ID8nLFxyXG4gICAgICAgIFtvdXRmaXRJZF1cclxuICAgICk7XHJcblxyXG4gICAgaWYgKCFyZXN1bHQgfHwgdHlwZW9mIHJlc3VsdCAhPT0gJ29iamVjdCcgfHwgT2JqZWN0LmtleXMocmVzdWx0KS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogJ091dGZpdCBub3QgZm91bmQnIH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbmV3SWQgPSBhd2FpdCBveG15c3FsLmluc2VydChcclxuICAgICAgICAnSU5TRVJUIElOVE8gb3V0Zml0cyAocGxheWVyX2lkLCBsYWJlbCwgb3V0Zml0KSBWQUxVRVMgKD8sID8sID8pJyxcclxuICAgICAgICBbZnJhbWV3b3JrSWQsIG91dGZpdE5hbWUsIHJlc3VsdC5vdXRmaXRdXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG5ld0lkOiBuZXdJZCB9O1xyXG59XHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmltcG9ydE91dGZpdCcsIGltcG9ydE91dGZpdCk7XHJcbmV4cG9ydHMoJ0ltcG9ydE91dGZpdCcsIGltcG9ydE91dGZpdCk7XHJcblxyXG5jb25zdCBvdXRmaXRJdGVtID0gY29uZmlnLm91dGZpdEl0ZW1cclxuXHJcbmlmICghb3V0Zml0SXRlbSkge1xyXG4gICAgY29uc29sZS53YXJuKCdibF9hcHBlYXJhbmNlOiBObyBvdXRmaXQgaXRlbSBjb25maWd1cmVkLCBwbGVhc2Ugc2V0IGl0IGluIGNvbmZpZy5sdWEnKVxyXG59XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjppdGVtT3V0Zml0JywgYXN5bmMgKHNyYywgZGF0YSkgPT4ge1xyXG5cdGNvbnN0IHBsYXllciA9IGNvcmUuR2V0UGxheWVyKHNyYylcclxuXHRwbGF5ZXIuYWRkSXRlbShvdXRmaXRJdGVtLCAxLCBkYXRhKVxyXG59KTtcclxuXHJcbmNvcmUuUmVnaXN0ZXJVc2FibGVJdGVtKG91dGZpdEl0ZW0sIGFzeW5jIChzb3VyY2U6IG51bWJlciwgc2xvdDogbnVtYmVyLCBtZXRhZGF0YToge291dGZpdDogT3V0Zml0LCBsYWJlbDogc3RyaW5nfSkgPT4ge1xyXG5cdGNvbnN0IHBsYXllciA9IGdldFBsYXllckRhdGEoc291cmNlKVxyXG5cdGlmIChwbGF5ZXI/LnJlbW92ZUl0ZW0ob3V0Zml0SXRlbSwgMSwgc2xvdCkpIFxyXG5cdFx0ZW1pdE5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6dXNlT3V0Zml0SXRlbScsIHNvdXJjZSwgbWV0YWRhdGEub3V0Zml0KVxyXG59KSIsICJpbXBvcnQgJy4vYXBwZWFyYW5jZS9vdXRmaXRzJztcclxuaW1wb3J0ICcuL2FwcGVhcmFuY2Uvc2V0dGVycyc7XHJcbmltcG9ydCAnLi9hcHBlYXJhbmNlL2dldHRlcnMnO1xyXG5pbXBvcnQgeyBveG15c3FsIH0gZnJvbSAnQG92ZXJleHRlbmRlZC9veG15c3FsJztcclxuXHJcbm94bXlzcWwucmVhZHkoYXN5bmMgKCkgPT4ge1xyXG4gICAgLy8gc2VlIGlmIHRoZXJlIGlzIGEgdGFibGUgY2FsbGVkIGFwcGVhcmFuY2VcclxuICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgb3hteXNxbC5xdWVyeSgnU0VMRUNUIDEgRlJPTSBhcHBlYXJhbmNlIExJTUlUIDEnKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgYXBwZWFyYW5jZSB0YWJsZS4gTW9zdCBsaWtlbHkgdGhlIHRhYmxlIGRvZXMgbm90IGV4aXN0OiAnLCBlcnJvcik7XHJcbiAgICAgICAgLy8gWW91IGNhbiBhZGQgYWRkaXRpb25hbCBlcnJvciBoYW5kbGluZyBvciByZWNvdmVyeSBsb2dpYyBoZXJlIGlmIG5lZWRlZFxyXG4gICAgfVxyXG59KTtcclxuXHJcbm9uTmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzZXRyb3V0aW5nYnVja2V0JywgKCkgPT4ge1xyXG5cdFNldFBsYXllclJvdXRpbmdCdWNrZXQoc291cmNlLnRvU3RyaW5nKCksIHNvdXJjZSlcclxufSk7XHJcblxyXG5vbk5ldCgnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6cmVzZXRyb3V0aW5nYnVja2V0JywgKCkgPT4ge1xyXG5cdFNldFBsYXllclJvdXRpbmdCdWNrZXQoc291cmNlLnRvU3RyaW5nKCksIDApXHJcbn0pO1xyXG5cclxuUmVnaXN0ZXJDb21tYW5kKCdtaWdyYXRlJywgYXN5bmMgKHNvdXJjZTogbnVtYmVyKSA9PiB7XHJcblx0c291cmNlID0gc291cmNlICE9PSAwID8gc291cmNlIDogcGFyc2VJbnQoZ2V0UGxheWVycygpWzBdKVxyXG5cdGNvbnN0IGJsX2FwcGVhcmFuY2UgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2U7XHJcblx0Y29uc3QgY29uZmlnID0gYmxfYXBwZWFyYW5jZS5jb25maWcoKTtcclxuXHRjb25zdCBpbXBvcnRlZE1vZHVsZSA9IGF3YWl0IGltcG9ydChgLi9taWdyYXRlLyR7Y29uZmlnLnByZXZpb3VzQ2xvdGhpbmcgPT09ICdmaXZlbS1hcHBlYXJhbmNlJyA/ICdmaXZlbScgOiBjb25maWcucHJldmlvdXNDbG90aGluZ30udHNgKVxyXG5cdGltcG9ydGVkTW9kdWxlLmRlZmF1bHQoc291cmNlKVxyXG59LCBmYWxzZSk7XHJcbiIsICJpbXBvcnQgeyBveG15c3FsIH0gZnJvbSBcIkBvdmVyZXh0ZW5kZWQvb3hteXNxbFwiO1xyXG5pbXBvcnQgeyBnZXRGcmFtZXdvcmtJRCwgb25DbGllbnRDYWxsYmFjayB9IGZyb20gXCIuLi91dGlsc1wiO1xyXG5pbXBvcnQgeyBTa2luREIgfSBmcm9tIFwiQHR5cGluZ3MvYXBwZWFyYW5jZVwiO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0U2tpbihzcmM6IG51bWJlciwgZnJhbWV3b3JrSWQ6IHN0cmluZykge1xyXG4gICAgaWYgKCFmcmFtZXdvcmtJZCkge1xyXG4gICAgICAgIGZyYW1ld29ya0lkID0gZ2V0RnJhbWV3b3JrSUQoc3JjKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuICAgICAgICAnU0VMRUNUIHNraW4gRlJPTSBhcHBlYXJhbmNlIFdIRVJFIGlkID0gPycsXHJcbiAgICAgICAgW2ZyYW1ld29ya0lkXVxyXG4gICAgKTtcclxuICAgIHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxufVxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRTa2luJywgZ2V0U2tpbik7XHJcbmV4cG9ydHMoJ0dldFNraW4nLCBmdW5jdGlvbihpZCkge1xyXG4gICAgcmV0dXJuIGdldFNraW4obnVsbCwgaWQpXHJcbn0pO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0Q2xvdGhlcyhzcmM6IG51bWJlciwgZnJhbWV3b3JrSWQ6IHN0cmluZykge1xyXG4gICAgaWYgKCFmcmFtZXdvcmtJZCkge1xyXG4gICAgICAgIGZyYW1ld29ya0lkID0gZ2V0RnJhbWV3b3JrSUQoc3JjKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuICAgICAgICAnU0VMRUNUIGNsb3RoZXMgRlJPTSBhcHBlYXJhbmNlIFdIRVJFIGlkID0gPycsXHJcbiAgICAgICAgW2ZyYW1ld29ya0lkXVxyXG4gICAgKTtcclxuICAgIHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxufVxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRDbG90aGVzJywgZ2V0Q2xvdGhlcyk7XHJcbmV4cG9ydHMoJ0dldENsb3RoZXMnLCBmdW5jdGlvbihpZCkge1xyXG4gICAgcmV0dXJuIGdldENsb3RoZXMobnVsbCwgaWQpXHJcbn0pO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0VGF0dG9vcyhzcmM6IG51bWJlciwgZnJhbWV3b3JrSWQ6IHN0cmluZykge1xyXG4gICAgaWYgKCFmcmFtZXdvcmtJZCkge1xyXG4gICAgICAgIGZyYW1ld29ya0lkID0gZ2V0RnJhbWV3b3JrSUQoc3JjKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuICAgICAgICAnU0VMRUNUIHRhdHRvb3MgRlJPTSBhcHBlYXJhbmNlIFdIRVJFIGlkID0gPycsXHJcbiAgICAgICAgW2ZyYW1ld29ya0lkXVxyXG4gICAgKTtcclxuICAgIHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKSB8fCBbXTtcclxufVxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRUYXR0b29zJywgZ2V0VGF0dG9vcyk7XHJcbmV4cG9ydHMoJ0dldFRhdHRvb3MnLCBmdW5jdGlvbihpZCkge1xyXG4gICAgcmV0dXJuIGdldFRhdHRvb3MobnVsbCwgaWQpXHJcbn0pO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0QXBwZWFyYW5jZShzcmM6IG51bWJlciwgZnJhbWV3b3JrSWQ6IHN0cmluZykge1xyXG4gICAgaWYgKCFmcmFtZXdvcmtJZCAmJiAhc3JjKSByZXR1cm4gbnVsbDtcclxuICAgIFxyXG4gICAgaWYgKCFmcmFtZXdvcmtJZCkge1xyXG4gICAgICAgIGZyYW1ld29ya0lkID0gZ2V0RnJhbWV3b3JrSUQoc3JjKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXNwb25zZTogU2tpbkRCID0gYXdhaXQgb3hteXNxbC5zaW5nbGUoXHJcbiAgICAgICAgJ1NFTEVDVCAqIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8gTElNSVQgMScsXHJcbiAgICAgICAgW2ZyYW1ld29ya0lkXVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlKSByZXR1cm4gbnVsbDtcclxuICAgIGxldCBhcHBlYXJhbmNlID0ge1xyXG4gICAgICAgIC4uLkpTT04ucGFyc2UocmVzcG9uc2Uuc2tpbiksXHJcbiAgICAgICAgLi4uSlNPTi5wYXJzZShyZXNwb25zZS5jbG90aGVzKSxcclxuICAgICAgICB0YXR0b29zOiBKU09OLnBhcnNlKHJlc3BvbnNlLnRhdHRvb3MpLFxyXG4gICAgfVxyXG4gICAgYXBwZWFyYW5jZS5pZCA9IHJlc3BvbnNlLmlkXHJcbiAgICByZXR1cm4gYXBwZWFyYW5jZTtcclxufVxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgZ2V0QXBwZWFyYW5jZSk7XHJcbmV4cG9ydHMoJ0dldEFwcGVhcmFuY2UnLCBmdW5jdGlvbihpZCkge1xyXG4gICAgcmV0dXJuIGdldEFwcGVhcmFuY2UobnVsbCwgaWQpXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0RBLFFBQU0sYUFBdUIsQ0FBQTtBQUU3QixhQUFTLE9BQU8sV0FBb0IsU0FBZTtBQUNqRCxVQUFJLENBQUM7QUFBVyxjQUFNLElBQUksVUFBVSxPQUFPO0lBQzdDO0FBRlM7QUFJVCxRQUFNLFdBQVcsd0JBQUMsT0FBNEIsUUFBYyxJQUFlLGdCQUFzQjtBQUMvRixVQUFJLE9BQU8sVUFBVTtBQUFVLGdCQUFRLFdBQVcsS0FBSztBQUV2RCxVQUFJLGFBQWE7QUFDZixlQUFPLE9BQU8sVUFBVSxVQUFVLDRDQUE0QyxPQUFPLEtBQUssRUFBRTthQUN2RjtBQUNMLGVBQU8sT0FBTyxVQUFVLFVBQVUsNENBQTRDLE9BQU8sS0FBSyxFQUFFOztBQUc5RixVQUFJLFFBQVE7QUFDVixjQUFNLFlBQVksT0FBTztBQUN6QixlQUNFLGNBQWMsWUFBWSxjQUFjLFlBQ3hDLHlEQUF5RCxTQUFTLEVBQUU7QUFHdEUsWUFBSSxDQUFDLE1BQU0sY0FBYyxZQUFZO0FBQ25DLGVBQUs7QUFDTCxtQkFBUzs7O0FBSWIsVUFBSSxPQUFPO0FBQVcsZUFBTyxPQUFPLE9BQU8sWUFBWSw4Q0FBOEMsT0FBTyxFQUFFLEVBQUU7QUFFaEgsYUFBTyxDQUFDLE9BQU8sUUFBUSxFQUFFO0lBQzNCLEdBekJpQjtBQTJCakIsUUFBTSxNQUFNLE9BQU8sUUFBUTtBQUMzQixRQUFNLHNCQUFzQix1QkFBc0I7QUFFbEQsYUFBUyxRQUFRLFFBQWdCLE9BQTRCLFFBQWU7QUFDMUUsYUFBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVU7QUFDckMsWUFBSSxNQUFNLEVBQ1IsT0FDQSxRQUNBLENBQUMsUUFBUSxVQUFTO0FBQ2hCLGNBQUk7QUFBTyxtQkFBTyxPQUFPLEtBQUs7QUFDOUIsa0JBQVEsTUFBTTtRQUNoQixHQUNBLHFCQUNBLElBQUk7TUFFUixDQUFDO0lBQ0g7QUFiUztBQWVJLElBQUFBLFNBQUEsVUFBbUI7TUFDOUIsTUFBTSxPQUFLO0FBQ1QsZUFBTyxPQUFPLFVBQVUsVUFBVSxvQ0FBb0MsT0FBTyxLQUFLLEVBQUU7QUFFcEYsZUFBTyxXQUFXLEtBQUssS0FBSztNQUM5QjtNQUNBLE1BQU0sVUFBUTtBQUNaLHFCQUFhLFlBQVc7QUFDdEIsaUJBQU8saUJBQWlCLFNBQVMsTUFBTTtBQUFXLGtCQUFNLElBQUksUUFBUSxDQUFDLFlBQVksV0FBVyxTQUFTLEVBQUUsQ0FBQztBQUN4RyxtQkFBUTtRQUNWLENBQUM7TUFDSDtNQUNBLE1BQU0sTUFBTSxPQUFPLFFBQVEsSUFBRTtBQUMzQixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFNBQVMsT0FBTyxNQUFNO0FBQ25ELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sT0FBTyxPQUFPLFFBQVEsSUFBRTtBQUM1QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVUsT0FBTyxNQUFNO0FBQ3BELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sT0FBTyxPQUFPLFFBQVEsSUFBRTtBQUM1QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVUsT0FBTyxNQUFNO0FBQ3BELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sT0FBTyxPQUFPLFFBQVEsSUFBRTtBQUM1QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVUsT0FBTyxNQUFNO0FBQ3BELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sT0FBTyxPQUFPLFFBQVEsSUFBRTtBQUM1QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVUsT0FBTyxNQUFNO0FBQ3BELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sUUFBUSxPQUFPLFFBQVEsSUFBRTtBQUM3QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFdBQVcsT0FBTyxNQUFNO0FBQ3JELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sV0FBVyxPQUFPLFFBQVEsSUFBRTtBQUNoQyxTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLGNBQWMsT0FBTyxNQUFNO0FBQ3hELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMz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RTtBQUNqQyxDQUFDOzs7QUR6RUQsSUFBQUMsa0JBQXdCOzs7Ozs7Ozs7OztBQUV4Qix3QkFBUSxNQUFNLFlBQVk7QUFFdEIsTUFBSTtBQUNBLFVBQU0sd0JBQVEsTUFBTSxrQ0FBa0M7QUFBQSxFQUMxRCxTQUFTLE9BQU87QUFDWixZQUFRLE1BQU0sMkVBQTJFLEtBQUs7QUFBQSxFQUVsRztBQUNKLENBQUM7QUFFRCxNQUFNLHlDQUF5QyxNQUFNO0FBQ3BELHlCQUF1QixPQUFPLFNBQVMsR0FBRyxNQUFNO0FBQ2pELENBQUM7QUFFRCxNQUFNLDJDQUEyQyxNQUFNO0FBQ3RELHlCQUF1QixPQUFPLFNBQVMsR0FBRyxDQUFDO0FBQzVDLENBQUM7QUFFRCxnQkFBZ0IsV0FBVyxPQUFPQyxZQUFtQjtBQUNwRCxFQUFBQSxVQUFTQSxZQUFXLElBQUlBLFVBQVMsU0FBUyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQ3pELFFBQU0sZ0JBQWdCLFFBQVE7QUFDOUIsUUFBTUMsVUFBUyxjQUFjLE9BQU87QUFDcEMsUUFBTSxpQkFBaUIsTUFBYSxtQ0FBYUEsUUFBTyxxQkFBcUIscUJBQXFCLFVBQVVBLFFBQU8sZ0JBQWdCO0FBQ25JLGlCQUFlLFFBQVFELE9BQU07QUFDOUIsR0FBRyxLQUFLOyIsCiAgIm5hbWVzIjogWyJleHBvcnRzIiwgImltcG9ydF9veG15c3FsIiwgImltcG9ydF9veG15c3FsIiwgInJlc3BvbnNlIiwgImltcG9ydF9veG15c3FsIiwgImRlbGF5IiwgIm1pZ3JhdGUiLCAicmVzcG9uc2UiLCAiaW1wb3J0X294bXlzcWwiLCAiZGVsYXkiLCAibWlncmF0ZSIsICJyZXNwb25zZSIsICJzb3VyY2UiLCAiaW1wb3J0X294bXlzcWwiLCAiaW1wb3J0X294bXlzcWwiLCAic291cmNlIiwgImNvbmZpZyJdCn0K
