//     This file is part of Game Deals extension for Google Chrome
//     https://github.com/DanielKamkha/GameDealsChrome
//     (c) 2015 Daniel Kamkha
//     Game Deals is free software distributed under the terms of the MIT license.

(function() {
  "use strict";

  function makeCachedRequest(methodName, cache) {
    let varArgs = Array.prototype.slice.call(arguments, 2);
    return new Promise(function (resolve, reject) {
      chrome.runtime.sendMessage(
        { methodName: methodName, cache: cache, args: varArgs },
        function(data) {
          if (data.value) {
            resolve(data.value);
          } else {
            reject(data.response);
          }
        }
      );
    });
  }

  window.GameDeals = window.GameDeals || {};
  window.GameDeals.Comm = {
    getGamePlain: makeCachedRequest.bind(null, "getGamePlain", true),
    getStoreLink: makeCachedRequest.bind(null, "getStoreLink", true),
    getBestDeals: makeCachedRequest.bind(null, "getBestDeals", false)
  };
})();

