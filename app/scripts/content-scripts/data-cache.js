//     This file is part of Game Deals extension for Chrome and Firefox
//     https://github.com/DanielKamkha/GameDealsChrome
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  // Cached request, Chrome version
  function makeCachedRequestChrome(requestFunc, tableTame, id1, id2) {
    let varArgs = Array.prototype.slice.call(arguments, 2);
    return new Promise(function (resolve, reject) {
      chrome.storage.local.get(tableTame, function(table) {
        table = table || {};
        let subTable = table[id1] || (table[id1] = {});
        let value = subTable[id2];
        if (value !== undefined) {
          resolve(value);
        } else {
          requestFunc.apply(null, varArgs).then(function(value) {
              subTable[id2] = value;
              chrome.storage.local.set({ tableTame: table });
              resolve(value);
            },
            reject);
        }
      });
    });
  }

  // Cached request, Firefox version
  function makeCachedRequestFirefox(requestFunc, tableName, id1, id2) {
    let varArgs = Array.prototype.slice.call(arguments, 2);
    return new Promise(function (resolve, reject) {
      self.port.once(id1 + "-get-" + tableName + "-" + id2, function(cacheData) {
        if (cacheData.cached) {
          resolve(cacheData.value);
        } else {
          requestFunc.apply(null, varArgs).then(function(value) {
              self.port.emit("set-" + tableName, { args: varArgs, value: value || null });
              resolve(value);
            },
            reject);
        }
      });
      self.port.emit("get-" + tableName, [id1, id2]);
    });
  }

  const makeCachedRequest = chrome ? makeCachedRequestChrome : makeCachedRequestFirefox;

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Cache = {
    getGamePlain: makeCachedRequest.bind(null, GameDeals.Itad.getGamePlain, "plain"),
    getStoreLink: makeCachedRequest.bind(null, GameDeals.Itad.getStoreLink, "store-link")
  };
})();

