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
var resourceName, activeEvents;
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
  let response = await import_oxmysql5.oxmysql.prepare(
    "SELECT * FROM outfits WHERE player_id = ?",
    [frameworkId]
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
  console.log("renameOutfit", frameworkId, label, id);
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
  console.log(
    frameworkId,
    data.label,
    data.outfit,
    JSON.stringify(data.outfit)
  );
  const id = await import_oxmysql5.oxmysql.insert(
    "INSERT INTO outfits (player_id, label, outfit) VALUES (?, ?, ?)",
    [frameworkId, data.label, JSON.stringify(data.outfit)]
  );
  console.log("id", id);
  return id;
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
  const response = await import_oxmysql5.oxmysql.prepare(
    "SELECT * FROM appearance WHERE id = ?",
    [frameworkId]
  );
  return JSON.parse(response);
});
RegisterCommand("migrate", async (source2) => {
  source2 = source2 !== 0 ? source2 : parseInt(getPlayers()[0]);
  const bl_appearance = exports.bl_appearance;
  const config = bl_appearance.config();
  const importedModule = await globImport_migrate_ts(`./migrate/${config.previousClothing === "fivem-appearance" ? "fivem" : config.previousClothing}.ts`);
  importedModule.default(source2);
}, false);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3NlcnZlci91dGlscy9pbmRleC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQG92ZXJleHRlbmRlZCtveG15c3FsQDEuMy4wL25vZGVfbW9kdWxlcy9Ab3ZlcmV4dGVuZGVkL294bXlzcWwvTXlTUUwudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9hcHBlYXJhbmNlLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvbWlncmF0ZS9lc3gudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9taWdyYXRlL2ZpdmVtLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvbWlncmF0ZS9pbGxlbml1bS50cyIsICIuLi8uLi9zcmMvc2VydmVyL21pZ3JhdGUvcWIudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvL2h0dHBzOi8vZ2l0aHViLmNvbS9vdmVyZXh0ZW5kZWQvb3hfbGliL2Jsb2IvbWFzdGVyL3BhY2thZ2Uvc2VydmVyL3Jlc291cmNlL2NhbGxiYWNrL2luZGV4LnRzXHJcblxyXG5jb25zdCByZXNvdXJjZU5hbWUgPSBHZXRDdXJyZW50UmVzb3VyY2VOYW1lKClcclxuXHJcbmNvbnN0IGFjdGl2ZUV2ZW50cyA9IHt9O1xyXG5vbk5ldChgX19veF9jYl8ke3Jlc291cmNlTmFtZX1gLCAoa2V5LCAuLi5hcmdzKSA9PiB7XHJcbiAgICBjb25zdCByZXNvbHZlID0gYWN0aXZlRXZlbnRzW2tleV07XHJcbiAgICByZXR1cm4gcmVzb2x2ZSAmJiByZXNvbHZlKC4uLmFyZ3MpO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2soZXZlbnROYW1lOiBzdHJpbmcsIHBsYXllcklkOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICBkbyB7XHJcbiAgICAgICAga2V5ID0gYCR7ZXZlbnROYW1lfToke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKyAxKSl9OiR7cGxheWVySWR9YDtcclxuICAgIH0gd2hpbGUgKGFjdGl2ZUV2ZW50c1trZXldKTtcclxuICAgIGVtaXROZXQoYF9fb3hfY2JfJHtldmVudE5hbWV9YCwgcGxheWVySWQsIHJlc291cmNlTmFtZSwga2V5LCAuLi5hcmdzKTtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGFjdGl2ZUV2ZW50c1trZXldID0gcmVzb2x2ZTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb25DbGllbnRDYWxsYmFjayhldmVudE5hbWU6IHN0cmluZywgY2I6IChwbGF5ZXJJZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSkgPT4gYW55KSB7XHJcbiAgICBvbk5ldChgX19veF9jYl8ke2V2ZW50TmFtZX1gLCBhc3luYyAocmVzb3VyY2U6IHN0cmluZywga2V5OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3JjID0gc291cmNlO1xyXG4gICAgICAgIGxldCByZXNwb25zZTogYW55O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IGNiKHNyYywgLi4uYXJncyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGhhbmRsaW5nIGNhbGxiYWNrIGV2ZW50ICR7ZXZlbnROYW1lfSB8IEVycm9yOiBgLCBlLm1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZW1pdE5ldChgX19veF9jYl8ke3Jlc291cmNlfWAsIHNyYywga2V5LCByZXNwb25zZSk7XHJcbiAgICB9KTtcclxufVxyXG4iLCAidHlwZSBRdWVyeSA9IHN0cmluZyB8IG51bWJlcjtcclxudHlwZSBQYXJhbXMgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVua25vd25bXSB8IEZ1bmN0aW9uO1xyXG50eXBlIENhbGxiYWNrPFQ+ID0gKHJlc3VsdDogVCB8IG51bGwpID0+IHZvaWQ7XHJcblxyXG50eXBlIFRyYW5zYWN0aW9uID1cclxuICB8IHN0cmluZ1tdXHJcbiAgfCBbc3RyaW5nLCBQYXJhbXNdW11cclxuICB8IHsgcXVlcnk6IHN0cmluZzsgdmFsdWVzOiBQYXJhbXMgfVtdXHJcbiAgfCB7IHF1ZXJ5OiBzdHJpbmc7IHBhcmFtZXRlcnM6IFBhcmFtcyB9W107XHJcblxyXG5pbnRlcmZhY2UgUmVzdWx0IHtcclxuICBbY29sdW1uOiBzdHJpbmcgfCBudW1iZXJdOiBhbnk7XHJcbiAgYWZmZWN0ZWRSb3dzPzogbnVtYmVyO1xyXG4gIGZpZWxkQ291bnQ/OiBudW1iZXI7XHJcbiAgaW5mbz86IHN0cmluZztcclxuICBpbnNlcnRJZD86IG51bWJlcjtcclxuICBzZXJ2ZXJTdGF0dXM/OiBudW1iZXI7XHJcbiAgd2FybmluZ1N0YXR1cz86IG51bWJlcjtcclxuICBjaGFuZ2VkUm93cz86IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIFJvdyB7XHJcbiAgW2NvbHVtbjogc3RyaW5nIHwgbnVtYmVyXTogdW5rbm93bjtcclxufVxyXG5cclxuaW50ZXJmYWNlIE94TXlTUUwge1xyXG4gIHN0b3JlOiAocXVlcnk6IHN0cmluZykgPT4gdm9pZDtcclxuICByZWFkeTogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xyXG4gIHF1ZXJ5OiA8VCA9IFJlc3VsdCB8IG51bGw+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgc2luZ2xlOiA8VCA9IFJvdyB8IG51bGw+KFxyXG4gICAgcXVlcnk6IFF1ZXJ5LFxyXG4gICAgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8RXhjbHVkZTxULCBbXT4+LFxyXG4gICAgY2I/OiBDYWxsYmFjazxFeGNsdWRlPFQsIFtdPj5cclxuICApID0+IFByb21pc2U8RXhjbHVkZTxULCBbXT4+O1xyXG4gIHNjYWxhcjogPFQgPSB1bmtub3duIHwgbnVsbD4oXHJcbiAgICBxdWVyeTogUXVlcnksXHJcbiAgICBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxFeGNsdWRlPFQsIFtdPj4sXHJcbiAgICBjYj86IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PlxyXG4gICkgPT4gUHJvbWlzZTxFeGNsdWRlPFQsIFtdPj47XHJcbiAgdXBkYXRlOiA8VCA9IG51bWJlciB8IG51bGw+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgaW5zZXJ0OiA8VCA9IG51bWJlciB8IG51bGw+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgcHJlcGFyZTogPFQgPSBhbnk+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgcmF3RXhlY3V0ZTogPFQgPSBSZXN1bHQgfCBudWxsPihxdWVyeTogUXVlcnksIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPFQ+LCBjYj86IENhbGxiYWNrPFQ+KSA9PiBQcm9taXNlPFQ+O1xyXG4gIHRyYW5zYWN0aW9uOiAocXVlcnk6IFRyYW5zYWN0aW9uLCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxib29sZWFuPiwgY2I/OiBDYWxsYmFjazxib29sZWFuPikgPT4gUHJvbWlzZTxib29sZWFuPjtcclxuICBpc1JlYWR5OiAoKSA9PiBib29sZWFuO1xyXG4gIGF3YWl0Q29ubmVjdGlvbjogKCkgPT4gUHJvbWlzZTx0cnVlPjtcclxufVxyXG5cclxuY29uc3QgUXVlcnlTdG9yZTogc3RyaW5nW10gPSBbXTtcclxuXHJcbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb246IGJvb2xlYW4sIG1lc3NhZ2U6IHN0cmluZykge1xyXG4gIGlmICghY29uZGl0aW9uKSB0aHJvdyBuZXcgVHlwZUVycm9yKG1lc3NhZ2UpO1xyXG59XHJcblxyXG5jb25zdCBzYWZlQXJncyA9IChxdWVyeTogUXVlcnkgfCBUcmFuc2FjdGlvbiwgcGFyYW1zPzogYW55LCBjYj86IEZ1bmN0aW9uLCB0cmFuc2FjdGlvbj86IHRydWUpID0+IHtcclxuICBpZiAodHlwZW9mIHF1ZXJ5ID09PSAnbnVtYmVyJykgcXVlcnkgPSBRdWVyeVN0b3JlW3F1ZXJ5XTtcclxuXHJcbiAgaWYgKHRyYW5zYWN0aW9uKSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIHF1ZXJ5ID09PSAnb2JqZWN0JywgYEZpcnN0IGFyZ3VtZW50IGV4cGVjdGVkIG9iamVjdCwgcmVjaWV2ZWQgJHt0eXBlb2YgcXVlcnl9YCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGFzc2VydCh0eXBlb2YgcXVlcnkgPT09ICdzdHJpbmcnLCBgRmlyc3QgYXJndW1lbnQgZXhwZWN0ZWQgc3RyaW5nLCByZWNlaXZlZCAke3R5cGVvZiBxdWVyeX1gKTtcclxuICB9XHJcblxyXG4gIGlmIChwYXJhbXMpIHtcclxuICAgIGNvbnN0IHBhcmFtVHlwZSA9IHR5cGVvZiBwYXJhbXM7XHJcbiAgICBhc3NlcnQoXHJcbiAgICAgIHBhcmFtVHlwZSA9PT0gJ29iamVjdCcgfHwgcGFyYW1UeXBlID09PSAnZnVuY3Rpb24nLFxyXG4gICAgICBgU2Vjb25kIGFyZ3VtZW50IGV4cGVjdGVkIG9iamVjdCBvciBmdW5jdGlvbiwgcmVjZWl2ZWQgJHtwYXJhbVR5cGV9YFxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIWNiICYmIHBhcmFtVHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBjYiA9IHBhcmFtcztcclxuICAgICAgcGFyYW1zID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKGNiICE9PSB1bmRlZmluZWQpIGFzc2VydCh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicsIGBUaGlyZCBhcmd1bWVudCBleHBlY3RlZCBmdW5jdGlvbiwgcmVjZWl2ZWQgJHt0eXBlb2YgY2J9YCk7XHJcblxyXG4gIHJldHVybiBbcXVlcnksIHBhcmFtcywgY2JdO1xyXG59O1xyXG5cclxuY29uc3QgZXhwID0gZ2xvYmFsLmV4cG9ydHMub3hteXNxbDtcclxuY29uc3QgY3VycmVudFJlc291cmNlTmFtZSA9IEdldEN1cnJlbnRSZXNvdXJjZU5hbWUoKTtcclxuXHJcbmZ1bmN0aW9uIGV4ZWN1dGUobWV0aG9kOiBzdHJpbmcsIHF1ZXJ5OiBRdWVyeSB8IFRyYW5zYWN0aW9uLCBwYXJhbXM/OiBQYXJhbXMpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgZXhwW21ldGhvZF0oXHJcbiAgICAgIHF1ZXJ5LFxyXG4gICAgICBwYXJhbXMsXHJcbiAgICAgIChyZXN1bHQsIGVycm9yKSA9PiB7XHJcbiAgICAgICAgaWYgKGVycm9yKSByZXR1cm4gcmVqZWN0KGVycm9yKTtcclxuICAgICAgICByZXNvbHZlKHJlc3VsdCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGN1cnJlbnRSZXNvdXJjZU5hbWUsXHJcbiAgICAgIHRydWVcclxuICAgICk7XHJcbiAgfSkgYXMgYW55O1xyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgb3hteXNxbDogT3hNeVNRTCA9IHtcclxuICBzdG9yZShxdWVyeSkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBxdWVyeSAhPT0gJ3N0cmluZycsIGBRdWVyeSBleHBlY3RzIGEgc3RyaW5nLCByZWNlaXZlZCAke3R5cGVvZiBxdWVyeX1gKTtcclxuXHJcbiAgICByZXR1cm4gUXVlcnlTdG9yZS5wdXNoKHF1ZXJ5KTtcclxuICB9LFxyXG4gIHJlYWR5KGNhbGxiYWNrKSB7XHJcbiAgICBzZXRJbW1lZGlhdGUoYXN5bmMgKCkgPT4ge1xyXG4gICAgICB3aGlsZSAoR2V0UmVzb3VyY2VTdGF0ZSgnb3hteXNxbCcpICE9PSAnc3RhcnRlZCcpIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDUwKSk7XHJcbiAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICB9KTtcclxuICB9LFxyXG4gIGFzeW5jIHF1ZXJ5KHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgncXVlcnknLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyBzaW5nbGUocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdzaW5nbGUnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyBzY2FsYXIocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdzY2FsYXInLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyB1cGRhdGUocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCd1cGRhdGUnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyBpbnNlcnQocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdpbnNlcnQnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyBwcmVwYXJlKHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgncHJlcGFyZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHJhd0V4ZWN1dGUocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdyYXdFeGVjdXRlJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgdHJhbnNhY3Rpb24ocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYiwgdHJ1ZSk7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCd0cmFuc2FjdGlvbicsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGlzUmVhZHkoKSB7XHJcbiAgICByZXR1cm4gZXhwLmlzUmVhZHkoKTtcclxuICB9LFxyXG4gIGFzeW5jIGF3YWl0Q29ubmVjdGlvbigpIHtcclxuICAgIHJldHVybiBhd2FpdCBleHAuYXdhaXRDb25uZWN0aW9uKCk7XHJcbiAgfSxcclxufTtcclxuIiwgImltcG9ydCB7IFRBcHBlYXJhbmNlIH0gZnJvbSAnQHR5cGluZ3MvYXBwZWFyYW5jZSc7XHJcbmltcG9ydCB7IG94bXlzcWwgfSBmcm9tICdAb3ZlcmV4dGVuZGVkL294bXlzcWwnO1xyXG5cclxuZXhwb3J0IGNvbnN0IHNhdmVBcHBlYXJhbmNlID0gYXN5bmMgKHNyYzogc3RyaW5nIHwgbnVtYmVyLCBmcmFtZXdvcmtJZDogc3RyaW5nLCBhcHBlYXJhbmNlOiBUQXBwZWFyYW5jZSkgPT4ge1xyXG5cdGNvbnN0IGNsb3RoZXMgPSB7XHJcblx0XHRkcmF3YWJsZXM6IGFwcGVhcmFuY2UuZHJhd2FibGVzLFxyXG5cdFx0cHJvcHM6IGFwcGVhcmFuY2UucHJvcHMsXHJcblx0XHRoZWFkT3ZlcmxheTogYXBwZWFyYW5jZS5oZWFkT3ZlcmxheSxcclxuXHR9O1xyXG5cclxuXHRjb25zdCBza2luID0ge1xyXG5cdFx0aGVhZEJsZW5kOiBhcHBlYXJhbmNlLmhlYWRCbGVuZCxcclxuXHRcdGhlYWRTdHJ1Y3R1cmU6IGFwcGVhcmFuY2UuaGVhZFN0cnVjdHVyZSxcclxuXHRcdGhhaXJDb2xvcjogYXBwZWFyYW5jZS5oYWlyQ29sb3IsXHJcblx0XHRtb2RlbDogYXBwZWFyYW5jZS5tb2RlbCxcclxuXHR9O1xyXG5cclxuXHRjb25zdCB0YXR0b29zID0gYXBwZWFyYW5jZS50YXR0b29zIHx8IFtdO1xyXG5cclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcblx0XHQnSU5TRVJUIElOVE8gYXBwZWFyYW5jZSAoaWQsIGNsb3RoZXMsIHNraW4sIHRhdHRvb3MpIFZBTFVFUyAoPywgPywgPywgPykgT04gRFVQTElDQVRFIEtFWSBVUERBVEUgY2xvdGhlcyA9IFZBTFVFUyhjbG90aGVzKSwgc2tpbiA9IFZBTFVFUyhza2luKSwgdGF0dG9vcyA9IFZBTFVFUyh0YXR0b29zKTsnLFxyXG5cdFx0W1xyXG5cdFx0XHRmcmFtZXdvcmtJZCxcclxuXHRcdFx0SlNPTi5zdHJpbmdpZnkoY2xvdGhlcyksXHJcblx0XHRcdEpTT04uc3RyaW5naWZ5KHNraW4pLFxyXG5cdFx0XHRKU09OLnN0cmluZ2lmeSh0YXR0b29zKSxcclxuXHRcdF1cclxuXHQpO1xyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59IiwgIiIsICJpbXBvcnQgeyBveG15c3FsIH0gZnJvbSAnQG92ZXJleHRlbmRlZC9veG15c3FsJztcclxuaW1wb3J0IHsgdHJpZ2dlckNsaWVudENhbGxiYWNrIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBzYXZlQXBwZWFyYW5jZSB9IGZyb20gJy4uL2FwcGVhcmFuY2UnO1xyXG5pbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xyXG5cclxuY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xyXG5cclxuY29uc3QgbWlncmF0ZSA9IGFzeW5jIChzcmM6IHN0cmluZykgPT4ge1xyXG4gICAgY29uc3QgcmVzcG9uc2U6IGFueSA9IGF3YWl0IG94bXlzcWwucXVlcnkoJ1NFTEVDVCAqIEZST00gYHBsYXllcnNgJyk7XHJcbiAgICBpZiAoIXJlc3BvbnNlKSByZXR1cm47XHJcblxyXG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHJlc3BvbnNlKSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuc2tpbikge1xyXG4gICAgICAgICAgICBhd2FpdCB0cmlnZ2VyQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6Y2xpZW50Om1pZ3JhdGlvbjpzZXRBcHBlYXJhbmNlJywgc3JjLCB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnZml2ZW0nLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogSlNPTi5wYXJzZShlbGVtZW50LnNraW4pXHJcbiAgICAgICAgICAgIH0pIGFzIFRBcHBlYXJhbmNlXHJcbiAgICAgICAgICAgIGF3YWl0IGRlbGF5KDEwMCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDpnZXRBcHBlYXJhbmNlJywgc3JjKSBhcyBUQXBwZWFyYW5jZVxyXG4gICAgICAgICAgICBhd2FpdCBzYXZlQXBwZWFyYW5jZShzcmMsIGVsZW1lbnQuY2l0aXplbmlkLCByZXNwb25zZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZygnQ29udmVydGVkICcrIHJlc3BvbnNlLmxlbmd0aCArICcgYXBwZWFyYW5jZXMnKVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgbWlncmF0ZSIsICJpbXBvcnQgeyBveG15c3FsIH0gZnJvbSAnQG92ZXJleHRlbmRlZC9veG15c3FsJztcclxuaW1wb3J0IHsgdHJpZ2dlckNsaWVudENhbGxiYWNrIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBzYXZlQXBwZWFyYW5jZSB9IGZyb20gJy4uL2FwcGVhcmFuY2UnO1xyXG5pbXBvcnQgeyBUQXBwZWFyYW5jZSB9IGZyb20gJ0B0eXBpbmdzL2FwcGVhcmFuY2UnO1xyXG5cclxuY29uc3QgZGVsYXkgPSAobXM6IG51bWJlcikgPT4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xyXG5cclxuY29uc3QgbWlncmF0ZSA9IGFzeW5jIChzcmM6IHN0cmluZykgPT4ge1xyXG4gICAgY29uc3QgcmVzcG9uc2U6IGFueSA9IGF3YWl0IG94bXlzcWwucXVlcnkoJ1NFTEVDVCAqIEZST00gYHBsYXllcnNraW5zYCBXSEVSRSBhY3RpdmUgPSAxYCcpO1xyXG4gICAgaWYgKCFyZXNwb25zZSkgcmV0dXJuO1xyXG5cclxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiByZXNwb25zZSkge1xyXG4gICAgICAgIGlmIChlbGVtZW50LnNraW4pIHtcclxuICAgICAgICAgICAgYXdhaXQgdHJpZ2dlckNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOmNsaWVudDptaWdyYXRpb246c2V0QXBwZWFyYW5jZScsIHNyYywge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2lsbGVuaXVtJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IEpTT04ucGFyc2UoZWxlbWVudC5za2luKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBhd2FpdCBkZWxheSgxMDApO1xyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRyaWdnZXJDbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6Z2V0QXBwZWFyYW5jZScsIHNyYykgYXMgVEFwcGVhcmFuY2VcclxuICAgICAgICAgICAgYXdhaXQgc2F2ZUFwcGVhcmFuY2Uoc3JjLCBlbGVtZW50LmNpdGl6ZW5pZCwgcmVzcG9uc2UpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coJ0NvbnZlcnRlZCAnKyByZXNwb25zZS5sZW5ndGggKyAnIGFwcGVhcmFuY2VzJylcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IG1pZ3JhdGUiLCAiaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCc7XHJcbmltcG9ydCB7IHRyaWdnZXJDbGllbnRDYWxsYmFjayB9IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IHsgc2F2ZUFwcGVhcmFuY2UgfSBmcm9tICcuLi9hcHBlYXJhbmNlJztcclxuaW1wb3J0IHsgVEFwcGVhcmFuY2UgfSBmcm9tICdAdHlwaW5ncy9hcHBlYXJhbmNlJztcclxuXHJcbmNvbnN0IGRlbGF5ID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcclxuXHJcbmNvbnN0IG1pZ3JhdGUgPSBhc3luYyAoc3JjOiBzdHJpbmcpID0+IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlOiBhbnkgPSBhd2FpdCBveG15c3FsLnF1ZXJ5KCdTRUxFQ1QgKiBGUk9NIGBwbGF5ZXJza2luc2AgV0hFUkUgYWN0aXZlID0gMScpO1xyXG4gICAgaWYgKCFyZXNwb25zZSkgcmV0dXJuO1xyXG5cclxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiByZXNwb25zZSkge1xyXG4gICAgICAgIGVtaXROZXQoJ3FiLWNsb3RoZXM6bG9hZFNraW4nLCBzcmMsIDAsIGVsZW1lbnQubW9kZWwsIGVsZW1lbnQuc2tpbik7XHJcbiAgICAgICAgYXdhaXQgZGVsYXkoMjAwKTtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRyaWdnZXJDbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpjbGllbnQ6Z2V0QXBwZWFyYW5jZScsIHNyYykgYXMgVEFwcGVhcmFuY2VcclxuICAgICAgICBhd2FpdCBzYXZlQXBwZWFyYW5jZShzcmMsIGVsZW1lbnQuY2l0aXplbmlkLCByZXNwb25zZSlcclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKCdDb252ZXJ0ZWQgJysgcmVzcG9uc2UubGVuZ3RoICsgJyBhcHBlYXJhbmNlcycpXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBtaWdyYXRlIiwgImltcG9ydCB7IG9uQ2xpZW50Q2FsbGJhY2sgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCc7XHJcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gJ0B0eXBpbmdzL291dGZpdHMnO1xyXG5pbXBvcnQgeyBzYXZlQXBwZWFyYW5jZSB9IGZyb20gJy4vYXBwZWFyYW5jZSc7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRPdXRmaXRzJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQpID0+IHtcclxuXHRsZXQgcmVzcG9uc2UgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcblx0XHQnU0VMRUNUICogRlJPTSBvdXRmaXRzIFdIRVJFIHBsYXllcl9pZCA9ID8nLFxyXG5cdFx0W2ZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0aWYgKCFyZXNwb25zZSkgcmV0dXJuIFtdO1xyXG5cclxuXHRpZiAoIUFycmF5LmlzQXJyYXkocmVzcG9uc2UpKSB7XHJcblx0XHRyZXNwb25zZSA9IFtyZXNwb25zZV07XHJcblx0fVxyXG5cclxuXHRjb25zdCBvdXRmaXRzID0gcmVzcG9uc2UubWFwKFxyXG5cdFx0KG91dGZpdDogeyBpZDogbnVtYmVyOyBsYWJlbDogc3RyaW5nOyBvdXRmaXQ6IHN0cmluZyB9KSA9PiB7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0aWQ6IG91dGZpdC5pZCxcclxuXHRcdFx0XHRsYWJlbDogb3V0Zml0LmxhYmVsLFxyXG5cdFx0XHRcdG91dGZpdDogSlNPTi5wYXJzZShvdXRmaXQub3V0Zml0KSxcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHQpO1xyXG5cclxuXHRyZXR1cm4gb3V0Zml0cztcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZW5hbWVPdXRmaXQnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCwgZGF0YSkgPT4ge1xyXG5cdGNvbnN0IGlkID0gZGF0YS5pZDtcclxuXHRjb25zdCBsYWJlbCA9IGRhdGEubGFiZWw7XHJcblxyXG5cdGNvbnNvbGUubG9nKCdyZW5hbWVPdXRmaXQnLCBmcmFtZXdvcmtJZCwgbGFiZWwsIGlkKTtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdCdVUERBVEUgb3V0Zml0cyBTRVQgbGFiZWwgPSA/IFdIRVJFIHBsYXllcl9pZCA9ID8gQU5EIGlkID0gPycsXHJcblx0XHRbbGFiZWwsIGZyYW1ld29ya0lkLCBpZF1cclxuXHQpO1xyXG5cdHJldHVybiByZXN1bHQ7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6ZGVsZXRlT3V0Zml0JywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQsIGlkKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcblx0XHQnREVMRVRFIEZST00gb3V0Zml0cyBXSEVSRSBwbGF5ZXJfaWQgPSA/IEFORCBpZCA9ID8nLFxyXG5cdFx0W2ZyYW1ld29ya0lkLCBpZF1cclxuXHQpO1xyXG5cdHJldHVybiByZXN1bHQgPiAwO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVPdXRmaXQnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCwgZGF0YTogT3V0Zml0KSA9PiB7XHJcblx0Y29uc29sZS5sb2coXHJcblx0XHRmcmFtZXdvcmtJZCxcclxuXHRcdGRhdGEubGFiZWwsXHJcblx0XHRkYXRhLm91dGZpdCxcclxuXHRcdEpTT04uc3RyaW5naWZ5KGRhdGEub3V0Zml0KVxyXG5cdCk7XHJcblx0Y29uc3QgaWQgPSBhd2FpdCBveG15c3FsLmluc2VydChcclxuXHRcdCdJTlNFUlQgSU5UTyBvdXRmaXRzIChwbGF5ZXJfaWQsIGxhYmVsLCBvdXRmaXQpIFZBTFVFUyAoPywgPywgPyknLFxyXG5cdFx0W2ZyYW1ld29ya0lkLCBkYXRhLmxhYmVsLCBKU09OLnN0cmluZ2lmeShkYXRhLm91dGZpdCldXHJcblx0KTtcclxuXHRjb25zb2xlLmxvZygnaWQnLCBpZCk7XHJcblx0cmV0dXJuIGlkO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVTa2luJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQsIHNraW4pID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdCdVUERBVEUgYXBwZWFyYW5jZSBTRVQgc2tpbiA9ID8gV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtKU09OLnN0cmluZ2lmeShza2luKSwgZnJhbWV3b3JrSWRdXHJcblx0KTtcclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVDbG90aGVzJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQsIGNsb3RoZXMpID0+IHtcclxuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxyXG5cdFx0XHQnVVBEQVRFIGFwcGVhcmFuY2UgU0VUIGNsb3RoZXMgPSA/IFdIRVJFIGlkID0gPycsXHJcblx0XHRcdFtKU09OLnN0cmluZ2lmeShjbG90aGVzKSwgZnJhbWV3b3JrSWRdXHJcblx0XHQpO1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcbik7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlQXBwZWFyYW5jZScsIHNhdmVBcHBlYXJhbmNlKTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVUYXR0b29zJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQsIHRhdHRvb3MpID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdCdVUERBVEUgYXBwZWFyYW5jZSBTRVQgdGF0dG9vcyA9ID8gV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtKU09OLnN0cmluZ2lmeSh0YXR0b29zKSwgZnJhbWV3b3JrSWRdXHJcblx0KTtcclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldFNraW4nLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCkgPT4ge1xyXG5cdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG5cdFx0J1NFTEVDVCBza2luIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0W2ZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldENsb3RoZXMnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCkgPT4ge1xyXG5cdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG5cdFx0J1NFTEVDVCBjbG90aGVzIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0W2ZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldFRhdHRvb3MnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCkgPT4ge1xyXG5cdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG5cdFx0J1NFTEVDVCB0YXR0b29zIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0W2ZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpIHx8IFtdO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCkgPT4ge1xyXG5cdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG5cdFx0J1NFTEVDVCAqIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0W2ZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgnbWlncmF0ZScsIGFzeW5jIChzb3VyY2U6IG51bWJlcikgPT4ge1xyXG5cdHNvdXJjZSA9IHNvdXJjZSAhPT0gMCA/IHNvdXJjZSA6IHBhcnNlSW50KGdldFBsYXllcnMoKVswXSlcclxuXHRjb25zdCBibF9hcHBlYXJhbmNlID0gZXhwb3J0cy5ibF9hcHBlYXJhbmNlO1xyXG5cdGNvbnN0IGNvbmZpZyA9IGJsX2FwcGVhcmFuY2UuY29uZmlnKCk7XHJcblx0Y29uc3QgaW1wb3J0ZWRNb2R1bGUgPSBhd2FpdCBpbXBvcnQoYC4vbWlncmF0ZS8ke2NvbmZpZy5wcmV2aW91c0Nsb3RoaW5nID09PSAnZml2ZW0tYXBwZWFyYW5jZScgPyAnZml2ZW0nIDogY29uZmlnLnByZXZpb3VzQ2xvdGhpbmd9LnRzYClcclxuXHRpbXBvcnRlZE1vZHVsZS5kZWZhdWx0KHNvdXJjZSlcclxufSwgZmFsc2UpXHJcblxyXG5veG15c3FsLnJlYWR5KCgpID0+IHtcclxuXHRveG15c3FsLnF1ZXJ5KGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBhcHBlYXJhbmNlIChcclxuXHRcdGlkIHZhcmNoYXIoMTAwKSBOT1QgTlVMTCxcclxuXHRcdHNraW4gbG9uZ3RleHQgREVGQVVMVCBOVUxMLFxyXG5cdFx0Y2xvdGhlcyBsb25ndGV4dCBERUZBVUxUIE5VTEwsXHJcblx0XHR0YXR0b29zICBsb25ndGV4dCBERUZBVUxUIE5VTEwsXHJcblx0XHRQUklNQVJZIEtFWSAoaWQpXHJcblx0KSBFTkdJTkU9SW5ub0RCIERFRkFVTFQgQ0hBUlNFVD11dGY4O2ApXHJcblx0XHJcblx0b3hteXNxbC5xdWVyeShgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgb3V0Zml0cyAoXHJcblx0XHRpZCBpbnQgTk9UIE5VTEwgQVVUT19JTkNSRU1FTlQsXHJcblx0XHRwbGF5ZXJfaWQgdmFyY2hhcigxMDApIE5PVCBOVUxMLFxyXG5cdFx0bGFiZWwgdmFyY2hhcigxMDApIE5PVCBOVUxMLFxyXG5cdFx0b3V0Zml0IGxvbmd0ZXh0IERFRkFVTFQgTlVMTCxcclxuXHRcdFBSSU1BUlkgS0VZIChpZClcclxuXHQpIEVOR0lORT1Jbm5vREIgREVGQVVMVCBDSEFSU0VUPXV0Zjg7YClcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFVTyxTQUFTLHNCQUFzQixXQUFtQixhQUFxQixNQUFhO0FBQ3ZGLE1BQUk7QUFDSixLQUFHO0FBQ0MsVUFBTSxHQUFHLFNBQVMsSUFBSSxLQUFLLE1BQU0sS0FBSyxPQUFPLEtBQUssTUFBUyxFQUFFLENBQUMsSUFBSSxRQUFRO0FBQUEsRUFDOUUsU0FBUyxhQUFhLEdBQUc7QUFDekIsVUFBUSxXQUFXLFNBQVMsSUFBSSxVQUFVLGNBQWMsS0FBSyxHQUFHLElBQUk7QUFDcEUsU0FBTyxJQUFJLFFBQVEsQ0FBQyxZQUFZO0FBQzVCLGlCQUFhLEdBQUcsSUFBSTtBQUFBLEVBQ3hCLENBQUM7QUFDTDtBQUVPLFNBQVMsaUJBQWlCLFdBQW1CLElBQStDO0FBQy9GLFFBQU0sV0FBVyxTQUFTLElBQUksT0FBTyxVQUFrQixRQUFnQixTQUFnQjtBQUNuRixVQUFNLE1BQU07QUFDWixRQUFJO0FBRUosUUFBSTtBQUNBLGlCQUFXLE1BQU0sR0FBRyxLQUFLLEdBQUcsSUFBSTtBQUFBLElBQ3BDLFNBQVMsR0FBUTtBQUNiLGNBQVEsTUFBTSxtREFBbUQsU0FBUyxjQUFjLEVBQUUsT0FBTztBQUFBLElBQ3JHO0FBRUEsWUFBUSxXQUFXLFFBQVEsSUFBSSxLQUFLLEtBQUssUUFBUTtBQUFBLEVBQ3JELENBQUM7QUFDTDtBQWxDQSxJQUVNLGNBRUE7QUFKTjtBQUFBO0FBRUEsSUFBTSxlQUFlLHVCQUF1QjtBQUU1QyxJQUFNLGVBQWUsQ0FBQztBQUN0QixVQUFNLFdBQVcsWUFBWSxJQUFJLENBQUMsUUFBUSxT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aUJBQWlCLGdDQUFnQyxPQUFPLEtBQUssZ0JBQWdCO0FBQzVFLFFBQU0sV0FBVyxNQUFNLHdCQUFRO0FBQUEsSUFDOUI7QUFBQSxJQUNBLENBQUMsV0FBVztBQUFBLEVBQ2I7QUFDQSxTQUFPLEtBQUssTUFBTSxRQUFRO0FBQzNCLENBQUM7QUFFRCxpQkFBaUIsbUNBQW1DLE9BQU8sS0FBSyxnQkFBZ0I7QUFDL0UsUUFBTSxXQUFXLE1BQU0sd0JBQVE7QUFBQSxJQUM5QjtBQUFBLElBQ0EsQ0FBQyxXQUFXO0FBQUEsRUFDYjtBQUNBLFNBQU8sS0FBSyxNQUFNLFFBQVE7QUFDM0IsQ0FBQztBQUVELGlCQUFpQixtQ0FBbUMsT0FBTyxLQUFLLGdCQUFnQjtBQUMvRSxRQUFNLFdBQVcsTUFBTSx3QkFBUTtBQUFBLElBQzlCO0FBQUEsSUFDQSxDQUFDLFdBQVc7QUFBQSxFQUNiO0FBQ0EsU0FBTyxLQUFLLE1BQU0sUUFBUSxLQUFLLENBQUM7QUFDakMsQ0FBQztBQUVELGlCQUFpQixzQ0FBc0MsT0FBTyxLQUFLLGdCQUFnQjtBQUNsRixRQUFNLFdBQVcsTUFBTSx3QkFBUTtBQUFBLElBQzlCO0FBQUEsSUFDQSxDQUFDLFdBQVc7QUFBQSxFQUNiO0FBQ0EsU0FBTyxLQUFLLE1BQU0sUUFBUTtBQUMzQixDQUFDO0FBRUQsZ0JBQWdCLFdBQVcsT0FBT0MsWUFBbUI7QUFDcEQsRUFBQUEsVUFBU0EsWUFBVyxJQUFJQSxVQUFTLFNBQVMsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUN6RCxRQUFNLGdCQUFnQixRQUFRO0FBQzlCLFFBQU0sU0FBUyxjQUFjLE9BQU87QUFDcEMsUUFBTSxpQkFBaUIsTUFBYSxtQ0FBYSxPQUFPLHFCQUFxQixxQkFBcUIsVUFBVSxPQUFPLGdCQUFnQjtBQUNuSSxpQkFBZSxRQUFRQSxPQUFNO0FBQzlCLEdBQUcsS0FBSztBQUVSLHdCQUFRLE1BQU0sTUFBTTtBQUNuQiwwQkFBUSxNQUFNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHVDQU13QjtBQUV0QywwQkFBUSxNQUFNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHVDQU13QjtBQUN2QyxDQUFDOyIsCiAgIm5hbWVzIjogWyJleHBvcnRzIiwgImltcG9ydF9veG15c3FsIiwgInJlc3BvbnNlIiwgImltcG9ydF9veG15c3FsIiwgImRlbGF5IiwgIm1pZ3JhdGUiLCAicmVzcG9uc2UiLCAiaW1wb3J0X294bXlzcWwiLCAiZGVsYXkiLCAibWlncmF0ZSIsICJyZXNwb25zZSIsICJpbXBvcnRfb3hteXNxbCIsICJzb3VyY2UiXQp9Cg==
