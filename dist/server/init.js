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
      const response = await import_oxmysql3.oxmysql.query("SELECT * FROM `playerskins` WHERE active = 1");
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
  const job = core.GetPlayer(src).job || { name: "unknown", grade: { name: "unknown" } };
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
  let jobname = null;
  let jobrank = 0;
  if (data.job) {
    jobname = data.job.name;
    jobrank = data.job.rank;
  }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3NlcnZlci91dGlscy9pbmRleC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQG92ZXJleHRlbmRlZC9veG15c3FsL015U1FMLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvYXBwZWFyYW5jZS50cyIsICIuLi8uLi9zcmMvc2VydmVyL21pZ3JhdGUvZXN4LnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvbWlncmF0ZS9maXZlbS50cyIsICIuLi8uLi9zcmMvc2VydmVyL21pZ3JhdGUvaWxsZW5pdW0udHMiLCAiLi4vLi4vc3JjL3NlcnZlci9taWdyYXRlL3FiLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvaW5pdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL3NlcnZlci9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuY29uc3QgcmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpXHJcblxyXG5jb25zdCBhY3RpdmVFdmVudHMgPSB7fTtcclxub25OZXQoYF9ibF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5LCAuLi5hcmdzKSA9PiB7XHJcbiAgICBjb25zdCByZXNvbHZlID0gYWN0aXZlRXZlbnRzW2tleV07XHJcbiAgICByZXR1cm4gcmVzb2x2ZSAmJiByZXNvbHZlKC4uLmFyZ3MpO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2soZXZlbnROYW1lOiBzdHJpbmcsIHBsYXllcklkOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9OiR7cGxheWVySWR9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuICAgIGVtaXROZXQoYF9ibF9jYl8ke2V2ZW50TmFtZX1gLCBwbGF5ZXJJZCwgcmVzb3VyY2VOYW1lLCBrZXksIC4uLmFyZ3MpO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgYWN0aXZlRXZlbnRzW2tleV0gPSByZXNvbHZlO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvbkNsaWVudENhbGxiYWNrKGV2ZW50TmFtZTogc3RyaW5nLCBjYjogKHBsYXllcklkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpIHtcclxuICAgIG9uTmV0KGBfYmxfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcsIGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNyYyA9IHNvdXJjZTtcclxuICAgICAgICBsZXQgcmVzcG9uc2U6IGFueTtcclxuICAgIFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IGNiKHNyYywgLi4uYXJncyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBhbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBoYW5kbGluZyBjYWxsYmFjayBldmVudCAke2V2ZW50TmFtZX1gKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGBeMyR7ZS5zdGFja31eMGApO1xyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIGVtaXROZXQoYF9ibF9jYl8ke3Jlc291cmNlfWAsIHNyYywga2V5LCByZXNwb25zZSk7XHJcbiAgICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY29yZSA9IGV4cG9ydHMuYmxfYnJpZGdlLmNvcmUoKSIsICJ0eXBlIFF1ZXJ5ID0gc3RyaW5nIHwgbnVtYmVyO1xyXG50eXBlIFBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5rbm93bltdIHwgRnVuY3Rpb247XHJcbnR5cGUgQ2FsbGJhY2s8VD4gPSAocmVzdWx0OiBUIHwgbnVsbCkgPT4gdm9pZDtcclxuXHJcbnR5cGUgVHJhbnNhY3Rpb24gPVxyXG4gIHwgc3RyaW5nW11cclxuICB8IFtzdHJpbmcsIFBhcmFtc11bXVxyXG4gIHwgeyBxdWVyeTogc3RyaW5nOyB2YWx1ZXM6IFBhcmFtcyB9W11cclxuICB8IHsgcXVlcnk6IHN0cmluZzsgcGFyYW1ldGVyczogUGFyYW1zIH1bXTtcclxuXHJcbmludGVyZmFjZSBSZXN1bHQge1xyXG4gIFtjb2x1bW46IHN0cmluZyB8IG51bWJlcl06IGFueTtcclxuICBhZmZlY3RlZFJvd3M/OiBudW1iZXI7XHJcbiAgZmllbGRDb3VudD86IG51bWJlcjtcclxuICBpbmZvPzogc3RyaW5nO1xyXG4gIGluc2VydElkPzogbnVtYmVyO1xyXG4gIHNlcnZlclN0YXR1cz86IG51bWJlcjtcclxuICB3YXJuaW5nU3RhdHVzPzogbnVtYmVyO1xyXG4gIGNoYW5nZWRSb3dzPzogbnVtYmVyO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUm93IHtcclxuICBbY29sdW1uOiBzdHJpbmcgfCBudW1iZXJdOiB1bmtub3duO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgT3hNeVNRTCB7XHJcbiAgc3RvcmU6IChxdWVyeTogc3RyaW5nKSA9PiB2b2lkO1xyXG4gIHJlYWR5OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQ7XHJcbiAgcXVlcnk6IDxUID0gUmVzdWx0IHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBzaW5nbGU6IDxUID0gUm93IHwgbnVsbD4oXHJcbiAgICBxdWVyeTogUXVlcnksXHJcbiAgICBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxFeGNsdWRlPFQsIFtdPj4sXHJcbiAgICBjYj86IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PlxyXG4gICkgPT4gUHJvbWlzZTxFeGNsdWRlPFQsIFtdPj47XHJcbiAgc2NhbGFyOiA8VCA9IHVua25vd24gfCBudWxsPihcclxuICAgIHF1ZXJ5OiBRdWVyeSxcclxuICAgIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PixcclxuICAgIGNiPzogQ2FsbGJhY2s8RXhjbHVkZTxULCBbXT4+XHJcbiAgKSA9PiBQcm9taXNlPEV4Y2x1ZGU8VCwgW10+PjtcclxuICB1cGRhdGU6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBpbnNlcnQ6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBwcmVwYXJlOiA8VCA9IGFueT4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICByYXdFeGVjdXRlOiA8VCA9IFJlc3VsdCB8IG51bGw+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgdHJhbnNhY3Rpb246IChxdWVyeTogVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPGJvb2xlYW4+LCBjYj86IENhbGxiYWNrPGJvb2xlYW4+KSA9PiBQcm9taXNlPGJvb2xlYW4+O1xyXG4gIGlzUmVhZHk6ICgpID0+IGJvb2xlYW47XHJcbiAgYXdhaXRDb25uZWN0aW9uOiAoKSA9PiBQcm9taXNlPHRydWU+O1xyXG59XHJcblxyXG5jb25zdCBRdWVyeVN0b3JlOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbjogYm9vbGVhbiwgbWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgaWYgKCFjb25kaXRpb24pIHRocm93IG5ldyBUeXBlRXJyb3IobWVzc2FnZSk7XHJcbn1cclxuXHJcbmNvbnN0IHNhZmVBcmdzID0gKHF1ZXJ5OiBRdWVyeSB8IFRyYW5zYWN0aW9uLCBwYXJhbXM/OiBhbnksIGNiPzogRnVuY3Rpb24sIHRyYW5zYWN0aW9uPzogdHJ1ZSkgPT4ge1xyXG4gIGlmICh0eXBlb2YgcXVlcnkgPT09ICdudW1iZXInKSBxdWVyeSA9IFF1ZXJ5U3RvcmVbcXVlcnldO1xyXG5cclxuICBpZiAodHJhbnNhY3Rpb24pIHtcclxuICAgIGFzc2VydCh0eXBlb2YgcXVlcnkgPT09ICdvYmplY3QnLCBgRmlyc3QgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0LCByZWNpZXZlZCAke3R5cGVvZiBxdWVyeX1gKTtcclxuICB9IGVsc2Uge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBxdWVyeSA9PT0gJ3N0cmluZycsIGBGaXJzdCBhcmd1bWVudCBleHBlY3RlZCBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG4gIH1cclxuXHJcbiAgaWYgKHBhcmFtcykge1xyXG4gICAgY29uc3QgcGFyYW1UeXBlID0gdHlwZW9mIHBhcmFtcztcclxuICAgIGFzc2VydChcclxuICAgICAgcGFyYW1UeXBlID09PSAnb2JqZWN0JyB8fCBwYXJhbVR5cGUgPT09ICdmdW5jdGlvbicsXHJcbiAgICAgIGBTZWNvbmQgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0IG9yIGZ1bmN0aW9uLCByZWNlaXZlZCAke3BhcmFtVHlwZX1gXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghY2IgJiYgcGFyYW1UeXBlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGNiID0gcGFyYW1zO1xyXG4gICAgICBwYXJhbXMgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoY2IgIT09IHVuZGVmaW5lZCkgYXNzZXJ0KHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJywgYFRoaXJkIGFyZ3VtZW50IGV4cGVjdGVkIGZ1bmN0aW9uLCByZWNlaXZlZCAke3R5cGVvZiBjYn1gKTtcclxuXHJcbiAgcmV0dXJuIFtxdWVyeSwgcGFyYW1zLCBjYl07XHJcbn07XHJcblxyXG5jb25zdCBleHAgPSBnbG9iYWwuZXhwb3J0cy5veG15c3FsO1xyXG5jb25zdCBjdXJyZW50UmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpO1xyXG5cclxuZnVuY3Rpb24gZXhlY3V0ZShtZXRob2Q6IHN0cmluZywgcXVlcnk6IFF1ZXJ5IHwgVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcykge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBleHBbbWV0aG9kXShcclxuICAgICAgcXVlcnksXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgKHJlc3VsdCwgZXJyb3IpID0+IHtcclxuICAgICAgICBpZiAoZXJyb3IpIHJldHVybiByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIHJlc29sdmUocmVzdWx0KTtcclxuICAgICAgfSxcclxuICAgICAgY3VycmVudFJlc291cmNlTmFtZSxcclxuICAgICAgdHJ1ZVxyXG4gICAgKTtcclxuICB9KSBhcyBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBveG15c3FsOiBPeE15U1FMID0ge1xyXG4gIHN0b3JlKHF1ZXJ5KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIHF1ZXJ5ICE9PSAnc3RyaW5nJywgYFF1ZXJ5IGV4cGVjdHMgYSBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG5cclxuICAgIHJldHVybiBRdWVyeVN0b3JlLnB1c2gocXVlcnkpO1xyXG4gIH0sXHJcbiAgcmVhZHkoY2FsbGJhY2spIHtcclxuICAgIHNldEltbWVkaWF0ZShhc3luYyAoKSA9PiB7XHJcbiAgICAgIHdoaWxlIChHZXRSZXNvdXJjZVN0YXRlKCdveG15c3FsJykgIT09ICdzdGFydGVkJykgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTApKTtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgYXN5bmMgcXVlcnkocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdxdWVyeScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNpbmdsZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NpbmdsZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNjYWxhcihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NjYWxhcicsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHVwZGF0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3VwZGF0ZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIGluc2VydChxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ2luc2VydCcsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHByZXBhcmUocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdwcmVwYXJlJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgcmF3RXhlY3V0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3Jhd0V4ZWN1dGUnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyB0cmFuc2FjdGlvbihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiLCB0cnVlKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3RyYW5zYWN0aW9uJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgaXNSZWFkeSgpIHtcclxuICAgIHJldHVybiBleHAuaXNSZWFkeSgpO1xyXG4gIH0sXHJcbiAgYXN5bmMgYXdhaXRDb25uZWN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGF3YWl0IGV4cC5hd2FpdENvbm5lY3Rpb24oKTtcclxuICB9LFxyXG59O1xyXG4iLCAiaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcbmltcG9ydCB7IG94bXlzcWwgfSBmcm9tICdAb3ZlcmV4dGVuZGVkL294bXlzcWwnO1xuXG5leHBvcnQgY29uc3Qgc2F2ZUFwcGVhcmFuY2UgPSBhc3luYyAoc3JjOiBzdHJpbmcgfCBudW1iZXIsIGZyYW1ld29ya0lkOiBzdHJpbmcsIGFwcGVhcmFuY2U6IFRBcHBlYXJhbmNlKSA9PiB7XG5cdGNvbnN0IGNsb3RoZXMgPSB7XG5cdFx0ZHJhd2FibGVzOiBhcHBlYXJhbmNlLmRyYXdhYmxlcyxcblx0XHRwcm9wczogYXBwZWFyYW5jZS5wcm9wcyxcblx0XHRoZWFkT3ZlcmxheTogYXBwZWFyYW5jZS5oZWFkT3ZlcmxheSxcblx0fTtcblxuXHRjb25zdCBza2luID0ge1xuXHRcdGhlYWRCbGVuZDogYXBwZWFyYW5jZS5oZWFkQmxlbmQsXG5cdFx0aGVhZFN0cnVjdHVyZTogYXBwZWFyYW5jZS5oZWFkU3RydWN0dXJlLFxuXHRcdGhhaXJDb2xvcjogYXBwZWFyYW5jZS5oYWlyQ29sb3IsXG5cdFx0bW9kZWw6IGFwcGVhcmFuY2UubW9kZWwsXG5cdH07XG5cblx0Y29uc3QgdGF0dG9vcyA9IGFwcGVhcmFuY2UudGF0dG9vcyB8fCBbXTtcblxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXG5cdFx0J0lOU0VSVCBJTlRPIGFwcGVhcmFuY2UgKGlkLCBjbG90aGVzLCBza2luLCB0YXR0b29zKSBWQUxVRVMgKD8sID8sID8sID8pIE9OIERVUExJQ0FURSBLRVkgVVBEQVRFIGNsb3RoZXMgPSBWQUxVRVMoY2xvdGhlcyksIHNraW4gPSBWQUxVRVMoc2tpbiksIHRhdHRvb3MgPSBWQUxVRVModGF0dG9vcyk7Jyxcblx0XHRbXG5cdFx0XHRmcmFtZXdvcmtJZCxcblx0XHRcdEpTT04uc3RyaW5naWZ5KGNsb3RoZXMpLFxuXHRcdFx0SlNPTi5zdHJpbmdpZnkoc2tpbiksXG5cdFx0XHRKU09OLnN0cmluZ2lmeSh0YXR0b29zKSxcblx0XHRdXG5cdCk7XG5cblx0cmV0dXJuIHJlc3VsdDtcbn0iLCAiIiwgImltcG9ydCB7IG94bXlzcWwgfSBmcm9tICdAb3ZlcmV4dGVuZGVkL294bXlzcWwnO1xuaW1wb3J0IHsgdHJpZ2dlckNsaWVudENhbGxiYWNrIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgc2F2ZUFwcGVhcmFuY2UgfSBmcm9tICcuLi9hcHBlYXJhbmNlJztcbmltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSAnQHR5cGluZ3MvYXBwZWFyYW5jZSc7XG5cbmNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcblxuY29uc3QgbWlncmF0ZSA9IGFzeW5jIChzcmM6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlOiBhbnkgPSBhd2FpdCBveG15c3FsLnF1ZXJ5KCdTRUxFQ1QgKiBGUk9NIGBwbGF5ZXJzYCcpO1xuICAgIGlmICghcmVzcG9uc2UpIHJldHVybjtcblxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiByZXNwb25zZSkge1xuICAgICAgICBpZiAoZWxlbWVudC5za2luKSB7XG4gICAgICAgICAgICBhd2FpdCB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50Om1pZ3JhdGlvbjpzZXRBcHBlYXJhbmNlJywgc3JjLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2ZpdmVtJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnBhcnNlKGVsZW1lbnQuc2tpbilcbiAgICAgICAgICAgIH0pIGFzIFRBcHBlYXJhbmNlXG4gICAgICAgICAgICBhd2FpdCBkZWxheSgxMDApO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50OmdldEFwcGVhcmFuY2UnLCBzcmMpIGFzIFRBcHBlYXJhbmNlXG4gICAgICAgICAgICBhd2FpdCBzYXZlQXBwZWFyYW5jZShzcmMsIGVsZW1lbnQuY2l0aXplbmlkLCByZXNwb25zZSlcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zb2xlLmxvZygnQ29udmVydGVkICcrIHJlc3BvbnNlLmxlbmd0aCArICcgYXBwZWFyYW5jZXMnKVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbWlncmF0ZSIsICJpbXBvcnQgeyBveG15c3FsIH0gZnJvbSAnQG92ZXJleHRlbmRlZC9veG15c3FsJztcbmltcG9ydCB7IHRyaWdnZXJDbGllbnRDYWxsYmFjayB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IHNhdmVBcHBlYXJhbmNlIH0gZnJvbSAnLi4vYXBwZWFyYW5jZSc7XG5pbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xuXG5jb25zdCBkZWxheSA9IChtczogbnVtYmVyKSA9PiBuZXcgUHJvbWlzZShyZXMgPT4gc2V0VGltZW91dChyZXMsIG1zKSk7XG5cbmNvbnN0IG1pZ3JhdGUgPSBhc3luYyAoc3JjOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCByZXNwb25zZTogYW55ID0gYXdhaXQgb3hteXNxbC5xdWVyeSgnU0VMRUNUICogRlJPTSBgcGxheWVyc2tpbnNgIFdIRVJFIGFjdGl2ZSA9IDEnKTtcbiAgICBpZiAoIXJlc3BvbnNlKSByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgcmVzcG9uc2UpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuc2tpbikge1xuICAgICAgICAgICAgYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDptaWdyYXRpb246c2V0QXBwZWFyYW5jZScsIHNyYywge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdpbGxlbml1bScsXG4gICAgICAgICAgICAgICAgZGF0YTogSlNPTi5wYXJzZShlbGVtZW50LnNraW4pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgYXdhaXQgZGVsYXkoMTAwKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDpnZXRBcHBlYXJhbmNlJywgc3JjKSBhcyBUQXBwZWFyYW5jZVxuICAgICAgICAgICAgYXdhaXQgc2F2ZUFwcGVhcmFuY2Uoc3JjLCBlbGVtZW50LmNpdGl6ZW5pZCwgcmVzcG9uc2UpXG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coJ0NvbnZlcnRlZCAnKyByZXNwb25zZS5sZW5ndGggKyAnIGFwcGVhcmFuY2VzJylcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pZ3JhdGUiLCAiaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCc7XG5pbXBvcnQgeyB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2sgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBzYXZlQXBwZWFyYW5jZSB9IGZyb20gJy4uL2FwcGVhcmFuY2UnO1xuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcblxuY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xuXG5jb25zdCBtaWdyYXRlID0gYXN5bmMgKHNyYzogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IGFueSA9IGF3YWl0IG94bXlzcWwucXVlcnkoJ1NFTEVDVCAqIEZST00gYHBsYXllcnNraW5zYCBXSEVSRSBhY3RpdmUgPSAxJyk7XG4gICAgaWYgKCFyZXNwb25zZSkgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHJlc3BvbnNlKSB7XG4gICAgICAgIGVtaXROZXQoJ3FiLWNsb3RoZXM6bG9hZFNraW4nLCBzcmMsIDAsIGVsZW1lbnQubW9kZWwsIGVsZW1lbnQuc2tpbik7XG4gICAgICAgIGF3YWl0IGRlbGF5KDIwMCk7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDpnZXRBcHBlYXJhbmNlJywgc3JjKSBhcyBUQXBwZWFyYW5jZVxuICAgICAgICBhd2FpdCBzYXZlQXBwZWFyYW5jZShzcmMsIGVsZW1lbnQuY2l0aXplbmlkLCByZXNwb25zZSlcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ0NvbnZlcnRlZCAnKyByZXNwb25zZS5sZW5ndGggKyAnIGFwcGVhcmFuY2VzJylcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pZ3JhdGUiLCAiaW1wb3J0IHsgY29yZSwgb25DbGllbnRDYWxsYmFjayB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBveG15c3FsIH0gZnJvbSAnQG92ZXJleHRlbmRlZC9veG15c3FsJztcclxuaW1wb3J0IHsgT3V0Zml0IH0gZnJvbSAnQHR5cGluZ3Mvb3V0Zml0cyc7XHJcbmltcG9ydCB7IHNhdmVBcHBlYXJhbmNlIH0gZnJvbSAnLi9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgU2tpbkRCIH0gZnJvbSAnQHR5cGluZ3MvYXBwZWFyYW5jZSc7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRPdXRmaXRzJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQpID0+IHtcclxuICAgIGNvbnN0IGpvYiA9IGNvcmUuR2V0UGxheWVyKHNyYykuam9iIHx8IHsgbmFtZTogJ3Vua25vd24nLCBncmFkZTogeyBuYW1lOiAndW5rbm93bicgfSB9XHJcblx0bGV0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG5cdFx0J1NFTEVDVCAqIEZST00gb3V0Zml0cyBXSEVSRSBwbGF5ZXJfaWQgPSA/IE9SIChqb2JuYW1lID0gPyBBTkQgam9icmFuayA8PSA/KScsXHJcblx0XHRbZnJhbWV3b3JrSWQsIGpvYi5uYW1lLCBqb2IuZ3JhZGUubmFtZV1cclxuXHQpO1xyXG5cdGlmICghcmVzcG9uc2UpIHJldHVybiBbXTtcclxuXHJcblx0aWYgKCFBcnJheS5pc0FycmF5KHJlc3BvbnNlKSkge1xyXG5cdFx0cmVzcG9uc2UgPSBbcmVzcG9uc2VdO1xyXG5cdH1cclxuXHJcblx0Y29uc3Qgb3V0Zml0cyA9IHJlc3BvbnNlLm1hcChcclxuXHRcdChvdXRmaXQ6IHsgaWQ6IG51bWJlcjsgbGFiZWw6IHN0cmluZzsgb3V0Zml0OiBzdHJpbmc7IGpvYm5hbWU/OiBzdHJpbmcgfSkgPT4ge1xyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdGlkOiBvdXRmaXQuaWQsXHJcblx0XHRcdFx0bGFiZWw6IG91dGZpdC5sYWJlbCxcclxuXHRcdFx0XHRvdXRmaXQ6IEpTT04ucGFyc2Uob3V0Zml0Lm91dGZpdCksXHJcblx0XHRcdFx0am9ibmFtZTogb3V0Zml0LmpvYm5hbWUsXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0KTtcclxuXHJcblx0cmV0dXJuIG91dGZpdHM7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6cmVuYW1lT3V0Zml0JywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQsIGRhdGEpID0+IHtcclxuXHRjb25zdCBpZCA9IGRhdGEuaWQ7XHJcblx0Y29uc3QgbGFiZWwgPSBkYXRhLmxhYmVsO1xyXG5cclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdCdVUERBVEUgb3V0Zml0cyBTRVQgbGFiZWwgPSA/IFdIRVJFIHBsYXllcl9pZCA9ID8gQU5EIGlkID0gPycsXHJcblx0XHRbbGFiZWwsIGZyYW1ld29ya0lkLCBpZF1cclxuXHQpO1xyXG5cdHJldHVybiByZXN1bHQ7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6ZGVsZXRlT3V0Zml0JywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQsIGlkKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcblx0XHQnREVMRVRFIEZST00gb3V0Zml0cyBXSEVSRSBwbGF5ZXJfaWQgPSA/IEFORCBpZCA9ID8nLFxyXG5cdFx0W2ZyYW1ld29ya0lkLCBpZF1cclxuXHQpO1xyXG5cdHJldHVybiByZXN1bHQgPiAwO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVPdXRmaXQnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCwgZGF0YTogT3V0Zml0KSA9PiB7XHJcbiAgICBsZXQgam9ibmFtZSA9IG51bGxcclxuICAgIGxldCBqb2JyYW5rID0gMFxyXG4gICAgaWYgKGRhdGEuam9iKSB7XHJcbiAgICAgICAgam9ibmFtZSA9IGRhdGEuam9iLm5hbWU7XHJcbiAgICAgICAgam9icmFuayA9IGRhdGEuam9iLnJhbms7XHJcbiAgICB9XHJcblx0Y29uc3QgaWQgPSBhd2FpdCBveG15c3FsLmluc2VydChcclxuXHRcdCdJTlNFUlQgSU5UTyBvdXRmaXRzIChwbGF5ZXJfaWQsIGxhYmVsLCBvdXRmaXQsIGpvYm5hbWUsIGpvYnJhbmspIFZBTFVFUyAoPywgPywgPywgPywgPyknLFxyXG5cdFx0W2ZyYW1ld29ya0lkLCBkYXRhLmxhYmVsLCBKU09OLnN0cmluZ2lmeShkYXRhLm91dGZpdCksIGpvYm5hbWUsIGpvYnJhbmtdXHJcblx0KTtcclxuXHRyZXR1cm4gaWQ7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z3JhYk91dGZpdCcsIGFzeW5jIChzcmMsIGlkKSA9PiB7XHJcblx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcblx0XHQnU0VMRUNUIG91dGZpdCBGUk9NIG91dGZpdHMgV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtpZF1cclxuXHQpO1xyXG5cdHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjppdGVtT3V0Zml0JywgYXN5bmMgKHNyYywgZGF0YSkgPT4ge1xyXG5cdGNvbnN0IHBsYXllciA9IGNvcmUuR2V0UGxheWVyKHNyYylcclxuXHRwbGF5ZXIuYWRkSXRlbSgnY2xvdGgnLCAxLCBkYXRhKVxyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmltcG9ydE91dGZpdCcsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBvdXRmaXRJZCwgb3V0Zml0TmFtZSkgPT4ge1xyXG4gICAgY29uc3QgW3Jlc3VsdF0gPSBhd2FpdCBveG15c3FsLnF1ZXJ5KFxyXG4gICAgICAgICdTRUxFQ1QgbGFiZWwsIG91dGZpdCBGUk9NIG91dGZpdHMgV0hFUkUgaWQgPSA/JyxcclxuICAgICAgICBbb3V0Zml0SWRdXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6ICdPdXRmaXQgbm90IGZvdW5kJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5ld0lkID0gYXdhaXQgb3hteXNxbC5pbnNlcnQoXHJcbiAgICAgICAgJ0lOU0VSVCBJTlRPIG91dGZpdHMgKHBsYXllcl9pZCwgbGFiZWwsIG91dGZpdCkgVkFMVUVTICg/LCA/LCA/KScsXHJcbiAgICAgICAgW2ZyYW1ld29ya0lkLCBvdXRmaXROYW1lLCByZXN1bHQub3V0Zml0XVxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBuZXdJZDogbmV3SWQgfTtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlU2tpbicsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBza2luKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcblx0XHQnVVBEQVRFIGFwcGVhcmFuY2UgU0VUIHNraW4gPSA/IFdIRVJFIGlkID0gPycsXHJcblx0XHRbSlNPTi5zdHJpbmdpZnkoc2tpbiksIGZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0cmV0dXJuIHJlc3VsdDtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlQ2xvdGhlcycsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBjbG90aGVzKSA9PiB7XHJcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdFx0J1VQREFURSBhcHBlYXJhbmNlIFNFVCBjbG90aGVzID0gPyBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0XHRbSlNPTi5zdHJpbmdpZnkoY2xvdGhlcyksIGZyYW1ld29ya0lkXVxyXG5cdFx0KTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG4pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUFwcGVhcmFuY2UnLCBzYXZlQXBwZWFyYW5jZSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlVGF0dG9vcycsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCB0YXR0b29zKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcblx0XHQnVVBEQVRFIGFwcGVhcmFuY2UgU0VUIHRhdHRvb3MgPSA/IFdIRVJFIGlkID0gPycsXHJcblx0XHRbSlNPTi5zdHJpbmdpZnkodGF0dG9vcyksIGZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0cmV0dXJuIHJlc3VsdDtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRTa2luJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQpID0+IHtcclxuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1Qgc2tpbiBGUk9NIGFwcGVhcmFuY2UgV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtmcmFtZXdvcmtJZF1cclxuXHQpO1xyXG5cdHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRDbG90aGVzJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQpID0+IHtcclxuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1QgY2xvdGhlcyBGUk9NIGFwcGVhcmFuY2UgV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtmcmFtZXdvcmtJZF1cclxuXHQpO1xyXG5cdHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRUYXR0b29zJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQpID0+IHtcclxuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1QgdGF0dG9vcyBGUk9NIGFwcGVhcmFuY2UgV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtmcmFtZXdvcmtJZF1cclxuXHQpO1xyXG5cdHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKSB8fCBbXTtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQpID0+IHtcclxuXHRjb25zdCByZXNwb25zZTogU2tpbkRCID0gYXdhaXQgb3hteXNxbC5zaW5nbGUoXHJcblx0XHQnU0VMRUNUICogRlJPTSBhcHBlYXJhbmNlIFdIRVJFIGlkID0gPyBMSU1JVCAxJyxcclxuXHRcdFtmcmFtZXdvcmtJZF1cclxuXHQpO1xyXG5cclxuXHRpZiAoIXJlc3BvbnNlKSByZXR1cm4gbnVsbDtcclxuXHRsZXQgYXBwZWFyYW5jZSA9IHtcclxuXHRcdC4uLkpTT04ucGFyc2UocmVzcG9uc2Uuc2tpbiksXHJcblx0XHQuLi5KU09OLnBhcnNlKHJlc3BvbnNlLmNsb3RoZXMpLFxyXG5cdFx0Li4uSlNPTi5wYXJzZShyZXNwb25zZS50YXR0b29zKSxcclxuXHR9XHJcblx0YXBwZWFyYW5jZS5pZCA9IHJlc3BvbnNlLmlkXHJcblx0cmV0dXJuIGFwcGVhcmFuY2U7XHJcbn0pO1xyXG5cclxub25OZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNldHJvdXRpbmdidWNrZXQnLCAoKSA9PiB7XHJcblx0U2V0UGxheWVyUm91dGluZ0J1Y2tldChzb3VyY2UudG9TdHJpbmcoKSwgc291cmNlKVxyXG59KTtcclxuXHJcbm9uTmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZXNldHJvdXRpbmdidWNrZXQnLCAoKSA9PiB7XHJcblx0U2V0UGxheWVyUm91dGluZ0J1Y2tldChzb3VyY2UudG9TdHJpbmcoKSwgMClcclxufSk7XHJcblxyXG5SZWdpc3RlckNvbW1hbmQoJ21pZ3JhdGUnLCBhc3luYyAoc291cmNlOiBudW1iZXIpID0+IHtcclxuXHRzb3VyY2UgPSBzb3VyY2UgIT09IDAgPyBzb3VyY2UgOiBwYXJzZUludChnZXRQbGF5ZXJzKClbMF0pXHJcblx0Y29uc3QgYmxfYXBwZWFyYW5jZSA9IGV4cG9ydHMuYmxfYXBwZWFyYW5jZTtcclxuXHRjb25zdCBjb25maWcgPSBibF9hcHBlYXJhbmNlLmNvbmZpZygpO1xyXG5cdGNvbnN0IGltcG9ydGVkTW9kdWxlID0gYXdhaXQgaW1wb3J0KGAuL21pZ3JhdGUvJHtjb25maWcucHJldmlvdXNDbG90aGluZyA9PT0gJ2ZpdmVtLWFwcGVhcmFuY2UnID8gJ2ZpdmVtJyA6IGNvbmZpZy5wcmV2aW91c0Nsb3RoaW5nfS50c2ApXHJcblx0aW1wb3J0ZWRNb2R1bGUuZGVmYXVsdChzb3VyY2UpXHJcbn0sIGZhbHNlKTtcclxuXHJcbmNvcmUuUmVnaXN0ZXJVc2FibGVJdGVtKCdjbG90aCcsIGFzeW5jIChzb3VyY2U6IG51bWJlciwgc2xvdDogbnVtYmVyLCBtZXRhZGF0YToge291dGZpdDogT3V0Zml0LCBsYWJlbDogc3RyaW5nfSkgPT4ge1xyXG5cdGNvbnN0IHBsYXllciA9IGNvcmUuR2V0UGxheWVyKHNvdXJjZSlcclxuXHRpZiAocGxheWVyPy5yZW1vdmVJdGVtKCdjbG90aCcsIDEsIHNsb3QpKSBcclxuXHRcdGVtaXROZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnVzZU91dGZpdCcsIHNvdXJjZSwgbWV0YWRhdGEub3V0Zml0KVxyXG59KSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBVU8sU0FBUyxzQkFBc0IsV0FBbUIsYUFBcUIsTUFBYTtBQUN2RixNQUFJO0FBQ0osS0FBRztBQUNDLFVBQU0sR0FBRyxTQUFTLElBQUksS0FBSyxNQUFNLEtBQUssT0FBTyxLQUFLLE1BQVMsRUFBRSxDQUFDLElBQUksUUFBUTtBQUFBLEVBQzlFLFNBQVMsYUFBYSxHQUFHO0FBQ3pCLFVBQVEsVUFBVSxTQUFTLElBQUksVUFBVSxjQUFjLEtBQUssR0FBRyxJQUFJO0FBQ25FLFNBQU8sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM1QixpQkFBYSxHQUFHLElBQUk7QUFBQSxFQUN4QixDQUFDO0FBQ0w7QUFFTyxTQUFTLGlCQUFpQixXQUFtQixJQUErQztBQUMvRixRQUFNLFVBQVUsU0FBUyxJQUFJLE9BQU8sVUFBa0IsUUFBZ0IsU0FBZ0I7QUFDbEYsVUFBTSxNQUFNO0FBQ1osUUFBSTtBQUVKLFFBQUk7QUFDRixpQkFBVyxNQUFNLEdBQUcsS0FBSyxHQUFHLElBQUk7QUFBQSxJQUNsQyxTQUFTLEdBQVE7QUFDZixjQUFRLE1BQU0sbURBQW1ELFNBQVMsRUFBRTtBQUM1RSxjQUFRLElBQUksS0FBSyxFQUFFLEtBQUssSUFBSTtBQUFBLElBQzlCO0FBRUEsWUFBUSxVQUFVLFFBQVEsSUFBSSxLQUFLLEtBQUssUUFBUTtBQUFBLEVBQ2xELENBQUM7QUFDUDtBQW5DQSxJQUVNLGNBRUEsY0FpQ087QUFyQ2I7QUFBQTtBQUVBLElBQU0sZUFBZSx1QkFBdUI7QUFFNUMsSUFBTSxlQUFlLENBQUM7QUFDdEIsVUFBTSxVQUFVLFlBQVksSUFBSSxDQUFDLFFBQVEsU0FBUztBQUM5QyxZQUFNLFVBQVUsYUFBYSxHQUFHO0FBQ2hDLGFBQU8sV0FBVyxRQUFRLEdBQUcsSUFBSTtBQUFBLElBQ3JDLENBQUM7QUFFZTtBQVdBO0FBZ0JULElBQU0sT0FBTyxRQUFRLFVBQVUsS0FBSztBQUFBO0FBQUE7Ozs7Ozs7O0FDVzNDLFFBQU0sYUFBdUIsQ0FBQTtBQUU3QixhQUFTLE9BQU8sV0FBb0IsU0FBZTtBQUNqRCxVQUFJLENBQUM7QUFBVyxjQUFNLElBQUksVUFBVSxPQUFPO0lBQzdDO0FBRlM7QUFJVCxRQUFNLFdBQVcsd0JBQUMsT0FBNEIsUUFBYyxJQUFlLGdCQUFzQjtBQUMvRixVQUFJLE9BQU8sVUFBVTtBQUFVLGdCQUFRLFdBQVcsS0FBSztBQUV2RCxVQUFJLGFBQWE7QUFDZixlQUFPLE9BQU8sVUFBVSxVQUFVLDRDQUE0QyxPQUFPLEtBQUssRUFBRTthQUN2RjtBQUNMLGVBQU8sT0FBTyxVQUFVLFVBQVUsNENBQTRDLE9BQU8sS0FBSyxFQUFFOztBQUc5RixVQUFJLFFBQVE7QUFDVixjQUFNLFlBQVksT0FBTztBQUN6QixlQUNFLGNBQWMsWUFBWSxjQUFjLFlBQ3hDLHlEQUF5RCxTQUFTLEVBQUU7QUFHdEUsWUFBSSxDQUFDLE1BQU0sY0FBYyxZQUFZO0FBQ25DLGVBQUs7QUFDTCxtQkFBUzs7O0FBSWIsVUFBSSxPQUFPO0FBQVcsZUFBTyxPQUFPLE9BQU8sWUFBWSw4Q0FBOEMsT0FBTyxFQUFFLEVBQUU7QUFFaEgsYUFBTyxDQUFDLE9BQU8sUUFBUSxFQUFFO0lBQzNCLEdBekJpQjtBQTJCakIsUUFBTSxNQUFNLE9BQU8sUUFBUTtBQUMzQixRQUFNLHNCQUFzQix1QkFBc0I7QUFFbEQsYUFBUyxRQUFRLFFBQWdCLE9BQTRCLFFBQWU7QUFDMUUsYUFBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVU7QUFDckMsWUFBSSxNQUFNLEVBQ1IsT0FDQSxRQUNBLENBQUMsUUFBUSxVQUFTO0FBQ2hCLGNBQUk7QUFBTyxtQkFBTyxPQUFPLEtBQUs7QUFDOUIsa0JBQVEsTUFBTTtRQUNoQixHQUNBLHFCQUNBLElBQUk7TUFFUixDQUFDO0lBQ0g7QUFiUztBQWVJLElBQUFBLFNBQUEsVUFBbUI7TUFDOUIsTUFBTSxPQUFLO0FBQ1QsZUFBTyxPQUFPLFVBQVUsVUFBVSxvQ0FBb0MsT0FBTyxLQUFLLEVBQUU7QUFFcEYsZUFBTyxXQUFXLEtBQUssS0FBSztNQUM5QjtNQUNBLE1BQU0sVUFBUTtBQUNaLHFCQUFhLFlBQVc7QUFDdEIsaUJBQU8saUJBQWlCLFNBQVMsTUFBTTtBQUFXLGtCQUFNLElBQUksUUFBUSxDQUFDLFlBQVksV0FBVyxTQUFTLEVBQUUsQ0FBQztBQUN4RyxtQkFBUTtRQUNWLENBQUM7TUFDSDtNQUNBLE1BQU0sTUFBTSxPQUFPLFFBQVEsSUFBRTtBQUMzQixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFNBQVMsT0FBTyxNQUFNO0FBQ25ELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sT0FBTyxPQUFPLFFBQVEsSUFBRTtBQUM1QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVUsT0FBTyxNQUFNO0FBQ3BELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sT0FBTyxPQUFPLFFBQVEsSUFBRTtBQUM1QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVUsT0FBTyxNQUFNO0FBQ3BELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sT0FBTyxPQUFPLFFBQVEsSUFBRTtBQUM1QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVUsT0FBTyxNQUFNO0FBQ3BELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sT0FBTyxPQUFPLFFBQVEsSUFBRTtBQUM1QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVUsT0FBTyxNQUFNO0FBQ3BELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sUUFBUSxPQUFPLFFBQVEsSUFBRTtBQUM3QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFdBQVcsT0FBTyxNQUFNO0FBQ3JELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sV0FBVyxPQUFPLFFBQVEsSUFBRTtBQUNoQyxTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLGNBQWMsT0FBTyxNQUFNO0FBQ3hELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0s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LE1BQU07QUFDcEQseUJBQXVCLE9BQU8sU0FBUyxHQUFHLE1BQU07QUFDakQsQ0FBQztBQUVELE1BQU0sMkNBQTJDLE1BQU07QUFDdEQseUJBQXVCLE9BQU8sU0FBUyxHQUFHLENBQUM7QUFDNUMsQ0FBQztBQUVELGdCQUFnQixXQUFXLE9BQU9DLFlBQW1CO0FBQ3BELEVBQUFBLFVBQVNBLFlBQVcsSUFBSUEsVUFBUyxTQUFTLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDekQsUUFBTSxnQkFBZ0IsUUFBUTtBQUM5QixRQUFNLFNBQVMsY0FBYyxPQUFPO0FBQ3BDLFFBQU0saUJBQWlCLE1BQWEsbUNBQWEsT0FBTyxxQkFBcUIscUJBQXFCLFVBQVUsT0FBTyxnQkFBZ0I7QUFDbkksaUJBQWUsUUFBUUEsT0FBTTtBQUM5QixHQUFHLEtBQUs7QUFFUixLQUFLLG1CQUFtQixTQUFTLE9BQU9BLFNBQWdCLE1BQWMsYUFBOEM7QUFDbkgsUUFBTSxTQUFTLEtBQUssVUFBVUEsT0FBTTtBQUNwQyxNQUFJLFFBQVEsV0FBVyxTQUFTLEdBQUcsSUFBSTtBQUN0QyxZQUFRLGtDQUFrQ0EsU0FBUSxTQUFTLE1BQU07QUFDbkUsQ0FBQzsiLAogICJuYW1lcyI6IFsiZXhwb3J0cyIsICJpbXBvcnRfb3hteXNxbCIsICJyZXNwb25zZSIsICJpbXBvcnRfb3hteXNxbCIsICJkZWxheSIsICJtaWdyYXRlIiwgInJlc3BvbnNlIiwgImltcG9ydF9veG15c3FsIiwgImRlbGF5IiwgIm1pZ3JhdGUiLCAicmVzcG9uc2UiLCAiaW1wb3J0X294bXlzcWwiLCAic291cmNlIl0KfQo=
