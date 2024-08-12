var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
    var safeArgs = (query, params, cb, transaction) => {
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
    };
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
    bl_bridge = exports.bl_bridge;
    core = bl_bridge.core();
    getPlayerData = (src) => {
      return core.GetPlayer(src);
    };
    getFrameworkID = (src) => {
      const player = core.GetPlayer(src);
      if (!player)
        return null;
      return player.id;
    };
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
    onClientCallback("bl_appearance:server:saveSkin", saveSkin);
    exports("SaveSkin", saveSkin);
    onClientCallback("bl_appearance:server:saveClothes", saveClothes);
    exports("SaveClothes", saveClothes);
    onClientCallback("bl_appearance:server:saveTattoos", saveTattoos);
    exports("SaveTattoos", saveTattoos);
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
    delay = (ms) => new Promise((res) => setTimeout(res, ms));
    migrate = async (src) => {
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
    };
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
    delay2 = (ms) => new Promise((res) => setTimeout(res, ms));
    migrate2 = async (src) => {
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
    };
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
    delay3 = (ms) => new Promise((res) => setTimeout(res, ms));
    migrate3 = async (src) => {
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
    };
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
onClientCallback("bl_appearance:server:saveOutfit", saveOutfit);
exports("SaveOutfit", saveOutfit);
async function fetchOutfit(_, id) {
  const response = await import_oxmysql.oxmysql.prepare(
    "SELECT outfit FROM outfits WHERE id = ?",
    [id]
  );
  return JSON.parse(response);
}
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
