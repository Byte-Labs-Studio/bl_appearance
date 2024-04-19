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
  console.log("frameworkdId", frameworkdId);
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
    console.log(
      frameworkdId,
      data.label,
      data.outfit,
      JSON.stringify(data.outfit)
    );
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
  "bl_appearance:server:saveAppearance",
  async (frameworkdId, appearance) => {
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
    const result = await import_oxmysql.oxmysql.update(
      "UPDATE appearance SET clothes = ?, SET skin = ?, SET tattoos = ? WHERE id = ?",
      [JSON.stringify(clothes), JSON.stringify(skin), JSON.stringify(tattoos), frameworkdId]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BvdmVyZXh0ZW5kZWQrb3hteXNxbEAxLjMuMC9ub2RlX21vZHVsZXMvQG92ZXJleHRlbmRlZC9veG15c3FsL015U1FMLnRzIiwgIi4uLy4uL3NyYy9zZXJ2ZXIvdXRpbHMvaW5kZXgudHMiLCAiLi4vLi4vc3JjL3NlcnZlci9pbml0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJ0eXBlIFF1ZXJ5ID0gc3RyaW5nIHwgbnVtYmVyO1xyXG50eXBlIFBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5rbm93bltdIHwgRnVuY3Rpb247XHJcbnR5cGUgQ2FsbGJhY2s8VD4gPSAocmVzdWx0OiBUIHwgbnVsbCkgPT4gdm9pZDtcclxuXHJcbnR5cGUgVHJhbnNhY3Rpb24gPVxyXG4gIHwgc3RyaW5nW11cclxuICB8IFtzdHJpbmcsIFBhcmFtc11bXVxyXG4gIHwgeyBxdWVyeTogc3RyaW5nOyB2YWx1ZXM6IFBhcmFtcyB9W11cclxuICB8IHsgcXVlcnk6IHN0cmluZzsgcGFyYW1ldGVyczogUGFyYW1zIH1bXTtcclxuXHJcbmludGVyZmFjZSBSZXN1bHQge1xyXG4gIFtjb2x1bW46IHN0cmluZyB8IG51bWJlcl06IGFueTtcclxuICBhZmZlY3RlZFJvd3M/OiBudW1iZXI7XHJcbiAgZmllbGRDb3VudD86IG51bWJlcjtcclxuICBpbmZvPzogc3RyaW5nO1xyXG4gIGluc2VydElkPzogbnVtYmVyO1xyXG4gIHNlcnZlclN0YXR1cz86IG51bWJlcjtcclxuICB3YXJuaW5nU3RhdHVzPzogbnVtYmVyO1xyXG4gIGNoYW5nZWRSb3dzPzogbnVtYmVyO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUm93IHtcclxuICBbY29sdW1uOiBzdHJpbmcgfCBudW1iZXJdOiB1bmtub3duO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgT3hNeVNRTCB7XHJcbiAgc3RvcmU6IChxdWVyeTogc3RyaW5nKSA9PiB2b2lkO1xyXG4gIHJlYWR5OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQ7XHJcbiAgcXVlcnk6IDxUID0gUmVzdWx0IHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBzaW5nbGU6IDxUID0gUm93IHwgbnVsbD4oXHJcbiAgICBxdWVyeTogUXVlcnksXHJcbiAgICBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxFeGNsdWRlPFQsIFtdPj4sXHJcbiAgICBjYj86IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PlxyXG4gICkgPT4gUHJvbWlzZTxFeGNsdWRlPFQsIFtdPj47XHJcbiAgc2NhbGFyOiA8VCA9IHVua25vd24gfCBudWxsPihcclxuICAgIHF1ZXJ5OiBRdWVyeSxcclxuICAgIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPEV4Y2x1ZGU8VCwgW10+PixcclxuICAgIGNiPzogQ2FsbGJhY2s8RXhjbHVkZTxULCBbXT4+XHJcbiAgKSA9PiBQcm9taXNlPEV4Y2x1ZGU8VCwgW10+PjtcclxuICB1cGRhdGU6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBpbnNlcnQ6IDxUID0gbnVtYmVyIHwgbnVsbD4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICBwcmVwYXJlOiA8VCA9IGFueT4ocXVlcnk6IFF1ZXJ5LCBwYXJhbXM/OiBQYXJhbXMgfCBDYWxsYmFjazxUPiwgY2I/OiBDYWxsYmFjazxUPikgPT4gUHJvbWlzZTxUPjtcclxuICByYXdFeGVjdXRlOiA8VCA9IFJlc3VsdCB8IG51bGw+KHF1ZXJ5OiBRdWVyeSwgcGFyYW1zPzogUGFyYW1zIHwgQ2FsbGJhY2s8VD4sIGNiPzogQ2FsbGJhY2s8VD4pID0+IFByb21pc2U8VD47XHJcbiAgdHJhbnNhY3Rpb246IChxdWVyeTogVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcyB8IENhbGxiYWNrPGJvb2xlYW4+LCBjYj86IENhbGxiYWNrPGJvb2xlYW4+KSA9PiBQcm9taXNlPGJvb2xlYW4+O1xyXG4gIGlzUmVhZHk6ICgpID0+IGJvb2xlYW47XHJcbiAgYXdhaXRDb25uZWN0aW9uOiAoKSA9PiBQcm9taXNlPHRydWU+O1xyXG59XHJcblxyXG5jb25zdCBRdWVyeVN0b3JlOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbjogYm9vbGVhbiwgbWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgaWYgKCFjb25kaXRpb24pIHRocm93IG5ldyBUeXBlRXJyb3IobWVzc2FnZSk7XHJcbn1cclxuXHJcbmNvbnN0IHNhZmVBcmdzID0gKHF1ZXJ5OiBRdWVyeSB8IFRyYW5zYWN0aW9uLCBwYXJhbXM/OiBhbnksIGNiPzogRnVuY3Rpb24sIHRyYW5zYWN0aW9uPzogdHJ1ZSkgPT4ge1xyXG4gIGlmICh0eXBlb2YgcXVlcnkgPT09ICdudW1iZXInKSBxdWVyeSA9IFF1ZXJ5U3RvcmVbcXVlcnldO1xyXG5cclxuICBpZiAodHJhbnNhY3Rpb24pIHtcclxuICAgIGFzc2VydCh0eXBlb2YgcXVlcnkgPT09ICdvYmplY3QnLCBgRmlyc3QgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0LCByZWNpZXZlZCAke3R5cGVvZiBxdWVyeX1gKTtcclxuICB9IGVsc2Uge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBxdWVyeSA9PT0gJ3N0cmluZycsIGBGaXJzdCBhcmd1bWVudCBleHBlY3RlZCBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG4gIH1cclxuXHJcbiAgaWYgKHBhcmFtcykge1xyXG4gICAgY29uc3QgcGFyYW1UeXBlID0gdHlwZW9mIHBhcmFtcztcclxuICAgIGFzc2VydChcclxuICAgICAgcGFyYW1UeXBlID09PSAnb2JqZWN0JyB8fCBwYXJhbVR5cGUgPT09ICdmdW5jdGlvbicsXHJcbiAgICAgIGBTZWNvbmQgYXJndW1lbnQgZXhwZWN0ZWQgb2JqZWN0IG9yIGZ1bmN0aW9uLCByZWNlaXZlZCAke3BhcmFtVHlwZX1gXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghY2IgJiYgcGFyYW1UeXBlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGNiID0gcGFyYW1zO1xyXG4gICAgICBwYXJhbXMgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoY2IgIT09IHVuZGVmaW5lZCkgYXNzZXJ0KHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJywgYFRoaXJkIGFyZ3VtZW50IGV4cGVjdGVkIGZ1bmN0aW9uLCByZWNlaXZlZCAke3R5cGVvZiBjYn1gKTtcclxuXHJcbiAgcmV0dXJuIFtxdWVyeSwgcGFyYW1zLCBjYl07XHJcbn07XHJcblxyXG5jb25zdCBleHAgPSBnbG9iYWwuZXhwb3J0cy5veG15c3FsO1xyXG5jb25zdCBjdXJyZW50UmVzb3VyY2VOYW1lID0gR2V0Q3VycmVudFJlc291cmNlTmFtZSgpO1xyXG5cclxuZnVuY3Rpb24gZXhlY3V0ZShtZXRob2Q6IHN0cmluZywgcXVlcnk6IFF1ZXJ5IHwgVHJhbnNhY3Rpb24sIHBhcmFtcz86IFBhcmFtcykge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBleHBbbWV0aG9kXShcclxuICAgICAgcXVlcnksXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgKHJlc3VsdCwgZXJyb3IpID0+IHtcclxuICAgICAgICBpZiAoZXJyb3IpIHJldHVybiByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIHJlc29sdmUocmVzdWx0KTtcclxuICAgICAgfSxcclxuICAgICAgY3VycmVudFJlc291cmNlTmFtZSxcclxuICAgICAgdHJ1ZVxyXG4gICAgKTtcclxuICB9KSBhcyBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBveG15c3FsOiBPeE15U1FMID0ge1xyXG4gIHN0b3JlKHF1ZXJ5KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIHF1ZXJ5ICE9PSAnc3RyaW5nJywgYFF1ZXJ5IGV4cGVjdHMgYSBzdHJpbmcsIHJlY2VpdmVkICR7dHlwZW9mIHF1ZXJ5fWApO1xyXG5cclxuICAgIHJldHVybiBRdWVyeVN0b3JlLnB1c2gocXVlcnkpO1xyXG4gIH0sXHJcbiAgcmVhZHkoY2FsbGJhY2spIHtcclxuICAgIHNldEltbWVkaWF0ZShhc3luYyAoKSA9PiB7XHJcbiAgICAgIHdoaWxlIChHZXRSZXNvdXJjZVN0YXRlKCdveG15c3FsJykgIT09ICdzdGFydGVkJykgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTApKTtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgYXN5bmMgcXVlcnkocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdxdWVyeScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNpbmdsZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NpbmdsZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHNjYWxhcihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3NjYWxhcicsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHVwZGF0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3VwZGF0ZScsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIGluc2VydChxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ2luc2VydCcsIHF1ZXJ5LCBwYXJhbXMpO1xyXG4gICAgcmV0dXJuIGNiID8gY2IocmVzdWx0KSA6IHJlc3VsdDtcclxuICB9LFxyXG4gIGFzeW5jIHByZXBhcmUocXVlcnksIHBhcmFtcywgY2IpIHtcclxuICAgIFtxdWVyeSwgcGFyYW1zLCBjYl0gPSBzYWZlQXJncyhxdWVyeSwgcGFyYW1zLCBjYik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCdwcmVwYXJlJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgYXN5bmMgcmF3RXhlY3V0ZShxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3Jhd0V4ZWN1dGUnLCBxdWVyeSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjYiA/IGNiKHJlc3VsdCkgOiByZXN1bHQ7XHJcbiAgfSxcclxuICBhc3luYyB0cmFuc2FjdGlvbihxdWVyeSwgcGFyYW1zLCBjYikge1xyXG4gICAgW3F1ZXJ5LCBwYXJhbXMsIGNiXSA9IHNhZmVBcmdzKHF1ZXJ5LCBwYXJhbXMsIGNiLCB0cnVlKTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoJ3RyYW5zYWN0aW9uJywgcXVlcnksIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2IgPyBjYihyZXN1bHQpIDogcmVzdWx0O1xyXG4gIH0sXHJcbiAgaXNSZWFkeSgpIHtcclxuICAgIHJldHVybiBleHAuaXNSZWFkeSgpO1xyXG4gIH0sXHJcbiAgYXN5bmMgYXdhaXRDb25uZWN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGF3YWl0IGV4cC5hd2FpdENvbm5lY3Rpb24oKTtcclxuICB9LFxyXG59O1xyXG4iLCAiLy9odHRwczovL2dpdGh1Yi5jb20vb3ZlcmV4dGVuZGVkL294X2xpYi9ibG9iL21hc3Rlci9wYWNrYWdlL3NlcnZlci9yZXNvdXJjZS9jYWxsYmFjay9pbmRleC50c1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9uQ2xpZW50Q2FsbGJhY2soZXZlbnROYW1lOiBzdHJpbmcsIGNiOiAocGxheWVySWQ6IG51bWJlciwgLi4uYXJnczogYW55W10pID0+IGFueSkge1xyXG4gICAgb25OZXQoYF9fb3hfY2JfJHtldmVudE5hbWV9YCwgYXN5bmMgKHJlc291cmNlOiBzdHJpbmcsIGtleTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNyYyA9IHNvdXJjZTtcclxuICAgICAgICBsZXQgcmVzcG9uc2U6IGFueTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBjYihzcmMsIC4uLmFyZ3MpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBhbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBoYW5kbGluZyBjYWxsYmFjayBldmVudCAke2V2ZW50TmFtZX0gfCBFcnJvcjogYCwgZS5tZXNzYWdlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGVtaXROZXQoYF9fb3hfY2JfJHtyZXNvdXJjZX1gLCBzcmMsIGtleSwgcmVzcG9uc2UpO1xyXG4gICAgfSk7XHJcbn1cclxuIiwgImltcG9ydCB7IG9uQ2xpZW50Q2FsbGJhY2sgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgb3hteXNxbCB9IGZyb20gJ0BvdmVyZXh0ZW5kZWQvb3hteXNxbCc7XHJcbmltcG9ydCB7IE91dGZpdCB9IGZyb20gJ0B0eXBpbmdzL291dGZpdHMnO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0T3V0Zml0cycsIGFzeW5jIChmcmFtZXdvcmtkSWQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdmcmFtZXdvcmtkSWQnLCBmcmFtZXdvcmtkSWQpO1xyXG5cdGxldCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1QgKiBGUk9NIG91dGZpdHMgV0hFUkUgcGxheWVyX2lkID0gPycsXHJcblx0XHRbZnJhbWV3b3JrZElkXVxyXG5cdCk7XHJcblx0aWYgKCFyZXNwb25zZSkgcmV0dXJuIFtdO1xyXG5cclxuXHRpZiAoIUFycmF5LmlzQXJyYXkocmVzcG9uc2UpKSB7XHJcblx0XHRyZXNwb25zZSA9IFtyZXNwb25zZV07XHJcblx0fVxyXG5cclxuXHRjb25zdCBvdXRmaXRzID0gcmVzcG9uc2UubWFwKFxyXG5cdFx0KG91dGZpdDogeyBpZDogbnVtYmVyOyBsYWJlbDogc3RyaW5nOyBvdXRmaXQ6IHN0cmluZyB9KSA9PiB7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0aWQ6IG91dGZpdC5pZCxcclxuXHRcdFx0XHRsYWJlbDogb3V0Zml0LmxhYmVsLFxyXG5cdFx0XHRcdG91dGZpdDogSlNPTi5wYXJzZShvdXRmaXQub3V0Zml0KSxcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHQpO1xyXG5cclxuXHRyZXR1cm4gb3V0Zml0cztcclxufSk7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKFxyXG5cdCdibF9hcHBlYXJhbmNlOnNlcnZlcjpyZW5hbWVPdXRmaXQnLFxyXG5cdGFzeW5jIChmcmFtZXdvcmtkSWQsIG5ld05hbWUsIGlkKSA9PiB7XHJcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdFx0J1VQREFURSBvdXRmaXRzIFNFVCBsYWJlbCA9ID8gV0hFUkUgcGxheWVyX2lkID0gPyBBTkQgaWQgPSA/JyxcclxuXHRcdFx0W25ld05hbWUsIGZyYW1ld29ya2RJZCwgaWRdXHJcblx0XHQpO1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcbik7XHJcblxyXG5vbkNsaWVudENhbGxiYWNrKFxyXG5cdCdibF9hcHBlYXJhbmNlOnNlcnZlcjpkZWxldGVPdXRmaXQnLFxyXG5cdGFzeW5jIChmcmFtZXdvcmtkSWQsIGlkKSA9PiB7XHJcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBveG15c3FsLnVwZGF0ZShcclxuXHRcdFx0J0RFTEVURSBGUk9NIG91dGZpdHMgV0hFUkUgcGxheWVyX2lkID0gPyBBTkQgaWQgPSA/JyxcclxuXHRcdFx0W2ZyYW1ld29ya2RJZCwgaWRdXHJcblx0XHQpO1xyXG5cdFx0cmV0dXJuIHJlc3VsdCA+IDA7XHJcblx0fVxyXG4pO1xyXG5cclxub25DbGllbnRDYWxsYmFjayhcclxuXHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZU91dGZpdCcsXHJcblx0YXN5bmMgKGZyYW1ld29ya2RJZCwgZGF0YTogT3V0Zml0KSA9PiB7XHJcblx0XHRjb25zb2xlLmxvZyhcclxuXHRcdFx0ZnJhbWV3b3JrZElkLFxyXG5cdFx0XHRkYXRhLmxhYmVsLFxyXG5cdFx0XHRkYXRhLm91dGZpdCxcclxuXHRcdFx0SlNPTi5zdHJpbmdpZnkoZGF0YS5vdXRmaXQpXHJcblx0XHQpO1xyXG5cdFx0Y29uc3QgaWQgPSBhd2FpdCBveG15c3FsLmluc2VydChcclxuXHRcdFx0J0lOU0VSVCBJTlRPIG91dGZpdHMgKHBsYXllcl9pZCwgbGFiZWwsIG91dGZpdCkgVkFMVUVTICg/LCA/LCA/KScsXHJcblx0XHRcdFtmcmFtZXdvcmtkSWQsIGRhdGEubGFiZWwsIEpTT04uc3RyaW5naWZ5KGRhdGEub3V0Zml0KV1cclxuXHRcdCk7XHJcblx0XHRjb25zb2xlLmxvZygnaWQnLCBpZCk7XHJcblx0XHRyZXR1cm4gaWQ7XHJcblx0fVxyXG4pO1xyXG5cclxub25DbGllbnRDYWxsYmFjayhcclxuXHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZVNraW4nLFxyXG5cdGFzeW5jIChmcmFtZXdvcmtkSWQsIHNraW4pID0+IHtcclxuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxyXG5cdFx0XHQnVVBEQVRFIGFwcGVhcmFuY2UgU0VUIHNraW4gPSA/IFdIRVJFIGlkID0gPycsXHJcblx0XHRcdFtKU09OLnN0cmluZ2lmeShza2luKSwgZnJhbWV3b3JrZElkXVxyXG5cdFx0KTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG4pO1xyXG5cclxub25DbGllbnRDYWxsYmFjayhcclxuXHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUNsb3RoZXMnLFxyXG5cdGFzeW5jIChmcmFtZXdvcmtkSWQsIGNsb3RoZXMpID0+IHtcclxuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxyXG5cdFx0XHQnVVBEQVRFIGFwcGVhcmFuY2UgU0VUIGNsb3RoZXMgPSA/IFdIRVJFIGlkID0gPycsXHJcblx0XHRcdFtKU09OLnN0cmluZ2lmeShjbG90aGVzKSwgZnJhbWV3b3JrZElkXVxyXG5cdFx0KTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG4pO1xyXG5cclxub25DbGllbnRDYWxsYmFjayhcclxuXHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZUFwcGVhcmFuY2UnLFxyXG5cdGFzeW5jIChmcmFtZXdvcmtkSWQsIGFwcGVhcmFuY2UpID0+IHtcclxuXHRcdGNvbnN0IGNsb3RoZXMgPSB7XHJcblx0XHRcdGRyYXdhYmxlczogYXBwZWFyYW5jZS5kcmF3YWJsZXMsXHJcblx0XHRcdHByb3BzOiBhcHBlYXJhbmNlLnByb3BzLFxyXG5cdFx0XHRoZWFkT3ZlcmxheTogYXBwZWFyYW5jZS5oZWFkT3ZlcmxheSxcclxuXHRcdH07XHJcblxyXG5cdFx0Y29uc3Qgc2tpbiA9IHtcclxuXHRcdFx0aGVhZEJsZW5kOiBhcHBlYXJhbmNlLmhlYWRCbGVuZCxcclxuXHRcdFx0aGVhZFN0cnVjdHVyZTogYXBwZWFyYW5jZS5oZWFkU3RydWN0dXJlLFxyXG5cdFx0XHRoYWlyQ29sb3I6IGFwcGVhcmFuY2UuaGFpckNvbG9yLFxyXG5cdFx0XHRtb2RlbDogYXBwZWFyYW5jZS5tb2RlbCxcclxuXHRcdH07XHJcblxyXG4gICAgICAgIGNvbnN0IHRhdHRvb3MgPSBhcHBlYXJhbmNlLnRhdHRvb3MgfHwgW107XHJcblxyXG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgb3hteXNxbC51cGRhdGUoXHJcblx0XHRcdCdVUERBVEUgYXBwZWFyYW5jZSBTRVQgY2xvdGhlcyA9ID8sIFNFVCBza2luID0gPywgU0VUIHRhdHRvb3MgPSA/IFdIRVJFIGlkID0gPycsXHJcblx0XHRcdFtKU09OLnN0cmluZ2lmeShjbG90aGVzKSwgSlNPTi5zdHJpbmdpZnkoc2tpbiksIEpTT04uc3RyaW5naWZ5KHRhdHRvb3MpLCBmcmFtZXdvcmtkSWRdXHJcblx0XHQpO1xyXG5cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG4pO1xyXG5cclxub25DbGllbnRDYWxsYmFjayhcclxuXHQnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6c2F2ZVRhdHRvb3MnLFxyXG5cdGFzeW5jIChmcmFtZXdvcmtkSWQsIHRhdHRvb3MpID0+IHtcclxuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG94bXlzcWwudXBkYXRlKFxyXG5cdFx0XHQnVVBEQVRFIGFwcGVhcmFuY2UgU0VUIHRhdHRvb3MgPSA/IFdIRVJFIGlkID0gPycsXHJcblx0XHRcdFtKU09OLnN0cmluZ2lmeSh0YXR0b29zKSwgZnJhbWV3b3JrZElkXVxyXG5cdFx0KTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG4pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0U2tpbicsIGFzeW5jIChmcmFtZXdvcmtkSWQpID0+IHtcclxuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1Qgc2tpbiBGUk9NIGFwcGVhcmFuY2UgV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtmcmFtZXdvcmtkSWRdXHJcblx0KTtcclxuXHRyZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSk7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0Q2xvdGhlcycsIGFzeW5jIChmcmFtZXdvcmtkSWQpID0+IHtcclxuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1QgY2xvdGhlcyBGUk9NIGFwcGVhcmFuY2UgV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtmcmFtZXdvcmtkSWRdXHJcblx0KTtcclxuXHRyZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSk7XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0VGF0dG9vcycsIGFzeW5jIChmcmFtZXdvcmtkSWQpID0+IHtcclxuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1QgdGF0dG9vcyBGUk9NIGFwcGVhcmFuY2UgV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtmcmFtZXdvcmtkSWRdXHJcblx0KTtcclxuXHRyZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSkgfHwgW107XHJcbn0pO1xyXG5cclxub25DbGllbnRDYWxsYmFjaygnYmxfYXBwZWFyYW5jZTpzZXJ2ZXI6Z2V0QXBwZWFyYW5jZScsIGFzeW5jIChmcmFtZXdvcmtkSWQpID0+IHtcclxuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IG94bXlzcWwucHJlcGFyZShcclxuXHRcdCdTRUxFQ1QgKiBGUk9NIGFwcGVhcmFuY2UgV0hFUkUgaWQgPSA/JyxcclxuXHRcdFtmcmFtZXdvcmtkSWRdXHJcblx0KTtcclxuXHRyZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSk7XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnREEsUUFBTSxhQUF1QixDQUFBO0FBRTdCLGFBQVMsT0FBTyxXQUFvQixTQUFlO0FBQ2pELFVBQUksQ0FBQztBQUFXLGNBQU0sSUFBSSxVQUFVLE9BQU87SUFDN0M7QUFGUztBQUlULFFBQU0sV0FBVyx3QkFBQyxPQUE0QixRQUFjLElBQWUsZ0JBQXNCO0FBQy9GLFVBQUksT0FBTyxVQUFVO0FBQVUsZ0JBQVEsV0FBVyxLQUFLO0FBRXZELFVBQUksYUFBYTtBQUNmLGVBQU8sT0FBTyxVQUFVLFVBQVUsNENBQTRDLE9BQU8sS0FBSyxFQUFFO2FBQ3ZGO0FBQ0wsZUFBTyxPQUFPLFVBQVUsVUFBVSw0Q0FBNEMsT0FBTyxLQUFLLEVBQUU7O0FBRzlGLFVBQUksUUFBUTtBQUNWLGNBQU0sWUFBWSxPQUFPO0FBQ3pCLGVBQ0UsY0FBYyxZQUFZLGNBQWMsWUFDeEMseURBQXlELFNBQVMsRUFBRTtBQUd0RSxZQUFJLENBQUMsTUFBTSxjQUFjLFlBQVk7QUFDbkMsZUFBSztBQUNMLG1CQUFTOzs7QUFJYixVQUFJLE9BQU87QUFBVyxlQUFPLE9BQU8sT0FBTyxZQUFZLDhDQUE4QyxPQUFPLEVBQUUsRUFBRTtBQUVoSCxhQUFPLENBQUMsT0FBTyxRQUFRLEVBQUU7SUFDM0IsR0F6QmlCO0FBMkJqQixRQUFNLE1BQU0sT0FBTyxRQUFRO0FBQzNCLFFBQU0sc0JBQXNCLHVCQUFzQjtBQUVsRCxhQUFTLFFBQVEsUUFBZ0IsT0FBNEIsUUFBZTtBQUMxRSxhQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVTtBQUNyQyxZQUFJLE1BQU0sRUFDUixPQUNBLFFBQ0EsQ0FBQyxRQUFRLFVBQVM7QUFDaEIsY0FBSTtBQUFPLG1CQUFPLE9BQU8sS0FBSztBQUM5QixrQkFBUSxNQUFNO1FBQ2hCLEdBQ0EscUJBQ0EsSUFBSTtNQUVSLENBQUM7SUFDSDtBQWJTO0FBZUksWUFBQSxVQUFtQjtNQUM5QixNQUFNLE9BQUs7QUFDVCxlQUFPLE9BQU8sVUFBVSxVQUFVLG9DQUFvQyxPQUFPLEtBQUssRUFBRTtBQUVwRixlQUFPLFdBQVcsS0FBSyxLQUFLO01BQzlCO01BQ0EsTUFBTSxVQUFRO0FBQ1oscUJBQWEsWUFBVztBQUN0QixpQkFBTyxpQkFBaUIsU0FBUyxNQUFNO0FBQVcsa0JBQU0sSUFBSSxRQUFRLENBQUMsWUFBWSxXQUFXLFNBQVMsRUFBRSxDQUFDO0FBQ3hHLG1CQUFRO1FBQ1YsQ0FBQztNQUNIO01BQ0EsTUFBTSxNQUFNLE9BQU8sUUFBUSxJQUFFO0FBQzNCLFNBQUMsT0FBTyxRQUFRLEVBQUUsSUFBSSxTQUFTLE9BQU8sUUFBUSxFQUFFO0FBQ2hELGNBQU0sU0FBUyxNQUFNLFFBQVEsU0FBUyxPQUFPLE1BQU07QUFDbkQsZUFBTyxLQUFLLEdBQUcsTUFBTSxJQUFJO01BQzNCO01BQ0EsTUFBTSxPQUFPLE9BQU8sUUFBUSxJQUFFO0FBQzVCLFNBQUMsT0FBTyxRQUFRLEVBQUUsSUFBSSxTQUFTLE9BQU8sUUFBUSxFQUFFO0FBQ2hELGNBQU0sU0FBUyxNQUFNLFFBQVEsVUFBVSxPQUFPLE1BQU07QUFDcEQsZUFBTyxLQUFLLEdBQUcsTUFBTSxJQUFJO01BQzNCO01BQ0EsTUFBTSxPQUFPLE9BQU8sUUFBUSxJQUFFO0FBQzVCLFNBQUMsT0FBTyxRQUFRLEVBQUUsSUFBSSxTQUFTLE9BQU8sUUFBUSxFQUFFO0FBQ2hELGNBQU0sU0FBUyxNQUFNLFFBQVEsVUFBVSxPQUFPLE1BQU07QUFDcEQsZUFBTyxLQUFLLEdBQUcsTUFBTSxJQUFJO01BQzNCO01BQ0EsTUFBTSxPQUFPLE9BQU8sUUFBUSxJQUFFO0FBQzVCLFNBQUMsT0FBTyxRQUFRLEVBQUUsSUFBSSxTQUFTLE9BQU8sUUFBUSxFQUFFO0FBQ2hELGNBQU0sU0FBUyxNQUFNLFFBQVEsVUFBVSxPQUFPLE1BQU07QUFDcEQsZUFBTyxLQUFLLEdBQUcsTUFBTSxJQUFJO01BQzNCO01BQ0EsTUFBTSxPQUFPLE9BQU8sUUFBUSxJQUFFO0FBQzVCLFNBQUMsT0FBTyxRQUFRLEVBQUUsSUFBSSxTQUFTLE9BQU8sUUFBUSxFQUFFO0FBQ2hELGNBQU0sU0FBUyxNQUFNLFFBQVEsVUFBVSxPQUFPLE1BQU07QUFDcEQsZUFBTyxLQUFLLEdBQUcsTUFBTSxJQUFJO01BQzNCO01BQ0EsTUFBTSxRQUFRLE9BQU8sUUFBUSxJQUFFO0FBQzdCLFNBQUMsT0FBTyxRQUFRLEVBQUUsSUFBSSxTQUFTLE9BQU8sUUFBUSxFQUFFO0FBQ2hELGNBQU0sU0FBUyxNQUFNLFFBQVEsV0FBVyxPQUFPLE1BQU07QUFDckQsZUFBTyxLQUFLLEdBQUcsTUFBTSxJQUFJO01BQzNCO01BQ0EsTUFBTSxXQUFXLE9BQU8sUUFBUSxJQUFFO0FBQ2hDLFNBQUMsT0FBTyxRQUFRLEVBQUUsSUFBSSxTQUFTLE9BQU8sUUFBUSxFQUFFO0FBQ2hELGNBQU0sU0FBUyxNQUFNLFFBQVEsY0FBYyxPQUFPLE1BQU07QUFDeEQsZUFBTyxLQUFLLEdBQUcsTUFBTSxJQUFJO01BQzNCO01BQ0EsTUFBTSxZQUFZLE9BQU8sUUFBUSxJQUFFO0FBQ2pDLFNBQUMsT0FBTyxRQUFRLEVBQUUsSUFBSSxTQUFTLE9BQU8sUUFBUSxJQUFJLElBQUk7QUFDdEQsY0FBTSxTQUFTLE1BQU0sUUFBUSxl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QUEsTUFDZixXQUFXLFdBQVc7QUFBQSxNQUN0QixPQUFPLFdBQVc7QUFBQSxNQUNsQixhQUFhLFdBQVc7QUFBQSxJQUN6QjtBQUVBLFVBQU0sT0FBTztBQUFBLE1BQ1osV0FBVyxXQUFXO0FBQUEsTUFDdEIsZUFBZSxXQUFXO0FBQUEsTUFDMUIsV0FBVyxXQUFXO0FBQUEsTUFDdEIsT0FBTyxXQUFXO0FBQUEsSUFDbkI7QUFFTSxVQUFNLFVBQVUsV0FBVyxXQUFXLENBQUM7QUFFN0MsVUFBTSxTQUFTLE1BQU0sdUJBQVE7QUFBQSxNQUM1QjtBQUFBLE1BQ0EsQ0FBQyxLQUFLLFVBQVUsT0FBTyxHQUFHLEtBQUssVUFBVSxJQUFJLEdBQUcsS0FBSyxVQUFVLE9BQU8sR0FBRyxZQUFZO0FBQUEsSUFDdEY7QUFFQSxXQUFPO0FBQUEsRUFDUjtBQUNEO0FBRUE7QUFBQSxFQUNDO0FBQUEsRUFDQSxPQUFPLGNBQWMsWUFBWTtBQUNoQyxVQUFNLFNBQVMsTUFBTSx1QkFBUTtBQUFBLE1BQzVCO0FBQUEsTUFDQSxDQUFDLEtBQUssVUFBVSxPQUFPLEdBQUcsWUFBWTtBQUFBLElBQ3ZDO0FBQ0EsV0FBTztBQUFBLEVBQ1I7QUFDRDtBQUVBLGlCQUFpQixnQ0FBZ0MsT0FBTyxpQkFBaUI7QUFDeEUsUUFBTSxXQUFXLE1BQU0sdUJBQVE7QUFBQSxJQUM5QjtBQUFBLElBQ0EsQ0FBQyxZQUFZO0FBQUEsRUFDZDtBQUNBLFNBQU8sS0FBSyxNQUFNLFFBQVE7QUFDM0IsQ0FBQztBQUVELGlCQUFpQixtQ0FBbUMsT0FBTyxpQkFBaUI7QUFDM0UsUUFBTSxXQUFXLE1BQU0sdUJBQVE7QUFBQSxJQUM5QjtBQUFBLElBQ0EsQ0FBQyxZQUFZO0FBQUEsRUFDZDtBQUNBLFNBQU8sS0FBSyxNQUFNLFFBQVE7QUFDM0IsQ0FBQztBQUVELGlCQUFpQixtQ0FBbUMsT0FBTyxpQkFBaUI7QUFDM0UsUUFBTSxXQUFXLE1BQU0sdUJBQVE7QUFBQSxJQUM5QjtBQUFBLElBQ0EsQ0FBQyxZQUFZO0FBQUEsRUFDZDtBQUNBLFNBQU8sS0FBSyxNQUFNLFFBQVEsS0FBSyxDQUFDO0FBQ2pDLENBQUM7QUFFRCxpQkFBaUIsc0NBQXNDLE9BQU8saUJBQWlCO0FBQzlFLFFBQU0sV0FBVyxNQUFNLHVCQUFRO0FBQUEsSUFDOUI7QUFBQSxJQUNBLENBQUMsWUFBWTtBQUFBLEVBQ2Q7QUFDQSxTQUFPLEtBQUssTUFBTSxRQUFRO0FBQzNCLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
