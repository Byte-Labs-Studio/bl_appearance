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
var resourceName, activeEvents, core;
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
    core = exports.bl_bridge.core();
  }
});

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

// src/server/appearance.ts
var import_oxmysql, saveAppearance;
var init_appearance = __esm({
  "src/server/appearance.ts"() {
    import_oxmysql = __toESM(require_MySQL(), 1);
    saveAppearance = /* @__PURE__ */ __name(async (src, frameworkId, appearance) => {
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
      const result = await import_oxmysql.oxmysql.prepare(
        "INSERT INTO appearance (id, clothes, skin, tattoos) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE clothes = VALUES(clothes), skin = VALUES(skin), tattoos = VALUES(tattoos);",
        [
          frameworkId,
          JSON.stringify(clothes),
          JSON.stringify(skin),
          JSON.stringify(tattoos)
        ]
      );
      return result;
    }, "saveAppearance");
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
var import_oxmysql2, delay, migrate, fivem_default;
var init_fivem = __esm({
  "src/server/migrate/fivem.ts"() {
    import_oxmysql2 = __toESM(require_MySQL(), 1);
    init_utils();
    init_appearance();
    delay = /* @__PURE__ */ __name((ms) => new Promise((res) => setTimeout(res, ms)), "delay");
    migrate = /* @__PURE__ */ __name(async (src) => {
      const response = await import_oxmysql2.oxmysql.query("SELECT * FROM `players`");
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
          await saveAppearance(src, element.citizenid, response2);
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
var import_oxmysql3, delay2, migrate2, illenium_default;
var init_illenium = __esm({
  "src/server/migrate/illenium.ts"() {
    import_oxmysql3 = __toESM(require_MySQL(), 1);
    init_utils();
    init_appearance();
    delay2 = /* @__PURE__ */ __name((ms) => new Promise((res) => setTimeout(res, ms)), "delay");
    migrate2 = /* @__PURE__ */ __name(async (src) => {
      const response = await import_oxmysql3.oxmysql.query("SELECT * FROM `playerskins` WHERE active = 1`");
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
          await saveAppearance(src, element.citizenid, response2);
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
var import_oxmysql4, delay3, migrate3, qb_default;
var init_qb = __esm({
  "src/server/migrate/qb.ts"() {
    import_oxmysql4 = __toESM(require_MySQL(), 1);
    init_utils();
    init_appearance();
    delay3 = /* @__PURE__ */ __name((ms) => new Promise((res) => setTimeout(res, ms)), "delay");
    migrate3 = /* @__PURE__ */ __name(async (src) => {
      const response = await import_oxmysql4.oxmysql.query("SELECT * FROM `playerskins` WHERE active = 1");
      if (!response)
        return;
      for (const element of response) {
        emitNet("qb-clothes:loadSkin", src, 0, element.model, element.skin);
        await delay3(200);
        const response2 = await triggerClientCallback("bl_appearance:client:getAppearance", src);
        await saveAppearance(src, element.citizenid, response2);
      }
      console.log("Converted " + response.length + " appearances");
    }, "migrate");
    qb_default = migrate3;
  }
});

// src/server/init.ts
init_utils();
var import_oxmysql5 = __toESM(require_MySQL(), 1);
init_appearance();

// import("./migrate/**/*.ts") in src/server/init.ts
var globImport_migrate_ts = __glob({
  "./migrate/esx.ts": () => Promise.resolve().then(() => (init_esx(), esx_exports)),
  "./migrate/fivem.ts": () => Promise.resolve().then(() => (init_fivem(), fivem_exports)),
  "./migrate/illenium.ts": () => Promise.resolve().then(() => (init_illenium(), illenium_exports)),
  "./migrate/qb.ts": () => Promise.resolve().then(() => (init_qb(), qb_exports))
});

// src/server/init.ts
onClientCallback("bl_appearance:server:getOutfits", async (src, frameworkId) => {
  const job = core.GetPlayer(src).job;
  let response = await import_oxmysql5.oxmysql.prepare(
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
});
onClientCallback("bl_appearance:server:renameOutfit", async (src, frameworkId, data) => {
  const id = data.id;
  const label = data.label;
  const result = await import_oxmysql5.oxmysql.update(
    "UPDATE outfits SET label = ? WHERE player_id = ? AND id = ?",
    [label, frameworkId, id]
  );
  return result;
});
onClientCallback("bl_appearance:server:deleteOutfit", async (src, frameworkId, id) => {
  const result = await import_oxmysql5.oxmysql.update(
    "DELETE FROM outfits WHERE player_id = ? AND id = ?",
    [frameworkId, id]
  );
  return result > 0;
});
onClientCallback("bl_appearance:server:saveOutfit", async (src, frameworkId, data) => {
  const jobname = data.job?.name || null;
  const jobrank = data.job?.rank || null;
  const id = await import_oxmysql5.oxmysql.insert(
    "INSERT INTO outfits (player_id, label, outfit, jobname, jobrank) VALUES (?, ?, ?, ?, ?)",
    [frameworkId, data.label, JSON.stringify(data.outfit), jobname, jobrank]
  );
  return id;
});
onClientCallback("bl_appearance:server:grabOutfit", async (src, id) => {
  const response = await import_oxmysql5.oxmysql.prepare(
    "SELECT outfit FROM outfits WHERE id = ?",
    [id]
  );
  return JSON.parse(response);
});
onClientCallback("bl_appearance:server:itemOutfit", async (src, data) => {
  const player = core.GetPlayer(src);
  player.addItem("cloth", 1, data);
});
onClientCallback("bl_appearance:server:importOutfit", async (src, frameworkId, outfitId, outfitName) => {
  const [result] = await import_oxmysql5.oxmysql.query(
    "SELECT label, outfit FROM outfits WHERE id = ?",
    [outfitId]
  );
  if (!result) {
    return { success: false, message: "Outfit not found" };
  }
  const newId = await import_oxmysql5.oxmysql.insert(
    "INSERT INTO outfits (player_id, label, outfit) VALUES (?, ?, ?)",
    [frameworkId, outfitName, result.outfit]
  );
  return { success: true, newId };
});
onClientCallback("bl_appearance:server:saveSkin", async (src, frameworkId, skin) => {
  const result = await import_oxmysql5.oxmysql.update(
    "UPDATE appearance SET skin = ? WHERE id = ?",
    [JSON.stringify(skin), frameworkId]
  );
  return result;
});
onClientCallback(
  "bl_appearance:server:saveClothes",
  async (src, frameworkId, clothes) => {
    const result = await import_oxmysql5.oxmysql.update(
      "UPDATE appearance SET clothes = ? WHERE id = ?",
      [JSON.stringify(clothes), frameworkId]
    );
    return result;
  }
);
onClientCallback("bl_appearance:server:saveAppearance", saveAppearance);
onClientCallback("bl_appearance:server:saveTattoos", async (src, frameworkId, tattoos) => {
  const result = await import_oxmysql5.oxmysql.update(
    "UPDATE appearance SET tattoos = ? WHERE id = ?",
    [JSON.stringify(tattoos), frameworkId]
  );
  return result;
});
onClientCallback("bl_appearance:server:getSkin", async (src, frameworkId) => {
  const response = await import_oxmysql5.oxmysql.prepare(
    "SELECT skin FROM appearance WHERE id = ?",
    [frameworkId]
  );
  return JSON.parse(response);
});
onClientCallback("bl_appearance:server:getClothes", async (src, frameworkId) => {
  const response = await import_oxmysql5.oxmysql.prepare(
    "SELECT clothes FROM appearance WHERE id = ?",
    [frameworkId]
  );
  return JSON.parse(response);
});
onClientCallback("bl_appearance:server:getTattoos", async (src, frameworkId) => {
  const response = await import_oxmysql5.oxmysql.prepare(
    "SELECT tattoos FROM appearance WHERE id = ?",
    [frameworkId]
  );
  return JSON.parse(response) || [];
});
onClientCallback("bl_appearance:server:getAppearance", async (src, frameworkId) => {
  const response = await import_oxmysql5.oxmysql.single(
    "SELECT * FROM appearance WHERE id = ? LIMIT 1",
    [frameworkId]
  );
  if (!response)
    return null;
  let appearance = {
    ...JSON.parse(response.skin),
    ...JSON.parse(response.clothes),
    ...JSON.parse(response.tattoos)
  };
  appearance.id = response.id;
  return appearance;
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
  const config = bl_appearance.config();
  const importedModule = await globImport_migrate_ts(`./migrate/${config.previousClothing === "fivem-appearance" ? "fivem" : config.previousClothing}.ts`);
  importedModule.default(source2);
}, false);
core.RegisterUsableItem("cloth", async (source2, slot, metadata) => {
  const player = core.GetPlayer(source2);
  if (player?.removeItem("cloth", 1, slot))
    emitNet("bl_appearance:server:useOutfit", source2, metadata.outfit);
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3NlcnZlci91dGlscy9pbmRleC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQG92ZXJleHRlbmRlZC9veG15c3FsL015U1FMLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvYXBwZWFyYW5jZS50cyIsICIuLi8uLi9zcmMvc2VydmVyL21pZ3JhdGUvZXN4LnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvbWlncmF0ZS9maXZlbS50cyIsICIuLi8uLi9zcmMvc2VydmVyL21pZ3JhdGUvaWxsZW5pdW0udHMiLCAiLi4vLi4vc3JjL3NlcnZlci9taWdyYXRlL3FiLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvaW5pdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL3NlcnZlci9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcblxyXG5jb25zdCBhY3RpdmVFdmVudHMgPSB7fTtcclxub25OZXQoYF9ibF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5LCAuLi5hcmdzKSA9PiB7XHJcbiAgICBjb25zdCByZXNvbHZlID0gYWN0aXZlRXZlbnRzW2tleV07XHJcbiAgICByZXR1cm4gcmVzb2x2ZSAmJiByZXNvbHZlKC4uLmFyZ3MpO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2soZXZlbnROYW1lOiBzdHJpbmcsIHBsYXllcklkOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9OiR7cGxheWVySWR9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuICAgIGVtaXROZXQoYF9ibF9jYl8ke2V2ZW50TmFtZX1gLCBwbGF5ZXJJZCwgcmVzb3VyY2VOYW1lLCBrZXksIC4uLmFyZ3MpO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgYWN0aXZlRXZlbnRzW2tleV0gPSByZXNvbHZlO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvbkNsaWVudENhbGxiYWNrKGV2ZW50TmFtZTogc3RyaW5nLCBjYjogKHBsYXllcklkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpIHtcclxuICAgIG9uTmV0KGBfYmxfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcsIGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNyYyA9IHNvdXJjZTtcclxuICAgICAgICBsZXQgcmVzcG9uc2U6IGFueTtcclxuICAgIFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IGNiKHNyYywgLi4uYXJncyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBhbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBoYW5kbGluZyBjYWxsYmFjayBldmVudCAke2V2ZW50TmFtZX1gKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGBeMyR7ZS5zdGFja31eMGApO1xyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIGVtaXROZXQoYF9ibF9jYl8ke3Jlc291cmNlfWAsIHNyYywga2V5LCByZXNwb25zZSk7XHJcbiAgICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY29yZSA9IGV4cG9ydHMuYmxfYnJpZGdlLmNvcmUoKVxyXG4iLCAidHlwZSBRdWVyeSA9IHN0cmluZyB8IG51bWJlcjtcclxudHlwZSBQYXJhbXMgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVua25vd25bXSB8IEZ1bmN0aW9uO1xyXG50eXBlIENhbGxiYWNrPFQ+ID0gKHJlc3VsdDogVCB8IG51bGwpID0+IHZvaWQ7XHJcblxyXG50eXBlIFRyYW5zYWN0aW9uID1cclxuICB8IHN0cmluZ1tdXHJcbiAgfCBbc3RyaW5nLCBQYXJhbXNdW11cclxuICB8IHsgcXVlcnk6IHN0cmluZzsgdmFsdWVzOiBQYXJhbXMgfVtdXHJcbiAgfCB7IHF1ZXJ5OiBzdHJpbmc7IHBhcmFtZXRlcnM6IFBhcmFtcyB9W107XHJcblxyXG5pbnRlcmZhY2UgUmVzdWx0IHtcclxuICBbY29sdW1uOiBzdHJpbmcgfCBudW1iZXJdOiBhbnk7XHJcbiAgYWZmZWN0ZWRSb3dzPzogbnVtYmVyO1xyXG4gIGZpZWxkQ291bnQ/OiBudW1iZXI7XHJcbiAgaW5mbz86IHN0cmluZztcclxuICBpbnNlcnRJZD86IG51bWJlcjtcclxuICBzZXJ2ZXJTdGF0dXM/OiBudW1iZXI7XHJcbiAgd2FybmluZ1N0YXR1cz86IG51bWJlcjtcclxuICBjaGFuZ2VkUm93cz86IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIFJvdyB7XHJcbiAgW2NvbHVtbjogc3RyaW5nIHwgbnVtYmVyXTogdW5rbm93bjtcclxufVxyXG5cclxuaW50ZXJmYWNlIE94TXlTUUwge1xyXG4gIHN0b3JlOiAocXVlcnk6IHN0cmluZykgPT4gdm9pZDtcclxuICByZWFkeTogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xyXG4gIHF1ZXJ5OiA8VCA9IFJlc3VsdCB8IG51bGw+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgc2luZ2xlOiA8VCA9IFJvdyB8IG51bGw+KFxyXG4gICAgcXVlcnk6IFF1ZXJ5LFxyXG4gICAgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8RXhjbHVkZTxULCBbXT4+LFxyXG4gICAgY2I/OiBDYWxsYmFjazxFeGNsdWRlPFQsIFtdPj5cclxuICApID0+IFByb21pc2U8RXhjbHVkZTxULCBbXT4+O1xyXG4gIHNjYWxhcjogPFQgPSB1bmtub3duIHwgbnVsbD4oXHJcbiAgICBxdWVyeTogUXVlcnksXHJcbiAgICBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxFeGNsdWRlPFQsIFtdPj4sXHJcbiAgICBjYj86IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PlxyXG4gICkgPT4gUHJvbWlzZTxFeGNsdWRlPFQsIFtdPj47XHJcbiAgdXBkYXRlOiA8VCA9IG51bWJlciB8IG51bGw+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgaW5zZXJ0OiA8VCA9IG51bWJlciB8IG51bGw+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgcHJlcGFyZTogPFQgPSBhbnk+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgcmF3RXhlY3V0ZTogPFQgPSBSZXN1bHQgfCBudWxsPihxdWVyeTogUXVlcnksIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPFQ+LCBjYj86IENhbGxiYWNrPFQ+KSA9PiBQcm9taXNlPFQ+O1xyXG4gIHRyYW5zYWN0aW9uOiAocXVlcnk6IFRyYW5zYWN0aW9uLCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxib29sZWFuPiwgY2I/OiBDYWxsYmFjazxib29sZWFuPikgPT4gUHJvbWlzZTxib29sZWFuPjtcclxuICBpc1JlYWR5OiAoKSA9PiBib29sZWFuO1xyXG4gIGF3YWl0Q29ubmVjdGlvbjogKCkgPT4gUHJvbWlzZTx0cnVlPjtcclxufVxyXG5cclxuY29uc3QgUXVlcnlTdG9yZTogc3RyaW5nW10gPSBbXTtcclxuXHJcbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb246IGJvb2xlYW4sIG1lc3NhZ2U6IHN0cmluZykge1xyXG4gIGlmICghY29uZGl0aW9uKSB0aHJvdyBuZXcgVHlwZUVycm9yKG1lc3NhZ2UpO1xyXG59XHJcblxyXG5jb25zdCBzYWZlQXJncyA9IChxdWVyeTogUXVlcnkgfCBUcmFuc2FjdGlvbiwgcGFyYW1zPzogYW55LCBjYj86IEZ1bmN0aW9uLCB0cmFuc2FjdGlvbj86IHRydWUpID0+IHtcclxuICBpZiAodHlwZW9mIHF1ZXJ5ID09PSAnbnVtYmVyJykgcXVlcnkgPSBRdWVyeVN0b3JlW3F1ZXJ5XTtcclxuXHJcbiAgaWYgKHRyYW5zYWN0aW9uKSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIHF1ZXJ5ID09PSAnb2JqZWN0JywgYEZpcnN0IGFyZ3VtZW50IGV4cGVjdGVkIG9iamVjdCwgcmVjaWV2ZWQgJHt0eXBlb2YgcXVlcnl9YCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGFzc2VydCh0eXBlb2YgcXVlcnkgPT09ICdzdHJpbmcnLCBgRmlyc3QgYXJndW1lbnQgZXhwZWN0ZWQgc3RyaW5nLCByZWNlaXZlZCAke3R5cGVvZiBxdWVyeX1gKTtcclxuICB9XHJcblxyXG4gIGlmIChwYXJhbXMpIHtcclxuICAgIGNvbnN0IHBhcmFtVHlwZSA9IHR5cGVvZiBwYXJhbXM7XHJcbiAgICBhc3NlcnQoXHJcbiAgICAgIHBhcmFtVHlwZSA9PT0gJ29iamVjdCcgfHwgcGFyYW1UeXBlID09PSAnZnVuY3Rpb24nLFxyXG4gICAgICBgU2Vjb25kIGFyZ3VtZW50IGV4cGVjdGVkIG9iamVjdCBvciBmdW5jdGlvbiwgcmVjZWl2ZWQgJHtwYXJhbVR5cGV9YFxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIWNiICYmIHBhcmFtVHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBjYiA9IHBhcmFtcztcclxuICAgICAgcGFyYW1zID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKGNiICE9PSB1bmRlZmluZWQpIGFzc2VydCh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicsIGBUaGlyZCBhcmd1bWVudCBleHBlY3RlZCBmdW5jdGlvbiwgcmVjZWl2ZWQgJHt0eXBlb2YgY2J9YCk7XHJcblxyXG4gIHJldHVybiBbcXVlcnksIHBhcmFtcywgY2JdO1xyXG59O1xyXG5cclxuY29uc3QgZXhwID0gZ2xvYmFsLmV4cG9ydHMub3hteXNxbDtcclxuY29uc3QgY3VycmVudFJlc291cmNlTmFtZSA9IEdldEN1cnJlbnRSZXNvdXJjZU5hbWUoKTtcclxuXHJcbmZ1bmN0aW9uIGV4ZWN1dGUobWV0aG9kOiBzdHJpbmcsIHF1ZXJ5OiBRdWVyeSB8IFRyYW5zYWN0aW9uLCBwYXJhbXM/OiBQYXJhbXMpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgZXhwW21ldGhvZF0oXHJcbiAgICAgIHF1ZXJ5LFxyXG4gICAgICBwYXJhbXMsXHJcbiAgICAgIChyZXN1bHQsIGVycm9yKSA9PiB7XHJcbiAgICAgICAgaWYgKGVycm9yKSByZXR1cm4gcmVqZWN0KGVycm9yKTtcclxuICAgICAgICByZXNvbHZlKHJlc3VsdCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGN1cnJlbnRSZXNvdXJjZU5hbWUsXHJcbiAgICAgIHRydWVcclxuICAgICk7XHJcbiAgfSkgYXMgYW55O1xyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgb3hteXNxbDogT3hNeVNRTCA9IHtcclxuICBzdG9yZShxdWVyeSkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBxdWVyeSAhPT0gJ3N0cmluZycsIGBRdWVyeSBleHBlY3RzIGEgc3RyaW5nLCByZWNlaXZlZCAke3R5cGVvZiBxdWVyeX1gKTtcclxuXHJcbiAgICByZXR1cm4gUXVlcnlTdG9yZS5wdXNoKHF1ZXJ5KTtcclxuICB9LFxyXG4gIHJlYWR5KGNhbGxiYWNrKSB7XHJcbiAgICBzZXRJbW1lZGlhdGUoYXN5bmMgKCkgPT4ge1xyXG4gICAgICB3aGlsZSAoR2V0UmVzb3VyY2VTdGF0ZSgnb3hteXNxbCcpICE9PSAnc3RhcnRlZCcpIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDUwKSk7XHJcbiAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICB9KTtcclxuICB9LFxyXG4gIGFzeW5jIHF1ZXJ5KHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgncXVlcnknLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyBzaW5nbGUocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdzaW5nbGUnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyBzY2FsYXIocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdzY2FsYXInLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyB1cGRhdGUocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCd1cGRhdGUnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyBpbnNlcnQocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdpbnNlcnQnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyBwcmVwYXJlKHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgncHJlcGFyZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHJhd0V4ZWN1dGUocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdyYXdFeGVjdXRlJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgdHJhbnNhY3Rpb24ocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYiwgdHJ1ZSk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCd0cmFuc2FjdGlvbicsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGlzUmVhZHkoKSB7XHJcbiAgICByZXR1cm4gZXhwLmlzUmVhZHkoKTtcclxuICB9LFxyXG4gIGFzeW5jIGF3YWl0Q29ubmVjdGlvbigpIHtcclxuICAgIHJldHVybiBhd2FpdCBleHAuYXdhaXRDb25uZWN0aW9uKCk7XHJcbiAgfSxcclxufTtcclxuIiwgImltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSAnQHR5cGluZ3MvYXBwZWFyYW5jZSc7XG5pbXBvcnQgeyBveG15c3FsIH0gZnJvbSAnQG92ZXJleHRlbmRlZC9veG15c3FsJztcblxuZXhwb3J0IGNvbnN0IHNhdmVBcHBlYXJhbmNlID0gYXN5bmMgKHNyYzogc3RyaW5nIHwgbnVtYmVyLCBmcmFtZXdvcmtJZDogc3RyaW5nLCBhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSkgPT4ge1xuXHRjb25zdCBjbG90aGVzID0ge1xuXHRcdGRyYXdhYmxlczogYXBwZWFyYW5jZS5kcmF3YWJsZXMsXG5cdFx0cHJvcHM6IGFwcGVhcmFuY2UucHJvcHMsXG5cdFx0aGVhZE92ZXJsYXk6IGFwcGVhcmFuY2UuaGVhZE92ZXJsYXksXG5cdH07XG5cblx0Y29uc3Qgc2tpbiA9IHtcblx0XHRoZWFkQmxlbmQ6IGFwcGVhcmFuY2UuaGVhZEJsZW5kLFxuXHRcdGhlYWRTdHJ1Y3R1cmU6IGFwcGVhcmFuY2UuaGVhZFN0cnVjdHVyZSxcblx0XHRoYWlyQ29sb3I6IGFwcGVhcmFuY2UuaGFpckNvbG9yLFxuXHRcdG1vZGVsOiBhcHBlYXJhbmNlLm1vZGVsLFxuXHR9O1xuXG5cdGNvbnN0IHRhdHRvb3MgPSBhcHBlYXJhbmNlLnRhdHRvb3MgfHwgW107XG5cblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxuXHRcdCdJTlNFUlQgSU5UTyBhcHBlYXJhbmNlIChpZCwgY2xvdGhlcywgc2tpbiwgdGF0dG9vcykgVkFMVUVTICg/LCA/LCA/LCA/KSBPTiBEVVBMSUNBVEUgS0VZIFVQREFURSBjbG90aGVzID0gVkFMVUVTKGNsb3RoZXMpLCBza2luID0gVkFMVUVTKHNraW4pLCB0YXR0b29zID0gVkFMVUVTKHRhdHRvb3MpOycsXG5cdFx0W1xuXHRcdFx0ZnJhbWV3b3JrSWQsXG5cdFx0XHRKU09OLnN0cmluZ2lmeShjbG90aGVzKSxcblx0XHRcdEpTT04uc3RyaW5naWZ5KHNraW4pLFxuXHRcdFx0SlNPTi5zdHJpbmdpZnkodGF0dG9vcyksXG5cdFx0XVxuXHQpO1xuXG5cdHJldHVybiByZXN1bHQ7XG59IiwgIiIsICJpbXBvcnQgeyBveG15c3FsIH0gZnJvbSAnQG92ZXJleHRlbmRlZC9veG15c3FsJztcbmltcG9ydCB7IHRyaWdnZXJDbGllbnRDYWxsYmFjayB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IHNhdmVBcHBlYXJhbmNlIH0gZnJvbSAnLi4vYXBwZWFyYW5jZSc7XG5pbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xuXG5jb25zdCBkZWxheSA9IChtczogbnVtYmVyKSA9PiBuZXcgUHJvbWlzZShyZXMgPT4gc2V0VGltZW91dChyZXMsIG1zKSk7XG5cbmNvbnN0IG1pZ3JhdGUgPSBhc3luYyAoc3JjOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCByZXNwb25zZTogYW55ID0gYXdhaXQgb3hteXNxbC5xdWVyeSgnU0VMRUNUICogRlJPTSBgcGxheWVyc2AnKTtcbiAgICBpZiAoIXJlc3BvbnNlKSByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgcmVzcG9uc2UpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuc2tpbikge1xuICAgICAgICAgICAgYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDptaWdyYXRpb246c2V0QXBwZWFyYW5jZScsIHNyYywge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdmaXZlbScsXG4gICAgICAgICAgICAgICAgZGF0YTogSlNPTi5wYXJzZShlbGVtZW50LnNraW4pXG4gICAgICAgICAgICB9KSBhcyBUQXBwZWFyYW5jZVxuICAgICAgICAgICAgYXdhaXQgZGVsYXkoMTAwKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDpnZXRBcHBlYXJhbmNlJywgc3JjKSBhcyBUQXBwZWFyYW5jZVxuICAgICAgICAgICAgYXdhaXQgc2F2ZUFwcGVhcmFuY2Uoc3JjLCBlbGVtZW50LmNpdGl6ZW5pZCwgcmVzcG9uc2UpXG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coJ0NvbnZlcnRlZCAnKyByZXNwb25zZS5sZW5ndGggKyAnIGFwcGVhcmFuY2VzJylcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pZ3JhdGUiLCAiaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCc7XG5pbXBvcnQgeyB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2sgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBzYXZlQXBwZWFyYW5jZSB9IGZyb20gJy4uL2FwcGVhcmFuY2UnO1xuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcblxuY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xuXG5jb25zdCBtaWdyYXRlID0gYXN5bmMgKHNyYzogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IGFueSA9IGF3YWl0IG94bXlzcWwucXVlcnkoJ1NFTEVDVCAqIEZST00gYHBsYXllcnNraW5zYCBXSEVSRSBhY3RpdmUgPSAxYCcpO1xuICAgIGlmICghcmVzcG9uc2UpIHJldHVybjtcblxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiByZXNwb25zZSkge1xuICAgICAgICBpZiAoZWxlbWVudC5za2luKSB7XG4gICAgICAgICAgICBhd2FpdCB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50Om1pZ3JhdGlvbjpzZXRBcHBlYXJhbmNlJywgc3JjLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2lsbGVuaXVtJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnBhcnNlKGVsZW1lbnQuc2tpbilcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBhd2FpdCBkZWxheSgxMDApO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50OmdldEFwcGVhcmFuY2UnLCBzcmMpIGFzIFRBcHBlYXJhbmNlXG4gICAgICAgICAgICBhd2FpdCBzYXZlQXBwZWFyYW5jZShzcmMsIGVsZW1lbnQuY2l0aXplbmlkLCByZXNwb25zZSlcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zb2xlLmxvZygnQ29udmVydGVkICcrIHJlc3BvbnNlLmxlbmd0aCArICcgYXBwZWFyYW5jZXMnKVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbWlncmF0ZSIsICJpbXBvcnQgeyBveG15c3FsIH0gZnJvbSAnQG92ZXJleHRlbmRlZC9veG15c3FsJztcbmltcG9ydCB7IHRyaWdnZXJDbGllbnRDYWxsYmFjayB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IHNhdmVBcHBlYXJhbmNlIH0gZnJvbSAnLi4vYXBwZWFyYW5jZSc7XG5pbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xuXG5jb25zdCBkZWxheSA9IChtczogbnVtYmVyKSA9PiBuZXcgUHJvbWlzZShyZXMgPT4gc2V0VGltZW91dChyZXMsIG1zKSk7XG5cbmNvbnN0IG1pZ3JhdGUgPSBhc3luYyAoc3JjOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCByZXNwb25zZTogYW55ID0gYXdhaXQgb3hteXNxbC5xdWVyeSgnU0VMRUNUICogRlJPTSBgcGxheWVyc2tpbnNgIFdIRVJFIGFjdGl2ZSA9IDEnKTtcbiAgICBpZiAoIXJlc3BvbnNlKSByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgcmVzcG9uc2UpIHtcbiAgICAgICAgZW1pdE5ldCgncWItY2xvdGhlczpsb2FkU2tpbicsIHNyYywgMCwgZWxlbWVudC5tb2RlbCwgZWxlbWVudC5za2luKTtcbiAgICAgICAgYXdhaXQgZGVsYXkoMjAwKTtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50OmdldEFwcGVhcmFuY2UnLCBzcmMpIGFzIFRBcHBlYXJhbmNlXG4gICAgICAgIGF3YWl0IHNhdmVBcHBlYXJhbmNlKHNyYywgZWxlbWVudC5jaXRpemVuaWQsIHJlc3BvbnNlKVxuICAgIH1cbiAgICBjb25zb2xlLmxvZygnQ29udmVydGVkICcrIHJlc3BvbnNlLmxlbmd0aCArICcgYXBwZWFyYW5jZXMnKVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbWlncmF0ZSIsICJpbXBvcnQgeyBjb3JlLCBvbkNsaWVudENhbGxiYWNrIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IG94bXlzcWwgfSBmcm9tICdAb3ZlcmV4dGVuZGVkL294bXlzcWwnO1xyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tICdAdHlwaW5ncy9vdXRmaXRzJztcclxuaW1wb3J0IHsgc2F2ZUFwcGVhcmFuY2UgfSBmcm9tICcuL2FwcGVhcmFuY2UnO1xyXG5pbXBvcnQgeyBTa2luREIgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldE91dGZpdHMnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCkgPT4ge1xyXG5cdGNvbnN0IGpvYiA9IGNvcmUuR2V0UGxheWVyKHNyYykuam9iXHJcblx0bGV0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG5cdFx0J1NFTEVDVCAqIEZST00gb3V0Zml0cyBXSEVSRSBwbGF5ZXJfaWQgPSA/IE9SIChqb2JuYW1lID0gPyBBTkQgam9icmFuayA8PSA/KScsXHJcblx0XHRbZnJhbWV3b3JrSWQsIGpvYi5uYW1lLCBqb2IuZ3JhZGUubmFtZV1cclxuXHQpO1xyXG5cdGlmICghcmVzcG9uc2UpIHJldHVybiBbXTtcclxuXHJcblx0aWYgKCFBcnJheS5pc0FycmF5KHJlc3BvbnNlKSkge1xyXG5cdFx0cmVzcG9uc2UgPSBbcmVzcG9uc2VdO1xyXG5cdH1cclxuXHJcblx0Y29uc3Qgb3V0Zml0cyA9IHJlc3BvbnNlLm1hcChcclxuXHRcdChvdXRmaXQ6IHsgaWQ6IG51bWJlcjsgbGFiZWw6IHN0cmluZzsgb3V0Zml0OiBzdHJpbmc7IGpvYm5hbWU/OiBzdHJpbmcgfSkgPT4ge1xyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdGlkOiBvdXRmaXQuaWQsXHJcblx0XHRcdFx0bGFiZWw6IG91dGZpdC5sYWJlbCxcclxuXHRcdFx0XHRvdXRmaXQ6IEpTT04ucGFyc2Uob3V0Zml0Lm91dGZpdCksXHJcblx0XHRcdFx0am9ibmFtZTogb3V0Zml0LmpvYm5hbWUsXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0KTtcclxuXHJcblx0cmV0dXJuIG91dGZpdHM7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6cmVuYW1lT3V0Zml0JywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQsIGRhdGEpID0+IHtcclxuXHRjb25zdCBpZCA9IGRhdGEuaWQ7XHJcblx0Y29uc3QgbGFiZWwgPSBkYXRhLmxhYmVsO1xyXG5cclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdCdVUERBVEUgb3V0Zml0cyBTRVQgbGFiZWwgPSA/IFdIRVJFIHBsYXllcl9pZCA9ID8gQU5EIGlkID0gPycsXHJcblx0XHRbbGFiZWwsIGZyYW1ld29ya0lkLCBpZF1cclxuXHQpO1xyXG5cdHJldHVybiByZXN1bHQ7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6ZGVsZXRlT3V0Zml0JywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQsIGlkKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcblx0XHQnREVMRVRFIEZST00gb3V0Zml0cyBXSEVSRSBwbGF5ZXJfaWQgPSA/IEFORCBpZCA9ID8nLFxyXG5cdFx0W2ZyYW1ld29ya0lkLCBpZF1cclxuXHQpO1xyXG5cdHJldHVybiByZXN1bHQgPiAwO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVPdXRmaXQnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCwgZGF0YTogT3V0Zml0KSA9PiB7XHJcblx0Y29uc3Qgam9ibmFtZSA9IGRhdGEuam9iPy5uYW1lIHx8IG51bGw7XHJcblx0Y29uc3Qgam9icmFuayA9IGRhdGEuam9iPy5yYW5rIHx8IG51bGw7XHJcblx0Y29uc3QgaWQgPSBhd2FpdCBveG15c3FsLmluc2VydChcclxuXHRcdCdJTlNFUlQgSU5UTyBvdXRmaXRzIChwbGF5ZXJfaWQsIGxhYmVsLCBvdXRmaXQsIGpvYm5hbWUsIGpvYnJhbmspIFZBTFVFUyAoPywgPywgPywgPywgPyknLFxyXG5cdFx0W2ZyYW1ld29ya0lkLCBkYXRhLmxhYmVsLCBKU09OLnN0cmluZ2lmeShkYXRhLm91dGZpdCksIGpvYm5hbWUsIGpvYnJhbmtdXHJcblx0KTtcclxuXHRyZXR1cm4gaWQ7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z3JhYk91dGZpdCcsIGFzeW5jIChzcmMsIGlkKSA9PiB7XHJcblx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcblx0XHQnU0VMRUNUIG91dGZpdCBGUk9NIG91dGZpdHMgV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtpZF1cclxuXHQpO1xyXG5cdHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjppdGVtT3V0Zml0JywgYXN5bmMgKHNyYywgZGF0YSkgPT4ge1xyXG5cdGNvbnN0IHBsYXllciA9IGNvcmUuR2V0UGxheWVyKHNyYylcclxuXHRwbGF5ZXIuYWRkSXRlbSgnY2xvdGgnLCAxLCBkYXRhKVxyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmltcG9ydE91dGZpdCcsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBvdXRmaXRJZCwgb3V0Zml0TmFtZSkgPT4ge1xyXG4gICAgY29uc3QgW3Jlc3VsdF0gPSBhd2FpdCBveG15c3FsLnF1ZXJ5KFxyXG4gICAgICAgICdTRUxFQ1QgbGFiZWwsIG91dGZpdCBGUk9NIG91dGZpdHMgV0hFUkUgaWQgPSA/JyxcclxuICAgICAgICBbb3V0Zml0SWRdXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6ICdPdXRmaXQgbm90IGZvdW5kJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5ld0lkID0gYXdhaXQgb3hteXNxbC5pbnNlcnQoXHJcbiAgICAgICAgJ0lOU0VSVCBJTlRPIG91dGZpdHMgKHBsYXllcl9pZCwgbGFiZWwsIG91dGZpdCkgVkFMVUVTICg/LCA/LCA/KScsXHJcbiAgICAgICAgW2ZyYW1ld29ya0lkLCBvdXRmaXROYW1lLCByZXN1bHQub3V0Zml0XVxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBuZXdJZDogbmV3SWQgfTtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlU2tpbicsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBza2luKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcblx0XHQnVVBEQVRFIGFwcGVhcmFuY2UgU0VUIHNraW4gPSA/IFdIRVJFIGlkID0gPycsXHJcblx0XHRbSlNPTi5zdHJpbmdpZnkoc2tpbiksIGZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0cmV0dXJuIHJlc3VsdDtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlQ2xvdGhlcycsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBjbG90aGVzKSA9PiB7XHJcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdFx0J1VQREFURSBhcHBlYXJhbmNlIFNFVCBjbG90aGVzID0gPyBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0XHRbSlNPTi5zdHJpbmdpZnkoY2xvdGhlcyksIGZyYW1ld29ya0lkXVxyXG5cdFx0KTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG4pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUFwcGVhcmFuY2UnLCBzYXZlQXBwZWFyYW5jZSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlVGF0dG9vcycsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCB0YXR0b29zKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcblx0XHQnVVBEQVRFIGFwcGVhcmFuY2UgU0VUIHRhdHRvb3MgPSA/IFdIRVJFIGlkID0gPycsXHJcblx0XHRbSlNPTi5zdHJpbmdpZnkodGF0dG9vcyksIGZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0cmV0dXJuIHJlc3VsdDtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRTa2luJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQpID0+IHtcclxuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1Qgc2tpbiBGUk9NIGFwcGVhcmFuY2UgV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtmcmFtZXdvcmtJZF1cclxuXHQpO1xyXG5cdHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRDbG90aGVzJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQpID0+IHtcclxuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1QgY2xvdGhlcyBGUk9NIGFwcGVhcmFuY2UgV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtmcmFtZXdvcmtJZF1cclxuXHQpO1xyXG5cdHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRUYXR0b29zJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQpID0+IHtcclxuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1QgdGF0dG9vcyBGUk9NIGFwcGVhcmFuY2UgV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtmcmFtZXdvcmtJZF1cclxuXHQpO1xyXG5cdHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKSB8fCBbXTtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQpID0+IHtcclxuXHRjb25zdCByZXNwb25zZTogU2tpbkRCID0gYXdhaXQgb3hteXNxbC5zaW5nbGUoXHJcblx0XHQnU0VMRUNUICogRlJPTSBhcHBlYXJhbmNlIFdIRVJFIGlkID0gPyBMSU1JVCAxJyxcclxuXHRcdFtmcmFtZXdvcmtJZF1cclxuXHQpO1xyXG5cclxuXHRpZiAoIXJlc3BvbnNlKSByZXR1cm4gbnVsbDtcclxuXHRsZXQgYXBwZWFyYW5jZSA9IHtcclxuXHRcdC4uLkpTT04ucGFyc2UocmVzcG9uc2Uuc2tpbiksXHJcblx0XHQuLi5KU09OLnBhcnNlKHJlc3BvbnNlLmNsb3RoZXMpLFxyXG5cdFx0Li4uSlNPTi5wYXJzZShyZXNwb25zZS50YXR0b29zKSxcclxuXHR9XHJcblx0YXBwZWFyYW5jZS5pZCA9IHJlc3BvbnNlLmlkXHJcblx0cmV0dXJuIGFwcGVhcmFuY2U7XHJcbn0pO1xyXG5cclxub25OZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNldHJvdXRpbmdidWNrZXQnLCAoKSA9PiB7XHJcblx0U2V0UGxheWVyUm91dGluZ0J1Y2tldChzb3VyY2UudG9TdHJpbmcoKSwgc291cmNlKVxyXG59KTtcclxuXHJcbm9uTmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZXNldHJvdXRpbmdidWNrZXQnLCAoKSA9PiB7XHJcblx0U2V0UGxheWVyUm91dGluZ0J1Y2tldChzb3VyY2UudG9TdHJpbmcoKSwgMClcclxufSk7XHJcblxyXG5SZWdpc3RlckNvbW1hbmQoJ21pZ3JhdGUnLCBhc3luYyAoc291cmNlOiBudW1iZXIpID0+IHtcclxuXHRzb3VyY2UgPSBzb3VyY2UgIT09IDAgPyBzb3VyY2UgOiBwYXJzZUludChnZXRQbGF5ZXJzKClbMF0pXHJcblx0Y29uc3QgYmxfYXBwZWFyYW5jZSA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZTtcclxuXHRjb25zdCBjb25maWcgPSBibF9hcHBlYXJhbmNlLmNvbmZpZygpO1xyXG5cdGNvbnN0IGltcG9ydGVkTW9kdWxlID0gYXdhaXQgaW1wb3J0KGAuL21pZ3JhdGUvJHtjb25maWcucHJldmlvdXNDbG90aGluZyA9PT0gJ2ZpdmVtLWFwcGVhcmFuY2UnID8gJ2ZpdmVtJyA6IGNvbmZpZy5wcmV2aW91c0Nsb3RoaW5nfS50c2ApXHJcblx0aW1wb3J0ZWRNb2R1bGUuZGVmYXVsdChzb3VyY2UpXHJcbn0sIGZhbHNlKTtcclxuXHJcbmNvcmUuUmVnaXN0ZXJVc2FibGVJdGVtKCdjbG90aCcsIGFzeW5jIChzb3VyY2U6IG51bWJlciwgc2xvdDogbnVtYmVyLCBtZXRhZGF0YToge291dGZpdDogT3V0Zml0LCBsYWJlbDogc3RyaW5nfSkgPT4ge1xyXG5cdGNvbnN0IHBsYXllciA9IGNvcmUuR2V0UGxheWVyKHNvdXJjZSlcclxuXHRpZiAocGxheWVyPy5yZW1vdmVJdGVtKCdjbG90aCcsIDEsIHNsb3QpKSBcclxuXHRcdGVtaXROZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnVzZU91dGZpdCcsIHNvdXJjZSwgbWV0YWRhdGEub3V0Zml0KVxyXG59KSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBVU8sU0FBUyxzQkFBc0IsV0FBbUIsYUFBcUIsTUFBYTtBQUN2RixNQUFJO0FBQ0osS0FBRztBQUNDLFVBQU0sR0FBRyxTQUFTLElBQUksS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLE1BQVMsRUFBRSxDQUFDLElBQUksUUFBUTtBQUFBLEVBQzlFLFNBQVMsYUFBYSxHQUFHO0FBQ3pCLFVBQVEsVUFBVSxTQUFTLElBQUksVUFBVSxjQUFjLEtBQUssR0FBRyxJQUFJO0FBQ25FLFNBQU8sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM1QixpQkFBYSxHQUFHLElBQUk7QUFBQSxFQUN4QixDQUFDO0FBQ0w7QUFFTyxTQUFTLGlCQUFpQixXQUFtQixJQUErQztBQUMvRixRQUFNLFVBQVUsU0FBUyxJQUFJLE9BQU8sVUFBa0IsUUFBZ0IsU0FBZ0I7QUFDbEYsVUFBTSxNQUFNO0FBQ1osUUFBSTtBQUVKLFFBQUk7QUFDRixpQkFBVyxNQUFNLEdBQUcsS0FBSyxHQUFHLElBQUk7QUFBQSxJ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QUMsQ0FBQztBQUN6RCxRQUFNLGdCQUFnQixRQUFRO0FBQzlCLFFBQU0sU0FBUyxjQUFjLE9BQU87QUFDcEMsUUFBTSxpQkFBaUIsTUFBYSxtQ0FBYSxPQUFPLHFCQUFxQixxQkFBcUIsVUFBVSxPQUFPLGdCQUFnQjtBQUNuSSxpQkFBZSxRQUFRQSxPQUFNO0FBQzlCLEdBQUcsS0FBSztBQUVSLEtBQUssbUJBQW1CLFNBQVMsT0FBT0EsU0FBZ0IsTUFBYyxhQUE4QztBQUNuSCxRQUFNLFNBQVMsS0FBSyxVQUFVQSxPQUFNO0FBQ3BDLE1BQUksUUFBUSxXQUFXLFNBQVMsR0FBRyxJQUFJO0FBQ3RDLFlBQVEsa0NBQWtDQSxTQUFRLFNBQVMsTUFBTTtBQUNuRSxDQUFDOyIsCiAgIm5hbWVzIjogWyJleHBvcnRzIiwgImltcG9ydF9veG15c3FsIiwgInJlc3BvbnNlIiwgImltcG9ydF9veG15c3FsIiwgImRlbGF5IiwgIm1pZ3JhdGUiLCAicmVzcG9uc2UiLCAiaW1wb3J0X294bXlzcWwiLCAiZGVsYXkiLCAibWlncmF0ZSIsICJyZXNwb25zZSIsICJpbXBvcnRfb3hteXNxbCIsICJzb3VyY2UiXQp9Cg==
