//     This file is part of Game Deals extension for Mozilla Firefox
//     https://github.com/DanielKamkha/GameDealsFirefox
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  function makeCachedRequest(requestFunc, valueName, id1, id2) {
    let varArgs = Array.prototype.slice.call(arguments, 2);
    return new Promise(function (resolve, reject) {
      self.port.once(id1 + "-get-" + valueName + "-" + id2, function(cacheData) {
        if (cacheData.cached) {
          resolve(cacheData.value);
        } else {
          requestFunc.apply(null, varArgs).then(function(value) {
              self.port.emit("set-" + valueName, { args: varArgs, value: value || null });
              resolve(value);
            },
            reject);
        }
      });
      self.port.emit("get-" + valueName, [id1, id2]);
    });
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Comm = {
    getGamePlain: makeCachedRequest.bind(null, GameDeals.Itad.getGamePlain, "plain"),
    getStoreLink: makeCachedRequest.bind(null, GameDeals.Itad.getStoreLink, "store-link"),
    getBestDeals: GameDeals.Itad.getBestDeals,
    showPageAction: function() { } // stub
  };
})();

