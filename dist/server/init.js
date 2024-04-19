var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
onClientCallback(
  "bl_appearance:server:getOutfits",
  async (src, frameworkId) => {
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
  }
);
onClientCallback(
  "bl_appearance:server:renameOutfit",
  async (src, frameworkId, data) => {
    const id = data.id;
    const label = data.label;
    console.log("renameOutfit", frameworkId, label, id);
    const result = await import_oxmysql.oxmysql.update(
      "UPDATE outfits SET label = ? WHERE player_id = ? AND id = ?",
      [label, frameworkId, id]
    );
    return result;
  }
);
onClientCallback(
  "bl_appearance:server:deleteOutfit",
  async (src, frameworkId, id) => {
    const result = await import_oxmysql.oxmysql.update(
      "DELETE FROM outfits WHERE player_id = ? AND id = ?",
      [frameworkId, id]
    );
    return result > 0;
  }
);
onClientCallback(
  "bl_appearance:server:saveOutfit",
  async (src, frameworkId, data) => {
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
  }
);
onClientCallback(
  "bl_appearance:server:saveSkin",
  async (src, frameworkId, skin) => {
    const result = await import_oxmysql.oxmysql.update(
      "UPDATE appearance SET skin = ? WHERE id = ?",
      [JSON.stringify(skin), frameworkId]
    );
    return result;
  }
);
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
onClientCallback(
  "bl_appearance:server:saveAppearance",
  async (src, frameworkId, appearance) => {
    console.log("frameworkId", frameworkId, appearance);
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
    console.log("result", result);
    return result;
  }
);
onClientCallback(
  "bl_appearance:server:saveTattoos",
  async (src, frameworkId, tattoos) => {
    const result = await import_oxmysql.oxmysql.update(
      "UPDATE appearance SET tattoos = ? WHERE id = ?",
      [JSON.stringify(tattoos), frameworkId]
    );
    return result;
  }
);
onClientCallback("bl_appearance:server:getSkin", async (src, frameworkId) => {
  const response = await import_oxmysql.oxmysql.prepare(
    "SELECT skin FROM appearance WHERE id = ?",
    [frameworkId]
  );
  return JSON.parse(response);
});
onClientCallback(
  "bl_appearance:server:getClothes",
  async (src, frameworkId) => {
    const response = await import_oxmysql.oxmysql.prepare(
      "SELECT clothes FROM appearance WHERE id = ?",
      [frameworkId]
    );
    return JSON.parse(response);
  }
);
onClientCallback(
  "bl_appearance:server:getTattoos",
  async (src, frameworkId) => {
    const response = await import_oxmysql.oxmysql.prepare(
      "SELECT tattoos FROM appearance WHERE id = ?",
      [frameworkId]
    );
    return JSON.parse(response) || [];
  }
);
onClientCallback(
  "bl_appearance:server:getAppearance",
  async (src, frameworkId) => {
    const response = await import_oxmysql.oxmysql.prepare(
      "SELECT * FROM appearance WHERE id = ?",
      [frameworkId]
    );
    return JSON.parse(response);
  }
);
var bl_appearance = exports.bl_appearance;
var config = bl_appearance.config();
if (config.backwardsCompatibility) {
  onClientCallback(
    "bl_appearance:server:PreviousGetAppearance",
    async (src, frameworkId) => {
      let query;
      if (config.previousClothing == "illenium") {
        query = "SELECT * FROM players WHERE citizenid = ?";
      } else if (config.previousClothing == "qb") {
        query = "SELECT * FROM playerskins WHERE citizenid = ? AND active = ?";
      }
      const response = await import_oxmysql.oxmysql.prepare(query, [frameworkId, 1]);
      return JSON.parse(response);
    }
  );
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BvdmVyZXh0ZW5kZWQrb3hteXNxbEAxLjMuMC9ub2RlX21vZHVsZXMvQG92ZXJleHRlbmRlZC9veG15c3FsL015U1FMLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvdXRpbHMvaW5kZXgudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJ0eXBlIFF1ZXJ5ID0gc3RyaW5nIHwgbnVtYmVyO1xyXG50eXBlIFBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5rbm93bltdIHwgRnVuY3Rpb247XHJcbnR5cGUgQ2FsbGJhY2s8VD4gPSAocmVzdWx0OiBUIHwgbnVsbCkgPT4gdm9pZDtcclxuXHJcbnR5cGUgVHJhbnNhY3Rpb24gPVxyXG4gIHwgc3RyaW5nW11cclxuICB8IFtzdHJpbmcsIFBhcmFtc11bXVxyXG4gIHwgeyBxdWVyeTogc3RyaW5nOyB2YWx1ZXM6IFBhcmFtcyB9W11cclxuICB8IHsgcXVlcnk6IHN0cmluZzsgcGFyYW1ldGVyczogUGFyYW1zIH1bXTtcclxuXHJcbmludGVyZmFjZSBSZXN1bHQge1xyXG4gIFtjb2x1bW46IHN0cmluZyB8IG51bWJlcl06IGFueTtcclxuICBhZmZlY3RlZFJvd3M/OiBudW1iZXI7XHJcbiAgZmllbGRDb3VudD86IG51bWJlcjtcclxuICBpbmZvPzogc3RyaW5nO1xyXG4gIGluc2VydElkPzogbnVtYmVyO1xyXG4gIHNlcnZlclN0YXR1cz86IG51bWJlcjtcclxuICB3YXJuaW5nU3RhdHVzPzogbnVtYmVyO1xyXG4gIGNoYW5nZWRSb3dzPzogbnVtYmVyO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUm93IHtcclxuICBbY29sdW1uOiBzdHJpbmcgfCBudW1iZXJdOiB1bmtub3duO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgT3hNeVNRTCB7XHJcbiAgc3RvcmU6IChxdWVyeTogc3RyaW5nKSA9PiB2b2lkO1xyXG4gIHJlYWR5OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQ7XHJcbiAgcXVlcnk6IDxUID0gUmVzdWx0IHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBzaW5nbGU6IDxUID0gUm93IHwgbnVsbD4oXHJcbiAgICBxdWVyeTogUXVlcnksXHJcbiAgICBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxFeGNsdWRlPFQsIFtdPj4sXHJcbiAgICBjYj86IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PlxyXG4gICkgPT4gUHJvbWlzZTxFeGNsdWRlPFQsIFtdPj47XHJcbiAgc2NhbGFyOiA8VCA9IHVua25vd24gfCBudWxsPihcclxuICAgIHF1ZXJ5OiBRdWVyeSxcclxuICAgIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PixcclxuICAgIGNiPzogQ2FsbGJhY2s8RXhjbHVkZTxULCBbXT4+XHJcbiAgKSA9PiBQcm9taXNlPEV4Y2x1ZGU8VCwgW10+PjtcclxuICB1cGRhdGU6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBpbnNlcnQ6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBwcmVwYXJlOiA8VCA9IGFueT4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICByYXdFeGVjdXRlOiA8VCA9IFJlc3VsdCB8IG51bGw+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgdHJhbnNhY3Rpb246IChxdWVyeTogVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPGJvb2xlYW4+LCBjYj86IENhbGxiYWNrPGJvb2xlYW4+KSA9PiBQcm9taXNlPGJvb2xlYW4+O1xyXG4gIGlzUmVhZHk6ICgpID0+IGJvb2xlYW47XHJcbiAgYXdhaXRDb25uZWN0aW9uOiAoKSA9PiBQcm9taXNlPHRydWU+O1xyXG59XHJcblxyXG5jb25zdCBRdWVyeVN0b3JlOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbjogYm9vbGVhbiwgbWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgaWYgKCFjb25kaXRpb24pIHRocm93IG5ldyBUeXBlRXJyb3IobWVzc2FnZSk7XHJcbn1cclxuXHJcbmNvbnN0IHNhZmVBcmdzID0gKHF1ZXJ5OiBRdWVyeSB8IFRyYW5zYWN0aW9uLCBwYXJhbXM/OiBhbnksIGNiPzogRnVuY3Rpb24sIHRyYW5zYWN0aW9uPzogdHJ1ZSkgPT4ge1xyXG4gIGlmICh0eXBlb2YgcXVlcnkgPT09ICdudW1iZXInKSBxdWVyeSA9IFF1ZXJ5U3RvcmVbcXVlcnldO1xyXG5cclxuICBpZiAodHJhbnNhY3Rpb24pIHtcclxuICAgIGFzc2VydCh0eXBlb2YgcXVlcnkgPT09ICdvYmplY3QnLCBgRmlyc3QgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0LCByZWNpZXZlZCAke3R5cGVvZiBxdWVyeX1gKTtcclxuICB9IGVsc2Uge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBxdWVyeSA9PT0gJ3N0cmluZycsIGBGaXJzdCBhcmd1bWVudCBleHBlY3RlZCBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG4gIH1cclxuXHJcbiAgaWYgKHBhcmFtcykge1xyXG4gICAgY29uc3QgcGFyYW1UeXBlID0gdHlwZW9mIHBhcmFtcztcclxuICAgIGFzc2VydChcclxuICAgICAgcGFyYW1UeXBlID09PSAnb2JqZWN0JyB8fCBwYXJhbVR5cGUgPT09ICdmdW5jdGlvbicsXHJcbiAgICAgIGBTZWNvbmQgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0IG9yIGZ1bmN0aW9uLCByZWNlaXZlZCAke3BhcmFtVHlwZX1gXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghY2IgJiYgcGFyYW1UeXBlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGNiID0gcGFyYW1zO1xyXG4gICAgICBwYXJhbXMgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoY2IgIT09IHVuZGVmaW5lZCkgYXNzZXJ0KHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJywgYFRoaXJkIGFyZ3VtZW50IGV4cGVjdGVkIGZ1bmN0aW9uLCByZWNlaXZlZCAke3R5cGVvZiBjYn1gKTtcclxuXHJcbiAgcmV0dXJuIFtxdWVyeSwgcGFyYW1zLCBjYl07XHJcbn07XHJcblxyXG5jb25zdCBleHAgPSBnbG9iYWwuZXhwb3J0cy5veG15c3FsO1xyXG5jb25zdCBjdXJyZW50UmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpO1xyXG5cclxuZnVuY3Rpb24gZXhlY3V0ZShtZXRob2Q6IHN0cmluZywgcXVlcnk6IFF1ZXJ5IHwgVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcykge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBleHBbbWV0aG9kXShcclxuICAgICAgcXVlcnksXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgKHJlc3VsdCwgZXJyb3IpID0+IHtcclxuICAgICAgICBpZiAoZXJyb3IpIHJldHVybiByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIHJlc29sdmUocmVzdWx0KTtcclxuICAgICAgfSxcclxuICAgICAgY3VycmVudFJlc291cmNlTmFtZSxcclxuICAgICAgdHJ1ZVxyXG4gICAgKTtcclxuICB9KSBhcyBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBveG15c3FsOiBPeE15U1FMID0ge1xyXG4gIHN0b3JlKHF1ZXJ5KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIHF1ZXJ5ICE9PSAnc3RyaW5nJywgYFF1ZXJ5IGV4cGVjdHMgYSBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG5cclxuICAgIHJldHVybiBRdWVyeVN0b3JlLnB1c2gocXVlcnkpO1xyXG4gIH0sXHJcbiAgcmVhZHkoY2FsbGJhY2spIHtcclxuICAgIHNldEltbWVkaWF0ZShhc3luYyAoKSA9PiB7XHJcbiAgICAgIHdoaWxlIChHZXRSZXNvdXJjZVN0YXRlKCdveG15c3FsJykgIT09ICdzdGFydGVkJykgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTApKTtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgYXN5bmMgcXVlcnkocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdxdWVyeScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNpbmdsZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NpbmdsZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNjYWxhcihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NjYWxhcicsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHVwZGF0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3VwZGF0ZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIGluc2VydChxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ2luc2VydCcsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHByZXBhcmUocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdwcmVwYXJlJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgcmF3RXhlY3V0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3Jhd0V4ZWN1dGUnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyB0cmFuc2FjdGlvbihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiLCB0cnVlKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3RyYW5zYWN0aW9uJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgaXNSZWFkeSgpIHtcclxuICAgIHJldHVybiBleHAuaXNSZWFkeSgpO1xyXG4gIH0sXHJcbiAgYXN5bmMgYXdhaXRDb25uZWN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGF3YWl0IGV4cC5hd2FpdENvbm5lY3Rpb24oKTtcclxuICB9LFxyXG59O1xyXG4iLCAiLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL3NlcnZlci9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9uQ2xpZW50Q2FsbGJhY2soZXZlbnROYW1lOiBzdHJpbmcsIGNiOiAocGxheWVySWQ6IG51bWJlciwgLi4uYXJnczogYW55W10pID0+IGFueSkge1xyXG4gICAgb25OZXQoYF9fb3hfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcsIGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNyYyA9IHNvdXJjZTtcclxuICAgICAgICBsZXQgcmVzcG9uc2U6IGFueTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBjYihzcmMsIC4uLmFyZ3MpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBhbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBoYW5kbGluZyBjYWxsYmFjayBldmVudCAke2V2ZW50TmFtZX0gfCBFcnJvcjogYCwgZS5tZXNzYWdlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGVtaXROZXQoYF9fb3hfY2JfJHtyZXNvdXJjZX1gLCBzcmMsIGtleSwgcmVzcG9uc2UpO1xyXG4gICAgfSk7XHJcbn1cclxuIiwgImltcG9ydCB7IG9uQ2xpZW50Q2FsbGJhY2sgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCc7XHJcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gJ0B0eXBpbmdzL291dGZpdHMnO1xyXG5cclxub25DbGllbnRDYWxsYmFjayhcclxuXHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0T3V0Zml0cycsXHJcblx0YXN5bmMgKHNyYywgZnJhbWV3b3JrSWQpID0+IHtcclxuXHRcdGxldCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdFx0J1NFTEVDVCAqIEZST00gb3V0Zml0cyBXSEVSRSBwbGF5ZXJfaWQgPSA/JyxcclxuXHRcdFx0W2ZyYW1ld29ya0lkXVxyXG5cdFx0KTtcclxuXHRcdGlmICghcmVzcG9uc2UpIHJldHVybiBbXTtcclxuXHJcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkocmVzcG9uc2UpKSB7XHJcblx0XHRcdHJlc3BvbnNlID0gW3Jlc3BvbnNlXTtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCBvdXRmaXRzID0gcmVzcG9uc2UubWFwKFxyXG5cdFx0XHQob3V0Zml0OiB7IGlkOiBudW1iZXI7IGxhYmVsOiBzdHJpbmc7IG91dGZpdDogc3RyaW5nIH0pID0+IHtcclxuXHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0aWQ6IG91dGZpdC5pZCxcclxuXHRcdFx0XHRcdGxhYmVsOiBvdXRmaXQubGFiZWwsXHJcblx0XHRcdFx0XHRvdXRmaXQ6IEpTT04ucGFyc2Uob3V0Zml0Lm91dGZpdCksXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fVxyXG5cdFx0KTtcclxuXHJcblx0XHRyZXR1cm4gb3V0Zml0cztcclxuXHR9XHJcbik7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKFxyXG5cdCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZW5hbWVPdXRmaXQnLFxyXG5cdGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBkYXRhKSA9PiB7XHJcblx0XHRjb25zdCBpZCA9IGRhdGEuaWQ7XHJcblx0XHRjb25zdCBsYWJlbCA9IGRhdGEubGFiZWw7XHJcblxyXG5cdFx0Y29uc29sZS5sb2coJ3JlbmFtZU91dGZpdCcsIGZyYW1ld29ya0lkLCBsYWJlbCwgaWQpO1xyXG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcblx0XHRcdCdVUERBVEUgb3V0Zml0cyBTRVQgbGFiZWwgPSA/IFdIRVJFIHBsYXllcl9pZCA9ID8gQU5EIGlkID0gPycsXHJcblx0XHRcdFtsYWJlbCwgZnJhbWV3b3JrSWQsIGlkXVxyXG5cdFx0KTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG4pO1xyXG5cclxub25DbGllbnRDYWxsYmFjayhcclxuXHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6ZGVsZXRlT3V0Zml0JyxcclxuXHRhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCwgaWQpID0+IHtcclxuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxyXG5cdFx0XHQnREVMRVRFIEZST00gb3V0Zml0cyBXSEVSRSBwbGF5ZXJfaWQgPSA/IEFORCBpZCA9ID8nLFxyXG5cdFx0XHRbZnJhbWV3b3JrSWQsIGlkXVxyXG5cdFx0KTtcclxuXHRcdHJldHVybiByZXN1bHQgPiAwO1xyXG5cdH1cclxuKTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soXHJcblx0J2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVPdXRmaXQnLFxyXG5cdGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBkYXRhOiBPdXRmaXQpID0+IHtcclxuXHRcdGNvbnNvbGUubG9nKFxyXG5cdFx0XHRmcmFtZXdvcmtJZCxcclxuXHRcdFx0ZGF0YS5sYWJlbCxcclxuXHRcdFx0ZGF0YS5vdXRmaXQsXHJcblx0XHRcdEpTT04uc3RyaW5naWZ5KGRhdGEub3V0Zml0KVxyXG5cdFx0KTtcclxuXHRcdGNvbnN0IGlkID0gYXdhaXQgb3hteXNxbC5pbnNlcnQoXHJcblx0XHRcdCdJTlNFUlQgSU5UTyBvdXRmaXRzIChwbGF5ZXJfaWQsIGxhYmVsLCBvdXRmaXQpIFZBTFVFUyAoPywgPywgPyknLFxyXG5cdFx0XHRbZnJhbWV3b3JrSWQsIGRhdGEubGFiZWwsIEpTT04uc3RyaW5naWZ5KGRhdGEub3V0Zml0KV1cclxuXHRcdCk7XHJcblx0XHRjb25zb2xlLmxvZygnaWQnLCBpZCk7XHJcblx0XHRyZXR1cm4gaWQ7XHJcblx0fVxyXG4pO1xyXG5cclxub25DbGllbnRDYWxsYmFjayhcclxuXHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZVNraW4nLFxyXG5cdGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBza2luKSA9PiB7XHJcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdFx0J1VQREFURSBhcHBlYXJhbmNlIFNFVCBza2luID0gPyBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0XHRbSlNPTi5zdHJpbmdpZnkoc2tpbiksIGZyYW1ld29ya0lkXVxyXG5cdFx0KTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG4pO1xyXG5cclxub25DbGllbnRDYWxsYmFjayhcclxuXHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUNsb3RoZXMnLFxyXG5cdGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBjbG90aGVzKSA9PiB7XHJcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdFx0J1VQREFURSBhcHBlYXJhbmNlIFNFVCBjbG90aGVzID0gPyBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0XHRbSlNPTi5zdHJpbmdpZnkoY2xvdGhlcyksIGZyYW1ld29ya0lkXVxyXG5cdFx0KTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG4pO1xyXG5cclxub25DbGllbnRDYWxsYmFjayhcclxuXHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUFwcGVhcmFuY2UnLFxyXG5cdGFzeW5jIChzcmMsIGZyYW1ld29ya0lkLCBhcHBlYXJhbmNlKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2ZyYW1ld29ya0lkJywgZnJhbWV3b3JrSWQsIGFwcGVhcmFuY2UpO1xyXG5cclxuXHRcdGNvbnN0IGNsb3RoZXMgPSB7XHJcblx0XHRcdGRyYXdhYmxlczogYXBwZWFyYW5jZS5kcmF3YWJsZXMsXHJcblx0XHRcdHByb3BzOiBhcHBlYXJhbmNlLnByb3BzLFxyXG5cdFx0XHRoZWFkT3ZlcmxheTogYXBwZWFyYW5jZS5oZWFkT3ZlcmxheSxcclxuXHRcdH07XHJcblxyXG5cdFx0Y29uc3Qgc2tpbiA9IHtcclxuXHRcdFx0aGVhZEJsZW5kOiBhcHBlYXJhbmNlLmhlYWRCbGVuZCxcclxuXHRcdFx0aGVhZFN0cnVjdHVyZTogYXBwZWFyYW5jZS5oZWFkU3RydWN0dXJlLFxyXG5cdFx0XHRoYWlyQ29sb3I6IGFwcGVhcmFuY2UuaGFpckNvbG9yLFxyXG5cdFx0XHRtb2RlbDogYXBwZWFyYW5jZS5tb2RlbCxcclxuXHRcdH07XHJcblxyXG5cdFx0Y29uc3QgdGF0dG9vcyA9IGFwcGVhcmFuY2UudGF0dG9vcyB8fCBbXTtcclxuXHJcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXHJcblx0XHRcdCdJTlNFUlQgSU5UTyBhcHBlYXJhbmNlIChpZCwgY2xvdGhlcywgc2tpbiwgdGF0dG9vcykgVkFMVUVTICg/LCA/LCA/LCA/KSBPTiBEVVBMSUNBVEUgS0VZIFVQREFURSBjbG90aGVzID0gVkFMVUVTKGNsb3RoZXMpLCBza2luID0gVkFMVUVTKHNraW4pLCB0YXR0b29zID0gVkFMVUVTKHRhdHRvb3MpOycsXHJcblx0XHRcdFtcclxuICAgICAgICAgICAgICAgIGZyYW1ld29ya0lkLFxyXG5cdFx0XHRcdEpTT04uc3RyaW5naWZ5KGNsb3RoZXMpLFxyXG5cdFx0XHRcdEpTT04uc3RyaW5naWZ5KHNraW4pLFxyXG5cdFx0XHRcdEpTT04uc3RyaW5naWZ5KHRhdHRvb3MpLFxyXG5cdFx0XHRdXHJcblx0XHQpO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygncmVzdWx0JywgcmVzdWx0KTtcclxuXHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuKTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soXHJcblx0J2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVUYXR0b29zJyxcclxuXHRhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCwgdGF0dG9vcykgPT4ge1xyXG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcblx0XHRcdCdVUERBVEUgYXBwZWFyYW5jZSBTRVQgdGF0dG9vcyA9ID8gV0hFUkUgaWQgPSA/JyxcclxuXHRcdFx0W0pTT04uc3RyaW5naWZ5KHRhdHRvb3MpLCBmcmFtZXdvcmtJZF1cclxuXHRcdCk7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuKTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldFNraW4nLCBhc3luYyAoc3JjLCBmcmFtZXdvcmtJZCkgPT4ge1xyXG5cdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxyXG5cdFx0J1NFTEVDVCBza2luIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0W2ZyYW1ld29ya0lkXVxyXG5cdCk7XHJcblx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpO1xyXG59KTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soXHJcblx0J2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldENsb3RoZXMnLFxyXG5cdGFzeW5jIChzcmMsIGZyYW1ld29ya0lkKSA9PiB7XHJcblx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdFx0J1NFTEVDVCBjbG90aGVzIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0XHRbZnJhbWV3b3JrSWRdXHJcblx0XHQpO1xyXG5cdFx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpO1xyXG5cdH1cclxuKTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soXHJcblx0J2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldFRhdHRvb3MnLFxyXG5cdGFzeW5jIChzcmMsIGZyYW1ld29ya0lkKSA9PiB7XHJcblx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdFx0J1NFTEVDVCB0YXR0b29zIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0XHRbZnJhbWV3b3JrSWRdXHJcblx0XHQpO1xyXG5cdFx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpIHx8IFtdO1xyXG5cdH1cclxuKTtcclxuXHJcbm9uQ2xpZW50Q2FsbGJhY2soXHJcblx0J2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldEFwcGVhcmFuY2UnLFxyXG5cdGFzeW5jIChzcmMsIGZyYW1ld29ya0lkKSA9PiB7XHJcblx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdFx0J1NFTEVDVCAqIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxyXG5cdFx0XHRbZnJhbWV3b3JrSWRdXHJcblx0XHQpO1xyXG5cdFx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpO1xyXG5cdH1cclxuKTtcclxuXHJcbmNvbnN0IGJsX2FwcGVhcmFuY2UgPSBleHBvcnRzLmJsX2FwcGVhcmFuY2U7XHJcbmNvbnN0IGNvbmZpZyA9IGJsX2FwcGVhcmFuY2UuY29uZmlnKCk7XHJcbmlmIChjb25maWcuYmFja3dhcmRzQ29tcGF0aWJpbGl0eSkge1xyXG5cdG9uQ2xpZW50Q2FsbGJhY2soXHJcblx0XHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6UHJldmlvdXNHZXRBcHBlYXJhbmNlJyxcclxuXHRcdGFzeW5jIChzcmMsIGZyYW1ld29ya0lkKSA9PiB7XHJcblx0XHRcdGxldCBxdWVyeTtcclxuXHRcdFx0aWYgKGNvbmZpZy5wcmV2aW91c0Nsb3RoaW5nID09ICdpbGxlbml1bScpIHtcclxuXHRcdFx0XHRxdWVyeSA9ICdTRUxFQ1QgKiBGUk9NIHBsYXllcnMgV0hFUkUgY2l0aXplbmlkID0gPyc7XHJcblx0XHRcdH0gZWxzZSBpZiAoY29uZmlnLnByZXZpb3VzQ2xvdGhpbmcgPT0gJ3FiJykge1xyXG5cdFx0XHRcdHF1ZXJ5ID1cclxuXHRcdFx0XHRcdCdTRUxFQ1QgKiBGUk9NIHBsYXllcnNraW5zIFdIRVJFIGNpdGl6ZW5pZCA9ID8gQU5EIGFjdGl2ZSA9ID8nO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShxdWVyeSwgW2ZyYW1ld29ya0lkLCAxXSk7XHJcblx0XHRcdHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxuXHRcdH1cclxuXHQpO1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdEQSxRQUFNLGFBQXVCLENBQUE7QUFFN0IsYUFBUyxPQUFPLFdBQW9CLFNBQWU7QUFDakQsVUFBSSxDQUFDO0FBQVcsY0FBTSxJQUFJLFVBQVUsT0FBTztJQUM3QztBQUZTO0FBSVQsUUFBTSxXQUFXLHdCQUFDLE9BQTRCLFFBQWMsSUFBZSxnQkFBc0I7QUFDL0YsVUFBSSxPQUFPLFVBQVU7QUFBVSxnQkFBUSxXQUFXLEtBQUs7QUFFdkQsVUFBSSxhQUFhO0FBQ2YsZUFBTyxPQUFPLFVBQVUsVUFBVSw0Q0FBNEMsT0FBTyxLQUFLLEVBQUU7YUFDdkY7QUFDTCxlQUFPLE9BQU8sVUFBVSxVQUFVLDRDQUE0QyxPQUFPLEtBQUssRUFBRTs7QUFHOUYsVUFBSSxRQUFRO0FBQ1YsY0FBTSxZQUFZLE9BQU87QUFDekIsZUFDRSxjQUFjLFlBQVksY0FBYyxZQUN4Qyx5REFBeUQsU0FBUyxFQUFFO0FBR3RFLFlBQUksQ0FBQyxNQUFNLGNBQWMsWUFBWTtBQUNuQyxlQUFLO0FBQ0wsbUJBQVM7OztBQUliLFVBQUksT0FBTztBQUFXLGVBQU8sT0FBTyxPQUFPLFlBQVksOENBQThDLE9BQU8sRUFBRSxFQUFFO0FBRWhILGFBQU8sQ0FBQyxPQUFPLFFBQVEsRUFBRTtJQUMzQixHQXpCaUI7QUEyQmpCLFFBQU0sTUFBTSxPQUFPLFFBQVE7QUFDM0IsUUFBTSxzQkFBc0IsdUJBQXNCO0FBRWxELGFBQVMsUUFBUSxRQUFnQixPQUE0QixRQUFlO0FBQzFFLGFBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFVO0FBQ3JDLFlBQUksTUFBTSxFQUNSLE9BQ0EsUUFDQSxDQUFDLFFBQVEsVUFBUztBQUNoQixjQUFJO0FBQU8sbUJBQU8sT0FBTyxLQUFLO0FBQzlCLGtCQUFRLE1BQU07UUFDaEIsR0FDQSxxQkFDQSxJQUFJO01BRVIsQ0FBQztJQUNIO0FBYlM7QUFlSSxJQUFBQSxTQUFBLFVBQW1CO01BQzlCLE1BQU0sT0FBSztBQUNULGVBQU8sT0FBTyxVQUFVLFVBQVUsb0NBQW9DLE9BQU8sS0FBSyxFQUFFO0FBRXBGLGVBQU8sV0FBVyxLQUFLLEtBQUs7TUFDOUI7TUFDQSxNQUFNLFVBQVE7QUFDWixxQkFBYSxZQUFXO0FBQ3RCLGlCQUFPLGlCQUFpQixTQUFTLE1BQU07QUFBVyxrQkFBTSxJQUFJLFFBQVEsQ0FBQyxZQUFZLFdBQVcsU0FBUyxFQUFFLENBQUM7QUFDeEcsbUJBQVE7UUFDVixDQUFDO01BQ0g7TUFDQSxNQUFNLE1BQU0sT0FBTyxRQUFRLElBQUU7QUFDM0IsU0FBQyxPQUFPLFFBQVEsRUFBRSxJQUFJLFNBQVMsT0FBTyxRQUFRLEVBQUU7QUFDaEQsY0FBTSxTQUFTLE1BQU0sUUFBUSxTQUFTLE9BQU8sTUFBTTtBQUNuRCxlQUFPLEtBQUssR0FBRyxNQUFNLElBQUk7TUFDM0I7TUFDQSxNQUFNLE9BQU8sT0FBTyxRQUFRLElBQUU7QUFDNUIsU0FBQyxPQUFPLFFBQVEsRUFBRSxJQUFJLFNBQVMsT0FBTyxRQUFRLEVBQUU7QUFDaEQsY0FBTSxTQUFTLE1BQU0sUUFBUSxVQUFVLE9BQU8sTUFBTTtBQUNwRCxlQUFPLEtBQUssR0FBRyxNQUFNLElBQUk7TUFDM0I7TUFDQSxNQUFNLE9BQU8sT0FBTyxRQUFRLElBQUU7QUFDNUIsU0FBQyxPQUFPLFFBQVEsRUFBRSxJQUFJLFNBQVMsT0FBTyxRQUFRLEVBQUU7QUFDaEQsY0FBTSxTQUFTLE1BQU0sUUFBUSxVQUFVLE9BQU8sTUFBTTtBQUNwRCxlQUFPLEtBQUssR0FBRyxNQUFNLElBQUk7TUFDM0I7TUFDQSxNQUFNLE9BQU8sT0FBTyxRQUFRLElBQUU7QUFDNUIsU0FBQyxPQUFPLFFBQVEsRUFBRSxJQUFJLFNBQVMsT0FBTyxRQUFRLEVBQUU7QUFDaEQsY0FBTSxTQUFTLE1BQU0sUUFBUSxVQUFVLE9BQU8sTUFBTTtBQUNwRCxlQUFPLEtBQUssR0FBRyxNQUFNLElBQUk7TUFDM0I7TUFDQSxNQUFNLE9BQU8sT0FBTyxRQUFRLElBQUU7QUFDNUIsU0FBQyxPQUFPLFFBQVEsRUFBRSxJQUFJLFNBQVMsT0FBTyxRQUFRLEVBQUU7QUFDaEQsY0FBTSxTQUFTLE1BQU0sUUFBUSxVQUFVLE9BQU8sTUFBTTtBQUNwRCxlQUFPLEtBQUssR0FBRyxNQUFNLElBQUk7TUFDM0I7TUFDQSxNQUFNLFFBQVEsT0FBTyxRQUFRLElBQUU7QUFDN0IsU0FBQyxPQUFPLFFBQVEsRUFBRSxJQUFJLFNBQVMsT0FBTyxRQUFRLEVBQUU7QUFDaEQsY0FBTSxTQUFTLE1BQU0sUUFBUSxXQUFXLE9BQU8sTUFBTTtBQUNyRCxlQUFPLEtBQUss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
