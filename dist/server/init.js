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

// src/server/migrate/esx.ts
var esx_exports = {};
var init_esx = __esm({
  "src/server/migrate/esx.ts"() {
  }
});

// src/server/migrate/fivem.ts
var fivem_exports = {};
var init_fivem = __esm({
  "src/server/migrate/fivem.ts"() {
  }
});

// src/server/migrate/illenium.ts
var illenium_exports = {};
var init_illenium = __esm({
  "src/server/migrate/illenium.ts"() {
  }
});

// src/server/migrate/qb.ts
var qb_exports = {};
var init_qb = __esm({
  "src/server/migrate/qb.ts"() {
    console.log("?");
  }
});

// src/server/utils/index.ts
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
__name(onClientCallback, "onClientCallback");

// src/server/init.ts
var import_oxmysql = __toESM(require_MySQL(), 1);

// import("./migrate/**/*") in src/server/init.ts
var globImport_migrate = __glob({
  "./migrate/esx.ts": () => Promise.resolve().then(() => (init_esx(), esx_exports)),
  "./migrate/fivem.ts": () => Promise.resolve().then(() => (init_fivem(), fivem_exports)),
  "./migrate/illenium.ts": () => Promise.resolve().then(() => (init_illenium(), illenium_exports)),
  "./migrate/qb.ts": () => Promise.resolve().then(() => (init_qb(), qb_exports))
});

// src/server/init.ts
onClientCallback("bl_appearance:server:getOutfits", async (src, frameworkId) => {
  let response = await import_oxmysql.oxmysql.prepare(
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
  const result = await import_oxmysql.oxmysql.update(
    "UPDATE outfits SET label = ? WHERE player_id = ? AND id = ?",
    [label, frameworkId, id]
  );
  return result;
});
onClientCallback("bl_appearance:server:deleteOutfit", async (src, frameworkId, id) => {
  const result = await import_oxmysql.oxmysql.update(
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
  const id = await import_oxmysql.oxmysql.insert(
    "INSERT INTO outfits (player_id, label, outfit) VALUES (?, ?, ?)",
    [frameworkId, data.label, JSON.stringify(data.outfit)]
  );
  console.log("id", id);
  return id;
});
onClientCallback("bl_appearance:server:saveSkin", async (src, frameworkId, skin) => {
  const result = await import_oxmysql.oxmysql.update(
    "UPDATE appearance SET skin = ? WHERE id = ?",
    [JSON.stringify(skin), frameworkId]
  );
  return result;
});
onClientCallback(
  "bl_appearance:server:saveClothes",
  async (src, frameworkId, clothes) => {
    const result = await import_oxmysql.oxmysql.update(
      "UPDATE appearance SET clothes = ? WHERE id = ?",
      [JSON.stringify(clothes), frameworkId]
    );
    return result;
  }
);
onClientCallback("bl_appearance:server:saveAppearance", async (src, frameworkId, appearance) => {
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
});
onClientCallback("bl_appearance:server:saveTattoos", async (src, frameworkId, tattoos) => {
  const result = await import_oxmysql.oxmysql.update(
    "UPDATE appearance SET tattoos = ? WHERE id = ?",
    [JSON.stringify(tattoos), frameworkId]
  );
  return result;
});
onClientCallback("bl_appearance:server:getSkin", async (src, frameworkId) => {
  const response = await import_oxmysql.oxmysql.prepare(
    "SELECT skin FROM appearance WHERE id = ?",
    [frameworkId]
  );
  return JSON.parse(response);
});
onClientCallback("bl_appearance:server:getClothes", async (src, frameworkId) => {
  const response = await import_oxmysql.oxmysql.prepare(
    "SELECT clothes FROM appearance WHERE id = ?",
    [frameworkId]
  );
  return JSON.parse(response);
});
onClientCallback("bl_appearance:server:getTattoos", async (src, frameworkId) => {
  const response = await import_oxmysql.oxmysql.prepare(
    "SELECT tattoos FROM appearance WHERE id = ?",
    [frameworkId]
  );
  return JSON.parse(response) || [];
});
onClientCallback("bl_appearance:server:getAppearance", async (src, frameworkId) => {
  const response = await import_oxmysql.oxmysql.prepare(
    "SELECT * FROM appearance WHERE id = ?",
    [frameworkId]
  );
  return JSON.parse(response);
});
RegisterCommand("migrate", () => {
  console.log(1);
  const bl_appearance = exports.bl_appearance;
  const config = bl_appearance.config();
  globImport_migrate(`./migrate/${config.previousClothing === "fivem-appearance" ? "fivem" : config.previousClothing}`);
}, true);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BvdmVyZXh0ZW5kZWQrb3hteXNxbEAxLjMuMC9ub2RlX21vZHVsZXMvQG92ZXJleHRlbmRlZC9veG15c3FsL015U1FMLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvbWlncmF0ZS9lc3gudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9taWdyYXRlL2ZpdmVtLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvbWlncmF0ZS9pbGxlbml1bS50cyIsICIuLi8uLi9zcmMvc2VydmVyL21pZ3JhdGUvcWIudHMiLCAiLi4vLi4vc3JjL3NlcnZlci91dGlscy9pbmRleC50cyIsICIuLi8uLi9zcmMvc2VydmVyL2luaXQudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbInR5cGUgUXVlcnkgPSBzdHJpbmcgfCBudW1iZXI7XHJcbnR5cGUgUGFyYW1zID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmtub3duW10gfCBGdW5jdGlvbjtcclxudHlwZSBDYWxsYmFjazxUPiA9IChyZXN1bHQ6IFQgfCBudWxsKSA9PiB2b2lkO1xyXG5cclxudHlwZSBUcmFuc2FjdGlvbiA9XHJcbiAgfCBzdHJpbmdbXVxyXG4gIHwgW3N0cmluZywgUGFyYW1zXVtdXHJcbiAgfCB7IHF1ZXJ5OiBzdHJpbmc7IHZhbHVlczogUGFyYW1zIH1bXVxyXG4gIHwgeyBxdWVyeTogc3RyaW5nOyBwYXJhbWV0ZXJzOiBQYXJhbXMgfVtdO1xyXG5cclxuaW50ZXJmYWNlIFJlc3VsdCB7XHJcbiAgW2NvbHVtbjogc3RyaW5nIHwgbnVtYmVyXTogYW55O1xyXG4gIGFmZmVjdGVkUm93cz86IG51bWJlcjtcclxuICBmaWVsZENvdW50PzogbnVtYmVyO1xyXG4gIGluZm8/OiBzdHJpbmc7XHJcbiAgaW5zZXJ0SWQ/OiBudW1iZXI7XHJcbiAgc2VydmVyU3RhdHVzPzogbnVtYmVyO1xyXG4gIHdhcm5pbmdTdGF0dXM/OiBudW1iZXI7XHJcbiAgY2hhbmdlZFJvd3M/OiBudW1iZXI7XHJcbn1cclxuXHJcbmludGVyZmFjZSBSb3cge1xyXG4gIFtjb2x1bW46IHN0cmluZyB8IG51bWJlcl06IHVua25vd247XHJcbn1cclxuXHJcbmludGVyZmFjZSBPeE15U1FMIHtcclxuICBzdG9yZTogKHF1ZXJ5OiBzdHJpbmcpID0+IHZvaWQ7XHJcbiAgcmVhZHk6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICBxdWVyeTogPFQgPSBSZXN1bHQgfCBudWxsPihxdWVyeTogUXVlcnksIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPFQ+LCBjYj86IENhbGxiYWNrPFQ+KSA9PiBQcm9taXNlPFQ+O1xyXG4gIHNpbmdsZTogPFQgPSBSb3cgfCBudWxsPihcclxuICAgIHF1ZXJ5OiBRdWVyeSxcclxuICAgIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PixcclxuICAgIGNiPzogQ2FsbGJhY2s8RXhjbHVkZTxULCBbXT4+XHJcbiAgKSA9PiBQcm9taXNlPEV4Y2x1ZGU8VCwgW10+PjtcclxuICBzY2FsYXI6IDxUID0gdW5rbm93biB8IG51bGw+KFxyXG4gICAgcXVlcnk6IFF1ZXJ5LFxyXG4gICAgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8RXhjbHVkZTxULCBbXT4+LFxyXG4gICAgY2I/OiBDYWxsYmFjazxFeGNsdWRlPFQsIFtdPj5cclxuICApID0+IFByb21pc2U8RXhjbHVkZTxULCBbXT4+O1xyXG4gIHVwZGF0ZTogPFQgPSBudW1iZXIgfCBudWxsPihxdWVyeTogUXVlcnksIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPFQ+LCBjYj86IENhbGxiYWNrPFQ+KSA9PiBQcm9taXNlPFQ+O1xyXG4gIGluc2VydDogPFQgPSBudW1iZXIgfCBudWxsPihxdWVyeTogUXVlcnksIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPFQ+LCBjYj86IENhbGxiYWNrPFQ+KSA9PiBQcm9taXNlPFQ+O1xyXG4gIHByZXBhcmU6IDxUID0gYW55PihxdWVyeTogUXVlcnksIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPFQ+LCBjYj86IENhbGxiYWNrPFQ+KSA9PiBQcm9taXNlPFQ+O1xyXG4gIHJhd0V4ZWN1dGU6IDxUID0gUmVzdWx0IHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICB0cmFuc2FjdGlvbjogKHF1ZXJ5OiBUcmFuc2FjdGlvbiwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8Ym9vbGVhbj4sIGNiPzogQ2FsbGJhY2s8Ym9vbGVhbj4pID0+IFByb21pc2U8Ym9vbGVhbj47XHJcbiAgaXNSZWFkeTogKCkgPT4gYm9vbGVhbjtcclxuICBhd2FpdENvbm5lY3Rpb246ICgpID0+IFByb21pc2U8dHJ1ZT47XHJcbn1cclxuXHJcbmNvbnN0IFF1ZXJ5U3RvcmU6IHN0cmluZ1tdID0gW107XHJcblxyXG5mdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uOiBib29sZWFuLCBtZXNzYWdlOiBzdHJpbmcpIHtcclxuICBpZiAoIWNvbmRpdGlvbikgdGhyb3cgbmV3IFR5cGVFcnJvcihtZXNzYWdlKTtcclxufVxyXG5cclxuY29uc3Qgc2FmZUFyZ3MgPSAocXVlcnk6IFF1ZXJ5IHwgVHJhbnNhY3Rpb24sIHBhcmFtcz86IGFueSwgY2I/OiBGdW5jdGlvbiwgdHJhbnNhY3Rpb24/OiB0cnVlKSA9PiB7XHJcbiAgaWYgKHR5cGVvZiBxdWVyeSA9PT0gJ251bWJlcicpIHF1ZXJ5ID0gUXVlcnlTdG9yZVtxdWVyeV07XHJcblxyXG4gIGlmICh0cmFuc2FjdGlvbikge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBxdWVyeSA9PT0gJ29iamVjdCcsIGBGaXJzdCBhcmd1bWVudCBleHBlY3RlZCBvYmplY3QsIHJlY2lldmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIHF1ZXJ5ID09PSAnc3RyaW5nJywgYEZpcnN0IGFyZ3VtZW50IGV4cGVjdGVkIHN0cmluZywgcmVjZWl2ZWQgJHt0eXBlb2YgcXVlcnl9YCk7XHJcbiAgfVxyXG5cclxuICBpZiAocGFyYW1zKSB7XHJcbiAgICBjb25zdCBwYXJhbVR5cGUgPSB0eXBlb2YgcGFyYW1zO1xyXG4gICAgYXNzZXJ0KFxyXG4gICAgICBwYXJhbVR5cGUgPT09ICdvYmplY3QnIHx8IHBhcmFtVHlwZSA9PT0gJ2Z1bmN0aW9uJyxcclxuICAgICAgYFNlY29uZCBhcmd1bWVudCBleHBlY3RlZCBvYmplY3Qgb3IgZnVuY3Rpb24sIHJlY2VpdmVkICR7cGFyYW1UeXBlfWBcclxuICAgICk7XHJcblxyXG4gICAgaWYgKCFjYiAmJiBwYXJhbVR5cGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgY2IgPSBwYXJhbXM7XHJcbiAgICAgIHBhcmFtcyA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmIChjYiAhPT0gdW5kZWZpbmVkKSBhc3NlcnQodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nLCBgVGhpcmQgYXJndW1lbnQgZXhwZWN0ZWQgZnVuY3Rpb24sIHJlY2VpdmVkICR7dHlwZW9mIGNifWApO1xyXG5cclxuICByZXR1cm4gW3F1ZXJ5LCBwYXJhbXMsIGNiXTtcclxufTtcclxuXHJcbmNvbnN0IGV4cCA9IGdsb2JhbC5leHBvcnRzLm94bXlzcWw7XHJcbmNvbnN0IGN1cnJlbnRSZXNvdXJjZU5hbWUgPSBHZXRDdXJyZW50UmVzb3VyY2VOYW1lKCk7XHJcblxyXG5mdW5jdGlvbiBleGVjdXRlKG1ldGhvZDogc3RyaW5nLCBxdWVyeTogUXVlcnkgfCBUcmFuc2FjdGlvbiwgcGFyYW1zPzogUGFyYW1zKSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGV4cFttZXRob2RdKFxyXG4gICAgICBxdWVyeSxcclxuICAgICAgcGFyYW1zLFxyXG4gICAgICAocmVzdWx0LCBlcnJvcikgPT4ge1xyXG4gICAgICAgIGlmIChlcnJvcikgcmV0dXJuIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xyXG4gICAgICB9LFxyXG4gICAgICBjdXJyZW50UmVzb3VyY2VOYW1lLFxyXG4gICAgICB0cnVlXHJcbiAgICApO1xyXG4gIH0pIGFzIGFueTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IG94bXlzcWw6IE94TXlTUUwgPSB7XHJcbiAgc3RvcmUocXVlcnkpIHtcclxuICAgIGFzc2VydCh0eXBlb2YgcXVlcnkgIT09ICdzdHJpbmcnLCBgUXVlcnkgZXhwZWN0cyBhIHN0cmluZywgcmVjZWl2ZWQgJHt0eXBlb2YgcXVlcnl9YCk7XHJcblxyXG4gICAgcmV0dXJuIFF1ZXJ5U3RvcmUucHVzaChxdWVyeSk7XHJcbiAgfSxcclxuICByZWFkeShjYWxsYmFjaykge1xyXG4gICAgc2V0SW1tZWRpYXRlKGFzeW5jICgpID0+IHtcclxuICAgICAgd2hpbGUgKEdldFJlc291cmNlU3RhdGUoJ294bXlzcWwnKSAhPT0gJ3N0YXJ0ZWQnKSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCA1MCkpO1xyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfSk7XHJcbiAgfSxcclxuICBhc3luYyBxdWVyeShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3F1ZXJ5JywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgc2luZ2xlKHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgnc2luZ2xlJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgc2NhbGFyKHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgnc2NhbGFyJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgdXBkYXRlKHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgndXBkYXRlJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgaW5zZXJ0KHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgnaW5zZXJ0JywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgcHJlcGFyZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3ByZXBhcmUnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyByYXdFeGVjdXRlKHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgncmF3RXhlY3V0ZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHRyYW5zYWN0aW9uKHF1ZXJ5LCBwYXJhbXMsIGNiKSB7XHJcbiAgICBbcXVlcnksIHBhcmFtcywgY2JdID0gc2FmZUFyZ3MocXVlcnksIHBhcmFtcywgY2IsIHRydWUpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSgndHJhbnNhY3Rpb24nLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBpc1JlYWR5KCkge1xyXG4gICAgcmV0dXJuIGV4cC5pc1JlYWR5KCk7XHJcbiAgfSxcclxuICBhc3luYyBhd2FpdENvbm5lY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gYXdhaXQgZXhwLmF3YWl0Q29ubmVjdGlvbigpO1xyXG4gIH0sXHJcbn07XHJcbiIsICIiLCAiIiwgIiIsICJjb25zb2xlLmxvZygnPycpIiwgIi8vaHR0cHM6Ly9naXRodWIuY29tL292ZXJleHRlbmRlZC9veF9saWIvYmxvYi9tYXN0ZXIvcGFja2FnZS9zZXJ2ZXIvcmVzb3VyY2UvY2FsbGJhY2svaW5kZXgudHNcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvbkNsaWVudENhbGxiYWNrKGV2ZW50TmFtZTogc3RyaW5nLCBjYjogKHBsYXllcklkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpIHtcclxuICAgIG9uTmV0KGBfX294X2NiXyR7ZXZlbnROYW1lfWAsIGFzeW5jIChyZXNvdXJjZTogc3RyaW5nLCBrZXk6IHN0cmluZywgLi4uYXJnczogYW55W10pID0+IHtcclxuICAgICAgICBjb25zdCBzcmMgPSBzb3VyY2U7XHJcbiAgICAgICAgbGV0IHJlc3BvbnNlOiBhbnk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlID0gYXdhaXQgY2Ioc3JjLCAuLi5hcmdzKTtcclxuICAgICAgICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgaGFuZGxpbmcgY2FsbGJhY2sgZXZlbnQgJHtldmVudE5hbWV9IHwgRXJyb3I6IGAsIGUubWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBlbWl0TmV0KGBfX294X2NiXyR7cmVzb3VyY2V9YCwgc3JjLCBrZXksIHJlc3BvbnNlKTtcclxuICAgIH0pO1xyXG59XHJcbiIsICJpbXBvcnQgeyBvbkNsaWVudENhbGxiYWNrIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IG94bXlzcWwgfSBmcm9tICdAb3ZlcmV4dGVuZGVkL294bXlzcWwnO1xyXG5pbXBvcnQgeyBPdXRmaXQgfSBmcm9tICdAdHlwaW5ncy9vdXRmaXRzJztcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldE91dGZpdHMnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCkgPT4ge1xyXG5cdGxldCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1QgKiBGUk9NIG91dGZpdHMgV0hFUkUgcGxheWVyX2lkID0gPycsXHJcblx0XHRbZnJhbWV3b3JrSWRdXHJcblx0KTtcclxuXHRpZiAoIXJlc3BvbnNlKSByZXR1cm4gW107XHJcblxyXG5cdGlmICghQXJyYXkuaXNBcnJheShyZXNwb25zZSkpIHtcclxuXHRcdHJlc3BvbnNlID0gW3Jlc3BvbnNlXTtcclxuXHR9XHJcblxyXG5cdGNvbnN0IG91dGZpdHMgPSByZXNwb25zZS5tYXAoXHJcblx0XHQob3V0Zml0OiB7IGlkOiBudW1iZXI7IGxhYmVsOiBzdHJpbmc7IG91dGZpdDogc3RyaW5nIH0pID0+IHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRpZDogb3V0Zml0LmlkLFxyXG5cdFx0XHRcdGxhYmVsOiBvdXRmaXQubGFiZWwsXHJcblx0XHRcdFx0b3V0Zml0OiBKU09OLnBhcnNlKG91dGZpdC5vdXRmaXQpLFxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdCk7XHJcblxyXG5cdHJldHVybiBvdXRmaXRzO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnJlbmFtZU91dGZpdCcsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBkYXRhKSA9PiB7XHJcblx0Y29uc3QgaWQgPSBkYXRhLmlkO1xyXG5cdGNvbnN0IGxhYmVsID0gZGF0YS5sYWJlbDtcclxuXHJcblx0Y29uc29sZS5sb2coJ3JlbmFtZU91dGZpdCcsIGZyYW1ld29ya0lkLCBsYWJlbCwgaWQpO1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxyXG5cdFx0J1VQREFURSBvdXRmaXRzIFNFVCBsYWJlbCA9ID8gV0hFUkUgcGxheWVyX2lkID0gPyBBTkQgaWQgPSA/JyxcclxuXHRcdFtsYWJlbCwgZnJhbWV3b3JrSWQsIGlkXVxyXG5cdCk7XHJcblx0cmV0dXJuIHJlc3VsdDtcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpkZWxldGVPdXRmaXQnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCwgaWQpID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdCdERUxFVEUgRlJPTSBvdXRmaXRzIFdIRVJFIHBsYXllcl9pZCA9ID8gQU5EIGlkID0gPycsXHJcblx0XHRbZnJhbWV3b3JrSWQsIGlkXVxyXG5cdCk7XHJcblx0cmV0dXJuIHJlc3VsdCA+IDA7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZU91dGZpdCcsIGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBkYXRhOiBPdXRmaXQpID0+IHtcclxuXHRjb25zb2xlLmxvZyhcclxuXHRcdGZyYW1ld29ya0lkLFxyXG5cdFx0ZGF0YS5sYWJlbCxcclxuXHRcdGRhdGEub3V0Zml0LFxyXG5cdFx0SlNPTi5zdHJpbmdpZnkoZGF0YS5vdXRmaXQpXHJcblx0KTtcclxuXHRjb25zdCBpZCA9IGF3YWl0IG94bXlzcWwuaW5zZXJ0KFxyXG5cdFx0J0lOU0VSVCBJTlRPIG91dGZpdHMgKHBsYXllcl9pZCwgbGFiZWwsIG91dGZpdCkgVkFMVUVTICg/LCA/LCA/KScsXHJcblx0XHRbZnJhbWV3b3JrSWQsIGRhdGEubGFiZWwsIEpTT04uc3RyaW5naWZ5KGRhdGEub3V0Zml0KV1cclxuXHQpO1xyXG5cdGNvbnNvbGUubG9nKCdpZCcsIGlkKTtcclxuXHRyZXR1cm4gaWQ7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZVNraW4nLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCwgc2tpbikgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxyXG5cdFx0J1VQREFURSBhcHBlYXJhbmNlIFNFVCBza2luID0gPyBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0W0pTT04uc3RyaW5naWZ5KHNraW4pLCBmcmFtZXdvcmtJZF1cclxuXHQpO1xyXG5cdHJldHVybiByZXN1bHQ7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjayhcclxuXHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUNsb3RoZXMnLFxyXG5cdGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBjbG90aGVzKSA9PiB7XHJcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdFx0J1VQREFURSBhcHBlYXJhbmNlIFNFVCBjbG90aGVzID0gPyBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0XHRbSlNPTi5zdHJpbmdpZnkoY2xvdGhlcyksIGZyYW1ld29ya0lkXVxyXG5cdFx0KTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG4pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUFwcGVhcmFuY2UnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCwgYXBwZWFyYW5jZSkgPT4ge1xyXG5cdGNvbnN0IGNsb3RoZXMgPSB7XHJcblx0XHRkcmF3YWJsZXM6IGFwcGVhcmFuY2UuZHJhd2FibGVzLFxyXG5cdFx0cHJvcHM6IGFwcGVhcmFuY2UucHJvcHMsXHJcblx0XHRoZWFkT3ZlcmxheTogYXBwZWFyYW5jZS5oZWFkT3ZlcmxheSxcclxuXHR9O1xyXG5cclxuXHRjb25zdCBza2luID0ge1xyXG5cdFx0aGVhZEJsZW5kOiBhcHBlYXJhbmNlLmhlYWRCbGVuZCxcclxuXHRcdGhlYWRTdHJ1Y3R1cmU6IGFwcGVhcmFuY2UuaGVhZFN0cnVjdHVyZSxcclxuXHRcdGhhaXJDb2xvcjogYXBwZWFyYW5jZS5oYWlyQ29sb3IsXHJcblx0XHRtb2RlbDogYXBwZWFyYW5jZS5tb2RlbCxcclxuXHR9O1xyXG5cclxuXHRjb25zdCB0YXR0b29zID0gYXBwZWFyYW5jZS50YXR0b29zIHx8IFtdO1xyXG5cclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcblx0XHQnSU5TRVJUIElOVE8gYXBwZWFyYW5jZSAoaWQsIGNsb3RoZXMsIHNraW4sIHRhdHRvb3MpIFZBTFVFUyAoPywgPywgPywgPykgT04gRFVQTElDQVRFIEtFWSBVUERBVEUgY2xvdGhlcyA9IFZBTFVFUyhjbG90aGVzKSwgc2tpbiA9IFZBTFVFUyhza2luKSwgdGF0dG9vcyA9IFZBTFVFUyh0YXR0b29zKTsnLFxyXG5cdFx0W1xyXG5cdFx0XHRmcmFtZXdvcmtJZCxcclxuXHRcdFx0SlNPTi5zdHJpbmdpZnkoY2xvdGhlcyksXHJcblx0XHRcdEpTT04uc3RyaW5naWZ5KHNraW4pLFxyXG5cdFx0XHRKU09OLnN0cmluZ2lmeSh0YXR0b29zKSxcclxuXHRcdF1cclxuXHQpO1xyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVUYXR0b29zJywgYXN5bmMgKHNyYywgZnJhbWV3b3JrSWQsIHRhdHRvb3MpID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdCdVUERBVEUgYXBwZWFyYW5jZSBTRVQgdGF0dG9vcyA9ID8gV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtKU09OLnN0cmluZ2lmeSh0YXR0b29zKSwgZnJhbWV3b3JrSWRdXHJcblx0KTtcclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldFNraW4nLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCkgPT4ge1xyXG5cdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG5cdFx0J1NFTEVDVCBza2luIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0W2ZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldENsb3RoZXMnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCkgPT4ge1xyXG5cdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG5cdFx0J1NFTEVDVCBjbG90aGVzIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0W2ZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldFRhdHRvb3MnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCkgPT4ge1xyXG5cdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG5cdFx0J1NFTEVDVCB0YXR0b29zIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0W2ZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpIHx8IFtdO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCkgPT4ge1xyXG5cdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG5cdFx0J1NFTEVDVCAqIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0W2ZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpO1xyXG59KTtcclxuXHJcblJlZ2lzdGVyQ29tbWFuZCgnbWlncmF0ZScsICgpID0+IHtcclxuXHRjb25zb2xlLmxvZygxKVxyXG5cdGNvbnN0IGJsX2FwcGVhcmFuY2UgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2U7XHJcblx0Y29uc3QgY29uZmlnID0gYmxfYXBwZWFyYW5jZS5jb25maWcoKTtcclxuXHRpbXBvcnQoYC4vbWlncmF0ZS8ke2NvbmZpZy5wcmV2aW91c0Nsb3RoaW5nID09PSAnZml2ZW0tYXBwZWFyYW5jZScgPyAnZml2ZW0nIDogY29uZmlnLnByZXZpb3VzQ2xvdGhpbmd9YClcclxufSwgdHJ1ZSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QU0sdUJBQVE7QUFBQSxJQUM1QjtBQUFBLElBQ0E7QUFBQSxNQUNDO0FBQUEsTUFDQSxLQUFLLFVBQVUsT0FBTztBQUFBLE1BQ3RCLEtBQUssVUFBVSxJQUFJO0FBQUEsTUFDbkIsS0FBSyxVQUFVLE9BQU87QUFBQSxJQUN2QjtBQUFBLEVBQ0Q7QUFFQSxTQUFPO0FBQ1IsQ0FBQztBQUVELGlCQUFpQixvQ0FBb0MsT0FBTyxLQUFLLGFBQWEsWUFBWTtBQUN6RixRQUFNLFNBQVMsTUFBTSx1QkFBUTtBQUFBLElBQzVCO0FBQUEsSUFDQSxDQUFDLEtBQUssVUFBVSxPQUFPLEdBQUcsV0FBVztBQUFBLEVBQ3RDO0FBQ0EsU0FBTztBQUNSLENBQUM7QUFFRCxpQkFBaUIsZ0NBQWdDLE9BQU8sS0FBSyxnQkFBZ0I7QUFDNUUsUUFBTSxXQUFXLE1BQU0sdUJBQVE7QUFBQSxJQUM5QjtBQUFBLElBQ0EsQ0FBQyxXQUFXO0FBQUEsRUFDYjtBQUNBLFNBQU8sS0FBSyxNQUFNLFFBQVE7QUFDM0IsQ0FBQztBQUVELGlCQUFpQixtQ0FBbUMsT0FBTyxLQUFLLGdCQUFnQjtBQUMvRSxRQUFNLFdBQVcsTUFBTSx1QkFBUTtBQUFBLElBQzlCO0FBQUEsSUFDQSxDQUFDLFdBQVc7QUFBQSxFQUNiO0FBQ0EsU0FBTyxLQUFLLE1BQU0sUUFBUTtBQUMzQixDQUFDO0FBRUQsaUJBQWlCLG1DQUFtQyxPQUFPLEtBQUssZ0JBQWdCO0FBQy9FLFFBQU0sV0FBVyxNQUFNLHVCQUFRO0FBQUEsSUFDOUI7QUFBQSxJQUNBLENBQUMsV0FBVztBQUFBLEVBQ2I7QUFDQSxTQUFPLEtBQUssTUFBTSxRQUFRLEtBQUssQ0FBQztBQUNqQyxDQUFDO0FBRUQsaUJBQWlCLHNDQUFzQyxPQUFPLEtBQUssZ0JBQWdCO0FBQ2xGLFFBQU0sV0FBVyxNQUFNLHVCQUFRO0FBQUEsSUFDOUI7QUFBQSxJQUNBLENBQUMsV0FBVztBQUFBLEVBQ2I7QUFDQSxTQUFPLEtBQUssTUFBTSxRQUFRO0FBQzNCLENBQUM7QUFFRCxnQkFBZ0IsV0FBVyxNQUFNO0FBQ2hDLFVBQVEsSUFBSSxDQUFDO0FBQ2IsUUFBTSxnQkFBZ0IsUUFBUTtBQUM5QixRQUFNLFNBQVMsY0FBYyxPQUFPO0FBQ3BDLEVBQU8sZ0NBQWEsT0FBTyxxQkFBcUIscUJBQXFCLFVBQVUsT0FBTyxnQkFBZ0I7QUFDdkcsR0FBRyxJQUFJOyIsCiAgIm5hbWVzIjogWyJleHBvcnRzIl0KfQo=
