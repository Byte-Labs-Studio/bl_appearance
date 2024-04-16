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
      console.error(`an error occurred while handling callback event ${eventName}`);
    }
    emitNet(`__ox_cb_${resource}`, src, key, response);
  });
}
__name(onClientCallback, "onClientCallback");

// src/server/init.ts
var import_oxmysql = __toESM(require_MySQL(), 1);
onNet("bl_appearance:server:saveAppearances", async (data) => {
  const src = source;
  const id = data.id ? data.id : GetPlayerIdentifierByType(src, "license");
  const saveData = [JSON.stringify(data.skin), JSON.stringify(data.clothes), JSON.stringify(data.tattoos), id];
  const affectedRows = await import_oxmysql.oxmysql.update("UPDATE bl_appearance SET skin = ?, clothes = ?, tattoos = ? WHERE id = ?", saveData);
  if (affectedRows === 0)
    import_oxmysql.oxmysql.insert("INSERT INTO `bl_appearance` (skin, clothes, tattoos, id) VALUES (?, ?, ?, ?)", saveData, (id2) => {
      console.log(id2);
    });
});
onNet("bl_appearance:server:saveOutfit", async (data) => {
  try {
    const src = source;
    const id = data.id || GetPlayerIdentifierByType(src, "license");
    let outfitsJson = await import_oxmysql.oxmysql.scalar("SELECT `outfits` FROM `bl_appearance` WHERE `id` = ? LIMIT 1", [id]);
    let outfits = outfitsJson ? JSON.parse(outfitsJson) : [];
    outfits.push({ label: data.label, outfit: data.outfit });
    outfitsJson = JSON.stringify(outfits);
    const affectedRows = await import_oxmysql.oxmysql.update("UPDATE bl_appearance SET outfits = ? WHERE id = ?", [outfitsJson, id]);
    if (affectedRows === 0) {
      const newId = await import_oxmysql.oxmysql.insert("INSERT INTO `bl_appearance` (outfits, id) VALUES (?, ?)", [outfitsJson, id]);
      console.log("Inserted new record with ID:", newId);
    }
  } catch (error) {
    console.error("Error saving outfit:", error);
  }
});
onClientCallback("bl_appearance:server:getTattoos&Outfits", async (playerId, id) => {
  const response = await import_oxmysql.oxmysql.prepare("SELECT `tattoos`, `outfits` FROM `bl_appearance` WHERE `id` = ?", [id]);
  return {
    tattoos: JSON.parse(response.tattoos),
    outfits: JSON.parse(response.outfits)
  };
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BvdmVyZXh0ZW5kZWQrb3hteXNxbEAxLjMuMC9ub2RlX21vZHVsZXMvQG92ZXJleHRlbmRlZC9veG15c3FsL015U1FMLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvdXRpbHMvaW5kZXgudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJ0eXBlIFF1ZXJ5ID0gc3RyaW5nIHwgbnVtYmVyO1xyXG50eXBlIFBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5rbm93bltdIHwgRnVuY3Rpb247XHJcbnR5cGUgQ2FsbGJhY2s8VD4gPSAocmVzdWx0OiBUIHwgbnVsbCkgPT4gdm9pZDtcclxuXHJcbnR5cGUgVHJhbnNhY3Rpb24gPVxyXG4gIHwgc3RyaW5nW11cclxuICB8IFtzdHJpbmcsIFBhcmFtc11bXVxyXG4gIHwgeyBxdWVyeTogc3RyaW5nOyB2YWx1ZXM6IFBhcmFtcyB9W11cclxuICB8IHsgcXVlcnk6IHN0cmluZzsgcGFyYW1ldGVyczogUGFyYW1zIH1bXTtcclxuXHJcbmludGVyZmFjZSBSZXN1bHQge1xyXG4gIFtjb2x1bW46IHN0cmluZyB8IG51bWJlcl06IGFueTtcclxuICBhZmZlY3RlZFJvd3M/OiBudW1iZXI7XHJcbiAgZmllbGRDb3VudD86IG51bWJlcjtcclxuICBpbmZvPzogc3RyaW5nO1xyXG4gIGluc2VydElkPzogbnVtYmVyO1xyXG4gIHNlcnZlclN0YXR1cz86IG51bWJlcjtcclxuICB3YXJuaW5nU3RhdHVzPzogbnVtYmVyO1xyXG4gIGNoYW5nZWRSb3dzPzogbnVtYmVyO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUm93IHtcclxuICBbY29sdW1uOiBzdHJpbmcgfCBudW1iZXJdOiB1bmtub3duO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgT3hNeVNRTCB7XHJcbiAgc3RvcmU6IChxdWVyeTogc3RyaW5nKSA9PiB2b2lkO1xyXG4gIHJlYWR5OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQ7XHJcbiAgcXVlcnk6IDxUID0gUmVzdWx0IHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBzaW5nbGU6IDxUID0gUm93IHwgbnVsbD4oXHJcbiAgICBxdWVyeTogUXVlcnksXHJcbiAgICBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxFeGNsdWRlPFQsIFtdPj4sXHJcbiAgICBjYj86IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PlxyXG4gICkgPT4gUHJvbWlzZTxFeGNsdWRlPFQsIFtdPj47XHJcbiAgc2NhbGFyOiA8VCA9IHVua25vd24gfCBudWxsPihcclxuICAgIHF1ZXJ5OiBRdWVyeSxcclxuICAgIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PixcclxuICAgIGNiPzogQ2FsbGJhY2s8RXhjbHVkZTxULCBbXT4+XHJcbiAgKSA9PiBQcm9taXNlPEV4Y2x1ZGU8VCwgW10+PjtcclxuICB1cGRhdGU6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBpbnNlcnQ6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBwcmVwYXJlOiA8VCA9IGFueT4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICByYXdFeGVjdXRlOiA8VCA9IFJlc3VsdCB8IG51bGw+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgdHJhbnNhY3Rpb246IChxdWVyeTogVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPGJvb2xlYW4+LCBjYj86IENhbGxiYWNrPGJvb2xlYW4+KSA9PiBQcm9taXNlPGJvb2xlYW4+O1xyXG4gIGlzUmVhZHk6ICgpID0+IGJvb2xlYW47XHJcbiAgYXdhaXRDb25uZWN0aW9uOiAoKSA9PiBQcm9taXNlPHRydWU+O1xyXG59XHJcblxyXG5jb25zdCBRdWVyeVN0b3JlOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbjogYm9vbGVhbiwgbWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgaWYgKCFjb25kaXRpb24pIHRocm93IG5ldyBUeXBlRXJyb3IobWVzc2FnZSk7XHJcbn1cclxuXHJcbmNvbnN0IHNhZmVBcmdzID0gKHF1ZXJ5OiBRdWVyeSB8IFRyYW5zYWN0aW9uLCBwYXJhbXM/OiBhbnksIGNiPzogRnVuY3Rpb24sIHRyYW5zYWN0aW9uPzogdHJ1ZSkgPT4ge1xyXG4gIGlmICh0eXBlb2YgcXVlcnkgPT09ICdudW1iZXInKSBxdWVyeSA9IFF1ZXJ5U3RvcmVbcXVlcnldO1xyXG5cclxuICBpZiAodHJhbnNhY3Rpb24pIHtcclxuICAgIGFzc2VydCh0eXBlb2YgcXVlcnkgPT09ICdvYmplY3QnLCBgRmlyc3QgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0LCByZWNpZXZlZCAke3R5cGVvZiBxdWVyeX1gKTtcclxuICB9IGVsc2Uge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBxdWVyeSA9PT0gJ3N0cmluZycsIGBGaXJzdCBhcmd1bWVudCBleHBlY3RlZCBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG4gIH1cclxuXHJcbiAgaWYgKHBhcmFtcykge1xyXG4gICAgY29uc3QgcGFyYW1UeXBlID0gdHlwZW9mIHBhcmFtcztcclxuICAgIGFzc2VydChcclxuICAgICAgcGFyYW1UeXBlID09PSAnb2JqZWN0JyB8fCBwYXJhbVR5cGUgPT09ICdmdW5jdGlvbicsXHJcbiAgICAgIGBTZWNvbmQgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0IG9yIGZ1bmN0aW9uLCByZWNlaXZlZCAke3BhcmFtVHlwZX1gXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghY2IgJiYgcGFyYW1UeXBlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGNiID0gcGFyYW1zO1xyXG4gICAgICBwYXJhbXMgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoY2IgIT09IHVuZGVmaW5lZCkgYXNzZXJ0KHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJywgYFRoaXJkIGFyZ3VtZW50IGV4cGVjdGVkIGZ1bmN0aW9uLCByZWNlaXZlZCAke3R5cGVvZiBjYn1gKTtcclxuXHJcbiAgcmV0dXJuIFtxdWVyeSwgcGFyYW1zLCBjYl07XHJcbn07XHJcblxyXG5jb25zdCBleHAgPSBnbG9iYWwuZXhwb3J0cy5veG15c3FsO1xyXG5jb25zdCBjdXJyZW50UmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpO1xyXG5cclxuZnVuY3Rpb24gZXhlY3V0ZShtZXRob2Q6IHN0cmluZywgcXVlcnk6IFF1ZXJ5IHwgVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcykge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBleHBbbWV0aG9kXShcclxuICAgICAgcXVlcnksXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgKHJlc3VsdCwgZXJyb3IpID0+IHtcclxuICAgICAgICBpZiAoZXJyb3IpIHJldHVybiByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIHJlc29sdmUocmVzdWx0KTtcclxuICAgICAgfSxcclxuICAgICAgY3VycmVudFJlc291cmNlTmFtZSxcclxuICAgICAgdHJ1ZVxyXG4gICAgKTtcclxuICB9KSBhcyBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBveG15c3FsOiBPeE15U1FMID0ge1xyXG4gIHN0b3JlKHF1ZXJ5KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIHF1ZXJ5ICE9PSAnc3RyaW5nJywgYFF1ZXJ5IGV4cGVjdHMgYSBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG5cclxuICAgIHJldHVybiBRdWVyeVN0b3JlLnB1c2gocXVlcnkpO1xyXG4gIH0sXHJcbiAgcmVhZHkoY2FsbGJhY2spIHtcclxuICAgIHNldEltbWVkaWF0ZShhc3luYyAoKSA9PiB7XHJcbiAgICAgIHdoaWxlIChHZXRSZXNvdXJjZVN0YXRlKCdveG15c3FsJykgIT09ICdzdGFydGVkJykgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTApKTtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgYXN5bmMgcXVlcnkocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdxdWVyeScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNpbmdsZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NpbmdsZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNjYWxhcihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NjYWxhcicsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHVwZGF0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3VwZGF0ZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIGluc2VydChxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ2luc2VydCcsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHByZXBhcmUocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdwcmVwYXJlJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgcmF3RXhlY3V0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3Jhd0V4ZWN1dGUnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyB0cmFuc2FjdGlvbihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiLCB0cnVlKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3RyYW5zYWN0aW9uJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgaXNSZWFkeSgpIHtcclxuICAgIHJldHVybiBleHAuaXNSZWFkeSgpO1xyXG4gIH0sXHJcbiAgYXN5bmMgYXdhaXRDb25uZWN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGF3YWl0IGV4cC5hd2FpdENvbm5lY3Rpb24oKTtcclxuICB9LFxyXG59O1xyXG4iLCAiLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL3NlcnZlci9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9uQ2xpZW50Q2FsbGJhY2soZXZlbnROYW1lOiBzdHJpbmcsIGNiOiAocGxheWVySWQ6IG51bWJlciwgLi4uYXJnczogYW55W10pID0+IGFueSkge1xyXG4gICAgb25OZXQoYF9fb3hfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcsIGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNyYyA9IHNvdXJjZTtcclxuICAgICAgICBsZXQgcmVzcG9uc2U6IGFueTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBjYihzcmMsIC4uLmFyZ3MpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBhbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBoYW5kbGluZyBjYWxsYmFjayBldmVudCAke2V2ZW50TmFtZX1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGVtaXROZXQoYF9fb3hfY2JfJHtyZXNvdXJjZX1gLCBzcmMsIGtleSwgcmVzcG9uc2UpO1xyXG4gICAgfSk7XHJcbn1cclxuIiwgImltcG9ydCB7b25DbGllbnRDYWxsYmFja30gZnJvbSAnLi91dGlscydcclxuaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCdcclxuaW1wb3J0IHsgT3V0Zml0IH0gZnJvbSAnQGRhdGFUeXBlcy9vdXRmaXRzJztcclxuXHJcbm9uTmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlQXBwZWFyYW5jZXMnLCBhc3luYyAoZGF0YTogYW55KSA9PiB7XHJcbiAgY29uc3Qgc3JjID0gc291cmNlO1xyXG4gIGNvbnN0IGlkID0gZGF0YS5pZCA/IGRhdGEuaWQgOiBHZXRQbGF5ZXJJZGVudGlmaWVyQnlUeXBlKHNyYywgJ2xpY2Vuc2UnKVxyXG5cclxuICBjb25zdCBzYXZlRGF0YSA9IFtKU09OLnN0cmluZ2lmeShkYXRhLnNraW4pLCBKU09OLnN0cmluZ2lmeShkYXRhLmNsb3RoZXMpLCBKU09OLnN0cmluZ2lmeShkYXRhLnRhdHRvb3MpLCBpZF1cclxuXHJcbiAgY29uc3QgYWZmZWN0ZWRSb3dzID0gYXdhaXQgb3hteXNxbC51cGRhdGUoJ1VQREFURSBibF9hcHBlYXJhbmNlIFNFVCBza2luID0gPywgY2xvdGhlcyA9ID8sIHRhdHRvb3MgPSA/IFdIRVJFIGlkID0gPycsIHNhdmVEYXRhKVxyXG4gIGlmIChhZmZlY3RlZFJvd3MgPT09IDApIG94bXlzcWwuaW5zZXJ0KCdJTlNFUlQgSU5UTyBgYmxfYXBwZWFyYW5jZWAgKHNraW4sIGNsb3RoZXMsIHRhdHRvb3MsIGlkKSBWQUxVRVMgKD8sID8sID8sID8pJywgc2F2ZURhdGEsIChpZCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coaWQpXHJcbiAgfSlcclxufSlcclxuXHJcbm9uTmV0KCdibF9hcHBlYXJhbmNlOnNlcnZlcjpzYXZlT3V0Zml0JywgYXN5bmMgKGRhdGE6IE91dGZpdCkgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzcmMgPSBzb3VyY2U7XHJcbiAgICBjb25zdCBpZCA9IGRhdGEuaWQgfHwgR2V0UGxheWVySWRlbnRpZmllckJ5VHlwZShzcmMsICdsaWNlbnNlJyk7XHJcblxyXG4gICAgbGV0IG91dGZpdHNKc29uID0gYXdhaXQgb3hteXNxbC5zY2FsYXIoJ1NFTEVDVCBgb3V0Zml0c2AgRlJPTSBgYmxfYXBwZWFyYW5jZWAgV0hFUkUgYGlkYCA9ID8gTElNSVQgMScsIFtpZF0pIGFzIHN0cmluZztcclxuXHJcbiAgICBsZXQgb3V0Zml0czogT3V0Zml0W10gPSBvdXRmaXRzSnNvbiA/IEpTT04ucGFyc2Uob3V0Zml0c0pzb24pIDogW107XHJcblxyXG4gICAgb3V0Zml0cy5wdXNoKHsgbGFiZWw6IGRhdGEubGFiZWwsIG91dGZpdDogZGF0YS5vdXRmaXQgfSk7XHJcblxyXG4gICAgb3V0Zml0c0pzb24gPSBKU09OLnN0cmluZ2lmeShvdXRmaXRzKTtcclxuXHJcbiAgICBjb25zdCBhZmZlY3RlZFJvd3MgPSBhd2FpdCBveG15c3FsLnVwZGF0ZSgnVVBEQVRFIGJsX2FwcGVhcmFuY2UgU0VUIG91dGZpdHMgPSA/IFdIRVJFIGlkID0gPycsIFtvdXRmaXRzSnNvbiwgaWRdKTtcclxuXHJcbiAgICBpZiAoYWZmZWN0ZWRSb3dzID09PSAwKSB7XHJcbiAgICAgIGNvbnN0IG5ld0lkID0gYXdhaXQgb3hteXNxbC5pbnNlcnQoJ0lOU0VSVCBJTlRPIGBibF9hcHBlYXJhbmNlYCAob3V0Zml0cywgaWQpIFZBTFVFUyAoPywgPyknLCBbb3V0Zml0c0pzb24sIGlkXSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdJbnNlcnRlZCBuZXcgcmVjb3JkIHdpdGggSUQ6JywgbmV3SWQpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzYXZpbmcgb3V0Zml0OicsIGVycm9yKTtcclxuICB9XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0VGF0dG9vcyZPdXRmaXRzJywgYXN5bmMgKHBsYXllcklkLCBpZDogbnVtYmVyIHwgc3RyaW5nKSA9PiB7XHJcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBveG15c3FsLnByZXBhcmUoJ1NFTEVDVCBgdGF0dG9vc2AsIGBvdXRmaXRzYCBGUk9NIGBibF9hcHBlYXJhbmNlYCBXSEVSRSBgaWRgID0gPycsIFtpZF0pXHJcbiAgcmV0dXJuIHtcclxuICAgIHRhdHRvb3M6IEpTT04ucGFyc2UocmVzcG9uc2UudGF0dG9vcyksXHJcbiAgICBvdXRmaXRzOiBKU09OLnBhcnNlKHJlc3BvbnNlLm91dGZpdHMpXHJcbiAgfVxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0RBLFFBQU0sYUFBdUIsQ0FBQTtBQUU3QixhQUFTLE9BQU8sV0FBb0IsU0FBZTtBQUNqRCxVQUFJLENBQUM7QUFBVyxjQUFNLElBQUksVUFBVSxPQUFPO0lBQzdDO0FBRlM7QUFJVCxRQUFNLFdBQVcsd0JBQUMsT0FBNEIsUUFBYyxJQUFlLGdCQUFzQjtBQUMvRixVQUFJLE9BQU8sVUFBVTtBQUFVLGdCQUFRLFdBQVcsS0FBSztBQUV2RCxVQUFJLGFBQWE7QUFDZixlQUFPLE9BQU8sVUFBVSxVQUFVLDRDQUE0QyxPQUFPLEtBQUssRUFBRTthQUN2RjtBQUNMLGVBQU8sT0FBTyxVQUFVLFVBQVUsNENBQTRDLE9BQU8sS0FBSyxFQUFFOztBQUc5RixVQUFJLFFBQVE7QUFDVixjQUFNLFlBQVksT0FBTztBQUN6QixlQUNFLGNBQWMsWUFBWSxjQUFjLFlBQ3hDLHlEQUF5RCxTQUFTLEVBQUU7QUFHdEUsWUFBSSxDQUFDLE1BQU0sY0FBYyxZQUFZO0FBQ25DLGVBQUs7QUFDTCxtQkFBUzs7O0FBSWIsVUFBSSxPQUFPO0FBQVcsZUFBTyxPQUFPLE9BQU8sWUFBWSw4Q0FBOEMsT0FBTyxFQUFFLEVBQUU7QUFFaEgsYUFBTyxDQUFDLE9BQU8sUUFBUSxFQUFFO0lBQzNCLEdBekJpQjtBQTJCakIsUUFBTSxNQUFNLE9BQU8sUUFBUTtBQUMzQixRQUFNLHNCQUFzQix1QkFBc0I7QUFFbEQsYUFBUyxRQUFRLFFBQWdCLE9BQTRCLFFBQWU7QUFDMUUsYUFBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVU7QUFDckMsWUFBSSxNQUFNLEVBQ1IsT0FDQSxRQUNBLENBQUMsUUFBUSxVQUFTO0FBQ2hCLGNBQUk7QUFBTyxtQkFBTyxPQUFPLEtBQUs7QUFDOUIsa0JBQVEsTUFBTTtRQUNoQixHQUNBLHFCQUNBLElBQUk7TUFFUixDQUFDO0lBQ0g7QUFiUztBQWVJLFlBQUEsVUFBbUI7TUFDOUIsTUFBTSxPQUFLO0FBQ1QsZUFBTyxPQUFPLFVBQVUsVUFBVSxvQ0FBb0MsT0FBTyxLQUFLLEVBQUU7QUFFcEYsZUFBTyxXQUFXLEtBQUssS0FBSztNQUM5QjtNQUNBLE1BQU0sVUFBUTtBQUNaLHFCQUFhLFlBQVc7QUFDdEIsaUJBQU8saUJBQWlCLFNBQVMsTUFBTTtBQUFXLGtCQUFNLElBQUksUUFBUSxDQUFDLFlBQVksV0FBVyxTQUFTLEVBQUUsQ0FBQztBQUN4RyxtQkFBUTtRQUNWLENBQUM7TUFDSDtNQUNBLE1BQU0sTUFBTSxPQUFPLFFBQVEsSUFBRTtBQUMzQixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFNBQVMsT0FBTyxNQUFNO0FBQ25ELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sT0FBTyxPQUFPLFFBQVEsSUFBRTtBQUM1QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVUsT0FBTyxNQUFNO0FBQ3BELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sT0FBTyxPQUFPLFFBQVEsSUFBRTtBQUM1QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVUsT0FBTyxNQUFNO0FBQ3BELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sT0FBTyxPQUFPLFFBQVEsSUFBRTtBQUM1QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVUsT0FBTyxNQUFNO0FBQ3BELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sT0FBTyxPQUFPLFFBQVEsSUFBRTtBQUM1QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVUsT0FBTyxNQUFNO0FBQ3BELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sUUFBUSxPQUFPLFFBQVEsSUFBRTtBQUM3QixTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLFdBQVcsT0FBTyxNQUFNO0FBQ3JELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFBSTtNQUMzQjtNQUNBLE1BQU0sV0FBVyxPQUFPLFFBQVEsSUFBRTtBQUNoQyxTQUFDLE9BQU8sUUFBUSxFQUFFLElBQUksU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxRQUFRLGNBQWMsT0FBTyxNQUFNO0FBQ3hELGVBQU8sS0FBSyxHQUFHLE1BQU0sSUFB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
