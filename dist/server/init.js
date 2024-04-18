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
  "node_modules/.pnpm/@overextended+oxmysql@1.3.0/node_modules/@overextended/oxmysql/MySQL.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.oxmysql = void 0;
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
    exports.oxmysql = {
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
onClientCallback("bl_appearance:server:getOutfits", async (frameworkdId) => {
  let response = await import_oxmysql.oxmysql.prepare(
    "SELECT * FROM outfits WHERE player_id = ?",
    [frameworkdId]
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
onClientCallback(
  "bl_appearance:server:renameOutfit",
  async (frameworkdId, newName, id) => {
    const result = await import_oxmysql.oxmysql.update(
      "UPDATE outfits SET label = ? WHERE player_id = ? AND id = ?",
      [newName, frameworkdId, id]
    );
    return result;
  }
);
onClientCallback(
  "bl_appearance:server:deleteOutfit",
  async (frameworkdId, id) => {
    const result = await import_oxmysql.oxmysql.update(
      "DELETE FROM outfits WHERE player_id = ? AND id = ?",
      [frameworkdId, id]
    );
    return result > 0;
  }
);
onClientCallback(
  "bl_appearance:server:saveOutfit",
  async (frameworkdId, data) => {
    console.log(frameworkdId, data.label, data.outfit, JSON.stringify(data.outfit));
    const id = await import_oxmysql.oxmysql.insert(
      "INSERT INTO outfits (player_id, label, outfit) VALUES (?, ?, ?)",
      [frameworkdId, data.label, JSON.stringify(data.outfit)]
    );
    console.log("id", id);
    return id;
  }
);
onClientCallback(
  "bl_appearance:server:saveSkin",
  async (frameworkdId, skin) => {
    const result = await import_oxmysql.oxmysql.update(
      "UPDATE appearance SET skin = ? WHERE id = ?",
      [JSON.stringify(skin), frameworkdId]
    );
    return result;
  }
);
onClientCallback(
  "bl_appearance:server:saveClothes",
  async (frameworkdId, clothes) => {
    const result = await import_oxmysql.oxmysql.update(
      "UPDATE appearance SET clothes = ? WHERE id = ?",
      [JSON.stringify(clothes), frameworkdId]
    );
    return result;
  }
);
onClientCallback(
  "bl_appearance:server:saveTattoos",
  async (frameworkdId, tattoos) => {
    const result = await import_oxmysql.oxmysql.update(
      "UPDATE appearance SET tattoos = ? WHERE id = ?",
      [JSON.stringify(tattoos), frameworkdId]
    );
    return result;
  }
);
onClientCallback("bl_appearance:server:getSkin", async (frameworkdId) => {
  const response = await import_oxmysql.oxmysql.prepare(
    "SELECT skin FROM appearance WHERE id = ?",
    [frameworkdId]
  );
  return JSON.parse(response);
});
onClientCallback("bl_appearance:server:getClothes", async (frameworkdId) => {
  const response = await import_oxmysql.oxmysql.prepare(
    "SELECT clothes FROM appearance WHERE id = ?",
    [frameworkdId]
  );
  return JSON.parse(response);
});
onClientCallback("bl_appearance:server:getTattoos", async (frameworkdId) => {
  const response = await import_oxmysql.oxmysql.prepare(
    "SELECT tattoos FROM appearance WHERE id = ?",
    [frameworkdId]
  );
  return JSON.parse(response) || [];
});
onClientCallback("bl_appearance:server:getAppearance", async (frameworkdId) => {
  const response = await import_oxmysql.oxmysql.prepare(
    "SELECT * FROM appearance WHERE id = ?",
    [frameworkdId]
  );
  return JSON.parse(response);
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BvdmVyZXh0ZW5kZWQrb3hteXNxbEAxLjMuMC9ub2RlX21vZHVsZXMvQG92ZXJleHRlbmRlZC9veG15c3FsL015U1FMLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvdXRpbHMvaW5kZXgudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJ0eXBlIFF1ZXJ5ID0gc3RyaW5nIHwgbnVtYmVyO1xyXG50eXBlIFBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5rbm93bltdIHwgRnVuY3Rpb247XHJcbnR5cGUgQ2FsbGJhY2s8VD4gPSAocmVzdWx0OiBUIHwgbnVsbCkgPT4gdm9pZDtcclxuXHJcbnR5cGUgVHJhbnNhY3Rpb24gPVxyXG4gIHwgc3RyaW5nW11cclxuICB8IFtzdHJpbmcsIFBhcmFtc11bXVxyXG4gIHwgeyBxdWVyeTogc3RyaW5nOyB2YWx1ZXM6IFBhcmFtcyB9W11cclxuICB8IHsgcXVlcnk6IHN0cmluZzsgcGFyYW1ldGVyczogUGFyYW1zIH1bXTtcclxuXHJcbmludGVyZmFjZSBSZXN1bHQge1xyXG4gIFtjb2x1bW46IHN0cmluZyB8IG51bWJlcl06IGFueTtcclxuICBhZmZlY3RlZFJvd3M/OiBudW1iZXI7XHJcbiAgZmllbGRDb3VudD86IG51bWJlcjtcclxuICBpbmZvPzogc3RyaW5nO1xyXG4gIGluc2VydElkPzogbnVtYmVyO1xyXG4gIHNlcnZlclN0YXR1cz86IG51bWJlcjtcclxuICB3YXJuaW5nU3RhdHVzPzogbnVtYmVyO1xyXG4gIGNoYW5nZWRSb3dzPzogbnVtYmVyO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUm93IHtcclxuICBbY29sdW1uOiBzdHJpbmcgfCBudW1iZXJdOiB1bmtub3duO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgT3hNeVNRTCB7XHJcbiAgc3RvcmU6IChxdWVyeTogc3RyaW5nKSA9PiB2b2lkO1xyXG4gIHJlYWR5OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQ7XHJcbiAgcXVlcnk6IDxUID0gUmVzdWx0IHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBzaW5nbGU6IDxUID0gUm93IHwgbnVsbD4oXHJcbiAgICBxdWVyeTogUXVlcnksXHJcbiAgICBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxFeGNsdWRlPFQsIFtdPj4sXHJcbiAgICBjYj86IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PlxyXG4gICkgPT4gUHJvbWlzZTxFeGNsdWRlPFQsIFtdPj47XHJcbiAgc2NhbGFyOiA8VCA9IHVua25vd24gfCBudWxsPihcclxuICAgIHF1ZXJ5OiBRdWVyeSxcclxuICAgIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PixcclxuICAgIGNiPzogQ2FsbGJhY2s8RXhjbHVkZTxULCBbXT4+XHJcbiAgKSA9PiBQcm9taXNlPEV4Y2x1ZGU8VCwgW10+PjtcclxuICB1cGRhdGU6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBpbnNlcnQ6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBwcmVwYXJlOiA8VCA9IGFueT4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICByYXdFeGVjdXRlOiA8VCA9IFJlc3VsdCB8IG51bGw+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgdHJhbnNhY3Rpb246IChxdWVyeTogVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPGJvb2xlYW4+LCBjYj86IENhbGxiYWNrPGJvb2xlYW4+KSA9PiBQcm9taXNlPGJvb2xlYW4+O1xyXG4gIGlzUmVhZHk6ICgpID0+IGJvb2xlYW47XHJcbiAgYXdhaXRDb25uZWN0aW9uOiAoKSA9PiBQcm9taXNlPHRydWU+O1xyXG59XHJcblxyXG5jb25zdCBRdWVyeVN0b3JlOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbjogYm9vbGVhbiwgbWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgaWYgKCFjb25kaXRpb24pIHRocm93IG5ldyBUeXBlRXJyb3IobWVzc2FnZSk7XHJcbn1cclxuXHJcbmNvbnN0IHNhZmVBcmdzID0gKHF1ZXJ5OiBRdWVyeSB8IFRyYW5zYWN0aW9uLCBwYXJhbXM/OiBhbnksIGNiPzogRnVuY3Rpb24sIHRyYW5zYWN0aW9uPzogdHJ1ZSkgPT4ge1xyXG4gIGlmICh0eXBlb2YgcXVlcnkgPT09ICdudW1iZXInKSBxdWVyeSA9IFF1ZXJ5U3RvcmVbcXVlcnldO1xyXG5cclxuICBpZiAodHJhbnNhY3Rpb24pIHtcclxuICAgIGFzc2VydCh0eXBlb2YgcXVlcnkgPT09ICdvYmplY3QnLCBgRmlyc3QgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0LCByZWNpZXZlZCAke3R5cGVvZiBxdWVyeX1gKTtcclxuICB9IGVsc2Uge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBxdWVyeSA9PT0gJ3N0cmluZycsIGBGaXJzdCBhcmd1bWVudCBleHBlY3RlZCBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG4gIH1cclxuXHJcbiAgaWYgKHBhcmFtcykge1xyXG4gICAgY29uc3QgcGFyYW1UeXBlID0gdHlwZW9mIHBhcmFtcztcclxuICAgIGFzc2VydChcclxuICAgICAgcGFyYW1UeXBlID09PSAnb2JqZWN0JyB8fCBwYXJhbVR5cGUgPT09ICdmdW5jdGlvbicsXHJcbiAgICAgIGBTZWNvbmQgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0IG9yIGZ1bmN0aW9uLCByZWNlaXZlZCAke3BhcmFtVHlwZX1gXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghY2IgJiYgcGFyYW1UeXBlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGNiID0gcGFyYW1zO1xyXG4gICAgICBwYXJhbXMgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoY2IgIT09IHVuZGVmaW5lZCkgYXNzZXJ0KHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJywgYFRoaXJkIGFyZ3VtZW50IGV4cGVjdGVkIGZ1bmN0aW9uLCByZWNlaXZlZCAke3R5cGVvZiBjYn1gKTtcclxuXHJcbiAgcmV0dXJuIFtxdWVyeSwgcGFyYW1zLCBjYl07XHJcbn07XHJcblxyXG5jb25zdCBleHAgPSBnbG9iYWwuZXhwb3J0cy5veG15c3FsO1xyXG5jb25zdCBjdXJyZW50UmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpO1xyXG5cclxuZnVuY3Rpb24gZXhlY3V0ZShtZXRob2Q6IHN0cmluZywgcXVlcnk6IFF1ZXJ5IHwgVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcykge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBleHBbbWV0aG9kXShcclxuICAgICAgcXVlcnksXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgKHJlc3VsdCwgZXJyb3IpID0+IHtcclxuICAgICAgICBpZiAoZXJyb3IpIHJldHVybiByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIHJlc29sdmUocmVzdWx0KTtcclxuICAgICAgfSxcclxuICAgICAgY3VycmVudFJlc291cmNlTmFtZSxcclxuICAgICAgdHJ1ZVxyXG4gICAgKTtcclxuICB9KSBhcyBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBveG15c3FsOiBPeE15U1FMID0ge1xyXG4gIHN0b3JlKHF1ZXJ5KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIHF1ZXJ5ICE9PSAnc3RyaW5nJywgYFF1ZXJ5IGV4cGVjdHMgYSBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG5cclxuICAgIHJldHVybiBRdWVyeVN0b3JlLnB1c2gocXVlcnkpO1xyXG4gIH0sXHJcbiAgcmVhZHkoY2FsbGJhY2spIHtcclxuICAgIHNldEltbWVkaWF0ZShhc3luYyAoKSA9PiB7XHJcbiAgICAgIHdoaWxlIChHZXRSZXNvdXJjZVN0YXRlKCdveG15c3FsJykgIT09ICdzdGFydGVkJykgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTApKTtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgYXN5bmMgcXVlcnkocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdxdWVyeScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNpbmdsZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NpbmdsZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNjYWxhcihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NjYWxhcicsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHVwZGF0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3VwZGF0ZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIGluc2VydChxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ2luc2VydCcsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHByZXBhcmUocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdwcmVwYXJlJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgcmF3RXhlY3V0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3Jhd0V4ZWN1dGUnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyB0cmFuc2FjdGlvbihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiLCB0cnVlKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3RyYW5zYWN0aW9uJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgaXNSZWFkeSgpIHtcclxuICAgIHJldHVybiBleHAuaXNSZWFkeSgpO1xyXG4gIH0sXHJcbiAgYXN5bmMgYXdhaXRDb25uZWN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGF3YWl0IGV4cC5hd2FpdENvbm5lY3Rpb24oKTtcclxuICB9LFxyXG59O1xyXG4iLCAiLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL3NlcnZlci9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xuXG5leHBvcnQgZnVuY3Rpb24gb25DbGllbnRDYWxsYmFjayhldmVudE5hbWU6IHN0cmluZywgY2I6IChwbGF5ZXJJZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSkgPT4gYW55KSB7XG4gICAgb25OZXQoYF9fb3hfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcsIGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICBjb25zdCBzcmMgPSBzb3VyY2U7XG4gICAgICAgIGxldCByZXNwb25zZTogYW55O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IGNiKHNyYywgLi4uYXJncyk7XG4gICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgYW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgaGFuZGxpbmcgY2FsbGJhY2sgZXZlbnQgJHtldmVudE5hbWV9IHwgRXJyb3I6IGAsIGUubWVzc2FnZSk7XG4gICAgICAgIH1cblxuICAgICAgICBlbWl0TmV0KGBfX294X2NiXyR7cmVzb3VyY2V9YCwgc3JjLCBrZXksIHJlc3BvbnNlKTtcbiAgICB9KTtcbn1cbiIsICJpbXBvcnQgeyBvbkNsaWVudENhbGxiYWNrIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBveG15c3FsIH0gZnJvbSAnQG92ZXJleHRlbmRlZC9veG15c3FsJztcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gJ0BkYXRhVHlwZXMvb3V0Zml0cyc7XG5pbXBvcnQgeyBjYXB0dXJlUmVqZWN0aW9uU3ltYm9sIH0gZnJvbSAnZXZlbnRzJztcblxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0T3V0Zml0cycsIGFzeW5jIChmcmFtZXdvcmtkSWQpID0+IHtcblx0bGV0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxuXHRcdCdTRUxFQ1QgKiBGUk9NIG91dGZpdHMgV0hFUkUgcGxheWVyX2lkID0gPycsXG5cdFx0W2ZyYW1ld29ya2RJZF1cblx0KTtcblx0aWYgKCFyZXNwb25zZSkgcmV0dXJuIFtdO1xuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc3BvbnNlKSkge1xuICAgICAgICByZXNwb25zZSA9IFtyZXNwb25zZV1cbiAgICB9XG5cblx0Y29uc3Qgb3V0Zml0cyA9IHJlc3BvbnNlLm1hcChcblx0XHQob3V0Zml0OiB7IGlkOiBudW1iZXI7IGxhYmVsOiBzdHJpbmc7IG91dGZpdDogc3RyaW5nIH0pID0+IHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGlkOiBvdXRmaXQuaWQsXG5cdFx0XHRcdGxhYmVsOiBvdXRmaXQubGFiZWwsXG5cdFx0XHRcdG91dGZpdDogSlNPTi5wYXJzZShvdXRmaXQub3V0Zml0KSxcblx0XHRcdH07XG5cdFx0fVxuXHQpO1xuXG5cdHJldHVybiBvdXRmaXRzO1xufSk7XG5cbm9uQ2xpZW50Q2FsbGJhY2soXG5cdCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZW5hbWVPdXRmaXQnLFxuXHRhc3luYyAoZnJhbWV3b3JrZElkLCBuZXdOYW1lLCBpZCkgPT4ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxuXHRcdFx0J1VQREFURSBvdXRmaXRzIFNFVCBsYWJlbCA9ID8gV0hFUkUgcGxheWVyX2lkID0gPyBBTkQgaWQgPSA/Jyxcblx0XHRcdFtuZXdOYW1lLCBmcmFtZXdvcmtkSWQsIGlkXVxuXHRcdCk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuKTtcblxub25DbGllbnRDYWxsYmFjayhcblx0J2JsX2FwcGVhcmFuY2U6c2VydmVyOmRlbGV0ZU91dGZpdCcsXG5cdGFzeW5jIChmcmFtZXdvcmtkSWQsIGlkKSA9PiB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXG5cdFx0XHQnREVMRVRFIEZST00gb3V0Zml0cyBXSEVSRSBwbGF5ZXJfaWQgPSA/IEFORCBpZCA9ID8nLFxuXHRcdFx0W2ZyYW1ld29ya2RJZCwgaWRdXG5cdFx0KTtcblx0XHRyZXR1cm4gcmVzdWx0ID4gMDtcblx0fVxuKTtcblxub25DbGllbnRDYWxsYmFjayhcblx0J2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVPdXRmaXQnLFxuXHRhc3luYyAoZnJhbWV3b3JrZElkLCBkYXRhOiBPdXRmaXQpID0+IHtcblx0XHRjb25zb2xlLmxvZyhmcmFtZXdvcmtkSWQsIGRhdGEubGFiZWwsIGRhdGEub3V0Zml0LCBKU09OLnN0cmluZ2lmeShkYXRhLm91dGZpdCkpXG5cdFx0Y29uc3QgaWQgPSBhd2FpdCBveG15c3FsLmluc2VydChcblx0XHRcdCdJTlNFUlQgSU5UTyBvdXRmaXRzIChwbGF5ZXJfaWQsIGxhYmVsLCBvdXRmaXQpIFZBTFVFUyAoPywgPywgPyknLFxuXHRcdFx0W2ZyYW1ld29ya2RJZCwgZGF0YS5sYWJlbCwgSlNPTi5zdHJpbmdpZnkoZGF0YS5vdXRmaXQpXVxuXHRcdCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdpZCcsIGlkKVxuXHRcdHJldHVybiBpZDtcblx0fVxuKTtcblxub25DbGllbnRDYWxsYmFjayhcblx0J2JsX2FwcGVhcmFuY2U6c2VydmVyOnNhdmVTa2luJyxcblx0YXN5bmMgKGZyYW1ld29ya2RJZCwgc2tpbikgPT4ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxuXHRcdFx0J1VQREFURSBhcHBlYXJhbmNlIFNFVCBza2luID0gPyBXSEVSRSBpZCA9ID8nLFxuXHRcdFx0W0pTT04uc3RyaW5naWZ5KHNraW4pLCBmcmFtZXdvcmtkSWRdXG5cdFx0KTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG4pO1xuXG5vbkNsaWVudENhbGxiYWNrKFxuXHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUNsb3RoZXMnLFxuXHRhc3luYyAoZnJhbWV3b3JrZElkLCBjbG90aGVzKSA9PiB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXG5cdFx0XHQnVVBEQVRFIGFwcGVhcmFuY2UgU0VUIGNsb3RoZXMgPSA/IFdIRVJFIGlkID0gPycsXG5cdFx0XHRbSlNPTi5zdHJpbmdpZnkoY2xvdGhlcyksIGZyYW1ld29ya2RJZF1cblx0XHQpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cbik7XG5cbm9uQ2xpZW50Q2FsbGJhY2soXG5cdCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlVGF0dG9vcycsXG5cdGFzeW5jIChmcmFtZXdvcmtkSWQsIHRhdHRvb3MpID0+IHtcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcblx0XHRcdCdVUERBVEUgYXBwZWFyYW5jZSBTRVQgdGF0dG9vcyA9ID8gV0hFUkUgaWQgPSA/Jyxcblx0XHRcdFtKU09OLnN0cmluZ2lmeSh0YXR0b29zKSwgZnJhbWV3b3JrZElkXVxuXHRcdCk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuKTtcblxuLy8gbGliLmNhbGxiYWNrLnJlZ2lzdGVyKFwieHJwX2FwcGVhcmFuY2U6Y2I6Z2V0Q2xvdGhlc1wiLCBmdW5jdGlvbihzb3VyY2UsIGNoYXJpZClcbi8vICAgICBsb2NhbCByZXN1bHQgPSBNeVNRTC5xdWVyeS5hd2FpdCgnU0VMRUNUIGNsb3RoZXMgRlJPTSBwbGF5ZXJzIFdIRVJFIGNpdGl6ZW5pZCA9ID8nLCB7IGNoYXJpZCB9KVxuLy8gICAgIGxvY2FsIGNsb3RoZXMgPSBqc29uLmRlY29kZShyZXN1bHRbMV0uY2xvdGhlcylcblxuLy8gICAgIHJldHVybiBjbG90aGVzXG4vLyBlbmQpXG5cbi8vIGxpYi5jYWxsYmFjay5yZWdpc3RlcihcInhycF9hcHBlYXJhbmNlOmNiOmdldFNraW5cIiwgZnVuY3Rpb24oc291cmNlLCBjaGFyaWQpXG4vLyAgICAgbG9jYWwgcmVzdWx0ID0gTXlTUUwucXVlcnkuYXdhaXQoJ1NFTEVDVCBza2luIEZST00gcGxheWVycyBXSEVSRSBjaXRpemVuaWQgPSA/JywgeyBjaGFyaWQgfSlcbi8vICAgICBsb2NhbCBza2luID0ganNvbi5kZWNvZGUocmVzdWx0WzFdLnNraW4pIG9yIHt9XG5cbi8vICAgICByZXR1cm4gc2tpblxuLy8gZW5kKVxuXG4vLyBsaWIuY2FsbGJhY2sucmVnaXN0ZXIoJ3hycF9hcHBlYXJhbmNlOmNiOmdldFRhdHRvb3MnLCBmdW5jdGlvbihzb3VyY2UpXG4vLyAgICAgbG9jYWwgY2hhcmlkID0gUUJDb3JlLkZ1bmN0aW9ucy5HZXRQbGF5ZXIoc291cmNlKS5QbGF5ZXJEYXRhLmNpdGl6ZW5pZFxuXG4vLyAgICAgbG9jYWwgcmVzdWx0ID0gTXlTUUwucXVlcnkuYXdhaXQoJ1NFTEVDVCB0YXR0b29zIEZST00gcGxheWVycyBXSEVSRSBjaXRpemVuaWQgPSA/JywgeyBjaGFyaWQgfSlcbi8vICAgICBsb2NhbCB0YXR0b29zID0ganNvbi5kZWNvZGUocmVzdWx0WzFdLnRhdHRvb3MpXG5cbi8vICAgICByZXR1cm4gdGF0dG9vc1xuLy8gZW5kKVxuXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRTa2luJywgYXN5bmMgKGZyYW1ld29ya2RJZCkgPT4ge1xuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcblx0XHQnU0VMRUNUIHNraW4gRlJPTSBhcHBlYXJhbmNlIFdIRVJFIGlkID0gPycsXG5cdFx0W2ZyYW1ld29ya2RJZF1cblx0KTtcblx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpO1xufSk7XG5cbm9uQ2xpZW50Q2FsbGJhY2soJ2JsX2FwcGVhcmFuY2U6c2VydmVyOmdldENsb3RoZXMnLCBhc3luYyAoZnJhbWV3b3JrZElkKSA9PiB7XG5cdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3hteXNxbC5wcmVwYXJlKFxuXHRcdCdTRUxFQ1QgY2xvdGhlcyBGUk9NIGFwcGVhcmFuY2UgV0hFUkUgaWQgPSA/Jyxcblx0XHRbZnJhbWV3b3JrZElkXVxuXHQpO1xuXHRyZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSk7XG59KTtcblxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0VGF0dG9vcycsIGFzeW5jIChmcmFtZXdvcmtkSWQpID0+IHtcblx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoXG5cdFx0J1NFTEVDVCB0YXR0b29zIEZST00gYXBwZWFyYW5jZSBXSEVSRSBpZCA9ID8nLFxuXHRcdFtmcmFtZXdvcmtkSWRdXG5cdCk7XG5cdHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKSB8fCBbXTtcbn0pO1xuXG5vbkNsaWVudENhbGxiYWNrKCdibF9hcHBlYXJhbmNlOnNlcnZlcjpnZXRBcHBlYXJhbmNlJywgYXN5bmMgKGZyYW1ld29ya2RJZCkgPT4ge1xuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcblx0XHQnU0VMRUNUICogRlJPTSBhcHBlYXJhbmNlIFdIRVJFIGlkID0gPycsXG5cdFx0W2ZyYW1ld29ya2RJZF1cblx0KTtcblx0cmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnREEsUUFBTSxhQUF1QixDQUFBO0FBRTdCLGFBQVMsT0FBTyxXQUFvQixTQUFlO0FBQ2pELFVBQUksQ0FBQztBQUFXLGNBQU0sSUFBSSxVQUFVLE9BQU87SUFDN0M7QUFGUztBQUlULFFBQU0sV0FBVyx3QkFBQyxPQUE0QixRQUFjLElBQWUsZ0JBQXNCO0FBQy9GLFVBQUksT0FBTyxVQUFVO0FBQVUsZ0JBQVEsV0FBVyxLQUFLO0FBRXZELFVBQUksYUFBYTtBQUNmLGVBQU8sT0FBTyxVQUFVLFVBQVUsNENBQTRDLE9BQU8sS0FBSyxFQUFFO2FBQ3ZGO0FBQ0wsZUFBTyxPQUFPLFVBQVUsVUFBVSw0Q0FBNEMsT0FBTyxLQUFLLEVBQUU7O0FBRzlGLFVBQUksUUFBUTtBQUNWLGNBQU0sWUFBWSxPQUFPO0FBQ3pCLGVBQ0UsY0FBYyxZQUFZLGNBQWMsWUFDeEMseURBQXlELFNBQVMsRUFBRTtBQUd0RSxZQUFJLENBQUMsTUFBTSxjQUFjLFlBQVk7QUFDbkMsZUFBSztBQUNMLG1CQUFTOzs7QUFJYixVQUFJLE9BQU87QUFBVyxlQUFPLE9BQU8sT0FBTyxZQUFZLDhDQUE4QyxPQUFPLEVBQUUsRUFBRTtBQUVoSCxhQUFPLENBQUMsT0FBTyxRQUFRLEVBQUU7SUFDM0IsR0F6QmlCO0FBMkJqQixRQUFNLE1BQU0sT0FBTyxRQUFRO0FBQzNCLFFBQU0sc0JBQXNCLHVCQUFzQjtBQUVsRCxhQUFTLFFBQVEsUUFBZ0IsT0FBNEIsUUFBZTtBQUMxRSxhQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVTtBQUNyQyxZQUFJLE1BQU0sRUFDUixPQUNBLFFBQ0EsQ0FBQyxRQUFRLFVB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
