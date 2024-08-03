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
  emitNet(`__ox_cb_${eventName}`, playerId, resourceName, key, ...args);
  return new Promise((resolve) => {
    activeEvents[key] = resolve;
  });
}
function onClientCallback(eventName, cb) {
  onNet(`__ox_cb_${eventName}`, async (resource, key, ...args) => {
    const src = source;
    let response;
    try {
      response = await cb(src, ...args);
    } catch (e) {
      console.error(`an error occurred while handling callback event ${eventName} | Error: `, e.message);
    }
    emitNet(`__ox_cb_${resource}`, src, key, response);
  });
}
var resourceName, activeEvents, core;
var init_utils = __esm({
  "src/server/utils/index.ts"() {
    resourceName = GetCurrentResourceName();
    activeEvents = {};
    onNet(`__ox_cb_${resourceName}`, (key, ...args) => {
      const resolve = activeEvents[key];
      return resolve && resolve(...args);
    });
    __name(triggerClientCallback, "triggerClientCallback");
    __name(onClientCallback, "onClientCallback");
    core = exports.bl_bridge.core();
  }
});

// node_modules/.pnpm/@overextended+oxmysql@1.3.0/node_modules/@overextended/oxmysql/MySQL.js
var require_MySQL = __commonJS({
  "node_modules/.pnpm/@overextended+oxmysql@1.3.0/node_modules/@overextended/oxmysql/MySQL.js"(exports2) {
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
        outfit: JSON.parse(outfit.outfit)
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
import_oxmysql5.oxmysql.ready(() => {
  import_oxmysql5.oxmysql.query(`CREATE TABLE IF NOT EXISTS appearance (
		id varchar(100) NOT NULL,
		skin longtext DEFAULT NULL,
		clothes longtext DEFAULT NULL,
		tattoos  longtext DEFAULT NULL,
		PRIMARY KEY (id)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8;`);
  import_oxmysql5.oxmysql.query(`CREATE TABLE IF NOT EXISTS outfits (
		id int NOT NULL AUTO_INCREMENT,
		player_id varchar(100) NOT NULL,
		label varchar(100) NOT NULL,
		outfit longtext DEFAULT NULL,
		PRIMARY KEY (id)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8;`);
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3NlcnZlci91dGlscy9pbmRleC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQG92ZXJleHRlbmRlZCtveG15c3FsQDEuMy4wL25vZGVfbW9kdWxlcy9Ab3ZlcmV4dGVuZGVkL294bXlzcWwvTXlTUUwudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9hcHBlYXJhbmNlLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvbWlncmF0ZS9lc3gudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9taWdyYXRlL2ZpdmVtLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvbWlncmF0ZS9pbGxlbml1bS50cyIsICIuLi8uLi9zcmMvc2VydmVyL21pZ3JhdGUvcWIudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvL2h0dHBzOi8vZ2l0aHViLmNvbS9vdmVyZXh0ZW5kZWQvb3hfbGliL2Jsb2IvbWFzdGVyL3BhY2thZ2Uvc2VydmVyL3Jlc291cmNlL2NhbGxiYWNrL2luZGV4LnRzXHJcblxyXG5jb25zdCByZXNvdXJjZU5hbWUgPSBHZXRDdXJyZW50UmVzb3VyY2VOYW1lKClcclxuXHJcbmNvbnN0IGFjdGl2ZUV2ZW50cyA9IHt9O1xyXG5vbk5ldChgX19veF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5LCAuLi5hcmdzKSA9PiB7XHJcbiAgICBjb25zdCByZXNvbHZlID0gYWN0aXZlRXZlbnRzW2tleV07XHJcbiAgICByZXR1cm4gcmVzb2x2ZSAmJiByZXNvbHZlKC4uLmFyZ3MpO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2soZXZlbnROYW1lOiBzdHJpbmcsIHBsYXllcklkOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9OiR7cGxheWVySWR9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuICAgIGVtaXROZXQoYF9fb3hfY2JfJHtldmVudE5hbWV9YCwgcGxheWVySWQsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGFjdGl2ZUV2ZW50c1trZXldID0gcmVzb2x2ZTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb25DbGllbnRDYWxsYmFjayhldmVudE5hbWU6IHN0cmluZywgY2I6IChwbGF5ZXJJZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSkgPT4gYW55KSB7XHJcbiAgICBvbk5ldChgX19veF9jYl8ke2V2ZW50TmFtZX1gLCBhc3luYyAocmVzb3VyY2U6IHN0cmluZywga2V5OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3JjID0gc291cmNlO1xyXG4gICAgICAgIGxldCByZXNwb25zZTogYW55O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IGNiKHNyYywgLi4uYXJncyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGhhbmRsaW5nIGNhbGxiYWNrIGV2ZW50ICR7ZXZlbnROYW1lfSB8IEVycm9yOiBgLCBlLm1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZW1pdE5ldChgX19veF9jYl8ke3Jlc291cmNlfWAsIHNyYywga2V5LCByZXNwb25zZSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNvcmUgPSBleHBvcnRzLmJsX2JyaWRnZS5jb3JlKClcclxuIiwgInR5cGUgUXVlcnkgPSBzdHJpbmcgfCBudW1iZXI7XHJcbnR5cGUgUGFyYW1zID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmtub3duW10gfCBGdW5jdGlvbjtcclxudHlwZSBDYWxsYmFjazxUPiA9IChyZXN1bHQ6IFQgfCBudWxsKSA9PiB2b2lkO1xyXG5cclxudHlwZSBUcmFuc2FjdGlvbiA9XHJcbiAgfCBzdHJpbmdbXVxyXG4gIHwgW3N0cmluZywgUGFyYW1zXVtdXHJcbiAgfCB7IHF1ZXJ5OiBzdHJpbmc7IHZhbHVlczogUGFyYW1zIH1bXVxyXG4gIHwgeyBxdWVyeTogc3RyaW5nOyBwYXJhbWV0ZXJzOiBQYXJhbXMgfVtdO1xyXG5cclxuaW50ZXJmYWNlIFJlc3VsdCB7XHJcbiAgW2NvbHVtbjogc3RyaW5nIHwgbnVtYmVyXTogYW55O1xyXG4gIGFmZmVjdGVkUm93cz86IG51bWJlcjtcclxuICBmaWVsZENvdW50PzogbnVtYmVyO1xyXG4gIGluZm8/OiBzdHJpbmc7XHJcbiAgaW5zZXJ0SWQ/OiBudW1iZXI7XHJcbiAgc2VydmVyU3RhdHVzPzogbnVtYmVyO1xyXG4gIHdhcm5pbmdTdGF0dXM/OiBudW1iZXI7XHJcbiAgY2hhbmdlZFJvd3M/OiBudW1iZXI7XHJcbn1cclxuXHJcbmludGVyZmFjZSBSb3cge1xyXG4gIFtjb2x1bW46IHN0cmluZyB8IG51bWJlcl06IHVua25vd247XHJcbn1cclxuXHJcbmludGVyZmFjZSBPeE15U1FMIHtcclxuICBzdG9yZTogKHF1ZXJ5OiBzdHJpbmcpID0+IHZvaWQ7XHJcbiAgcmVhZHk6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICBxdWVyeTogPFQgPSBSZXN1bHQgfCBudWxsPihxdWVyeTogUXVlcnksIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPFQ+LCBjYj86IENhbGxiYWNrPFQ+KSA9PiBQcm9taXNlPFQ+O1xyXG4gIHNpbmdsZTogPFQgPSBSb3cgfCBudWxsPihcclxuICAgIHF1ZXJ5OiBRdWVyeSxcclxuICAgIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PixcclxuICAgIGNiPzogQ2FsbGJhY2s8RXhjbHVkZTxULCBbXT4+XHJcbiAgKSA9PiBQcm9taXNlPEV4Y2x1ZGU8VCwgW10+PjtcclxuICBzY2FsYXI6IDxUID0gdW5rbm93biB8IG51bGw+KFxyXG4gICAgcXVlcnk6IFF1ZXJ5LFxyXG4gICAgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8RXhjbHVkZTxULCBbXT4+LFxyXG4gICAgY2I/OiBDYWxsYmFjazxFeGNsdWRlPFQsIFtdPj5cclxuICApID0+IFByb21pc2U8RXhjbHVkZTxULCBbXT4+O1xyXG4gIHVwZGF0ZTogPFQgPSBudW1iZXIgfCBudWxsPihxdWVyeTogUXVlcnksIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPFQ+LCBjYj86IENhbGxiYWNrPFQ+KSA9PiBQcm9taXNlPFQ+O1xyXG4gIGluc2VydDogPFQgPSBudW1iZXIgfCBudWxsPihxdWVyeTogUXVlcnksIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPFQ+LCBjYj86IENhbGxiYWNrPFQ+KSA9PiBQcm9taXNlPFQ+O1xyXG4gIHByZXBhcmU6IDxUID0gYW55PihxdWVyeTogUXVlcnksIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPFQ+LCBjYj86IENhbGxiYWNrPFQ+KSA9PiBQcm9taXNlPFQ+O1xyXG4gIHJhd0V4ZWN1dGU6IDxUID0gUmVzdWx0IHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICB0cmFuc2FjdGlvbjogKHF1ZXJ5OiBUcmFuc2FjdGlvbiwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8Ym9vbGVhbj4sIGNiPzogQ2FsbGJhY2s8Ym9vbGVhbj4pID0+IFByb21pc2U8Ym9vbGVhbj47XHJcbiAgaXNSZWFkeTogKCkgPT4gYm9vbGVhbjtcclxuICBhd2FpdENvbm5lY3Rpb246ICgpID0+IFByb21pc2U8dHJ1ZT47XHJcbn1cclxuXHJcbmNvbnN0IFF1ZXJ5U3RvcmU6IHN0cmluZ1tdID0gW107XHJcblxyXG5mdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uOiBib29sZWFuLCBtZXNzYWdlOiBzdHJpbmcpIHtcclxuICBpZiAoIWNvbmRpdGlvbikgdGhyb3cgbmV3IFR5cGVFcnJvcihtZXNzYWdlKTtcclxufVxyXG5cclxuY29uc3Qgc2FmZUFyZ3MgPSAocXVlcnk6IFF1ZXJ5IHwgVHJhbnNhY3Rpb24sIHBhcmFtcz86IGFueSwgY2I/OiBGdW5jdGlvbiwgdHJhbnNhY3Rpb24/OiB0cnVlKSA9PiB7XHJcbiAgaWYgKHR5cGVvZiBxdWVyeSA9PT0gJ251bWJlcicpIHF1ZXJ5ID0gUXVlcnlTdG9yZVtxdWVyeV07XHJcblxyXG4gIGlmICh0cmFuc2FjdGlvbikge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBxdWVyeSA9PT0gJ29iamVjdCcsIGBGaXJzdCBhcmd1bWVudCBleHBlY3RlZCBvYmplY3QsIHJlY2lldmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIHF1ZXJ5ID09PSAnc3RyaW5nJywgYEZpcnN0IGFyZ3VtZW50IGV4cGVjdGVkIHN0cmluZywgcmVjZWl2ZWQgJHt0eXBlb2YgcXVlcnl9YCk7XHJcbiAgfVxyXG5cclxuICBpZiAocGFyYW1zKSB7XHJcbiAgICBjb25zdCBwYXJhbVR5cGUgPSB0eXBlb2YgcGFyYW1zO1xyXG4gICAgYXNzZXJ0KFxyXG4gICAgICBwYXJhbVR5cGUgPT09ICdvYmplY3QnIHx8IHBhcmFtVHlwZSA9PT0gJ2Z1bmN0aW9uJyxcclxuICAgICAgYFNlY29uZCBhcmd1bWVudCBleHBlY3RlZCBvYmplY3Qgb3IgZnVuY3Rpb24sIHJlY2VpdmVkICR7cGFyYW1UeXBlfWBcclxuICAgICk7XHJcblxyXG4gICAgaWYgKCFjYiAmJiBwYXJhbVR5cGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgY2IgPSBwYXJhbXM7XHJcbiAgICAgIHBhcmFtcyA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmIChjYiAhPT0gdW5kZWZpbmVkKSBhc3NlcnQodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nLCBgVGhpcmQgYXJndW1lbnQgZXhwZWN0ZWQgZnVuY3Rpb24sIHJlY2VpdmVkICR7dHlwZW9mIGNifWApO1xyXG5cclxuICByZXR1cm4gW3F1ZXJ5LCBwYXJhbXMsIGNiXTtcclxufTtcclxuXHJcbmNvbnN0IGV4cCA9IGdsb2JhbC5leHBvcnRzLm94bXlzcWw7XHJcbmNvbnN0IGN1cnJlbnRSZXNvdXJjZU5hbWUgPSBHZXRDdXJyZW50UmVzb3VyY2VOYW1lKCk7XHJcblxyXG5mdW5jdGlvbiBleGVjdXRlKG1ldGhvZDogc3RyaW5nLCBxdWVyeTogUXVlcnkgfCBUcmFuc2FjdGlvbiwgcGFyYW1zPzogUGFyYW1zKSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGV4cFttZXRob2RdKFxyXG4gICAgICBxdWVyeSxcclxuICAgICAgcGFyYW1zLFxyXG4gICAgICAocmVzdWx0LCBlcnJvcikgPT4ge1xyXG4gICAgICAgIGlmIChlcnJvcikgcmV0dXJuIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xyXG4gICAgICB9LFxyXG4gICAgICBjdXJyZW50UmVzb3VyY2VOYW1lLFxyXG4gICAgICB0cnVlXHJcbiAgICApO1xyXG4gIH0pIGFzIGFueTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IG94bXlzcWw6IE94TXlTUUwgPSB7XHJcbiAgc3RvcmUocXVlcnkpIHtcclxuICAgIGFzc2VydCh0eXBlb2YgcXVlcnkgIT09ICdzdHJpbmcnLCBgUXVlcnkgZXhwZWN0cyBhIHN0cmluZywgcmVjZWl2ZWQgJHt0eXBlb2YgcXVlcnl9YCk7XHJcblxyXG4gICAgcmV0dXJuIFF1ZXJ5U3RvcmUucHVzaChxdWVyeSk7XHJcbiAgfSxcclxuICByZWFkeShjYWxsYmFjaykge1xyXG4gICAgc2V0SW1tZWRpYXRlKGFzeW5jICgpID0+IHtcclxuICAgICAgd2hpbGUgKEdldFJlc291cmNlU3RhdGUoJ294bXlzcWwnKSAhPT0gJ3N0YXJ0ZWQnKSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCA1MCkpO1xyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfSk7XHJcbiAgfSxcclxuICBhc3luYyBxdWVyeShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3F1ZXJ5JywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgc2luZ2xlKHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgnc2luZ2xlJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgc2NhbGFyKHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgnc2NhbGFyJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgdXBkYXRlKHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgndXBkYXRlJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgaW5zZXJ0KHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgnaW5zZXJ0JywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgcHJlcGFyZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3ByZXBhcmUnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyByYXdFeGVjdXRlKHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgncmF3RXhlY3V0ZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHRyYW5zYWN0aW9uKHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IsIHRydWUpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgndHJhbnNhY3Rpb24nLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBpc1JlYWR5KCkge1xyXG4gICAgcmV0dXJuIGV4cC5pc1JlYWR5KCk7XHJcbiAgfSxcclxuICBhc3luYyBhd2FpdENvbm5lY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gYXdhaXQgZXhwLmF3YWl0Q29ubmVjdGlvbigpO1xyXG4gIH0sXHJcbn07XHJcbiIsICJpbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xuaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCc7XG5cbmV4cG9ydCBjb25zdCBzYXZlQXBwZWFyYW5jZSA9IGFzeW5jIChzcmM6IHN0cmluZyB8IG51bWJlciwgZnJhbWV3b3JrSWQ6IHN0cmluZywgYXBwZWFyYW5jZTogVEFwcGVhcmFuY2UpID0+IHtcblx0Y29uc3QgY2xvdGhlcyA9IHtcblx0XHRkcmF3YWJsZXM6IGFwcGVhcmFuY2UuZHJhd2FibGVzLFxuXHRcdHByb3BzOiBhcHBlYXJhbmNlLnByb3BzLFxuXHRcdGhlYWRPdmVybGF5OiBhcHBlYXJhbmNlLmhlYWRPdmVybGF5LFxuXHR9O1xuXG5cdGNvbnN0IHNraW4gPSB7XG5cdFx0aGVhZEJsZW5kOiBhcHBlYXJhbmNlLmhlYWRCbGVuZCxcblx0XHRoZWFkU3RydWN0dXJlOiBhcHBlYXJhbmNlLmhlYWRTdHJ1Y3R1cmUsXG5cdFx0aGFpckNvbG9yOiBhcHBlYXJhbmNlLmhhaXJDb2xvcixcblx0XHRtb2RlbDogYXBwZWFyYW5jZS5tb2RlbCxcblx0fTtcblxuXHRjb25zdCB0YXR0b29zID0gYXBwZWFyYW5jZS50YXR0b29zIHx8IFtdO1xuXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcblx0XHQnSU5TRVJUIElOVE8gYXBwZWFyYW5jZSAoaWQsIGNsb3RoZXMsIHNraW4sIHRhdHRvb3MpIFZBTFVFUyAoPywgPywgPywgPykgT04gRFVQTElDQVRFIEtFWSBVUERBVEUgY2xvdGhlcyA9IFZBTFVFUyhjbG90aGVzKSwgc2tpbiA9IFZBTFVFUyhza2luKSwgdGF0dG9vcyA9IFZBTFVFUyh0YXR0b29zKTsnLFxuXHRcdFtcblx0XHRcdGZyYW1ld29ya0lkLFxuXHRcdFx0SlNPTi5zdHJpbmdpZnkoY2xvdGhlcyksXG5cdFx0XHRKU09OLnN0cmluZ2lmeShza2luKSxcblx0XHRcdEpTT04uc3RyaW5naWZ5KHRhdHRvb3MpLFxuXHRcdF1cblx0KTtcblxuXHRyZXR1cm4gcmVzdWx0O1xufSIsICIiLCAiaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCc7XG5pbXBvcnQgeyB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2sgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBzYXZlQXBwZWFyYW5jZSB9IGZyb20gJy4uL2FwcGVhcmFuY2UnO1xuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcblxuY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xuXG5jb25zdCBtaWdyYXRlID0gYXN5bmMgKHNyYzogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IGFueSA9IGF3YWl0IG94bXlzcWwucXVlcnkoJ1NFTEVDVCAqIEZST00gYHBsYXllcnNgJyk7XG4gICAgaWYgKCFyZXNwb25zZSkgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChlbGVtZW50LnNraW4pIHtcbiAgICAgICAgICAgIGF3YWl0IHRyaWdnZXJDbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6bWlncmF0aW9uOnNldEFwcGVhcmFuY2UnLCBzcmMsIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZml2ZW0nLFxuICAgICAgICAgICAgICAgIGRhdGE6IEpTT04ucGFyc2UoZWxlbWVudC5za2luKVxuICAgICAgICAgICAgfSkgYXMgVEFwcGVhcmFuY2VcbiAgICAgICAgICAgIGF3YWl0IGRlbGF5KDEwMCk7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRyaWdnZXJDbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6Z2V0QXBwZWFyYW5jZScsIHNyYykgYXMgVEFwcGVhcmFuY2VcbiAgICAgICAgICAgIGF3YWl0IHNhdmVBcHBlYXJhbmNlKHNyYywgZWxlbWVudC5jaXRpemVuaWQsIHJlc3BvbnNlKVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdDb252ZXJ0ZWQgJysgcmVzcG9uc2UubGVuZ3RoICsgJyBhcHBlYXJhbmNlcycpXG59O1xuXG5leHBvcnQgZGVmYXVsdCBtaWdyYXRlIiwgImltcG9ydCB7IG94bXlzcWwgfSBmcm9tICdAb3ZlcmV4dGVuZGVkL294bXlzcWwnO1xuaW1wb3J0IHsgdHJpZ2dlckNsaWVudENhbGxiYWNrIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgc2F2ZUFwcGVhcmFuY2UgfSBmcm9tICcuLi9hcHBlYXJhbmNlJztcbmltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSAnQHR5cGluZ3MvYXBwZWFyYW5jZSc7XG5cbmNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcblxuY29uc3QgbWlncmF0ZSA9IGFzeW5jIChzcmM6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlOiBhbnkgPSBhd2FpdCBveG15c3FsLnF1ZXJ5KCdTRUxFQ1QgKiBGUk9NIGBwbGF5ZXJza2luc2AgV0hFUkUgYWN0aXZlID0gMWAnKTtcbiAgICBpZiAoIXJlc3BvbnNlKSByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgcmVzcG9uc2UpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuc2tpbikge1xuICAgICAgICAgICAgYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDptaWdyYXRpb246c2V0QXBwZWFyYW5jZScsIHNyYywge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdpbGxlbml1bScsXG4gICAgICAgICAgICAgICAgZGF0YTogSlNPTi5wYXJzZShlbGVtZW50LnNraW4pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgYXdhaXQgZGVsYXkoMTAwKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDpnZXRBcHBlYXJhbmNlJywgc3JjKSBhcyBUQXBwZWFyYW5jZVxuICAgICAgICAgICAgYXdhaXQgc2F2ZUFwcGVhcmFuY2Uoc3JjLCBlbGVtZW50LmNpdGl6ZW5pZCwgcmVzcG9uc2UpXG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coJ0NvbnZlcnRlZCAnKyByZXNwb25zZS5sZW5ndGggKyAnIGFwcGVhcmFuY2VzJylcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pZ3JhdGUiLCAiaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCc7XG5pbXBvcnQgeyB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2sgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBzYXZlQXBwZWFyYW5jZSB9IGZyb20gJy4uL2FwcGVhcmFuY2UnO1xuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcblxuY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xuXG5jb25zdCBtaWdyYXRlID0gYXN5bmMgKHNyYzogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IGFueSA9IGF3YWl0IG94bXlzcWwucXVlcnkoJ1NFTEVDVCAqIEZST00gYHBsYXllcnNraW5zYCBXSEVSRSBhY3RpdmUgPSAxJyk7XG4gICAgaWYgKCFyZXNwb25zZSkgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHJlc3BvbnNlKSB7XG4gICAgICAgIGVtaXROZXQoJ3FiLWNsb3RoZXM6bG9hZFNraW4nLCBzcmMsIDAsIGVsZW1lbnQubW9kZWwsIGVsZW1lbnQuc2tpbik7XG4gICAgICAgIGF3YWl0IGRlbGF5KDIwMCk7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDpnZXRBcHBlYXJhbmNlJywgc3JjKSBhcyBUQXBwZWFyYW5jZVxuICAgICAgICBhd2FpdCBzYXZlQXBwZWFyYW5jZShzcmMsIGVsZW1lbnQuY2l0aXplbmlkLCByZXNwb25zZSlcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ0NvbnZlcnRlZCAnKyByZXNwb25zZS5sZW5ndGggKyAnIGFwcGVhcmFuY2VzJylcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pZ3JhdGUiLCAiaW1wb3J0IHsgY29yZSwgb25DbGllbnRDYWxsYmFjayB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBveG15c3FsIH0gZnJvbSAnQG92ZXJleHRlbmRlZC9veG15c3FsJztcclxuaW1wb3J0IHsgT3V0Zml0IH0gZnJvbSAnQHR5cGluZ3Mvb3V0Zml0cyc7XHJcbmltcG9ydCB7IHNhdmVBcHBlYXJhbmNlIH0gZnJvbSAnLi9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgU2tpbkRCIH0gZnJvbSAnQHR5cGluZ3MvYXBwZWFyYW5jZSc7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRPdXRmaXRzJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQpID0+IHtcclxuXHRjb25zdCBqb2IgPSBjb3JlLkdldFBsYXllcihzcmMpLmpvYlxyXG5cdGxldCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1QgKiBGUk9NIG91dGZpdHMgV0hFUkUgcGxheWVyX2lkID0gPyBPUiAoam9ibmFtZSA9ID8gQU5EIGpvYnJhbmsgPD0gPyknLFxyXG5cdFx0W2ZyYW1ld29ya0lkLCBqb2IubmFtZSwgam9iLmdyYWRlLm5hbWVdXHJcblx0KTtcclxuXHRpZiAoIXJlc3BvbnNlKSByZXR1cm4gW107XHJcblxyXG5cdGlmICghQXJyYXkuaXNBcnJheShyZXNwb25zZSkpIHtcclxuXHRcdHJlc3BvbnNlID0gW3Jlc3BvbnNlXTtcclxuXHR9XHJcblxyXG5cdGNvbnN0IG91dGZpdHMgPSByZXNwb25zZS5tYXAoXHJcblx0XHQob3V0Zml0OiB7IGlkOiBudW1iZXI7IGxhYmVsOiBzdHJpbmc7IG91dGZpdDogc3RyaW5nIH0pID0+IHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRpZDogb3V0Zml0LmlkLFxyXG5cdFx0XHRcdGxhYmVsOiBvdXRmaXQubGFiZWwsXHJcblx0XHRcdFx0b3V0Zml0OiBKU09OLnBhcnNlKG91dGZpdC5vdXRmaXQpLFxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdCk7XHJcblxyXG5cdHJldHVybiBvdXRmaXRzO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlbmFtZU91dGZpdCcsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBkYXRhKSA9PiB7XHJcblx0Y29uc3QgaWQgPSBkYXRhLmlkO1xyXG5cdGNvbnN0IGxhYmVsID0gZGF0YS5sYWJlbDtcclxuXHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcblx0XHQnVVBEQVRFIG91dGZpdHMgU0VUIGxhYmVsID0gPyBXSEVSRSBwbGF5ZXJfaWQgPSA/IEFORCBpZCA9ID8nLFxyXG5cdFx0W2xhYmVsLCBmcmFtZXdvcmtJZCwgaWRdXHJcblx0KTtcclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmRlbGV0ZU91dGZpdCcsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBpZCkgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxyXG5cdFx0J0RFTEVURSBGUk9NIG91dGZpdHMgV0hFUkUgcGxheWVyX2lkID0gPyBBTkQgaWQgPSA/JyxcclxuXHRcdFtmcmFtZXdvcmtJZCwgaWRdXHJcblx0KTtcclxuXHRyZXR1cm4gcmVzdWx0ID4gMDtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlT3V0Zml0JywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQsIGRhdGE6IE91dGZpdCkgPT4ge1xyXG5cdGNvbnN0IGpvYm5hbWUgPSBkYXRhLmpvYj8ubmFtZSB8fCBudWxsO1xyXG5cdGNvbnN0IGpvYnJhbmsgPSBkYXRhLmpvYj8ucmFuayB8fCBudWxsO1xyXG5cdGNvbnN0IGlkID0gYXdhaXQgb3hteXNxbC5pbnNlcnQoXHJcblx0XHQnSU5TRVJUIElOVE8gb3V0Zml0cyAocGxheWVyX2lkLCBsYWJlbCwgb3V0Zml0LCBqb2JuYW1lLCBqb2JyYW5rKSBWQUxVRVMgKD8sID8sID8sID8sID8pJyxcclxuXHRcdFtmcmFtZXdvcmtJZCwgZGF0YS5sYWJlbCwgSlNPTi5zdHJpbmdpZnkoZGF0YS5vdXRmaXQpLCBqb2JuYW1lLCBqb2JyYW5rXVxyXG5cdCk7XHJcblx0cmV0dXJuIGlkO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdyYWJPdXRmaXQnLCBhc3luYyAoc3JjLCBpZCkgPT4ge1xyXG5cdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG5cdFx0J1NFTEVDVCBvdXRmaXQgRlJPTSBvdXRmaXRzIFdIRVJFIGlkID0gPycsXHJcblx0XHRbaWRdXHJcblx0KTtcclxuXHRyZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSk7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6aXRlbU91dGZpdCcsIGFzeW5jIChzcmMsIGRhdGEpID0+IHtcclxuXHRjb25zdCBwbGF5ZXIgPSBjb3JlLkdldFBsYXllcihzcmMpXHJcblx0cGxheWVyLmFkZEl0ZW0oJ2Nsb3RoJywgMSwgZGF0YSlcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjppbXBvcnRPdXRmaXQnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCwgb3V0Zml0SWQsIG91dGZpdE5hbWUpID0+IHtcclxuICAgIGNvbnN0IFtyZXN1bHRdID0gYXdhaXQgb3hteXNxbC5xdWVyeShcclxuICAgICAgICAnU0VMRUNUIGxhYmVsLCBvdXRmaXQgRlJPTSBvdXRmaXRzIFdIRVJFIGlkID0gPycsXHJcbiAgICAgICAgW291dGZpdElkXVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIXJlc3VsdCkge1xyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnT3V0Zml0IG5vdCBmb3VuZCcgfTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuZXdJZCA9IGF3YWl0IG94bXlzcWwuaW5zZXJ0KFxyXG4gICAgICAgICdJTlNFUlQgSU5UTyBvdXRmaXRzIChwbGF5ZXJfaWQsIGxhYmVsLCBvdXRmaXQpIFZBTFVFUyAoPywgPywgPyknLFxyXG4gICAgICAgIFtmcmFtZXdvcmtJZCwgb3V0Zml0TmFtZSwgcmVzdWx0Lm91dGZpdF1cclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgbmV3SWQ6IG5ld0lkIH07XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZVNraW4nLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCwgc2tpbikgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxyXG5cdFx0J1VQREFURSBhcHBlYXJhbmNlIFNFVCBza2luID0gPyBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0W0pTT04uc3RyaW5naWZ5KHNraW4pLCBmcmFtZXdvcmtJZF1cclxuXHQpO1xyXG5cdHJldHVybiByZXN1bHQ7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUNsb3RoZXMnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCwgY2xvdGhlcykgPT4ge1xyXG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcblx0XHRcdCdVUERBVEUgYXBwZWFyYW5jZSBTRVQgY2xvdGhlcyA9ID8gV0hFUkUgaWQgPSA/JyxcclxuXHRcdFx0W0pTT04uc3RyaW5naWZ5KGNsb3RoZXMpLCBmcmFtZXdvcmtJZF1cclxuXHRcdCk7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuKTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVBcHBlYXJhbmNlJywgc2F2ZUFwcGVhcmFuY2UpO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZVRhdHRvb3MnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCwgdGF0dG9vcykgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxyXG5cdFx0J1VQREFURSBhcHBlYXJhbmNlIFNFVCB0YXR0b29zID0gPyBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0W0pTT04uc3RyaW5naWZ5KHRhdHRvb3MpLCBmcmFtZXdvcmtJZF1cclxuXHQpO1xyXG5cdHJldHVybiByZXN1bHQ7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0U2tpbicsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkKSA9PiB7XHJcblx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcblx0XHQnU0VMRUNUIHNraW4gRlJPTSBhcHBlYXJhbmNlIFdIRVJFIGlkID0gPycsXHJcblx0XHRbZnJhbWV3b3JrSWRdXHJcblx0KTtcclxuXHRyZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSk7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0Q2xvdGhlcycsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkKSA9PiB7XHJcblx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcblx0XHQnU0VMRUNUIGNsb3RoZXMgRlJPTSBhcHBlYXJhbmNlIFdIRVJFIGlkID0gPycsXHJcblx0XHRbZnJhbWV3b3JrSWRdXHJcblx0KTtcclxuXHRyZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSk7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0VGF0dG9vcycsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkKSA9PiB7XHJcblx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcblx0XHQnU0VMRUNUIHRhdHRvb3MgRlJPTSBhcHBlYXJhbmNlIFdIRVJFIGlkID0gPycsXHJcblx0XHRbZnJhbWV3b3JrSWRdXHJcblx0KTtcclxuXHRyZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSkgfHwgW107XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkKSA9PiB7XHJcblx0Y29uc3QgcmVzcG9uc2U6IFNraW5EQiA9IGF3YWl0IG94bXlzcWwuc2luZ2xlKFxyXG5cdFx0J1NFTEVDVCAqIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8gTElNSVQgMScsXHJcblx0XHRbZnJhbWV3b3JrSWRdXHJcblx0KTtcclxuXHRpZiAoIXJlc3BvbnNlKSByZXR1cm4gbnVsbDtcclxuXHRsZXQgYXBwZWFyYW5jZSA9IHtcclxuXHRcdC4uLkpTT04ucGFyc2UocmVzcG9uc2Uuc2tpbiksXHJcblx0XHQuLi5KU09OLnBhcnNlKHJlc3BvbnNlLmNsb3RoZXMpLFxyXG5cdFx0Li4uSlNPTi5wYXJzZShyZXNwb25zZS50YXR0b29zKSxcclxuXHR9XHJcblx0YXBwZWFyYW5jZS5pZCA9IHJlc3BvbnNlLmlkXHJcblx0cmV0dXJuIGFwcGVhcmFuY2U7XHJcbn0pO1xyXG5cclxub25OZXQoJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNldHJvdXRpbmdidWNrZXQnLCAoKSA9PiB7XHJcblx0U2V0UGxheWVyUm91dGluZ0J1Y2tldChzb3VyY2UudG9TdHJpbmcoKSwgc291cmNlKVxyXG59KTtcclxuXHJcbm9uTmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZXNldHJvdXRpbmdidWNrZXQnLCAoKSA9PiB7XHJcblx0U2V0UGxheWVyUm91dGluZ0J1Y2tldChzb3VyY2UudG9TdHJpbmcoKSwgMClcclxufSk7XHJcblxyXG5cclxuUmVnaXN0ZXJDb21tYW5kKCdtaWdyYXRlJywgYXN5bmMgKHNvdXJjZTogbnVtYmVyKSA9PiB7XHJcblx0c291cmNlID0gc291cmNlICE9PSAwID8gc291cmNlIDogcGFyc2VJbnQoZ2V0UGxheWVycygpWzBdKVxyXG5cdGNvbnN0IGJsX2FwcGVhcmFuY2UgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2U7XHJcblx0Y29uc3QgY29uZmlnID0gYmxfYXBwZWFyYW5jZS5jb25maWcoKTtcclxuXHRjb25zdCBpbXBvcnRlZE1vZHVsZSA9IGF3YWl0IGltcG9ydChgLi9taWdyYXRlLyR7Y29uZmlnLnByZXZpb3VzQ2xvdGhpbmcgPT09ICdmaXZlbS1hcHBlYXJhbmNlJyA/ICdmaXZlbScgOiBjb25maWcucHJldmlvdXNDbG90aGluZ30udHNgKVxyXG5cdGltcG9ydGVkTW9kdWxlLmRlZmF1bHQoc291cmNlKVxyXG59LCBmYWxzZSk7XHJcblxyXG5jb3JlLlJlZ2lzdGVyVXNhYmxlSXRlbSgnY2xvdGgnLCBhc3luYyAoc291cmNlOiBudW1iZXIsIHNsb3Q6IG51bWJlciwgbWV0YWRhdGE6IHtvdXRmaXQ6IE91dGZpdCwgbGFiZWw6IHN0cmluZ30pID0+IHtcclxuXHRjb25zdCBwbGF5ZXIgPSBjb3JlLkdldFBsYXllcihzb3VyY2UpXHJcblx0aWYgKHBsYXllcj8ucmVtb3ZlSXRlbSgnY2xvdGgnLCAxLCBzbG90KSkgXHJcblx0XHRlbWl0TmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjp1c2VPdXRmaXQnLCBzb3VyY2UsIG1ldGFkYXRhLm91dGZpdClcclxufSlcclxuXHJcbm94bXlzcWwucmVhZHkoKCkgPT4ge1xyXG5cdG94bXlzcWwucXVlcnkoYENSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGFwcGVhcmFuY2UgKFxyXG5cdFx0aWQgdmFyY2hhcigxMDApIE5PVCBOVUxMLFxyXG5cdFx0c2tpbiBsb25ndGV4dCBERUZBVUxUIE5VTEwsXHJcblx0XHRjbG90aGVzIGxvbmd0ZXh0IERFRkFVTFQgTlVMTCxcclxuXHRcdHRhdHRvb3MgIGxvbmd0ZXh0IERFRkFVTFQgTlVMTCxcclxuXHRcdFBSSU1BUlkgS0VZIChpZClcclxuXHQpIEVOR0lORT1Jbm5vREIgREVGQVVMVCBDSEFSU0VUPXV0Zjg7YClcclxuXHRcclxuXHRveG15c3FsLnF1ZXJ5KGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBvdXRmaXRzIChcclxuXHRcdGlkIGludCBOT1QgTlVMTCBBVVRPX0lOQ1JFTUVOVCxcclxuXHRcdHBsYXllcl9pZCB2YXJjaGFyKDEwMCkgTk9UIE5VTEwsXHJcblx0XHRsYWJlbCB2YXJjaGFyKDEwMCkgTk9UIE5VTEwsXHJcblx0XHRvdXRmaXQgbG9uZ3RleHQgREVGQVVMVCBOVUxMLFxyXG5cdFx0UFJJTUFSWSBLRVkgKGlkKVxyXG5cdCkgRU5HSU5FPUlubm9EQiBERUZBVUxUIENIQVJTRVQ9dXRmODtgKVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVVPLFNBQVMsc0JBQXNCLFdBQW1CLGFBQXFCLE1BQWE7QUFDdkYsTUFBSTtBQUNKLEtBQUc7QUFDQyxVQUFNLEdBQUcsU0FBUyxJQUFJLEtBQUssTUFBTSxLQUFLLE9BQU8sS0FBSyxNQUFTLEVBQUUsQ0FBQyxJQUFJLFFBQVE7QUFBQSxFQUM5RSxTQUFTLGFBQWEsR0FBRztBQUN6QixVQUFRLFdBQVcsU0FBUyxJQUFJLFVBQVUsY0FBYyxLQUFLLEdBQUcsSUFBSTtBQUNwRSxTQUFPLElBQUksUUFBUSxDQUFDLFlBQVk7QUFDNUIsaUJBQWEsR0FBRyxJQUFJO0FBQUEsRUFDeEIsQ0FBQztBQUNMO0FBRU8sU0FBUyxpQkFBaUIsV0FBbUIsSUFBK0M7QUFDL0YsUUFBTSxXQUFXLFNBQVMsSUFBSSxPQUFPLFVBQWtCLFFBQWdCLFNBQWdCO0FBQ25GLFVBQU0sTUFBTTtBQUNaLFFBQUk7QUFFSixRQUFJO0FBQ0EsaUJBQVcsTUFBTSxHQUFHLEtBQUssR0FBRyxJQUFJO0FBQUEsSUFDcEMsU0FBUyxHQUFRO0FBQ2IsY0FBUSxNQUFNLG1EQUFtRCxTQUFTLGNBQWMsRUFBRSxPQUFPO0FBQUEsSUFDckc7QUFFQSxZQUFRLFdBQVcsUUFBUSxJQUFJLEtBQUssS0FBSyxRQUFRO0FBQUEsRUFDckQsQ0FBQztBQUNMO0FBbENBLElBRU0sY0FFQSxjQWdDTztBQXBDYjtBQUFBO0FBRUEsSUFBTSxlQUFlLHVCQUF1QjtBQUU1QyxJQUFNLGVBQWUsQ0FBQztBQUN0QixVQUFNLFdBQVcsWUFBWSxJQUFJLENBQUMsUUFBUSxTQUFTO0FBQy9DLFlBQU0sVUFBVSxhQUFhLEdBQUc7QUFDaEMsYUFBTyxXQUFXLFFBQVEsR0FBRyxJQUFJO0FBQUEsSUFDckMsQ0FBQztBQUVlO0FBV0E7QUFlVCxJ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QUVELGlCQUFpQixzQ0FBc0MsT0FBTyxLQUFLLGdCQUFnQjtBQUNsRixRQUFNLFdBQW1CLE1BQU0sd0JBQVE7QUFBQSxJQUN0QztBQUFBLElBQ0EsQ0FBQyxXQUFXO0FBQUEsRUFDYjtBQUNBLE1BQUksQ0FBQztBQUFVLFdBQU87QUFDdEIsTUFBSSxhQUFhO0FBQUEsSUFDaEIsR0FBRyxLQUFLLE1BQU0sU0FBUyxJQUFJO0FBQUEsSUFDM0IsR0FBRyxLQUFLLE1BQU0sU0FBUyxPQUFPO0FBQUEsSUFDOUIsR0FBRyxLQUFLLE1BQU0sU0FBUyxPQUFPO0FBQUEsRUFDL0I7QUFDQSxhQUFXLEtBQUssU0FBUztBQUN6QixTQUFPO0FBQ1IsQ0FBQztBQUVELE1BQU0seUNBQXlDLE1BQU07QUFDcEQseUJBQXVCLE9BQU8sU0FBUyxHQUFHLE1BQU07QUFDakQsQ0FBQztBQUVELE1BQU0sMkNBQTJDLE1BQU07QUFDdEQseUJBQXVCLE9BQU8sU0FBUyxHQUFHLENBQUM7QUFDNUMsQ0FBQztBQUdELGdCQUFnQixXQUFXLE9BQU9DLFlBQW1CO0FBQ3BELEVBQUFBLFVBQVNBLFlBQVcsSUFBSUEsVUFBUyxTQUFTLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDekQsUUFBTSxnQkFBZ0IsUUFBUTtBQUM5QixRQUFNLFNBQVMsY0FBYyxPQUFPO0FBQ3BDLFFBQU0saUJBQWlCLE1BQWEsbUNBQWEsT0FBTyxxQkFBcUIscUJBQXFCLFVBQVUsT0FBTyxnQkFBZ0I7QUFDbkksaUJBQWUsUUFBUUEsT0FBTTtBQUM5QixHQUFHLEtBQUs7QUFFUixLQUFLLG1CQUFtQixTQUFTLE9BQU9BLFNBQWdCLE1BQWMsYUFBOEM7QUFDbkgsUUFBTSxTQUFTLEtBQUssVUFBVUEsT0FBTTtBQUNwQyxNQUFJLFFBQVEsV0FBVyxTQUFTLEdBQUcsSUFBSTtBQUN0QyxZQUFRLGtDQUFrQ0EsU0FBUSxTQUFTLE1BQU07QUFDbkUsQ0FBQztBQUVELHdCQUFRLE1BQU0sTUFBTTtBQUNuQiwwQkFBUSxNQUFNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHVDQU13QjtBQUV0QywwQkFBUSxNQUFNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHVDQU13QjtBQUN2QyxDQUFDOyIsCiAgIm5hbWVzIjogWyJleHBvcnRzIiwgImltcG9ydF9veG15c3FsIiwgInJlc3BvbnNlIiwgImltcG9ydF9veG15c3FsIiwgImRlbGF5IiwgIm1pZ3JhdGUiLCAicmVzcG9uc2UiLCAiaW1wb3J0X294bXlzcWwiLCAiZGVsYXkiLCAibWlncmF0ZSIsICJyZXNwb25zZSIsICJpbXBvcnRfb3hteXNxbCIsICJzb3VyY2UiXQp9Cg==
